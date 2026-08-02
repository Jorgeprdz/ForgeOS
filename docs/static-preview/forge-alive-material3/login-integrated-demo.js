const CONTRACT_ID = "FORGE_LOGIN_INTEGRATED_DEMO_V1";
const PROJECT_REF = "rmlxigxysujsuwzgoimv";
const BUTTON_SELECTOR = "[data-forge-demo-login]";
const BANNER_SELECTOR = "[data-forge-demo-banner]";
const state = {
  active: false,
  readOnly: false,
  pending: false,
  observer: null,
  originalOpen: globalThis.open?.bind(globalThis) || null,
};

function env() {
  return globalThis.__ENV__ && typeof globalThis.__ENV__ === "object"
    ? globalThis.__ENV__
    : {};
}

function supabaseConfig() {
  const source = env();
  const url = typeof source.SUPABASE_URL === "string" ? source.SUPABASE_URL.trim() : "";
  const key = typeof source.SUPABASE_KEY === "string" ? source.SUPABASE_KEY.trim() : "";
  if (!url || !key || !url.includes(`${PROJECT_REF}.supabase.co`)) return null;
  return { url, key };
}

function canonicalRedirect() {
  const current = new URL(globalThis.location.href);
  const redirect = new URL(
    "/ForgeOS/static-preview/forge-alive/",
    current.origin,
  );
  const nav = current.searchParams.get("nav") || "inicio";
  redirect.searchParams.set("nav", nav);
  return redirect.href;
}

function ensureStyles() {
  if (document.querySelector("[data-forge-demo-styles]")) return;
  const style = document.createElement("style");
  style.dataset.forgeDemoStyles = "true";
  style.textContent = `
    .forge-demo-login-section{display:grid;gap:8px;margin-top:14px;padding-top:14px;border-top:1px solid color-mix(in srgb,currentColor 16%,transparent)}
    .forge-demo-login-label{margin:0;text-align:center;font-size:11px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;opacity:.66}
    .forge-demo-login-button{min-height:46px;border:1px solid color-mix(in srgb,#9be8ff 44%,transparent);border-radius:16px;background:color-mix(in srgb,#9be8ff 12%,transparent);color:inherit;font:800 14px/1.2 Inter,system-ui,sans-serif;cursor:pointer}
    .forge-demo-login-button:disabled{cursor:wait;opacity:.62}
    .forge-demo-banner{position:sticky;top:0;z-index:1200;display:flex;justify-content:center;align-items:center;gap:8px;box-sizing:border-box;width:100%;min-height:34px;padding:7px 14px;background:#f2c94c;color:#16130a;font:900 11px/1.2 Inter,system-ui,sans-serif;letter-spacing:.055em;text-align:center;text-transform:uppercase;box-shadow:0 4px 18px rgba(0,0,0,.22)}
    .forge-demo-toast{position:fixed;z-index:3000;left:50%;bottom:calc(112px + env(safe-area-inset-bottom));translate:-50% 0;max-width:min(440px,calc(100vw - 30px));padding:11px 15px;border-radius:14px;background:#111b2c;color:#fff;font:700 13px/1.35 Inter,system-ui,sans-serif;box-shadow:0 14px 40px rgba(0,0,0,.34)}
  `;
  document.head.append(style);
}

function panelError(message) {
  const host = document.querySelector("[data-forge-auth-error]");
  if (!host) return;
  host.textContent = message || "";
  host.hidden = !message;
}

function showToast(message) {
  document.querySelector(".forge-demo-toast")?.remove();
  const toast = document.createElement("div");
  toast.className = "forge-demo-toast";
  toast.setAttribute("role", "status");
  toast.textContent = message;
  document.body.append(toast);
  globalThis.setTimeout(() => toast.remove(), 4200);
}

function ensureDemoLoginButton() {
  ensureStyles();
  const loginView = document.querySelector("[data-forge-auth-login-view]");
  if (!loginView || loginView.querySelector(BUTTON_SELECTOR)) return;
  const section = document.createElement("section");
  section.className = "forge-demo-login-section";
  section.dataset.forgeDemoLoginSection = "true";
  section.innerHTML = `
    <p class="forge-demo-login-label">Explorar sin usar datos reales</p>
    <button type="button" class="forge-demo-login-button" data-forge-demo-login>
      Explorar ForgeOS con datos demo
    </button>
  `;
  loginView.append(section);
  section.querySelector(BUTTON_SELECTOR)?.addEventListener("click", startDemoLogin);
}

