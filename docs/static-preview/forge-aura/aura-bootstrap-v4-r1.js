const AURA_BOOT_REVISION = "AURA_BOOT_V4_R1_CACHE_ISOLATION_013";
const LEGACY_CACHE_NAMES = new Set(["static-v7-pages-1", "runtime-v7-pages-1"]);

function hasProductiveConfig() {
  const env = globalThis.__ENV__;
  return Boolean(env?.SUPABASE_URL && (env?.SUPABASE_KEY || env?.SUPABASE_ANON_KEY));
}

async function retireLegacyRuntime() {
  const jobs = [];
  if ("caches" in globalThis) {
    jobs.push((async () => {
      const names = await caches.keys();
      await Promise.all(names.filter(name => LEGACY_CACHE_NAMES.has(name)).map(name => caches.delete(name)));
    })());
  }
  if ("serviceWorker" in navigator) {
    jobs.push((async () => {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations
        .filter(registration => {
          try {
            const scope = new URL(registration.scope);
            return scope.origin === location.origin && scope.pathname.includes("/ForgeOS/");
          } catch {
            return false;
          }
        })
        .map(registration => registration.unregister()));
    })());
  }
  await Promise.allSettled(jobs);
}

document.documentElement.dataset.auraBootRevision = AURA_BOOT_REVISION;
document.documentElement.dataset.auraEnvState = hasProductiveConfig()
  ? "PRODUCTIVE_CONFIG_READY"
  : "PRODUCTIVE_CONFIG_BLOCKED";

try {
  await retireLegacyRuntime();
  await import("./app-v4-r1.js?v=aura-boot-cache-isolation-013");
  document.documentElement.dataset.auraBootState = "BOOT_IMPORT_OK";
} catch (error) {
  document.documentElement.dataset.auraBootState = "BOOT_IMPORT_FAILED";
  const root = document.querySelector("[data-aura-app]");
  if (root) {
    root.setAttribute("aria-busy", "false");
    root.innerHTML = `<section class="aura-login" data-aura-auth-state="BOOT_ERROR"><div class="aura-loading"><h1>No pudimos cargar Forge Aura</h1><p>El runtime productivo no pudo iniciar. Vuelve a abrir Forge para obtener la versión más reciente.</p></div></section>`;
  }
  console.error("AURA_BOOT_R1_IMPORT_FAILED", error);
}
