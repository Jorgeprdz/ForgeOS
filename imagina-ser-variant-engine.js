function detectImaginaSerVariantFromText(text = "") {
  const normalized = text
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  const isImaginaSer = /IMAGINA SER/.test(normalized);

  if (!isImaginaSer) {
    return {
      product: "UNKNOWN",
      variant: "UNKNOWN",
      retirementAge: null,
      contributionScheme: "UNKNOWN",
      paymentYears: null
    };
  }

  const retirementAge =
    /IMAGINA SER 70|70 ANOS/.test(normalized) ? 70 :
    /IMAGINA SER 60|60 ANOS/.test(normalized) ? 60 :
    /IMAGINA SER 65|65 ANOS/.test(normalized) ? 65 :
    null;

  const isPL15 =
    /PAGOS\s+LIMITADOS\s+15|PL15|65-15/.test(normalized);

  const isPL10 =
    /PAGOS\s+LIMITADOS\s+10|PL10|65-10/.test(normalized);

  const isSinglePremium =
    /PRIMA\s+UNICA|PAGO\s+UNICO/.test(normalized) &&
    !/OPCION\s+DE\s+LIQUIDACION:\s+PAGO\s+UNICO/.test(normalized);

  const contributionScheme =
    isPL15 ? "LIMITED_PAY_15" :
    isPL10 ? "LIMITED_PAY_10" :
    isSinglePremium ? "SINGLE_PREMIUM" :
    "LEVEL_PREMIUM";

  const paymentYears =
    contributionScheme === "LIMITED_PAY_15" ? 15 :
    contributionScheme === "LIMITED_PAY_10" ? 10 :
    contributionScheme === "SINGLE_PREMIUM" ? 1 :
    null;

  const variant =
    retirementAge === 65 && contributionScheme === "LIMITED_PAY_15" ? "IMAGINA_SER_65_PL15" :
    retirementAge === 65 && contributionScheme === "LIMITED_PAY_10" ? "IMAGINA_SER_65_PL10" :
    retirementAge === 65 && contributionScheme === "SINGLE_PREMIUM" ? "IMAGINA_SER_65_SINGLE_PREMIUM" :
    retirementAge === 60 && contributionScheme === "SINGLE_PREMIUM" ? "IMAGINA_SER_60_SINGLE_PREMIUM" :
    retirementAge === 70 && contributionScheme === "SINGLE_PREMIUM" ? "IMAGINA_SER_70_SINGLE_PREMIUM" :
    retirementAge === 60 ? "IMAGINA_SER_60" :
    retirementAge === 65 ? "IMAGINA_SER_65" :
    retirementAge === 70 ? "IMAGINA_SER_70" :
    "IMAGINA_SER_UNKNOWN_VARIANT";

  return {
    product: "IMAGINA_SER",
    variant,
    retirementAge,
    contributionScheme,
    paymentYears,
    fiscalRoutingRequired: true
  };
}

function detectImaginaSerVariantFromCoverageName(coverageName = "") {
  return detectImaginaSerVariantFromText(`IMAGINA SER ${coverageName}`);
}

module.exports = {
  detectImaginaSerVariantFromText,
  detectImaginaSerVariantFromCoverageName
};
