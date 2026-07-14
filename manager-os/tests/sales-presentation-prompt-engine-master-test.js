import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  SNAPSHOT_TYPE,
  buildSalesPresentationBrowserContext,
} from "../../docs/static-preview/quote-preview-live/forge-sales-presentation-browser-context-adapter.js";
import {
  buildSalesPresentationPromptReviewPacket,
} from "../../docs/static-preview/quote-preview-live/forge-sales-presentation-prompt-builder.js";

function pass(index, label) { console.log(`PASS ${index} - ${label}`); }

const contextPacket = buildSalesPresentationBrowserContext({
  snapshot: {
    packetType: SNAPSHOT_TYPE,
    acceptedQuote: { nativeResult: { product: "ORVI" }, context: {} },
    calculation: { product: "ORVI", totalContributed: 1200000 },
    productIntelligence: { identity: { detected_product_name: "ORVI" } },
  },
});

const packet = buildSalesPresentationPromptReviewPacket({ contextPacket });
assert.equal(packet.status, "REVIEW_READY");
assert.equal(packet.promptGenerated, true);
pass(1, "dedicated prompt is generated");

assert.match(packet.prompt.text, /CONTEXTO AUTORIZADO/);
assert.match(packet.prompt.text, /1200000/);
pass(2, "prompt contains supplied facts");

assert.equal(packet.builder.outreachPromptBuilderReused, false);
assert.equal(packet.safety.exportEnabled, false);
assert.equal(packet.safety.sendable, false);
pass(3, "outreach, export and send remain blocked");

const duplicate = buildSalesPresentationPromptReviewPacket({ contextPacket });
assert.equal(duplicate.promptId, packet.promptId);
pass(4, "prompt id is deterministic");

const holdContext = buildSalesPresentationBrowserContext({
  snapshot: {
    packetType: SNAPSHOT_TYPE,
    acceptedQuote: { nativeResult: {}, context: {} },
    calculation: {},
    productIntelligence: null,
  },
});
const hold = buildSalesPresentationPromptReviewPacket({
  contextPacket: holdContext,
});
assert.equal(hold.status, "HOLD_CONTEXT_NOT_READY");
assert.equal(hold.promptGenerated, false);
pass(5, "incomplete context does not generate prompt");

assert.equal(Object.isFrozen(packet), true);
assert.throws(() => { packet.prompt.text = "changed"; }, TypeError);
pass(6, "prompt packet is immutable");

const source = readFileSync(
  new URL("../../docs/static-preview/quote-preview-live/forge-sales-presentation-prompt-builder.js", import.meta.url),
  "utf8",
);
assert.doesNotMatch(source, /reasonWhy|REASON_WHY|Benven[uù]|NBA_REASON/);
pass(7, "unrelated narrative engines are excluded");

console.log("STATUS=PASS_R16G2B3F_PRESENTATION_PROMPT_ENGINE_TEST");
console.log("Presentation Prompt Engine PASS 7/7");
