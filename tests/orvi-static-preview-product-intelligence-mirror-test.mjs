import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";

const pairs = [
  [
    "product-intelligence/quotes/orvi-pdf-parser-contract.js",
    "docs/static-preview/quote-preview-live/orvi-product-intelligence/quotes/orvi-pdf-parser-contract.js",
  ],
  [
    "product-intelligence/quotes/orvi-solucionline-pdf-text-parser.js",
    "docs/static-preview/quote-preview-live/orvi-product-intelligence/quotes/orvi-solucionline-pdf-text-parser.js",
  ],
  [
    "product-intelligence/quotes/orvi-pdf-to-product-intelligence.js",
    "docs/static-preview/quote-preview-live/orvi-product-intelligence/quotes/orvi-pdf-to-product-intelligence.js",
  ],
  [
    "product-intelligence/knowledge/orvi-product-intelligence.js",
    "docs/static-preview/quote-preview-live/orvi-product-intelligence/knowledge/orvi-product-intelligence.js",
  ],
  [
    "product-intelligence/analytics/orvi-guaranteed-value-checkpoint-analytics.js",
    "docs/static-preview/quote-preview-live/orvi-product-intelligence/analytics/orvi-guaranteed-value-checkpoint-analytics.js",
  ],
  [
    "product-intelligence/currency/orvi-mxn-projection-authority.js",
    "docs/static-preview/quote-preview-live/orvi-product-intelligence/currency/orvi-mxn-projection-authority.js",
  ],
  [
    "product-intelligence/currency/orvi-mxn-equivalence-adapter.js",
    "docs/static-preview/quote-preview-live/orvi-product-intelligence/currency/orvi-mxn-equivalence-adapter.js",
  ],
  [
    "product-intelligence/views/orvi-dashboard-view-model.js",
    "docs/static-preview/quote-preview-live/orvi-product-intelligence/views/orvi-dashboard-view-model.js",
  ],
  [
    "product-intelligence/runtime/orvi-dashboard-orchestration-readiness.js",
    "docs/static-preview/quote-preview-live/orvi-product-intelligence/runtime/orvi-dashboard-orchestration-readiness.js",
  ],
];

function sha256(path) {
  return createHash("sha256")
    .update(readFileSync(new URL(`../${path}`, import.meta.url)))
    .digest("hex");
}

for (const [canonical, mirror] of pairs) {
  assert.equal(
    sha256(mirror),
    sha256(canonical),
    `${mirror} must remain byte-identical to ${canonical}`,
  );
}

console.log("PASS R15M2A ORVI browser deployment mirrors", {
  mirrorCount: pairs.length,
  byteIdentical: true,
  canonicalOwner: "product-intelligence",
});
