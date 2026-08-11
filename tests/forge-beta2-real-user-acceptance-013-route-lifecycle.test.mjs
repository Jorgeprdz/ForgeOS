import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createAuraRouter } from '../docs/static-preview/forge-aura/aura-router-v4.js';

const appPath = new URL('../docs/static-preview/forge-aura/app-v4-r1.js', import.meta.url);

function fakeWindow(start = 'https://forge.invalid/static-preview/forge-aura/index.html?route=inicio') {
  const listeners = new Map();
  const stack = [start];
  let index = 0;
  const location = { href: start };
  const emit = type => {
    for (const listener of listeners.get(type) || []) listener({ type });
  };
  const apply = url => { location.href = new URL(url, location.href).href; };
  return {
    location,
    history: {
      pushState(_state, _title, url) {
        stack.splice(index + 1);
        stack.push(new URL(url, location.href).href);
        index = stack.length - 1;
        apply(stack[index]);
      },
      replaceState(_state, _title, url) {
        stack[index] = new URL(url, location.href).href;
        apply(stack[index]);
      },
      back() {
        if (index === 0) return;
        index -= 1;
        apply(stack[index]);
        emit('popstate');
      },
      forward() {
        if (index >= stack.length - 1) return;
        index += 1;
        apply(stack[index]);
        emit('popstate');
      },
    },
    addEventListener(type, listener) {
      if (!listeners.has(type)) listeners.set(type, new Set());
      listeners.get(type).add(listener);
    },
    removeEventListener(type, listener) {
      listeners.get(type)?.delete(listener);
    },
  };
}

test('RU05 Level 1: app lifecycle isolates candidates, settles operations and never reloads the page', async () => {
  const app = await readFile(appPath, 'utf8');
  assert.match(app, /function settleWithin\(/);
  assert.match(app, /ROUTE_FACTORY_SETTLE_MS/);
  assert.match(app, /ROUTE_MOUNT_SETTLE_MS/);
  assert.match(app, /ROUTE_CLEANUP_SETTLE_MS/);
  assert.match(app, /createRouteHost\(currentShell, route, revision\)/);
  assert.match(app, /createRouteModule\(route, currentShell, routeHost, client, snapshot\)/);
  assert.match(app, /let candidate = null;/);
  assert.match(app, /await settleWithin\(\s*\(\) => candidate\.mount\(\)/);
  assert.ok(
    app.indexOf('await settleWithin(\n      () => candidate.mount()') < app.indexOf('activeModule = candidate;'),
    'candidate must not become active before mount settles',
  );
  assert.match(app, /revision !== bootRevision/);
  assert.match(app, /routeHost\.remove\(\)/);
  assert.doesNotMatch(app, /location\.reload\s*\(/);
  assert.doesNotMatch(app, /window\.location\.reload\s*\(/);
});

test('RU05 Level 2: real Aura router survives 50 transitions plus back/forward without document navigation', () => {
  const windowRef = fakeWindow();
  const seen = [];
  const router = createAuraRouter({ windowRef, onChange: route => seen.push(route) });
  const routes = ['inicio', 'pipeline', 'cartera', 'actividad', 'comisiones', 'cotizaciones'];

  for (let index = 0; index < 50; index += 1) {
    router.navigate(routes[index % routes.length]);
    assert.equal(router.current(), routes[index % routes.length]);
  }
  assert.equal(seen.length, 50);
  assert.equal(router.current(), routes[49 % routes.length]);

  const beforeBack = router.current();
  windowRef.history.back();
  assert.notEqual(router.current(), beforeBack);
  const afterBack = router.current();
  windowRef.history.forward();
  assert.equal(router.current(), beforeBack);
  assert.notEqual(router.current(), afterBack);

  router.destroy();
});
