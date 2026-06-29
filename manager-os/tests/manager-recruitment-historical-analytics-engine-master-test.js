const assert = require("assert");

const {
  calculateManagerRecruitmentHistoricalAnalytics,
  MANAGER_RECRUITMENT_HISTORICAL_ANALYTICS_STATUSES
} = require("../historical-analytics/manager-recruitment-historical-analytics-engine");

console.log("\nFORGE MANAGER RECRUITMENT HISTORICAL ANALYTICS ENGINE MASTER TEST v1.0\n");

const sourceEvidence = {
  evidenceRefs: ["hist-ref"],
  sourceEvidenceIds: ["hist-source"],
  sourceOwners: ["MANAGER_OS"],
  freshness: { status: "FRESH" },
  generatedAt: "2026-06-29T12:00:00.000Z"
};

const mayMetrics = {
  period: { periodId: "2026-05" },
  recruitmentMetrics: {
    namesAdded: 4,
    contactedCandidates: 3,
    connectedCandidates: 2,
    initialInterviewsScheduled: 2,
    initialInterviewsCompleted: 1,
    readyForPrecontractReviewCount: 0,
    withdrawnCandidates: 1,
    blockedCandidates: 0,
    reactivatedCandidates: 0,
    reentryReviewCandidates: 0,
    pipelineVelocityContext: { eventCount: 10 },
    totalCandidateSnapshots: 4,
    stageConversionRates: { contactToInitialInterview: { value: 0.5 } },
    interviewCompletionRates: { initial: { value: 0.5 } }
  },
  evidenceRefs: ["may-ref"],
  sourceEvidenceIds: ["may-source"],
  sourceOwners: ["MANAGER_OS"],
  freshness: { status: "FRESH" }
};

const juneMetrics = {
  period: { periodId: "2026-06" },
  recruitmentMetrics: {
    namesAdded: 6,
    contactedCandidates: 5,
    connectedCandidates: 4,
    initialInterviewsScheduled: 4,
    initialInterviewsCompleted: 3,
    readyForPrecontractReviewCount: 2,
    withdrawnCandidates: 0,
    blockedCandidates: 1,
    reactivatedCandidates: 1,
    reentryReviewCandidates: 1,
    pipelineVelocityContext: { eventCount: 18 },
    totalCandidateSnapshots: 6,
    stageConversionRates: { contactToInitialInterview: { value: 0.75 } },
    interviewCompletionRates: { initial: { value: 0.75 } }
  },
  evidenceRefs: ["june-ref"],
  sourceEvidenceIds: ["june-source"],
  sourceOwners: ["MANAGER_OS"],
  freshness: { status: "FRESH" }
};

function baseInput(overrides = {}) {
  return {
    recruitmentMetricsSeries: [mayMetrics, juneMetrics],
    periodSeries: [{ periodId: "2026-05" }, { periodId: "2026-06" }],
    sourceEvidence,
    requestedUse: "MANAGER_REVIEW",
    generatedAt: "2026-06-29T12:30:00.000Z",
    ...overrides
  };
}

function clone(value) { return JSON.parse(JSON.stringify(value)); }
function assertTruthFlags(result) {
  assert.equal(result.automaticDecisionAllowed, false);
  assert.equal(result.createsPrecontractTruth, false);
  assert.equal(result.createsHiringTruth, false);
  assert.equal(result.createsHumanRankingTruth, false);
  assert.equal(result.createsPromotionDecisionTruth, false);
  assert.equal(result.createsPunishmentTruth, false);
  assert.equal(result.createsTerminationTruth, false);
  assert.equal(result.createsAdvisorLifecycleTruth, false);
  assert.equal(result.createsRevenueTruth, false);
  assert.equal(result.createsCompensationTruth, false);
  assert.equal(result.createsPayoutTruth, false);
}

