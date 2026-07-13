import {
  benefitBlockKey107z15p2R9E,
  normalizeBenefitLayout107z15p2R9E
} from "./forge-benefit-summary-layout.js?v=r15m2_orvi_recovery_20260712_1";
import {
  createDashboardChip,
  createMetricRow,
  createMissingInformationSection,
  createPrimaryMetric,
  createProductDashboard,
  createProductDashboardSection,
  createRecommendedBenefitCard
} from "./forge-product-dashboard-template.js";
import {
  buildImaginaSerDashboardModel,
  isImaginaSerProduct,
  renderImaginaSerDashboard
} from "./forge-imagina-ser-product-dashboard-adapter.js";
import {
  buildSegubecaDashboardModel,
  isSegubecaProduct,
  renderSegubecaDashboard
} from "./forge-segubeca-product-dashboard-adapter.js";
import {
  buildOrviDashboardModel,
  isOrviProduct,
  renderOrviDashboard
} from "./forge-orvi-product-dashboard-adapter.js?v=r15m2_orvi_recovery_20260712_1";


function hasValue(value) {
  return value !== null && value !== undefined && value !== "";
}

function formatNumber(value) {
  if (!hasValue(value)) return "—";

  const numeric = Number(String(value).replace(/,/g, ""));

  if (!Number.isFinite(numeric)) {
    return String(value);
  }

  return new Intl.NumberFormat("es-MX", {
    maximumFractionDigits: 2
  }).format(numeric);
}

function formatAmount(value, currency) {
  if (!hasValue(value)) return "—";

  const amount = formatNumber(value);
  return currency ? `${amount} ${currency}` : amount;
}

function scenarioText(scenario, currency) {
  if (!scenario) return null;
  return [
    hasValue(scenario.singlePaymentUdi) ? `Pago único: ${formatAmount(scenario.singlePaymentUdi, currency)}` : null,
    hasValue(scenario.monthlyIncomeUdi) ? `Renta mensual: ${formatAmount(scenario.monthlyIncomeUdi, currency)}` : null
  ].filter(Boolean).join(" · ") || null;
}

function isUdiCurrency(currency) {
  return ["UDI", "UDIS", "MXV"].includes(String(currency || "").trim().toUpperCase());
}

function formatMxn(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return null;
  return `≈ ${number.toLocaleString("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0
  })} MXN`;
}

function formatUdiWithMxn(value, currency, mxnValue, udiMetadata) {
  const lines = [formatAmount(value, currency)];
  if (!isUdiCurrency(currency)) return lines;
  if (hasValue(mxnValue) && udiMetadata?.currentUdiValue) {
    lines.push(formatMxn(mxnValue));
  } else {
    lines.push("MXN pendiente: falta valor UDI verificado.");
  }
  return lines;
}

function formatUdiMetadataLine(udiMetadata) {
  if (!udiMetadata?.currentUdiValue) return "MXN pendiente: falta valor UDI verificado.";
  const sourceLabel = udiMetadata.source === "BANXICO_SIE_API"
    ? "Banxico / motor verificado"
    : udiMetadata.source;
  return `Valor UDI: $${udiMetadata.currentUdiValue} MXN · Fuente: ${sourceLabel || "motor verificado"} · Fecha: ${udiMetadata.sourceDate || "sin fecha"}`;
}

const ORVI_RATE_KEYS = Object.freeze({ UDI: "UDI_MXN", USD: "USD_MXN_FIX" });
const ORVI_RATE_SOURCE_MODES = new Set(["LIVE", "CACHE", "SYNTHETIC_TEST"]);

function resolveAcceptedRateMetadata(calc = {}) {
  if (!isOrviProduct(calc)) return calc.udiRateMetadata || null;
  const metadata = calc.orviRateMetadata;
  const currency = String(calc.currency || "").trim().toUpperCase();
  const expectedRateKey = ORVI_RATE_KEYS[currency];
  const rateValue = Number(metadata?.value);
  const sourceMode = String(metadata?.source_mode || "").trim().toUpperCase();
  if (
    metadata?.stale !== false ||
    !expectedRateKey ||
    metadata?.rate_key !== expectedRateKey ||
    !Number.isFinite(rateValue) ||
    rateValue <= 0 ||
    !hasValue(metadata?.source) ||
    !hasValue(metadata?.source_date) ||
    !ORVI_RATE_SOURCE_MODES.has(sourceMode)
  ) {
    return null;
  }
  return {
    currentUdiValue: rateValue,
    source: metadata.source,
    sourceDate: metadata.source_date,
    rateKey: metadata.rate_key,
    currency,
  };
}

function formatOrviRateMetadataLine(metadata) {
  if (!metadata?.currentUdiValue) {
    return "MXN pendiente: falta valor UDI verificado.";
  }
  const rate = Number(metadata.currentUdiValue).toLocaleString("es-MX", {
    maximumFractionDigits: 4,
  });
  const rateLabel = metadata.rateKey === "USD_MXN_FIX" ? "USD/MXN" : "UDI";
  return `Valor ${rateLabel}: $${rate} MXN · Fuente: ${metadata.source || "motor verificado"} · Fecha: ${metadata.sourceDate}`;
}

function buildOrviSummaryPaymentLine(calc = {}) {
  const parts = [];
  if (hasValue(calc.currency)) parts.push(String(calc.currency).toUpperCase());
  const paymentYears = Number(calc.paymentYears);
  if (Number.isInteger(paymentYears) && paymentYears > 0) {
    parts.push(`${paymentYears} años de aportación`);
  }
  return parts.join(" · ") || null;
}

