"use strict";

const UNIVERSAL_PROSPECT_CONTEXT_STATUS = Object.freeze({
  SUCCESS: "SUCCESS",
  INVALID_CONTEXT: "INVALID_CONTEXT",
  BLOCKED_CONTEXT: "BLOCKED_CONTEXT"
});

const PROSPECT_CONTEXT_CONSUMERS = Object.freeze({
  CONVERSATION_CONTEXT: "CONVERSATION_CONTEXT",
  QUOTE_CONTEXT: "QUOTE_CONTEXT",
  PRODUCT_CONTEXT: "PRODUCT_CONTEXT",
  PRESENTATION_CONTEXT_REFERENCE: "PRESENTATION_CONTEXT_REFERENCE"
});

const CONSUMER_VALUES = Object.freeze(Object.values(PROSPECT_CONTEXT_CONSUMERS));

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

const SENSITIVITY_CLASSIFICATIONS = Object.freeze([
  "OPERATIONAL_REFERENCE",
  "VERIFIED_IDENTITY",
  "DECLARED_BUSINESS_CONTEXT",
  "AUTHORITY_REFERENCE",
  "RESTRICTED",
  "SENSITIVE_EXCLUDE_BY_DEFAULT"
]);

const PROHIBITED_USES = Object.freeze([
  "INVENT_FACT",
  "INFER_INTENT",
  "INFER_PERSONALITY",
  "INFER_MOTIVATION",
  "GENERATE_NBA",
  "EXECUTE_NBA",
  "CALCULATE_QUOTE",
  "RECALCULATE_QUOTE",
  "RECOMMEND_PRODUCT",
  "CREATE_PRESENTATION",
  "GENERATE_DRAFT",
  "SEND_MESSAGE",
  "PERSIST_CONTEXT",
  "AUTOMATIC_APPROVAL"
]);

