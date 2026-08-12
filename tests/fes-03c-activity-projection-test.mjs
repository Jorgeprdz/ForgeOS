import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const canonical = require("../platform/event-evidence/canonical-activity-event-contract.js");
const ledger = require("../platform/event-evidence/activity-ledger-contract.js");
const timelineContract = require("../platform/event-evidence/canonical-activity-timeline-contract.js");
const projectionContract = require("../platform/event-evidence/activity-projection.js");

const { DEFAULT_SAFETY_FLAGS, EVENT_TYPES, createCanonicalActivityEvent, createCanonicalActivityCorrection } = canonical;
const { createLedgerRecord } = ledger;
const { createCanonicalActivityTimeline } = timelineContract;
const { PROJECTION_CONTRACT_VERSION, PROJECTION_VERSION, ITEM_VERSION, ORDERING, EVENT_PRESENTATION, deriveActivityProjectionId, createActivityProjection, assertActivityProjection, validateActivityProjection, rebuildActivityProjection, findActivityItem } = projectionContract;

const TENANT = "tenant-advisor-001";
const CORRELATION = "corr-first-vertical-001";
const TIMELINE_REFERENCE = "timeline-001";
const iso = (hour, second = 0) => `2026-07-26T${String(hour).padStart(2, "0")}:00:${String(second).padStart(2, "0")}.000Z`;

