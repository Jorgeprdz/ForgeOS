export const PARTNER_PAYOUT_TRUTH_RESULT_STATUSES = Object.freeze({
  PAID_CONFIRMED: 'paid_confirmed',
  PAYOUT_BLOCKED: 'payout_blocked',
  PAYOUT_UNKNOWN: 'payout_unknown',
  PAYOUT_REJECTED: 'payout_rejected',
  PAYOUT_NOT_APPLICABLE: 'payout_not_applicable',
  PAYOUT_CANDIDATE_ONLY: 'payout_candidate_only',
  PAYOUT_MISMATCH: 'payout_mismatch',
  PAYOUT_HIDDEN_BY_SCOPE: 'payout_hidden_by_scope',
});

function cloneArray(value) {
  return Array.isArray(value) ? [...value] : [];
}

function hasNumber(value) {
  return value !== null && value !== undefined && Number.isFinite(Number(value));
}

function normalizeStatus(status = PARTNER_PAYOUT_TRUTH_RESULT_STATUSES.PAYOUT_UNKNOWN) {
  return Object.values(PARTNER_PAYOUT_TRUTH_RESULT_STATUSES).includes(status)
    ? status
    : PARTNER_PAYOUT_TRUTH_RESULT_STATUSES.PAYOUT_UNKNOWN;
}

export function createPartnerPayoutTruthResult({
  conceptKey = null,
  partnerId = null,
  period = null,
  status = PARTNER_PAYOUT_TRUTH_RESULT_STATUSES.PAYOUT_UNKNOWN,
  officialAmount = null,
  officialCurrency = null,
  candidateAmount = null,
  evidenceSource = null,
  statementMatch = null,
  blockedReasons = [],
  mismatchReasons = [],
  warnings = [],
  confidence = 'unknown',
  sourceNotes = [],
  metadata = {},
} = {}) {
  const safeStatus = normalizeStatus(status);
  const safeOfficialAmount = hasNumber(officialAmount) ? Number(officialAmount) : null;
  const safeCandidateAmount = hasNumber(candidateAmount) ? Number(candidateAmount) : null;
  const varianceAmount = hasNumber(safeOfficialAmount) && hasNumber(safeCandidateAmount)
    ? safeOfficialAmount - safeCandidateAmount
    : null;

  return {
    conceptKey,
    partnerId,
    period,
    payoutTruth: safeStatus === PARTNER_PAYOUT_TRUTH_RESULT_STATUSES.PAID_CONFIRMED,
    status: safeStatus,
    officialAmount: safeOfficialAmount,
    officialCurrency,
    candidateAmount: safeCandidateAmount,
    varianceAmount,
    evidenceSource,
    statementMatch,
    blockedReasons: cloneArray(blockedReasons),
    mismatchReasons: cloneArray(mismatchReasons),
    warnings: cloneArray(warnings),
    confidence,
    sourceNotes: cloneArray(sourceNotes),
    metadata: { ...metadata },
    candidateAmountIsOfficialAmount: false,
    hiddenByScopeIsZero: false,
    unknownIsZero: false,
    blockedIsZero: false,
  };
}
