const assert = require("assert");

const {
  buildManagerHistoricalAnalyticsBoundary,
  MANAGER_HISTORICAL_ANALYTICS_BOUNDARY_STATUSES
} = require("../historical-analytics/manager-historical-analytics-boundary-contract");

console.log("\nFORGE MANAGER HISTORICAL ANALYTICS BOUNDARY CONTRACT MASTER TEST v1.0\n");

const sourceEvidence = {
  evidenceRefs: ["hist-ref", "shared-ref"],
  sourceEvidenceIds: ["hist-source", "shared-source"],
  sourceOwners: ["MANAGER_OS"],
  freshness: { status: "FRESH" },
  generatedAt: "2026-06-29T12:00:00.000Z"
};

const metric = {
  period: { periodId: "2026-06" },
  evidenceRefs: ["metric-ref", "shared-ref"],
  sourceEvidenceIds: ["metric-source", "shared-source"],
  sourceOwners: ["MANAGER_OS"],
  freshness: { status: "FRESH" }
};

function baseInput(overrides = {}) {
  return {
    periodSeries: [{ periodId: "2026-05" }, { periodId: "2026-06" }],
    metricsSeries: [metric],
    sourceEvidence,
    requestedUse: "MANAGER_REVIEW",
    assumptions: ["protected metrics only"],
    generatedAt: "2026-06-29T12:30:00.000Z",
    ...overrides
  };
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

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
  ["Missing historical periods become UNKNOWN, not zero", () => {
    const result = buildManagerHistoricalAnalyticsBoundary(baseInput({ periodSeries: [] }));
    assert.equal(result.boundaryStatus, MANAGER_HISTORICAL_ANALYTICS_BOUNDARY_STATUSES.UNKNOWN);
    assert.equal(result.periodCountContext.value, 1);
    assert.ok(result.unknownSignals.includes("historical_period_context_missing"));
    assertTruthFlags(result);
  }],
  ["Missing evidence requires review", () => {
    const result = buildManagerHistoricalAnalyticsBoundary(baseInput({ metricsSeries: [{}], sourceEvidence: { sourceOwners: ["MANAGER_OS"], freshness: { status: "FRESH" } } }));
    assert.equal(result.boundaryStatus, MANAGER_HISTORICAL_ANALYTICS_BOUNDARY_STATUSES.NEEDS_EVIDENCE);
    assert.ok(result.missingEvidence.includes("historical_analytics_evidence_missing"));
    assertTruthFlags(result);
  }],
  ["Missing source owner requires review", () => {
    const result = buildManagerHistoricalAnalyticsBoundary(baseInput({ sourceEvidence: { evidenceRefs: ["e"], sourceEvidenceIds: ["s"], freshness: { status: "FRESH" } } }));
    assert.equal(result.boundaryStatus, MANAGER_HISTORICAL_ANALYTICS_BOUNDARY_STATUSES.NEEDS_SOURCE_OWNER);
    assert.ok(result.missingEvidence.includes("historical_analytics_source_owner_missing"));
    assertTruthFlags(result);
  }],
  ["Missing freshness requires review", () => {
    const result = buildManagerHistoricalAnalyticsBoundary(baseInput({ sourceEvidence: { evidenceRefs: ["e"], sourceEvidenceIds: ["s"], sourceOwners: ["MANAGER_OS"] } }));
    assert.equal(result.boundaryStatus, MANAGER_HISTORICAL_ANALYTICS_BOUNDARY_STATUSES.NEEDS_FRESHNESS);
    assert.ok(result.staleSignals.includes("historical_analytics_freshness_missing"));
    assertTruthFlags(result);
  }],
  ["Stale freshness requires review", () => {
    const result = buildManagerHistoricalAnalyticsBoundary(baseInput({ sourceEvidence: { evidenceRefs: ["e"], sourceEvidenceIds: ["s"], sourceOwners: ["MANAGER_OS"], freshness: { status: "STALE" } } }));
    assert.equal(result.boundaryStatus, MANAGER_HISTORICAL_ANALYTICS_BOUNDARY_STATUSES.NEEDS_FRESHNESS);
    assert.ok(result.staleSignals.includes("historical_analytics_freshness_stale"));
    assertTruthFlags(result);
  }],
  ["Blocked periods require review and do not collapse to zero", () => {
    const result = buildManagerHistoricalAnalyticsBoundary(baseInput({ metricsSeries: [{ period: { periodId: "2026-06" }, periodStatus: "BLOCKED" }] }));
    assert.equal(result.boundaryStatus, MANAGER_HISTORICAL_ANALYTICS_BOUNDARY_STATUSES.NEEDS_HUMAN_REVIEW);
    assert.ok(result.blockedPeriods.includes("2026-06"));
    assertTruthFlags(result);
  }],
  ["Explicit zero-like values are context warnings only", () => {
    const result = buildManagerHistoricalAnalyticsBoundary(baseInput({ metricsSeries: [{ defaultZeroRisks: ["pipeline.zero_requires_evidence_review"] }] }));
    assert.ok(result.defaultZeroRisks.includes("pipeline.zero_requires_evidence_review"));
    assert.ok(result.warnings.some((warning) => warning.includes("zero-like")));
    assertTruthFlags(result);
  }],
  ["Forbidden uses are blocked", () => {
    const result = buildManagerHistoricalAnalyticsBoundary(baseInput({ requestedUse: "HUMAN_RANKING" }));
    assert.equal(result.boundaryStatus, MANAGER_HISTORICAL_ANALYTICS_BOUNDARY_STATUSES.BLOCKED);
    assert.ok(result.blockedUses.includes("HUMAN_RANKING"));
    assertTruthFlags(result);
  }],
  ["Allowed uses are allowed", () => {
    const result = buildManagerHistoricalAnalyticsBoundary(baseInput({ requestedUse: "FORECAST_CONTEXT" }));
    assert.ok(result.allowedUses.includes("FORECAST_CONTEXT"));
    assert.equal(result.blockedUses.length, 0);
    assertTruthFlags(result);
  }],
  ["Inputs are not mutated", () => {
    const input = baseInput();
    const original = clone(input);
    buildManagerHistoricalAnalyticsBoundary(input);
    assert.deepEqual(input, original);
  }],
  ["Evidence source and sourceOwners dedupe", () => {
    const result = buildManagerHistoricalAnalyticsBoundary(baseInput());
    assert.equal(result.evidenceRefs.filter((item) => item === "shared-ref").length, 1);
    assert.equal(result.sourceEvidenceIds.filter((item) => item === "shared-source").length, 1);
    assert.equal(result.sourceOwners.filter((item) => item === "MANAGER_OS").length, 1);
    assertTruthFlags(result);
  }],
  ["All truth flags remain false", () => {
    assertTruthFlags(buildManagerHistoricalAnalyticsBoundary(baseInput()));
  }]
];

let passed = 0;
let failed = 0;

tests.forEach(([name, run]) => {
  try {
    run();
    passed += 1;
    console.log(`PASS ${name}`);
  } catch (error) {
    failed += 1;
    console.error(`FAIL ${name}`);
    console.error(error);
  }
});

console.log("\nResumen:");
console.log(`Total: ${tests.length}`);
console.log(`Pass: ${passed}`);
console.log(`Fail: ${failed}`);
if (failed > 0) process.exit(1);
