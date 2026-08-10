import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const { orchestrateAdvisorCompensationHandoff } = require('../compensation/advisor/server/advisor-compensation-productive-orchestrator.js');
const { createAdvisorCompensationPaymentIntakeService } = require('../compensation/advisor/payment/advisor-compensation-payment-intake-service.js');
const { calculateAdvisorCommission } = require('../compensation/advisor/engine/advisor-commission-engine.js');
const { createAdvisorCompensationEventAuthority } = require('../compensation/advisor/events/advisor-compensation-event-authority.js');
const { materializeAdvisorCompensationProductReadModel } = require('../compensation/advisor/materialization/advisor-compensation-product-read-model-materializer.js');
const { buildAdvisorCompensationCandidateRulePack } = require('../compensation/advisor/rules/advisor-compensation-candidate-rule-pack-builder.js');
const candidateSeed = require('../compensation/advisor/rules/rule-data/smnyl-advisor-compensation-2026.candidate.rule-pack.json');

const CANDIDATE_RULE_PACK = buildAdvisorCompensationCandidateRulePack(candidateSeed);
const PRODUCT_IDENTITIES = CANDIDATE_RULE_PACK.productIdentities;
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
    policy: {
      policyReference: 'policy-011d-1',
      productReference: 'SMNYL_ORVI',
      premiumAmount: 120000,
      paymentFrequency: 'MENSUAL',
      currency: 'MXN',
    },
    obligation: {
      obligationReference: 'obligation-011d-1',
      policyYear: 1,
      policyTermsDigest: 'c'.repeat(64),
    },
    personReference: 'person-011d-1',
    reconciliation: {
      outcome: 'MATCHED',
      obligationReference: 'obligation-011d-1',
      reconciliationReference: 'reconciliation-011d-1',
      reconciliationDigest: 'd'.repeat(64),
      recordedAt: NOW,
    },
    lifecycle: null,
  };
  return {
    ...base,
    ...overrides,
    payment: { ...base.payment, ...(overrides.payment || {}) },
    policy: { ...base.policy, ...(overrides.policy || {}) },
    obligation: { ...base.obligation, ...(overrides.obligation || {}) },
    reconciliation: { ...base.reconciliation, ...(overrides.reconciliation || {}) },
  };
}

function canonicalStage030Payload(input = context()) {
  return {
    canonicalPaymentEvent: {
      advisorId: input.advisorId,
      paymentEventReference: input.paymentEventReference,
      confirmationState: input.payment.confirmationState,
      paymentEvidenceReference: input.payment.paymentEvidenceReference,
      paymentAmount: input.payment.paymentAmount,
      currency: input.payment.currency,
      paymentDate: input.payment.paymentDate,
      periodCoveredStart: input.payment.periodCoveredStart,
      periodCoveredEnd: input.payment.periodCoveredEnd,
      paymentSource: input.payment.paymentSource,
      evidenceReferences: input.payment.evidenceReferences,
      eventDigest: input.payment.eventDigest,
      idempotencyKey: input.payment.idempotencyKey,
      confirmedBy: input.payment.confirmedBy,
      confirmedAt: input.payment.confirmedAt,
    },
    canonicalReconciliation: input.reconciliation,
    canonicalPersonReference: input.personReference,
    policyContext: {
      policyReference: input.policy.policyReference,
      advisorReference: input.advisorId,
      productId: input.policy.productReference,
      variant: null,
      policyYear: input.obligation.policyYear,
      sourceAuthority: 'CARTERA_CANONICAL_POLICY_010B_030B',
      sourceSnapshotReference: input.obligation.policyTermsDigest,
    },
  };
}

function stage030Event(input = context()) {
  const service = createAdvisorCompensationPaymentIntakeService({ productIdentities: PRODUCT_IDENTITIES });
  const accepted = service.intakeConfirmedPayment(canonicalStage030Payload(input));
  assert.equal(accepted.intakeStatus, 'ACCEPTED');
  return accepted.event;
}

const paymentEvent = stage030Event();

// CP5.1 canonical 030C payment enters the existing Stage 080 adapter + Stage 030.
assert.equal(paymentEvent.truthClass, 'CONFIRMED_PAYMENT');
assert.equal(paymentEvent.references.advisorReference, ADVISOR);
assert.equal(paymentEvent.source.system, 'CARTERA_030C');
assert.equal(paymentEvent.source.authority, 'policy_payment_reconciliation_030c');
assert.equal(paymentEvent.safeguards.payoutTruth, false);

