import test from "node:test";
import assert from "node:assert/strict";
import {
  createRelationshipIntelligenceComposition,
  DOMAIN_IDS,
  DOMAIN_AUTHORITIES,
} from "../platform/shared-commercial-model/crs-10-relationship-intelligence-contract.js";

function item(id, overrides = {}) {
  const advisorScope = id === "PRODUCTIVITY_PROOF";
  return {
    reference: `${id.toLowerCase()}-1`,
    label: id,
    summary: "Señal explicable y atribuida.",
    state: id === "PRODUCTIVITY_PROOF" ? "OBSERVED" : "REVIEW_REQUIRED",
    authority: DOMAIN_AUTHORITIES[id],
    scope: advisorScope ? "ADVISOR" : "PERSON",
    personReference: advisorScope ? null : "person-1",
    effectiveDate: "2026-08-01",
    reviewRequired: !advisorScope,
    uncertainty: "No constituye prioridad final.",
    smallestUsefulAction: "Revisar antes de actuar.",
    evidenceCount: 2,
    deepLink: `?nav=cartera&intelligence=${id.toLowerCase()}`,
    ...overrides,
  };
}

function input() {
  return {
    advisorReference: "advisor-1",
    personReference: "person-1",
    asOfDate: "2026-08-01",
    generatedAt: "2026-08-02T05:00:00.000Z",
    domains: Object.fromEntries(DOMAIN_IDS.map(id => [id, {
      id,
      status: "AVAILABLE",
      items: [item(id)],
    }])),
  };
}

test("composes all six existing Cartera intelligence domains without a new score engine", () => {
  const composition = createRelationshipIntelligenceComposition(input());
  assert.deepEqual(Object.keys(composition.domains), DOMAIN_IDS);
  assert.equal(composition.itemCount, 6);
  assert.equal(composition.reviewCount, 5);
  assert.equal(composition.readOnly, true);
  assert.equal(composition.boundaries.existingCarteraIntelligenceReused, true);
  assert.equal(composition.boundaries.secondScoreEngine, false);
  assert.equal(composition.boundaries.automaticContact, false);
  assert.equal(composition.boundaries.localMutationControls, false);
  assert.equal(composition.domains.PRODUCTIVITY_PROOF.scope, "ADVISOR");
  assert.ok(Object.isFrozen(composition));
});

test("preserves empty, degraded and unavailable source truth", () => {
  const candidate = input();
  candidate.domains.FUTURE_RADAR = { id: "FUTURE_RADAR", status: "EMPTY", items: [] };
  candidate.domains.ECONOMIC_CONNECTION = {
    id: "ECONOMIC_CONNECTION",
    status: "UNAVAILABLE",
    reason: "SOURCE_READER_NOT_CONNECTED",
    items: [],
  };
  candidate.domains.RELATIONSHIP_CAPITAL = {
    id: "RELATIONSHIP_CAPITAL",
    status: "DEGRADED",
    reason: "SOURCE_READ_FAILED",
    items: [],
  };
  const composition = createRelationshipIntelligenceComposition(candidate);
  assert.equal(composition.domains.FUTURE_RADAR.status, "EMPTY");
  assert.equal(composition.domains.ECONOMIC_CONNECTION.status, "UNAVAILABLE");
  assert.equal(composition.domains.RELATIONSHIP_CAPITAL.status, "DEGRADED");
});

test("rejects cross-person intelligence and advisor evidence attributed to a person", () => {
  const crossPerson = input();
  crossPerson.domains.RELATIONSHIP_GROWTH.items[0].personReference = "person-2";
  assert.throws(
    () => createRelationshipIntelligenceComposition(crossPerson),
    error => error.code === "CRS10_CROSS_PERSON_ITEM",
  );

  const advisorMisattribution = input();
  advisorMisattribution.domains.PRODUCTIVITY_PROOF.items[0].personReference = "person-1";
  assert.throws(
    () => createRelationshipIntelligenceComposition(advisorMisattribution),
    error => error.code === "CRS10_ADVISOR_ITEM_PERSON_FORBIDDEN",
  );
});

test("rejects opaque scores, human value and external deep links", () => {
  const score = input();
  score.domains.RELATIONSHIP_CAPITAL.items[0].relationshipScore = 99;
  assert.throws(
    () => createRelationshipIntelligenceComposition(score),
    error => error.code === "CRS10_FORBIDDEN_INTELLIGENCE_FIELD",
  );

  const external = input();
  external.domains.FUTURE_RADAR.items[0].deepLink = "https://example.com";
  assert.throws(
    () => createRelationshipIntelligenceComposition(external),
    error => error.code === "CRS10_DEEP_LINK_INVALID",
  );
});

test("AVAILABLE requires items and EMPTY cannot conceal items", () => {
  const availableEmpty = input();
  availableEmpty.domains.FUTURE_RADAR.items = [];
  assert.throws(
    () => createRelationshipIntelligenceComposition(availableEmpty),
    error => error.code === "CRS10_AVAILABLE_DOMAIN_EMPTY",
  );

  const emptyWithItem = input();
  emptyWithItem.domains.FUTURE_RADAR.status = "EMPTY";
  assert.throws(
    () => createRelationshipIntelligenceComposition(emptyWithItem),
    error => error.code === "CRS10_EMPTY_DOMAIN_WITH_ITEMS",
  );
});
