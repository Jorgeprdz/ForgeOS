import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const contract = require("../platform/shared-commercial-model/crs-04-activity-person-convergence-contract.js");
const canonical = require("../platform/event-evidence/canonical-activity-event-contract.js");
const ledger = require("../platform/event-evidence/activity-ledger-contract.js");
const adapters = require("../platform/shared-commercial-model/crs-02-authoritative-domain-link-adapters.js");
const links = require("../platform/shared-commercial-model/crs-02-domain-link-envelope-contract.js");

function prospectEvent(overrides = {}) {
  return canonical.createCanonicalActivityEvent({
    event_type: "PROSPECT_CREATED",
    tenant_id: "advisor:001",
    actor: { type: "SYSTEM", id: "forge-system" },
    subject: { type: "PROSPECT", id: "prospect:001" },
    source: {
      type: "SYSTEM_OBSERVED",
      reference: "prospect-save:001",
      channel: "FORGE_UI",
    },
    evidence_strength: "SYSTEM_OBSERVED",
    occurred_at: "2026-08-01T20:00:00.000Z",
    recorded_at: "2026-08-01T20:00:01.000Z",
    effective_period: null,
    causation_id: null,
    correlation_id: "legacy-fes-correlation:001",
    idempotency_key: "crs04-prospect-created:001",
    privacy_class: "PRIVATE",
    payload: {
      prospect_reference: "prospect:001",
      source_category: "REFERRAL",
    },
    provenance: {
      source_system: "forge-alive",
      source_record_id: "prospect-save:001",
      captured_via: "FORGE_UI",
      evidence_references: [],
    },
    confirmation_state: "CONFIRMED",
    correction_of: null,
    safety_flags: { ...canonical.DEFAULT_SAFETY_FLAGS },
    ...overrides,
  });
}

function appointmentEvent() {
  return canonical.createCanonicalActivityEvent({
    event_type: "APPOINTMENT_SCHEDULED",
    tenant_id: "advisor:001",
    actor: { type: "SYSTEM", id: "forge-system" },
    subject: { type: "APPOINTMENT", id: "appointment:001" },
    source: {
      type: "SYSTEM_OBSERVED",
      reference: "appointment-save:001",
      channel: "FORGE_UI",
    },
    evidence_strength: "SYSTEM_OBSERVED",
    occurred_at: "2026-08-01T21:00:00.000Z",
    recorded_at: "2026-08-01T21:00:01.000Z",
    effective_period: null,
    causation_id: null,
    correlation_id: "legacy-appointment-correlation:001",
    idempotency_key: "crs04-appointment:001",
    privacy_class: "PRIVATE",
    payload: {
      appointment_reference: "appointment:001",
      starts_at: "2026-08-02T16:00:00.000Z",
      ends_at: "2026-08-02T17:00:00.000Z",
    },
    provenance: {
      source_system: "forge-alive",
      source_record_id: "appointment-save:001",
      captured_via: "FORGE_UI",
      evidence_references: [],
    },
    confirmation_state: "CONFIRMED",
    correction_of: null,
    safety_flags: { ...canonical.DEFAULT_SAFETY_FLAGS },
  });
}

function ledgerRecord(event = prospectEvent()) {
  return ledger.createLedgerRecord({
    canonical_event: event,
    evidence_references: [],
    appended_at: new Date(Date.parse(event.recorded_at) + 1000).toISOString(),
  });
}

function remoteReceipt(record, status = "ACKNOWLEDGED") {
  return ledger.createReceipt({
    status,
    tenant_id: record.tenant_id,
    event_id: record.event_id,
    mutation_id: `mutation:${record.event_id}`,
    server_sequence: 1,
    server_recorded_at: new Date(Date.parse(record.appended_at) + 1000).toISOString(),
    cursor: "1",
  });
}

function linkedIdentity(sourceIdentityReference = "prospect:001") {
  return {
    state: "LINKED",
    personReference: "person:001",
    sourceIdentityLinkReference: "identity-link:001",
    identityDecisionReference: "identity-decision:001",
    matchStatus: "LINK_CONFIRMED",
    reason: null,
    sourceIdentityReference,
  };
}

function unresolvedIdentity(sourceIdentityReference = "prospect:001") {
  return {
    state: "UNRESOLVED",
    personReference: null,
    sourceIdentityLinkReference: null,
    identityDecisionReference: null,
    matchStatus: null,
    reason: sourceIdentityReference ? "PERSON_UNRESOLVED" : "SOURCE_IDENTITY_UNAVAILABLE",
    sourceIdentityReference,
  };
}

function linkedDomainLink(event = prospectEvent(), correlationId = null, correctionOf = null) {
  return adapters.fromCanonicalActivityEvent(event, {
    advisorReference: "advisor:001",
    personReference: "person:001",
    relationshipReference: null,
    correlationId,
    sourceIdentityReference: "prospect:001",
    privacyClassification: "PRIVATE",
    correctionOf,
    sourceEventReference: null,
  });
}

