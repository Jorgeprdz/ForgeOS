const { buildRelationshipNextAction } = require("./relationship-next-action-engine");

function normalizeTimeline(inputTimeline) {
  if (Array.isArray(inputTimeline)) return inputTimeline;
  if (Array.isArray(inputTimeline?.timeline)) return inputTimeline.timeline;
  return [];
}

function normalizeText(value = "") {
  return String(value).toLowerCase();
}

function policyText(policy = {}) {
  return normalizeText([
    policy.productName,
    policy.lineOfBusiness,
    policy.type,
    policy.category,
    policy.policyType,
    policy.carrier?.productName
  ].filter(Boolean).join(" "));
}

function hasPolicyMatching(policies = [], patterns = []) {
  return policies.some(policy => {
    const text = policyText(policy);
    return patterns.some(pattern => pattern.test(text));
  });
}

function hasChildren(client = {}) {
  return Number(client.children || client.dependents || 0) > 0;
}

function addOpportunity(opportunities, opportunity) {
  if (!opportunity) return;

  const exists = opportunities.some(item => item.type === opportunity.type);
  if (exists) return;

  opportunities.push(opportunity);
}

function priorityRank(priority) {
  const rank = {
    CRITICAL: 4,
    HIGH: 3,
    MEDIUM: 2,
    LOW: 1
  };

  return rank[priority] || 0;
}

function typeRank(type) {
  const rank = {
    PROTECTION_GAP: 90,
    HEALTH_PROTECTION_GAP: 85,
    RETIREMENT_GAP: 80,
    EDUCATION_GAP: 75,
    REVIEW_OPPORTUNITY: 70,
    REFERRAL_OPPORTUNITY: 65,
    CROSS_SELL_OPPORTUNITY: 60,
    LIFE_EVENT_OPPORTUNITY: 55
  };

  return rank[type] || 0;
}

function rankOpportunities(opportunities = []) {
  return opportunities.slice().sort((a, b) => {
    const priorityDiff = priorityRank(b.priority) - priorityRank(a.priority);
    if (priorityDiff !== 0) return priorityDiff;

    const confidenceDiff = Number(b.confidence || 0) - Number(a.confidence || 0);
    if (confidenceDiff !== 0) return confidenceDiff;

    return typeRank(b.type) - typeRank(a.type);
  });
}

function calculateRelationshipScore({ client = {}, policies = [], relationshipHistory = [], timeline = [] }) {
  let score = 50;

  score += Math.min(relationshipHistory.length * 4, 20);
  score += Math.min(policies.length * 5, 15);

  const inbound = relationshipHistory.filter(item => item.direction === "INBOUND").length;
  score += Math.min(inbound * 5, 15);

  if (policies.some(policy => Number(policy.clientSatisfaction || 0) >= 9)) score += 10;
  if (timeline.some(event => event.type === "REFERRAL_OPPORTUNITY")) score += 8;
  if (timeline.some(event => event.type === "PAYMENT_OVERDUE")) score -= 20;
  if (relationshipHistory.some(item => item.outcome === "NO_RESPONSE")) score -= 10;
  if (client.relationshipStatus === "AT_RISK") score -= 15;

  return Math.max(0, Math.min(100, Math.round(score)));
}

