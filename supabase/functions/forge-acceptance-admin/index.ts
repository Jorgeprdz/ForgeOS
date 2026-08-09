import { createClient } from "npm:@supabase/supabase-js@2";

const FUNCTION_VERSION = "FORGE-ACCEPTANCE-ADMIN-005C-001";
const PROJECT_REF = "rmlxigxysujsuwzgoimv";
const ACCEPTANCE_PURPOSE = "AUTOMATED_ACCEPTANCE_ONLY";
const WINDOW_MINUTES = 20;
const TARGETS = [
  { key: "ACCEPTANCE_A", email: "forge.acceptance.a@forge.invalid", passwordEnv: "FORGE_ACCEPTANCE_A_PASSWORD" },
  { key: "ACCEPTANCE_B", email: "forge.acceptance.b@forge.invalid", passwordEnv: "FORGE_ACCEPTANCE_B_PASSWORD" },
] as const;
const ALLOWED_ACTIONS = new Set(["PROVISION", "OPEN", "SEAL", "STATUS"]);

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

async function digest(value: string) {
  const bytes = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(hash)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function safeEqual(left: string, right: string) {
  if (!left || !right) return false;
  return await digest(left) === await digest(right);
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

function randomSealedPassword() {
  return `${crypto.randomUUID()}-${crypto.randomUUID()}-Aa1!`;
}

async function findUserByEmail(admin: ReturnType<typeof createClient>, email: string) {
  for (let page = 1; page <= 20; page += 1) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 100 });
    if (error) throw error;
    const user = data.users.find((candidate) => candidate.email?.toLowerCase() === email.toLowerCase());
    if (user) return user;
    if (data.users.length < 100) break;
  }
  return null;
}

async function ensureAcceptanceUser(
  admin: ReturnType<typeof createClient>,
  target: typeof TARGETS[number],
  password: string,
) {
  const existing = await findUserByEmail(admin, target.email);
  if (existing?.id) {
    const { data, error } = await admin.auth.admin.updateUserById(existing.id, {
      password,
      user_metadata: {
        forgeDataClass: "SYNTHETIC",
        forgePurpose: ACCEPTANCE_PURPOSE,
        forgeAcceptanceKey: target.key,
      },
    });
    if (error) throw error;
    return data.user;
  }
  const { data, error } = await admin.auth.admin.createUser({
    email: target.email,
    password,
    email_confirm: true,
    user_metadata: {
      forgeDataClass: "SYNTHETIC",
      forgePurpose: ACCEPTANCE_PURPOSE,
      forgeAcceptanceKey: target.key,
    },
  });
  if (error) throw error;
  if (!data.user?.id) throw new Error("ACCEPTANCE_USER_CREATE_FAILED");
  return data.user;
}

async function status(admin: ReturnType<typeof createClient>) {
  const { data, error } = await admin
    .from("forge_demo_advisors")
    .select("demo_key,data_class,is_public,read_only,is_acceptance,acceptance_purpose,expires_at,sealed_at")
    .in("demo_key", ["PUBLIC_A", "CONTROL_B", "ACCEPTANCE_A", "ACCEPTANCE_B"])
    .order("demo_key");
  if (error) throw error;
  return (data || []).map((row) => ({
    demoKey: row.demo_key,
    dataClass: row.data_class,
    isPublic: row.is_public,
    readOnly: row.read_only,
    isAcceptance: row.is_acceptance,
    acceptancePurpose: row.acceptance_purpose,
    expiresAt: row.expires_at,
    sealedAt: row.sealed_at,
  }));
}

Deno.serve(async (request) => {
  if (request.method !== "POST") return json(405, { ok: false, code: "METHOD_NOT_ALLOWED" });

  const expectedToken = Deno.env.get("FORGE_ACCEPTANCE_ADMIN_TOKEN")?.trim() || "";
  const suppliedToken = request.headers.get("x-forge-acceptance-admin-token")?.trim() || "";
  if (!await safeEqual(suppliedToken, expectedToken)) {
    return json(401, { ok: false, code: "ACCEPTANCE_ADMIN_TOKEN_REQUIRED" });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")?.trim() || "";
  const serviceRoleKey = resolveSecretKey();
  if (!supabaseUrl.includes(`${PROJECT_REF}.supabase.co`) || !serviceRoleKey) {
    return json(503, { ok: false, code: "ACCEPTANCE_ADMIN_NOT_CONFIGURED" });
  }

  let payload: Record<string, unknown>;
  try {
    payload = await request.json();
  } catch {
    return json(400, { ok: false, code: "JSON_REQUIRED" });
  }
  const action = String(payload.action || "").toUpperCase();
  if (!ALLOWED_ACTIONS.has(action) || Object.keys(payload).some((key) => key !== "action")) {
    return json(400, { ok: false, code: "ACTION_INVALID" });
  }

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
  });

  try {
    if (action === "STATUS") {
      return json(200, { ok: true, action, accounts: await status(admin), functionVersion: FUNCTION_VERSION });
    }

    if (action === "SEAL") {
      const existing = await Promise.all(TARGETS.map((target) => findUserByEmail(admin, target.email)));
      const ids = existing.filter((user) => user?.id).map((user) => user!.id);
      if (ids.length) {
        const now = new Date().toISOString();
        const { error } = await admin
          .from("forge_demo_advisors")
          .update({ read_only: true, sealed_at: now, expires_at: now, updated_at: now })
          .in("advisor_id", ids)
          .eq("is_acceptance", true);
        if (error) throw error;
        for (const user of existing) {
          if (!user?.id) continue;
          const { error: rotateError } = await admin.auth.admin.updateUserById(user.id, {
            password: randomSealedPassword(),
          });
          if (rotateError) throw rotateError;
        }
      }
      return json(200, {
        ok: true,
        action,
        accountsSealed: ids.length,
        accounts: await status(admin),
        functionVersion: FUNCTION_VERSION,
      });
    }

    const passwords = TARGETS.map((target) => Deno.env.get(target.passwordEnv)?.trim() || "");
    if (passwords.some((password) => password.length < 20)) {
      return json(503, { ok: false, code: "ACCEPTANCE_PASSWORDS_NOT_CONFIGURED" });
    }

    const users = [];
    for (let index = 0; index < TARGETS.length; index += 1) {
      users.push(await ensureAcceptanceUser(admin, TARGETS[index], passwords[index]));
    }
    if (users.length !== 2 || users[0].id === users[1].id) {
      throw new Error("ACCEPTANCE_IDENTITIES_NOT_DISTINCT");
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + WINDOW_MINUTES * 60_000).toISOString();
    const rows = users.map((user, index) => ({
      advisor_id: user.id,
      demo_key: TARGETS[index].key,
      data_class: "SYNTHETIC",
      is_public: false,
      read_only: false,
      is_acceptance: true,
      acceptance_purpose: ACCEPTANCE_PURPOSE,
      expires_at: expiresAt,
      seeded_at: now.toISOString(),
      sealed_at: null,
      updated_at: now.toISOString(),
    }));
    const { error } = await admin.from("forge_demo_advisors").upsert(rows, { onConflict: "advisor_id" });
    if (error) throw error;

    return json(200, {
      ok: true,
      action,
      accountsOpened: 2,
      expiresAt,
      accounts: await status(admin),
      functionVersion: FUNCTION_VERSION,
    });
  } catch (error) {
    console.error("FORGE_ACCEPTANCE_ADMIN_FAILED", error instanceof Error ? error.message : "UNKNOWN");
    return json(503, { ok: false, code: "ACCEPTANCE_ADMIN_FAILED" });
  }
});
