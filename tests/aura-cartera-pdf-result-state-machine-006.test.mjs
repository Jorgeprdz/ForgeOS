import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const adapter = fs.readFileSync('docs/static-preview/forge-aura/cartera/cartera-adapter-pages-v4.js', 'utf8');
const index = fs.readFileSync('docs/static-preview/forge-aura/index.html', 'utf8');
const bootstrap = fs.readFileSync('docs/static-preview/forge-aura/aura-bootstrap-v4.js', 'utf8');

test('Aura records PDF processing through the governed CARTERA 020B happy-path states', () => {
  const classified = adapter.indexOf("'classified'");
  const candidate = adapter.indexOf("'extraction_candidate_created'");
  const packet = adapter.indexOf("'packet_created'");
  const confirmation = adapter.indexOf("'confirmation_required'");

  assert.ok(classified >= 0);
  assert.ok(candidate > classified);
  assert.ok(packet > candidate);
  assert.ok(confirmation > packet);
  assert.match(adapter, /const STAGES = \[[\s\S]*'classified',[\s\S]*'extraction_candidate_created',[\s\S]*'packet_created',[\s\S]*'confirmation_required'/);
});

test('each intermediate processing result releases and reclaims the same Evidence before the next transition', () => {
  assert.match(adapter, /forge_cartera020b_record_processing_result/);
  assert.match(adapter, /forge_cartera020b_claim_evidence/);
  assert.match(adapter, /workerState:\s*evidenceStatus === 'confirmation_required' \? 'COMPLETED' : 'AVAILABLE'/);
  assert.match(adapter, /reclaimSameEvidence\(client, command\)/);
  assert.match(adapter, /claimed\?\.data\?\.inboxReference !== command\.inboxReference/);
  assert.match(adapter, /leaseToken:\s*claimed\.data\.leaseToken/);
  assert.match(adapter, /stateVersion:\s*claimed\.data\.stateVersion/);
});

test('result stages have attempt-scoped idempotency and preserve packet replay identity', () => {
  assert.match(adapter, /stageIdempotencyKey/);
  assert.match(adapter, /flowToken\(\)/);
  assert.match(adapter, /`\$\{prefix\}:\$\{stage\}:\$\{flow\}`/);
  assert.match(adapter, /result\.packet = source\.packet/);
  assert.doesNotMatch(adapter, /from\(['"]cartera020b_/);
  assert.doesNotMatch(adapter, /update\(/);
  assert.doesNotMatch(adapter, /delete\(/);
});

test('Aura publishes the governed state-machine adapter with a coherent cache bust', () => {
  assert.match(index, /cartera-adapter-pages-v4\.js\?v=aura-cartera-result-state-machine-006/);
  assert.match(index, /aura-bootstrap-v4\.js\?v=aura-cartera-result-state-machine-006/);
  assert.match(bootstrap, /app-v4\.js\?v=aura-cartera-result-state-machine-006/);
});
