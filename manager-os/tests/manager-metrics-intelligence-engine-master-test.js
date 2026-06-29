const assert = require("assert");
const fs = require("fs");
const path = require("path");

const {
  buildManagerMetricsIntelligence,
  MANAGER_METRICS_INTELLIGENCE_STATUSES
} = require("../metrics/manager-metrics-intelligence-engine");

console.log("\nFORGE MANAGER METRICS INTELLIGENCE ENGINE MASTER TEST v1.0\n");

const sourceEvidence = {
  evidenceRefs: ["metrics-evidence-1", "shared-ref"],
  sourceEvidenceIds: ["metrics-source-1", "shared-source"],
  sourceOwners: ["MANAGER_OS"],
  freshness: { status: "FRESH", capturedAt: "2026-06-29T12:00:00.000Z" },
  generatedAt: "2026-06-29T12:00:00.000Z"
};

const candidateSnapshot = {
  candidateId: "CANDIDATE_001",
  currentStage: "READY_FOR_PRECONTRACT_REVIEW",
  eventTimeline: [
    { normalizedEventType: "NAME_ADDED" },
    { normalizedEventType: "CONTACT_CONNECTED" },
    { normalizedEventType: "INITIAL_INTERVIEW_COMPLETED" },
    { normalizedEventType: "READY_FOR_PRECONTRACT_REVIEW" }
  ],
  evidenceRefs: ["candidate-ref", "shared-ref"],
  sourceEvidenceIds: ["candidate-source", "shared-source"],
  sourceOwners: ["MANAGER_OS"],
  freshness: { status: "FRESH" },
  precontractReadinessContext: { readyForPrecontractReview: true, referenceOnly: true, createsTruth: false }
};

const advisorSnapshot = {
  advisorId: "ADVISOR_001",
  advisorStatusContext: { value: { status: "ACTIVE" }, referenceOnly: true, createsTruth: false },
  activityTimeline: [{ id: "activity-1" }],
  eventTimeline: [{ id: "event-1" }],
  pipelineContext: { value: { pipeline: 0 }, referenceOnly: true, createsTruth: false },
  productionContext: { value: { production: 0 }, referenceOnly: true, createsTruth: false },
  qualificationContext: { value: { score: 0 }, referenceOnly: true, createsTruth: false },
  defaultZeroRisks: ["pipeline.zero_requires_evidence_review"],
  evidenceRefs: ["advisor-ref", "shared-ref"],
  sourceEvidenceIds: ["advisor-source", "shared-source"],
  sourceOwners: ["MANAGER_OS"],
  freshness: { status: "FRESH" }
};

function baseInput(overrides = {}) {
  return {
    candidateManagerSnapshots: [candidateSnapshot],
    advisorManagerSnapshots: [advisorSnapshot],
    period: { periodId: "2026-06" },
    sourceEvidence,
    requestedUse: "MANAGER_REVIEW",
    generatedAt: "2026-06-29T12:30:00.000Z",
    assumptions: ["V1 protected snapshot context"],
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
    name: "Orchestrator combines recruitment and advisor metrics",
    run() {
      const result = buildManagerMetricsIntelligence(baseInput());
      assert.equal(result.recruitmentMetrics.totalCandidateSnapshots, 1);
      assert.equal(result.advisorMetrics.totalAdvisorSnapshots, 1);
      assert.equal(result.teamMetricsContext.recruitmentSnapshotCount, 1);
      assert.equal(result.teamMetricsContext.advisorSnapshotCount, 1);
      assertTruthFlags(result);
    }
  },
  {
    name: "It uses protected CandidateManagerSnapshot and AdvisorManagerSnapshot inputs only",
    run() {
      const result = buildManagerMetricsIntelligence(baseInput());
      assert.ok(result.warnings.some((warning) => warning.includes("protected snapshots only")));
      assert.equal(result.boundaryContext.metricsContext.referenceOnly, true);
      assertTruthFlags(result);
    }
  },
  {
    name: "It does not mutate inputs",
    run() {
      const input = baseInput();
      const original = clone(input);
      buildManagerMetricsIntelligence(input);
      assert.deepEqual(input, original);
    }
  },
  {
    name: "It merges and dedupes evidence source and source owners",
    run() {
      const result = buildManagerMetricsIntelligence(baseInput());
      assert.equal(result.evidenceRefs.filter((item) => item === "shared-ref").length, 1);
      assert.equal(result.sourceEvidenceIds.filter((item) => item === "shared-source").length, 1);
      assert.equal(result.sourceOwners.filter((item) => item === "MANAGER_OS").length, 1);
      assertTruthFlags(result);
    }
  },
  {
    name: "It propagates warnings limitations missing unknown stale and defaultZero risks",
    run() {
      const result = buildManagerMetricsIntelligence(baseInput({
        sourceEvidence: {},
        advisorManagerSnapshots: [{
          advisorId: "A2",
          defaultZeroRisks: ["score.zero_requires_evidence_review"]
        }]
      }));
      assert.ok(result.missingEvidence.length > 0);
      assert.ok(result.unknownSignals.length > 0);
      assert.ok(result.staleSignals.length > 0);
      assert.ok(result.defaultZeroRisks.includes("score.zero_requires_evidence_review"));
      assert.ok(result.confidenceLimitations.length > 0);
      assertTruthFlags(result);
    }
  },
  {
    name: "It blocks forbidden uses",
    run() {
      const result = buildManagerMetricsIntelligence(baseInput({ requestedUse: "PUNISHMENT" }));
      assert.equal(result.metricsStatus, MANAGER_METRICS_INTELLIGENCE_STATUSES.BLOCKED);
      assert.ok(result.blockedUses.includes("PUNISHMENT"));
      assertTruthFlags(result);
    }
  },
  {
    name: "It allows context uses",
    run() {
      const result = buildManagerMetricsIntelligence(baseInput({ requestedUse: "DASHBOARD_CONTEXT" }));
      assert.ok(result.allowedUses.includes("DASHBOARD_CONTEXT"));
      assert.equal(result.blockedUses.length, 0);
      assertTruthFlags(result);
    }
  },
  {
    name: "It creates no revenue compensation payout lifecycle ranking promotion punishment or automatic decision truth",
    run() {
      assertTruthFlags(buildManagerMetricsIntelligence(baseInput()));
    }
  },
  {
    name: "No direct Advisor OS import",
    run() {
      const file = fs.readFileSync(path.join(__dirname, "../metrics/manager-metrics-intelligence-engine.js"), "utf8");
      assert.equal(file.includes("advisor-os/"), false);
      assert.equal(file.includes("require(\"../../advisor-os"), false);
    }
  },
  {
    name: "No legacy Manager OS module import",
    run() {
      const file = fs.readFileSync(path.join(__dirname, "../metrics/manager-metrics-intelligence-engine.js"), "utf8");
      ["team-intelligence", "manager-os/alerts", "manager-os/coaching", "manager-os/feed", "manager-os/notifications"].forEach((text) => {
        assert.equal(file.includes(text), false);
      });
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
