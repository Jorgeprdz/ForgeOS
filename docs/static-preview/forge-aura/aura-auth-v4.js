import { oauthCallbackUrl } from "./aura-router-v4.js";

const SUPABASE_SDK = "https://unpkg.com/@supabase/supabase-js@2.108.2/dist/umd/supabase.js";
let supabaseLibraryPromise;
let clientPromise;

function publicConfig(env = globalThis.__ENV__) {
  const source = env && typeof env === "object" ? env : {};
  const SUPABASE_URL = String(source.SUPABASE_URL || "").trim();
  const SUPABASE_KEY = String(source.SUPABASE_KEY || source.SUPABASE_ANON_KEY || "").trim();
  const DEMO_MODE = String(source.DEMO_MODE || "").toLowerCase() === "true";
  return Object.freeze({
    SUPABASE_URL,
    SUPABASE_KEY,
    DEMO_MODE,
    configured: Boolean(SUPABASE_URL && SUPABASE_KEY),
  });
}

async function loadSupabase() {
  if (typeof globalThis.supabase?.createClient === "function") return globalThis.supabase;
  if (supabaseLibraryPromise) return supabaseLibraryPromise;
  supabaseLibraryPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = SUPABASE_SDK;
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
    if (config.DEMO_MODE || !config.configured) {
      throw Object.assign(new Error("PRODUCTIVE_AUTH_CONFIG_MISSING"), { code: "CONFIG_BLOCKED" });
    }
    const library = await loadSupabase();
    return library.createClient(config.SUPABASE_URL, config.SUPABASE_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
        flowType: "implicit",
      },
    });
  })();
  return clientPromise;
}

function cleanSensitive(form) {
  form?.querySelectorAll('input[type="password"]').forEach(input => { input.value = ""; });
}

function humanAuthError(error) {
  const value = String(error?.message || error?.code || "");
  if (/invalid login|invalid credentials/i.test(value)) return "El correo o la contraseña no son correctos.";
  if (/email not confirmed/i.test(value)) return "Confirma tu correo antes de entrar.";
  if (/redirect.*allow|not allowed|redirect_to/i.test(value)) return "La URL de callback OAuth v4 no está autorizada en Supabase.";
  if (/network|fetch|load/i.test(value)) return "No pudimos conectar con Forge. Revisa tu conexión.";
  if (/config/i.test(value)) return "Falta la configuración pública de Supabase para este entorno.";
  return value ? `No pudimos iniciar sesión: ${value}` : "No pudimos iniciar sesión.";
}

export function createAuraAuth({ windowRef = window } = {}) {
  let subscription = null;
  let session = null;
  let user = null;
  const listeners = new Set();

  const emit = (event = "AUTH_STATE_CHANGED", error = null) => {
    const snapshot = Object.freeze({
      event,
      session,
      user,
      status: user?.id ? "authenticated" : "anonymous",
      authState: error ? "AUTH_ERROR" : user?.id ? "AUTHENTICATED" : "AUTH_REQUIRED",
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
      emit(event);
    });
    subscription = result?.data?.subscription || result?.subscription || null;
  }

  async function restore() {
    const client = await getClient();
    bindAuthEvents(client);
    const { data, error } = await client.auth.getSession();
    if (error) throw error;
    session = data?.session || null;
    user = session?.user || null;
    return emit("INITIAL_SESSION");
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
    const redirectTo = oauthCallbackUrl(windowRef.location.href);
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
    snapshot: () => Object.freeze({ session, user, status: user?.id ? "authenticated" : "anonymous" }),
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
        <p class="aura-eyebrow">ACCESO PRODUCTIVO · CALLBACK V4</p>
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
  };

  form.addEventListener("submit", async event => {
    event.preventDefault();
    setError("");
    const submit = form.querySelector('button[type="submit"]');
    submit.disabled = true;
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
      submit.textContent = "Iniciar sesión";
    }
  });

  root.querySelector("[data-aura-google]").addEventListener("click", async event => {
    const button = event.currentTarget;
    setError("");
    button.disabled = true;
    button.textContent = "Abriendo Google…";
    try {
      await auth.signInWithGoogle();
    } catch (error) {
      setError(auth.humanAuthError(error));
      button.disabled = false;
      button.textContent = "Continuar con Google";
    }
  });
}
