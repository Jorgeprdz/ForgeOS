function explainPremiumCurrencyBehavior({
  policyCurrency
}) {
  if (policyCurrency === "UDI") {
    return {
      stableInPolicyCurrency: true,
      clientExplanation:
        "La prima se mantiene expresada en UDI, pero el monto en pesos puede cambiar porque depende del valor de la UDI al momento de pago."
    };
  }

  if (policyCurrency === "USD") {
    return {
      stableInPolicyCurrency: true,
      clientExplanation:
        "La prima se mantiene expresada en dólares, pero el monto en pesos puede cambiar porque depende del tipo de cambio vigente."
    };
  }

  return {
    stableInPolicyCurrency: false,
    clientExplanation:
      "No se detectó una moneda proyectable para explicar variación de prima."
  };
}

module.exports = {
  explainPremiumCurrencyBehavior
};
