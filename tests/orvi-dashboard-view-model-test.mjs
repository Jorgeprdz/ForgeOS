import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
  buildOrviMxnEquivalenceAndProjection,
} from "../product-intelligence/currency/orvi-mxn-equivalence-adapter.js";
import {
  ORVI_DASHBOARD_VIEW_MODEL_ID,
  buildOrviDashboardViewModel,
  validateOrviDashboardViewModel,
} from "../product-intelligence/views/orvi-dashboard-view-model.js";

const expected = JSON.parse(
  readFileSync(
    new URL(
      "../fixtures/orvi-dashboard-view-model-synthetic-expected.json",
      import.meta.url,
    ),
    "utf8",
  ),
);

function money(value, currency) {
  return {
    value,
    currency,
    truth_status: "source_provided",
    guarantee_status: "synthetic_test_only",
    source_path: "synthetic",
  };
}

function buildSyntheticModel(currency) {
  const timeline = Array.from({ length: 20 }, (_, index) => {
    const policyYear = index + 1;
    const paying = policyYear <= 10;
    return {
      policy_year: policyYear,
      attained_age: 40 + policyYear,
      annual_premium: money(paying ? 100 : 0, currency),
      additional_premium: money(paying ? 20 : 0, currency),
      total_annual_outflow: money(paying ? 120 : 0, currency),
      guaranteed_surrender_value: money(policyYear * 500, currency),
      cash_value: money(policyYear * 300, currency),
      total_recovery: money(policyYear * 800, currency),
      source_status: "synthetic_confirmed",
    };
  });

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
    guaranteed_value_timeline: timeline,
    decision_scenarios: {
      recommendation: null,
      human_decision_required: true,
    },
  };
}

function buildSyntheticAnalytics(currency) {
  const checkpoint = (policyYear) => {
    const cumulativePaid = 1200;
    const totalRecovery = policyYear * 800;
    const difference = totalRecovery - cumulativePaid;
    const ratio = totalRecovery / cumulativePaid;

    return {
      policy_year: policyYear,
      attained_age: 40 + policyYear,
      payment_phase:
        policyYear === 10 ? "payment_completion" : "post_payment",
      cumulative_paid_evidence: {
        cumulative_paid: money(cumulativePaid, currency),
      },
      guaranteed_values: {
        surrender_value: money(policyYear * 500, currency),
        cash_value: money(policyYear * 300, currency),
        total_recovery: money(totalRecovery, currency),
      },
      comparison: {
        recovery_difference: money(difference, currency),
        recovery_ratio: ratio,
        recovery_percentage: ratio * 100,
        break_even_status: difference >= 0 ? "at_or_above_paid" : "below_paid",
        interpretation: "comparison_only_not_investment_return",
      },
      analytics_status: "complete",
    };
  };

  return {
    analytics_id: "orvi.guaranteed-value.dynamic-checkpoint-analytics.v1",
    canonical_owner: "product-intelligence",
    currency,
    payment_term_years: 10,
    checkpoints: [10, 15, 20].map(checkpoint),
    semantic_boundaries: {
      recovery_ratio_is_investment_return: false,
      recommendation: null,
      human_decision_required: true,
    },
    mxn_conversion: {
      status: "not_evaluated",
      future_values_are_guaranteed: false,
    },
  };
}

function syntheticRate(currency) {
  return {
    status: "VERIFIED_SYNTHETIC_TEST_RATE",
    rate_key: currency === "UDI" ? "UDI_MXN" : "USD_MXN_FIX",
    value: currency === "UDI" ? 10 : 20,
    source: "SYNTHETIC_TEST_PROVIDER",
    source_date: "2099-01-01",
    source_mode: "SYNTHETIC_TEST",
    cache_status: null,
    stale: false,
    synthetic_test: true,
  };
}

function build(currency) {
  const model = buildSyntheticModel(currency);
  const analytics = buildSyntheticAnalytics(currency);
  const mxn = buildOrviMxnEquivalenceAndProjection({
    model,
    analytics,
    rate_metadata: syntheticRate(currency),
  });

  return {
    model,
    analytics,
    mxn,
    viewModel: buildOrviDashboardViewModel({
      model,
      analytics,
      mxn_equivalence: mxn,
    }),
  };
}

const udi = build("UDI");
assert.equal(udi.viewModel.view_model_id, ORVI_DASHBOARD_VIEW_MODEL_ID);
assert.equal(udi.viewModel.view_model_id, expected.view_model_id);
assert.deepEqual(validateOrviDashboardViewModel(udi.viewModel), {
  valid: true,
  errors: [],
});
assert.deepEqual(
  udi.viewModel.navigation.map((item) => item.view_id),
  expected.navigation,
);
assert.deepEqual(
  udi.viewModel.checkpoint_years,
  expected.udi.checkpoint_years,
);
assert.equal(
  udi.viewModel.views.protection.current_mxn_equivalence.value,
  expected.udi.protection_current_mxn,
);
assert.deepEqual(
  udi.viewModel.views.protection.future_checkpoint_scenarios.map(
    (item) => item.projected_sum_assured_mxn.value,
  ),
  expected.udi.protection_future_mxn,
);

