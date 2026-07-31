#!/usr/bin/env node
"use strict";

const http = require("http");
const fs = require("fs");
const os = require("os");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const HOST = process.env.FORGE_UI_HOST || "127.0.0.1";
const PORT = Number(process.env.FORGE_UI_PORT || 4173);
const REFRESH_INTERVAL_MS = 6 * 60 * 60 * 1000;
const BANXICO_EDGE_FUNCTION_NAME = "banxico-rates";
const LIVE_RATE_CACHE_FILE = process.env.FORGE_RATE_CACHE_FILE || path.join(
  os.homedir(),
  ".cache",
  "forgeos",
  "market-rates.json",
);

process.env.FORGE_RATE_CACHE_FILE = LIVE_RATE_CACHE_FILE;
const { getCachedRates } = require("../exchange-rate-cache-engine");

const MIME = Object.freeze({
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".webp": "image/webp",
});

function sendJson(response, status, payload) {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store, max-age=0",
    "Access-Control-Allow-Origin": "*",
  });
  response.end(JSON.stringify(payload));
}

function publicError(error) {
  const message = error?.message || String(error);
  if (/BANXICO_TOKEN/.test(message)) {
    return "No hay proveedor Banxico configurado. Falta configuración Supabase o BANXICO_TOKEN local.";
  }
  if (/401|403|unauthorized|jwt/i.test(message)) {
    return "La función Supabase banxico-rates requiere la anon key pública y env.js no la contiene.";
  }
  if (/404|not found/i.test(message)) {
    return "La función Supabase banxico-rates no está desplegada en el proyecto configurado.";
  }
  return message.replace(/[a-f0-9]{48,}/gi, "[secret-redacted]");
}

function parsePublicEnvJs(source) {
  const match = String(source || "").match(
    /(?:window|globalThis)\.__ENV__\s*=\s*Object\.freeze\((\{[\s\S]*\})\)\s*;?/,
  );
  if (!match) return null;
  try {
    return JSON.parse(match[1]);
  } catch {
    return null;
  }
}

function discoverSupabaseUrlFromPagesWorkflow() {
  const candidates = [
    path.join(ROOT, ".github", "workflows", "pages.yml"),
    path.join(ROOT, ".github", "workflows", "pages.yaml"),
  ];

  for (const workflowPath of candidates) {
    if (!fs.existsSync(workflowPath)) continue;
    const source = fs.readFileSync(workflowPath, "utf8");
    const match = source.match(/([a-z0-9]{10,})\.supabase\.co/i);
    if (match) return `https://${match[1]}.supabase.co`;
  }

  return null;
}

function configureSupabaseProvider({ supabaseUrl, anonKey, source }) {
  const normalizedUrl = String(supabaseUrl || "").trim().replace(/\/+$/, "");
  if (!normalizedUrl) {
    return Object.freeze({ configured: false, source, url: null });
  }

  const edgeUrl = `${normalizedUrl}/functions/v1/${BANXICO_EDGE_FUNCTION_NAME}`;
  process.env.SUPABASE_BANXICO_RATES_URL = edgeUrl;
  if (anonKey && !process.env.SUPABASE_ANON_KEY) {
    process.env.SUPABASE_ANON_KEY = anonKey;
  }

  return Object.freeze({ configured: true, source, url: edgeUrl });
}

function loadPublicMarketProviderFromEnvJs() {
  if (process.env.SUPABASE_BANXICO_RATES_URL) {
    return Object.freeze({
      configured: true,
      source: "PROCESS_ENV",
      url: process.env.SUPABASE_BANXICO_RATES_URL,
    });
  }

  const envPath = path.join(ROOT, "env.js");
  const config = fs.existsSync(envPath)
    ? parsePublicEnvJs(fs.readFileSync(envPath, "utf8"))
    : null;
  const envSupabaseUrl = String(config?.SUPABASE_URL || "").trim();
  const anonKey = String(
    config?.SUPABASE_KEY || config?.SUPABASE_ANON_KEY || "",
  ).trim();

  if (envSupabaseUrl) {
    return configureSupabaseProvider({
      supabaseUrl: envSupabaseUrl,
      anonKey,
      source: "ENV_JS",
    });
  }

  const workflowSupabaseUrl = discoverSupabaseUrlFromPagesWorkflow();
  if (workflowSupabaseUrl) {
    return configureSupabaseProvider({
      supabaseUrl: workflowSupabaseUrl,
      anonKey,
      source: "PAGES_WORKFLOW",
    });
  }

  return Object.freeze({
    configured: false,
    source: fs.existsSync(envPath)
      ? "ENV_JS_SUPABASE_URL_MISSING"
      : "ENV_JS_NOT_FOUND",
    url: null,
  });
}

