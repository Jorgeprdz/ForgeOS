import {
  QUOTE_PRINTABLE_DOCUMENT_TYPE,
  buildQuotePrintableDocument as buildM05e008Document,
} from "./quote-printable-document-composer-m05e008-pink.js";
import {
  VIDA_MUJER_LANDSCAPE_LAYOUT_ID,
} from "./quote-printable-product-profile-m05e010.js";

const CONTRACT_VERSION = "M05E010_VIDA_MUJER_LANDSCAPE_DOCUMENT_V1";

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

function metricCard({ label, udi, mxn, accent, note = null }) {
  return `
    <article class="vm-metric-card" style="--metric-accent:${accent}">
      <header>
        <span>${escapeHtml(label)}</span>
        ${note ? `<small>${escapeHtml(note)}</small>` : ""}
      </header>
      <div class="vm-metric-pair">
        <div><small>UDI</small><strong>${formatNumber(udi)}</strong></div>
        <div><small>MXN</small><strong>$${formatNumber(mxn)}</strong></div>
      </div>
    </article>`;
}

function protectionCards(summary) {
  const protections = summary.protections || [];
  if (!protections.length) return "";
  return `
    <section class="vm-panel vm-protection-panel">
      <header class="vm-panel-heading">
        <div><span>Coberturas contratadas</span><h2>Protección en vida</h2></div>
        <p>Sólo beneficios detectados como vigentes en la cotización.</p>
      </header>
      <div class="vm-protection-grid">
        ${protections.map((item) => `
          <article class="vm-protection-card">
            <small>${escapeHtml(item.status || "Contratada")}</small>
            <strong>${escapeHtml(item.label)}</strong>
            ${item.udi !== null && item.udi !== undefined
              ? `<span>${formatNumber(item.udi)} UDI · $${formatNumber(item.mxn)} MXN hoy</span>`
              : `<span>Beneficio incluido</span>`}
          </article>`).join("")}
      </div>
    </section>`;
}

function endowmentRows(summary) {
  const rows = summary.endowments || [];
  if (!rows.length) return '<div class="vm-empty">No hay dotales confirmados para mostrar.</div>';
  return `
    <div class="vm-table vm-endowment-table">
      <div class="vm-table-row vm-table-head">
        <span>Año</span><span>%</span><span>Beneficio UDI</span><span>MXN proyectado</span>
      </div>
      ${rows.map((row) => `
        <div class="vm-table-row">
          <strong>${escapeHtml(row.policyYear)}</strong>
          <span>${formatPercentage(row.percentage)}</span>
          <span>${formatNumber(row.benefitUdi)}</span>
          <span>${row.benefitMxn === null || row.benefitMxn === undefined
            ? "Pendiente"
            : `$${formatNumber(row.benefitMxn)}`}</span>
        </div>`).join("")}
    </div>`;
}

function pcfRows(summary) {
  const rows = summary.pcfDiseases || [];
  if (!rows.length) return '<div class="vm-empty">PCF no está contratada en esta cotización.</div>';
  return `
    <div class="vm-pcf-list">
      ${rows.map((row) => `
        <article>
          <strong>${escapeHtml(row.name)}</strong>
          <span>${formatPercentage(row.percentage)}</span>
          <span>${formatNumber(row.benefitUdi)} UDI</span>
          <span>$${formatNumber(row.benefitMxn)} MXN</span>
        </article>`).join("")}
    </div>`;
}

