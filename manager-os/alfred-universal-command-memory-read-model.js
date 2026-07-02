const SAFE_FLAGS = Object.freeze({
  previewOnly: true,
  reviewOnly: true,
  notApproved: true,
  notSendable: true,
  createsTruth: false,
  executesRuntime: false,
  requiresHumanConfirmation: true,
  sendsMessage: false,
  writesCrm: false,
  createsCalendarEvent: false,
  createsTask: false,
  createsRevenueTruth: false,
  createsCompensationTruth: false,
  createsPayoutTruth: false,
  audioRuntimeEnabled: false,
  speechEngineEnabled: false,
});

const COMMAND_DEFINITIONS = Object.freeze([
  {
    command: "/Mejora este mensaje",
    aliases: ["/mejora este mensaje", "/mejorar mensaje", "/mensaje"],
    family: "ALFRED_MESSAGE_DRAFT",
    intent: "message_draft_prep",
  },
  {
    command: "/Crear evento",
    aliases: ["/crear evento", "/evento"],
    family: "ALFRED_CALENDAR_PREP",
    intent: "calendar_event_prep",
  },
  {
    command: "/Memoria",
    aliases: ["/memoria", "/registro", "/diario", "/bitacora", "/bitácora"],
    family: "ALFRED_MEMORY",
    intent: "memory_capture_prep",
  },
  {
    command: "/Referido",
    aliases: ["/referido", "/referida"],
    family: "ALFRED_REFERRAL_CAPTURE",
    intent: "referral_capture_prep",
  },
  {
    command: "/Agenda",
    aliases: ["/agenda", "/cita"],
    family: "ALFRED_CALENDAR_PREP",
    intent: "calendar_event_prep",
  },
  {
    command: "/Cotizar",
    aliases: ["/cotizar", "/cotiza"],
    family: "ALFRED_PRODUCT_INTELLIGENCE",
    intent: "quote_prep",
  },
  {
    command: "/Proyectar",
    aliases: ["/proyectar", "/proyección", "/proyeccion"],
    family: "ALFRED_PRODUCT_INTELLIGENCE",
    intent: "projection_prep",
  },
  {
    command: "/Presentación",
    aliases: ["/presentación", "/presentacion", "/presentacion de venta"],
    family: "ALFRED_PRODUCT_INTELLIGENCE",
    intent: "sales_presentation_prep",
  },
  {
    command: "/Propuesta",
    aliases: ["/propuesta"],
    family: "ALFRED_PRODUCT_INTELLIGENCE",
    intent: "proposal_prep",
  },
  {
    command: "/Comisiones",
    aliases: ["/comisiones", "/comision"],
    family: "ALFRED_PRODUCT_INTELLIGENCE",
    intent: "commission_preview",
  },
  {
    command: "/Bonos",
    aliases: ["/bonos", "/bono"],
    family: "ALFRED_PRODUCT_INTELLIGENCE",
    intent: "bonus_preview",
  },
  {
    command: "/Follow",
    aliases: ["/follow", "/seguimiento"],
    family: "ALFRED_FOLLOW_UP_PREP",
    intent: "follow_up_search",
  },
  {
    command: "/Chatbot",
    aliases: ["/chatbot", "/chat"],
    family: "ALFRED_CHATBOT_ENTRY",
    intent: "chatbot_entry",
  },
]);

const PRODUCT_KEYWORDS = Object.freeze([
  { key: "retiro", label: "retiro" },
  { key: "vida mujer", label: "Vida Mujer" },
  { key: "segubeca", label: "SeguBeca" },
  { key: "gmm", label: "GMM" },
  { key: "gastos médicos", label: "GMM" },
  { key: "gastos medicos", label: "GMM" },
  { key: "vida", label: "vida" },
  { key: "ppr", label: "PPR" },
  { key: "orvi", label: "ORVI" },
]);

const DAY_KEYWORDS = Object.freeze([
  "lunes",
  "martes",
  "miércoles",
  "miercoles",
  "jueves",
  "viernes",
  "sábado",
  "sabado",
  "domingo",
]);

function normalizeText(value) {
  return String(value || "")
    .trim()
    .replace(/\s+/g, " ");
}

function normalizeLower(value) {
  return normalizeText(value).toLowerCase();
}

