import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const app = fs.readFileSync('docs/static-preview/forge-aura/app-v4.js', 'utf8');
const index = fs.readFileSync('docs/static-preview/forge-aura/index.html', 'utf8');
const bootstrap = fs.readFileSync('docs/static-preview/forge-aura/aura-bootstrap-v4.js', 'utf8');
const wrapper = fs.readFileSync('docs/static-preview/forge-aura/cartera/cartera-module-v3.js', 'utf8');
const rootGuard = fs.readFileSync('docs/static-preview/forge-aura/cartera/cartera-adapter-pages-v6.js', 'utf8');
const dateGuard = fs.readFileSync('docs/static-preview/forge-aura/cartera/cartera-adapter-pages-v5.js', 'utf8');

const staleModuleSpecifier = './cartera/cartera-module.js?v=aura-cartera-pdf-auth-002';

test('app imports the root-safe Cartera module directly and stale imports are also intercepted', () => {
  assert.match(app, /cartera\/cartera-module-v3\.js\?v=aura-cartera-invalid-time-value-root-009/);
  assert.ok(index.includes(`"${staleModuleSpecifier}": "./cartera/cartera-module-v3.js?v=aura-cartera-invalid-time-value-root-009"`));
  assert.match(index, /cartera-adapter-pages-v6\.js\?v=aura-cartera-invalid-time-value-root-009/);
  assert.match(bootstrap, /app-v4\.js\?v=aura-cartera-invalid-time-value-root-009-income-aura-ux-reconciliation-001/);
});

test('wrapper injects the root-safe adapter directly instead of relying on import-map side effects', () => {
  assert.match(wrapper, /cartera-adapter-pages-v6\.js\?base=aura-cartera-invalid-time-value-root-009/);
  assert.match(wrapper, /adapterFactory:\s*createRootSafeCarteraAdapter/);
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
