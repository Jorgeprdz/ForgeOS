import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const sql = readFileSync(
  new URL('../supabase/migrations/20260731000241_cartera020c_conflict_persistence_receipt_hardening.sql', import.meta.url),
  'utf8',
);

test('conflict persistence qualifies columns in the verification query', () => {
  assert.match(sql, /from public\.cartera020c_confirmation_conflicts c/);
  assert.match(sql, /where c\.advisor_id = p_actor_id/);
  assert.match(sql, /c\.conflict_reference = generated_conflict_reference/);
});

test('unqualified conflict verification columns cannot regress', () => {
  assert.doesNotMatch(sql, /from public\.cartera020c_confirmation_conflicts c\n\s*where advisor_id/);
});
