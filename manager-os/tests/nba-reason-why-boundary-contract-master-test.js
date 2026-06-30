"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");

const {
  buildNbaReasonWhyBoundary,
  NBA_REASON_WHY_STATUSES,
  NBA_REASON_WHY_ALLOWED_USES,
  NBA_REASON_WHY_FORBIDDEN_USES
} = require("../nba/nba-reason-why-boundary-contract");

let passCount = 0;

function test(name, fn) {
  fn();
  passCount += 1;
  console.log(`PASS ${passCount} - ${name}`);
}

function strongInput(overrides = {}) {
  return {
    advisorId: "advisor-1",
    managerId: "manager-1",
    personId: "maria-1",
    personType: "prospect",
    period: "2026-Q2",
    relationshipContext: {
      targetPerson: { personId: "maria-1", name: "Maria", personType: "prospect" },
      whyThisPerson: "Maria has a current relationship follow-up signal.",
      evidenceRefs: ["relationship-ref"],
      sourceEvidenceIds: ["relationship-src"],
      sourceOwners: ["relationship-intelligence"],
      freshness: { status: "CURRENT", capturedAt: "2026-06-30T10:00:00Z" }
    },
    activityContext: {
      whyNow: "The observed follow-up cadence is stale relative to the review window.",
      evidenceRefs: ["activity-ref"],
      sourceEvidenceIds: ["activity-src"],
      sourceOwners: ["advisor-os"],
      freshness: { status: "CURRENT", capturedAt: "2026-06-30T10:00:00Z" }
    },
    followupContext: {
      recommendedAction: "Review a human-approved follow-up with Maria.",
      whyThisAction: "A follow-up could preserve optionality without forcing a sale.",
      evidenceRefs: ["followup-ref"],
      sourceEvidenceIds: ["followup-src"],
      sourceOwners: ["advisor-os"],
      freshness: { status: "CURRENT", capturedAt: "2026-06-30T10:00:00Z" }
    },
    nashConversationContext: {
      conversationAngle: "calm relationship-first check-in",
      whyThisMessage: "The message should acknowledge time passed and invite a voluntary response.",
      suggestedMessageInstruction: "Prepare instructions for a calm, human-reviewed check-in.",
      evidenceRefs: ["nash-ref"],
      sourceEvidenceIds: ["nash-src"],
      sourceOwners: ["nash-context-intake"],
      freshness: { status: "CURRENT", capturedAt: "2026-06-30T10:00:00Z" }
    },
    nashCombatContext: {
      objectionSupport: "If timing is a concern, acknowledge it without pressure.",
      evidenceRefs: ["combat-ref"],
      sourceEvidenceIds: ["combat-src"],
      sourceOwners: ["nash-context-intake"],
      freshness: { status: "CURRENT", capturedAt: "2026-06-30T10:00:00Z" }
    },
    mickBehaviorContext: {
      reasonWhy: "This is a candidate action because follow-up consistency supports voluntary execution.",
      evidenceRefs: ["mick-ref", "mick-ref"],
      sourceEvidenceIds: ["mick-src", "mick-src"],
      sourceOwners: ["mick-context-intake", "mick-context-intake"],
      freshness: { status: "CURRENT", capturedAt: "2026-06-30T10:00:00Z" }
    },
    goalContext: {
      goal: "support commercial follow-up discipline",
      evidenceRefs: ["goal-ref"],
      sourceEvidenceIds: ["goal-src"],
      sourceOwners: ["manager-os"],
      freshness: { status: "CURRENT", capturedAt: "2026-06-30T10:00:00Z" }
    },
    compensationCandidateContext: {
      candidate: true,
      estimated: true,
      evidenceRefs: ["comp-candidate-ref"],
      sourceEvidenceIds: ["comp-candidate-src"],
      sourceOwners: ["compensation-candidate-context"],
      freshness: { status: "CURRENT", capturedAt: "2026-06-30T10:00:00Z" }
    },
    forecastContext: {
      scenario: "candidate",
      evidenceRefs: ["forecast-ref"],
      sourceEvidenceIds: ["forecast-src"],
      sourceOwners: ["forecast-context"],
      freshness: { status: "CURRENT", capturedAt: "2026-06-30T10:00:00Z" }
    },
    sourceEvidence: {
      evidenceRefs: ["source-ref"],
      sourceEvidenceIds: ["source-id"],
      sourceOwners: ["source-owner"],
      freshness: { status: "CURRENT", capturedAt: "2026-06-30T10:00:00Z" }
    },
    requestedUse: "FOLLOWUP_REASON_WHY",
    ...overrides
  };
}

