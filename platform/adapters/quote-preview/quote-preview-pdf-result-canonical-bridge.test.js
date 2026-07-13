"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");

const {
  QUOTE_PREVIEW_PDF_CANONICAL_FIELDS,
  buildQuotePreviewPdfResultCanonicalPacket,
} = require("./quote-preview-pdf-result-canonical-bridge");

const coordinator = require(
  "./quote-preview-pdf-result-persistence-coordinator",
);

const baselineApi = JSON.parse(
  fs.readFileSync(process.argv[2], "utf8"),
);

const EXPECTED_FIELDS = [
  "name",
  "family",
  "product",
  "insured",
  "sumAssured",
  "annualPremium",
  "plannedOrAvePremium",
  "coveragePeriod",
];

assert.deepEqual(
  QUOTE_PREVIEW_PDF_CANONICAL_FIELDS,
  EXPECTED_FIELDS,
);

assert.equal(
  typeof coordinator.buildQuotePreviewPdfCanonicalPersistenceInput,
  "function",
);

for (const key of baselineApi.keys) {
  assert.ok(
    Object.prototype.hasOwnProperty.call(coordinator, key),
    `existing coordinator export disappeared: ${key}`,
  );
}

assert.equal(
  Object.isFrozen(coordinator),
  baselineApi.frozen,
);

const nativeA = {
  product: "IMAGINA SER",
  prospect: "ASEGURADA A",
  sumInsured: "100000 UDI",
  baseAnnualPremium: "BASE A",
  totalAnnualPremium: "TOTAL A",
  premium: "PREMIUM A",
  premiumTable: {
    annual: "ANUAL NORMALIZADA A",
    plannedAnnual: "PLANEADA A",
  },
  policyTerm: "20 años",
  paymentTerm: "10 años",
  guaranteePeriod: "5 años",
};

const contextA = {
  name: "Cotización A",
  productFamily: "life",
};

const packetA = buildQuotePreviewPdfResultCanonicalPacket(nativeA, contextA);

assert.deepEqual(Object.keys(packetA), EXPECTED_FIELDS);
assert.deepEqual(packetA, {
  name: "Cotización A",
  family: "life",
  product: "IMAGINA SER",
  insured: "ASEGURADA A",
  sumAssured: "100000 UDI",
  annualPremium: "ANUAL NORMALIZADA A",
  plannedOrAvePremium: "PLANEADA A",
  coveragePeriod: "20 años",
});

assert.notEqual(packetA.name, packetA.insured);
assert.notEqual(packetA.annualPremium, nativeA.baseAnnualPremium);
assert.notEqual(packetA.annualPremium, nativeA.totalAnnualPremium);
assert.notEqual(packetA.annualPremium, nativeA.premium);
assert.notEqual(packetA.coveragePeriod, nativeA.paymentTerm);
assert.notEqual(packetA.coveragePeriod, nativeA.guaranteePeriod);

const nativeB = {
  product: "IMAGINA SER PLUS",
  prospect: "ASEGURADA B",
  sumInsured: "200000 UDI",
  premiumTable: {
    annual: "ANUAL NORMALIZADA B",
  },
  policyTerm: "25 años",
  paymentTerm: "15 años",
  guaranteePeriod: "10 años",
};

const contextB = {
  name: "Cotización B",
  product_family: "life",
};

const packetB = buildQuotePreviewPdfResultCanonicalPacket(nativeB, contextB);

assert.deepEqual(Object.keys(packetB), EXPECTED_FIELDS);
assert.equal(packetB.plannedOrAvePremium, null);
assert.notDeepEqual(packetA, packetB);

const noInventedContext = buildQuotePreviewPdfResultCanonicalPacket(
  {
    ...nativeA,
    product: "PRODUCT MUST NOT BECOME FAMILY",
    prospect: "PROSPECT MUST NOT BECOME NAME",
  },
  {
    productFamily: "life",
  },
);

assert.equal(noInventedContext.name, null);
assert.equal(noInventedContext.family, "life");

const orviPacket = buildQuotePreviewPdfResultCanonicalPacket(
  {
    product: "ORVI SINTÉTICO",
    prospect: null,
    sumInsured: "50000 UDI",
    premiumTable: { annual: null, plannedAnnual: null },
    policyTerm: null,
    paymentTerm: "10 años",
  },
  { productFamily: "orvi" },
);
assert.equal(orviPacket.family, "ORVI");
assert.equal(orviPacket.coveragePeriod, "10 años");
assert.equal(orviPacket.name, null);
assert.equal(orviPacket.insured, null);
assert.equal(orviPacket.annualPremium, null);
assert.equal(orviPacket.plannedOrAvePremium, null);

const coordinatorPacket = coordinator.buildQuotePreviewPdfCanonicalPersistenceInput({
  nativeResult: nativeA,
  context: contextA,
});

assert.deepEqual(coordinatorPacket, packetA);

assert.throws(
  () => buildQuotePreviewPdfResultCanonicalPacket(null, contextA),
  /nativeResult must be a plain object/,
);

assert.throws(
  () => buildQuotePreviewPdfResultCanonicalPacket(nativeA, null),
  /context must be a plain object/,
);

console.log("PASS_EXACT_EIGHT_CANONICAL_FIELDS");
console.log("PASS_CONTEXT_AND_ENGINE_OWNERSHIP");
console.log("PASS_NO_SEMANTIC_FALLBACKS");
console.log("PASS_NULL_OPTIONAL_VALUE");
console.log("PASS_SYNTHETIC_DIFFERENTIAL_OUTPUT");
console.log("PASS_COORDINATOR_WRAPPER_ENTRYPOINT");
console.log("PASS_EXISTING_EXPORTS_PRESERVED");
console.log("PASS_FROZEN_STATE_PRESERVED");
console.log("PASS_EXISTING_CONTRACT_VALIDATION");
