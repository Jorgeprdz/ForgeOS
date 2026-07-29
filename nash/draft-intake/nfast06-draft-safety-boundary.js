"use strict";

(function nfast06DraftSafetyBoundaryModule(root, factory) {
  const api = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (root) root.ForgeDraftSafetyBoundaryNFAST06 = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  const DRAFT_VALIDATION_DECISIONS = Object.freeze({
    ALLOW_WHATSAPP: "ALLOW_WHATSAPP",
    BLOCK_WHATSAPP: "BLOCK_WHATSAPP",
  });
  const DRAFT_APPROVAL_DECISIONS = Object.freeze({
    EXACT_DRAFT_APPROVED: "EXACT_DRAFT_APPROVED",
    BLOCK_WHATSAPP: "BLOCK_WHATSAPP",
  });
  const DRAFT_INTAKE_STATES = Object.freeze({
    READY_FOR_HUMAN_REVIEW: "READY_FOR_HUMAN_REVIEW",
    NO_DRAFT: "NO_DRAFT",
    FALLBACK_REQUIRED: "FALLBACK_REQUIRED",
    BLOCKED: "BLOCKED",
  });
  const EXPLICIT_DRAFT_APPROVAL = "APPROVE_EXACT_DRAFT";
  const DRAFT_VALIDATION_RULES = Object.freeze([
    { code: "EXCLUDED_FIELD_PRESENT", patterns: [/\badvisorid\b/i, /\bprospectid\b/i, /\bcandidateid\b/i, /\bnasat\b/i, /\bprivate motivation\b/i, /\bmotivacion privada\b/i, /\bingreso estimado\b/i] },
    { code: "PROHIBITED_CLAIM_PRESENT", patterns: [/\bcubre todo\b/i, /\bgarantizad[oa]\b/i, /\bmejor seguro\b/i, /\bproducto perfecto\b/i, /\b100%\s*seguro\b/i] },
    { code: "INVENTED_COMMITMENT_PRESENT", patterns: [/\bme confirmaste\b/i, /\bquedamos\b/i, /\bte prometo\b/i, /\bya agende\b/i, /\bcita confirmada\b/i] },
    { code: "INVENTED_CONSENT_PRESENT", patterns: [/\bme autorizaste\b/i, /\bcon tu consentimiento\b/i, /\baceptaste que te contacte\b/i, /\btenemos tu permiso\b/i] },
    { code: "INVENTED_URGENCY_PRESENT", patterns: [/\bsolo hoy\b/i, /\bultima oportunidad\b/i, /\bahora o nunca\b/i, /\bse acaba hoy\b/i, /\burgente sin falta\b/i] },
    { code: "PROHIBITED_REFERRAL_WORDING_PRESENT", patterns: [/\bme dieron tus datos\b/i, /\bte paso conmigo\b/i, /\bme dijo que necesitas\b/i, /\bme pidio que te vendiera\b/i] },
    { code: "UNVERIFIED_RELATIONSHIP_CLAIM_PRESENT", patterns: [/\bsoy tu asesor\b/i] },
  ]);

  function deepFreeze(value) {
    if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
    Object.freeze(value);
    Object.values(value).forEach(deepFreeze);
    return value;
  }

  function intakeDraftProviderEnvelope(envelope = null) {
    const blocked = (code, message) => deepFreeze({
      intakeVersion: "NFAST-06.1", state: DRAFT_INTAKE_STATES.BLOCKED,
      draftCandidateSnapshot: null, deterministicFallbackRequired: true,
      errors: [{ code, message, severity: "BLOCKING" }],
      approved: false, sent: false, externalActionPerformed: false,
    });
    if (!envelope || typeof envelope !== "object" || Array.isArray(envelope)) return blocked("INVALID_PROVIDER_ENVELOPE", "Provider response must be an object.");
    if (envelope.resultState === "NO_DRAFT") return deepFreeze({
      intakeVersion: "NFAST-06.1", state: DRAFT_INTAKE_STATES.NO_DRAFT,
      draftCandidateSnapshot: null, deterministicFallbackRequired: true,
      errors: [], approved: false, sent: false, externalActionPerformed: false,
    });
    if (envelope.resultState === "ERROR") return deepFreeze({
      intakeVersion: "NFAST-06.1", state: DRAFT_INTAKE_STATES.FALLBACK_REQUIRED,
      draftCandidateSnapshot: null, deterministicFallbackRequired: true,
      errors: envelope.error ? [envelope.error] : [],
      approved: false, sent: false, externalActionPerformed: false,
    });
    if (envelope.resultState !== "SUCCESS") return blocked("UNKNOWN_PROVIDER_RESULT_STATE", "Provider resultState is unsupported.");
    const candidate = envelope.draftCandidate;
    const text = String(candidate?.rawText ?? candidate?.text ?? "").trim();
    const errors = [];
    if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) errors.push({ code: "INVALID_DRAFT_CANDIDATE", message: "SUCCESS requires a DraftCandidate object.", severity: "BLOCKING" });
    if (!text) errors.push({ code: "EMPTY_DRAFT_CANDIDATE", message: "DraftCandidate text is required.", severity: "BLOCKING" });
    if (candidate?.sendsMessage !== false) errors.push({ code: "DRAFT_CANDIDATE_SEND_AUTHORITY_PRESENT", message: "DraftCandidate must preserve sendsMessage=false.", severity: "BLOCKING" });
    if (candidate?.humanApprovalRequired !== true) errors.push({ code: "HUMAN_APPROVAL_REQUIREMENT_MISSING", message: "DraftCandidate must require human approval.", severity: "BLOCKING" });
    if (candidate?.reviewRequired !== true) errors.push({ code: "HUMAN_REVIEW_REQUIREMENT_MISSING", message: "DraftCandidate must require human review.", severity: "BLOCKING" });
    if (candidate?.approved !== false || candidate?.sent !== false) errors.push({ code: "PROVIDER_CANNOT_APPROVE_OR_SEND", message: "Provider output cannot arrive approved or sent.", severity: "BLOCKING" });
    for (const flag of ["externalActionPerformed", "messageSent", "whatsappOpened", "persistencePerformed", "pipelineMutationPerformed", "timelineEventCreated", "nbaExecuted", "taskCreated", "calendarEventCreated"]) {
      if (envelope[flag] === true) errors.push({ code: "PROVIDER_SIDE_EFFECT_REPORTED", message: `Provider envelope cannot report ${flag}=true.`, severity: "BLOCKING" });
    }
    if (errors.length) return deepFreeze({
      intakeVersion: "NFAST-06.1", state: DRAFT_INTAKE_STATES.BLOCKED,
      draftCandidateSnapshot: null, deterministicFallbackRequired: true,
      errors, approved: false, sent: false, externalActionPerformed: false,
    });
    return deepFreeze({
      intakeVersion: "NFAST-06.1", state: DRAFT_INTAKE_STATES.READY_FOR_HUMAN_REVIEW,
      draftCandidateSnapshot: { ...candidate, text, rawText: text, sendsMessage: false, humanApprovalRequired: true, reviewRequired: true, approved: false, sent: false, sourceMutable: false },
      providerMetadata: envelope.metadata || null, deterministicFallbackRequired: false,
      errors: [], approved: false, sent: false, externalActionPerformed: false,
    });
  }

  function draftSafetyValidator({ draftText = "", draftCandidateSnapshot = null, humanApproval = null } = {}) {
    const text = String(draftText ?? "");
    const errors = [];
    for (const rule of DRAFT_VALIDATION_RULES) if (rule.patterns.some(pattern => pattern.test(text))) errors.push({ code: rule.code, severity: "BLOCKING", action: DRAFT_VALIDATION_DECISIONS.BLOCK_WHATSAPP });
    if (!draftCandidateSnapshot || draftCandidateSnapshot.sendsMessage !== false) errors.push({ code: "DRAFT_CANDIDATE_RULES_UNSATISFIED", severity: "BLOCKING", action: DRAFT_VALIDATION_DECISIONS.BLOCK_WHATSAPP });
    if (!humanApproval || humanApproval.required !== true || humanApproval.finalAuthority !== "HUMAN") errors.push({ code: "HUMAN_APPROVAL_PATH_NOT_PRESERVED", severity: "BLOCKING", action: DRAFT_VALIDATION_DECISIONS.BLOCK_WHATSAPP });
    return Object.freeze({
      validatorId: "FORGE_DRAFT_SAFETY_VALIDATOR_067G17N10_V1",
      decision: errors.length ? DRAFT_VALIDATION_DECISIONS.BLOCK_WHATSAPP : DRAFT_VALIDATION_DECISIONS.ALLOW_WHATSAPP,
      errors: Object.freeze(errors), rewritesDraft: false, generatesDraft: false,
      mutatesDraftCandidate: false, mutatesPipeline: false, callsAi: false,
      humanApprovalRequired: true,
    });
  }

  function approveExactDraft({ draftText = "", validationResult = null, humanDecision = null } = {}) {
    const text = String(draftText ?? "");
    const errors = [];
    if (humanDecision !== EXPLICIT_DRAFT_APPROVAL) errors.push({ code: "EXPLICIT_HUMAN_APPROVAL_REQUIRED", severity: "BLOCKING", action: DRAFT_APPROVAL_DECISIONS.BLOCK_WHATSAPP });
    if (text.length === 0) errors.push({ code: "EMPTY_DRAFT_CANNOT_BE_APPROVED", severity: "BLOCKING", action: DRAFT_APPROVAL_DECISIONS.BLOCK_WHATSAPP });
    if (!validationResult || validationResult.decision !== DRAFT_VALIDATION_DECISIONS.ALLOW_WHATSAPP) errors.push({ code: "VALIDATION_REQUIRED_BEFORE_APPROVAL", severity: "BLOCKING", action: DRAFT_APPROVAL_DECISIONS.BLOCK_WHATSAPP });
    return Object.freeze({
      decision: errors.length ? DRAFT_APPROVAL_DECISIONS.BLOCK_WHATSAPP : DRAFT_APPROVAL_DECISIONS.EXACT_DRAFT_APPROVED,
      exactDraftApproved: errors.length === 0, approvedDraftText: errors.length === 0 ? text : null,
      humanDecision: errors.length === 0 ? humanDecision : null, errors: Object.freeze(errors),
      persistsApproval: false, mutatesPipeline: false, mutatesProspect: false,
    });
  }

  function exactDraftHumanApprovalGate({ draftText = "", validationResult = null, approvalSnapshot = null } = {}) {
    const text = String(draftText ?? "");
    const errors = [];
    if (!validationResult || validationResult.decision !== DRAFT_VALIDATION_DECISIONS.ALLOW_WHATSAPP) errors.push({ code: "VALIDATION_REQUIRED", severity: "BLOCKING", action: DRAFT_APPROVAL_DECISIONS.BLOCK_WHATSAPP });
    if (!approvalSnapshot || approvalSnapshot.exactDraftApproved !== true || approvalSnapshot.approvedDraftText !== text) errors.push({ code: "EXACT_DRAFT_APPROVAL_REQUIRED", severity: "BLOCKING", action: DRAFT_APPROVAL_DECISIONS.BLOCK_WHATSAPP });
    return Object.freeze({
      decision: errors.length ? DRAFT_APPROVAL_DECISIONS.BLOCK_WHATSAPP : DRAFT_VALIDATION_DECISIONS.ALLOW_WHATSAPP,
      validationPass: Boolean(validationResult && validationResult.decision === DRAFT_VALIDATION_DECISIONS.ALLOW_WHATSAPP),
      exactDraftApproved: errors.length === 0, errors: Object.freeze(errors),
      manualNavigationRequired: true, persistsApproval: false,
      mutatesPipeline: false, mutatesProspect: false,
    });
  }

  return Object.freeze({
    DRAFT_INTAKE_STATES, DRAFT_VALIDATION_DECISIONS, DRAFT_APPROVAL_DECISIONS,
    EXPLICIT_DRAFT_APPROVAL, DRAFT_VALIDATION_RULES, intakeDraftProviderEnvelope,
    draftSafetyValidator, approveExactDraft, exactDraftHumanApprovalGate,
  });
});
