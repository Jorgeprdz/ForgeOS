import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = path => readFile(new URL(`../${path}`, import.meta.url), 'utf8');
const scopePath = 'docs/architecture/source-truth/FORGE_CARTERA_030A_POLICY_PAYMENT_CALENDAR_SCOPE_001.md';

test('030A is pinned to the final green 020C head and authorizes no mutation', async () => {
  const scope = await read(scopePath);

  assert.match(scope, /AUTHORIZED_PHASE=CARTERA_030A_POLICY_PAYMENT_CALENDAR_SCOPE/);
  assert.match(scope, /SOURCE_COMMIT=87c1fde90954b1ce7be37652bd103a4fe7544162/);
  assert.match(scope, /CANONICAL_ROADMAP_POINT=CARTERA_030_POLICY_AND_PAYMENT_CALENDAR/);
  assert.match(scope, /SCHEMA_MUTATION=NO/);
  assert.match(scope, /SUPABASE_REMOTE_MUTATION=NO/);
  assert.match(scope, /RUNTIME_MUTATION=NO/);
  assert.match(scope, /PRODUCT_UI_MUTATION=NO/);
  assert.match(scope, /ACCOUNT_MUTATION=NOT_AUTHORIZED/);
});

test('030A inherits a completed and remotely accepted 020C boundary', async () => {
  const scope = await read(scopePath);
  const closure = await read('docs/evidence/FORGE_CARTERA_020C_REMOTE_ACCEPTANCE_CLOSURE_001.md');

  assert.match(scope, /CARTERA_020C_REMOTE_ACCEPTANCE=PASS/);
  assert.match(scope, /CARTERA_020C_COMPLETE=YES/);
  assert.match(closure, /CARTERA_020C_REMOTE_ACCEPTANCE=PASS/);
  assert.match(closure, /CARTERA_020C_COMPLETE=YES/);
  assert.match(closure, /RESIDUAL_FIXTURES=0/);
});

test('030A reuses canonical Policy, payment evidence, PaymentEvent and Timeline foundations', async () => {
  const scope = await read(scopePath);
  const paths = [
    'supabase/migrations/20260731000200_cartera010b_identity_policy_foundation.sql',
    'policy-operations/evidence/payment-evidence-packet.js',
    'policy-operations/payment-event-engine.js',
    'payment-frequency-engine.js',
    'policy-operations/renewals/policy-renewal-engine.js',
    'platform/policy-intelligence/cartera-010c-policy-detail-timeline.js',
  ];

  for (const path of paths) {
    assert.ok(scope.includes(path), `missing reuse path ${path}`);
    await read(path);
  }
});

test('expected obligations, payment evidence, PaymentEvent and payout truth remain separate authorities', async () => {
  const scope = await read(scopePath);

  assert.match(scope, /An expected payment obligation is not a payment event/);
  assert.match(scope, /calendar entry is not operational truth/);
  assert.match(scope, /Only a confirmed PaymentEvent may fully or partially satisfy an obligation/);
  assert.match(scope, /PAYMENT_OBLIGATION_NOT_PAYMENT_EVENT=LOCKED/);
  assert.match(scope, /CALENDAR_IS_PROJECTION_NOT_TRUTH=LOCKED/);
  assert.match(scope, /COMPENSATION_AND_PAYOUT_TRUTH=FORBIDDEN/);
});

test('030B ledger fields and minimum lifecycle states are explicit', async () => {
  const scope = await read(scopePath);

  for (const field of [
    'obligationReference',
    'policyVersionReference | policyTermsDigest',
    'expectedDate | null',
    'expectedAmount | null',
    'matchedPaymentEventReferences[]',
    'supersedesObligationReference | null',
    'stateVersion',
  ]) {
    assert.ok(scope.includes(field), `missing obligation field ${field}`);
  }

  for (const state of [
    'SCHEDULED',
    'UPCOMING',
    'DETECTED',
    'CONFIRMATION_REQUIRED',
    'CONFIRMED',
    'PARTIAL',
    'OVERDUE',
    'NOT_FOUND',
    'CORRECTED',
    'CANCELLED',
  ]) {
    assert.ok(scope.includes(state), `missing obligation state ${state}`);
  }
});

test('recurrence rules fail closed and preserve unknown Policy facts', async () => {
  const scope = await read(scopePath);

  assert.match(scope, /unknown frequency creates no guessed recurrence/);
  assert.match(scope, /unknown anchor date creates no guessed due date/);
  assert.match(scope, /expectedAmount=null/);
  assert.match(scope, /unknown currency remains null/);
  assert.match(scope, /single premium creates at most one expected payment obligation/);
  assert.match(scope, /month-end anchors use one documented deterministic rule/);
  assert.match(scope, /leap-day anchors use one documented deterministic rule/);
});

test('matching, replay and correction are explicit and cannot silently overwrite history', async () => {
  const scope = await read(scopePath);

  for (const outcome of ['MATCHED', 'PARTIAL_MATCH', 'AMBIGUOUS', 'NO_MATCH', 'CONFLICT']) {
    assert.ok(scope.includes(outcome), `missing payment match outcome ${outcome}`);
  }

  assert.match(scope, /identical generation replay is idempotent/);
  assert.match(scope, /changed Policy terms do not overwrite an accepted obligation silently/);
  assert.match(scope, /historical obligations remain auditable/);
  assert.match(scope, /optimistic state version/);
  assert.match(scope, /CORRECTION_AND_REPLAY_BOUNDARY=LOCKED/);
});

test('calendar horizons and contractual provenance are locked', async () => {
  const scope = await read(scopePath);

  for (const horizon of ['TODAY', 'NEXT_7_DAYS', 'NEXT_30_DAYS', 'NEXT_90_DAYS', 'OVERDUE']) {
    assert.ok(scope.includes(horizon), `missing calendar horizon ${horizon}`);
  }

  assert.match(scope, /whether the date is contractual, derived or recommended/);
  assert.match(scope, /GRACE_PERIOD=UNKNOWN/);
  assert.match(scope, /GRACE_PERIOD_RULE_PROVENANCE=LOCKED/);
});

test('privacy and external-effect gates remain locked', async () => {
  const scope = await read(scopePath);

  assert.match(scope, /BENEFICIARY_PRIVACY_BOUNDARY=LOCKED/);
  assert.match(scope, /PAYMENT_INSTRUMENT_DATA_PROJECTION=FORBIDDEN/);
  assert.match(scope, /CROSS_ADVISOR_ACCESS=FORBIDDEN/);
  assert.match(scope, /create Google Calendar events or mutate an external calendar/);
  assert.match(scope, /create compensation, commission, payout, revenue or bank truth/);
  assert.match(scope, /mutate Person, Account, Policy or PolicyRole directly/);
  assert.match(scope, /execute remote Supabase mutation/);
});

test('030B path roots, tests and exact next phase are locked', async () => {
  const scope = await read(scopePath);

  assert.match(scope, /policy-operations\/calendar\/\*\*/);
  assert.match(scope, /policy-operations\/payments\/\*\*/);
  assert.match(scope, /platform\/policy-intelligence\/calendar\/\*\*/);
  assert.match(scope, /supabase\/migrations\/\*cartera030b\*\.sql/);
  assert.match(scope, /030B_ALLOWED_PATH_ROOTS=LOCKED/);
  assert.match(scope, /030B_REQUIRED_TESTS=LOCKED/);
  assert.match(scope, /CARTERA_030A_COMPLETE=YES/);
  assert.match(scope, /NEXT=CARTERA_030B_EXPECTED_PAYMENT_OBLIGATION_LEDGER_AND_POLICY_CALENDAR/);
});