function clampScore(score) {
  return Math.max(0, Math.min(100, Math.round(score)));
}

function hasValue(value) {
  return value !== undefined && value !== null && value !== "";
}

function normalizeTextScore(value) {
  if (!hasValue(value)) return null;
  const numeric = Number(value);
  if (!Number.isNaN(numeric)) {
    if (numeric <= 10) return numeric * 10;
    return numeric;
  }

  const text = String(value).toLowerCase();
  if (["high", "strong", "excellent"].some(signal => text.includes(signal))) return 85;
  if (["medium", "moderate", "average"].some(signal => text.includes(signal))) return 65;
  if (["low", "weak", "poor"].some(signal => text.includes(signal))) return 35;
  return 55;
}

function scoreProject200(size, strengths, risks) {
  if (!hasValue(size) || Number.isNaN(Number(size))) {
    risks.push("Project 200 size is missing.");
    return 45;
  }

  const numericSize = Number(size);
  if (numericSize >= 150) {
    strengths.push("Project 200 list is large.");
    return 90;
  }

  if (numericSize >= 80) {
    strengths.push("Project 200 list is workable.");
    return 70;
  }

  risks.push("Project 200 list is limited.");
  return 40;
}

function scoreCount(value, label, strongAt, workableAt, strengths, risks) {
  if (!hasValue(value) || Number.isNaN(Number(value))) {
    risks.push(`${label} is missing.`);
    return 45;
  }

  const count = Number(value);
  if (count >= strongAt) {
    strengths.push(`${label} is strong.`);
    return 85;
  }

  if (count >= workableAt) {
    strengths.push(`${label} is workable.`);
    return 65;
  }

  risks.push(`${label} is limited.`);
  return 40;
}

function scoreQuality(value, label, strengths, risks) {
  const score = normalizeTextScore(value);
  if (score === null) {
    risks.push(`${label} is missing.`);
    return 45;
  }

  if (score >= 75) strengths.push(`${label} is strong.`);
  if (score < 50) risks.push(`${label} is weak.`);
  return clampScore(score);
}

function marketQualityFromScore(score) {
  if (score >= 80) return "HIGH";
  if (score >= 60) return "MEDIUM";
  if (score >= 40) return "LOW";
  return "CRITICAL";
}

function recommendationFromScore(score) {
  if (score >= 80) return "ADVANCE";
  if (score >= 60) return "WATCH";
  if (score >= 40) return "COACH";
  return "REJECT";
}

function evaluateCandidateMarketQuality(input = {}) {
  const market = input.marketQuality || input.marketSignals || input;
  const strengths = [];
  const risks = [];

  const scores = [
    scoreProject200(market.project200Size, strengths, risks),
    scoreCount(market.advisorReferralsCount, "Advisor referrals count", 3, 1, strengths, risks),
    scoreCount(market.prospectCount, "Prospect count", 30, 10, strengths, risks),
    scoreQuality(market.networkStrength, "Network strength", strengths, risks),
    scoreQuality(market.appointmentPotential, "Appointment potential", strengths, risks)
  ];

  const score = clampScore(scores.reduce((sum, value) => sum + value, 0) / scores.length);

  if (score >= 80) {
    risks.push("Large market must still be validated with coachability and execution.");
  }

  return {
    score,
    marketQuality: marketQualityFromScore(score),
    strengths,
    risks,
    recommendation: recommendationFromScore(score)
  };
}

module.exports = {
  evaluateCandidateMarketQuality
};
