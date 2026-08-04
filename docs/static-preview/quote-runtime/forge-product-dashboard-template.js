const PRODUCT_DASHBOARD_CLASSES = Object.freeze({
  dashboard: "fq-benefit-dashboard-107z15p2",
  card: "fq-benefit-card-107z15p2",
  cardTitle: "fq-benefit-card-title-107z15p2",
  metricRows: "fq-benefit-rows-107z15p2",
  metricRow: "fq-benefit-row-107z15p2",
  primaryMetricGrid: "fq-benefit-mini-grid-107z15p2",
  primaryMetric: "fq-benefit-mini-card-107z15p2",
  heroMetric: "fq-benefit-hero-metric-r16b",
  heroLabel: "fq-benefit-hero-label-r16b",
  heroValue: "fq-benefit-hero-value-r16b",
  heroSecondary: "fq-benefit-hero-secondary-r16b",
  heroSecondaryLabel: "fq-benefit-hero-secondary-label-r16b",
  heroSecondaryValue: "fq-benefit-hero-secondary-value-r16b",
  compactMetadata: "fq-benefit-compact-metadata-r16b",
  compactMetadataItem: "fq-benefit-compact-metadata-item-r16b",
  compactMetadataLabel: "fq-benefit-compact-metadata-label-r16b",
  compactMetadataValue: "fq-benefit-compact-metadata-value-r16b",
  label: "fq-benefit-label-107z15p2",
  value: "fq-benefit-value-107z15p2",
  valuePart: "fq-benefit-value-part-107z15p2",
  chipGrid: "fq-benefit-dotal-chips-107z15p2",
  chip: "fq-benefit-dotal-chip-107z15p2",
  chipLabel: "fq-benefit-dotal-year-107z15p2",
  chipPrimary: "fq-benefit-dotal-udi-107z15p2",
  chipSecondary: "fq-benefit-dotal-mxn-107z15p2",
  recommendedGrid: "fq-benefit-recommended-grid-107z15p2",
  recommendedCard: "fq-benefit-recommended-card-107z15p2",
  recommendedName: "fq-benefit-recommended-name-107z15p2",
  recommendedFields: "fq-benefit-recommended-fields-107z15p2",
  recommendedField: "fq-benefit-recommended-field-107z15p2",
  missingList: "fq-benefit-missing-list-107z15p2"
});

const PRODUCT_DASHBOARD_THEME = Object.freeze({
  title: "#f4d85d",
  primaryValue: "#f5dc6c",
  secondaryValue: "#76c9ee",
  label: "rgba(226, 232, 240, .76)",
  positive: "#8bd6a4",
  muted: "rgba(148, 163, 184, .76)",
  line: "rgba(125, 211, 252, .14)",
  panel: "rgba(8, 20, 39, .72)",
  tile: "rgba(255, 255, 255, .035)"
});

const PRODUCT_DASHBOARD_SECTION_KINDS = Object.freeze([
  "hero",
  "metadata",
  "participants",
  "summary",
  "contribution",
  "construction",
  "protection",
  "future_scenario",
  "recommended",
  "secondary_details",
  "missing_information"
]);

function requireDocument(documentRef) {
  const target = documentRef || globalThis.document;
  if (!target?.createElement) {
    throw new TypeError("Product dashboard rendering requires a document");
  }
  return target;
}

function appendContent(target, content) {
  if (typeof content === "function") {
    content(target);
    return;
  }
  if (content !== null && content !== undefined) {
    target.textContent = String(content);
  }
}

function normalizeProductDashboardSection(section = {}) {
  const key = String(section.key || section.kind || "secondary_details").trim() || "secondary_details";
  return Object.freeze({
    key,
    kind: String(section.kind || key).trim() || "secondary_details",
    title: String(section.title || "").trim(),
    presentation: String(section.presentation || "metric_rows").trim() || "metric_rows",
    layoutRole: String(section.layoutRole || section.kind || key).trim(),
    order: Number.isInteger(section.order) ? section.order : null,
    desktopSpan: Number.isInteger(section.desktopSpan) ? section.desktopSpan : null,
    tabletSpan: Number.isInteger(section.tabletSpan) ? section.tabletSpan : null,
    items: Object.freeze(Array.isArray(section.items) ? [...section.items] : [])
  });
}

