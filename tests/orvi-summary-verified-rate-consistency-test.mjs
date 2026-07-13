import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

globalThis.document = {
  getElementById() {
    return true;
  },
};

const {
  buildOrviSummaryPaymentLine,
  formatOrviRateMetadataLine,
  formatUdiWithMxn,
  resolveAcceptedRateMetadata,
} = await import(
  "../docs/static-preview/quote-preview-live/forge-benefit-summary-renderer.js"
);

const verifiedCalculation = {
  productFamily: "orvi",
  currency: "UDI",
  paymentYears: 20,
  orviRateMetadata: {
    stale: false,
    rate_key: "UDI_MXN",
    value: 9.123456,
    source: "SYNTHETIC_VERIFIED_SOURCE",
    source_date: "2099-01-01",
    source_mode: "SYNTHETIC_TEST",
  },
};

const verified = resolveAcceptedRateMetadata(verifiedCalculation);
assert.equal(verified.currentUdiValue, 9.123456);
assert.equal(
  formatUdiWithMxn(100, "UDI", 912.3456, verified).some((line) =>
    line.includes("MXN pendiente"),
  ),
  false,
);
assert.equal(
  buildOrviSummaryPaymentLine(verifiedCalculation),
  "UDI · 20 años de aportación",
);
assert.match(formatOrviRateMetadataLine(verified), /9\.1235/);

for (const invalidMetadata of [
  { ...verifiedCalculation.orviRateMetadata, stale: true },
  { ...verifiedCalculation.orviRateMetadata, value: null },
  { ...verifiedCalculation.orviRateMetadata, rate_key: "USD_MXN_FIX" },
  { ...verifiedCalculation.orviRateMetadata, source: null },
  { ...verifiedCalculation.orviRateMetadata, source_date: null },
  { ...verifiedCalculation.orviRateMetadata, source_mode: "UNAUTHORIZED" },
]) {
  const rejected = resolveAcceptedRateMetadata({
    ...verifiedCalculation,
    orviRateMetadata: invalidMetadata,
  });
  assert.equal(rejected, null);
  assert.match(
    formatUdiWithMxn(100, "UDI", 912.3456, rejected).join(" · "),
    /MXN pendiente: falta valor UDI verificado/,
  );
}

const rendererSource = readFileSync(
  new URL(
    "../docs/static-preview/quote-preview-live/forge-benefit-summary-renderer.js",
    import.meta.url,
  ),
  "utf8",
);
assert.doesNotMatch(rendererSource, /UDI_MXN[^\n]{0,80}(?:value|rate)\s*[:=]\s*\d/);

console.log("PASS R15M2 ORVI verified-rate summary consistency", {
  validRateRemovesFalsePending: true,
  invalidRatePreservesPending: true,
  rateHardcoded: false,
  paymentSummary: "currency_and_payment_term_only",
});
