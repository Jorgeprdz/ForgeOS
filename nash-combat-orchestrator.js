function classifyObjection(text = "") {
  const objection = text.toLowerCase();

  if (/dinero|caro|presupuesto|ahorita no puedo|no me alcanza/.test(objection)) {
    return "FINANCIAL";
  }

  if (/tiempo|ocupad|agenda|después|luego/.test(objection)) {
    return "TIME";
  }

  if (/pensarlo|lo veo|lo reviso|déjame|dejame/.test(objection)) {
    return "STALL";
  }

  if (/ya tengo|ya cuento|mi empresa me da|tengo seguro/.test(objection)) {
    return "ALREADY_COVERED";
  }

  if (/no confío|desconfío|miedo|me da cosa|fraude/.test(objection)) {
    return "TRUST";
  }

  return "UNKNOWN";
}

function diagnoseObjection(type) {
  const map = {
    FINANCIAL: "No rechaza la solución. Rechaza el desembolso o no ve prioridad todavía.",
    TIME: "No rechaza el tema. Rechaza la fricción de dedicar tiempo.",
    STALL: "No tiene suficiente claridad para avanzar o está evitando una decisión.",
    ALREADY_COVERED: "Percibe que ya resolvió el problema, aunque quizá no ha revisado si sigue vigente o suficiente.",
    TRUST: "El problema no es el producto. Es confianza, credibilidad o malas experiencias previas.",
    UNKNOWN: "Falta contexto. No conviene presionar ni responder de forma agresiva."
  };

  return map[type] || map.UNKNOWN;
}

function buildObjectionResponse({ type, prospectName = "oye" }) {
  const responses = {
    FINANCIAL:
      `Totalmente válido, ${prospectName}. Justo por eso no me gusta empezar por costo. Primero vale la pena revisar si el riesgo que quieres cubrir realmente existe y qué impacto tendría no atenderlo. Si después no hace sentido, lo dejamos ahí.`,

    TIME:
      `Te entiendo, ${prospectName}. Por eso lo haría muy breve: 10 minutos para revisar si hay algo importante que valga la pena atender. Si no te aporta valor, no seguimos.`,

    STALL:
      `Claro, ${prospectName}. Antes de que lo pienses en frío, dime algo: ¿qué parte te gustaría entender mejor para tomar una decisión con más claridad?`,

    ALREADY_COVERED:
      `Qué bueno, ${prospectName}. Entonces no se trata de reemplazar nada. Muchas veces lo más valioso es revisar si lo que ya tienes todavía corresponde a tu etapa actual, ingresos, familia y objetivos.`,

    TRUST:
      `Te entiendo, ${prospectName}. Es normal tener reservas cuando se habla de dinero o seguros. Por eso prefiero explicarlo simple, sin presión y con números claros, para que tú decidas si tiene sentido.`,

    UNKNOWN:
      `Te entiendo. Cuéntame un poco más para entender bien qué te preocupa y responderte con claridad.`
  };

  return responses[type] || responses.UNKNOWN;
}

function buildNextMove(type) {
  const map = {
    FINANCIAL: "Cambiar de precio a costo de no actuar.",
    TIME: "Reducir fricción y proponer microconversación.",
    STALL: "Hacer pregunta de claridad.",
    ALREADY_COVERED: "Proponer auditoría sin amenaza.",
    TRUST: "Bajar presión y construir credibilidad.",
    UNKNOWN: "Pedir contexto antes de responder."
  };

  return map[type] || map.UNKNOWN;
}

function runNashCombat({ objection, context = {}, personality = {} }) {
  const type = classifyObjection(objection);
  const diagnosis = diagnoseObjection(type);

  const response = buildObjectionResponse({
    type,
    prospectName: context.name || "oye"
  });

  const nextMove = buildNextMove(type);

  return {
    engine: "NASH_COMBAT_SYSTEM",
    version: "0.1",
    objection,
    type,
    diagnosis,
    response,
    nextMove,
    personality: personality.personality || "UNKNOWN",
    risk:
      "Responder demasiado rápido con producto puede aumentar resistencia.",
    goal:
      "Mantener conversación abierta y mover hacia una cita o diagnóstico breve."
  };
}

module.exports = {
  classifyObjection,
  diagnoseObjection,
  buildObjectionResponse,
  buildNextMove,
  runNashCombat
};