const FIELD_DEFINITIONS = Object.freeze({
  "identity.prospect_reference": Object.freeze({
    consumers: CONSUMER_VALUES,
    sourceOwners: ["PIPELINE"],
    sensitivity: "OPERATIONAL_REFERENCE"
  }),
  "identity.display_name_reference": Object.freeze({
    consumers: [PROSPECT_CONTEXT_CONSUMERS.CONVERSATION_CONTEXT, PROSPECT_CONTEXT_CONSUMERS.PRESENTATION_CONTEXT_REFERENCE],
    sourceOwners: ["PIPELINE"],
    sensitivity: "VERIFIED_IDENTITY"
  }),
  "identity.source_channel_reference": Object.freeze({
    consumers: [PROSPECT_CONTEXT_CONSUMERS.CONVERSATION_CONTEXT, PROSPECT_CONTEXT_CONSUMERS.PRODUCT_CONTEXT],
    sourceOwners: ["PIPELINE"],
    sensitivity: "OPERATIONAL_REFERENCE"
  }),
  "pipeline.current_stage": Object.freeze({
    consumers: [PROSPECT_CONTEXT_CONSUMERS.CONVERSATION_CONTEXT, PROSPECT_CONTEXT_CONSUMERS.PRESENTATION_CONTEXT_REFERENCE],
    sourceOwners: ["PIPELINE"],
    sensitivity: "OPERATIONAL_REFERENCE"
  }),
  "needs.conversation_objective": Object.freeze({
    consumers: [PROSPECT_CONTEXT_CONSUMERS.CONVERSATION_CONTEXT, PROSPECT_CONTEXT_CONSUMERS.PRESENTATION_CONTEXT_REFERENCE],
    sourceOwners: ["ADVISOR_DECLARATION", "PROSPECT_DECLARATION"],
    sensitivity: "DECLARED_BUSINESS_CONTEXT"
  }),
  "needs.quote_objective": Object.freeze({
    consumers: [PROSPECT_CONTEXT_CONSUMERS.QUOTE_CONTEXT],
    sourceOwners: ["ADVISOR_DECLARATION", "PROSPECT_DECLARATION"],
    sensitivity: "DECLARED_BUSINESS_CONTEXT"
  }),
  "needs.declared_goal": Object.freeze({
    consumers: CONSUMER_VALUES,
    sourceOwners: ["PROSPECT_DECLARATION"],
    sensitivity: "DECLARED_BUSINESS_CONTEXT"
  }),
  "needs.declared_concern": Object.freeze({
    consumers: [PROSPECT_CONTEXT_CONSUMERS.CONVERSATION_CONTEXT, PROSPECT_CONTEXT_CONSUMERS.QUOTE_CONTEXT, PROSPECT_CONTEXT_CONSUMERS.PRODUCT_CONTEXT],
    sourceOwners: ["PROSPECT_DECLARATION"],
    sensitivity: "DECLARED_BUSINESS_CONTEXT"
  }),
  "quote.verified_constraint": Object.freeze({
    consumers: [PROSPECT_CONTEXT_CONSUMERS.QUOTE_CONTEXT],
    sourceOwners: ["QUOTE_AUTHORITY", "PROSPECT_DECLARATION"],
    sensitivity: "DECLARED_BUSINESS_CONTEXT"
  }),
  "product.verified_constraint": Object.freeze({
    consumers: [PROSPECT_CONTEXT_CONSUMERS.PRODUCT_CONTEXT],
    sourceOwners: ["PRODUCT_INTELLIGENCE", "PROSPECT_DECLARATION"],
    sensitivity: "DECLARED_BUSINESS_CONTEXT"
  }),
  "relationship.reference": Object.freeze({
    consumers: [PROSPECT_CONTEXT_CONSUMERS.CONVERSATION_CONTEXT],
    sourceOwners: ["RELATIONSHIP_INTELLIGENCE"],
    sensitivity: "AUTHORITY_REFERENCE"
  }),
  "interaction.verified_reference": Object.freeze({
    consumers: [PROSPECT_CONTEXT_CONSUMERS.CONVERSATION_CONTEXT, PROSPECT_CONTEXT_CONSUMERS.PRESENTATION_CONTEXT_REFERENCE],
    sourceOwners: ["PIPELINE"],
    sensitivity: "AUTHORITY_REFERENCE"
  }),
  "appointment.verified_reference": Object.freeze({
    consumers: [PROSPECT_CONTEXT_CONSUMERS.CONVERSATION_CONTEXT, PROSPECT_CONTEXT_CONSUMERS.PRESENTATION_CONTEXT_REFERENCE],
    sourceOwners: ["APPOINTMENT_AUTHORITY"],
    sensitivity: "AUTHORITY_REFERENCE"
  }),
  "nba.official_reference": Object.freeze({
    consumers: [PROSPECT_CONTEXT_CONSUMERS.CONVERSATION_CONTEXT],
    sourceOwners: ["NBA_AUTHORITY"],
    sensitivity: "AUTHORITY_REFERENCE"
  }),
  "product.authority_reference": Object.freeze({
    consumers: [PROSPECT_CONTEXT_CONSUMERS.CONVERSATION_CONTEXT, PROSPECT_CONTEXT_CONSUMERS.QUOTE_CONTEXT, PROSPECT_CONTEXT_CONSUMERS.PRODUCT_CONTEXT, PROSPECT_CONTEXT_CONSUMERS.PRESENTATION_CONTEXT_REFERENCE],
    sourceOwners: ["PRODUCT_INTELLIGENCE"],
    sensitivity: "AUTHORITY_REFERENCE"
  }),
  "quote.authority_reference": Object.freeze({
    consumers: [PROSPECT_CONTEXT_CONSUMERS.CONVERSATION_CONTEXT, PROSPECT_CONTEXT_CONSUMERS.QUOTE_CONTEXT, PROSPECT_CONTEXT_CONSUMERS.PRESENTATION_CONTEXT_REFERENCE],
    sourceOwners: ["QUOTE_AUTHORITY"],
    sensitivity: "AUTHORITY_REFERENCE"
  })
});

function clone(value) {
  if (value === undefined) return undefined;
  return JSON.parse(JSON.stringify(value));
}

function deepFreeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  Object.freeze(value);
  for (const nested of Object.values(value)) deepFreeze(nested);
  return value;
}

function unique(values) {
  return [...new Set(values.filter((value) => typeof value === "string" && value.trim()).map((value) => value.trim()))];
}

function safeFieldIdentifiers(values) {
  return unique(values).filter((value) => value.length <= 120 && /^[A-Za-z][A-Za-z0-9_.]*$/.test(value));
}

