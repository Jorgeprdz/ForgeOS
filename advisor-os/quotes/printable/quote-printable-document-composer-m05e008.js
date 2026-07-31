import {
  QUOTE_PRINTABLE_DOCUMENT_TYPE,
  buildQuotePrintableDocument as buildM05e007Document,
} from "./quote-printable-document-composer-m05e007.js";
import { VIDA_MUJER_LAYOUT_ID } from "./quote-printable-product-profile-m05e008.js";

const CONTRACT_VERSION = "M05E008_VIDA_MUJER_COMMERCIAL_DOCUMENT_V1";

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

function formatPercentage(value, locale = "es-MX") {
  const number = Number(value);
  if (!Number.isFinite(number)) return "—";
  const percent = Math.abs(number) <= 1 ? number * 100 : number;
  return `${new Intl.NumberFormat(locale, {
    maximumFractionDigits: 2,
  }).format(percent)}%`;
}

function valuePair(label, udi, mxn, note = null) {
  return `
    <section class="vm-value-block">
      <header>
        <span>${escapeHtml(label)}</span>
        ${note ? `<small>${escapeHtml(note)}</small>` : ""}
      </header>
      <div class="vm-value-pair">
        <article>
          <small>UDI</small>
          <strong>${formatNumber(udi)}</strong>
        </article>
        <article>
          <small>MXN hoy</small>
          <strong>$${formatNumber(mxn)}</strong>
        </article>
      </div>
    </section>`;
}

function protectionCards(summary) {
  const protections = summary.protections || [];
  if (!protections.length) return "";
  return `
    <section class="vm-protection-section">
      <div class="vm-section-title vm-section-title--compact">
        <span>Coberturas contratadas</span>
        <h2>Protección en vida</h2>
      </div>
      <div class="vm-protection-grid">
        ${protections.map((item) => `
          <article class="vm-protection-card">
            <small>${escapeHtml(item.status || "Contratada")}</small>
            <strong>${escapeHtml(item.label)}</strong>
            ${item.udi !== null && item.udi !== undefined
              ? `<span>${formatNumber(item.udi)} UDI · $${formatNumber(item.mxn)} MXN hoy</span>`
              : ""}
          </article>`).join("")}
      </div>
    </section>`;
}

function endowmentRows(summary) {
  const rows = summary.endowments || [];
  if (!rows.length) {
    return '<div class="vm-empty">No hay dotales confirmados para mostrar.</div>';
  }
  return `
    <div class="vm-endowments">
      <div class="vm-endowment vm-endowment--head">
        <span>Año</span>
        <span>% suma asegurada</span>
        <span>Beneficio UDI</span>
        <span>MXN proyectado</span>
      </div>
      ${rows.map((row) => `
        <div class="vm-endowment">
          <strong>${escapeHtml(row.policyYear)}</strong>
          <span>${formatPercentage(row.percentage)}</span>
          <span>${formatNumber(row.benefitUdi)}</span>
          <span>${row.benefitMxn === null || row.benefitMxn === undefined
            ? "Pendiente de UDI proyectada"
            : `$${formatNumber(row.benefitMxn)}`}</span>
        </div>`).join("")}
    </div>`;
}

