"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");

const {
  buildHumanApprovalGate,
  HUMAN_APPROVAL_GATE_STATUSES,
  HUMAN_APPROVAL_GATE_ALLOWED_USES,
  HUMAN_APPROVAL_GATE_FORBIDDEN_USES
} = require("../human-approval/human-approval-gate-boundary-contract");

let passCount = 0;

function test(name, fn) {
  try {
    fn();
    passCount += 1;
    console.log(`PASS ${passCount} - ${name}`);
  } catch (error) {
    console.error(`FAIL - ${name}`);
    throw error;
  }
}

function validInput(overrides = {}) {
  return {
    approvalRequestId: "approval-1",
    advisorId: "advisor-1",
    managerId: "manager-1",
    reviewerId: "human-1",
    reviewerRole: "MANAGER",
    reviewerType: "HUMAN",
    personId: "person-1",
    personType: "prospect",
    channelCandidate: { channel: "WHATSAPP_LINK_PREP" },
    approvalSurface: "MANAGER_REVIEW_PANEL",
    approvalAction: "APPROVE",
    nbaReasonWhySnapshot: { reasonWhy: "Follow up is timely", evidenceRefs: ["ev-nba"] },
    promptInstructionSnapshot: { promptInstructions: { communicationGoal: "follow up" }, sourceEvidenceIds: ["src-prompt"] },
    draftCandidateSnapshot: { draftText: "Hola Maria, podemos revisar tu pendiente esta semana?", sourceOwners: ["draft-owner"] },
    safetyValidationSnapshot: {
      safetyStatus: "READY_FOR_HUMAN_REVIEW",
      safeForHumanReview: true,
      safeForSend: false,
      evidenceRefs: ["ev-safety"]
    },
    sourceEvidence: {
      evidenceRefs: ["ev-root", "ev-root"],
      sourceEvidenceIds: ["src-root", "src-root"],
      sourceOwners: ["owner-root", "owner-root"]
    },
    warnings: ["review tone", "review tone"],
    limitations: ["not guaranteed", "not guaranteed"],
    warningsVisible: true,
    warningsAcknowledged: true,
    limitationsVisible: true,
    limitationsAcknowledged: true,
    artifactHash: "hash-1",
    currentArtifactHash: "hash-1",
    requestedUse: "MESSAGE_DELIVERY_PREP_REVIEW",
    createdAt: "2026-06-30T10:00:00.000Z",
    reviewedAt: "2026-06-30T10:01:00.000Z",
    expiresAt: "2026-06-30T12:00:00.000Z",
    now: "2026-06-30T10:30:00.000Z",
    ...overrides
  };
}

function assertFalseTruthFlags(result) {
  assert.strictEqual(result.approvedForSendExecution, false);
  assert.strictEqual(result.automaticApprovalAllowed, false);
  assert.strictEqual(result.aiApprovalAllowed, false);
  assert.strictEqual(result.safetyValidationEqualsApproval, false);
  assert.strictEqual(result.createsMessageDraft, false);
  assert.strictEqual(result.sendsMessage, false);
  assert.strictEqual(result.createsTask, false);
  assert.strictEqual(result.createsCalendarEvent, false);
  assert.strictEqual(result.createsCompensationTruth, false);
  assert.strictEqual(result.createsPayoutTruth, false);
  assert.strictEqual(result.createsRevenueTruth, false);
  assert.strictEqual(result.createsRankingTruth, false);
  assert.strictEqual(result.createsPunishmentTruth, false);
  assert.strictEqual(result.createsHrTruth, false);
  assert.strictEqual(result.createsPromotionTruth, false);
  assert.strictEqual(result.createsAdvisorLifecycleTruth, false);
  assert.strictEqual(result.createsPersonalityTruth, false);
  assert.strictEqual(result.humanApprovalRequired, true);
  assert.strictEqual(result.auditRequired, true);
}

test("Safety validation is not human approval", () => {
  const result = buildHumanApprovalGate(validInput({ approvalAction: "REQUEST_REVIEW" }));
  assert.strictEqual(result.approvalGateStatus, HUMAN_APPROVAL_GATE_STATUSES.READY_FOR_HUMAN_REVIEW);
  assert.strictEqual(result.approvedForDeliveryPreparation, false);
  assert.strictEqual(result.safetyValidationEqualsApproval, false);
});

test("AI cannot approve", () => {
  const result = buildHumanApprovalGate(validInput({ reviewerType: "AI" }));
  assert.strictEqual(result.approvalGateStatus, HUMAN_APPROVAL_GATE_STATUSES.NEEDS_REVIEWER);
});

