import assert from "node:assert/strict";

import {
  ORVI_PRODUCT_DASHBOARD_ADAPTER_ID,
  ORVI_PRODUCT_DASHBOARD_LAYOUT,
  ORVI_PRODUCT_TYPE,
  buildOrviDashboardModel,
  formatOrviMoney,
  isOrviProduct,
  renderOrviDashboard,
  resolveOrviDashboardViewModel,
} from "../docs/static-preview/quote-preview-live/forge-orvi-product-dashboard-adapter.js";

function createFakeDocument() {
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

function money(value, currency, status = "available") {
  return { value, currency, status };
}

function checkpoint(policyYear, sourceCurrency) {
  const sourcePaid = 1200;
  const sourceRecovery = policyYear * 800;
  const currentRate = sourceCurrency === "UDI" ? 10 : 20;
  const currentPaid = sourcePaid * currentRate;
  const currentRecovery = sourceRecovery * currentRate;

  return {
    checkpoint_id: `policy_year_${policyYear}`,
    policy_year: policyYear,
    attained_age: 40 + policyYear,
    payment_phase:
      policyYear === 10 ? "payment_completion" : "post_payment",
    analytics_status: "complete",
    source_currency: {
      cumulative_paid: money(sourcePaid, sourceCurrency),
      surrender_value: money(policyYear * 500, sourceCurrency),
      cash_value: money(policyYear * 300, sourceCurrency),
      total_recovery: money(sourceRecovery, sourceCurrency),
      recovery_difference: money(
        sourceRecovery - sourcePaid,
        sourceCurrency,
      ),
      recovery_ratio: sourceRecovery / sourcePaid,
      recovery_percentage: (sourceRecovery / sourcePaid) * 100,
      interpretation: "comparison_only_not_investment_return",
    },
    current_mxn: {
      status: "complete",
      cumulative_paid: money(currentPaid, "MXN"),
      surrender_value: money(policyYear * 500 * currentRate, "MXN"),
      cash_value: money(policyYear * 300 * currentRate, "MXN"),
      total_recovery: money(currentRecovery, "MXN"),
      recovery_difference: money(
        currentRecovery - currentPaid,
        "MXN",
      ),
      recovery_ratio: currentRecovery / currentPaid,
      recovery_percentage: (currentRecovery / currentPaid) * 100,
      interpretation: "comparison_only_not_investment_return",
    },
    future_mxn:
      sourceCurrency === "USD"
        ? {
            status:
              "BLOCKED_PENDING_EXPLICIT_SCENARIO_RATE_AUTHORITY",
            scenario_label: null,
            projected_rate: null,
            cumulative_paid: null,
            surrender_value: null,
            cash_value: null,
            total_recovery: null,
            recovery_difference: null,
            recovery_ratio: null,
            recovery_percentage: null,
            future_values_are_guaranteed: false,
          }
        : {
            status: "complete",
            scenario_label:
              "PROJECTED_UDI_4_5_PERCENT_SCENARIO_NOT_GUARANTEED",
            projected_rate: {
              policy_year: policyYear,
              years_from_base: policyYear - 1,
              value: 10 * 1.045 ** (policyYear - 1),
              currency: "MXN_PER_UDI",
            },
            cumulative_paid: money(14745.85, "MXN"),
            surrender_value: money(policyYear * 6000, "MXN"),
            cash_value: money(policyYear * 4000, "MXN"),
            total_recovery: money(policyYear * 11888.761, "MXN"),
            recovery_difference: money(
              policyYear * 11888.761 - 14745.85,
              "MXN",
            ),
            recovery_ratio:
              (policyYear * 11888.761) / 14745.85,
            recovery_percentage:
              ((policyYear * 11888.761) / 14745.85) * 100,
            future_values_are_guaranteed: false,
          },
  };
}

function viewModel(currency) {
  const checkpointYears = [10, 15, 20];
  const currentRate = currency === "UDI" ? 10 : 20;

  return {
    view_model_id:
      "orvi.dashboard.dynamic-protection-recovery-view-model.v1",
    contract_version: "R15I",
    canonical_owner: "product-intelligence",
    consumer_surface: "dashboard_contract_only",
    source_currency: currency,
    payment_term_years: 10,
    checkpoint_years: checkpointYears,
    navigation: [
      { view_id: "protection", label: "Protección", order: 1 },
      {
        view_id: "guaranteed_recovery",
        label: "Recuperación garantizada",
        order: 2,
      },
    ],
    rate_context: {
      rate_key: currency === "UDI" ? "UDI_MXN" : "USD_MXN_FIX",
      source: "SYNTHETIC_TEST_PROVIDER",
      source_date: "2099-01-01",
      source_mode: "SYNTHETIC_TEST",
      stale: false,
    },
    views: {
      protection: {
        view_id: "protection",
        title: "Protección",
        source_sum_assured: money(50000, currency),
        current_mxn_equivalence: money(50000 * currentRate, "MXN"),
        future_checkpoint_scenarios: checkpointYears.map(
          (policyYear) =>
            currency === "USD"
              ? {
                  policy_year: policyYear,
                  status:
                    "BLOCKED_PENDING_EXPLICIT_SCENARIO_RATE_AUTHORITY",
                  projected_rate: null,
                  projected_sum_assured_mxn: null,
                  annual_growth_rate: null,
                  future_values_are_guaranteed: false,
                }
              : {
                  policy_year: policyYear,
                  status: "projected_scenario_not_guaranteed",
                  projected_rate: {
                    policy_year: policyYear,
                    years_from_base: policyYear - 1,
                    value: 10 * 1.045 ** (policyYear - 1),
                    currency: "MXN_PER_UDI",
                  },
                  projected_sum_assured_mxn: money(
                    50000 * 10 * 1.045 ** (policyYear - 1),
                    "MXN",
                  ),
                  annual_growth_rate: 0.045,
                  future_values_are_guaranteed: false,
                },
        ),
        labels: {
          source_sum_assured: "Suma asegurada contratada",
          current_mxn_equivalence: "Equivalencia actual en MXN",
        },
      },
      guaranteed_recovery: {
        view_id: "guaranteed_recovery",
        title: "Recuperación garantizada",
        checkpoint_strategy:
          "payment_term_then_next_five_year_milestones",
        exact_checkpoint_years: checkpointYears,
        nearest_year_substitution: false,
        checkpoints: checkpointYears.map((year) =>
          checkpoint(year, currency),
        ),
      },
    },
    disclosure_contract: {
      product_classification: "LIFE_INSURANCE_PROTECTION",
      future_values_are_guaranteed: false,
      recovery_ratio_classification:
        "comparison_only_not_investment_return",
      recommendation: null,
      human_decision_required: true,
    },
  };
}

function readiness(currency) {
  return {
    orchestration_id:
      "orvi.dashboard.verified-rate-orchestration-readiness.v1",
    canonical_owner: "product-intelligence",
    product_family: "orvi",
    source_currency: currency,
    consumer_payload: { view_model: viewModel(currency) },
  };
}

const udiReadiness = readiness("UDI");
assert.equal(isOrviProduct(udiReadiness), true);
assert.equal(isOrviProduct({ product: "ORVI 99" }), true);
assert.equal(isOrviProduct({ product: "Ordinario de Vida" }), true);
assert.equal(isOrviProduct({ product: "SeguBeca" }), false);
assert.equal(
  resolveOrviDashboardViewModel(udiReadiness).source_currency,
  "UDI",
);

const udiModel = buildOrviDashboardModel(udiReadiness);
assert.equal(udiModel.adapterId, ORVI_PRODUCT_DASHBOARD_ADAPTER_ID);
assert.equal(udiModel.productType, ORVI_PRODUCT_TYPE);
assert.equal(udiModel.layout, ORVI_PRODUCT_DASHBOARD_LAYOUT);
assert.equal(
  udiModel.templateAuthority,
  "REUSABLE_PRODUCT_DASHBOARD_TEMPLATE",
);
assert.equal(
  udiModel.designLine,
  "VIDA_MUJER_ESTABLISHED_PRODUCT_DASHBOARD_SYSTEM",
);
assert.deepEqual(udiModel.checkpointYears, [10, 15, 20]);
assert.equal(udiModel.recommendation, null);
assert.equal(
  udiModel.sections.filter(
    (entry) => entry.kind === "guaranteed_recovery",
  ).length,
  3,
);
assert.equal(
  formatOrviMoney(money(500000, "MXN"), { approximate: true }),
  "≈ $500,000 MXN",
);

const dashboard = renderOrviDashboard(udiModel, {
  documentRef: createFakeDocument(),
});
assert.equal(dashboard.className, "fq-benefit-dashboard-107z15p2");
assert.equal(dashboard.dataset.forgeProductType, "orvi");
assert.equal(
  dashboard.dataset.forgeProductLayout,
  "orvi_dynamic_r15k",
);
assert.equal(
  dashboard.dataset.forgeProductTemplate,
  "vida_mujer_reusable",
);
assert.equal(
  dashboard.dataset.forgeOrviViews,
  "protection,guaranteed_recovery",
);
assert.equal(
  dashboard.children.filter(
    (child) =>
      child.dataset.forgeProductSection === "guaranteed_recovery",
  ).length,
  3,
);

const usdModel = buildOrviDashboardModel(readiness("USD"));
const usdFuture = usdModel.sections.find(
  (entry) => entry.kind === "future_scenario",
);
assert.equal(
  usdFuture.items.every(
    (entry) => entry.primary === "Proyección USD bloqueada",
  ),
  true,
);
assert.ok(
  usdModel.sections
    .filter((entry) => entry.kind === "guaranteed_recovery")
    .every((entry) =>
      entry.items.some((value) =>
        value.value.includes("falta un supuesto futuro USD/MXN"),
      ),
    ),
);
assert.equal(buildOrviDashboardModel({ product: "ORVI 99" }), null);

console.log("PASS R15K ORVI reusable product dashboard adapter", {
  adapterId: udiModel.adapterId,
  layout: udiModel.layout,
  templateAuthority: udiModel.templateAuthority,
  checkpointYears: udiModel.checkpointYears,
  recoveryCards: udiModel.sections.filter(
    (entry) => entry.kind === "guaranteed_recovery",
  ).length,
  usdFutureBlocked: true,
  recommendation: udiModel.recommendation,
});
