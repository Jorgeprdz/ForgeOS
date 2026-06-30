"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const {
  buildManagerReviewPlanIntelligence
} = require("../review-plan-intelligence/manager-review-plan-intelligence-engine");

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
    "createsUiRendering",
    "createsAutomatedManagerMessage",
    "createsAutomatedAdvisorMessage"
  ].forEach((flag) => assert.strictEqual(result[flag], false, `${flag} must be false`));
}

const evidence = {
  evidenceRefs: ["E1", "E1"],
  sourceEvidenceIds: ["S1", "S1"],
  sourceOwners: ["MANAGER_OS", "MANAGER_OS"],
  freshness: { status: "FRESH" }
};

console.log("\nFORGE MANAGER REVIEW PLAN INTELLIGENCE ENGINE MASTER TEST v1.0\n");

test("Combines recruitment advisor and team review plan context", () => {
  const result = buildManagerReviewPlanIntelligence({
    sourceEvidence: evidence,
    managerMetricsContext: {},
    dashboardIntelligenceContext: {},
    forecastIntelligenceContext: {},
    coachingIntelligenceContext: {},
    historicalAnalyticsContext: {}
  });
  assert(result.recruitmentReviewPlan);
  assert(result.advisorReviewPlan);
  assert(result.teamReviewPlan);
});

test("Uses protected metrics historical storage query plan forecast dashboard coaching context only", () => {
  const result = buildManagerReviewPlanIntelligence({
    sourceEvidence: evidence,
    managerMetricsContext: { evidenceRefs: ["E2"], sourceOwners: ["MANAGER_OS"], freshness: { status: "FRESH" } },
    historicalAnalyticsContext: { evidenceRefs: ["E3"], sourceOwners: ["MANAGER_OS"], freshness: { status: "FRESH" } },
    historicalStorageBoundaryContext: { evidenceRefs: ["E4"], sourceOwners: ["MANAGER_OS"], freshness: { status: "FRESH" } },
    historicalQueryPlanContext: { evidenceRefs: ["E5"], sourceOwners: ["MANAGER_OS"], freshness: { status: "FRESH" } },
    forecastIntelligenceContext: { evidenceRefs: ["E6"], sourceOwners: ["MANAGER_OS"], freshness: { status: "FRESH" } },
    dashboardIntelligenceContext: { evidenceRefs: ["E7"], sourceOwners: ["MANAGER_OS"], freshness: { status: "FRESH" } },
    coachingIntelligenceContext: { evidenceRefs: ["E8"], sourceOwners: ["MANAGER_OS"], freshness: { status: "FRESH" } }
  });
  assert(result.evidenceRefs.includes("E1"));
});

test("Does not mutate inputs", () => {
  const input = { sourceEvidence: evidence, managerMetricsContext: {}, dashboardIntelligenceContext: {}, forecastIntelligenceContext: {}, coachingIntelligenceContext: {}, historicalAnalyticsContext: {} };
  const before = JSON.stringify(input);
  buildManagerReviewPlanIntelligence(input);
  assert.strictEqual(JSON.stringify(input), before);
});

test("Merges and dedupes evidence source owners", () => {
  const result = buildManagerReviewPlanIntelligence({
    sourceEvidence: evidence,
    managerMetricsContext: evidence,
    dashboardIntelligenceContext: evidence,
    forecastIntelligenceContext: evidence,
    coachingIntelligenceContext: evidence,
    historicalAnalyticsContext: evidence
  });
  assert.deepStrictEqual(result.evidenceRefs, ["E1"]);
  assert.deepStrictEqual(result.sourceEvidenceIds, ["S1"]);
  assert.deepStrictEqual(result.sourceOwners, ["MANAGER_OS"]);
});

test("Propagates warnings limitations missing unknown stale defaultZero risks", () => {
  const result = buildManagerReviewPlanIntelligence({
    sourceEvidence: { evidenceRefs: ["E1"], sourceEvidenceIds: ["S1"], sourceOwners: ["MANAGER_OS"], freshness: { status: "STALE" } },
    managerMetricsContext: { defaultZeroRisks: ["appointments"] },
    dashboardIntelligenceContext: { missingRollups: ["2026-06"] },
    forecastIntelligenceContext: {},
    coachingIntelligenceContext: {},
    historicalAnalyticsContext: {}
  });
  assert(result.boundary.staleSignals.includes("STALE_FRESHNESS"));
  assert(result.warnings.length > 0);
});

