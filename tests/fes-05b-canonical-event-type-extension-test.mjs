import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

const contract = require(
  "../platform/event-evidence/canonical-activity-event-contract.js",
);
const bridge = require(
  "../platform/event-evidence/passive-capture-bridge-contract.js",
);

const {
  CONTRACT_VERSION,
  SCHEMA_VERSION,
  EVENT_TYPE_EXTENSION_VERSION,
  FIRST_VERTICAL_EVENT_TYPES,
  PASSIVE_CAPTURE_EVENT_TYPES,
  EVENT_TYPES,
  SUBJECT_TYPES,
  DEFAULT_SAFETY_FLAGS,
  createCanonicalActivityEvent,
  deriveCanonicalEventId,
  validateCanonicalActivityEvent,
} = contract;

const {
  createPassiveCaptureObservation,
} = bridge;

const TENANT = "tenant-advisor-001";
const PROSPECT = "prospect-001";

function timestamp(index) {
  const minute = String(index).padStart(2, "0");

  return {
    occurred_at:
      `2026-07-26T21:${minute}:00.000Z`,
    recorded_at:
      `2026-07-26T21:${minute}:01.000Z`,
  };
}

function sourceFor(type, index) {
  const map = {
    SYSTEM_GENERATED: {
      actor: {
        type: "SYSTEM",
        id: "forge-system",
      },
      source: {
        type: "SYSTEM_GENERATED",
        reference:
          `source-generated-${index}`,
        channel: "NASH",
      },
      evidence_strength: "UNVERIFIED",
      confirmation_state: "UNCONFIRMED",
    },
    SYSTEM_OBSERVED: {
      actor: {
        type: "SYSTEM",
        id: "forge-system",
      },
      source: {
        type: "SYSTEM_OBSERVED",
        reference:
          `source-observed-${index}`,
        channel: "FORGE_SYSTEM",
      },
      evidence_strength:
        "SYSTEM_OBSERVED",
      confirmation_state: "CONFIRMED",
    },
    ADVISOR_REPORTED: {
      actor: {
        type: "ADVISOR",
        id: "advisor-001",
      },
      source: {
        type: "ADVISOR_REPORTED",
        reference:
          `source-reported-${index}`,
        channel: "FORGE_UI",
      },
      evidence_strength: "REPORTED",
      confirmation_state: "REPORTED",
    },
    ADVISOR_CONFIRMED: {
      actor: {
        type: "ADVISOR",
        id: "advisor-001",
      },
      source: {
        type: "ADVISOR_CONFIRMED",
        reference:
          `source-confirmed-${index}`,
        channel: "FORGE_UI",
      },
      evidence_strength:
        "HUMAN_CONFIRMED",
      confirmation_state: "CONFIRMED",
    },
    EXTERNAL_PROVIDER_CONFIRMED: {
      actor: {
        type: "EXTERNAL_PROVIDER",
        id: "provider-001",
      },
      source: {
        type:
          "EXTERNAL_PROVIDER_CONFIRMED",
        reference:
          `source-provider-${index}`,
        channel: "WHATSAPP",
      },
      evidence_strength:
        "EXTERNAL_CONFIRMED",
      confirmation_state: "CONFIRMED",
    },
  };

  return map[type];
}