function applyProductDashboardLayoutData(node, {
  layoutRole,
  order,
  desktopSpan,
  tabletSpan,
} = {}) {
  if (layoutRole) node.dataset.forgeLayoutRole = String(layoutRole);
  if (Number.isInteger(order)) node.dataset.forgeLayoutOrder = String(order);
  if (Number.isInteger(desktopSpan)) node.dataset.forgeDesktopSpan = String(desktopSpan);
  if (Number.isInteger(tabletSpan)) node.dataset.forgeTabletSpan = String(tabletSpan);
  return node;
}

function createProductDashboard({ documentRef } = {}) {
  const documentTarget = requireDocument(documentRef);
  const dashboard = documentTarget.createElement("div");
  dashboard.className = PRODUCT_DASHBOARD_CLASSES.dashboard;
  dashboard.dataset.forgeProductDashboard = "true";
  return dashboard;
}

function findCenteredGridItemIndexes(items, spanProperty, columns) {
  const centered = new Set();
  let row = [];
  let used = 0;
  const flush = () => {
    if (row.length === 1 && row[0].span < columns) centered.add(row[0].index);
    row = [];
    used = 0;
  };

  items.forEach((item, index) => {
    const rawSpan = Number(item?.[spanProperty]);
    const span = Number.isInteger(rawSpan) && rawSpan > 0
      ? Math.min(rawSpan, columns)
      : columns;
    if (used && used + span > columns) flush();
    row.push({ index, span });
    used += span;
    if (used >= columns) flush();
  });
  if (row.length) flush();
  return centered;
}

function applyAlignedDashboardGrid(dashboard) {
  const children = Array.from(dashboard?.children || []).filter((node) =>
    node?.dataset?.forgeDesktopSpan || node?.dataset?.forgeTabletSpan,
  );
  const items = children.map((node) => ({
    desktopSpan: Number(node.dataset.forgeDesktopSpan),
    tabletSpan: Number(node.dataset.forgeTabletSpan),
  }));
  const desktopCentered = findCenteredGridItemIndexes(items, "desktopSpan", 12);
  const tabletCentered = findCenteredGridItemIndexes(items, "tabletSpan", 8);
  children.forEach((node, index) => {
    if (desktopCentered.has(index)) node.dataset.forgeDesktopCentered = "true";
    if (tabletCentered.has(index)) node.dataset.forgeTabletCentered = "true";
  });
  return dashboard;
}

function createProductDashboardSection({
  title,
  key,
  kind,
  layoutRole,
  order,
  desktopSpan,
  tabletSpan,
  documentRef,
} = {}) {
  const documentTarget = requireDocument(documentRef);
  const section = documentTarget.createElement("section");
  section.className = PRODUCT_DASHBOARD_CLASSES.card;
  section.dataset.forgeBenefitBlock = String(key || kind || "secondary_details");
  section.dataset.forgeProductSection = String(kind || key || "secondary_details");
  applyProductDashboardLayoutData(section, {
    layoutRole,
    order,
    desktopSpan,
    tabletSpan,
  });

  if (title) {
    const heading = documentTarget.createElement("h4");
    heading.className = PRODUCT_DASHBOARD_CLASSES.cardTitle;
    heading.textContent = String(title);
    section.appendChild(heading);
  }

  return section;
}

