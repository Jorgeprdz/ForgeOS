import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const compiler = await readFile(
  new URL('../scripts/ci/cartera-020b-qualify-acceptance-columns.mjs', import.meta.url),
  'utf8',
);

test('acceptance compiler qualifies the lease token column', () => {
  assert.match(compiler, /i\.advisor_id = user_a/);
  assert.match(compiler, /i\.inbox_reference = inbox_a/);
  assert.match(compiler, /i\.status = 'confirmation_required'/);
  assert.match(compiler, /i\.worker_state = 'COMPLETED'/);
  assert.match(compiler, /i\.lease_owner is null/);
  assert.match(compiler, /i\.lease_token is null/);
  assert.match(compiler, /i\.lease_expires_at is null/);
});

test('acceptance compiler is bounded and preserves rollback', () => {
  assert.match(compiler, /UNQUALIFIED_FINAL_INBOX_ASSERTION_NOT_FOUND/);
  assert.match(compiler, /UNQUALIFIED_FINAL_INBOX_ASSERTION_REMAINED/);
  assert.match(compiler, /rollback;\\s\*\$/i);
  assert.doesNotMatch(compiler, /SUPABASE_ACCESS_TOKEN/);
  assert.doesNotMatch(compiler, /api\.supabase\.com/);
});
