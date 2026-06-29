const assert = require("assert");

const {
  CANDIDATE_MANAGER_SNAPSHOT_STATUSES,
  buildCandidateManagerSnapshot
} = require("../snapshots/candidate-manager-snapshot-engine");

console.log("\nFORGE CANDIDATE MANAGER SNAPSHOT ENGINE MASTER TEST v1.0\n");

const sourceEvidence = {
  evidenceRefs: ["snapshot-evidence-1", "shared-ref"],
  sourceEvidenceIds: ["snapshot-source-1", "shared-source"],
  sourceOwners: ["MANAGER_OS"],
  freshness: {
    status: "FRESH",
    capturedAt: "2026-06-29T12:00:00.000Z"
  }
};

const candidate = { candidateId: "CANDIDATE_001" };
const recruit = { recruitIdentityId: "RECRUIT_001" };
const application = { applicationId: "APPLICATION_001" };
const manager = { managerId: "MANAGER_001" };

const recruitmentEvents = [
  {
    normalizedEventType: "CONTACT_CONNECTED",
    occurredAt: "2026-06-01T10:00:00.000Z",
    evidenceRefs: ["event-ref-1"],
    sourceEvidenceIds: ["event-source-1"],
    sourceOwners: ["MANAGER_OS"]
  },
  {
    normalizedEventType: "READY_FOR_PRECONTRACT_REVIEW",
    occurredAt: "2026-06-03T10:00:00.000Z",
    evidenceRefs: ["event-ref-2"],
    sourceEvidenceIds: ["event-source-2"],
    sourceOwners: ["MANAGER_OS"]
  },
  {
    normalizedEventType: "INITIAL_INTERVIEW_COMPLETED",
    occurredAt: "2026-06-02T10:00:00.000Z",
    evidenceRefs: ["event-ref-3"],
    sourceEvidenceIds: ["event-source-3"],
    sourceOwners: ["MANAGER_OS"]
  }
];

