import {
  ORVI_MXN_PROJECTION_AUTHORITY,
  ORVI_MXN_PROJECTION_AUTHORITY_ID,
  policyYearToProjectionOffset,
  resolveOrviMxnProjectionAuthority,
} from "./orvi-mxn-projection-authority.js";

export const ORVI_MXN_EQUIVALENCE_ADAPTER_ID =
  "orvi.mxn-equivalence-and-udi-projection-adapter.v1";

export const ORVI_MXN_EQUIVALENCE_CALCULATION_MODE = Object.freeze({
  current: "CURRENT_VERIFIED_RATE_EQUIVALENCE",
  udi_future: "PROJECTED_UDI_4_5_PERCENT_SCENARIO_NOT_GUARANTEED",
  usd_future_blocked:
    "BLOCKED_PENDING_EXPLICIT_SCENARIO_RATE_AUTHORITY",
});

const SUPPORTED_CURRENCIES = new Set(["UDI", "USD"]);
const VERIFIED_RATE_STATUSES = new Set([
  "VERIFIED_RATE_AVAILABLE",
  "VERIFIED_UDI_RATE_AVAILABLE",
  "VERIFIED_USD_FIX_RATE_AVAILABLE",
  "VERIFIED_SYNTHETIC_TEST_RATE",
]);
const ALLOWED_SOURCE_MODES = new Set(["LIVE", "CACHE", "SYNTHETIC_TEST"]);

function isRecord(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function deepFreeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  Object.freeze(value);
  for (const child of Object.values(value)) deepFreeze(child);
  return value;
}

function finiteNonNegative(value) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

