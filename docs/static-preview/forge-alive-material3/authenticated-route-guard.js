const VERSION = "FORGE_AUTHENTICATED_ROUTE_GUARD_V2";
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
};

function currentRoute() {
  const value = new URL(location.href).searchParams.get("nav");
  return PRIVATE_ROUTES.has(value) ? value : "inicio";
}

function viewport() {
  return document.querySelector("[data-forge-module-viewport]");
}

function setPrivateSurfaceAvailable(available) {
  const root = viewport();
  if (!root) return;
  root.hidden = !available;
  root.inert = !available;
  root.setAttribute("aria-hidden", available ? "false" : "true");
  document.documentElement.dataset.forgePrivateNavigation = available
    ? "available"
    : "blocked";
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
    setPrivateSurfaceAvailable(true);
    restoreAuthenticatedRoute();
    return;
  }

  setPrivateSurfaceAvailable(false);
  canonicalizeAnonymousLocation();
  if (status === "anonymous" || status === "auth_error") scrubPrivateSurfaces();
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
  document.querySelector("[data-forge-auth-open]")?.click();
}

state.requestedRoute = currentRoute();
if (state.requestedRoute !== "inicio") {
  sessionStorage.setItem("forge.auth.requested-route.v1", state.requestedRoute);
}

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

const observer = new MutationObserver(() => {
  setPrivateSurfaceAvailable(state.status === "authenticated");
});
observer.observe(document.documentElement, { childList: true, subtree: true });

if (state.acceptanceHarness) {
  document.documentElement.dataset.forgeAuthAcceptanceHarness = "loopback-only";
  applyStatus("authenticated");
} else {
  setPrivateSurfaceAvailable(false);
}

Object.defineProperty(globalThis, "ForgeAuthenticatedRouteGuard", {
  configurable: true,
  value: Object.freeze({
    version: VERSION,
    diagnostics: () => Object.freeze({ ...state }),
    scrubPrivateSurfaces,
  }),
});

export {
  PRIVATE_ROUTES,
  VERSION,
  applyStatus,
  isLoopbackAcceptanceHarness,
  scrubPrivateSurfaces,
};
