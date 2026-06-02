const { loadMemory } = require("./nash-memory-engine");
const { buildRelationshipTimeline } = require("./relationship-timeline-engine");
const { detectRelationshipOpportunities } = require("./relationship-opportunity-engine");

const EVENT_DEFINITIONS = {
  MARRIAGE: {
    patterns: [/boda/i, /me cas[eé]/i, /matrimonio/i, /espos[ao]/i, /casad[ao]/i],
    reviewAreas: ["PROTECTION", "HEALTH", "RETIREMENT"],
    impact: "La estructura familiar cambio; conviene revisar beneficiarios, proteccion y prioridades."
  },
  NEW_CHILD: {
    patterns: [/hijo/i, /hija/i, /beb[eé]/i, /embarazo/i, /nacimiento/i],
    reviewAreas: ["PROTECTION", "EDUCATION", "HEALTH"],
    impact: "Nuevo dependiente potencial; aumenta necesidad de proteccion, salud y educacion."
  },
  JOB_CHANGE: {
    patterns: [/nuevo trabajo/i, /cambi[eé] de trabajo/i, /cambio de trabajo/i, /ascenso/i, /renunci[eé]/i, /empleo/i],
    reviewAreas: ["INCOME_PROTECTION", "RETIREMENT", "HEALTH"],
    impact: "Cambio laboral; puede modificar ingresos, prestaciones y necesidades de proteccion."
  },
  HOME_PURCHASE: {
    patterns: [/\bcasa\b/i, /\bdepartamento\b/i, /\bhipoteca\b/i, /compr[eé] vivienda/i, /\bmudanza\b/i],
    reviewAreas: ["PROTECTION", "DEBT_PROTECTION"],
    impact: "Nueva responsabilidad patrimonial; conviene proteger deuda y continuidad familiar."
  },
  RETIREMENT_NEAR: {
    patterns: [/retiro/i, /jubila/i, /pensi[oó]n/i],
    reviewAreas: ["RETIREMENT", "HEALTH", "CASH_FLOW"],
    impact: "La etapa de retiro se acerca; conviene revisar flujo, salud y patrimonio."
  },
  BUSINESS_OWNER: {
    patterns: [/negocio/i, /empresa/i, /socio/i, /emprend/i, /dueñ[oa]/i],
    reviewAreas: ["BUSINESS_PROTECTION", "KEY_PERSON", "RETIREMENT"],
    impact: "Hay exposicion empresarial; conviene revisar continuidad, socios y proteccion patrimonial."
  },
  DIVORCE: {
    patterns: [/divorcio/i, /separaci[oó]n/i, /separad[ao]/i],
    reviewAreas: ["BENEFICIARIES", "PROTECTION", "RETIREMENT"],
    impact: "Cambio familiar sensible; conviene revisar beneficiarios, obligaciones y proteccion."
  },
  EDUCATION_MILESTONE: {
    patterns: [/universidad/i, /colegio/i, /escuela/i, /prepa/i, /graduaci[oó]n/i, /beca/i],
    reviewAreas: ["EDUCATION", "SAVINGS"],
    impact: "Hito educativo; puede requerir planeacion de ahorro o ajuste de prioridades."
  }
};

function normalizeTimeline(inputTimeline, input = {}) {
  if (Array.isArray(inputTimeline)) return inputTimeline;
  if (Array.isArray(inputTimeline?.timeline)) return inputTimeline.timeline;

  return buildRelationshipTimeline({
    clientId: input.client?.id || input.clientId,
    profile: input.client || {},
    policies: input.policies || [],
    events: input.events || [],
    now: input.now
  }).timeline;
}

function collectEvidence(input = {}) {
  const client = input.client || {};
  const relationshipHistory = input.relationshipHistory || [];
  const timeline = normalizeTimeline(input.timeline, input);
  const evidence = [];

  [
    client.maritalStatus,
    client.occupation,
    client.notes,
    client.lifeStage
  ].flat().filter(Boolean).forEach(item => evidence.push(String(item)));

  (client.lifeEvents || []).forEach(event => {
    evidence.push(event.type || "");
    evidence.push(event.description || "");
  });

  timeline.forEach(event => {
    evidence.push(event.type || "");
    evidence.push(event.description || "");
  });

  relationshipHistory.forEach(item => {
    evidence.push(item.message || "");
    evidence.push(item.outcome || "");
  });

  if (input.prospectId) {
    const memory = loadMemory(input.prospectId);

    (memory.conversationHistory || []).forEach(item => evidence.push(item.message || ""));
    (memory.actionHistory || []).forEach(item => evidence.push(item.outcome || ""));
  }

  return evidence.join(" ");
}

