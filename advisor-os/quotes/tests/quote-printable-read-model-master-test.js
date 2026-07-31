import assert from "node:assert/strict";

import {
  ACCEPTED_QUOTE_SNAPSHOT_TYPE,
  CONTRACT_VERSION,
  QUOTE_PRINTABLE_READ_MODEL_TYPE,
  buildQuotePrintableReadModel,
} from "../printable/quote-printable-read-model.js";

const pass = (number, message) =>
  console.log(`PASS ${number} - ${message}`);

function fixture(overrides = {}) {
  return {
    packetType: ACCEPTED_QUOTE_SNAPSHOT_TYPE,
    reviewOnly: true,
    acceptedQuote: {
      quoteId: "quote-orvi-001",
      acceptedAt: "2026-07-30T18:00:00-06:00",
      client: {
        fullName: "Cliente de prueba",
      },
      advisor: {
        name: "Jorge Palacios",
      },
      context: {
        productFamily: "ORVI",
      },
      ...overrides.acceptedQuote,
    },
    calculation: {
      product: "ORVI 10 pagos",
      productFamily: "ORVI",
      plan: "10 pagos",
      currency: "USD",
      paymentMode: "Anual",
      paymentYears: 10,
      coveragePeriod: "Vitalicia",
      currentProtectionMXN: 2500000,
      optionalCoverages: ["BIT", "CII"],
      totalContributed: 100000,
      totalContributedMXN: 1800000,
      totalRecovery: 154000,
      totalRecoveryMXN: 2772000,
      monthlyIncomeMXN: 23100,
      annualIncomeMXN: 277200,
      scenarios: [
        { id: "base", value: 154000 },
        { id: "alto", value: 171000 },
      ],
      exchangeRate: {
        value: 18,
        currency: "MXN/USD",
        truth_status: "source_provided",
      },
      calculatedAt: "2026-07-30T17:55:00-06:00",
      ...overrides.calculation,
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
      ...overrides.productIntelligence,
    },
    authority: {
      numericTruthOwner: "QUOTE_SOURCE_AND_PRODUCT_INTELLIGENCE",
      finalAuthority: "HUMAN",
    },
    safety: {
      exportEnabled: false,
      sendable: false,
      crmMutationAllowed: false,
      quoteMutationAllowed: false,
      rawPdfAllowed: false,
    },
  };
}

const model = buildQuotePrintableReadModel({
  reviewSnapshot: fixture(),
  generatedAt: "2026-07-30T18:04:00-06:00",
});

assert.equal(model.packetType, QUOTE_PRINTABLE_READ_MODEL_TYPE);
assert.equal(model.contractVersion, CONTRACT_VERSION);
assert.equal(model.status, "READY_FOR_DOCUMENT_COMPOSITION");
pass(1, "valid accepted quote snapshot becomes a printable read model");

assert.equal(model.summary.client.value, "Cliente de prueba");
assert.equal(model.summary.advisor.value, "Jorge Palacios");
assert.equal(model.summary.product.value, "ORVI 10 PAY USD");
assert.equal(model.summary.product.authority, "PRODUCT_INTELLIGENCE");
pass(2, "client, advisor and canonical product identity are projected");

assert.equal(model.summary.sumAssured.value, 100000);
assert.equal(model.summary.sumAssured.unit, "USD");
assert.equal(
  model.summary.sumAssured.sourcePath,
  "productIntelligence.protection_summary.basic_sum_assured",
);
assert.equal(model.summary.sumAssured.editable, false);
pass(3, "money facts preserve value, unit, source path and read-only state");

const projections = model.sections.find(
  (section) => section.id === "projections",
);
assert.ok(projections);
assert.ok(projections.fields.length >= 5);
assert.equal(
  projections.fields.every(
    (field) => field.classification === "PROJECTION",
  ),
  true,
);
assert.ok(
  model.review.warnings.some((warning) =>
    warning.includes("no son garantías"),
  ),
);
pass(4, "calculated scenarios are explicitly classified as projections");

