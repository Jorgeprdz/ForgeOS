export function buildRetirementPresentationScenario({
  parsedQuote = {},
  currentUdiValue = 8.7
}) {
  const base = parsedQuote.scenarios.base;
  const monthlyIncome = base.monthlyIncome;
  const annualIncome = monthlyIncome * 12;

  const premium = parsedQuote.premiumStructure;

  const totalContributed =
    premium.totalAnnualPremium * premium.premiumPayingYears;

  const ages = [
    parsedQuote.retirementAge,
    premium.paidUntilAge,
    75,
    80,
    90,
    99
  ].filter((age, index, array) => array.indexOf(age) === index)
   .sort((a, b) => a - b);

  const milestones = ages.map((age) => {
    const yearsReceiving = Math.max(age - parsedQuote.retirementAge, 0);
    const totalReceivedUdi = annualIncome * yearsReceiving;

    return {
      age,
      yearsReceiving,
      totalReceivedUdi,
      totalReceivedMXN: totalReceivedUdi * currentUdiValue,
      reason:
        age === premium.paidUntilAge
          ? 'Termina periodo de pago limitado'
          : age === parsedQuote.retirementAge
            ? 'Inicio de retiro'
            : age === 75
              ? '10 años cobrando renta'
              : age === 80
                ? '15 años cobrando renta'
                : age === 90
                  ? 'Escenario de longevidad'
                  : 'Última edad visible en la cotización'
    };
  });

  return {
    productName: parsedQuote.productName,
    currency: parsedQuote.currency,
    currentUdiValue,

    summary: {
      currentAge: parsedQuote.currentAge,
      retirementAge: parsedQuote.retirementAge,
      coverageYears: parsedQuote.coverageYears,

      premiumPayingYears: premium.premiumPayingYears,
      paidUntilAge: premium.paidUntilAge,

      basicAnnualPremiumUDI: premium.basicAnnualPremium,
      basicAnnualPremiumMXN: premium.basicAnnualPremium * currentUdiValue,

      plannedAnnualContributionUDI: premium.plannedAnnualContribution,
      plannedAnnualContributionMXN: premium.plannedAnnualContribution * currentUdiValue,

      totalAnnualPremiumUDI: premium.totalAnnualPremium,
      totalAnnualPremiumMXN: premium.totalAnnualPremium * currentUdiValue,

      totalContributedUDI: totalContributed,
      totalContributedMXN: totalContributed * currentUdiValue,

      lumpSumUDI: base.lumpSum,
      lumpSumMXN: base.lumpSum * currentUdiValue,

      monthlyIncomeUDI: monthlyIncome,
      monthlyIncomeMXN: monthlyIncome * currentUdiValue
    },

    milestones
  };
}
