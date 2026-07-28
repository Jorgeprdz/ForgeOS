import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const canonical = require(
  "../platform/event-evidence/canonical-activity-event-contract.js",
);
const ledger = require(
  "../platform/event-evidence/activity-ledger-contract.js",
);
const timelineContract = require(
  "../platform/event-evidence/canonical-activity-timeline-contract.js",
);
const pipelineCard = require(
  "../platform/event-evidence/pipeline-card-projection.js",
);

const {
  DEFAULT_SAFETY_FLAGS,
  createCanonicalActivityEvent,
  createCanonicalActivityCorrection,
} = canonical;

const {
  createLedgerRecord,
} = ledger;

const {
  createCanonicalActivityTimeline,
} = timelineContract;

const {
  PROJECTION_CONTRACT_VERSION,
  PROJECTION_VERSION,
  STAGE_CODES,
  STAGE_PRESENTATION,
  MILESTONE_EVENT_TO_STAGE,
  ATTENTION_CODES,
  derivePipelineCardProjectionId,
  createPipelineCardProjection,
  assertPipelineCardProjection,
  validatePipelineCardProjection,
  rebuildPipelineCardProjection,
} = pipelineCard;

const TENANT = "tenant-advisor-001";
const CORRELATION = "corr-first-vertical-001";
const TIMELINE_REFERENCE = "timeline-001";
const PROSPECT_ID = "prospect-001";

function iso(hour, second = 0) {
  return `2026-07-26T${String(hour).padStart(2, "0")}:00:${String(
    second,
  ).padStart(2, "0")}.000Z`;
}

