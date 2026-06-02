function normalizeTimeline(inputTimeline) {
  if (Array.isArray(inputTimeline)) return inputTimeline;
  if (Array.isArray(inputTimeline?.timeline)) return inputTimeline.timeline;
  return [];
}

function normalizeOpportunities(inputOpportunities) {
  if (Array.isArray(inputOpportunities)) return inputOpportunities;
  if (Array.isArray(inputOpportunities?.opportunities)) return inputOpportunities.opportunities;
  return [];
}

function addUnique(items, value) {
  if (!value || items.includes(value)) return;
  items.push(value);
}

function determineRelationshipHealth(riskFactors = []) {
  if (
    riskFactors.includes("PAYMENT_OVERDUE") ||
    riskFactors.includes("MULTIPLE_HIGH_PRIORITY_EVENTS")
  ) {
    return "RED";
  }

  if (
    riskFactors.includes("PAYMENT_DUE") ||
    riskFactors.includes("RENEWAL_NEAR")
  ) {
    return "ORANGE";
  }

  if (
    riskFactors.includes("REVIEW_PENDING") ||
    riskFactors.includes("PROTECTION_GAP") ||
    riskFactors.includes("INACTIVITY")
  ) {
    return "YELLOW";
  }

  return "GREEN";
}

function buildHealthRecommendation(relationshipHealth, riskFactors = []) {
  if (relationshipHealth === "RED") {
    return "Contactar hoy para resolver riesgos críticos antes de buscar oportunidades comerciales.";
  }

  if (relationshipHealth === "ORANGE") {
    return "Priorizar revisión operativa esta semana: renovación, pago o continuidad.";
  }

  if (relationshipHealth === "YELLOW") {
    return "Programar revisión relacional y actualizar necesidades antes de recomendar.";
  }

  if (riskFactors.length === 0) {
    return "Relación estable; mantener contacto preventivo y buscar momentos de valor.";
  }

  return "Monitorear relación y mantener seguimiento ligero.";
}

function buildRelationshipHealth(input = {}) {
  const timeline = normalizeTimeline(input.timeline);
  const opportunities = normalizeOpportunities(input.opportunities);
  const relationshipHistory = input.relationshipHistory || [];
  const riskFactors = [];
  const strengths = [];

  if (timeline.some(event => event.type === "PAYMENT_OVERDUE")) addUnique(riskFactors, "PAYMENT_OVERDUE");
  if (timeline.some(event => event.type === "PAYMENT_DUE" && ["HIGH", "CRITICAL"].includes(event.priority))) addUnique(riskFactors, "PAYMENT_DUE");
  if (timeline.some(event => event.type === "POLICY_RENEWAL" && event.priority === "HIGH")) addUnique(riskFactors, "RENEWAL_NEAR");
  if (timeline.filter(event => event.priority === "HIGH" || event.priority === "CRITICAL").length >= 2) addUnique(riskFactors, "MULTIPLE_HIGH_PRIORITY_EVENTS");
  if (timeline.some(event => event.type === "POLICY_REVIEW")) addUnique(riskFactors, "REVIEW_PENDING");
  if (opportunities.some(item => /GAP/.test(item.type))) addUnique(riskFactors, "PROTECTION_GAP");
  if (relationshipHistory.some(item => item.outcome === "NO_RESPONSE")) addUnique(riskFactors, "INACTIVITY");

  if (relationshipHistory.some(item => item.direction === "INBOUND")) addUnique(strengths, "CLIENT_RESPONSIVE");
  if (timeline.some(event => event.type === "REFERRAL_OPPORTUNITY")) addUnique(strengths, "REFERRAL_MOMENT");
  if (opportunities.some(item => item.type === "REFERRAL_OPPORTUNITY")) addUnique(strengths, "COMMERCIAL_TRUST");
  if ((input.policies || []).length >= 2) addUnique(strengths, "MULTIPLE_POLICIES");

  const relationshipHealth = determineRelationshipHealth(riskFactors);

  return {
    engine: "RELATIONSHIP_HEALTH_ENGINE",
    version: "1.0",
    relationshipHealth,
    riskFactors,
    strengths,
    recommendation: buildHealthRecommendation(relationshipHealth, riskFactors)
  };
}

module.exports = {
  buildRelationshipHealth,
  determineRelationshipHealth
};
