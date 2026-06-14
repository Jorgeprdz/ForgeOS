function clampScore(score) {
  return Math.max(0, Math.min(100, Math.round(score)));
}

function hasValue(value) {
  return value !== undefined && value !== null && value !== "";
}

function normalizeFactor(value) {
  if (!hasValue(value)) return null;
  if (typeof value === "boolean") return value ? 85 : 35;

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

function scoreVitalFactor(name, label, value, strengths, risks) {
  const score = normalizeFactor(value);

  if (score === null) {
    risks.push(`${label} is missing.`);
    return 45;
  }

  if (score >= 75) {
    strengths.push(`${label} is strong.`);
  } else if (score < 50) {
    risks.push(`${label} is weak.`);
  }

  if ((name === "character" || name === "integrity") && score < 60) {
    risks.push(`${label} requires manager review before advancing.`);
  }

  return clampScore(score);
}

function recommendationFromScore(score, risks) {
  const criticalRisk = risks.some(risk => risk.includes("Character") || risk.includes("Integrity"));

  if (criticalRisk && score < 70) return "REJECT";
  if (score >= 78 && !criticalRisk) return "ADVANCE";
  if (score >= 62) return "WATCH";
  if (score >= 45) return "COACH";
  return "REJECT";
}

function evaluateCandidateVitalFactors(input = {}) {
  const factors = input.vitalFactors || input;
  const strengths = [];
  const risks = [];

  const factorDefinitions = [
    ["mentalAgility", "Mental agility"],
    ["drive", "Drive"],
    ["energy", "Energy"],
    ["moneyMotivation", "Money motivation"],
    ["character", "Character"],
    ["integrity", "Integrity"],
    ["successHistory", "Success history"],
    ["retentionPotential", "Retention potential"]
  ];

  const scores = factorDefinitions.map(([name, label]) =>
    scoreVitalFactor(name, label, factors[name], strengths, risks)
  );

  const score = clampScore(scores.reduce((sum, value) => sum + value, 0) / scores.length);

  return {
    score,
    strengths,
    risks,
    recommendation: recommendationFromScore(score, risks)
  };
}

module.exports = {
  evaluateCandidateVitalFactors
};
