const {
  MANAGER_RECRUITMENT_EVENT_TYPES
} = require("../events/manager-recruitment-event-capture-contract");

const CANDIDATE_MANAGER_SNAPSHOT_STATUSES = Object.freeze({
  READY_FOR_MANAGER_REVIEW: "READY_FOR_MANAGER_REVIEW",
  NEEDS_EVIDENCE: "NEEDS_EVIDENCE",
  NEEDS_SOURCE_OWNER: "NEEDS_SOURCE_OWNER",
  NEEDS_FRESHNESS: "NEEDS_FRESHNESS",
  NEEDS_HUMAN_REVIEW: "NEEDS_HUMAN_REVIEW",
  BLOCKED: "BLOCKED",
  UNKNOWN: "UNKNOWN",
  NOT_MODELED: "NOT_MODELED"
});

const CANDIDATE_MANAGER_SNAPSHOT_DECISIONS = Object.freeze({
  BUILD_MANAGER_REVIEW_SNAPSHOT: "BUILD_MANAGER_REVIEW_SNAPSHOT",
  COLLECT_SNAPSHOT_EVIDENCE: "COLLECT_SNAPSHOT_EVIDENCE",
  COLLECT_SOURCE_OWNER: "COLLECT_SOURCE_OWNER",
  REFRESH_SNAPSHOT_CONTEXT: "REFRESH_SNAPSHOT_CONTEXT",
  REQUIRE_HUMAN_REVIEW: "REQUIRE_HUMAN_REVIEW",
  BLOCK_FORBIDDEN_USE: "BLOCK_FORBIDDEN_USE"
});

const ALLOWED_USES = Object.freeze([
  "MANAGER_REVIEW",
  "RECRUITMENT_PIPELINE_CONTEXT",
  "CANDIDATE_TIMELINE_CONTEXT",
  "INTERVIEW_CONTEXT",
  "PRECONTRACT_REVIEW_CONTEXT",
  "CONVERSATION_CONTEXT",
  "METRICS_CONTEXT",
  "FORECAST_CONTEXT",
  "DASHBOARD_CONTEXT"
]);

const FORBIDDEN_USES = Object.freeze([
  "AUTOMATIC_APPROVAL",
  "AUTOMATIC_REJECTION",
  "PRECONTRACT_TRUTH",
  "ADVISOR_LIFECYCLE_TRUTH",
  "HUMAN_RANKING",
  "PROMOTION_DECISION",
  "PUNISHMENT",
  "TERMINATION",
  "COMPENSATION",
  "PAYOUT",
  "REVENUE_TRUTH"
]);

function present(value) {
  return value !== undefined && value !== null && value !== "";
}

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function asArray(value) {
  if (!present(value)) return [];
  return Array.isArray(value) ? value.filter(present) : [value].filter(present);
}

function unique(values) {
  return [...new Set(values.filter(present))];
}

function normalizeText(value) {
  return present(value) ? String(value).trim().toUpperCase() : null;
}

function clone(value) {
  if (!present(value)) return value;
  return JSON.parse(JSON.stringify(value));
}

function collectFromValue(value, field) {
  if (!present(value)) return [];
  if (Array.isArray(value)) return value.flatMap((item) => collectFromValue(item, field));
  if (!isObject(value)) return [];

  return [
    ...asArray(value[field]),
    ...Object.values(value).flatMap((entry) => collectFromValue(entry, field))
  ];
}

function collectEvidenceRefs({ sourceEvidence = {}, values = [] } = {}) {
  return unique([
    ...asArray(sourceEvidence.evidenceRefs),
    ...asArray(sourceEvidence.evidenceRef),
    ...values.flatMap((value) => collectFromValue(value, "evidenceRefs")),
    ...values.flatMap((value) => collectFromValue(value, "evidenceRef"))
  ]);
}

