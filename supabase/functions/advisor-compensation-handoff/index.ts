import { createClient } from "npm:@supabase/supabase-js@2.108.2";
import handoffModule from "../../../compensation/advisor/orchestration/advisor-compensation-productive-handoff-011d.cjs";
import { resolveOfficialAdvisorCareerClock } from "../../../advisor-lifecycle/advisor-career-clock.js";

const { createAdvisorCompensationProductiveHandoff011d } = handoffModule as {
  createAdvisorCompensationProductiveHandoff011d: (input: Record<string, unknown>) => {
    execute: (input: Record<string, unknown>) => Promise<Record<string, unknown>>;
  };
};

const REF = /^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,239}$/;
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

function publicGate(overrides: Record<string, unknown> = {}) {
  return {
    contract: "FORGE_ADVISOR_COMPENSATION_PRODUCTIVE_GATE",
    AUTH_STATE: "NOT_RUN",
    PAYMENT_AUTHORITY_STATE: "NOT_RUN",
    HANDOFF_STATE: "NOT_RUN",
    STAGE_080_STATE: "NOT_RUN",
    STAGE_030_STATE: "NOT_RUN",
    STAGE_040_STATE: "NOT_RUN",
    STAGE_050_STATE: "NOT_RUN",
    LEDGER_STATE: "NOT_RUN",
    MATERIALIZATION_STATE: "NOT_RUN",
    INCOME_READ_STATE: "NOT_RUN",
    IDEMPOTENCY_STATE: "NOT_RUN",
    DEMO_FALLBACK_USED: false,
    SYNTHETIC_WRITER_USED: false,
    UNKNOWN_COERCION_USED: false,
    ...overrides,
  };
}

function safeLog(result: Record<string, any>) {
  const gate = result?.gate || {};
  console.info(JSON.stringify({
    event: "FORGE_COMPENSATION_HANDOFF",
    STATE: result?.state || "FAILED",
    AUTH: gate.AUTH_STATE || "NOT_RUN",
    OWNER_SCOPE: gate.AUTH_STATE === "OK" ? "OK" : "FAIL",
    PAYMENT_EVENT: gate.PAYMENT_AUTHORITY_STATE || "NOT_RUN",
    STAGE_080: gate.STAGE_080_STATE || "NOT_RUN",
    STAGE_030: gate.STAGE_030_STATE || "NOT_RUN",
    STAGE_040: gate.STAGE_040_STATE || "NOT_RUN",
    STAGE_050: gate.STAGE_050_STATE || "NOT_RUN",
    LEDGER_WRITE: gate.LEDGER_STATE || "NOT_RUN",
    MATERIALIZATION: gate.MATERIALIZATION_STATE || "NOT_RUN",
    INCOME_READ: gate.INCOME_READ_STATE || "NOT_RUN",
    UNKNOWN_ZERO: false,
    SYNTHETIC_WRITER_USED: false,
    DEMO_FALLBACK_USED: false,
    BUILD_SHA: String(Deno.env.get("FORGE_BUILD_SHA") || "repository-source").slice(0, 12),
  }));
}

async function invokeRpc(client: any, name: string, args: Record<string, unknown>) {
  const result = await client.rpc(name, args);
  if (result?.error) {
    const error = new Error(result.error.code || result.error.message || `${name}_FAILED`);
    (error as any).code = result.error.code || `${name}_FAILED`;
    (error as any).cause = result.error;
    throw error;
  }
  return result?.data;
}

