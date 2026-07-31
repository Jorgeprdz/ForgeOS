import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

const [
  rootIndex,
  legacyIndex,
  materialApp,
  retirementRuntime,
  serviceWorker,
  pagesAcceptance,
] = await Promise.all([
  read("index.html"),
  read("docs/static-preview/forge-alive/index.html"),
  read("docs/static-preview/forge-alive-material3/app.js"),
  read("docs/static-preview/forge-alive-material3/legacy-ui-retirement.js"),
  read("service-worker.js"),
  read(".github/workflows/pages-public-acceptance.yml"),
]);

assert.match(rootIndex, /FORGE_LEGACY_UI_RETIRED/);
assert.match(rootIndex, /static-preview\/forge-alive/);
assert.doesNotMatch(rootIndex, /EnterpriseRouter|advisor-sales-pipeline|serviceWorker\s*\.\s*register/);

assert.match(legacyIndex, /FORGE_LEGACY_UI_RETIRED/);
assert.match(legacyIndex, /forge-alive-runtime/);
assert.match(legacyIndex, /forge-alive-material3/);
assert.doesNotMatch(legacyIndex, /Muestra segura · solo lectura|phone-shell|forge-material3-responsive-shell/);

assert.match(materialApp, /legacy-ui-retirement\.js\?v=legacy-ui-retirement-001/);
assert.match(retirementRuntime, /getRegistrations\(\)/);
assert.match(retirementRuntime, /registration\.unregister\(\)/);
assert.match(retirementRuntime, /static-v7-pages-1/);
assert.match(retirementRuntime, /runtime-v7-pages-1/);

assert.match(serviceWorker, /FORGEOS_LEGACY_SERVICE_WORKER_RETIRED/);
assert.match(serviceWorker, /self\.registration\.unregister\(\)/);
assert.doesNotMatch(serviceWorker, /respondWith|importScripts|CACHE_CONFIG/);

assert.match(pagesAcceptance, /legacyUiAbsent/);
assert.match(pagesAcceptance, /legacyServiceWorkerRetired/);
assert.match(pagesAcceptance, /FORGE_LEGACY_UI_RETIRED/);
assert.match(pagesAcceptance, /FORGEOS_LEGACY_SERVICE_WORKER_RETIRED/);

console.log("FORGE_LEGACY_UI_PUBLIC_ENTRY=RETIRED");
console.log("FORGE_LEGACY_SERVICE_WORKER=RETIRED");
console.log("FORGE_LEGACY_CACHES=PURGED");
console.log("FORGE_MATERIAL3_CANONICAL_ENTRY=ENFORCED");
