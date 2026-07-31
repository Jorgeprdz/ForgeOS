import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const presenter = readFileSync(
  new URL("../docs/static-preview/forge-alive-material3/quote-product-intelligence-presenter.js", import.meta.url),
  "utf8",
);
const adapter = readFileSync(
  new URL("../docs/static-preview/forge-alive-material3/quotes-result-adapter.js", import.meta.url),
  "utf8",
);
const moduleSource = readFileSync(
  new URL("../docs/static-preview/forge-alive-material3/quotes-module.js", import.meta.url),
  "utf8",
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

assert.match(moduleSource, /quotes-result-adapter\.js\?v=quote-calculator-parity-001/);

console.log("PASS UI-M05E quote calculator Product Intelligence restoration", {
  products: ["vida_mujer", "segubeca", "orvi", "imagina_ser"],
  mandatoryMetrics: ["sum_assured_udi_mxn", "annual_contribution_udi_mxn"],
  imaginaScenarios: ["base", "favorable", "unfavorable"],
  actionsWired: true,
  printableRefreshWired: true,
});