function assertFalseFlags(result) {
  assert.strictEqual(result.suggestedMessageDraftAllowed, false);
  assert.strictEqual(result.humanApprovalRequired, true);
  assert.strictEqual(result.automaticExecutionAllowed, false);
  assert.strictEqual(result.createsMessageDraft, false);
  assert.strictEqual(result.sendsMessage, false);
  assert.strictEqual(result.createsTask, false);
  assert.strictEqual(result.createsCalendarEvent, false);
  assert.strictEqual(result.executesNashRuntime, false);
  assert.strictEqual(result.executesMickRuntime, false);
  assert.strictEqual(result.callsLlmRuntime, false);
  assert.strictEqual(result.createsCompensationTruth, false);
  assert.strictEqual(result.createsPayoutTruth, false);
  assert.strictEqual(result.createsRevenueTruth, false);
  assert.strictEqual(result.createsRankingTruth, false);
  assert.strictEqual(result.createsPunishmentTruth, false);
  assert.strictEqual(result.createsHrTruth, false);
  assert.strictEqual(result.createsPromotionTruth, false);
  assert.strictEqual(result.createsAdvisorLifecycleTruth, false);
  assert.strictEqual(result.createsPersonalityTruth, false);
}

test("Protected context builds a non-executing NBA Reason Why boundary", () => {
  const result = buildNbaReasonWhyBoundary(strongInput());
  assert.strictEqual(result.contractStatus, NBA_REASON_WHY_STATUSES.READY_FOR_HUMAN_REVIEW);
  assert.strictEqual(result.recommendedAction, "Review a human-approved follow-up with Maria.");
  assert.strictEqual(result.targetPerson.name, "Maria");
  assert(result.reasonWhy.includes("candidate action"));
  assert(result.whyNow.includes("stale"));
  assert(result.whyThisPerson.includes("Maria"));
  assert(result.whyThisAction.includes("follow-up"));
  assert(result.whyThisMessage.includes("voluntary"));
  assert.strictEqual(result.conversationAngle, "calm relationship-first check-in");
  assert.strictEqual(result.objectionSupport, "If timing is a concern, acknowledge it without pressure.");
  assertFalseFlags(result);
});

test("Missing context remains UNKNOWN, not zero", () => {
  const result = buildNbaReasonWhyBoundary({
    sourceEvidence: {},
    requestedUse: "FOLLOWUP_REASON_WHY"
  });
  assert.strictEqual(result.contractStatus, NBA_REASON_WHY_STATUSES.UNKNOWN);
  assert(result.missingSignals.includes("protected_context_missing"));
  assert(!result.unknownSignals.includes("protected_context_zero"));
  assertFalseFlags(result);
});

test("Missing evidence requires review", () => {
  const result = buildNbaReasonWhyBoundary(strongInput({
    sourceEvidence: {},
    relationshipContext: { targetPerson: { name: "Maria" }, sourceOwners: ["relationship"], freshness: { status: "CURRENT" } },
    activityContext: { whyNow: "candidate timing", sourceOwners: ["activity"], freshness: { status: "CURRENT" } },
    followupContext: { recommendedAction: "Review follow-up", whyThisAction: "candidate action", sourceOwners: ["followup"], freshness: { status: "CURRENT" } },
    mickBehaviorContext: { reasonWhy: "candidate reason", sourceOwners: ["mick"], freshness: { status: "CURRENT" } },
    nashConversationContext: null,
    nashCombatContext: null,
    goalContext: null,
    compensationCandidateContext: null,
    forecastContext: null
  }));
  assert.strictEqual(result.contractStatus, NBA_REASON_WHY_STATUSES.NEEDS_EVIDENCE);
  assert(result.confidenceLimitations.includes("missing_evidence_requires_review"));
});

