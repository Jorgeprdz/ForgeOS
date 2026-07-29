"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const Boundary = require("../nash/draft-intake/nfast06-draft-safety-boundary.js");
const ProductiveUI = require("../advisor-os/sales-pipeline/productive-prospect-ui.js");

function safeEnvelope(text = "Hola. Me gustaría conversar contigo.") {
  return {
    resultState: "SUCCESS",
    draftCandidate: {
      rawText: text,
      sendsMessage: false,
      humanApprovalRequired: true,
      reviewRequired: true,
      approved: false,
      sent: false,
    },
    persistencePerformed: false,
    pipelineMutationPerformed: false,
    whatsappOpened: false,
    externalActionPerformed: false,
  };
}

test("canonical NFAST-06 boundary is complete, frozen and UI-compatible", () => {
  for (const name of [
    "intakeDraftProviderEnvelope",
    "draftSafetyValidator",
    "approveExactDraft",
    "exactDraftHumanApprovalGate",
  ]) {
    assert.equal(typeof Boundary[name], "function");
    assert.equal(ProductiveUI[name], Boundary[name]);
  }
  for (const name of [
    "DRAFT_INTAKE_STATES",
    "DRAFT_VALIDATION_DECISIONS",
    "DRAFT_APPROVAL_DECISIONS",
    "EXPLICIT_DRAFT_APPROVAL",
  ]) {
    assert.equal(ProductiveUI[name], Boundary[name]);
  }
  assert.equal(Object.isFrozen(Boundary), true);
});

test("intake preserves fallback and blocks provider authority", () => {
  const ready = Boundary.intakeDraftProviderEnvelope(safeEnvelope());
  assert.equal(ready.state, "READY_FOR_HUMAN_REVIEW");
  assert.equal(Object.isFrozen(ready), true);
  assert.equal(Object.isFrozen(ready.draftCandidateSnapshot), true);

  const send = safeEnvelope();
  send.draftCandidate.sendsMessage = true;
  assert.equal(Boundary.intakeDraftProviderEnvelope(send).state, "BLOCKED");

  const sideEffect = safeEnvelope();
  sideEffect.draftCandidate.approved = true;
  sideEffect.whatsappOpened = true;
  const blocked = Boundary.intakeDraftProviderEnvelope(sideEffect);
  assert.equal(blocked.state, "BLOCKED");
  assert.ok(blocked.errors.some(({ code }) => code === "PROVIDER_CANNOT_APPROVE_OR_SEND"));
  assert.ok(blocked.errors.some(({ code }) => code === "PROVIDER_SIDE_EFFECT_REPORTED"));

  const fallback = Boundary.intakeDraftProviderEnvelope({
    resultState: "ERROR",
    error: { code: "PROVIDER_UNAVAILABLE" },
  });
  assert.equal(fallback.state, "FALLBACK_REQUIRED");
  assert.equal(fallback.deterministicFallbackRequired, true);

  assert.equal(Boundary.intakeDraftProviderEnvelope({
    resultState: "SUCCESS",
    draftCandidate: { rawText: "" },
  }).state, "BLOCKED");
});

test("safety and exact approval preserve human manual authority", () => {
  const snapshot = Boundary.intakeDraftProviderEnvelope(
    safeEnvelope("Hola. ¿Te gustaría conversar?"),
  ).draftCandidateSnapshot;
  const validation = Boundary.draftSafetyValidator({
    draftText: snapshot.rawText,
    draftCandidateSnapshot: snapshot,
    humanApproval: { required: true, finalAuthority: "HUMAN" },
  });
  assert.equal(validation.decision, "ALLOW_WHATSAPP");
  const approval = Boundary.approveExactDraft({
    draftText: snapshot.rawText,
    validationResult: validation,
    humanDecision: Boundary.EXPLICIT_DRAFT_APPROVAL,
  });
  assert.equal(approval.exactDraftApproved, true);
  const gate = Boundary.exactDraftHumanApprovalGate({
    draftText: snapshot.rawText,
    validationResult: validation,
    approvalSnapshot: approval,
  });
  assert.equal(gate.manualNavigationRequired, true);
  assert.equal(gate.persistsApproval, false);
  assert.equal(gate.mutatesPipeline, false);
  assert.equal(gate.mutatesProspect, false);
  assert.equal(Object.isFrozen(gate), true);
  assert.equal(Boundary.exactDraftHumanApprovalGate({
    draftText: `${snapshot.rawText} Editado`,
    validationResult: validation,
    approvalSnapshot: approval,
  }).exactDraftApproved, false);

  for (const text of [
    "Me dieron tus datos.",
    "Me autorizaste; solo hoy; quedamos con cita confirmada.",
  ]) {
    const result = Boundary.draftSafetyValidator({
      draftText: text,
      draftCandidateSnapshot: snapshot,
      humanApproval: { required: true, finalAuthority: "HUMAN" },
    });
    assert.equal(result.decision, "BLOCK_WHATSAPP");
  }
});

test("productive UI contains no duplicate governed implementation", () => {
  const source = fs.readFileSync(
    "advisor-os/sales-pipeline/productive-prospect-ui.js",
    "utf8",
  );
  for (const name of [
    "intakeDraftProviderEnvelope",
    "draftSafetyValidator",
    "approveExactDraft",
    "exactDraftHumanApprovalGate",
  ]) {
    assert.doesNotMatch(source, new RegExp(`function\\s+${name}\\s*\\(`));
  }
  assert.match(source, /NFAST_06_DRAFT_SAFETY_BOUNDARY_REQUIRED/);
});

test("canonical outputs never report automatic external effects", () => {
  const intake = Boundary.intakeDraftProviderEnvelope(safeEnvelope());
  assert.equal(intake.approved, false);
  assert.equal(intake.sent, false);
  assert.equal(intake.externalActionPerformed, false);
  assert.equal(intake.draftCandidateSnapshot.sendsMessage, false);
});
