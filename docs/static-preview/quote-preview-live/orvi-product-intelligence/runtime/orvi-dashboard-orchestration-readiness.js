import {
  buildOrviMxnEquivalenceAndProjection,
  validateOrviMxnEquivalenceAndProjection,
} from "../currency/orvi-mxn-equivalence-adapter.js";
import {
  buildOrviDashboardViewModel,
  validateOrviDashboardViewModel,
} from "../views/orvi-dashboard-view-model.js";

export const ORVI_DASHBOARD_ORCHESTRATION_READINESS_ID =
  "orvi.dashboard.verified-rate-orchestration-readiness.v1";

export const ORVI_REUSABLE_TEMPLATE_AUTHORITY = deepFreeze({
  authority: "REUSABLE_PRODUCT_DASHBOARD_TEMPLATE",
  design_line: "VIDA_MUJER_ESTABLISHED_PRODUCT_DASHBOARD_SYSTEM",
  template_test: "tests/product-dashboard-template-test.mjs",
  layout_surface:
    "docs/static-preview/quote-preview-live/forge-benefit-summary-layout.js",
  renderer_surface:
    "docs/static-preview/quote-preview-live/forge-benefit-summary-renderer.js",
  existing_product_adapters: [
    "docs/static-preview/quote-preview-live/forge-imagina-ser-product-dashboard-adapter.js",
    "docs/static-preview/quote-preview-live/forge-segubeca-product-dashboard-adapter.js",
  ],
  create_new_dashboard_system: false,
  template_reuse_required: true,
  orvi_product_adapter_required: true,
  renderer_wiring_authorized: false,
  dom_wiring_authorized: false,
  visual_redesign_authorized: false,
});

function isRecord(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function deepFreeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  Object.freeze(value);
  for (const child of Object.values(value)) deepFreeze(child);
  return value;
}

function normalizeText(value) {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  return normalized || null;
}

function sanitizeRateContext(rateMetadata) {
  if (!isRecord(rateMetadata)) {
    throw new TypeError("verified rate metadata is required");
  }

  return {
    status: normalizeText(
      rateMetadata.status ?? rateMetadata.verification_status,
    ),
    rate_key: normalizeText(
      rateMetadata.rate_key ?? rateMetadata.rateKey,
    ),
    source: normalizeText(rateMetadata.source),
    source_date: normalizeText(
      rateMetadata.source_date ??
        rateMetadata.sourceDate ??
        rateMetadata.date,
    ),
    source_mode: normalizeText(
      rateMetadata.source_mode ?? rateMetadata.sourceMode,
    ),
    stale: rateMetadata.stale === false ? false : null,
    provider_call_performed: false,
    repository_cache_read_performed: false,
    rate_value_persisted_in_readiness_contract: false,
  };
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
    throw new TypeError("analytics must be canonical R15F");
  }
  if (analytics?.canonical_owner !== "product-intelligence") {
    throw new TypeError("analytics canonical owner must be product-intelligence");
  }
  if (analytics?.semantic_boundaries?.recommendation !== null) {
    throw new TypeError("recommendation must remain null");
  }
  if (analytics?.semantic_boundaries?.human_decision_required !== true) {
    throw new TypeError("human decision boundary is required");
  }
}

export function buildOrviDashboardOrchestrationReadiness({
  model,
  analytics,
  rate_metadata: rateMetadata,
} = {}) {
  requireCanonicalInputs(model, analytics);

  const mxnEquivalence = buildOrviMxnEquivalenceAndProjection({
    model,
    analytics,
    rate_metadata: rateMetadata,
  });
  const mxnValidation =
    validateOrviMxnEquivalenceAndProjection(mxnEquivalence);
  if (!mxnValidation.valid) {
    throw new TypeError(
      `R15H validation failed: ${mxnValidation.errors.join(",")}`,
    );
  }

  const viewModel = buildOrviDashboardViewModel({
    model,
    analytics,
    mxn_equivalence: mxnEquivalence,
  });
  const viewValidation = validateOrviDashboardViewModel(viewModel);
  if (!viewValidation.valid) {
    throw new TypeError(
      `R15I validation failed: ${viewValidation.errors.join(",")}`,
    );
  }

  const rateContext = sanitizeRateContext(rateMetadata);
  if (rateContext.stale !== false) {
    throw new TypeError("stale rate metadata is not authorized");
  }

  const result = {
    orchestration_id: ORVI_DASHBOARD_ORCHESTRATION_READINESS_ID,
    canonical_owner: "product-intelligence",
    product_family: "orvi",
    product_aliases: [
      "orvi",
      "orvi 99",
      "ordinario de vida",
    ],
    source_currency: viewModel.source_currency,
    payment_term_years: viewModel.payment_term_years,
    checkpoint_years: [...viewModel.checkpoint_years],
    rate_bridge: {
      ...rateContext,
      status: "VERIFIED_RATE_METADATA_BOUND",
    },
    product_intelligence_pipeline: {
      analytics_id: analytics.analytics_id,
      mxn_adapter_id: mxnEquivalence.adapter_id,
      dashboard_view_model_id: viewModel.view_model_id,
      status: "READY",
    },
    template_contract: structuredClone(
      ORVI_REUSABLE_TEMPLATE_AUTHORITY,
    ),
    consumer_payload: {
      view_model: viewModel,
    },
    readiness: {
      status:
        viewModel.readiness.status === "DASHBOARD_CONTRACT_READY"
          ? "READY_FOR_REUSABLE_TEMPLATE_PRODUCT_ADAPTER"
          : "PARTIAL",
      verified_rate_metadata_bridge: "implemented",
      product_adapter_implementation_authorized: true,
      existing_template_reuse_required: true,
      new_template_creation_authorized: false,
      renderer_wiring_authorized: false,
      dom_wiring_authorized: false,
      live_rate_provider_call_authorized: false,
      direct_cache_read_authorized: false,
      browser_validation_required_after_renderer_wiring: true,
    },
    semantic_boundaries: {
      product_classification: "LIFE_INSURANCE_PROTECTION",
      future_values_are_guaranteed: false,
      recovery_ratio_is_investment_return: false,
      recommendation: null,
      human_decision_required: true,
    },
  };

  const validation =
    validateOrviDashboardOrchestrationReadiness(result);
  if (!validation.valid) {
    throw new TypeError(
      `Invalid ORVI orchestration readiness: ${validation.errors.join(",")}`,
    );
  }

  return deepFreeze(result);
}

