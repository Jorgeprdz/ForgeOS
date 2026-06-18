import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { GoogleGenerativeAI } from "npm:@google/generative-ai";

const FUNCTION_VERSION = "semantic-extract-v0.6-ownership-stable-lite";
const MODEL_VERSION = "gemini-3.1-flash-lite";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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
