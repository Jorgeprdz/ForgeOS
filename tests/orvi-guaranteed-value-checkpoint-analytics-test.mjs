import assert from "node:assert/strict";
import fs from "node:fs";

import {
  buildOrviProductIntelligence,
} from "../product-intelligence/knowledge/orvi-product-intelligence.js";
import {
  parseOrviSolucionlinePdfText,
} from "../product-intelligence/quotes/orvi-solucionline-pdf-text-parser.js";
import {
  mapOrviPdfEnvelopeToProductIntelligence,
} from "../product-intelligence/quotes/orvi-pdf-to-product-intelligence.js";
import {
  ORVI_GUARANTEED_VALUE_CHECKPOINT_ANALYTICS_ID,
  buildOrviGuaranteedValueCheckpointAnalytics,
  deriveOrviDynamicCheckpointYears,
  validateOrviGuaranteedValueCheckpointAnalytics,
} from "../product-intelligence/analytics/orvi-guaranteed-value-checkpoint-analytics.js";

function buildSyntheticModel(paymentTermYears, maxPolicyYear = 35, currency = "UDI") {
  const rows = [];
  for (let year = 1; year <= maxPolicyYear; year += 1) {
    const premiumActive = year <= paymentTermYears;
    rows.push({
      policy_year: year,
      attained_age: 39 + year,
      currency,
      annual_premium: premiumActive ? 1000 : 0,
      annual_premium_explicit_zero: !premiumActive,
      additional_premium: premiumActive ? 200 : 0,
      additional_premium_explicit_zero: !premiumActive,
      guaranteed_surrender_value: 300 * year,
      cash_value: 500 * year,
      total_recovery: 800 * year,
      source_status: "synthetic_confirmed",
    });
  }

  return buildOrviProductIntelligence({
    identity: {
      detected_product_name: `ORVI SYNTHETIC ${paymentTermYears} PAY ${currency}`,
      plan_variant: `ORVI SYNTHETIC ${paymentTermYears} PAY ${currency}`,
      currency,
    },
    ownership: {
      parser_ref: "product-intelligence/quotes/orvi-solucionline-pdf-text-parser.js",
    },
    participants: {
      primary_insured: { age: 40, gender: "SYNTHETIC" },
    },
    premium_structure: {
      basic_annual_premium: 1000,
      additional_annual_premium: 200,
      total_annual_premium: 1000,
      payment_term_years: paymentTermYears,
      limited_payment_variant: `${paymentTermYears} PAY`,
    },
    protection_summary: {
      basic_sum_assured: 50000,
      coverage_duration_years: 60,
      included_coverages: [],
      additional_coverages: [],
    },
    guaranteed_value_timeline: rows,
    source_trace: [
      {
        field: "guaranteed_value_timeline",
        source_type: "synthetic_test",
        source_ref: "r15f",
        status: "synthetic_confirmed",
        privacy_safe: true,
      },
    ],
  });
}

const dynamicCases = new Map([
  [6, [6, 10, 15]],
  [10, [10, 15, 20]],
  [15, [15, 20, 25]],
  [20, [20, 25, 30]],
]);

for (const [paymentTerm, expectedYears] of dynamicCases) {
  assert.deepEqual(deriveOrviDynamicCheckpointYears(paymentTerm), expectedYears);
  const analytics = buildOrviGuaranteedValueCheckpointAnalytics(
    buildSyntheticModel(paymentTerm),
  );
  assert.deepEqual(analytics.checkpoint_selection.target_years, expectedYears);
  assert.deepEqual(analytics.checkpoint_selection.selected_years, expectedYears);
  assert.equal(analytics.readiness.status, "COMPLETE");
}

const analytics = buildOrviGuaranteedValueCheckpointAnalytics(
  buildSyntheticModel(10),
);
const expected = JSON.parse(
  fs.readFileSync(
    new URL("../fixtures/orvi-guaranteed-value-dynamic-checkpoints-expected.json", import.meta.url),
    "utf8",
  ),
);

