const assert = require("assert");
const fs = require("fs");
const path = require("path");

const {
  calculateManagerAdvisorHistoricalAnalytics,
  MANAGER_ADVISOR_HISTORICAL_ANALYTICS_STATUSES
} = require("../historical-analytics/manager-advisor-historical-analytics-engine");

console.log("\nFORGE MANAGER ADVISOR HISTORICAL ANALYTICS ENGINE MASTER TEST v1.0\n");

const sourceEvidence = {
  evidenceRefs: ["hist-ref"],
  sourceEvidenceIds: ["hist-source"],
  sourceOwners: ["MANAGER_OS"],
  freshness: { status: "FRESH" },
  generatedAt: "2026-06-29T12:00:00.000Z"
};

const mayMetrics = {
  period: { periodId: "2026-05" },
  advisorMetrics: {
    activitySignalCount: 5,
    followupSignalCount: 3,
    prospectingSignalCount: 4,
    referralSignalCount: 1,
    pipelineContext: { count: 2 },
    appointmentContext: { count: 1 },
    productionContext: { count: 1 },
    qualificationContext: { count: 1 },
    supportNeedsContext: { count: 2 },
    coachingNeedsContext: { count: 1 },
    advisorCountContext: { value: 4 },
    activeAdvisorContext: { value: 3 },
    defaultZeroRiskCount: 0,
    staleAdvisorSignals: [],
    missingAdvisorEvidence: []
  },
  evidenceRefs: ["may-ref"],
  sourceEvidenceIds: ["may-source"],
  sourceOwners: ["MANAGER_OS"],
  freshness: { status: "FRESH" }
};

const juneMetrics = {
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
    defaultZeroRiskCount: 1,
    staleAdvisorSignals: ["stale-signal"],
    missingAdvisorEvidence: ["missing-evidence"]
  },
  defaultZeroRisks: ["pipeline.zero_requires_evidence_review"],
  evidenceRefs: ["june-ref"],
  sourceEvidenceIds: ["june-source"],
  sourceOwners: ["MANAGER_OS"],
  freshness: { status: "FRESH" }
};

