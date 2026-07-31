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

    const SOURCE_TYPES = Object.freeze([
      "QUOTE_RUNTIME",
      "ADVISOR_CONFIRMED",
      "PROSPECT_DECLARATION",
      "APPLICATION_AUTHORITY",
    ]);

    const CONFIRMATION_STATES = Object.freeze([
      "SYSTEM_OBSERVED",
      "HUMAN_CONFIRMED",
      "PROSPECT_CONFIRMED",
      "EXTERNAL_CONFIRMED",
      "DISPUTED",
    ]);

    const REQUIRED_KEYS = Object.freeze([
      "quoteReference",
      "quoteVersionReference",
      "prospectReference",
      "productReference",
      "eventType",
      "lifecycleState",
      "effectiveAt",
      "sourceRecordReference",
      "sourceEvidenceReferences",
      "freshness",
      "confirmationState",
      "idempotencyKey",
    ]);

    const OPTIONAL_KEYS = Object.freeze([
      "tenantReference",
      "commercialPersonReference",
      "opportunityReference",
      "applicationReference",
      "decisionReasonCode",
      "correctionOf",
      "causationReference",
      "correlationReference",
    ]);

    const PROHIBITED_KEY_TOKENS = Object.freeze([
      "premium",
      "prima",
      "coverage",
      "cobertura",
      "sumassured",
      "suminsured",
      "sumaasegurada",
      "deductible",
      "deducible",
      "coinsurance",
      "coaseguro",
      "calculation",
      "calculo",
      "projection",
      "proyeccion",
      "rawpdf",
      "pdfbytes",
      "arraybuffer",
      "blob",
      "base64",
      "transcript",
      "rawnotes",
      "notes",
      "phone",
      "whatsapp",
      "email",
      "income",
      "health",
      "medical",
      "prompt",
      "providerpayload",
      "providerresponse",
      "secret",
      "password",
    ]);

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

    const HUMAN_CONFIRMATION_EVENTS = Object.freeze([
      "QUOTE_REVIEW_CONFIRMED",
      "QUOTE_PRESENTED",
      "QUOTE_PROSPECT_ACCEPTED",
      "QUOTE_PROSPECT_REJECTED",
      "QUOTE_CONVERTED_TO_APPLICATION",
    ]);

    const PROSPECT_DECISION_EVENTS = Object.freeze([
      "QUOTE_PROSPECT_ACCEPTED",
      "QUOTE_PROSPECT_REJECTED",
    ]);

    class QuoteLifecycleEventContractError extends TypeError {
      constructor(code, message, details = null) {
        super(message);
        this.name = "QuoteLifecycleEventContractError";
        this.code = code;
        this.details = details;
      }
    }

    function error(code, message, details = null) {
      throw new QuoteLifecycleEventContractError(code, message, details);
    }

    function isRecord(value) {
      if (!value || typeof value !== "object" || Array.isArray(value)) return false;
      const prototype = Object.getPrototypeOf(value);
      return prototype === Object.prototype || prototype === null;
    }

    function clone(value) {
      if (value === undefined) return undefined;
      return JSON.parse(JSON.stringify(value));
    }

    function deepFreeze(value) {
      if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
      Object.freeze(value);
      Object.values(value).forEach(deepFreeze);
      return value;
    }

    function stableValue(value) {
      if (Array.isArray(value)) return value.map(stableValue);
      if (isRecord(value)) {
        const output = {};
        for (const key of Object.keys(value).sort()) output[key] = stableValue(value[key]);
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
      return [
        2166136261,
        2166136261 ^ 0x9e3779b9,
        2166136261 ^ 0x85ebca6b,
        2166136261 ^ 0xc2b2ae35,
      ]
        .map(seed => fnv1a32(text, seed))
        .join("");
    }

    function normalizeKey(value) {
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
      if (!isRecord(value)) return findings;
      for (const [key, nested] of Object.entries(value)) {
        const nextPath = `${path}.${key}`;
        if (PROHIBITED_KEY_TOKENS.includes(normalizeKey(key))) findings.push(nextPath);
        findings.push(...findProhibitedKeys(nested, nextPath));
      }
      return [...new Set(findings)].sort();
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
        error(code, `${label} no es válido.`, { allowedValues: [...allowed] });
      }
      return normalized;
    }

    function requireIso(value, code, label) {
      if (typeof value !== "string" || !value.trim() || Number.isNaN(Date.parse(value))) {
        error(code, `${label} no es válido.`);
      }
      return new Date(value).toISOString();
    }

    function normalizeReferences(value) {
      if (!Array.isArray(value) || value.length === 0 || value.length > 20) {
        error(
          "SOURCE_EVIDENCE_REFERENCES_INVALID",
          "Las referencias de evidencia deben contener entre 1 y 20 elementos.",
        );
      }
      const normalized = value.map(reference =>
        requireOpaque(
          reference,
          "SOURCE_EVIDENCE_REFERENCE_INVALID",
          "La referencia de evidencia",
        ),
      );
      if (new Set(normalized).size !== normalized.length) {
        error(
          "SOURCE_EVIDENCE_REFERENCES_DUPLICATED",
          "Las referencias de evidencia deben ser únicas.",
        );
      }
      return normalized;
    }

    function normalizeFreshness(value) {
      if (!isRecord(value)) {
        error("FRESHNESS_INVALID", "La frescura debe ser un objeto.");
      }
      const allowed = ["status", "capturedAt", "source"];
      const unsupported = Object.keys(value).filter(key => !allowed.includes(key));
      if (unsupported.length) {
        error("FRESHNESS_KEYS_NOT_ALLOWED", "La frescura contiene campos no autorizados.", {
          unsupportedKeys: unsupported,
        });
      }
      const status = requireOpaque(value.status, "FRESHNESS_STATUS_INVALID", "El estado de frescura", 80);
      const capturedAt = requireIso(value.capturedAt, "FRESHNESS_CAPTURED_AT_INVALID", "La fecha de frescura");
      const source = requireOpaque(value.source, "FRESHNESS_SOURCE_INVALID", "La fuente de frescura", 120);
      return { status, capturedAt, source };
    }

    function assertAllowedKeys(input) {
      const allowed = [...REQUIRED_KEYS, ...OPTIONAL_KEYS];
      const unsupported = Object.keys(input).filter(key => !allowed.includes(key));
      if (unsupported.length) {
        error("QUOTE_EVENT_KEYS_NOT_ALLOWED", "El evento contiene campos no autorizados.", {
          unsupportedKeys: unsupported.sort(),
        });
      }
    }

    function assertRequiredKeys(input) {
      const missing = REQUIRED_KEYS.filter(
        key => !Object.prototype.hasOwnProperty.call(input, key),
      );
      if (missing.length) {
        error("QUOTE_EVENT_REQUIRED_KEYS_MISSING", "El evento no contiene todos los campos obligatorios.", {
          missingKeys: missing.sort(),
        });
      }
    }

    function createQuoteLifecycleEvent(input = {}) {
      if (!isRecord(input)) {
        error("QUOTE_EVENT_INPUT_INVALID", "El evento debe ser un objeto.");
      }
      assertAllowedKeys(input);
      assertRequiredKeys(input);

      const prohibited = findProhibitedKeys(input);
      if (prohibited.length) {
        error(
          "QUOTE_NUMERIC_TRUTH_OR_RAW_DATA_FORBIDDEN",
          "El evento no puede duplicar Quote Truth ni datos crudos.",
          { prohibitedPaths: prohibited },
        );
      }

      const eventType = requireEnum(
        input.eventType,
        EVENT_TYPES,
        "QUOTE_EVENT_TYPE_INVALID",
        "El tipo de evento",
      );
      const lifecycleState = requireEnum(
        input.lifecycleState,
        LIFECYCLE_STATES,
        "QUOTE_LIFECYCLE_STATE_INVALID",
        "El estado de ciclo de vida",
      );
      if (EVENT_STATE_RULES[eventType] !== lifecycleState) {
        error(
          "QUOTE_EVENT_STATE_MISMATCH",
          "El tipo de evento no coincide con el estado de ciclo de vida.",
          { expectedState: EVENT_STATE_RULES[eventType] },
        );
      }

      const confirmationState = requireEnum(
        input.confirmationState,
        CONFIRMATION_STATES,
        "QUOTE_CONFIRMATION_STATE_INVALID",
        "El estado de confirmación",
      );
      if (
        HUMAN_CONFIRMATION_EVENTS.includes(eventType) &&
        !["HUMAN_CONFIRMED", "PROSPECT_CONFIRMED", "EXTERNAL_CONFIRMED"].includes(
          confirmationState,
        )
      ) {
        error(
          "QUOTE_HUMAN_CONFIRMATION_REQUIRED",
          "El evento requiere confirmación humana o externa gobernada.",
        );
      }
      if (
        PROSPECT_DECISION_EVENTS.includes(eventType) &&
        confirmationState !== "PROSPECT_CONFIRMED"
      ) {
        error(
          "QUOTE_PROSPECT_DECISION_CONFIRMATION_REQUIRED",
          "La decisión del Prospect debe estar confirmada explícitamente.",
        );
      }
      if (
        eventType === "QUOTE_CONVERTED_TO_APPLICATION" &&
        confirmationState !== "EXTERNAL_CONFIRMED"
      ) {
        error(
          "APPLICATION_AUTHORITY_CONFIRMATION_REQUIRED",
          "La conversión a solicitud requiere autoridad externa confirmada.",
        );
      }

      const normalized = {
        quoteReference: requireOpaque(
          input.quoteReference,
          "QUOTE_REFERENCE_INVALID",
          "La referencia de cotización",
        ),
        quoteVersionReference: requireOpaque(
          input.quoteVersionReference,
          "QUOTE_VERSION_REFERENCE_INVALID",
          "La referencia de versión",
        ),
        prospectReference: requireOpaque(
          input.prospectReference,
          "PROSPECT_REFERENCE_INVALID",
          "La referencia de Prospect",
        ),
        productReference: requireOpaque(
          input.productReference,
          "PRODUCT_REFERENCE_INVALID",
          "La referencia de producto",
        ),
        eventType,
        lifecycleState,
        effectiveAt: requireIso(input.effectiveAt, "QUOTE_EFFECTIVE_AT_INVALID", "La fecha efectiva"),
        sourceRecordReference: requireOpaque(
          input.sourceRecordReference,
          "SOURCE_RECORD_REFERENCE_INVALID",
          "La referencia fuente",
        ),
        sourceEvidenceReferences: normalizeReferences(input.sourceEvidenceReferences),
        freshness: normalizeFreshness(input.freshness),
        confirmationState,
        idempotencyKey: requireOpaque(
          input.idempotencyKey,
          "QUOTE_IDEMPOTENCY_KEY_INVALID",
          "La llave de idempotencia",
        ),
        tenantReference: optionalOpaque(
          input.tenantReference,
          "TENANT_REFERENCE_INVALID",
          "La referencia de tenant",
        ),
        commercialPersonReference: optionalOpaque(
          input.commercialPersonReference,
          "COMMERCIAL_PERSON_REFERENCE_INVALID",
          "La referencia de CommercialPerson",
        ),
        opportunityReference: optionalOpaque(
          input.opportunityReference,
          "OPPORTUNITY_REFERENCE_INVALID",
          "La referencia de oportunidad",
        ),
        applicationReference: optionalOpaque(
          input.applicationReference,
          "APPLICATION_REFERENCE_INVALID",
          "La referencia de solicitud",
        ),
        decisionReasonCode: optionalOpaque(
          input.decisionReasonCode,
          "DECISION_REASON_CODE_INVALID",
          "El código de razón",
          120,
        ),
        correctionOf: optionalOpaque(
          input.correctionOf,
          "CORRECTION_OF_INVALID",
          "La referencia de corrección",
        ),
        causationReference: optionalOpaque(
          input.causationReference,
          "CAUSATION_REFERENCE_INVALID",
          "La referencia de causalidad",
        ),
        correlationReference: optionalOpaque(
          input.correlationReference,
          "CORRELATION_REFERENCE_INVALID",
          "La referencia de correlación",
        ),
      };

      if (
        eventType === "QUOTE_CONVERTED_TO_APPLICATION" &&
        !normalized.applicationReference
      ) {
        error(
          "APPLICATION_REFERENCE_REQUIRED",
          "La conversión a solicitud requiere una referencia de Application.",
        );
      }

      const identity = {
        schemaVersion: SCHEMA_VERSION,
        contractVersion: CONTRACT_VERSION,
        ...normalized,
      };
      const digest = stableDigest(identity);

      return deepFreeze({
        eventId: `quote-event:${digest}`,
        schemaVersion: SCHEMA_VERSION,
        contractVersion: CONTRACT_VERSION,
        ...normalized,
        eventDigest: digest,
        privacyClass: "PRIVATE",
        learningEligibility: false,
        safetyFlags: {
          executesBusinessAction: false,
          mutatesExternalProvider: false,
          promotesAiOutputToTruth: false,
          automaticIdentityMerge: false,
          automaticProspectDecision: false,
          automaticApplicationCreation: false,
        },
      });
    }

    function createQuoteLifecycleCorrection(original, overrides = {}) {
      const previous = assertQuoteLifecycleEvent(original);
      return createQuoteLifecycleEvent({
        quoteReference: previous.quoteReference,
        quoteVersionReference: previous.quoteVersionReference,
        prospectReference: previous.prospectReference,
        productReference: previous.productReference,
        eventType: previous.eventType,
        lifecycleState: previous.lifecycleState,
        effectiveAt: overrides.effectiveAt,
        sourceRecordReference: overrides.sourceRecordReference,
        sourceEvidenceReferences: overrides.sourceEvidenceReferences,
        freshness: overrides.freshness,
        confirmationState: overrides.confirmationState,
        idempotencyKey: overrides.idempotencyKey,
        tenantReference: previous.tenantReference,
        commercialPersonReference: previous.commercialPersonReference,
        opportunityReference: previous.opportunityReference,
        applicationReference:
          overrides.applicationReference ?? previous.applicationReference,
        decisionReasonCode:
          overrides.decisionReasonCode ?? previous.decisionReasonCode,
        correctionOf: previous.eventId,
        causationReference: overrides.causationReference ?? previous.eventId,
        correlationReference:
          overrides.correlationReference ?? previous.correlationReference,
      });
    }

    function assertQuoteLifecycleEvent(value) {
      if (!isRecord(value)) {
        error("QUOTE_EVENT_INVALID", "El evento de cotización no es válido.");
      }
      const rebuilt = createQuoteLifecycleEvent({
        quoteReference: value.quoteReference,
        quoteVersionReference: value.quoteVersionReference,
        prospectReference: value.prospectReference,
        productReference: value.productReference,
        eventType: value.eventType,
        lifecycleState: value.lifecycleState,
        effectiveAt: value.effectiveAt,
        sourceRecordReference: value.sourceRecordReference,
        sourceEvidenceReferences: value.sourceEvidenceReferences,
        freshness: value.freshness,
        confirmationState: value.confirmationState,
        idempotencyKey: value.idempotencyKey,
        tenantReference: value.tenantReference,
        commercialPersonReference: value.commercialPersonReference,
        opportunityReference: value.opportunityReference,
        applicationReference: value.applicationReference,
        decisionReasonCode: value.decisionReasonCode,
        correctionOf: value.correctionOf,
        causationReference: value.causationReference,
        correlationReference: value.correlationReference,
      });
      if (
        value.schemaVersion !== SCHEMA_VERSION ||
        value.contractVersion !== CONTRACT_VERSION ||
        value.eventId !== rebuilt.eventId ||
        value.eventDigest !== rebuilt.eventDigest
      ) {
        error(
          "QUOTE_EVENT_INTEGRITY_INVALID",
          "La identidad determinista del evento no coincide.",
        );
      }
      return value;
    }

    return deepFreeze({
      CONTRACT_VERSION,
      SCHEMA_VERSION,
      EVENT_TYPES,
      LIFECYCLE_STATES,
      SOURCE_TYPES,
      CONFIRMATION_STATES,
      REQUIRED_KEYS,
      OPTIONAL_KEYS,
      PROHIBITED_KEY_TOKENS,
      EVENT_STATE_RULES,
      HUMAN_CONFIRMATION_EVENTS,
      PROSPECT_DECISION_EVENTS,
      QuoteLifecycleEventContractError,
      stableStringify,
      stableDigest,
      createQuoteLifecycleEvent,
      createQuoteLifecycleCorrection,
      assertQuoteLifecycleEvent,
    });
  },
);
