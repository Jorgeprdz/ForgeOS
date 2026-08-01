import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const deploy = readFileSync(
  new URL('../scripts/ci/cartera-020c-conflict-constraint-name-hardening-deploy.mjs', import.meta.url),
  'utf8',
);

test('00240 deployment retries only bounded transient Supabase management failures', () => {
  assert.match(deploy, /MAX_QUERY_ATTEMPTS = 5/);
  assert.match(deploy, /RETRYABLE_HTTP_STATUSES/);
  for (const status of ['429', '500', '502', '503', '504']) {
    assert.match(deploy, new RegExp(status));
  }
  assert.match(deploy, /attempt < MAX_QUERY_ATTEMPTS/);
  assert.match(deploy, /await sleep\(delay\)/);
  assert.match(deploy, /TRANSIENT_RETRY/);
  assert.match(deploy, /retryDelay\(attempt\)/);
});

test('00240 deployment does not retry non-transient SQL contract failures', () => {
  assert.match(deploy, /RETRYABLE_HTTP_STATUSES\.has\(response\.status\)/);
  assert.match(deploy, /throw finalError/);
  assert.doesNotMatch(deploy, /RETRYABLE_HTTP_STATUSES = new Set\([^\n]*400/);
});
