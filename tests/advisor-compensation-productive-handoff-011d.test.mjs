import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const {
  DEFAULT_RULE_PACK,
  canonicalCommand,
  handoffReceipt,
  policyContext,
  createAdvisorCompensationProductiveHandoff011d,
} = require('../compensation/advisor/orchestration/advisor-compensation-productive-handoff-011d.cjs');
const { createAdvisorCompensationPaymentIntakeService } = require('../compensation/advisor/payment/advisor-compensation-payment-intake-service.js');
const { calculateAdvisorCommission } = require('../compensation/advisor/engine/advisor-commission-engine.js');
const { createAdvisorCompensationEventAuthority } = require('../compensation/advisor/events/advisor-compensation-event-authority.js');
const { materializeAdvisorCompensationProductReadModel } = require('../compensation/advisor/materialization/advisor-compensation-product-read-model-materializer.js');

const ADVISOR = '11111111-1111-4111-8111-111111111111';
const OTHER = '22222222-2222-4222-8222-222222222222';
const NOW = '2026-08-10T18:00:00.000Z';

function context(overrides = {}) {
  const base = {
    state: 'ACCEPTED',
    advisorId: ADVISOR,
    paymentEventReference: `PAYMENT_EVENT:${'a'.repeat(64)}`,
    payment: {
      confirmationState: 'CONFIRMED',
      paymentEvidenceReference: 'evidence-011d-1',
      paymentAmount: 10000,
      currency: 'MXN',
      paymentDate: '2026-08-01',
      periodCoveredStart: null,
      periodCoveredEnd: null,
      paymentSource: 'manual_capture',
      evidenceReferences: ['evidence-011d-1', 'OBLIGATION:obligation-011d-1'],
      eventDigest: 'b'.repeat(64),
      idempotencyKey: 'AURA011C:obligation-011d-1:evidence-011d-1',
      confirmedBy: ADVISOR,
      confirmedAt: NOW,
    },
    canonicalConfirmationReceipt: {
      decisionId: `CARTERA030C:PAYMENT_EVENT:${'a'.repeat(64)}`,
      actorId: ADVISOR,
      decidedAt: NOW,
      reason: 'canonical_cartera030c_confirmed_payment',
      evidenceHash: 'b'.repeat(64),
      authorizationBasis: 'human_decision_receipt',
    },
    policy: {
      policyReference: 'policy-011d-1',
      productReference: 'SMNYL_ORVI',
      paymentFrequency: 'MENSUAL',
      currency: 'MXN',
      annualPremium: 120000,
    },
    obligation: {
      obligationReference: 'obligation-011d-1',
      policyYear: 1,
      policyTermsDigest: 'c'.repeat(64),
    },
    personReference: 'person-011d-1',
    lifecycle: null,
  };
  return {
    ...base,
    ...overrides,
    payment: { ...base.payment, ...(overrides.payment || {}) },
    policy: { ...base.policy, ...(overrides.policy || {}) },
    obligation: { ...base.obligation, ...(overrides.obligation || {}) },
    canonicalConfirmationReceipt: { ...base.canonicalConfirmationReceipt, ...(overrides.canonicalConfirmationReceipt || {}) },
  };
}

function stage030Event(input = context()) {
  const command = canonicalCommand(input);
  const receipt = handoffReceipt(command);
  const service = createAdvisorCompensationPaymentIntakeService({ productIdentities: DEFAULT_RULE_PACK.productIdentities });
  const result = service.intakeConfirmedPayment({ command, handoffReceipt: receipt, policyContext: policyContext(input) });
  assert.equal(result.intakeStatus, 'ACCEPTED');
  return result.event;
}

const paymentEvent = stage030Event();

// CP5.1 valid canonical confirmed payment is accepted through existing Stage 080 + Stage 030.
assert.equal(paymentEvent.truthClass, 'CONFIRMED_PAYMENT');
assert.equal(paymentEvent.references.advisorReference, ADVISOR);
assert.equal(paymentEvent.safeguards.payoutTruth, false);

