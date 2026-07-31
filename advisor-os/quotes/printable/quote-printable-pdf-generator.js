import {
  QUOTE_PRINTABLE_READ_MODEL_TYPE,
} from "./quote-printable-read-model.js";
import {
  QUOTE_PRINTABLE_DOCUMENT_TYPE,
} from "./quote-printable-document-composer.js";

const QUOTE_PRINTABLE_PDF_TYPE = "FORGE_QUOTE_PRINTABLE_PDF";
const CONTRACT_VERSION = "QPD03_REAL_PDF_V1";
const SUPPORTED_PAGE_FORMATS = Object.freeze({
  A4: Object.freeze({ width: 595.28, height: 841.89 }),
  LETTER: Object.freeze({ width: 612, height: 792 }),
});
const PDF_MEDIA_TYPE = "application/pdf";

function isRecord(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function deepFreeze(value, seen = new WeakSet()) {
  if (!value || typeof value !== "object" || seen.has(value)) return value;
  if (ArrayBuffer.isView(value)) return value;
  seen.add(value);
  for (const item of Object.values(value)) deepFreeze(item, seen);
  return Object.freeze(value);
}

function hash(value) {
  let output = 0x811c9dc5;
  for (const byte of value) {
    output ^= byte;
    output = Math.imul(output, 0x01000193);
  }
  return (output >>> 0).toString(16).padStart(8, "0");
}

function normalizeFormat(value) {
  const format = String(value || "A4").trim().toUpperCase();
  if (!SUPPORTED_PAGE_FORMATS[format]) {
    throw new TypeError(`Unsupported page format: ${format}`);
  }
  return format;
}

function toWinAnsi(value) {
  return String(value ?? "")
    .normalize("NFC")
    .replace(/[–—]/g, "-")
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/…/g, "...")
    .replace(/€/g, "EUR")
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

function rgb(hex) {
  const normalized = String(hex).replace("#", "");
  const value = Number.parseInt(normalized, 16);
  return [
    ((value >> 16) & 255) / 255,
    ((value >> 8) & 255) / 255,
    (value & 255) / 255,
  ];
}

function colorCommand(hex, stroke = false) {
  const values = rgb(hex).map((value) => value.toFixed(3)).join(" ");
  return `${values} ${stroke ? "RG" : "rg"}`;
}

function estimateTextWidth(text, size, bold = false) {
  const factor = bold ? 0.56 : 0.52;
  return toWinAnsi(text).length * size * factor;
}

function wrapText(value, maxWidth, size, bold = false) {
  const paragraphs = toWinAnsi(value).split(/\r?\n/);
  const lines = [];
  for (const paragraph of paragraphs) {
    const words = paragraph.trim().split(/\s+/).filter(Boolean);
    if (!words.length) {
      lines.push("");
      continue;
    }
    let line = "";
    for (const word of words) {
      const candidate = line ? `${line} ${word}` : word;
      if (estimateTextWidth(candidate, size, bold) <= maxWidth) {
        line = candidate;
        continue;
      }
      if (line) lines.push(line);
      if (estimateTextWidth(word, size, bold) <= maxWidth) {
        line = word;
        continue;
      }
      let fragment = "";
      for (const character of word) {
        const fragmentCandidate = fragment + character;
        if (estimateTextWidth(fragmentCandidate, size, bold) <= maxWidth) {
          fragment = fragmentCandidate;
        } else {
          if (fragment) lines.push(fragment);
          fragment = character;
        }
      }
      line = fragment;
    }
    if (line) lines.push(line);
  }
  return lines;
}

function humanizeKey(value) {
  return String(value || "")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .trim()
    .replace(/^./, (character) => character.toUpperCase());
}

function formatNumber(value, unit, locale) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return String(value ?? "");
  if (/^[A-Z]{3}$/.test(String(unit || ""))) {
    try {
      return new Intl.NumberFormat(locale, {
        style: "currency",
        currency: unit,
        maximumFractionDigits: 2,
      }).format(numeric);
    } catch {}
  }
  const formatted = new Intl.NumberFormat(locale, {
    maximumFractionDigits: 2,
  }).format(numeric);
  return [formatted, unit].filter(Boolean).join(" ");
}