function stripDiacritics(value) {
  return String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function resolveCommand(input) {
  const raw = normalizeText(input);
  const lower = normalizeLower(raw);

  if (!lower.startsWith("/")) {
    return {
      command: "/Index",
      family: "ALFRED_INDEX",
      intent: "universal_index_search",
      query: raw,
      matchedAlias: "",
    };
  }

  const normalizedAliasLower = stripDiacritics(lower);
  const sortedDefinitions = COMMAND_DEFINITIONS.slice().sort((a, b) => {
    const longestA = Math.max(...a.aliases.map((alias) => alias.length));
    const longestB = Math.max(...b.aliases.map((alias) => alias.length));
    return longestB - longestA;
  });

  for (const definition of sortedDefinitions) {
    for (const alias of definition.aliases) {
      const aliasLower = alias.toLowerCase();
      const aliasPlain = stripDiacritics(aliasLower);
      if (lower === aliasLower || lower.startsWith(aliasLower + " ")) {
        return {
          ...definition,
          query: raw.slice(alias.length).trim(),
          matchedAlias: alias,
        };
      }
      if (normalizedAliasLower === aliasPlain || normalizedAliasLower.startsWith(aliasPlain + " ")) {
        return {
          ...definition,
          query: raw.slice(alias.length).trim(),
          matchedAlias: alias,
        };
      }
    }
  }

  const parts = raw.split(" ");
  return {
    command: parts[0],
    family: "ALFRED_INDEX",
    intent: "universal_index_search",
    query: parts.slice(1).join(" ").trim(),
    matchedAlias: parts[0],
  };
}

function titleCaseName(name) {
  return normalizeText(name)
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function unique(values) {
  return Array.from(new Set(values.filter(Boolean)));
}

function extractProducts(text) {
  const lower = normalizeLower(text);
  return unique(
    PRODUCT_KEYWORDS.filter((product) => lower.includes(product.key)).map((product) => product.label),
  );
}

function extractDay(text) {
  const lower = normalizeLower(text);
  return DAY_KEYWORDS.find((day) => lower.includes(day)) || "";
}

function extractTime(text) {
  const match = normalizeText(text).match(/\b(?:a las\s*)?(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\b/i);
  if (!match) {
    return "";
  }
  const hour = match[1].padStart(2, "0");
  const minutes = match[2] || "00";
  return `${hour}:${minutes}${match[3] ? " " + match[3].toLowerCase() : ""}`;
}

function extractPersonCandidates(text) {
  const normalized = normalizeText(text);
  const candidates = [];
  const commandless = normalized.replace(/^\/[^\s]+(\s+este\s+mensaje)?\s*/i, "");

  const afterA = commandless.match(/\b(?:a|con|para|de)\s+([A-ZÁÉÍÓÚÑ][\wÁÉÍÓÚÑáéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑ][\wÁÉÍÓÚÑáéíóúñ]+){0,2})/);
  if (afterA) {
    candidates.push(afterA[1]);
  }

  const capitalized = commandless.match(/\b([A-ZÁÉÍÓÚÑ][\wÁÉÍÓÚÑáéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑ][\wÁÉÍÓÚÑáéíóúñ]+){0,2})/g) || [];
  for (const item of capitalized) {
    if (!/^(Hoy|Tengo|Me|Le|Les|Forge|Alfred)$/i.test(item)) {
      candidates.push(item);
    }
  }

  return unique(candidates.map(titleCaseName));
}

function extractReferral(text) {
  const normalized = normalizeText(text);
  const lower = normalizeLower(text);
  const referralMatch = normalized.match(/\/Referid[oa]\s+(.+?)(?:\s+es\s+referid[oa]\s+de\s+|\s+viene\s+de\s+|$)/i);
  const sourceMatch = normalized.match(/(?:referid[oa]\s+de|viene\s+de)\s+(.+?)(?:,|\.|$)/i);
  const relationshipMatch = normalized.match(/(?:compañero|compañera|amigo|amiga|familiar|cliente|vecino|vecina)(?:\s+del?\s+[\w\s]+)?/i);

  return {
    referralName: referralMatch ? titleCaseName(referralMatch[1]) : "",
    sourceName: sourceMatch ? titleCaseName(sourceMatch[1]) : "",
    relationship: relationshipMatch ? normalizeText(relationshipMatch[0]) : "",
    hasReferralSignal: lower.includes("referido") || lower.includes("referida"),
  };
}

function extractMemorySignals(text) {
  const lower = normalizeLower(text);
  const signals = [];
  if (lower.includes("interesa") || lower.includes("interesó") || lower.includes("intereso")) {
    signals.push("interest_signal");
  }
  if (lower.includes("esposa") || lower.includes("novio") || lower.includes("novia") || lower.includes("pareja")) {
    signals.push("relationship_context");
  }
  if (lower.includes("próxima semana") || lower.includes("proxima semana") || lower.includes("martes") || lower.includes("viernes")) {
    signals.push("follow_up_signal");
  }
  if (lower.includes("cita") || lower.includes("videollamada") || lower.includes("llamada")) {
    signals.push("appointment_signal");
  }
  if (lower.includes("referido") || lower.includes("referida")) {
    signals.push("referral_signal");
  }
  return unique(signals);
}

function buildCandidateActions(resolved, query, extracted) {
  const actions = [];
  if (resolved.family === "ALFRED_MEMORY") {
    actions.push("prepare_memory_entry");
  }
  if (resolved.family === "ALFRED_REFERRAL_CAPTURE" || extracted.referral.hasReferralSignal) {
    actions.push("prepare_referral_record");
  }
  if (resolved.family === "ALFRED_CALENDAR_PREP" || extracted.day || extracted.time) {
    actions.push("prepare_calendar_event");
  }
  if (resolved.family === "ALFRED_MESSAGE_DRAFT") {
    actions.push("prepare_message_draft");
  }
  if (resolved.family === "ALFRED_PRODUCT_INTELLIGENCE") {
    actions.push("prepare_product_intelligence_artifact");
  }
  if (resolved.family === "ALFRED_FOLLOW_UP_PREP" || extracted.signals.includes("follow_up_signal")) {
    actions.push("prepare_follow_up");
  }
  if (resolved.family === "ALFRED_INDEX") {
    actions.push("search_universal_index");
  }
  return unique(actions);
}

function buildAlfredReadModel(input, options = {}) {
  const rawInput = normalizeText(input);
  const resolved = resolveCommand(rawInput);
  const query = resolved.query || rawInput;
  const people = extractPersonCandidates(query);
  const products = extractProducts(query);
  const referral = extractReferral(rawInput);
  const day = extractDay(query);
  const time = extractTime(query);
  const signals = extractMemorySignals(query);
  const extracted = { people, products, referral, day, time, signals };
  const candidateActions = buildCandidateActions(resolved, query, extracted);

  return {
    id: options.id || "ALFRED_READ_MODEL_PREVIEW",
    source: "ALFRED_UNIVERSAL_COMMAND_MEMORY_READ_MODEL",
    command: resolved.command,
    matchedAlias: resolved.matchedAlias,
    family: resolved.family,
    intent: resolved.intent,
    rawInput,
    query,
    extracted: {
      people,
      products,
      referral,
      calendar: {
        day,
        time,
        eventCandidate: resolved.family === "ALFRED_CALENDAR_PREP" || Boolean(day || time),
      },
      signals,
    },
    candidateActions,
    resultCards: buildResultCards(resolved, extracted, candidateActions),
    safety: {
      ...SAFE_FLAGS,
      memoryWriteRequiresReview: true,
      calendarCreateRequiresConfirmation: true,
      crmWriteRequiresConfirmation: true,
      sendMessageRequiresConfirmation: true,
      transcriptionPreviewOnly: true,
    },
    warnings: [
      "Preview only.",
      "Human review required before any write or execution.",
      "No live search, no audio runtime, no speech engine.",
    ],
  };
}

function buildResultCards(resolved, extracted, candidateActions) {
  const cards = [];
  if (extracted.people.length) {
    for (const person of extracted.people.slice(0, 3)) {
      cards.push({
        type: "person_context",
        title: person,
        subtitle: "indexed candidate / preview",
        status: "review_only",
      });
    }
  }
  if (extracted.referral.referralName || candidateActions.includes("prepare_referral_record")) {
    cards.push({
      type: "referral_candidate",
      title: extracted.referral.referralName || "Referral candidate",
      subtitle: extracted.referral.sourceName
        ? `source: ${extracted.referral.sourceName}`
        : "source requires review",
      status: "not_approved",
    });
  }
  if (extracted.products.length || resolved.family === "ALFRED_PRODUCT_INTELLIGENCE") {
    cards.push({
      type: "product_intelligence_prep",
      title: extracted.products.length ? extracted.products.join(" / ") : "Product intelligence",
      subtitle: "quote/projection/presentation artifact preview",
      status: "not_sendable",
    });
  }
  if (candidateActions.includes("prepare_calendar_event")) {
    cards.push({
      type: "calendar_candidate",
      title: extracted.day || "Calendar candidate",
      subtitle: extracted.time || "time requires review",
      status: "requires_confirmation",
    });
  }
  if (!cards.length) {
    cards.push({
      type: "index_preview",
      title: resolved.query || resolved.command,
      subtitle: "universal index preview",
      status: "review_only",
    });
  }
  return cards;
}

module.exports = {
  SAFE_FLAGS,
  COMMAND_DEFINITIONS,
  buildAlfredReadModel,
  resolveCommand,
  extractProducts,
  extractPersonCandidates,
  extractReferral,
};
