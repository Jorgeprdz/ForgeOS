const MAX_COMMAND_LENGTH = 2000;
const MAX_HISTORY_ITEMS = 6;
const MAX_ANSWER_LENGTH = 1400;
const MAX_TITLE_LENGTH = 100;
const MAX_SUGGESTIONS = 3;

export function cleanText(value, max = 500) {
  if (typeof value !== "string") return "";
  return value.replace(/\s+/g, " ").trim().slice(0, max);
}

export function cleanMultiline(value, max = 1400) {
  if (typeof value !== "string") return "";
  return value
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((line) => line.replace(/[\t ]+/g, " ").trim())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, max);
}

function normalizeSuggestion(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const label = cleanText(value.label, 80);
  const command = cleanText(value.command, 240);
  if (!label || !command) return null;
  const explicitCommand = /^\/chatbot(?:\s|$)/i.test(command)
    ? command
    : `/Chatbot ${command}`;
  return { label, command: cleanText(explicitCommand, 240), kind: "chatbot_followup" };
}

function normalizeHistory(value) {
  if (!Array.isArray(value)) return [];
  return value
    .slice(-MAX_HISTORY_ITEMS)
    .map((item) => ({
      role: item?.role === "assistant" ? "assistant" : "user",
      text: cleanText(item?.text, 900),
    }))
    .filter((item) => item.text);
}

function normalizeContext(value) {
  const context = value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};
  return {
    routeId: cleanText(context.routeId, 80),
    routeLabel: cleanText(context.routeLabel, 120),
    timestamp: cleanText(context.timestamp, 80),
  };
}

export function normalizeRequest(value) {
  const body = value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};
  return {
    mode: cleanText(body.mode, 40).toLowerCase(),
    command: cleanText(body.command, MAX_COMMAND_LENGTH),
    context: normalizeContext(body.context),
    history: normalizeHistory(body.history),
  };
}

function userProfile(user) {
  const metadata = user?.user_metadata || {};
  const name = cleanText(
    metadata.full_name || metadata.name || "Usuario Forge",
    180,
  );
  return { name };
}

function chatbotInput(command) {
  return cleanText(command.replace(/^\/chatbot\b/i, ""), MAX_COMMAND_LENGTH);
}

export function isExplicitChatbotRequest(request) {
  return request?.mode === "chatbot"
    && /^\/chatbot(?:\s|$)/i.test(request?.command || "");
}

export function buildDeterministicResponse({ command, context }) {
  const input = chatbotInput(command);
  const route = context?.routeLabel || context?.routeId || "la pantalla actual";
  if (!input) {
    return {
      title: "Modo Chatbot",
      answer: `La conversación con IA está abierta desde ${route}. Escribe una pregunta o vuelve a Command OS para buscar, navegar o preparar una acción estructurada.`,
      suggestions: [
        { label: "Explicar una duda", command: "/Chatbot Ayúdame a entender esta pantalla" },
        { label: "Pensar alternativas", command: "/Chatbot Ayúdame a comparar alternativas sin decidir por mí" },
      ],
    };
  }
  return {
    title: "Conversación preparada",
    answer: `Entendí tu pregunta: “${input}”. El proveedor de IA no está disponible ahora. No convertiré esta conversación en una acción, registro o decisión. Usa Command OS para preparar una acción estructurada.`,
    suggestions: [
      { label: "Reformular", command: `/Chatbot Reformula esta pregunta con más claridad: ${input}` },
      { label: "Mostrar dudas", command: `/Chatbot ¿Qué información falta para responder responsablemente a: ${input}?` },
    ],
  };
}

export function buildPrompt({ request, user }) {
  const profile = userProfile(user);
  return [
    "Eres Alfred en su familia explícita ALFRED_CHATBOT_ENTRY de ForgeOS.",
    "Esta función sólo mantiene una conversación asistida; no es Command OS, no es el router y no es el registro de acciones.",
    "Responde en español de México, con claridad, criterio comercial y tono humano.",
    "La IA interpreta y explica. Forge conserva contratos, fuentes, prioridades y autoridad.",
    "No inventes personas, cifras, pólizas, reuniones, actividades, productos, beneficios ni conversaciones.",
    "No afirmes que buscaste entidades, abriste módulos, preparaste paquetes, enviaste, guardaste, agendaste, cotizaste o modificaste algo.",
    "No conviertas lenguaje natural en un comando ejecutado ni declares que una acción está disponible.",
    "Cuando el usuario pida actuar, explica que debe volver a Command OS para preparar el contrato o review packet correspondiente.",
    "No muestres correo, identificadores técnicos ni datos de autenticación.",
    "Devuelve JSON válido sin markdown con esta forma exacta:",
    '{"title":"máximo 100 caracteres","answer":"máximo 1400 caracteres","suggestions":[{"label":"máximo 80","command":"debe comenzar con /Chatbot, máximo 240"}]}',
    "Incluye máximo tres sugerencias y haz explícita cualquier incertidumbre importante.",
    "",
    `Perfil visible: ${JSON.stringify(profile)}`,
    `Contexto limitado de ruta: ${JSON.stringify(request.context)}`,
    `Historial breve del modo Chatbot: ${JSON.stringify(request.history)}`,
    `Pregunta actual: ${chatbotInput(request.command)}`,
  ].join("\n");
}

export function parseJsonObject(value) {
  const text = String(value ?? "").trim().slice(0, 12000);
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    const fenced = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
    try {
      return JSON.parse(fenced);
    } catch {
      const start = fenced.indexOf("{");
      const end = fenced.lastIndexOf("}");
      if (start < 0 || end <= start) return null;
      try {
        return JSON.parse(fenced.slice(start, end + 1));
      } catch {
        return null;
      }
    }
  }
}

export function normalizeModelResponse(value, fallback) {
  const payload = value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};
  const title = cleanText(payload.title, MAX_TITLE_LENGTH) || fallback.title;
  const answer = cleanMultiline(payload.answer, MAX_ANSWER_LENGTH) || fallback.answer;
  const suggestions = Array.isArray(payload.suggestions)
    ? payload.suggestions.map(normalizeSuggestion).filter(Boolean).slice(0, MAX_SUGGESTIONS)
    : [];
  return {
    title,
    answer,
    suggestions: suggestions.length
      ? suggestions
      : fallback.suggestions.map(normalizeSuggestion).filter(Boolean),
  };
}

export function buildEnvelope({
  response,
  provider,
  functionVersion,
  modelVersion,
  degraded = false,
  providerError = null,
}) {
  return {
    ok: true,
    executionPath: "ALFRED_CHATBOT_ENTRY",
    commandAuthority: "COMMAND_OS",
    finalAuthority: "HUMAN",
    functionVersion,
    modelVersion,
    provider,
    degraded,
    providerError,
    title: response.title,
    answer: response.answer,
    suggestions: response.suggestions.map(normalizeSuggestion).filter(Boolean),
    requiresHumanApproval: true,
    mutationsPerformed: false,
    messageSent: false,
    calendarEventCreated: false,
    taskCreated: false,
    crmWritten: false,
    createsTruth: false,
    executesRuntime: false,
  };
}
