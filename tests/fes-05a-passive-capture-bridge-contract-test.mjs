import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

const bridge = require(
  "../platform/event-evidence/passive-capture-bridge-contract.js",
);

const {
  CONTRACT_VERSION,
  OBSERVATION_VERSION,
  SEQUENCE_VERSION,
  DOMAINS,
  STAGES,
  ACTION_CATALOG,
  ACTION_CODES,
  createPassiveCaptureObservation,
  assertPassiveCaptureObservation,
  validatePassiveCaptureObservation,
  createPassiveCaptureSequence,
  assertPassiveCaptureSequence,
  validatePassiveCaptureSequence,
  rebuildPassiveCaptureSequence,
} = bridge;

function at(index) {
  return `2026-07-26T${String(
    20 + Math.floor(index / 60),
  ).padStart(2, "0")}:${String(
    index % 60,
  ).padStart(2, "0")}:00.000Z`;
}

function observation(
  actionCode,
  index,
  payload,
  overrides = {},
) {
  const defaultSources = {
    MESSAGE_DRAFT_GENERATED:
      "SYSTEM_GENERATED",
    MESSAGE_DRAFT_EDITED:
      "SYSTEM_OBSERVED",
    MESSAGE_DRAFT_APPROVED:
      "ADVISOR_CONFIRMED",
    WHATSAPP_OPENED:
      "EXTERNAL_HANDOFF_OBSERVED",
    MESSAGE_SENT_CONFIRMED:
      "ADVISOR_CONFIRMED",
    PROSPECT_REPLIED_CONFIRMED:
      "ADVISOR_CONFIRMED",
    OBJECTION_CAPTURED:
      "ADVISOR_REPORTED",
    OBJECTION_ANALYSIS_GENERATED:
      "SYSTEM_GENERATED",
    OBJECTION_RESPONSE_GENERATED:
      "SYSTEM_GENERATED",
    OBJECTION_RESPONSE_EDITED:
      "SYSTEM_OBSERVED",
    OBJECTION_RESPONSE_APPROVED:
      "ADVISOR_CONFIRMED",
    OBJECTION_RESPONSE_USED:
      "ADVISOR_CONFIRMED",
    OBJECTION_OUTCOME_CONFIRMED:
      "ADVISOR_CONFIRMED",
    CALL_INITIATED:
      "EXTERNAL_HANDOFF_OBSERVED",
    CALL_CONNECTED_CONFIRMED:
      "ADVISOR_CONFIRMED",
    CALL_NOT_ANSWERED_CONFIRMED:
      "ADVISOR_CONFIRMED",
    CALL_CONTEXT_ADDED:
      "ADVISOR_REPORTED",
    CALENDAR_TEMPLATE_OPENED:
      "EXTERNAL_HANDOFF_OBSERVED",
    APPOINTMENT_SCHEDULED:
      "EXTERNAL_PROVIDER_CONFIRMED",
    APPOINTMENT_NOT_HELD:
      "ADVISOR_CONFIRMED",
    APPOINTMENT_RESCHEDULED:
      "ADVISOR_CONFIRMED",
    APPOINTMENT_NO_SHOW:
      "ADVISOR_CONFIRMED",
    APPOINTMENT_HELD:
      "ADVISOR_CONFIRMED",
    QUOTE_STARTED:
      "SYSTEM_OBSERVED",
    QUOTE_PREPARED:
      "SYSTEM_OBSERVED",
    QUOTE_REVIEWED:
      "ADVISOR_CONFIRMED",
    PRESENTATION_HELD_CONFIRMED:
      "ADVISOR_CONFIRMED",
    PRODUCT_QUESTION_CAPTURED:
      "ADVISOR_REPORTED",
    PROPOSAL_REQUESTED_CONFIRMED:
      "ADVISOR_CONFIRMED",
    PIPELINE_STAGE_CHANGE_REQUESTED:
      "SYSTEM_OBSERVED",
    PIPELINE_STAGE_CHANGE_CONFIRMED:
      "SYSTEM_OBSERVED",
  };

  return {
    observation_reference:
      `observation-${index}-${actionCode.toLowerCase()}`,
    tenant_id:
      "tenant-advisor-001",
    actor_id:
      "advisor-001",
    prospect_id:
      "prospect-001",
    action_code:
      actionCode,
    source_type:
      defaultSources[actionCode],
    occurred_at: at(index),
    recorded_at: new Date(
      Date.parse(at(index)) + 1000,
    ).toISOString(),
    payload,
    evidence_references: [
      `evidence-${index}`,
    ],
    ...overrides,
  };
}

