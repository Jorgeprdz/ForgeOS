const {
  calculateAveGrowth
} = require("./shared-ave-growth-engine");

function calculateAveDeathBenefit({
  baseDeathBenefit,
  avePurchases = []
}) {
  if (baseDeathBenefit === undefined || baseDeathBenefit === null) {
    throw new Error("Missing baseDeathBenefit");
  }

  if (!Array.isArray(avePurchases)) {
    throw new Error("avePurchases must be an array");
  }

  const aveDetails = avePurchases.map((purchase) => {
    const growth = calculateAveGrowth({
      aveType: purchase.aveType,
      currency: purchase.currency,
      principal: purchase.principal,
      years: purchase.years
    });

    return {
      ...purchase,
      guaranteedRate: growth.guaranteedRate,
      projectedValue: growth.projectedValue,
      guaranteedInterest: growth.guaranteedInterest
    };
  });

  const totalAveProjectedValue =
    aveDetails.reduce(
      (sum, item) => sum + item.projectedValue,
      0
    );

  const totalGuaranteedInterest =
    aveDetails.reduce(
      (sum, item) => sum + item.guaranteedInterest,
      0
    );

  const totalDeathBenefit =
    Number(baseDeathBenefit) + totalAveProjectedValue;

  return {
    baseDeathBenefit: Number(baseDeathBenefit),
    aveDetails,
    totalAveProjectedValue,
    totalGuaranteedInterest,
    totalDeathBenefit,
    calculationMode: "BASE_DEATH_BENEFIT_PLUS_GUARANTEED_AVE_VALUE"
  };
}

module.exports = {
  calculateAveDeathBenefit
};
