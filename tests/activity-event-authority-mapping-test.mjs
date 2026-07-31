import test from "node:test";
import assert from "node:assert/strict";

import {
  ACTIVITY_EVENT_AUTHORITY_MAPPING_SCHEMA_VERSION,
  FES_ACTIVITY_EVENT_EXTENSION_VERSION,
  mapCanonicalEventToActivity,
  resolveCountableActivityFacts,
} from "../advisor-os/reporting/domain/activity-event-authority-mapping.mjs";

function event(overrides = {}) {
  return {
    schema_version: "forge.activity_event.v1",
    event_id: overrides.event_id ?? "evt-1",
    event_type: overrides.event_type ?? "DUE_ACTION_COMPLETED",
    tenant_id: overrides.tenant_id ?? "tenant-1",
    actor: overrides.actor ?? { type: "ADVISOR", id: "advisor-1" },
    idempotency_key: overrides.idempotency_key ?? "idem-1",
    occurred_at: overrides.occurred_at ?? "2026-07-31T15:00:00.000Z",
    recorded_at: overrides.recorded_at ?? "2026-07-31T15:01:00.000Z",
    confirmation_state: overrides.confirmation_state ?? "CONFIRMED",
    correction_of: overrides.correction_of ?? null,
    payload: overrides.payload ?? {
      due_action_reference: "due-1",
      completed_at: "2026-07-31T15:00:00.000Z",
    },
  };
}

test("maps confirmed due action completion to follow up", () => {
  const value = mapCanonicalEventToActivity(event());
  assert.equal(value.activityType, "FOLLOW_UP_COMPLETED");
  assert.deepEqual(value.activityTypes, ["FOLLOW_UP_COMPLETED"]);
  assert.equal(value.status, "COUNTABLE");
  assert.equal(value.schemaVersion, ACTIVITY_EVENT_AUTHORITY_MAPPING_SCHEMA_VERSION);
  assert.equal(FES_ACTIVITY_EVENT_EXTENSION_VERSION, "FES-05B.1");
});

test("maps confirmed message send to contact attempt", () => {
  const value = mapCanonicalEventToActivity(event({
    event_type: "MESSAGE_SENT_CONFIRMED",
    payload: {
      flow_reference: "flow-1",
      artifact_reference: "artifact-1",
      confirmation_reference: "confirmation-1",
    },
  }));

  assert.deepEqual(value.activityTypes, ["CONTACT_ATTEMPTED"]);
});

test("maps a connected call to contact and conversation facts", () => {
  const value = mapCanonicalEventToActivity(event({
    event_type: "CALL_CONNECTED_CONFIRMED",
    payload: {
      flow_reference: "flow-1",
      call_reference: "call-1",
      confirmation_reference: "confirmation-1",
    },
  }));

  assert.equal(value.activityType, null);
  assert.deepEqual(value.activityTypes, [
    "CONTACT_ATTEMPTED",
    "CONVERSATION_COMPLETED",
  ]);

  const resolved = resolveCountableActivityFacts([event({
    event_type: "CALL_CONNECTED_CONFIRMED",
    payload: {
      flow_reference: "flow-1",
      call_reference: "call-1",
      confirmation_reference: "confirmation-1",
    },
  })]);
  assert.equal(resolved.facts.length, 2);
  assert.equal(new Set(resolved.facts.map((fact) => fact.factId)).size, 2);
});

test("requires domain context for appointment stage", () => {
  const value = mapCanonicalEventToActivity(event({
    event_type: "APPOINTMENT_HELD",
    payload: {
      appointment_reference: "apt-1",
      outcome_confirmed_at: "2026-07-31T15:00:00.000Z",
    },
  }));
  assert.equal(value.status, "REQUIRES_DOMAIN_CONTEXT");
  assert.equal(value.activityType, null);
  assert.deepEqual(value.activityTypes, []);
});

