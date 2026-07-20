"use strict";
(function exposeProspectMessageContextAdapter(root) {

const CONTRACT_TYPE = "NASH_PROSPECT_MESSAGE_CONTEXT";
const CONTRACT_VERSION = "1.0.0";
const VERIFICATION_STATUSES = Object.freeze(["VERIFIED", "USER_ASSERTED", "UNVERIFIED", "REVIEW_REQUIRED"]);

const FIELD_POLICY = Object.freeze({
  prospectDisplayName: policy("Advisor OS Sales", "Governed Prospect identity", "Literal identification in reviewed copy", "DIRECT_MESSAGE_ALLOWED_IF_VERIFIED", "YES", "YES_EXACT_ARTIFACT"),
  advisorDisplayName: policy("Advisor OS Sales", "Authorized Advisor profile or authenticated identity", "Literal Advisor identification in reviewed copy", "DIRECT_MESSAGE_ALLOWED_IF_VERIFIED", "YES", "YES_EXACT_ARTIFACT"),
  verifiedReferrerName: policy("Relationship Intelligence / consent authority", "Attributable referral claim with contact-sharing basis", "Literal referral mention in reviewed copy", "DIRECT_MESSAGE_ALLOWED_IF_VERIFIED", "YES_IDENTITY_CONSENT_AND_FRESHNESS", "YES_EXACT_ARTIFACT"),
  sourceType: policy("Advisor OS Sales", "Governed source claim", "Conversation strategy", "STRATEGY_ONLY", "YES_SOURCE_LINEAGE", "YES_IF_USED_TO_SHAPE_ARTIFACT"),
  referrerRelationship: policy("Relationship Intelligence", "Governed relationship evidence", "Conversation strategy without literal assertion", "STRATEGY_ONLY", "YES", "YES_IF_USED_TO_SHAPE_ARTIFACT"),
  occupation: policy("Advisor OS Sales", "Governed, attributable Prospect fact", "Conversation strategy without literal assertion", "STRATEGY_ONLY", "YES", "YES_IF_USED_TO_SHAPE_ARTIFACT"),
  pipelineStatus: policy("Advisor OS Sales", "Governed Pipeline status reference", "Internal conversation strategy", "STRATEGY_ONLY", "YES", "YES_IF_USED_TO_SHAPE_ARTIFACT"),
  goals: policy("Advisor OS Sales", "Separately governed structured Prospect statement", "Conversation strategy only", "STRATEGY_ONLY", "YES", "YES_IF_USED_TO_SHAPE_ARTIFACT"),
  objections: policy("Advisor OS Sales", "Separately governed structured Prospect statement", "Conversation strategy only", "STRATEGY_ONLY", "YES", "YES_IF_USED_TO_SHAPE_ARTIFACT"),
  conversationHistorySummary: policy("Advisor OS Sales", "Governed structured summary with evidence references", "Conversation strategy only", "STRATEGY_ONLY", "YES", "YES_IF_USED_TO_SHAPE_ARTIFACT"),
  advisorSelectedTone: policy("Human Advisor", "Explicit current selection", "Wording style only", "TONE_ONLY", "YES_CURRENT_SELECTION", "YES_EXACT_ARTIFACT"),
  communicationPreference: policy("Prospect / Advisor OS Sales", "Evidenced Prospect preference", "Wording style only", "TONE_ONLY", "YES_PROVENANCE_AND_FRESHNESS", "YES_EXACT_ARTIFACT"),
  lastVerifiedActivityAt: policy("Advisor OS Sales", "Governed activity evidence", "Timing guidance only", "TIMING_ONLY", "YES", "YES_IF_USED_TO_SHAPE_ARTIFACT"),
  appointmentHistory: policy("Advisor OS Sales", "Governed appointment evidence", "Timing guidance only", "TIMING_ONLY", "YES", "YES_IF_USED_TO_SHAPE_ARTIFACT"),
  confirmedCommitments: policy("Advisor OS Sales", "Attributable conversation or event evidence", "Timing guidance only", "TIMING_ONLY", "YES", "YES_EXACT_ARTIFACT_IF_MENTIONED"),
  nextActionAt: policy("Advisor OS Sales", "Governed next-action record", "Timing guidance only", "TIMING_ONLY", "YES", "YES_IF_USED_TO_SHAPE_ARTIFACT"),
});

function policy(owner, source, purpose, classification, requiresVerification, requiresHumanApproval) {
  return Object.freeze({ owner, source, purpose, classification, requiresVerification, requiresHumanApproval });
}

function assertRequiredString(value, error) {
  if (typeof value !== "string" || !value.trim()) throw new Error(error);
  return value.trim();
}

function deepFreeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  Object.freeze(value);
  Object.values(value).forEach(deepFreeze);
  return value;
}

function cloneValue(value) {
  return value && typeof value === "object" ? JSON.parse(JSON.stringify(value)) : value;
}

function isEligible(candidate) {
  return candidate && typeof candidate === "object"
    && candidate.value !== undefined && candidate.value !== null
    && Array.isArray(candidate.evidence) && candidate.evidence.length > 0
    && candidate.evidence.every(reference => typeof reference === "string" && reference.trim())
    && candidate.verificationStatus === "VERIFIED"
    && typeof candidate.freshness === "string" && candidate.freshness.trim()
    && typeof candidate.privacyClassification === "string" && candidate.privacyClassification.trim();
}

function projectField(field, candidate) {
  const fieldPolicy = FIELD_POLICY[field];
  if (!fieldPolicy || !isEligible(candidate)) return null;
  return {
    field,
    value: cloneValue(candidate.value),
    owner: fieldPolicy.owner,
    source: fieldPolicy.source,
    purpose: fieldPolicy.purpose,
    classification: fieldPolicy.classification,
    requiresVerification: fieldPolicy.requiresVerification,
    requiresHumanApproval: fieldPolicy.requiresHumanApproval,
    evidence: candidate.evidence.slice(),
    verificationStatus: candidate.verificationStatus,
    freshness: candidate.freshness.trim(),
    privacyClassification: candidate.privacyClassification.trim(),
  };
}

function createProspectMessageContext(input = {}) {
  const prospectIdentityReference = assertRequiredString(input.prospectIdentityReference, "PROSPECT_IDENTITY_REFERENCE_REQUIRED");
  const advisorIdentityReference = assertRequiredString(input.advisorIdentityReference, "ADVISOR_IDENTITY_REFERENCE_REQUIRED");
  const contextPurpose = assertRequiredString(input.contextPurpose, "CONTEXT_PURPOSE_REQUIRED");
  const projectedAt = assertRequiredString(input.projectedAt, "PROJECTED_AT_REQUIRED");
  const candidates = input.fields && typeof input.fields === "object" ? input.fields : {};
  const fields = Object.keys(FIELD_POLICY)
    .map(field => projectField(field, candidates[field]))
    .filter(Boolean);

  return deepFreeze({
    contractType: CONTRACT_TYPE,
    contractVersion: CONTRACT_VERSION,
    prospectIdentityReference,
    advisorIdentityReference,
    contextPurpose,
    projectedAt,
    fields,
    excludedFields: [],
  });
}

const api = Object.freeze({
  CONTRACT_TYPE,
  CONTRACT_VERSION,
  FIELD_POLICY,
  VERIFICATION_STATUSES,
  createProspectMessageContext,
});

if (root) root.ForgeProspectMessageContextAdapter067G17N6 = api;
if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
