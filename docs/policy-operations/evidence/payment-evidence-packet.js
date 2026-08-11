export const PAYMENT_EVIDENCE_STATES = Object.freeze({
  EXTRACTED: 'extracted',
  PENDING_CONFIRMATION: 'pending_confirmation',
  CONFIRMED: 'confirmed',
  REJECTED: 'rejected',
  UNKNOWN: 'unknown',
});

export const PAYMENT_SOURCE_TYPES = Object.freeze({
  POLICY_RECEIPT: 'policy_receipt',
  PAYMENT_PROOF: 'payment_proof',
  BANK_PROOF: 'bank_proof',
  CARRIER_STATEMENT: 'carrier_statement',
  MANUAL_CAPTURE: 'manual_capture',
  INTEGRATION: 'integration',
});

export function createPaymentEvidencePacket({
  evidenceId = crypto.randomUUID(),
  documentRef = null,
  documentType = 'unknown',
  uploadedAt = Date.now(),
  extractionMethod = 'unknown',
  extractedFields = {},
  extractionConfidence = null,
  confirmationState = PAYMENT_EVIDENCE_STATES.PENDING_CONFIRMATION,
  confirmedBy = null,
  confirmedAt = null,
  warnings = [],
} = {}) {
  return {
    evidenceId,
    documentRef,
    documentType,
    uploadedAt,
    extractionMethod,
    extractedFields,
    extractionConfidence,
    confirmationState,
    confirmedBy,
    confirmedAt,
    warnings,
  };
}

export function isConfirmedPaymentEvidencePacket(packet = {}) {
  return packet.confirmationState === PAYMENT_EVIDENCE_STATES.CONFIRMED;
}

export function createConfirmedPaymentOperationalData({
  paymentEvidenceId = null,
  advisorId = null,
  carrierId = null,
  policyId = null,
  policyNumber = null,
  paymentAmount = null,
  currency = null,
  paymentDate = null,
  paymentFrequency = null,
  periodCoveredStart = null,
  periodCoveredEnd = null,
  receiptNumber = null,
  paymentSource = PAYMENT_SOURCE_TYPES.PAYMENT_PROOF,
  evidenceRefs = [],
  confirmationState = PAYMENT_EVIDENCE_STATES.CONFIRMED,
} = {}) {
  return {
    paymentEvidenceId,
    advisorId,
    carrierId,
    policyId,
    policyNumber,
    paymentAmount,
    currency,
    paymentDate,
    paymentFrequency,
    periodCoveredStart,
    periodCoveredEnd,
    receiptNumber,
    paymentSource,
    evidenceRefs,
    confirmationState,
  };
}
