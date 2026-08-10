import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = path => fs.readFileSync(path, 'utf8');

const index = read('docs/static-preview/forge-aura/index.html');
const runtime = read('docs/static-preview/forge-aura/commercial-loop-011c.js');
const journal = read('docs/static-preview/forge-aura/pipeline/pipeline-journal-aura-011c.js');
const payment = read('docs/static-preview/forge-aura/cartera/cartera-payment-aura-011c.js');
const pipelineV5 = read('docs/static-preview/forge-aura/pipeline/pipeline-adapter-pages-v5.js');
const income = read('docs/static-preview/forge-aura/income/income-adapter-pages-v1.mjs');
const shell = read('docs/static-preview/forge-aura/aura-shell.js');
const journalMigration = read('supabase/migrations/20260731000100_pipeline_prospect_journal.sql');
const paymentMigration = read('supabase/migrations/20260801000260_cartera030c_confirmed_payment_event_reconciliation.sql');

const checks = [];
function check(name, fn) {
  fn();
  checks.push(name);
}

check('011C runtime is activated by Aura entrypoint', () => {
  assert.match(index, /commercial-loop-011c\.css/);
  assert.match(index, /commercial-loop-011c\.js/);
});

check('Pipeline Pages root remains inside the repository project path', () => {
  assert.match(pipelineV5, /sourceLayout\s*=\s*import\.meta\.url\.includes\('\/docs\/static-preview\/'\)/);
  assert.match(pipelineV5, /sourceLayout\s*\?\s*'\.\.\/\.\.\/\.\.\/\.\.\/'\s*:\s*'\.\.\/\.\.\/\.\.\/'/);
  assert.match(pipelineV5, /prospect-timeline\/prospect-timeline-service\.js/);
});

check('Aura Pipeline reconnects the existing Journal authority', () => {
  assert.match(journal, /prospect-journal\/prospect-journal-service\.js/);
  assert.match(journal, /prospect-timeline\/prospect-timeline-service\.js/);
  assert.match(journal, /ForgeProspectJournalServiceP7/);
  assert.match(journal, /ForgeProspectTimelineServiceNFAST08/);
  assert.match(journal, /CONVERSATION_RECORDED/);
  assert.match(journal, /JOURNAL:\$\{entry\.id\}/);
  assert.doesNotMatch(journal, /localStorage|indexedDB/i);
});

check('Journal database authority links note writes to Timeline append-only', () => {
  assert.match(journalMigration, /after insert on public\.prospect_journal_entries/i);
  assert.match(journalMigration, /'CONVERSATION_RECORDED'/);
  assert.match(journalMigration, /'JOURNAL:' \|\| new\.id::text/);
  assert.match(journalMigration, /advisor_id = auth\.uid\(\)/);
});

check('Cartera payment UX consumes canonical 030C and 030D RPCs', () => {
  assert.match(payment, /forge_cartera030d_list_policy_payment_calendar/);
  assert.match(payment, /forge_cartera030c_record_and_reconcile_confirmed_payment/);
  assert.match(payment, /humanConfirmation !== true/);
  assert.match(payment, /CARTERA030C_READ_AFTER_WRITE_FAILED/);
  assert.match(payment, /Pago de prima, no pago de comisión/);
  assert.match(payment, /NOT_CONNECTED_TO_PRODUCTIVE_SERVER_AUTHORITY/);
  assert.doesNotMatch(payment, /commissionRate|baseRate|developmentFactor|advisor_compensation_event_ledger/i);
});

check('Confirmed payment SQL requires auth, authorization digest and positive confirmed payment', () => {
  assert.match(paymentMigration, /auth\.uid\(\)/);
  assert.match(paymentMigration, /CARTERA030C_EXPLICIT_AUTHORIZATION_REQUIRED/);
  assert.match(paymentMigration, /CARTERA030C_AUTHORIZATION_DIGEST_MISMATCH/);
  assert.match(paymentMigration, /payment_amount_value <= 0/);
  assert.match(paymentMigration, /confirmation_state_value <> 'CONFIRMED'/);
});

check('Desktop Cotizaciones is promoted to the native Aura route', () => {
  assert.match(runtime, /link\.dataset\.auraDesktopQuotes\s*=\s*'011c'/);
  assert.match(runtime, /link\.dataset\.auraRouteLink\s*=\s*'cotizaciones'/);
  assert.match(runtime, /nativeNavigate\('cotizaciones'\)/);
  assert.match(runtime, /<span>Cotizaciones<\/span>/);
  assert.match(shell, /data-aura-route-link="comisiones"/);
});

check('Ingresos remains bound to its productive read authority without fallback', () => {
  assert.match(income, /forge_advisor_compensation_read_product/);
  assert.match(income, /ADVISOR_COMPENSATION_REMOTE_AUTHORITY_NOT_DEPLOYED/);
  assert.match(income, /indexedDbFallback: false/);
  assert.match(income, /carteraFallback: false/);
  assert.match(income, /pipelineFallback: false/);
  assert.match(income, /unknownIsNotZero: true/);
});

check('011C runtime exposes honest loop diagnostics', () => {
  assert.match(runtime, /PRODUCTIVE_ONLY/);
  assert.match(runtime, /demoFallbackUsed: false/);
  assert.match(runtime, /unknownCoercionUsed: false/);
  assert.match(runtime, /Detalles técnicos/);
});

console.log(`FORGE_AURA_COMMERCIAL_LOOP_011C_TESTS=${checks.length}`);
console.log('FORGE_AURA_COMMERCIAL_LOOP_011C_SYNTHETIC=PASS');
for (const name of checks) console.log(`PASS ${name}`);
