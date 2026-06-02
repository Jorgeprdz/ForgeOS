const fs = require("fs");
const { getCurrentRates } = require("./shared-banxico-rate-engine");

const CACHE_FILE = "forge-rate-cache.json";
const MAX_CACHE_AGE_HOURS = 12;

function hoursBetween(a, b) {
  return Math.abs(new Date(a) - new Date(b)) / 36e5;
}

function readCache() {
  if (!fs.existsSync(CACHE_FILE)) return null;
  return JSON.parse(fs.readFileSync(CACHE_FILE, "utf8"));
}

function writeCache(data) {
  fs.writeFileSync(CACHE_FILE, JSON.stringify(data, null, 2));
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

  const rates = await getCurrentRates();

  const payload = {
    cachedAt: now,
    rates,
    cacheStatus: "CACHE_REFRESHED"
  };

  writeCache(payload);

  return payload;
}

module.exports = {
  getCachedRates,
  readCache,
  writeCache
};
