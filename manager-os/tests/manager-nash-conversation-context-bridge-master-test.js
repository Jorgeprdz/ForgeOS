"use strict";

const assert = require("assert");
const fs = require("fs");

const {
  buildManagerNashConversationContextBridge
} = require("../external-context-bridge/manager-nash-conversation-context-bridge");

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
    requestedUse: "CONVERSATION_PREP_CONTEXT",
    reviewPlanContext: {
      managerReviewAgenda: ["review follow-up evidence"],
      evidenceToReview: ["ev-followup"]
    },
    coachingContext: {
      recommendedConversationTopics: ["follow-up consistency"],
      supportNeedContext: { topic: "support" }
    },
    dashboardContext: { executiveSummary: "dashboard context" },
    forecastContext: { executiveSummary: "forecast context" },
    metricsContext: { followupConsistencyContext: { value: "context" } },
    rollups: [{ period: "2026-06" }],
    evidenceRefs: ["ev-1"],
    sourceOwners: ["manager-os"],
    freshness: [{ status: "CURRENT" }],
    ...extra
  };
}

console.log("\nFORGE MANAGER NASH CONVERSATION CONTEXT BRIDGE MASTER TEST v1.0\n");

test("Builds Nash conversation prep context only", () => {
  const result = buildManagerNashConversationContextBridge(fullInput());
  assert.strictEqual(result.conversationPrepPacket.consumer, "NASH");
  assert.strictEqual(result.conversationPrepPacket.exportType, "CONVERSATION_PREP_CONTEXT");
  assert.strictEqual(result.conversationPrepPacket.contextOnly, true);
  assert(result.conversationPrepPacket.suggestedQuestionAreas.length >= 3);
});

test("Nash bridge does not create next-best-action execution", () => {
  const result = buildManagerNashConversationContextBridge(fullInput());
  assert.strictEqual(result.truthFlags.createsNextBestActionExecution, false);
  assert.strictEqual(result.actionFlags.executesNextBestAction, false);
  assert(result.conversationPrepPacket.forbiddenOutputs.includes("NO_NEXT_BEST_ACTION_EXECUTION"));
});

test("Nash bridge does not send messages or create manipulation", () => {
  const result = buildManagerNashConversationContextBridge(fullInput());
  assert.strictEqual(result.truthFlags.sendsAutomatedMessage, false);
  assert.strictEqual(result.truthFlags.createsManipulation, false);
  assert.strictEqual(result.truthFlags.createsPressureLanguage, false);
  assert(result.conversationPrepPacket.forbiddenOutputs.includes("NO_AUTOMATED_MESSAGES"));
});

test("Nash suggested question areas are evidence review context", () => {
  const result = buildManagerNashConversationContextBridge(fullInput());
  const keys = result.conversationPrepPacket.suggestedQuestionAreas.map((item) => item.key);
  assert(keys.includes("EVIDENCE_TO_REVIEW"));
  assert(keys.includes("SAFE_LANGUAGE_GUARDRAILS"));
});

test("Missing review/coaching context does not become zero", () => {
  const result = buildManagerNashConversationContextBridge({
    evidenceRefs: ["ev"],
    sourceOwners: ["owner"],
    freshness: ["CURRENT"]
  });
  assert(result.missingData.includes("MISSING_REVIEW_PLAN_CONTEXT"));
  assert(result.unknownSignals.includes("MISSING_COACHING_CONTEXT"));
});

test("Forbidden uses are blocked", () => {
  const result = buildManagerNashConversationContextBridge(fullInput({ requestedUse: "MESSAGE_SEND" }));
  assert.strictEqual(result.status, "BLOCKED");
});

test("Allowed uses are allowed", () => {
  const result = buildManagerNashConversationContextBridge(fullInput());
  assert.strictEqual(result.status, "READY");
});

test("Inputs are not mutated", () => {
  const input = fullInput();
  const before = JSON.stringify(input);
  buildManagerNashConversationContextBridge(input);
  assert.strictEqual(JSON.stringify(input), before);
});

test("No direct Nash execution import", () => {
  const source = fs.readFileSync("manager-os/external-context-bridge/manager-nash-conversation-context-bridge.js", "utf8");
  assert(!/require\s*\(\s*["'][^"']*nash-next-best-action/i.test(source));
  assert(!/require\s*\(\s*["'][^"']*nash-core/i.test(source));
  assert(!/require\s*\(\s*["'][^"']*nash-message/i.test(source));
});

test("All truth and action flags remain false except context markers", () => {
  const result = buildManagerNashConversationContextBridge(fullInput());
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
