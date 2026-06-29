const MANAGER_RECRUITMENT_EVENT_TYPES = Object.freeze({
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
  PRECONTRACT_REVIEW_BLOCKED: "PRECONTRACT_REVIEW_BLOCKED",
  CANDIDATE_WITHDRAWN: "CANDIDATE_WITHDRAWN",
  CANDIDATE_REACTIVATED: "CANDIDATE_REACTIVATED",
  CANDIDATE_BLOCKED: "CANDIDATE_BLOCKED",
  CANDIDATE_REENTRY_REVIEW: "CANDIDATE_REENTRY_REVIEW",
  UNKNOWN: "UNKNOWN",
  NOT_MODELED: "NOT_MODELED"
});

const MANAGER_RECRUITMENT_EVENT_CAPTURE_STATUSES = Object.freeze({
  CAPTURED_FOR_MANAGER_REVIEW: "CAPTURED_FOR_MANAGER_REVIEW",
  NEEDS_EVIDENCE: "NEEDS_EVIDENCE",
  NEEDS_SOURCE_OWNER: "NEEDS_SOURCE_OWNER",
  NEEDS_FRESHNESS: "NEEDS_FRESHNESS",
  NEEDS_HUMAN_REVIEW: "NEEDS_HUMAN_REVIEW",
  BLOCKED: "BLOCKED",
  UNKNOWN: "UNKNOWN",
  NOT_MODELED: "NOT_MODELED"
});

