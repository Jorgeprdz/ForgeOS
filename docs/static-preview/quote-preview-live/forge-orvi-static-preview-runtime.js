import {
  buildOrviGuaranteedValueCheckpointAnalytics,
} from "./orvi-product-intelligence/analytics/orvi-guaranteed-value-checkpoint-analytics.js";
import {
  buildOrviDashboardOrchestrationReadiness,
  validateOrviDashboardOrchestrationReadiness,
} from "./orvi-product-intelligence/runtime/orvi-dashboard-orchestration-readiness.js";

export const ORVI_STATIC_PREVIEW_RUNTIME_ID =
  "orvi.static-preview.runtime-rate-bridge.v1";

export const ORVI_STATIC_PREVIEW_CACHE_FILE = "forge-rate-cache.json";

const ORVI_MODEL_ID = "forge.product_intelligence.orvi";
const SUPPORTED_CURRENCIES = new Set(["UDI", "USD"]);
const VERIFIED_CACHE_MODE = "LATEST_VERIFIED";
const ACCEPTED_CACHE_STATUSES = new Set([
  "CACHE_REFRESHED",
  "CACHE_HIT",
]);
const RATE_KEYS = Object.freeze({
  UDI: "UDI_MXN",
  USD: "USD_MXN_FIX",
});
const RATE_STATUSES = Object.freeze({
  UDI: "VERIFIED_UDI_RATE_AVAILABLE",
  USD: "VERIFIED_USD_FIX_RATE_AVAILABLE",
});

function isRecord(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function deepFreeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  Object.freeze(value);
  for (const child of Object.values(value)) deepFreeze(child);
  return value;
}

function finitePositive(value) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : null;
}

function normalizeText(value) {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  return normalized || null;
}

