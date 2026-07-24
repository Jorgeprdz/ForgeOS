"use strict";

(function prospectTimelineContractModule(root, factory) {
  const api = factory();

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  if (root) {
    root.ForgeProspectTimelineContractNFAST08 = api;
  }
})(
  typeof globalThis !== "undefined" ? globalThis : this,
  function prospectTimelineContractFactory() {
    const TIMELINE_CONTRACT_VERSION = "NFAST-08.1";

    const SYSTEM_EVENT_TYPES = Object.freeze([
      "PROSPECT_CREATED",
      "STAGE_CHANGED",
      "PROSPECT_ARCHIVED",
    ]);

    const ADVISOR_EVENT_TYPES = Object.freeze([
      "CONTACT_ATTEMPTED",
      "CONVERSATION_RECORDED",
      "APPOINTMENT_SCHEDULED",
      "APPOINTMENT_RESCHEDULED",
      "APPOINTMENT_COMPLETED",
      "OBJECTION_RECORDED",
      "FOLLOW_UP_PLANNED",
      "PROPOSAL_PRESENTED",
      "DECISION_RECORDED",
    ]);

    const ALL_EVENT_TYPES = Object.freeze([
      ...SYSTEM_EVENT_TYPES,
      ...ADVISOR_EVENT_TYPES,
    ]);

    const EVENT_PAYLOAD_KEYS = Object.freeze({
      CONTACT_ATTEMPTED: Object.freeze([
        "channel",
        "outcome",
        "direction",
      ]),
      CONVERSATION_RECORDED: Object.freeze([
        "channel",
        "outcome",
        "nextStepType",
      ]),
      APPOINTMENT_SCHEDULED: Object.freeze([
        "appointmentReference",
        "scheduledAt",
      ]),
      APPOINTMENT_RESCHEDULED: Object.freeze([
        "appointmentReference",
        "scheduledAt",
      ]),
      APPOINTMENT_COMPLETED: Object.freeze([
        "appointmentReference",
        "outcome",
      ]),
      OBJECTION_RECORDED: Object.freeze([
        "objectionCode",
        "resolutionStatus",
      ]),
      FOLLOW_UP_PLANNED: Object.freeze([
        "followUpType",
        "dueAt",
      ]),
      PROPOSAL_PRESENTED: Object.freeze([
        "productReference",
        "quoteReference",
      ]),
      DECISION_RECORDED: Object.freeze([
        "decisionCode",
        "reasonCode",
      ]),
    });

    const REQUIRED_PAYLOAD_KEYS = Object.freeze({
      CONTACT_ATTEMPTED: Object.freeze([
        "channel",
        "outcome",
      ]),
      CONVERSATION_RECORDED: Object.freeze([
        "channel",
        "outcome",
      ]),
      APPOINTMENT_SCHEDULED: Object.freeze([
        "appointmentReference",
        "scheduledAt",
      ]),
      APPOINTMENT_RESCHEDULED: Object.freeze([
        "appointmentReference",
        "scheduledAt",
      ]),
      APPOINTMENT_COMPLETED: Object.freeze([
        "appointmentReference",
        "outcome",
      ]),
      OBJECTION_RECORDED: Object.freeze([
        "objectionCode",
      ]),
      FOLLOW_UP_PLANNED: Object.freeze([
        "followUpType",
        "dueAt",
      ]),
      PROPOSAL_PRESENTED: Object.freeze([
        "productReference",
      ]),
      DECISION_RECORDED: Object.freeze([
        "decisionCode",
      ]),
    });

    const ALLOWED_INPUT_KEYS = Object.freeze([
      "eventType",
      "occurredAt",
      "sourceRecordReference",
      "payload",
      "evidenceReferences",
      "idempotencyKey",
    ]);

    const PROHIBITED_KEYS = Object.freeze([
      "advisorId",
      "advisor_id",
      "createdBy",
      "created_by",
      "rawText",
      "draftText",
      "draftCandidate",
      "conversationBrief",
      "providerRequest",
      "providerResponse",
      "prompt",
      "systemPrompt",
      "initialContext",
      "initial_context",
      "notes",
      "internalNotes",
      "beforeState",
      "before_state",
      "afterState",
      "after_state",
      "phone",
      "whatsapp",
      "email",
      "dateOfBirth",
      "date_of_birth",
      "income",
      "estimatedIncome",
      "health",
      "medicalInformation",
      "familyContext",
      "conversationHistory",
      "transcript",
    ]);

    const DATE_PAYLOAD_KEYS = Object.freeze([
      "scheduledAt",
      "dueAt",
    ]);

    const OPAQUE_PAYLOAD_KEYS = Object.freeze([
      "appointmentReference",
      "productReference",
      "quoteReference",
    ]);

    function isObject(value) {
      return Boolean(
        value &&
        typeof value === "object" &&
        !Array.isArray(value),
      );
    }

    function clone(value) {
      if (value === undefined) return undefined;
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

      for (const nested of Object.values(value)) {
        deepFreeze(nested);
      }

      return value;
    }

    function uniqueStrings(values) {
      return [
        ...new Set(
          (Array.isArray(values) ? values : [])
            .filter(
              value =>
                typeof value === "string" &&
                value.trim(),
            )
            .map(value => value.trim()),
        ),
      ];
    }

    function isIsoDate(value) {
      return Boolean(
        typeof value === "string" &&
        value.trim() &&
        !Number.isNaN(Date.parse(value)),
      );
    }

    function isOpaqueReference(value) {
      return Boolean(
        typeof value === "string" &&
        /^[A-Za-z0-9._:-]{1,160}$/.test(value.trim()),
      );
    }

    function validatePayload(eventType, payload) {
      const errors = [];
      const allowedKeys =
        EVENT_PAYLOAD_KEYS[eventType] || [];
      const requiredKeys =
        REQUIRED_PAYLOAD_KEYS[eventType] || [];

      if (!isObject(payload)) {
        return {
          errors: ["PAYLOAD_MUST_BE_A_FLAT_OBJECT"],
          normalized: null,
        };
      }

      const keys = Object.keys(payload);

      if (keys.length > 8) {
        errors.push("PAYLOAD_KEY_LIMIT_EXCEEDED");
      }

      for (const key of keys) {
        if (
          PROHIBITED_KEYS.includes(key) ||
          !allowedKeys.includes(key)
        ) {
          errors.push(`PAYLOAD_KEY_NOT_ALLOWED:${key}`);
          continue;
        }

        const value = payload[key];
        const valueType = typeof value;

        if (
          value !== null &&
          !["string", "number", "boolean"].includes(
            valueType,
          )
        ) {
          errors.push(`PAYLOAD_VALUE_NOT_SCALAR:${key}`);
          continue;
        }

        if (
          typeof value === "string" &&
          value.length > 160
        ) {
          errors.push(`PAYLOAD_VALUE_TOO_LONG:${key}`);
        }

        if (
          DATE_PAYLOAD_KEYS.includes(key) &&
          !isIsoDate(value)
        ) {
          errors.push(`PAYLOAD_DATE_INVALID:${key}`);
        }

        if (
          OPAQUE_PAYLOAD_KEYS.includes(key) &&
          !isOpaqueReference(value)
        ) {
          errors.push(
            `PAYLOAD_REFERENCE_INVALID:${key}`,
          );
        }
      }

      for (const key of requiredKeys) {
        if (
          !Object.prototype.hasOwnProperty.call(
            payload,
            key,
          ) ||
          payload[key] === null ||
          payload[key] === ""
        ) {
          errors.push(`PAYLOAD_KEY_REQUIRED:${key}`);
        }
      }

      return {
        errors,
        normalized:
          errors.length === 0 ? clone(payload) : null,
      };
    }

    function validateEvidenceReferences(value) {
      const errors = [];

      if (!Array.isArray(value)) {
        return {
          errors: [
            "EVIDENCE_REFERENCES_MUST_BE_AN_ARRAY",
          ],
          normalized: null,
        };
      }

      if (value.length > 20) {
        errors.push(
          "EVIDENCE_REFERENCE_LIMIT_EXCEEDED",
        );
      }

      const normalized = uniqueStrings(value);

      if (normalized.length !== value.length) {
        errors.push(
          "EVIDENCE_REFERENCES_MUST_BE_UNIQUE_STRINGS",
        );
      }

      for (const reference of normalized) {
        if (!isOpaqueReference(reference)) {
          errors.push(
            "EVIDENCE_REFERENCE_INVALID",
          );
        }
      }

      return {
        errors,
        normalized:
          errors.length === 0 ? normalized : null,
      };
    }

    function validateProspectTimelineEventInput(
      input = {},
    ) {
      const errors = [];

      if (!isObject(input)) {
        return deepFreeze({
          valid: false,
          contractVersion:
            TIMELINE_CONTRACT_VERSION,
          errors: [
            "TIMELINE_EVENT_INPUT_MUST_BE_AN_OBJECT",
          ],
          normalized: null,
        });
      }

      for (const key of Object.keys(input)) {
        if (
          !ALLOWED_INPUT_KEYS.includes(key) ||
          PROHIBITED_KEYS.includes(key)
        ) {
          errors.push(
            `TIMELINE_INPUT_KEY_NOT_ALLOWED:${key}`,
          );
        }
      }

      const eventType = String(
        input.eventType || "",
      ).trim();

      if (!ADVISOR_EVENT_TYPES.includes(eventType)) {
        errors.push(
          ALL_EVENT_TYPES.includes(eventType)
            ? "SYSTEM_EVENT_NOT_ADVISOR_APPENDABLE"
            : "TIMELINE_EVENT_TYPE_INVALID",
        );
      }

      const occurredAt = input.occurredAt;

      if (!isIsoDate(occurredAt)) {
        errors.push("OCCURRED_AT_INVALID");
      }

      const sourceRecordReference = String(
        input.sourceRecordReference || "",
      ).trim();

      if (
        !isOpaqueReference(sourceRecordReference)
      ) {
        errors.push(
          "SOURCE_RECORD_REFERENCE_INVALID",
        );
      }

      const idempotencyKey =
        input.idempotencyKey === undefined ||
        input.idempotencyKey === null ||
        input.idempotencyKey === ""
          ? null
          : String(input.idempotencyKey).trim();

      if (
        idempotencyKey !== null &&
        !isOpaqueReference(idempotencyKey)
      ) {
        errors.push("IDEMPOTENCY_KEY_INVALID");
      }

      const payloadValidation = validatePayload(
        eventType,
        input.payload || {},
      );
      errors.push(...payloadValidation.errors);

      const evidenceValidation =
        validateEvidenceReferences(
          input.evidenceReferences || [],
        );
      errors.push(...evidenceValidation.errors);

      return deepFreeze({
        valid: errors.length === 0,
        contractVersion:
          TIMELINE_CONTRACT_VERSION,
        errors: [...new Set(errors)],
        normalized:
          errors.length === 0
            ? {
                eventType,
                occurredAt:
                  new Date(occurredAt).toISOString(),
                sourceRecordReference,
                payload:
                  payloadValidation.normalized,
                evidenceReferences:
                  evidenceValidation.normalized,
                idempotencyKey,
              }
            : null,
      });
    }

    return deepFreeze({
      TIMELINE_CONTRACT_VERSION,
      SYSTEM_EVENT_TYPES,
      ADVISOR_EVENT_TYPES,
      ALL_EVENT_TYPES,
      EVENT_PAYLOAD_KEYS,
      REQUIRED_PAYLOAD_KEYS,
      PROHIBITED_KEYS,
      validateProspectTimelineEventInput,
      _private: {
        isObject,
        clone,
        deepFreeze,
        uniqueStrings,
        isIsoDate,
        isOpaqueReference,
        validatePayload,
        validateEvidenceReferences,
      },
    });
  },
);
