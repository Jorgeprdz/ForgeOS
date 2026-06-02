function calculateArticle151Benefit({
  annualContributionMXN,
  annualIncomeMXN,
  estimatedTaxRate,
  umaAnnualLimitMXN = 0
}) {
  const tenPercentIncome = annualIncomeMXN * 0.10;

  const deductibleLimit =
    umaAnnualLimitMXN > 0
      ? Math.min(tenPercentIncome, umaAnnualLimitMXN)
      : tenPercentIncome;

  const deductibleAmount =
    Math.min(annualContributionMXN, deductibleLimit);

  const estimatedRefund =
    deductibleAmount * estimatedTaxRate;

  const netCost =
    annualContributionMXN - estimatedRefund;

  return {
    fiscalBucket: "ARTICLE_151_PPR",
    annualContributionMXN,
    annualIncomeMXN,
    estimatedTaxRate,
    deductibleLimit,
    deductibleAmount,
    estimatedRefund,
    netCost,
    doubleFiscalBenefit: true,
    mode: "ESTIMATED_NOT_GUARANTEED"
  };
}

module.exports = { calculateArticle151Benefit };