function finitePositive(value) {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

function positiveInteger(value) {
  return Number.isInteger(value) && value > 0 ? value : null;
}

function round(value, digits = 6) {
  if (!Number.isFinite(value)) return null;
  const factor = 10 ** digits;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

function roundMxn(value) {
  return round(value, 2);
}

function normalizeCurrency(value) {
  if (typeof value !== "string") return null;
  const normalized = value.trim().toUpperCase();
  return SUPPORTED_CURRENCIES.has(normalized) ? normalized : null;
}

function normalizeText(value) {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  return normalized || null;
}

function moneyValue(money, expectedCurrency) {
  if (!isRecord(money)) return null;
  if (normalizeCurrency(money.currency) !== expectedCurrency) return null;
  return finiteNonNegative(money.value) ? money.value : null;
}

function mxnMoney(value, status, sourcePath, calculationMode) {
  return {
    value: Number.isFinite(value) ? roundMxn(value) : null,
    currency: "MXN",
    status,
    source_path: sourcePath,
    calculation_mode: calculationMode,
  };
}

function nullMxn(status, sourcePath, calculationMode) {
  return mxnMoney(null, status, sourcePath, calculationMode);
}

function requireCanonicalInputs(model, analytics) {
  if (!isRecord(model)) throw new TypeError("model must be an object");
  if (model?.schema?.id !== "forge.product_intelligence.orvi") {
    throw new TypeError("model must be canonical ORVI Product Intelligence");
  }
  if (model?.ownership?.canonical_owner !== "product-intelligence") {
    throw new TypeError("Product Intelligence must remain canonical owner");
  }
  if (!isRecord(analytics)) {
    throw new TypeError("analytics must be an object");
  }
  if (
    analytics?.analytics_id !==
    "orvi.guaranteed-value.dynamic-checkpoint-analytics.v1"
  ) {
    throw new TypeError("analytics must be canonical ORVI checkpoint analytics");
  }
  if (analytics?.canonical_owner !== "product-intelligence") {
    throw new TypeError("analytics canonical owner must be product-intelligence");
  }
  const modelCurrency = normalizeCurrency(model?.identity?.currency);
  const analyticsCurrency = normalizeCurrency(analytics?.currency);
  if (!modelCurrency || modelCurrency !== analyticsCurrency) {
    throw new TypeError("model and analytics currency must match UDI or USD");
  }
  if (
    positiveInteger(model?.premium_structure?.payment_term_years) === null ||
    model.premium_structure.payment_term_years !== analytics.payment_term_years
  ) {
    throw new TypeError("payment term must match model and analytics");
  }
  if (!Array.isArray(analytics?.checkpoints)) {
    throw new TypeError("analytics checkpoints are required");
  }
  if (analytics?.semantic_boundaries?.recommendation !== null) {
    throw new TypeError("recommendation must remain null");
  }
  if (analytics?.semantic_boundaries?.human_decision_required !== true) {
    throw new TypeError("human decision boundary is required");
  }
  return modelCurrency;
}

function expectedRateKey(currency) {
  return currency === "UDI" ? "UDI_MXN" : "USD_MXN_FIX";
}

function normalizeVerifiedRateMetadata(rateMetadata, currency) {
  if (!isRecord(rateMetadata)) {
    throw new TypeError("verified rate metadata is required");
  }

  const status = normalizeText(
    rateMetadata.status ?? rateMetadata.verification_status,
  );
  const rateKey = normalizeText(rateMetadata.rate_key ?? rateMetadata.rateKey);
  const value = Number(rateMetadata.value);
  const source = normalizeText(rateMetadata.source);
  const sourceDate = normalizeText(
    rateMetadata.source_date ?? rateMetadata.sourceDate ?? rateMetadata.date,
  );
  const sourceMode = normalizeText(
    rateMetadata.source_mode ?? rateMetadata.sourceMode,
  )?.toUpperCase();
  const cacheStatus = normalizeText(
    rateMetadata.cache_status ?? rateMetadata.cacheStatus,
  );
  const stale = rateMetadata.stale;
  const syntheticTest =
    rateMetadata.synthetic_test === true || rateMetadata.syntheticTest === true;

  if (!VERIFIED_RATE_STATUSES.has(status)) {
    throw new TypeError("rate status is not verified");
  }
  if (rateKey !== expectedRateKey(currency)) {
    throw new TypeError(`rate key must be ${expectedRateKey(currency)}`);
  }
  if (!finitePositive(value)) {
    throw new TypeError("verified rate value must be a finite positive number");
  }
  if (!source || !sourceDate || !sourceMode) {
    throw new TypeError("rate source, source date and source mode are required");
  }
  if (!ALLOWED_SOURCE_MODES.has(sourceMode)) {
    throw new TypeError("rate source mode must be LIVE, CACHE or SYNTHETIC_TEST");
  }
  if (stale !== false) {
    throw new TypeError("stale rate fallback is not authorized");
  }
  if (sourceMode === "SYNTHETIC_TEST" && !syntheticTest) {
    throw new TypeError("synthetic test mode must be explicit");
  }
  if (sourceMode !== "SYNTHETIC_TEST" && syntheticTest) {
    throw new TypeError("synthetic test flag is inconsistent");
  }

  return {
    status,
    rate_key: rateKey,
    value,
    source,
    source_date: sourceDate,
    source_mode: sourceMode,
    cache_status: cacheStatus,
    stale: false,
    synthetic_test: syntheticTest,
  };
}

function currentMxn(amount, rate, sourcePath) {
  if (!finiteNonNegative(amount)) {
    return nullMxn(
      "missing_source_amount",
      sourcePath,
      ORVI_MXN_EQUIVALENCE_CALCULATION_MODE.current,
    );
  }
  return mxnMoney(
    amount * rate.value,
    "current_verified_rate_equivalence",
    sourcePath,
    ORVI_MXN_EQUIVALENCE_CALCULATION_MODE.current,
  );
}

function projectedRate(baseRate, policyYear, annualGrowthRate) {
  const yearsFromBase = policyYearToProjectionOffset(policyYear);
  return {
    policy_year: policyYear,
    years_from_base: yearsFromBase,
    value: round(baseRate * (1 + annualGrowthRate) ** yearsFromBase, 6),
    currency: "MXN_PER_UDI",
    annual_growth_rate: annualGrowthRate,
    calculation_mode: ORVI_MXN_EQUIVALENCE_CALCULATION_MODE.udi_future,
    future_values_are_guaranteed: false,
  };
}

function projectedUdiMxn(amount, rate, sourcePath) {
  if (!finiteNonNegative(amount)) {
    return nullMxn(
      "missing_source_amount",
      sourcePath,
      ORVI_MXN_EQUIVALENCE_CALCULATION_MODE.udi_future,
    );
  }
  return mxnMoney(
    amount * rate.value,
    "projected_scenario_not_guaranteed",
    sourcePath,
    ORVI_MXN_EQUIVALENCE_CALCULATION_MODE.udi_future,
  );
}

function timelineRowsByYear(model, currency) {
  const rows = Array.isArray(model?.guaranteed_value_timeline)
    ? model.guaranteed_value_timeline
    : [];
  const map = new Map();
  for (const row of rows) {
    const year = positiveInteger(row?.policy_year);
    if (year === null || map.has(year)) continue;
    map.set(year, row);
  }
  return map;
}

function annualOutflowFromRow(row, currency) {
  const sourceTotal = moneyValue(row?.total_annual_outflow, currency);
  if (finiteNonNegative(sourceTotal)) {
    return {
      complete: true,
      value: sourceTotal,
      derivation: "source_total_annual_outflow",
    };
  }

  const base = moneyValue(row?.annual_premium, currency);
  const additional = moneyValue(row?.additional_premium, currency);
  if (finiteNonNegative(base) && finiteNonNegative(additional)) {
    return {
      complete: true,
      value: base + additional,
      derivation: "derived_from_source_components",
    };
  }

  return {
    complete: false,
    value: null,
    derivation: "incomplete_source_components",
  };
}

function projectedCumulativePaidThrough(
  model,
  policyYear,
  baseRate,
  annualGrowthRate,
  currency,
) {
  const rows = timelineRowsByYear(model, currency);
  const missingPolicyYears = [];
  const incompletePolicyYears = [];
  const annualPayments = [];
  let total = 0;

  for (let year = 1; year <= policyYear; year += 1) {
    const row = rows.get(year);
    if (!row) {
      missingPolicyYears.push(year);
      continue;
    }

    const outflow = annualOutflowFromRow(row, currency);
    if (!outflow.complete) {
      incompletePolicyYears.push(year);
      continue;
    }

    const rate = projectedRate(baseRate, year, annualGrowthRate);
    const amountMxn = outflow.value * rate.value;
    total += amountMxn;
    annualPayments.push({
      policy_year: year,
      source_amount: round(outflow.value, 6),
      source_currency: currency,
      projected_rate: rate,
      projected_amount_mxn: roundMxn(amountMxn),
      derivation: outflow.derivation,
    });
  }

  const complete =
    missingPolicyYears.length === 0 &&
    incompletePolicyYears.length === 0 &&
    annualPayments.length === policyYear;

  return {
    status: complete ? "complete" : "incomplete",
    value: complete ? roundMxn(total) : null,
    currency: "MXN",
    calculation_mode: ORVI_MXN_EQUIVALENCE_CALCULATION_MODE.udi_future,
    annual_payments: annualPayments,
    missing_policy_years: missingPolicyYears,
    incomplete_policy_years: incompletePolicyYears,
    future_values_are_guaranteed: false,
  };
}

function comparisonFromAmounts(totalRecovery, cumulativePaid, status) {
  const complete =
    finiteNonNegative(totalRecovery) && finiteNonNegative(cumulativePaid);
  const difference = complete ? totalRecovery - cumulativePaid : null;
  const ratio =
    complete && cumulativePaid > 0 ? totalRecovery / cumulativePaid : null;

  return {
    status: complete ? status : "not_evaluable",
    recovery_difference_mxn: mxnMoney(
      difference,
      complete ? status : "not_evaluable",
      "checkpoint.total_recovery_minus_cumulative_paid",
      status,
    ),
    recovery_ratio: ratio === null ? null : round(ratio, 6),
    recovery_percentage: ratio === null ? null : round(ratio * 100, 6),
    interpretation: "comparison_only_not_investment_return",
  };
}

function sourceCheckpointValues(checkpoint, currency) {
  return {
    cumulative_paid: moneyValue(
      checkpoint?.cumulative_paid_evidence?.cumulative_paid,
      currency,
    ),
    surrender_value: moneyValue(
      checkpoint?.guaranteed_values?.surrender_value,
      currency,
    ),
    cash_value: moneyValue(
      checkpoint?.guaranteed_values?.cash_value,
      currency,
    ),
    total_recovery: moneyValue(
      checkpoint?.guaranteed_values?.total_recovery,
      currency,
    ),
  };
}

function currentCheckpointEquivalence(checkpoint, rate, currency) {
  const source = sourceCheckpointValues(checkpoint, currency);
  const currentPaid = currentMxn(
    source.cumulative_paid,
    rate,
    `checkpoint[policy_year=${checkpoint.policy_year}].cumulative_paid`,
  );
  const currentRecovery = currentMxn(
    source.total_recovery,
    rate,
    `checkpoint[policy_year=${checkpoint.policy_year}].total_recovery`,
  );

  return {
    status:
      currentPaid.value !== null && currentRecovery.value !== null
        ? "complete"
        : "partial",
    cumulative_paid: currentPaid,
    surrender_value: currentMxn(
      source.surrender_value,
      rate,
      `checkpoint[policy_year=${checkpoint.policy_year}].surrender_value`,
    ),
    cash_value: currentMxn(
      source.cash_value,
      rate,
      `checkpoint[policy_year=${checkpoint.policy_year}].cash_value`,
    ),
    total_recovery: currentRecovery,
    comparison: comparisonFromAmounts(
      currentRecovery.value,
      currentPaid.value,
      ORVI_MXN_EQUIVALENCE_CALCULATION_MODE.current,
    ),
  };
}

function projectedUdiCheckpoint(
  checkpoint,
  model,
  rate,
  annualGrowthRate,
  currency,
) {
  const source = sourceCheckpointValues(checkpoint, currency);
  const checkpointRate = projectedRate(
    rate.value,
    checkpoint.policy_year,
    annualGrowthRate,
  );
  const projectedPaid = projectedCumulativePaidThrough(
    model,
    checkpoint.policy_year,
    rate.value,
    annualGrowthRate,
    currency,
  );
  const projectedRecovery = projectedUdiMxn(
    source.total_recovery,
    checkpointRate,
    `checkpoint[policy_year=${checkpoint.policy_year}].total_recovery`,
  );

  return {
    status:
      projectedPaid.status === "complete" && projectedRecovery.value !== null
        ? "complete"
        : "partial",
    scenario_label:
      ORVI_MXN_EQUIVALENCE_CALCULATION_MODE.udi_future,
    projected_rate: checkpointRate,
    cumulative_paid: projectedPaid,
    surrender_value: projectedUdiMxn(
      source.surrender_value,
      checkpointRate,
      `checkpoint[policy_year=${checkpoint.policy_year}].surrender_value`,
    ),
    cash_value: projectedUdiMxn(
      source.cash_value,
      checkpointRate,
      `checkpoint[policy_year=${checkpoint.policy_year}].cash_value`,
    ),
    total_recovery: projectedRecovery,
    comparison: comparisonFromAmounts(
      projectedRecovery.value,
      projectedPaid.value,
      ORVI_MXN_EQUIVALENCE_CALCULATION_MODE.udi_future,
    ),
    future_values_are_guaranteed: false,
  };
}

function blockedUsdFuture(policyYear) {
  return {
    status:
      ORVI_MXN_EQUIVALENCE_CALCULATION_MODE.usd_future_blocked,
    policy_year: policyYear,
    projected_rate: null,
    cumulative_paid: null,
    surrender_value: null,
    cash_value: null,
    total_recovery: null,
    comparison: null,
    annual_growth_rate: null,
    future_values_are_guaranteed: false,
  };
}

function sumAssuredProjection(
  sumAssured,
  currency,
  checkpoints,
  rate,
  authority,
) {
  const current = currentMxn(
    sumAssured,
    rate,
    "protection_summary.basic_sum_assured",
  );

  const checkpointScenarios = checkpoints.map((checkpoint) => {
    if (currency === "USD") {
      return {
        policy_year: checkpoint.policy_year,
        status:
          ORVI_MXN_EQUIVALENCE_CALCULATION_MODE.usd_future_blocked,
        projected_rate: null,
        projected_sum_assured_mxn: null,
        annual_growth_rate: null,
        future_values_are_guaranteed: false,
      };
    }

    const rateAtCheckpoint = projectedRate(
      rate.value,
      checkpoint.policy_year,
      authority.future_mxn.annual_growth_rate,
    );

    return {
      policy_year: checkpoint.policy_year,
      status: "projected_scenario_not_guaranteed",
      projected_rate: rateAtCheckpoint,
      projected_sum_assured_mxn: projectedUdiMxn(
        sumAssured,
        rateAtCheckpoint,
        "protection_summary.basic_sum_assured",
      ),
      annual_growth_rate: authority.future_mxn.annual_growth_rate,
      future_values_are_guaranteed: false,
    };
  });

  return {
    source_amount: finiteNonNegative(sumAssured) ? round(sumAssured, 6) : null,
    source_currency: currency,
    current_mxn: current,
    checkpoint_scenarios: checkpointScenarios,
  };
}

export function buildOrviMxnEquivalenceAndProjection({
  model,
  analytics,
  rate_metadata: rateMetadata,
} = {}) {
  const currency = requireCanonicalInputs(model, analytics);
  const authority = resolveOrviMxnProjectionAuthority(currency);
  if (authority.status !== "RESOLVED") {
    throw new TypeError("MXN authority is not resolved for source currency");
  }

  const rate = normalizeVerifiedRateMetadata(rateMetadata, currency);
  const checkpoints = analytics.checkpoints;
  const sumAssured = moneyValue(
    model?.protection_summary?.basic_sum_assured,
    currency,
  );

  const checkpointEquivalences = checkpoints.map((checkpoint) => ({
    policy_year: checkpoint.policy_year,
    attained_age: checkpoint.attained_age,
    payment_phase: checkpoint.payment_phase,
    current_mxn: currentCheckpointEquivalence(checkpoint, rate, currency),
    future_mxn:
      currency === "UDI"
        ? projectedUdiCheckpoint(
            checkpoint,
            model,
            rate,
            authority.future_mxn.annual_growth_rate,
            currency,
          )
        : blockedUsdFuture(checkpoint.policy_year),
  }));

  const result = {
    adapter_id: ORVI_MXN_EQUIVALENCE_ADAPTER_ID,
    authority_id: ORVI_MXN_PROJECTION_AUTHORITY_ID,
    canonical_owner: "product-intelligence",
    source_currency: currency,
    payment_term_years: analytics.payment_term_years,
    rate_metadata: {
      ...rate,
      value: round(rate.value, 6),
    },
    protection: {
      sum_assured: sumAssuredProjection(
        sumAssured,
        currency,
        checkpoints,
        rate,
        authority,
      ),
    },
    checkpoint_equivalences: checkpointEquivalences,
    readiness: {
      status:
        checkpointEquivalences.length > 0 &&
        checkpointEquivalences.every(
          (checkpoint) => checkpoint.current_mxn.status === "complete",
        )
          ? "READY"
          : "PARTIAL",
      current_mxn_equivalence: "implemented",
      future_udi_projection:
        currency === "UDI" ? "implemented" : "not_applicable",
      future_usd_projection:
        currency === "USD"
          ? ORVI_MXN_EQUIVALENCE_CALCULATION_MODE.usd_future_blocked
          : "not_applicable",
      runtime_wiring_authorized: false,
      dashboard_wiring_authorized: false,
    },
    semantic_boundaries: {
      current_mxn_is_equivalence_at_verified_rate: true,
      future_udi_is_scenario_not_guaranteed: currency === "UDI",
      future_usd_is_blocked: currency === "USD",
      cumulative_projected_paid_uses_each_payment_year_rate:
        currency === "UDI",
      recovery_ratio_is_investment_return: false,
      recommendation: null,
      human_decision_required: true,
      future_values_are_guaranteed: false,
    },
  };

  const validation = validateOrviMxnEquivalenceAndProjection(result);
  if (!validation.valid) {
    throw new TypeError(
      `Invalid ORVI MXN equivalence result: ${validation.errors.join(",")}`,
    );
  }
  return deepFreeze(result);
}

export function validateOrviMxnEquivalenceAndProjection(result) {
  const errors = [];

  if (!isRecord(result)) errors.push("RESULT_NOT_OBJECT");
  if (result?.adapter_id !== ORVI_MXN_EQUIVALENCE_ADAPTER_ID) {
    errors.push("ADAPTER_ID_INVALID");
  }
  if (result?.authority_id !== ORVI_MXN_PROJECTION_AUTHORITY_ID) {
    errors.push("AUTHORITY_ID_INVALID");
  }
  if (result?.canonical_owner !== "product-intelligence") {
    errors.push("CANONICAL_OWNER_INVALID");
  }
  if (!SUPPORTED_CURRENCIES.has(result?.source_currency)) {
    errors.push("SOURCE_CURRENCY_INVALID");
  }
  if (!Array.isArray(result?.checkpoint_equivalences)) {
    errors.push("CHECKPOINT_EQUIVALENCES_INVALID");
  }
  if (result?.rate_metadata?.stale !== false) {
    errors.push("STALE_RATE_NOT_ALLOWED");
  }
  if (result?.semantic_boundaries?.recommendation !== null) {
    errors.push("RECOMMENDATION_NOT_AUTHORIZED");
  }
  if (result?.semantic_boundaries?.human_decision_required !== true) {
    errors.push("HUMAN_DECISION_GATE_MISSING");
  }
  if (
    result?.semantic_boundaries?.recovery_ratio_is_investment_return !== false
  ) {
    errors.push("INVESTMENT_RETURN_MISCLASSIFICATION");
  }
  if (result?.semantic_boundaries?.future_values_are_guaranteed !== false) {
    errors.push("FUTURE_VALUE_GUARANTEE_INVALID");
  }
  if (result?.readiness?.runtime_wiring_authorized !== false) {
    errors.push("RUNTIME_WIRING_NOT_AUTHORIZED");
  }
  if (result?.readiness?.dashboard_wiring_authorized !== false) {
    errors.push("DASHBOARD_WIRING_NOT_AUTHORIZED");
  }

  if (result?.source_currency === "UDI") {
    if (
      result?.semantic_boundaries
        ?.cumulative_projected_paid_uses_each_payment_year_rate !== true
    ) {
      errors.push("PAYMENT_YEAR_RATE_ACCUMULATION_MISSING");
    }
    for (const checkpoint of result?.checkpoint_equivalences ?? []) {
      if (
        checkpoint?.future_mxn?.scenario_label !==
        ORVI_MXN_EQUIVALENCE_CALCULATION_MODE.udi_future
      ) {
        errors.push("UDI_SCENARIO_LABEL_INVALID");
      }
      if (checkpoint?.future_mxn?.future_values_are_guaranteed !== false) {
        errors.push("UDI_FUTURE_GUARANTEE_INVALID");
      }
    }
  }

  if (result?.source_currency === "USD") {
    for (const checkpoint of result?.checkpoint_equivalences ?? []) {
      if (
        checkpoint?.future_mxn?.status !==
          ORVI_MXN_EQUIVALENCE_CALCULATION_MODE.usd_future_blocked ||
        checkpoint?.future_mxn?.projected_rate !== null ||
        checkpoint?.future_mxn?.annual_growth_rate !== null
      ) {
        errors.push("USD_FUTURE_PATH_MUST_REMAIN_BLOCKED");
      }
    }
  }

  const serialized = JSON.stringify(result);
  if (/NaN|Infinity|undefined/.test(serialized)) {
    errors.push("NON_JSON_FINITE_VALUE_PRESENT");
  }
  if (
    /client_name|insured_name|advisor_name|email|phone|date_of_birth|curp|rfc/i.test(
      serialized,
    )
  ) {
    errors.push("PII_FIELD_PRESENT");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
