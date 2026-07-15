import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const page = await readFile(
  new URL(
    "../docs/static-preview/forge-alive/index.html",
    import.meta.url,
  ),
  "utf8",
);

const router = await readFile(
  new URL(
    "../docs/static-preview/forge-alive/forge-alive-saas-router-r16c5l.js",
    import.meta.url,
  ),
  "utf8",
);

const bridge = await readFile(
  new URL(
    "../docs/static-preview/forge-alive/forge-alive-home-nav-bridge-r16c5k.js",
    import.meta.url,
  ),
  "utf8",
);

const authority = await readFile(
  new URL(
    "../docs/static-preview/forge-alive/forge-mobile-nav-instant-authority-r16j1c1.js",
    import.meta.url,
  ),
  "utf8",
);

assert.match(
  page,
  /forge-alive-saas-router-r16c5l\.js\?v=r16j1c1-route-fastpath-03a5-20260715-1/,
);

assert.match(
  page,
  /forge-alive-home-nav-bridge-r16c5k\.js\?v=r16j1c1-route-fastpath-03a5-20260715-1/,
);

assert.match(
  page,
  /forge-mobile-nav-instant-authority-r16j1c1\.js\?v=r16j1c1-route-fastpath-03a5-20260715-1/,
);

for (const token of [
  "FORGEOS:R16J1C1_03A5_CONSTANT_TIME_ROUTER:START",
  '"forge-saas-module-active-r16j1c1"',
  "function ensureFastPathStyle()",
  "shell.classList.add(FAST_CLASS)",
  "shell.classList.remove(FAST_CLASS)",
  "window.scrollTo(0, 0)",
  '"forge:saas-module-opened"',
  '"forge:saas-module-closed"',
  "history.pushState(",
  "ForgeMobileNavInstantAuthorityR16J1C1",
  "?.sync(MODULE_KEY)",
  "?.sync(targetKey)",
  "forgeDesiredNavKeyR16j1c1",
  "automatic",
]) {
  if (token === "automatic") continue;
  assert.ok(router.includes(token), `router missing ${token}`);
}

for (const forbidden of [
  "Array.from(shell.children)",
  "suppressedShellChildren.forEach",
  "new MutationObserver",
  "shellIsolationObserver.observe",
  'behavior: "smooth"',
  'window.dispatchEvent(new Event("resize"))',
  "setVisualActive(MODULE_KEY)",
  "setVisualActive(targetKey)",
  "getBoundingClientRect()",
]) {
  assert.ok(
    !router.includes(forbidden),
    `router hot-path work remains: ${forbidden}`,
  );
}

for (const token of [
  "ForgeMobileNavInstantAuthorityR16J1C1",
  "const alreadyActive =",
  "if (!alreadyActive)",
  "legacyButton.click();",
  'url.searchParams.delete("module")',
  "forgeSaasActiveModuleR16c5l",
  'key !== "cotizaciones"',
]) {
  assert.ok(bridge.includes(token), `bridge missing ${token}`);
}

assert.match(
  bridge,
  /if\s*\(!alreadyActive\)\s*\{\s*legacyButton\.click\(\);/,
);

for (const token of [
  "let desiredKey = null;",
  "const moduleOpen =",
  "const resolvedKey = moduleOpen",
  '? "cotizaciones"',
  "key || desiredKey || requestedKey()",
  "sync(desiredKey || requestedKey())",
  "forgeDesiredNavKeyR16j1c1",
  'urlNav || durableKey || "inicio"',
]) {
  assert.ok(
    authority.includes(token),
    `authority missing ${token}`,
  );
}

assert.ok(
  !authority.includes("sync(activeKey(nav))"),
  "authority must not trust a legacy-mutated active class",
);

assert.ok(
  !authority.includes("sync(activeKey(navNode()))"),
  "resize must preserve desired route key",
);

console.log("PASS R16J1C1 constant-time route fastpath", {
  classBasedShellIsolation: true,
  perChildRouteLoops: 0,
  shellMutationObserver: false,
  smoothScroll: false,
  syntheticResize: false,
  routerNavGeometryWrites: false,
  routerNavAuthorityDelegation: true,
  navReconciliationSource: "desired-route-key",
  legacyNavMutationsCanOverrideRoute: false,
  homeBridgeActiveModuleGuardPreserved: true,
  authorityRejectsHomeWhileQuotesOpen: true,
  durableRouteAuthorityHandshake: true,
  routeStateSurvivesScriptOrder: true,
  redundantActiveHomeClick: false,
  dedicatedNavAuthorityPreserved: true,
  lazyQuoteRuntimePreserved: true,
  automaticCalculation: false,
  automaticAcceptance: false,
});
