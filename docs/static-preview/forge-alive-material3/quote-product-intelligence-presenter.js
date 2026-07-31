import {
  buildImaginaSerDashboardModel,
  isImaginaSerProduct,
} from "../quote-preview-live/forge-imagina-ser-product-dashboard-adapter.js";
import {
  buildSegubecaDashboardModel,
  isSegubecaProduct,
} from "../quote-preview-live/forge-segubeca-product-dashboard-adapter.js";
import {
  buildOrviDashboardModel,
  isOrviProduct,
} from "../quote-preview-live/forge-orvi-product-dashboard-adapter.js";
import {
  buildVidaMujerDashboardModel,
  isVidaMujerProduct,
} from "./forge-vida-mujer-product-dashboard-adapter.js?v=quote-calculator-parity-001";

function installPresenterStyles() {
  if (typeof document === "undefined") return;
  if (document.querySelector("[data-quote-calculator-parity-styles]")) return;
  const style = document.createElement("style");
  style.dataset.quoteCalculatorParityStyles = "true";
  style.textContent = `
    [data-quote-product-intelligence-host] { display: grid; gap: 18px; min-width: 0; }
    .quotes-intelligence-identity, .quotes-intelligence-hero,
    .quotes-intelligence-section, .quotes-rate-metadata, .quotes-scenarios,
    .quotes-mandatory-metric, .quote-commercial__review {
      min-width: 0; border: 1px solid var(--outline); border-radius: 24px;
      padding: clamp(16px, 2.5vw, 24px); background: rgba(10, 29, 52, .68);
    }
    .quotes-intelligence-identity span, .quotes-mandatory-metric span,
    .quotes-intelligence-metric > span { color: var(--muted); }
    .quotes-intelligence-identity h2 { margin: 6px 0 4px; color: var(--gold); }
    .quotes-intelligence-identity p { margin: 0; }
    .quotes-mandatory-metrics { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }
    .quotes-mandatory-metric { display: grid; gap: 8px; }
    .quotes-mandatory-metric strong { font-size: clamp(20px, 3vw, 32px); }
    .quotes-intelligence-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }
    .quotes-intelligence-values { display: grid; gap: 10px; }
    .quotes-intelligence-metric { display: grid; gap: 5px; border-bottom: 1px solid var(--outline); padding: 8px 0; }
    .quotes-value-line { display: block; overflow-wrap: anywhere; }
    .quotes-value-line--conversion { color: var(--gold-soft); font-size: .92em; margin-top: 2px; }
    .quotes-intelligence-scenario-card { background: rgba(255,255,255,.025); }
    .quote-commercial__review ul { margin: 0; padding-left: 20px; }
    @media (max-width: 759px) {
      .quotes-mandatory-metrics, .quotes-intelligence-grid { grid-template-columns: minmax(0, 1fr); }
    }
  `;
  document.head.append(style);
}

installPresenterStyles();

const hasValue = (value) => value !== null && value !== undefined && value !== "";
const normalize = (value) => String(value || "")
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, "_")
  .replace(/^_+|_+$/g, "");

function clone(value) {
  if (value === undefined) return null;
  if (typeof structuredClone === "function") return structuredClone(value);
  return JSON.parse(JSON.stringify(value));
}

function freeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  Object.values(value).forEach(freeze);
  return Object.freeze(value);
}

function blocksFrom(summary) {
  if (Array.isArray(summary)) return summary.filter(Boolean);
  if (Array.isArray(summary?.blocks)) return summary.blocks.filter(Boolean);
  if (Array.isArray(summary?.summaryBlocks)) return summary.summaryBlocks.filter(Boolean);
  return [];
}

function number(value, maximumFractionDigits = 2) {
  const numeric = Number(value);
  return Number.isFinite(numeric)
    ? new Intl.NumberFormat("es-MX", { maximumFractionDigits }).format(numeric)
    : null;
}

