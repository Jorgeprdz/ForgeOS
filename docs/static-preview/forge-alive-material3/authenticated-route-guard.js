const VERSION = "FORGE_AUTHENTICATED_ROUTE_GUARD_V4";
const FAIL_CLOSED_CONTRACT = "FORGE_AUTH_FAIL_CLOSED_V1";
const REQUIRED_LOGIN_GATE_CONTRACT = "FORGE_AUTH_REQUIRED_LOGIN_GATE_V1";
const LOGIN_GATE_RETRY_LIMIT = 120;
const LOGIN_GATE_RETRY_MS = 50;
const PRIVATE_ROUTES = new Set([
  "inicio",
  "pipeline",
  "quotes",
  "cotizaciones",
  "cartera",
  "actividad",
  "reportes",
  "forecast",
  "persona",
  "comisiones",
]);
const PRIVATE_SURFACE_SELECTORS = Object.freeze([
  "[data-forge-module-viewport]",
  "[data-forge-shell-controls]",
]);

function isLoopbackAcceptanceHarness() {
  return ["127.0.0.1", "localhost", "[::1]"].includes(location.hostname)
    && location.port === "4173";
}

const state = {
  status: "resolving",
  revision: 0,
  requestedRoute: null,
  acceptanceHarness: isLoopbackAcceptanceHarness(),
  loginGateForced: false,
  loginGateAttempts: 0,
  loginGateTimer: null,
};

function currentRoute() {
  const value = new URL(location.href).searchParams.get("nav");
  return PRIVATE_ROUTES.has(value) ? value : "inicio";
}

function ensureFailClosedStyle() {
  const marker = "data-forge-auth-fail-closed-style";
  if (document.querySelector(`[${marker}]`)) return;

  const style = document.createElement("style");
  style.setAttribute(marker, FAIL_CLOSED_CONTRACT);
  style.textContent = `
    html:not([data-forge-auth-boundary="authenticated"])
      [data-forge-module-viewport],
    html:not([data-forge-auth-boundary="authenticated"])
      [data-forge-shell-controls] {
      display: none !important;
      visibility: hidden !important;
      pointer-events: none !important;
    }
  `;
  (document.head || document.documentElement).append(style);
  document.documentElement.dataset.forgeAuthFailClosed = "armed";
}

function privateSurfaces() {
  return PRIVATE_SURFACE_SELECTORS.flatMap((selector) =>
    [...document.querySelectorAll(selector)]
  );
}

function setBooleanPropertyOnce(node, property, value) {
  if (!node || node[property] === value) return false;
  node[property] = value;
  return true;
}

function setAttributeOnce(node, name, value) {
  if (!node || node.getAttribute(name) === value) return false;
  node.setAttribute(name, value);
  return true;
}

function setPrivateSurfaceAvailable(available) {
  const unavailable = !available;
  for (const root of privateSurfaces()) {
    setBooleanPropertyOnce(root, "hidden", unavailable);
    setBooleanPropertyOnce(root, "inert", unavailable);
    setAttributeOnce(root, "aria-hidden", available ? "false" : "true");
  }
  document.documentElement.dataset.forgePrivateNavigation = available
    ? "available"
    : "blocked";
}

function requiredLoginAuthEntry() {
  const entry = globalThis.ForgeAliveAuthEntry067G17B1;
  if (!entry || typeof entry !== "object") return null;
  if (state.status === "authenticated") return entry;
  return entry.__forgeAuthenticatedSessionSource || entry;
}

function openRequiredLoginGate() {
  if (state.acceptanceHarness || state.status === "authenticated") return;
  if (state.loginGateForced) return;

  const authEntry = requiredLoginAuthEntry();
  if (typeof authEntry?.openAuthPanel === "function") {
    state.loginGateForced = true;
    state.loginGateAttempts = 0;
    authEntry.openAuthPanel({ nav: state.requestedRoute || currentRoute() });
    document.documentElement.dataset.forgeAuthLoginGate = "visible";
    return;
  }

  if (
    state.loginGateTimer !== null
    || state.loginGateAttempts >= LOGIN_GATE_RETRY_LIMIT
  ) {
    return;
  }

  state.loginGateAttempts += 1;
  state.loginGateTimer = globalThis.setTimeout(() => {
    state.loginGateTimer = null;
    openRequiredLoginGate();
  }, LOGIN_GATE_RETRY_MS);
}

function releaseRequiredLoginGate() {
  if (state.loginGateTimer !== null) {
    globalThis.clearTimeout(state.loginGateTimer);
    state.loginGateTimer = null;
  }
  state.loginGateAttempts = 0;

  if (state.loginGateForced) {
    state.loginGateForced = false;
    globalThis.ForgeAliveAuthEntry067G17B1?.closeAuthPanel?.();
  }
  document.documentElement.dataset.forgeAuthLoginGate = "released";
}