function normalizeDescriptor(item, fallbackReason) {
  const source = item && typeof item === "object" ? item : {};
  return {
    fieldId: typeof source.fieldId === "string" && source.fieldId.length <= 120 && /^[A-Za-z][A-Za-z0-9_.]*$/.test(source.fieldId)
      ? source.fieldId
      : "UNKNOWN_FIELD",
    reason: typeof source.reason === "string" && source.reason.length <= 120 && /^[A-Z0-9_]+$/.test(source.reason)
      ? source.reason
      : fallbackReason,
    sourceOwner: TRUSTED_SOURCE_OWNERS.includes(source.sourceOwner) ? source.sourceOwner : null,
    sourceRecordReference: isOpaqueReference(source.sourceRecordReference) ? source.sourceRecordReference : null,
    rawValueRetained: false
  };
}

function isApprovedScalar(value) {
  if (["string", "number", "boolean"].includes(typeof value)) return true;
  return Array.isArray(value) && value.length > 0 && value.every((item) => ["string", "number", "boolean"].includes(typeof item));
}

function isOpaqueReference(value) {
  return typeof value === "string" && value.length > 0 && value.length <= 200 && /^[A-Za-z0-9._:-]+$/.test(value);
}

function isPlaceholder(value) {
  if (value === 0 || value === "0") return true;
  if (typeof value !== "string") return false;
  const normalized = value.trim().toUpperCase();
  return !normalized || ["UNKNOWN", "N/A", "NA", "NONE", "NULL", "UNDEFINED", "PENDING", "TBD", "PLACEHOLDER", "SIN INFORMACION", "SIN INFORMACIÓN"].includes(normalized);
}

function noSideEffects() {
  return {
    mutationPerformed: false,
    persistencePerformed: false,
    databaseAccessed: false,
    filesystemAccessed: false,
    networkAccessed: false,
    providerInvoked: false,
    messageGenerated: false,
    draftGenerated: false,
    messageSent: false,
    nbaCreatedOrExecuted: false,
    taskCreated: false,
    calendarCreated: false,
    quoteCalculated: false,
    productRecommended: false,
    presentationCreated: false,
    runtimeWired: false
  };
}

function normalizeEvidence(reference) {
  if (!reference || typeof reference !== "object") return null;
  if (!isOpaqueReference(reference.evidenceId)) return null;
  if (!TRUSTED_SOURCE_OWNERS.includes(reference.sourceOwner)) return null;
  if (typeof reference.observedAt !== "string" || Number.isNaN(Date.parse(reference.observedAt))) return null;
  return {
    evidenceId: reference.evidenceId.trim(),
    sourceOwner: reference.sourceOwner,
    sourceRecordReference: isOpaqueReference(reference.sourceRecordReference) ? reference.sourceRecordReference : null,
    observedAt: reference.observedAt
  };
}

