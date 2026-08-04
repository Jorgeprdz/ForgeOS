const MAX_COMMAND_LENGTH = 2000;
const MAX_CONTEXT_LENGTH = 6000;
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

export function stripDiacritics(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function normalizeSuggestion(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const label = cleanText(value.label, 80);
  const command = cleanText(value.command, 240);
  if (!label || !command) return null;
  return { label, command, kind: "command" };
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
    pageTitle: cleanText(context.pageTitle, 160),
    visibleSummary: cleanText(context.visibleSummary, MAX_CONTEXT_LENGTH),
    timestamp: cleanText(context.timestamp, 80),
    uiState: context.uiState && typeof context.uiState === "object" && !Array.isArray(context.uiState)
      ? Object.fromEntries(
          Object.entries(context.uiState)
            .slice(0, 24)
            .map(([key, item]) => [cleanText(key, 80), cleanText(String(item ?? ""), 160)])
            .filter(([key, item]) => key && item),
        )
      : {},
  };
}

export function normalizeRequest(value) {
  const body = value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};
  return {
    command: cleanText(body.command, MAX_COMMAND_LENGTH),
    context: normalizeContext(body.context),
    history: normalizeHistory(body.history),
  };
}

function userProfile(user) {
  const metadata = user?.user_metadata || {};
  const name = cleanText(
    metadata.full_name || metadata.name || user?.email || "Usuario Forge",
    180,
  );
  return { name };
}

function routeDescription(context) {
  return context.routeLabel || context.routeId || "la pantalla actual";
}

function contextSignals(context, limit = 4) {
  const source = context.visibleSummary;
  if (!source) return [];
  const candidates = source
    .split(/(?<=[.!?])\s+|\s*[·|]\s*|\n+/)
    .map((item) => cleanText(item, 240))
    .filter(Boolean);
  const priority = candidates.filter((item) =>
    /seguim|riesgo|pendiente|falta|urg|meta|cita|propuesta|decisi|contact|p[oó]liza/i.test(item)
  );
  return Array.from(new Set([...priority, ...candidates])).slice(0, limit);
}

function personFromCommand(command) {
  const match = command.match(/\bpara\s+([A-ZÁÉÍÓÚÑ][\p{L}'-]*(?:\s+[A-ZÁÉÍÓÚÑ][\p{L}'-]*){0,2})/u);
  return cleanText(match?.[1] || "", 120);
}

