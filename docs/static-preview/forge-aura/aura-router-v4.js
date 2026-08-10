const ROUTES = Object.freeze({
  login: "login",
  inicio: "inicio",
  pipeline: "pipeline",
  actividad: "actividad",
  cartera: "cartera",
  comisiones: "comisiones",
  cotizaciones: "cotizaciones",
});
const ALIASES = Object.freeze({ home: "inicio", dashboard: "inicio", ingresos: "comisiones", quotes: "cotizaciones" });
const AURA_MARKER = "/static-preview/forge-aura/";
const CONTEXT_PARAMS = Object.freeze({
  source: "ctx_source",
  contract: "ctx_contract",
  decisionReference: "ctx_decision",
  sourceReference: "ctx_ref",
});

function explicitRouteValue(value) {
  const input = String(value || "").trim().toLowerCase();
  if (!input) return null;
  const route = ALIASES[input] || input;
  if (!Object.prototype.hasOwnProperty.call(ROUTES, route)) return null;
  const normalized = ROUTES[route];
  return normalized === ROUTES.login ? null : normalized;
}

function contextValue(value, max = 320) {
  const normalized = String(value ?? "").trim().replace(/\s+/g, " ");
  return normalized ? normalized.slice(0, max) : null;
}

function clearContextParams(url) {
  Object.values(CONTEXT_PARAMS).forEach(param => url.searchParams.delete(param));
  return url;
}

function applyContext(url, context = null) {
  clearContextParams(url);
  if (!context || typeof context !== "object") return url;
  Object.entries(CONTEXT_PARAMS).forEach(([key, param]) => {
    const value = contextValue(context[key]);
    if (value) url.searchParams.set(param, value);
  });
  return url;
}

export function resolveRuntimeBase(urlLike = globalThis.location?.href || "http://localhost/") {
  const url = new URL(urlLike, "http://localhost/");
  const markerIndex = url.pathname.indexOf(AURA_MARKER);
  if (markerIndex >= 0) return `${url.origin}${url.pathname.slice(0, markerIndex + AURA_MARKER.length)}`;
  const directory = url.pathname.endsWith("/") ? url.pathname : url.pathname.replace(/[^/]*$/, "");
  return `${url.origin}${directory}`;
}

export function normalizeRoute(value) {
  const input = String(value || "").toLowerCase();
  const route = ALIASES[input] || input;
  return ROUTES[route] || ROUTES.inicio;
}

export function readExplicitRoute(urlLike = globalThis.location?.href || "http://localhost/") {
  const url = new URL(urlLike, "http://localhost/");
  const raw = url.searchParams.has("route")
    ? url.searchParams.get("route")
    : url.searchParams.get("nav");
  return explicitRouteValue(raw);
}

export function readRoute(urlLike = globalThis.location?.href || "http://localhost/") {
  const url = new URL(urlLike, "http://localhost/");
  return normalizeRoute(url.searchParams.get("route") || url.searchParams.get("nav") || "inicio");
}

export function readRouteContext(urlLike = globalThis.location?.href || "http://localhost/") {
  const url = new URL(urlLike, "http://localhost/");
  const context = {};
  Object.entries(CONTEXT_PARAMS).forEach(([key, param]) => {
    const value = contextValue(url.searchParams.get(param));
    if (value) context[key] = value;
  });
  return Object.freeze(context);
}

export function routeUrl(route, current = globalThis.location?.href || "http://localhost/", context = null) {
  const url = new URL(current, "http://localhost/");
  url.searchParams.delete("nav");
  url.searchParams.delete("auth");
  url.searchParams.delete("return_route");
  url.searchParams.set("route", normalizeRoute(route));
  return applyContext(url, context);
}

export function authEntryUrl(route = "inicio", current = globalThis.location?.href || "http://localhost/") {
  const target = normalizeRoute(route) === ROUTES.login ? ROUTES.inicio : normalizeRoute(route);
  const url = new URL("index.html", resolveRuntimeBase(current));
  url.searchParams.set("route", target);
  return url;
}

export function oauthCallbackUrl(current = globalThis.location?.href || "http://localhost/") {
  const currentUrl = new URL(current, "http://localhost/");
  const callback = new URL("oauth-callback-v4.html", resolveRuntimeBase(currentUrl.href));
  const returnRoute = readExplicitRoute(currentUrl.href)
    || explicitRouteValue(currentUrl.searchParams.get("return_route"));
  if (returnRoute) callback.searchParams.set("return_route", returnRoute);
  return callback.href;
}

export function createAuraRouter({ windowRef = window, onChange } = {}) {
  let returnRoute = readExplicitRoute(windowRef.location.href) || ROUTES.inicio;

  const remember = route => {
    if (route !== ROUTES.login) returnRoute = route;
    return route;
  };

  const emit = () => {
    const route = remember(readRoute(windowRef.location.href));
    onChange?.(route, readRouteContext(windowRef.location.href));
  };

  const navigate = (route, { replace = false, context = null, preserveContext = false } = {}) => {
    const normalized = normalizeRoute(route);
    remember(normalized);
    const nextContext = preserveContext ? readRouteContext(windowRef.location.href) : context;
    const url = routeUrl(normalized, windowRef.location.href, nextContext);
    if (normalized === ROUTES.login && returnRoute !== ROUTES.inicio) {
      url.searchParams.set("return_route", returnRoute);
    }
    windowRef.history[replace ? "replaceState" : "pushState"]({}, "", url);
    emit();
  };

  windowRef.addEventListener("popstate", emit);

  return Object.freeze({
    current: () => readRoute(windowRef.location.href),
    context: () => readRouteContext(windowRef.location.href),
    navigate,
    clearContext() {
      const url = routeUrl(readRoute(windowRef.location.href), windowRef.location.href, null);
      windowRef.history.replaceState({}, "", url);
    },
    restoreAfterAuth() {
      const target = returnRoute === ROUTES.login ? ROUTES.inicio : returnRoute;
      const url = routeUrl(target, windowRef.location.href, null);
      windowRef.history.replaceState({}, "", url);
      emit();
    },
    destroy() {
      windowRef.removeEventListener("popstate", emit);
    },
  });
}

export { CONTEXT_PARAMS };
