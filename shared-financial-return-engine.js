function calculateFinancialReturn({
  totalContributed,
  totalRecovered
}) {
  if (totalContributed === undefined || totalRecovered === undefined) {
    throw new Error("Missing totalContributed or totalRecovered");
  }

  const profit = totalRecovered - totalContributed;
  const returnPercent = totalContributed > 0
    ? (profit / totalContributed) * 100
    : 0;

  return {
    totalContributed,
    totalRecovered,
    profit,
    returnPercent,
    calculationMode: "CONTRIBUTED_VS_RECOVERED"
  };
}

function calculateAnnualContribution({
  annualPremium,
  years
}) {
  return annualPremium * years;
}

module.exports = {
  calculateFinancialReturn,
  calculateAnnualContribution
};
