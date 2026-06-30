"use strict";

const assert = require("assert");
const fs = require("fs");

const {
  buildManagerMickBehaviorContextBridge
} = require("../external-context-bridge/manager-mick-behavior-context-bridge");

let total = 0;
let passed = 0;

function test(name, fn) {
  total += 1;
  try {
    fn();
    passed += 1;
    console.log(`PASS ${name}`);
  } catch (error) {
    console.error(`FAIL ${name}`);
    console.error(error);
    process.exitCode = 1;
  }
}

function fullInput(extra = {}) {
  return {
    requestedUse: "BEHAVIOR_REVIEW_CONTEXT",
    reviewPlanContext: {
      followupConsistencyReviewPlan: { topic: "follow-up review" },
      activityRhythmReviewPlan: { topic: "activity rhythm" }
    },
    coachingContext: {
      habitConsistencyContext: { topic: "habit consistency" },
      supportNeedContext: { topic: "support" }
    },
    dashboardContext: { activityRhythmContext: { topic: "dashboard rhythm" } },
    forecastContext: { supportCoachingForecastContext: { topic: "forecast support" } },
    metricsContext: { followupContext: { topic: "metric follow-up" } },
    rollups: [{ period: "2026-06" }],
    evidenceRefs: ["ev-1"],
    sourceOwners: ["manager-os"],
    freshness: [{ status: "CURRENT" }],
    ...extra
  };
}

console.log("\nFORGE MANAGER MICK BEHAVIOR CONTEXT BRIDGE MASTER TEST v1.0\n");

test("Builds Mick behavior review context only", () => {
  const result = buildManagerMickBehaviorContextBridge(fullInput());
  assert.strictEqual(result.behaviorReviewPacket.consumer, "MICK");
  assert.strictEqual(result.behaviorReviewPacket.exportType, "BEHAVIOR_REVIEW_CONTEXT");
  assert.strictEqual(result.behaviorReviewPacket.contextOnly, true);
  assert(result.behaviorReviewPacket.behaviorReviewAreas.length >= 4);
});

test("Mick bridge does not create disciplinary or HR truth", () => {
  const result = buildManagerMickBehaviorContextBridge(fullInput());
  assert.strictEqual(result.truthFlags.createsDisciplineTruth, false);
  assert.strictEqual(result.truthFlags.createsDisciplinaryActionTruth, false);
  assert.strictEqual(result.truthFlags.createsHRTruth, false);
});

test("Mick bridge does not create personality judgment or surveillance truth", () => {
  const result = buildManagerMickBehaviorContextBridge(fullInput());
  assert.strictEqual(result.truthFlags.createsPersonalityJudgment, false);
  assert.strictEqual(result.truthFlags.createsSurveillanceTruth, false);
});

test("Mick bridge does not own tasks", () => {
  const result = buildManagerMickBehaviorContextBridge(fullInput());
  assert.strictEqual(result.truthFlags.ownsTasks, false);
  assert.strictEqual(result.actionFlags.createsTask, false);
});

test("Behavior review areas include habit and support context", () => {
  const result = buildManagerMickBehaviorContextBridge(fullInput());
  const keys = result.behaviorReviewPacket.behaviorReviewAreas.map((item) => item.key);
  assert(keys.includes("HABIT_CONSISTENCY_CONTEXT"));
  assert(keys.includes("SUPPORT_NEED_CONTEXT"));
});

test("Missing behavior context does not become zero", () => {
  const result = buildManagerMickBehaviorContextBridge({
    evidenceRefs: ["ev"],
    sourceOwners: ["owner"],
    freshness: ["CURRENT"]
  });
  assert(result.missingData.includes("MISSING_REVIEW_PLAN_CONTEXT"));
  assert(result.unknownSignals.includes("MISSING_COACHING_CONTEXT"));
});

test("Forbidden uses are blocked", () => {
  const result = buildManagerMickBehaviorContextBridge(fullInput({ requestedUse: "MICK_DISCIPLINARY_TRUTH" }));
  assert.strictEqual(result.status, "BLOCKED");
});

test("Allowed uses are allowed", () => {
  const result = buildManagerMickBehaviorContextBridge(fullInput());
  assert.strictEqual(result.status, "READY");
});

test("Inputs are not mutated", () => {
  const input = fullInput();
  const before = JSON.stringify(input);
  buildManagerMickBehaviorContextBridge(input);
  assert.strictEqual(JSON.stringify(input), before);
});

test("No direct Mick runtime import", () => {
  const source = fs.readFileSync("manager-os/external-context-bridge/manager-mick-behavior-context-bridge.js", "utf8");
  assert(!/require\s*\(\s*["'][^"']*mick/i.test(source.replace(/manager-mick-behavior-context-bridge/g, "")));
});

test("All truth and action flags remain false except context markers", () => {
  const result = buildManagerMickBehaviorContextBridge(fullInput());
  assert.strictEqual(result.truthFlags.contextOnly, true);
  assert.strictEqual(result.truthFlags.sanitizedOnly, true);

  for (const [key, value] of Object.entries(result.truthFlags)) {
    if (key === "contextOnly" || key === "sanitizedOnly" || key === "sanitizedContextExportOnly") continue;
    assert.strictEqual(value, false, `${key} must remain false`);
  }
});

console.log("\nResumen:");
console.log(`Total: ${total}`);
console.log(`Pass: ${passed}`);
console.log(`Fail: ${total - passed}`);

if (total !== passed) process.exit(1);
