import "./compensation-route-bootstrap-100b.js?v=advisor-compensation-120-false-zero-safe-area-001";
import "./home-live-dashboard-runtime.js?v=home-live-dashboard-003";

const LEGACY_CACHE_NAMES = new Set([
  "static-v7-pages-1",
  "runtime-v7-pages-1",
]);

const RECOVERY_STYLESHEET_SELECTOR = "[data-forge-ui-recovery-styles]";
const RECOVERY_STYLESHEET_HREF = new URL(
  "./forge-ui-recovery.css?v=forge-ui-recovery-001",
  import.meta.url,
).href;

function installRecoveryStylesheet() {
  let stylesheet = document.querySelector(RECOVERY_STYLESHEET_SELECTOR);
  if (!stylesheet) {
    stylesheet = document.createElement("link");
    stylesheet.rel = "stylesheet";
    stylesheet.href = RECOVERY_STYLESHEET_HREF;
    stylesheet.dataset.forgeUiRecoveryStyles = "true";
    document.head.append(stylesheet);
  }

  let moving = false;
  const keepRecoveryLast = () => {
    if (moving || !stylesheet.isConnected || stylesheet === document.head.lastElementChild) {
      return;
    }
    moving = true;
    document.head.append(stylesheet);
    queueMicrotask(() => {
      moving = false;
    });
  };

  const observer = new MutationObserver(keepRecoveryLast);
  observer.observe(document.head, { childList: true });
  queueMicrotask(keepRecoveryLast);
  globalThis.addEventListener("pagehide", () => observer.disconnect(), { once: true });
}

async function retireLegacyServiceWorkers() {
  if (!("serviceWorker" in navigator)) {
    return;
  }

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
  if (!("caches" in globalThis)) {
    return;
  }

  const names = await caches.keys();
  await Promise.all(
    names
      .filter((name) => LEGACY_CACHE_NAMES.has(name))
      .map((name) => caches.delete(name)),
  );
}

installRecoveryStylesheet();

await Promise.allSettled([
  retireLegacyServiceWorkers(),
  clearLegacyCaches(),
]);

document.documentElement.dataset.forgeLegacyUiRetired = "true";
document.documentElement.dataset.forgeUiRecovery = "001";
