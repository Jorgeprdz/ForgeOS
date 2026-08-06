function hasProductiveConfig() {
  const env = globalThis.__ENV__;
  return Boolean(env?.SUPABASE_URL && (env?.SUPABASE_KEY || env?.SUPABASE_ANON_KEY));
}
function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
}
function renderFatalBoot(error) {
  const root = document.querySelector("[data-aura-app]");
  const diagnostic = [error?.name, error?.message].filter(Boolean).join(" · ") || "Error desconocido";
  document.documentElement.dataset.auraBootState = "BOOT_FAILED_VISIBLE";
  if (!root) return;
  root.setAttribute("aria-busy", "false");
  root.innerHTML = `<main style="min-height:100vh;display:grid;place-items:center;padding:24px;background:#f4f5fb;font-family:system-ui,sans-serif"><section style="max-width:680px;padding:28px;border:1px solid #d9dce8;border-radius:24px;background:#fff"><p style="font-weight:800;color:#6d7285">Forge · diagnóstico de arranque</p><h1>No se pudo iniciar Aura</h1><p>La publicación cargó, pero una dependencia falló. El error ya no queda oculto en una pantalla blanca.</p><code>${escapeHtml(diagnostic)}</code></section></main>`;
}
document.documentElement.dataset.auraEnvState = hasProductiveConfig() ? "PRODUCTIVE_CONFIG_READY" : "PRODUCTIVE_CONFIG_BLOCKED";
try {
  await import("./app-v4.js?v=activity-pages-runtime-fix-004");
  document.documentElement.dataset.auraBootState = "BOOT_READY";
} catch (error) {
  console.error("FORGE_AURA_BOOT_FAILED", error);
  renderFatalBoot(error);
}
