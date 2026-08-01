import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const navigation = readFileSync(
  'docs/static-preview/forge-alive-material3/forge-navigation-contract.js',
  'utf8',
);
const shell = readFileSync(
  'docs/static-preview/forge-alive-material3/forge-shell.js',
  'utf8',
);
const moduleSource = readFileSync(
  'docs/static-preview/forge-alive-material3/cartera-module.js',
  'utf8',
);
const styles = readFileSync(
  'docs/static-preview/forge-alive-material3/cartera-module.css',
  'utf8',
);

function includesAll(source, values) {
  for (const value of values) assert.ok(source.includes(value), `missing: ${value}`);
}

test('navigation exposes one available Cartera destination', () => {
  includesAll(navigation, [
    'id: "cartera"',
    'routeId: "cartera"',
    'target: "?nav=cartera"',
    'label: "Cartera"',
    'accessibilityLabel: "Abrir Cartera"',
    'availability: "available"',
    'order: 50',
  ]);
  assert.equal((navigation.match(/routeId: "cartera"/g) || []).length, 1);
});

test('route resolver no longer falls back for nav=cartera', () => {
  assert.match(navigation, /routeId === normalized/);
  assert.match(navigation, /matched\?\.availability === "available"/);
  assert.doesNotMatch(navigation, /requested === "cartera"\s*\?\s*"inicio"/);
});

test('canonical shell creates and registers the Cartera route before reconciliation', () => {
  includesAll(shell, [
    'createCarteraModule',
    'data-forge-cartera-module',
    'carteraRoot.dataset.routeModule = "cartera"',
    'routeModules.set("cartera", builtInCarteraModule)',
    'ensureBuiltInCarteraRoute();',
  ]);
  assert.ok(
    shell.indexOf('ensureBuiltInCarteraRoute();') < shell.indexOf('setAlfredState("idle", "thinking")'),
  );
});

test('productive module reuses the canonical Cartera route and accepted enhancers', () => {
  includesAll(moduleSource, [
    'import(moduleUrl("cartera.js"))',
    'bindCartera030dPolicyPaymentCalendar',
    'bindCartera040RelationshipMemory',
    'bindCartera050FutureRadar',
    'bindCartera060RelationshipGrowth',
    'bindCartera070RelationalActivation',
    'bindCartera080EconomicConnection',
    'bindCartera090RelationshipCapital',
    'bindCartera100ProductivityProof',
    'product.renderCartera()',
    'product.bindCarteraEvents()',
  ]);
});

test('enhancers bind before the base directory emits mounted events', () => {
  const binderLoop = moduleSource.indexOf('for (const bind of product.binders)');
  const baseBinding = moduleSource.indexOf('const baseBinding = product.bindCarteraEvents()');
  assert.ok(binderLoop > 0);
  assert.ok(baseBinding > binderLoop);
});

test('productive session uses the existing authenticated Supabase client', () => {
  includesAll(moduleSource, [
    'ForgeProductiveProspectBootstrap067G17B',
    'const userResult = await bootstrap.getUser()',
    'const client = await bootstrap.getClient()',
    'product.SupabaseRuntime.init(client)',
  ]);
});

test('anonymous state is honest and opens the canonical auth panel', () => {
  includesAll(moduleSource, [
    'data-forge-auth-open',
    'data-forge-auth-open-nav="cartera"',
    'Inicia sesión para ver tu cartera',
    'No mostraremos datos locales o incompletos',
  ]);
});

test('logout, route unmount and late results are rejected', () => {
  includesAll(moduleSource, [
    'requestGeneration !== generation',
    'clearProductSession("signed-out")',
    'clearProductSession("route-unmounted")',
    'runCleaners(sessionCleaners)',
    'root.replaceChildren()',
  ]);
  assert.doesNotMatch(moduleSource, /Memory\.cleanup\(\)/);
});

test('the mount has no direct write or external-effect authority', () => {
  for (const forbidden of [
    '.insert(',
    '.update(',
    '.upsert(',
    '.delete(',
    '.rpc(',
    'fetch(',
    'window.open(',
    'location.assign(',
  ]) {
    assert.equal(moduleSource.includes(forbidden), false, `forbidden effect: ${forbidden}`);
  }
  includesAll(moduleSource, [
    'readOnlyDirectory: true',
    'automaticPolicyCreation: false',
    'productiveMutationAuthorized: false',
  ]);
});

test('mobile navigation remains floating with explicit content clearance', () => {
  includesAll(styles, [
    '@media (max-width: 899px)',
    '--forge-mobile-nav-height: 108px',
    '--forge-mobile-nav-clearance: 52px',
    'grid-template-columns: repeat(3, minmax(0, 1fr))',
    'env(safe-area-inset-bottom)',
  ]);
  assert.doesNotMatch(styles, /position:\s*static/);
});

test('Cartera surface spans mobile, tablet and desktop module grids', () => {
  includesAll(styles, [
    '.cartera-module',
    'grid-column: 1 / -1',
    '@media (max-width: 560px)',
    '@media (min-width: 900px)',
  ]);
});

test('the URL contract is the public Forge Alive route requested by the user', () => {
  assert.match(navigation, /\?nav=cartera/);
  assert.equal(moduleSource.includes('routeId: "cartera"'), true);
  assert.equal(shell.includes('routeModules.set("cartera"'), true);
});
