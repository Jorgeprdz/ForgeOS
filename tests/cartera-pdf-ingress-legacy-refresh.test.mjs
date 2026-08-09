import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = path => fs.readFileSync(path, 'utf8');
const adapter = read('docs/static-preview/forge-aura/cartera/cartera-adapter-pages-v9.js');
const module = read('docs/static-preview/forge-aura/cartera/cartera-module-v5.js');
const migration = read('supabase/migrations/20260809000100_cartera020b_semantic_refresh_rpc.sql');
const index = read('docs/static-preview/forge-aura/index.html');
const fixture = read('tests/fixtures/aura-cartera-pdf-ingress-parity.html');
const e2e = read('tests/e2e/aura-cartera-pdf-ingress-parity.spec.mjs');

test('legacy pending packet refresh is append-only and governed', () => {
  assert.match(migration, /security definer/i);
  assert.match(migration, /forge_cartera020b_refresh_pending_packet_semantics/);
  assert.match(migration, /insert into public\.cartera020b_extraction_attempts/i);
  assert.match(migration, /insert into public\.cartera020b_extraction_candidates/i);
  assert.match(migration, /insert into public\.cartera020b_policy_evidence_packets/i);
  assert.doesNotMatch(migration, /update\s+public\.cartera020b_policy_evidence_packets/i);
  assert.doesNotMatch(migration, /delete\s+from\s+public\.cartera020b_policy_evidence_packets/i);
  assert.match(migration, /PENDING_CONFIRMATION/);
  assert.match(migration, /creates_truth[\s\S]*false/i);
  assert.match(migration, /forge_cartera020b_has_forbidden_payload_keys\(extracted_fields, 0\)/);
  assert.match(migration, /revoke all on function[\s\S]*from public, anon, authenticated/i);
  assert.match(migration, /grant execute on function[\s\S]*to authenticated/i);
});

test('legacy NORMAL status is explicitly reclassified as policy type before semantic enrichment', () => {
  assert.match(adapter, /legacyStatus[\s\S]*=== 'NORMAL'/);
  assert.match(adapter, /policyType[\s\S]*value: 'NORMAL'/);
  assert.match(adapter, /status =?\s*\{/);
  assert.match(adapter, /value: null/);
  assert.match(adapter, /NOT_POLICY_STATUS_POLICY_TYPE_NORMAL/);
});

test('same-PDF refresh prefers an existing semantic refresh packet before invoking Edge again', () => {
  const processBlock = adapter.slice(adapter.indexOf('async processPdf(file'));
  const firstRefreshRead = processBlock.indexOf('findRefreshPacket');
  const refreshCall = processBlock.indexOf('refreshLegacyPacket');
  assert.ok(firstRefreshRead >= 0 && refreshCall > firstRefreshRead);
  assert.match(adapter, /POLICY_PACKET:AURA:SEMANTIC_REFRESH:/);
  assert.match(adapter, /forge_cartera020b_refresh_pending_packet_semantics/);
});

test('pending review list deduplicates stale and refreshed packets by document and prefers semantic refresh', () => {
  assert.match(adapter, /pendingReviewRefreshDeduplication:\s*true/);
  assert.match(adapter, /function pendingReviewKey\(review\)/);
  assert.match(adapter, /split\(':'\)\.filter\(Boolean\)\.at\(-1\)/);
  assert.match(adapter, /function dedupePendingReviews\(reviews = \[\]\)/);
  assert.match(adapter, /includes\(':SEMANTIC_REFRESH:'\)/);
  assert.match(adapter, /if \(!current \|\| \(refreshed && !currentRefreshed\)\) byDocument\.set\(key, review\)/);
  const listBlock = adapter.slice(adapter.indexOf('async listPendingEvidenceReviews()'));
  assert.match(listBlock, /adapter\.listPendingEvidenceReviews\(\)/);
  assert.match(listBlock, /dedupePendingReviews\(reviews\)/);
});

test('drag and drop is normalized into the exact hidden input change pipeline', () => {
  assert.match(module, /dataTransfer\?\.items/);
  assert.match(module, /getAsFile/);
  assert.match(module, /application\/pdf/);
  assert.match(module, /new TransferCtor\(\)/);
  assert.match(module, /input\.files = transfer\.files/);
  assert.match(module, /dispatchEvent\(new windowRef\.Event\('change'/);
  assert.match(module, /addEventListener\('drop', onDropCapture, true\)/);
  assert.match(module, /stopImmediatePropagation/);
});

test('canonical Aura import graph points Cartera to parity module and legacy-refresh adapter', () => {
  assert.match(index, /cartera-module-v5\.js\?v=cartera-pdf-ingress-legacy-refresh/);
  assert.match(index, /cartera-adapter-pages-v9\.js\?v=cartera-pdf-ingress-legacy-refresh/);
  assert.match(index, /aura-bootstrap-v4-r1\.js\?v=cartera-pdf-ingress-legacy-refresh/);
});

test('browser harness starts from the production legacy defect rather than a clean semantic packet', () => {
  assert.match(fixture, /POLICY_COVERAGE_EXTRACTION_NOT_SUPPORTED/);
  assert.match(fixture, /status: field\('NORMAL'\)/);
  assert.match(fixture, /premiumAmount: field\('6,816\.96'\)/);
  assert.doesNotMatch(fixture, /policyType: field\('NORMAL'\)/);
  assert.match(fixture, /let refreshPacket = null/);
});

test('GitHub browser suite contains three independent checks per ingress plus parity', () => {
  for (const label of [
    'selector check 1/3', 'selector check 2/3', 'selector check 3/3',
    'drag drop check 1/3', 'drag drop check 2/3', 'drag drop check 3/3',
  ]) assert.match(e2e, new RegExp(label.replace('/', '\\/')));
  assert.match(e2e, /selector and drag drop produce identical digest and semantic snapshot/);
  assert.match(e2e, /application\/octet-stream/);
  assert.match(e2e, /itemsOnly: true/);
});
