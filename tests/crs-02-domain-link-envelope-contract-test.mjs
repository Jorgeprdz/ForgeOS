import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const contract = require("../platform/shared-commercial-model/crs-02-domain-link-envelope-contract.js");

function baseInput(overrides = {}) {
  return {
    personReference: "person:ana",
    relationshipReference: contract.deriveRelationshipReference({
      advisorReference: "advisor:jorge",
      personReference: "person:ana",
    }),
    correlationId: "movement:retiro-2026",
    domain: "PIPELINE",
    recordType: "OPPORTUNITY",
    recordReference: "opportunity:retiro-2026",
    authority: "PIPELINE_OPPORTUNITY_AUTHORITY",
    sourceEventReference: "pipeline-event:opportunity-created",
    effectiveAt: "2026-08-01T20:00:00.000Z",
    recordedAt: "2026-08-01T20:00:01.000Z",
    privacyClassification: "PRIVATE",
    idempotencyKey: "crs02:opportunity:retiro-2026",
    correctionOf: null,
    ...overrides,
  };
}

test("relationshipReference is deterministic but creates no durable relationship entity", () => {
  const first = contract.deriveRelationshipReference({
    advisorReference: "advisor:jorge",
    personReference: "person:ana",
  });
  const second = contract.deriveRelationshipReference({
    advisorReference: "advisor:jorge",
    personReference: "person:ana",
  });
  assert.equal(first, second);
  assert.match(first, /^relationship:[a-f0-9]{32}$/);
  assert.equal(contract.BOUNDARIES.durableRelationshipEntityCreated, false);
  assert.equal(contract.BOUNDARIES.centralLinkLedgerCreated, false);
});

test("common envelope preserves references only and is immutable and digest-bound", () => {
  const link = contract.createDomainLinkEnvelope(baseInput());
  assert.equal(link.contractType, contract.CONTRACT_TYPE);
  assert.equal(link.domain, "PIPELINE");
  assert.equal(link.recordReference, "opportunity:retiro-2026");
  assert.equal(Object.isFrozen(link), true);
  assert.equal(contract.assertDomainLinkEnvelope(link).linkDigest, link.linkDigest);
  assert.equal("payload" in link, false);
  assert.equal("premiumAmount" in link, false);
});

test("one person can carry several independent commercial movements", () => {
  const retirement = contract.createDomainLinkEnvelope(baseInput());
  const education = contract.createDomainLinkEnvelope(baseInput({
    correlationId: "movement:educacion-2027",
    recordReference: "opportunity:educacion-2027",
    sourceEventReference: "pipeline-event:education-created",
    idempotencyKey: "crs02:opportunity:education-2027",
  }));
  assert.equal(retirement.personReference, education.personReference);
  assert.notEqual(retirement.correlationId, education.correlationId);
  assert.equal(
    contract.reconcileDomainLinkReplay(retirement, education).outcome,
    "DISTINCT_LINK",
  );
});

test("commercial movement correlation may remain explicitly absent", () => {
  const link = contract.createDomainLinkEnvelope(baseInput({
    correlationId: null,
    domain: "CARTERA",
    recordType: "POLICY",
    recordReference: "policy:vida:001",
    authority: "CARTERA_POLICY_AUTHORITY",
    sourceEventReference: "policy-event:issued:001",
    idempotencyKey: "crs02:policy:vida:001",
  }));
  assert.equal(link.correlationId, null);
});

test("identical replay is accepted and changed input under one key conflicts", () => {
  const first = contract.createDomainLinkEnvelope(baseInput());
  const same = contract.createDomainLinkEnvelope(baseInput({ linkReference: first.linkReference }));
  assert.equal(contract.reconcileDomainLinkReplay(first, same).outcome, "REPLAY_IDENTICAL");

  const changed = contract.createDomainLinkEnvelope(baseInput({
    linkReference: "domain-link:changed",
    recordReference: "opportunity:other",
  }));
  assert.throws(
    () => contract.reconcileDomainLinkReplay(first, changed),
    error => error.code === "CRS02_CHANGED_INPUT_REPLAY_CONFLICT",
  );
});

test("same authoritative record can change only through explicit correction lineage", () => {
  const original = contract.createDomainLinkEnvelope(baseInput());
  const conflicting = contract.createDomainLinkEnvelope(baseInput({
    relationshipReference: contract.deriveRelationshipReference({
      advisorReference: "advisor:jorge",
      personReference: "person:bea",
    }),
    personReference: "person:bea",
    idempotencyKey: "crs02:corrected:attempt",
  }));
  assert.throws(
    () => contract.reconcileDomainLinkReplay(original, conflicting),
    error => error.code === "CRS02_RECORD_LINK_CONFLICT",
  );
  const correction = contract.createDomainLinkEnvelope(baseInput({
    personReference: "person:bea",
    relationshipReference: contract.deriveRelationshipReference({
      advisorReference: "advisor:jorge",
      personReference: "person:bea",
    }),
    sourceEventReference: "pipeline-event:identity-corrected",
    idempotencyKey: "crs02:corrected:accepted",
    correctionOf: original.linkReference,
  }));
  assert.equal(
    contract.reconcileDomainLinkReplay(original, correction).outcome,
    "CORRECTION_ACCEPTED",
  );
});

test("domain, record type and authority combinations fail closed", () => {
  assert.throws(
    () => contract.createDomainLinkEnvelope(baseInput({
      authority: "CARTERA_POLICY_AUTHORITY",
    })),
    error => error.code === "CRS02_AUTHORITY_INVALID",
  );
  assert.throws(
    () => contract.createDomainLinkEnvelope(baseInput({
      recordType: "POLICY",
    })),
    error => error.code === "CRS02_RECORD_TYPE_INVALID",
  );
});

test("missing person creates an explicit missing-link result, never a partial canonical link", () => {
  const missing = contract.createMissingDomainLink({
    domain: "QUOTE",
    recordType: "QUOTE",
    recordReference: "quote:001",
    authority: "QUOTE_LIFECYCLE_AUTHORITY",
    sourceEventReference: "quote-event:001",
    correlationId: "movement:retiro-2026",
    observedAt: "2026-08-01T20:00:01.000Z",
    privacyClassification: "PRIVATE",
    missingReason: "PERSON_UNRESOLVED",
    sourceIdentityReference: "prospect:001",
    idempotencyKey: "crs02:missing:quote:001",
  });
  assert.equal(missing.contractType, contract.MISSING_LINK_TYPE);
  assert.equal("personReference" in missing, false);
  assert.equal("relationshipReference" in missing, false);
  assert.equal(contract.assertMissingDomainLink(missing).missingLinkDigest, missing.missingLinkDigest);
});

test("payload truth and arbitrary fields are rejected", () => {
  assert.throws(
    () => contract.createDomainLinkEnvelope({
      ...baseInput(),
      payload: { premiumAmount: 3890.21 },
    }),
    error => error.code === "CRS02_LINK_INPUT_KEYS_INVALID",
  );
  assert.equal(contract.BOUNDARIES.authoritativePayloadCopied, false);
  assert.equal(contract.BOUNDARIES.automaticBusinessAction, false);
});
