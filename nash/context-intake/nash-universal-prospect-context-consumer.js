"use strict";

const {
  PROSPECT_CONTEXT_CONSUMERS,
  projectUniversalProspectContext
} = require("../../advisor-os/sales-pipeline/prospect-context/universal-governed-prospect-context-contract");
const { buildNashProspectContextIntake } = require("./nash-prospect-context-intake");

const NASH_FIELD_MAP = Object.freeze({
  "identity.prospect_reference": "prospectIdentityReference",
  "pipeline.current_stage": "pipelineStageReference",
  "needs.conversation_objective": "conversationObjective",
  "relationship.reference": "relationshipContext",
  "interaction.verified_reference": "verifiedInteractionFacts",
  "appointment.verified_reference": "appointmentContext",
  "needs.declared_concern": "objectionContext",
  "nba.official_reference": "officialNbaReference",
  "product.authority_reference": "productReference",
  "quote.authority_reference": "quoteReference"
});

function fieldToNashEntry(field) {
  return {
    value: field.value,
    sourceOwner: field.sourceOwner,
    evidenceRefs: [field.evidenceReference],
    verificationStatus: field.verificationStatus,
    freshness: field.freshness
  };
}

function buildNashContextInputFromUniversal(universalContext) {
  const projection = projectUniversalProspectContext(
    universalContext,
    PROSPECT_CONTEXT_CONSUMERS.CONVERSATION_CONTEXT
  );
  const input = {
    packetType: "NASH_PROSPECT_CONTEXT_INTAKE_PACKET_V1",
    requestedUse: projection.status === "BLOCKED_CONTEXT"
      ? "BLOCKED_UNIVERSAL_CONTEXT"
      : "PROSPECT_CONVERSATION_CONTEXT_INTAKE",
    evidenceReferences: projection.evidenceReferences.map((reference) => ({
      evidenceId: reference.evidenceId,
      sourceOwner: reference.sourceOwner,
      observedAt: reference.observedAt
    })),
    sourceOwners: [...projection.sourceOwners],
    freshness: {
      status: projection.status === "SUCCESS" ? "CURRENT" : "UNKNOWN"
    },
    unknownFacts: [...projection.unknownFields],
    missingContext: [...projection.missingFields],
    safeLanguageGuardrails: [
      "NO_INVENTED_FACTS",
      "NO_INVENTED_INTENT",
      "NO_PRESSURE_OR_MANIPULATION",
      "HUMAN_APPROVAL_REQUIRED"
    ],
    forbiddenClaims: [...projection.prohibitedUses],
    candidateInterpretations: [],
    humanApprovalRequired: true,
    contextOnly: true
  };

  for (const field of projection.projectedFields) {
    const nashField = NASH_FIELD_MAP[field.fieldId];
    if (!nashField) continue;
    const entry = fieldToNashEntry(field);
    if (input[nashField] === undefined) input[nashField] = entry;
    else input[nashField] = Array.isArray(input[nashField]) ? [...input[nashField], entry] : [input[nashField], entry];
  }

  return Object.freeze({ projection, input: Object.freeze(input) });
}

function consumeUniversalProspectContextForNash(universalContext) {
  const prepared = buildNashContextInputFromUniversal(universalContext);
  return Object.freeze({
    consumer: "NASH_CONVERSATION_CONTEXT",
    universalAuthorityTransferred: false,
    rawPipelineRecordReceived: false,
    projection: prepared.projection,
    intake: buildNashProspectContextIntake(prepared.input),
    contextOnly: true,
    runtimeWired: false
  });
}

module.exports = {
  NASH_FIELD_MAP,
  buildNashContextInputFromUniversal,
  consumeUniversalProspectContextForNash
};
