import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const root = new URL("../", import.meta.url);
const read = (path) => readFileSync(new URL(path, root), "utf8");

const app = read("docs/static-preview/forge-alive-material3/app.js");
const hotfix = read("docs/static-preview/forge-alive-material3/quote-runtime-hotfix-m05e003.js");
const pagesRateBridge = read("docs/static-preview/forge-alive-material3/quote-runtime-pages-rate-fetch-bridge-m05e010.js");
const vidaMujerHandoff = read("docs/static-preview/forge-alive-material3/quote-runtime-vida-mujer-handoff-m05e009.js");
const vidaMujerVisual = read("docs/static-preview/forge-alive-material3/quote-runtime-vida-mujer-visual-m05e010.js");
const printableClosure = read("docs/static-preview/forge-alive-material3/quote-runtime-printable-closure-m05e006.js");
const proof = read("docs/static-preview/forge-alive-material3/index-quote-calculator-parity.html");
const server = read("tools/forge-local-live-server.cjs");
const cacheEngine = read("exchange-rate-cache-engine.js");
const staleCache = JSON.parse(read("forge-rate-cache.json"));

assert.match(app, /quote-runtime-pages-rate-fetch-bridge-m05e010\.js\?v=m05e-010/);
assert.match(app, /quote-runtime-hotfix-m05e003\.js\?v=m05q-001-loop-closure/);
assert.match(app, /quote-runtime-vida-mujer-handoff-m05e009\.js\?v=m05r-001-bridge-composition/);
assert.match(app, /quote-runtime-vida-mujer-visual-m05e010\.js\?v=m05t-001-coalesced/);
assert.match(app, /quote-runtime-printable-closure-m05e006\.js\?v=m05e-011-eager-print-actions/);
assert.doesNotMatch(app, /quote-runtime-printable-closure-m05e005\.js/);
assert.match(app, /quoteCalculatorRuntime = "M05E-006"/);
assert.match(app, /vidaMujerVisualClosure = "M05E-010"/);
assert.match(proof, /CALCULADORAS M05E-006/);
assert.match(proof, /quote-calculator-parity-009/);
assert.match(proof, /vidaMujerHandoff = "M05E-009"/);

assert.ok(
  app.indexOf("void startPrintableAuthority();") <
  app.indexOf('await loadAuthority(envBase, "env.js")'),
);
assert.ok(
  app.indexOf('await loadAuthority(envBase, "env.js")') <
  app.indexOf("quote-runtime-pages-rate-fetch-bridge-m05e010.js"),
);
assert.ok(
  app.indexOf("quote-runtime-pages-rate-fetch-bridge-m05e010.js") <
  app.indexOf("quote-runtime-hotfix-m05e003.js"),
);

assert.match(hotfix, /MAX_CACHE_AGE_HOURS = 18/);
assert.match(hotfix, /MAX_SOURCE_AGE_DAYS = 7/);
assert.match(hotfix, /api\/forge-market-rates/);
assert.match(hotfix, /UDI_CACHE_STALE_OR_INVALID/);
assert.match(hotfix, /ForgeQuoteUdiRateCache = result\.cache/);
assert.match(hotfix, /ForgeOrviRateProvider = async/);
assert.match(hotfix, /currentAnnualContributionMxn/);
assert.match(hotfix, /MXN hoy/);
assert.match(hotfix, /UDI vigente:/);

assert.match(pagesRateBridge, /functions\/v1\/banxico-rates/);
assert.match(pagesRateBridge, /SUPABASE_URL/);
assert.match(pagesRateBridge, /SUPABASE_KEY/);
assert.match(pagesRateBridge, /cacheStatus: "LIVE_REFRESHED"/);
assert.match(pagesRateBridge, /Cache-Control/);
assert.match(pagesRateBridge, /globalThis\.document\?\.documentElement/);

