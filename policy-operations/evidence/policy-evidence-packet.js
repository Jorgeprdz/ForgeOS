export const POLICY_EVIDENCE_STATES = Object.freeze({
  EXTRACTED: 'extracted',
  PENDING_CONFIRMATION: 'pending_confirmation',
  CONFIRMED: 'confirmed',
  REJECTED: 'rejected',
  UNKNOWN: 'unknown',
});

export const EXTRACTED_POLICY_FIELD_STATES = Object.freeze({
  EXTRACTED: 'extracted',
  CONFIRMED: 'confirmed',
  EDITED_BY_ADVISOR: 'edited_by_advisor',
  REJECTED: 'rejected',
  UNKNOWN: 'unknown',
});

export function createExtractedPolicyField({
  fieldName,
  value = null,
  confidence = null,
  sourceLocation = null,
  extractionMethod = 'unknown',
  state = EXTRACTED_POLICY_FIELD_STATES.EXTRACTED,
} = {}) {
  return {
    fieldName,
    value,
    confidence,
    sourceLocation,
    extractionMethod,
    state,
  };
}

export function createPolicyEvidencePacket({
  evidenceId = crypto.randomUUID(),
  documentRef,
  documentType = 'unknown',
  uploadedAt = Date.now(),
  extractionMethod = 'unknown',
  extractedFields = {},
  extractionConfidence = null,
  confirmationState = POLICY_EVIDENCE_STATES.PENDING_CONFIRMATION,
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

export function isConfirmedPolicyEvidencePacket(packet = {}) {
  return packet.confirmationState === POLICY_EVIDENCE_STATES.CONFIRMED;
}

export function createConfirmedPolicyOperationalData({
  carrierId = null,
  carrierName = null,
  productName = null,
  productVariant = null,
  policyNumber = null,
  policyYear = null,
  annualPremium = null,
  currency = null,
  paymentFrequency = null,
  sumAssured = null,
  effectiveDate = null,
  issueDate = null,
  renewalDate = null,
  advisorId = null,
  evidenceRefs = [],
  confirmationState = POLICY_EVIDENCE_STATES.CONFIRMED,
} = {}) {
  return {
    carrierId,
    carrierName,
    productName,
    productVariant,
    policyNumber,
    policyYear,
    annualPremium,
    currency,
    paymentFrequency,
    sumAssured,
    effectiveDate,
    issueDate,
    renewalDate,
    advisorId,
    evidenceRefs,
    confirmationState,
  };
}
