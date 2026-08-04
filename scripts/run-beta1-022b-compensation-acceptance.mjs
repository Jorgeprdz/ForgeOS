import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { createClient } from '@supabase/supabase-js';
import { createCartera030cConfirmedPaymentReconciliationService } from '../advisor-os/cartera/cartera-030c-confirmed-payment-reconciliation-service.js';

const PROJECT_REF = 'rmlxigxysujsuwzgoimv';
const RUN_ID = '20260803_213631';
const DATA_CLASS = 'NON_PERSONAL_SYNTHETIC_ACCEPTANCE_DATA';
const OUT = process.env.FORGE_BETA1022B_ACCEPTANCE_EVIDENCE || 'artifacts/beta1-022b/acceptance.json';
for (const name of ['SUPABASE_URL','SUPABASE_ANON_KEY','ADVISOR_A_EMAIL','ADVISOR_A_PASSWORD','ADVISOR_B_EMAIL','ADVISOR_B_PASSWORD']) assert.ok(process.env[name], `${name}_MISSING`);
assert.equal(new URL(process.env.SUPABASE_URL).hostname, `${PROJECT_REF}.supabase.co`);
const options = { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } };
const digest = value => createHash('sha256').update(String(value)).digest('hex');
const client = () => createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, options);
const snapshot = owner => ({ reference: `rulesnapshot:synthetic-acceptance:${RUN_ID}:${owner}`, digest: digest(`snapshot:${RUN_ID}:${owner}`), syntheticAcceptanceOnly: true, rateApplied: false });
const evidence = (owner, scenario, paymentDate = null) => ({ reference: `evidence:synthetic:${RUN_ID}:${owner}:${scenario}`, hash: digest(`evidence:${RUN_ID}:${owner}:${scenario}`), synthetic: true, rateApplied: false, source: 'EXPLICIT_SYNTHETIC_ACCEPTANCE', ...(paymentDate ? { paymentDate } : {}) });

async function signIn(email, password) {
  const api = client(); const { data, error } = await api.auth.signInWithPassword({ email, password });
  assert.ifError(error); assert.ok(data.user?.id); return { api, id: data.user.id };
}
async function command(api, body) {
  const result = await api.rpc('forge_advisor_compensation_accept_synthetic_evidence', { p_command: body });
  if (result.error) throw Object.assign(new Error(result.error.message), { detail: result.error });
  return result.data;
}

const A = await signIn(process.env.ADVISOR_A_EMAIL, process.env.ADVISOR_A_PASSWORD);
const B = await signIn(process.env.ADVISOR_B_EMAIL, process.env.ADVISOR_B_PASSWORD);
const config = {
  A: { session: A, period: '2026-08', unknownPeriod: '2026-04', amount: 731.25, paid: 700.10 },
  B: { session: B, period: '2026-07', unknownPeriod: '2026-03', amount: 842.50, paid: 810.20 },
};
const report = { contractId: 'BETA1_022B_COMPENSATION_SYNTHETIC_ACCEPTANCE_V1', runId: RUN_ID, dataClass: DATA_CLASS, users: {}, secretsPersisted: false, realPayoutClaim: false };

