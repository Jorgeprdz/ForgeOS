const RECRUITMENT_PIPELINE_STATES = Object.freeze({
  PROSPECT: "PROSPECT",
  CANDIDATE: "CANDIDATE",
  APPLICATION_STARTED: "APPLICATION_STARTED",
  APPLICATION_SUBMITTED: "APPLICATION_SUBMITTED",
  INTERVIEWING: "INTERVIEWING",
  INTERVIEW_FLOW_ACTIVE: "INTERVIEW_FLOW_ACTIVE",
  MANAGER_REVIEW: "MANAGER_REVIEW",
  READY_FOR_PRECONTRACT_REVIEW: "READY_FOR_PRECONTRACT_REVIEW",
  BLOCKED: "BLOCKED",
  REJECTED_BY_DECISION_SUPPORT_ONLY: "REJECTED_BY_DECISION_SUPPORT_ONLY",
  WITHDRAWN: "WITHDRAWN",
  REENTRY_REVIEW: "REENTRY_REVIEW",
  NOT_MODELED: "NOT_MODELED",
  UNKNOWN: "UNKNOWN"
});

const RECRUITMENT_PIPELINE_STATUS = Object.freeze({
  READY: "READY",
  NEEDS_EVIDENCE: "NEEDS_EVIDENCE",
  NEEDS_HUMAN_REVIEW: "NEEDS_HUMAN_REVIEW",
  BLOCKED: "BLOCKED",
  UNKNOWN: "UNKNOWN",
  NOT_MODELED: "NOT_MODELED",
  COMPLETED: "COMPLETED"
});

const RECRUITMENT_PIPELINE_DECISIONS = Object.freeze({
  ADVANCE: "ADVANCE",
  WATCH: "WATCH",
  COACH: "COACH",
  REJECT: "REJECT"
});

const RECRUIT_IDENTITY_STATUS_MAP = Object.freeze({
  ACTIVE: RECRUITMENT_PIPELINE_STATES.PROSPECT,
  DUPLICATE_REVIEW: RECRUITMENT_PIPELINE_STATES.BLOCKED,
  MERGED_DUPLICATE: RECRUITMENT_PIPELINE_STATES.BLOCKED,
  DO_NOT_RECRUIT: RECRUITMENT_PIPELINE_STATES.BLOCKED,
  ARCHIVED: RECRUITMENT_PIPELINE_STATES.WITHDRAWN
});

const APPLICATION_STATUS_MAP = Object.freeze({
  NEW: RECRUITMENT_PIPELINE_STATES.APPLICATION_STARTED,
  SCREENING: RECRUITMENT_PIPELINE_STATES.APPLICATION_SUBMITTED,
  INTERVIEWING: RECRUITMENT_PIPELINE_STATES.INTERVIEWING,
  ASSESSED: RECRUITMENT_PIPELINE_STATES.MANAGER_REVIEW,
  SELECTED: RECRUITMENT_PIPELINE_STATES.READY_FOR_PRECONTRACT_REVIEW,
  PRECONTRACT: RECRUITMENT_PIPELINE_STATES.READY_FOR_PRECONTRACT_REVIEW,
  ON_HOLD: RECRUITMENT_PIPELINE_STATES.BLOCKED,
  REJECTED: RECRUITMENT_PIPELINE_STATES.REJECTED_BY_DECISION_SUPPORT_ONLY,
  WITHDRAWN: RECRUITMENT_PIPELINE_STATES.WITHDRAWN,
  CONVERTED: RECRUITMENT_PIPELINE_STATES.READY_FOR_PRECONTRACT_REVIEW,
  ARCHIVED: RECRUITMENT_PIPELINE_STATES.WITHDRAWN
});

const CANDIDATE_STATUS_MAP = Object.freeze({
  NEW: RECRUITMENT_PIPELINE_STATES.CANDIDATE,
  SCREENING: RECRUITMENT_PIPELINE_STATES.APPLICATION_SUBMITTED,
  INTERVIEWING: RECRUITMENT_PIPELINE_STATES.INTERVIEWING,
  PRECONTRACT: RECRUITMENT_PIPELINE_STATES.READY_FOR_PRECONTRACT_REVIEW,
  REJECTED: RECRUITMENT_PIPELINE_STATES.REJECTED_BY_DECISION_SUPPORT_ONLY,
  CONVERTED: RECRUITMENT_PIPELINE_STATES.READY_FOR_PRECONTRACT_REVIEW,
  INACTIVE: RECRUITMENT_PIPELINE_STATES.WITHDRAWN
});

