"use strict";

const {
  buildUniversalGovernedProspectContext,
  _private
} = require("./universal-governed-prospect-context-contract");

const { clone, deepFreeze, isPlaceholder } = _private;

const PIPELINE_FIELD_MAP = Object.freeze({
  id: "identity.prospect_reference",
  fullName: "identity.display_name_reference",
  source: "identity.source_channel_reference",
  status: "pipeline.current_stage"
});

const RAW_FREE_TEXT_FIELDS = Object.freeze([
  "initialContext",
  "notes",
  "internalNotes",
  "description",
  "comments",
  "conversationHistory",
  "transcript",
  "productsOfInterest",
  "referrerName",
  "referrerRelationship",
  "nextActionType"
]);

const SENSITIVE_FIELDS = Object.freeze([
  "phone",
  "whatsapp",
  "email",
  "dateOfBirth",
  "age",
  "maritalStatus",
  "dependents",
  "occupation",
  "estimatedIncome",
  "income",
  "health",
  "medicalInformation",
  "financialNeeds",
  "familyContext"
]);

const GOVERNED_REFERENCE_FIELDS = Object.freeze([
  "needs.conversation_objective",
  "needs.quote_objective",
  "needs.declared_goal",
  "needs.declared_concern",
  "quote.verified_constraint",
  "product.verified_constraint",
  "relationship.reference",
  "interaction.verified_reference",
  "appointment.verified_reference",
  "nba.official_reference",
  "product.authority_reference",
  "quote.authority_reference"
]);

function pipelineEvidence(record, field, observedAt) {
  return {
    evidenceId: `PIPELINE:${record.id}:${field}:${observedAt}`,
    sourceOwner: "PIPELINE",
    sourceRecordReference: String(record.id),
    observedAt
  };
}

function pipelineCandidate(record, sourceField, fieldId, evidence, approved) {
  if (!approved || isPlaceholder(record[sourceField])) return null;
  return {
    fieldId,
    value: record[sourceField],
    sourceOwner: "PIPELINE",
    sourceRecordReference: String(record.id),
    evidenceReference: evidence.evidenceId,
    verificationStatus: "VERIFIED",
    freshness: { status: "CURRENT", observedAt: evidence.observedAt }
  };
}

function quarantineDescriptor(record, field, reason) {
  return {
    fieldId: field,
    reason,
    sourceOwner: "PIPELINE",
    sourceRecordReference: record?.id ? String(record.id) : null,
    rawValueRetained: false
  };
}

function buildPipelineUniversalProspectContext(input = {}) {
  const source = input && typeof input === "object" && !Array.isArray(input) ? clone(input) : {};
  const record = source.pipelineRecord && typeof source.pipelineRecord === "object" && !Array.isArray(source.pipelineRecord)
    ? clone(source.pipelineRecord)
    : {};
  const approvedDisplayName = source.approvedDisplayName === true;
  const observedAt = typeof record.updatedAt === "string" && !Number.isNaN(Date.parse(record.updatedAt))
    ? record.updatedAt
    : typeof record.createdAt === "string" && !Number.isNaN(Date.parse(record.createdAt))
      ? record.createdAt
      : null;
  const evidenceReferences = [];
  const candidateFields = [];
  const excludedFields = [];
  const quarantinedFields = [];
  const unknownFields = [];
  const missingFields = [];

  if (!record.id) missingFields.push("identity.prospect_reference");
  if (!record.status) missingFields.push("pipeline.current_stage");
  if (!observedAt) missingFields.push("pipeline.freshness");

  if (record.id && observedAt) {
    for (const [sourceField, fieldId] of Object.entries(PIPELINE_FIELD_MAP)) {
      if (!Object.prototype.hasOwnProperty.call(record, sourceField)) continue;
      const evidence = pipelineEvidence(record, sourceField, observedAt);
      evidenceReferences.push(evidence);
      const approved = sourceField !== "fullName" || approvedDisplayName;
      const candidate = pipelineCandidate(record, sourceField, fieldId, evidence, approved);
      if (candidate) candidateFields.push(candidate);
      else if (sourceField === "fullName" && record.fullName) quarantinedFields.push(quarantineDescriptor(record, sourceField, "DISPLAY_NAME_NOT_APPROVED"));
      else unknownFields.push(fieldId);
    }
  }

  for (const field of RAW_FREE_TEXT_FIELDS) {
    if (record[field] !== undefined && record[field] !== null && String(record[field]).trim()) {
      quarantinedFields.push(quarantineDescriptor(record, field, "RAW_FREE_TEXT_NOT_PROJECTED"));
    }
  }
  for (const field of SENSITIVE_FIELDS) {
    if (record[field] !== undefined && record[field] !== null && String(record[field]).trim()) {
      excludedFields.push(quarantineDescriptor(record, field, "SENSITIVE_OR_ROUTING_FIELD_EXCLUDED"));
    }
  }

  for (const reference of Array.isArray(source.governedReferences) ? source.governedReferences : []) {
    if (!reference || !GOVERNED_REFERENCE_FIELDS.includes(reference.fieldId)) {
      excludedFields.push({ fieldId: typeof reference?.fieldId === "string" ? reference.fieldId : "UNKNOWN_FIELD", reason: "UNSUPPORTED_GOVERNED_REFERENCE", rawValueRetained: false });
      continue;
    }
    const evidence = reference.evidence && typeof reference.evidence === "object" ? clone(reference.evidence) : null;
    if (evidence) evidenceReferences.push(evidence);
    candidateFields.push({
      fieldId: reference.fieldId,
      value: clone(reference.value),
      sourceOwner: reference.sourceOwner,
      sourceRecordReference: reference.sourceRecordReference,
      evidenceReference: evidence?.evidenceId,
      verificationStatus: reference.verificationStatus,
      freshness: clone(reference.freshness),
      sensitivityClassification: reference.sensitivityClassification
    });
  }

  const context = buildUniversalGovernedProspectContext({
    candidateFields,
    evidenceReferences,
    excludedFields,
    quarantinedFields,
    unknownFields,
    missingFields
  });

  return deepFreeze({
    adapter: "PIPELINE_UNIVERSAL_GOVERNED_PROSPECT_CONTEXT_ADAPTER",
    version: "1.0",
    sourceAuthority: "PIPELINE",
    universalContextAuthorityTransferred: false,
    inputRecordForwarded: false,
    context,
    mutationPerformed: false,
    persistencePerformed: false,
    providerInvoked: false,
    quoteCalculated: false,
    productRecommended: false,
    presentationCreated: false,
    runtimeWired: false,
    contextOnly: true,
    humanApprovalRequired: true
  });
}

module.exports = {
  PIPELINE_FIELD_MAP,
  RAW_FREE_TEXT_FIELDS,
  SENSITIVE_FIELDS,
  GOVERNED_REFERENCE_FIELDS,
  buildPipelineUniversalProspectContext
};
