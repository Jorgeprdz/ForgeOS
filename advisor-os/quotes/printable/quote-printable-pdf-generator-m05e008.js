import {
  PDF_MEDIA_TYPE,
  QUOTE_PRINTABLE_PDF_TYPE,
  buildQuotePrintablePdf as buildM05e007Pdf,
  downloadQuotePrintablePdf,
} from "./quote-printable-pdf-generator-m05e007.js";
import { VIDA_MUJER_LAYOUT_ID } from "./quote-printable-product-profile-m05e008.js";

const CONTRACT_VERSION = "M05E008_VIDA_MUJER_COMMERCIAL_PDF_V1";
const PAGE = Object.freeze({
  A4: Object.freeze({ width: 595.28, height: 841.89 }),
  LETTER: Object.freeze({ width: 612, height: 792 }),
});
const C = Object.freeze({
  berry: "#702447",
  berry2: "#8D355B",
  rose: "#C65383",
  rose2: "#D982A7",
  blush: "#FBEAF2",
  blush2: "#FFF5F9",
  gold: "#D9A842",
  goldSoft: "#FFF7E6",
  ink: "#2B1830",
  muted: "#756272",
  line: "#EBD8E2",
  white: "#FFFFFF",
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
    if (estimate(candidate, size, bold) <= maxWidth) {
      line = candidate;
    } else {
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
  const margin = 42;
  const width = page.width - margin * 2;
  const heroHeight = 146;
  const y = page.height - margin - heroHeight;
  page.rect(margin, y, width, heroHeight, { fill: C.berry });
  page.rect(margin, y, 7, heroHeight, { fill: C.rose });
  page.rect(margin + 7, y, 4, heroHeight, { fill: C.gold });
  page.rect(page.width - margin - 96, y + 82, 96, 64, { fill: C.berry2 });
  page.text("FORGE OS", margin + 25, y + heroHeight - 24, {
    size: 8,
    bold: true,
    fill: C.white,
  });
  page.text("PROPUESTA VIDA MUJER", margin + 25, y + heroHeight - 50, {
    size: 7,
    bold: true,
    fill: "#FFD9E8",
  });
  page.text(title, margin + 25, y + heroHeight - 83, {
    size: 25,
    bold: true,
    fill: C.white,
  });
  page.text(summary.product || "Vida Mujer", margin + 25, y + heroHeight - 107, {
    size: 12,
    bold: true,
    fill: "#FFE7A8",
  });
  const meta = [
    summaryText(readModel, "client")
      ? `Cliente: ${summaryText(readModel, "client")}`
      : null,
    summary.paymentYears
      ? `Aportación durante ${summary.paymentYears} años`
      : null,
  ].filter(Boolean).join(" · ");
  if (meta) {
    page.text(meta, margin + 25, y + 18, {
      size: 8,
      fill: "#F8DCE8",
    });
  }
  return y - 24;
}

function drawValueBlock(page, top, label, udi, mxn, note = null) {
  const margin = 42;
  const width = page.width - margin * 2;
  const height = 101;
  const y = top - height;
  page.rect(margin, y, width, height, {
    fill: C.white,
    stroke: C.line,
    lineWidth: 0.9,
  });
  page.text(label, margin + 16, top - 22, {
    size: 12,
    bold: true,
    fill: C.berry,
  });
  if (note) {
    const noteWidth = estimate(note, 7);
    page.text(note, page.width - margin - 16 - noteWidth, top - 21, {
      size: 7,
      fill: C.muted,
    });
  }
  const gap = 10;
  const cardWidth = (width - 32 - gap) / 2;
  const cardY = y + 14;
  const cardHeight = 51;
  const leftX = margin + 16;
  page.rect(leftX, cardY, cardWidth, cardHeight, { fill: C.blush });
  page.rect(leftX, cardY, 5, cardHeight, { fill: C.rose });
  page.text("UDI", leftX + 14, cardY + 33, {
    size: 6.8,
    bold: true,
    fill: C.muted,
  });
  page.text(fmt(udi), leftX + 14, cardY + 11, {
    size: 17,
    bold: true,
    fill: C.berry,
  });

  const rightX = leftX + cardWidth + gap;
  page.rect(rightX, cardY, cardWidth, cardHeight, { fill: C.blush2 });
  page.rect(rightX, cardY, 5, cardHeight, { fill: C.gold });
  page.text("MXN HOY", rightX + 14, cardY + 33, {
    size: 6.8,
    bold: true,
    fill: C.muted,
  });
  page.text(`$${fmt(mxn)}`, rightX + 14, cardY + 11, {
    size: 17,
    bold: true,
    fill: C.berry,
  });
  return y - 14;
}

function drawProtectionCards(page, top, summary) {
  const protections = summary.protections || [];
  if (!protections.length) return top;
  const margin = 42;
  const width = page.width - margin * 2;
  page.text("COBERTURAS CONTRATADAS", margin, top, {
    size: 7,
    bold: true,
    fill: C.rose,
  });
  page.text("Protección en vida", margin, top - 23, {
    size: 16,
    bold: true,
    fill: C.berry,
  });
  let y = top - 42;
  const gap = 8;
  const cardWidth = (width - gap * 2) / 3;
  protections.slice(0, 6).forEach((item, index) => {
    const column = index % 3;
    const row = Math.floor(index / 3);
    const x = margin + column * (cardWidth + gap);
    const cardY = y - row * 66 - 58;
    page.rect(x, cardY, cardWidth, 58, {
      fill: C.blush,
      stroke: C.line,
      lineWidth: 0.6,
    });
    page.text(String(item.status || "Contratada").toUpperCase(), x + 9, cardY + 42, {
      size: 6,
      bold: true,
      fill: C.rose,
    });
    page.textLines(wrap(item.label, cardWidth - 18, 8.2, true).slice(0, 2), x + 9, cardY + 27, {
      size: 8.2,
      bold: true,
      fill: C.berry,
      lineHeight: 9,
    });
    if (finite(item.udi) !== null) {
      page.text(`${fmt(item.udi)} UDI`, x + 9, cardY + 8, {
        size: 6.8,
        fill: C.muted,
      });
    }
  });
  const rows = Math.ceil(Math.min(protections.length, 6) / 3);
  return y - rows * 66 - 8;
}

function drawEvidence(page, summary) {
  const margin = 42;
  const width = page.width - margin * 2;
  const y = 77;
  const labels = [
    ["UDI utilizada", summary.evidence?.udiValue === null ? "-" : `$${fmt(summary.evidence?.udiValue)} MXN`],
    ["Fecha", summary.evidence?.udiDate || "No disponible"],
    ["Fuente", [summary.evidence?.udiSource, summary.evidence?.seriesId].filter(Boolean).join(" · ") || "No disponible"],
  ];
  const gap = 8;
  const cardWidth = (width - gap * 2) / 3;
  labels.forEach(([label, value], index) => {
    const x = margin + index * (cardWidth + gap);
    page.rect(x, y, cardWidth, 52, { fill: C.blush2 });
    page.text(label.toUpperCase(), x + 9, y + 34, {
      size: 6.2,
      bold: true,
      fill: C.muted,
    });
    page.textLines(wrap(value, cardWidth - 18, 8, true).slice(0, 2), x + 9, y + 18, {
      size: 8,
      bold: true,
      fill: C.berry,
      lineHeight: 9,
    });
  });
  page.line(margin, 55, page.width - margin, 55);
  page.text("Vida Mujer · valores actuales con UDI verificada", margin, 39, {
    size: 7,
    fill: C.muted,
  });
}

function drawEndowmentTable(page, top, summary) {
  const margin = 42;
  const width = page.width - margin * 2;
  const columns = [
    { label: "Año", width: 45 },
    { label: "% suma asegurada", width: 92 },
    { label: "Beneficio UDI", width: 112 },
    { label: "MXN proyectado", width: width - 45 - 92 - 112 },
  ];
  let y = top;
  const headerHeight = 34;
  page.rect(margin, y - headerHeight, width, headerHeight, { fill: C.berry });
  let x = margin;
  for (const column of columns) {
    page.textLines(wrap(column.label, column.width - 12, 6.7, true), x + 6, y - 14, {
      size: 6.7,
      bold: true,
      fill: C.white,
      lineHeight: 8,
    });
    x += column.width;
  }
  y -= headerHeight;

  for (const row of summary.endowments || []) {
    const rowHeight = 29;
    page.rect(margin, y - rowHeight, width, rowHeight, {
      fill: C.white,
      stroke: C.line,
      lineWidth: 0.55,
    });
    x = margin;
    const values = [
      String(row.policyYear ?? "-"),
      pct(row.percentage),
      fmt(row.benefitUdi),
      row.benefitMxn === null || row.benefitMxn === undefined
        ? "Pendiente"
        : `$${fmt(row.benefitMxn)}`,
    ];
    values.forEach((value, index) => {
      page.text(value, x + 7, y - 19, {
        size: index === 0 ? 9.5 : 8,
        bold: true,
        fill: index === 0 ? C.rose : C.ink,
      });
      x += columns[index].width;
    });
    y -= rowHeight;
  }
  return y;
}

function drawPcfSection(page, top, summary) {
  const rows = summary.pcfDiseases || [];
  if (!rows.length) return top;
  const margin = 42;
  const width = page.width - margin * 2;
  page.text("PROTECCIÓN PARA LA MUJER", margin, top, {
    size: 7,
    bold: true,
    fill: C.rose,
  });
  page.text("Beneficios PCF", margin, top - 21, {
    size: 15,
    bold: true,
    fill: C.berry,
  });
  let y = top - 34;
  rows.forEach((row, index) => {
    const rowHeight = 26;
    const fill = index % 2 === 0 ? C.blush : C.blush2;
    page.rect(margin, y - rowHeight, width, rowHeight, { fill });
    page.textLines(wrap(row.name, 230, 7.6, true).slice(0, 2), margin + 9, y - 10, {
      size: 7.6,
      bold: true,
      fill: C.berry,
      lineHeight: 8,
    });
    page.text(pct(row.percentage), margin + 250, y - 17, {
      size: 7.4,
      bold: true,
      fill: C.rose,
    });
    page.text(`${fmt(row.benefitUdi)} UDI`, margin + 305, y - 17, {
      size: 7.4,
      bold: true,
      fill: C.ink,
    });
    page.text(`$${fmt(row.benefitMxn)}`, margin + 405, y - 17, {
      size: 7.4,
      bold: true,
      fill: C.ink,
    });
    y -= rowHeight;
  });
  return y;
}

function drawSecondPage(page, readModel, title, summary) {
  const margin = 42;
  const width = page.width - margin * 2;
  page.text("BENEFICIOS EN VIDA", margin, page.height - 54, {
    size: 7,
    bold: true,
    fill: C.rose,
  });
  page.text("Dotales por supervivencia", margin, page.height - 82, {
    size: 21,
    bold: true,
    fill: C.berry,
  });
  page.textLines(
    wrap(
      "Pagos contractuales en UDI y su equivalencia proyectada en pesos para el año exacto de cada entrega.",
      width,
      8.7,
    ),
    margin,
    page.height - 104,
    { size: 8.7, fill: C.muted, lineHeight: 10 },
  );

  let y = drawEndowmentTable(page, page.height - 130, summary);
  const totalHeight = 47;
  page.rect(margin, y - totalHeight - 8, width, totalHeight, { fill: C.blush });
  page.rect(margin, y - totalHeight - 8, 6, totalHeight, { fill: C.rose });
  page.text("TOTAL POR SUPERVIVENCIA · 115%", margin + 18, y - 28, {
    size: 8,
    bold: true,
    fill: C.berry,
  });
  page.text(`${fmt(summary.survivalTotal?.udi)} UDI`, margin + 250, y - 29, {
    size: 9,
    bold: true,
    fill: C.berry,
  });
  page.text(
    summary.survivalTotal?.mxn === null || summary.survivalTotal?.mxn === undefined
      ? "MXN proyectado pendiente"
      : `$${fmt(summary.survivalTotal?.mxn)} MXN proyectado`,
    margin + 350,
    y - 29,
    { size: 8, bold: true, fill: C.berry },
  );
  y -= totalHeight + 28;
  y = drawPcfSection(page, y, summary);

  const notesY = Math.max(70, y - 66);
  page.rect(margin, notesY, width, 58, { fill: C.goldSoft });
  page.rect(margin, notesY, 6, 58, { fill: C.gold });
  const notes = [
    "La suma asegurada y los dotales se expresan contractualmente en UDI.",
    "Los valores futuros en MXN son proyecciones y no están garantizados.",
    "La póliza y la documentación oficial prevalecen sobre este resumen.",
  ];
  let lineY = notesY + 42;
  notes.forEach((note) => {
    page.text(`• ${note}`, margin + 18, lineY, {
      size: 7.3,
      fill: "#72500D",
    });
    lineY -= 14;
  });
  page.line(margin, 55, page.width - margin, 55);
  page.text(`${title} · A4 vertical`, margin, 39, {
    size: 7,
    fill: C.muted,
  });
  const revision = `Revisión ${readModel.sourceRevisionHash}`;
  page.text(revision, page.width - margin - estimate(revision, 7), 39, {
    size: 7,
    fill: C.muted,
  });
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
  objects.set(infoId, `<< /Title ${pdfString(info.title || "Cotización Vida Mujer")} /Author ${pdfString(info.author || "Forge OS")} /Subject ${pdfString("Resumen comercial Vida Mujer")} /Creator ${pdfString("Forge OS M05E-008")} /Producer ${pdfString("Forge OS pink portrait PDF generator")} /CreationDate (D:${pdfDate}) >>`);

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

  let cursor = drawHero(pages[0], readModel, title, summary);
  pages[0].text("LO ESENCIAL", 42, cursor, {
    size: 7,
    bold: true,
    fill: C.rose,
  });
  cursor -= 27;
  pages[0].text("Protección y aportación", 42, cursor, {
    size: 20,
    bold: true,
    fill: C.berry,
  });
  cursor -= 21;
  cursor = drawValueBlock(
    pages[0],
    cursor,
    "Suma asegurada",
    summary.sumAssured?.udi,
    summary.sumAssured?.mxn,
  );
  cursor = drawValueBlock(
    pages[0],
    cursor,
    "Aportación anual",
    summary.annualContribution?.udi,
    summary.annualContribution?.mxn,
    summary.annualContribution?.includesAve
      ? "Incluye AVE de la cotización"
      : null,
  );
  drawProtectionCards(pages[0], cursor, summary);
  drawEvidence(pages[0], summary);
  drawSecondPage(pages[1], readModel, title, summary);

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
    pageOrientation: "PORTRAIT",
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
    readModel?.commercialSummary?.layoutId === VIDA_MUJER_LAYOUT_ID
  ) {
    return buildVidaMujerPdf(options);
  }
  return buildM05e007Pdf(options);
}

export {
  CONTRACT_VERSION,
  PDF_MEDIA_TYPE,
  QUOTE_PRINTABLE_PDF_TYPE,
  buildQuotePrintablePdf,
  downloadQuotePrintablePdf,
};
