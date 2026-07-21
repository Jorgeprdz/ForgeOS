"use strict";

const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");
const {
  PROSPECT_CONTEXT_CONSUMERS,
  buildUniversalGovernedProspectContext,
  projectUniversalProspectContext
} = require("../advisor-os/sales-pipeline/prospect-context/universal-governed-prospect-context-contract");
const {
  buildPipelineUniversalProspectContext
} = require("../advisor-os/sales-pipeline/prospect-context/pipeline-universal-prospect-context-adapter");

const tests = [];
function test(name, fn) { tests.push({ name, fn }); }

const NOW = "2026-07-20T12:00:00.000Z";

function pipelineRecord(extra = {}) {
  return {
    id: "prospect-1",
    fullName: "Fixture Prospect",
    source: "Controlled fixture",
    status: "referred_new",
    createdAt: NOW,
    updatedAt: NOW,
    ...extra
  };
}

function governedReference(fieldId, value, sourceOwner, extra = {}) {
  const id = `evidence-${fieldId}`;
  return {
    fieldId,
    value,
    sourceOwner,
    sourceRecordReference: `${sourceOwner.toLowerCase()}-record-1`,
    evidence: { evidenceId: id, sourceOwner, sourceRecordReference: `${sourceOwner.toLowerCase()}-record-1`, observedAt: NOW },
    verificationStatus: "VERIFIED",
    freshness: { status: "CURRENT", observedAt: NOW },
    ...extra
  };
}

function richAdapter() {
  return buildPipelineUniversalProspectContext({
    pipelineRecord: pipelineRecord({
      initialContext: "raw private narrative",
      notes: "internal note",
      estimatedIncome: 100,
      productsOfInterest: "free form product",
      phone: "+525500000000"
    }),
    approvedDisplayName: true,
    governedReferences: [
      governedReference("needs.conversation_objective", "FOLLOW_UP", "ADVISOR_DECLARATION"),
      governedReference("needs.quote_objective", "REQUEST_QUOTE_PREPARATION", "PROSPECT_DECLARATION"),
      governedReference("needs.declared_goal", "DECLARED_GOAL_REFERENCE", "PROSPECT_DECLARATION"),
      governedReference("needs.declared_concern", "DECLARED_CONCERN_REFERENCE", "PROSPECT_DECLARATION"),
      governedReference("quote.verified_constraint", "CONSTRAINT_REFERENCE", "QUOTE_AUTHORITY"),
      governedReference("product.verified_constraint", "PRODUCT_CONSTRAINT_REFERENCE", "PRODUCT_INTELLIGENCE"),
      governedReference("relationship.reference", "relationship-ref-1", "RELATIONSHIP_INTELLIGENCE"),
      governedReference("interaction.verified_reference", "interaction-ref-1", "PIPELINE"),
      governedReference("appointment.verified_reference", "appointment-ref-1", "APPOINTMENT_AUTHORITY"),
      governedReference("nba.official_reference", "nba-ref-1", "NBA_AUTHORITY"),
      governedReference("product.authority_reference", "product-ref-1", "PRODUCT_INTELLIGENCE"),
      governedReference("quote.authority_reference", "quote-ref-1", "QUOTE_AUTHORITY")
    ]
  });
}

test("valid minimal universal context preserves Pipeline authority", () => {
  const result = buildPipelineUniversalProspectContext({ pipelineRecord: pipelineRecord() });
  assert.equal(result.context.status, "SUCCESS");
  assert.equal(result.sourceAuthority, "PIPELINE");
  assert.equal(result.universalContextAuthorityTransferred, false);
  assert.equal(result.inputRecordForwarded, false);
});

test("valid rich universal context models governed reference families", () => {
  const result = richAdapter();
  assert.equal(result.context.status, "SUCCESS");
  assert(result.context.projectedFields.length >= 15);
  assert.deepEqual([...result.context.availableConsumerProjections].sort(), Object.values(PROSPECT_CONTEXT_CONSUMERS).sort());
});

