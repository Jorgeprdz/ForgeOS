const {
  projectCurrencyValue
} = require("./shared-currency-projection-engine");

function convertOrviTimelineToMXN({
  timeline,
  currentRate,
  annualGrowthRate = 0.045
}) {
  return timeline.map(row => {
    const projectedRate = projectCurrencyValue({
      currentValue: currentRate,
      annualGrowthRate,
      years: row.year
    });

    return {
      ...row,
      projectedRate,
      annualPremiumMXN: row.annualPremiumUDI * projectedRate,
      avePremiumMXN: row.avePremiumUDI * projectedRate,
      totalAnnualOutflowMXN: row.totalAnnualOutflowUDI * projectedRate,
      cashValueMXN: row.cashValueUDI * projectedRate,
      calculationMode: "UDI_TO_MXN_SCENARIO_NOT_GUARANTEED"
    };
  });
}

function convertAmountTodayMXN({ amountUDI, currentRate }) {
  return amountUDI * currentRate;
}

module.exports = {
  convertOrviTimelineToMXN,
  convertAmountTodayMXN
};
