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

function addUnique(items, value) {
  if (!value || items.includes(value)) return;
  items.push(value);
}

function highestUrgency(urgencies = []) {
  if (urgencies.includes("TODAY")) return "TODAY";
  if (urgencies.includes("THIS_WEEK")) return "THIS_WEEK";
  if (urgencies.includes("THIS_MONTH")) return "THIS_MONTH";
  return "LOW";
}

function buildRelationshipReview(input = {}) {
  const timeline = normalizeTimeline(input.timeline);
  const opportunities = normalizeOpportunities(input.opportunities);
  const lifeEvents = normalizeLifeEvents(input.lifeEvents);
  const suggestedTopics = [];
  const reasons = [];
  const urgencies = [];

  if (timeline.some(event => event.type === "PAYMENT_OVERDUE")) {
    reasons.push("Pago vencido detectado.");
    urgencies.push("TODAY");
    addUnique(suggestedTopics, "PAYMENT_CONTINUITY");
  }

  if (timeline.some(event => event.type === "PAYMENT_DUE" && ["HIGH", "CRITICAL"].includes(event.priority))) {
    reasons.push("Pago próximo con prioridad alta.");
    urgencies.push("THIS_WEEK");
    addUnique(suggestedTopics, "PAYMENT_REMINDER");
  }

  if (timeline.some(event => event.type === "POLICY_RENEWAL" && ["HIGH", "CRITICAL"].includes(event.priority))) {
    reasons.push("Renovación próxima.");
    urgencies.push("THIS_WEEK");
    addUnique(suggestedTopics, "RENEWAL_REVIEW");
  }

  if (timeline.some(event => event.type === "POLICY_REVIEW")) {
    reasons.push("Revisión de póliza pendiente o próxima.");
    urgencies.push("THIS_MONTH");
    addUnique(suggestedTopics, "POLICY_REVIEW");
  }

  opportunities.forEach(opportunity => {
    if (/GAP/.test(opportunity.type)) {
      reasons.push("Brecha de protección u oportunidad comercial detectada.");
      urgencies.push(opportunity.priority === "HIGH" || opportunity.priority === "CRITICAL"
        ? "THIS_WEEK"
        : "THIS_MONTH");
      addUnique(suggestedTopics, opportunity.type);
    }

    if (opportunity.type === "REFERRAL_OPPORTUNITY") {
      addUnique(suggestedTopics, "REFERRAL_CONVERSATION");
    }
  });

  lifeEvents
    .filter(event => event.type && event.type !== "UNKNOWN")
    .forEach(event => {
      reasons.push(`Evento de vida detectado: ${event.type}.`);
      urgencies.push("THIS_MONTH");
      addUnique(suggestedTopics, event.type);
    });

  const reviewNeeded = reasons.length > 0;

  return {
    engine: "RELATIONSHIP_REVIEW_ENGINE",
    version: "1.0",
    reviewNeeded,
    reviewReason: reviewNeeded
      ? reasons[0]
      : "No hay evidencia suficiente para recomendar una revisión hoy.",
    urgency: reviewNeeded ? highestUrgency(urgencies) : "LOW",
    suggestedTopics
  };
}

module.exports = {
  buildRelationshipReview
};
