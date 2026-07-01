"use strict";

const assert = require("assert");

const {
  buildGenesisBetaLoopRealResponse,
  buildGenesisBetaLoopRealResponseTables,
  inspectGenesisBetaLoopRealAdapters,
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

const requiredStages = [
  "nashMickNba",
  "promptBuilder",
  "draftIntake",
  "safetyValidator",
  "humanApprovalGate",
  "deliveryAdapter",
];

const expectedRequestedUses = Object.freeze({
  nashMickNba: "FOLLOWUP_REASON_WHY",
  promptBuilder: "FOLLOW_UP_PROMPT_PREP",
  draftIntake: "LLM_DRAFT_INTAKE",
  safetyValidator: "SAFETY_REVIEW_PREP",
  humanApprovalGate: "MESSAGE_DELIVERY_PREP_REVIEW",
  deliveryAdapter: "WHATSAPP_LINK_PREP",
});

function scenarios() {
  return [
    buildJorgeMariaFollowup15DaysFixture(),
    buildAndresJuanBonusProximityFixture(),
    buildLupitaMariaCarGoalFixture(),
  ];
}

function assertFalseFlags(out) {
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
}

test("real adapter modules load and expose callable functions", () => {
  const diagnostics = inspectGenesisBetaLoopRealAdapters();
  for (const stage of requiredStages) {
    assert.ok(diagnostics[stage], stage);
    assert.strictEqual(diagnostics[stage].moduleLoaded, true, stage);
    assert.strictEqual(diagnostics[stage].functionFound, true, stage);
  }
});

test("real adapter diagnostics expose contract-allowed requestedUse values", () => {
  const diagnostics = inspectGenesisBetaLoopRealAdapters();
  for (const stage of requiredStages) {
    assert.strictEqual(diagnostics[stage].requestedUse, expectedRequestedUses[stage], stage);
  }
});

test("real response can be built for all Genesis scenario fixtures", () => {
  for (const fixture of scenarios()) {
    const response = buildGenesisBetaLoopRealResponse(fixture);
    assert.strictEqual(response.scenarioId, fixture.scenarioId);
    assert.ok(response.output.status);
    assert.ok(response.output.stages);
    assertFalseFlags(response.output);
  }
});

test("valid scenario payloads avoid unnecessary NOT_MODELED in mapped stages", () => {
  for (const fixture of scenarios()) {
    const stages = buildGenesisBetaLoopRealResponse(fixture).output.stages;
    assert.notStrictEqual(stages.nashMickNba.reconnectionStatus, "NOT_MODELED", fixture.scenarioId);
    assert.notStrictEqual(stages.promptBuilder.promptStatus, "NOT_MODELED", fixture.scenarioId);
    assert.notStrictEqual(stages.draftIntake.intakeStatus, "NOT_MODELED", fixture.scenarioId);
    assert.notStrictEqual(stages.safetyValidator.safetyStatus, "NOT_MODELED", fixture.scenarioId);
  }
});

test("scenario evidence, source owners, and freshness survive through real payload pipeline", () => {
  const fixture = buildJorgeMariaFollowup15DaysFixture();
  const stages = buildGenesisBetaLoopRealResponse(fixture).output.stages;

  assert.deepStrictEqual(stages.nashMickNba.evidenceRefs, fixture.evidenceRefs);
  assert.deepStrictEqual(stages.nashMickNba.sourceOwners, fixture.sourceOwners);
  assert.strictEqual(stages.nashMickNba.freshness, fixture.freshness);

  assert.deepStrictEqual(stages.promptBuilder.evidenceRefs, fixture.evidenceRefs);
  assert.deepStrictEqual(stages.promptBuilder.sourceOwners, fixture.sourceOwners);
  assert.strictEqual(stages.promptBuilder.freshness, fixture.freshness);

  assert.deepStrictEqual(stages.draftIntake.evidenceRefs, fixture.evidenceRefs);
  assert.deepStrictEqual(stages.draftIntake.sourceOwners, fixture.sourceOwners);
  assert.strictEqual(stages.draftIntake.freshness, fixture.freshness);

  assert.deepStrictEqual(stages.safetyValidator.evidenceRefs, fixture.evidenceRefs);
  assert.deepStrictEqual(stages.safetyValidator.sourceOwners, fixture.sourceOwners);
  assert.strictEqual(stages.safetyValidator.freshness, fixture.freshness);
});

test("real response table output is markdown and includes stages", () => {
  const table = buildGenesisBetaLoopRealResponseTables(buildJorgeMariaFollowup15DaysFixture());
  assert.ok(table.includes("| Field | Value |"));
  assert.ok(table.includes("| Adapter | Real module status |"));
  assert.ok(table.includes("| Stage | Real output |"));
  assert.ok(table.includes("nashMickNba"));
  assert.ok(table.includes("promptBuilder"));
  assert.ok(table.includes("humanApprovalGate"));
});

test("real response includes Article 0 read-model alignment", () => {
  const response = buildGenesisBetaLoopRealResponse(buildJorgeMariaFollowup15DaysFixture());
  assert.strictEqual(response.output.article0Status, "ARTICLE_0_ACTIVE");
  assert.strictEqual(response.output.article0Principle, "Forge exists to strengthen human judgment, not replace it.");
  assert.strictEqual(response.output.article0Gate, "Does this strengthen human judgment, or does it create dependency?");
  assert.strictEqual(response.output.finalAuthority, "HUMAN");
  assert.strictEqual(response.output.forgeRole, "AUGMENTS_JUDGMENT");
  assert.strictEqual(response.output.humanDecisionCheckpointRequired, true);
  assert.strictEqual(response.output.reasoningVisible, true);
  assert.strictEqual(response.output.uncertaintyVisible, true);
  assert.strictEqual(response.output.evidenceVisible, true);
  assert.strictEqual(response.output.missingContextVisible, true);
  assert.ok(response.output.article0ReadModel.learningPrompt.includes("What evidence supports this?"));
});

test("real response table renders Article 0 alignment fields", () => {
  const table = buildGenesisBetaLoopRealResponseTables(buildJorgeMariaFollowup15DaysFixture());
  assert.ok(table.includes("article0Status"));
  assert.ok(table.includes("ARTICLE_0_ACTIVE"));
  assert.ok(table.includes("article0Gate"));
  assert.ok(table.includes("finalAuthority"));
  assert.ok(table.includes("learningPrompt"));
  assert.ok(table.includes("judgmentDevelopmentPrompt"));
  assert.ok(table.includes("actionBoundary"));
});

test("real wiring preserves delivery candidate and send separation", () => {
  const response = buildGenesisBetaLoopRealResponse(buildJorgeMariaFollowup15DaysFixture());
  assert.strictEqual(response.output.humanApprovalRequired, true);
  assert.strictEqual(response.output.deliveryCandidateOnly, true);
  assert.strictEqual(response.output.sendExecutionRequiredSeparately, true);
  assert.strictEqual(response.output.sendsMessage, false);
  assert.strictEqual(response.output.executesSend, false);
});

test("human approval remains required and delivery stays blocked without valid approval", () => {
  const response = buildGenesisBetaLoopRealResponse(buildJorgeMariaFollowup15DaysFixture());
  assert.strictEqual(response.output.humanApprovalRequired, true);
  assert.notStrictEqual(
    response.output.stages.humanApprovalGate.approvalGateStatus,
    "APPROVED_FOR_DELIVERY_PREPARATION"
  );
  assert.strictEqual(response.output.stages.deliveryCandidate, null);
  assert.ok(response.output.blockedStages.includes("APPROVED_FOR_DELIVERY_PREPARATION_REQUIRED"));
});

test("unknown requestedUse remains NOT_MODELED only when intentionally unmapped", () => {
  const fixture = buildJorgeMariaFollowup15DaysFixture();
  const response = buildGenesisBetaLoopRealResponse({
    ...fixture,
    requestedUses: {
      nashMickNba: "UNMAPPED_REAL_USE",
    },
  });
  assert.strictEqual(response.output.stages.nashMickNba.reconnectionStatus, "NOT_MODELED");
  assert.ok(response.output.stages.nashMickNba.blockedUses.includes("UNMAPPED_REAL_USE"));
  assert.notStrictEqual(response.output.stages.promptBuilder.promptStatus, "NOT_MODELED");
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
console.log("Genesis Beta Loop Real Adapter Wiring PASS " + passed + "/" + tests.length);
