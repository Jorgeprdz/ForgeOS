const {
  selectPreferredFiscalBag
} = require("./imagina-ser-fiscal-bag-engine");

const {
  calculateArticle151Benefit
} = require("./imagina-ser-article-151-engine");

const {
  calculateArticle185Benefit
} = require("./imagina-ser-article-185-engine");

function routeImaginaSerFiscal({
  variantInfo,
  annualContributionMXN,
  annualIncomeMXN,
  estimatedTaxRate,
  umaAnnualLimitMXN,
  article185AnnualLimitMXN = 152000,
  advisorPreference = "PREFER_151"
}) {
  const fiscalSelection = selectPreferredFiscalBag({
    variant: variantInfo.variant,
    retirementAge: variantInfo.retirementAge,
    contributionScheme: variantInfo.contributionScheme,
    advisorPreference
  });

  if (fiscalSelection.routing === "ARTICLE_151_ENGINE") {
    return {
      variantInfo,
      fiscalSelection,
      result: calculateArticle151Benefit({
        annualContributionMXN,
        annualIncomeMXN,
        estimatedTaxRate,
        umaAnnualLimitMXN
      })
    };
  }

  return {
    variantInfo,
    fiscalSelection,
    result: calculateArticle185Benefit({
      annualContributionMXN,
      estimatedTaxRate,
      article185AnnualLimitMXN
    })
  };
}

module.exports = {
  routeImaginaSerFiscal
};
