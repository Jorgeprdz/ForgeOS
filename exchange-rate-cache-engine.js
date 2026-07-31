const fs = require("fs");
const path = require("path");
const { getCurrentRates } = require("./shared-banxico-rate-engine");
const { getCurrentRatesFromSupabaseEdge } = require("./shared-banxico-edge-provider");

const CACHE_FILE = "forge-rate-cache.json";
const MAX_CACHE_AGE_HOURS = 12;

function cacheFilePath() {
  const configured = String(process.env.FORGE_RATE_CACHE_FILE || "").trim();
  return configured ? path.resolve(configured) : CACHE_FILE;
}

function hoursBetween(a, b) {
  return Math.abs(new Date(a) - new Date(b)) / 36e5;
}

function readCache() {
  const file = cacheFilePath();
  if (!fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function writeCache(data) {
  const file = cacheFilePath();
  const directory = path.dirname(file);
  if (directory && directory !== ".") {
    fs.mkdirSync(directory, { recursive: true });
  }
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

async function getCurrentRatesWithConfiguredProvider() {
  if (process.env.SUPABASE_BANXICO_RATES_URL) {
    return getCurrentRatesFromSupabaseEdge();
  }

  return getCurrentRates();
}

async function getCachedRates({ forceRefresh = false } = {}) {
  const cache = readCache();
  const now = new Date().toISOString();

  if (!forceRefresh && cache && cache.cachedAt) {
    const age = hoursBetween(now, cache.cachedAt);

    if (age <= MAX_CACHE_AGE_HOURS) {
      return {
        ...cache,
        cacheStatus: "CACHE_HIT"
      };
    }
  }

  const rates = await getCurrentRatesWithConfiguredProvider();

  const payload = {
    cachedAt: now,
    rates,
    cacheStatus: "CACHE_REFRESHED"
  };

  writeCache(payload);

  return payload;
}

module.exports = {
  CACHE_FILE,
  cacheFilePath,
  getCachedRates,
  readCache,
  writeCache
};
