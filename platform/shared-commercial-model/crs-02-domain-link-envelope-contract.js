"use strict";

(function crs02DomainLinkEnvelopeModule(root, factory) {
  const api = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (root) root.ForgeCrs02DomainLinkEnvelopeContract = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function factory() {
  const CONTRACT_VERSION = "CRS-02-DOMAIN-LINK-001.1";
  const SCHEMA_VERSION = "forge.commercial_person_domain_link.v1";
  const CONTRACT_TYPE = "FORGE_COMMERCIAL_PERSON_DOMAIN_LINK";
  const MISSING_LINK_TYPE = "FORGE_MISSING_COMMERCIAL_PERSON_DOMAIN_LINK";

  const DOMAINS = Object.freeze([
    "PIPELINE",
    "ACTIVITY",
    "QUOTE",
    "APPLICATION",
    "CARTERA",
  ]);

  const RECORD_TYPES_BY_DOMAIN = Object.freeze({
    PIPELINE: Object.freeze(["PROSPECT", "OPPORTUNITY", "PIPELINE_EVENT"]),
    ACTIVITY: Object.freeze(["ACTIVITY_EVENT", "APPOINTMENT", "DUE_ACTION"]),
    QUOTE: Object.freeze(["QUOTE", "QUOTE_VERSION", "QUOTE_LIFECYCLE_EVENT"]),
    APPLICATION: Object.freeze([
      "APPLICATION",
      "APPLICATION_VERSION",
      "SIGNATURE_EVIDENCE",
      "APPLICATION_EVENT",
    ]),
    CARTERA: Object.freeze([
      "POLICY",
      "POLICY_VERSION",
      "POLICY_EVENT",
      "PAYMENT_EVENT",
      "SERVICE_EVENT",
      "RELATIONSHIP_MEMORY",
    ]),
  });

  const AUTHORITIES_BY_DOMAIN = Object.freeze({
    PIPELINE: Object.freeze([
      "PIPELINE_PROSPECT_AUTHORITY",
      "PIPELINE_OPPORTUNITY_AUTHORITY",
      "PIPELINE_STAGE_EVENT_AUTHORITY",
    ]),
    ACTIVITY: Object.freeze([
      "FES_ACTIVITY_EVENT_LEDGER",
      "FES_CANONICAL_ACTIVITY_TIMELINE",
    ]),
    QUOTE: Object.freeze([
      "QUOTE_LIFECYCLE_AUTHORITY",
      "QUOTE_PERSISTENCE_AUTHORITY",
    ]),
    APPLICATION: Object.freeze(["APPLICATION_AUTHORITY"]),
    CARTERA: Object.freeze([
      "CARTERA_POLICY_AUTHORITY",
      "CARTERA_PAYMENT_AUTHORITY",
      "CARTERA_SERVICE_AUTHORITY",
      "CARTERA_RELATIONSHIP_MEMORY_AUTHORITY",
    ]),
  });

  const PRIVACY_CLASSIFICATIONS = Object.freeze([
    "OPERATIONAL",
    "PRIVATE",
    "SENSITIVE",
    "RESTRICTED",
  ]);

  const MISSING_REASONS = Object.freeze([
    "PERSON_UNRESOLVED",
    "RELATIONSHIP_REFERENCE_UNAVAILABLE",
    "SOURCE_EVENT_UNAVAILABLE",
    "AUTHORITY_UNAVAILABLE",
  ]);

  const REPLAY_OUTCOMES = Object.freeze([
    "REPLAY_IDENTICAL",
    "DISTINCT_LINK",
    "CORRECTION_ACCEPTED",
  ]);

  const BOUNDARIES = Object.freeze({
    durableRelationshipEntityCreated: false,
    centralLinkLedgerCreated: false,
    authoritativePayloadCopied: false,
    personMutation: false,
    identityMutation: false,
    opportunityMutation: false,
    quoteMutation: false,
    applicationMutation: false,
    policyMutation: false,
    timelineMutation: false,
    databaseMutation: false,
    crmMutation: false,
    externalEffect: false,
    automaticBusinessAction: false,
  });

  class Crs02DomainLinkError extends TypeError {
    constructor(code, message, details = null) {
      super(message);
      this.name = "Crs02DomainLinkError";
      this.code = code;
      this.details = details;
    }
  }

  const fail = (code, message, details = null) => {
    throw new Crs02DomainLinkError(code, message, details);
  };
  const plain = value => Boolean(value) && typeof value === "object" &&
    !Array.isArray(value) && [Object.prototype, null].includes(Object.getPrototypeOf(value));
  const object = (value, code, label) => {
    if (!plain(value)) fail(code, `${label} debe ser un objeto.`);
    return value;
  };
  const exact = (value, allowed, code, label) => {
    const extras = Object.keys(value).filter(key => !allowed.includes(key)).sort();
    if (extras.length) fail(code, `${label} contiene campos no autorizados.`, { extras });
  };
  const opaque = (value, code, label, maximum = 240) => {
    const normalized = typeof value === "string" ? value.trim() : "";
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
    const normalized = typeof value === "string" ? value.trim().toUpperCase() : "";
    if (!allowed.includes(normalized)) {
      fail(code, `${label} no es válido.`, { allowed: [...allowed] });
    }
    return normalized;
  };
  const iso = (value, code, label) => {
    if (typeof value !== "string" || !value.trim() || Number.isNaN(Date.parse(value))) {
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

  function assertDomainSemantics(domain, recordType, authority) {
    if (!RECORD_TYPES_BY_DOMAIN[domain].includes(recordType)) {
      fail("CRS02_RECORD_TYPE_DOMAIN_MISMATCH", "El tipo de registro no pertenece al dominio.", {
        domain,
        recordType,
      });
    }
    if (!AUTHORITIES_BY_DOMAIN[domain].includes(authority)) {
      fail("CRS02_AUTHORITY_DOMAIN_MISMATCH", "La autoridad no pertenece al dominio.", {
        domain,
        authority,
      });
    }
  }

  function deriveRelationshipReference(input = {}) {
    object(input, "CRS02_RELATIONSHIP_DERIVATION_INPUT_REQUIRED", "La derivación de relación");
    exact(
      input,
      ["advisorReference", "personReference"],
      "CRS02_RELATIONSHIP_DERIVATION_KEYS_INVALID",
      "La derivación de relación",
    );
    const advisorReference = opaque(
      input.advisorReference,
      "CRS02_ADVISOR_REFERENCE_INVALID",
      "La referencia del asesor",
    );
    const personReference = opaque(
      input.personReference,
      "CRS02_PERSON_REFERENCE_INVALID",
      "La referencia de CommercialPerson",
    );
    return `relationship:${stableDigest({ advisorReference, personReference })}`;
  }

  function deriveCorrelationId(input = {}) {
    object(input, "CRS02_CORRELATION_DERIVATION_INPUT_REQUIRED", "La derivación de movimiento");
    exact(
      input,
      ["personReference", "movementReference"],
      "CRS02_CORRELATION_DERIVATION_KEYS_INVALID",
      "La derivación de movimiento",
    );
    const personReference = opaque(
      input.personReference,
      "CRS02_PERSON_REFERENCE_INVALID",
      "La referencia de CommercialPerson",
    );
    const movementReference = opaque(
      input.movementReference,
      "CRS02_MOVEMENT_REFERENCE_INVALID",
      "La referencia del movimiento comercial",
    );
    return `movement:${stableDigest({ personReference, movementReference })}`;
  }

  function createDomainLinkEnvelope(input = {}) {
    object(input, "CRS02_LINK_INPUT_REQUIRED", "El vínculo de dominio");
    exact(input, [
      "linkReference",
      "personReference",
      "relationshipReference",
      "correlationId",
      "domain",
      "recordType",
      "recordReference",
      "authority",
      "sourceEventReference",
      "effectiveAt",
      "recordedAt",
      "privacyClassification",
      "idempotencyKey",
      "correctionOf",
    ], "CRS02_LINK_INPUT_KEYS_INVALID", "El vínculo de dominio");

    const personReference = opaque(
      input.personReference,
      "CRS02_PERSON_REFERENCE_INVALID",
      "La referencia de CommercialPerson",
    );
    const relationshipReference = opaque(
      input.relationshipReference,
      "CRS02_RELATIONSHIP_REFERENCE_INVALID",
      "La referencia asesor-persona",
    );
    const correlationId = optionalOpaque(
      input.correlationId,
      "CRS02_CORRELATION_ID_INVALID",
      "La correlación del movimiento comercial",
    );
    const domain = oneOf(input.domain, DOMAINS, "CRS02_DOMAIN_INVALID", "El dominio");
    const recordType = oneOf(
      input.recordType,
      RECORD_TYPES_BY_DOMAIN[domain],
      "CRS02_RECORD_TYPE_INVALID",
      "El tipo de registro",
    );
    const authority = oneOf(
      input.authority,
      AUTHORITIES_BY_DOMAIN[domain],
      "CRS02_AUTHORITY_INVALID",
      "La autoridad",
    );
    assertDomainSemantics(domain, recordType, authority);

    const recordReference = opaque(
      input.recordReference,
      "CRS02_RECORD_REFERENCE_INVALID",
      "La referencia del registro",
    );
    const sourceEventReference = opaque(
      input.sourceEventReference,
      "CRS02_SOURCE_EVENT_REFERENCE_INVALID",
      "La referencia del evento o recibo fuente",
    );
    const effectiveAt = iso(input.effectiveAt, "CRS02_EFFECTIVE_AT_INVALID", "La fecha efectiva");
    const recordedAt = iso(input.recordedAt, "CRS02_RECORDED_AT_INVALID", "La fecha de registro");
    if (Date.parse(recordedAt) < Date.parse(effectiveAt)) {
      fail("CRS02_RECORDED_BEFORE_EFFECTIVE", "El vínculo no puede registrarse antes de su fecha efectiva.");
    }
    const privacyClassification = oneOf(
      input.privacyClassification,
      PRIVACY_CLASSIFICATIONS,
      "CRS02_PRIVACY_CLASSIFICATION_INVALID",
      "La clasificación de privacidad",
    );
    const idempotencyKey = opaque(
      input.idempotencyKey,
      "CRS02_IDEMPOTENCY_KEY_INVALID",
      "La llave de idempotencia",
      160,
    );
    const correctionOf = optionalOpaque(
      input.correctionOf,
      "CRS02_CORRECTION_OF_INVALID",
      "La referencia corregida",
    );

    const identity = {
      personReference,
      relationshipReference,
      correlationId,
      domain,
      recordType,
      recordReference,
      authority,
      sourceEventReference,
      effectiveAt,
      recordedAt,
      privacyClassification,
      idempotencyKey,
      correctionOf,
    };
    const linkReference = input.linkReference
      ? opaque(input.linkReference, "CRS02_LINK_REFERENCE_INVALID", "La referencia del vínculo")
      : `domain-link:${stableDigest({
          personReference,
          relationshipReference,
          domain,
          recordType,
          recordReference,
          sourceEventReference,
        })}`;
    if (correctionOf && correctionOf === linkReference) {
      fail("CRS02_CORRECTION_SELF_REFERENCE_FORBIDDEN", "Un vínculo no puede corregirse a sí mismo.");
    }

    const base = {
      contractType: CONTRACT_TYPE,
      contractVersion: CONTRACT_VERSION,
      schemaVersion: SCHEMA_VERSION,
      linkReference,
      ...identity,
    };
    return freeze({ ...base, linkDigest: stableDigest(base) });
  }

  function assertDomainLinkEnvelope(value) {
    object(value, "CRS02_LINK_OBJECT_REQUIRED", "El vínculo persistido");
    exact(value, [
      "contractType",
      "contractVersion",
      "schemaVersion",
      "linkReference",
      "personReference",
      "relationshipReference",
      "correlationId",
      "domain",
      "recordType",
      "recordReference",
      "authority",
      "sourceEventReference",
      "effectiveAt",
      "recordedAt",
      "privacyClassification",
      "idempotencyKey",
      "correctionOf",
      "linkDigest",
    ], "CRS02_LINK_OBJECT_KEYS_INVALID", "El vínculo persistido");
    if (value.contractType !== CONTRACT_TYPE || value.contractVersion !== CONTRACT_VERSION ||
      value.schemaVersion !== SCHEMA_VERSION) {
      fail("CRS02_LINK_CONTRACT_VERSION_INVALID", "La versión del vínculo no coincide.");
    }
    const normalized = createDomainLinkEnvelope({
      linkReference: value.linkReference,
      personReference: value.personReference,
      relationshipReference: value.relationshipReference,
      correlationId: value.correlationId,
      domain: value.domain,
      recordType: value.recordType,
      recordReference: value.recordReference,
      authority: value.authority,
      sourceEventReference: value.sourceEventReference,
      effectiveAt: value.effectiveAt,
      recordedAt: value.recordedAt,
      privacyClassification: value.privacyClassification,
      idempotencyKey: value.idempotencyKey,
      correctionOf: value.correctionOf,
    });
    if (normalized.linkDigest !== value.linkDigest) {
      fail("CRS02_LINK_DIGEST_MISMATCH", "El digest del vínculo no coincide.");
    }
    return normalized;
  }

  function createMissingDomainLink(input = {}) {
    object(input, "CRS02_MISSING_LINK_INPUT_REQUIRED", "El vínculo faltante");
    exact(input, [
      "missingLinkReference",
      "domain",
      "recordType",
      "recordReference",
      "authority",
      "sourceEventReference",
      "correlationId",
      "observedAt",
      "privacyClassification",
      "missingReason",
      "sourceIdentityReference",
      "idempotencyKey",
    ], "CRS02_MISSING_LINK_INPUT_KEYS_INVALID", "El vínculo faltante");

    const domain = oneOf(input.domain, DOMAINS, "CRS02_DOMAIN_INVALID", "El dominio");
    const recordType = oneOf(
      input.recordType,
      RECORD_TYPES_BY_DOMAIN[domain],
      "CRS02_RECORD_TYPE_INVALID",
      "El tipo de registro",
    );
    const authority = oneOf(
      input.authority,
      AUTHORITIES_BY_DOMAIN[domain],
      "CRS02_AUTHORITY_INVALID",
      "La autoridad",
    );
    assertDomainSemantics(domain, recordType, authority);
    const missingReason = oneOf(
      input.missingReason,
      MISSING_REASONS,
      "CRS02_MISSING_REASON_INVALID",
      "La razón de vínculo faltante",
    );
    const sourceEventReference = optionalOpaque(
      input.sourceEventReference,
      "CRS02_SOURCE_EVENT_REFERENCE_INVALID",
      "La referencia del evento o recibo fuente",
    );
    if (!sourceEventReference && missingReason !== "SOURCE_EVENT_UNAVAILABLE") {
      fail("CRS02_SOURCE_EVENT_REFERENCE_REQUIRED", "El vínculo faltante requiere referencia fuente.");
    }
    if (sourceEventReference && missingReason === "SOURCE_EVENT_UNAVAILABLE") {
      fail("CRS02_SOURCE_EVENT_CONTRADICTION", "La referencia fuente debe permanecer ausente.");
    }

    const base = {
      contractType: MISSING_LINK_TYPE,
      contractVersion: CONTRACT_VERSION,
      schemaVersion: SCHEMA_VERSION,
      domain,
      recordType,
      recordReference: opaque(
        input.recordReference,
        "CRS02_RECORD_REFERENCE_INVALID",
        "La referencia del registro",
      ),
      authority,
      sourceEventReference,
      correlationId: optionalOpaque(
        input.correlationId,
        "CRS02_CORRELATION_ID_INVALID",
        "La correlación del movimiento comercial",
      ),
      observedAt: iso(input.observedAt, "CRS02_OBSERVED_AT_INVALID", "La fecha observada"),
      privacyClassification: oneOf(
        input.privacyClassification,
        PRIVACY_CLASSIFICATIONS,
        "CRS02_PRIVACY_CLASSIFICATION_INVALID",
        "La clasificación de privacidad",
      ),
      missingReason,
      sourceIdentityReference: optionalOpaque(
        input.sourceIdentityReference,
        "CRS02_SOURCE_IDENTITY_REFERENCE_INVALID",
        "La identidad fuente",
      ),
      idempotencyKey: opaque(
        input.idempotencyKey,
        "CRS02_IDEMPOTENCY_KEY_INVALID",
        "La llave de idempotencia",
        160,
      ),
    };
    const missingLinkReference = input.missingLinkReference
      ? opaque(
          input.missingLinkReference,
          "CRS02_MISSING_LINK_REFERENCE_INVALID",
          "La referencia del vínculo faltante",
        )
      : `missing-domain-link:${stableDigest(base)}`;
    const withReference = { missingLinkReference, ...base };
    return freeze({ ...withReference, missingLinkDigest: stableDigest(withReference) });
  }

  function assertMissingDomainLink(value) {
    object(value, "CRS02_MISSING_LINK_OBJECT_REQUIRED", "El vínculo faltante persistido");
    exact(value, [
      "missingLinkReference",
      "contractType",
      "contractVersion",
      "schemaVersion",
      "domain",
      "recordType",
      "recordReference",
      "authority",
      "sourceEventReference",
      "correlationId",
      "observedAt",
      "privacyClassification",
      "missingReason",
      "sourceIdentityReference",
      "idempotencyKey",
      "missingLinkDigest",
    ], "CRS02_MISSING_LINK_OBJECT_KEYS_INVALID", "El vínculo faltante persistido");
    if (value.contractType !== MISSING_LINK_TYPE || value.contractVersion !== CONTRACT_VERSION ||
      value.schemaVersion !== SCHEMA_VERSION) {
      fail("CRS02_MISSING_LINK_CONTRACT_VERSION_INVALID", "La versión del vínculo faltante no coincide.");
    }
    const normalized = createMissingDomainLink({
      missingLinkReference: value.missingLinkReference,
      domain: value.domain,
      recordType: value.recordType,
      recordReference: value.recordReference,
      authority: value.authority,
      sourceEventReference: value.sourceEventReference,
      correlationId: value.correlationId,
      observedAt: value.observedAt,
      privacyClassification: value.privacyClassification,
      missingReason: value.missingReason,
      sourceIdentityReference: value.sourceIdentityReference,
      idempotencyKey: value.idempotencyKey,
    });
    if (normalized.missingLinkDigest !== value.missingLinkDigest) {
      fail("CRS02_MISSING_LINK_DIGEST_MISMATCH", "El digest del vínculo faltante no coincide.");
    }
    return normalized;
  }

  function reconcileDomainLinkReplay(previousValue, nextValue) {
    const previous = assertDomainLinkEnvelope(previousValue);
    const next = assertDomainLinkEnvelope(nextValue);
    if (previous.idempotencyKey === next.idempotencyKey) {
      if (previous.linkDigest !== next.linkDigest) {
        fail("CRS02_CHANGED_INPUT_REPLAY_CONFLICT", "La misma llave de idempotencia no puede cambiar el vínculo.");
      }
      return freeze({ outcome: "REPLAY_IDENTICAL", linkReference: previous.linkReference });
    }
    if (previous.linkReference === next.linkReference && previous.linkDigest !== next.linkDigest) {
      fail("CRS02_LINK_REFERENCE_CONFLICT", "La referencia del vínculo ya identifica otro contenido.");
    }
    const sameRecord = previous.domain === next.domain &&
      previous.recordType === next.recordType &&
      previous.recordReference === next.recordReference;
    if (sameRecord) {
      if (next.correctionOf !== previous.linkReference) {
        fail("CRS02_RECORD_LINK_CONFLICT", "El mismo registro requiere una corrección explícita para cambiar de vínculo.");
      }
      return freeze({
        outcome: "CORRECTION_ACCEPTED",
        linkReference: next.linkReference,
        correctionOf: previous.linkReference,
      });
    }
    return freeze({ outcome: "DISTINCT_LINK", linkReference: next.linkReference });
  }

  return freeze({
    CONTRACT_VERSION,
    SCHEMA_VERSION,
    CONTRACT_TYPE,
    MISSING_LINK_TYPE,
    DOMAINS,
    RECORD_TYPES_BY_DOMAIN,
    AUTHORITIES_BY_DOMAIN,
    PRIVACY_CLASSIFICATIONS,
    MISSING_REASONS,
    REPLAY_OUTCOMES,
    BOUNDARIES,
    Crs02DomainLinkError,
    stableStringify,
    stableDigest,
    deriveRelationshipReference,
    deriveCorrelationId,
    createDomainLinkEnvelope,
    assertDomainLinkEnvelope,
    createMissingDomainLink,
    assertMissingDomainLink,
    reconcileDomainLinkReplay,
  });
});
