import {
  buildImaginaSerDashboardModel,
  isImaginaSerProduct,
} from "./forge-imagina-ser-product-dashboard-adapter.js";
import {
  buildSegubecaDashboardModel,
  isSegubecaProduct,
} from "./forge-segubeca-product-dashboard-adapter.js";
import {
  buildOrviDashboardModel,
  isOrviProduct,
} from "./forge-orvi-product-dashboard-adapter.js";
import {
  buildVidaMujerDashboardModel,
  isVidaMujerProduct,
} from "../forge-alive-material3/forge-vida-mujer-product-dashboard-adapter.js?v=quote-calculator-parity-001";

const PRODUCT_SPECIFIC_DECISION_READ_MODEL_ID =
  "forge.quotes.product-specific-decision-read-model.v1";

const PRODUCT_TYPES = Object.freeze([
  "imagina_ser",
  "orvi",
  "segubeca",
  "vida_mujer",
]);

const BUCKET_KINDS = Object.freeze({
  imagina_ser: Object.freeze({
    summary: new Set(["summary", "contribution", "protection"]),
    benefits: new Set(["recommended", "secondary_details"]),
    projection: new Set(["construction"]),
  }),
  orvi: Object.freeze({
    summary: new Set(["protection"]),
    benefits: new Set(["secondary_details"]),
    projection: new Set(["future_scenario", "guaranteed_recovery"]),
  }),
  segubeca: Object.freeze({
    summary: new Set([
      "summary",
      "participants",
      "contribution",
      "education_goal",
      "payout",
      "protection",
    ]),
    benefits: new Set([
      "included_benefits",
      "additional_coverages",
      "secondary_details",
    ]),
    projection: new Set([]),
  }),
  vida_mujer: Object.freeze({
    summary: new Set(["contribution_summary", "protection_summary"]),
    benefits: new Set([
      "women_health_benefits",
      "recommended_benefits",
      "additional_coverages",
    ]),
    projection: new Set(["scheduled_endowments", "recovery_summary"]),
  }),
});

function hasValue(value) {
  return value !== null && value !== undefined && value !== "";
}

function deepFreeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  Object.freeze(value);
  for (const child of Object.values(value)) deepFreeze(child);
  return value;
}

function blocksFrom(summary) {
  if (Array.isArray(summary)) return summary.filter(Boolean);
  if (Array.isArray(summary?.blocks)) return summary.blocks.filter(Boolean);
  if (Array.isArray(summary?.summaryBlocks)) return summary.summaryBlocks.filter(Boolean);
  return [];
}

function productIntelligenceFrom(packet, calculation) {
  return calculation?.productIntelligence
    ?? calculation?.product_intelligence
    ?? calculation?.nativeResult?.productIntelligence
    ?? calculation?.nativeResult?.product_intelligence
    ?? packet?.productIntelligence
    ?? packet?.product_intelligence
    ?? packet?.nativeResult?.productIntelligence
    ?? packet?.nativeResult?.product_intelligence
    ?? null;
}

function selectDashboard({ calculation, benefitSummary }) {
  const input = { ...(calculation || {}), benefitSummary };
  if (isOrviProduct(input)) {
    return { productType: "orvi", model: buildOrviDashboardModel(input) };
  }
  if (isVidaMujerProduct(input)) {
    return {
      productType: "vida_mujer",
      model: buildVidaMujerDashboardModel(benefitSummary),
    };
  }
  if (isSegubecaProduct(input)) {
    return {
      productType: "segubeca",
      model: buildSegubecaDashboardModel(benefitSummary),
    };
  }
  if (isImaginaSerProduct(input)) {
    return {
      productType: "imagina_ser",
      model: buildImaginaSerDashboardModel(benefitSummary),
    };
  }
  return null;
}

function normalizeItem(item, index) {
  if (!item) return null;
  const label = item.label || item.title || item.name || item.id || `Detalle ${index + 1}`;
  const value = hasValue(item.value)
    ? item.value
    : hasValue(item.primary)
      ? item.primary
      : null;
  const secondary = hasValue(item.secondaryValue)
    ? item.secondaryValue
    : hasValue(item.secondary)
      ? item.secondary
      : null;
  const secondaryLabel = item.secondaryLabel || null;
  const fields = Array.isArray(item.fields)
    ? item.fields
      .filter((field) => hasValue(field?.value))
      .map((field) => ({ label: field.label || "Detalle", value: field.value }))
    : [];

  if (!hasValue(value) && !hasValue(secondary) && !fields.length) return null;
  return {
    id: item.id || null,
    role: item.role || null,
    label,
    value,
    secondaryLabel,
    secondary,
    fields,
    evidence: item.evidence || null,
  };
}

function normalizeSection(section, index) {
  if (!section) return null;
  const items = (section.items || [])
    .map(normalizeItem)
    .filter(Boolean);
  if (!items.length) return null;
  return {
    key: section.key || `section_${index + 1}`,
    kind: section.kind || section.key || "product_detail",
    title: section.title || "Detalle del producto",
    items,
  };
}

function explicitEducationHero(model) {
  const education = (model?.sections || []).find(
    (section) => section?.kind === "education_goal" || section?.key === "education_goal",
  );
  const candidate = education?.items?.[0] || null;
  if (!candidate || !hasValue(candidate.value)) return null;
  return {
    label: candidate.label || "Meta educativa",
    value: candidate.value,
    secondaryLabel: candidate.secondaryLabel || null,
    secondaryValue: candidate.secondaryValue || candidate.secondary || null,
    sourceField: candidate.id || null,
    sourceSection: "education_goal",
    evidence: candidate.evidence || null,
  };
}