function sequence(
  observations,
  overrides = {},
) {
  return {
    sequence_reference:
      "sequence-001",
    observations,
    ...overrides,
  };
}

function whatsappFlow() {
  return [
    observation(
      "MESSAGE_DRAFT_GENERATED",
      1,
      {
        flow_reference:
          "flow-whatsapp-001",
        artifact_reference:
          "draft-001",
        generation_mode:
          "GOVERNED_PROVIDER",
        provider_reference:
          "provider-run-001",
      },
    ),
    observation(
      "MESSAGE_DRAFT_EDITED",
      2,
      {
        flow_reference:
          "flow-whatsapp-001",
        artifact_reference:
          "draft-002",
        previous_artifact_reference:
          "draft-001",
      },
    ),
    observation(
      "MESSAGE_DRAFT_APPROVED",
      3,
      {
        flow_reference:
          "flow-whatsapp-001",
        artifact_reference:
          "draft-002",
        approval_reference:
          "approval-001",
      },
    ),
    observation(
      "WHATSAPP_OPENED",
      4,
      {
        flow_reference:
          "flow-whatsapp-001",
        artifact_reference:
          "draft-002",
        handoff_reference:
          "handoff-001",
      },
    ),
    observation(
      "MESSAGE_SENT_CONFIRMED",
      5,
      {
        flow_reference:
          "flow-whatsapp-001",
        artifact_reference:
          "draft-002",
        confirmation_reference:
          "sent-confirmation-001",
      },
    ),
    observation(
      "PROSPECT_REPLIED_CONFIRMED",
      6,
      {
        flow_reference:
          "flow-whatsapp-001",
        result_reference:
          "reply-001",
        confirmation_reference:
          "reply-confirmation-001",
      },
    ),
  ];
}

test("FES 05A exposes locked bridge contracts", () => {
  assert.equal(
    CONTRACT_VERSION,
    "FES-05A.1",
  );
  assert.equal(
    OBSERVATION_VERSION,
    "forge.passive_capture_observation.v1",
  );
  assert.equal(
    SEQUENCE_VERSION,
    "forge.passive_capture_sequence.v1",
  );
  assert.equal(DOMAINS.length, 6);
  assert.equal(STAGES.length, 12);
  assert.equal(ACTION_CODES.length, 31);
});

test("FES 05A catalog contains every locked source-truth action", () => {
  const required = [
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
    "CALL_NOT_ANSWERED_CONFIRMED",
    "CALL_CONTEXT_ADDED",
    "APPOINTMENT_SCHEDULED",
    "APPOINTMENT_HELD",
    "APPOINTMENT_NOT_HELD",
    "APPOINTMENT_RESCHEDULED",
    "APPOINTMENT_NO_SHOW",
    "QUOTE_STARTED",
    "QUOTE_PREPARED",
    "QUOTE_REVIEWED",
    "PRESENTATION_HELD_CONFIRMED",
    "PRODUCT_QUESTION_CAPTURED",
    "PROPOSAL_REQUESTED_CONFIRMED",
  ];

  for (const action of required) {
    assert.equal(
      ACTION_CODES.includes(action),
      true,
      action,
    );
  }
});

test("FES 05A rejects unknown actions", () => {
  assert.throws(
    () =>
      createPassiveCaptureObservation(
        observation(
          "MESSAGE_DRAFT_GENERATED",
          1,
          {
            flow_reference:
              "flow-001",
            artifact_reference:
              "draft-001",
            generation_mode:
              "SAFE",
          },
          {
            action_code:
              "MESSAGE_TELEPORTED",
          },
        ),
      ),
    error =>
      error.code ===
      "PASSIVE_CAPTURE_ACTION_INVALID",
  );
});

