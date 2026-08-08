import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createAuraRouter } from "../docs/static-preview/forge-aura/aura-router-v4.js";

function createWindow(initialHref) {
  let href = new URL(initialHref).href;
  const listeners = new Map();
  const setHref = next => { href = new URL(String(next), href).href; };
  return {
    location: { get href() { return href; } },
    history: {
      pushState(_state, _title, next) { setHref(next); },
      replaceState(_state, _title, next) { setHref(next); },
    },
    addEventListener(type, handler) { listeners.set(type, handler); },
    removeEventListener(type) { listeners.delete(type); },
  };
}

test("canonical Aura entrypoint loads the cache-isolated v4 runtime", () => {
  const html = readFileSync("docs/static-preview/forge-aura/index.html", "utf8");
  assert.match(html, /data-aura-runtime="FORGE_AURA_LIGHT_2026_V4"/);
  assert.match(html, /aura-bootstrap-v4-r1\.js\?v=aura-boot-cache-isolation-013/);
  assert.match(html, /env\.js\?v=aura-boot-cache-isolation-013/);
  assert.match(html, /pipeline-adapter-pages-v1\.js/);
  assert.doesNotMatch(html, /src="\.\/aura-bootstrap\.js/);
  assert.doesNotMatch(html, /src="\.\/aura-bootstrap-v4\.js/);
});

test("direct Activity route survives an unauthenticated login roundtrip", () => {
  const windowRef = createWindow("https://example.test/ForgeOS/static-preview/forge-aura/?route=actividad");
  const seen = [];
  const router = createAuraRouter({ windowRef, onChange: route => seen.push(route) });
  router.navigate("login", { replace: true });
  assert.equal(router.current(), "login");
  router.restoreAfterAuth();
  assert.equal(router.current(), "actividad");
  assert.match(windowRef.location.href, /route=actividad/);
  assert.deepEqual(seen, ["login", "actividad"]);
});

test("direct Activity route survives authenticated session restoration", () => {
  const windowRef = createWindow("https://example.test/ForgeOS/static-preview/forge-aura/?route=actividad");
  const router = createAuraRouter({ windowRef });
  router.restoreAfterAuth();
  assert.equal(router.current(), "actividad");
});

test("default Aura entrypoint restores canonical Inicio", () => {
  const windowRef = createWindow("https://example.test/ForgeOS/static-preview/forge-aura/");
  const router = createAuraRouter({ windowRef });
  router.navigate("login", { replace: true });
  router.restoreAfterAuth();
  assert.equal(router.current(), "inicio");
  assert.match(windowRef.location.href, /route=inicio/);
});

test("explicit Pipeline route remains restorable", () => {
  const windowRef = createWindow("https://example.test/ForgeOS/static-preview/forge-aura/?route=pipeline");
  const router = createAuraRouter({ windowRef });
  router.navigate("login", { replace: true });
  router.restoreAfterAuth();
  assert.equal(router.current(), "pipeline");
  assert.match(windowRef.location.href, /route=pipeline/);
});

test("explicit Quotes route remains restorable after hotfix", () => {
  const windowRef = createWindow("https://example.test/ForgeOS/static-preview/forge-aura/?route=cotizaciones");
  const router = createAuraRouter({ windowRef });
  router.navigate("login", { replace: true });
  router.restoreAfterAuth();
  assert.equal(router.current(), "cotizaciones");
  assert.match(windowRef.location.href, /route=cotizaciones/);
});