function normalizeGovernedField(candidate, evidenceById) {
  if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) return { accepted: false, reason: "INVALID_FIELD" };
  const definition = FIELD_DEFINITIONS[candidate.fieldId];
  if (!definition) return { accepted: false, reason: "UNSUPPORTED_FIELD" };
  if (!isApprovedScalar(candidate.value)) return { accepted: false, reason: "RAW_OR_STRUCTURED_VALUE" };
  if (isPlaceholder(candidate.value)) return { accepted: false, reason: "PLACEHOLDER_OR_DEFAULT_VALUE" };
  if (!TRUSTED_SOURCE_OWNERS.includes(candidate.sourceOwner)) return { accepted: false, reason: "INVALID_SOURCE_OWNER" };
  if (!definition.sourceOwners.includes(candidate.sourceOwner)) return { accepted: false, reason: "SOURCE_OWNER_NOT_AUTHORIZED_FOR_FIELD" };
  if (!isOpaqueReference(candidate.sourceRecordReference)) return { accepted: false, reason: "MISSING_SOURCE_RECORD_REFERENCE" };
  if (!isOpaqueReference(candidate.evidenceReference) || !evidenceById.has(candidate.evidenceReference)) return { accepted: false, reason: "MISSING_OR_UNKNOWN_EVIDENCE" };
  if (evidenceById.get(candidate.evidenceReference).sourceOwner !== candidate.sourceOwner) return { accepted: false, reason: "EVIDENCE_OWNER_MISMATCH" };
  if (candidate.verificationStatus !== "VERIFIED") return { accepted: false, reason: "UNVERIFIED_VALUE" };
  if (!candidate.freshness || candidate.freshness.status !== "CURRENT") {
    return { accepted: false, reason: candidate.freshness?.status === "STALE" ? "STALE_VALUE" : "UNKNOWN_FRESHNESS" };
  }
  if (candidate.sensitivityClassification && !SENSITIVITY_CLASSIFICATIONS.includes(candidate.sensitivityClassification)) {
    return { accepted: false, reason: "INVALID_SENSITIVITY_CLASSIFICATION" };
  }

  const allowedConsumers = [...definition.consumers];
  const prohibitedConsumers = CONSUMER_VALUES.filter((consumer) => !allowedConsumers.includes(consumer));
  return {
    accepted: true,
    field: {
      fieldId: candidate.fieldId,
      value: clone(candidate.value),
      sourceOwner: candidate.sourceOwner,
      sourceRecordReference: candidate.sourceRecordReference.trim(),
      evidenceReference: candidate.evidenceReference,
      verificationStatus: "VERIFIED",
      freshness: clone(candidate.freshness),
      sensitivityClassification: candidate.sensitivityClassification || definition.sensitivity,
      allowedConsumers,
      prohibitedConsumers,
      inclusionReason: "VERIFIED_ALLOWLISTED_FIELD"
    }
  };
}

function buildUniversalGovernedProspectContext(input = {}) {
  const source = input && typeof input === "object" && !Array.isArray(input) ? clone(input) : {};
  const evidenceReferences = (Array.isArray(source.evidenceReferences) ? source.evidenceReferences : []).map(normalizeEvidence).filter(Boolean);
  const evidenceById = new Map(evidenceReferences.map((reference) => [reference.evidenceId, reference]));
  const projectedFields = [];
  const excludedFields = [...(Array.isArray(source.excludedFields) ? source.excludedFields : []).map((item) => normalizeDescriptor(item, "EXCLUDED_BY_POLICY"))];
  const quarantinedFields = [...(Array.isArray(source.quarantinedFields) ? source.quarantinedFields : []).map((item) => normalizeDescriptor(item, "QUARANTINED_BY_POLICY"))];
  const unknownFields = safeFieldIdentifiers(Array.isArray(source.unknownFields) ? source.unknownFields : []);
  const missingFields = safeFieldIdentifiers(Array.isArray(source.missingFields) ? source.missingFields : []);
  const staleFields = [];
  const blockedFields = [];

  for (const candidate of Array.isArray(source.candidateFields) ? source.candidateFields : []) {
    const normalized = normalizeGovernedField(candidate, evidenceById);
    if (normalized.accepted) {
      projectedFields.push(normalized.field);
      continue;
    }
    const descriptor = { fieldId: typeof candidate?.fieldId === "string" ? candidate.fieldId : "UNKNOWN_FIELD", reason: normalized.reason };
    if (normalized.reason === "STALE_VALUE") staleFields.push(descriptor);
    else if (["UNVERIFIED_VALUE", "RAW_OR_STRUCTURED_VALUE"].includes(normalized.reason)) quarantinedFields.push(descriptor);
    else if (["UNSUPPORTED_FIELD", "PLACEHOLDER_OR_DEFAULT_VALUE"].includes(normalized.reason)) excludedFields.push(descriptor);
    else blockedFields.push(descriptor);
  }

  if (!projectedFields.some((field) => field.fieldId === "identity.prospect_reference")) missingFields.push("identity.prospect_reference");
  if (!projectedFields.some((field) => field.fieldId === "pipeline.current_stage")) missingFields.push("pipeline.current_stage");

  let status = UNIVERSAL_PROSPECT_CONTEXT_STATUS.SUCCESS;
  if (blockedFields.length > 0) status = UNIVERSAL_PROSPECT_CONTEXT_STATUS.BLOCKED_CONTEXT;
  else if (missingFields.length > 0 || staleFields.some((field) => ["identity.prospect_reference", "pipeline.current_stage"].includes(field.fieldId))) {
    status = UNIVERSAL_PROSPECT_CONTEXT_STATUS.INVALID_CONTEXT;
  }

  const sourceOwners = unique(projectedFields.map((field) => field.sourceOwner));
  const availableConsumerProjections = CONSUMER_VALUES.filter((consumer) => projectedFields.some((field) => field.allowedConsumers.includes(consumer)));

  return deepFreeze({
    contractType: "UNIVERSAL_GOVERNED_PROSPECT_CONTEXT",
    version: "1.0",
    status,
    universalProspectContext: {
      authority: "SOURCE_OWNERS_RETAIN_AUTHORITY",
      consumerNeutral: true,
      projectedFields: clone(projectedFields)
    },
    projectedFields,
    excludedFields,
    quarantinedFields,
    unknownFields,
    missingFields: unique(missingFields),
    staleFields,
    blockedFields,
    evidenceReferences,
    sourceOwners,
    availableConsumerProjections,
    prohibitedUses: [...PROHIBITED_USES],
    contextOnly: true,
    humanApprovalRequired: true,
    ...noSideEffects()
  });
}

