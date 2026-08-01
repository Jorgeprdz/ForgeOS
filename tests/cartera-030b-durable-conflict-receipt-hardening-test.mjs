import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const path = 'supabase/migrations/20260731000252_cartera030b_durable_generation_conflict_receipts.sql';
const read = () => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('00252 is additive and replaces only the governed generation RPC', async () => {
  const sql = await read();
  assert.match(sql, /^-- CARTERA 030B durable generation conflict receipt hardening/m);
  assert.match(sql, /create or replace function public\.forge_cartera030b_generate_expected_obligations/);
  assert.doesNotMatch(sql, /create table|alter table|drop table/i);
  assert.match(sql, /begin;/);
  assert.match(sql, /commit;/);
});

test('changed-input replay persists an idempotent conflict and returns an envelope', async () => {
  const sql = await read();
  assert.match(sql, /'CHANGED_INPUT_REPLAY'/);
  assert.match(sql, /on conflict \(advisor_id, conflict_reference\) do nothing/);
  assert.match(sql, /'generationState', 'CONFLICT'/);
  assert.match(sql, /'conflictReference', conflict_reference_value/);
  assert.doesNotMatch(sql, /raise exception 'CARTERA030B_CHANGED_INPUT_REPLAY'/);
});

test('identity collisions are preflighted before any ledger insert', async () => {
  const sql = await read();
  const preflight = sql.indexOf('-- Preflight the whole batch');
  const persistence = sql.indexOf('-- Persist only after the complete batch has passed preflight');
  const ledgerInsert = sql.indexOf('insert into public.cartera030b_expected_payment_obligations', persistence);
  assert.ok(preflight > 0);
  assert.ok(persistence > preflight);
  assert.ok(ledgerInsert > persistence);
  assert.match(sql, /'OBLIGATION_IDENTITY_COLLISION'/);
  assert.doesNotMatch(sql, /raise exception 'CARTERA030B_OBLIGATION_IDENTITY_COLLISION'/);
});

test('generation is serialized by advisor and PolicyVersion', async () => {
  const sql = await read();
  assert.match(sql, /pg_advisory_xact_lock/);
  assert.match(sql, /advisor::text \|\| ':' \|\| policy_version_reference_value/);
});

test('collision comparison includes persisted financial and date semantics', async () => {
  const sql = await read();
  for (const marker of [
    'expected_amount is distinct from expected_amount_value',
    'currency is distinct from policy_row.currency',
    'timezone <> timezone_value',
    "date_authority <> 'CONFIRMED_POLICY_TERMS_DERIVED'",
    'schedule_rule_reference is distinct from schedule_rule_reference_value',
  ]) {
    assert.match(sql, new RegExp(marker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
});