function money(value, currency) {
  const formatted = number(value);
  if (!formatted) return null;
  const unit = String(currency || "").toUpperCase();
  if (unit === "MXN") return `$${formatted} MXN`;
  if (unit === "USD") return `$${formatted} USD`;
  if (unit === "UDI") return `${formatted} UDI`;
  return unit ? `${formatted} ${unit}` : formatted;
}

function valueParts(value, unit) {
  if (!hasValue(value)) return [];
  if (typeof value !== "object") return [money(value, unit) || String(value)];
  if (hasValue(value.value) && value.currency) {
    return [money(value.value, value.currency)].filter(Boolean);
  }
  const parts = [];
  const sourceUdi = value.udi ?? value.amountUdi ?? value.valueUdi;
  const sourceUsd = value.usd ?? value.amountUsd ?? value.valueUsd;
  const currentMxn = value.mxnCurrent ?? value.currentMxn ?? value.current_mxn;
  const projectedMxn = value.mxnAtRetirement ?? value.projectedMxn
    ?? value.mxnProjected ?? value.futureMxn ?? value.future_mxn;
  const genericMxn = value.mxn ?? value.amountMxn ?? value.valueMxn;
  if (hasValue(sourceUdi)) parts.push(money(sourceUdi, "UDI"));
  if (hasValue(sourceUsd)) parts.push(money(sourceUsd, "USD"));
  if (hasValue(currentMxn)) parts.push(`≈ ${money(currentMxn, "MXN")} actual`);
  if (hasValue(projectedMxn)) parts.push(`≈ ${money(projectedMxn, "MXN")} proyectado`);
  if (!hasValue(currentMxn) && !hasValue(projectedMxn) && hasValue(genericMxn)) {
    parts.push(`≈ ${money(genericMxn, "MXN")}`);
  }
  if (!parts.length && hasValue(value.text)) parts.push(String(value.text));
  if (!parts.length && hasValue(value.description)) parts.push(String(value.description));
  if (!parts.length && hasValue(value.label)) parts.push(String(value.label));
  return parts.filter(Boolean);
}

function productIntelligenceFrom(packet, calculation) {
  return calculation?.productIntelligence
    ?? calculation?.product_intelligence
    ?? calculation?.nativeResult?.productIntelligence
    ?? packet?.productIntelligence
    ?? packet?.product_intelligence
    ?? packet?.nativeResult?.productIntelligence
    ?? null;
}

function benefitSummaryFrom(packet, calculation, buildBenefitSummary) {
  const existing = calculation?.nativeResult?.benefitSummary
    ?? calculation?.benefitSummary
    ?? packet?.nativeResult?.benefitSummary
    ?? packet?.benefitSummary;
  if (existing) return existing;
  return typeof buildBenefitSummary === "function"
    ? buildBenefitSummary(calculation || packet || {})
    : null;
}

function genericDashboard(summary) {
  const sections = blocksFrom(summary).flatMap((block, index) => {
    if (block?.type === "missing_information") return [];
    const sourceItems = [
      ...(block?.lines || []),
      ...(block?.rows || []),
      ...(block?.items || []),
      ...(block?.benefits || []),
    ];
    const items = sourceItems.flatMap((item, itemIndex) => {
      if (!item) return [];
      const label = item.label || item.title || item.name || item.id || `Detalle ${itemIndex + 1}`;
      const raw = item.value ?? item.amount ?? item.text ?? item.description ?? null;
      return hasValue(raw) ? [{ id: item.id || normalize(label), label, value: raw, evidence: item }] : [];
    });
    return items.length ? [{
      key: block.type || `section_${index + 1}`,
      kind: block.type || "detail",
      title: block.title || block.label || "Detalle del producto",
      items,
    }] : [];
  });
  return { productType: "generic", hero: null, sections, missingInformation: [] };
}

