import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const migrationUrl = new URL('../supabase/migrations/20260804000001_advisor_compensation_synthetic_acceptance.sql', import.meta.url);

test('022B extends canonical ledgers without a second compensation truth', async () => {
  const sql = await readFile(migrationUrl, 'utf8');
  assert.match(sql, /insert into public\.advisor_compensation_event_ledger/);
  assert.match(sql, /insert into public\.advisor_compensation_payout_evidence_ledger/);
  assert.match(sql, /insert into public\.advisor_compensation_payout_decision_ledger/);
  assert.match(sql, /insert into public\.advisor_compensation_payout_record_ledger/);
  assert.doesNotMatch(sql, /create table public\.(advisor_compensation_events|compensation_ledger|payouts)\b/i);
  assert.match(sql, /receipts.*not compensation truth/is);
});

test('022B rejects rates and preserves UNKNOWN without amount', async () => {
  const sql = await readFile(migrationUrl, 'utf8');
  assert.match(sql, /p_command \? 'rate'/);
  assert.match(sql, /p_command \? 'commissionRate'/);
  assert.match(sql, /'rateApplied',false/);
  assert.match(sql, /UNKNOWN_AMOUNT_MUST_BE_NULL/);
  assert.match(sql, /'truthState','UNKNOWN','amount',null/);
  assert.match(sql, /officialSourceTruth',false/);
  assert.match(sql, /CONFIRMED_PAYMENT_EVENT_REQUIRED_FOR_EARNED/);
  assert.match(sql, /cartera030c_confirmed_payment_events/);
});

test('022B is owner scoped, idempotent, demo-window bound and browser-write closed', async () => {
  const sql = await readFile(migrationUrl, 'utf8');
  assert.match(sql, /auth\.uid\(\)/);
  assert.match(sql, /ownerId' is distinct from actor::text/);
  assert.match(sql, /forge_demo_current_session\(\)/);
  assert.match(sql, /SYNTHETIC_COMPENSATION_WINDOW_CLOSED/);
  assert.match(sql, /pg_advisory_xact_lock/);
  assert.match(sql, /IDEMPOTENCY_KEY_REUSED/);
  assert.match(sql, /revoke all on public\.advisor_compensation_synthetic_command_receipts from public, anon, authenticated/);
  assert.doesNotMatch(sql, /grant (insert|update|delete)/i);
});

test('PAID remains a payout record backed by evidence, decision and earned event', async () => {
  const sql = await readFile(migrationUrl, 'utf8');
  assert.match(sql, /state='EARNED'/);
  assert.match(sql, /SYNTHETIC_PAYOUT_EVIDENCE_AND_DECISION_REQUIRED/);
  assert.match(sql, /decision_state[\s\S]*'CONFIRMED'/);
  assert.match(sql, /'realWorldClaim',false/);
  assert.doesNotMatch(sql, /event_ledger[\s\S]{0,250}'PAID'/);
});
