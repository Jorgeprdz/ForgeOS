import { oauthRedirectUrl } from "./aura-router.js?v=oauth-implicit-v1";

const PRODUCTIVE = Object.freeze({
  config: "FORGE_AURA_PUBLIC_CONFIG_V1",
  auth: "FORGE_PRODUCTIVE_PROSPECT_BOOTSTRAP_067G17B_V1",
});

export const AUTH_STATES = Object.freeze([
  "AUTH_LOADING",
  "AUTH_REQUIRED",
  "AUTH_ERROR",
  "SESSION_EXPIRED",
]);

let supabaseLibraryPromise;
let clientPromise;

function publicConfig(env = globalThis.__ENV__) {
  const source = env && typeof env === "object" ? env : {};
  const SUPABASE_URL = String(source.SUPABASE_URL || "").trim();
  const SUPABASE_KEY = String(source.SUPABASE_KEY || source.SUPABASE_ANON_KEY || "").trim();
  const DEMO_MODE = String(source.DEMO_MODE || "").toLowerCase() === "true";
  const configured = Boolean(SUPABASE_URL && SUPABASE_KEY);
  return Object.freeze({
    contractId: PRODUCTIVE.config,
    state: DEMO_MODE ? "DEMO_EXPLICIT" : configured ? "READY" : "BLOCKED",
    SUPABASE_URL,
    SUPABASE_KEY,
    DEMO_MODE,
    configured,
  });
}

async function loadSupabase() {
  if (typeof globalThis.supabase?.createClient === "function") return globalThis.supabase;
  if (supabaseLibraryPromise) return supabaseLibraryPromise;
  supabaseLibraryPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://unpkg.com/@supabase/supabase-js@2.108.2/dist/umd/supabase.js";
    script.dataset.auraSupabaseClient = "2.108.2";
    script.onload = () => globalThis.supabase?.createClient
      ? resolve(globalThis.supabase)
      : reject(new Error("AUTH_CLIENT_INVALID"));
    script.onerror = () => reject(Object.assign(new Error("AUTH_CLIENT_LOAD_FAILED"), { code: "NETWORK_ERROR" }));
    document.head.append(script);
  });
  return supabaseLibraryPromise;
}

async function getClient() {
  if (clientPromise) return clientPromise;
  clientPromise = (async () => {
    const config = publicConfig();
    if (config.state !== "READY") {
      throw Object.assign(
        new Error(config.DEMO_MODE ? "PRODUCTIVE_AUTH_DISABLED_IN_DEMO" : "PRODUCTIVE_AUTH_CONFIG_MISSING"),
        { code: "CONFIG_BLOCKED" },
      );
    }
    const library = await loadSupabase();
    return library.createClient(config.SUPABASE_URL, config.SUPABASE_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: "implicit",
      },
    });
  })();
  return clientPromise;
}

function cleanSensitive(form) {
  form?.querySelectorAll('input[type="password"]').forEach(input => { input.value = ""; });
}

