const ROUTES = Object.freeze({
  login: "login",
  inicio: "inicio",
  pipeline: "pipeline",
  actividad: "actividad",
  cartera: "cartera",
  comisiones: "comisiones",
});
const ALIASES = Object.freeze({ home: "inicio", dashboard: "inicio", ingresos: "comisiones" });
const AURA_MARKER = "/static-preview/forge-aura/";

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

export function oauthCallbackUrl(current = globalThis.location?.href || "http://localhost/") {
  return new URL("oauth-callback-v4.html", resolveRuntimeBase(current)).href;
}

export function createAuraRouter({ windowRef = window, onChange } = {}) {
  let returnRoute = readRoute(windowRef.location.href);
  if (returnRoute === ROUTES.login) returnRoute = ROUTES.inicio;

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
