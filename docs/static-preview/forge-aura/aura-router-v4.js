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

function explicitRouteValue(value) {
  const input = String(value || "").trim().toLowerCase();
  if (!input) return null;
  const route = ALIASES[input] || input;
  if (!Object.prototype.hasOwnProperty.call(ROUTES, route)) return null;
  const normalized = ROUTES[route];
  return normalized === ROUTES.login ? null : normalized;
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

export function routeUrl(route, current = globalThis.location?.href || "http://localhost/") {
  const url = new URL(current, "http://localhost/");
  url.searchParams.delete("nav");
  url.searchParams.delete("auth");
  url.searchParams.set("route", normalizeRoute(route));
  return url;
}

export function authEntryUrl(route = "inicio", current = globalThis.location?.href || "http://localhost/") {
  const target = normalizeRoute(route) === ROUTES.login ? ROUTES.inicio : normalizeRoute(route);
  const url = new URL("index.html", resolveRuntimeBase(current));
  url.searchParams.set("route", target);
  return url;
}

export function oauthCallbackUrl(current = globalThis.location?.href || "http://localhost/") {
  const callback = new URL("oauth-callback-v4.html", resolveRuntimeBase(current));
  const returnRoute = readExplicitRoute(current);
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
    onChange?.(route);
  };

  const navigate = (route, { replace = false } = {}) => {
    const normalized = normalizeRoute(route);
    remember(normalized);
    const url = routeUrl(normalized, windowRef.location.href);
    windowRef.history[replace ? "replaceState" : "pushState"]({}, "", url);
    emit();
  };

  windowRef.addEventListener("popstate", emit);

  return Object.freeze({
    current: () => readRoute(windowRef.location.href),
    navigate,
    restoreAfterAuth() {
      const target = returnRoute === ROUTES.login ? ROUTES.inicio : returnRoute;
      const url = routeUrl(target, windowRef.location.href);
      windowRef.history.replaceState({}, "", url);
      emit();
    },
    destroy() {
      windowRef.removeEventListener("popstate", emit);
    },
  });
}
