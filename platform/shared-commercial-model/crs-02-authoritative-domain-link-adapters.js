"use strict";

(function crs02AuthoritativeDomainLinkAdaptersModule(root, factory) {
  const isCommonJs = typeof module !== "undefined" && module.exports;
  const linkContract = isCommonJs
    ? require("./crs-02-domain-link-envelope-contract.js")
    : root?.ForgeCrs02DomainLinkEnvelopeContract;
  const activityContract = isCommonJs
    ? require("../event-evidence/canonical-activity-event-contract.js")
    : root?.ForgeCanonicalActivityEventContractFES01;
  const quoteContract = isCommonJs
    ? require("../event-evidence/quote-lifecycle-event-contract.js")
    : root?.ForgeQuoteLifecycleEventContractCartera001B;
  const quoteCarteraContract = isCommonJs
    ? require("./accepted-quote-cartera-relationship-contract.js")
    : root?.ForgeAcceptedQuoteCarteraRelationshipContract;
  const api = factory(linkContract, activityContract, quoteContract, quoteCarteraContract);
  if (isCommonJs) module.exports = api;
  if (root) root.ForgeCrs02AuthoritativeDomainLinkAdapters = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function factory(
  linkContract,
  activityContract,
  quoteContract,
  quoteCarteraContract,
) {
  const ADAPTER_VERSION = "CRS-02-DOMAIN-LINK-ADAPTERS-001.1";
  const REFERENCE_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,239}$/;

  class Crs02DomainLinkAdapterError extends TypeError {
    constructor(code, message, details = null) {
      super(message);
      this.name = "Crs02DomainLinkAdapterError";
      this.code = code;
      this.details = details;
    }
  }

  const fail = (code, message, details = null) => {
    throw new Crs02DomainLinkAdapterError(code, message, details);
  };
  const record = (value, code, label) => {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      fail(code, `${label} debe ser un objeto.`);
    }
    return value;
  };
  const exact = (value, allowed, code, label) => {
    const extras = Object.keys(value).filter(key => !allowed.includes(key)).sort();
    if (extras.length) fail(code, `${label} contiene campos no autorizados.`, { extras });
  };
  const reference = (value, code, label, maximum = 240) => {
    const normalized = typeof value === "string" ? value.trim() : "";
    if (!normalized || normalized.length > maximum || !REFERENCE_PATTERN.test(normalized)) {
      fail(code, `${label} no es válida.`);
    }
    return normalized;
  };
  const optionalReference = (value, code, label, maximum = 240) =>
    value === undefined || value === null || value === ""
      ? null
      : reference(value, code, label, maximum);
  const iso = (value, code, label) => {
    if (typeof value !== "string" || Number.isNaN(Date.parse(value))) {
      fail(code, `${label} no es una fecha ISO válida.`);
    }
    return new Date(value).toISOString();
  };
  const freeze = value => {
    if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
    Object.freeze(value);
    Object.values(value).forEach(freeze);
    return value;
  };

  function requireLinkContract() {
    if (!linkContract?.createDomainLinkEnvelope || !linkContract?.createMissingDomainLink) {
      fail("CRS02_LINK_CONTRACT_REQUIRED", "El contrato común de vínculos no está disponible.");
    }
    return linkContract;
  }

  function normalizeContext(input = {}) {
    record(input, "CRS02_IDENTITY_CONTEXT_REQUIRED", "El contexto de identidad");
    exact(input, [
      "advisorReference",
      "personReference",
      "relationshipReference",
      "correlationId",
      "sourceIdentityReference",
      "privacyClassification",
      "correctionOf",
      "sourceEventReference",
    ], "CRS02_IDENTITY_CONTEXT_KEYS_INVALID", "El contexto de identidad");
    return freeze({
      advisorReference: optionalReference(
        input.advisorReference,
        "CRS02_ADVISOR_REFERENCE_INVALID",
        "La referencia del asesor",
      ),
      personReference: optionalReference(
        input.personReference,
        "CRS02_PERSON_REFERENCE_INVALID",
        "La referencia de CommercialPerson",
      ),
      relationshipReference: optionalReference(
        input.relationshipReference,
        "CRS02_RELATIONSHIP_REFERENCE_INVALID",
        "La referencia asesor-persona",
      ),
      correlationId: optionalReference(
        input.correlationId,
        "CRS02_CORRELATION_ID_INVALID",
        "La correlación del movimiento comercial",
      ),
      sourceIdentityReference: optionalReference(
        input.sourceIdentityReference,
        "CRS02_SOURCE_IDENTITY_REFERENCE_INVALID",
        "La identidad fuente",
      ),
      privacyClassification: input.privacyClassification == null
        ? null
        : String(input.privacyClassification).trim().toUpperCase(),
      correctionOf: optionalReference(
        input.correctionOf,
        "CRS02_CORRECTION_OF_INVALID",
        "La referencia corregida",
      ),
      sourceEventReference: optionalReference(
        input.sourceEventReference,
        "CRS02_SOURCE_EVENT_REFERENCE_INVALID",
        "La referencia del evento fuente",
      ),
    });
  }

  function resolveRelationshipReference(context) {
    if (context.relationshipReference) return context.relationshipReference;
    if (!context.advisorReference) {
      fail(
        "CRS02_ADVISOR_REFERENCE_REQUIRED",
        "La derivación del vínculo asesor-persona requiere advisorReference.",
      );
    }
    return requireLinkContract().deriveRelationshipReference({
      advisorReference: context.advisorReference,
      personReference: context.personReference,
    });
  }

  function normalizeAuthorityReceipt(input = {}) {
    record(input, "CRS02_AUTHORITY_RECEIPT_REQUIRED", "El recibo de autoridad");
    exact(input, [
      "authoritative",
      "domain",
      "recordType",
      "recordReference",
      "authority",
      "sourceEventReference",
      "effectiveAt",
      "recordedAt",
      "privacyClassification",
      "idempotencyKey",
    ], "CRS02_AUTHORITY_RECEIPT_KEYS_INVALID", "El recibo de autoridad");
    if (input.authoritative !== true) {
      fail("CRS02_AUTHORITATIVE_RECEIPT_REQUIRED", "El adaptador requiere un recibo autoritativo explícito.");
    }
    return freeze({
      authoritative: true,
      domain: String(input.domain || "").trim().toUpperCase(),
      recordType: String(input.recordType || "").trim().toUpperCase(),
      recordReference: reference(
        input.recordReference,
        "CRS02_RECORD_REFERENCE_INVALID",
        "La referencia del registro",
      ),
      authority: String(input.authority || "").trim().toUpperCase(),
      sourceEventReference: reference(
        input.sourceEventReference,
        "CRS02_SOURCE_EVENT_REFERENCE_INVALID",
        "La referencia del evento o recibo fuente",
      ),
      effectiveAt: iso(input.effectiveAt, "CRS02_EFFECTIVE_AT_INVALID", "La fecha efectiva"),
      recordedAt: iso(input.recordedAt, "CRS02_RECORDED_AT_INVALID", "La fecha de registro"),
      privacyClassification: String(input.privacyClassification || "").trim().toUpperCase(),
      idempotencyKey: reference(
        input.idempotencyKey,
        "CRS02_IDEMPOTENCY_KEY_INVALID",
        "La llave de idempotencia",
        160,
      ),
    });
  }

  function createFromNormalizedReceipt(receipt, contextInput = {}) {
    const context = normalizeContext(contextInput);
    const common = requireLinkContract();
    if (!context.personReference) {
      return common.createMissingDomainLink({
        domain: receipt.domain,
        recordType: receipt.recordType,
        recordReference: receipt.recordReference,
        authority: receipt.authority,
        sourceEventReference: receipt.sourceEventReference,
        correlationId: context.correlationId,
        observedAt: receipt.recordedAt,
        privacyClassification: context.privacyClassification || receipt.privacyClassification,
        missingReason: "PERSON_UNRESOLVED",
        sourceIdentityReference: context.sourceIdentityReference,
        idempotencyKey: receipt.idempotencyKey,
      });
    }
    return common.createDomainLinkEnvelope({
      personReference: context.personReference,
      relationshipReference: resolveRelationshipReference(context),
      correlationId: context.correlationId,
      domain: receipt.domain,
      recordType: receipt.recordType,
      recordReference: receipt.recordReference,
      authority: receipt.authority,
      sourceEventReference: receipt.sourceEventReference,
      effectiveAt: receipt.effectiveAt,
      recordedAt: receipt.recordedAt,
      privacyClassification: context.privacyClassification || receipt.privacyClassification,
      idempotencyKey: receipt.idempotencyKey,
      correctionOf: context.correctionOf,
    });
  }

  function fromAuthoritativeReceipt(receiptInput = {}, contextInput = {}) {
    return createFromNormalizedReceipt(normalizeAuthorityReceipt(receiptInput), contextInput);
  }

  function fromCanonicalActivityEvent(eventInput, contextInput = {}) {
    if (!activityContract?.assertCanonicalActivityEvent) {
      fail("CRS02_ACTIVITY_CONTRACT_REQUIRED", "El contrato FES de Activity no está disponible.");
    }
    const event = activityContract.assertCanonicalActivityEvent(eventInput);
    const context = normalizeContext(contextInput);
    const subjectType = event.subject.type;
    const recordType = subjectType === "APPOINTMENT"
      ? "APPOINTMENT"
      : subjectType === "DUE_ACTION"
        ? "DUE_ACTION"
        : "ACTIVITY_EVENT";
    const recordReference = recordType === "ACTIVITY_EVENT"
      ? event.event_id
      : event.subject.id;
    return createFromNormalizedReceipt(normalizeAuthorityReceipt({
      authoritative: true,
      domain: "ACTIVITY",
      recordType,
      recordReference,
      authority: "FES_ACTIVITY_EVENT_LEDGER",
      sourceEventReference: event.event_id,
      effectiveAt: event.occurred_at,
      recordedAt: event.recorded_at,
      privacyClassification: event.privacy_class,
      idempotencyKey: `crs02-activity:${event.event_id}`,
    }), {
      ...context,
      sourceIdentityReference: context.sourceIdentityReference ||
        (event.subject.type === "PROSPECT" ? event.subject.id : null),
    });
  }

  function fromQuoteLifecycleEvent(eventInput, contextInput = {}) {
    if (!quoteContract?.assertQuoteLifecycleEvent) {
      fail("CRS02_QUOTE_CONTRACT_REQUIRED", "El contrato de ciclo de Quote no está disponible.");
    }
    const event = quoteContract.assertQuoteLifecycleEvent(eventInput);
    const context = normalizeContext(contextInput);
    return createFromNormalizedReceipt(normalizeAuthorityReceipt({
      authoritative: true,
      domain: "QUOTE",
      recordType: "QUOTE",
      recordReference: event.payload.quote_reference,
      authority: "QUOTE_LIFECYCLE_AUTHORITY",
      sourceEventReference: event.event_id,
      effectiveAt: event.occurred_at,
      recordedAt: event.recorded_at,
      privacyClassification: event.privacy_class,
      idempotencyKey: `crs02-quote:${event.event_id}`,
    }), {
      ...context,
      sourceIdentityReference: context.sourceIdentityReference || event.payload.prospect_reference,
    });
  }

  function fromAcceptedQuoteCarteraRelationship(value, contextInput = {}) {
    if (!quoteCarteraContract?.assertAcceptedQuoteCarteraRelationship) {
      fail("CRS02_QUOTE_CARTERA_CONTRACT_REQUIRED", "El contrato Quote-Cartera no está disponible.");
    }
    const relationship = quoteCarteraContract.assertAcceptedQuoteCarteraRelationship(value);
    const context = normalizeContext(contextInput);
    const eventReferences = relationship.quoteLineage.eventReferences || [];
    const sourceEventReference = context.sourceEventReference || eventReferences.at(-1) || null;
    if (!sourceEventReference) {
      fail("CRS02_QUOTE_SOURCE_EVENT_REQUIRED", "La relación Quote-Cartera requiere un evento fuente.");
    }
    return createFromNormalizedReceipt(normalizeAuthorityReceipt({
      authoritative: true,
      domain: "QUOTE",
      recordType: "QUOTE",
      recordReference: relationship.quoteLineage.quoteReference,
      authority: "QUOTE_PERSISTENCE_AUTHORITY",
      sourceEventReference,
      effectiveAt: relationship.createdAt,
      recordedAt: relationship.createdAt,
      privacyClassification: context.privacyClassification || "PRIVATE",
      idempotencyKey: `crs02-quote-cartera:${relationship.relationshipDigest}`,
    }), {
      ...context,
      advisorReference: context.advisorReference || relationship.advisorId,
      personReference: context.personReference || relationship.personLink.commercialPersonReference,
      sourceIdentityReference: context.sourceIdentityReference || relationship.quoteLineage.prospectReference,
    });
  }

  return freeze({
    ADAPTER_VERSION,
    Crs02DomainLinkAdapterError,
    normalizeAuthorityReceipt,
    fromAuthoritativeReceipt,
    fromCanonicalActivityEvent,
    fromQuoteLifecycleEvent,
    fromAcceptedQuoteCarteraRelationship,
    diagnostics: () => freeze({
      adapterVersion: ADAPTER_VERSION,
      sourceCorrelationReinterpretedAsCommercialMovement: false,
      durableRelationshipEntityCreated: false,
      centralLinkLedgerCreated: false,
      authoritativePayloadCopied: false,
      automaticListeners: false,
      automaticRpc: false,
      automaticPersistence: false,
      automaticBusinessAction: false,
    }),
  });
});
