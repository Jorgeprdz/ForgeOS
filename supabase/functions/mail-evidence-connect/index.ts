import { createClient } from "npm:@supabase/supabase-js@2";
import {
  createMailEvidenceEngine,
  createSupabaseMailSuggestionRecorder,
} from "../../../platform/mail-evidence/mail-evidence-engine.mjs";
import { createGmailMailEvidenceAdapter } from "../../../platform/mail-evidence/providers/gmail-adapter.mjs";
import { createMicrosoftGraphMailEvidenceAdapter } from "../../../platform/mail-evidence/providers/microsoft-graph-adapter.mjs";

const FUNCTION_VERSION = "MAIL-EVIDENCE-CONNECT-002";
const PROVIDERS = new Set(["GMAIL", "MICROSOFT_GRAPH"]);
const GOOGLE_AUTHORIZE = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN = "https://oauth2.googleapis.com/token";
const MICROSOFT_AUTHORIZE = "https://login.microsoftonline.com/common/oauth2/v2.0/authorize";
const MICROSOFT_TOKEN = "https://login.microsoftonline.com/common/oauth2/v2.0/token";
const OAUTH_CALLBACK_PATH_SUFFIX = "/mail-evidence-connect/oauth/callback";

function json(status: number, body: Record<string, unknown>, request?: Request) {
  const configuredOrigin = Deno.env.get("FORGE_APP_ORIGIN")?.trim() || "";
  const requestOrigin = request?.headers.get("origin")?.trim() || "";
  const allowOrigin = configuredOrigin && requestOrigin === configuredOrigin ? configuredOrigin : configuredOrigin || "null";
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store, max-age=0",
      "Referrer-Policy": "no-referrer",
      "Access-Control-Allow-Origin": allowOrigin,
      "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Vary": "Origin",
    },
  });
}

function resolveServiceKey() {
  const direct = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")?.trim();
  if (direct) return direct;
  const dictionary = Deno.env.get("SUPABASE_SECRET_KEYS")?.trim();
  if (!dictionary) return "";
  try {
    const parsed = JSON.parse(dictionary);
    return typeof parsed?.default === "string" ? parsed.default : "";
  } catch {
    return "";
  }
}

function resolvePublicKey() {
  return Deno.env.get("SUPABASE_ANON_KEY")?.trim()
    || Deno.env.get("SUPABASE_PUBLISHABLE_KEY")?.trim()
    || Deno.env.get("SB_PUBLISHABLE_KEY")?.trim()
    || "";
}

function providerConfig(provider: string) {
  if (provider === "GMAIL") {
    return {
      clientId: Deno.env.get("FORGE_GOOGLE_OAUTH_CLIENT_ID")?.trim() || "",
      clientSecret: Deno.env.get("FORGE_GOOGLE_OAUTH_CLIENT_SECRET")?.trim() || "",
      authorizeUrl: GOOGLE_AUTHORIZE,
      tokenUrl: GOOGLE_TOKEN,
      scopes: ["https://www.googleapis.com/auth/gmail.readonly"],
    };
  }
  if (provider === "MICROSOFT_GRAPH") {
    return {
      clientId: Deno.env.get("FORGE_MICROSOFT_OAUTH_CLIENT_ID")?.trim() || "",
      clientSecret: Deno.env.get("FORGE_MICROSOFT_OAUTH_CLIENT_SECRET")?.trim() || "",
      authorizeUrl: MICROSOFT_AUTHORIZE,
      tokenUrl: MICROSOFT_TOKEN,
      scopes: ["offline_access", "https://graph.microsoft.com/Mail.Read"],
    };
  }
  throw new Error("MAIL_PROVIDER_UNSUPPORTED");
}

function normalizeProvider(value: unknown) {
  const selected = String(value || "").trim().toUpperCase();
  if (!PROVIDERS.has(selected)) throw new Error("MAIL_PROVIDER_UNSUPPORTED");
  return selected;
}

function bytesToBase64(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function base64ToBytes(value: string) {
  const binary = atob(value);
  return Uint8Array.from(binary, char => char.charCodeAt(0));
}

function base64Url(bytes: Uint8Array) {
  return bytesToBase64(bytes).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function randomBase64Url(size = 32) {
  const bytes = new Uint8Array(size);
  crypto.getRandomValues(bytes);
  return base64Url(bytes);
}

async function digestBytes(value: string) {
  return new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)));
}

async function digestHex(value: string) {
  return [...await digestBytes(value)].map(byte => byte.toString(16).padStart(2, "0")).join("");
}

