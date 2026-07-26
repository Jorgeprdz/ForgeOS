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
const adapter = require(
  "../platform/event-evidence/bridge-to-canonical-event-adapter.js",
);

const {
  PASSIVE_CAPTURE_EVENT_TYPES,
  validateCanonicalActivityEvent,
} = canonical;

const {
  ACTION_CATALOG,
  createPassiveCaptureObservation,
  createPassiveCaptureSequence,
} = bridge;

const {
  ADAPTER_VERSION,
  BUNDLE_VERSION,
  SOURCE_ACTOR_TYPES,
  EVENT_SUBJECT_TYPES,
  BLOCK_REASONS,
  createCanonicalEventFromObservation,
  createCanonicalEventBundle,
  assertCanonicalEventBundle,
  validateCanonicalEventBundle,
  rebuildCanonicalEventBundle,
} = adapter;

const TENANT = "tenant-advisor-001";
const PROSPECT = "prospect-001";

function timestamp(index) {
  return `2026-07-26T${String(
    20 + Math.floor(index / 60),
  ).padStart(2, "0")}:${String(
    index % 60,
  ).padStart(2, "0")}:00.000Z`;
}

function valueForKey(
  key,
  actionCode,
) {
  const slug =
    actionCode.toLowerCase();

  const values = {
    flow_reference:
      `flow-${slug}`,
    artifact_reference:
      `artifact-${slug}`,
    generation_mode:
      "GOVERNED_PROVIDER",
    provider_reference:
      `provider-${slug}`,
    previous_artifact_reference:
      `previous-${slug}`,
    approval_reference:
      `approval-${slug}`,
    handoff_reference:
      `handoff-${slug}`,
    confirmation_reference:
      `confirmation-${slug}`,
    result_reference:
      `result-${slug}`,
    objection_reference:
      `objection-${slug}`,
    context_reference:
      `context-${slug}`,
    analysis_reference:
      `analysis-${slug}`,
    response_reference:
      `response-${slug}`,
    outcome_reference:
      `outcome-${slug}`,
    reason_code:
      "CONFIRMED_REASON",
    call_reference:
      `call-${slug}`,
    capture_mode: "VOICE",
    appointment_reference:
      `appointment-${slug}`,
    starts_at:
      "2026-07-27T16:00:00.000Z",
    ends_at:
      "2026-07-27T17:00:00.000Z",
    previous_starts_at:
      "2026-07-27T14:00:00.000Z",
    outcome_confirmed_at:
      "2026-07-27T18:00:00.000Z",
    party: "PROSPECT",
    quote_reference:
      `quote-${slug}`,
    presentation_reference:
      `presentation-${slug}`,
    question_reference:
      `question-${slug}`,
    proposal_reference:
      `proposal-${slug}`,
    stage_change_reference:
      `stage-change-${slug}`,
    stage_from: "contacted",
    stage_to:
      "appointment_scheduled",
  };

  if (!(key in values)) {
    throw new Error(
      `UNMAPPED_PAYLOAD_KEY:${key}`,
    );
  }

  return values[key];
}

function rawObservation(
  actionCode,
  index = 1,
  overrides = {},
) {
  const definition =
    ACTION_CATALOG[actionCode];

  if (!definition) {
    throw new Error(
      `UNKNOWN_ACTION:${actionCode}`,
    );
  }

  const payload = {};

  for (
    const key
    of definition.required_payload
  ) {
    payload[key] =
      valueForKey(key, actionCode);
  }

  const sourceType =
    overrides.source_type ||
    definition.allowed_sources[0];
  const actorId =
    sourceType.startsWith("SYSTEM_")
      ? "forge-system"
      : sourceType.startsWith(
          "EXTERNAL_PROVIDER_",
        )
        ? "provider-001"
        : "advisor-001";

  return {
    observation_reference:
      `observation-${index}-${actionCode.toLowerCase()}`,
    tenant_id: TENANT,
    actor_id: actorId,
    prospect_id: PROSPECT,
    action_code: actionCode,
    source_type: sourceType,
    occurred_at:
      timestamp(index),
    recorded_at:
      new Date(
        Date.parse(timestamp(index)) +
          1000,
      ).toISOString(),
    payload,
    evidence_references: [
      `evidence-${index}-${actionCode.toLowerCase()}`,
    ],
    ...overrides,
  };
}

