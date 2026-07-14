import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  SNAPSHOT_TYPE,
  buildSalesPresentationBrowserContext,
} from "../../docs/static-preview/quote-preview-live/forge-sales-presentation-browser-context-adapter.js";
import {
  buildSalesPresentationPromptReviewPacket,
} from "../../docs/static-preview/quote-preview-live/forge-sales-presentation-prompt-builder.js";
import {
  buildSalesPresentationSlidePlanReviewPacket,
} from "../../docs/static-preview/quote-preview-live/forge-sales-presentation-slide-plan-generator.js";

function pass(index, label) { console.log(`PASS ${index} - ${label}`); }

const contextPacket = buildSalesPresentationBrowserContext({
  snapshot: {
    packetType: SNAPSHOT_TYPE,
    acceptedQuote: { nativeResult: { product: "ORVI" }, context: {} },
    calculation: {
      product: "ORVI",
      currency: "UDI",
      paymentYears: 10,
      totalContributed: 1200000,
      totalRecovery: 1600000,
    },
    productIntelligence: {
      identity: { detected_product_name: "ORVI" },
      premium_structure: { total_annual_premium: 120000 },
      protection_summary: { basic_sum_assured: 2000000 },
    },
  },
});
const promptPacket = buildSalesPresentationPromptReviewPacket({ contextPacket });
const plan = buildSalesPresentationSlidePlanReviewPacket({
  contextPacket,
  promptPacket,
});

assert.equal(plan.status, "PENDING_HUMAN_REVIEW");
assert.equal(plan.slidePlanGenerated, true);
pass(1, "slide plan is generated");

assert.ok(plan.slides.length >= 5);
assert.ok(plan.metrics.factCount >= 5);
pass(2, "slide plan has factual structure");

const allFacts = plan.slides.flatMap(item => item.facts);
assert.ok(allFacts.every(item => item.sourcePath && item.value !== undefined));
pass(3, "every fact has a source path");

assert.ok(allFacts.some(item =>
  item.sourcePath === "calculation.totalRecovery" && item.value === 1600000));
pass(4, "calculated values are copied exactly");

const duplicate = buildSalesPresentationSlidePlanReviewPacket({
  contextPacket,
  promptPacket,
});
assert.equal(duplicate.slidePlanId, plan.slidePlanId);
pass(5, "slide plan id is deterministic");

assert.equal(Object.isFrozen(plan), true);
assert.throws(() => { plan.slides[0].title = "changed"; }, TypeError);
pass(6, "slide plan is immutable");

const source = readFileSync(
  new URL("../../docs/static-preview/quote-preview-live/forge-sales-presentation-slide-plan-generator.js", import.meta.url),
  "utf8",
);
assert.doesNotMatch(source, /reasonWhy|REASON_WHY|Benven[uù]|NBA_REASON|Math\.random|Date\.now/);
pass(7, "plan is deterministic and excludes unrelated engines");

console.log("STATUS=PASS_R16G2B3F_SLIDE_PLAN_ENGINE_TEST");
console.log("Slide Plan Engine PASS 7/7");
