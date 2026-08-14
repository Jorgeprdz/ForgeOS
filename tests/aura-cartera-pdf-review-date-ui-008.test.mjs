import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const app = fs.readFileSync('docs/static-preview/forge-aura/app-v4-r1.js', 'utf8');
const index = fs.readFileSync('docs/static-preview/forge-aura/index.html', 'utf8');
const bootstrap = fs.readFileSync('docs/static-preview/forge-aura/aura-bootstrap-v4-r1.js', 'utf8');
const moduleV5 = fs.readFileSync('docs/static-preview/forge-aura/cartera/cartera-module-v5.js', 'utf8');
const moduleV12Phase015 = fs.readFileSync('docs/static-preview/forge-aura/cartera/cartera-module-v12-015.js', 'utf8');
const v13 = fs.readFileSync('docs/static-preview/forge-aura/cartera/cartera-adapter-pages-v13.js', 'utf8');
const v12 = fs.readFileSync('docs/static-preview/forge-aura/cartera/cartera-adapter-pages-v12.js', 'utf8');
const v11 = fs.readFileSync('docs/static-preview/forge-aura/cartera/cartera-adapter-pages-v11.js', 'utf8');
const v10 = fs.readFileSync('docs/static-preview/forge-aura/cartera/cartera-adapter-pages-v10.js', 'utf8');
const v9 = fs.readFileSync('docs/static-preview/forge-aura/cartera/cartera-adapter-pages-v9.js', 'utf8');
const v8 = fs.readFileSync('docs/static-preview/forge-aura/cartera/cartera-adapter-pages-v8.js', 'utf8');
const v7 = fs.readFileSync('docs/static-preview/forge-aura/cartera/cartera-adapter-pages-v7.js', 'utf8');
const semantic = fs.readFileSync('docs/static-preview/forge-aura/cartera/cartera-semantic-v1.js', 'utf8');

test('canonical Aura r1 maps inherited Cartera specifier through phase015 and current v13 durable chains', () => {
  assert.match(app, /cartera\/cartera-module-v4\.js\?v=cartera-pdf-semantic-reconciliation-012/);
  assert.match(index, /"\.\/cartera\/cartera-adapter-pages-v9\.js\?v=cartera-pdf-ingress-legacy-refresh": "\.\/cartera\/cartera-adapter-pages-v13\.js\?v=forge-aura-production-entrypoint-hotfix-011b"/);
  assert.match(index, /"\.\/cartera\/cartera-module-v4\.js\?v=cartera-pdf-semantic-reconciliation-012": "\.\/cartera\/cartera-module-v13-017e\.js\?v=forge-commercial-pilot-evidence-017e-r4"/);
  assert.match(moduleV12Phase015, /cartera-module-v10-013\.js\?v=forge-commercial-compass-015-base/);
  assert.match(index, /aura-bootstrap-v4-r1\.js\?v=forge-aura-live-acceptance-journal-cartera-011e/);
  assert.match(bootstrap, /app-v4-r1\.js\?v=aura-boot-cache-isolation-013/);
  assert.match(v13, /cartera-adapter-pages-v12\.js/);
  assert.match(v12, /cartera-adapter-pages-v11\.js/);
  assert.match(v11, /cartera-adapter-pages-v10\.js/);
  assert.match(v10, /cartera-adapter-pages-v9\.js\?base=cartera-020c-policy-attach-pipeline-person-015/);
});

test('current module keeps semantic review while unifying drop through the hidden input', () => {
  assert.match(moduleV5, /createBaseCarteraModule/);
  assert.match(moduleV5, /createSemanticCarteraAdapter/);
  assert.match(moduleV5, /cartera-adapter-pages-v9/);
  assert.match(moduleV5, /MutationObserver/);
  assert.match(moduleV5, /data-semantic-review="014"/);
  assert.match(moduleV5, /semanticReviewCompleteness/);
  assert.match(moduleV5, /input\.dispatchEvent\(new windowRef\.Event\('change'/);
});

test('v10 preserves v9 refresh and accepted v8 to v1 semantic chain', () => {
  assert.match(v10, /cartera-adapter-pages-v9\.js/);
  assert.match(v9, /cartera-adapter-pages-v8\.js/);
  assert.match(v9, /forge_cartera020b_refresh_pending_packet_semantics/);
  assert.match(v8, /cartera-adapter-pages-v7\.js\?base=cartera-pdf-semantic-completion-014/);
  assert.match(v8, /pdfSemanticCompletion014:\s*true/);
  assert.match(v7, /cartera-adapter-pages-v6\.js\?base=cartera-pdf-already-admitted-reopen-011/);
  assert.match(v7, /cartera020b_policy_evidence_packets/);
  assert.match(v7, /PENDING_CONFIRMATION/);
  assert.match(v7, /resumedExistingReview:\s*true/);
});

test('civil date helper performs no UTC date-only conversion', () => {
  assert.match(semantic, /normalizeCivilDate/);
  assert.match(semantic, /formatCivilDateEs/);
  assert.doesNotMatch(semantic, /new Date\(\s*["'`]?\d{4}-\d{2}-\d{2}/);
  assert.doesNotMatch(semantic, /toISOString\(\)\.slice\(0,\s*10\)/);
});