function adapt(
  actionCode,
  index = 1,
  overrides = {},
) {
  const source =
    rawObservation(
      actionCode,
      index,
      overrides,
    );
  const observation =
    createPassiveCaptureObservation(
      source,
    );

  return {
    source,
    observation,
    event:
      createCanonicalEventFromObservation({
        observation,
        observation_source:
          source,
      }),
  };
}

function whatsappFlow() {
  const flowReference =
    "flow-whatsapp-sequence";

  return [
    rawObservation(
      "MESSAGE_DRAFT_GENERATED",
      1,
      {
        payload: {
          flow_reference:
            flowReference,
          artifact_reference:
            "draft-001",
          generation_mode:
            "GOVERNED_PROVIDER",
        },
      },
    ),
    rawObservation(
      "MESSAGE_DRAFT_APPROVED",
      2,
      {
        payload: {
          flow_reference:
            flowReference,
          artifact_reference:
            "draft-001",
          approval_reference:
            "approval-001",
        },
      },
    ),
    rawObservation(
      "WHATSAPP_OPENED",
      3,
      {
        payload: {
          flow_reference:
            flowReference,
          artifact_reference:
            "draft-001",
          handoff_reference:
            "handoff-001",
        },
      },
    ),
    rawObservation(
      "MESSAGE_SENT_CONFIRMED",
      4,
      {
        payload: {
          flow_reference:
            flowReference,
          artifact_reference:
            "draft-001",
          confirmation_reference:
            "sent-001",
        },
      },
    ),
  ];
}

function mixedSequenceSource() {
  return {
    sequence_reference:
      "sequence-mixed-001",
    observations: [
      ...whatsappFlow(),
      rawObservation(
        "CALL_INITIATED",
        10,
      ),
      rawObservation(
        "CALENDAR_TEMPLATE_OPENED",
        11,
      ),
      rawObservation(
        "PIPELINE_STAGE_CHANGE_REQUESTED",
        12,
        {
          payload: {
            flow_reference:
              "flow-stage-001",
            stage_change_reference:
              "stage-change-001",
            stage_from: "contacted",
            stage_to:
              "appointment_scheduled",
          },
        },
      ),
      rawObservation(
        "PIPELINE_STAGE_CHANGE_CONFIRMED",
        13,
        {
          payload: {
            flow_reference:
              "flow-stage-001",
            stage_change_reference:
              "stage-change-001",
            stage_from: "contacted",
            stage_to:
              "appointment_scheduled",
            confirmation_reference:
              "stage-confirmation-001",
          },
        },
      ),
    ],
  };
}

test("FES 05C exposes locked adapter contracts", () => {
  assert.equal(
    ADAPTER_VERSION,
    "FES-05C.1",
  );
  assert.equal(
    BUNDLE_VERSION,
    "forge.bridge_canonical_event_bundle.v1",
  );
  assert.equal(
    Object.keys(
      EVENT_SUBJECT_TYPES,
    ).length,
    21,
  );
});

test("FES 05C maps source evidence to canonical actor types", () => {
  assert.deepEqual(
    SOURCE_ACTOR_TYPES,
    {
      SYSTEM_GENERATED: "SYSTEM",
      SYSTEM_OBSERVED: "SYSTEM",
      ADVISOR_REPORTED: "ADVISOR",
      ADVISOR_CONFIRMED: "ADVISOR",
      EXTERNAL_PROVIDER_CONFIRMED:
        "EXTERNAL_PROVIDER",
    },
  );
});

test("FES 05C adapts every passive-capture canonical event", async t => {
  for (
    const [index, eventType]
    of PASSIVE_CAPTURE_EVENT_TYPES.entries()
  ) {
    await t.test(eventType, () => {
      const {
        observation,
        event,
      } = adapt(
        eventType,
        index + 1,
      );

      const report =
        validateCanonicalActivityEvent(
          event,
        );

      assert.equal(
        event.event_type,
        eventType,
      );
      assert.equal(
        event.tenant_id,
        observation.tenant_id,
      );
      assert.equal(
        event.source.type,
        observation.source.type,
      );
      assert.equal(
        event.evidence_strength,
        observation.evidence_strength,
      );
      assert.equal(
        event.confirmation_state,
        observation.confirmation_state,
      );
      assert.equal(report.valid, true);
    });
  }
});