test("FES 05A rejects source evidence mismatch", () => {
  assert.throws(
    () =>
      createPassiveCaptureObservation(
        observation(
          "MESSAGE_DRAFT_GENERATED",
          1,
          {
            flow_reference:
              "flow-001",
            artifact_reference:
              "draft-001",
            generation_mode:
              "SAFE",
          },
          {
            source_type:
              "ADVISOR_CONFIRMED",
          },
        ),
      ),
    error =>
      error.code ===
      "PASSIVE_CAPTURE_SOURCE_MISMATCH",
  );
});

test("FES 05A rejects raw message content", () => {
  assert.throws(
    () =>
      createPassiveCaptureObservation(
        observation(
          "MESSAGE_DRAFT_GENERATED",
          1,
          {
            flow_reference:
              "flow-001",
            artifact_reference:
              "draft-001",
            generation_mode:
              "SAFE",
            message_text:
              "Hola, te escribo...",
          },
        ),
      ),
    error =>
      error.code ===
      "PASSIVE_CAPTURE_RAW_CONTENT_FORBIDDEN" ||
      error.code ===
      "PASSIVE_CAPTURE_PAYLOAD_FIELDS_INVALID",
  );
});

test("FES 05A generation is not approval or send", () => {
  const item =
    createPassiveCaptureObservation(
      whatsappFlow()[0],
    );

  assert.equal(
    item.stage,
    "GENERATION",
  );
  assert.equal(
    item.external_action_performed,
    false,
  );
  assert.equal(
    item.result_confirmed,
    false,
  );
  assert.equal(
    item.approval_required_before_external_use,
    true,
  );
  assert.equal(
    item.boundaries
      .generation_is_approval,
    false,
  );
});

test("FES 05A edit is not approval", () => {
  const item =
    createPassiveCaptureObservation(
      whatsappFlow()[1],
    );

  assert.equal(item.stage, "EDIT");
  assert.equal(
    item.boundaries.edit_is_approval,
    false,
  );
});

test("FES 05A approval is not external action", () => {
  const item =
    createPassiveCaptureObservation(
      whatsappFlow()[2],
    );

  assert.equal(item.stage, "APPROVAL");
  assert.equal(
    item.external_action_performed,
    false,
  );
  assert.equal(
    item.boundaries
      .approval_is_external_action,
    false,
  );
});

test("FES 05A WhatsApp opening is handoff only", () => {
  const item =
    createPassiveCaptureObservation(
      whatsappFlow()[3],
    );

  assert.equal(item.stage, "HANDOFF");
  assert.equal(
    item.claim_scope,
    "EXTERNAL_HANDOFF_ONLY",
  );
  assert.equal(
    item.external_action_performed,
    false,
  );
  assert.equal(
    item.result_confirmed,
    false,
  );
});

test("FES 05A confirmed send is external action but not reply", () => {
  const item =
    createPassiveCaptureObservation(
      whatsappFlow()[4],
    );

  assert.equal(
    item.external_action_performed,
    true,
  );
  assert.equal(
    item.result_confirmed,
    false,
  );
});

test("FES 05A confirmed reply is a result", () => {
  const item =
    createPassiveCaptureObservation(
      whatsappFlow()[5],
    );

  assert.equal(
    item.result_confirmed,
    true,
  );
});

test("FES 05A requires exact approval before WhatsApp handoff", () => {
  assert.throws(
    () =>
      createPassiveCaptureSequence(
        sequence([
          whatsappFlow()[0],
          whatsappFlow()[3],
        ]),
      ),
    error =>
      error.code ===
      "PASSIVE_CAPTURE_EXACT_APPROVAL_REQUIRED",
  );
});