function eventInput(eventType, index, overrides = {}) {
  const common = {
    event_type: eventType,
    tenant_id: TENANT,
    actor: { type: "SYSTEM", id: "forge-system" },
    subject: { type: "PROSPECT", id: "prospect-001" },
    source: { type: "SYSTEM_OBSERVED", reference: `source-${index}`, channel: "FORGE_SYSTEM" },
    evidence_strength: "SYSTEM_OBSERVED",
    occurred_at: iso(index),
    recorded_at: iso(index, 1),
    effective_period: null,
    causation_id: null,
    correlation_id: CORRELATION,
    idempotency_key: `fes03c-${eventType.toLowerCase()}-${index}`,
    privacy_class: "PRIVATE",
    learning_eligibility: false,
    provenance: { source_system: "fes-03c-test", source_record_id: `record-${index}`, captured_via: "FORGE_SYSTEM", evidence_references: [`evidence-${index}`] },
    confirmation_state: "CONFIRMED",
    correction_of: null,
    safety_flags: { ...DEFAULT_SAFETY_FLAGS },
  };
  const fixtures = {
    PROSPECT_PROFILE_CREATED: { payload: { profile_reference: "profile-001" } },
    PROSPECT_CREATED: { payload: { prospect_reference: "prospect-001", source_category: "REFERRAL" } },
    INITIAL_CONTEXT_CAPTURED: { actor: { type: "ADVISOR", id: "advisor-001" }, source: { type: "ADVISOR_REPORTED", reference: `context-${index}`, channel: "FORGE_UI" }, evidence_strength: "REPORTED", confirmation_state: "REPORTED", payload: { context_reference: "context-001", capture_mode: "VOICE" } },
    TIMELINE_INITIALIZED: { payload: { timeline_reference: TIMELINE_REFERENCE } },
    APPOINTMENT_SCHEDULED: { actor: { type: "EXTERNAL_PROVIDER", id: "google-calendar" }, subject: { type: "APPOINTMENT", id: "appointment-001" }, source: { type: "EXTERNAL_PROVIDER_CONFIRMED", reference: "google-event-001", channel: "GOOGLE_CALENDAR" }, evidence_strength: "EXTERNAL_CONFIRMED", payload: { appointment_reference: "appointment-001", starts_at: "2026-07-27T16:00:00.000Z", ends_at: "2026-07-27T17:00:00.000Z", provider_event_reference: "google-event-001" } },
    APPOINTMENT_HELD: { actor: { type: "ADVISOR", id: "advisor-001" }, subject: { type: "APPOINTMENT", id: "appointment-001" }, source: { type: "ADVISOR_CONFIRMED", reference: "probe-001", channel: "FORGE_UI" }, evidence_strength: "HUMAN_CONFIRMED", payload: { appointment_reference: "appointment-001", outcome_confirmed_at: "2026-07-27T17:30:00.000Z" } },
    APPOINTMENT_NOT_HELD: { actor: { type: "ADVISOR", id: "advisor-001" }, subject: { type: "APPOINTMENT", id: "appointment-002" }, source: { type: "ADVISOR_CONFIRMED", reference: "probe-002", channel: "FORGE_UI" }, evidence_strength: "HUMAN_CONFIRMED", payload: { appointment_reference: "appointment-002", reason_code: "PROSPECT_CANCELLED", outcome_confirmed_at: "2026-07-27T17:30:00.000Z" } },
    APPOINTMENT_RESCHEDULED: { actor: { type: "ADVISOR", id: "advisor-001" }, subject: { type: "APPOINTMENT", id: "appointment-003" }, source: { type: "ADVISOR_CONFIRMED", reference: "probe-003", channel: "FORGE_UI" }, evidence_strength: "HUMAN_CONFIRMED", payload: { appointment_reference: "appointment-003", previous_starts_at: "2026-07-27T16:00:00.000Z", starts_at: "2026-07-28T18:00:00.000Z", ends_at: "2026-07-28T19:00:00.000Z" } },
    APPOINTMENT_NO_SHOW: { actor: { type: "ADVISOR", id: "advisor-001" }, subject: { type: "APPOINTMENT", id: "appointment-004" }, source: { type: "ADVISOR_CONFIRMED", reference: "probe-004", channel: "FORGE_UI" }, evidence_strength: "HUMAN_CONFIRMED", payload: { appointment_reference: "appointment-004", party: "PROSPECT", outcome_confirmed_at: "2026-07-27T17:30:00.000Z" } },
    ACTIVITY_CONTEXT_ADDED: { actor: { type: "ADVISOR", id: "advisor-001" }, subject: { type: "ACTIVITY", id: "activity-001" }, source: { type: "ADVISOR_REPORTED", reference: `activity-${index}`, channel: "FORGE_UI" }, evidence_strength: "REPORTED", confirmation_state: "REPORTED", payload: { activity_reference: "activity-001", context_reference: "context-activity-001", capture_mode: "TEXT" } },
    DUE_ACTION_CREATED: { subject: { type: "DUE_ACTION", id: "due-action-001" }, source: { type: "SYSTEM_OBSERVED", reference: `due-${index}`, channel: "PIPELINE" }, payload: { due_action_reference: "due-action-001", action_type: "CALL", due_at: "2026-08-01T16:00:00.000Z" } },
    DUE_ACTION_RESCHEDULED: { subject: { type: "DUE_ACTION", id: "due-action-001" }, source: { type: "SYSTEM_OBSERVED", reference: `due-${index}`, channel: "PIPELINE" }, payload: { due_action_reference: "due-action-001", previous_due_at: "2026-08-01T16:00:00.000Z", due_at: "2026-08-02T16:00:00.000Z" } },
    DUE_ACTION_COMPLETED: { subject: { type: "DUE_ACTION", id: "due-action-001" }, source: { type: "SYSTEM_OBSERVED", reference: `due-${index}`, channel: "PIPELINE" }, payload: { due_action_reference: "due-action-001", completed_at: "2026-08-02T17:00:00.000Z" } },
  };
  return { ...common, ...fixtures[eventType], ...overrides };
}

const createEvent = (eventType, index, overrides = {}) => createCanonicalActivityEvent(eventInput(eventType, index, overrides));
const recordFor = event => createLedgerRecord({ canonical_event: event, evidence_references: [], appended_at: new Date(Date.parse(event.recorded_at) + 1000).toISOString() });
const timelineFor = events => createCanonicalActivityTimeline({ tenant_id: TENANT, correlation_id: CORRELATION, ledger_records: events.map(recordFor) });

