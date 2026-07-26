"use strict";

(function passiveCaptureBridgeModule(root, factory) {
  const canonicalEventContract =
    typeof module !== "undefined" && module.exports
      ? require("./canonical-activity-event-contract")
      : root.ForgeCanonicalActivityEventContractFES01;

  const api = factory(canonicalEventContract);

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  if (root) {
    root.ForgePassiveCaptureBridgeFES05A = api;
  }
})(
  typeof globalThis !== "undefined" ? globalThis : this,
  function passiveCaptureBridgeFactory(
    canonicalEventContract,
  ) {
    if (!canonicalEventContract) {
      throw new Error(
        "FES01_CANONICAL_EVENT_CONTRACT_REQUIRED",
      );
    }

    const CONTRACT_VERSION = "FES-05A.1";
    const OBSERVATION_VERSION =
      "forge.passive_capture_observation.v1";
    const SEQUENCE_VERSION =
      "forge.passive_capture_sequence.v1";

    const DOMAINS = Object.freeze([
      "WHATSAPP_NASH",
      "NASH_COMBAT",
      "CALL",
      "CALENDAR",
      "QUOTE_PRESENTATION",
      "PIPELINE_STAGE",
    ]);

    const STAGES = Object.freeze([
      "CAPTURE",
      "GENERATION",
      "EDIT",
      "APPROVAL",
      "HANDOFF",
      "EXTERNAL_CONFIRMATION",
      "RESULT",
      "CONTEXT",
      "PREPARATION",
      "REVIEW",
      "STATE_REQUEST",
      "STATE_CONFIRMATION",
    ]);

    const SOURCE_EVIDENCE = Object.freeze({
      SYSTEM_GENERATED: Object.freeze({
        evidence_strength: "UNVERIFIED",
        confirmation_state: "UNCONFIRMED",
      }),
      SYSTEM_OBSERVED: Object.freeze({
        evidence_strength: "SYSTEM_OBSERVED",
        confirmation_state: "CONFIRMED",
      }),
      EXTERNAL_HANDOFF_OBSERVED: Object.freeze({
        evidence_strength: "SYSTEM_OBSERVED",
        confirmation_state: "CONFIRMED",
      }),
      ADVISOR_REPORTED: Object.freeze({
        evidence_strength: "REPORTED",
        confirmation_state: "REPORTED",
      }),
      ADVISOR_CONFIRMED: Object.freeze({
        evidence_strength: "HUMAN_CONFIRMED",
        confirmation_state: "CONFIRMED",
      }),
      EXTERNAL_PROVIDER_CONFIRMED: Object.freeze({
        evidence_strength: "EXTERNAL_CONFIRMED",
        confirmation_state: "CONFIRMED",
      }),
    });

    const ACTION_CATALOG = deepFreeze({
      MESSAGE_DRAFT_GENERATED: {
        domain: "WHATSAPP_NASH",
        stage: "GENERATION",
        claim_scope: "ARTIFACT_GENERATED",
        channel: "NASH",
        allowed_sources: ["SYSTEM_GENERATED"],
        required_payload: [
          "flow_reference",
          "artifact_reference",
          "generation_mode",
        ],
        optional_payload: ["provider_reference"],
        candidate_event_type: "MESSAGE_DRAFT_GENERATED",
        external_action_performed: false,
        result_confirmed: false,
        approval_required_before_external_use: true,
      },
      MESSAGE_DRAFT_EDITED: {
        domain: "WHATSAPP_NASH",
        stage: "EDIT",
        claim_scope: "ARTIFACT_EDITED",
        channel: "NASH",
        allowed_sources: ["SYSTEM_OBSERVED"],
        required_payload: [
          "flow_reference",
          "artifact_reference",
          "previous_artifact_reference",
        ],
        optional_payload: [],
        candidate_event_type: "MESSAGE_DRAFT_EDITED",
        external_action_performed: false,
        result_confirmed: false,
        approval_required_before_external_use: true,
      },
      MESSAGE_DRAFT_APPROVED: {
        domain: "WHATSAPP_NASH",
        stage: "APPROVAL",
        claim_scope: "HUMAN_APPROVAL",
        channel: "NASH",
        allowed_sources: ["ADVISOR_CONFIRMED"],
        required_payload: [
          "flow_reference",
          "artifact_reference",
          "approval_reference",
        ],
        optional_payload: [],
        candidate_event_type: "MESSAGE_DRAFT_APPROVED",
        external_action_performed: false,
        result_confirmed: false,
        approval_required_before_external_use: false,
      },
      WHATSAPP_OPENED: {
        domain: "WHATSAPP_NASH",
        stage: "HANDOFF",
        claim_scope: "EXTERNAL_HANDOFF_ONLY",
        channel: "WHATSAPP",
        allowed_sources: ["EXTERNAL_HANDOFF_OBSERVED"],
        required_payload: [
          "flow_reference",
          "artifact_reference",
          "handoff_reference",
        ],
        optional_payload: [],
        candidate_event_type: "WHATSAPP_OPENED",
        external_action_performed: false,
        result_confirmed: false,
        approval_required_before_external_use: false,
      },
      MESSAGE_SENT_CONFIRMED: {
        domain: "WHATSAPP_NASH",
        stage: "EXTERNAL_CONFIRMATION",
        claim_scope: "MESSAGE_SENT",
        channel: "WHATSAPP",
        allowed_sources: [
          "ADVISOR_CONFIRMED",
          "EXTERNAL_PROVIDER_CONFIRMED",
        ],
        required_payload: [
          "flow_reference",
          "artifact_reference",
          "confirmation_reference",
        ],
        optional_payload: ["provider_reference"],
        candidate_event_type: "MESSAGE_SENT_CONFIRMED",
        external_action_performed: true,
        result_confirmed: false,
        approval_required_before_external_use: false,
      },
      PROSPECT_REPLIED_CONFIRMED: {
        domain: "WHATSAPP_NASH",
        stage: "RESULT",
        claim_scope: "PROSPECT_REPLY",
        channel: "WHATSAPP",
        allowed_sources: [
          "ADVISOR_CONFIRMED",
          "EXTERNAL_PROVIDER_CONFIRMED",
        ],
        required_payload: [
          "flow_reference",
          "result_reference",
          "confirmation_reference",
        ],
        optional_payload: ["provider_reference"],
        candidate_event_type: "PROSPECT_REPLIED_CONFIRMED",
        external_action_performed: true,
        result_confirmed: true,
        approval_required_before_external_use: false,
      },
      OBJECTION_CAPTURED: {
        domain: "NASH_COMBAT",
        stage: "CAPTURE",
        claim_scope: "OBJECTION_REPORTED",
        channel: "NASH_COMBAT",
        allowed_sources: [
          "ADVISOR_REPORTED",
          "ADVISOR_CONFIRMED",
        ],
        required_payload: [
          "flow_reference",
          "objection_reference",
        ],
        optional_payload: ["context_reference"],
        candidate_event_type: "OBJECTION_CAPTURED",
        external_action_performed: false,
        result_confirmed: false,
        approval_required_before_external_use: false,
      },
      OBJECTION_ANALYSIS_GENERATED: {
        domain: "NASH_COMBAT",
        stage: "GENERATION",
        claim_scope: "ANALYSIS_GENERATED",
        channel: "NASH_COMBAT",
        allowed_sources: ["SYSTEM_GENERATED"],
        required_payload: [
          "flow_reference",
          "objection_reference",
          "analysis_reference",
        ],
        optional_payload: ["provider_reference"],
        candidate_event_type: "OBJECTION_ANALYSIS_GENERATED",
        external_action_performed: false,
        result_confirmed: false,
        approval_required_before_external_use: true,
      },
      OBJECTION_RESPONSE_GENERATED: {
        domain: "NASH_COMBAT",
        stage: "GENERATION",
        claim_scope: "RESPONSE_GENERATED",
        channel: "NASH_COMBAT",
        allowed_sources: ["SYSTEM_GENERATED"],
        required_payload: [
          "flow_reference",
          "objection_reference",
          "response_reference",
        ],
        optional_payload: [
          "analysis_reference",
          "provider_reference",
        ],
        candidate_event_type: "OBJECTION_RESPONSE_GENERATED",
        external_action_performed: false,
        result_confirmed: false,
        approval_required_before_external_use: true,
      },
      OBJECTION_RESPONSE_EDITED: {
        domain: "NASH_COMBAT",
        stage: "EDIT",
        claim_scope: "RESPONSE_EDITED",
        channel: "NASH_COMBAT",
        allowed_sources: ["SYSTEM_OBSERVED"],
        required_payload: [
          "flow_reference",
          "response_reference",
          "previous_artifact_reference",
        ],
        optional_payload: [],
        candidate_event_type: "OBJECTION_RESPONSE_EDITED",
        external_action_performed: false,
        result_confirmed: false,
        approval_required_before_external_use: true,
      },
      OBJECTION_RESPONSE_APPROVED: {
        domain: "NASH_COMBAT",
        stage: "APPROVAL",
        claim_scope: "HUMAN_APPROVAL",
        channel: "NASH_COMBAT",
        allowed_sources: ["ADVISOR_CONFIRMED"],
        required_payload: [
          "flow_reference",
          "response_reference",
          "approval_reference",
        ],
        optional_payload: [],
        candidate_event_type: "OBJECTION_RESPONSE_APPROVED",
        external_action_performed: false,
        result_confirmed: false,
        approval_required_before_external_use: false,
      },
      OBJECTION_RESPONSE_USED: {
        domain: "NASH_COMBAT",
        stage: "EXTERNAL_CONFIRMATION",
        claim_scope: "RESPONSE_USED",
        channel: "NASH_COMBAT",
        allowed_sources: ["ADVISOR_CONFIRMED"],
        required_payload: [
          "flow_reference",
          "response_reference",
          "confirmation_reference",
        ],
        optional_payload: [],
        candidate_event_type: "OBJECTION_RESPONSE_USED",
        external_action_performed: true,
        result_confirmed: false,
        approval_required_before_external_use: false,
      },
      OBJECTION_OUTCOME_CONFIRMED: {
        domain: "NASH_COMBAT",
        stage: "RESULT",
        claim_scope: "OBJECTION_OUTCOME",
        channel: "NASH_COMBAT",
        allowed_sources: ["ADVISOR_CONFIRMED"],
        required_payload: [
          "flow_reference",
          "outcome_reference",
          "confirmation_reference",
        ],
        optional_payload: ["reason_code"],
        candidate_event_type: "OBJECTION_OUTCOME_CONFIRMED",
        external_action_performed: true,
        result_confirmed: true,
        approval_required_before_external_use: false,
      },
      CALL_INITIATED: {
        domain: "CALL",
        stage: "HANDOFF",
        claim_scope: "CALL_HANDOFF_ONLY",
        channel: "PHONE",
        allowed_sources: ["EXTERNAL_HANDOFF_OBSERVED"],
        required_payload: [
          "flow_reference",
          "call_reference",
          "handoff_reference",
        ],
        optional_payload: [],
        candidate_event_type: "CALL_INITIATED",
        external_action_performed: false,
        result_confirmed: false,
        approval_required_before_external_use: false,
      },
      CALL_CONNECTED_CONFIRMED: {
        domain: "CALL",
        stage: "RESULT",
        claim_scope: "CALL_CONNECTED",
        channel: "PHONE",
        allowed_sources: [
          "ADVISOR_CONFIRMED",
          "EXTERNAL_PROVIDER_CONFIRMED",
        ],
        required_payload: [
          "flow_reference",
          "call_reference",
          "confirmation_reference",
        ],
        optional_payload: ["provider_reference"],
        candidate_event_type: "CALL_CONNECTED_CONFIRMED",
        external_action_performed: true,
        result_confirmed: true,
        approval_required_before_external_use: false,
      },
      CALL_NOT_ANSWERED_CONFIRMED: {
        domain: "CALL",
        stage: "RESULT",
        claim_scope: "CALL_NOT_ANSWERED",
        channel: "PHONE",
        allowed_sources: [
          "ADVISOR_CONFIRMED",
          "EXTERNAL_PROVIDER_CONFIRMED",
        ],
        required_payload: [
          "flow_reference",
          "call_reference",
          "confirmation_reference",
        ],
        optional_payload: ["provider_reference"],
        candidate_event_type: "CALL_NOT_ANSWERED_CONFIRMED",
        external_action_performed: true,
        result_confirmed: true,
        approval_required_before_external_use: false,
      },
      CALL_CONTEXT_ADDED: {
        domain: "CALL",
        stage: "CONTEXT",
        claim_scope: "CALL_CONTEXT_REPORTED",
        channel: "PHONE",
        allowed_sources: ["ADVISOR_REPORTED"],
        required_payload: [
          "flow_reference",
          "call_reference",
          "context_reference",
        ],
        optional_payload: ["capture_mode"],
        candidate_event_type: "CALL_CONTEXT_ADDED",
        external_action_performed: false,
        result_confirmed: false,
        approval_required_before_external_use: false,
      },
      CALENDAR_TEMPLATE_OPENED: {
        domain: "CALENDAR",
        stage: "HANDOFF",
        claim_scope: "CALENDAR_HANDOFF_ONLY",
        channel: "GOOGLE_CALENDAR",
        allowed_sources: ["EXTERNAL_HANDOFF_OBSERVED"],
        required_payload: [
          "flow_reference",
          "appointment_reference",
          "handoff_reference",
        ],
        optional_payload: [
          "starts_at",
          "ends_at",
        ],
        candidate_event_type: null,
        external_action_performed: false,
        result_confirmed: false,
        approval_required_before_external_use: false,
      },
      APPOINTMENT_SCHEDULED: {
        domain: "CALENDAR",
        stage: "EXTERNAL_CONFIRMATION",
        claim_scope: "APPOINTMENT_CREATED",
        channel: "GOOGLE_CALENDAR",
        allowed_sources: [
          "EXTERNAL_PROVIDER_CONFIRMED",
          "ADVISOR_CONFIRMED",
        ],
        required_payload: [
          "flow_reference",
          "appointment_reference",
          "starts_at",
          "ends_at",
          "provider_reference",
        ],
        optional_payload: [],
        candidate_event_type: "APPOINTMENT_SCHEDULED",
        external_action_performed: true,
        result_confirmed: false,
        approval_required_before_external_use: false,
      },
      APPOINTMENT_NOT_HELD: {
        domain: "CALENDAR",
        stage: "RESULT",
        claim_scope: "APPOINTMENT_NOT_HELD",
        channel: "GOOGLE_CALENDAR",
        allowed_sources: ["ADVISOR_CONFIRMED"],
        required_payload: [
          "flow_reference",
          "appointment_reference",
          "confirmation_reference",
          "reason_code",
        ],
        optional_payload: ["outcome_confirmed_at"],
        candidate_event_type: "APPOINTMENT_NOT_HELD",
        external_action_performed: true,
        result_confirmed: true,
        approval_required_before_external_use: false,
      },
      APPOINTMENT_RESCHEDULED: {
        domain: "CALENDAR",
        stage: "EXTERNAL_CONFIRMATION",
        claim_scope: "APPOINTMENT_RESCHEDULED",
        channel: "GOOGLE_CALENDAR",
        allowed_sources: [
          "ADVISOR_CONFIRMED",
          "EXTERNAL_PROVIDER_CONFIRMED",
        ],
        required_payload: [
          "flow_reference",
          "appointment_reference",
          "previous_starts_at",
          "starts_at",
          "ends_at",
        ],
        optional_payload: ["provider_reference"],
        candidate_event_type: "APPOINTMENT_RESCHEDULED",
        external_action_performed: true,
        result_confirmed: false,
        approval_required_before_external_use: false,
      },
      APPOINTMENT_NO_SHOW: {
        domain: "CALENDAR",
        stage: "RESULT",
        claim_scope: "APPOINTMENT_NO_SHOW",
        channel: "GOOGLE_CALENDAR",
        allowed_sources: ["ADVISOR_CONFIRMED"],
        required_payload: [
          "flow_reference",
          "appointment_reference",
          "confirmation_reference",
          "party",
        ],
        optional_payload: ["outcome_confirmed_at"],
        candidate_event_type: "APPOINTMENT_NO_SHOW",
        external_action_performed: true,
        result_confirmed: true,
        approval_required_before_external_use: false,
      },
      APPOINTMENT_HELD: {
        domain: "CALENDAR",
        stage: "RESULT",
        claim_scope: "APPOINTMENT_HELD",
        channel: "GOOGLE_CALENDAR",
        allowed_sources: ["ADVISOR_CONFIRMED"],
        required_payload: [
          "flow_reference",
          "appointment_reference",
          "confirmation_reference",
        ],
        optional_payload: ["outcome_confirmed_at"],
        candidate_event_type: "APPOINTMENT_HELD",
        external_action_performed: true,
        result_confirmed: true,
        approval_required_before_external_use: false,
      },
      QUOTE_STARTED: {
        domain: "QUOTE_PRESENTATION",
        stage: "HANDOFF",
        claim_scope: "QUOTE_WORKSPACE_OPENED",
        channel: "QUOTE",
        allowed_sources: ["SYSTEM_OBSERVED"],
        required_payload: [
          "flow_reference",
          "quote_reference",
        ],
        optional_payload: ["handoff_reference"],
        candidate_event_type: "QUOTE_STARTED",
        external_action_performed: false,
        result_confirmed: false,
        approval_required_before_external_use: false,
      },
      QUOTE_PREPARED: {
        domain: "QUOTE_PRESENTATION",
        stage: "PREPARATION",
        claim_scope: "QUOTE_PREPARED",
        channel: "QUOTE",
        allowed_sources: ["SYSTEM_OBSERVED"],
        required_payload: [
          "flow_reference",
          "quote_reference",
          "artifact_reference",
        ],
        optional_payload: [],
        candidate_event_type: "QUOTE_PREPARED",
        external_action_performed: false,
        result_confirmed: false,
        approval_required_before_external_use: true,
      },
      QUOTE_REVIEWED: {
        domain: "QUOTE_PRESENTATION",
        stage: "REVIEW",
        claim_scope: "QUOTE_REVIEWED",
        channel: "QUOTE",
        allowed_sources: ["ADVISOR_CONFIRMED"],
        required_payload: [
          "flow_reference",
          "quote_reference",
          "artifact_reference",
          "approval_reference",
        ],
        optional_payload: [],
        candidate_event_type: "QUOTE_REVIEWED",
        external_action_performed: false,
        result_confirmed: false,
        approval_required_before_external_use: false,
      },
      PRESENTATION_HELD_CONFIRMED: {
        domain: "QUOTE_PRESENTATION",
        stage: "RESULT",
        claim_scope: "PRESENTATION_HELD",
        channel: "PRESENTATION",
        allowed_sources: ["ADVISOR_CONFIRMED"],
        required_payload: [
          "flow_reference",
          "presentation_reference",
          "confirmation_reference",
        ],
        optional_payload: ["quote_reference"],
        candidate_event_type: "PRESENTATION_HELD_CONFIRMED",
        external_action_performed: true,
        result_confirmed: true,
        approval_required_before_external_use: false,
      },
      PRODUCT_QUESTION_CAPTURED: {
        domain: "QUOTE_PRESENTATION",
        stage: "CAPTURE",
        claim_scope: "PRODUCT_QUESTION_REPORTED",
        channel: "PRESENTATION",
        allowed_sources: [
          "ADVISOR_REPORTED",
          "ADVISOR_CONFIRMED",
        ],
        required_payload: [
          "flow_reference",
          "question_reference",
        ],
        optional_payload: [
          "presentation_reference",
          "quote_reference",
        ],
        candidate_event_type: "PRODUCT_QUESTION_CAPTURED",
        external_action_performed: false,
        result_confirmed: false,
        approval_required_before_external_use: false,
      },
      PROPOSAL_REQUESTED_CONFIRMED: {
        domain: "QUOTE_PRESENTATION",
        stage: "RESULT",
        claim_scope: "PROPOSAL_REQUESTED",
        channel: "PRESENTATION",
        allowed_sources: ["ADVISOR_CONFIRMED"],
        required_payload: [
          "flow_reference",
          "proposal_reference",
          "confirmation_reference",
        ],
        optional_payload: [
          "presentation_reference",
          "quote_reference",
        ],
        candidate_event_type: "PROPOSAL_REQUESTED_CONFIRMED",
        external_action_performed: true,
        result_confirmed: true,
        approval_required_before_external_use: false,
      },
      PIPELINE_STAGE_CHANGE_REQUESTED: {
        domain: "PIPELINE_STAGE",
        stage: "STATE_REQUEST",
        claim_scope: "STAGE_CHANGE_REQUEST",
        channel: "PIPELINE",
        allowed_sources: ["SYSTEM_OBSERVED"],
        required_payload: [
          "flow_reference",
          "stage_change_reference",
          "stage_from",
          "stage_to",
        ],
        optional_payload: [],
        candidate_event_type: null,
        external_action_performed: false,
        result_confirmed: false,
        approval_required_before_external_use: false,
      },
      PIPELINE_STAGE_CHANGE_CONFIRMED: {
        domain: "PIPELINE_STAGE",
        stage: "STATE_CONFIRMATION",
        claim_scope: "STAGE_CHANGE_CONFIRMED",
        channel: "PIPELINE",
        allowed_sources: [
          "SYSTEM_OBSERVED",
          "ADVISOR_CONFIRMED",
        ],
        required_payload: [
          "flow_reference",
          "stage_change_reference",
          "stage_from",
          "stage_to",
          "confirmation_reference",
        ],
        optional_payload: [],
        candidate_event_type: null,
        external_action_performed: true,
        result_confirmed: true,
        approval_required_before_external_use: false,
      },
    });

    const ACTION_CODES = Object.freeze(
      Object.keys(ACTION_CATALOG),
    );

    const PAYLOAD_TIME_KEYS = Object.freeze([
      "starts_at",
      "ends_at",
      "previous_starts_at",
      "outcome_confirmed_at",
    ]);

    const FORBIDDEN_RAW_KEYS = Object.freeze([
      "raw",
      "raw_text",
      "text",
      "message",
      "message_text",
      "content",
      "body",
      "transcript",
      "note",
      "notes",
      "objection_text",
      "response_text",
      "question_text",
      "quote_content",
      "script_text",
    ]);

    const OBSERVATION_KEYS = Object.freeze([
      "observation_version",
      "observation_id",
      "observation_reference",
      "tenant_id",
      "actor_id",
      "prospect_id",
      "domain",
      "action_code",
      "stage",
      "claim_scope",
      "occurred_at",
      "recorded_at",
      "source",
      "evidence_strength",
      "confirmation_state",
      "payload",
      "evidence_references",
      "external_action_performed",
      "result_confirmed",
      "approval_required_before_external_use",
      "canonical_candidate",
      "boundaries",
      "observation_digest",
    ]);

    const SEQUENCE_KEYS = Object.freeze([
      "sequence_version",
      "sequence_id",
      "sequence_reference",
      "tenant_id",
      "observation_count",
      "prospect_count",
      "flow_count",
      "counts_by_domain",
      "counts_by_stage",
      "canonical_candidate_counts",
      "unresolved_handoffs",
      "observations",
      "sequence_digest",
    ]);

    class PassiveCaptureBridgeError extends TypeError {
      constructor(code, message, details = null) {
        super(message);
        this.name = "PassiveCaptureBridgeError";
        this.code = code;
        this.details = details;
      }
    }

    function error(code, message, details = null) {
      throw new PassiveCaptureBridgeError(
        code,
        message,
        details,
      );
    }

    function isPlainObject(value) {
      if (
        !value ||
        typeof value !== "object" ||
        Array.isArray(value)
      ) {
        return false;
      }

      const prototype = Object.getPrototypeOf(value);
      return (
        prototype === Object.prototype ||
        prototype === null
      );
    }

    function clone(value) {
      return JSON.parse(JSON.stringify(value));
    }

    function deepFreeze(value) {
      if (
        !value ||
        typeof value !== "object" ||
        Object.isFrozen(value)
      ) {
        return value;
      }

      Object.freeze(value);
      Object.values(value).forEach(deepFreeze);
      return value;
    }

    function stableValue(value) {
      if (Array.isArray(value)) {
        return value.map(stableValue);
      }

      if (isPlainObject(value)) {
        const result = {};

        for (const key of Object.keys(value).sort()) {
          result[key] = stableValue(value[key]);
        }

        return result;
      }

      return value;
    }

    function stableStringify(value) {
      return JSON.stringify(stableValue(value));
    }

    function fnv1a32(text, seed) {
      let hash = seed >>> 0;

      for (
        let index = 0;
        index < text.length;
        index += 1
      ) {
        hash ^= text.charCodeAt(index);
        hash = Math.imul(hash, 16777619);
      }

      return (hash >>> 0)
        .toString(16)
        .padStart(8, "0");
    }

    function stableDigest(value) {
      const text =
        typeof value === "string"
          ? value
          : stableStringify(value);
      const seeds = [
        2166136261,
        2166136261 ^ 0x9e3779b9,
        2166136261 ^ 0x85ebca6b,
        2166136261 ^ 0xc2b2ae35,
      ];

      return seeds
        .map(seed => fnv1a32(text, seed))
        .join("");
    }

    function assertPlainObject(value, code, label) {
      if (!isPlainObject(value)) {
        error(code, `${label} debe ser un objeto.`);
      }
    }

    function assertAllowedKeys(
      value,
      allowed,
      code,
      label,
    ) {
      assertPlainObject(value, code, label);

      const unsupported = Object.keys(value)
        .filter(key => !allowed.includes(key))
        .sort();

      if (unsupported.length > 0) {
        error(
          code,
          `${label} contiene campos no autorizados.`,
          {
            unsupported_keys: unsupported,
          },
        );
      }
    }

    function assertRequiredKeys(
      value,
      required,
      code,
      label,
    ) {
      const missing = required
        .filter(key => value[key] === undefined)
        .sort();

      if (missing.length > 0) {
        error(
          code,
          `${label} no contiene todos los campos obligatorios.`,
          {
            missing_keys: missing,
          },
        );
      }
    }

    function requireOpaque(
      value,
      code,
      label,
      maximum = 240,
    ) {
      const normalized = String(value || "").trim();

      if (
        !normalized ||
        normalized.length > maximum ||
        !/^[A-Za-z0-9][A-Za-z0-9._:@/+ -]*$/.test(
          normalized,
        )
      ) {
        error(code, `${label} no es válido.`);
      }

      return normalized;
    }

    function requireIso(value, code, label) {
      if (
        typeof value !== "string" ||
        !value.trim() ||
        Number.isNaN(Date.parse(value))
      ) {
        error(code, `${label} no es válido.`);
      }

      return new Date(value).toISOString();
    }

    function scanForbiddenKeys(
      value,
      path = "$",
    ) {
      if (Array.isArray(value)) {
        value.forEach((item, index) =>
          scanForbiddenKeys(
            item,
            `${path}[${index}]`,
          ),
        );
        return;
      }

      if (!isPlainObject(value)) {
        return;
      }

      for (const [key, nested] of Object.entries(value)) {
        const normalized = key
          .trim()
          .toLowerCase();

        if (
          FORBIDDEN_RAW_KEYS.includes(
            normalized,
          )
        ) {
          error(
            "PASSIVE_CAPTURE_RAW_CONTENT_FORBIDDEN",
            "El bridge no acepta contenido privado crudo.",
            {
              key,
              path: `${path}.${key}`,
            },
          );
        }

        scanForbiddenKeys(
          nested,
          `${path}.${key}`,
        );
      }
    }

    function normalizeEvidenceReferences(
      input,
    ) {
      if (!Array.isArray(input)) {
        error(
          "PASSIVE_CAPTURE_EVIDENCE_REFERENCES_INVALID",
          "Las referencias de evidencia deben ser una lista.",
        );
      }

      if (
        input.length === 0 ||
        input.length > 20
      ) {
        error(
          "PASSIVE_CAPTURE_EVIDENCE_REFERENCE_COUNT_INVALID",
          "La cantidad de referencias de evidencia no es válida.",
        );
      }

      const normalized = input.map(
        (reference, index) =>
          requireOpaque(
            reference,
            "PASSIVE_CAPTURE_EVIDENCE_REFERENCE_INVALID",
            `La referencia de evidencia ${index + 1}`,
          ),
      );

      if (
        new Set(normalized).size !==
        normalized.length
      ) {
        error(
          "PASSIVE_CAPTURE_EVIDENCE_REFERENCE_DUPLICATE",
          "Las referencias de evidencia no pueden repetirse.",
        );
      }

      return normalized.sort();
    }

    function normalizePayload(
      actionCode,
      payloadInput,
    ) {
      const definition =
        ACTION_CATALOG[actionCode];

      assertAllowedKeys(
        payloadInput,
        [
          ...definition.required_payload,
          ...definition.optional_payload,
        ],
        "PASSIVE_CAPTURE_PAYLOAD_FIELDS_INVALID",
        "El payload del bridge",
      );

      assertRequiredKeys(
        payloadInput,
        definition.required_payload,
        "PASSIVE_CAPTURE_PAYLOAD_FIELDS_REQUIRED",
        "El payload del bridge",
      );

      scanForbiddenKeys(payloadInput);

      const normalized = {};

      for (
        const key of [
          ...definition.required_payload,
          ...definition.optional_payload,
        ]
      ) {
        if (
          payloadInput[key] === undefined ||
          payloadInput[key] === null ||
          payloadInput[key] === ""
        ) {
          continue;
        }

        normalized[key] =
          PAYLOAD_TIME_KEYS.includes(key)
            ? requireIso(
                payloadInput[key],
                "PASSIVE_CAPTURE_PAYLOAD_TIME_INVALID",
                `El campo ${key}`,
              )
            : requireOpaque(
                payloadInput[key],
                "PASSIVE_CAPTURE_PAYLOAD_VALUE_INVALID",
                `El campo ${key}`,
              );
      }

      return normalized;
    }

    function canonicalCandidateFor(
      actionCode,
      payload,
    ) {
      const definition =
        ACTION_CATALOG[actionCode];
      const eventType =
        definition.candidate_event_type;

      if (!eventType) {
        return {
          event_type: null,
          state:
            actionCode.startsWith(
              "PIPELINE_STAGE_",
            )
              ? "SOURCE_TRUTH_REQUIRED"
              : "BRIDGE_EVIDENCE_ONLY",
          payload_reference:
            payload.flow_reference,
        };
      }

      return {
        event_type: eventType,
        state:
          canonicalEventContract
            .EVENT_TYPES
            .includes(eventType)
            ? "SUPPORTED_BY_FES01"
            : "REQUIRES_FES05B_EVENT_EXTENSION",
        payload_reference:
          payload.flow_reference,
      };
    }

    function deriveObservationId({
      tenant_id,
      observation_reference,
    } = {}) {
      const tenantId = requireOpaque(
        tenant_id,
        "PASSIVE_CAPTURE_TENANT_INVALID",
        "El tenant",
      );
      const observationReference =
        requireOpaque(
          observation_reference,
          "PASSIVE_CAPTURE_OBSERVATION_REFERENCE_INVALID",
          "La referencia de observación",
        );

      return `capture_${stableDigest({
        tenant_id: tenantId,
        observation_reference:
          observationReference,
        observation_version:
          OBSERVATION_VERSION,
      })}`;
    }

    function buildObservation(
      input = {},
    ) {
      assertAllowedKeys(
        input,
        [
          "observation_reference",
          "tenant_id",
          "actor_id",
          "prospect_id",
          "action_code",
          "source_type",
          "occurred_at",
          "recorded_at",
          "payload",
          "evidence_references",
        ],
        "PASSIVE_CAPTURE_FIELDS_INVALID",
        "La observación del bridge",
      );

      assertRequiredKeys(
        input,
        [
          "observation_reference",
          "tenant_id",
          "actor_id",
          "prospect_id",
          "action_code",
          "source_type",
          "occurred_at",
          "recorded_at",
          "payload",
          "evidence_references",
        ],
        "PASSIVE_CAPTURE_FIELDS_REQUIRED",
        "La observación del bridge",
      );

      scanForbiddenKeys(input);

      const actionCode = String(
        input.action_code || "",
      ).trim();
      const definition =
        ACTION_CATALOG[actionCode];

      if (!definition) {
        error(
          "PASSIVE_CAPTURE_ACTION_INVALID",
          "La acción del bridge no es válida.",
          {
            action_code: actionCode,
          },
        );
      }

      const sourceType = String(
        input.source_type || "",
      ).trim();

      if (
        !definition.allowed_sources.includes(
          sourceType,
        )
      ) {
        error(
          "PASSIVE_CAPTURE_SOURCE_MISMATCH",
          "La fuente no sostiene la afirmación de esta acción.",
          {
            action_code: actionCode,
            source_type: sourceType,
            allowed_sources: [
              ...definition.allowed_sources,
            ],
          },
        );
      }

      const evidence =
        SOURCE_EVIDENCE[sourceType];

      if (!evidence) {
        error(
          "PASSIVE_CAPTURE_SOURCE_INVALID",
          "La fuente del bridge no es válida.",
        );
      }

      const observationReference =
        requireOpaque(
          input.observation_reference,
          "PASSIVE_CAPTURE_OBSERVATION_REFERENCE_INVALID",
          "La referencia de observación",
        );
      const tenantId = requireOpaque(
        input.tenant_id,
        "PASSIVE_CAPTURE_TENANT_INVALID",
        "El tenant",
      );
      const actorId = requireOpaque(
        input.actor_id,
        "PASSIVE_CAPTURE_ACTOR_INVALID",
        "El actor",
      );
      const prospectId = requireOpaque(
        input.prospect_id,
        "PASSIVE_CAPTURE_PROSPECT_INVALID",
        "El prospecto",
      );
      const occurredAt = requireIso(
        input.occurred_at,
        "PASSIVE_CAPTURE_OCCURRED_AT_INVALID",
        "La fecha de ocurrencia",
      );
      const recordedAt = requireIso(
        input.recorded_at,
        "PASSIVE_CAPTURE_RECORDED_AT_INVALID",
        "La fecha de registro",
      );
      const payload = normalizePayload(
        actionCode,
        input.payload,
      );
      const evidenceReferences =
        normalizeEvidenceReferences(
          input.evidence_references,
        );
      const observationId =
        deriveObservationId({
          tenant_id: tenantId,
          observation_reference:
            observationReference,
        });
      const candidate =
        canonicalCandidateFor(
          actionCode,
          payload,
        );

      const digestInput = {
        observation_version:
          OBSERVATION_VERSION,
        observation_id: observationId,
        observation_reference:
          observationReference,
        tenant_id: tenantId,
        actor_id: actorId,
        prospect_id: prospectId,
        domain: definition.domain,
        action_code: actionCode,
        stage: definition.stage,
        claim_scope:
          definition.claim_scope,
        occurred_at: occurredAt,
        recorded_at: recordedAt,
        source: {
          type: sourceType,
          reference:
            observationReference,
          channel: definition.channel,
        },
        evidence_strength:
          evidence.evidence_strength,
        confirmation_state:
          evidence.confirmation_state,
        payload,
        evidence_references:
          evidenceReferences,
        external_action_performed:
          definition
            .external_action_performed,
        result_confirmed:
          definition.result_confirmed,
        approval_required_before_external_use:
          definition
            .approval_required_before_external_use,
        canonical_candidate: candidate,
        boundaries: {
          generation_is_approval: false,
          edit_is_approval: false,
          approval_is_external_action: false,
          handoff_is_external_confirmation:
            false,
          external_confirmation_is_result:
            definition.stage ===
              "EXTERNAL_CONFIRMATION"
              ? false
              : null,
          recommendation_is_execution:
            false,
        },
      };

      return {
        ...digestInput,
        observation_digest:
          stableDigest(digestInput),
      };
    }

    function compareObservations(
      left,
      right,
    ) {
      return (
        left.occurred_at.localeCompare(
          right.occurred_at,
        ) ||
        left.recorded_at.localeCompare(
          right.recorded_at,
        ) ||
        left.observation_id.localeCompare(
          right.observation_id,
        )
      );
    }

    function hasEarlier(
      flow,
      actions,
      index,
    ) {
      return flow
        .slice(0, index)
        .some(observation =>
          actions.includes(
            observation.action_code,
          ),
        );
    }

    function lastLifecycleAction(
      flow,
      actions,
      index,
    ) {
      const previous = flow
        .slice(0, index)
        .filter(observation =>
          actions.includes(
            observation.action_code,
          ),
        );

      return previous.length
        ? previous[previous.length - 1]
            .action_code
        : null;
    }

    function validateFlow(
      flowReference,
      observations,
    ) {
      const flow = [...observations].sort(
        compareObservations,
      );

      for (
        let index = 0;
        index < flow.length;
        index += 1
      ) {
        const action =
          flow[index].action_code;

        if (
          action ===
            "MESSAGE_DRAFT_EDITED" &&
          !hasEarlier(
            flow,
            ["MESSAGE_DRAFT_GENERATED"],
            index,
          )
        ) {
          error(
            "PASSIVE_CAPTURE_SEQUENCE_PREDECESSOR_MISSING",
            "Editar requiere un borrador generado.",
            { flow_reference: flowReference },
          );
        }

        if (
          action ===
            "MESSAGE_DRAFT_APPROVED" &&
          !hasEarlier(
            flow,
            [
              "MESSAGE_DRAFT_GENERATED",
              "MESSAGE_DRAFT_EDITED",
            ],
            index,
          )
        ) {
          error(
            "PASSIVE_CAPTURE_SEQUENCE_PREDECESSOR_MISSING",
            "Aprobar requiere un borrador.",
            { flow_reference: flowReference },
          );
        }

        if (
          action ===
            "WHATSAPP_OPENED"
        ) {
          const latest =
            lastLifecycleAction(
              flow,
              [
                "MESSAGE_DRAFT_GENERATED",
                "MESSAGE_DRAFT_EDITED",
                "MESSAGE_DRAFT_APPROVED",
              ],
              index,
            );

          if (
            latest !==
            "MESSAGE_DRAFT_APPROVED"
          ) {
            error(
              "PASSIVE_CAPTURE_EXACT_APPROVAL_REQUIRED",
              "WhatsApp requiere aprobación posterior a la última edición.",
              { flow_reference: flowReference },
            );
          }
        }

        if (
          action ===
            "MESSAGE_SENT_CONFIRMED" &&
          !hasEarlier(
            flow,
            ["WHATSAPP_OPENED"],
            index,
          )
        ) {
          error(
            "PASSIVE_CAPTURE_SEQUENCE_PREDECESSOR_MISSING",
            "El envío confirmado requiere handoff previo.",
            { flow_reference: flowReference },
          );
        }

        if (
          action ===
            "PROSPECT_REPLIED_CONFIRMED" &&
          !hasEarlier(
            flow,
            ["MESSAGE_SENT_CONFIRMED"],
            index,
          )
        ) {
          error(
            "PASSIVE_CAPTURE_SEQUENCE_PREDECESSOR_MISSING",
            "La respuesta requiere envío confirmado.",
            { flow_reference: flowReference },
          );
        }

        if (
          action ===
            "OBJECTION_ANALYSIS_GENERATED" &&
          !hasEarlier(
            flow,
            ["OBJECTION_CAPTURED"],
            index,
          )
        ) {
          error(
            "PASSIVE_CAPTURE_SEQUENCE_PREDECESSOR_MISSING",
            "El análisis requiere objeción capturada.",
            { flow_reference: flowReference },
          );
        }

        if (
          action ===
            "OBJECTION_RESPONSE_GENERATED" &&
          !hasEarlier(
            flow,
            [
              "OBJECTION_CAPTURED",
              "OBJECTION_ANALYSIS_GENERATED",
            ],
            index,
          )
        ) {
          error(
            "PASSIVE_CAPTURE_SEQUENCE_PREDECESSOR_MISSING",
            "La respuesta requiere objeción o análisis.",
            { flow_reference: flowReference },
          );
        }

        if (
          action ===
            "OBJECTION_RESPONSE_EDITED" &&
          !hasEarlier(
            flow,
            ["OBJECTION_RESPONSE_GENERATED"],
            index,
          )
        ) {
          error(
            "PASSIVE_CAPTURE_SEQUENCE_PREDECESSOR_MISSING",
            "Editar requiere respuesta generada.",
            { flow_reference: flowReference },
          );
        }

        if (
          action ===
            "OBJECTION_RESPONSE_APPROVED" &&
          !hasEarlier(
            flow,
            [
              "OBJECTION_RESPONSE_GENERATED",
              "OBJECTION_RESPONSE_EDITED",
            ],
            index,
          )
        ) {
          error(
            "PASSIVE_CAPTURE_SEQUENCE_PREDECESSOR_MISSING",
            "Aprobar requiere respuesta.",
            { flow_reference: flowReference },
          );
        }

        if (
          action ===
            "OBJECTION_RESPONSE_USED"
        ) {
          const latest =
            lastLifecycleAction(
              flow,
              [
                "OBJECTION_RESPONSE_GENERATED",
                "OBJECTION_RESPONSE_EDITED",
                "OBJECTION_RESPONSE_APPROVED",
              ],
              index,
            );

          if (
            latest !==
            "OBJECTION_RESPONSE_APPROVED"
          ) {
            error(
              "PASSIVE_CAPTURE_EXACT_APPROVAL_REQUIRED",
              "Usar una respuesta requiere aprobación posterior a la última edición.",
              { flow_reference: flowReference },
            );
          }
        }

        if (
          action ===
            "OBJECTION_OUTCOME_CONFIRMED" &&
          !hasEarlier(
            flow,
            ["OBJECTION_RESPONSE_USED"],
            index,
          )
        ) {
          error(
            "PASSIVE_CAPTURE_SEQUENCE_PREDECESSOR_MISSING",
            "El resultado requiere respuesta usada.",
            { flow_reference: flowReference },
          );
        }

        if (
          [
            "CALL_CONNECTED_CONFIRMED",
            "CALL_NOT_ANSWERED_CONFIRMED",
          ].includes(action) &&
          !hasEarlier(
            flow,
            ["CALL_INITIATED"],
            index,
          )
        ) {
          error(
            "PASSIVE_CAPTURE_SEQUENCE_PREDECESSOR_MISSING",
            "El resultado de llamada requiere inicio.",
            { flow_reference: flowReference },
          );
        }

        if (
          action ===
            "CALL_CONTEXT_ADDED" &&
          !hasEarlier(
            flow,
            [
              "CALL_CONNECTED_CONFIRMED",
              "CALL_NOT_ANSWERED_CONFIRMED",
            ],
            index,
          )
        ) {
          error(
            "PASSIVE_CAPTURE_SEQUENCE_PREDECESSOR_MISSING",
            "El contexto de llamada requiere resultado confirmado.",
            { flow_reference: flowReference },
          );
        }

        if (
          [
            "APPOINTMENT_HELD",
            "APPOINTMENT_NOT_HELD",
            "APPOINTMENT_NO_SHOW",
          ].includes(action) &&
          !hasEarlier(
            flow,
            [
              "APPOINTMENT_SCHEDULED",
              "APPOINTMENT_RESCHEDULED",
            ],
            index,
          )
        ) {
          error(
            "PASSIVE_CAPTURE_SEQUENCE_PREDECESSOR_MISSING",
            "El resultado de cita requiere cita registrada.",
            { flow_reference: flowReference },
          );
        }

        if (
          action ===
            "APPOINTMENT_RESCHEDULED" &&
          !hasEarlier(
            flow,
            [
              "APPOINTMENT_SCHEDULED",
              "APPOINTMENT_NOT_HELD",
            ],
            index,
          )
        ) {
          error(
            "PASSIVE_CAPTURE_SEQUENCE_PREDECESSOR_MISSING",
            "Reagendar requiere cita previa.",
            { flow_reference: flowReference },
          );
        }

        if (
          action ===
            "QUOTE_PREPARED" &&
          !hasEarlier(
            flow,
            ["QUOTE_STARTED"],
            index,
          )
        ) {
          error(
            "PASSIVE_CAPTURE_SEQUENCE_PREDECESSOR_MISSING",
            "Preparar cotización requiere inicio.",
            { flow_reference: flowReference },
          );
        }

        if (
          action ===
            "QUOTE_REVIEWED" &&
          !hasEarlier(
            flow,
            ["QUOTE_PREPARED"],
            index,
          )
        ) {
          error(
            "PASSIVE_CAPTURE_SEQUENCE_PREDECESSOR_MISSING",
            "Revisar cotización requiere preparación.",
            { flow_reference: flowReference },
          );
        }

        if (
          action ===
            "PROPOSAL_REQUESTED_CONFIRMED" &&
          !hasEarlier(
            flow,
            [
              "QUOTE_REVIEWED",
              "PRESENTATION_HELD_CONFIRMED",
            ],
            index,
          )
        ) {
          error(
            "PASSIVE_CAPTURE_SEQUENCE_PREDECESSOR_MISSING",
            "La solicitud requiere revisión o presentación.",
            { flow_reference: flowReference },
          );
        }

        if (
          action ===
            "PIPELINE_STAGE_CHANGE_CONFIRMED" &&
          !hasEarlier(
            flow,
            [
              "PIPELINE_STAGE_CHANGE_REQUESTED",
            ],
            index,
          )
        ) {
          error(
            "PASSIVE_CAPTURE_SEQUENCE_PREDECESSOR_MISSING",
            "Confirmar etapa requiere solicitud.",
            { flow_reference: flowReference },
          );
        }
      }

      const callResults = flow.filter(
        observation =>
          [
            "CALL_CONNECTED_CONFIRMED",
            "CALL_NOT_ANSWERED_CONFIRMED",
          ].includes(
            observation.action_code,
          ),
      );

      if (
        new Set(
          callResults.map(
            observation =>
              observation.action_code,
          ),
        ).size > 1
      ) {
        error(
          "PASSIVE_CAPTURE_MUTUALLY_EXCLUSIVE_RESULTS",
          "Una llamada no puede estar conectada y no contestada.",
          { flow_reference: flowReference },
        );
      }

      const appointmentTerminals =
        flow.filter(observation =>
          [
            "APPOINTMENT_HELD",
            "APPOINTMENT_NO_SHOW",
          ].includes(
            observation.action_code,
          ),
        );

      if (
        new Set(
          appointmentTerminals.map(
            observation =>
              observation.action_code,
          ),
        ).size > 1
      ) {
        error(
          "PASSIVE_CAPTURE_MUTUALLY_EXCLUSIVE_RESULTS",
          "Una cita no puede estar realizada y no-show.",
          { flow_reference: flowReference },
        );
      }
    }

    function unresolvedHandoffs(
      observations,
    ) {
      const byFlow = new Map();

      for (const observation of observations) {
        const flowReference =
          observation.payload
            .flow_reference;

        if (!byFlow.has(flowReference)) {
          byFlow.set(flowReference, []);
        }

        byFlow.get(flowReference).push(
          observation,
        );
      }

      const unresolved = [];

      for (
        const [flowReference, flow]
        of byFlow
      ) {
        const actions = new Set(
          flow.map(
            observation =>
              observation.action_code,
          ),
        );

        if (
          actions.has("WHATSAPP_OPENED") &&
          !actions.has(
            "MESSAGE_SENT_CONFIRMED",
          )
        ) {
          unresolved.push({
            flow_reference:
              flowReference,
            domain: "WHATSAPP_NASH",
            handoff_action:
              "WHATSAPP_OPENED",
            expected_confirmation:
              "MESSAGE_SENT_CONFIRMED",
          });
        }

        if (
          actions.has("CALL_INITIATED") &&
          !actions.has(
            "CALL_CONNECTED_CONFIRMED",
          ) &&
          !actions.has(
            "CALL_NOT_ANSWERED_CONFIRMED",
          )
        ) {
          unresolved.push({
            flow_reference:
              flowReference,
            domain: "CALL",
            handoff_action:
              "CALL_INITIATED",
            expected_confirmation:
              "CALL_RESULT_CONFIRMATION",
          });
        }

        if (
          actions.has(
            "CALENDAR_TEMPLATE_OPENED",
          ) &&
          !actions.has(
            "APPOINTMENT_SCHEDULED",
          )
        ) {
          unresolved.push({
            flow_reference:
              flowReference,
            domain: "CALENDAR",
            handoff_action:
              "CALENDAR_TEMPLATE_OPENED",
            expected_confirmation:
              "APPOINTMENT_SCHEDULED",
          });
        }
      }

      return unresolved.sort(
        (left, right) =>
          left.flow_reference.localeCompare(
            right.flow_reference,
          ) ||
          left.domain.localeCompare(
            right.domain,
          ),
      );
    }

    function deriveSequenceId({
      tenant_id,
      sequence_reference,
    } = {}) {
      const tenantId = requireOpaque(
        tenant_id,
        "PASSIVE_CAPTURE_TENANT_INVALID",
        "El tenant",
      );
      const sequenceReference =
        requireOpaque(
          sequence_reference,
          "PASSIVE_CAPTURE_SEQUENCE_REFERENCE_INVALID",
          "La referencia de secuencia",
        );

      return `capture_sequence_${stableDigest({
        tenant_id: tenantId,
        sequence_reference:
          sequenceReference,
        sequence_version:
          SEQUENCE_VERSION,
      })}`;
    }

    function buildSequence(
      input = {},
    ) {
      assertAllowedKeys(
        input,
        [
          "sequence_reference",
          "observations",
        ],
        "PASSIVE_CAPTURE_SEQUENCE_FIELDS_INVALID",
        "La secuencia del bridge",
      );

      assertRequiredKeys(
        input,
        [
          "sequence_reference",
          "observations",
        ],
        "PASSIVE_CAPTURE_SEQUENCE_FIELDS_REQUIRED",
        "La secuencia del bridge",
      );

      const sequenceReference =
        requireOpaque(
          input.sequence_reference,
          "PASSIVE_CAPTURE_SEQUENCE_REFERENCE_INVALID",
          "La referencia de secuencia",
        );

      if (
        !Array.isArray(input.observations) ||
        input.observations.length === 0
      ) {
        error(
          "PASSIVE_CAPTURE_SEQUENCE_OBSERVATIONS_REQUIRED",
          "La secuencia requiere observaciones.",
        );
      }

      if (
        input.observations.length > 1000
      ) {
        error(
          "PASSIVE_CAPTURE_SEQUENCE_LIMIT_EXCEEDED",
          "La secuencia excede el límite.",
        );
      }

      const observations =
        input.observations
          .map(observation =>
            createPassiveCaptureObservation(
              observation,
            ),
          )
          .sort(compareObservations);

      const tenants = [
        ...new Set(
          observations.map(
            observation =>
              observation.tenant_id,
          ),
        ),
      ];

      if (tenants.length !== 1) {
        error(
          "PASSIVE_CAPTURE_SEQUENCE_TENANT_MISMATCH",
          "La secuencia no puede mezclar tenants.",
          {
            tenant_ids: tenants.sort(),
          },
        );
      }

      const ids = observations.map(
        observation =>
          observation.observation_id,
      );

      if (
        new Set(ids).size !== ids.length
      ) {
        error(
          "PASSIVE_CAPTURE_SEQUENCE_DUPLICATE",
          "La secuencia contiene observaciones duplicadas.",
        );
      }

      const byFlow = new Map();

      for (const observation of observations) {
        const flowReference =
          observation.payload
            .flow_reference;

        if (!byFlow.has(flowReference)) {
          byFlow.set(flowReference, []);
        }

        byFlow.get(flowReference).push(
          observation,
        );
      }

      for (
        const [flowReference, flow]
        of byFlow
      ) {
        validateFlow(
          flowReference,
          flow,
        );
      }

      const countsByDomain =
        Object.fromEntries(
          DOMAINS.map(domain => [
            domain,
            0,
          ]),
        );
      const countsByStage =
        Object.fromEntries(
          STAGES.map(stage => [
            stage,
            0,
          ]),
        );
      const candidateCounts = {
        SUPPORTED_BY_FES01: 0,
        REQUIRES_FES05B_EVENT_EXTENSION:
          0,
        BRIDGE_EVIDENCE_ONLY: 0,
        SOURCE_TRUTH_REQUIRED: 0,
      };

      for (const observation of observations) {
        countsByDomain[
          observation.domain
        ] += 1;
        countsByStage[
          observation.stage
        ] += 1;
        candidateCounts[
          observation
            .canonical_candidate.state
        ] += 1;
      }

      const tenantId = tenants[0];
      const sequenceId =
        deriveSequenceId({
          tenant_id: tenantId,
          sequence_reference:
            sequenceReference,
        });
      const unresolved =
        unresolvedHandoffs(
          observations,
        );

      const digestInput = {
        sequence_version:
          SEQUENCE_VERSION,
        sequence_id: sequenceId,
        sequence_reference:
          sequenceReference,
        tenant_id: tenantId,
        observation_count:
          observations.length,
        prospect_count:
          new Set(
            observations.map(
              observation =>
                observation.prospect_id,
            ),
          ).size,
        flow_count: byFlow.size,
        counts_by_domain:
          countsByDomain,
        counts_by_stage:
          countsByStage,
        canonical_candidate_counts:
          candidateCounts,
        unresolved_handoffs:
          unresolved,
        observations,
      };

      return {
        ...digestInput,
        sequence_digest:
          stableDigest(digestInput),
      };
    }

    function normalizeObservation(
      input,
      source,
      {
        requireCanonicalShape = false,
      } = {},
    ) {
      assertAllowedKeys(
        input,
        OBSERVATION_KEYS,
        "PASSIVE_CAPTURE_OUTPUT_FIELDS_INVALID",
        "La observación proyectada",
      );

      assertRequiredKeys(
        input,
        OBSERVATION_KEYS,
        "PASSIVE_CAPTURE_OUTPUT_FIELDS_REQUIRED",
        "La observación proyectada",
      );

      const normalized =
        buildObservation(source);

      if (
        requireCanonicalShape &&
        stableStringify(input) !==
          stableStringify(normalized)
      ) {
        error(
          "PASSIVE_CAPTURE_OBSERVATION_NOT_CANONICAL",
          "La observación no coincide con su fuente.",
        );
      }

      return normalized;
    }

    function normalizeSequence(
      input,
      source,
      {
        requireCanonicalShape = false,
      } = {},
    ) {
      assertAllowedKeys(
        input,
        SEQUENCE_KEYS,
        "PASSIVE_CAPTURE_SEQUENCE_OUTPUT_FIELDS_INVALID",
        "La secuencia proyectada",
      );

      assertRequiredKeys(
        input,
        SEQUENCE_KEYS,
        "PASSIVE_CAPTURE_SEQUENCE_OUTPUT_FIELDS_REQUIRED",
        "La secuencia proyectada",
      );

      const normalized =
        buildSequence(source);

      if (
        requireCanonicalShape &&
        stableStringify(input) !==
          stableStringify(normalized)
      ) {
        error(
          "PASSIVE_CAPTURE_SEQUENCE_NOT_CANONICAL",
          "La secuencia no coincide con su fuente.",
        );
      }

      return normalized;
    }

    function createPassiveCaptureObservation(
      input = {},
    ) {
      return deepFreeze(
        buildObservation(clone(input)),
      );
    }

    function assertPassiveCaptureObservation(
      observation,
      source = {},
    ) {
      return deepFreeze(
        normalizeObservation(
          clone(observation),
          clone(source),
          {
            requireCanonicalShape: true,
          },
        ),
      );
    }

    function validatePassiveCaptureObservation(
      observation,
      source = {},
    ) {
      try {
        assertPassiveCaptureObservation(
          observation,
          source,
        );

        return deepFreeze({
          valid: true,
          errors: [],
        });
      } catch (caught) {
        return deepFreeze({
          valid: false,
          errors: [
            {
              code:
                caught && caught.code
                  ? caught.code
                  : "PASSIVE_CAPTURE_VALIDATION_FAILED",
              message:
                caught && caught.message
                  ? caught.message
                  : "La observación no es válida.",
              details:
                caught && caught.details
                  ? stableValue(caught.details)
                  : null,
            },
          ],
        });
      }
    }

    function createPassiveCaptureSequence(
      input = {},
    ) {
      return deepFreeze(
        buildSequence(clone(input)),
      );
    }

    function assertPassiveCaptureSequence(
      sequence,
      source = {},
    ) {
      return deepFreeze(
        normalizeSequence(
          clone(sequence),
          clone(source),
          {
            requireCanonicalShape: true,
          },
        ),
      );
    }

    function validatePassiveCaptureSequence(
      sequence,
      source = {},
    ) {
      try {
        assertPassiveCaptureSequence(
          sequence,
          source,
        );

        return deepFreeze({
          valid: true,
          errors: [],
        });
      } catch (caught) {
        return deepFreeze({
          valid: false,
          errors: [
            {
              code:
                caught && caught.code
                  ? caught.code
                  : "PASSIVE_CAPTURE_SEQUENCE_VALIDATION_FAILED",
              message:
                caught && caught.message
                  ? caught.message
                  : "La secuencia no es válida.",
              details:
                caught && caught.details
                  ? stableValue(caught.details)
                  : null,
            },
          ],
        });
      }
    }

    function rebuildPassiveCaptureSequence({
      sequence,
      source,
    } = {}) {
      assertPassiveCaptureSequence(
        sequence,
        source,
      );

      return createPassiveCaptureSequence(
        source,
      );
    }

    return deepFreeze({
      CONTRACT_VERSION,
      OBSERVATION_VERSION,
      SEQUENCE_VERSION,
      DOMAINS,
      STAGES,
      SOURCE_EVIDENCE,
      ACTION_CATALOG,
      ACTION_CODES,
      FORBIDDEN_RAW_KEYS,
      PassiveCaptureBridgeError,
      deriveObservationId,
      deriveSequenceId,
      createPassiveCaptureObservation,
      assertPassiveCaptureObservation,
      validatePassiveCaptureObservation,
      createPassiveCaptureSequence,
      assertPassiveCaptureSequence,
      validatePassiveCaptureSequence,
      rebuildPassiveCaptureSequence,
      _private: deepFreeze({
        stableStringify,
        stableDigest,
        scanForbiddenKeys,
        normalizePayload,
        canonicalCandidateFor,
        compareObservations,
        validateFlow,
        unresolvedHandoffs,
        buildObservation,
        buildSequence,
        deepFreeze,
      }),
    });
  },
);