async function pkceChallenge(verifier: string) {
  return base64Url(await digestBytes(verifier));
}

async function encryptionKey() {
  const secret = Deno.env.get("FORGE_MAIL_TOKEN_ENCRYPTION_SECRET")?.trim() || "";
  if (secret.length < 32) throw new Error("MAIL_TOKEN_ENCRYPTION_NOT_CONFIGURED");
  const keyBytes = await digestBytes(secret);
  return crypto.subtle.importKey("raw", keyBytes, "AES-GCM", false, ["encrypt", "decrypt"]);
}

async function encryptText(value: string) {
  const iv = new Uint8Array(12);
  crypto.getRandomValues(iv);
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    await encryptionKey(),
    new TextEncoder().encode(value),
  );
  return {
    ciphertext: bytesToBase64(new Uint8Array(encrypted)),
    iv: bytesToBase64(iv),
  };
}

async function decryptText(ciphertext: string, iv: string) {
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: base64ToBytes(iv) },
    await encryptionKey(),
    base64ToBytes(ciphertext),
  );
  return new TextDecoder().decode(decrypted);
}

function supabaseClients(jwt: string | null = null) {
  const url = Deno.env.get("SUPABASE_URL")?.trim() || "";
  const serviceKey = resolveServiceKey();
  if (!url || !serviceKey) throw new Error("SUPABASE_BACKEND_NOT_CONFIGURED");
  const admin = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
  });
  const publicKey = resolvePublicKey() || serviceKey;
  const user = jwt
    ? createClient(url, publicKey, {
      global: { headers: { Authorization: `Bearer ${jwt}` } },
      auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
    })
    : null;
  return { admin, user };
}

function bearer(request: Request) {
  const value = request.headers.get("authorization")?.trim() || "";
  const match = value.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() || "";
}

async function authenticated(request: Request) {
  const jwt = bearer(request);
  if (!jwt) throw new Error("MAIL_AUTH_REQUIRED");
  const { admin, user } = supabaseClients(jwt);
  const result = await admin.auth.getUser(jwt);
  if (result.error || !result.data.user?.id) throw new Error("MAIL_AUTH_REQUIRED");
  return { jwt, advisorId: result.data.user.id, admin, user: user! };
}

function callbackUrl() {
  const value = Deno.env.get("FORGE_MAIL_OAUTH_CALLBACK_URL")?.trim() || "";
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error("MAIL_OAUTH_CALLBACK_NOT_CONFIGURED");
  }
  if (
    parsed.protocol !== "https:" ||
    parsed.search ||
    parsed.hash ||
    !parsed.pathname.endsWith(OAUTH_CALLBACK_PATH_SUFFIX)
  ) {
    throw new Error("MAIL_OAUTH_CALLBACK_NOT_CONFIGURED");
  }
  return parsed.toString();
}

