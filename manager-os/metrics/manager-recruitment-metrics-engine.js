const {
  CANDIDATE_MANAGER_SNAPSHOT_STATUSES
} = require("../recruitment/snapshots/candidate-manager-snapshot-engine");

const MANAGER_RECRUITMENT_METRICS_STATUSES = Object.freeze({
  READY_FOR_MANAGER_REVIEW: "READY_FOR_MANAGER_REVIEW",
  NEEDS_EVIDENCE: "NEEDS_EVIDENCE",
  NEEDS_SOURCE_OWNER: "NEEDS_SOURCE_OWNER",
  NEEDS_FRESHNESS: "NEEDS_FRESHNESS",
  NEEDS_HUMAN_REVIEW: "NEEDS_HUMAN_REVIEW",
  BLOCKED: "BLOCKED",
  UNKNOWN: "UNKNOWN",
  NOT_MODELED: "NOT_MODELED"
});

const MANAGER_RECRUITMENT_METRICS_DECISIONS = Object.freeze({
  USE_AS_MANAGER_REVIEW_CONTEXT: "USE_AS_MANAGER_REVIEW_CONTEXT",
  COLLECT_METRIC_EVIDENCE: "COLLECT_METRIC_EVIDENCE",
  COLLECT_SOURCE_OWNER: "COLLECT_SOURCE_OWNER",
  REFRESH_METRIC_CONTEXT: "REFRESH_METRIC_CONTEXT",
  REQUIRE_HUMAN_REVIEW: "REQUIRE_HUMAN_REVIEW",
  BLOCK_FORBIDDEN_USE: "BLOCK_FORBIDDEN_USE"
});

const ALLOWED_USES = Object.freeze([
  "MANAGER_REVIEW",
  "TEAM_PATTERN_CONTEXT",
  "COACHING_CONTEXT",
  "FORECAST_CONTEXT",
  "HISTORICAL_ANALYTICS_CONTEXT",
  "DASHBOARD_CONTEXT",
  "CONVERSATION_CONTEXT"
]);

const FORBIDDEN_USES = Object.freeze([
  "HUMAN_RANKING",
  "PROMOTION_DECISION",
  "PUNISHMENT",
  "TERMINATION",
  "COMPENSATION",
  "PAYOUT",
  "REVENUE_TRUTH",
  "ADVISOR_LIFECYCLE_TRUTH",
  "AUTOMATIC_DECISION",
  "PRECONTRACT_TRUTH",
  "HIRING_TRUTH"
]);

const EVENT_TYPES = Object.freeze({
  NAME_ADDED: "NAME_ADDED",
  CONTACT_ATTEMPTED: "CONTACT_ATTEMPTED",
  CONTACT_CONNECTED: "CONTACT_CONNECTED",
  INITIAL_INTERVIEW_SCHEDULED: "INITIAL_INTERVIEW_SCHEDULED",
  INITIAL_INTERVIEW_COMPLETED: "INITIAL_INTERVIEW_COMPLETED",
  SELECTION_INTERVIEW_SCHEDULED: "SELECTION_INTERVIEW_SCHEDULED",
  SELECTION_INTERVIEW_COMPLETED: "SELECTION_INTERVIEW_COMPLETED",
  CAREER_INTERVIEW_SCHEDULED: "CAREER_INTERVIEW_SCHEDULED",
  CAREER_INTERVIEW_COMPLETED: "CAREER_INTERVIEW_COMPLETED",
  ADDITIONAL_INTERVIEW_SCHEDULED: "ADDITIONAL_INTERVIEW_SCHEDULED",
  ADDITIONAL_INTERVIEW_COMPLETED: "ADDITIONAL_INTERVIEW_COMPLETED",
  MANAGER_REVIEW_STARTED: "MANAGER_REVIEW_STARTED",
  READY_FOR_PRECONTRACT_REVIEW: "READY_FOR_PRECONTRACT_REVIEW",
  PRECONTRACT_DOCS_REQUESTED: "PRECONTRACT_DOCS_REQUESTED",
  PRECONTRACT_DOCS_RECEIVED: "PRECONTRACT_DOCS_RECEIVED",
  CANDIDATE_WITHDRAWN: "CANDIDATE_WITHDRAWN",
  CANDIDATE_REACTIVATED: "CANDIDATE_REACTIVATED",
  CANDIDATE_BLOCKED: "CANDIDATE_BLOCKED",
  CANDIDATE_REENTRY_REVIEW: "CANDIDATE_REENTRY_REVIEW"
});

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
  const stale =
    status === "STALE" ||
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