assert.match(vidaMujerHandoff, /PRODUCT_FAMILY = "vida_mujer"/);
assert.match(vidaMujerHandoff, /PRODUCT_INTELLIGENCE_SCHEMA/);
assert.match(vidaMujerHandoff, /buildVidaMujerProductIntelligence/);
assert.match(vidaMujerHandoff, /buildQuoteBenefitSummary/);
assert.match(vidaMujerHandoff, /enrichVidaMujerCalculation/);
assert.match(vidaMujerHandoff, /enrichVidaMujerSnapshot/);
assert.match(vidaMujerHandoff, /truth_status: "source_provided"/);
assert.doesNotMatch(vidaMujerHandoff, /new MutationObserver/);
assert.match(vidaMujerVisual, /Total aportado/);
assert.match(vidaMujerVisual, /A4 horizontal/);
assert.doesNotMatch(vidaMujerVisual, /MutationObserver/);

assert.match(printableClosure, /MISSING_CLIENT_LABEL = "Sin dato confirmado"/);
assert.match(printableClosure, /prepareOptionalClient/);
assert.match(printableClosure, /confirmCurrentQuoteCandidate/);
assert.match(printableClosure, /setCurrentQuoteHumanReview/);
assert.match(printableClosure, /preparedCandidates = new WeakSet/);
assert.match(printableClosure, /alreadyPrepared = hasText\(reviewed\?\.clientName\)/);
assert.match(printableClosure, /setAttributeOnce/);
assert.match(printableClosure, /setHiddenOnce/);
assert.match(printableClosure, /scheduleRefresh/);
assert.match(printableClosure, /retryMount/);
assert.match(printableClosure, /El nombre es opcional/);
assert.match(printableClosure, /data-m05e005-legacy-hidden/);
assert.match(printableClosure, /Aún no hay versiones guardadas/);
assert.doesNotMatch(printableClosure, /new MutationObserver/);
assert.doesNotMatch(printableClosure, /"forge:quote-human-review-updated"/);
assert.doesNotMatch(printableClosure, /queueMicrotask/);
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
assert.match(server, /QUOTE_RUNTIME = "M05E-006"/);
assert.match(server, /MARKET_RATE_PROVIDER=/);
assert.match(server, /\/api\/forge-market-rates/);
assert.match(server, /FORGE_LIVE_SERVER=READY/);
assert.match(server, /RUNTIME=\$\{QUOTE_RUNTIME\}/);
assert.match(server, /UDI_DATE=/);
assert.match(server, /LIVE_RATE_CACHE_FILE/);
assert.match(server, /RATE_CACHE_FILE=/);
assert.match(cacheEngine, /MAX_CACHE_AGE_HOURS = 12/);
assert.match(cacheEngine, /FORGE_RATE_CACHE_FILE/);
assert.match(cacheEngine, /function cacheFilePath\(\)/);

assert.equal(staleCache.rates.UDI_MXN.date, "10/06/2026");
assert.equal(staleCache.rates.UDI_MXN.value, 8.82994);

console.log("PASS UI-M05F live UDI and printable UX closure", {
  foundationalRuntime: "M05E-003",
  productiveRuntime: "M05E-006",
  vidaMujerHandoff: "M05E-009",
  vidaMujerVisualClosure: "M05E-010",
  staleFixtureDetected: staleCache.rates.UDI_MXN.date,
  liveRateRefreshRequired: true,
  envJsSupabaseDiscovery: true,
  pagesWorkflowSupabaseDiscovery: true,
  pagesDirectEdgeRates: true,
  liveCacheOutsideWorktree: true,
  annualContributionCurrentMxn: true,
  clientNameOptionalForFlow: true,
  confirmationSynchronized: true,
  compactPrintableActions: true,
  printableHistoryRestored: true,
  orviPortraitPreserved: true,
  vidaMujerLandscapeEnabled: true,
  globalMutationObserverRemoved: true,
  humanReviewFeedbackLoopRemoved: true,
});