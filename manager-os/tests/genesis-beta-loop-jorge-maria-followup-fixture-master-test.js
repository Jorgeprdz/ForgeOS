"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");

const {
  buildGenesisBetaLoopOrchestrator,
  GENESIS_BETA_LOOP_STATUSES,
} = require("../genesis-beta-loop/genesis-beta-loop-orchestrator-boundary-contract");

const {
  buildJorgeMariaFollowup15DaysFixture,
} = require("../genesis-beta-loop/fixtures/jorge-maria-followup-15-days.fixture");

let passed = 0;
const tests = [];
function test(name, fn) { tests.push({ name, fn }); }

function scenarioAdapters() {
  return {
    nashMickNba: (input) => ({
      status: "READY",
      recommendedAction: input.protectedContext && input.protectedContext.goal,
      targetPerson: "Maria",
      reasonWhy: "Hay seguimiento pendiente y conviene reabrir la conversacion de forma ligera.",
      whyNow: "Han pasado 15 dias; la ventana puede enfriarse.",
      whyThisPerson: "Maria tiene contexto previo.",
      whyThisAction: "Un follow-up breve reduce friccion.",
      whyThisMessage: "Mensaje sin presion protege confianza.",
      conversationAngle: "ligero, humano, sin presion",
      objectionSupport: "abrir puerta a retomar despues",
    }),
    promptBuilder: (input) => ({
      status: "PROMPT_INSTRUCTION_READY",
      promptInstruction: "Escribe un mensaje breve, calido, sin presion y sin inventar intencion.",
      nbaReasonWhy: input.nbaReasonWhy,
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
      createsTask: false,
    }),
    deliveryAdapter: (input) => ({
      status: "DELIVERY_CANDIDATE_PREPARED",
      channel: input.channel,
      recipientDestination: input.recipientDestination,
      manualHandoffInstruction: "Prepare whatsapp delivery candidate for human-controlled handoff. Do not send.",
      linkCandidate: "https://wa.me/525500000000?text=fixture",
      sendsMessage: false,
    }),
  };
}

test("fixture builds the Jorge to Maria 15-day follow-up scenario", () => {
  const fixture = buildJorgeMariaFollowup15DaysFixture();
  assert.strictEqual(fixture.scenarioId, "JORGE_MARIA_FOLLOWUP_15_DAYS_001");
  assert.strictEqual(fixture.targetPerson.displayName, "Maria");
  assert.strictEqual(fixture.mickContext.lastContactDaysAgo, 15);
  assert.ok(fixture.nbaContext.whyNow.includes("15 dias"));
});

test("scenario produces voluntary explained action through the loop", () => {
  const fixture = buildJorgeMariaFollowup15DaysFixture();
  const out = buildGenesisBetaLoopOrchestrator(fixture, scenarioAdapters());
  assert.strictEqual(out.status, GENESIS_BETA_LOOP_STATUSES.DELIVERY_CANDIDATE_PREPARED);
  assert.ok(out.stages.nashMickNba.reasonWhy);
  assert.ok(out.stages.nashMickNba.whyNow);
  assert.ok(out.stages.nashMickNba.whyThisPerson);
  assert.ok(out.stages.nashMickNba.whyThisAction);
  assert.ok(out.stages.nashMickNba.whyThisMessage);
});

test("scenario keeps delivery candidate separate from send", () => {
  const out = buildGenesisBetaLoopOrchestrator(buildJorgeMariaFollowup15DaysFixture(), scenarioAdapters());
  assert.strictEqual(out.deliveryCandidateOnly, true);
  assert.strictEqual(out.sendExecutionRequiredSeparately, true);
  assert.strictEqual(out.sendsMessage, false);
  assert.strictEqual(out.executesSend, false);
  assert.strictEqual(out.stages.deliveryCandidate.sendsMessage, false);
});

test("scenario preserves all prohibited truth flags as false", () => {
  const out = buildGenesisBetaLoopOrchestrator(buildJorgeMariaFollowup15DaysFixture(), scenarioAdapters());
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
});

test("scenario requires human approval before delivery candidate", () => {
  const fixture = buildJorgeMariaFollowup15DaysFixture();
  delete fixture.humanApproval;
  const out = buildGenesisBetaLoopOrchestrator(fixture, scenarioAdapters());
  assert.strictEqual(out.status, GENESIS_BETA_LOOP_STATUSES.NEEDS_HUMAN_APPROVAL);
  assert.strictEqual(out.stages.deliveryCandidate, null);
});

test("fixture does not import send/provider/runtime modules", () => {
  const fixtureSource = fs.readFileSync(path.join(__dirname, "../genesis-beta-loop/fixtures/jorge-maria-followup-15-days.fixture.js"), "utf8");
  assert.ok(!/require\(['"](child_process|http|https|net|dns|axios)['"]\)/.test(fixtureSource));
  assert.ok(!/fetch\(|XMLHttpRequest|navigator\.sendBeacon|serviceWorker/.test(fixtureSource));
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
console.log(`Genesis Beta Loop Jorge/Maria Follow-up Fixture PASS ${passed}/${tests.length}`);
