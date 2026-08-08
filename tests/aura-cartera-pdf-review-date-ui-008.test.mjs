import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const app = fs.readFileSync('docs/static-preview/forge-aura/app-v4.js', 'utf8');
const index = fs.readFileSync('docs/static-preview/forge-aura/index.html', 'utf8');
const bootstrap = fs.readFileSync('docs/static-preview/forge-aura/aura-bootstrap-v4.js', 'utf8');
const wrapper = fs.readFileSync('docs/static-preview/forge-aura/cartera/cartera-module-v2.js', 'utf8');
const guard = fs.readFileSync('docs/static-preview/forge-aura/cartera/cartera-adapter-pages-v5.js', 'utf8');

const currentModuleSpecifier = './cartera/cartera-module.js?v=aura-cartera-pdf-auth-002';

test('current app Cartera module specifier is intercepted by the review-safe wrapper', () => {
  assert.match(app, /cartera\/cartera-module\.js\?v=aura-cartera-pdf-auth-002/);
  assert.ok(index.includes(`"${currentModuleSpecifier}": "./cartera/cartera-module-v2.js?v=aura-cartera-review-date-ui-008"`));
  assert.match(bootstrap, /app-v4\.js\?v=aura-cartera-review-date-ui-008-income-aura-ux-reconciliation-001/);
});

test('wrapper injects the guarded adapter directly instead of relying on the base module default import', () => {
  assert.match(wrapper, /cartera-adapter-pages-v5\.js\?base=aura-cartera-review-date-ui-008/);
  assert.match(wrapper, /adapterFactory:\s*createReviewSafeAdapter/);
  assert.match(wrapper, /sanitizePdfReview\(review\)/);
});

test('invalid dates are rejected before any toISOString call', () => {
  assert.match(guard, /Number\.isNaN\(parsed\.getTime\(\)\)/);
  const guardIndex = guard.indexOf('Number.isNaN(parsed.getTime())');
  const isoIndex = guard.indexOf('parsed.toISOString()');
  assert.ok(guardIndex >= 0 && isoIndex > guardIndex);
});
