const VERSION = "M05E-010";
const TARGET_SUFFIX = "/api/forge-market-rates";

function hasText(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function currentEnv() {
  return globalThis.__ENV__ || globalThis.window?.__ENV__ || {};
}

function edgeUrl() {
  const env = currentEnv();
  const base = String(env.SUPABASE_URL || "").trim().replace(/\/+$/, "");
  return base ? `${base}/functions/v1/banxico-rates` : null;
}

function isMarketRateRequest(input) {
  try {
    const raw = typeof input === "string" || input instanceof URL
      ? input
      : input?.url;
    const url = new URL(raw, globalThis.location?.href || "https://forge.invalid/");
    return url.pathname.endsWith(TARGET_SUFFIX);
  } catch {
    return false;
  }
}

function jsonResponse(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store, max-age=0",
    },
  });
}

function normalizeEdgePayload(payload) {
  if (payload?.ok !== true || !payload?.rates?.UDI_MXN) return payload;
  return {
    ok: true,
    cachedAt: payload.fetchedAt || new Date().toISOString(),
    cacheStatus: "LIVE_REFRESHED",
    functionVersion: payload.functionVersion || null,
    rates: payload.rates,
  };
}

function installPagesRateFetchBridge() {
  if (globalThis.__forgePagesRateFetchBridgeInstalled === true) return true;
  const originalFetch = globalThis.fetch?.bind(globalThis);
  if (typeof originalFetch !== "function") return false;

  globalThis.fetch = async function forgePagesRateFetch(input, init = {}) {
    if (!isMarketRateRequest(input)) return originalFetch(input, init);

    const url = edgeUrl();
    if (!url) return originalFetch(input, init);

    const env = currentEnv();
    const key = String(env.SUPABASE_KEY || "").trim();
    const headers = new Headers(init?.headers || {});
    headers.set("Accept", "application/json");
    if (hasText(key)) {
      headers.set("apikey", key);
      headers.set("Authorization", `Bearer ${key}`);
    }

    try {
      const response = await originalFetch(url, {
        method: "GET",
        cache: "no-store",
        headers,
      });
      const payload = await response.json();
      return jsonResponse(normalizeEdgePayload(payload), response.status);
    } catch {
      return originalFetch(input, init);
    }
  };

  globalThis.__forgePagesRateFetchBridgeInstalled = true;
  document.documentElement.dataset.forgePagesRateBridge = VERSION;
  return true;
}

installPagesRateFetchBridge();

globalThis.ForgePagesRateFetchBridgeM05E010 = Object.freeze({
  version: VERSION,
  edgeUrl,
  install: installPagesRateFetchBridge,
});

export {
  VERSION,
  edgeUrl,
  installPagesRateFetchBridge,
  isMarketRateRequest,
  normalizeEdgePayload,
};