function fullTimeline() {
  const order = ["TIMELINE_INITIALIZED", "PROSPECT_PROFILE_CREATED", "PROSPECT_CREATED", "INITIAL_CONTEXT_CAPTURED", "APPOINTMENT_SCHEDULED", "APPOINTMENT_HELD", "APPOINTMENT_NOT_HELD", "APPOINTMENT_RESCHEDULED", "APPOINTMENT_NO_SHOW", "ACTIVITY_CONTEXT_ADDED", "DUE_ACTION_CREATED", "DUE_ACTION_RESCHEDULED", "DUE_ACTION_COMPLETED"];
  return timelineFor(order.map((type, index) => createEvent(type, index)));
}

function correctionTimeline() {
  const root = createEvent("TIMELINE_INITIALIZED", 0);
  const original = createEvent("DUE_ACTION_CREATED", 1);
  const correction = createCanonicalActivityCorrection(original, {
    actor: { type: "ADVISOR", id: "advisor-001" },
    source: { type: "ADVISOR_CONFIRMED", reference: "correction-001", channel: "FORGE_UI" },
    evidence_strength: "HUMAN_CONFIRMED",
    occurred_at: iso(2), recorded_at: iso(2, 1), idempotency_key: "fes03c-correction", privacy_class: "PRIVATE",
    payload: { due_action_reference: "due-action-001", action_type: "CALL", due_at: "2026-08-03T16:00:00.000Z" },
    provenance: { source_system: "fes-03c-test", source_record_id: "correction-record", captured_via: "FORGE_UI", evidence_references: ["correction-evidence"] },
    correction_reason_code: "ADVISOR_CORRECTED_DATE", confirmation_state: "CONFIRMED", safety_flags: { ...DEFAULT_SAFETY_FLAGS },
  });
  return { original, correction, timeline: timelineFor([root, original, correction]) };
}

test("FES 03C locks versions and display ordering", () => {
  assert.equal(PROJECTION_CONTRACT_VERSION, "FES-03C.1");
  assert.equal(PROJECTION_VERSION, "forge.activity_projection.v1");
  assert.equal(ITEM_VERSION, "forge.activity_projection_item.v1");
  assert.deepEqual(ORDERING, { display: "occurred_at:DESC", canonical_reference: "canonical_position:ASC" });
});

test("FES 03C presents only its governed Activity timeline event types", () => {
  const presented = Object.keys(EVENT_PRESENTATION);
  assert.ok(presented.every(type => EVENT_TYPES.includes(type)));
  presented.forEach(type => assert.ok(EVENT_PRESENTATION[type].title));
  assert.equal(EVENT_PRESENTATION.SALES_NBA_ADVISOR_RESPONSE, undefined);
});

test("FES 03C creates one item per timeline entry", () => {
  const timeline = fullTimeline();
  const projection = createActivityProjection({ timeline });
  assert.equal(projection.item_count, 13);
  assert.deepEqual(new Set(projection.items.map(item => item.event_id)), new Set(timeline.entries.map(entry => entry.event_id)));
});

test("FES 03C displays newest first while preserving canonical position", () => {
  const timeline = fullTimeline();
  const projection = createActivityProjection({ timeline });
  assert.deepEqual(projection.items.map(item => item.canonical_position), [...timeline.entries].reverse().map(entry => entry.position));
  assert.deepEqual(projection.items.map(item => item.display_position), Array.from({ length: 13 }, (_, index) => index + 1));
});

test("FES 03C derives stable identity from tenant and timeline", () => {
  const timeline = fullTimeline();
  const projection = createActivityProjection({ timeline });
  assert.equal(projection.projection_id, deriveActivityProjectionId({ tenant_id: TENANT, timeline_id: timeline.timeline_id }));
  assert.match(projection.projection_id, /^ap_[a-f0-9]{32}$/);
  assert.equal(projection.source_timeline_digest, timeline.timeline_digest);
});

