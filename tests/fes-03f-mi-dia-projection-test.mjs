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
const miDia = require(
  "../platform/event-evidence/mi-dia-projection.js",
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
  WORK_ITEM_VERSION,
  ACTION_CODES,
  ACTION_PRESENTATION,
  UNSUPPORTED_SIGNALS,
  deriveMiDiaProjectionId,
  createMiDiaProjection,
  assertMiDiaProjection,
  validateMiDiaProjection,
  rebuildMiDiaProjection,
} = miDia;

const TENANT = "tenant-advisor-001";
const PLAN = "plan-2026-07-26";

function iso(hour, second = 0) {
  return `2026-07-26T${String(hour).padStart(2, "0")}:00:${String(
    second,
  ).padStart(2, "0")}.000Z`;
}

function eventInput(
  prospectId,
  correlationId,
  eventType,
  index,
  overrides = {},
) {
  const common = {
    event_type: eventType,
    tenant_id: TENANT,
    actor: {
      type: "SYSTEM",
      id: "forge-system",
    },
    subject: {
      type: "PROSPECT",
      id: prospectId,
    },
    source: {
      type: "SYSTEM_OBSERVED",
      reference: `${prospectId}-source-${index}`,
      channel: "FORGE_SYSTEM",
    },
    evidence_strength: "SYSTEM_OBSERVED",
    occurred_at: iso(index),
    recorded_at: iso(index, 1),
    effective_period: null,
    causation_id: null,
    correlation_id: correlationId,
    idempotency_key:
      `${prospectId}-${eventType.toLowerCase()}-${index}`,
    privacy_class: "PRIVATE",
    learning_eligibility: false,
    provenance: {
      source_system: "fes-03f-test",
      source_record_id:
        `${prospectId}-record-${index}`,
      captured_via: "FORGE_SYSTEM",
      evidence_references: [
        `${prospectId}-evidence-${index}`,
      ],
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
        timeline_reference:
          `${prospectId}-timeline`,
      },
    },
    PROSPECT_CREATED: {
      payload: {
        prospect_reference: prospectId,
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
        reference:
          `${prospectId}-context-${index}`,
        channel: "FORGE_UI",
      },
      evidence_strength: "REPORTED",
      confirmation_state: "REPORTED",
      payload: {
        context_reference:
          `${prospectId}-context`,
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
        id: `${prospectId}-activity`,
      },
      source: {
        type: "ADVISOR_REPORTED",
        reference:
          `${prospectId}-activity-context-${index}`,
        channel: "FORGE_UI",
      },
      evidence_strength: "REPORTED",
      confirmation_state: "REPORTED",
      payload: {
        activity_reference:
          `${prospectId}-activity`,
        context_reference:
          `${prospectId}-activity-context`,
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
        id: `${prospectId}-appointment`,
      },
      source: {
        type: "EXTERNAL_PROVIDER_CONFIRMED",
        reference:
          `${prospectId}-google-event`,
        channel: "GOOGLE_CALENDAR",
      },
      evidence_strength: "EXTERNAL_CONFIRMED",
      payload: {
        appointment_reference:
          `${prospectId}-appointment`,
        starts_at:
          "2026-07-27T16:00:00.000Z",
        ends_at:
          "2026-07-27T17:00:00.000Z",
        provider_event_reference:
          `${prospectId}-google-event`,
      },
    },
    APPOINTMENT_HELD: {
      actor: {
        type: "ADVISOR",
        id: "advisor-001",
      },
      subject: {
        type: "APPOINTMENT",
        id: `${prospectId}-appointment`,
      },
      source: {
        type: "ADVISOR_CONFIRMED",
        reference:
          `${prospectId}-held`,
        channel: "FORGE_UI",
      },
      evidence_strength: "HUMAN_CONFIRMED",
      payload: {
        appointment_reference:
          `${prospectId}-appointment`,
        outcome_confirmed_at:
          "2026-07-27T17:30:00.000Z",
      },
    },
    DUE_ACTION_CREATED: {
      subject: {
        type: "DUE_ACTION",
        id: `${prospectId}-due`,
      },
      source: {
        type: "SYSTEM_OBSERVED",
        reference:
          `${prospectId}-due-${index}`,
        channel: "PIPELINE",
      },
      payload: {
        due_action_reference:
          `${prospectId}-due`,
        action_type: "CALL",
        due_at:
          "2026-08-01T16:00:00.000Z",
      },
    },
    DUE_ACTION_COMPLETED: {
      subject: {
        type: "DUE_ACTION",
        id: `${prospectId}-due`,
      },
      source: {
        type: "SYSTEM_OBSERVED",
        reference:
          `${prospectId}-due-${index}`,
        channel: "PIPELINE",
      },
      payload: {
        due_action_reference:
          `${prospectId}-due`,
        completed_at:
          "2026-08-01T17:00:00.000Z",
      },
    },
  };

  return {
    ...common,
    ...fixtures[eventType],
    ...overrides,
  };
}

