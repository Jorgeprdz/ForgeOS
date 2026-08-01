import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const contract = require("../platform/shared-commercial-model/crs-05-quote-person-convergence-contract.js");
const links = require("../platform/shared-commercial-model/crs-02-domain-link-envelope-contract.js");

const quote = Object.freeze({
  quoteReference: "quote:11111111-1111-4111-8111-111111111111",
  advisorReference: "advisor:001",
  prospectReference: "prospect:001",
  productReference: "product:segubeca",
  lifecycleState: "PROSPECT_ACCEPTED",
  currentVersionNumber: 2,
  createdAt: "2026-08-01T20:00:00.000Z",
  updatedAt: "2026-08-01T20:10:00.000Z",
  persistenceReceiptReference: "quote-persist:11111111-1111-4111-8111-111111111111",
});

const version = Object.freeze({
  quoteVersionReference: "quote-version:22222222-2222-4222-8222-222222222222",
  versionNumber: 2,
  snapshotDigest: "a".repeat(64),
  sourceRecordReference: "quote-source:segubeca-001",
  sourceEvidenceReferences: ["document:segubeca-001"],
  freshnessStatus: "reviewed_current_session",
  confirmationState: "CONFIRMED",
  createdAt: "2026-08-01T20:05:00.000Z",
  printableArtifactReference: "quote-pdf:segubeca-001",
  calculationAuthorityReference: "SEGUBECA_ACCEPTED_PRODUCT_CALCULATION",
});

const lifecycle = Object.freeze({
  eventReference: "quote-event:33333333-3333-4333-8333-333333333333",
  eventType: "QUOTE_PROSPECT_ACCEPTED",
  lifecycleState: "PROSPECT_ACCEPTED",
  previousLifecycleState: "PRESENTED",
  quoteReference: quote.quoteReference,
  quoteVersionReference: version.quoteVersionReference,
  prospectReference: quote.prospectReference,
  productReference: quote.productReference,
  occurredAt: "2026-08-01T20:09:00.000Z",
  recordedAt: "2026-08-01T20:10:00.000Z",
  correctionOf: null,
  applicationReference: null,
  evidenceReferences: ["confirmation:accepted-001"],
});

function linkedDomainLink(correlationId = null, overrides = {}) {
  return links.createDomainLinkEnvelope({
    personReference: "person:001",
    relationshipReference: links.deriveRelationshipReference({
      advisorReference: quote.advisorReference,
      personReference: "person:001",
    }),
    correlationId,
    domain: "QUOTE",
    recordType: "QUOTE",
    recordReference: quote.quoteReference,
    authority: "QUOTE_PERSISTENCE_AUTHORITY",
    sourceEventReference: lifecycle.eventReference,
    effectiveAt: lifecycle.occurredAt,
    recordedAt: lifecycle.recordedAt,
    privacyClassification: "PRIVATE",
    idempotencyKey: "crs05-quote:accepted-001",
    correctionOf: null,
    ...overrides,
  });
}

function missingDomainLink() {
  return links.createMissingDomainLink({
    domain: "QUOTE",
    recordType: "QUOTE",
    recordReference: quote.quoteReference,
    authority: "QUOTE_PERSISTENCE_AUTHORITY",
    sourceEventReference: lifecycle.eventReference,
    correlationId: null,
    observedAt: lifecycle.recordedAt,
    privacyClassification: "PRIVATE",
    missingReason: "PERSON_UNRESOLVED",
    sourceIdentityReference: quote.prospectReference,
    idempotencyKey: "crs05-quote:missing-001",
  });
}

function linkedInput(overrides = {}) {
  return {
    quote,
    version,
    lifecycle,
    identity: {
      state: "LINKED",
      personReference: "person:001",
      sourceIdentityLinkReference: "identity-link:001",
      identityDecisionReference: "identity-decision:001",
      matchStatus: "LINK_CONFIRMED",
      reason: null,
      sourceIdentityReference: quote.prospectReference,
    },
    domainLink: linkedDomainLink(),
    acceptedQuoteRelationship: null,
    ...overrides,
  };
}

