import test from "node:test";
import assert from "node:assert/strict";
import "../platform/event-evidence/canonical-activity-event-contract.js";
import {
  MANUAL_ACTIVITY_CAPTURE_OPTIONS,
  buildManualActivityFact,
  isCountableManualActivity,
  requiresAppointmentDuration,
} from "../docs/static-preview/forge-alive-material3/activity-manual-fact-adapter.js";

const canonical = globalThis.ForgeCanonicalActivityEventContractFES01;

function canonicalize(spec, suffix) {
  return canonical.createCanonicalActivityEvent({
    event_type: spec.eventType,
    tenant_id: "advisor-1",
    actor: { type: "ADVISOR", id: "advisor-1" },
    subject: spec.subject,
    source: { type: "ADVISOR_CONFIRMED", reference: `manual:${suffix}`, channel: "FORGE_UI" },
    evidence_strength: "HUMAN_CONFIRMED",
    occurred_at: spec.occurredAt,
    recorded_at: "2026-08-07T15:31:00.000Z",
    effective_period: null,
    causation_id: null,
    correlation_id: "person:1",
    idempotency_key: `manual:${suffix}`,
    privacy_class: spec.privacyClass,
    payload: spec.payload,
    provenance: {
      source_system: "FORGE_ACTIVITY_MANUAL_ENTRY",
      source_record_id: `manual:${suffix}`,
      captured_via: "FORGE_UI",
      evidence_references: [`evidence:${suffix}`],
    },
    confirmation_state: "CONFIRMED",
    correction_of: null,
    safety_flags: { ...canonical.DEFAULT_SAFETY_FLAGS },
  });
}

const base = {
  relatedReference: "person:1",
  occurredAt: "2026-08-07T15:30:00.000Z",
  activityReference: "activity:manual-1",
  appointmentReference: "appointment:manual-1",
  referralReference: "referral:manual-1",
};

test("manual capture presents concrete human actions rather than generic technical event names", () => {
  assert.deepEqual(
    MANUAL_ACTIVITY_CAPTURE_OPTIONS.map(item => item.label),
    [
      "Referido recibido",
      "Llamada completada",
      "Cita inicial agendada",
      "Cita de cierre agendada",
      "Cita inicial realizada",
      "Cita de cierre realizada",
      "Seguimiento o nota",
    ],
  );
});

test("referral and call capture create canonical countable FES-01.2 facts", () => {
  const referral = buildManualActivityFact({ ...base, captureType: "REFERRAL_RECEIVED" });
  const call = buildManualActivityFact({ ...base, captureType: "CALL_COMPLETED" });
  assert.equal(canonicalize(referral, "referral").event_type, "REFERRAL_RECEIVED");
  assert.equal(canonicalize(call, "call").event_type, "CALL_COMPLETED");
  assert.equal(referral.countable, true);
  assert.equal(call.countable, true);
});

test("scheduled appointments carry exact Initial/Closing purpose and editable duration", () => {
  const initial = buildManualActivityFact({ ...base, captureType: "INITIAL_APPOINTMENT_SCHEDULED", durationMinutes: 45 });
  const closing = buildManualActivityFact({ ...base, captureType: "CLOSING_APPOINTMENT_SCHEDULED", durationMinutes: 90 });
  assert.equal(initial.payload.appointment_purpose, "INITIAL");
  assert.equal(initial.payload.ends_at, "2026-08-07T16:15:00.000Z");
  assert.equal(closing.payload.appointment_purpose, "CLOSING");
  assert.equal(closing.payload.ends_at, "2026-08-07T17:00:00.000Z");
  assert.equal(canonicalize(initial, "initial-scheduled").event_type, "APPOINTMENT_SCHEDULED");
  assert.equal(canonicalize(closing, "closing-scheduled").event_type, "APPOINTMENT_SCHEDULED");
  assert.equal(requiresAppointmentDuration("INITIAL_APPOINTMENT_SCHEDULED"), true);
});

test("held appointments become canonical confirmed appointment facts", () => {
  const initial = buildManualActivityFact({ ...base, captureType: "INITIAL_APPOINTMENT_HELD" });
  const closing = buildManualActivityFact({ ...base, captureType: "CLOSING_APPOINTMENT_HELD" });
  assert.equal(canonicalize(initial, "initial-held").event_type, "APPOINTMENT_HELD");
  assert.equal(initial.payload.appointment_purpose, "INITIAL");
  assert.equal(canonicalize(closing, "closing-held").event_type, "APPOINTMENT_HELD");
  assert.equal(closing.payload.appointment_purpose, "CLOSING");
});

test("context notes remain non-countable timeline evidence", () => {
  const note = buildManualActivityFact({ ...base, captureType: "CONTEXT_NOTE", notes: "Confirmó seguimiento para la próxima semana." });
  const event = canonicalize(note, "context-note");
  assert.equal(event.event_type, "ACTIVITY_CONTEXT_ADDED");
  assert.equal(note.countable, false);
  assert.equal(isCountableManualActivity("CONTEXT_NOTE"), false);
});

test("manual capture does not offer application submitted or policy paid as local truth", () => {
  const values = new Set(MANUAL_ACTIVITY_CAPTURE_OPTIONS.map(item => item.value));
  assert.equal(values.has("APPLICATION_SUBMITTED"), false);
  assert.equal(values.has("POLICY_PAID"), false);
  assert.equal(values.has("solicitudes_firmadas"), false);
  assert.equal(values.has("polizas_pagadas"), false);
});
