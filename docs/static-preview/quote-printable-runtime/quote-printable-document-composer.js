import {
  QUOTE_PRINTABLE_READ_MODEL_TYPE,
} from "./quote-printable-read-model.js";

const QUOTE_PRINTABLE_DOCUMENT_TYPE =
  "FORGE_QUOTE_PRINTABLE_DOCUMENT_HTML";
const CONTRACT_VERSION = "QPD02_DOCUMENT_COMPOSER_V1";
const SUPPORTED_PAGE_FORMATS = new Set(["A4", "LETTER"]);

function isRecord(value) {
  return Boolean(value) &&
    typeof value === "object" &&
    !Array.isArray(value);
}

function deepFreeze(value, seen = new WeakSet()) {
  if (!value || typeof value !== "object" || seen.has(value)) {
    return value;
  }

  seen.add(value);
  for (const item of Object.values(value)) {
    deepFreeze(item, seen);
  }
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
  if (!SUPPORTED_PAGE_FORMATS.has(format)) {
    throw new TypeError(`Unsupported page format: ${format}`);
  }
  return format;
}

function humanizeKey(value) {
  return String(value || "")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .trim()
    .replace(/^./, (character) => character.toUpperCase());
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
    const unit = String(field.unit || "").trim();
    if (/^[A-Z]{3}$/.test(unit)) {
      try {
        return new Intl.NumberFormat(locale, {
          style: "currency",
          currency: unit,
          maximumFractionDigits: 2,
        }).format(value);
      } catch {
        return `${numberFormatter(locale).format(value)} ${unit}`.trim();
      }
    }
    return `${numberFormatter(locale).format(value)} ${unit}`.trim();
  }

  if (typeof value === "boolean") {
    return value ? "Sí" : "No";
  }

  return String(value ?? "").trim();
}

function renderObject(value, field, locale) {
  const rows = Object.entries(value)
    .filter(([, item]) => item !== null && typeof item !== "undefined")
    .map(
      ([key, item]) => `
        <div class="qpd-object-row">
          <dt>${escapeHtml(humanizeKey(key))}</dt>
          <dd>${renderValue(item, field, locale)}</dd>
        </div>
      `,
    )
    .join("");

  return rows
    ? `<dl class="qpd-object">${rows}</dl>`
    : '<span class="qpd-unavailable">Sin dato confirmado</span>';
}

function renderArray(value, field, locale) {
  if (!value.length) {
    return '<span class="qpd-unavailable">Sin dato confirmado</span>';
  }

  if (value.every((item) => !isRecord(item) && !Array.isArray(item))) {
    return `
      <ul class="qpd-list">
        ${value
          .map(
            (item) =>
              `<li>${escapeHtml(formatPrimitive(item, field, locale))}</li>`,
          )
          .join("")}
      </ul>
    `;
  }

  return `
    <ol class="qpd-record-list">
      ${value
        .map(
          (item, index) => `
            <li>
              <span class="qpd-record-index">${index + 1}</span>
              ${renderValue(item, field, locale)}
            </li>
          `,
        )
        .join("")}
    </ol>
  `;
}

function renderValue(value, field, locale) {
  if (value === null || typeof value === "undefined" || value === "") {
    return '<span class="qpd-unavailable">Sin dato confirmado</span>';
  }

  if (Array.isArray(value)) {
    return renderArray(value, field, locale);
  }

  if (isRecord(value)) {
    return renderObject(value, field, locale);
  }

  return escapeHtml(formatPrimitive(value, field, locale));
}

