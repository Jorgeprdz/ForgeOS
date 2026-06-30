"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const {
  buildManagerAdvisorReviewPlanContext
} = require("../review-plan-intelligence/manager-advisor-review-plan-engine");

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
    "createsPunishmentTruth",
    "createsPromotionDecisionTruth",
    "createsTerminationTruth",
    "createsDisciplinaryActionTruth",
    "createsHrDecisionTruth",
    "createsAdvisorLifecycleTruth",
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

console.log("\nFORGE MANAGER ADVISOR REVIEW PLAN ENGINE MASTER TEST v1.0\n");

test("Follow-up consistency review plan is context only", () => {
  const result = buildManagerAdvisorReviewPlanContext({
    sourceEvidence: evidence,
    advisorCoachingContext: { followUpConsistencyConversationTopic: { context: true } },
    advisorMetricsContext: {},
    advisorDashboardContext: {},
    advisorForecastContext: {}
  });
  assert.strictEqual(result.reviewPlanItems.followUpConsistencyReviewPlanItem.contextOnly, true);
});

test("Prospecting referral review plan is context only", () => {
  const result = buildManagerAdvisorReviewPlanContext({
    sourceEvidence: evidence,
    advisorCoachingContext: { prospectingReferralConversationTopic: { context: true } },
    advisorMetricsContext: {},
    advisorDashboardContext: {},
    advisorForecastContext: {}
  });
  assert.strictEqual(result.reviewPlanItems.prospectingReferralReviewPlanItem.contextOnly, true);
});

test("Appointment rhythm review plan is context only", () => {
  const result = buildManagerAdvisorReviewPlanContext({
    sourceEvidence: evidence,
    advisorCoachingContext: { appointmentRhythmReviewTopic: { context: true } },
    advisorMetricsContext: {},
    advisorDashboardContext: {},
    advisorForecastContext: {}
  });
  assert.strictEqual(result.reviewPlanItems.appointmentRhythmReviewPlanItem.contextOnly, true);
});

test("Pipeline review plan is context only", () => {
  const result = buildManagerAdvisorReviewPlanContext({
    sourceEvidence: evidence,
    advisorCoachingContext: { pipelineReviewTopic: { context: true } },
    advisorMetricsContext: {},
    advisorDashboardContext: {},
    advisorForecastContext: {}
  });
  assert.strictEqual(result.reviewPlanItems.pipelineReviewPlanItem.contextOnly, true);
});

test("Production review plan does not create revenue truth", () => {
  const result = buildManagerAdvisorReviewPlanContext({
    sourceEvidence: evidence,
    advisorCoachingContext: { productionCoachingTopic: { context: true } },
    advisorMetricsContext: {},
    advisorDashboardContext: {},
    advisorForecastContext: {}
  });
  assert.strictEqual(result.reviewPlanItems.productionReviewPlanItem.reviewPlanItemCreatesRevenueTruth, false);
  assert.strictEqual(result.createsRevenueTruth, false);
});

test("Qualification review plan does not create promotion or lifecycle truth", () => {
  const result = buildManagerAdvisorReviewPlanContext({
    sourceEvidence: evidence,
    advisorCoachingContext: { qualificationCoachingTopic: { context: true } },
    advisorMetricsContext: {},
    advisorDashboardContext: {},
    advisorForecastContext: {}
  });
  assert.strictEqual(result.reviewPlanItems.qualificationReviewPlanItem.reviewPlanItemCreatesPromotionTruth, false);
  assert.strictEqual(result.reviewPlanItems.qualificationReviewPlanItem.reviewPlanItemCreatesLifecycleTruth, false);
  assert.strictEqual(result.createsAdvisorLifecycleTruth, false);
});

test("Support coaching review plan does not create punishment truth", () => {
  const result = buildManagerAdvisorReviewPlanContext({
    sourceEvidence: evidence,
    advisorCoachingContext: { supportCoachingNeedTopic: { context: true } },
    advisorMetricsContext: {},
    advisorDashboardContext: {},
    advisorForecastContext: {}
  });
  assert.strictEqual(result.reviewPlanItems.supportCoachingReviewPlanItem.reviewPlanItemCreatesPunishmentTruth, false);
});

