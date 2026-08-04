import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const sql = readFileSync(
  new URL('../supabase/migrations/20260731000237_cartera020c_confirmation_status_retry_grants.sql', import.meta.url),
  'utf8',
);

test('retry mutation is owner scoped and state-version qualified', () => {
  assert.match(sql, /where r\.advisor_id = actor_id/);
  assert.match(sql, /review\.state_version <> p_expected_state_version/);
  assert.match(sql, /where id = review\.id and advisor_id = actor_id/);
});

test('retry RPC rejects early and stale calls and returns sanitized status', () => {
  assert.match(sql, /CARTERA020C_STALE_STATE_VERSION/);
  assert.match(sql, /CARTERA020C_RETRY_NOT_DUE/);
  assert.match(sql, /forge_cartera020c_status_response\(actor_id, p_review_reference\)/);
  assert.doesNotMatch(sql, /p_expected_state_version\s*:=\s*3/);
});
