"use strict";

const {
  assertSafePayload,
} = require("./quote-preview-pdf-result-persistence-contract");

const QUOTE_PREVIEW_PDF_CANONICAL_FIELDS = Object.freeze([
  "name",
  "family",
  "product",
  "insured",
  "sumAssured",
  "annualPremium",
  "plannedOrAvePremium",
  "coveragePeriod",
]);

function assertPlainRecord(value, label) {
  if (
    value === null
    || typeof value !== "object"
    || Array.isArray(value)
  ) {
    throw new TypeError(`${label} must be a plain object`);
  }
}

function preserveNull(value) {
  return value === undefined ? null : value;
}

function isOrviFamily(value) {
  return String(value || "").trim().toUpperCase() === "ORVI";
}

function assertContractAcceptance(packet) {
  const result = assertSafePayload(packet);

  if (
    result === false
    || (
      result
      && typeof result === "object"
      && (
        result.valid === false
        || result.ok === false
      )
    )
  ) {
    throw new TypeError(
      "Quote Preview persistence contract rejected canonical packet",
    );
  }

  return packet;
}

function buildQuotePreviewPdfResultCanonicalPacket(nativeResult = {}, context = {}) {
  assertPlainRecord(nativeResult, "nativeResult");
  assertPlainRecord(context, "context");

  const premiumTable = (
    nativeResult.premiumTable
    && typeof nativeResult.premiumTable === "object"
    && !Array.isArray(nativeResult.premiumTable)
  )
    ? nativeResult.premiumTable
    : {};

  const sourceFamily = context.productFamily ?? context.product_family;
  const orvi = isOrviFamily(sourceFamily);
  const packet = {
    name: preserveNull(context.name),
    family: preserveNull(orvi ? "ORVI" : sourceFamily),
    product: preserveNull(nativeResult.product),
    insured: preserveNull(nativeResult.prospect),
    sumAssured: preserveNull(nativeResult.sumInsured),
    annualPremium: preserveNull(premiumTable.annual),
    plannedOrAvePremium: preserveNull(
      premiumTable.plannedAnnual,
    ),
    coveragePeriod: preserveNull(
      orvi ? nativeResult.paymentTerm : nativeResult.policyTerm,
    ),
  };

  return assertContractAcceptance(packet);
}

module.exports = {
  QUOTE_PREVIEW_PDF_CANONICAL_FIELDS,
  buildQuotePreviewPdfResultCanonicalPacket,
};
