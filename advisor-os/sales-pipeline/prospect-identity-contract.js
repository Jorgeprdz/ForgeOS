"use strict";

const SOURCE_TYPES = Object.freeze(["MANUAL_ENTRY", "REFERRAL", "PROJECT_200_HANDOFF", "AUTHORIZED_IMPORT", "EXISTING_CONTACT", "RELATIONSHIP_SIGNAL", "OTHER_GOVERNED_SOURCE"]);
const CONTEXT_TYPES = Object.freeze(["VERIFIED_FACT", "USER_AUTHORED_NOTE", "SOURCE_CLAIM", "MODEL_INTERPRETATION"]);

function assert(condition, message) { if (!condition) throw new Error(message); }
function freezeCopy(value) { return Object.freeze(JSON.parse(JSON.stringify(value))); }

function validateSourceClaim(claim) {
  assert(claim && SOURCE_TYPES.includes(claim.sourceType), "INVALID_SOURCE_TYPE");
  ["sourceRecordId", "sourceDomain", "sourceDate", "capturedAt", "capturedBy"].forEach(key => assert(typeof claim[key] === "string" && claim[key], `MISSING_${key}`));
  assert(Array.isArray(claim.evidenceReferences), "EVIDENCE_REFERENCES_REQUIRED");
  assert(["VERIFIED", "USER_ASSERTED", "UNVERIFIED", "REVIEW_REQUIRED"].includes(claim.confidenceOrVerificationStatus), "INVALID_VERIFICATION_STATUS");
  return freezeCopy(claim);
}

function createProspectIdentity(input) {
  assert(input && input.prospectId && input.advisorId && input.displayName, "PROSPECT_IDENTITY_FIELDS_REQUIRED");
  assert(input.prospectId !== input.advisorId, "PROSPECT_ID_MUST_BE_SEPARATE");
  assert(!input.salesOpportunityId && !input.referralId && !input.project200ContactId && !input.clientId, "FOREIGN_IDENTITIES_MUST_BE_REFERENCES");
  assert(Array.isArray(input.sourceClaims) && input.sourceClaims.length, "SOURCE_LINEAGE_REQUIRED");
  const context = input.context || [];
  context.forEach(item => {
    assert(CONTEXT_TYPES.includes(item.contextType), "INVALID_CONTEXT_TYPE");
    assert(item.contextId && item.value !== undefined && item.sourceLineage, "CONTEXT_LINEAGE_REQUIRED");
    if (item.contextType === "MODEL_INTERPRETATION") assert(item.overwritesFact !== true, "MODEL_INTERPRETATION_CANNOT_OVERWRITE_FACT");
  });
  return freezeCopy({
    contractType: "ADVISOR_OS_PROSPECT_IDENTITY", schemaVersion: "1.0.0",
    prospectId: input.prospectId, advisorId: input.advisorId, displayName: input.displayName,
    normalizedIdentityFields: input.normalizedIdentityFields || {},
    ownership: { domain: "ADVISOR_OS_SALES", advisorId: input.advisorId, managerWriteAllowed: false },
    statusReference: input.statusReference || null,
    sourceClaims: input.sourceClaims.map(validateSourceClaim),
    relationshipReferences: input.relationshipReferences || [], context,
    createdAt: input.createdAt, updatedAt: input.updatedAt, version: input.version || 1,
    privacyClassification: input.privacyClassification || "FORGE_CONFIDENTIAL_PROSPECT"
  });
}

module.exports = { SOURCE_TYPES, CONTEXT_TYPES, validateSourceClaim, createProspectIdentity };