function flattenValue(value, field, locale) {
  if (value === null || typeof value === "undefined" || value === "") {
    return ["Sin dato confirmado"];
  }
  if (typeof value === "number") {
    return [formatNumber(value, field.unit, locale)];
  }
  if (typeof value === "boolean") return [value ? "Sí" : "No"];
  if (Array.isArray(value)) {
    if (!value.length) return ["Sin dato confirmado"];
    return value.flatMap((item, index) => {
      const nested = flattenValue(item, field, locale);
      return nested.map((line, lineIndex) =>
        lineIndex === 0 ? `${index + 1}. ${line}` : `   ${line}`,
      );
    });
  }
  if (isRecord(value)) {
    const rows = [];
    for (const [key, item] of Object.entries(value)) {
      if (item === null || typeof item === "undefined") continue;
      const nested = flattenValue(item, field, locale);
      nested.forEach((line, index) => {
        rows.push(index === 0 ? `${humanizeKey(key)}: ${line}` : `   ${line}`);
      });
    }
    return rows.length ? rows : ["Sin dato confirmado"];
  }
  return [String(value).trim() || "Sin dato confirmado"];
}

class PdfPage {
  constructor({ width, height, pageNumber, documentLabel }) {
    this.width = width;
    this.height = height;
    this.pageNumber = pageNumber;
    this.documentLabel = documentLabel;
    this.commands = [];
  }

  fill(hex) {
    this.commands.push(colorCommand(hex));
  }

  stroke(hex) {
    this.commands.push(colorCommand(hex, true));
  }

  rect(x, y, width, height, { fill = null, stroke = null, lineWidth = 1 } = {}) {
    if (fill) this.fill(fill);
    if (stroke) this.stroke(stroke);
    this.commands.push(`${lineWidth.toFixed(2)} w`);
    const operator = fill && stroke ? "B" : fill ? "f" : "S";
    this.commands.push(`${x.toFixed(2)} ${y.toFixed(2)} ${width.toFixed(2)} ${height.toFixed(2)} re ${operator}`);
  }

  line(x1, y1, x2, y2, { stroke = "#D8DEE8", lineWidth = 1 } = {}) {
    this.stroke(stroke);
    this.commands.push(`${lineWidth.toFixed(2)} w`);
    this.commands.push(`${x1.toFixed(2)} ${y1.toFixed(2)} m ${x2.toFixed(2)} ${y2.toFixed(2)} l S`);
  }

  text(value, x, y, { size = 10, bold = false, color = "#172033" } = {}) {
    const font = bold ? "/F2" : "/F1";
    this.fill(color);
    this.commands.push(
      `BT ${font} ${size.toFixed(2)} Tf 1 0 0 1 ${x.toFixed(2)} ${y.toFixed(2)} Tm ${pdfString(value)} Tj ET`,
    );
  }

  textLines(lines, x, y, { size = 10, bold = false, color = "#172033", lineHeight = size * 1.25 } = {}) {
    lines.forEach((line, index) => {
      this.text(line, x, y - index * lineHeight, { size, bold, color });
    });
    return y - lines.length * lineHeight;
  }

  stream() {
    return this.commands.join("\n") + "\n";
  }
}

class QuotePdfLayout {
  constructor({ readModel, printableDocument, pageFormat, title }) {
    this.readModel = readModel;
    this.printableDocument = printableDocument;
    this.pageFormat = pageFormat;
    this.title = title;
    this.locale = String(readModel.locale || "es-MX");
    this.size = SUPPORTED_PAGE_FORMATS[pageFormat];
    this.margin = 42;
    this.footerHeight = 30;
    this.headerHeight = 38;
    this.pages = [];
    this.page = null;
    this.cursorY = 0;
  }

  newPage({ cover = false } = {}) {
    this.page = new PdfPage({
      ...this.size,
      pageNumber: this.pages.length + 1,
      documentLabel: this.printableDocument.fileName,
    });
    this.pages.push(this.page);
    if (cover) {
      this.cursorY = this.size.height - this.margin;
      return this.page;
    }
    this.drawHeader();
    this.drawFooter();
    this.cursorY = this.size.height - this.margin - this.headerHeight;
    return this.page;
  }

