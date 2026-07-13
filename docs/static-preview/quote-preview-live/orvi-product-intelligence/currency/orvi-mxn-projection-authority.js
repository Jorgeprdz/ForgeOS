export const ORVI_MXN_PROJECTION_AUTHORITY_ID =
  "orvi.mxn-projection.engine-authority.v1";

export const ORVI_MXN_POLICY_YEAR_OFFSET_RULE = "policy_year_minus_one";

export const ORVI_MXN_PROJECTION_AUTHORITY = deepFreeze({
  canonical_owner: "product-intelligence",
  authority_id: ORVI_MXN_PROJECTION_AUTHORITY_ID,
  current_rate_policy: {
    provider_class: "BANXICO_VERIFIED_RATE_OR_CACHE",
    rate_value_persisted_here: false,
    rate_date_persisted_here: false,
    stale_rate_fallback_authorized: false,
  },
  currency_paths: {
    UDI: {
      source_currency: "UDI",
      current_mxn: {
        status: "READY_FOR_IMPLEMENTATION",
        rate_key: "UDI_MXN",
        conversion_mode: "CURRENT_VERIFIED_RATE",
        formula: "source_amount_times_verified_current_rate",
        verified_rate_required: true,
        guaranteed: false,
      },
      future_mxn: {
        status: "READY_FOR_SCENARIO_IMPLEMENTATION",
        rate_key: "UDI_MXN",
        projection_mode: "PROJECTED_UDI_4_5_PERCENT_SCENARIO_NOT_GUARANTEED",
        annual_growth_rate: 0.045,
        annual_growth_rate_authority:
          "DERIVED_SCENARIO_AND_PROJECTION_EVIDENCE_ONLY",
        policy_year_offset_rule: ORVI_MXN_POLICY_YEAR_OFFSET_RULE,
        explicit_scenario_label_required: true,
        verified_base_rate_required: true,
        guaranteed: false,
      },
    },
    USD: {
      source_currency: "USD",
      current_mxn: {
        status: "READY_FOR_IMPLEMENTATION",
        rate_key: "USD_MXN_FIX",
        conversion_mode: "CURRENT_VERIFIED_RATE",
        formula: "source_amount_times_verified_current_rate",
        verified_rate_required: true,
        guaranteed: false,
      },
      future_mxn: {
        status: "BLOCKED_PENDING_EXPLICIT_SCENARIO_RATE_AUTHORITY",
        rate_key: "USD_MXN_FIX",
        projection_mode: null,
        annual_growth_rate: null,
        annual_growth_rate_authority: "UNRESOLVED",
        policy_year_offset_rule: ORVI_MXN_POLICY_YEAR_OFFSET_RULE,
        explicit_scenario_label_required: true,
        verified_base_rate_required: true,
        guaranteed: false,
      },
    },
  },
  legacy_boundaries: {
    legacy_orvi_mxn_converter: {
      authority: "NO",
      reason:
        "legacy scenario surface assumes UDI and does not own source, product, or timing truth",
    },
    generic_currency_projection_math: {
      authority: "MATH_UTILITY_ONLY",
      reason:
        "caller must supply an authorized current rate and an authorized scenario assumption",
    },
    segubeca_udi_runtime: {
      authority: "NO_FOR_ORVI",
      reason: "product-specific runtime is not transferable authority",
    },
    tracked_orvi_workbook: {
      authority: "DERIVED_SCENARIO_EVIDENCE_ONLY",
      parser_authority: false,
      contractual_authority: false,
    },
  },
  implementation_authorization: {
    current_udi_to_mxn: true,
    projected_udi_to_mxn: true,
    current_usd_to_mxn: true,
    projected_usd_to_mxn: false,
    runtime_wiring: false,
    dashboard_wiring: false,
    recommendation: null,
    human_decision_required: true,
  },
  future_values_are_guaranteed: false,
});

function deepFreeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  Object.freeze(value);
  for (const child of Object.values(value)) deepFreeze(child);
  return value;
}

function normalizeCurrency(value) {
  return typeof value === "string" ? value.trim().toUpperCase() : "";
}

export function resolveOrviMxnProjectionAuthority(currency) {
  const normalized = normalizeCurrency(currency);
  const path = ORVI_MXN_PROJECTION_AUTHORITY.currency_paths[normalized];

  if (!path) {
    return deepFreeze({
      status: "BLOCKED_UNSUPPORTED_SOURCE_CURRENCY",
      currency: normalized || null,
      current_mxn: null,
      future_mxn: null,
      recommendation: null,
      human_decision_required: true,
    });
  }

  return deepFreeze({
    status: "RESOLVED",
    currency: normalized,
    current_mxn: structuredClone(path.current_mxn),
    future_mxn: structuredClone(path.future_mxn),
    recommendation: null,
    human_decision_required: true,
  });
}

export function policyYearToProjectionOffset(policyYear) {
  if (!Number.isInteger(policyYear) || policyYear <= 0) {
    throw new TypeError("policyYear must be a positive integer");
  }
  return policyYear - 1;
}

export function validateOrviMxnProjectionAuthority(authority) {
  const errors = [];

  if (authority?.canonical_owner !== "product-intelligence") {
    errors.push("CANONICAL_OWNER_INVALID");
  }

  if (authority?.authority_id !== ORVI_MXN_PROJECTION_AUTHORITY_ID) {
    errors.push("AUTHORITY_ID_INVALID");
  }

  const udi = authority?.currency_paths?.UDI;
  const usd = authority?.currency_paths?.USD;

  if (udi?.current_mxn?.rate_key !== "UDI_MXN") {
    errors.push("UDI_CURRENT_RATE_KEY_INVALID");
  }

  if (udi?.future_mxn?.annual_growth_rate !== 0.045) {
    errors.push("UDI_SCENARIO_RATE_INVALID");
  }

  if (udi?.future_mxn?.guaranteed !== false) {
    errors.push("UDI_FUTURE_GUARANTEE_INVALID");
  }

  if (usd?.current_mxn?.rate_key !== "USD_MXN_FIX") {
    errors.push("USD_CURRENT_RATE_KEY_INVALID");
  }

  if (
    usd?.future_mxn?.status !==
      "BLOCKED_PENDING_EXPLICIT_SCENARIO_RATE_AUTHORITY" ||
    usd?.future_mxn?.annual_growth_rate !== null
  ) {
    errors.push("USD_FUTURE_PATH_MUST_REMAIN_BLOCKED");
  }

  if (
    authority?.implementation_authorization?.projected_usd_to_mxn !== false
  ) {
    errors.push("USD_FUTURE_IMPLEMENTATION_NOT_AUTHORIZED");
  }

  if (authority?.implementation_authorization?.runtime_wiring !== false) {
    errors.push("RUNTIME_WIRING_NOT_AUTHORIZED");
  }

  if (authority?.implementation_authorization?.dashboard_wiring !== false) {
    errors.push("DASHBOARD_WIRING_NOT_AUTHORIZED");
  }

  if (authority?.implementation_authorization?.recommendation !== null) {
    errors.push("RECOMMENDATION_NOT_AUTHORIZED");
  }

  if (authority?.future_values_are_guaranteed !== false) {
    errors.push("FUTURE_VALUE_GUARANTEE_INVALID");
  }

  if (
    authority?.current_rate_policy?.rate_value_persisted_here !== false ||
    authority?.current_rate_policy?.rate_date_persisted_here !== false
  ) {
    errors.push("CURRENT_RATE_SNAPSHOT_MUST_NOT_BE_EMBEDDED");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
