const assert = require("assert");

const {
  buildManagerMetricsBoundary,
  MANAGER_METRICS_BOUNDARY_STATUSES
} = require("../metrics/manager-metrics-boundary-contract");

console.log("\nFORGE MANAGER METRICS BOUNDARY CONTRACT MASTER TEST v1.0\n");

const sourceEvidence = {
  evidenceRefs: ["metrics-evidence-1", "shared-ref"],
  sourceEvidenceIds: ["metrics-source-1", "shared-source"],
  sourceOwners: ["MANAGER_OS"],
  freshness: { status: "FRESH", capturedAt: "2026-06-29T12:00:00.000Z" },
  generatedAt: "2026-06-29T12:00:00.000Z"
};

const candidateSnapshot = {
  candidateId: "CANDIDATE_001",
  evidenceRefs: ["candidate-ref", "shared-ref"],
  sourceEvidenceIds: ["candidate-source", "shared-source"],
  sourceOwners: ["MANAGER_OS"],
  freshness: { status: "FRESH" }
};

const advisorSnapshot = {
  advisorId: "ADVISOR_001",
  evidenceRefs: ["advisor-ref", "shared-ref"],
  sourceEvidenceIds: ["advisor-source", "shared-source"],
  sourceOwners: ["MANAGER_OS"],
  freshness: { status: "FRESH" }
};

