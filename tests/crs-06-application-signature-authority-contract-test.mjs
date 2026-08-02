import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const contract = require("../platform/application-authority/application-signature-authority-contract.js");
const links = require("../platform/shared-commercial-model/crs-02-domain-link-envelope-contract.js");

const when = "2026-08-01T21:00:00.000Z";
const later = "2026-08-01T21:01:00.000Z";

function version(overrides = {}) {
  return {
    applicationReference: "application:11111111-1111-4111-8111-111111111111",
    versionReference: "application-version:22222222-2222-4222-8222-222222222222",
    versionNumber: 1,
    personReference: "person:001",
    quoteReference: "quote:33333333-3333-4333-8333-333333333333",
    quoteVersionReference: "quote-version:44444444-4444-4444-8444-444444444444",
    prospectReference: "prospect:001",
    productReference: "product:segubeca",
    lifecycleState: "SIGNED",
    previousLifecycleState: "PARTIALLY_SIGNED",
    documentReference: "document:application-pdf-001",
    snapshotDigest: "a".repeat(64),
    sourceEvidenceReferences: ["quote-event:001", "document:001"],
    createdAt: when,
    correctionOf: null,
    ...overrides,
  };
}

function signer(overrides = {}) {
  return {
    signerReference: "signer:applicant:001",
    role: "APPLICANT",
    required: true,
    personReference: "person:001",
    signatureState: "SIGNED",
    ...overrides,
  };
}

function signature(overrides = {}) {
  return {
    signatureReference: "signature:001",
    applicationReference: version().applicationReference,
    versionReference: version().versionReference,
    signerReference: signer().signerReference,
    evidenceType: "SIGNED_DOCUMENT_DIGEST",
    documentDigest: "b".repeat(64),
    providerReference: null,
    signedAt: when,
    capturedAt: later,
    evidenceReferences: ["document:signature:001"],
    confirmationState: "VERIFIED",
    privacyClass: "RESTRICTED",
    correctionOf: null,
    ...overrides,
  };
}

function event(overrides = {}) {
  return {
    eventReference: "application-event:55555555-5555-4555-8555-555555555555",
    eventType: "APPLICATION_SIGNED",
    applicationReference: version().applicationReference,
    versionReference: version().versionReference,
    personReference: "person:001",
    quoteReference: version().quoteReference,
    lifecycleState: "SIGNED",
    previousLifecycleState: "PARTIALLY_SIGNED",
    occurredAt: when,
    recordedAt: later,
    sourceReference: "signature:001",
    evidenceReferences: ["document:signature:001"],
    idempotencyKey: "crs06:application:001:signed",
    correctionOf: null,
    ...overrides,
  };
}

function domainLink(overrides = {}) {
  return links.createDomainLinkEnvelope({
    personReference: "person:001",
    relationshipReference: links.deriveRelationshipReference({
      advisorReference: "advisor:001",
      personReference: "person:001",
    }),
    correlationId: null,
    domain: "APPLICATION",
    recordType: "APPLICATION",
    recordReference: version().applicationReference,
    authority: "APPLICATION_AUTHORITY",
    sourceEventReference: event().eventReference,
    effectiveAt: when,
    recordedAt: later,
    privacyClassification: "RESTRICTED",
    idempotencyKey: "crs06-domain-link:001",
    correctionOf: null,
    ...overrides,
  });
}

function snapshotInput(overrides = {}) {
  return {
    applicationVersion: version(),
    signers: [signer()],
    signatureEvidence: [signature()],
    requirements: [],
    latestEvent: event(),
    domainLink: domainLink(),
    ...overrides,
  };
}

test("creates an immutable Application authority snapshot", () => {
  const snapshot = contract.createApplicationAuthoritySnapshot(snapshotInput());
  assert.equal(snapshot.contractType, contract.CONTRACT_TYPE);
  assert.equal(snapshot.authority, "APPLICATION_AUTHORITY");
  assert.equal(snapshot.applicationVersion.lifecycleState, "SIGNED");
  assert.equal(Object.isFrozen(snapshot), true);
  assert.equal(Object.isFrozen(snapshot.signers), true);
});

test("signed Application is never a Policy", () => {
  const snapshot = contract.createApplicationAuthoritySnapshot(snapshotInput());
  assert.deepEqual(snapshot.policyBoundary, {
    signedApplicationIsPolicy: false,
    submittedApplicationIsPolicy: false,
    approvedApplicationIsPolicy: false,
    issuanceEvidenceRequiredForPolicy: true,
    automaticPolicyCreation: false,
  });
});

test("SIGNED requires every required signer", () => {
  assert.throws(
    () => contract.createApplicationAuthoritySnapshot(snapshotInput({
      signers: [signer({ signatureState: "PENDING" })],
      signatureEvidence: [],
    })),
    error => error.code === "CRS06_REQUIRED_SIGNATURES_INCOMPLETE",
  );
});

test("verified evidence requires signer state SIGNED", () => {
  assert.throws(
    () => contract.createApplicationAuthoritySnapshot(snapshotInput({
      applicationVersion: version({ lifecycleState: "PARTIALLY_SIGNED" }),
      latestEvent: event({ eventType: "SIGNATURE_RECORDED", lifecycleState: "PARTIALLY_SIGNED" }),
      signers: [signer({ required: false, signatureState: "PENDING" })],
    })),
    error => error.code === "CRS06_VERIFIED_SIGNATURE_STATE_MISMATCH",
  );
});

