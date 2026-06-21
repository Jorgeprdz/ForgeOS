export const PARTNER_SAFE_CALCULATION_STATUSES = Object.freeze({
  CALCULATED_CANDIDATE: 'calculated_candidate',
  CALCULATION_BLOCKED: 'calculation_blocked',
  CALCULATION_PARTIAL: 'calculation_partial',
  NOT_MODELED: 'not_modeled',
  UNKNOWN: 'unknown',
  BLOCKED_BY_MISSING_TABLE: 'blocked_by_missing_table',
  BLOCKED_BY_MISSING_FORMULA: 'blocked_by_missing_formula',
  BLOCKED_BY_MISSING_ECONOMIC_INPUT: 'blocked_by_missing_economic_input',
  BLOCKED_BY_MISSING_EVIDENCE: 'blocked_by_missing_evidence',
  BLOCKED_BY_MISSING_SCOPE: 'blocked_by_missing_scope',
  BLOCKED_BY_MISSING_LIFECYCLE: 'blocked_by_missing_lifecycle',
  BLOCKED_BY_MISSING_TA_COUNTING_EVENT_EVIDENCE: 'blocked_by_missing_TA_counting_event_evidence',
  EXAMPLE_ONLY: 'example_only',
});

export const PARTNER_PAYOUT_TRUTH_STATUSES = Object.freeze({
  NOT_PAYOUT_TRUTH: 'not_payout_truth',
});

function cloneArray(value) {
  return Array.isArray(value) ? [...value] : [];
}

function hasNumber(value) {
  return value !== null && value !== undefined && Number.isFinite(Number(value));
}

function normalizeStatus(status) {
  return Object.values(PARTNER_SAFE_CALCULATION_STATUSES).includes(status)
    ? status
    : PARTNER_SAFE_CALCULATION_STATUSES.UNKNOWN;
}

function isBlockedStatus(status) {
  return [
    PARTNER_SAFE_CALCULATION_STATUSES.CALCULATION_BLOCKED,
    PARTNER_SAFE_CALCULATION_STATUSES.NOT_MODELED,
    PARTNER_SAFE_CALCULATION_STATUSES.UNKNOWN,
    PARTNER_SAFE_CALCULATION_STATUSES.BLOCKED_BY_MISSING_TABLE,
    PARTNER_SAFE_CALCULATION_STATUSES.BLOCKED_BY_MISSING_FORMULA,
    PARTNER_SAFE_CALCULATION_STATUSES.BLOCKED_BY_MISSING_ECONOMIC_INPUT,
    PARTNER_SAFE_CALCULATION_STATUSES.BLOCKED_BY_MISSING_EVIDENCE,
    PARTNER_SAFE_CALCULATION_STATUSES.BLOCKED_BY_MISSING_SCOPE,
    PARTNER_SAFE_CALCULATION_STATUSES.BLOCKED_BY_MISSING_LIFECYCLE,
    PARTNER_SAFE_CALCULATION_STATUSES.BLOCKED_BY_MISSING_TA_COUNTING_EVENT_EVIDENCE,
    PARTNER_SAFE_CALCULATION_STATUSES.EXAMPLE_ONLY,
  ].includes(status);
}

export function createPartnerSafeCalculationResult({
  conceptKey = 'unknown',
  status = PARTNER_SAFE_CALCULATION_STATUSES.UNKNOWN,
  calculationAllowed = false,
  calculatedCandidate = false,
  candidateAmount = null,
  candidatePercentage = null,
  inputBasis = null,
  blockedReasons = [],
  missingInputs = [],
  warnings = [],
  sourceNotes = [],
  confidence = 'unknown',
  evidenceRequirement = [],
  notModeledReasons = [],
  unknownReasons = [],
  metadata = {},
} = {}) {
  const normalizedStatus = normalizeStatus(status);
  const blocked = isBlockedStatus(normalizedStatus) || blockedReasons.length > 0 || missingInputs.length > 0;
  const safeCalculationAllowed = calculationAllowed === true && !blocked;
  const safeCandidateAmount = hasNumber(candidateAmount) && !blocked ? Number(candidateAmount) : null;

  return {
    conceptKey,
    status: normalizedStatus,
    calculationAllowed: safeCalculationAllowed,
    calculatedCandidate: safeCalculationAllowed && calculatedCandidate === true,
    candidateAmount: safeCandidateAmount,
    candidatePercentage: hasNumber(candidatePercentage) ? Number(candidatePercentage) : null,
    inputBasis,
    blockedReasons: cloneArray(blockedReasons),
    missingInputs: cloneArray(missingInputs),
    warnings: cloneArray(warnings),
    sourceNotes: cloneArray(sourceNotes),
    confidence,
    payoutTruth: false,
    payoutTruthStatus: PARTNER_PAYOUT_TRUTH_STATUSES.NOT_PAYOUT_TRUTH,
    evidenceRequirement: cloneArray(evidenceRequirement),
    notModeledReasons: cloneArray(notModeledReasons),
    unknownReasons: cloneArray(unknownReasons),
    metadata: { ...metadata },
    unknownIsZero: false,
    blockedIsZero: false,
    notModeledIsZero: false,
  };
}
