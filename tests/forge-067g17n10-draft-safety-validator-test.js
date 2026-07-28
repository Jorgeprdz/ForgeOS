"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const ProspectUI = require("../advisor-os/sales-pipeline/productive-prospect-ui.js");

function validate(text, overrides = {}) {
  return ProspectUI.draftSafetyValidator({
    draftText: text,
    draftCandidateSnapshot: {
      sendsMessage: false,
      sourceMutable: false,
    },
    humanApproval: {
      required: true,
      finalAuthority: "HUMAN",
    },
    ...overrides,
  });
}

test("067G17N10 allows a clean reviewed draft without rewriting or AI", () => {
  const draft = "Hola, José 😊.\n\nMe gustaría conversar contigo esta semana.";
  const result = validate(draft);

  assert.equal(
    result.decision,
    ProspectUI.DRAFT_VALIDATION_DECISIONS.ALLOW_WHATSAPP,
  );
  assert.deepEqual(result.errors, []);
  assert.equal(result.rewritesDraft, false);
  assert.equal(result.generatesDraft, false);
  assert.equal(result.mutatesDraftCandidate, false);
  assert.equal(result.mutatesPipeline, false);
  assert.equal(result.callsAi, false);
});

test("067G17N10 blocks excluded fields and prohibited claims", () => {
  const result = validate(
    "advisorId A1 con producto garantizado y NASAT alto",
  );

  assert.equal(result.decision, "BLOCK_WHATSAPP");
  assert.ok(
    result.errors.some(
      error => error.code === "EXCLUDED_FIELD_PRESENT",
    ),
  );
  assert.ok(
    result.errors.some(
      error => error.code === "PROHIBITED_CLAIM_PRESENT",
    ),
  );
});

test("067G17N10 blocks invented consent urgency and commitments", () => {
  const result = validate(
    "Quedamos con cita confirmada. Me autorizaste. Solo hoy. Me dieron tus datos.",
  );

  assert.equal(result.decision, "BLOCK_WHATSAPP");
  assert.ok(
    result.errors.some(
      error => error.code === "INVENTED_COMMITMENT_PRESENT",
    ),
  );
  assert.ok(
    result.errors.some(
      error => error.code === "INVENTED_CONSENT_PRESENT",
    ),
  );
  assert.ok(
    result.errors.some(
      error => error.code === "INVENTED_URGENCY_PRESENT",
    ),
  );
  assert.ok(
    result.errors.some(
      error => error.code === "PROHIBITED_REFERRAL_WORDING_PRESENT",
    ),
  );
});

test("067G17N10 blocks missing candidate and broken approval path", () => {
  const result = ProspectUI.draftSafetyValidator({
    draftText: "Hola",
    draftCandidateSnapshot: null,
    humanApproval: {
      required: false,
      finalAuthority: "SYSTEM",
    },
  });

  assert.equal(result.decision, "BLOCK_WHATSAPP");
  assert.ok(
    result.errors.some(
      error => error.code === "DRAFT_CANDIDATE_RULES_UNSATISFIED",
    ),
  );
  assert.ok(
    result.errors.some(
      error => error.code === "HUMAN_APPROVAL_PATH_NOT_PRESERVED",
    ),
  );
});

test("NFAST-06 requires a separate explicit human decision", () => {
  const draft =
    "Hola, José.\n\nMe gustaría conversar contigo esta semana.";
  const validation = validate(draft);

  const automaticAttempt = ProspectUI.approveExactDraft({
    draftText: draft,
    validationResult: validation,
  });

  assert.equal(automaticAttempt.decision, "BLOCK_WHATSAPP");
  assert.ok(
    automaticAttempt.errors.some(
      error => error.code === "EXPLICIT_HUMAN_APPROVAL_REQUIRED",
    ),
  );

  const approval = ProspectUI.approveExactDraft({
    draftText: draft,
    validationResult: validation,
    humanDecision: ProspectUI.EXPLICIT_DRAFT_APPROVAL,
  });

  assert.equal(
    approval.decision,
    ProspectUI.DRAFT_APPROVAL_DECISIONS.EXACT_DRAFT_APPROVED,
  );
  assert.equal(approval.exactDraftApproved, true);
});

test("NFAST-06 invalidates approval when exact draft text changes", () => {
  const draft =
    "Hola, José.\n\nMe gustaría conversar contigo esta semana.";
  const validation = validate(draft);

  const approval = ProspectUI.approveExactDraft({
    draftText: draft,
    validationResult: validation,
    humanDecision: ProspectUI.EXPLICIT_DRAFT_APPROVAL,
  });

  const editedDraft = `${draft}\nCambio`;

  const gate = ProspectUI.exactDraftHumanApprovalGate({
    draftText: editedDraft,
    validationResult: validate(editedDraft),
    approvalSnapshot: approval,
  });

  assert.equal(gate.decision, "BLOCK_WHATSAPP");
  assert.ok(
    gate.errors.some(
      error => error.code === "EXACT_DRAFT_APPROVAL_REQUIRED",
    ),
  );
});

test("NFAST-06 permits only manual navigation after exact approval", () => {
  const draft =
    "Hola, José.\n\nMe gustaría conversar contigo esta semana.";
  const validation = validate(draft);

  const approval = ProspectUI.approveExactDraft({
    draftText: draft,
    validationResult: validation,
    humanDecision: ProspectUI.EXPLICIT_DRAFT_APPROVAL,
  });

  const gate = ProspectUI.exactDraftHumanApprovalGate({
    draftText: draft,
    validationResult: validation,
    approvalSnapshot: approval,
  });

  assert.equal(gate.decision, "ALLOW_WHATSAPP");
  assert.equal(gate.manualNavigationRequired, true);
  assert.equal(gate.persistsApproval, false);
  assert.equal(gate.mutatesPipeline, false);
});

test("NFAST-06 UI separates approval from WhatsApp navigation", () => {
  const source = fs.readFileSync(
    "advisor-os/sales-pipeline/productive-prospect-ui.js",
    "utf8",
  );

  assert.match(source, /data-approve-whatsapp-draft/);
  assert.match(source, /currentDraftSafetyResult/);
  assert.match(source, /EXPLICIT_DRAFT_APPROVAL/);

  const whatsappStart = source.indexOf(
    'const whatsapp = event.target.closest("[data-open-whatsapp]")',
  );
  const whatsappEnd = source.indexOf(
    'if (event.target.closest("[data-close-prospect-detail]"))',
    whatsappStart,
  );
  const whatsappBlock = source.slice(whatsappStart, whatsappEnd);

  assert.ok(whatsappStart > -1);
  assert.doesNotMatch(whatsappBlock, /approveExactDraft\s*\(/);
  assert.match(whatsappBlock, /currentDraftApproval/);
  assert.match(whatsappBlock, /event\.preventDefault\(\)/);
});