function explicitOrviHero(model) {
  const protection = (model?.sections || []).find(
    (section) => section?.kind === "protection",
  );
  const candidate = protection?.items?.find((item) => item?.role === "primary") || null;
  if (!candidate || !hasValue(candidate.value)) return null;
  return {
    label: candidate.label || "Suma asegurada",
    value: candidate.value,
    secondaryLabel: candidate.secondaryLabel || null,
    secondaryValue: candidate.secondaryValue || null,
    sourceField: candidate.id || null,
    sourceSection: "protection",
    evidence: candidate.evidence || null,
  };
}

function heroFrom(productType, model) {
  if (productType === "segubeca") {
    return explicitEducationHero(model) || model?.hero || null;
  }
  if (productType === "orvi") {
    return explicitOrviHero(model) || model?.hero || null;
  }
  return model?.hero || null;
}

function flattenItems(model) {
  return (model?.sections || []).flatMap((section) => section?.items || []);
}

function normalizedKey(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function findMetric(model, patterns) {
  return flattenItems(model).find((item) => {
    const key = normalizedKey(`${item?.id || ""} ${item?.label || ""}`);
    return patterns.some((pattern) => key.includes(pattern));
  }) || null;
}

function mandatoryFacts({ packet, calculation, productIntelligence, model }) {
  const native = calculation?.nativeResult || packet?.nativeResult || {};
  const premium = productIntelligence?.premium_structure || {};
  const protection = productIntelligence?.protection_summary || {};
  const dashboardContribution = findMetric(model, [
    "annual_premium",
    "aportacion_anual",
    "prima_anual",
    "total_annual_premium",
  ]);
  const dashboardSumAssured = findMetric(model, [
    "sum_assured",
    "suma_asegurada",
    "proteccion_contratada",
  ]);
  const directAnnualContribution = premium.total_annual_premium
    ?? premium.basic_annual_premium
    ?? native.totalAnnualPremium
    ?? native.annualPremium
    ?? packet?.annualPremium
    ?? null;
  const directSumAssured = protection.basic_sum_assured
    ?? native.sumAssured
    ?? native.sumInsured
    ?? packet?.sumAssured
    ?? packet?.sumInsured
    ?? null;

  return {
    annualContribution: dashboardContribution || (hasValue(directAnnualContribution)
      ? { label: "Aportación anual", value: directAnnualContribution }
      : null),
    sumAssured: dashboardSumAssured || (hasValue(directSumAssured)
      ? { label: "Suma asegurada", value: directSumAssured }
      : null),
  };
}

function missingFrom(productIntelligence, benefitSummary, model) {
  const missing = [
    ...(model?.missingInformation || []),
    ...(productIntelligence?.missing_information || []),
    ...(productIntelligence?.validation?.missing_information || []),
  ];
  for (const block of blocksFrom(benefitSummary).filter(
    (entry) => entry?.type === "missing_information",
  )) {
    missing.push(...[block.missing, block.items, block.lines].flat().filter(Boolean));
  }
  return [...new Set(missing
    .map((item) => typeof item === "string"
      ? item
      : item?.message || item?.label || item?.field || item?.reason)
    .filter(Boolean))];
}

function bucketSections(productType, sections) {
  const config = BUCKET_KINDS[productType];
  const buckets = { summary: [], benefits: [], projection: [] };
  if (!config) return buckets;

  for (const section of sections) {
    if (config.projection.has(section.kind)) {
      buckets.projection.push(section);
    } else if (config.benefits.has(section.kind)) {
      buckets.benefits.push(section);
    } else {
      buckets.summary.push(section);
    }
  }
  return buckets;
}

export function buildProductSpecificDecisionReadModel({
  packet = null,
  calculation = null,
  benefitSummary = null,
} = {}) {
  const selected = selectDashboard({ calculation: calculation || packet, benefitSummary });
  if (!selected || !PRODUCT_TYPES.includes(selected.productType) || !selected.model) return null;

  const sections = (selected.model.sections || [])
    .map(normalizeSection)
    .filter(Boolean);
  const productIntelligence = productIntelligenceFrom(packet, calculation);
  const mandatory = mandatoryFacts({
    packet,
    calculation,
    productIntelligence,
    model: selected.model,
  });
  const hero = heroFrom(selected.productType, selected.model);

  return deepFreeze({
    readModelId: PRODUCT_SPECIFIC_DECISION_READ_MODEL_ID,
    supported: true,
    canonicalOwner: "existing-product-specific-authorities",
    productType: selected.productType,
    hero,
    mandatory,
    sections,
    buckets: bucketSections(selected.productType, sections),
    missingInformation: missingFrom(productIntelligence, benefitSummary, selected.model),
    humanDecisionRequired: selected.productType === "orvi"
      ? selected.model.humanDecisionRequired !== false
      : true,
    recommendation: selected.productType === "orvi"
      ? selected.model.recommendation ?? null
      : undefined,
  });
}

export const __productSpecificDecisionReadModelTest = Object.freeze({
  explicitEducationHero,
  explicitOrviHero,
  bucketSections,
  mandatoryFacts,
  selectDashboard,
});
