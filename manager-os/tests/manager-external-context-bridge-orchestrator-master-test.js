"use strict";

const assert = require("assert");
const fs = require("fs");

const {
  buildManagerExternalContextBridge
} = require("../external-context-bridge/manager-external-context-bridge-orchestrator");

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
    externalContext: { id: "external-context" },
    reviewPlanContext: {
      managerReviewAgenda: ["agenda"],
      evidenceToReview: ["evidence"]
    },
    coachingContext: {
      executiveCoachingSummary: { topic: "coaching" },
      recommendedConversationTopics: ["conversation"]
    },
    dashboardContext: {
      executiveSummary: "dashboard",
      activityRhythmContext: { topic: "rhythm" }
    },
    forecastContext: {
      executiveSummary: "forecast",
      scenarioSummary: { topic: "scenario" }
    },
    metricsContext: {
      followupConsistencyContext: { topic: "followup" },
      streakContext: { privateStreak: 2 }
    },
    rollups: [{ period: "2026-06" }],
    evidenceRefs: ["ev-1", "ev-1"],
    sourceEvidenceIds: ["src-1"],
    sourceOwners: ["manager-os", "manager-os"],
    freshness: [{ status: "CURRENT" }],
    ...extra
  };
}

console.log("\nFORGE MANAGER EXTERNAL CONTEXT BRIDGE ORCHESTRATOR MASTER TEST v1.0\n");

test("Combines Nash Mick and Engagement sanitized packets", () => {
  const result = buildManagerExternalContextBridge(fullInput());
  assert(result.sanitizedPackets.nashConversationContext);
  assert(result.sanitizedPackets.mickBehaviorContext);
  assert(result.sanitizedPackets.engagementContext);
  assert.strictEqual(result.sanitizedPackets.nashConversationContext.exportType, "CONVERSATION_PREP_CONTEXT");
  assert.strictEqual(result.sanitizedPackets.mickBehaviorContext.exportType, "BEHAVIOR_REVIEW_CONTEXT");
  assert.strictEqual(result.sanitizedPackets.engagementContext.exportType, "PRIVATE_ENGAGEMENT_CONTEXT");
});

test("Uses protected review plan coaching dashboard forecast metric context only", () => {
  const result = buildManagerExternalContextBridge(fullInput());
  assert.strictEqual(result.executiveBridgeSummary.contextOnly, true);
  assert(result.executiveBridgeSummary.consumerBoundaries.includes("Nash receives conversation-prep context only."));
  assert(result.executiveBridgeSummary.consumerBoundaries.includes("Mick receives behavior-review context only."));
  assert(result.executiveBridgeSummary.consumerBoundaries.includes("Engagement receives private motivation context only."));
});

test("Does not mutate inputs", () => {
  const input = fullInput();
  const before = JSON.stringify(input);
  buildManagerExternalContextBridge(input);
  assert.strictEqual(JSON.stringify(input), before);
});

test("Merges and dedupes evidence source owners", () => {
  const result = buildManagerExternalContextBridge(fullInput());
  assert.deepStrictEqual(result.evidenceRefs, ["ev-1"]);
  assert.deepStrictEqual(result.sourceOwners, ["manager-os"]);
});

test("Propagates warnings limitations missing unknown stale defaultZero risks", () => {
  const result = buildManagerExternalContextBridge(fullInput({
    freshness: [{ status: "STALE" }],
    explicitZeroValues: ["zero-value"],
    limitations: ["limited-context"]
  }));
  assert(result.stalePeriods.length > 0);
  assert(result.defaultZeroRisks.includes("EXPLICIT_ZERO_VALUE_REQUIRES_CONTEXT"));
  assert(result.limitations.includes("limited-context"));
});

test("Blocks forbidden uses", () => {
  const result = buildManagerExternalContextBridge(fullInput({ requestedUse: "PUBLIC_RANKING" }));
  assert.strictEqual(result.status, "BLOCKED");
});