test("FES 05C preserves reference-only payloads", () => {
  const {
    observation,
    event,
  } = adapt(
    "MESSAGE_DRAFT_GENERATED",
  );

  assert.equal(
    event.payload.flow_reference,
    observation.payload
      .flow_reference,
  );
  assert.equal(
    event.payload.artifact_reference,
    observation.payload
      .artifact_reference,
  );
  assert.equal(
    "message_text" in event.payload,
    false,
  );
});

test("FES 05C creates deterministic idempotency from observation identity", () => {
  const left =
    adapt(
      "QUOTE_PREPARED",
      20,
    );
  const right =
    adapt(
      "QUOTE_PREPARED",
      20,
    );

  assert.equal(
    left.event.idempotency_key,
    `bridge:${left.observation.observation_id}`,
  );
  assert.equal(
    left.event.event_id,
    right.event.event_id,
  );
});

test("FES 05C keeps generated artifacts unconfirmed", () => {
  const { event } =
    adapt(
      "OBJECTION_ANALYSIS_GENERATED",
    );

  assert.equal(
    event.actor.type,
    "SYSTEM",
  );
  assert.equal(
    event.evidence_strength,
    "UNVERIFIED",
  );
  assert.equal(
    event.confirmation_state,
    "UNCONFIRMED",
  );
});

test("FES 05C keeps advisor-reported capture reported", () => {
  const { event } =
    adapt(
      "OBJECTION_CAPTURED",
    );

  assert.equal(
    event.actor.type,
    "ADVISOR",
  );
  assert.equal(
    event.evidence_strength,
    "REPORTED",
  );
  assert.equal(
    event.confirmation_state,
    "REPORTED",
  );
});

test("FES 05C accepts external-provider confirmed evidence", () => {
  const { event } =
    adapt(
      "MESSAGE_SENT_CONFIRMED",
      1,
      {
        source_type:
          "EXTERNAL_PROVIDER_CONFIRMED",
      },
    );

  assert.equal(
    event.actor.type,
    "EXTERNAL_PROVIDER",
  );
  assert.equal(
    event.evidence_strength,
    "EXTERNAL_CONFIRMED",
  );
});

test("FES 05C keeps all safety flags false", () => {
  const { event } =
    adapt(
      "PROPOSAL_REQUESTED_CONFIRMED",
    );

  assert.deepEqual(
    event.safety_flags,
    canonical.DEFAULT_SAFETY_FLAGS,
  );
});

test("FES 05C rejects a detached observation source", () => {
  const source =
    rawObservation(
      "QUOTE_REVIEWED",
    );
  const observation =
    createPassiveCaptureObservation(
      source,
    );
  const foreign = {
    ...source,
    observation_reference:
      "foreign-observation",
  };

  assert.throws(
    () =>
      createCanonicalEventFromObservation({
        observation,
        observation_source:
          foreign,
      }),
    error =>
      error.code ===
      "PASSIVE_CAPTURE_OBSERVATION_NOT_CANONICAL",
  );
});

test("FES 05C rejects a tampered bridge observation", () => {
  const source =
    rawObservation(
      "CALL_CONNECTED_CONFIRMED",
    );
  const observation =
    JSON.parse(
      JSON.stringify(
        createPassiveCaptureObservation(
          source,
        ),
      ),
    );

  observation.result_confirmed =
    false;

  assert.throws(
    () =>
      createCanonicalEventFromObservation({
        observation,
        observation_source:
          source,
      }),
    error =>
      error.code ===
      "PASSIVE_CAPTURE_OBSERVATION_NOT_CANONICAL",
  );
});

test("FES 05C rejects WhatsApp handoff as canonical event", () => {
  const source =
    rawObservation(
      "WHATSAPP_OPENED",
    );
  const observation =
    createPassiveCaptureObservation(
      source,
    );

  assert.throws(
    () =>
      createCanonicalEventFromObservation({
        observation,
        observation_source:
          source,
      }),
    error =>
      error.code ===
      "BRIDGE_CANONICAL_CANDIDATE_BLOCKED",
  );
});