test("Missing reviewer blocks approval", () => {
  const result = buildHumanApprovalGate(validInput({ reviewerId: null }));
  assert.strictEqual(result.approvalGateStatus, HUMAN_APPROVAL_GATE_STATUSES.NEEDS_REVIEWER);
});

test("Missing artifact blocks approval", () => {
  const result = buildHumanApprovalGate(validInput({
    nbaReasonWhySnapshot: null,
    promptInstructionSnapshot: null,
    draftCandidateSnapshot: null
  }));
  assert.strictEqual(result.approvalGateStatus, HUMAN_APPROVAL_GATE_STATUSES.NEEDS_ARTIFACT);
});

test("Missing artifact hash blocks approval", () => {
  const result = buildHumanApprovalGate(validInput({ artifactHash: null }));
  assert.strictEqual(result.approvalGateStatus, HUMAN_APPROVAL_GATE_STATUSES.NEEDS_ARTIFACT_HASH);
});

test("Changed artifact requires reapproval", () => {
  const result = buildHumanApprovalGate(validInput({ currentArtifactHash: "hash-2" }));
  assert.strictEqual(result.approvalGateStatus, HUMAN_APPROVAL_GATE_STATUSES.ARTIFACT_CHANGED_REAPPROVAL_REQUIRED);
});

test("Missing safety validation blocks approval", () => {
  const result = buildHumanApprovalGate(validInput({ safetyValidationSnapshot: null }));
  assert.strictEqual(result.approvalGateStatus, HUMAN_APPROVAL_GATE_STATUSES.NEEDS_SAFETY_VALIDATION);
});

test("Unsafe safety result blocks approval", () => {
  const result = buildHumanApprovalGate(validInput({
    safetyValidationSnapshot: {
      safetyStatus: "NEEDS_REVISION",
      detectedRisks: ["PRESSURE_LANGUAGE"],
      safeForSend: false
    }
  }));
  assert.strictEqual(result.approvalGateStatus, HUMAN_APPROVAL_GATE_STATUSES.BLOCKED);
});

test("Warnings must be visible and acknowledged", () => {
  const invisible = buildHumanApprovalGate(validInput({ warningsVisible: false }));
  const unacknowledged = buildHumanApprovalGate(validInput({ warningsAcknowledged: false }));
  assert.strictEqual(invisible.approvalGateStatus, HUMAN_APPROVAL_GATE_STATUSES.NEEDS_WARNING_ACKNOWLEDGEMENT);
  assert.strictEqual(unacknowledged.approvalGateStatus, HUMAN_APPROVAL_GATE_STATUSES.NEEDS_WARNING_ACKNOWLEDGEMENT);
});

test("Limitations must be visible and acknowledged", () => {
  const invisible = buildHumanApprovalGate(validInput({ limitationsVisible: false }));
  const unacknowledged = buildHumanApprovalGate(validInput({ limitationsAcknowledged: false }));
  assert.strictEqual(invisible.approvalGateStatus, HUMAN_APPROVAL_GATE_STATUSES.NEEDS_WARNING_ACKNOWLEDGEMENT);
  assert.strictEqual(unacknowledged.approvalGateStatus, HUMAN_APPROVAL_GATE_STATUSES.NEEDS_WARNING_ACKNOWLEDGEMENT);
});

test("Expired approval blocks approval", () => {
  const result = buildHumanApprovalGate(validInput({ now: "2026-06-30T13:00:00.000Z" }));
  assert.strictEqual(result.approvalGateStatus, HUMAN_APPROVAL_GATE_STATUSES.EXPIRED_APPROVAL);
});

test("Human reject returns REJECTED_BY_HUMAN", () => {
  const result = buildHumanApprovalGate(validInput({ approvalAction: "REJECT", rejectedReasons: ["not right"] }));
  assert.strictEqual(result.approvalGateStatus, HUMAN_APPROVAL_GATE_STATUSES.REJECTED_BY_HUMAN);
  assert.deepStrictEqual(result.rejectedReasons, ["not right"]);
});

test("Human request changes returns CHANGES_REQUESTED", () => {
  const result = buildHumanApprovalGate(validInput({ approvalAction: "REQUEST_CHANGES", changeRequests: ["soften tone"] }));
  assert.strictEqual(result.approvalGateStatus, HUMAN_APPROVAL_GATE_STATUSES.CHANGES_REQUESTED);
  assert.deepStrictEqual(result.changeRequests, ["soften tone"]);
});

