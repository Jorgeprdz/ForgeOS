import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const read = relative => fs.readFileSync(path.resolve(relative), "utf8");
const adapter = read("docs/static-preview/forge-aura/quotes/quotes-adapter.js");
const moduleSource = read("docs/static-preview/forge-aura/quotes/quotes-module.js");
const css = read("docs/static-preview/forge-aura/quotes/quotes.css");
const router = read("docs/static-preview/forge-aura/aura-router-v4.js");
const app = read("docs/static-preview/forge-aura/app-v4.js");

assert.match(adapter, /forge-pdf-browser-parser\.js/);
assert.match(adapter, /forge-accepted-quote-adapter\.js/);
assert.match(adapter, /forge-udi-mxn-runtime\.js/);
assert.match(adapter, /forge-quote-lifecycle-browser-bridge-cartera001b\.js/);
assert.match(adapter, /quote-benefit-summary-engine\.js/);
assert.match(adapter, /forge-quote-printable-route-controller\.js/);
assert.match(adapter, /forge-sales-presentation-browser-context-adapter\.js/);
assert.match(adapter, /forge-sales-presentation-human-approval-gate\.js/);
assert.doesNotMatch(adapter, /forge-alive-material3\/quotes-module/);
assert.doesNotMatch(adapter, /quotes-module\.css/);

assert.match(adapter, /rawKey === "ave"/i);
assert.match(adapter, /PRODUCT_LABELS\[family\]/);
assert.doesNotMatch(moduleSource, /<option[^>]*>\s*AVE\s*<\/option>/i);
assert.match(moduleSource, /Prima|Product Intelligence|Accepted Quote/);

for (const state of ["EMPTY", "LOADING", "READY", "ACCEPTED", "PARTIAL", "ERROR", "UNAVAILABLE"]) {
  assert.match(moduleSource, new RegExp(`\\b${state}\\b`), `missing ${state} state`);
}
for (const action of ["accept", "preview", "download", "presentation"]) {
  assert.match(moduleSource, new RegExp(`data-quotes-action=\\"${action}\\"`), `missing ${action} action`);
}
assert.match(moduleSource, /Contractual/);
assert.match(moduleSource, /Referencia actual/);
assert.match(moduleSource, /Proyección \/ estimación/);
assert.match(moduleSource, /no reemplaza el documento contractual/i);
assert.match(moduleSource, /Forge no sobrescribió la verdad del PDF/i);

assert.equal((css.match(/#[0-9a-fA-F]{3,8}\b/g) || []).length, 0, "Quotes CSS must not introduce local hex colors");
assert.equal((css.match(/rgba?\(/g) || []).length, 0, "Quotes CSS must use Aura tokens rather than local rgb colors");
assert.match(css, /var\(--forge-/);
assert.match(css, /@media \(max-width: 760px\)/);
assert.match(css, /\.forge-r16j1__panel/);

assert.match(router, /cotizaciones: "cotizaciones"/);
assert.match(router, /quotes: "cotizaciones"/);
assert.match(app, /createQuotesModule/);
assert.match(app, /route === "cotizaciones"/);
assert.match(app, /quotes\/quotes\.css/);
assert.match(app, /data-aura-productive-link=\"cotizaciones\"/);

const productiveEnginePatterns = [
  /function\s+calculate[A-Z]/g,
  /const\s+DEFAULT_UDI_RATE/g,
  /function\s+buildUdiProjection/g,
  /function\s+parseSolucionline/g,
];
for (const pattern of productiveEnginePatterns) {
  assert.equal((adapter.match(pattern) || []).length, 0, `adapter must not duplicate productive engine: ${pattern}`);
}

console.log("FORGE_AURA_QUOTES_RECONCILIATION_TEST=PASS");
console.log("NEW_PRODUCTIVE_ENGINE_COUNT=0");
console.log("MATERIAL_QUOTES_VISUAL_IMPORT_COUNT=0");
console.log("LOCAL_QUOTES_HEX_COLOR_COUNT=0");
