"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const ProspectUI = require(
  "../nash/draft-intake/nfast06-draft-safety-boundary.js",
);

function safeEnvelope(text = "Hola. Me gustaría conversar contigo.") {
  return {
    resultState: "SUCCESS",
    draftCandidate: {
      text,
      rawText: text,
      reviewRequired: true,
      humanApprovalRequired: true,
      approved: false,
      sent: false,
      sendsMessage: false,
      notSendable: true,
      sourceMutable: false,
      providerId: "gemini",
    },
    metadata: {
      providerId: "gemini",
      modelId: "gemini-3.5-flash",
      generationMode: "gemini_language_renderer",
      generatedAt: "2026-07-24T00:00:00.000Z",
    },
    error: null,
    persistencePerformed: false,
    pipelineMutationPerformed: false,
    timelineEventCreated: false,
    nbaExecuted: false,
    taskCreated: false,
    calendarEventCreated: false,
    whatsappOpened: false,
    messageSent: false,
    externalActionPerformed: false,
    humanApprovalRequired: true,
    approved: false,
    sent: false,
  };
}

test("NFAST-06 accepts a side-effect-free provider candidate", () => {
  const intake = ProspectUI.intakeDraftProviderEnvelope(
    safeEnvelope(),
  );

  assert.equal(
    intake.state,
    ProspectUI.DRAFT_INTAKE_STATES.READY_FOR_HUMAN_REVIEW,
  );
  assert.equal(
    intake.draftCandidateSnapshot.sendsMessage,
    false,
  );
  assert.equal(
    intake.draftCandidateSnapshot.humanApprovalRequired,
    true,
  );
  assert.equal(intake.approved, false);
  assert.equal(intake.sent, false);
  assert.equal(intake.externalActionPerformed, false);
  assert.equal(Object.isFrozen(intake), true);
  assert.equal(
    Object.isFrozen(intake.draftCandidateSnapshot),
    true,
  );
});

test("NFAST-06 rejects provider output with send authority", () => {
  const envelope = safeEnvelope();
  envelope.draftCandidate.sendsMessage = true;

  const intake = ProspectUI.intakeDraftProviderEnvelope(envelope);

  assert.equal(
    intake.state,
    ProspectUI.DRAFT_INTAKE_STATES.BLOCKED,
  );
  assert.ok(
    intake.errors.some(
      error =>
        error.code === "DRAFT_CANDIDATE_SEND_AUTHORITY_PRESENT",
    ),
  );
});

test("NFAST-06 rejects provider-side approval or sending", () => {
  const envelope = safeEnvelope();
  envelope.draftCandidate.approved = true;
  envelope.messageSent = true;

  const intake = ProspectUI.intakeDraftProviderEnvelope(envelope);

  assert.equal(
    intake.state,
    ProspectUI.DRAFT_INTAKE_STATES.BLOCKED,
  );
  assert.ok(
    intake.errors.some(
      error => error.code === "PROVIDER_CANNOT_APPROVE_OR_SEND",
    ),
  );
  assert.ok(
    intake.errors.some(
      error => error.code === "PROVIDER_SIDE_EFFECT_REPORTED",
    ),
  );
});

test("NFAST-06 treats provider errors as deterministic fallback", () => {
  const intake = ProspectUI.intakeDraftProviderEnvelope({
    resultState: "ERROR",
    draftCandidate: null,
    metadata: {
      providerId: "gemini",
    },
    error: {
      code: "PROVIDER_UNAVAILABLE",
      message: "Provider unavailable.",
      retryable: true,
    },
  });

  assert.equal(
    intake.state,
    ProspectUI.DRAFT_INTAKE_STATES.FALLBACK_REQUIRED,
  );
  assert.equal(intake.deterministicFallbackRequired, true);
  assert.equal(intake.draftCandidateSnapshot, null);
});

test("NFAST-06 blocks malformed SUCCESS envelopes", () => {
  const intake = ProspectUI.intakeDraftProviderEnvelope({
    resultState: "SUCCESS",
    draftCandidate: {
      rawText: "",
    },
    metadata: {
      providerId: "gemini",
    },
    error: null,
  });

  assert.equal(
    intake.state,
    ProspectUI.DRAFT_INTAKE_STATES.BLOCKED,
  );
  assert.ok(intake.errors.length > 0);
});

test("NFAST-06 complete review chain remains human controlled", () => {
  const intake = ProspectUI.intakeDraftProviderEnvelope(
    safeEnvelope("Hola, Ana. ¿Te gustaría conversar esta semana?"),
  );

  const text = intake.draftCandidateSnapshot.rawText;

  const validation = ProspectUI.draftSafetyValidator({
    draftText: text,
    draftCandidateSnapshot: intake.draftCandidateSnapshot,
    humanApproval: {
      required: true,
      finalAuthority: "HUMAN",
    },
  });

  const approval = ProspectUI.approveExactDraft({
    draftText: text,
    validationResult: validation,
    humanDecision: ProspectUI.EXPLICIT_DRAFT_APPROVAL,
  });

  const gate = ProspectUI.exactDraftHumanApprovalGate({
    draftText: text,
    validationResult: validation,
    approvalSnapshot: approval,
  });

  assert.equal(validation.decision, "ALLOW_WHATSAPP");
  assert.equal(approval.exactDraftApproved, true);
  assert.equal(gate.decision, "ALLOW_WHATSAPP");
  assert.equal(gate.manualNavigationRequired, true);
  assert.equal(gate.persistsApproval, false);
  assert.equal(gate.mutatesPipeline, false);
});