test("consumer projections are allowlisted and isolated", () => {
  const universal = richAdapter().context;
  const conversation = projectUniversalProspectContext(universal, "CONVERSATION_CONTEXT");
  const quote = projectUniversalProspectContext(universal, "QUOTE_CONTEXT");
  const product = projectUniversalProspectContext(universal, "PRODUCT_CONTEXT");
  const presentation = projectUniversalProspectContext(universal, "PRESENTATION_CONTEXT_REFERENCE");
  assert(conversation.projectedFields.some((field) => field.fieldId === "nba.official_reference"));
  assert(!quote.projectedFields.some((field) => field.fieldId === "nba.official_reference"));
  assert(quote.projectedFields.some((field) => field.fieldId === "quote.verified_constraint"));
  assert(!product.projectedFields.some((field) => field.fieldId === "quote.verified_constraint"));
  assert(product.projectedFields.some((field) => field.fieldId === "product.verified_constraint"));
  assert(presentation.projectedFields.some((field) => field.fieldId === "quote.authority_reference"));
  assert(!presentation.projectedFields.some((field) => field.fieldId === "needs.quote_objective"));
});

test("same source fact is projected without authority duplication", () => {
  const universal = richAdapter().context;
  const fact = universal.projectedFields.find((field) => field.fieldId === "needs.declared_goal");
  for (const consumer of fact.allowedConsumers) {
    const projected = projectUniversalProspectContext(universal, consumer).projectedFields.find((field) => field.fieldId === fact.fieldId);
    assert.equal(projected.sourceOwner, fact.sourceOwner);
    assert.equal(projected.evidenceReference, fact.evidenceReference);
    assert.equal(projected.sourceRecordReference, fact.sourceRecordReference);
  }
});

test("missing identity or Pipeline stage remains missing", () => {
  assert.equal(buildPipelineUniversalProspectContext({ pipelineRecord: pipelineRecord({ id: "" }) }).context.status, "INVALID_CONTEXT");
  assert.equal(buildPipelineUniversalProspectContext({ pipelineRecord: pipelineRecord({ status: "" }) }).context.status, "INVALID_CONTEXT");
});

test("unknown placeholders and default zero never become trusted facts", () => {
  const result = buildPipelineUniversalProspectContext({ pipelineRecord: pipelineRecord({ source: "UNKNOWN" }), governedReferences: [governedReference("needs.declared_goal", 0, "PROSPECT_DECLARATION")] });
  assert(!result.context.projectedFields.some((field) => field.value === "UNKNOWN" || field.value === 0));
  assert(result.context.excludedFields.some((field) => field.reason === "PLACEHOLDER_OR_DEFAULT_VALUE"));
});

test("unsupported fields are excluded without value forwarding", () => {
  const result = buildPipelineUniversalProspectContext({ pipelineRecord: pipelineRecord(), governedReferences: [governedReference("personality.inference", "eager", "ADVISOR_DECLARATION")] });
  assert(result.context.excludedFields.some((field) => field.fieldId === "personality.inference"));
  assert(!JSON.stringify(result).includes("eager"));
});

test("raw notes are quarantined and sensitive values excluded", () => {
  const result = richAdapter();
  const serialized = JSON.stringify(result);
  assert(result.context.quarantinedFields.some((field) => field.fieldId === "initialContext"));
  assert(result.context.excludedFields.some((field) => field.fieldId === "estimatedIncome"));
  assert(!serialized.includes("raw private narrative"));
  assert(!serialized.includes("internal note"));
  assert(!serialized.includes("+525500000000"));
  assert(!serialized.includes("free form product"));
  for (const consumer of Object.values(PROSPECT_CONTEXT_CONSUMERS)) {
    const projection = projectUniversalProspectContext(result.context, consumer);
    assert(projection.quarantinedFields.some((field) => field.fieldId === "initialContext" && field.rawValueRetained === false));
    assert(projection.excludedFields.some((field) => field.fieldId === "estimatedIncome" && field.rawValueRetained === false));
  }
});

test("stale evidence and invalid source owner cannot become projected facts", () => {
  const stale = governedReference("appointment.verified_reference", "appointment-ref", "APPOINTMENT_AUTHORITY", { freshness: { status: "STALE", observedAt: NOW } });
  const invalid = governedReference("relationship.reference", "relationship-ref", "NASH");
  const result = buildPipelineUniversalProspectContext({ pipelineRecord: pipelineRecord(), governedReferences: [stale, invalid] });
  assert(result.context.staleFields.some((field) => field.fieldId === "appointment.verified_reference"));
  assert(result.context.blockedFields.some((field) => field.reason === "INVALID_SOURCE_OWNER"));
  assert(!result.context.projectedFields.some((field) => ["appointment.verified_reference", "relationship.reference"].includes(field.fieldId)));
});

