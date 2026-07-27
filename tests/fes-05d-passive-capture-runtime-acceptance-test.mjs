import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const canonical = require(
  "../platform/event-evidence/canonical-activity-event-contract.js",
);
const bridge = require(
  "../platform/event-evidence/passive-capture-bridge-contract.js",
);
const ledger = require(
  "../platform/event-evidence/activity-ledger-contract.js",
);
const timelineContract = require(
  "../platform/event-evidence/canonical-activity-timeline-contract.js",
);
const runtime = require(
  "../platform/event-evidence/passive-capture-runtime.js",
);

const {
  DEFAULT_SAFETY_FLAGS,
  createCanonicalActivityEvent,
} = canonical;
const { ACTION_CATALOG } = bridge;
const { createLedgerRecord } = ledger;
const {
  createCanonicalActivityTimeline,
} = timelineContract;
const {
  RUNTIME_VERSION,
  ACCEPTANCE_VERSION,
  deriveAcceptanceId,
  createPassiveCaptureRuntimeAcceptance,
  assertPassiveCaptureRuntimeAcceptance,
  validatePassiveCaptureRuntimeAcceptance,
  rebuildPassiveCaptureRuntimeAcceptance,
} = runtime;

const TENANT = "tenant-advisor-001";
const PROSPECT = "prospect-001";
const PLAN = "plan-2026-07-26";

function instant(index) {
  const hour = String(
    10 + Math.floor(index / 60),
  ).padStart(2, "0");
  const minute = String(
    index % 60,
  ).padStart(2, "0");
  return `2026-07-26T${hour}:${minute}:00.000Z`;
}

function valueForKey(key, actionCode, flowReference) {
  const slug = actionCode.toLowerCase();
  const values = {
    flow_reference: flowReference,
    artifact_reference: `artifact-${slug}`,
    generation_mode: "GOVERNED_PROVIDER",
    provider_reference: `provider-${slug}`,
    previous_artifact_reference: `previous-${slug}`,
    approval_reference: `approval-${slug}`,
    handoff_reference: `handoff-${slug}`,
    confirmation_reference: `confirmation-${slug}`,
    result_reference: `result-${slug}`,
    objection_reference: `objection-${flowReference}`,
    context_reference: `context-${slug}`,
    analysis_reference: `analysis-${flowReference}`,
    response_reference: `response-${flowReference}`,
    outcome_reference: `outcome-${flowReference}`,
    reason_code: "CONFIRMED_REASON",
    call_reference: `call-${flowReference}`,
    capture_mode: "VOICE",
    appointment_reference: `appointment-${flowReference}`,
    starts_at: "2026-07-27T16:00:00.000Z",
    ends_at: "2026-07-27T17:00:00.000Z",
    previous_starts_at: "2026-07-27T14:00:00.000Z",
    outcome_confirmed_at: "2026-07-27T18:00:00.000Z",
    party: "PROSPECT",
    quote_reference: `quote-${flowReference}`,
    presentation_reference: `presentation-${flowReference}`,
    question_reference: `question-${flowReference}`,
    proposal_reference: `proposal-${flowReference}`,
    stage_change_reference: `stage-${flowReference}`,
    stage_from: "contacted",
    stage_to: "appointment_scheduled",
  };
  if (!(key in values)) {
    throw new Error(`UNMAPPED_PAYLOAD_KEY:${key}`);
  }
  return values[key];
}

function rawObservation(
  actionCode,
  index,
  flowReference,
  overrides = {},
) {
  const definition = ACTION_CATALOG[actionCode];
  const payload = {};
  for (const key of definition.required_payload) {
    payload[key] = valueForKey(
      key,
      actionCode,
      flowReference,
    );
  }
  const sourceType =
    overrides.source_type || definition.allowed_sources[0];
  const actorId = sourceType.startsWith("SYSTEM_")
    ? "forge-system"
    : sourceType.startsWith("EXTERNAL_PROVIDER_")
      ? "provider-001"
      : "advisor-001";
  return {
    observation_reference:
      `observation-${index}-${actionCode.toLowerCase()}`,
    tenant_id: overrides.tenant_id || TENANT,
    actor_id: actorId,
    prospect_id: overrides.prospect_id || PROSPECT,
    action_code: actionCode,
    source_type: sourceType,
    occurred_at: instant(index),
    recorded_at: new Date(
      Date.parse(instant(index)) + 1000,
    ).toISOString(),
    payload: overrides.payload || payload,
    evidence_references: [
      `evidence-${index}-${actionCode.toLowerCase()}`,
    ],
  };
}

