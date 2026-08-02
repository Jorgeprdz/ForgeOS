const CONTRACT_ID = "FORGE_PUBLIC_AUTH_TOUCH_GATE_V1";
const PROJECT_REF = "rmlxigxysujsuwzgoimv";
const CONTROL_SELECTOR = [
  "[data-forge-auth-google]",
  "[data-forge-demo-login]",
  "[data-forge-auth-signout]",
  "[data-forge-auth-avatar]",
  "[data-forge-auth-open]",
  "[data-forge-auth-close]",
].join(",");
const REQUIRED_GATE_STATES = new Set(["visible", "reopening"]);
const recentPointerActivation = new WeakMap();
const state = {
  googleBusy: false,
  demoBusy: false,
  observer: null,
  syncQueued: false,
  activationCount: 0,
  lastAction: null,
};

function authApi() {
  return globalThis.ForgeAliveAuthEntry067G17B1 || null;
}

function bootstrapApi() {
  return globalThis.ForgeProductiveProspectBootstrap067G17B || null;
}

function env() {
  return globalThis.__ENV__ && typeof globalThis.__ENV__ === "object"
    ? globalThis.__ENV__
    : {};
}

function requiredGateActive() {
  return document.documentElement.dataset.forgeAuthBoundary !== "authenticated"
    && REQUIRED_GATE_STATES.has(
      document.documentElement.dataset.forgeAuthLoginGate || "",
    );
}

function setPanelError(message) {
  const node = document.querySelector("[data-forge-auth-error]");
  if (!node) return;
  node.textContent = message || "";
  node.hidden = !message;
}

function canonicalRedirect() {
  const current = new URL(location.href);
  const redirect = new URL(current.pathname, current.origin);
  redirect.searchParams.set("nav", current.searchParams.get("nav") || "inicio");
  if (current.searchParams.get("v")) {
    redirect.searchParams.set("v", current.searchParams.get("v"));
  }
  return redirect.href;
}

function supabaseConfig() {
  const source = env();
  const url = typeof source.SUPABASE_URL === "string"
    ? source.SUPABASE_URL.trim()
    : "";
  const key = typeof source.SUPABASE_KEY === "string"
    ? source.SUPABASE_KEY.trim()
    : "";
  if (!url || !key || !url.includes(`${PROJECT_REF}.supabase.co`)) return null;
  return { url, key };
}

async function waitForBootstrap() {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    const bootstrap = bootstrapApi();
    if (bootstrap) return bootstrap;
    await new Promise((resolve) => globalThis.setTimeout(resolve, 50));
  }
  return bootstrapApi();
}

function emitActivation(action, inputType) {
  state.activationCount += 1;
  state.lastAction = action;
  globalThis.dispatchEvent(new CustomEvent("forge:public-auth-touch-activation", {
    detail: Object.freeze({
      contractId: CONTRACT_ID,
      action,
      inputType,
      activationCount: state.activationCount,
    }),
  }));
}

function setBusy(button, busyText) {
  const previous = button.textContent;
  button.disabled = true;
  button.dataset.forgeAuthTouchBusy = "true";
  button.textContent = busyText;
  return () => {
    if (!button.isConnected) return;
    button.disabled = false;
    delete button.dataset.forgeAuthTouchBusy;
    button.textContent = previous;
  };
}

async function startGoogle(button) {
  if (state.googleBusy) return;
  state.googleBusy = true;
  setPanelError("");
  const restore = setBusy(button, "Abriendo Google…");
  try {
    const bootstrap = await waitForBootstrap();
    if (typeof bootstrap?.signInWithGoogle !== "function") {
      throw Object.assign(new Error("CANONICAL_AUTH_CLIENT_UNAVAILABLE"), {
        code: "CLIENT_UNAVAILABLE",
      });
    }
    const result = await bootstrap.signInWithGoogle({
      redirectTo: authApi()?.canonicalRedirectUrl?.() || canonicalRedirect(),
    });
    if (result?.error) throw result.error;
  } catch (error) {
    setPanelError(
      error?.code === "CONFIG_BLOCKED"
        ? "Forge no tiene configuración pública productiva para iniciar sesión."
        : "No pudimos abrir Google. Revisa la conexión e inténtalo otra vez.",
    );
    state.googleBusy = false;
    restore();
  }
}

