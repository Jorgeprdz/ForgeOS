import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const adapter = fs.readFileSync('docs/static-preview/forge-aura/cartera/cartera-adapter-pages-v3.js', 'utf8');
const index = fs.readFileSync('docs/static-preview/forge-aura/index.html', 'utf8');
const bootstrap = fs.readFileSync('docs/static-preview/forge-aura/aura-bootstrap-v4.js', 'utf8');

test('Aura PDF retries use a fresh admission command idempotency key', () => {
  assert.match(adapter, /forge_cartera020b_admit_evidence/);
  assert.match(adapter, /attemptToken\(\)/);
  assert.match(adapter, /randomUUID/);
  assert.match(adapter, /idempotencyKey\s*=\s*`\$\{baseKey\}:\$\{attemptToken\(\)\}`/);
  assert.match(adapter, /p_command:\s*\{[\s\S]*\.\.\.command,[\s\S]*idempotencyKey/);
});

test('retry wrapper leaves Evidence identity and server-side document dedupe authority untouched', () => {
  assert.doesNotMatch(adapter, /documentDigest\s*:/);
  assert.doesNotMatch(adapter, /sourceReference\s*:/);
  assert.doesNotMatch(adapter, /inboxReference\s*:/);
  assert.doesNotMatch(adapter, /purpose\s*:/);
  assert.match(adapter, /createTransportAdapter/);
});

test('Aura keeps the retry-safe adapter in the governed v4 chain', () => {
  assert.match(index, /cartera-adapter-pages-v4\.js\?v=aura-cartera-result-state-machine-006/);
  assert.match(index, /aura-bootstrap-v4\.js\?v=aura-cartera-result-state-machine-006/);
  assert.match(bootstrap, /app-v4\.js\?v=aura-cartera-result-state-machine-006/);
});
