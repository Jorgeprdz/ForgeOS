import {
  QUOTE_PRINTABLE_DOCUMENT_TYPE,
  buildQuotePrintableDocument as buildGenericQuotePrintableDocument,
} from "./quote-printable-document-composer-m05e005.js";

const CONTRACT_VERSION = "M05E007_ORVI_COMMERCIAL_DOCUMENT_V1";

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

function slug(value, fallback = "cotizacion") {
  const normalized = String(value ?? "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
  return normalized || fallback;
}

function confirmedSummary(readModel, key) {
  const field = readModel.summary?.[key];
  if (!field || field.status !== "CONFIRMED") return null;
  const value = String(field.value ?? "").trim();
  return value && value !== "Sin dato confirmado" ? value : null;
}

function formatNumber(value, locale = "es-MX") {
  const number = Number(value);
  return Number.isFinite(number)
    ? new Intl.NumberFormat(locale, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(number)
    : "—";
}

function formatPercent(value, locale = "es-MX") {
  const number = Number(value);
  if (!Number.isFinite(number)) return null;
  const percent = Math.abs(number) <= 1 ? number * 100 : number;
  return `${new Intl.NumberFormat(locale, {
    maximumFractionDigits: 2,
  }).format(percent)}% anual`;
}

function valuePair(label, udi, mxn, {
  udiCaption = "UDI",
  mxnCaption = "MXN hoy",
} = {}) {
  return `
    <section class="orvi-value-block">
      <header><span>${escapeHtml(label)}</span></header>
      <div class="orvi-value-pair">
        <article>
          <small>${escapeHtml(udiCaption)}</small>
          <strong>${formatNumber(udi)}</strong>
        </article>
        <article>
          <small>${escapeHtml(mxnCaption)}</small>
          <strong>$${formatNumber(mxn)}</strong>
        </article>
      </div>
    </section>`;
}

function checkpointRows(summary) {
  const rows = summary.checkpoints || [];
  if (!rows.length) {
    return '<div class="orvi-empty">No hay valores de recuperación confirmados para mostrar.</div>';
  }
  return `
    <div class="orvi-checkpoints">
      <div class="orvi-checkpoint orvi-checkpoint--head">
        <span>Año</span>
        <span>Recuperación UDI</span>
        <span>Recuperación MXN</span>
        <span>Suma asegurada UDI</span>
        <span>Suma asegurada MXN</span>
      </div>
      ${rows.map((row) => `
        <div class="orvi-checkpoint">
          <strong>${escapeHtml(row.policyYear)}</strong>
          <span>${formatNumber(row.recoveryUdi)}</span>
          <span>$${formatNumber(row.recoveryMxn)}</span>
          <span>${formatNumber(row.sumAssuredUdi)}</span>
          <span>$${formatNumber(row.sumAssuredMxn)}</span>
        </div>`).join("")}
    </div>`;
}

function css(pageFormat) {
  const pageSize = pageFormat === "LETTER" ? "Letter" : "A4";
  return `
    @page { size: ${pageSize} portrait; margin: 12mm; }
    :root {
      color-scheme: light;
      --navy: #07172d;
      --navy-2: #0d2543;
      --teal: #18b8b1;
      --gold: #d9a842;
      --ink: #142033;
      --muted: #67758a;
      --line: #dfe6ef;
      --surface: #f4f7fb;
      --white: #fff;
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
    .orvi-document { width: 100%; }
    .orvi-page {
      min-height: 257mm;
      display: flex;
      flex-direction: column;
      gap: 7mm;
      break-after: page;
      page-break-after: always;
    }
    .orvi-page:last-child {
      break-after: auto;
      page-break-after: auto;
    }
    .orvi-hero {
      position: relative;
      overflow: hidden;
      border-radius: 7mm;
      padding: 11mm;
      background:
        radial-gradient(circle at 92% 10%, rgba(24,184,177,.24), transparent 28%),
        linear-gradient(145deg, var(--navy), var(--navy-2));
      color: var(--white);
    }
    .orvi-brand {
      display: flex;
      align-items: center;
      gap: 2.5mm;
      font-size: 8pt;
      font-weight: 900;
      letter-spacing: .13em;
      text-transform: uppercase;
    }
    .orvi-brand::before {
      content: "";
      width: 6mm;
      height: 6mm;
      border-radius: 1.8mm;
      background: linear-gradient(135deg, var(--teal), var(--gold));
    }
    .orvi-kicker {
      display: block;
      margin-top: 9mm;
      color: #8fe6e2;
      font-size: 7.5pt;
      font-weight: 900;
      letter-spacing: .12em;
      text-transform: uppercase;
    }
    .orvi-hero h1 {
      margin: 1.5mm 0 1mm;
      font-size: 28pt;
      line-height: 1;
      letter-spacing: -.045em;
    }
    .orvi-product {
      margin: 0;
      color: #f6cf79;
      font-size: 13pt;
      font-weight: 850;
    }
    .orvi-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 2mm 6mm;
      margin-top: 5mm;
      color: rgba(255,255,255,.72);
      font-size: 8.5pt;
    }
    .orvi-section-title span {
      display: block;
      color: var(--teal);
      font-size: 7pt;
      font-weight: 900;
      letter-spacing: .11em;
      text-transform: uppercase;
    }
    .orvi-section-title h2 {
      margin: .8mm 0 0;
      color: var(--navy);
      font-size: 20pt;
      line-height: 1.05;
      letter-spacing: -.035em;
    }
    .orvi-section-title p {
      margin: 2mm 0 0;
      color: var(--muted);
      max-width: 160mm;
    }
    .orvi-value-block {
      border: 1px solid var(--line);
      border-radius: 5mm;
      padding: 5mm;
      background: var(--white);
      box-shadow: 0 2mm 7mm rgba(7,23,45,.055);
      break-inside: avoid;
    }
    .orvi-value-block > header > span {
      color: var(--navy);
      font-size: 12pt;
      font-weight: 900;
    }
    .orvi-value-pair {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 4mm;
      margin-top: 4mm;
    }
    .orvi-value-pair article {
      border-radius: 4mm;
      padding: 5mm;
      background: var(--surface);
    }
    .orvi-value-pair article:first-child {
      border-left: 1.4mm solid var(--teal);
    }
    .orvi-value-pair article:last-child {
      border-left: 1.4mm solid var(--gold);
    }
    .orvi-value-pair small {
      display: block;
      color: var(--muted);
      font-size: 7.5pt;
      font-weight: 850;
      letter-spacing: .06em;
      text-transform: uppercase;
    }
    .orvi-value-pair strong {
      display: block;
      margin-top: 2mm;
      color: var(--navy);
      font-size: 22pt;
      line-height: 1;
      letter-spacing: -.035em;
    }
    .orvi-plan-note {
      display: flex;
      justify-content: space-between;
      gap: 6mm;
      border-radius: 4mm;
      padding: 4mm 5mm;
      background: #e8f7f5;
      color: #0a5f5b;
      font-weight: 750;
    }
    .orvi-checkpoints {
      overflow: hidden;
      border: 1px solid var(--line);
      border-radius: 5mm;
      background: var(--white);
    }
    .orvi-checkpoint {
      display: grid;
      grid-template-columns: 15mm repeat(4, minmax(0, 1fr));
      gap: 2mm;
      align-items: center;
      min-height: 19mm;
      padding: 3.5mm 4mm;
      border-top: 1px solid var(--line);
    }
    .orvi-checkpoint:first-child { border-top: 0; }
    .orvi-checkpoint--head {
      min-height: 16mm;
      background: var(--navy);
      color: var(--white);
      font-size: 7.3pt;
      font-weight: 850;
      line-height: 1.2;
    }
    .orvi-checkpoint:not(.orvi-checkpoint--head) strong {
      display: grid;
      place-items: center;
      width: 11mm;
      height: 11mm;
      border-radius: 50%;
      background: #e8f7f5;
      color: #0a6c67;
      font-size: 11pt;
    }
    .orvi-checkpoint:not(.orvi-checkpoint--head) span {
      color: var(--ink);
      font-size: 9.5pt;
      font-weight: 750;
    }
    .orvi-evidence {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 3mm;
      margin-top: auto;
    }
    .orvi-evidence article {
      border-radius: 3.5mm;
      padding: 3.5mm 4mm;
      background: var(--surface);
    }
    .orvi-evidence small {
      display: block;
      color: var(--muted);
      font-size: 7pt;
      font-weight: 800;
      text-transform: uppercase;
    }
    .orvi-evidence strong {
      display: block;
      margin-top: 1mm;
      color: var(--navy);
      font-size: 9pt;
    }
    .orvi-notes {
      border-left: 1.4mm solid var(--gold);
      border-radius: 0 4mm 4mm 0;
      padding: 4mm 5mm;
      background: #fff7e6;
      color: #6d4b0d;
    }
    .orvi-notes strong { display: block; margin-bottom: 1.5mm; }
    .orvi-notes ul { margin: 0; padding-left: 5mm; }
    .orvi-footer {
      display: flex;
      justify-content: space-between;
      gap: 6mm;
      margin-top: auto;
      padding-top: 3mm;
      border-top: 1px solid var(--line);
      color: var(--muted);
      font-size: 7.2pt;
    }
    .orvi-empty {
      border: 1px dashed var(--line);
      border-radius: 4mm;
      padding: 8mm;
      color: var(--muted);
      text-align: center;
    }
    @media screen {
      body { background: #dbe3ec; padding: 20px; }
      .orvi-document {
        max-width: 210mm;
        margin: 0 auto;
        padding: 12mm;
        background: var(--white);
        box-shadow: 0 22px 70px rgba(7,23,45,.2);
      }
    }
  `;
}

function buildOrviDocument({
  readModel,
  pageFormat = "A4",
  documentTitle = "Cotización ORVI",
}) {
  const summary = readModel.commercialSummary;
  const locale = String(readModel.locale || "es-MX");
  const client = confirmedSummary(readModel, "client");
  const advisor = confirmedSummary(readModel, "advisor");
  const quoteId = confirmedSummary(readModel, "quoteId");
  const acceptedAt = confirmedSummary(readModel, "acceptedAt");
  const product = summary.product || confirmedSummary(readModel, "product") || "ORVI";
  const fileName = [
    "cotizacion",
    slug(client, "cliente"),
    slug(product, "orvi"),
    slug(quoteId, readModel.sourceRevisionHash),
  ].join("-") + ".pdf";
  const growth = formatPercent(summary.evidence?.annualGrowthRate, locale);
  const meta = [
    client ? `Cliente: ${client}` : null,
    advisor ? `Asesor: ${advisor}` : null,
    acceptedAt ? `Fecha: ${acceptedAt}` : null,
    quoteId ? `Folio: ${quoteId}` : null,
  ].filter(Boolean);

  const evidence = [
    ["UDI utilizada", summary.evidence?.udiValue === null ? "—" : `$${formatNumber(summary.evidence?.udiValue, locale)} MXN`],
    ["Fecha", summary.evidence?.udiDate || "No disponible"],
    ["Fuente", [summary.evidence?.udiSource, summary.evidence?.seriesId].filter(Boolean).join(" · ") || "No disponible"],
  ];

  const html = `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="robots" content="noindex,nofollow">
  <meta name="forge-document-type" content="${QUOTE_PRINTABLE_DOCUMENT_TYPE}">
  <meta name="forge-orientation" content="portrait">
  <title>${escapeHtml(documentTitle)} · ${escapeHtml(client || product)}</title>
  <style>${css(pageFormat)}</style>
</head>
<body>
  <main class="orvi-document"
    data-forge-document="orvi-commercial-summary"
    data-contract-version="${CONTRACT_VERSION}"
    data-page-format="${escapeHtml(pageFormat)}"
    data-page-orientation="portrait"
    data-layout="orvi-commercial-three-blocks">
    <section class="orvi-page">
      <header class="orvi-hero">
        <div class="orvi-brand">Forge OS</div>
        <span class="orvi-kicker">Propuesta comercial</span>
        <h1>${escapeHtml(documentTitle)}</h1>
        <p class="orvi-product">${escapeHtml(product)}</p>
        ${meta.length ? `<div class="orvi-meta">${meta.map((item) => `<span>${escapeHtml(item)}</span>`).join("")}</div>` : ""}
      </header>

      <div class="orvi-section-title">
        <span>Lo esencial</span>
        <h2>Protección y aportación</h2>
        <p>Las dos cifras principales del plan, expresadas en UDI y en su equivalencia actual en pesos.</p>
      </div>

      ${valuePair("Suma asegurada", summary.sumAssured?.udi, summary.sumAssured?.mxn)}
      ${valuePair("Aportación anual", summary.annualContribution?.udi, summary.annualContribution?.mxn)}

      <div class="orvi-plan-note">
        <span>Plazo de aportación</span>
        <strong>${escapeHtml(summary.paymentYears || "—")} años</strong>
      </div>

      <div class="orvi-evidence">
        ${evidence.map(([label, value]) => `<article><small>${escapeHtml(label)}</small><strong>${escapeHtml(value)}</strong></article>`).join("")}
      </div>

      <footer class="orvi-footer">
        <span>Valores actuales con UDI verificada</span>
        <span>Revisión ${escapeHtml(readModel.sourceRevisionHash)}</span>
      </footer>
    </section>

    <section class="orvi-page">
      <div class="orvi-section-title">
        <span>Proyección del plan</span>
        <h2>Recuperación y suma asegurada</h2>
        <p>En cada checkpoint se muestran juntas la recuperación y la protección: primero en UDI y después en MXN proyectados.</p>
      </div>

      ${checkpointRows(summary)}

      <aside class="orvi-notes">
        <strong>Cómo leer estos valores</strong>
        <ul>
          <li>Las cifras en UDI son las referencias del plan.</li>
          <li>Las equivalencias futuras en MXN son proyecciones${growth ? ` con supuesto de ${escapeHtml(growth)}` : ""}; no están garantizadas.</li>
          <li>La póliza y la documentación oficial prevalecen sobre este resumen.</li>
        </ul>
      </aside>

      <footer class="orvi-footer">
        <span>Documento para revisión humana</span>
        <span>A4 vertical · ${escapeHtml(product)}</span>
      </footer>
    </section>
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
    pageFormat,
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

function buildQuotePrintableDocument(options = {}) {
  const readModel = options.readModel;
  if (
    readModel?.productProfile?.id === "ORVI" &&
    readModel?.commercialSummary?.layoutId ===
      "ORVI_COMMERCIAL_THREE_BLOCKS_V1"
  ) {
    return buildOrviDocument(options);
  }
  return buildGenericQuotePrintableDocument(options);
}

export {
  CONTRACT_VERSION,
  QUOTE_PRINTABLE_DOCUMENT_TYPE,
  buildQuotePrintableDocument,
};