function connectedActions() {
  return [
    "MESSAGE_DRAFT_GENERATED",
    "MESSAGE_DRAFT_EDITED",
    "MESSAGE_DRAFT_APPROVED",
    "WHATSAPP_OPENED",
    "MESSAGE_SENT_CONFIRMED",
    "PROSPECT_REPLIED_CONFIRMED",
    "OBJECTION_CAPTURED",
    "OBJECTION_ANALYSIS_GENERATED",
    "OBJECTION_RESPONSE_GENERATED",
    "OBJECTION_RESPONSE_EDITED",
    "OBJECTION_RESPONSE_APPROVED",
    "OBJECTION_RESPONSE_USED",
    "OBJECTION_OUTCOME_CONFIRMED",
    "CALL_INITIATED",
    "CALL_CONNECTED_CONFIRMED",
    "CALL_CONTEXT_ADDED",
    "CALENDAR_TEMPLATE_OPENED",
    "QUOTE_STARTED",
    "QUOTE_PREPARED",
    "QUOTE_REVIEWED",
    "PRESENTATION_HELD_CONFIRMED",
    "PRODUCT_QUESTION_CAPTURED",
    "PROPOSAL_REQUESTED_CONFIRMED",
    "PIPELINE_STAGE_CHANGE_REQUESTED",
    "PIPELINE_STAGE_CHANGE_CONFIRMED",
  ];
}

function connectedSource(
  flowReference = "flow-runtime-connected",
  overrides = {},
) {
  return {
    sequence_reference:
      overrides.sequence_reference || "sequence-connected",
    observations: connectedActions().map(
      (actionCode, index) =>
        rawObservation(
          actionCode,
          index + 1,
          flowReference,
          overrides.observation_overrides || {},
        ),
    ),
  };
}

function unansweredSource(
  flowReference = "flow-runtime-unanswered",
) {
  return {
    sequence_reference: "sequence-unanswered",
    observations: [
      rawObservation(
        "CALL_INITIATED",
        1,
        flowReference,
      ),
      rawObservation(
        "CALL_NOT_ANSWERED_CONFIRMED",
        2,
        flowReference,
      ),
      rawObservation(
        "CALL_CONTEXT_ADDED",
        3,
        flowReference,
      ),
    ],
  };
}

function baseEvent(
  eventType,
  index,
  flowReference,
  tenantId = TENANT,
  prospectId = PROSPECT,
) {
  const payload = eventType === "TIMELINE_INITIALIZED"
    ? { timeline_reference: `timeline-${flowReference}` }
    : {
        prospect_reference: prospectId,
        source_category: "REFERRAL",
      };
  return createCanonicalActivityEvent({
    event_type: eventType,
    tenant_id: tenantId,
    actor: { type: "SYSTEM", id: "forge-system" },
    subject: { type: "PROSPECT", id: prospectId },
    source: {
      type: "SYSTEM_OBSERVED",
      reference: `base-${flowReference}-${index}`,
      channel: "FORGE_SYSTEM",
    },
    evidence_strength: "SYSTEM_OBSERVED",
    occurred_at: `2026-07-26T09:0${index}:00.000Z`,
    recorded_at: `2026-07-26T09:0${index}:01.000Z`,
    effective_period: null,
    causation_id: null,
    correlation_id: flowReference,
    idempotency_key: `base-${flowReference}-${index}`,
    privacy_class: "PRIVATE",
    learning_eligibility: false,
    payload,
    provenance: {
      source_system: "fes-05d-test",
      source_record_id: `base-${flowReference}-${index}`,
      captured_via: "FORGE_SYSTEM",
      evidence_references: [
        `base-evidence-${flowReference}-${index}`,
      ],
    },
    confirmation_state: "CONFIRMED",
    correction_of: null,
    safety_flags: { ...DEFAULT_SAFETY_FLAGS },
  });
}

