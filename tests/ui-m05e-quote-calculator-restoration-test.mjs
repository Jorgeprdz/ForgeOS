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
const productiveIndex = read(
  "../docs/static-preview/forge-alive-material3/index.html",
);
const runtimeHotfix = read(
  "../docs/static-preview/forge-alive-material3/quote-runtime-hotfix-m05e003.js",
);
const pagesRateBridge = read(
  "../docs/static-preview/forge-alive-material3/quote-runtime-pages-rate-fetch-bridge-m05e010.js",
);
const printableClosure = read(
  "../docs/static-preview/forge-alive-material3/quote-runtime-printable-closure-m05e006.js",
);
const vidaMujerHandoff = read(
  "../docs/static-preview/forge-alive-material3/quote-runtime-vida-mujer-handoff-m05e009.js",
);
const vidaMujerVisual = read(
  "../docs/static-preview/forge-alive-material3/quote-runtime-vida-mujer-visual-m05e010.js",
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
assert.match(adapter, /function verifiedUdiRate\(snapshot\)/);
assert.match(adapter, /item\.secondaryValue \?\? item\.secondary/);
assert.match(adapter, /item\.value \?\? item\.primary/);
assert.match(adapter, /udi \* rate/);
assert.match(adapter, /metadata\.stale === true/);
assert.doesNotMatch(adapter, /const\s+CURRENT_UDI\s*=\s*\d/);

assert.match(moduleSource, /quotes-result-adapter\.js\?v=quote-calculator-parity-001/);
assert.match(moduleSource, /quote-engine\/nueva-cotizacion\/index\.html/);
assert.doesNotMatch(moduleSource, /forge-alive-runtime/);
assert.match(productiveApp, /quotes-module\.js\?v=quote-calculator-parity-006/);
assert.match(
  productiveApp,
  /quote-runtime-pages-rate-fetch-bridge-m05e010\.js\?v=m05e-010/,
);
assert.match(
  productiveApp,
  /quote-runtime-hotfix-m05e003\.js\?v=m05q-001-loop-closure/,
);
assert.match(
  productiveApp,
  /quote-runtime-vida-mujer-handoff-m05e009\.js\?v=m05r-001-bridge-composition/,
);
assert.match(
  productiveApp,
  /quote-runtime-vida-mujer-visual-m05e010\.js\?v=m05t-001-coalesced/,
);
assert.match(
  productiveApp,
  /quote-runtime-printable-closure-m05e006\.js\?v=m05e-011-eager-print-actions/,
);
assert.doesNotMatch(productiveApp, /quote-runtime-printable-closure-m05e005\.js/);
assert.doesNotMatch(
  productiveApp,
  /quotes-module-complete\.js\?v=manual-quotes-complete-001/,
);
assert.match(productiveApp, /dataset\.quoteCalculatorRuntime = "M05E-006"/);
assert.match(productiveApp, /dataset\.vidaMujerVisualClosure = "M05E-010"/);
assert.ok(
  productiveApp.indexOf("void startPrintableAuthority();") <
  productiveApp.indexOf('await loadAuthority(envBase, "env.js")'),
);
assert.ok(
  productiveApp.indexOf('await loadAuthority(envBase, "env.js")') <
  productiveApp.indexOf("quote-runtime-pages-rate-fetch-bridge-m05e010.js"),
);
assert.ok(
  productiveApp.indexOf("quote-runtime-pages-rate-fetch-bridge-m05e010.js") <
  productiveApp.indexOf("quote-runtime-hotfix-m05e003.js"),
);

assert.match(productiveIndex, /data-forge-application/);
assert.match(productiveIndex, /data-forge-quotes-module/);
assert.match(productiveIndex, /app\.js\?v=/);
assert.doesNotMatch(productiveIndex, /quote-calculator-parity-009/);
assert.doesNotMatch(productiveIndex, /CALCULADORAS M05E-006/);

assert.match(runtimeHotfix, /MXN hoy/);
assert.match(pagesRateBridge, /functions\/v1\/banxico-rates/);
assert.match(pagesRateBridge, /cacheStatus: "LIVE_REFRESHED"/);
assert.match(printableClosure, /MISSING_CLIENT_LABEL = "Sin dato confirmado"/);
assert.match(printableClosure, /data-m05e005-action="preview"/);
assert.match(printableClosure, /data-m05e005-action="download"/);
assert.match(printableClosure, /data-m05e005-action="history"/);
assert.doesNotMatch(printableClosure, /new MutationObserver/);
assert.doesNotMatch(printableClosure, /"forge:quote-human-review-updated"/);
assert.match(vidaMujerHandoff, /PRODUCT_FAMILY = "vida_mujer"/);
assert.match(vidaMujerHandoff, /forge\.product_intelligence\.vida_mujer/);
assert.match(vidaMujerHandoff, /buildQuoteBenefitSummary/);
assert.match(vidaMujerHandoff, /enrichVidaMujerSnapshot/);
assert.doesNotMatch(vidaMujerHandoff, /new MutationObserver/);
assert.match(vidaMujerVisual, /Total aportado/);
assert.match(vidaMujerVisual, /total-contributed/);
assert.doesNotMatch(vidaMujerVisual, /MutationObserver/);

console.log("PASS UI-M05E quote calculator Product Intelligence restoration", {
  productiveRuntime: "M05E-006",
  vidaMujerHandoff: "M05E-009",
  vidaMujerVisualClosure: "M05E-010",
  products: ["vida_mujer", "segubeca", "orvi", "imagina_ser"],
  mandatoryMetrics: [
    "sum_assured_udi_mxn",
    "annual_contribution_udi_mxn",
    "vida_mujer_total_contributed_udi_mxn",
  ],
  orviPrimarySecondaryMapping: true,
  verifiedDailyUdiConversion: true,
  pagesRateAuthority: true,
  imaginaScenarios: ["base", "favorable", "unfavorable"],
  actionsWired: true,
  printableRefreshWired: true,
  productiveEntrypointWired: true,
  canonicalEntrypointOnly: true,
  optionalClientUx: true,
  compactPrintableActions: true,
  printableHistoryRestored: true,
  globalMutationObserverRemoved: true,
});