function baseInput(overrides = {}) {
  return {
    candidateManagerSnapshots: [candidateSnapshot],
    advisorManagerSnapshots: [advisorSnapshot],
    recruitmentMetrics: {
      defaultZeroRisks: []
    },
    advisorMetrics: {
      defaultZeroRisks: []
    },
    teamMetricsContext: { context: "TEAM" },
    period: { periodId: "2026-06" },
    sourceEvidence,
    requestedUse: "MANAGER_REVIEW",
    assumptions: ["protected snapshots only"],
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
  assert.equal(result.createsAdvisorLifecycleTruth, false);
  assert.equal(result.createsRevenueTruth, false);
  assert.equal(result.createsCompensationTruth, false);
  assert.equal(result.createsRevenue, false);
  assert.equal(result.createsCompensation, false);
  assert.equal(result.createsPayoutTruth, false);
}

const tests = [
  {
    name: "Missing snapshots become unknown and review-required, not zero",
    run() {
      const result = buildManagerMetricsBoundary(baseInput({
        candidateManagerSnapshots: [],
        advisorManagerSnapshots: []
      }));
      assert.equal(result.boundaryStatus, MANAGER_METRICS_BOUNDARY_STATUSES.UNKNOWN);
      assert.equal(result.managerReviewRequired, true);
      assert.equal(result.candidateSnapshotCountContext.value, null);
      assert.ok(result.unknownSignals.includes("manager_metrics_snapshot_context_missing"));
      assertTruthFlags(result);
    }
  },
  {
    name: "Missing evidence requires review",
    run() {
      const result = buildManagerMetricsBoundary(baseInput({
        candidateManagerSnapshots: [{ candidateId: "C1" }],
        advisorManagerSnapshots: [{ advisorId: "A1" }],
        recruitmentMetrics: null,
        advisorMetrics: null,
        sourceEvidence: { sourceOwners: ["MANAGER_OS"], freshness: { status: "FRESH" } }
      }));
      assert.equal(result.boundaryStatus, MANAGER_METRICS_BOUNDARY_STATUSES.NEEDS_EVIDENCE);
      assert.ok(result.missingEvidence.includes("manager_metrics_evidence_missing"));
      assertTruthFlags(result);
    }
  },
  {
    name: "Missing source owner requires review",
    run() {
      const result = buildManagerMetricsBoundary(baseInput({
        sourceEvidence: {
          evidenceRefs: ["evidence-1"],
          sourceEvidenceIds: ["source-1"],
          freshness: { status: "FRESH" }
        }
      }));
      assert.equal(result.boundaryStatus, MANAGER_METRICS_BOUNDARY_STATUSES.NEEDS_SOURCE_OWNER);
      assert.ok(result.missingEvidence.includes("manager_metrics_source_owner_missing"));
      assertTruthFlags(result);
    }
  },
  {
    name: "Missing freshness requires review",
    run() {
      const result = buildManagerMetricsBoundary(baseInput({
        sourceEvidence: {
          evidenceRefs: ["evidence-1"],
          sourceEvidenceIds: ["source-1"],
          sourceOwners: ["MANAGER_OS"]
        }
      }));
      assert.equal(result.boundaryStatus, MANAGER_METRICS_BOUNDARY_STATUSES.NEEDS_FRESHNESS);
      assert.ok(result.staleSignals.includes("manager_metrics_freshness_missing"));
      assertTruthFlags(result);
    }
  },
  {
    name: "Stale freshness requires review",
    run() {
      const result = buildManagerMetricsBoundary(baseInput({
        sourceEvidence: {
          evidenceRefs: ["evidence-1"],
          sourceEvidenceIds: ["source-1"],
          sourceOwners: ["MANAGER_OS"],
          freshness: { status: "STALE" }
        }
      }));
      assert.equal(result.boundaryStatus, MANAGER_METRICS_BOUNDARY_STATUSES.NEEDS_FRESHNESS);
      assert.ok(result.staleSignals.includes("manager_metrics_freshness_stale"));
      assertTruthFlags(result);
    }
  },
  {
    name: "Forbidden uses are blocked",
    run() {
      ["HUMAN_RANKING", "PROMOTION_DECISION", "PUNISHMENT", "TERMINATION", "COMPENSATION", "PAYOUT", "REVENUE_TRUTH", "ADVISOR_LIFECYCLE_TRUTH", "AUTOMATIC_DECISION", "PRECONTRACT_TRUTH", "HIRING_TRUTH"].forEach((requestedUse) => {
        const result = buildManagerMetricsBoundary(baseInput({ requestedUse }));
        assert.equal(result.boundaryStatus, MANAGER_METRICS_BOUNDARY_STATUSES.BLOCKED);
        assert.ok(result.blockedUses.includes(requestedUse));
        assertTruthFlags(result);
      });
    }
  },
  {
    name: "Allowed uses remain allowed",
    run() {
      ["MANAGER_REVIEW", "TEAM_PATTERN_CONTEXT", "COACHING_CONTEXT", "FORECAST_CONTEXT", "HISTORICAL_ANALYTICS_CONTEXT", "DASHBOARD_CONTEXT", "CONVERSATION_CONTEXT"].forEach((requestedUse) => {
        const result = buildManagerMetricsBoundary(baseInput({ requestedUse }));
        assert.ok(result.allowedUses.includes(requestedUse));
        assert.equal(result.blockedUses.length, 0);
        assertTruthFlags(result);
      });
    }
  },
  {
    name: "Unknown requested use is not silently allowed",
    run() {
      const result = buildManagerMetricsBoundary(baseInput({ requestedUse: "UNMODELED_USE" }));
      assert.equal(result.boundaryStatus, MANAGER_METRICS_BOUNDARY_STATUSES.BLOCKED);
      assert.ok(result.blockedUses.includes("UNMODELED_USE"));
      assertTruthFlags(result);
    }
  },
  {
    name: "Inputs are not mutated",
    run() {
      const input = baseInput();
      const original = clone(input);
      buildManagerMetricsBoundary(input);
      assert.deepEqual(input, original);
    }
  },
  {
    name: "Evidence source and source owners dedupe",
    run() {
      const result = buildManagerMetricsBoundary(baseInput());
      assert.equal(result.evidenceRefs.filter((item) => item === "shared-ref").length, 1);
      assert.equal(result.sourceEvidenceIds.filter((item) => item === "shared-source").length, 1);
      assert.equal(result.sourceOwners.filter((item) => item === "MANAGER_OS").length, 1);
      assertTruthFlags(result);
    }
  },
  {
    name: "All truth flags remain false",
    run() {
      assertTruthFlags(buildManagerMetricsBoundary(baseInput()));
    }
  }
];

let passed = 0;
let failed = 0;

tests.forEach((test) => {
  try {
    test.run();
    passed += 1;
    console.log(`PASS ${test.name}`);
  } catch (error) {
    failed += 1;
    console.error(`FAIL ${test.name}`);
    console.error(error);
  }
});

console.log("\nResumen:");
console.log(`Total: ${tests.length}`);
console.log(`Pass: ${passed}`);
console.log(`Fail: ${failed}`);

if (failed > 0) process.exit(1);
