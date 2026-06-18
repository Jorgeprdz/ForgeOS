export const VALIDATOR_STATUSES = Object.freeze({
  PASS: 'PASS',
  FAIL: 'FAIL',
  BLOCK: 'BLOCK',
  DEGRADE: 'DEGRADE',
  NEEDS_REVIEW: 'NEEDS_REVIEW',
});

const DEFAULT_ADRS = Object.freeze([
  'ADR-001',
  'ADR-002',
  'ADR-003',
  'ADR-004',
]);

const DEFAULT_CONSTITUTION_PRINCIPLES = Object.freeze([
  'Evidence precedes judgment.',
  'No invented truth.',
  'Governance before execution.',
]);

export function createValidationResult({
  validatorId,
  status,
  reason,
  evidence = [],
  blockedTransition = null,
  relatedTruthType = null,
  relatedEvidenceState = null,
  relatedOwnerType = null,
  relatedADR = DEFAULT_ADRS,
  relatedConstitutionPrinciple = DEFAULT_CONSTITUTION_PRINCIPLES,
  recommendedAction = 'request_review',
  auditEventRequired = false,
  userFacingMessageAllowed = false,
} = {}) {
  if (!validatorId) {
    throw new Error('validatorId is required');
  }

  if (!Object.values(VALIDATOR_STATUSES).includes(status)) {
    throw new Error(`Unknown validator status: ${status}`);
  }

  if (!reason) {
    throw new Error('reason is required');
  }

  return Object.freeze({
    validatorId,
    status,
    reason,
    evidence: Array.isArray(evidence) ? Object.freeze([...evidence]) : Object.freeze([evidence]),
    blockedTransition,
    relatedTruthType,
    relatedEvidenceState,
    relatedOwnerType,
    relatedADR: Object.freeze([...relatedADR]),
    relatedConstitutionPrinciple: Object.freeze([...relatedConstitutionPrinciple]),
    recommendedAction,
    auditEventRequired,
    userFacingMessageAllowed,
  });
}

export function createPass(validatorId, reason, details = {}) {
  return createValidationResult({
    validatorId,
    status: VALIDATOR_STATUSES.PASS,
    reason,
    recommendedAction: 'pass',
    ...details,
  });
}

export function createFail(validatorId, reason, details = {}) {
  return createValidationResult({
    validatorId,
    status: VALIDATOR_STATUSES.FAIL,
    reason,
    recommendedAction: 'fix_input',
    auditEventRequired: true,
    ...details,
  });
}

export function createBlock(validatorId, reason, details = {}) {
  return createValidationResult({
    validatorId,
    status: VALIDATOR_STATUSES.BLOCK,
    reason,
    recommendedAction: 'block_use',
    auditEventRequired: true,
    ...details,
  });
}

export function createDegrade(validatorId, reason, details = {}) {
  return createValidationResult({
    validatorId,
    status: VALIDATOR_STATUSES.DEGRADE,
    reason,
    recommendedAction: 'degrade_output',
    auditEventRequired: true,
    userFacingMessageAllowed: true,
    ...details,
  });
}

export function createNeedsReview(validatorId, reason, details = {}) {
  return createValidationResult({
    validatorId,
    status: VALIDATOR_STATUSES.NEEDS_REVIEW,
    reason,
    recommendedAction: 'request_review',
    auditEventRequired: true,
    ...details,
  });
}
