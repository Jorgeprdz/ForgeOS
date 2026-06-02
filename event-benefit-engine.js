function calculateEventBenefits({
  sumAssured,
  currency,
  eventDefinitions,
  currentExchangeRate = null
}) {
  if (!sumAssured) throw new Error("Missing sumAssured");
  if (!currency) throw new Error("Missing currency");
  if (!Array.isArray(eventDefinitions)) throw new Error("Missing eventDefinitions");

  return eventDefinitions.map((event) => {
    const benefitAmount = sumAssured * event.percentage;
    const mxn = currentExchangeRate ? benefitAmount * currentExchangeRate : null;

    return {
      code: event.code,
      category: event.category,
      name: event.name,
      percentage: event.percentage,
      benefitAmount,
      currency,
      mxn,
      conversionStatus: currentExchangeRate
        ? "CONVERTED_TO_MXN"
        : "BLOCKED_NO_EXCHANGE_RATE",
      source: event.source
    };
  });
}

module.exports = {
  calculateEventBenefits
};