test("FES 03C exposes title category facts source evidence and confirmation", () => {
  const projection = createActivityProjection({ timeline: fullTimeline() });
  const item = projection.items.find(value => value.event_type === "APPOINTMENT_HELD");
  assert.equal(item.category, "APPOINTMENT");
  assert.equal(item.title, "Cita realizada");
  assert.deepEqual(item.actor, { type: "ADVISOR", id: "advisor-001" });
  assert.equal(item.source.type, "ADVISOR_CONFIRMED");
  assert.equal(item.evidence_strength, "HUMAN_CONFIRMED");
  assert.equal(item.confirmation_state, "CONFIRMED");
  assert.equal(item.facts.appointment_reference, "appointment-001");
});

test("FES 03C maps confirmed state to no pending state", () => {
  const item = createActivityProjection({ timeline: fullTimeline() }).items.find(value => value.event_type === "APPOINTMENT_HELD");
  assert.equal(item.pending_state, "NONE");
  assert.equal(item.is_pending, false);
});

test("FES 03C maps reported state to reviewable", () => {
  const item = createActivityProjection({ timeline: fullTimeline() }).items.find(value => value.event_type === "INITIAL_CONTEXT_CAPTURED");
  assert.equal(item.pending_state, "REVIEWABLE_REPORTED");
  assert.equal(item.is_pending, true);
});

test("FES 03C maps unconfirmed state to pending confirmation", () => {
  const root = createEvent("TIMELINE_INITIALIZED", 0);
  const candidate = createEvent("PROSPECT_PROFILE_CREATED", 1, {
    source: { type: "SYSTEM_GENERATED", reference: "generated-profile", channel: "FORGE_SYSTEM" },
    evidence_strength: "UNVERIFIED", confirmation_state: "UNCONFIRMED", idempotency_key: "unconfirmed-profile",
  });
  const timeline = timelineFor([root, candidate]);
  const projection = createActivityProjection({ timeline });
  const item = findActivityItem({ projection, timeline, event_id: candidate.event_id });
  assert.equal(item.pending_state, "PENDING_CONFIRMATION");
  assert.equal(item.is_pending, true);
});

test("FES 03C preserves original and correction as visible items", () => {
  const { original, correction, timeline } = correctionTimeline();
  const projection = createActivityProjection({ timeline });
  const originalItem = findActivityItem({ projection, timeline, event_id: original.event_id });
  const correctionItem = findActivityItem({ projection, timeline, event_id: correction.event_id });
  assert.equal(projection.item_count, 3);
  assert.equal(originalItem.is_corrected, true);
  assert.deepEqual(originalItem.corrected_by_event_ids, [correction.event_id]);
  assert.equal(correctionItem.is_correction, true);
  assert.equal(correctionItem.correction_of, original.event_id);
  assert.equal(correctionItem.correction_depth, 1);
});

test("FES 03C computes deterministic summary counts", () => {
  const projection = createActivityProjection({ timeline: fullTimeline() });
  assert.deepEqual(projection.counts_by_category, { SYSTEM: 1, PROSPECT: 2, CONTEXT: 2, APPOINTMENT: 5, DUE_ACTION: 3 });
  assert.deepEqual(projection.counts_by_confirmation, { UNCONFIRMED: 0, REPORTED: 2, CONFIRMED: 11, DISPUTED: 0 });
  assert.deepEqual(projection.counts_by_pending_state, { NONE: 11, PENDING_CONFIRMATION: 0, REVIEWABLE_REPORTED: 2, CONFLICT_REVIEW_REQUIRED: 0 });
  assert.equal(projection.pending_count, 2);
});

