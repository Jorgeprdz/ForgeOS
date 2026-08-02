import test from "node:test";
import assert from "node:assert/strict";
import adapters from "../platform/shared-commercial-model/crs-08-unified-person-timeline-adapters.js";

const ctx = {
  advisorReference: "advisor-1",
  personReference: "person-1",
  relationshipReference: "rel-1",
  correlationId: "corr-1",
};

test("locks adapter metadata and maps Cartera 040B history", () => {
  assert.equal(adapters.ADAPTER_VERSION, "CRS-08-UNIFIED-PERSON-TIMELINE-ADAPTERS-001.1");
  const entry = adapters.fromCartera040HistoryEvent({
    eventType: "APPOINTMENT_CONTEXT", title: "Cita", summary: "Contexto confirmado",
    occurredAt: "2026-08-01T08:00:00Z", sourceAuthority: "ADVISOR_CONFIRMED",
    sourceRecordReference: "memory-event-1", truthClass: "CONFIRMED_EVENT",
    consentState: "NOT_REQUIRED", contextUse: "GENERAL_RELATIONSHIP",
  }, ctx);
  assert.equal(entry.domain, "ACTIVITY");
  assert.equal(entry.authority, "FES_CANONICAL_ACTIVITY_TIMELINE");
  assert.equal(entry.facts.projectedBy, "CARTERA_040B_PERSON_RELATIONSHIP_BRIEF");
});

test("adapts Pipeline without contact payload", () => {
  const entry = adapters.fromPipelineProspect({
    id: "prospect-1", status: "contacted", source: "Referral", version: 3,
    created_at: "2026-08-01T09:00:00Z", updated_at: "2026-08-01T10:00:00Z",
    phone_normalized: "+525500000000", email_normalized: "x@example.com",
  }, ctx);
  assert.equal(entry.domain, "PIPELINE");
  assert.equal(entry.facts.stage, "contacted");
  assert.equal("phone" in entry.facts, false);
  assert.equal(JSON.stringify(entry).includes("example.com"), false);
});

test("uses a deterministic Pipeline source reference", () => {
  const entry = adapters.fromPipelineProspect({ id: "p1", status: "referred_new", version: 2, created_at: "2026-08-01T09:00:00Z" }, ctx);
  assert.equal(entry.sourceEventReference, "pipeline-prospect:p1:v2");
});

test("adapts confirmed Activity", () => {
  const entry = adapters.fromActivityLedgerRow({
    event_id: "evt-1", event_type: "APPOINTMENT_HELD", occurred_at: "2026-08-01T10:00:00Z",
    recorded_at: "2026-08-01T10:01:00Z", privacy_class: "PRIVATE", confirmation_state: "CONFIRMED",
    subject_type: "PROSPECT", canonical_event: { event_id: "evt-1", event_type: "APPOINTMENT_HELD", subject: { type: "PROSPECT", id: "p1" }, payload: { outcome: "completed" } },
  }, ctx);
  assert.equal(entry.domain, "ACTIVITY");
  assert.equal(entry.title, "Cita realizada");
  assert.equal(entry.facts.outcome, "completed");
});

test("preserves Activity dispute and correction", () => {
  const entry = adapters.fromActivityLedgerRow({
    event_id: "evt-2", event_type: "ACTIVITY_CONTEXT_ADDED", occurred_at: "2026-08-01T11:00:00Z",
    recorded_at: "2026-08-01T11:00:00Z", privacy_class: "SENSITIVE", confirmation_state: "DISPUTED", correction_of: "evt-1",
    canonical_event: { event_id: "evt-2", event_type: "ACTIVITY_CONTEXT_ADDED", subject: { type: "PROSPECT", id: "p1" }, payload: {} },
  }, ctx);
  assert.equal(entry.confirmationState, "DISPUTED");
  assert.equal(entry.correctionOf, "evt-1");
  assert.equal(entry.privacyClassification, "SENSITIVE");
});

test("does not copy raw Activity payload", () => {
  const entry = adapters.fromActivityLedgerRow({
    event_id: "evt-3", event_type: "ACTIVITY_CONTEXT_ADDED", occurred_at: "2026-08-01T11:00:00Z",
    recorded_at: "2026-08-01T11:00:00Z", privacy_class: "RESTRICTED", confirmation_state: "CONFIRMED",
    canonical_event: { event_id: "evt-3", event_type: "ACTIVITY_CONTEXT_ADDED", subject: { type: "PROSPECT", id: "p1" }, payload: { rawMessage: "secret", phone: "+52", outcome: "noted" } },
  }, ctx);
  assert.equal(entry.facts.outcome, "noted");
  assert.equal(JSON.stringify(entry).includes("secret"), false);
});

