import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const migration = readFileSync(
  new URL('../supabase/migrations/20260731000240_cartera020c_conflict_constraint_name_hardening.sql', import.meta.url),
  'utf8',
);
const deploy = readFileSync(
  new URL('../scripts/ci/cartera-020c-conflict-constraint-name-hardening-deploy.mjs', import.meta.url),
  'utf8',
);

test('00240 renames the PostgreSQL-truncated constraint to a stable bounded name', () => {
  assert.match(migration, /^begin;/m);
  assert.match(migration, /commit;\s*$/);
  assert.match(migration, /cartera020c_confirmation_conflicts_advisor_id_conflict_referenc/);
  assert.match(migration, /to cartera020c_conflict_reference_uq/);
});

test('00240 recompiles conflict recording against the stable constraint', () => {
  assert.match(migration, /create or replace function public\.forge_cartera020c_record_conflict/);
  assert.match(migration, /on conflict on constraint cartera020c_conflict_reference_uq do nothing/i);
  assert.match(migration, /generated_conflict_reference/);
});

test('00240 deploy verifies migration history, catalog constraint and installed function', () => {
  assert.match(deploy, /20260731000240/);
  assert.match(deploy, /supabase_migrations\.schema_migrations/);
  assert.match(deploy, /pg_constraint/);
  assert.match(deploy, /pg_get_functiondef/);
  assert.match(deploy, /CARTERA020C_CONFLICT_CONSTRAINT_NAME_HARDENING=PASS/);
});
