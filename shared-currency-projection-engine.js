function projectCurrencyValue({
  currentValue,
  annualGrowthRate,
  years
}) {
  if (currentValue === undefined) throw new Error("Missing currentValue");
  if (annualGrowthRate === undefined) throw new Error("Missing annualGrowthRate");
  if (years === undefined) throw new Error("Missing years");

  return currentValue * Math.pow(1 + annualGrowthRate, years);
}

function estimateFuturePremiumMXN({
  policyCurrency,
  annualPremium,
  currentRate,
  annualGrowthRate,
  targetYear
}) {
  const projectedRate = projectCurrencyValue({
    currentValue: currentRate,
    annualGrowthRate,
    years: targetYear
  });

  return {
    policyCurrency,
    annualPremium,
    currentRate,
    annualGrowthRate,
    targetYear,
    projectedRate,
    estimatedPremiumMXN: annualPremium * projectedRate,
    calculationMode: "SCENARIO_BASED_ESTIMATE_NOT_GUARANTEED"
  };
}

module.exports = {
  projectCurrencyValue,
  estimateFuturePremiumMXN
};