test("Human request review returns READY_FOR_HUMAN_REVIEW", () => {
  const result = buildHumanApprovalGate(validInput({ approvalAction: "REQUEST_REVIEW" }));
  assert.strictEqual(result.approvalGateStatus, HUMAN_APPROVAL_GATE_STATUSES.READY_FOR_HUMAN_REVIEW);
});

test("Valid approval returns APPROVED_FOR_DELIVERY_PREPARATION", () => {
  const result = buildHumanApprovalGate(validInput());
  assert.strictEqual(result.approvalGateStatus, HUMAN_APPROVAL_GATE_STATUSES.APPROVED_FOR_DELIVERY_PREPARATION);
  assert.strictEqual(result.approvedForDeliveryPreparation, true);
  assert.strictEqual(result.approvedArtifactHash, "hash-1");
});

test("Approved gate does not send", () => {
  const result = buildHumanApprovalGate(validInput());
  assert.strictEqual(result.sendsMessage, false);
  assert.strictEqual(result.approvedForSendExecution, false);
});

test("Approved gate does not create tasks/calendar", () => {
  const result = buildHumanApprovalGate(validInput());
  assert.strictEqual(result.createsTask, false);
  assert.strictEqual(result.createsCalendarEvent, false);
});

test("Approved gate does not create compensation/revenue/payout truth", () => {
  const result = buildHumanApprovalGate(validInput());
  assert.strictEqual(result.createsCompensationTruth, false);
  assert.strictEqual(result.createsRevenueTruth, false);
  assert.strictEqual(result.createsPayoutTruth, false);
});

test("Approved gate does not create ranking/punishment/HR/personality truth", () => {
  const result = buildHumanApprovalGate(validInput());
  assert.strictEqual(result.createsRankingTruth, false);
  assert.strictEqual(result.createsPunishmentTruth, false);
  assert.strictEqual(result.createsHrTruth, false);
  assert.strictEqual(result.createsPersonalityTruth, false);
});

test("Approval unlocks delivery preparation only", () => {
  const result = buildHumanApprovalGate(validInput());
  assert.strictEqual(result.approvedForDeliveryPreparation, true);
  assertFalseTruthFlags(result);
});

test("Inputs are not mutated", () => {
  const input = validInput();
  const before = JSON.stringify(input);
  buildHumanApprovalGate(input);
  assert.strictEqual(JSON.stringify(input), before);
});

test("Evidence/source/sourceOwners dedupe", () => {
  const result = buildHumanApprovalGate(validInput({
    safetyValidationSnapshot: {
      safetyStatus: "READY_FOR_HUMAN_REVIEW",
      safeForHumanReview: true,
      safeForSend: false,
      evidenceRefs: ["ev-safety", "ev-safety"],
      sourceEvidenceIds: ["src-safety", "src-safety"],
      sourceOwners: ["owner-safety", "owner-safety"]
    }
  }));
  assert.deepStrictEqual(result.evidenceRefs.sort(), ["ev-nba", "ev-root", "ev-safety"].sort());
  assert.deepStrictEqual(result.sourceEvidenceIds.sort(), ["src-prompt", "src-root", "src-safety"].sort());
  assert.deepStrictEqual(result.sourceOwners.sort(), ["draft-owner", "owner-root", "owner-safety"].sort());
});

test("Forbidden uses are blocked", () => {
  for (const requestedUse of HUMAN_APPROVAL_GATE_FORBIDDEN_USES) {
    const result = buildHumanApprovalGate(validInput({ requestedUse }));
    assert.strictEqual(result.approvalGateStatus, HUMAN_APPROVAL_GATE_STATUSES.BLOCKED);
    assert.deepStrictEqual(result.blockedUses, [requestedUse]);
  }
});

test("Allowed uses are allowed", () => {
  for (const requestedUse of HUMAN_APPROVAL_GATE_ALLOWED_USES) {
    const result = buildHumanApprovalGate(validInput({ requestedUse }));
    assert.strictEqual(result.approvalGateStatus, HUMAN_APPROVAL_GATE_STATUSES.APPROVED_FOR_DELIVERY_PREPARATION);
    assert.deepStrictEqual(result.allowedUses, [requestedUse]);
  }
});

test("No Nash/Mick/message-generation/delivery/runtime imports", () => {
  const contractPath = path.join(__dirname, "../human-approval/human-approval-gate-boundary-contract.js");
  const source = fs.readFileSync(contractPath, "utf8");
  assert(!/require\(/.test(source));
  assert(!/from .*nash|from .*mick|message-generation|delivery|runtime|send/.test(source));
});

console.log(`Human Approval Gate Boundary Contract master tests PASS ${passCount}/25`);
