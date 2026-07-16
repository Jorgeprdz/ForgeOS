import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  SNAPSHOT_TYPE,
  buildSalesPresentationBrowserContext,
} from "../../advisor-os/presentation/browser/forge-sales-presentation-browser-context-adapter.js";
import {
  buildSalesPresentationPromptReviewPacket,
} from "../../advisor-os/presentation/browser/forge-sales-presentation-prompt-builder.js";
import {
  buildSalesPresentationSlidePlanReviewPacket,
} from "../../advisor-os/presentation/browser/forge-sales-presentation-slide-plan-generator.js";
import {
  buildSalesPresentationReviewPacket,
} from "../../advisor-os/presentation/browser/forge-sales-presentation-review-packet-builder.js";

function pass(index, label) { console.log(`PASS ${index} - ${label}`); }

const contextPacket = buildSalesPresentationBrowserContext({
  snapshot: {
    packetType: SNAPSHOT_TYPE,
    acceptedQuote: { nativeResult: { product: "ORVI" }, context: {} },
    calculation: { product: "ORVI", currency: "UDI", totalContributed: 1200000 },
    productIntelligence: { identity: { detected_product_name: "ORVI" } },
  },
});
const promptPacket = buildSalesPresentationPromptReviewPacket({ contextPacket });
const slidePlanPacket = buildSalesPresentationSlidePlanReviewPacket({
  contextPacket,
  promptPacket,
});
const review = buildSalesPresentationReviewPacket({
  contextPacket,
  promptPacket,
  slidePlanPacket,
});

assert.equal(review.status, "PENDING_HUMAN_REVIEW");
assert.equal(review.artifactsReadyForReview, true);
pass(1, "complete chain becomes review packet");

assert.equal(review.approval.humanApproved, false);
assert.equal(review.authorization.exportAuthorized, false);
assert.equal(review.authorization.sendAuthorized, false);
pass(2, "approval, export and send gates remain closed");

assert.ok(review.forbiddenActions.includes("INVENT_MISSING_FACTS"));
pass(3, "forbidden actions are explicit");

const duplicate = buildSalesPresentationReviewPacket({
  contextPacket,
  promptPacket,
  slidePlanPacket,
});
assert.equal(duplicate.reviewId, review.reviewId);
pass(4, "review id is deterministic");

assert.equal(Object.isFrozen(review), true);
assert.throws(
  () => { review.authorization.exportAuthorized = true; },
  TypeError,
);
pass(5, "review authorization is immutable");

const bridge = readFileSync(
  new URL("../../docs/static-preview/quote-preview-live/forge-accepted-quote-bridge.js", import.meta.url),
  "utf8",
);
assert.match(bridge, /buildSalesPresentationCoreReviewBundle/);
assert.match(bridge, /getSalesPresentationContextReviewPacket/);
pass(6, "bridge exposes the bundle");

const source = readFileSync(
  new URL("../../advisor-os/presentation/browser/forge-sales-presentation-review-packet-builder.js", import.meta.url),
  "utf8",
);
assert.doesNotMatch(source, /reasonWhy|REASON_WHY|Benven[uù]|NBA_REASON/);
pass(7, "unrelated narrative engines are excluded");

console.log("STATUS=PASS_R16G2B3F_REVIEW_PACKET_ENGINE_TEST");
console.log("Review Packet Engine PASS 7/7");
