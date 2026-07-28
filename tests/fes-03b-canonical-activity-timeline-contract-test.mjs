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

const {
  DEFAULT_SAFETY_FLAGS,
  createCanonicalActivityEvent,
  createCanonicalActivityCorrection,
  deriveCanonicalEventId,
} = canonical;

const {
  createLedgerRecord,
} = ledger;

const {
  CONTRACT_VERSION,
  TIMELINE_VERSION,
  ENTRY_VERSION,
  ORDERING,
  deriveTimelineId,
  createCanonicalActivityTimeline,
  assertCanonicalActivityTimeline,
  validateCanonicalActivityTimeline,
  rebuildCanonicalActivityTimeline,
  findTimelineEntry,
} = timelineContract;

const TENANT = "tenant-advisor-001";
const CORRELATION = "corr-first-vertical-001";
const TIMELINE_REFERENCE = "timeline-001";

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
      id: "prospect-001",
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
    idempotency_key: `fes03b-${eventType.toLowerCase()}-${index}`,
    privacy_class: "PRIVATE",
    learning_eligibility: false,
    provenance: {
      source_system: "fes-03b-test",
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
        prospect_reference: "prospect-001",
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
        due_at: "2026-07-29T16:00:00.000Z",
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

function baseRecords() {
  const events = [
    createEvent("TIMELINE_INITIALIZED", 0),
    createEvent("PROSPECT_CREATED", 1),
    createEvent("INITIAL_CONTEXT_CAPTURED", 2),
    createEvent("APPOINTMENT_SCHEDULED", 3),
    createEvent("ACTIVITY_CONTEXT_ADDED", 4),
    createEvent("DUE_ACTION_CREATED", 5),
  ];

  return [
    recordFor(events[5]),
    recordFor(events[2]),
    recordFor(events[0]),
    recordFor(events[4]),
    recordFor(events[1]),
    recordFor(events[3]),
  ];
}

function createDueActionCorrection(original, index, overrides = {}) {
  return createCanonicalActivityCorrection(original, {
    actor: {
      type: "ADVISOR",
      id: "advisor-001",
    },
    source: {
      type: "ADVISOR_CONFIRMED",
      reference: `correction-${index}`,
      channel: "FORGE_UI",
    },
    evidence_strength: "HUMAN_CONFIRMED",
    occurred_at: iso(index),
    recorded_at: iso(index, 1),
    idempotency_key: `fes03b-correction-${index}`,
    privacy_class: "PRIVATE",
    payload: {
      due_action_reference: "due-action-001",
      action_type: "CALL",
      due_at:
        `2026-08-${String(index).padStart(2, "0")}T16:00:00.000Z`,
    },
    provenance: {
      source_system: "fes-03b-test",
      source_record_id: `correction-record-${index}`,
      captured_via: "FORGE_UI",
      evidence_references: [`correction-evidence-${index}`],
    },
    correction_reason_code: "ADVISOR_CORRECTED_DATE",
    confirmation_state: "CONFIRMED",
    safety_flags: {
      ...DEFAULT_SAFETY_FLAGS,
    },
    ...overrides,
  });
}

test("FES 03B exposes the locked timeline contract versions", () => {
  assert.equal(CONTRACT_VERSION, "FES-03B.1");
  assert.equal(TIMELINE_VERSION, "forge.activity_timeline.v1");
  assert.equal(ENTRY_VERSION, "forge.activity_timeline_entry.v1");
  assert.deepEqual(ORDERING, {
    primary: "occurred_at:ASC",
    secondary: "recorded_at:ASC",
    tertiary: "appended_at:ASC",
    tie_breaker: "event_id:ASC",
  });
});

test("FES 03B builds one deterministic timeline from unordered ledger records", () => {
  const timeline = createCanonicalActivityTimeline({
    tenant_id: TENANT,
    correlation_id: CORRELATION,
    ledger_records: baseRecords(),
  });

  assert.equal(timeline.timeline_reference, TIMELINE_REFERENCE);
  assert.equal(timeline.entry_count, 6);
  assert.deepEqual(
    timeline.entries.map(entry => entry.event_type),
    [
      "TIMELINE_INITIALIZED",
      "PROSPECT_CREATED",
      "INITIAL_CONTEXT_CAPTURED",
      "APPOINTMENT_SCHEDULED",
      "ACTIVITY_CONTEXT_ADDED",
      "DUE_ACTION_CREATED",
    ],
  );
  assert.deepEqual(
    timeline.entries.map(entry => entry.position),
    [1, 2, 3, 4, 5, 6],
  );
});

test("FES 03B derives timeline identity from tenant correlation and reference", () => {
  const expected = deriveTimelineId({
    tenant_id: TENANT,
    correlation_id: CORRELATION,
    timeline_reference: TIMELINE_REFERENCE,
  });
  const timeline = createCanonicalActivityTimeline({
    tenant_id: TENANT,
    correlation_id: CORRELATION,
    ledger_records: baseRecords(),
  });

  assert.equal(timeline.timeline_id, expected);
  assert.match(timeline.timeline_id, /^tl_[a-f0-9]{32}$/);
});

test("FES 03B is independent from input order", () => {
  const records = baseRecords();
  const left = createCanonicalActivityTimeline({
    tenant_id: TENANT,
    correlation_id: CORRELATION,
    ledger_records: records,
  });
  const right = createCanonicalActivityTimeline({
    tenant_id: TENANT,
    correlation_id: CORRELATION,
    ledger_records: [...records].reverse(),
  });

  assert.deepEqual(left, right);
  assert.equal(left.timeline_digest, right.timeline_digest);
});

test("FES 03B deduplicates exact idempotent ledger replay", () => {
  const records = baseRecords();
  const timeline = createCanonicalActivityTimeline({
    tenant_id: TENANT,
    correlation_id: CORRELATION,
    ledger_records: [
      ...records,
      JSON.parse(JSON.stringify(records[0])),
    ],
  });

  assert.equal(timeline.entry_count, records.length);
});

test("FES 03B rejects conflicting records for the same event", () => {
  const records = baseRecords();
  const conflicting = createLedgerRecord({
    canonical_event: records[0].canonical_event,
    evidence_references: [],
    appended_at: new Date(
      Date.parse(records[0].appended_at) + 1000,
    ).toISOString(),
  });

  assert.throws(
    () =>
      createCanonicalActivityTimeline({
        tenant_id: TENANT,
        correlation_id: CORRELATION,
        ledger_records: [...records, conflicting],
      }),
    error =>
      error.code === "TIMELINE_DUPLICATE_EVENT_CONFLICT",
  );
});

test("FES 03B rejects cross-tenant records", () => {
  const foreign = createEvent("PROSPECT_CREATED", 7, {
    tenant_id: "tenant-advisor-002",
    idempotency_key: "foreign-tenant-event",
  });

  assert.throws(
    () =>
      createCanonicalActivityTimeline({
        tenant_id: TENANT,
        correlation_id: CORRELATION,
        ledger_records: [
          ...baseRecords(),
          recordFor(foreign),
        ],
      }),
    error => error.code === "TIMELINE_TENANT_MISMATCH",
  );
});

test("FES 03B rejects mixed correlations", () => {
  const foreign = createEvent("PROSPECT_CREATED", 7, {
    correlation_id: "corr-other-vertical",
    idempotency_key: "foreign-correlation-event",
  });

  assert.throws(
    () =>
      createCanonicalActivityTimeline({
        tenant_id: TENANT,
        correlation_id: CORRELATION,
        ledger_records: [
          ...baseRecords(),
          recordFor(foreign),
        ],
      }),
    error => error.code === "TIMELINE_CORRELATION_MISMATCH",
  );
});

test("FES 03B requires correlation on every event", () => {
  const uncorrelated = createEvent("PROSPECT_CREATED", 7, {
    correlation_id: null,
    idempotency_key: "uncorrelated-event",
  });

  assert.throws(
    () =>
      createCanonicalActivityTimeline({
        tenant_id: TENANT,
        correlation_id: CORRELATION,
        ledger_records: [
          ...baseRecords(),
          recordFor(uncorrelated),
        ],
      }),
    error =>
      error.code === "TIMELINE_EVENT_CORRELATION_REQUIRED",
  );
});

test("FES 03B requires exactly one initialization root", () => {
  const withoutRoot = baseRecords().filter(
    record =>
      record.canonical_event.event_type !==
      "TIMELINE_INITIALIZED",
  );

  assert.throws(
    () =>
      createCanonicalActivityTimeline({
        tenant_id: TENANT,
        correlation_id: CORRELATION,
        ledger_records: withoutRoot,
      }),
    error =>
      error.code === "TIMELINE_INITIALIZATION_ROOT_INVALID" &&
      error.details.roots_found === 0,
  );

  const secondRoot = createEvent("TIMELINE_INITIALIZED", 7, {
    idempotency_key: "second-timeline-root",
    payload: {
      timeline_reference: "timeline-002",
    },
  });

  assert.throws(
    () =>
      createCanonicalActivityTimeline({
        tenant_id: TENANT,
        correlation_id: CORRELATION,
        ledger_records: [
          ...baseRecords(),
          recordFor(secondRoot),
        ],
      }),
    error =>
      error.code === "TIMELINE_INITIALIZATION_ROOT_INVALID" &&
      error.details.roots_found === 2,
  );
});

test("FES 03B preserves originals and exposes append-only correction metadata", () => {
  const records = baseRecords();
  const originalRecord = records.find(
    record =>
      record.canonical_event.event_type ===
      "DUE_ACTION_CREATED",
  );
  const correction = createDueActionCorrection(
    originalRecord.canonical_event,
    6,
  );
  const correctionRecord = recordFor(correction);
  const timeline = createCanonicalActivityTimeline({
    tenant_id: TENANT,
    correlation_id: CORRELATION,
    ledger_records: [...records, correctionRecord],
  });

  const originalEntry = findTimelineEntry(
    timeline,
    originalRecord.event_id,
  );
  const correctionEntry = findTimelineEntry(
    timeline,
    correction.event_id,
  );

  assert.equal(originalEntry.is_corrected, true);
  assert.deepEqual(
    originalEntry.corrected_by_event_ids,
    [correction.event_id],
  );
  assert.equal(correctionEntry.is_correction, true);
  assert.equal(
    correctionEntry.correction_of,
    originalRecord.event_id,
  );
  assert.equal(
    correctionEntry.correction_root_event_id,
    originalRecord.event_id,
  );
  assert.equal(correctionEntry.correction_depth, 1);
  assert.equal(timeline.entry_count, records.length + 1);
});

test("FES 03B resolves deterministic correction chains", () => {
  const records = baseRecords();
  const originalRecord = records.find(
    record =>
      record.canonical_event.event_type ===
      "DUE_ACTION_CREATED",
  );
  const first = createDueActionCorrection(
    originalRecord.canonical_event,
    6,
  );
  const second = createDueActionCorrection(first, 7);
  const timeline = createCanonicalActivityTimeline({
    tenant_id: TENANT,
    correlation_id: CORRELATION,
    ledger_records: [
      ...records,
      recordFor(first),
      recordFor(second),
    ],
  });

  const secondEntry = findTimelineEntry(
    timeline,
    second.event_id,
  );

  assert.equal(secondEntry.correction_depth, 2);
  assert.equal(
    secondEntry.correction_root_event_id,
    originalRecord.event_id,
  );
});

test("FES 03B rejects a correction whose target is absent", () => {
  const records = baseRecords();
  const originalRecord = records.find(
    record =>
      record.canonical_event.event_type ===
      "DUE_ACTION_CREATED",
  );
  const correction = createDueActionCorrection(
    originalRecord.canonical_event,
    6,
  );

  assert.throws(
    () =>
      createCanonicalActivityTimeline({
        tenant_id: TENANT,
        correlation_id: CORRELATION,
        ledger_records: [
          ...records.filter(
            record => record.event_id !== originalRecord.event_id,
          ),
          recordFor(correction),
        ],
      }),
    error =>
      error.code === "TIMELINE_CORRECTION_TARGET_MISSING",
  );
});

test("FES 03B rejects correction cycles", () => {
  const idA = deriveCanonicalEventId({
    tenant_id: TENANT,
    event_type: "DUE_ACTION_CREATED",
    idempotency_key: "cycle-a",
  });
  const idB = deriveCanonicalEventId({
    tenant_id: TENANT,
    event_type: "DUE_ACTION_CREATED",
    idempotency_key: "cycle-b",
  });

  function cycleEvent(key, correctionOf, hour) {
    return createCanonicalActivityEvent({
      ...eventInput("DUE_ACTION_CREATED", hour, {
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
        idempotency_key: key,
        confirmation_state: "CONFIRMED",
        correction_of: correctionOf,
        provenance: {
          source_system: "fes-03b-test",
          source_record_id: key,
          captured_via: "FORGE_UI",
          evidence_references: [`evidence-${key}`],
          correction_reason_code: "CYCLE_TEST",
        },
      }),
    });
  }

  const eventA = cycleEvent("cycle-a", idB, 6);
  const eventB = cycleEvent("cycle-b", idA, 7);

  assert.throws(
    () =>
      createCanonicalActivityTimeline({
        tenant_id: TENANT,
        correlation_id: CORRELATION,
        ledger_records: [
          ...baseRecords(),
          recordFor(eventA),
          recordFor(eventB),
        ],
      }),
    error => error.code === "TIMELINE_CORRECTION_CYCLE",
  );
});

test("FES 03B rejects corrections recorded before their target", () => {
  const records = baseRecords();
  const originalRecord = records.find(
    record =>
      record.canonical_event.event_type ===
      "DUE_ACTION_CREATED",
  );
  const correction = createDueActionCorrection(
    originalRecord.canonical_event,
    4,
    {
      occurred_at: iso(4),
      recorded_at: iso(4, 1),
      idempotency_key: "recorded-before-target",
    },
  );

  assert.throws(
    () =>
      createCanonicalActivityTimeline({
        tenant_id: TENANT,
        correlation_id: CORRELATION,
        ledger_records: [
          ...records,
          recordFor(correction, iso(6, 2)),
        ],
      }),
    error =>
      error.code ===
      "TIMELINE_CORRECTION_RECORDED_BEFORE_TARGET",
  );
});

test("FES 03B rejects corrections appended before their target", () => {
  const records = baseRecords();
  const originalIndex = records.findIndex(
    record =>
      record.canonical_event.event_type ===
      "DUE_ACTION_CREATED",
  );
  const originalEvent =
    records[originalIndex].canonical_event;
  const delayedOriginal = recordFor(
    originalEvent,
    iso(9),
  );
  records[originalIndex] = delayedOriginal;

  const correction = createDueActionCorrection(
    originalEvent,
    6,
  );

  assert.throws(
    () =>
      createCanonicalActivityTimeline({
        tenant_id: TENANT,
        correlation_id: CORRELATION,
        ledger_records: [
          ...records,
          recordFor(correction, iso(7)),
        ],
      }),
    error =>
      error.code ===
      "TIMELINE_CORRECTION_APPENDED_BEFORE_TARGET",
  );
});

test("FES 03B rebuilds byte-equivalent canonical output", () => {
  const timeline = createCanonicalActivityTimeline({
    tenant_id: TENANT,
    correlation_id: CORRELATION,
    ledger_records: baseRecords(),
  });
  const rebuilt = rebuildCanonicalActivityTimeline(timeline);

  assert.deepEqual(rebuilt, timeline);
  assert.equal(rebuilt.timeline_digest, timeline.timeline_digest);
});

test("FES 03B validation detects tampered derived metadata", () => {
  const timeline = createCanonicalActivityTimeline({
    tenant_id: TENANT,
    correlation_id: CORRELATION,
    ledger_records: baseRecords(),
  });
  const tampered = JSON.parse(JSON.stringify(timeline));
  tampered.entries[0].position = 99;

  const report = validateCanonicalActivityTimeline(tampered);

  assert.equal(report.valid, false);
  assert.equal(report.errors[0].code, "TIMELINE_NOT_CANONICAL");
});

test("FES 03B rejects unsupported timeline fields", () => {
  const timeline = createCanonicalActivityTimeline({
    tenant_id: TENANT,
    correlation_id: CORRELATION,
    ledger_records: baseRecords(),
  });
  const tampered = {
    ...JSON.parse(JSON.stringify(timeline)),
    projection_state: "OPEN",
  };

  assert.throws(
    () => assertCanonicalActivityTimeline(tampered),
    error =>
      error.code === "TIMELINE_FIELDS_INVALID" &&
      error.details.unsupported_keys.includes(
        "projection_state",
      ),
  );
});

test("FES 03B output is deeply immutable", () => {
  const timeline = createCanonicalActivityTimeline({
    tenant_id: TENANT,
    correlation_id: CORRELATION,
    ledger_records: baseRecords(),
  });

  assert.equal(Object.isFrozen(timeline), true);
  assert.equal(Object.isFrozen(timeline.entries), true);
  assert.equal(Object.isFrozen(timeline.entries[0]), true);
  assert.equal(
    Object.isFrozen(timeline.entries[0].ledger_record),
    true,
  );
  assert.throws(
    () => {
      timeline.entries.push({});
    },
    TypeError,
  );
});

test("FES 03B does not mutate the ledger input", () => {
  const records = baseRecords();
  const before = JSON.stringify(records);

  createCanonicalActivityTimeline({
    tenant_id: TENANT,
    correlation_id: CORRELATION,
    ledger_records: records,
  });

  assert.equal(JSON.stringify(records), before);
});

test("FES 03B uses event identity as the final deterministic tie breaker", () => {
  const first = createEvent("PROSPECT_CREATED", 8, {
    occurred_at: iso(8),
    recorded_at: iso(8, 1),
    idempotency_key: "tie-breaker-a",
  });
  const second = createEvent("PROSPECT_CREATED", 8, {
    occurred_at: iso(8),
    recorded_at: iso(8, 1),
    idempotency_key: "tie-breaker-b",
  });
  const appendedAt = iso(8, 2);
  const timeline = createCanonicalActivityTimeline({
    tenant_id: TENANT,
    correlation_id: CORRELATION,
    ledger_records: [
      ...baseRecords(),
      recordFor(second, appendedAt),
      recordFor(first, appendedAt),
    ],
  });
  const tied = timeline.entries
    .filter(entry =>
      [first.event_id, second.event_id].includes(entry.event_id),
    )
    .map(entry => entry.event_id);

  assert.deepEqual(
    tied,
    [first.event_id, second.event_id].sort(),
  );
});