function createDashboardHeroMetric({
  label,
  value,
  appendValue,
  secondaryLabel,
  secondaryValue,
  appendSecondaryValue,
  sourceField,
  order = 1,
  desktopSpan = 8,
  tabletSpan = 8,
  documentRef,
} = {}) {
  const documentTarget = requireDocument(documentRef);
  const hero = createProductDashboardSection({
    key: "hero",
    kind: "hero",
    layoutRole: "hero",
    order,
    desktopSpan,
    tabletSpan,
    documentRef: documentTarget,
  });
  hero.className = `${PRODUCT_DASHBOARD_CLASSES.card} ${PRODUCT_DASHBOARD_CLASSES.heroMetric}`;
  hero.dataset.forgeHeroMetric = "true";
  if (sourceField) hero.dataset.forgeHeroSourceField = String(sourceField);

  const labelNode = documentTarget.createElement("h4");
  labelNode.className = PRODUCT_DASHBOARD_CLASSES.heroLabel;
  labelNode.textContent = String(label || "");

  const valueNode = documentTarget.createElement("div");
  valueNode.className = PRODUCT_DASHBOARD_CLASSES.heroValue;
  appendContent(valueNode, appendValue || value);
  hero.append(labelNode, valueNode);

  if (secondaryValue !== null && secondaryValue !== undefined && String(secondaryValue).trim()) {
    const secondary = documentTarget.createElement("div");
    secondary.className = PRODUCT_DASHBOARD_CLASSES.heroSecondary;
    if (secondaryLabel) {
      const secondaryLabelNode = documentTarget.createElement("div");
      secondaryLabelNode.className = PRODUCT_DASHBOARD_CLASSES.heroSecondaryLabel;
      secondaryLabelNode.textContent = String(secondaryLabel);
      secondary.appendChild(secondaryLabelNode);
    }
    const secondaryValueNode = documentTarget.createElement("div");
    secondaryValueNode.className = PRODUCT_DASHBOARD_CLASSES.heroSecondaryValue;
    appendContent(secondaryValueNode, appendSecondaryValue || secondaryValue);
    secondary.appendChild(secondaryValueNode);
    hero.appendChild(secondary);
  }

  return hero;
}

function createCompactMetadataGrid({ items = [], appendValue, documentRef } = {}) {
  const documentTarget = requireDocument(documentRef);
  const list = documentTarget.createElement("dl");
  list.className = PRODUCT_DASHBOARD_CLASSES.compactMetadata;
  list.dataset.forgeCompactMetadata = "true";

  for (const item of items) {
    if (!item?.label || item?.value === null || item?.value === undefined || item?.value === "") continue;
    const row = documentTarget.createElement("div");
    row.className = PRODUCT_DASHBOARD_CLASSES.compactMetadataItem;

    const labelNode = documentTarget.createElement("dt");
    labelNode.className = PRODUCT_DASHBOARD_CLASSES.compactMetadataLabel;
    labelNode.textContent = String(item.label);

    const valueNode = documentTarget.createElement("dd");
    valueNode.className = PRODUCT_DASHBOARD_CLASSES.compactMetadataValue;
    appendContent(valueNode, appendValue ? (target) => appendValue(target, item.value) : item.value);

    row.append(labelNode, valueNode);
    list.appendChild(row);
  }

  return list;
}

function createMetricRow({ label, value, appendValue, documentRef } = {}) {
  const documentTarget = requireDocument(documentRef);
  const row = documentTarget.createElement("div");
  row.className = PRODUCT_DASHBOARD_CLASSES.metricRow;

  const labelNode = documentTarget.createElement("div");
  labelNode.className = PRODUCT_DASHBOARD_CLASSES.label;
  labelNode.textContent = String(label || "");

  const valueNode = documentTarget.createElement("div");
  valueNode.className = PRODUCT_DASHBOARD_CLASSES.value;
  appendContent(valueNode, appendValue || value);

  row.append(labelNode, valueNode);
  return row;
}

function createPrimaryMetric({ label, value, appendValue, documentRef } = {}) {
  const documentTarget = requireDocument(documentRef);
  const metric = documentTarget.createElement("div");
  metric.className = PRODUCT_DASHBOARD_CLASSES.primaryMetric;

  const labelNode = documentTarget.createElement("div");
  labelNode.className = PRODUCT_DASHBOARD_CLASSES.label;
  labelNode.textContent = String(label || "");

  const valueNode = documentTarget.createElement("div");
  valueNode.className = PRODUCT_DASHBOARD_CLASSES.value;
  appendContent(valueNode, appendValue || value);

  metric.append(labelNode, valueNode);
  return metric;
}