const PIPELINE_SEQUENCE = Object.freeze([
  RECRUITMENT_PIPELINE_STATES.PROSPECT,
  RECRUITMENT_PIPELINE_STATES.CANDIDATE,
  RECRUITMENT_PIPELINE_STATES.APPLICATION_STARTED,
  RECRUITMENT_PIPELINE_STATES.APPLICATION_SUBMITTED,
  RECRUITMENT_PIPELINE_STATES.INTERVIEWING,
  RECRUITMENT_PIPELINE_STATES.INTERVIEW_FLOW_ACTIVE,
  RECRUITMENT_PIPELINE_STATES.MANAGER_REVIEW,
  RECRUITMENT_PIPELINE_STATES.READY_FOR_PRECONTRACT_REVIEW
]);

const FORBIDDEN_TRANSITIONS = new Set([
  "PRECONTRACT",
  "ADVISOR_LIFECYCLE",
  "REVENUE",
  "COMPENSATION",
  "PAYOUT"
]);

function hasValue(value) {
  return value !== undefined && value !== null && value !== "";
}

function asArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value.filter(hasValue) : [value].filter(hasValue);
}

function unique(values) {
  return [...new Set(values.filter(hasValue))];
}

function normalizeText(value) {
  return hasValue(value) ? String(value).trim().toUpperCase() : null;
}

function normalizeRecruitmentPipelineState(state) {
  const normalized = normalizeText(state);
  if (!normalized) return RECRUITMENT_PIPELINE_STATES.UNKNOWN;
  return RECRUITMENT_PIPELINE_STATES[normalized] || RECRUITMENT_PIPELINE_STATES.UNKNOWN;
}

function normalizeSchemaStatus({ recruit = {}, candidate = {}, application = {}, currentPipelineState = null } = {}) {
  if (hasValue(currentPipelineState)) {
    return normalizeRecruitmentPipelineState(currentPipelineState);
  }

  const applicationStatus = normalizeText(application.applicationStatus || application.status);
  if (applicationStatus && APPLICATION_STATUS_MAP[applicationStatus]) return APPLICATION_STATUS_MAP[applicationStatus];

  const candidateStatus = normalizeText(candidate.status || candidate.candidateStatus);
  if (candidateStatus && CANDIDATE_STATUS_MAP[candidateStatus]) return CANDIDATE_STATUS_MAP[candidateStatus];

  const recruitStatus = normalizeText(recruit.identityStatus || recruit.status);
  if (recruitStatus && RECRUIT_IDENTITY_STATUS_MAP[recruitStatus]) return RECRUIT_IDENTITY_STATUS_MAP[recruitStatus];

  if (hasValue(candidate.candidateId)) return RECRUITMENT_PIPELINE_STATES.CANDIDATE;
  if (hasValue(recruit.recruitIdentityId)) return RECRUITMENT_PIPELINE_STATES.PROSPECT;
  return RECRUITMENT_PIPELINE_STATES.UNKNOWN;
}

function nextSequentialState(state) {
  const index = PIPELINE_SEQUENCE.indexOf(state);
  if (index < 0 || index === PIPELINE_SEQUENCE.length - 1) return null;
  return PIPELINE_SEQUENCE[index + 1];
}

function isSkippedTransition(currentState, requestedState) {
  const currentIndex = PIPELINE_SEQUENCE.indexOf(currentState);
  const requestedIndex = PIPELINE_SEQUENCE.indexOf(requestedState);
  return currentIndex >= 0 && requestedIndex > currentIndex + 1;
}