function truthFlags() {
  return {
    automaticDecisionAllowed: false,
    createsPrecontractTruth: false,
    createsHiringTruth: false,
    createsAdvisorLifecycleTruth: false,
    createsRevenueTruth: false,
    createsCompensationTruth: false,
    createsRevenue: false,
    createsCompensation: false,
    createsPayoutTruth: false,
    createsHumanRankingTruth: false,
    createsPromotionDecisionTruth: false
  };
}

function eventTypeOf(event) {
  return normalizeText(event && (event.normalizedEventType || event.eventType || event.eventTypeContext));
}

function snapshotHasEvidence(snapshot) {
  return asArray(snapshot.evidenceRefs).length > 0 ||
    asArray(snapshot.sourceEvidenceIds).length > 0;
}

function countEvents(snapshots, eventType) {
  return snapshots.reduce((total, snapshot) => {
    const events = asArray(snapshot.eventTimeline);
    return total + events.filter((event) => eventTypeOf(event) === eventType).length;
  }, 0);
}

function countSnapshotsByStage(snapshots, stage) {
  return snapshots.filter((snapshot) => normalizeText(snapshot.currentStage) === stage).length;
}

function rateContext(numerator, denominator, assumption) {
  return {
    numerator,
    denominator,
    value: denominator > 0 ? numerator / denominator : null,
    assumption,
    referenceOnly: true,
    createsTruth: false
  };
}