// CP5.2 unconfirmed canonical payment is rejected by Stage 080.
assert.throws(() => {
  createAdvisorCompensationPaymentIntakeService({ productIdentities: PRODUCT_IDENTITIES })
    .intakeConfirmedPayment(canonicalStage030Payload(context({ payment: { confirmationState: 'PENDING' } })));
}, /PAYMENT_NOT_CONFIRMED/);

// CP5.6 missing governed rule input stays BLOCKED and null, never authoritative zero.
const noRule = calculateAdvisorCommission({
  paymentEvent,
  rulePack: null,
  calculationContext: { annualPremium: 120000, paymentFrequency: 'MENSUAL', advisorMonth: 13 },
  calculatedAt: NOW,
});
assert.equal(noRule.status, 'BLOCKED');
assert.equal(noRule.reason, 'rule_pack_required');
assert.equal(noRule.amounts, null);

// CP5.7 Stage 040 engine blocks missing month; productive orchestrator reports exact gate.
const noMonthEngine = calculateAdvisorCommission({
  paymentEvent,
  rulePack: CANDIDATE_RULE_PACK,
  calculationContext: { annualPremium: 120000, paymentFrequency: 'MENSUAL', advisorMonth: null },
  calculatedAt: NOW,
});
assert.equal(noMonthEngine.status, 'BLOCKED');
assert.equal(noMonthEngine.reason, 'advisor_month_required');
assert.equal(noMonthEngine.amounts, null);

let claimCalls = 0;
let economicCommitCalls = 0;
const blockedPersistence = {
  claimIntake: async () => { claimCalls += 1; return { state: 'CREATED' }; },
  commitEconomicEvent: async () => { economicCommitCalls += 1; return { state: 'CREATED' }; },
  loadMaterializationInputs: async () => { throw new Error('SHOULD_NOT_MATERIALIZE'); },
  appendReadModel: async () => { throw new Error('SHOULD_NOT_MATERIALIZE'); },
  readIncome: async () => ({ state: 'NOT_MATERIALIZED' }),
};
const monthBlocked = await orchestrateAdvisorCompensationHandoff({
  canonicalContext: context(),
  productIdentities: PRODUCT_IDENTITIES,
  officialRulePack: null,
  advisorMonthResolution: null,
  calculationContext: {},
  claimIntake: blockedPersistence.claimIntake,
  commitEconomicEvent: blockedPersistence.commitEconomicEvent,
  loadMaterializationInputs: blockedPersistence.loadMaterializationInputs,
  appendReadModel: blockedPersistence.appendReadModel,
  readIncome: blockedPersistence.readIncome,
  clock: () => NOW,
});
assert.equal(monthBlocked.state, 'BLOCKED');
assert.equal(monthBlocked.reason, 'ADVISOR_MONTH_AUTHORITY_UNAVAILABLE');
assert.equal(monthBlocked.amount, null);
assert.equal(monthBlocked.diagnostics.STAGE_040_STATE, 'BLOCKED');
assert.equal(claimCalls, 1, 'Stage 030 intake may be durably claimed for retry safety');
assert.equal(economicCommitCalls, 0, 'No economic event may be committed while Stage 040 is blocked');

// CP5 current candidate/absent official rules never enter productive Stage 040.
const ruleBlocked = await orchestrateAdvisorCompensationHandoff({
  canonicalContext: context(),
  productIdentities: PRODUCT_IDENTITIES,
  officialRulePack: null,
  advisorMonthResolution: { state: 'resolved', careerMonth: 13 },
  calculationContext: {},
  claimIntake: async () => ({ state: 'REPLAYED' }),
  commitEconomicEvent: async () => { throw new Error('SHOULD_NOT_COMMIT'); },
  readIncome: async () => ({ state: 'NOT_MATERIALIZED' }),
  clock: () => NOW,
});
assert.equal(ruleBlocked.state, 'BLOCKED');
assert.equal(ruleBlocked.reason, 'OFFICIAL_RULE_SNAPSHOT_UNAVAILABLE');
assert.equal(ruleBlocked.amount, null);
assert.equal(ruleBlocked.diagnostics.STAGE_040_STATE, 'BLOCKED');

// CP5.8 valid canonical inputs execute the existing Stage 040 engine (candidate simulation only).
const calculation = calculateAdvisorCommission({
  paymentEvent,
  rulePack: CANDIDATE_RULE_PACK,
  calculationContext: { annualPremium: 120000, paymentFrequency: 'MENSUAL', advisorMonth: 13, asOf: '2026-08-01' },
  calculatedAt: NOW,
});
assert.equal(calculation.status, 'CALCULATED');
assert.equal(calculation.truthState, 'ESTIMATED');
assert.ok(Number.isFinite(calculation.amounts.commissionAmount));

