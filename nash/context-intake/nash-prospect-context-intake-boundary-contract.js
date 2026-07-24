"use strict";

const NASH_PROSPECT_CONTEXT_INTAKE_STATUS = Object.freeze({
  SUCCESS: "SUCCESS",
  INVALID_CONTEXT: "INVALID_CONTEXT",
  BLOCKED_CONTEXT: "BLOCKED_CONTEXT"
});

const NASH_PROSPECT_CONTEXT_INTAKE_ALLOWED_USES = Object.freeze([
  "PROSPECT_CONVERSATION_CONTEXT_INTAKE",
  "EVIDENCE_VALIDATION_CONTEXT",
  "HUMAN_REVIEW_CONTEXT"
]);

const NASH_PROSPECT_CONTEXT_INTAKE_FORBIDDEN_USES = Object.freeze([
  "MESSAGE_CREATE",
  "DRAFT_CREATE",
  "MESSAGE_SEND",
  "WHATSAPP_OPEN",
  "NBA_CREATE",
  "NBA_EXECUTE",
  "TASK_CREATE",
  "CALENDAR_CREATE",
  "PROVIDER_CALL",
  "DATABASE_WRITE",
  "FILESYSTEM_WRITE",
  "RUNTIME_EXECUTION"
]);

const TRUSTED_SOURCE_OWNERS = Object.freeze([
  "PIPELINE",
  "RELATIONSHIP_INTELLIGENCE",
  "APPOINTMENT_AUTHORITY",
  "NBA_AUTHORITY",
  "PRODUCT_INTELLIGENCE",
  "QUOTE_AUTHORITY",
  "ADVISOR_DECLARATION",
  "PROSPECT_DECLARATION"
]);

const CONTEXT_FIELD_NAMES = Object.freeze([
  "prospectIdentityReference",
  "pipelineStageReference",
  "conversationObjective",
  "relationshipContext",
  "verifiedInteractionFacts",
  "appointmentContext",
  "objectionContext",
  "officialNbaReference",
  "productReference",
  "quoteReference"
]);

const CONTROL_FIELD_NAMES = Object.freeze([
  "packetType",
  "version",
  "contextId",
  "requestedUse",
  "evidenceReferences",
  "sourceOwners",
  "freshness",
  "unknownFacts",
  "missingContext",
  "safeLanguageGuardrails",
  "forbiddenClaims",
  "candidateInterpretations",
  "humanApprovalRequired",
  "contextOnly"
]);

const SENSITIVE_OR_PROHIBITED_FIELDS = Object.freeze([
  "initialContext",
  "notes",
  "internalNotes",
  "health",
  "medicalInformation",
  "income",
  "financialNeeds",
  "familyContext",
  "children",
  "dependents",
  "dateOfBirth",
  "maritalStatus",
  "personality",
  "inferredIntent",
  "conversationHistory",
  "rawPipelineObject"
]);

const DEFAULT_SAFE_LANGUAGE_GUARDRAILS = Object.freeze([
  "NO_INVENTED_FACTS",
  "NO_INVENTED_INTENT",
  "NO_PRESSURE_OR_MANIPULATION",
  "NO_SENSITIVE_CONTEXT_IN_DIRECT_COPY",
  "HUMAN_APPROVAL_REQUIRED"
]);

function clone(value) {
  if (value === undefined) return undefined;
  return JSON.parse(JSON.stringify(value));
}

function asArray(value) {
  if (value === undefined || value === null) return [];
  return Array.isArray(value) ? value : [value];
}

function uniqueStrings(values) {
  return [...new Set(asArray(values).flat().filter((value) => typeof value === "string" && value.trim()).map((value) => value.trim()))];
}

function deepFreeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  Object.freeze(value);
  for (const nested of Object.values(value)) deepFreeze(nested);
  return value;
}

function noSideEffectFlags() {
  return {
    generatesMessages: false,
    generatesDrafts: false,
    createsOrExecutesNba: false,
    sendsMessages: false,
    opensWhatsApp: false,
    createsTasks: false,
    createsCalendarEvents: false,
    invokesProviders: false,
    performsNetworkCalls: false,
    readsOrWritesDatabase: false,
    readsOrWritesFilesystem: false,
    mutatesPipeline: false,
    persistsContext: false,
    executesRuntimeActions: false
  };
}

function hasRawPipelineShape(input) {
  return Boolean(
    input.rawPipelineObject ||
    input.pipelineProspect ||
    input.prospectRecord ||
    input.pipelineState ||
    input.prospect
  );
}

function validateEvidenceReference(reference) {
  return Boolean(
    reference &&
    typeof reference === "object" &&
    typeof reference.evidenceId === "string" &&
    reference.evidenceId.trim() &&
    typeof reference.sourceOwner === "string" &&
    TRUSTED_SOURCE_OWNERS.includes(reference.sourceOwner) &&
    typeof reference.observedAt === "string" &&
    !Number.isNaN(Date.parse(reference.observedAt))
  );
}

