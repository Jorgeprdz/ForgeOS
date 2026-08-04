import assert from "node:assert/strict";

import {
  ORVI_DASHBOARD_ORCHESTRATION_READINESS_ID,
  ORVI_REUSABLE_TEMPLATE_AUTHORITY,
  buildOrviDashboardOrchestrationReadiness,
  validateOrviDashboardOrchestrationReadiness,
} from "../product-intelligence/runtime/orvi-dashboard-orchestration-readiness.js";

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
        break_even_status:
          difference >= 0 ? "at_or_above_paid" : "below_paid",
        interpretation: "comparison_only_not_investment_return",
      },
      analytics_status: "complete",
    };
  };

  return {
    analytics_id:
      "orvi.guaranteed-value.dynamic-checkpoint-analytics.v1",
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
  return buildOrviDashboardOrchestrationReadiness({
    model: buildSyntheticModel(currency),
    analytics: buildSyntheticAnalytics(currency),
    rate_metadata: syntheticRate(currency),
  });
}

const udi = build("UDI");
assert.equal(
  udi.orchestration_id,
  ORVI_DASHBOARD_ORCHESTRATION_READINESS_ID,
);
assert.deepEqual(
  validateOrviDashboardOrchestrationReadiness(udi),
  { valid: true, errors: [] },
);
assert.equal(
  udi.template_contract.authority,
  "REUSABLE_PRODUCT_DASHBOARD_TEMPLATE",
);
assert.equal(
  udi.template_contract.design_line,
  "VIDA_MUJER_ESTABLISHED_PRODUCT_DASHBOARD_SYSTEM",
);
assert.equal(udi.template_contract.template_reuse_required, true);
assert.equal(udi.template_contract.create_new_dashboard_system, false);
assert.equal(
  udi.template_contract.template_test,
  "tests/product-dashboard-template-test.mjs",
);
assert.equal(
  udi.template_contract.layout_surface,
  "docs/static-preview/quote-runtime/forge-benefit-summary-layout.js",
);
assert.equal(
  udi.template_contract.renderer_surface,
  "docs/static-preview/quote-runtime/forge-benefit-summary-renderer.js",
);
assert.equal(
  udi.readiness.status,
  "READY_FOR_REUSABLE_TEMPLATE_PRODUCT_ADAPTER",
);
assert.equal(
  udi.readiness.product_adapter_implementation_authorized,
  true,
);
assert.equal(udi.readiness.new_template_creation_authorized, false);
assert.equal(udi.readiness.renderer_wiring_authorized, false);
assert.equal(udi.readiness.dom_wiring_authorized, false);
assert.equal(
  udi.readiness.browser_validation_required_after_renderer_wiring,
  true,
);
assert.equal(udi.rate_bridge.provider_call_performed, false);
assert.equal(udi.rate_bridge.repository_cache_read_performed, false);
assert.equal(
  udi.rate_bridge.rate_value_persisted_in_readiness_contract,
  false,
);
assert.equal(udi.semantic_boundaries.recommendation, null);
assert.equal(udi.semantic_boundaries.human_decision_required, true);

const usd = build("USD");
assert.deepEqual(
  validateOrviDashboardOrchestrationReadiness(usd),
  { valid: true, errors: [] },
);
assert.equal(usd.source_currency, "USD");
assert.equal(
  usd.consumer_payload.view_model.disclosure_contract.future_usd_mxn,
  "BLOCKED_PENDING_EXPLICIT_SCENARIO_RATE_AUTHORITY",
);

assert.equal(
  ORVI_REUSABLE_TEMPLATE_AUTHORITY.create_new_dashboard_system,
  false,
);
assert.equal(
  ORVI_REUSABLE_TEMPLATE_AUTHORITY.template_reuse_required,
  true,
);

assert.throws(
  () =>
    buildOrviDashboardOrchestrationReadiness({
      model: buildSyntheticModel("UDI"),
      analytics: buildSyntheticAnalytics("UDI"),
      rate_metadata: {
        ...syntheticRate("UDI"),
        stale: true,
      },
    }),
  /stale/i,
);

console.log(
  "PASS R15J ORVI verified-rate orchestration and template authority",
  {
    orchestrationId: udi.orchestration_id,
    templateAuthority: udi.template_contract.authority,
    designLine: udi.template_contract.design_line,
    templateReuseRequired:
      udi.template_contract.template_reuse_required,
    createNewDashboardSystem:
      udi.template_contract.create_new_dashboard_system,
    productAdapterAuthorized:
      udi.readiness.product_adapter_implementation_authorized,
    rendererWiringAuthorized:
      udi.readiness.renderer_wiring_authorized,
    rateProviderCalled:
      udi.rate_bridge.provider_call_performed,
    recommendation:
      udi.semantic_boundaries.recommendation,
  },
);
