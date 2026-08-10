import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";

import {
  PERIOD_SNAPSHOT_CONTRACT,
  projectExpectedRenewals,
  projectGenerated,
} from "../docs/static-preview/forge-aura/income/income-core.mjs";

const require = createRequire(import.meta.url);
const crs11 = require("../platform/shared-commercial-model/crs-11-end-to-end-acceptance-contract.js");
const compensation = require("../compensation/advisor/advisor-compensation-boundary-contract.js");

const {
  ADVISOR_COMPENSATION_BOUNDARY_STATUSES,
  ADVISOR_COMPENSATION_TRUTH_STATES,
  ADVISOR_COMPENSATION_USES,
  evaluateAdvisorCompensationBoundary,
} = compensation;

function clone(value) {
  return structuredClone(value);
}

function completeCompensationEvidence(overrides = {}) {
  return {
    policyTruth: true,
    productTruth: true,
    ruleSnapshot: true,
    confirmedPaymentEvent: true,
    payoutEvidence: false,
    humanPayoutConfirmation: false,
    ...overrides,
  };
}

function expectedRenewalSnapshot() {
  return {
    periodKey: "2026-08",
    sourceHealth: { forwardSignals: "AVAILABLE" },
    details: {
      metadata: { forwardSignalCoverage: { expectedRenewals: true } },
      forwardSignals: [
        {
          signalId: "signal:renewal:policy-001:2026-08",
          state: "ACTIVE",
          kind: "POTENTIAL",
          periodKey: "2026-08",
          amount: { value: 4200, currency: "MXN" },
          source: {
            authority: "ADVISOR_COMPENSATION_FORWARD_SIGNAL",
            reference: "policy:vida:001",
            snapshotReference: "rule-snapshot:renewal:001",
          },
          signalDigest: "a".repeat(64),
          reason: "Renewal payment is expected in the period; no payment or earned event exists yet.",
          metadata: {
            scenarioType: "EXPECTED_RENEWAL",
            policyReference: "policy:vida:001",
            policyYear: 2,
            expectedPaymentPeriod: "2026-08",
            ruleSnapshotReference: "rule-snapshot:renewal:001",
          },
          safeguards: {
            incomeTruth: false,
            earnedTruth: false,
            paidTruth: false,
            includedInRealIncome: false,
            probabilityWeightingApplied: false,
          },
        },
      ],
    },
  };
}

function generatedRenewalSnapshot() {
  return {
    contractVersion: PERIOD_SNAPSHOT_CONTRACT,
    periodKey: "2026-08",
    status: "READY",
    sourceHealth: { compensationEvents: "AVAILABLE" },
    counts: { earnedAggregates: 2 },
    amounts: {
      earned: {
        net: 7200,
        gross: 7200,
        adjustments: 0,
        reversals: 0,
      },
    },
    details: {
      aggregates: [
        {
          earnedEventId: "comp:event:initial:001",
          concept: "LIFE_INITIAL",
          earnedNetAmount: 3000,
        },
        {
          earnedEventId: "comp:event:renewal:001",
          concept: "LIFE_RENEWAL",
          earnedNetAmount: 4200,
        },
      ],
    },
  };
}

test("A — happy path reuses the accepted CRS-11 commercial spine without mutation", () => {
  const acceptance = crs11.validateJourneyEvidence(
    crs11.createAcceptancePlan(),
    crs11.createJuanPerezEvidence(),
  );

  assert.equal(acceptance.status, "PASS");
  assert.equal(acceptance.counts.canonicalPeople, 1);
  assert.equal(acceptance.counts.activities >= 3, true);
  assert.equal(acceptance.counts.quotes >= 2, true);
  assert.equal(acceptance.counts.policies >= 2, true);
  assert.equal(acceptance.checks.moduleAuthoritiesPreserved, true);
  assert.equal(acceptance.checks.humanDecisionPreserved, true);
  assert.equal(acceptance.readOnly, true);
  assert.equal(crs11.CRS_11_BOUNDARIES.canonicalMutation, false);
  assert.equal(crs11.CRS_11_BOUNDARIES.automaticBusinessAction, false);
});

