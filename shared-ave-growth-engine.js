const AVE_GUARANTEED_RATES = {
  AVE_SHORT_TERM: {
    USD: 0.01,
    UDI: 0.005
  },
  AVE_LONG_TERM: {
    USD: 0.02,
    UDI: 0.01
  }
};

function calculateAveGrowth({
  aveType,
  currency,
  principal,
  years
}) {
  if (!aveType) throw new Error("Missing aveType");
  if (!currency) throw new Error("Missing currency");
  if (principal === undefined || principal === null) throw new Error("Missing principal");
  if (years === undefined || years === null) throw new Error("Missing years");

  const rate = AVE_GUARANTEED_RATES[aveType]?.[currency];

  if (rate === undefined) {
    throw new Error(`Unsupported AVE combination: ${aveType} ${currency}`);
  }

  const projectedValue = principal * Math.pow(1 + rate, years);
  const guaranteedInterest = projectedValue - principal;

  return {
    aveType,
    currency,
    principal,
    years,
    guaranteedRate: rate,
    projectedValue,
    guaranteedInterest,
    calculationMode: "GUARANTEED_RATE_ONLY"
  };
}

module.exports = {
  calculateAveGrowth,
  AVE_GUARANTEED_RATES
};
