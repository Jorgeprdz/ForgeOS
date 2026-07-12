import {
  PRODUCT_DASHBOARD_CLASSES,
  createMetricRow,
  createMissingInformationSection,
  createPrimaryMetric,
  createProductDashboard,
  createProductDashboardSection,
  createRecommendedBenefitCard
} from "./forge-product-dashboard-template.js";

const SEGUBECA_PRODUCT_TYPE = "segubeca";

function normalizeKey(value) {
  return String(value || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function matchesSegubeca(value) {
  const key = normalizeKey(value).replace(/\s+/g, "");
  return key.includes("segubeca") || key.includes("segurosbeca");
}

function normalizeBlocks(benefitSummary) {
  if (Array.isArray(benefitSummary)) return benefitSummary.filter(Boolean);
  if (Array.isArray(benefitSummary?.blocks)) return benefitSummary.blocks.filter(Boolean);
  if (Array.isArray(benefitSummary?.summaryBlocks)) return benefitSummary.summaryBlocks.filter(Boolean);
  return [];
}

function blockType(block) {
  return normalizeKey(block?.type || block?.kind || block?.id || block?.key);
}

function isEducationGoalBlock(block) {
  const type = blockType(block);
  return type.includes("education") || type.includes("beca") || type.includes("payout") || type.includes("delivery");
}

function collectCandidates(input = {}) {
  const nativeResult = input.nativeResult || {};
  const context = input.context || {};
  const candidates = [
    input.productType,
    input.product_type,
    input.productFamily,
    input.product_family,
    input.family,
    input.product,
    input.productName,
    input.plan,
    nativeResult.productType,
    nativeResult.product_type,
    nativeResult.productFamily,
    nativeResult.product_family,
    nativeResult.product,
    nativeResult.productName,
    context.productType,
    context.product_type,
    context.productFamily,
    context.product_family,
    context.product,
    context.family
  ];

  for (const block of normalizeBlocks(input.benefitSummary || input.summary || input.blocks || input)) {
    candidates.push(block.type, block.kind, block.id, block.key, block.product, block.productType, block.product_type, block.title, block.label);
  }

  return candidates.filter((value) => value !== null && value !== undefined && value !== "");
}

function isSegubecaProduct(input = {}) {
  if (collectCandidates(input).some(matchesSegubeca)) return true;
  const blocks = normalizeBlocks(input.benefitSummary || input.summary || input.blocks || input);
  return blocks.some(isEducationGoalBlock);
}

function formatSegubecaNumber(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return null;
  return new Intl.NumberFormat("es-MX", {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0
  }).format(Math.round(number));
}

function formatSegubecaAmount(amount) {
  if (amount === null || amount === undefined || amount === "") return null;
  if (typeof amount !== "object") return formatSegubecaNumber(amount);

  const text = amount.text || amount.labelValue || amount.display;
  if (text) return String(text);

  const udi = amount.udi ?? amount.amountUdi ?? amount.valueUdi ?? amount.value_udi ?? null;
  const mxn = amount.mxn ?? amount.amountMxn ?? amount.valueMxn ?? amount.value_mxn ?? amount.projectedMxn ?? null;
  const usd = amount.usd ?? amount.amountUsd ?? amount.valueUsd ?? amount.value_usd ?? null;
  const values = [];

  if (udi !== null && Number.isFinite(Number(udi))) values.push(`${formatSegubecaNumber(udi)} UDI`);
  if (mxn !== null && Number.isFinite(Number(mxn))) values.push(`≈ $${formatSegubecaNumber(mxn)} MXN`);
  if (usd !== null && Number.isFinite(Number(usd))) values.push(`≈ $${formatSegubecaNumber(usd)} USD`);
  return values.join(" · ") || null;
}

function formatLineValue(line = {}) {
  if (line.text) return String(line.text);
  if (line.value === null || line.value === undefined || line.value === "") return null;
  if (typeof line.value === "object") return formatSegubecaAmount(line.value);
  if (line.unit === "UDI") return `${formatSegubecaNumber(line.value)} UDI`;
  if (line.unit === "MXN") return `≈ $${formatSegubecaNumber(line.value)} MXN`;
  if (line.unit === "USD") return `≈ $${formatSegubecaNumber(line.value)} USD`;
  if (line.unit === "years") return `${formatSegubecaNumber(line.value)} años`;
  if (line.unit === "months") return `${formatSegubecaNumber(line.value)} meses`;
  return String(line.value);
}

function normalizeMissing(value) {
  const values = Array.isArray(value) ? value : value ? [value] : [];
  return values
    .map((item) => {
      if (typeof item === "string") return item;
      return item?.label || item?.message || item?.reason || item?.field || "";
    })
    .map((item) => String(item).trim())
    .filter(Boolean);
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function section({ key, kind, title, presentation = "metric_rows", items = [] }) {
  return Object.freeze({
    key,
    kind,
    title,
    presentation,
    items: Object.freeze(items.filter((item) => item?.label && item?.value))
  });
}

function blockLines(block = {}) {
  block = block || {};
  const lines = [
    ...(Array.isArray(block.lines) ? block.lines : []),
    ...(Array.isArray(block.items) ? block.items : []),
    ...(Array.isArray(block.fields) ? block.fields : []),
    ...(Array.isArray(block.values) ? block.values : [])
  ];
  return lines.filter(Boolean);
}

function commercialSegubecaLabel(line = {}) {
  const id = normalizeKey(line.id || line.key || line.label).replace(/\s+/g, "_");
  const labels = {
    child_age: "Edad del menor",
    minor_age: "Edad del menor",
    payment_term: "Plazo de aportación",
    premium_paying_years: "Plazo de aportación",
    contribution_term: "Plazo de aportación",
    annual_premium: "Aportación anual",
    monthly_premium: "Aportación mensual",
    total_contributed: "Total aportado",
    total_contributed_udi: "Total aportado",
    education_goal: "Meta educativa",
    target_amount: "Meta educativa",
    payout_mode: "Forma de entrega",
    delivery_mode: "Forma de entrega",
    payout_duration: "Duración de entrega",
    monthly_payout: "Mensualidad educativa",
    single_payment: "Pago único",
    death_benefit: "Protección por fallecimiento",
    disability_waiver: "Exención por invalidez",
    premium_waiver: "Continuidad de aportaciones",
    primary_insured: "Asegurado principal",
    joint_insured: "Asegurado adicional",
    child_or_education_beneficiary: "Menor asociado",
    participant_modality: "Modalidad"
  };
  return labels[id] || line.label || line.id || line.key || "Detalle";
}

function lineItems(block, predicate = () => true) {
  return blockLines(block)
    .filter(predicate)
    .map((line) => ({
      id: line.id || line.key || normalizeKey(line.label),
      label: commercialSegubecaLabel(line),
      value: formatLineValue(line),
      evidence: line
    }))
    .filter((item) => item.value);
}

function participantValue(value) {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "object") {
    return value.name || value.label || value.role || value.value || null;
  }
  return String(value);
}

function modalityLabel(value) {
  const key = normalizeKey(value);
  if (!key) return null;
  if (["joint", "mancomunado", "mancomunada", "papas", "padres"].some((token) => key.includes(token))) return "Mancomunado";
  if (["individual", "single"].some((token) => key.includes(token))) return "Individual";
  return String(value);
}

function participantItems(block) {
  const participants = block?.participants || block?.participant_structure || block?.participantStructure || {};
  const modality = block?.participant_modality || block?.modality || participants.participant_modality || participants.modality;
  const items = [];

  const modalityValue = modalityLabel(modality);
  if (modalityValue) items.push({ id: "participant_modality", label: "Modalidad", value: modalityValue, evidence: modality });

  const primary = participantValue(participants.primary_insured ?? participants.primaryInsured ?? block?.primary_insured ?? block?.primaryInsured);
  const joint = participantValue(participants.joint_insured ?? participants.jointInsured ?? block?.joint_insured ?? block?.jointInsured);
  const child = participantValue(
    participants.child_or_education_beneficiary ??
    participants.childOrEducationBeneficiary ??
    participants.child ??
    participants.minor ??
    block?.child_or_education_beneficiary ??
    block?.childOrEducationBeneficiary ??
    block?.child ??
    block?.minor
  );

  if (primary) items.push({ id: "primary_insured", label: "Asegurado principal", value: primary, evidence: primary });
  if (joint) items.push({ id: "joint_insured", label: "Asegurado adicional", value: joint, evidence: joint });
  if (child) items.push({ id: "child_or_education_beneficiary", label: "Menor asociado", value: child, evidence: child });

  return [...items, ...lineItems(block)];
}

function blockItems(block) {
  return lineItems(block);
}

function recommendedItems(block) {
  const values = [
    ...(Array.isArray(block?.benefits) ? block.benefits : []),
    ...(Array.isArray(block?.coverages) ? block.coverages : []),
    ...(Array.isArray(block?.items) ? block.items : [])
  ];

  if (!values.length) return lineItems(block);

  return values.map((item) => ({
    label: item.name || item.label || item.id || "Beneficio",
    value: item.value || item.description || item.status || item.premium || item.sumAssured || "Con evidencia estructurada",
    evidence: item
  })).filter((item) => item.label && item.value);
}

function firstBlock(blocks, names) {
  const targets = new Set(names.map(normalizeKey));
  return blocks.find((block) => targets.has(blockType(block))) || null;
}

function buildSegubecaDashboardModel(benefitSummary) {
  const blocks = normalizeBlocks(benefitSummary);
  const summary = firstBlock(blocks, ["summary_plan", "plan_summary", "product_summary"]);
  const participants = firstBlock(blocks, ["participants", "participant_summary", "participant_structure", "insured_participants"]);
  const contribution = firstBlock(blocks, ["contribution_summary"]);
  const education = firstBlock(blocks, ["education_goal", "education_payout"]);
  const payout = firstBlock(blocks, ["payout_options", "delivery_options", "education_delivery"]);
  const protection = firstBlock(blocks, ["protection_summary"]);
  const included = firstBlock(blocks, ["included_benefits"]);
  const additional = firstBlock(blocks, ["additional_coverages", "recommended_benefits"]);
  const missingBlocks = blocks.filter((block) => blockType(block) === "missing information" || blockType(block) === "missing_information");
  const knownTypes = new Set([
    "summary_plan", "plan_summary", "product_summary", "participants", "participant_summary",
    "participant_structure", "insured_participants", "contribution_summary", "education_goal",
    "education_payout", "payout_options", "delivery_options", "education_delivery",
    "protection_summary", "included_benefits", "additional_coverages", "recommended_benefits",
    "missing_information", "missing information"
  ].map(normalizeKey));
  const secondaryBlocks = blocks.filter((block) => !knownTypes.has(blockType(block)));

  const sections = [
    section({ key: "summary", kind: "summary", title: "Resumen del plan", presentation: "primary_metrics", items: blockItems(summary) }),
    section({ key: "participants", kind: "participants", title: "Quiénes quedan protegidos", presentation: "primary_metrics", items: participantItems(participants) }),
    section({ key: "contribution", kind: "contribution", title: "Lo que aportas", presentation: "primary_metrics", items: blockItems(contribution) }),
    section({ key: "education_goal", kind: "education_goal", title: "Meta educativa", presentation: "primary_metrics", items: blockItems(education) }),
    section({ key: "payout", kind: "payout", title: "Cómo se entrega", items: blockItems(payout) }),
    section({ key: "protection", kind: "protection", title: "Lo que proteges", items: blockItems(protection) }),
    section({ key: "included_benefits", kind: "included_benefits", title: "Beneficios incluidos", items: recommendedItems(included) }),
    section({ key: "additional_coverages", kind: "additional_coverages", title: "Coberturas u opciones adicionales", items: recommendedItems(additional) }),
    section({ key: "other", kind: "secondary_details", title: "Otros detalles", items: secondaryBlocks.flatMap((block) => blockItems(block)) })
  ].filter((item) => item.items.length);

  const missing = missingBlocks.flatMap((block) => [
    ...normalizeMissing(block.missing),
    ...normalizeMissing(block.items),
    ...normalizeMissing(block.lines)
  ]);

  if (!participants || !participantItems(participants).length) missing.push("Falta estructura de participantes");
  if (!education || !blockItems(education).length) missing.push("Falta meta educativa con evidencia");
  if (!payout || !blockItems(payout).length) missing.push("Falta forma de entrega con evidencia");
  if (!contribution || !blockItems(contribution).length) missing.push("Faltan datos de aportación");
  if (!protection || !blockItems(protection).length) missing.push("Faltan datos de protección");

  return Object.freeze({
    productType: SEGUBECA_PRODUCT_TYPE,
    sections: Object.freeze(sections),
    missingInformation: Object.freeze(unique(missing))
  });
}

function appendItemGrid(card, modelSection, { documentRef, appendValue } = {}) {
  const documentTarget = documentRef || globalThis.document;
  const isPrimary = modelSection.presentation === "primary_metrics";
  const isRecommended = ["included_benefits", "additional_coverages", "recommended"].includes(modelSection.presentation) ||
    ["included_benefits", "additional_coverages"].includes(modelSection.kind);
  const grid = documentTarget.createElement("div");
  grid.className = isRecommended
    ? PRODUCT_DASHBOARD_CLASSES.recommendedGrid
    : isPrimary
      ? PRODUCT_DASHBOARD_CLASSES.primaryMetricGrid
      : PRODUCT_DASHBOARD_CLASSES.metricRows;

  for (const item of modelSection.items) {
    if (isRecommended) {
      grid.appendChild(createRecommendedBenefitCard({
        name: item.label,
        fields: [{ label: "Detalle", value: item.value }],
        appendValue,
        documentRef
      }));
    } else {
      const createItem = isPrimary ? createPrimaryMetric : createMetricRow;
      grid.appendChild(createItem({
        label: item.label,
        value: item.value,
        appendValue: appendValue ? (target) => appendValue(target, item.value) : item.value,
        documentRef
      }));
    }
  }
  card.appendChild(grid);
}

function renderSegubecaDashboard(model, { documentRef, appendValue } = {}) {
  if (!model || model.productType !== SEGUBECA_PRODUCT_TYPE) return null;
  const dashboard = createProductDashboard({ documentRef });
  dashboard.dataset.forgeProductType = SEGUBECA_PRODUCT_TYPE;
  dashboard.dataset.forgeProductLayout = "segubeca_desktop_r14a";

  for (const modelSection of model.sections || []) {
    const card = createProductDashboardSection({
      title: modelSection.title,
      key: modelSection.key,
      kind: modelSection.kind,
      documentRef
    });
    appendItemGrid(card, modelSection, { documentRef, appendValue });
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
  productType: SEGUBECA_PRODUCT_TYPE,
  formatSegubecaNumber,
  formatSegubecaAmount,
  isSegubecaProduct,
  buildSegubecaDashboardModel,
  renderSegubecaDashboard
});

globalThis.ForgeSegubecaProductDashboardAdapter = api;

export {
  SEGUBECA_PRODUCT_TYPE,
  formatSegubecaNumber,
  formatSegubecaAmount,
  isSegubecaProduct,
  buildSegubecaDashboardModel,
  renderSegubecaDashboard
};
