const CONTRACT_ID = "FORGE_DEMO_MODE_V1";
const DEMO_ACTOR = Object.freeze({
  id: "forge-demo-user",
  displayName: "Usuario Demo",
  role: "advisor-demo",
  isDemo: true,
});
const LOOPBACK_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]"]);
const sourceLayout = import.meta.url.includes("/docs/static-preview/");
const envUrl = new URL(sourceLayout ? "../../../env.js" : "../../env.js", import.meta.url);

if (!globalThis.__ENV__) await import(envUrl.href);

const config = globalThis.__ENV__ && typeof globalThis.__ENV__ === "object"
  ? globalThis.__ENV__
  : {};
const requestedMode = config.FORGE_DEMO_MODE === "true";
const requestedBypass = config.FORGE_DEMO_ALLOW_AUTH_BYPASS === "true";
const inconsistent = requestedMode !== requestedBypass;
const hasProductiveCredentials = Boolean(
  String(config.SUPABASE_URL || "").trim()
  || String(config.SUPABASE_KEY || "").trim(),
);
const loopback = LOOPBACK_HOSTS.has(globalThis.location?.hostname || "");

if (inconsistent) throw new Error("FORGE_DEMO_MODE_CONFIG_INCONSISTENT");
if (requestedMode && (!loopback || hasProductiveCredentials)) {
  throw new Error("FORGE_DEMO_MODE_FORBIDDEN_IN_PRODUCTION");
}

const active = requestedMode && requestedBypass && loopback && !hasProductiveCredentials;
const originalFetch = globalThis.fetch?.bind(globalThis);

function assertNoPrivateRead(operation = "private-read") {
  if (active) throw new Error(`FORGE_DEMO_PRIVATE_READ_BLOCKED:${operation}`);
}

function assertNoRealMutation(operation = "mutation") {
  if (active) throw new Error(`FORGE_DEMO_REAL_MUTATION_BLOCKED:${operation}`);
}

if (active && originalFetch) {
  globalThis.fetch = (input, init = {}) => {
    const url = new URL(typeof input === "string" ? input : input.url, location.href);
    const method = String(init.method || (typeof input === "object" && input.method) || "GET").toUpperCase();
    if (url.origin !== location.origin) {
      throw new Error(`FORGE_DEMO_REMOTE_NETWORK_BLOCKED:${url.origin}`);
    }
    if (method !== "GET" && method !== "HEAD") {
      throw new Error(`FORGE_DEMO_REAL_MUTATION_BLOCKED:${method}`);
    }
    return originalFetch(input, init);
  };
}

function renderIndicator() {
  if (!active || document.querySelector("[data-forge-demo-mode-indicator]")) return;
  const indicator = document.createElement("div");
  indicator.dataset.forgeDemoModeIndicator = "true";
  indicator.setAttribute("role", "status");
  indicator.textContent = "Modo demo — datos no productivos";
  indicator.style.cssText = "position:fixed;z-index:2200;right:12px;top:12px;padding:6px 10px;border:1px solid rgba(155,232,255,.38);border-radius:999px;background:#10243a;color:#d9fbff;font:800 11px/1.2 Inter,system-ui,sans-serif;box-shadow:0 6px 20px rgba(0,0,0,.2);pointer-events:none";
  document.body.append(indicator);
}

function suppressProductiveAuthControls() {
  if (!active || document.querySelector("[data-forge-demo-auth-suppression]")) return;
  const style = document.createElement("style");
  style.dataset.forgeDemoAuthSuppression = "true";
  style.textContent = `
    [data-forge-auth-avatar],
    [data-forge-auth-panel],
    [data-forge-demo-login-section] {
      display: none !important;
    }
  `;
  document.head.append(style);
}

if (active) {
  document.documentElement.dataset.forgeDemoMode = "active";
  document.documentElement.dataset.forgeDemoSession = "active";
  suppressProductiveAuthControls();
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", renderIndicator, { once: true });
  } else renderIndicator();
}

const api = Object.freeze({
  contractId: CONTRACT_ID,
  active,
  actor: active ? DEMO_ACTOR : null,
  localOnly: true,
  supabaseSession: null,
  assertNoPrivateRead,
  assertNoRealMutation,
  renderIndicator,
  suppressProductiveAuthControls,
});

Object.defineProperty(globalThis, "ForgeDemoMode", {
  configurable: false,
  writable: false,
  value: api,
});

export { CONTRACT_ID, DEMO_ACTOR, active, assertNoPrivateRead, assertNoRealMutation };
