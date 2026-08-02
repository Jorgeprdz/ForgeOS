import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const contract = require("../platform/shared-commercial-model/crs-11-end-to-end-acceptance-contract.js");

function clone(value) {
  return structuredClone(value);
}

test("acceptance plan locks environments, devices, identities, events and rollback", () => {
  const plan = contract.createAcceptancePlan();
  assert.equal(plan.contractType, contract.PLAN_TYPE);
  assert.deepEqual(plan.devices, ["MOBILE", "TABLET", "DESKTOP"]);
  assert.equal(plan.expectedDomains.length, 5);
  assert.equal(plan.rollbackCriteria.includes("HEAD_MOVED"), true);
  assert.equal(Object.isFrozen(plan), true);
});

test("Juan Pérez completes one-person end-to-end acceptance", () => {
  const plan = contract.createAcceptancePlan();
  const evidence = contract.createJuanPerezEvidence();
  const acceptance = contract.validateJourneyEvidence(plan, evidence);

  assert.equal(acceptance.status, "PASS");
  assert.equal(acceptance.counts.canonicalPeople, 1);
  assert.equal(acceptance.counts.commercialMovements, 2);
  assert.equal(acceptance.counts.quotes, 2);
  assert.equal(acceptance.counts.quoteVersions, 3);
  assert.equal(acceptance.counts.policies, 2);
  assert.equal(acceptance.checks.unifiedTimeline, true);
  assert.equal(acceptance.checks.moduleAuthoritiesPreserved, true);
  assert.equal(acceptance.readOnly, true);
  assert.match(acceptance.acceptanceReference, /^acceptance:[a-f0-9]{32}$/);
});

test("duplicate canonical person fails closed", () => {
  const evidence = clone(contract.createJuanPerezEvidence());
  evidence.person.identityCount = 2;
  assert.throws(
    () => contract.validateJourneyEvidence(contract.createAcceptancePlan(), evidence),
    error => error.code === "CRS11_ONE_PERSON_REQUIRED",
  );
});

test("cross-advisor evidence fails closed", () => {
  const evidence = clone(contract.createJuanPerezEvidence());
  evidence.advisorReference = "advisor:other";
  assert.throws(
    () => contract.validateJourneyEvidence(contract.createAcceptancePlan(), evidence),
    error => error.code === "CRS11_ADVISOR_MISMATCH",
  );
});

test("multiple commercial movements, Quotes and Policies are mandatory", () => {
  for (const [field, code] of [
    ["movements", "CRS11_MULTIPLE_MOVEMENTS_REQUIRED"],
    ["quotes", "CRS11_MULTIPLE_QUOTES_REQUIRED"],
    ["policies", "CRS11_MULTIPLE_POLICIES_REQUIRED"],
  ]) {
    const evidence = clone(contract.createJuanPerezEvidence());
    evidence[field] = evidence[field].slice(0, 1);
    assert.throws(
      () => contract.validateJourneyEvidence(contract.createAcceptancePlan(), evidence),
      error => error.code === code,
      field,
    );
  }
});

test("Application cannot be collapsed into Policy truth", () => {
  const evidence = clone(contract.createJuanPerezEvidence());
  evidence.applications[0].policyReference = "policy:invented";
  assert.throws(
    () => contract.validateJourneyEvidence(contract.createAcceptancePlan(), evidence),
    error => error.code === "CRS11_APPLICATION_POLICY_COLLAPSE",
  );
});

test("Quote calculation truth stays inside Quote authority", () => {
  const evidence = clone(contract.createJuanPerezEvidence());
  evidence.quotes[0].numericTruthCopied = true;
  assert.throws(
    () => contract.validateJourneyEvidence(contract.createAcceptancePlan(), evidence),
    error => error.code === "CRS11_QUOTE_AUTHORITY_VIOLATION",
  );
});

test("Timeline requires deterministic order and append-only correction lineage", () => {
  const evidence = clone(contract.createJuanPerezEvidence());
  [evidence.timeline[0], evidence.timeline[1]] = [evidence.timeline[1], evidence.timeline[0]];
  evidence.timeline[0].occurredAt = "2026-07-02T15:00:00.000Z";
  evidence.timeline[1].occurredAt = "2026-07-01T15:00:00.000Z";
  assert.throws(
    () => contract.validateJourneyEvidence(contract.createAcceptancePlan(), evidence),
    error => error.code === "CRS11_TIMELINE_ORDER_INVALID",
  );

  const correction = clone(contract.createJuanPerezEvidence());
  correction.timeline[7].correctionOf = "timeline:missing";
  assert.throws(
    () => contract.validateJourneyEvidence(contract.createAcceptancePlan(), correction),
    error => error.code === "CRS11_CORRECTION_LINEAGE_INVALID",
  );
});

test("security matrix and automation boundaries are mandatory", () => {
  const evidence = clone(contract.createJuanPerezEvidence());
  evidence.security.crossAdvisorReadBlocked = false;
  assert.throws(
    () => contract.validateJourneyEvidence(contract.createAcceptancePlan(), evidence),
    error => error.code === "CRS11_SECURITY_ACCEPTANCE_FAILED",
  );

  const automatic = clone(contract.createJuanPerezEvidence());
  automatic.boundaries.automaticMessage = true;
  assert.throws(
    () => contract.validateJourneyEvidence(contract.createAcceptancePlan(), automatic),
    error => error.code === "CRS11_FORBIDDEN_EFFECT_DETECTED",
  );
});

test("relationship intelligence remains read-only and human-decided", () => {
  const evidence = clone(contract.createJuanPerezEvidence());
  evidence.intelligence.automaticBusinessAction = true;
  assert.throws(
    () => contract.validateJourneyEvidence(contract.createAcceptancePlan(), evidence),
    error => error.code === "CRS11_INTELLIGENCE_BOUNDARY_VIOLATION",
  );
});

test("plan refuses incomplete device and rollback matrices", () => {
  assert.throws(
    () => contract.createAcceptancePlan({ devices: ["MOBILE", "DESKTOP"] }),
    error => error.code === "CRS11_DEVICE_MATRIX_INCOMPLETE",
  );
  assert.throws(
    () => contract.createAcceptancePlan({ rollbackCriteria: ["HEAD_MOVED"] }),
    error => error.code === "CRS11_ROLLBACK_CRITERIA_INCOMPLETE",
  );
});

test("CRS 11 itself owns no product, schema or business mutation", () => {
  assert.equal(contract.CRS_11_BOUNDARIES.readOnlyAcceptance, true);
  for (const [key, value] of Object.entries(contract.CRS_11_BOUNDARIES)) {
    if (key === "readOnlyAcceptance") continue;
    assert.equal(value, false, key);
  }
});