function detectRelationshipOpportunities(input = {}) {
  const client = input.client || {};
  const policies = input.policies || [];
  const relationshipHistory = input.relationshipHistory || [];
  const timeline = normalizeTimeline(input.timeline);
  const clientId = client.id || client.clientId || input.clientId || "UNKNOWN_CLIENT";
  const opportunities = [];
  const hasLife = hasPolicyMatching(policies, [/vida/, /life/, /protecci[oó]n/]);
  const hasHealth = hasPolicyMatching(policies, [/gmm/, /salud/, /medical/, /health/]);
  const hasRetirement = hasPolicyMatching(policies, [/retiro/, /retirement/, /pensi[oó]n/]);
  const hasEducation = hasPolicyMatching(policies, [/educaci[oó]n/, /education/, /beca/]);

  if (
    timeline.some(event => event.type === "REFERRAL_OPPORTUNITY") ||
    policies.some(policy => policy.policyIssued || policy.reviewCompleted || Number(policy.clientSatisfaction || 0) >= 9)
  ) {
    addOpportunity(opportunities, {
      type: "REFERRAL_OPPORTUNITY",
      confidence: 85,
      priority: "MEDIUM",
      reason: "Hay señales positivas de satisfacción, emisión o revisión completada.",
      recommendedAction: "ASK_FOR_REFERRALS"
    });
  }

  if (
    timeline.some(event => event.type === "POLICY_REVIEW") ||
    policies.some(policy => policy.nextReviewDate || policy.reviewDate)
  ) {
    addOpportunity(opportunities, {
      type: "REVIEW_OPPORTUNITY",
      confidence: 80,
      priority: "MEDIUM",
      reason: "Existe una revisión de póliza pendiente o próxima.",
      recommendedAction: "SCHEDULE_REVIEW"
    });
  }

  if ((hasChildren(client) || client.maritalStatus === "Casada" || client.maritalStatus === "Casado") && !hasLife) {
    addOpportunity(opportunities, {
      type: "PROTECTION_GAP",
      confidence: 78,
      priority: "HIGH",
      reason: "El cliente tiene dependientes o familia registrada y no hay póliza de vida/protección detectada.",
      recommendedAction: "SCHEDULE_REVIEW"
    });
  }

  if (Number(client.age || 0) >= 35 && !hasRetirement) {
    addOpportunity(opportunities, {
      type: "RETIREMENT_GAP",
      confidence: 72,
      priority: "MEDIUM",
      reason: "El cliente está en edad de planeación patrimonial y no hay cobertura de retiro detectada.",
      recommendedAction: "SCHEDULE_REVIEW"
    });
  }

  if (hasChildren(client) && !hasEducation) {
    addOpportunity(opportunities, {
      type: "EDUCATION_GAP",
      confidence: 75,
      priority: "MEDIUM",
      reason: "El cliente tiene hijos y no hay solución educativa detectada.",
      recommendedAction: "SCHEDULE_REVIEW"
    });
  }

  if (!hasHealth) {
    addOpportunity(opportunities, {
      type: "HEALTH_PROTECTION_GAP",
      confidence: 70,
      priority: "MEDIUM",
      reason: "No hay cobertura de salud/GMM detectada en las pólizas disponibles.",
      recommendedAction: "SCHEDULE_REVIEW"
    });
  }

  if (timeline.some(event => event.type === "LIFE_EVENT") || (client.lifeEvents || []).length > 0) {
    addOpportunity(opportunities, {
      type: "LIFE_EVENT_OPPORTUNITY",
      confidence: 82,
      priority: "HIGH",
      reason: "Hay un evento de vida registrado que puede cambiar necesidades de protección.",
      recommendedAction: "CALL_CLIENT"
    });
  }

  if (policies.length > 0 && (!hasLife || !hasHealth || !hasRetirement || (hasChildren(client) && !hasEducation))) {
    const nextAction = buildRelationshipNextAction({
      client,
      timeline,
      policies,
      relationshipHistory
    });

    addOpportunity(opportunities, {
      type: "CROSS_SELL_OPPORTUNITY",
      confidence: 65,
      priority: "LOW",
      reason: "Hay relación existente y al menos una brecha de cobertura detectada.",
      recommendedAction: nextAction.nextAction === "NO_ACTION" ? "SCHEDULE_REVIEW" : nextAction.nextAction
    });
  }

  const ranked = rankOpportunities(opportunities);

  return {
    engine: "RELATIONSHIP_OPPORTUNITY_ENGINE",
    version: "0.3",
    clientId,
    opportunities: ranked,
    bestOpportunity: ranked[0] || null,
    relationshipScore: calculateRelationshipScore({
      client,
      policies,
      relationshipHistory,
      timeline
    })
  };
}

module.exports = {
  detectRelationshipOpportunities,
  calculateRelationshipScore,
  rankOpportunities
};
