function hasProductiveConfig() {
  const env = globalThis.__ENV__;
  return Boolean(env?.SUPABASE_URL && (env?.SUPABASE_KEY || env?.SUPABASE_ANON_KEY));
}

function pagesRootEnvUrl() {
  const marker = "/static-preview/forge-aura/";
  const pathname = globalThis.location?.pathname || "";
  const markerIndex = pathname.indexOf(marker);
  if (markerIndex < 0) return "";

  const projectBase = pathname.slice(0, markerIndex);
  if (!projectBase || projectBase === "/docs") return "";
  return `${globalThis.location.origin}${projectBase}/env.js`;
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.dataset.auraEnvFallback = "pages-root";
    script.onload = resolve;
    script.onerror = () => reject(new Error("AURA_PAGES_ENV_LOAD_FAILED"));
    document.head.append(script);
  });
}

if (!hasProductiveConfig()) {
  const rootEnv = pagesRootEnvUrl();
  if (rootEnv) {
    try {
      await loadScript(rootEnv);
    } catch {
      document.documentElement.dataset.auraEnvState = "ROOT_ENV_UNAVAILABLE";
    }
  }
}

document.documentElement.dataset.auraEnvState = hasProductiveConfig()
  ? "PRODUCTIVE_CONFIG_READY"
  : "PRODUCTIVE_CONFIG_BLOCKED";

await import("./app.js?v=oauth-implicit-v1");
