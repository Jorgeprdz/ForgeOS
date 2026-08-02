import { createClient } from "npm:@supabase/supabase-js@2";

const FUNCTION_VERSION = "FORGE-DEMO-LOGIN-001";
const PROJECT_REF = "rmlxigxysujsuwzgoimv";
const ALLOWED_NAV = new Set([
  "inicio",
  "pipeline",
  "quotes",
  "cartera",
  "actividad",
]);
const ALLOWED_ORIGINS = new Set([
  "https://jorgeprdz.github.io",
  "http://127.0.0.1:4173",
  "http://localhost:4173",
]);
const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 6;
const attempts = new Map<string, { count: number; resetAt: number }>();

function cors(origin: string | null) {
  const allowed = origin && ALLOWED_ORIGINS.has(origin) ? origin : "";
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Cache-Control": "no-store, max-age=0",
    "Content-Type": "application/json; charset=utf-8",
    "Referrer-Policy": "no-referrer",
    "Vary": "Origin",
  };
}

function response(origin: string | null, status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: cors(origin),
  });
}

function clientAddress(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || request.headers.get("cf-connecting-ip")
    || "unknown";
}

function rateLimited(key: string) {
  const now = Date.now();
  const current = attempts.get(key);
  if (!current || current.resetAt <= now) {
    attempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  current.count += 1;
  return current.count > MAX_REQUESTS_PER_WINDOW;
}

function resolveSecretKey() {
  const legacy = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")?.trim();
  if (legacy) return legacy;
  const dictionary = Deno.env.get("SUPABASE_SECRET_KEYS")?.trim();
  if (!dictionary) return "";
  try {
    const parsed = JSON.parse(dictionary);
    return typeof parsed?.default === "string" ? parsed.default : "";
  } catch {
    return "";
  }
}

function canonicalRedirect(value: unknown, navValue: unknown) {
  if (typeof value !== "string") throw new Error("REDIRECT_REQUIRED");
  const redirect = new URL(value);
  if (!ALLOWED_ORIGINS.has(redirect.origin)) throw new Error("REDIRECT_ORIGIN_DENIED");
  if (redirect.pathname !== "/ForgeOS/static-preview/forge-alive/") {
    throw new Error("REDIRECT_PATH_DENIED");
  }
  const nav = typeof navValue === "string" && ALLOWED_NAV.has(navValue)
    ? navValue
    : "inicio";
  redirect.search = "";
  redirect.searchParams.set("nav", nav);
  redirect.searchParams.set("demoEntry", "login");
  redirect.hash = "";
  return redirect.href;
}

Deno.serve(async (request) => {
  const origin = request.headers.get("origin");
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: cors(origin) });
  }
  if (request.method !== "POST") {
    return response(origin, 405, { ok: false, code: "METHOD_NOT_ALLOWED" });
  }
  if (!origin || !ALLOWED_ORIGINS.has(origin)) {
    return response(origin, 403, { ok: false, code: "ORIGIN_DENIED" });
  }
  if (rateLimited(`${clientAddress(request)}:${origin}`)) {
    return response(origin, 429, { ok: false, code: "RATE_LIMITED" });
  }

  const suppliedApiKey = request.headers.get("apikey")?.trim() || "";
  const expectedApiKey = Deno.env.get("SUPABASE_ANON_KEY")?.trim() || "";
  if (!suppliedApiKey || !expectedApiKey || suppliedApiKey !== expectedApiKey) {
    return response(origin, 401, { ok: false, code: "PUBLIC_KEY_REQUIRED" });
  }

  let payload: Record<string, unknown>;
  try {
    payload = await request.json();
  } catch {
    return response(origin, 400, { ok: false, code: "JSON_REQUIRED" });
  }

  let redirectTo: string;
  try {
    redirectTo = canonicalRedirect(payload.redirectTo, payload.requestedNav);
  } catch (error) {
    return response(origin, 400, {
      ok: false,
      code: error instanceof Error ? error.message : "REDIRECT_INVALID",
    });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")?.trim() || "";
  const serviceRoleKey = resolveSecretKey();
  const demoEmail = Deno.env.get("FORGE_DEMO_ADVISOR_A_EMAIL")?.trim() || "";
  if (
    !supabaseUrl.includes(`${PROJECT_REF}.supabase.co`)
    || !serviceRoleKey
    || !demoEmail
  ) {
    return response(origin, 503, { ok: false, code: "DEMO_LOGIN_NOT_CONFIGURED" });
  }

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });

  const { data, error } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email: demoEmail,
    options: { redirectTo },
  });
  if (error || !data?.user?.id) {
    console.error("FORGE_DEMO_LOGIN_LINK_FAILED", error?.code || "UNKNOWN");
    return response(origin, 503, { ok: false, code: "DEMO_LOGIN_UNAVAILABLE" });
  }

  const actionLink = data.properties?.action_link
    || (data.properties as Record<string, unknown> | undefined)?.actionLink;
  if (typeof actionLink !== "string") {
    return response(origin, 503, { ok: false, code: "DEMO_ACTION_LINK_MISSING" });
  }

  const actionUrl = new URL(actionLink);
  if (
    actionUrl.protocol !== "https:"
    || actionUrl.hostname !== `${PROJECT_REF}.supabase.co`
    || !actionUrl.pathname.startsWith("/auth/v1/")
  ) {
    return response(origin, 503, { ok: false, code: "DEMO_ACTION_LINK_INVALID" });
  }

  const { error: registryError } = await admin
    .from("forge_demo_advisors")
    .upsert({
      advisor_id: data.user.id,
      demo_key: "PUBLIC_A",
      data_class: "SYNTHETIC",
      is_public: true,
      read_only: true,
      sealed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }, { onConflict: "advisor_id" });
  if (registryError) {
    console.error("FORGE_DEMO_LOGIN_REGISTRY_FAILED", registryError.code || "UNKNOWN");
    return response(origin, 503, { ok: false, code: "DEMO_REGISTRY_UNAVAILABLE" });
  }

  return response(origin, 200, {
    ok: true,
    actionLink,
    expiresAsConfiguredByAuth: true,
    runtime: "PRODUCTIVE",
    dataClass: "SYNTHETIC",
    functionVersion: FUNCTION_VERSION,
  });
});