// CP5.9 candidate rule never becomes EARNED from confirmed premium alone.
assert.equal(CANDIDATE_RULE_PACK.metadata.governanceStatus, 'candidate');
assert.equal(calculation.eligibleForEarnedPromotion, false);
assert.equal(calculation.safeguards.payoutTruth, false);

// CP5.10/11 existing Stage 050 records ESTIMATED and never PAID.
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

// CP7 existing materializer consumes canonical Stage 050 events and keeps unknown paid truth null.
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

// Static productive security/atomicity and public boundary contract.
const sqlBase = fs.readFileSync(path.join(ROOT, 'supabase/migrations/20260810000110_advisor_compensation_productive_handoff_011d.sql'), 'utf8');
const sqlHardening = fs.readFileSync(path.join(ROOT, 'supabase/migrations/20260810000111_advisor_compensation_handoff_context_hardening_011d.sql'), 'utf8');
const sqlAtomic = fs.readFileSync(path.join(ROOT, 'supabase/migrations/20260810000112_advisor_compensation_atomic_commit_011d.sql'), 'utf8');
const edge = fs.readFileSync(path.join(ROOT, 'supabase/functions/advisor-compensation-handoff/index.ts'), 'utf8');
const aura = fs.readFileSync(path.join(ROOT, 'docs/static-preview/forge-aura/cartera/cartera-compensation-handoff-aura-011d.js'), 'utf8');
const index = fs.readFileSync(path.join(ROOT, 'docs/static-preview/forge-aura/index.html'), 'utf8');
const stage080 = fs.readFileSync(path.join(ROOT, 'compensation/advisor/payment/cartera-080-confirmed-payment-consumer.js'), 'utf8');
const adapter = fs.readFileSync(path.join(ROOT, 'compensation/advisor/payment/advisor-compensation-payment-event-adapter.js'), 'utf8');
const serverOrchestrator = fs.readFileSync(path.join(ROOT, 'compensation/advisor/server/advisor-compensation-productive-orchestrator.js'), 'utf8');

// One productive orchestrator only; old duplicate was removed during reconciliation.
assert.equal(fs.existsSync(path.join(ROOT, 'compensation/advisor/orchestration/advisor-compensation-productive-handoff-011d.cjs')), false);
assert.match(serverOrchestrator, /orchestrateAdvisorCompensationHandoff/);

// CP5.3/4/5 server boundary handles malformed ref, missing auth and owner mismatch explicitly.
assert.match(edge, /PAYMENT_EVENT_REFERENCE_INVALID/);
assert.match(edge, /REFERENCE_PATTERN/);
assert.match(edge, /AUTH_REQUIRED/);
assert.match(edge, /AUTH_INVALID/);
assert.match(sqlHardening, /'state','OWNER_MISMATCH'/);
assert.match(sqlHardening, /'state','PAYMENT_NOT_CONFIRMED'/);
assert.match(sqlHardening, /'state','ACCEPTED'/);
assert.match(edge, /Deno\.serve/);

// Stage 080 canonical 030C adapter is the actual intake path, not a second payment authority.
assert.match(stage080, /consumeCartera030cCanonicalPayment/);
assert.match(adapter, /canonicalPaymentEvent/);
assert.match(adapter, /consumeCartera030cCanonicalPayment/);
assert.match(stage080, /sourceSystem: "CARTERA_030C"/);
assert.match(stage080, /sourceAuthority: CARTERA_080_PAYMENT_AUTHORITY/);
assert.match(stage080, /payoutTruth: false/);

