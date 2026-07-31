import assert from "node:assert/strict";

import {
  ACCEPTED_QUOTE_SNAPSHOT_TYPE,
  buildQuotePrintableReadModel,
} from "../printable/quote-printable-read-model.js";
import {
  CONTRACT_VERSION,
  QUOTE_PRINTABLE_DOCUMENT_TYPE,
  buildQuotePrintableDocument,
} from "../printable/quote-printable-document-composer.js";

const pass = (number, message) =>
  console.log(`PASS ${number} - ${message}`);

function snapshot({ clientName = "Cliente Álvarez" } = {}) {
  return {
    packetType: ACCEPTED_QUOTE_SNAPSHOT_TYPE,
    acceptedQuote: {
      quoteId: "Q-2026/001",
      acceptedAt: "2026-07-30T18:00:00-06:00",
      client: { fullName: clientName },
      advisor: { name: "Jorge Palacios" },
      context: { productFamily: "ORVI" },
    },
    calculation: {
      product: "ORVI 10 pagos",
      productFamily: "ORVI",
      plan: "10 pagos",
      currency: "USD",
      paymentMode: "Anual",
      paymentYears: 10,
      coveragePeriod: "Vitalicia",
      totalContributed: 100000,
      totalRecovery: 154000,
      scenarios: [
        { scenario: "Base", value: 154000 },
        { scenario: "Alto", value: 171000 },
      ],
      calculatedAt: "2026-07-30T17:55:00-06:00",
    },
    productIntelligence: {
      schema: {
        id: "forge.product_intelligence.orvi",
        version: "1.0.0",
      },
      identity: {
        detected_product_name: "ORVI 10 PAY USD",
      },
      protection_summary: {
        basic_sum_assured: {
          value: 100000,
          currency: "USD",
          truth_status: "source_provided",
        },
      },
      premium_structure: {
        payment_term_years: 10,
        basic_annual_premium: {
          value: 9000,
          currency: "USD",
          truth_status: "source_provided",
        },
        total_annual_premium: {
          value: 10000,
          currency: "USD",
          truth_status: "source_provided",
        },
      },
      provenance: {
        source_date: "2026-07-30",
      },
    },
  };
}

function readModel(options = {}) {
  return buildQuotePrintableReadModel({
    reviewSnapshot: snapshot(options),
    generatedAt: "2026-07-30T18:04:00-06:00",
  });
}

const a4 = buildQuotePrintableDocument({
  readModel: readModel(),
  pageFormat: "A4",
});

assert.equal(a4.packetType, QUOTE_PRINTABLE_DOCUMENT_TYPE);
assert.equal(a4.contractVersion, CONTRACT_VERSION);
assert.equal(a4.status, "PRINTABLE_HTML_READY");
assert.equal(a4.pageFormat, "A4");
pass(1, "ready read model becomes a printable A4 document");

assert.match(a4.html, /@page\s*\{[\s\S]*size:\s*A4/i);
assert.match(a4.html, /data-page-format="A4"/);
assert.match(a4.html, /Documento técnico-comercial/);
pass(2, "A4 page contract and commercial cover are present");

const letter = buildQuotePrintableDocument({
  readModel: readModel(),
  pageFormat: "letter",
});
assert.equal(letter.pageFormat, "LETTER");
assert.match(letter.html, /size:\s*Letter/i);
assert.match(letter.html, /data-page-format="LETTER"/);
pass(3, "Letter format is normalized and composed independently");

assert.equal(
  a4.fileName,
  "cotizacion-cliente-alvarez-orvi-10-pay-usd-q-2026-001.pdf",
);
assert.match(a4.html, /Cliente Álvarez/);
assert.match(a4.html, /ORVI 10 PAY USD/);
assert.match(a4.html, /Jorge Palacios/);
pass(4, "filename and cover identity are deterministic and human-readable");

for (const section of [
  "Datos de la cotización",
  "Condiciones principales",
  "Protección y coberturas",
  "Primas y aportaciones",
  "Recuperación y escenarios",
  "Fuente y vigencia de los datos",
]) {
  assert.match(a4.html, new RegExp(section));
}
pass(5, "all available quote sections are rendered");

assert.match(a4.html, /qpd-badge--projection/);
assert.match(a4.html, />Proyección</);
assert.match(a4.html, /no son garantías/);
pass(6, "projection facts remain visibly distinguished from confirmed facts");

assert.match(a4.html, /Fuentes del documento/);
assert.match(
  a4.html,
  /productIntelligence\.protection_summary\.basic_sum_assured/,
);
assert.match(a4.html, /PRODUCT_INTELLIGENCE/);
pass(7, "field authority and source paths remain auditable");

const hostile = buildQuotePrintableDocument({
  readModel: readModel({
    clientName: '<script>alert("x")</script> Cliente',
  }),
});
assert.doesNotMatch(hostile.html, /<script\b/i);
assert.match(
  hostile.html,
  /&lt;script&gt;alert\(&quot;x&quot;\)&lt;\/script&gt; Cliente/,
);
pass(8, "client content is escaped and cannot inject script");

assert.doesNotMatch(a4.html, /https?:\/\//i);
assert.doesNotMatch(a4.html, /window\.print|\.print\(\)/i);
assert.equal(a4.safety.selfContained, true);
assert.equal(a4.safety.networkAllowed, false);
assert.equal(a4.safety.printExecuted, false);
assert.equal(a4.safety.pdfGenerated, false);
pass(9, "composer remains self-contained and performs no print or PDF effect");

assert.throws(
  () =>
    buildQuotePrintableDocument({
      readModel: readModel(),
      pageFormat: "LEGAL",
    }),
  /Unsupported page format/,
);
pass(10, "unsupported page formats fail closed");

const incompleteSnapshot = snapshot();
incompleteSnapshot.acceptedQuote.client = {};
incompleteSnapshot.calculation.product = null;
incompleteSnapshot.productIntelligence.identity = {};
const incompleteReadModel = buildQuotePrintableReadModel({
  reviewSnapshot: incompleteSnapshot,
});
assert.equal(
  incompleteReadModel.status,
  "REVIEW_REQUIRED_MISSING_CORE_FIELDS",
);
assert.throws(
  () => buildQuotePrintableDocument({ readModel: incompleteReadModel }),
  /requires human review before composition/,
);
pass(11, "documents with missing core identity cannot be composed");

assert.equal(Object.isFrozen(a4), true);
assert.equal(Object.isFrozen(a4.safety), true);
assert.throws(
  () => {
    a4.safety.pdfGenerated = true;
  },
  TypeError,
);
pass(12, "printable document result and safety contract are immutable");

console.log("STATUS=PASS_QPD02_A4_LETTER_DOCUMENT_COMPOSER");
console.log("Quote Printable Document Composer PASS 12/12");
