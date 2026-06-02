function buildMessageRecommendation({ context, council }) {
  const hasChildren = context.children > 0;
  const isProfessional =
    context.lifeSignals.includes("PROFESSIONAL_PROFILE");

  let angle = "protección financiera";
  let productAffinity = ["VIDA", "GMM"];

  if (hasChildren) {
    angle = "tranquilidad familiar y futuro de sus hijos";
    productAffinity = ["VIDA", "GMM", "EDUCACION"];
  }

  if (isProfessional && hasChildren) {
    productAffinity.push("RETIRO");
  }

  const firstMessage =
    `Hola ${context.name}, vi algo de tu perfil y me dio la impresión de que estás en una etapa donde seguramente tienes muchas prioridades compitiendo al mismo tiempo: trabajo, familia y futuro.\n\n` +
    `Te escribo porque estoy ayudando a personas en etapas similares a revisar si su estrategia financiera realmente protege lo que están construyendo.\n\n` +
    `No quiero venderte nada por mensaje. Solo quería preguntarte si te haría sentido platicarlo 10 minutos y ver si hay algo que valga la pena revisar.`;

  const followupMessage =
    `Hola ${context.name}, solo retomo rápido.\n\n` +
    `La idea no es complicarte la vida ni hablarte de productos. Es revisar si hoy tienes cubiertos los riesgos que podrían afectar tus planes familiares o profesionales.\n\n` +
    `Si te hace sentido, lo vemos breve.`;

  const nextBestAction =
    context.channel === "whatsapp"
      ? "Enviar primer mensaje por WhatsApp y esperar respuesta antes de mandar información de producto."
      : "Usar canal más personal disponible antes de enviar propuesta.";

  return {
    recommendedAngle: angle,
    productAffinity,
    recommendedChannel: context.channel,
    firstMessage,
    followupMessage,
    nextBestAction,
    risk:
      "Si el mensaje menciona seguros demasiado pronto, puede activar rechazo.",
    mirandaScore: 92,
    joyScore: 90,
    nashScore: 94
  };
}

module.exports = {
  buildMessageRecommendation
};
