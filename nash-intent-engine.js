const INTENT_DEFINITIONS = {
  VALUE_NOT_CLEAR: {
    commercialSignal: "VALUE_GAP",
    recommendedStrategy: "Reencuadrar de precio a valor y riesgo de no actuar.",
    psychology: "No necesariamente rechaza; aun no ve suficiente valor para justificar el esfuerzo o costo.",
    nextBestActionHint: "HANDLE_VALUE_OBJECTION",
    patterns: [
      /car[oa]/i,
      /muy caro/i,
      /cuesta mucho/i,
      /no veo el valor/i,
      /no le veo sentido/i,
      /para qu[eé]/i
    ]
  },
  NOT_PRIORITY: {
    commercialSignal: "LOW_PRIORITY",
    recommendedStrategy: "Bajar presion y conectar con una consecuencia concreta de postergar.",
    psychology: "El tema compite con otras prioridades y no se siente urgente.",
    nextBestActionHint: "CREATE_RELEVANCE",
    patterns: [
      /ahorita no/i,
      /no es prioridad/i,
      /despu[eé]s vemos/i,
      /luego vemos/i,
      /no me urge/i
    ]
  },
  TRUST_ISSUE: {
    commercialSignal: "TRUST_RISK",
    recommendedStrategy: "Construir seguridad, explicar simple y evitar presion comercial.",
    psychology: "La friccion principal es credibilidad, miedo o experiencia negativa previa.",
    nextBestActionHint: "BUILD_TRUST",
    patterns: [
      /no conf[ií]o/i,
      /desconf[ií]o/i,
      /fraude/i,
      /me da miedo/i,
      /no creo en/i,
      /esas cosas/i
    ]
  },
  NEEDS_CLARITY: {
    commercialSignal: "CLARITY_NEEDED",
    recommendedStrategy: "Responder con una explicacion breve y una pregunta de diagnostico.",
    psychology: "La persona necesita entender antes de decidir o avanzar.",
    nextBestActionHint: "CLARIFY_AND_ASK",
    patterns: [
      /no entiendo/i,
      /expl[ií]came/i,
      /c[oó]mo funciona/i,
      /qu[eé] significa/i,
      /duda/i,
      /no me queda claro/i
    ]
  },
  REAL_BUDGET_CONSTRAINT: {
    commercialSignal: "BUDGET_CONSTRAINT",
    recommendedStrategy: "Validar la restriccion y explorar prioridad, monto posible o timing.",
    psychology: "Puede haber una limitacion real de liquidez, no solo una objecion de valor.",
    nextBestActionHint: "DIAGNOSE_BUDGET",
    patterns: [
      /no tengo dinero/i,
      /no me alcanza/i,
      /sin presupuesto/i,
      /ando corto/i,
      /no puedo pagar/i,
      /no tengo presupuesto/i
    ]
  },
  AVOIDING_DECISION: {
    commercialSignal: "DECISION_STALL",
    recommendedStrategy: "Pedir claridad sobre que falta para decidir sin confrontar.",
    psychology: "Evita el compromiso porque falta certeza, prioridad o confianza.",
    nextBestActionHint: "ASK_DECISION_CRITERIA",
    patterns: [
      /d[eé]jame pensarlo/i,
      /dejame pensarlo/i,
      /lo voy a pensar/i,
      /lo pienso/i,
      /lo reviso/i,
      /te aviso/i
    ]
  },
  THIRD_PARTY_APPROVAL: {
    commercialSignal: "NEEDS_APPROVAL",
    recommendedStrategy: "Incluir al decisor y evitar que el prospecto sea mensajero.",
    psychology: "La decision no es individual o necesita validacion emocional/familiar.",
    nextBestActionHint: "INVITE_DECISION_PARTY",
    patterns: [
      /mi esposa/i,
      /mi esposo/i,
      /mi pareja/i,
      /con mi socio/i,
      /con mi socia/i,
      /lo tengo que ver/i,
      /tengo que verlo/i,
      /consultarlo/i
    ]
  },
  ALREADY_SOLVED: {
    commercialSignal: "PERCEIVED_SOLVED",
    recommendedStrategy: "Proponer revision sin reemplazar ni invalidar lo que ya tiene.",
    psychology: "Percibe que el riesgo ya esta cubierto y no ve brecha actual.",
    nextBestActionHint: "AUDIT_EXISTING_COVERAGE",
    patterns: [
      /ya tengo seguro/i,
      /ya cuento con/i,
      /ya estoy cubierto/i,
      /ya estoy cubierta/i,
      /mi empresa me da/i,
      /ya tengo asesor/i
    ]
  },
  READY_TO_MEET: {
    commercialSignal: "MEETING_READY",
    recommendedStrategy: "Cerrar microcompromiso con fecha, hora y canal.",
    psychology: "Acepta avanzar; la prioridad es convertir intencion en cita concreta.",
    nextBestActionHint: "SCHEDULE_APPOINTMENT",
    patterns: [
      /\bva\b/i,
      /lo vemos/i,
      /ma[nñ]ana/i,
      /agend/i,
      /nos vemos/i,
      /me parece/i,
      /sale/i
    ]
  },
  REQUESTS_INFO: {
    commercialSignal: "INFO_REQUEST",
    recommendedStrategy: "Enviar contexto minimo y regresar con una pregunta para no perder conversacion.",
    psychology: "Quiere controlar la interaccion o evaluar sin exponerse todavia a una cita.",
    nextBestActionHint: "SEND_CONTEXT_THEN_ASK",
    patterns: [
      /m[aá]ndame info/i,
      /mandame info/i,
      /env[ií]ame info/i,
      /p[aá]same info/i,
      /m[aá]ndame informaci[oó]n/i,
      /por whatsapp/i,
      /por correo/i,
      /m[aá]ndame detalles/i
    ]
  }
};

