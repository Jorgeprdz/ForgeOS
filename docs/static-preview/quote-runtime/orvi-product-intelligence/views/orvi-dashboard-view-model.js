export const ORVI_DASHBOARD_VIEW_MODEL_ID =
  "orvi.dashboard.dynamic-protection-recovery-view-model.v1";

export const ORVI_DASHBOARD_VIEW_IDS = Object.freeze({
  protection: "protection",
  guaranteed_recovery: "guaranteed_recovery",
});

export const ORVI_DASHBOARD_CONTRACT_VERSION = "R15I";

const SUPPORTED_CURRENCIES = new Set(["UDI", "USD"]);
const USD_FUTURE_BLOCK =
  "BLOCKED_PENDING_EXPLICIT_SCENARIO_RATE_AUTHORITY";
const UDI_FUTURE_SCENARIO =
  "PROJECTED_UDI_4_5_PERCENT_SCENARIO_NOT_GUARANTEED";

function isRecord(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function deepFreeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  Object.freeze(value);
  for (const child of Object.values(value)) deepFreeze(child);
  return value;
}

function clone(value) {
  return value === undefined ? null : structuredClone(value);
}

function normalizeCurrency(value) {
  if (typeof value !== "string") return null;
  const normalized = value.trim().toUpperCase();
  return SUPPORTED_CURRENCIES.has(normalized) ? normalized : null;
}

function positiveInteger(value) {
  return Number.isInteger(value) && value > 0 ? value : null;
}

function finiteNumberOrNull(value) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function sanitizeMoney(money, fallbackCurrency = null) {
  if (!isRecord(money)) {
    return {
      value: null,
      currency: fallbackCurrency,
      status: "missing",
      truth_status: null,
      guarantee_status: null,
      source_path: null,
    };
  }

  return {
    value: finiteNumberOrNull(money.value),
    currency:
      typeof money.currency === "string"
        ? money.currency.trim().toUpperCase()
        : fallbackCurrency,
    status:
      typeof money.status === "string"
        ? money.status
        : finiteNumberOrNull(money.value) === null
          ? "missing"
          : "available",
    truth_status:
      typeof money.truth_status === "string" ? money.truth_status : null,
    guarantee_status:
      typeof money.guarantee_status === "string"
        ? money.guarantee_status
        : null,
    source_path:
      typeof money.source_path === "string" ? money.source_path : null,
    calculation_mode:
      typeof money.calculation_mode === "string"
        ? money.calculation_mode
        : null,
  };
}

function requireInputs(model, analytics, mxnEquivalence) {
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
    throw new TypeError("analytics ID is not canonical R15F");
  }
  if (analytics?.canonical_owner !== "product-intelligence") {
    throw new TypeError("analytics canonical owner must be product-intelligence");
  }

  if (!isRecord(mxnEquivalence)) {
    throw new TypeError("mxn_equivalence must be an object");
  }
  if (
    mxnEquivalence?.adapter_id !==
    "orvi.mxn-equivalence-and-udi-projection-adapter.v1"
  ) {
    throw new TypeError("MXN equivalence adapter ID is not canonical R15H");
  }
  if (mxnEquivalence?.canonical_owner !== "product-intelligence") {
    throw new TypeError(
      "MXN equivalence canonical owner must be product-intelligence",
    );
  }

  const currencies = [
    normalizeCurrency(model?.identity?.currency),
    normalizeCurrency(analytics?.currency),
    normalizeCurrency(mxnEquivalence?.source_currency),
  ];
  if (currencies.some((value) => value === null)) {
    throw new TypeError("UDI or USD currency is required");
  }
  if (new Set(currencies).size !== 1) {
    throw new TypeError("model, analytics and MXN equivalence currency mismatch");
  }

  const paymentTerms = [
    positiveInteger(model?.premium_structure?.payment_term_years),
    positiveInteger(analytics?.payment_term_years),
    positiveInteger(mxnEquivalence?.payment_term_years),
  ];
  if (paymentTerms.some((value) => value === null)) {
    throw new TypeError("positive payment term is required");
  }
  if (new Set(paymentTerms).size !== 1) {
    throw new TypeError("payment term mismatch");
  }

  if (!Array.isArray(analytics?.checkpoints)) {
    throw new TypeError("analytics checkpoints are required");
  }
  if (!Array.isArray(mxnEquivalence?.checkpoint_equivalences)) {
    throw new TypeError("MXN checkpoint equivalences are required");
  }

  const analyticsYears = analytics.checkpoints.map((checkpoint) =>
    positiveInteger(checkpoint?.policy_year),
  );
  const mxnYears = mxnEquivalence.checkpoint_equivalences.map((checkpoint) =>
    positiveInteger(checkpoint?.policy_year),
  );

  if (
    analyticsYears.some((value) => value === null) ||
    mxnYears.some((value) => value === null) ||
    JSON.stringify(analyticsYears) !== JSON.stringify(mxnYears)
  ) {
    throw new TypeError("analytics and MXN checkpoint years must match exactly");
  }

  if (new Set(analyticsYears).size !== analyticsYears.length) {
    throw new TypeError("checkpoint years must be unique");
  }

  if (analytics?.semantic_boundaries?.recommendation !== null) {
    throw new TypeError("analytics recommendation must remain null");
  }
  if (mxnEquivalence?.semantic_boundaries?.recommendation !== null) {
    throw new TypeError("MXN recommendation must remain null");
  }
  if (
    analytics?.semantic_boundaries?.human_decision_required !== true ||
    mxnEquivalence?.semantic_boundaries?.human_decision_required !== true
  ) {
    throw new TypeError("human decision boundary is required");
  }

  return {
    currency: currencies[0],
    paymentTermYears: paymentTerms[0],
    checkpointYears: analyticsYears,
  };
}