function baseTimeline(
  flowReference,
  tenantId = TENANT,
  prospectId = PROSPECT,
) {
  const events = [
    baseEvent(
      "TIMELINE_INITIALIZED",
      0,
      flowReference,
      tenantId,
      prospectId,
    ),
    baseEvent(
      "PROSPECT_CREATED",
      1,
      flowReference,
      tenantId,
      prospectId,
    ),
  ];
  return createCanonicalActivityTimeline({
    tenant_id: tenantId,
    correlation_id: flowReference,
    ledger_records: events.map(event =>
      createLedgerRecord({
        canonical_event: event,
        evidence_references: [],
        appended_at: event.recorded_at,
      }),
    ),
  });
}

function requestFor(source, flowReference) {
  return {
    plan_reference: PLAN,
    base_timeline: baseTimeline(flowReference),
    sequence: bridge.createPassiveCaptureSequence(source),
    sequence_source: source,
  };
}

test("FES 05D exposes locked runtime contracts", () => {
  assert.equal(RUNTIME_VERSION, "FES-05D.1");
  assert.equal(
    ACCEPTANCE_VERSION,
    "forge.passive_capture_runtime_acceptance.v1",
  );
});

test("FES 05D accepts the connected passive-capture vertical", () => {
  const flow = "flow-runtime-connected";
  const source = connectedSource(flow);
  const acceptance =
    createPassiveCaptureRuntimeAcceptance(
      requestFor(source, flow),
    );
  assert.equal(acceptance.observation_count, 25);
  assert.equal(acceptance.canonical_event_count, 20);
  assert.equal(acceptance.blocked_observation_count, 5);
  assert.equal(acceptance.merged_timeline_entry_count, 22);
  assert.equal(
    acceptance.projection_snapshot.prospect_count,
    1,
  );
  assert.equal(
    acceptance.projection_snapshot.bundles[0]
      .activity.item_count,
    22,
  );
});

test("FES 05D covers all twenty-one passive event types", () => {
  const connected =
    createPassiveCaptureRuntimeAcceptance(
      requestFor(
        connectedSource("flow-runtime-connected"),
        "flow-runtime-connected",
      ),
    );
  const unanswered =
    createPassiveCaptureRuntimeAcceptance(
      requestFor(
        unansweredSource("flow-runtime-unanswered"),
        "flow-runtime-unanswered",
      ),
    );
  const types = new Set([
    ...connected.merged_timeline.entries.map(
      entry => entry.event_type,
    ),
    ...unanswered.merged_timeline.entries.map(
      entry => entry.event_type,
    ),
  ]);
  for (const eventType of canonical.PASSIVE_CAPTURE_EVENT_TYPES) {
    assert.equal(types.has(eventType), true, eventType);
  }
});

test("FES 05D preserves every blocked observation explicitly", () => {
  const flow = "flow-runtime-connected";
  const acceptance =
    createPassiveCaptureRuntimeAcceptance(
      requestFor(connectedSource(flow), flow),
    );
  assert.deepEqual(
    acceptance.blocked_observations.map(
      item => item.action_code,
    ),
    [
      "WHATSAPP_OPENED",
      "CALL_INITIATED",
      "CALENDAR_TEMPLATE_OPENED",
      "PIPELINE_STAGE_CHANGE_REQUESTED",
      "PIPELINE_STAGE_CHANGE_CONFIRMED",
    ],
  );
  assert.equal(
    acceptance.canonical_event_count +
      acceptance.blocked_observation_count,
    acceptance.observation_count,
  );
});

test("FES 05D keeps handoff and stage truth boundaries", () => {
  const flow = "flow-runtime-connected";
  const acceptance =
    createPassiveCaptureRuntimeAcceptance(
      requestFor(connectedSource(flow), flow),
    );
  assert.equal(
    acceptance.acceptance.handoff_promoted_to_result,
    false,
  );
  assert.equal(
    acceptance.acceptance.pipeline_stage_promoted_to_truth,
    false,
  );
  assert.equal(
    acceptance.acceptance.external_execution,
    false,
  );
});

