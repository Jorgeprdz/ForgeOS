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

const hasValue = (value) => value !== null && value !== undefined && value !== "";

function cloneValue(value) {
  if (value === undefined) return null;
  if (typeof structuredClone === "function") return structuredClone(value);
  return JSON.parse(JSON.stringify(value));
}

function deepFreeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  Object.values(value).forEach(deepFreeze);
  return Object.freeze(value);
}

function normalizeBlocks(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (Array.isArray(value?.blocks)) return value.blocks.filter(Boolean);
  if (Array.isArray(value?.summaryBlocks)) return value.summaryBlocks.filter(Boolean);
  return [];
}

function unique(values) {
  return [...new Set(values.flat().filter(hasValue).map((value) => {
    if (typeof value === "string") return value;
    return value?.message || value?.reason || value?.label || value?.field || null;
  }).filter(Boolean))];
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

function productIdentity(productIntelligence, packet, calculation) {
  const identity = productIntelligence?.identity || {};
  const schema = productIntelligence?.schema || {};
  const nativeResult = calculation?.nativeResult || packet?.nativeResult || {};
  return {
    name: identity.detected_product_name ?? identity.product_name
      ?? calculation?.product ?? nativeResult.product ?? null,
    family: calculation?.productFamily ?? calculation?.family
      ?? nativeResult.productFamily ?? packet?.context?.productFamily ?? null,
    plan: identity.plan ?? identity.configuration ?? nativeResult.plan ?? null,
    version: identity.product_version ?? schema.version ?? null,
    schemaId: schema.id ?? null,
  };
}

function truthState(productIntelligence) {
  if (!productIntelligence) return null;
  const ownership = productIntelligence.ownership || {};
  const truth = productIntelligence.truth || productIntelligence.truth_state || {};
  const validation = productIntelligence.validation || {};
  return {
    canonicalOwner: ownership.canonical_owner ?? productIntelligence.canonical_owner ?? null,
    status: truth.status ?? productIntelligence.truth_status ?? validation.status ?? null,
    actionability: truth.actionability ?? productIntelligence.actionability ?? null,
    effectivePeriod: truth.effective_period ?? productIntelligence.effective_period ?? null,
    humanDecisionRequired: productIntelligence.decision_scenarios?.human_decision_required
      ?? productIntelligence.human_decision_required ?? null,
    unknownFields: cloneValue(
      productIntelligence.unknown_fields ?? validation.unknown_fields ?? [],
    ),
    conflicts: cloneValue(
      productIntelligence.conflicted_evidence ?? validation.conflicts ?? [],
    ),
  };
}

function rateMetadata(calculation, productIntelligence) {
  const rate = calculation?.orviDashboardViewModel?.rate_context
    ?? calculation?.udiRateMetadata
    ?? calculation?.currencyMetadata
    ?? productIntelligence?.rate_metadata
    ?? productIntelligence?.rate_context
    ?? null;
  if (!rate) return null;
  const value = rate.value ?? rate.rate ?? rate.currentUdiValue ?? rate.current_value ?? null;
  const source = rate.source ?? rate.sourceMode ?? rate.source_mode ?? null;
  const date = rate.date ?? rate.sourceDate ?? rate.source_date ?? null;
  const key = rate.key ?? rate.rateKey ?? rate.seriesId ?? rate.series_id ?? null;
  if (![value, source, date, key].some(hasValue)) return null;
  return { value, source, date, key, stale: rate.stale === true, status: rate.status ?? rate.mode ?? null };
}

function missingInformation(productIntelligence, benefitSummary, dashboard) {
  const blocks = normalizeBlocks(benefitSummary);
  return unique([
    dashboard?.missingInformation || [],
    productIntelligence?.missing_information || [],
    productIntelligence?.validation?.missing_information || [],
    (productIntelligence?.unknown_fields || []).map((value) =>
      `Información desconocida: ${typeof value === "string" ? value : value?.field || value?.label || "campo sin identificar"}`),
    (productIntelligence?.conflicted_evidence || productIntelligence?.validation?.conflicts || [])
      .map((value) =>
        `Evidencia en conflicto: ${typeof value === "string" ? value : value?.field || value?.label || "dato por revisar"}`),
    blocks.filter((block) => block.type === "missing_information")
      .flatMap((block) => [block.missing, block.items, block.lines]),
  ]);
}

function selectDashboard(calculation, benefitSummary) {
  const input = { ...(calculation || {}), benefitSummary };
  if (isOrviProduct(input)) {
    const model = buildOrviDashboardModel(input);
    if (model) return { type: "orvi", model };
  }
  if (isSegubecaProduct(input)) {
    return { type: "segubeca", model: buildSegubecaDashboardModel(benefitSummary) };
  }
  if (isImaginaSerProduct(input)) {
    return { type: "imagina_ser", model: buildImaginaSerDashboardModel(benefitSummary) };
  }
  const blocks = normalizeBlocks(benefitSummary);
  return {
    type: "generic",
      model: {
      productType: "generic",
      hero: null,
        sections: blocks.map((block, index) => ({
        key: block.type || `block_${index + 1}`,
        kind: block.type || "detail",
        title: block.title || block.label || String(block.type || "Detalle").replaceAll("_", " "),
        items: [
          ...(block.lines || []),
          ...(block.rows || []),
          ...(block.items || []),
          ...(block.scenarios || []).map((scenario) => ({
            ...scenario,
            label: `Escenario ${scenario.label || scenario.id || "disponible"}`,
            value: scenario.singlePayment ?? scenario.monthlyIncome
              ?? scenario.annualIncome ?? scenario.accumulatedIncome ?? null,
            evidence: scenario,
          })),
        ].map((item, itemIndex) => ({
          id: item.id || `item_${itemIndex + 1}`,
          label: item.label || item.title || item.id || "Detalle",
          value: item.text ?? item.value ?? item.amount ?? item.description ?? null,
          evidence: item.evidence ?? item,
        })).filter((item) => hasValue(item.value)),
      })).filter((section) => section.items.length),
      missingInformation: [],
    },
  };
}

export function createQuoteResultSnapshot({
  packet,
  calculation,
  buildBenefitSummary,
} = {}) {
  const productIntelligence = productIntelligenceFrom(packet, calculation);
  const benefitSummary = benefitSummaryFrom(packet, calculation, buildBenefitSummary);
  const dashboard = selectDashboard(calculation || packet, benefitSummary);
  const snapshot = {
    calculation: cloneValue(calculation),
    productIntelligence: cloneValue(productIntelligence),
    benefitSummary: cloneValue(benefitSummary),
    dashboard: cloneValue(dashboard),
    identity: productIdentity(productIntelligence, packet, calculation),
    rateMetadata: rateMetadata(calculation, productIntelligence),
    truthState: truthState(productIntelligence),
    missingInformation: missingInformation(productIntelligence, benefitSummary, dashboard.model),
  };
  return deepFreeze(snapshot);
}

function appendValue(target, value) {
  const number = (candidate) => {
    const numeric = Number(candidate);
    return Number.isFinite(numeric)
      ? new Intl.NumberFormat("es-MX", { maximumFractionDigits: 2 }).format(numeric)
      : String(candidate);
  };
  if (value && typeof value === "object") {
    const parts = [
      hasValue(value.udi) ? `${number(value.udi)} UDI` : null,
      hasValue(value.mxn) ? `$${number(value.mxn)} MXN` : null,
      hasValue(value.usd) ? `$${number(value.usd)} USD` : null,
    ].filter(Boolean);
    target.textContent = parts.join(" · ") || JSON.stringify(value);
    return;
  }
  target.textContent = String(value);
}

function metric(documentRef, item) {
  const row = documentRef.createElement("div");
  row.className = "quotes-intelligence-metric";
  const label = documentRef.createElement("span");
  label.textContent = item.label;
  const value = documentRef.createElement("strong");
  appendValue(value, item.value);
  row.append(label, value);
  const scenario = item.evidence;
  if (scenario && typeof scenario === "object"
    && [scenario.singlePayment, scenario.monthlyIncome, scenario.annualIncome,
      scenario.accumulatedIncome].some(hasValue)) {
    value.hidden = true;
    const details = documentRef.createElement("dl");
    details.className = "quotes-intelligence-scenario";
    const entries = [
      ["Pago único", scenario.singlePayment],
      ["Ingreso mensual", scenario.monthlyIncome],
      ["Ingreso anual", scenario.annualIncome],
      ...(Array.isArray(scenario.accumulatedIncome)
        ? scenario.accumulatedIncome.map((entry) => [
          `Acumulado${entry.toAge || entry.targetAge ? ` a edad ${entry.toAge || entry.targetAge}` : ""}`,
          entry,
        ])
        : []),
    ].filter(([, entry]) => hasValue(entry));
    for (const [name, entry] of entries) {
      const term = documentRef.createElement("dt");
      term.textContent = name;
      const detail = documentRef.createElement("dd");
      appendValue(detail, entry);
      details.append(term, detail);
    }
    row.append(details);
  }
  return row;
}

export function renderQuoteResultSnapshot(snapshot, { host, documentRef = document } = {}) {
  if (!snapshot || !host) return null;
  host.replaceChildren();
  host.dataset.productDashboard = snapshot.dashboard.type;

  const identity = documentRef.createElement("header");
  identity.className = "quotes-intelligence-identity";
  const eyebrow = documentRef.createElement("span");
  eyebrow.textContent = [snapshot.identity.family, snapshot.identity.version].filter(Boolean).join(" · ")
    || "PRODUCT INTELLIGENCE";
  const title = documentRef.createElement("h3");
  title.textContent = snapshot.identity.name || "Resultado de producto";
  const plan = documentRef.createElement("p");
  plan.textContent = snapshot.identity.plan || "Información calculada con evidencia disponible.";
  identity.append(eyebrow, title, plan);
  host.append(identity);

  if (snapshot.dashboard.model.hero) {
    const hero = documentRef.createElement("article");
    hero.className = "quotes-intelligence-hero";
    const label = documentRef.createElement("span");
    label.textContent = snapshot.dashboard.model.hero.label;
    const value = documentRef.createElement("strong");
    appendValue(value, snapshot.dashboard.model.hero.value);
    hero.append(label, value);
    if (snapshot.dashboard.model.hero.secondaryValue) {
      const secondary = documentRef.createElement("small");
      secondary.textContent = snapshot.dashboard.model.hero.secondaryValue;
      hero.append(secondary);
    }
    host.append(hero);
  }

  const grid = documentRef.createElement("div");
  grid.className = "quotes-intelligence-grid";
  for (const section of snapshot.dashboard.model.sections || []) {
    const card = documentRef.createElement("section");
    card.className = "quotes-intelligence-section";
    card.dataset.productSection = section.kind || section.key;
    const heading = documentRef.createElement("h4");
    heading.textContent = section.title;
    const values = documentRef.createElement("div");
    values.className = "quotes-intelligence-values";
    for (const item of section.items || []) values.append(metric(documentRef, item));
    card.append(heading, values);
    grid.append(card);
  }
  if (grid.children.length) host.append(grid);

  if (snapshot.rateMetadata) {
    const rate = documentRef.createElement("section");
    rate.className = "quotes-intelligence-meta";
    rate.dataset.quoteRateMetadata = "true";
    const heading = documentRef.createElement("h4");
    heading.textContent = "Tasa verificada";
    const text = documentRef.createElement("p");
    text.textContent = [
      snapshot.rateMetadata.key,
      hasValue(snapshot.rateMetadata.value) ? `Valor ${snapshot.rateMetadata.value}` : null,
      snapshot.rateMetadata.source,
      snapshot.rateMetadata.date,
      snapshot.rateMetadata.stale ? "Información desactualizada" : null,
    ].filter(Boolean).join(" · ");
    rate.append(heading, text);
    host.append(rate);
  }

  if (snapshot.truthState) {
    const truth = documentRef.createElement("section");
    truth.className = "quotes-intelligence-meta";
    truth.dataset.quoteTruthState = "true";
    const heading = documentRef.createElement("h4");
    heading.textContent = "Verdad y preparación";
    const text = documentRef.createElement("p");
    text.textContent = [
      snapshot.truthState.status,
      snapshot.truthState.actionability,
      snapshot.truthState.effectivePeriod
        ? `Vigencia: ${snapshot.truthState.effectivePeriod}`
        : null,
      snapshot.truthState.canonicalOwner
        ? `Autoridad: ${snapshot.truthState.canonicalOwner}`
        : null,
      snapshot.truthState.humanDecisionRequired === true
        ? "Requiere decisión humana"
        : null,
    ].filter(Boolean).join(" · ") || "Revisión humana requerida.";
    truth.append(heading, text);
    host.append(truth);
  }

  if (snapshot.missingInformation.length) {
    const missing = documentRef.createElement("section");
    missing.className = "quotes-intelligence-missing";
    missing.dataset.quoteMissingInformation = "true";
    const heading = documentRef.createElement("h4");
    heading.textContent = "Información pendiente";
    const list = documentRef.createElement("ul");
    snapshot.missingInformation.forEach((value) => {
      const item = documentRef.createElement("li");
      item.textContent = value;
      list.append(item);
    });
    missing.append(heading, list);
    host.append(missing);
  }
  return host;
}
