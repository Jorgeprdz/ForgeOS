import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");

const presenter = read(
  "../docs/static-preview/forge-alive-material3/quote-product-intelligence-presenter.js",
);
const adapter = read(
  "../docs/static-preview/forge-alive-material3/quotes-result-adapter.js",
);
const moduleSource = read(
  "../docs/static-preview/forge-alive-material3/quotes-module.js",
);
const productiveApp = read(
  "../docs/static-preview/forge-alive-material3/app.js",
);
const cacheProofEntrypoint = read(
  "../docs/static-preview/forge-alive-material3/index-quote-calculator-parity.html",
);

for (const productAdapter of [
  "forge-imagina-ser-product-dashboard-adapter.js",
  "forge-segubeca-product-dashboard-adapter.js",
  "forge-orvi-product-dashboard-adapter.js",
  "forge-vida-mujer-product-dashboard-adapter.js",
]) {
  assert.match(presenter, new RegExp(productAdapter.replaceAll(".", "\\.")));
}

assert.match(presenter, /dataset\.quoteMandatoryMetric = key/);
assert.match(presenter, /\["sum-assured"/);
assert.match(presenter, /\["annual-contribution"/);
assert.match(presenter, /Suma asegurada/);
assert.match(presenter, /Aportación anual/);

assert.match(presenter, /value\.udi/);
assert.match(presenter, /mxnCurrent/);
assert.match(presenter, /projectedMxn/);
assert.match(presenter, /MXN.*actual/);
assert.match(presenter, /MXN.*proyectado/);
assert.doesNotMatch(presenter, /const\s+CURRENT_UDI\s*=\s*\d/);

assert.match(presenter, /\["base", "favorable", "unfavorable"\]/);
assert.match(presenter, /dataset\.quoteThreeScenarios = "true"/);
assert.match(presenter, /scenario\.accumulatedIncome/);
assert.match(presenter, /Pago único/);
assert.match(presenter, /Renta mensual/);

assert.match(adapter, /data-quote-next-action=\"review_pending\"/);
assert.match(adapter, /data-quote-next-action=\"confirm_quote\"/);
assert.match(adapter, /ForgeQuoteAcceptanceEntrypointR16J0A/);
assert.match(adapter, /ForgeQuotePrintableEntrypointQPD06\?\.refresh/);
assert.match(adapter, /scrollIntoView/);

// ORVI adapters expose primary/secondary presentation fields instead of only
// a generic value. The productive presenter must preserve those fields and use
// verified daily UDI metadata for mandatory current-MXN equivalences.
assert.match(adapter, /function verifiedUdiRate\(snapshot\)/);
assert.match(adapter, /item\.secondaryValue \?\? item\.secondary/);
assert.match(adapter, /item\.value \?\? item\.primary/);
assert.match(adapter, /udi \* rate/);
assert.match(adapter, /metadata\.stale === true/);
assert.doesNotMatch(adapter, /const\s+CURRENT_UDI\s*=\s*\d/);
assert.match(adapter, /quoteCalculatorRuntime = "M05E-002"/);

assert.match(moduleSource, /quotes-result-adapter\.js\?v=quote-calculator-parity-001/);

// Productive entrypoint gate: the application must actually load the repaired
// module. This prevents green tests for files that are never executed.
assert.match(
  productiveApp,
  /quotes-module\.js\?v=quote-calculator-parity-002/,
);
assert.doesNotMatch(
  productiveApp,
  /quotes-module-complete\.js\?v=manual-quotes-complete-001/,
);
assert.match(
  productiveApp,
  /dataset\.quoteCalculatorRuntime = "M05E-002"/,
);
assert.match(
  cacheProofEntrypoint,
  /app\.js\?v=quote-calculator-parity-002/,
);
assert.match(
  cacheProofEntrypoint,
  /cache: "no-store"/,
);

console.log("PASS UI-M05E quote calculator Product Intelligence restoration", {
  productiveRuntime: "M05E-002",
  products: ["vida_mujer", "segubeca", "orvi", "imagina_ser"],
  mandatoryMetrics: ["sum_assured_udi_mxn", "annual_contribution_udi_mxn"],
  orviPrimarySecondaryMapping: true,
  verifiedDailyUdiConversion: true,
  imaginaScenarios: ["base", "favorable", "unfavorable"],
  actionsWired: true,
  printableRefreshWired: true,
  productiveEntrypointWired: true,
  cacheProofEntrypoint: true,
});
