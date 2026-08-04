import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";

const url = (path) => new URL(`../${path}`, import.meta.url);
const read = (path) => readFile(url(path), "utf8");
const expectMissing = async (path) => {
  await assert.rejects(
    access(url(path)),
    (error) => error?.code === "ENOENT",
    `${path} must remain deleted`,
  );
};

const [
  rootIndex,
  materialApp,
  retirementRuntime,
  serviceWorker,
  pagesAcceptance,
  pagesWorkflow,
  recoveryVersioner,
] = await Promise.all([
  read("index.html"),
  read("docs/static-preview/forge-alive-material3/app.js"),
  read("docs/static-preview/forge-alive-material3/legacy-ui-retirement.js"),
  read("service-worker.js"),
  read(".github/workflows/pages-public-acceptance.yml"),
  read(".github/workflows/pages.yml"),
  read("scripts/forge-ui-recovery-cache-versioning.mjs"),
]);

await Promise.all([
  expectMissing("docs/index.html"),
  expectMissing("docs/10-gui/mobile-daily/index.html"),
  expectMissing("docs/quote-preview-live/index.html"),
  expectMissing("docs/static-preview/forge-alive/index.html"),
  expectMissing("docs/static-preview/templates/forge-mobile/index.html"),
  expectMissing("docs/static-preview/forge-alive-material3/index-quote-calculator-parity.html"),
  expectMissing("docs/static-preview/forge-alive-material3/quotes-module-complete.js"),
  expectMissing(".github/workflows/deploy-quotes-preview-pages.yml"),
]);

assert.match(rootIndex, /FORGE_LEGACY_UI_RETIRED/);
assert.match(rootIndex, /static-preview\/forge-alive/);
assert.doesNotMatch(rootIndex, /EnterpriseRouter|advisor-sales-pipeline|serviceWorker\s*\.\s*register/);

assert.match(materialApp, /legacy-ui-retirement\.js\?v=legacy-ui-retirement-001/);
assert.match(retirementRuntime, /getRegistrations\(\)/);
assert.match(retirementRuntime, /registration\.unregister\(\)/);
assert.match(retirementRuntime, /static-v7-pages-1/);
assert.match(retirementRuntime, /runtime-v7-pages-1/);
assert.match(retirementRuntime, /DOMContentLoaded/);
assert.match(retirementRuntime, /runLegacyCleanupInBackground/);
assert.match(retirementRuntime, /Promise\.race\(\[cleanup, timeout\]\)/);
assert.doesNotMatch(retirementRuntime, /addEventListener\("load"/);
assert.doesNotMatch(retirementRuntime, /^await\s+Promise\.allSettled/m);
assert.match(recoveryVersioner, /rescue=white-screen-002/);

assert.match(serviceWorker, /FORGEOS_LEGACY_SERVICE_WORKER_RETIRED/);
assert.match(serviceWorker, /self\.registration\.unregister\(\)/);
assert.doesNotMatch(serviceWorker, /respondWith|importScripts|CACHE_CONFIG/);

assert.match(pagesWorkflow, /PAGES_CANONICAL_UI_ONLY=PASS/);
assert.match(pagesWorkflow, /PAGES_LEGACY_UI_NOT_PUBLISHED=PASS/);
assert.match(pagesWorkflow, /static-preview.*quote-engine/s);
assert.doesNotMatch(pagesWorkflow, /legacyForgeAliveRuntimeTarget/);
assert.doesNotMatch(pagesWorkflow, /forge-alive-runtime\\\/nueva-cotizacion/);

assert.match(pagesAcceptance, /legacyUiAbsent/);
assert.match(pagesAcceptance, /retiredRoutesReturn404/);
assert.match(pagesAcceptance, /internalQuoteEngineGuarded/);
assert.match(pagesAcceptance, /static-preview\/forge-alive-runtime\//);
assert.match(pagesAcceptance, /status.*404/s);
assert.match(pagesAcceptance, /FORGEOS_LEGACY_SERVICE_WORKER_RETIRED/);

console.log("FORGE_LEGACY_UI_ENTRYPOINTS=DELETED");
console.log("FORGE_LEGACY_DEPLOYMENT=DELETED");
console.log("FORGE_LEGACY_SERVICE_WORKER=BACKGROUND_RETIREMENT");
console.log("FORGE_LEGACY_CACHES=BACKGROUND_PURGE");
console.log("FORGE_MATERIAL3_CANONICAL_ENTRY=ENFORCED");