test("signature evidence cannot carry raw signature or biometrics", () => {
  assert.throws(
    () => contract.createSignatureEvidence({ ...signature(), rawSignature: "data" }),
    error => error.code === "CRS06_SIGNATURE_EVIDENCE_KEYS_INVALID" || error.code === "CRS06_RAW_SIGNATURE_DATA_FORBIDDEN",
  );
});

test("signature evidence requires a 64-character document digest", () => {
  assert.throws(
    () => contract.createSignatureEvidence({ ...signature(), documentDigest: "bad" }),
    error => error.code === "CRS06_SIGNATURE_DOCUMENT_DIGEST_INVALID",
  );
});

test("Application Version blocks copied provider payloads", () => {
  assert.throws(
    () => contract.createApplicationVersion({ ...version(), providerPayload: {} }),
    error => error.code === "CRS06_VERSION_KEYS_INVALID" || error.code === "CRS06_SENSITIVE_APPLICATION_PAYLOAD_FORBIDDEN",
  );
});

test("domain link must use APPLICATION authority and the same person", () => {
  assert.throws(
    () => contract.createApplicationAuthoritySnapshot(snapshotInput({
      domainLink: domainLink({ personReference: "person:other" }),
    })),
    error => error.code === "CRS06_APPLICATION_DOMAIN_LINK_MISMATCH",
  );
});

test("event and version must share application, version, person, Quote and state", () => {
  assert.throws(
    () => contract.createApplicationAuthoritySnapshot(snapshotInput({
      latestEvent: event({ quoteReference: "quote:other" }),
    })),
    error => error.code === "CRS06_EVENT_VERSION_LINEAGE_MISMATCH",
  );
});

test("requirement OPEN cannot declare resolution", () => {
  assert.throws(
    () => contract.createRequirement({
      requirementReference: "requirement:001",
      requirementCode: "ID_DOCUMENT",
      state: "OPEN",
      evidenceReferences: [],
      openedAt: when,
      resolvedAt: later,
      reviewReference: "review:001",
      correctionOf: null,
    }),
    error => error.code === "CRS06_OPEN_REQUIREMENT_RESOLUTION_FORBIDDEN",
  );
});

test("resolved requirement requires evidence and review lineage", () => {
  const requirement = contract.createRequirement({
    requirementReference: "requirement:001",
    requirementCode: "ID_DOCUMENT",
    state: "SATISFIED",
    evidenceReferences: ["document:id:001"],
    openedAt: when,
    resolvedAt: later,
    reviewReference: "review:001",
    correctionOf: null,
  });
  assert.equal(requirement.state, "SATISFIED");
});

test("event type must match lifecycle state", () => {
  assert.throws(
    () => contract.createApplicationEvent(event({ eventType: "APPLICATION_SUBMITTED", lifecycleState: "SIGNED" })),
    error => error.code === "CRS06_EVENT_STATE_MISMATCH",
  );
});

test("Pipeline milestone is projection-only", () => {
  const projection = contract.projectApplicationMilestone(event());
  assert.equal(projection.projected, true);
  assert.equal(projection.milestone, "APPLICATION_SIGNED");
  assert.equal(projection.automaticStageAdvance, false);
  assert.equal(projection.automaticPolicyCreation, false);
});

test("non-milestone Application events do not invent Pipeline meaning", () => {
  const projection = contract.projectApplicationMilestone(event({
    eventType: "APPLICATION_VERSION_CREATED",
    lifecycleState: "READY_FOR_SIGNATURE",
  }));
  assert.equal(projection.projected, false);
  assert.equal(projection.milestone, null);
});

test("snapshot digest rejects tampering", () => {
  const snapshot = contract.createApplicationAuthoritySnapshot(snapshotInput());
  assert.throws(
    () => contract.assertApplicationAuthoritySnapshot({ ...snapshot, snapshotDigest: "0".repeat(32) }),
    error => error.code === "CRS06_SNAPSHOT_DIGEST_OR_VERSION_MISMATCH",
  );
});

test("one person may own multiple independent Applications", () => {
  const first = contract.createApplicationAuthoritySnapshot(snapshotInput());
  const secondApplication = "application:66666666-6666-4666-8666-666666666666";
  const secondVersion = "application-version:77777777-7777-4777-8777-777777777777";
  const secondEvent = "application-event:88888888-8888-4888-8888-888888888888";
  const second = contract.createApplicationAuthoritySnapshot(snapshotInput({
    applicationVersion: version({ applicationReference: secondApplication, versionReference: secondVersion }),
    signatureEvidence: [signature({ applicationReference: secondApplication, versionReference: secondVersion })],
    latestEvent: event({ applicationReference: secondApplication, versionReference: secondVersion, eventReference: secondEvent }),
    domainLink: domainLink({ recordReference: secondApplication, sourceEventReference: secondEvent }),
  }));
  assert.equal(first.applicationVersion.personReference, second.applicationVersion.personReference);
  assert.notEqual(first.applicationVersion.applicationReference, second.applicationVersion.applicationReference);
});
