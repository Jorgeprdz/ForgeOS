"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");

const {
  buildGenesisBetaLoopOrchestrator,
  GENESIS_BETA_LOOP_STATUSES,
  GENESIS_BETA_LOOP_DECISIONS,
  GENESIS_BETA_LOOP_ARTICLE_0_PRINCIPLE,
  GENESIS_BETA_LOOP_ARTICLE_0_GATE,
} = require("../genesis-beta-loop/genesis-beta-loop-orchestrator-boundary-contract");

let passed = 0;
const tests = [];
function test(name, fn) { tests.push({ name, fn }); }

function adapters() {
  return {
    nashMickNba: () => ({ reasonWhy: "Retomar porque la ventana puede enfriarse." }),
    promptBuilder: () => ({ promptInstruction: "Mensaje ligero sin presion." }),
    draftIntake: (input) => ({ draftText: input.draftText, safeForSend: false }),
    safetyValidator: () => ({ safeForHumanReview: true, safeForSend: false }),
    humanApprovalGate: (input) => ({
      approvalGateStatus: input.action === "APPROVE"
        ? "APPROVED_FOR_DELIVERY_PREPARATION"
        : "READY_FOR_HUMAN_REVIEW",
    }),
    deliveryAdapter: (input) => ({
      status: "DELIVERY_CANDIDATE_PREPARED",
      channel: input.channel,
      sendsMessage: false,
    }),
  };
}

function validInput() {
  return {
    protectedContext: { managerId: "jorge", prospectName: "Maria" },
    nashContext: { angle: "follow-up" },
    mickContext: { lastContactDaysAgo: 15 },
    draftText: "Hola Maria, te escribo para retomar nuestra conversacion sin presion.",
    humanApproval: { reviewer: "Jorge", action: "APPROVE", artifactHash: "hash-123" },
    delivery: { channel: "whatsapp", recipientDestination: "+525500000000" },
    evidenceRefs: ["ev-1", "ev-1"],
    sourceOwners: ["manager-context", "manager-context"],
    freshness: "FRESH",
  };
}

test("full loop prepares delivery candidate without sending", () => {
  const out = buildGenesisBetaLoopOrchestrator(validInput(), adapters());
  assert.strictEqual(out.status, GENESIS_BETA_LOOP_STATUSES.DELIVERY_CANDIDATE_PREPARED);
  assert.strictEqual(out.decision, GENESIS_BETA_LOOP_DECISIONS.PREPARE_DELIVERY_CANDIDATE);
  assert.strictEqual(out.sendsMessage, false);
  assert.strictEqual(out.executesSend, false);
  assert.strictEqual(out.stages.deliveryCandidate.sendsMessage, false);
});

test("missing draft blocks later draft/safety/delivery path", () => {
  const input = validInput();
  delete input.draftText;
  const out = buildGenesisBetaLoopOrchestrator(input, adapters());
  assert.strictEqual(out.status, GENESIS_BETA_LOOP_STATUSES.NEEDS_DRAFT);
  assert.ok(out.blockedStages.includes("DRAFT_REQUIRED"));
  assert.strictEqual(out.stages.draftIntake, null);
  assert.strictEqual(out.stages.safetyValidator, null);
});

test("missing human approval blocks delivery", () => {
  const input = validInput();
  delete input.humanApproval;
  const out = buildGenesisBetaLoopOrchestrator(input, adapters());
  assert.strictEqual(out.status, GENESIS_BETA_LOOP_STATUSES.NEEDS_HUMAN_APPROVAL);
  assert.ok(out.blockedStages.includes("HUMAN_APPROVAL_REQUIRED"));
  assert.strictEqual(out.stages.deliveryCandidate, null);
});

test("non-approved human gate blocks delivery", () => {
  const input = validInput();
  input.humanApproval.action = "REQUEST_CHANGES";
  const out = buildGenesisBetaLoopOrchestrator(input, adapters());
  assert.strictEqual(out.status, GENESIS_BETA_LOOP_STATUSES.NEEDS_HUMAN_APPROVAL);
  assert.ok(out.blockedStages.includes("APPROVED_FOR_DELIVERY_PREPARATION_REQUIRED"));
  assert.strictEqual(out.stages.deliveryCandidate, null);
});

test("inputs are not mutated", () => {
  const input = validInput();
  const before = JSON.stringify(input);
  buildGenesisBetaLoopOrchestrator(input, adapters());
  assert.strictEqual(JSON.stringify(input), before);
});

test("dedupes evidence and source owners", () => {
  const out = buildGenesisBetaLoopOrchestrator(validInput(), adapters());
  assert.deepStrictEqual(out.evidenceRefs, ["ev-1"]);
  assert.deepStrictEqual(out.sourceOwners, ["manager-context"]);
});