async function currentRates({ forceRefresh = false } = {}) {
  const cache = await getCachedRates({ forceRefresh });
  return {
    ok: true,
    cachedAt: cache.cachedAt,
    cacheStatus: cache.cacheStatus,
    rates: cache.rates,
  };
}

function safeFilePath(urlPath) {
  const decoded = decodeURIComponent(urlPath.split("?")[0]);
  const relative = decoded.replace(/^\/+/, "");
  const candidate = path.resolve(ROOT, relative || "index.html");
  if (candidate !== ROOT && !candidate.startsWith(`${ROOT}${path.sep}`)) {
    return null;
  }
  return candidate;
}

async function serveFile(request, response) {
  let filePath = safeFilePath(request.url || "/");
  if (!filePath) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  try {
    const stat = await fs.promises.stat(filePath);
    if (stat.isDirectory()) filePath = path.join(filePath, "index.html");
    const data = await fs.promises.readFile(filePath);
    response.writeHead(200, {
      "Content-Type": MIME[path.extname(filePath).toLowerCase()] || "application/octet-stream",
      "Cache-Control": "no-store, max-age=0, must-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    });
    response.end(data);
  } catch (error) {
    response.writeHead(error?.code === "ENOENT" ? 404 : 500, {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    });
    response.end(error?.code === "ENOENT" ? "Not found" : publicError(error));
  }
}

async function handler(request, response) {
  const pathname = new URL(
    request.url || "/",
    `http://${request.headers.host || `${HOST}:${PORT}`}`,
  ).pathname;
  if (pathname === "/api/forge-market-rates") {
    try {
      sendJson(response, 200, await currentRates());
    } catch (error) {
      sendJson(response, 503, {
        ok: false,
        code: "BANXICO_RATE_REFRESH_FAILED",
        error: publicError(error),
      });
    }
    return;
  }
  await serveFile(request, response);
}

async function main() {
  process.chdir(ROOT);
  const provider = loadPublicMarketProviderFromEnvJs();
  console.log(`MARKET_RATE_PROVIDER=${provider.source}`);
  console.log(`MARKET_RATE_PROVIDER_CONFIGURED=${provider.configured}`);
  console.log(`RATE_CACHE_FILE=${LIVE_RATE_CACHE_FILE}`);

  const initial = await currentRates({ forceRefresh: true });
  const udi = initial.rates?.UDI_MXN;
  if (!udi?.value || !udi?.date) {
    throw new Error("Banxico no devolvió una UDI verificable.");
  }

  const server = http.createServer((request, response) => {
    void handler(request, response).catch((error) => {
      sendJson(response, 500, { ok: false, error: publicError(error) });
    });
  });

  server.listen(PORT, HOST, () => {
    console.log("FORGE_LIVE_SERVER=READY");
    console.log(`URL=http://${HOST}:${PORT}`);
    console.log(`UDI_MXN=${udi.value}`);
    console.log(`UDI_DATE=${udi.date}`);
    console.log(`UDI_SOURCE=${udi.source}`);
  });

  const refreshTimer = setInterval(() => {
    void currentRates({ forceRefresh: true })
      .then((result) => {
        const refreshed = result.rates?.UDI_MXN;
        console.log(
          `UDI_REFRESHED=${refreshed?.date || "unknown"}:${refreshed?.value || "blocked"}`,
        );
      })
      .catch((error) =>
        console.error(`UDI_REFRESH_FAILED=${publicError(error)}`),
      );
  }, REFRESH_INTERVAL_MS);
  refreshTimer.unref?.();

  const stop = () => server.close(() => process.exit(0));
  process.on("SIGINT", stop);
  process.on("SIGTERM", stop);
}

main().catch((error) => {
  console.error("FORGE_LIVE_SERVER=FAILED");
  console.error(publicError(error));
  process.exitCode = 1;
});