function buildRecruitmentMetrics(snapshots) {
  const hasSnapshots = snapshots.length > 0;
  const total = hasSnapshots ? snapshots.length : null;
  const namesAdded = hasSnapshots ? countEvents(snapshots, EVENT_TYPES.NAME_ADDED) : null;
  const contactedCandidates = hasSnapshots ? countEvents(snapshots, EVENT_TYPES.CONTACT_ATTEMPTED) : null;
  const connectedCandidates = hasSnapshots ? countEvents(snapshots, EVENT_TYPES.CONTACT_CONNECTED) : null;
  const initialInterviewsScheduled = hasSnapshots ? countEvents(snapshots, EVENT_TYPES.INITIAL_INTERVIEW_SCHEDULED) : null;
  const initialInterviewsCompleted = hasSnapshots ? countEvents(snapshots, EVENT_TYPES.INITIAL_INTERVIEW_COMPLETED) : null;
  const selectionInterviewsScheduled = hasSnapshots ? countEvents(snapshots, EVENT_TYPES.SELECTION_INTERVIEW_SCHEDULED) : null;
  const selectionInterviewsCompleted = hasSnapshots ? countEvents(snapshots, EVENT_TYPES.SELECTION_INTERVIEW_COMPLETED) : null;
  const careerInterviewsScheduled = hasSnapshots ? countEvents(snapshots, EVENT_TYPES.CAREER_INTERVIEW_SCHEDULED) : null;
  const careerInterviewsCompleted = hasSnapshots ? countEvents(snapshots, EVENT_TYPES.CAREER_INTERVIEW_COMPLETED) : null;
  const additionalInterviewsScheduled = hasSnapshots ? countEvents(snapshots, EVENT_TYPES.ADDITIONAL_INTERVIEW_SCHEDULED) : null;
  const additionalInterviewsCompleted = hasSnapshots ? countEvents(snapshots, EVENT_TYPES.ADDITIONAL_INTERVIEW_COMPLETED) : null;

  return {
    totalCandidateSnapshots: total,
    namesAdded,
    contactedCandidates,
    connectedCandidates,
    initialInterviewsScheduled,
    initialInterviewsCompleted,
    selectionInterviewsScheduled,
    selectionInterviewsCompleted,
    careerInterviewsScheduled,
    careerInterviewsCompleted,
    additionalInterviewsScheduled,
    additionalInterviewsCompleted,
    candidatesInManagerReview: hasSnapshots ? countEvents(snapshots, EVENT_TYPES.MANAGER_REVIEW_STARTED) + countSnapshotsByStage(snapshots, "MANAGER_REVIEW") : null,
    readyForPrecontractReviewCount: hasSnapshots ? countEvents(snapshots, EVENT_TYPES.READY_FOR_PRECONTRACT_REVIEW) + countSnapshotsByStage(snapshots, "READY_FOR_PRECONTRACT_REVIEW") : null,
    precontractDocsRequested: hasSnapshots ? countEvents(snapshots, EVENT_TYPES.PRECONTRACT_DOCS_REQUESTED) : null,
    precontractDocsReceived: hasSnapshots ? countEvents(snapshots, EVENT_TYPES.PRECONTRACT_DOCS_RECEIVED) : null,
    withdrawnCandidates: hasSnapshots ? countEvents(snapshots, EVENT_TYPES.CANDIDATE_WITHDRAWN) : null,
    reactivatedCandidates: hasSnapshots ? countEvents(snapshots, EVENT_TYPES.CANDIDATE_REACTIVATED) : null,
    blockedCandidates: hasSnapshots ? countEvents(snapshots, EVENT_TYPES.CANDIDATE_BLOCKED) : null,
    reentryReviewCandidates: hasSnapshots ? countEvents(snapshots, EVENT_TYPES.CANDIDATE_REENTRY_REVIEW) : null,
    stageConversionRates: {
      contactToInitialInterview: rateContext(initialInterviewsCompleted, connectedCandidates, "completed initial interviews divided by connected candidates"),
      initialToSelectionInterview: rateContext(selectionInterviewsCompleted, initialInterviewsCompleted, "completed selection interviews divided by completed initial interviews"),
      selectionToCareerInterview: rateContext(careerInterviewsCompleted, selectionInterviewsCompleted, "completed career interviews divided by completed selection interviews"),
      careerToPrecontractReview: rateContext(countEvents(snapshots, EVENT_TYPES.READY_FOR_PRECONTRACT_REVIEW), careerInterviewsCompleted, "ready for precontract review events divided by completed career interviews")
    },
    interviewCompletionRates: {
      initial: rateContext(initialInterviewsCompleted, initialInterviewsScheduled, "initial completed divided by initial scheduled"),
      selection: rateContext(selectionInterviewsCompleted, selectionInterviewsScheduled, "selection completed divided by selection scheduled"),
      career: rateContext(careerInterviewsCompleted, careerInterviewsScheduled, "career completed divided by career scheduled"),
      additional: rateContext(additionalInterviewsCompleted, additionalInterviewsScheduled, "additional completed divided by additional scheduled")
    },
    pipelineVelocityContext: {
      eventCount: hasSnapshots ? snapshots.reduce((totalEvents, snapshot) => totalEvents + asArray(snapshot.eventTimeline).length, 0) : null,
      snapshotCount: total,
      referenceOnly: true,
      createsTruth: false
    },
    referenceOnly: true,
    createsTruth: false
  };
}

