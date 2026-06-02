function explainNumber({
  label,
  value,
  meaning
}) {
  return {
    label,
    value,
    meaning
  };
}

function buildDecisionClarity({
  primaryBenefit,
  value
}) {
  const dictionary = {
    RETIREMENT_INCOME:
      "Este ingreso representa dinero que podría ayudarte a mantener tu estilo de vida cuando ya no quieras trabajar.",

    EDUCATION_CAPITAL:
      "Este capital representa recursos que podrían utilizarse para la educación futura.",

    PROTECTION_AND_SURVIVAL:
      "Este beneficio representa protección económica y posibles beneficios por supervivencia.",

    RETIREMENT_CAPITAL:
      "Este capital representa recursos acumulados para tu retiro."
  };

  return {
    primaryBenefit,
    value,
    explanation:
      dictionary[primaryBenefit] ||
      "Beneficio principal del producto."
  };
}

module.exports = {
  explainNumber,
  buildDecisionClarity
};