test("all prohibited flags remain false", () => {
  const out = buildGenesisBetaLoopOrchestrator(validInput(), adapters());
  [
    "automaticExecutionAllowed",
    "sendsMessage",
    "executesSend",
    "executesProviderRuntime",
    "executesLlmRuntime",
    "createsTask",
    "createsCalendarEvent",
    "createsCrmWrite",
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

test("boundaries remain explicit", () => {
  const out = buildGenesisBetaLoopOrchestrator(validInput(), adapters());
  assert.strictEqual(out.humanApprovalRequired, true);
  assert.strictEqual(out.deliveryCandidateOnly, true);
  assert.strictEqual(out.sendExecutionRequiredSeparately, true);
  assert.strictEqual(out.notFinalAuthority, true);
  assert.strictEqual(out.doesNotReplaceHumanResponsibility, true);
  assert.ok(out.boundaries.includes("Delivery candidate is not send"));
  assert.ok(out.boundaries.includes("Send Execution Gate remains separate"));
  assert.ok(out.boundaries.includes("Forge is not final authority"));
});

test("missing adapters become warnings, not runtime execution", () => {
  const out = buildGenesisBetaLoopOrchestrator(validInput(), {});
  assert.ok(out.warnings.length >= 1);
  assert.strictEqual(out.sendsMessage, false);
  assert.strictEqual(out.executesProviderRuntime, false);
});

test("engine avoids forbidden runtime imports", () => {
  const source = fs.readFileSync(path.join(__dirname, "../genesis-beta-loop/genesis-beta-loop-orchestrator-boundary-contract.js"), "utf8");
  assert.ok(!/require\(['"](fs|child_process|http|https|net|dns|axios)['"]\)/.test(source));
  assert.ok(!/fetch\(|XMLHttpRequest|navigator\.sendBeacon|serviceWorker/.test(source));
  assert.ok(!source.includes("send-execution"));
});

test("Article 0 fields appear in Genesis Beta Loop output", () => {
  const out = buildGenesisBetaLoopOrchestrator(validInput(), adapters());
  assert.strictEqual(out.article0Status, "ARTICLE_0_ACTIVE");
  assert.strictEqual(out.article0Principle, GENESIS_BETA_LOOP_ARTICLE_0_PRINCIPLE);
  assert.strictEqual(out.article0Gate, GENESIS_BETA_LOOP_ARTICLE_0_GATE);
  assert.strictEqual(out.strengthensHumanJudgment, true);
  assert.strictEqual(out.dependencyRiskReviewed, true);
  assert.strictEqual(out.finalAuthority, "HUMAN");
  assert.strictEqual(out.forgeRole, "AUGMENTS_JUDGMENT");
});

test("Article 0 read model exposes evidence reasoning uncertainty and missing context", () => {
  const input = validInput();
  delete input.draftText;
  const out = buildGenesisBetaLoopOrchestrator(input, adapters());
  assert.strictEqual(out.reasoningVisible, true);
  assert.strictEqual(out.uncertaintyVisible, true);
  assert.strictEqual(out.evidenceVisible, true);
  assert.strictEqual(out.missingContextVisible, true);
  assert.ok(out.article0ReadModel.evidence.evidenceRefs.includes("ev-1"));
  assert.ok(out.article0ReadModel.uncertainty.blockedStages.includes("DRAFT_REQUIRED"));
  assert.ok(out.article0ReadModel.missingContext.signals.includes("blocked:DRAFT_REQUIRED"));
  assert.strictEqual(out.article0ReadModel.reasoning.stageOutputsPreserved, true);
});

test("Article 0 requires human decision checkpoint and learning prompt", () => {
  const out = buildGenesisBetaLoopOrchestrator(validInput(), adapters());
  assert.strictEqual(out.humanDecisionCheckpointRequired, true);
  assert.strictEqual(out.article0ReadModel.humanDecisionCheckpoint.required, true);
  assert.ok(out.learningPrompt.includes("What evidence supports this?"));
  assert.ok(out.learningPrompt.includes("What context is missing?"));
  assert.ok(out.learningPrompt.includes("What would make this recommendation wrong?"));
  assert.ok(out.learningPrompt.includes("What should the human decide before any communication?"));
  assert.ok(out.learningPrompt.includes("What should the advisor or manager learn from this case?"));
  assert.ok(out.judgmentDevelopmentPrompt.length >= 1);
});

test("Article 0 output does not become final authority or command", () => {
  const out = buildGenesisBetaLoopOrchestrator(validInput(), adapters());
  assert.strictEqual(out.finalAuthority, "HUMAN");
  assert.strictEqual(out.notFinalAuthority, true);
  assert.strictEqual(out.actionBoundary.notCommand, true);
  assert.strictEqual(out.actionBoundary.notSend, true);
  assert.strictEqual(out.actionBoundary.notDeliveryApproval, true);
  assert.strictEqual(out.article0ReadModel.actionBoundary.forgeIsNotFinalAuthority, true);
});

test("Article 0 output preserves NOT_MODELED blocked and warning states", () => {
  const input = validInput();
  delete input.humanApproval;
  const notModeledAdapters = adapters();
  notModeledAdapters.nashMickNba = () => ({ status: "NOT_MODELED", warning: "payload alignment remains future work" });
  const out = buildGenesisBetaLoopOrchestrator(input, notModeledAdapters);
  assert.strictEqual(out.stages.nashMickNba.status, "NOT_MODELED");
  assert.ok(out.blockedStages.includes("HUMAN_APPROVAL_REQUIRED"));
  assert.ok(out.article0ReadModel.uncertainty.stageSignals.includes("nashMickNba: NOT_MODELED"));
  assert.ok(out.article0ReadModel.uncertainty.blockedStages.includes("HUMAN_APPROVAL_REQUIRED"));
  assert.strictEqual(out.sendsMessage, false);
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
console.log(`Genesis Beta Loop Orchestrator Boundary Contract PASS ${passed}/${tests.length}`);
