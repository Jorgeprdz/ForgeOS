import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const sql = readFileSync(
  new URL('../scripts/ci/cartera-020c-remote-acceptance.sql', import.meta.url),
  'utf8',
);

test('retry fixture qualifies all three Review updates under use_variable mode', () => {
  const updates = sql.match(/update public\.cartera020c_confirmation_reviews r/g) || [];
  assert.ok(updates.length >= 3);
  const qualified = sql.match(/where r\.advisor_id=user_a and r\.review_reference=retry_review_reference/g) || [];
  assert.equal(qualified.length, 3);
  assert.doesNotMatch(sql, /where advisor_id=user_a and review_reference=retry_review_reference/);
});

test('retry RPC consumes durable status stateVersion for early and due calls', () => {
  const reads = sql.match(/forge_cartera020c_get_confirmation_status\(retry_review_reference\)/g) || [];
  assert.equal(reads.length, 2);
  const dynamicVersions = sql.match(/retry_review_reference,\(retry_status ->> 'stateVersion'\)::integer,clock_timestamp\(\)/g) || [];
  assert.equal(dynamicVersions.length, 2);
  assert.doesNotMatch(sql, /retry_review_reference,3,clock_timestamp\(\)/);
  assert.match(sql, /CARTERA020C_RETRY_WAIT_FIXTURE_INVALID/);
  assert.match(sql, /CARTERA020C_DUE_RETRY_FIXTURE_INVALID/);
});
