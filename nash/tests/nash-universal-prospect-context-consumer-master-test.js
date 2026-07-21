"use strict";

const assert = require("node:assert/strict");
const {
  buildPipelineUniversalProspectContext
} = require("../../advisor-os/sales-pipeline/prospect-context/pipeline-universal-prospect-context-adapter");
const {
  consumeUniversalProspectContextForNash
} = require("../context-intake/nash-universal-prospect-context-consumer");

const NOW = "2026-07-20T12:00:00.000Z";
function record(extra = {}) { return { id: "prospect-1", fullName: "Fixture", source: "Fixture", status: "contacted", createdAt: NOW, updatedAt: NOW, ...extra }; }
function objective(status = "CURRENT") {
  return {
    fieldId: "needs.conversation_objective",
    value: "FOLLOW_UP",
    sourceOwner: "ADVISOR_DECLARATION",
    sourceRecordReference: "advisor-declaration-1",
    evidence: { evidenceId: "objective-evidence", sourceOwner: "ADVISOR_DECLARATION", sourceRecordReference: "advisor-declaration-1", observedAt: NOW },
    verificationStatus: "VERIFIED",
    freshness: { status, observedAt: NOW }
  };
}

const successfulUniversal = buildPipelineUniversalProspectContext({ pipelineRecord: record(), governedReferences: [objective()] });
const successful = consumeUniversalProspectContextForNash(successfulUniversal.context);
assert.equal(successful.intake.status, "SUCCESS");
assert.equal(successful.universalAuthorityTransferred, false);
assert.equal(successful.rawPipelineRecordReceived, false);
assert(successful.projection.projectedFields.every((field) => field.allowedConsumers.includes("CONVERSATION_CONTEXT")));
assert(!successful.projection.projectedFields.some((field) => field.fieldId === "needs.quote_objective"));
assert.equal(successful.intake.message, null);
assert.equal(successful.intake.draft, null);
assert.equal(successful.intake.providerResult, null);

const invalidUniversal = buildPipelineUniversalProspectContext({ pipelineRecord: record(), governedReferences: [] });
const invalid = consumeUniversalProspectContextForNash(invalidUniversal.context);
assert.equal(invalid.intake.status, "INVALID_CONTEXT");
assert(invalid.intake.missingContext.includes("conversationObjective"));

const blockedUniversal = buildPipelineUniversalProspectContext({
  pipelineRecord: record(),
  governedReferences: [objective(), { ...objective(), fieldId: "relationship.reference", sourceOwner: "NASH" }]
});
const blocked = consumeUniversalProspectContextForNash(blockedUniversal.context);
assert.equal(blockedUniversal.context.status, "BLOCKED_CONTEXT");
assert.equal(blocked.intake.status, "BLOCKED_CONTEXT");

console.log("PASS NFAST-03 universal projections produce NFAST-02 SUCCESS, INVALID_CONTEXT and BLOCKED_CONTEXT");