test("creates an immutable linked Quote person convergence snapshot", () => {
  const snapshot = contract.createQuotePersonConvergence(linkedInput());
  assert.equal(snapshot.contractType, contract.CONTRACT_TYPE);
  assert.equal(snapshot.identity.personReference, "person:001");
  assert.equal(snapshot.quoteAuthority, "QUOTE_PERSISTENCE_AUTHORITY");
  assert.equal(snapshot.domainLink.domain, "QUOTE");
  assert.equal(Object.isFrozen(snapshot), true);
  assert.equal(Object.isFrozen(snapshot.version), true);
});

test("creates an explicit unresolved Quote without a partial person link", () => {
  const snapshot = contract.createQuotePersonConvergence({
    ...linkedInput(),
    identity: {
      state: "UNRESOLVED",
      personReference: null,
      sourceIdentityLinkReference: null,
      identityDecisionReference: null,
      matchStatus: null,
      reason: "PERSON_UNRESOLVED",
      sourceIdentityReference: quote.prospectReference,
    },
    domainLink: missingDomainLink(),
  });
  assert.equal(snapshot.identity.state, "UNRESOLVED");
  assert.equal(snapshot.domainLink.contractType, links.MISSING_LINK_TYPE);
  assert.equal(snapshot.domainLink.correlationId, null);
});

test("linked identity requires person, source link and governed decision", () => {
  assert.throws(
    () => contract.createQuotePersonConvergence({
      ...linkedInput(),
      identity: { ...linkedInput().identity, identityDecisionReference: null },
    }),
    error => error.code === "CRS05_LINKED_IDENTITY_INCOMPLETE",
  );
});

test("unresolved identity cannot transport a partial person", () => {
  assert.throws(
    () => contract.createQuotePersonConvergence({
      ...linkedInput(),
      identity: {
        state: "UNRESOLVED",
        personReference: "person:001",
        sourceIdentityLinkReference: null,
        identityDecisionReference: null,
        matchStatus: null,
        reason: "PERSON_UNRESOLVED",
        sourceIdentityReference: quote.prospectReference,
      },
      domainLink: missingDomainLink(),
    }),
    error => error.code === "CRS05_UNRESOLVED_IDENTITY_CANNOT_CARRY_LINK",
  );
});

test("current Quote Version must match the durable Quote counter", () => {
  assert.throws(
    () => contract.createQuotePersonConvergence({
      ...linkedInput(),
      version: { ...version, versionNumber: 1 },
    }),
    error => error.code === "CRS05_CURRENT_VERSION_MISMATCH",
  );
});

test("latest lifecycle event must match Quote state", () => {
  assert.throws(
    () => contract.createQuotePersonConvergence({
      ...linkedInput(),
      lifecycle: {
        ...lifecycle,
        eventType: "QUOTE_PRESENTED",
        lifecycleState: "PRESENTED",
      },
    }),
    error => error.code === "CRS05_CURRENT_LIFECYCLE_MISMATCH",
  );
});

test("Quote, Version, Prospect and product lineage cannot diverge", () => {
  assert.throws(
    () => contract.createQuotePersonConvergence({
      ...linkedInput(),
      lifecycle: { ...lifecycle, prospectReference: "prospect:other" },
    }),
    error => error.code === "CRS05_QUOTE_LINEAGE_MISMATCH",
  );
});

test("accepted Quote remains distinct from Application and Policy", () => {
  const snapshot = contract.createQuotePersonConvergence(linkedInput());
  assert.equal(snapshot.boundaries.quoteAcceptedIsApplication, false);
  assert.equal(snapshot.boundaries.quoteAcceptedIsPolicy, false);
  assert.equal(snapshot.boundaries.applicationReferenceObserved, null);
  assert.equal(snapshot.boundaries.automaticApplicationCreation, false);
  assert.equal(snapshot.boundaries.automaticPolicyCreation, false);
});

test("converted lifecycle requires a reference issued by Application authority", () => {
  const convertedQuote = { ...quote, lifecycleState: "CONVERTED_TO_APPLICATION" };
  const convertedLifecycle = {
    ...lifecycle,
    eventType: "QUOTE_CONVERTED_TO_APPLICATION",
    lifecycleState: "CONVERTED_TO_APPLICATION",
    applicationReference: null,
  };
  assert.throws(
    () => contract.createQuotePersonConvergence({
      ...linkedInput(),
      quote: convertedQuote,
      lifecycle: convertedLifecycle,
    }),
    error => error.code === "CRS05_APPLICATION_REFERENCE_REQUIRED",
  );
});

