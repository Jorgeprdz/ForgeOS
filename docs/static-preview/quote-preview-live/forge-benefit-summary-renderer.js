import { normalizeBenefitLayout107z15p2R9E } from "./forge-benefit-summary-layout.js";

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

function normalize(value) {
  return String(value ?? "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function findSummaryTarget(labels) {
  const wanted = labels.map(normalize);
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

function appendTableBlock(container, title, sourceRows) {
  const rowsForTable = [];

  for (const row of sourceRows) {
    rowsForTable.push(...tableRowsFromValue(row.label, row.value));
  }

  if (!rowsForTable.length) return;

  const block = document.createElement("section");
  block.className = "fq-benefit-block-107z15p2";

  const heading = document.createElement("h4");
  heading.className = "fq-benefit-title-107z15p2";
  heading.textContent = title;

  const wrap = document.createElement("div");
  wrap.className = "fq-benefit-table-wrap-107z15p2";

  const table = document.createElement("table");
  table.className = "fq-benefit-table-107z15p2";

  const tbody = document.createElement("tbody");

  for (const item of rowsForTable) {
    const tr = document.createElement("tr");

    const th = document.createElement("th");
    th.scope = "row";
    th.textContent = humanizeTechnicalText(item.concept);

    const td = document.createElement("td");
    td.textContent = humanizeTechnicalText(item.value);

    tr.append(th, td);
    tbody.appendChild(tr);
  }

  table.appendChild(tbody);
  wrap.appendChild(table);
  block.append(heading, wrap);
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

  const block = document.createElement("section");
  block.className = "fq-benefit-block-107z15p2";

  const heading = document.createElement("h4");
  heading.className = "fq-benefit-title-107z15p2";
  heading.textContent = "Faltantes antes de presentar";

  const list = document.createElement("ul");
  list.className = "fq-benefit-missing-list-107z15p2";

  for (const value of values) {
    const li = document.createElement("li");
    li.textContent = value;
    list.appendChild(li);
  }

  block.append(heading, list);
  container.appendChild(block);
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
      normalizedLabel.includes("aporta") ||
      normalizedLabel.includes("aportado") ||
      normalizedValue.includes("total aportado")
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

  const wrapper = document.createElement("div");
  wrapper.className = "fq-benefit-summary-107z15p2";

  if (groups.contribution.length) appendTableBlock(wrapper, "Lo que aportas", groups.contribution);
  if (groups.protection.length) appendTableBlock(wrapper, "Lo que proteges", groups.protection);
  if (groups.endowments.length) appendTableBlock(wrapper, "Dotales por supervivencia", groups.endowments);
  if (groups.recovery.length) appendTableBlock(wrapper, "Recuperación", groups.recovery);
  if (groups.womenHealth.length) appendTableBlock(wrapper, "Tabla de enfermedades protegidas PCF", groups.womenHealth);
  if (groups.recommended.length) appendTableBlock(wrapper, "Beneficios recomendados", groups.recommended);

  for (const scenario of groups.scenarios) {
    appendTableBlock(wrapper, humanizeTechnicalText(scenario.label), [scenario]);
  }

  if (groups.other.length) appendTableBlock(wrapper, "Otros detalles", groups.other);
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

function buildDynamicBenefitSummaryRows(calc) {
  const benefitApi = benefitSummaryApiSync();
  if (!benefitApi?.buildQuoteBenefitSummary) return [];

  const nativeResult = {
    ...(calc.nativeResult || {}),
    retirementScenarioBase: calc.base,
    retirementScenarioFavorable: calc.favorable,
    retirementScenarioUnfavorable: calc.unfavorable
  };

  const benefitSummary = benefitApi.buildQuoteBenefitSummary({
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

  return benefitSummaryToRuntimeRows(benefitSummary);
}

function renderVisibleDynamicBenefitSummary(calc) {
  const fallbackRows = benefitFallbackRows(calc);
  const dynamicRows = buildDynamicBenefitSummaryRows(calc);

  writeVisibleBenefitRuntimeGrid(
    dynamicRows.length ? dynamicRows : fallbackRows,
    "El PDF no entregó valores adicionales."
  );

  if (!dynamicRows.length && !benefitSummaryApiSync()?.buildQuoteBenefitSummary) {
    globalThis.addEventListener("forge:quote-benefit-summary-ready", () => {
      const lateRows = buildDynamicBenefitSummaryRows(calc);
      writeVisibleBenefitRuntimeGrid(
        lateRows.length ? lateRows : fallbackRows,
        "El PDF no entregó valores adicionales."
      );
    }, { once: true });
  }

  return dynamicRows;
}

function renderAcceptedQuote(calc, { writeRuntimeGrid } = {}) {
  setSummaryValue(["Total aportado"], formatUdiWithMxn(calc.totalContributed, calc.currency, calc.totalContributedMXN, calc.udiRateMetadata));
  setSummaryValue(["Total recuperación", "Recuperación total"], formatUdiWithMxn(calc.totalRecovery, calc.currency, calc.totalRecoveryMXN, calc.udiRateMetadata));
  setSummaryValue(["Forma de pago"], calc.paymentMode);
  setSummaryValue(["Moneda"], calc.currency);
  setSummaryValue(["Forma de pago, moneda y vigencia"], [
    [calc.paymentMode, calc.currency, calc.coveragePeriod].filter(Boolean).join(" · "),
    formatUdiMetadataLine(calc.udiRateMetadata)
  ]);
  const dynamicBenefitRows = renderVisibleDynamicBenefitSummary(calc);
  if (typeof writeRuntimeGrid === "function") {
    writeRuntimeGrid(
      "Valores, beneficios o escenarios relevantes",
      dynamicBenefitRows.length ? dynamicBenefitRows : benefitFallbackRows(calc),
      "El PDF no entregó valores adicionales."
    );
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
  buildDynamicBenefitSummaryRows,
  benefitSummaryToRuntimeRows,
  formatUdiWithMxn,
  formatUdiMetadataLine,
  formatMxn,
  setSummaryValue
});

globalThis.ForgeBenefitSummaryRenderer = api;

export {
  renderAcceptedQuote,
  renderVisibleDynamicBenefitSummary,
  writeVisibleBenefitRuntimeGrid,
  benefitFallbackRows,
  buildDynamicBenefitSummaryRows,
  benefitSummaryToRuntimeRows,
  formatUdiWithMxn,
  formatUdiMetadataLine,
  formatMxn,
  setSummaryValue
};
