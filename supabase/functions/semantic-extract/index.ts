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

function emptyResponse(unknown = "no_actionable_event") {
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
  });
}

function isTrivialGreeting(note: string): boolean {
  return TRIVIAL_GREETINGS.includes(normalizeText(note));
}

function buildSemanticFrame(note: string, now = new Date()) {
  const normalized = normalizeText(note);
  
  // Basic classification
  let scope = "unknown";
  let intent_normalized = "unknown";
  let action = null;
  let temporal_reference = null;
  let claimable = false;
  let uncertainty_flags = [];
  let semantic_confidence = 0.0;
  let claim_confidence = 0.0;

  // Simple classification heuristics
  if (isTrivialGreeting(note)) {
    scope = "greeting";
    intent_normalized = "greeting_only";
    semantic_confidence = 1.0;
  } else if (normalized.includes("pensara") || normalized.includes("va a pensar") || normalized.includes("lo pensara")) {
    scope = "intent";
    intent_normalized = "decision_delay";
    semantic_confidence = 0.95;
    claim_confidence = 0.35;
    uncertainty_flags = ["NON_ACTIONABLE_INTENT"];
  } else {
    // Basic request parsing heuristic (could be improved)
    const requestMatch = note.match(/(pidio|solicito|requiere|llamar|seguimiento)\s+(.*)/i);
    if (requestMatch) {
      scope = "commitment";
      intent_normalized = "advisor_request";
      action = requestMatch[1].toLowerCase();
      claimable = true;
      semantic_confidence = 0.95;
      claim_confidence = 0.8;
      
      const tempMatch = requestMatch[2].match(/(próximo año|proximo año|julio|dentro de \d+ meses)/i);
      if (tempMatch) {
        temporal_reference = tempMatch[0];
      }
    }
  }

  return {
    frame_type: "hdl_semantic_frame",
    source: "hdl_semantic_normalizer",
    semantic_confidence,
    original_text: note,
    interpretations: [
      {
        scope,
        intent_normalized,
        action,
        temporal_reference,
        semantic_confidence,
        claim_confidence,
        claimable,
        uncertainty_flags,
      },
    ],
  };
}

function deterministicProspectRequest(note: string, generatedAt: string) {
  const normalized = normalizeText(note);

  const hasRequestVerb =
    normalized.startsWith("pidio ") ||
    normalized.startsWith("me pidio ") ||
    normalized.startsWith("solicito ") ||
    normalized.startsWith("me solicito ") ||
    normalized.startsWith("requiere ") ||
    normalized.startsWith("me requiere ");

  if (!hasRequestVerb) return null;

  let due: string | null = null;
  const relativeMonth = resolveRelativeMonthReference(note);

  if (relativeMonth) {
    due = relativeMonth;
  } else {
    const dueMatch = normalized.match(
      /\b(para|el)\s+(lunes|martes|miercoles|jueves|viernes|sabado|domingo|manana|hoy|la proxima semana|proxima semana|fin de mes|este mes|enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)\b/,
    );
    if (dueMatch) {
      due = dueMatch[2];
    }
  }

  let action = note.trim();
  action = action.replace(/^me\s+/i, "");
  action = action.replace(/^pid[ií]o\s+/i, "preparar/enviar ");
  action = action.replace(/^solicit[oó]\s+/i, "preparar/enviar ");
  action = action.replace(/^requiere\s+/i, "preparar/enviar ");

  if (relativeMonth) {
    action = action.replace(/\b(en|dentro\s+de)\s+(\d+)\s+mes(es)?\b/i, "");
  }

  action = action.replace(
    /\s+(para|el)\s+(lunes|martes|miércoles|miercoles|jueves|viernes|sábado|sabado|domingo|mañana|manana|hoy|la\s+próxima\s+semana|la\s+proxima\s+semana|próxima\s+semana|proxima\s+semana|fin\s+de\s+mes|este\s+mes|enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre).*$/i,
    "",
  );

  action = action.trim();

  return {
    id: "cand_001",
    type: "commitment_established",
    owner: "advisor",
    action: action,
    due,
    quality: computeQuality(
      "commitment_established",
      "advisor",
      action,
      due,
    ),
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

    if (isTrivialGreeting(note)) {
      return emptyResponse("no_actionable_event");
    }

    const generatedAt = new Date().toISOString();
    const frame = buildSemanticFrame(note);

    // Canonical extraction now reads from the frame if claimable
    const primaryInterpretation = frame.interpretations[0];
    if (primaryInterpretation.claimable) {
      return jsonResponse({
        function_version: FUNCTION_VERSION,
        summary: {
          candidate_count: 1,
          requires_human_review: true,
          model_version: MODEL_VERSION,
        },
        candidates: [{
          id: "cand_001",
          type: "commitment_established",
          owner: "advisor",
          action: primaryInterpretation.action || "general_action",
          due: primaryInterpretation.temporal_reference,
          quality: "medium",
          confidence: primaryInterpretation.claim_confidence,
          evidence_span: note,
          review_status: "proposed",
          source: "hdl_semantic_frame_extractor",
          model_version: MODEL_VERSION,
          generated_at: generatedAt,
          unknowns: [],
        }],
        unknowns: [],
        requiresHumanReview: true,
        source: "semantic_extractor",
        model_version: MODEL_VERSION,
        semantic_frame: frame
      });
    } else {
        return jsonResponse({
        function_version: FUNCTION_VERSION,
        summary: {
          candidate_count: 0,
          requires_human_review: true,
          model_version: MODEL_VERSION,
        },
        candidates: [],
        unknowns: ["non_claimable_interpretation"],
        requiresHumanReview: true,
        source: "semantic_extractor",
        model_version: MODEL_VERSION,
        semantic_frame: frame
      });
    }

    /*
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
      });
    }
    */

    const responseText = await callGemini(note);

    let parsed: Record<string, unknown>;

    try {
      parsed = JSON.parse(responseText);
    } catch (_error) {
      return emptyResponse("invalid_model_json");
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
