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
      : reject(Object.assign(new Error("AUTH_CLIENT_INVALID"), { code: "AUTH_CLIENT_INVALID" }));
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
  if (/redirect.*allow|not allowed|redirect_to/i.test(value)) return "No pudimos abrir Google desde este entorno. Vuelve a Forge e inténtalo de nuevo.";
  if (/network|fetch|load/i.test(value)) return "No pudimos conectar con Forge. Revisa tu conexión.";
  if (/config/i.test(value)) return "Forge no está configurado para iniciar sesión en este entorno.";
  return "No pudimos iniciar sesión. Inténtalo de nuevo.";
}

function stateFromSession(user, error = null) {
  if (error) return "AUTH_ERROR";
  return user?.id ? "AUTHENTICATED" : "AUTH_REQUIRED";
}

export function createAuraAuth({ windowRef = window } = {}) {
  let subscription = null;
  let session = null;
  let user = null;
  let authState = "AUTH_LOADING";
  const listeners = new Set();

  const emit = (event = "AUTH_STATE_CHANGED", error = null, explicitState = null) => {
    authState = explicitState || stateFromSession(user, error);
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
      emit(event);
    });
    subscription = result?.data?.subscription || result?.subscription || null;
  }

  async function restore() {
    authState = "AUTH_LOADING";
    const client = await getClient();
    bindAuthEvents(client);
    const { data, error } = await client.auth.getSession();
    if (error) {
      emit("INITIAL_SESSION_ERROR", error, "AUTH_ERROR");
      throw error;
    }
    session = data?.session || null;
    user = session?.user || null;
    return emit("INITIAL_SESSION");
  }

  async function signInWithPassword({ email, password, form } = {}) {
    emit("AUTHENTICATING_PASSWORD", null, "AUTHENTICATING_PASSWORD");
    try {
      const client = await getClient();
      bindAuthEvents(client);
      const { data, error } = await client.auth.signInWithPassword({
        email: String(email || "").trim(),
        password: String(password || ""),
      });
      if (error) throw error;
      session = data?.session || null;
      user = data?.user || session?.user || null;
      return emit("SIGNED_IN");
    } catch (error) {
      emit("PASSWORD_AUTH_ERROR", error, "AUTH_ERROR");
      throw error;
    } finally {
      cleanSensitive(form);
    }
  }

  async function signInWithGoogle() {
    emit("AUTHENTICATING_GOOGLE", null, "AUTHENTICATING_GOOGLE");
    try {
      const client = await getClient();
      bindAuthEvents(client);
      const redirectTo = oauthCallbackUrl(windowRef.location.href);
      const { data, error } = await client.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo, skipBrowserRedirect: false },
      });
      if (error) throw error;
      return data;
    } catch (error) {
      emit("GOOGLE_AUTH_ERROR", error, "AUTH_ERROR");
      throw error;
    }
  }

  async function signOut() {
    const client = await getClient();
    const { error } = await client.auth.signOut();
    session = null;
    user = null;
    if (error) throw error;
    return emit("SIGNED_OUT", null, "SIGNED_OUT");
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
    snapshot: () => Object.freeze({ session, user, status: user?.id ? "authenticated" : "anonymous", authState }),
    destroy() {
      subscription?.unsubscribe?.();
      subscription = null;
      listeners.clear();
    },
  });
}

function googleMark() {
  return `
    <svg class="aura-auth-google__icon" viewBox="0 0 18 18" aria-hidden="true" focusable="false">
      <path fill="#4285F4" d="M17.64 9.205c0-.638-.057-1.252-.164-1.841H9v3.481h4.844c-.209 1.125-.842 2.078-1.797 2.716v2.258h2.909c1.702-1.567 2.684-3.874 2.684-6.614z"/>
      <path fill="#34A853" d="M9 18c2.43 0 4.468-.806 5.956-2.181l-2.909-2.258c-.806.54-1.835.859-3.047.859-2.344 0-4.328-1.585-5.037-3.714H.956v2.332A9 9 0 0 0 9 18z"/>
      <path fill="#FBBC05" d="M3.963 10.706A5.41 5.41 0 0 1 3.682 9c0-.592.102-1.167.281-1.706V4.962H.956A9 9 0 0 0 0 9c0 1.45.347 2.823.956 4.038l3.007-2.332z"/>
      <path fill="#EA4335" d="M9 3.58c1.321 0 2.507.454 3.441 1.346l2.581-2.581C13.464.892 11.426 0 9 0A9 9 0 0 0 .956 4.962l3.007 2.332C4.672 5.165 6.656 3.58 9 3.58z"/>
    </svg>`;
}

