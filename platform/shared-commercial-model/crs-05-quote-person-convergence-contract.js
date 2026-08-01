"use strict";

(function crs05QuotePersonConvergenceContractModule(root, factory) {
  const isCommonJs = typeof module !== "undefined" && module.exports;
  const quoteContract = isCommonJs
    ? require("../event-evidence/quote-lifecycle-event-contract.js")
    : root?.ForgeQuoteLifecycleEventContractCartera001B;
  const linkContract = isCommonJs
    ? require("./crs-02-domain-link-envelope-contract.js")
    : root?.ForgeCrs02DomainLinkEnvelopeContract;
  const acceptedRelationshipContract = isCommonJs
    ? require("./accepted-quote-cartera-relationship-contract.js")
    : root?.ForgeAcceptedQuoteCarteraRelationshipContract;
  const api = factory(quoteContract, linkContract, acceptedRelationshipContract);
  if (isCommonJs) module.exports = api;
  if (root) root.ForgeCrs05QuotePersonConvergenceContract = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function factory(
  quoteContract,
  linkContract,
  acceptedRelationshipContract,
) {
  const CONTRACT_VERSION = "CRS-05-QUOTE-PERSON-001.1";
  const SCHEMA_VERSION = "forge.quote_person_convergence.v1";
  const CONTRACT_TYPE = "FORGE_QUOTE_PERSON_CONVERGENCE";
  const IDENTITY_STATES = Object.freeze(["LINKED", "UNRESOLVED"]);
  const QUOTE_AUTHORITY = "QUOTE_PERSISTENCE_AUTHORITY";
  const REFERENCE_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,239}$/;

  class Crs05QuotePersonConvergenceError extends TypeError {
    constructor(code, message, details = null) {
      super(message);
      this.name = "Crs05QuotePersonConvergenceError";
      this.code = code;
      this.details = details;
    }
  }

  const fail = (code, message, details = null) => {
    throw new Crs05QuotePersonConvergenceError(code, message, details);
  };
  const plain = value => Boolean(value) && typeof value === "object" &&
    !Array.isArray(value) && [Object.prototype, null].includes(Object.getPrototypeOf(value));
  const record = (value, code, label) => {
    if (!plain(value)) fail(code, `${label} debe ser un objeto.`);
    return value;
  };
  const exact = (value, allowed, code, label) => {
    const extras = Object.keys(value).filter(key => !allowed.includes(key)).sort();
    if (extras.length) fail(code, `${label} contiene campos no autorizados.`, { extras });
  };
  const opaque = (value, code, label, maximum = 240) => {
    const normalized = typeof value === "string" ? value.trim() : "";
    if (!normalized || normalized.length > maximum || !REFERENCE_PATTERN.test(normalized)) {
      fail(code, `${label} no es válida.`);
    }
    return normalized;
  };
  const optionalOpaque = (value, code, label, maximum = 240) =>
    value === undefined || value === null || value === ""
      ? null
      : opaque(value, code, label, maximum);
  const iso = (value, code, label) => {
    if (typeof value !== "string" || Number.isNaN(Date.parse(value))) {
      fail(code, `${label} no es una fecha ISO válida.`);
    }
    return new Date(value).toISOString();
  };
  const oneOf = (value, allowed, code, label) => {
    const normalized = String(value || "").trim();
    if (!allowed.includes(normalized)) fail(code, `${label} no es válido.`, { allowed: [...allowed] });
    return normalized;
  };
  const refs = (value, code, label, minimum = 0) => {
    if (!Array.isArray(value) || value.length < minimum || value.length > 100) {
      fail(code, `${label} no es una lista válida.`);
    }
    const normalized = value.map(item => opaque(item, code, label));
    if (new Set(normalized).size !== normalized.length) fail(code, `${label} contiene duplicados.`);
    return normalized;
  };
  const freeze = value => {
    if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
    Object.freeze(value);
    Object.values(value).forEach(freeze);
    return value;
  };
  const stableValue = value => {
    if (Array.isArray(value)) return value.map(stableValue);
    if (!plain(value)) return value;
    return Object.fromEntries(Object.keys(value).sort().map(key => [key, stableValue(value[key])]));
  };
  const stableStringify = value => JSON.stringify(stableValue(value));
  function fnv1a32(text, seed) {
    let hash = seed >>> 0;
    for (let index = 0; index < text.length; index += 1) {
      hash ^= text.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0).toString(16).padStart(8, "0");
  }
  const stableDigest = value => {
    const text = typeof value === "string" ? value : stableStringify(value);
    return [0, 0x9e3779b9, 0x85ebca6b, 0xc2b2ae35]
      .map(mask => fnv1a32(text, 2166136261 ^ mask)).join("");
  };

  function requireDependencies() {
    if (!quoteContract?.EVENT_TYPES || !quoteContract?.EVENT_STATE_RULES) {
      fail("CRS05_QUOTE_CONTRACT_REQUIRED", "El contrato de ciclo de Quote no está disponible.");
    }
    if (!linkContract?.assertDomainLinkEnvelope || !linkContract?.assertMissingDomainLink) {
      fail("CRS05_LINK_CONTRACT_REQUIRED", "El contrato CRS 02 no está disponible.");
    }
  }

  function normalizeQuote(value) {
    record(value, "CRS05_QUOTE_REQUIRED", "La Quote autoritativa");
    exact(value, [
      "quoteReference",
      "advisorReference",
      "prospectReference",
      "productReference",
      "lifecycleState",
      "currentVersionNumber",
      "createdAt",
      "updatedAt",
      "persistenceReceiptReference",
    ], "CRS05_QUOTE_KEYS_INVALID", "La Quote autoritativa");
    const createdAt = iso(value.createdAt, "CRS05_QUOTE_CREATED_AT_INVALID", "La creación de Quote");
    const updatedAt = iso(value.updatedAt, "CRS05_QUOTE_UPDATED_AT_INVALID", "La actualización de Quote");
    if (Date.parse(updatedAt) < Date.parse(createdAt)) {
      fail("CRS05_QUOTE_TIME_ORDER_INVALID", "La actualización de Quote no puede preceder su creación.");
    }
    const currentVersionNumber = Number(value.currentVersionNumber);
    if (!Number.isSafeInteger(currentVersionNumber) || currentVersionNumber < 1) {
      fail("CRS05_QUOTE_VERSION_NUMBER_INVALID", "La versión actual de Quote no es válida.");
    }
    return freeze({
      quoteReference: opaque(value.quoteReference, "CRS05_QUOTE_REFERENCE_INVALID", "La referencia de Quote"),
      advisorReference: opaque(value.advisorReference, "CRS05_ADVISOR_REFERENCE_INVALID", "La referencia del asesor"),
      prospectReference: opaque(value.prospectReference, "CRS05_PROSPECT_REFERENCE_INVALID", "La referencia de Prospect"),
      productReference: opaque(value.productReference, "CRS05_PRODUCT_REFERENCE_INVALID", "La referencia de producto"),
      lifecycleState: oneOf(
        value.lifecycleState,
        quoteContract.LIFECYCLE_STATES,
        "CRS05_QUOTE_LIFECYCLE_STATE_INVALID",
        "El estado de Quote",
      ),
      currentVersionNumber,
      createdAt,
      updatedAt,
      persistenceReceiptReference: optionalOpaque(
        value.persistenceReceiptReference,
        "CRS05_PERSISTENCE_RECEIPT_INVALID",
        "El recibo durable de Quote",
      ),
    });
  }

  function normalizeVersion(value, quote) {
    record(value, "CRS05_QUOTE_VERSION_REQUIRED", "La versión autoritativa");
    exact(value, [
      "quoteVersionReference",
      "versionNumber",
      "snapshotDigest",
      "sourceRecordReference",
      "sourceEvidenceReferences",
      "freshnessStatus",
      "confirmationState",
      "createdAt",
      "printableArtifactReference",
      "calculationAuthorityReference",
    ], "CRS05_QUOTE_VERSION_KEYS_INVALID", "La versión autoritativa");
    const versionNumber = Number(value.versionNumber);
    if (!Number.isSafeInteger(versionNumber) || versionNumber < 1 || versionNumber !== quote.currentVersionNumber) {
      fail("CRS05_CURRENT_VERSION_MISMATCH", "La versión no coincide con la versión actual de Quote.");
    }
    return freeze({
      quoteVersionReference: opaque(
        value.quoteVersionReference,
        "CRS05_QUOTE_VERSION_REFERENCE_INVALID",
        "La referencia de Quote Version",
      ),
      versionNumber,
      snapshotDigest: opaque(value.snapshotDigest, "CRS05_SNAPSHOT_DIGEST_INVALID", "El digest del snapshot", 128),
      sourceRecordReference: opaque(
        value.sourceRecordReference,
        "CRS05_SOURCE_RECORD_REFERENCE_INVALID",
        "La referencia del registro fuente",
      ),
      sourceEvidenceReferences: refs(
        value.sourceEvidenceReferences,
        "CRS05_SOURCE_EVIDENCE_INVALID",
        "Las referencias de evidencia",
        1,
      ),
      freshnessStatus: opaque(value.freshnessStatus, "CRS05_FRESHNESS_STATUS_INVALID", "La frescura", 120),
      confirmationState: oneOf(
        value.confirmationState,
        ["CONFIRMED", "DISPUTED"],
        "CRS05_VERSION_CONFIRMATION_INVALID",
        "La confirmación de versión",
      ),
      createdAt: iso(value.createdAt, "CRS05_VERSION_CREATED_AT_INVALID", "La creación de versión"),
      printableArtifactReference: optionalOpaque(
        value.printableArtifactReference,
        "CRS05_PRINTABLE_REFERENCE_INVALID",
        "La referencia del PDF imprimible",
      ),
      calculationAuthorityReference: optionalOpaque(
        value.calculationAuthorityReference,
        "CRS05_CALCULATION_AUTHORITY_INVALID",
        "La autoridad de cálculo",
      ),
    });
  }

  function normalizeLifecycle(value, quote, version) {
    record(value, "CRS05_LIFECYCLE_REQUIRED", "El recibo de ciclo de Quote");
    exact(value, [
      "eventReference",
      "eventType",
      "lifecycleState",
      "previousLifecycleState",
      "quoteReference",
      "quoteVersionReference",
      "prospectReference",
      "productReference",
      "occurredAt",
      "recordedAt",
      "correctionOf",
      "applicationReference",
      "evidenceReferences",
    ], "CRS05_LIFECYCLE_KEYS_INVALID", "El recibo de ciclo de Quote");
    const eventType = oneOf(
      value.eventType,
      quoteContract.EVENT_TYPES,
      "CRS05_EVENT_TYPE_INVALID",
      "El tipo de evento de Quote",
    );
    const lifecycleState = oneOf(
      value.lifecycleState,
      quoteContract.LIFECYCLE_STATES,
      "CRS05_EVENT_STATE_INVALID",
      "El estado del evento",
    );
    if (quoteContract.EVENT_STATE_RULES[eventType] !== lifecycleState) {
      fail("CRS05_EVENT_STATE_MISMATCH", "El tipo de evento no corresponde a su estado.");
    }
    if (value.quoteReference !== quote.quoteReference ||
      value.quoteVersionReference !== version.quoteVersionReference ||
      value.prospectReference !== quote.prospectReference ||
      value.productReference !== quote.productReference) {
      fail("CRS05_QUOTE_LINEAGE_MISMATCH", "El evento no coincide con Quote, Version, Prospect y producto.");
    }
    if (quote.lifecycleState !== lifecycleState) {
      fail("CRS05_CURRENT_LIFECYCLE_MISMATCH", "El evento más reciente no coincide con el estado actual de Quote.");
    }
    const applicationReference = optionalOpaque(
      value.applicationReference,
      "CRS05_APPLICATION_REFERENCE_INVALID",
      "La referencia de Application",
    );
    if (eventType === "QUOTE_CONVERTED_TO_APPLICATION" && !applicationReference) {
      fail("CRS05_APPLICATION_REFERENCE_REQUIRED", "La conversión gobernada requiere referencia de Application.");
    }
    if (eventType !== "QUOTE_CONVERTED_TO_APPLICATION" && applicationReference) {
      fail("CRS05_APPLICATION_REFERENCE_NOT_ALLOWED", "Application sólo puede aparecer en conversión gobernada.");
    }
    const occurredAt = iso(value.occurredAt, "CRS05_EVENT_OCCURRED_AT_INVALID", "La ocurrencia del evento");
    const recordedAt = iso(value.recordedAt, "CRS05_EVENT_RECORDED_AT_INVALID", "El registro del evento");
    if (Date.parse(recordedAt) < Date.parse(occurredAt)) {
      fail("CRS05_EVENT_TIME_ORDER_INVALID", "El registro del evento no puede preceder su ocurrencia.");
    }
    return freeze({
      eventReference: opaque(value.eventReference, "CRS05_EVENT_REFERENCE_INVALID", "La referencia de evento"),
      eventType,
      lifecycleState,
      previousLifecycleState: value.previousLifecycleState == null
        ? null
        : oneOf(
            value.previousLifecycleState,
            quoteContract.LIFECYCLE_STATES,
            "CRS05_PREVIOUS_STATE_INVALID",
            "El estado anterior",
          ),
      quoteReference: quote.quoteReference,
      quoteVersionReference: version.quoteVersionReference,
      prospectReference: quote.prospectReference,
      productReference: quote.productReference,
      occurredAt,
      recordedAt,
      correctionOf: optionalOpaque(value.correctionOf, "CRS05_CORRECTION_OF_INVALID", "La referencia corregida"),
      applicationReference,
      evidenceReferences: refs(
        value.evidenceReferences,
        "CRS05_EVENT_EVIDENCE_INVALID",
        "Las referencias de evidencia del evento",
        1,
      ),
    });
  }

  function normalizeIdentity(value, quote) {
    record(value, "CRS05_IDENTITY_REQUIRED", "La identidad convergida");
    exact(value, [
      "state",
      "personReference",
      "sourceIdentityLinkReference",
      "identityDecisionReference",
      "matchStatus",
      "reason",
      "sourceIdentityReference",
    ], "CRS05_IDENTITY_KEYS_INVALID", "La identidad convergida");
    const state = oneOf(value.state, IDENTITY_STATES, "CRS05_IDENTITY_STATE_INVALID", "El estado de identidad");
    const sourceIdentityReference = optionalOpaque(
      value.sourceIdentityReference,
      "CRS05_SOURCE_IDENTITY_INVALID",
      "La identidad fuente",
    ) || quote.prospectReference;
    if (sourceIdentityReference !== quote.prospectReference) {
      fail("CRS05_PROSPECT_IDENTITY_MISMATCH", "Quote e identidad deben pertenecer al mismo Prospect.");
    }
    const personReference = optionalOpaque(value.personReference, "CRS05_PERSON_REFERENCE_INVALID", "La persona");
    const sourceIdentityLinkReference = optionalOpaque(
      value.sourceIdentityLinkReference,
      "CRS05_SOURCE_LINK_INVALID",
      "El vínculo fuente",
    );
    const identityDecisionReference = optionalOpaque(
      value.identityDecisionReference,
      "CRS05_IDENTITY_DECISION_INVALID",
      "La decisión de identidad",
    );
    if (state === "LINKED" && (!personReference || !sourceIdentityLinkReference || !identityDecisionReference)) {
      fail("CRS05_LINKED_IDENTITY_INCOMPLETE", "La identidad vinculada requiere persona, vínculo y decisión.");
    }
    if (state === "UNRESOLVED" && (personReference || sourceIdentityLinkReference || identityDecisionReference)) {
      fail("CRS05_UNRESOLVED_IDENTITY_CANNOT_CARRY_LINK", "La identidad no resuelta no puede llevar un vínculo parcial.");
    }
    return freeze({
      state,
      personReference,
      sourceIdentityLinkReference,
      identityDecisionReference,
      matchStatus: optionalOpaque(value.matchStatus, "CRS05_MATCH_STATUS_INVALID", "El estado de vínculo", 120),
      reason: optionalOpaque(value.reason, "CRS05_IDENTITY_REASON_INVALID", "La razón", 120) ||
        (state === "UNRESOLVED" ? "PERSON_UNRESOLVED" : null),
      sourceIdentityReference,
    });
  }

  function normalizeDomainLink(value, identity, quote, lifecycle) {
    const link = identity.state === "LINKED"
      ? linkContract.assertDomainLinkEnvelope(value)
      : linkContract.assertMissingDomainLink(value);
    if (link.domain !== "QUOTE" || link.recordType !== "QUOTE" ||
      link.recordReference !== quote.quoteReference || link.authority !== QUOTE_AUTHORITY ||
      link.sourceEventReference !== lifecycle.eventReference) {
      fail("CRS05_QUOTE_DOMAIN_LINK_MISMATCH", "El vínculo no corresponde a la Quote durable.");
    }
    if (identity.state === "LINKED" && link.personReference !== identity.personReference) {
      fail("CRS05_PERSON_LINK_MISMATCH", "La persona del vínculo no coincide con la identidad confirmada.");
    }
    if (identity.state === "UNRESOLVED" && link.correlationId) {
      fail("CRS05_UNRESOLVED_MOVEMENT_FORBIDDEN", "Una Quote sin persona confirmada no puede pertenecer a un movimiento.");
    }
    if (link.correlationId && !/^movement:[a-f0-9]{32}$/.test(link.correlationId)) {
      fail("CRS05_COMMERCIAL_MOVEMENT_INVALID", "El movimiento comercial debe derivarse mediante CRS 02.");
    }
    return link;
  }

  function normalizeAcceptedRelationship(value, quote, identity) {
    if (value === undefined || value === null) return null;
    if (!acceptedRelationshipContract?.assertAcceptedQuoteCarteraRelationship) {
      fail("CRS05_ACCEPTED_RELATIONSHIP_CONTRACT_REQUIRED", "El contrato Quote→Cartera no está disponible.");
    }
    const relationship = acceptedRelationshipContract.assertAcceptedQuoteCarteraRelationship(value);
    if (relationship.quoteLineage.quoteReference !== quote.quoteReference ||
      relationship.quoteLineage.quoteVersionReference !== quote.currentVersionReference &&
      relationship.quoteLineage.quoteVersionReference !== undefined) {
      fail("CRS05_ACCEPTED_RELATIONSHIP_QUOTE_MISMATCH", "El handoff no corresponde a la Quote convergida.");
    }
    if (identity.state === "LINKED" &&
      relationship.personLink.commercialPersonReference !== identity.personReference) {
      fail("CRS05_ACCEPTED_RELATIONSHIP_PERSON_MISMATCH", "El handoff no corresponde a la persona convergida.");
    }
    return relationship;
  }

  function createQuotePersonConvergence(input = {}) {
    requireDependencies();
    record(input, "CRS05_CONVERGENCE_INPUT_REQUIRED", "La convergencia de Quote");
    exact(input, [
      "quote",
      "version",
      "lifecycle",
      "identity",
      "domainLink",
      "acceptedQuoteRelationship",
    ], "CRS05_CONVERGENCE_KEYS_INVALID", "La convergencia de Quote");
    const quote = normalizeQuote(input.quote);
    const version = normalizeVersion(input.version, quote);
    const lifecycle = normalizeLifecycle(input.lifecycle, quote, version);
    const identity = normalizeIdentity(input.identity, quote);
    const domainLink = normalizeDomainLink(input.domainLink, identity, quote, lifecycle);
    const acceptedQuoteRelationship = input.acceptedQuoteRelationship == null
      ? null
      : acceptedRelationshipContract.assertAcceptedQuoteCarteraRelationship(input.acceptedQuoteRelationship);
    if (acceptedQuoteRelationship) {
      if (acceptedQuoteRelationship.quoteLineage.quoteReference !== quote.quoteReference ||
        acceptedQuoteRelationship.quoteLineage.quoteVersionReference !== version.quoteVersionReference) {
        fail("CRS05_ACCEPTED_RELATIONSHIP_QUOTE_MISMATCH", "El handoff no corresponde a Quote Version.");
      }
      if (identity.state === "LINKED" &&
        acceptedQuoteRelationship.personLink.commercialPersonReference !== identity.personReference) {
        fail("CRS05_ACCEPTED_RELATIONSHIP_PERSON_MISMATCH", "El handoff no corresponde a la persona.");
      }
    }

    const base = {
      contractType: CONTRACT_TYPE,
      contractVersion: CONTRACT_VERSION,
      schemaVersion: SCHEMA_VERSION,
      quoteAuthority: QUOTE_AUTHORITY,
      quote,
      version,
      lifecycle,
      identity,
      domainLink,
      acceptedQuoteRelationship,
      boundaries: freeze({
        quoteAcceptedIsApplication: false,
        quoteAcceptedIsPolicy: false,
        applicationReferenceObserved: lifecycle.applicationReference,
        applicationAuthorityRequired: true,
        policyAuthorityRequired: true,
        numericQuoteTruthCopied: false,
        pdfBytesCopied: false,
        productSpecificIdentityAdapter: false,
        automaticIdentityResolution: false,
        automaticApplicationCreation: false,
        automaticPolicyCreation: false,
        automaticQuoteMutation: false,
        automaticBusinessAction: false,
      }),
    };
    return freeze({ ...base, convergenceDigest: stableDigest(base) });
  }

  function assertQuotePersonConvergence(value) {
    record(value, "CRS05_CONVERGENCE_OBJECT_REQUIRED", "La convergencia persistida");
    const normalized = createQuotePersonConvergence({
      quote: value.quote,
      version: value.version,
      lifecycle: value.lifecycle,
      identity: value.identity,
      domainLink: value.domainLink,
      acceptedQuoteRelationship: value.acceptedQuoteRelationship,
    });
    if (value.contractType !== CONTRACT_TYPE || value.contractVersion !== CONTRACT_VERSION ||
      value.schemaVersion !== SCHEMA_VERSION || value.quoteAuthority !== QUOTE_AUTHORITY ||
      value.convergenceDigest !== normalized.convergenceDigest) {
      fail("CRS05_CONVERGENCE_DIGEST_OR_VERSION_MISMATCH", "La convergencia no coincide con el contrato.");
    }
    if (!plain(value.boundaries) || Object.values(value.boundaries).some((entry, index) =>
      index >= 2 && entry !== false && entry !== true && entry !== null)) {
      fail("CRS05_BOUNDARIES_INVALID", "Las fronteras de Quote no son válidas.");
    }
    return normalized;
  }

  return freeze({
    CONTRACT_VERSION,
    SCHEMA_VERSION,
    CONTRACT_TYPE,
    IDENTITY_STATES,
    QUOTE_AUTHORITY,
    Crs05QuotePersonConvergenceError,
    createQuotePersonConvergence,
    assertQuotePersonConvergence,
    stableDigest,
  });
});