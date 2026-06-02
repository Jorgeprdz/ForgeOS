function money(value) {
  return Number(value || 0).toLocaleString("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0
  });
}

function buildVidaMujerClientPresentation(fixture) {
  const udi = fixture.projectionAssumptions.currentUDI;
  const annualPremiumMXN = fixture.annualPremiumUDI * udi;
  const monthlyPremiumMXN = annualPremiumMXN / 12;

  const survivalPercent =
    (fixture.survivalSchedule.totalUDI / fixture.basicSumAssuredUDI) * 100;

  return {
    product: "VIDA_MUJER",
    presentationType: "CLIENT_VIEW",
    rule: "PROTECTION_FIRST_PRICE_LAST",
    slides: [
      {
        slide: 1,
        title: "No estás comprando un seguro",
        body:
          "Estás comprando tranquilidad para que un problema médico no se convierta también en un problema financiero."
      },
      {
        slide: 2,
        title: "El riesgo no es enfermarse",
        body:
          "El riesgo es que una enfermedad cambie tus planes, tus ingresos y las decisiones de tu familia al mismo tiempo."
      },
      {
        slide: 3,
        title: "La idea detrás de Vida Mujer",
        body:
          "Vida Mujer busca acompañarte en distintos escenarios: cuando necesitas protección y también cuando las cosas salen bien."
      },
      {
        slide: 4,
        title: "Protección durante el camino",
        body:
          "La estrategia considera coberturas enfocadas en salud, protección familiar y continuidad financiera."
      },
      {
        slide: 5,
        title: "Y si todo sale bien",
        body:
          "Vida Mujer también contempla beneficios por supervivencia programados durante la vigencia."
      },
      {
        slide: 6,
        title: "Beneficios programados",
        body:
          `Forge detectó una suma asegurada de ${fixture.basicSumAssuredUDI.toLocaleString("es-MX")} UDI y beneficios por supervivencia en años específicos.`
      },
      {
        slide: 7,
        title: "Qué significa",
        body:
          `El beneficio total por supervivencia detectado es de ${fixture.survivalSchedule.totalUDI.toLocaleString("es-MX")} UDI, equivalente al ${survivalPercent.toFixed(1)}% de la suma asegurada original.`
      },
      {
        slide: 8,
        title: "Lo importante",
        body:
          "No significa rendimiento garantizado ni recuperación de primas. Significa que existe una estructura de beneficios por supervivencia definida por el producto."
      },
      {
        slide: 9,
        title: "Si nunca utilizas las coberturas",
        body:
          "Recibes los beneficios de supervivencia programados. Si ocurre un evento cubierto, las coberturas están ahí para ayudarte."
      },
      {
        slide: 10,
        title: "Decisión Forge",
        body:
          "Esta estrategia es adecuada para personas que buscan protección financiera, beneficios por supervivencia y coberturas enfocadas a la mujer."
      },
      {
        slide: 11,
        title: "Ahora sí: el esfuerzo anual",
        body:
          `Prima anual detectada: ${fixture.annualPremiumUDI.toLocaleString("es-MX")} UDI, equivalente aproximadamente a ${money(annualPremiumMXN)} anuales o ${money(monthlyPremiumMXN)} mensuales.`
      },
      {
        slide: 12,
        title: "Siguiente mejor paso",
        body:
          "Validar si hoy tienes una estrategia que te proteja si ocurre algo importante mañana."
      }
    ],
    appendix: {
      survivalSchedule: fixture.survivalSchedule,
      guaranteedValues: fixture.guaranteedValues,
      coverages: {
        PCF: fixture.PCF,
        PEP: fixture.PEP,
        CLP: fixture.CLP,
        BIT: fixture.BIT,
        BITC: fixture.BITC,
        CPV: fixture.CPV,
        PII: fixture.PII,
        ADAPTA: fixture.ADAPTA
      }
    }
  };
}

module.exports = {
  buildVidaMujerClientPresentation
};