test("FES 05A requires reapproval after edit", () => {
  const flow = whatsappFlow();

  assert.throws(
    () =>
      createPassiveCaptureSequence(
        sequence([
          flow[0],
          flow[2],
          observation(
            "MESSAGE_DRAFT_EDITED",
            4,
            {
              flow_reference:
                "flow-whatsapp-001",
              artifact_reference:
                "draft-003",
              previous_artifact_reference:
                "draft-001",
            },
          ),
          observation(
            "WHATSAPP_OPENED",
            5,
            {
              flow_reference:
                "flow-whatsapp-001",
              artifact_reference:
                "draft-003",
              handoff_reference:
                "handoff-002",
            },
          ),
        ]),
      ),
    error =>
      error.code ===
      "PASSIVE_CAPTURE_EXACT_APPROVAL_REQUIRED",
  );
});

test("FES 05A accepts complete WhatsApp lifecycle", () => {
  const result =
    createPassiveCaptureSequence(
      sequence(whatsappFlow()),
    );

  assert.equal(
    result.observation_count,
    6,
  );
  assert.equal(
    result.unresolved_handoffs.length,
    0,
  );
  assert.equal(
    result.counts_by_stage.RESULT,
    1,
  );
});

test("FES 05A detects unresolved WhatsApp handoff", () => {
  const flow = whatsappFlow();
  const result =
    createPassiveCaptureSequence(
      sequence(flow.slice(0, 4)),
    );

  assert.deepEqual(
    result.unresolved_handoffs,
    [
      {
        flow_reference:
          "flow-whatsapp-001",
        domain:
          "WHATSAPP_NASH",
        handoff_action:
          "WHATSAPP_OPENED",
        expected_confirmation:
          "MESSAGE_SENT_CONFIRMED",
      },
    ],
  );
});

test("FES 05A requires sent confirmation before reply", () => {
  const flow = whatsappFlow();

  assert.throws(
    () =>
      createPassiveCaptureSequence(
        sequence([
          ...flow.slice(0, 4),
          flow[5],
        ]),
      ),
    error =>
      error.code ===
      "PASSIVE_CAPTURE_SEQUENCE_PREDECESSOR_MISSING",
  );
});

test("FES 05A protects Nash Combat response lifecycle", () => {
  const flowReference =
    "flow-objection-001";
  const observations = [
    observation(
      "OBJECTION_CAPTURED",
      1,
      {
        flow_reference:
          flowReference,
        objection_reference:
          "objection-001",
      },
    ),
    observation(
      "OBJECTION_ANALYSIS_GENERATED",
      2,
      {
        flow_reference:
          flowReference,
        objection_reference:
          "objection-001",
        analysis_reference:
          "analysis-001",
      },
    ),
    observation(
      "OBJECTION_RESPONSE_GENERATED",
      3,
      {
        flow_reference:
          flowReference,
        objection_reference:
          "objection-001",
        response_reference:
          "response-001",
        analysis_reference:
          "analysis-001",
      },
    ),
    observation(
      "OBJECTION_RESPONSE_APPROVED",
      4,
      {
        flow_reference:
          flowReference,
        response_reference:
          "response-001",
        approval_reference:
          "approval-001",
      },
    ),
    observation(
      "OBJECTION_RESPONSE_USED",
      5,
      {
        flow_reference:
          flowReference,
        response_reference:
          "response-001",
        confirmation_reference:
          "used-001",
      },
    ),
    observation(
      "OBJECTION_OUTCOME_CONFIRMED",
      6,
      {
        flow_reference:
          flowReference,
        outcome_reference:
          "outcome-001",
        confirmation_reference:
          "outcome-confirmation-001",
      },
    ),
  ];

  const result =
    createPassiveCaptureSequence(
      sequence(observations),
    );

  assert.equal(
    result.counts_by_domain
      .NASH_COMBAT,
    6,
  );
  assert.equal(
    result.observations.at(-1)
      .result_confirmed,
    true,
  );
});

