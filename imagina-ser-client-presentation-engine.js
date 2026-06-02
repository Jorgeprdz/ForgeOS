const { buildTwoBagsExplanation } = require("./imagina-ser-human-language-engine");

function buildClientPresentation({
  clientData,
  scenarioData,
  decision
}) {
  const bags = buildTwoBagsExplanation();

  return {
    presentationType: "CLIENT_VIEW",
    rule: "DESIRE_FIRST_PRICE_LAST",
    slides: [
      {
        slide: 1,
        title: "¿Cómo quieres vivir cuando ya no quieras trabajar?",
        body:
          "La pregunta no es cuánto cuesta un plan. La pregunta es si estás construyendo una fuente de ingreso para tu futuro."
      },
      {
        slide: 2,
        title: "El problema",
        body:
          "La AFORE difícilmente será suficiente para mantener tu estilo de vida. Por eso necesitas construir un fondo propio."
      },
      {
        slide: 3,
        title: "La idea central",
        body:
          "Imagina Ser busca convertir tus aportaciones de hoy en un fondo para tu retiro."
      },
      {
        slide: 4,
        title: bags.bag1.name,
        body: bags.bag1.explanation
      },
      {
        slide: 5,
        title: bags.bag2.name,
        body: bags.bag2.explanation
      },
      {
        slide: 6,
        title: "El resultado que buscamos",
        body:
          `En el escenario base, el plan muestra un posible ingreso mensual de ${scenarioData.monthlyIncomeUDI} UDI o un pago único de ${scenarioData.singlePaymentUDI} UDI.`
      },
      {
        slide: 7,
        title: "Qué significa",
        body: decision.whatItMeans
      },
      {
        slide: 8,
        title: "Ahora sí: el esfuerzo anual",
        body:
          "Después de entender el objetivo, revisamos cuánto requiere sostener esta estrategia."
      }
    ]
  };
}

module.exports = {
  buildClientPresentation
};
