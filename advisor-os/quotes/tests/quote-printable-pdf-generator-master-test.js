import assert from "node:assert/strict";

import {
  CONTRACT_VERSION,
  PDF_MEDIA_TYPE,
  QUOTE_PRINTABLE_PDF_TYPE,
  buildQuotePrintablePdf,
  downloadQuotePrintablePdf,
} from "../printable/quote-printable-pdf-generator.js";

const pass = (number, message) =>
  console.log(`PASS ${number} - ${message}`);

function field(id, label, value, options = {}) {
  return {
    id,
    label,
    value,
    unit: options.unit || null,
    classification: options.classification || "FACT",
    sourcePath: options.sourcePath || `calculation.${id}`,
    authority: options.authority || "EXISTING_QUOTE_CALCULATION",
    status: options.status || "CONFIRMED",
    editable: false,
  };
}

function fixture({ pageFormat = "A4", sourceRevisionHash = "abc123" } = {}) {
  const documentId = `quote-printable-${sourceRevisionHash}`;
  const readModel = {
    packetType: "FORGE_QUOTE_PRINTABLE_READ_MODEL",
    status: "READY_FOR_DOCUMENT_COMPOSITION",
    locale: "es-MX",
    generatedAt: "2026-07-30T18:00:00-06:00",
    documentId,
    sourceRevisionHash,
    summary: {
      client: field("client_name", "Cliente", "María López"),
      advisor: field("advisor_name", "Asesor", "Jorge Palacios"),
      quoteId: field("quote_id", "Folio", "Q-001"),
      acceptedAt: field("accepted_at", "Aceptada", "2026-07-30"),
      product: field("product", "Producto", "ORVI 10 PAY USD"),
      productFamily: field("family", "Familia", "ORVI"),
    },
    sections: [
      {
        id: "terms",
        title: "Condiciones principales",
        availableFieldCount: 4,
        fields: [
          field("currency", "Moneda", "USD"),
          field("paymentMode", "Forma de pago", "Anual"),
          field("paymentYears", "Plazo de pago", 10, { unit: "años" }),
          field("coveragePeriod", "Vigencia", "Vitalicia"),
        ],
      },
      {
        id: "protection",
        title: "Protección y coberturas",
        availableFieldCount: 3,
        fields: [
          field("sumAssured", "Suma asegurada", 100000, {
            unit: "USD",
            sourcePath:
              "productIntelligence.protection_summary.basic_sum_assured",
            authority: "PRODUCT_INTELLIGENCE",
          }),
          field("currentProtectionMXN", "Protección actual", 1800000, {
            unit: "MXN",
          }),
          field("optionalCoverages", "Coberturas opcionales", ["BIT", "CII"]),
        ],
      },
      {
        id: "projections",
        title: "Recuperación y escenarios",
        availableFieldCount: 2,
        fields: [
          field("totalRecovery", "Recuperación total", 154000, {
            unit: "USD",
            classification: "PROJECTION",
          }),
          field(
            "scenarios",
            "Escenarios",
            [
              { id: "base", value: 154000 },
              { id: "alto", value: 171000 },
            ],
            { classification: "PROJECTION" },
          ),
        ],
      },
    ],
    review: {
      warnings: [
        "Las proyecciones no son garantías y deben conservar su fuente y fecha.",
      ],
    },
    disclaimers: [
      "Este documento resume una cotización aceptada para revisión humana.",
      "Las condiciones generales, la póliza emitida y la documentación oficial prevalecen.",
      "Las proyecciones y escenarios no constituyen valores garantizados salvo indicación documental expresa.",
    ],
    safety: {
      recalculationAllowed: false,
    },
  };

  const printableDocument = {
    packetType: "FORGE_QUOTE_PRINTABLE_DOCUMENT_HTML",
    status: "PRINTABLE_HTML_READY",
    pageFormat,
    fileName: "cotizacion-maria-lopez-orvi-q-001.pdf",
    sourceDocumentId: documentId,
    sourceRevisionHash,
    safety: {
      recalculationAllowed: false,
    },
  };

  return { readModel, printableDocument };
}

const source = fixture();
const pdf = buildQuotePrintablePdf({
  ...source,
  title: "Cotización ORVI",
  generatedAt: "2026-07-30T18:00:00-06:00",
});

assert.equal(pdf.packetType, QUOTE_PRINTABLE_PDF_TYPE);
assert.equal(pdf.contractVersion, CONTRACT_VERSION);
assert.equal(pdf.status, "PDF_BINARY_READY");
assert.equal(pdf.mediaType, PDF_MEDIA_TYPE);
pass(1, "valid printable quote produces a real PDF packet");

const bytes = pdf.getBytes();
const header = String.fromCharCode(...bytes.slice(0, 8));
const tail = String.fromCharCode(...bytes.slice(-16));
assert.match(header, /^%PDF-1\./);
assert.match(tail, /%%EOF/);
assert.equal(bytes.length, pdf.byteLength);
pass(2, "output contains valid PDF header, EOF and byte length");

assert.ok(pdf.pageCount >= 2);
assert.equal(pdf.pageFormat, "A4");
assert.match(
  String.fromCharCode(...bytes),
  /\/MediaBox \[0 0 595\.28 841\.89\]/,
);
pass(3, "A4 page geometry and multipage composition are explicit");

