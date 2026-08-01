import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const sql = readFileSync(
  new URL('../scripts/ci/cartera-020c-remote-acceptance.sql', import.meta.url),
  'utf8',
);

test('conflict verification qualifies columns under use_variable PL/pgSQL mode', () => {
  assert.match(sql, /from public\.cartera020c_confirmation_conflicts c/);
  assert.match(sql, /where c\.advisor_id = user_a/);
  assert.match(sql, /c\.review_reference = conflict_review_reference/);
  assert.match(sql, /c\.conflict_type = 'CHANGED_INPUT_REPLAY'/);
  assert.match(sql, /c\.conflict_reference = conflict_status ->> 'conflictReference'/);
});

test('unqualified conflict verification columns cannot regress', () => {
  assert.doesNotMatch(sql, /from public\.cartera020c_confirmation_conflicts\n\s*where advisor_id = user_a/);
  assert.match(sql, /#variable_conflict use_variable/);
});