export function buildDeterministicResponse({ command, context, user }) {
  const normalized = stripDiacritics(command.toLowerCase());
  const profile = userProfile(user);
  const route = routeDescription(context);
  const signals = contextSignals(context);

  if (
    /^\/?jorge(?:\s|$)/.test(normalized)
    || normalized.includes("quien soy")
    || normalized.includes("mi perfil")
  ) {
    return {
      title: "Tu sesión de Forge",
      answer: `Estás conectado como ${profile.name}. Alfred está leyendo ${route} y no ejecutó ningún cambio.`,
      suggestions: [
        { label: "Priorizar hoy", command: "Prioriza lo más importante de esta pantalla" },
        { label: "Explicar riesgo", command: "Explícame el principal riesgo de hoy" },
      ],
    };
  }

  if (/seguim|prioriza|prioridad/.test(normalized)) {
    const evidence = signals.length
      ? signals.map((item, index) => `${index + 1}. ${item}`).join("\n")
      : `No encontré seguimientos concretos en ${route}. Abre Pipeline para que pueda leer los prospectos visibles y priorizarlos.`;
    return {
      title: "Prioridad de seguimiento",
      answer: evidence,
      suggestions: [
        { label: "Abrir criterio", command: "Explícame por qué ese seguimiento va primero" },
        { label: "Preparar mensaje", command: "Prepara un mensaje breve para el primer seguimiento" },
      ],
    };
  }

  if (/mensaje|whatsapp|escrib|redact/.test(normalized)) {
    const person = personFromCommand(command);
    const greeting = person ? `Hola ${person}, ¿cómo estás?` : "Hola, ¿cómo estás?";
    return {
      title: "Borrador para revisar",
      answer: `${greeting} Quería retomar nuestra conversación y revisar contigo el siguiente paso. ¿Qué día te funciona para platicarlo unos minutos?\n\nBorrador solamente: revísalo antes de enviarlo.`,
      suggestions: [
        { label: "Más casual", command: `${command} en tono más casual` },
        { label: "Más directo", command: `${command} en tono más directo` },
      ],
    };
  }

  if (/riesgo|alerta|problema|cuello de botella/.test(normalized)) {
    return {
      title: "Lectura de riesgo",
      answer: signals.length
        ? `Lo más relevante que veo en ${route}:\n${signals.map((item) => `• ${item}`).join("\n")}`
        : `No hay evidencia suficiente en ${route} para afirmar un riesgo concreto. Pídeme que revise Pipeline, Actividad o Cartera después de abrir ese módulo.`,
      suggestions: [
        { label: "Siguiente acción", command: "Dime la siguiente mejor acción con esta evidencia" },
        { label: "Qué falta", command: "Dime qué información falta para decidir mejor" },
      ],
    };
  }

  if (/cotiza|cotizacion|cotización|propuesta|presentacion|presentación/.test(normalized)) {
    return {
      title: "Preparación comercial",
      answer: "Puedo ayudarte a preparar la cotización o propuesta, pero necesito producto, persona y objetivo. No generaré ni confirmaré una póliza sin tu revisión.",
      suggestions: [
        { label: "Ir por datos", command: "Dime los datos mínimos que necesitas para cotizar" },
        { label: "Explicar opciones", command: "Ayúdame a comparar las opciones visibles" },
      ],
    };
  }

  return {
    title: "Alfred conectado",
    answer: `Estoy conectado a tu sesión y a ${route}. Puedo interpretar lo visible, priorizar seguimientos, explicar riesgos y preparar borradores. No envío mensajes ni modifico datos sin tu aprobación.`,
    suggestions: [
      { label: "Prioriza", command: "Prioriza mis seguimientos" },
      { label: "Riesgo de hoy", command: "Explícame el riesgo de hoy" },
      { label: "Prepara mensaje", command: "Prepara un mensaje de seguimiento" },
    ],
  };
}

export function buildPrompt({ request, user }) {
  const profile = userProfile(user);
  return [
    "Eres Alfred, la capa operativa de ForgeOS para asesores de seguros.",
    "Responde en español de México, con criterio comercial, claridad y tono humano.",
    "Usa exclusivamente el perfil, la pantalla visible y el historial suministrados.",
    "No inventes personas, cifras, pólizas, reuniones, actividades ni conversaciones.",
    "No muestres correo, identificadores técnicos ni datos de autenticación salvo que el usuario los pida expresamente.",
    "No afirmes que enviaste, guardaste, agendaste, cotizaste o modificaste algo.",
    "Cuando el usuario pida ejecutar una acción, prepara el borrador o los pasos y deja claro que requiere aprobación humana.",
    "Devuelve JSON válido sin markdown con esta forma exacta:",
    '{"title":"máximo 100 caracteres","answer":"máximo 1400 caracteres","suggestions":[{"label":"máximo 80","command":"máximo 240"}]}',
    "Incluye máximo tres sugerencias. Si falta evidencia, dilo de forma directa.",
    "",
    `Perfil autenticado: ${JSON.stringify(profile)}`,
    `Contexto visible: ${JSON.stringify(request.context)}`,
    `Historial breve: ${JSON.stringify(request.history)}`,
    `Comando actual: ${request.command}`,
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
    suggestions: suggestions.length ? suggestions : fallback.suggestions,
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
    functionVersion,
    modelVersion,
    provider,
    degraded,
    providerError,
    title: response.title,
    answer: response.answer,
    suggestions: response.suggestions.map((item) => ({
      label: cleanText(item.label, 80),
      command: cleanText(item.command, 240),
      kind: "command",
    })),
    requiresHumanApproval: true,
    mutationsPerformed: false,
    messageSent: false,
    calendarEventCreated: false,
    taskCreated: false,
    crmWritten: false,
  };
}
