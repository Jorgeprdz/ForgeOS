import test from "node:test";
import assert from "node:assert/strict";
import {
  mapCanonicalEventToActivity,
  resolveCountableActivityFacts,
  FES_ACTIVITY_EVENT_TYPES,
} from "../advisor-os/reporting/domain/activity-event-authority-mapping.mjs";

function event(eventType, payload = {}, overrides = {}) {
  return {
    schema_version: "forge.activity_event.v1",
    event_id: `evt-${eventType.toLowerCase()}-${overrides.suffix || "1"}`,
    event_type: eventType,
    tenant_id: "advisor-1",
    idempotency_key: `idem-${eventType.toLowerCase()}-${overrides.suffix || "1"}`,
    occurred_at: "2026-08-07T15:00:00.000Z",
    recorded_at: "2026-08-07T15:00:01.000Z",
    confirmation_state: "CONFIRMED",
    actor: { type: "ADVISOR", id: "advisor-1" },
    payload,
    correction_of: null,
    ...overrides,
  };
}

test("REP accepts all additive FES-01.2 operational fact types", () => {
  assert.ok(FES_ACTIVITY_EVENT_TYPES.includes("REFERRAL_RECEIVED"));
  assert.ok(FES_ACTIVITY_EVENT_TYPES.includes("CALL_COMPLETED"));
  assert.ok(FES_ACTIVITY_EVENT_TYPES.includes("ADVISOR_REFERRAL_RECEIVED"));
});

test("confirmed CALL_COMPLETED maps to contact and conversation without a second call truth", () => {
  const mapped = mapCanonicalEventToActivity(event("CALL_COMPLETED", {
    activity_reference: "activity:call-1",
    contact_reference: "person:1",
  }));
  assert.equal(mapped.status, "COUNTABLE");
  assert.deepEqual(mapped.activityTypes, ["CONTACT_ATTEMPTED", "CONVERSATION_COMPLETED"]);
});

test("FES-01.2 appointment_purpose resolves Initial and Closing without external classifier", () => {
  const initial = mapCanonicalEventToActivity(event("APPOINTMENT_HELD", {
    appointment_reference: "appointment:initial-1",
    outcome_confirmed_at: "2026-08-07T15:00:00.000Z",
    appointment_purpose: "INITIAL",
  }, { suffix: "initial" }));
  assert.equal(initial.status, "COUNTABLE");
  assert.deepEqual(initial.activityTypes, ["INITIAL_APPOINTMENT_COMPLETED"]);

  const closing = mapCanonicalEventToActivity(event("APPOINTMENT_SCHEDULED", {
    appointment_reference: "appointment:closing-1",
    starts_at: "2026-08-08T16:00:00.000Z",
    ends_at: "2026-08-08T17:00:00.000Z",
    appointment_purpose: "CLOSING",
  }, { suffix: "closing" }));
  assert.equal(closing.status, "COUNTABLE");
  assert.deepEqual(closing.activityTypes, ["CLOSING_APPOINTMENT_SCHEDULED"]);
});

test("referral facts remain valid Productivity facts without being relabeled as REP activity", () => {
  for (const eventType of ["REFERRAL_RECEIVED", "ADVISOR_REFERRAL_RECEIVED"]) {
    const mapped = mapCanonicalEventToActivity(event(eventType, {
      activity_reference: `activity:${eventType.toLowerCase()}`,
      ...(eventType === "REFERRAL_RECEIVED"
        ? { referral_reference: "referral:1" }
        : { referred_advisor_reference: "advisor-referral:1" }),
    }));
    assert.equal(mapped.status, "NOT_A_REPORTABLE_ACTIVITY");
    assert.equal(mapped.reason, "PRODUCTIVITY_FACT_NOT_REP_ACTIVITY");
  }
});

test("mixed FES-01.2 ledger can be resolved without unsupported-event failure", () => {
  const resolved = resolveCountableActivityFacts([
    event("REFERRAL_RECEIVED", {
      activity_reference: "activity:referral-1",
      referral_reference: "referral:1",
    }, { suffix: "referral" }),
    event("CALL_COMPLETED", {
      activity_reference: "activity:call-1",
      contact_reference: "person:1",
    }, { suffix: "call" }),
    event("APPOINTMENT_HELD", {
      appointment_reference: "appointment:initial-1",
      outcome_confirmed_at: "2026-08-07T15:00:00.000Z",
      appointment_purpose: "INITIAL",
    }, { suffix: "held" }),
  ]);

  assert.deepEqual(
    resolved.facts.map(fact => fact.activityType),
    ["CONTACT_ATTEMPTED", "CONVERSATION_COMPLETED", "INITIAL_APPOINTMENT_COMPLETED"],
  );
  assert.equal(resolved.exclusions.length, 1);
  assert.equal(resolved.exclusions[0].reason, "PRODUCTIVITY_FACT_NOT_REP_ACTIVITY");
  assert.equal(resolved.boundary.scoringAuthority, false);
});
