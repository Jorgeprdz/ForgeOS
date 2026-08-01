import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const migration = readFileSync(
  new URL('../supabase/migrations/20260731000239_cartera020c_conflict_insert_ambiguity_hardening.sql', import.meta.url),
  'utf8',
);
const deploy = readFileSync(
  new URL('../scripts/ci/cartera-020c-conflict-ambiguity-hardening-deploy.mjs', import.meta.url),
  'utf8',
);

test('00239 replaces the conflict recorder without rewriting deployed history', () => {
  assert.match(migration, /^begin;/m);
  assert.match(migration, /commit;\s*$/);
  assert.match(migration, /create or replace function public\.forge_cartera020c_record_conflict/);
  assert.match(migration, /generated_conflict_reference/);
  assert.doesNotMatch(migration, /^\s*conflict_reference\s+text\s*;/m);
});

test('00239 targets the exact unique constraint and removes PL/pgSQL ambiguity', () => {
  assert.match(
    migration,
    /on conflict on constraint\s+cartera020c_confirmation_conflicts_advisor_id_conflict_reference_key\s+do nothing/i,
  );
  assert.doesNotMatch(migration, /on conflict \(advisor_id, conflict_reference\)/i);
  assert.match(migration, /return generated_conflict_reference/);
});

test('hardening deploy is authorized, migration-aware and verifies installed definition', () => {
  assert.match(deploy, /YES:CARTERA_020C_REMOTE_MUTATION/);
  assert.match(deploy, /20260731000239/);
  assert.match(deploy, /supabase_migrations\.schema_migrations/);
  assert.match(deploy, /pg_get_functiondef/);
  assert.match(deploy, /CARTERA020C_CONFLICT_INSERT_AMBIGUITY_HARDENING=PASS/);
  assert.match(deploy, /REMOTE_CONTENT_MISMATCH/);
});
