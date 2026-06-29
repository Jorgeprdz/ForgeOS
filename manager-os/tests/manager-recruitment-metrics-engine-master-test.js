const assert = require("assert");

const {
  calculateManagerRecruitmentMetrics,
  MANAGER_RECRUITMENT_METRICS_STATUSES
} = require("../metrics/manager-recruitment-metrics-engine");

console.log("\nFORGE MANAGER RECRUITMENT METRICS ENGINE MASTER TEST v1.0\n");

const sourceEvidence = {
  evidenceRefs: ["metrics-evidence-1"],
  sourceEvidenceIds: ["metrics-source-1"],
  sourceOwners: ["MANAGER_OS"],
  freshness: { status: "FRESH", capturedAt: "2026-06-29T12:00:00.000Z" },
  generatedAt: "2026-06-29T12:00:00.000Z"
};

function event(type) {
  return { normalizedEventType: type, occurredAt: "2026-06-01T10:00:00.000Z" };
}

const candidateSnapshot = {
  candidateId: "CANDIDATE_001",
  currentStage: "READY_FOR_PRECONTRACT_REVIEW",
  eventTimeline: [
    event("NAME_ADDED"),
    event("CONTACT_ATTEMPTED"),
    event("CONTACT_CONNECTED"),
    event("INITIAL_INTERVIEW_SCHEDULED"),
    event("INITIAL_INTERVIEW_COMPLETED"),
    event("SELECTION_INTERVIEW_SCHEDULED"),
    event("SELECTION_INTERVIEW_COMPLETED"),
    event("CAREER_INTERVIEW_SCHEDULED"),
    event("CAREER_INTERVIEW_COMPLETED"),
    event("ADDITIONAL_INTERVIEW_SCHEDULED"),
    event("ADDITIONAL_INTERVIEW_COMPLETED"),
    event("MANAGER_REVIEW_STARTED"),
    event("READY_FOR_PRECONTRACT_REVIEW"),
    event("PRECONTRACT_DOCS_REQUESTED"),
    event("PRECONTRACT_DOCS_RECEIVED"),
    event("CANDIDATE_WITHDRAWN"),
    event("CANDIDATE_REACTIVATED"),
    event("CANDIDATE_BLOCKED"),
    event("CANDIDATE_REENTRY_REVIEW")
  ],
  stageHistory: [{ eventType: "READY_FOR_PRECONTRACT_REVIEW", referenceOnly: true }],
  interviewHistory: [{ eventType: "INITIAL_INTERVIEW_COMPLETED", referenceOnly: true }],
  withdrawalRiskContext: { active: true, referenceOnly: true, createsTruth: false },
  blockedContext: { active: true, referenceOnly: true, createsTruth: false },
  reentryContext: { active: true, referenceOnly: true, createsTruth: false },
  precontractReadinessContext: { readyForPrecontractReview: true, referenceOnly: true, createsTruth: false },
  evidenceRefs: ["candidate-ref"],
  sourceEvidenceIds: ["candidate-source"],
  sourceOwners: ["MANAGER_OS"],
  freshness: { status: "FRESH" }
};

