export const COMMISSION_STATEMENT_EVIDENCE_STATES = Object.freeze({
  EXTRACTED: 'extracted',
  PENDING_CONFIRMATION: 'pending_confirmation',
  CONFIRMED: 'confirmed',
  REJECTED: 'rejected',
  UNKNOWN: 'unknown',
});

export const COMMISSION_TYPES = Object.freeze({
  INITIAL: 'initial',
  RENEWAL: 'renewal',
  BONUS: 'bonus',
  RENEWAL_BONUS: 'renewal_bonus',
  ADJUSTMENT: 'adjustment',
  REVERSAL: 'reversal',
  UNKNOWN: 'unknown',
});

export function createCommissionStatementEvidencePacket({
  evidenceId = crypto.randomUUID(),
  documentRef = null,
  carrierId = null,
  statementPeriodStart = null,
  statementPeriodEnd = null,
  uploadedAt = Date.now(),
  extractionMethod = 'unknown',
  extractedRows = [],
  extractionConfidence = null,
  confirmationState = COMMISSION_STATEMENT_EVIDENCE_STATES.PENDING_CONFIRMATION,
  confirmedBy = null,
  confirmedAt = null,
  warnings = [],
} = {}) {
  return {
    evidenceId,
    documentRef,
    carrierId,
    statementPeriodStart,
    statementPeriodEnd,
    uploadedAt,
    extractionMethod,
    extractedRows,
    extractionConfidence,
    confirmationState,
    confirmedBy,
    confirmedAt,
    warnings,
  };
}

export function isConfirmedCommissionStatementEvidencePacket(packet = {}) {
  return packet.confirmationState === COMMISSION_STATEMENT_EVIDENCE_STATES.CONFIRMED;
}

export function createConfirmedCommissionPayoutData({
  payoutEvidenceId = null,
  advisorId = null,
  carrierId = null,
  policyNumber = null,
  paymentEventId = null,
  commissionAmount = null,
  currency = null,
  payoutDate = null,
  payoutPeriodStart = null,
  payoutPeriodEnd = null,
  commissionType = COMMISSION_TYPES.UNKNOWN,
  evidenceRefs = [],
  confirmationState = COMMISSION_STATEMENT_EVIDENCE_STATES.CONFIRMED,
  warnings = [],
} = {}) {
  return {
    payoutEvidenceId,
    advisorId,
    carrierId,
    policyNumber,
    paymentEventId,
    commissionAmount,
    currency,
    payoutDate,
    payoutPeriodStart,
    payoutPeriodEnd,
    commissionType,
    evidenceRefs,
    confirmationState,
    warnings,
  };
}
