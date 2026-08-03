import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { GoogleGenerativeAI } from "npm:@google/generative-ai";

const FUNCTION_VERSION = "whatsapp-draft-v1";
const MODEL_VERSION = "gemini-3.1-flash-lite";
const ALLOWED_INTENTS = new Set([
  "primer_contacto",
  "seguimiento",
  "retomar_conversacion",
  "confirmar_cita",
  "solicitar_documentos",
  "seguimiento_propuesta",
]);
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function response(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function clean(value: unknown, max = 500) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return response({ error: "method_not_allowed" }, 405);

  try {
    const authorization = request.headers.get("Authorization") || "";
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
    const client = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authorization } },
      auth: { persistSession: false },
    });
    const { data: { user } } = await client.auth.getUser();
    if (!user) return response({ error: "auth_required" }, 401);

    const body = await request.json();
    const intent = clean(body?.intent, 80);
    if (!ALLOWED_INTENTS.has(intent)) return response({ error: "invalid_intent" }, 400);

    const context = {
      name: clean(body?.context?.name, 160),
      stage: clean(body?.context?.stage, 120),
      source: clean(body?.context?.source, 120),
      lastActivity: clean(body?.context?.lastActivity, 500),
      objection: clean(body?.context?.objection, 500),
      objective: clean(body?.context?.objective, 500),
      notes: clean(body?.context?.notes, 1200),
    };
    if (!context.name) return response({ error: "prospect_name_required" }, 400);

    const genAI = new GoogleGenerativeAI(Deno.env.get("GEMINI_API_KEY") || "");
    const model = genAI.getGenerativeModel({ model: MODEL_VERSION });
    const prompt = `Eres el redactor de WhatsApp de ForgeOS. Redacta UN SOLO borrador breve, natural y profesional en español de México. No inventes datos, productos, coberturas, fechas ni conversaciones. Usa únicamente el contexto proporcionado. No digas que eres una IA. Incluye un CTA sencillo. Devuelve JSON válido con la forma {"draft":"..."}.

Intención: ${intent}
Contexto gobernado: ${JSON.stringify(context)}`;
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json", temperature: 0.45 },
    });
    const parsed = JSON.parse(result.response.text());
    const draft = clean(parsed?.draft, 1800);
    if (!draft) return response({ error: "empty_draft" }, 502);

    return response({
      ok: true,
      functionVersion: FUNCTION_VERSION,
      modelVersion: MODEL_VERSION,
      requiresHumanReview: true,
      mutatesProductState: false,
      draft,
    });
  } catch (error) {
    return response({
      error: "draft_unavailable",
      message: error instanceof Error ? error.message : String(error),
      requiresHumanReview: true,
    }, 503);
  }
});