function pcfRows(summary) {
  const rows = summary.pcfDiseases || [];
  if (!rows.length) return "";
  return `
    <section class="vm-pcf-section">
      <div class="vm-section-title vm-section-title--compact">
        <span>Protección para la mujer</span>
        <h2>Beneficios PCF</h2>
        <p>Importes calculados sobre la suma asegurada de PCF contratada.</p>
      </div>
      <div class="vm-pcf-table">
        ${rows.map((row) => `
          <article>
            <strong>${escapeHtml(row.name)}</strong>
            <span>${formatPercentage(row.percentage)}</span>
            <span>${formatNumber(row.benefitUdi)} UDI</span>
            <span>$${formatNumber(row.benefitMxn)} MXN hoy</span>
          </article>`).join("")}
      </div>
    </section>`;
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
      --rose: #b85c82;
      --rose-soft: #fbf0f5;
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
      line-height: 1.4;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .vm-document { width: 100%; }
    .vm-page {
      min-height: 257mm;
      display: flex;
      flex-direction: column;
      gap: 5mm;
      break-after: page;
      page-break-after: always;
    }
    .vm-page:last-child { break-after: auto; page-break-after: auto; }
    .vm-hero {
      position: relative;
      overflow: hidden;
      border-radius: 7mm;
      padding: 10mm 11mm;
      background:
        radial-gradient(circle at 92% 8%, rgba(184,92,130,.28), transparent 30%),
        linear-gradient(145deg, var(--navy), var(--navy-2));
      color: var(--white);
    }
    .vm-brand {
      display: flex;
      align-items: center;
      gap: 2.5mm;
      font-size: 8pt;
      font-weight: 900;
      letter-spacing: .13em;
      text-transform: uppercase;
    }
    .vm-brand::before {
      content: "";
      width: 6mm;
      height: 6mm;
      border-radius: 1.8mm;
      background: linear-gradient(135deg, var(--teal), var(--rose), var(--gold));
    }
    .vm-kicker {
      display: block;
      margin-top: 7mm;
      color: #9ee8e4;
      font-size: 7.5pt;
      font-weight: 900;
      letter-spacing: .12em;
      text-transform: uppercase;
    }
    .vm-hero h1 {
      margin: 1.5mm 0 1mm;
      font-size: 27pt;
      line-height: 1;
      letter-spacing: -.045em;
    }
    .vm-product {
      margin: 0;
      color: #f6cf79;
      font-size: 13pt;
      font-weight: 850;
    }
    .vm-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 2mm 6mm;
      margin-top: 4mm;
      color: rgba(255,255,255,.72);
      font-size: 8.3pt;
    }
    .vm-section-title span {
      display: block;
      color: var(--teal);
      font-size: 7pt;
      font-weight: 900;
      letter-spacing: .11em;
      text-transform: uppercase;
    }
    .vm-section-title h2 {
      margin: .8mm 0 0;
      color: var(--navy);
      font-size: 19pt;
      line-height: 1.05;
      letter-spacing: -.035em;
    }
    .vm-section-title p {
      margin: 1.5mm 0 0;
      color: var(--muted);
    }
    .vm-section-title--compact h2 { font-size: 15pt; }
    .vm-value-block {
      border: 1px solid var(--line);
      border-radius: 5mm;
      padding: 4mm 5mm;
      background: var(--white);
      box-shadow: 0 2mm 7mm rgba(7,23,45,.05);
      break-inside: avoid;
    }
    .vm-value-block > header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      gap: 4mm;
    }
    .vm-value-block > header > span {
      color: var(--navy);
      font-size: 12pt;
      font-weight: 900;
    }
    .vm-value-block > header > small { color: var(--muted); }
    .vm-value-pair {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 3mm;
      margin-top: 3mm;
    }
    .vm-value-pair article {
      border-radius: 4mm;
      padding: 4mm;
      background: var(--surface);
    }
    .vm-value-pair article:first-child { border-left: 1.4mm solid var(--teal); }
    .vm-value-pair article:last-child { border-left: 1.4mm solid var(--gold); }
    .vm-value-pair small {
      display: block;
      color: var(--muted);
      font-size: 7pt;
      font-weight: 850;
      letter-spacing: .06em;
      text-transform: uppercase;
    }
    .vm-value-pair strong {
      display: block;
      margin-top: 1.5mm;
      color: var(--navy);
      font-size: 20pt;
      line-height: 1;
      letter-spacing: -.035em;
    }
    .vm-protection-grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 2.5mm;
      margin-top: 2.5mm;
    }
    .vm-protection-card {
      min-width: 0;
      border-radius: 3.5mm;
      padding: 3.5mm;
      background: var(--rose-soft);
      border: 1px solid #efd7e1;
    }
    .vm-protection-card small {
      display: block;
      color: var(--rose);
      font-size: 6.6pt;
      font-weight: 900;
      text-transform: uppercase;
    }
    .vm-protection-card strong {
      display: block;
      margin-top: 1mm;
      color: var(--navy);
      font-size: 9pt;
    }
    .vm-protection-card span {
      display: block;
      margin-top: 1.3mm;
      color: var(--muted);
      font-size: 7.4pt;
    }
    .vm-evidence {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 2.5mm;
      margin-top: auto;
    }
    .vm-evidence article {
      border-radius: 3.5mm;
      padding: 3.5mm;
      background: var(--surface);
    }
    .vm-evidence small {
      display: block;
      color: var(--muted);
      font-size: 6.7pt;
      font-weight: 800;
      text-transform: uppercase;
    }
    .vm-evidence strong {
      display: block;
      margin-top: 1mm;
      color: var(--navy);
      font-size: 8.7pt;
    }
    .vm-endowments {
      overflow: hidden;
      border: 1px solid var(--line);
      border-radius: 5mm;
      background: var(--white);
    }
    .vm-endowment {
      display: grid;
      grid-template-columns: 16mm 32mm minmax(0, .8fr) minmax(0, 1fr);
      gap: 2mm;
      align-items: center;
      min-height: 11mm;
      padding: 2mm 4mm;
      border-top: 1px solid var(--line);
    }
    .vm-endowment:first-child { border-top: 0; }
    .vm-endowment--head {
      min-height: 13mm;
      background: var(--navy);
      color: var(--white);
      font-size: 7pt;
      font-weight: 850;
      line-height: 1.15;
    }
    .vm-endowment:not(.vm-endowment--head) strong { color: var(--teal); }
    .vm-endowment:not(.vm-endowment--head) span {
      font-size: 8.2pt;
      font-weight: 720;
    }
    .vm-survival-total {
      display: grid;
      grid-template-columns: 1fr auto auto;
      gap: 5mm;
      align-items: center;
      border-radius: 4mm;
      padding: 4mm 5mm;
      background: #e8f7f5;
      color: #0a5f5b;
    }
    .vm-survival-total strong { font-size: 11pt; }
    .vm-pcf-table {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 2mm;
      margin-top: 2.5mm;
    }
    .vm-pcf-table article {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      gap: .7mm 3mm;
      border-radius: 3mm;
      padding: 2.7mm 3mm;
      background: var(--rose-soft);
      border: 1px solid #efd7e1;
    }
    .vm-pcf-table strong {
      grid-column: 1 / -1;
      color: var(--navy);
      font-size: 7.8pt;
    }
    .vm-pcf-table span {
      color: var(--muted);
      font-size: 7pt;
    }
    .vm-notes {
      margin-top: auto;
      border-left: 1.4mm solid var(--gold);
      border-radius: 0 4mm 4mm 0;
      padding: 3.5mm 5mm;
      background: #fff7e6;
      color: #6d4b0d;
      font-size: 7.7pt;
    }
    .vm-notes ul { margin: 0; padding-left: 5mm; }
    .vm-footer {
      display: flex;
      justify-content: space-between;
      gap: 6mm;
      padding-top: 2.5mm;
      border-top: 1px solid var(--line);
      color: var(--muted);
      font-size: 7pt;
    }
    .vm-empty {
      border: 1px dashed var(--line);
      border-radius: 4mm;
      padding: 7mm;
      color: var(--muted);
      text-align: center;
    }
    @media screen {
      body { background: #dbe3ec; padding: 20px; }
      .vm-document {
        max-width: 210mm;
        margin: 0 auto;
        padding: 12mm;
        background: var(--white);
        box-shadow: 0 22px 70px rgba(7,23,45,.2);
      }
    }
  `;
}

function buildVidaMujerDocument({
  readModel,
  pageFormat = "A4",
  documentTitle = "Cotización Vida Mujer",
}) {
  const summary = readModel.commercialSummary;
  const client = confirmedSummary(readModel, "client");
  const advisor = confirmedSummary(readModel, "advisor");
  const quoteId = confirmedSummary(readModel, "quoteId");
  const acceptedAt = confirmedSummary(readModel, "acceptedAt");
  const product = summary.product || confirmedSummary(readModel, "product") || "Vida Mujer";
  const fileName = [
    "cotizacion",
    slug(client, "cliente"),
    slug(product, "vida-mujer"),
    slug(quoteId, readModel.sourceRevisionHash),
  ].join("-") + ".pdf";
  const meta = [
    client ? `Cliente: ${client}` : null,
    advisor ? `Asesor: ${advisor}` : null,
    acceptedAt ? `Fecha: ${acceptedAt}` : null,
    quoteId ? `Folio: ${quoteId}` : null,
  ].filter(Boolean);
  const evidence = [
    ["UDI utilizada", summary.evidence?.udiValue === null ? "—" : `$${formatNumber(summary.evidence?.udiValue)} MXN`],
    ["Fecha", summary.evidence?.udiDate || "No disponible"],
    ["Fuente", [summary.evidence?.udiSource, summary.evidence?.seriesId].filter(Boolean).join(" · ") || "No disponible"],
  ];
  const annualNote = summary.annualContribution?.includesAve
    ? "Incluye AVE de la cotización"
    : null;

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
  <main class="vm-document"
    data-forge-document="vida-mujer-commercial-summary"
    data-contract-version="${CONTRACT_VERSION}"
    data-page-format="${escapeHtml(pageFormat)}"
    data-page-orientation="portrait"
    data-layout="vida-mujer-protection-endowments">
    <section class="vm-page">
      <header class="vm-hero">
        <div class="vm-brand">Forge OS</div>
        <span class="vm-kicker">Propuesta comercial</span>
        <h1>${escapeHtml(documentTitle)}</h1>
        <p class="vm-product">${escapeHtml(product)}</p>
        ${meta.length ? `<div class="vm-meta">${meta.map((item) => `<span>${escapeHtml(item)}</span>`).join("")}</div>` : ""}
      </header>

      <div class="vm-section-title">
        <span>Lo esencial</span>
        <h2>Protección y aportación</h2>
        <p>Las cifras principales del plan y las coberturas detectadas como contratadas.</p>
      </div>

      ${valuePair("Suma asegurada", summary.sumAssured?.udi, summary.sumAssured?.mxn)}
      ${valuePair("Aportación anual", summary.annualContribution?.udi, summary.annualContribution?.mxn, annualNote)}
      ${protectionCards(summary)}

      <div class="vm-evidence">
        ${evidence.map(([label, value]) => `<article><small>${escapeHtml(label)}</small><strong>${escapeHtml(value)}</strong></article>`).join("")}
      </div>

      <footer class="vm-footer">
        <span>Aportación durante ${escapeHtml(summary.paymentYears || "—")} años</span>
        <span>Revisión ${escapeHtml(readModel.sourceRevisionHash)}</span>
      </footer>
    </section>

    <section class="vm-page">
      <div class="vm-section-title">
        <span>Beneficios en vida</span>
        <h2>Dotales por supervivencia</h2>
        <p>Pagos contractuales en UDI y su equivalencia proyectada en pesos para el año exacto de cada entrega.</p>
      </div>

      ${endowmentRows(summary)}

      <div class="vm-survival-total">
        <strong>Total por supervivencia · 115% de la suma asegurada</strong>
        <span>${formatNumber(summary.survivalTotal?.udi)} UDI</span>
        <span>${summary.survivalTotal?.mxn === null || summary.survivalTotal?.mxn === undefined
          ? "MXN proyectado pendiente"
          : `$${formatNumber(summary.survivalTotal?.mxn)} MXN proyectado`}</span>
      </div>

      ${pcfRows(summary)}

      <aside class="vm-notes">
        <ul>
          <li>La suma asegurada y los dotales se expresan contractualmente en UDI.</li>
          <li>Los valores futuros en MXN son proyecciones y no están garantizados.</li>
          <li>La póliza y la documentación oficial prevalecen sobre este resumen.</li>
        </ul>
      </aside>

      <footer class="vm-footer">
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
    readModel?.productProfile?.id === "VIDA_MUJER" &&
    readModel?.commercialSummary?.layoutId === VIDA_MUJER_LAYOUT_ID
  ) {
    return buildVidaMujerDocument(options);
  }
  return buildM05e007Document(options);
}

export {
  CONTRACT_VERSION,
  QUOTE_PRINTABLE_DOCUMENT_TYPE,
  buildQuotePrintableDocument,
};