// CP5.2 unconfirmed payment is rejected by existing Stage 080 contract.
assert.throws(() => {
  const command = { ...canonicalCommand(context()), confirmationState: 'pending' };
  createAdvisorCompensationPaymentIntakeService({ productIdentities: DEFAULT_RULE_PACK.productIdentities })
    .intakeConfirmedPayment({ command, handoffReceipt: handoffReceipt(command), policyContext: policyContext(context()) });
}, /PAYMENT_NOT_CONFIRMED/);

// CP5.6 missing governed rule input stays BLOCKED with no authoritative zero.
const noRule = calculateAdvisorCommission({
  paymentEvent,
  rulePack: null,
  calculationContext: { annualPremium: 120000, paymentFrequency: 'MENSUAL', advisorMonth: 13 },
  calculatedAt: NOW,
});
assert.equal(noRule.status, 'BLOCKED');
assert.equal(noRule.reason, 'rule_pack_required');
assert.equal(noRule.amounts, null);

// CP5.7 engine and productive orchestration both block missing advisor month.
const noMonthEngine = calculateAdvisorCommission({
  paymentEvent,
  rulePack: DEFAULT_RULE_PACK,
  calculationContext: { annualPremium: 120000, paymentFrequency: 'MENSUAL', advisorMonth: null },
  calculatedAt: NOW,
});
assert.equal(noMonthEngine.status, 'BLOCKED');
assert.equal(noMonthEngine.reason, 'advisor_month_required');
assert.equal(noMonthEngine.amounts, null);

const noWritePersistence = {
  commitCompensation: async () => { throw new Error('SHOULD_NOT_COMMIT'); },
  loadMaterializationInputs: async () => { throw new Error('SHOULD_NOT_MATERIALIZE'); },
  appendReadModel: async () => { throw new Error('SHOULD_NOT_MATERIALIZE'); },
};
const monthBlocked = await createAdvisorCompensationProductiveHandoff011d({
  persistence: noWritePersistence,
  resolveCareerClock: () => ({ state: 'blocked', careerMonth: null, reason: 'blocked_by_missing_connection_date', blockedIsZero: false }),
  now: () => NOW,
}).execute({ advisorId: ADVISOR, context: context() });
assert.equal(monthBlocked.state, 'BLOCKED');
assert.equal(monthBlocked.reason, 'ADVISOR_MONTH_AUTHORITY_UNAVAILABLE');
assert.equal(monthBlocked.amount, null);
assert.equal(monthBlocked.gate.LEDGER_STATE, 'NOT_RUN');
assert.equal(monthBlocked.gate.IDEMPOTENCY_STATE, 'RETRY_SAFE');

// CP5.4 owner mismatch is rejected before any economic write.
const ownerMismatch = await createAdvisorCompensationProductiveHandoff011d({
  persistence: noWritePersistence,
  resolveCareerClock: () => ({ state: 'blocked', careerMonth: null }),
}).execute({ advisorId: OTHER, context: context() });
assert.equal(ownerMismatch.state, 'FAILED');
assert.equal(ownerMismatch.reason, 'OWNER_MISMATCH');

// CP5.5 missing auth is rejected before any economic write.
const authMissing = await createAdvisorCompensationProductiveHandoff011d({
  persistence: noWritePersistence,
  resolveCareerClock: () => ({ state: 'blocked', careerMonth: null }),
}).execute({ advisorId: null, context: context() });
assert.equal(authMissing.state, 'FAILED');
assert.equal(authMissing.reason, 'AUTH_REQUIRED');

// CP5.8 valid canonical inputs execute the existing Stage 040 engine.
const calculation = calculateAdvisorCommission({
  paymentEvent,
  rulePack: DEFAULT_RULE_PACK,
  calculationContext: { annualPremium: 120000, paymentFrequency: 'MENSUAL', advisorMonth: 13, asOf: '2026-08-01' },
  calculatedAt: NOW,
});
assert.equal(calculation.status, 'CALCULATED');
assert.equal(calculation.truthState, 'ESTIMATED');
assert.ok(Number.isFinite(calculation.amounts.commissionAmount));

