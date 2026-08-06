import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import {
  REPORTABLE_ACTIVITY_TYPES,
  mapCanonicalEventToActivity,
  resolveCountableActivityFacts,
} from "../advisor-os/reporting/domain/activity-event-authority-mapping.mjs";

function event(eventType, payload, overrides = {}) {
  return {
    schema_version: "forge.activity_event.v1",
    event_id: overrides.event_id || `evt-${eventType.toLowerCase()}`,
    event_type: eventType,
    tenant_id: "advisor-1",
    actor: { type: "ADVISOR", id: "advisor-1" },
    idempotency_key: overrides.idempotency_key || `idem-${eventType.toLowerCase()}`,
    occurred_at: "2026-08-06T14:00:00.000Z",
    recorded_at: "2026-08-06T14:01:00.000Z",
    confirmation_state: overrides.confirmation_state || "CONFIRMED",
    correction_of: null,
    payload,
  };
}

test("recognizes the three FES-01.2 direct Activity facts", () => {
  const cases = [
    ["REFERRAL_RECEIVED", { activity_reference: "activity-1", referral_reference: "ref-1" }],
    ["CALL_COMPLETED", { activity_reference: "activity-2", contact_reference: "contact-1" }],
    ["ADVISOR_REFERRAL_RECEIVED", { activity_reference: "activity-3", referred_advisor_reference: "advisor-2" }],
  ];

  for (const [eventType, payload] of cases) {
    assert.ok(REPORTABLE_ACTIVITY_TYPES.includes(eventType));
    const mapped = mapCanonicalEventToActivity(event(eventType, payload));
    assert.equal(mapped.status, "COUNTABLE");
    assert.deepEqual(mapped.activityTypes, [eventType]);
  }

  const resolved = resolveCountableActivityFacts(cases.map(([type, payload], index) =>
    event(type, payload, { event_id: `evt-${index}`, idempotency_key: `idem-${index}` })
  ));
  assert.deepEqual(
    resolved.facts.map((fact) => fact.activityType),
    ["REFERRAL_RECEIVED", "CALL_COMPLETED", "ADVISOR_REFERRAL_RECEIVED"],
  );
});

test("uses governed appointment_purpose and preserves unknown purpose", () => {
  const closing = mapCanonicalEventToActivity(event("APPOINTMENT_HELD", {
    appointment_reference: "appointment-1",
    outcome_confirmed_at: "2026-08-06T14:00:00.000Z",
    appointment_purpose: "CLOSING",
  }), {
    classifyAppointment: (value) => value.payload.appointment_purpose || null,
  });
  assert.equal(closing.activityType, "CLOSING_APPOINTMENT_COMPLETED");

  const unknown = mapCanonicalEventToActivity(event("APPOINTMENT_HELD", {
    appointment_reference: "appointment-2",
    outcome_confirmed_at: "2026-08-06T14:00:00.000Z",
  }), {
    classifyAppointment: (value) => value.payload.appointment_purpose || null,
  });
  assert.equal(unknown.status, "REQUIRES_DOMAIN_CONTEXT");
  assert.equal(unknown.activityType, null);
});

test("productive bridge binds the canonical appointment purpose classifier", async () => {
  const source = await readFile(
    new URL("../docs/static-preview/forge-alive-material3/activity-ledger-reporting-bridge.mjs", import.meta.url),
    "utf8",
  );
  assert.match(source, /classifyCanonicalAppointment/);
  assert.match(source, /appointment_purpose/);
  assert.match(source, /classifyAppointment:\s*classifyCanonicalAppointment/);
  assert.doesNotMatch(source, /purpose\s*\|\|\s*["']INITIAL["']/);
});

console.log("FES_01_2_REPORTING_CONVERGENCE=PASS");
console.log("APPOINTMENT_PURPOSE_UNKNOWN_PRESERVED=PASS");
