const BENEFIT_MAP = {
  IMAGINA_SER: {
    primaryBenefit: "RETIREMENT_INCOME",
    secondaryBenefits: [
      "LIFE_PROTECTION",
      "TAX_BENEFITS",
      "ESTATE_TRANSFER"
    ]
  },

  SEGU_BECA: {
    primaryBenefit: "EDUCATION_CAPITAL",
    secondaryBenefits: [
      "LIFE_PROTECTION",
      "DISABILITY_PROTECTION"
    ]
  },

  VIDA_MUJER: {
    primaryBenefit: "PROTECTION_AND_SURVIVAL",
    secondaryBenefits: [
      "CASH_VALUE",
      "AVE"
    ]
  },

  ORVI: {
    primaryBenefit: "RETIREMENT_CAPITAL",
    secondaryBenefits: []
  },

  REALIZA: {
    primaryBenefit: "DISCOVER",
    secondaryBenefits: []
  }
};

function getBenefitHierarchy(productType) {
  return BENEFIT_MAP[productType] || {
    primaryBenefit: "UNKNOWN",
    secondaryBenefits: []
  };
}

module.exports = {
  BENEFIT_MAP,
  getBenefitHierarchy
};
