function projectCurrencyValue({
  amount,
  currency,
  yearsFromNow = 0,
  currentExchangeRate,
  annualProjectionRate = null
}) {
  if (amount === undefined || amount === null) {
    throw new Error("Missing amount");
  }

  if (!currency) {
    throw new Error("Missing currency");
  }

  if (!currentExchangeRate) {
    return {
      amount,
      currency,
      yearsFromNow,
      projectedRate: null,
      mxn: null,
      conversionStatus: "BLOCKED_NO_EXCHANGE_RATE"
    };
  }

  if (
    annualProjectionRate === undefined ||
    annualProjectionRate === null
  ) {
    return {
      amount,
      currency,
      yearsFromNow,
      projectedRate: currentExchangeRate,
      mxn: amount * currentExchangeRate,
      conversionStatus: "CURRENT_RATE_ONLY"
    };
  }

  const projectedRate =
    currentExchangeRate *
    Math.pow(
      1 + annualProjectionRate,
      yearsFromNow
    );

  return {
    amount,
    currency,
    yearsFromNow,
    projectedRate,
    mxn: amount * projectedRate,
    conversionStatus:
      "PROJECTED_TO_MXN_BY_PAYMENT_YEAR"
  };
}

module.exports = {
  projectCurrencyValue
};