const firstUdiCheckpoint =
  udi.viewModel.views.guaranteed_recovery.checkpoints[0];
assert.equal(
  firstUdiCheckpoint.policy_year,
  expected.udi.first_checkpoint.policy_year,
);
assert.equal(
  firstUdiCheckpoint.current_mxn.cumulative_paid.value,
  expected.udi.first_checkpoint.current_cumulative_paid_mxn,
);
assert.equal(
  firstUdiCheckpoint.current_mxn.total_recovery.value,
  expected.udi.first_checkpoint.current_total_recovery_mxn,
);
assert.equal(
  firstUdiCheckpoint.future_mxn.cumulative_paid.value,
  expected.udi.first_checkpoint.future_cumulative_paid_mxn,
);
assert.equal(
  firstUdiCheckpoint.future_mxn.total_recovery.value,
  expected.udi.first_checkpoint.future_total_recovery_mxn,
);
assert.equal(
  firstUdiCheckpoint.future_mxn.recovery_percentage,
  expected.udi.first_checkpoint.future_recovery_percentage,
);
assert.equal(
  udi.viewModel.disclosure_contract.future_udi_mxn,
  expected.udi.future_disclosure,
);
assert.equal(
  udi.viewModel.views.guaranteed_recovery.nearest_year_substitution,
  expected.boundaries.nearest_year_substitution,
);
assert.equal(
  udi.viewModel.disclosure_contract.recovery_ratio_classification,
  expected.boundaries.recovery_ratio_classification,
);
assert.equal(
  udi.viewModel.disclosure_contract.recommendation,
  expected.boundaries.recommendation,
);
assert.equal(
  udi.viewModel.disclosure_contract.human_decision_required,
  expected.boundaries.human_decision_required,
);
assert.equal(
  udi.viewModel.readiness.runtime_wiring_authorized,
  expected.boundaries.runtime_wiring_authorized,
);
assert.equal(
  udi.viewModel.readiness.ui_rendering_authorized,
  expected.boundaries.ui_rendering_authorized,
);
assert.equal(
  udi.viewModel.readiness.browser_validation_required_after_ui_wiring,
  expected.boundaries.browser_validation_required_after_ui_wiring,
);

const usd = build("USD");
assert.deepEqual(validateOrviDashboardViewModel(usd.viewModel), {
  valid: true,
  errors: [],
});
assert.deepEqual(
  usd.viewModel.checkpoint_years,
  expected.usd.checkpoint_years,
);
assert.equal(
  usd.viewModel.views.protection.current_mxn_equivalence.value,
  expected.usd.protection_current_mxn,
);
assert.equal(
  usd.viewModel.views.protection.future_checkpoint_scenarios[0].status,
  expected.usd.future_status,
);
assert.equal(
  usd.viewModel.views.guaranteed_recovery.checkpoints[0].future_mxn.status,
  expected.usd.future_status,
);
assert.equal(
  usd.viewModel.views.guaranteed_recovery.checkpoints[0].future_mxn
    .projected_rate,
  null,
);
assert.equal(
  usd.viewModel.views.guaranteed_recovery.checkpoints[0].future_mxn
    .total_recovery,
  null,
);

const mismatchedAnalytics = {
  ...udi.analytics,
  checkpoints: udi.analytics.checkpoints.slice(0, 2),
};
assert.throws(
  () =>
    buildOrviDashboardViewModel({
      model: udi.model,
      analytics: mismatchedAnalytics,
      mxn_equivalence: udi.mxn,
    }),
  /checkpoint years must match exactly/i,
);

assert.equal(
  JSON.stringify(udi.viewModel).includes("client_name"),
  false,
);
assert.equal(
  JSON.stringify(udi.viewModel).includes("recommended_action"),
  false,
);

console.log("PASS R15I ORVI dashboard view model contract", {
  viewModelId: udi.viewModel.view_model_id,
  navigation: udi.viewModel.navigation.map((item) => item.view_id),
  checkpointYears: udi.viewModel.checkpoint_years,
  udiFuture:
    udi.viewModel.disclosure_contract.future_udi_mxn,
  usdFuture:
    usd.viewModel.disclosure_contract.future_usd_mxn,
  nearestYearSubstitution:
    udi.viewModel.views.guaranteed_recovery.nearest_year_substitution,
  recommendation:
    udi.viewModel.disclosure_contract.recommendation,
  uiRenderingAuthorized:
    udi.viewModel.readiness.ui_rendering_authorized,
});
