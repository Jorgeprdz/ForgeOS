"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");

const {
  buildGenesisBetaLoopHumanReviewPacket,
} = require("../genesis-beta-loop/genesis-beta-loop-human-review-packet");

const {
  buildGenesisBetaLoopRealResponse,
} = require("../genesis-beta-loop/genesis-beta-loop-real-adapter-wiring");

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

function assertFalseBoundaryFlags(packet) {
  [
    "approvalGranted",
    "approvedForDeliveryPreparation",
    "approvedForSendExecution",
    "deliveryCandidateCreated",
    "sendable",
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
  ].forEach((flag) => assert.strictEqual(packet[flag], false, flag));
}

function assertPacketReady(packet, fixture) {
  assert.strictEqual(packet.packetStatus, "READY_FOR_HUMAN_REVIEW_PACKET");
  assert.strictEqual(packet.packetDecision, "PRESENT_TO_HUMAN_FOR_REVIEW_ONLY");
  assert.strictEqual(packet.reviewOnly, true);
  assert.strictEqual(packet.scenarioId, fixture.scenarioId);
  assert.strictEqual(packet.candidateDraftText, fixture.draftText);
  assert.strictEqual(packet.safetyStatus, "READY_FOR_HUMAN_REVIEW");
  assert.strictEqual(packet.draftQualityStatus, "DRAFT_READY_FOR_HUMAN_REVIEW");
  assert.strictEqual(packet.reviewArtifactHashOnly, true);
  assert.ok(packet.reviewArtifactHash);
  assertFalseBoundaryFlags(packet);
}

test("Human Review Packet builds for Jorge/Maria", () => {
  assertPacketReady(
    buildGenesisBetaLoopHumanReviewPacket(buildJorgeMariaFollowup15DaysFixture()),
    buildJorgeMariaFollowup15DaysFixture()
  );
});

test("Human Review Packet builds for Andres/Juan", () => {
  assertPacketReady(
    buildGenesisBetaLoopHumanReviewPacket(buildAndresJuanBonusProximityFixture()),
    buildAndresJuanBonusProximityFixture()
  );
});

test("Human Review Packet builds for Lupita/Maria", () => {
  assertPacketReady(
    buildGenesisBetaLoopHumanReviewPacket(buildLupitaMariaCarGoalFixture()),
    buildLupitaMariaCarGoalFixture()
  );
});

test("Packet accepts already-built real response output", () => {
  const fixture = buildJorgeMariaFollowup15DaysFixture();
  const response = buildGenesisBetaLoopRealResponse(fixture);
  const packet = buildGenesisBetaLoopHumanReviewPacket(response);
  assertPacketReady(packet, fixture);
});

test("Packet includes Article 0 fields and finalAuthority HUMAN", () => {
  const packet = buildGenesisBetaLoopHumanReviewPacket(buildJorgeMariaFollowup15DaysFixture());
  assert.strictEqual(packet.article0Status, "ARTICLE_0_ACTIVE");
  assert.strictEqual(packet.article0Principle, "Forge exists to strengthen human judgment, not replace it.");
  assert.strictEqual(packet.article0Gate, "Does this strengthen human judgment, or does it create dependency?");
  assert.strictEqual(packet.finalAuthority, "HUMAN");
  assert.strictEqual(packet.forgeRole, "AUGMENTS_JUDGMENT");
  assert.strictEqual(packet.notFinalAuthority, true);
  assert.strictEqual(packet.doesNotReplaceHumanResponsibility, true);
});

test("Packet includes evidence, source owners, freshness, uncertainty, and missing context", () => {
  const packet = buildGenesisBetaLoopHumanReviewPacket(buildJorgeMariaFollowup15DaysFixture());
  assert.deepStrictEqual(packet.evidenceRefs, buildJorgeMariaFollowup15DaysFixture().evidenceRefs);
  assert.deepStrictEqual(packet.sourceOwners, buildJorgeMariaFollowup15DaysFixture().sourceOwners);
  assert.strictEqual(packet.freshness, "FRESH");
  assert.ok(packet.uncertainty.blockedStages.includes("APPROVED_FOR_DELIVERY_PREPARATION_REQUIRED"));
  assert.ok(packet.missingContext.includes("humanApprovalGate:reviewer_required"));
});

