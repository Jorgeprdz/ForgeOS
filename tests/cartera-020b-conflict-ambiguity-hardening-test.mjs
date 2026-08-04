import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const migration = await readFile(
  new URL('../supabase/migrations/20260731000228_cartera020b_conflict_insert_ambiguity_hardening.sql', import.meta.url),
  'utf8',
);

test('020B conflict hardening replaces only the replay helper', () => {
  assert.match(migration, /create or replace function public\.forge_cartera020b_existing_receipt_response/);
  assert.match(migration, /generated_conflict_reference text/);
  assert.doesNotMatch(migration, /create table/i);
  assert.doesNotMatch(migration, /alter table/i);
});

test('020B conflict insert targets the explicit unique constraint', () => {
  assert.match(
    migration,
    /on conflict on constraint\s+cartera020b_command_conflicts_advisor_id_conflict_reference_key\s+do nothing/i,
  );
  assert.doesNotMatch(migration, /on conflict \(advisor_id, conflict_reference\)/i);
  assert.match(migration, /CARTERA020B_COMMAND_REPLAY_CONFLICT|COMMAND_REPLAY_CONFLICT/);
});

test('020B conflict hardening preserves authority and non-truth boundary', () => {
  const lower = migration.toLowerCase();
  assert.equal(lower.includes('insert into public.canonical_policies'), false);
  assert.equal(lower.includes('insert into public.commercial_people'), false);
  assert.equal(lower.includes('insert into public.policy_roles'), false);
  assert.match(migration, /createsPolicy', false/);
  assert.match(migration, /revoke all on function public\.forge_cartera020b_existing_receipt_response/);
});

test('020B hardening remains repository-owned without remote runner authority', () => {
  assert.doesNotMatch(migration, /api\.supabase\.com|SUPABASE_ACCESS_TOKEN|database\/query/i);
});