function missingDomainLink(event = prospectEvent(), sourceIdentityReference = "prospect:001") {
  return adapters.fromCanonicalActivityEvent(event, {
    advisorReference: "advisor:001",
    personReference: null,
    relationshipReference: null,
    correlationId: null,
    sourceIdentityReference,
    privacyClassification: "PRIVATE",
    correctionOf: null,
    sourceEventReference: null,
  });
}

function linkedInput(overrides = {}) {
  const event = prospectEvent();
  const record = ledgerRecord(event);
  return {
    ledgerRecord: record,
    identity: linkedIdentity(),
    domainLink: linkedDomainLink(event),
    remoteReceipt: null,
    timelineAuthority: "FES_CANONICAL_ACTIVITY_TIMELINE",
    ...overrides,
  };
}

test("creates an immutable linked Activity person convergence snapshot", () => {
  const snapshot = contract.createActivityPersonConvergence(linkedInput());
  assert.equal(snapshot.contractType, contract.CONTRACT_TYPE);
  assert.equal(snapshot.ledgerAuthority, "FES_ACTIVITY_EVENT_LEDGER");
  assert.equal(snapshot.timelineAuthority, "FES_CANONICAL_ACTIVITY_TIMELINE");
  assert.equal(snapshot.identity.personReference, "person:001");
  assert.equal(snapshot.domainLink.domain, "ACTIVITY");
  assert.equal(snapshot.ledgerState, "LOCAL_APPENDED");
  assert.equal(Object.isFrozen(snapshot), true);
  assert.equal(Object.isFrozen(snapshot.ledgerRecord), true);
});

test("creates an explicit unresolved missing-link without a partial person", () => {
  const event = prospectEvent();
  const snapshot = contract.createActivityPersonConvergence({
    ledgerRecord: ledgerRecord(event),
    identity: unresolvedIdentity(),
    domainLink: missingDomainLink(event),
    remoteReceipt: null,
    timelineAuthority: "FES_CANONICAL_ACTIVITY_TIMELINE",
  });
  assert.equal(snapshot.identity.state, "UNRESOLVED");
  assert.equal(snapshot.domainLink.contractType, links.MISSING_LINK_TYPE);
  assert.equal(snapshot.domainLink.missingReason, "PERSON_UNRESOLVED");
});

test("non-Prospect Activity can remain unresolved when source identity is unavailable", () => {
  const event = appointmentEvent();
  const snapshot = contract.createActivityPersonConvergence({
    ledgerRecord: ledgerRecord(event),
    identity: unresolvedIdentity(null),
    domainLink: missingDomainLink(event, null),
    remoteReceipt: null,
    timelineAuthority: "FES_CANONICAL_ACTIVITY_TIMELINE",
  });
  assert.equal(snapshot.identity.reason, "SOURCE_IDENTITY_UNAVAILABLE");
  assert.equal(snapshot.domainLink.recordType, "APPOINTMENT");
  assert.equal(snapshot.domainLink.recordReference, "appointment:001");
});

test("linked identity requires source identity, person, link and decision", () => {
  assert.throws(
    () => contract.createActivityPersonConvergence({
      ...linkedInput(),
      identity: { ...linkedIdentity(), identityDecisionReference: null },
    }),
    error => error.code === "CRS04_LINKED_IDENTITY_INCOMPLETE",
  );
});

test("Activity convergence rejects a domain link for another event", () => {
  const event = prospectEvent();
  const other = prospectEvent({
    idempotency_key: "crs04-prospect-created:other",
    source: {
      type: "SYSTEM_OBSERVED",
      reference: "prospect-save:other",
      channel: "FORGE_UI",
    },
  });
  assert.throws(
    () => contract.createActivityPersonConvergence({
      ledgerRecord: ledgerRecord(event),
      identity: linkedIdentity(),
      domainLink: linkedDomainLink(other),
      remoteReceipt: null,
      timelineAuthority: "FES_CANONICAL_ACTIVITY_TIMELINE",
    }),
    error => error.code === "CRS04_ACTIVITY_DOMAIN_LINK_MISMATCH",
  );
});

test("remote acknowledged receipt promotes the ledger state", () => {
  const input = linkedInput();
  const snapshot = contract.createActivityPersonConvergence({
    ...input,
    remoteReceipt: remoteReceipt(input.ledgerRecord),
  });
  assert.equal(snapshot.ledgerState, "REMOTE_ACKNOWLEDGED");
  assert.equal(snapshot.remoteReceipt.status, "ACKNOWLEDGED");
});