  drawHeader() {
    const { width, height } = this.size;
    this.page.text(this.title, this.margin, height - this.margin + 8, {
      size: 9,
      bold: true,
      color: "#064E5F",
    });
    const client = this.summaryText("client");
    const product = this.summaryText("product");
    const right = `${client} · ${product}`;
    const rightWidth = estimateTextWidth(right, 8, false);
    this.page.text(right, Math.max(this.margin, width - this.margin - rightWidth), height - this.margin + 8, {
      size: 8,
      color: "#657086",
    });
    this.page.line(this.margin, height - this.margin - 2, width - this.margin, height - this.margin - 2, {
      stroke: "#D8DEE8",
    });
  }

  drawFooter() {
    const { width } = this.size;
    this.page.line(this.margin, this.margin - 6, width - this.margin, this.margin - 6, {
      stroke: "#D8DEE8",
    });
    this.page.text("Documento generado para revisión humana", this.margin, this.margin - 20, {
      size: 7.5,
      color: "#657086",
    });
    const pageLabel = `Página ${this.page.pageNumber}`;
    this.page.text(pageLabel, width - this.margin - estimateTextWidth(pageLabel, 7.5), this.margin - 20, {
      size: 7.5,
      color: "#657086",
    });
  }

  ensureSpace(required) {
    if (this.cursorY - required >= this.margin + this.footerHeight) return;
    this.newPage();
  }

  summaryText(key) {
    const field = this.readModel.summary?.[key];
    if (!field || field.status !== "CONFIRMED") return "Sin dato confirmado";
    return flattenValue(field.value, field, this.locale).join(" · ");
  }

  renderCover() {
    const page = this.newPage({ cover: true });
    const { width, height } = this.size;
    page.rect(0, 0, width, height, { fill: "#F8FAFC" });
    page.rect(width - 190, height - 240, 190, 240, { fill: "#E7F5F3" });
    page.rect(this.margin, this.margin, width - this.margin * 2, height - this.margin * 2, {
      stroke: "#D8DEE8",
      lineWidth: 1.2,
    });
    page.rect(this.margin + 2, height - this.margin - 20, 16, 16, { fill: "#0F766E" });
    page.text("FORGE OS", this.margin + 26, height - this.margin - 17, {
      size: 10,
      bold: true,
      color: "#064E5F",
    });
    page.text("DOCUMENTO TÉCNICO-COMERCIAL", this.margin + 2, height - 180, {
      size: 10,
      bold: true,
      color: "#0F766E",
    });
    const titleLines = wrapText(this.title, width - this.margin * 2 - 20, 30, true);
    page.textLines(titleLines, this.margin + 2, height - 225, {
      size: 30,
      bold: true,
      color: "#064E5F",
      lineHeight: 34,
    });
    const subtitle = "Resumen imprimible de la cotización aceptada, sus cifras confirmadas, proyecciones identificadas y fuentes documentales.";
    page.textLines(wrapText(subtitle, width - this.margin * 2 - 40, 12), this.margin + 2, height - 300, {
      size: 12,
      color: "#657086",
      lineHeight: 16,
    });

    const items = [
      ["Cliente", this.summaryText("client")],
      ["Producto", this.summaryText("product")],
      ["Asesor", this.summaryText("advisor")],
      ["Folio", this.summaryText("quoteId")],
    ];
    const y = height - 390;
    const gap = 12;
    const boxWidth = (width - this.margin * 2 - gap) / 2;
    items.forEach(([label, value], index) => {
      const column = index % 2;
      const row = Math.floor(index / 2);
      const x = this.margin + column * (boxWidth + gap);
      const boxY = y - row * 92;
      page.rect(x, boxY - 70, boxWidth, 72, {
        fill: "#FFFFFF",
        stroke: "#D8DEE8",
      });
      page.text(label.toUpperCase(), x + 12, boxY - 17, {
        size: 7.5,
        bold: true,
        color: "#657086",
      });
      page.textLines(wrapText(value, boxWidth - 24, 11, true).slice(0, 3), x + 12, boxY - 38, {
        size: 11,
        bold: true,
        color: "#172033",
        lineHeight: 13,
      });
    });

    const acceptedAt = this.summaryText("acceptedAt");
    page.text(`Aceptada: ${acceptedAt}`, this.margin + 2, this.margin + 20, {
      size: 8,
      color: "#657086",
    });
    const formatText = `Formato: ${this.pageFormat}`;
    page.text(formatText, width - this.margin - estimateTextWidth(formatText, 8), this.margin + 20, {
      size: 8,
      color: "#657086",
    });
  }

