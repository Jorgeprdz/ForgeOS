const assert = require("assert");

const {
  CONSUMER_CONTRACT_STATUSES,
  CONSUMER_MODES,
  mapManagerRdaAttributionForConsumer
} = require("../rda-attribution/manager-rda-consumer-contract");

const {
  evaluateManagerRdaAttributionTruth
} = require("../rda-attribution/manager-rda-attribution-truth-engine");

console.log("\nFORGE MANAGER RDA CONSUMER CONTRACT MASTER TEST v1.0\n");

const confirmedTruth = evaluateManagerRdaAttributionTruth({
  rdaAttribution: {
    status: "CONFIRMED",
    proposedRdaOwner: "MANAGER_001",
    confirmedRdaOwner: "MANAGER_001",
    evidenceConfirmed: true,
    evidenceRefs: ["rda-attribution-evidence-1"],
    sourceEvidenceIds: ["rda-attribution-source-1"]
  },
  rdaEvidence: {
    rdaId: "RDA_EVIDENCE_001",
    candidateId: "CANDIDATE_001",
    sourceAdvisor: "MANAGER_001",
    evidenceRefs: ["rda-evidence-ref-1"],
    sourceEvidenceIds: ["rda-source-1"]
  },
  managerReview: {
    reviewed: true,
    independentReview: true,
    evidenceRefs: ["manager-review-evidence-1"],
    sourceEvidenceIds: ["manager-review-source-1"]
  },
  candidate: { candidateId: "CANDIDATE_001" },
  application: { applicationId: "APPLICATION_001" },
  recruit: { recruitIdentityId: "RECRUIT_001" }
});

