const assert = require("assert");
const fs = require("fs");
const path = require("path");

const {
  buildManagerHistoricalAnalytics,
  MANAGER_HISTORICAL_ANALYTICS_STATUSES
} = require("../historical-analytics/manager-historical-analytics-engine");

console.log("\nFORGE MANAGER HISTORICAL ANALYTICS ENGINE MASTER TEST v1.0\n");

const sourceEvidence = {
  evidenceRefs: ["hist-ref", "shared-ref"],
  sourceEvidenceIds: ["hist-source", "shared-source"],
  sourceOwners: ["MANAGER_OS"],
  freshness: { status: "FRESH" },
  generatedAt: "2026-06-29T12:00:00.000Z"
};

const recruitmentMetric = {
  period: { periodId: "2026-06" },
  recruitmentMetrics: {
    namesAdded: 6,
    connectedCandidates: 4,
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
  evidenceRefs: ["recruitment-ref", "shared-ref"],
  sourceEvidenceIds: ["recruitment-source", "shared-source"],
  sourceOwners: ["MANAGER_OS"]
};

const advisorMetric = {
  period: { periodId: "2026-06" },
  advisorMetrics: {
    activitySignalCount: 7,
    followupSignalCount: 5,
    prospectingSignalCount: 6,
    referralSignalCount: 2,
    pipelineContext: { count: 3 },
    appointmentContext: { count: 2 },
    productionContext: { count: 2 },
    qualificationContext: { count: 2 },
    supportNeedsContext: { count: 1 },
    coachingNeedsContext: { count: 2 },
    advisorCountContext: { value: 5 },
    activeAdvisorContext: { value: 4 },
    defaultZeroRiskCount: 1
  },
  defaultZeroRisks: ["pipeline.zero_requires_evidence_review"],
  evidenceRefs: ["advisor-ref", "shared-ref"],
  sourceEvidenceIds: ["advisor-source", "shared-source"],
  sourceOwners: ["MANAGER_OS"]
};

function baseInput(overrides = {}) {
  return {
    recruitmentMetricsSeries: [recruitmentMetric],
    advisorMetricsSeries: [advisorMetric],
    managerMetricsSeries: [{ period: { periodId: "2026-06" }, evidenceRefs: ["manager-ref"], sourceEvidenceIds: ["manager-source"], sourceOwners: ["MANAGER_OS"] }],
    teamMetricsSeries: [{ period: { periodId: "2026-06" }, evidenceRefs: ["team-ref"], sourceEvidenceIds: ["team-source"], sourceOwners: ["MANAGER_OS"] }],
    periodSeries: [{ periodId: "2026-06" }],
    sourceEvidence,
    requestedUse: "MANAGER_REVIEW",
    generatedAt: "2026-06-29T12:30:00.000Z",
    assumptions: ["protected metrics context only"],
    ...overrides
  };
}

function clone(value) { return JSON.parse(JSON.stringify(value)); }
function assertTruthFlags(result) {
  assert.equal(result.automaticDecisionAllowed, false);
  assert.equal(result.createsHumanRankingTruth, false);
  assert.equal(result.createsPromotionDecisionTruth, false);
  assert.equal(result.createsPunishmentTruth, false);
  assert.equal(result.createsTerminationTruth, false);
  assert.equal(result.createsAdvisorLifecycleTruth, false);
  assert.equal(result.createsRevenueTruth, false);
  assert.equal(result.createsCompensationTruth, false);
  assert.equal(result.createsRevenue, false);
  assert.equal(result.createsCompensation, false);
  assert.equal(result.createsPayoutTruth, false);
  assert.equal(result.createsPrecontractTruth, false);
  assert.equal(result.createsHiringTruth, false);
}

const tests = [
  ["Combines recruitment and advisor historical analytics", () => {
    const result = buildManagerHistoricalAnalytics(baseInput());
    assert.ok(result.recruitmentHistoricalAnalytics);
    assert.ok(result.advisorHistoricalAnalytics);
    assert.equal(result.teamHistoricalContext.managerMetricsPeriods, 1);
    assertTruthFlags(result);
  }],
  ["Uses protected metrics snapshots context only", () => {
    const result = buildManagerHistoricalAnalytics(baseInput());
    assert.ok(result.warnings.some((warning) => warning.includes("protected metrics")));
    assert.equal(result.teamHistoricalContext.createsTruth, false);
    assertTruthFlags(result);
  }],
  ["Does not mutate inputs", () => {
    const input = baseInput();
    const original = clone(input);
    buildManagerHistoricalAnalytics(input);
    assert.deepEqual(input, original);
  }],
  ["Merges and dedupes evidence source and sourceOwners", () => {
    const result = buildManagerHistoricalAnalytics(baseInput());
    assert.equal(result.evidenceRefs.filter((item) => item === "shared-ref").length, 1);
    assert.equal(result.sourceEvidenceIds.filter((item) => item === "shared-source").length, 1);
    assert.equal(result.sourceOwners.filter((item) => item === "MANAGER_OS").length, 1);
    assertTruthFlags(result);
  }],
  ["Propagates warnings limitations missing unknown stale defaultZero risks", () => {
    const result = buildManagerHistoricalAnalytics(baseInput({ sourceEvidence: {}, advisorMetricsSeries: [{ advisorMetrics: {}, defaultZeroRisks: ["score.zero_requires_evidence_review"] }] }));
    assert.ok(result.missingEvidence.length > 0);
    assert.ok(result.unknownSignals.length > 0);
    assert.ok(result.staleSignals.length > 0);
    assert.ok(result.defaultZeroRisks.includes("score.zero_requires_evidence_review"));
    assert.ok(result.confidenceLimitations.length > 0);
    assertTruthFlags(result);
  }],
  ["Blocks forbidden uses", () => {
    const result = buildManagerHistoricalAnalytics(baseInput({ requestedUse: "TERMINATION" }));
    assert.equal(result.historicalStatus, MANAGER_HISTORICAL_ANALYTICS_STATUSES.BLOCKED);
    assert.ok(result.blockedUses.includes("TERMINATION"));
    assertTruthFlags(result);
  }],
  ["Allows context uses", () => {
    const result = buildManagerHistoricalAnalytics(baseInput({ requestedUse: "CONVERSATION_CONTEXT" }));
    assert.ok(result.allowedUses.includes("CONVERSATION_CONTEXT"));
    assert.equal(result.blockedUses.length, 0);
    assertTruthFlags(result);
  }],
  ["Creates no downstream truth", () => {
    assertTruthFlags(buildManagerHistoricalAnalytics(baseInput()));
  }],
  ["No direct Advisor OS import", () => {
    const file = fs.readFileSync(path.join(__dirname, "../historical-analytics/manager-historical-analytics-engine.js"), "utf8");
    assert.equal(file.includes("advisor-os/"), false);
  }],
  ["No legacy Manager OS import", () => {
    const file = fs.readFileSync(path.join(__dirname, "../historical-analytics/manager-historical-analytics-engine.js"), "utf8");
    ["team-intelligence", "manager-os/alerts", "manager-os/coaching", "manager-os/feed", "manager-os/notifications"].forEach((text) => assert.equal(file.includes(text), false));
  }],
  ["No compensation revenue lifecycle product imports", () => {
    const file = fs.readFileSync(path.join(__dirname, "../historical-analytics/manager-historical-analytics-engine.js"), "utf8");
    ["compensation/", "revenue/", "advisor-lifecycle/", "product-intelligence/"].forEach((text) => assert.equal(file.includes(text), false));
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