test("a governed Application reference is observed but not created by Quote", () => {
  const convertedQuote = { ...quote, lifecycleState: "CONVERTED_TO_APPLICATION" };
  const convertedLifecycle = {
    ...lifecycle,
    eventType: "QUOTE_CONVERTED_TO_APPLICATION",
    lifecycleState: "CONVERTED_TO_APPLICATION",
    applicationReference: "application:001",
  };
  const convertedLink = linkedDomainLink(null, {
    effectiveAt: convertedLifecycle.occurredAt,
    recordedAt: convertedLifecycle.recordedAt,
  });
  const snapshot = contract.createQuotePersonConvergence({
    ...linkedInput(),
    quote: convertedQuote,
    lifecycle: convertedLifecycle,
    domainLink: convertedLink,
  });
  assert.equal(snapshot.boundaries.applicationReferenceObserved, "application:001");
  assert.equal(snapshot.boundaries.automaticApplicationCreation, false);
});

test("domain link must point to the same durable Quote and event", () => {
  const other = linkedDomainLink(null, { recordReference: "quote:other" });
  assert.throws(
    () => contract.createQuotePersonConvergence({ ...linkedInput(), domainLink: other }),
    error => error.code === "CRS05_QUOTE_DOMAIN_LINK_MISMATCH",
  );
});

test("commercial movement correlation must be explicitly derived by CRS 02", () => {
  const movement = links.deriveCorrelationId({
    personReference: "person:001",
    movementReference: "education:2026",
  });
  const snapshot = contract.createQuotePersonConvergence({
    ...linkedInput(),
    domainLink: linkedDomainLink(movement),
  });
  assert.match(snapshot.domainLink.correlationId, /^movement:/);

  const invalid = linkedDomainLink("legacy-prospect-correlation");
  assert.throws(
    () => contract.createQuotePersonConvergence({ ...linkedInput(), domainLink: invalid }),
    error => error.code === "CRS05_COMMERCIAL_MOVEMENT_INVALID",
  );
});

test("Quote convergence carries only references to PDF and calculation authority", () => {
  const snapshot = contract.createQuotePersonConvergence(linkedInput());
  assert.equal(snapshot.version.printableArtifactReference, "quote-pdf:segubeca-001");
  assert.equal(snapshot.version.calculationAuthorityReference, "SEGUBECA_ACCEPTED_PRODUCT_CALCULATION");
  assert.equal(snapshot.boundaries.numericQuoteTruthCopied, false);
  assert.equal(snapshot.boundaries.pdfBytesCopied, false);
});

test("numeric Quote payloads and PDF bytes cannot be smuggled into the version", () => {
  assert.throws(
    () => contract.createQuotePersonConvergence({
      ...linkedInput(),
      version: { ...version, annualPremium: 1000 },
    }),
    error => error.code === "CRS05_QUOTE_VERSION_KEYS_INVALID",
  );
  assert.throws(
    () => contract.createQuotePersonConvergence({
      ...linkedInput(),
      version: { ...version, pdfBytes: "base64" },
    }),
    error => error.code === "CRS05_QUOTE_VERSION_KEYS_INVALID",
  );
});

test("contract remains product-neutral across Quote products", () => {
  for (const productReference of [
    "product:segubeca",
    "product:vida-mujer",
    "product:orvi",
    "product:imagina-ser",
  ]) {
    const productQuote = { ...quote, productReference };
    const productLifecycle = { ...lifecycle, productReference };
    const snapshot = contract.createQuotePersonConvergence({
      ...linkedInput(),
      quote: productQuote,
      lifecycle: productLifecycle,
    });
    assert.equal(snapshot.quote.productReference, productReference);
    assert.equal(snapshot.boundaries.productSpecificIdentityAdapter, false);
  }
});

test("digest and version are verified on replay", () => {
  const snapshot = contract.createQuotePersonConvergence(linkedInput());
  assert.throws(
    () => contract.assertQuotePersonConvergence({
      ...snapshot,
      convergenceDigest: "0".repeat(32),
    }),
    error => error.code === "CRS05_CONVERGENCE_DIGEST_OR_VERSION_MISMATCH",
  );
});