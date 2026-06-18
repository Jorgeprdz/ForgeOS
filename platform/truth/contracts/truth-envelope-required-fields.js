export const REQUIRED_TRUTH_ENVELOPE_FIELDS = Object.freeze([
  'id',
  'truthType',
  'evidenceState',
  'value',
  'source',
  'provenance',
  'owner',
  'createdAt',
  'updatedAt',
  'validationStatus',
  'allowedUses',
  'prohibitedUses',
  'visibilityScope',
  'mutationAuthority',
  'aiInvolvement',
  'auditTrail',
]);

export const REQUIRED_MANUAL_OVERRIDE_FIELDS = Object.freeze([
  'actor',
  'reason',
  'priorState',
  'newState',
  'timestamp',
]);