function eventInput(eventType, index, overrides = {}) {
  const common = {
    event_type: eventType,
    tenant_id: TENANT,
    actor: {
      type: "SYSTEM",
      id: "forge-system",
    },
    subject: {
      type: "PROSPECT",
      id: PROSPECT_ID,
    },
    source: {
      type: "SYSTEM_OBSERVED",
      reference: `source-${index}`,
      channel: "FORGE_SYSTEM",
    },
    evidence_strength: "SYSTEM_OBSERVED",
    occurred_at: iso(index),
    recorded_at: iso(index, 1),
    effective_period: null,
    causation_id: null,
    correlation_id: CORRELATION,
    idempotency_key: `fes03e-${eventType.toLowerCase()}-${index}`,
    privacy_class: "PRIVATE",
    learning_eligibility: false,
    provenance: {
      source_system: "fes-03e-test",
      source_record_id: `source-record-${index}`,
      captured_via: "FORGE_SYSTEM",
      evidence_references: [`evidence-${index}`],
    },
    confirmation_state: "CONFIRMED",
    correction_of: null,
    safety_flags: {
      ...DEFAULT_SAFETY_FLAGS,
    },
  };

  const fixtures = {
    TIMELINE_INITIALIZED: {
      payload: {
        timeline_reference: TIMELINE_REFERENCE,
      },
    },
    PROSPECT_CREATED: {
      payload: {
        prospect_reference: PROSPECT_ID,
        source_category: "REFERRAL",
      },
    },
    INITIAL_CONTEXT_CAPTURED: {
      actor: {
        type: "ADVISOR",
        id: "advisor-001",
      },
      source: {
        type: "ADVISOR_REPORTED",
        reference: `context-${index}`,
        channel: "FORGE_UI",
      },
      evidence_strength: "REPORTED",
      confirmation_state: "REPORTED",
      payload: {
        context_reference: "context-001",
        capture_mode: "VOICE",
      },
    },
    ACTIVITY_CONTEXT_ADDED: {
      actor: {
        type: "ADVISOR",
        id: "advisor-001",
      },
      subject: {
        type: "ACTIVITY",
        id: "activity-001",
      },
      source: {
        type: "ADVISOR_REPORTED",
        reference: `activity-context-${index}`,
        channel: "FORGE_UI",
      },
      evidence_strength: "REPORTED",
      confirmation_state: "REPORTED",
      payload: {
        activity_reference: "activity-001",
        context_reference: "context-activity-001",
        capture_mode: "TEXT",
      },
    },
    APPOINTMENT_SCHEDULED: {
      actor: {
        type: "EXTERNAL_PROVIDER",
        id: "google-calendar",
      },
      subject: {
        type: "APPOINTMENT",
        id: "appointment-001",
      },
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
      actor: {
        type: "ADVISOR",
        id: "advisor-001",
      },
      subject: {
        type: "APPOINTMENT",
        id: "appointment-001",
      },
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
      actor: {
        type: "ADVISOR",
        id: "advisor-001",
      },
      subject: {
        type: "APPOINTMENT",
        id: "appointment-001",
      },
      source: {
        type: "ADVISOR_CONFIRMED",
        reference: "probe-response-002",
        channel: "FORGE_UI",
      },
      evidence_strength: "HUMAN_CONFIRMED",
      confirmation_state: "CONFIRMED",
      payload: {
        appointment_reference: "appointment-001",
        reason_code: "PROSPECT_CANCELLED",
        outcome_confirmed_at: "2026-07-27T17:30:00.000Z",
      },
    },
    APPOINTMENT_RESCHEDULED: {
      actor: {
        type: "ADVISOR",
        id: "advisor-001",
      },
      subject: {
        type: "APPOINTMENT",
        id: "appointment-001",
      },
      source: {
        type: "ADVISOR_CONFIRMED",
        reference: "probe-response-003",
        channel: "FORGE_UI",
      },
      evidence_strength: "HUMAN_CONFIRMED",
      confirmation_state: "CONFIRMED",
      payload: {
        appointment_reference: "appointment-001",
        previous_starts_at: "2026-07-27T16:00:00.000Z",
        starts_at: "2026-07-28T18:00:00.000Z",
        ends_at: "2026-07-28T19:00:00.000Z",
      },
    },
    APPOINTMENT_NO_SHOW: {
      actor: {
        type: "ADVISOR",
        id: "advisor-001",
      },
      subject: {
        type: "APPOINTMENT",
        id: "appointment-001",
      },
      source: {
        type: "ADVISOR_CONFIRMED",
        reference: "probe-response-004",
        channel: "FORGE_UI",
      },
      evidence_strength: "HUMAN_CONFIRMED",
      confirmation_state: "CONFIRMED",
      payload: {
        appointment_reference: "appointment-001",
        party: "PROSPECT",
        outcome_confirmed_at: "2026-07-27T17:30:00.000Z",
      },
    },
    DUE_ACTION_CREATED: {
      subject: {
        type: "DUE_ACTION",
        id: "due-action-001",
      },
      source: {
        type: "SYSTEM_OBSERVED",
        reference: `due-action-${index}`,
        channel: "PIPELINE",
      },
      payload: {
        due_action_reference: "due-action-001",
        action_type: "CALL",
        due_at: "2026-08-01T16:00:00.000Z",
      },
    },
    DUE_ACTION_RESCHEDULED: {
      subject: {
        type: "DUE_ACTION",
        id: "due-action-001",
      },
      source: {
        type: "SYSTEM_OBSERVED",
        reference: `due-action-${index}`,
        channel: "PIPELINE",
      },
      payload: {
        due_action_reference: "due-action-001",
        previous_due_at: "2026-08-01T16:00:00.000Z",
        due_at: "2026-08-02T16:00:00.000Z",
      },
    },
    DUE_ACTION_COMPLETED: {
      subject: {
        type: "DUE_ACTION",
        id: "due-action-001",
      },
      source: {
        type: "SYSTEM_OBSERVED",
        reference: `due-action-${index}`,
        channel: "PIPELINE",
      },
      payload: {
        due_action_reference: "due-action-001",
        completed_at: "2026-08-02T17:00:00.000Z",
      },
    },
  };

  return {
    ...common,
    ...fixtures[eventType],
    ...overrides,
  };
}

function createEvent(eventType, index, overrides = {}) {
  return createCanonicalActivityEvent(
    eventInput(eventType, index, overrides),
  );
}

function recordFor(event) {
  return createLedgerRecord({
    canonical_event: event,
    evidence_references: [],
    appended_at: new Date(
      Date.parse(event.recorded_at) + 1000,
    ).toISOString(),
  });
}

