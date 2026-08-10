import { createClient } from "npm:@supabase/supabase-js@2.108.2";
// @ts-ignore governed local CommonJS domain runtime
import compensationRuntime from "../../../compensation/advisor/server/advisor-compensation-productive-orchestrator.js";
// @ts-ignore identity-only source; candidate rates are never passed to Stage 040
import candidateIdentityRuntime from "../../../compensation/advisor/rules/advisor-compensation-candidate-rule-pack-builder.js";

const FUNCTION_VERSION = "FORGE_ADVISOR_COMPENSATION_HANDOFF_011D_003";
const REFERENCE_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,239}$/;
const { orchestrateAdvisorCompensationHandoff } = compensationRuntime as {
  orchestrateAdvisorCompensationHandoff: (input: Record<string, unknown>) => Promise<any>;
};
const PRODUCT_MAP = (candidateIdentityRuntime as any).PRODUCT_MAP || {};

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Cache-Control": "no-store, max-age=0",
  "Content-Type": "application/json; charset=utf-8",
  "Referrer-Policy": "no-referrer",
};

function json(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), { status, headers: CORS_HEADERS });
}

function resolveServiceRoleKey() {
  const legacy = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")?.trim();
  if (legacy) return legacy;
  const dictionary = Deno.env.get("SUPABASE_SECRET_KEYS")?.trim();
  if (!dictionary) return "";
  try {
    const parsed = JSON.parse(dictionary);
    return typeof parsed?.default === "string" ? parsed.default.trim() : "";
  } catch {
    return "";
  }
}

function bearerToken(request: Request) {
  const header = request.headers.get("Authorization")?.trim() || "";
  const match = /^Bearer\s+(.+)$/i.exec(header);
  return match?.[1]?.trim() || "";
}

function productIdentities() {
  return Object.entries(PRODUCT_MAP).map(([displayName, raw]: [string, any]) => ({
    productId: raw.productId,
    carrierId: "SMNYL",
    displayName,
    lineOfBusiness: raw.lineOfBusiness,
    aliases: Array.isArray(raw.aliases) ? [...raw.aliases] : [],
    identityStatus: "CANDIDATE_IDENTITY_ONLY_NOT_RULE_TRUTH",
  }));
}

function shiftPeriod(periodKey: string, offset: number) {
  const [year, month] = periodKey.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1 + offset, 1));
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

function sixPeriods(periodKey: string) {
  return Array.from({ length: 6 }, (_, index) => shiftPeriod(periodKey, index - 5));
}

function diagnosticLog(result: any) {
  const d = result?.diagnostics || {};
  console.info(JSON.stringify({
    FORGE_COMPENSATION_HANDOFF: true,
    STATE: result?.state || "FAILED",
    AUTH: d.AUTH_STATE === "OK" ? "OK" : "FAIL",
    OWNER_SCOPE: d.PAYMENT_AUTHORITY_STATE === "CONFIRMED" ? "OK" : "FAIL",
    PAYMENT_EVENT: d.PAYMENT_AUTHORITY_STATE || "INVALID",
    STAGE_080: d.STAGE_080_STATE || "NOT_RUN",
    STAGE_030: d.STAGE_030_STATE || "NOT_RUN",
    STAGE_040: d.STAGE_040_STATE || "NOT_RUN",
    STAGE_050: d.STAGE_050_STATE || "NOT_RUN",
    LEDGER_WRITE: d.LEDGER_STATE || "NOT_RUN",
    MATERIALIZATION: d.MATERIALIZATION_STATE || "NOT_RUN",
    INCOME_READ: d.INCOME_READ_STATE || "NOT_MATERIALIZED",
    UNKNOWN_ZERO: false,
    SYNTHETIC_WRITER_USED: false,
    DEMO_FALLBACK_USED: false,
    BUILD_SHA: d.BUILD_SHA || null,
  }));
}

async function rpc(client: any, name: string, args: Record<string, unknown>) {
  const response = await client.rpc(name, args);
  if (response?.error) {
    const error = new Error(name + "_FAILED");
    (error as any).code = name + "_FAILED";
    throw error;
  }
  return response?.data;
}

