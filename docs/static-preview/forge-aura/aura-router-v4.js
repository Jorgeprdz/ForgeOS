const ROUTES = Object.freeze({ login: "login", pipeline: "pipeline", actividad: "actividad" });
const AURA_MARKER = "/static-preview/forge-aura/";

export function resolveRuntimeBase(urlLike = globalThis.location?.href || "http://localhost/") {
  const url = new URL(urlLike, "http://localhost/");
  const markerIndex = url.pathname.indexOf(AURA_MARKER);
  if (markerIndex >= 0) return `${url.origin}${url.pathname.slice(0, markerIndex + AURA_MARKER.length)}`;
  const directory = url.pathname.endsWith("/") ? url.pathname : url.pathname.replace(/[^/]*$/, "");
  return `${url.origin}${directory}`;
}

export function normalizeRoute(value) {
  const normalized = String(value || "").trim().toLowerCase();
  return Object.values(ROUTES).includes(normalized) ? normalized : ROUTES.pipeline;
}

export function readRoute(urlLike = globalThis.location?.href || "http://localhost/") {
  const url = new URL(urlLike, "http://localhost/");
  return normalizeRoute(url.searchParams.get("route") || url.searchParams.get("nav") || ROUTES.pipeline);
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
  const emit = () => onChange?.(readRoute(windowRef.location.href));
  const navigate = (route, { replace = false } = {}) => {
    const url = routeUrl(route, windowRef.location.href);
    windowRef.history[replace ? "replaceState" : "pushState"]({}, "", url);
    emit();
  };
  windowRef.addEventListener("popstate", emit);
  return Object.freeze({
    routes: ROUTES,
    current: () => readRoute(windowRef.location.href),
    navigate,
    restoreAfterAuth() {
      const requested = readRoute(windowRef.location.href);
      const target = requested === ROUTES.login ? ROUTES.pipeline : requested;
      const url = routeUrl(target, windowRef.location.href);
      windowRef.history.replaceState({}, "", url);
      emit();
    },
    destroy() { windowRef.removeEventListener("popstate", emit); },
  });
}
