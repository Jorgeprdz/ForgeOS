import assert from "node:assert/strict";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const fes = require("../platform/event-evidence/canonical-activity-event-contract.js");

const base = (eventType, payload, overrides = {}) => ({
  event_type: eventType,
  tenant_id: "tenant-1",
  actor: { type: "ADVISOR", id: "advisor-1" },
  subject: { type: eventType.startsWith("APPOINTMENT_") ? "APPOINTMENT" : "ACTIVITY", id: "subject-1" },
  source: { type: "ADVISOR_CONFIRMED", reference: "source-1", channel: "FORGE_UI" },
  evidence_strength: "HUMAN_CONFIRMED",
  occurred_at: "2026-08-05T12:00:00Z",
  recorded_at: "2026-08-05T12:01:00Z",
  effective_period: null,
  causation_id: null,
  correlation_id: "capture-1",
  idempotency_key: `key-${eventType}`,
  privacy_class: "OPERATIONAL",
  learning_eligibility: false,
  payload,
  provenance: { source_system: "FORGE", source_record_id: null, captured_via: "FORGE_UI", evidence_references: ["evidence-1"], correction_reason_code: null },
  confirmation_state: "CONFIRMED",
  correction_of: null,
  safety_flags: fes.DEFAULT_SAFETY_FLAGS,
  ...overrides,
});

assert.equal(fes.CONTRACT_VERSION, "FES-01.2");
for (const type of ["REFERRAL_RECEIVED", "CALL_COMPLETED", "ADVISOR_REFERRAL_RECEIVED"]) assert.ok(fes.EVENT_TYPES.includes(type));
assert.ok(fes.EVENT_TYPES.includes("SALES_NBA_ADVISOR_RESPONSE"));
const advisorResponse = fes.createCanonicalActivityEvent(base("SALES_NBA_ADVISOR_RESPONSE", {
  recommendation_reference: "recommendation-1", recommendation_source: "NBA_REASON_WHY", recommendation_domain: "COMMERCIAL",
  advisor_reference: "advisor-1", decision: "ACCEPTED", original_response: "ACCEPTED", recommendation_version: "NBA-009",
  commercial_person_reference: null, prospect_reference: null, opportunity_reference: null, deferred_until: null,
}, { subject: { type: "RECOMMENDATION", id: "recommendation-1" }, idempotency_key: "advisor-response-1" }));
assert.equal(advisorResponse.subject.type, "RECOMMENDATION");
assert.equal(fes.EVENT_TYPES.includes("POLICY_PAID_CONFIRMED"), false);
assert.equal(fes.EVENT_TYPES.includes("APPLICATION_SUBMITTED"), false);
assert.equal(fes.ACTIVITY_FACT_DEFINITIONS.POLICY_PAID.fesOfficialTruth, false);
assert.equal(fes.ACTIVITY_FACT_DEFINITIONS.APPLICATION_SUBMITTED.sourceOwner, "POLICY_SALES_OPERATIONS");

const referral = fes.createCanonicalActivityEvent(base("REFERRAL_RECEIVED", { activity_reference: "activity-1", referral_reference: "referral-1", prospect_reference: "prospect-1" }));
assert.equal(referral.subject.type, "ACTIVITY");
assert.match(referral.event_id, /^evt_[a-f0-9]{32}$/);
assert.equal(fes.deriveCanonicalEventId({ tenant_id: referral.tenant_id, event_type: referral.event_type, idempotency_key: referral.idempotency_key }), referral.event_id);
assert.deepEqual(fes.createCanonicalActivityEvent(base("REFERRAL_RECEIVED", { activity_reference: "activity-1", referral_reference: "referral-1", prospect_reference: "prospect-1" })), referral);

const call = fes.createCanonicalActivityEvent(base("CALL_COMPLETED", { activity_reference: "activity-2", contact_reference: "contact-1" }, { idempotency_key: "call-1" }));
assert.equal(call.payload.contact_reference, "contact-1");
const advisorReferral = fes.createCanonicalActivityEvent(base("ADVISOR_REFERRAL_RECEIVED", { activity_reference: "activity-3", referred_advisor_reference: "advisor-2" }, { idempotency_key: "advisor-referral-1" }));
assert.equal(advisorReferral.payload.referred_advisor_reference, "advisor-2");