test("Missing source owner requires review", () => {
  const result = buildNbaReasonWhyBoundary(strongInput({
    sourceEvidence: { evidenceRefs: ["e"], sourceEvidenceIds: ["s"], freshness: { status: "CURRENT" } },
    relationshipContext: { targetPerson: { name: "Maria" }, evidenceRefs: ["e"], sourceEvidenceIds: ["s"], freshness: { status: "CURRENT" } },
    activityContext: { whyNow: "candidate timing", evidenceRefs: ["e"], sourceEvidenceIds: ["s"], freshness: { status: "CURRENT" } },
    followupContext: { recommendedAction: "Review follow-up", whyThisAction: "candidate action", evidenceRefs: ["e"], sourceEvidenceIds: ["s"], freshness: { status: "CURRENT" } },
    mickBehaviorContext: { reasonWhy: "candidate reason", evidenceRefs: ["e"], sourceEvidenceIds: ["s"], freshness: { status: "CURRENT" } },
    nashConversationContext: null,
    nashCombatContext: null,
    goalContext: null,
    compensationCandidateContext: null,
    forecastContext: null
  }));
  assert.strictEqual(result.contractStatus, NBA_REASON_WHY_STATUSES.NEEDS_SOURCE_OWNER);
});

test("Missing freshness requires review", () => {
  const result = buildNbaReasonWhyBoundary(strongInput({
    sourceEvidence: { evidenceRefs: ["e"], sourceEvidenceIds: ["s"], sourceOwners: ["owner"] },
    relationshipContext: { targetPerson: { name: "Maria" }, evidenceRefs: ["e"], sourceEvidenceIds: ["s"], sourceOwners: ["owner"] },
    activityContext: { whyNow: "candidate timing", evidenceRefs: ["e"], sourceEvidenceIds: ["s"], sourceOwners: ["owner"] },
    followupContext: { recommendedAction: "Review follow-up", whyThisAction: "candidate action", evidenceRefs: ["e"], sourceEvidenceIds: ["s"], sourceOwners: ["owner"] },
    mickBehaviorContext: { reasonWhy: "candidate reason", evidenceRefs: ["e"], sourceEvidenceIds: ["s"], sourceOwners: ["owner"] },
    nashConversationContext: null,
    nashCombatContext: null,
    goalContext: null,
    compensationCandidateContext: null,
    forecastContext: null
  }));
  assert.strictEqual(result.contractStatus, NBA_REASON_WHY_STATUSES.NEEDS_FRESHNESS);
});

test("Stale freshness requires review", () => {
  const result = buildNbaReasonWhyBoundary(strongInput({
    sourceEvidence: { evidenceRefs: ["e"], sourceEvidenceIds: ["s"], sourceOwners: ["owner"], freshness: { status: "STALE" } }
  }));
  assert.strictEqual(result.contractStatus, NBA_REASON_WHY_STATUSES.NEEDS_FRESHNESS);
  assert(result.staleSignals.includes("freshness_stale"));
});

test("Missing target person requires review", () => {
  const input = strongInput({
    personId: null,
    personType: null,
    relationshipContext: { whyThisPerson: "candidate person reason", evidenceRefs: ["e"], sourceEvidenceIds: ["s"], sourceOwners: ["owner"], freshness: { status: "CURRENT" } }
  });
  const result = buildNbaReasonWhyBoundary(input);
  assert.strictEqual(result.contractStatus, NBA_REASON_WHY_STATUSES.NEEDS_TARGET_PERSON);
});

test("Missing recommended action requires review", () => {
  const result = buildNbaReasonWhyBoundary(strongInput({
    followupContext: { whyThisAction: "candidate action", evidenceRefs: ["e"], sourceEvidenceIds: ["s"], sourceOwners: ["owner"], freshness: { status: "CURRENT" } }
  }));
  assert.strictEqual(result.contractStatus, NBA_REASON_WHY_STATUSES.NEEDS_RECOMMENDED_ACTION);
});

test("Missing reason why requires review", () => {
  const result = buildNbaReasonWhyBoundary(strongInput({
    activityContext: { evidenceRefs: ["e"], sourceEvidenceIds: ["s"], sourceOwners: ["owner"], freshness: { status: "CURRENT" } },
    followupContext: { recommendedAction: "Review follow-up", evidenceRefs: ["e"], sourceEvidenceIds: ["s"], sourceOwners: ["owner"], freshness: { status: "CURRENT" } },
    relationshipContext: { targetPerson: { name: "Maria" }, evidenceRefs: ["e"], sourceEvidenceIds: ["s"], sourceOwners: ["owner"], freshness: { status: "CURRENT" } },
    nashConversationContext: null,
    nashCombatContext: null,
    mickBehaviorContext: { evidenceRefs: ["e"], sourceEvidenceIds: ["s"], sourceOwners: ["owner"], freshness: { status: "CURRENT" } }
  }));
  assert.strictEqual(result.contractStatus, NBA_REASON_WHY_STATUSES.NEEDS_REASON_WHY);
});