function readCallback(windowRef) {
  const url = new URL(windowRef.location.href);
  const hash = new URLSearchParams(url.hash.replace(/^#/, ""));
  return Object.freeze({
    code: url.searchParams.get("code") || "",
    accessToken: hash.get("access_token") || "",
    refreshToken: hash.get("refresh_token") || "",
    error: url.searchParams.get("error") || hash.get("error") || "",
    errorCode: url.searchParams.get("error_code") || hash.get("error_code") || "",
    errorDescription: url.searchParams.get("error_description") || hash.get("error_description") || "",
  });
}

function cleanCallbackUrl(windowRef) {
  const url = new URL(windowRef.location.href);
  for (const key of ["code", "error", "error_code", "error_description"]) {
    url.searchParams.delete(key);
  }
  url.hash = "";
  windowRef.history.replaceState({}, "", url);
}

function safeDecode(value) {
  const normalized = String(value || "").replace(/\+/g, " ");
  try {
    return decodeURIComponent(normalized);
  } catch {
    return normalized;
  }
}

function callbackToError(callback) {
  if (!callback.error && !callback.errorDescription) return null;
  const message = safeDecode(callback.errorDescription || callback.error || "OAUTH_CALLBACK_FAILED");
  return Object.assign(new Error(message), {
    code: callback.errorCode || callback.error || "OAUTH_CALLBACK_FAILED",
  });
}

function humanAuthError(error) {
  const value = String(error?.message || error?.code || "");
  if (/invalid login|invalid credentials/i.test(value)) return "El correo o la contraseña no son correctos.";
  if (/email not confirmed/i.test(value)) return "Confirma tu correo antes de entrar.";
  if (/redirect.*allow|not allowed|redirect_to/i.test(value)) return "La URL de regreso de Aura no está autorizada en Supabase.";
  if (/stale_pkce_callback_retry/i.test(value)) return "La pestaña conservó un callback anterior. Vuelve a pulsar Continuar con Google.";
  if (/code verifier|exchange|pkce|flow state/i.test(value)) return "Google regresó a Forge, pero no pudimos completar la sesión. Inicia el acceso otra vez desde esta misma pestaña.";
  if (/network|fetch|load/i.test(value)) return "No pudimos conectar con Forge. Revisa tu conexión.";
  if (/config/i.test(value)) return "Falta la configuración pública de Supabase para este entorno.";
  return value && value !== "OAUTH_CALLBACK_FAILED"
    ? `No pudimos iniciar sesión: ${value}`
    : "No pudimos iniciar sesión. Intenta nuevamente.";
}

export function createAuraAuth({ windowRef = window } = {}) {
  let subscription = null;
  let session = null;
  let user = null;
  const listeners = new Set();

  const emit = (event = "AUTH_STATE_CHANGED", error = null) => {
    const expired = event === "SESSION_EXPIRED" || (event === "TOKEN_REFRESHED" && !user?.id);
    const authState = error
      ? "AUTH_ERROR"
      : expired
        ? "SESSION_EXPIRED"
        : user?.id
          ? "AUTHENTICATED"
          : "AUTH_REQUIRED";
    const snapshot = Object.freeze({
      event,
      session,
      user,
      status: user?.id ? "authenticated" : "anonymous",
      authState,
      error,
    });
    listeners.forEach(listener => listener(snapshot));
    return snapshot;
  };

  function bindAuthEvents(client) {
    if (subscription) return;
    const result = client.auth.onAuthStateChange((event, nextSession) => {
      session = nextSession || null;
      user = session?.user || null;
      const normalizedEvent = event === "TOKEN_REFRESHED" && !user?.id ? "SESSION_EXPIRED" : event;
      emit(normalizedEvent);
    });
    subscription = result?.data?.subscription || result?.subscription || null;
  }

  async function restore() {
    const client = await getClient();
    bindAuthEvents(client);

    const callback = readCallback(windowRef);
    const providerError = callbackToError(callback);
    if (providerError) {
      cleanCallbackUrl(windowRef);
      throw providerError;
    }

    let { data, error } = await client.auth.getSession();
    if (error) throw error;

    if (!data?.session && callback.accessToken && callback.refreshToken) {
      ({ data, error } = await client.auth.setSession({
        access_token: callback.accessToken,
        refresh_token: callback.refreshToken,
      }));
      if (error) throw error;
    }

    if (!data?.session && callback.code) {
      cleanCallbackUrl(windowRef);
      throw Object.assign(new Error("STALE_PKCE_CALLBACK_RETRY"), { code: "STALE_PKCE_CALLBACK_RETRY" });
    }

    session = data?.session || null;
    user = session?.user || null;
    if (session) cleanCallbackUrl(windowRef);
    return emit(session ? "SIGNED_IN" : "INITIAL_SESSION");
  }

  async function signInWithPassword({ email, password, form } = {}) {
    const client = await getClient();
    bindAuthEvents(client);
    try {
      const { data, error } = await client.auth.signInWithPassword({
        email: String(email || "").trim(),
        password: String(password || ""),
      });
      if (error) throw error;
      session = data?.session || null;
      user = data?.user || session?.user || null;
      return emit("SIGNED_IN");
    } finally {
      cleanSensitive(form);
    }
  }

  async function signInWithGoogle() {
    const client = await getClient();
    bindAuthEvents(client);
    const redirectTo = oauthRedirectUrl(windowRef.location.href);
    const { data, error } = await client.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo, skipBrowserRedirect: false },
    });
    if (error) throw error;
    return data;
  }

  async function signOut() {
    const client = await getClient();
    const { error } = await client.auth.signOut();
    session = null;
    user = null;
    if (error) throw error;
    return emit("SIGNED_OUT");
  }

  return Object.freeze({
    contractId: PRODUCTIVE.auth,
    config: publicConfig,
    getClient,
    restore,
    signInWithPassword,
    signInWithGoogle,
    signOut,
    humanAuthError,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    snapshot: () => Object.freeze({
      session,
      user,
      status: user?.id ? "authenticated" : "anonymous",
    }),
    destroy() {
      subscription?.unsubscribe?.();
      subscription = null;
      listeners.clear();
    },
  });
}

