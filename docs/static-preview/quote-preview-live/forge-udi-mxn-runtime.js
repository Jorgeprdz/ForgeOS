import {
  buildUdiProjectionTimeline,
  getVerifiedUdiRateMetadata
} from "./forge-quote-calculators.js";

const DEFAULT_SAVINGS_UDI_GROWTH_RATE = 0.04;
const DEFAULT_MAX_POLICY_YEAR = 20;

function finiteNumber(value) {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  const parsed = Number(String(value).replace(/[^0-9.\-]/g, ""));
  return Number.isFinite(parsed) ? parsed : null;
}

function firstNumber(...values) {
  for (const value of values) {
    const parsed = finiteNumber(value);
    if (parsed !== null) return parsed;
  }
  return null;
}

async function fetchJson(url) {
  if (typeof fetch !== "function") return null;
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) return null;
  return response.json();
}

function cacheUrlCandidates() {
  const moduleCacheUrl = new URL("./forge-rate-cache.json", import.meta.url).href;
  return [
    moduleCacheUrl,
    "../../quote-preview-live/forge-rate-cache.json",
    "../../../quote-preview-live/forge-rate-cache.json",
    "../../../forge-rate-cache.json",
    "/ForgeOS/static-preview/quote-preview-live/forge-rate-cache.json"
  ];
}

function createBrowserUdiRateProvider({ cacheCandidates = cacheUrlCandidates() } = {}) {
  return async function browserUdiRateProvider107z15p2R11F2() {
    if (globalThis.ForgeQuoteUdiRateCache) return globalThis.ForgeQuoteUdiRateCache;

    for (const cacheUrl of cacheCandidates) {
      try {
        const cache = await fetchJson(cacheUrl);
        if (cache) return cache;
      } catch (error) {
        // Public cache lookup is best-effort; missing cache must not block the UI.
      }
    }

    return null;
  };
}

function normalizeMetadata(metadata) {
  if (!metadata || typeof metadata !== "object") {
    return {
      status: "BLOCKED_NO_VERIFIED_UDI_RATE",
      currentUdiValue: null,
      source: "not_available",
      sourceDate: null,
      sourceMode: null
    };
  }

  return {
    ...metadata,
    currentUdiValue: firstNumber(
      metadata.currentUdiValue,
      metadata.udiValue,
      metadata.value,
      metadata.rate
    )
  };
}

function projectionRowsFromTimeline(timeline) {
  return Array.isArray(timeline)
    ? timeline.map((entry) => ({
        year: entry.policyYear,
        policyYear: entry.policyYear,
        projectedUdiValue: entry.projectedUdiValue,
        growthRate: entry.growthRate
      }))
    : [];
}

function createForgeUdiMxnRuntime({
  rateProvider = createBrowserUdiRateProvider(),
  annualGrowthRate = DEFAULT_SAVINGS_UDI_GROWTH_RATE,
  maxPolicyYear = DEFAULT_MAX_POLICY_YEAR
} = {}) {
  let metadataPromise = null;

  async function getCurrentUdiMetadata({ force = false } = {}) {
    if (!metadataPromise || force) {
      metadataPromise = getVerifiedUdiRateMetadata({ rateProvider })
        .then(normalizeMetadata)
        .catch(() => normalizeMetadata(null));
    }
    return metadataPromise;
  }

  async function getCurrentUdiValue(options) {
    const metadata = await getCurrentUdiMetadata(options);
    return metadata.currentUdiValue;
  }

  async function buildProjection({ policyYears = maxPolicyYear, growthRate = annualGrowthRate } = {}) {
    const metadata = await getCurrentUdiMetadata();
    if (!metadata.currentUdiValue) {
      return {
        status: "BLOCKED_NO_VERIFIED_UDI_RATE",
        timeline: [],
        rows: [],
        annualGrowthRate: growthRate,
        source: "FORGE_UDI_PROJECTION_ENGINE"
      };
    }

    const timeline = buildUdiProjectionTimeline({
      baseUdiValue: metadata.currentUdiValue,
      baseAge: 1,
      maxAge: Math.max(1, Number(policyYears) || maxPolicyYear),
      annualGrowthRate: growthRate
    });

    const rows = projectionRowsFromTimeline(timeline);
    return {
      status: "READY",
      timeline,
      rows,
      projectionRows: rows,
      annualGrowthRate: growthRate,
      source: "FORGE_UDI_PROJECTION_ENGINE",
      baseUdi: {
        value: metadata.currentUdiValue,
        source: metadata.source,
        date: metadata.sourceDate
      }
    };
  }

  async function projectUdiValueForPolicyYear(policyYear, options = {}) {
    const projection = await buildProjection(options);
    const year = firstNumber(policyYear);
    const match = projection.rows.find((row) => row.policyYear === year || row.year === year);
    return match?.projectedUdiValue ?? null;
  }

  async function convertUdiToCurrentMxn(udiAmount) {
    const amount = finiteNumber(udiAmount);
    const currentUdiValue = await getCurrentUdiValue();
    return amount !== null && currentUdiValue !== null ? amount * currentUdiValue : null;
  }

  async function convertUdiToProjectedMxn(udiAmount, policyYear, options = {}) {
    const amount = finiteNumber(udiAmount);
    const projectedUdiValue = await projectUdiValueForPolicyYear(policyYear, options);
    return amount !== null && projectedUdiValue !== null ? amount * projectedUdiValue : null;
  }

  async function enrichAcceptedQuotePacket(packet = {}) {
    const metadata = await getCurrentUdiMetadata();
    const nativeResult = packet.nativeResult && typeof packet.nativeResult === "object"
      ? packet.nativeResult
      : {};
    const paymentYears = firstNumber(
      nativeResult.paymentYears,
      nativeResult.premiumPayingYears,
      nativeResult.paymentTerm,
      nativeResult.policyTerm,
      nativeResult.coveragePeriod,
      packet.paymentYears,
      packet.coveragePeriod,
      maxPolicyYear
    ) ?? maxPolicyYear;
    const projection = await buildProjection({ policyYears: paymentYears });

    return {
      ...packet,
      currencyMetadata: metadata,
      udiRateMetadata: metadata,
      udiProjection: projection,
      nativeResult: {
        ...nativeResult,
        currencyMetadata: metadata,
        udiRateMetadata: metadata,
        udiProjection: projection,
        udiProjectionRows: projection.rows
      }
    };
  }

  return Object.freeze({
    getCurrentUdiMetadata,
    getCurrentUdiValue,
    buildProjection,
    projectUdiValueForPolicyYear,
    convertUdiToCurrentMxn,
    convertUdiToProjectedMxn,
    enrichAcceptedQuotePacket,
    rateProvider,
    projectionDefaults: Object.freeze({
      annualGrowthRate,
      maxPolicyYear
    })
  });
}

const runtime = createForgeUdiMxnRuntime();

globalThis.ForgeQuoteUdiRateProvider = runtime.rateProvider;
globalThis.ForgeUdiMxnRuntime = runtime;
globalThis.dispatchEvent?.(new CustomEvent("forge:udi-mxn-runtime-ready", { detail: runtime }));

export {
  createBrowserUdiRateProvider,
  createForgeUdiMxnRuntime
};
