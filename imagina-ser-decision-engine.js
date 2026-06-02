function buildDecisionSummary({
  monthlyIncomeUDI,
  singlePaymentUDI,
  hasPlannedPremium
}) {
  return {
    whatItMeans:
      "Esta estrategia busca que llegues a tu edad de retiro con un fondo propio que pueda convertirse en ingreso mensual o recibirse en un solo pago.",
    options: [
      "Mantener el plan como está.",
      hasPlannedPremium
        ? "Conservar la aportación planeada para fortalecer el retiro."
        : "Evaluar agregar aportación planeada si se quiere acelerar el fondo.",
      "Comparar escenario base, favorable y desfavorable antes de decidir."
    ],
    review:
      "Revisar si el ingreso mensual estimado realmente se parece al estilo de vida que quieres tener al retiro.",
    nextBestStep:
      `Usar el escenario base como punto de partida: ${monthlyIncomeUDI} UDI mensuales o ${singlePaymentUDI} UDI en pago único.`
  };
}

module.exports = {
  buildDecisionSummary
};