export function renderAuraLogin({ root, auth, onAuthenticated } = {}) {
  root.innerHTML = `
    <section class="aura-login" aria-labelledby="aura-login-title" data-aura-auth-state="AUTH_REQUIRED">
      <div class="aura-login__brand"><span aria-hidden="true">F</span><strong>Forge</strong><small>Aura Light</small></div>
      <div class="aura-login__panel">
        <p class="aura-eyebrow">ACCESO PRODUCTIVO</p>
        <h1 id="aura-login-title">Tu operación, en orden.</h1>
        <p>Inicia sesión para abrir tu Pipeline protegido.</p>
        <form data-aura-login-form novalidate>
          <label><span>Correo</span><input name="email" type="email" autocomplete="username" required></label>
          <label><span>Contraseña</span><input name="password" type="password" autocomplete="current-password" required></label>
          <p class="aura-login__error" role="alert" data-aura-auth-error hidden></p>
          <button class="aura-button aura-button--primary" type="submit">Iniciar sesión</button>
        </form>
        <div class="aura-login__divider"><span>o</span></div>
        <button class="aura-button aura-button--secondary" type="button" data-aura-google>Continuar con Google</button>
      </div>
      <p class="aura-login__privacy">Forge no guarda tu contraseña. La identidad es verificada por Supabase Auth.</p>
    </section>`;

  const form = root.querySelector("[data-aura-login-form]");
  const errorNode = root.querySelector("[data-aura-auth-error]");
  const setError = message => {
    errorNode.textContent = message || "";
    errorNode.hidden = !message;
    root.querySelector("[data-aura-auth-state]")?.setAttribute(
      "data-aura-auth-state",
      message ? "AUTH_ERROR" : "AUTH_REQUIRED",
    );
  };

  form.addEventListener("submit", async event => {
    event.preventDefault();
    setError("");
    const submit = form.querySelector('button[type="submit"]');
    submit.disabled = true;
    submit.setAttribute("aria-busy", "true");
    submit.textContent = "Entrando…";
    const data = new FormData(form);
    try {
      const snapshot = await auth.signInWithPassword({
        email: data.get("email"),
        password: data.get("password"),
        form,
      });
      onAuthenticated?.(snapshot);
    } catch (error) {
      setError(auth.humanAuthError(error));
    } finally {
      submit.disabled = false;
      submit.removeAttribute("aria-busy");
      submit.textContent = "Iniciar sesión";
    }
  });

  root.querySelector("[data-aura-google]").addEventListener("click", async event => {
    const button = event.currentTarget;
    setError("");
    button.disabled = true;
    button.setAttribute("aria-busy", "true");
    try {
      await auth.signInWithGoogle();
    } catch (error) {
      setError(auth.humanAuthError(error));
      button.disabled = false;
      button.removeAttribute("aria-busy");
    }
  });
}
