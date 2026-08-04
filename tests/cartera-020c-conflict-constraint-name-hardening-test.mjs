import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const migration = readFileSync(
  new URL('../supabase/migrations/20260731000240_cartera020c_conflict_constraint_name_hardening.sql', import.meta.url),
  'utf8',
);

test('00240 discovers the conflict unique constraint by table columns', () => {
  assert.match(migration, /^begin;/m);
  assert.match(migration, /commit;\s*$/);
  assert.match(migration, /from pg_constraint c/);
  assert.match(migration, /unnest\(c\.conkey\) with ordinality/);
  assert.match(migration, /advisor_id/);
  assert.match(migration, /conflict_reference/);
  assert.match(migration, /CARTERA020C_CONFLICT_REFERENCE_UNIQUE_CONSTRAINT_NOT_FOUND/);
  assert.doesNotMatch(migration, /cartera020c_confirmation_conflicts_advisor_id_conflict_referenc\s+to/);
});

test('00240 renames the discovered constraint to a stable bounded name', () => {
  assert.match(migration, /discovered_constraint_name/);
  assert.match(migration, /execute format/);
  assert.match(migration, /rename constraint %I to cartera020c_conflict_reference_uq/);
});

test('00240 recompiles conflict recording against the stable constraint', () => {
  assert.match(migration, /create or replace function public\.forge_cartera020c_record_conflict/);
  assert.match(migration, /on conflict on constraint cartera020c_conflict_reference_uq do nothing/i);
  assert.match(migration, /generated_conflict_reference/);
});

test('00240 keeps deployment mechanics outside the canonical migration', () => {
  assert.doesNotMatch(migration, /api\.supabase|database\/query|fetch\(/i);
});