function normalize(value) {
  return String(value ?? "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function findSummaryTarget(labels) {
  const wanted = (Array.isArray(labels) ? labels : [labels]).map(normalize);
  for (const node of document.querySelectorAll("dt,th,label,strong,span,p,div")) {
    const text = normalize(node.textContent);
    if (!text || text.length > 100 || !wanted.some(label => text === label || text.startsWith(`${label}:`))) continue;
    const box = node.closest("tr,li,dl > div,[class*='row'],[class*='item'],[class*='summary'],article,section") || node.parentElement;
    if (!box) continue;
    const candidates = [...box.querySelectorAll("dd,output,[data-forge-value],[class*='value'],strong,span,p,div")].filter(candidate => {
      if (candidate === node || candidate.contains(node)) return false;
      const value = normalize(candidate.textContent);
      return value === "no identificado en el pdf." ||
        value === "no identificado en el pdf" ||
        value === "no identificado" ||
        candidate.hasAttribute("data-forge-runtime-value");
    });
    if (candidates.length) return candidates[candidates.length - 1];
    if (node.nextElementSibling) return node.nextElementSibling;
  }
  return null;
}

function setSummaryValue(labels, value) {
  const target = findSummaryTarget(labels);
  if (!target) return false;
  if (Array.isArray(value)) {
    const lines = value.filter(hasValue);
    if (!lines.length) {
      target.textContent = "No identificado en el PDF.";
    } else {
      const wrapper = document.createElement("span");
      wrapper.className = "fq-summary-lines-107z15f0";
      lines.forEach((line, index) => {
        const lineNode = document.createElement("span");
        lineNode.textContent = String(line);
        if (index > 0) lineNode.className = "fq-summary-subline-107z15f0";
        wrapper.appendChild(lineNode);
      });
      target.replaceChildren(wrapper);
    }
  } else {
    target.textContent = hasValue(value) ? String(value) : "No identificado en el PDF.";
  }
  target.setAttribute("data-forge-runtime-value", "true");
  return true;
}

function setSummaryLabel(labels, value) {
  const wanted = (Array.isArray(labels) ? labels : [labels]).map(normalize);
  for (const node of document.querySelectorAll("dt,th,label,strong,span,p,div")) {
    const text = normalize(node.textContent);
    if (wanted.some(label => text === label || text.startsWith(`${label}:`))) {
      node.textContent = value;
      return true;
    }
  }
  return false;
}

function benefitSummaryApiSync() {
  return globalThis.__FORGE_QUOTE_BENEFIT_SUMMARY_API__ || null;
}

function normalizeBenefitBlocks(benefitSummary) {
  if (Array.isArray(benefitSummary)) return benefitSummary;
  if (Array.isArray(benefitSummary?.blocks)) return benefitSummary.blocks;
  if (Array.isArray(benefitSummary?.summaryBlocks)) return benefitSummary.summaryBlocks;
  return [];
}

function normalizeBenefitMissing(value) {
  if (!value) return [];
  const raw = Array.isArray(value) ? value : [value];
  return raw
    .map(item => {
      if (!item) return null;
      if (typeof item === "string") return item;
      if (item.message) return item.message;
      if (item.reason) return item.reason;
      if (item.label) return item.label;
      return Object.values(item).filter(Boolean).join(" · ");
    })
    .filter(Boolean);
}

function formatBenefitNumber(value, maximumFractionDigits = 2) {
  const number = Number(value);
  if (!Number.isFinite(number)) return null;
  return new Intl.NumberFormat("es-MX", {
    minimumFractionDigits: 0,
    maximumFractionDigits
  }).format(number);
}

function pickBenefitMxn(amount) {
  if (!amount || typeof amount !== "object") return null;
  return amount.mxn ?? amount.mxnAtRetirement ?? amount.mxnCurrent ?? amount.projectedMxn ?? null;
}

function formatBenefitAmount(amount) {
  if (amount == null || amount === "") return null;

  if (typeof amount !== "object") {
    return formatBenefitNumber(amount);
  }

  const parts = [];
  const udi = amount.udi ?? amount.amountUdi ?? amount.valueUdi ?? null;
  const mxn = pickBenefitMxn(amount);

  if (udi !== null && udi !== undefined && Number.isFinite(Number(udi))) {
    parts.push(`${formatBenefitNumber(udi)} UDI`);
  }

  if (mxn !== null && mxn !== undefined && Number.isFinite(Number(mxn))) {
    parts.push(formatMxn(Number(mxn)));
  }

  if (amount.projectedUdiValue !== null && amount.projectedUdiValue !== undefined && Number.isFinite(Number(amount.projectedUdiValue))) {
    parts.push(`UDI proyectada: $${formatBenefitNumber(amount.projectedUdiValue, 4)}`);
  }

  if (amount.targetAge !== null && amount.targetAge !== undefined && Number.isFinite(Number(amount.targetAge))) {
    parts.push(`edad ${formatBenefitNumber(amount.targetAge, 0)}`);
  }

  return parts.filter(Boolean).join(" · ") || null;
}

function formatBenefitLine(line) {
  if (!line) return null;
  if (typeof line === "string") return line;

  if (line.text) return line.text;

  if (line.label && line.value !== undefined) {
    const value = typeof line.value === "object" ? formatBenefitAmount(line.value) : String(line.value);
    return value ? `${line.label}: ${value}` : String(line.label);
  }

  if (line.amount) return formatBenefitAmount(line.amount);

  if (line.value !== undefined) {
    return typeof line.value === "object" ? formatBenefitAmount(line.value) : String(line.value);
  }

  const values = Object.values(line).filter(value => value !== null && value !== undefined && value !== "");
  return values.length ? values.join(" · ") : null;
}

function formatProjectedCalendarMxn(value) {
  if (value === null || value === undefined || !Number.isFinite(Number(value))) {
    return "MXN proyectado pendiente";
  }
  return formatMxn(Number(value)) || "MXN proyectado pendiente";
}

function scenarioBenefitRows(block) {
  const rows = [];
  const scenarios = Array.isArray(block?.scenarios) ? block.scenarios : [];

  for (const scenario of scenarios) {
    const label = scenario.label || scenario.name || scenario.id || "Escenario";
    const values = [
      scenario.singlePayment ? `Pago único: ${formatBenefitAmount(scenario.singlePayment)}` : null,
      scenario.monthlyIncome ? `Renta mensual: ${formatBenefitAmount(scenario.monthlyIncome)}` : null,
      scenario.annualIncome ? `Renta anual: ${formatBenefitAmount(scenario.annualIncome)}` : null
    ].filter(Boolean);

    const accumulated = Array.isArray(scenario.accumulatedIncome)
      ? scenario.accumulatedIncome
          .map(item => {
            const toAge = item.toAge ?? item.age ?? item.targetAge;
            const mxn = item.mxn ?? item.projectedMxn ?? item.value;
            if (!Number.isFinite(Number(mxn))) return null;
            return `Acumulado${toAge ? ` a ${toAge}` : ""}: ${formatMxn(Number(mxn))}`;
          })
          .filter(Boolean)
      : [];

    rows.push({
      label: `Escenario ${label}`,
      value: [...values, ...accumulated].join(" · ") || "Datos insuficientes para este escenario"
    });

    for (const missing of normalizeBenefitMissing(scenario.missing)) {
      rows.push({ label: `Faltante ${label}`, value: missing });
    }
  }

  for (const missing of normalizeBenefitMissing(block?.missing)) {
    rows.push({ label: "Faltante escenario", value: missing });
  }

  return rows;
}

function benefitSummaryToRuntimeRows(benefitSummary) {
  const blocks = normalizeBenefitBlocks(benefitSummary);
  const rows = [];

  for (const block of blocks) {
    if (!block || !block.type) continue;

    if (block.type === "retirement_scenarios") {
      rows.push(...scenarioBenefitRows(block));
      continue;
    }

    const title = block.title || {
      contribution_summary: "Lo que aportas",
      protection_summary: "Lo que proteges",
      scheduled_endowments: "Dotales programados",
      education_payout: "Recuperación educativa",
      missing_information: "Faltantes antes de presentar"
    }[block.type] || block.type;

    const lines = Array.isArray(block.lines) ? block.lines : [];
    const lineValues = lines.map(formatBenefitLine).filter(Boolean);

    if (lineValues.length) {
      rows.push({ label: title, value: lineValues.join(" · ") });
    }

    if (Array.isArray(block.rows)) {
      if (block.type === "scheduled_endowments" && block.calendar) {
        rows.push({
          label: title,
          value: "Calendario de dotales",
          calendar: block.calendar
        });
      }

      for (const row of block.rows) {
        const label = row.label || row.title || title;
        const value = formatBenefitLine(row) || row.value || row.text;
        if (value) rows.push({ label, value });
      }
    }

    for (const missing of normalizeBenefitMissing(block.missing)) {
      rows.push({ label: title, value: missing });
    }
  }

  return rows;
}

function normalizeVisibleSummaryLabel(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[\/·,]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function findVisibleSummaryValueNode(labelCandidates) {
  const wanted = labelCandidates
    .map(normalizeVisibleSummaryLabel)
    .filter(Boolean);

  const rows = Array.from(document.querySelectorAll(".fq-summary-row-105dr"));
  for (const row of rows) {
    const label = row.querySelector(".fq-summary-label-105dr");
    const value = row.querySelector(".fq-summary-value-105dr");
    const normalizedLabel = normalizeVisibleSummaryLabel(label?.textContent || "");
    if (value && wanted.some(candidate => normalizedLabel === candidate || normalizedLabel.includes(candidate) || candidate.includes(normalizedLabel))) {
      return value;
    }
  }

  return null;
}

function splitBenefitSegments(value) {
  return String(value || "")
    .split(/\s*·\s*/)
    .map(segment => segment.trim())
    .filter(Boolean);
}

function humanizeTechnicalText(value) {
  return String(value || "")
    .replace(/_/g, " ")
    .replace(/\bmissing\b/gi, "")
    .replace(/\bfalta escenario favorable\b/gi, "Falta escenario favorable")
    .replace(/\bfalta escenario desfavorable\b/gi, "Falta escenario desfavorable")
    .replace(/\bfalta escenario unfavorable\b/gi, "Falta escenario desfavorable")
    .replace(/\s+/g, " ")
    .trim();
}

function parsePlainBenefitNumber(value) {
  const raw = String(value ?? "")
    .replace(/,/g, "")
    .replace(/\s+/g, "")
    .trim();

  if (!/^-?\d+(\.\d+)?$/.test(raw)) return null;

  const number = Number(raw);
  return Number.isFinite(number) ? number : null;
}

function formatRoundedMxnValue(value) {
  return `≈ $${new Intl.NumberFormat("es-MX", {
    maximumFractionDigits: 0
  }).format(Math.round(Number(value)))} MXN`;
}

function formatRoundedUdiValue(value) {
  return `${new Intl.NumberFormat("es-MX", {
    maximumFractionDigits: 0
  }).format(Math.round(Number(value)))} UDI`;
}

function formatContributionProtectionValue(concept, rawValue) {
  const normalizedConcept = normalizeVisibleSummaryLabel(concept);
  const number = parsePlainBenefitNumber(rawValue);

  if (number === null) return rawValue;

  if (
    normalizedConcept.includes("total aportado proyectado") ||
    normalizedConcept.includes("suma asegurada actual")
  ) {
    return formatRoundedMxnValue(number);
  }

  if (
    normalizedConcept.includes("total aportado") ||
    normalizedConcept.includes("suma asegurada")
  ) {
    return formatRoundedUdiValue(number);
  }

  return rawValue;
}

function tableRowsFromValue(label, value) {
  const segments = splitBenefitSegments(value);
  const result = [];

  for (const rawSegment of segments) {
    const segment = humanizeTechnicalText(rawSegment);
    if (!segment) continue;

    const isContinuation =
      /^≈\s*\$/i.test(segment) ||
      /^udi proyectada\s*:/i.test(segment) ||
      /^edad\s+\d+/i.test(segment);

    const colonIndex = segment.indexOf(":");

    if (colonIndex > 0 && !isContinuation) {
      const concept = segment.slice(0, colonIndex).trim();
      const conceptValue = segment.slice(colonIndex + 1).trim();

      result.push({
        concept: concept || label || "Detalle",
        value: formatContributionProtectionValue(concept, conceptValue || "Pendiente")
      });
      continue;
    }

    if (result.length) {
      result[result.length - 1].value = [result[result.length - 1].value, segment]
        .filter(Boolean)
        .join(" · ");
    } else {
      result.push({
        concept: label || "Detalle",
        value: formatContributionProtectionValue(label || "Detalle", segment)
      });
    }
  }

  if (!result.length && value) {
    result.push({
      concept: label || "Detalle",
      value: formatContributionProtectionValue(label || "Detalle", String(value))
    });
  }

  return result;
}

function benefitValueKind(value) {
  const normalized = normalizeVisibleSummaryLabel(value);
  if (/\bmxn\b/i.test(value) || /^≈?\s*\$/i.test(value)) return "mxn";
  if (normalized.includes("amparado") || normalized.includes("estatus recomendado")) return "status";
  if (normalized.includes("fuente forge") || normalized.includes("detalle ") || normalized.includes("pendiente")) return "note";
  return "udi";
}

function appendSemanticValue(container, rawValue) {
  const parts = splitBenefitSegments(humanizeTechnicalText(rawValue));
  for (const part of parts.length ? parts : [String(rawValue || "")]) {
    const span = document.createElement("span");
    span.className = "fq-benefit-value-part-107z15p2";
    span.dataset.valueKind = benefitValueKind(part);
    span.textContent = part;
    container.appendChild(span);
  }
}

function createBenefitRow(item) {
  return createMetricRow({
    label: humanizeTechnicalText(item.concept),
    appendValue: (value) => appendSemanticValue(value, item.value)
  });
}

function appendTableBlock(container, title, sourceRows, blockKey = null) {
  const calendarRows = sourceRows.filter((row) => row.calendar);
  const rowsForTable = [];

  for (const row of sourceRows) {
    if (row.calendar) continue;
    rowsForTable.push(...tableRowsFromValue(row.label, row.value));
  }

  if (blockKey === "endowments" && calendarRows.length) rowsForTable.length = 0;

  if (!rowsForTable.length && !calendarRows.length) return;

  const block = createProductDashboardSection({
    title,
    key: blockKey || benefitBlockKey107z15p2R9E(title)
  });

  for (const row of calendarRows) {
    appendEndowmentCalendar(block, row.calendar);
  }

  if (rowsForTable.length && block.dataset.forgeBenefitBlock === "contribution") {
    const grid = document.createElement("div");
    grid.className = "fq-benefit-mini-grid-107z15p2";
    for (const item of rowsForTable) {
      grid.appendChild(createPrimaryMetric({
        label: humanizeTechnicalText(item.concept),
        appendValue: (value) => appendSemanticValue(value, item.value)
      }));
    }
    block.appendChild(grid);
  } else if (rowsForTable.length) {
    const rows = document.createElement("div");
    rows.className = block.dataset.forgeBenefitBlock === "women_health"
      ? "fq-benefit-pcf-grid-107z15p2"
      : "fq-benefit-rows-107z15p2";
    rowsForTable.forEach((item) => rows.appendChild(createBenefitRow(item)));
    block.appendChild(rows);
  }

  container.appendChild(block);
}

function appendEndowmentCalendar(container, calendar) {
  const payments = Array.isArray(calendar?.payments)
    ? calendar.payments
    : [];
  if (!payments.length) return;

  const recurrent = payments.filter((payment) => Number(payment.year) !== 20);
  const finalPayment = payments.find((payment) => Number(payment.year) === 20) || null;

  const schedule = document.createElement("div");
  schedule.className = "fq-benefit-dotales-107z15p2";

  if (recurrent.length) {
    const subtitle = document.createElement("p");
    subtitle.className = "fq-benefit-dotales-kicker-107z15p2";
    subtitle.textContent = "5% = 2,500 UDI c/u";
    const chips = document.createElement("div");
    chips.className = "fq-benefit-dotal-chips-107z15p2";
    for (const payment of recurrent) {
      chips.appendChild(createDashboardChip({
        label: `Año ${payment.year}`,
        primary: `${formatBenefitNumber(payment.udi, 0)} UDI`,
        secondary: formatProjectedCalendarMxn(payment.mxn)
      }));
    }
    schedule.append(subtitle, chips);
  }

  const totals = document.createElement("div");
  totals.className = "fq-benefit-dotal-totals-107z15p2";

  if (finalPayment) {
    const finalBlock = document.createElement("div");
    finalBlock.className = "fq-benefit-dotal-summary-107z15p2";

    const label = document.createElement("span");
    label.className = "fq-benefit-label-107z15p2";
    label.textContent = "Año 20 (80%)";

    const udi = document.createElement("strong");
    udi.className = "fq-benefit-dotal-udi-107z15p2";
    udi.textContent = `${formatBenefitNumber(finalPayment.udi, 0)} UDI`;

    const mxn = document.createElement("span");
    mxn.className = "fq-benefit-dotal-mxn-107z15p2";
    mxn.textContent = formatProjectedCalendarMxn(finalPayment.mxn);

    finalBlock.append(label, udi, mxn);
    totals.appendChild(finalBlock);
  }

  const total = calendar?.total;
  if (total) {
    const totalBlock = document.createElement("div");
    totalBlock.className = "fq-benefit-dotal-summary-107z15p2";

    const label = document.createElement("span");
    label.className = "fq-benefit-label-107z15p2";
    label.textContent = "Total dotales / recuperación por supervivencia";

    const udi = document.createElement("strong");
    udi.className = "fq-benefit-dotal-udi-107z15p2";
    udi.textContent = `${formatBenefitNumber(total.udi, 0)} UDI`;

    const mxn = document.createElement("span");
    mxn.className = "fq-benefit-dotal-mxn-107z15p2";
    mxn.textContent = formatProjectedCalendarMxn(total.mxn);

    totalBlock.append(label, udi, mxn);
    totals.appendChild(totalBlock);
  }

  if (totals.children.length) schedule.appendChild(totals);

  container.appendChild(schedule);
}

function recommendedBenefitName(label) {
  return humanizeTechnicalText(label).replace(/^Recomendado\s*-\s*/i, "").trim();
}

function recommendedBenefitFields(value) {
  const fields = [];
  for (const rawPart of splitBenefitSegments(value)) {
    const part = humanizeTechnicalText(rawPart);
    if (/^Detalle\s+(PEP|CLP)/i.test(part)) continue;
    if (/^Estatus:/i.test(part)) fields.push({ label: "Estatus", value: part.replace(/^Estatus:\s*/i, "") });
    else if (/^Prima MXN:/i.test(part)) fields.push({ label: "Prima MXN", value: part.replace(/^Prima MXN:\s*/i, "") });
    else if (/^Prima:/i.test(part)) fields.push({ label: "Prima UDI", value: part.replace(/^Prima:\s*/i, "") });
    else if (/MXN/i.test(part)) fields.push({ label: "Suma asegurada MXN", value: part });
    else if (/UDI/i.test(part)) fields.push({ label: "Suma asegurada", value: part });
  }
  return fields;
}

function appendRecommendedBlock(container, sourceRows) {
  if (!sourceRows.length) return;
  const block = createProductDashboardSection({
    title: "Beneficios recomendados",
    key: "recommended"
  });

  const totalRow = sourceRows.find((row) => normalizeVisibleSummaryLabel(row.label).includes("prima total con beneficios recomendados"));
  if (totalRow) {
    const total = document.createElement("div");
    total.className = "fq-benefit-recommended-total-107z15p2";
    const totalValue = String(totalRow.value || "").replace(/^Prima total con beneficios recomendados:\s*/i, "");
    total.appendChild(createBenefitRow({ concept: "Prima total con beneficios recomendados", value: totalValue }));
    block.appendChild(total);
  }

  const grid = document.createElement("div");
  grid.className = "fq-benefit-recommended-grid-107z15p2";
  for (const row of sourceRows.filter((item) => /^recomendado\s*-/i.test(String(item.label || "")))) {
    grid.appendChild(createRecommendedBenefitCard({
      name: recommendedBenefitName(row.label),
      fields: recommendedBenefitFields(row.value),
      appendValue: appendSemanticValue
    }));
  }
  if (grid.children.length) block.appendChild(grid);
  container.appendChild(block);
}

function appendMissingBlock(container, sourceRows) {
  const values = [];

  for (const row of sourceRows) {
    for (const segment of splitBenefitSegments([row.label, row.value].filter(Boolean).join(": "))) {
      const clean = humanizeTechnicalText(segment);
      if (!clean) continue;
      if (/^faltante escenario$/i.test(clean)) continue;
      if (/^faltantes antes de presentar$/i.test(clean)) continue;
      if (!values.includes(clean)) values.push(clean);
    }
  }

  if (!values.length) return;

  container.appendChild(createMissingInformationSection({ values }));
}

function scenarioOrder(row) {
  const label = normalizeVisibleSummaryLabel(row.label);
  if (label.includes("actual") || label.includes("base")) return 1;
  if (label.includes("favorable")) return 2;
  if (label.includes("desfavorable") || label.includes("unfavorable")) return 3;
  return 9;
}

function writeVisibleBenefitRuntimeGrid(rows, emptyText) {
  const target = findVisibleSummaryValueNode([
    "Valores, beneficios o escenarios relevantes",
    "Valores beneficios escenarios relevantes",
    "Valores / beneficios / escenarios"
  ]);

  if (!target) return false;

  const cleanRows = rows
    .filter(item => item && item.value !== null && item.value !== undefined && String(item.value).trim() !== "");

  target.textContent = "";

  if (!cleanRows.length) {
    target.textContent = emptyText || "Sin beneficios adicionales detectados.";
    return true;
  }

  const groups = {
    contribution: [],
    protection: [],
    endowments: [],
    recovery: [],
    womenHealth: [],
    recommended: [],
    scenarios: [],
    missing: [],
    other: []
  };

  for (const row of cleanRows) {
    const normalizedLabel = normalizeVisibleSummaryLabel(row.label);
    const normalizedValue = normalizeVisibleSummaryLabel(row.value);

    if (
      normalizedLabel.includes("faltante") ||
      normalizedLabel.includes("pendiente") ||
      normalizedValue.includes("missing") ||
      normalizedValue.includes("falta escenario")
    ) {
      groups.missing.push(row);
      continue;
    }

    if (normalizedLabel.includes("escenario")) {
      groups.scenarios.push(row);
      continue;
    }

    if (
      normalizedLabel.includes("fallecimiento") ||
      normalizedLabel === "pcf cancer femenino" ||
      normalizedLabel.includes("lo que proteges")
    ) {
      groups.protection.push(row);
      continue;
    }

    if (
      normalizedLabel.includes("pcf") ||
      normalizedLabel.includes("cancer") ||
      normalizedLabel.includes("tumor") ||
      normalizedLabel.includes("enfermedad protegida")
    ) {
      groups.womenHealth.push(row);
      continue;
    }

    if (
      normalizedLabel.includes("dotal") ||
      normalizedLabel.includes("supervivencia")
    ) {
      groups.endowments.push(row);
      continue;
    }

    if (
      normalizedLabel.includes("recuperacion") ||
      normalizedLabel.includes("rescate ave") ||
      normalizedLabel.includes("valor en efectivo") ||
      normalizedLabel.includes("porcentaje recuperacion")
    ) {
      groups.recovery.push(row);
      continue;
    }

    if (
      normalizedLabel.includes("recomendado") ||
      normalizedLabel.includes("adapta") ||
      normalizedLabel.includes("bma") ||
      normalizedLabel.includes("pep") ||
      normalizedLabel.includes("clp")
    ) {
      groups.recommended.push(row);
      continue;
    }

    if (
      normalizedLabel.includes("prima anual base") ||
      normalizedLabel.includes("prima ave anual") ||
      normalizedLabel.includes("prima anual total con ave") ||
      normalizedLabel.includes("total aportado") ||
      normalizedLabel.includes("prima anual acumulada con ave") ||
      normalizedLabel.includes("plazo de pago") ||
      normalizedLabel.includes("lo que aportas")
    ) {
      groups.contribution.push(row);
      continue;
    }

    if (
      normalizedLabel.includes("protege") ||
      normalizedLabel.includes("proteccion") ||
      normalizedValue.includes("suma asegurada")
    ) {
      groups.protection.push(row);
      continue;
    }

    groups.other.push(row);
  }

  groups.scenarios.sort((a, b) => scenarioOrder(a) - scenarioOrder(b));

  const wrapper = createProductDashboard();

  if (groups.contribution.length) appendTableBlock(wrapper, "Lo que aportas", groups.contribution, "contribution");
  if (groups.protection.length) appendTableBlock(wrapper, "Lo que proteges", groups.protection, "protection");
  if (groups.endowments.length) appendTableBlock(wrapper, "Dotales por supervivencia", groups.endowments, "endowments");
  if (groups.recovery.length) appendTableBlock(wrapper, "Recuperación", groups.recovery.filter((row) => !normalizeVisibleSummaryLabel(row.label).includes("dotales por supervivencia")), "recovery");
  if (groups.womenHealth.length) appendTableBlock(wrapper, "Tabla de enfermedades protegidas PCF", groups.womenHealth, "women_health");
  if (groups.recommended.length) appendRecommendedBlock(wrapper, groups.recommended);

  for (const scenario of groups.scenarios) {
    appendTableBlock(wrapper, humanizeTechnicalText(scenario.label), [scenario]);
  }

  const otherRows = groups.other.filter((row) => {
    const label = normalizeVisibleSummaryLabel(row.label);
    return label.includes("bait invalidez") ||
      label.includes("bam asistencia") ||
      label.includes("av apoyo en vida") ||
      label.includes("bit exencion");
  });
  if (otherRows.length) appendTableBlock(wrapper, "Otros detalles", otherRows, "other");
  if (groups.missing.length) appendMissingBlock(wrapper, groups.missing);

  target.appendChild(wrapper);
  normalizeBenefitLayout107z15p2R9E();
  return true;
}

function benefitFallbackRows(calc) {
  return [
    { label: "Total aportado", value: formatUdiWithMxn(calc.totalContributed, calc.currency, calc.totalContributedMXN, calc.udiRateMetadata).join(" · ") },
    { label: "Recuperación base", value: formatUdiWithMxn(calc.totalRecovery, calc.currency, calc.totalRecoveryMXN, calc.udiRateMetadata).join(" · ") },
    { label: "Valor UDI", value: isUdiCurrency(calc.currency) ? formatUdiMetadataLine(calc.udiRateMetadata) : null },
    { label: "UDI proyectada a retiro", value: hasValue(calc.projectedUdiAtRetirement) ? `$${Number(calc.projectedUdiAtRetirement).toLocaleString("es-MX", { maximumFractionDigits: 3 })} MXN` : null },
    { label: "Protección actual", value: formatMxn(calc.currentProtectionMXN) },
    { label: "Renta mensual a retiro", value: formatMxn(calc.monthlyIncomeMXN) },
    { label: "Renta anual a retiro", value: formatMxn(calc.annualIncomeMXN) },
    ...calc.accumulatedIncome.map(item => ({ label: `Renta acumulada a ${item.toAge}`, value: formatMxn(item.mxn) })),
    { label: "Escenario base", value: scenarioText(calc.base, calc.currency) },
    { label: "Escenario favorable", value: scenarioText(calc.favorable, calc.currency) },
    { label: "Escenario desfavorable", value: scenarioText(calc.unfavorable, calc.currency) },
    { label: "Tasa de retiro", value: calc.interestRate },
    { label: "Periodo de garantía", value: calc.guaranteePeriod },
    { label: "Plazo de pagos", value: `${calc.paymentYears} años` },
    { label: "Asesor", value: calc.advisor },
    { label: "Fecha de cotización", value: calc.quoteDate },
    ...calc.optionalCoverages.map(item => ({
      label: item.coverage || "Cobertura adicional",
      value: [
        item.term,
        hasValue(item.sumInsured) ? `Suma asegurada: ${formatAmount(item.sumInsured, calc.currency)}` : null,
        hasValue(item.annualPremium) ? `Prima anual: ${formatAmount(item.annualPremium, calc.currency)}` : null
      ].filter(Boolean).join(" · ")
    }))
  ];
}

function buildDynamicBenefitSummary(calc) {
  const nativeBenefitSummary = calc?.nativeResult?.benefitSummary || calc?.benefitSummary;
  if (nativeBenefitSummary && isSegubecaProduct({ ...calc, benefitSummary: nativeBenefitSummary })) {
    return nativeBenefitSummary;
  }
  const benefitApi = benefitSummaryApiSync();
  if (!benefitApi?.buildQuoteBenefitSummary) return null;

  const nativeResult = {
    ...(calc.nativeResult || {}),
    retirementScenarioBase: calc.base,
    retirementScenarioFavorable: calc.favorable,
    retirementScenarioUnfavorable: calc.unfavorable
  };

  return benefitApi.buildQuoteBenefitSummary({
    productFamily:
      calc.productFamily ||
      calc.family ||
      calc.context?.productFamily ||
      calc.context?.product_family ||
      nativeResult.productFamily ||
      nativeResult.product_family ||
      nativeResult.product,
    product:
      calc.product ||
      calc.productName ||
      calc.plan ||
      nativeResult.product ||
      calc.context?.product,
    nativeResult,
    context: calc.context || {},
    udiProjection: calc.udiProjection || null,
    currencyMetadata: calc.udiRateMetadata || {},
    productIntelligence: calc.productIntelligence || null
  });
}

function usesSegubecaStructuredDashboardR14F(calc) {
  const nativeBenefitSummary = calc?.nativeResult?.benefitSummary || calc?.benefitSummary;
  return Boolean(
    nativeBenefitSummary &&
    isSegubecaProduct({ ...calc, benefitSummary: nativeBenefitSummary })
  );
}

function buildDynamicBenefitSummaryRows(calc) {
  return benefitSummaryToRuntimeRows(buildDynamicBenefitSummary(calc));
}

function renderImaginaSerBenefitSummary(calc, benefitSummary) {
  if (!benefitSummary || !isImaginaSerProduct(calc)) return false;
  const target = findVisibleSummaryValueNode([
    "Valores, beneficios o escenarios relevantes",
    "Valores beneficios escenarios relevantes",
    "Valores / beneficios / escenarios"
  ]);
  if (!target) return false;

  const model = buildImaginaSerDashboardModel(benefitSummary);
  const dashboard = renderImaginaSerDashboard(model, {
    appendValue: appendSemanticValue
  });
  if (!dashboard) return false;

  target.textContent = "";
  target.appendChild(dashboard);
  normalizeBenefitLayout107z15p2R9E();
  return true;
}

function renderOrviBenefitSummary(calc, benefitSummary) {
  const input = { ...(calc || {}), benefitSummary };
  if (!isOrviProduct(input)) return false;
  const target = findVisibleSummaryValueNode([
    "Valores, beneficios o escenarios relevantes",
    "Valores beneficios escenarios relevantes",
    "Valores beneficios o escenarios relevantes",
    "Valores / beneficios / escenarios"
  ]);
  if (!target) return false;
  const model = buildOrviDashboardModel({ ...(calc || {}), benefitSummary });
  if (!model) return false;
  const dashboard = renderOrviDashboard(model, {
    appendValue: appendSemanticValue
  });
  if (!dashboard) return false;
  target.textContent = "";
  target.appendChild(dashboard);
  normalizeBenefitLayout107z15p2R9E();
  return true;
}

function renderSegubecaBenefitSummary(calc, benefitSummary) {
  if (!benefitSummary || !isSegubecaProduct({ ...calc, benefitSummary })) return false;
  const target = findVisibleSummaryValueNode([
    "Valores, beneficios o escenarios relevantes",
    "Valores beneficios escenarios relevantes",
    "Valores beneficios o escenarios relevantes"
  ]);
  if (!target) return false;

  const model = buildSegubecaDashboardModel(benefitSummary);
  const dashboard = renderSegubecaDashboard(model, {
    appendValue: appendSemanticValue
  });
  if (!dashboard) return false;

  target.innerHTML = "";
  target.appendChild(dashboard);
  normalizeBenefitLayout107z15p2R9E();
  return true;
}

function renderVisibleDynamicBenefitSummary(calc) {
  const fallbackRows = benefitFallbackRows(calc);
  const benefitSummary = buildDynamicBenefitSummary(calc);
  const dynamicRows = benefitSummaryToRuntimeRows(benefitSummary);

  if (
    !renderOrviBenefitSummary(calc, benefitSummary) &&
    !renderSegubecaBenefitSummary(calc, benefitSummary) &&
    !renderImaginaSerBenefitSummary(calc, benefitSummary)
  ) {
    writeVisibleBenefitRuntimeGrid(
      dynamicRows.length ? dynamicRows : fallbackRows,
      "El PDF no entregó valores adicionales."
    );
  }

  if (!dynamicRows.length && !benefitSummaryApiSync()?.buildQuoteBenefitSummary) {
    globalThis.addEventListener("forge:quote-benefit-summary-ready", () => {
      const lateSummary = buildDynamicBenefitSummary(calc);
      const lateRows = benefitSummaryToRuntimeRows(lateSummary);
      if (
    !renderOrviBenefitSummary(calc, lateSummary) &&
    !renderSegubecaBenefitSummary(calc, lateSummary) &&
    !renderImaginaSerBenefitSummary(calc, lateSummary)
      ) {
        writeVisibleBenefitRuntimeGrid(
          lateRows.length ? lateRows : fallbackRows,
          "El PDF no entregó valores adicionales."
        );
      }
    }, { once: true });
  }

  return dynamicRows;
}

function renderAcceptedQuote(calc, { writeRuntimeGrid } = {}) {
  const acceptedRateMetadata = resolveAcceptedRateMetadata(calc);
  setSummaryValue(["Total aportado"], formatUdiWithMxn(calc.totalContributed, calc.currency, calc.totalContributedMXN, acceptedRateMetadata));
  setSummaryValue(["Total recuperación", "Recuperación total"], formatUdiWithMxn(calc.totalRecovery, calc.currency, calc.totalRecoveryMXN, acceptedRateMetadata));
  setSummaryValue(["Forma de pago"], calc.paymentMode);
  setSummaryValue(["Moneda"], calc.currency);
  if (isOrviProduct(calc)) {
    setSummaryLabel(["Forma de pago, moneda y vigencia"], "Moneda y plazo de aportación");
    setSummaryValue(["Moneda y plazo de aportación"], [
      buildOrviSummaryPaymentLine(calc),
      formatOrviRateMetadataLine(acceptedRateMetadata)
    ]);
  } else {
    setSummaryValue(["Forma de pago, moneda y vigencia"], [
      [calc.paymentMode, calc.currency, calc.coveragePeriod].filter(Boolean).join(" · "),
      formatUdiMetadataLine(calc.udiRateMetadata)
    ]);
  }
  if (isSegubecaProduct(calc)) {
    const missingValues = calc?.nativeResult?.missing_information || calc?.missing_information || [];
    setSummaryValue(
      "Faltantes antes de presentar",
      Array.isArray(missingValues) && missingValues.length
        ? missingValues.join(" · ")
        : "Sin faltantes críticos detectados"
    );

    const totalRecovery = calc?.totalRecovery ?? calc?.nativeResult?.totalRecovery ?? null;
    if (totalRecovery !== null && totalRecovery !== undefined && totalRecovery !== "") {
      setSummaryValue("Total recuperación", formatRoundedUdiValue(totalRecovery));
    }
  }

  const usesSegubecaDashboard = usesSegubecaStructuredDashboardR14F(calc);
  const dynamicBenefitRows = renderVisibleDynamicBenefitSummary(calc);
  if (typeof writeRuntimeGrid === "function" && !usesSegubecaDashboard) {
    if (!dynamicBenefitRows.length) {
      writeRuntimeGrid(
        "Valores, beneficios o escenarios relevantes",
        benefitFallbackRows(calc),
        "El PDF no entregó valores adicionales."
      );
    }
    const missing = [
      ["Forma de pago", calc.paymentMode],
      ["Moneda", calc.currency],
      ["Recuperación base", calc.totalRecovery],
      ["Escenario favorable", calc.favorable],
      ["Escenario desfavorable", calc.unfavorable]
    ].filter(([, value]) => !hasValue(value)).map(([label]) => ({ label: "Pendiente", value: label }));
    writeRuntimeGrid(
      "Faltantes antes de presentar",
      missing,
      "Cotización calculada. No quedan campos principales pendientes."
    );
  }
}

const api = Object.freeze({
  renderAcceptedQuote,
  renderVisibleDynamicBenefitSummary,
  writeVisibleBenefitRuntimeGrid,
  benefitFallbackRows,
  buildDynamicBenefitSummary,
  buildDynamicBenefitSummaryRows,
  usesSegubecaStructuredDashboardR14F,
  benefitSummaryToRuntimeRows,
  formatUdiWithMxn,
  formatUdiMetadataLine,
  formatMxn,
  setSummaryValue,
  resolveAcceptedRateMetadata,
  buildOrviSummaryPaymentLine,
  formatOrviRateMetadataLine
});

globalThis.ForgeBenefitSummaryRenderer = api;

export {
  renderAcceptedQuote,
  renderVisibleDynamicBenefitSummary,
  writeVisibleBenefitRuntimeGrid,
  benefitFallbackRows,
  buildDynamicBenefitSummary,
  buildDynamicBenefitSummaryRows,
  usesSegubecaStructuredDashboardR14F,
  benefitSummaryToRuntimeRows,
  formatUdiWithMxn,
  formatUdiMetadataLine,
  formatMxn,
  setSummaryValue,
  resolveAcceptedRateMetadata,
  buildOrviSummaryPaymentLine,
  formatOrviRateMetadataLine
};
