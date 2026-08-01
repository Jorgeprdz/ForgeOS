"use strict";

(function quoteLifecycleEventContractModule(root, factory) {
  const api = factory();

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  if (root) {
    root.ForgeQuoteLifecycleEventContractCartera001B = api;
  }
})(
  typeof globalThis !== "undefined" ? globalThis : this,
  function quoteLifecycleEventContractFactory() {
    const CONTRACT_VERSION = "CARTERA-001B.1";
    const SCHEMA_VERSION = "forge.quote_lifecycle_event.v1";

    const EVENT_TYPES = Object.freeze([
      "QUOTE_CREATED",
      "QUOTE_UPDATED",
      "QUOTE_RECALCULATED",
      "QUOTE_REVIEW_CONFIRMED",
      "QUOTE_PRESENTED",
      "QUOTE_PROSPECT_ACCEPTED",
      "QUOTE_PROSPECT_REJECTED",
      "QUOTE_CONVERTED_TO_APPLICATION",
    ]);

    const LIFECYCLE_STATES = Object.freeze([
      "DRAFT",
      "REVIEWED",
      "PRESENTED",
      "PROSPECT_ACCEPTED",
      "PROSPECT_REJECTED",
      "CONVERTED_TO_APPLICATION",
    ]);

    const ACTOR_TYPES = Object.freeze([
      "ADVISOR",
      "SYSTEM",
    ]);

    const SOURCE_TYPES = Object.freeze([
      "ADVISOR_CONFIRMED",
      "SYSTEM_OBSERVED",
      "QUOTE_AUTHORITY",
    ]);

    const EVIDENCE_STRENGTHS = Object.freeze([
      "SYSTEM_OBSERVED",
      "HUMAN_CONFIRMED",
    ]);

    const CONFIRMATION_STATES = Object.freeze([
      "CONFIRMED",
      "DISPUTED",
    ]);

    const PRIVACY_CLASSES = Object.freeze([
      "PRIVATE",
      "SENSITIVE",
      "RESTRICTED",
    ]);

    const EVENT_KEYS = Object.freeze([
      "event_id",
      "event_digest",
      "event_type",
      "schema_version",
      "contract_version",
      "tenant_id",
      "actor",
      "subject",
      "source",
      "evidence_strength",
      "occurred_at",
      "recorded_at",
      "correlation_id",
      "causation_id",
      "idempotency_key",
      "privacy_class",
      "learning_eligibility",
      "payload",
      "provenance",
      "confirmation_state",
      "correction_of",
      "safety_flags",
    ]);

    const PAYLOAD_KEYS = Object.freeze([
      "quote_reference",
      "quote_version_reference",
      "prospect_reference",
      "product_reference",
      "lifecycle_state",
      "previous_lifecycle_state",
      "application_reference",
      "decision_reason_code",
    ]);

    const REQUIRED_PAYLOAD_KEYS = Object.freeze([
      "quote_reference",
      "quote_version_reference",
      "prospect_reference",
      "product_reference",
      "lifecycle_state",
    ]);

    const PROVENANCE_KEYS = Object.freeze([
      "source_system",
      "source_record_id",
      "captured_via",
      "evidence_references",
      "freshness_status",
      "snapshot_digest",
    ]);

    const SAFETY_FLAG_KEYS = Object.freeze([
      "executes_business_action",
      "mutates_external_provider",
      "promotes_ai_output_to_truth",
      "cross_tenant_data",
      "eligible_for_global_learning",
      "copies_numeric_quote_truth_to_timeline",
      "creates_application_without_authority",
    ]);

    const DEFAULT_SAFETY_FLAGS = Object.freeze({
      executes_business_action: false,
      mutates_external_provider: false,
      promotes_ai_output_to_truth: false,
      cross_tenant_data: false,
      eligible_for_global_learning: false,
      copies_numeric_quote_truth_to_timeline: false,
      creates_application_without_authority: false,
    });

    const EVENT_STATE_RULES = Object.freeze({
      QUOTE_CREATED: "DRAFT",
      QUOTE_UPDATED: "DRAFT",
      QUOTE_RECALCULATED: "DRAFT",
      QUOTE_REVIEW_CONFIRMED: "REVIEWED",
      QUOTE_PRESENTED: "PRESENTED",
      QUOTE_PROSPECT_ACCEPTED: "PROSPECT_ACCEPTED",
      QUOTE_PROSPECT_REJECTED: "PROSPECT_REJECTED",
      QUOTE_CONVERTED_TO_APPLICATION: "CONVERTED_TO_APPLICATION",
    });

    const HUMAN_CONFIRMED_EVENTS = Object.freeze([
      "QUOTE_REVIEW_CONFIRMED",
      "QUOTE_PRESENTED",
      "QUOTE_PROSPECT_ACCEPTED",
      "QUOTE_PROSPECT_REJECTED",
      "QUOTE_CONVERTED_TO_APPLICATION",
    ]);

    const PROHIBITED_KEY_TOKENS = Object.freeze([
      "annualpremium",
      "premium",
      "premiumtable",
      "sumassured",
      "suminsured",
      "deductible",
      "coinsurance",
      "coverage",
      "calculation",
      "nativeResult".toLowerCase(),
      "productintelligence",
      "rawpdf",
      "pdfbytes",
      "arraybuffer",
      "base64",
      "binary",
      "blob",
      "dataurl",
      "rawtext",
      "transcript",
      "prompt",
      "systemprompt",
      "providerpayload",
      "providerresponse",
      "email",
      "phone",
      "whatsapp",
      "medical",
      "health",
      "income",
      "secret",
      "password",
      "token",
    ]);

    class QuoteLifecycleEventError extends TypeError {
      constructor(code, message, details = null) {
        super(message);
        this.name = "QuoteLifecycleEventError";
        this.code = code;
        this.details = details;
      }
    }

    function error(code, message, details = null) {
      throw new QuoteLifecycleEventError(code, message, details);
    }

    function isPlainObject(value) {
      if (!value || typeof value !== "object" || Array.isArray(value)) {
        return false;
      }
      const prototype = Object.getPrototypeOf(value);
      return prototype === Object.prototype || prototype === null;
    }

    function deepFreeze(value) {
      if (!value || typeof value !== "object" || Object.isFrozen(value)) {
        return value;
      }
      Object.freeze(value);
      Object.values(value).forEach(deepFreeze);
      return value;
    }

    function stableValue(value) {
      if (Array.isArray(value)) return value.map(stableValue);
      if (isPlainObject(value)) {
        const output = {};
        for (const key of Object.keys(value).sort()) {
          output[key] = stableValue(value[key]);
        }
        return output;
      }
      return value;
    }

    function stableStringify(value) {
      return JSON.stringify(stableValue(value));
    }

    function fnv1a32(text, seed) {
      let hash = seed >>> 0;
      for (let index = 0; index < text.length; index += 1) {
        hash ^= text.charCodeAt(index);
        hash = Math.imul(hash, 16777619);
      }
      return (hash >>> 0).toString(16).padStart(8, "0");
    }

    function stableDigest(value) {
      const text = typeof value === "string" ? value : stableStringify(value);
      const seeds = [
        2166136261,
        2166136261 ^ 0x9e3779b9,
        2166136261 ^ 0x85ebca6b,
        2166136261 ^ 0xc2b2ae35,
      ];
      return seeds.map(seed => fnv1a32(text, seed)).join("");
    }

    function clone(value) {
      return value === undefined ? undefined : JSON.parse(JSON.stringify(value));
    }

    function requirePlainObject(value, code, label) {
      if (!isPlainObject(value)) error(code, `${label} debe ser un objeto.`);
      return value;
    }

    function assertAllowedKeys(value, allowed, code, label) {
      const unsupported = Object.keys(value).filter(key => !allowed.includes(key));
      if (unsupported.length) {
        error(code, `${label} contiene campos no autorizados.`, {
          unsupported_keys: unsupported.sort(),
        });
      }
    }

    function requireOpaque(value, code, label, maximum = 240) {
      const normalized = String(value || "").trim();
      if (
        !normalized ||
        normalized.length > maximum ||
        !/^[A-Za-z0-9][A-Za-z0-9._:@/-]*$/.test(normalized)
      ) {
        error(code, `${label} no es válido.`);
      }
      return normalized;
    }

    function optionalOpaque(value, code, label, maximum = 240) {
      if (value === undefined || value === null || value === "") return null;
      return requireOpaque(value, code, label, maximum);
    }

    function requireEnum(value, allowed, code, label) {
      const normalized = String(value || "").trim();
      if (!allowed.includes(normalized)) {
        error(code, `${label} no es válido.`, { allowed_values: [...allowed] });
      }
      return normalized;
    }

    function normalizeIso(value, code, label) {
      if (typeof value !== "string" || !value.trim() || Number.isNaN(Date.parse(value))) {
        error(code, `${label} no es válido.`);
      }
      return new Date(value).toISOString();
    }

    function optionalIso(value, code, label) {
      if (value === undefined || value === null || value === "") return null;
      return normalizeIso(value, code, label);
    }

    function normalizeToken(value) {
      return String(value || "")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "");
    }

    function findProhibitedKeys(value, path = "$") {
      const findings = [];
      if (Array.isArray(value)) {
        value.forEach((entry, index) => {
          findings.push(...findProhibitedKeys(entry, `${path}[${index}]`));
        });
        return findings;
      }
      if (!isPlainObject(value)) return findings;
      for (const [key, nested] of Object.entries(value)) {
        const nestedPath = `${path}.${key}`;
        if (PROHIBITED_KEY_TOKENS.includes(normalizeToken(key))) {
          findings.push(nestedPath);
        }
        findings.push(...findProhibitedKeys(nested, nestedPath));
      }
      return [...new Set(findings)].sort();
    }

    function normalizeActor(value) {
      requirePlainObject(value, "ACTOR_INVALID", "El actor");
      assertAllowedKeys(value, ["type", "id"], "ACTOR_KEYS_INVALID", "El actor");
      return {
        type: requireEnum(value.type, ACTOR_TYPES, "ACTOR_TYPE_INVALID", "El tipo de actor"),
        id: requireOpaque(value.id, "ACTOR_ID_INVALID", "El identificador del actor"),
      };
    }

    function normalizeSubject(value) {
      requirePlainObject(value, "SUBJECT_INVALID", "El sujeto");
      assertAllowedKeys(value, ["type", "id"], "SUBJECT_KEYS_INVALID", "El sujeto");
      const type = String(value.type || "").trim();
      if (type !== "QUOTE") {
        error("SUBJECT_TYPE_INVALID", "El evento debe tener sujeto QUOTE.");
      }
      return {
        type,
        id: requireOpaque(value.id, "SUBJECT_ID_INVALID", "La referencia de Quote"),
      };
    }

    function normalizeSource(value) {
      requirePlainObject(value, "SOURCE_INVALID", "La fuente");
      assertAllowedKeys(
        value,
        ["type", "reference", "channel"],
        "SOURCE_KEYS_INVALID",
        "La fuente",
      );
      const type = requireEnum(value.type, SOURCE_TYPES, "SOURCE_TYPE_INVALID", "El tipo de fuente");
      const channel = String(value.channel || "").trim();
      if (channel !== "QUOTE") {
        error("SOURCE_CHANNEL_INVALID", "El canal del evento debe ser QUOTE.");
      }
      return {
        type,
        reference: requireOpaque(value.reference, "SOURCE_REFERENCE_INVALID", "La referencia de fuente"),
        channel,
      };
    }

    function normalizeEvidenceReferences(value) {
      if (!Array.isArray(value) || value.length === 0 || value.length > 20) {
        error(
          "EVIDENCE_REFERENCES_INVALID",
          "Las referencias de evidencia deben contener entre 1 y 20 elementos.",
        );
      }
      const normalized = value.map(reference =>
        requireOpaque(reference, "EVIDENCE_REFERENCE_INVALID", "La referencia de evidencia"),
      );
      if (new Set(normalized).size !== normalized.length) {
        error("EVIDENCE_REFERENCES_DUPLICATED", "Las referencias de evidencia deben ser únicas.");
      }
      return normalized;
    }

    function normalizePayload(eventType, value) {
      requirePlainObject(value, "PAYLOAD_INVALID", "El payload");
      assertAllowedKeys(value, PAYLOAD_KEYS, "PAYLOAD_KEYS_INVALID", "El payload");
      const missing = REQUIRED_PAYLOAD_KEYS.filter(
        key => !Object.prototype.hasOwnProperty.call(value, key),
      );
      if (missing.length) {
        error("PAYLOAD_REQUIRED_KEYS_MISSING", "Faltan referencias obligatorias del evento.", {
          missing_keys: missing,
        });
      }

      const lifecycleState = requireEnum(
        value.lifecycle_state,
        LIFECYCLE_STATES,
        "LIFECYCLE_STATE_INVALID",
        "El estado de Quote",
      );
      if (EVENT_STATE_RULES[eventType] !== lifecycleState) {
        error("EVENT_STATE_MISMATCH", "El tipo de evento no corresponde al estado de Quote.", {
          expected_state: EVENT_STATE_RULES[eventType],
          actual_state: lifecycleState,
        });
      }

      const applicationReference = optionalOpaque(
        value.application_reference,
        "APPLICATION_REFERENCE_INVALID",
        "La referencia de solicitud",
      );
      if (eventType === "QUOTE_CONVERTED_TO_APPLICATION" && !applicationReference) {
        error(
          "APPLICATION_AUTHORITY_REFERENCE_REQUIRED",
          "La conversión requiere una referencia de solicitud emitida por su autoridad.",
        );
      }
      if (eventType !== "QUOTE_CONVERTED_TO_APPLICATION" && applicationReference) {
        error(
          "APPLICATION_REFERENCE_NOT_ALLOWED",
          "La referencia de solicitud sólo se permite en la conversión gobernada.",
        );
      }

      const output = {
        quote_reference: requireOpaque(value.quote_reference, "QUOTE_REFERENCE_INVALID", "La referencia de Quote"),
        quote_version_reference: requireOpaque(
          value.quote_version_reference,
          "QUOTE_VERSION_REFERENCE_INVALID",
          "La referencia de versión",
        ),
        prospect_reference: requireOpaque(
          value.prospect_reference,
          "PROSPECT_REFERENCE_INVALID",
          "La referencia de Prospect",
        ),
        product_reference: requireOpaque(
          value.product_reference,
          "PRODUCT_REFERENCE_INVALID",
          "La referencia de producto",
        ),
        lifecycle_state: lifecycleState,
        previous_lifecycle_state: value.previous_lifecycle_state == null
          ? null
          : requireEnum(
              value.previous_lifecycle_state,
              LIFECYCLE_STATES,
              "PREVIOUS_LIFECYCLE_STATE_INVALID",
              "El estado anterior",
            ),
        application_reference: applicationReference,
        decision_reason_code: optionalOpaque(
          value.decision_reason_code,
          "DECISION_REASON_CODE_INVALID",
          "El código de razón",
          80,
        ),
      };

      const prohibited = findProhibitedKeys(output);
      if (prohibited.length) {
        error("NUMERIC_QUOTE_TRUTH_NOT_ALLOWED", "El evento no puede duplicar Quote Truth numérica.", {
          paths: prohibited,
        });
      }
      return output;
    }

    function normalizeProvenance(value) {
      requirePlainObject(value, "PROVENANCE_INVALID", "La procedencia");
      assertAllowedKeys(value, PROVENANCE_KEYS, "PROVENANCE_KEYS_INVALID", "La procedencia");
      const freshnessStatus = String(value.freshness_status || "").trim();
      if (!freshnessStatus || freshnessStatus.length > 80) {
        error("FRESHNESS_STATUS_INVALID", "La frescura de la evidencia no es válida.");
      }
      const snapshotDigest = requireOpaque(
        value.snapshot_digest,
        "SNAPSHOT_DIGEST_INVALID",
        "El digest del snapshot",
        128,
      );
      return {
        source_system: requireOpaque(value.source_system, "PROVENANCE_SOURCE_SYSTEM_INVALID", "El sistema fuente"),
        source_record_id: requireOpaque(value.source_record_id, "PROVENANCE_RECORD_ID_INVALID", "El registro fuente"),
        captured_via: requireOpaque(value.captured_via, "PROVENANCE_CAPTURED_VIA_INVALID", "El modo de captura"),
        evidence_references: normalizeEvidenceReferences(value.evidence_references),
        freshness_status: freshnessStatus,
        snapshot_digest: snapshotDigest,
      };
    }

    function normalizeSafetyFlags(value) {
      requirePlainObject(value, "SAFETY_FLAGS_INVALID", "Las banderas de seguridad");
      assertAllowedKeys(value, SAFETY_FLAG_KEYS, "SAFETY_FLAG_KEYS_INVALID", "Las banderas de seguridad");
      const output = { ...DEFAULT_SAFETY_FLAGS };
      for (const key of SAFETY_FLAG_KEYS) {
        if (Object.prototype.hasOwnProperty.call(value, key)) {
          if (value[key] !== false) {
            error("REAL_EFFECT_FLAG_NOT_ALLOWED", "Las banderas de efectos deben permanecer en false.", {
              key,
            });
          }
          output[key] = false;
        }
      }
      return output;
    }

    function createQuoteLifecycleEvent(input = {}) {
      requirePlainObject(input, "EVENT_INVALID", "El evento");
      assertAllowedKeys(input, EVENT_KEYS, "EVENT_KEYS_INVALID", "El evento");

      const eventType = requireEnum(
        input.event_type,
        EVENT_TYPES,
        "EVENT_TYPE_INVALID",
        "El tipo de evento",
      );
      const actor = normalizeActor(input.actor);
      const subject = normalizeSubject(input.subject);
      const source = normalizeSource(input.source);
      const evidenceStrength = requireEnum(
        input.evidence_strength,
        EVIDENCE_STRENGTHS,
        "EVIDENCE_STRENGTH_INVALID",
        "La fuerza de evidencia",
      );
      const confirmationState = requireEnum(
        input.confirmation_state,
        CONFIRMATION_STATES,
        "CONFIRMATION_STATE_INVALID",
        "El estado de confirmación",
      );

      if (
        HUMAN_CONFIRMED_EVENTS.includes(eventType) &&
        (
          actor.type !== "ADVISOR" ||
          source.type !== "ADVISOR_CONFIRMED" ||
          evidenceStrength !== "HUMAN_CONFIRMED" ||
          confirmationState !== "CONFIRMED"
        )
      ) {
        error(
          "HUMAN_CONFIRMATION_REQUIRED",
          "Este evento requiere confirmación humana explícita del asesor.",
        );
      }

      if (
        !HUMAN_CONFIRMED_EVENTS.includes(eventType) &&
        source.type === "SYSTEM_OBSERVED" &&
        evidenceStrength !== "SYSTEM_OBSERVED"
      ) {
        error(
          "SYSTEM_EVIDENCE_MISMATCH",
          "Los eventos observados por sistema requieren evidencia SYSTEM_OBSERVED.",
        );
      }

      const payload = normalizePayload(eventType, input.payload);
      if (subject.id !== payload.quote_reference) {
        error("SUBJECT_QUOTE_REFERENCE_MISMATCH", "El sujeto no coincide con la referencia de Quote.");
      }

      const tenantId = requireOpaque(input.tenant_id, "TENANT_ID_INVALID", "El tenant");
      const occurredAt = normalizeIso(input.occurred_at, "OCCURRED_AT_INVALID", "La fecha efectiva");
      const recordedAt = normalizeIso(input.recorded_at, "RECORDED_AT_INVALID", "La fecha de registro");
      if (Date.parse(recordedAt) < Date.parse(occurredAt)) {
        error("RECORDED_BEFORE_OCCURRED", "La fecha de registro no puede ser anterior al evento.");
      }

      const idempotencyKey = requireOpaque(
        input.idempotency_key,
        "IDEMPOTENCY_KEY_INVALID",
        "La llave de idempotencia",
      );
      const correlationId = requireOpaque(
        input.correlation_id,
        "CORRELATION_ID_INVALID",
        "La correlación",
      );
      if (correlationId !== payload.prospect_reference) {
        error("CORRELATION_PROSPECT_MISMATCH", "La correlación debe ser la referencia de Prospect.");
      }

      const base = {
        event_type: eventType,
        schema_version: SCHEMA_VERSION,
        contract_version: CONTRACT_VERSION,
        tenant_id: tenantId,
        actor,
        subject,
        source,
        evidence_strength: evidenceStrength,
        occurred_at: occurredAt,
        recorded_at: recordedAt,
        correlation_id: correlationId,
        causation_id: optionalOpaque(input.causation_id, "CAUSATION_ID_INVALID", "La causa"),
        idempotency_key: idempotencyKey,
        privacy_class: requireEnum(
          input.privacy_class || "PRIVATE",
          PRIVACY_CLASSES,
          "PRIVACY_CLASS_INVALID",
          "La clasificación de privacidad",
        ),
        learning_eligibility: false,
        payload,
        provenance: normalizeProvenance(input.provenance),
        confirmation_state: confirmationState,
        correction_of: optionalOpaque(input.correction_of, "CORRECTION_OF_INVALID", "La referencia corregida"),
        safety_flags: normalizeSafetyFlags(input.safety_flags || DEFAULT_SAFETY_FLAGS),
      };

      if (input.learning_eligibility === true) {
        error("LEARNING_ELIGIBILITY_NOT_ALLOWED", "El evento no es elegible para aprendizaje global.");
      }
      if (input.schema_version && input.schema_version !== SCHEMA_VERSION) {
        error("SCHEMA_VERSION_INVALID", "La versión de esquema no es válida.");
      }
      if (input.contract_version && input.contract_version !== CONTRACT_VERSION) {
        error("CONTRACT_VERSION_INVALID", "La versión de contrato no es válida.");
      }

      const digest = stableDigest(base);
      const eventId = input.event_id
        ? requireOpaque(input.event_id, "EVENT_ID_INVALID", "El identificador del evento")
        : `quote-event:${digest}`;

      return deepFreeze({
        event_id: eventId,
        ...base,
        event_digest: digest,
      });
    }

    function assertQuoteLifecycleEvent(value) {
      const normalized = createQuoteLifecycleEvent(value);
      if (value.event_id && normalized.event_id !== value.event_id) {
        error("EVENT_ID_MISMATCH", "El identificador del evento no coincide.");
      }
      if (value.event_digest && normalized.event_digest !== value.event_digest) {
        error("EVENT_DIGEST_MISMATCH", "El digest del evento no coincide.");
      }
      return normalized;
    }

    function createQuoteLifecycleCorrection(original, input = {}) {
      const previous = assertQuoteLifecycleEvent(original);
      return createQuoteLifecycleEvent({
        ...clone(input),
        event_type: input.event_type || previous.event_type,
        tenant_id: input.tenant_id || previous.tenant_id,
        subject: input.subject || previous.subject,
        correlation_id: input.correlation_id || previous.correlation_id,
        payload: input.payload || previous.payload,
        privacy_class: input.privacy_class || previous.privacy_class,
        correction_of: previous.event_id,
        learning_eligibility: false,
        safety_flags: input.safety_flags || DEFAULT_SAFETY_FLAGS,
      });
    }

    return deepFreeze({
      CONTRACT_VERSION,
      SCHEMA_VERSION,
      EVENT_TYPES,
      LIFECYCLE_STATES,
      EVENT_STATE_RULES,
      HUMAN_CONFIRMED_EVENTS,
      DEFAULT_SAFETY_FLAGS,
      PROHIBITED_KEY_TOKENS,
      QuoteLifecycleEventError,
      stableStringify,
      stableDigest,
      findProhibitedKeys,
      createQuoteLifecycleEvent,
      assertQuoteLifecycleEvent,
      createQuoteLifecycleCorrection,
    });
  },
);