function projectUniversalProspectContext(universalContext, consumer) {
  const source = universalContext && typeof universalContext === "object" ? universalContext : {};
  if (!CONSUMER_VALUES.includes(consumer)) {
    return deepFreeze({ status: "INVALID_CONSUMER", consumer, projectedFields: [], prohibitedUses: [...PROHIBITED_USES], contextOnly: true, humanApprovalRequired: true, ...noSideEffects() });
  }

  const projectedFields = (Array.isArray(source.projectedFields) ? source.projectedFields : [])
    .filter((field) => Array.isArray(field.allowedConsumers) && field.allowedConsumers.includes(consumer))
    .map(clone);
  const visibleFieldIds = new Set(projectedFields.map((field) => field.fieldId));
  const filterDescriptors = (items) => (Array.isArray(items) ? items : []).filter((item) => {
    if (!item?.fieldId) return true;
    const definition = FIELD_DEFINITIONS[item.fieldId];
    return !definition || definition.consumers.includes(consumer);
  }).map(clone);
  const evidenceIds = new Set(projectedFields.map((field) => field.evidenceReference));

  return deepFreeze({
    contractType: "UNIVERSAL_PROSPECT_CONSUMER_PROJECTION",
    version: "1.0",
    status: source.status || UNIVERSAL_PROSPECT_CONTEXT_STATUS.INVALID_CONTEXT,
    consumer,
    projectedFields,
    excludedFields: filterDescriptors(source.excludedFields),
    quarantinedFields: filterDescriptors(source.quarantinedFields),
    unknownFields: (Array.isArray(source.unknownFields) ? source.unknownFields : []).filter((fieldId) => !FIELD_DEFINITIONS[fieldId] || FIELD_DEFINITIONS[fieldId].consumers.includes(consumer)),
    missingFields: (Array.isArray(source.missingFields) ? source.missingFields : []).filter((fieldId) => !FIELD_DEFINITIONS[fieldId] || FIELD_DEFINITIONS[fieldId].consumers.includes(consumer)),
    staleFields: filterDescriptors(source.staleFields),
    blockedFields: filterDescriptors(source.blockedFields),
    evidenceReferences: (Array.isArray(source.evidenceReferences) ? source.evidenceReferences : []).filter((reference) => evidenceIds.has(reference.evidenceId)).map(clone),
    sourceOwners: unique(projectedFields.map((field) => field.sourceOwner)),
    prohibitedUses: [...PROHIBITED_USES],
    excludedUniversalFieldCount: (Array.isArray(source.projectedFields) ? source.projectedFields : []).filter((field) => !visibleFieldIds.has(field.fieldId)).length,
    contextOnly: true,
    humanApprovalRequired: true,
    ...noSideEffects()
  });
}

module.exports = {
  UNIVERSAL_PROSPECT_CONTEXT_STATUS,
  PROSPECT_CONTEXT_CONSUMERS,
  TRUSTED_SOURCE_OWNERS,
  FIELD_DEFINITIONS,
  PROHIBITED_USES,
  buildUniversalGovernedProspectContext,
  projectUniversalProspectContext,
  _private: { clone, deepFreeze, unique, safeFieldIdentifiers, normalizeDescriptor, isApprovedScalar, isOpaqueReference, isPlaceholder, noSideEffects }
};
