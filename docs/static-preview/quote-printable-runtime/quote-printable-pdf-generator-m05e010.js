import {
  PDF_MEDIA_TYPE,
  QUOTE_PRINTABLE_PDF_TYPE,
  buildQuotePrintablePdf as buildM05e008Pdf,
  downloadQuotePrintablePdf,
} from "./quote-printable-pdf-generator-m05e008.js";
import {
  VIDA_MUJER_LANDSCAPE_LAYOUT_ID,
} from "./quote-printable-product-profile-m05e010.js";

const CONTRACT_VERSION = "M05E010_VIDA_MUJER_LANDSCAPE_PDF_V1";
const PAGE = Object.freeze({
  A4: Object.freeze({ width: 841.89, height: 595.28 }),
  LETTER: Object.freeze({ width: 792, height: 612 }),
});
const C = Object.freeze({
  plum: "#5F4A59",
  plumDeep: "#453641",
  rose: "#C7A1AE",
  roseSoft: "#F3E9ED",
  sage: "#8FA79A",
  sageSoft: "#E9EFEB",
  sand: "#DDCFB4",
  sandSoft: "#F5F0E7",
  ink: "#302A31",
  muted: "#746B72",
  line: "#E6DDE1",
  white: "#FFFEFD",
  cool: "#596470",
});

function deepFreeze(value, seen = new WeakSet()) {
  if (!value || typeof value !== "object" || seen.has(value)) return value;
  if (ArrayBuffer.isView(value)) return value;
  seen.add(value);
  Object.values(value).forEach((item) => deepFreeze(item, seen));
  return Object.freeze(value);
}

function finite(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function fmt(value, locale = "es-MX") {
  const number = finite(value);
  return number === null
    ? "-"
    : new Intl.NumberFormat(locale, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(number);
}

function pct(value, locale = "es-MX") {
  const number = finite(value);
  if (number === null) return "-";
  const percentage = Math.abs(number) <= 1 ? number * 100 : number;
  return `${new Intl.NumberFormat(locale, {
    maximumFractionDigits: 2,
  }).format(percentage)}%`;
}

function toWinAnsi(value) {
  return String(value ?? "")
    .normalize("NFC")
    .replace(/[–—]/g, "-")
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/…/g, "...")
    .replace(/[^\x09\x0A\x0D\x20-\x7E\xA0-\xFF]/g, "?");
}

function pdfString(value) {
  return `(${toWinAnsi(value)
    .replaceAll("\\", "\\\\")
    .replaceAll("(", "\\(")
    .replaceAll(")", "\\)")})`;
}

function latin1Bytes(value) {
  const text = String(value);
  const bytes = new Uint8Array(text.length);
  for (let index = 0; index < text.length; index += 1) {
    bytes[index] = text.charCodeAt(index) & 0xff;
  }
  return bytes;
}

function concatBytes(chunks) {
  const length = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const output = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) {
    output.set(chunk, offset);
    offset += chunk.length;
  }
  return output;
}

function hash(bytes) {
  let output = 0x811c9dc5;
  for (const byte of bytes) {
    output ^= byte;
    output = Math.imul(output, 0x01000193);
  }
  return (output >>> 0).toString(16).padStart(8, "0");
}

function rgb(hex) {
  const value = Number.parseInt(String(hex).replace("#", ""), 16);
  return [
    ((value >> 16) & 255) / 255,
    ((value >> 8) & 255) / 255,
    (value & 255) / 255,
  ];
}

function color(hex, stroke = false) {
  return `${rgb(hex).map((item) => item.toFixed(3)).join(" ")} ${stroke ? "RG" : "rg"}`;
}

function estimate(text, size, bold = false) {
  return toWinAnsi(text).length * size * (bold ? 0.56 : 0.52);
}

