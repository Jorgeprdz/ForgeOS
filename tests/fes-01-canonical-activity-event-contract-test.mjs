import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const contract = require(
  "../platform/event-evidence/canonical-activity-event-contract.js",
);

const {
  EVENT_TYPES,
  DEFAULT_SAFETY_FLAGS,
  createCanonicalActivityEvent,
  createCanonicalActivityCorrection,
  deriveCanonicalEventId,
  validateCanonicalActivityEvent,
} = contract;

function baseInput(overrides = {}) {
  return {
    event_type: "PROSPECT_CREATED",
    tenant_id: "tenant-advisor-001",
    actor: {
      type: "SYSTEM",
      id: "forge-system",
    },
    subject: {
      type: "PROSPECT",
      id: "prospect-001",
    },
    source: {
      type: "SYSTEM_OBSERVED",
      reference: "ui-save-001",
      channel: "FORGE_UI",
    },
    evidence_strength: "SYSTEM_OBSERVED",
    occurred_at: "2026-07-25T20:00:00-06:00",
    recorded_at: "2026-07-26T02:00:01.000Z",
    effective_period: null,
    causation_id: null,
    correlation_id: "corr-prospect-001",
    idempotency_key: "prospect-created-001",
    privacy_class: "PRIVATE",
    payload: {
      prospect_reference: "prospect-001",
      source_category: "REFERRAL",
    },
    provenance: {
      source_system: "forge-alive",
      source_record_id: "save-001",
      captured_via: "FORGE_UI",
      evidence_references: ["evidence-ui-save-001"],
    },
    confirmation_state: "CONFIRMED",
    correction_of: null,
    safety_flags: { ...DEFAULT_SAFETY_FLAGS },
    ...overrides,
  };
}