function fixtureFor(
  eventType,
  index = 1,
  overrides = {},
) {
  const flow =
    `flow-${eventType.toLowerCase()}`;
  const fixtures = {
    MESSAGE_DRAFT_GENERATED: {
      subject: {
        type: "MESSAGE",
        id: "message-draft-001",
      },
      source_type: "SYSTEM_GENERATED",
      payload: {
        flow_reference: flow,
        artifact_reference:
          "message-draft-001",
        generation_mode:
          "GOVERNED_PROVIDER",
        provider_reference:
          "provider-run-001",
      },
    },
    MESSAGE_DRAFT_EDITED: {
      subject: {
        type: "MESSAGE",
        id: "message-draft-002",
      },
      source_type: "SYSTEM_OBSERVED",
      payload: {
        flow_reference: flow,
        artifact_reference:
          "message-draft-002",
        previous_artifact_reference:
          "message-draft-001",
      },
    },
    MESSAGE_DRAFT_APPROVED: {
      subject: {
        type: "MESSAGE",
        id: "message-draft-002",
      },
      source_type: "ADVISOR_CONFIRMED",
      payload: {
        flow_reference: flow,
        artifact_reference:
          "message-draft-002",
        approval_reference:
          "approval-message-001",
      },
    },
    MESSAGE_SENT_CONFIRMED: {
      subject: {
        type: "MESSAGE",
        id: "message-draft-002",
      },
      source_type: "ADVISOR_CONFIRMED",
      payload: {
        flow_reference: flow,
        artifact_reference:
          "message-draft-002",
        confirmation_reference:
          "message-sent-001",
        provider_reference: null,
      },
    },
    PROSPECT_REPLIED_CONFIRMED: {
      subject: {
        type: "MESSAGE",
        id: "prospect-reply-001",
      },
      source_type: "ADVISOR_CONFIRMED",
      payload: {
        flow_reference: flow,
        result_reference:
          "prospect-reply-001",
        confirmation_reference:
          "reply-confirmation-001",
        provider_reference: null,
      },
    },
    OBJECTION_CAPTURED: {
      subject: {
        type: "OBJECTION",
        id: "objection-001",
      },
      source_type: "ADVISOR_REPORTED",
      payload: {
        flow_reference: flow,
        objection_reference:
          "objection-001",
        context_reference: null,
      },
    },
    OBJECTION_ANALYSIS_GENERATED: {
      subject: {
        type: "OBJECTION",
        id: "objection-001",
      },
      source_type: "SYSTEM_GENERATED",
      payload: {
        flow_reference: flow,
        objection_reference:
          "objection-001",
        analysis_reference:
          "analysis-001",
        provider_reference:
          "provider-run-002",
      },
    },
    OBJECTION_RESPONSE_GENERATED: {
      subject: {
        type: "OBJECTION",
        id: "objection-001",
      },
      source_type: "SYSTEM_GENERATED",
      payload: {
        flow_reference: flow,
        objection_reference:
          "objection-001",
        response_reference:
          "response-001",
        analysis_reference:
          "analysis-001",
        provider_reference:
          "provider-run-003",
      },
    },
    OBJECTION_RESPONSE_EDITED: {
      subject: {
        type: "OBJECTION",
        id: "objection-001",
      },
      source_type: "SYSTEM_OBSERVED",
      payload: {
        flow_reference: flow,
        response_reference:
          "response-002",
        previous_artifact_reference:
          "response-001",
      },
    },
    OBJECTION_RESPONSE_APPROVED: {
      subject: {
        type: "OBJECTION",
        id: "objection-001",
      },
      source_type: "ADVISOR_CONFIRMED",
      payload: {
        flow_reference: flow,
        response_reference:
          "response-002",
        approval_reference:
          "approval-response-001",
      },
    },
    OBJECTION_RESPONSE_USED: {
      subject: {
        type: "OBJECTION",
        id: "objection-001",
      },
      source_type: "ADVISOR_CONFIRMED",
      payload: {
        flow_reference: flow,
        response_reference:
          "response-002",
        confirmation_reference:
          "response-used-001",
      },
    },
    OBJECTION_OUTCOME_CONFIRMED: {
      subject: {
        type: "OBJECTION",
        id: "objection-001",
      },
      source_type: "ADVISOR_CONFIRMED",
      payload: {
        flow_reference: flow,
        outcome_reference:
          "objection-outcome-001",
        confirmation_reference:
          "outcome-confirmation-001",
        reason_code:
          "FOLLOW_UP_ACCEPTED",
      },
    },
    CALL_CONNECTED_CONFIRMED: {
      subject: {
        type: "CALL",
        id: "call-001",
      },
      source_type: "ADVISOR_CONFIRMED",
      payload: {
        flow_reference: flow,
        call_reference: "call-001",
        confirmation_reference:
          "call-connected-001",
        provider_reference: null,
      },
    },
    CALL_NOT_ANSWERED_CONFIRMED: {
      subject: {
        type: "CALL",
        id: "call-002",
      },
      source_type: "ADVISOR_CONFIRMED",
      payload: {
        flow_reference: flow,
        call_reference: "call-002",
        confirmation_reference:
          "call-not-answered-001",
        provider_reference: null,
      },
    },
    CALL_CONTEXT_ADDED: {
      subject: {
        type: "CALL",
        id: "call-001",
      },
      source_type: "ADVISOR_REPORTED",
      payload: {
        flow_reference: flow,
        call_reference: "call-001",
        context_reference:
          "call-context-001",
        capture_mode: "VOICE",
      },
    },
    QUOTE_STARTED: {
      subject: {
        type: "QUOTE",
        id: "quote-001",
      },
      source_type: "SYSTEM_OBSERVED",
      payload: {
        flow_reference: flow,
        quote_reference: "quote-001",
      },
    },
    QUOTE_PREPARED: {
      subject: {
        type: "QUOTE",
        id: "quote-001",
      },
      source_type: "SYSTEM_OBSERVED",
      payload: {
        flow_reference: flow,
        quote_reference: "quote-001",
        artifact_reference:
          "quote-artifact-001",
      },
    },
    QUOTE_REVIEWED: {
      subject: {
        type: "QUOTE",
        id: "quote-001",
      },
      source_type: "ADVISOR_CONFIRMED",
      payload: {
        flow_reference: flow,
        quote_reference: "quote-001",
        artifact_reference:
          "quote-artifact-001",
        approval_reference:
          "quote-review-001",
      },
    },
    PRESENTATION_HELD_CONFIRMED: {
      subject: {
        type: "PRESENTATION",
        id: "presentation-001",
      },
      source_type: "ADVISOR_CONFIRMED",
      payload: {
        flow_reference: flow,
        presentation_reference:
          "presentation-001",
        confirmation_reference:
          "presentation-held-001",
        quote_reference: "quote-001",
      },
    },
    PRODUCT_QUESTION_CAPTURED: {
      subject: {
        type: "PRODUCT_QUESTION",
        id: "product-question-001",
      },
      source_type: "ADVISOR_REPORTED",
      payload: {
        flow_reference: flow,
        question_reference:
          "product-question-001",
        presentation_reference:
          "presentation-001",
        quote_reference: "quote-001",
      },
    },
    PROPOSAL_REQUESTED_CONFIRMED: {
      subject: {
        type: "PROPOSAL",
        id: "proposal-001",
      },
      source_type: "ADVISOR_CONFIRMED",
      payload: {
        flow_reference: flow,
        proposal_reference:
          "proposal-001",
        confirmation_reference:
          "proposal-requested-001",
        presentation_reference:
          "presentation-001",
        quote_reference: "quote-001",
      },
    },
  };

  const selected = fixtures[eventType];
  const evidence = sourceFor(
    selected.source_type,
    index,
  );
  const time = timestamp(index);

  return {
    event_type: eventType,
    tenant_id: TENANT,
    actor: evidence.actor,
    subject: selected.subject,
    source: evidence.source,
    evidence_strength:
      evidence.evidence_strength,
    occurred_at: time.occurred_at,
    recorded_at: time.recorded_at,
    effective_period: null,
    causation_id: null,
    correlation_id:
      `correlation-${PROSPECT}`,
    idempotency_key:
      `fes05b-${eventType.toLowerCase()}-${index}`,
    privacy_class: "PRIVATE",
    learning_eligibility: false,
    payload: selected.payload,
    provenance: {
      source_system: "fes-05b-test",
      source_record_id:
        `record-${eventType.toLowerCase()}-${index}`,
      captured_via:
        evidence.source.channel,
      evidence_references: [
        `evidence-${eventType.toLowerCase()}-${index}`,
      ],
    },
    confirmation_state:
      evidence.confirmation_state,
    correction_of: null,
    safety_flags: {
      ...DEFAULT_SAFETY_FLAGS,
    },
    ...overrides,
  };
}

