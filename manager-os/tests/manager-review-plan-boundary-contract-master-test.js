"use strict";

const assert = require("assert");
const {
  buildManagerReviewPlanBoundary
} = require("../review-plan-intelligence/manager-review-plan-boundary-contract");

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
  "createsUiRendering",
  "createsAutomatedManagerMessage",
  "createsAutomatedAdvisorMessage"
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

console.log("\nFORGE MANAGER REVIEW PLAN BOUNDARY CONTRACT MASTER TEST v1.0\n");

test("Missing review plan context becomes UNKNOWN, not zero", () => {
  const result = buildManagerReviewPlanBoundary({ sourceEvidence: evidence, requestedUse: "REVIEW_PLAN_CONTEXT" });
  assert(result.unknownSignals.includes("MISSING_REVIEW_PLAN_CONTEXT"));
  assert(result.missingData.includes("MISSING_REVIEW_PLAN_CONTEXT"));
});

test("Missing coaching dashboard forecast metric context remains UNKNOWN, not zero", () => {
  const result = buildManagerReviewPlanBoundary({ sourceEvidence: evidence, reviewPlanContext: {}, requestedUse: "REVIEW_PLAN_CONTEXT" });
  assert(result.missingData.includes("MISSING_COACHING_CONTEXT"));
  assert(result.missingData.includes("MISSING_DASHBOARD_CONTEXT"));
  assert(result.missingData.includes("MISSING_FORECAST_CONTEXT"));
  assert(result.missingData.includes("MISSING_METRICS_CONTEXT"));
});

test("Missing rollups remain UNKNOWN/review context, not poor performance", () => {
  const result = buildManagerReviewPlanBoundary({
    sourceEvidence: evidence,
    reviewPlanContext: { missingRollups: ["2026-06"] },
    coachingContext: {},
    dashboardContext: {},
    forecastContext: {},
    metricsContext: {}
  });
  assert(result.missingRollups.includes("2026-06"));
  assert.strictEqual(result.managerReviewRequired, true);
});

test("Missing evidence requires review", () => {
  const result = buildManagerReviewPlanBoundary({ reviewPlanContext: {}, coachingContext: {}, dashboardContext: {}, forecastContext: {}, metricsContext: {} });
  assert(result.missingEvidence.includes("MISSING_EVIDENCE"));
});

test("Missing source owner requires review", () => {
  const result = buildManagerReviewPlanBoundary({
    reviewPlanContext: {},
    coachingContext: {},
    dashboardContext: {},
    forecastContext: {},
    metricsContext: {},
    sourceEvidence: { evidenceRefs: ["E1"], sourceEvidenceIds: ["S1"], freshness: { status: "FRESH" } }
  });
  assert(result.missingSourceOwners.includes("MISSING_SOURCE_OWNER"));
});

test("Missing freshness requires review", () => {
  const result = buildManagerReviewPlanBoundary({
    reviewPlanContext: {},
    coachingContext: {},
    dashboardContext: {},
    forecastContext: {},
    metricsContext: {},
    sourceEvidence: { evidenceRefs: ["E1"], sourceEvidenceIds: ["S1"], sourceOwners: ["MANAGER_OS"] }
  });
  assert(result.missingFreshness.includes("MISSING_FRESHNESS"));
});

test("Stale freshness requires review", () => {
  const result = buildManagerReviewPlanBoundary({
    reviewPlanContext: {},
    coachingContext: {},
    dashboardContext: {},
    forecastContext: {},
    metricsContext: {},
    sourceEvidence: { evidenceRefs: ["E1"], sourceEvidenceIds: ["S1"], sourceOwners: ["MANAGER_OS"], freshness: { status: "STALE" } }
  });
  assert(result.staleSignals.includes("STALE_FRESHNESS"));
});

test("Blocked periods remain review-required, not zero", () => {
  const result = buildManagerReviewPlanBoundary({
    sourceEvidence: evidence,
    reviewPlanContext: { blockedPeriods: ["2026-05"] },
    coachingContext: {},
    dashboardContext: {},
    forecastContext: {},
    metricsContext: {}
  });
  assert(result.blockedPeriods.includes("2026-05"));
});

test("Explicit zero values are context warnings only", () => {
  const result = buildManagerReviewPlanBoundary({
    sourceEvidence: evidence,
    reviewPlanContext: { explicitZeroContext: true, metricKey: "appointments" },
    coachingContext: {},
    dashboardContext: {},
    forecastContext: {},
    metricsContext: {}
  });
  assert(result.defaultZeroRisks.includes("appointments"));
  assertFalseFlags(result);
});

test("Forbidden task calendar and message uses are blocked", () => {
  const result = buildManagerReviewPlanBoundary({
    sourceEvidence: evidence,
    reviewPlanContext: {},
    coachingContext: {},
    dashboardContext: {},
    forecastContext: {},
    metricsContext: {},
    requestedUse: "CALENDAR_WRITE"
  });
  assert(result.blockedUses.includes("CALENDAR_WRITE"));
  assert.strictEqual(result.reviewPlanBoundaryDecision, "BLOCK_FORBIDDEN_USE");
});

test("Forbidden HR disciplinary and ranking uses are blocked", () => {
  const result = buildManagerReviewPlanBoundary({
    sourceEvidence: evidence,
    reviewPlanContext: {},
    coachingContext: {},
    dashboardContext: {},
    forecastContext: {},
    metricsContext: {},
    requestedUse: "HR_DECISION"
  });
  assert(result.blockedUses.includes("HR_DECISION"));
});

test("Allowed review plan context uses are allowed", () => {
  const result = buildManagerReviewPlanBoundary({
    sourceEvidence: evidence,
    reviewPlanContext: {},
    coachingContext: {},
    dashboardContext: {},
    forecastContext: {},
    metricsContext: {},
    requestedUse: "REVIEW_PLAN_CONTEXT"
  });
  assert(result.allowedUses.includes("REVIEW_PLAN_CONTEXT"));
});

test("Inputs are not mutated", () => {
  const input = { sourceEvidence: evidence, reviewPlanContext: { explicitZeroContext: true }, coachingContext: {}, dashboardContext: {}, forecastContext: {}, metricsContext: {} };
  const before = JSON.stringify(input);
  buildManagerReviewPlanBoundary(input);
  assert.strictEqual(JSON.stringify(input), before);
});

test("Evidence source and sourceOwners dedupe", () => {
  const result = buildManagerReviewPlanBoundary({
    sourceEvidence: evidence,
    reviewPlanContext: evidence,
    coachingContext: {},
    dashboardContext: {},
    forecastContext: {},
    metricsContext: {}
  });
  assert.deepStrictEqual(result.evidenceRefs, ["E1"]);
  assert.deepStrictEqual(result.sourceEvidenceIds, ["S1"]);
  assert.deepStrictEqual(result.sourceOwners, ["MANAGER_OS"]);
});

test("No tasks calendar messages writes and all truth flags remain false", () => {
  const result = buildManagerReviewPlanBoundary({
    sourceEvidence: evidence,
    reviewPlanContext: {},
    coachingContext: {},
    dashboardContext: {},
    forecastContext: {},
    metricsContext: {}
  });
  assertFalseFlags(result);
});

console.log("\nResumen:");
console.log(`Total: ${total}`);
console.log(`Pass: ${total - fail}`);
console.log(`Fail: ${fail}`);
if (fail > 0) process.exit(1);