test("adapts Quote lifecycle", () => {
  const entry = adapters.fromQuoteLifecycleEvent({
    event_id: "qevt-1", event_type: "QUOTE_CONFIRMED", lifecycle_state: "CONFIRMED",
    occurred_at: "2026-08-01T12:00:00Z", recorded_at: "2026-08-01T12:01:00Z", confirmation_state: "CONFIRMED",
  }, { quote_reference: "quote-1", product_reference: "VIDA_MUJER", updated_at: "2026-08-01T12:01:00Z" }, ctx);
  assert.equal(entry.title, "Cotización confirmada");
  assert.equal(entry.facts.productReference, "VIDA_MUJER");
});

test("preserves Quote correction", () => {
  const entry = adapters.fromQuoteLifecycleEvent({
    event_id: "qevt-2", event_type: "QUOTE_VERSION_CREATED", lifecycle_state: "DRAFT",
    occurred_at: "2026-08-01T13:00:00Z", recorded_at: "2026-08-01T13:00:00Z", correction_of: "qevt-1",
  }, { quote_reference: "quote-1", product_reference: "VIDA_MUJER" }, ctx);
  assert.equal(entry.correctionOf, "qevt-1");
});

test("adapts Application as restricted", () => {
  const entry = adapters.fromApplicationEvent({
    event_reference: "appevt-1", event_type: "APPLICATION_SIGNED", lifecycle_state: "SIGNED",
    occurred_at: "2026-08-01T14:00:00Z", recorded_at: "2026-08-01T14:01:00Z",
  }, { application_reference: "app-1", product_reference: "VIDA_MUJER", quote_reference: "quote-1" }, ctx);
  assert.equal(entry.domain, "APPLICATION");
  assert.equal(entry.privacyClassification, "RESTRICTED");
  assert.equal(entry.title, "Solicitud firmada");
});

test("marks disputed Application lifecycle", () => {
  const entry = adapters.fromApplicationEvent({
    event_reference: "appevt-2", event_type: "REQUIREMENT_DISPUTED", lifecycle_state: "DISPUTED",
    occurred_at: "2026-08-01T15:00:00Z", recorded_at: "2026-08-01T15:00:00Z",
  }, { application_reference: "app-1" }, ctx);
  assert.equal(entry.confirmationState, "DISPUTED");
});

test("adapts raw Policy version without policy number", () => {
  const entry = adapters.fromPolicyVersion({
    policy_reference: "policy-1", policy_number: "SECRET-123", status_value: "IN_FORCE",
    carrier_reference: "SMNYL", product_reference: "VIDA", effective_from: "2026-08-01T00:00:00Z",
  }, { policy_version_reference: "pv-1", version_number: 1, confirmed_at: "2026-08-01T16:00:00Z" },
  { role_type: "INSURED", confirmation_state: "CONFIRMED", privacy_classification: "RESTRICTED" }, ctx);
  assert.equal(entry.title, "Póliza emitida");
  assert.equal(JSON.stringify(entry).includes("SECRET-123"), false);
});

test("adapts CRS 07 lineage", () => {
  const entry = adapters.fromApplicationPolicyLineage({
    policy: {
      policyReference: "policy-1", policyVersionReference: "pv-1", versionNumber: 2,
      carrierReference: "SMNYL", productReference: "VIDA", statusValue: "IN_FORCE",
      effectiveFrom: "2026-08-01T00:00:00Z", confirmedAt: "2026-08-01T16:00:00Z",
      applicationReference: "app-1", quoteReference: "quote-1",
    },
    personRole: { roleType: "INSURED", confirmationState: "CONFIRMED", privacyClassification: "RESTRICTED" },
    domainLink: { correlationId: "corr-policy" },
  }, { ...ctx, correlationId: null });
  assert.equal(entry.title, "Póliza actualizada");
  assert.equal(entry.correlationId, "corr-policy");
});

test("requires CommercialPerson context", () => {
  assert.throws(() => adapters.fromPipelineProspect({ id: "p1", created_at: "2026-08-01T00:00:00Z" }, { ...ctx, personReference: null }), { code: "CRS08_PERSON_REFERENCE_REQUIRED" });
});

test("requires authoritative source dates", () => {
  assert.throws(() => adapters.fromQuoteLifecycleEvent({ event_id: "e", event_type: "QUOTE_CREATED" }, { quote_reference: "q" }, ctx), { code: "CRS08_QUOTE_TIME_REQUIRED" });
});

test("all adapters return normalized source entry shape", () => {
  const entry = adapters.fromPipelineProspect({ id: "p1", status: "referred_new", created_at: "2026-08-01T00:00:00Z" }, ctx);
  assert.deepEqual(Object.keys(entry).sort(), [
    "authority", "confirmationState", "correctionOf", "correlationId", "domain", "facts", "occurredAt",
    "personReference", "privacyClassification", "recordReference", "recordType", "recordedAt",
    "relationshipReference", "sourceEventReference", "summary", "title",
  ].sort());
});