  renderWarnings() {
    const warnings = this.readModel.review?.warnings || [];
    if (!warnings.length) return;
    const lineSets = warnings.map((warning) => wrapText(`• ${warning}`, this.size.width - this.margin * 2 - 24, 9));
    const height = 48 + lineSets.reduce((sum, lines) => sum + lines.length * 12, 0);
    this.ensureSpace(height + 8);
    const top = this.cursorY;
    this.page.rect(this.margin, top - height, this.size.width - this.margin * 2, height, {
      fill: "#FFF7ED",
      stroke: "#FDBA74",
    });
    this.page.text("Información que requiere atención", this.margin + 12, top - 19, {
      size: 9.5,
      bold: true,
      color: "#92400E",
    });
    let y = top - 38;
    for (const lines of lineSets) {
      y = this.page.textLines(lines, this.margin + 14, y, {
        size: 9,
        color: "#92400E",
        lineHeight: 12,
      }) - 3;
    }
    this.cursorY = top - height - 10;
  }

  renderSection(section) {
    const fieldPlans = section.fields.map((field) => {
      const valueLines = field.status === "CONFIRMED"
        ? flattenValue(field.value, field, this.locale).flatMap((line) =>
            wrapText(line, this.size.width - this.margin * 2 - 30, 10),
          )
        : ["Sin dato confirmado"];
      return { field, valueLines, height: 34 + Math.max(1, valueLines.length) * 13 };
    });
    this.ensureSpace(38 + Math.min(fieldPlans.reduce((sum, plan) => sum + plan.height + 8, 0), 120));
    this.page.text(section.title, this.margin, this.cursorY, {
      size: 14,
      bold: true,
      color: "#064E5F",
    });
    const countText = `${section.availableFieldCount} datos confirmados`;
    this.page.text(countText, this.size.width - this.margin - estimateTextWidth(countText, 8), this.cursorY + 1, {
      size: 8,
      color: "#657086",
    });
    this.cursorY -= 12;
    this.page.line(this.margin, this.cursorY, this.size.width - this.margin, this.cursorY, {
      stroke: "#064E5F",
      lineWidth: 1.5,
    });
    this.cursorY -= 16;

    for (const plan of fieldPlans) {
      this.ensureSpace(plan.height + 10);
      const { field, valueLines, height } = plan;
      const projection = field.classification === "PROJECTION";
      const unavailable = field.status !== "CONFIRMED";
      this.page.rect(this.margin, this.cursorY - height, this.size.width - this.margin * 2, height, {
        fill: projection ? "#FFF7ED" : unavailable ? "#F4F7FB" : "#FFFFFF",
        stroke: projection ? "#FDBA74" : "#D8DEE8",
      });
      this.page.text(field.label, this.margin + 12, this.cursorY - 17, {
        size: 8.5,
        bold: true,
        color: "#657086",
      });
      if (projection) {
        const badge = "PROYECCIÓN";
        this.page.text(badge, this.size.width - this.margin - 12 - estimateTextWidth(badge, 7, true), this.cursorY - 17, {
          size: 7,
          bold: true,
          color: "#92400E",
        });
      }
      this.page.textLines(valueLines, this.margin + 12, this.cursorY - 36, {
        size: 10,
        bold: !unavailable,
        color: unavailable ? "#657086" : "#172033",
        lineHeight: 13,
      });
      this.cursorY -= height + 9;
    }
    this.cursorY -= 8;
  }