Deno.serve(async (request: Request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: CORS_HEADERS });
  if (request.method !== "POST") return json(405, { state: "FAILED", reason: "METHOD_NOT_ALLOWED" });

  const token = bearerToken(request);
  if (!token) return json(401, { state: "AUTH_REQUIRED", diagnostics: { AUTH_STATE: "FAIL" } });

  const supabaseUrl = Deno.env.get("SUPABASE_URL")?.trim() || "";
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")?.trim() || "";
  const serviceRoleKey = resolveServiceRoleKey();
  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    return json(503, { state: "FAILED", reason: "SERVER_CONFIGURATION_INVALID" });
  }

  let body: any;
  try { body = await request.json(); } catch { return json(400, { state: "FAILED", reason: "REQUEST_JSON_INVALID" }); }
  const paymentEventReference = typeof body?.paymentEventReference === "string" ? body.paymentEventReference.trim() : "";
  if (!REFERENCE_PATTERN.test(paymentEventReference)) {
    return json(400, { state: "PAYMENT_NOT_FOUND", reason: "PAYMENT_EVENT_REFERENCE_INVALID" });
  }

  const userClient = createClient(supabaseUrl, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const authResult = await userClient.auth.getUser(token);
  if (authResult.error || !authResult.data.user?.id) return json(401, { state: "AUTH_INVALID" });

  const serviceClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  let context: any;
  try {
    context = await rpc(serviceClient, "forge_advisor_compensation_handoff_context_server_011d", {
      p_actor_id: authResult.data.user.id,
      p_payment_event_reference: paymentEventReference,
    });
  } catch {
    return json(503, { state: "FAILED", reason: "CANONICAL_CONTEXT_READ_FAILED" });
  }

  if (!context || context.state !== "ACCEPTED") {
    const status = context?.state === "OWNER_MISMATCH" ? 403
      : context?.state === "PAYMENT_NOT_FOUND" ? 404
      : context?.state === "PAYMENT_NOT_CONFIRMED" ? 409
      : context?.state === "AUTH_REQUIRED" ? 401 : 400;
    return json(status, { state: context?.state || "PAYMENT_NOT_FOUND", paymentEventReference });
  }

  const paymentDate = String(context?.payment?.paymentDate || "");
  const periodKey = /^\d{4}-\d{2}-\d{2}$/.test(paymentDate) ? paymentDate.slice(0, 7) : "";
  const periodKeys = periodKey ? sixPeriods(periodKey) : [];

  const result = await orchestrateAdvisorCompensationHandoff({
    canonicalContext: context,
    productIdentities: productIdentities(),
    // Fail closed until an official governed Rule Pack and lifecycle authority are connected.
    officialRulePack: null,
    advisorMonthResolution: null,
    calculationContext: {},
    buildSha: Deno.env.get("FORGE_BUILD_SHA")?.trim() || Deno.env.get("GITHUB_SHA")?.trim() || null,
    claimIntake: (advisorId: string, event: unknown) => rpc(serviceClient, "forge_advisor_compensation_claim_intake_011d", {
      p_advisor_id: advisorId, p_event: event,
    }),
    commitEconomicEvent: (advisorId: string, paymentEvent: unknown, compensationEvent: unknown) => rpc(
      serviceClient,
      "forge_advisor_compensation_commit_event_011d",
      { p_advisor_id: advisorId, p_payment_event: paymentEvent, p_compensation_event: compensationEvent },
    ),
    loadMaterializationInputs: (advisorId: string, keys: string[]) => rpc(
      serviceClient,
      "forge_advisor_compensation_materialization_inputs_011d",
      { p_advisor_id: advisorId, p_period_keys: keys },
    ),
    appendReadModel: (advisorId: string, materialization: unknown) => rpc(
      serviceClient,
      "forge_advisor_compensation_append_read_model_011d",
      { p_advisor_id: advisorId, p_materialization: materialization },
    ),
    readIncome: async () => {
      if (!periodKey || !periodKeys.length) return { state: "BLOCKED" };
      const response = await userClient.rpc("forge_advisor_compensation_read_product", {
        p_period_key: periodKey, p_period_keys: periodKeys,
      });
      if (response.error) return { state: "BLOCKED" };
      return { state: response.data?.sourceHealth?.canonicalSnapshot || response.data?.sourceState || "READY" };
    },
  });

  diagnosticLog(result);
  if (["COMPLETED", "REPLAYED"].includes(result.state)) {
    return json(200, { state: result.state, message: "Pago confirmado. Compensación actualizada.", paymentEventReference, diagnostics: result.diagnostics });
  }
  if (result.state === "BLOCKED") {
    return json(200, { state: "BLOCKED", message: "Pago confirmado. La compensación requiere información adicional.", paymentEventReference, reason: result.reason, amount: null, diagnostics: result.diagnostics });
  }
  return json(503, { state: "FAILED", message: "Pago confirmado. No fue posible actualizar la compensación en este momento.", paymentEventReference, reason: result.reason || "COMPENSATION_HANDOFF_FAILED", diagnostics: result.diagnostics });
});

export const FORGE_ADVISOR_COMPENSATION_HANDOFF_VERSION = FUNCTION_VERSION;