async function startDemoLogin(event) {
  const button = event.currentTarget;
  const config = supabaseConfig();
  if (!config) {
    panelError("La conexión productiva requerida para la demo no está disponible.");
    return;
  }
  button.disabled = true;
  const previous = button.textContent;
  button.textContent = "Abriendo demo…";
  panelError("");
  state.pending = true;
  sessionStorage.setItem("forge.demo.login.pending.v1", "true");

  try {
    const endpoint = `${config.url}/functions/v1/forge-demo-login`;
    const requestedNav = new URL(location.href).searchParams.get("nav") || "inicio";
    const result = await fetch(endpoint, {
      method: "POST",
      headers: {
        apikey: config.key,
        Authorization: `Bearer ${config.key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        redirectTo: canonicalRedirect(),
        requestedNav,
      }),
      cache: "no-store",
      credentials: "omit",
      referrerPolicy: "no-referrer",
    });
    const payload = await result.json().catch(() => ({}));
    if (!result.ok || payload?.ok !== true || typeof payload.actionLink !== "string") {
      throw new Error(payload?.code || "DEMO_LOGIN_UNAVAILABLE");
    }
    const action = new URL(payload.actionLink);
    if (
      action.protocol !== "https:"
      || action.hostname !== `${PROJECT_REF}.supabase.co`
      || !action.pathname.startsWith("/auth/v1/")
    ) {
      throw new Error("DEMO_LOGIN_LINK_INVALID");
    }
    location.assign(action.href);
  } catch (error) {
    state.pending = false;
    sessionStorage.removeItem("forge.demo.login.pending.v1");
    panelError("No pudimos abrir la demo en este momento. Inténtalo nuevamente.");
    console.error("[FORGE DEMO LOGIN]", error);
    button.disabled = false;
    button.textContent = previous;
  }
}

function renderBanner() {
  const existing = document.querySelector(BANNER_SELECTOR);
  if (!state.active) {
    existing?.remove();
    document.documentElement.removeAttribute("data-forge-demo-session");
    return;
  }
  document.documentElement.dataset.forgeDemoSession = "active";
  if (existing) return;
  const banner = document.createElement("div");
  banner.className = "forge-demo-banner";
  banner.dataset.forgeDemoBanner = "true";
  banner.setAttribute("role", "status");
  banner.textContent = state.readOnly
    ? "Modo demostración · Datos ficticios · Solo lectura"
    : "Modo demostración · Datos ficticios";
  document.body.prepend(banner);
}

async function waitForBootstrap() {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    const bootstrap = globalThis.ForgeProductiveProspectBootstrap067G17B;
    if (typeof bootstrap?.getClient === "function" && typeof bootstrap?.getUser === "function") {
      return bootstrap;
    }
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  return null;
}

async function classifyCurrentSession() {
  const bootstrap = await waitForBootstrap();
  if (!bootstrap) return;
  try {
    const userResult = await bootstrap.getUser();
    const user = userResult?.data?.user;
    if (!user?.id) {
      state.active = false;
      state.readOnly = false;
      renderBanner();
      return;
    }
    const client = await bootstrap.getClient();
    const { data, error } = await client.rpc("forge_demo_current_session");
    if (error) throw error;
    state.active = data?.isDemo === true;
    state.readOnly = data?.readOnly === true;
    if (state.active) {
      sessionStorage.removeItem("forge.demo.login.pending.v1");
      state.pending = false;
    }
    renderBanner();
    globalThis.dispatchEvent(new CustomEvent("forge:demo-session-classified", {
      detail: Object.freeze({
        contractId: CONTRACT_ID,
        isDemo: state.active,
        readOnly: state.readOnly,
        dataClass: state.active ? "SYNTHETIC" : null,
      }),
    }));
  } catch (error) {
    console.warn("[FORGE DEMO CLASSIFICATION]", error?.code || error?.message || error);
    if (sessionStorage.getItem("forge.demo.login.pending.v1") === "true") {
      showToast("La sesión abrió, pero no pudimos validar todavía su clasificación demo.");
    }
  }
}

function externalSideEffectUrl(value) {
  if (!value || typeof value !== "string") return false;
  try {
    const url = new URL(value, location.href);
    if (["tel:", "mailto:", "sms:"].includes(url.protocol)) return true;
    return [
      "wa.me",
      "api.whatsapp.com",
      "web.whatsapp.com",
      "calendar.google.com",
      "mail.google.com",
    ].some((host) => url.hostname === host || url.hostname.endsWith(`.${host}`));
  } catch {
    return false;
  }
}

function blockExternalSideEffect(event) {
  if (!state.active) return;
  const target = event.target instanceof Element ? event.target : null;
  if (!target) return;
  const anchor = target.closest("a[href]");
  const explicit = target.closest(
    "[data-forge-external-action],[data-whatsapp],[data-call],[data-email],[data-google-calendar]",
  );
  if (!explicit && !externalSideEffectUrl(anchor?.getAttribute("href"))) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  showToast("Esta acción externa está bloqueada en la cuenta demostrativa.");
}

function installOpenGuard() {
  if (!state.originalOpen || globalThis.open?.__forgeDemoGuard) return;
  const guarded = function forgeDemoWindowOpen(url, ...args) {
    if (state.active && externalSideEffectUrl(String(url || ""))) {
      showToast("Esta acción externa está bloqueada en la cuenta demostrativa.");
      return null;
    }
    return state.originalOpen(url, ...args);
  };
  guarded.__forgeDemoGuard = true;
  globalThis.open = guarded;
}

function boot() {
  ensureStyles();
  ensureDemoLoginButton();
  state.observer = new MutationObserver(ensureDemoLoginButton);
  state.observer.observe(document.documentElement, { childList: true, subtree: true });
  document.addEventListener("click", blockExternalSideEffect, true);
  installOpenGuard();
  globalThis.addEventListener("forge:auth-state-changed", (event) => {
    if (event?.detail?.status === "anonymous") {
      state.active = false;
      state.readOnly = false;
      state.pending = false;
      sessionStorage.removeItem("forge.demo.login.pending.v1");
      renderBanner();
      return;
    }
    classifyCurrentSession();
  });
  classifyCurrentSession();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot, { once: true });
} else {
  boot();
}

export const ForgeLoginIntegratedDemo = Object.freeze({
  contractId: CONTRACT_ID,
  classifyCurrentSession,
  isActive: () => state.active,
});