test("Packet includes judgment-development questions", () => {
  const packet = buildGenesisBetaLoopHumanReviewPacket(buildJorgeMariaFollowup15DaysFixture());
  assert.ok(packet.judgmentDevelopmentPrompt.includes("Explain the reasoning in your own words before acting."));
  assert.ok(packet.humanReviewQuestions.includes("What evidence supports this follow-up?"));
  assert.ok(packet.humanReviewQuestions.includes("Could this message create pressure or dependency?"));
});

test("Packet preserves safe-for-human-review status from 052H", () => {
  for (const fixture of fixtures()) {
    const packet = buildGenesisBetaLoopHumanReviewPacket(fixture);
    assert.strictEqual(packet.safetyStatus, "READY_FOR_HUMAN_REVIEW");
    assert.deepStrictEqual(packet.detectedRisks, []);
    assert.deepStrictEqual(packet.requiredRevisions, []);
  }
});

test("Packet does not approve delivery", () => {
  const packet = buildGenesisBetaLoopHumanReviewPacket(buildJorgeMariaFollowup15DaysFixture());
  assert.strictEqual(packet.approvalGranted, false);
  assert.strictEqual(packet.approvedForDeliveryPreparation, false);
  assert.ok(packet.approvalPrerequisites.includes("explicit_human_approval_gate_required"));
});

test("Packet does not create fake reviewer or fake approval", () => {
  const packet = buildGenesisBetaLoopHumanReviewPacket(buildJorgeMariaFollowup15DaysFixture());
  assert.strictEqual(packet.approvalGranted, false);
  assert.ok(packet.blockedReason.includes("reviewer_required"));
  assert.ok(!Object.prototype.hasOwnProperty.call(packet, "reviewerId"));
  assert.ok(!Object.prototype.hasOwnProperty.call(packet, "reviewerRole"));
});

test("Packet does not create delivery candidate", () => {
  const packet = buildGenesisBetaLoopHumanReviewPacket(buildJorgeMariaFollowup15DaysFixture());
  assert.strictEqual(packet.deliveryCandidateCreated, false);
  assert.strictEqual(packet.actionBoundary.notDeliveryCandidate, true);
  assert.strictEqual(packet.actionBoundary.deliveryPreparationLocked, true);
});

test("Packet is not sendable", () => {
  const packet = buildGenesisBetaLoopHumanReviewPacket(buildJorgeMariaFollowup15DaysFixture());
  assert.strictEqual(packet.sendable, false);
  assert.strictEqual(packet.actionBoundary.notSendable, true);
});

test("All send runtime task calendar and truth flags remain false", () => {
  assertFalseBoundaryFlags(buildGenesisBetaLoopHumanReviewPacket(buildJorgeMariaFollowup15DaysFixture()));
});

test("Human Approval Gate still blocks without real reviewer and approval", () => {
  for (const fixture of fixtures()) {
    const response = buildGenesisBetaLoopRealResponse(fixture);
    assert.strictEqual(response.output.stages.humanApprovalGate.approvalGateStatus, "NEEDS_REVIEWER");
    assert.strictEqual(response.output.stages.deliveryCandidate, null);
    const packet = buildGenesisBetaLoopHumanReviewPacket(response);
    assert.strictEqual(packet.approvedForDeliveryPreparation, false);
  }
});

test("Inputs are not mutated", () => {
  const fixture = buildJorgeMariaFollowup15DaysFixture();
  const before = JSON.stringify(fixture);
  buildGenesisBetaLoopHumanReviewPacket(fixture);
  assert.strictEqual(JSON.stringify(fixture), before);
});

test("No provider runtime or send imports exist", () => {
  const source = fs.readFileSync(path.join(__dirname, "../genesis-beta-loop/genesis-beta-loop-human-review-packet.js"), "utf8");
  assert.ok(!/openai|anthropic|gemini|fetch\(|XMLHttpRequest|navigator\\.sendBeacon/.test(source));
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

console.log("Genesis Beta Loop Human Review Packet PASS " + passed + "/" + tests.length);
