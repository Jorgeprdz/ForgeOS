import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const root = new URL("../", import.meta.url);
const read = (path) => readFileSync(new URL(path, root), "utf8");

const app = read("docs/static-preview/forge-alive-material3/app.js");
const hotfix = read("docs/static-preview/forge-alive-material3/quote-runtime-hotfix-m05e003.js");
const proof = read("docs/static-preview/forge-alive-material3/index-quote-calculator-parity.html");
const server = read("tools/forge-local-live-server.cjs");
const cacheEngine = read("exchange-rate-cache-engine.js");
const staleCache = JSON.parse(read("forge-rate-cache.json"));

assert.match(app, /quote-runtime-hotfix-m05e003\.js\?v=m05e-003/);
assert.match(app, /quoteCalculatorRuntime = "M05E-003"/);
assert.match(proof, /CALCULADORAS M05E-003/);
assert.match(proof, /quote-calculator-parity-003/);

assert.match(hotfix, /MAX_CACHE_AGE_HOURS = 18/);
assert.match(hotfix, /MAX_SOURCE_AGE_DAYS = 7/);
assert.match(hotfix, /api\/forge-market-rates/);
assert.match(hotfix, /UDI_CACHE_STALE_OR_INVALID/);
assert.match(hotfix, /ForgeQuoteUdiRateCache = result\.cache/);
assert.match(hotfix, /ForgeOrviRateProvider = async/);

assert.match(hotfix, /data-quote-human-review-client/);
assert.match(hotfix, /Cliente \/ asegurado/);
assert.match(hotfix, /setCurrentQuoteHumanReview/);
assert.match(hotfix, /getAcceptedQuoteReviewSnapshot\(\)/);
assert.match(hotfix, /Captura el nombre del cliente o asegurado antes de confirmar/);

assert.match(hotfix, /currentAnnualContributionMxn/);
assert.match(hotfix, /MXN hoy/);
assert.match(hotfix, /UDI vigente:/);

assert.match(hotfix, /history\.hidden = qpdState\.durableIdentityReady !== true/);
assert.match(hotfix, /Historial disponible al abrir la cotización desde un prospecto/);
assert.match(hotfix, /for \(const action of \["preview", "download"\]\)/);
assert.match(hotfix, /data-forge-qpd06-action=\\"\$\{action\}\\"/);

assert.match(server, /getCachedRates\(\{ forceRefresh: true \}\)/);
assert.match(server, /\/api\/forge-market-rates/);
assert.match(server, /FORGE_LIVE_SERVER=READY/);
assert.match(server, /UDI_DATE=/);
assert.match(cacheEngine, /MAX_CACHE_AGE_HOURS = 12/);

assert.equal(staleCache.rates.UDI_MXN.date, "10/06/2026");
assert.equal(staleCache.rates.UDI_MXN.value, 8.82994);

console.log("PASS UI-M05F live UDI human review printable actions", {
  runtime: "M05E-003",
  staleFixtureDetected: staleCache.rates.UDI_MXN.date,
  liveRateRefreshRequired: true,
  annualContributionCurrentMxn: true,
  clientHumanReview: true,
  confirmationSynchronized: true,
  printableActionsGated: true,
  historyScopedToDurableQuote: true,
});