test("FES 05A blocks use after Nash Combat edit without reapproval", () => {
  const flowReference =
    "flow-objection-001";

  assert.throws(
    () =>
      createPassiveCaptureSequence(
        sequence([
          observation(
            "OBJECTION_CAPTURED",
            1,
            {
              flow_reference:
                flowReference,
              objection_reference:
                "objection-001",
            },
          ),
          observation(
            "OBJECTION_RESPONSE_GENERATED",
            2,
            {
              flow_reference:
                flowReference,
              objection_reference:
                "objection-001",
              response_reference:
                "response-001",
            },
          ),
          observation(
            "OBJECTION_RESPONSE_APPROVED",
            3,
            {
              flow_reference:
                flowReference,
              response_reference:
                "response-001",
              approval_reference:
                "approval-001",
            },
          ),
          observation(
            "OBJECTION_RESPONSE_EDITED",
            4,
            {
              flow_reference:
                flowReference,
              response_reference:
                "response-002",
              previous_artifact_reference:
                "response-001",
            },
          ),
          observation(
            "OBJECTION_RESPONSE_USED",
            5,
            {
              flow_reference:
                flowReference,
              response_reference:
                "response-002",
              confirmation_reference:
                "used-001",
            },
          ),
        ]),
      ),
    error =>
      error.code ===
      "PASSIVE_CAPTURE_EXACT_APPROVAL_REQUIRED",
  );
});

test("FES 05A call initiation does not prove connection", () => {
  const item =
    createPassiveCaptureObservation(
      observation(
        "CALL_INITIATED",
        1,
        {
          flow_reference:
            "flow-call-001",
          call_reference:
            "call-001",
          handoff_reference:
            "handoff-call-001",
        },
      ),
    );

  assert.equal(
    item.claim_scope,
    "CALL_HANDOFF_ONLY",
  );
  assert.equal(
    item.result_confirmed,
    false,
  );
});

test("FES 05A detects unresolved call handoff", () => {
  const result =
    createPassiveCaptureSequence(
      sequence([
        observation(
          "CALL_INITIATED",
          1,
          {
            flow_reference:
              "flow-call-001",
            call_reference:
              "call-001",
            handoff_reference:
              "handoff-call-001",
          },
        ),
      ]),
    );

  assert.equal(
    result.unresolved_handoffs[0]
      .expected_confirmation,
    "CALL_RESULT_CONFIRMATION",
  );
});

test("FES 05A rejects call result without initiation", () => {
  assert.throws(
    () =>
      createPassiveCaptureSequence(
        sequence([
          observation(
            "CALL_CONNECTED_CONFIRMED",
            1,
            {
              flow_reference:
                "flow-call-001",
              call_reference:
                "call-001",
              confirmation_reference:
                "call-confirmation-001",
            },
          ),
        ]),
      ),
    error =>
      error.code ===
      "PASSIVE_CAPTURE_SEQUENCE_PREDECESSOR_MISSING",
  );
});

test("FES 05A rejects mutually exclusive call outcomes", () => {
  assert.throws(
    () =>
      createPassiveCaptureSequence(
        sequence([
          observation(
            "CALL_INITIATED",
            1,
            {
              flow_reference:
                "flow-call-001",
              call_reference:
                "call-001",
              handoff_reference:
                "handoff-call-001",
            },
          ),
          observation(
            "CALL_CONNECTED_CONFIRMED",
            2,
            {
              flow_reference:
                "flow-call-001",
              call_reference:
                "call-001",
              confirmation_reference:
                "connected-001",
            },
          ),
          observation(
            "CALL_NOT_ANSWERED_CONFIRMED",
            3,
            {
              flow_reference:
                "flow-call-001",
              call_reference:
                "call-001",
              confirmation_reference:
                "not-answered-001",
            },
          ),
        ]),
      ),
    error =>
      error.code ===
      "PASSIVE_CAPTURE_MUTUALLY_EXCLUSIVE_RESULTS",
  );
});