test("Activity gap review plan does not create termination truth", () => {
  const result = buildManagerAdvisorReviewPlanContext({
    sourceEvidence: evidence,
    advisorCoachingContext: { activityGapConversationTopic: { context: true } },
    advisorMetricsContext: {},
    advisorDashboardContext: {},
    advisorForecastContext: {}
  });
  assert.strictEqual(result.reviewPlanItems.activityGapReviewPlanItem.reviewPlanItemCreatesTerminationTruth, false);
  assert.strictEqual(result.createsTerminationTruth, false);
});

test("Review plan does not create tasks calendar or messages", () => {
  const result = buildManagerAdvisorReviewPlanContext({
    sourceEvidence: evidence,
    advisorCoachingContext: {},
    advisorMetricsContext: {},
    advisorDashboardContext: {},
    advisorForecastContext: {}
  });
  assertFalseFlags(result);
});

test("Missing activity does not become zero activity", () => {
  const result = buildManagerAdvisorReviewPlanContext({
    sourceEvidence: evidence,
    advisorCoachingContext: {},
    advisorMetricsContext: {},
    advisorDashboardContext: {},
    advisorForecastContext: {}
  });
  assert.strictEqual(result.reviewPlanItems.activityGapReviewPlanItem.itemStatus, "UNKNOWN");
});

test("Stale evidence propagates", () => {
  const result = buildManagerAdvisorReviewPlanContext({
    sourceEvidence: { evidenceRefs: ["E1"], sourceEvidenceIds: ["S1"], sourceOwners: ["MANAGER_OS"], freshness: { status: "STALE" } },
    advisorCoachingContext: {},
    advisorMetricsContext: {},
    advisorDashboardContext: {},
    advisorForecastContext: {}
  });
  assert(result.boundary.staleSignals.includes("STALE_FRESHNESS"));
});

test("Forbidden uses are blocked", () => {
  const result = buildManagerAdvisorReviewPlanContext({
    sourceEvidence: evidence,
    advisorCoachingContext: {},
    advisorMetricsContext: {},
    advisorDashboardContext: {},
    advisorForecastContext: {},
    requestedUse: "MESSAGE_SEND"
  });
  assert.strictEqual(result.advisorReviewPlanDecision, "BLOCK_FORBIDDEN_USE");
});

test("Allowed uses are allowed", () => {
  const result = buildManagerAdvisorReviewPlanContext({
    sourceEvidence: evidence,
    advisorCoachingContext: {},
    advisorMetricsContext: {},
    advisorDashboardContext: {},
    advisorForecastContext: {},
    requestedUse: "REVIEW_PLAN_CONTEXT"
  });
  assert(result.boundary.allowedUses.includes("REVIEW_PLAN_CONTEXT"));
});

test("Inputs are not mutated", () => {
  const input = { sourceEvidence: evidence, advisorCoachingContext: {}, advisorMetricsContext: {}, advisorDashboardContext: {}, advisorForecastContext: {} };
  const before = JSON.stringify(input);
  buildManagerAdvisorReviewPlanContext(input);
  assert.strictEqual(JSON.stringify(input), before);
});

test("No direct Advisor OS import", () => {
  const source = fs.readFileSync(path.join(__dirname, "../review-plan-intelligence/manager-advisor-review-plan-engine.js"), "utf8");
  assert(!/require\(["'][^"']*advisor-os/i.test(source));
});

test("No legacy Manager OS coaching dashboard momentum report import", () => {
  const source = fs.readFileSync(path.join(__dirname, "../review-plan-intelligence/manager-advisor-review-plan-engine.js"), "utf8");
  assert(!/require\(["'][^"']*manager-os\/(coaching|dashboard|momentum|report)/i.test(source));
});

console.log("\nResumen:");
console.log(`Total: ${total}`);
console.log(`Pass: ${total - fail}`);
console.log(`Fail: ${fail}`);
if (fail > 0) process.exit(1);
