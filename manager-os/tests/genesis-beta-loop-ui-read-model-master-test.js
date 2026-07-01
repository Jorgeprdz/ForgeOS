"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");

const {
  buildGenesisBetaLoopUiReadModel,
} = require("../genesis-beta-loop/genesis-beta-loop-ui-read-model");

const {
  buildGenesisBetaLoopHumanReviewPacket,
} = require("../genesis-beta-loop/genesis-beta-loop-human-review-packet");

const {
  buildJorgeMariaFollowup15DaysFixture,
} = require("../genesis-beta-loop/fixtures/jorge-maria-followup-15-days.fixture");

const {
  buildAndresJuanBonusProximityFixture,
  buildLupitaMariaCarGoalFixture,
} = require("../genesis-beta-loop/fixtures/genesis-beta-loop-additional-scenarios.fixture");

let passed = 0;
const tests = [];
function test(name, fn) { tests.push({ name, fn }); }

function fixtures() {
  return [
    buildJorgeMariaFollowup15DaysFixture(),
    buildAndresJuanBonusProximityFixture(),
    buildLupitaMariaCarGoalFixture(),
  ];
}

function findCard(model, scenarioId) {
  return model.cards.find((card) => card.scenarioId === scenarioId);
}

function assertFalseActionFlags(target) {
  [
    "approvalGranted",
    "approvedForDeliveryPreparation",
    "approvedForSendExecution",
    "deliveryCandidateCreated",
    "sendable",
    "canApproveInThisModel",
    "canSendInThisModel",
    "canCreateTaskInThisModel",
    "canCreateCalendarInThisModel",
    "canCreateTruthInThisModel",
    "sendsMessage",
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
  ].forEach((flag) => assert.strictEqual(target[flag], false, flag));
}

test("UI read model builds for all three existing packets and scenarios", () => {
  const packetInputs = fixtures().map(buildGenesisBetaLoopHumanReviewPacket);
  const modelFromPackets = buildGenesisBetaLoopUiReadModel({ packets: packetInputs });
  const modelFromScenarios = buildGenesisBetaLoopUiReadModel({ scenarios: fixtures() });

  assert.strictEqual(modelFromPackets.cards.length, 3);
  assert.strictEqual(modelFromScenarios.cards.length, 3);
  assert.ok(findCard(modelFromPackets, "JORGE_MARIA_FOLLOWUP_15_DAYS_001"));
  assert.ok(findCard(modelFromPackets, "ANDRES_JUAN_BONUS_PROXIMITY_001"));
  assert.ok(findCard(modelFromPackets, "LUPITA_MARIA_CAR_GOAL_001"));
});

test("Top-level model is read-only and Article 0 active", () => {
  const model = buildGenesisBetaLoopUiReadModel(fixtures());
  assert.strictEqual(model.readModelStatus, "READY_FOR_UI_READ_MODEL");
  assert.strictEqual(model.readModelDecision, "PRESENT_REVIEW_PACKET_AS_READ_ONLY_UI_MODEL");
  assert.strictEqual(model.article0Status, "ARTICLE_0_ACTIVE");
  assert.strictEqual(model.article0Principle, "Forge exists to strengthen human judgment, not replace it.");
  assert.strictEqual(model.finalAuthority, "HUMAN");
  assert.strictEqual(model.reviewOnly, true);
  assert.strictEqual(model.humanDecisionCheckpointRequired, true);
  assertFalseActionFlags(model);
});

test("Cards include evidence, reasoning, uncertainty, missing context, questions, and prerequisites", () => {
  const model = buildGenesisBetaLoopUiReadModel(fixtures());

  for (const card of model.cards) {
    assert.ok(card.evidenceSummary.evidenceRefs.length > 0);
    assert.ok(card.evidenceSummary.sourceOwners.length > 0);
    assert.strictEqual(card.evidenceSummary.freshness, "FRESH");
    assert.ok(card.reasoningSummary.reasonWhy);
    assert.ok(card.uncertaintySummary.blockedStages.length > 0);
    assert.ok(card.missingContextSummary.missingContext.length > 0);
    assert.ok(card.humanReviewQuestions.includes("What evidence supports this follow-up?"));
    assert.ok(card.approvalPrerequisites.includes("explicit_human_approval_gate_required"));
    assert.ok(card.candidateDraftPreview);
  }
});

test("Jorge/Maria card labels follow-up as context, not send approval", () => {
  const card = findCard(buildGenesisBetaLoopUiReadModel(fixtures()), "JORGE_MARIA_FOLLOWUP_15_DAYS_001");
  assert.strictEqual(card.subtitle, "relationship follow-up context, not send approval");
  assert.ok(card.title.includes("Jorge / Maria"));
});

test("Andres/Juan card labels bonus as motivational context and not payout truth", () => {
  const card = findCard(buildGenesisBetaLoopUiReadModel(fixtures()), "ANDRES_JUAN_BONUS_PROXIMITY_001");
  assert.strictEqual(card.subtitle, "motivational context / candidate estimate, not payout truth");
  assert.ok(card.subtitle.includes("not payout truth"));
});

test("Lupita/Maria card labels car goal as motivation context and not compensation truth", () => {
  const card = findCard(buildGenesisBetaLoopUiReadModel(fixtures()), "LUPITA_MARIA_CAR_GOAL_001");
  assert.strictEqual(card.subtitle, "motivation context, not compensation truth");
  assert.ok(card.subtitle.includes("not compensation truth"));
});

test("Approval send task calendar and truth actions are unavailable", () => {
  const model = buildGenesisBetaLoopUiReadModel(fixtures());
  assertFalseActionFlags(model);
  model.cards.forEach(assertFalseActionFlags);
});

test("Delivery preparation remains locked", () => {
  const model = buildGenesisBetaLoopUiReadModel(fixtures());
  for (const card of model.cards) {
    assert.strictEqual(card.approvalBadge.approvedForDeliveryPreparation, false);
    assert.strictEqual(card.actionBoundary.deliveryPreparationLocked, true);
    assert.strictEqual(card.actionBoundary.notDeliveryCandidate, true);
    assert.strictEqual(card.boundaryBadge.sendable, false);
  }
});

test("Inputs are not mutated", () => {
  const input = fixtures();
  const before = JSON.stringify(input);
  buildGenesisBetaLoopUiReadModel(input);
  assert.strictEqual(JSON.stringify(input), before);
});

test("No UI frontend provider runtime or send imports exist", () => {
  const source = fs.readFileSync(path.join(__dirname, "../genesis-beta-loop/genesis-beta-loop-ui-read-model.js"), "utf8");
  assert.ok(!/react|vue|svelte|document\\.|window\\.|jsx|tsx/.test(source));
  assert.ok(!/openai|anthropic|gemini|fetch\(|XMLHttpRequest|navigator\.sendBeacon/.test(source));
  assert.ok(!/whatsapp|sms|delivery-adapter|send-execution|child_process|http|https|net|dns/.test(source));
});

for (const { name, fn } of tests) {
  try {
    fn();
    passed += 1;
  } catch (error) {
    console.error("FAIL - " + name);
    console.error(error);
    process.exit(1);
  }
}

console.log("Genesis Beta Loop UI Read Model PASS " + passed + "/" + tests.length);