function timelineFor(events) {
  return createCanonicalActivityTimeline({
    tenant_id: TENANT,
    correlation_id: CORRELATION,
    ledger_records: events.map(recordFor),
  });
}

function baseEvents() {
  return [
    createEvent("TIMELINE_INITIALIZED", 0),
    createEvent("PROSPECT_CREATED", 1),
  ];
}

function dueCorrection(
  original,
  index,
  key,
  dueAt,
) {
  return createCanonicalActivityCorrection(
    original,
    {
      actor: {
        type: "ADVISOR",
        id: "advisor-001",
      },
      source: {
        type: "ADVISOR_CONFIRMED",
        reference: key,
        channel: "FORGE_UI",
      },
      evidence_strength: "HUMAN_CONFIRMED",
      occurred_at: iso(index),
      recorded_at: iso(index, 1),
      idempotency_key: key,
      privacy_class: "PRIVATE",
      payload: {
        due_action_reference: "due-action-001",
        action_type: "CALL",
        due_at: dueAt,
      },
      provenance: {
        source_system: "fes-03e-test",
        source_record_id: key,
        captured_via: "FORGE_UI",
        evidence_references: [`evidence-${key}`],
      },
      correction_reason_code:
        "ADVISOR_CORRECTED_DATE",
      confirmation_state: "CONFIRMED",
      safety_flags: {
        ...DEFAULT_SAFETY_FLAGS,
      },
    },
  );
}

test("FES 03E exposes locked card contracts", () => {
  assert.equal(PROJECTION_CONTRACT_VERSION, "FES-03E.1");
  assert.equal(
    PROJECTION_VERSION,
    "forge.pipeline_card_projection.v1",
  );
  assert.equal(STAGE_CODES.length, 7);
  assert.deepEqual(
    Object.keys(STAGE_PRESENTATION).sort(),
    [...STAGE_CODES].sort(),
  );
  assert.equal(
    Object.keys(MILESTONE_EVENT_TO_STAGE).length,
    7,
  );
  assert.deepEqual(ATTENTION_CODES, [
    "NONE",
    "PENDING_CONFIRMATION",
    "DUE_FOLLOW_UP_PRESENT",
    "APPOINTMENT_OUTCOME_PENDING",
    "CONFLICT_REVIEW_REQUIRED",
  ]);
});

test("FES 03E projects new prospect stage", () => {
  const projection = createPipelineCardProjection({
    timeline: timelineFor(baseEvents()),
  });

  assert.equal(projection.stage.code, "NEW_PROSPECT");
  assert.equal(projection.stage.label, "Prospecto nuevo");
  assert.equal(projection.operational_status, "CLEAR");
});

test("FES 03E projects initial context without letting later notes regress stage", () => {
  const projection = createPipelineCardProjection({
    timeline: timelineFor([
      ...baseEvents(),
      createEvent("INITIAL_CONTEXT_CAPTURED", 2),
      createEvent("ACTIVITY_CONTEXT_ADDED", 3),
    ]),
  });

  assert.equal(projection.stage.code, "CONTEXT_CAPTURED");
  assert.equal(
    projection.last_activity.event_type,
    "ACTIVITY_CONTEXT_ADDED",
  );
});

test("FES 03E projects scheduled appointment and pending outcome", () => {
  const projection = createPipelineCardProjection({
    timeline: timelineFor([
      ...baseEvents(),
      createEvent("APPOINTMENT_SCHEDULED", 2),
    ]),
  });

  assert.equal(
    projection.stage.code,
    "APPOINTMENT_SCHEDULED",
  );
  assert.equal(
    projection.appointment.status,
    "SCHEDULED",
  );
  assert.equal(
    projection.pending_outcome.state,
    "APPOINTMENT_OUTCOME_PENDING",
  );
  assert.equal(
    projection.primary_attention,
    "APPOINTMENT_OUTCOME_PENDING",
  );
});

