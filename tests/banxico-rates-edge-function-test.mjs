import assert from "node:assert/strict";
import {
  BANXICO_SERIES,
  createBanxicoHandler,
  normalizeBanxicoSeries,
  parseBanxicoNumber,
} from "../supabase/functions/banxico-rates/logic.mjs";

const responseFor = (seriesId, value, date = "30/07/2026") => ({
  bmx: {
    series: [{
      idSerie: seriesId,
      titulo: seriesId === BANXICO_SERIES.UDI_MXN ? "Valor de UDIS" : "Tipo de cambio FIX",
      datos: [{ fecha: date, dato: value }],
    }],
  },
});

assert.equal(parseBanxicoNumber("8.912345"), 8.912345);
assert.equal(parseBanxicoNumber("17,123.45"), 17123.45);
assert.equal(parseBanxicoNumber("N/E"), null);

const normalized = normalizeBanxicoSeries(
  responseFor(BANXICO_SERIES.UDI_MXN, "8.912345"),
  BANXICO_SERIES.UDI_MXN,
);
assert.deepEqual(normalized, {
  seriesId: BANXICO_SERIES.UDI_MXN,
  title: "Valor de UDIS",
  date: "30/07/2026",
  value: 8.912345,
  source: "BANXICO_SIE_API",
  mode: "LATEST_VERIFIED",
});

const token = "test-token-never-returned";
const requested = [];
const fetchImpl = async (url, options) => {
  requested.push({ url, options });
  const seriesId = url.includes(BANXICO_SERIES.UDI_MXN)
    ? BANXICO_SERIES.UDI_MXN
    : BANXICO_SERIES.USD_MXN_FIX;
  const value = seriesId === BANXICO_SERIES.UDI_MXN ? "8.912345" : "18.7654";
  return new Response(JSON.stringify(responseFor(seriesId, value)), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};

const handler = createBanxicoHandler({
  getToken: () => token,
  fetchImpl,
  now: () => new Date("2026-07-31T05:20:00.000Z"),
});

const optionsResponse = await handler(new Request("https://example.test", { method: "OPTIONS" }));
assert.equal(optionsResponse.status, 204);
assert.equal(optionsResponse.headers.get("access-control-allow-origin"), "*");

const methodResponse = await handler(new Request("https://example.test", { method: "POST" }));
assert.equal(methodResponse.status, 405);
assert.equal((await methodResponse.json()).code, "METHOD_NOT_ALLOWED");

const response = await handler(new Request("https://example.test", { method: "GET" }));
assert.equal(response.status, 200);
const payload = await response.json();
assert.equal(payload.ok, true);
assert.equal(payload.rates.UDI_MXN.value, 8.912345);
assert.equal(payload.rates.USD_MXN_FIX.value, 18.7654);
assert.equal(payload.rates.UDI_MXN.source, "BANXICO_SIE_API");
assert.equal(payload.fetchedAt, "2026-07-31T05:20:00.000Z");
assert.equal(JSON.stringify(payload).includes(token), false);
assert.equal(requested.length, 2);
for (const request of requested) {
  assert.equal(request.options.headers["Bmx-Token"], token);
  assert.equal(request.options.cache, "no-store");
}

const missingSecretHandler = createBanxicoHandler({
  getToken: () => "",
  fetchImpl,
});
const missingSecretResponse = await missingSecretHandler(
  new Request("https://example.test", { method: "GET" }),
);
assert.equal(missingSecretResponse.status, 500);
assert.equal((await missingSecretResponse.json()).code, "BANXICO_TOKEN_NOT_CONFIGURED");

const upstreamHandler = createBanxicoHandler({
  getToken: () => token,
  fetchImpl: async () => new Response("upstream failed", { status: 503 }),
});
const upstreamResponse = await upstreamHandler(
  new Request("https://example.test", { method: "GET" }),
);
assert.equal(upstreamResponse.status, 502);
const upstreamPayload = await upstreamResponse.json();
assert.equal(upstreamPayload.code, "BANXICO_UPSTREAM_ERROR");
assert.equal(JSON.stringify(upstreamPayload).includes(token), false);

console.log("PASS Banxico rates Edge Function", {
  function: "banxico-rates",
  publicReadOnly: true,
  tokenIsServerSideOnly: true,
  series: Object.values(BANXICO_SERIES),
  cors: true,
  upstreamFailureBlocks: true,
});