assert.deepEqual(model.review.unavailableRequiredFields, []);
assert.deepEqual(model.supportedPageFormats, ["A4", "LETTER"]);
assert.equal(model.documentPurpose, "QUOTE_TECHNICAL_COMMERCIAL_RECORD");
pass(5, "document metadata supports A4 and Letter composition");

assert.deepEqual(model.safety, {
  factsEditable: false,
  recalculationAllowed: false,
  productMutationAllowed: false,
  quoteMutationAllowed: false,
  rawPdfAllowed: false,
  automaticSendAllowed: false,
  crmMutationAllowed: false,
  policyMutationAllowed: false,
  taskCreationAllowed: false,
  calendarCreationAllowed: false,
  pdfGenerated: false,
  printExecuted: false,
  persistenceWritten: false,
  humanReviewRequired: true,
});
pass(6, "read model performs no calculation, mutation, persistence or export");

assert.equal(Object.isFrozen(model), true);
assert.equal(Object.isFrozen(model.sections), true);
assert.equal(Object.isFrozen(model.sections[0].fields[0]), true);
assert.throws(
  () => {
    model.summary.product.value = "Mutado";
  },
  TypeError,
);
pass(7, "complete printable model is deeply immutable");

const secondModel = buildQuotePrintableReadModel({
  reviewSnapshot: fixture(),
  generatedAt: "2027-01-01T00:00:00Z",
});
assert.equal(secondModel.documentId, model.documentId);
assert.equal(secondModel.sourceRevisionHash, model.sourceRevisionHash);
pass(8, "document identity is deterministic and independent of render time");

const missingCore = fixture({
  acceptedQuote: {
    client: {},
  },
  calculation: {
    clientName: null,
  },
  productIntelligence: {
    identity: {},
  },
});
missingCore.calculation.product = null;
missingCore.acceptedQuote.product = null;
missingCore.acceptedQuote.nativeResult = {};
const missingModel = buildQuotePrintableReadModel({
  reviewSnapshot: missingCore,
});
assert.equal(
  missingModel.status,
  "REVIEW_REQUIRED_MISSING_CORE_FIELDS",
);
assert.deepEqual(
  [...missingModel.review.unavailableRequiredFields].sort(),
  ["client_name", "product"],
);
assert.equal(missingModel.summary.client.value, null);
assert.equal(missingModel.summary.product.value, null);
pass(9, "missing facts remain unavailable and are never converted to zero");

const unconfirmedMoney = fixture();
unconfirmedMoney.productIntelligence.premium_structure.basic_annual_premium = {
  value: 9000,
  currency: "USD",
  truth_status: "candidate",
};
const unconfirmedModel = buildQuotePrintableReadModel({
  reviewSnapshot: unconfirmedMoney,
});
const premiumSection = unconfirmedModel.sections.find(
  (section) => section.id === "premiums",
);
const annualPremium = premiumSection.fields.find(
  (field) => field.id === "annual_premium",
);
assert.equal(annualPremium.status, "UNAVAILABLE");
assert.equal(annualPremium.value, null);
pass(10, "non-source-provided canonical money is not promoted as fact");

const forbidden = fixture();
forbidden.acceptedQuote.rawPdf = "forbidden";
assert.throws(
  () => buildQuotePrintableReadModel({ reviewSnapshot: forbidden }),
  /Forbidden raw document key/,
);
pass(11, "raw PDF and binary-shaped fields are rejected");

assert.throws(
  () =>
    buildQuotePrintableReadModel({
      reviewSnapshot: {
        ...fixture(),
        packetType: "UNKNOWN_PACKET",
      },
    }),
  /Unsupported accepted quote snapshot/,
);
assert.throws(
  () => buildQuotePrintableReadModel(),
  /reviewSnapshot must be a plain object/,
);
pass(12, "unsupported or missing source packets fail closed");

console.log("STATUS=PASS_QPD01_CANONICAL_QUOTE_PRINTABLE_READ_MODEL");
console.log("Quote Printable Read Model PASS 12/12");
