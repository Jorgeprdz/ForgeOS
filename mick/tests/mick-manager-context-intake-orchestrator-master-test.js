"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const {
  STATUS,
  DECISION,
  buildMickManagerContextIntake,
} = require("../context-intake/mick-manager-context-intake-orchestrator");

const tests = [];

function test(name, fn) {
  tests.push({ name, fn });
}

function validPacket(overrides = {}) {
  return {
    mickBehaviorReviewPacket: {
      evidenceSources: ["manager-external-context-bridge", "manager-external-context-bridge"],
      sourceOwners: ["manager-os", "manager-os"],
      freshness: "FRESH",
      behaviorReviewAreas: [
        { id: "habit-1", label: "Prospecting rhythm", type: "HABIT_REVIEW_CONTEXT" },
      ],
      supportContext: ["manager support context"],
      evidenceToReview: ["activity freshness"],
      languageSamples: ["Review the habit as support context only."],
      ...overrides,
    },
  };
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function implementationImportLines() {
  return [
    "../context-intake/mick-manager-context-intake-boundary-contract.js",
    "../context-intake/mick-manager-behavior-review-packet-intake.js",
    "../context-intake/mick-manager-no-surveillance-guardrail-intake.js",
    "../context-intake/mick-manager-context-intake-orchestrator.js",
  ].flatMap((relative) => {
    const source = fs.readFileSync(path.join(__dirname, relative), "utf8");
    return source.split(/\r?\n/).filter((line) => /(require\s*\(|from\s+["'])/.test(line));
  });
}

test("Combines packet validation behavior-review intake and no-surveillance guardrails", () => {
  const result = buildMickManagerContextIntake(validPacket());
  assert.strictEqual(result.contextOnly, true);
  assert(result.boundary);
  assert(result.behaviorReviewPacketIntake);
  assert(result.noSurveillanceGuardrailIntake);
  assert(result.mickReadyContext.behaviorReviewAreas.length === 1);
});

test("Uses Manager OS External Context Bridge sanitized packet only", () => {
  const result = buildMickManagerContextIntake(validPacket());
  assert.strictEqual(result.acceptedPacketSource, "MANAGER_OS_EXTERNAL_CONTEXT_BRIDGE_SANITIZED_PACKET");
  assert.strictEqual(result.usesSanitizedPacketOnly, true);
});

test("Does not mutate inputs", () => {
  const input = validPacket();
  const before = clone(input);
  buildMickManagerContextIntake(input);
  assert.deepStrictEqual(input, before);
});

test("Merges and dedupes evidence source owners", () => {
  const result = buildMickManagerContextIntake(validPacket());
  assert.deepStrictEqual(result.evidenceSources, ["manager-external-context-bridge"]);
  assert.deepStrictEqual(result.sourceOwners, ["manager-os"]);
});

test("Propagates warnings limitations missing unknown stale and defaultZero risks", () => {
  const result = buildMickManagerContextIntake(validPacket({
    freshness: "STALE",
    activityCount: 0,
  }));
  assert.strictEqual(result.decision, DECISION.REVIEW);
  assert(result.warnings.some((item) => item.includes("STALE")));
  assert(result.warnings.some((item) => item.includes("EXPLICIT_ZERO_CONTEXT_WARNING")));
});

test("Blocks forbidden uses", () => {
  const result = buildMickManagerContextIntake(validPacket(), {
    requestedUse: "DISCIPLINARY_ACTION",
  });
  assert.strictEqual(result.status, STATUS.BLOCKED);
  assert.strictEqual(result.decision, DECISION.BLOCK);
});

test("Allows intake context uses", () => {
  const result = buildMickManagerContextIntake(validPacket(), {
    requestedUse: "MICK_BEHAVIOR_REVIEW_INTAKE",
  });
  assert.strictEqual(result.decision, DECISION.ALLOW);
});

test("Executive summary is context only, not automatic decision", () => {
  const result = buildMickManagerContextIntake(validPacket());
  assert.strictEqual(result.executiveSummary.contextOnly, true);
  assert.strictEqual(result.automaticDecisionAllowed, false);
});

test("Creates no messages drafts tasks calendar events writes or external executions", () => {
  const result = buildMickManagerContextIntake(validPacket());
  assert.strictEqual(result.sendsMessages, false);
  assert.strictEqual(result.createsDrafts, false);
  assert.strictEqual(result.createsTasks, false);
  assert.strictEqual(result.writesCalendar, false);
  assert.strictEqual(result.executesMickRuntime, false);
  assert.strictEqual(result.writesFilesystem, false);
});

test("No direct Advisor OS or raw Manager OS imports", () => {
  const lines = implementationImportLines();
  assert(!lines.some((line) => /advisor-os|manager-os/.test(line)));
});

test("No direct Mick runtime personality scoring or surveillance imports", () => {
  const lines = implementationImportLines();
  assert(!lines.some((line) => /mick-core|mick-runtime|mick\/runtime|personality-score|surveillance-engine|surveillance-runtime/.test(line)));
});

test("No compensation revenue payout lifecycle product imports", () => {
  const lines = implementationImportLines();
  assert(!lines.some((line) => /compensation|revenue|payout|advisor-lifecycle|product-intelligence/.test(line)));
});

test("All truth write and action flags remain false", () => {
  const result = buildMickManagerContextIntake(validPacket());
  for (const [key, value] of Object.entries(result.flags)) {
    assert.strictEqual(value, false, `${key} should be false`);
  }
});

let pass = 0;
let fail = 0;

console.log("\nFORGE MICK MANAGER CONTEXT INTAKE ORCHESTRATOR MASTER TEST v1.0\n");

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