function fixtureFor(eventType, index) {
  const common = {
    tenant_id: "tenant-advisor-001",
    actor: {
      type: "SYSTEM",
      id: "forge-system",
    },
    subject: {
      type: "PROSPECT",
      id: "prospect-001",
    },
    source: {
      type: "SYSTEM_OBSERVED",
      reference: `source-${index}`,
      channel: "FORGE_SYSTEM",
    },
    evidence_strength: "SYSTEM_OBSERVED",
    occurred_at: `2026-07-26T0${Math.min(index, 9)}:00:00.000Z`,
    recorded_at: `2026-07-26T0${Math.min(index, 9)}:00:01.000Z`,
    effective_period: null,
    causation_id: null,
    correlation_id: "corr-first-vertical",
    idempotency_key: `first-vertical-${index}`,
    privacy_class: "PRIVATE",
    provenance: {
      source_system: "fes-01-test",
      source_record_id: `record-${index}`,
      captured_via: "FORGE_SYSTEM",
      evidence_references: [`evidence-${index}`],
    },
    confirmation_state: "CONFIRMED",
    correction_of: null,
    safety_flags: { ...DEFAULT_SAFETY_FLAGS },
  };

  const fixtures = {
    PROSPECT_PROFILE_CREATED: {
      subject: { type: "PROSPECT", id: "prospect-001" },
      payload: { profile_reference: "profile-001" },
    },
    PROSPECT_CREATED: {
      subject: { type: "PROSPECT", id: "prospect-001" },
      payload: {
        prospect_reference: "prospect-001",
        source_category: "REFERRAL",
      },
    },
    INITIAL_CONTEXT_CAPTURED: {
      actor: { type: "ADVISOR", id: "advisor-001" },
      subject: { type: "PROSPECT", id: "prospect-001" },
      source: {
        type: "ADVISOR_REPORTED",
        reference: "context-capture-001",
        channel: "FORGE_UI",
      },
      evidence_strength: "REPORTED",
      confirmation_state: "REPORTED",
      payload: {
        context_reference: "context-001",
        capture_mode: "VOICE",
      },
    },
    TIMELINE_INITIALIZED: {
      subject: { type: "PROSPECT", id: "prospect-001" },
      payload: { timeline_reference: "timeline-001" },
    },
    APPOINTMENT_SCHEDULED: {
      actor: { type: "EXTERNAL_PROVIDER", id: "google-calendar" },
      subject: { type: "APPOINTMENT", id: "appointment-001" },
      source: {
        type: "EXTERNAL_PROVIDER_CONFIRMED",
        reference: "google-event-001",
        channel: "GOOGLE_CALENDAR",
      },
      evidence_strength: "EXTERNAL_CONFIRMED",
      confirmation_state: "CONFIRMED",
      payload: {
        appointment_reference: "appointment-001",
        starts_at: "2026-07-27T16:00:00.000Z",
        ends_at: "2026-07-27T17:00:00.000Z",
        provider_event_reference: "google-event-001",
      },
    },
    APPOINTMENT_HELD: {
      actor: { type: "ADVISOR", id: "advisor-001" },
      subject: { type: "APPOINTMENT", id: "appointment-001" },
      source: {
        type: "ADVISOR_CONFIRMED",
        reference: "probe-response-001",
        channel: "FORGE_UI",
      },
      evidence_strength: "HUMAN_CONFIRMED",
      confirmation_state: "CONFIRMED",
      payload: {
        appointment_reference: "appointment-001",
        outcome_confirmed_at: "2026-07-27T17:30:00.000Z",
      },
    },
    APPOINTMENT_NOT_HELD: {
      actor: { type: "ADVISOR", id: "advisor-001" },
      subject: { type: "APPOINTMENT", id: "appointment-002" },
      source: {
        type: "ADVISOR_CONFIRMED",
        reference: "probe-response-002",
        channel: "FORGE_UI",
      },
      evidence_strength: "HUMAN_CONFIRMED",
      confirmation_state: "CONFIRMED",
      payload: {
        appointment_reference: "appointment-002",
        reason_code: "PROSPECT_CANCELLED",
        outcome_confirmed_at: "2026-07-27T17:30:00.000Z",
      },
    },
    APPOINTMENT_RESCHEDULED: {
      actor: { type: "ADVISOR", id: "advisor-001" },
      subject: { type: "APPOINTMENT", id: "appointment-003" },
      source: {
        type: "ADVISOR_CONFIRMED",
        reference: "probe-response-003",
        channel: "FORGE_UI",
      },
      evidence_strength: "HUMAN_CONFIRMED",
      confirmation_state: "CONFIRMED",
      payload: {
        appointment_reference: "appointment-003",
        previous_starts_at: "2026-07-27T16:00:00.000Z",
        starts_at: "2026-07-28T18:00:00.000Z",
        ends_at: "2026-07-28T19:00:00.000Z",
      },
    },
    APPOINTMENT_NO_SHOW: {
      actor: { type: "ADVISOR", id: "advisor-001" },
      subject: { type: "APPOINTMENT", id: "appointment-004" },
      source: {
        type: "ADVISOR_CONFIRMED",
        reference: "probe-response-004",
        channel: "FORGE_UI",
      },
      evidence_strength: "HUMAN_CONFIRMED",
      confirmation_state: "CONFIRMED",
      payload: {
        appointment_reference: "appointment-004",
        party: "PROSPECT",
        outcome_confirmed_at: "2026-07-27T17:30:00.000Z",
      },
    },
    ACTIVITY_CONTEXT_ADDED: {
      actor: { type: "ADVISOR", id: "advisor-001" },
      subject: { type: "ACTIVITY", id: "activity-001" },
      source: {
        type: "ADVISOR_REPORTED",
        reference: "context-add-001",
        channel: "FORGE_UI",
      },
      evidence_strength: "REPORTED",
      confirmation_state: "REPORTED",
      payload: {
        activity_reference: "activity-001",
        context_reference: "context-002",
        capture_mode: "TEXT",
      },
    },
    REFERRAL_RECEIVED: {
      subject: { type: "ACTIVITY", id: "activity-referral-001" },
      payload: { activity_reference: "activity-referral-001", referral_reference: "referral-001", prospect_reference: "prospect-001" },
    },
    CALL_COMPLETED: {
      subject: { type: "ACTIVITY", id: "activity-call-001" },
      payload: { activity_reference: "activity-call-001", contact_reference: "contact-001", prospect_reference: "prospect-001" },
    },
    ADVISOR_REFERRAL_RECEIVED: {
      subject: { type: "ACTIVITY", id: "activity-advisor-referral-001" },
      payload: { activity_reference: "activity-advisor-referral-001", referred_advisor_reference: "advisor-002" },
    },
    DUE_ACTION_CREATED: {
      subject: { type: "DUE_ACTION", id: "due-action-001" },
      source: {
        type: "SYSTEM_OBSERVED",
        reference: "pipeline-command-001",
        channel: "PIPELINE",
      },
      payload: {
        due_action_reference: "due-action-001",
        action_type: "CALL",
        due_at: "2026-07-29T16:00:00.000Z",
      },
    },
    DUE_ACTION_RESCHEDULED: {
      subject: { type: "DUE_ACTION", id: "due-action-001" },
      source: {
        type: "SYSTEM_OBSERVED",
        reference: "pipeline-command-002",
        channel: "PIPELINE",
      },
      payload: {
        due_action_reference: "due-action-001",
        previous_due_at: "2026-07-29T16:00:00.000Z",
        due_at: "2026-07-30T16:00:00.000Z",
      },
    },
    DUE_ACTION_COMPLETED: {
      subject: { type: "DUE_ACTION", id: "due-action-001" },
      source: {
        type: "SYSTEM_OBSERVED",
        reference: "pipeline-command-003",
        channel: "PIPELINE",
      },
      payload: {
        due_action_reference: "due-action-001",
        completed_at: "2026-07-30T16:15:00.000Z",
      },
    },
    SALES_NBA_ADVISOR_RESPONSE: {
      actor: { type: "ADVISOR", id: "tenant-advisor-001" },
      subject: { type: "RECOMMENDATION", id: "NBA_fixture-001" },
      source: { type: "ADVISOR_CONFIRMED", reference: "decision-fixture-001", channel: "FORGE_UI" },
      evidence_strength: "HUMAN_CONFIRMED",
      confirmation_state: "CONFIRMED",
      payload: { recommendation_reference: "NBA_fixture-001", recommendation_source: "NBA_REASON_WHY", recommendation_domain: "ADVISOR_OS_SALES", advisor_reference: "tenant-advisor-001", decision: "ACCEPTED", original_response: "ACCEPTED" },
    },
  };

  return {
    event_type: eventType,
    ...common,
    ...fixtures[eventType],
  };
}

