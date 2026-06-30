"use strict";

const assert = require("assert");
const {
  STATUS,
  DECISION,
  buildMickManagerContextIntakeBoundary,
} = require("../context-intake/mick-manager-context-intake-boundary-contract");

const tests = [];

function test(name, fn) {
  tests.push({ name, fn });
}

function validPacket(overrides = {}) {
  return {
    evidenceSources: ["manager-external-context-bridge", "manager-external-context-bridge"],
    sourceOwners: ["manager-os", "manager-os"],
    freshness: "FRESH",
    behaviorReviewAreas: ["prospecting rhythm"],
    ...overrides,
  };
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

test("Missing Mick manager context packet becomes UNKNOWN, not zero", () => {
  const result = buildMickManagerContextIntakeBoundary();
  assert.strictEqual(result.status, STATUS.UNKNOWN);
  assert.strictEqual(result.requiresHumanReview, true);
  assert(result.missing.includes("MICK_MANAGER_CONTEXT_PACKET"));
  assert(!result.warnings.includes("ZERO"));
});

test("Missing evidence requires review", () => {
  const result = buildMickManagerContextIntakeBoundary({
    sourceOwners: ["manager-os"],
    freshness: "FRESH",
  });
  assert(result.missing.includes("EVIDENCE_SOURCE"));
  assert.strictEqual(result.decision, DECISION.REVIEW);
});

test("Missing source owner requires review", () => {
  const result = buildMickManagerContextIntakeBoundary({
    evidenceSources: ["bridge"],
    freshness: "FRESH",
  });
  assert(result.missing.includes("SOURCE_OWNER"));
  assert.strictEqual(result.decision, DECISION.REVIEW);
});

test("Missing freshness requires review", () => {
  const result = buildMickManagerContextIntakeBoundary({
    evidenceSources: ["bridge"],
    sourceOwners: ["manager-os"],
  });
  assert(result.missing.includes("FRESHNESS"));
  assert.strictEqual(result.decision, DECISION.REVIEW);
});

test("Stale packet requires review", () => {
  const result = buildMickManagerContextIntakeBoundary(validPacket({ freshness: "STALE" }));
  assert.strictEqual(result.stale, true);
  assert.strictEqual(result.decision, DECISION.REVIEW);
});

test("Blocked periods remain review-required, not zero", () => {
  const result = buildMickManagerContextIntakeBoundary(validPacket({ blockedPeriod: true }));
  assert.strictEqual(result.blockedPeriod, true);
  assert.strictEqual(result.decision, DECISION.REVIEW);
});

test("Explicit zero values are context warnings only", () => {
  const result = buildMickManagerContextIntakeBoundary(validPacket({ activityCount: 0 }));
  assert(result.defaultZeroWarnings.some((item) => item.includes("activityCount")));
  assert.strictEqual(result.createsBehaviorTruth, false);
});

test("Forbidden Mick runtime execution use is blocked", () => {
  const result = buildMickManagerContextIntakeBoundary(validPacket(), {
    requestedUse: "MICK_RUNTIME_EXECUTION",
  });
  assert.strictEqual(result.status, STATUS.BLOCKED);
  assert.strictEqual(result.decision, DECISION.BLOCK);
});

test("Forbidden behavior truth personality and surveillance uses are blocked", () => {
  for (const requestedUse of ["BEHAVIOR_TRUTH_CREATION", "PERSONALITY_JUDGMENT", "SURVEILLANCE_TRUTH"]) {
    const result = buildMickManagerContextIntakeBoundary(validPacket(), { requestedUse });
    assert.strictEqual(result.decision, DECISION.BLOCK);
  }
});

test("Forbidden HR disciplinary ranking task and calendar uses are blocked", () => {
  for (const requestedUse of ["HR_DECISION", "DISCIPLINARY_ACTION", "HUMAN_RANKING", "TASK_CREATE", "CALENDAR_WRITE"]) {
    const result = buildMickManagerContextIntakeBoundary(validPacket(), { requestedUse });
    assert.strictEqual(result.decision, DECISION.BLOCK);
  }
});

test("Allowed intake uses are allowed", () => {
  for (const requestedUse of ["MICK_BEHAVIOR_REVIEW_INTAKE", "MANAGER_CONTEXT_INTAKE", "HABIT_REVIEW_CONTEXT", "SUPPORT_CONTEXT"]) {
    const result = buildMickManagerContextIntakeBoundary(validPacket(), { requestedUse });
    assert.strictEqual(result.decision, DECISION.ALLOW);
    assert.strictEqual(result.allowed, true);
  }
});

test("Inputs are not mutated", () => {
  const input = validPacket({ nested: { count: 0 } });
  const before = clone(input);
  buildMickManagerContextIntakeBoundary(input);
  assert.deepStrictEqual(input, before);
});

test("Evidence source and sourceOwners dedupe", () => {
  const result = buildMickManagerContextIntakeBoundary(validPacket());
  assert.deepStrictEqual(result.evidenceSources, ["manager-external-context-bridge"]);
  assert.deepStrictEqual(result.sourceOwners, ["manager-os"]);
});

test("No actions writes executions or downstream truth flags remain false", () => {
  const result = buildMickManagerContextIntakeBoundary(validPacket());
  for (const [key, value] of Object.entries(result.flags)) {
    assert.strictEqual(value, false, `${key} should be false`);
  }
});

let pass = 0;
let fail = 0;

console.log("\nFORGE MICK MANAGER CONTEXT INTAKE BOUNDARY CONTRACT MASTER TEST v1.0\n");

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