test("FES 05B exposes the extension version without erasing FES 01", () => {
  assert.equal(CONTRACT_VERSION, "FES-01.1");
  assert.equal(
    SCHEMA_VERSION,
    "forge.activity_event.v1",
  );
  assert.equal(
    EVENT_TYPE_EXTENSION_VERSION,
    "FES-05B.1",
  );
});

test("FES 05B preserves the original thirteen-event vertical", () => {
  assert.equal(
    FIRST_VERTICAL_EVENT_TYPES.length,
    13,
  );
  assert.deepEqual(
    EVENT_TYPES.slice(0, 13),
    FIRST_VERTICAL_EVENT_TYPES,
  );
});

test("FES 05B adds exactly twenty-one passive-capture events", () => {
  assert.equal(
    PASSIVE_CAPTURE_EVENT_TYPES.length,
    21,
  );
  assert.equal(EVENT_TYPES.length, 34);
  assert.deepEqual(
    EVENT_TYPES.slice(13),
    PASSIVE_CAPTURE_EVENT_TYPES,
  );
});

test("FES 05B keeps handoff-only observations outside canonical event types", () => {
  for (const action of [
    "WHATSAPP_OPENED",
    "CALL_INITIATED",
    "CALENDAR_TEMPLATE_OPENED",
  ]) {
    assert.equal(
      EVENT_TYPES.includes(action),
      false,
      action,
    );
  }
});

