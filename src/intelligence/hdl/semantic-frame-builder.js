class SemanticFrame {
  constructor(note, options = {}) {
    this.frame_type = 'hdl_semantic_frame';
    this.version = '1.0';
    this.generated_at = new Date().toISOString();

    this.provenance = {
      note_id: options.note_id || null,
      note_text_snippet: note,
      extractor_id: options.extractor_id || 'hdl_default_normalizer',
      timestamp: this.generated_at
    };

    this.semantic_confidence = 0.0;
    this.interpretations = [];
    this.discovery_signals = [];
  }

  addInterpretation(data) {
    this.interpretations.push({
      scope: data.scope || 'unknown',
      intent_normalized: data.intent_normalized || 'unknown',
      action: data.action || null,
      temporal_reference: data.temporal_reference || null,
      confidence: {
        semantic_score: data.semantic_score || 0.0,
        claim_score: data.claim_score || 0.0,
        reasoning: data.reasoning || ''
      },
      attributes: data.attributes || {},
      uncertainty_flags: data.uncertainty_flags || [],
      claimable: !!data.claimable
    });

    this._updateRootConfidence();
  }

  addDiscoverySignal(type, value, confidence = 0.5) {
    this.discovery_signals.push({
      signal_type: type,
      value,
      confidence
    });
  }

  _updateRootConfidence() {
    if (this.interpretations.length === 0) {
      this.semantic_confidence = 0.0;
      return;
    }
    this.semantic_confidence = Math.max(...this.interpretations.map(i => i.confidence.semantic_score));
  }
}

export const SCOPES = {
  COMMITMENT: 'commitment',
  TEMPORAL: 'temporal',
  INTENT: 'intent',
  GREETING: 'greeting',
  RELATIONSHIP: 'relationship',
  UNKNOWN: 'unknown'
};

export const INTENTS = {
  ADVISOR_REQUEST: 'advisor_request',
  PROSPECT_COMMITMENT: 'prospect_commitment',
  DECISION_DELAY: 'decision_delay',
  GREETING_ONLY: 'greeting_only',
  PRODUCT_INTEREST: 'product_interest',
  PRODUCT_COMPARISON: 'product_comparison',
  NETWORK_SIGNAL: 'network_signal',
  UNKNOWN: 'unknown'
};

export const SPANISH_MONTHS = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

export const TRIVIAL_GREETINGS = [
  "hola",
  "holi",
  "hello",
  "hi",
  "buenos dias",
  "buenas tardes",
  "buenas noches",
  "que tal",
  "hola como estas",
  "como estas",
  "hola que tal",
  "buenas",
  "saludos",
  "que onda",
  "hey",
];

export const DIRECT_ADVISOR_ACTIONS = {
  escribeme: "escribir",
  escribir: "escribir",
  llamame: "llamar",
  llamar: "llamar",
  buscame: "buscar",
  buscar: "buscar",
  marcame: "marcar",
  marcar: "marcar",
  contactame: "contactar",
  contactar: "contactar",
  reunion: "reunión",
};

