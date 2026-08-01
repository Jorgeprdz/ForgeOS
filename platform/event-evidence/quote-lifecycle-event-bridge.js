"use strict";

(function quoteLifecycleEventBridgeModule(root, factory) {
  const contract =
    typeof module !== "undefined" && module.exports
      ? require("./quote-lifecycle-event-contract")
      : root.ForgeQuoteLifecycleEventContractCartera001B;

  const api = factory(contract);

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  if (root) {
    root.ForgeQuoteLifecycleEventBridgeCartera001B = api;
  }
})(
  typeof globalThis !== "undefined" ? globalThis : this,
  function quoteLifecycleEventBridgeFactory(contract) {
    if (!contract) {
      throw new Error("CARTERA001B_QUOTE_LIFECYCLE_CONTRACT_REQUIRED");
    }

    const BRIDGE_VERSION = "CARTERA-001B.1";
    const PROJECTION_CONTRACT_VERSION = "NFAST-08.1";

    const TIMELINE_EVENT_MAP = Object.freeze({
      QUOTE_PRESENTED: Object.freeze({
        eventType: "PROPOSAL_PRESENTED",
        payload(event) {
          return {
            productReference: event.payload.product_reference,
            quoteReference: event.payload.quote_reference,
          };
        },
      }),
      QUOTE_PROSPECT_ACCEPTED: Object.freeze({
        eventType: "DECISION_RECORDED",
        payload(event) {
          return {
            decisionCode: "QUOTE_ACCEPTED",
            reasonCode: event.payload.decision_reason_code || null,
          };
        },
      }),
      QUOTE_PROSPECT_REJECTED: Object.freeze({
        eventType: "DECISION_RECORDED",
        payload(event) {
          return {
            decisionCode: "QUOTE_REJECTED",
            reasonCode: event.payload.decision_reason_code || null,
          };
        },
      }),
    });

    const NUMERIC_TRUTH_TOKENS = Object.freeze([
      "premium",
      "annualpremium",
      "sumassured",
      "suminsured",
      "deductible",
      "coinsurance",
      "coverage",
      "calculation",
      "nativeResult".toLowerCase(),
      "productintelligence",
      "retirementscenario",
      "totalcontributed",
      "totalrecovery",
    ]);

    class QuoteLifecycleBridgeError extends Error {
      constructor(code, message, details = null) {
        super(message);
        this.name = "QuoteLifecycleBridgeError";
        this.code = code;
        this.details = details;
      }
    }

    function error(code, message, details = null) {
      throw new QuoteLifecycleBridgeError(code, message, details);
    }

    function isPlainObject(value) {
      if (!value || typeof value !== "object" || Array.isArray(value)) return false;
      const prototype = Object.getPrototypeOf(value);
      return prototype === Object.prototype || prototype === null;
    }

    function deepFreeze(value) {
      if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
      Object.freeze(value);
      Object.values(value).forEach(deepFreeze);
      return value;
    }

    function clone(value) {
      return value === undefined ? undefined : JSON.parse(JSON.stringify(value));
    }

    function normalizeToken(value) {
      return String(value || "")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "");
    }

    function findNumericQuoteTruth(value, path = "$") {
      const findings = [];
      if (Array.isArray(value)) {
        value.forEach((entry, index) => {
          findings.push(...findNumericQuoteTruth(entry, `${path}[${index}]`));
        });
        return findings;
      }
      if (!isPlainObject(value)) return findings;
      for (const [key, nested] of Object.entries(value)) {
        const nextPath = `${path}.${key}`;
        if (NUMERIC_TRUTH_TOKENS.includes(normalizeToken(key))) findings.push(nextPath);
        findings.push(...findNumericQuoteTruth(nested, nextPath));
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

    function requireIso(value, code, label) {
      if (typeof value !== "string" || Number.isNaN(Date.parse(value))) {
        error(code, `${label} no es válido.`);
      }
      return new Date(value).toISOString();
    }

    function normalizeEvidenceReferences(value) {
      if (!Array.isArray(value) || value.length === 0 || value.length > 20) {
        error(
          "QUOTE_EVIDENCE_REQUIRED",
          "La Quote durable requiere referencias de evidencia.",
        );
      }
      const normalized = value.map(reference =>
        requireOpaque(reference, "QUOTE_EVIDENCE_REFERENCE_INVALID", "La evidencia"),
      );
      if (new Set(normalized).size !== normalized.length) {
        error("QUOTE_EVIDENCE_DUPLICATED", "La evidencia no puede repetirse.");
      }
      return normalized;
    }

    function createQuoteIdentityReceipt(input = {}) {
      if (!isPlainObject(input)) {
        error("QUOTE_IDENTITY_RECEIPT_INVALID", "El recibo de identidad debe ser un objeto.");
      }
      const freshness = isPlainObject(input.freshness) ? clone(input.freshness) : null;
      if (!freshness?.status || typeof freshness.status !== "string") {
        error("QUOTE_FRESHNESS_REQUIRED", "La Quote durable requiere frescura explícita.");
      }

      const receipt = {
        receipt_type: "forge.quote_identity_receipt.v1",
        quote_reference: requireOpaque(input.quoteReference, "QUOTE_REFERENCE_INVALID", "La referencia de Quote"),
        quote_version_reference: requireOpaque(
          input.quoteVersionReference,
          "QUOTE_VERSION_REFERENCE_INVALID",
          "La referencia de versión",
        ),
        prospect_reference: requireOpaque(
          input.prospectReference,
          "PROSPECT_REFERENCE_INVALID",
          "La referencia de Prospect",
        ),
        product_reference: requireOpaque(
          input.productReference,
          "PRODUCT_REFERENCE_INVALID",
          "La referencia de producto",
        ),
        lifecycle_state: requireOpaque(
          input.lifecycleState,
          "QUOTE_LIFECYCLE_STATE_INVALID",
          "El estado de Quote",
          80,
        ),
        effective_at: requireIso(input.effectiveAt, "QUOTE_EFFECTIVE_AT_INVALID", "La fecha efectiva"),
        source_evidence_references: normalizeEvidenceReferences(input.sourceEvidenceReferences),
        freshness,
        confirmation_state: input.confirmationState === "CONFIRMED" ? "CONFIRMED" : (() => {
          error("QUOTE_CONFIRMATION_REQUIRED", "El recibo requiere confirmación humana.");
        })(),
        snapshot_digest: requireOpaque(
          input.snapshotDigest,
          "QUOTE_SNAPSHOT_DIGEST_INVALID",
          "El digest del snapshot",
          128,
        ),
        persistence_receipt: requireOpaque(
          input.persistenceReceipt,
          "QUOTE_PERSISTENCE_RECEIPT_INVALID",
          "El recibo de persistencia",
        ),
        idempotency_key: requireOpaque(
          input.idempotencyKey,
          "QUOTE_IDEMPOTENCY_KEY_INVALID",
          "La llave de idempotencia",
        ),
      };

      return deepFreeze(receipt);
    }

    function createLifecycleEventFromReceipt({
      tenantId,
      advisorId,
      eventType,
      identityReceipt,
      sourceRecordReference,
      occurredAt,
      recordedAt,
      previousLifecycleState = null,
      applicationReference = null,
      decisionReasonCode = null,
      causationId = null,
      correctionOf = null,
    } = {}) {
      const receipt = createQuoteIdentityReceipt({
        quoteReference: identityReceipt?.quote_reference,
        quoteVersionReference: identityReceipt?.quote_version_reference,
        prospectReference: identityReceipt?.prospect_reference,
        productReference: identityReceipt?.product_reference,
        lifecycleState: identityReceipt?.lifecycle_state,
        effectiveAt: identityReceipt?.effective_at,
        sourceEvidenceReferences: identityReceipt?.source_evidence_references,
        freshness: identityReceipt?.freshness,
        confirmationState: identityReceipt?.confirmation_state,
        snapshotDigest: identityReceipt?.snapshot_digest,
        persistenceReceipt: identityReceipt?.persistence_receipt,
        idempotencyKey: identityReceipt?.idempotency_key,
      });

      const human = contract.HUMAN_CONFIRMED_EVENTS.includes(eventType);
      return contract.createQuoteLifecycleEvent({
        event_type: eventType,
        tenant_id: tenantId,
        actor: {
          type: human ? "ADVISOR" : "SYSTEM",
          id: advisorId,
        },
        subject: {
          type: "QUOTE",
          id: receipt.quote_reference,
        },
        source: {
          type: human ? "ADVISOR_CONFIRMED" : "SYSTEM_OBSERVED",
          reference: sourceRecordReference || receipt.persistence_receipt,
          channel: "QUOTE",
        },
        evidence_strength: human ? "HUMAN_CONFIRMED" : "SYSTEM_OBSERVED",
        occurred_at: occurredAt || receipt.effective_at,
        recorded_at: recordedAt || receipt.effective_at,
        correlation_id: receipt.prospect_reference,
        causation_id: causationId,
        idempotency_key: `${receipt.idempotency_key}:${String(eventType).toLowerCase()}`,
        privacy_class: "PRIVATE",
        learning_eligibility: false,
        payload: {
          quote_reference: receipt.quote_reference,
          quote_version_reference: receipt.quote_version_reference,
          prospect_reference: receipt.prospect_reference,
          product_reference: receipt.product_reference,
          lifecycle_state: contract.EVENT_STATE_RULES[eventType],
          previous_lifecycle_state: previousLifecycleState,
          application_reference: applicationReference,
          decision_reason_code: decisionReasonCode,
        },
        provenance: {
          source_system: "quote-lifecycle-persistence",
          source_record_id: receipt.persistence_receipt,
          captured_via: "FORGE_UI",
          evidence_references: receipt.source_evidence_references,
          freshness_status: receipt.freshness.status,
          snapshot_digest: receipt.snapshot_digest,
        },
        confirmation_state: "CONFIRMED",
        correction_of: correctionOf,
        safety_flags: contract.DEFAULT_SAFETY_FLAGS,
      });
    }

    function projectQuoteLifecycleToProspectTimeline(eventLike) {
      const event = contract.assertQuoteLifecycleEvent(eventLike);
      const mapping = TIMELINE_EVENT_MAP[event.event_type];
      if (!mapping) {
        return deepFreeze({
          projected: false,
          reason: "QUOTE_EVENT_HAS_NO_PROSPECT_TIMELINE_MEANING",
          source_event_id: event.event_id,
          source_event_type: event.event_type,
        });
      }

      const payload = mapping.payload(event);
      for (const key of Object.keys(payload)) {
        if (payload[key] === null || payload[key] === undefined || payload[key] === "") {
          delete payload[key];
        }
      }
      const findings = findNumericQuoteTruth(payload);
      if (findings.length) {
        error(
          "NUMERIC_QUOTE_TRUTH_PROJECTION_BLOCKED",
          "La proyección no puede copiar Quote Truth numérica al Timeline.",
          { paths: findings },
        );
      }

      return deepFreeze({
        projected: true,
        contractVersion: PROJECTION_CONTRACT_VERSION,
        prospectReference: event.payload.prospect_reference,
        eventInput: {
          eventType: mapping.eventType,
          occurredAt: event.occurred_at,
          sourceRecordReference: event.event_id,
          payload,
          evidenceReferences: [...event.provenance.evidence_references],
          idempotencyKey: `quote-projection:${event.event_id}`,
        },
        source: {
          quoteEventId: event.event_id,
          quoteEventType: event.event_type,
          quoteReference: event.payload.quote_reference,
          quoteVersionReference: event.payload.quote_version_reference,
        },
        safety: {
          numericQuoteTruthCopied: false,
          automaticBusinessAction: false,
          applicationCreated: false,
        },
      });
    }

    function blockApplicationConversionWithoutAuthority(input = {}) {
      if (input.applicationAuthorityProved === true && input.applicationReference) {
        return deepFreeze({
          blocked: false,
          applicationReference: requireOpaque(
            input.applicationReference,
            "APPLICATION_REFERENCE_INVALID",
            "La referencia de solicitud",
          ),
        });
      }
      return deepFreeze({
        blocked: true,
        code: "APPLICATION_AUTHORITY_NOT_PROVED",
        message: "La Quote no puede convertirse a solicitud sin una autoridad de Application probada.",
        automaticApplicationCreation: false,
      });
    }

    function createRuntime({ persistLifecycleEvent, appendProspectTimelineEvent } = {}) {
      if (typeof persistLifecycleEvent !== "function") {
        error("PERSIST_LIFECYCLE_EVENT_REQUIRED", "La persistencia de Quote es obligatoria.");
      }
      if (typeof appendProspectTimelineEvent !== "function") {
        error("APPEND_PROSPECT_TIMELINE_REQUIRED", "El Timeline gobernado es obligatorio.");
      }

      async function publish(eventLike) {
        const event = contract.assertQuoteLifecycleEvent(eventLike);
        const persisted = await persistLifecycleEvent(event);
        const projection = projectQuoteLifecycleToProspectTimeline(event);
        let timeline = null;
        if (projection.projected) {
          timeline = await appendProspectTimelineEvent(
            projection.prospectReference,
            projection.eventInput,
          );
        }
        return deepFreeze({
          event,
          persisted: clone(persisted),
          projection,
          timeline: clone(timeline),
        });
      }

      return deepFreeze({
        version: BRIDGE_VERSION,
        publish,
        diagnostics: () => deepFreeze({
          bridgeVersion: BRIDGE_VERSION,
          localFirstPatternRequired: true,
          genericLedgerCreated: false,
          numericQuoteTruthProjectionAllowed: false,
          applicationAuthorityRequired: true,
          automaticExternalEffects: false,
        }),
      });
    }

    return deepFreeze({
      BRIDGE_VERSION,
      PROJECTION_CONTRACT_VERSION,
      TIMELINE_EVENT_MAP,
      NUMERIC_TRUTH_TOKENS,
      QuoteLifecycleBridgeError,
      findNumericQuoteTruth,
      createQuoteIdentityReceipt,
      createLifecycleEventFromReceipt,
      projectQuoteLifecycleToProspectTimeline,
      blockApplicationConversionWithoutAuthority,
      createRuntime,
    });
  },
);
