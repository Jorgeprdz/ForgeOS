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
const runtime = require(
  "../platform/event-evidence/projection-runtime.js",
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
  RUNTIME_CONTRACT_VERSION,
  SNAPSHOT_VERSION,
  BUNDLE_VERSION,
  deriveSnapshotId,
  createProjectionRuntimeSnapshot,
  assertProjectionRuntimeSnapshot,
  validateProjectionRuntimeSnapshot,
  rebuildProjectionRuntimeSnapshot,
} = runtime;

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
  tenantId = TENANT,
) {
  const common = {
    event_type: eventType,
    tenant_id: tenantId,
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
      `${tenantId}-${prospectId}-${eventType.toLowerCase()}-${index}`,
    privacy_class: "PRIVATE",
    learning_eligibility: false,
    provenance: {
      source_system: "fes-03g-test",
      source_record_id:
        `${tenantId}-${prospectId}-record-${index}`,
      captured_via: "FORGE_SYSTEM",
      evidence_references: [
        `${tenantId}-${prospectId}-evidence-${index}`,
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
    PROSPECT_PROFILE_CREATED: {
      payload: {
        profile_reference:
          `${prospectId}-profile`,
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
    DUE_ACTION_RESCHEDULED: {
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
        previous_due_at:
          "2026-08-01T16:00:00.000Z",
        due_at:
          "2026-08-02T16:00:00.000Z",
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
          "2026-08-02T17:00:00.000Z",
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
  tenantId = TENANT,
  correlationId = `corr-${prospectId}`,
) {
  return createCanonicalActivityEvent(
    eventInput(
      prospectId,
      correlationId,
      eventType,
      index,
      overrides,
      tenantId,
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

function timelineFor(
  prospectId,
  events,
  {
    tenantId = TENANT,
    correlationId = `corr-${prospectId}`,
  } = {},
) {
  return createCanonicalActivityTimeline({
    tenant_id: tenantId,
    correlation_id: correlationId,
    ledger_records: events.map(recordFor),
  });
}

function baseTimeline(
  prospectId,
  options = {},
) {
  const tenantId =
    options.tenantId || TENANT;
  const correlationId =
    options.correlationId ||
    `corr-${prospectId}`;

  return timelineFor(
    prospectId,
    [
      createEvent(
        prospectId,
        "TIMELINE_INITIALIZED",
        0,
        {},
        tenantId,
        correlationId,
      ),
      createEvent(
        prospectId,
        "PROSPECT_CREATED",
        1,
        {},
        tenantId,
        correlationId,
      ),
    ],
    { tenantId, correlationId },
  );
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
        source_system: "fes-03g-test",
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

test("FES 03G exposes locked runtime contracts", () => {
  assert.equal(RUNTIME_CONTRACT_VERSION, "FES-03G.1");
  assert.equal(
    SNAPSHOT_VERSION,
    "forge.projection_runtime_snapshot.v1",
  );
  assert.equal(
    BUNDLE_VERSION,
    "forge.projection_runtime_bundle.v1",
  );
});

test("FES 03G requires explicit plan reference", () => {
  assert.throws(
    () =>
      createProjectionRuntimeSnapshot({
        timelines: [baseTimeline("prospect-001")],
      }),
    error =>
      error.code ===
      "PROJECTION_RUNTIME_PLAN_INVALID",
  );
});

test("FES 03G requires at least one timeline", () => {
  assert.throws(
    () =>
      createProjectionRuntimeSnapshot({
        plan_reference: PLAN,
        timelines: [],
      }),
    error =>
      error.code ===
      "PROJECTION_RUNTIME_TIMELINES_REQUIRED",
  );
});

test("FES 03G builds the complete lineage from one timeline", () => {
  const snapshot =
    createProjectionRuntimeSnapshot({
      plan_reference: PLAN,
      timelines: [baseTimeline("prospect-001")],
    });
  const bundle = snapshot.bundles[0];

  assert.equal(snapshot.source_timeline_count, 1);
  assert.equal(snapshot.prospect_count, 1);
  assert.equal(
    bundle.activity.source_timeline_digest,
    bundle.timeline_digest,
  );
  assert.equal(
    bundle.prospect_detail
      .source_activity_projection_digest,
    bundle.activity.projection_digest,
  );
  assert.equal(
    bundle.pipeline_card
      .source_prospect_detail_digest,
    bundle.prospect_detail.projection_digest,
  );
  assert.deepEqual(
    Object.values(bundle.lineage),
    [true, true, true, true, true],
  );
});

test("FES 03G orders bundles by prospect identity", () => {
  const snapshot =
    createProjectionRuntimeSnapshot({
      plan_reference: PLAN,
      timelines: [
        baseTimeline("prospect-z"),
        baseTimeline("prospect-a"),
      ],
    });

  assert.deepEqual(
    snapshot.bundles.map(
      bundle => bundle.prospect_id,
    ),
    ["prospect-a", "prospect-z"],
  );
});

test("FES 03G is independent from input order", () => {
  const leftTimeline =
    baseTimeline("prospect-left");
  const rightTimeline =
    baseTimeline("prospect-right");

  const left =
    createProjectionRuntimeSnapshot({
      plan_reference: PLAN,
      timelines: [
        leftTimeline,
        rightTimeline,
      ],
    });
  const right =
    createProjectionRuntimeSnapshot({
      plan_reference: PLAN,
      timelines: [
        rightTimeline,
        leftTimeline,
      ],
    });

  assert.deepEqual(left, right);
});

test("FES 03G deduplicates exact timeline replay", () => {
  const timeline =
    baseTimeline("prospect-001");
  const snapshot =
    createProjectionRuntimeSnapshot({
      plan_reference: PLAN,
      timelines: [
        timeline,
        JSON.parse(JSON.stringify(timeline)),
      ],
    });

  assert.equal(snapshot.source_timeline_count, 1);
  assert.equal(snapshot.prospect_count, 1);
});

test("FES 03G rejects incompatible timelines for the same prospect", () => {
  const first =
    baseTimeline("prospect-001");
  const second =
    baseTimeline("prospect-001", {
      correlationId:
        "corr-prospect-001-foreign",
    });

  assert.throws(
    () =>
      createProjectionRuntimeSnapshot({
        plan_reference: PLAN,
        timelines: [first, second],
      }),
    error =>
      error.code ===
      "PROJECTION_RUNTIME_DUPLICATE_PROSPECT_CONFLICT",
  );
});

test("FES 03G rejects mixed tenants", () => {
  const foreign = baseTimeline(
    "prospect-foreign",
    {
      tenantId: "tenant-foreign",
      correlationId:
        "corr-prospect-foreign",
    },
  );

  assert.throws(
    () =>
      createProjectionRuntimeSnapshot({
        plan_reference: PLAN,
        timelines: [
          baseTimeline("prospect-001"),
          foreign,
        ],
      }),
    error =>
      error.code ===
      "PROJECTION_RUNTIME_TENANT_MISMATCH",
  );
});

test("FES 03G preserves unknown profile state", () => {
  const snapshot =
    createProjectionRuntimeSnapshot({
      plan_reference: PLAN,
      timelines: [baseTimeline("prospect-001")],
    });

  assert.equal(
    snapshot.bundles[0]
      .prospect_detail.profile.state,
    "UNKNOWN",
  );
});

test("FES 03G carries reported context through every applicable read model", () => {
  const prospectId = "prospect-001";
  const timeline = timelineFor(prospectId, [
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
  ]);
  const snapshot =
    createProjectionRuntimeSnapshot({
      plan_reference: PLAN,
      timelines: [timeline],
    });
  const bundle = snapshot.bundles[0];

  assert.equal(
    bundle.activity.pending_count,
    1,
  );
  assert.equal(
    bundle.prospect_detail
      .contexts[0].state,
    "REPORTED_REVIEWABLE",
  );
  assert.equal(
    bundle.pipeline_card
      .primary_attention,
    "PENDING_CONFIRMATION",
  );
  assert.equal(
    snapshot.mi_dia.items[0]
      .action_code,
    "REVIEW_PENDING_CONFIRMATION",
  );
});

test("FES 03G carries appointment outcome work into Mi Día", () => {
  const prospectId = "prospect-001";
  const timeline = timelineFor(prospectId, [
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
  ]);
  const snapshot =
    createProjectionRuntimeSnapshot({
      plan_reference: PLAN,
      timelines: [timeline],
    });
  const bundle = snapshot.bundles[0];

  assert.equal(
    bundle.pipeline_card
      .pending_outcome.state,
    "APPOINTMENT_OUTCOME_PENDING",
  );
  assert.equal(
    snapshot.mi_dia.items[0]
      .action_code,
    "CONFIRM_APPOINTMENT_OUTCOME",
  );
});

test("FES 03G carries optional context after held appointment", () => {
  const prospectId = "prospect-001";
  const timeline = timelineFor(prospectId, [
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
  ]);
  const snapshot =
    createProjectionRuntimeSnapshot({
      plan_reference: PLAN,
      timelines: [timeline],
    });

  assert.equal(
    snapshot.mi_dia.items[0]
      .action_code,
    "ADD_OPTIONAL_CONTEXT",
  );
  assert.equal(
    snapshot.mi_dia.items[0].required,
    false,
  );
});

test("FES 03G carries open due follow-up into card and Mi Día", () => {
  const prospectId = "prospect-001";
  const timeline = timelineFor(prospectId, [
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
  ]);
  const snapshot =
    createProjectionRuntimeSnapshot({
      plan_reference: PLAN,
      timelines: [timeline],
    });
  const bundle = snapshot.bundles[0];

  assert.equal(
    bundle.pipeline_card
      .due_follow_up.due_at,
    "2026-08-01T16:00:00.000Z",
  );
  assert.equal(
    snapshot.mi_dia.items[0]
      .action_code,
    "PERFORM_DUE_FOLLOW_UP",
  );
});

test("FES 03G removes completed due work from card and Mi Día", () => {
  const prospectId = "prospect-001";
  const timeline = timelineFor(prospectId, [
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
  ]);
  const snapshot =
    createProjectionRuntimeSnapshot({
      plan_reference: PLAN,
      timelines: [timeline],
    });

  assert.equal(
    snapshot.bundles[0]
      .pipeline_card.due_follow_up,
    null,
  );
  assert.equal(
    snapshot.mi_dia.work_item_count,
    0,
  );
});

test("FES 03G propagates an effective correction without deleting history", () => {
  const prospectId = "prospect-001";
  const original = createEvent(
    prospectId,
    "DUE_ACTION_CREATED",
    2,
  );
  const correction = dueCorrection(
    prospectId,
    original,
    3,
    "runtime-due-correction",
    "2026-08-04T16:00:00.000Z",
  );
  const timeline = timelineFor(prospectId, [
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
    correction,
  ]);
  const snapshot =
    createProjectionRuntimeSnapshot({
      plan_reference: PLAN,
      timelines: [timeline],
    });
  const bundle = snapshot.bundles[0];

  assert.equal(
    bundle.activity.correction_count,
    1,
  );
  assert.equal(
    bundle.prospect_detail
      .due_actions[0].due_at,
    "2026-08-04T16:00:00.000Z",
  );
  assert.equal(
    bundle.pipeline_card
      .due_follow_up.due_at,
    "2026-08-04T16:00:00.000Z",
  );
  assert.equal(
    snapshot.mi_dia.items[0].due_at,
    "2026-08-04T16:00:00.000Z",
  );
  assert.equal(
    bundle.activity.items.length,
    4,
  );
});

test("FES 03G promotes a correction fork to reviewable blocking work", () => {
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
    "runtime-left",
    "2026-08-04T16:00:00.000Z",
  );
  const right = dueCorrection(
    prospectId,
    original,
    4,
    "runtime-right",
    "2026-08-05T16:00:00.000Z",
  );
  const timeline = timelineFor(prospectId, [
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
  ]);
  const snapshot =
    createProjectionRuntimeSnapshot({
      plan_reference: PLAN,
      timelines: [timeline],
    });
  const bundle = snapshot.bundles[0];

  assert.equal(
    bundle.prospect_detail
      .correction_conflicts.length,
    1,
  );
  assert.equal(
    bundle.pipeline_card
      .operational_status,
    "BLOCKED_BY_CONFLICT",
  );
  assert.equal(
    snapshot.mi_dia.items[0]
      .action_code,
    "RESOLVE_CONFLICT",
  );
});

test("FES 03G binds Mi Día source cards to runtime bundles", () => {
  const snapshot =
    createProjectionRuntimeSnapshot({
      plan_reference: PLAN,
      timelines: [
        baseTimeline("prospect-a"),
        baseTimeline("prospect-b"),
      ],
    });

  const cards = new Map(
    snapshot.bundles.map(bundle => [
      bundle.prospect_id,
      bundle.pipeline_card,
    ]),
  );

  for (const reference of
    snapshot.mi_dia.source_card_digests) {
    const card = cards.get(
      reference.prospect_id,
    );

    assert.equal(
      reference.projection_id,
      card.projection_id,
    );
    assert.equal(
      reference.projection_digest,
      card.projection_digest,
    );
  }
});

test("FES 03G exposes all acceptance invariants", () => {
  const snapshot =
    createProjectionRuntimeSnapshot({
      plan_reference: PLAN,
      timelines: [baseTimeline("prospect-001")],
    });

  assert.deepEqual(snapshot.acceptance, {
    canonical_timeline_only: true,
    shared_timeline_lineage: true,
    tenant_isolation: true,
    deterministic_bundle_order: true,
    deterministic_rebuild: true,
    unknown_remains_unknown: true,
    pending_state_explicit: true,
    conflicts_reviewable: true,
    corrections_append_only_visible: true,
    detached_projection_authority: false,
    productive_ui_binding: false,
    wall_clock_inference: false,
    alfred_generation: false,
    external_execution: false,
  });
});

test("FES 03G preserves explicit unsupported Mi Día intelligence", () => {
  const snapshot =
    createProjectionRuntimeSnapshot({
      plan_reference: PLAN,
      timelines: [baseTimeline("prospect-001")],
    });

  assert.equal(
    snapshot.mi_dia.unsupported_signals
      .includes("close_probability"),
    true,
  );
  assert.equal(
    snapshot.mi_dia.unsupported_signals
      .includes(
        "alfred_generated_recommendation",
      ),
    true,
  );
});

test("FES 03G derives stable snapshot identity", () => {
  const snapshot =
    createProjectionRuntimeSnapshot({
      plan_reference: PLAN,
      timelines: [baseTimeline("prospect-001")],
    });
  const expected = deriveSnapshotId({
    tenant_id: TENANT,
    plan_reference: PLAN,
  });

  assert.equal(snapshot.snapshot_id, expected);
  assert.match(
    snapshot.snapshot_id,
    /^runtime_[a-f0-9]{32}$/,
  );
});

test("FES 03G is deterministic for equivalent source", () => {
  const timelines = [
    baseTimeline("prospect-a"),
    baseTimeline("prospect-b"),
  ];
  const left =
    createProjectionRuntimeSnapshot({
      plan_reference: PLAN,
      timelines,
    });
  const right =
    createProjectionRuntimeSnapshot({
      plan_reference: PLAN,
      timelines: JSON.parse(
        JSON.stringify(timelines),
      ),
    });

  assert.deepEqual(left, right);
  assert.equal(
    left.snapshot_digest,
    right.snapshot_digest,
  );
});

test("FES 03G rebuilds byte-equivalent output", () => {
  const timelines = [
    baseTimeline("prospect-001"),
  ];
  const snapshot =
    createProjectionRuntimeSnapshot({
      plan_reference: PLAN,
      timelines,
    });
  const rebuilt =
    rebuildProjectionRuntimeSnapshot({
      snapshot,
      plan_reference: PLAN,
      timelines,
    });

  assert.deepEqual(rebuilt, snapshot);
});

test("FES 03G rejects validation against different source", () => {
  const snapshot =
    createProjectionRuntimeSnapshot({
      plan_reference: PLAN,
      timelines: [baseTimeline("prospect-001")],
    });
  const report =
    validateProjectionRuntimeSnapshot(
      snapshot,
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
    "PROJECTION_RUNTIME_SNAPSHOT_NOT_CANONICAL",
  );
});

test("FES 03G detects a tampered nested projection", () => {
  const source = {
    plan_reference: PLAN,
    timelines: [
      baseTimeline("prospect-001"),
    ],
  };
  const snapshot =
    createProjectionRuntimeSnapshot(source);
  const tampered =
    JSON.parse(JSON.stringify(snapshot));
  tampered.bundles[0]
    .pipeline_card.stage.code =
    "APPOINTMENT_HELD";

  const report =
    validateProjectionRuntimeSnapshot(
      tampered,
      source,
    );

  assert.equal(report.valid, false);
  assert.equal(
    report.errors[0].code,
    "PROJECTION_RUNTIME_SNAPSHOT_NOT_CANONICAL",
  );
});

test("FES 03G rejects unsupported snapshot fields", () => {
  const source = {
    plan_reference: PLAN,
    timelines: [
      baseTimeline("prospect-001"),
    ],
  };
  const snapshot =
    createProjectionRuntimeSnapshot(source);
  const tampered = {
    ...JSON.parse(JSON.stringify(snapshot)),
    productive_ui_bound: true,
  };

  assert.throws(
    () =>
      assertProjectionRuntimeSnapshot(
        tampered,
        source,
      ),
    error =>
      error.code ===
        "PROJECTION_RUNTIME_SNAPSHOT_FIELDS_INVALID" &&
      error.details.unsupported_keys.includes(
        "productive_ui_bound",
      ),
  );
});

test("FES 03G rejects unsupported bundle fields", () => {
  const source = {
    plan_reference: PLAN,
    timelines: [
      baseTimeline("prospect-001"),
    ],
  };
  const snapshot =
    createProjectionRuntimeSnapshot(source);
  const tampered =
    JSON.parse(JSON.stringify(snapshot));
  tampered.bundles[0].owns_truth = true;

  assert.throws(
    () =>
      assertProjectionRuntimeSnapshot(
        tampered,
        source,
      ),
    error =>
      error.code ===
        "PROJECTION_RUNTIME_BUNDLE_FIELDS_INVALID" &&
      error.details.unsupported_keys.includes(
        "owns_truth",
      ),
  );
});

test("FES 03G output is deeply immutable", () => {
  const snapshot =
    createProjectionRuntimeSnapshot({
      plan_reference: PLAN,
      timelines: [baseTimeline("prospect-001")],
    });

  assert.equal(Object.isFrozen(snapshot), true);
  assert.equal(
    Object.isFrozen(snapshot.bundles),
    true,
  );
  assert.equal(
    Object.isFrozen(snapshot.bundles[0]),
    true,
  );
  assert.equal(
    Object.isFrozen(
      snapshot.bundles[0].activity,
    ),
    true,
  );
  assert.equal(
    Object.isFrozen(snapshot.mi_dia),
    true,
  );
  assert.throws(
    () => {
      snapshot.bundles.push({});
    },
    TypeError,
  );
});

test("FES 03G does not mutate source timelines", () => {
  const timelines = [
    baseTimeline("prospect-a"),
    baseTimeline("prospect-b"),
  ];
  const before = JSON.stringify(timelines);

  createProjectionRuntimeSnapshot({
    plan_reference: PLAN,
    timelines,
  });

  assert.equal(
    JSON.stringify(timelines),
    before,
  );
});

test("FES 03G keeps identity stable while digest follows source state", () => {
  const base =
    createProjectionRuntimeSnapshot({
      plan_reference: PLAN,
      timelines: [
        baseTimeline("prospect-001"),
      ],
    });
  const prospectId = "prospect-001";
  const extended =
    createProjectionRuntimeSnapshot({
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
    base.snapshot_id,
    extended.snapshot_id,
  );
  assert.notEqual(
    base.snapshot_digest,
    extended.snapshot_digest,
  );
});
