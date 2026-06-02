const SUPPORTED_PRODUCTS = [
  "VIDA_MUJER",
  "ORVI",
  "SEGU_BECA",
  "IMAGINA_SER",
  "RESPALDO_EDUCATIVO",
  "NUEVO_PLENITUD"
];

const SUPPORTED_CURRENCIES = [
  "UDI",
  "USD"
];

function evaluateAveEligibility({
  product,
  currency,
  policyYear
}) {
  const reasons = [];

  if (!SUPPORTED_PRODUCTS.includes(product)) {
    reasons.push("UNSUPPORTED_PRODUCT");
  }

  if (!SUPPORTED_CURRENCIES.includes(currency)) {
    reasons.push("UNSUPPORTED_CURRENCY");
  }

  if (
    policyYear === undefined ||
    policyYear === null ||
    policyYear < 1
  ) {
    reasons.push("INVALID_POLICY_YEAR");
  }

  return {
    eligible: reasons.length === 0,
    reasons,
    calculationMode:
      "SHARED_AVE_ELIGIBILITY_RULES"
  };
}

module.exports = {
  evaluateAveEligibility
};