test("FES 03E projects appointment held and clears pending outcome", () => {
  const projection = createPipelineCardProjection({
    timeline: timelineFor([
      ...baseEvents(),
      createEvent("APPOINTMENT_SCHEDULED", 2),
      createEvent("APPOINTMENT_HELD", 3),
    ]),
  });

  assert.equal(
    projection.stage.code,
    "APPOINTMENT_HELD",
  );
  assert.equal(
    projection.appointment.status,
    "HELD",
  );
  assert.equal(
    projection.pending_outcome.state,
    "NONE",
  );
});

test("FES 03E projects not-held, rescheduled and no-show stages", () => {
  const cases = [
    [
      "APPOINTMENT_NOT_HELD",
      "APPOINTMENT_NOT_HELD",
    ],
    [
      "APPOINTMENT_RESCHEDULED",
      "APPOINTMENT_RESCHEDULED",
    ],
    [
      "APPOINTMENT_NO_SHOW",
      "APPOINTMENT_NO_SHOW",
    ],
  ];

  for (const [eventType, stage] of cases) {
    const projection =
      createPipelineCardProjection({
        timeline: timelineFor([
          ...baseEvents(),
          createEvent(eventType, 2),
        ]),
      });

    assert.equal(projection.stage.code, stage);
  }
});

test("FES 03E keeps due-action events from changing milestone stage", () => {
  const projection = createPipelineCardProjection({
    timeline: timelineFor([
      ...baseEvents(),
      createEvent("INITIAL_CONTEXT_CAPTURED", 2),
      createEvent("DUE_ACTION_CREATED", 3),
    ]),
  });

  assert.equal(
    projection.stage.code,
    "CONTEXT_CAPTURED",
  );
  assert.equal(
    projection.last_activity.event_type,
    "DUE_ACTION_CREATED",
  );
});

test("FES 03E projects latest Activity item with source and confirmation", () => {
  const timeline = timelineFor([
    ...baseEvents(),
    createEvent("DUE_ACTION_CREATED", 2),
  ]);
  const projection = createPipelineCardProjection({
    timeline,
  });

  assert.equal(
    projection.last_activity.event_type,
    "DUE_ACTION_CREATED",
  );
  assert.deepEqual(
    projection.last_activity.source,
    {
      type: "SYSTEM_OBSERVED",
      reference: "due-action-2",
      channel: "PIPELINE",
    },
  );
  assert.equal(
    projection.last_activity.confirmation_state,
    "CONFIRMED",
  );
});

test("FES 03E selects the latest appointment by canonical event position", () => {
  const first = createEvent(
    "APPOINTMENT_SCHEDULED",
    2,
  );
  const second = createEvent(
    "APPOINTMENT_NO_SHOW",
    3,
    {
      subject: {
        type: "APPOINTMENT",
        id: "appointment-002",
      },
      idempotency_key:
        "appointment-two-no-show",
      payload: {
        appointment_reference:
          "appointment-002",
        party: "PROSPECT",
        outcome_confirmed_at:
          "2026-07-28T17:30:00.000Z",
      },
    },
  );
  const projection = createPipelineCardProjection({
    timeline: timelineFor([
      ...baseEvents(),
      first,
      second,
    ]),
  });

  assert.equal(
    projection.appointment
      .appointment_reference,
    "appointment-002",
  );
  assert.equal(
    projection.appointment.status,
    "NO_SHOW",
  );
});

test("FES 03E projects earliest open due follow-up", () => {
  const later = createEvent(
    "DUE_ACTION_CREATED",
    2,
  );
  const earlier = createEvent(
    "DUE_ACTION_CREATED",
    3,
    {
      subject: {
        type: "DUE_ACTION",
        id: "due-action-002",
      },
      idempotency_key:
        "due-action-earlier",
      payload: {
        due_action_reference:
          "due-action-002",
        action_type: "MESSAGE",
        due_at:
          "2026-07-31T16:00:00.000Z",
      },
    },
  );
  const projection = createPipelineCardProjection({
    timeline: timelineFor([
      ...baseEvents(),
      later,
      earlier,
    ]),
  });

  assert.equal(
    projection.due_follow_up
      .due_action_reference,
    "due-action-002",
  );
  assert.equal(
    projection.primary_attention,
    "DUE_FOLLOW_UP_PRESENT",
  );
});

