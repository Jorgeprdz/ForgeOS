const FUNCTION_VERSION = "banxico-rates-v1";

const BANXICO_SERIES = Object.freeze({
  UDI_MXN: "SP68257",
  USD_MXN_FIX: "SF43718",
});

const CORS_HEADERS = Object.freeze({
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
});

function jsonResponse(body, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...CORS_HEADERS,
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store, max-age=0",
      ...extraHeaders,
    },
  });
}

function safeMessage(error) {
  const message = String(error?.message || error || "Unknown Banxico provider error");
  return message
    .replace(/[a-f0-9]{48,}/gi, "[secret-redacted]")
    .replace(/Bmx-Token\s*[:=]\s*\S+/gi, "Bmx-Token=[secret-redacted]")
    .slice(0, 240);
}

function parseBanxicoNumber(value) {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  const normalized = String(value ?? "")
    .trim()
    .replace(/,/g, "");
  if (!normalized || /^(N\/E|N\.D\.|NA|null)$/i.test(normalized)) return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeBanxicoSeries(payload, expectedSeriesId) {
  const series = payload?.bmx?.series;
  if (!Array.isArray(series) || series.length === 0) {
    throw new Error(`Banxico response missing series for ${expectedSeriesId}`);
  }

  const selected = series.find((item) => item?.idSerie === expectedSeriesId) || series[0];
  const latest = Array.isArray(selected?.datos) ? selected.datos[0] : null;
  const value = parseBanxicoNumber(latest?.dato);
  const date = String(latest?.fecha || "").trim();

  if (value === null || !date) {
    throw new Error(`Banxico response missing a current numeric value for ${expectedSeriesId}`);
  }

  return Object.freeze({
    seriesId: expectedSeriesId,
    title: String(selected?.titulo || expectedSeriesId),
    date,
    value,
    source: "BANXICO_SIE_API",
    mode: "LATEST_VERIFIED",
  });
}

async function fetchBanxicoLatest({ seriesId, token, fetchImpl = globalThis.fetch }) {
  if (!token) throw new Error("BANXICO_TOKEN_NOT_CONFIGURED");
  if (typeof fetchImpl !== "function") throw new Error("BANXICO_FETCH_NOT_AVAILABLE");

  const endpoint = `https://www.banxico.org.mx/SieAPIRest/service/v1/series/${seriesId}/datos/oportuno`;
  const response = await fetchImpl(endpoint, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Bmx-Token": token,
    },
    cache: "no-store",
  });

  const text = await response.text();
  if (!response.ok) {
    throw new Error(`Banxico request failed for ${seriesId} with status ${response.status}`);
  }

  let payload;
  try {
    payload = JSON.parse(text);
  } catch {
    throw new Error(`Banxico returned invalid JSON for ${seriesId}`);
  }

  return normalizeBanxicoSeries(payload, seriesId);
}

async function getCurrentRates({ token, fetchImpl = globalThis.fetch } = {}) {
  const [udi, usdFix] = await Promise.all([
    fetchBanxicoLatest({ seriesId: BANXICO_SERIES.UDI_MXN, token, fetchImpl }),
    fetchBanxicoLatest({ seriesId: BANXICO_SERIES.USD_MXN_FIX, token, fetchImpl }),
  ]);

  return Object.freeze({
    UDI_MXN: udi,
    USD_MXN_FIX: usdFix,
  });
}

function createBanxicoHandler({
  getToken,
  fetchImpl = globalThis.fetch,
  now = () => new Date(),
} = {}) {
  if (typeof getToken !== "function") {
    throw new TypeError("createBanxicoHandler requires getToken");
  }

  return async function banxicoRatesHandler(request) {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    if (request.method !== "GET") {
      return jsonResponse({
        ok: false,
        code: "METHOD_NOT_ALLOWED",
        error: "Use GET to read current Banxico rates.",
      }, 405, { Allow: "GET, OPTIONS" });
    }

    const token = String(getToken() || "").trim();
    if (!token) {
      return jsonResponse({
        ok: false,
        code: "BANXICO_TOKEN_NOT_CONFIGURED",
        error: "Banxico provider secret is not configured.",
        functionVersion: FUNCTION_VERSION,
      }, 500);
    }

    try {
      const rates = await getCurrentRates({ token, fetchImpl });
      return jsonResponse({
        ok: true,
        fetchedAt: now().toISOString(),
        functionVersion: FUNCTION_VERSION,
        rates,
      });
    } catch (error) {
      return jsonResponse({
        ok: false,
        code: "BANXICO_UPSTREAM_ERROR",
        error: safeMessage(error),
        functionVersion: FUNCTION_VERSION,
      }, 502);
    }
  };
}

export {
  BANXICO_SERIES,
  CORS_HEADERS,
  FUNCTION_VERSION,
  createBanxicoHandler,
  fetchBanxicoLatest,
  getCurrentRates,
  normalizeBanxicoSeries,
  parseBanxicoNumber,
  safeMessage,
};
