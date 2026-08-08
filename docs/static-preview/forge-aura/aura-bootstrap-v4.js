function hasProductiveConfig() {
  const env = globalThis.__ENV__;
  return Boolean(env?.SUPABASE_URL && (env?.SUPABASE_KEY || env?.SUPABASE_ANON_KEY));
}

document.documentElement.dataset.auraEnvState = hasProductiveConfig()
  ? "PRODUCTIVE_CONFIG_READY"
  : "PRODUCTIVE_CONFIG_BLOCKED";

try {
  await import("./app-v4.js?v=aura-cartera-pdf-real-acceptance-root-010-aura-home-command-center-mobile-nav-001");
} catch (error) {
  document.documentElement.dataset.auraBootState = "BOOT_IMPORT_FAILED";
  const root = document.querySelector("[data-aura-app]");
  if (root) {
    root.setAttribute("aria-busy", "false");
    root.innerHTML = `<section class="aura-login" data-aura-auth-state="BOOT_ERROR"><div class="aura-loading"><h1>No pudimos cargar Forge Aura</h1><p>Recarga la página para obtener la versión más reciente.</p></div></section>`;
  }
  console.error("AURA_BOOT_IMPORT_FAILED", error);
}