test("FES 03E removes completed due action from compact follow-up", () => {
  const projection = createPipelineCardProjection({
    timeline: timelineFor([
      ...baseEvents(),
      createEvent("DUE_ACTION_CREATED", 2),
      createEvent("DUE_ACTION_COMPLETED", 3),
    ]),
  });

  assert.equal(projection.due_follow_up, null);
});

test("FES 03E preserves all attention reasons with deterministic priority", () => {
  const projection = createPipelineCardProjection({
    timeline: timelineFor([
      ...baseEvents(),
      createEvent("INITIAL_CONTEXT_CAPTURED", 2),
      createEvent("APPOINTMENT_SCHEDULED", 3),
      createEvent("DUE_ACTION_CREATED", 4),
    ]),
  });

  assert.deepEqual(
    projection.attention_reasons.map(
      item => item.code,
    ),
    [
      "APPOINTMENT_OUTCOME_PENDING",
      "DUE_FOLLOW_UP_PRESENT",
      "PENDING_CONFIRMATION",
    ],
  );
  assert.equal(
    projection.primary_attention,
    "APPOINTMENT_OUTCOME_PENDING",
  );
  assert.equal(
    projection.operational_status,
    "REQUIRES_ATTENTION",
  );
});

test("FES 03E promotes correction forks to blocking conflict", () => {
  const original =
    createEvent("DUE_ACTION_CREATED", 2);
  const left = dueCorrection(
    original,
    3,
    "pipeline-card-left",
    "2026-08-04T16:00:00.000Z",
  );
  const right = dueCorrection(
    original,
    4,
    "pipeline-card-right",
    "2026-08-05T16:00:00.000Z",
  );
  const projection = createPipelineCardProjection({
    timeline: timelineFor([
      ...baseEvents(),
      original,
      left,
      right,
    ]),
  });

  assert.equal(
    projection.conflict.state,
    "CONFLICT_REVIEW_REQUIRED",
  );
  assert.equal(
    projection.primary_attention,
    "CONFLICT_REVIEW_REQUIRED",
  );
  assert.equal(
    projection.operational_status,
    "BLOCKED_BY_CONFLICT",
  );
  assert.equal(projection.stage.code, null);
  assert.equal(projection.due_follow_up, null);
});

test("FES 03E does not invent name, phone, income, product or recommendation", () => {
  const projection = createPipelineCardProjection({
    timeline: timelineFor(baseEvents()),
  });
  const serialized = JSON.stringify(projection);

  for (const forbidden of [
    "full_name",
    "phone",
    "estimated_income",
    "recommended_product",
    "recommendation",
  ]) {
    assert.equal(
      serialized.includes(forbidden),
      false,
    );
  }
});

test("FES 03E derives stable card identity from tenant and prospect", () => {
  const timeline = timelineFor(baseEvents());
  const projection = createPipelineCardProjection({
    timeline,
  });
  const expected = derivePipelineCardProjectionId({
    tenant_id: TENANT,
    prospect_id: PROSPECT_ID,
  });

  assert.equal(projection.projection_id, expected);
  assert.match(
    projection.projection_id,
    /^pc_[a-f0-9]{32}$/,
  );
});

test("FES 03E keeps source authority explicit", () => {
  const projection = createPipelineCardProjection({
    timeline: timelineFor(baseEvents()),
  });

  assert.equal(
    projection.source_prospect_detail_version,
    "forge.prospect_detail_projection.v1",
  );
  assert.match(
    projection.source_prospect_detail_id,
    /^pd_[a-f0-9]{32}$/,
  );
  assert.match(
    projection.source_timeline_id,
    /^tl_[a-f0-9]{32}$/,
  );
});

test("FES 03E is deterministic for the same timeline", () => {
  const timeline = timelineFor([
    ...baseEvents(),
    createEvent("DUE_ACTION_CREATED", 2),
  ]);
  const left = createPipelineCardProjection({
    timeline,
  });
  const right = createPipelineCardProjection({
    timeline: JSON.parse(
      JSON.stringify(timeline),
    ),
  });

  assert.deepEqual(left, right);
  assert.equal(
    left.projection_digest,
    right.projection_digest,
  );
});

