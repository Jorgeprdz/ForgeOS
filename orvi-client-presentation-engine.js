function buildOrviClientPresentation({
  quote,
  year20,
  year25,
  year30,
  year71,
  waitScenarios,
  sumAssuredTodayMXN
}) {
  return {
    product: "ORVI",
    presentationType: "CLIENT_VIEW",
    rule: "PROTECTION_FIRST_NUMBERS_LATER",
    slides: [
      {
        slide: 1,
        title: "Un seguro de vida que no se siente como dinero perdido",
        body:
          "La mayoría piensa que si nunca usa su seguro, el dinero se perdió. ORVI cambia esa conversación."
      },
      {
        slide: 2,
        title: "La idea central",
        body:
          "ORVI protege a tu familia si llegas a faltar, pero también puede darte un valor garantizado si más adelante decides cancelar."
      },
      {
        slide: 3,
        title: "Las tres puertas",
        body:
          "Puerta 1: si falleces, tu familia recibe protección. Puerta 2: si cancelas, puedes recibir valor garantizado. Puerta 3: si llegas al final del plan, recibes el beneficio de supervivencia."
      },
      {
        slide: 4,
        title: "El comodín",
        body:
          "Después de terminar de pagar, puedes dejar tu dinero trabajando dentro del plan sin seguir aportando."
      },
      {
        slide: 5,
        title: "Cancelar hoy vs esperar",
        body:
          `Al año 20 podrías tener aproximadamente ${year20.cashValueMXNText}. Si esperas 5 años más, podría rondar ${year25.cashValueMXNText}. Si esperas 10 años más, podría rondar ${year30.cashValueMXNText}.`
      },
      {
        slide: 6,
        title: "Protección para tu familia",
        body:
          `La suma asegurada contratada es de ${quote.sumAssuredUDI.toLocaleString("es-MX")} UDI, equivalente hoy aproximadamente a ${sumAssuredTodayMXN}.`
      },
      {
        slide: 7,
        title: "Qué significa",
        body:
          "No estás comprando solo un seguro. Estás comprando protección con una salida financiera posible."
      },
      {
        slide: 8,
        title: "Ahora sí: el esfuerzo anual",
        body:
          `La aportación anual total de esta cotización es de ${quote.totalAnnualPremiumUDI.toLocaleString("es-MX")} UDI.`
      }
    ],
    appendix: {
      title: "Apéndice de decisión",
      questionsAnswered: [
        "¿Qué pasa si cancelo al terminar de pagar?",
        "¿Qué pasa si espero 5 años?",
        "¿Qué pasa si espero 10 años?",
        "¿Qué pasa si fallezco?",
        "¿Qué pasa si llego al final del plan?"
      ],
      waitScenarios
    }
  };
}

module.exports = {
  buildOrviClientPresentation
};