function normalizeKey(value) {
  return String(value || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function normalizeCurrency(value) {
  const normalized = String(value || "").trim().toUpperCase();
  return SUPPORTED_CURRENCIES.has(normalized) ? normalized : null;
}

function moneyValue(money) {
  if (!isRecord(money)) return null;
  const value = Number(money.value);
  return Number.isFinite(value) && value >= 0 ? value : null;
}

function productCandidates(packet = {}, nativeResult = {}) {
  const context = isRecord(packet.context) ? packet.context : {};
  return [
    packet.productFamily,
    packet.product_family,
    packet.family,
    packet.product,
    packet.productName,
    context.productFamily,
    context.product_family,
    context.family,
    context.product,
    context.productName,
    nativeResult.productFamily,
    nativeResult.product_family,
    nativeResult.family,
    nativeResult.product,
    nativeResult.productName,
    nativeResult.plan,
  ].filter(
    (value) => value !== null && value !== undefined && value !== "",
  );
}

function matchesOrvi(value) {
  const key = normalizeKey(value).replace(/\s+/g, "");
  return (
    key.includes("orvi") ||
    key.includes("orvi99") ||
    key.includes("ordinariodevida")
  );
}

function modelCandidates(packet = {}, nativeResult = {}) {
  return [
    packet.productIntelligence,
    packet.product_intelligence,
    packet.orviProductIntelligence,
    packet.orvi_product_intelligence,
    nativeResult.productIntelligence,
    nativeResult.product_intelligence,
    packet.context?.productIntelligence,
    packet.context?.product_intelligence,
  ].filter(Boolean);
}

export function resolveOrviProductIntelligence(
  packet = {},
  nativeResult = {},
) {
  return (
    modelCandidates(packet, nativeResult).find(
      (candidate) =>
        candidate?.schema?.id === ORVI_MODEL_ID &&
        candidate?.ownership?.canonical_owner === "product-intelligence",
    ) || null
  );
}

export function isOrviAcceptedQuotePacket(
  packet = {},
  nativeResult = {},
) {
  if (resolveOrviProductIntelligence(packet, nativeResult)) return true;
  return productCandidates(packet, nativeResult).some(matchesOrvi);
}

function cacheUrlCandidates() {
  return [
    new URL("./forge-rate-cache.json", import.meta.url).href,
    "../../quote-preview-live/forge-rate-cache.json",
    "../../../quote-preview-live/forge-rate-cache.json",
    "../../../forge-rate-cache.json",
    "/ForgeOS/static-preview/quote-preview-live/forge-rate-cache.json",
  ];
}

async function fetchJson(url) {
  if (typeof fetch !== "function") return null;
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) return null;
  return response.json();
}

export function createOrviBrowserRateProvider({
  cacheCandidates = cacheUrlCandidates(),
} = {}) {
  return async function orviBrowserRateProvider() {
    if (typeof globalThis.ForgeOrviRateProvider === "function") {
      return globalThis.ForgeOrviRateProvider();
    }
    if (isRecord(globalThis.ForgeQuoteRateCache)) {
      return globalThis.ForgeQuoteRateCache;
    }
    if (isRecord(globalThis.ForgeQuoteUdiRateCache)) {
      return globalThis.ForgeQuoteUdiRateCache;
    }

    for (const candidate of cacheCandidates) {
      try {
        const cache = await fetchJson(candidate);
        if (cache) return cache;
      } catch {
        // Public cache lookup is best-effort. Missing data blocks MXN output.
      }
    }
    return null;
  };
}

function explicitRateMetadata(packet, currency) {
  const candidates = [
    packet?.orviRateMetadata,
    packet?.orvi_rate_metadata,
    packet?.rate_metadata,
    packet?.rateMetadata,
    packet?.currencyMetadata,
    packet?.currency_metadata,
  ].filter(isRecord);

  const rateKey = RATE_KEYS[currency];
  return (
    candidates.find(
      (candidate) =>
        normalizeText(candidate.rate_key ?? candidate.rateKey) === rateKey,
    ) || null
  );
}

function normalizeExplicitRateMetadata(metadata, currency) {
  if (!isRecord(metadata)) return null;
  const rateKey = RATE_KEYS[currency];
  const value = finitePositive(metadata.value);
  const status = normalizeText(
    metadata.status ?? metadata.verification_status,
  );
  const source = normalizeText(metadata.source);
  const sourceDate = normalizeText(
    metadata.source_date ?? metadata.sourceDate ?? metadata.date,
  );
  const sourceMode = normalizeText(
    metadata.source_mode ?? metadata.sourceMode,
  )?.toUpperCase();

  if (
    normalizeText(metadata.rate_key ?? metadata.rateKey) !== rateKey ||
    value === null ||
    !status ||
    !source ||
    !sourceDate ||
    !["LIVE", "CACHE", "SYNTHETIC_TEST"].includes(sourceMode) ||
    metadata.stale !== false
  ) {
    return null;
  }

  return {
    status,
    rate_key: rateKey,
    value,
    source,
    source_date: sourceDate,
    source_mode: sourceMode,
    cache_status: normalizeText(
      metadata.cache_status ?? metadata.cacheStatus,
    ),
    stale: false,
    synthetic_test:
      sourceMode === "SYNTHETIC_TEST" &&
      (metadata.synthetic_test === true ||
        metadata.syntheticTest === true),
    series_id: normalizeText(
      metadata.series_id ?? metadata.seriesId,
    ),
    title: normalizeText(metadata.title),
  };
}

export function resolveVerifiedOrviRateMetadataFromCache({
  currency,
  cache,
} = {}) {
  const normalizedCurrency = normalizeCurrency(currency);
  if (!normalizedCurrency) {
    throw new TypeError("ORVI currency must be UDI or USD");
  }
  if (!isRecord(cache)) {
    throw new TypeError("verified public rate cache is required");
  }

  const rateKey = RATE_KEYS[normalizedCurrency];
  const rate = cache?.rates?.[rateKey];
  const cacheStatus = normalizeText(cache.cacheStatus);
  const value = finitePositive(rate?.value);
  const source = normalizeText(rate?.source);
  const sourceDate = normalizeText(rate?.date);
  const mode = normalizeText(rate?.mode);

  if (
    !isRecord(rate) ||
    value === null ||
    !source ||
    !sourceDate ||
    mode !== VERIFIED_CACHE_MODE ||
    !ACCEPTED_CACHE_STATUSES.has(cacheStatus) ||
    rate.stale === true ||
    cache.stale === true
  ) {
    throw new TypeError(
      `verified ${rateKey} cache entry is unavailable`,
    );
  }

  return deepFreeze({
    status: RATE_STATUSES[normalizedCurrency],
    rate_key: rateKey,
    value,
    source,
    source_date: sourceDate,
    source_mode: "CACHE",
    cache_status: cacheStatus,
    stale: false,
    synthetic_test: false,
    series_id: normalizeText(rate.seriesId),
    title: normalizeText(rate.title),
  });
}

function paymentCheckpoint(viewModel) {
  const paymentTerm = Number(viewModel?.payment_term_years);
  const checkpoints =
    viewModel?.views?.guaranteed_recovery?.checkpoints || [];
  return (
    checkpoints.find(
      (checkpoint) => checkpoint?.policy_year === paymentTerm,
    ) ||
    checkpoints[0] ||
    null
  );
}

function sourceProductName(packet, nativeResult) {
  return (
    normalizeText(nativeResult?.product) ||
    normalizeText(packet?.product) ||
    normalizeText(packet?.context?.product) ||
    "ORVI"
  );
}

export async function buildOrviAcceptedQuoteCalculation({
  packet = {},
  nativeResult = {},
  rateProvider = createOrviBrowserRateProvider(),
} = {}) {
  if (!isRecord(packet) || !isRecord(nativeResult)) {
    throw new TypeError("packet and nativeResult are required");
  }

  const model = resolveOrviProductIntelligence(packet, nativeResult);
  if (!model) {
    throw new TypeError(
      "ORVI canonical Product Intelligence is required",
    );
  }

  const currency = normalizeCurrency(model?.identity?.currency);
  if (!currency) {
    throw new TypeError("ORVI Product Intelligence currency is invalid");
  }

  const explicit = normalizeExplicitRateMetadata(
    explicitRateMetadata(packet, currency),
    currency,
  );
  const cache = explicit ? null : await rateProvider();
  const rateMetadata =
    explicit ||
    resolveVerifiedOrviRateMetadataFromCache({
      currency,
      cache,
    });

  const analytics =
    buildOrviGuaranteedValueCheckpointAnalytics(model);
  const readiness =
    buildOrviDashboardOrchestrationReadiness({
      model,
      analytics,
      rate_metadata: rateMetadata,
    });
  const validation =
    validateOrviDashboardOrchestrationReadiness(readiness);

  if (!validation.valid) {
    throw new TypeError(
      `ORVI dashboard readiness invalid: ${validation.errors.join(",")}`,
    );
  }

  const viewModel = readiness.consumer_payload.view_model;
  const checkpoint = paymentCheckpoint(viewModel);
  const sourceRecovery = checkpoint?.source_currency || {};
  const currentMxn = checkpoint?.current_mxn || {};
  const protection = viewModel?.views?.protection || {};

  const result = {
    runtimeId: ORVI_STATIC_PREVIEW_RUNTIME_ID,
    nativeResult: {
      ...nativeResult,
      product:
        nativeResult.product || sourceProductName(packet, nativeResult),
      productFamily: "orvi",
      product_family: "orvi",
      currency,
      paymentTerm:
        nativeResult.paymentTerm ||
        `${viewModel.payment_term_years} años`,
    },
    context: {
      ...(isRecord(packet.context) ? packet.context : {}),
      productFamily: "orvi",
      product_family: "orvi",
    },
    productFamily: "orvi",
    product: sourceProductName(packet, nativeResult),
    productIntelligence: model,
    currency,
    paymentYears: viewModel.payment_term_years,
    annualPremium:
      moneyValue(
        model?.guaranteed_value_timeline?.[0]?.total_annual_outflow,
      ) ?? null,
    totalContributed:
      moneyValue(sourceRecovery?.cumulative_paid),
    totalRecovery:
      moneyValue(sourceRecovery?.total_recovery),
    totalContributedMXN:
      moneyValue(currentMxn?.cumulative_paid),
    totalRecoveryMXN:
      moneyValue(currentMxn?.total_recovery),
    currentProtectionMXN:
      moneyValue(protection?.current_mxn_equivalence),
    orviRateMetadata: rateMetadata,
    rate_metadata: rateMetadata,
    orviDashboardReadiness: readiness,
    orvi_dashboard_readiness: readiness,
    orviDashboardViewModel: viewModel,
    orvi_dashboard_view_model: viewModel,
    accumulatedIncome: [],
    base: null,
    favorable: null,
    unfavorable: null,
    optionalCoverages: Array.isArray(nativeResult.optionalCoverages)
      ? nativeResult.optionalCoverages
      : [],
    recommendation: null,
    humanDecisionRequired: true,
  };

  return deepFreeze(result);
}

export function validateOrviStaticPreviewCalculation(result) {
  const errors = [];

  if (!isRecord(result)) errors.push("RESULT_NOT_OBJECT");
  if (result?.runtimeId !== ORVI_STATIC_PREVIEW_RUNTIME_ID) {
    errors.push("RUNTIME_ID_INVALID");
  }
  if (result?.productFamily !== "orvi") {
    errors.push("PRODUCT_FAMILY_INVALID");
  }
  if (
    result?.orviDashboardReadiness?.orchestration_id !==
    "orvi.dashboard.verified-rate-orchestration-readiness.v1"
  ) {
    errors.push("READINESS_INVALID");
  }
  if (
    result?.orviDashboardViewModel?.view_model_id !==
    "orvi.dashboard.dynamic-protection-recovery-view-model.v1"
  ) {
    errors.push("VIEW_MODEL_INVALID");
  }
  if (result?.orviRateMetadata?.stale !== false) {
    errors.push("RATE_STALE");
  }
  if (result?.recommendation !== null) {
    errors.push("RECOMMENDATION_NOT_AUTHORIZED");
  }
  if (result?.humanDecisionRequired !== true) {
    errors.push("HUMAN_DECISION_GATE_MISSING");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

const api = Object.freeze({
  runtimeId: ORVI_STATIC_PREVIEW_RUNTIME_ID,
  cacheFile: ORVI_STATIC_PREVIEW_CACHE_FILE,
  isOrviAcceptedQuotePacket,
  resolveOrviProductIntelligence,
  createOrviBrowserRateProvider,
  resolveVerifiedOrviRateMetadataFromCache,
  buildOrviAcceptedQuoteCalculation,
  validateOrviStaticPreviewCalculation,
});

globalThis.ForgeOrviStaticPreviewRuntime = api;
