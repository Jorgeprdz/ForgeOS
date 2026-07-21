export const GEMINI_PROVIDER_ID = "gemini";
export const GEMINI_FLASH_MODEL_ID = "gemini-1.5-flash";
export const GEMINI_PROVIDER_ENABLED_ENV = "NASH_GEMINI_DRAFT_PROVIDER_ENABLED";
export const GEMINI_API_KEY_ENV = "GEMINI_API_KEY";
export const GEMINI_TIMEOUT_MS = 8000;

const RESULT_STATES = Object.freeze({
  SUCCESS: "SUCCESS",
  NO_DRAFT: "NO_DRAFT",
  ERROR: "ERROR",
});

function nowIso() {
  return new Date().toISOString();
}

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function envGet(env, key) {
  if (!env) return "";
  if (typeof env.get === "function") return env.get(key) || "";
  return env[key] || "";
}

function metadata(generationMode, startedAt) {
  return {
    providerId: GEMINI_PROVIDER_ID,
    modelId: GEMINI_FLASH_MODEL_ID,
    generationMode,
    generatedAt: nowIso(),
    durationMs: Date.now() - startedAt,
    externalProviderEnabled: false,
    deterministicFallbackRequired: true,
  };
}

function errorEnvelope(code, message, retryable, generationMode, startedAt) {
  return {
    resultState: RESULT_STATES.ERROR,
    draftCandidate: null,
    metadata: metadata(generationMode, startedAt),
    error: { code, message, retryable },
  };
}

function noDraftEnvelope(generationMode, startedAt) {
  return {
    resultState: RESULT_STATES.NO_DRAFT,
    draftCandidate: null,
    metadata: metadata(generationMode, startedAt),
    error: null,
  };
}

function successEnvelope(text, startedAt) {
  return {
    resultState: RESULT_STATES.SUCCESS,
    draftCandidate: {
      rawText: text,
      reviewRequired: true,
      sendsMessage: false,
      notSendable: true,
      sourceMutable: false,
      providerId: GEMINI_PROVIDER_ID,
    },
    metadata: metadata("gemini_experimental", startedAt),
    error: null,
  };
}

function buildTemporaryDraftPrompt(prospectMessageContext) {
  const allowed = JSON.stringify(prospectMessageContext);
  return [
    "Create one concise prospect-facing WhatsApp draft candidate in Spanish.",
    "Use only the supplied ProspectMessageContext JSON.",
    "Do not invent products, values, commitments, consent, urgency, or recommendations.",
    "Return only JSON with shape {\"draftText\":\"...\"} or {\"noDraft\":true}.",
    `ProspectMessageContext: ${allowed}`,
  ].join("\n");
}

function parseGeminiText(response) {
  if (typeof response === "string") return response;
  if (typeof response?.text === "string") return response.text;
  if (typeof response?.response?.text === "function") return response.response.text();
  return "";
}

function parseDraftText(text) {
  const trimmed = String(text || "").trim();
  if (!trimmed) return { noDraft: true };
  try {
    const parsed = JSON.parse(trimmed);
    if (parsed?.noDraft === true) return { noDraft: true };
    if (typeof parsed?.draftText === "string" && parsed.draftText.trim()) {
      return { draftText: parsed.draftText.trim() };
    }
    return { malformed: true };
  } catch (_error) {
    return { malformed: true };
  }
}

async function withTimeout(promise, timeoutMs) {
  let timer = null;
  const timeout = new Promise((resolve) => {
    timer = setTimeout(() => resolve({ timeout: true }), timeoutMs);
  });
  const result = await Promise.race([promise, timeout]);
  if (timer) clearTimeout(timer);
  return result;
}

export async function buildGeminiDraftProviderResponse({
  prospectMessageContext,
  env,
  createModel,
  timeoutMs = GEMINI_TIMEOUT_MS,
  startedAt = Date.now(),
} = {}) {
  if (!isObject(prospectMessageContext)) {
    return errorEnvelope(
      "PROSPECT_MESSAGE_CONTEXT_INVALID",
      "prospectMessageContext must be a non-array object.",
      false,
      "request_validation",
      startedAt,
    );
  }

  if (envGet(env, GEMINI_PROVIDER_ENABLED_ENV) !== "true") {
    return errorEnvelope(
      "PROVIDER_NOT_ENABLED",
      "Experimental Gemini draft provider is not enabled.",
      false,
      "provider_disabled",
      startedAt,
    );
  }

  const apiKey = envGet(env, GEMINI_API_KEY_ENV);
  if (!apiKey) {
    return errorEnvelope(
      "PROVIDER_UNAVAILABLE",
      "Experimental Gemini draft provider is unavailable.",
      true,
      "secret_unavailable",
      startedAt,
    );
  }

  if (typeof createModel !== "function") {
    return errorEnvelope(
      "PROVIDER_UNAVAILABLE",
      "Experimental Gemini draft provider transport is unavailable.",
      true,
      "transport_unavailable",
      startedAt,
    );
  }

  let model = null;
  try {
    model = createModel({ apiKey, modelId: GEMINI_FLASH_MODEL_ID });
  } catch (error) {
    console.error("Gemini transport initialization failed:", error);
    return errorEnvelope(
      "PROVIDER_UNAVAILABLE",
      error instanceof Error ? error.message : String(error),
      true,
      "transport_unavailable",
      startedAt,
    );
  }

  if (!model || typeof model.generateContent !== "function") {
    return errorEnvelope(
      "PROVIDER_UNAVAILABLE",
      "Experimental Gemini draft provider model is unavailable.",
      true,
      "model_unavailable",
      startedAt,
    );
  }

  const prompt = buildTemporaryDraftPrompt(prospectMessageContext);
  let providerResult = null;
  try {
    providerResult = await withTimeout(
      model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.2,
        },
      }),
      timeoutMs,
    );
  } catch (error) {
    console.error("Gemini generateContent failed:", error);
    return errorEnvelope(
      "PROVIDER_UNAVAILABLE",
      error instanceof Error ? error.message : String(error),
      true,
      "transport_unavailable",
      startedAt,
    );
  }

  if (providerResult?.timeout === true) {
    return errorEnvelope(
      "PROVIDER_TIMEOUT",
      "Experimental Gemini draft provider timed out.",
      true,
      "timeout",
      startedAt,
    );
  }

  const parsed = parseDraftText(parseGeminiText(providerResult));
  if (parsed.noDraft) return noDraftEnvelope("gemini_no_draft", startedAt);
  if (parsed.malformed) {
    return errorEnvelope(
      "PROVIDER_RETURNED_INVALID_DRAFT_CANDIDATE",
      "Experimental Gemini draft provider returned an invalid draft candidate.",
      true,
      "malformed_provider_response",
      startedAt,
    );
  }

  return successEnvelope(parsed.draftText, startedAt);
}