function collectSourceEvidenceIds({ sourceEvidence = {}, values = [] } = {}) {
  return unique([
    ...asArray(sourceEvidence.sourceEvidenceIds),
    ...asArray(sourceEvidence.sourceEvidenceId),
    ...values.flatMap((value) => collectFromValue(value, "sourceEvidenceIds")),
    ...values.flatMap((value) => collectFromValue(value, "sourceEvidenceId"))
  ]);
}

function collectSourceOwners({ sourceEvidence = {}, values = [] } = {}) {
  return unique([
    ...asArray(sourceEvidence.sourceOwners),
    ...asArray(sourceEvidence.sourceOwner),
    ...values.flatMap((value) => collectFromValue(value, "sourceOwners")),
    ...values.flatMap((value) => collectFromValue(value, "sourceOwner"))
  ]);
}

function resolveFreshness({ sourceEvidence = {}, values = [] } = {}) {
  const candidates = unique([
    sourceEvidence.freshness,
    sourceEvidence.freshnessStatus,
    sourceEvidence.generatedAt,
    sourceEvidence.capturedAt,
    sourceEvidence.updatedAt,
    ...values.flatMap((value) => collectFromValue(value, "freshness")),
    ...values.flatMap((value) => collectFromValue(value, "freshnessStatus")),
    ...values.flatMap((value) => collectFromValue(value, "generatedAt")),
    ...values.flatMap((value) => collectFromValue(value, "capturedAt")),
    ...values.flatMap((value) => collectFromValue(value, "updatedAt"))
  ]);
  const explicitFreshness = sourceEvidence.freshness;
  const status = normalizeText(
    isObject(explicitFreshness)
      ? explicitFreshness.status
      : explicitFreshness || sourceEvidence.freshnessStatus
  );
  const stale = status === "STALE" ||
    status === "EXPIRED" ||
    sourceEvidence.isFresh === false ||
    values.some((value) => isObject(value) && value.stale === true);

  return {
    value: explicitFreshness || sourceEvidence.freshnessStatus || candidates[0] || null,
    available: candidates.length > 0,
    stale
  };
}

function resolveUse(requestedUse) {
  const normalized = normalizeText(requestedUse);
  if (!normalized) return { allowedUses: ["MANAGER_REVIEW"], blockedUses: [] };
  if (FORBIDDEN_USES.includes(normalized)) return { allowedUses: [], blockedUses: [normalized] };
  if (ALLOWED_USES.includes(normalized)) return { allowedUses: [normalized], blockedUses: [] };
  return { allowedUses: [], blockedUses: [normalized] };
}

function eventTypeOf(event) {
  return event && (event.normalizedEventType || event.eventType);
}

function eventTimeOf(event) {
  return event && (event.occurredAt || event.createdAt || event.capturedAt || null);
}

function sortEvents(recruitmentEvents = []) {
  return asArray(recruitmentEvents)
    .map((event) => clone(event))
    .sort((a, b) => {
      const left = Date.parse(eventTimeOf(a) || "") || 0;
      const right = Date.parse(eventTimeOf(b) || "") || 0;
      return left - right;
    });
}

function buildStageHistory(eventTimeline = []) {
  return eventTimeline
    .filter((event) => present(eventTypeOf(event)))
    .map((event) => ({
      eventType: eventTypeOf(event),
      occurredAt: eventTimeOf(event),
      referenceOnly: true,
      createsTruth: false
    }));
}

function buildInterviewHistory(eventTimeline = []) {
  return eventTimeline
    .filter((event) => String(eventTypeOf(event) || "").includes("INTERVIEW"))
    .map((event) => ({
      eventType: eventTypeOf(event),
      occurredAt: eventTimeOf(event),
      referenceOnly: true,
      createsTruth: false
    }));
}

function latestEventOf(eventTimeline = [], types = []) {
  const typeSet = new Set(types);
  return [...eventTimeline].reverse().find((event) => typeSet.has(eventTypeOf(event))) || null;
}

