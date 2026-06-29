const assert = require("assert");

const {
  MANAGER_RECRUITMENT_EVENT_CAPTURE_STATUSES,
  MANAGER_RECRUITMENT_EVENT_TYPES,
  captureManagerRecruitmentEvent
} = require("../events/manager-recruitment-event-capture-contract");

console.log("\nFORGE MANAGER RECRUITMENT EVENT CAPTURE CONTRACT MASTER TEST v1.0\n");

const sourceEvidence = {
  evidenceRefs: ["event-evidence-1", "shared-ref"],
  sourceEvidenceIds: ["event-source-1", "shared-source"],
  sourceOwners: ["MANAGER_OS"],
  freshness: {
    status: "FRESH",
    capturedAt: "2026-06-29T12:00:00.000Z"
  }
};

function baseInput(overrides = {}) {
  return {
    eventType: "CONTACT_CONNECTED",
    candidateId: "CANDIDATE_001",
    recruitIdentityId: "RECRUIT_001",
    applicationId: "APPLICATION_001",
    managerId: "MANAGER_001",
    occurredAt: "2026-06-29T12:00:00.000Z",
    eventPayload: {
      note: "Connected",
      evidenceRefs: ["payload-evidence-1", "shared-ref"],
      sourceEvidenceIds: ["payload-source-1", "shared-source"],
      sourceOwners: ["MANAGER_OS"]
    },
    sourceEvidence,
    requestedUse: "MANAGER_REVIEW",
    ...overrides
  };
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
    name: "Known event types normalize correctly",
    run() {
      const result = captureManagerRecruitmentEvent(baseInput({ eventType: "initial_interview_completed" }));
      assert.equal(result.normalizedEventType, MANAGER_RECRUITMENT_EVENT_TYPES.INITIAL_INTERVIEW_COMPLETED);
      assert.equal(result.captureStatus, MANAGER_RECRUITMENT_EVENT_CAPTURE_STATUSES.CAPTURED_FOR_MANAGER_REVIEW);
      assertBoundaries(result);
    }
  },
  {
    name: "Unknown event types become not modeled and not zero",
    run() {
      const result = captureManagerRecruitmentEvent(baseInput({ eventType: "MAGIC_EVENT" }));
      assert.equal(result.normalizedEventType, MANAGER_RECRUITMENT_EVENT_TYPES.NOT_MODELED);
      assert.equal(result.captureStatus, MANAGER_RECRUITMENT_EVENT_CAPTURE_STATUSES.NOT_MODELED);
      assert.ok(result.unknownSignals.includes("manager_recruitment_event_type_not_modeled"));
      assertBoundaries(result);
    }
  },
  {
    name: "Missing evidence requires review",
    run() {
      const result = captureManagerRecruitmentEvent(baseInput({
        eventPayload: {},
        sourceEvidence: {
          sourceOwners: ["MANAGER_OS"],
          freshness: { status: "FRESH" }
        }
      }));
      assert.equal(result.captureStatus, MANAGER_RECRUITMENT_EVENT_CAPTURE_STATUSES.NEEDS_EVIDENCE);
      assert.equal(result.managerReviewRequired, true);
      assert.ok(result.missingEvidence.includes("manager_recruitment_event_evidence_missing"));
      assertBoundaries(result);
    }
  },
  {
    name: "Missing source owner requires review",
    run() {
      const result = captureManagerRecruitmentEvent(baseInput({
        eventPayload: {},
        sourceEvidence: {
          evidenceRefs: ["evidence-1"],
          sourceEvidenceIds: ["source-1"],
          freshness: { status: "FRESH" }
        }
      }));
      assert.equal(result.captureStatus, MANAGER_RECRUITMENT_EVENT_CAPTURE_STATUSES.NEEDS_SOURCE_OWNER);
      assert.equal(result.humanReviewRequired, true);
      assert.ok(result.missingEvidence.includes("manager_recruitment_event_source_owner_missing"));
      assertBoundaries(result);
    }
  },
  {
    name: "Missing freshness requires review",
    run() {
      const result = captureManagerRecruitmentEvent(baseInput({
        eventPayload: {},
        sourceEvidence: {
          evidenceRefs: ["evidence-1"],
          sourceEvidenceIds: ["source-1"],
          sourceOwners: ["MANAGER_OS"]
        }
      }));
      assert.equal(result.captureStatus, MANAGER_RECRUITMENT_EVENT_CAPTURE_STATUSES.NEEDS_FRESHNESS);
      assert.ok(result.staleSignals.includes("manager_recruitment_event_freshness_missing"));
      assertBoundaries(result);
    }
  },
  {
    name: "Stale freshness requires review",
    run() {
      const result = captureManagerRecruitmentEvent(baseInput({
        sourceEvidence: {
          evidenceRefs: ["evidence-1"],
          sourceEvidenceIds: ["source-1"],
          sourceOwners: ["MANAGER_OS"],
          freshness: { status: "STALE" }
        }
      }));
      assert.equal(result.captureStatus, MANAGER_RECRUITMENT_EVENT_CAPTURE_STATUSES.NEEDS_FRESHNESS);
      assert.ok(result.staleSignals.includes("manager_recruitment_event_freshness_stale"));
      assertBoundaries(result);
    }
  },
  {
    name: "Duplicate evidence and source refs are deduped",
    run() {
      const result = captureManagerRecruitmentEvent(baseInput());
      assert.equal(result.evidenceRefs.filter((ref) => ref === "shared-ref").length, 1);
      assert.equal(result.sourceEvidenceIds.filter((ref) => ref === "shared-source").length, 1);
      assert.equal(result.sourceOwners.filter((owner) => owner === "MANAGER_OS").length, 1);
      assertBoundaries(result);
    }
  },
  {
    name: "Allowed uses are allowed",
    run() {
      [
        "MANAGER_REVIEW",
        "RECRUITMENT_PIPELINE_CONTEXT",
        "CANDIDATE_TIMELINE_CONTEXT",
        "INTERVIEW_CONTEXT",
        "PRECONTRACT_REVIEW_CONTEXT",
        "CONVERSATION_CONTEXT",
        "METRICS_CONTEXT"
      ].forEach((requestedUse) => {
        const result = captureManagerRecruitmentEvent(baseInput({ requestedUse }));
        assert.ok(result.allowedUses.includes(requestedUse));
        assert.equal(result.blockedUses.length, 0);
        assertBoundaries(result);
      });
    }
  },
  {
    name: "Forbidden uses are blocked",
    run() {
      [
        "AUTOMATIC_APPROVAL",
        "AUTOMATIC_REJECTION",
        "PRECONTRACT_TRUTH",
        "ADVISOR_LIFECYCLE_TRUTH",
        "HUMAN_RANKING",
        "PROMOTION_DECISION",
        "PUNISHMENT",
        "TERMINATION",
        "COMPENSATION",
        "PAYOUT",
        "REVENUE_TRUTH"
      ].forEach((requestedUse) => {
        const result = captureManagerRecruitmentEvent(baseInput({ requestedUse }));
        assert.equal(result.captureStatus, MANAGER_RECRUITMENT_EVENT_CAPTURE_STATUSES.BLOCKED);
        assert.ok(result.blockedUses.includes(requestedUse));
        assertBoundaries(result);
      });
    }
  },
  {
    name: "READY_FOR_PRECONTRACT_REVIEW event does not create precontract truth",
    run() {
      const result = captureManagerRecruitmentEvent(baseInput({ eventType: "READY_FOR_PRECONTRACT_REVIEW" }));
      assert.equal(result.createsPrecontractTruth, false);
      assert.ok(result.warnings.some((warning) => warning.includes("does not create precontract truth")));
      assertBoundaries(result);
    }
  },
  {
    name: "CANDIDATE_REACTIVATED event is review context only",
    run() {
      const result = captureManagerRecruitmentEvent(baseInput({ eventType: "CANDIDATE_REACTIVATED" }));
      assert.equal(result.createsAutomaticApprovalTruth, false);
      assert.ok(result.warnings.some((warning) => warning.includes("review context only")));
      assertBoundaries(result);
    }
  },
  {
    name: "CANDIDATE_BLOCKED event does not create punishment truth",
    run() {
      const result = captureManagerRecruitmentEvent(baseInput({ eventType: "CANDIDATE_BLOCKED" }));
      assert.equal(result.createsHumanRankingTruth, false);
      assert.ok(result.warnings.some((warning) => warning.includes("does not create punishment truth")));
      assertBoundaries(result);
    }
  },
  {
    name: "All boundary truth flags remain false",
    run() {
      const result = captureManagerRecruitmentEvent(baseInput());
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
