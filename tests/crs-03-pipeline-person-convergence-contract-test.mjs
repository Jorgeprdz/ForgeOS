import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const contract = require("../platform/shared-commercial-model/crs-03-pipeline-person-convergence-contract.js");
const links = require("../platform/shared-commercial-model/crs-02-domain-link-envelope-contract.js");

const prospect = Object.freeze({
  prospectReference: "prospect:001",
  advisorReference: "advisor:001",
  displayName: "Juan Pérez",
  stage: "contacted",
  source: "Referido",
  createdAt: "2026-08-01T20:00:00.000Z",
  updatedAt: "2026-08-01T20:05:00.000Z",
  archived: false,
});

function linkedDomainLink(correlationId = null) {
  return links.createDomainLinkEnvelope({
    personReference: "person:001",
    relationshipReference: links.deriveRelationshipReference({
      advisorReference: "advisor:001",
      personReference: "person:001",
    }),
    correlationId,
    domain: "PIPELINE",
    recordType: "PROSPECT",
    recordReference: "prospect:001",
    authority: "PIPELINE_PROSPECT_AUTHORITY",
    sourceEventReference: "pipeline-prospect:prospect:001:v1",
    effectiveAt: prospect.createdAt,
    recordedAt: prospect.updatedAt,
    privacyClassification: "PRIVATE",
    idempotencyKey: "crs03-prospect:prospect:001:v1",
    correctionOf: null,
  });
}

function missingDomainLink() {
  return links.createMissingDomainLink({
    domain: "PIPELINE",
    recordType: "PROSPECT",
    recordReference: "prospect:001",
    authority: "PIPELINE_PROSPECT_AUTHORITY",
    sourceEventReference: "pipeline-prospect:prospect:001:v1",
    correlationId: null,
    observedAt: prospect.updatedAt,
    privacyClassification: "PRIVATE",
    missingReason: "PERSON_UNRESOLVED",
    sourceIdentityReference: "prospect:001",
    idempotencyKey: "crs03-prospect:prospect:001:v1",
  });
}

function linkedInput(overrides = {}) {
  return {
    prospect,
    identity: {
      state: "LINKED",
      personReference: "person:001",
      sourceIdentityLinkReference: "identity-link:001",
      identityDecisionReference: "identity-decision:001",
      matchStatus: "LINK_CONFIRMED",
      reason: null,
    },
    domainLink: linkedDomainLink(),
    opportunityAuthorityState: "NOT_PRODUCTIVE",
    stageAuthority: "PIPELINE_STAGE_RPC",
    externalMilestones: {
      applicationSigned: "PROJECTED_ONLY",
      policyIssued: "PROJECTED_ONLY",
    },
    ...overrides,
  };
}

test("creates an immutable linked Pipeline person convergence snapshot", () => {
  const snapshot = contract.createPipelinePersonConvergence(linkedInput());
  assert.equal(snapshot.contractType, contract.CONTRACT_TYPE);
  assert.equal(snapshot.identity.state, "LINKED");
  assert.equal(snapshot.identity.personReference, "person:001");
  assert.equal(snapshot.domainLink.domain, "PIPELINE");
  assert.equal(snapshot.stageAuthority, "PIPELINE_STAGE_RPC");
  assert.equal(Object.isFrozen(snapshot), true);
  assert.equal(Object.isFrozen(snapshot.identity), true);
});

test("creates an explicit unresolved snapshot without a partial person", () => {
  const snapshot = contract.createPipelinePersonConvergence({
    ...linkedInput(),
    identity: {
      state: "UNRESOLVED",
      personReference: null,
      sourceIdentityLinkReference: null,
      identityDecisionReference: null,
      matchStatus: null,
      reason: "PERSON_UNRESOLVED",
    },
    domainLink: missingDomainLink(),
  });
  assert.equal(snapshot.identity.state, "UNRESOLVED");
  assert.equal(snapshot.identity.personReference, null);
  assert.equal(snapshot.domainLink.contractType, links.MISSING_LINK_TYPE);
});

