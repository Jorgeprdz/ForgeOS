export const ORVI_GUARANTEED_VALUE_CHECKPOINT_ANALYTICS_ID =
  "orvi.guaranteed-value.dynamic-checkpoint-analytics.v1";

export const ORVI_GUARANTEED_VALUE_CHECKPOINT_STRATEGY =
  "payment_term_then_next_five_year_milestones";

const SUPPORTED_CURRENCIES = new Set(["UDI", "USD"]);

function isRecord(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isFiniteNonNegative(value) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

function positiveInteger(value) {
  return Number.isInteger(value) && value > 0 ? value : null;
}

function normalizeCurrency(value) {
  if (typeof value !== "string") return null;
  const normalized = value.trim().toUpperCase();
  return SUPPORTED_CURRENCIES.has(normalized) ? normalized : null;
}

function round(value, digits = 6) {
  if (!Number.isFinite(value)) return null;
  const factor = 10 ** digits;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

function deepFreeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  Object.freeze(value);
  for (const child of Object.values(value)) deepFreeze(child);
  return value;
}

function moneyValue(money, currency) {
  if (!isRecord(money)) return null;
  if (normalizeCurrency(money.currency) !== currency) return null;
  return isFiniteNonNegative(money.value) ? money.value : null;
}

function money(value, currency, status, sourcePath) {
  return {
    value: Number.isFinite(value) ? round(value, 6) : null,
    currency,
    status,
    source_path: sourcePath,
  };
}

function defaultTargetYears(paymentTermYears) {
  const nextFiveYearMilestone =
    paymentTermYears % 5 === 0
      ? paymentTermYears + 5
      : Math.ceil(paymentTermYears / 5) * 5;

  return [
    paymentTermYears,
    nextFiveYearMilestone,
    nextFiveYearMilestone + 5,
  ];
}

function normalizeCustomTargetYears(values) {
  if (!Array.isArray(values)) return null;
  const normalized = [...new Set(values.map(positiveInteger).filter(Boolean))].sort(
    (a, b) => a - b,
  );
  return normalized.length > 0 ? normalized : null;
}

function normalizeTimeline(model, currency) {
  if (!Array.isArray(model?.guaranteed_value_timeline)) return [];

  const rows = model.guaranteed_value_timeline
    .filter((row) => isRecord(row) && positiveInteger(row.policy_year) !== null)
    .map((row) => ({
      row,
      policy_year: row.policy_year,
      attained_age: positiveInteger(row.attained_age),
      annual_premium: moneyValue(row.annual_premium, currency),
      additional_premium: moneyValue(row.additional_premium, currency),
      total_annual_outflow: moneyValue(row.total_annual_outflow, currency),
      guaranteed_surrender_value: moneyValue(
        row.guaranteed_surrender_value,
        currency,
      ),
      cash_value: moneyValue(row.cash_value, currency),
      total_recovery: moneyValue(row.total_recovery, currency),
      source_status:
        typeof row.source_status === "string" ? row.source_status : "unknown",
    }))
    .sort((a, b) => a.policy_year - b.policy_year);

  const seen = new Set();
  return rows.filter((row) => {
    if (seen.has(row.policy_year)) return false;
    seen.add(row.policy_year);
    return true;
  });
}

function rowPaidAmount(row) {
  if (isFiniteNonNegative(row.total_annual_outflow)) {
    return {
      complete: true,
      value: row.total_annual_outflow,
      base: row.annual_premium,
      additional: row.additional_premium,
      derivation: "source_total_annual_outflow",
    };
  }

  if (
    isFiniteNonNegative(row.annual_premium) &&
    isFiniteNonNegative(row.additional_premium)
  ) {
    return {
      complete: true,
      value: row.annual_premium + row.additional_premium,
      base: row.annual_premium,
      additional: row.additional_premium,
      derivation: "derived_from_source_components",
    };
  }

  return {
    complete: false,
    value: null,
    base: row.annual_premium,
    additional: row.additional_premium,
    derivation: "incomplete_source_components",
  };
}

function cumulativePaidThrough(rows, policyYear, currency) {
  const expectedYears = Array.from({ length: policyYear }, (_, index) => index + 1);
  const byYear = new Map(rows.map((row) => [row.policy_year, row]));
  const missingPolicyYears = [];
  const incompletePolicyYears = [];
  let knownBaseSubtotal = 0;
  let knownAdditionalSubtotal = 0;
  let knownPaidSubtotal = 0;
  let completeRows = 0;

  for (const year of expectedYears) {
    const row = byYear.get(year);
    if (!row) {
      missingPolicyYears.push(year);
      continue;
    }

    const paid = rowPaidAmount(row);
    if (isFiniteNonNegative(paid.base)) knownBaseSubtotal += paid.base;
    if (isFiniteNonNegative(paid.additional)) {
      knownAdditionalSubtotal += paid.additional;
    }

    if (!paid.complete) {
      incompletePolicyYears.push(year);
      continue;
    }

    knownPaidSubtotal += paid.value;
    completeRows += 1;
  }

  const complete =
    missingPolicyYears.length === 0 &&
    incompletePolicyYears.length === 0 &&
    completeRows === expectedYears.length;

  const status = complete ? "complete" : "incomplete";

  return {
    status,
    rows_expected: expectedYears.length,
    rows_complete: completeRows,
    missing_policy_years: missingPolicyYears,
    incomplete_policy_years: incompletePolicyYears,
    cumulative_base_premium: money(
      complete ? knownBaseSubtotal : null,
      currency,
      status,
      `guaranteed_value_timeline[1..${policyYear}].annual_premium`,
    ),
    cumulative_additional_premium: money(
      complete ? knownAdditionalSubtotal : null,
      currency,
      status,
      `guaranteed_value_timeline[1..${policyYear}].additional_premium`,
    ),
    cumulative_paid: money(
      complete ? knownPaidSubtotal : null,
      currency,
      status,
      `guaranteed_value_timeline[1..${policyYear}].annual_plus_additional`,
    ),
    known_subtotals: {
      base_premium: round(knownBaseSubtotal, 6),
      additional_premium: round(knownAdditionalSubtotal, 6),
      paid: round(knownPaidSubtotal, 6),
      currency,
    },
  };
}

function breakEvenStatus(difference) {
  if (!Number.isFinite(difference)) return "not_evaluable";
  if (difference > 0) return "recovery_above_cumulative_paid";
  if (difference < 0) return "recovery_below_cumulative_paid";
  return "recovery_equals_cumulative_paid";
}

function checkpointFromRow(row, rows, paymentTermYears, currency) {
  const paid = cumulativePaidThrough(rows, row.policy_year, currency);
  const totalRecovery = row.total_recovery;
  const cumulativePaid = paid.cumulative_paid.value;
  const metricsComplete =
    isFiniteNonNegative(totalRecovery) && isFiniteNonNegative(cumulativePaid);
  const difference = metricsComplete ? totalRecovery - cumulativePaid : null;
  const ratio =
    metricsComplete && cumulativePaid > 0 ? totalRecovery / cumulativePaid : null;

  return {
    policy_year: row.policy_year,
    attained_age: row.attained_age,
    payment_phase:
      row.policy_year < paymentTermYears
        ? "during_payment"
        : row.policy_year === paymentTermYears
          ? "payment_completion"
          : "post_payment",
    source_status: row.source_status,
    cumulative_paid_evidence: paid,
    guaranteed_values: {
      surrender_value: money(
        row.guaranteed_surrender_value,
        currency,
        isFiniteNonNegative(row.guaranteed_surrender_value)
          ? "source_provided"
          : "missing_information",
        `guaranteed_value_timeline[policy_year=${row.policy_year}].guaranteed_surrender_value`,
      ),
      cash_value: money(
        row.cash_value,
        currency,
        isFiniteNonNegative(row.cash_value)
          ? "source_provided"
          : "missing_information",
        `guaranteed_value_timeline[policy_year=${row.policy_year}].cash_value`,
      ),
      total_recovery: money(
        totalRecovery,
        currency,
        isFiniteNonNegative(totalRecovery)
          ? "source_provided"
          : "missing_information",
        `guaranteed_value_timeline[policy_year=${row.policy_year}].total_recovery`,
      ),
    },
    comparison: {
      status: metricsComplete ? "complete" : "not_evaluable",
      recovery_difference: money(
        difference,
        currency,
        metricsComplete ? "derived_comparison" : "not_evaluable",
        `checkpoint[policy_year=${row.policy_year}].total_recovery_minus_cumulative_paid`,
      ),
      recovery_ratio: ratio === null ? null : round(ratio, 6),
      recovery_percentage: ratio === null ? null : round(ratio * 100, 6),
      break_even_status: breakEvenStatus(difference),
      interpretation: "comparison_only_not_investment_return",
    },
    analytics_status: metricsComplete ? "complete" : "partial",
  };
}

export function deriveOrviDynamicCheckpointYears(paymentTermYears) {
  const term = positiveInteger(paymentTermYears);
  if (term === null) {
    throw new TypeError("paymentTermYears must be a positive integer");
  }
  return Object.freeze(defaultTargetYears(term));
}

export function buildOrviGuaranteedValueCheckpointAnalytics(model, options = {}) {
  if (!isRecord(model)) throw new TypeError("model must be an object");
  if (model?.schema?.id !== "forge.product_intelligence.orvi") {
    throw new TypeError("model must be canonical ORVI Product Intelligence");
  }
  if (model?.ownership?.canonical_owner !== "product-intelligence") {
    throw new TypeError("Product Intelligence must remain canonical owner");
  }

  const paymentTermYears = positiveInteger(
    model?.premium_structure?.payment_term_years,
  );
  if (paymentTermYears === null) {
    throw new TypeError("payment term is required for dynamic checkpoints");
  }

  const currency = normalizeCurrency(model?.identity?.currency);
  if (currency === null) throw new TypeError("currency must be UDI or USD");

  const rows = normalizeTimeline(model, currency);
  if (rows.length === 0) {
    throw new TypeError("guaranteed value timeline is required");
  }

  const customTargetYears = normalizeCustomTargetYears(options.checkpoint_years);
  const targetYears = customTargetYears ?? defaultTargetYears(paymentTermYears);
  const availableYears = new Set(rows.map((row) => row.policy_year));
  const selectedYears = targetYears.filter((year) => availableYears.has(year));
  const missingTargetYears = targetYears.filter((year) => !availableYears.has(year));
  const rowByYear = new Map(rows.map((row) => [row.policy_year, row]));
  const checkpoints = selectedYears.map((year) =>
    checkpointFromRow(rowByYear.get(year), rows, paymentTermYears, currency),
  );

  const completeCheckpointCount = checkpoints.filter(
    (checkpoint) => checkpoint.analytics_status === "complete",
  ).length;

  const result = {
    analytics_id: ORVI_GUARANTEED_VALUE_CHECKPOINT_ANALYTICS_ID,
    canonical_owner: "product-intelligence",
    source_model: {
      schema_id: model.schema.id,
      schema_version: model.schema.version,
      parser_ref: model.ownership.parser_ref,
    },
    currency,
    payment_term_years: paymentTermYears,
    checkpoint_selection: {
      strategy: customTargetYears
        ? "explicit_authorized_years"
        : ORVI_GUARANTEED_VALUE_CHECKPOINT_STRATEGY,
      target_years: targetYears,
      selected_years: selectedYears,
      missing_target_years: missingTargetYears,
      nearest_year_substitution_applied: false,
      available_policy_year_min: rows[0].policy_year,
      available_policy_year_max: rows.at(-1).policy_year,
    },
    checkpoints,
    readiness: {
      status:
        missingTargetYears.length === 0 &&
        completeCheckpointCount === checkpoints.length &&
        checkpoints.length === targetYears.length
          ? "COMPLETE"
          : "PARTIAL",
      target_count: targetYears.length,
      selected_count: selectedYears.length,
      complete_checkpoint_count: completeCheckpointCount,
    },
    semantic_boundaries: {
      product_classification: "life_insurance_protection",
      analytics_are_contractual_values_plus_derived_comparisons: true,
      recovery_ratio_is_investment_return: false,
      projected_mxn_included: false,
      recommendation: null,
      human_decision_required: true,
    },
    mxn_conversion: {
      status: "not_evaluated",
      projected_values: [],
      future_values_are_guaranteed: false,
    },
  };

  const validation = validateOrviGuaranteedValueCheckpointAnalytics(result);
  if (!validation.valid) {
    throw new TypeError(`Invalid ORVI checkpoint analytics: ${validation.errors.join(",")}`);
  }

  return deepFreeze(result);
}

export function validateOrviGuaranteedValueCheckpointAnalytics(analytics) {
  const errors = [];

  if (!isRecord(analytics)) errors.push("ANALYTICS_NOT_OBJECT");
  if (
    analytics?.analytics_id !==
    ORVI_GUARANTEED_VALUE_CHECKPOINT_ANALYTICS_ID
  ) {
    errors.push("ANALYTICS_ID_INVALID");
  }
  if (analytics?.canonical_owner !== "product-intelligence") {
    errors.push("CANONICAL_OWNER_INVALID");
  }
  if (!SUPPORTED_CURRENCIES.has(analytics?.currency)) {
    errors.push("CURRENCY_INVALID");
  }
  if (positiveInteger(analytics?.payment_term_years) === null) {
    errors.push("PAYMENT_TERM_INVALID");
  }
  if (!Array.isArray(analytics?.checkpoints)) {
    errors.push("CHECKPOINTS_INVALID");
  }
  if (
    analytics?.checkpoint_selection?.nearest_year_substitution_applied !== false
  ) {
    errors.push("NEAREST_YEAR_SUBSTITUTION_NOT_ALLOWED");
  }
  if (analytics?.semantic_boundaries?.recommendation !== null) {
    errors.push("RECOMMENDATION_NOT_AUTHORIZED");
  }
  if (analytics?.semantic_boundaries?.human_decision_required !== true) {
    errors.push("HUMAN_DECISION_GATE_MISSING");
  }
  if (
    analytics?.semantic_boundaries?.recovery_ratio_is_investment_return !== false
  ) {
    errors.push("INVESTMENT_RETURN_MISCLASSIFICATION");
  }
  if (analytics?.mxn_conversion?.status !== "not_evaluated") {
    errors.push("MXN_CONVERSION_NOT_AUTHORIZED");
  }
  if (analytics?.mxn_conversion?.future_values_are_guaranteed !== false) {
    errors.push("FUTURE_MXN_GUARANTEE_INVALID");
  }

  const selectedYears = analytics?.checkpoint_selection?.selected_years;
  const checkpointYears = Array.isArray(analytics?.checkpoints)
    ? analytics.checkpoints.map((checkpoint) => checkpoint.policy_year)
    : [];
  if (
    Array.isArray(selectedYears) &&
    JSON.stringify(selectedYears) !== JSON.stringify(checkpointYears)
  ) {
    errors.push("SELECTED_YEAR_CHECKPOINT_MISMATCH");
  }

  const serialized = JSON.stringify(analytics);
  if (/NaN|Infinity|undefined/.test(serialized)) {
    errors.push("NON_JSON_FINITE_VALUE_PRESENT");
  }

  return { valid: errors.length === 0, errors };
}