function css(pageFormat) {
  const pageSize = pageFormat === "LETTER" ? "Letter" : "A4";
  const pageWidth = pageFormat === "LETTER" ? "279mm" : "297mm";
  const contentHeight = pageFormat === "LETTER" ? "196mm" : "190mm";
  return `
    @page { size: ${pageSize} landscape; margin: 9mm; }
    :root {
      color-scheme: light;
      --plum: #5f4a59;
      --plum-deep: #453641;
      --rose: #c7a1ae;
      --rose-soft: #f3e9ed;
      --sage: #8fa79a;
      --sage-soft: #e9efeb;
      --sand: #ddcfb4;
      --sand-soft: #f5f0e7;
      --ink: #302a31;
      --muted: #746b72;
      --line: rgba(95,74,89,.14);
      --white: #fffefd;
    }
    * { box-sizing: border-box; }
    html, body {
      margin: 0;
      padding: 0;
      background: var(--white);
      color: var(--ink);
      font-family: Inter, ui-sans-serif, system-ui, -apple-system,
        BlinkMacSystemFont, "Segoe UI", sans-serif;
      font-size: 9pt;
      line-height: 1.35;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .vm-document { width: 100%; }
    .vm-page {
      min-height: ${contentHeight};
      display: flex;
      flex-direction: column;
      gap: 4mm;
      break-after: page;
      page-break-after: always;
    }
    .vm-page:last-child { break-after: auto; page-break-after: auto; }
    .vm-hero {
      position: relative;
      overflow: hidden;
      display: grid;
      grid-template-columns: minmax(0,1.35fr) minmax(0,.65fr);
      align-items: end;
      min-height: 43mm;
      border-radius: 8mm;
      padding: 8mm 9mm;
      background:
        radial-gradient(circle at 88% 22%, rgba(199,161,174,.46), transparent 31%),
        radial-gradient(circle at 70% 100%, rgba(143,167,154,.24), transparent 34%),
        linear-gradient(132deg, var(--plum-deep), #596470);
      color: white;
      box-shadow: 0 5mm 14mm rgba(69,54,65,.17);
    }
    .vm-hero::after {
      content: "";
      position: absolute;
      inset: auto 8mm 7mm auto;
      width: 54mm;
      height: 2.5mm;
      border-radius: 999px;
      background: linear-gradient(90deg, var(--rose), var(--sage), var(--sand));
      opacity: .88;
    }
    .vm-brand {
      font-size: 7.5pt;
      font-weight: 900;
      letter-spacing: .13em;
      text-transform: uppercase;
    }
    .vm-kicker {
      display: block;
      margin-top: 4mm;
      color: #e9d8df;
      font-size: 7pt;
      font-weight: 850;
      letter-spacing: .11em;
      text-transform: uppercase;
    }
    .vm-hero h1 {
      margin: 1mm 0 1mm;
      font-size: 25pt;
      line-height: 1;
      letter-spacing: -.045em;
    }
    .vm-product { margin: 0; color: #efe1c5; font-size: 12pt; font-weight: 800; }
    .vm-meta {
      align-self: center;
      display: grid;
      gap: 2mm;
      color: rgba(255,255,255,.78);
      text-align: right;
      font-size: 8pt;
    }
    .vm-metrics {
      display: grid;
      grid-template-columns: repeat(3, minmax(0,1fr));
      gap: 3mm;
    }
    .vm-metric-card {
      position: relative;
      overflow: hidden;
      border-radius: 6mm;
      padding: 4mm 5mm;
      background: linear-gradient(145deg, color-mix(in srgb, var(--metric-accent) 12%, white), white);
      box-shadow: 0 2.5mm 8mm rgba(69,54,65,.08);
    }
    .vm-metric-card::before {
      content: "";
      position: absolute;
      inset: 0 auto 0 0;
      width: 1.6mm;
      border-radius: 6mm 0 0 6mm;
      background: var(--metric-accent);
    }
    .vm-metric-card header {
      display: flex;
      justify-content: space-between;
      gap: 3mm;
      align-items: baseline;
    }
    .vm-metric-card header > span { color: var(--plum-deep); font-size: 10pt; font-weight: 900; }
    .vm-metric-card header small { color: var(--muted); font-size: 6.5pt; text-align: right; }
    .vm-metric-pair {
      display: grid;
      grid-template-columns: repeat(2,minmax(0,1fr));
      gap: 2mm;
      margin-top: 2.5mm;
    }
    .vm-metric-pair div {
      border-radius: 4mm;
      padding: 3mm;
      background: rgba(255,255,255,.72);
    }
    .vm-metric-pair small {
      display: block;
      color: var(--muted);
      font-size: 6.3pt;
      font-weight: 850;
      letter-spacing: .07em;
      text-transform: uppercase;
    }
    .vm-metric-pair strong {
      display: block;
      margin-top: 1mm;
      color: var(--plum-deep);
      font-size: 15pt;
      line-height: 1;
      letter-spacing: -.03em;
    }
    .vm-panel {
      border-radius: 6mm;
      padding: 4.5mm 5mm;
      background: #fbfaf9;
      box-shadow: 0 2.5mm 8mm rgba(69,54,65,.07);
    }
    .vm-panel-heading {
      display: flex;
      justify-content: space-between;
      align-items: end;
      gap: 6mm;
    }
    .vm-panel-heading span {
      display: block;
      color: var(--rose);
      font-size: 6.5pt;
      font-weight: 900;
      letter-spacing: .1em;
      text-transform: uppercase;
    }
    .vm-panel-heading h2 { margin: .5mm 0 0; color: var(--plum-deep); font-size: 14pt; }
    .vm-panel-heading p { margin: 0; max-width: 80mm; color: var(--muted); font-size: 7pt; text-align: right; }
    .vm-protection-grid {
      display: grid;
      grid-template-columns: repeat(5,minmax(0,1fr));
      gap: 2.5mm;
      margin-top: 3mm;
    }
    .vm-protection-card {
      min-width: 0;
      border-radius: 4.5mm;
      padding: 3mm;
      background: linear-gradient(150deg, var(--rose-soft), #f9f6f7);
    }
    .vm-protection-card small { color: #a27a88; font-size: 6pt; font-weight: 900; text-transform: uppercase; }
    .vm-protection-card strong { display:block; margin-top:1mm; color:var(--plum-deep); font-size:8pt; }
    .vm-protection-card span { display:block; margin-top:1.5mm; color:var(--muted); font-size:6.5pt; }
    .vm-evidence {
      display: grid;
      grid-template-columns: repeat(3,minmax(0,1fr));
      gap: 2.5mm;
      margin-top: auto;
    }
    .vm-evidence article {
      border-radius: 4mm;
      padding: 3mm 3.5mm;
      background: var(--sage-soft);
    }
    .vm-evidence small { display:block; color:var(--muted); font-size:6pt; font-weight:850; text-transform:uppercase; }
    .vm-evidence strong { display:block; margin-top:.8mm; color:var(--plum-deep); font-size:7.8pt; }
    .vm-page-two-grid {
      display: grid;
      grid-template-columns: minmax(0,1.08fr) minmax(0,.92fr);
      gap: 4mm;
      flex: 1;
    }
    .vm-page-two-grid > section {
      min-width: 0;
      border-radius: 6mm;
      padding: 5mm;
      background: #fbfaf9;
      box-shadow: 0 2.5mm 8mm rgba(69,54,65,.07);
    }
    .vm-section-label { color:var(--rose); font-size:6.5pt; font-weight:900; letter-spacing:.1em; text-transform:uppercase; }
    .vm-page-two-grid h2 { margin:1mm 0 1.5mm; color:var(--plum-deep); font-size:17pt; letter-spacing:-.03em; }
    .vm-page-two-grid p { margin:0 0 3mm; color:var(--muted); font-size:7.3pt; }
    .vm-table { overflow:hidden; border-radius:4.5mm; background:white; }
    .vm-table-row {
      display:grid;
      grid-template-columns: 14mm 14mm minmax(0,.8fr) minmax(0,1fr);
      gap:2mm;
      align-items:center;
      min-height:10mm;
      padding:1.8mm 3mm;
      border-top:1px solid var(--line);
    }
    .vm-table-row:first-child { border-top:0; }
    .vm-table-head { background:var(--plum); color:white; font-size:6.3pt; font-weight:850; }
    .vm-table-row:not(.vm-table-head) strong { color:#a67888; }
    .vm-table-row:not(.vm-table-head) span { font-size:7.3pt; font-weight:700; }
    .vm-survival-total {
      display:grid;
      grid-template-columns:1fr auto auto;
      gap:4mm;
      align-items:center;
      margin-top:2.5mm;
      border-radius:4.5mm;
      padding:3.5mm 4mm;
      background:linear-gradient(120deg,var(--sage-soft),var(--sand-soft));
      color:var(--plum-deep);
    }
    .vm-survival-total strong { font-size:8.5pt; }
    .vm-pcf-list { display:grid; gap:1.5mm; }
    .vm-pcf-list article {
      display:grid;
      grid-template-columns:minmax(0,1fr) 12mm 27mm 31mm;
      gap:2mm;
      align-items:center;
      border-radius:3.5mm;
      padding:2.5mm 3mm;
      background:linear-gradient(145deg,var(--rose-soft),#faf7f8);
    }
    .vm-pcf-list strong { color:var(--plum-deep); font-size:7.1pt; }
    .vm-pcf-list span { color:var(--muted); font-size:6.7pt; text-align:right; }
    .vm-notes {
      border-radius:4.5mm;
      padding:3mm 4mm;
      background:var(--sand-soft);
      color:#675a48;
      font-size:6.8pt;
    }
    .vm-notes ul { margin:0; padding-left:4mm; display:grid; gap:1mm; }
    .vm-footer {
      display:flex;
      justify-content:space-between;
      gap:6mm;
      padding-top:2mm;
      color:var(--muted);
      font-size:6.5pt;
    }
    .vm-empty { border-radius:4mm; padding:6mm; color:var(--muted); background:var(--rose-soft); text-align:center; }
    @media screen {
      body { background:#e8e4e6; padding:20px; }
      .vm-document {
        max-width:${pageWidth};
        margin:0 auto;
        padding:9mm;
        border-radius:6mm;
        background:var(--white);
        box-shadow:0 22px 70px rgba(69,54,65,.18);
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
    ? "Incluye AVE"
    : "Aportación anual";

  const html = `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="robots" content="noindex,nofollow">
  <meta name="forge-document-type" content="${QUOTE_PRINTABLE_DOCUMENT_TYPE}">
  <meta name="forge-orientation" content="landscape">
  <title>${escapeHtml(documentTitle)} · ${escapeHtml(client || product)}</title>
  <style>${css(pageFormat)}</style>
</head>
<body>
  <main class="vm-document"
    data-forge-document="vida-mujer-commercial-summary"
    data-contract-version="${CONTRACT_VERSION}"
    data-page-format="${escapeHtml(pageFormat)}"
    data-page-orientation="landscape"
    data-layout="vida-mujer-landscape-editorial">
    <section class="vm-page">
      <header class="vm-hero">
        <div>
          <div class="vm-brand">Forge OS</div>
          <span class="vm-kicker">Propuesta Vida Mujer</span>
          <h1>${escapeHtml(documentTitle)}</h1>
          <p class="vm-product">${escapeHtml(product)}</p>
        </div>
        ${meta.length ? `<div class="vm-meta">${meta.map((item) => `<span>${escapeHtml(item)}</span>`).join("")}</div>` : ""}
      </header>

      <section class="vm-metrics" aria-label="Resumen financiero">
        ${metricCard({ label: "Suma asegurada", udi: summary.sumAssured?.udi, mxn: summary.sumAssured?.mxn, accent: "#c7a1ae" })}
        ${metricCard({ label: "Aportación anual", udi: summary.annualContribution?.udi, mxn: summary.annualContribution?.mxn, accent: "#ddcfb4", note: annualNote })}
        ${metricCard({ label: "Total aportado", udi: summary.totalContribution?.udi, mxn: summary.totalContribution?.mxn, accent: "#8fa79a", note: "Equivalencia con UDI de hoy" })}
      </section>

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
      <div class="vm-page-two-grid">
        <section>
          <span class="vm-section-label">Beneficios en vida</span>
          <h2>Dotales por supervivencia</h2>
          <p>Pagos contractuales en UDI y equivalencia proyectada para el año exacto.</p>
          ${endowmentRows(summary)}
          <div class="vm-survival-total">
            <strong>Total por supervivencia · 115%</strong>
            <span>${formatNumber(summary.survivalTotal?.udi)} UDI</span>
            <span>${summary.survivalTotal?.mxn === null || summary.survivalTotal?.mxn === undefined
              ? "MXN pendiente"
              : `$${formatNumber(summary.survivalTotal?.mxn)} MXN proyectado`}</span>
          </div>
        </section>

        <section>
          <span class="vm-section-label">Protección para la mujer</span>
          <h2>Beneficios PCF</h2>
          <p>Importes sobre la suma asegurada PCF contratada.</p>
          ${pcfRows(summary)}
        </section>
      </div>

      <aside class="vm-notes">
        <ul>
          <li>La suma asegurada, aportaciones y dotales se expresan contractualmente en UDI.</li>
          <li>El total aportado en MXN es una equivalencia con la UDI vigente de hoy.</li>
          <li>Los valores futuros en MXN son proyecciones y no están garantizados.</li>
          <li>La póliza y la documentación oficial prevalecen sobre este resumen.</li>
        </ul>
      </aside>

      <footer class="vm-footer">
        <span>${escapeHtml(documentTitle)} · ${escapeHtml(pageFormat)} horizontal</span>
        <span>Revisión ${escapeHtml(readModel.sourceRevisionHash)}</span>
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
    pageOrientation: "LANDSCAPE",
    fileName,
    mediaType: "text/html",
    sourceDocumentId: readModel.documentId,
    sourceRevisionHash: readModel.sourceRevisionHash,
    html,
    presentationPalette: Object.freeze({
      dominant: "FADED_PLUM_ROSE",
      primary: "#5F4A59",
      secondary: "#C7A1AE",
      soft: "#F3E9ED",
      complement: "#8FA79A",
      accent: "#DDCFB4",
    }),
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
    readModel?.commercialSummary?.layoutId === VIDA_MUJER_LANDSCAPE_LAYOUT_ID
  ) {
    return buildVidaMujerDocument(options);
  }
  return buildM05e008Document(options);
}

export {
  CONTRACT_VERSION,
  QUOTE_PRINTABLE_DOCUMENT_TYPE,
  buildQuotePrintableDocument,
};