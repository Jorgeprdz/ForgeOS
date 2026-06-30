"use strict";

const assert = require("assert");
const {
  buildManagerRecruitmentReviewPlanContext
} = require("../review-plan-intelligence/manager-recruitment-review-plan-engine");

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
    "createsPrecontractTruth",
    "createsHiringTruth",
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

console.log("\nFORGE MANAGER RECRUITMENT REVIEW PLAN ENGINE MASTER TEST v1.0\n");

test("Candidate follow-up review plan is context only", () => {
  const result = buildManagerRecruitmentReviewPlanContext({
    sourceEvidence: evidence,
    recruitmentCoachingContext: { candidateFollowUpConversationTopic: { context: true } },
    recruitmentMetricsContext: {},
    recruitmentDashboardContext: {},
    recruitmentForecastContext: {}
  });
  assert.strictEqual(result.reviewPlanItems.candidateFollowUpReviewPlanItem.contextOnly, true);
});

test("Interview no-show review plan is not punishment truth", () => {
  const result = buildManagerRecruitmentReviewPlanContext({
    sourceEvidence: evidence,
    recruitmentCoachingContext: { interviewNoShowReviewTopic: { context: true } },
    recruitmentMetricsContext: {},
    recruitmentDashboardContext: {},
    recruitmentForecastContext: {}
  });
  assert.strictEqual(result.reviewPlanItems.interviewNoShowReviewPlanItem.reviewPlanItemCreatesPunishmentTruth, false);
});

test("Stalled candidate review plan is context only", () => {
  const result = buildManagerRecruitmentReviewPlanContext({
    sourceEvidence: evidence,
    recruitmentCoachingContext: { stalledCandidateReviewTopic: { context: true } },
    recruitmentMetricsContext: {},
    recruitmentDashboardContext: {},
    recruitmentForecastContext: {}
  });
  assert.strictEqual(result.reviewPlanItems.stalledCandidateReviewPlanItem.contextOnly, true);
});

test("Precontract readiness review plan does not create precontract truth", () => {
  const result = buildManagerRecruitmentReviewPlanContext({
    sourceEvidence: evidence,
    recruitmentCoachingContext: { precontractReadinessConversationTopic: { context: true } },
    recruitmentMetricsContext: {},
    recruitmentDashboardContext: {},
    recruitmentForecastContext: {}
  });
  assert.strictEqual(result.reviewPlanItems.precontractReadinessReviewPlanItem.reviewPlanItemCreatesPrecontractTruth, false);
  assert.strictEqual(result.createsPrecontractTruth, false);
});

test("Withdrawn blocked reentry review plan does not create punishment or hiring truth", () => {
  const result = buildManagerRecruitmentReviewPlanContext({
    sourceEvidence: evidence,
    recruitmentCoachingContext: { withdrawnBlockedReentryConversationTopic: { context: true } },
    recruitmentMetricsContext: {},
    recruitmentDashboardContext: {},
    recruitmentForecastContext: {}
  });
  assert.strictEqual(result.reviewPlanItems.withdrawnBlockedReentryReviewPlanItem.reviewPlanItemCreatesPunishmentTruth, false);
  assert.strictEqual(result.createsHiringTruth, false);
});

test("Referral ask review plan is context only", () => {
  const result = buildManagerRecruitmentReviewPlanContext({
    sourceEvidence: evidence,
    recruitmentCoachingContext: { referralAskCoachingTopic: { context: true } },
    recruitmentMetricsContext: {},
    recruitmentDashboardContext: {},
    recruitmentForecastContext: {}
  });
  assert.strictEqual(result.reviewPlanItems.referralAskReviewPlanItem.contextOnly, true);
});

test("Pipeline review agenda is not automatic hiring decision", () => {
  const result = buildManagerRecruitmentReviewPlanContext({
    sourceEvidence: evidence,
    recruitmentCoachingContext: { recruitmentPipelineNextConversationAreas: { context: true } },
    recruitmentMetricsContext: {},
    recruitmentDashboardContext: {},
    recruitmentForecastContext: {}
  });
  assert.strictEqual(result.reviewPlanItems.recruitmentPipelineReviewAgendaItem.automaticDecisionAllowed, false);
});

test("Review plan does not create tasks calendar or messages", () => {
  const result = buildManagerRecruitmentReviewPlanContext({
    sourceEvidence: evidence,
    recruitmentCoachingContext: {},
    recruitmentMetricsContext: {},
    recruitmentDashboardContext: {},
    recruitmentForecastContext: {}
  });
  assertFalseFlags(result);
});

test("Missing historical context does not become zero", () => {
  const result = buildManagerRecruitmentReviewPlanContext({
    sourceEvidence: evidence,
    recruitmentCoachingContext: {},
    recruitmentMetricsContext: {},
    recruitmentDashboardContext: {},
    recruitmentForecastContext: {}
  });
  assert.strictEqual(result.reviewPlanItems.interviewNoShowReviewPlanItem.itemStatus, "UNKNOWN");
});

test("Missing rollups propagate review context", () => {
  const result = buildManagerRecruitmentReviewPlanContext({
    sourceEvidence: evidence,
    recruitmentCoachingContext: { missingRollups: ["2026-06"] },
    recruitmentMetricsContext: {},
    recruitmentDashboardContext: {},
    recruitmentForecastContext: {}
  });
  assert(result.boundary.missingRollups.includes("2026-06"));
});

test("Forbidden uses are blocked", () => {
  const result = buildManagerRecruitmentReviewPlanContext({
    sourceEvidence: evidence,
    recruitmentCoachingContext: {},
    recruitmentMetricsContext: {},
    recruitmentDashboardContext: {},
    recruitmentForecastContext: {},
    requestedUse: "AUTOMATED_TASK_CREATION"
  });
  assert.strictEqual(result.recruitmentReviewPlanDecision, "BLOCK_FORBIDDEN_USE");
});

test("Allowed uses are allowed", () => {
  const result = buildManagerRecruitmentReviewPlanContext({
    sourceEvidence: evidence,
    recruitmentCoachingContext: {},
    recruitmentMetricsContext: {},
    recruitmentDashboardContext: {},
    recruitmentForecastContext: {},
    requestedUse: "REVIEW_PLAN_CONTEXT"
  });
  assert(result.boundary.allowedUses.includes("REVIEW_PLAN_CONTEXT"));
});

test("Inputs are not mutated", () => {
  const input = { sourceEvidence: evidence, recruitmentCoachingContext: {}, recruitmentMetricsContext: {}, recruitmentDashboardContext: {}, recruitmentForecastContext: {} };
  const before = JSON.stringify(input);
  buildManagerRecruitmentReviewPlanContext(input);
  assert.strictEqual(JSON.stringify(input), before);
});

console.log("\nResumen:");
console.log(`Total: ${total}`);
console.log(`Pass: ${total - fail}`);
console.log(`Fail: ${fail}`);
if (fail > 0) process.exit(1);
