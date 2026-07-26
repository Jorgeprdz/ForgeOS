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
const activityProjection = require(
  "../platform/event-evidence/activity-projection.js",
);
const prospectDetail = require(
  "../platform/event-evidence/prospect-detail-projection.js",
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
  createActivityProjection,
} = activityProjection;

const {
  PROJECTION_CONTRACT_VERSION,
  PROJECTION_VERSION,
  TRUTH_STATES,
  APPOINTMENT_STATUSES,
  DUE_ACTION_STATUSES,
  UNSUPPORTED_SECTION_NAMES,
  deriveProspectDetailProjectionId,
  createProspectDetailProjection,
  assertProspectDetailProjection,
  validateProspectDetailProjection,
  rebuildProspectDetailProjection,
} = prospectDetail;

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
    idempotency_key: `fes03d-${eventType.toLowerCase()}-${index}`,
    privacy_class: "PRIVATE",
    learning_eligibility: false,
    provenance: {
      source_system: "fes-03d-test",
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
    PROSPECT_PROFILE_CREATED: {
      payload: {
        profile_reference: "profile-001",
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
        context_reference: "context-initial-001",
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
        id: "appointment-002",
      },
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
        outcome_confirmed_at: "2026-07-27T18:30:00.000Z",
      },
    },
    APPOINTMENT_RESCHEDULED: {
      actor: {
        type: "ADVISOR",
        id: "advisor-001",
      },
      subject: {
        type: "APPOINTMENT",
        id: "appointment-002",
      },
      source: {
        type: "ADVISOR_CONFIRMED",
        reference: "probe-response-003",
        channel: "FORGE_UI",
      },
      evidence_strength: "HUMAN_CONFIRMED",
      confirmation_state: "CONFIRMED",
      payload: {
        appointment_reference: "appointment-002",
        previous_starts_at: "2026-07-27T18:00:00.000Z",
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
        id: "appointment-003",
      },
      source: {
        type: "ADVISOR_CONFIRMED",
        reference: "probe-response-004",
        channel: "FORGE_UI",
      },
      evidence_strength: "HUMAN_CONFIRMED",
      confirmation_state: "CONFIRMED",
      payload: {
        appointment_reference: "appointment-003",
        party: "PROSPECT",
        outcome_confirmed_at: "2026-07-27T19:30:00.000Z",
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

function recordFor(event, appendedAt = null) {
  return createLedgerRecord({
    canonical_event: event,
    evidence_references: [],
    appended_at:
      appendedAt ||
      new Date(
        Date.parse(event.recorded_at) + 1000,
      ).toISOString(),
  });
}

function timelineFor(events) {
  return createCanonicalActivityTimeline({
    tenant_id: TENANT,
    correlation_id: CORRELATION,
    ledger_records: events.map(event => recordFor(event)),
  });
}

function baseEvents() {
  return [
    createEvent("TIMELINE_INITIALIZED", 0),
    createEvent("PROSPECT_CREATED", 1),
  ];
}

function fullTimeline() {
  return timelineFor([
    createEvent("TIMELINE_INITIALIZED", 0),
    createEvent("PROSPECT_PROFILE_CREATED", 1),
    createEvent("PROSPECT_CREATED", 2),
    createEvent("INITIAL_CONTEXT_CAPTURED", 3),
    createEvent("APPOINTMENT_SCHEDULED", 4),
    createEvent("APPOINTMENT_HELD", 5),
    createEvent("APPOINTMENT_NOT_HELD", 6),
    createEvent("APPOINTMENT_RESCHEDULED", 7),
    createEvent("APPOINTMENT_NO_SHOW", 8),
    createEvent("ACTIVITY_CONTEXT_ADDED", 9),
    createEvent("DUE_ACTION_CREATED", 10),
    createEvent("DUE_ACTION_RESCHEDULED", 11),
    createEvent("DUE_ACTION_COMPLETED", 12),
  ]);
}

function dueActionCorrection(
  original,
  index,
  idempotencyKey,
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
        reference: idempotencyKey,
        channel: "FORGE_UI",
      },
      evidence_strength: "HUMAN_CONFIRMED",
      occurred_at: iso(index),
      recorded_at: iso(index, 1),
      idempotency_key: idempotencyKey,
      privacy_class: "PRIVATE",
      payload: {
        due_action_reference: "due-action-001",
        action_type: "CALL",
        due_at: dueAt,
      },
      provenance: {
        source_system: "fes-03d-test",
        source_record_id: idempotencyKey,
        captured_via: "FORGE_UI",
        evidence_references: [
          `evidence-${idempotencyKey}`,
        ],
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

test("FES 03D exposes locked projection contracts", () => {
  assert.equal(PROJECTION_CONTRACT_VERSION, "FES-03D.1");
  assert.equal(
    PROJECTION_VERSION,
    "forge.prospect_detail_projection.v1",
  );
  assert.deepEqual(TRUTH_STATES, [
    "UNKNOWN",
    "PENDING_CONFIRMATION",
    "REPORTED_REVIEWABLE",
    "CONFIRMED",
    "CONFLICT_REVIEW_REQUIRED",
  ]);
  assert.deepEqual(APPOINTMENT_STATUSES, [
    "SCHEDULED",
    "HELD",
    "NOT_HELD",
    "RESCHEDULED",
    "NO_SHOW",
  ]);
  assert.deepEqual(DUE_ACTION_STATUSES, [
    "OPEN",
    "RESCHEDULED",
    "COMPLETED",
  ]);
});

test("FES 03D requires exactly one prospect-created root", () => {
  const withoutIdentity = timelineFor([
    createEvent("TIMELINE_INITIALIZED", 0),
  ]);

  assert.throws(
    () =>
      createProspectDetailProjection({
        timeline: withoutIdentity,
      }),
    error =>
      error.code ===
        "PROSPECT_DETAIL_IDENTITY_ROOT_INVALID" &&
      error.details.roots_found === 0,
  );

  const duplicateIdentity = timelineFor([
    ...baseEvents(),
    createEvent("PROSPECT_CREATED", 2, {
      idempotency_key:
        "duplicate-prospect-created",
    }),
  ]);

  assert.throws(
    () =>
      createProspectDetailProjection({
        timeline: duplicateIdentity,
      }),
    error =>
      error.code ===
        "PROSPECT_DETAIL_IDENTITY_ROOT_INVALID" &&
      error.details.roots_found === 2,
  );
});

test("FES 03D rejects mixed prospect subject identities", () => {
  const timeline = timelineFor([
    ...baseEvents(),
    createEvent(
      "PROSPECT_PROFILE_CREATED",
      2,
      {
        subject: {
          type: "PROSPECT",
          id: "prospect-002",
        },
        idempotency_key:
          "foreign-profile-subject",
      },
    ),
  ]);

  assert.throws(
    () =>
      createProspectDetailProjection({
        timeline,
      }),
    error =>
      error.code ===
      "PROSPECT_DETAIL_PROSPECT_SCOPE_MISMATCH",
  );
});

test("FES 03D projects confirmed prospect identity", () => {
  const timeline = timelineFor(baseEvents());
  const projection =
    createProspectDetailProjection({
      timeline,
    });

  assert.deepEqual(projection.identity, {
    state: "CONFIRMED",
    prospect_id: PROSPECT_ID,
    prospect_reference: PROSPECT_ID,
    source_category: "REFERRAL",
    effective_event_id:
      timeline.entries.find(
        entry =>
          entry.event_type ===
          "PROSPECT_CREATED",
      ).event_id,
    root_event_id:
      timeline.entries.find(
        entry =>
          entry.event_type ===
          "PROSPECT_CREATED",
      ).event_id,
  });
});

test("FES 03D keeps absent profile explicitly unknown", () => {
  const projection =
    createProspectDetailProjection({
      timeline: timelineFor(baseEvents()),
    });

  assert.equal(projection.profile.state, "UNKNOWN");
  assert.equal(
    projection.profile.profile_reference,
    null,
  );
  assert.equal(
    projection.profile.effective_event_id,
    null,
  );
});

test("FES 03D projects profile reference when observed", () => {
  const projection =
    createProspectDetailProjection({
      timeline: fullTimeline(),
    });

  assert.equal(
    projection.profile.state,
    "CONFIRMED",
  );
  assert.equal(
    projection.profile.profile_reference,
    "profile-001",
  );
});

test("FES 03D separates initial and activity contexts", () => {
  const projection =
    createProspectDetailProjection({
      timeline: fullTimeline(),
    });

  assert.deepEqual(
    projection.contexts.map(
      context => context.context_kind,
    ),
    ["INITIAL", "ACTIVITY"],
  );
  assert.equal(
    projection.contexts[0].state,
    "REPORTED_REVIEWABLE",
  );
  assert.equal(
    projection.contexts[0].capture_mode,
    "VOICE",
  );
  assert.equal(
    projection.contexts[1].activity_reference,
    "activity-001",
  );
});

test("FES 03D aggregates appointment history by reference", () => {
  const projection =
    createProspectDetailProjection({
      timeline: fullTimeline(),
    });

  assert.equal(
    projection.appointments.length,
    3,
  );

  const held = projection.appointments.find(
    item =>
      item.appointment_reference ===
      "appointment-001",
  );
  const rescheduled =
    projection.appointments.find(
      item =>
        item.appointment_reference ===
        "appointment-002",
    );
  const noShow =
    projection.appointments.find(
      item =>
        item.appointment_reference ===
        "appointment-003",
    );

  assert.equal(held.status, "HELD");
  assert.equal(
    held.outcome_confirmed_at,
    "2026-07-27T17:30:00.000Z",
  );
  assert.equal(
    held.event_ids.length,
    2,
  );

  assert.equal(
    rescheduled.status,
    "RESCHEDULED",
  );
  assert.equal(
    rescheduled.starts_at,
    "2026-07-28T18:00:00.000Z",
  );
  assert.equal(
    rescheduled.event_ids.length,
    2,
  );

  assert.equal(noShow.status, "NO_SHOW");
  assert.equal(noShow.party, "PROSPECT");
});

test("FES 03D aggregates due-action lifecycle", () => {
  const projection =
    createProspectDetailProjection({
      timeline: fullTimeline(),
    });

  assert.equal(
    projection.due_actions.length,
    1,
  );
  assert.deepEqual(
    projection.due_actions[0],
    {
      due_action_reference:
        "due-action-001",
      state: "CONFIRMED",
      status: "COMPLETED",
      action_type: null,
      due_at: null,
      previous_due_at: null,
      completed_at:
        "2026-08-02T17:00:00.000Z",
      latest_event_id:
        projection.due_actions[0]
          .latest_event_id,
      event_ids:
        projection.due_actions[0]
          .event_ids,
    },
  );
  assert.equal(
    projection.due_actions[0]
      .event_ids.length,
    3,
  );
});

test("FES 03D keeps unsupported sections explicit and empty", () => {
  const projection =
    createProspectDetailProjection({
      timeline: fullTimeline(),
    });

  assert.deepEqual(
    Object.keys(
      projection.unsupported_sections,
    ).sort(),
    [...UNSUPPORTED_SECTION_NAMES].sort(),
  );

  for (const section of Object.values(
    projection.unsupported_sections,
  )) {
    assert.equal(
      section.state,
      "NOT_AVAILABLE_IN_FIRST_VERTICAL",
    );
    assert.deepEqual(section.items, []);
    assert.equal(
      section.canonical_event_type_available,
      false,
    );
  }
});

test("FES 03D reuses deterministic Activity history from the same timeline", () => {
  const timeline = fullTimeline();
  const activity =
    createActivityProjection({
      timeline,
    });
  const projection =
    createProspectDetailProjection({
      timeline,
    });

  assert.equal(
    projection.source_activity_projection_digest,
    activity.projection_digest,
  );
  assert.deepEqual(
    projection.history,
    activity.items,
  );
  assert.equal(
    projection.counters.history_count,
    activity.item_count,
  );
});

test("FES 03D applies a single correction as effective state while preserving history", () => {
  const root =
    createEvent("TIMELINE_INITIALIZED", 0);
  const identity =
    createEvent("PROSPECT_CREATED", 1);
  const original =
    createEvent("DUE_ACTION_CREATED", 2);
  const correction =
    dueActionCorrection(
      original,
      3,
      "due-correction-one",
      "2026-08-04T16:00:00.000Z",
    );
  const timeline = timelineFor([
    root,
    identity,
    original,
    correction,
  ]);
  const projection =
    createProspectDetailProjection({
      timeline,
    });

  assert.equal(
    projection.due_actions[0].status,
    "OPEN",
  );
  assert.equal(
    projection.due_actions[0].due_at,
    "2026-08-04T16:00:00.000Z",
  );
  assert.equal(
    projection.due_actions[0]
      .latest_event_id,
    correction.event_id,
  );
  assert.equal(
    projection.history.length,
    4,
  );
  assert.equal(
    projection.counters.correction_count,
    1,
  );
});

test("FES 03D exposes correction forks for review instead of silently choosing", () => {
  const root =
    createEvent("TIMELINE_INITIALIZED", 0);
  const identity =
    createEvent("PROSPECT_CREATED", 1);
  const original =
    createEvent("DUE_ACTION_CREATED", 2);
  const left =
    dueActionCorrection(
      original,
      3,
      "due-correction-left",
      "2026-08-04T16:00:00.000Z",
    );
  const right =
    dueActionCorrection(
      original,
      4,
      "due-correction-right",
      "2026-08-05T16:00:00.000Z",
    );
  const projection =
    createProspectDetailProjection({
      timeline: timelineFor([
        root,
        identity,
        original,
        left,
        right,
      ]),
    });

  assert.equal(
    projection.correction_conflicts.length,
    1,
  );
  assert.equal(
    projection.correction_conflicts[0].state,
    "CONFLICT_REVIEW_REQUIRED",
  );
  assert.deepEqual(
    projection.correction_conflicts[0]
      .leaf_event_ids,
    [left.event_id, right.event_id].sort(),
  );
  assert.equal(
    projection.due_actions[0].state,
    "CONFLICT_REVIEW_REQUIRED",
  );
  assert.equal(
    projection.due_actions[0].status,
    null,
  );
  assert.equal(
    projection.counters
      .correction_conflict_count,
    1,
  );
});

test("FES 03D derives stable identity from tenant and timeline", () => {
  const timeline = fullTimeline();
  const projection =
    createProspectDetailProjection({
      timeline,
    });
  const expected =
    deriveProspectDetailProjectionId({
      tenant_id: TENANT,
      timeline_id: timeline.timeline_id,
    });

  assert.equal(
    projection.projection_id,
    expected,
  );
  assert.match(
    projection.projection_id,
    /^pd_[a-f0-9]{32}$/,
  );
});

test("FES 03D computes deterministic counters", () => {
  const projection =
    createProspectDetailProjection({
      timeline: fullTimeline(),
    });

  assert.deepEqual(projection.counters, {
    history_count: 13,
    context_count: 2,
    appointment_count: 3,
    due_action_count: 1,
    open_due_action_count: 0,
    pending_count: 2,
    correction_count: 0,
    correction_conflict_count: 0,
    unsupported_section_count:
      UNSUPPORTED_SECTION_NAMES.length,
  });
});

test("FES 03D is deterministic for the same timeline", () => {
  const timeline = fullTimeline();
  const left =
    createProspectDetailProjection({
      timeline,
    });
  const right =
    createProspectDetailProjection({
      timeline:
        JSON.parse(JSON.stringify(timeline)),
    });

  assert.deepEqual(left, right);
  assert.equal(
    left.projection_digest,
    right.projection_digest,
  );
});

test("FES 03D rebuilds byte-equivalent output", () => {
  const timeline = fullTimeline();
  const projection =
    createProspectDetailProjection({
      timeline,
    });
  const rebuilt =
    rebuildProspectDetailProjection({
      projection,
      timeline,
    });

  assert.deepEqual(rebuilt, projection);
});

test("FES 03D rejects validation against a different timeline", () => {
  const timeline = fullTimeline();
  const projection =
    createProspectDetailProjection({
      timeline,
    });
  const foreignTimeline = timelineFor([
    createEvent("TIMELINE_INITIALIZED", 0),
    createEvent("PROSPECT_CREATED", 1, {
      idempotency_key:
        "foreign-prospect-detail",
    }),
  ]);
  const report =
    validateProspectDetailProjection(
      projection,
      {
        timeline: foreignTimeline,
      },
    );

  assert.equal(report.valid, false);
  assert.equal(
    report.errors[0].code,
    "PROSPECT_DETAIL_PROJECTION_NOT_CANONICAL",
  );
});

test("FES 03D detects tampered derived state", () => {
  const timeline = fullTimeline();
  const projection =
    createProspectDetailProjection({
      timeline,
    });
  const tampered =
    JSON.parse(JSON.stringify(projection));
  tampered.identity.source_category =
    "INVENTED";

  const report =
    validateProspectDetailProjection(
      tampered,
      { timeline },
    );

  assert.equal(report.valid, false);
  assert.equal(
    report.errors[0].code,
    "PROSPECT_DETAIL_PROJECTION_NOT_CANONICAL",
  );
});

test("FES 03D rejects unsupported top-level fields", () => {
  const timeline = fullTimeline();
  const projection =
    createProspectDetailProjection({
      timeline,
    });
  const tampered = {
    ...JSON.parse(JSON.stringify(projection)),
    recommended_product: "ORVI",
  };

  assert.throws(
    () =>
      assertProspectDetailProjection(
        tampered,
        { timeline },
      ),
    error =>
      error.code ===
        "PROSPECT_DETAIL_PROJECTION_FIELDS_INVALID" &&
      error.details.unsupported_keys.includes(
        "recommended_product",
      ),
  );
});

test("FES 03D output is deeply immutable", () => {
  const projection =
    createProspectDetailProjection({
      timeline: fullTimeline(),
    });

  assert.equal(
    Object.isFrozen(projection),
    true,
  );
  assert.equal(
    Object.isFrozen(projection.identity),
    true,
  );
  assert.equal(
    Object.isFrozen(projection.contexts),
    true,
  );
  assert.equal(
    Object.isFrozen(projection.history),
    true,
  );
  assert.equal(
    Object.isFrozen(
      projection.unsupported_sections,
    ),
    true,
  );
  assert.throws(
    () => {
      projection.history.push({});
    },
    TypeError,
  );
});

test("FES 03D does not mutate its source timeline", () => {
  const timeline = fullTimeline();
  const before = JSON.stringify(timeline);

  createProspectDetailProjection({
    timeline,
  });

  assert.equal(
    JSON.stringify(timeline),
    before,
  );
});

test("FES 03D keeps stable projection identity while digest changes with content", () => {
  const baseTimeline =
    timelineFor(baseEvents());
  const extendedTimeline =
    timelineFor([
      ...baseEvents(),
      createEvent(
        "DUE_ACTION_CREATED",
        2,
      ),
    ]);
  const baseProjection =
    createProspectDetailProjection({
      timeline: baseTimeline,
    });
  const extendedProjection =
    createProspectDetailProjection({
      timeline: extendedTimeline,
    });

  assert.equal(
    baseProjection.projection_id,
    extendedProjection.projection_id,
  );
  assert.notEqual(
    baseProjection.source_timeline_digest,
    extendedProjection.source_timeline_digest,
  );
  assert.notEqual(
    baseProjection.projection_digest,
    extendedProjection.projection_digest,
  );
});
