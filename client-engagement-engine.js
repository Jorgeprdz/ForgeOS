function parseDate(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

function daysSince(value, now = new Date()) {
  const date = parseDate(value);
  if (!date) return null;

  const start = new Date(date);
  start.setHours(0, 0, 0, 0);

  const end = new Date(now);
  end.setHours(0, 0, 0, 0);

  return Math.floor((end - start) / (1000 * 60 * 60 * 24));
}

function sortInteractions(history = []) {
  return history.slice().sort((a, b) => {
    const aDate = parseDate(a.date || a.createdAt);
    const bDate = parseDate(b.date || b.createdAt);

    if (!aDate && !bDate) return 0;
    if (!aDate) return 1;
    if (!bDate) return -1;

    return bDate - aDate;
  });
}

function calculateEngagementScore({ relationshipHistory = [], now = new Date() }) {
  const interactions = sortInteractions(relationshipHistory);
  const lastInteraction = interactions[0] || null;
  const inactiveDays = lastInteraction
    ? daysSince(lastInteraction.date || lastInteraction.createdAt, now)
    : null;

  let score = 45;
  score += Math.min(interactions.length * 4, 20);
  score += Math.min(interactions.filter(item => item.direction === "INBOUND").length * 8, 20);
  score += Math.min(interactions.filter(item => item.outcome === "POSITIVE").length * 8, 16);

  if (inactiveDays === null) score -= 25;
  else if (inactiveDays <= 7) score += 15;
  else if (inactiveDays <= 30) score += 5;
  else if (inactiveDays <= 60) score -= 10;
  else score -= 25;

  if (interactions.some(item => item.outcome === "NO_RESPONSE")) score -= 12;

  return Math.max(0, Math.min(100, Math.round(score)));
}

function resolveInactivityRisk(lastInteraction, now = new Date()) {
  if (!lastInteraction) return "CRITICAL";

  const inactiveDays = daysSince(lastInteraction.date || lastInteraction.createdAt, now);

  if (inactiveDays === null) return "CRITICAL";
  if (inactiveDays <= 14) return "LOW";
  if (inactiveDays <= 30) return "MEDIUM";
  if (inactiveDays <= 60) return "HIGH";
  return "CRITICAL";
}

function resolveRecommendedAction(inactivityRisk) {
  const map = {
    LOW: "NO_ACTION",
    MEDIUM: "CHECK_IN",
    HIGH: "SEND_WHATSAPP",
    CRITICAL: "CALL_CLIENT"
  };

  return map[inactivityRisk] || "CHECK_IN";
}

function buildClientEngagement(input = {}) {
  const now = input.now ? new Date(input.now) : new Date();
  const relationshipHistory = input.relationshipHistory || [];
  const interactions = sortInteractions(relationshipHistory);
  const lastInteraction = interactions[0] || null;
  const inactivityRisk = resolveInactivityRisk(lastInteraction, now);

  return {
    engine: "CLIENT_ENGAGEMENT_ENGINE",
    version: "1.0",
    engagementScore: calculateEngagementScore({
      relationshipHistory,
      now
    }),
    lastInteraction,
    inactivityRisk,
    recommendedAction: resolveRecommendedAction(inactivityRisk)
  };
}

module.exports = {
  buildClientEngagement,
  calculateEngagementScore,
  resolveInactivityRisk
};
