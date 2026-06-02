function buildTaxProfile({ annualIncome = 0, taxRegime = "SUELDOS_Y_SALARIOS" }) {
  let estimatedRate = 0.15;

  if (annualIncome >= 3500000) estimatedRate = 0.35;
  else if (annualIncome >= 1250000) estimatedRate = 0.32;
  else if (annualIncome >= 900000) estimatedRate = 0.30;
  else if (annualIncome >= 400000) estimatedRate = 0.21;

  return {
    annualIncome,
    taxRegime,
    estimatedRate,
    mode: "ESTIMATED_ISR_PROFILE"
  };
}

module.exports = { buildTaxProfile };
