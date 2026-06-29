const assert = require("assert");

const {
  buildManagerHistoricalQueryPlanContract,
  MANAGER_HISTORICAL_QUERY_PLAN_STATUSES
} = require("../historical-analytics/storage/manager-historical-query-plan-contract");

console.log("\nFORGE MANAGER HISTORICAL QUERY PLAN CONTRACT MASTER TEST v1.0\n");

function baseInput(overrides = {}) {
  return {
    managerId: "manager-001",
    teamId: "team-001",
    periodRange: { periodStart: "2026-06-01", periodEnd: "2026-06-30" },
    grain: "MONTH",
    metricFamilies: ["ACTIVITY", "PIPELINE"],
    metricKeys: ["advisor_activity_count"],
    requestedUse: "QUERY_PLANNING_CONTEXT",
    sourceEvidence: {
      evidenceRefs: ["query-ref", "shared-ref"],
      sourceEvidenceIds: ["query-source", "shared-source"],
      sourceOwners: ["MANAGER_OS"],
      freshness: { status: "FRESH" }
    },
    ...overrides
  };
}

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

const unsafeSources = [
  "RAW_ADVISOR_OS_SCAN",
  "RAW_RECRUITMENT_FULL_SCAN",
  "LEGACY_MANAGER_DASHBOARD_SCAN",
  "LEGACY_MANAGER_MOMENTUM_SCAN",
  "COMPENSATION_SOURCE_SCAN",
  "REVENUE_SOURCE_SCAN",
  "PAYOUT_SOURCE_SCAN",
  "ADVISOR_LIFECYCLE_SOURCE_SCAN"
];

const tests = [
  ["Query plan recommends rollups, not raw event scans", () => {
    const result = buildManagerHistoricalQueryPlanContract(baseInput());
    assert.equal(result.queryPlanStatus, MANAGER_HISTORICAL_QUERY_PLAN_STATUSES.READY_FOR_QUERY_PLANNING_CONTEXT);
    assert.equal(result.queryPlan.recommendedSource, "PERIOD_ROLLUPS");
    assert.equal(result.queryPlan.executeQuery, false);
    assert.equal(result.queryPlan.usePeriodRollups, true);
    assert.equal(result.queryPlan.avoidRawEventFullScans, true);
    assertFlags(result);
  }],
  ["Missing period range requires review", () => {
    const result = buildManagerHistoricalQueryPlanContract(baseInput({ periodRange: null }));
    assert.equal(result.queryPlanStatus, MANAGER_HISTORICAL_QUERY_PLAN_STATUSES.NEEDS_PERIOD_RANGE);
    assert.ok(result.missingPrerequisites.includes("historical_query_plan_period_range_required"));
    assertFlags(result);
  }],
  ["Missing manager team scope requires review", () => {
    const result = buildManagerHistoricalQueryPlanContract(baseInput({ managerId: null, teamId: null }));
    assert.equal(result.queryPlanStatus, MANAGER_HISTORICAL_QUERY_PLAN_STATUSES.NEEDS_MANAGER_OR_TEAM_SCOPE);
    assert.ok(result.missingPrerequisites.includes("historical_query_plan_manager_or_team_scope_required"));
    assertFlags(result);
  }],
  ["Missing freshness requires review", () => {
    const result = buildManagerHistoricalQueryPlanContract(baseInput({ sourceEvidence: { evidenceRefs: ["e"], sourceEvidenceIds: ["s"], sourceOwners: ["MANAGER_OS"] } }));
    assert.equal(result.queryPlanStatus, MANAGER_HISTORICAL_QUERY_PLAN_STATUSES.NEEDS_FRESHNESS);
    assert.ok(result.staleSignals.includes("historical_query_plan_freshness_missing"));
    assertFlags(result);
  }],
  ["Raw and unsafe source scans are blocked", () => {
    unsafeSources.forEach((unsafeSource) => {
      const result = buildManagerHistoricalQueryPlanContract(baseInput({ unsafeSources: [unsafeSource] }));
      assert.equal(result.queryPlanStatus, MANAGER_HISTORICAL_QUERY_PLAN_STATUSES.BLOCKED);
      assert.ok(result.blockedSources.includes(unsafeSource));
      assertFlags(result);
    });
  }],
  ["Allowed context query planning uses are allowed", () => {
    const result = buildManagerHistoricalQueryPlanContract(baseInput({ requestedUse: "STORAGE_PLANNING_CONTEXT" }));
    assert.ok(result.allowedUses.includes("STORAGE_PLANNING_CONTEXT"));
    assert.equal(result.blockedUses.length, 0);
    assertFlags(result);
  }],
  ["Forbidden decision write uses are blocked", () => {
    ["DATABASE_WRITE", "FILESYSTEM_WRITE", "CACHE_WRITE", "MIGRATION_WRITE", "SCHEMA_WRITE", "HUMAN_RANKING"].forEach((requestedUse) => {
      const result = buildManagerHistoricalQueryPlanContract(baseInput({ requestedUse }));
      assert.equal(result.queryPlanStatus, MANAGER_HISTORICAL_QUERY_PLAN_STATUSES.BLOCKED);
      assert.ok(result.blockedUses.includes(requestedUse));
      assertFlags(result);
    });
  }],
  ["Unknown query use is not silently allowed", () => {
    const result = buildManagerHistoricalQueryPlanContract(baseInput({ requestedUse: "SURPRISE_USE" }));
    assert.equal(result.queryPlanStatus, MANAGER_HISTORICAL_QUERY_PLAN_STATUSES.NOT_MODELED);
    assert.ok(result.blockedUses.includes("SURPRISE_USE"));
    assertFlags(result);
  }],
  ["Inputs are not mutated", () => {
    const input = baseInput({ unsafeSources: ["RAW_ADVISOR_OS_SCAN"] });
    const original = clone(input);
    buildManagerHistoricalQueryPlanContract(input);
    assert.deepEqual(input, original);
  }],
  ["No actual query execution or writes", () => {
    const result = buildManagerHistoricalQueryPlanContract(baseInput());
    assert.equal(result.queryPlan.executeQuery, false);
    assert.equal(result.createsDatabaseWrite, false);
    assert.equal(result.createsFilesystemWrite, false);
    assert.equal(result.createsCacheWrite, false);
    assert.equal(result.createsMigrationWrite, false);
    assert.equal(result.createsSchemaWrite, false);
    assertFlags(result);
  }],
  ["Evidence source owner refs are deduped", () => {
    const result = buildManagerHistoricalQueryPlanContract(baseInput({
      sourceEvidence: {
        evidenceRefs: ["shared-ref", "shared-ref", "query-ref"],
        sourceEvidenceIds: ["shared-source", "shared-source", "query-source"],
        sourceOwners: ["MANAGER_OS", "MANAGER_OS"],
        freshness: { status: "FRESH" }
      }
    }));
    assert.equal(result.evidenceRefs.filter((item) => item === "shared-ref").length, 1);
    assert.equal(result.sourceEvidenceIds.filter((item) => item === "shared-source").length, 1);
    assert.equal(result.sourceOwners.filter((item) => item === "MANAGER_OS").length, 1);
    assertFlags(result);
  }],
  ["All truth flags remain false", () => {
    assertFlags(buildManagerHistoricalQueryPlanContract(baseInput()));
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
