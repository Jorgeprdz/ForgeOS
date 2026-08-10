import {
  buildProductSpecificDecisionReadModel as buildBaseProductSpecificDecisionReadModel,
} from "./forge-product-specific-decision-read-model.js";
import {
  buildGmmDashboardModel,
  isGmmProduct,
} from "./forge-gmm-product-decision-adapter.js";

const READ_MODEL_ID = "forge.quotes.product-specific-decision-read-model.v1";

function deepFreeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  Object.freeze(value);
  for (const child of Object.values(value)) deepFreeze(child);
  return value;
}

function findItem(model, id) {
  return (model?.sections || [])
    .flatMap((section) => section?.items || [])
    .find((item) => item?.id === id) || null;
}

function mandatoryFacts(model) {
  const premium = findItem(model, "annual_premium");
  const sumAssured = findItem(model, "sum_assured");
  return {
    annualContribution: premium
      ? { label: premium.label, value: premium.value, evidence: premium.evidence || null }
      : null,
    sumAssured: sumAssured
      ? { label: sumAssured.label, value: sumAssured.value, evidence: sumAssured.evidence || null }
      : null,
  };
}

function gmmBuckets(sections) {
  const summaryKinds = new Set(["medical_plan", "cost_sharing", "premium"]);
  const benefitKinds = new Set(["medical_coverage"]);
  const buckets = { summary: [], benefits: [], projection: [] };
  for (const section of sections || []) {
    if (benefitKinds.has(section.kind)) buckets.benefits.push(section);
    else if (summaryKinds.has(section.kind)) buckets.summary.push(section);
    else buckets.summary.push(section);
  }
  return buckets;
}

export function buildProductSpecificDecisionReadModel({
  packet = null,
  calculation = null,
  benefitSummary = null,
} = {}) {
  const input = calculation || packet || {};
  if (!isGmmProduct(input) && !isGmmProduct(packet || {})) {
    return buildBaseProductSpecificDecisionReadModel({
      packet,
      calculation,
      benefitSummary,
    });
  }

  const model = buildGmmDashboardModel({
    ...(packet || {}),
    ...(calculation || {}),
    nativeResult: calculation?.nativeResult || packet?.nativeResult || {},
    productIntelligence:
      calculation?.productIntelligence
      || calculation?.product_intelligence
      || packet?.productIntelligence
      || packet?.product_intelligence
      || null,
  });

  const sections = model.sections || [];
  return deepFreeze({
    readModelId: READ_MODEL_ID,
    supported: true,
    canonicalOwner: "existing-product-specific-authorities",
    productType: "gmm",
    hero: model.hero || null,
    mandatory: mandatoryFacts(model),
    sections,
    buckets: gmmBuckets(sections),
    missingInformation: model.missingInformation || [],
    humanDecisionRequired: true,
    recommendation: undefined,
    safety: {
      recalculationAllowed: false,
      forecastAllowed: false,
      compensationInfluenceAllowed: false,
      automaticActionAllowed: false,
      unknownIsZero: false,
    },
  });
}

export const __productSpecificDecisionReadModel006Test = Object.freeze({
  findItem,
  gmmBuckets,
  mandatoryFacts,
});