test("manual Activity preserves structured context without executing its next action", () => {
  const event = createCanonicalActivityEvent(baseInput({
    event_type: "ACTIVITY_CONTEXT_ADDED",
    actor: { type: "ADVISOR", id: "advisor-001" },
    subject: { type: "ACTIVITY", id: "activity-manual-001" },
    source: { type: "ADVISOR_CONFIRMED", reference: "manual-activity-001", channel: "FORGE_UI" },
    evidence_strength: "HUMAN_CONFIRMED",
    confirmation_state: "CONFIRMED",
    idempotency_key: "manual-activity-001",
    payload: {
      activity_reference: "activity-manual-001",
      context_reference: "person-001",
      capture_mode: "MANUAL_CONFIRMED",
      related_reference: "person-001",
      activity_type: "CONTACT",
      channel: "PHONE",
      occurred_at: "2026-08-04T15:00:00.000Z",
      outcome_code: "COMPLETED",
      notes: "La persona pidió revisar la propuesta el jueves.",
      commercial_stage: "FOLLOW_UP",
      next_action: "Revisar la propuesta con la persona",
      follow_up_at: "2026-08-06T15:00:00.000Z",
    },
  }));
  assert.equal(event.payload.next_action, "Revisar la propuesta con la persona");
  assert.equal(event.payload.follow_up_at, "2026-08-06T15:00:00.000Z");
  assert.equal(event.safety_flags.executes_business_action, false);
  assert.equal(event.safety_flags.mutates_external_provider, false);
  assert.equal(event.safety_flags.cross_tenant_data, false);
});

