import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
  ACCEPTED_QUOTE_SNAPSHOT_TYPE,
  MISSING_CLIENT_LABEL,
  buildQuotePrintableReadModel,
  normalizePrintableReviewSnapshot,
} from "../advisor-os/quotes/printable/quote-printable-read-model-m05e005.js";
import {
  buildProductSpecificQuotePrintableReadModel,
} from "../advisor-os/quotes/printable/quote-printable-product-profile.js";
import {
  buildQuotePrintableDocument,
} from "../advisor-os/quotes/printable/quote-printable-document-composer-m05e005.js";
import {
  buildQuotePrintablePdf,
} from "../advisor-os/quotes/printable/quote-printable-pdf-generator-m05e005.js";

const root = new URL("../", import.meta.url);
const read = (path) => readFileSync(new URL(path, root), "utf8");

const app = read("docs/static-preview/forge-alive-material3/app.js");
const proof = read("docs/static-preview/forge-alive-material3/index-quote-calculator-parity.html");
const runtime = read("docs/static-preview/forge-alive-material3/quote-runtime-printable-closure-m05e005.js");
const styles = read("docs/static-preview/forge-alive-material3/quote-runtime-printable-closure-m05e005.css");
const controller = read("docs/static-preview/quote-printable-runtime/forge-quote-printable-route-controller-m05e005.js");

const source = {
  packetType: ACCEPTED_QUOTE_SNAPSHOT_TYPE,
  reviewOnly: true,
  acceptedQuote: {
    quoteId: "ORVI-M05E005-001",
    acceptedAt: "2026-07-31T00:25:00-06:00",
    context: { productFamily: "ORVI" },
  },
  calculation: {
    product: "ORVI 99-20 PAGOS UDIS",
    productFamily: "ORVI",
    currency: "UDI",
    paymentYears: 20,
    currentProtectionMXN: 791796.87,
    totalContributed: 58880,
    totalContributedMXN: 518011.11,
    totalRecovery: 52708,
    totalRecoveryMXN: 463711.44,
  },
  productIntelligence: {
    schema: {
      id: "forge.product_intelligence.orvi",
      version: "R15A",
    },
    identity: {
      detected_product_name: "ORVI 99-20 PAGOS UDIS",
    },
    protection_summary: {
      basic_sum_assured: {
        value: 90000,
        currency: "UDI",
        truth_status: "source_provided",
      },
    },
    premium_structure: {
      payment_term_years: 20,
      basic_annual_premium: {
        value: 2154.8,
        currency: "UDI",
        truth_status: "source_provided",
      },
      total_annual_premium: {
        value: 2443.63,
        currency: "UDI",
        truth_status: "source_provided",
      },
    },
  },
};

const normalized = normalizePrintableReviewSnapshot(source);
assert.equal(normalized.acceptedQuote.context.clientName, MISSING_CLIENT_LABEL);

const readModel = buildQuotePrintableReadModel({
  reviewSnapshot: normalized,
  generatedAt: "2026-07-31T00:25:00-06:00",
});
assert.equal(readModel.status, "READY_FOR_DOCUMENT_COMPOSITION");
assert.equal(readModel.summary.client.value, MISSING_CLIENT_LABEL);
assert.deepEqual(readModel.review.unavailableRequiredFields, []);

const profiled = buildProductSpecificQuotePrintableReadModel({
  readModel,
  reviewSnapshot: normalized,
});
const printable = buildQuotePrintableDocument({
  readModel: profiled,
  pageFormat: "A4",
  documentTitle: profiled.productProfile.documentTitle,
});
const pdf = buildQuotePrintablePdf({
  readModel: profiled,
  printableDocument: printable,
  title: profiled.productProfile.documentTitle,
  generatedAt: "2026-07-31T00:25:00-06:00",
});

assert.equal(printable.pageFormat, "A4");
assert.equal(printable.pageOrientation, "PORTRAIT");
assert.match(printable.html, /@page\s*\{\s*size:\s*A4 portrait/i);
assert.match(printable.html, /data-page-orientation="portrait"/);
assert.match(printable.html, /qpd-cover-hero/);
assert.match(printable.html, /--navy:\s*#07172d/i);
assert.match(printable.html, /Propuesta técnico-comercial/);
assert.match(printable.html, /Sin dato confirmado/);
assert.equal(pdf.pageOrientation, "PORTRAIT");
assert.ok(pdf.pageWidth < pdf.pageHeight);
assert.ok(pdf.pageCount >= 2);
assert.ok(pdf.byteLength > 1000);

assert.match(app, /quote-runtime-printable-closure-m05e005\.js\?v=m05e-005/);
assert.match(app, /quoteCalculatorRuntime = "M05E-005"/);
assert.match(proof, /CALCULADORAS M05E-005/);
assert.match(proof, /quote-calculator-parity-005/);
assert.match(controller, /normalizePrintableReviewSnapshot/);
assert.match(controller, /pageOrientation: "PORTRAIT"/);

for (const action of ["preview", "download", "history"]) {
  assert.match(runtime, new RegExp(`data-m05e005-action=\\"${action}\\"`));
}
assert.match(runtime, /aria-label="Ver e imprimir la cotización"/);
assert.match(runtime, /aria-label="Descargar cotización en PDF"/);
assert.match(runtime, /aria-label="Abrir historial de versiones"/);
assert.match(runtime, /MISSING_CLIENT_LABEL = "Sin dato confirmado"/);
assert.match(runtime, /prepareOptionalClient/);
assert.match(runtime, /data-m05e005-legacy-hidden/);
assert.match(runtime, /Aún no hay versiones guardadas/);
assert.doesNotMatch(runtime, /Escribe tu nombre para continuar/);
assert.doesNotMatch(runtime, /Captura el nombre antes de confirmar/);

assert.match(styles, /background:[\s\S]*#07172d/i);
assert.match(styles, /width:\s*2\.75rem/);
assert.match(styles, /height:\s*2\.75rem/);
assert.match(styles, /\.forge-printable-toolbar/);
assert.match(styles, /\.forge-printable-modal__dialog/);

console.log("PASS UI-M05G printable design and UX closure", {
  productiveRuntime: "M05E-005",
  optionalClientIsNonBlocking: true,
  compactDocumentActions: ["printer", "pdf", "history"],
  forgeDarkUiParity: true,
  pageFormat: "A4",
  pageOrientation: pdf.pageOrientation,
  premiumPrintableDesign: true,
  historyVisibleWithUsefulEmptyState: true,
  pdfPages: pdf.pageCount,
  pdfBytes: pdf.byteLength,
});