export function validateOrviDashboardOrchestrationReadiness(result) {
  const errors = [];

  if (!isRecord(result)) errors.push("RESULT_NOT_OBJECT");
  if (
    result?.orchestration_id !==
    ORVI_DASHBOARD_ORCHESTRATION_READINESS_ID
  ) {
    errors.push("ORCHESTRATION_ID_INVALID");
  }
  if (result?.canonical_owner !== "product-intelligence") {
    errors.push("CANONICAL_OWNER_INVALID");
  }
  if (result?.product_family !== "orvi") {
    errors.push("PRODUCT_FAMILY_INVALID");
  }
  if (result?.rate_bridge?.status !== "VERIFIED_RATE_METADATA_BOUND") {
    errors.push("RATE_BRIDGE_STATUS_INVALID");
  }
  if (result?.rate_bridge?.stale !== false) {
    errors.push("STALE_RATE_NOT_ALLOWED");
  }
  if (result?.rate_bridge?.provider_call_performed !== false) {
    errors.push("PROVIDER_CALL_NOT_ALLOWED");
  }
  if (
    result?.rate_bridge?.repository_cache_read_performed !== false
  ) {
    errors.push("DIRECT_CACHE_READ_NOT_ALLOWED");
  }
  if (
    result?.rate_bridge
      ?.rate_value_persisted_in_readiness_contract !== false
  ) {
    errors.push("RATE_VALUE_PERSISTENCE_NOT_ALLOWED");
  }

  const template = result?.template_contract;
  if (
    template?.authority !== "REUSABLE_PRODUCT_DASHBOARD_TEMPLATE"
  ) {
    errors.push("TEMPLATE_AUTHORITY_INVALID");
  }
  if (
    template?.design_line !==
    "VIDA_MUJER_ESTABLISHED_PRODUCT_DASHBOARD_SYSTEM"
  ) {
    errors.push("DESIGN_LINE_INVALID");
  }
  if (template?.template_reuse_required !== true) {
    errors.push("TEMPLATE_REUSE_NOT_REQUIRED");
  }
  if (template?.create_new_dashboard_system !== false) {
    errors.push("NEW_DASHBOARD_SYSTEM_NOT_ALLOWED");
  }
  if (
    template?.template_test !==
    "tests/product-dashboard-template-test.mjs"
  ) {
    errors.push("TEMPLATE_TEST_INVALID");
  }
  if (template?.renderer_wiring_authorized !== false) {
    errors.push("RENDERER_WIRING_NOT_AUTHORIZED");
  }
  if (template?.dom_wiring_authorized !== false) {
    errors.push("DOM_WIRING_NOT_AUTHORIZED");
  }

  if (
    result?.readiness?.status !==
    "READY_FOR_REUSABLE_TEMPLATE_PRODUCT_ADAPTER"
  ) {
    errors.push("READINESS_STATUS_INVALID");
  }
  if (
    result?.readiness?.existing_template_reuse_required !== true
  ) {
    errors.push("READINESS_TEMPLATE_REUSE_INVALID");
  }
  if (
    result?.readiness?.new_template_creation_authorized !== false
  ) {
    errors.push("READINESS_NEW_TEMPLATE_NOT_BLOCKED");
  }
  if (
    result?.readiness?.product_adapter_implementation_authorized !==
    true
  ) {
    errors.push("PRODUCT_ADAPTER_NOT_AUTHORIZED");
  }
  if (
    result?.readiness?.renderer_wiring_authorized !== false ||
    result?.readiness?.dom_wiring_authorized !== false
  ) {
    errors.push("RENDERER_OR_DOM_WIRING_NOT_AUTHORIZED");
  }
  if (
    result?.readiness?.browser_validation_required_after_renderer_wiring !==
    true
  ) {
    errors.push("BROWSER_VALIDATION_BOUNDARY_MISSING");
  }

  if (result?.semantic_boundaries?.recommendation !== null) {
    errors.push("RECOMMENDATION_NOT_AUTHORIZED");
  }
  if (
    result?.semantic_boundaries?.human_decision_required !== true
  ) {
    errors.push("HUMAN_DECISION_GATE_MISSING");
  }
  if (
    result?.semantic_boundaries?.future_values_are_guaranteed !== false
  ) {
    errors.push("FUTURE_VALUE_GUARANTEE_INVALID");
  }
  if (
    result?.semantic_boundaries
      ?.recovery_ratio_is_investment_return !== false
  ) {
    errors.push("INVESTMENT_RETURN_MISCLASSIFICATION");
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
    /new_dashboard_template|standalone_orvi_ui|recommended_action/i.test(
      serialized,
    )
  ) {
    errors.push("UNAUTHORIZED_UI_OR_DECISION_FIELD");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
