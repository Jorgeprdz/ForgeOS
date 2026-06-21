import {
  PARTNER_OFFICIAL_EVIDENCE_STATUSES,
  normalizePartnerOfficialEvidenceSourceType,
  normalizePartnerOfficialEvidenceStatus,
} from './partner-official-evidence-status.js';

export const PARTNER_STATEMENT_MATCH_STATUSES = Object.freeze({
  MATCHED: 'matched',
  MISMATCH_AMOUNT: 'mismatch_amount',
  MISMATCH_CONCEPT: 'mismatch_concept',
  MISMATCH_PERIOD: 'mismatch_period',
  MISMATCH_PARTNER: 'mismatch_partner',
  MISSING_STATEMENT: 'missing_statement',
  MISSING_STATEMENT_LINE: 'missing_statement_line',
  NEEDS_HUMAN_CONFIRMATION: 'needs_human_confirmation',
  REJECTED: 'rejected',
  UNKNOWN: 'unknown',
});

function cloneArray(value) {
  return Array.isArray(value) ? [...value] : [];
}

function hasNumber(value) {
  return value !== null && value !== undefined && Number.isFinite(Number(value));
}

function normalizeMatchStatus(status = PARTNER_STATEMENT_MATCH_STATUSES.UNKNOWN) {
  return Object.values(PARTNER_STATEMENT_MATCH_STATUSES).includes(status)
    ? status
    : PARTNER_STATEMENT_MATCH_STATUSES.UNKNOWN;
}

export function createPartnerCompensationStatementMatch({
  partnerId = null,
  period = null,
  conceptKey = null,
  candidateCalculationId = null,
  officialStatementId = null,
  officialStatementLineId = null,
  officialAmount = null,
  officialCurrency = null,
  matchStatus = PARTNER_STATEMENT_MATCH_STATUSES.UNKNOWN,
  matchConfidence = 'unknown',
  mismatchReasons = [],
  sourceType = 'unknown',
  evidenceStatus = PARTNER_OFFICIAL_EVIDENCE_STATUSES.UNKNOWN,
  confirmedAt = null,
  confirmedBy = null,
  explicitZeroReason = null,
} = {}) {
  const reasons = cloneArray(mismatchReasons);
  let safeMatchStatus = normalizeMatchStatus(matchStatus);
  const safeOfficialAmount = hasNumber(officialAmount) ? Number(officialAmount) : null;

  if (!officialStatementId && safeMatchStatus === PARTNER_STATEMENT_MATCH_STATUSES.MATCHED) {
    safeMatchStatus = PARTNER_STATEMENT_MATCH_STATUSES.MISSING_STATEMENT;
    reasons.push('official_statement_required');
  }

  if (!officialStatementLineId && safeMatchStatus === PARTNER_STATEMENT_MATCH_STATUSES.MATCHED) {
    safeMatchStatus = PARTNER_STATEMENT_MATCH_STATUSES.MISSING_STATEMENT_LINE;
    reasons.push('official_statement_line_required');
  }

  if (safeOfficialAmount === null && safeMatchStatus === PARTNER_STATEMENT_MATCH_STATUSES.MATCHED) {
    safeMatchStatus = PARTNER_STATEMENT_MATCH_STATUSES.MISSING_STATEMENT_LINE;
    reasons.push('official_amount_required');
  }

  if (safeOfficialAmount === 0 && !explicitZeroReason) {
    reasons.push('official_zero_requires_explicit_statement_reason');
  }

  const safeEvidenceStatus = normalizePartnerOfficialEvidenceStatus(evidenceStatus);

  return {
    partnerId,
    period,
    conceptKey,
    candidateCalculationId,
    officialStatementId,
    officialStatementLineId,
    officialAmount: safeOfficialAmount,
    officialCurrency,
    matchStatus: safeMatchStatus,
    matchConfidence,
    mismatchReasons: reasons,
    sourceType: normalizePartnerOfficialEvidenceSourceType(sourceType),
    evidenceStatus: safeEvidenceStatus,
    confirmedAt,
    confirmedBy,
    explicitZeroReason,
    matched: safeMatchStatus === PARTNER_STATEMENT_MATCH_STATUSES.MATCHED,
    canSupportPayoutTruth: (
      safeMatchStatus === PARTNER_STATEMENT_MATCH_STATUSES.MATCHED &&
      safeEvidenceStatus === PARTNER_OFFICIAL_EVIDENCE_STATUSES.OFFICIAL_CONFIRMED &&
      officialStatementLineId !== null &&
      safeOfficialAmount !== null &&
      (safeOfficialAmount !== 0 || Boolean(explicitZeroReason))
    ),
    highConfidenceIsPayoutTruth: false,
  };
}