test("FES 05D propagates passive events through every projection", () => {
  const flow = "flow-runtime-connected";
  const acceptance =
    createPassiveCaptureRuntimeAcceptance(
      requestFor(connectedSource(flow), flow),
    );
  const bundle = acceptance.projection_snapshot.bundles[0];
  assert.equal(bundle.timeline_id, acceptance.merged_timeline.timeline_id);
  assert.equal(bundle.activity.item_count, 22);
  assert.equal(
    bundle.activity.items.some(
      item => item.event_type === "MESSAGE_SENT_CONFIRMED",
    ),
    true,
  );
  assert.equal(
    bundle.activity.items.some(
      item => item.event_type === "PROPOSAL_REQUESTED_CONFIRMED",
    ),
    true,
  );
  assert.equal(bundle.lineage.activity_from_timeline, true);
  assert.equal(bundle.lineage.prospect_detail_from_activity, true);
  assert.equal(bundle.lineage.pipeline_card_from_prospect_detail, true);
});

test("FES 05D produces deterministic replay", () => {
  const flow = "flow-runtime-connected";
  const source = connectedSource(flow);
  const left = createPassiveCaptureRuntimeAcceptance(
    requestFor(source, flow),
  );
  const right = createPassiveCaptureRuntimeAcceptance(
    requestFor(JSON.parse(JSON.stringify(source)), flow),
  );
  assert.deepEqual(left, right);
});

test("FES 05D is deterministic under observation input order", () => {
  const flow = "flow-runtime-connected";
  const source = connectedSource(flow);
  const reversed = {
    ...source,
    observations: [...source.observations].reverse(),
  };
  const left = createPassiveCaptureRuntimeAcceptance(
    requestFor(source, flow),
  );
  const right = createPassiveCaptureRuntimeAcceptance(
    requestFor(reversed, flow),
  );
  assert.deepEqual(left, right);
});

test("FES 05D derives stable acceptance identity", () => {
  const id = deriveAcceptanceId({
    tenant_id: TENANT,
    prospect_id: PROSPECT,
    flow_reference: "flow-runtime-connected",
    plan_reference: PLAN,
  });
  const acceptance =
    createPassiveCaptureRuntimeAcceptance(
      requestFor(
        connectedSource("flow-runtime-connected"),
        "flow-runtime-connected",
      ),
    );
  assert.equal(acceptance.acceptance_id, id);
});

test("FES 05D validates and rebuilds byte-equivalent output", () => {
  const flow = "flow-runtime-connected";
  const source = connectedSource(flow);
  const request = requestFor(source, flow);
  const acceptance = createPassiveCaptureRuntimeAcceptance(request);
  assert.deepEqual(
    assertPassiveCaptureRuntimeAcceptance(
      acceptance,
      request,
    ),
    acceptance,
  );
  assert.deepEqual(
    rebuildPassiveCaptureRuntimeAcceptance({
      acceptance,
      source: request,
    }),
    acceptance,
  );
});

test("FES 05D detects tampered acceptance output", () => {
  const flow = "flow-runtime-connected";
  const request = requestFor(connectedSource(flow), flow);
  const acceptance = JSON.parse(JSON.stringify(
    createPassiveCaptureRuntimeAcceptance(request),
  ));
  acceptance.blocked_observation_count = 0;
  const report = validatePassiveCaptureRuntimeAcceptance(
    acceptance,
    request,
  );
  assert.equal(report.valid, false);
  assert.equal(report.errors[0].code, "PASSIVE_RUNTIME_NOT_CANONICAL");
});

test("FES 05D rejects unsupported output fields", () => {
  const flow = "flow-runtime-connected";
  const request = requestFor(connectedSource(flow), flow);
  const acceptance = {
    ...createPassiveCaptureRuntimeAcceptance(request),
    sent_messages: 999,
  };
  assert.throws(
    () => assertPassiveCaptureRuntimeAcceptance(acceptance, request),
    error => error.code === "PASSIVE_RUNTIME_OUTPUT_FIELDS_INVALID",
  );
});

