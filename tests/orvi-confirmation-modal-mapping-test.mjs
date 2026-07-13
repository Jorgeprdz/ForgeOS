import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";

globalThis.document = {
  getElementById() {
    return true;
  },
};

const { buildOrviConfirmationPreview } = await import(
  "../docs/static-preview/quote-preview-live/forge-accepted-quote-bridge.js"
);

const require = createRequire(import.meta.url);
const {
  buildQuotePreviewPdfResultCanonicalPacket,
} = require("../platform/adapters/quote-preview/quote-preview-pdf-result-canonical-bridge.js");
const {
  FIELD_DEFINITIONS,
  fieldLabel,
} = require("../platform/ui/quote-preview/quote-preview-confirmation-popup-host.js");

function money(value, currency) {
  return {
    value,
    currency,
    truth_status: "source_provided",
  };
}

function packet({ premiums = true } = {}) {
  return {
    nativeResult: {
      product: null,
      prospect: null,
      premiumTable: {
        annual: "MUST_NOT_BE_REUSED",
        plannedAnnual: "MUST_NOT_BE_REUSED",
      },
    },
    context: {},
    productIntelligence: {
      schema: { id: "forge.product_intelligence.orvi" },
      ownership: { canonical_owner: "product-intelligence" },
      identity: { detected_product_name: "ORVI SINTÉTICO" },
      premium_structure: {
        payment_term_years: 20,
        basic_annual_premium: premiums ? money(1234.56, "UDI") : null,
        total_annual_premium: premiums ? money(1500, "UDI") : null,
      },
      protection_summary: {
        basic_sum_assured: money(50000, "UDI"),
      },
    },
  };
}

const preview = buildOrviConfirmationPreview(packet());
const fields = buildQuotePreviewPdfResultCanonicalPacket(
  preview.nativeResult,
  preview.context,
);
assert.deepEqual(fields, {
  name: null,
  family: "ORVI",
  product: "ORVI SINTÉTICO",
  insured: null,
  sumAssured: "50,000 UDI",
  annualPremium: "1,234.56 UDI",
  plannedOrAvePremium: "1,500 UDI",
  coveragePeriod: "20 años",
});

const labels = Object.fromEntries(
  FIELD_DEFINITIONS.map((definition) => [
    definition.key,
    fieldLabel(definition, fields),
  ]),
);
assert.equal(labels.coveragePeriod, "Plazo de aportación");
assert.equal(labels.plannedOrAvePremium, "Prima anual total con AVE");

const withoutPremium = buildOrviConfirmationPreview(
  packet({ premiums: false }),
);
const withoutPremiumFields = buildQuotePreviewPdfResultCanonicalPacket(
  withoutPremium.nativeResult,
  withoutPremium.context,
);
assert.equal(withoutPremiumFields.annualPremium, null);
assert.equal(withoutPremiumFields.plannedOrAvePremium, null);
assert.equal(withoutPremiumFields.name, null);
assert.equal(withoutPremiumFields.insured, null);

for (const bundlePath of [
  "../docs/static-preview/quote-preview-live/forge-quote-preview-bundle.js",
  "../docs/quote-preview-live/forge-quote-preview-bundle.js",
]) {
  const bundle = readFileSync(new URL(bundlePath, import.meta.url), "utf8");
  assert.match(bundle, /Plazo de aportación/);
  assert.match(bundle, /orvi \? nativeResult\.paymentTerm : nativeResult\.policyTerm/);
}

console.log("PASS R15M2 ORVI confirmation modal mapping", {
  family: "ORVI",
  canonicalProduct: true,
  canonicalSumAssured: true,
  canonicalPaymentTerm: true,
  premiumsRequireExplicitEvidence: true,
  privateNamesInvented: false,
});
