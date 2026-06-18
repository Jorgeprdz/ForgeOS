import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { GoogleGenerativeAI } from "npm:@google/generative-ai";

const FUNCTION_VERSION = "semantic-extract-v0.8-hdl-semantic-frame-lite";
const MODEL_VERSION = "gemini-3.1-flash-lite";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SPANISH_MONTHS = [
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

const TRIVIAL_GREETINGS = [
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

const FORBIDDEN_FIELDS = [
  "emotion",
  "personality",
  "hidden_intent",
  "psychological_state",
  "manipulation_strategy",
  "urgency_based_on_vulnerability",
  "purchase_probability",
  "conversion_likelihood",
  "political_affiliation",
  "religious_belief",
  "health_status",
];

const DIRECT_ADVISOR_ACTIONS: Record<string, string> = {
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
};

function normalizeText(value: unknown): string {
  if (typeof value !== "string") return "";

  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[.,/#!$%^&*;:{}=\-_`~()¿?¡!]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

function emptyResponse(unknown = "no_actionable_event", frame: unknown = null) {
  return jsonResponse({
    function_version: FUNCTION_VERSION,
    summary: {
      candidate_count: 0,
      requires_human_review: true,
      model_version: MODEL_VERSION,
    },
    candidates: [],
    unknowns: [unknown],
    requiresHumanReview: true,
    source: "semantic_extractor",
    model_version: MODEL_VERSION,
    semantic_frame: frame,
  });
}

function isTrivialGreeting(note: string): boolean {
  return TRIVIAL_GREETINGS.includes(normalizeText(note));
}

function extractTemporalRange(text: string): string | null {
  const normalized = normalizeText(text);
  const match = normalized.match(/\b(?:en|dentro de)\s+(\d+)\s+o\s+(\d+)\s+(dias|semanas|meses)\b/);
  if (!match) return null;

  const unit = match[3] === "dias" ? "días" : match[3];
  return `${match[1]} o ${match[2]} ${unit}`;
}

function extractRawTemporalReference(text: string): string | null {
  const patterns = [
    /\b(?:en|dentro de)\s+\d+\s+o\s+\d+\s+(?:días|dias|semanas|meses)\b/i,
    /\b(lunes|martes|miércoles|miercoles|jueves|viernes|sábado|sabado|domingo)\b/i,
    /\b(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)\b/i,
    /\b(hoy|mañana|manana)\b/i,
    /\b(próxima semana|proxima semana|la próxima semana|la proxima semana|este mes|fin de mes|próximo mes|proximo mes|próximo año|proximo año|el próximo año|el proximo año|año que viene|ano que viene)\b/i,
    /\b(en|dentro de)\s+(\d+)\s+(días|dias|semanas|meses|años|anos)\b/i
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return match[0].toLowerCase().trim();
  }

  return null;
}

function normalizeTemporalReference(reference: string | null): string | null {
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

function extractTemporalReference(text: string): string | null {
  const temporalRange = extractTemporalRange(text);
  if (temporalRange) return temporalRange;

  return normalizeTemporalReference(extractRawTemporalReference(text));
}

function resolveRelativeMonthReference(text: string, now = new Date()): string | null {
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

function getNormalizedDue(note: string, now = new Date()): string | null {
  const resolvedMonth = resolveRelativeMonthReference(note, now);
  return resolvedMonth || extractTemporalReference(note);
}

function removeTrailingTemporalConnectors(action: string): string {
  return action
    .replace(/\s+/g, " ")
    .replace(/\s+(?:para(?:\s+(?:el|la|los|las))?|el|la)\s*$/i, "")
    .trim();
}

function getDirectAdvisorAction(note: string): string | null {
  const normalized = normalizeText(note);
  const firstToken = normalized.split(" ")[0];
  return DIRECT_ADVISOR_ACTIONS[firstToken] || null;
}

function getNormalizedAction(note: string): string | null {
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

function buildSemanticFrame(note: string, now = new Date()) {
  const normalized = normalizeText(note);
  const temporal = getNormalizedDue(note, now);
  
  let scope = "unknown";
  let intent_normalized = "unknown";
  let action = null;
  let claimable = false;
  let claim_confidence = 0.0;
  let semantic_confidence = 0.5;
  let uncertainty_flags: string[] = [];

  if (isTrivialGreeting(note)) {
    scope = "greeting";
    intent_normalized = "greeting_only";
    semantic_confidence = 1.0;
    claimable = false;
  } else if (normalized.includes("pensara") || normalized.includes("va a pensar") || normalized.includes("lo pensara")) {
    scope = "intent";
    intent_normalized = "decision_delay";
    semantic_confidence = 0.95;
    claim_confidence = 0.35;
    claimable = false;
    uncertainty_flags.push("NON_ACTIONABLE_INTENT");
  } else {
    const normalizedAction = getNormalizedAction(note);
    if (normalizedAction) {
      scope = "commitment";
      intent_normalized = "advisor_request";
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

function deterministicProspectRequest(note: string, generatedAt: string) {
  const normalizedAction = getNormalizedAction(note);
  if (!normalizedAction) return null;

  const due = getNormalizedDue(note);

  // Quality Rule
  const isRange = due && /^\d+\s+o\s+\d+\s+(días|dias|semanas|meses)$/.test(due);
  const isBroad = due && (isRange || due.includes("próximo") || due.includes("proximo") || due.includes("año") || due.includes("mes") || due.includes("semana") || due.match(/\b(dentro|en)\b/));
  const quality = (due && !isBroad) ? "strong" : "medium";

  return {
    id: "cand_001",
    type: "commitment_established",
    owner: "advisor",
    action: normalizedAction,
    due,
    quality,
    confidence: 1,
    evidence_span: note.trim(),
    review_status: "proposed",
    source: "deterministic_request_extractor",
    model_version: MODEL_VERSION,
    generated_at: generatedAt,
    unknowns: due ? [] : ["due_date"],
  };
}

function isAllowedType(type: string): boolean {
  return type === "commitment_established" || type === "conversation_occurred";
}

function isAllowedOwner(owner: string): boolean {
  return owner === "advisor" || owner === "prospect" || owner === "unknown";
}

function hasForbiddenInference(candidate: Record<string, unknown>): boolean {
  return FORBIDDEN_FIELDS.some((field) => field in candidate);
}

function computeQuality(
  type: string,
  owner: string,
  action: string | null,
  due: string | null,
): "strong" | "medium" | "weak" | "informational" {
  if (type !== "commitment_established") return "informational";
  if (action && owner !== "unknown" && due) return "strong";
  if (action && owner !== "unknown" && !due) return "medium";
  return "weak";
}

function sanitizeCandidate(
  candidate: Record<string, unknown>,
  note: string,
  index: number,
  generatedAt: string,
) {
  if (!candidate || typeof candidate !== "object") return null;
  if (hasForbiddenInference(candidate)) return null;

  const evidenceSpan = typeof candidate.evidence_span === "string"
    ? candidate.evidence_span.trim()
    : "";

  if (!evidenceSpan) return null;
  if (!note.includes(evidenceSpan)) return null;

  const type = normalizeText(candidate.type);
  if (!isAllowedType(type)) return null;

  if (type === "conversation_occurred" && isTrivialGreeting(evidenceSpan)) {
    return null;
  }

  const rawOwner = normalizeText(candidate.owner);
  const owner = isAllowedOwner(rawOwner) ? rawOwner : "unknown";

  const action = typeof candidate.action === "string" && candidate.action.trim()
    ? candidate.action.trim()
    : null;

  const due = typeof candidate.due === "string" && candidate.due.trim()
    ? candidate.due.trim()
    : null;

  const unknowns = Array.isArray(candidate.unknowns)
    ? candidate.unknowns.filter((item) => typeof item === "string")
    : [];

  return {
    id: `cand_${String(index + 1).padStart(3, "0")}`,
    type,
    owner,
    action,
    due,
    quality: computeQuality(type, owner, action, due),
    confidence: typeof candidate.confidence === "number" ? candidate.confidence : 0,
    evidence_span: evidenceSpan,
    review_status: "proposed",
    source: "semantic_extractor",
    model_version: MODEL_VERSION,
    generated_at: generatedAt,
    unknowns,
  };
}

const genAI = new GoogleGenerativeAI(Deno.env.get("GEMINI_API_KEY") || "");

const SYSTEM_PROMPT = `
You are Forge OS Semantic Event Extractor.

Return ONLY valid JSON.

Task:
Extract candidate evidence from the advisor note.

Allowed event types:
- commitment_established
- conversation_occurred

Allowed owners:
- advisor
- prospect
- unknown

Ownership rules:
1. If the prospect asks/requests/pidió/solicitó/requirió something from the advisor, owner is "advisor".
Examples:
- "Pidió 6 cotizaciones para el martes" => owner: advisor, action: preparar/enviar 6 cotizaciones, due: martes.
- "Me pidió que le mandara la propuesta mañana" => owner: advisor, action: mandar propuesta, due: mañana.
- "Solicitó opciones de retiro para el viernes" => owner: advisor, action: preparar/enviar opciones de retiro, due: viernes.

2. If the prospect says they will do something, owner is "prospect".
Examples:
- "Dijo que revisa la propuesta el viernes" => owner: prospect.
- "Me confirma el lunes" => owner: prospect.

3. If the advisor says they will do something, owner is "advisor".
Examples:
- "Le paso la propuesta mañana" => owner: advisor.
- "Quedamos en que le mando opciones el martes" => owner: advisor.

Forbidden:
Never infer emotions, personality, hidden intent, psychological state, manipulation strategy, urgency based on vulnerability, purchase probability, conversion likelihood, political affiliation, religious belief, or health status.

Evidence:
Every candidate MUST include an exact evidence_span copied verbatim from the note.
If there is no exact evidence_span, do not extract the candidate.

Output shape:
{
  "candidates": [
    {
      "type": "commitment_established",
      "owner": "advisor|prospect|unknown",
      "action": "string|null",
      "due": "string|null",
      "confidence": 0.0,
      "evidence_span": "exact quote from note",
      "unknowns": []
    }
  ],
  "unknowns": []
}
`;

async function callGemini(note: string) {
  const model = genAI.getGenerativeModel({ model: MODEL_VERSION });

  const result = await model.generateContent({
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `${SYSTEM_PROMPT}\n\nAdvisor note:\n"""${note}"""`,
          },
        ],
      },
    ],
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.1,
    },
  });

  return result.response.text();
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "method_not_allowed" }, 405);
  }

  try {
    const body = await req.json();
    const note = typeof body.note === "string" ? body.note.trim() : "";

    if (!note) {
      return emptyResponse("missing_note");
    }

    const generatedAt = new Date().toISOString();
    const frame = buildSemanticFrame(note);

    // Flow: 
    // 1. buildSemanticFrame
    // 2. deterministicProspectRequest
    // 3. If deterministic candidate exists: return candidate + semantic_frame
    // 4. Else if semantic frame is clearly non-claimable: return no candidates + semantic_frame + unknowns=["non_claimable_interpretation"]
    // 5. Else: continue to Gemini fallback

    const deterministicCandidate = deterministicProspectRequest(note, generatedAt);
    if (deterministicCandidate) {
      return jsonResponse({
        function_version: FUNCTION_VERSION,
        summary: {
          candidate_count: 1,
          requires_human_review: true,
          model_version: MODEL_VERSION,
        },
        candidates: [deterministicCandidate],
        unknowns: deterministicCandidate.unknowns,
        requiresHumanReview: true,
        source: "semantic_extractor",
        model_version: MODEL_VERSION,
        semantic_frame: frame
      });
    }

    const primaryInterpretation = frame.interpretations[0];
    if (primaryInterpretation.scope === "greeting" || primaryInterpretation.intent_normalized === "decision_delay") {
      return emptyResponse("non_claimable_interpretation", frame);
    }

    const responseText = await callGemini(note);

    let parsed: Record<string, unknown>;

    try {
      parsed = JSON.parse(responseText);
    } catch (_error) {
      return emptyResponse("invalid_model_json", frame);
    }

    const rawCandidates = Array.isArray(parsed.candidates)
      ? parsed.candidates
      : [];

    const candidates = rawCandidates
      .map((candidate, index) =>
        sanitizeCandidate(
          candidate as Record<string, unknown>,
          note,
          index,
          generatedAt,
        )
      )
      .filter((candidate) => candidate !== null);

    const unknowns = Array.isArray(parsed.unknowns)
      ? parsed.unknowns.filter((item) => typeof item === "string")
      : [];

    if (candidates.length === 0 && unknowns.length === 0) {
      unknowns.push("no_actionable_event");
    }

    return jsonResponse({
      function_version: FUNCTION_VERSION,
      summary: {
        candidate_count: candidates.length,
        requires_human_review: true,
        model_version: MODEL_VERSION,
      },
      candidates,
      unknowns,
      requiresHumanReview: true,
      source: "semantic_extractor",
      model_version: MODEL_VERSION,
      semantic_frame: frame
    });
  } catch (error) {
    return jsonResponse({
      function_version: FUNCTION_VERSION,
      error: "semantic_extraction_unavailable",
      message: error instanceof Error ? error.message : String(error),
      summary: {
        candidate_count: 0,
        requires_human_review: true,
        model_version: MODEL_VERSION,
      },
      candidates: [],
      unknowns: ["semantic_extraction_unavailable"],
      requiresHumanReview: true,
      source: "semantic_extractor",
      model_version: MODEL_VERSION,
    });
  }
});
