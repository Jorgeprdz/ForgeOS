const ROUTES = Object.freeze({ login: "login", pipeline: "pipeline" });
const AURA_MARKER = "/static-preview/forge-aura/";

export function resolveRuntimeBase(urlLike = globalThis.location?.href || "http://localhost/") {
  const url = new URL(urlLike, "http://localhost/");
  const markerIndex = url.pathname.indexOf(AURA_MARKER);
  if (markerIndex >= 0) {
    return `${url.origin}${url.pathname.slice(0, markerIndex + AURA_MARKER.length)}`;
  }
  const directory = url.pathname.endsWith("/")
    ? url.pathname
    : url.pathname.replace(/[^/]*$/, "");
  return `${url.origin}${directory}`;
}

export function normalizeRoute(value) {
  return String(value || "").toLowerCase() === ROUTES.login
    ? ROUTES.login
    : ROUTES.pipeline;
}

export function readRoute(urlLike = globalThis.location?.href || "http://localhost/") {
  const url = new URL(urlLike, "http://localhost/");
  return normalizeRoute(url.searchParams.get("route") || url.searchParams.get("nav") || "pipeline");
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
    current: () => readRoute(windowRef.location.href),
    navigate,
    restoreAfterAuth() {
      const url = routeUrl("pipeline", windowRef.location.href);
      windowRef.history.replaceState({}, "", url);
      emit();
    },
    destroy() {
      windowRef.removeEventListener("popstate", emit);
    },
  });
}
