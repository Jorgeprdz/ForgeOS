import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const FUNCTION_VERSION = "nash-draft-provider-shell-067g17n14";

const RESULT_STATES = {
  SUCCESS: "SUCCESS",
  NO_DRAFT: "NO_DRAFT",
  ERROR: "ERROR",
} as const;

const PROVIDERS = {
  DETERMINISTIC: "deterministic",
  GEMINI: "gemini",
  OPENAI: "openai",
} as const;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type ResultState = typeof RESULT_STATES[keyof typeof RESULT_STATES];

type ProviderId = typeof PROVIDERS[keyof typeof PROVIDERS];

type ProviderDraftError = {
  code: string;
  message: string;
  retryable: boolean;
};

type ProviderMetadata = {
  providerId: string;
  modelId: string;
  generationMode: string;
  generatedAt: string;
  durationMs?: number;
  functionVersion: string;
  externalProviderEnabled: false;
  deterministicFallbackRequired: true;
};

type ProviderEnvelope = {
  resultState: ResultState;
  draftCandidate: null;
  metadata: ProviderMetadata;
  error: ProviderDraftError | null;
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

function metadata(providerId: string, generationMode: string, startedAt: number): ProviderMetadata {
  return {
    providerId,
    modelId: "not-enabled",
    generationMode,
    generatedAt: new Date().toISOString(),
    durationMs: Date.now() - startedAt,
    functionVersion: FUNCTION_VERSION,
    externalProviderEnabled: false,
    deterministicFallbackRequired: true,
  };
}

function envelope({
  resultState,
  providerId,
  generationMode,
  startedAt,
  error = null,
}: {
  resultState: ResultState;
  providerId: string;
  generationMode: string;
  startedAt: number;
  error?: ProviderDraftError | null;
}): ProviderEnvelope {
  return {
    resultState,
    draftCandidate: null,
    metadata: metadata(providerId, generationMode, startedAt),
    error,
  };
}

function deterministicError(code: string, message: string, retryable = false): ProviderDraftError {
  return { code, message, retryable };
}

function normalizeProvider(value: unknown): string {
  return typeof value === "string" && value.trim()
    ? value.trim().toLowerCase()
    : PROVIDERS.DETERMINISTIC;
}

function isSupportedProvider(providerId: string): providerId is ProviderId {
  return providerId === PROVIDERS.DETERMINISTIC ||
    providerId === PROVIDERS.GEMINI ||
    providerId === PROVIDERS.OPENAI;
}

function hasValidProspectMessageContext(body: Record<string, unknown>) {
  const context = body.prospectMessageContext;
  return Boolean(context && typeof context === "object" && !Array.isArray(context));
}

function buildProviderResponse(body: unknown, startedAt = Date.now()): ProviderEnvelope {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return envelope({
      resultState: RESULT_STATES.ERROR,
      providerId: PROVIDERS.DETERMINISTIC,
      generationMode: "request_validation",
      startedAt,
      error: deterministicError(
        "PROSPECT_MESSAGE_CONTEXT_INVALID",
        "Request body must be an object containing prospectMessageContext.",
      ),
    });
  }

  const request = body as Record<string, unknown>;
  const providerId = normalizeProvider(request.providerId || request.requestedProvider);

  if (!isSupportedProvider(providerId)) {
    return envelope({
      resultState: RESULT_STATES.ERROR,
      providerId,
      generationMode: "provider_selection",
      startedAt,
      error: deterministicError(
        "UNKNOWN_PROVIDER_ERROR",
        "Provider selection is not supported by the NASH draft provider shell.",
      ),
    });
  }

  if (!hasValidProspectMessageContext(request)) {
    return envelope({
      resultState: RESULT_STATES.ERROR,
      providerId,
      generationMode: "request_validation",
      startedAt,
      error: deterministicError(
        "PROSPECT_MESSAGE_CONTEXT_INVALID",
        "prospectMessageContext must be a non-array object.",
      ),
    });
  }

  if (providerId === PROVIDERS.DETERMINISTIC) {
    return envelope({
      resultState: RESULT_STATES.NO_DRAFT,
      providerId,
      generationMode: "local_deterministic_flow_required",
      startedAt,
    });
  }

  return envelope({
    resultState: RESULT_STATES.ERROR,
    providerId,
    generationMode: "external_provider_not_enabled",
    startedAt,
    error: deterministicError(
      "PROVIDER_NOT_ENABLED",
      "External AI draft providers are not enabled in this shell.",
    ),
  });
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
    return jsonResponse(buildProviderResponse(body));
  } catch (_error) {
    return jsonResponse(
      buildProviderResponse(null),
      400,
    );
  }
});