test("FES 01 exposes every governed event type including advisor response evidence", () => {
  assert.equal(EVENT_TYPES.length, 17);
  assert.deepEqual(EVENT_TYPES, [
    "PROSPECT_PROFILE_CREATED",
    "PROSPECT_CREATED",
    "INITIAL_CONTEXT_CAPTURED",
    "TIMELINE_INITIALIZED",
    "APPOINTMENT_SCHEDULED",
    "APPOINTMENT_HELD",
    "APPOINTMENT_NOT_HELD",
    "APPOINTMENT_RESCHEDULED",
    "APPOINTMENT_NO_SHOW",
    "ACTIVITY_CONTEXT_ADDED",
    "REFERRAL_RECEIVED",
    "CALL_COMPLETED",
    "ADVISOR_REFERRAL_RECEIVED",
    "DUE_ACTION_CREATED",
    "DUE_ACTION_RESCHEDULED",
    "DUE_ACTION_COMPLETED",
    "SALES_NBA_ADVISOR_RESPONSE",
  ]);
});

test("FES 01 creates a canonical deterministic prospect event", () => {
  const event = createCanonicalActivityEvent(baseInput());

  assert.equal(event.schema_version, "forge.activity_event.v1");
  assert.equal(
    event.event_id,
    deriveCanonicalEventId({
      tenant_id: "tenant-advisor-001",
      event_type: "PROSPECT_CREATED",
      idempotency_key: "prospect-created-001",
    }),
  );
  assert.equal(event.occurred_at, "2026-07-26T02:00:00.000Z");
  assert.equal(event.recorded_at, "2026-07-26T02:00:01.000Z");
  assert.equal(event.learning_eligibility, false);
  assert.deepEqual(event.safety_flags, DEFAULT_SAFETY_FLAGS);
});

test("FES 01 creates identical IDs for idempotent replay", () => {
  const left = createCanonicalActivityEvent(baseInput());
  const right = createCanonicalActivityEvent(baseInput());

  assert.equal(left.event_id, right.event_id);
  assert.deepEqual(left, right);
});

test("FES 01 binds identity to the tenant", () => {
  const left = createCanonicalActivityEvent(baseInput());
  const right = createCanonicalActivityEvent(
    baseInput({
      tenant_id: "tenant-advisor-002",
    }),
  );

  assert.notEqual(left.event_id, right.event_id);
});

test("FES 01 validates every event in the first vertical", async t => {
  for (const [index, eventType] of EVENT_TYPES.entries()) {
    await t.test(eventType, () => {
      const event = createCanonicalActivityEvent(
        fixtureFor(eventType, index + 1),
      );
      const report = validateCanonicalActivityEvent(event);

      assert.equal(event.event_type, eventType);
      assert.equal(report.valid, true);
      assert.deepEqual(report.errors, []);
    });
  }
});

test("FES 01 rejects unsupported event fields", () => {
  assert.throws(
    () =>
      createCanonicalActivityEvent(
        baseInput({
          execute: true,
        }),
      ),
    error =>
      error.code === "CANONICAL_EVENT_FIELDS_INVALID" &&
      error.details.unsupportedKeys.includes("execute"),
  );
});

