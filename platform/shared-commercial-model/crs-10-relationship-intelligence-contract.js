const CONTRACT_TYPE = "FORGE_EXISTING_RELATIONSHIP_INTELLIGENCE_COMPOSITION";
const CONTRACT_VERSION = "CRS-10-EXISTING-RELATIONSHIP-INTELLIGENCE-001";

const DOMAIN_IDS = Object.freeze([
  "FUTURE_RADAR",
  "RELATIONSHIP_GROWTH",
  "RELATIONAL_ACTIVATION",
  "ECONOMIC_CONNECTION",
  "RELATIONSHIP_CAPITAL",
  "PRODUCTIVITY_PROOF",
]);

const DOMAIN_AUTHORITIES = Object.freeze({
  FUTURE_RADAR: "CARTERA050_FUTURE_RADAR_READ_MODEL",
  RELATIONSHIP_GROWTH: "CARTERA060_RELATIONSHIP_GROWTH_REVIEW_READ_MODEL",
  RELATIONAL_ACTIVATION: "CARTERA070_RELATIONAL_ACTIVATION_READ_MODEL",
  ECONOMIC_CONNECTION: "CARTERA080_ECONOMIC_CONNECTION_PROJECTION",
  RELATIONSHIP_CAPITAL: "CARTERA090_RELATIONSHIP_CAPITAL_READ_MODEL",
  PRODUCTIVITY_PROOF: "CARTERA100_PRODUCTIVITY_PROOF_READ_MODEL",
});

const DOMAIN_SCOPES = Object.freeze({
  FUTURE_RADAR: "PERSON",
  RELATIONSHIP_GROWTH: "PERSON",
  RELATIONAL_ACTIVATION: "PERSON",
  ECONOMIC_CONNECTION: "PERSON",
  RELATIONSHIP_CAPITAL: "PERSON",
  PRODUCTIVITY_PROOF: "ADVISOR",
});

const SOURCE_STATUSES = Object.freeze(["AVAILABLE", "EMPTY", "DEGRADED", "UNAVAILABLE"]);
const ITEM_STATES = Object.freeze([
  "CONFIRMED",
  "REVIEW_REQUIRED",
  "INFORMATION_REQUIRED",
  "OBSERVED",
  "UNKNOWN",
  "INSUFFICIENT_EVIDENCE",
]);

const FORBIDDEN_KEYS = new Set([
  "priorityScore",
  "finalPriority",
  "influenceScore",
  "relationshipScore",
  "relationshipValueScore",
  "networkScore",
  "riskScore",
  "lapseProbability",
  "purchaseProbability",
  "referralProbability",
  "humanScore",
  "humanWorth",
  "advisorScore",
  "advisorRanking",
  "disciplineScore",
  "motivationScore",
  "coachabilityScore",
  "predictedRevenue",
  "expectedRevenue",
  "commissionAmount",
  "payoutAmount",
  "bankAccount",
  "cardNumber",
  "medicalInformation",
  "health",
  "rawEvidence",
  "rawPayload",
  "providerRequest",
  "providerResponse",
  "finalMessage",
  "messageText",
  "notes",
]);

class Crs10RelationshipIntelligenceContractError extends TypeError {
  constructor(code, message, details = null) {
    super(message);
    this.name = "Crs10RelationshipIntelligenceContractError";
    this.code = code;
    this.details = details;
  }
}

const fail = (code, message, details = null) => {
  throw new Crs10RelationshipIntelligenceContractError(code, message, details);
};