function resolveStatus({
  blockedUses,
  snapshots,
  evidenceRefs,
  sourceEvidenceIds,
  sourceOwners,
  directEvidenceRefs,
  directSourceEvidenceIds,
  directSourceOwners,
  directFreshness,
  freshness,
  humanReviewRequired
}) {
  if (blockedUses.length > 0) return MANAGER_RECRUITMENT_METRICS_STATUSES.BLOCKED;
  if (snapshots.length === 0) return MANAGER_RECRUITMENT_METRICS_STATUSES.UNKNOWN;
  if (directEvidenceRefs.length === 0 && directSourceEvidenceIds.length === 0) return MANAGER_RECRUITMENT_METRICS_STATUSES.NEEDS_EVIDENCE;
  if (directSourceOwners.length === 0) return MANAGER_RECRUITMENT_METRICS_STATUSES.NEEDS_SOURCE_OWNER;
  if (!directFreshness.available || directFreshness.stale) return MANAGER_RECRUITMENT_METRICS_STATUSES.NEEDS_FRESHNESS;
  if (evidenceRefs.length === 0 && sourceEvidenceIds.length === 0) return MANAGER_RECRUITMENT_METRICS_STATUSES.NEEDS_EVIDENCE;
  if (sourceOwners.length === 0) return MANAGER_RECRUITMENT_METRICS_STATUSES.NEEDS_SOURCE_OWNER;
  if (!freshness.available || freshness.stale) return MANAGER_RECRUITMENT_METRICS_STATUSES.NEEDS_FRESHNESS;
  if (humanReviewRequired) return MANAGER_RECRUITMENT_METRICS_STATUSES.NEEDS_HUMAN_REVIEW;
  return MANAGER_RECRUITMENT_METRICS_STATUSES.READY_FOR_MANAGER_REVIEW;
}

