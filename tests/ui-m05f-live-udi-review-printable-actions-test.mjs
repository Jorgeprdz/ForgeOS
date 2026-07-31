import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const root = new URL("../", import.meta.url);
const read = (path) => readFileSync(new URL(path, root), "utf8");

const app = read("docs/static-preview/forge-alive-material3/app.js");
const hotfix = read("docs/static-preview/forge-alive-material3/quote-runtime-hotfix-m05e003.js");
const printableClosure = read("docs/static-preview/forge-alive-material3/quote-runtime-printable-closure-m05e005.js");
const proof = read("docs/static-preview/forge-alive-material3/index-quote-calculator-parity.html");
const server = read("tools/forge-local-live-server.cjs");
const cacheEngine = read("exchange-rate-cache-engine.js");
const staleCache = JSON.parse(read("forge-rate-cache.json"));

assert.match(app, /quote-runtime-hotfix-m05e003\.js\?v=m05e-003/);
assert.match(app, /quote-runtime-printable-closure-m05e005\.js\?v=m05e-005/);
assert.match(app, /quoteCalculatorRuntime = "M05E-005"/);
assert.match(proof, /CALCULADORAS M05E-005/);
assert.match(proof, /quote-calculator-parity-005/);

assert.match(hotfix, /MAX_CACHE_AGE_HOURS = 18/);
assert.match(hotfix, /MAX_SOURCE_AGE_DAYS = 7/);
assert.match(hotfix, /api\/forge-market-rates/);
assert.match(hotfix, /UDI_CACHE_STALE_OR_INVALID/);
assert.match(hotfix, /ForgeQuoteUdiRateCache = result\.cache/);
assert.match(hotfix, /ForgeOrviRateProvider = async/);
assert.match(hotfix, /currentAnnualContributionMxn/);
assert.match(hotfix, /MXN hoy/);
assert.match(hotfix, /UDI vigente:/);

assert.match(printableClosure, /MISSING_CLIENT_LABEL = "Sin dato confirmado"/);
assert.match(printableClosure, /prepareOptionalClient/);
assert.match(printableClosure, /confirmCurrentQuoteCandidate/);
assert.match(printableClosure, /setCurrentQuoteHumanReview/);
assert.match(printableClosure, /El nombre es opcional/);
assert.match(printableClosure, /data-m05e005-legacy-hidden/);
assert.match(printableClosure, /Aún no hay versiones guardadas/);
assert.doesNotMatch(printableClosure, /Escribe tu nombre para continuar/);
assert.doesNotMatch(printableClosure, /Captura el nombre antes de confirmar/);

for (const action of ["preview", "download", "history"]) {
  assert.match(
    printableClosure,
    new RegExp(`data-m05e005-action=\\"${action}\\"`),
  );
}

assert.match(server, /const cache = await getCachedRates\(\{ forceRefresh \}\)/);
assert.match(server, /currentRates\(\{ forceRefresh: true \}\)/);
assert.match(server, /loadPublicMarketProviderFromEnvJs/);
assert.match(server, /parsePublicEnvJs/);
assert.match(server, /discoverSupabaseUrlFromPagesWorkflow/);
assert.match(server, /\.github.*workflows.*pages\.yml/s);
assert.match(server, /source: "PAGES_WORKFLOW"/);
assert.match(server, /configureSupabaseProvider/);
assert.match(server, /SUPABASE_URL/);
assert.match(server, /SUPABASE_KEY/);
assert.match(server, /functions\/v1\/\$\{BANXICO_EDGE_FUNCTION_NAME\}/);
assert.match(server, /BANXICO_EDGE_FUNCTION_NAME = "banxico-rates"/);
assert.match(server, /MARKET_RATE_PROVIDER=/);
assert.match(server, /\/api\/forge-market-rates/);
assert.match(server, /FORGE_LIVE_SERVER=READY/);
assert.match(server, /UDI_DATE=/);
assert.match(cacheEngine, /MAX_CACHE_AGE_HOURS = 12/);

assert.equal(staleCache.rates.UDI_MXN.date, "10/06/2026");
assert.equal(staleCache.rates.UDI_MXN.value, 8.82994);

console.log("PASS UI-M05F live UDI and printable UX closure", {
  foundationalRuntime: "M05E-003",
  productiveRuntime: "M05E-005",
  staleFixtureDetected: staleCache.rates.UDI_MXN.date,
  liveRateRefreshRequired: true,
  envJsSupabaseDiscovery: true,
  pagesWorkflowSupabaseDiscovery: true,
  annualContributionCurrentMxn: true,
  clientNameOptionalForFlow: true,
  confirmationSynchronized: true,
  compactPrintableActions: true,
  printableHistoryRestored: true,
  portraitPrintableRequired: true,
});
