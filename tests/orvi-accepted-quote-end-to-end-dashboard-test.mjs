import assert from "node:assert/strict";

import {
  calculateAcceptedQuote,
} from "../docs/static-preview/quote-preview-live/forge-accepted-quote-adapter.js";
import {
  buildOrviDashboardModel,
  renderOrviDashboard,
} from "../docs/static-preview/quote-preview-live/forge-orvi-product-dashboard-adapter.js";

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

function fakeDocument() {
  return {
    createElement(tag) {
      return {
        tagName: String(tag).toUpperCase(),
        className: "",
        dataset: {},
        children: [],
        textContent: "",
        innerHTML: "",
        append(...nodes) {
          this.children.push(...nodes);
        },
        appendChild(node) {
          this.children.push(node);
          return node;
        },
      };
    },
  };
}

let providerCalls = 0;
globalThis.ForgeOrviRateProvider = async () => {
  providerCalls += 1;
  return cache();
};

const calculation = await calculateAcceptedQuote(packet("UDI"));
assert.equal(providerCalls, 1);
assert.equal(calculation.productFamily, "orvi");
assert.equal(calculation.currency, "UDI");
assert.equal(
  calculation.orviDashboardReadiness.orchestration_id,
  "orvi.dashboard.verified-rate-orchestration-readiness.v1",
);
assert.equal(
  calculation.orviDashboardViewModel.view_model_id,
  "orvi.dashboard.dynamic-protection-recovery-view-model.v1",
);
assert.deepEqual(
  calculation.orviDashboardViewModel.checkpoint_years,
  [10, 15, 20],
);

const dashboardModel = buildOrviDashboardModel(calculation);
assert.equal(
  dashboardModel.adapterId,
  "orvi.reusable-product-dashboard-adapter.v1",
);
assert.equal(dashboardModel.layout, "orvi_dynamic_r15k");
assert.equal(
  dashboardModel.sections.filter(
    (section) => section.kind === "guaranteed_recovery",
  ).length,
  3,
);

const dashboard = renderOrviDashboard(dashboardModel, {
  documentRef: fakeDocument(),
});
assert.equal(dashboard.className, "fq-benefit-dashboard-107z15p2");
assert.equal(dashboard.dataset.forgeProductType, "orvi");
assert.equal(
  dashboard.dataset.forgeProductTemplate,
  "vida_mujer_reusable",
);
assert.equal(calculation.recommendation, null);

delete globalThis.ForgeOrviRateProvider;

console.log("PASS R15L ORVI accepted quote end-to-end dashboard", {
  rateProviderCalls: providerCalls,
  productFamily: calculation.productFamily,
  checkpointYears:
    calculation.orviDashboardViewModel.checkpoint_years,
  adapterId: dashboardModel.adapterId,
  layout: dashboardModel.layout,
  sharedDashboardClass: dashboard.className,
  recommendation: calculation.recommendation,
});
