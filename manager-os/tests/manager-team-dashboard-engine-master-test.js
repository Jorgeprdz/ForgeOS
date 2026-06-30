"use strict";

const assert = require("assert");
const {
  calculateManagerTeamDashboardContext
} = require("../dashboard-intelligence/manager-team-dashboard-engine");

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
    "createsRevenueTruth",
    "createsCompensationTruth",
    "createsPayoutTruth",
    "createsAdvisorLifecycleTruth",
    "createsDatabaseWrite",
    "createsFilesystemWrite",
    "createsCacheWrite",
    "createsMigrationWrite",
    "createsSchemaWrite",
    "createsUiRendering"
  ].forEach((flag) => assert.strictEqual(result[flag], false, `${flag} must be false`));
}

const evidence = {
  evidenceRefs: ["E1"],
  sourceEvidenceIds: ["S1"],
  sourceOwners: ["MANAGER_OS"],
  freshness: { status: "FRESH" }
};

console.log("\nFORGE MANAGER TEAM DASHBOARD ENGINE MASTER TEST v1.0\n");

test("Team pattern card is context only", () => {
  const result = calculateManagerTeamDashboardContext({
    sourceEvidence: evidence,
    teamMetricsContext: { teamPatternContext: { pattern: "context" } },
    teamHistoricalContext: {},
    teamForecastContext: {}
  });
  assert.strictEqual(result.cards.teamPatternCard.contextOnly, true);
});

test("Team capacity card is context only", () => {
  const result = calculateManagerTeamDashboardContext({
    sourceEvidence: evidence,
    teamMetricsContext: { teamCapacityContext: { capacity: "context" } },
    teamHistoricalContext: {},
    teamForecastContext: {}
  });
  assert.strictEqual(result.cards.teamCapacityCard.contextOnly, true);
});

test("Team pipeline and activity cards are context only", () => {
  const result = calculateManagerTeamDashboardContext({
    sourceEvidence: evidence,
    teamMetricsContext: { teamPipelineContext: { pipeline: 3 } },
    teamHistoricalContext: { teamActivityTrendContext: { trend: "context" } },
    teamForecastContext: {}
  });
  assert.strictEqual(result.cards.teamPipelineCard.contextOnly, true);
  assert.strictEqual(result.cards.teamActivityTrendCard.contextOnly, true);
});

test("Team card does not create ranking truth", () => {
  const result = calculateManagerTeamDashboardContext({
    sourceEvidence: evidence,
    teamMetricsContext: { teamPatternContext: { pattern: "context" } },
    teamHistoricalContext: {},
    teamForecastContext: {}
  });
  assert.strictEqual(result.cards.teamPatternCard.dashboardCardCreatesRankingTruth, false);
  assert.strictEqual(result.createsHumanRankingTruth, false);
});

test("Team card does not create performance leaderboard truth", () => {
  const result = calculateManagerTeamDashboardContext({
    sourceEvidence: evidence,
    teamMetricsContext: {},
    teamHistoricalContext: {},
    teamForecastContext: {}
  });
  assert.strictEqual(result.cards.teamPatternCard.dashboardCardCreatesLeaderboardTruth, false);
  assert.strictEqual(result.createsPerformanceLeaderboardTruth, false);
});

test("Team dashboard does not create promotion punishment termination truth", () => {
  const result = calculateManagerTeamDashboardContext({
    sourceEvidence: evidence,
    teamMetricsContext: {},
    teamHistoricalContext: {},
    teamForecastContext: {}
  });
  assert.strictEqual(result.createsPromotionDecisionTruth, false);
  assert.strictEqual(result.createsPunishmentTruth, false);
  assert.strictEqual(result.createsTerminationTruth, false);
});

test("Missing team context is UNKNOWN, not zero", () => {
  const result = calculateManagerTeamDashboardContext({
    sourceEvidence: evidence,
    teamMetricsContext: {},
    teamHistoricalContext: {},
    teamForecastContext: {}
  });
  assert.strictEqual(result.cards.teamPipelineCard.cardStatus, "UNKNOWN");
});

test("Missing stale evidence propagates", () => {
  const result = calculateManagerTeamDashboardContext({
    sourceEvidence: { evidenceRefs: ["E1"], sourceEvidenceIds: ["S1"], sourceOwners: ["MANAGER_OS"], freshness: { status: "STALE" } },
    teamMetricsContext: {},
    teamHistoricalContext: {},
    teamForecastContext: {}
  });
  assert(result.boundary.staleSignals.includes("STALE_FRESHNESS"));
});

test("Forbidden uses are blocked", () => {
  const result = calculateManagerTeamDashboardContext({
    sourceEvidence: evidence,
    teamMetricsContext: {},
    teamHistoricalContext: {},
    teamForecastContext: {},
    requestedUse: "PERFORMANCE_LEADERBOARD"
  });
  assert.strictEqual(result.teamDashboardDecision, "BLOCK_FORBIDDEN_USE");
});

test("Allowed uses are allowed", () => {
  const result = calculateManagerTeamDashboardContext({
    sourceEvidence: evidence,
    teamMetricsContext: {},
    teamHistoricalContext: {},
    teamForecastContext: {},
    requestedUse: "DASHBOARD_CONTEXT"
  });
  assert(result.boundary.allowedUses.includes("DASHBOARD_CONTEXT"));
});

test("Inputs are not mutated", () => {
  const input = { sourceEvidence: evidence, teamMetricsContext: {}, teamHistoricalContext: {}, teamForecastContext: {} };
  const before = JSON.stringify(input);
  calculateManagerTeamDashboardContext(input);
  assert.strictEqual(JSON.stringify(input), before);
});

test("All truth and write flags remain false", () => {
  const result = calculateManagerTeamDashboardContext({
    sourceEvidence: evidence,
    teamMetricsContext: {},
    teamHistoricalContext: {},
    teamForecastContext: {}
  });
  assertFalseFlags(result);
});

console.log("\nResumen:");
console.log(`Total: ${total}`);
console.log(`Pass: ${total - fail}`);
console.log(`Fail: ${fail}`);
if (fail > 0) process.exit(1);
