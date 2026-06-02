function analyzeContributionStructure({
  basicPremium = 0,
  plannedPremium = 0,
  additionalPremium = 0
}) {
  const retirementCoreContribution =
    basicPremium + plannedPremium;

  const totalContribution =
    retirementCoreContribution + additionalPremium;

  return {
    basicPremium,
    plannedPremium,
    additionalPremium,
    retirementCoreContribution,
    totalContribution,
    rule:
      "PRIMA_BASICA_PLUS_PRIMA_PLANEADA_BUILD_RETIREMENT_FUND"
  };
}

module.exports = {
  analyzeContributionStructure
};
