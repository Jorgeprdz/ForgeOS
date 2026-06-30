"use strict";

const assert = require("assert");

const {
  buildManagerExternalContextBridgeBoundary,
  MANAGER_EXTERNAL_CONTEXT_BRIDGE_STATUSES,
  MANAGER_EXTERNAL_CONTEXT_BRIDGE_DECISIONS
} = require("../external-context-bridge/manager-external-context-bridge-boundary-contract");

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
    requestedUse: "SANITIZED_CONTEXT_EXPORT",
    externalContext: { id: "bridge-context-1" },
    reviewPlanContext: { id: "review-plan-1" },
    coachingContext: { id: "coaching-1" },
    dashboardContext: { id: "dashboard-1" },
    forecastContext: { id: "forecast-1" },
    metricsContext: { id: "metrics-1" },
    rollups: [{ period: "2026-06" }],
    evidenceRefs: ["ev-1", "ev-1"],
    sourceEvidenceIds: ["src-1"],
    sourceOwners: ["manager-os", "manager-os"],
    freshness: [{ period: "2026-06", status: "CURRENT" }],
    ...extra
  };
}

console.log("\nFORGE MANAGER EXTERNAL CONTEXT BRIDGE BOUNDARY CONTRACT MASTER TEST v1.0\n");

test("Missing external bridge context becomes UNKNOWN, not zero", () => {
  const result = buildManagerExternalContextBridgeBoundary({
    evidenceRefs: ["ev"],
    sourceOwners: ["owner"],
    freshness: ["CURRENT"]
  });
  assert(result.unknownSignals.includes("MISSING_EXTERNAL_CONTEXT"));
  assert(result.missingData.includes("MISSING_EXTERNAL_CONTEXT"));
  assert.notStrictEqual(result.missingData.length, 0);
});

test("Missing review plan coaching dashboard forecast metric context remains UNKNOWN, not zero", () => {
  const result = buildManagerExternalContextBridgeBoundary({
    externalContext: {},
    rollups: [{}],
    evidenceRefs: ["ev"],
    sourceOwners: ["owner"],
    freshness: ["CURRENT"]
  });
  assert(result.unknownSignals.includes("MISSING_REVIEW_PLAN_CONTEXT"));
  assert(result.unknownSignals.includes("MISSING_COACHING_CONTEXT"));
  assert(result.unknownSignals.includes("MISSING_DASHBOARD_CONTEXT"));
  assert(result.unknownSignals.includes("MISSING_FORECAST_CONTEXT"));
  assert(result.unknownSignals.includes("MISSING_METRICS_CONTEXT"));
});

test("Missing rollups remain UNKNOWN/review context, not poor performance", () => {
  const result = buildManagerExternalContextBridgeBoundary(fullInput({ rollups: null }));
  assert(result.unknownSignals.includes("MISSING_ROLLUPS"));
  assert.strictEqual(result.truthFlags.createsPunishmentTruth, false);
  assert.strictEqual(result.truthFlags.createsRankingTruth, false);
});

test("Missing evidence requires review", () => {
  const input = fullInput({ evidenceRefs: [], sourceEvidenceIds: [] });
  const result = buildManagerExternalContextBridgeBoundary(input);
  assert(result.missingData.includes("MISSING_EVIDENCE"));
  assert.strictEqual(result.status, MANAGER_EXTERNAL_CONTEXT_BRIDGE_STATUSES.REVIEW_REQUIRED);
});

test("Missing source owner requires review", () => {
  const result = buildManagerExternalContextBridgeBoundary(fullInput({ sourceOwners: [] }));
  assert(result.missingData.includes("MISSING_SOURCE_OWNER"));
  assert.strictEqual(result.status, MANAGER_EXTERNAL_CONTEXT_BRIDGE_STATUSES.REVIEW_REQUIRED);
});

test("Missing freshness requires review", () => {
  const result = buildManagerExternalContextBridgeBoundary(fullInput({ freshness: [] }));
  assert(result.missingData.includes("MISSING_FRESHNESS"));
  assert.strictEqual(result.status, MANAGER_EXTERNAL_CONTEXT_BRIDGE_STATUSES.REVIEW_REQUIRED);
});