test("Explicit zero values are review context only", () => {
  const result = buildNbaReasonWhyBoundary(strongInput({
    activityContext: { whyNow: "candidate timing", activityCount: 0, evidenceRefs: ["e"], sourceEvidenceIds: ["s"], sourceOwners: ["activity"], freshness: { status: "CURRENT" } }
  }));
  assert.strictEqual(result.contractStatus, NBA_REASON_WHY_STATUSES.NEEDS_HUMAN_REVIEW);
  assert(result.unknownSignals.some((signal) => signal.includes("explicit_zero_context_requires_review")));
  assertFalseFlags(result);
});

test("Forbidden uses are blocked", () => {
  NBA_REASON_WHY_FORBIDDEN_USES.forEach((requestedUse) => {
    const result = buildNbaReasonWhyBoundary(strongInput({ requestedUse }));
    assert.strictEqual(result.contractStatus, NBA_REASON_WHY_STATUSES.BLOCKED);
    assert(result.blockedUses.includes(requestedUse));
    assertFalseFlags(result);
  });
});

test("Allowed uses remain allowed", () => {
  NBA_REASON_WHY_ALLOWED_USES.forEach((requestedUse) => {
    const result = buildNbaReasonWhyBoundary(strongInput({ requestedUse }));
    assert.strictEqual(result.contractStatus, NBA_REASON_WHY_STATUSES.READY_FOR_HUMAN_REVIEW);
    assert(result.allowedUses.includes(requestedUse));
  });
});

test("Unknown requested use is not silently allowed", () => {
  const result = buildNbaReasonWhyBoundary(strongInput({ requestedUse: "DO_THE_THING_NOW" }));
  assert.strictEqual(result.contractStatus, NBA_REASON_WHY_STATUSES.NOT_MODELED);
  assert(result.blockedUses.includes("DO_THE_THING_NOW"));
});

test("Inputs are not mutated", () => {
  const input = strongInput();
  const before = JSON.stringify(input);
  buildNbaReasonWhyBoundary(input);
  assert.strictEqual(JSON.stringify(input), before);
});

test("Evidence refs, source evidence IDs, and source owners dedupe", () => {
  const result = buildNbaReasonWhyBoundary(strongInput());
  assert.strictEqual(result.evidenceRefs.filter((item) => item === "mick-ref").length, 1);
  assert.strictEqual(result.sourceEvidenceIds.filter((item) => item === "mick-src").length, 1);
  assert.strictEqual(result.sourceOwners.filter((item) => item === "mick-context-intake").length, 1);
});

test("Suggested message instruction is not a draft", () => {
  const result = buildNbaReasonWhyBoundary(strongInput());
  assert(result.suggestedMessageInstruction.includes("instructions"));
  assert.strictEqual(result.suggestedMessageDraftAllowed, false);
  assert.strictEqual(result.createsMessageDraft, false);
  assert.strictEqual(result.sendsMessage, false);
});

test("Compensation candidate and forecast context do not create truth", () => {
  const result = buildNbaReasonWhyBoundary(strongInput());
  assert(result.warnings.includes("compensation_candidate_context_is_not_payout_truth"));
  assert(result.warnings.includes("forecast_context_is_not_payout_truth"));
  assert.strictEqual(result.createsCompensationTruth, false);
  assert.strictEqual(result.createsPayoutTruth, false);
  assert.strictEqual(result.createsRevenueTruth, false);
});

test("No action, runtime, HR, ranking, punishment, lifecycle, or personality truth flags are created", () => {
  const result = buildNbaReasonWhyBoundary(strongInput());
  assertFalseFlags(result);
});

test("No forbidden imports exist", () => {
  const sourcePath = path.join(__dirname, "../nba/nba-reason-why-boundary-contract.js");
  const source = fs.readFileSync(sourcePath, "utf8");
  [
    "nash/",
    "mick/",
    "external-context-bridge",
    "message-generation",
    "advisor-os",
    "compensation",
    "revenue",
    "advisor-lifecycle",
    "product-intelligence",
    "schemas",
    "fixtures",
    "openai",
    "whatsapp",
    "sms"
  ].forEach((term) => assert(!source.includes(`require("${term}`), `forbidden import ${term}`));
});

console.log(`NBA Reason Why Boundary Contract master tests PASS ${passCount}/19`);