test("B — unresolved Prospect is preserved and automatic identity merge remains forbidden", async () => {
  const source = await readFile(
    new URL("../docs/architecture/source-truth/FORGE_CRS_03_PIPELINE_PERSON_CONVERGENCE_001.md", import.meta.url),
    "utf8",
  );

  assert.match(source, /IDENTITY_STATES=LINKED_UNRESOLVED/);
  assert.match(source, /NEW_PROSPECT_INITIAL_CONVERGENCE=PERSON_UNRESOLVED/);
  assert.match(source, /COMMERCIAL_PERSON_CREATED_AUTOMATICALLY=NO/);
  assert.match(source, /IDENTITY_RESOLVED_AUTOMATICALLY=NO/);
  assert.match(source, /AUTOMATIC_IDENTITY_MERGE=FORBIDDEN/);
});

test("C — Quote and accepted commercial intent cannot manufacture Policy truth", () => {
  const evidence = crs11.createJuanPerezEvidence();
  const openQuote = evidence.quotes.find(item => item.applicationReference === null);
  assert.ok(openQuote, "fixture must retain a Quote with no Application/Policy consequence");

  assert.equal(evidence.applications[0].policyReference, null);
  assert.equal(evidence.boundaries.automaticApplicationCreation, false);
  assert.equal(evidence.boundaries.automaticPolicyCreation, false);

  const collapsed = clone(evidence);
  collapsed.applications[0].policyReference = "policy:invented-by-quote";
  assert.throws(
    () => crs11.validateJourneyEvidence(crs11.createAcceptancePlan(), collapsed),
    error => error.code === "CRS11_APPLICATION_POLICY_COLLAPSE",
  );
});

test("D — Policy without confirmed payment cannot become earned or paid commission", () => {
  const earned = evaluateAdvisorCompensationBoundary({
    requestedUse: ADVISOR_COMPENSATION_USES.PROMOTE_EARNED,
    requestedTruthState: ADVISOR_COMPENSATION_TRUTH_STATES.EARNED,
    evidence: completeCompensationEvidence({ confirmedPaymentEvent: false }),
  });

  assert.equal(earned.boundaryStatus, ADVISOR_COMPENSATION_BOUNDARY_STATUSES.BLOCKED);
  assert.equal(earned.missingEvidence.includes("confirmed_payment_event"), true);
  assert.equal(earned.permittedTruthState, ADVISOR_COMPENSATION_TRUTH_STATES.BLOCKED);
  assert.equal(earned.mutationAuthorized, false);
  assert.equal(earned.safeguards.paidPremiumIsNotPaidCommission, true);
});

test("E — confirmed premium payment may enable EARNED interpretation but never advisor payout by itself", () => {
  const earned = evaluateAdvisorCompensationBoundary({
    requestedUse: ADVISOR_COMPENSATION_USES.PROMOTE_EARNED,
    requestedTruthState: ADVISOR_COMPENSATION_TRUTH_STATES.EARNED,
    evidence: completeCompensationEvidence(),
  });

  assert.equal(earned.boundaryStatus, ADVISOR_COMPENSATION_BOUNDARY_STATUSES.READY);
  assert.equal(earned.permittedTruthState, ADVISOR_COMPENSATION_TRUTH_STATES.EARNED);
  assert.equal(earned.payoutPromotionAuthorized, false);
  assert.equal(earned.mutationAuthorized, false);

  const paidWithoutPayout = evaluateAdvisorCompensationBoundary({
    requestedUse: ADVISOR_COMPENSATION_USES.PROMOTE_PAID,
    requestedTruthState: ADVISOR_COMPENSATION_TRUTH_STATES.PAID,
    evidence: completeCompensationEvidence(),
  });

  assert.notEqual(paidWithoutPayout.boundaryStatus, ADVISOR_COMPENSATION_BOUNDARY_STATUSES.READY);
  assert.equal(paidWithoutPayout.payoutPromotionAuthorized, false);
  assert.equal(paidWithoutPayout.missingEvidence.includes("compensation_payout_evidence"), true);
  assert.equal(paidWithoutPayout.missingEvidence.includes("human_payout_confirmation"), true);
});

