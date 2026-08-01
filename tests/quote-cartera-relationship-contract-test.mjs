import assert from "node:assert/strict";
import test from "node:test";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const contract = require(
  "../platform/shared-commercial-model/accepted-quote-cartera-relationship-contract.js",
);

function baseInput({
  productReference = "product:vida-mujer",
  lifecycleState = "PROSPECT_ACCEPTED",
  identityOutcome = "LINK_CONFIRMED",
  policyEvidenceState = "ABSENT",
} = {}) {
  const confirmedIdentity = identityOutcome !== "UNRESOLVED";
  const reviewedEvidence = ["REVIEWED", "DISPUTED"].includes(policyEvidenceState);
  return {
    advisorId: "advisor:jorge",
    actorReference: "advisor:jorge",
    createdAt: "2026-08-01T19:15:00.000Z",
    quote: {
      durable: true,
      quoteReference: "quote:alejandra:001",
      quoteVersionReference: "quote-version:alejandra:001:01",
      prospectReference: "prospect:alejandra",
      productReference,
      lifecycleState,
      snapshotDigest: "a1b2c3d4e5f6",
      eventReferences: ["quote-event:reviewed", "quote-event:accepted"],
      applicationReference: lifecycleState === "CONVERTED_TO_APPLICATION"
        ? "application:alejandra:001"
        : null,
      persistenceReceiptReference: "quote-receipt:alejandra:001",
    },
    identity: {
      outcome: identityOutcome,
      prospectReference: "prospect:alejandra",
      commercialPersonReference: confirmedIdentity ? "person:alejandra" : null,
      decisionReference: confirmedIdentity ? "identity-decision:alejandra" : null,
      evidenceReferences: confirmedIdentity ? ["identity-evidence:alejandra"] : [],
    },
    policyEvidence: {
      state: policyEvidenceState,
      packetReference: policyEvidenceState === "ABSENT" ? null : "policy-packet:alejandra:001",
      evidenceReferences: policyEvidenceState === "ABSENT" ? [] : ["document:policy:alejandra:001"],
      reviewedAt: reviewedEvidence ? "2026-08-01T19:20:00.000Z" : null,
      reviewReference: reviewedEvidence ? "policy-review:alejandra:001" : null,
    },
  };
}

test("durable accepted Quote links to the confirmed CommercialPerson without creating Policy", () => {
  const relationship = contract.createAcceptedQuoteCarteraRelationship(baseInput());

  assert.equal(relationship.state, "AWAITING_POLICY_EVIDENCE");
  assert.equal(relationship.nextAuthority, "CARTERA_020B_POLICY_EVIDENCE_INTAKE");
  assert.equal(relationship.quoteLineage.quoteReference, "quote:alejandra:001");
  assert.equal(relationship.quoteLineage.prospectReference, "prospect:alejandra");
  assert.equal(relationship.personLink.commercialPersonReference, "person:alejandra");
  assert.equal(relationship.policyCandidateCreated, false);
  assert.equal(relationship.policyCreated, false);
  assert.deepEqual(relationship.mutationAuthorization, contract.MUTATION_AUTHORIZATION);
  assert.equal(Object.isFrozen(relationship), true);
});

test("reviewed or presented Quote remains linked but cannot enter Policy confirmation", () => {
  for (const lifecycleState of ["REVIEWED", "PRESENTED"]) {
    const relationship = contract.createAcceptedQuoteCarteraRelationship(
      baseInput({ lifecycleState, identityOutcome: "UNRESOLVED" }),
    );
    assert.equal(relationship.state, "QUOTE_LINKED");
    assert.equal(relationship.nextAuthority, "QUOTE_LIFECYCLE_AUTHORITY");
    assert.equal(contract.canEnterPolicyConfirmationReview(relationship), false);
  }
});

