const CONTRACT_TYPE = 'FORGE_POLICY_DOMAIN_EVENT';
const CONTRACT_VERSION = 'CARTERA-010C.1';
const REFERENCE_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,239}$/;

export const POLICY_DOMAIN_SUBJECTS = Object.freeze([
  'POLICY',
  'POLICY_ROLE',
  'POLICY_EVIDENCE_VERSION',
  'POLICY_IDENTITY_DECISION',
]);

export const POLICY_DOMAIN_EVENT_TYPES = Object.freeze({
  POLICY: Object.freeze([
    'POLICY_CONFIRMED',
    'POLICY_VERSION_CONFIRMED',
    'POLICY_CONFLICT_RECORDED',
  ]),
  POLICY_ROLE: Object.freeze([
    'POLICY_ROLE_CONFIRMED',
    'POLICY_ROLE_SUPERSEDED',
  ]),
  POLICY_EVIDENCE_VERSION: Object.freeze([
    'POLICY_EVIDENCE_CONFIRMED',
  ]),
  POLICY_IDENTITY_DECISION: Object.freeze([
    'POLICY_IDENTITY_LINK_CONFIRMED',
    'POLICY_IDENTITY_LINK_CORRECTED',
    'POLICY_IDENTITY_UNRESOLVED',
  ]),
});

const TOP_LEVEL_KEYS = new Set([
  'contractType',
  'contractVersion',
  'eventId',
  'subjectType',
  'subjectReference',
  'eventType',
  'occurredAt',
  'actorReference',
  'evidenceReferences',
  'payload',
  'correctionOf',
]);

const ALLOWED_PAYLOAD_KEYS = new Set([
  'policyReference',
  'policyVersionReference',
  'policyRoleReference',
  'evidenceVersionReference',
  'decisionReference',
  'personReference',
  'accountReference',
  'conflictReference',
  'statusValue',
  'roleType',
  'confirmationState',
  'sourceDomain',
  'sourceIdentityType',
  'sourceRecordReference',
  'previousReference',
  'currentReference',
]);

const FORBIDDEN_PAYLOAD_KEYS = new Set([
  'premium',
  'premiumAmount',
  'sumInsured',
  'currency',
  'paymentFrequency',
  'policyNumber',
  'beneficiary',
  'beneficiaries',
  'evidenceReferences',
  'fieldClaims',
  'provenance',
  'documentHash',
  'rawPayload',
  'rawDocument',
  'clientId',
]);

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function isTimestamp(value) {
  return typeof value === 'string' && Number.isFinite(Date.parse(value));
}

function isReference(value) {
  return typeof value === 'string' && REFERENCE_PATTERN.test(value);
}

function collectNestedKeys(value, keys = []) {
  if (Array.isArray(value)) {
    for (const item of value) collectNestedKeys(item, keys);
    return keys;
  }
  if (!isPlainObject(value)) return keys;
  for (const [key, child] of Object.entries(value)) {
    keys.push(key);
    collectNestedKeys(child, keys);
  }
  return keys;
}

export function validatePolicyDomainEvent(candidate) {
  const errors = [];

  if (!isPlainObject(candidate)) {
    return Object.freeze({ ok: false, errors: Object.freeze(['EVENT_OBJECT_REQUIRED']) });
  }

  for (const key of Object.keys(candidate)) {
    if (!TOP_LEVEL_KEYS.has(key)) errors.push(`UNKNOWN_TOP_LEVEL_KEY:${key}`);
  }

  if (candidate.contractType !== CONTRACT_TYPE) errors.push('CONTRACT_TYPE_INVALID');
  if (candidate.contractVersion !== CONTRACT_VERSION) errors.push('CONTRACT_VERSION_INVALID');
  if (!isReference(candidate.eventId)) errors.push('EVENT_ID_INVALID');
  if (!POLICY_DOMAIN_SUBJECTS.includes(candidate.subjectType)) errors.push('SUBJECT_TYPE_INVALID');
  if (!isReference(candidate.subjectReference)) errors.push('SUBJECT_REFERENCE_INVALID');
  if (!isTimestamp(candidate.occurredAt)) errors.push('OCCURRED_AT_INVALID');
  if (!isReference(candidate.actorReference)) errors.push('ACTOR_REFERENCE_INVALID');

  const allowedTypes = POLICY_DOMAIN_EVENT_TYPES[candidate.subjectType] ?? [];
  if (!allowedTypes.includes(candidate.eventType)) errors.push('EVENT_TYPE_INVALID_FOR_SUBJECT');

  if (!Array.isArray(candidate.evidenceReferences) || candidate.evidenceReferences.length < 1) {
    errors.push('EVIDENCE_REFERENCES_REQUIRED');
  } else {
    const unique = new Set(candidate.evidenceReferences);
    if (unique.size !== candidate.evidenceReferences.length) errors.push('EVIDENCE_REFERENCES_DUPLICATED');
    for (const reference of candidate.evidenceReferences) {
      if (!isReference(reference)) errors.push('EVIDENCE_REFERENCE_INVALID');
    }
  }

  if (!isPlainObject(candidate.payload)) {
    errors.push('PAYLOAD_OBJECT_REQUIRED');
  } else {
    for (const key of Object.keys(candidate.payload)) {
      if (!ALLOWED_PAYLOAD_KEYS.has(key)) errors.push(`PAYLOAD_KEY_NOT_ALLOWED:${key}`);
    }
    for (const key of collectNestedKeys(candidate.payload)) {
      if (FORBIDDEN_PAYLOAD_KEYS.has(key)) errors.push(`POLICY_TRUTH_LEAK_FORBIDDEN:${key}`);
    }
    const references = [
      'policyReference',
      'policyVersionReference',
      'policyRoleReference',
      'evidenceVersionReference',
      'decisionReference',
      'personReference',
      'accountReference',
      'conflictReference',
    ].filter((key) => candidate.payload[key] != null);
    if (references.length < 1) errors.push('CANONICAL_REFERENCE_REQUIRED');
    for (const key of references) {
      if (!isReference(candidate.payload[key])) errors.push(`PAYLOAD_REFERENCE_INVALID:${key}`);
    }
  }

  if (candidate.correctionOf != null && !isReference(candidate.correctionOf)) {
    errors.push('CORRECTION_REFERENCE_INVALID');
  }

  return Object.freeze({
    ok: errors.length === 0,
    errors: Object.freeze([...new Set(errors)]),
  });
}

export function assertPolicyDomainEvent(candidate) {
  const result = validatePolicyDomainEvent(candidate);
  if (!result.ok) {
    throw new TypeError(`CARTERA010C_POLICY_EVENT_INVALID:${result.errors.join('|')}`);
  }
  return Object.freeze(structuredClone(candidate));
}

export const POLICY_DOMAIN_EVENT_CONTRACT = Object.freeze({
  contractType: CONTRACT_TYPE,
  contractVersion: CONTRACT_VERSION,
  subjects: POLICY_DOMAIN_SUBJECTS,
  eventTypes: POLICY_DOMAIN_EVENT_TYPES,
});