test("Blocks forbidden uses", () => {
  const result = buildManagerReviewPlanIntelligence({
    sourceEvidence: evidence,
    managerMetricsContext: {},
    dashboardIntelligenceContext: {},
    forecastIntelligenceContext: {},
    coachingIntelligenceContext: {},
    historicalAnalyticsContext: {},
    requestedUse: "EMAIL_SEND"
  });
  assert.strictEqual(result.reviewPlanIntelligenceDecision, "BLOCK_FORBIDDEN_USE");
});

test("Allows review plan context uses", () => {
  const result = buildManagerReviewPlanIntelligence({
    sourceEvidence: evidence,
    managerMetricsContext: {},
    dashboardIntelligenceContext: {},
    forecastIntelligenceContext: {},
    coachingIntelligenceContext: {},
    historicalAnalyticsContext: {},
    requestedUse: "REVIEW_PLAN_CONTEXT"
  });
  assert(result.boundary.allowedUses.includes("REVIEW_PLAN_CONTEXT"));
});

test("Executive review plan summary is review context, not automatic decision", () => {
  const result = buildManagerReviewPlanIntelligence({
    sourceEvidence: evidence,
    managerMetricsContext: {},
    dashboardIntelligenceContext: {},
    forecastIntelligenceContext: {},
    coachingIntelligenceContext: {},
    historicalAnalyticsContext: {}
  });
  assert.strictEqual(result.executiveReviewPlanSummary.contextOnly, true);
  assert.strictEqual(result.executiveReviewPlanSummary.automaticDecisionAllowed, false);
  assert.strictEqual(result.executiveReviewPlanSummary.recommendationsAreAutomaticDecisions, false);
});

test("Executive review plan does not create tasks calendar or messages", () => {
  const result = buildManagerReviewPlanIntelligence({
    sourceEvidence: evidence,
    managerMetricsContext: {},
    dashboardIntelligenceContext: {},
    forecastIntelligenceContext: {},
    coachingIntelligenceContext: {},
    historicalAnalyticsContext: {}
  });
  assert.strictEqual(result.executiveReviewPlanSummary.createsTasks, false);
  assert.strictEqual(result.executiveReviewPlanSummary.createsCalendarEvents, false);
  assert.strictEqual(result.executiveReviewPlanSummary.sendsAutomatedMessages, false);
});

test("Creates no downstream truth, no writes, and no automated actions", () => {
  const result = buildManagerReviewPlanIntelligence({
    sourceEvidence: evidence,
    managerMetricsContext: {},
    dashboardIntelligenceContext: {},
    forecastIntelligenceContext: {},
    coachingIntelligenceContext: {},
    historicalAnalyticsContext: {}
  });
  assertFalseFlags(result);
});

test("No direct Advisor OS import", () => {
  const source = fs.readFileSync(path.join(__dirname, "../review-plan-intelligence/manager-review-plan-intelligence-engine.js"), "utf8");
  assert(!/require\(["'][^"']*advisor-os/i.test(source));
});

test("No legacy Manager OS coaching dashboard momentum report import", () => {
  const source = fs.readFileSync(path.join(__dirname, "../review-plan-intelligence/manager-review-plan-intelligence-engine.js"), "utf8");
  assert(!/require\(["'][^"']*manager-os\/(coaching|dashboard|momentum|report)/i.test(source));
});

test("No NASH next-best-action compensation revenue payout lifecycle product imports", () => {
  const source = fs.readFileSync(path.join(__dirname, "../review-plan-intelligence/manager-review-plan-intelligence-engine.js"), "utf8");
  assert(!/require\(["'][^"']*(nash-next-best-action|next-best-action|compensation|revenue|payout|advisor-lifecycle|product-intelligence)/i.test(source));
});

console.log("\nResumen:");
console.log(`Total: ${total}`);
console.log(`Pass: ${total - fail}`);
console.log(`Fail: ${fail}`);
if (fail > 0) process.exit(1);