function boundaryFlags() {
  return {
    automaticDecisionAllowed: false,
    createsAutomaticApprovalTruth: false,
    createsAutomaticRejectionTruth: false,
    createsPrecontractTruth: false,
    createsAdvisorLifecycleTruth: false,
    createsHumanRankingTruth: false,
    createsPromotionDecisionTruth: false,
    createsRevenue: false,
    createsCompensation: false,
    createsPayoutTruth: false
  };
}

function resolveSnapshotStatus({
  blockedUses,
  eventTimeline,
  evidenceRefs,
  sourceEvidenceIds,
  sourceOwners,
  directEvidenceRefs,
  directSourceEvidenceIds,
  directSourceOwners,
  freshness,
  humanReviewRequired
}) {
  if (blockedUses.length > 0) return CANDIDATE_MANAGER_SNAPSHOT_STATUSES.BLOCKED;
  if (eventTimeline.length === 0) return CANDIDATE_MANAGER_SNAPSHOT_STATUSES.UNKNOWN;
  if (directEvidenceRefs.length === 0 && directSourceEvidenceIds.length === 0) return CANDIDATE_MANAGER_SNAPSHOT_STATUSES.NEEDS_EVIDENCE;
  if (directSourceOwners.length === 0) return CANDIDATE_MANAGER_SNAPSHOT_STATUSES.NEEDS_SOURCE_OWNER;
  if (evidenceRefs.length === 0 && sourceEvidenceIds.length === 0) return CANDIDATE_MANAGER_SNAPSHOT_STATUSES.NEEDS_EVIDENCE;
  if (sourceOwners.length === 0) return CANDIDATE_MANAGER_SNAPSHOT_STATUSES.NEEDS_SOURCE_OWNER;
  if (!freshness.available || freshness.stale) return CANDIDATE_MANAGER_SNAPSHOT_STATUSES.NEEDS_FRESHNESS;
  if (humanReviewRequired) return CANDIDATE_MANAGER_SNAPSHOT_STATUSES.NEEDS_HUMAN_REVIEW;
  return CANDIDATE_MANAGER_SNAPSHOT_STATUSES.READY_FOR_MANAGER_REVIEW;
}