test("FES 03C computes correction summary counts", () => {
  const projection = createActivityProjection({ timeline: correctionTimeline().timeline });
  assert.equal(projection.correction_count, 1);
  assert.equal(projection.corrected_original_count, 1);
});

test("FES 03C exposes oldest and newest occurrence boundaries", () => {
  const projection = createActivityProjection({ timeline: fullTimeline() });
  assert.equal(projection.oldest_activity_at, iso(0));
  assert.equal(projection.newest_activity_at, iso(12));
});

test("FES 03C is deterministic and rebuildable", () => {
  const timeline = fullTimeline();
  const left = createActivityProjection({ timeline });
  const right = createActivityProjection({ timeline: JSON.parse(JSON.stringify(timeline)) });
  assert.deepEqual(left, right);
  assert.deepEqual(rebuildActivityProjection({ projection: left, timeline }), left);
});

test("FES 03C rejects a detached or mismatched source timeline", () => {
  const timeline = fullTimeline();
  const projection = createActivityProjection({ timeline });
  const foreignTimeline = timelineFor([createEvent("TIMELINE_INITIALIZED", 0), createEvent("PROSPECT_CREATED", 1, { idempotency_key: "foreign-event" })]);
  const report = validateActivityProjection(projection, { timeline: foreignTimeline });
  assert.equal(report.valid, false);
  assert.equal(report.errors[0].code, "ACTIVITY_PROJECTION_NOT_CANONICAL");
});

test("FES 03C detects tampered derived state", () => {
  const timeline = fullTimeline();
  const projection = createActivityProjection({ timeline });
  const tampered = JSON.parse(JSON.stringify(projection));
  tampered.items[0].pending_state = "PENDING_CONFIRMATION";
  const report = validateActivityProjection(tampered, { timeline });
  assert.equal(report.valid, false);
  assert.equal(report.errors[0].code, "ACTIVITY_PROJECTION_NOT_CANONICAL");
});

test("FES 03C rejects unsupported projection and item fields", () => {
  const timeline = fullTimeline();
  const projection = createActivityProjection({ timeline });
  assert.throws(() => assertActivityProjection({ ...JSON.parse(JSON.stringify(projection)), authoritative_state: true }, { timeline }), error => error.code === "ACTIVITY_PROJECTION_FIELDS_INVALID");
  const itemTampered = JSON.parse(JSON.stringify(projection));
  itemTampered.items[0].execute = true;
  assert.throws(() => assertActivityProjection(itemTampered, { timeline }), error => error.code === "ACTIVITY_ITEM_FIELDS_INVALID");
});

test("FES 03C output is deeply immutable and does not mutate timeline", () => {
  const timeline = fullTimeline();
  const before = JSON.stringify(timeline);
  const projection = createActivityProjection({ timeline });
  assert.equal(JSON.stringify(timeline), before);
  assert.equal(Object.isFrozen(projection), true);
  assert.equal(Object.isFrozen(projection.items), true);
  assert.equal(Object.isFrozen(projection.items[0].facts), true);
  assert.throws(() => projection.items.push({}), TypeError);
});

test("FES 03C keeps stable identity while digest follows source content", () => {
  const base = timelineFor([createEvent("TIMELINE_INITIALIZED", 0), createEvent("PROSPECT_CREATED", 1)]);
  const extended = timelineFor([createEvent("TIMELINE_INITIALIZED", 0), createEvent("PROSPECT_CREATED", 1), createEvent("DUE_ACTION_CREATED", 2)]);
  const left = createActivityProjection({ timeline: base });
  const right = createActivityProjection({ timeline: extended });
  assert.equal(left.projection_id, right.projection_id);
  assert.notEqual(left.projection_digest, right.projection_digest);
});

test("FES 03C returns null for absent event", () => {
  const timeline = fullTimeline();
  const projection = createActivityProjection({ timeline });
  assert.equal(findActivityItem({ projection, timeline, event_id: "evt_00000000000000000000000000000000" }), null);
});
