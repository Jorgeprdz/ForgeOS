export function parseSolucionlineRetirementQuote({ text = '' }) {
  const clean = String(text).replace(/\s+/g, ' ');

  const getNumber = (value) =>
    Number(String(value || '').replace(/,/g, ''));

  const productMatch = clean.match(/IMAGINA SER\s+(\d+)\s+PAGOS/i);
  const limitedMatch = clean.match(/LIMITADOS\s+(\d+)/i);
  const ageMatch = clean.match(/Edad:\s*(\d+)/i);
  const currencyMatch = clean.match(/Moneda:\s*([A-Z]+)/i);
  const interestRateMatch = clean.match(/tasa de interés utilizada.*?(\d+(?:\.\d+)?)\s*%/i);
  const coverageMatch = clean.match(/IMAGINA SER\s+\d+\s+PAGOS\s+(\d+)\s+años\s+([\d,]+)\s+([\d,.]+)/i);
  const basicPremiumMatch = clean.match(/Prima básica\s+([\d,]+)\s+([\d,]+)\s+([\d,]+)\s+([\d,]+)/i);
  const plannedPremiumMatch = clean.match(/Prima planeada\s+([\d,]+)\s+([\d,]+)\s+([\d,]+)\s+([\d,]+)/i);
  const totalPremiumMatch = clean.match(/Prima total\s+([\d,]+)\s+([\d,]+)\s+([\d,]+)\s+([\d,]+)/i);
  const scenarioMatch = clean.match(/(\d+)\s+65\s+([\d,]+)\s+([\d,]+)\s+([\d,]+)\s+([\d,]+)\s+([\d,]+)\s+([\d,]+)/);

  const currentAge = getNumber(ageMatch?.[1]);
  const retirementAge = getNumber(productMatch?.[1]);
  const coverageYears = retirementAge - currentAge;
  const premiumPayingYears = getNumber(limitedMatch?.[1]);
  const paidUntilAge = currentAge + premiumPayingYears;

  const basicAnnualPremium = getNumber(basicPremiumMatch?.[4]);
  const plannedAnnualContribution = getNumber(plannedPremiumMatch?.[4]);
  const totalAnnualPremium = getNumber(totalPremiumMatch?.[4]);
  const sumAssured = getNumber(coverageMatch?.[2]);
  const scenarioEvidence = scenarioMatch
    ? {
        base: {
          lumpSum: getNumber(scenarioMatch[2]),
          monthlyIncome: getNumber(scenarioMatch[3]),
        },
        favorable: {
          lumpSum: getNumber(scenarioMatch[4]),
          monthlyIncome: getNumber(scenarioMatch[5]),
        },
        unfavorable: {
          lumpSum: getNumber(scenarioMatch[6]),
          monthlyIncome: getNumber(scenarioMatch[7]),
        },
      }
    : {
        base: {
          lumpSum: null,
          monthlyIncome: null,
        },
        favorable: {
          lumpSum: null,
          monthlyIncome: null,
        },
        unfavorable: {
          lumpSum: null,
          monthlyIncome: null,
        },
      };

  return {
    productName: productMatch
      ? `IMAGINA SER ${retirementAge} PAGOS LIMITADOS ${premiumPayingYears || 'UNKNOWN'}`
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

    sumAssured,

    scenarios: scenarioEvidence,

    interestRate: interestRateMatch
      ? getNumber(interestRateMatch[1])
      : null,

    evidence: {
      productName: productMatch ? 'SOURCE_TEXT' : 'MISSING',
      currentAge: ageMatch ? 'SOURCE_TEXT' : 'MISSING',
      currency: currencyMatch ? 'SOURCE_TEXT' : 'MISSING',
      sumAssured: coverageMatch ? 'SOURCE_TEXT' : 'MISSING',
      premiumStructure:
        basicPremiumMatch && plannedPremiumMatch && totalPremiumMatch
          ? 'SOURCE_TEXT'
          : 'MISSING',
      scenarios: scenarioMatch ? 'SOURCE_TEXT' : 'MISSING'
    }
  };
}
