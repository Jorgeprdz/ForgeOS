import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const migration = readFileSync(
  new URL('../supabase/migrations/20260731000241_cartera020c_conflict_persistence_receipt_hardening.sql', import.meta.url),
  'utf8',
);
const deploy = readFileSync(
  new URL('../scripts/ci/cartera-020c-conflict-persistence-hardening-deploy.mjs', import.meta.url),
  'utf8',
);

test('00241 returns a conflict reference only after exact persistence', () => {
  assert.match(migration, /^begin;/m);
  assert.match(migration, /commit;\s*$/);
  assert.match(migration, /persisted_conflict public\.cartera020c_confirmation_conflicts%rowtype/);
  assert.match(migration, /insert into public\.cartera020c_confirmation_conflicts/);
  assert.match(migration, /returning \* into persisted_conflict/);
  assert.match(migration, /return persisted_conflict\.conflict_reference/);
  assert.doesNotMatch(migration, /on conflict/i);
});

test('00241 serializes replay and verifies every semantic conflict field', () => {
  assert.match(migration, /pg_advisory_xact_lock/);
  assert.match(migration, /CARTERA020C_CONFLICT_PERSISTENCE_FAILED/);
  assert.match(migration, /CARTERA020C_CONFLICT_PERSISTENCE_MISMATCH/);
  for (const field of [
    'advisor_id', 'conflict_reference', 'review_reference', 'conflict_type',
    'idempotency_key', 'existing_digest', 'incoming_digest',
    'command_reference', 'recorded_by',
  ]) {
    assert.match(migration, new RegExp(`persisted_conflict\\.${field}`));
  }
});

test('00241 deploy is migration-aware and verifies the installed invariant', () => {
  assert.match(deploy, /20260731000241/);
  assert.match(deploy, /supabase_migrations\.schema_migrations/);
  assert.match(deploy, /pg_get_functiondef/);
  assert.match(deploy, /returning \\* into persisted_conflict/i);
  assert.match(deploy, /CARTERA020C_CONFLICT_PERSISTENCE_RECEIPT_HARDENING=PASS/);
  assert.match(deploy, /MAX_QUERY_ATTEMPTS = 5/);
});