test("FES 05B keeps pipeline stage events outside this extension", () => {
  for (const action of [
    "PIPELINE_STAGE_CHANGE_REQUESTED",
    "PIPELINE_STAGE_CHANGE_CONFIRMED",
  ]) {
    assert.equal(
      EVENT_TYPES.includes(action),
      false,
      action,
    );
  }
});

test("FES 05B exposes all new subject types", () => {
  for (const subjectType of [
    "MESSAGE",
    "OBJECTION",
    "CALL",
    "QUOTE",
    "PRESENTATION",
    "PRODUCT_QUESTION",
    "PROPOSAL",
  ]) {
    assert.equal(
      SUBJECT_TYPES.includes(subjectType),
      true,
      subjectType,
    );
  }
});

test("FES 05B validates every extension event", async t => {
  for (
    const [index, eventType]
    of PASSIVE_CAPTURE_EVENT_TYPES.entries()
  ) {
    await t.test(eventType, () => {
      const event =
        createCanonicalActivityEvent(
          fixtureFor(
            eventType,
            index + 1,
          ),
        );
      const report =
        validateCanonicalActivityEvent(
          event,
        );

      assert.equal(
        event.event_type,
        eventType,
      );
      assert.equal(report.valid, true);
      assert.deepEqual(
        report.errors,
        [],
      );
    });
  }
});

test("FES 05B generated artifacts remain unconfirmed", () => {
  for (const eventType of [
    "MESSAGE_DRAFT_GENERATED",
    "OBJECTION_ANALYSIS_GENERATED",
    "OBJECTION_RESPONSE_GENERATED",
  ]) {
    const event =
      createCanonicalActivityEvent(
        fixtureFor(eventType),
      );

    assert.equal(
      event.source.type,
      "SYSTEM_GENERATED",
    );
    assert.equal(
      event.evidence_strength,
      "UNVERIFIED",
    );
    assert.equal(
      event.confirmation_state,
      "UNCONFIRMED",
    );
  }
});

test("FES 05B human approvals require human-confirmed source", () => {
  for (const eventType of [
    "MESSAGE_DRAFT_APPROVED",
    "OBJECTION_RESPONSE_APPROVED",
    "QUOTE_REVIEWED",
  ]) {
    const event =
      createCanonicalActivityEvent(
        fixtureFor(eventType),
      );

    assert.equal(
      event.source.type,
      "ADVISOR_CONFIRMED",
    );
    assert.equal(
      event.evidence_strength,
      "HUMAN_CONFIRMED",
    );
    assert.equal(
      event.confirmation_state,
      "CONFIRMED",
    );
  }
});