function assertBoundaries(result) {
  assert.equal(result.automaticDecisionAllowed, false);
  assert.equal(result.createsCompensationOwnershipTruth, false);
  assert.equal(result.createsPrecontractTruth, false);
  assert.equal(result.createsAdvisorLifecycleTruth, false);
  assert.equal(result.createsRevenue, false);
  assert.equal(result.createsCompensation, false);
  assert.equal(result.createsPayoutTruth, false);
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

const tests = [
  {
    name: "Confirmed Manager OS truth maps to reference-only contract",
    run() {
      const result = mapManagerRdaAttributionForConsumer({
        attributionTruth: confirmedTruth,
        consumerMode: "COMPENSATION_REFERENCE"
      });

      assert.equal(result.contractStatus, CONSUMER_CONTRACT_STATUSES.READY_FOR_REFERENCE);
      assert.equal(result.consumerMode, CONSUMER_MODES.COMPENSATION_REFERENCE);
      assert.equal(result.referenceOnly.attributionTruthReady, true);
      assert.equal(result.referenceOnly.confirmedRdaOwner, "MANAGER_001");
      assert.ok(result.allowedTransitions.includes("CONSUME_MANAGER_RDA_ATTRIBUTION_REFERENCE"));
      assertBoundaries(result);
    }
  },
  {
    name: "Missing attribution truth remains missing and review required",
    run() {
      const result = mapManagerRdaAttributionForConsumer({});

      assert.equal(result.contractStatus, CONSUMER_CONTRACT_STATUSES.MISSING);
      assert.ok(result.missingEvidence.includes("manager_rda_attribution_truth_required"));
      assert.equal(result.humanReviewRequired, true);
      assertBoundaries(result);
    }
  },
  {
    name: "Proposed attribution is not ready for downstream truth",
    run() {
      const proposed = evaluateManagerRdaAttributionTruth({
        rdaAttribution: {
          status: "PROPOSED",
          proposedRdaOwner: "MANAGER_001"
        },
        candidate: { candidateId: "CANDIDATE_001" }
      });

      const result = mapManagerRdaAttributionForConsumer({
        attributionTruth: proposed,
        consumerMode: "ADVISOR_LIFECYCLE_REFERENCE"
      });

      assert.equal(result.contractStatus, CONSUMER_CONTRACT_STATUSES.NEEDS_REVIEW);
      assert.equal(result.referenceOnly.confirmedRdaOwner, null);
      assert.equal(result.humanReviewRequired, true);
      assertBoundaries(result);
    }
  },
  {
    name: "Compensation consumer receives no compensation ownership or payout truth",
    run() {
      const result = mapManagerRdaAttributionForConsumer({
        attributionTruth: confirmedTruth,
        consumerMode: "COMPENSATION"
      });

      assert.equal(result.consumerMode, CONSUMER_MODES.COMPENSATION_REFERENCE);
      assert.equal(result.createsCompensationOwnershipTruth, false);
      assert.equal(result.createsCompensation, false);
      assert.equal(result.createsPayoutTruth, false);
      assert.ok(result.warnings.some((warning) => warning.includes("not compensation ownership truth")));
      assertBoundaries(result);
    }
  },
  {
    name: "Recruitment consumer receives reference only",
    run() {
      const result = mapManagerRdaAttributionForConsumer({
        attributionTruth: confirmedTruth,
        consumerMode: "RECRUITMENT"
      });

      assert.equal(result.consumerMode, CONSUMER_MODES.RECRUITMENT_REFERENCE);
      assert.equal(result.createsPrecontractTruth, false);
      assert.equal(result.automaticDecisionAllowed, false);
      assertBoundaries(result);
    }
  },
  {
    name: "Advisor Lifecycle consumer does not create lifecycle truth",
    run() {
      const result = mapManagerRdaAttributionForConsumer({
        attributionTruth: confirmedTruth,
        consumerMode: "ADVISOR_LIFECYCLE"
      });

      assert.equal(result.consumerMode, CONSUMER_MODES.ADVISOR_LIFECYCLE_REFERENCE);
      assert.equal(result.createsAdvisorLifecycleTruth, false);
      assertBoundaries(result);
    }
  },
  {
    name: "Revenue consumer does not create revenue",
    run() {
      const result = mapManagerRdaAttributionForConsumer({
        attributionTruth: confirmedTruth,
        consumerMode: "REVENUE"
      });

      assert.equal(result.consumerMode, CONSUMER_MODES.REVENUE_REFERENCE);
      assert.equal(result.createsRevenue, false);
      assertBoundaries(result);
    }
  },
  {
    name: "Forbidden downstream transitions are blocked",
    run() {
      [
        "COMPENSATION_OWNERSHIP_TRUTH",
        "PRECONTRACT_TRUTH",
        "ADVISOR_LIFECYCLE_TRUTH",
        "REVENUE",
        "COMPENSATION",
        "PAYOUT",
        "PAYMENT",
        "AUTOMATIC_APPROVAL",
        "AUTOMATIC_REJECTION"
      ].forEach((requestedTransition) => {
        const result = mapManagerRdaAttributionForConsumer({
          attributionTruth: confirmedTruth,
          requestedTransition
        });

        assert.ok(result.blockedTransitions.includes(requestedTransition));
        assert.equal(result.humanReviewRequired, true);
        assertBoundaries(result);
      });
    }
  },
  {
    name: "Blocked and unknown statuses do not collapse to zero",
    run() {
      ["BLOCKED", "UNKNOWN", "NOT_MODELED"].forEach((status) => {
        const result = mapManagerRdaAttributionForConsumer({
          attributionTruth: {
            attributionStatus: status,
            attributionTruthReady: false
          }
        });

        assert.equal(result.contractStatus, status);
        assert.equal(Object.prototype.hasOwnProperty.call(result, "candidateAmount"), false);
        assert.equal(Object.prototype.hasOwnProperty.call(result, "amount"), false);
        assertBoundaries(result);
      });
    }
  },
  {
    name: "Evidence refs merge without duplicates",
    run() {
      const result = mapManagerRdaAttributionForConsumer({
        attributionTruth: {
          ...confirmedTruth,
          evidenceRefs: ["same-ref", "truth-ref"],
          sourceEvidenceIds: ["same-source", "truth-source"]
        },
        consumerContext: {
          evidenceRefs: ["same-ref", "consumer-ref"],
          sourceEvidenceIds: ["same-source", "consumer-source"]
        }
      });

      assert.deepEqual(result.evidenceRefs.sort(), ["consumer-ref", "same-ref", "truth-ref"].sort());
      assert.deepEqual(result.sourceEvidenceIds.sort(), ["consumer-source", "same-source", "truth-source"].sort());
      assertBoundaries(result);
    }
  },
  {
    name: "Inputs are not mutated",
    run() {
      const input = {
        attributionTruth: confirmedTruth,
        consumerMode: "COMPENSATION_REFERENCE",
        consumerContext: {
          evidenceRefs: ["context-ref"]
        }
      };
      const before = clone(input);

      mapManagerRdaAttributionForConsumer(input);

      assert.deepEqual(input, before);
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
  console.log("\nMANAGER RDA CONSUMER CONTRACT MASTER TEST NEEDS REVIEW");
  process.exit(1);
}

console.log("\nMANAGER RDA CONSUMER CONTRACT MASTER TEST PASS");
