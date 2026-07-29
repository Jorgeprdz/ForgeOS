const { runNashCombat } = typeof module !== "undefined" && module.exports
  ? require("./nash-combat-orchestrator")
  : globalThis.ForgeNashCombatOrchestrator;
const { detectNashIntent } = typeof module !== "undefined" && module.exports
  ? require("./nash-intent-engine")
  : globalThis.ForgeNashIntentEngine;
const { buildNextBestAction } = typeof module !== "undefined" && module.exports
  ? require("./nash-next-best-action-engine")
  : globalThis.ForgeNashNextBestActionEngine;

function buildPsychologyReport({ objection, intent, combat, personality = "UNKNOWN" }) {
  const psychologyByIntent = {
    VALUE_NOT_CLEAR:
      "El prospecto probablemente está comparando precio contra valor percibido. Antes de hablar de costo, hay que aumentar claridad sobre el impacto de no actuar.",
    REAL_BUDGET_CONSTRAINT:
      "Puede existir una limitación real de flujo. La respuesta debe validar la situación y explorar opciones sin presionar.",
    NOT_PRIORITY:
      "El prospecto no siente urgencia. La estrategia debe conectar el tema con una consecuencia cercana o una prioridad personal.",
    TRUST_ISSUE:
      "La barrera principal es credibilidad. Conviene bajar presión, explicar simple y evitar promesas grandes.",
    NEEDS_CLARITY:
      "La objeción viene de confusión. La mejor respuesta no es persuadir, sino ordenar la información.",
    AVOIDING_DECISION:
      "El prospecto está evitando tomar postura. Conviene hacer una pregunta de claridad para identificar qué le falta.",
    THIRD_PARTY_APPROVAL:
      "La decisión depende de otra persona. El objetivo es incluir al decisor sin invalidar al prospecto.",
    ALREADY_SOLVED:
      "El prospecto cree que ya resolvió el problema. La estrategia no es reemplazar, sino revisar si lo actual sigue siendo suficiente.",
    READY_TO_MEET:
      "El prospecto ya está listo para avanzar. Hay que reducir fricción y cerrar microcompromiso.",
    REQUESTS_INFO:
      "Pedir información muchas veces significa querer pausar la conversación. Conviene enviar algo breve y acompañarlo con una pregunta."
  };

  const strategyByIntent = {
    VALUE_NOT_CLEAR: "Mover de precio a consecuencia.",
    REAL_BUDGET_CONSTRAINT: "Validar flujo y explorar escenarios.",
    NOT_PRIORITY: "Crear relevancia sin meter miedo.",
    TRUST_ISSUE: "Construir confianza antes de vender.",
    NEEDS_CLARITY: "Simplificar y ordenar.",
    AVOIDING_DECISION: "Hacer pregunta de claridad.",
    THIRD_PARTY_APPROVAL: "Incluir al decisor.",
    ALREADY_SOLVED: "Proponer auditoría sin amenaza.",
    READY_TO_MEET: "Agendar.",
    REQUESTS_INFO: "Enviar breve + pregunta."
  };

  const riskByIntent = {
    VALUE_NOT_CLEAR: "Responder con precio o producto puede matar la conversación.",
    REAL_BUDGET_CONSTRAINT: "Presionar puede generar rechazo o culpa.",
    NOT_PRIORITY: "Insistir demasiado puede sonar vendedor.",
    TRUST_ISSUE: "Prometer de más aumenta desconfianza.",
    NEEDS_CLARITY: "Dar más información sin estructura puede confundir más.",
    AVOIDING_DECISION: "Aceptar el 'luego lo veo' sin aclarar puede congelar el proceso.",
    THIRD_PARTY_APPROVAL: "Excluir al decisor real puede bloquear el cierre.",
    ALREADY_SOLVED: "Atacar lo que ya tiene puede activar defensa.",
    READY_TO_MEET: "Hablar demasiado puede enfriar el interés.",
    REQUESTS_INFO: "Mandar PDFs largos puede convertirse en cementerio comercial."
  };

  return {
    visibleObjection: objection,
    probableIntent: intent.primaryIntent,
    personality,
    psychology:
      psychologyByIntent[intent.primaryIntent] ||
      combat.diagnosis ||
      "Falta contexto para inferir psicología con confianza.",
    recommendedStrategy:
      strategyByIntent[intent.primaryIntent] ||
      combat.nextMove ||
      "Pedir contexto antes de responder.",
    risk:
      riskByIntent[intent.primaryIntent] ||
      "Responder sin entender intención puede aumentar resistencia."
  };
}

function buildCombatIntelligenceReport(input = {}) {
  const objection = input.objection || "";
  const context = input.context || {};
  const personality = input.personality || {};

  const intent = detectNashIntent({
    text: objection,
    context,
    personality
  });

  const combat = runNashCombat({
    objection,
    context,
    personality
  });

  const psychologyReport = buildPsychologyReport({
    objection,
    intent,
    combat,
    personality: personality.personality || "UNKNOWN"
  });

  const nextBestAction = buildNextBestAction({
    responseStatus: "RESPONDED",
    objectionType: combat.type,
    objectionIntent: intent.primaryIntent,
    personality: personality.personality || "UNKNOWN"
  });

  return {
    engine: "NASH_COMBAT_INTELLIGENCE_REPORT",
    version: "0.5",
    prospect: {
      name: context.name || "Prospecto",
      personality: personality.personality || "UNKNOWN"
    },
    objection,
    classification: {
      type: combat.type,
      intent: intent.primaryIntent,
      confidence: intent.confidence,
      possibleIntents: intent.possibleIntents || []
    },
    psychology: psychologyReport,
    objectionKillerMessage: combat.response,
    nextBestAction,
    advisorGuidance: {
      do:
        "Valida primero, explica simple y mueve la conversación hacia una pregunta o microcompromiso.",
      dont:
        "No mandes producto, PDF, cotización o precio como primera reacción."
    }
  };
}

const ForgeNashCombatIntelligenceReportEngine = {
  buildCombatIntelligenceReport,
  buildPsychologyReport
};
if (typeof globalThis !== "undefined") globalThis.ForgeNashCombatIntelligenceReportEngine = ForgeNashCombatIntelligenceReportEngine;
if (typeof module !== "undefined" && module.exports) module.exports = ForgeNashCombatIntelligenceReportEngine;