function normalizeEvidenceReference(reference) {
  return {
    evidenceId: reference.evidenceId.trim(),
    sourceOwner: reference.sourceOwner,
    observedAt: reference.observedAt
  };
}

function validateContextEntry(entry, evidenceById) {
  if (!entry || typeof entry !== "object" || Array.isArray(entry)) return { valid: false, reason: "INVALID_ENTRY" };
  if (typeof entry.sourceOwner !== "string" || !TRUSTED_SOURCE_OWNERS.includes(entry.sourceOwner)) {
    return { valid: false, reason: "INVALID_SOURCE_OWNER" };
  }
  if (!Array.isArray(entry.evidenceRefs) || entry.evidenceRefs.length === 0) {
    return { valid: false, reason: "MISSING_EVIDENCE" };
  }
  if (entry.evidenceRefs.some((id) => !evidenceById.has(id))) {
    return { valid: false, reason: "UNKNOWN_EVIDENCE_REFERENCE" };
  }
  if (!entry.freshness || typeof entry.freshness !== "object" || typeof entry.freshness.status !== "string") {
    return { valid: false, reason: "MISSING_FRESHNESS" };
  }
  if (!Object.prototype.hasOwnProperty.call(entry, "value")) return { valid: false, reason: "MISSING_VALUE" };
  const values = Array.isArray(entry.value) ? entry.value : [entry.value];
  if (values.some((value) => !["string", "number", "boolean"].includes(typeof value))) {
    return { valid: false, reason: "STRUCTURED_OR_UNSAFE_VALUE" };
  }
  const verificationStatus = entry.verificationStatus || "UNKNOWN";
  if (!["VERIFIED", "UNVERIFIED", "UNKNOWN"].includes(verificationStatus)) {
    return { valid: false, reason: "INVALID_VERIFICATION_STATUS" };
  }
  return { valid: true, verificationStatus };
}

function normalizeCandidateInterpretation(candidate) {
  const source = candidate && typeof candidate === "object" ? candidate : { value: candidate };
  return {
    value: clone(source.value),
    evidenceRefs: uniqueStrings(source.evidenceRefs),
    factual: false,
    verificationStatus: "UNVERIFIED",
    requiresHumanReview: true
  };
}