test("FES 05A calendar template opening does not prove appointment", () => {
  const item =
    createPassiveCaptureObservation(
      observation(
        "CALENDAR_TEMPLATE_OPENED",
        1,
        {
          flow_reference:
            "flow-calendar-001",
          appointment_reference:
            "appointment-001",
          handoff_reference:
            "calendar-handoff-001",
          starts_at:
            "2026-07-27T16:00:00.000Z",
          ends_at:
            "2026-07-27T17:00:00.000Z",
        },
      ),
    );

  assert.equal(
    item.canonical_candidate.state,
    "BRIDGE_EVIDENCE_ONLY",
  );
  assert.equal(
    item.external_action_performed,
    false,
  );
});

test("FES 05A externally confirmed appointment is FES 01 compatible", () => {
  const item =
    createPassiveCaptureObservation(
      observation(
        "APPOINTMENT_SCHEDULED",
        1,
        {
          flow_reference:
            "flow-calendar-001",
          appointment_reference:
            "appointment-001",
          starts_at:
            "2026-07-27T16:00:00.000Z",
          ends_at:
            "2026-07-27T17:00:00.000Z",
          provider_reference:
            "google-event-001",
        },
      ),
    );

  assert.equal(
    item.canonical_candidate.state,
    "SUPPORTED_BY_FES01",
  );
  assert.equal(
    item.external_action_performed,
    true,
  );
});

test("FES 05A detects unresolved calendar handoff", () => {
  const result =
    createPassiveCaptureSequence(
      sequence([
        observation(
          "CALENDAR_TEMPLATE_OPENED",
          1,
          {
            flow_reference:
              "flow-calendar-001",
            appointment_reference:
              "appointment-001",
            handoff_reference:
              "calendar-handoff-001",
          },
        ),
      ]),
    );

  assert.equal(
    result.unresolved_handoffs[0]
      .expected_confirmation,
    "APPOINTMENT_SCHEDULED",
  );
});

test("FES 05A requires appointment before outcome", () => {
  assert.throws(
    () =>
      createPassiveCaptureSequence(
        sequence([
          observation(
            "APPOINTMENT_HELD",
            1,
            {
              flow_reference:
                "flow-calendar-001",
              appointment_reference:
                "appointment-001",
              confirmation_reference:
                "held-confirmation-001",
            },
          ),
        ]),
      ),
    error =>
      error.code ===
      "PASSIVE_CAPTURE_SEQUENCE_PREDECESSOR_MISSING",
  );
});

test("FES 05A preserves quote preparation and review distinction", () => {
  const flowReference =
    "flow-quote-001";
  const result =
    createPassiveCaptureSequence(
      sequence([
        observation(
          "QUOTE_STARTED",
          1,
          {
            flow_reference:
              flowReference,
            quote_reference:
              "quote-001",
          },
        ),
        observation(
          "QUOTE_PREPARED",
          2,
          {
            flow_reference:
              flowReference,
            quote_reference:
              "quote-001",
            artifact_reference:
              "quote-artifact-001",
          },
        ),
        observation(
          "QUOTE_REVIEWED",
          3,
          {
            flow_reference:
              flowReference,
            quote_reference:
              "quote-001",
            artifact_reference:
              "quote-artifact-001",
            approval_reference:
              "quote-review-001",
          },
        ),
      ]),
    );

  assert.equal(
    result.counts_by_stage
      .PREPARATION,
    1,
  );
  assert.equal(
    result.counts_by_stage.REVIEW,
    1,
  );
  assert.equal(
    result.observations[1]
      .external_action_performed,
    false,
  );
});

test("FES 05A proposal request requires review or presentation", () => {
  assert.throws(
    () =>
      createPassiveCaptureSequence(
        sequence([
          observation(
            "PROPOSAL_REQUESTED_CONFIRMED",
            1,
            {
              flow_reference:
                "flow-quote-001",
              proposal_reference:
                "proposal-001",
              confirmation_reference:
                "proposal-confirmation-001",
            },
          ),
        ]),
      ),
    error =>
      error.code ===
      "PASSIVE_CAPTURE_SEQUENCE_PREDECESSOR_MISSING",
  );
});

