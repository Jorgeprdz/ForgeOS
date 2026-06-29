const CONSUMER_MODES = Object.freeze({
  SHARED_CONTRACT: "SHARED_CONTRACT",
  RECRUITMENT_REFERENCE: "RECRUITMENT_REFERENCE",
  ADVISOR_LIFECYCLE_REFERENCE: "ADVISOR_LIFECYCLE_REFERENCE",
  REVENUE_REFERENCE: "REVENUE_REFERENCE",
  COMPENSATION_REFERENCE: "COMPENSATION_REFERENCE"
});

const CONSUMER_CONTRACT_STATUSES = Object.freeze({
  MISSING: "MISSING",
  READY_FOR_REFERENCE: "READY_FOR_REFERENCE",
  NEEDS_REVIEW: "NEEDS_REVIEW",
  BLOCKED: "BLOCKED",
  UNKNOWN: "UNKNOWN",
  NOT_MODELED: "NOT_MODELED"
});

const FORBIDDEN_TRANSITIONS = new Set([
  "COMPENSATION_OWNERSHIP_TRUTH",
  "PRECONTRACT_TRUTH",
  "ADVISOR_LIFECYCLE_TRUTH",
  "REVENUE",
  "COMPENSATION",
  "PAYOUT",
  "PAYMENT",
  "AUTOMATIC_APPROVAL",
  "AUTOMATIC_REJECTION"
]);

const MODE_ALIASES = Object.freeze({
  RECRUITMENT: CONSUMER_MODES.RECRUITMENT_REFERENCE,
  ADVISOR_LIFECYCLE: CONSUMER_MODES.ADVISOR_LIFECYCLE_REFERENCE,
  REVENUE: CONSUMER_MODES.REVENUE_REFERENCE,
  COMPENSATION: CONSUMER_MODES.COMPENSATION_REFERENCE
});

function present(value) {
  return value !== undefined && value !== null && value !== "";
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

function normalizeMode(mode) {
  const normalized = normalizeText(mode);
  if (!normalized) return CONSUMER_MODES.SHARED_CONTRACT;
  return CONSUMER_MODES[normalized] || MODE_ALIASES[normalized] || CONSUMER_MODES.SHARED_CONTRACT;
}

function boundaryFlags() {
  return {
    automaticDecisionAllowed: false,
    createsCompensationOwnershipTruth: false,
    createsPrecontractTruth: false,
    createsAdvisorLifecycleTruth: false,
    createsRevenue: false,
    createsCompensation: false,
    createsPayoutTruth: false
  };
}

function resolveContractStatus(attributionTruth = {}) {
  const status = normalizeText(attributionTruth.attributionStatus);

  if (!present(attributionTruth) || Object.keys(attributionTruth).length === 0) {
    return CONSUMER_CONTRACT_STATUSES.MISSING;
  }

  if (status === "BLOCKED") return CONSUMER_CONTRACT_STATUSES.BLOCKED;
  if (status === "UNKNOWN") return CONSUMER_CONTRACT_STATUSES.UNKNOWN;
  if (status === "NOT_MODELED") return CONSUMER_CONTRACT_STATUSES.NOT_MODELED;

  if (attributionTruth.attributionTruthReady === true) {
    return CONSUMER_CONTRACT_STATUSES.READY_FOR_REFERENCE;
  }

  return CONSUMER_CONTRACT_STATUSES.NEEDS_REVIEW;
}

function mapManagerRdaAttributionForConsumer({
  attributionTruth = {},
  consumerMode = CONSUMER_MODES.SHARED_CONTRACT,
  consumerContext = {},
  requestedTransition = null
} = {}) {
  const mode = normalizeMode(consumerMode);
  const requested = normalizeText(requestedTransition);
  const contractStatus = resolveContractStatus(attributionTruth);
  const warnings = unique([
    ...asArray(attributionTruth.warnings),
    ...asArray(consumerContext.warnings)
  ]);
  const blockedTransitions = [];
  const allowedTransitions = [];
  const missingEvidence = unique([
    ...asArray(attributionTruth.missingEvidence),
    ...asArray(consumerContext.missingEvidence)
  ]);
  const missingPrerequisites = unique([
    ...asArray(attributionTruth.missingPrerequisites),
    ...asArray(consumerContext.missingPrerequisites)
  ]);

  if (requested && FORBIDDEN_TRANSITIONS.has(requested)) {
    blockedTransitions.push(requested);
    warnings.push(`${requested} transition is forbidden from Manager RDA consumer contract.`);
  }

  if (!present(attributionTruth) || Object.keys(attributionTruth).length === 0) {
    missingEvidence.push("manager_rda_attribution_truth_required");
  }

  if (contractStatus !== CONSUMER_CONTRACT_STATUSES.READY_FOR_REFERENCE) {
    missingPrerequisites.push("manager_rda_attribution_truth_ready_required");
  }

  const referenceOnly = {
    attributionStatus: attributionTruth.attributionStatus || null,
    attributionTruthReady: attributionTruth.attributionTruthReady === true,
    proposedRdaOwner: attributionTruth.proposedRdaOwner || null,
    confirmedRdaOwner: attributionTruth.attributionTruthReady === true
      ? attributionTruth.confirmedRdaOwner || null
      : null,
    evidenceRefs: unique([
      ...asArray(attributionTruth.evidenceRefs),
      ...asArray(consumerContext.evidenceRefs)
    ]),
    sourceEvidenceIds: unique([
      ...asArray(attributionTruth.sourceEvidenceIds),
      ...asArray(consumerContext.sourceEvidenceIds)
    ])
  };

  if (contractStatus === CONSUMER_CONTRACT_STATUSES.READY_FOR_REFERENCE) {
    allowedTransitions.push("CONSUME_MANAGER_RDA_ATTRIBUTION_REFERENCE");
  } else {
    warnings.push("Manager RDA attribution is not ready for downstream truth consumption.");
  }

  warnings.push("Consumer contract is reference-only and does not create downstream truth.");
  warnings.push("Manager OS RDA attribution truth is not compensation ownership truth or payout truth.");

  return {
    consumerMode: mode,
    contractStatus,
    referenceOnly,
    managerReviewRequired: attributionTruth.managerReviewRequired === true || contractStatus !== CONSUMER_CONTRACT_STATUSES.READY_FOR_REFERENCE,
    humanReviewRequired: attributionTruth.humanReviewRequired === true || blockedTransitions.length > 0 || contractStatus !== CONSUMER_CONTRACT_STATUSES.READY_FOR_REFERENCE,
    missingEvidence,
    missingPrerequisites: unique(missingPrerequisites),
    evidenceRefs: referenceOnly.evidenceRefs,
    sourceEvidenceIds: referenceOnly.sourceEvidenceIds,
    allowedTransitions: unique(allowedTransitions),
    blockedTransitions: unique(blockedTransitions),
    warnings: unique(warnings),
    ...boundaryFlags()
  };
}

module.exports = {
  CONSUMER_CONTRACT_STATUSES,
  CONSUMER_MODES,
  mapManagerRdaAttributionForConsumer
};
