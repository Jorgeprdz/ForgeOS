import {
  PRODUCT_DASHBOARD_CLASSES,
  createDashboardChip,
  createMetricRow,
  createMissingInformationSection,
  createPrimaryMetric,
  createProductDashboard,
  createProductDashboardSection,
} from "./forge-product-dashboard-template.js";

export const ORVI_PRODUCT_TYPE = "orvi";
export const ORVI_PRODUCT_DASHBOARD_LAYOUT = "orvi_dynamic_r15k";
export const ORVI_PRODUCT_DASHBOARD_ADAPTER_ID =
  "orvi.reusable-product-dashboard-adapter.v1";

const ORVI_VIEW_MODEL_ID =
  "orvi.dashboard.dynamic-protection-recovery-view-model.v1";
const ORVI_ORCHESTRATION_ID =
  "orvi.dashboard.verified-rate-orchestration-readiness.v1";
const USD_FUTURE_BLOCK =
  "BLOCKED_PENDING_EXPLICIT_SCENARIO_RATE_AUTHORITY";

function isRecord(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function deepFreeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  Object.freeze(value);
  for (const child of Object.values(value)) deepFreeze(child);
  return value;
}

function normalizeKey(value) {
  return String(value || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function matchesOrvi(value) {
  const key = normalizeKey(value).replace(/\s+/g, "");
  return (
    key.includes("orvi") ||
    key.includes("orvi99") ||
    key.includes("ordinariodevida")
  );
}

function productCandidates(input = {}) {
  const nativeResult = input?.nativeResult || {};
  const context = input?.context || {};
  return [
    input?.productType,
    input?.product_type,
    input?.productFamily,
    input?.product_family,
    input?.family,
    input?.product,
    input?.productName,
    input?.plan,
    nativeResult?.productType,
    nativeResult?.product_type,
    nativeResult?.productFamily,
    nativeResult?.product_family,
    nativeResult?.product,
    nativeResult?.productName,
    context?.productType,
    context?.product_type,
    context?.productFamily,
    context?.product_family,
    context?.product,
    context?.family,
  ].filter(
    (value) => value !== null && value !== undefined && value !== "",
  );
}

function readinessCandidates(input = {}) {
  const nativeResult = input?.nativeResult || {};
  return [
    input?.orchestration_id === ORVI_ORCHESTRATION_ID ? input : null,
    input?.orviDashboardReadiness,
    input?.orvi_dashboard_readiness,
    input?.orchestrationReadiness,
    input?.orchestration_readiness,
    nativeResult?.orviDashboardReadiness,
    nativeResult?.orvi_dashboard_readiness,
  ].filter(Boolean);
}

function viewModelCandidates(input = {}) {
  const nativeResult = input?.nativeResult || {};
  const productIntelligence = input?.productIntelligence || {};
  return [
    input?.view_model_id === ORVI_VIEW_MODEL_ID ? input : null,
    input?.consumer_payload?.view_model,
    input?.consumerPayload?.viewModel,
    input?.orviDashboardViewModel,
    input?.orvi_dashboard_view_model,
    input?.dashboardViewModel,
    input?.dashboard_view_model,
    nativeResult?.orviDashboardViewModel,
    nativeResult?.orvi_dashboard_view_model,
    productIntelligence?.orviDashboardViewModel,
    productIntelligence?.orvi_dashboard_view_model,
    productIntelligence?.dashboard_view_model,
    ...readinessCandidates(input).map(
      (candidate) => candidate?.consumer_payload?.view_model,
    ),
  ].filter(Boolean);
}

export function resolveOrviDashboardViewModel(input = {}) {
  return (
    viewModelCandidates(input).find(
      (candidate) => candidate?.view_model_id === ORVI_VIEW_MODEL_ID,
    ) || null
  );
}

export function isOrviProduct(input = {}) {
  if (resolveOrviDashboardViewModel(input)) return true;
  if (
    readinessCandidates(input).some(
      (candidate) =>
        candidate?.orchestration_id === ORVI_ORCHESTRATION_ID &&
        candidate?.product_family === ORVI_PRODUCT_TYPE,
    )
  ) {
    return true;
  }
  return productCandidates(input).some(matchesOrvi);
}

export function formatOrviNumber(value, maximumFractionDigits = 2) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return null;
  return new Intl.NumberFormat("es-MX", {
    maximumFractionDigits,
    minimumFractionDigits: 0,
  }).format(numeric);
}

export function formatOrviMoney(
  money,
  { approximate = false, maximumFractionDigits = 2 } = {},
) {
  if (!isRecord(money)) return null;
  const numeric = Number(money.value);
  if (!Number.isFinite(numeric)) return null;

  const currency = String(money.currency || "").trim().toUpperCase();
  const formatted = formatOrviNumber(numeric, maximumFractionDigits);
  if (!formatted) return null;

  if (currency === "MXN") {
    return `${approximate ? "≈ " : ""}$${formatted} MXN`;
  }
  if (currency === "USD") return `$${formatted} USD`;
  if (currency === "UDI") return `${formatted} UDI`;
  return currency ? `${formatted} ${currency}` : formatted;
}

function formatPercentage(value) {
  const formatted = formatOrviNumber(value, 2);
  return formatted ? `${formatted}%` : null;
}

function formatRate(rate) {
  if (!isRecord(rate)) return null;
  const value = formatOrviNumber(rate.value, 6);
  return value ? `$${value} MXN por UDI` : null;
}

function pairValues(primary, secondary) {
  return [primary, secondary].filter(Boolean).join(" · ") || null;
}

function paymentPhaseLabel(value) {
  const key = normalizeKey(value);
  if (key === "payment completion") return "Fin del periodo de pago";
  if (key === "post payment") return "Después del periodo de pago";
  if (key === "during payment") return "Durante el periodo de pago";
  return value ? String(value) : null;
}

function statusLabel(value) {
  if (value === USD_FUTURE_BLOCK) {
    return "No disponible: falta un supuesto futuro USD/MXN autorizado";
  }
  if (value === "complete") return "Completo";
  if (value === "partial") return "Parcial";
  return value ? String(value) : null;
}

function item(label, value, evidence = null) {
  if (!label || value === null || value === undefined || value === "") {
    return null;
  }
  return { label: String(label), value: String(value), evidence };
}

function section({
  key,
  kind,
  title,
  presentation = "metric_rows",
  items = [],
}) {
  return {
    key,
    kind,
    title,
    presentation,
    items: items.filter(Boolean),
  };
}

function protectionSection(viewModel) {
  const protection = viewModel?.views?.protection || {};
  return section({
    key: "orvi_protection",
    kind: "protection",
    title: protection.title || "Protección",
    presentation: "primary_metrics",
    items: [
      item(
        protection?.labels?.source_sum_assured ||
          "Suma asegurada contratada",
        formatOrviMoney(protection?.source_sum_assured),
        protection?.source_sum_assured,
      ),
      item(
        protection?.labels?.current_mxn_equivalence ||
          "Equivalencia actual en MXN",
        formatOrviMoney(protection?.current_mxn_equivalence, {
          approximate: true,
        }),
        protection?.current_mxn_equivalence,
      ),
      item("Moneda contratada", viewModel?.source_currency),
      item(
        "Plazo de aportación",
        Number.isInteger(viewModel?.payment_term_years)
          ? `${viewModel.payment_term_years} años`
          : null,
      ),
    ],
  });
}

function futureProtectionSection(viewModel) {
  const scenarios =
    viewModel?.views?.protection?.future_checkpoint_scenarios || [];

  const items = scenarios
    .map((scenario) => {
      const policyYear = Number(scenario?.policy_year);
      if (!Number.isInteger(policyYear) || policyYear <= 0) return null;

      if (viewModel?.source_currency === "USD") {
        return {
          label: `Año ${policyYear}`,
          primary: "Proyección USD bloqueada",
          secondary: statusLabel(scenario?.status),
          evidence: scenario,
        };
      }

      return {
        label: `Año ${policyYear}`,
        primary:
          formatOrviMoney(scenario?.projected_sum_assured_mxn, {
            approximate: true,
            maximumFractionDigits: 0,
          }) || "Sin valor proyectado",
        secondary: pairValues(
          formatRate(scenario?.projected_rate),
          scenario?.future_values_are_guaranteed === false
            ? "Escenario, no garantía"
            : null,
        ),
        evidence: scenario,
      };
    })
    .filter(Boolean);

  return section({
    key: "orvi_future_protection",
    kind: "future_scenario",
    title:
      viewModel?.source_currency === "USD"
        ? "Escenario futuro de protección"
        : "Protección estimada en MXN",
    presentation: "chips",
    items,
  });
}

function currentRecoveryItems(checkpoint) {
  const source = checkpoint?.source_currency || {};
  const current = checkpoint?.current_mxn || {};

  return [
    item(
      "Total aportado",
      pairValues(
        formatOrviMoney(source?.cumulative_paid),
        formatOrviMoney(current?.cumulative_paid, {
          approximate: true,
        }),
      ),
    ),
    item(
      "Valor de rescate",
      pairValues(
        formatOrviMoney(source?.surrender_value),
        formatOrviMoney(current?.surrender_value, {
          approximate: true,
        }),
      ),
    ),
    item(
      "Valor en efectivo",
      pairValues(
        formatOrviMoney(source?.cash_value),
        formatOrviMoney(current?.cash_value, {
          approximate: true,
        }),
      ),
    ),
    item(
      "Recuperación total",
      pairValues(
        formatOrviMoney(source?.total_recovery),
        formatOrviMoney(current?.total_recovery, {
          approximate: true,
        }),
      ),
    ),
    item(
      "Diferencia actual",
      formatOrviMoney(current?.recovery_difference, {
        approximate: true,
      }),
    ),
    item(
      "Porcentaje de recuperación",
      formatPercentage(current?.recovery_percentage),
      { classification: "comparison_only_not_investment_return" },
    ),
  ];
}

function futureRecoveryItems(checkpoint, sourceCurrency) {
  const future = checkpoint?.future_mxn || {};

  if (sourceCurrency === "USD") {
    return [
      item(
        "Escenario futuro USD/MXN",
        statusLabel(future?.status || USD_FUTURE_BLOCK),
      ),
    ];
  }

  return [
    item("UDI proyectada", formatRate(future?.projected_rate)),
    item(
      "Total aportado proyectado",
      formatOrviMoney(future?.cumulative_paid, {
        approximate: true,
      }),
    ),
    item(
      "Valor de rescate proyectado",
      formatOrviMoney(future?.surrender_value, {
        approximate: true,
      }),
    ),
    item(
      "Valor en efectivo proyectado",
      formatOrviMoney(future?.cash_value, {
        approximate: true,
      }),
    ),
    item(
      "Recuperación total proyectada",
      formatOrviMoney(future?.total_recovery, {
        approximate: true,
      }),
    ),
    item(
      "Diferencia proyectada",
      formatOrviMoney(future?.recovery_difference, {
        approximate: true,
      }),
    ),
    item(
      "Porcentaje proyectado",
      formatPercentage(future?.recovery_percentage),
      { classification: "comparison_only_not_investment_return" },
    ),
  ];
}

function recoverySections(viewModel) {
  const checkpoints =
    viewModel?.views?.guaranteed_recovery?.checkpoints || [];

  return checkpoints.map((checkpoint) => {
    const policyYear = Number(checkpoint?.policy_year);
    return section({
      key: `orvi_recovery_year_${policyYear}`,
      kind: "guaranteed_recovery",
      title: [
        `Año ${policyYear}`,
        paymentPhaseLabel(checkpoint?.payment_phase),
      ]
        .filter(Boolean)
        .join(" · "),
      items: [
        ...currentRecoveryItems(checkpoint),
        ...futureRecoveryItems(checkpoint, viewModel?.source_currency),
      ],
    });
  });
}

function disclosureSection(viewModel) {
  const disclosure = viewModel?.disclosure_contract || {};
  const rate = viewModel?.rate_context || {};

  return section({
    key: "orvi_disclosures",
    kind: "secondary_details",
    title: "Cómo leer estos valores",
    items: [
      item("Tipo de producto", "Seguro de vida con protección"),
      item(
        "Equivalencia actual",
        rate?.source_date
          ? `Calculada con tasa verificada de fecha ${rate.source_date}`
          : "Calculada con tasa verificada",
      ),
      item(
        "Valores futuros",
        disclosure?.future_values_are_guaranteed === false
          ? "Son escenarios estimados, no garantías contractuales"
          : null,
      ),
      item(
        "Porcentaje de recuperación",
        "Es una comparación, no un rendimiento de inversión",
      ),
      item(
        "Decisión",
        disclosure?.human_decision_required === true
          ? "La decisión corresponde a la persona y su asesor"
          : null,
      ),
    ],
  });
}

export function buildOrviDashboardModel(input = {}) {
  const viewModel = resolveOrviDashboardViewModel(input);
  if (!viewModel) return null;

  if (viewModel?.view_model_id !== ORVI_VIEW_MODEL_ID) {
    throw new TypeError("ORVI dashboard view model ID is invalid");
  }
  if (viewModel?.canonical_owner !== "product-intelligence") {
    throw new TypeError("Product Intelligence must remain canonical owner");
  }
  if (
    !Array.isArray(viewModel?.checkpoint_years) ||
    viewModel.checkpoint_years.length === 0
  ) {
    throw new TypeError("ORVI dynamic checkpoints are required");
  }
  if (viewModel?.disclosure_contract?.recommendation !== null) {
    throw new TypeError("ORVI recommendation must remain null");
  }
  if (
    viewModel?.disclosure_contract?.human_decision_required !== true
  ) {
    throw new TypeError("ORVI human decision boundary is required");
  }

  const sections = [
    protectionSection(viewModel),
    futureProtectionSection(viewModel),
    ...recoverySections(viewModel),
    disclosureSection(viewModel),
  ].filter((value) => value?.items?.length);

  const missingInformation = [];
  if (!viewModel?.views?.protection?.source_sum_assured?.value) {
    missingInformation.push("Falta suma asegurada con evidencia");
  }
  if (!viewModel?.views?.protection?.current_mxn_equivalence?.value) {
    missingInformation.push("Falta equivalencia actual en MXN");
  }
  if (!viewModel?.views?.guaranteed_recovery?.checkpoints?.length) {
    missingInformation.push("Faltan checkpoints de recuperación");
  }

  return deepFreeze({
    adapterId: ORVI_PRODUCT_DASHBOARD_ADAPTER_ID,
    productType: ORVI_PRODUCT_TYPE,
    layout: ORVI_PRODUCT_DASHBOARD_LAYOUT,
    templateAuthority: "REUSABLE_PRODUCT_DASHBOARD_TEMPLATE",
    designLine: "VIDA_MUJER_ESTABLISHED_PRODUCT_DASHBOARD_SYSTEM",
    viewModelId: viewModel.view_model_id,
    sourceCurrency: viewModel.source_currency,
    checkpointYears: [...viewModel.checkpoint_years],
    navigation: Array.isArray(viewModel.navigation)
      ? viewModel.navigation.map((entry) => ({ ...entry }))
      : [],
    sections,
    missingInformation,
    recommendation: null,
    humanDecisionRequired: true,
  });
}

function appendSectionItems(
  card,
  modelSection,
  { documentRef, appendValue } = {},
) {
  const documentTarget = documentRef || globalThis.document;

  if (modelSection.presentation === "chips") {
    const grid = documentTarget.createElement("div");
    grid.className = PRODUCT_DASHBOARD_CLASSES.chipGrid;
    for (const value of modelSection.items) {
      grid.appendChild(
        createDashboardChip({
          label: value.label,
          primary: value.primary,
          secondary: value.secondary,
          documentRef,
        }),
      );
    }
    card.appendChild(grid);
    return;
  }

  const primary = modelSection.presentation === "primary_metrics";
  const grid = documentTarget.createElement("div");
  grid.className = primary
    ? PRODUCT_DASHBOARD_CLASSES.primaryMetricGrid
    : PRODUCT_DASHBOARD_CLASSES.metricRows;

  for (const value of modelSection.items) {
    const createItem = primary ? createPrimaryMetric : createMetricRow;
    grid.appendChild(
      createItem({
        label: value.label,
        value: value.value,
        appendValue: appendValue
          ? (target) => appendValue(target, value.value)
          : undefined,
        documentRef,
      }),
    );
  }
  card.appendChild(grid);
}

export function renderOrviDashboard(
  model,
  { documentRef, appendValue } = {},
) {
  if (!model || model.productType !== ORVI_PRODUCT_TYPE) return null;
  if (
    model.templateAuthority !== "REUSABLE_PRODUCT_DASHBOARD_TEMPLATE"
  ) {
    throw new TypeError("ORVI must use the reusable product dashboard");
  }

  const dashboard = createProductDashboard({ documentRef });
  dashboard.dataset.forgeProductType = ORVI_PRODUCT_TYPE;
  dashboard.dataset.forgeProductLayout = ORVI_PRODUCT_DASHBOARD_LAYOUT;
  dashboard.dataset.forgeProductTemplate = "vida_mujer_reusable";
  dashboard.dataset.forgeOrviViews = "protection,guaranteed_recovery";

  for (const modelSection of model.sections || []) {
    const card = createProductDashboardSection({
      title: modelSection.title,
      key: modelSection.key,
      kind: modelSection.kind,
      documentRef,
    });
    appendSectionItems(card, modelSection, {
      documentRef,
      appendValue,
    });
    dashboard.appendChild(card);
  }

  if (model.missingInformation?.length) {
    dashboard.appendChild(
      createMissingInformationSection({
        title: "Información pendiente",
        values: model.missingInformation,
        documentRef,
      }),
    );
  }

  return dashboard;
}

const api = Object.freeze({
  adapterId: ORVI_PRODUCT_DASHBOARD_ADAPTER_ID,
  productType: ORVI_PRODUCT_TYPE,
  layout: ORVI_PRODUCT_DASHBOARD_LAYOUT,
  isOrviProduct,
  resolveOrviDashboardViewModel,
  formatOrviNumber,
  formatOrviMoney,
  buildOrviDashboardModel,
  renderOrviDashboard,
});

globalThis.ForgeOrviProductDashboardAdapter = api;