// CP5.9 candidate rule never becomes EARNED merely because premium payment is confirmed.
assert.equal(DEFAULT_RULE_PACK.metadata.governanceStatus, 'candidate');
assert.equal(calculation.eligibleForEarnedPromotion, false);
assert.equal(calculation.safeguards.payoutTruth, false);

// CP5.10/11 Stage 050 canonical authority constructs ESTIMATED, never PAID.
const event = createAdvisorCompensationEventAuthority().recordEstimated({
  calculation,
  advisorReference: ADVISOR,
  periodKey: '2026-08',
  idempotencyKey: `011D:${context().paymentEventReference}:${calculation.calculationDigest}`,
  correlationId: context().paymentEventReference,
  createdAt: NOW,
  evidenceReferences: paymentEvent.evidence.evidenceReferences,
}).event;
assert.equal(event.state, 'ESTIMATED');
assert.notEqual(event.state, 'PAID');
assert.equal(event.safeguards.payoutTruth, false);

// CP7 existing materializer consumes canonical events and preserves unknown paid truth as null.
const materialization = materializeAdvisorCompensationProductReadModel({
  advisorReference: ADVISOR,
  periodKey: '2026-08',
  periodKeys: ['2026-08'],
  eventRows: [{ payload: event }],
  payoutRows: [],
  payoutSourceState: 'DISCONNECTED',
  forwardSignals: [],
  forwardSignalSourceState: 'DISCONNECTED',
  currency: 'MXN',
  capturedAt: NOW,
});
assert.equal(materialization.safeguards.unknownAsZero, false);
assert.equal(materialization.snapshotPayload.amounts.paid.value, null);
assert.equal(materialization.snapshotPayload.amounts.paid.sourceState, 'DISCONNECTED');
assert.match(materialization.snapshotDigest, /^[a-f0-9]{64}$/);
assert.match(materialization.historyDigest, /^[a-f0-9]{64}$/);

// Productive orchestrator refuses to promote current candidate Rule Pack.
const candidateBlocked = await createAdvisorCompensationProductiveHandoff011d({
  persistence: noWritePersistence,
  resolveCareerClock: () => ({ state: 'resolved', careerMonth: 13, reason: 'test_governed_clock' }),
  now: () => NOW,
}).execute({ advisorId: ADVISOR, context: context() });
assert.equal(candidateBlocked.state, 'BLOCKED');
assert.equal(candidateBlocked.reason, 'OFFICIAL_RULE_PACK_UNAVAILABLE');
assert.equal(candidateBlocked.amount, null);
assert.equal(candidateBlocked.gate.LEDGER_STATE, 'NOT_RUN');

// Static productive security/atomicity contract.
const sqlBase = fs.readFileSync(path.join(ROOT, 'supabase/migrations/20260810000110_advisor_compensation_productive_handoff_011d.sql'), 'utf8');
const sqlRoleFix = fs.readFileSync(path.join(ROOT, 'supabase/migrations/20260810000111_advisor_compensation_handoff_context_role_fix_011d.sql'), 'utf8');
const sqlAtomic = fs.readFileSync(path.join(ROOT, 'supabase/migrations/20260810000112_advisor_compensation_atomic_commit_011d.sql'), 'utf8');
const edge = fs.readFileSync(path.join(ROOT, 'supabase/functions/advisor-compensation-handoff/index.ts'), 'utf8');
const aura = fs.readFileSync(path.join(ROOT, 'docs/static-preview/forge-aura/cartera/cartera-compensation-handoff-aura-011d.js'), 'utf8');
const index = fs.readFileSync(path.join(ROOT, 'docs/static-preview/forge-aura/index.html'), 'utf8');

// CP5.3 malformed public reference is rejected at server boundary.
assert.match(edge, /PAYMENT_REFERENCE_INVALID/);
assert.match(edge, /const REF = \/\^\[A-Za-z0-9\]/);