function wrap(value, maxWidth, size, bold = false) {
  const words = toWinAnsi(value).split(/\s+/).filter(Boolean);
  const lines = [];
  let line = "";
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (estimate(candidate, size, bold) <= maxWidth) line = candidate;
    else {
      if (line) lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines;
}

class Page {
  constructor(size) {
    this.width = size.width;
    this.height = size.height;
    this.commands = [];
    this.rect(0, 0, this.width, this.height, { fill: C.white });
  }

  rect(x, y, width, height, { fill = null, stroke = null, lineWidth = 1 } = {}) {
    if (fill) this.commands.push(color(fill));
    if (stroke) this.commands.push(color(stroke, true));
    this.commands.push(`${lineWidth.toFixed(2)} w`);
    const operator = fill && stroke ? "B" : fill ? "f" : "S";
    this.commands.push(`${x.toFixed(2)} ${y.toFixed(2)} ${width.toFixed(2)} ${height.toFixed(2)} re ${operator}`);
  }

  roundRect(x, y, width, height, radius, { fill = null, stroke = null, lineWidth = 1 } = {}) {
    const r = Math.min(radius, width / 2, height / 2);
    const k = 0.5522847498;
    const c = r * k;
    if (fill) this.commands.push(color(fill));
    if (stroke) this.commands.push(color(stroke, true));
    this.commands.push(`${lineWidth.toFixed(2)} w`);
    this.commands.push([
      `${(x + r).toFixed(2)} ${y.toFixed(2)} m`,
      `${(x + width - r).toFixed(2)} ${y.toFixed(2)} l`,
      `${(x + width - r + c).toFixed(2)} ${y.toFixed(2)} ${(x + width).toFixed(2)} ${(y + r - c).toFixed(2)} ${(x + width).toFixed(2)} ${(y + r).toFixed(2)} c`,
      `${(x + width).toFixed(2)} ${(y + height - r).toFixed(2)} l`,
      `${(x + width).toFixed(2)} ${(y + height - r + c).toFixed(2)} ${(x + width - r + c).toFixed(2)} ${(y + height).toFixed(2)} ${(x + width - r).toFixed(2)} ${(y + height).toFixed(2)} c`,
      `${(x + r).toFixed(2)} ${(y + height).toFixed(2)} l`,
      `${(x + r - c).toFixed(2)} ${(y + height).toFixed(2)} ${x.toFixed(2)} ${(y + height - r + c).toFixed(2)} ${x.toFixed(2)} ${(y + height - r).toFixed(2)} c`,
      `${x.toFixed(2)} ${(y + r).toFixed(2)} l`,
      `${x.toFixed(2)} ${(y + r - c).toFixed(2)} ${(x + r - c).toFixed(2)} ${y.toFixed(2)} ${(x + r).toFixed(2)} ${y.toFixed(2)} c`,
      "h",
      fill && stroke ? "B" : fill ? "f" : "S",
    ].join("\n"));
  }

  line(x1, y1, x2, y2, stroke = C.line, lineWidth = 1) {
    this.commands.push(color(stroke, true));
    this.commands.push(`${lineWidth.toFixed(2)} w`);
    this.commands.push(`${x1.toFixed(2)} ${y1.toFixed(2)} m ${x2.toFixed(2)} ${y2.toFixed(2)} l S`);
  }

  text(value, x, y, { size = 10, bold = false, fill = C.ink } = {}) {
    this.commands.push(color(fill));
    this.commands.push(`BT ${bold ? "/F2" : "/F1"} ${size.toFixed(2)} Tf 1 0 0 1 ${x.toFixed(2)} ${y.toFixed(2)} Tm ${pdfString(value)} Tj ET`);
  }

  textLines(lines, x, y, options = {}) {
    const size = options.size || 10;
    const lineHeight = options.lineHeight || size * 1.25;
    lines.forEach((line, index) =>
      this.text(line, x, y - index * lineHeight, options));
  }

  stream() {
    return this.commands.join("\n") + "\n";
  }
}

function summaryText(readModel, key) {
  const field = readModel.summary?.[key];
  if (!field || field.status !== "CONFIRMED") return null;
  const value = String(field.value ?? "").trim();
  return value && value !== "Sin dato confirmado" ? value : null;
}

function drawHero(page, readModel, title, summary) {
  const margin = 34;
  const width = page.width - margin * 2;
  const y = page.height - 132;
  page.roundRect(margin, y, width, 98, 18, { fill: C.plumDeep });
  page.roundRect(page.width - margin - 196, y + 18, 170, 62, 16, { fill: C.cool });
  page.roundRect(page.width - margin - 180, y + 29, 138, 12, 6, { fill: C.rose });
  page.roundRect(page.width - margin - 180, y + 47, 92, 10, 5, { fill: C.sage });
  page.text("FORGE OS", margin + 24, y + 72, { size: 8, bold: true, fill: C.white });
  page.text("PROPUESTA VIDA MUJER", margin + 24, y + 51, { size: 7, bold: true, fill: "#E9D8DF" });
  page.text(title, margin + 24, y + 24, { size: 25, bold: true, fill: C.white });
  page.text(summary.product || "Vida Mujer", margin + 24, y + 8, { size: 10, bold: true, fill: "#EFE1C5" });
  const meta = [
    summaryText(readModel, "client") ? `Cliente: ${summaryText(readModel, "client")}` : null,
    summary.paymentYears ? `Aportación durante ${summary.paymentYears} años` : null,
  ].filter(Boolean);
  meta.forEach((item, index) => page.text(item, page.width - margin - 180, y + 65 - index * 16, {
    size: 7.2,
    fill: C.white,
  }));
}

function drawMetric(page, x, y, width, label, udi, mxn, accent, note = null) {
  page.roundRect(x, y, width, 105, 14, { fill: C.white, stroke: C.line, lineWidth: .55 });
  page.roundRect(x, y, 8, 105, 4, { fill: accent });
  page.text(label, x + 18, y + 82, { size: 10, bold: true, fill: C.plumDeep });
  if (note) page.text(note, x + 18, y + 69, { size: 6.3, fill: C.muted });
  const innerWidth = (width - 46) / 2;
  page.roundRect(x + 18, y + 16, innerWidth, 44, 9, { fill: C.roseSoft });
  page.roundRect(x + 28 + innerWidth, y + 16, innerWidth, 44, 9, { fill: C.sageSoft });
  page.text("UDI", x + 29, y + 45, { size: 6.2, bold: true, fill: C.muted });
  page.text(fmt(udi), x + 29, y + 25, { size: 14, bold: true, fill: C.plumDeep });
  page.text("MXN", x + 39 + innerWidth, y + 45, { size: 6.2, bold: true, fill: C.muted });
  page.text(`$${fmt(mxn)}`, x + 39 + innerWidth, y + 25, { size: 12.5, bold: true, fill: C.plumDeep });
}

function drawProtections(page, summary) {
  const margin = 34;
  page.text("COBERTURAS CONTRATADAS", margin, 290, { size: 6.5, bold: true, fill: C.rose });
  page.text("Protección en vida", margin, 268, { size: 16, bold: true, fill: C.plumDeep });
  const items = (summary.protections || []).slice(0, 10);
  const gap = 9;
  const width = (page.width - margin * 2 - gap * 4) / 5;
  items.forEach((item, index) => {
    const column = index % 5;
    const row = Math.floor(index / 5);
    const x = margin + column * (width + gap);
    const y = 188 - row * 72;
    page.roundRect(x, y, width, 62, 11, { fill: C.roseSoft });
    page.text(String(item.status || "Contratada").toUpperCase(), x + 10, y + 44, { size: 5.8, bold: true, fill: C.rose });
    page.textLines(wrap(item.label, width - 20, 7.4, true).slice(0, 2), x + 10, y + 29, {
      size: 7.4,
      bold: true,
      fill: C.plumDeep,
      lineHeight: 8,
    });
    const detail = finite(item.udi) !== null ? `${fmt(item.udi)} UDI` : "Beneficio incluido";
    page.text(detail, x + 10, y + 8, { size: 6.2, fill: C.muted });
  });
}

function drawEvidence(page, summary) {
  const margin = 34;
  const y = 38;
  const gap = 9;
  const width = (page.width - margin * 2 - gap * 2) / 3;
  const values = [
    ["UDI utilizada", summary.evidence?.udiValue === null ? "-" : `$${fmt(summary.evidence?.udiValue)} MXN`],
    ["Fecha", summary.evidence?.udiDate || "No disponible"],
    ["Fuente", [summary.evidence?.udiSource, summary.evidence?.seriesId].filter(Boolean).join(" · ") || "No disponible"],
  ];
  values.forEach(([label, value], index) => {
    const x = margin + index * (width + gap);
    page.roundRect(x, y, width, 46, 10, { fill: C.sageSoft });
    page.text(label.toUpperCase(), x + 12, y + 29, { size: 5.8, bold: true, fill: C.muted });
    page.textLines(wrap(value, width - 24, 7.2, true).slice(0, 2), x + 12, y + 14, {
      size: 7.2,
      bold: true,
      fill: C.plumDeep,
      lineHeight: 8,
    });
  });
}

function drawEndowments(page, x, yTop, width, summary) {
  page.text("BENEFICIOS EN VIDA", x, yTop, { size: 6.5, bold: true, fill: C.rose });
  page.text("Dotales por supervivencia", x, yTop - 24, { size: 17, bold: true, fill: C.plumDeep });
  page.text("Pagos contractuales en UDI y equivalencia proyectada.", x, yTop - 41, { size: 7, fill: C.muted });
  let y = yTop - 66;
  const cols = [42, 45, 105, width - 42 - 45 - 105];
  page.roundRect(x, y - 30, width, 30, 8, { fill: C.plum });
  const labels = ["Año", "%", "Beneficio UDI", "MXN proyectado"];
  let cx = x;
  labels.forEach((label, index) => {
    page.text(label, cx + 8, y - 19, { size: 6.2, bold: true, fill: C.white });
    cx += cols[index];
  });
  y -= 30;
  for (const row of summary.endowments || []) {
    page.roundRect(x, y - 31, width, 29, 6, { fill: C.white, stroke: C.line, lineWidth: .45 });
    cx = x;
    const values = [
      String(row.policyYear ?? "-"),
      pct(row.percentage),
      fmt(row.benefitUdi),
      row.benefitMxn === null || row.benefitMxn === undefined ? "Pendiente" : `$${fmt(row.benefitMxn)}`,
    ];
    values.forEach((value, index) => {
      page.text(value, cx + 8, y - 20, { size: index === 0 ? 8.6 : 7.1, bold: true, fill: index === 0 ? C.rose : C.ink });
      cx += cols[index];
    });
    y -= 31;
  }
  page.roundRect(x, y - 48, width, 42, 10, { fill: C.sageSoft });
  page.text("TOTAL POR SUPERVIVENCIA · 115%", x + 14, y - 31, { size: 7.4, bold: true, fill: C.plumDeep });
  page.text(`${fmt(summary.survivalTotal?.udi)} UDI`, x + width - 205, y - 31, { size: 8, bold: true, fill: C.plumDeep });
  const mxn = summary.survivalTotal?.mxn === null || summary.survivalTotal?.mxn === undefined
    ? "MXN pendiente"
    : `$${fmt(summary.survivalTotal?.mxn)} MXN`;
  page.text(mxn, x + width - 115, y - 31, { size: 7.2, bold: true, fill: C.plumDeep });
}

function drawPcf(page, x, yTop, width, summary) {
  page.text("PROTECCIÓN PARA LA MUJER", x, yTop, { size: 6.5, bold: true, fill: C.rose });
  page.text("Beneficios PCF", x, yTop - 24, { size: 17, bold: true, fill: C.plumDeep });
  page.text("Importes sobre la suma asegurada PCF contratada.", x, yTop - 41, { size: 7, fill: C.muted });
  let y = yTop - 65;
  for (const row of summary.pcfDiseases || []) {
    page.roundRect(x, y - 43, width, 38, 9, { fill: C.roseSoft });
    page.textLines(wrap(row.name, width - 150, 7.1, true).slice(0, 2), x + 11, y - 17, {
      size: 7.1,
      bold: true,
      fill: C.plumDeep,
      lineHeight: 8,
    });
    page.text(pct(row.percentage), x + width - 138, y - 24, { size: 6.8, bold: true, fill: C.rose });
    page.text(`${fmt(row.benefitUdi)} UDI`, x + width - 100, y - 24, { size: 6.8, bold: true, fill: C.ink });
    page.text(`$${fmt(row.benefitMxn)}`, x + width - 48, y - 24, { size: 6.4, bold: true, fill: C.ink });
    y -= 44;
  }
  page.roundRect(x, 45, width, 72, 11, { fill: C.sandSoft });
  const notes = [
    "El total aportado en MXN usa la UDI vigente de hoy.",
    "Los valores futuros en MXN son proyecciones no garantizadas.",
    "La póliza y documentación oficial prevalecen.",
  ];
  notes.forEach((note, index) => page.text(`• ${note}`, x + 13, 96 - index * 17, {
    size: 6.5,
    fill: "#675A48",
  }));
}

function makePdf(pages, info = {}) {
  const objects = new Map();
  const catalogId = 1;
  const pagesId = 2;
  const normalFontId = 3;
  const boldFontId = 4;
  const infoId = 5;
  let nextId = 6;
  const pageIds = [];

  objects.set(normalFontId, "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>");
  objects.set(boldFontId, "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>");

  for (const page of pages) {
    const pageId = nextId++;
    const contentId = nextId++;
    pageIds.push(pageId);
    const stream = page.stream();
    objects.set(contentId, `<< /Length ${latin1Bytes(stream).length} >>\nstream\n${stream}endstream`);
    objects.set(pageId, `<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${page.width.toFixed(2)} ${page.height.toFixed(2)}] /Resources << /Font << /F1 ${normalFontId} 0 R /F2 ${boldFontId} 0 R >> >> /Contents ${contentId} 0 R >>`);
  }

  objects.set(pagesId, `<< /Type /Pages /Count ${pageIds.length} /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] >>`);
  objects.set(catalogId, `<< /Type /Catalog /Pages ${pagesId} 0 R /PageLayout /OneColumn >>`);
  const pdfDate = String(info.createdAt || new Date().toISOString())
    .replace(/[-:TZ.]/g, "").slice(0, 14);
  objects.set(infoId, `<< /Title ${pdfString(info.title || "Cotización Vida Mujer")} /Author ${pdfString(info.author || "Forge OS")} /Subject ${pdfString("Resumen comercial Vida Mujer")} /Creator ${pdfString("Forge OS M05E-010")} /Producer ${pdfString("Forge OS faded landscape PDF generator")} /CreationDate (D:${pdfDate}) >>`);

  const chunks = [latin1Bytes("%PDF-1.4\n%\xE2\xE3\xCF\xD3\n")];
  const offsets = new Array(nextId).fill(0);
  let offset = chunks[0].length;
  for (let id = 1; id < nextId; id += 1) {
    const object = `${id} 0 obj\n${objects.get(id)}\nendobj\n`;
    offsets[id] = offset;
    const bytes = latin1Bytes(object);
    chunks.push(bytes);
    offset += bytes.length;
  }
  const xrefOffset = offset;
  let xref = `xref\n0 ${nextId}\n0000000000 65535 f \n`;
  for (let id = 1; id < nextId; id += 1) {
    xref += `${String(offsets[id]).padStart(10, "0")} 00000 n \n`;
  }
  xref += `trailer\n<< /Size ${nextId} /Root ${catalogId} 0 R /Info ${infoId} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;
  chunks.push(latin1Bytes(xref));
  return concatBytes(chunks);
}

function buildVidaMujerPdf({
  readModel,
  printableDocument,
  title = "Cotización Vida Mujer",
  generatedAt = null,
}) {
  const format = String(printableDocument.pageFormat || "A4").toUpperCase();
  const size = PAGE[format] || PAGE.A4;
  const summary = readModel.commercialSummary;
  const pages = [new Page(size), new Page(size)];

  drawHero(pages[0], readModel, title, summary);
  const margin = 34;
  const gap = 11;
  const metricWidth = (pages[0].width - margin * 2 - gap * 2) / 3;
  drawMetric(pages[0], margin, 327, metricWidth, "Suma asegurada", summary.sumAssured?.udi, summary.sumAssured?.mxn, C.rose);
  drawMetric(pages[0], margin + metricWidth + gap, 327, metricWidth, "Aportación anual", summary.annualContribution?.udi, summary.annualContribution?.mxn, C.sand, summary.annualContribution?.includesAve ? "Incluye AVE" : null);
  drawMetric(pages[0], margin + (metricWidth + gap) * 2, 327, metricWidth, "Total aportado", summary.totalContribution?.udi, summary.totalContribution?.mxn, C.sage, "Equivalencia con UDI de hoy");
  drawProtections(pages[0], summary);
  drawEvidence(pages[0], summary);

  const leftX = 34;
  const leftWidth = 448;
  const rightX = 498;
  const rightWidth = pages[1].width - rightX - 34;
  drawEndowments(pages[1], leftX, pages[1].height - 44, leftWidth, summary);
  drawPcf(pages[1], rightX, pages[1].height - 44, rightWidth, summary);
  pages[1].text(`${title} · ${format} horizontal`, leftX, 24, { size: 6.5, fill: C.muted });
  const revision = `Revisión ${readModel.sourceRevisionHash}`;
  pages[1].text(revision, pages[1].width - 34 - estimate(revision, 6.5), 24, { size: 6.5, fill: C.muted });

  const bytes = makePdf(pages, {
    title,
    author: summaryText(readModel, "advisor") || "Forge OS",
    createdAt: generatedAt || readModel.generatedAt,
  });
  const immutable = bytes.slice();
  return deepFreeze({
    packetType: QUOTE_PRINTABLE_PDF_TYPE,
    contractVersion: CONTRACT_VERSION,
    status: "PDF_BINARY_READY",
    mediaType: PDF_MEDIA_TYPE,
    fileName: printableDocument.fileName,
    pageFormat: format,
    pageOrientation: "LANDSCAPE",
    pageWidth: size.width,
    pageHeight: size.height,
    pageCount: 2,
    byteLength: immutable.length,
    binaryRevisionHash: hash(immutable),
    sourceDocumentId: readModel.documentId,
    sourceRevisionHash: readModel.sourceRevisionHash,
    getBytes() {
      return immutable.slice();
    },
    toBlob() {
      if (typeof Blob === "undefined") {
        throw new TypeError("Blob is not available in this runtime");
      }
      return new Blob([immutable.slice()], { type: PDF_MEDIA_TYPE });
    },
    safety: {
      scriptsAllowed: false,
      networkAllowed: false,
      recalculationAllowed: false,
      automaticDownloadAllowed: false,
      downloadExecuted: false,
      printExecuted: false,
      persistenceWritten: false,
      automaticSendAllowed: false,
      humanReviewRequired: true,
    },
  });
}

function buildQuotePrintablePdf(options = {}) {
  const readModel = options.readModel;
  if (
    readModel?.productProfile?.id === "VIDA_MUJER" &&
    readModel?.commercialSummary?.layoutId === VIDA_MUJER_LANDSCAPE_LAYOUT_ID
  ) {
    return buildVidaMujerPdf(options);
  }
  return buildM05e008Pdf(options);
}

export {
  CONTRACT_VERSION,
  PDF_MEDIA_TYPE,
  QUOTE_PRINTABLE_PDF_TYPE,
  buildQuotePrintablePdf,
  downloadQuotePrintablePdf,
};