const MANAGER_RECRUITMENT_EVENT_CAPTURE_DECISIONS = Object.freeze({
  CAPTURE_AS_MANAGER_REVIEW_CONTEXT: "CAPTURE_AS_MANAGER_REVIEW_CONTEXT",
  COLLECT_EVENT_EVIDENCE: "COLLECT_EVENT_EVIDENCE",
  COLLECT_SOURCE_OWNER: "COLLECT_SOURCE_OWNER",
  REFRESH_EVENT_CONTEXT: "REFRESH_EVENT_CONTEXT",
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
  "METRICS_CONTEXT"
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

function collectEvidenceRefs({ sourceEvidence = {}, eventPayload = {} } = {}) {
  return unique([
    ...asArray(sourceEvidence.evidenceRefs),
    ...asArray(sourceEvidence.evidenceRef),
    ...collectFromValue(eventPayload, "evidenceRefs"),
    ...collectFromValue(eventPayload, "evidenceRef")
  ]);
}

function collectSourceEvidenceIds({ sourceEvidence = {}, eventPayload = {} } = {}) {
  return unique([
    ...asArray(sourceEvidence.sourceEvidenceIds),
    ...asArray(sourceEvidence.sourceEvidenceId),
    ...collectFromValue(eventPayload, "sourceEvidenceIds"),
    ...collectFromValue(eventPayload, "sourceEvidenceId")
  ]);
}

function collectSourceOwners({ sourceEvidence = {}, eventPayload = {} } = {}) {
  return unique([
    ...asArray(sourceEvidence.sourceOwners),
    ...asArray(sourceEvidence.sourceOwner),
    ...collectFromValue(eventPayload, "sourceOwners"),
    ...collectFromValue(eventPayload, "sourceOwner")
  ]);
}

function resolveFreshness({ sourceEvidence = {}, eventPayload = {} } = {}) {
  const candidates = unique([
    sourceEvidence.freshness,
    sourceEvidence.freshnessStatus,
    sourceEvidence.generatedAt,
    sourceEvidence.capturedAt,
    sourceEvidence.updatedAt,
    ...collectFromValue(eventPayload, "freshness"),
    ...collectFromValue(eventPayload, "freshnessStatus"),
    ...collectFromValue(eventPayload, "generatedAt"),
    ...collectFromValue(eventPayload, "capturedAt"),
    ...collectFromValue(eventPayload, "updatedAt")
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
    (isObject(eventPayload) && eventPayload.stale === true);

  return {
    value: explicitFreshness || sourceEvidence.freshnessStatus || candidates[0] || null,
    available: candidates.length > 0,
    stale
  };
}

function normalizeManagerRecruitmentEventType(eventType) {
  const normalized = normalizeText(eventType);
  if (!normalized) return MANAGER_RECRUITMENT_EVENT_TYPES.UNKNOWN;
  return MANAGER_RECRUITMENT_EVENT_TYPES[normalized] || MANAGER_RECRUITMENT_EVENT_TYPES.NOT_MODELED;
}

function resolveUse(requestedUse) {
  const normalized = normalizeText(requestedUse);
  if (!normalized) return { allowedUses: ["MANAGER_REVIEW"], blockedUses: [] };
  if (FORBIDDEN_USES.includes(normalized)) return { allowedUses: [], blockedUses: [normalized] };
  if (ALLOWED_USES.includes(normalized)) return { allowedUses: [normalized], blockedUses: [] };
  return { allowedUses: [], blockedUses: [normalized] };
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

function resolveCaptureStatus({
  normalizedEventType,
  blockedUses,
  evidenceRefs,
  sourceEvidenceIds,
  sourceOwners,
  freshness,
  humanReviewRequired
}) {
  if (blockedUses.length > 0) return MANAGER_RECRUITMENT_EVENT_CAPTURE_STATUSES.BLOCKED;
  if (normalizedEventType === MANAGER_RECRUITMENT_EVENT_TYPES.UNKNOWN) {
    return MANAGER_RECRUITMENT_EVENT_CAPTURE_STATUSES.UNKNOWN;
  }
  if (normalizedEventType === MANAGER_RECRUITMENT_EVENT_TYPES.NOT_MODELED) {
    return MANAGER_RECRUITMENT_EVENT_CAPTURE_STATUSES.NOT_MODELED;
  }
  if (evidenceRefs.length === 0 && sourceEvidenceIds.length === 0) {
    return MANAGER_RECRUITMENT_EVENT_CAPTURE_STATUSES.NEEDS_EVIDENCE;
  }
  if (sourceOwners.length === 0) return MANAGER_RECRUITMENT_EVENT_CAPTURE_STATUSES.NEEDS_SOURCE_OWNER;
  if (!freshness.available || freshness.stale) return MANAGER_RECRUITMENT_EVENT_CAPTURE_STATUSES.NEEDS_FRESHNESS;
  if (humanReviewRequired) return MANAGER_RECRUITMENT_EVENT_CAPTURE_STATUSES.NEEDS_HUMAN_REVIEW;
  return MANAGER_RECRUITMENT_EVENT_CAPTURE_STATUSES.CAPTURED_FOR_MANAGER_REVIEW;
}

function captureManagerRecruitmentEvent({
  eventType = null,
  candidateId = null,
  recruitIdentityId = null,
  applicationId = null,
  managerId = null,
  occurredAt = null,
  eventPayload = {},
  sourceEvidence = {},
  requestedUse = null
} = {}) {
  const normalizedEventType = normalizeManagerRecruitmentEventType(eventType);
  const use = resolveUse(requestedUse);
  const evidenceRefs = collectEvidenceRefs({ sourceEvidence, eventPayload });
  const sourceEvidenceIds = collectSourceEvidenceIds({ sourceEvidence, eventPayload });
  const sourceOwners = collectSourceOwners({ sourceEvidence, eventPayload });
  const freshness = resolveFreshness({ sourceEvidence, eventPayload });
  const missingEvidence = [];
  const unknownSignals = [];
  const staleSignals = [];
  const confidenceLimitations = [];
  const warnings = [];

  if (evidenceRefs.length === 0 && sourceEvidenceIds.length === 0) {
    missingEvidence.push("manager_recruitment_event_evidence_missing");
    confidenceLimitations.push("missing_event_evidence");
    warnings.push("Manager recruitment event evidence is missing; event remains review context only.");
  }

  if (sourceOwners.length === 0) {
    missingEvidence.push("manager_recruitment_event_source_owner_missing");
    confidenceLimitations.push("missing_event_source_owner");
    warnings.push("Manager recruitment event source owner is missing.");
  }

  if (!freshness.available) {
    staleSignals.push("manager_recruitment_event_freshness_missing");
    confidenceLimitations.push("missing_event_freshness");
    warnings.push("Manager recruitment event freshness is missing.");
  }

  if (freshness.stale) {
    staleSignals.push("manager_recruitment_event_freshness_stale");
    confidenceLimitations.push("stale_event_freshness");
    warnings.push("Manager recruitment event freshness is stale.");
  }

  if (normalizedEventType === MANAGER_RECRUITMENT_EVENT_TYPES.UNKNOWN) {
    unknownSignals.push("manager_recruitment_event_type_missing");
    warnings.push("Manager recruitment event type is missing; unknown is not zero.");
  }

  if (normalizedEventType === MANAGER_RECRUITMENT_EVENT_TYPES.NOT_MODELED) {
    unknownSignals.push("manager_recruitment_event_type_not_modeled");
    warnings.push("Manager recruitment event type is not modeled; do not infer pipeline truth.");
  }

  if (normalizedEventType === MANAGER_RECRUITMENT_EVENT_TYPES.READY_FOR_PRECONTRACT_REVIEW) {
    warnings.push("READY_FOR_PRECONTRACT_REVIEW event is precontract review context only and does not create precontract truth.");
  }

  if (normalizedEventType === MANAGER_RECRUITMENT_EVENT_TYPES.CANDIDATE_REACTIVATED) {
    warnings.push("CANDIDATE_REACTIVATED event is review context only and does not create automatic approval truth.");
  }

  if (normalizedEventType === MANAGER_RECRUITMENT_EVENT_TYPES.CANDIDATE_BLOCKED) {
    warnings.push("CANDIDATE_BLOCKED event is review context only and does not create punishment truth.");
  }

  use.blockedUses.forEach((blockedUse) => {
    warnings.push(`${blockedUse} use is blocked for Manager OS recruitment event capture.`);
  });

  const managerReviewRequired = use.blockedUses.length > 0 ||
    missingEvidence.length > 0 ||
    unknownSignals.length > 0 ||
    staleSignals.length > 0;
  const humanReviewRequired = managerReviewRequired;
  const captureStatus = resolveCaptureStatus({
    normalizedEventType,
    blockedUses: use.blockedUses,
    evidenceRefs,
    sourceEvidenceIds,
    sourceOwners,
    freshness,
    humanReviewRequired
  });

  return {
    captureStatus,
    eventType,
    normalizedEventType,
    candidateId,
    recruitIdentityId,
    applicationId,
    managerId,
    occurredAt,
    managerVisibleEvent: {
      eventType: normalizedEventType,
      payload: clone(eventPayload),
      referenceOnly: true,
      createsTruth: false
    },
    evidenceRefs,
    sourceEvidenceIds,
    sourceOwners,
    freshness: freshness.value,
    missingEvidence: unique(missingEvidence),
    unknownSignals: unique(unknownSignals),
    staleSignals: unique(staleSignals),
    confidenceLimitations: unique(confidenceLimitations),
    warnings: unique([
      ...warnings,
      "Manager recruitment event capture is context only and does not create automatic approval, rejection, precontract, lifecycle, revenue, compensation or payout truth."
    ]),
    managerReviewRequired,
    humanReviewRequired,
    allowedUses: unique(use.allowedUses),
    blockedUses: unique(use.blockedUses),
    ...boundaryFlags()
  };
}

module.exports = {
  MANAGER_RECRUITMENT_EVENT_CAPTURE_DECISIONS,
  MANAGER_RECRUITMENT_EVENT_CAPTURE_STATUSES,
  MANAGER_RECRUITMENT_EVENT_TYPES,
  captureManagerRecruitmentEvent
};
