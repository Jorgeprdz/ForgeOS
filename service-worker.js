// FORGEOS_LEGACY_SERVICE_WORKER_RETIRED
// Este worker existe únicamente para retirar el service worker raíz anterior,
// borrar sus cachés y devolver todo el tráfico de ForgeOS a la red.

const LEGACY_CACHE_NAMES = new Set([
  'static-v7-pages-1',
  'runtime-v7-pages-1',
]);

self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames
        .filter((name) => LEGACY_CACHE_NAMES.has(name))
        .map((name) => caches.delete(name)),
    );

    await self.clients.claim();
    await self.registration.unregister();

    const windows = await self.clients.matchAll({
      type: 'window',
      includeUncontrolled: true,
    });

    await Promise.all(
      windows.map((client) => client.navigate(client.url).catch(() => undefined)),
    );
  })());
});

// Sin listener fetch: ninguna navegación o asset vuelve a resolverse desde la UI legacy.