function safeSourceComparison(checkpoint, currency) {
  const comparison = isRecord(checkpoint?.comparison)
    ? checkpoint.comparison
    : {};

  return {
    cumulative_paid: sanitizeMoney(
      checkpoint?.cumulative_paid_evidence?.cumulative_paid,
      currency,
    ),
    surrender_value: sanitizeMoney(
      checkpoint?.guaranteed_values?.surrender_value,
      currency,
    ),
    cash_value: sanitizeMoney(
      checkpoint?.guaranteed_values?.cash_value,
      currency,
    ),
    total_recovery: sanitizeMoney(
      checkpoint?.guaranteed_values?.total_recovery,
      currency,
    ),
    recovery_difference: sanitizeMoney(
      comparison?.recovery_difference,
      currency,
    ),
    recovery_ratio: finiteNumberOrNull(comparison?.recovery_ratio),
    recovery_percentage: finiteNumberOrNull(
      comparison?.recovery_percentage,
    ),
    break_even_status:
      typeof comparison?.break_even_status === "string"
        ? comparison.break_even_status
        : null,
    interpretation: "comparison_only_not_investment_return",
  };
}

function currentMxnComparison(currentMxn) {
  return {
    status:
      typeof currentMxn?.status === "string"
        ? currentMxn.status
        : "missing",
    cumulative_paid: sanitizeMoney(currentMxn?.cumulative_paid, "MXN"),
    surrender_value: sanitizeMoney(currentMxn?.surrender_value, "MXN"),
    cash_value: sanitizeMoney(currentMxn?.cash_value, "MXN"),
    total_recovery: sanitizeMoney(currentMxn?.total_recovery, "MXN"),
    recovery_difference: sanitizeMoney(
      currentMxn?.comparison?.recovery_difference_mxn,
      "MXN",
    ),
    recovery_ratio: finiteNumberOrNull(
      currentMxn?.comparison?.recovery_ratio,
    ),
    recovery_percentage: finiteNumberOrNull(
      currentMxn?.comparison?.recovery_percentage,
    ),
    interpretation: "comparison_only_not_investment_return",
  };
}

function futureMxnComparison(futureMxn, currency) {
  if (currency === "USD") {
    return {
      status: USD_FUTURE_BLOCK,
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
      interpretation: "comparison_only_not_investment_return",
    };
  }

  return {
    status:
      typeof futureMxn?.status === "string"
        ? futureMxn.status
        : "missing",
    scenario_label:
      typeof futureMxn?.scenario_label === "string"
        ? futureMxn.scenario_label
        : UDI_FUTURE_SCENARIO,
    projected_rate: clone(futureMxn?.projected_rate),
    cumulative_paid: clone(futureMxn?.cumulative_paid),
    surrender_value: sanitizeMoney(futureMxn?.surrender_value, "MXN"),
    cash_value: sanitizeMoney(futureMxn?.cash_value, "MXN"),
    total_recovery: sanitizeMoney(futureMxn?.total_recovery, "MXN"),
    recovery_difference: sanitizeMoney(
      futureMxn?.comparison?.recovery_difference_mxn,
      "MXN",
    ),
    recovery_ratio: finiteNumberOrNull(
      futureMxn?.comparison?.recovery_ratio,
    ),
    recovery_percentage: finiteNumberOrNull(
      futureMxn?.comparison?.recovery_percentage,
    ),
    future_values_are_guaranteed: false,
    interpretation: "comparison_only_not_investment_return",
  };
}