function buildNashProspectContextIntakeBoundary(input = {}, options = {}) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return deepFreeze({
      engine: "NASH_PROSPECT_CONTEXT_INTAKE_BOUNDARY_CONTRACT",
      version: "1.0",
      status: NASH_PROSPECT_CONTEXT_INTAKE_STATUS.INVALID_CONTEXT,
      requestedUse: "PROSPECT_CONVERSATION_CONTEXT_INTAKE",
      contextOnly: true,
      humanApprovalRequired: true,
      errors: ["CONTEXT_MUST_BE_AN_OBJECT"],
      blockedContext: [],
      unknownFacts: ["prospectContext"],
      sideEffects: noSideEffectFlags()
    });
  }

  const source = clone(input);
  const requestedUse = options.requestedUse || source.requestedUse || "PROSPECT_CONVERSATION_CONTEXT_INTAKE";
  const errors = [];
  const blockedContext = [];
  const missingContext = uniqueStrings(source.missingContext);
  const unknownFacts = uniqueStrings(source.unknownFacts);
  const unsupportedFields = Object.keys(source).filter(
    (key) => !CONTEXT_FIELD_NAMES.includes(key) && !CONTROL_FIELD_NAMES.includes(key)
  );

  if (!NASH_PROSPECT_CONTEXT_INTAKE_ALLOWED_USES.includes(requestedUse)) {
    blockedContext.push({ field: "requestedUse", reason: NASH_PROSPECT_CONTEXT_INTAKE_FORBIDDEN_USES.includes(requestedUse) ? "FORBIDDEN_USE" : "UNSUPPORTED_USE" });
  }
  if (hasRawPipelineShape(source)) blockedContext.push({ field: "rawPipelineObject", reason: "RAW_PIPELINE_INPUT_PROHIBITED" });
  for (const field of unsupportedFields) {
    blockedContext.push({ field, reason: SENSITIVE_OR_PROHIBITED_FIELDS.includes(field) ? "SENSITIVE_OR_PROHIBITED_FIELD" : "UNSUPPORTED_FIELD" });
  }

  const evidenceReferences = asArray(source.evidenceReferences).map(clone);
  const invalidEvidence = evidenceReferences.filter((reference) => !validateEvidenceReference(reference));
  if (evidenceReferences.length === 0) errors.push("MISSING_EVIDENCE_REFERENCES");
  if (invalidEvidence.length > 0) errors.push("INVALID_EVIDENCE_REFERENCE");
  const evidenceById = new Map(
    evidenceReferences.filter(validateEvidenceReference).map((reference) => [reference.evidenceId, reference])
  );

  const declaredSourceOwners = uniqueStrings(source.sourceOwners);
  for (const sourceOwner of declaredSourceOwners) {
    if (!TRUSTED_SOURCE_OWNERS.includes(sourceOwner)) {
      blockedContext.push({ field: "sourceOwners", reason: "INVALID_SOURCE_OWNER" });
    }
  }
  if (!source.freshness || typeof source.freshness !== "object" || typeof source.freshness.status !== "string") {
    errors.push("MISSING_FRESHNESS_METADATA");
  } else if (source.freshness.status !== "CURRENT") {
    blockedContext.push({ field: "freshness", reason: source.freshness.status === "STALE" ? "STALE_CONTEXT" : "UNKNOWN_FRESHNESS" });
  }

  const acceptedContext = {};
  const knownFacts = [];
  for (const field of CONTEXT_FIELD_NAMES) {
    if (!Object.prototype.hasOwnProperty.call(source, field)) continue;
    const entries = asArray(source[field]);
    const acceptedEntries = [];
    for (const entry of entries) {
      const validation = validateContextEntry(entry, evidenceById);
      const path = `${field}[${acceptedEntries.length}]`;
      if (!validation.valid) {
        blockedContext.push({ field: path, reason: validation.reason });
        continue;
      }
      if (validation.verificationStatus !== "VERIFIED") {
        blockedContext.push({ field: path, reason: "UNVERIFIED_CONTEXT", candidateValueRetained: false });
        unknownFacts.push(field);
        continue;
      }
      if (entry.freshness.status !== "CURRENT") {
        blockedContext.push({ field: path, reason: entry.freshness.status === "STALE" ? "STALE_EVIDENCE" : "UNKNOWN_FRESHNESS" });
        unknownFacts.push(field);
        continue;
      }
      const normalized = {
        value: clone(entry.value),
        sourceOwner: entry.sourceOwner,
        evidenceRefs: uniqueStrings(entry.evidenceRefs),
        verificationStatus: "VERIFIED",
        freshness: clone(entry.freshness)
      };
      acceptedEntries.push(normalized);
      knownFacts.push({ field, ...clone(normalized) });
    }
    if (acceptedEntries.length > 0) acceptedContext[field] = Array.isArray(source[field]) ? acceptedEntries : acceptedEntries[0];
  }

  if (!acceptedContext.prospectIdentityReference) missingContext.push("prospectIdentityReference");
  if (!acceptedContext.conversationObjective) missingContext.push("conversationObjective");

  const sourceOwners = uniqueStrings([
    evidenceReferences.filter(validateEvidenceReference).map((reference) => reference.sourceOwner),
    knownFacts.map((fact) => fact.sourceOwner)
  ]);
  const candidateInterpretations = asArray(source.candidateInterpretations).map(normalizeCandidateInterpretation);
  const safeLanguageGuardrails = uniqueStrings([DEFAULT_SAFE_LANGUAGE_GUARDRAILS, source.safeLanguageGuardrails]);
  const forbiddenClaims = uniqueStrings(source.forbiddenClaims);

  let status = NASH_PROSPECT_CONTEXT_INTAKE_STATUS.SUCCESS;
  if (blockedContext.length > 0) status = NASH_PROSPECT_CONTEXT_INTAKE_STATUS.BLOCKED_CONTEXT;
  else if (errors.length > 0 || missingContext.length > 0) status = NASH_PROSPECT_CONTEXT_INTAKE_STATUS.INVALID_CONTEXT;

  return deepFreeze({
    engine: "NASH_PROSPECT_CONTEXT_INTAKE_BOUNDARY_CONTRACT",
    version: "1.0",
    packetType: "NASH_PROSPECT_CONTEXT_INTAKE_PACKET_V1",
    status,
    requestedUse,
    contextOnly: true,
    humanApprovalRequired: true,
    authoritativeInput: false,
    acceptedContext,
    evidenceReferences: evidenceReferences.filter(validateEvidenceReference).map(normalizeEvidenceReference),
    sourceOwners,
    freshness: clone(source.freshness || null),
    knownFacts,
    unknownFacts: uniqueStrings(unknownFacts),
    missingContext: uniqueStrings(missingContext),
    blockedContext,
    candidateInterpretations,
    candidateInterpretationsAreFacts: false,
    safeLanguageGuardrails,
    forbiddenClaims,
    errors: uniqueStrings(errors),
    sideEffects: noSideEffectFlags()
  });
}

const api = Object.freeze({
  NASH_PROSPECT_CONTEXT_INTAKE_STATUS,
  NASH_PROSPECT_CONTEXT_INTAKE_ALLOWED_USES,
  NASH_PROSPECT_CONTEXT_INTAKE_FORBIDDEN_USES,
  TRUSTED_SOURCE_OWNERS,
  CONTEXT_FIELD_NAMES,
  SENSITIVE_OR_PROHIBITED_FIELDS,
  DEFAULT_SAFE_LANGUAGE_GUARDRAILS,
  buildNashProspectContextIntakeBoundary,
  _private: { clone, asArray, uniqueStrings, deepFreeze, noSideEffectFlags }
});

if (typeof globalThis !== "undefined") {
  globalThis.ForgeNashProspectContextIntakeBoundaryContract = api;
}
if (typeof module !== "undefined" && module.exports) {
  module.exports = api;
}
