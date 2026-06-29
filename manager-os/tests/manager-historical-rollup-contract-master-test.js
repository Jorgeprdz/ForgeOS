const assert = require("assert");

const {
  buildManagerHistoricalRollupContract,
  MANAGER_HISTORICAL_ROLLUP_STATUSES
} = require("../historical-analytics/storage/manager-historical-rollup-contract");

console.log("\nFORGE MANAGER HISTORICAL ROLLUP CONTRACT MASTER TEST v1.0\n");

const baseRollup = {
  organizationId: "org-001",
  managerId: "manager-001",
  teamId: "team-001",
  periodId: "2026-06",
  periodStart: "2026-06-01",
  periodEnd: "2026-06-30",
  grain: "MONTH",
  metricFamily: "ACTIVITY",
  metricKey: "advisor_activity_count",
  metricValueContext: { value: 12 },
  metricStatus: "PROVIDED",
  evidenceRefs: ["rollup-ref", "shared-ref"],
  sourceEvidenceIds: ["rollup-source", "shared-source"],
  sourceOwners: ["MANAGER_OS"],
  freshness: { status: "FRESH" },
  assumptions: ["metric is manager review context"],
  confidenceLimitations: ["rollup is not payout truth"],
  warnings: ["context only"],
  generatedAt: "2026-06-29T12:00:00.000Z"
};

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function assertFlags(result) {
  assert.equal(result.automaticDecisionAllowed, false);
  assert.equal(result.createsHumanRankingTruth, false);
  assert.equal(result.createsPerformanceLeaderboardTruth, false);
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
  assert.equal(result.createsDatabaseWrite, false);
  assert.equal(result.createsFilesystemWrite, false);
  assert.equal(result.createsCacheWrite, false);
  assert.equal(result.createsMigrationWrite, false);
  assert.equal(result.createsSchemaWrite, false);
}

const tests = [
  ["Builds safe rollup context", () => {
    const result = buildManagerHistoricalRollupContract(baseRollup);
    assert.equal(result.rollupStatus, MANAGER_HISTORICAL_ROLLUP_STATUSES.READY_FOR_STORAGE_CONTEXT);
    assert.equal(result.rollupContext.managerId, "manager-001");
    assert.equal(result.rollupContext.metricKey, "advisor_activity_count");
    assertFlags(result);
  }],
  ["Missing metric value is UNKNOWN, not zero", () => {
    const result = buildManagerHistoricalRollupContract({ ...baseRollup, metricValueContext: undefined });
    assert.equal(result.rollupStatus, MANAGER_HISTORICAL_ROLLUP_STATUSES.UNKNOWN);
    assert.equal(result.rollupContext.metricValueContext, "UNKNOWN");
    assert.ok(result.unknownSignals.includes("historical_rollup_metric_value_missing"));
    assertFlags(result);
  }],
  ["Explicit zero rollup value is context only with evidence source freshness", () => {
    const result = buildManagerHistoricalRollupContract({ ...baseRollup, metricValueContext: { value: 0 } });
    assert.equal(result.rollupStatus, MANAGER_HISTORICAL_ROLLUP_STATUSES.NEEDS_HUMAN_REVIEW);
    assert.equal(result.rollupContext.explicitZeroContext, true);
    assert.ok(result.defaultZeroRisks.includes("historical_rollup_explicit_zero_requires_evidence_review"));
    assert.ok(result.warnings.some((warning) => warning.includes("Explicit zero")));
    assertFlags(result);
  }],
  ["Production rollup does not create revenue truth", () => {
    const result = buildManagerHistoricalRollupContract({ ...baseRollup, metricFamily: "PRODUCTION" });
    assert.ok(result.warnings.some((warning) => warning.includes("Production")));
    assert.equal(result.createsRevenueTruth, false);
    assert.equal(result.createsRevenue, false);
    assertFlags(result);
  }],
  ["Qualification rollup does not create promotion or lifecycle truth", () => {
    const result = buildManagerHistoricalRollupContract({ ...baseRollup, metricFamily: "QUALIFICATION" });
    assert.ok(result.warnings.some((warning) => warning.includes("Qualification")));
    assert.equal(result.createsPromotionDecisionTruth, false);
    assert.equal(result.createsAdvisorLifecycleTruth, false);
    assertFlags(result);
  }],
  ["Team pattern rollup does not create ranking truth", () => {
    const result = buildManagerHistoricalRollupContract({ ...baseRollup, metricFamily: "TEAM_PATTERN" });
    assert.ok(result.warnings.some((warning) => warning.includes("Team pattern")));
    assert.equal(result.createsHumanRankingTruth, false);
    assert.equal(result.createsPerformanceLeaderboardTruth, false);
    assertFlags(result);
  }],
  ["Missing evidence requires review", () => {
    const result = buildManagerHistoricalRollupContract({ ...baseRollup, evidenceRefs: [], sourceEvidenceIds: [] });
    assert.equal(result.rollupStatus, MANAGER_HISTORICAL_ROLLUP_STATUSES.NEEDS_EVIDENCE);
    assert.ok(result.missingEvidence.includes("historical_rollup_evidence_missing"));
    assertFlags(result);
  }],
  ["Missing source owner requires review", () => {
    const result = buildManagerHistoricalRollupContract({ ...baseRollup, sourceOwners: [] });
    assert.equal(result.rollupStatus, MANAGER_HISTORICAL_ROLLUP_STATUSES.NEEDS_SOURCE_OWNER);
    assert.ok(result.missingEvidence.includes("historical_rollup_source_owner_missing"));
    assertFlags(result);
  }],
  ["Missing freshness requires review", () => {
    const result = buildManagerHistoricalRollupContract({ ...baseRollup, freshness: null });
    assert.equal(result.rollupStatus, MANAGER_HISTORICAL_ROLLUP_STATUSES.NEEDS_FRESHNESS);
    assert.ok(result.staleSignals.includes("historical_rollup_freshness_missing"));
    assertFlags(result);
  }],
  ["Stale freshness requires review", () => {
    const result = buildManagerHistoricalRollupContract({ ...baseRollup, freshness: { status: "STALE" } });
    assert.equal(result.rollupStatus, MANAGER_HISTORICAL_ROLLUP_STATUSES.NEEDS_FRESHNESS);
    assert.ok(result.staleSignals.includes("historical_rollup_freshness_stale"));
    assertFlags(result);
  }],
  ["Evidence source freshness preserved and deduped", () => {
    const result = buildManagerHistoricalRollupContract({
      ...baseRollup,
      evidenceRefs: ["shared-ref", "shared-ref", "rollup-ref"],
      sourceEvidenceIds: ["shared-source", "shared-source", "rollup-source"],
      sourceOwners: ["MANAGER_OS", "MANAGER_OS"]
    });
    assert.equal(result.evidenceRefs.filter((item) => item === "shared-ref").length, 1);
    assert.equal(result.sourceEvidenceIds.filter((item) => item === "shared-source").length, 1);
    assert.equal(result.sourceOwners.filter((item) => item === "MANAGER_OS").length, 1);
    assert.deepEqual(result.freshness, { status: "FRESH" });
    assertFlags(result);
  }],
  ["Inputs are not mutated", () => {
    const input = clone(baseRollup);
    const original = clone(input);
    buildManagerHistoricalRollupContract(input);
    assert.deepEqual(input, original);
  }],
  ["No database filesystem cache migration schema writes", () => {
    assertFlags(buildManagerHistoricalRollupContract(baseRollup));
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
