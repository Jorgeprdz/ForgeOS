const normalizeKey = (value) => String(value || "")
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, "_")
  .replace(/^_+|_+$/g, "");

const blocksFrom = (summary) => {
  if (Array.isArray(summary)) return summary.filter(Boolean);
  if (Array.isArray(summary?.blocks)) return summary.blocks.filter(Boolean);
  if (Array.isArray(summary?.summaryBlocks)) return summary.summaryBlocks.filter(Boolean);
  return [];
};

const number = (value) => Number.isFinite(Number(value))
  ? new Intl.NumberFormat("es-MX", { maximumFractionDigits: 0 }).format(Math.round(Number(value)))
  : null;

function amount(value, unit) {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "object") {
    const values = [];
    const udi = value.udi ?? value.amountUdi ?? value.valueUdi;
    const mxn = value.mxn ?? value.amountMxn ?? value.valueMxn;
    if (number(udi)) values.push(`${number(udi)} UDI`);
    if (number(mxn)) values.push(`≈ $${number(mxn)} MXN`);
    return values.join(" · ") || value.text || value.description || null;
  }
  if (unit === "UDI") return `${number(value)} UDI`;
  if (unit === "MXN") return `$${number(value)} MXN`;
  if (unit === "years") return `${number(value)} años`;
  return String(value);
}

function itemFrom(value, index) {
  if (typeof value === "string") return { id: `item_${index}`, label: "Detalle", value };
  const label = value?.label || value?.title || value?.name || value?.id || `Detalle ${index + 1}`;
  const raw = value?.text ?? value?.value ?? value?.amount ?? value?.description
    ?? value?.benefit ?? value?.coverage ?? null;
  return {
    id: value?.id || normalizeKey(label) || `item_${index}`,
    label,
    value: amount(raw, value?.unit),
    evidence: value,
  };
}

function itemsFrom(block) {
  return [
    ...(block?.lines || []),
    ...(block?.rows || []),
    ...(block?.items || []),
    ...(block?.benefits || []),
    ...(block?.coverages || []),
  ].map(itemFrom).filter((item) => item.value);
}

export function isVidaMujerProduct(input = {}) {
  const native = input.nativeResult || {};
  const values = [
    input.product, input.productName, input.productType, input.productFamily, input.family,
    native.product, native.productName, native.productType, native.productFamily,
    ...blocksFrom(input.benefitSummary || input).flatMap((block) => [block.product, block.title]),
  ];
  return values.some((value) => normalizeKey(value).includes("vida_mujer"));
}

export function buildVidaMujerDashboardModel(benefitSummary) {
  const blocks = blocksFrom(benefitSummary);
  const missing = [];
  const sections = [];
  const titles = {
    contribution_summary: "Aportación y estructura de prima",
    protection_summary: "Protección de vida",
    scheduled_endowments: "Dotes programadas",
    recovery_summary: "Ahorro y recuperación",
    women_health_benefits: "Protección para la mujer",
    recommended_benefits: "Beneficios recomendados",
    additional_coverages: "Coberturas adicionales",
  };
  for (const [index, block] of blocks.entries()) {
    if (block.type === "missing_information") {
      for (const value of [block.missing, block.items, block.lines].flat().filter(Boolean)) {
        missing.push(typeof value === "string" ? value : value.message || value.label || value.field);
      }
      continue;
    }
    let items = itemsFrom(block);
    const schedule = Array.isArray(block.schedule)
      ? block.schedule
      : Array.isArray(block.calendar?.payments)
        ? block.calendar.payments
        : null;
    if (block.type === "scheduled_endowments" && schedule) {
      const timeline = schedule.map((row, rowIndex) => ({
        id: row.id || `endowment_${rowIndex + 1}`,
        label: row.year ? `Año ${row.year}` : block.calendar?.years?.[rowIndex]
          ? `Año ${block.calendar.years[rowIndex]}`
          : row.age ? `Edad ${row.age}` : `Entrega ${rowIndex + 1}`,
        value: amount(row.amount ?? row.value ?? row, row.unit),
        evidence: row,
      })).filter((item) => item.value);
      items = [...timeline, ...items];
    }
    if (!items.length) continue;
    sections.push(Object.freeze({
      key: block.type || `section_${index + 1}`,
      kind: block.type || "product_detail",
      title: titles[block.type] || block.title || block.label || "Detalle del producto",
      presentation: block.type === "scheduled_endowments" ? "timeline" : "metric_rows",
      layoutRole: block.type || "product_detail",
      desktopSpan: ["scheduled_endowments", "women_health_benefits"].includes(block.type) ? 7 : 5,
      tabletSpan: 4,
      items: Object.freeze(items),
    }));
  }
  const protection = sections.find((section) => section.kind === "protection_summary");
  const heroItem = protection?.items.find((item) =>
    /suma asegurada|protecci[oó]n/i.test(item.label)) || protection?.items[0] || null;
  return Object.freeze({
    productType: "vida_mujer",
    hero: heroItem ? Object.freeze({
      label: heroItem.label,
      value: heroItem.value,
      sourceField: heroItem.id,
      evidence: heroItem.evidence,
    }) : null,
    sections: Object.freeze(sections),
    missingInformation: Object.freeze([...new Set(missing.filter(Boolean))]),
  });
}