test("field ownership and evidence ownership cannot be reassigned", () => {
  const wrongFieldOwner = governedReference("quote.authority_reference", "quote-ref", "PIPELINE");
  const mismatchedEvidence = governedReference("product.authority_reference", "product-ref", "PRODUCT_INTELLIGENCE");
  mismatchedEvidence.evidence.sourceOwner = "PIPELINE";
  const unsafeReference = governedReference("nba.official_reference", "nba-ref", "NBA_AUTHORITY", { sourceRecordReference: "private note with spaces" });
  const result = buildPipelineUniversalProspectContext({ pipelineRecord: pipelineRecord(), governedReferences: [wrongFieldOwner, mismatchedEvidence, unsafeReference] });
  assert(result.context.blockedFields.some((field) => field.reason === "SOURCE_OWNER_NOT_AUTHORIZED_FOR_FIELD"));
  assert(result.context.blockedFields.some((field) => field.reason === "EVIDENCE_OWNER_MISMATCH"));
  assert(result.context.blockedFields.some((field) => field.reason === "MISSING_SOURCE_RECORD_REFERENCE"));
  assert(!JSON.stringify(result).includes("private note with spaces"));
});

test("verified appointment and authority references remain references only", () => {
  const universal = richAdapter().context;
  assert(universal.projectedFields.some((field) => field.fieldId === "appointment.verified_reference"));
  assert(universal.projectedFields.some((field) => field.fieldId === "nba.official_reference"));
  assert(universal.projectedFields.some((field) => field.fieldId === "product.authority_reference"));
  assert(universal.projectedFields.some((field) => field.fieldId === "quote.authority_reference"));
  assert.equal(universal.nbaCreatedOrExecuted, false);
  assert.equal(universal.productRecommended, false);
  assert.equal(universal.quoteCalculated, false);
});

test("output is immutable deterministic and side-effect free", () => {
  const input = { pipelineRecord: pipelineRecord(), approvedDisplayName: true };
  const before = JSON.stringify(input);
  const first = buildPipelineUniversalProspectContext(input);
  const second = buildPipelineUniversalProspectContext(input);
  assert.deepEqual(first, second);
  assert(Object.isFrozen(first));
  assert(Object.isFrozen(first.context.projectedFields));
  assert.throws(() => { first.context.projectedFields.push({}); }, TypeError);
  assert.equal(JSON.stringify(input), before);
  for (const flag of ["mutationPerformed", "persistencePerformed", "providerInvoked", "quoteCalculated", "productRecommended", "presentationCreated", "runtimeWired"]) assert.equal(first[flag], false);
  for (const flag of ["databaseAccessed", "filesystemAccessed", "networkAccessed", "providerInvoked", "quoteCalculated", "productRecommended", "presentationCreated", "runtimeWired"]) assert.equal(first.context[flag], false);
});

test("modules contain no productive runtime or side-effect dependencies", () => {
  const files = [
    "../advisor-os/sales-pipeline/prospect-context/universal-governed-prospect-context-contract.js",
    "../advisor-os/sales-pipeline/prospect-context/pipeline-universal-prospect-context-adapter.js"
  ];
  const source = files.map((file) => fs.readFileSync(path.join(__dirname, file), "utf8")).join("\n");
  for (const token of ["productive-prospect-ui", "productive-prospect-bootstrap", "supabase", "gemini", "fetch(", "writeFile", "localStorage", "window.open", ".click(", "setTimeout", "setInterval"]) {
    assert(!source.includes(token), `forbidden dependency or side effect: ${token}`);
  }
});

let passed = 0;
for (const item of tests) {
  try { item.fn(); passed += 1; console.log(`PASS ${item.name}`); }
  catch (error) { console.error(`FAIL ${item.name}`); console.error(error.stack || error.message); process.exitCode = 1; }
}
console.log(`NFAST-03 universal adapter: ${passed}/${tests.length} passed`);
