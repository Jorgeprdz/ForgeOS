import assert from 'node:assert/strict';

import {
  EVIDENCE_STATES,
  OWNER_TYPES,
  TRUTH_TYPES,
  validateEvidenceStateCompatibility,
  validateSourceOwnership,
  validateTruthEnvelopeRequiredFields,
  validateTruthTypeCompatibility,
} from '../../platform/truth/index.js';

const results = [];

function test(name, fn) {
  try {
    fn();
    results.push({ name, status: 'PASS' });
  } catch (error) {
    results.push({ name, status: 'FAIL', error: error.message });
  }
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function assertNotMutated(input, fn) {
  const before = JSON.stringify(input);
  fn();
  assert.equal(JSON.stringify(input), before, 'validator mutated input');
}

function validEnvelope(overrides = {}) {
  return {
    id: 'truth_env_001',
    truthType: TRUTH_TYPES.FACT,
    evidenceState: EVIDENCE_STATES.VALIDATED,
    value: { claim: 'validated operational fact' },
    source: { type: 'official_document', official: true },
    provenance: { official: true, reference: 'fixture-source' },
    owner: { type: OWNER_TYPES.OFFICIAL_DOCUMENT },
    createdAt: '2026-06-18T00:00:00.000Z',
    updatedAt: '2026-06-18T00:00:00.000Z',
    validationStatus: 'VALIDATED',
    allowedUses: ['display'],
    prohibitedUses: ['autonomous_decision'],
    visibilityScope: 'internal_only',
    mutationAuthority: 'none',
    aiInvolvement: { involved: false },
    auditTrail: [{ event: 'created', at: '2026-06-18T00:00:00.000Z' }],
    ...overrides,
  };
}

console.log('\nFORGE TRUTH VALIDATORS PHASE A TEST\n');

test('valid TruthEnvelope passes', () => {
  const result = validateTruthEnvelopeRequiredFields(validEnvelope());
  assert.equal(result.status, 'PASS');
});

test('missing required fields fails', () => {
  const envelope = validEnvelope();
  delete envelope.provenance;
  const result = validateTruthEnvelopeRequiredFields(envelope);
  assert.equal(result.status, 'FAIL');
  assert.match(result.reason, /provenance/);
});

test('unknown truthType fails', () => {
  const result = validateTruthTypeCompatibility(validEnvelope({ truthType: 'NOT_A_TRUTH_TYPE' }));
  assert.equal(result.status, 'FAIL');
});

test('unknown evidenceState fails', () => {
  const result = validateEvidenceStateCompatibility(validEnvelope({ evidenceState: 'NOT_A_STATE' }));
  assert.equal(result.status, 'FAIL');
});

test('unknown ownerType fails', () => {
  const result = validateSourceOwnership(validEnvelope({ owner: { type: 'not_an_owner' } }));
  assert.equal(result.status, 'FAIL');
});

test('FACT with UNVERIFIED blocks', () => {
  const envelope = validEnvelope({ truthType: TRUTH_TYPES.FACT, evidenceState: EVIDENCE_STATES.UNVERIFIED });
  assert.equal(validateTruthTypeCompatibility(envelope).status, 'BLOCK');
  assert.equal(validateEvidenceStateCompatibility(envelope).status, 'BLOCK');
});

test('FACT with VALIDATED passes', () => {
  const envelope = validEnvelope({ truthType: TRUTH_TYPES.FACT, evidenceState: EVIDENCE_STATES.VALIDATED });
  assert.equal(validateTruthTypeCompatibility(envelope).status, 'PASS');
});

test('SOURCE_TRUTH with unofficial source blocks', () => {
  const envelope = validEnvelope({
    truthType: TRUTH_TYPES.SOURCE_TRUTH,
    evidenceState: EVIDENCE_STATES.VALIDATED,
    source: { type: 'user_input', official: false },
    provenance: { official: false },
    owner: { type: OWNER_TYPES.USER_INPUT },
    validationStatus: 'VALIDATED',
  });
  assert.equal(validateTruthTypeCompatibility(envelope).status, 'BLOCK');
});

test('AI_INTERPRETATION as FACT blocks', () => {
  const envelope = validEnvelope({ truthType: TRUTH_TYPES.AI_INTERPRETATION });
  const result = validateTruthTypeCompatibility(envelope, { targetTruthType: TRUTH_TYPES.FACT });
  assert.equal(result.status, 'BLOCK');
});

test('FORECAST as FACT blocks', () => {
  const envelope = validEnvelope({ truthType: TRUTH_TYPES.FORECAST });
  const result = validateTruthTypeCompatibility(envelope, { targetTruthType: TRUTH_TYPES.FACT });
  assert.equal(result.status, 'BLOCK');
});

test('ASSUMPTION as FACT blocks', () => {
  const envelope = validEnvelope({ truthType: TRUTH_TYPES.ASSUMPTION });
  const result = validateTruthTypeCompatibility(envelope, { targetTruthType: TRUTH_TYPES.FACT });
  assert.equal(result.status, 'BLOCK');
});

test('EXTRACTED as SOURCE_TRUTH blocks', () => {
  const envelope = validEnvelope({
    truthType: TRUTH_TYPES.SOURCE_TRUTH,
    evidenceState: EVIDENCE_STATES.EXTRACTED,
  });
  assert.equal(validateEvidenceStateCompatibility(envelope).status, 'BLOCK');
});

test('UNKNOWN_OWNER as VALIDATED blocks', () => {
  const envelope = validEnvelope({
    truthType: TRUTH_TYPES.FACT,
    evidenceState: EVIDENCE_STATES.VALIDATED,
    owner: { type: OWNER_TYPES.UNKNOWN_OWNER },
  });
  assert.equal(validateSourceOwnership(envelope).status, 'BLOCK');
});

test('MANUAL_OVERRIDE without audit trail blocks', () => {
  const envelope = validEnvelope({
    truthType: TRUTH_TYPES.MANUAL_OVERRIDE,
    evidenceState: EVIDENCE_STATES.MANUAL,
    owner: { type: OWNER_TYPES.MANUAL_OVERRIDE },
    auditTrail: [],
    value: { manualOverride: { actor: 'advisor_001' } },
  });
  assert.equal(validateSourceOwnership(envelope).status, 'BLOCK');
});

test('OCR_output owning PRODUCT_TRUTH blocks', () => {
  const envelope = validEnvelope({
    truthType: TRUTH_TYPES.PRODUCT_TRUTH,
    owner: { type: OWNER_TYPES.OCR_OUTPUT },
  });
  assert.equal(validateSourceOwnership(envelope).status, 'BLOCK');
});

test('parser_output owning PRODUCT_TRUTH blocks', () => {
  const envelope = validEnvelope({
    truthType: TRUTH_TYPES.PRODUCT_TRUTH,
    owner: { type: OWNER_TYPES.PARSER_OUTPUT },
  });
  assert.equal(validateSourceOwnership(envelope).status, 'BLOCK');
});

test('AI_interpretation owning FACT blocks', () => {
  const envelope = validEnvelope({
    truthType: TRUTH_TYPES.FACT,
    owner: { type: OWNER_TYPES.AI_INTERPRETATION },
  });
  assert.equal(validateSourceOwnership(envelope).status, 'BLOCK');
});

test('hardcoded_value owner blocks', () => {
  const envelope = validEnvelope({
    truthType: TRUTH_TYPES.RULE,
    owner: { type: 'hardcoded_value' },
  });
  const result = validateSourceOwnership(envelope);
  assert.equal(result.status, 'BLOCK');
  assert.equal(result.blockedTransition, 'hardcoded_value -> ownerType');
});

test('validator output includes reason and validatorId', () => {
  const result = validateTruthEnvelopeRequiredFields(validEnvelope());
  assert.ok(result.validatorId);
  assert.ok(result.reason);
});

test('validators do not mutate input', () => {
  const envelope = validEnvelope();
  assertNotMutated(envelope, () => validateTruthEnvelopeRequiredFields(envelope));
  assertNotMutated(envelope, () => validateTruthTypeCompatibility(envelope));
  assertNotMutated(envelope, () => validateEvidenceStateCompatibility(envelope));
  assertNotMutated(envelope, () => validateSourceOwnership(envelope));
});

test('validators do not mutate cloned input snapshots', () => {
  const envelope = validEnvelope();
  const snapshot = clone(envelope);
  validateTruthTypeCompatibility(envelope);
  assert.deepEqual(envelope, snapshot);
});

for (const result of results) {
  console.log(`${result.status === 'PASS' ? 'PASS' : 'FAIL'} ${result.name}`);
  if (result.error) {
    console.log(`   ${result.error}`);
  }
}

const failed = results.filter((result) => result.status === 'FAIL');

console.log(`\nSummary: ${results.length} tests, ${results.length - failed.length} passed, ${failed.length} failed.`);

if (failed.length > 0) {
  process.exit(1);
}
