import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { GoogleGenerativeAI } from "npm:@google/generative-ai";

const FUNCTION_VERSION = "fallback-v2-debug";

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://forge-os.github.io",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const genAI = new GoogleGenerativeAI(Deno.env.get("GEMINI_API_KEY") || "");

const SYSTEM_PROMPT = `
You are an expert semantic extraction agent for Forge OS.
Your task is to extract actionable commitments and actions ONLY from the provided note.

Constraint Rules:
1. Extract ONLY: commitment_established, conversation_occurred.
2. Owners allowed: advisor, prospect, unknown.
3. Quality allowed: strong, medium, weak.
4. FORBIDDEN FIELDS: emotion, personality, hidden_intent, psychological_state, manipulation_strategy, urgency_based_on_vulnerability, purchase_probability, conversion_likelihood, political_affiliation, religious_belief, health_status.
5. If ambiguous, prefer "Unknown".
6. Every candidate MUST include exact 'evidence_span' copied verbatim from the note. IF MISSING, DO NOT EXTRACT.
7. Output source="semantic_extractor", review_status="proposed".
`;

async function callGemini(modelName: string, note: string) {
  console.log(`Attempting Gemini call with model: ${modelName}`);
  const model = genAI.getGenerativeModel({ model: modelName });
  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: `${SYSTEM_PROMPT}\n\nNote: "${note}"` }] }],
    generationConfig: { responseMimeType: "application/json" },
  });
  return { text: result.response.text(), modelUsed: modelName };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405, headers: corsHeaders });

  try {
    const { note } = await req.json();
    if (!note) return new Response("Missing note", { status: 400, headers: corsHeaders });

    let responseData;
    let modelUsed = "";

    try {
      const res = await callGemini("gemini-3.5-flash", note);
      responseData = res.text;
      modelUsed = res.modelUsed;
    } catch (e: any) {
      console.error("Primary model (gemini-3.5-flash) failed:", e);

      const errorMessage = (e.message || "").toLowerCase();
      // Retry with fallback if 503 or high demand
      if (errorMessage.includes("503") || errorMessage.includes("high demand") || errorMessage.includes("service_unavailable")) {
        console.log("Primary failed due to demand/503. Attempting fallback: gemini-3.1-flash-lite");

        try {
          const res = await callGemini("gemini-3.1-flash-lite", note);
          responseData = res.text;
          modelUsed = res.modelUsed;
        } catch (fallbackE: any) {
          console.error("Fallback model (gemini-3.1-flash-lite) failed:", fallbackE);
          throw fallbackE; // Both failed
        }
      } else {
        throw e; // Non-503 failure, do not retry
      }
    }

    const parsed = JSON.parse(responseData);

    const hardenedCandidates = (parsed.candidates || []).map((c: any) => ({
      ...c,
      source: "semantic_extractor",
      review_status: "proposed",
      model_version: modelUsed,
      generated_at: new Date().toISOString()
    })).filter((c: any) => c.evidence_span && note.includes(c.evidence_span));

    return new Response(JSON.stringify({ 
      candidates: hardenedCandidates, 
      unknowns: parsed.unknowns || [], 
      requiresHumanReview: true,
      function_version: FUNCTION_VERSION
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Both models failed or unrecoverable error:", error);
    return new Response(JSON.stringify({ 
      error: "semantic_extraction_unavailable",
      function_version: FUNCTION_VERSION,
      message: error instanceof Error ? error.message : String(error),
      candidates: [],
      unknowns: ["semantic_extraction_unavailable"],
      requiresHumanReview: true
    }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
