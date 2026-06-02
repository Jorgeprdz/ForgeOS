function buildDecisionScore({
  benefitDefined,
  decisionPresent,
  recommendationPresent,
  nextStepPresent,
  priceLast
}) {
  let score = 0;

  if (benefitDefined) score += 20;
  if (decisionPresent) score += 20;
  if (recommendationPresent) score += 20;
  if (nextStepPresent) score += 20;
  if (priceLast) score += 20;

  return {
    score,
    classification:
      score >= 90
        ? "EXCELLENT"
        : score >= 70
        ? "GOOD"
        : "NEEDS_IMPROVEMENT"
  };
}

module.exports = {
  buildDecisionScore
};
