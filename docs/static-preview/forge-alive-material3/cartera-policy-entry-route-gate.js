const ROOT_SELECTOR = "[data-forge-cartera-module]";
const ENTRY_SELECTOR = "[data-cartera-policy-entry]";
const loaderUrl = new URL(import.meta.url);
const version = loaderUrl.searchParams.get("v") || "cartera-policy-entry-route-gate-001";
const intakeUrl = new URL(
  `./cartera-document-intake.js?v=${encodeURIComponent(version)}`,
  import.meta.url,
).href;

let observer = null;
let loading = null;

function rootReady() {
  return document.querySelector(ROOT_SELECTOR);
}

function install() {
  const root = rootReady();
  if (!root) return false;
  if (root.querySelector(ENTRY_SELECTOR)) {
    observer?.disconnect();
    observer = null;
    return true;
  }
  if (!loading) {
    loading = import(intakeUrl).catch((error) => {
      loading = null;
      console.error("[CARTERA POLICY ENTRY ROUTE GATE]", error);
      throw error;
    });
  }
  observer?.disconnect();
  observer = null;
  return true;
}

function observeUntilReady() {
  if (install() || observer) return;
  observer = new MutationObserver(() => install());
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", observeUntilReady, { once: true });
} else {
  observeUntilReady();
}

globalThis.addEventListener("forge:auth-state-changed", observeUntilReady);
globalThis.addEventListener("forge:route-changed", observeUntilReady);
globalThis.addEventListener("pagehide", () => observer?.disconnect(), { once: true });

document.documentElement.dataset.carteraPolicyEntryRouteGate = version;
