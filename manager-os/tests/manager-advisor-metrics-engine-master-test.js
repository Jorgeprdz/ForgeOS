const assert = require("assert");
const fs = require("fs");
const path = require("path");

const {
  calculateManagerAdvisorMetrics,
  MANAGER_ADVISOR_METRICS_STATUSES
} = require("../metrics/manager-advisor-metrics-engine");

console.log("\nFORGE MANAGER ADVISOR METRICS ENGINE MASTER TEST v1.0\n");

const sourceEvidence = {
  evidenceRefs: ["metrics-evidence-1"],
  sourceEvidenceIds: ["metrics-source-1"],
  sourceOwners: ["MANAGER_OS"],
  freshness: { status: "FRESH", capturedAt: "2026-06-29T12:00:00.000Z" },
  generatedAt: "2026-06-29T12:00:00.000Z"
};

const advisorSnapshot = {
  advisorId: "ADVISOR_001",
  advisorStatusContext: { value: { status: "ACTIVE" }, referenceOnly: true, createsTruth: false },
  activityTimeline: [{ id: "activity-1" }, { id: "activity-2" }],
  eventTimeline: [{ id: "event-1" }],
  activityContext: { value: { activity: "CALLS" }, referenceOnly: true, createsTruth: false },
  pipelineContext: { value: { pipeline: 3 }, referenceOnly: true, createsTruth: false },
  prospectingContext: { value: { names: 4 }, referenceOnly: true, createsTruth: false },
  followupContext: { value: { followups: 2 }, referenceOnly: true, createsTruth: false },
  referralContext: { value: { referrals: 1 }, referenceOnly: true, createsTruth: false },
  appointmentContext: { value: { appointments: 1 }, referenceOnly: true, createsTruth: false },
  productionContext: { value: { production: 100 }, referenceOnly: true, createsTruth: false },
  qualificationContext: { value: { score: 88 }, referenceOnly: true, createsTruth: false },
  supportNeedsContext: { value: [{ type: "FOLLOWUP" }], referenceOnly: true, createsTruth: false },
  coachingContext: { value: { nextAction: "COACH" }, referenceOnly: true, createsTruth: false },
  missingEvidence: [],
  unknownSignals: [],
  staleSignals: [],
  defaultZeroRisks: ["advisorPerformance.score_zero_requires_evidence_review"],
  evidenceRefs: ["advisor-ref"],
  sourceEvidenceIds: ["advisor-source"],
  sourceOwners: ["MANAGER_OS"],
  freshness: { status: "FRESH" },
  managerReviewRequired: false,
  humanReviewRequired: false
};