function baseInput(overrides = {}) {
  return {
    candidate,
    recruit,
    application,
    manager,
    recruitmentEvents,
    recruitmentPipeline: {
      normalizedPipelineState: "READY_FOR_PRECONTRACT_REVIEW",
      nextRecommendedState: "MANAGER_REVIEW",
      evidenceRefs: ["pipeline-ref"],
      sourceEvidenceIds: ["pipeline-source"],
      sourceOwners: ["MANAGER_OS"]
    },
    interviewFlow: {
      nextRecommendedStage: "CAREER_INTERVIEW",
      humanReviewRequired: false,
      evidenceRefs: ["interview-ref"],
      sourceEvidenceIds: ["interview-source"],
      sourceOwners: ["MANAGER_OS"]
    },
    candidateAssessment: {
      recommendation: "ADVANCE",
      provenance: {
        evidenceRefs: ["assessment-ref"],
        sourceEvidenceIds: ["assessment-source"],
        sourceOwners: ["MANAGER_OS"]
      }
    },
    precontractGate: {
      readyForPrecontractReview: true,
      precontractReviewPacketReady: true,
      evidenceRefs: ["precontract-ref"],
      sourceEvidenceIds: ["precontract-source"],
      sourceOwners: ["MANAGER_OS"]
    },
    rdaPrerequisite: {
      rdaPrerequisiteStatus: "PROVIDED",
      evidenceRefs: ["rda-ref"],
      sourceEvidenceIds: ["rda-source"],
      sourceOwners: ["MANAGER_OS"]
    },
    period: { periodId: "2026-06" },
    sourceEvidence,
    requestedUse: "MANAGER_REVIEW",
    ...overrides
  };
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function assertBoundaries(result) {
  assert.equal(result.automaticDecisionAllowed, false);
  assert.equal(result.createsAutomaticApprovalTruth, false);
  assert.equal(result.createsAutomaticRejectionTruth, false);
  assert.equal(result.createsPrecontractTruth, false);
  assert.equal(result.createsAdvisorLifecycleTruth, false);
  assert.equal(result.createsHumanRankingTruth, false);
  assert.equal(result.createsPromotionDecisionTruth, false);
  assert.equal(result.createsRevenue, false);
  assert.equal(result.createsCompensation, false);
  assert.equal(result.createsPayoutTruth, false);
}

const tests = [
  {
    name: "Snapshot builds candidate, recruit, application and manager ids",
    run() {
      const result = buildCandidateManagerSnapshot(baseInput());
      assert.equal(result.candidateId, "CANDIDATE_001");
      assert.equal(result.recruitIdentityId, "RECRUIT_001");
      assert.equal(result.applicationId, "APPLICATION_001");
      assert.equal(result.managerId, "MANAGER_001");
      assertBoundaries(result);
    }
  },
  {
    name: "Event timeline is sorted without mutating original input",
    run() {
      const input = baseInput();
      const original = clone(input.recruitmentEvents);
      const result = buildCandidateManagerSnapshot(input);
      assert.deepEqual(input.recruitmentEvents, original);
      assert.deepEqual(result.eventTimeline.map((event) => event.normalizedEventType), [
        "CONTACT_CONNECTED",
        "INITIAL_INTERVIEW_COMPLETED",
        "READY_FOR_PRECONTRACT_REVIEW"
      ]);
      assertBoundaries(result);
    }
  },
  {
    name: "Stage history is context only",
    run() {
      const result = buildCandidateManagerSnapshot(baseInput());
      assert.ok(result.stageHistory.length > 0);
      assert.equal(result.stageHistory[0].referenceOnly, true);
      assert.equal(result.stageHistory[0].createsTruth, false);
      assertBoundaries(result);
    }
  },
  {
    name: "Missing event history becomes review-required and not zero",
    run() {
      const result = buildCandidateManagerSnapshot(baseInput({ recruitmentEvents: [] }));
      assert.equal(result.snapshotStatus, CANDIDATE_MANAGER_SNAPSHOT_STATUSES.UNKNOWN);
      assert.equal(result.humanReviewRequired, true);
      assert.ok(result.unknownSignals.includes("candidate_manager_snapshot_stage_history_unknown"));
      assertBoundaries(result);
    }
  },
  {
    name: "Missing evidence requires review",
    run() {
      const result = buildCandidateManagerSnapshot(baseInput({
        recruitmentEvents: [{ normalizedEventType: "CONTACT_CONNECTED", occurredAt: "2026-06-01T10:00:00.000Z" }],
        sourceEvidence: {
          sourceOwners: ["MANAGER_OS"],
          freshness: { status: "FRESH" }
        }
      }));
      assert.equal(result.snapshotStatus, CANDIDATE_MANAGER_SNAPSHOT_STATUSES.NEEDS_EVIDENCE);
      assert.ok(result.missingEvidence.includes("candidate_manager_snapshot_evidence_missing"));
      assertBoundaries(result);
    }
  },
  {
    name: "Missing source owner requires review",
    run() {
      const result = buildCandidateManagerSnapshot(baseInput({
        recruitmentEvents: [{ normalizedEventType: "CONTACT_CONNECTED", occurredAt: "2026-06-01T10:00:00.000Z" }],
        sourceEvidence: {
          evidenceRefs: ["evidence-1"],
          sourceEvidenceIds: ["source-1"],
          freshness: { status: "FRESH" }
        }
      }));
      assert.equal(result.snapshotStatus, CANDIDATE_MANAGER_SNAPSHOT_STATUSES.NEEDS_SOURCE_OWNER);
      assert.ok(result.missingEvidence.includes("candidate_manager_snapshot_source_owner_missing"));
      assertBoundaries(result);
    }
  },
  {
    name: "Missing freshness requires review",
    run() {
      const result = buildCandidateManagerSnapshot(baseInput({
        recruitmentEvents: [{ normalizedEventType: "CONTACT_CONNECTED", occurredAt: "2026-06-01T10:00:00.000Z" }],
        sourceEvidence: {
          evidenceRefs: ["evidence-1"],
          sourceEvidenceIds: ["source-1"],
          sourceOwners: ["MANAGER_OS"]
        }
      }));
      assert.equal(result.snapshotStatus, CANDIDATE_MANAGER_SNAPSHOT_STATUSES.NEEDS_FRESHNESS);
      assert.ok(result.staleSignals.includes("candidate_manager_snapshot_freshness_missing"));
      assertBoundaries(result);
    }
  },
  {
    name: "Stale freshness requires review",
    run() {
      const result = buildCandidateManagerSnapshot(baseInput({
        sourceEvidence: {
          evidenceRefs: ["evidence-1"],
          sourceEvidenceIds: ["source-1"],
          sourceOwners: ["MANAGER_OS"],
          freshness: { status: "STALE" }
        }
      }));
      assert.equal(result.snapshotStatus, CANDIDATE_MANAGER_SNAPSHOT_STATUSES.NEEDS_FRESHNESS);
      assert.ok(result.staleSignals.includes("candidate_manager_snapshot_freshness_stale"));
      assertBoundaries(result);
    }
  },
  {
    name: "READY_FOR_PRECONTRACT_REVIEW remains precontract review context only",
    run() {
      const result = buildCandidateManagerSnapshot(baseInput());
      assert.equal(result.precontractReadinessContext.readyForPrecontractReview, true);
      assert.equal(result.precontractReadinessContext.createsTruth, false);
      assert.equal(result.createsPrecontractTruth, false);
      assert.ok(result.warnings.some((warning) => warning.includes("does not create precontract truth")));
      assertBoundaries(result);
    }
  },
  {
    name: "Candidate assessment recommendation is decision support only",
    run() {
      const result = buildCandidateManagerSnapshot(baseInput({
        candidateAssessment: { recommendation: "REJECT" }
      }));
      assert.equal(result.candidateAssessmentContext.recommendation, "REJECT");
      assert.equal(result.createsAutomaticRejectionTruth, false);
      assert.ok(result.warnings.some((warning) => warning.includes("decision support only")));
      assertBoundaries(result);
    }
  },
  {
    name: "Withdrawn candidate creates review context only and not rejection truth",
    run() {
      const result = buildCandidateManagerSnapshot(baseInput({
        recruitmentEvents: [
          { normalizedEventType: "CANDIDATE_WITHDRAWN", occurredAt: "2026-06-01T10:00:00.000Z" }
        ]
      }));
      assert.equal(result.withdrawalRiskContext.active, true);
      assert.equal(result.createsAutomaticRejectionTruth, false);
      assertBoundaries(result);
    }
  },
  {
    name: "Blocked candidate creates review context only and not punishment truth",
    run() {
      const result = buildCandidateManagerSnapshot(baseInput({
        recruitmentEvents: [
          { normalizedEventType: "CANDIDATE_BLOCKED", occurredAt: "2026-06-01T10:00:00.000Z" }
        ]
      }));
      assert.equal(result.blockedContext.active, true);
      assert.equal(result.createsHumanRankingTruth, false);
      assert.ok(result.warnings.some((warning) => warning.includes("not punishment truth")));
      assertBoundaries(result);
    }
  },
  {
    name: "Reentry candidate creates review context only",
    run() {
      const result = buildCandidateManagerSnapshot(baseInput({
        recruitmentEvents: [
          { normalizedEventType: "CANDIDATE_REENTRY_REVIEW", occurredAt: "2026-06-01T10:00:00.000Z" }
        ]
      }));
      assert.equal(result.reentryContext.active, true);
      assert.equal(result.createsAutomaticApprovalTruth, false);
      assertBoundaries(result);
    }
  },
  {
    name: "Snapshot does not create Advisor Lifecycle truth",
    run() {
      const result = buildCandidateManagerSnapshot(baseInput({ requestedUse: "ADVISOR_LIFECYCLE_TRUTH" }));
      assert.ok(result.blockedUses.includes("ADVISOR_LIFECYCLE_TRUTH"));
      assert.equal(result.createsAdvisorLifecycleTruth, false);
      assertBoundaries(result);
    }
  },
  {
    name: "Snapshot does not create revenue, compensation or payout truth",
    run() {
      ["REVENUE_TRUTH", "COMPENSATION", "PAYOUT"].forEach((requestedUse) => {
        const result = buildCandidateManagerSnapshot(baseInput({ requestedUse }));
        assert.ok(result.blockedUses.includes(requestedUse));
        assert.equal(result.createsRevenue, false);
        assert.equal(result.createsCompensation, false);
        assert.equal(result.createsPayoutTruth, false);
        assertBoundaries(result);
      });
    }
  },
  {
    name: "All boundary truth flags remain false",
    run() {
      const result = buildCandidateManagerSnapshot(baseInput());
      assertBoundaries(result);
    }
  }
];

let pass = 0;

tests.forEach((test) => {
  try {
    test.run();
    pass += 1;
    console.log(`PASS ${test.name}`);
  } catch (error) {
    console.log(`FAIL ${test.name}`);
    console.log(error);
  }
});

console.log("\nResumen:");
console.log(`Total: ${tests.length}`);
console.log(`Pass: ${pass}`);
console.log(`Fail: ${tests.length - pass}`);

if (pass !== tests.length) {
  process.exitCode = 1;
}
