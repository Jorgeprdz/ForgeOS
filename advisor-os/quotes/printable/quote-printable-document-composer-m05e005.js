import {
  QUOTE_PRINTABLE_READ_MODEL_TYPE,
} from "./quote-printable-read-model.js";

const QUOTE_PRINTABLE_DOCUMENT_TYPE =
  "FORGE_QUOTE_PRINTABLE_DOCUMENT_HTML";
const CONTRACT_VERSION = "M05E005_PREMIUM_PORTRAIT_COMPOSER_V1";
const SUPPORTED_PAGE_FORMATS = new Set(["A4", "LETTER"]);

function isRecord(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function deepFreeze(value, seen = new WeakSet()) {
  if (!value || typeof value !== "object" || seen.has(value)) return value;
  seen.add(value);
  Object.values(value).forEach((item) => deepFreeze(item, seen));
  return Object.freeze(value);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function safeAttribute(value) {
  return escapeHtml(String(value ?? "").replace(/[\r\n\t]/g, " "));
}

function normalizePageFormat(value) {
  const format = String(value || "A4").trim().toUpperCase();
  const resolved = format === "CARTA" ? "LETTER" : format;
  if (!SUPPORTED_PAGE_FORMATS.has(resolved)) {
    throw new TypeError(`Unsupported page format: ${resolved}`);
  }
  return resolved;
}

function slug(value, fallback = "sin-dato") {
  const normalized = String(value ?? "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return normalized || fallback;
}

function numberFormatter(locale, options = {}) {
  return new Intl.NumberFormat(locale, {
    maximumFractionDigits: 2,
    ...options,
  });
}

function formatPrimitive(value, field, locale) {
  if (typeof value === "number") {
    const unit = String(field?.unit || "").trim();
    if (/^[A-Z]{3}$/.test(unit)) {
      try {
        return new Intl.NumberFormat(locale, {
          style: "currency",
          currency: unit,
          maximumFractionDigits: 2,
        }).format(value);
      } catch {}
    }
    return [numberFormatter(locale).format(value), unit]
      .filter(Boolean)
      .join(" ");
  }
  if (typeof value === "boolean") return value ? "Sí" : "No";
  return String(value ?? "").trim();
}

function humanizeKey(value) {
  return String(value || "")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .trim()
    .replace(/^./, (character) => character.toUpperCase());
}

function renderValue(value, field, locale) {
  if (value === null || typeof value === "undefined" || value === "") {
    return '<span class="qpd-unavailable">Sin dato confirmado</span>';
  }
  if (Array.isArray(value)) {
    if (!value.length) {
      return '<span class="qpd-unavailable">Sin dato confirmado</span>';
    }
    return `<ul class="qpd-value-list">${value.map((item) =>
      `<li>${renderValue(item, field, locale)}</li>`).join("")}</ul>`;
  }
  if (isRecord(value)) {
    const rows = Object.entries(value)
      .filter(([, item]) => item !== null && typeof item !== "undefined")
      .map(([key, item]) => `
        <div class="qpd-object-row">
          <dt>${escapeHtml(humanizeKey(key))}</dt>
          <dd>${renderValue(item, field, locale)}</dd>
        </div>`)
      .join("");
    return rows
      ? `<dl class="qpd-object">${rows}</dl>`
      : '<span class="qpd-unavailable">Sin dato confirmado</span>';
  }
  return escapeHtml(formatPrimitive(value, field, locale));
}

function summaryValue(field, locale) {
  if (!field || field.status !== "CONFIRMED") return "Sin dato confirmado";
  if (isRecord(field.value) || Array.isArray(field.value)) return "Ver detalle";
  return formatPrimitive(field.value, field, locale) || "Sin dato confirmado";
}

function allFields(readModel) {
  const map = new Map();
  for (const field of Object.values(readModel.summary || {})) {
    if (field?.id) map.set(field.id, field);
  }
  for (const section of readModel.sections || []) {
    for (const field of section.fields || []) {
      if (field?.id) map.set(field.id, field);
    }
  }
  return map;
}

function firstAvailable(map, ids) {
  for (const id of ids) {
    const field = map.get(id);
    if (field?.status === "CONFIRMED") return field;
  }
  return null;
}

function renderMetric(field, fallbackLabel, locale) {
  const label = field?.label || fallbackLabel;
  const value = field?.status === "CONFIRMED"
    ? renderValue(field.value, field, locale)
    : '<span class="qpd-unavailable">Sin dato confirmado</span>';
  return `
    <article class="qpd-metric">
      <span>${escapeHtml(label)}</span>
      <strong>${value}</strong>
    </article>`;
}

function renderField(field, locale) {
  const projection = field.classification === "PROJECTION";
  const unavailable = field.status !== "CONFIRMED";
  return `
    <article class="qpd-field${projection ? " qpd-field--projection" : ""}${unavailable ? " qpd-field--unavailable" : ""}"
      data-field-id="${safeAttribute(field.id)}"
      data-source-path="${safeAttribute(field.sourcePath || "unavailable")}">
      <div class="qpd-field__topline">
        <span>${escapeHtml(field.label)}</span>
        ${projection ? '<small>Proyección</small>' : ""}
      </div>
      <div class="qpd-field__value">${
        unavailable
          ? '<span class="qpd-unavailable">Sin dato confirmado</span>'
          : renderValue(field.value, field, locale)
      }</div>
    </article>`;
}

function renderSection(section, locale) {
  return `
    <section class="qpd-section" data-section-id="${safeAttribute(section.id)}">
      <header class="qpd-section__header">
        <div>
          <span class="qpd-section__eyebrow">Detalle de la propuesta</span>
          <h2>${escapeHtml(section.title)}</h2>
        </div>
        <small>${section.availableFieldCount} dato${section.availableFieldCount === 1 ? "" : "s"} confirmado${section.availableFieldCount === 1 ? "" : "s"}</small>
      </header>
      <div class="qpd-field-grid">
        ${(section.fields || []).map((field) => renderField(field, locale)).join("")}
      </div>
    </section>`;
}

function sourceRows(readModel) {
  const rows = [];
  const seen = new Set();
  for (const section of readModel.sections || []) {
    for (const field of section.fields || []) {
      if (field.status !== "CONFIRMED" || !field.sourcePath) continue;
      const key = `${field.id}|${field.sourcePath}`;
      if (seen.has(key)) continue;
      seen.add(key);
      rows.push(field);
    }
  }
  return rows;
}

function renderSources(readModel) {
  const rows = sourceRows(readModel);
  return `
    <section class="qpd-section qpd-section--sources">
      <header class="qpd-section__header">
        <div>
          <span class="qpd-section__eyebrow">Trazabilidad</span>
          <h2>Fuentes del documento</h2>
        </div>
        <small>${rows.length} referencias</small>
      </header>
      <div class="qpd-source-list">
        ${rows.map((field) => `
          <article>
            <strong>${escapeHtml(field.label)}</strong>
            <span>${escapeHtml(field.authority || "No disponible")}</span>
            <code>${escapeHtml(field.sourcePath)}</code>
          </article>`).join("")}
      </div>
    </section>`;
}

function buildFileName(readModel) {
  return [
    "cotizacion",
    slug(readModel.summary?.client?.value, "cliente"),
    slug(readModel.summary?.product?.value, "producto"),
    slug(readModel.summary?.quoteId?.value, readModel.sourceRevisionHash),
  ].join("-") + ".pdf";
}

function cssFor(format) {
  const pageSize = format === "LETTER" ? "Letter" : "A4";
  const width = format === "LETTER" ? "216mm" : "210mm";
  return `
    @page { size: ${pageSize} portrait; margin: 12mm 12mm 15mm; }
    :root {
      color-scheme: light;
      --navy: #07172d;
      --navy-2: #0d2543;
      --teal: #18b8b1;
      --teal-soft: #e8f7f5;
      --gold: #d9a842;
      --gold-soft: #fff7e6;
      --ink: #142033;
      --muted: #68758a;
      --line: #dfe6ef;
      --surface: #f5f8fb;
      --white: #ffffff;
    }
    * { box-sizing: border-box; }
    html, body {
      margin: 0;
      padding: 0;
      background: var(--white);
      color: var(--ink);
      font-family: Inter, ui-sans-serif, system-ui, -apple-system,
        BlinkMacSystemFont, "Segoe UI", sans-serif;
      font-size: 10pt;
      line-height: 1.42;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .qpd-document { width: 100%; }
    .qpd-cover {
      min-height: 252mm;
      display: grid;
      grid-template-rows: auto auto 1fr auto;
      gap: 9mm;
      break-after: page;
      page-break-after: always;
    }
    .qpd-cover-hero {
      position: relative;
      overflow: hidden;
      min-height: 82mm;
      border-radius: 7mm;
      padding: 12mm;
      background:
        radial-gradient(circle at 90% 12%, rgba(24,184,177,.28), transparent 30%),
        linear-gradient(145deg, var(--navy), var(--navy-2));
      color: var(--white);
    }
    .qpd-cover-hero::after {
      content: "";
      position: absolute;
      right: -18mm;
      bottom: -24mm;
      width: 72mm;
      height: 72mm;
      border: 1.2mm solid rgba(217,168,66,.34);
      border-radius: 50%;
    }
    .qpd-brand {
      display: flex;
      align-items: center;
      gap: 3mm;
      font-size: 8.5pt;
      font-weight: 900;
      letter-spacing: .13em;
      text-transform: uppercase;
    }
    .qpd-brand-mark {
      width: 7mm;
      height: 7mm;
      border-radius: 2mm;
      background: linear-gradient(135deg, var(--teal), var(--gold));
      box-shadow: 0 0 0 1.2mm rgba(255,255,255,.08);
    }
    .qpd-cover-kicker {
      display: block;
      margin-top: 13mm;
      color: #8fe6e2;
      font-size: 8pt;
      font-weight: 900;
      letter-spacing: .14em;
      text-transform: uppercase;
    }
    .qpd-cover h1 {
      max-width: 150mm;
      margin: 2.5mm 0 2mm;
      font-size: 28pt;
      line-height: 1.02;
      letter-spacing: -.045em;
    }
    .qpd-cover-product {
      margin: 0;
      color: #f6cf79;
      font-size: 13pt;
      font-weight: 800;
    }
    .qpd-cover-description {
      max-width: 145mm;
      margin: 4mm 0 0;
      color: rgba(255,255,255,.72);
      font-size: 10.5pt;
    }
    .qpd-metric-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 4mm;
    }
    .qpd-metric {
      min-width: 0;
      min-height: 29mm;
      border: 1px solid var(--line);
      border-radius: 4mm;
      padding: 5mm;
      background: var(--white);
      box-shadow: 0 2mm 7mm rgba(7,23,45,.06);
    }
    .qpd-metric span {
      display: block;
      margin-bottom: 2mm;
      color: var(--muted);
      font-size: 7.7pt;
      font-weight: 800;
      letter-spacing: .06em;
      text-transform: uppercase;
    }
    .qpd-metric strong {
      display: block;
      color: var(--navy);
      font-size: 14pt;
      line-height: 1.18;
      overflow-wrap: anywhere;
    }
    .qpd-identity-strip {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 1px;
      overflow: hidden;
      border: 1px solid var(--line);
      border-radius: 4mm;
      background: var(--line);
    }
    .qpd-identity-strip article {
      min-width: 0;
      padding: 4mm 5mm;
      background: var(--surface);
    }
    .qpd-identity-strip span {
      display: block;
      color: var(--muted);
      font-size: 7.5pt;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: .05em;
    }
    .qpd-identity-strip strong {
      display: block;
      margin-top: 1.4mm;
      font-size: 10pt;
      overflow-wrap: anywhere;
    }
    .qpd-cover-note {
      display: flex;
      justify-content: space-between;
      gap: 8mm;
      color: var(--muted);
      font-size: 7.5pt;
    }
    .qpd-page-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 6mm;
      margin-bottom: 7mm;
      padding-bottom: 3mm;
      border-bottom: 1px solid var(--line);
      color: var(--muted);
      font-size: 8pt;
    }
    .qpd-page-header strong { color: var(--navy); }
    .qpd-warning-box {
      margin: 0 0 6mm;
      border-left: 1.5mm solid var(--gold);
      border-radius: 0 3mm 3mm 0;
      padding: 4mm 5mm;
      background: var(--gold-soft);
      color: #72500d;
      break-inside: avoid;
    }
    .qpd-warning-box strong { display: block; margin-bottom: 1mm; }
    .qpd-warning-box ul { margin: 0; padding-left: 5mm; }
    .qpd-section {
      margin: 0 0 8mm;
      break-inside: avoid-page;
      page-break-inside: avoid;
    }
    .qpd-section__header {
      display: flex;
      align-items: end;
      justify-content: space-between;
      gap: 6mm;
      margin-bottom: 3mm;
    }
    .qpd-section__eyebrow {
      display: block;
      color: var(--teal);
      font-size: 7pt;
      font-weight: 900;
      letter-spacing: .11em;
      text-transform: uppercase;
    }
    .qpd-section h2 {
      margin: .8mm 0 0;
      color: var(--navy);
      font-size: 15pt;
      line-height: 1.1;
      letter-spacing: -.025em;
    }
    .qpd-section__header > small {
      color: var(--muted);
      font-size: 7.5pt;
    }
    .qpd-field-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 3mm;
    }
    .qpd-field {
      min-width: 0;
      border: 1px solid var(--line);
      border-radius: 3.5mm;
      padding: 4mm;
      background: var(--white);
      break-inside: avoid;
    }
    .qpd-field--projection {
      border-color: #ecd39d;
      background: var(--gold-soft);
    }
    .qpd-field--unavailable {
      border-style: dashed;
      background: var(--surface);
    }
    .qpd-field__topline {
      display: flex;
      align-items: start;
      justify-content: space-between;
      gap: 3mm;
      margin-bottom: 1.6mm;
    }
    .qpd-field__topline > span {
      color: var(--muted);
      font-size: 7.8pt;
      font-weight: 800;
    }
    .qpd-field__topline > small {
      border-radius: 999px;
      padding: .7mm 1.7mm;
      background: rgba(217,168,66,.18);
      color: #72500d;
      font-size: 6.5pt;
      font-weight: 900;
      letter-spacing: .05em;
      text-transform: uppercase;
    }
    .qpd-field__value {
      color: var(--ink);
      font-size: 10.5pt;
      font-weight: 750;
      overflow-wrap: anywhere;
    }
    .qpd-unavailable {
      color: var(--muted);
      font-weight: 600;
      font-style: italic;
    }
    .qpd-value-list { margin: 0; padding-left: 4.5mm; }
    .qpd-object { display: grid; gap: 1mm; margin: 0; }
    .qpd-object-row {
      display: grid;
      grid-template-columns: minmax(25mm, .42fr) minmax(0, 1fr);
      gap: 3mm;
    }
    .qpd-object dt { color: var(--muted); font-size: 7.5pt; }
    .qpd-object dd { margin: 0; }
    .qpd-source-list { display: grid; gap: 2mm; }
    .qpd-source-list article {
      display: grid;
      grid-template-columns: 34mm 43mm minmax(0, 1fr);
      gap: 3mm;
      align-items: start;
      border-bottom: 1px solid var(--line);
      padding: 2.5mm 0;
      font-size: 7.5pt;
    }
    .qpd-source-list strong { color: var(--ink); }
    .qpd-source-list span { color: var(--teal); font-weight: 750; }
    .qpd-source-list code {
      color: var(--muted);
      font: inherit;
      overflow-wrap: anywhere;
    }
    .qpd-disclaimers {
      margin-top: 6mm;
      border-radius: 3mm;
      padding: 4mm 5mm;
      background: var(--surface);
      color: var(--muted);
      font-size: 7.7pt;
    }
    .qpd-disclaimers ol { margin: 0; padding-left: 4.5mm; }
    .qpd-page-footer {
      display: flex;
      justify-content: space-between;
      gap: 8mm;
      margin-top: 7mm;
      padding-top: 3mm;
      border-top: 1px solid var(--line);
      color: var(--muted);
      font-size: 7.3pt;
    }
    @media screen {
      body { background: #dbe3ec; padding: 20px; }
      .qpd-document {
        max-width: ${width};
        margin: 0 auto;
        padding: 12mm;
        background: var(--white);
        box-shadow: 0 22px 70px rgba(7,23,45,.2);
      }
      .qpd-cover { min-height: ${format === "LETTER" ? "245mm" : "273mm"}; }
    }
    @media print {
      .qpd-document { width: 100%; }
    }
  `;
}

function buildQuotePrintableDocument({
  readModel,
  pageFormat = "A4",
  documentTitle = "Cotización",
} = {}) {
  if (!isRecord(readModel)) {
    throw new TypeError("readModel must be a plain object");
  }
  if (readModel.packetType !== QUOTE_PRINTABLE_READ_MODEL_TYPE) {
    throw new TypeError("Unsupported quote printable read model");
  }
  if (readModel.status !== "READY_FOR_DOCUMENT_COMPOSITION") {
    throw new TypeError(
      "Quote printable read model requires human review before composition",
    );
  }
  if (readModel.safety?.recalculationAllowed !== false) {
    throw new TypeError("Printable composition cannot authorize recalculation");
  }

  const format = normalizePageFormat(pageFormat);
  const locale = String(readModel.locale || "es-MX");
  const title = String(documentTitle || "Cotización").trim() || "Cotización";
  const fileName = buildFileName(readModel);
  const fields = allFields(readModel);
  const client = summaryValue(readModel.summary?.client, locale);
  const product = summaryValue(readModel.summary?.product, locale);
  const advisor = summaryValue(readModel.summary?.advisor, locale);
  const quoteId = summaryValue(readModel.summary?.quoteId, locale);
  const acceptedAt = summaryValue(readModel.summary?.acceptedAt, locale);
  const description = readModel.productProfile?.coverDescription ||
    "Resumen comercial de la cotización confirmada, sus valores y fuentes.";

  const metrics = [
    [firstAvailable(fields, ["sum_assured", "current_protection_mxn"]), "Protección"],
    [firstAvailable(fields, ["total_annual_premium", "annual_premium_with_ave", "annual_premium"]), "Aportación anual"],
    [firstAvailable(fields, ["payment_years", "coverage_period"]), "Plazo"],
    [firstAvailable(fields, ["total_recovery_mxn", "total_recovery", "total_contributed_mxn"]), "Valor proyectado"],
  ];

  const warnings = readModel.review?.warnings || [];
  const warningBox = warnings.length
    ? `<aside class="qpd-warning-box"><strong>Lectura importante</strong><ul>${warnings
        .map((warning) => `<li>${escapeHtml(warning)}</li>`)
        .join("")}</ul></aside>`
    : "";

  const detailSections = (readModel.sections || []).filter(
    (section) => section.id !== "identity",
  );

  const html = `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="robots" content="noindex,nofollow">
  <meta name="forge-document-type" content="${QUOTE_PRINTABLE_DOCUMENT_TYPE}">
  <meta name="forge-orientation" content="portrait">
  <meta name="forge-source-revision" content="${safeAttribute(readModel.sourceRevisionHash)}">
  <title>${escapeHtml(title)} · ${escapeHtml(client)}</title>
  <style>${cssFor(format)}</style>
</head>
<body>
  <main class="qpd-document" data-forge-document="quote-printable-premium"
    data-contract-version="${CONTRACT_VERSION}"
    data-page-format="${format}"
    data-page-orientation="portrait"
    data-source-revision="${safeAttribute(readModel.sourceRevisionHash)}">
    <section class="qpd-cover">
      <header class="qpd-cover-hero">
        <div class="qpd-brand"><span class="qpd-brand-mark"></span><span>Forge OS</span></div>
        <span class="qpd-cover-kicker">Propuesta técnico-comercial</span>
        <h1>${escapeHtml(title)}</h1>
        <p class="qpd-cover-product">${escapeHtml(product)}</p>
        <p class="qpd-cover-description">${escapeHtml(description)}</p>
      </header>

      <div class="qpd-metric-grid">
        ${metrics.map(([field, label]) => renderMetric(field, label, locale)).join("")}
      </div>

      <div class="qpd-identity-strip">
        <article><span>Cliente / asegurado</span><strong>${escapeHtml(client)}</strong></article>
        <article><span>Asesor</span><strong>${escapeHtml(advisor)}</strong></article>
        <article><span>Folio</span><strong>${escapeHtml(quoteId)}</strong></article>
        <article><span>Fecha</span><strong>${escapeHtml(acceptedAt)}</strong></article>
      </div>

      <footer class="qpd-cover-note">
        <span>A4 vertical · revisión humana</span>
        <span>Revisión ${escapeHtml(readModel.sourceRevisionHash)}</span>
      </footer>
    </section>

    <header class="qpd-page-header">
      <strong>${escapeHtml(title)}</strong>
      <span>${escapeHtml(client)} · ${escapeHtml(product)}</span>
    </header>

    ${warningBox}
    ${detailSections.map((section) => renderSection(section, locale)).join("")}
    ${renderSources(readModel)}

    <section class="qpd-disclaimers">
      <ol>${(readModel.disclaimers || []).map((item) =>
        `<li>${escapeHtml(item)}</li>`).join("")}</ol>
    </section>

    <footer class="qpd-page-footer">
      <span>Documento generado para revisión humana</span>
      <span>${escapeHtml(fileName)}</span>
    </footer>
  </main>
</body>
</html>`;

  if (/<script\b/i.test(html) || /https?:\/\//i.test(html)) {
    throw new Error("Printable document must remain self-contained and script-free");
  }

  return deepFreeze({
    packetType: QUOTE_PRINTABLE_DOCUMENT_TYPE,
    contractVersion: CONTRACT_VERSION,
    status: "PRINTABLE_HTML_READY",
    pageFormat: format,
    pageOrientation: "PORTRAIT",
    fileName,
    mediaType: "text/html",
    sourceDocumentId: readModel.documentId,
    sourceRevisionHash: readModel.sourceRevisionHash,
    html,
    safety: {
      selfContained: true,
      scriptsAllowed: false,
      networkAllowed: false,
      recalculationAllowed: false,
      printExecuted: false,
      pdfGenerated: false,
      persistenceWritten: false,
      automaticSendAllowed: false,
      humanReviewRequired: true,
    },
  });
}

export {
  CONTRACT_VERSION,
  QUOTE_PRINTABLE_DOCUMENT_TYPE,
  buildQuotePrintableDocument,
};