function mergeProvenance(candidateAssessment = {}, provenance = {}, interviewFlow = {}) {
  const assessmentProvenance = candidateAssessment.provenance || {};
  return {
    evidenceRefs: unique([
      ...asArray(assessmentProvenance.evidenceRefs),
      ...asArray(provenance.evidenceRefs),
      ...asArray(interviewFlow.evidenceRefs)
    ]),
    sourceEvidenceIds: unique([
      ...asArray(assessmentProvenance.sourceEvidenceIds),
      ...asArray(provenance.sourceEvidenceIds),
      ...asArray(interviewFlow.sourceEvidenceIds)
    ]),
    confidenceLimitations: unique([
      ...asArray(assessmentProvenance.confidenceLimitations),
      ...asArray(provenance.confidenceLimitations),
      ...asArray(interviewFlow.confidenceLimitations)
    ]),
    warnings: unique([
      ...asArray(assessmentProvenance.warnings),
      ...asArray(provenance.warnings),
      ...asArray(interviewFlow.warnings)
    ]),
    humanReviewRequired: assessmentProvenance.humanReviewRequired === true ||
      provenance.humanReviewRequired === true ||
      interviewFlow.humanReviewRequired === true
  };
}

function collectEvidenceRefs({ recruit = {}, candidate = {}, application = {}, interviewEvidence = null } = {}) {
  const evidenceRefs = [];
  const items = asArray(interviewEvidence);

  if (recruit.recruitIdentityId) evidenceRefs.push(recruit.recruitIdentityId);
  if (candidate.candidateId) evidenceRefs.push(candidate.candidateId);
  if (application.applicationId) evidenceRefs.push(application.applicationId);
  items.forEach(item => {
    if (item && item.interviewEvidenceId) evidenceRefs.push(item.interviewEvidenceId);
  });

  return evidenceRefs;
}

function hasReentrySignal(application = {}, currentState) {
  if (currentState === RECRUITMENT_PIPELINE_STATES.REENTRY_REVIEW) return true;
  return asArray(application.eventHistory).some(event => normalizeText(event && event.eventType) === "RE_ENTRY_REQUESTED");
}

function recommendationState({ normalizedPipelineState, candidateAssessment = {}, interviewFlow = {}, hasReentry = false }) {
  if (hasReentry) return RECRUITMENT_PIPELINE_STATES.REENTRY_REVIEW;

  if (candidateAssessment.recommendation === RECRUITMENT_PIPELINE_DECISIONS.REJECT) {
    return RECRUITMENT_PIPELINE_STATES.REJECTED_BY_DECISION_SUPPORT_ONLY;
  }

  if (
    candidateAssessment.recommendation === RECRUITMENT_PIPELINE_DECISIONS.WATCH ||
    candidateAssessment.recommendation === RECRUITMENT_PIPELINE_DECISIONS.COACH ||
    interviewFlow.humanReviewRequired === true
  ) {
    return RECRUITMENT_PIPELINE_STATES.MANAGER_REVIEW;
  }

  if (interviewFlow.nextRecommendedStage && normalizedPipelineState === RECRUITMENT_PIPELINE_STATES.INTERVIEWING) {
    return RECRUITMENT_PIPELINE_STATES.INTERVIEW_FLOW_ACTIVE;
  }

  if (
    interviewFlow.stageStatus === "COMPLETED" ||
    normalizedPipelineState === RECRUITMENT_PIPELINE_STATES.MANAGER_REVIEW
  ) {
    return RECRUITMENT_PIPELINE_STATES.READY_FOR_PRECONTRACT_REVIEW;
  }

  return nextSequentialState(normalizedPipelineState);
}

function hasMinimumEvidence({ recruit = {}, candidate = {}, application = {}, mergedEvidenceRefs = [] } = {}) {
  return hasValue(recruit.recruitIdentityId) ||
    hasValue(candidate.candidateId) ||
    hasValue(application.applicationId) ||
    mergedEvidenceRefs.length > 0;
}

function boundaryFlags() {
  return {
    automaticDecisionAllowed: false,
    createsRecruitmentTruth: false,
    createsPrecontractTruth: false,
    createsAdvisorLifecycleTruth: false,
    createsRevenue: false,
    createsCompensation: false,
    createsPayoutTruth: false
  };
}

