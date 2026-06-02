function buildNashFollowup({ context, personality }) {
  const name = context.name || "oye";

  const map = {
    PROTECTOR:
      `Hola ${name}, solo retomo rápido. La idea no era venderte nada por mensaje, sino revisar si hoy tienes protegidas las cosas que más te importan: familia, salud y planes futuros.`,
    CONSTRUCTOR:
      `Hola ${name}, retomo rápido. Creo que puede tener sentido revisar si lo que estás construyendo hoy también está protegido financieramente.`,
    ANALYTICAL:
      `Hola ${name}, retomo rápido. Si te sirve, podemos verlo con números y escenarios claros, sin compromiso ni vueltas.`,
    RELATIONAL:
      `Hola ${name}, solo paso a retomar. Más que venderte algo, quería abrir una conversación útil y ver si hay algo que valga la pena revisar.`,
    VISIONARY:
      `Hola ${name}, retomo rápido. La idea es revisar si tus decisiones actuales están alineadas con el futuro que quieres construir.`
  };

  return {
    followupTiming: "24-48 horas después del primer mensaje si no responde",
    followupMessage: map[personality.personality] || map.RELATIONAL,
    followupGoal: "Reabrir conversación sin presión",
    nextIfNoResponse: "Esperar 5-7 días y cambiar ángulo, no insistir con producto."
  };
}

module.exports = { buildNashFollowup };
