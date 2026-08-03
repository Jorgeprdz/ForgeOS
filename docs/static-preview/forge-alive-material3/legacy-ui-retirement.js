import "./compensation-route-bootstrap-100b.js?v=advisor-compensation-120-false-zero-safe-area-001";

const LEGACY_CACHE_NAMES = new Set([
  "static-v7-pages-1",
  "runtime-v7-pages-1",
]);

const HOME_ROUTE_GATE_SELECTOR = "[data-home-live-dashboard-route-gate-entry]";
const HOME_ROUTE_GATE_HREF = new URL(
  "./home-live-dashboard-route-gate.js?v=home-live-dashboard-005",
  import.meta.url,
).href;
const LEGACY_CLEANUP_TIMEOUT_MS = 2_500;

function installHomeRouteGate() {
  if (document.querySelector(HOME_ROUTE_GATE_SELECTOR)) return;
  const script = document.createElement("script");
  script.type = "module";
  script.src = HOME_ROUTE_GATE_HREF;
  script.dataset.homeLiveDashboardRouteGateEntry = "true";
  document.head.append(script);
}

function scheduleHomeRouteGate() {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", installHomeRouteGate, { once: true });
    return;
  }
  queueMicrotask(installHomeRouteGate);
}

async function retireLegacyServiceWorkers() {
  if (!("serviceWorker" in navigator)) return;

  const registrations = await navigator.serviceWorker.getRegistrations();
  await Promise.all(
    registrations
      .filter((registration) => {
        try {
          return new URL(registration.scope).pathname.startsWith("/ForgeOS/");
        } catch {
          return false;
        }
      })
      .map((registration) => registration.unregister()),
  );
}

async function clearLegacyCaches() {
  if (!("caches" in globalThis)) return;

  const names = await caches.keys();
  await Promise.all(
    names
      .filter((name) => LEGACY_CACHE_NAMES.has(name))
      .map((name) => caches.delete(name)),
  );
}

function runLegacyCleanupInBackground() {
  const cleanup = Promise.allSettled([
    retireLegacyServiceWorkers(),
    clearLegacyCaches(),
  ]);
  const timeout = new Promise((resolve) => {
    globalThis.setTimeout(resolve, LEGACY_CLEANUP_TIMEOUT_MS);
  });

  void Promise.race([cleanup, timeout]).catch(() => undefined);
}

// Recovery CSS is owned exclusively by forge-ui-recovery-loader.js.
// Keeping a second loader here caused Chrome to abort the first stylesheet request.
scheduleHomeRouteGate();

document.documentElement.dataset.forgeLegacyUiRetired = "true";
document.documentElement.dataset.forgeUiRecovery = "002";

runLegacyCleanupInBackground();