const letterSource = fixture({ pageFormat: "LETTER" });
const letterPdf = buildQuotePrintablePdf({
  ...letterSource,
  generatedAt: "2026-07-30T18:00:00-06:00",
});
assert.equal(letterPdf.pageFormat, "LETTER");
assert.match(
  String.fromCharCode(...letterPdf.getBytes()),
  /\/MediaBox \[0 0 612\.00 792\.00\]/,
);
pass(4, "Letter page geometry is supported without changing source truth");

for (const forbidden of [
  "/JavaScript",
  "/JS",
  "/OpenAction",
  "/Launch",
  "/URI",
]) {
  assert.equal(String.fromCharCode(...bytes).includes(forbidden), false);
}
pass(5, "PDF contains no script, launch, open-action or URI capability");

const secondPdf = buildQuotePrintablePdf({
  ...fixture(),
  title: "Cotización ORVI",
  generatedAt: "2026-07-30T18:00:00-06:00",
});
assert.equal(secondPdf.binaryRevisionHash, pdf.binaryRevisionHash);
assert.deepEqual(secondPdf.getBytes(), pdf.getBytes());
pass(6, "same source and timestamp generate deterministic PDF bytes");

const changedPdf = buildQuotePrintablePdf({
  ...fixture({ sourceRevisionHash: "def456" }),
  title: "Cotización ORVI",
  generatedAt: "2026-07-30T18:00:00-06:00",
});
assert.notEqual(changedPdf.binaryRevisionHash, pdf.binaryRevisionHash);
assert.notEqual(changedPdf.sourceRevisionHash, pdf.sourceRevisionHash);
pass(7, "source revision changes produce a distinct PDF identity");

const firstCopy = pdf.getBytes();
const secondCopy = pdf.getBytes();
firstCopy[0] = 0;
assert.equal(secondCopy[0], 37);
assert.equal(pdf.getBytes()[0], 37);
pass(8, "PDF bytes are exposed only through defensive copies");

const blob = pdf.toBlob();
assert.equal(blob.type, PDF_MEDIA_TYPE);
assert.equal(blob.size, pdf.byteLength);
pass(9, "PDF packet creates a browser-downloadable application/pdf Blob");

assert.throws(
  () => downloadQuotePrintablePdf({ pdfPacket: pdf }),
  /Explicit human download action is required/,
);
pass(10, "download fails closed without an explicit human action");

let clicked = false;
let appended = false;
let removed = false;
let revoked = false;
const anchor = {
  style: {},
  click() {
    clicked = true;
  },
  remove() {
    removed = true;
  },
};
const download = downloadQuotePrintablePdf({
  pdfPacket: pdf,
  userInitiated: true,
  documentRef: {
    createElement(name) {
      assert.equal(name, "a");
      return anchor;
    },
    body: {
      appendChild(node) {
        assert.equal(node, anchor);
        appended = true;
      },
    },
  },
  urlRef: {
    createObjectURL(value) {
      assert.equal(value.type, PDF_MEDIA_TYPE);
      return "blob:forge-qpd03";
    },
    revokeObjectURL(value) {
      assert.equal(value, "blob:forge-qpd03");
      revoked = true;
    },
  },
});
assert.equal(download.status, "DOWNLOAD_DISPATCHED");
assert.equal(download.networkUsed, false);
assert.equal(download.printExecuted, false);
assert.equal(anchor.download, pdf.fileName);
assert.equal(anchor.href, "blob:forge-qpd03");
assert.equal(clicked && appended && removed && revoked, true);
pass(11, "human download uses a local Blob URL and revokes it after dispatch");

const mismatch = fixture();
mismatch.printableDocument.sourceRevisionHash = "wrong-revision";
assert.throws(
  () => buildQuotePrintablePdf(mismatch),
  /does not match the read model revision/,
);
pass(12, "mismatched printable and read-model revisions are rejected");

const unready = fixture();
unready.readModel.status = "REVIEW_REQUIRED_MISSING_CORE_FIELDS";
assert.throws(
  () => buildQuotePrintablePdf(unready),
  /read model is not ready/,
);
const unreadyDocument = fixture();
unreadyDocument.printableDocument.status = "UNKNOWN";
assert.throws(
  () => buildQuotePrintablePdf(unreadyDocument),
  /Printable document HTML is not ready/,
);
pass(13, "unreviewed or uncomposed inputs fail closed");

assert.deepEqual(pdf.safety, {
  scriptsAllowed: false,
  networkAllowed: false,
  recalculationAllowed: false,
  automaticDownloadAllowed: false,
  downloadExecuted: false,
  printExecuted: false,
  persistenceWritten: false,
  automaticSendAllowed: false,
  humanReviewRequired: true,
});
assert.equal(Object.isFrozen(pdf), true);
assert.equal(Object.isFrozen(pdf.safety), true);
pass(14, "PDF packet preserves default-false effects and immutable safety");

console.log("STATUS=PASS_QPD03_REAL_PDF_GENERATION_AND_DOWNLOAD");
console.log("Quote Printable PDF Generator PASS 14/14");
