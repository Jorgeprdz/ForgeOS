"use strict";

(function timelineBriefProjectionModule(root, factory) {
  const api = factory();

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  if (root) {
    root.ForgeNashTimelineToConversationBriefProjectionNFAST09 = api;
  }
})(
  typeof globalThis !== "undefined" ? globalThis : this,
  function timelineBriefProjectionFactory() {
    const PROJECTION_CONTRACT_VERSION = "NFAST-09.1";
    const PROJECTION_MODE = "ON_DEMAND_DETERMINISTIC";
    const TIMELINE_CONTRACT_VERSION = "NFAST-08.1";
    const EXPECTED_PRIVACY_CLASSIFICATION =
      "ADVISOR_PRIVATE_MINIMIZED";
    const EXPECTED_RETENTION_POLICY =
      "NO_AUTOMATIC_DELETION_PENDING_POLICY";

    const PROJECTION_STATUSES = Object.freeze({
      SUCCESS: "SUCCESS",
      NO_PROJECTION: "NO_PROJECTION",
      BLOCKED_CONTEXT: "BLOCKED_CONTEXT",
      INVALID_INPUT: "INVALID_INPUT",
    });

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

    const ALLOWED_EVENT_SOURCES = Object.freeze([
      "PIPELINE",
      "ADVISOR_DECLARATION",
      "APPOINTMENT_AUTHORITY",
      "PROSPECT_DECLARATION",
      "PRODUCT_INTELLIGENCE",
      "QUOTE_AUTHORITY",
    ]);

    const EVENT_PAYLOAD_RULES = Object.freeze({
      PROSPECT_CREATED: Object.freeze({
        allowed: Object.freeze(["stage"]),
        required: Object.freeze(["stage"]),
        dates: Object.freeze([]),
      }),
      STAGE_CHANGED: Object.freeze({
        allowed: Object.freeze(["fromStage", "toStage"]),
        required: Object.freeze(["fromStage", "toStage"]),
        dates: Object.freeze([]),
      }),
      PROSPECT_ARCHIVED: Object.freeze({
        allowed: Object.freeze(["reasonCode"]),
        required: Object.freeze(["reasonCode"]),
        dates: Object.freeze([]),
      }),
      CONTACT_ATTEMPTED: Object.freeze({
        allowed: Object.freeze(["channel", "outcome", "direction"]),
        required: Object.freeze(["channel", "outcome"]),
        dates: Object.freeze([]),
      }),
      CONVERSATION_RECORDED: Object.freeze({
        allowed: Object.freeze(["channel", "outcome", "nextStepType"]),
        required: Object.freeze(["channel", "outcome"]),
        dates: Object.freeze([]),
      }),
      APPOINTMENT_SCHEDULED: Object.freeze({
        allowed: Object.freeze(["appointmentReference", "scheduledAt"]),
        required: Object.freeze(["appointmentReference", "scheduledAt"]),
        dates: Object.freeze(["scheduledAt"]),
      }),
      APPOINTMENT_RESCHEDULED: Object.freeze({
        allowed: Object.freeze(["appointmentReference", "scheduledAt"]),
        required: Object.freeze(["appointmentReference", "scheduledAt"]),
        dates: Object.freeze(["scheduledAt"]),
      }),
      APPOINTMENT_COMPLETED: Object.freeze({
        allowed: Object.freeze(["appointmentReference", "outcome"]),
        required: Object.freeze(["appointmentReference", "outcome"]),
        dates: Object.freeze([]),
      }),
      OBJECTION_RECORDED: Object.freeze({
        allowed: Object.freeze(["objectionCode", "resolutionStatus"]),
        required: Object.freeze(["objectionCode"]),
        dates: Object.freeze([]),
      }),
      FOLLOW_UP_PLANNED: Object.freeze({
        allowed: Object.freeze(["followUpType", "dueAt"]),
        required: Object.freeze(["followUpType", "dueAt"]),
        dates: Object.freeze(["dueAt"]),
      }),
      PROPOSAL_PRESENTED: Object.freeze({
        allowed: Object.freeze(["productReference", "quoteReference"]),
        required: Object.freeze(["productReference"]),
        dates: Object.freeze([]),
      }),
      DECISION_RECORDED: Object.freeze({
        allowed: Object.freeze(["decisionCode", "reasonCode"]),
        required: Object.freeze(["decisionCode"]),
        dates: Object.freeze([]),
      }),
    });

    const ALLOWED_ROOT_KEYS = Object.freeze([
      "prospectReference",
      "timelineEvents",
      "projectionMetadata",
    ]);

    const ALLOWED_METADATA_KEYS = Object.freeze([
      "asOf",
      "freshnessRules",
      "requiredEventTypes",
      "maxEvents",
    ]);

    const ALLOWED_EVENT_KEYS = Object.freeze([
      "id",
      "prospectId",
      "eventType",
      "eventSource",
      "sourceRecordReference",
      "occurredAt",
      "recordedAt",
      "payload",
      "evidenceReferences",
      "contractVersion",
      "privacyClassification",
      "retentionPolicy",
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
      "pipeline",
      "pipelineObject",
      "rawPipeline",
      "fullUniversalContext",
      "universalContext",
      "rawUniversalContext",
      "prospectAuditEvents",
      "prospect_audit_events",
    ]);

    const PROMPT_INJECTION_PATTERNS = Object.freeze([
      /ignore (all )?(previous|prior) instructions/i,
      /system prompt/i,
      /developer message/i,
      /hidden instruction/i,
      /tool[_ -]?use/i,
      /call (the )?(provider|gemini|api|tool)/i,
      /execute (this|command|action)/i,
      /send (this|message|whatsapp)/i,
      /persist (this|data|record)/i,
    ]);

    const SOURCE_OWNER_BY_EVENT_SOURCE = Object.freeze({
      PIPELINE: "PROSPECT_PIPELINE_TIMELINE",
      ADVISOR_DECLARATION: "ADVISOR_DECLARATION_TIMELINE",
      APPOINTMENT_AUTHORITY: "APPOINTMENT_AUTHORITY_TIMELINE",
      PROSPECT_DECLARATION: "PROSPECT_DECLARATION_TIMELINE",
      PRODUCT_INTELLIGENCE: "PRODUCT_INTELLIGENCE_TIMELINE",
      QUOTE_AUTHORITY: "QUOTE_AUTHORITY_TIMELINE",
    });

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

    function flatten(values) {
      if (!Array.isArray(values)) return [values];
      return values.flatMap(flatten);
    }

    function uniqueStrings(values) {
      return [
        ...new Set(
          flatten(Array.isArray(values) ? values : [values])
            .filter(
              value =>
                typeof value === "string" &&
                value.trim(),
            )
            .map(value => value.trim()),
        ),
      ];
    }

    function canonicalize(value) {
      if (Array.isArray(value)) {
        return value.map(canonicalize);
      }

      if (isObject(value)) {
        return Object.fromEntries(
          Object.keys(value)
            .sort()
            .map(key => [key, canonicalize(value[key])]),
        );
      }

      return value;
    }

    function stableStringify(value) {
      return JSON.stringify(canonicalize(value));
    }

    function stableHash(value) {
      const input = stableStringify(value);
      let first = 0x811c9dc5;
      let second = 0x9e3779b9;

      for (let index = 0; index < input.length; index += 1) {
        const code = input.charCodeAt(index);
        first = Math.imul(first ^ code, 0x01000193) >>> 0;
        second = Math.imul(second ^ code, 0x85ebca6b) >>> 0;
      }

      return [first, second]
        .map(valuePart => valuePart.toString(16).padStart(8, "0"))
        .join("");
    }

    function isIsoDate(value) {
      return Boolean(
        typeof value === "string" &&
        value.trim() &&
        !Number.isNaN(Date.parse(value)),
      );
    }

    function isOpaqueToken(value) {
      return Boolean(
        typeof value === "string" &&
        /^[A-Za-z0-9._:+-]{1,160}$/.test(value.trim()),
      );
    }

    function findProhibitedKeys(value, path = "input", findings = []) {
      if (!value || typeof value !== "object") {
        return findings;
      }

      if (Array.isArray(value)) {
        value.forEach((item, index) =>
          findProhibitedKeys(item, `${path}[${index}]`, findings),
        );
        return findings;
      }

      for (const [key, nested] of Object.entries(value)) {
        if (PROHIBITED_KEYS.includes(key)) {
          findings.push(`${path}.${key}`);
        }
        findProhibitedKeys(nested, `${path}.${key}`, findings);
      }

      return findings;
    }

    function findPromptInjection(value, path = "input", findings = []) {
      if (value === undefined || value === null) {
        return findings;
      }

      if (typeof value === "string") {
        for (const pattern of PROMPT_INJECTION_PATTERNS) {
          if (pattern.test(value)) {
            findings.push({
              path,
              indicator: pattern.source,
            });
          }
        }
        return findings;
      }

      if (Array.isArray(value)) {
        value.forEach((item, index) =>
          findPromptInjection(item, `${path}[${index}]`, findings),
        );
        return findings;
      }

      if (typeof value === "object") {
        for (const [key, nested] of Object.entries(value)) {
          findPromptInjection(nested, `${path}.${key}`, findings);
        }
      }

      return findings;
    }

    function safetyFlags() {
      return {
        contextOnly: true,
        deterministic: true,
        providerInvoked: false,
        draftGenerated: false,
        messageGenerated: false,
        actionExecuted: false,
        networkAccessed: false,
        databaseAccessed: false,
        filesystemAccessed: false,
        dataPersisted: false,
        timelineMutated: false,
        pipelineMutated: false,
        inputMutated: false,
      };
    }

    function noProjectionEnvelope(status, reasonCodes, details = {}) {
      return deepFreeze({
        engine: "NASH_TIMELINE_TO_CONVERSATION_BRIEF_PROJECTION",
        version: PROJECTION_CONTRACT_VERSION,
        status,
        decision: "NO_CONVERSATION_CONTEXT_PROJECTION",
        projection: null,
        reasonCodes: uniqueStrings(reasonCodes),
        blockedFields: uniqueStrings(details.blockedFields),
        invalidEvents: clone(details.invalidEvents || []),
        conflicts: clone(details.conflicts || []),
        missingEventTypes: uniqueStrings(details.missingEventTypes),
        promptInjectionIndicators: clone(
          details.promptInjectionIndicators || [],
        ),
        remediationHints: uniqueStrings(details.remediationHints),
        safety: safetyFlags(),
      });
    }

    function validatePayload(eventType, payload) {
      const errors = [];
      const rules = EVENT_PAYLOAD_RULES[eventType];

      if (!rules || !isObject(payload)) {
        return {
          errors: ["PAYLOAD_INVALID"],
          normalized: null,
        };
      }

      const keys = Object.keys(payload);

      if (keys.length > 8) {
        errors.push("PAYLOAD_KEY_LIMIT_EXCEEDED");
      }

      for (const key of keys) {
        if (!rules.allowed.includes(key)) {
          errors.push(`PAYLOAD_KEY_NOT_ALLOWED:${key}`);
          continue;
        }

        const value = payload[key];

        if (
          value !== null &&
          !["string", "number", "boolean"].includes(typeof value)
        ) {
          errors.push(`PAYLOAD_VALUE_NOT_SCALAR:${key}`);
          continue;
        }

        if (typeof value === "string" && value.length > 160) {
          errors.push(`PAYLOAD_VALUE_TOO_LONG:${key}`);
        }

        if (rules.dates.includes(key)) {
          if (!isIsoDate(value)) {
            errors.push(`PAYLOAD_DATE_INVALID:${key}`);
          }
        } else if (
          typeof value === "string" &&
          !isOpaqueToken(value)
        ) {
          errors.push(`PAYLOAD_TOKEN_INVALID:${key}`);
        }
      }

      for (const key of rules.required) {
        if (
          !Object.prototype.hasOwnProperty.call(payload, key) ||
          payload[key] === null ||
          payload[key] === ""
        ) {
          errors.push(`PAYLOAD_KEY_REQUIRED:${key}`);
        }
      }

      return {
        errors,
        normalized: errors.length === 0 ? clone(payload) : null,
      };
    }

    function validateEvidenceReferences(value) {
      const errors = [];

      if (!Array.isArray(value)) {
        return {
          errors: ["EVIDENCE_REFERENCES_MUST_BE_ARRAY"],
          normalized: null,
        };
      }

      if (value.length > 20) {
        errors.push("EVIDENCE_REFERENCE_LIMIT_EXCEEDED");
      }

      const normalized = uniqueStrings(value);

      if (normalized.length !== value.length) {
        errors.push("EVIDENCE_REFERENCES_MUST_BE_UNIQUE_STRINGS");
      }

      for (const reference of normalized) {
        if (!isOpaqueToken(reference)) {
          errors.push("EVIDENCE_REFERENCE_INVALID");
        }
      }

      return {
        errors,
        normalized: errors.length === 0 ? normalized : null,
      };
    }

    function validateTimelineEvent(event, index) {
      const errors = [];

      if (!isObject(event)) {
        return {
          valid: false,
          index,
          errors: ["EVENT_MUST_BE_OBJECT"],
          normalized: null,
        };
      }

      const unsupportedKeys = Object.keys(event).filter(
        key => !ALLOWED_EVENT_KEYS.includes(key),
      );

      errors.push(
        ...unsupportedKeys.map(key => `EVENT_KEY_NOT_ALLOWED:${key}`),
      );

      const prohibitedPaths = findProhibitedKeys(event, `timelineEvents[${index}]`);
      errors.push(
        ...prohibitedPaths.map(path => `PROHIBITED_FIELD:${path}`),
      );

      const promptInjectionIndicators = findPromptInjection(
        event.payload,
        `timelineEvents[${index}].payload`,
      );

      if (promptInjectionIndicators.length > 0) {
        errors.push("PROMPT_INJECTION_INDICATOR");
      }

      if (!isOpaqueToken(event.id)) {
        errors.push("EVENT_ID_INVALID");
      }

      if (!isOpaqueToken(event.prospectId)) {
        errors.push("EVENT_PROSPECT_REFERENCE_INVALID");
      }

      if (!ALL_EVENT_TYPES.includes(event.eventType)) {
        errors.push("EVENT_TYPE_INVALID");
      }

      if (!ALLOWED_EVENT_SOURCES.includes(event.eventSource)) {
        errors.push("EVENT_SOURCE_INVALID");
      }

      if (
        SYSTEM_EVENT_TYPES.includes(event.eventType) &&
        event.eventSource !== "PIPELINE"
      ) {
        errors.push("SYSTEM_EVENT_SOURCE_INVALID");
      }

      if (
        event.eventSource === "PIPELINE" &&
        ![
          ...SYSTEM_EVENT_TYPES,
          "FOLLOW_UP_PLANNED",
        ].includes(event.eventType)
      ) {
        errors.push("PIPELINE_EVENT_TYPE_INVALID");
      }

      if (!isOpaqueToken(event.sourceRecordReference)) {
        errors.push("SOURCE_RECORD_REFERENCE_INVALID");
      }

      if (!isIsoDate(event.occurredAt)) {
        errors.push("OCCURRED_AT_INVALID");
      }

      if (!isIsoDate(event.recordedAt)) {
        errors.push("RECORDED_AT_INVALID");
      }

      if (event.contractVersion !== TIMELINE_CONTRACT_VERSION) {
        errors.push("TIMELINE_CONTRACT_VERSION_INVALID");
      }

      if (
        event.privacyClassification !==
        EXPECTED_PRIVACY_CLASSIFICATION
      ) {
        errors.push("PRIVACY_CLASSIFICATION_INVALID");
      }

      if (event.retentionPolicy !== EXPECTED_RETENTION_POLICY) {
        errors.push("RETENTION_POLICY_INVALID");
      }

      const payloadValidation = validatePayload(
        event.eventType,
        event.payload,
      );
      errors.push(...payloadValidation.errors);

      const evidenceValidation = validateEvidenceReferences(
        event.evidenceReferences,
      );
      errors.push(...evidenceValidation.errors);

      return {
        valid: errors.length === 0,
        index,
        errors: [...new Set(errors)],
        promptInjectionIndicators,
        normalized:
          errors.length === 0
            ? {
                id: event.id.trim(),
                prospectId: event.prospectId.trim(),
                eventType: event.eventType,
                eventSource: event.eventSource,
                sourceRecordReference:
                  event.sourceRecordReference.trim(),
                occurredAt: new Date(event.occurredAt).toISOString(),
                recordedAt: new Date(event.recordedAt).toISOString(),
                payload: payloadValidation.normalized,
                evidenceReferences: evidenceValidation.normalized,
                contractVersion: event.contractVersion,
                privacyClassification: event.privacyClassification,
                retentionPolicy: event.retentionPolicy,
              }
            : null,
      };
    }

    function normalizeProjectionMetadata(metadata = {}) {
      const errors = [];

      if (!isObject(metadata)) {
        return {
          errors: ["PROJECTION_METADATA_MUST_BE_OBJECT"],
          normalized: null,
        };
      }

      const unsupportedKeys = Object.keys(metadata).filter(
        key => !ALLOWED_METADATA_KEYS.includes(key),
      );
      errors.push(
        ...unsupportedKeys.map(key => `METADATA_KEY_NOT_ALLOWED:${key}`),
      );

      if (!isIsoDate(metadata.asOf)) {
        errors.push("AS_OF_REQUIRED_AND_MUST_BE_ISO_DATE");
      }

      const freshnessRules = metadata.freshnessRules || {};
      if (!isObject(freshnessRules)) {
        errors.push("FRESHNESS_RULES_MUST_BE_OBJECT");
      } else {
        for (const [eventType, days] of Object.entries(freshnessRules)) {
          if (!ALL_EVENT_TYPES.includes(eventType)) {
            errors.push(`FRESHNESS_RULE_EVENT_TYPE_INVALID:${eventType}`);
          }
          if (
            !Number.isFinite(Number(days)) ||
            Number(days) < 0 ||
            Number(days) > 3650
          ) {
            errors.push(`FRESHNESS_RULE_DAYS_INVALID:${eventType}`);
          }
        }
      }

      const requiredEventTypes = metadata.requiredEventTypes || [];
      if (!Array.isArray(requiredEventTypes)) {
        errors.push("REQUIRED_EVENT_TYPES_MUST_BE_ARRAY");
      } else {
        for (const eventType of requiredEventTypes) {
          if (!ALL_EVENT_TYPES.includes(eventType)) {
            errors.push(`REQUIRED_EVENT_TYPE_INVALID:${eventType}`);
          }
        }
        if (
          uniqueStrings(requiredEventTypes).length !==
          requiredEventTypes.length
        ) {
          errors.push("REQUIRED_EVENT_TYPES_MUST_BE_UNIQUE");
        }
      }

      const maxEvents =
        metadata.maxEvents === undefined
          ? 100
          : Number(metadata.maxEvents);

      if (
        !Number.isInteger(maxEvents) ||
        maxEvents < 1 ||
        maxEvents > 100
      ) {
        errors.push("MAX_EVENTS_INVALID");
      }

      return {
        errors,
        normalized:
          errors.length === 0
            ? {
                asOf: new Date(metadata.asOf).toISOString(),
                freshnessRules: Object.fromEntries(
                  Object.entries(freshnessRules).map(
                    ([eventType, days]) => [eventType, Number(days)],
                  ),
                ),
                requiredEventTypes: uniqueStrings(requiredEventTypes),
                maxEvents,
              }
            : null,
      };
    }

    function compareEvents(left, right) {
      return (
        left.occurredAt.localeCompare(right.occurredAt) ||
        left.recordedAt.localeCompare(right.recordedAt) ||
        left.id.localeCompare(right.id)
      );
    }

    function calculateFreshness(event, metadata) {
      const days = metadata.freshnessRules[event.eventType];

      if (days === undefined) {
        return "UNKNOWN";
      }

      const ageMilliseconds =
        Date.parse(metadata.asOf) - Date.parse(event.occurredAt);
      const ageDays = ageMilliseconds / 86400000;

      return ageDays > days ? "STALE" : "CURRENT";
    }

    function sourceLead(eventSource) {
      return {
        PIPELINE: "Pipeline records",
        ADVISOR_DECLARATION: "Advisor declares",
        APPOINTMENT_AUTHORITY: "Appointment authority records",
        PROSPECT_DECLARATION: "Prospect declaration records",
        PRODUCT_INTELLIGENCE: "Product intelligence authority records",
        QUOTE_AUTHORITY: "Quote authority records",
      }[eventSource];
    }

    function claimForEvent(event) {
      const payload = event.payload;
      const lead = sourceLead(event.eventSource);

      switch (event.eventType) {
        case "PROSPECT_CREATED":
          return `${lead} prospect creation at stage ${payload.stage}.`;
        case "STAGE_CHANGED":
          return `${lead} stage transition ${payload.fromStage} -> ${payload.toStage}.`;
        case "PROSPECT_ARCHIVED":
          return `${lead} prospect archive reason ${payload.reasonCode}.`;
        case "CONTACT_ATTEMPTED":
          return `${lead} contact attempt channel=${payload.channel}; outcome=${payload.outcome}; direction=${payload.direction || "UNSPECIFIED"}.`;
        case "CONVERSATION_RECORDED":
          return `${lead} conversation channel=${payload.channel}; outcome=${payload.outcome}; nextStepType=${payload.nextStepType || "UNSPECIFIED"}.`;
        case "APPOINTMENT_SCHEDULED":
          return `${lead} appointment ${payload.appointmentReference} scheduledAt=${new Date(payload.scheduledAt).toISOString()}.`;
        case "APPOINTMENT_RESCHEDULED":
          return `${lead} appointment ${payload.appointmentReference} rescheduledAt=${new Date(payload.scheduledAt).toISOString()}.`;
        case "APPOINTMENT_COMPLETED":
          return `${lead} appointment ${payload.appointmentReference} outcome=${payload.outcome}.`;
        case "OBJECTION_RECORDED":
          return `${lead} objectionCode=${payload.objectionCode}; resolutionStatus=${payload.resolutionStatus || "UNSPECIFIED"}.`;
        case "FOLLOW_UP_PLANNED":
          return `${lead} followUpType=${payload.followUpType}; dueAt=${new Date(payload.dueAt).toISOString()}.`;
        case "PROPOSAL_PRESENTED":
          return `${lead} productReference=${payload.productReference}; quoteReference=${payload.quoteReference || "UNSPECIFIED"}.`;
        case "DECISION_RECORDED":
          return `${lead} decisionCode=${payload.decisionCode}; reasonCode=${payload.reasonCode || "UNSPECIFIED"}.`;
        default:
          return null;
      }
    }

    function evidenceIdsForEvent(event) {
      return uniqueStrings([
        `TIMELINE_EVENT:${event.id}`,
        `TIMELINE_OCCURRED_AT:${event.occurredAt}`,
        `TIMELINE_SOURCE:${event.eventSource}`,
        `TIMELINE_RECORD:${event.sourceRecordReference}`,
        `TIMELINE_CONTRACT:${event.contractVersion}`,
        event.evidenceReferences,
      ]);
    }

    function factForEvent(event, metadata) {
      const freshness = calculateFreshness(event, metadata);
      const sourceOwner =
        SOURCE_OWNER_BY_EVENT_SOURCE[event.eventSource];

      return {
        factId: `NFAST09:${event.id}`,
        claim: claimForEvent(event),
        allowedClaim: claimForEvent(event),
        sourceOwner,
        evidenceIds: evidenceIdsForEvent(event),
        freshness,
        requiredForObjective: false,
        cautiousLanguageRequired:
          event.eventSource === "ADVISOR_DECLARATION" ||
          freshness !== "CURRENT",
        eventType: event.eventType,
        eventSource: event.eventSource,
        occurredAt: event.occurredAt,
        sourceRecordReference: event.sourceRecordReference,
        timelineContractVersion: event.contractVersion,
      };
    }

    function conflictKey(event) {
      return `${event.eventType}|${event.occurredAt}`;
    }

    function projectTimelineToConversationContext(input = {}) {
      if (!isObject(input)) {
        return noProjectionEnvelope(
          PROJECTION_STATUSES.INVALID_INPUT,
          ["INPUT_NOT_OBJECT"],
          {
            remediationHints: [
              "Provide a governed NFAST-09 projection input object.",
            ],
          },
        );
      }

      const source = clone(input);
      const unsupportedRootKeys = Object.keys(source).filter(
        key => !ALLOWED_ROOT_KEYS.includes(key),
      );
      const prohibitedPaths = findProhibitedKeys(source);
      const promptInjectionIndicators = findPromptInjection(source);

      if (
        unsupportedRootKeys.length > 0 ||
        prohibitedPaths.length > 0 ||
        promptInjectionIndicators.length > 0
      ) {
        return noProjectionEnvelope(
          PROJECTION_STATUSES.BLOCKED_CONTEXT,
          [
            unsupportedRootKeys.length > 0
              ? "UNSUPPORTED_ROOT_FIELD"
              : [],
            prohibitedPaths.length > 0
              ? "PROHIBITED_RAW_CONTEXT"
              : [],
            promptInjectionIndicators.length > 0
              ? "PROMPT_INJECTION_INDICATOR"
              : [],
          ],
          {
            blockedFields: [unsupportedRootKeys, prohibitedPaths],
            promptInjectionIndicators,
            remediationHints: [
              "Use only minimized governed Timeline events and projection metadata.",
            ],
          },
        );
      }

      if (!isOpaqueToken(source.prospectReference)) {
        return noProjectionEnvelope(
          PROJECTION_STATUSES.INVALID_INPUT,
          ["PROSPECT_REFERENCE_INVALID"],
        );
      }

      const metadataValidation = normalizeProjectionMetadata(
        source.projectionMetadata,
      );

      if (metadataValidation.errors.length > 0) {
        return noProjectionEnvelope(
          PROJECTION_STATUSES.INVALID_INPUT,
          ["PROJECTION_METADATA_INVALID"],
          {
            blockedFields: metadataValidation.errors,
          },
        );
      }

      const metadata = metadataValidation.normalized;

      if (!Array.isArray(source.timelineEvents)) {
        return noProjectionEnvelope(
          PROJECTION_STATUSES.INVALID_INPUT,
          ["TIMELINE_EVENTS_MUST_BE_ARRAY"],
        );
      }

      if (source.timelineEvents.length === 0) {
        return noProjectionEnvelope(
          PROJECTION_STATUSES.NO_PROJECTION,
          ["TIMELINE_EMPTY"],
          {
            missingEventTypes: metadata.requiredEventTypes,
          },
        );
      }

      if (source.timelineEvents.length > metadata.maxEvents) {
        return noProjectionEnvelope(
          PROJECTION_STATUSES.BLOCKED_CONTEXT,
          ["TIMELINE_EVENT_LIMIT_EXCEEDED"],
        );
      }

      const validations = source.timelineEvents.map(
        (event, index) => validateTimelineEvent(event, index),
      );
      const invalidEvents = validations
        .filter(validation => !validation.valid)
        .map(validation => ({
          index: validation.index,
          errors: validation.errors,
        }));
      const nestedPromptInjectionIndicators = validations.flatMap(
        validation => validation.promptInjectionIndicators || [],
      );

      if (invalidEvents.length > 0) {
        return noProjectionEnvelope(
          PROJECTION_STATUSES.BLOCKED_CONTEXT,
          [
            "TIMELINE_EVENT_INVALID",
            nestedPromptInjectionIndicators.length > 0
              ? "PROMPT_INJECTION_INDICATOR"
              : [],
          ],
          {
            invalidEvents,
            promptInjectionIndicators:
              nestedPromptInjectionIndicators,
          },
        );
      }

      const normalizedEvents = validations.map(
        validation => validation.normalized,
      );
      const foreignProspectEvents = normalizedEvents.filter(
        event => event.prospectId !== source.prospectReference,
      );

      if (foreignProspectEvents.length > 0) {
        return noProjectionEnvelope(
          PROJECTION_STATUSES.BLOCKED_CONTEXT,
          ["CROSS_PROSPECT_EVENT_DENIED"],
          {
            invalidEvents: foreignProspectEvents.map(event => ({
              id: event.id,
              prospectId: event.prospectId,
            })),
          },
        );
      }

      const futureEvents = normalizedEvents.filter(
        event => Date.parse(event.occurredAt) > Date.parse(metadata.asOf),
      );

      if (futureEvents.length > 0) {
        return noProjectionEnvelope(
          PROJECTION_STATUSES.BLOCKED_CONTEXT,
          ["EVENT_AFTER_PROJECTION_AS_OF"],
          {
            invalidEvents: futureEvents.map(event => ({
              id: event.id,
              occurredAt: event.occurredAt,
            })),
          },
        );
      }

      const eventById = new Map();
      const deduplicatedEventIds = [];
      const duplicateConflicts = [];

      for (const event of normalizedEvents) {
        const existing = eventById.get(event.id);
        if (!existing) {
          eventById.set(event.id, event);
          continue;
        }

        if (stableStringify(existing) === stableStringify(event)) {
          deduplicatedEventIds.push(event.id);
        } else {
          duplicateConflicts.push({
            code: "CONFLICTING_DUPLICATE_EVENT_ID",
            eventId: event.id,
          });
        }
      }

      if (duplicateConflicts.length > 0) {
        return noProjectionEnvelope(
          PROJECTION_STATUSES.BLOCKED_CONTEXT,
          ["CONFLICTING_DUPLICATE_EVENT_ID"],
          {
            conflicts: duplicateConflicts,
          },
        );
      }

      const orderedEvents = [...eventById.values()].sort(compareEvents);
      const conflictGroups = new Map();

      for (const event of orderedEvents) {
        const key = conflictKey(event);
        const signatures = conflictGroups.get(key) || new Set();
        signatures.add(stableStringify(event.payload));
        conflictGroups.set(key, signatures);
      }

      const conflicts = [...conflictGroups.entries()]
        .filter(([, signatures]) => signatures.size > 1)
        .map(([key]) => ({
          code: "CONFLICTING_SAME_TIME_EVENT_DECLARATIONS",
          key,
        }));

      const facts = orderedEvents.map(event =>
        factForEvent(event, metadata),
      );
      const presentEventTypes = new Set(
        orderedEvents.map(event => event.eventType),
      );
      const missingEventTypes = metadata.requiredEventTypes.filter(
        eventType => !presentEventTypes.has(eventType),
      );
      const unknowns = uniqueStrings([
        missingEventTypes.map(
          eventType => `MISSING_EVENT_TYPE:${eventType}`,
        ),
        conflicts.map(conflict => conflict.code),
      ]);
      const sourceEvidenceIds = uniqueStrings(
        facts.map(fact => fact.evidenceIds),
      );
      const sourceOwners = uniqueStrings(
        facts.map(fact => fact.sourceOwner),
      );
      const freshness = uniqueStrings(
        facts.map(fact => fact.freshness),
      );
      const latestProposal = [...orderedEvents]
        .reverse()
        .find(event => event.eventType === "PROPOSAL_PRESENTED");
      const contextVersion = `${PROJECTION_CONTRACT_VERSION}:${stableHash({
        prospectReference: source.prospectReference,
        metadata,
        orderedEvents,
      })}`;

      const projection = {
        projectionType: "CONVERSATION_CONTEXT",
        type: "CONVERSATION_CONTEXT",
        status: "READY",
        blocked: false,
        prospectReference: source.prospectReference,
        contextVersion,
        verifiedFacts: facts,
        sourceEvidenceIds,
        evidenceReferences: sourceEvidenceIds,
        sourceOwners,
        freshness,
        unknowns,
        missingContext: missingEventTypes,
        staleContext: facts
          .filter(fact => fact.freshness === "STALE")
          .map(fact => fact.factId),
        blockedContext: [],
        conflicts,
        deduplicatedEventIds: uniqueStrings(deduplicatedEventIds),
        relationshipFraming:
          "Use only Timeline evidence; do not invent relationship context.",
        personalizationPoints: [],
        questionsToAsk: missingEventTypes.map(
          eventType =>
            `Confirm governed evidence for ${eventType} before relying on it.`,
        ),
        conversationConstraints: [
          "Do not generate final copy.",
          "Do not upgrade advisor declarations into verified external facts.",
          "Do not infer intent, consent, suitability, financial capacity, health, or family context.",
        ],
        forbiddenClaims: [
          "Unverified intent, consent, product suitability, financial capacity, health, family context, pressure, fear, guilt, or false urgency.",
        ],
        unsupportedClaimCategories: [
          "PRODUCT_RECOMMENDATION",
          "QUOTE_CALCULATION",
          "FINANCIAL_CAPACITY",
          "HEALTH_CONDITION",
          "FAMILY_CONTEXT",
          "UNVERIFIED_INTENT",
        ],
        privacyRestrictions: [
          "Exclude raw notes, prompts, drafts, transcripts, provider data, and technical audit snapshots.",
        ],
        sensitiveDataExclusions: [
          "Phone, WhatsApp, email, health, income, date of birth, family context, and unrestricted profile data.",
        ],
        productReference:
          latestProposal?.payload?.productReference || null,
        quoteReference:
          latestProposal?.payload?.quoteReference || null,
      };

      return deepFreeze({
        engine: "NASH_TIMELINE_TO_CONVERSATION_BRIEF_PROJECTION",
        version: PROJECTION_CONTRACT_VERSION,
        status: PROJECTION_STATUSES.SUCCESS,
        decision: "CONVERSATION_CONTEXT_PROJECTION_READY",
        projection,
        reasonCodes: [],
        blockedFields: [],
        invalidEvents: [],
        conflicts: clone(conflicts),
        missingEventTypes,
        deduplicatedEventIds: uniqueStrings(deduplicatedEventIds),
        safety: safetyFlags(),
      });
    }

    return deepFreeze({
      PROJECTION_CONTRACT_VERSION,
      PROJECTION_MODE,
      TIMELINE_CONTRACT_VERSION,
      EXPECTED_PRIVACY_CLASSIFICATION,
      EXPECTED_RETENTION_POLICY,
      PROJECTION_STATUSES,
      SYSTEM_EVENT_TYPES,
      ADVISOR_EVENT_TYPES,
      ALL_EVENT_TYPES,
      ALLOWED_EVENT_SOURCES,
      EVENT_PAYLOAD_RULES,
      projectTimelineToConversationContext,
      diagnostics: () =>
        deepFreeze({
          projectionMode: PROJECTION_MODE,
          persistentProjectionTable: false,
          providerInvocationAllowed: false,
          draftGenerationAllowed: false,
          messageGenerationAllowed: false,
          runtimeNetworkAllowed: false,
          runtimeDatabaseAllowed: false,
          runtimeFilesystemAllowed: false,
          persistenceAllowed: false,
          timelineMutationAllowed: false,
          pipelineMutationAllowed: false,
          technicalAuditAccepted: false,
          rawNotesAccepted: false,
        }),
      _private: {
        isObject,
        clone,
        deepFreeze,
        uniqueStrings,
        canonicalize,
        stableStringify,
        stableHash,
        isIsoDate,
        isOpaqueToken,
        findProhibitedKeys,
        findPromptInjection,
        validatePayload,
        validateEvidenceReferences,
        validateTimelineEvent,
        normalizeProjectionMetadata,
        compareEvents,
        calculateFreshness,
        claimForEvent,
        evidenceIdsForEvent,
        factForEvent,
      },
    });
  },
);