function buildProtectionView(model, mxnEquivalence, currency) {
  const sourceSumAssured = sanitizeMoney(
    model?.protection_summary?.basic_sum_assured,
    currency,
  );
  const mxnSumAssured = mxnEquivalence?.protection?.sum_assured;

  const futureScenarios = Array.isArray(mxnSumAssured?.checkpoint_scenarios)
    ? mxnSumAssured.checkpoint_scenarios.map((scenario) => ({
        policy_year: positiveInteger(scenario?.policy_year),
        status:
          typeof scenario?.status === "string"
            ? scenario.status
            : "missing",
        projected_rate: clone(scenario?.projected_rate),
        projected_sum_assured_mxn:
          currency === "UDI"
            ? sanitizeMoney(
                scenario?.projected_sum_assured_mxn,
                "MXN",
              )
            : null,
        annual_growth_rate:
          currency === "UDI"
            ? finiteNumberOrNull(scenario?.annual_growth_rate)
            : null,
        future_values_are_guaranteed: false,
      }))
    : [];

  return {
    view_id: ORVI_DASHBOARD_VIEW_IDS.protection,
    title: "Protección",
    purpose:
      "Presentar la protección contratada y sus equivalencias sin convertir el producto en inversión.",
    source_sum_assured: sourceSumAssured,
    current_mxn_equivalence: sanitizeMoney(
      mxnSumAssured?.current_mxn,
      "MXN",
    ),
    future_checkpoint_scenarios: futureScenarios,
    continuity_contract:
      "PROTECTION_CONTINUES_ACCORDING_TO_CONTRACTED_VARIANT",
    future_usd_status:
      currency === "USD" ? USD_FUTURE_BLOCK : "not_applicable",
    labels: {
      source_sum_assured: "Suma asegurada contratada",
      current_mxn_equivalence: "Equivalencia actual en MXN",
      future_scenario: "Escenario futuro estimado en MXN",
    },
  };
}

function buildRecoveryView(analytics, mxnEquivalence, currency) {
  const mxnByYear = new Map(
    mxnEquivalence.checkpoint_equivalences.map((checkpoint) => [
      checkpoint.policy_year,
      checkpoint,
    ]),
  );

  const checkpoints = analytics.checkpoints.map((checkpoint) => {
    const policyYear = positiveInteger(checkpoint?.policy_year);
    const mxnCheckpoint = mxnByYear.get(policyYear);

    return {
      checkpoint_id: `policy_year_${policyYear}`,
      policy_year: policyYear,
      attained_age: positiveInteger(checkpoint?.attained_age),
      payment_phase:
        typeof checkpoint?.payment_phase === "string"
          ? checkpoint.payment_phase
          : null,
      analytics_status:
        typeof checkpoint?.analytics_status === "string"
          ? checkpoint.analytics_status
          : null,
      source_currency: safeSourceComparison(checkpoint, currency),
      current_mxn: currentMxnComparison(mxnCheckpoint?.current_mxn),
      future_mxn: futureMxnComparison(
        mxnCheckpoint?.future_mxn,
        currency,
      ),
    };
  });

  return {
    view_id: ORVI_DASHBOARD_VIEW_IDS.guaranteed_recovery,
    title: "Recuperación garantizada",
    purpose:
      "Comparar aportaciones y valores de recuperación en checkpoints exactos de la cotización.",
    checkpoint_strategy:
      "payment_term_then_next_five_year_milestones",
    exact_checkpoint_years: checkpoints.map(
      (checkpoint) => checkpoint.policy_year,
    ),
    nearest_year_substitution: false,
    checkpoints,
    columns: [
      {
        key: "policy_year",
        label: "Año de póliza",
        semantic_role: "checkpoint_identity",
      },
      {
        key: "cumulative_paid",
        label: "Total aportado",
        semantic_role: "cumulative_paid",
      },
      {
        key: "total_recovery",
        label: "Recuperación total",
        semantic_role: "source_guaranteed_value_table",
      },
      {
        key: "recovery_difference",
        label: "Diferencia",
        semantic_role: "comparison",
      },
      {
        key: "recovery_percentage",
        label: "Porcentaje de recuperación",
        semantic_role: "comparison_only_not_investment_return",
      },
    ],
  };
}