test("FES 05A pipeline request does not equal confirmed movement", () => {
  const requested =
    createPassiveCaptureObservation(
      observation(
        "PIPELINE_STAGE_CHANGE_REQUESTED",
        1,
        {
          flow_reference:
            "flow-stage-001",
          stage_change_reference:
            "stage-change-001",
          stage_from:
            "contacted",
          stage_to:
            "appointment_scheduled",
        },
      ),
    );

  assert.equal(
    requested.stage,
    "STATE_REQUEST",
  );
  assert.equal(
    requested.external_action_performed,
    false,
  );
  assert.equal(
    requested.canonical_candidate.state,
    "SOURCE_TRUTH_REQUIRED",
  );
});

test("FES 05A pipeline confirmation requires request", () => {
  assert.throws(
    () =>
      createPassiveCaptureSequence(
        sequence([
          observation(
            "PIPELINE_STAGE_CHANGE_CONFIRMED",
            1,
            {
              flow_reference:
                "flow-stage-001",
              stage_change_reference:
                "stage-change-001",
              stage_from:
                "contacted",
              stage_to:
                "appointment_scheduled",
              confirmation_reference:
                "stage-confirmation-001",
            },
          ),
        ]),
      ),
    error =>
      error.code ===
      "PASSIVE_CAPTURE_SEQUENCE_PREDECESSOR_MISSING",
  );
});

test("FES 05A marks unsupported canonical event types for FES 05B", () => {
  const item =
    createPassiveCaptureObservation(
      whatsappFlow()[0],
    );

  assert.equal(
    item.canonical_candidate.state,
    "REQUIRES_FES05B_EVENT_EXTENSION",
  );
});

test("FES 05A sequence counts candidate states", () => {
  const result =
    createPassiveCaptureSequence(
      sequence([
        ...whatsappFlow(),
        observation(
          "CALENDAR_TEMPLATE_OPENED",
          10,
          {
            flow_reference:
              "flow-calendar-001",
            appointment_reference:
              "appointment-001",
            handoff_reference:
              "calendar-handoff-001",
          },
          {
            prospect_id:
              "prospect-002",
          },
        ),
        observation(
          "APPOINTMENT_SCHEDULED",
          11,
          {
            flow_reference:
              "flow-calendar-001",
            appointment_reference:
              "appointment-001",
            starts_at:
              "2026-07-27T16:00:00.000Z",
            ends_at:
              "2026-07-27T17:00:00.000Z",
            provider_reference:
              "google-event-001",
          },
          {
            prospect_id:
              "prospect-002",
          },
        ),
      ]),
    );

  assert.equal(
    result
      .canonical_candidate_counts
      .SUPPORTED_BY_FES01,
    1,
  );
  assert.equal(
    result
      .canonical_candidate_counts
      .BRIDGE_EVIDENCE_ONLY,
    1,
  );
  assert.equal(
    result
      .canonical_candidate_counts
      .REQUIRES_FES05B_EVENT_EXTENSION,
    6,
  );
});

test("FES 05A rejects mixed tenants", () => {
  assert.throws(
    () =>
      createPassiveCaptureSequence(
        sequence([
          whatsappFlow()[0],
          observation(
            "MESSAGE_DRAFT_GENERATED",
            2,
            {
              flow_reference:
                "flow-foreign",
              artifact_reference:
                "draft-foreign",
              generation_mode:
                "SAFE",
            },
            {
              tenant_id:
                "tenant-foreign",
            },
          ),
        ]),
      ),
    error =>
      error.code ===
      "PASSIVE_CAPTURE_SEQUENCE_TENANT_MISMATCH",
  );
});

test("FES 05A rejects duplicate observations", () => {
  const item = whatsappFlow()[0];

  assert.throws(
    () =>
      createPassiveCaptureSequence(
        sequence([
          item,
          JSON.parse(
            JSON.stringify(item),
          ),
        ]),
      ),
    error =>
      error.code ===
      "PASSIVE_CAPTURE_SEQUENCE_DUPLICATE",
  );
});

test("FES 05A ordering is deterministic", () => {
  const flow = whatsappFlow();
  const left =
    createPassiveCaptureSequence(
      sequence(flow),
    );
  const right =
    createPassiveCaptureSequence(
      sequence([...flow].reverse()),
    );

  assert.deepEqual(left, right);
});