assert.equal(
  analytics.analytics_id,
  ORVI_GUARANTEED_VALUE_CHECKPOINT_ANALYTICS_ID,
);
assert.deepEqual(
  {
    analytics_id: analytics.analytics_id,
    currency: analytics.currency,
    payment_term_years: analytics.payment_term_years,
    target_years: analytics.checkpoint_selection.target_years,
    selected_years: analytics.checkpoint_selection.selected_years,
    missing_target_years: analytics.checkpoint_selection.missing_target_years,
    checkpoints: analytics.checkpoints.map((checkpoint) => ({
      policy_year: checkpoint.policy_year,
      payment_phase: checkpoint.payment_phase,
      cumulative_paid: checkpoint.cumulative_paid_evidence.cumulative_paid.value,
      total_recovery: checkpoint.guaranteed_values.total_recovery.value,
      recovery_difference: checkpoint.comparison.recovery_difference.value,
      recovery_ratio: checkpoint.comparison.recovery_ratio,
      recovery_percentage: checkpoint.comparison.recovery_percentage,
      break_even_status: checkpoint.comparison.break_even_status,
    })),
    readiness: analytics.readiness.status,
    recommendation: analytics.semantic_boundaries.recommendation,
    mxn_status: analytics.mxn_conversion.status,
  },
  expected,
);

const validation = validateOrviGuaranteedValueCheckpointAnalytics(analytics);
assert.deepEqual(validation, { valid: true, errors: [] });
assert.equal(Object.isFrozen(analytics), true);
assert.equal(Object.isFrozen(analytics.checkpoints), true);
assert.equal(analytics.semantic_boundaries.recovery_ratio_is_investment_return, false);
assert.equal(analytics.semantic_boundaries.human_decision_required, true);
assert.equal(analytics.semantic_boundaries.projected_mxn_included, false);
assert.equal(analytics.mxn_conversion.status, "not_evaluated");

const syntheticText = fs.readFileSync(
  new URL("../fixtures/orvi-solucionline-synthetic-quote.txt", import.meta.url),
  "utf8",
);
const syntheticEnvelope = parseOrviSolucionlinePdfText(syntheticText);
const syntheticCanonical = mapOrviPdfEnvelopeToProductIntelligence(syntheticEnvelope);
const integrated = buildOrviGuaranteedValueCheckpointAnalytics(syntheticCanonical);

assert.equal(integrated.currency, "USD");
assert.equal(integrated.payment_term_years, 10);
assert.deepEqual(integrated.checkpoint_selection.target_years, [10, 15, 20]);
assert.deepEqual(integrated.checkpoint_selection.selected_years, [10, 15]);
assert.deepEqual(integrated.checkpoint_selection.missing_target_years, [20]);
assert.equal(integrated.checkpoint_selection.nearest_year_substitution_applied, false);
assert.equal(integrated.readiness.status, "PARTIAL");
assert.equal(integrated.checkpoints.every((item) => item.analytics_status === "complete"), true);

const incompleteModel = buildSyntheticModel(10);
const incompleteInput = structuredClone(incompleteModel);
incompleteInput.guaranteed_value_timeline[4].additional_premium.value = null;
incompleteInput.guaranteed_value_timeline[4].additional_premium.truth_status = "missing_information";
const incompleteAnalytics = buildOrviGuaranteedValueCheckpointAnalytics(incompleteInput);
assert.equal(incompleteAnalytics.checkpoints[0].analytics_status, "partial");
assert.equal(
  incompleteAnalytics.checkpoints[0].cumulative_paid_evidence.incomplete_policy_years.includes(5),
  true,
);
assert.equal(
  incompleteAnalytics.checkpoints[0].comparison.recovery_difference.value,
  null,
);

assert.throws(() => deriveOrviDynamicCheckpointYears(0), /positive integer/);
assert.throws(
  () => buildOrviGuaranteedValueCheckpointAnalytics({}),
  /canonical ORVI Product Intelligence/,
);

console.log("PASS R15F ORVI guaranteed value dynamic checkpoint analytics", {
  analyticsId: analytics.analytics_id,
  dynamicCases: Object.fromEntries(dynamicCases),
  checkpointYears: analytics.checkpoint_selection.selected_years,
  cumulativePaidAtTerm: analytics.checkpoints[0].cumulative_paid_evidence.cumulative_paid.value,
  recoveryAtTerm: analytics.checkpoints[0].guaranteed_values.total_recovery.value,
  integratedAvailableYears: integrated.checkpoint_selection.selected_years,
  integratedMissingYears: integrated.checkpoint_selection.missing_target_years,
  recommendation: analytics.semantic_boundaries.recommendation,
  mxnStatus: analytics.mxn_conversion.status,
});
