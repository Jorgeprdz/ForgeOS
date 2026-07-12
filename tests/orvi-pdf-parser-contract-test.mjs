import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import {
  ORVI_PDF_CURRENCIES,
  ORVI_PDF_PARSER_CONTRACT_ID,
  ORVI_PDF_TIMELINE_COLUMNS,
  ORVI_PDF_TO_PRODUCT_INTELLIGENCE_MAPPING,
  ORVI_PDF_VALUE_STATES,
  assertValidOrviPdfParserEnvelope,
  validateOrviPdfParserEnvelope,
} from "../product-intelligence/quotes/orvi-pdf-parser-contract.js";

const fixtureUrl = new URL("../fixtures/orvi-solucionline-synthetic-expected.json", import.meta.url);
const fixture = JSON.parse(await readFile(fixtureUrl, "utf8"));
const textFixtureUrl = new URL("../fixtures/orvi-solucionline-synthetic-quote.txt", import.meta.url);
const textFixture = await readFile(textFixtureUrl, "utf8");

const fixtureSnapshot = structuredClone(fixture);
const syntheticPages = textFixture.split("\f");
assert.equal(syntheticPages.length, 3, "text fixture must be three-page-equivalent");
assert.equal(textFixture.includes("ORVI SYNTHETIC 10 PAY USD"), true);
assert.equal(textFixture.includes("GUARANTEED VALUES"), true);
assert.equal(textFixture.includes("SIN COSTO"), true);
assert.equal(textFixture.includes("AMPARADO"), true);
assert.equal(textFixture.includes("SOURCE DISPLAYED TOTAL UNRECONCILED"), true);
assert.equal(textFixture.includes("GLOSSARY"), true);
assert.equal(textFixture.includes("NOTES"), true);
assert.equal(textFixture.includes("@"), false);
assert.equal(/\b\d{2}\/\d{2}\/\d{4}\b/.test(textFixture), false);
assert.equal(/client.?name|insured.?name|advisor.?name|email|phone/i.test(textFixture), false);
const validation = validateOrviPdfParserEnvelope(fixture);
assert.equal(validation.valid, true, validation.errors.join(","));
assert.equal(assertValidOrviPdfParserEnvelope(fixture), fixture);
assert.deepEqual(fixture, fixtureSnapshot, "validator must not mutate fixture");

assert.equal(fixture.contract_id, ORVI_PDF_PARSER_CONTRACT_ID);
assert.equal(fixture.synthetic_fixture, true);
assert.equal(fixture.document.currency, "USD", "fixture proves currency is not hardcoded to UDI");
assert.equal(fixture.document.payment_term_years, 10, "fixture proves payment term is not hardcoded to 20");
assert.equal(ORVI_PDF_CURRENCIES.includes("UDI"), true);
assert.equal(ORVI_PDF_CURRENCIES.includes("USD"), true);
assert.equal(ORVI_PDF_VALUE_STATES.includes("explicit_zero"), true);
assert.equal(ORVI_PDF_VALUE_STATES.includes("sin_costo"), true);
assert.equal(ORVI_PDF_VALUE_STATES.includes("amparado"), true);
assert.deepEqual(fixture.guaranteed_values.columns, ORVI_PDF_TIMELINE_COLUMNS);
assert.equal(fixture.guaranteed_values.rows.length, 16);
assert.equal(fixture.guaranteed_values.rows[10].annual_premium.state, "explicit_zero");
assert.equal(fixture.guaranteed_values.rows[10].annual_premium.value, 0);
assert.equal(fixture.coverages[1].annual_premium.state, "sin_costo");
assert.equal(fixture.coverages[1].annual_premium.value, null);
assert.equal(fixture.coverages[1].sum_assured.state, "amparado");
assert.equal(fixture.coverages[1].sum_assured.value, null);
assert.equal(
  fixture.premium_summary.reconciliation.status,
  "source_displayed_total_unreconciled",
);
assert.equal(fixture.premium_summary.reconciliation.source_total_preserved, true);
assert.equal(fixture.premium_summary.reconciliation.recomputed_override_applied, false);
assert.notEqual(
  fixture.premium_summary.displayed_total_with_recommended.value,
  fixture.premium_summary.visible_line_item_sum.value,
);
assert.equal(fixture.ownership.parser_ref, null);
assert.equal(fixture.ownership.runtime_ref, null);
assert.equal(fixture.ownership.renderer_ref, null);
assert.equal(fixture.recommendation, null);
assert.equal(fixture.mxn_projection, null);
assert.equal(
  ORVI_PDF_TO_PRODUCT_INTELLIGENCE_MAPPING["document.payment_term_years"],
  "premium_structure.payment_term_years",
);

