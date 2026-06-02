const {
  projectCurrencyValue
} = require("./shared-currency-projection-engine");

function convertValueToday({
  amount,
  currentRate
}) {
  return amount * currentRate;
}

function convertValueFuture({
  amount,
  currentRate,
  annualGrowthRate,
  years
}) {
  const projectedRate = projectCurrencyValue({
    currentValue: currentRate,
    annualGrowthRate,
    years
  });

  return {
    projectedRate,
    futureValue: amount * projectedRate
  };
}

function estimateAnnualPremiumAtYear({
  annualPremium,
  currentRate,
  annualGrowthRate,
  year
}) {
  const projection = convertValueFuture({
    amount: annualPremium,
    currentRate,
    annualGrowthRate,
    years: year
  });

  return {
    year,
    annualPremium,
    projectedRate: projection.projectedRate,
    estimatedPremiumMXN: projection.futureValue,
    mode: "ESTIMATED_NOT_GUARANTEED"
  };
}

function buildMeaningfulNumbers({
  annualPremium,
  educationCapital,
  currentRate,
  annualGrowthRate,
  targetYears
}) {
  const premiumToday = convertValueToday({
    amount: annualPremium,
    currentRate
  });

  const educationCapitalToday = convertValueToday({
    amount: educationCapital,
    currentRate
  });

  const premiumMilestones = targetYears.map((year) =>
    estimateAnnualPremiumAtYear({
      annualPremium,
      currentRate,
      annualGrowthRate,
      year
    })
  );

  const educationCapitalAtEnd = convertValueFuture({
    amount: educationCapital,
    currentRate,
    annualGrowthRate,
    years: Math.max(...targetYears)
  });

  return {
    annualPremium,
    educationCapital,
    currentRate,
    annualGrowthRate,
    premiumToday,
    educationCapitalToday,
    premiumMilestones,
    educationCapitalAtEnd,
    mode: "MEANINGFUL_CLIENT_NUMBERS"
  };
}

module.exports = {
  convertValueToday,
  convertValueFuture,
  estimateAnnualPremiumAtYear,
  buildMeaningfulNumbers
};