function createDashboardChip({ label, primary, secondary, documentRef } = {}) {
  const documentTarget = requireDocument(documentRef);
  const chip = documentTarget.createElement("div");
  chip.className = PRODUCT_DASHBOARD_CLASSES.chip;

  const labelNode = documentTarget.createElement("span");
  labelNode.className = PRODUCT_DASHBOARD_CLASSES.chipLabel;
  labelNode.textContent = String(label || "");

  const primaryNode = documentTarget.createElement("strong");
  primaryNode.className = PRODUCT_DASHBOARD_CLASSES.chipPrimary;
  primaryNode.textContent = String(primary || "");

  chip.append(labelNode, primaryNode);

  if (secondary !== null && secondary !== undefined && String(secondary).trim()) {
    const secondaryNode = documentTarget.createElement("span");
    secondaryNode.className = PRODUCT_DASHBOARD_CLASSES.chipSecondary;
    secondaryNode.textContent = String(secondary);
    chip.appendChild(secondaryNode);
  }

  return chip;
}

function createRecommendedBenefitCard({ name, fields = [], appendValue, documentRef } = {}) {
  const documentTarget = requireDocument(documentRef);
  const card = documentTarget.createElement("article");
  card.className = PRODUCT_DASHBOARD_CLASSES.recommendedCard;

  const heading = documentTarget.createElement("h5");
  heading.className = PRODUCT_DASHBOARD_CLASSES.recommendedName;
  heading.textContent = String(name || "");

  const fieldGrid = documentTarget.createElement("div");
  fieldGrid.className = PRODUCT_DASHBOARD_CLASSES.recommendedFields;

  for (const field of fields) {
    const fieldNode = documentTarget.createElement("div");
    fieldNode.className = PRODUCT_DASHBOARD_CLASSES.recommendedField;

    const labelNode = documentTarget.createElement("div");
    labelNode.className = PRODUCT_DASHBOARD_CLASSES.label;
    labelNode.textContent = String(field?.label || "");

    const valueNode = documentTarget.createElement("div");
    valueNode.className = PRODUCT_DASHBOARD_CLASSES.value;
    appendContent(valueNode, appendValue ? (target) => appendValue(target, field?.value) : field?.value);

    fieldNode.append(labelNode, valueNode);
    fieldGrid.appendChild(fieldNode);
  }

  card.append(heading, fieldGrid);
  return card;
}

function createMissingInformationSection({
  title = "Faltantes antes de presentar",
  values = [],
  key = "missing",
  layoutRole = "missing_information",
  order = null,
  desktopSpan = null,
  tabletSpan = null,
  documentRef,
} = {}) {
  const documentTarget = requireDocument(documentRef);
  const section = createProductDashboardSection({
    title,
    key,
    kind: "missing_information",
    layoutRole,
    order,
    desktopSpan,
    tabletSpan,
    documentRef: documentTarget
  });
  const list = documentTarget.createElement("ul");
  list.className = PRODUCT_DASHBOARD_CLASSES.missingList;

  for (const value of values) {
    const item = documentTarget.createElement("li");
    item.textContent = String(value);
    list.appendChild(item);
  }

  section.appendChild(list);
  return section;
}

const api = Object.freeze({
  classes: PRODUCT_DASHBOARD_CLASSES,
  theme: PRODUCT_DASHBOARD_THEME,
  sectionKinds: PRODUCT_DASHBOARD_SECTION_KINDS,
  normalizeProductDashboardSection,
  createProductDashboard,
  findCenteredGridItemIndexes,
  applyAlignedDashboardGrid,
  createProductDashboardSection,
  createDashboardHeroMetric,
  createCompactMetadataGrid,
  createMetricRow,
  createPrimaryMetric,
  createDashboardChip,
  createRecommendedBenefitCard,
  createMissingInformationSection
});

globalThis.ForgeProductDashboardTemplate = api;

export {
  PRODUCT_DASHBOARD_CLASSES,
  PRODUCT_DASHBOARD_THEME,
  PRODUCT_DASHBOARD_SECTION_KINDS,
  normalizeProductDashboardSection,
  createProductDashboard,
  findCenteredGridItemIndexes,
  applyAlignedDashboardGrid,
  createProductDashboardSection,
  createDashboardHeroMetric,
  createCompactMetadataGrid,
  createMetricRow,
  createPrimaryMetric,
  createDashboardChip,
  createRecommendedBenefitCard,
  createMissingInformationSection
};