const isObject = value => Boolean(value) && typeof value === "object" && !Array.isArray(value);
const freeze = value => {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  Object.freeze(value);
  Object.values(value).forEach(freeze);
  return value;
};
const text = (value, code, label, maximum = 500) => {
  const normalized = typeof value === "string" ? value.trim() : "";
  if (!normalized || normalized.length > maximum) fail(code, `${label} no es válido.`);
  return normalized;
};
const optionalText = (value, maximum = 500) => {
  if (value === null || value === undefined || value === "") return null;
  const normalized = String(value).trim();
  if (!normalized || normalized.length > maximum) fail("CRS10_TEXT_INVALID", "El texto opcional no es válido.");
  return normalized;
};
const isoDate = value => {
  if (value === null || value === undefined || value === "") return null;
  const normalized = String(value).trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(normalized)) fail("CRS10_DATE_INVALID", "La fecha no es válida.");
  const parsed = new Date(`${normalized}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== normalized) {
    fail("CRS10_DATE_INVALID", "La fecha no es válida.");
  }
  return normalized;
};
const isoInstant = value => {
  if (value === null || value === undefined || value === "") return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) fail("CRS10_INSTANT_INVALID", "El instante no es válido.");
  return parsed.toISOString();
};

function assertNoForbiddenKeys(value, path = "composition") {
  if (Array.isArray(value)) {
    value.forEach((item, index) => assertNoForbiddenKeys(item, `${path}[${index}]`));
    return;
  }
  if (!isObject(value)) return;
  for (const [key, nested] of Object.entries(value)) {
    if (FORBIDDEN_KEYS.has(key)) {
      fail("CRS10_FORBIDDEN_INTELLIGENCE_FIELD", "La composición no puede exponer score, valor humano ni payload crudo.", {
        path: `${path}.${key}`,
      });
    }
    assertNoForbiddenKeys(nested, `${path}.${key}`);
  }
}

function normalizeDeepLink(value) {
  const link = text(value, "CRS10_DEEP_LINK_REQUIRED", "El deep link", 500);
  if (!link.startsWith("?nav=") || link.includes("javascript:") || link.includes("//")) {
    fail("CRS10_DEEP_LINK_INVALID", "El deep link debe permanecer dentro de ForgeOS.");
  }
  return link;
}

function normalizeItem(input = {}, domainId, personReference) {
  if (!isObject(input)) fail("CRS10_ITEM_INVALID", "El elemento de inteligencia debe ser un objeto.");
  assertNoForbiddenKeys(input, `domains.${domainId}.items`);
  const scope = text(input.scope || DOMAIN_SCOPES[domainId], "CRS10_ITEM_SCOPE_INVALID", "El alcance", 40).toUpperCase();
  if (scope !== DOMAIN_SCOPES[domainId]) fail("CRS10_ITEM_SCOPE_MISMATCH", "El alcance no coincide con el dominio.");
  const itemPersonReference = optionalText(input.personReference, 240);
  if (scope === "PERSON" && itemPersonReference !== personReference) {
    fail("CRS10_CROSS_PERSON_ITEM", "La inteligencia de persona pertenece a otra CommercialPerson.");
  }
  if (scope === "ADVISOR" && itemPersonReference !== null) {
    fail("CRS10_ADVISOR_ITEM_PERSON_FORBIDDEN", "La evidencia del asesor no puede atribuirse a una persona.");
  }
  const state = text(input.state || "UNKNOWN", "CRS10_ITEM_STATE_INVALID", "El estado", 80).toUpperCase();
  if (!ITEM_STATES.includes(state)) fail("CRS10_ITEM_STATE_INVALID", "El estado no está permitido.");
  return freeze({
    reference: text(input.reference, "CRS10_ITEM_REFERENCE_REQUIRED", "La referencia", 240),
    label: text(input.label, "CRS10_ITEM_LABEL_REQUIRED", "La etiqueta", 240),
    summary: optionalText(input.summary, 700),
    state,
    authority: text(input.authority || DOMAIN_AUTHORITIES[domainId], "CRS10_ITEM_AUTHORITY_REQUIRED", "La autoridad", 180),
    scope,
    personReference: itemPersonReference,
    effectiveDate: isoDate(input.effectiveDate),
    observedAt: isoInstant(input.observedAt),
    reviewRequired: input.reviewRequired === true,
    uncertainty: optionalText(input.uncertainty, 500),
    smallestUsefulAction: optionalText(input.smallestUsefulAction, 500),
    evidenceCount: Math.max(0, Number.isInteger(Number(input.evidenceCount)) ? Number(input.evidenceCount) : 0),
    deepLink: normalizeDeepLink(input.deepLink),
  });
}

function normalizeDomain(input = {}, expectedId, personReference) {
  if (!isObject(input)) fail("CRS10_DOMAIN_INVALID", "El dominio debe ser un objeto.");
  const id = text(input.id || expectedId, "CRS10_DOMAIN_ID_INVALID", "El dominio", 80).toUpperCase();
  if (id !== expectedId) fail("CRS10_DOMAIN_ORDER_INVALID", "El dominio no coincide con su posición.");
  const status = text(input.status || "UNAVAILABLE", "CRS10_DOMAIN_STATUS_INVALID", "El estado de fuente", 40).toUpperCase();
  if (!SOURCE_STATUSES.includes(status)) fail("CRS10_DOMAIN_STATUS_INVALID", "El estado de fuente no está permitido.");
  const items = Array.isArray(input.items)
    ? input.items.map(item => normalizeItem(item, id, personReference))
    : fail("CRS10_DOMAIN_ITEMS_INVALID", "Los elementos deben ser una lista.");
  if (status === "AVAILABLE" && items.length === 0) fail("CRS10_AVAILABLE_DOMAIN_EMPTY", "Una fuente AVAILABLE debe contener elementos.");
  if (status === "EMPTY" && items.length > 0) fail("CRS10_EMPTY_DOMAIN_WITH_ITEMS", "Una fuente EMPTY no puede contener elementos.");
  return freeze({
    id,
    label: optionalText(input.label, 120),
    authority: DOMAIN_AUTHORITIES[id],
    scope: DOMAIN_SCOPES[id],
    status,
    reason: optionalText(input.reason, 240),
    count: items.length,
    reviewCount: items.filter(item => item.reviewRequired).length,
    items,
    readOnly: true,
    localMutationControls: false,
  });
}

export function createRelationshipIntelligenceComposition(input = {}) {
  if (!isObject(input)) fail("CRS10_COMPOSITION_INVALID", "La composición debe ser un objeto.");
  assertNoForbiddenKeys(input);
  const advisorReference = text(input.advisorReference, "CRS10_ADVISOR_REQUIRED", "El asesor", 240);
  const personReference = text(input.personReference, "CRS10_PERSON_REQUIRED", "CommercialPerson", 240);
  const domainsInput = isObject(input.domains) ? input.domains : {};
  const domains = Object.fromEntries(DOMAIN_IDS.map(id => [
    id,
    normalizeDomain(domainsInput[id] || { id, status: "UNAVAILABLE", items: [] }, id, personReference),
  ]));
  const domainValues = Object.values(domains);
  return freeze({
    contractType: CONTRACT_TYPE,
    contractVersion: CONTRACT_VERSION,
    advisorReference,
    personReference,
    asOfDate: isoDate(input.asOfDate || new Date().toISOString().slice(0, 10)),
    generatedAt: isoInstant(input.generatedAt || new Date().toISOString()),
    domains: freeze(domains),
    itemCount: domainValues.reduce((total, domain) => total + domain.count, 0),
    reviewCount: domainValues.reduce((total, domain) => total + domain.reviewCount, 0),
    sourceHealth: freeze(Object.fromEntries(domainValues.map(domain => [domain.id, freeze({
      status: domain.status,
      reason: domain.reason,
      count: domain.count,
      scope: domain.scope,
    })]))),
    readOnly: true,
    boundaries: freeze({
      existingCarteraIntelligenceReused: true,
      secondScoreEngine: false,
      secondRelationshipMemoryAuthority: false,
      secondActivationStack: false,
      opaqueHumanScoring: false,
      automaticContact: false,
      automaticMessage: false,
      automaticTask: false,
      automaticCalendar: false,
      automaticOpportunity: false,
      automaticStageAdvance: false,
      automaticApplication: false,
      automaticPolicy: false,
      localMutationControls: false,
    }),
  });
}

export {
  CONTRACT_TYPE,
  CONTRACT_VERSION,
  DOMAIN_IDS,
  DOMAIN_AUTHORITIES,
  DOMAIN_SCOPES,
  SOURCE_STATUSES,
  ITEM_STATES,
  Crs10RelationshipIntelligenceContractError,
  assertNoForbiddenKeys,
};
