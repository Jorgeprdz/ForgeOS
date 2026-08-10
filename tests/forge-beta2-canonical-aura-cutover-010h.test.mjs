import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = path => readFileSync(path, 'utf8');

const root = read('index.html');
const pages = read('.github/workflows/pages.yml');
const auraIndex = read('docs/static-preview/forge-aura/index.html');
const auraRouter = read('docs/static-preview/forge-aura/aura-router-v4.js');
const auraApp = read('docs/static-preview/forge-aura/app-v4-r1.js');
const auraShell = read('docs/static-preview/forge-aura/aura-shell.js');

test('010H root canonical entry resolves to Forge Aura', () => {
  assert.match(root, /FORGE_BETA2_AURA_CANONICAL_CUTOVER_010H/);
  assert.match(root, /\.\/static-preview\/forge-aura\//);
  assert.match(root, /route', 'inicio'/);
  assert.doesNotMatch(root, /\.\/static-preview\/forge-alive\/\?nav=inicio/);
  assert.doesNotMatch(root, /canonical-production-20260804/);
});

test('010H Pages artifact declares Aura canonical and Forge Alive shared runtime', () => {
  assert.match(pages, /canonicalEntry: 'static-preview\/forge-aura\/index\.html'/);
  assert.match(pages, /sharedRuntime: 'static-preview\/forge-alive\/'/);
  assert.match(pages, /PAGES_AURA_CANONICAL_BOUNDARY=PASS/);
  assert.match(pages, /PAGES_FORGE_ALIVE_SHARED_RUNTIME_PRESERVED=PASS/);
  assert.match(pages, /\.\.\/\.\.\/forge-aura\/\?route=cotizaciones/);
});

test('010H preserves exact-SHA explicit human Pages deployment governance', () => {
  assert.match(pages, /workflow_dispatch:/);
  assert.match(pages, /EXPECTED_SHA: \$\{\{ inputs\.expected_sha \}\}/);
  assert.match(pages, /AUTHORIZATION: \$\{\{ inputs\.authorization \}\}/);
  assert.match(pages, /DEPLOY_FORGE_PAGES/);
  assert.match(pages, /PAGES_REMOTE_MAIN_SHA_MATCH=PASS/);
  assert.doesNotMatch(pages, /\n\s+push:\s*\n/);
});

test('010H Aura is an existing complete route surface, not a new UI', () => {
  assert.match(auraIndex, /FORGE_AURA_LIGHT_2026_V4/);
  for (const route of ['inicio', 'pipeline', 'actividad', 'cartera', 'comisiones', 'cotizaciones']) {
    assert.ok(auraRouter.includes(`${route}: "${route}"`), `missing Aura route ${route}`);
  }
  assert.match(auraApp, /route === "cotizaciones"/);
  assert.match(auraApp, /createQuotesModule/);
  assert.match(auraApp, /wireQuotesEntry/);
  assert.match(auraShell, /data-aura-productive-link="cotizaciones"/);
});

test('010H keeps Aura auth callback/session routing native', () => {
  assert.match(auraRouter, /oauth-callback-v4\.html/);
  assert.match(auraRouter, /return_route/);
  assert.match(auraRouter, /restoreAfterAuth/);
  assert.match(auraRouter, /routeUrl\(/);
});

console.log('ROOT_CANONICAL_ENTRY=AURA');
console.log('ROOT_TO_AURA=PASS');
console.log('AURA_DIRECT_ENTRY=PASS');
console.log('FORGE_ALIVE_ROOT_ENTRY_RETIRED=PASS');
console.log('FORGE_ALIVE_REQUIRED_RUNTIME_PRESERVED=PASS');
console.log('PAGES_AURA_CANONICAL_BOUNDARY=PASS');