export function normalizeText(value) {
  if (typeof value !== "string") return "";

  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[.,/#!$%^&*;:{}=\-_`~()¿?¡!]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function isTrivialGreeting(note) {
  return TRIVIAL_GREETINGS.includes(normalizeText(note));
}

export function extractTemporalRange(text) {
  const normalized = normalizeText(text);
  const match = normalized.match(/\b(?:en|dentro de)\s+(\d+)\s+o\s+(\d+)\s+(dias|semanas|meses)\b/);
  if (!match) return null;

  const unit = match[3] === "dias" ? "días" : match[3];
  return `${match[1]} o ${match[2]} ${unit}`;
}

export function extractRawTemporalReference(text) {
  const patterns = [
    /\b(?:en|dentro de)\s+\d+\s+o\s+\d+\s+(?:días|dias|semanas|meses)\b/i,
    /\b(?:enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)\s+o\s+(?:enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)(?:\s+de\s+\d{4})?\b/i,
    /\bfin de mes\s+o\s+(?:el\s+)?(?:mes\s+)?que sigue\b/i,
    /\bentre\s+(?:enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)\s+y\s+(?:enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)(?:\s+de\s+\d{4})?\b/i,
    /\bde\s+(?:enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)\s+a\s+(?:enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)(?:\s+de\s+\d{4})?\b/i,
    /\b(?:enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)\s+y\s+(?:enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)(?:\s+de\s+\d{4})?\b/i,
    /\b(lunes|martes|miércoles|miercoles|jueves|viernes|sábado|sabado|domingo)\b/i,
    /\b(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)\b/i,
    /\b(hoy|mañana|manana)\b/i,
    /\b(próxima semana|proxima semana|la próxima semana|la proxima semana|este mes|fin de mes|el mes que sigue|próximo mes|proximo mes|próximo año|proximo año|el próximo año|el proximo año|año que viene|ano que viene)\b/i,
    /\b(en|dentro de)\s+(\d+)\s+(días|dias|semanas|meses|años|anos)\b/i
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return match[0].toLowerCase().trim();
  }

  return null;
}

export function normalizeTemporalReference(reference) {
  const normalized = normalizeText(reference);

  if (
    normalized === "proximo ano" ||
    normalized === "el proximo ano" ||
    normalized === "ano que viene"
  ) {
    return "próximo año";
  }

  return reference ? reference.toLowerCase().trim() : null;
}

export function extractTemporalReference(text) {
  const temporalRange = extractTemporalRange(text);
  if (temporalRange) return temporalRange;

  return normalizeTemporalReference(extractRawTemporalReference(text));
}

export function resolveRelativeMonthReference(text, now = new Date()) {
  if (extractTemporalRange(text)) return null;

  const normalized = normalizeText(text);
  const monthMatch = normalized.match(/\b(en|dentro de)\s+(\d+)\s+mes(es)?\b/);
  if (monthMatch) {
    const monthsToAdd = parseInt(monthMatch[2], 10);
    const targetDate = new Date(now);
    targetDate.setMonth(now.getMonth() + monthsToAdd);
    return SPANISH_MONTHS[targetDate.getMonth()];
  }
  return null;
}

export function getNormalizedDue(note, now = new Date()) {
  const resolvedMonth = resolveRelativeMonthReference(note, now);
  return resolvedMonth || extractTemporalReference(note);
}

export function removeTrailingTemporalConnectors(action) {
  return action
    .replace(/\s+/g, " ")
    .replace(/\s+(?:para(?:\s+(?:el|la|los|las))?|el|la)\s*$/i, "")
    .trim();
}

export function getDirectAdvisorAction(note) {
  const normalized = normalizeText(note);
  const firstToken = normalized.split(" ")[0];
  return DIRECT_ADVISOR_ACTIONS[firstToken] || null;
}

export function getNormalizedAction(note) {
  const normalized = normalizeText(note);
  const directAdvisorAction = getDirectAdvisorAction(note);
  const hasRequestVerb =
    normalized.startsWith("pidio ") ||
    normalized.startsWith("me pidio ") ||
    normalized.startsWith("solicito ") ||
    normalized.startsWith("me solicito ") ||
    normalized.startsWith("requiere ") ||
    normalized.startsWith("me requiere ") ||
    directAdvisorAction !== null ||
    normalized.startsWith("llamar ") ||
    normalized.startsWith("seguimiento ");

  if (!hasRequestVerb) return null;

  let action = note.trim();
  if (directAdvisorAction) {
    action = directAdvisorAction;
  }
  action = action.replace(/^me\s+/i, "");
  action = action.replace(/^pid[ií]o\s+/i, "preparar/enviar ");
  action = action.replace(/^solicit[oó]\s+/i, "preparar/enviar ");
  action = action.replace(/^requiere\s+/i, "preparar/enviar ");
  action = action.replace(/^seguimiento\b/i, "seguimiento");

  const temporalInNote = extractRawTemporalReference(note);
  if (temporalInNote) {
    const escaped = temporalInNote.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const cleanRegex = new RegExp(`\\s*${escaped}.*$`, "i");
    action = action.replace(cleanRegex, "");
  }

  return removeTrailingTemporalConnectors(action).toLowerCase();
}

/**
 * HDL Semantic Frame Builder
 * 
 * Responsible for normalizing raw human language into structured semantic frames.
 */
export function buildSemanticFrame(note, now = new Date()) {
  const frame = new SemanticFrame(note, { timestamp: now.toISOString() });
  const normalized = normalizeText(note);
  const temporal = getNormalizedDue(note, now);
  
  let scope = SCOPES.UNKNOWN;
  let intent_normalized = INTENTS.UNKNOWN;
  let action = null;
  let claimable = false;
  let claim_score = 0.0;
  let semantic_score = 0.5;
  let uncertainty_flags = [];

  if (isTrivialGreeting(note)) {
    scope = SCOPES.GREETING;
    intent_normalized = INTENTS.GREETING_ONLY;
    semantic_score = 1.0;
    claimable = false;
  } else if (normalized.includes("pensara") || normalized.includes("va a pensar") || normalized.includes("lo pensara")) {
    scope = SCOPES.INTENT;
    intent_normalized = INTENTS.DECISION_DELAY;
    semantic_score = 0.95;
    claim_score = 0.35;
    claimable = false;
    uncertainty_flags.push("NON_ACTIONABLE_INTENT");
  } else {
    const normalizedAction = getNormalizedAction(note);
    if (normalizedAction) {
      scope = SCOPES.COMMITMENT;
      intent_normalized = INTENTS.ADVISOR_REQUEST;
      claimable = true;
      semantic_score = 0.95;
      claim_score = 0.8;
      action = normalizedAction;
    }
  }

  frame.semantic_confidence = semantic_score;
  frame.addInterpretation({
    scope,
    intent_normalized,
    action,
    temporal_reference: temporal,
    semantic_score,
    claim_score,
    claimable,
    uncertainty_flags
  });
  
  return frame;
}

/**
 * Semantic Extract v0.8 compatibility frame.
 *
 * The Edge Function response shape predates the full SemanticFrame v1.0 JSON
 * envelope. Keep this adapter stable for GUI compatibility while HDL owns the
 * actual interpretation logic.
 */
export function buildSemanticExtractFrame(note, now = new Date()) {
  const normalized = normalizeText(note);
  const temporal = getNormalizedDue(note, now);

  let scope = SCOPES.UNKNOWN;
  let intent_normalized = INTENTS.UNKNOWN;
  let action = null;
  let claimable = false;
  let claim_confidence = 0.0;
  let semantic_confidence = 0.5;
  let uncertainty_flags = [];

  if (isTrivialGreeting(note)) {
    scope = SCOPES.GREETING;
    intent_normalized = INTENTS.GREETING_ONLY;
    semantic_confidence = 1.0;
    claimable = false;
  } else if (normalized.includes("pensara") || normalized.includes("va a pensar") || normalized.includes("lo pensara")) {
    scope = SCOPES.INTENT;
    intent_normalized = INTENTS.DECISION_DELAY;
    semantic_confidence = 0.95;
    claim_confidence = 0.35;
    claimable = false;
    uncertainty_flags.push("NON_ACTIONABLE_INTENT");
  } else {
    const normalizedAction = getNormalizedAction(note);
    if (normalizedAction) {
      scope = SCOPES.COMMITMENT;
      intent_normalized = INTENTS.ADVISOR_REQUEST;
      claimable = true;
      semantic_confidence = 0.95;
      claim_confidence = 0.8;
      action = normalizedAction;
    }
  }

  return {
    frame_type: "hdl_semantic_frame",
    source: "hdl_semantic_normalizer",
    original_text: note,
    semantic_confidence,
    interpretations: [
      {
        scope,
        intent_normalized,
        action,
        temporal_reference: temporal,
        semantic_confidence,
        claim_confidence,
        claimable,
        uncertainty_flags,
      },
    ],
  };
}
