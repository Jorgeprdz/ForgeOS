const {
  projectCurrencyValue
} = require("./shared-currency-projection-engine");

function buildMxnFinancialTimeline({
  policyCurrency,
  currentRate,
  annualGrowthRate,
  rows
}) {
  if (!policyCurrency) throw new Error("Missing policyCurrency");
  if (!currentRate) throw new Error("Missing currentRate");
  if (annualGrowthRate === undefined) throw new Error("Missing annualGrowthRate");
  if (!Array.isArray(rows)) throw new Error("rows must be an array");

  return rows.map((row) => {
    const projectedRate = projectCurrencyValue({
      currentValue: currentRate,
      annualGrowthRate,
      years: row.year
    });

    const basicPremiumMXN = (row.basicPremium || 0) * projectedRate;
    const avePremiumMXN = (row.avePremium || 0) * projectedRate;
    const totalPremiumMXN = basicPremiumMXN + avePremiumMXN;
    const accumulatedPremiumMXN = (row.accumulatedPremium || 0) * projectedRate;
    const recoveryMXN = (row.recovery || 0) * projectedRate;
    const sumAssuredMXN = (row.sumAssured || 0) * projectedRate;

    const recoveryPercent = accumulatedPremiumMXN > 0
      ? (recoveryMXN / accumulatedPremiumMXN) * 100
      : 0;

    return {
      ...row,
      projectedRate,
      basicPremiumMXN,
      avePremiumMXN,
      totalPremiumMXN,
      accumulatedPremiumMXN,
      recoveryMXN,
      sumAssuredMXN,
      recoveryPercent,
      calculationMode: "MXN_TIMELINE_SCENARIO_NOT_GUARANTEED"
    };
  });
}

module.exports = {
  buildMxnFinancialTimeline
};
