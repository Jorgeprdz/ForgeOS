import {
  PDF_MEDIA_TYPE,
  QUOTE_PRINTABLE_PDF_TYPE,
  buildQuotePrintablePdf as buildGenericQuotePrintablePdf,
  downloadQuotePrintablePdf,
} from "./quote-printable-pdf-generator-m05e005.js";

const CONTRACT_VERSION = "M05E007_ORVI_COMMERCIAL_PDF_V1";
const PAGE = Object.freeze({
  A4: Object.freeze({ width: 595.28, height: 841.89 }),
  LETTER: Object.freeze({ width: 612, height: 792 }),
});
const C = Object.freeze({
  navy: "#07172D",
  teal: "#18B8B1",
  gold: "#D9A842",
  ink: "#142033",
  muted: "#68758A",
  line: "#DFE6EF",
  surface: "#F4F7FB",
  white: "#FFFFFF",
  tealSoft: "#E8F7F5",
  goldSoft: "#FFF7E6",
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

function finite(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function fmt(value, locale = "es-MX") {
  const number = finite(value);
  return number === null
    ? "—"
    : new Intl.NumberFormat(locale, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(number);
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
  const heroHeight = 158;
  const y = page.height - margin - heroHeight;
  page.rect(margin, y, width, heroHeight, { fill: C.navy });
  page.rect(margin, y, 7, heroHeight, { fill: C.teal });
  page.text("FORGE OS", margin + 22, y + heroHeight - 24, {
    size: 8,
    bold: true,
    fill: C.white,
  });
  page.text("PROPUESTA COMERCIAL", margin + 22, y + heroHeight - 52, {
    size: 7,
    bold: true,
    fill: "#8FE6E2",
  });
  page.text(title, margin + 22, y + heroHeight - 85, {
    size: 26,
    bold: true,
    fill: C.white,
  });
  page.text(summary.product || "ORVI", margin + 22, y + heroHeight - 110, {
    size: 12,
    bold: true,
    fill: "#F6CF79",
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
    page.text(meta, margin + 22, y + 20, {
      size: 8,
      fill: "#C8D4E1",
    });
  }
  return y - 28;
}

function drawValueBlock(page, top, label, udi, mxn) {
  const margin = 42;
  const width = page.width - margin * 2;
  const height = 118;
  const y = top - height;
  page.rect(margin, y, width, height, {
    fill: C.white,
    stroke: C.line,
    lineWidth: 0.9,
  });
  page.text(label, margin + 18, top - 24, {
    size: 13,
    bold: true,
    fill: C.navy,
  });
  const gap = 12;
  const cardWidth = (width - 36 - gap) / 2;
  const cardY = y + 18;
  const cardHeight = 58;
  page.rect(margin + 18, cardY, cardWidth, cardHeight, {
    fill: C.surface,
  });
  page.rect(margin + 18, cardY, 5, cardHeight, { fill: C.teal });
  page.text("UDI", margin + 32, cardY + 39, {
    size: 7,
    bold: true,
    fill: C.muted,
  });
  page.text(fmt(udi), margin + 32, cardY + 14, {
    size: 18,
    bold: true,
    fill: C.navy,
  });

  const rightX = margin + 18 + cardWidth + gap;
  page.rect(rightX, cardY, cardWidth, cardHeight, {
    fill: C.surface,
  });
  page.rect(rightX, cardY, 5, cardHeight, { fill: C.gold });
  page.text("MXN HOY", rightX + 14, cardY + 39, {
    size: 7,
    bold: true,
    fill: C.muted,
  });
  page.text(`$${fmt(mxn)}`, rightX + 14, cardY + 14, {
    size: 18,
    bold: true,
    fill: C.navy,
  });
  return y - 16;
}

function drawEvidence(page, summary) {
  const margin = 42;
  const top = 142;
  const width = page.width - margin * 2;
  const labels = [
    ["UDI utilizada", summary.evidence?.udiValue === null ? "—" : `$${fmt(summary.evidence?.udiValue)} MXN`],
    ["Fecha", summary.evidence?.udiDate || "No disponible"],
    ["Fuente", [summary.evidence?.udiSource, summary.evidence?.seriesId].filter(Boolean).join(" · ") || "No disponible"],
  ];
  const gap = 8;
  const cardWidth = (width - gap * 2) / 3;
  labels.forEach(([label, value], index) => {
    const x = margin + index * (cardWidth + gap);
    page.rect(x, top - 58, cardWidth, 58, { fill: C.surface });
    page.text(label.toUpperCase(), x + 10, top - 18, {
      size: 6.5,
      bold: true,
      fill: C.muted,
    });
    page.textLines(wrap(value, cardWidth - 20, 8.5, true).slice(0, 2), x + 10, top - 37, {
      size: 8.5,
      bold: true,
      fill: C.navy,
      lineHeight: 10,
    });
  });
  page.line(margin, 56, page.width - margin, 56);
  page.text("Valores actuales con UDI verificada", margin, 40, {
    size: 7,
    fill: C.muted,
  });
}

function drawCheckpointPage(page, readModel, title, summary) {
  const margin = 42;
  const width = page.width - margin * 2;
  page.text("PROYECCIÓN DEL PLAN", margin, page.height - 58, {
    size: 7,
    bold: true,
    fill: C.teal,
  });
  page.text("Recuperación y suma asegurada", margin, page.height - 87, {
    size: 21,
    bold: true,
    fill: C.navy,
  });
  const intro = "En cada checkpoint se presentan juntas la recuperación y la protección, primero en UDI y después en MXN proyectados.";
  page.textLines(wrap(intro, width, 9), margin, page.height - 110, {
    size: 9,
    fill: C.muted,
    lineHeight: 11,
  });

  const columns = [
    { label: "Año", width: 42 },
    { label: "Recuperación UDI", width: 98 },
    { label: "Recuperación MXN", width: 110 },
    { label: "Suma asegurada UDI", width: 105 },
    { label: "Suma asegurada MXN", width: width - 42 - 98 - 110 - 105 },
  ];
  let y = page.height - 156;
  const headerHeight = 46;
  page.rect(margin, y - headerHeight, width, headerHeight, { fill: C.navy });
  let x = margin;
  for (const column of columns) {
    page.textLines(wrap(column.label, column.width - 12, 6.8, true), x + 6, y - 17, {
      size: 6.8,
      bold: true,
      fill: C.white,
      lineHeight: 8,
    });
    x += column.width;
  }
  y -= headerHeight;

  const rows = summary.checkpoints || [];
  for (const row of rows) {
    const rowHeight = 56;
    page.rect(margin, y - rowHeight, width, rowHeight, {
      fill: C.white,
      stroke: C.line,
      lineWidth: 0.7,
    });
    x = margin;
    const values = [
      String(row.policyYear ?? "—"),
      fmt(row.recoveryUdi),
      `$${fmt(row.recoveryMxn)}`,
      fmt(row.sumAssuredUdi),
      `$${fmt(row.sumAssuredMxn)}`,
    ];
    values.forEach((value, index) => {
      page.textLines(wrap(value, columns[index].width - 12, index === 0 ? 11 : 8.6, true), x + 6, y - 23, {
        size: index === 0 ? 11 : 8.6,
        bold: true,
        fill: index === 0 ? C.teal : C.ink,
        lineHeight: 10,
      });
      x += columns[index].width;
    });
    y -= rowHeight;
  }

  const growth = finite(summary.evidence?.annualGrowthRate);
  const growthText = growth === null
    ? ""
    : ` con supuesto de ${fmt(Math.abs(growth) <= 1 ? growth * 100 : growth)}% anual`;
  const notes = [
    "Las cifras en UDI son las referencias del plan.",
    `Las equivalencias futuras en MXN son proyecciones${growthText}; no están garantizadas.`,
    "La póliza y la documentación oficial prevalecen sobre este resumen.",
  ];
  const notesHeight = 92;
  const notesY = Math.max(88, y - notesHeight - 20);
  page.rect(margin, notesY, width, notesHeight, { fill: C.goldSoft });
  page.rect(margin, notesY, 6, notesHeight, { fill: C.gold });
  page.text("CÓMO LEER ESTOS VALORES", margin + 18, notesY + notesHeight - 20, {
    size: 7,
    bold: true,
    fill: "#72500D",
  });
  let lineY = notesY + notesHeight - 40;
  notes.forEach((note) => {
    const lines = wrap(`• ${note}`, width - 36, 8.2);
    page.textLines(lines, margin + 18, lineY, {
      size: 8.2,
      fill: "#72500D",
      lineHeight: 10,
    });
    lineY -= lines.length * 10 + 4;
  });
  page.line(margin, 56, page.width - margin, 56);
  page.text(`${title} · A4 vertical`, margin, 40, {
    size: 7,
    fill: C.muted,
  });
  const revision = `Revisión ${readModel.sourceRevisionHash}`;
  page.text(revision, page.width - margin - estimate(revision, 7), 40, {
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
  objects.set(infoId, `<< /Title ${pdfString(info.title || "Cotización ORVI")} /Author ${pdfString(info.author || "Forge OS")} /Subject ${pdfString("Resumen comercial ORVI")} /Creator ${pdfString("Forge OS M05E-007")} /Producer ${pdfString("Forge OS commercial portrait PDF generator")} /CreationDate (D:${pdfDate}) >>`);

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

function buildOrviPdf({
  readModel,
  printableDocument,
  title = "Cotización ORVI",
  generatedAt = null,
}) {
  const format = String(printableDocument.pageFormat || "A4").toUpperCase();
  const size = PAGE[format] || PAGE.A4;
  const summary = readModel.commercialSummary;
  const pages = [new Page(size), new Page(size)];
  const top = drawHero(pages[0], readModel, title, summary);
  let cursor = top;
  pages[0].text("LO ESENCIAL", 42, cursor, {
    size: 7,
    bold: true,
    fill: C.teal,
  });
  cursor -= 28;
  pages[0].text("Protección y aportación", 42, cursor, {
    size: 20,
    bold: true,
    fill: C.navy,
  });
  cursor -= 22;
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
  );
  pages[0].rect(42, cursor - 42, size.width - 84, 42, {
    fill: C.tealSoft,
  });
  pages[0].text("PLAZO DE APORTACIÓN", 56, cursor - 17, {
    size: 7,
    bold: true,
    fill: C.muted,
  });
  pages[0].text(`${summary.paymentYears || "—"} años`, size.width - 112, cursor - 20, {
    size: 12,
    bold: true,
    fill: C.navy,
  });
  drawEvidence(pages[0], summary);
  drawCheckpointPage(pages[1], readModel, title, summary);

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
    readModel?.productProfile?.id === "ORVI" &&
    readModel?.commercialSummary?.layoutId ===
      "ORVI_COMMERCIAL_THREE_BLOCKS_V1"
  ) {
    return buildOrviPdf(options);
  }
  return buildGenericQuotePrintablePdf(options);
}

export {
  CONTRACT_VERSION,
  PDF_MEDIA_TYPE,
  QUOTE_PRINTABLE_PDF_TYPE,
  buildQuotePrintablePdf,
  downloadQuotePrintablePdf,
};
