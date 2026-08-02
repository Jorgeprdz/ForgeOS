"use strict";

const assert = require("assert");

const {
  ADVISOR_COMPENSATION_SCOPES,
  ADVISOR_COMPENSATION_TRUTH_STATES,
  ADVISOR_COMPENSATION_BOUNDARY_STATUSES,
  ADVISOR_COMPENSATION_USES,
  ADVISOR_COMPENSATION_FORBIDDEN_SHORTCUTS,
  evaluateAdvisorCompensationBoundary
} = require("../advisor-compensation-boundary-contract");

console.log("\nFORGE ADVISOR COMPENSATION STAGE 000 MASTER TEST v1.0\n");

function baseInput(overrides = {}) {
  return {
    requestedScope: ADVISOR_COMPENSATION_SCOPES.ADVISOR_COMPENSATION,
    requestedUse: ADVISOR_COMPENSATION_USES.CALCULATE_ESTIMATE,
    requestedTruthState: ADVISOR_COMPENSATION_TRUTH_STATES.ESTIMATED,
    evidence: {
      policyTruth: true,
      productTruth: true,
      ruleSnapshot: true,
      confirmedPaymentEvent: false,
      payoutEvidence: false,
      humanPayoutConfirmation: false,
      priorActiveCompensationEvent: false
    },
    assumptions: [],
    attemptedShortcuts: [],
    ...overrides
  };
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

const tests = [
  {
    name: "Only direct advisor compensation scope is authorized",
    run() {
      [
        ADVISOR_COMPENSATION_SCOPES.PARTNER_COMPENSATION,
        ADVISOR_COMPENSATION_SCOPES.MANAGER_COMPENSATION,
        ADVISOR_COMPENSATION_SCOPES.ADVISOR_DEVELOPMENT_COMPENSATION
      ].forEach((requestedScope) => {
        const result = evaluateAdvisorCompensationBoundary(baseInput({ requestedScope }));
        assert.equal(result.boundaryStatus, ADVISOR_COMPENSATION_BOUNDARY_STATUSES.BLOCKED);
        assert.ok(result.blockedReasons.includes(`scope_not_authorized:${requestedScope}`));
      });
    }
  },
  {
    name: "Unknown use is blocked rather than silently allowed",
    run() {
      const result = evaluateAdvisorCompensationBoundary(baseInput({
        requestedUse: "UNMODELED_USE"
      }));
      assert.equal(result.boundaryStatus, ADVISOR_COMPENSATION_BOUNDARY_STATUSES.BLOCKED);
      assert.ok(result.blockedReasons.includes("use_not_modeled:UNMODELED_USE"));
    }
  },
  {
    name: "Every constitutional shortcut is blocked",
    run() {
      ADVISOR_COMPENSATION_FORBIDDEN_SHORTCUTS.forEach((shortcut) => {
        const result = evaluateAdvisorCompensationBoundary(baseInput({
          attemptedShortcuts: [shortcut]
        }));
        assert.equal(result.boundaryStatus, ADVISOR_COMPENSATION_BOUNDARY_STATUSES.BLOCKED);
        assert.ok(result.blockedReasons.includes(`forbidden_shortcut:${shortcut}`));
      });
    }
  },
  {
    name: "Estimate is allowed with policy, product and rule snapshot",
    run() {
      const result = evaluateAdvisorCompensationBoundary(baseInput());
      assert.equal(result.boundaryStatus, ADVISOR_COMPENSATION_BOUNDARY_STATUSES.READY);
      assert.equal(result.permittedTruthState, ADVISOR_COMPENSATION_TRUTH_STATES.ESTIMATED);
      assert.equal(result.payoutPromotionAuthorized, false);
    }
  },
  {
    name: "Earned truth requires confirmed payment event",
    run() {
      const result = evaluateAdvisorCompensationBoundary(baseInput({
        requestedUse: ADVISOR_COMPENSATION_USES.PROMOTE_EARNED,
        requestedTruthState: ADVISOR_COMPENSATION_TRUTH_STATES.EARNED
      }));
      assert.equal(result.boundaryStatus, ADVISOR_COMPENSATION_BOUNDARY_STATUSES.BLOCKED);
      assert.ok(result.missingEvidence.includes("confirmed_payment_event"));
      assert.ok(result.blockedReasons.includes("earned_truth_requires_confirmed_payment_event"));
    }
  },
  {
    name: "Confirmed premium payment permits earned truth but not paid commission",
    run() {
      const result = evaluateAdvisorCompensationBoundary(baseInput({
        requestedUse: ADVISOR_COMPENSATION_USES.PROMOTE_EARNED,
        requestedTruthState: ADVISOR_COMPENSATION_TRUTH_STATES.EARNED,
        evidence: {
          ...baseInput().evidence,
          confirmedPaymentEvent: true
        }
      }));
      assert.equal(result.boundaryStatus, ADVISOR_COMPENSATION_BOUNDARY_STATUSES.READY);
      assert.equal(result.permittedTruthState, ADVISOR_COMPENSATION_TRUTH_STATES.EARNED);
      assert.equal(result.safeguards.paidPremiumIsNotPaidCommission, true);
      assert.equal(result.payoutPromotionAuthorized, false);
    }
  },
  {
    name: "Paid truth requires payout evidence",
    run() {
      const result = evaluateAdvisorCompensationBoundary(baseInput({
        requestedUse: ADVISOR_COMPENSATION_USES.PROMOTE_PAID,
        requestedTruthState: ADVISOR_COMPENSATION_TRUTH_STATES.PAID,
        evidence: {
          ...baseInput().evidence,
          confirmedPaymentEvent: true,
          humanPayoutConfirmation: true
        }
      }));
      assert.equal(result.boundaryStatus, ADVISOR_COMPENSATION_BOUNDARY_STATUSES.BLOCKED);
      assert.ok(result.missingEvidence.includes("compensation_payout_evidence"));
      assert.equal(result.payoutPromotionAuthorized, false);
    }
  },
  {
    name: "Paid truth requires human confirmation",
    run() {
      const result = evaluateAdvisorCompensationBoundary(baseInput({
        requestedUse: ADVISOR_COMPENSATION_USES.PROMOTE_PAID,
        requestedTruthState: null,
        evidence: {
          ...baseInput().evidence,
          confirmedPaymentEvent: true,
          payoutEvidence: true
        }
      }));
      assert.equal(
        result.boundaryStatus,
        ADVISOR_COMPENSATION_BOUNDARY_STATUSES.NEEDS_HUMAN_CONFIRMATION
      );
      assert.ok(result.missingEvidence.includes("human_payout_confirmation"));
      assert.equal(result.payoutPromotionAuthorized, false);
    }
  },
  {
    name: "Paid promotion becomes authorized only with complete evidence",
    run() {
      const result = evaluateAdvisorCompensationBoundary(baseInput({
        requestedUse: ADVISOR_COMPENSATION_USES.PROMOTE_PAID,
        requestedTruthState: ADVISOR_COMPENSATION_TRUTH_STATES.PAID,
        evidence: {
          ...baseInput().evidence,
          confirmedPaymentEvent: true,
          payoutEvidence: true,
          humanPayoutConfirmation: true
        }
      }));
      assert.equal(result.boundaryStatus, ADVISOR_COMPENSATION_BOUNDARY_STATUSES.READY);
      assert.equal(result.permittedTruthState, ADVISOR_COMPENSATION_TRUTH_STATES.PAID);
      assert.equal(result.payoutPromotionAuthorized, true);
    }
  },
  {
    name: "Simulation cannot create earned truth",
    run() {
      const result = evaluateAdvisorCompensationBoundary(baseInput({
        requestedUse: ADVISOR_COMPENSATION_USES.RUN_SIMULATION,
        requestedTruthState: ADVISOR_COMPENSATION_TRUTH_STATES.EARNED
      }));
      assert.equal(result.boundaryStatus, ADVISOR_COMPENSATION_BOUNDARY_STATUSES.BLOCKED);
      assert.ok(result.blockedReasons.includes("simulation_cannot_create_earned_or_paid_truth"));
    }
  },
  {
    name: "Adjustment requires a prior active compensation event",
    run() {
      const result = evaluateAdvisorCompensationBoundary(baseInput({
        requestedUse: ADVISOR_COMPENSATION_USES.APPLY_ADJUSTMENT,
        requestedTruthState: ADVISOR_COMPENSATION_TRUTH_STATES.ADJUSTED
      }));
      assert.equal(result.boundaryStatus, ADVISOR_COMPENSATION_BOUNDARY_STATUSES.NEEDS_EVIDENCE);
      assert.ok(result.missingEvidence.includes("prior_active_compensation_event"));
    }
  },
  {
    name: "Unknown and missing evidence are never converted to zero",
    run() {
      const result = evaluateAdvisorCompensationBoundary({
        requestedScope: ADVISOR_COMPENSATION_SCOPES.ADVISOR_COMPENSATION,
        requestedUse: ADVISOR_COMPENSATION_USES.CALCULATE_ESTIMATE,
        evidence: {}
      });
      assert.equal(result.boundaryStatus, ADVISOR_COMPENSATION_BOUNDARY_STATUSES.NEEDS_EVIDENCE);
      assert.equal(result.safeguards.unknownIsNotZero, true);
      assert.ok(result.missingEvidence.includes("policy_truth"));
      assert.ok(result.missingEvidence.includes("product_truth"));
      assert.ok(result.missingEvidence.includes("compensation_rule_snapshot"));
    }
  },
  {
    name: "Input is never mutated",
    run() {
      const input = baseInput();
      const original = clone(input);
      evaluateAdvisorCompensationBoundary(input);
      assert.deepEqual(input, original);
    }
  },
  {
    name: "Boundary evaluation never authorizes direct mutation",
    run() {
      const result = evaluateAdvisorCompensationBoundary(baseInput());
      assert.equal(result.mutationAuthorized, false);
    }
  }
];

let passed = 0;
let failed = 0;

tests.forEach((testCase) => {
  try {
    testCase.run();
    passed += 1;
    console.log(`PASS ${testCase.name}`);
  } catch (error) {
    failed += 1;
    console.error(`FAIL ${testCase.name}`);
    console.error(error);
  }
});

console.log("\nResumen:");
console.log(`Total: ${tests.length}`);
console.log(`PASS: ${passed}`);
console.log(`FAIL: ${failed}`);

if (failed > 0) {
  process.exitCode = 1;
}
