"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const {
  STATUS,
  DECISION,
  buildMickManagerNoSurveillanceGuardrailIntake,
} = require("../context-intake/mick-manager-no-surveillance-guardrail-intake");

const tests = [];

function test(name, fn) {
  tests.push({ name, fn });
}

function validPacket(overrides = {}) {
  return {
    evidenceSources: ["manager-external-context-bridge"],
    sourceOwners: ["manager-os"],
    freshness: "FRESH",
    languageSamples: ["Review follow-up rhythm as support context."],
    ...overrides,
  };
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

test("Builds no-surveillance guardrail context only", () => {
  const result = buildMickManagerNoSurveillanceGuardrailIntake(validPacket());
  assert.strictEqual(result.contextOnly, true);
  assert.strictEqual(result.intakeOnly, true);
});

test("Flags surveillance language as review context only", () => {
  const result = buildMickManagerNoSurveillanceGuardrailIntake(validPacket({
    languageSamples: ["We need surveillance and tracking permanente of every move."],
  }));
  assert(result.unsafeLanguageFindings.some((item) => item.type === "SURVEILLANCE_LANGUAGE"));
  assert.strictEqual(result.createsSurveillanceTruth, false);
});

test("Flags shame language as review context only", () => {
  const result = buildMickManagerNoSurveillanceGuardrailIntake(validPacket({
    languageSamples: ["This advisor is lazy and mediocre."],
  }));
  assert(result.unsafeLanguageFindings.some((item) => item.type === "SHAME_LANGUAGE"));
});

test("Flags personality judgment as review context only", () => {
  const result = buildMickManagerNoSurveillanceGuardrailIntake(validPacket({
    languageSamples: ["He is not coachable and has a bad personality."],
  }));
  assert(result.unsafeLanguageFindings.some((item) => item.type === "PERSONALITY_JUDGMENT"));
  assert.strictEqual(result.createsPersonalityJudgment, false);
});

test("Flags punishment language as review context only", () => {
  const result = buildMickManagerNoSurveillanceGuardrailIntake(validPacket({
    languageSamples: ["If this continues, punishment and termination are next."],
  }));
  assert(result.unsafeLanguageFindings.some((item) => item.type === "PUNISHMENT_LANGUAGE"));
});

test("Flags HR discipline language as review context only", () => {
  const result = buildMickManagerNoSurveillanceGuardrailIntake(validPacket({
    languageSamples: ["This should become disciplinary action with HR."],
  }));
  assert(result.unsafeLanguageFindings.some((item) => item.type === "HR_DISCIPLINE_LANGUAGE"));
});

test("Flags pressure mechanics as review context only", () => {
  const result = buildMickManagerNoSurveillanceGuardrailIntake(validPacket({
    languageSamples: ["Put everyone in a public ranking leaderboard to create pressure."],
  }));
  assert(result.unsafeLanguageFindings.some((item) => item.type === "PRESSURE_MECHANICS"));
});

test("Safe language does not auto-rewrite send task or escalate", () => {
  const result = buildMickManagerNoSurveillanceGuardrailIntake(validPacket());
  assert.strictEqual(result.autoRewriteAllowed, false);
  assert.strictEqual(result.autoSendAllowed, false);
  assert.strictEqual(result.autoTaskAllowed, false);
  assert.strictEqual(result.autoEscalationAllowed, false);
});

test("Missing language samples remains UNKNOWN/review context, not zero", () => {
  const result = buildMickManagerNoSurveillanceGuardrailIntake();
  assert.strictEqual(result.status, STATUS.UNKNOWN);
  assert.strictEqual(result.requiresHumanReview, true);
});

test("Forbidden uses are blocked", () => {
  const result = buildMickManagerNoSurveillanceGuardrailIntake(validPacket(), {
    requestedUse: "HR_DECISION",
  });
  assert.strictEqual(result.decision, DECISION.BLOCK);
});

test("Allowed uses are allowed", () => {
  const result = buildMickManagerNoSurveillanceGuardrailIntake(validPacket(), {
    requestedUse: "HUMAN_REVIEW_CONTEXT",
  });
  assert.strictEqual(result.decision, DECISION.ALLOW);
});

test("Inputs are not mutated", () => {
  const input = validPacket({ languageSamples: ["Support context only."] });
  const before = clone(input);
  buildMickManagerNoSurveillanceGuardrailIntake(input);
  assert.deepStrictEqual(input, before);
});

test("No direct Mick runtime message or task imports", () => {
  const source = fs.readFileSync(path.join(__dirname, "../context-intake/mick-manager-no-surveillance-guardrail-intake.js"), "utf8");
  const importLines = source.split(/\r?\n/).filter((line) => /(require\s*\(|from\s+["'])/.test(line));
  assert(!importLines.some((line) => /mick-core|mick-runtime|gmail|calendar|task|manager-os|advisor-os/.test(line)));
});

test("All truth and action flags remain false except context markers", () => {
  const result = buildMickManagerNoSurveillanceGuardrailIntake(validPacket());
  for (const [key, value] of Object.entries(result.flags)) {
    assert.strictEqual(value, false, `${key} should be false`);
  }
});

let pass = 0;
let fail = 0;

console.log("\nFORGE MICK MANAGER NO-SURVEILLANCE GUARDRAIL INTAKE MASTER TEST v1.0\n");

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