function buildCandidateManagerSnapshot({
  candidate = {},
  recruit = {},
  application = {},
  recruitmentEvents = [],
  recruitmentPipeline = {},
  interviewFlow = {},
  candidateAssessment = {},
  precontractGate = {},
  rdaPrerequisite = {},
  manager = {},
  period = null,
  sourceEvidence = {},
  requestedUse = null
} = {}) {
  const eventTimeline = sortEvents(recruitmentEvents);
  const stageHistory = buildStageHistory(eventTimeline);
  const interviewHistory = buildInterviewHistory(eventTimeline);
  const latestEvent = eventTimeline[eventTimeline.length - 1] || null;
  const previousEvent = eventTimeline.length > 1 ? eventTimeline[eventTimeline.length - 2] : null;
  const values = [
    candidate,
    recruit,
    application,
    recruitmentPipeline,
    interviewFlow,
    candidateAssessment,
    precontractGate,
    rdaPrerequisite,
    manager,
    eventTimeline
  ].filter(present);
  const evidenceRefs = collectEvidenceRefs({ sourceEvidence, values });
  const sourceEvidenceIds = collectSourceEvidenceIds({ sourceEvidence, values });
  const sourceOwners = collectSourceOwners({ sourceEvidence, values });
  const directEvidenceRefs = collectEvidenceRefs({ sourceEvidence, values: [] });
  const directSourceEvidenceIds = collectSourceEvidenceIds({ sourceEvidence, values: [] });
  const directSourceOwners = collectSourceOwners({ sourceEvidence, values: [] });
  const freshness = resolveFreshness({ sourceEvidence, values });
  const use = resolveUse(requestedUse);
  const missingEvidence = [];
  const unknownSignals = [];
  const staleSignals = [];
  const confidenceLimitations = [];
  const warnings = [];

  if (eventTimeline.length === 0) {
    missingEvidence.push("candidate_manager_snapshot_event_history_missing");
    unknownSignals.push("candidate_manager_snapshot_stage_history_unknown");
    warnings.push("Candidate manager snapshot event history is missing; unknown is not zero.");
  }

  if (directEvidenceRefs.length === 0 && directSourceEvidenceIds.length === 0) {
    missingEvidence.push("candidate_manager_snapshot_evidence_missing");
    confidenceLimitations.push("missing_snapshot_evidence");
    warnings.push("Candidate manager snapshot evidence is missing; snapshot remains review context only.");
  }

  if (directSourceOwners.length === 0) {
    missingEvidence.push("candidate_manager_snapshot_source_owner_missing");
    confidenceLimitations.push("missing_snapshot_source_owner");
    warnings.push("Candidate manager snapshot source owner is missing.");
  }

  if (!freshness.available) {
    staleSignals.push("candidate_manager_snapshot_freshness_missing");
    confidenceLimitations.push("missing_snapshot_freshness");
    warnings.push("Candidate manager snapshot freshness is missing.");
  }

  if (freshness.stale) {
    staleSignals.push("candidate_manager_snapshot_freshness_stale");
    confidenceLimitations.push("stale_snapshot_freshness");
    warnings.push("Candidate manager snapshot freshness is stale.");
  }

  if (precontractGate.readyForPrecontractReview === true || precontractGate.precontractReviewPacketReady === true) {
    warnings.push("Precontract readiness context is review context only and does not create precontract truth.");
  }

  if (candidateAssessment.recommendation) {
    warnings.push("Candidate assessment recommendation is decision support only and not automatic approval or rejection.");
  }

  if (latestEventOf(eventTimeline, [MANAGER_RECRUITMENT_EVENT_TYPES.CANDIDATE_WITHDRAWN])) {
    warnings.push("Withdrawn candidate context is review context only and not automatic rejection truth.");
  }

  if (latestEventOf(eventTimeline, [MANAGER_RECRUITMENT_EVENT_TYPES.CANDIDATE_BLOCKED, MANAGER_RECRUITMENT_EVENT_TYPES.PRECONTRACT_REVIEW_BLOCKED])) {
    warnings.push("Blocked candidate context is review context only and not punishment truth.");
  }

  if (latestEventOf(eventTimeline, [MANAGER_RECRUITMENT_EVENT_TYPES.CANDIDATE_REACTIVATED, MANAGER_RECRUITMENT_EVENT_TYPES.CANDIDATE_REENTRY_REVIEW])) {
    warnings.push("Reentry/reactivation context is review context only and not automatic approval truth.");
  }

  use.blockedUses.forEach((blockedUse) => {
    warnings.push(`${blockedUse} use is blocked for CandidateManagerSnapshot.`);
  });

  const managerReviewRequired = use.blockedUses.length > 0 ||
    missingEvidence.length > 0 ||
    unknownSignals.length > 0 ||
    staleSignals.length > 0 ||
    recruitmentPipeline.humanReviewRequired === true ||
    interviewFlow.humanReviewRequired === true ||
    precontractGate.humanReviewRequired === true ||
    rdaPrerequisite.humanReviewRequired === true;
  const humanReviewRequired = managerReviewRequired;
  const snapshotStatus = resolveSnapshotStatus({
    blockedUses: use.blockedUses,
    eventTimeline,
    evidenceRefs,
    sourceEvidenceIds,
    sourceOwners,
    directEvidenceRefs,
    directSourceEvidenceIds,
    directSourceOwners,
    freshness,
    humanReviewRequired
  });

  return {
    snapshotStatus,
    candidateId: candidate.candidateId || null,
    recruitIdentityId: recruit.recruitIdentityId || null,
    applicationId: application.applicationId || null,
    managerId: manager.managerId || manager.id || null,
    period: period || sourceEvidence.period || null,
    currentStage: latestEvent ? eventTypeOf(latestEvent) : (recruitmentPipeline.normalizedPipelineState || "UNKNOWN"),
    previousStage: previousEvent ? eventTypeOf(previousEvent) : "UNKNOWN",
    stageHistory,
    interviewHistory,
    eventTimeline,
    nextStep: recruitmentPipeline.nextRecommendedState || interviewFlow.nextRecommendedStage || precontractGate.nextRecommendedAction || null,
    lastStageChange: latestEvent ? eventTimeOf(latestEvent) : null,
    lastContactAt: eventTimeOf(latestEventOf(eventTimeline, [
      MANAGER_RECRUITMENT_EVENT_TYPES.CONTACT_ATTEMPTED,
      MANAGER_RECRUITMENT_EVENT_TYPES.CONTACT_CONNECTED
    ])),
    lastManagerAction: eventTypeOf(latestEventOf(eventTimeline, [
      MANAGER_RECRUITMENT_EVENT_TYPES.MANAGER_REVIEW_STARTED,
      MANAGER_RECRUITMENT_EVENT_TYPES.READY_FOR_PRECONTRACT_REVIEW,
      MANAGER_RECRUITMENT_EVENT_TYPES.PRECONTRACT_REVIEW_BLOCKED
    ])) || null,
    withdrawalRiskContext: {
      active: Boolean(latestEventOf(eventTimeline, [MANAGER_RECRUITMENT_EVENT_TYPES.CANDIDATE_WITHDRAWN])),
      referenceOnly: true,
      createsTruth: false
    },
    blockedContext: {
      active: Boolean(latestEventOf(eventTimeline, [
        MANAGER_RECRUITMENT_EVENT_TYPES.CANDIDATE_BLOCKED,
        MANAGER_RECRUITMENT_EVENT_TYPES.PRECONTRACT_REVIEW_BLOCKED
      ])),
      referenceOnly: true,
      createsTruth: false
    },
    reentryContext: {
      active: Boolean(latestEventOf(eventTimeline, [
        MANAGER_RECRUITMENT_EVENT_TYPES.CANDIDATE_REACTIVATED,
        MANAGER_RECRUITMENT_EVENT_TYPES.CANDIDATE_REENTRY_REVIEW
      ])),
      referenceOnly: true,
      createsTruth: false
    },
    precontractReadinessContext: {
      value: clone(precontractGate),
      readyForPrecontractReview: precontractGate.readyForPrecontractReview === true || precontractGate.precontractReviewPacketReady === true,
      referenceOnly: true,
      createsTruth: false
    },
    candidateAssessmentContext: {
      value: clone(candidateAssessment),
      recommendation: candidateAssessment.recommendation || null,
      referenceOnly: true,
      createsTruth: false
    },
    pipelineContext: {
      value: clone(recruitmentPipeline),
      referenceOnly: true,
      createsTruth: false
    },
    interviewContext: {
      value: clone(interviewFlow),
      referenceOnly: true,
      createsTruth: false
    },
    missingEvidence: unique(missingEvidence),
    unknownSignals: unique(unknownSignals),
    staleSignals: unique(staleSignals),
    evidenceRefs,
    sourceEvidenceIds,
    sourceOwners,
    freshness: freshness.value,
    confidenceLimitations: unique(confidenceLimitations),
    warnings: unique([
      ...warnings,
      "CandidateManagerSnapshot is manager review context only and does not create automatic approval, rejection, precontract, lifecycle, ranking, promotion, revenue, compensation or payout truth."
    ]),
    managerReviewRequired,
    humanReviewRequired,
    allowedUses: unique(use.allowedUses),
    blockedUses: unique(use.blockedUses),
    ...boundaryFlags()
  };
}

module.exports = {
  CANDIDATE_MANAGER_SNAPSHOT_DECISIONS,
  CANDIDATE_MANAGER_SNAPSHOT_STATUSES,
  buildCandidateManagerSnapshot
};
