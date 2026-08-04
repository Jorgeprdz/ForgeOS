import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { GoogleGenerativeAI } from "npm:@google/generative-ai";
import {
  buildDeterministicResponse,
  buildEnvelope,
  buildPrompt,
  normalizeModelResponse,
  normalizeRequest,
  parseJsonObject,
} from "./logic.mjs";

const FUNCTION_VERSION = "alfred-command-v1";
const MODEL_VERSION = "gemini-3.1-flash-lite";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function response(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
}

serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (request.method !== "POST") {
    return response({ error: "method_not_allowed" }, 405);
  }

  const authorization = request.headers.get("Authorization") || "";
  if (!authorization.toLowerCase().startsWith("bearer ")) {
    return response({ error: "auth_required" }, 401);
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
    const client = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authorization } },
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: { user }, error: userError } = await client.auth.getUser();
    if (userError || !user) {
      return response({ error: "auth_required" }, 401);
    }

    const requestBody = normalizeRequest(await request.json());
    if (!requestBody.command) {
      return response({ error: "command_required" }, 400);
    }

    const fallback = buildDeterministicResponse({
      command: requestBody.command,
      context: requestBody.context,
      user,
    });
    const apiKey = Deno.env.get("GEMINI_API_KEY") || "";

    if (!apiKey) {
      return response(buildEnvelope({
        response: fallback,
        provider: "deterministic",
        functionVersion: FUNCTION_VERSION,
        modelVersion: "not-enabled",
        degraded: true,
        providerError: "provider_key_unavailable",
      }));
    }

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: MODEL_VERSION });
      const result = await model.generateContent({
        contents: [{
          role: "user",
          parts: [{ text: buildPrompt({ request: requestBody, user }) }],
        }],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.35,
        },
      });
      const parsed = parseJsonObject(result.response.text());
      const normalized = normalizeModelResponse(parsed, fallback);
      return response(buildEnvelope({
        response: normalized,
        provider: "gemini",
        functionVersion: FUNCTION_VERSION,
        modelVersion: MODEL_VERSION,
      }));
    } catch (_providerError) {
      return response(buildEnvelope({
        response: fallback,
        provider: "deterministic",
        functionVersion: FUNCTION_VERSION,
        modelVersion: MODEL_VERSION,
        degraded: true,
        providerError: "provider_unavailable",
      }));
    }
  } catch (_error) {
    return response({
      error: "alfred_unavailable",
      requiresHumanApproval: true,
      mutationsPerformed: false,
    }, 503);
  }
});
