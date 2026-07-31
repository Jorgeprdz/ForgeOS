import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const diagnostic = await readFile(
  new URL('../scripts/ci/cartera-020b-final-inbox-state-diagnostic.mjs', import.meta.url),
  'utf8',
);

test('final inbox diagnostic preserves rollback and reports the exact row', () => {
  assert.match(diagnostic, /TRANSACTIONAL_ROLLBACK/);
  assert.match(diagnostic, /rollback;\\s\*\$/i);
  assert.match(diagnostic, /FINAL_INBOX_STATE/);
  assert.match(diagnostic, /leaseOwner/);
  assert.match(diagnostic, /leaseToken/);
  assert.match(diagnostic, /leaseExpiresAt/);
  assert.match(diagnostic, /stateVersion/);
});

test('final inbox diagnostic requires explicit authorization', () => {
  assert.match(diagnostic, /YES:CARTERA_020B_REMOTE_MUTATION/);
  assert.match(diagnostic, /DIAGNOSTIC_NOT_AUTHORIZED/);
  assert.match(diagnostic, /FINAL_STATE_ASSERTION_SOURCE_NOT_FOUND/);
  assert.match(diagnostic, /CARTERA020B_FINAL_INBOX_DIAGNOSTIC/);
});