function createEvent(
  prospectId,
  eventType,
  index,
  overrides = {},
) {
  const correlationId =
    `corr-${prospectId}`;

  return createCanonicalActivityEvent(
    eventInput(
      prospectId,
      correlationId,
      eventType,
      index,
      overrides,
    ),
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

function timelineFor(prospectId, events) {
  return createCanonicalActivityTimeline({
    tenant_id: TENANT,
    correlation_id: `corr-${prospectId}`,
    ledger_records: events.map(recordFor),
  });
}

function baseTimeline(prospectId) {
  return timelineFor(prospectId, [
    createEvent(
      prospectId,
      "TIMELINE_INITIALIZED",
      0,
    ),
    createEvent(
      prospectId,
      "PROSPECT_CREATED",
      1,
    ),
  ]);
}

function dueCorrection(
  prospectId,
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
        due_action_reference:
          `${prospectId}-due`,
        action_type: "CALL",
        due_at: dueAt,
      },
      provenance: {
        source_system: "fes-03f-test",
        source_record_id: key,
        captured_via: "FORGE_UI",
        evidence_references: [
          `evidence-${key}`,
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

test("FES 03F exposes locked projection contracts", () => {
  assert.equal(PROJECTION_CONTRACT_VERSION, "FES-03F.1");
  assert.equal(
    PROJECTION_VERSION,
    "forge.mi_dia_projection.v1",
  );
  assert.equal(
    WORK_ITEM_VERSION,
    "forge.mi_dia_work_item.v1",
  );
  assert.deepEqual(ACTION_CODES, [
    "RESOLVE_CONFLICT",
    "CONFIRM_APPOINTMENT_OUTCOME",
    "PERFORM_DUE_FOLLOW_UP",
    "REVIEW_PENDING_CONFIRMATION",
    "ADD_OPTIONAL_CONTEXT",
  ]);
  assert.deepEqual(
    Object.keys(ACTION_PRESENTATION).sort(),
    [...ACTION_CODES].sort(),
  );
});

test("FES 03F requires explicit plan reference", () => {
  assert.throws(
    () =>
      createMiDiaProjection({
        timelines: [baseTimeline("prospect-001")],
      }),
    error =>
      error.code ===
      "MI_DIA_PLAN_REFERENCE_INVALID",
  );
});

test("FES 03F requires at least one timeline", () => {
  assert.throws(
    () =>
      createMiDiaProjection({
        plan_reference: PLAN,
        timelines: [],
      }),
    error =>
      error.code ===
      "MI_DIA_TIMELINES_REQUIRED",
  );
});

test("FES 03F rejects mixed tenants", () => {
  const foreignTenant = "tenant-foreign";
  const foreignProspect = "prospect-002";
  const foreignCorrelation =
    `corr-${foreignProspect}`;

  const foreignEvents = [
    createCanonicalActivityEvent({
      ...eventInput(
        foreignProspect,
        foreignCorrelation,
        "TIMELINE_INITIALIZED",
        0,
      ),
      tenant_id: foreignTenant,
    }),
    createCanonicalActivityEvent({
      ...eventInput(
        foreignProspect,
        foreignCorrelation,
        "PROSPECT_CREATED",
        1,
      ),
      tenant_id: foreignTenant,
    }),
  ];

  const foreign =
    createCanonicalActivityTimeline({
      tenant_id: foreignTenant,
      correlation_id: foreignCorrelation,
      ledger_records:
        foreignEvents.map(recordFor),
    });

  assert.throws(
    () =>
      createMiDiaProjection({
        plan_reference: PLAN,
        timelines: [
          baseTimeline("prospect-001"),
          foreign,
        ],
      }),
    error =>
      error.code ===
      "MI_DIA_TENANT_MISMATCH",
  );
});

test("FES 03F returns an empty plan when no work requires attention", () => {
  const projection = createMiDiaProjection({
    plan_reference: PLAN,
    timelines: [baseTimeline("prospect-001")],
  });

  assert.equal(projection.work_item_count, 0);
  assert.equal(projection.required_count, 0);
  assert.equal(projection.optional_count, 0);
  assert.deepEqual(projection.items, []);
});

test("FES 03F projects appointment outcome confirmation", () => {
  const prospectId = "prospect-001";
  const projection = createMiDiaProjection({
    plan_reference: PLAN,
    timelines: [
      timelineFor(prospectId, [
        createEvent(
          prospectId,
          "TIMELINE_INITIALIZED",
          0,
        ),
        createEvent(
          prospectId,
          "PROSPECT_CREATED",
          1,
        ),
        createEvent(
          prospectId,
          "APPOINTMENT_SCHEDULED",
          2,
        ),
      ]),
    ],
  });

  assert.equal(projection.work_item_count, 1);
  assert.equal(
    projection.items[0].action_code,
    "CONFIRM_APPOINTMENT_OUTCOME",
  );
  assert.equal(projection.items[0].required, true);
});

test("FES 03F projects open due follow-up", () => {
  const prospectId = "prospect-001";
  const projection = createMiDiaProjection({
    plan_reference: PLAN,
    timelines: [
      timelineFor(prospectId, [
        createEvent(
          prospectId,
          "TIMELINE_INITIALIZED",
          0,
        ),
        createEvent(
          prospectId,
          "PROSPECT_CREATED",
          1,
        ),
        createEvent(
          prospectId,
          "DUE_ACTION_CREATED",
          2,
        ),
      ]),
    ],
  });

  assert.equal(
    projection.items[0].action_code,
    "PERFORM_DUE_FOLLOW_UP",
  );
  assert.equal(
    projection.items[0].due_at,
    "2026-08-01T16:00:00.000Z",
  );
});

test("FES 03F excludes completed due follow-up", () => {
  const prospectId = "prospect-001";
  const projection = createMiDiaProjection({
    plan_reference: PLAN,
    timelines: [
      timelineFor(prospectId, [
        createEvent(
          prospectId,
          "TIMELINE_INITIALIZED",
          0,
        ),
        createEvent(
          prospectId,
          "PROSPECT_CREATED",
          1,
        ),
        createEvent(
          prospectId,
          "DUE_ACTION_CREATED",
          2,
        ),
        createEvent(
          prospectId,
          "DUE_ACTION_COMPLETED",
          3,
        ),
      ]),
    ],
  });

  assert.equal(projection.work_item_count, 0);
});

test("FES 03F projects reviewable reported evidence", () => {
  const prospectId = "prospect-001";
  const projection = createMiDiaProjection({
    plan_reference: PLAN,
    timelines: [
      timelineFor(prospectId, [
        createEvent(
          prospectId,
          "TIMELINE_INITIALIZED",
          0,
        ),
        createEvent(
          prospectId,
          "PROSPECT_CREATED",
          1,
        ),
        createEvent(
          prospectId,
          "INITIAL_CONTEXT_CAPTURED",
          2,
        ),
      ]),
    ],
  });

  assert.equal(
    projection.items[0].action_code,
    "REVIEW_PENDING_CONFIRMATION",
  );
});

test("FES 03F projects optional context after held appointment", () => {
  const prospectId = "prospect-001";
  const projection = createMiDiaProjection({
    plan_reference: PLAN,
    timelines: [
      timelineFor(prospectId, [
        createEvent(
          prospectId,
          "TIMELINE_INITIALIZED",
          0,
        ),
        createEvent(
          prospectId,
          "PROSPECT_CREATED",
          1,
        ),
        createEvent(
          prospectId,
          "APPOINTMENT_SCHEDULED",
          2,
        ),
        createEvent(
          prospectId,
          "APPOINTMENT_HELD",
          3,
        ),
      ]),
    ],
  });

  assert.equal(projection.required_count, 0);
  assert.equal(projection.optional_count, 1);
  assert.equal(
    projection.items[0].action_code,
    "ADD_OPTIONAL_CONTEXT",
  );
  assert.equal(projection.items[0].required, false);
});

test("FES 03F removes optional context when later context exists", () => {
  const prospectId = "prospect-001";
  const projection = createMiDiaProjection({
    plan_reference: PLAN,
    timelines: [
      timelineFor(prospectId, [
        createEvent(
          prospectId,
          "TIMELINE_INITIALIZED",
          0,
        ),
        createEvent(
          prospectId,
          "PROSPECT_CREATED",
          1,
        ),
        createEvent(
          prospectId,
          "APPOINTMENT_SCHEDULED",
          2,
        ),
        createEvent(
          prospectId,
          "APPOINTMENT_HELD",
          3,
        ),
        createEvent(
          prospectId,
          "ACTIVITY_CONTEXT_ADDED",
          4,
        ),
      ]),
    ],
  });

  assert.equal(
    projection.items.some(
      item =>
        item.action_code ===
        "ADD_OPTIONAL_CONTEXT",
    ),
    false,
  );
});

test("FES 03F promotes correction conflict above all other work", () => {
  const prospectId = "prospect-001";
  const original = createEvent(
    prospectId,
    "DUE_ACTION_CREATED",
    2,
  );
  const left = dueCorrection(
    prospectId,
    original,
    3,
    "mi-dia-left",
    "2026-08-04T16:00:00.000Z",
  );
  const right = dueCorrection(
    prospectId,
    original,
    4,
    "mi-dia-right",
    "2026-08-05T16:00:00.000Z",
  );
  const projection = createMiDiaProjection({
    plan_reference: PLAN,
    timelines: [
      timelineFor(prospectId, [
        createEvent(
          prospectId,
          "TIMELINE_INITIALIZED",
          0,
        ),
        createEvent(
          prospectId,
          "PROSPECT_CREATED",
          1,
        ),
        original,
        left,
        right,
      ]),
    ],
  });

  assert.equal(projection.work_item_count, 1);
  assert.equal(
    projection.items[0].action_code,
    "RESOLVE_CONFLICT",
  );
  assert.equal(projection.items[0].priority, 0);
});

test("FES 03F orders work by priority", () => {
  const appointmentId = "prospect-appointment";
  const dueId = "prospect-due";
  const pendingId = "prospect-pending";

  const projection = createMiDiaProjection({
    plan_reference: PLAN,
    timelines: [
      timelineFor(appointmentId, [
        createEvent(
          appointmentId,
          "TIMELINE_INITIALIZED",
          0,
        ),
        createEvent(
          appointmentId,
          "PROSPECT_CREATED",
          1,
        ),
        createEvent(
          appointmentId,
          "APPOINTMENT_SCHEDULED",
          2,
        ),
      ]),
      timelineFor(dueId, [
        createEvent(
          dueId,
          "TIMELINE_INITIALIZED",
          0,
        ),
        createEvent(
          dueId,
          "PROSPECT_CREATED",
          1,
        ),
        createEvent(
          dueId,
          "DUE_ACTION_CREATED",
          2,
        ),
      ]),
      timelineFor(pendingId, [
        createEvent(
          pendingId,
          "TIMELINE_INITIALIZED",
          0,
        ),
        createEvent(
          pendingId,
          "PROSPECT_CREATED",
          1,
        ),
        createEvent(
          pendingId,
          "INITIAL_CONTEXT_CAPTURED",
          2,
        ),
      ]),
    ],
  });

  assert.deepEqual(
    projection.items.map(item => item.action_code),
    [
      "CONFIRM_APPOINTMENT_OUTCOME",
      "PERFORM_DUE_FOLLOW_UP",
      "REVIEW_PENDING_CONFIRMATION",
    ],
  );
});

test("FES 03F orders same-priority due work by due date", () => {
  const laterId = "prospect-later";
  const earlierId = "prospect-earlier";

  const projection = createMiDiaProjection({
    plan_reference: PLAN,
    timelines: [
      timelineFor(laterId, [
        createEvent(
          laterId,
          "TIMELINE_INITIALIZED",
          0,
        ),
        createEvent(
          laterId,
          "PROSPECT_CREATED",
          1,
        ),
        createEvent(
          laterId,
          "DUE_ACTION_CREATED",
          2,
          {
            payload: {
              due_action_reference:
                `${laterId}-due`,
              action_type: "CALL",
              due_at:
                "2026-08-03T16:00:00.000Z",
            },
          },
        ),
      ]),
      timelineFor(earlierId, [
        createEvent(
          earlierId,
          "TIMELINE_INITIALIZED",
          0,
        ),
        createEvent(
          earlierId,
          "PROSPECT_CREATED",
          1,
        ),
        createEvent(
          earlierId,
          "DUE_ACTION_CREATED",
          2,
          {
            payload: {
              due_action_reference:
                `${earlierId}-due`,
              action_type: "CALL",
              due_at:
                "2026-08-01T16:00:00.000Z",
            },
          },
        ),
      ]),
    ],
  });

  assert.equal(
    projection.items[0].prospect_id,
    earlierId,
  );
  assert.equal(
    projection.items[1].prospect_id,
    laterId,
  );
});

test("FES 03F is independent from input timeline order", () => {
  const leftTimeline =
    baseTimeline("prospect-left");
  const rightTimeline =
    baseTimeline("prospect-right");

  const left = createMiDiaProjection({
    plan_reference: PLAN,
    timelines: [
      leftTimeline,
      rightTimeline,
    ],
  });
  const right = createMiDiaProjection({
    plan_reference: PLAN,
    timelines: [
      rightTimeline,
      leftTimeline,
    ],
  });

  assert.deepEqual(left, right);
});

test("FES 03F deduplicates exact prospect replay", () => {
  const timeline =
    baseTimeline("prospect-001");
  const projection = createMiDiaProjection({
    plan_reference: PLAN,
    timelines: [
      timeline,
      JSON.parse(JSON.stringify(timeline)),
    ],
  });

  assert.equal(
    projection.source_card_count,
    1,
  );
});

test("FES 03F keeps unsupported intelligence explicit", () => {
  const projection = createMiDiaProjection({
    plan_reference: PLAN,
    timelines: [baseTimeline("prospect-001")],
  });

  assert.deepEqual(
    projection.unsupported_signals,
    UNSUPPORTED_SIGNALS,
  );

  for (const forbidden of [
    "goal_probability",
    "expected_production",
    "monthly_gap",
    "rescue_probability",
    "close_probability",
    "recommended_product",
    "alfred_generated_recommendation",
    "neglect_age_from_wall_clock",
  ]) {
    assert.equal(
      projection.unsupported_signals.includes(forbidden),
      true,
    );
  }
});

test("FES 03F does not infer current time or overdue state", () => {
  const prospectId = "prospect-001";
  const projection = createMiDiaProjection({
    plan_reference: PLAN,
    timelines: [
      timelineFor(prospectId, [
        createEvent(
          prospectId,
          "TIMELINE_INITIALIZED",
          0,
        ),
        createEvent(
          prospectId,
          "PROSPECT_CREATED",
          1,
        ),
        createEvent(
          prospectId,
          "DUE_ACTION_CREATED",
          2,
          {
            payload: {
              due_action_reference:
                `${prospectId}-due`,
              action_type: "CALL",
              due_at:
                "2020-01-01T00:00:00.000Z",
            },
          },
        ),
      ]),
    ],
  });

  assert.equal(
    projection.items[0].reason_code,
    "OPEN_DUE_ACTION",
  );
  assert.equal(
    JSON.stringify(projection).includes("OVERDUE"),
    false,
  );
});

test("FES 03F derives stable plan identity", () => {
  const projection = createMiDiaProjection({
    plan_reference: PLAN,
    timelines: [baseTimeline("prospect-001")],
  });
  const expected = deriveMiDiaProjectionId({
    tenant_id: TENANT,
    plan_reference: PLAN,
  });

  assert.equal(
    projection.projection_id,
    expected,
  );
  assert.match(
    projection.projection_id,
    /^md_[a-f0-9]{32}$/,
  );
});

test("FES 03F computes deterministic counts", () => {
  const appointmentId = "prospect-appointment";
  const dueId = "prospect-due";

  const projection = createMiDiaProjection({
    plan_reference: PLAN,
    timelines: [
      timelineFor(appointmentId, [
        createEvent(
          appointmentId,
          "TIMELINE_INITIALIZED",
          0,
        ),
        createEvent(
          appointmentId,
          "PROSPECT_CREATED",
          1,
        ),
        createEvent(
          appointmentId,
          "APPOINTMENT_SCHEDULED",
          2,
        ),
      ]),
      timelineFor(dueId, [
        createEvent(
          dueId,
          "TIMELINE_INITIALIZED",
          0,
        ),
        createEvent(
          dueId,
          "PROSPECT_CREATED",
          1,
        ),
        createEvent(
          dueId,
          "DUE_ACTION_CREATED",
          2,
        ),
      ]),
    ],
  });

  assert.equal(projection.work_item_count, 2);
  assert.equal(projection.required_count, 2);
  assert.equal(projection.optional_count, 0);
  assert.equal(projection.prospect_count, 2);
  assert.equal(
    projection.counts_by_action
      .CONFIRM_APPOINTMENT_OUTCOME,
    1,
  );
  assert.equal(
    projection.counts_by_action
      .PERFORM_DUE_FOLLOW_UP,
    1,
  );
});

test("FES 03F rebuilds byte-equivalent output", () => {
  const timelines = [
    baseTimeline("prospect-001"),
  ];
  const projection = createMiDiaProjection({
    plan_reference: PLAN,
    timelines,
  });
  const rebuilt = rebuildMiDiaProjection({
    projection,
    plan_reference: PLAN,
    timelines,
  });

  assert.deepEqual(rebuilt, projection);
});

test("FES 03F rejects validation against different source", () => {
  const projection = createMiDiaProjection({
    plan_reference: PLAN,
    timelines: [baseTimeline("prospect-001")],
  });
  const report = validateMiDiaProjection(
    projection,
    {
      plan_reference: PLAN,
      timelines: [
        baseTimeline("prospect-002"),
      ],
    },
  );

  assert.equal(report.valid, false);
  assert.equal(
    report.errors[0].code,
    "MI_DIA_PROJECTION_NOT_CANONICAL",
  );
});

test("FES 03F detects tampered priority", () => {
  const source = {
    plan_reference: PLAN,
    timelines: [
      timelineFor("prospect-001", [
        createEvent(
          "prospect-001",
          "TIMELINE_INITIALIZED",
          0,
        ),
        createEvent(
          "prospect-001",
          "PROSPECT_CREATED",
          1,
        ),
        createEvent(
          "prospect-001",
          "DUE_ACTION_CREATED",
          2,
        ),
      ]),
    ],
  };
  const projection = createMiDiaProjection(source);
  const tampered =
    JSON.parse(JSON.stringify(projection));
  tampered.items[0].priority = 0;

  const report = validateMiDiaProjection(
    tampered,
    source,
  );

  assert.equal(report.valid, false);
  assert.equal(
    report.errors[0].code,
    "MI_DIA_PROJECTION_NOT_CANONICAL",
  );
});

test("FES 03F rejects unsupported top-level fields", () => {
  const source = {
    plan_reference: PLAN,
    timelines: [baseTimeline("prospect-001")],
  };
  const projection = createMiDiaProjection(source);
  const tampered = {
    ...JSON.parse(JSON.stringify(projection)),
    alfred_briefing:
      "Empieza por este prospecto.",
  };

  assert.throws(
    () =>
      assertMiDiaProjection(
        tampered,
        source,
      ),
    error =>
      error.code ===
        "MI_DIA_PROJECTION_FIELDS_INVALID" &&
      error.details.unsupported_keys.includes(
        "alfred_briefing",
      ),
  );
});

test("FES 03F rejects unsupported work-item fields", () => {
  const source = {
    plan_reference: PLAN,
    timelines: [
      timelineFor("prospect-001", [
        createEvent(
          "prospect-001",
          "TIMELINE_INITIALIZED",
          0,
        ),
        createEvent(
          "prospect-001",
          "PROSPECT_CREATED",
          1,
        ),
        createEvent(
          "prospect-001",
          "DUE_ACTION_CREATED",
          2,
        ),
      ]),
    ],
  };
  const projection = createMiDiaProjection(source);
  const tampered =
    JSON.parse(JSON.stringify(projection));
  tampered.items[0].execute = true;

  assert.throws(
    () =>
      assertMiDiaProjection(
        tampered,
        source,
      ),
    error =>
      error.code ===
        "MI_DIA_WORK_ITEM_FIELDS_INVALID" &&
      error.details.unsupported_keys.includes(
        "execute",
      ),
  );
});

test("FES 03F output is deeply immutable", () => {
  const projection = createMiDiaProjection({
    plan_reference: PLAN,
    timelines: [
      timelineFor("prospect-001", [
        createEvent(
          "prospect-001",
          "TIMELINE_INITIALIZED",
          0,
        ),
        createEvent(
          "prospect-001",
          "PROSPECT_CREATED",
          1,
        ),
        createEvent(
          "prospect-001",
          "DUE_ACTION_CREATED",
          2,
        ),
      ]),
    ],
  });

  assert.equal(Object.isFrozen(projection), true);
  assert.equal(Object.isFrozen(projection.items), true);
  assert.equal(
    Object.isFrozen(projection.items[0]),
    true,
  );
  assert.equal(
    Object.isFrozen(
      projection.counts_by_action,
    ),
    true,
  );
  assert.throws(
    () => {
      projection.items.push({});
    },
    TypeError,
  );
});

test("FES 03F does not mutate source timelines", () => {
  const timelines = [
    baseTimeline("prospect-001"),
    baseTimeline("prospect-002"),
  ];
  const before = JSON.stringify(timelines);

  createMiDiaProjection({
    plan_reference: PLAN,
    timelines,
  });

  assert.equal(
    JSON.stringify(timelines),
    before,
  );
});

test("FES 03F keeps plan identity stable while digest follows source state", () => {
  const base = createMiDiaProjection({
    plan_reference: PLAN,
    timelines: [baseTimeline("prospect-001")],
  });
  const extended = createMiDiaProjection({
    plan_reference: PLAN,
    timelines: [
      timelineFor("prospect-001", [
        createEvent(
          "prospect-001",
          "TIMELINE_INITIALIZED",
          0,
        ),
        createEvent(
          "prospect-001",
          "PROSPECT_CREATED",
          1,
        ),
        createEvent(
          "prospect-001",
          "DUE_ACTION_CREATED",
          2,
        ),
      ]),
    ],
  });

  assert.equal(
    base.projection_id,
    extended.projection_id,
  );
  assert.notEqual(
    base.projection_digest,
    extended.projection_digest,
  );
});