// CP6 atomic first-call/replay/conflict/concurrency posture.
assert.match(sqlAtomic, /forge_advisor_compensation_commit_event_011d/);
assert.match(sqlAtomic, /pg_advisory_xact_lock/g);
assert.match(sqlAtomic, /'state','CREATED'/);
assert.match(sqlAtomic, /'state','REPLAYED'/);
assert.match(sqlAtomic, /'state','CONFLICT'/);
assert.match(sqlBase, /before update or delete on public\.advisor_compensation_payment_intake_ledger/i);
assert.match(sqlAtomic, /revoke all on function public\.forge_advisor_compensation_commit_event_011d\(uuid,jsonb,jsonb\)[\s\S]*from public, anon, authenticated/i);
assert.match(sqlAtomic, /grant execute on function public\.forge_advisor_compensation_commit_event_011d\(uuid,jsonb,jsonb\)[\s\S]*to service_role/i);
assert.match(sqlAtomic, /p_payment_event #>> '\{references,advisorReference\}'/);
assert.match(sqlAtomic, /p_compensation_event ->> 'advisorReference'/);

// No payout ledger mutation is introduced by 011D.
const all011dSql = `${sqlBase}\n${sqlRoleFix}\n${sqlAtomic}`;
assert.doesNotMatch(all011dSql, /insert\s+into\s+public\.advisor_compensation_payout_/i);
assert.doesNotMatch(all011dSql, /update\s+public\.advisor_compensation_payout_/i);
assert.doesNotMatch(all011dSql, /delete\s+from\s+public\.advisor_compensation_payout_/i);

// Canonical PolicyRole vocabulary, no invented role names in final forward correction.
assert.match(sqlRoleFix, /when 'POLICY_OWNER' then 1/);
assert.match(sqlRoleFix, /when 'INSURED' then 2/);
assert.match(sqlRoleFix, /when 'PAYOR' then 3/);

// Edge input is minimal and server service-role never ships to Aura.
assert.match(edge, /body\?\.paymentEventReference/);
assert.doesNotMatch(aura, /SERVICE_ROLE/i);
assert.doesNotMatch(aura, /advisor_compensation_event_ledger/);
assert.doesNotMatch(aura, /\.from\(/);
assert.match(aura, /client\.functions\.invoke\(FUNCTION_NAME/);
assert.match(aura, /body: \{ paymentEventReference: reference \}/);

// Aura preserves 011C payment semantics and shows only governed handoff outcomes, never an amount.
assert.match(aura, /Pago confirmado\.<\/strong><br>Compensación actualizada\./);
assert.match(aura, /La compensación requiere información adicional\./);
assert.match(aura, /No fue posible actualizar la compensación en este momento\./);
assert.match(aura, /directCommissionAmountRendered: false/);
assert.match(index, /cartera-compensation-handoff-aura-011d\.js/);

// CP11 Watch Tower contract is deterministic and fail-closed flags remain false.
for (const field of [
  'FORGE_ADVISOR_COMPENSATION_PRODUCTIVE_GATE', 'AUTH_STATE', 'PAYMENT_AUTHORITY_STATE',
  'HANDOFF_STATE', 'STAGE_030_STATE', 'STAGE_040_STATE', 'STAGE_050_STATE',
  'LEDGER_STATE', 'MATERIALIZATION_STATE', 'INCOME_READ_STATE', 'IDEMPOTENCY_STATE',
  'DEMO_FALLBACK_USED', 'SYNTHETIC_WRITER_USED', 'UNKNOWN_COERCION_USED',
]) assert.match(`${edge}\n${aura}`, new RegExp(field));

console.log('FORGE_ADVISOR_COMPENSATION_011D_TESTS=PASS');
console.log('CHECKPOINT_5_DOMAIN=PASS');
console.log('CHECKPOINT_6_LEDGER_IDEMPOTENCY_CONTRACT=PASS');
console.log('CHECKPOINT_7_READ_MODEL=PASS');
console.log('CHECKPOINT_11_WATCH_TOWER_CONTRACT=PASS');
console.log('PRODUCTIVE_SERVER_ACCEPTANCE=NOT_CLAIMED');
