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

test("canonical Aura entrypoint loads the current governed wiring", () => {
  const html = readFileSync("docs/static-preview/forge-aura/index.html", "utf8");
  assert.match(html, /data-aura-runtime="FORGE_AURA_LIGHT_2026_V4"/);
  assert.match(html, /aura-bootstrap-v4-r1\.js\?v=forge-aura-live-acceptance-journal-cartera-011e/);
  assert.match(html, /env\.js\?v=forge-beta2-real-production-contract-recovery-010j/);
  assert.match(html, /"\.\/pipeline\/pipeline-adapter\.js": "\.\/pipeline\/pipeline-adapter-pages-v3\.js\?v=forge-beta2-real-production-contract-recovery-010j"/);
  assert.match(html, /"\.\/cartera\/cartera-adapter-pages-v1\.js": "\.\/cartera\/cartera-adapter-pages-v13\.js\?v=forge-aura-production-entrypoint-hotfix-011b"/);
  assert.match(html, /"\.\/cartera\/cartera-adapter-pages-v9\.js\?v=cartera-pdf-ingress-legacy-refresh": "\.\/cartera\/cartera-adapter-pages-v13\.js\?v=forge-aura-production-entrypoint-hotfix-011b"/);
  assert.match(html, /"\.\/cartera\/cartera-module-v4\.js\?v=cartera-pdf-semantic-reconciliation-012": "\.\/cartera\/cartera-module-v13-017e\.js\?v=forge-commercial-pilot-evidence-017e-r4"/);
  assert.match(html, /governed-context-presentation-014\.js\?v=forge-aura-real-user-repair-014/);
  assert.match(html, /human-language-gate-014\.js\?v=forge-aura-real-user-repair-014/);
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
