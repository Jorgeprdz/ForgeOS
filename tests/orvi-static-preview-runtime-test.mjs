import assert from "node:assert/strict";

import {
  ORVI_STATIC_PREVIEW_RUNTIME_ID,
  buildOrviAcceptedQuoteCalculation,
  isOrviAcceptedQuotePacket,
  resolveVerifiedOrviRateMetadataFromCache,
  validateOrviStaticPreviewCalculation,
} from "../docs/static-preview/quote-preview-live/forge-orvi-static-preview-runtime.js";

function money(value, currency) {
  return {
    value,
    currency,
    truth_status: "source_provided",
    guarantee_status: "synthetic_test_only",
    source_path: "synthetic",
  };
}

function model(currency) {
  return {
    schema: {
      id: "forge.product_intelligence.orvi",
      version: "R15A",
    },
    identity: {
      product_type: "orvi",
      currency,
    },
    ownership: {
      canonical_owner: "product-intelligence",
      parser_ref:
        "product-intelligence/quotes/orvi-solucionline-pdf-text-parser.js",
      runtime_ref: null,
      renderer_ref: null,
    },
    premium_structure: {
      payment_term_years: 10,
    },
    protection_summary: {
      basic_sum_assured: money(50000, currency),
    },
    guaranteed_value_timeline: Array.from(
      { length: 20 },
      (_, index) => {
        const year = index + 1;
        const paying = year <= 10;
        return {
          policy_year: year,
          attained_age: 40 + year,
          annual_premium: money(paying ? 100 : 0, currency),
          additional_premium: money(paying ? 20 : 0, currency),
          total_annual_outflow: money(
            paying ? 120 : 0,
            currency,
          ),
          guaranteed_surrender_value: money(
            year * 500,
            currency,
          ),
          cash_value: money(year * 300, currency),
          total_recovery: money(year * 800, currency),
          source_status: "synthetic_confirmed",
        };
      },
    ),
    decision_scenarios: {
      recommendation: null,
      human_decision_required: true,
    },
  };
}

function cache() {
  return {
    cachedAt: "2099-01-01T00:00:00.000Z",
    rates: {
      UDI_MXN: {
        seriesId: "SYNTHETIC_UDI",
        title: "Synthetic UDI",
        date: "01/01/2099",
        value: 10,
        source: "SYNTHETIC_VERIFIED_CACHE",
        mode: "LATEST_VERIFIED",
      },
      USD_MXN_FIX: {
        seriesId: "SYNTHETIC_USD",
        title: "Synthetic USD FIX",
        date: "01/01/2099",
        value: 20,
        source: "SYNTHETIC_VERIFIED_CACHE",
        mode: "LATEST_VERIFIED",
      },
    },
    cacheStatus: "CACHE_REFRESHED",
  };
}

function packet(currency) {
  return {
    nativeResult: {
      product: "ORVI 99",
      productFamily: "orvi",
      currency,
      paymentTerm: "10 años",
    },
    context: {
      product: "ORVI 99",
      productFamily: "orvi",
    },
    productIntelligence: model(currency),
  };
}

assert.equal(isOrviAcceptedQuotePacket(packet("UDI")), true);
assert.equal(
  isOrviAcceptedQuotePacket({
    nativeResult: { product: "SeguBeca" },
    context: { productFamily: "segubeca" },
  }),
  false,
);

const udiMetadata =
  resolveVerifiedOrviRateMetadataFromCache({
    currency: "UDI",
    cache: cache(),
  });
assert.equal(udiMetadata.rate_key, "UDI_MXN");
assert.equal(udiMetadata.value, 10);
assert.equal(udiMetadata.source_mode, "CACHE");
assert.equal(udiMetadata.stale, false);

const usdMetadata =
  resolveVerifiedOrviRateMetadataFromCache({
    currency: "USD",
    cache: cache(),
  });
assert.equal(usdMetadata.rate_key, "USD_MXN_FIX");
assert.equal(usdMetadata.value, 20);

const udi = await buildOrviAcceptedQuoteCalculation({
  packet: packet("UDI"),
  nativeResult: packet("UDI").nativeResult,
  rateProvider: async () => cache(),
});
assert.equal(udi.runtimeId, ORVI_STATIC_PREVIEW_RUNTIME_ID);
assert.deepEqual(validateOrviStaticPreviewCalculation(udi), {
  valid: true,
  errors: [],
});
assert.equal(udi.productFamily, "orvi");
assert.equal(udi.currency, "UDI");
assert.equal(
  udi.orviDashboardReadiness.readiness.status,
  "READY_FOR_REUSABLE_TEMPLATE_PRODUCT_ADAPTER",
);
assert.deepEqual(
  udi.orviDashboardViewModel.checkpoint_years,
  [10, 15, 20],
);
assert.equal(
  udi.orviDashboardViewModel.disclosure_contract.future_udi_mxn,
  "PROJECTED_UDI_4_5_PERCENT_SCENARIO_NOT_GUARANTEED",
);
assert.equal(udi.recommendation, null);

const usd = await buildOrviAcceptedQuoteCalculation({
  packet: packet("USD"),
  nativeResult: packet("USD").nativeResult,
  rateProvider: async () => cache(),
});
assert.deepEqual(validateOrviStaticPreviewCalculation(usd), {
  valid: true,
  errors: [],
});
assert.equal(usd.currency, "USD");
assert.equal(
  usd.orviDashboardViewModel.disclosure_contract.future_usd_mxn,
  "BLOCKED_PENDING_EXPLICIT_SCENARIO_RATE_AUTHORITY",
);

assert.throws(
  () =>
    resolveVerifiedOrviRateMetadataFromCache({
      currency: "UDI",
      cache: {
        ...cache(),
        stale: true,
      },
    }),
  /unavailable/i,
);

console.log("PASS R15L ORVI static-preview runtime rate bridge", {
  runtimeId: udi.runtimeId,
  udiRateKey: udi.orviRateMetadata.rate_key,
  usdRateKey: usd.orviRateMetadata.rate_key,
  checkpointYears: udi.orviDashboardViewModel.checkpoint_years,
  udiFuture:
    udi.orviDashboardViewModel.disclosure_contract.future_udi_mxn,
  usdFuture:
    usd.orviDashboardViewModel.disclosure_contract.future_usd_mxn,
  recommendation: udi.recommendation,
});