function selectDashboard(calculation, summary) {
  const input = { ...(calculation || {}), benefitSummary: summary };
  if (isOrviProduct(input)) return { type: "orvi", model: buildOrviDashboardModel(input) };
  if (isVidaMujerProduct(input)) return { type: "vida_mujer", model: buildVidaMujerDashboardModel(summary) };
  if (isSegubecaProduct(input)) return { type: "segubeca", model: buildSegubecaDashboardModel(summary) };
  if (isImaginaSerProduct(input)) return { type: "imagina_ser", model: buildImaginaSerDashboardModel(summary) };
  return { type: "generic", model: genericDashboard(summary) };
}

function identityFrom(productIntelligence, packet, calculation) {
  const identity = productIntelligence?.identity || {};
  const native = calculation?.nativeResult || packet?.nativeResult || {};
  return {
    name: identity.detected_product_name ?? identity.product_name
      ?? calculation?.product ?? native.product ?? packet?.productName ?? packet?.product ?? null,
    family: calculation?.productFamily ?? calculation?.family
      ?? native.productFamily ?? packet?.context?.productFamily ?? packet?.productFamily ?? null,
    plan: identity.plan ?? identity.configuration ?? native.plan ?? packet?.plan ?? null,
    version: identity.product_version ?? productIntelligence?.schema?.version ?? packet?.schemaVersion ?? null,
  };
}

function flattenItems(model) {
  return (model?.sections || []).flatMap((section) => section?.items || []);
}

function findMetric(model, patterns) {
  return flattenItems(model).find((item) => {
    const key = normalize(`${item?.id || ""} ${item?.label || ""}`);
    return patterns.some((pattern) => key.includes(pattern));
  }) || null;
}

function directMandatory(productIntelligence, packet, calculation) {
  const native = calculation?.nativeResult || packet?.nativeResult || {};
  const protection = productIntelligence?.protection_summary || {};
  const premium = productIntelligence?.premium_structure || {};
  return {
    sumAssured: protection.basic_sum_assured
      ?? native.sumAssured ?? native.sumInsured ?? packet?.sumAssured ?? null,
    annualContribution: premium.total_annual_premium
      ?? premium.basic_annual_premium
      ?? native.totalAnnualPremium ?? native.annualPremium ?? packet?.annualPremium ?? null,
  };
}

function scenarioBlocks(summary) {
  const scenarios = blocksFrom(summary)
    .filter((block) => block?.type === "retirement_scenarios")
    .flatMap((block) => block.scenarios || block.items || []);
  const byId = new Map();
  for (const scenario of scenarios) {
    const id = normalize(scenario?.id || scenario?.label || scenario?.name);
    const canonical = id.includes("favor") ? "favorable"
      : id.includes("desfavor") || id.includes("unfavor") ? "unfavorable"
        : id.includes("base") || id.includes("actual") ? "base" : id;
    if (canonical) byId.set(canonical, scenario);
  }
  return ["base", "favorable", "unfavorable"]
    .map((id) => byId.get(id))
    .filter(Boolean);
}

function missingFrom(productIntelligence, summary, model) {
  const missing = [
    ...(model?.missingInformation || []),
    ...(productIntelligence?.missing_information || []),
    ...(productIntelligence?.validation?.missing_information || []),
  ];
  for (const block of blocksFrom(summary).filter((entry) => entry?.type === "missing_information")) {
    missing.push(...[block.missing, block.items, block.lines].flat().filter(Boolean));
  }
  return [...new Set(missing.map((item) => typeof item === "string"
    ? item : item?.message || item?.label || item?.field).filter(Boolean))];
}

function rateMetadata(calculation, productIntelligence) {
  const rate = calculation?.orviDashboardViewModel?.rate_context
    ?? calculation?.udiRateMetadata
    ?? calculation?.currencyMetadata
    ?? productIntelligence?.rate_metadata
    ?? productIntelligence?.rate_context
    ?? null;
  if (!rate) return null;
  return {
    value: rate.value ?? rate.rate ?? rate.currentUdiValue ?? rate.current_value ?? null,
    source: rate.source ?? rate.sourceMode ?? rate.source_mode ?? null,
    date: rate.date ?? rate.sourceDate ?? rate.source_date ?? null,
    key: rate.key ?? rate.rateKey ?? rate.seriesId ?? rate.series_id ?? null,
    stale: rate.stale === true,
    status: rate.status ?? rate.mode ?? null,
  };
}

