import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const app = fs.readFileSync('docs/static-preview/forge-aura/app-v4-r1.js', 'utf8');
const index = fs.readFileSync('docs/static-preview/forge-aura/index.html', 'utf8');
const bootstrap = fs.readFileSync('docs/static-preview/forge-aura/aura-bootstrap-v4-r1.js', 'utf8');
const moduleV4 = fs.readFileSync('docs/static-preview/forge-aura/cartera/cartera-module-v4.js', 'utf8');
const v8 = fs.readFileSync('docs/static-preview/forge-aura/cartera/cartera-adapter-pages-v8.js', 'utf8');
const v7 = fs.readFileSync('docs/static-preview/forge-aura/cartera/cartera-adapter-pages-v7.js', 'utf8');
const semantic = fs.readFileSync('docs/static-preview/forge-aura/cartera/cartera-semantic-v1.js', 'utf8');

test('canonical Aura r1 maps the inherited Cartera specifier to semantic completion 014', () => {
  assert.match(app, /cartera\/cartera-module-v4\.js\?v=cartera-pdf-semantic-reconciliation-012/);
  assert.match(index, /cartera-adapter-pages-v8\.js\?v=cartera-pdf-semantic-completion-014/);
  assert.match(index, /"\.\/cartera\/cartera-module-v4\.js\?v=cartera-pdf-semantic-reconciliation-012": "\.\/cartera\/cartera-module-v4\.js\?v=cartera-pdf-semantic-completion-014"/);
  assert.match(index, /aura-bootstrap-v4-r1\.js\?v=cartera-pdf-semantic-completion-014/);
  assert.match(bootstrap, /app-v4-r1\.js\?v=aura-boot-cache-isolation-013/);
});

test('module v4 injects semantic v8 without replacing unrelated Cartera surfaces', () => {
  assert.match(moduleV4, /createBaseCarteraModule/);
  assert.match(moduleV4, /createSemanticCarteraAdapter/);
  assert.match(moduleV4, /MutationObserver/);
  assert.match(moduleV4, /data-semantic-review="014"/);
  assert.match(moduleV4, /semanticReviewCompleteness/);
});

test('v8 still wraps the accepted v7 to v1 chain', () => {
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