test("FES 05B rejects advisor-confirmed generation", () => {
  const input =
    fixtureFor(
      "MESSAGE_DRAFT_GENERATED",
    );
  const confirmed =
    sourceFor(
      "ADVISOR_CONFIRMED",
      90,
    );

  assert.throws(
    () =>
      createCanonicalActivityEvent({
        ...input,
        actor: confirmed.actor,
        source: confirmed.source,
        evidence_strength:
          confirmed.evidence_strength,
        confirmation_state:
          confirmed.confirmation_state,
      }),
    error =>
      error.code ===
      "EVENT_SOURCE_TYPE_MISMATCH",
  );
});

test("FES 05B rejects system-generated approval", () => {
  const input =
    fixtureFor(
      "MESSAGE_DRAFT_APPROVED",
    );
  const generated =
    sourceFor(
      "SYSTEM_GENERATED",
      91,
    );

  assert.throws(
    () =>
      createCanonicalActivityEvent({
        ...input,
        actor: generated.actor,
        source: generated.source,
        evidence_strength:
          generated.evidence_strength,
        confirmation_state:
          generated.confirmation_state,
      }),
    error =>
      error.code ===
      "EVENT_SOURCE_TYPE_MISMATCH",
  );
});

test("FES 05B accepts advisor-confirmed sent evidence", () => {
  const event =
    createCanonicalActivityEvent(
      fixtureFor(
        "MESSAGE_SENT_CONFIRMED",
      ),
    );

  assert.equal(
    event.evidence_strength,
    "HUMAN_CONFIRMED",
  );
});

test("FES 05B accepts provider-confirmed sent evidence", () => {
  const input =
    fixtureFor(
      "MESSAGE_SENT_CONFIRMED",
    );
  const provider =
    sourceFor(
      "EXTERNAL_PROVIDER_CONFIRMED",
      92,
    );
  const event =
    createCanonicalActivityEvent({
      ...input,
      actor: provider.actor,
      source: provider.source,
      evidence_strength:
        provider.evidence_strength,
      confirmation_state:
        provider.confirmation_state,
      payload: {
        ...input.payload,
        provider_reference:
          "provider-message-001",
      },
    });

  assert.equal(
    event.evidence_strength,
    "EXTERNAL_CONFIRMED",
  );
});

test("FES 05B rejects weak evidence for a confirmed result", () => {
  const input =
    fixtureFor(
      "PROSPECT_REPLIED_CONFIRMED",
    );
  const reported =
    sourceFor(
      "ADVISOR_REPORTED",
      93,
    );

  assert.throws(
    () =>
      createCanonicalActivityEvent({
        ...input,
        actor: reported.actor,
        source: reported.source,
        evidence_strength:
          reported.evidence_strength,
        confirmation_state:
          reported.confirmation_state,
      }),
    error =>
      [
        "EVENT_SOURCE_TYPE_MISMATCH",
        "CONFIRMED_RESULT_EVIDENCE_REQUIRED",
      ].includes(error.code),
  );
});

test("FES 05B allows reported objection capture", () => {
  const event =
    createCanonicalActivityEvent(
      fixtureFor(
        "OBJECTION_CAPTURED",
      ),
    );

  assert.equal(
    event.confirmation_state,
    "REPORTED",
  );
});

test("FES 05B allows confirmed objection capture", () => {
  const input =
    fixtureFor(
      "OBJECTION_CAPTURED",
    );
  const confirmed =
    sourceFor(
      "ADVISOR_CONFIRMED",
      94,
    );
  const event =
    createCanonicalActivityEvent({
      ...input,
      actor: confirmed.actor,
      source: confirmed.source,
      evidence_strength:
        confirmed.evidence_strength,
      confirmation_state:
        confirmed.confirmation_state,
    });

  assert.equal(
    event.confirmation_state,
    "CONFIRMED",
  );
});

