"use strict";

(function (root, factory) {
  const api = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (root) root.ForgeCrs08UnifiedPersonTimelineContract = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  const CONTRACT_TYPE = "FORGE_UNIFIED_PERSON_TIMELINE";
  const CONTRACT_VERSION = "CRS-08-UNIFIED-PERSON-TIMELINE-001.1";
  const SCHEMA_VERSION = "forge.unified_person_timeline.v1";
  const ENTRY_VERSION = "forge.unified_person_timeline_entry.v1";
  const SOURCE_DOMAINS = Object.freeze(["PIPELINE", "ACTIVITY", "QUOTE", "APPLICATION", "CARTERA"]);
  const SOURCE_STATUSES = Object.freeze(["AVAILABLE", "EMPTY", "DEGRADED", "UNAVAILABLE"]);
  const PRIVACY_CLASSIFICATIONS = Object.freeze(["OPERATIONAL", "PRIVATE", "SENSITIVE", "RESTRICTED"]);
  const CONFIRMATION_STATES = Object.freeze(["UNCONFIRMED", "REPORTED", "CONFIRMED", "DISPUTED"]);
  const PRIVACY_RANK = Object.freeze({ OPERATIONAL: 0, PRIVATE: 1, SENSITIVE: 2, RESTRICTED: 3 });
  const ORDERING = Object.freeze({
    primary: "occurredAt:DESC",
    secondary: "recordedAt:DESC",
    tertiary: "sourceEventReference:ASC",
  });
  const PROHIBITED_FACT_KEYS = Object.freeze([
    "phone", "phoneNumber", "phone_normalized", "whatsapp", "whatsapp_normalized",
    "email", "email_normalized", "address", "street", "postalCode", "curp", "rfc",
    "medical", "health", "diagnosis", "bank", "bankAccount", "accountNumber", "clabe",
    "signature", "signatureImage", "biometric", "documentBytes", "rawPayload", "providerPayload",
    "transcript", "messageText", "rawMessage", "notes", "rawNotes", "password", "secret",
    "accessToken", "refreshToken", "authToken",
  ]);

  const TIMELINE_KEYS = Object.freeze([
    "contractType", "contractVersion", "schemaVersion", "timelineReference",
    "advisorReference", "personReference", "relationshipReference", "builtAt", "ordering",
    "entryCount", "attentionCount", "correctedCount", "privacyCounts", "domainCounts",
    "sourceCoverage", "historyFoundation", "timelineDigest", "entries", "readOnly", "secondLedger", "truthMutation",
  ]);
  const ENTRY_KEYS = Object.freeze([
    "entryVersion", "entryReference", "domain", "recordType", "recordReference",
    "sourceEventReference", "authority", "personReference", "relationshipReference",
    "correlationId", "title", "summary", "occurredAt", "recordedAt", "privacyClassification",
    "confirmationState", "isCorrection", "isCorrected", "correctionOf", "correctionSourceEventReference", "correctedBy",
    "correctionState", "attentionRequired", "sourceDigest", "facts",
  ]);
  const SOURCE_ENTRY_KEYS = Object.freeze([
    "domain", "recordType", "recordReference", "sourceEventReference", "authority",
    "personReference", "relationshipReference", "correlationId", "title", "summary",
    "occurredAt", "recordedAt", "privacyClassification", "confirmationState", "correctionOf", "facts",
  ]);

  class Crs08UnifiedPersonTimelineError extends TypeError {
    constructor(code, message, details = null) {
      super(message);
      this.name = "Crs08UnifiedPersonTimelineError";
      this.code = code;
      this.details = details;
    }
  }

  const fail = (code, message, details = null) => {
    throw new Crs08UnifiedPersonTimelineError(code, message, details);
  };
  const isObject = value => {
    if (!value || typeof value !== "object" || Array.isArray(value)) return false;
    const proto = Object.getPrototypeOf(value);
    return proto === Object.prototype || proto === null;
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
  const stableDigest = value => {
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
  const optionalText = (value, maximum = 240) => {
    if (value === null || value === undefined || value === "") return null;
    const normalized = String(value).trim();
    if (!normalized || normalized.length > maximum) fail("CRS08_REFERENCE_INVALID", "La referencia opcional no es válida.");
    return normalized;
  };
  const iso = (value, code, label) => {
    if (typeof value !== "string" || Number.isNaN(Date.parse(value))) fail(code, `${label} no es una fecha válida.`);
    return new Date(value).toISOString();
  };
  const assertKeys = (value, allowed, code, label) => {
    if (!isObject(value)) fail(code, `${label} debe ser un objeto.`);
    const unsupported = Object.keys(value).filter(key => !allowed.includes(key)).sort();
    if (unsupported.length) fail(code, `${label} contiene campos no autorizados.`, { unsupportedKeys: unsupported });
  };
  const assertEnum = (value, allowed, code, label) => {
    const normalized = requiredText(value, code, label).toUpperCase();
    if (!allowed.includes(normalized)) fail(code, `${label} no es válido.`, { value: normalized });
    return normalized;
  };
  const scanProhibited = (value, path = "facts") => {
    if (Array.isArray(value)) {
      value.forEach((item, index) => scanProhibited(item, `${path}[${index}]`));
      return;
    }
    if (!isObject(value)) return;
    for (const [key, nested] of Object.entries(value)) {
      if (PROHIBITED_FACT_KEYS.includes(key)) {
        fail("CRS08_SENSITIVE_FACT_FORBIDDEN", "El Timeline no puede copiar datos sensibles o payloads crudos.", { path: `${path}.${key}` });
      }
      scanProhibited(nested, `${path}.${key}`);
    }
  };
  const normalizeFacts = value => {
    if (value === null || value === undefined) return {};
    if (!isObject(value)) fail("CRS08_FACTS_INVALID", "Los hechos del Timeline deben ser un objeto mínimo.");
    scanProhibited(value);
    const text = stableStringify(value);
    if (text.length > 4000) fail("CRS08_FACTS_TOO_LARGE", "Los hechos exceden el tamaño permitido.");
    return stableValue(clone(value));
  };
  const sourceKey = source => `${source.domain}:${source.authority}:${source.sourceEventReference}`;
  const deriveEntryReference = source => `pte_${stableDigest(sourceKey(source))}`;
  const deriveTimelineReference = ({ advisorReference, personReference }) =>
    `ptl_${stableDigest({ advisorReference, personReference, schemaVersion: SCHEMA_VERSION })}`;

  function createSourceEntry(input = {}) {
    assertKeys(input, SOURCE_ENTRY_KEYS, "CRS08_SOURCE_ENTRY_FIELDS_INVALID", "La entrada fuente");
    const domain = assertEnum(input.domain, SOURCE_DOMAINS, "CRS08_SOURCE_DOMAIN_INVALID", "El dominio");
    const personReference = requiredText(input.personReference, "CRS08_PERSON_REFERENCE_REQUIRED", "CommercialPerson");
    const occurredAt = iso(input.occurredAt, "CRS08_OCCURRED_AT_INVALID", "occurredAt");
    const recordedAt = iso(input.recordedAt, "CRS08_RECORDED_AT_INVALID", "recordedAt");
    if (Date.parse(recordedAt) < Date.parse(occurredAt)) {
      fail("CRS08_RECORDED_BEFORE_OCCURRED", "recordedAt no puede preceder occurredAt.");
    }
    return freeze({
      domain,
      recordType: requiredText(input.recordType, "CRS08_RECORD_TYPE_REQUIRED", "recordType", 120),
      recordReference: requiredText(input.recordReference, "CRS08_RECORD_REFERENCE_REQUIRED", "recordReference"),
      sourceEventReference: requiredText(input.sourceEventReference, "CRS08_SOURCE_EVENT_REQUIRED", "sourceEventReference"),
      authority: requiredText(input.authority, "CRS08_AUTHORITY_REQUIRED", "authority", 160),
      personReference,
      relationshipReference: requiredText(input.relationshipReference, "CRS08_RELATIONSHIP_REFERENCE_REQUIRED", "AdvisorCommercialRelationship"),
      correlationId: optionalText(input.correlationId),
      title: requiredText(input.title, "CRS08_TITLE_REQUIRED", "El título", 160),
      summary: optionalText(input.summary, 500),
      occurredAt,
      recordedAt,
      privacyClassification: assertEnum(input.privacyClassification, PRIVACY_CLASSIFICATIONS, "CRS08_PRIVACY_INVALID", "La privacidad"),
      confirmationState: assertEnum(input.confirmationState, CONFIRMATION_STATES, "CRS08_CONFIRMATION_INVALID", "La confirmación"),
      correctionOf: optionalText(input.correctionOf),
      facts: normalizeFacts(input.facts),
    });
  }

  function normalizeCoverage(input = {}) {
    const result = {};
    for (const domain of SOURCE_DOMAINS) {
      const raw = input[domain] || { status: "UNAVAILABLE", count: 0 };
      const status = assertEnum(raw.status, SOURCE_STATUSES, "CRS08_SOURCE_STATUS_INVALID", `El estado ${domain}`);
      const count = Number(raw.count || 0);
      if (!Number.isSafeInteger(count) || count < 0) fail("CRS08_SOURCE_COUNT_INVALID", "El conteo de fuente no es válido.");
      result[domain] = freeze({ status, count, reason: optionalText(raw.reason, 160) });
    }
    return freeze(result);
  }

  function normalizeHistoryFoundation(input = {}) {
    const status = assertEnum(input.status || "UNAVAILABLE", SOURCE_STATUSES, "CRS08_HISTORY_FOUNDATION_STATUS_INVALID", "El estado de Cartera 040B");
    const entryCount = Number(input.entryCount || 0);
    if (!Number.isSafeInteger(entryCount) || entryCount < 0) fail("CRS08_HISTORY_FOUNDATION_COUNT_INVALID", "El conteo de Cartera 040B no es válido.");
    return freeze({
      authority: "CARTERA_040B_PERSON_RELATIONSHIP_BRIEF",
      status,
      entryCount,
      reason: optionalText(input.reason, 160),
      readOnly: true,
    });
  }

  function compareEntries(left, right) {
    return right.occurredAt.localeCompare(left.occurredAt) ||
      right.recordedAt.localeCompare(left.recordedAt) ||
      left.sourceEventReference.localeCompare(right.sourceEventReference);
  }

  function createUnifiedPersonTimeline(input = {}) {
    const advisorReference = requiredText(input.advisorReference, "CRS08_ADVISOR_REFERENCE_REQUIRED", "El asesor");
    const personReference = requiredText(input.personReference, "CRS08_PERSON_REFERENCE_REQUIRED", "CommercialPerson");
    const relationshipReference = requiredText(input.relationshipReference, "CRS08_RELATIONSHIP_REFERENCE_REQUIRED", "AdvisorCommercialRelationship");
    const builtAt = iso(input.builtAt || new Date().toISOString(), "CRS08_BUILT_AT_INVALID", "builtAt");
    if (!Array.isArray(input.sourceEntries)) fail("CRS08_SOURCE_ENTRIES_INVALID", "Las entradas fuente deben ser una lista.");

    const byKey = new Map();
    for (const raw of input.sourceEntries) {
      const source = createSourceEntry(raw);
      if (source.personReference !== personReference || source.relationshipReference !== relationshipReference) {
        fail("CRS08_PERSON_LINEAGE_MISMATCH", "El Timeline no puede mezclar personas o relaciones.", {
          sourceEventReference: source.sourceEventReference,
        });
      }
      const key = sourceKey(source);
      const prior = byKey.get(key);
      if (prior) {
        if (stableStringify(prior) !== stableStringify(source)) {
          fail("CRS08_DUPLICATE_SOURCE_CONFLICT", "La misma fuente produjo entradas incompatibles.", { sourceKey: key });
        }
        continue;
      }
      byKey.set(key, source);
    }

    const sourceEntries = [...byKey.values()];
    const referenceBySourceKey = new Map(sourceEntries.map(source => [sourceKey(source), deriveEntryReference(source)]));
    const referenceSet = new Set(referenceBySourceKey.values());
    const correctionTargetByEntry = new Map();
    const correctedBy = new Map();
    for (const source of sourceEntries) {
      if (!source.correctionOf) continue;
      const targetKey = `${source.domain}:${source.authority}:${source.correctionOf}`;
      const targetReference = referenceBySourceKey.get(targetKey) || `pte_${stableDigest(targetKey)}`;
      const entryReference = deriveEntryReference(source);
      correctionTargetByEntry.set(entryReference, targetReference);
      const list = correctedBy.get(targetReference) || [];
      list.push(entryReference);
      correctedBy.set(targetReference, list);
    }
    for (const list of correctedBy.values()) list.sort();

    const entries = sourceEntries.map(source => {
      const entryReference = deriveEntryReference(source);
      const correctionTargetReference = correctionTargetByEntry.get(entryReference) || null;
      const correctionTargetExists = !source.correctionOf || referenceSet.has(correctionTargetReference);
      const correctedByEntries = correctedBy.get(entryReference) || [];
      const confirmationAttention = source.confirmationState !== "CONFIRMED";
      const correctionState = !source.correctionOf ? "ORIGINAL" : correctionTargetExists ? "VALID" : "TARGET_MISSING";
      const digestInput = {
        ...source,
        entryReference,
        correctionState,
        correctedBy: correctedByEntries,
      };
      return {
        entryVersion: ENTRY_VERSION,
        entryReference,
        domain: source.domain,
        recordType: source.recordType,
        recordReference: source.recordReference,
        sourceEventReference: source.sourceEventReference,
        authority: source.authority,
        personReference,
        relationshipReference,
        correlationId: source.correlationId,
        title: source.title,
        summary: source.summary,
        occurredAt: source.occurredAt,
        recordedAt: source.recordedAt,
        privacyClassification: source.privacyClassification,
        confirmationState: source.confirmationState,
        isCorrection: source.correctionOf !== null,
        isCorrected: correctedByEntries.length > 0,
        correctionOf: correctionTargetReference,
        correctionSourceEventReference: source.correctionOf,
        correctedBy: correctedByEntries,
        correctionState,
        attentionRequired: confirmationAttention || correctionState === "TARGET_MISSING",
        sourceDigest: stableDigest(digestInput),
        facts: source.facts,
      };
    }).sort(compareEntries);

    const privacyCounts = Object.fromEntries(PRIVACY_CLASSIFICATIONS.map(value => [value, 0]));
    const domainCounts = Object.fromEntries(SOURCE_DOMAINS.map(value => [value, 0]));
    entries.forEach(entry => {
      privacyCounts[entry.privacyClassification] += 1;
      domainCounts[entry.domain] += 1;
    });
    const sourceCoverage = normalizeCoverage(input.sourceCoverage || Object.fromEntries(
      SOURCE_DOMAINS.map(domain => [domain, { status: domainCounts[domain] ? "AVAILABLE" : "EMPTY", count: domainCounts[domain] }]),
    ));
    for (const domain of SOURCE_DOMAINS) {
      if (sourceCoverage[domain].count !== domainCounts[domain]) {
        fail("CRS08_SOURCE_COVERAGE_MISMATCH", "La cobertura no coincide con las entradas compuestas.", { domain });
      }
    }

    const historyFoundation = normalizeHistoryFoundation(input.historyFoundation);
    const timelineReference = deriveTimelineReference({ advisorReference, personReference });
    const digestInput = {
      contractType: CONTRACT_TYPE,
      contractVersion: CONTRACT_VERSION,
      schemaVersion: SCHEMA_VERSION,
      timelineReference,
      advisorReference,
      personReference,
      relationshipReference,
      builtAt,
      ordering: ORDERING,
      entryCount: entries.length,
      attentionCount: entries.filter(entry => entry.attentionRequired).length,
      correctedCount: entries.filter(entry => entry.isCorrected).length,
      privacyCounts,
      domainCounts,
      sourceCoverage,
      historyFoundation,
      entries,
      readOnly: true,
      secondLedger: false,
      truthMutation: false,
    };
    return freeze({ ...digestInput, timelineDigest: stableDigest(digestInput) });
  }

  function assertUnifiedPersonTimeline(input) {
    assertKeys(input, TIMELINE_KEYS, "CRS08_TIMELINE_FIELDS_INVALID", "El Timeline");
    if (!Array.isArray(input.entries)) fail("CRS08_TIMELINE_ENTRIES_INVALID", "Las entradas del Timeline no son válidas.");
    input.entries.forEach((entry, index) => assertKeys(entry, ENTRY_KEYS, "CRS08_ENTRY_FIELDS_INVALID", `La entrada ${index + 1}`));
    const rebuilt = createUnifiedPersonTimeline({
      advisorReference: input.advisorReference,
      personReference: input.personReference,
      relationshipReference: input.relationshipReference,
      builtAt: input.builtAt,
      sourceEntries: input.entries.map(entry => ({
        domain: entry.domain,
        recordType: entry.recordType,
        recordReference: entry.recordReference,
        sourceEventReference: entry.sourceEventReference,
        authority: entry.authority,
        personReference: entry.personReference,
        relationshipReference: entry.relationshipReference,
        correlationId: entry.correlationId,
        title: entry.title,
        summary: entry.summary,
        occurredAt: entry.occurredAt,
        recordedAt: entry.recordedAt,
        privacyClassification: entry.privacyClassification,
        confirmationState: entry.confirmationState,
        correctionOf: entry.correctionSourceEventReference,
        facts: entry.facts,
      })),
      sourceCoverage: input.sourceCoverage,
      historyFoundation: input.historyFoundation,
    });
    if (stableStringify(rebuilt) !== stableStringify(input)) {
      fail("CRS08_TIMELINE_NOT_CANONICAL", "El Timeline no coincide con sus fuentes normalizadas.");
    }
    return rebuilt;
  }

  function filterTimeline(input, options = {}) {
    const timeline = assertUnifiedPersonTimeline(input);
    const allowedDomains = options.domains === undefined ? SOURCE_DOMAINS : options.domains;
    if (!Array.isArray(allowedDomains) || allowedDomains.some(domain => !SOURCE_DOMAINS.includes(domain))) {
      fail("CRS08_FILTER_DOMAINS_INVALID", "El filtro de dominios no es válido.");
    }
    const maxPrivacy = options.maxPrivacyClassification || "RESTRICTED";
    const privacy = assertEnum(maxPrivacy, PRIVACY_CLASSIFICATIONS, "CRS08_FILTER_PRIVACY_INVALID", "La privacidad máxima");
    const includeCorrected = options.includeCorrected !== false;
    const includeAttention = options.includeAttention !== false;
    const entries = timeline.entries.filter(entry =>
      allowedDomains.includes(entry.domain) &&
      PRIVACY_RANK[entry.privacyClassification] <= PRIVACY_RANK[privacy] &&
      (includeCorrected || !entry.isCorrected) &&
      (includeAttention || !entry.attentionRequired)
    );
    return freeze({
      timelineReference: timeline.timelineReference,
      timelineDigest: timeline.timelineDigest,
      personReference: timeline.personReference,
      filters: freeze({ domains: [...allowedDomains], maxPrivacyClassification: privacy, includeCorrected, includeAttention }),
      entries: clone(entries),
      entryCount: entries.length,
      readOnly: true,
    });
  }

  function validateUnifiedPersonTimeline(input) {
    try {
      assertUnifiedPersonTimeline(input);
      return freeze({ valid: true, errors: [] });
    } catch (error) {
      return freeze({ valid: false, errors: [{ code: error.code || "CRS08_VALIDATION_FAILED", message: error.message, details: error.details || null }] });
    }
  }

  return freeze({
    CONTRACT_TYPE,
    CONTRACT_VERSION,
    SCHEMA_VERSION,
    ENTRY_VERSION,
    SOURCE_DOMAINS,
    SOURCE_STATUSES,
    PRIVACY_CLASSIFICATIONS,
    CONFIRMATION_STATES,
    ORDERING,
    PROHIBITED_FACT_KEYS,
    Crs08UnifiedPersonTimelineError,
    createSourceEntry,
    createUnifiedPersonTimeline,
    assertUnifiedPersonTimeline,
    validateUnifiedPersonTimeline,
    filterTimeline,
    deriveEntryReference,
    deriveTimelineReference,
    _private: freeze({ stableStringify, stableDigest, stableValue, normalizeFacts, normalizeCoverage, normalizeHistoryFoundation, sourceKey, compareEntries }),
  });
});