const tests = [
  ["Period-over-period recruitment funnel trends are context only", () => {
    const result = calculateManagerRecruitmentHistoricalAnalytics(baseInput());
    assert.equal(result.recruitmentHistoricalAnalytics.recruitmentFunnelTrends.namesAdded.change, 2);
    assert.equal(result.recruitmentHistoricalAnalytics.recruitmentFunnelTrends.namesAdded.referenceOnly, true);
    assertTruthFlags(result);
  }],
  ["Interview completion trends are context only", () => {
    const result = calculateManagerRecruitmentHistoricalAnalytics(baseInput());
    assert.equal(result.recruitmentHistoricalAnalytics.interviewCompletionTrendContext.initial.change, 0.25);
    assert.equal(result.recruitmentHistoricalAnalytics.interviewCompletionTrendContext.initial.createsTruth, false);
    assertTruthFlags(result);
  }],
  ["Ready for precontract review trend does not create precontract truth", () => {
    const result = calculateManagerRecruitmentHistoricalAnalytics(baseInput());
    assert.equal(result.recruitmentHistoricalAnalytics.readyForPrecontractReviewTrend.change, 2);
    assert.equal(result.createsPrecontractTruth, false);
    assert.ok(result.warnings.some((warning) => warning.includes("precontract truth")));
    assertTruthFlags(result);
  }],
  ["Withdrawn trend does not create rejection truth", () => {
    const result = calculateManagerRecruitmentHistoricalAnalytics(baseInput());
    assert.equal(result.recruitmentHistoricalAnalytics.withdrawnCandidatesTrend.change, -1);
    assert.equal(result.createsAutomaticRejectionTruth, false);
    assertTruthFlags(result);
  }],
  ["Blocked trend does not create punishment truth", () => {
    const result = calculateManagerRecruitmentHistoricalAnalytics(baseInput());
    assert.equal(result.recruitmentHistoricalAnalytics.blockedCandidatesTrend.change, 1);
    assert.equal(result.createsPunishmentTruth, false);
    assertTruthFlags(result);
  }],
  ["Reactivated and reentry trend does not create approval truth", () => {
    const result = calculateManagerRecruitmentHistoricalAnalytics(baseInput());
    assert.equal(result.recruitmentHistoricalAnalytics.reactivatedCandidatesTrend.change, 1);
    assert.equal(result.recruitmentHistoricalAnalytics.reentryReviewTrend.change, 1);
    assert.equal(result.createsAutomaticApprovalTruth, false);
    assertTruthFlags(result);
  }],
  ["Missing periods are UNKNOWN, not zero", () => {
    const result = calculateManagerRecruitmentHistoricalAnalytics(baseInput({ recruitmentMetricsSeries: [], periodSeries: [] }));
    assert.equal(result.analyticsStatus, MANAGER_RECRUITMENT_HISTORICAL_ANALYTICS_STATUSES.UNKNOWN);
    assert.ok(result.unknownSignals.includes("historical_period_context_missing"));
    assertTruthFlags(result);
  }],
  ["Missing and stale evidence propagates", () => {
    const result = calculateManagerRecruitmentHistoricalAnalytics(baseInput({ sourceEvidence: {} }));
    assert.ok(result.missingEvidence.includes("historical_analytics_evidence_missing"));
    assert.ok(result.staleSignals.includes("historical_analytics_freshness_missing"));
    assertTruthFlags(result);
  }],
  ["Forbidden uses are blocked", () => {
    const result = calculateManagerRecruitmentHistoricalAnalytics(baseInput({ requestedUse: "PUNISHMENT" }));
    assert.equal(result.analyticsStatus, MANAGER_RECRUITMENT_HISTORICAL_ANALYTICS_STATUSES.BLOCKED);
    assert.ok(result.blockedUses.includes("PUNISHMENT"));
    assertTruthFlags(result);
  }],
  ["Allowed uses are allowed", () => {
    const result = calculateManagerRecruitmentHistoricalAnalytics(baseInput({ requestedUse: "DASHBOARD_CONTEXT" }));
    assert.ok(result.allowedUses.includes("DASHBOARD_CONTEXT"));
    assert.equal(result.blockedUses.length, 0);
    assertTruthFlags(result);
  }],
  ["Inputs are not mutated", () => {
    const input = baseInput();
    const original = clone(input);
    calculateManagerRecruitmentHistoricalAnalytics(input);
    assert.deepEqual(input, original);
  }],
  ["All truth flags remain false", () => {
    assertTruthFlags(calculateManagerRecruitmentHistoricalAnalytics(baseInput()));
  }]
];

let passed = 0;
let failed = 0;
tests.forEach(([name, run]) => {
  try { run(); passed += 1; console.log(`PASS ${name}`); } catch (error) { failed += 1; console.error(`FAIL ${name}`); console.error(error); }
});
console.log("\nResumen:");
console.log(`Total: ${tests.length}`);
console.log(`Pass: ${passed}`);
console.log(`Fail: ${failed}`);
if (failed > 0) process.exit(1);