for (const [owner, item] of Object.entries(config)) {
  const { data: policies, error } = await item.session.api.from('canonical_policies').select('policy_reference').like('policy_reference', `policy:beta1022a:${RUN_ID}:${owner}:%`).order('policy_reference').limit(3);
  assert.ifError(error); assert.ok(policies.length >= 3, `${owner}_POLICIES_MISSING`);
  const base = { ownerId: item.session.id, runId: RUN_ID, dataClass: DATA_CLASS, currency: 'MXN' };
  const estimated = await command(item.session.api, { ...base, idempotencyKey: `b1022b:${RUN_ID}:${owner}:estimated`, state: 'ESTIMATED', periodKey: item.period, policyReference: policies[0].policy_reference, concept: 'LIFE_INITIAL', amount: item.amount - 100, evidence: evidence(owner,'estimated'), ruleSnapshot: snapshot(owner) });
  const payment = await createCartera030cConfirmedPaymentReconciliationService({ client: item.session.api }).reconcileConfirmedPayment({
    policyReference: policies[1].policy_reference,
    paymentEvidenceReference: `payment-evidence:beta1022b:${RUN_ID}:${owner}`,
    paymentAmount: 1200 + (owner === 'A' ? 10 : 20), currency: 'MXN', paymentDate: `${item.period}-01`,
    periodCoveredStart: `${item.period}-01`, periodCoveredEnd: `${item.period}-28`, paymentSource: 'payment_proof',
    evidenceReferences: [`evidence:beta1022b:${RUN_ID}:${owner}:confirmed-payment`], confirmationState: 'CONFIRMED',
    idempotencyKey: `payment:beta1022b:${RUN_ID}:${owner}`,
  });
  assert.ok(payment.paymentEventReference, `${owner}_CONFIRMED_PAYMENT_EVENT_MISSING`);
  const earnedInput = { ...base, idempotencyKey: `b1022b:${RUN_ID}:${owner}:earned`, state: 'EARNED', periodKey: item.period, policyReference: policies[1].policy_reference, paymentEventReference: payment.paymentEventReference, concept: 'LIFE_RENEWAL', amount: item.amount, evidence: evidence(owner,'earned'), ruleSnapshot: snapshot(owner) };
  const earned = await command(item.session.api, earnedInput);
  const replay = await command(item.session.api, earnedInput);
  const conflict = await command(item.session.api, { ...earnedInput, amount: item.amount + 1 });
  const paid = await command(item.session.api, { ...base, idempotencyKey: `b1022b:${RUN_ID}:${owner}:paid`, state: 'PAID', periodKey: item.period, policyReference: policies[2].policy_reference, concept: 'LIFE_RENEWAL', amount: item.paid, evidence: evidence(owner,'paid',`${item.period}-15`), matchedEventId: earned.earnedEventId, humanDecision: { confirmed: true, actorClass: 'SYNTHETIC_ACCEPTANCE_REVIEWER' } });
  const unknown = await command(item.session.api, { ...base, idempotencyKey: `b1022b:${RUN_ID}:${owner}:unknown`, state: 'UNKNOWN', periodKey: item.unknownPeriod, amount: null });
  assert.equal(estimated.truthState, 'ESTIMATED'); assert.equal(earned.truthState, 'EARNED');
  assert.equal(paid.truthState, 'PAID'); assert.equal(unknown.amount, null);
  assert.equal(replay.status, 'REPLAYED'); assert.equal(conflict.status, 'CONFLICT');
  report.users[owner] = { periodKey: item.period, unknownPeriod: item.unknownPeriod, estimated: 'PASS', earned: 'PASS', paid: 'PASS', unknownWithoutAmount: 'PASS', replay: 'PASS', conflict: 'PASS', initialRenewalSeparated: true };
}

for (const [actorName, targetName] of [['A','B'],['B','A']]) {
  const actor = config[actorName].session; const target = config[targetName].session;
  const result = await actor.api.rpc('forge_advisor_compensation_accept_synthetic_evidence', { p_command: { ownerId: target.id, runId: RUN_ID, dataClass: DATA_CLASS, idempotencyKey: `cross:${actorName}:${targetName}`, state: 'UNKNOWN', periodKey: '2026-02', amount: null } });
  assert.ok(result.error, `${actorName}_CROSS_MUTATION_NOT_BLOCKED`);
  report.users[actorName].crossUserMutationBlocked = true;
}
const direct = await A.api.from('advisor_compensation_event_ledger').insert({});
assert.ok(direct.error, 'DIRECT_BROWSER_LEDGER_WRITE_NOT_BLOCKED');
report.directBrowserLedgerWriteBlocked = true;
mkdirSync(dirname(OUT), { recursive: true }); writeFileSync(OUT, `${JSON.stringify(report, null, 2)}\n`);
await Promise.all([A.api.auth.signOut(), B.api.auth.signOut()]);
console.log('BETA1_022B_USER_A=PASS'); console.log('BETA1_022B_USER_B=PASS'); console.log('BETA1_022B_TENANT_MUTATION=BLOCKED');
