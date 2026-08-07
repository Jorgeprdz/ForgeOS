function hasProductiveConfig() {
  const env = globalThis.__ENV__;
  return Boolean(env?.SUPABASE_URL && (env?.SUPABASE_KEY || env?.SUPABASE_ANON_KEY));
}

document.documentElement.dataset.auraEnvState = hasProductiveConfig() ? "PRODUCTIVE_CONFIG_READY" : "PRODUCTIVE_CONFIG_BLOCKED";
await import("./app-v4.js?v=activity-reports-ux-001");