test("maps initial and closing appointments only through domain classifier", () => {
  const initial = mapCanonicalEventToActivity(event({
    event_type: "APPOINTMENT_SCHEDULED",
    payload: {
      appointment_reference: "apt-1",
      starts_at: "2026-08-01T15:00:00.000Z",
      ends_at: "2026-08-01T16:00:00.000Z",
    },
  }), { classifyAppointment: () => "INITIAL" });
  const closing = mapCanonicalEventToActivity(event({
    event_type: "APPOINTMENT_HELD",
    payload: {
      appointment_reference: "apt-2",
      outcome_confirmed_at: "2026-07-31T15:00:00.000Z",
    },
  }), { classifyAppointment: () => "CLOSING" });

  assert.equal(initial.activityType, "INITIAL_APPOINTMENT_SCHEDULED");
  assert.equal(closing.activityType, "CLOSING_APPOINTMENT_COMPLETED");
});

test("does not promote passive evidence into applications or policies", () => {
  for (const eventType of [
    "QUOTE_PREPARED",
    "PRESENTATION_HELD_CONFIRMED",
    "PROPOSAL_REQUESTED_CONFIRMED",
    "PROSPECT_REPLIED_CONFIRMED",
  ]) {
    const value = mapCanonicalEventToActivity(event({ event_type: eventType }));
    assert.equal(value.status, "NOT_A_REPORTABLE_ACTIVITY");
  }
});

test("excludes unconfirmed and disputed direct activity events", () => {
  const unconfirmed = mapCanonicalEventToActivity(event({
    confirmation_state: "UNCONFIRMED",
  }));
  const disputed = mapCanonicalEventToActivity(event({
    confirmation_state: "DISPUTED",
  }));
  assert.equal(unconfirmed.status, "EXCLUDED");
  assert.equal(disputed.status, "EXCLUDED");
});

test("suppresses originals replaced by append-only corrections", () => {
  const original = event({
    event_id: "evt-original",
    idempotency_key: "idem-original",
  });
  const correction = event({
    event_id: "evt-correction",
    idempotency_key: "idem-correction",
    correction_of: "evt-original",
  });

  const value = resolveCountableActivityFacts([correction, original]);
  assert.equal(value.facts.length, 1);
  assert.equal(value.facts[0].eventId, "evt-correction");
  assert.equal(value.exclusions[0].reason, "SUPERSEDED_BY_CORRECTION");
});

test("suppresses same-type idempotent replay without input-order drift", () => {
  const value = resolveCountableActivityFacts([
    event({
      event_id: "evt-b",
      idempotency_key: "same",
      recorded_at: "2026-07-31T15:02:00.000Z",
    }),
    event({
      event_id: "evt-a",
      idempotency_key: "same",
      recorded_at: "2026-07-31T15:01:00.000Z",
    }),
  ]);
  assert.equal(value.facts.length, 1);
  assert.equal(value.facts[0].eventId, "evt-a");
  assert.equal(value.exclusions[0].reason, "IDEMPOTENT_REPLAY");
});

test("does not collapse equal idempotency keys across different event types", () => {
  const value = resolveCountableActivityFacts([
    event({ event_id: "evt-follow", idempotency_key: "shared" }),
    event({
      event_id: "evt-message",
      event_type: "MESSAGE_SENT_CONFIRMED",
      idempotency_key: "shared",
      payload: {
        flow_reference: "flow-1",
        artifact_reference: "artifact-1",
        confirmation_reference: "confirmation-1",
      },
    }),
  ]);

  assert.equal(value.facts.length, 2);
  assert.equal(value.exclusions.length, 0);
});

test("rejects correction targets outside the supplied authority set", () => {
  assert.throws(() => resolveCountableActivityFacts([
    event({ event_id: "evt-c", correction_of: "missing" }),
  ]), /correction target missing is absent/u);
});

test("locks authority boundaries", () => {
  const value = resolveCountableActivityFacts([event()]);
  assert.equal(value.boundary.activityMappingAuthority, true);
  assert.equal(value.boundary.eventTruthAuthority, false);
  assert.equal(value.boundary.scoringAuthority, false);
  assert.equal(value.boundary.aiInterpretationAuthority, false);
  assert.equal(value.boundary.persistenceMutationAuthority, false);
});