export function renderAuraLogin({ root, auth, onAuthenticated } = {}) {
  root.innerHTML = `
    <main class="aura-auth-entry" aria-labelledby="aura-login-title" data-aura-auth-state="AUTH_REQUIRED">
      <section class="aura-auth-context" aria-labelledby="aura-auth-value-title">
        <div class="aura-auth-brand" aria-label="Forge">
          <span class="aura-auth-brand__mark" aria-hidden="true">F</span>
          <strong>Forge</strong>
        </div>
        <div class="aura-auth-value">
          <p class="aura-auth-kicker">Tu operación comercial</p>
          <h1 id="aura-auth-value-title">Clara y lista para avanzar.</h1>
          <p>Forge organiza lo que requiere tu atención para que sepas qué hacer después.</p>
          <ul class="aura-auth-capabilities" aria-label="Capacidades de Forge">
            <li><span aria-hidden="true">✓</span> Prioriza oportunidades</li>
            <li><span aria-hidden="true">✓</span> Organiza tu cartera</li>
            <li><span aria-hidden="true">✓</span> Convierte información en decisiones</li>
          </ul>
        </div>
        <div class="aura-auth-visual" aria-hidden="true">
          <span class="aura-auth-visual__rail"></span>
          <span class="aura-auth-visual__node aura-auth-visual__node--one"></span>
          <span class="aura-auth-visual__node aura-auth-visual__node--two"></span>
          <span class="aura-auth-visual__node aura-auth-visual__node--three"></span>
        </div>
      </section>

      <section class="aura-auth-access" aria-labelledby="aura-login-title">
        <div class="aura-auth-panel">
          <div class="aura-auth-panel__intro">
            <p class="aura-auth-kicker">Forge</p>
            <h2 id="aura-login-title">Bienvenido</h2>
            <p>Entra a Forge para continuar con tu operación.</p>
          </div>

          <button class="aura-auth-google" type="button" data-aura-google>
            ${googleMark()}
            <span data-aura-google-label>Continuar con Google</span>
          </button>

          <div class="aura-auth-divider" aria-hidden="true"><span>o continúa con correo</span></div>

          <form class="aura-auth-form" data-aura-login-form novalidate>
            <label>
              <span>Correo</span>
              <input name="email" type="email" inputmode="email" autocomplete="username" required>
            </label>
            <label>
              <span>Contraseña</span>
              <input name="password" type="password" autocomplete="current-password" required>
            </label>
            <p class="aura-auth-error" role="alert" aria-live="assertive" data-aura-auth-error hidden></p>
            <button class="aura-auth-submit" type="submit">Iniciar sesión</button>
          </form>

          <p class="aura-auth-privacy">Forge no guarda tu contraseña. Tu identidad se verifica mediante el proveedor de acceso seguro.</p>
        </div>
      </section>
    </main>`;

  const entry = root.querySelector("[data-aura-auth-state]");
  const form = root.querySelector("[data-aura-login-form]");
  const errorNode = root.querySelector("[data-aura-auth-error]");
  const googleButton = root.querySelector("[data-aura-google]");
  const googleLabel = root.querySelector("[data-aura-google-label]");
  const passwordButton = form.querySelector('button[type="submit"]');

  const setState = state => { entry.dataset.auraAuthState = state; };
  const setError = message => {
    errorNode.textContent = message || "";
    errorNode.hidden = !message;
    if (message) setState("AUTH_ERROR");
  };
  const setBusy = (mode = null) => {
    const passwordBusy = mode === "password";
    const googleBusy = mode === "google";
    googleButton.disabled = Boolean(mode);
    passwordButton.disabled = Boolean(mode);
    form.querySelectorAll("input").forEach(input => { input.disabled = Boolean(mode); });
    passwordButton.textContent = passwordBusy ? "Entrando…" : "Iniciar sesión";
    googleLabel.textContent = googleBusy ? "Abriendo Google…" : "Continuar con Google";
    if (passwordBusy) setState("AUTHENTICATING_PASSWORD");
    if (googleBusy) setState("AUTHENTICATING_GOOGLE");
    if (!mode && !errorNode.textContent) setState("AUTH_REQUIRED");
  };

  form.addEventListener("submit", async event => {
    event.preventDefault();
    setError("");
    setBusy("password");
    const data = new FormData(form);
    try {
      const snapshot = await auth.signInWithPassword({
        email: data.get("email"),
        password: data.get("password"),
        form,
      });
      setState("AUTHENTICATED");
      onAuthenticated?.(snapshot);
    } catch (error) {
      setBusy(null);
      setError(auth.humanAuthError(error));
      return;
    }
    setBusy(null);
  });

  googleButton.addEventListener("click", async () => {
    setError("");
    setBusy("google");
    try {
      await auth.signInWithGoogle();
    } catch (error) {
      setBusy(null);
      setError(auth.humanAuthError(error));
    }
  });
}
