import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const siteRoot = path.resolve(process.env.SITE_ROOT || "_site");
const read = relative => fs.readFileSync(path.join(siteRoot, relative), "utf8");
const exists = relative => fs.existsSync(path.join(siteRoot, relative));

test("canonical Pages artifact publishes every Aura Income transitive asset", () => {
  for (const relative of [
    "static-preview/forge-aura/income/income-core.mjs",
    "static-preview/forge-aura/income/income-adapter-pages-v1.mjs",
    "static-preview/forge-aura/income/income-module.mjs",
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
  assert.match(app, /createIncomeModule/);
  assert.match(app, /route === "comisiones"/);
  assert.match(app, /income\/income\.css/);
  assert.match(router, /comisiones/);
  assert.match(shell, />Ingresos</);
  assert.match(bootstrap, /income-aura-ux-reconciliation-001/);
});

test("Income artifact has no Material3 visual dependency or direct productive writer", () => {
  const files = [
    read("static-preview/forge-aura/income/income-core.mjs"),
    read("static-preview/forge-aura/income/income-adapter-pages-v1.mjs"),
    read("static-preview/forge-aura/income/income-module.mjs"),
    read("static-preview/forge-aura/income/income.css"),
  ].join("\n");
  assert.doesNotMatch(files, /forge-alive-material3|material3|md3/i);
  assert.doesNotMatch(files, /\.insert\(|\.update\(|\.upsert\(|\.delete\(/);
  assert.doesNotMatch(files, /commissionRate|hardcodedRate|probability\s*\*/i);
});
