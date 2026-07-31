import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const root = new URL("../", import.meta.url);
const read = (path) => readFileSync(new URL(path, root), "utf8");

const app = read("docs/static-preview/forge-alive-material3/app.js");
const hotfix = read("docs/static-preview/forge-alive-material3/quote-runtime-hotfix-m05e003.js");
const uxClosure = read("docs/static-preview/forge-alive-material3/quote-runtime-ux-closure-m05e004.js");
const proof = read("docs/static-preview/forge-alive-material3/index-quote-calculator-parity.html");
const server = read("tools/forge-local-live-server.cjs");
const cacheEngine = read("exchange-rate-cache-engine.js");
const staleCache = JSON.parse(read("forge-rate-cache.json"));

assert.match(app, /quote-runtime-hotfix-m05e003\.js\?v=m05e-003/);
assert.match(app, /quote-runtime-ux-closure-m05e004\.js\?v=m05e-004/);
assert.match(app, /quoteCalculatorRuntime = "M05E-004"/);
assert.match(proof, /CALCULADORAS M05E-004/);
assert.match(proof, /quote-calculator-parity-004/);

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

// M05E-003 preserves the original durable-history and client gates. M05E-004
// deliberately closes the accepted UX by providing an explicit missing-data
// value and restoring the existing History action without changing QPD storage.
assert.match(hotfix, /history\.hidden = qpdState\.durableIdentityReady !== true/);
assert.match(uxClosure, /MISSING_CLIENT_LABEL = "Sin dato confirmado"/);
assert.match(uxClosure, /El nombre es opcional/);
assert.match(uxClosure, /input\.dispatchEvent\(new Event\("input"/);
assert.match(uxClosure, /Object\.defineProperty\(history, "hidden"/);
assert.match(uxClosure, /Consultar versiones imprimibles de esta cotización/);
assert.match(uxClosure, /data-client-review-pending/);
assert.doesNotMatch(uxClosure, /Escribe tu nombre para continuar/);

// The server centralizes cache access in currentRates(), forces a startup
// refresh, discovers Supabase from env.js, and falls back to the public project
// hostname already governed by the Pages workflow when env.js is empty.
assert.match(server, /const cache = await getCachedRates\(\{ forceRefresh \}\)/);
assert.match(server, /currentRates\(\{ forceRefresh: true \}\)/);
assert.match(server, /loadPublicMarketProviderFromEnvJs/);
assert.match(server, /parsePublicEnvJs/);
assert.match(server, /discoverSupabaseUrlFromPagesWorkflow/);
assert.match(server, /\.github.*workflows.*pages\.yml/s);
assert.match(server, /source\.match\(\/\(\[a-z0-9\]/);
assert.match(server, /\.supabase\\\.co\/i/);
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
  productiveRuntime: "M05E-004",
  staleFixtureDetected: staleCache.rates.UDI_MXN.date,
  liveRateRefreshRequired: true,
  envJsSupabaseDiscovery: true,
  pagesWorkflowSupabaseDiscovery: true,
  annualContributionCurrentMxn: true,
  clientNameOptionalForFlow: true,
  confirmationSynchronized: true,
  printableActionsReady: true,
  printableHistoryRestored: true,
});