function baseInput(overrides = {}) {
  return {
    advisorManagerSnapshots: [advisorSnapshot],
    period: { periodId: "2026-06" },
    sourceEvidence,
    requestedUse: "MANAGER_REVIEW",
    generatedAt: "2026-06-29T12:30:00.000Z",
    ...overrides
  };
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function assertTruthFlags(result) {
  assert.equal(result.automaticDecisionAllowed, false);
  assert.equal(result.createsAdvisorLifecycleTruth, false);
  assert.equal(result.createsRevenueTruth, false);
  assert.equal(result.createsCompensationTruth, false);
  assert.equal(result.createsRevenue, false);
  assert.equal(result.createsCompensation, false);
  assert.equal(result.createsPayoutTruth, false);
  assert.equal(result.createsHumanRankingTruth, false);
  assert.equal(result.createsPromotionDecisionTruth, false);
}

const tests = [
  {
    name: "Advisor snapshots are counted as context only",
    run() {
      const result = calculateManagerAdvisorMetrics(baseInput());
      assert.equal(result.advisorMetrics.totalAdvisorSnapshots, 1);
      assert.equal(result.advisorMetrics.referenceOnly, true);
      assert.equal(result.advisorMetrics.createsTruth, false);
      assertTruthFlags(result);
    }
  },
  {
    name: "Missing advisor snapshots do not become zero advisors",
    run() {
      const result = calculateManagerAdvisorMetrics(baseInput({ advisorManagerSnapshots: [] }));
      assert.equal(result.metricsStatus, MANAGER_ADVISOR_METRICS_STATUSES.UNKNOWN);
      assert.equal(result.advisorMetrics.totalAdvisorSnapshots, null);
      assert.ok(result.unknownSignals.includes("advisor_manager_snapshots_missing"));
      assertTruthFlags(result);
    }
  },
  {
    name: "Missing activity does not become zero activity",
    run() {
      const result = calculateManagerAdvisorMetrics(baseInput({
        advisorManagerSnapshots: [{ advisorId: "A2", pipelineContext: { value: { pipeline: 1 } }, evidenceRefs: ["e"], sourceEvidenceIds: ["s"], sourceOwners: ["MANAGER_OS"] }]
      }));
      assert.ok(result.unknownSignals.includes("advisor_snapshot_activity_timeline_missing"));
      assert.ok(result.warnings.some((warning) => warning.includes("Missing activity")));
      assertTruthFlags(result);
    }
  },
  {
    name: "Missing pipeline does not become low pipeline",
    run() {
      const result = calculateManagerAdvisorMetrics(baseInput({
        advisorManagerSnapshots: [{ advisorId: "A3", activityTimeline: [], evidenceRefs: ["e"], sourceEvidenceIds: ["s"], sourceOwners: ["MANAGER_OS"] }]
      }));
      assert.ok(result.unknownSignals.includes("advisor_snapshot_pipeline_context_missing"));
      assert.ok(result.warnings.some((warning) => warning.includes("Missing pipeline")));
      assertTruthFlags(result);
    }
  },
  {
    name: "Explicit zero-like advisor values are warnings and limitations only",
    run() {
      const result = calculateManagerAdvisorMetrics(baseInput());
      assert.equal(result.advisorMetrics.defaultZeroRiskCount, 1);
      assert.ok(result.confidenceLimitations.includes("advisorPerformance.score_zero_requires_evidence_review"));
      assertTruthFlags(result);
    }
  },
  {
    name: "Production context does not create revenue truth",
    run() {
      const result = calculateManagerAdvisorMetrics(baseInput());
      assert.equal(result.advisorMetrics.productionContext.createsRevenueTruth, false);
      assert.equal(result.createsRevenueTruth, false);
      assertTruthFlags(result);
    }
  },
  {
    name: "Qualification context does not create promotion truth",
    run() {
      const result = calculateManagerAdvisorMetrics(baseInput());
      assert.equal(result.advisorMetrics.qualificationContext.createsPromotionDecisionTruth, false);
      assert.equal(result.createsPromotionDecisionTruth, false);
      assertTruthFlags(result);
    }
  },
  {
    name: "Advisor status context does not create Advisor Lifecycle truth",
    run() {
      const result = calculateManagerAdvisorMetrics(baseInput());
      assert.equal(result.createsAdvisorLifecycleTruth, false);
      assert.ok(result.warnings.some((warning) => warning.includes("Advisor status context")));
      assertTruthFlags(result);
    }
  },
  {
    name: "Missing evidence source freshness propagates",
    run() {
      const result = calculateManagerAdvisorMetrics(baseInput({ sourceEvidence: {} }));
      assert.ok(result.missingEvidence.includes("manager_advisor_metrics_evidence_missing"));
      assert.ok(result.missingEvidence.includes("manager_advisor_metrics_source_owner_missing"));
      assert.ok(result.staleSignals.includes("manager_advisor_metrics_freshness_missing"));
      assertTruthFlags(result);
    }
  },
  {
    name: "Forbidden uses are blocked",
    run() {
      const result = calculateManagerAdvisorMetrics(baseInput({ requestedUse: "HUMAN_RANKING" }));
      assert.equal(result.metricsStatus, MANAGER_ADVISOR_METRICS_STATUSES.BLOCKED);
      assert.ok(result.blockedUses.includes("HUMAN_RANKING"));
      assertTruthFlags(result);
    }
  },
  {
    name: "Allowed uses are allowed",
    run() {
      const result = calculateManagerAdvisorMetrics(baseInput({ requestedUse: "COACHING_CONTEXT" }));
      assert.ok(result.allowedUses.includes("COACHING_CONTEXT"));
      assert.equal(result.blockedUses.length, 0);
      assertTruthFlags(result);
    }
  },
  {
    name: "Inputs are not mutated",
    run() {
      const input = baseInput();
      const original = clone(input);
      calculateManagerAdvisorMetrics(input);
      assert.deepEqual(input, original);
    }
  },
  {
    name: "No direct Advisor OS import",
    run() {
      const file = fs.readFileSync(path.join(__dirname, "../metrics/manager-advisor-metrics-engine.js"), "utf8");
      assert.equal(file.includes("advisor-os/"), false);
      assert.equal(file.includes("require(\"../../advisor-os"), false);
    }
  },
  {
    name: "No legacy Manager OS module import",
    run() {
      const file = fs.readFileSync(path.join(__dirname, "../metrics/manager-advisor-metrics-engine.js"), "utf8");
      ["team-intelligence", "manager-os/alerts", "manager-os/coaching", "manager-os/feed", "manager-os/notifications"].forEach((text) => {
        assert.equal(file.includes(text), false);
      });
    }
  },
  {
    name: "All truth flags remain false",
    run() {
      assertTruthFlags(calculateManagerAdvisorMetrics(baseInput()));
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
