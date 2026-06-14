const { evaluateCandidateHardFactors } = require("./candidate-hard-factors-engine");
const { evaluateCandidateVitalFactors } = require("./candidate-vital-factors-engine");
const { evaluateCandidateCoachability } = require("./candidate-coachability-engine");
const { evaluateCandidateMarketQuality } = require("./candidate-market-quality-engine");

function clampScore(score) {
  return Math.max(0, Math.min(100, Math.round(score)));
}

function hasValue(value) {
  return value !== undefined && value !== null && value !== "";
}

function collectCompleteness(input) {
  const groups = [
    ["hardFactors", ["age", "marriage", "maritalStatus", "yearsLivingInTown", "career", "employmentStatus"], 5],
    ["vitalFactors", ["mentalAgility", "drive", "energy", "moneyMotivation", "character", "integrity", "successHistory", "retentionPotential"], 8],
    ["coachabilitySignals", ["completesAssignments", "followsProcess", "attendsInterviews", "memorizesScripts", "acceptsFeedback", "missesInterviews", "ignoresInstructions", "wantsOwnSystem", "incompleteTasks"], 9],
    ["marketQuality", ["project200Size", "advisorReferralsCount", "prospectCount", "networkStrength", "appointmentPotential"], 5]
  ];

  let present = 0;
  let expected = 0;

  groups.forEach(([groupName, keys, expectedCount]) => {
    const group = input[groupName] || input;
    expected += expectedCount;

    if (groupName === "hardFactors") {
      if (hasValue(group.age)) present += 1;
      if (hasValue(group.marriage) || hasValue(group.maritalStatus)) present += 1;
      if (hasValue(group.yearsLivingInTown)) present += 1;
      if (hasValue(group.career)) present += 1;
      if (hasValue(group.employmentStatus)) present += 1;
      return;
    }

    keys.forEach(key => {
      if (hasValue(group[key])) present += 1;
    });
  });

  return clampScore((present / expected) * 100);
}

function hasCriticalCharacterRisk(input, vitalResult) {
  const vital = input.vitalFactors || input;
  const character = Number(vital.character);
  const integrity = Number(vital.integrity);

  return (
    (!Number.isNaN(character) && character < 50) ||
    (!Number.isNaN(integrity) && integrity < 50) ||
    vitalResult.risks.some(risk => risk.includes("Character requires") || risk.includes("Integrity requires"))
  );
}

function detectContradictions(input, results) {
  const risks = [];
  const vital = input.vitalFactors || input;

  if (Number(vital.energy) >= 80 && Number(vital.character) < 55) {
    risks.push("High energy with weak character signal requires manager review.");
  }

  if (results.market.score >= 80 && results.coachability.score < 50) {
    risks.push("Large market is offset by low coachability.");
  }

  if (results.coachability.strengths.length >= 3 && results.coachability.risks.length > 0) {
    risks.push("Coachability signals are mixed and need another manager read.");
  }

  if (results.vital.score >= 75 && results.market.score < 50) {
    risks.push("Strong personal factors need a market-building plan.");
  }

  return risks;
}

function decideRecommendation(scores, input, results, contradictionRisks, confidence) {
  const criticalCharacterRisk = hasCriticalCharacterRisk(input, results.vital);

  if (criticalCharacterRisk || scores.coachabilityScore < 35 || scores.vitalFactorScore < 45 || scores.overallScore < 45) {
    return "REJECT";
  }

  if (scores.coachabilityScore < 60 || scores.marketQualityScore < 50) {
    return "COACH";
  }

  if (confidence < 55 || contradictionRisks.length > 0 || scores.overallScore < 75) {
    return "WATCH";
  }

  return "ADVANCE";
}

function managerActionFromRecommendation(recommendation, scores) {
  if (recommendation === "ADVANCE") return "Proceed to Career Interview";
  if (recommendation === "COACH") return "Assign Coaching";
  if (recommendation === "REJECT") return "Reject Candidate";
  if (scores.overallScore >= 65) return "Proceed to Additional Interview";
  return "Review Candidate";
}

function evaluateCandidateAssessment(input = {}) {
  const hard = evaluateCandidateHardFactors(input.hardFactors || input);
  const vital = evaluateCandidateVitalFactors(input.vitalFactors || input);
  const coachability = evaluateCandidateCoachability(input.coachabilitySignals || input.coachability || input);
  const market = evaluateCandidateMarketQuality(input.marketQuality || input.marketSignals || input);

  const hardFactorScore = hard.score;
  const vitalFactorScore = vital.score;
  const coachabilityScore = coachability.score;
  const marketQualityScore = market.score;

  const overallScore = clampScore(
    hardFactorScore * 0.2 +
      vitalFactorScore * 0.35 +
      coachabilityScore * 0.25 +
      marketQualityScore * 0.2
  );

  const results = { hard, vital, coachability, market };
  const contradictionRisks = detectContradictions(input, results);
  const confidence = collectCompleteness(input);

  const scores = {
    overallScore,
    hardFactorScore,
    vitalFactorScore,
    coachabilityScore,
    marketQualityScore
  };

  const recommendation = decideRecommendation(scores, input, results, contradictionRisks, confidence);

  return {
    overallScore,
    hardFactorScore,
    vitalFactorScore,
    coachabilityScore,
    marketQualityScore,
    strengths: []
      .concat(hard.strengths)
      .concat(vital.strengths)
      .concat(coachability.strengths)
      .concat(market.strengths),
    risks: []
      .concat(hard.risks)
      .concat(vital.risks)
      .concat(coachability.risks)
      .concat(market.risks)
      .concat(contradictionRisks),
    recommendation,
    managerAction: managerActionFromRecommendation(recommendation, scores),
    confidence
  };
}

module.exports = {
  evaluateCandidateAssessment
};
