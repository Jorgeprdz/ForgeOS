import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = path => readFile(new URL(`../${path}`, import.meta.url), 'utf8');
const ledgerPath = 'supabase/migrations/20260731000250_cartera030b_expected_payment_obligation_ledger.sql';
const rpcPath = 'supabase/migrations/20260731000251_cartera030b_generation_and_calendar_rpc.sql';

test('ledger defines obligations, transitions, reconciliations, conflicts and receipts', async () => {
  const sql = await read(ledgerPath);
  for (const table of [
    'cartera030b_expected_payment_obligations',
    'cartera030b_obligation_transitions',
    'cartera030b_payment_reconciliations',
    'cartera030b_obligation_conflicts',
    'cartera030b_command_receipts',
  ]) {
    assert.match(sql, new RegExp(`create table if not exists public\\.${table}`));
  }
});

test('expected obligation remains distinct from confirmed PaymentEvent truth', async () => {
  const sql = await read(ledgerPath);
  assert.match(sql, /obligation_kind in \('PREMIUM_PAYMENT'\)/);
  assert.match(sql, /matched_payment_event_references jsonb/);
  assert.match(sql, /confirmation_state in/);
  assert.doesNotMatch(sql, /create table if not exists public\.payment_events/);
  assert.doesNotMatch(sql, /commission_amount|payout_amount|bank_account|clabe/i);
});

test('owner RLS is forced and direct authenticated table access is revoked', async () => {
  const sql = await read(ledgerPath);
  assert.match(sql, /force row level security/);
  assert.match(sql, /revoke all on table public\.%I from public, anon, authenticated/);
  assert.match(sql, /CARTERA030B_OWNERSHIP|advisor_id uuid not null/);
});

test('ledger identity, append-only history and optimistic state versions are locked', async () => {
  const sql = await read(ledgerPath);
  assert.match(sql, /cartera030b_active_occurrence_uq/);
  assert.match(sql, /CARTERA030B_OBLIGATION_IDENTITY_IMMUTABLE/);
  assert.match(sql, /CARTERA030B_STATE_VERSION_INVALID/);
  assert.match(sql, /CARTERA030B_APPEND_ONLY/);
});

test('generation RPC requires authenticated explicit digest-bound authorization', async () => {
  const sql = await read(rpcPath);
  assert.match(sql, /auth\.uid\(\)/);
  assert.match(sql, /CARTERA030B_EXPLICIT_AUTHORIZATION_REQUIRED/);
  assert.match(sql, /CARTERA030B_AUTHORIZATION_DIGEST_MISMATCH/);
  assert.match(sql, /forge_cartera030b_stable_json_text/);
});

test('server recurrence is current-version bound and fail-closed', async () => {
  const sql = await read(rpcPath);
  assert.match(sql, /CARTERA030B_CURRENT_POLICY_VERSION_REQUIRED/);
  assert.match(sql, /UNKNOWN_ANCHOR_DATE/);
  assert.match(sql, /UNKNOWN_PAYMENT_FREQUENCY/);
  assert.match(sql, /forge_cartera030b_add_months_clamped/);
  assert.match(sql, /max_occurrences constant integer := 600/);
});

test('changed-input replay and identity collision persist conflicts rather than overwrite', async () => {
  const sql = await read(rpcPath);
  assert.match(sql, /CHANGED_INPUT_REPLAY/);
  assert.match(sql, /OBLIGATION_IDENTITY_COLLISION/);
  assert.match(sql, /on conflict \(advisor_id, obligation_reference\) do nothing/);
  assert.doesNotMatch(sql, /do update set/);
});

test('calendar RPC is sanitized and omits evidence, beneficiary and payment instrument data', async () => {
  const sql = await read(rpcPath);
  const calendarFunction = sql.slice(sql.indexOf('forge_cartera030b_list_expected_obligations'));
  assert.match(calendarFunction, /EXPECTED_PAYMENT_OBLIGATION/);
  assert.match(calendarFunction, /No due dates were guessed|dateAuthority/);
  assert.doesNotMatch(calendarFunction, /source_evidence_references|matched_payment_event_references|beneficiary|bank_account|clabe/i);
});

test('repository migrations are transactional and contain no remote execution', async () => {
  for (const path of [ledgerPath, rpcPath]) {
    const sql = await read(path);
    assert.match(sql, /^-- CARTERA 030B/m);
    assert.match(sql, /begin;/);
    assert.match(sql, /commit;/);
    assert.doesNotMatch(sql, /supabase\.co|management\/v1|curl |fetch\(/i);
  }
});
