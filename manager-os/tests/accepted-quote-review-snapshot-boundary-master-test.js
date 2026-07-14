import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
  SNAPSHOT_TYPE,
  createAcceptedQuoteReviewSnapshotBoundary,
} from "../../docs/static-preview/quote-preview-live/forge-accepted-quote-review-snapshot.js";

function pass(index, label) {
  console.log(`PASS ${index} - ${label}`);
}

const boundary =
  createAcceptedQuoteReviewSnapshotBoundary();

assert.equal(boundary.getSnapshot(), null);
pass(1, "snapshot begins empty");

const acceptedQuote = {
  nativeResult: {
    product: "ORVI",
    premiumTable: {
      annual: 120000,
    },
  },
  context: {
    productFamily: "ORVI",
  },
  productIntelligence: {
    schema: {
      id: "forge.product_intelligence.orvi",
    },
    ownership: {
      canonical_owner: "product-intelligence",
    },
  },
};

const calculation = {
  totalContributed: 1200000,
  totalRecovery: 1600000,
  currency: "UDI",
  product: "ORVI",
  productIntelligence:
    acceptedQuote.productIntelligence,
};

const acceptedQuoteBefore =
  JSON.stringify(acceptedQuote);
const calculationBefore =
  JSON.stringify(calculation);

const snapshot = boundary.setSnapshot({
  acceptedQuote,
  calculation,
});

assert.equal(
  snapshot.packetType,
  SNAPSHOT_TYPE,
);
assert.equal(snapshot.reviewOnly, true);
assert.equal(
  snapshot.authority.numericTruthOwner,
  "QUOTE_SOURCE_AND_PRODUCT_INTELLIGENCE",
);
assert.equal(
  snapshot.authority.finalAuthority,
  "HUMAN",
);
pass(2, "snapshot exposes canonical review-only authority");

assert.equal(
  JSON.stringify(acceptedQuote),
  acceptedQuoteBefore,
);
assert.equal(
  JSON.stringify(calculation),
  calculationBefore,
);
assert.notEqual(
  snapshot.acceptedQuote,
  acceptedQuote,
);
assert.notEqual(
  snapshot.calculation,
  calculation,
);
pass(3, "snapshot does not mutate or retain source references");

assert.equal(Object.isFrozen(snapshot), true);
assert.equal(
  Object.isFrozen(snapshot.acceptedQuote),
  true,
);
assert.equal(
  Object.isFrozen(
    snapshot.productIntelligence,
  ),
  true,
);
assert.throws(
  () => {
    snapshot.calculation.totalContributed = 1;
  },
  TypeError,
);
pass(4, "snapshot is deeply immutable");

assert.deepEqual(
  snapshot.productIntelligence,
  acceptedQuote.productIntelligence,
);
assert.equal(
  snapshot.safety.promptGenerated,
  false,
);
assert.equal(
  snapshot.safety.slidePlanGenerated,
  false,
);
assert.equal(
  snapshot.safety.exportEnabled,
  false,
);
assert.equal(
  snapshot.safety.sendable,
  false,
);
assert.equal(
  snapshot.safety.crmMutationAllowed,
  false,
);
assert.equal(
  snapshot.safety.quoteMutationAllowed,
  false,
);
assert.equal(
  snapshot.safety.rawPdfAllowed,
  false,
);
pass(5, "snapshot preserves Product Intelligence without execution flags");

assert.equal(
  boundary.getSnapshot(),
  snapshot,
);
boundary.clear();
assert.equal(boundary.getSnapshot(), null);
pass(6, "getter is read-only and clear removes current snapshot");

assert.throws(
  () =>
    boundary.setSnapshot({
      acceptedQuote: {
        nativeResult: {},
        rawPdf: "forbidden",
      },
      calculation: {},
    }),
  /Forbidden binary or raw document key/,
);
assert.throws(
  () =>
    boundary.setSnapshot({
      acceptedQuote: {},
      calculation: {
        pdfBytes: [1, 2, 3],
      },
    }),
  /Forbidden binary or raw document key/,
);
pass(7, "raw PDF and binary-like keys are rejected");

const snapshotWithoutPi =
  boundary.setSnapshot({
    acceptedQuote: {
      nativeResult: {
        product: "UNKNOWN",
      },
      context: {},
    },
    calculation: {
      nativeResult: {},
      context: {},
    },
  });

assert.equal(
  snapshotWithoutPi.productIntelligence,
  null,
);
pass(8, "missing Product Intelligence remains null without invention");

assert.throws(
  () =>
    boundary.setSnapshot({
      acceptedQuote: null,
      calculation: {},
    }),
  /acceptedQuote must be a plain object/,
);
assert.throws(
  () =>
    boundary.setSnapshot({
      acceptedQuote: {},
      calculation: null,
    }),
  /calculation must be a plain object/,
);
pass(9, "both accepted quote and calculation are required");

const bridgeSource = readFileSync(
  new URL(
    "../../docs/static-preview/quote-preview-live/forge-accepted-quote-bridge.js",
    import.meta.url,
  ),
  "utf8",
);

assert.match(
  bridgeSource,
  /getAcceptedQuoteReviewSnapshot/,
);
assert.match(
  bridgeSource,
  /acceptedQuoteReviewSnapshotBoundary\.setSnapshot\(\{/,
);
assert.ok(
  (
    bridgeSource.match(
      /acceptedQuoteReviewSnapshotBoundary\.clear\(\)/g,
    ) || []
  ).length >= 5,
);
assert.match(
  bridgeSource,
  /globalThis\.ForgeAcceptedQuoteBridge = api/,
);
pass(10, "bridge exposes getter and clears stale snapshots");

console.log(
  "STATUS=PASS_R16G2B1_ACCEPTED_QUOTE_REVIEW_SNAPSHOT_BOUNDARY_TEST",
);
console.log(
  "Accepted Quote Review Snapshot Boundary PASS 10/10",
);
