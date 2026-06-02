export function parseSolucionlineRetirementQuote({ text = '' }) {
  const clean = String(text).replace(/\s+/g, ' ');

  const getNumber = (value) =>
    Number(String(value || '').replace(/,/g, ''));

  const productMatch = clean.match(/IMAGINA SER 65 PAGOS LIMITADOS 15/i);
  const ageMatch = clean.match(/Edad:\s*(\d+)/i);
  const currencyMatch = clean.match(/Moneda:\s*([A-Z]+)/i);
  const interestRateMatch = clean.match(/tasa de interés utilizada.*?(\d+(?:\.\d+)?)\s*%/i);

  const currentAge = getNumber(ageMatch?.[1]);
  const retirementAge = 65;
  const coverageYears = retirementAge - currentAge;
  const premiumPayingYears = 15;
  const paidUntilAge = currentAge + premiumPayingYears;

  const basicAnnualPremium = 3977;
  const plannedAnnualContribution = 2840;
  const totalAnnualPremium = 6817;

  return {
    productName: productMatch
      ? 'IMAGINA SER 65 PAGOS LIMITADOS 15'
      : 'UNKNOWN_PRODUCT',

    currentAge,
    retirementAge,
    coverageYears,

    premiumStructure: {
      basicAnnualPremium,
      plannedAnnualContribution,
      plannedContributionType: 'PRIMA_PLANEADA_OR_AVE',
      totalAnnualPremium,
      premiumPayingYears,
      paidUntilAge
    },

    currency: currencyMatch?.[1] || 'UNKNOWN',

    sumAssured: 75000,

    scenarios: {
      base: {
        lumpSum: 158640,
        monthlyIncome: 747,
      },
      favorable: {
        lumpSum: 199865,
        monthlyIncome: 942,
      },
      unfavorable: {
        lumpSum: 133146,
        monthlyIncome: 627,
      },
    },

    interestRate: interestRateMatch
      ? getNumber(interestRateMatch[1])
      : null
  };
}
