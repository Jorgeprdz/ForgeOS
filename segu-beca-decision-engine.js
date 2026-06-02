function buildSeguBecaDecision({
  childAge,
  termYears,
  educationCapitalUDI,
  finalRecoveryUDI,
  monthlyDeliveryUDI
}) {
  return {
    whatItMeans:
      `El menor tiene ${childAge} años. Eso significa que quedan ${termYears} años para construir un capital educativo antes de los 18.`,
    options: [
      "Mantener el plan actual.",
      "Revisar si el capital educativo alcanza para la universidad esperada.",
      "Aumentar protección o ahorro si el objetivo educativo es más alto."
    ],
    recommendation:
      "Usar el capital educativo como base de decisión y revisar si cubre colegiatura, inscripción y gastos complementarios.",
    nextBestStep:
      `Validar si ${educationCapitalUDI.toLocaleString("es-MX")} UDI de capital educativo y ${finalRecoveryUDI.toLocaleString("es-MX")} UDI de recuperación total son suficientes para el objetivo familiar.`,
    monthlyDeliveryUDI,
    decisionType: "EDUCATION_CAPITAL_DECISION"
  };
}

module.exports = {
  buildSeguBecaDecision
};
