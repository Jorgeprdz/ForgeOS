"use strict";

(function acceptedQuoteCarteraRelationshipModule(root, factory) {
  const api = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (root) root.ForgeAcceptedQuoteCarteraRelationshipContract = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function factory() {
  const CONTRACT_VERSION = "QUOTE-CARTERA-RELATION-001.1";
  const SCHEMA_VERSION = "forge.accepted_quote_cartera_relationship.v1";
  const CONTRACT_TYPE = "FORGE_ACCEPTED_QUOTE_CARTERA_RELATIONSHIP";

  const QUOTE_LIFECYCLE_STATES = Object.freeze([
    "REVIEWED",
    "PRESENTED",
    "PROSPECT_ACCEPTED",
    "CONVERTED_TO_APPLICATION",
  ]);
  const IDENTITY_OUTCOMES = Object.freeze([
    "UNRESOLVED",
    "LINK_CONFIRMED",
    "CREATE_CONFIRMED",
    "CORRECTED",
  ]);
  const POLICY_EVIDENCE_STATES = Object.freeze([
    "ABSENT",
    "ADMITTED",
    "REVIEW_PENDING",
    "REVIEWED",
    "DISPUTED",
  ]);
  const RELATIONSHIP_STATES = Object.freeze([
    "QUOTE_LINKED",
    "AWAITING_PERSON_CONFIRMATION",
    "AWAITING_POLICY_EVIDENCE",
    "POLICY_EVIDENCE_DISPUTED",
    "READY_FOR_POLICY_CONFIRMATION_REVIEW",
  ]);
  const NEXT_AUTHORITIES = Object.freeze({
    QUOTE_LINKED: "QUOTE_LIFECYCLE_AUTHORITY",
    AWAITING_PERSON_CONFIRMATION: "CARTERA_010B_IDENTITY_RESOLUTION",
    AWAITING_POLICY_EVIDENCE: "CARTERA_020B_POLICY_EVIDENCE_INTAKE",
    POLICY_EVIDENCE_DISPUTED: "CARTERA_020B_POLICY_EVIDENCE_REVIEW",
    READY_FOR_POLICY_CONFIRMATION_REVIEW: "CARTERA_020C_POLICY_CONFIRMATION_REVIEW",
  });
  const PROHIBITED_KEY_TOKENS = Object.freeze([
    "premium",
    "annualpremium",
    "suminsured",
    "sumassured",
    "coverage",
    "benefit",
    "calculation",
    "projection",
    "productintelligence",
    "nativeresult",
    "udi",
    "currencyconversion",
    "pdfbytes",
    "rawpdf",
    "base64",
    "blob",
  ]);
  const MUTATION_AUTHORIZATION = Object.freeze({
    quoteMutation: false,
    prospectMutation: false,
    personCreation: false,
    personMerge: false,
    policyCreation: false,
    policyConfirmation: false,
    carteraMutation: false,
    crmMutation: false,
    applicationCreation: false,
    externalEffect: false,
  });

  class AcceptedQuoteCarteraRelationshipError extends TypeError {
    constructor(code, message, details = null) {
      super(message);
      this.name = "AcceptedQuoteCarteraRelationshipError";
      this.code = code;
      this.details = details;
    }
  }

  const fail = (code, message, details = null) => {
    throw new AcceptedQuoteCarteraRelationshipError(code, message, details);
  };
  const plain = value => Boolean(value) && typeof value === "object" &&
    !Array.isArray(value) && [Object.prototype, null].includes(Object.getPrototypeOf(value));
  const object = (value, code, label) => {
    if (!plain(value)) fail(code, `${label} debe ser un objeto.`);
    return value;
  };
  const exact = (value, allowed, code, label) => {
    const extras = Object.keys(value).filter(key => !allowed.includes(key));
    if (extras.length) fail(code, `${label} contiene campos no autorizados.`, { extras: extras.sort() });
  };
  const opaque = (value, code, label, maximum = 240) => {
    const normalized = String(value || "").trim();
    if (!normalized || normalized.length > maximum ||
      !/^[A-Za-z0-9][A-Za-z0-9._:@/-]*$/.test(normalized)) {
      fail(code, `${label} no es válido.`);
    }
    return normalized;
  };
  const optionalOpaque = (value, code, label, maximum = 240) =>
    value === undefined || value === null || value === ""
      ? null
      : opaque(value, code, label, maximum);
  const oneOf = (value, allowed, code, label) => {
    const normalized = String(value || "").trim();
    if (!allowed.includes(normalized)) fail(code, `${label} no es válido.`, { allowed: [...allowed] });
    return normalized;
  };
  const iso = (value, code, label) => {
    if (typeof value !== "string" || !value.trim() || Number.isNaN(Date.parse(value))) {
      fail(code, `${label} no es una fecha ISO válida.`);
    }
    return new Date(value).toISOString();
  };
  const optionalIso = (value, code, label) =>
    value === undefined || value === null || value === "" ? null : iso(value, code, label);
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
    return Object.keys(value).sort().reduce((output, key) => {
      output[key] = stableValue(value[key]);
      return output;
    }, {});
  };
  const stableStringify = value => JSON.stringify(stableValue(value));
  const fnv1a32 = (text, seed) => {
    let hash = seed >>> 0;
    for (let index = 0; index < text.length; index += 1) {
      hash ^= text.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0).toString(16).padStart(8, "0");
  };
  const stableDigest = value => {
    const text = typeof value === "string" ? value : stableStringify(value);
    return [0, 0x9e3779b9, 0x85ebca6b, 0xc2b2ae35]
      .map(mask => fnv1a32(text, 2166136261 ^ mask)).join("");
  };
  const normalizeToken = value => String(value || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  const findProhibitedKeys = (value, path = "$") => {
    const findings = [];
    if (Array.isArray(value)) {
      value.forEach((entry, index) => findings.push(...findProhibitedKeys(entry, `${path}[${index}]`)));
      return findings;
    }
    if (!plain(value)) return findings;
    for (const [key, nested] of Object.entries(value)) {
      const nestedPath = `${path}.${key}`;
      const token = normalizeToken(key);
      if (PROHIBITED_KEY_TOKENS.some(prohibited => token.includes(prohibited))) findings.push(nestedPath);
      findings.push(...findProhibitedKeys(nested, nestedPath));
    }
    return [...new Set(findings)].sort();
  };

  function normalizeQuote(value) {
    object(value, "QUOTE_OBJECT_REQUIRED", "Quote");
    exact(value, [
      "durable",
      "quoteReference",
      "quoteVersionReference",
      "prospectReference",
      "productReference",
      "lifecycleState",
      "snapshotDigest",
      "eventReferences",
      "applicationReference",
      "persistenceReceiptReference",
    ], "QUOTE_KEYS_INVALID", "Quote");
    if (value.durable !== true) fail("DURABLE_QUOTE_REQUIRED", "La relación requiere una Quote durable.");
    const lifecycleState = oneOf(
      value.lifecycleState,
      QUOTE_LIFECYCLE_STATES,
      "QUOTE_LIFECYCLE_STATE_INVALID",
      "El estado de Quote",
    );
    const applicationReference = optionalOpaque(
      value.applicationReference,
      "APPLICATION_REFERENCE_INVALID",
      "La referencia de Application",
    );
    if (lifecycleState === "CONVERTED_TO_APPLICATION" && !applicationReference) {
      fail("APPLICATION_REFERENCE_REQUIRED", "La conversión requiere referencia de Application.");
    }
    if (lifecycleState !== "CONVERTED_TO_APPLICATION" && applicationReference) {
      fail("APPLICATION_REFERENCE_NOT_ALLOWED", "Application sólo se permite después de conversión gobernada.");
    }
    return {
      durable: true,
      quoteReference: opaque(value.quoteReference, "QUOTE_REFERENCE_INVALID", "La referencia de Quote"),
      quoteVersionReference: opaque(
        value.quoteVersionReference,
        "QUOTE_VERSION_REFERENCE_INVALID",
        "La referencia de Quote Version",
      ),
      prospectReference: opaque(
        value.prospectReference,
        "PROSPECT_REFERENCE_INVALID",
        "La referencia de Prospect",
      ),
      productReference: opaque(
        value.productReference,
        "PRODUCT_REFERENCE_INVALID",
        "La referencia de producto",
      ),
      lifecycleState,
      snapshotDigest: opaque(value.snapshotDigest, "SNAPSHOT_DIGEST_INVALID", "El digest del snapshot", 128),
      eventReferences: refs(value.eventReferences, "QUOTE_EVENT_REFERENCES_INVALID", "Las referencias de evento", 1),
      applicationReference,
      persistenceReceiptReference: optionalOpaque(
        value.persistenceReceiptReference,
        "PERSISTENCE_RECEIPT_REFERENCE_INVALID",
        "La referencia del recibo durable",
      ),
    };
  }

  function normalizeIdentity(value, quoteProspectReference) {
    object(value, "IDENTITY_OBJECT_REQUIRED", "La identidad");
    exact(value, [
      "outcome",
      "prospectReference",
      "commercialPersonReference",
      "decisionReference",
      "evidenceReferences",
    ], "IDENTITY_KEYS_INVALID", "La identidad");
    const outcome = oneOf(value.outcome, IDENTITY_OUTCOMES, "IDENTITY_OUTCOME_INVALID", "El resultado de identidad");
    const prospectReference = opaque(
      value.prospectReference,
      "IDENTITY_PROSPECT_REFERENCE_INVALID",
      "La referencia de Prospect de identidad",
    );
    if (prospectReference !== quoteProspectReference) {
      fail("QUOTE_PERSON_PROSPECT_MISMATCH", "Quote e identidad deben pertenecer al mismo Prospect.");
    }
    const commercialPersonReference = optionalOpaque(
      value.commercialPersonReference,
      "COMMERCIAL_PERSON_REFERENCE_INVALID",
      "La referencia de CommercialPerson",
    );
    const decisionReference = optionalOpaque(
      value.decisionReference,
      "IDENTITY_DECISION_REFERENCE_INVALID",
      "La referencia de decisión de identidad",
    );
    const confirmed = outcome !== "UNRESOLVED";
    if (confirmed && (!commercialPersonReference || !decisionReference)) {
      fail("CONFIRMED_PERSON_LINK_REQUIRED", "La identidad confirmada requiere persona y decisión verificables.");
    }
    if (!confirmed && (commercialPersonReference || decisionReference)) {
      fail("UNRESOLVED_PERSON_LINK_FORBIDDEN", "Una identidad no resuelta no puede enlazar una persona.");
    }
    return {
      outcome,
      prospectReference,
      commercialPersonReference,
      decisionReference,
      evidenceReferences: refs(
        value.evidenceReferences || [],
        "IDENTITY_EVIDENCE_REFERENCES_INVALID",
        "Las referencias de evidencia de identidad",
        confirmed ? 1 : 0,
      ),
    };
  }

  function normalizePolicyEvidence(value = {}) {
    object(value, "POLICY_EVIDENCE_OBJECT_REQUIRED", "La evidencia de póliza");
    exact(value, [
      "state",
      "packetReference",
      "evidenceReferences",
      "reviewedAt",
      "reviewReference",
    ], "POLICY_EVIDENCE_KEYS_INVALID", "La evidencia de póliza");
    const state = oneOf(
      value.state || "ABSENT",
      POLICY_EVIDENCE_STATES,
      "POLICY_EVIDENCE_STATE_INVALID",
      "El estado de evidencia de póliza",
    );
    const packetReference = optionalOpaque(
      value.packetReference,
      "POLICY_EVIDENCE_PACKET_REFERENCE_INVALID",
      "La referencia del paquete de evidencia",
    );
    const evidenceReferences = refs(
      value.evidenceReferences || [],
      "POLICY_EVIDENCE_REFERENCES_INVALID",
      "Las referencias de evidencia de póliza",
      state === "ABSENT" ? 0 : 1,
    );
    const reviewedAt = optionalIso(
      value.reviewedAt,
      "POLICY_EVIDENCE_REVIEWED_AT_INVALID",
      "La fecha de revisión de evidencia",
    );
    const reviewReference = optionalOpaque(
      value.reviewReference,
      "POLICY_EVIDENCE_REVIEW_REFERENCE_INVALID",
      "La referencia de revisión de evidencia",
    );
    if (state === "ABSENT" && (packetReference || evidenceReferences.length || reviewedAt || reviewReference)) {
      fail("ABSENT_POLICY_EVIDENCE_METADATA_FORBIDDEN", "Evidencia ausente no puede contener metadatos.");
    }
    if (state !== "ABSENT" && !packetReference) {
      fail("POLICY_EVIDENCE_PACKET_REQUIRED", "La evidencia requiere un paquete durable.");
    }
    if (["REVIEWED", "DISPUTED"].includes(state) && (!reviewedAt || !reviewReference)) {
      fail("POLICY_EVIDENCE_REVIEW_REQUIRED", "El estado revisado requiere recibo y fecha de revisión.");
    }
    if (!["REVIEWED", "DISPUTED"].includes(state) && (reviewedAt || reviewReference)) {
      fail("POLICY_EVIDENCE_REVIEW_NOT_ALLOWED", "El estado aún no revisado no puede declarar revisión.");
    }
    return { state, packetReference, evidenceReferences, reviewedAt, reviewReference };
  }

  function determineRelationshipState(quote, identity, policyEvidence) {
    if (["REVIEWED", "PRESENTED"].includes(quote.lifecycleState)) return "QUOTE_LINKED";
    if (identity.outcome === "UNRESOLVED") return "AWAITING_PERSON_CONFIRMATION";
    if (policyEvidence.state === "DISPUTED") return "POLICY_EVIDENCE_DISPUTED";
    if (policyEvidence.state !== "REVIEWED") return "AWAITING_POLICY_EVIDENCE";
    return "READY_FOR_POLICY_CONFIRMATION_REVIEW";
  }

  function createAcceptedQuoteCarteraRelationship(input = {}) {
    object(input, "RELATIONSHIP_INPUT_REQUIRED", "La relación");
    exact(input, [
      "relationReference",
      "advisorId",
      "actorReference",
      "createdAt",
      "quote",
      "identity",
      "policyEvidence",
    ], "RELATIONSHIP_INPUT_KEYS_INVALID", "La relación");
    const prohibited = findProhibitedKeys(input);
    if (prohibited.length) {
      fail(
        "QUOTE_CALCULATION_DATA_FORBIDDEN",
        "La relación no puede copiar cálculos ni verdad numérica de la cotización.",
        { paths: prohibited },
      );
    }

    const quote = normalizeQuote(input.quote);
    const identity = normalizeIdentity(input.identity, quote.prospectReference);
    const policyEvidence = normalizePolicyEvidence(input.policyEvidence || { state: "ABSENT" });
    const createdAt = iso(input.createdAt, "RELATIONSHIP_CREATED_AT_INVALID", "La fecha de relación");
    const state = determineRelationshipState(quote, identity, policyEvidence);
    const base = {
      contractType: CONTRACT_TYPE,
      schemaVersion: SCHEMA_VERSION,
      contractVersion: CONTRACT_VERSION,
      advisorId: opaque(input.advisorId, "ADVISOR_ID_INVALID", "El advisor"),
      actorReference: opaque(input.actorReference, "ACTOR_REFERENCE_INVALID", "El actor"),
      createdAt,
      state,
      quoteLineage: quote,
      personLink: identity,
      policyEvidence,
      nextAuthority: NEXT_AUTHORITIES[state],
      policyCandidateCreated: false,
      policyCreated: false,
      mutationAuthorization: { ...MUTATION_AUTHORIZATION },
    };
    const relationshipDigest = stableDigest(base);
    const relationReference = input.relationReference
      ? opaque(input.relationReference, "RELATION_REFERENCE_INVALID", "La referencia de relación")
      : `quote-cartera:${relationshipDigest}`;
    return freeze({ relationReference, ...base, relationshipDigest });
  }

  function assertAcceptedQuoteCarteraRelationship(value) {
    object(value, "RELATIONSHIP_OBJECT_REQUIRED", "La relación persistida");
    const normalized = createAcceptedQuoteCarteraRelationship({
      relationReference: value.relationReference,
      advisorId: value.advisorId,
      actorReference: value.actorReference,
      createdAt: value.createdAt,
      quote: value.quoteLineage,
      identity: value.personLink,
      policyEvidence: value.policyEvidence,
    });
    if (value.contractType !== CONTRACT_TYPE || value.schemaVersion !== SCHEMA_VERSION ||
      value.contractVersion !== CONTRACT_VERSION) {
      fail("RELATIONSHIP_CONTRACT_VERSION_INVALID", "La versión del contrato no coincide.");
    }
    if (value.state !== normalized.state || value.nextAuthority !== normalized.nextAuthority) {
      fail("RELATIONSHIP_STATE_MISMATCH", "El estado de la relación no coincide con su evidencia.");
    }
    if (value.relationshipDigest !== normalized.relationshipDigest) {
      fail("RELATIONSHIP_DIGEST_MISMATCH", "El digest de relación no coincide.");
    }
    if (value.policyCandidateCreated !== false || value.policyCreated !== false) {
      fail("AUTOMATIC_POLICY_CREATION_FORBIDDEN", "La relación no puede crear una Policy.");
    }
    if (stableStringify(value.mutationAuthorization) !== stableStringify(MUTATION_AUTHORIZATION)) {
      fail("MUTATION_AUTHORIZATION_MISMATCH", "La relación no puede ampliar permisos de mutación.");
    }
    return normalized;
  }

  function canEnterPolicyConfirmationReview(value) {
    const normalized = assertAcceptedQuoteCarteraRelationship(value);
    return normalized.state === "READY_FOR_POLICY_CONFIRMATION_REVIEW";
  }

  return freeze({
    CONTRACT_VERSION,
    SCHEMA_VERSION,
    CONTRACT_TYPE,
    QUOTE_LIFECYCLE_STATES,
    IDENTITY_OUTCOMES,
    POLICY_EVIDENCE_STATES,
    RELATIONSHIP_STATES,
    NEXT_AUTHORITIES,
    PROHIBITED_KEY_TOKENS,
    MUTATION_AUTHORIZATION,
    AcceptedQuoteCarteraRelationshipError,
    stableStringify,
    stableDigest,
    findProhibitedKeys,
    createAcceptedQuoteCarteraRelationship,
    assertAcceptedQuoteCarteraRelationship,
    canEnterPolicyConfirmationReview,
  });
});