test("FES 05A validates and rebuilds byte-equivalent sequence", () => {
  const source =
    sequence(whatsappFlow());
  const value =
    createPassiveCaptureSequence(
      source,
    );
  const asserted =
    assertPassiveCaptureSequence(
      value,
      source,
    );
  const rebuilt =
    rebuildPassiveCaptureSequence({
      sequence: value,
      source,
    });

  assert.deepEqual(asserted, value);
  assert.deepEqual(rebuilt, value);
});

test("FES 05A rejects validation against different source", () => {
  const source =
    sequence(whatsappFlow());
  const value =
    createPassiveCaptureSequence(
      source,
    );
  const changed =
    sequence(whatsappFlow(), {
      sequence_reference:
        "sequence-foreign",
    });
  const report =
    validatePassiveCaptureSequence(
      value,
      changed,
    );

  assert.equal(report.valid, false);
  assert.equal(
    report.errors[0].code,
    "PASSIVE_CAPTURE_SEQUENCE_NOT_CANONICAL",
  );
});

test("FES 05A detects tampered observation boundary", () => {
  const source =
    whatsappFlow()[0];
  const value =
    createPassiveCaptureObservation(
      source,
    );
  const tampered =
    JSON.parse(JSON.stringify(value));
  tampered.external_action_performed =
    true;

  const report =
    validatePassiveCaptureObservation(
      tampered,
      source,
    );

  assert.equal(report.valid, false);
  assert.equal(
    report.errors[0].code,
    "PASSIVE_CAPTURE_OBSERVATION_NOT_CANONICAL",
  );
});

test("FES 05A rejects unsupported output fields", () => {
  const source =
    whatsappFlow()[0];
  const value =
    createPassiveCaptureObservation(
      source,
    );
  const tampered = {
    ...JSON.parse(JSON.stringify(value)),
    message_sent: true,
  };

  assert.throws(
    () =>
      assertPassiveCaptureObservation(
        tampered,
        source,
      ),
    error =>
      error.code ===
        "PASSIVE_CAPTURE_OUTPUT_FIELDS_INVALID" &&
      error.details
        .unsupported_keys
        .includes("message_sent"),
  );
});

test("FES 05A output is deeply immutable", () => {
  const value =
    createPassiveCaptureSequence(
      sequence(whatsappFlow()),
    );

  assert.equal(
    Object.isFrozen(value),
    true,
  );
  assert.equal(
    Object.isFrozen(
      value.observations,
    ),
    true,
  );
  assert.equal(
    Object.isFrozen(
      value.observations[0],
    ),
    true,
  );
  assert.throws(
    () => {
      value.observations.push({});
    },
    TypeError,
  );
});

test("FES 05A does not mutate source", () => {
  const source =
    sequence(whatsappFlow());
  const before =
    JSON.stringify(source);

  createPassiveCaptureSequence(
    source,
  );

  assert.equal(
    JSON.stringify(source),
    before,
  );
});

test("FES 05A keeps identity stable while digest follows observations", () => {
  const base =
    createPassiveCaptureSequence(
      sequence(
        whatsappFlow().slice(0, 4),
      ),
    );
  const extended =
    createPassiveCaptureSequence(
      sequence(
        whatsappFlow().slice(0, 5),
      ),
    );

  assert.equal(
    base.sequence_id,
    extended.sequence_id,
  );
  assert.notEqual(
    base.sequence_digest,
    extended.sequence_digest,
  );
});

test("FES 05A catalog remains deeply immutable", () => {
  assert.equal(
    Object.isFrozen(ACTION_CATALOG),
    true,
  );
  assert.equal(
    Object.isFrozen(
      ACTION_CATALOG
        .MESSAGE_DRAFT_GENERATED,
    ),
    true,
  );
  assert.throws(
    () => {
      ACTION_CATALOG
        .MESSAGE_DRAFT_GENERATED
        .stage = "RESULT";
    },
    TypeError,
  );
});
