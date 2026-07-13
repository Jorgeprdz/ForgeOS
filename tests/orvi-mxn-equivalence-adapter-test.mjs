import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
  ORVI_MXN_EQUIVALENCE_ADAPTER_ID,
  ORVI_MXN_EQUIVALENCE_CALCULATION_MODE,
  buildOrviMxnEquivalenceAndProjection,
  validateOrviMxnEquivalenceAndProjection,
} from "../product-intelligence/currency/orvi-mxn-equivalence-adapter.js";

const expected = JSON.parse(
  readFileSync(
    new URL(
      "../fixtures/orvi-mxn-equivalence-synthetic-expected.json",
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
  const checkpoint = (policyYear) => ({
    policy_year: policyYear,
    attained_age: 40 + policyYear,
    payment_phase:
      policyYear === 10 ? "payment_completion" : "post_payment",
    cumulative_paid_evidence: {
      cumulative_paid: money(1200, currency),
    },
    guaranteed_values: {
      surrender_value: money(policyYear * 500, currency),
      cash_value: money(policyYear * 300, currency),
      total_recovery: money(policyYear * 800, currency),
    },
    comparison: {
      recovery_ratio: (policyYear * 800) / 1200,
      recovery_percentage: ((policyYear * 800) / 1200) * 100,
      interpretation: "comparison_only_not_investment_return",
    },
    analytics_status: "complete",
  });

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

const udi = buildOrviMxnEquivalenceAndProjection({
  model: buildSyntheticModel("UDI"),
  analytics: buildSyntheticAnalytics("UDI"),
  rate_metadata: syntheticRate("UDI"),
});

assert.equal(udi.adapter_id, ORVI_MXN_EQUIVALENCE_ADAPTER_ID);
assert.deepEqual(validateOrviMxnEquivalenceAndProjection(udi), {
  valid: true,
  errors: [],
});
assert.equal(
  udi.protection.sum_assured.current_mxn.value,
  expected.udi.current_sum_assured_mxn,
);

for (const expectedCheckpoint of expected.udi.checkpoints) {
  const checkpoint = udi.checkpoint_equivalences.find(
    (item) => item.policy_year === expectedCheckpoint.policy_year,
  );
  const sumAssured = udi.protection.sum_assured.checkpoint_scenarios.find(
    (item) => item.policy_year === expectedCheckpoint.policy_year,
  );

  assert.ok(checkpoint);
  assert.ok(sumAssured);
  assert.equal(
    checkpoint.future_mxn.projected_rate.years_from_base,
    expectedCheckpoint.years_from_base,
  );
  assert.equal(
    checkpoint.future_mxn.projected_rate.value,
    expectedCheckpoint.projected_rate,
  );
  assert.equal(
    sumAssured.projected_sum_assured_mxn.value,
    expectedCheckpoint.projected_sum_assured_mxn,
  );
  assert.equal(
    checkpoint.current_mxn.cumulative_paid.value,
    expectedCheckpoint.current_cumulative_paid_mxn,
  );
  assert.equal(
    checkpoint.future_mxn.cumulative_paid.value,
    expectedCheckpoint.projected_cumulative_paid_mxn,
  );
  assert.equal(
    checkpoint.current_mxn.total_recovery.value,
    expectedCheckpoint.current_total_recovery_mxn,
  );
  assert.equal(
    checkpoint.future_mxn.total_recovery.value,
    expectedCheckpoint.projected_total_recovery_mxn,
  );
  assert.equal(
    checkpoint.future_mxn.comparison.recovery_difference_mxn.value,
    expectedCheckpoint.projected_recovery_difference_mxn,
  );
  assert.equal(
    checkpoint.future_mxn.comparison.recovery_ratio,
    expectedCheckpoint.projected_recovery_ratio,
  );
  assert.equal(
    checkpoint.future_mxn.comparison.recovery_percentage,
    expectedCheckpoint.projected_recovery_percentage,
  );
  assert.equal(
    checkpoint.future_mxn.cumulative_paid.annual_payments.length,
    expectedCheckpoint.policy_year,
  );
  assert.equal(checkpoint.future_mxn.future_values_are_guaranteed, false);
}

const usd = buildOrviMxnEquivalenceAndProjection({
  model: buildSyntheticModel("USD"),
  analytics: buildSyntheticAnalytics("USD"),
  rate_metadata: syntheticRate("USD"),
});

assert.deepEqual(validateOrviMxnEquivalenceAndProjection(usd), {
  valid: true,
  errors: [],
});
assert.equal(
  usd.protection.sum_assured.current_mxn.value,
  expected.usd.current_sum_assured_mxn,
);
assert.equal(
  usd.protection.sum_assured.checkpoint_scenarios[0].status,
  expected.usd.future_status,
);
assert.equal(
  usd.checkpoint_equivalences[0].future_mxn.status,
  expected.usd.future_status,
);
assert.equal(usd.checkpoint_equivalences[0].future_mxn.projected_rate, null);
assert.equal(usd.checkpoint_equivalences[0].future_mxn.annual_growth_rate, null);

assert.throws(
  () =>
    buildOrviMxnEquivalenceAndProjection({
      model: buildSyntheticModel("UDI"),
      analytics: buildSyntheticAnalytics("UDI"),
      rate_metadata: {
        ...syntheticRate("UDI"),
        stale: true,
      },
    }),
  /stale rate fallback/i,
);

assert.throws(
  () =>
    buildOrviMxnEquivalenceAndProjection({
      model: buildSyntheticModel("UDI"),
      analytics: buildSyntheticAnalytics("UDI"),
      rate_metadata: {
        ...syntheticRate("UDI"),
        rate_key: "USD_MXN_FIX",
      },
    }),
  /rate key must be UDI_MXN/i,
);

assert.equal(udi.semantic_boundaries.recommendation, null);
assert.equal(udi.semantic_boundaries.human_decision_required, true);
assert.equal(udi.semantic_boundaries.future_values_are_guaranteed, false);
assert.equal(udi.readiness.runtime_wiring_authorized, false);
assert.equal(udi.readiness.dashboard_wiring_authorized, false);
assert.equal(
  udi.semantic_boundaries
    .cumulative_projected_paid_uses_each_payment_year_rate,
  true,
);
assert.equal(
  ORVI_MXN_EQUIVALENCE_CALCULATION_MODE.usd_future_blocked,
  expected.usd.future_status,
);

console.log("PASS R15H ORVI MXN equivalence and UDI projection adapter", {
  adapterId: udi.adapter_id,
  udiCurrent: udi.readiness.current_mxn_equivalence,
  udiFuture: udi.readiness.future_udi_projection,
  usdCurrent: usd.readiness.current_mxn_equivalence,
  usdFuture: usd.readiness.future_usd_projection,
  checkpointYears: udi.checkpoint_equivalences.map(
    (checkpoint) => checkpoint.policy_year,
  ),
  year20Offset:
    udi.checkpoint_equivalences.at(-1).future_mxn.projected_rate
      .years_from_base,
  paymentYearRateAccumulation:
    udi.semantic_boundaries
      .cumulative_projected_paid_uses_each_payment_year_rate,
  recommendation: udi.semantic_boundaries.recommendation,
});