// CP6 atomic first-call/replay/conflict/concurrency posture.
assert.match(sqlAtomic, /forge_advisor_compensation_commit_event_011d/);
assert.ok((sqlAtomic.match(/pg_advisory_xact_lock/g) || []).length >= 2);
assert.match(sqlAtomic, /'state','CREATED'/);
assert.match(sqlAtomic, /'state','REPLAYED'/);
assert.match(sqlAtomic, /'state','CONFLICT'/);
assert.match(sqlBase, /before update or delete on public\.advisor_compensation_payment_intake_ledger/i);
assert.match(sqlAtomic, /revoke all on function public\.forge_advisor_compensation_commit_event_011d\(uuid,jsonb,jsonb\)[\s\S]*from public, anon, authenticated/i);
assert.match(sqlAtomic, /grant execute on function public\.forge_advisor_compensation_commit_event_011d\(uuid,jsonb,jsonb\)[\s\S]*to service_role/i);
assert.match(sqlAtomic, /p_payment_event #>> '\{references,advisorReference\}'/);
assert.match(sqlAtomic, /p_compensation_event ->> 'advisorReference'/);

// Browser cannot access context server RPC or persistence RPCs.
assert.match(sqlHardening, /revoke all on function public\.forge_advisor_compensation_handoff_context_server_011d\(uuid,text\)[\s\S]*from public, anon, authenticated/i);
assert.match(sqlHardening, /grant execute on function public\.forge_advisor_compensation_handoff_context_server_011d\(uuid,text\)[\s\S]*to service_role/i);

// 011D introduces no payout ledger mutation.
const all011dSql = `${sqlBase}\n${sqlHardening}\n${sqlAtomic}`;
assert.doesNotMatch(all011dSql, /insert\s+into\s+public\.advisor_compensation_payout_/i);
assert.doesNotMatch(all011dSql, /update\s+public\.advisor_compensation_payout_/i);
assert.doesNotMatch(all011dSql, /delete\s+from\s+public\.advisor_compensation_payout_/i);

// Canonical PolicyRole vocabulary only.
assert.match(sqlHardening, /'POLICY_OWNER','PAYOR','INSURED'/);
assert.doesNotMatch(sqlHardening, /'POLICYHOLDER'/);

// Edge input is minimal; service credential exists only server-side, never in Aura.
assert.match(edge, /body\?\.paymentEventReference/);
assert.match(edge, /officialRulePack: null/);
assert.match(edge, /advisorMonthResolution: null/);
assert.doesNotMatch(aura, /SUPABASE_SERVICE_ROLE_KEY|SUPABASE_SECRET_KEYS/);
assert.doesNotMatch(aura, /advisor_compensation_event_ledger/);
assert.doesNotMatch(aura, /\.from\(/);
assert.match(aura, /client\.functions\.invoke\(FUNCTION_NAME/);
assert.match(aura, /body: \{ paymentEventReference: reference \}/);

// Aura preserves payment confirmation and exposes only governed handoff outcome, never commission amount.
assert.match(aura, /Pago confirmado\.<\/strong><br>Compensación actualizada\./);
assert.match(aura, /La compensación requiere información adicional\./);
assert.match(aura, /No fue posible actualizar la compensación en este momento\./);
assert.match(aura, /directCommissionAmountRendered: false/);
assert.match(index, /cartera-compensation-handoff-aura-011d\.js/);

// CP8 existing Income read RPC is the only read after materialization.
assert.match(edge, /forge_advisor_compensation_read_product/);
assert.doesNotMatch(edge, /commissionAmount\s*=|premium.*rate|rate.*premium/i);

// CP11 Watch Tower contract and hard fail-closed flags.
for (const field of [
  'FORGE_ADVISOR_COMPENSATION_PRODUCTIVE_GATE', 'AUTH_STATE', 'PAYMENT_AUTHORITY_STATE',
  'HANDOFF_STATE', 'STAGE_030_STATE', 'STAGE_040_STATE', 'STAGE_050_STATE',
  'LEDGER_STATE', 'MATERIALIZATION_STATE', 'INCOME_READ_STATE', 'IDEMPOTENCY_STATE',
  'DEMO_FALLBACK_USED', 'SYNTHETIC_WRITER_USED', 'UNKNOWN_COERCION_USED',
]) assert.match(`${serverOrchestrator}\n${edge}\n${aura}`, new RegExp(field));

// Current source truth is explicitly blocked, not falsely green.
assert.match(edge, /officialRulePack: null/);
assert.match(edge, /advisorMonthResolution: null/);

console.log('FORGE_ADVISOR_COMPENSATION_011D_TESTS=PASS');
console.log('CHECKPOINT_5_DOMAIN=PASS');
console.log('CHECKPOINT_6_LEDGER_IDEMPOTENCY_CONTRACT=PASS');
console.log('CHECKPOINT_7_READ_MODEL=PASS');
console.log('CHECKPOINT_8_INCOME_READ_PATH=PASS');
console.log('CHECKPOINT_11_WATCH_TOWER_CONTRACT=PASS');
console.log('PRODUCTIVE_SERVER_ACCEPTANCE=NOT_CLAIMED');