test("Allows sanitized context export uses", () => {
  const result = buildManagerExternalContextBridge(fullInput());
  assert.strictEqual(result.status, "READY");
});

test("Executive bridge summary is context only, not automatic decision", () => {
  const result = buildManagerExternalContextBridge(fullInput());
  assert.strictEqual(result.executiveBridgeSummary.contextOnly, true);
  assert.strictEqual(result.executiveBridgeSummary.automaticDecisionAllowed, false);
});

test("Creates no actions, writes, external executions or downstream truth", () => {
  const result = buildManagerExternalContextBridge(fullInput());
  assert.strictEqual(result.actionFlags.createsTask, false);
  assert.strictEqual(result.actionFlags.createsCalendarEvent, false);
  assert.strictEqual(result.actionFlags.sendsMessage, false);
  assert.strictEqual(result.actionFlags.executesExternalEngine, false);
  assert.strictEqual(result.actionFlags.executesNextBestAction, false);

  for (const [key, value] of Object.entries(result.truthFlags)) {
    if (key === "contextOnly" || key === "sanitizedOnly") {
      assert.strictEqual(value, true);
    } else {
      assert.strictEqual(value, false, `${key} must remain false`);
    }
  }
});

test("No direct Advisor OS import", () => {
  const files = [
    "manager-os/external-context-bridge/manager-external-context-bridge-orchestrator.js",
    "manager-os/external-context-bridge/manager-nash-conversation-context-bridge.js",
    "manager-os/external-context-bridge/manager-mick-behavior-context-bridge.js",
    "manager-os/external-context-bridge/manager-engagement-context-bridge.js"
  ];

  for (const file of files) {
    const source = fs.readFileSync(file, "utf8");
    assert(!/require\s*\(\s*["'][^"']*advisor-os/i.test(source), `${file} must not import Advisor OS`);
  }
});

test("No direct Nash next-best-action, Mick runtime, or engagement runtime imports", () => {
  const files = [
    "manager-os/external-context-bridge/manager-external-context-bridge-orchestrator.js",
    "manager-os/external-context-bridge/manager-nash-conversation-context-bridge.js",
    "manager-os/external-context-bridge/manager-mick-behavior-context-bridge.js",
    "manager-os/external-context-bridge/manager-engagement-context-bridge.js"
  ];

  for (const file of files) {
    const source = fs.readFileSync(file, "utf8");
    assert(!/require\s*\(\s*["'][^"']*nash-next-best-action/i.test(source), `${file} must not import Nash NBA`);
    assert(!/require\s*\(\s*["'][^"']*nash-core/i.test(source), `${file} must not import Nash runtime`);
    assert(!/require\s*\(\s*["'][^"']*client-engagement/i.test(source), `${file} must not import engagement runtime`);
  }
});

test("No compensation revenue payout lifecycle product imports", () => {
  const files = [
    "manager-os/external-context-bridge/manager-external-context-bridge-orchestrator.js",
    "manager-os/external-context-bridge/manager-nash-conversation-context-bridge.js",
    "manager-os/external-context-bridge/manager-mick-behavior-context-bridge.js",
    "manager-os/external-context-bridge/manager-engagement-context-bridge.js",
    "manager-os/external-context-bridge/manager-external-context-bridge-boundary-contract.js"
  ];

  for (const file of files) {
    const source = fs.readFileSync(file, "utf8");
    assert(!/require\s*\(\s*["'][^"']*compensation/i.test(source));
    assert(!/require\s*\(\s*["'][^"']*revenue/i.test(source));
    assert(!/require\s*\(\s*["'][^"']*payout/i.test(source));
    assert(!/require\s*\(\s*["'][^"']*advisor-lifecycle/i.test(source));
    assert(!/require\s*\(\s*["'][^"']*product-intelligence/i.test(source));
  }
});

console.log("\nResumen:");
console.log(`Total: ${total}`);
console.log(`Pass: ${passed}`);
console.log(`Fail: ${total - passed}`);

if (total !== passed) process.exit(1);