function calculateManagerRecruitmentMetrics({
  candidateManagerSnapshots = [],
  period = null,
  sourceEvidence = {},
  requestedUse = null,
  generatedAt = null
} = {}) {
  const snapshots = asArray(candidateManagerSnapshots).map((snapshot) => clone(snapshot));
  const evidenceRefs = collectEvidenceRefs({ sourceEvidence, values: snapshots });
  const sourceEvidenceIds = collectSourceEvidenceIds({ sourceEvidence, values: snapshots });
  const sourceOwners = collectSourceOwners({ sourceEvidence, values: snapshots });
  const directEvidenceRefs = collectEvidenceRefs({ sourceEvidence, values: [] });
  const directSourceEvidenceIds = collectSourceEvidenceIds({ sourceEvidence, values: [] });
  const directSourceOwners = collectSourceOwners({ sourceEvidence, values: [] });
  const freshness = resolveFreshness({ sourceEvidence, values: snapshots });
  const directFreshness = resolveFreshness({ sourceEvidence, values: [] });
  const use = resolveUse(requestedUse);
  const missingEvidence = [];
  const unknownSignals = [];
  const staleSignals = [];
  const defaultZeroRisks = unique(snapshots.flatMap((snapshot) => asArray(snapshot.defaultZeroRisks)));
  const confidenceLimitations = [];
  const warnings = [];

  if (snapshots.length === 0) {
    unknownSignals.push("candidate_manager_snapshots_missing");
    warnings.push("CandidateManagerSnapshot inputs are missing; missing snapshots do not become zero pipeline.");
  }

  snapshots.forEach((snapshot) => {
    if (!Array.isArray(snapshot.eventTimeline)) {
      unknownSignals.push("candidate_snapshot_event_timeline_missing");
      warnings.push("Candidate snapshot eventTimeline is missing; unknown is not zero.");
    } else if (snapshot.eventTimeline.length === 0 && !snapshotHasEvidence(snapshot)) {
      unknownSignals.push("candidate_snapshot_empty_event_timeline_without_evidence");
      warnings.push("Empty event history without evidence cannot be treated as zero pipeline.");
    }

    if (snapshot.currentStage === "READY_FOR_PRECONTRACT_REVIEW" || snapshot.precontractReadinessContext && snapshot.precontractReadinessContext.readyForPrecontractReview === true) {
      warnings.push("READY_FOR_PRECONTRACT_REVIEW is precontract review context only and does not create precontract truth.");
    }
    if (snapshot.withdrawalRiskContext && snapshot.withdrawalRiskContext.active === true) {
      warnings.push("Withdrawn candidate context is not rejection truth.");
    }
    if (snapshot.blockedContext && snapshot.blockedContext.active === true) {
      warnings.push("Blocked candidate context is not punishment truth.");
    }
    if (snapshot.reentryContext && snapshot.reentryContext.active === true) {
      warnings.push("Reentry/reactivation context is not automatic approval truth.");
    }
  });

  if (directEvidenceRefs.length === 0 && directSourceEvidenceIds.length === 0) {
    missingEvidence.push("manager_recruitment_metrics_evidence_missing");
    confidenceLimitations.push("missing_recruitment_metrics_evidence");
  }
  if (directSourceOwners.length === 0) {
    missingEvidence.push("manager_recruitment_metrics_source_owner_missing");
    confidenceLimitations.push("missing_recruitment_metrics_source_owner");
  }
  if (!directFreshness.available) {
    staleSignals.push("manager_recruitment_metrics_freshness_missing");
    confidenceLimitations.push("missing_recruitment_metrics_freshness");
  }
  if (directFreshness.stale) {
    staleSignals.push("manager_recruitment_metrics_freshness_stale");
    confidenceLimitations.push("stale_recruitment_metrics_freshness");
  }

  use.blockedUses.forEach((blockedUse) => warnings.push(`${blockedUse} use is blocked for recruitment metrics.`));

  const assumptions = [
    "Recruitment metrics count protected CandidateManagerSnapshot context only.",
    "Conversion rates are manager review context only and are not hiring or precontract truth."
  ];
  const managerReviewRequired =
    use.blockedUses.length > 0 ||
    snapshots.length === 0 ||
    missingEvidence.length > 0 ||
    unknownSignals.length > 0 ||
    staleSignals.length > 0 ||
    defaultZeroRisks.length > 0 ||
    snapshots.some((snapshot) => snapshot.managerReviewRequired === true || snapshot.humanReviewRequired === true);
  const humanReviewRequired = managerReviewRequired;
  const metricsStatus = resolveStatus({
    blockedUses: use.blockedUses,
    snapshots,
    evidenceRefs,
    sourceEvidenceIds,
    sourceOwners,
    directEvidenceRefs,
    directSourceEvidenceIds,
    directSourceOwners,
    directFreshness,
    freshness,
    humanReviewRequired
  });

  return {
    metricsStatus,
    period: period || sourceEvidence.period || null,
    generatedAt: generatedAt || sourceEvidence.generatedAt || sourceEvidence.capturedAt || null,
    recruitmentMetrics: buildRecruitmentMetrics(snapshots),
    missingEvidence: unique(missingEvidence),
    unknownSignals: unique(unknownSignals),
    staleSignals: unique(staleSignals),
    defaultZeroRisks,
    evidenceRefs,
    sourceEvidenceIds,
    sourceOwners,
    freshness: freshness.value,
    assumptions: unique(assumptions),
    confidenceLimitations: unique(confidenceLimitations),
    warnings: unique([
      ...warnings,
      "Recruitment metrics are manager review context only and do not create precontract, hiring, lifecycle, revenue, compensation, payout, ranking, promotion, punishment, termination or automatic decision truth."
    ]),
    managerReviewRequired,
    humanReviewRequired,
    allowedUses: unique(use.allowedUses),
    blockedUses: unique(use.blockedUses),
    ...truthFlags()
  };
}

module.exports = {
  calculateManagerRecruitmentMetrics,
  MANAGER_RECRUITMENT_METRICS_STATUSES,
  MANAGER_RECRUITMENT_METRICS_DECISIONS
};
