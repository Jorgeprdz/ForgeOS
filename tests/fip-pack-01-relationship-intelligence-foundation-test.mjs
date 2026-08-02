import assert from "node:assert/strict";
import { createFipPack01Foundation, FipPack01ContractError } from "../platform/relationship-intelligence/fip-pack-01-foundation-contract.js";
import { buildRelationshipFoundationReadModel, deriveRelationshipFoundationSignals } from "../advisor-os/person-workspace/fip-pack-01-relationship-foundation-service.js";

const evidence = [{ reference: "evt-1", authority: "CRS_08_UNIFIED_PERSON_TIMELINE", observedAt: "2026-08-01T10:00:00Z", freshness: "CURRENT" }];

const foundation = buildRelationshipFoundationReadModel({
  advisorReference: "advisor-jorge",
  personReference: "person-ana",
  generatedAt: "2026-08-02T12:00:00Z",
  currentCommercialState: "QUOTE_PRESENTED",
  timeline: [{ type: "MEETING", occurredAt: "2026-08-01T10:00:00Z" }],
  commitments: [{ reference: "commit-1", owner: "ADVISOR", description: "Dar seguimiento", dueAt: "2026-08-01T12:00:00Z", state: "OPEN", evidence }],
  healthState: "WAITING_ON_ADVISOR",
  healthReason: "Existe un compromiso vencido.",
  healthConfidence: 0.9,
  healthEvidence: evidence,
  objections: [{ state: "OBSERVED", label: "Liquidez", confidence: 0.8, evidence }],
  lossRisks: [{ state: "INFERRED", label: "Demora de seguimiento", confidence: 0.7, evidence }],
  scoreDimensions: {
    RECENCY: { state: "OBSERVED", label: "Reciente", confidence: 0.9, evidence },
    RESPONSIVENESS: { state: "UNKNOWN", limitations: ["NO_RESPONSE_DATA"] },
    COMMITMENT: { state: "OBSERVED", confidence: 0.5, evidence },
  },
  relations: [{ reference: "rel-1", relatedPersonReference: "person-pareja", type: "DECISION_MAKER", state: "OBSERVED", evidence }],
});

assert.equal(foundation.contractVersion, "FIP-PACK-01-001");
assert.equal(foundation.commitmentSummary.overdue, 1);
assert.equal(foundation.health.state, "WAITING_ON_ADVISOR");
assert.equal(foundation.relationshipMap.count, 1);
assert.equal(foundation.boundaries.humanApprovalRequired, true);
assert.equal(foundation.boundaries.automaticMessage, false);
assert.equal(foundation.score.dimensions.RESPONSIVENESS.state, "UNKNOWN");
assert.notEqual(foundation.score.value, 0);
assert.equal(Object.isFrozen(foundation), true);

const signals = deriveRelationshipFoundationSignals({
  generatedAt: "2026-08-02T12:00:00Z",
  lastMeaningfulInteractionAt: "2026-07-15T12:00:00Z",
  commitments: [],
});
assert.equal(signals.healthState, "COOLING");

assert.throws(() => createFipPack01Foundation({
  advisorReference: "advisor-jorge",
  personReference: "person-ana",
  automaticTask: true,
}), error => error instanceof FipPack01ContractError && error.code === "FIP01_FORBIDDEN_FIELD");

assert.throws(() => createFipPack01Foundation({
  advisorReference: "advisor-jorge",
  personReference: "person-ana",
  relations: [{ reference: "self", relatedPersonReference: "person-ana", type: "OTHER" }],
}), error => error instanceof FipPack01ContractError && error.code === "FIP01_SELF_RELATION_FORBIDDEN");

console.log("FIP_PACK_01_RELATIONSHIP_INTELLIGENCE_FOUNDATION=PASS");
