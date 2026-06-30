"use strict";

const assert = require("assert");
const {
  buildManagerDashboardBoundary
} = require("../dashboard-intelligence/manager-dashboard-boundary-contract");

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

const flags = [
  "automaticDecisionAllowed",
  "createsHumanRankingTruth",
  "createsPerformanceLeaderboardTruth",
  "createsPromotionDecisionTruth",
  "createsPunishmentTruth",
  "createsTerminationTruth",
  "createsAdvisorLifecycleTruth",
  "createsRevenueTruth",
  "createsCompensationTruth",
  "createsRevenue",
  "createsCompensation",
  "createsPayoutTruth",
  "createsPrecontractTruth",
  "createsHiringTruth",
  "createsDatabaseWrite",
  "createsFilesystemWrite",
  "createsCacheWrite",
  "createsMigrationWrite",
  "createsSchemaWrite",
  "createsUiRendering"
];

function assertFalseFlags(result) {
  for (const flag of flags) assert.strictEqual(result[flag], false, `${flag} must be false`);
}

const evidence = {
  evidenceRefs: ["E1", "E1"],
  sourceEvidenceIds: ["S1", "S1"],
  sourceOwners: ["MANAGER_OS", "MANAGER_OS"],
  freshness: { status: "FRESH" }
};

console.log("\nFORGE MANAGER DASHBOARD BOUNDARY CONTRACT MASTER TEST v1.0\n");

test("Missing dashboard context becomes UNKNOWN, not zero", () => {
  const result = buildManagerDashboardBoundary({ sourceEvidence: evidence, requestedUse: "DASHBOARD_CONTEXT" });
  assert(result.unknownSignals.includes("MISSING_DASHBOARD_CONTEXT"));
  assert.notStrictEqual(result.missingData.length, 0);
});

test("Missing rollups become UNKNOWN/review context, not poor performance", () => {
  const result = buildManagerDashboardBoundary({
    sourceEvidence: evidence,
    dashboardContext: { missingRollups: ["2026-06"] },
    metricsContext: {},
    forecastContext: {},
    requestedUse: "DASHBOARD_CONTEXT"
  });
  assert(result.missingRollups.includes("2026-06"));
  assert.strictEqual(result.managerReviewRequired, true);
});

test("Missing evidence requires review", () => {
  const result = buildManagerDashboardBoundary({ dashboardContext: {}, metricsContext: {}, forecastContext: {} });
  assert(result.missingEvidence.includes("MISSING_EVIDENCE"));
  assert.strictEqual(result.humanReviewRequired, true);
});

test("Missing source owner requires review", () => {
  const result = buildManagerDashboardBoundary({
    dashboardContext: {},
    metricsContext: {},
    forecastContext: {},
    sourceEvidence: { evidenceRefs: ["E1"], sourceEvidenceIds: ["S1"], freshness: { status: "FRESH" } }
  });
  assert(result.missingSourceOwners.includes("MISSING_SOURCE_OWNER"));
});

test("Missing freshness requires review", () => {
  const result = buildManagerDashboardBoundary({
    dashboardContext: {},
    metricsContext: {},
    forecastContext: {},
    sourceEvidence: { evidenceRefs: ["E1"], sourceEvidenceIds: ["S1"], sourceOwners: ["MANAGER_OS"] }
  });
  assert(result.missingFreshness.includes("MISSING_FRESHNESS"));
});

test("Stale freshness requires review", () => {
  const result = buildManagerDashboardBoundary({
    dashboardContext: {},
    metricsContext: {},
    forecastContext: {},
    sourceEvidence: { evidenceRefs: ["E1"], sourceEvidenceIds: ["S1"], sourceOwners: ["MANAGER_OS"], freshness: { status: "STALE" } }
  });
  assert(result.staleSignals.includes("STALE_FRESHNESS"));
});

test("Blocked periods require review and do not collapse to zero", () => {
  const result = buildManagerDashboardBoundary({
    sourceEvidence: evidence,
    dashboardContext: { blockedPeriods: ["2026-05"] },
    metricsContext: {},
    forecastContext: {}
  });
  assert(result.blockedPeriods.includes("2026-05"));
  assert.strictEqual(result.managerReviewRequired, true);
});

test("Explicit zero values are context warnings only", () => {
  const result = buildManagerDashboardBoundary({
    sourceEvidence: evidence,
    dashboardContext: { explicitZeroContext: true, metricKey: "activity" },
    metricsContext: {},
    forecastContext: {}
  });
  assert(result.defaultZeroRisks.includes("activity"));
  assertFalseFlags(result);
});

test("Forbidden uses are blocked", () => {
  const result = buildManagerDashboardBoundary({
    sourceEvidence: evidence,
    dashboardContext: {},
    metricsContext: {},
    forecastContext: {},
    requestedUse: "HUMAN_RANKING"
  });
  assert(result.blockedUses.includes("HUMAN_RANKING"));
  assert.strictEqual(result.dashboardBoundaryDecision, "BLOCK_FORBIDDEN_USE");
});

test("Allowed context uses are allowed", () => {
  const result = buildManagerDashboardBoundary({
    sourceEvidence: evidence,
    dashboardContext: {},
    metricsContext: {},
    forecastContext: {},
    requestedUse: "DASHBOARD_CONTEXT"
  });
  assert(result.allowedUses.includes("DASHBOARD_CONTEXT"));
});

test("Inputs are not mutated", () => {
  const input = { sourceEvidence: evidence, dashboardContext: { explicitZeroContext: true }, metricsContext: {}, forecastContext: {} };
  const before = JSON.stringify(input);
  buildManagerDashboardBoundary(input);
  assert.strictEqual(JSON.stringify(input), before);
});

test("Evidence source and sourceOwners dedupe", () => {
  const result = buildManagerDashboardBoundary({
    sourceEvidence: evidence,
    dashboardContext: evidence,
    metricsContext: {},
    forecastContext: {}
  });
  assert.deepStrictEqual(result.evidenceRefs, ["E1"]);
  assert.deepStrictEqual(result.sourceEvidenceIds, ["S1"]);
  assert.deepStrictEqual(result.sourceOwners, ["MANAGER_OS"]);
});

test("No write truth and all truth flags remain false", () => {
  const result = buildManagerDashboardBoundary({
    sourceEvidence: evidence,
    dashboardContext: {},
    metricsContext: {},
    forecastContext: {}
  });
  assertFalseFlags(result);
});

console.log("\nResumen:");
console.log(`Total: ${total}`);
console.log(`Pass: ${total - fail}`);
console.log(`Fail: ${fail}`);
if (fail > 0) process.exit(1);