function baseInput(overrides = {}) {
  return {
    advisorMetricsSeries: [mayMetrics, juneMetrics],
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
}

const tests = [
  ["Activity prospecting followup referral trends are context only", () => {
    const result = calculateManagerAdvisorHistoricalAnalytics(baseInput());
    assert.equal(result.advisorHistoricalAnalytics.activityTrendContext.change, 2);
    assert.equal(result.advisorHistoricalAnalytics.prospectingTrendContext.referenceOnly, true);
    assert.equal(result.advisorHistoricalAnalytics.followupTrendContext.createsTruth, false);
    assert.equal(result.advisorHistoricalAnalytics.referralTrendContext.change, 1);
    assertTruthFlags(result);
  }],
  ["Missing activity does not become zero activity", () => {
    const result = calculateManagerAdvisorHistoricalAnalytics(baseInput({ advisorMetricsSeries: [{ advisorMetrics: { pipelineContext: { count: 1 } } }] }));
    assert.ok(result.unknownSignals.includes("advisor_historical_activity_unknown"));
    assert.ok(result.warnings.some((warning) => warning.includes("Missing activity")));
    assertTruthFlags(result);
  }],
  ["Missing pipeline does not become low pipeline", () => {
    const result = calculateManagerAdvisorHistoricalAnalytics(baseInput({ advisorMetricsSeries: [{ advisorMetrics: { activitySignalCount: 1 } }] }));
    assert.ok(result.unknownSignals.includes("advisor_historical_pipeline_unknown"));
    assert.ok(result.warnings.some((warning) => warning.includes("Missing pipeline")));
    assertTruthFlags(result);
  }],
  ["Explicit zero-like values are warnings and limitations only", () => {
    const result = calculateManagerAdvisorHistoricalAnalytics(baseInput());
    assert.ok(result.defaultZeroRisks.includes("pipeline.zero_requires_evidence_review"));
    assert.ok(result.confidenceLimitations.includes("pipeline.zero_requires_evidence_review"));
    assertTruthFlags(result);
  }],
  ["Production trend does not create revenue truth", () => {
    const result = calculateManagerAdvisorHistoricalAnalytics(baseInput());
    assert.equal(result.advisorHistoricalAnalytics.productionContextTrend.change, 1);
    assert.equal(result.createsRevenueTruth, false);
    assertTruthFlags(result);
  }],
  ["Qualification trend does not create promotion truth", () => {
    const result = calculateManagerAdvisorHistoricalAnalytics(baseInput());
    assert.equal(result.advisorHistoricalAnalytics.qualificationContextTrend.change, 1);
    assert.equal(result.createsPromotionDecisionTruth, false);
    assertTruthFlags(result);
  }],
  ["Advisor status trend does not create Advisor Lifecycle truth", () => {
    const result = calculateManagerAdvisorHistoricalAnalytics(baseInput());
    assert.ok(result.warnings.some((warning) => warning.includes("Advisor status trend")));
    assert.equal(result.createsAdvisorLifecycleTruth, false);
    assertTruthFlags(result);
  }],
  ["Support coaching trend does not create punishment truth", () => {
    const result = calculateManagerAdvisorHistoricalAnalytics(baseInput());
    assert.equal(result.advisorHistoricalAnalytics.supportCoachingNeedTrendContext.createsTruth, false);
    assert.equal(result.createsPunishmentTruth, false);
    assertTruthFlags(result);
  }],
  ["Team patterns do not create ranking leaderboard or HR truth", () => {
    const result = calculateManagerAdvisorHistoricalAnalytics(baseInput());
    assert.equal(result.advisorHistoricalAnalytics.teamPatternContext.createsRankingTruth, false);
    assert.equal(result.createsHumanRankingTruth, false);
    assertTruthFlags(result);
  }],
  ["Missing stale evidence propagates", () => {
    const result = calculateManagerAdvisorHistoricalAnalytics(baseInput({ sourceEvidence: {} }));
    assert.ok(result.missingEvidence.includes("historical_analytics_evidence_missing"));
    assert.ok(result.staleSignals.includes("historical_analytics_freshness_missing"));
    assertTruthFlags(result);
  }],
  ["Forbidden uses are blocked", () => {
    const result = calculateManagerAdvisorHistoricalAnalytics(baseInput({ requestedUse: "PROMOTION_DECISION" }));
    assert.equal(result.analyticsStatus, MANAGER_ADVISOR_HISTORICAL_ANALYTICS_STATUSES.BLOCKED);
    assert.ok(result.blockedUses.includes("PROMOTION_DECISION"));
    assertTruthFlags(result);
  }],
  ["Allowed uses are allowed", () => {
    const result = calculateManagerAdvisorHistoricalAnalytics(baseInput({ requestedUse: "COACHING_CONTEXT" }));
    assert.ok(result.allowedUses.includes("COACHING_CONTEXT"));
    assert.equal(result.blockedUses.length, 0);
    assertTruthFlags(result);
  }],
  ["Inputs are not mutated", () => {
    const input = baseInput();
    const original = clone(input);
    calculateManagerAdvisorHistoricalAnalytics(input);
    assert.deepEqual(input, original);
  }],
  ["No direct Advisor OS import", () => {
    const file = fs.readFileSync(path.join(__dirname, "../historical-analytics/manager-advisor-historical-analytics-engine.js"), "utf8");
    assert.equal(file.includes("advisor-os/"), false);
  }],
  ["No legacy Manager OS import", () => {
    const file = fs.readFileSync(path.join(__dirname, "../historical-analytics/manager-advisor-historical-analytics-engine.js"), "utf8");
    ["team-intelligence", "manager-os/alerts", "manager-os/coaching", "manager-os/feed", "manager-os/notifications"].forEach((text) => assert.equal(file.includes(text), false));
  }],
  ["All truth flags remain false", () => {
    assertTruthFlags(calculateManagerAdvisorHistoricalAnalytics(baseInput()));
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
