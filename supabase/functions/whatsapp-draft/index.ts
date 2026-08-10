import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { GoogleGenerativeAI } from "npm:@google/generative-ai";

const FUNCTION_VERSION = "whatsapp-humanizer-v2";
const MODEL_VERSION = "gemini-3.1-flash-lite";
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
    const baseMessage = clean(body?.baseMessage, 1800);
    const lockedCta = clean(body?.lockedCta, 500);
    const tone = clean(body?.tone, 80) || "natural y directo";
    const locale = clean(body?.locale, 40) || "es-MX";
    const prohibitedClaims = Array.isArray(body?.prohibitedClaims)
      ? body.prohibitedClaims.map((value: unknown) => clean(value, 200)).filter(Boolean).slice(0, 30)
      : [];

    if (!baseMessage) return response({ error: "base_message_required" }, 400);
    if (!lockedCta || !baseMessage.includes(lockedCta)) return response({ error: "locked_cta_required" }, 400);

    const genAI = new GoogleGenerativeAI(Deno.env.get("GEMINI_API_KEY") || "");
    const model = genAI.getGenerativeModel({ model: MODEL_VERSION });
    const prompt = `No escribas un mensaje nuevo. Recibirás un mensaje base completo y gobernado por ForgeOS. Tu única tarea es hacerlo sonar más natural en español de México.

Reglas obligatorias:
- No agregues hechos, personas, empresas, productos, coberturas, cantidades, fechas, beneficios, promesas ni conversaciones.
- No elimines ni cambies nombres.
- No cambies el objetivo.
- No cambies el nivel de certeza.
- Conserva textualmente el CTA bloqueado.
- No uses ningún claim prohibido.
- No digas que eres una IA.
- Devuelve JSON válido con la forma {"draft":"...","transformations":["..."]}.

Locale: ${locale}
Tono permitido: ${tone}
CTA bloqueado: ${JSON.stringify(lockedCta)}
Claims prohibidos: ${JSON.stringify(prohibitedClaims)}
Mensaje base: ${JSON.stringify(baseMessage)}`;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json", temperature: 0.15 },
    });
    const parsed = JSON.parse(result.response.text());
    const draft = clean(parsed?.draft, 1800);
    const transformations = Array.isArray(parsed?.transformations)
      ? parsed.transformations.map((value: unknown) => clean(value, 160)).filter(Boolean).slice(0, 10)
      : [];
    if (!draft) return response({ error: "empty_draft" }, 502);
    if (!draft.includes(lockedCta)) return response({ error: "changed_locked_cta" }, 422);

    return response({
      ok: true,
      functionVersion: FUNCTION_VERSION,
      modelVersion: MODEL_VERSION,
      promptVersion: "FORGE_WHATSAPP_RESTRICTED_HUMANIZER_002",
      requiresHumanReview: true,
      mutatesProductState: false,
      draft,
      transformations,
    });
  } catch (error) {
    return response({
      error: "humanizer_unavailable",
      message: error instanceof Error ? error.message : String(error),
      requiresHumanReview: true,
    }, 503);
  }
});