export function createQuoteResultSnapshot({ packet, calculation, buildBenefitSummary } = {}) {
  const productIntelligence = productIntelligenceFrom(packet, calculation);
  const benefitSummary = benefitSummaryFrom(packet, calculation, buildBenefitSummary);
  const dashboard = selectDashboard(calculation || packet, benefitSummary);
  const direct = directMandatory(productIntelligence, packet, calculation);
  const sumAssured = findMetric(dashboard.model, ["sum_assured", "suma_asegurada", "proteccion_contratada"]);
  const annualContribution = findMetric(dashboard.model, [
    "annual_premium", "aportacion_anual", "prima_anual", "total_annual_premium",
  ]);
  return freeze({
    calculation: clone(calculation),
    productIntelligence: clone(productIntelligence),
    benefitSummary: clone(benefitSummary),
    dashboard: clone(dashboard),
    identity: identityFrom(productIntelligence, packet, calculation),
    mandatory: {
      sumAssured: sumAssured || (hasValue(direct.sumAssured)
        ? { label: "Suma asegurada", value: direct.sumAssured } : null),
      annualContribution: annualContribution || (hasValue(direct.annualContribution)
        ? { label: "Aportación anual", value: direct.annualContribution } : null),
    },
    scenarios: scenarioBlocks(benefitSummary),
    rateMetadata: rateMetadata(calculation, productIntelligence),
    missingInformation: missingFrom(productIntelligence, benefitSummary, dashboard.model),
  });
}

function appendValue(target, value, unit) {
  const parts = valueParts(value, unit);
  if (!parts.length) {
    target.textContent = "Pendiente";
    return;
  }
  parts.forEach((part, index) => {
    const line = target.ownerDocument.createElement("span");
    line.className = index ? "quotes-value-line quotes-value-line--conversion" : "quotes-value-line";
    line.textContent = part;
    target.append(line);
  });
}

function metric(documentRef, item) {
  const row = documentRef.createElement("div");
  row.className = "quotes-intelligence-metric";
  const label = documentRef.createElement("span");
  label.textContent = item?.label || "Detalle";
  const value = documentRef.createElement("strong");
  appendValue(value, item?.value, item?.unit);
  row.append(label, value);
  return row;
}

function scenarioCard(documentRef, scenario) {
  const card = documentRef.createElement("article");
  card.className = "quotes-intelligence-section quotes-intelligence-scenario-card";
  card.dataset.quoteScenario = normalize(scenario.id || scenario.label || scenario.name);
  const title = documentRef.createElement("h4");
  title.textContent = `Escenario ${scenario.label || scenario.name || scenario.id || "disponible"}`;
  const values = documentRef.createElement("div");
  values.className = "quotes-intelligence-values";
  const entries = [
    ["Pago único", scenario.singlePayment ?? scenario.lumpSum],
    ["Renta mensual", scenario.monthlyIncome],
    ["Renta anual", scenario.annualIncome],
  ].filter(([, value]) => hasValue(value));
  for (const [label, value] of entries) values.append(metric(documentRef, { label, value }));
  for (const entry of Array.isArray(scenario.accumulatedIncome) ? scenario.accumulatedIncome : []) {
    values.append(metric(documentRef, {
      label: `Acumulado${entry.toAge || entry.targetAge ? ` a edad ${entry.toAge || entry.targetAge}` : ""}`,
      value: entry,
    }));
  }
  card.append(title, values);
  return card;
}