export default {
  async fetch(request: Request) {
    if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
    if (request.method !== "POST") return json({ error: "METHOD_NOT_ALLOWED" }, 405);

    const authorization = request.headers.get("Authorization") || "";
    if (!authorization.toLowerCase().startsWith("bearer ")) {
      const response = { state: "FAILED", reason: "AUTH_REQUIRED", gate: publicGate({ AUTH_STATE: "FAIL" }) };
      safeLog(response);
      return json(response, 401);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    if (!supabaseUrl || !anonKey || !serviceRoleKey) {
      const response = { state: "FAILED", reason: "SERVER_CONFIGURATION_UNAVAILABLE", gate: publicGate({ AUTH_STATE: "FAIL" }) };
      safeLog(response);
      return json(response, 503);
    }

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authorization } },
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const userResult = await userClient.auth.getUser();
    if (userResult?.error || !userResult?.data?.user?.id) {
      const response = { state: "FAILED", reason: "AUTH_INVALID", gate: publicGate({ AUTH_STATE: "FAIL" }) };
      safeLog(response);
      return json(response, 401);
    }

    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return json({ state: "FAILED", reason: "REQUEST_JSON_INVALID", gate: publicGate({ AUTH_STATE: "OK" }) }, 400);
    }
    const paymentEventReference = String(body?.paymentEventReference || "").trim();
    if (!REF.test(paymentEventReference)) {
      return json({ state: "FAILED", reason: "PAYMENT_REFERENCE_INVALID", gate: publicGate({ AUTH_STATE: "OK" }) }, 400);
    }

    let context: any;
    try {
      context = await invokeRpc(userClient, "forge_advisor_compensation_handoff_context_011d", {
        p_payment_event_reference: paymentEventReference,
      });
    } catch (error) {
      const response = {
        state: "FAILED",
        reason: (error as any)?.code || "PAYMENT_CONTEXT_READ_FAILED",
        gate: publicGate({ AUTH_STATE: "OK", PAYMENT_AUTHORITY_STATE: "INVALID" }),
      };
      safeLog(response);
      return json(response, 500);
    }

    if (!context || context.state === "PAYMENT_NOT_FOUND") {
      const response = { state: "BLOCKED", reason: "PAYMENT_NOT_FOUND", gate: publicGate({ AUTH_STATE: "OK", PAYMENT_AUTHORITY_STATE: "NOT_FOUND", HANDOFF_STATE: "BLOCKED" }) };
      safeLog(response);
      return json(response, 404);
    }
    if (context.advisorId !== userResult.data.user.id) {
      const response = { state: "FAILED", reason: "OWNER_MISMATCH", gate: publicGate({ AUTH_STATE: "OK", PAYMENT_AUTHORITY_STATE: "INVALID", HANDOFF_STATE: "FAILED" }) };
      safeLog(response);
      return json(response, 403);
    }
    if (context.payment?.confirmationState !== "CONFIRMED") {
      const response = { state: "BLOCKED", reason: "PAYMENT_NOT_CONFIRMED", gate: publicGate({ AUTH_STATE: "OK", PAYMENT_AUTHORITY_STATE: "INVALID", HANDOFF_STATE: "BLOCKED" }) };
      safeLog(response);
      return json(response, 409);
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const persistence = {
      commitCompensation: (advisorId: string, paymentEvent: unknown, compensationEvent: unknown) => invokeRpc(
        adminClient,
        "forge_advisor_compensation_commit_event_011d",
        { p_advisor_id: advisorId, p_payment_event: paymentEvent, p_compensation_event: compensationEvent },
      ),
      loadMaterializationInputs: (advisorId: string, periods: string[]) => invokeRpc(
        adminClient,
        "forge_advisor_compensation_materialization_inputs_011d",
        { p_advisor_id: advisorId, p_period_keys: periods },
      ),
      appendReadModel: (advisorId: string, materialization: unknown) => invokeRpc(
        adminClient,
        "forge_advisor_compensation_append_read_model_011d",
        { p_advisor_id: advisorId, p_materialization: materialization },
      ),
    };

    const orchestrator = createAdvisorCompensationProductiveHandoff011d({
      persistence,
      resolveCareerClock: resolveOfficialAdvisorCareerClock,
    });

    let execution: any;
    try {
      execution = await orchestrator.execute({ advisorId: userResult.data.user.id, context });
    } catch (error) {
      execution = {
        state: "FAILED",
        reason: (error as any)?.code || "PRODUCTIVE_HANDOFF_FAILED",
        gate: publicGate({ AUTH_STATE: "OK", PAYMENT_AUTHORITY_STATE: "CONFIRMED", HANDOFF_STATE: "FAILED" }),
      };
    }

    let incomeReadState = "NOT_RUN";
    let incomeRead = null;
    if (execution?.periodKey && ["COMPLETED", "REPLAYED"].includes(execution.state)) {
      try {
        incomeRead = await invokeRpc(userClient, "forge_advisor_compensation_read_product", {
          p_period_key: execution.periodKey,
          p_period_keys: execution.periodKeys,
        });
        incomeReadState = incomeRead?.sourceHealth?.canonicalSnapshot === "NOT_MATERIALIZED"
          ? "NOT_MATERIALIZED"
          : incomeRead?.sourceState === "BLOCKED" ? "BLOCKED" : "READY";
      } catch {
        incomeReadState = "BLOCKED";
      }
    }

    const response = {
      ...execution,
      incomeRead: incomeRead ? { sourceState: incomeRead.sourceState, sourceHealth: incomeRead.sourceHealth, metadata: incomeRead.metadata } : null,
      gate: {
        ...(execution?.gate || publicGate()),
        AUTH_STATE: "OK",
        PAYMENT_AUTHORITY_STATE: "CONFIRMED",
        INCOME_READ_STATE: incomeReadState,
        DEMO_FALLBACK_USED: false,
        SYNTHETIC_WRITER_USED: false,
        UNKNOWN_COERCION_USED: false,
      },
    };
    safeLog(response);
    return json(response, response.state === "FAILED" ? 500 : response.state === "BLOCKED" ? 409 : 200);
  },
};