async function startDemo(button) {
  if (state.demoBusy) return;
  const config = supabaseConfig();
  if (!config) {
    setPanelError("La conexión productiva requerida para la demo no está disponible.");
    return;
  }

  state.demoBusy = true;
  setPanelError("");
  const restore = setBusy(button, "Abriendo demo…");
  sessionStorage.setItem("forge.demo.login.pending.v1", "true");

  try {
    const requestedNav = new URL(location.href).searchParams.get("nav") || "inicio";
    const result = await fetch(`${config.url}/functions/v1/forge-demo-login`, {
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
    console.error("[FORGE PUBLIC AUTH TOUCH GATE]", error);
    state.demoBusy = false;
    sessionStorage.removeItem("forge.demo.login.pending.v1");
    setPanelError("No pudimos abrir la demo en este momento. Inténtalo nuevamente.");
    restore();
  }
}

async function activate(control, inputType) {
  if (!control || control.disabled) return;
  if (control.matches("[data-forge-auth-google]")) {
    emitActivation("GOOGLE", inputType);
    await startGoogle(control);
    return;
  }
  if (control.matches("[data-forge-demo-login]")) {
    emitActivation("DEMO", inputType);
    await startDemo(control);
    return;
  }
  if (control.matches("[data-forge-auth-signout]")) {
    emitActivation("SIGN_OUT", inputType);
    await authApi()?.signOut?.();
    return;
  }
  if (control.matches("[data-forge-auth-avatar]")) {
    emitActivation("OPEN_PROFILE", inputType);
    authApi()?.openAuthPanel?.();
    return;
  }
  if (control.matches("[data-forge-auth-open]")) {
    emitActivation("OPEN_LOGIN", inputType);
    authApi()?.openAuthPanel?.({
      nav: control.getAttribute("data-forge-auth-open-nav")
        || control.getAttribute("data-forge-nav-key")
        || null,
    });
    return;
  }
  if (control.matches("[data-forge-auth-close]") && !requiredGateActive()) {
    emitActivation("CLOSE", inputType);
    authApi()?.closeAuthPanel?.();
  }
}

function controlFromEvent(event) {
  const target = event.target instanceof Element ? event.target : null;
  return target?.closest(CONTROL_SELECTOR) || null;
}

function consume(event) {
  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation();
}

function onPointerUp(event) {
  const control = controlFromEvent(event);
  if (!control) return;
  consume(event);
  recentPointerActivation.set(control, performance.now());
  void activate(control, event.pointerType || "pointer");
}

function onTouchEnd(event) {
  if ("PointerEvent" in globalThis) return;
  const control = controlFromEvent(event);
  if (!control) return;
  consume(event);
  recentPointerActivation.set(control, performance.now());
  void activate(control, "touch");
}

function onClick(event) {
  const control = controlFromEvent(event);
  if (!control) return;
  const recent = recentPointerActivation.get(control) || 0;
  consume(event);
  if (performance.now() - recent < 900) return;
  void activate(control, event.detail === 0 ? "keyboard" : "click");
}

function installStyles() {
  if (document.querySelector("[data-forge-public-auth-touch-style]")) return;
  const style = document.createElement("style");
  style.dataset.forgePublicAuthTouchStyle = CONTRACT_ID;
  style.textContent = `
    [data-forge-auth-panel] button,
    [data-forge-demo-login],
    [data-forge-auth-avatar],
    [data-forge-auth-open] {
      pointer-events: auto !important;
      touch-action: manipulation;
      -webkit-tap-highlight-color: rgba(155, 232, 255, .18);
    }
    [data-forge-auth-panel][data-forge-required-gate="true"] footer,
    [data-forge-auth-panel][data-forge-required-gate="true"] [data-forge-auth-close] {
      display: none !important;
    }
  `;
  document.head.append(style);
}

function syncGateUi() {
  state.syncQueued = false;
  const panel = document.querySelector("[data-forge-auth-panel]");
  if (!panel) return;
  const required = requiredGateActive();
  panel.dataset.forgeRequiredGate = String(required);
  panel.querySelectorAll("[data-forge-auth-close]").forEach((button) => {
    button.tabIndex = required ? -1 : 0;
    button.setAttribute("aria-hidden", String(required));
  });
  const title = panel.querySelector("[data-forge-auth-title]");
  if (required && title) title.dataset.forgeRequiredGateTitle = "true";
}

function scheduleSync() {
  if (state.syncQueued) return;
  state.syncQueued = true;
  globalThis.requestAnimationFrame(syncGateUi);
}

function boot() {
  installStyles();
  document.addEventListener("pointerup", onPointerUp, true);
  document.addEventListener("touchend", onTouchEnd, {
    capture: true,
    passive: false,
  });
  document.addEventListener("click", onClick, true);
  state.observer = new MutationObserver(scheduleSync);
  state.observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["data-forge-auth-boundary", "data-forge-auth-login-gate", "hidden"],
  });
  scheduleSync();
  document.documentElement.dataset.forgePublicAuthTouchGate = CONTRACT_ID;
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot, { once: true });
} else {
  boot();
}

Object.defineProperty(globalThis, "ForgePublicAuthTouchGate", {
  configurable: true,
  value: Object.freeze({
    contractId: CONTRACT_ID,
    activate,
    syncGateUi,
    diagnostics: () => Object.freeze({
      activationCount: state.activationCount,
      lastAction: state.lastAction,
      googleBusy: state.googleBusy,
      demoBusy: state.demoBusy,
      requiredGateActive: requiredGateActive(),
      observerActive: Boolean(state.observer),
    }),
  }),
});

export {
  CONTRACT_ID,
  CONTROL_SELECTOR,
  activate,
  requiredGateActive,
  syncGateUi,
};
