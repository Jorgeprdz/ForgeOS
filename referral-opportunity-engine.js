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

function normalizeLifeEvents(inputLifeEvents) {
  if (Array.isArray(inputLifeEvents)) return inputLifeEvents;
  if (Array.isArray(inputLifeEvents?.detectedEvents)) return inputLifeEvents.detectedEvents;
  return [];
}

function yearsBetween(startValue, endValue = new Date()) {
  if (!startValue) return 0;
  const start = new Date(startValue);
  const end = new Date(endValue);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 0;

  return Math.max(0, Math.floor((end - start) / (1000 * 60 * 60 * 24 * 365)));
}

function addSignal(signals, signal) {
  if (!signal) return;
  if (!signals.includes(signal)) signals.push(signal);
}

function calculateReferralScore({ signals = [], relationshipScore = 0 }) {
  let score = 20;

  const weights = {
    POSITIVE_INTERACTION: 15,
    SUCCESSFUL_CLAIM: 25,
    POLICY_REVIEW_COMPLETED: 15,
    LONG_TERM_CLIENT: 15,
    MULTIPLE_POLICIES: 15,
    LIFE_EVENT_DETECTED: 10,
    HIGH_RELATIONSHIP_SCORE: 20
  };

  signals.forEach(signal => {
    score += weights[signal] || 0;
  });

  if (relationshipScore >= 80) score += 10;

  return Math.max(0, Math.min(100, Math.round(score)));
}

function getReferralLikelihood(score) {
  if (score >= 85) return "VERY_HIGH";
  if (score >= 70) return "HIGH";
  if (score >= 45) return "MEDIUM";
  return "LOW";
}

function getRecommendedTiming(signals = []) {
  if (signals.includes("SUCCESSFUL_CLAIM")) return "AFTER_CLAIM";
  if (signals.includes("POLICY_REVIEW_COMPLETED")) return "NEXT_REVIEW";
  if (signals.includes("POSITIVE_INTERACTION") || signals.includes("HIGH_RELATIONSHIP_SCORE")) return "NOW";
  if (signals.includes("LONG_TERM_CLIENT") || signals.includes("MULTIPLE_POLICIES")) return "AFTER_RENEWAL";
  return "WAIT";
}

function getRecommendedApproach(signals = []) {
  if (signals.includes("SUCCESSFUL_CLAIM")) {
    return "Aprovechar la experiencia positiva de servicio antes de pedir una introduccion.";
  }

  if (signals.includes("POLICY_REVIEW_COMPLETED")) {
    return "Pedir referido despues de cerrar valor en una revision clara y util.";
  }

  if (signals.includes("LIFE_EVENT_DETECTED")) {
    return "Usar el contexto de vida para preguntar por personas en una situacion similar.";
  }

  if (signals.includes("HIGH_RELATIONSHIP_SCORE")) {
    return "Pedir una introduccion puntual desde confianza existente, no una lista de contactos.";
  }

  return "Esperar una interaccion positiva mas clara antes de pedir referido.";
}

function detectReferralOpportunity(input = {}) {
  const client = input.client || {};
  const timeline = normalizeTimeline(input.timeline);
  const opportunities = normalizeOpportunities(input.opportunities);
  const lifeEvents = normalizeLifeEvents(input.lifeEvents);
  const relationshipHistory = input.relationshipHistory || [];
  const clientId = client.id || client.clientId || input.clientId || "UNKNOWN_CLIENT";
  const relationshipScore = Number(input.relationshipScore || client.relationshipScore || 0);
  const signals = [];

  if (
    Number(client.clientSatisfaction || 0) >= 9 ||
    relationshipHistory.some(item => /gracias|excelente|muy bien|claro|perfecto/i.test(item.message || ""))
  ) {
    addSignal(signals, "POSITIVE_INTERACTION");
  }

  if (
    client.claimPaid ||
    timeline.some(event => event.type === "CLAIM_PAID" || event.type === "SUCCESSFUL_CLAIM") ||
    relationshipHistory.some(item => /siniestro pagado|claim paid|reembolso recibido/i.test(item.message || ""))
  ) {
    addSignal(signals, "SUCCESSFUL_CLAIM");
  }

  if (
    client.reviewCompleted ||
    opportunities.some(item => item.type === "REVIEW_OPPORTUNITY" && item.completed) ||
    timeline.some(event => /review|revisi[oó]n/i.test(`${event.type || ""} ${event.description || ""}`) && event.completed)
  ) {
    addSignal(signals, "POLICY_REVIEW_COMPLETED");
  }

  if (yearsBetween(client.clientSince || client.createdAt, input.now || new Date()) >= 3) {
    addSignal(signals, "LONG_TERM_CLIENT");
  }

  if (Number(client.policyCount || 0) >= 2 || (client.policies || []).length >= 2 || Number(input.policyCount || 0) >= 2) {
    addSignal(signals, "MULTIPLE_POLICIES");
  }

  if (lifeEvents.some(event => event.type && event.type !== "UNKNOWN")) {
    addSignal(signals, "LIFE_EVENT_DETECTED");
  }

  if (
    relationshipScore >= 80 ||
    opportunities.some(item => item.type === "REFERRAL_OPPORTUNITY") ||
    timeline.some(event => event.type === "REFERRAL_OPPORTUNITY")
  ) {
    addSignal(signals, "HIGH_RELATIONSHIP_SCORE");
  }

  const referralScore = calculateReferralScore({
    signals,
    relationshipScore
  });
  const referralLikelihood = getReferralLikelihood(referralScore);

  return {
    engine: "REFERRAL_OPPORTUNITY_ENGINE",
    version: "0.5",
    clientId,
    referralScore,
    referralLikelihood,
    referralSignals: signals,
    recommendedTiming: getRecommendedTiming(signals),
    recommendedApproach: getRecommendedApproach(signals),
    confidence: signals.length
      ? Math.min(95, 45 + signals.length * 10)
      : 20
  };
}

function detectarMomentoReferido({
  policyIssued = false,
  claimPaid = false,
  reviewCompleted = false,
  clientSatisfaction = 0
} = {}) {
  if (claimPaid || clientSatisfaction >= 9) return "HIGH";
  if (policyIssued || reviewCompleted) return "MEDIUM";
  return "LOW";
}

module.exports = {
  detectReferralOpportunity,
  detectarMomentoReferido,
  calculateReferralScore,
  getReferralLikelihood
};
