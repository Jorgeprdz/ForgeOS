"use strict";

(function (root, factory) {
  const api = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (root) root.ForgeCrs09PersonWorkspaceContract = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  const CONTRACT_TYPE = "FORGE_PRODUCTIVE_PERSON_WORKSPACE";
  const CONTRACT_VERSION = "CRS-09-PRODUCTIVE-PERSON-WORKSPACE-001.1";
  const SCHEMA_VERSION = "forge.productive_person_workspace.v1";
  const PRIVACY_CLASSIFICATIONS = Object.freeze(["OPERATIONAL", "PRIVATE", "SENSITIVE", "RESTRICTED"]);
  const SOURCE_STATUSES = Object.freeze(["AVAILABLE", "EMPTY", "DEGRADED", "UNAVAILABLE"]);
  const SECTION_IDS = Object.freeze([
    "IDENTITY",
    "OPPORTUNITIES",
    "COMMITMENTS",
    "INTERACTIONS",
    "QUOTES",
    "APPLICATIONS",
    "POLICIES",
    "TIMELINE",
  ]);
  const SECTION_AUTHORITIES = Object.freeze({
    IDENTITY: "CARTERA_010B_COMMERCIAL_PERSON",
    OPPORTUNITIES: "PIPELINE_PROSPECT_AUTHORITY",
    COMMITMENTS: "FES_ACTIVITY_EVENT_LEDGER",
    INTERACTIONS: "FES_ACTIVITY_EVENT_LEDGER",
    QUOTES: "QUOTE_LIFECYCLE_AUTHORITY",
    APPLICATIONS: "APPLICATION_AUTHORITY",
    POLICIES: "CARTERA_POLICY_AUTHORITY",
    TIMELINE: "CRS_08_UNIFIED_PERSON_TIMELINE_READ_MODEL",
  });
  const PROHIBITED_KEYS = Object.freeze([
    "phone", "phoneNumber", "phone_number", "whatsapp", "email", "address", "street",
    "postalCode", "curp", "rfc", "medical", "health", "diagnosis", "bank", "bankAccount",
    "accountNumber", "clabe", "signature", "signatureImage", "biometric", "documentBytes",
    "rawPayload", "providerPayload", "transcript", "messageText", "rawMessage", "notes",
    "rawNotes", "password", "secret", "accessToken", "refreshToken", "authToken", "policyNumber",
  ]);

  const WORKSPACE_KEYS = Object.freeze([
    "advisorReference", "person", "relationshipReference", "builtAt", "sections", "sourceHealth",
  ]);
  const PERSON_KEYS = Object.freeze([
    "personReference", "displayName", "lifecycleState", "privacyClassification",
  ]);
  const SECTION_KEYS = Object.freeze(["id", "status", "reason", "items"]);
  const ITEM_KEYS = Object.freeze([
    "reference", "recordType", "label", "summary", "state", "authority", "occurredAt",
    "effectiveAt", "privacyClassification", "confirmationState", "attentionRequired", "deepLink",
    "sourceDomain", "sourceEventReference", "correlationId", "facts",
  ]);

  class Crs09PersonWorkspaceError extends TypeError {
    constructor(code, message, details = null) {
      super(message);
      this.name = "Crs09PersonWorkspaceError";
      this.code = code;
      this.details = details;
    }
  }

  const fail = (code, message, details = null) => {
    throw new Crs09PersonWorkspaceError(code, message, details);
  };
  const isObject = value => {
    if (!value || typeof value !== "object" || Array.isArray(value)) return false;
    const prototype = Object.getPrototypeOf(value);
    return prototype === Object.prototype || prototype === null;
  };
  const clone = value => value === undefined ? undefined : JSON.parse(JSON.stringify(value));
  const freeze = value => {
    if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
    Object.freeze(value);
    Object.values(value).forEach(freeze);
    return value;
  };
  const stableValue = value => {
    if (Array.isArray(value)) return value.map(stableValue);
    if (!isObject(value)) return value;
    return Object.fromEntries(Object.keys(value).sort().map(key => [key, stableValue(value[key])]));
  };
  const stableStringify = value => JSON.stringify(stableValue(value));
  const digest = value => {
    const text = typeof value === "string" ? value : stableStringify(value);
    let hash = 2166136261;
    for (let index = 0; index < text.length; index += 1) {
      hash ^= text.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0).toString(16).padStart(8, "0");
  };
  const requiredText = (value, code, label, maximum = 240) => {
    const normalized = typeof value === "string" ? value.trim() : "";
    if (!normalized || normalized.length > maximum) fail(code, `${label} es obligatoria.`);
    return normalized;
  };
  const optionalText = (value, maximum = 500) => {
    if (value === null || value === undefined || value === "") return null;
    const normalized = String(value).trim();
    if (!normalized || normalized.length > maximum) fail("CRS09_TEXT_INVALID", "El texto opcional no es válido.");
    return normalized;
  };
  const iso = (value, code, label) => {
    if (value === null || value === undefined || value === "") return null;
    if (typeof value !== "string" || Number.isNaN(Date.parse(value))) fail(code, `${label} no es una fecha válida.`);
    return new Date(value).toISOString();
  };
  const assertEnum = (value, allowed, code, label) => {
    const normalized = requiredText(value, code, label).toUpperCase();
    if (!allowed.includes(normalized)) fail(code, `${label} no es válido.`, { value: normalized });
    return normalized;
  };
  const assertKeys = (value, allowed, code, label) => {
    if (!isObject(value)) fail(code, `${label} debe ser un objeto.`);
    const unsupported = Object.keys(value).filter(key => !allowed.includes(key)).sort();
    if (unsupported.length) fail(code, `${label} contiene campos no autorizados.`, { unsupportedKeys: unsupported });
  };
  const scanProhibited = (value, path = "facts") => {
    if (Array.isArray(value)) {
      value.forEach((item, index) => scanProhibited(item, `${path}[${index}]`));
      return;
    }
    if (!isObject(value)) return;
    for (const [key, nested] of Object.entries(value)) {
      if (PROHIBITED_KEYS.includes(key)) {
        fail("CRS09_SENSITIVE_COPY_FORBIDDEN", "El workspace no puede copiar payload sensible ni verdad de dominio.", {
          path: `${path}.${key}`,
        });
      }
      scanProhibited(nested, `${path}.${key}`);
    }
  };
  const normalizeFacts = value => {
    if (value === null || value === undefined) return {};
    if (!isObject(value)) fail("CRS09_FACTS_INVALID", "Los hechos mínimos deben ser un objeto.");
    scanProhibited(value);
    const normalized = stableValue(clone(value));
    if (stableStringify(normalized).length > 2500) fail("CRS09_FACTS_TOO_LARGE", "Los hechos exceden el límite permitido.");
    return normalized;
  };
  const normalizeDeepLink = value => {
    const link = requiredText(value, "CRS09_DEEP_LINK_REQUIRED", "El deep link", 500);
    if (!link.startsWith("?nav=") || link.includes("javascript:") || link.includes("//")) {
      fail("CRS09_DEEP_LINK_INVALID", "El deep link debe permanecer dentro del shell ForgeOS.", { link });
    }
    return link;
  };

  function normalizeItem(input = {}, sectionId) {
    assertKeys(input, ITEM_KEYS, "CRS09_ITEM_FIELDS_INVALID", `El elemento ${sectionId}`);
    const privacyClassification = assertEnum(
      input.privacyClassification || "PRIVATE",
      PRIVACY_CLASSIFICATIONS,
      "CRS09_ITEM_PRIVACY_INVALID",
      "La privacidad del elemento",
    );
    return freeze({
      reference: requiredText(input.reference, "CRS09_ITEM_REFERENCE_REQUIRED", "La referencia del elemento"),
      recordType: requiredText(input.recordType, "CRS09_ITEM_RECORD_TYPE_REQUIRED", "El tipo de registro", 120),
      label: requiredText(input.label, "CRS09_ITEM_LABEL_REQUIRED", "La etiqueta", 180),
      summary: optionalText(input.summary, 500),
      state: optionalText(input.state, 120),
      authority: requiredText(
        input.authority || SECTION_AUTHORITIES[sectionId],
        "CRS09_ITEM_AUTHORITY_REQUIRED",
        "La autoridad",
        180,
      ),
      occurredAt: iso(input.occurredAt, "CRS09_ITEM_OCCURRED_AT_INVALID", "occurredAt"),
      effectiveAt: iso(input.effectiveAt, "CRS09_ITEM_EFFECTIVE_AT_INVALID", "effectiveAt"),
      privacyClassification,
      confirmationState: optionalText(input.confirmationState, 60),
      attentionRequired: input.attentionRequired === true,
      deepLink: normalizeDeepLink(input.deepLink),
      sourceDomain: optionalText(input.sourceDomain, 60),
      sourceEventReference: optionalText(input.sourceEventReference, 240),
      correlationId: optionalText(input.correlationId, 240),
      facts: freeze(normalizeFacts(input.facts)),
    });
  }

  function normalizeSection(input = {}, expectedId) {
    assertKeys(input, SECTION_KEYS, "CRS09_SECTION_FIELDS_INVALID", `La sección ${expectedId}`);
    const id = assertEnum(input.id || expectedId, SECTION_IDS, "CRS09_SECTION_ID_INVALID", "La sección");
    if (id !== expectedId) fail("CRS09_SECTION_ORDER_INVALID", "La sección no coincide con su posición.");
    const status = assertEnum(input.status || "UNAVAILABLE", SOURCE_STATUSES, "CRS09_SECTION_STATUS_INVALID", "El estado de sección");
    const items = Array.isArray(input.items) ? input.items.map(item => normalizeItem(item, id)) :
      fail("CRS09_SECTION_ITEMS_INVALID", "Los elementos de sección deben ser una lista.");
    if (status === "EMPTY" && items.length) fail("CRS09_EMPTY_SECTION_WITH_ITEMS", "Una sección EMPTY no puede contener elementos.");
    if (status === "AVAILABLE" && !items.length && id !== "IDENTITY") {
      fail("CRS09_AVAILABLE_SECTION_EMPTY", "Una sección AVAILABLE debe contener elementos.");
    }
    return freeze({
      id,
      authority: SECTION_AUTHORITIES[id],
      status,
      reason: optionalText(input.reason, 180),
      count: items.length,
      attentionCount: items.filter(item => item.attentionRequired).length,
      items,
      mutationOwner: id === "TIMELINE" ? "NONE" : "DOMAIN_AUTHORITY",
      localMutationControls: false,
    });
  }

  function normalizePerson(input = {}) {
    assertKeys(input, PERSON_KEYS, "CRS09_PERSON_FIELDS_INVALID", "CommercialPerson");
    return freeze({
      personReference: requiredText(input.personReference, "CRS09_PERSON_REFERENCE_REQUIRED", "CommercialPerson"),
      displayName: requiredText(input.displayName, "CRS09_PERSON_NAME_REQUIRED", "El nombre visible", 180),
      lifecycleState: requiredText(input.lifecycleState, "CRS09_PERSON_STATE_REQUIRED", "El estado de persona", 60),
      privacyClassification: assertEnum(
        input.privacyClassification || "PRIVATE",
        PRIVACY_CLASSIFICATIONS,
        "CRS09_PERSON_PRIVACY_INVALID",
        "La privacidad de persona",
      ),
    });
  }

  function normalizeSourceHealth(input = {}, sections) {
    const result = {};
    for (const id of SECTION_IDS) {
      const raw = input[id] || sections[id] || { status: "UNAVAILABLE" };
      result[id] = freeze({
        status: assertEnum(raw.status, SOURCE_STATUSES, "CRS09_SOURCE_STATUS_INVALID", `El estado ${id}`),
        reason: optionalText(raw.reason, 180),
        count: Number.isSafeInteger(Number(raw.count)) && Number(raw.count) >= 0
          ? Number(raw.count)
          : sections[id]?.count || 0,
      });
    }
    return freeze(result);
  }

  function createPersonWorkspace(input = {}) {
    assertKeys(input, WORKSPACE_KEYS, "CRS09_WORKSPACE_FIELDS_INVALID", "El workspace");
    const advisorReference = requiredText(input.advisorReference, "CRS09_ADVISOR_REFERENCE_REQUIRED", "El asesor");
    const person = normalizePerson(input.person);
    const relationshipReference = requiredText(
      input.relationshipReference,
      "CRS09_RELATIONSHIP_REFERENCE_REQUIRED",
      "AdvisorCommercialRelationship",
    );
    const builtAt = iso(input.builtAt || new Date().toISOString(), "CRS09_BUILT_AT_INVALID", "builtAt");
    if (!isObject(input.sections)) fail("CRS09_SECTIONS_REQUIRED", "Las secciones del workspace son obligatorias.");
    const unsupportedSections = Object.keys(input.sections).filter(key => !SECTION_IDS.includes(key));
    if (unsupportedSections.length) fail("CRS09_UNKNOWN_SECTION", "El workspace contiene secciones no autorizadas.", { unsupportedSections });
    const sections = Object.fromEntries(SECTION_IDS.map(id => [id, normalizeSection(input.sections[id] || { id, status: "UNAVAILABLE", items: [] }, id)]));
    const identity = sections.IDENTITY.items[0];
    if (!identity || identity.reference !== person.personReference) {
      fail("CRS09_IDENTITY_SECTION_MISMATCH", "La identidad visible no coincide con CommercialPerson.");
    }
    for (const section of Object.values(sections)) {
      for (const item of section.items) {
        if (item.facts.personReference && item.facts.personReference !== person.personReference) {
          fail("CRS09_CROSS_PERSON_MIX_FORBIDDEN", "El workspace no puede mezclar personas.", { section: section.id, reference: item.reference });
        }
      }
    }
    const sourceHealth = normalizeSourceHealth(input.sourceHealth, sections);
    const itemCount = Object.values(sections).reduce((sum, section) => sum + section.count, 0);
    const attentionCount = Object.values(sections).reduce((sum, section) => sum + section.attentionCount, 0);
    const workspaceReference = `pws_${digest({ advisorReference, personReference: person.personReference, schemaVersion: SCHEMA_VERSION })}`;
    const workspaceDigest = digest({
      workspaceReference,
      person,
      relationshipReference,
      sections,
      sourceHealth,
    });
    return freeze({
      contractType: CONTRACT_TYPE,
      contractVersion: CONTRACT_VERSION,
      schemaVersion: SCHEMA_VERSION,
      workspaceReference,
      advisorReference,
      person,
      relationshipReference,
      builtAt,
      itemCount,
      attentionCount,
      sections: freeze(sections),
      sourceHealth,
      workspaceDigest,
      readOnlyComposition: true,
      secondTruthStore: false,
      truthMutation: false,
      automaticBusinessAction: false,
      localMutationControls: false,
    });
  }

  function assertPersonWorkspace(value) {
    if (!value || value.contractType !== CONTRACT_TYPE || value.schemaVersion !== SCHEMA_VERSION) {
      fail("CRS09_WORKSPACE_CONTRACT_INVALID", "El workspace no cumple el contrato CRS 09.");
    }
    return createPersonWorkspace({
      advisorReference: value.advisorReference,
      person: value.person,
      relationshipReference: value.relationshipReference,
      builtAt: value.builtAt,
      sections: value.sections,
      sourceHealth: value.sourceHealth,
    });
  }

  return freeze({
    CONTRACT_TYPE,
    CONTRACT_VERSION,
    SCHEMA_VERSION,
    SECTION_IDS,
    SECTION_AUTHORITIES,
    SOURCE_STATUSES,
    PRIVACY_CLASSIFICATIONS,
    PROHIBITED_KEYS,
    Crs09PersonWorkspaceError,
    createPersonWorkspace,
    assertPersonWorkspace,
    _private: freeze({ normalizeItem, normalizeSection, normalizeDeepLink, normalizeFacts, digest }),
  });
});
