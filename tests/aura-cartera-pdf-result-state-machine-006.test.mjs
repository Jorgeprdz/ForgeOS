import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const adapter = fs.readFileSync('docs/static-preview/forge-aura/cartera/cartera-adapter-pages-v4.js', 'utf8');
const guard = fs.readFileSync('docs/static-preview/forge-aura/cartera/cartera-adapter-pages-v5.js', 'utf8');
const index = fs.readFileSync('docs/static-preview/forge-aura/index.html', 'utf8');
const productiveChain = new Map(
  Array.from({ length: 8 }, (_, offset) => offset + 6).map(version => [
    version,
    fs.readFileSync(`docs/static-preview/forge-aura/cartera/cartera-adapter-pages-v${version}.js`, 'utf8'),
  ]),
);

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
  assert.match(adapter, /p_inbox_reference:\s*command\.inboxReference/);
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

test('Aura preserves the governed state-machine adapter through the current productive adapter chain', () => {
  assert.match(guard, /cartera-adapter-pages-v4\.js\?base=aura-cartera-invalid-date-review-007/);
  for (let version = 6; version <= 13; version += 1) {
    assert.match(
      productiveChain.get(version),
      new RegExp(`cartera-adapter-pages-v${version - 1}\\.js`),
      `v${version} must preserve v${version - 1}`,
    );
  }
  assert.match(
    index,
    /"\.\/cartera\/cartera-adapter-pages-v1\.js"\s*:\s*"\.\/cartera\/cartera-adapter-pages-v13\.js\?v=forge-aura-production-entrypoint-hotfix-011b"/,
  );
});
