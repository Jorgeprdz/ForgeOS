import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  SNAPSHOT_TYPE,
  buildSalesPresentationBrowserContext,
} from "../../docs/static-preview/quote-preview-live/forge-sales-presentation-browser-context-adapter.js";

function pass(index, label) { console.log(`PASS ${index} - ${label}`); }

const snapshot = {
  packetType: SNAPSHOT_TYPE,
  acceptedQuote: { nativeResult: { product: "ORVI" }, context: {} },
  calculation: { product: "ORVI", currency: "UDI", totalContributed: 1200000 },
  productIntelligence: { identity: { detected_product_name: "ORVI" } },
};

const packet = buildSalesPresentationBrowserContext({ snapshot });
assert.equal(packet.status, "REVIEW_READY");
assert.equal(packet.contextReady, true);
pass(1, "complete snapshot is review-ready");

const missing = buildSalesPresentationBrowserContext({
  snapshot: { ...snapshot, productIntelligence: null },
});
assert.equal(missing.status, "HOLD_MISSING_PRODUCT_INTELLIGENCE");
assert.equal(missing.contextReady, false);
pass(2, "missing Product Intelligence blocks");

assert.equal(packet.prospectContext, null);
assert.equal(packet.advisorNotes, null);
assert.equal(packet.clientObjective, null);
pass(3, "optional context remains absent");

const duplicate = buildSalesPresentationBrowserContext({ snapshot });
assert.equal(duplicate.presentationContextId, packet.presentationContextId);
pass(4, "context id is deterministic");

assert.equal(Object.isFrozen(packet), true);
assert.throws(() => { packet.calculation.currency = "MXN"; }, TypeError);
pass(5, "context is immutable");

assert.throws(
  () => buildSalesPresentationBrowserContext({
    snapshot: {
      ...snapshot,
      acceptedQuote: { ...snapshot.acceptedQuote, rawPdf: "forbidden" },
    },
  }),
  /Forbidden raw document key/,
);
pass(6, "raw documents are rejected");

const source = readFileSync(
  new URL("../../docs/static-preview/quote-preview-live/forge-sales-presentation-browser-context-adapter.js", import.meta.url),
  "utf8",
);
assert.doesNotMatch(source, /reasonWhy|REASON_WHY|Benven[uù]|NBA_REASON/);
assert.match(source, /outreachPromptBuilderReused: false/);
pass(7, "unrelated narrative engines are excluded");

console.log("STATUS=PASS_R16G2B3F_BROWSER_CONTEXT_ENGINE_TEST");
console.log("Browser Context Engine PASS 7/7");
