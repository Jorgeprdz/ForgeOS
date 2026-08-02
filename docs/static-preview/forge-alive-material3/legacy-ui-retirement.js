import "./compensation-route-bootstrap-100b.js?v=advisor-compensation-100-auth-retry-001";

const LEGACY_CACHE_NAMES = new Set([
  "static-v7-pages-1",
  "runtime-v7-pages-1",
]);

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

await Promise.allSettled([
  retireLegacyServiceWorkers(),
  clearLegacyCaches(),
]);

document.documentElement.dataset.forgeLegacyUiRetired = "true";