test("E2 — PAID classification requires both payout evidence and human confirmation", () => {
  const paid = evaluateAdvisorCompensationBoundary({
    requestedUse: ADVISOR_COMPENSATION_USES.PROMOTE_PAID,
    requestedTruthState: ADVISOR_COMPENSATION_TRUTH_STATES.PAID,
    evidence: completeCompensationEvidence({
      payoutEvidence: true,
      humanPayoutConfirmation: true,
    }),
  });

  assert.equal(paid.boundaryStatus, ADVISOR_COMPENSATION_BOUNDARY_STATUSES.READY);
  assert.equal(paid.permittedTruthState, ADVISOR_COMPENSATION_TRUTH_STATES.PAID);
  assert.equal(paid.payoutPromotionAuthorized, true);
  assert.equal(paid.mutationAuthorized, false, "boundary evaluation itself remains read-only");
});

test("F — expected renewal remains EXPECTED until canonical earned evidence generates renewal commission", () => {
  const expected = projectExpectedRenewals(expectedRenewalSnapshot());
  assert.equal(expected.state, "EXPECTED");
  assert.equal(expected.value, 4200);
  assert.equal(expected.items[0].state, "EXPECTED");
  assert.equal(expected.items[0].policyReference, "policy:vida:001");

  const generated = projectGenerated(generatedRenewalSnapshot());
  assert.equal(generated.state, "GENERATED");
  assert.equal(generated.initial, 3000);
  assert.equal(generated.renewal, 4200);
  assert.equal(generated.value, 7200);
  assert.equal(generated.evidenceState, "EARNED");
});

test("F2 — unknown renewal or generated evidence is null, never invented zero", () => {
  const expected = projectExpectedRenewals(null);
  const generated = projectGenerated(null);
  assert.equal(expected.state, "UNKNOWN");
  assert.equal(expected.value, null);
  assert.equal(generated.state, "UNKNOWN");
  assert.equal(generated.value, null);
  assert.equal(generated.renewal, null);
});

test("G — recommendation/intelligence cannot execute a human commercial decision", () => {
  const evidence = clone(crs11.createJuanPerezEvidence());
  assert.equal(evidence.intelligence.humanDecisionRequired, true);
  assert.equal(evidence.intelligence.automaticBusinessAction, false);

  evidence.intelligence.automaticBusinessAction = true;
  assert.throws(
    () => crs11.validateJourneyEvidence(crs11.createAcceptancePlan(), evidence),
    error => error.code === "CRS11_INTELLIGENCE_BOUNDARY_VIOLATION",
  );
});

test("H — tenant/cross-advisor isolation fails closed", () => {
  const evidence = clone(crs11.createJuanPerezEvidence());
  evidence.security.crossAdvisorReadBlocked = false;
  assert.throws(
    () => crs11.validateJourneyEvidence(crs11.createAcceptancePlan(), evidence),
    error => error.code === "CRS11_SECURITY_ACCEPTANCE_FAILED",
  );

  const anotherAdvisor = clone(crs11.createJuanPerezEvidence());
  anotherAdvisor.advisorReference = "advisor:other";
  assert.throws(
    () => crs11.validateJourneyEvidence(crs11.createAcceptancePlan(), anotherAdvisor),
    error => error.code === "CRS11_ADVISOR_MISMATCH",
  );
});

test("009 acceptance creates no new business authority or autonomous effect", () => {
  assert.deepEqual(crs11.CRS_11_BOUNDARIES, {
    readOnlyAcceptance: true,
    canonicalMutation: false,
    schemaMutation: false,
    supabaseMutation: false,
    productUiMutation: false,
    automaticBusinessAction: false,
    automaticProgramPromotion: false,
    secondTruthStore: false,
  });
});