  renderSources() {
    const rows = [];
    const seen = new Set();
    for (const section of this.readModel.sections) {
      for (const field of section.fields) {
        if (field.status !== "CONFIRMED" || !field.sourcePath) continue;
        const key = `${field.id}|${field.sourcePath}`;
        if (seen.has(key)) continue;
        seen.add(key);
        rows.push(field);
      }
    }
    this.ensureSpace(55);
    this.page.text("Fuentes del documento", this.margin, this.cursorY, {
      size: 14,
      bold: true,
      color: "#064E5F",
    });
    this.cursorY -= 12;
    this.page.line(this.margin, this.cursorY, this.size.width - this.margin, this.cursorY, {
      stroke: "#064E5F",
      lineWidth: 1.5,
    });
    this.cursorY -= 16;
    for (const field of rows) {
      const source = `${field.authority || "No disponible"} · ${field.sourcePath}`;
      const sourceLines = wrapText(source, this.size.width - this.margin * 2 - 30, 7.5);
      const height = 30 + sourceLines.length * 10;
      this.ensureSpace(height + 6);
      this.page.rect(this.margin, this.cursorY - height, this.size.width - this.margin * 2, height, {
        fill: "#FFFFFF",
        stroke: "#D8DEE8",
      });
      this.page.text(field.label, this.margin + 10, this.cursorY - 15, {
        size: 8,
        bold: true,
        color: "#172033",
      });
      this.page.textLines(sourceLines, this.margin + 10, this.cursorY - 30, {
        size: 7.5,
        color: "#657086",
        lineHeight: 10,
      });
      this.cursorY -= height + 5;
    }
  }

  renderDisclaimers() {
    const lines = this.readModel.disclaimers.flatMap((item, index) =>
      wrapText(`${index + 1}. ${item}`, this.size.width - this.margin * 2, 8),
    );
    const required = 24 + lines.length * 11;
    this.ensureSpace(required);
    this.page.line(this.margin, this.cursorY, this.size.width - this.margin, this.cursorY, {
      stroke: "#D8DEE8",
    });
    this.cursorY -= 18;
    this.page.textLines(lines, this.margin, this.cursorY, {
      size: 8,
      color: "#657086",
      lineHeight: 11,
    });
    this.cursorY -= lines.length * 11;
  }

  render() {
    this.renderCover();
    this.newPage();
    this.renderWarnings();
    for (const section of this.readModel.sections) this.renderSection(section);
    this.renderSources();
    this.renderDisclaimers();
    return this.pages;
  }
}

function makePdf({ pages, title, author, subject, keywords, createdAt }) {
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
    const streamLength = latin1Bytes(stream).length;
    objects.set(contentId, `<< /Length ${streamLength} >>\nstream\n${stream}endstream`);
    objects.set(pageId,
      `<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${page.width.toFixed(2)} ${page.height.toFixed(2)}] /Resources << /Font << /F1 ${normalFontId} 0 R /F2 ${boldFontId} 0 R >> >> /Contents ${contentId} 0 R >>`,
    );
  }

  objects.set(pagesId, `<< /Type /Pages /Count ${pageIds.length} /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] >>`);
  objects.set(catalogId, `<< /Type /Catalog /Pages ${pagesId} 0 R /PageLayout /OneColumn >>`);
  const pdfDate = String(createdAt || new Date().toISOString()).replace(/[-:TZ.]/g, "").slice(0, 14);
  objects.set(infoId,
    `<< /Title ${pdfString(title)} /Author ${pdfString(author)} /Subject ${pdfString(subject)} /Keywords ${pdfString(keywords)} /Creator ${pdfString("Forge OS QPD-03")} /Producer ${pdfString("Forge OS deterministic PDF generator")} /CreationDate (D:${pdfDate}) >>`,
  );

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

function assertSafePdf(bytes) {
  const prefix = String.fromCharCode(...bytes.slice(0, 8));
  const tail = String.fromCharCode(...bytes.slice(-16));
  const text = String.fromCharCode(...bytes);
  if (!prefix.startsWith("%PDF-1.")) throw new Error("Generated bytes are not a PDF");
  if (!tail.includes("%%EOF")) throw new Error("Generated PDF is missing EOF marker");
  for (const forbidden of ["/JavaScript", "/JS", "/OpenAction", "/Launch", "/URI"]) {
    if (text.includes(forbidden)) throw new Error(`Forbidden PDF action: ${forbidden}`);
  }
}