test("Stale freshness requires review", () => {
  const result = buildManagerExternalContextBridgeBoundary(fullInput({ freshness: [{ status: "STALE" }] }));
  assert(result.stalePeriods.length > 0);
  assert.strictEqual(result.status, MANAGER_EXTERNAL_CONTEXT_BRIDGE_STATUSES.REVIEW_REQUIRED);
});

test("Blocked periods remain review-required, not zero", () => {
  const result = buildManagerExternalContextBridgeBoundary(fullInput({ blockedPeriods: ["2026-05"] }));
  assert(result.blockedPeriods.includes("2026-05"));
  assert.strictEqual(result.truthFlags.createsTerminationTruth, false);
});

test("Explicit zero values are context warnings only", () => {
  const result = buildManagerExternalContextBridgeBoundary(fullInput({ explicitZeroValues: ["zero-followups"] }));
  assert(result.defaultZeroRisks.includes("EXPLICIT_ZERO_VALUE_REQUIRES_CONTEXT"));
  assert.strictEqual(result.truthFlags.createsPunishmentTruth, false);
});

test("Forbidden external execution and leaderboard uses are blocked", () => {
  const forbidden = [
    "NASH_NEXT_BEST_ACTION_EXECUTION",
    "MICK_DISCIPLINARY_TRUTH",
    "GAMIFICATION_LEADERBOARD",
    "MESSAGE_SEND",
    "AUTOMATED_TASK_CREATION",
    "PUBLIC_RANKING"
  ];

  for (const requestedUse of forbidden) {
    const result = buildManagerExternalContextBridgeBoundary(fullInput({ requestedUse }));
    assert.strictEqual(result.status, MANAGER_EXTERNAL_CONTEXT_BRIDGE_STATUSES.BLOCKED);
    assert.strictEqual(result.decision, MANAGER_EXTERNAL_CONTEXT_BRIDGE_DECISIONS.BLOCK_FORBIDDEN_USE);
  }
});

test("Allowed sanitized context uses are allowed", () => {
  const allowed = [
    "SANITIZED_CONTEXT_EXPORT",
    "CONVERSATION_PREP_CONTEXT",
    "BEHAVIOR_REVIEW_CONTEXT",
    "PRIVATE_ENGAGEMENT_CONTEXT",
    "REVIEW_PLAN_CONTEXT"
  ];

  for (const requestedUse of allowed) {
    const result = buildManagerExternalContextBridgeBoundary(fullInput({ requestedUse }));
    assert.strictEqual(result.status, MANAGER_EXTERNAL_CONTEXT_BRIDGE_STATUSES.READY);
    assert.strictEqual(result.decision, MANAGER_EXTERNAL_CONTEXT_BRIDGE_DECISIONS.ALLOW_SANITIZED_CONTEXT_EXPORT);
  }
});

test("Inputs are not mutated", () => {
  const input = fullInput();
  const before = JSON.stringify(input);
  buildManagerExternalContextBridgeBoundary(input);
  assert.strictEqual(JSON.stringify(input), before);
});

test("Evidence source and sourceOwners dedupe", () => {
  const result = buildManagerExternalContextBridgeBoundary(fullInput());
  assert.deepStrictEqual(result.evidenceRefs, ["ev-1"]);
  assert.deepStrictEqual(result.sourceOwners, ["manager-os"]);
});

test("No tasks calendar messages writes and all truth flags remain false", () => {
  const result = buildManagerExternalContextBridgeBoundary(fullInput());
  assert.strictEqual(result.actionFlags.createsTask, false);
  assert.strictEqual(result.actionFlags.createsCalendarEvent, false);
  assert.strictEqual(result.actionFlags.sendsMessage, false);
  assert.strictEqual(result.actionFlags.executesExternalEngine, false);

  for (const [key, value] of Object.entries(result.truthFlags)) {
    if (key === "sanitizedContextExportOnly") {
      assert.strictEqual(value, true);
    } else {
      assert.strictEqual(value, false, `${key} must remain false`);
    }
  }
});

console.log("\nResumen:");
console.log(`Total: ${total}`);
console.log(`Pass: ${passed}`);
console.log(`Fail: ${total - passed}`);

if (total !== passed) process.exit(1);