export function renderQuoteResultSnapshot(snapshot, { host, documentRef = document } = {}) {
  if (!snapshot || !host) return null;
  host.replaceChildren();
  host.dataset.quoteResultWorkspace = "true";
  host.dataset.productDashboard = snapshot.dashboard.type;

  const header = documentRef.createElement("header");
  header.className = "quotes-intelligence-identity";
  const eyebrow = documentRef.createElement("span");
  eyebrow.textContent = [snapshot.identity.family, snapshot.identity.version].filter(Boolean).join(" · ")
    || "PRODUCT INTELLIGENCE";
  const title = documentRef.createElement("h2");
  title.textContent = snapshot.identity.name || "Resultado de producto";
  const plan = documentRef.createElement("p");
  plan.textContent = snapshot.identity.plan || "Información calculada con evidencia disponible.";
  header.append(eyebrow, title, plan);
  host.append(header);

  const mandatory = documentRef.createElement("section");
  mandatory.className = "quotes-mandatory-metrics";
  mandatory.dataset.quoteMandatoryMetrics = "true";
  for (const [key, item, fallback] of [
    ["sum-assured", snapshot.mandatory.sumAssured, "Suma asegurada"],
    ["annual-contribution", snapshot.mandatory.annualContribution, "Aportación anual"],
  ]) {
    const card = documentRef.createElement("article");
    card.className = "quotes-mandatory-metric";
    card.dataset.quoteMandatoryMetric = key;
    const label = documentRef.createElement("span");
    label.textContent = item?.label || fallback;
    const value = documentRef.createElement("strong");
    appendValue(value, item?.value ?? null, item?.unit);
    card.append(label, value);
    mandatory.append(card);
  }
  host.append(mandatory);

  if (snapshot.dashboard.model.hero) {
    const hero = documentRef.createElement("article");
    hero.className = "quotes-intelligence-hero";
    const label = documentRef.createElement("span");
    label.textContent = snapshot.dashboard.model.hero.label || "Valor principal";
    const value = documentRef.createElement("strong");
    appendValue(value, snapshot.dashboard.model.hero.value);
    hero.append(label, value);
    host.append(hero);
  }

  const grid = documentRef.createElement("div");
  grid.className = "quotes-intelligence-grid";
  for (const section of snapshot.dashboard.model.sections || []) {
    const card = documentRef.createElement("section");
    card.className = "quotes-intelligence-section";
    card.dataset.productSection = section.kind || section.key;
    const heading = documentRef.createElement("h3");
    heading.textContent = section.title || "Detalle del producto";
    const values = documentRef.createElement("div");
    values.className = "quotes-intelligence-values";
    for (const item of section.items || []) values.append(metric(documentRef, item));
    card.append(heading, values);
    grid.append(card);
  }
  if (grid.children.length) host.append(grid);

  if (snapshot.scenarios.length) {
    const scenarios = documentRef.createElement("section");
    scenarios.className = "quotes-scenarios";
    scenarios.dataset.quoteThreeScenarios = "true";
    const heading = documentRef.createElement("h3");
    heading.textContent = "Escenarios de recuperación";
    const cards = documentRef.createElement("div");
    cards.className = "quotes-intelligence-grid";
    snapshot.scenarios.forEach((scenario) => cards.append(scenarioCard(documentRef, scenario)));
    scenarios.append(heading, cards);
    host.append(scenarios);
  }

  if (snapshot.rateMetadata) {
    const rate = documentRef.createElement("section");
    rate.className = "quotes-rate-metadata";
    rate.dataset.quoteRateMetadata = "true";
    const heading = documentRef.createElement("h3");
    heading.textContent = "UDI y conversión";
    const values = documentRef.createElement("div");
    values.className = "quotes-intelligence-values";
    for (const [label, value] of [
      ["Valor base", snapshot.rateMetadata.value],
      ["Fecha", snapshot.rateMetadata.date],
      ["Fuente", snapshot.rateMetadata.source],
      ["Serie", snapshot.rateMetadata.key],
    ]) {
      if (hasValue(value)) values.append(metric(documentRef, { label, value }));
    }
    rate.append(heading, values);
    host.append(rate);
  }
  return host;
}
