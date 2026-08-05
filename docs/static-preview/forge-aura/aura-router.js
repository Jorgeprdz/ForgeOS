const ROUTES = Object.freeze({ login: "login", pipeline: "pipeline" });

export function resolveRuntimeBase(urlLike = globalThis.location?.href || "http://localhost/") {
  const url = new URL(urlLike, "http://localhost/");
  const marker = "/docs/static-preview/forge-aura/";
  const index = url.pathname.indexOf(marker);
  if (index >= 0) return `${url.origin}${url.pathname.slice(0, index + marker.length)}`;
  const directory = url.pathname.endsWith("/") ? url.pathname : url.pathname.replace(/[^/]*$/, "");
  return `${url.origin}${directory}`;
}

export function normalizeRoute(value) {
  const route = String(value || "").toLowerCase();
  return route === ROUTES.login ? ROUTES.login : ROUTES.pipeline;
}

export function readRoute(urlLike = globalThis.location?.href || "http://localhost/") {
  const url = new URL(urlLike, "http://localhost/");
  return normalizeRoute(url.searchParams.get("route") || url.searchParams.get("nav") || "pipeline");
}

export function routeUrl(route, current = globalThis.location?.href || "http://localhost/") {
  const url = new URL(current, "http://localhost/");
  url.searchParams.delete("nav");
  url.searchParams.set("route", normalizeRoute(route));
  return url;
}

export function oauthRedirectUrl(current = globalThis.location?.href || "http://localhost/") {
  const url = new URL(resolveRuntimeBase(current));
  url.search = "";
  url.searchParams.set("route", "pipeline");
  url.searchParams.set("restore", "pipeline");
  url.hash = "";
  return url.href;
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
      const url = new URL(windowRef.location.href);
      const target = normalizeRoute(url.searchParams.get("restore") || "pipeline");
      url.searchParams.delete("restore");
      url.searchParams.set("route", target);
      windowRef.history.replaceState({}, "", url);
      emit();
    },
    destroy() { windowRef.removeEventListener("popstate", emit); },
  });
}
