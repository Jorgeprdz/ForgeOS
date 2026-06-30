"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const {
  STATUS,
  DECISION,
  buildMickManagerBehaviorReviewPacketIntake,
} = require("../context-intake/mick-manager-behavior-review-packet-intake");

const tests = [];

function test(name, fn) {
  tests.push({ name, fn });
}

function validPacket(overrides = {}) {
  return {
    evidenceSources: ["manager-external-context-bridge"],
    sourceOwners: ["manager-os"],
    freshness: "FRESH",
    behaviorReviewAreas: [
      { id: "habit-1", label: "Prospecting rhythm", type: "HABIT_REVIEW_CONTEXT" },
      "Follow-up consistency",
    ],
    supportContext: ["manager coaching support"],
    evidenceToReview: ["activity freshness", "activity freshness"],
    coachingGuardrails: ["support not pressure"],
    ...overrides,
  };
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

test("Builds Mick behavior review context only", () => {
  const result = buildMickManagerBehaviorReviewPacketIntake(validPacket());
  assert.strictEqual(result.contextOnly, true);
  assert.strictEqual(result.intakeOnly, true);
  assert.strictEqual(result.behaviorReviewAreas.length, 2);
  assert.strictEqual(result.supportContext.length, 1);
});

test("Mick behavior review intake does not execute Mick runtime", () => {
  const result = buildMickManagerBehaviorReviewPacketIntake(validPacket());
  assert.strictEqual(result.executesMickRuntime, false);
});

test("Mick behavior review intake does not create behavior truth", () => {
  const result = buildMickManagerBehaviorReviewPacketIntake(validPacket());
  assert.strictEqual(result.createsBehaviorTruth, false);
  assert.strictEqual(result.finalBehaviorScoreCreated, false);
});

test("Mick behavior review intake does not create personality judgment or surveillance truth", () => {
  const result = buildMickManagerBehaviorReviewPacketIntake(validPacket());
  assert.strictEqual(result.createsPersonalityJudgment, false);
  assert.strictEqual(result.createsSurveillanceTruth, false);
});

test("Mick behavior review intake does not send messages create drafts tasks or calendar writes", () => {
  const result = buildMickManagerBehaviorReviewPacketIntake(validPacket());
  assert.strictEqual(result.sendsMessages, false);
  assert.strictEqual(result.createsDrafts, false);
  assert.strictEqual(result.createsTasks, false);
  assert.strictEqual(result.writesCalendar, false);
});

test("Behavior review areas are evidence review context", () => {
  const result = buildMickManagerBehaviorReviewPacketIntake(validPacket());
  assert(result.behaviorReviewAreas.every((area) => area.contextOnly === true));
  assert.deepStrictEqual(result.evidenceToReview, ["activity freshness"]);
});

test("Missing packet remains UNKNOWN, not zero", () => {
  const result = buildMickManagerBehaviorReviewPacketIntake();
  assert.strictEqual(result.status, STATUS.UNKNOWN);
  assert.strictEqual(result.requiresHumanReview, true);
});

test("Missing and stale context propagate review requirements", () => {
  const result = buildMickManagerBehaviorReviewPacketIntake(validPacket({ freshness: "STALE" }));
  assert.strictEqual(result.stale, true);
  assert.strictEqual(result.decision, DECISION.REVIEW);
});

test("Forbidden uses are blocked", () => {
  const result = buildMickManagerBehaviorReviewPacketIntake(validPacket(), {
    requestedUse: "SURVEILLANCE_TRUTH",
  });
  assert.strictEqual(result.decision, DECISION.BLOCK);
});

test("Allowed uses are allowed", () => {
  const result = buildMickManagerBehaviorReviewPacketIntake(validPacket(), {
    requestedUse: "MICK_BEHAVIOR_REVIEW_INTAKE",
  });
  assert.strictEqual(result.decision, DECISION.ALLOW);
});

test("Inputs are not mutated", () => {
  const input = validPacket();
  const before = clone(input);
  buildMickManagerBehaviorReviewPacketIntake(input);
  assert.deepStrictEqual(input, before);
});

test("No direct Mick runtime imports", () => {
  const source = fs.readFileSync(path.join(__dirname, "../context-intake/mick-manager-behavior-review-packet-intake.js"), "utf8");
  const importLines = source.split(/\r?\n/).filter((line) => /(require\s*\(|from\s+["'])/.test(line));
  assert(!importLines.some((line) => /mick-core|mick-runtime|mick\/runtime|manager-os|advisor-os/.test(line)));
});

test("All truth and action flags remain false except context markers", () => {
  const result = buildMickManagerBehaviorReviewPacketIntake(validPacket());
  for (const [key, value] of Object.entries(result.flags)) {
    assert.strictEqual(value, false, `${key} should be false`);
  }
});

let pass = 0;
let fail = 0;

console.log("\nFORGE MICK MANAGER BEHAVIOR REVIEW PACKET INTAKE MASTER TEST v1.0\n");

for (const item of tests) {
  try {
    item.fn();
    pass += 1;
    console.log(`PASS ${item.name}`);
  } catch (error) {
    fail += 1;
    console.log(`FAIL ${item.name}`);
    console.log(error && error.stack ? error.stack : error);
  }
}

console.log("\nResumen:");
console.log(`Total: ${tests.length}`);
console.log(`Pass: ${pass}`);
console.log(`Fail: ${fail}`);

if (fail > 0) process.exit(1);