function buildQuotePrintablePdf({
  readModel,
  printableDocument,
  title = "Cotización",
  generatedAt = null,
} = {}) {
  if (!isRecord(readModel) || readModel.packetType !== QUOTE_PRINTABLE_READ_MODEL_TYPE) {
    throw new TypeError("Unsupported quote printable read model");
  }
  if (readModel.status !== "READY_FOR_DOCUMENT_COMPOSITION") {
    throw new TypeError("Quote printable read model is not ready");
  }
  if (!isRecord(printableDocument) || printableDocument.packetType !== QUOTE_PRINTABLE_DOCUMENT_TYPE) {
    throw new TypeError("Unsupported printable document packet");
  }
  if (printableDocument.status !== "PRINTABLE_HTML_READY") {
    throw new TypeError("Printable document HTML is not ready");
  }
  if (
    printableDocument.sourceDocumentId !== readModel.documentId ||
    printableDocument.sourceRevisionHash !== readModel.sourceRevisionHash
  ) {
    throw new TypeError("Printable document does not match the read model revision");
  }
  if (
    readModel.safety?.recalculationAllowed !== false ||
    printableDocument.safety?.recalculationAllowed !== false
  ) {
    throw new TypeError("PDF generation cannot authorize recalculation");
  }

  const pageFormat = normalizeFormat(printableDocument.pageFormat);
  const layout = new QuotePdfLayout({
    readModel,
    printableDocument,
    pageFormat,
    title: String(title || "Cotización").trim() || "Cotización",
  });
  const pages = layout.render();
  const client = layout.summaryText("client");
  const product = layout.summaryText("product");
  const advisor = layout.summaryText("advisor");
  const createdAt = generatedAt || readModel.generatedAt || new Date().toISOString();
  const bytes = makePdf({
    pages,
    title: `${title} · ${client}`,
    author: advisor,
    subject: `Cotización técnica-comercial · ${product}`,
    keywords: `Forge OS, cotización, ${product}, ${readModel.sourceRevisionHash}`,
    createdAt,
  });
  assertSafePdf(bytes);
  const binaryRevisionHash = hash(bytes);
  const immutableBytes = bytes.slice();

  return deepFreeze({
    packetType: QUOTE_PRINTABLE_PDF_TYPE,
    contractVersion: CONTRACT_VERSION,
    status: "PDF_BINARY_READY",
    mediaType: PDF_MEDIA_TYPE,
    fileName: printableDocument.fileName,
    pageFormat,
    pageCount: pages.length,
    byteLength: immutableBytes.length,
    binaryRevisionHash,
    sourceDocumentId: readModel.documentId,
    sourceRevisionHash: readModel.sourceRevisionHash,
    getBytes() {
      return immutableBytes.slice();
    },
    toBlob() {
      if (typeof Blob === "undefined") {
        throw new TypeError("Blob is not available in this runtime");
      }
      return new Blob([immutableBytes.slice()], { type: PDF_MEDIA_TYPE });
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

function downloadQuotePrintablePdf({
  pdfPacket,
  userInitiated = false,
  documentRef = globalThis.document,
  urlRef = globalThis.URL,
} = {}) {
  if (!isRecord(pdfPacket) || pdfPacket.packetType !== QUOTE_PRINTABLE_PDF_TYPE) {
    throw new TypeError("Unsupported quote printable PDF packet");
  }
  if (pdfPacket.status !== "PDF_BINARY_READY") {
    throw new TypeError("PDF binary is not ready");
  }
  if (userInitiated !== true) {
    throw new TypeError("Explicit human download action is required");
  }
  if (!documentRef?.createElement || !urlRef?.createObjectURL || !urlRef?.revokeObjectURL) {
    throw new TypeError("Browser download runtime is required");
  }

  const blob = pdfPacket.toBlob();
  const objectUrl = urlRef.createObjectURL(blob);
  const anchor = documentRef.createElement("a");
  anchor.href = objectUrl;
  anchor.download = pdfPacket.fileName;
  anchor.rel = "noopener";
  anchor.style.display = "none";
  documentRef.body?.appendChild?.(anchor);
  try {
    anchor.click();
  } finally {
    anchor.remove?.();
    urlRef.revokeObjectURL(objectUrl);
  }

  return deepFreeze({
    status: "DOWNLOAD_DISPATCHED",
    fileName: pdfPacket.fileName,
    mediaType: pdfPacket.mediaType,
    byteLength: pdfPacket.byteLength,
    binaryRevisionHash: pdfPacket.binaryRevisionHash,
    sourceRevisionHash: pdfPacket.sourceRevisionHash,
    userInitiated: true,
    networkUsed: false,
    printExecuted: false,
    sendAuthorized: false,
  });
}

export {
  CONTRACT_VERSION,
  PDF_MEDIA_TYPE,
  QUOTE_PRINTABLE_PDF_TYPE,
  buildQuotePrintablePdf,
  downloadQuotePrintablePdf,
};
