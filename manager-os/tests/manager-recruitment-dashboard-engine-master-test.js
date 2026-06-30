"use strict";

const assert = require("assert");
const {
  calculateManagerRecruitmentDashboardContext
} = require("../dashboard-intelligence/manager-recruitment-dashboard-engine");

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
    "createsRevenueTruth",
    "createsCompensationTruth",
    "createsPayoutTruth",
    "createsAdvisorLifecycleTruth",
    "createsHumanRankingTruth",
    "createsPromotionDecisionTruth",
    "createsPunishmentTruth",
    "createsTerminationTruth",
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
  evidenceRefs: ["E1"],
  sourceEvidenceIds: ["S1"],
  sourceOwners: ["MANAGER_OS"],
  freshness: { status: "FRESH" }
};

console.log("\nFORGE MANAGER RECRUITMENT DASHBOARD ENGINE MASTER TEST v1.0\n");

test("Builds recruitment dashboard cards as context only", () => {
  const result = calculateManagerRecruitmentDashboardContext({
    sourceEvidence: evidence,
    recruitmentMetricsContext: { funnelContext: { names: 10 } },
    recruitmentHistoricalContext: {},
    recruitmentForecastContext: {}
  });
  assert.strictEqual(result.cards.recruitmentFunnelCard.contextOnly, true);
});

test("Candidate pipeline card is context only", () => {
  const result = calculateManagerRecruitmentDashboardContext({
    sourceEvidence: evidence,
    recruitmentMetricsContext: { candidatePipelineContext: { candidates: 4 } },
    recruitmentHistoricalContext: {},
    recruitmentForecastContext: {}
  });
  assert.strictEqual(result.cards.candidatePipelineCard.dashboardCardCreatesDecisionTruth, false);
});

test("Interview completion card is context only", () => {
  const result = calculateManagerRecruitmentDashboardContext({
    sourceEvidence: evidence,
    recruitmentMetricsContext: { interviewCompletionContext: { completed: 3 } },
    recruitmentHistoricalContext: {},
    recruitmentForecastContext: {}
  });
  assert.strictEqual(result.cards.interviewCompletionCard.contextOnly, true);
});

test("Precontract readiness card does not create precontract truth", () => {
  const result = calculateManagerRecruitmentDashboardContext({
    sourceEvidence: evidence,
    recruitmentMetricsContext: { precontractReadinessContext: { readyForReview: 1 } },
    recruitmentHistoricalContext: {},
    recruitmentForecastContext: {}
  });
  assert.strictEqual(result.cards.precontractReadinessReviewCard.dashboardCardCreatesPrecontractTruth, false);
  assert.strictEqual(result.createsPrecontractTruth, false);
});

test("Withdrawn blocked reentry card does not create punishment or hiring truth", () => {
  const result = calculateManagerRecruitmentDashboardContext({
    sourceEvidence: evidence,
    recruitmentMetricsContext: {},
    recruitmentHistoricalContext: { exceptionTrendContext: { blocked: 1, reentry: 1 } },
    recruitmentForecastContext: {}
  });
  assert.strictEqual(result.cards.withdrawalBlockedReentryCard.dashboardCardCreatesPunishmentTruth, false);
  assert.strictEqual(result.createsHiringTruth, false);
});

test("Forecast scenario summary is context only", () => {
  const result = calculateManagerRecruitmentDashboardContext({
    sourceEvidence: evidence,
    recruitmentMetricsContext: {},
    recruitmentHistoricalContext: {},
    recruitmentForecastContext: {
      baselineScenario: { projectedContext: { interviews: 5 }, assumptions: ["same velocity"] }
    }
  });
  assert.strictEqual(result.cards.forecastScenarioSummaryCard.valueContext[1].contextOnly, true);
});

test("Missing historical context does not become zero", () => {
  const result = calculateManagerRecruitmentDashboardContext({
    sourceEvidence: evidence,
    recruitmentMetricsContext: {},
    recruitmentForecastContext: {}
  });
  assert.strictEqual(result.cards.recruitmentVelocityCard.cardStatus, "UNKNOWN");
});

test("Missing rollups propagate review context", () => {
  const result = calculateManagerRecruitmentDashboardContext({
    sourceEvidence: evidence,
    recruitmentMetricsContext: {},
    recruitmentHistoricalContext: { missingRollups: ["2026-06"] },
    recruitmentForecastContext: {}
  });
  assert(result.boundary.missingRollups.includes("2026-06"));
});

test("Forbidden uses are blocked", () => {
  const result = calculateManagerRecruitmentDashboardContext({
    sourceEvidence: evidence,
    recruitmentMetricsContext: {},
    recruitmentHistoricalContext: {},
    recruitmentForecastContext: {},
    requestedUse: "PRECONTRACT_TRUTH"
  });
  assert.strictEqual(result.recruitmentDashboardDecision, "BLOCK_FORBIDDEN_USE");
});

test("Allowed uses are allowed", () => {
  const result = calculateManagerRecruitmentDashboardContext({
    sourceEvidence: evidence,
    recruitmentMetricsContext: {},
    recruitmentHistoricalContext: {},
    recruitmentForecastContext: {},
    requestedUse: "DASHBOARD_CONTEXT"
  });
  assert(result.boundary.allowedUses.includes("DASHBOARD_CONTEXT"));
});

test("Inputs are not mutated", () => {
  const input = { sourceEvidence: evidence, recruitmentMetricsContext: {}, recruitmentHistoricalContext: {}, recruitmentForecastContext: {} };
  const before = JSON.stringify(input);
  calculateManagerRecruitmentDashboardContext(input);
  assert.strictEqual(JSON.stringify(input), before);
});

test("All truth and write flags remain false", () => {
  const result = calculateManagerRecruitmentDashboardContext({
    sourceEvidence: evidence,
    recruitmentMetricsContext: {},
    recruitmentHistoricalContext: {},
    recruitmentForecastContext: {}
  });
  assertFalseFlags(result);
});

console.log("\nResumen:");
console.log(`Total: ${total}`);
console.log(`Pass: ${total - fail}`);
console.log(`Fail: ${fail}`);
if (fail > 0) process.exit(1);
