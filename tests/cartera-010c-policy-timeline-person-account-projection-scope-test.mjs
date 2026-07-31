import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import {
  POLICY_DOMAIN_EVENT_CONTRACT,
  assertPolicyDomainEvent,
  validatePolicyDomainEvent,
} from '../platform/event-evidence/policy-domain-event-contract.js';

const scope = readFileSync(
  'docs/architecture/source-truth/FORGE_CARTERA_010C_POLICY_TIMELINE_PERSON_ACCOUNT_PROJECTION_SCOPE_001.md',
  'utf8',
);
const legacyCartera = readFileSync('cartera.js', 'utf8');

function validPolicyEvent(overrides = {}) {
  return {
    contractType: 'FORGE_POLICY_DOMAIN_EVENT',
    contractVersion: 'CARTERA-010C.1',
    eventId: 'event:policy:confirmed:001',
    subjectType: 'POLICY',
    subjectReference: 'POLICY:001',
    eventType: 'POLICY_CONFIRMED',
    occurredAt: '2026-07-31T14:30:00.000Z',
    actorReference: '00000000-0000-0000-0000-000000000001',
    evidenceReferences: ['POLICY_EVIDENCE_VERSION:001'],
    payload: {
      policyReference: 'POLICY:001',
      statusValue: 'ACTIVE',
    },
    ...overrides,
  };
}

test('010C source and productive boundaries are pinned to accepted 010B', () => {
  assert.match(scope, /SOURCE_COMMIT=73e1726f6f0ebf5f025e0dc197275503984a2705/);
  assert.match(scope, /CARTERA_010C_POLICY_TIMELINE_PERSON_ACCOUNT_PROJECTION/);
  assert.match(scope, /PRODUCT_UI_MUTATION=NO/);
  assert.match(scope, /SUPABASE_REMOTE_MUTATION=NO/);
  assert.match(scope, /NEXT=CARTERA_010C_CANONICAL_READ_MODEL_AND_ROUTE_ADAPTER/);
});

test('scope classifies the actual legacy Cartera authority instead of inventing a replacement', () => {
  assert.match(legacyCartera, /legacy\/quarantine\/crmaddlife-indexeddb\/db\.js/);
  assert.match(legacyCartera, /DB\.obtenerTodos\(\s*'cartera'/);
  assert.match(legacyCartera, /data-delete/);
  assert.match(legacyCartera, /btn-new-policy/);
  assert.match(legacyCartera, /btn-import-excel/);
  assert.match(scope, /LEGACY_STORAGE=legacy\/quarantine\/crmaddlife-indexeddb\/db\.js/);
  assert.match(scope, /NEW_POLICY_DIRECT_WRITE=FORBIDDEN/);
  assert.match(scope, /DELETE_POLICY=FORBIDDEN/);
});

test('Policy domain contract exposes only the four reserved subjects', () => {
  assert.deepEqual(POLICY_DOMAIN_EVENT_CONTRACT.subjects, [
    'POLICY',
    'POLICY_ROLE',
    'POLICY_EVIDENCE_VERSION',
    'POLICY_IDENTITY_DECISION',
  ]);
});

test('a minimized confirmed Policy event is accepted and frozen', () => {
  const candidate = validPolicyEvent();
  const result = validatePolicyDomainEvent(candidate);
  assert.equal(result.ok, true, result.errors.join(','));
  const accepted = assertPolicyDomainEvent(candidate);
  assert.equal(Object.isFrozen(accepted), true);
  assert.equal(accepted.payload.policyReference, 'POLICY:001');
});

test('event type must belong to its subject authority', () => {
  const result = validatePolicyDomainEvent(validPolicyEvent({
    subjectType: 'POLICY_ROLE',
    eventType: 'POLICY_CONFIRMED',
    subjectReference: 'POLICY_ROLE:001',
    payload: { policyRoleReference: 'POLICY_ROLE:001' },
  }));
  assert.equal(result.ok, false);
  assert.ok(result.errors.includes('EVENT_TYPE_INVALID_FOR_SUBJECT'));
});

test('timeline payload cannot copy financial Policy Truth', () => {
  const result = validatePolicyDomainEvent(validPolicyEvent({
    payload: {
      policyReference: 'POLICY:001',
      premiumAmount: 12000,
      currency: 'MXN',
      sumInsured: 1000000,
    },
  }));
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((error) => error.includes('premiumAmount')));
  assert.ok(result.errors.some((error) => error.includes('currency')));
  assert.ok(result.errors.some((error) => error.includes('sumInsured')));
});

test('beneficiary identity and evidence cannot leak into the general Policy Timeline', () => {
  const result = validatePolicyDomainEvent(validPolicyEvent({
    payload: {
      policyReference: 'POLICY:001',
      beneficiaries: [{ personReference: 'PERSON:PRIVATE' }],
      documentHash: 'a'.repeat(64),
    },
  }));
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((error) => error.includes('beneficiaries')));
  assert.ok(result.errors.some((error) => error.includes('documentHash')));
});

test('unknown fields and duplicate evidence fail closed', () => {
  const result = validatePolicyDomainEvent(validPolicyEvent({
    unexpectedAuthority: true,
    evidenceReferences: ['EVIDENCE:001', 'EVIDENCE:001'],
  }));
  assert.equal(result.ok, false);
  assert.ok(result.errors.includes('UNKNOWN_TOP_LEVEL_KEY:unexpectedAuthority'));
  assert.ok(result.errors.includes('EVIDENCE_REFERENCES_DUPLICATED'));
});

test('correction events preserve explicit lineage', () => {
  const result = validatePolicyDomainEvent(validPolicyEvent({
    eventId: 'event:policy:version:002',
    eventType: 'POLICY_VERSION_CONFIRMED',
    correctionOf: 'event:policy:version:001',
    payload: {
      policyReference: 'POLICY:001',
      policyVersionReference: 'POLICY_VERSION:002',
      previousReference: 'POLICY_VERSION:001',
      currentReference: 'POLICY_VERSION:002',
    },
  }));
  assert.equal(result.ok, true, result.errors.join(','));
});

test('010C explicitly separates route adaptation from redesign and automation', () => {
  assert.match(scope, /Material 3 redesign of Cartera/);
  assert.match(scope, /OCR worker or parser implementation/);
  assert.match(scope, /renewal calculations or renewal calendar/);
  assert.match(scope, /automatic Policy creation/);
  assert.match(scope, /mobile content reserves safe scroll space above the floating nav pill/);
});