test("FES 03E rebuilds byte-equivalent output", () => {
  const timeline = timelineFor([
    ...baseEvents(),
    createEvent("APPOINTMENT_SCHEDULED", 2),
  ]);
  const projection = createPipelineCardProjection({
    timeline,
  });
  const rebuilt = rebuildPipelineCardProjection({
    projection,
    timeline,
  });

  assert.deepEqual(rebuilt, projection);
});

test("FES 03E rejects validation against a different timeline", () => {
  const timeline = timelineFor(baseEvents());
  const projection = createPipelineCardProjection({
    timeline,
  });
  const foreignTimeline = timelineFor([
    createEvent("TIMELINE_INITIALIZED", 0),
    createEvent("PROSPECT_CREATED", 1, {
      idempotency_key:
        "foreign-pipeline-card",
    }),
  ]);
  const report = validatePipelineCardProjection(
    projection,
    { timeline: foreignTimeline },
  );

  assert.equal(report.valid, false);
  assert.equal(
    report.errors[0].code,
    "PIPELINE_CARD_PROJECTION_NOT_CANONICAL",
  );
});

test("FES 03E detects tampered stage", () => {
  const timeline = timelineFor(baseEvents());
  const projection = createPipelineCardProjection({
    timeline,
  });
  const tampered =
    JSON.parse(JSON.stringify(projection));
  tampered.stage.code =
    "APPOINTMENT_HELD";

  const report = validatePipelineCardProjection(
    tampered,
    { timeline },
  );

  assert.equal(report.valid, false);
  assert.equal(
    report.errors[0].code,
    "PIPELINE_CARD_PROJECTION_NOT_CANONICAL",
  );
});

test("FES 03E rejects unsupported card fields", () => {
  const timeline = timelineFor(baseEvents());
  const projection = createPipelineCardProjection({
    timeline,
  });
  const tampered = {
    ...JSON.parse(JSON.stringify(projection)),
    probability_to_close: 0.9,
  };

  assert.throws(
    () =>
      assertPipelineCardProjection(
        tampered,
        { timeline },
      ),
    error =>
      error.code ===
        "PIPELINE_CARD_PROJECTION_FIELDS_INVALID" &&
      error.details.unsupported_keys.includes(
        "probability_to_close",
      ),
  );
});

test("FES 03E output is deeply immutable", () => {
  const projection = createPipelineCardProjection({
    timeline: timelineFor([
      ...baseEvents(),
      createEvent("DUE_ACTION_CREATED", 2),
    ]),
  });

  assert.equal(Object.isFrozen(projection), true);
  assert.equal(Object.isFrozen(projection.stage), true);
  assert.equal(
    Object.isFrozen(
      projection.last_activity,
    ),
    true,
  );
  assert.equal(
    Object.isFrozen(
      projection.attention_reasons,
    ),
    true,
  );
  assert.throws(
    () => {
      projection.attention_reasons.push({});
    },
    TypeError,
  );
});

test("FES 03E does not mutate its source timeline", () => {
  const timeline = timelineFor([
    ...baseEvents(),
    createEvent("DUE_ACTION_CREATED", 2),
  ]);
  const before = JSON.stringify(timeline);

  createPipelineCardProjection({
    timeline,
  });

  assert.equal(JSON.stringify(timeline), before);
});

test("FES 03E keeps stable identity while digest changes with operational state", () => {
  const baseTimeline = timelineFor(baseEvents());
  const extendedTimeline = timelineFor([
    ...baseEvents(),
    createEvent("DUE_ACTION_CREATED", 2),
  ]);
  const baseProjection = createPipelineCardProjection({
    timeline: baseTimeline,
  });
  const extendedProjection =
    createPipelineCardProjection({
      timeline: extendedTimeline,
    });

  assert.equal(
    baseProjection.projection_id,
    extendedProjection.projection_id,
  );
  assert.notEqual(
    baseProjection.projection_digest,
    extendedProjection.projection_digest,
  );
});
