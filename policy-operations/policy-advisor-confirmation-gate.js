import {
  EXTRACTED_POLICY_FIELD_STATES,
  POLICY_EVIDENCE_STATES,
  createConfirmedPolicyOperationalData,
} from './evidence/policy-evidence-packet.js';

import {
  PAYMENT_EVIDENCE_STATES,
  createConfirmedPaymentOperationalData,
} from './evidence/payment-evidence-packet.js';

import {
  COMMISSION_STATEMENT_EVIDENCE_STATES,
  createConfirmedCommissionPayoutData,
} from './evidence/commission-statement-evidence-packet.js';

const LOW_CONFIDENCE_THRESHOLD = 0.8;

const REQUIRED_POLICY_FIELDS = [
  'carrierId',
  'productName',
  'annualPremium',
  'currency',
  'paymentFrequency',
];

const REQUIRED_PAYMENT_FIELDS = [
  'paymentAmount',
  'paymentDate',
  'currency',
  'policyNumber',
];

const REQUIRED_STATEMENT_FIELDS = [
  'commissionAmount',
  'payoutDate',
  'policyNumber',
  'carrierId',
];

function fieldValue(field) {
  if (!field || typeof field !== 'object') return field;
  return field.value;
}

function fieldConfidence(field) {
  if (!field || typeof field !== 'object') return null;
  return field.confidence;
}

function isMissing(value) {
  return value === null || value === undefined || value === '';
}

function lowConfidence(field) {
  const confidence = fieldConfidence(field);
  return confidence !== null && confidence < LOW_CONFIDENCE_THRESHOLD;
}

function missingOrLowConfidence(fields = {}, requiredFields = []) {
  return requiredFields.filter((fieldName) => {
    const field = fields[fieldName];
    return isMissing(fieldValue(field)) || lowConfidence(field);
  });
}

function normalizeConfirmedFields(fields = {}, edits = {}) {
  const output = {};

  Object.entries(fields).forEach(([key, field]) => {
    const edited = Object.prototype.hasOwnProperty.call(edits, key);
    output[key] = {
      ...(typeof field === 'object' && field !== null ? field : { value: field }),
      value: edited ? edits[key] : fieldValue(field),
      state: edited
        ? EXTRACTED_POLICY_FIELD_STATES.EDITED_BY_ADVISOR
        : EXTRACTED_POLICY_FIELD_STATES.CONFIRMED,
    };
  });

  Object.entries(edits).forEach(([key, value]) => {
    if (!Object.prototype.hasOwnProperty.call(output, key)) {
      output[key] = {
        fieldName: key,
        value,
        confidence: null,
        sourceLocation: null,
        extractionMethod: 'advisor_edit',
        state: EXTRACTED_POLICY_FIELD_STATES.EDITED_BY_ADVISOR,
      };
    }
  });

  return output;
}

function plainValues(fields = {}) {
  return Object.fromEntries(
    Object.entries(fields).map(([key, field]) => [key, fieldValue(field)])
  );
}

export function createAdvisorConfirmationRequest({
  evidenceType = 'unknown',
  evidenceId = null,
  missingFields = [],
  lowConfidenceFields = [],
  reason = 'confirmation_required',
} = {}) {
  return {
    confirmationRequired: true,
    evidenceType,
    evidenceId,
    missingFields,
    lowConfidenceFields,
    reason,
  };
}

export function requiresAdvisorConfirmation({
  evidenceType = 'policy',
  extractedFields = {},
} = {}) {
  const required = evidenceType === 'payment'
    ? REQUIRED_PAYMENT_FIELDS
    : evidenceType === 'commission_statement'
      ? REQUIRED_STATEMENT_FIELDS
      : REQUIRED_POLICY_FIELDS;

  const fields = missingOrLowConfidence(extractedFields, required);

  return fields.length > 0;
}

export function confirmPolicyExtraction({
  packet,
  advisorId = null,
  confirmedBy = null,
  edits = {},
} = {}) {
  if (!packet || packet.confirmationState === POLICY_EVIDENCE_STATES.REJECTED) {
    return {
      error: true,
      reason: 'EVIDENCE_REJECTED_OR_MISSING',
    };
  }

  const confirmedFields = normalizeConfirmedFields(packet.extractedFields, edits);
  const values = plainValues(confirmedFields);

  return createConfirmedPolicyOperationalData({
    ...values,
    advisorId: advisorId || values.advisorId,
    evidenceRefs: [packet.evidenceId],
    confirmationState: POLICY_EVIDENCE_STATES.CONFIRMED,
    confirmedBy,
    confirmedAt: Date.now(),
  });
}

export function confirmPaymentExtraction({
  packet,
  advisorId = null,
  confirmedBy = null,
  edits = {},
} = {}) {
  if (!packet || packet.confirmationState === PAYMENT_EVIDENCE_STATES.REJECTED) {
    return {
      error: true,
      reason: 'EVIDENCE_REJECTED_OR_MISSING',
    };
  }

  const confirmedFields = normalizeConfirmedFields(packet.extractedFields, edits);
  const values = plainValues(confirmedFields);

  return createConfirmedPaymentOperationalData({
    ...values,
    advisorId: advisorId || values.advisorId,
    paymentEvidenceId: packet.evidenceId,
    evidenceRefs: [packet.evidenceId],
    confirmationState: PAYMENT_EVIDENCE_STATES.CONFIRMED,
    confirmedBy,
    confirmedAt: Date.now(),
  });
}

export function confirmCommissionStatementExtraction({
  packet,
  advisorId = null,
  confirmedBy = null,
  edits = {},
} = {}) {
  if (!packet || packet.confirmationState === COMMISSION_STATEMENT_EVIDENCE_STATES.REJECTED) {
    return {
      error: true,
      reason: 'EVIDENCE_REJECTED_OR_MISSING',
    };
  }

  const firstRow = Array.isArray(packet.extractedRows) ? (packet.extractedRows[0] || {}) : {};
  const confirmedFields = normalizeConfirmedFields(firstRow, edits);
  const values = plainValues(confirmedFields);

  return createConfirmedCommissionPayoutData({
    ...values,
    advisorId: advisorId || values.advisorId,
    carrierId: values.carrierId || packet.carrierId,
    payoutEvidenceId: packet.evidenceId,
    evidenceRefs: [packet.evidenceId],
    confirmationState: COMMISSION_STATEMENT_EVIDENCE_STATES.CONFIRMED,
    confirmedBy,
    confirmedAt: Date.now(),
  });
}

export function rejectEvidenceExtraction({
  packet,
  reason = 'advisor_rejected',
} = {}) {
  return {
    ...packet,
    confirmationState: 'rejected',
    rejectedAt: Date.now(),
    rejectionReason: reason,
    canRouteToRevenue: false,
  };
}
