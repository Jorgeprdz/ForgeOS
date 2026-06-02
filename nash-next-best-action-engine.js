function buildNextBestAction(input = {}) {
  const responseStatus = input.responseStatus || "NEW";
  const daysSinceContact = Number(input.daysSinceContact || 0);
  const objectionType = input.objectionType || null;
  const objectionIntent = input.objectionIntent || null;
  const intent = input.intent || null;
  const primaryIntent = intent?.primaryIntent || objectionIntent;
  const interestLevel = input.interestLevel || "UNKNOWN";
  const relationshipEvent = input.relationshipEvent || null;
  const personality = input.personality || "UNKNOWN";

  if (primaryIntent === "READY_TO_MEET") {
    return {
      action: "SCHEDULE_APPOINTMENT",
      priority: "HIGH",
      timing: "NOW",
      reason: "La respuesta indica disposicion para reunirse; conviene cerrar fecha y hora.",
      recommendedStyle: "Confirmar microcompromiso concreto sin abrir otra conversacion larga.",
      personality,
      intent: primaryIntent
    };
  }

  if (primaryIntent === "REQUESTS_INFO") {
    return {
      action: "SEND_CONTEXT_THEN_ASK",
      priority: "MEDIUM",
      timing: "NOW",
      reason: "Pidio informacion; enviar solo contexto util y regresar con una pregunta.",
      recommendedStyle: "Evitar mandar una propuesta larga sin diagnostico.",
      personality,
      intent: primaryIntent
    };
  }

  if (objectionType || objectionIntent) {
    return {
      action: "HANDLE_OBJECTION",
      priority: "HIGH",
      timing: "NOW",
      reason: "Hay objeción activa; primero se debe mantener viva la conversación.",
      recommendedStyle: "Validar, diagnosticar intención y responder sin vender producto.",
      personality,
      intent: primaryIntent
    };
  }

  if (interestLevel === "HIGH") {
    return {
      action: "SCHEDULE_APPOINTMENT",
      priority: "HIGH",
      timing: "NOW",
      reason: "El prospecto mostró interés; el siguiente paso es mover a cita.",
      recommendedStyle: "Cerrar microcompromiso de 10-15 minutos.",
      personality
    };
  }

  if (responseStatus === "NO_RESPONSE" && daysSinceContact >= 2 && daysSinceContact <= 4) {
    return {
      action: "SEND_FOLLOWUP",
      priority: "MEDIUM",
      timing: "TODAY",
      reason: "Silencio de 48-96 horas; conviene retomar sin presión.",
      recommendedStyle:
        personality === "PROTECTOR"
          ? "Followup emocional, familiar y tranquilo."
          : "Followup breve y útil.",
      personality
    };
  }

  if (responseStatus === "NO_RESPONSE" && daysSinceContact >= 7) {
    return {
      action: "REACTIVATE_PROSPECT",
      priority: "LOW",
      timing: "THIS_WEEK",
      reason: "El prospecto se enfrió; cambiar ángulo antes de insistir.",
      recommendedStyle: "Nuevo contexto, cero reproche, cero presión.",
      personality
    };
  }

  if (relationshipEvent) {
    return {
      action: "SEND_RELATIONSHIP_MESSAGE",
      priority: "MEDIUM",
      timing: "EVENT_DATE",
      reason: `Evento de relación detectado: ${relationshipEvent}.`,
      recommendedStyle: "Mensaje humano, personal y no comercial.",
      personality
    };
  }

  if (responseStatus === "NEW") {
    return {
      action: "SEND_FIRST_MESSAGE",
      priority: "HIGH",
      timing: "TODAY",
      reason: "Prospecto nuevo sin contacto inicial.",
      recommendedStyle: "Abrir conversación sin hablar de producto.",
      personality
    };
  }

  return {
    action: "ASK_DISCOVERY_QUESTION",
    priority: "MEDIUM",
    timing: "NEXT_INTERACTION",
    reason: "Hay conversación abierta pero falta información para recomendar.",
    recommendedStyle: "Hacer una pregunta simple que revele necesidad.",
    personality
  };
}

module.exports = {
  buildNextBestAction
};