function baseInput(overrides = {}) {
  return {
    candidateManagerSnapshots: [candidateSnapshot],
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
  assert.equal(result.createsPrecontractTruth, false);
  assert.equal(result.createsHiringTruth, false);
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
    name: "Candidate snapshots are counted as context only",
    run() {
      const result = calculateManagerRecruitmentMetrics(baseInput());
      assert.equal(result.recruitmentMetrics.totalCandidateSnapshots, 1);
      assert.equal(result.recruitmentMetrics.referenceOnly, true);
      assert.equal(result.recruitmentMetrics.createsTruth, false);
      assertTruthFlags(result);
    }
  },
  {
    name: "Missing event history does not become zero pipeline",
    run() {
      const result = calculateManagerRecruitmentMetrics(baseInput({
        candidateManagerSnapshots: [{ candidateId: "C2", evidenceRefs: ["e"], sourceEvidenceIds: ["s"], sourceOwners: ["MANAGER_OS"] }]
      }));
      assert.ok(result.unknownSignals.includes("candidate_snapshot_event_timeline_missing"));
      assert.equal(result.managerReviewRequired, true);
      assertTruthFlags(result);
    }
  },
  {
    name: "Empty event history can only become zero-like context when evidence source freshness exists",
    run() {
      const result = calculateManagerRecruitmentMetrics(baseInput({
        candidateManagerSnapshots: [{
          candidateId: "C3",
          eventTimeline: [],
          evidenceRefs: ["e"],
          sourceEvidenceIds: ["s"],
          sourceOwners: ["MANAGER_OS"],
          freshness: { status: "FRESH" }
        }]
      }));
      assert.equal(result.recruitmentMetrics.namesAdded, 0);
      assert.equal(result.recruitmentMetrics.pipelineVelocityContext.createsTruth, false);
      assertTruthFlags(result);
    }
  },
  {
    name: "Interview scheduled and completed counts derive from snapshot event context",
    run() {
      const result = calculateManagerRecruitmentMetrics(baseInput());
      assert.equal(result.recruitmentMetrics.initialInterviewsScheduled, 1);
      assert.equal(result.recruitmentMetrics.initialInterviewsCompleted, 1);
      assert.equal(result.recruitmentMetrics.selectionInterviewsCompleted, 1);
      assert.equal(result.recruitmentMetrics.careerInterviewsCompleted, 1);
      assert.equal(result.recruitmentMetrics.additionalInterviewsCompleted, 1);
      assertTruthFlags(result);
    }
  },
  {
    name: "Stage conversion rates are context only and include assumptions",
    run() {
      const result = calculateManagerRecruitmentMetrics(baseInput());
      assert.equal(result.recruitmentMetrics.stageConversionRates.contactToInitialInterview.referenceOnly, true);
      assert.ok(result.assumptions.some((item) => item.includes("Conversion rates")));
      assertTruthFlags(result);
    }
  },
  {
    name: "READY_FOR_PRECONTRACT_REVIEW does not create precontract truth",
    run() {
      const result = calculateManagerRecruitmentMetrics(baseInput());
      assert.equal(result.recruitmentMetrics.readyForPrecontractReviewCount, 2);
      assert.equal(result.createsPrecontractTruth, false);
      assert.ok(result.warnings.some((warning) => warning.includes("READY_FOR_PRECONTRACT_REVIEW")));
      assertTruthFlags(result);
    }
  },
  {
    name: "Withdrawn candidate does not create rejection truth",
    run() {
      const result = calculateManagerRecruitmentMetrics(baseInput());
      assert.equal(result.recruitmentMetrics.withdrawnCandidates, 1);
      assert.equal(result.automaticDecisionAllowed, false);
      assert.ok(result.warnings.some((warning) => warning.includes("Withdrawn candidate")));
      assertTruthFlags(result);
    }
  },
  {
    name: "Blocked candidate does not create punishment truth",
    run() {
      const result = calculateManagerRecruitmentMetrics(baseInput());
      assert.equal(result.recruitmentMetrics.blockedCandidates, 1);
      assert.ok(result.warnings.some((warning) => warning.includes("Blocked candidate")));
      assertTruthFlags(result);
    }
  },
  {
    name: "Reentry and reactivation do not create automatic approval truth",
    run() {
      const result = calculateManagerRecruitmentMetrics(baseInput());
      assert.equal(result.recruitmentMetrics.reactivatedCandidates, 1);
      assert.equal(result.recruitmentMetrics.reentryReviewCandidates, 1);
      assert.ok(result.warnings.some((warning) => warning.includes("Reentry/reactivation")));
      assertTruthFlags(result);
    }
  },
  {
    name: "Missing evidence source freshness propagates",
    run() {
      const result = calculateManagerRecruitmentMetrics(baseInput({
        sourceEvidence: {}
      }));
      assert.ok(result.missingEvidence.includes("manager_recruitment_metrics_evidence_missing"));
      assert.ok(result.missingEvidence.includes("manager_recruitment_metrics_source_owner_missing"));
      assert.ok(result.staleSignals.includes("manager_recruitment_metrics_freshness_missing"));
      assertTruthFlags(result);
    }
  },
  {
    name: "Forbidden uses are blocked",
    run() {
      const result = calculateManagerRecruitmentMetrics(baseInput({ requestedUse: "HIRING_TRUTH" }));
      assert.equal(result.metricsStatus, MANAGER_RECRUITMENT_METRICS_STATUSES.BLOCKED);
      assert.ok(result.blockedUses.includes("HIRING_TRUTH"));
      assertTruthFlags(result);
    }
  },
  {
    name: "Allowed uses are allowed",
    run() {
      const result = calculateManagerRecruitmentMetrics(baseInput({ requestedUse: "HISTORICAL_ANALYTICS_CONTEXT" }));
      assert.ok(result.allowedUses.includes("HISTORICAL_ANALYTICS_CONTEXT"));
      assert.equal(result.blockedUses.length, 0);
      assertTruthFlags(result);
    }
  },
  {
    name: "Inputs are not mutated",
    run() {
      const input = baseInput();
      const original = clone(input);
      calculateManagerRecruitmentMetrics(input);
      assert.deepEqual(input, original);
    }
  },
  {
    name: "All truth flags remain false",
    run() {
      assertTruthFlags(calculateManagerRecruitmentMetrics(baseInput()));
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