test("remote receipt for another event fails closed", () => {
  const input = linkedInput();
  const otherRecord = ledgerRecord(prospectEvent({
    idempotency_key: "crs04-prospect-created:receipt-other",
    source: {
      type: "SYSTEM_OBSERVED",
      reference: "prospect-save:receipt-other",
      channel: "FORGE_UI",
    },
  }));
  assert.throws(
    () => contract.createActivityPersonConvergence({
      ...input,
      remoteReceipt: remoteReceipt(otherRecord),
    }),
    error => error.code === "CRS04_RECEIPT_LEDGER_MISMATCH",
  );
});

test("legacy FES correlation is preserved but never reinterpreted as movement", () => {
  const snapshot = contract.createActivityPersonConvergence(linkedInput());
  assert.equal(snapshot.sourceCorrelation.eventCorrelationId, "legacy-fes-correlation:001");
  assert.equal(snapshot.sourceCorrelation.commercialMovementCorrelationId, null);
  assert.equal(snapshot.sourceCorrelation.legacyCorrelationReinterpretedAsCommercialMovement, false);
});

test("commercial movement correlation must be explicitly CRS 02-derived", () => {
  const event = prospectEvent();
  const invalidLink = adapters.fromCanonicalActivityEvent(event, {
    advisorReference: "advisor:001",
    personReference: "person:001",
    relationshipReference: null,
    correlationId: "legacy-fes-correlation:001",
    sourceIdentityReference: "prospect:001",
    privacyClassification: "PRIVATE",
    correctionOf: null,
    sourceEventReference: null,
  });
  assert.throws(
    () => contract.createActivityPersonConvergence({
      ledgerRecord: ledgerRecord(event),
      identity: linkedIdentity(),
      domainLink: invalidLink,
      remoteReceipt: null,
      timelineAuthority: "FES_CANONICAL_ACTIVITY_TIMELINE",
    }),
    error => error.code === "CRS04_COMMERCIAL_MOVEMENT_CORRELATION_INVALID",
  );
});

test("one person can carry an explicit movement without changing event truth", () => {
  const event = prospectEvent();
  const movement = links.deriveCorrelationId({
    personReference: "person:001",
    movementReference: "retirement:2026",
  });
  const snapshot = contract.createActivityPersonConvergence({
    ledgerRecord: ledgerRecord(event),
    identity: linkedIdentity(),
    domainLink: linkedDomainLink(event, movement),
    remoteReceipt: null,
    timelineAuthority: "FES_CANONICAL_ACTIVITY_TIMELINE",
  });
  assert.equal(snapshot.domainLink.correlationId, movement);
  assert.equal(snapshot.ledgerRecord.canonical_event.correlation_id, "legacy-fes-correlation:001");
});

test("correction lineage stays append-only across event and domain link", () => {
  const originalEvent = prospectEvent();
  const originalLink = linkedDomainLink(originalEvent);
  const correction = canonical.createCanonicalActivityCorrection(originalEvent, {
    actor: { type: "ADVISOR", id: "advisor:001" },
    source: {
      type: "ADVISOR_CONFIRMED",
      reference: "correction:001",
      channel: "FORGE_UI",
    },
    evidence_strength: "HUMAN_CONFIRMED",
    occurred_at: "2026-08-01T20:10:00.000Z",
    recorded_at: "2026-08-01T20:10:01.000Z",
    idempotency_key: "crs04-prospect-created:correction:001",
    privacy_class: "PRIVATE",
    payload: {
      prospect_reference: "prospect:001",
      source_category: "REFERRAL",
    },
    provenance: {
      source_system: "forge-alive",
      source_record_id: "correction:001",
      captured_via: "FORGE_UI",
      evidence_references: [],
    },
    confirmation_state: "CONFIRMED",
    correction_reason_code: "SOURCE_CATEGORY_CONFIRMED",
  });
  const snapshot = contract.createActivityPersonConvergence({
    ledgerRecord: ledgerRecord(correction),
    identity: linkedIdentity(),
    domainLink: linkedDomainLink(correction, null, originalLink.linkReference),
    remoteReceipt: null,
    timelineAuthority: "FES_CANONICAL_ACTIVITY_TIMELINE",
  });
  assert.equal(snapshot.correctionLineage.eventCorrectionOf, originalEvent.event_id);
  assert.equal(snapshot.correctionLineage.domainLinkCorrectionOf, originalLink.linkReference);
  assert.equal(snapshot.correctionLineage.appendOnly, true);
});

test("digest and derived lineage are verified on replay", () => {
  const snapshot = contract.createActivityPersonConvergence(linkedInput());
  assert.throws(
    () => contract.assertActivityPersonConvergence({
      ...snapshot,
      convergenceDigest: "0".repeat(32),
    }),
    error => error.code === "CRS04_CONVERGENCE_DIGEST_OR_VERSION_MISMATCH",
  );
});