export function buildOrviDashboardViewModel({
  model,
  analytics,
  mxn_equivalence: mxnEquivalence,
} = {}) {
  const input = requireInputs(model, analytics, mxnEquivalence);
  const protection = buildProtectionView(
    model,
    mxnEquivalence,
    input.currency,
  );
  const guaranteedRecovery = buildRecoveryView(
    analytics,
    mxnEquivalence,
    input.currency,
  );

  const result = {
    view_model_id: ORVI_DASHBOARD_VIEW_MODEL_ID,
    contract_version: ORVI_DASHBOARD_CONTRACT_VERSION,
    canonical_owner: "product-intelligence",
    consumer_surface: "dashboard_contract_only",
    source_currency: input.currency,
    payment_term_years: input.paymentTermYears,
    checkpoint_years: input.checkpointYears,
    navigation: [
      {
        view_id: ORVI_DASHBOARD_VIEW_IDS.protection,
        label: "Protección",
        order: 1,
      },
      {
        view_id: ORVI_DASHBOARD_VIEW_IDS.guaranteed_recovery,
        label: "Recuperación garantizada",
        order: 2,
      },
    ],
    rate_context: {
      rate_key:
        typeof mxnEquivalence?.rate_metadata?.rate_key === "string"
          ? mxnEquivalence.rate_metadata.rate_key
          : null,
      source:
        typeof mxnEquivalence?.rate_metadata?.source === "string"
          ? mxnEquivalence.rate_metadata.source
          : null,
      source_date:
        typeof mxnEquivalence?.rate_metadata?.source_date === "string"
          ? mxnEquivalence.rate_metadata.source_date
          : null,
      source_mode:
        typeof mxnEquivalence?.rate_metadata?.source_mode === "string"
          ? mxnEquivalence.rate_metadata.source_mode
          : null,
      stale: mxnEquivalence?.rate_metadata?.stale === false ? false : null,
      current_equivalence_only: true,
      rate_value_is_future_forecast: false,
    },
    views: {
      protection,
      guaranteed_recovery: guaranteedRecovery,
    },
    disclosure_contract: {
      product_classification: "LIFE_INSURANCE_PROTECTION",
      current_mxn:
        "EQUIVALENCE_AT_CALLER_SUPPLIED_VERIFIED_RATE",
      future_udi_mxn:
        input.currency === "UDI"
          ? UDI_FUTURE_SCENARIO
          : "not_applicable",
      future_usd_mxn:
        input.currency === "USD" ? USD_FUTURE_BLOCK : "not_applicable",
      source_values_origin:
        "ILLUSTRATIVE_QUOTE_VALUES_PRESERVED_FROM_PRODUCT_INTELLIGENCE",
      future_values_are_guaranteed: false,
      recovery_ratio_classification:
        "comparison_only_not_investment_return",
      recommendation: null,
      human_decision_required: true,
    },
    readiness: {
      status:
        protection.current_mxn_equivalence.value !== null &&
        guaranteedRecovery.checkpoints.length > 0
          ? "DASHBOARD_CONTRACT_READY"
          : "DASHBOARD_CONTRACT_PARTIAL",
      protection_view_contract: "ready",
      guaranteed_recovery_view_contract: "ready",
      dynamic_checkpoint_contract: "ready",
      runtime_wiring_authorized: false,
      ui_rendering_authorized: false,
      browser_validation_required_after_ui_wiring: true,
    },
  };

  const validation = validateOrviDashboardViewModel(result);
  if (!validation.valid) {
    throw new TypeError(
      `Invalid ORVI dashboard view model: ${validation.errors.join(",")}`,
    );
  }

  return deepFreeze(result);
}

