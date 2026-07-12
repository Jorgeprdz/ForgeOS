import {
  PRODUCT_DASHBOARD_CLASSES,
  createMetricRow,
  createMissingInformationSection,
  createPrimaryMetric,
  createProductDashboard,
  createProductDashboardSection,
  createRecommendedBenefitCard
} from "./forge-product-dashboard-template.js";

const IMAGINA_SER_PRODUCT_TYPE = "imagina_ser";

function normalizeKey(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function isImaginaSerProduct(input = {}) {
  const nativeResult = input.nativeResult || {};
  return [
    input.productType,
    input.productFamily,
    input.family,
    input.product,
    input.productName,
    input.plan,
    nativeResult.productType,
    nativeResult.productFamily,
    nativeResult.product,
    nativeResult.productName
  ].some((value) => normalizeKey(value).includes(IMAGINA_SER_PRODUCT_TYPE));
}

function normalizeBlocks(benefitSummary) {
  if (Array.isArray(benefitSummary)) return benefitSummary.filter(Boolean);
  if (Array.isArray(benefitSummary?.blocks)) return benefitSummary.blocks.filter(Boolean);
  if (Array.isArray(benefitSummary?.summaryBlocks)) return benefitSummary.summaryBlocks.filter(Boolean);
  return [];
}

function normalizeMissing(value) {
  const values = Array.isArray(value) ? value : value ? [value] : [];
  return values.map((item) => {
    if (typeof item === "string") return item;
    return item?.message || item?.reason || item?.label || null;
  }).filter(Boolean);
}

function unique(values) {
  return [...new Set(values.filter(Boolean).map((value) => String(value).trim()).filter(Boolean))];
}

function formatImaginaSerNumber(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return null;
  return new Intl.NumberFormat("es-MX", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(Math.round(number));
}

function formatImaginaSerLineValue(line) {
  if (!line) return null;
  if (line.text) return String(line.text);
  if (line.value === null || line.value === undefined || line.value === "") return null;
  if (typeof line.value === "object") return formatImaginaSerAmount(line.value);
  if (line.unit === "UDI") return `${formatImaginaSerNumber(line.value)} UDI`;
  if (line.unit === "MXN") return `≈ $${formatImaginaSerNumber(line.value)} MXN`;
  if (line.unit === "years") return `${formatImaginaSerNumber(line.value)} años`;
  return String(line.value);
}

function formatImaginaSerAmount(amount) {
  if (amount === null || amount === undefined || amount === "") return null;
  if (typeof amount !== "object") return formatImaginaSerNumber(amount);

  const udi = amount.udi ?? amount.amountUdi ?? amount.valueUdi ?? null;
  const mxn = amount.mxn ?? amount.mxnAtRetirement ?? amount.mxnCurrent ?? amount.projectedMxn ?? null;
  const values = [];
  if (udi !== null && Number.isFinite(Number(udi))) values.push(`${formatImaginaSerNumber(udi)} UDI`);
  if (mxn !== null && Number.isFinite(Number(mxn))) values.push(`≈ $${formatImaginaSerNumber(mxn)} MXN`);
  if (amount.targetAge !== null && amount.targetAge !== undefined && Number.isFinite(Number(amount.targetAge))) {
    values.push(`edad ${formatImaginaSerNumber(amount.targetAge)}`);
  }
  return values.join(" · ") || null;
}

function lineValue(line) {
  return formatImaginaSerLineValue(line);
}

function section({ key, kind, title, presentation = "metric_rows", items = [] }) {
  return Object.freeze({
    key,
    kind,
    title,
    presentation,
    items: Object.freeze(items.filter((item) => item?.value !== null && item?.value !== undefined && item?.value !== ""))
  });
}

function lineItems(block, predicate = () => true) {
  return (Array.isArray(block?.lines) ? block.lines : [])
    .filter(predicate)
    .map((line) => ({
      id: line.id || normalizeKey(line.label),
      label: commercialImaginaSerLabel(line),
      value: lineValue(line),
      evidence: line
    }));
}

function commercialImaginaSerLabel(line = {}) {
  const id = normalizeKey(line.id || line.label);
  if (id === "premium_paying_years") return "Plazo de aportación";
  if (id === "total_contributed_udi") return "Total aportado";
  if (id === "total_contributed_mxn_projected") return "Total aportado proyectado";
  return line.label || line.id || "Detalle";
}

function scenarioItems(retirementBlock, formatAmount, { omitBaseSinglePayment = false } = {}) {
  return (Array.isArray(retirementBlock?.scenarios) ? retirementBlock.scenarios : []).map((scenario) => {
    const isBase = normalizeKey(scenario.id || scenario.label) === "base";
    const values = [
      scenario.singlePayment && !(omitBaseSinglePayment && isBase)
        ? `Meta patrimonial: ${formatAmount(scenario.singlePayment)}`
        : null,
      scenario.monthlyIncome ? `Renta mensual: ${formatAmount(scenario.monthlyIncome)}` : null,
      scenario.annualIncome ? `Renta anual: ${formatAmount(scenario.annualIncome)}` : null
    ].filter(Boolean);

    return {
      id: scenario.id || normalizeKey(scenario.label),
      label: `Escenario ${scenario.label || scenario.id || "disponible"}`,
      value: values.join(" · ") || null,
      evidence: scenario
    };
  }).filter((item) => item.value);
}

function constructionItems(retirementBlock, formatAmount) {
  const scenarios = Array.isArray(retirementBlock?.scenarios) ? retirementBlock.scenarios : [];
  const base = scenarios.find((scenario) => normalizeKey(scenario.id || scenario.label) === "base") || null;
  if (!base) return [];

  const items = [];
  if (base.singlePayment) {
    items.push({
      id: "base_goal",
      label: "Meta patrimonial",
      value: formatAmount(base.singlePayment),
      evidence: base.singlePayment
    });
  }

  for (const accumulated of Array.isArray(base.accumulatedIncome) ? base.accumulatedIncome : []) {
    const targetAge = accumulated.toAge ?? accumulated.age ?? accumulated.targetAge;
    items.push({
      id: `accumulated_${targetAge || items.length + 1}`,
      label: targetAge ? `Valor futuro · edad ${targetAge}` : "Valor futuro",
      value: formatAmount(accumulated),
      evidence: accumulated
    });
  }

  for (const scenario of scenarioItems(retirementBlock, formatAmount, { omitBaseSinglePayment: true })) {
    items.push(scenario);
  }

  return items.filter((item) => item.value);
}

function blockItems(block) {
  const lines = lineItems(block);
  const rows = (Array.isArray(block?.rows) ? block.rows : []).map((row) => ({
    id: row.id || normalizeKey(row.label || row.title),
    label: row.label || row.title || block.title || "Detalle",
    value: row.text || row.value || row.amount || null,
    evidence: row
  }));
  return [...lines, ...rows].filter((item) => item.value !== null && item.value !== undefined && item.value !== "");
}

function buildImaginaSerDashboardModel(benefitSummary, { formatAmount = formatImaginaSerAmount } = {}) {
  const blocks = normalizeBlocks(benefitSummary);
  const contribution = blocks.find((block) => block.type === "contribution_summary") || null;
  const protection = blocks.find((block) => block.type === "protection_summary") || null;
  const retirement = blocks.find((block) => block.type === "retirement_scenarios") || null;
  const recommended = blocks.find((block) => block.type === "recommended_benefits") || null;
  const recovery = blocks.find((block) => block.type === "recovery_summary") || null;
  const missingBlocks = blocks.filter((block) => block.type === "missing_information");
  const knownTypes = new Set([
    "contribution_summary",
    "protection_summary",
    "retirement_scenarios",
    "recommended_benefits",
    "recovery_summary",
    "missing_information"
  ]);
  const otherBlocks = blocks.filter((block) => !knownTypes.has(block.type));

  const summaryItems = lineItems(contribution, (line) => line.id === "premium_paying_years");
  const contributionItems = lineItems(contribution, (line) => line.id !== "premium_paying_years");
  const builtItems = constructionItems(retirement, formatAmount);
  const protectionItems = lineItems(protection);
  const futureItems = scenarioItems(retirement, formatAmount);
  const recommendedItems = blockItems(recommended);
  const secondaryItems = [
    ...blockItems(recovery),
    ...otherBlocks.flatMap(blockItems)
  ];

  const sections = [
    section({ key: "summary", kind: "summary", title: "Resumen del plan", presentation: "primary_metrics", items: summaryItems }),
    section({ key: "contribution", kind: "contribution", title: "Lo que aportas", presentation: "primary_metrics", items: contributionItems }),
    section({ key: "contribution", kind: "construction", title: "Lo que construyes", presentation: "primary_metrics", items: builtItems }),
    section({ key: "protection", kind: "protection", title: "Lo que proteges", items: protectionItems }),
    section({ key: "recommended", kind: "recommended", title: "Beneficios recomendados", presentation: "recommended", items: recommendedItems }),
    section({ key: "other", kind: "secondary_details", title: "Otros detalles", items: secondaryItems })
  ].filter((item) => item.items.length);

  const missing = missingBlocks.flatMap((block) => [
    ...normalizeMissing(block.missing),
    ...(Array.isArray(block.lines) ? block.lines.map((line) => line.label || line.message || line.reason) : [])
  ]);
  if (!summaryItems.length) missing.push("Falta información estructurada para Resumen del plan");
  if (!contributionItems.length) missing.push("Faltan datos de aportación");
  if (!builtItems.length) missing.push("Faltan datos para mostrar Lo que construyes");
  if (!protectionItems.length) missing.push("Faltan datos de protección");
  if (!futureItems.length) missing.push("Faltan escenarios futuros con evidencia");
  if (!recommendedItems.length) missing.push("No hay beneficios recomendados con evidencia estructurada");
  if (!secondaryItems.length) missing.push("No hay otros detalles con evidencia estructurada");
  missing.push(...normalizeMissing(retirement?.missing));

  return Object.freeze({
    productType: IMAGINA_SER_PRODUCT_TYPE,
    sections: Object.freeze(sections),
    missingInformation: Object.freeze(unique(missing))
  });
}

function renderImaginaSerDashboard(model, { documentRef, appendValue } = {}) {
  if (!model || model.productType !== IMAGINA_SER_PRODUCT_TYPE) return null;
  const dashboard = createProductDashboard({ documentRef });
  dashboard.dataset.forgeProductType = IMAGINA_SER_PRODUCT_TYPE;
  dashboard.dataset.forgeProductLayout = "imagina_ser_desktop_r13g";

  for (const modelSection of model.sections || []) {
    const card = createProductDashboardSection({
      title: modelSection.title,
      key: modelSection.key,
      kind: modelSection.kind,
      documentRef
    });

    if (modelSection.presentation === "recommended") {
      const grid = (documentRef || globalThis.document).createElement("div");
      grid.className = PRODUCT_DASHBOARD_CLASSES.recommendedGrid;
      for (const item of modelSection.items) {
        grid.appendChild(createRecommendedBenefitCard({
          name: item.label,
          fields: [{ label: "Detalle", value: item.value }],
          appendValue,
          documentRef
        }));
      }
      card.appendChild(grid);
    } else {
      const grid = (documentRef || globalThis.document).createElement("div");
      grid.className = modelSection.presentation === "primary_metrics"
        ? PRODUCT_DASHBOARD_CLASSES.primaryMetricGrid
        : PRODUCT_DASHBOARD_CLASSES.metricRows;
      for (const item of modelSection.items) {
        const createItem = modelSection.presentation === "primary_metrics" ? createPrimaryMetric : createMetricRow;
        grid.appendChild(createItem({
          label: item.label,
          value: item.value,
          appendValue: appendValue ? (target) => appendValue(target, item.value) : undefined,
          documentRef
        }));
      }
      card.appendChild(grid);
    }

    dashboard.appendChild(card);
  }

  if (model.missingInformation?.length) {
    dashboard.appendChild(createMissingInformationSection({
      title: "Información pendiente",
      values: model.missingInformation,
      documentRef
    }));
  }

  return dashboard;
}

const api = Object.freeze({
  productType: IMAGINA_SER_PRODUCT_TYPE,
  formatImaginaSerNumber,
  formatImaginaSerAmount,
  isImaginaSerProduct,
  buildImaginaSerDashboardModel,
  renderImaginaSerDashboard
});

globalThis.ForgeImaginaSerProductDashboardAdapter = api;

export {
  IMAGINA_SER_PRODUCT_TYPE,
  formatImaginaSerNumber,
  formatImaginaSerAmount,
  isImaginaSerProduct,
  buildImaginaSerDashboardModel,
  renderImaginaSerDashboard
};
