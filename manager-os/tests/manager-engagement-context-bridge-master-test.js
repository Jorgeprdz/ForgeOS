"use strict";

const assert = require("assert");
const fs = require("fs");

const {
  buildManagerEngagementContextBridge
} = require("../external-context-bridge/manager-engagement-context-bridge");

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
    requestedUse: "PRIVATE_ENGAGEMENT_CONTEXT",
    reviewPlanContext: { managerReviewAgenda: ["private review"] },
    coachingContext: { executiveCoachingSummary: { topic: "coaching" }, supportNeedContext: { topic: "support" } },
    dashboardContext: { activityRhythmContext: { topic: "rhythm" } },
    forecastContext: { scenarioSummary: { topic: "scenario" } },
    metricsContext: { streakContext: { privateStreak: 3 } },
    streakContext: { privateStreak: 3 },
    rollups: [{ period: "2026-06" }],
    evidenceRefs: ["ev-1"],
    sourceOwners: ["manager-os"],
    freshness: [{ status: "CURRENT" }],
    ...extra
  };
}

console.log("\nFORGE MANAGER ENGAGEMENT CONTEXT BRIDGE MASTER TEST v1.0\n");

test("Builds private engagement context only", () => {
  const result = buildManagerEngagementContextBridge(fullInput());
  assert.strictEqual(result.privateEngagementPacket.consumer, "ENGAGEMENT_GAMIFICATION");
  assert.strictEqual(result.privateEngagementPacket.exportType, "PRIVATE_ENGAGEMENT_CONTEXT");
  assert.strictEqual(result.privateEngagementPacket.privateOnly, true);
});

test("Engagement bridge does not create public leaderboard or ranking truth", () => {
  const result = buildManagerEngagementContextBridge(fullInput());
  assert.strictEqual(result.truthFlags.createsPublicLeaderboard, false);
  assert.strictEqual(result.truthFlags.createsRankingTruth, false);
  assert(result.privateEngagementPacket.forbiddenOutputs.includes("NO_PUBLIC_LEADERBOARD"));
});

test("Engagement bridge does not create pressure mechanics or addictive loops", () => {
  const result = buildManagerEngagementContextBridge(fullInput());
  assert.strictEqual(result.truthFlags.createsPressureMechanic, false);
  assert.strictEqual(result.truthFlags.createsAddictiveLoop, false);
  assert.strictEqual(result.truthFlags.createsShameMechanic, false);
});

test("Engagement bridge does not treat points as worth", () => {
  const result = buildManagerEngagementContextBridge(fullInput());
  assert.strictEqual(result.truthFlags.createsPointsAsHumanWorth, false);
  assert(result.privateEngagementPacket.forbiddenOutputs.includes("NO_POINTS_AS_WORTH"));
});

test("Private engagement areas include progress and safe streak context", () => {
  const result = buildManagerEngagementContextBridge(fullInput());
  const keys = result.privateEngagementPacket.engagementAreas.map((item) => item.key);
  assert(keys.includes("PRIVATE_PROGRESS_REFLECTION"));
  assert(keys.includes("SAFE_STREAK_CONTEXT"));
});

test("Missing engagement context does not become zero", () => {
  const result = buildManagerEngagementContextBridge({
    evidenceRefs: ["ev"],
    sourceOwners: ["owner"],
    freshness: ["CURRENT"]
  });
  assert(result.missingData.includes("MISSING_REVIEW_PLAN_CONTEXT"));
  assert(result.unknownSignals.includes("MISSING_COACHING_CONTEXT"));
});

test("Forbidden uses are blocked", () => {
  const result = buildManagerEngagementContextBridge(fullInput({ requestedUse: "GAMIFICATION_LEADERBOARD" }));
  assert.strictEqual(result.status, "BLOCKED");
});

test("Allowed uses are allowed", () => {
  const result = buildManagerEngagementContextBridge(fullInput());
  assert.strictEqual(result.status, "READY");
});

test("Inputs are not mutated", () => {
  const input = fullInput();
  const before = JSON.stringify(input);
  buildManagerEngagementContextBridge(input);
  assert.strictEqual(JSON.stringify(input), before);
});

test("No direct engagement or streak runtime import", () => {
  const source = fs.readFileSync("manager-os/external-context-bridge/manager-engagement-context-bridge.js", "utf8");
  assert(!/require\s*\(\s*["'][^"']*client-engagement/i.test(source));
  assert(!/require\s*\(\s*["'][^"']*streak/i.test(source));
});

test("All truth and action flags remain false except context markers", () => {
  const result = buildManagerEngagementContextBridge(fullInput());
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
