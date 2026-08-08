import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read = path => fs.readFileSync(path, "utf8");

const app = read("docs/static-preview/forge-aura/app-v4.js");
const index = read("docs/static-preview/forge-aura/index.html");
const bootstrap = read("docs/static-preview/forge-aura/aura-bootstrap-v4.js");
const v2 = read("docs/static-preview/forge-aura/cartera/cartera-adapter-pages-v2.js");
const v3 = read("docs/static-preview/forge-aura/cartera/cartera-adapter-pages-v3.js");
const v4 = read("docs/static-preview/forge-aura/cartera/cartera-adapter-pages-v4.js");

test("Income and current Cartera runtime coexist without reverting Cartera authority", () => {
  assert.match(app, /createIncomeModule/);
  assert.match(app, /route === "comisiones"/);
  assert.match(app, /createCarteraModule/);
  assert.match(app, /cartera-module\.js\?v=aura-cartera-pdf-auth-002/);
  assert.match(index, /cartera-adapter-pages-v4\.js\?v=aura-cartera-result-state-machine-006/);
  assert.match(index, /income-core\.mjs[^\n]+income-core\.js/);
  assert.match(index, /income-adapter-pages-v1\.mjs[^\n]+income-adapter-pages-v1\.js/);
  assert.match(bootstrap, /app-v4\.js\?v=aura-cartera-result-state-machine-006-income-aura-ux-reconciliation-001/);
});

test("Cartera v4 preserves the governed v3 to authenticated v2 Functions invoke transport chain", () => {
  assert.match(v4, /cartera-adapter-pages-v3\.js\?base=aura-cartera-result-state-machine-006/);
  assert.match(v3, /createTransportAdapter/);
  assert.match(v3, /cartera-adapter-pages-v2\.js\?base=aura-cartera-pdf-idempotency-004/);
  assert.match(v2, /client\.functions\.invoke\(PDF_FUNCTION_NAME, \{ body \}\)/);
  assert.match(v2, /cartera-pdf-intake/);
  assert.doesNotMatch(v2, /Authorization:\s*`Bearer/);
});
