function buildSeguBecaClientPresentation({
  childName,
  childAge,
  contractorName,
  contractorAge,
  termYears,
  educationCapitalUDI,
  finalRecoveryUDI,
  monthlyDeliveryUDI,
  totalAnnualPremiumUDI,
  recommendedAnnualPremiumUDI,
  decision,
  educationOptions
}) {
  return {
    product: "SEGU_BECA",
    presentationType: "CLIENT_VIEW",
    rule: "CHILD_FUTURE_FIRST_PRICE_LAST",
    slides: [
      {
        slide: 1,
        title: "Tu hijo va a crecer más rápido que tu ahorro",
        body:
          `Hoy ${childName} tiene ${childAge} años. Eso significa que quedan ${termYears} años para preparar el dinero de su universidad.`
      },
      {
        slide: 2,
        title: "El problema no es la universidad de hoy",
        body:
          "El problema es cuánto podría costar cuando realmente llegue el momento de pagarla."
      },
      {
        slide: 3,
        title: "La idea central",
        body:
          "SeguBeca busca construir un capital educativo para que la decisión de estudiar no dependa de improvisar dinero en el último momento."
      },
      {
        slide: 4,
        title: "No estás comprando una universidad",
        body:
          educationOptions
            ? educationOptions.message
            : "Estás comprando opciones para que tu hijo pueda elegir."
      },
      {
        slide: 5,
        title: "Escenario universidad pública",
        body:
          "Si tu hijo elige UNAM, IPN o UAM, el capital puede servir para transporte, materiales, computadora, idiomas, intercambio, titulación o posgrado."
      },
      {
        slide: 6,
        title: "Escenario universidad privada",
        body:
          "Si tu hijo elige una universidad privada, el capital puede ayudar a cubrir parcial o totalmente la carrera, según el costo futuro."
      },
      {
        slide: 7,
        title: "Capital educativo",
        body:
          `La cotización muestra un ahorro educativo base de ${educationCapitalUDI.toLocaleString("es-MX")} UDI y una recuperación total de ${finalRecoveryUDI.toLocaleString("es-MX")} UDI.`
      },
      {
        slide: 8,
        title: "Qué significa",
        body: decision.whatItMeans
      },
      {
        slide: 9,
        title: "Ahora sí: el esfuerzo anual",
        body:
          `Prima total anual: ${totalAnnualPremiumUDI.toLocaleString("es-MX")} UDI. Con recomendados: ${recommendedAnnualPremiumUDI.toLocaleString("es-MX")} UDI.`
      }
    ],
    appendix: {
      title: "Apéndice de decisión educativa",
      questionsAnswered: [
        "¿Cuántos años faltan para los 18?",
        "¿Cuál es el capital educativo?",
        "¿Qué opciones abre si estudia en pública?",
        "¿Qué opciones abre si estudia en privada?",
        "¿Qué decisión debe tomar la familia?"
      ],
      decision,
      educationOptions
    }
  };
}

module.exports = {
  buildSeguBecaClientPresentation
};