const INTENT_PRIORITY = [
  "READY_TO_MEET",
  "THIRD_PARTY_APPROVAL",
  "REAL_BUDGET_CONSTRAINT",
  "TRUST_ISSUE",
  "ALREADY_SOLVED",
  "REQUESTS_INFO",
  "AVOIDING_DECISION",
  "VALUE_NOT_CLEAR",
  "NEEDS_CLARITY",
  "NOT_PRIORITY"
];

function normalizeText(value = "") {
  return String(value).trim();
}

function scoreIntent(text, intentName) {
  const definition = INTENT_DEFINITIONS[intentName];
  const matches = definition.patterns.filter(pattern => pattern.test(text));

  if (matches.length === 0) return null;

  return {
    intent: intentName,
    score: matches.length,
    confidence: Math.min(55 + matches.length * 15, 95)
  };
}

function resolveInputText(input = {}) {
  if (typeof input === "string") return input;

  return (
    input.rawText ||
    input.text ||
    input.message ||
    input.responseText ||
    input.prospectResponse ||
    ""
  );
}

function buildUnknownIntent(rawText) {
  return {
    rawText,
    primaryIntent: "UNKNOWN",
    confidence: 0,
    possibleIntents: [],
    commercialSignal: "UNKNOWN",
    recommendedStrategy: "Pedir mas contexto antes de responder.",
    psychology: "No hay senales suficientes para diagnosticar la intencion comercial.",
    nextBestActionHint: "ASK_CONTEXT"
  };
}

function detectNashIntent(input = {}) {
  const rawText = normalizeText(resolveInputText(input));

  if (!rawText) {
    return buildUnknownIntent(rawText);
  }

  const scored = INTENT_PRIORITY
    .map(intentName => scoreIntent(rawText, intentName))
    .filter(Boolean)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return INTENT_PRIORITY.indexOf(a.intent) - INTENT_PRIORITY.indexOf(b.intent);
    });

  if (scored.length === 0) {
    return buildUnknownIntent(rawText);
  }

  const primary = scored[0];
  const definition = INTENT_DEFINITIONS[primary.intent];

  return {
    rawText,
    primaryIntent: primary.intent,
    confidence: primary.confidence,
    possibleIntents: scored.map(item => item.intent),
    commercialSignal: definition.commercialSignal,
    recommendedStrategy: definition.recommendedStrategy,
    psychology: definition.psychology,
    nextBestActionHint: definition.nextBestActionHint
  };
}

module.exports = {
  detectNashIntent,
  INTENT_DEFINITIONS
};
