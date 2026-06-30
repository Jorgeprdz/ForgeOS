"use strict";

const assert = require("assert");
const {
  buildManagerTeamReviewPlanContext
} = require("../review-plan-intelligence/manager-team-review-plan-engine");

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
    "createsAutomatedTask",
    "createsCalendarWrite",
    "createsMessageSend",
    "createsEmailSend",
    "createsSlackSend",
    "createsHumanRankingTruth",
    "createsPerformanceLeaderboardTruth",
    "createsPromotionDecisionTruth",
    "createsPunishmentTruth",
    "createsTerminationTruth",
    "createsDisciplinaryActionTruth",
    "createsHrDecisionTruth",
    "createsRevenueTruth",
    "createsCompensationTruth",
    "createsPayoutTruth",
    "createsDatabaseWrite",
    "createsFilesystemWrite",
    "createsCacheWrite",
    "createsMigrationWrite",
    "createsSchemaWrite",
    "createsUiRendering",
    "createsAutomatedManagerMessage",
    "createsAutomatedAdvisorMessage"
  ].forEach((flag) => assert.strictEqual(result[flag], false, `${flag} must be false`));
}

const evidence = {
  evidenceRefs: ["E1"],
  sourceEvidenceIds: ["S1"],
  sourceOwners: ["MANAGER_OS"],
  freshness: { status: "FRESH" }
};

console.log("\nFORGE MANAGER TEAM REVIEW PLAN ENGINE MASTER TEST v1.0\n");

test("Team pattern review plan is context only", () => {
  const result = buildManagerTeamReviewPlanContext({
    sourceEvidence: evidence,
    teamCoachingContext: { teamPatternConversationTopic: { context: true } },
    teamMetricsContext: {},
    teamDashboardContext: {},
    teamForecastContext: {}
  });
  assert.strictEqual(result.reviewPlanItems.teamPatternReviewPlanItem.contextOnly, true);
});

test("Team capacity review plan is context only and not HR truth", () => {
  const result = buildManagerTeamReviewPlanContext({
    sourceEvidence: evidence,
    teamCoachingContext: { teamCapacitySupportTopic: { context: true } },
    teamMetricsContext: {},
    teamDashboardContext: {},
    teamForecastContext: {}
  });
  assert.strictEqual(result.reviewPlanItems.teamCapacityReviewPlanItem.contextOnly, true);
  assert.strictEqual(result.createsHrDecisionTruth, false);
});

test("Team activity rhythm review plan is context only", () => {
  const result = buildManagerTeamReviewPlanContext({
    sourceEvidence: evidence,
    teamCoachingContext: { teamActivityRhythmTopic: { context: true } },
    teamMetricsContext: {},
    teamDashboardContext: {},
    teamForecastContext: {}
  });
  assert.strictEqual(result.reviewPlanItems.teamActivityRhythmReviewPlanItem.contextOnly, true);
});

test("Team forecast review plan is not promotion punishment or termination truth", () => {
  const result = buildManagerTeamReviewPlanContext({
    sourceEvidence: evidence,
    teamCoachingContext: { teamForecastReviewTopic: { context: true } },
    teamMetricsContext: {},
    teamDashboardContext: {},
    teamForecastContext: {}
  });
  assert.strictEqual(result.reviewPlanItems.teamForecastReviewPlanItem.reviewPlanItemCreatesPromotionTruth, false);
  assert.strictEqual(result.reviewPlanItems.teamForecastReviewPlanItem.reviewPlanItemCreatesPunishmentTruth, false);
  assert.strictEqual(result.reviewPlanItems.teamForecastReviewPlanItem.reviewPlanItemCreatesTerminationTruth, false);
});

test("Team evidence quality review plan is context only", () => {
  const result = buildManagerTeamReviewPlanContext({
    sourceEvidence: evidence,
    teamCoachingContext: { teamEvidenceQualityTopic: { context: true } },
    teamMetricsContext: {},
    teamDashboardContext: {},
    teamForecastContext: {}
  });
  assert.strictEqual(result.reviewPlanItems.teamEvidenceQualityReviewPlanItem.contextOnly, true);
});

test("Team review plan does not create ranking or leaderboard truth", () => {
  const result = buildManagerTeamReviewPlanContext({
    sourceEvidence: evidence,
    teamCoachingContext: { teamPatternConversationTopic: { context: true } },
    teamMetricsContext: {},
    teamDashboardContext: {},
    teamForecastContext: {}
  });
  assert.strictEqual(result.createsHumanRankingTruth, false);
  assert.strictEqual(result.createsPerformanceLeaderboardTruth, false);
});

test("Review plan does not create tasks calendar or messages", () => {
  const result = buildManagerTeamReviewPlanContext({
    sourceEvidence: evidence,
    teamCoachingContext: {},
    teamMetricsContext: {},
    teamDashboardContext: {},
    teamForecastContext: {}
  });
  assertFalseFlags(result);
});

test("Missing team context is UNKNOWN, not zero", () => {
  const result = buildManagerTeamReviewPlanContext({
    sourceEvidence: evidence,
    teamCoachingContext: {},
    teamMetricsContext: {},
    teamDashboardContext: {},
    teamForecastContext: {}
  });
  assert.strictEqual(result.reviewPlanItems.teamActivityRhythmReviewPlanItem.itemStatus, "UNKNOWN");
});

test("Stale evidence propagates", () => {
  const result = buildManagerTeamReviewPlanContext({
    sourceEvidence: { evidenceRefs: ["E1"], sourceEvidenceIds: ["S1"], sourceOwners: ["MANAGER_OS"], freshness: { status: "STALE" } },
    teamCoachingContext: {},
    teamMetricsContext: {},
    teamDashboardContext: {},
    teamForecastContext: {}
  });
  assert(result.boundary.staleSignals.includes("STALE_FRESHNESS"));
});

test("Forbidden uses are blocked", () => {
  const result = buildManagerTeamReviewPlanContext({
    sourceEvidence: evidence,
    teamCoachingContext: {},
    teamMetricsContext: {},
    teamDashboardContext: {},
    teamForecastContext: {},
    requestedUse: "PERFORMANCE_LEADERBOARD"
  });
  assert.strictEqual(result.teamReviewPlanDecision, "BLOCK_FORBIDDEN_USE");
});

test("Allowed uses are allowed", () => {
  const result = buildManagerTeamReviewPlanContext({
    sourceEvidence: evidence,
    teamCoachingContext: {},
    teamMetricsContext: {},
    teamDashboardContext: {},
    teamForecastContext: {},
    requestedUse: "REVIEW_PLAN_CONTEXT"
  });
  assert(result.boundary.allowedUses.includes("REVIEW_PLAN_CONTEXT"));
});

test("Inputs are not mutated", () => {
  const input = { sourceEvidence: evidence, teamCoachingContext: {}, teamMetricsContext: {}, teamDashboardContext: {}, teamForecastContext: {} };
  const before = JSON.stringify(input);
  buildManagerTeamReviewPlanContext(input);
  assert.strictEqual(JSON.stringify(input), before);
});

console.log("\nResumen:");
console.log(`Total: ${total}`);
console.log(`Pass: ${total - fail}`);
console.log(`Fail: ${fail}`);
if (fail > 0) process.exit(1);