test("FES 01 requires explicit source and evidence strength", () => {
  assert.throws(
    () =>
      createCanonicalActivityEvent(
        baseInput({
          source: undefined,
        }),
      ),
    error => error.code === "SOURCE_INVALID",
  );

  assert.throws(
    () =>
      createCanonicalActivityEvent(
        baseInput({
          evidence_strength: undefined,
        }),
      ),
    error => error.code === "EVIDENCE_STRENGTH_INVALID",
  );
});

test("FES 01 rejects source and evidence mismatch", () => {
  assert.throws(
    () =>
      createCanonicalActivityEvent(
        baseInput({
          source: {
            type: "EXTERNAL_HANDOFF_OBSERVED",
            reference: "calendar-link-opened",
            channel: "GOOGLE_CALENDAR",
          },
          evidence_strength: "EXTERNAL_CONFIRMED",
        }),
      ),
    error => error.code === "SOURCE_EVIDENCE_MISMATCH",
  );
});

test("FES 01 distinguishes external handoff from provider confirmation", () => {
  const handoff = createCanonicalActivityEvent(
    fixtureFor("APPOINTMENT_SCHEDULED", 5),
  );

  const observedHandoff = createCanonicalActivityEvent({
    ...fixtureFor("APPOINTMENT_SCHEDULED", 5),
    idempotency_key: "appointment-handoff-only",
    actor: {
      type: "SYSTEM",
      id: "forge-system",
    },
    source: {
      type: "EXTERNAL_HANDOFF_OBSERVED",
      reference: "calendar-template-opened",
      channel: "GOOGLE_CALENDAR",
    },
    evidence_strength: "SYSTEM_OBSERVED",
    confirmation_state: "CONFIRMED",
    payload: {
      appointment_reference: "appointment-handoff-001",
      starts_at: "2026-07-27T16:00:00.000Z",
      ends_at: "2026-07-27T17:00:00.000Z",
      provider_event_reference: null,
    },
  });

  assert.equal(handoff.evidence_strength, "EXTERNAL_CONFIRMED");
  assert.equal(observedHandoff.evidence_strength, "SYSTEM_OBSERVED");
  assert.notEqual(handoff.event_id, observedHandoff.event_id);
});

test("FES 01 rejects recorded time before occurrence", () => {
  assert.throws(
    () =>
      createCanonicalActivityEvent(
        baseInput({
          recorded_at: "2026-07-26T01:59:59.000Z",
        }),
      ),
    error => error.code === "EVENT_TIME_ORDER_INVALID",
  );
});

test("FES 01 rejects invalid effective periods", () => {
  assert.throws(
    () =>
      createCanonicalActivityEvent(
        baseInput({
          effective_period: {
            start_at: "2026-08-01T00:00:00.000Z",
            end_at: "2026-07-31T23:59:59.000Z",
          },
        }),
      ),
    error => error.code === "EFFECTIVE_PERIOD_ORDER_INVALID",
  );
});

test("FES 01 enforces event-specific payload allowlists", () => {
  assert.throws(
    () =>
      createCanonicalActivityEvent(
        baseInput({
          payload: {
            prospect_reference: "prospect-001",
            source_category: "REFERRAL",
            phone: "5555555555",
          },
        }),
      ),
    error => error.code === "PAYLOAD_PROHIBITED_FIELDS",
  );

  assert.throws(
    () =>
      createCanonicalActivityEvent(
        baseInput({
          payload: {
            prospect_reference: "prospect-001",
            source_category: "REFERRAL",
            unrelated_field: "x",
          },
        }),
      ),
    error => error.code === "PAYLOAD_FIELDS_INVALID",
  );
});

test("FES 01 defaults learning eligibility to false and blocks promotion", () => {
  const event = createCanonicalActivityEvent({
    ...baseInput(),
    learning_eligibility: undefined,
  });

  assert.equal(event.learning_eligibility, false);

  assert.throws(
    () =>
      createCanonicalActivityEvent(
        baseInput({
          learning_eligibility: true,
        }),
      ),
    error => error.code === "LEARNING_ELIGIBILITY_NOT_AUTHORIZED",
  );
});

