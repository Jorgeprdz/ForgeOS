import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const migration = readFileSync(
  new URL('../supabase/migrations/20260731000239_cartera020c_conflict_insert_ambiguity_hardening.sql', import.meta.url),
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

test('hardening remains a transactional repository migration without remote side effects', () => {
  assert.doesNotMatch(migration, /api\.supabase|database\/query|fetch\(/i);
});