test("accepted Quote with unresolved identity must stop before Cartera evidence intake", () => {
  const relationship = contract.createAcceptedQuoteCarteraRelationship(
    baseInput({ identityOutcome: "UNRESOLVED" }),
  );
  assert.equal(relationship.state, "AWAITING_PERSON_CONFIRMATION");
  assert.equal(relationship.nextAuthority, "CARTERA_010B_IDENTITY_RESOLUTION");
  assert.equal(relationship.personLink.commercialPersonReference, null);
});

test("reviewed Policy evidence enables only the governed 020C review handoff", () => {
  const relationship = contract.createAcceptedQuoteCarteraRelationship(
    baseInput({ policyEvidenceState: "REVIEWED" }),
  );
  assert.equal(relationship.state, "READY_FOR_POLICY_CONFIRMATION_REVIEW");
  assert.equal(relationship.nextAuthority, "CARTERA_020C_POLICY_CONFIRMATION_REVIEW");
  assert.equal(contract.canEnterPolicyConfirmationReview(relationship), true);
  assert.equal(relationship.policyCandidateCreated, false);
  assert.equal(relationship.policyCreated, false);
  assert.equal(relationship.mutationAuthorization.policyConfirmation, false);
});

test("disputed Policy evidence cannot progress to confirmation", () => {
  const relationship = contract.createAcceptedQuoteCarteraRelationship(
    baseInput({ policyEvidenceState: "DISPUTED" }),
  );
  assert.equal(relationship.state, "POLICY_EVIDENCE_DISPUTED");
  assert.equal(relationship.nextAuthority, "CARTERA_020B_POLICY_EVIDENCE_REVIEW");
  assert.equal(contract.canEnterPolicyConfirmationReview(relationship), false);
});

test("Vida Mujer and Segubeca use the same relationship contract", () => {
  const vidaMujer = contract.createAcceptedQuoteCarteraRelationship(
    baseInput({ productReference: "product:vida-mujer" }),
  );
  const segubeca = contract.createAcceptedQuoteCarteraRelationship(
    baseInput({ productReference: "product:segubeca" }),
  );
  assert.equal(vidaMujer.state, segubeca.state);
  assert.equal(vidaMujer.nextAuthority, segubeca.nextAuthority);
  assert.deepEqual(
    Object.keys(vidaMujer.quoteLineage).sort(),
    Object.keys(segubeca.quoteLineage).sort(),
  );
});

test("Quote and person must resolve to the same Prospect", () => {
  const input = baseInput();
  input.identity.prospectReference = "prospect:other";
  assert.throws(
    () => contract.createAcceptedQuoteCarteraRelationship(input),
    error => error.code === "QUOTE_PERSON_PROSPECT_MISMATCH",
  );
});

test("non-durable Quote cannot enter the relationship boundary", () => {
  const input = baseInput();
  input.quote.durable = false;
  assert.throws(
    () => contract.createAcceptedQuoteCarteraRelationship(input),
    error => error.code === "DURABLE_QUOTE_REQUIRED",
  );
});

test("calculation and premium truth cannot be copied into the relationship", () => {
  for (const forbiddenPatch of [
    { premiumAmount: 3890.21 },
    { calculation: { total: 1 } },
    { productIntelligence: { schema: "x" } },
    { sumInsured: 50000 },
  ]) {
    const input = baseInput();
    Object.assign(input.quote, forbiddenPatch);
    assert.throws(
      () => contract.createAcceptedQuoteCarteraRelationship(input),
      error => error.code === "QUOTE_CALCULATION_DATA_FORBIDDEN",
    );
  }
});

test("relationship digest and mutation boundary are tamper-evident", () => {
  const relationship = contract.createAcceptedQuoteCarteraRelationship(baseInput());
  assert.equal(
    contract.assertAcceptedQuoteCarteraRelationship(relationship).relationshipDigest,
    relationship.relationshipDigest,
  );

  const tampered = JSON.parse(JSON.stringify(relationship));
  tampered.mutationAuthorization.policyCreation = true;
  assert.throws(
    () => contract.assertAcceptedQuoteCarteraRelationship(tampered),
    error => error.code === "MUTATION_AUTHORIZATION_MISMATCH",
  );
});