function addEvent(detected, eventType, confidence, source) {
  if (!eventType) return;

  const existing = detected.find(item => item.type === eventType);

  if (existing) {
    existing.confidence = Math.max(existing.confidence, confidence);
    existing.sources.push(source);
    return;
  }

  detected.push({
    type: eventType,
    confidence,
    sources: [source]
  });
}

function detectEventsFromData(input = {}) {
  const client = input.client || {};
  const evidence = collectEvidence(input);
  const detected = [];

  Object.entries(EVENT_DEFINITIONS).forEach(([eventType, definition]) => {
    const matches = definition.patterns.filter(pattern => pattern.test(evidence));

    if (matches.length > 0) {
      addEvent(detected, eventType, Math.min(60 + matches.length * 10, 95), "TEXT_EVIDENCE");
    }
  });

  if (Number(client.children || client.dependents || 0) > 0) {
    addEvent(detected, "NEW_CHILD", 80, "CLIENT_DEPENDENTS");
  }

  if (Number(client.age || 0) >= 55) {
    addEvent(detected, "RETIREMENT_NEAR", 82, "CLIENT_AGE");
  }

  if (/empres|socio|dueñ|owner|business/i.test(String(client.occupation || ""))) {
    addEvent(detected, "BUSINESS_OWNER", 82, "CLIENT_OCCUPATION");
  }

  if (/casad/i.test(String(client.maritalStatus || ""))) {
    addEvent(detected, "MARRIAGE", 70, "CLIENT_MARITAL_STATUS");
  }

  return detected.sort((a, b) => b.confidence - a.confidence);
}

function buildReviewAreas(detectedEvents = []) {
  const areas = new Set();

  detectedEvents.forEach(event => {
    (EVENT_DEFINITIONS[event.type]?.reviewAreas || []).forEach(area => areas.add(area));
  });

  return Array.from(areas);
}

function buildRelationshipImpact(detectedEvents = []) {
  if (!detectedEvents.length) {
    return "No hay evidencia suficiente para inferir impacto relacional.";
  }

  return detectedEvents
    .slice(0, 3)
    .map(event => EVENT_DEFINITIONS[event.type]?.impact)
    .filter(Boolean)
    .join(" ");
}

function detectLifeEvents(input = {}) {
  const client = input.client || {};
  const clientId = client.id || client.clientId || input.clientId || "UNKNOWN_CLIENT";
  const detectedEvents = detectEventsFromData(input);
  const opportunityReport = detectRelationshipOpportunities({
    client,
    policies: input.policies || [],
    relationshipHistory: input.relationshipHistory || [],
    timeline: input.timeline || []
  });
  const hasLifeEventOpportunity = opportunityReport.opportunities.some(item =>
    item.type === "LIFE_EVENT_OPPORTUNITY"
  );

  if (hasLifeEventOpportunity && detectedEvents.length === 0) {
    detectedEvents.push({
      type: "UNKNOWN",
      confidence: 40,
      sources: ["LIFE_EVENT_OPPORTUNITY"]
    });
  }

  return {
    engine: "LIFE_EVENT_ENGINE",
    version: "0.4",
    clientId,
    detectedEvents: detectedEvents.length
      ? detectedEvents
      : [{ type: "UNKNOWN", confidence: 0, sources: [] }],
    confidence: detectedEvents.length
      ? Math.round(detectedEvents.reduce((sum, event) => sum + event.confidence, 0) / detectedEvents.length)
      : 0,
    recommendedReviewAreas: buildReviewAreas(detectedEvents),
    relationshipImpact: buildRelationshipImpact(detectedEvents)
  };
}

module.exports = {
  detectLifeEvents,
  detectEventsFromData,
  buildReviewAreas
};