function returnUrl() {
  const value = Deno.env.get("FORGE_MAIL_OAUTH_RETURN_URL")?.trim() || "";
  if (!/^https:\/\//.test(value)) throw new Error("MAIL_OAUTH_RETURN_NOT_CONFIGURED");
  return value;
}

function redirect(status: "connected" | "error", provider = "", code = "") {
  const url = new URL(returnUrl());
  url.searchParams.set("mail", status);
  if (provider) url.searchParams.set("provider", provider);
  if (code) url.searchParams.set("code", code);
  return Response.redirect(url, 302);
}

async function startConnection(request: Request, providerInput: unknown) {
  const { advisorId, admin } = await authenticated(request);
  const provider = normalizeProvider(providerInput);
  const config = providerConfig(provider);
  if (!config.clientId || !config.clientSecret) throw new Error("MAIL_PROVIDER_OAUTH_NOT_CONFIGURED");

  const state = randomBase64Url(32);
  const stateDigest = await digestHex(state);
  const verifier = randomBase64Url(48);
  const challenge = await pkceChallenge(verifier);
  const encryptedVerifier = await encryptText(verifier);
  const redirectUri = callbackUrl();
  const expiresAt = new Date(Date.now() + 10 * 60_000).toISOString();

  const stored = await admin.from("activity_mail_oauth_states").insert({
    state_digest: stateDigest,
    advisor_id: advisorId,
    provider,
    code_verifier_ciphertext: encryptedVerifier.ciphertext,
    code_verifier_iv: encryptedVerifier.iv,
    redirect_uri: redirectUri,
    expires_at: expiresAt,
  });
  if (stored.error) throw stored.error;

  const authorize = new URL(config.authorizeUrl);
  authorize.searchParams.set("client_id", config.clientId);
  authorize.searchParams.set("redirect_uri", redirectUri);
  authorize.searchParams.set("response_type", "code");
  authorize.searchParams.set("state", state);
  authorize.searchParams.set("scope", config.scopes.join(" "));
  authorize.searchParams.set("code_challenge", challenge);
  authorize.searchParams.set("code_challenge_method", "S256");

  if (provider === "GMAIL") {
    authorize.searchParams.set("access_type", "offline");
    authorize.searchParams.set("include_granted_scopes", "true");
    authorize.searchParams.set("prompt", "consent");
  } else {
    authorize.searchParams.set("response_mode", "query");
  }

  return json(200, {
    ok: true,
    provider,
    authorizeUrl: authorize.toString(),
    expiresAt,
    functionVersion: FUNCTION_VERSION,
  }, request);
}

async function exchangeAuthorizationCode(config: ReturnType<typeof providerConfig>, input: {
  code: string;
  redirectUri: string;
  verifier: string;
}) {
  const body = new URLSearchParams({
    client_id: config.clientId,
    client_secret: config.clientSecret,
    code: input.code,
    redirect_uri: input.redirectUri,
    grant_type: "authorization_code",
    code_verifier: input.verifier,
  });
  const response = await fetch(config.tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!response.ok) throw new Error(`MAIL_OAUTH_CODE_EXCHANGE_FAILED_${response.status}`);
  return await response.json();
}

async function oauthCallback(request: Request) {
  const url = new URL(request.url);
  if (url.searchParams.get("error")) return redirect("error", "", "OAUTH_DENIED");
  const code = url.searchParams.get("code")?.trim() || "";
  const state = url.searchParams.get("state")?.trim() || "";
  if (!code || !state) return redirect("error", "", "OAUTH_CALLBACK_INVALID");

  try {
    const { admin } = supabaseClients();
    const stateDigest = await digestHex(state);
    const stateResult = await admin.from("activity_mail_oauth_states")
      .select("state_digest,advisor_id,provider,code_verifier_ciphertext,code_verifier_iv,redirect_uri,expires_at,consumed_at")
      .eq("state_digest", stateDigest)
      .maybeSingle();
    if (stateResult.error || !stateResult.data) throw new Error("OAUTH_STATE_NOT_FOUND");
    const stored = stateResult.data;
    if (stored.consumed_at || Date.parse(stored.expires_at) < Date.now()) throw new Error("OAUTH_STATE_EXPIRED");

    const provider = normalizeProvider(stored.provider);
    const config = providerConfig(provider);
    if (!config.clientId || !config.clientSecret) throw new Error("MAIL_PROVIDER_OAUTH_NOT_CONFIGURED");
    const verifier = await decryptText(stored.code_verifier_ciphertext, stored.code_verifier_iv);
    const tokens = await exchangeAuthorizationCode(config, { code, redirectUri: stored.redirect_uri, verifier });
    const refreshToken = String(tokens.refresh_token || "").trim();
    if (!refreshToken) throw new Error("MAIL_OAUTH_REFRESH_TOKEN_MISSING");
    const encrypted = await encryptText(refreshToken);
    const scopes = String(tokens.scope || config.scopes.join(" ")).split(/\s+/).filter(Boolean);
    const now = new Date().toISOString();

    const connection = await admin.from("activity_mail_provider_connections").upsert({
      advisor_id: stored.advisor_id,
      provider,
      refresh_token_ciphertext: encrypted.ciphertext,
      refresh_token_iv: encrypted.iv,
      scopes,
      connection_state: "CONNECTED",
      connected_at: now,
      updated_at: now,
    }, { onConflict: "advisor_id,provider" });
    if (connection.error) throw connection.error;

    const consumed = await admin.from("activity_mail_oauth_states")
      .update({ consumed_at: now })
      .eq("state_digest", stateDigest)
      .is("consumed_at", null);
    if (consumed.error) throw consumed.error;

    return redirect("connected", provider);
  } catch (error) {
    console.error("MAIL_OAUTH_CALLBACK_FAILED", error instanceof Error ? error.message : "unknown");
    return redirect("error", "", "OAUTH_CALLBACK_FAILED");
  }
}

async function refreshAccessToken(provider: string, refreshToken: string) {
  const config = providerConfig(provider);
  const body = new URLSearchParams({
    client_id: config.clientId,
    client_secret: config.clientSecret,
    refresh_token: refreshToken,
    grant_type: "refresh_token",
  });
  if (provider === "MICROSOFT_GRAPH") body.set("scope", config.scopes.join(" "));
  const response = await fetch(config.tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!response.ok) throw new Error(`MAIL_OAUTH_REFRESH_FAILED_${response.status}`);
  return await response.json();
}

async function scanProvider(request: Request, providerInput: unknown) {
  const { advisorId, admin, user } = await authenticated(request);
  const provider = normalizeProvider(providerInput);
  const connection = await admin.from("activity_mail_provider_connections")
    .select("provider,refresh_token_ciphertext,refresh_token_iv,connection_state")
    .eq("advisor_id", advisorId)
    .eq("provider", provider)
    .eq("connection_state", "CONNECTED")
    .maybeSingle();
  if (connection.error || !connection.data) throw new Error("MAIL_PROVIDER_NOT_CONNECTED");

  const refreshToken = await decryptText(connection.data.refresh_token_ciphertext, connection.data.refresh_token_iv);
  const tokens = await refreshAccessToken(provider, refreshToken);
  const accessToken = String(tokens.access_token || "").trim();
  if (!accessToken) throw new Error("MAIL_ACCESS_TOKEN_MISSING");

  if (tokens.refresh_token) {
    const rotated = await encryptText(String(tokens.refresh_token));
    const updated = await admin.from("activity_mail_provider_connections").update({
      refresh_token_ciphertext: rotated.ciphertext,
      refresh_token_iv: rotated.iv,
      updated_at: new Date().toISOString(),
    }).eq("advisor_id", advisorId).eq("provider", provider);
    if (updated.error) throw updated.error;
  }

  const adapter = provider === "GMAIL"
    ? createGmailMailEvidenceAdapter({ accessToken })
    : createMicrosoftGraphMailEvidenceAdapter({ accessToken });
  const trustedSenderDomains = (Deno.env.get("FORGE_PAYMENT_SENDER_DOMAINS") || "")
    .split(",").map(value => value.trim().toLowerCase()).filter(Boolean);
  const engine = createMailEvidenceEngine({ trustedSenderDomains });
  const result = await engine.scan({
    adapter,
    recordSuggestion: createSupabaseMailSuggestionRecorder({ client: user }),
    maxResults: 50,
  });

  return json(200, {
    ok: true,
    provider,
    scanned: result.scanned,
    suggestionsRecorded: result.suggestions.length,
    humanConfirmationRequired: true,
    functionVersion: FUNCTION_VERSION,
  }, request);
}

async function status(request: Request) {
  const { advisorId, admin } = await authenticated(request);
  const result = await admin.from("activity_mail_provider_connections")
    .select("provider,connection_state,scopes,connected_at,updated_at")
    .eq("advisor_id", advisorId)
    .eq("connection_state", "CONNECTED");
  if (result.error) throw result.error;
  return json(200, { ok: true, connections: result.data || [], functionVersion: FUNCTION_VERSION }, request);
}

async function disconnect(request: Request, providerInput: unknown) {
  const { advisorId, admin } = await authenticated(request);
  const provider = normalizeProvider(providerInput);
  const result = await admin.from("activity_mail_provider_connections")
    .delete().eq("advisor_id", advisorId).eq("provider", provider);
  if (result.error) throw result.error;
  return json(200, { ok: true, provider, disconnected: true, functionVersion: FUNCTION_VERSION }, request);
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return json(204, {}, request);
  const url = new URL(request.url);
  if (request.method === "GET" && url.pathname.endsWith(OAUTH_CALLBACK_PATH_SUFFIX)) {
    return oauthCallback(request);
  }
  if (request.method !== "POST") return json(405, { ok: false, code: "METHOD_NOT_ALLOWED" }, request);

  try {
    const payload = await request.json();
    const action = String(payload?.action || "").trim().toUpperCase();
    if (action === "START") return await startConnection(request, payload.provider);
    if (action === "SCAN") return await scanProvider(request, payload.provider);
    if (action === "STATUS") return await status(request);
    if (action === "DISCONNECT") return await disconnect(request, payload.provider);
    return json(400, { ok: false, code: "ACTION_INVALID" }, request);
  } catch (error) {
    const code = error instanceof Error ? error.message : "MAIL_EVIDENCE_CONNECT_FAILED";
    const safeCode = /^[A-Z0-9_:-]{3,120}$/.test(code) ? code : "MAIL_EVIDENCE_CONNECT_FAILED";
    const statusCode = safeCode === "MAIL_AUTH_REQUIRED" ? 401 : 400;
    return json(statusCode, { ok: false, code: safeCode, functionVersion: FUNCTION_VERSION }, request);
  }
});
