import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const siteRoot = path.resolve(process.env.SITE_ROOT || "_site");
const read = relative => fs.readFileSync(path.join(siteRoot, relative), "utf8");
const exists = relative => fs.existsSync(path.join(siteRoot, relative));

test("canonical Pages artifact publishes every Aura Income transitive asset", () => {
  for (const relative of [
    "static-preview/forge-aura/income/income-core.js",
    "static-preview/forge-aura/income/income-adapter-pages-v1.js",
    "static-preview/forge-aura/income/income-module.js",
    "static-preview/forge-aura/income/income.css",
  ]) {
    assert.equal(exists(relative), true, `Missing canonical Pages asset: ${relative}`);
  }
});

test("canonical Aura runtime mounts route=comisiones as visible Ingresos", () => {
  const app = read("static-preview/forge-aura/app-v4.js");
  const router = read("static-preview/forge-aura/aura-router-v4.js");
  const shell = read("static-preview/forge-aura/aura-shell.js");
  const bootstrap = read("static-preview/forge-aura/aura-bootstrap-v4.js");
  const index = read("static-preview/forge-aura/index.html");
  assert.match(app, /createIncomeModule/);
  assert.match(app, /route === "comisiones"/);
  assert.match(app, /income\/income\.css/);
  assert.match(router, /comisiones/);
  assert.match(shell, />Ingresos</);
  assert.match(bootstrap, /income-aura-ux-reconciliation-001/);
  assert.match(index, /income-core\.mjs[^\n]+income-core\.js/);
  assert.match(index, /income-adapter-pages-v1\.mjs[^\n]+income-adapter-pages-v1\.js/);
});

test("canonical Pages artifact preserves Cartera root-safe v3 module and v6 to v5 to v4 to v3 to v2 transport chain", () => {
  for (const relative of [
    "static-preview/forge-aura/cartera/cartera-module-v3.js",
    "static-preview/forge-aura/cartera/cartera-adapter-pages-v2.js",
    "static-preview/forge-aura/cartera/cartera-adapter-pages-v3.js",
    "static-preview/forge-aura/cartera/cartera-adapter-pages-v4.js",
    "static-preview/forge-aura/cartera/cartera-adapter-pages-v5.js",
    "static-preview/forge-aura/cartera/cartera-adapter-pages-v6.js",
  ]) {
    assert.equal(exists(relative), true, `Missing current Cartera asset: ${relative}`);
  }
  const app = read("static-preview/forge-aura/app-v4.js");
  const index = read("static-preview/forge-aura/index.html");
  const bootstrap = read("static-preview/forge-aura/aura-bootstrap-v4.js");
  const moduleV3 = read("static-preview/forge-aura/cartera/cartera-module-v3.js");
  const v2 = read("static-preview/forge-aura/cartera/cartera-adapter-pages-v2.js");
  const v3 = read("static-preview/forge-aura/cartera/cartera-adapter-pages-v3.js");
  const v4 = read("static-preview/forge-aura/cartera/cartera-adapter-pages-v4.js");
  const v5 = read("static-preview/forge-aura/cartera/cartera-adapter-pages-v5.js");
  const v6 = read("static-preview/forge-aura/cartera/cartera-adapter-pages-v6.js");
  assert.match(app, /cartera-module-v3\.js\?v=aura-cartera-invalid-time-value-root-009/);
  assert.match(index, /cartera-adapter-pages-v6\.js\?v=aura-cartera-invalid-time-value-root-009/);
  assert.match(index, /cartera-module-v3\.js\?v=aura-cartera-invalid-time-value-root-009/);
  assert.match(bootstrap, /app-v4\.js\?v=aura-cartera-invalid-time-value-root-009-income-aura-ux-reconciliation-001/);
  assert.match(moduleV3, /adapterFactory:\s*createRootSafeCarteraAdapter/);
  assert.match(moduleV3, /cartera-adapter-pages-v6\.js\?base=aura-cartera-invalid-time-value-root-009/);
  assert.match(v6, /data:\s*sanitizePdfPayload\(result\.data\)/);
  assert.match(v6, /cartera-adapter-pages-v5\.js\?base=aura-cartera-invalid-time-value-root-009/);
  assert.match(v5, /cartera-adapter-pages-v4\.js\?base=aura-cartera-invalid-date-review-007/);
  assert.match(v4, /cartera-adapter-pages-v3\.js\?base=aura-cartera-result-state-machine-006/);
  assert.match(v3, /cartera-adapter-pages-v2\.js\?base=aura-cartera-pdf-idempotency-004/);
  assert.match(v2, /client\.functions\.invoke\(PDF_FUNCTION_NAME, \{ body \}\)/);
  assert.doesNotMatch(v2, /Authorization:\s*`Bearer/);
});

test("Income Pages mirrors are byte-identical to governed source modules", () => {
  const pairs = [
    ["docs/static-preview/forge-aura/income/income-core.mjs", "static-preview/forge-aura/income/income-core.js"],
    ["docs/static-preview/forge-aura/income/income-adapter-pages-v1.mjs", "static-preview/forge-aura/income/income-adapter-pages-v1.js"],
    ["docs/static-preview/forge-aura/income/income-module.mjs", "static-preview/forge-aura/income/income-module.js"],
  ];
  for (const [source, mirror] of pairs) {
    assert.equal(fs.readFileSync(path.resolve(source), "utf8"), read(mirror), `Pages mirror drift: ${mirror}`);
  }
});

test("Income artifact has no Material3 visual dependency, direct productive writer or invented money formula", () => {
  const files = [
    read("static-preview/forge-aura/income/income-core.js"),
    read("static-preview/forge-aura/income/income-adapter-pages-v1.js"),
    read("static-preview/forge-aura/income/income-module.js"),
    read("static-preview/forge-aura/income/income.css"),
  ].join("\n");
  assert.doesNotMatch(files, /forge-alive-material3|material3|md3/i);
  assert.doesNotMatch(files, /\.insert\(|\.update\(|\.upsert\(|\.delete\(/);
  assert.doesNotMatch(files, /hardcodedRate|probability\s*\*|commissionRate\s*=|commission_rate\s*=|premium\s*\*\s*(?:rate|commission)/i);
  assert.match(files, /frontendCommissionRateCalculation:\s*false/);
  assert.match(files, /pipelineProbabilityWeighting:\s*false/);
});
