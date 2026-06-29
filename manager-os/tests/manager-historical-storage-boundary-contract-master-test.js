const assert = require("assert");

const {
  buildManagerHistoricalStorageBoundary,
  MANAGER_HISTORICAL_STORAGE_BOUNDARY_STATUSES
} = require("../historical-analytics/storage/manager-historical-storage-boundary-contract");

console.log("\nFORGE MANAGER HISTORICAL STORAGE BOUNDARY CONTRACT MASTER TEST v1.0\n");

const sourceEvidence = {
  evidenceRefs: ["storage-ref", "shared-ref"],
  sourceEvidenceIds: ["storage-source", "shared-source"],
  sourceOwners: ["MANAGER_OS"],
  freshness: { status: "FRESH" },
  generatedAt: "2026-06-29T12:00:00.000Z"
};

const rollup = {
  periodId: "2026-06",
  metricKey: "activity",
  metricValueContext: { value: 4 },
  evidenceRefs: ["rollup-ref", "shared-ref"],
  sourceEvidenceIds: ["rollup-source", "shared-source"],
  sourceOwners: ["MANAGER_OS"],
  freshness: { status: "FRESH" }
};

function baseInput(overrides = {}) {
  return {
    storageContext: {
      storageMode: "BOUNDARY_ONLY",
      rollups: [rollup]
    },
    requestedUse: "STORAGE_PLANNING_CONTEXT",
    sourceEvidence,
    freshness: { status: "FRESH" },
    periodRange: { periodStart: "2026-06-01", periodEnd: "2026-06-30" },
    ...overrides
  };
}

function clone(value) { return JSON.parse(JSON.stringify(value)); }
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
  ["Missing storage context becomes UNKNOWN, not zero", () => {
    const result = buildManagerHistoricalStorageBoundary(baseInput({ storageContext: null }));
    assert.equal(result.storageBoundaryStatus, MANAGER_HISTORICAL_STORAGE_BOUNDARY_STATUSES.UNKNOWN);
    assert.ok(result.unknownSignals.includes("historical_storage_context_missing"));
    assertFlags(result);
  }],
  ["Missing rollups become UNKNOWN, not poor performance", () => {
    const result = buildManagerHistoricalStorageBoundary(baseInput({ storageContext: { rollups: [] } }));
    assert.equal(result.storageBoundaryStatus, MANAGER_HISTORICAL_STORAGE_BOUNDARY_STATUSES.UNKNOWN);
    assert.ok(result.unknownSignals.includes("historical_rollups_missing"));
    assertFlags(result);
  }],
  ["Missing evidence requires review", () => {
    const result = buildManagerHistoricalStorageBoundary(baseInput({ storageContext: { rollups: [{}] }, sourceEvidence: { sourceOwners: ["MANAGER_OS"], freshness: { status: "FRESH" } } }));
    assert.equal(result.storageBoundaryStatus, MANAGER_HISTORICAL_STORAGE_BOUNDARY_STATUSES.NEEDS_EVIDENCE);
    assert.ok(result.missingEvidence.includes("historical_storage_evidence_missing"));
    assertFlags(result);
  }],
  ["Missing source owner requires review", () => {
    const result = buildManagerHistoricalStorageBoundary(baseInput({ sourceEvidence: { evidenceRefs: ["e"], sourceEvidenceIds: ["s"], freshness: { status: "FRESH" } } }));
    assert.equal(result.storageBoundaryStatus, MANAGER_HISTORICAL_STORAGE_BOUNDARY_STATUSES.NEEDS_SOURCE_OWNER);
    assert.ok(result.missingEvidence.includes("historical_storage_source_owner_missing"));
    assertFlags(result);
  }],
  ["Missing freshness requires review", () => {
    const result = buildManagerHistoricalStorageBoundary(baseInput({ sourceEvidence: { evidenceRefs: ["e"], sourceEvidenceIds: ["s"], sourceOwners: ["MANAGER_OS"] }, freshness: null }));
    assert.equal(result.storageBoundaryStatus, MANAGER_HISTORICAL_STORAGE_BOUNDARY_STATUSES.NEEDS_FRESHNESS);
    assert.ok(result.staleSignals.includes("historical_storage_freshness_missing"));
    assertFlags(result);
  }],
  ["Stale freshness requires review", () => {
    const result = buildManagerHistoricalStorageBoundary(baseInput({ freshness: { status: "STALE" } }));
    assert.equal(result.storageBoundaryStatus, MANAGER_HISTORICAL_STORAGE_BOUNDARY_STATUSES.NEEDS_FRESHNESS);
    assert.ok(result.staleSignals.includes("historical_storage_freshness_stale"));
    assertFlags(result);
  }],
  ["Blocked period remains review-required, not zero", () => {
    const result = buildManagerHistoricalStorageBoundary(baseInput({ storageContext: { rollups: [{ periodId: "2026-06", periodStatus: "BLOCKED" }] } }));
    assert.equal(result.storageBoundaryStatus, MANAGER_HISTORICAL_STORAGE_BOUNDARY_STATUSES.NEEDS_HUMAN_REVIEW);
    assert.ok(result.blockedPeriods.includes("2026-06"));
    assertFlags(result);
  }],
  ["Explicit zero values are context warnings only", () => {
    const result = buildManagerHistoricalStorageBoundary(baseInput({ storageContext: { rollups: [{ defaultZeroRisks: ["metric.zero_requires_evidence_review"] }] } }));
    assert.ok(result.defaultZeroRisks.includes("metric.zero_requires_evidence_review"));
    assert.ok(result.warnings.some((warning) => warning.includes("explicit zero")));
    assertFlags(result);
  }],
  ["Forbidden uses are blocked", () => {
    const result = buildManagerHistoricalStorageBoundary(baseInput({ requestedUse: "DATABASE_WRITE" }));
    assert.equal(result.storageBoundaryStatus, MANAGER_HISTORICAL_STORAGE_BOUNDARY_STATUSES.BLOCKED);
    assert.ok(result.blockedUses.includes("DATABASE_WRITE"));
    assertFlags(result);
  }],
  ["Allowed uses are allowed", () => {
    const result = buildManagerHistoricalStorageBoundary(baseInput({ requestedUse: "QUERY_PLANNING_CONTEXT" }));
    assert.ok(result.allowedUses.includes("QUERY_PLANNING_CONTEXT"));
    assert.equal(result.blockedUses.length, 0);
    assertFlags(result);
  }],
  ["Inputs are not mutated", () => {
    const input = baseInput();
    const original = clone(input);
    buildManagerHistoricalStorageBoundary(input);
    assert.deepEqual(input, original);
  }],
  ["Evidence source sourceOwners dedupe", () => {
    const result = buildManagerHistoricalStorageBoundary(baseInput());
    assert.equal(result.evidenceRefs.filter((item) => item === "shared-ref").length, 1);
    assert.equal(result.sourceEvidenceIds.filter((item) => item === "shared-source").length, 1);
    assert.equal(result.sourceOwners.filter((item) => item === "MANAGER_OS").length, 1);
    assertFlags(result);
  }],
  ["No write truth and all truth flags remain false", () => {
    assertFlags(buildManagerHistoricalStorageBoundary(baseInput()));
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
