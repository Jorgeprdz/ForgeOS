import {
  QUOTE_PRINTABLE_READ_MODEL_TYPE,
} from "./quote-printable-read-model.js";
import {
  QUOTE_PRINTABLE_DOCUMENT_TYPE,
} from "./quote-printable-document-composer-m05e005.js";

const QUOTE_PRINTABLE_PDF_TYPE = "FORGE_QUOTE_PRINTABLE_PDF";
const CONTRACT_VERSION = "M05E005_PREMIUM_PORTRAIT_PDF_V1";
const PDF_MEDIA_TYPE = "application/pdf";
const PAGE_FORMATS = Object.freeze({
  A4: Object.freeze({ width: 595.28, height: 841.89 }),
  LETTER: Object.freeze({ width: 612, height: 792 }),
});
const COLORS = Object.freeze({
  navy: "#07172D",
  navy2: "#0D2543",
  teal: "#18B8B1",
  tealSoft: "#E8F7F5",
  gold: "#D9A842",
  goldSoft: "#FFF7E6",
  ink: "#142033",
  muted: "#68758A",
  line: "#DFE6EF",
  surface: "#F5F8FB",
  white: "#FFFFFF",
});

function isRecord(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function deepFreeze(value, seen = new WeakSet()) {
  if (!value || typeof value !== "object" || seen.has(value)) return value;
  if (ArrayBuffer.isView(value)) return value;
  seen.add(value);
  Object.values(value).forEach((item) => deepFreeze(item, seen));
  return Object.freeze(value);
}

function normalizeFormat(value) {
  const normalized = String(value || "A4").trim().toUpperCase();
  const resolved = normalized === "CARTA" ? "LETTER" : normalized;
  if (!PAGE_FORMATS[resolved]) {
    throw new TypeError(`Unsupported page format: ${resolved}`);
  }
  return resolved;
}

function hash(bytes) {
  let output = 0x811c9dc5;
  for (const byte of bytes) {
    output ^= byte;
    output = Math.imul(output, 0x01000193);
  }
  return (output >>> 0).toString(16).padStart(8, "0");
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
  const value = Number.parseInt(String(hex).replace("#", ""), 16);
  return [
    ((value >> 16) & 255) / 255,
    ((value >> 8) & 255) / 255,
    (value & 255) / 255,
  ];
}

function colorCommand(hex, stroke = false) {
  return `${rgb(hex).map((item) => item.toFixed(3)).join(" ")} ${stroke ? "RG" : "rg"}`;
}

function estimateTextWidth(text, size, bold = false) {
  return toWinAnsi(text).length * size * (bold ? 0.56 : 0.52);
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
        if (estimateTextWidth(fragment + character, size, bold) <= maxWidth) {
          fragment += character;
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
  return [
    new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(numeric),
    unit,
  ].filter(Boolean).join(" ");
}

function flattenValue(value, field, locale) {
  if (value === null || typeof value === "undefined" || value === "") {
    return ["Sin dato confirmado"];
  }
  if (typeof value === "number") return [formatNumber(value, field?.unit, locale)];
  if (typeof value === "boolean") return [value ? "Sí" : "No"];
  if (Array.isArray(value)) {
    if (!value.length) return ["Sin dato confirmado"];
    return value.flatMap((item, index) => flattenValue(item, field, locale)
      .map((line, lineIndex) => lineIndex === 0 ? `${index + 1}. ${line}` : `   ${line}`));
  }
  if (isRecord(value)) {
    const rows = [];
    for (const [key, item] of Object.entries(value)) {
      if (item === null || typeof item === "undefined") continue;
      flattenValue(item, field, locale).forEach((line, index) => {
        rows.push(index === 0 ? `${humanizeKey(key)}: ${line}` : `   ${line}`);
      });
    }
    return rows.length ? rows : ["Sin dato confirmado"];
  }
  return [String(value).trim() || "Sin dato confirmado"];
}

class PdfPage {
  constructor({ width, height, pageNumber }) {
    this.width = width;
    this.height = height;
    this.pageNumber = pageNumber;
    this.commands = [];
  }

  fill(hex) { this.commands.push(colorCommand(hex)); }
  stroke(hex) { this.commands.push(colorCommand(hex, true)); }

  rect(x, y, width, height, { fill = null, stroke = null, lineWidth = 1 } = {}) {
    if (fill) this.fill(fill);
    if (stroke) this.stroke(stroke);
    this.commands.push(`${lineWidth.toFixed(2)} w`);
    const operator = fill && stroke ? "B" : fill ? "f" : "S";
    this.commands.push(`${x.toFixed(2)} ${y.toFixed(2)} ${width.toFixed(2)} ${height.toFixed(2)} re ${operator}`);
  }

  roundRect(x, y, width, height, radius, { fill = null, stroke = null, lineWidth = 1 } = {}) {
    const r = Math.max(0, Math.min(radius, width / 2, height / 2));
    const k = 0.5522847498;
    if (fill) this.fill(fill);
    if (stroke) this.stroke(stroke);
    this.commands.push(`${lineWidth.toFixed(2)} w`);
    const operator = fill && stroke ? "B" : fill ? "f" : "S";
    this.commands.push([
      `${(x + r).toFixed(2)} ${y.toFixed(2)} m`,
      `${(x + width - r).toFixed(2)} ${y.toFixed(2)} l`,
      `${(x + width - r + r * k).toFixed(2)} ${y.toFixed(2)} ${(x + width).toFixed(2)} ${(y + r - r * k).toFixed(2)} ${(x + width).toFixed(2)} ${(y + r).toFixed(2)} c`,
      `${(x + width).toFixed(2)} ${(y + height - r).toFixed(2)} l`,
      `${(x + width).toFixed(2)} ${(y + height - r + r * k).toFixed(2)} ${(x + width - r + r * k).toFixed(2)} ${(y + height).toFixed(2)} ${(x + width - r).toFixed(2)} ${(y + height).toFixed(2)} c`,
      `${(x + r).toFixed(2)} ${(y + height).toFixed(2)} l`,
      `${(x + r - r * k).toFixed(2)} ${(y + height).toFixed(2)} ${x.toFixed(2)} ${(y + height - r + r * k).toFixed(2)} ${x.toFixed(2)} ${(y + height - r).toFixed(2)} c`,
      `${x.toFixed(2)} ${(y + r).toFixed(2)} l`,
      `${x.toFixed(2)} ${(y + r - r * k).toFixed(2)} ${(x + r - r * k).toFixed(2)} ${y.toFixed(2)} ${(x + r).toFixed(2)} ${y.toFixed(2)} c`,
      `h ${operator}`,
    ].join("\n"));
  }

  line(x1, y1, x2, y2, { stroke = COLORS.line, lineWidth = 1 } = {}) {
    this.stroke(stroke);
    this.commands.push(`${lineWidth.toFixed(2)} w`);
    this.commands.push(`${x1.toFixed(2)} ${y1.toFixed(2)} m ${x2.toFixed(2)} ${y2.toFixed(2)} l S`);
  }

  text(value, x, y, { size = 10, bold = false, color = COLORS.ink } = {}) {
    this.fill(color);
    this.commands.push(`BT ${bold ? "/F2" : "/F1"} ${size.toFixed(2)} Tf 1 0 0 1 ${x.toFixed(2)} ${y.toFixed(2)} Tm ${pdfString(value)} Tj ET`);
  }

  textLines(lines, x, y, options = {}) {
    const size = options.size || 10;
    const lineHeight = options.lineHeight || size * 1.25;
    lines.forEach((line, index) => this.text(line, x, y - index * lineHeight, options));
    return y - lines.length * lineHeight;
  }

  stream() { return this.commands.join("\n") + "\n"; }
}

class PremiumQuoteLayout {
  constructor({ readModel, printableDocument, pageFormat, title }) {
    this.readModel = readModel;
    this.printableDocument = printableDocument;
    this.pageFormat = pageFormat;
    this.title = title;
    this.locale = String(readModel.locale || "es-MX");
    this.size = PAGE_FORMATS[pageFormat];
    this.margin = 42;
    this.pages = [];
    this.page = null;
    this.cursorY = 0;
    this.footerReserve = 38;
  }

  summaryText(key) {
    const field = this.readModel.summary?.[key];
    if (!field || field.status !== "CONFIRMED") return "Sin dato confirmado";
    return flattenValue(field.value, field, this.locale).join(" · ");
  }

  fieldMap() {
    const map = new Map();
    Object.values(this.readModel.summary || {}).forEach((field) => {
      if (field?.id) map.set(field.id, field);
    });
    (this.readModel.sections || []).forEach((section) =>
      (section.fields || []).forEach((field) => {
        if (field?.id) map.set(field.id, field);
      }));
    return map;
  }

  newPage({ cover = false } = {}) {
    this.page = new PdfPage({
      ...this.size,
      pageNumber: this.pages.length + 1,
    });
    this.pages.push(this.page);
    this.page.rect(0, 0, this.size.width, this.size.height, { fill: COLORS.white });
    if (cover) {
      this.cursorY = this.size.height - this.margin;
      return;
    }
    this.drawHeader();
    this.drawFooter();
    this.cursorY = this.size.height - this.margin - 42;
  }

  drawHeader() {
    const y = this.size.height - this.margin + 7;
    this.page.roundRect(this.margin, y - 8, 9, 9, 2, { fill: COLORS.teal });
    this.page.text("FORGE OS", this.margin + 15, y - 5, {
      size: 8.5,
      bold: true,
      color: COLORS.navy,
    });
    const label = `${this.title} · ${this.summaryText("client")}`;
    const width = estimateTextWidth(label, 7.5);
    this.page.text(label, Math.max(this.margin + 90, this.size.width - this.margin - width), y - 5, {
      size: 7.5,
      color: COLORS.muted,
    });
    this.page.line(this.margin, y - 16, this.size.width - this.margin, y - 16, {
      stroke: COLORS.line,
    });
  }

  drawFooter() {
    const y = this.margin - 8;
    this.page.line(this.margin, y + 18, this.size.width - this.margin, y + 18, {
      stroke: COLORS.line,
    });
    this.page.text("Documento para revisión humana", this.margin, y + 3, {
      size: 7,
      color: COLORS.muted,
    });
    const pageLabel = `Página ${this.page.pageNumber}`;
    this.page.text(pageLabel, this.size.width - this.margin - estimateTextWidth(pageLabel, 7), y + 3, {
      size: 7,
      color: COLORS.muted,
    });
  }

  ensureSpace(required) {
    if (this.cursorY - required >= this.margin + this.footerReserve) return;
    this.newPage();
  }

  drawMetricCard(x, topY, width, height, label, value, accent = COLORS.teal) {
    const y = topY - height;
    this.page.roundRect(x, y, width, height, 8, {
      fill: COLORS.white,
      stroke: COLORS.line,
      lineWidth: 0.8,
    });
    this.page.roundRect(x + 12, topY - 19, 24, 4, 2, { fill: accent });
    this.page.text(label.toUpperCase(), x + 12, topY - 34, {
      size: 7,
      bold: true,
      color: COLORS.muted,
    });
    const lines = wrapText(value, width - 24, 12, true).slice(0, 3);
    this.page.textLines(lines, x + 12, topY - 53, {
      size: 12,
      bold: true,
      color: COLORS.navy,
      lineHeight: 14,
    });
  }

  renderCover() {
    this.newPage({ cover: true });
    const { width, height } = this.size;
    const heroHeight = 250;
    const heroY = height - this.margin - heroHeight;
    this.page.roundRect(this.margin, heroY, width - this.margin * 2, heroHeight, 18, {
      fill: COLORS.navy,
    });
    this.page.roundRect(width - this.margin - 150, heroY + 118, 126, 126, 63, {
      stroke: COLORS.gold,
      lineWidth: 3,
    });
    this.page.roundRect(this.margin + 20, heroY + heroHeight - 38, 18, 18, 4, {
      fill: COLORS.teal,
    });
    this.page.text("FORGE OS", this.margin + 46, heroY + heroHeight - 34, {
      size: 9,
      bold: true,
      color: COLORS.white,
    });
    this.page.text("PROPUESTA TÉCNICO-COMERCIAL", this.margin + 20, heroY + heroHeight - 82, {
      size: 8,
      bold: true,
      color: COLORS.teal,
    });
    const titleLines = wrapText(this.title, width - this.margin * 2 - 55, 27, true).slice(0, 3);
    this.page.textLines(titleLines, this.margin + 20, heroY + heroHeight - 117, {
      size: 27,
      bold: true,
      color: COLORS.white,
      lineHeight: 30,
    });
    const product = this.summaryText("product");
    this.page.textLines(wrapText(product, width - this.margin * 2 - 55, 12, true).slice(0, 2), this.margin + 20, heroY + 62, {
      size: 12,
      bold: true,
      color: COLORS.gold,
      lineHeight: 14,
    });
    const description = this.readModel.productProfile?.coverDescription ||
      "Resumen comercial de la cotización confirmada, sus valores y fuentes.";
    this.page.textLines(wrapText(description, width - this.margin * 2 - 55, 9), this.margin + 20, heroY + 34, {
      size: 9,
      color: "#C6D3E2",
      lineHeight: 12,
    });

    const map = this.fieldMap();
    const metrics = [
      [map.get("sum_assured") || map.get("current_protection_mxn"), "Protección"],
      [map.get("total_annual_premium") || map.get("annual_premium_with_ave") || map.get("annual_premium"), "Aportación anual"],
      [map.get("payment_years") || map.get("coverage_period"), "Plazo"],
      [map.get("total_recovery_mxn") || map.get("total_recovery") || map.get("total_contributed_mxn"), "Valor proyectado"],
    ];
    const gap = 12;
    const cardWidth = (width - this.margin * 2 - gap) / 2;
    const cardHeight = 82;
    let top = heroY - 20;
    metrics.forEach(([field, fallback], index) => {
      const column = index % 2;
      const row = Math.floor(index / 2);
      const value = field?.status === "CONFIRMED"
        ? flattenValue(field.value, field, this.locale).join(" · ")
        : "Sin dato confirmado";
      this.drawMetricCard(
        this.margin + column * (cardWidth + gap),
        top - row * (cardHeight + gap),
        cardWidth,
        cardHeight,
        field?.label || fallback,
        value,
        index % 2 ? COLORS.gold : COLORS.teal,
      );
    });

    const identityTop = top - 2 * (cardHeight + gap) - 8;
    const identityHeight = 92;
    this.page.roundRect(this.margin, identityTop - identityHeight, width - this.margin * 2, identityHeight, 10, {
      fill: COLORS.surface,
      stroke: COLORS.line,
    });
    const identity = [
      ["Cliente / asegurado", this.summaryText("client")],
      ["Asesor", this.summaryText("advisor")],
      ["Folio", this.summaryText("quoteId")],
      ["Fecha", this.summaryText("acceptedAt")],
    ];
    const itemWidth = (width - this.margin * 2 - 36) / 2;
    identity.forEach(([label, value], index) => {
      const column = index % 2;
      const row = Math.floor(index / 2);
      const x = this.margin + 12 + column * (itemWidth + 12);
      const y = identityTop - 22 - row * 40;
      this.page.text(label.toUpperCase(), x, y, {
        size: 6.8,
        bold: true,
        color: COLORS.muted,
      });
      this.page.textLines(wrapText(value, itemWidth, 9.5, true).slice(0, 2), x, y - 15, {
        size: 9.5,
        bold: true,
        color: COLORS.ink,
        lineHeight: 11,
      });
    });

    this.page.text("A4 vertical · revisión humana", this.margin, this.margin - 4, {
      size: 7,
      color: COLORS.muted,
    });
    const revision = `Revisión ${this.readModel.sourceRevisionHash}`;
    this.page.text(revision, width - this.margin - estimateTextWidth(revision, 7), this.margin - 4, {
      size: 7,
      color: COLORS.muted,
    });
  }

  renderWarnings() {
    const warnings = this.readModel.review?.warnings || [];
    if (!warnings.length) return;
    const width = this.size.width - this.margin * 2;
    const lines = warnings.flatMap((warning) =>
      wrapText(`• ${warning}`, width - 30, 8.5));
    const height = 36 + lines.length * 11;
    this.ensureSpace(height + 12);
    const top = this.cursorY;
    this.page.roundRect(this.margin, top - height, width, height, 8, {
      fill: COLORS.goldSoft,
      stroke: "#ECD39D",
    });
    this.page.roundRect(this.margin, top - height, 5, height, 2, { fill: COLORS.gold });
    this.page.text("LECTURA IMPORTANTE", this.margin + 16, top - 19, {
      size: 7.5,
      bold: true,
      color: "#72500D",
    });
    this.page.textLines(lines, this.margin + 16, top - 37, {
      size: 8.5,
      color: "#72500D",
      lineHeight: 11,
    });
    this.cursorY = top - height - 15;
  }

  fieldPlan(field, width) {
    const raw = field.status === "CONFIRMED"
      ? flattenValue(field.value, field, this.locale)
      : ["Sin dato confirmado"];
    const valueLines = raw.flatMap((line) => wrapText(line, width - 24, 9.5, true));
    return {
      field,
      valueLines,
      height: Math.max(68, 40 + valueLines.length * 12),
    };
  }

  drawFieldCard(plan, x, top, width, height) {
    const projection = plan.field.classification === "PROJECTION";
    const unavailable = plan.field.status !== "CONFIRMED";
    const y = top - height;
    this.page.roundRect(x, y, width, height, 8, {
      fill: projection ? COLORS.goldSoft : unavailable ? COLORS.surface : COLORS.white,
      stroke: projection ? "#ECD39D" : COLORS.line,
      lineWidth: 0.8,
    });
    this.page.text(plan.field.label, x + 12, top - 18, {
      size: 7.5,
      bold: true,
      color: COLORS.muted,
    });
    if (projection) {
      const badge = "PROYECCIÓN";
      this.page.text(badge, x + width - 12 - estimateTextWidth(badge, 6.2, true), top - 18, {
        size: 6.2,
        bold: true,
        color: "#72500D",
      });
    }
    this.page.textLines(plan.valueLines, x + 12, top - 39, {
      size: 9.5,
      bold: !unavailable,
      color: unavailable ? COLORS.muted : COLORS.ink,
      lineHeight: 12,
    });
  }

  renderSection(section) {
    const fields = section.fields || [];
    if (!fields.length) return;
    this.ensureSpace(74);
    this.page.text("DETALLE DE LA PROPUESTA", this.margin, this.cursorY, {
      size: 6.8,
      bold: true,
      color: COLORS.teal,
    });
    this.cursorY -= 18;
    this.page.text(section.title, this.margin, this.cursorY, {
      size: 15,
      bold: true,
      color: COLORS.navy,
    });
    const count = `${section.availableFieldCount} dato${section.availableFieldCount === 1 ? "" : "s"}`;
    this.page.text(count, this.size.width - this.margin - estimateTextWidth(count, 7.2), this.cursorY + 1, {
      size: 7.2,
      color: COLORS.muted,
    });
    this.cursorY -= 22;

    const gap = 10;
    const cardWidth = (this.size.width - this.margin * 2 - gap) / 2;
    for (let index = 0; index < fields.length; index += 2) {
      const left = this.fieldPlan(fields[index], cardWidth);
      const right = fields[index + 1]
        ? this.fieldPlan(fields[index + 1], cardWidth)
        : null;
      const rowHeight = Math.max(left.height, right?.height || 0);
      this.ensureSpace(rowHeight + 12);
      this.drawFieldCard(left, this.margin, this.cursorY, cardWidth, rowHeight);
      if (right) {
        this.drawFieldCard(right, this.margin + cardWidth + gap, this.cursorY, cardWidth, rowHeight);
      }
      this.cursorY -= rowHeight + 10;
    }
    this.cursorY -= 10;
  }

  renderSources() {
    const rows = [];
    const seen = new Set();
    for (const section of this.readModel.sections || []) {
      for (const field of section.fields || []) {
        if (field.status !== "CONFIRMED" || !field.sourcePath) continue;
        const key = `${field.id}|${field.sourcePath}`;
        if (seen.has(key)) continue;
        seen.add(key);
        rows.push(field);
      }
    }
    this.ensureSpace(70);
    this.page.text("TRAZABILIDAD", this.margin, this.cursorY, {
      size: 6.8,
      bold: true,
      color: COLORS.teal,
    });
    this.cursorY -= 18;
    this.page.text("Fuentes del documento", this.margin, this.cursorY, {
      size: 15,
      bold: true,
      color: COLORS.navy,
    });
    this.cursorY -= 24;
    for (const field of rows) {
      const source = `${field.authority || "No disponible"} · ${field.sourcePath}`;
      const sourceLines = wrapText(source, this.size.width - this.margin * 2 - 30, 7.2);
      const height = 30 + sourceLines.length * 9;
      this.ensureSpace(height + 5);
      this.page.line(this.margin, this.cursorY, this.size.width - this.margin, this.cursorY, {
        stroke: COLORS.line,
      });
      this.page.text(field.label, this.margin, this.cursorY - 15, {
        size: 7.5,
        bold: true,
        color: COLORS.ink,
      });
      this.page.textLines(sourceLines, this.margin + 120, this.cursorY - 15, {
        size: 7.2,
        color: COLORS.muted,
        lineHeight: 9,
      });
      this.cursorY -= height;
    }
    this.cursorY -= 8;
  }

  renderDisclaimers() {
    const lines = (this.readModel.disclaimers || []).flatMap((item, index) =>
      wrapText(`${index + 1}. ${item}`, this.size.width - this.margin * 2 - 24, 7.5));
    if (!lines.length) return;
    const height = 26 + lines.length * 10;
    this.ensureSpace(height + 10);
    this.page.roundRect(this.margin, this.cursorY - height, this.size.width - this.margin * 2, height, 7, {
      fill: COLORS.surface,
    });
    this.page.textLines(lines, this.margin + 12, this.cursorY - 18, {
      size: 7.5,
      color: COLORS.muted,
      lineHeight: 10,
    });
    this.cursorY -= height + 8;
  }

  render() {
    this.renderCover();
    this.newPage();
    this.renderWarnings();
    for (const section of this.readModel.sections || []) {
      if (section.id === "identity") continue;
      this.renderSection(section);
    }
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
    objects.set(contentId, `<< /Length ${latin1Bytes(stream).length} >>\nstream\n${stream}endstream`);
    objects.set(pageId,
      `<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${page.width.toFixed(2)} ${page.height.toFixed(2)}] /Resources << /Font << /F1 ${normalFontId} 0 R /F2 ${boldFontId} 0 R >> >> /Contents ${contentId} 0 R >>`,
    );
  }

  objects.set(pagesId, `<< /Type /Pages /Count ${pageIds.length} /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] >>`);
  objects.set(catalogId, `<< /Type /Catalog /Pages ${pagesId} 0 R /PageLayout /OneColumn >>`);
  const pdfDate = String(createdAt || new Date().toISOString())
    .replace(/[-:TZ.]/g, "").slice(0, 14);
  objects.set(infoId,
    `<< /Title ${pdfString(title)} /Author ${pdfString(author)} /Subject ${pdfString(subject)} /Keywords ${pdfString(keywords)} /Creator ${pdfString("Forge OS M05E-005")} /Producer ${pdfString("Forge OS premium portrait PDF generator")} /CreationDate (D:${pdfDate}) >>`,
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
  const text = String.fromCharCode(...bytes);
  if (!text.startsWith("%PDF-1.")) throw new Error("Generated bytes are not a PDF");
  if (!text.includes("%%EOF")) throw new Error("Generated PDF is missing EOF marker");
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
  if (printableDocument.pageOrientation !== "PORTRAIT") {
    throw new TypeError("Printable PDF requires portrait orientation");
  }

  const pageFormat = normalizeFormat(printableDocument.pageFormat);
  const layout = new PremiumQuoteLayout({
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
    subject: `Cotización técnico-comercial · ${product}`,
    keywords: `Forge OS, cotización, portrait, ${product}, ${readModel.sourceRevisionHash}`,
    createdAt,
  });
  assertSafePdf(bytes);
  const immutableBytes = bytes.slice();

  return deepFreeze({
    packetType: QUOTE_PRINTABLE_PDF_TYPE,
    contractVersion: CONTRACT_VERSION,
    status: "PDF_BINARY_READY",
    mediaType: PDF_MEDIA_TYPE,
    fileName: printableDocument.fileName,
    pageFormat,
    pageOrientation: "PORTRAIT",
    pageWidth: PAGE_FORMATS[pageFormat].width,
    pageHeight: PAGE_FORMATS[pageFormat].height,
    pageCount: pages.length,
    byteLength: immutableBytes.length,
    binaryRevisionHash: hash(immutableBytes),
    sourceDocumentId: readModel.documentId,
    sourceRevisionHash: readModel.sourceRevisionHash,
    getBytes() { return immutableBytes.slice(); },
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

  const objectUrl = urlRef.createObjectURL(pdfPacket.toBlob());
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