function renderField(field, locale) {
  const projection = field.classification === "PROJECTION";
  const unavailable = field.status !== "CONFIRMED";
  const classes = [
    "qpd-field",
    projection ? "qpd-field--projection" : "",
    unavailable ? "qpd-field--unavailable" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return `
    <article
      class="${classes}"
      data-field-id="${safeAttribute(field.id)}"
      data-source-path="${safeAttribute(field.sourcePath || "unavailable")}"
    >
      <header class="qpd-field-header">
        <span class="qpd-field-label">${escapeHtml(field.label)}</span>
        ${
          projection
            ? '<span class="qpd-badge qpd-badge--projection">Proyección</span>'
            : ""
        }
      </header>
      <div class="qpd-field-value">
        ${
          unavailable
            ? '<span class="qpd-unavailable">Sin dato confirmado</span>'
            : renderValue(field.value, field, locale)
        }
      </div>
    </article>
  `;
}

function renderSection(section, locale) {
  return `
    <section class="qpd-section" data-section-id="${safeAttribute(section.id)}">
      <header class="qpd-section-header">
        <span>${escapeHtml(section.title)}</span>
        <small>${section.availableFieldCount} datos confirmados</small>
      </header>
      <div class="qpd-field-grid">
        ${section.fields.map((field) => renderField(field, locale)).join("")}
      </div>
    </section>
  `;
}

function sourceRows(readModel) {
  const rows = [];
  const seen = new Set();

  for (const section of readModel.sections) {
    for (const field of section.fields) {
      if (field.status !== "CONFIRMED" || !field.sourcePath) continue;
      const key = `${field.id}|${field.sourcePath}`;
      if (seen.has(key)) continue;
      seen.add(key);
      rows.push({
        id: field.id,
        label: field.label,
        sourcePath: field.sourcePath,
        authority: field.authority,
      });
    }
  }

  return rows;
}

function renderSources(readModel) {
  const rows = sourceRows(readModel);
  return `
    <section class="qpd-section qpd-section--sources">
      <header class="qpd-section-header">
        <span>Fuentes del documento</span>
        <small>${rows.length} referencias</small>
      </header>
      <table class="qpd-source-table">
        <thead>
          <tr>
            <th>Dato</th>
            <th>Autoridad</th>
            <th>Ruta de origen</th>
          </tr>
        </thead>
        <tbody>
          ${rows
            .map(
              (row) => `
                <tr>
                  <td>${escapeHtml(row.label)}</td>
                  <td>${escapeHtml(row.authority || "No disponible")}</td>
                  <td><code>${escapeHtml(row.sourcePath)}</code></td>
                </tr>
              `,
            )
            .join("")}
        </tbody>
      </table>
    </section>
  `;
}

function summaryValue(field, locale) {
  if (!field || field.status !== "CONFIRMED") {
    return "Sin dato confirmado";
  }
  if (isRecord(field.value) || Array.isArray(field.value)) {
    return "Ver detalle";
  }
  return formatPrimitive(field.value, field, locale);
}

function buildFileName(readModel) {
  const quote = readModel.summary.quoteId?.value;
  const client = readModel.summary.client?.value;
  const product = readModel.summary.product?.value;
  return [
    "cotizacion",
    slug(client, "cliente"),
    slug(product, "producto"),
    slug(quote, readModel.sourceRevisionHash),
  ].join("-") + ".pdf";
}

function cssFor(format) {
  const pageSize = format === "LETTER" ? "Letter" : "A4";
  return `
    @page {
      size: ${pageSize};
      margin: 14mm 13mm 16mm;
    }

    :root {
      color-scheme: light;
      --qpd-ink: #172033;
      --qpd-muted: #657086;
      --qpd-line: #d8dee8;
      --qpd-soft: #f4f7fb;
      --qpd-brand: #064e5f;
      --qpd-accent: #0f766e;
      --qpd-warning: #92400e;
      --qpd-warning-bg: #fff7ed;
    }

    * { box-sizing: border-box; }

    html,
    body {
      margin: 0;
      padding: 0;
      background: #ffffff;
      color: var(--qpd-ink);
      font-family: Inter, ui-sans-serif, system-ui, -apple-system,
        BlinkMacSystemFont, "Segoe UI", sans-serif;
      font-size: 10.5pt;
      line-height: 1.42;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    body { min-height: 100%; }

    .qpd-document {
      width: 100%;
      max-width: 100%;
    }

    .qpd-cover {
      min-height: 232mm;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      page-break-after: always;
      break-after: page;
      background:
        radial-gradient(circle at 88% 8%, rgba(15, 118, 110, 0.18), transparent 34%),
        linear-gradient(145deg, #f8fafc, #eef6f6 64%, #ffffff);
      border: 1px solid var(--qpd-line);
      border-radius: 7mm;
      padding: 18mm;
    }

    .qpd-brand {
      display: flex;
      align-items: center;
      gap: 3mm;
      color: var(--qpd-brand);
      font-weight: 900;
      letter-spacing: 0.12em;
      text-transform: uppercase;
    }

    .qpd-brand-mark {
      width: 8mm;
      height: 8mm;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--qpd-accent), #22c55e);
    }

    .qpd-cover-copy small {
      color: var(--qpd-accent);
      font-weight: 900;
      letter-spacing: 0.14em;
      text-transform: uppercase;
    }

    .qpd-cover-copy h1 {
      max-width: 150mm;
      margin: 4mm 0 5mm;
      color: var(--qpd-brand);
      font-size: 31pt;
      line-height: 1.02;
      letter-spacing: -0.045em;
    }

    .qpd-cover-copy p {
      max-width: 145mm;
      margin: 0;
      color: var(--qpd-muted);
      font-size: 13pt;
    }

    .qpd-cover-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 4mm;
      margin-top: 10mm;
    }

    .qpd-cover-item {
      min-width: 0;
      border: 1px solid rgba(6, 78, 95, 0.15);
      border-radius: 4mm;
      background: rgba(255, 255, 255, 0.78);
      padding: 5mm;
    }

    .qpd-cover-item span {
      display: block;
      margin-bottom: 1.5mm;
      color: var(--qpd-muted);
      font-size: 8.5pt;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }

    .qpd-cover-item strong {
      display: block;
      color: var(--qpd-ink);
      font-size: 12pt;
      overflow-wrap: anywhere;
    }

    .qpd-cover-footer {
      display: flex;
      justify-content: space-between;
      gap: 8mm;
      color: var(--qpd-muted);
      font-size: 8.5pt;
    }

    .qpd-page-header,
    .qpd-page-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 8mm;
      color: var(--qpd-muted);
      font-size: 8.5pt;
    }

    .qpd-page-header {
      border-bottom: 1px solid var(--qpd-line);
      padding-bottom: 3mm;
      margin-bottom: 5mm;
    }

    .qpd-page-footer {
      border-top: 1px solid var(--qpd-line);
      padding-top: 3mm;
      margin-top: 6mm;
    }

    .qpd-section {
      margin: 0 0 7mm;
      break-inside: avoid-page;
      page-break-inside: avoid;
    }

    .qpd-section-header {
      display: flex;
      justify-content: space-between;
      gap: 8mm;
      align-items: end;
      border-bottom: 2px solid var(--qpd-brand);
      padding: 0 0 2.5mm;
      margin-bottom: 3mm;
    }

    .qpd-section-header span {
      color: var(--qpd-brand);
      font-size: 14pt;
      font-weight: 900;
    }

    .qpd-section-header small {
      color: var(--qpd-muted);
      font-size: 8pt;
    }

    .qpd-field-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 3mm;
    }

    .qpd-field {
      min-width: 0;
      border: 1px solid var(--qpd-line);
      border-radius: 3mm;
      padding: 3.5mm;
      background: #ffffff;
      break-inside: avoid;
    }

    .qpd-field--projection {
      border-color: #fed7aa;
      background: var(--qpd-warning-bg);
    }

    .qpd-field--unavailable {
      border-style: dashed;
      background: var(--qpd-soft);
    }

    .qpd-field-header {
      display: flex;
      justify-content: space-between;
      gap: 3mm;
      align-items: start;
      margin-bottom: 2mm;
    }

    .qpd-field-label {
      color: var(--qpd-muted);
      font-size: 8.5pt;
      font-weight: 800;
    }

    .qpd-field-value {
      color: var(--qpd-ink);
      font-size: 11pt;
      font-weight: 750;
      overflow-wrap: anywhere;
    }

    .qpd-badge {
      display: inline-flex;
      border-radius: 999px;
      padding: 1mm 2mm;
      font-size: 7pt;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }

    .qpd-badge--projection {
      color: var(--qpd-warning);
      background: #ffedd5;
    }

    .qpd-unavailable {
      color: var(--qpd-muted);
      font-weight: 650;
      font-style: italic;
    }

    .qpd-list,
    .qpd-record-list {
      margin: 0;
      padding-left: 5mm;
    }

    .qpd-record-list > li {
      margin-bottom: 2mm;
    }

    .qpd-record-index {
      display: inline-grid;
      place-items: center;
      width: 5mm;
      height: 5mm;
      margin-right: 1.5mm;
      border-radius: 50%;
      background: var(--qpd-soft);
      color: var(--qpd-brand);
      font-size: 7pt;
      font-weight: 900;
    }

    .qpd-object {
      display: grid;
      gap: 1.5mm;
      margin: 0;
    }

    .qpd-object-row {
      display: grid;
      grid-template-columns: minmax(30mm, 0.45fr) minmax(0, 1fr);
      gap: 3mm;
    }

    .qpd-object dt {
      color: var(--qpd-muted);
      font-size: 8pt;
    }

    .qpd-object dd { margin: 0; }

    .qpd-warning-box {
      margin: 0 0 6mm;
      border: 1px solid #fdba74;
      border-radius: 3mm;
      background: var(--qpd-warning-bg);
      color: var(--qpd-warning);
      padding: 4mm;
      break-inside: avoid;
    }

    .qpd-warning-box strong {
      display: block;
      margin-bottom: 1.5mm;
    }

    .qpd-warning-box ul {
      margin: 0;
      padding-left: 5mm;
    }

    .qpd-source-table {
      width: 100%;
      border-collapse: collapse;
      table-layout: fixed;
      font-size: 8pt;
    }

    .qpd-source-table th,
    .qpd-source-table td {
      border: 1px solid var(--qpd-line);
      padding: 2.5mm;
      text-align: left;
      vertical-align: top;
      overflow-wrap: anywhere;
    }

    .qpd-source-table th {
      background: var(--qpd-soft);
      color: var(--qpd-brand);
    }

    .qpd-source-table code {
      font-size: 7.5pt;
      white-space: normal;
    }

    .qpd-disclaimers {
      margin: 8mm 0 0;
      border-top: 1px solid var(--qpd-line);
      padding-top: 4mm;
      color: var(--qpd-muted);
      font-size: 8.5pt;
    }

    .qpd-disclaimers ol {
      margin: 0;
      padding-left: 5mm;
    }

    @media screen {
      body {
        background: #e8edf3;
        padding: 18px;
      }

      .qpd-document {
        max-width: ${format === "LETTER" ? "216mm" : "210mm"};
        margin: 0 auto;
        background: #ffffff;
        box-shadow: 0 24px 80px rgba(15, 23, 42, 0.18);
        padding: 13mm;
      }

      .qpd-cover {
        min-height: ${format === "LETTER" ? "245mm" : "270mm"};
      }
    }

    @media print {
      .qpd-document { width: 100%; }
      .qpd-cover { border: none; }
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
  const client = summaryValue(readModel.summary.client, locale);
  const product = summaryValue(readModel.summary.product, locale);
  const advisor = summaryValue(readModel.summary.advisor, locale);
  const quoteId = summaryValue(readModel.summary.quoteId, locale);
  const acceptedAt = summaryValue(readModel.summary.acceptedAt, locale);

  const warnings = readModel.review?.warnings || [];
  const warningBox = warnings.length
    ? `
      <aside class="qpd-warning-box">
        <strong>Información que requiere atención</strong>
        <ul>${warnings
          .map((warning) => `<li>${escapeHtml(warning)}</li>`)
          .join("")}</ul>
      </aside>
    `
    : "";

  const html = `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="robots" content="noindex,nofollow">
  <meta name="forge-document-type" content="${QUOTE_PRINTABLE_DOCUMENT_TYPE}">
  <meta name="forge-source-revision" content="${safeAttribute(readModel.sourceRevisionHash)}">
  <title>${escapeHtml(title)} · ${escapeHtml(client)}</title>
  <style>${cssFor(format)}</style>
</head>
<body>
  <main
    class="qpd-document"
    data-forge-document="quote-printable"
    data-contract-version="${CONTRACT_VERSION}"
    data-page-format="${format}"
    data-source-revision="${safeAttribute(readModel.sourceRevisionHash)}"
  >
    <section class="qpd-cover">
      <div class="qpd-brand">
        <span class="qpd-brand-mark" aria-hidden="true"></span>
        <span>Forge OS</span>
      </div>

      <div class="qpd-cover-copy">
        <small>Documento técnico-comercial</small>
        <h1>${escapeHtml(title)}</h1>
        <p>
          Resumen imprimible de la cotización aceptada, sus cifras confirmadas,
          proyecciones identificadas y fuentes documentales.
        </p>

        <div class="qpd-cover-grid">
          <article class="qpd-cover-item">
            <span>Cliente</span>
            <strong>${escapeHtml(client)}</strong>
          </article>
          <article class="qpd-cover-item">
            <span>Producto</span>
            <strong>${escapeHtml(product)}</strong>
          </article>
          <article class="qpd-cover-item">
            <span>Asesor</span>
            <strong>${escapeHtml(advisor)}</strong>
          </article>
          <article class="qpd-cover-item">
            <span>Folio</span>
            <strong>${escapeHtml(quoteId)}</strong>
          </article>
        </div>
      </div>

      <footer class="qpd-cover-footer">
        <span>Aceptada: ${escapeHtml(acceptedAt)}</span>
        <span>Formato: ${format}</span>
        <span>Revisión: ${escapeHtml(readModel.sourceRevisionHash)}</span>
      </footer>
    </section>

    <header class="qpd-page-header">
      <strong>${escapeHtml(title)}</strong>
      <span>${escapeHtml(client)} · ${escapeHtml(product)}</span>
    </header>

    ${warningBox}

    ${readModel.sections
      .map((section) => renderSection(section, locale))
      .join("")}

    ${renderSources(readModel)}

    <section class="qpd-disclaimers">
      <ol>
        ${readModel.disclaimers
          .map((disclaimer) => `<li>${escapeHtml(disclaimer)}</li>`)
          .join("")}
      </ol>
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