test("FES 05C rejects call initiation as canonical event", () => {
  const source =
    rawObservation(
      "CALL_INITIATED",
    );
  const observation =
    createPassiveCaptureObservation(
      source,
    );

  assert.throws(
    () =>
      createCanonicalEventFromObservation({
        observation,
        observation_source:
          source,
      }),
    error =>
      error.code ===
      "BRIDGE_CANONICAL_CANDIDATE_BLOCKED",
  );
});

test("FES 05C rejects Calendar template handoff as canonical event", () => {
  const source =
    rawObservation(
      "CALENDAR_TEMPLATE_OPENED",
    );
  const observation =
    createPassiveCaptureObservation(
      source,
    );

  assert.throws(
    () =>
      createCanonicalEventFromObservation({
        observation,
        observation_source:
          source,
      }),
    error =>
      error.code ===
      "BRIDGE_CANONICAL_CANDIDATE_BLOCKED",
  );
});

test("FES 05C rejects pipeline stage movement without source truth", () => {
  const source =
    rawObservation(
      "PIPELINE_STAGE_CHANGE_CONFIRMED",
    );
  const observation =
    createPassiveCaptureObservation(
      source,
    );

  assert.throws(
    () =>
      createCanonicalEventFromObservation({
        observation,
        observation_source:
          source,
      }),
    error =>
      error.code ===
      "BRIDGE_CANONICAL_CANDIDATE_BLOCKED",
  );
});

