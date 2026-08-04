import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";

const url = (path) => new URL(`../${path}`, import.meta.url);
const read = (path) => readFile(url(path), "utf8");
const expectPresent = (path) => access(url(path));
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
  earlyAuth,
  pipelineModule,
  quotesModule,
  quoteEngine,
  materialManifest,
  retirementRuntime,
  serviceWorker,
  pagesAcceptance,
  pagesWorkflow,
  recoveryVersioner,
] = await Promise.all([
  read("index.html"),
  read("docs/static-preview/forge-alive-material3/app.js"),
  read("docs/static-preview/forge-alive-material3/early-auth-bootstrap.js"),
  read("docs/static-preview/forge-alive-material3/pipeline-module.js"),
  read("docs/static-preview/forge-alive-material3/quotes-module.js"),
  read("docs/static-preview/quote-engine/nueva-cotizacion/index.html"),
  read("docs/static-preview/forge-alive-material3/manifest.json"),
  read("docs/static-preview/forge-alive-material3/legacy-ui-retirement.js"),
  read("service-worker.js"),
  read(".github/workflows/pages-public-acceptance.yml"),
  read(".github/workflows/pages.yml"),
  read("scripts/forge-ui-recovery-cache-versioning.mjs"),
]);

await Promise.all([
  expectPresent("docs/static-preview/forge-alive-material3/forge-alive-public-config-067g17a1.js"),
  expectPresent("docs/static-preview/forge-alive-material3/forge-alive-auth-entry-067g17b1.js"),
  expectPresent("docs/static-preview/forge-alive-material3/forge-alive-auth-entry-067g17b1.css"),
  expectPresent("docs/static-preview/quote-engine/nueva-cotizacion/index.html"),
  expectPresent("docs/static-preview/quote-engine/forge-sales-presentation-entrypoint-r16j0.js"),
  expectMissing("docs/index.html"),
  expectMissing("docs/10-gui"),
  expectMissing("docs/quote-preview-live"),
  expectMissing("docs/static-preview/forge-alive"),
  expectMissing("docs/static-preview/templates"),
  expectMissing("docs/static-preview/forge-alive-material3/index-quote-calculator-parity.html"),
  expectMissing("docs/static-preview/forge-alive-material3/quotes-module-complete.js"),
  expectMissing(".github/workflows/deploy-quotes-preview-pages.yml"),
  expectMissing(".github/workflows/retire-legacy-ui-source-rewrite.yml"),
  expectMissing(".github/workflows/purge-retired-ui-tree.yml"),
]);

assert.match(rootIndex, /FORGE_LEGACY_UI_RETIRED/);
assert.match(rootIndex, /static-preview\/forge-alive/);
assert.match(rootIndex, /target\.hash = current\.hash/);
assert.doesNotMatch(rootIndex, /EnterpriseRouter|advisor-sales-pipeline|serviceWorker\s*\.\s*register/);

assert.match(materialApp, /legacy-ui-retirement\.js\?v=legacy-ui-retirement-001/);
for (const [name, source] of [
  ["app.js", materialApp],
  ["early-auth-bootstrap.js", earlyAuth],
  ["pipeline-module.js", pipelineModule],
]) {
  assert.doesNotMatch(source, /forge-alive-runtime/, `${name} cannot load the retired runtime`);
  assert.doesNotMatch(source, /\.\.\/forge-alive\//, `${name} cannot load the retired source tree`);
}
assert.match(earlyAuth, /forge-alive-public-config-067g17a1\.js', moduleBase/);
assert.match(earlyAuth, /forge-alive-auth-entry-067g17b1\.js', moduleBase/);
assert.match(materialApp, /forge-alive-auth-entry-067g17b1\.css", moduleBase/);
assert.match(pipelineModule, /forge-alive-public-config-067g17a1\.js", moduleBase/);
assert.match(quotesModule, /\.\.\/quote-engine\/nueva-cotizacion\/index\.html/);
assert.doesNotMatch(quotesModule, /forge-alive-runtime|\.\.\/forge-alive\//);
assert.match(quoteEngine, /data-forge-module="dedicated-new-quote-static-route"/);
assert.doesNotMatch(materialManifest, /forge-alive-runtime|\.\.\/forge-alive\//);

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
assert.match(pagesWorkflow, /docs\/static-preview\/quote-engine\/nueva-cotizacion\/index\.html/);
assert.match(pagesWorkflow, /retired Quotes navigation survived engine isolation/);
assert.doesNotMatch(pagesWorkflow, /legacyForgeAliveRuntimeTarget/);
assert.doesNotMatch(pagesWorkflow, /docs\/static-preview\/forge-alive\/nueva-cotizacion/);

assert.match(pagesAcceptance, /legacyUiAbsent/);
assert.match(pagesAcceptance, /retiredRoutesReturn404/);
assert.match(pagesAcceptance, /internalQuoteEngineGuarded/);
assert.match(pagesAcceptance, /static-preview\/forge-alive-runtime\//);
assert.match(pagesAcceptance, /status.*404/s);
assert.match(pagesAcceptance, /FORGEOS_LEGACY_SERVICE_WORKER_RETIRED/);

console.log("FORGE_LEGACY_UI_SOURCE_TREES=DELETED");
console.log("FORGE_LEGACY_UI_ENTRYPOINTS=DELETED");
console.log("FORGE_LEGACY_DEPLOYMENT=DELETED");
console.log("FORGE_PRODUCTIVE_AUTHORITY=CANONICAL_ONLY");
console.log("FORGE_PRODUCTIVE_PIPELINE=CANONICAL_ONLY");
console.log("FORGE_QUOTE_ENGINE=ISOLATED_ONLY");
console.log("FORGE_LEGACY_SERVICE_WORKER=BACKGROUND_RETIREMENT");
console.log("FORGE_LEGACY_CACHES=BACKGROUND_PURGE");
console.log("FORGE_MATERIAL3_CANONICAL_ENTRY=ENFORCED");
