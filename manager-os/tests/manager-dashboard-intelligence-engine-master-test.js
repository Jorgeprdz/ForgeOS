"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const {
  buildManagerDashboardIntelligence
} = require("../dashboard-intelligence/manager-dashboard-intelligence-engine");

let total = 0;
let fail = 0;

function test(name, fn) {
  total += 1;
  try {
    fn();
    console.log(`PASS ${name}`);
  } catch (error) {
    fail += 1;
    console.error(`FAIL ${name}`);
    console.error(error.stack || error.message);
  }
}

function assertFalseFlags(result) {
  [
    "automaticDecisionAllowed",
    "createsHumanRankingTruth",
    "createsPerformanceLeaderboardTruth",
    "createsPromotionDecisionTruth",
    "createsPunishmentTruth",
    "createsTerminationTruth",
    "createsAdvisorLifecycleTruth",
    "createsRevenueTruth",
    "createsCompensationTruth",
    "createsPayoutTruth",
    "createsPrecontractTruth",
    "createsHiringTruth",
    "createsDatabaseWrite",
    "createsFilesystemWrite",
    "createsCacheWrite",
    "createsMigrationWrite",
    "createsSchemaWrite",
    "createsUiRendering"
  ].forEach((flag) => assert.strictEqual(result[flag], false, `${flag} must be false`));
}

const evidence = {
  evidenceRefs: ["E1", "E1"],
  sourceEvidenceIds: ["S1", "S1"],
  sourceOwners: ["MANAGER_OS", "MANAGER_OS"],
  freshness: { status: "FRESH" }
};

console.log("\nFORGE MANAGER DASHBOARD INTELLIGENCE ENGINE MASTER TEST v1.0\n");

test("Combines recruitment advisor and team dashboard context", () => {
  const result = buildManagerDashboardIntelligence({
    sourceEvidence: evidence,
    managerMetricsContext: {},
    historicalAnalyticsContext: {},
    forecastIntelligenceContext: {},
    recruitmentMetricsContext: {},
    advisorMetricsContext: {},
    teamMetricsContext: {}
  });
  assert(result.recruitmentDashboard);
  assert(result.advisorDashboard);
  assert(result.teamDashboard);
});

test("Uses protected metrics historical storage query plan forecast context only", () => {
  const result = buildManagerDashboardIntelligence({
    sourceEvidence: evidence,
    managerMetricsContext: { evidenceRefs: ["E2"], sourceOwners: ["MANAGER_OS"], freshness: { status: "FRESH" } },
    historicalAnalyticsContext: { evidenceRefs: ["E3"], sourceOwners: ["MANAGER_OS"], freshness: { status: "FRESH" } },
    historicalStorageBoundaryContext: { evidenceRefs: ["E4"], sourceOwners: ["MANAGER_OS"], freshness: { status: "FRESH" } },
    historicalQueryPlanContext: { evidenceRefs: ["E5"], sourceOwners: ["MANAGER_OS"], freshness: { status: "FRESH" } },
    forecastIntelligenceContext: { evidenceRefs: ["E6"], sourceOwners: ["MANAGER_OS"], freshness: { status: "FRESH" } }
  });
  assert(result.evidenceRefs.includes("E1"));
});

test("Does not mutate inputs", () => {
  const input = { sourceEvidence: evidence, managerMetricsContext: {}, historicalAnalyticsContext: {}, forecastIntelligenceContext: {} };
  const before = JSON.stringify(input);
  buildManagerDashboardIntelligence(input);
  assert.strictEqual(JSON.stringify(input), before);
});

test("Merges and dedupes evidence source owners", () => {
  const result = buildManagerDashboardIntelligence({
    sourceEvidence: evidence,
    managerMetricsContext: evidence,
    historicalAnalyticsContext: evidence,
    forecastIntelligenceContext: evidence
  });
  assert.deepStrictEqual(result.evidenceRefs, ["E1"]);
  assert.deepStrictEqual(result.sourceEvidenceIds, ["S1"]);
  assert.deepStrictEqual(result.sourceOwners, ["MANAGER_OS"]);
});

test("Propagates warnings limitations missing unknown stale defaultZero risks", () => {
  const result = buildManagerDashboardIntelligence({
    sourceEvidence: { evidenceRefs: ["E1"], sourceEvidenceIds: ["S1"], sourceOwners: ["MANAGER_OS"], freshness: { status: "STALE" } },
    managerMetricsContext: { defaultZeroRisks: ["pipeline"] },
    historicalAnalyticsContext: { missingRollups: ["2026-06"] },
    forecastIntelligenceContext: {}
  });
  assert(result.boundary.staleSignals.includes("STALE_FRESHNESS"));
  assert(result.warnings.length > 0);
});

test("Blocks forbidden uses", () => {
  const result = buildManagerDashboardIntelligence({
    sourceEvidence: evidence,
    managerMetricsContext: {},
    historicalAnalyticsContext: {},
    forecastIntelligenceContext: {},
    requestedUse: "HUMAN_RANKING"
  });
  assert.strictEqual(result.dashboardIntelligenceDecision, "BLOCK_FORBIDDEN_USE");
});

test("Allows context uses", () => {
  const result = buildManagerDashboardIntelligence({
    sourceEvidence: evidence,
    managerMetricsContext: {},
    historicalAnalyticsContext: {},
    forecastIntelligenceContext: {},
    requestedUse: "DASHBOARD_CONTEXT"
  });
  assert(result.boundary.allowedUses.includes("DASHBOARD_CONTEXT"));
});

test("Executive summary is review context, not automatic decision", () => {
  const result = buildManagerDashboardIntelligence({
    sourceEvidence: evidence,
    managerMetricsContext: {},
    historicalAnalyticsContext: {},
    forecastIntelligenceContext: {}
  });
  assert.strictEqual(result.executiveSummaryContext.contextOnly, true);
  assert.strictEqual(result.executiveSummaryContext.automaticDecisionAllowed, false);
});

test("Creates no downstream truth and no writes", () => {
  const result = buildManagerDashboardIntelligence({
    sourceEvidence: evidence,
    managerMetricsContext: {},
    historicalAnalyticsContext: {},
    forecastIntelligenceContext: {}
  });
  assertFalseFlags(result);
});

test("No direct Advisor OS import", () => {
  const source = fs.readFileSync(path.join(__dirname, "../dashboard-intelligence/manager-dashboard-intelligence-engine.js"), "utf8");
  assert(!/require\(["'][^"']*advisor-os/i.test(source));
});

test("No legacy Manager OS dashboard momentum report import", () => {
  const source = fs.readFileSync(path.join(__dirname, "../dashboard-intelligence/manager-dashboard-intelligence-engine.js"), "utf8");
  assert(!/require\(["'][^"']*manager-os\/(dashboard|momentum|report)/i.test(source));
});

test("No compensation revenue payout lifecycle product imports", () => {
  const source = fs.readFileSync(path.join(__dirname, "../dashboard-intelligence/manager-dashboard-intelligence-engine.js"), "utf8");
  assert(!/require\(["'][^"']*(compensation|revenue|payout|advisor-lifecycle|product-intelligence)/i.test(source));
});

console.log("\nResumen:");
console.log(`Total: ${total}`);
console.log(`Pass: ${total - fail}`);
console.log(`Fail: ${fail}`);
if (fail > 0) process.exit(1);