test("FES 05B keeps raw message content forbidden", () => {
  const input =
    fixtureFor(
      "MESSAGE_DRAFT_GENERATED",
    );

  assert.throws(
    () =>
      createCanonicalActivityEvent({
        ...input,
        payload: {
          ...input.payload,
          message_text:
            "Texto privado",
        },
      }),
    error =>
      error.code ===
        "PAYLOAD_PROHIBITED_FIELDS" ||
      error.code ===
        "PAYLOAD_FIELDS_INVALID",
  );
});

test("FES 05B keeps raw objection content forbidden", () => {
  const input =
    fixtureFor(
      "OBJECTION_CAPTURED",
    );

  assert.throws(
    () =>
      createCanonicalActivityEvent({
        ...input,
        payload: {
          ...input.payload,
          transcript:
            "Contenido privado",
        },
      }),
    error =>
      error.code ===
        "PAYLOAD_PROHIBITED_FIELDS",
  );
});

test("FES 05B requires event-specific payload references", () => {
  const input =
    fixtureFor(
      "CALL_CONNECTED_CONFIRMED",
    );
  const payload = {
    ...input.payload,
  };
  delete payload.call_reference;

  assert.throws(
    () =>
      createCanonicalActivityEvent({
        ...input,
        payload,
      }),
    error =>
      error.code ===
      "PAYLOAD_FIELDS_REQUIRED",
  );
});

test("FES 05B canonicalizes absent optional references to null", () => {
  const input =
    fixtureFor(
      "MESSAGE_SENT_CONFIRMED",
    );
  const payload = {
    ...input.payload,
  };
  delete payload.provider_reference;

  const event =
    createCanonicalActivityEvent({
      ...input,
      payload,
    });

  assert.equal(
    event.payload.provider_reference,
    null,
  );
});

test("FES 05B rejects subject mismatch", () => {
  const input =
    fixtureFor(
      "QUOTE_PREPARED",
    );

  assert.throws(
    () =>
      createCanonicalActivityEvent({
        ...input,
        subject: {
          type: "MESSAGE",
          id: "message-001",
        },
      }),
    error =>
      error.code ===
      "EVENT_SUBJECT_TYPE_MISMATCH",
  );
});

test("FES 05B keeps event creation side-effect free", () => {
  const event =
    createCanonicalActivityEvent(
      fixtureFor(
        "MESSAGE_SENT_CONFIRMED",
      ),
    );

  assert.deepEqual(
    event.safety_flags,
    DEFAULT_SAFETY_FLAGS,
  );
});

test("FES 05B derives deterministic event identity", () => {
  const input =
    fixtureFor(
      "QUOTE_PREPARED",
      20,
    );
  const left =
    createCanonicalActivityEvent(
      input,
    );
  const right =
    createCanonicalActivityEvent(
      JSON.parse(
        JSON.stringify(input),
      ),
    );

  assert.equal(
    left.event_id,
    right.event_id,
  );
  assert.equal(
    left.event_id,
    deriveCanonicalEventId({
      tenant_id: TENANT,
      event_type:
        "QUOTE_PREPARED",
      idempotency_key:
        input.idempotency_key,
    }),
  );
});

test("FES 05B detects tampered canonical identity", () => {
  const event =
    createCanonicalActivityEvent(
      fixtureFor(
        "PROPOSAL_REQUESTED_CONFIRMED",
      ),
    );
  const tampered =
    JSON.parse(JSON.stringify(event));

  tampered.event_id =
    "evt_00000000000000000000000000000000";

  const report =
    validateCanonicalActivityEvent(
      tampered,
    );

  assert.equal(report.valid, false);
  assert.equal(
    report.errors[0].code,
    "EVENT_ID_MISMATCH",
  );
});

test("FES 05B outputs deeply immutable events", () => {
  const event =
    createCanonicalActivityEvent(
      fixtureFor(
        "PRODUCT_QUESTION_CAPTURED",
      ),
    );

  assert.equal(
    Object.isFrozen(event),
    true,
  );
  assert.equal(
    Object.isFrozen(event.payload),
    true,
  );
  assert.throws(
    () => {
      event.payload.question_reference =
        "changed";
    },
    TypeError,
  );
});

