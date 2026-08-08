import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const app = fs.readFileSync('docs/static-preview/forge-aura/app-v4.js', 'utf8');
const index = fs.readFileSync('docs/static-preview/forge-aura/index.html', 'utf8');
const bootstrap = fs.readFileSync('docs/static-preview/forge-aura/aura-bootstrap-v4.js', 'utf8');
const wrapper = fs.readFileSync('docs/static-preview/forge-aura/cartera/cartera-module-v3.js', 'utf8');
const reopenGuard = fs.readFileSync('docs/static-preview/forge-aura/cartera/cartera-adapter-pages-v7.js', 'utf8');
const rootGuard = fs.readFileSync('docs/static-preview/forge-aura/cartera/cartera-adapter-pages-v6.js', 'utf8');
const dateGuard = fs.readFileSync('docs/static-preview/forge-aura/cartera/cartera-adapter-pages-v5.js', 'utf8');

const staleModuleSpecifier = './cartera/cartera-module.js?v=aura-cartera-pdf-auth-002';

test('app imports the reopen-safe Cartera module directly and stale imports are also intercepted', () => {
  assert.match(app, /cartera\/cartera-module-v3\.js\?v=aura-cartera-pdf-already-admitted-reopen-011/);
  assert.ok(index.includes(`"${staleModuleSpecifier}": "./cartera/cartera-module-v3.js?v=aura-cartera-pdf-already-admitted-reopen-011"`));
  assert.match(index, /cartera-adapter-pages-v7\.js\?v=aura-cartera-pdf-already-admitted-reopen-011/);
  assert.match(bootstrap, /app-v4\.js\?v=aura-cartera-pdf-already-admitted-reopen-011-income-aura-ux-reconciliation-001/);
});

test('wrapper injects v7 directly instead of relying on import-map side effects', () => {
  assert.match(wrapper, /cartera-adapter-pages-v7\.js\?base=aura-cartera-pdf-already-admitted-reopen-011/);
  assert.match(wrapper, /options\.adapterFactory \|\| createRootSafeCarteraAdapter/);
});

test('v7 reopens a persisted PENDING_CONFIRMATION packet before reprocessing the same PDF', () => {
  assert.match(reopenGuard, /cartera020b_policy_evidence_packets/);
  assert.match(reopenGuard, /PENDING_CONFIRMATION/);
  assert.match(reopenGuard, /resumedExistingReview:\s*true/);
  assert.match(reopenGuard, /if \(existingReview\) return existingReview/);
  const findIndex = reopenGuard.indexOf('findPendingReview(client, digest)');
  const processIndex = reopenGuard.indexOf('return adapter.processPdf(file, options)');
  assert.ok(findIndex >= 0 && processIndex > findIndex);
});

test('PDF candidate dates are sanitized before the base 020B adapter sees Edge Function data', () => {
  assert.match(rootGuard, /clientWithSanitizedPdfExtraction/);
  assert.match(rootGuard, /data:\s*sanitizePdfPayload\(result\.data\)/);
  const sanitizeIndex = rootGuard.indexOf('clientWithSanitizedPdfExtraction(client)');
  const adapterIndex = rootGuard.indexOf('createGuardedAdapter({');
  assert.ok(sanitizeIndex >= 0 && adapterIndex > sanitizeIndex);
});

test('invalid dates are rejected before any toISOString call', () => {
  assert.match(dateGuard, /Number\.isNaN\(parsed\.getTime\(\)\)/);
  const guardIndex = dateGuard.indexOf('Number.isNaN(parsed.getTime())');
  const isoIndex = dateGuard.indexOf('parsed.toISOString()');
  assert.ok(guardIndex >= 0 && isoIndex > guardIndex);
});
