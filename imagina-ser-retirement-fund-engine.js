function analyzeRetirementFund(rows = []) {
  const paidRows = rows.filter(row =>
    row.basicPremiumUDI > 0 || row.plannedPremiumUDI > 0
  );

  const totalContributedUDI = paidRows.reduce(
    (sum, row) => sum + row.basicPremiumUDI + row.plannedPremiumUDI,
    0
  );

  const finalRow = rows[rows.length - 1] || {};

  const finalReserveFundUDI =
    finalRow.reserveFundUDI || 0;

  const growthUDI =
    finalReserveFundUDI - totalContributedUDI;

  const growthPercent =
    totalContributedUDI > 0
      ? (growthUDI / totalContributedUDI) * 100
      : 0;

  return {
    paymentYears: paidRows.length,
    totalContributedUDI,
    finalReserveFundUDI,
    growthUDI,
    growthPercent,
    finalCashValueUDI: finalRow.cashValueUDI || 0,
    retirementAgeApprox: finalRow.age + 1,
    mode: "RETIREMENT_FUND_ANALYSIS"
  };
}

module.exports = {
  analyzeRetirementFund
};