const serialized = JSON.stringify(fixture);
assert.equal(serialized.includes("@"), false);
assert.equal(/\b\d{2}\/\d{2}\/\d{4}\b/.test(serialized), false);
assert.equal(/client.?name|insured.?name|advisor.?name|email|phone/i.test(serialized), false);
assert.equal(serialized.includes("Solucionline_"), false);
const forbiddenLocalRoot = ["", "storage", "emulated", "0", "Download", ""].join("/");
assert.equal(serialized.includes(forbiddenLocalRoot), false);

const invalidZero = structuredClone(fixture);
invalidZero.guaranteed_values.rows[10].annual_premium.value = 1;
assert.equal(validateOrviPdfParserEnvelope(invalidZero).valid, false);
assert.equal(
  validateOrviPdfParserEnvelope(invalidZero).errors.some((error) =>
    error.includes("EXPLICIT_ZERO_MUST_EQUAL_ZERO")),
  true,
);

const invalidPrivate = structuredClone(fixture);
invalidPrivate.insured.client_name = "synthetic forbidden";
assert.equal(validateOrviPdfParserEnvelope(invalidPrivate).valid, false);
assert.equal(
  validateOrviPdfParserEnvelope(invalidPrivate).errors.some((error) =>
    error.startsWith("PRIVACY_FORBIDDEN_KEY:")),
  true,
);

const invalidPrivateString = structuredClone(fixture);
invalidPrivateString.notes.push(["synthetic", "marker"].join("@") + ".example");
assert.equal(validateOrviPdfParserEnvelope(invalidPrivateString).valid, false);
assert.equal(
  validateOrviPdfParserEnvelope(invalidPrivateString).errors.some((error) =>
    error.startsWith("PRIVACY_FORBIDDEN_STRING:")),
  true,
);

const invalidOverride = structuredClone(fixture);
invalidOverride.premium_summary.reconciliation.recomputed_override_applied = true;
assert.equal(validateOrviPdfParserEnvelope(invalidOverride).valid, false);
assert.equal(
  validateOrviPdfParserEnvelope(invalidOverride).errors.includes(
    "premium_summary.reconciliation:RECOMPUTED_OVERRIDE_FORBIDDEN",
  ),
  true,
);

const invalidHardcodedCurrency = structuredClone(fixture);
invalidHardcodedCurrency.document.currency = "MXN";
assert.equal(validateOrviPdfParserEnvelope(invalidHardcodedCurrency).valid, false);
assert.equal(
  validateOrviPdfParserEnvelope(invalidHardcodedCurrency).errors.includes(
    "document.currency:UDI_OR_USD_REQUIRED",
  ),
  true,
);

console.log("PASS R15D ORVI PDF parser contract and synthetic fixture", {
  contractId: ORVI_PDF_PARSER_CONTRACT_ID,
  currency: fixture.document.currency,
  paymentTermYears: fixture.document.payment_term_years,
  timelineRows: fixture.guaranteed_values.rows.length,
  explicitZeroRows: fixture.guaranteed_values.rows.filter(
    (row) => row.annual_premium.state === "explicit_zero",
  ).length,
  sourceTotalPreserved: fixture.premium_summary.reconciliation.source_total_preserved,
  parserRef: fixture.ownership.parser_ref,
});