test("FES 05C bundle converts supported observations and preserves blockers", () => {
  const source =
    mixedSequenceSource();
  const sequence =
    createPassiveCaptureSequence(
      source,
    );
  const bundle =
    createCanonicalEventBundle({
      sequence,
      sequence_source:
        source,
    });

  assert.equal(
    bundle.event_count,
    3,
  );
  assert.equal(
    bundle.blocked_count,
    5,
  );
  assert.deepEqual(
    bundle.events.map(
      event => event.event_type,
    ),
    [
      "MESSAGE_DRAFT_GENERATED",
      "MESSAGE_DRAFT_APPROVED",
      "MESSAGE_SENT_CONFIRMED",
    ],
  );
  assert.deepEqual(
    bundle.blocked.map(
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
});

test("FES 05C bundle exposes blocker reasons", () => {
  const source =
    mixedSequenceSource();
  const sequence =
    createPassiveCaptureSequence(
      source,
    );
  const bundle =
    createCanonicalEventBundle({
      sequence,
      sequence_source:
        source,
    });

  assert.equal(
    bundle.counts_by_block_reason
      .CANONICAL_EVENT_NOT_AUTHORIZED,
    2,
  );
  assert.equal(
    bundle.counts_by_block_reason
      .BRIDGE_EVIDENCE_ONLY,
    1,
  );
  assert.equal(
    bundle.counts_by_block_reason
      .SOURCE_TRUTH_REQUIRED,
    2,
  );
});

test("FES 05C never silently drops a bridge observation", () => {
  const source =
    mixedSequenceSource();
  const sequence =
    createPassiveCaptureSequence(
      source,
    );
  const bundle =
    createCanonicalEventBundle({
      sequence,
      sequence_source:
        source,
    });

  assert.equal(
    bundle.event_count +
      bundle.blocked_count,
    sequence.observation_count,
  );
});

test("FES 05C bundle ordering is deterministic", () => {
  const source =
    mixedSequenceSource();
  const reversed = {
    ...source,
    observations: [
      ...source.observations,
    ].reverse(),
  };

  const left =
    createCanonicalEventBundle({
      sequence:
        createPassiveCaptureSequence(
          source,
        ),
      sequence_source:
        source,
    });
  const right =
    createCanonicalEventBundle({
      sequence:
        createPassiveCaptureSequence(
          reversed,
        ),
      sequence_source:
        reversed,
    });

  assert.deepEqual(left, right);
});

test("FES 05C bundle validates and rebuilds byte-equivalent output", () => {
  const source =
    mixedSequenceSource();
  const request = {
    sequence:
      createPassiveCaptureSequence(
        source,
      ),
    sequence_source:
      source,
  };
  const bundle =
    createCanonicalEventBundle(
      request,
    );
  const asserted =
    assertCanonicalEventBundle(
      bundle,
      request,
    );
  const rebuilt =
    rebuildCanonicalEventBundle({
      bundle,
      source: request,
    });

  assert.deepEqual(
    asserted,
    bundle,
  );
  assert.deepEqual(
    rebuilt,
    bundle,
  );
});

test("FES 05C detects tampered bundle output", () => {
  const source =
    mixedSequenceSource();
  const request = {
    sequence:
      createPassiveCaptureSequence(
        source,
      ),
    sequence_source:
      source,
  };
  const bundle =
    createCanonicalEventBundle(
      request,
    );
  const tampered =
    JSON.parse(
      JSON.stringify(bundle),
    );

  tampered.blocked_count = 0;

  const report =
    validateCanonicalEventBundle(
      tampered,
      request,
    );

  assert.equal(report.valid, false);
  assert.equal(
    report.errors[0].code,
    "BRIDGE_CANONICAL_BUNDLE_NOT_CANONICAL",
  );
});

test("FES 05C rejects unsupported bundle output fields", () => {
  const source =
    mixedSequenceSource();
  const request = {
    sequence:
      createPassiveCaptureSequence(
        source,
      ),
    sequence_source:
      source,
  };
  const bundle = {
    ...JSON.parse(
      JSON.stringify(
        createCanonicalEventBundle(
          request,
        ),
      ),
    ),
    sent_messages: 99,
  };

  assert.throws(
    () =>
      assertCanonicalEventBundle(
        bundle,
        request,
      ),
    error =>
      error.code ===
      "BRIDGE_CANONICAL_BUNDLE_OUTPUT_FIELDS_INVALID",
  );
});

test("FES 05C output is deeply immutable", () => {
  const source =
    mixedSequenceSource();
  const bundle =
    createCanonicalEventBundle({
      sequence:
        createPassiveCaptureSequence(
          source,
        ),
      sequence_source:
        source,
    });

  assert.equal(
    Object.isFrozen(bundle),
    true,
  );
  assert.equal(
    Object.isFrozen(
      bundle.events,
    ),
    true,
  );
  assert.equal(
    Object.isFrozen(
      bundle.blocked,
    ),
    true,
  );
  assert.throws(
    () => {
      bundle.events.push({});
    },
    TypeError,
  );
});

test("FES 05C does not mutate observation or sequence sources", () => {
  const observationSource =
    rawObservation(
      "QUOTE_STARTED",
    );
  const observationBefore =
    JSON.stringify(
      observationSource,
    );
  const observation =
    createPassiveCaptureObservation(
      observationSource,
    );

  createCanonicalEventFromObservation({
    observation,
    observation_source:
      observationSource,
  });

  assert.equal(
    JSON.stringify(
      observationSource,
    ),
    observationBefore,
  );

  const sequenceSource =
    mixedSequenceSource();
  const sequenceBefore =
    JSON.stringify(
      sequenceSource,
    );

  createCanonicalEventBundle({
    sequence:
      createPassiveCaptureSequence(
        sequenceSource,
      ),
    sequence_source:
      sequenceSource,
  });

  assert.equal(
    JSON.stringify(
      sequenceSource,
    ),
    sequenceBefore,
  );
});

test("FES 05C keeps bundle identity stable while digest follows content", () => {
  const source =
    mixedSequenceSource();
  const base =
    createCanonicalEventBundle({
      sequence:
        createPassiveCaptureSequence(
          source,
        ),
      sequence_source:
        source,
    });

  const extendedSource = {
    ...source,
    observations: [
      ...source.observations,
      rawObservation(
        "QUOTE_STARTED",
        20,
      ),
    ],
  };
  const extended =
    createCanonicalEventBundle({
      sequence:
        createPassiveCaptureSequence(
          extendedSource,
        ),
      sequence_source:
        extendedSource,
    });

  assert.equal(
    base.bundle_id,
    extended.bundle_id,
  );
  assert.notEqual(
    base.bundle_digest,
    extended.bundle_digest,
  );
});

test("FES 05C exported contracts are deeply immutable", () => {
  assert.equal(
    Object.isFrozen(
      EVENT_SUBJECT_TYPES,
    ),
    true,
  );
  assert.equal(
    Object.isFrozen(
      BLOCK_REASONS,
    ),
    true,
  );
  assert.throws(
    () => {
      BLOCK_REASONS
        .BRIDGE_EVIDENCE_ONLY =
        "ALLOW";
    },
    TypeError,
  );
});