function scrubPrivateSurfaces() {
  document.querySelectorAll(
    "[data-nash-prospect-workspace]," +
    "[data-productive-context-workspace]," +
    "[data-nash-combat-workspace]," +
    "[data-nba-workspace]," +
    "[data-referral-sheet]," +
    "[data-forge-demo-banner]",
  ).forEach((node) => node.remove());

  for (const selector of [
    "[data-forge-pipeline-module]",
    "[data-forge-quotes-module]",
    "[data-forge-cartera-module]",
    "[data-forge-activity-module]",
    "[data-forge-person-workspace-module]",
  ]) {
    const root = document.querySelector(selector);
    if (!root) continue;
    root.replaceChildren();
    root.dataset.authScrubbed = "true";
  }

  globalThis.dispatchEvent(new CustomEvent("forge:private-runtime-scrub", {
    detail: Object.freeze({ revision: state.revision, status: state.status }),
  }));
}

function canonicalizeAnonymousLocation() {
  const url = new URL(location.href);
  const requested = currentRoute();
  if (requested !== "inicio") {
    state.requestedRoute = requested;
    sessionStorage.setItem("forge.auth.requested-route.v1", requested);
  }
  url.searchParams.set("nav", "inicio");
  if (url.href !== location.href) history.replaceState(history.state, "", url);
}

function restoreAuthenticatedRoute() {
  const requested = sessionStorage.getItem("forge.auth.requested-route.v1");
  sessionStorage.removeItem("forge.auth.requested-route.v1");
  const route = PRIVATE_ROUTES.has(requested) ? requested : currentRoute();
  const url = new URL(location.href);
  url.searchParams.set("nav", PRIVATE_ROUTES.has(route) ? route : "inicio");
  history.replaceState(history.state, "", url);
  globalThis.dispatchEvent(new PopStateEvent("popstate"));
}

function applyStatus(status) {
  state.revision += 1;
  state.status = status;
  document.documentElement.dataset.forgeAuthBoundary = status;

  if (status === "authenticated") {
    releaseRequiredLoginGate();
    setPrivateSurfaceAvailable(true);
    restoreAuthenticatedRoute();
    return;
  }

  setPrivateSurfaceAvailable(false);
  canonicalizeAnonymousLocation();
  if (status === "anonymous" || status === "auth_error") scrubPrivateSurfaces();
  openRequiredLoginGate();
}

function blockAnonymousNavigation(event) {
  if (state.status === "authenticated") return;
  const target = event.target instanceof Element ? event.target : null;
  const routeControl = target?.closest(
    "[data-route],[data-nav],[data-forge-route],[href*='nav=']",
  );
  if (!routeControl) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  canonicalizeAnonymousLocation();
  openRequiredLoginGate();
}

state.requestedRoute = currentRoute();
if (state.requestedRoute !== "inicio") {
  sessionStorage.setItem("forge.auth.requested-route.v1", state.requestedRoute);
}

ensureFailClosedStyle();
document.documentElement.dataset.forgeAuthBoundary = "resolving";
document.addEventListener("click", blockAnonymousNavigation, true);
globalThis.addEventListener("popstate", () => {
  if (state.status !== "authenticated") canonicalizeAnonymousLocation();
});
globalThis.addEventListener("forge:auth-state-changed", (event) => {
  const status = String(event?.detail?.status || "").toLowerCase();
  if (state.acceptanceHarness && ["anonymous", "auth_error"].includes(status)) {
    return;
  }
  if (status === "authenticated") applyStatus("authenticated");
  else if (["anonymous", "auth_error"].includes(status)) applyStatus(status);
});
globalThis.addEventListener("forge:auth-panel-closed", () => {
  if (state.acceptanceHarness || state.status === "authenticated") return;
  state.loginGateForced = false;
  document.documentElement.dataset.forgeAuthLoginGate = "reopening";
  globalThis.setTimeout(openRequiredLoginGate, 0);
});

const observer = new MutationObserver(() => {
  setPrivateSurfaceAvailable(state.status === "authenticated");
  if (state.status !== "authenticated") openRequiredLoginGate();
});
observer.observe(document.documentElement, {
  childList: true,
  subtree: true,
  attributes: true,
  attributeFilter: ["hidden", "inert", "aria-hidden"],
});

if (state.acceptanceHarness) {
  document.documentElement.dataset.forgeAuthAcceptanceHarness = "loopback-only";
  applyStatus("authenticated");
} else {
  setPrivateSurfaceAvailable(false);
  openRequiredLoginGate();
}

Object.defineProperty(globalThis, "ForgeAuthenticatedRouteGuard", {
  configurable: true,
  value: Object.freeze({
    version: VERSION,
    failClosedContract: FAIL_CLOSED_CONTRACT,
    requiredLoginGateContract: REQUIRED_LOGIN_GATE_CONTRACT,
    diagnostics: () => Object.freeze({ ...state }),
    openRequiredLoginGate,
    scrubPrivateSurfaces,
  }),
});

export {
  FAIL_CLOSED_CONTRACT,
  PRIVATE_ROUTES,
  PRIVATE_SURFACE_SELECTORS,
  REQUIRED_LOGIN_GATE_CONTRACT,
  VERSION,
  applyStatus,
  isLoopbackAcceptanceHarness,
  openRequiredLoginGate,
  requiredLoginAuthEntry,
  scrubPrivateSurfaces,
};
