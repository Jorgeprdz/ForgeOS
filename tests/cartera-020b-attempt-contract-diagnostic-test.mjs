import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const diagnostic = await readFile(
  new URL('../scripts/ci/cartera-020b-attempt-contract-diagnostic.mjs', import.meta.url),
  'utf8',
);

test('attempt diagnostic is read-only and exercises the deployed helper', () => {
  assert.match(diagnostic, /MODE=READ_ONLY/);
  assert.match(diagnostic, /forge_cartera020b_jsonb_keys_allowed/);
  assert.match(diagnostic, /pg_get_functiondef/);
  assert.match(diagnostic, /rejected_keys/);
  assert.match(diagnostic, /creates_truth_boolean/);
  assert.doesNotMatch(diagnostic, /\binsert\s+into\b/i);
  assert.doesNotMatch(diagnostic, /\bupdate\s+[^\n]+\bset\b/i);
  assert.doesNotMatch(diagnostic, /\bdelete\s+from\b/i);
  assert.doesNotMatch(diagnostic, /\balter\s+table\b/i);
  assert.doesNotMatch(diagnostic, /\bcreate\s+(table|function|trigger)\b/i);
});

test('attempt diagnostic reproduces the exact acceptance attempt keys', () => {
  for (const key of [
    'attemptReference','provider','providerVersion','method','status','sourceDigest',
    'pageCount','textAvailable','textDigest','outputReference','warnings','errors',
    'startedAt','completedAt','createsTruth',
  ]) {
    assert.ok(diagnostic.includes(`'${key}'`), `missing ${key}`);
  }
});