test("FES 01 blocks all execution and cross-tenant safety flags", () => {
  for (const flag of Object.keys(DEFAULT_SAFETY_FLAGS)) {
    assert.throws(
      () =>
        createCanonicalActivityEvent(
          baseInput({
            safety_flags: {
              ...DEFAULT_SAFETY_FLAGS,
              [flag]: true,
            },
          }),
        ),
      error =>
        error.code === "SAFETY_FLAG_NOT_AUTHORIZED" &&
        error.details.flag === flag,
    );
  }
});

test("FES 01 requires human or provider confirmation for appointment outcomes", () => {
  assert.throws(
    () =>
      createCanonicalActivityEvent({
        ...fixtureFor("APPOINTMENT_HELD", 6),
        source: {
          type: "SYSTEM_OBSERVED",
          reference: "appointment-ended-clock",
          channel: "FORGE_SYSTEM",
        },
        evidence_strength: "SYSTEM_OBSERVED",
        confirmation_state: "CONFIRMED",
      }),
    error =>
      error.code === "APPOINTMENT_OUTCOME_CONFIRMATION_REQUIRED",
  );
});

test("FES 01 appends corrections without rewriting the original event", () => {
  const original = createCanonicalActivityEvent(baseInput());
  const correction = createCanonicalActivityCorrection(original, {
    actor: {
      type: "ADVISOR",
      id: "advisor-001",
    },
    source: {
      type: "ADVISOR_CONFIRMED",
      reference: "correction-review-001",
      channel: "FORGE_UI",
    },
    evidence_strength: "HUMAN_CONFIRMED",
    occurred_at: "2026-07-26T03:00:00.000Z",
    recorded_at: "2026-07-26T03:00:01.000Z",
    idempotency_key: "prospect-created-correction-001",
    privacy_class: "PRIVATE",
    payload: {
      prospect_reference: "prospect-001",
      source_category: "MARKET_NATURAL",
    },
    provenance: {
      source_system: "forge-alive",
      source_record_id: "correction-save-001",
      captured_via: "FORGE_UI",
      evidence_references: ["evidence-correction-001"],
    },
    correction_reason_code: "SOURCE_CATEGORY_CORRECTED",
  });

  assert.notEqual(correction.event_id, original.event_id);
  assert.equal(correction.correction_of, original.event_id);
  assert.equal(
    correction.provenance.correction_reason_code,
    "SOURCE_CATEGORY_CORRECTED",
  );
  assert.equal(original.payload.source_category, "REFERRAL");
  assert.equal(correction.payload.source_category, "MARKET_NATURAL");
});

test("FES 01 output is deeply immutable", () => {
  const event = createCanonicalActivityEvent(baseInput());

  assert.equal(Object.isFrozen(event), true);
  assert.equal(Object.isFrozen(event.actor), true);
  assert.equal(Object.isFrozen(event.payload), true);
  assert.equal(Object.isFrozen(event.provenance), true);
  assert.equal(
    Object.isFrozen(event.provenance.evidence_references),
    true,
  );
  assert.equal(Object.isFrozen(event.safety_flags), true);

  assert.throws(() => {
    event.payload.source_category = "OTHER";
  }, TypeError);
});

test("FES 01 validation detects non-canonical or tampered records", () => {
  const event = createCanonicalActivityEvent(baseInput());
  const serialized = JSON.parse(JSON.stringify(event));

  assert.equal(
    validateCanonicalActivityEvent(serialized).valid,
    true,
  );

  serialized.event_id = "evt_00000000000000000000000000000000";
  const report = validateCanonicalActivityEvent(serialized);

  assert.equal(report.valid, false);
  assert.equal(report.errors[0].code, "EVENT_ID_MISMATCH");
  assert.equal(Object.isFrozen(report), true);
  assert.equal(Object.isFrozen(report.errors), true);
});
