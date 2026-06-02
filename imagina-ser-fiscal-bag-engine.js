function getAllowedFiscalBags({
  variant,
  retirementAge,
  contributionScheme
}) {
  const canUsePPR151 =
    retirementAge === 65 &&
    [
      "LEVEL_PREMIUM",
      "LIMITED_PAY_10",
      "LIMITED_PAY_15"
    ].includes(contributionScheme);

  const bags = [];

  if (canUsePPR151) {
    bags.push({
      bag: "PPR_151",
      humanName: "Bolso PPR / Artículo 151",
      benefitType: "DOUBLE_FISCAL_BENEFIT",
      eligible: true
    });
  }

  bags.push({
    bag: "ARTICLE_185",
    humanName: "Bolso Deducible / Artículo 185",
    benefitType: "TAX_DEFERRAL",
    eligible: true
  });

  bags.push({
    bag: "NON_DEDUCTIBLE",
    humanName: "Bolso No Deducible",
    benefitType: "NO_CURRENT_DEDUCTION",
    eligible: true
  });

  return {
    variant,
    retirementAge,
    contributionScheme,
    allowedBags: bags
  };
}

function selectPreferredFiscalBag({
  variant,
  retirementAge,
  contributionScheme,
  advisorPreference = "PREFER_151"
}) {
  const eligibility = getAllowedFiscalBags({
    variant,
    retirementAge,
    contributionScheme
  });

  const ppr151 =
    eligibility.allowedBags.find(b => b.bag === "PPR_151");

  if (advisorPreference === "PREFER_151" && ppr151) {
    return {
      ...eligibility,
      selectedBag: ppr151,
      routing: "ARTICLE_151_ENGINE"
    };
  }

  const article185 =
    eligibility.allowedBags.find(b => b.bag === "ARTICLE_185");

  return {
    ...eligibility,
    selectedBag: article185,
    routing: "ARTICLE_185_ENGINE"
  };
}

module.exports = {
  getAllowedFiscalBags,
  selectPreferredFiscalBag
};
