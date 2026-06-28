const assert = require("assert");

const {
  RECRUITMENT_PIPELINE_STATES,
  evaluateRecruitmentPipeline,
  normalizeRecruitmentPipelineState
} = require("../pipeline/recruitment-pipeline-engine");

console.log("\nFORGE RECRUITMENT PIPELINE ENGINE MASTER TEST v1.0\n");

const recruit = {
  recruitIdentityId: "RECRUIT_IDENTITY_001",
  identityStatus: "ACTIVE"
};

const candidate = {
  candidateId: "CANDIDATE_001",
  status: "SCREENING"
};

const application = {
  applicationId: "APPLICATION_001",
  applicationStatus: "SCREENING",
  eventHistory: [
    {
      eventType: "APPLICATION_CREATED",
      occurredAt: "2026-06-01T09:00:00.000Z"
    }
  ]
};

const candidateAssessment = {
  recommendation: "ADVANCE",
  confidence: 85,
  provenance: {
    evidenceRefs: ["assessment-evidence-1"],
    sourceEvidenceIds: ["assessment-source-1"],
    confidenceLimitations: [],
    warnings: [],
    humanReviewRequired: false
  }
};

const interviewFlow = {
  stageStatus: "READY",
  nextRecommendedStage: "SELECTION_INTERVIEW",
  allowedTransitions: ["SELECTION_INTERVIEW"],
  blockedTransitions: [],
  evidenceRefs: ["interview-flow-evidence-1"],
  sourceEvidenceIds: ["interview-flow-source-1"],
  warnings: [],
  confidenceLimitations: [],
  humanReviewRequired: false
};

const interviewEvidence = {
  interviewEvidenceId: "INTERVIEW_EVIDENCE_001"
};

function assertBoundaries(result) {
  assert.equal(result.automaticDecisionAllowed, false);
  assert.equal(result.createsRecruitmentTruth, false);
  assert.equal(result.createsPrecontractTruth, false);
  assert.equal(result.createsAdvisorLifecycleTruth, false);
  assert.equal(result.createsRevenue, false);
  assert.equal(result.createsCompensation, false);
  assert.equal(result.createsPayoutTruth, false);
}