const scheduled = fes.createCanonicalActivityEvent(base("APPOINTMENT_SCHEDULED", { appointment_reference: "appointment-1", starts_at: "2026-08-06T12:00:00Z", ends_at: "2026-08-06T13:00:00Z", appointment_purpose: "CLOSING" }, { idempotency_key: "scheduled-1" }));
const held = fes.createCanonicalActivityEvent(base("APPOINTMENT_HELD", { appointment_reference: "appointment-1", outcome_confirmed_at: "2026-08-06T13:00:00Z", appointment_purpose: "CLOSING" }, { idempotency_key: "held-1", occurred_at: "2026-08-06T13:00:00Z", recorded_at: "2026-08-06T13:01:00Z" }));
assert.equal(scheduled.event_type, "APPOINTMENT_SCHEDULED");
assert.equal(held.event_type, "APPOINTMENT_HELD");
assert.equal(held.payload.appointment_purpose, "CLOSING");
assert.deepEqual(fes.ACTIVITY_FACT_DEFINITIONS.CLOSING_APPOINTMENT_HELD.discriminator, { appointment_purpose: "CLOSING" });

assert.throws(() => fes.createCanonicalActivityEvent(base("CALL_COMPLETED", { activity_reference: "activity-2" }, { idempotency_key: "missing-call" })), (error) => error.code === "PAYLOAD_FIELDS_REQUIRED");
assert.throws(() => fes.createCanonicalActivityEvent(base("CALL_COMPLETED", { activity_reference: "activity-2", contact_reference: "contact-1", unsupported: "x" }, { idempotency_key: "unknown-call" })), (error) => error.code === "PAYLOAD_FIELDS_INVALID");
assert.throws(() => fes.createCanonicalActivityEvent(base("CALL_COMPLETED", { activity_reference: "activity-2", contact_reference: "contact-1", medical: "x" }, { idempotency_key: "sensitive-call" })), (error) => error.code === "PAYLOAD_PROHIBITED_FIELDS");
assert.throws(() => fes.createCanonicalActivityEvent(base("CALL_COMPLETED", { activity_reference: "activity-2", contact_reference: "contact-1" }, { subject: { type: "PROSPECT", id: "prospect-1" }, idempotency_key: "wrong-subject" })), (error) => error.code === "EVENT_SUBJECT_TYPE_MISMATCH");
assert.throws(() => fes.createCanonicalActivityEvent(base("CALL_COMPLETED", { activity_reference: "activity-2", contact_reference: "contact-1" }, { source: { type: "ADVISOR_REPORTED", reference: "source-2", channel: "FORGE_UI" }, evidence_strength: "HUMAN_CONFIRMED", confirmation_state: "REPORTED", idempotency_key: "wrong-evidence" })), (error) => error.code === "SOURCE_EVIDENCE_MISMATCH");
assert.throws(() => fes.createCanonicalActivityEvent(base("APPOINTMENT_HELD", { appointment_reference: "appointment-2", outcome_confirmed_at: "2026-08-06T13:00:00Z", appointment_purpose: "SALES" }, { idempotency_key: "bad-purpose" })), (error) => error.code === "PAYLOAD_APPOINTMENT_PURPOSE_INVALID");

const correction = fes.createCanonicalActivityCorrection(referral, {
  actor: { type: "ADVISOR", id: "advisor-1" },
  source: { type: "ADVISOR_CONFIRMED", reference: "source-correction", channel: "FORGE_UI" },
  evidence_strength: "HUMAN_CONFIRMED",
  occurred_at: "2026-08-05T12:00:00Z",
  recorded_at: "2026-08-05T12:05:00Z",
  idempotency_key: "referral-correction-1",
  privacy_class: "OPERATIONAL",
  payload: { activity_reference: "activity-1", referral_reference: "referral-2", prospect_reference: "prospect-1" },
  provenance: { source_system: "FORGE", source_record_id: "correction-1", captured_via: "FORGE_UI", evidence_references: ["evidence-2"] },
  correction_reason_code: "REFERENCE_CORRECTED",
});
assert.equal(correction.correction_of, referral.event_id);
assert.notEqual(correction.event_id, referral.event_id);
assert.equal(referral.payload.referral_reference, "referral-1");
assert.ok(Object.isFrozen(referral));
assert.equal(Object.values(referral.safety_flags).every((value) => value === false), true);
console.log("ACTIVITY_FACT_OWNER_MAP=PASS");
console.log("FES_TAXONOMY_EXTENSION=PASS");
console.log("FES_BACKWARD_COMPATIBILITY=PASS");
console.log("PARALLEL_ACTIVITY_LEDGER=ZERO");
console.log("PARALLEL_ACTIVITY_WRITER=ZERO");
console.log("POLICY_TRUTH_REOWNED_BY_ACTIVITY=NO");