function evaluateRecruitmentPipeline({
  recruit = {},
  candidate = {},
  application = {},
  candidateAssessment = {},
  provenance = {},
  interviewFlow = {},
  interviewEvidence = null,
  completedStages = [],
  currentPipelineState = null,
  requestedTransition = null,
  managerReview = {}
} = {}) {
  const normalizedPipelineState = normalizeSchemaStatus({ recruit, candidate, application, currentPipelineState });
  const normalizedRequestedTransition = normalizeRecruitmentPipelineState(requestedTransition);
  const rawRequestedTransition = normalizeText(requestedTransition);
  const merged = mergeProvenance(candidateAssessment, provenance, interviewFlow);
  const evidenceRefs = unique([
    ...merged.evidenceRefs,
    ...collectEvidenceRefs({ recruit, candidate, application, interviewEvidence })
  ]);
  const sourceEvidenceIds = merged.sourceEvidenceIds;
  const confidenceLimitations = [...merged.confidenceLimitations];
  const warnings = [...merged.warnings];
  const missingEvidence = [];
  const allowedTransitions = [];
  const blockedTransitions = [];
  const managerOverride = managerReview && managerReview.override === true;
  const hasReentry = hasReentrySignal(application, normalizedPipelineState);
  const modeledState = normalizedPipelineState !== RECRUITMENT_PIPELINE_STATES.UNKNOWN;

  if (!hasMinimumEvidence({ recruit, candidate, application, mergedEvidenceRefs: evidenceRefs })) {
    missingEvidence.push("recruit_or_candidate_or_application_evidence_required");
  }

  if (!modeledState) {
    if (rawRequestedTransition) blockedTransitions.push(rawRequestedTransition);
    warnings.push("Unknown recruitment pipeline state blocks transition and requires human review.");
    return {
      currentPipelineState,
      normalizedPipelineState,
      requestedTransition,
      normalizedRequestedTransition,
      nextRecommendedState: null,
      allowedTransitions,
      blockedTransitions: unique(blockedTransitions),
      pipelineStatus: RECRUITMENT_PIPELINE_STATUS.UNKNOWN,
      missingEvidence: unique(missingEvidence),
      evidenceRefs,
      sourceEvidenceIds,
      confidenceLimitations: unique(confidenceLimitations),
      warnings: unique(warnings),
      humanReviewRequired: true,
      readyForPrecontractReview: false,
      interviewNextRecommendedStage: interviewFlow.nextRecommendedStage || null,
      ...boundaryFlags()
    };
  }

  const nextRecommendedState = recommendationState({
    normalizedPipelineState,
    candidateAssessment,
    interviewFlow,
    hasReentry
  });
  const sequentialNext = nextSequentialState(normalizedPipelineState);

  if (sequentialNext && missingEvidence.length === 0) {
    allowedTransitions.push(sequentialNext);
  }
  if (
    nextRecommendedState &&
    nextRecommendedState !== sequentialNext &&
    nextRecommendedState !== RECRUITMENT_PIPELINE_STATES.REJECTED_BY_DECISION_SUPPORT_ONLY &&
    missingEvidence.length === 0
  ) {
    allowedTransitions.push(nextRecommendedState);
  }

  if (rawRequestedTransition && FORBIDDEN_TRANSITIONS.has(rawRequestedTransition)) {
    blockedTransitions.push(rawRequestedTransition);
    warnings.push(`${rawRequestedTransition} transition is forbidden from Recruitment Pipeline.`);
  } else if (requestedTransition && normalizedRequestedTransition === RECRUITMENT_PIPELINE_STATES.UNKNOWN) {
    blockedTransitions.push(rawRequestedTransition);
    warnings.push("Unsupported requested recruitment pipeline transition blocks movement.");
  } else if (requestedTransition) {
    if (isSkippedTransition(normalizedPipelineState, normalizedRequestedTransition) && !managerOverride) {
      blockedTransitions.push(normalizedRequestedTransition);
      warnings.push("Skipped recruitment pipeline transition requires manager override and human review.");
    } else if (isSkippedTransition(normalizedPipelineState, normalizedRequestedTransition) && managerOverride) {
      allowedTransitions.push(normalizedRequestedTransition);
      warnings.push("Manager override allowed skipped recruitment pipeline transition; human review remains required.");
    } else if (!allowedTransitions.includes(normalizedRequestedTransition) && normalizedRequestedTransition !== normalizedPipelineState) {
      blockedTransitions.push(normalizedRequestedTransition);
      warnings.push("Requested recruitment pipeline transition is not currently allowed.");
    }
  }

  if (candidateAssessment.recommendation === RECRUITMENT_PIPELINE_DECISIONS.REJECT) {
    warnings.push("Reject recommendation is decision support only and is not automatic rejection.");
  }
  if (
    nextRecommendedState === RECRUITMENT_PIPELINE_STATES.READY_FOR_PRECONTRACT_REVIEW ||
    normalizedPipelineState === RECRUITMENT_PIPELINE_STATES.READY_FOR_PRECONTRACT_REVIEW
  ) {
    warnings.push("Ready for precontract review is decision support only and creates no precontract truth.");
  }
  if (hasReentry) {
    warnings.push("Reentry requires human review and prior history review.");
  }

  if (asArray(interviewFlow.blockedTransitions).length > 0) {
    blockedTransitions.push(...interviewFlow.blockedTransitions);
  }

  const readyForPrecontractReview =
    nextRecommendedState === RECRUITMENT_PIPELINE_STATES.READY_FOR_PRECONTRACT_REVIEW ||
    normalizedPipelineState === RECRUITMENT_PIPELINE_STATES.READY_FOR_PRECONTRACT_REVIEW;

  const humanReviewRequired =
    merged.humanReviewRequired ||
    managerOverride ||
    hasReentry ||
    missingEvidence.length > 0 ||
    blockedTransitions.length > 0 ||
    candidateAssessment.recommendation === RECRUITMENT_PIPELINE_DECISIONS.WATCH ||
    candidateAssessment.recommendation === RECRUITMENT_PIPELINE_DECISIONS.COACH ||
    candidateAssessment.recommendation === RECRUITMENT_PIPELINE_DECISIONS.REJECT ||
    interviewFlow.humanReviewRequired === true ||
    interviewFlow.stageStatus === "BLOCKED" ||
    interviewFlow.stageStatus === "UNKNOWN" ||
    interviewFlow.stageStatus === "NOT_MODELED" ||
    readyForPrecontractReview;

  let pipelineStatus = RECRUITMENT_PIPELINE_STATUS.READY;
  if (missingEvidence.length > 0) {
    pipelineStatus = RECRUITMENT_PIPELINE_STATUS.NEEDS_EVIDENCE;
  } else if (
    normalizedPipelineState === RECRUITMENT_PIPELINE_STATES.BLOCKED ||
    interviewFlow.stageStatus === "BLOCKED"
  ) {
    pipelineStatus = RECRUITMENT_PIPELINE_STATUS.BLOCKED;
  } else if (
    normalizedPipelineState === RECRUITMENT_PIPELINE_STATES.NOT_MODELED ||
    interviewFlow.stageStatus === "NOT_MODELED"
  ) {
    pipelineStatus = RECRUITMENT_PIPELINE_STATUS.NOT_MODELED;
  } else if (humanReviewRequired) {
    pipelineStatus = RECRUITMENT_PIPELINE_STATUS.NEEDS_HUMAN_REVIEW;
  } else if (normalizedPipelineState === RECRUITMENT_PIPELINE_STATES.WITHDRAWN) {
    pipelineStatus = RECRUITMENT_PIPELINE_STATUS.COMPLETED;
  }

  return {
    currentPipelineState,
    normalizedPipelineState,
    requestedTransition,
    normalizedRequestedTransition,
    nextRecommendedState,
    allowedTransitions: unique(allowedTransitions),
    blockedTransitions: unique(blockedTransitions),
    pipelineStatus,
    missingEvidence: unique(missingEvidence),
    evidenceRefs,
    sourceEvidenceIds,
    confidenceLimitations: unique(confidenceLimitations),
    warnings: unique(warnings),
    humanReviewRequired,
    readyForPrecontractReview,
    interviewNextRecommendedStage: interviewFlow.nextRecommendedStage || null,
    completedStages: asArray(completedStages),
    ...boundaryFlags()
  };
}

module.exports = {
  RECRUITMENT_PIPELINE_DECISIONS,
  RECRUITMENT_PIPELINE_STATES,
  RECRUITMENT_PIPELINE_STATUS,
  evaluateRecruitmentPipeline,
  normalizeRecruitmentPipelineState
};