test("linked identity requires person, source link and governed decision", () => {
  assert.throws(
    () => contract.createPipelinePersonConvergence({
      ...linkedInput(),
      identity: { ...linkedInput().identity, identityDecisionReference: null },
    }),
    error => error.code === "CRS03_LINKED_IDENTITY_INCOMPLETE",
  );
});

test("unresolved identity cannot transport a partial canonical link", () => {
  assert.throws(
    () => contract.createPipelinePersonConvergence({
      ...linkedInput(),
      identity: {
        state: "UNRESOLVED",
        personReference: "person:001",
        sourceIdentityLinkReference: null,
        identityDecisionReference: null,
        matchStatus: null,
        reason: "PERSON_UNRESOLVED",
      },
      domainLink: missingDomainLink(),
    }),
    error => error.code === "CRS03_UNRESOLVED_IDENTITY_CANNOT_CARRY_LINK",
  );
});

test("Pipeline convergence rejects a link for another Prospect", () => {
  const other = links.createDomainLinkEnvelope({
    personReference: "person:001",
    relationshipReference: links.deriveRelationshipReference({
      advisorReference: "advisor:001",
      personReference: "person:001",
    }),
    correlationId: null,
    domain: "PIPELINE",
    recordType: "PROSPECT",
    recordReference: "prospect:other",
    authority: "PIPELINE_PROSPECT_AUTHORITY",
    sourceEventReference: "pipeline-prospect:prospect:other:v1",
    effectiveAt: prospect.createdAt,
    recordedAt: prospect.updatedAt,
    privacyClassification: "PRIVATE",
    idempotencyKey: "crs03-prospect:other:v1",
    correctionOf: null,
  });
  assert.throws(
    () => contract.createPipelinePersonConvergence({ ...linkedInput(), domainLink: other }),
    error => error.code === "CRS03_PIPELINE_DOMAIN_LINK_MISMATCH",
  );
});

test("Pipeline stage authority cannot move outside the existing RPC", () => {
  assert.throws(
    () => contract.createPipelinePersonConvergence({
      ...linkedInput(),
      stageAuthority: "CRS03_STAGE_WRITER",
    }),
    error => error.code === "CRS03_STAGE_AUTHORITY_INVALID",
  );
});

test("Application and Policy milestones remain projections only", () => {
  assert.throws(
    () => contract.createPipelinePersonConvergence({
      ...linkedInput(),
      externalMilestones: {
        applicationSigned: "OWNED",
        policyIssued: "PROJECTED_ONLY",
      },
    }),
    error => error.code === "CRS03_EXTERNAL_MILESTONE_AUTHORITY_VIOLATION",
  );
});

test("one person can carry multiple explicit commercial movements", () => {
  const retirement = links.deriveCorrelationId({
    personReference: "person:001",
    movementReference: "retirement:2026",
  });
  const medical = links.deriveCorrelationId({
    personReference: "person:001",
    movementReference: "medical:2026",
  });
  const first = contract.createPipelinePersonConvergence({
    ...linkedInput(),
    domainLink: linkedDomainLink(retirement),
  });
  const second = contract.createPipelinePersonConvergence({
    ...linkedInput(),
    domainLink: linkedDomainLink(medical),
  });
  assert.equal(first.identity.personReference, second.identity.personReference);
  assert.notEqual(first.domainLink.correlationId, second.domainLink.correlationId);
});

test("Opportunity remains explicitly non-productive in CRS 03", () => {
  const snapshot = contract.createPipelinePersonConvergence(linkedInput());
  assert.equal(snapshot.opportunityAuthorityState, "NOT_PRODUCTIVE");
  assert.equal(snapshot.automaticOpportunityCreation, false);
});

test("digest and contract version are verified on replay", () => {
  const snapshot = contract.createPipelinePersonConvergence(linkedInput());
  assert.throws(
    () => contract.assertPipelinePersonConvergence({
      ...snapshot,
      convergenceDigest: "0".repeat(32),
    }),
    error => error.code === "CRS03_CONVERGENCE_DIGEST_OR_VERSION_MISMATCH",
  );
});