export function validateOrviDashboardViewModel(result) {
  const errors = [];

  if (!isRecord(result)) errors.push("RESULT_NOT_OBJECT");
  if (result?.view_model_id !== ORVI_DASHBOARD_VIEW_MODEL_ID) {
    errors.push("VIEW_MODEL_ID_INVALID");
  }
  if (result?.contract_version !== ORVI_DASHBOARD_CONTRACT_VERSION) {
    errors.push("CONTRACT_VERSION_INVALID");
  }
  if (result?.canonical_owner !== "product-intelligence") {
    errors.push("CANONICAL_OWNER_INVALID");
  }
  if (result?.consumer_surface !== "dashboard_contract_only") {
    errors.push("CONSUMER_SURFACE_INVALID");
  }
  if (!SUPPORTED_CURRENCIES.has(result?.source_currency)) {
    errors.push("SOURCE_CURRENCY_INVALID");
  }

  const checkpointYears = result?.checkpoint_years;
  const recoveryYears =
    result?.views?.guaranteed_recovery?.exact_checkpoint_years;
  const recoveryCheckpoints =
    result?.views?.guaranteed_recovery?.checkpoints;

  if (!Array.isArray(checkpointYears) || checkpointYears.length === 0) {
    errors.push("CHECKPOINT_YEARS_INVALID");
  }
  if (
    !Array.isArray(recoveryYears) ||
    JSON.stringify(checkpointYears) !== JSON.stringify(recoveryYears)
  ) {
    errors.push("RECOVERY_CHECKPOINT_YEARS_MISMATCH");
  }
  if (
    !Array.isArray(recoveryCheckpoints) ||
    recoveryCheckpoints.length !== checkpointYears?.length
  ) {
    errors.push("RECOVERY_CHECKPOINT_COUNT_MISMATCH");
  }
  if (
    result?.views?.guaranteed_recovery?.nearest_year_substitution !== false
  ) {
    errors.push("NEAREST_YEAR_SUBSTITUTION_NOT_ALLOWED");
  }

  const navigationIds = Array.isArray(result?.navigation)
    ? result.navigation.map((item) => item?.view_id)
    : [];
  if (
    JSON.stringify(navigationIds) !==
    JSON.stringify([
      ORVI_DASHBOARD_VIEW_IDS.protection,
      ORVI_DASHBOARD_VIEW_IDS.guaranteed_recovery,
    ])
  ) {
    errors.push("NAVIGATION_CONTRACT_INVALID");
  }

  if (result?.disclosure_contract?.recommendation !== null) {
    errors.push("RECOMMENDATION_NOT_AUTHORIZED");
  }
  if (result?.disclosure_contract?.human_decision_required !== true) {
    errors.push("HUMAN_DECISION_GATE_MISSING");
  }
  if (
    result?.disclosure_contract?.future_values_are_guaranteed !== false
  ) {
    errors.push("FUTURE_VALUE_GUARANTEE_INVALID");
  }
  if (
    result?.disclosure_contract?.recovery_ratio_classification !==
    "comparison_only_not_investment_return"
  ) {
    errors.push("RECOVERY_RATIO_CLASSIFICATION_INVALID");
  }
  if (result?.readiness?.runtime_wiring_authorized !== false) {
    errors.push("RUNTIME_WIRING_NOT_AUTHORIZED");
  }
  if (result?.readiness?.ui_rendering_authorized !== false) {
    errors.push("UI_RENDERING_NOT_AUTHORIZED");
  }
  if (
    result?.readiness?.browser_validation_required_after_ui_wiring !== true
  ) {
    errors.push("BROWSER_VALIDATION_BOUNDARY_MISSING");
  }

  if (result?.source_currency === "UDI") {
    for (const checkpoint of recoveryCheckpoints ?? []) {
      if (
        checkpoint?.future_mxn?.scenario_label !== UDI_FUTURE_SCENARIO
      ) {
        errors.push("UDI_FUTURE_SCENARIO_LABEL_INVALID");
      }
      if (checkpoint?.future_mxn?.future_values_are_guaranteed !== false) {
        errors.push("UDI_FUTURE_GUARANTEE_INVALID");
      }
    }
  }

  if (result?.source_currency === "USD") {
    for (const checkpoint of recoveryCheckpoints ?? []) {
      if (
        checkpoint?.future_mxn?.status !== USD_FUTURE_BLOCK ||
        checkpoint?.future_mxn?.projected_rate !== null ||
        checkpoint?.future_mxn?.total_recovery !== null
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
  if (
    /cancel_now|continue_now|recommended_action|investment_return_rate/i.test(
      serialized,
    )
  ) {
    errors.push("UNAUTHORIZED_DECISION_OR_INVESTMENT_FIELD");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
