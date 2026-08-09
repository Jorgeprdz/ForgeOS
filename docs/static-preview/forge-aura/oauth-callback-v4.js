import { authEntryUrl, normalizeRoute, readExplicitRoute } from "./aura-router-v4.js";

const statusNode = document.querySelector("[data-oauth-status]");
const callbackRoot = document.querySelector("[data-oauth-callback]");
const returnLink = document.querySelector("[data-oauth-return]");

function setCallbackState(state, message) {
  callbackRoot.dataset.auraAuthState = state;
  statusNode.textContent = message;
}

function scrubCallbackUrl(url) {
  const clean = new URL(url.href);
  clean.hash = "";
  clean.searchParams.delete("error");
  clean.searchParams.delete("error_code");
  clean.searchParams.delete("error_description");
  clean.searchParams.delete("error_uri");
  clean.searchParams.delete("code");
  const visible = `${clean.pathname}${clean.search}${clean.hash}`;
  window.history.replaceState({}, document.title, visible);
}

function safeFailureCode(error) {
  return String(error?.code || error?.name || "OAUTH_CALLBACK_FAILED")
    .toUpperCase()
    .replace(/[^A-Z0-9_]/g, "_")
    .slice(0, 80) || "OAUTH_CALLBACK_FAILED";
}

function routeLabel(route) {
  return ({
    inicio: "Inicio",
    pipeline: "Pipeline",
    actividad: "Actividad",
    cartera: "Cartera",
    comisiones: "Ingresos",
    cotizaciones: "Cotizaciones",
  })[route] || "Forge";
}

function fail(error) {
  setCallbackState("AUTH_ERROR", "No pudimos completar el acceso con Google.");
  returnLink.hidden = false;
  console.error("AURA_OAUTH_CALLBACK_FAILED", safeFailureCode(error));
}

(async () => {
  try {
    const env = window.__ENV__ || {};
    if (!env.SUPABASE_URL || !(env.SUPABASE_KEY || env.SUPABASE_ANON_KEY)) {
      throw Object.assign(new Error("OAUTH_CALLBACK_CONFIG_MISSING"), { code: "CONFIG_BLOCKED" });
    }
    if (!window.supabase?.createClient) {
      throw Object.assign(new Error("OAUTH_CALLBACK_SDK_MISSING"), { code: "AUTH_CLIENT_LOAD_FAILED" });
    }

    const url = new URL(window.location.href);
    const hash = new URLSearchParams(url.hash.replace(/^#/, ""));
    const providerError = url.searchParams.get("error") || url.searchParams.get("error_description") || hash.get("error") || hash.get("error_description");
    const returnRoute = readExplicitRoute(`${url.origin}${url.pathname}?route=${encodeURIComponent(url.searchParams.get("return_route") || "")}`) || "inicio";

    const accessToken = hash.get("access_token");
    const refreshToken = hash.get("refresh_token");
    scrubCallbackUrl(url);

    if (providerError) {
      throw Object.assign(new Error("OAUTH_PROVIDER_ERROR"), { code: "OAUTH_PROVIDER_ERROR" });
    }

    const client = window.supabase.createClient(
      env.SUPABASE_URL,
      env.SUPABASE_KEY || env.SUPABASE_ANON_KEY,
      { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false, flowType: "implicit" } },
    );

    if (accessToken && refreshToken) {
      const { error } = await client.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
      if (error) throw Object.assign(new Error("OAUTH_SESSION_ESTABLISH_FAILED"), { code: error.code || "OAUTH_SESSION_ESTABLISH_FAILED" });
    }

    const { data, error } = await client.auth.getSession();
    if (error) throw Object.assign(new Error("OAUTH_SESSION_READ_FAILED"), { code: error.code || "OAUTH_SESSION_READ_FAILED" });
    if (!data?.session?.user?.id) {
      throw Object.assign(new Error("OAUTH_CALLBACK_SESSION_MISSING"), { code: "OAUTH_CALLBACK_SESSION_MISSING" });
    }

    const target = normalizeRoute(returnRoute);
    const label = routeLabel(target);
    setCallbackState("AUTHENTICATED", target === "inicio"
      ? "Acceso confirmado. Abriendo tu Inicio…"
      : `Acceso confirmado. Abriendo ${label}…`);

    window.location.replace(authEntryUrl(target, window.location.href).href);
  } catch (error) {
    fail(error);
  }
})();