test("FES 05B does not mutate input", () => {
  const input =
    fixtureFor(
      "OBJECTION_RESPONSE_GENERATED",
    );
  const before =
    JSON.stringify(input);

  createCanonicalActivityEvent(input);

  assert.equal(
    JSON.stringify(input),
    before,
  );
});

test("FES 05B bridge recognizes generated draft as canonically supported", () => {
  const observed =
    createPassiveCaptureObservation({
      observation_reference:
        "bridge-observation-001",
      tenant_id: TENANT,
      actor_id: "advisor-001",
      prospect_id: PROSPECT,
      action_code:
        "MESSAGE_DRAFT_GENERATED",
      source_type:
        "SYSTEM_GENERATED",
      occurred_at:
        "2026-07-26T22:00:00.000Z",
      recorded_at:
        "2026-07-26T22:00:01.000Z",
      payload: {
        flow_reference:
          "flow-bridge-001",
        artifact_reference:
          "draft-bridge-001",
        generation_mode:
          "GOVERNED_PROVIDER",
      },
      evidence_references: [
        "bridge-evidence-001",
      ],
    });

  assert.equal(
    observed.canonical_candidate.state,
    "SUPPORTED_BY_FES01",
  );
});

test("FES 05B bridge keeps WhatsApp handoff outside canon", () => {
  const observed =
    createPassiveCaptureObservation({
      observation_reference:
        "bridge-observation-002",
      tenant_id: TENANT,
      actor_id: "advisor-001",
      prospect_id: PROSPECT,
      action_code:
        "WHATSAPP_OPENED",
      source_type:
        "EXTERNAL_HANDOFF_OBSERVED",
      occurred_at:
        "2026-07-26T22:01:00.000Z",
      recorded_at:
        "2026-07-26T22:01:01.000Z",
      payload: {
        flow_reference:
          "flow-bridge-001",
        artifact_reference:
          "draft-bridge-001",
        handoff_reference:
          "handoff-bridge-001",
      },
      evidence_references: [
        "bridge-evidence-002",
      ],
    });

  assert.equal(
    observed.canonical_candidate.state,
    "REQUIRES_FES05B_EVENT_EXTENSION",
  );
});

test("FES 05B bridge keeps Calendar template as bridge evidence only", () => {
  const observed =
    createPassiveCaptureObservation({
      observation_reference:
        "bridge-observation-003",
      tenant_id: TENANT,
      actor_id: "advisor-001",
      prospect_id: PROSPECT,
      action_code:
        "CALENDAR_TEMPLATE_OPENED",
      source_type:
        "EXTERNAL_HANDOFF_OBSERVED",
      occurred_at:
        "2026-07-26T22:02:00.000Z",
      recorded_at:
        "2026-07-26T22:02:01.000Z",
      payload: {
        flow_reference:
          "flow-calendar-001",
        appointment_reference:
          "appointment-001",
        handoff_reference:
          "calendar-handoff-001",
      },
      evidence_references: [
        "bridge-evidence-003",
      ],
    });

  assert.equal(
    observed.canonical_candidate.state,
    "BRIDGE_EVIDENCE_ONLY",
  );
});

test("FES 05B bridge keeps pipeline movement source-truth-gated", () => {
  const observed =
    createPassiveCaptureObservation({
      observation_reference:
        "bridge-observation-004",
      tenant_id: TENANT,
      actor_id: "advisor-001",
      prospect_id: PROSPECT,
      action_code:
        "PIPELINE_STAGE_CHANGE_CONFIRMED",
      source_type:
        "SYSTEM_OBSERVED",
      occurred_at:
        "2026-07-26T22:03:00.000Z",
      recorded_at:
        "2026-07-26T22:03:01.000Z",
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
      evidence_references: [
        "bridge-evidence-004",
      ],
    });

  assert.equal(
    observed.canonical_candidate.state,
    "SOURCE_TRUTH_REQUIRED",
  );
});
