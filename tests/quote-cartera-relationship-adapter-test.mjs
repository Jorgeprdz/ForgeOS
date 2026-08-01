import assert from "node:assert/strict";
import test from "node:test";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const adapter = require(
  "../platform/shared-commercial-model/accepted-quote-cartera-relationship-adapter.js",
);

function quoteReceipt(overrides = {}) {
  return {
    status: "PERSISTED",
    durable: true,
    quoteReference: "quote:alejandra:001",
    quoteVersionReference: "quote-version:alejandra:001:01",
    prospectReference: "prospect:alejandra",
    productReference: "product:segubeca",
    lifecycleState: "PROSPECT_ACCEPTED",
    eventIds: ["quote-event:reviewed", "quote-event:accepted"],
    snapshotDigest: "a1b2c3d4e5f6",
    persistenceReceipt: { receiptReference: "quote-receipt:alejandra:001" },
    ...overrides,
  };
}

function identityReceipt(overrides = {}) {
  return {
    outcome: "LINK_CONFIRMED",
    prospectReference: "prospect:alejandra",
    personReference: "person:alejandra",
    commandReceiptReference: "identity-decision:alejandra",
    evidenceReferences: ["identity-evidence:alejandra"],
    ...overrides,
  };
}

test("adapts the promoted 001B Quote receipt without copying calculation truth", () => {
  const relationship = adapter.createRelationshipFromAuthorityReceipts({
    advisorId: "advisor:jorge",
    actorReference: "advisor:jorge",
    createdAt: "2026-08-01T19:30:00Z",
    quoteReceipt: quoteReceipt(),
    identityReceipt: identityReceipt(),
  });

  assert.equal(relationship.state, "AWAITING_POLICY_EVIDENCE");
  assert.equal(relationship.quoteLineage.quoteReference, "quote:alejandra:001");
  assert.deepEqual(relationship.quoteLineage.eventReferences, [
    "quote-event:reviewed",
    "quote-event:accepted",
  ]);
  assert.equal(
    relationship.quoteLineage.persistenceReceiptReference,
    "quote-receipt:alejandra:001",
  );
  assert.equal(relationship.policyCreated, false);
});

test("missing identity receipt remains explicitly unresolved", () => {
  const relationship = adapter.createRelationshipFromAuthorityReceipts({
    advisorId: "advisor:jorge",
    actorReference: "advisor:jorge",
    createdAt: "2026-08-01T19:30:00Z",
    quoteReceipt: quoteReceipt(),
  });
  assert.equal(relationship.state, "AWAITING_PERSON_CONFIRMATION");
  assert.equal(relationship.personLink.outcome, "UNRESOLVED");
});

test("confirmed 020B evidence enables only the 020C human review handoff", () => {
  const relationship = adapter.createRelationshipFromAuthorityReceipts({
    advisorId: "advisor:jorge",
    actorReference: "advisor:jorge",
    createdAt: "2026-08-01T19:30:00Z",
    quoteReceipt: quoteReceipt(),
    identityReceipt: identityReceipt(),
    policyEvidenceReceipt: {
      verificationState: "CONFIRMED",
      packetReference: "policy-packet:alejandra:001",
      evidenceVersionReferences: ["policy-evidence-version:alejandra:001"],
      confirmedAt: "2026-08-01T19:35:00Z",
      confirmationReviewReference: "policy-review:alejandra:001",
    },
  });
  assert.equal(relationship.state, "READY_FOR_POLICY_CONFIRMATION_REVIEW");
  assert.equal(
    relationship.nextAuthority,
    "CARTERA_020C_POLICY_CONFIRMATION_REVIEW",
  );
  assert.equal(relationship.policyCandidateCreated, false);
  assert.equal(relationship.policyCreated, false);
  assert.equal(relationship.mutationAuthorization.policyConfirmation, false);
});

test("local-only or non-durable Quote receipts are rejected", () => {
  assert.throws(
    () => adapter.createRelationshipFromAuthorityReceipts({
      advisorId: "advisor:jorge",
      actorReference: "advisor:jorge",
      createdAt: "2026-08-01T19:30:00Z",
      quoteReceipt: quoteReceipt({ status: "LOCAL_REVIEW_ONLY", durable: false }),
      identityReceipt: identityReceipt(),
    }),
    error => error.code === "DURABLE_QUOTE_REQUIRED",
  );
});

test("identity and Quote receipts cannot silently cross Prospect boundaries", () => {
  assert.throws(
    () => adapter.createRelationshipFromAuthorityReceipts({
      advisorId: "advisor:jorge",
      actorReference: "advisor:jorge",
      createdAt: "2026-08-01T19:30:00Z",
      quoteReceipt: quoteReceipt(),
      identityReceipt: identityReceipt({ prospectReference: "prospect:other" }),
    }),
    error => error.code === "QUOTE_PERSON_PROSPECT_MISMATCH",
  );
});

test("adapter is pure and installs no automatic runtime effects", () => {
  assert.deepEqual(adapter.diagnostics(), {
    adapterVersion: "QUOTE-CARTERA-RELATION-ADAPTER-001.1",
    automaticListeners: false,
    automaticRpc: false,
    automaticPersistence: false,
    automaticPolicyCreation: false,
    automaticPolicyConfirmation: false,
  });
});
