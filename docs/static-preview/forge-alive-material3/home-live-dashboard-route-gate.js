const HOME_SELECTOR = "[data-forge-home-module]";
const RUNTIME_SELECTOR = "[data-home-live-dashboard-runtime-entry]";
const RUNTIME_HREF = new URL(
  "./home-live-dashboard-runtime.js?v=home-live-dashboard-005",
  import.meta.url,
).href;

function routeAllowsHome() {
  const route = new URL(globalThis.location.href).searchParams.get("nav");
  return !route || route === "inicio" || route === "home";
}

function homeIsActive(root) {
  return Boolean(
    root
    && routeAllowsHome()
    && !root.hidden
    && root.dataset.moduleActive !== "false"
  );
}

function installRuntime() {
  if (document.querySelector(RUNTIME_SELECTOR)) return;
  const root = document.querySelector(HOME_SELECTOR);
  if (!homeIsActive(root)) return;

  const script = document.createElement("script");
  script.type = "module";
  script.src = RUNTIME_HREF;
  script.dataset.homeLiveDashboardRuntimeEntry = "true";
  document.head.append(script);
}

function reconcile() {
  queueMicrotask(installRuntime);
}

const observer = new MutationObserver(reconcile);
observer.observe(document.body, {
  subtree: true,
  childList: true,
  attributes: true,
  attributeFilter: ["hidden", "data-module-active"],
});

globalThis.addEventListener("popstate", reconcile);
globalThis.addEventListener("forge:route-changed", reconcile);
globalThis.addEventListener("pagehide", () => {
  observer.disconnect();
  globalThis.removeEventListener("popstate", reconcile);
  globalThis.removeEventListener("forge:route-changed", reconcile);
}, { once: true });

reconcile();