const tests = [
  {
    name: "Prospect recommends candidate/application start without domain truth",
    run() {
      const result = evaluateRecruitmentPipeline({
        recruit,
        currentPipelineState: "PROSPECT"
      });

      assert.equal(result.normalizedPipelineState, RECRUITMENT_PIPELINE_STATES.PROSPECT);
      assert.ok([
        RECRUITMENT_PIPELINE_STATES.CANDIDATE,
        RECRUITMENT_PIPELINE_STATES.APPLICATION_STARTED
      ].includes(result.nextRecommendedState));
      assert.equal(result.automaticDecisionAllowed, false);
      assertBoundaries(result);
    }
  },
  {
    name: "Application submitted with interview flow recommends interview progression and preserves evidence",
    run() {
      const result = evaluateRecruitmentPipeline({
        recruit,
        candidate,
        application,
        candidateAssessment,
        interviewFlow,
        interviewEvidence
      });

      assert.ok([
        RECRUITMENT_PIPELINE_STATES.INTERVIEWING,
        RECRUITMENT_PIPELINE_STATES.INTERVIEW_FLOW_ACTIVE
      ].includes(result.nextRecommendedState));
      assert.ok(result.evidenceRefs.includes("interview-flow-evidence-1"));
      assert.ok(result.evidenceRefs.includes("INTERVIEW_EVIDENCE_001"));
      assertBoundaries(result);
    }
  },
  {
    name: "Candidate Assessment ADVANCE does not auto-approve",
    run() {
      const result = evaluateRecruitmentPipeline({
        recruit,
        candidate,
        application,
        candidateAssessment,
        interviewFlow,
        interviewEvidence
      });

      assert.equal(result.automaticDecisionAllowed, false);
      assert.ok(result.nextRecommendedState);
      assertBoundaries(result);
    }
  },
  {
    name: "WATCH and COACH require human review",
    run() {
      ["WATCH", "COACH"].forEach(recommendation => {
        const result = evaluateRecruitmentPipeline({
          recruit,
          candidate,
          application,
          candidateAssessment: {
            ...candidateAssessment,
            recommendation
          },
          interviewFlow,
          interviewEvidence
        });

        assert.equal(result.pipelineStatus, "NEEDS_HUMAN_REVIEW");
        assert.equal(result.humanReviewRequired, true);
        assertBoundaries(result);
      });
    }
  },
  {
    name: "REJECT recommendation is decision support only",
    run() {
      const result = evaluateRecruitmentPipeline({
        recruit,
        candidate,
        application,
        candidateAssessment: {
          ...candidateAssessment,
          recommendation: "REJECT"
        },
        interviewFlow,
        interviewEvidence
      });

      assert.equal(result.nextRecommendedState, RECRUITMENT_PIPELINE_STATES.REJECTED_BY_DECISION_SUPPORT_ONLY);
      assert.equal(result.automaticDecisionAllowed, false);
      assert.equal(result.humanReviewRequired, true);
      assert.ok(result.warnings.some(warning => warning.includes("not automatic rejection")));
      assertBoundaries(result);
    }
  },
  {
    name: "Interview Flow blocked holds pipeline",
    run() {
      const result = evaluateRecruitmentPipeline({
        recruit,
        candidate,
        application,
        candidateAssessment,
        interviewFlow: {
          ...interviewFlow,
          stageStatus: "BLOCKED",
          blockedTransitions: ["CAREER_INTERVIEW"],
          humanReviewRequired: true
        },
        interviewEvidence
      });

      assert.ok(["BLOCKED", "NEEDS_HUMAN_REVIEW"].includes(result.pipelineStatus));
      assert.ok(result.blockedTransitions.includes("CAREER_INTERVIEW"));
      assert.equal(result.humanReviewRequired, true);
      assertBoundaries(result);
    }
  },
  {
    name: "Ready for precontract review is boundary only",
    run() {
      const result = evaluateRecruitmentPipeline({
        recruit,
        candidate: {
          ...candidate,
          status: "PRECONTRACT"
        },
        application: {
          ...application,
          applicationStatus: "SELECTED"
        },
        candidateAssessment,
        interviewFlow: {
          ...interviewFlow,
          stageStatus: "COMPLETED"
        },
        interviewEvidence
      });

      assert.equal(result.readyForPrecontractReview, true);
      assert.equal(result.createsPrecontractTruth, false);
      assert.equal(result.createsAdvisorLifecycleTruth, false);
      assert.equal(result.createsRevenue, false);
      assert.equal(result.createsCompensation, false);
      assert.equal(result.createsPayoutTruth, false);
      assert.ok(result.warnings.some(warning => warning.includes("decision support only")));
      assertBoundaries(result);
    }
  },
  {
    name: "Requested PRECONTRACT transition is blocked",
    run() {
      const result = evaluateRecruitmentPipeline({
        recruit,
        candidate,
        application,
        requestedTransition: "PRECONTRACT",
        candidateAssessment,
        interviewFlow,
        interviewEvidence
      });

      assert.ok(result.blockedTransitions.includes("PRECONTRACT"));
      assert.equal(result.createsPrecontractTruth, false);
      assert.equal(result.automaticDecisionAllowed, false);
      assertBoundaries(result);
    }
  },
  {
    name: "Skipped transition blocked without manager override",
    run() {
      const result = evaluateRecruitmentPipeline({
        recruit,
        currentPipelineState: "PROSPECT",
        requestedTransition: "INTERVIEWING"
      });

      assert.ok(result.blockedTransitions.includes(RECRUITMENT_PIPELINE_STATES.INTERVIEWING));
      assert.equal(result.humanReviewRequired, true);
      assertBoundaries(result);
    }
  },
  {
    name: "Manager override allows skipped transition but still requires review",
    run() {
      const result = evaluateRecruitmentPipeline({
        recruit,
        currentPipelineState: "PROSPECT",
        requestedTransition: "INTERVIEWING",
        managerReview: {
          override: true,
          managerId: "MANAGER_001"
        }
      });

      assert.ok(result.allowedTransitions.includes(RECRUITMENT_PIPELINE_STATES.INTERVIEWING));
      assert.equal(result.humanReviewRequired, true);
      assert.ok(result.warnings.some(warning => warning.includes("Manager override")));
      assertBoundaries(result);
    }
  },
  {
    name: "Unknown state is blocked",
    run() {
      const result = evaluateRecruitmentPipeline({
        currentPipelineState: "UNKNOWN_STATE",
        requestedTransition: "INTERVIEWING"
      });

      assert.ok(["UNKNOWN", "NOT_MODELED"].includes(result.pipelineStatus));
      assert.equal(result.humanReviewRequired, true);
      assert.equal(result.automaticDecisionAllowed, false);
      assertBoundaries(result);
    }
  },
  {
    name: "Reentry requires human review",
    run() {
      const result = evaluateRecruitmentPipeline({
        recruit,
        candidate,
        application: {
          ...application,
          eventHistory: [
            {
              eventType: "RE_ENTRY_REQUESTED",
              occurredAt: "2026-06-01T09:00:00.000Z"
            }
          ]
        },
        candidateAssessment,
        interviewFlow,
        interviewEvidence
      });

      assert.equal(result.humanReviewRequired, true);
      assert.ok([
        RECRUITMENT_PIPELINE_STATES.MANAGER_REVIEW,
        RECRUITMENT_PIPELINE_STATES.REENTRY_REVIEW
      ].includes(result.nextRecommendedState));
      assertBoundaries(result);
    }
  },
  {
    name: "Evidence refs merge without duplicates",
    run() {
      const result = evaluateRecruitmentPipeline({
        recruit,
        candidate,
        application,
        provenance: {
          evidenceRefs: ["external-evidence-1"],
          sourceEvidenceIds: ["external-source-1"]
        },
        candidateAssessment,
        interviewFlow,
        interviewEvidence: [
          interviewEvidence,
          { interviewEvidenceId: "INTERVIEW_EVIDENCE_001" }
        ]
      });

      assert.ok(result.evidenceRefs.includes("RECRUIT_IDENTITY_001"));
      assert.ok(result.evidenceRefs.includes("CANDIDATE_001"));
      assert.ok(result.evidenceRefs.includes("APPLICATION_001"));
      assert.ok(result.evidenceRefs.includes("assessment-evidence-1"));
      assert.ok(result.evidenceRefs.includes("interview-flow-evidence-1"));
      assert.ok(result.evidenceRefs.includes("external-evidence-1"));
      assert.equal(result.evidenceRefs.filter(value => value === "INTERVIEW_EVIDENCE_001").length, 1);
      assert.ok(result.sourceEvidenceIds.includes("assessment-source-1"));
      assert.ok(result.sourceEvidenceIds.includes("interview-flow-source-1"));
      assert.ok(result.sourceEvidenceIds.includes("external-source-1"));
      assertBoundaries(result);
    }
  },
  {
    name: "normalizeRecruitmentPipelineState supports canonical states",
    run() {
      assert.equal(
        normalizeRecruitmentPipelineState("application_submitted"),
        RECRUITMENT_PIPELINE_STATES.APPLICATION_SUBMITTED
      );
    }
  }
];

let pass = 0;

tests.forEach(test => {
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
  console.log("\nRECRUITMENT PIPELINE ENGINE MASTER TEST NEEDS REVIEW");
  process.exit(1);
}

console.log("\nRECRUITMENT PIPELINE ENGINE MASTER TEST PASS");
