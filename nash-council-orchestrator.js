function runCouncil(context) {
  const jurgen = {
    engine: "JURGEN",
    motivators: [],
    insight: ""
  };

  if (context.children > 0) {
    jurgen.motivators.push("FAMILIA");
    jurgen.motivators.push("SEGURIDAD");
  }

  if (context.lifeSignals.includes("PROFESSIONAL_PROFILE")) {
    jurgen.motivators.push("CRECIMIENTO");
    jurgen.motivators.push("PATRIMONIO");
  }

  jurgen.insight =
    "El acercamiento debe partir de una preocupación real, no del producto.";

  const hitch = {
    engine: "HITCH",
    rapportStyle: "natural, cálido, cero vendedor",
    openerRule:
      "Abrir con contexto personal o profesional, no con seguros."
  };

  const jordan = {
    engine: "JORDAN",
    persuasionAngle:
      "Convertir una preocupación futura en una conversación simple hoy.",
    cta:
      "Abrir una conversación breve, no pedir una cita agresiva."
  };

  const patch = {
    engine: "PATCH",
    empathyRule:
      "Sonar humano, útil y respetuoso. Nada de presión."
  };

  const miranda = {
    engine: "MIRANDA",
    qaRule:
      "El mensaje debe aumentar probabilidad de respuesta y no sonar genérico."
  };

  const joy = {
    engine: "JOY",
    businessRule:
      "Si no ayuda a generar conversaciones comerciales reales, no sirve."
  };

  return {
    jurgen,
    hitch,
    jordan,
    patch,
    miranda,
    joy
  };
}

module.exports = {
  runCouncil
};
