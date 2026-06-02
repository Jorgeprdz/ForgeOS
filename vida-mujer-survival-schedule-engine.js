export function buildVidaMujerSurvivalSchedule({
  sumAssured = 0,
  currency = 'UDI',
  startAge = 0,
  coverageYears = 20,
  exchangeRateToMXN = null,
  projectionRate = null
}) {
  const baseSumAssured = Number(sumAssured || 0);
  const normalizedCurrency = String(currency || 'UDI').toUpperCase();
  const currentRate = Number(exchangeRateToMXN || 0);

  const canConvertToMXN = currentRate > 0;
  const canProjectRate =
    canConvertToMXN &&
    projectionRate !== null &&
    projectionRate !== undefined &&
    Number.isFinite(Number(projectionRate));

  function getRateForYear(year) {
    if (!canConvertToMXN) return null;

    if (!canProjectRate) {
      return currentRate;
    }

    return currentRate * Math.pow(1 + Number(projectionRate), year);
  }

  const intermediateYears = [
    5,
    7,
    9,
    11,
    13,
    15,
    17
  ].filter((year) => year <= coverageYears);

  function buildPayment({ year, percent, type }) {
    const amount = baseSumAssured * (percent / 100);
    const projectedRateToMXN = getRateForYear(year);

    return {
      year,
      age: startAge + year - 1,
      percent,
      amount,
      currency: normalizedCurrency,
      projectedRateToMXN,
      amountMXN:
        projectedRateToMXN !== null
          ? amount * projectedRateToMXN
          : null,
      type,
      mxnMode:
        canProjectRate
          ? 'PROJECTED_RATE'
          : canConvertToMXN
            ? 'CURRENT_RATE'
            : 'MISSING_EXCHANGE_RATE'
    };
  }

  const payments = intermediateYears.map((year) =>
    buildPayment({
      year,
      percent: 5,
      type: 'INTERMEDIATE_SURVIVAL_BENEFIT'
    })
  );

  if (coverageYears >= 20) {
    payments.push(
      buildPayment({
        year: 20,
        percent: 80,
        type: 'FINAL_SURVIVAL_BENEFIT'
      })
    );
  }

  const totalSurvivalBenefit =
    payments.reduce(
      (sum, payment) => sum + payment.amount,
      0
    );

  const totalSurvivalBenefitMXN =
    canConvertToMXN
      ? payments.reduce(
          (sum, payment) => sum + Number(payment.amountMXN || 0),
          0
        )
      : null;

  return {
    sumAssured: baseSumAssured,
    currency: normalizedCurrency,
    sumAssuredMXN:
      canConvertToMXN
        ? baseSumAssured * currentRate
        : null,
    startAge,
    coverageYears,
    exchangeRateToMXN:
      canConvertToMXN
        ? currentRate
        : null,
    projectionRate:
      canProjectRate
        ? Number(projectionRate)
        : null,
    conversionStatus:
      canProjectRate
        ? 'PROJECTED_TO_MXN_BY_PAYMENT_YEAR'
        : canConvertToMXN
          ? 'CONVERTED_TO_MXN_WITH_CURRENT_RATE'
          : 'MISSING_EXCHANGE_RATE',
    payments,
    totalSurvivalBenefit,
    totalSurvivalBenefitMXN
  };
}
