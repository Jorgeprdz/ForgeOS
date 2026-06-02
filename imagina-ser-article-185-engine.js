function calculateArticle185Benefit({
  annualContributionMXN,
  estimatedTaxRate,
  article185AnnualLimitMXN = 152000
}) {
  const deductibleAmount =
    Math.min(annualContributionMXN, article185AnnualLimitMXN);

  const estimatedTaxDeferral =
    deductibleAmount * estimatedTaxRate;

  return {
    fiscalBucket: "ARTICLE_185",
    annualContributionMXN,
    deductibleAmount,
    estimatedTaxDeferral,
    netAnnualEffortAfterDeferral:
      annualContributionMXN - estimatedTaxDeferral,
    mode: "ESTIMATED_TAX_DEFERRAL_NOT_GUARANTEED"
  };
}

module.exports = {
  calculateArticle185Benefit
};
