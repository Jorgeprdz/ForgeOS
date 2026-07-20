"use strict";

const EXPECTED_CONTEXT_TYPE = "NASH_PROSPECT_MESSAGE_CONTEXT";
const EXPECTED_CONTEXT_VERSION = "1.0.0";

const FIELD_CLASSIFICATIONS = Object.freeze({
  prospectDisplayName: "DIRECT_MESSAGE_ALLOWED_IF_VERIFIED",
  advisorDisplayName: "DIRECT_MESSAGE_ALLOWED_IF_VERIFIED",
  verifiedReferrerName: "DIRECT_MESSAGE_ALLOWED_IF_VERIFIED",
  sourceType: "STRATEGY_ONLY",
  referrerRelationship: "STRATEGY_ONLY",
  occupation: "STRATEGY_ONLY",
  pipelineStatus: "STRATEGY_ONLY",
  goals: "STRATEGY_ONLY",
  objections: "STRATEGY_ONLY",
  conversationHistorySummary: "STRATEGY_ONLY",
  advisorSelectedTone: "TONE_ONLY",
  communicationPreference: "TONE_ONLY",
  lastVerifiedActivityAt: "TIMING_ONLY",
  appointmentHistory: "TIMING_ONLY",
  confirmedCommitments: "TIMING_ONLY",
  nextActionAt: "TIMING_ONLY",
});

const REQUIRED_FIELD_METADATA = Object.freeze([
  "field", "owner", "source", "purpose", "classification",
  "requiresVerification", "requiresHumanApproval", "evidence",
  "verificationStatus", "freshness", "privacyClassification",
]);

function invalid(message) {
  throw new Error(`INVALID_PROSPECT_MESSAGE_CONTEXT:${message}`);
}

function presentString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function clone(value) {
  return value && typeof value === "object" ? JSON.parse(JSON.stringify(value)) : value;
}

function deepFreeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  Object.freeze(value);
  Object.values(value).forEach(deepFreeze);
  return value;
}

function validateField(candidate) {
  if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) invalid("FIELD_OBJECT_REQUIRED");
  REQUIRED_FIELD_METADATA.forEach(key => {
    if (!(key in candidate)) invalid(`FIELD_METADATA_REQUIRED:${key}`);
  });
  if (!(candidate.field in FIELD_CLASSIFICATIONS)) invalid(`FIELD_NOT_ALLOWLISTED:${candidate.field}`);
  if (candidate.classification !== FIELD_CLASSIFICATIONS[candidate.field]) invalid(`FIELD_CLASSIFICATION_MISMATCH:${candidate.field}`);
  if (!presentString(candidate.owner) || !presentString(candidate.source) || !presentString(candidate.purpose)) invalid(`FIELD_AUTHORITY_METADATA_INVALID:${candidate.field}`);
  if (!presentString(candidate.requiresVerification) || !presentString(candidate.requiresHumanApproval)) invalid(`FIELD_REVIEW_METADATA_INVALID:${candidate.field}`);
  if (!Array.isArray(candidate.evidence) || candidate.evidence.length === 0 || candidate.evidence.some(ref => !presentString(ref))) invalid(`FIELD_EVIDENCE_INVALID:${candidate.field}`);
  if (candidate.verificationStatus !== "VERIFIED") invalid(`FIELD_NOT_VERIFIED:${candidate.field}`);
  if (!presentString(candidate.freshness) || !presentString(candidate.privacyClassification)) invalid(`FIELD_BOUNDARY_METADATA_INVALID:${candidate.field}`);
  if (candidate.value === undefined || candidate.value === null) invalid(`FIELD_VALUE_MISSING:${candidate.field}`);
}

function validateContext(context) {
  if (!context || typeof context !== "object" || Array.isArray(context)) invalid("OBJECT_REQUIRED");
  if (context.contractType !== EXPECTED_CONTEXT_TYPE) invalid("CONTRACT_TYPE");
  if (context.contractVersion !== EXPECTED_CONTEXT_VERSION) invalid("CONTRACT_VERSION");
  ["prospectIdentityReference", "advisorIdentityReference", "contextPurpose", "projectedAt"]
    .forEach(key => { if (!presentString(context[key])) invalid(`METADATA_REQUIRED:${key}`); });
  if (!Array.isArray(context.fields) || !Array.isArray(context.excludedFields)) invalid("FIELD_ARRAYS_REQUIRED");
  if (context.excludedFields.length !== 0) invalid("EXCLUDED_FIELDS_MUST_NOT_BE_EXPOSED");
  const seen = new Set();
  context.fields.forEach(field => {
    validateField(field);
    if (seen.has(field.field)) invalid(`DUPLICATE_FIELD:${field.field}`);
    seen.add(field.field);
  });
}

function noDraft(context, missingFields) {
  return deepFreeze({
    status: "NO_DRAFT",
    reason: "REQUIRED_CONTEXT_MISSING",
    missingFields,
    prospectIdentityReference: context.prospectIdentityReference,
    advisorIdentityReference: context.advisorIdentityReference,
    contextPurpose: context.contextPurpose,
    humanApprovalRequired: true,
    automaticApprovalAllowed: false,
    messageDeliveryAllowed: false,
  });
}

function evidenceBoundary(field) {
  return {
    field: field.field,
    owner: field.owner,
    source: field.source,
    evidence: field.evidence.slice(),
    verificationStatus: field.verificationStatus,
    freshness: field.freshness,
    privacyClassification: field.privacyClassification,
    requiresHumanApproval: field.requiresHumanApproval,
  };
}

function createDeterministicDraftCandidate(context) {
  validateContext(context);
  const byName = new Map(context.fields.map(field => [field.field, field]));
  const requiredNames = ["prospectDisplayName", "advisorDisplayName"];
  const missingFields = requiredNames.filter(name => !byName.has(name) || !presentString(byName.get(name).value));
  if (missingFields.length > 0) return noDraft(context, missingFields);

  const prospect = byName.get("prospectDisplayName");
  const advisor = byName.get("advisorDisplayName");
  const usedFields = [prospect, advisor];
  const draftText = `Hola, ${prospect.value.trim()}. Soy ${advisor.value.trim()}.`;

  return deepFreeze({
    status: "DRAFT_CANDIDATE",
    draftType: "DETERMINISTIC_PROSPECT_INTRODUCTION",
    draftText,
    contextPurpose: context.contextPurpose,
    contextReferences: {
      prospectIdentityReference: context.prospectIdentityReference,
      advisorIdentityReference: context.advisorIdentityReference,
      projectedAt: context.projectedAt,
    },
    usedFields: usedFields.map(field => field.field),
    evidenceBoundaries: usedFields.map(evidenceBoundary),
    uncertaintyBoundaries: [
      "ONLY_VERIFIED_DIRECT_MESSAGE_FIELDS_RENDERED",
      "UNUSED_CONTEXT_NOT_RENDERED",
      "DRAFT_IS_NOT_APPROVED_COMMUNICATION",
    ],
    humanApprovalRequired: true,
    exactArtifactApprovalRequired: true,
    automaticApprovalAllowed: false,
    messageDeliveryAllowed: false,
    aiUsed: false,
  });
}

module.exports = Object.freeze({
  EXPECTED_CONTEXT_TYPE,
  EXPECTED_CONTEXT_VERSION,
  FIELD_CLASSIFICATIONS,
  createDeterministicDraftCandidate,
});
