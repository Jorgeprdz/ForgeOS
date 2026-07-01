"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");

const {
  buildGenesisBetaLoopOrchestrator,
  GENESIS_BETA_LOOP_STATUSES,
} = require("../genesis-beta-loop/genesis-beta-loop-orchestrator-boundary-contract");

const {
  buildAndresJuanBonusProximityFixture,
  buildLupitaMariaCarGoalFixture,
} = require("../genesis-beta-loop/fixtures/genesis-beta-loop-additional-scenarios.fixture");

let passed = 0;
const tests = [];
function test(name, fn) { tests.push({ name, fn }); }

function scenarioAdapters() {
  return {
    nashMickNba: (input) => ({
      status: "READY",
      recommendedAction: input.protectedContext && input.protectedContext.goal,
      targetPerson: input.protectedContext && input.protectedContext.targetPersonName,
      reasonWhy: "Signal supports a responsible follow-up.",
      whyNow: "Delay can cool the window.",
      whyThisPerson: "This person has relative signal.",
      whyThisAction: "Follow-up can clarify next step without pressure.",
      whyThisMessage: "Message should stay human and non-coercive.",
    }),
    promptBuilder: () => ({
      status: "PROMPT_INSTRUCTION_READY",
      promptInstruction: "Create a short human message without pressure or guarantees.",
    }),
    draftIntake: (input) => ({
      status: "DRAFT_RECEIVED_FOR_REVIEW",
      draftText: input.draftText,
      safeForSend: false,
    }),
    safetyValidator: () => ({
      status: "READY_FOR_HUMAN_REVIEW",
      safeForHumanReview: true,
      safeForSend: false,
      risks: [],
    }),
    humanApprovalGate: (input) => ({
      approvalGateStatus: input.action === "APPROVE"
        ? "APPROVED_FOR_DELIVERY_PREPARATION"
        : "READY_FOR_HUMAN_REVIEW",
      sendsMessage: false,
    }),
    deliveryAdapter: (input) => ({
      status: "DELIVERY_CANDIDATE_PREPARED",
      channel: input.channel,
      recipientDestination: input.recipientDestination,
      manualHandoffInstruction: "Prepare delivery candidate for human-controlled handoff. Do not send.",
      sendsMessage: false,
    }),
  };
}

function assertNoTruthFlags(out) {
  [
    "createsRevenueTruth",
    "createsCompensationTruth",
    "createsPayoutTruth",
    "createsLifecycleTruth",
    "createsHrTruth",
    "createsRankingTruth",
    "createsPunishmentTruth",
    "createsPersonalityTruth",
  ].forEach((flag) => assert.strictEqual(out[flag], false, flag));
}

function assertNoSend(out) {
  assert.strictEqual(out.deliveryCandidateOnly, true);
  assert.strictEqual(out.sendExecutionRequiredSeparately, true);
  assert.strictEqual(out.sendsMessage, false);
  assert.strictEqual(out.executesSend, false);
  assert.strictEqual(out.stages.deliveryCandidate.sendsMessage, false);
}

test("Andres/Juan fixture represents candidate commission without payout truth", () => {
  const fixture = buildAndresJuanBonusProximityFixture();
  assert.strictEqual(fixture.scenarioId, "ANDRES_JUAN_BONUS_PROXIMITY_001");
  assert.strictEqual(fixture.targetPerson.displayName, "Juan");
  assert.strictEqual(fixture.nbaContext.candidateCommissionContext.notPayoutTruth, true);
  assert.strictEqual(fixture.nbaContext.candidateCommissionContext.notGuaranteed, true);
});

test("Andres/Juan scenario prepares delivery candidate without send or payout truth", () => {
  const out = buildGenesisBetaLoopOrchestrator(buildAndresJuanBonusProximityFixture(), scenarioAdapters());
  assert.strictEqual(out.status, GENESIS_BETA_LOOP_STATUSES.DELIVERY_CANDIDATE_PREPARED);
  assertNoSend(out);
  assertNoTruthFlags(out);
});

test("Lupita/Maria fixture represents goal motivation without compensation truth", () => {
  const fixture = buildLupitaMariaCarGoalFixture();
  assert.strictEqual(fixture.scenarioId, "LUPITA_MARIA_CAR_GOAL_001");
  assert.strictEqual(fixture.actor.displayName, "Lupita");
  assert.strictEqual(fixture.nbaContext.goalContext.notCompensationTruth, true);
  assert.strictEqual(fixture.nbaContext.goalContext.notGuaranteed, true);
});

test("Lupita/Maria scenario prepares delivery candidate without send or compensation truth", () => {
  const out = buildGenesisBetaLoopOrchestrator(buildLupitaMariaCarGoalFixture(), scenarioAdapters());
  assert.strictEqual(out.status, GENESIS_BETA_LOOP_STATUSES.DELIVERY_CANDIDATE_PREPARED);
  assertNoSend(out);
  assertNoTruthFlags(out);
});

test("both scenarios require human approval before delivery candidate", () => {
  for (const fixture of [buildAndresJuanBonusProximityFixture(), buildLupitaMariaCarGoalFixture()]) {
    delete fixture.humanApproval;
    const out = buildGenesisBetaLoopOrchestrator(fixture, scenarioAdapters());
    assert.strictEqual(out.status, GENESIS_BETA_LOOP_STATUSES.NEEDS_HUMAN_APPROVAL);
    assert.strictEqual(out.stages.deliveryCandidate, null);
  }
});

test("fixture file does not import send provider or runtime modules", () => {
  const source = fs.readFileSync(path.join(__dirname, "../genesis-beta-loop/fixtures/genesis-beta-loop-additional-scenarios.fixture.js"), "utf8");
  assert.ok(!/require\(['"](child_process|http|https|net|dns|axios)['"]\)/.test(source));
  assert.ok(!/fetch\(|XMLHttpRequest|navigator\.sendBeacon|serviceWorker/.test(source));
});

for (const { name, fn } of tests) {
  try {
    fn();
    passed += 1;
  } catch (error) {
    console.error(`FAIL - ${name}`);
    console.error(error);
    process.exit(1);
  }
}
console.log(`Genesis Beta Loop Additional Scenario Fixtures PASS ${passed}/${tests.length}`);