test("FES 05D rejects mixed tenants", () => {
  const flow = "flow-runtime-connected";
  const source = connectedSource(flow, {
    observation_overrides: { tenant_id: "tenant-foreign" },
  });
  const request = {
    plan_reference: PLAN,
    base_timeline: baseTimeline(flow),
    sequence: bridge.createPassiveCaptureSequence(source),
    sequence_source: source,
  };
  assert.throws(
    () => createPassiveCaptureRuntimeAcceptance(request),
    error => error.code === "PASSIVE_RUNTIME_TENANT_MISMATCH",
  );
});

test("FES 05D rejects prospect mismatch", () => {
  const flow = "flow-runtime-connected";
  const source = connectedSource(flow, {
    observation_overrides: { prospect_id: "prospect-foreign" },
  });
  const request = {
    plan_reference: PLAN,
    base_timeline: baseTimeline(flow),
    sequence: bridge.createPassiveCaptureSequence(source),
    sequence_source: source,
  };
  assert.throws(
    () => createPassiveCaptureRuntimeAcceptance(request),
    error => error.code === "PASSIVE_RUNTIME_PROSPECT_MISMATCH",
  );
});

test("FES 05D rejects correlation mismatch", () => {
  const source = connectedSource("flow-foreign");
  const request = {
    plan_reference: PLAN,
    base_timeline: baseTimeline("flow-runtime-connected"),
    sequence: bridge.createPassiveCaptureSequence(source),
    sequence_source: source,
  };
  assert.throws(
    () => createPassiveCaptureRuntimeAcceptance(request),
    error => error.code === "PASSIVE_RUNTIME_CORRELATION_MISMATCH",
  );
});

test("FES 05D rejects multiple flows in one acceptance snapshot", () => {
  const left = connectedSource("flow-left");
  const right = unansweredSource("flow-right");
  const source = {
    sequence_reference: "sequence-multi-flow",
    observations: [
      ...left.observations,
      ...right.observations,
    ],
  };
  const request = {
    plan_reference: PLAN,
    base_timeline: baseTimeline("flow-left"),
    sequence: bridge.createPassiveCaptureSequence(source),
    sequence_source: source,
  };
  assert.throws(
    () => createPassiveCaptureRuntimeAcceptance(request),
    error => error.code === "PASSIVE_RUNTIME_SINGLE_FLOW_REQUIRED",
  );
});

test("FES 05D rejects detached sequence authority", () => {
  const flow = "flow-runtime-connected";
  const source = connectedSource(flow);
  const request = requestFor(source, flow);
  request.sequence_source = {
    ...source,
    sequence_reference: "foreign-sequence",
  };
  assert.throws(
    () => createPassiveCaptureRuntimeAcceptance(request),
    error => error.code === "PASSIVE_CAPTURE_SEQUENCE_NOT_CANONICAL",
  );
});

test("FES 05D output is deeply immutable", () => {
  const flow = "flow-runtime-connected";
  const acceptance =
    createPassiveCaptureRuntimeAcceptance(
      requestFor(connectedSource(flow), flow),
    );
  assert.equal(Object.isFrozen(acceptance), true);
  assert.equal(Object.isFrozen(acceptance.merged_timeline), true);
  assert.equal(Object.isFrozen(acceptance.blocked_observations), true);
  assert.throws(() => {
    acceptance.blocked_observations.push({});
  }, TypeError);
});

test("FES 05D does not mutate any input source", () => {
  const flow = "flow-runtime-connected";
  const source = connectedSource(flow);
  const request = requestFor(source, flow);
  const before = JSON.stringify(request);
  createPassiveCaptureRuntimeAcceptance(request);
  assert.equal(JSON.stringify(request), before);
});

test("FES 05D keeps productive and remote mutation disabled", () => {
  const flow = "flow-runtime-connected";
  const acceptance =
    createPassiveCaptureRuntimeAcceptance(
      requestFor(connectedSource(flow), flow),
    );
  assert.equal(acceptance.acceptance.productive_ui_binding, false);
  assert.equal(acceptance.acceptance.supabase_remote_mutation, false);
  assert.equal(acceptance.acceptance.database_migration, false);
  assert.equal(acceptance.acceptance.wall_clock_inference, false);
});
