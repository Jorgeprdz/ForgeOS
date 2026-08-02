import { createClient } from "npm:@supabase/supabase-js@2";

const FUNCTION_VERSION = "FORGE-DEMO-ADMIN-001";
const PROJECT_REF = "rmlxigxysujsuwzgoimv";

function json(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Cache-Control": "no-store, max-age=0",
      "Content-Type": "application/json; charset=utf-8",
      "Referrer-Policy": "no-referrer",
    },
  });
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

async function digest(value: string) {
  const bytes = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(hash)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function safeEqual(left: string, right: string) {
  if (!left || !right) return false;
  return await digest(left) === await digest(right);
}

async function findUserIdByEmail(
  admin: ReturnType<typeof createClient>,
  email: string,
) {
  for (let page = 1; page <= 20; page += 1) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 100 });
    if (error) throw error;
    const user = data.users.find(
      (candidate) => candidate.email?.toLowerCase() === email.toLowerCase(),
    );
    if (user?.id) return user.id;
    if (data.users.length < 100) break;
  }
  throw new Error("DEMO_ADVISOR_NOT_FOUND");
}

Deno.serve(async (request) => {
  if (request.method !== "POST") {
    return json(405, { ok: false, code: "METHOD_NOT_ALLOWED" });
  }

  const expectedToken = Deno.env.get("FORGE_DEMO_ADMIN_TOKEN")?.trim() || "";
  const suppliedToken = request.headers.get("x-forge-demo-admin-token")?.trim() || "";
  if (!await safeEqual(suppliedToken, expectedToken)) {
    return json(401, { ok: false, code: "ADMIN_TOKEN_REQUIRED" });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")?.trim() || "";
  const serviceRoleKey = resolveSecretKey();
  const emailA = Deno.env.get("FORGE_DEMO_ADVISOR_A_EMAIL")?.trim() || "";
  const emailB = Deno.env.get("FORGE_DEMO_ADVISOR_B_EMAIL")?.trim() || "";
  if (
    !supabaseUrl.includes(`${PROJECT_REF}.supabase.co`)
    || !serviceRoleKey
    || !emailA
    || !emailB
  ) {
    return json(503, { ok: false, code: "DEMO_ADMIN_NOT_CONFIGURED" });
  }

  let payload: Record<string, unknown>;
  try {
    payload = await request.json();
  } catch {
    return json(400, { ok: false, code: "JSON_REQUIRED" });
  }
  const action = String(payload.action || "").toUpperCase();
  if (!new Set(["PREPARE", "SEAL", "STATUS"]).has(action)) {
    return json(400, { ok: false, code: "ACTION_INVALID" });
  }

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });

  try {
    const [advisorA, advisorB] = await Promise.all([
      findUserIdByEmail(admin, emailA),
      findUserIdByEmail(admin, emailB),
    ]);

    if (advisorA === advisorB) {
      return json(409, { ok: false, code: "DEMO_IDENTITIES_NOT_DISTINCT" });
    }

    if (action === "PREPARE") {
      const { error } = await admin
        .from("forge_demo_advisors")
        .delete()
        .in("advisor_id", [advisorA, advisorB]);
      if (error) throw error;
      return json(200, {
        ok: true,
        action,
        accountsUnlocked: 2,
        functionVersion: FUNCTION_VERSION,
      });
    }

    if (action === "SEAL") {
      const now = new Date().toISOString();
      const { error } = await admin
        .from("forge_demo_advisors")
        .upsert([
          {
            advisor_id: advisorA,
            demo_key: "PUBLIC_A",
            data_class: "SYNTHETIC",
            is_public: true,
            read_only: true,
            seeded_at: now,
            sealed_at: now,
            updated_at: now,
          },
          {
            advisor_id: advisorB,
            demo_key: "CONTROL_B",
            data_class: "SYNTHETIC",
            is_public: false,
            read_only: true,
            seeded_at: now,
            sealed_at: now,
            updated_at: now,
          },
        ], { onConflict: "advisor_id" });
      if (error) throw error;
      return json(200, {
        ok: true,
        action,
        accountsSealed: 2,
        publicDemoAccounts: 1,
        functionVersion: FUNCTION_VERSION,
      });
    }

    const { data, error } = await admin
      .from("forge_demo_advisors")
      .select("demo_key,is_public,read_only,data_class")
      .in("advisor_id", [advisorA, advisorB])
      .order("demo_key");
    if (error) throw error;
    return json(200, {
      ok: true,
      action,
      accounts: data,
      functionVersion: FUNCTION_VERSION,
    });
  } catch (error) {
    console.error("FORGE_DEMO_ADMIN_FAILED", error instanceof Error ? error.message : "UNKNOWN");
    return json(503, { ok: false, code: "DEMO_ADMIN_FAILED" });
  }
});
