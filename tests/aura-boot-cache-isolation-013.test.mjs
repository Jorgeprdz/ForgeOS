import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const bootstrap = readFileSync("docs/static-preview/forge-aura/aura-bootstrap-v4-r1.js", "utf8");
const app = readFileSync("docs/static-preview/forge-aura/app-v4-r1.js", "utf8");
const homeBridge = readFileSync("docs/static-preview/forge-aura/home/home-module-008.js", "utf8");
const pipelineBridge = readFileSync("docs/static-preview/forge-aura/recomposition/pipeline-consumer-bridge-008.js", "utf8");

test("Aura cache-isolated bootstrap retires only governed legacy runtime state", () => {
  assert.match(bootstrap, /AURA_BOOT_V4_R1_CACHE_ISOLATION_013/);
  assert.match(bootstrap, /static-v7-pages-1/);
  assert.match(bootstrap, /runtime-v7-pages-1/);
  assert.match(bootstrap, /caches\.keys\(\)/);
  assert.match(bootstrap, /navigator\.serviceWorker\.getRegistrations\(\)/);
  assert.match(bootstrap, /registration\.unregister\(\)/);
  assert.match(bootstrap, /scope\.pathname\.includes\("\/ForgeOS\/"\)/);
  assert.match(bootstrap, /auraPipelineRouteRecovery = "011H"/);
  assert.match(bootstrap, /app-v4-r1\.js\?v=aura-pipeline-route-recovery-011h/);
  assert.match(bootstrap, /BOOT_IMPORT_OK/);
  assert.match(bootstrap, /AURA_BOOT_R1_IMPORT_FAILED/);
});

test("Aura base boot lazy-loads every productive route and Pipeline fails closed instead of blank", () => {
  const staticImports = [...app.matchAll(/^import\s+.*from\s+["']([^"']+)["'];/gm)].map(match => match[1]);
  assert.deepEqual(staticImports, [
    "./aura-router-v4.js",
    "./aura-shell.js",
    "./aura-auth-v4.js",
  ]);

  assert.match(app, /import\("\.\/home\/home-module-008\.js\?v=forge-global-aura-recomposition-008"\)/);
  assert.match(app, /import\("\.\/recomposition\/pipeline-consumer-bridge-011b\.js\?v=aura-pipeline-route-recovery-011h"\)/);
  assert.match(homeBridge, /from "\.\/home-module\.js"/);
  assert.match(pipelineBridge, /from "\.\.\/pipeline\/pipeline-module\.js"/);
  assert.match(pipelineBridge, /from "\.\.\/pipeline\/pipeline-adapter\.js"/);

  assert.match(app, /import\("\.\/activity\/activity-module\.js\?v=activity-reports-ux-001-corrected"\)/);
  assert.match(app, /import\("\.\/cartera\/cartera-module-v4\.js\?v=cartera-pdf-semantic-reconciliation-012"\)/);
  assert.match(app, /import\("\.\/income\/income-module\.js\?v=income-aura-ux-reconciliation-001"\)/);
  assert.match(app, /import\("\.\/quotes\/quotes-module\.js\?v=aura-quotes-product-intelligence-001"\)/);
  assert.match(app, /renderRouteLoading/);
  assert.match(app, /routeDeadline\(auth\.getClient\(\), route, "CLIENT", 8000\)/);
  assert.match(app, /routeDeadline\(createRouteModule\(route, currentShell, client, snapshot\), route, "FACTORY", 12000\)/);
  assert.match(app, /currentShell\.main\.dataset\.auraRouteState = "LOAD_ERROR"/);
  assert.match(app, /wireQuotesEntry/);
  assert.match(app, /forge:alfred-navigation/);
  assert.match(app, /AURA_ROUTE_LOAD_FAILED/);
  assert.match(app, /data-aura-route-state="LOAD_ERROR"/);
  assert.match(app, /CONTINUIDAD DE DECISIÓN/);
  assert.match(app, /router\.clearContext\(\)/);
});
