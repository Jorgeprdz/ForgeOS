import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const contract = require("../platform/shared-commercial-model/crs-09-person-workspace-contract.js");

function item(section, overrides = {}) {
  return {
    reference: `${section.toLowerCase()}-1`,
    recordType: section === "IDENTITY" ? "COMMERCIAL_PERSON" : section.slice(0, -1),
    label: section === "IDENTITY" ? "Alejandra Moleres" : `${section} 1`,
    summary: "Hecho mínimo atribuido.",
    state: "CONFIRMED",
    authority: contract.SECTION_AUTHORITIES[section],
    occurredAt: section === "IDENTITY" ? null : "2026-08-01T12:00:00.000Z",
    privacyClassification: "PRIVATE",
    attentionRequired: false,
    deepLink: section === "IDENTITY" ? "?nav=persona&person=person-1" : `?nav=persona&section=${section}`,
    sourceDomain: section,
    facts: { personReference: "person-1" },
    ...overrides,
  };
}

function input() {
  const sections = Object.fromEntries(contract.SECTION_IDS.map(id => [id, {
    id,
    status: "AVAILABLE",
    reason: null,
    items: [item(id, id === "IDENTITY" ? { reference: "person-1" } : {})],
  }]));
  return {
    advisorReference: "advisor-1",
    person: {
      personReference: "person-1",
      displayName: "Alejandra Moleres",
      lifecycleState: "CONFIRMED",
      privacyClassification: "PRIVATE",
    },
    relationshipReference: "rel-1",
    builtAt: "2026-08-01T13:00:00.000Z",
    sections,
    sourceHealth: Object.fromEntries(contract.SECTION_IDS.map(id => [id, { status: "AVAILABLE", count: 1 }])),
  };
}

test("creates one read-only person workspace with all eight authority sections", () => {
  const workspace = contract.createPersonWorkspace(input());
  assert.equal(workspace.contractType, contract.CONTRACT_TYPE);
  assert.equal(workspace.person.personReference, "person-1");
  assert.deepEqual(Object.keys(workspace.sections), contract.SECTION_IDS);
  assert.equal(workspace.itemCount, 8);
  assert.equal(workspace.readOnlyComposition, true);
  assert.equal(workspace.secondTruthStore, false);
  assert.equal(workspace.truthMutation, false);
  assert.equal(workspace.localMutationControls, false);
  assert.ok(Object.isFrozen(workspace));
});

test("preserves honest empty, degraded and unavailable section states", () => {
  const candidate = input();
  candidate.sections.COMMITMENTS = { id: "COMMITMENTS", status: "EMPTY", items: [] };
  candidate.sections.POLICIES = { id: "POLICIES", status: "DEGRADED", reason: "POLICY_READER_UNAVAILABLE", items: [] };
  candidate.sections.APPLICATIONS = { id: "APPLICATIONS", status: "UNAVAILABLE", reason: "NOT_CONNECTED", items: [] };
  const workspace = contract.createPersonWorkspace(candidate);
  assert.equal(workspace.sections.COMMITMENTS.status, "EMPTY");
  assert.equal(workspace.sections.POLICIES.status, "DEGRADED");
  assert.equal(workspace.sections.APPLICATIONS.status, "UNAVAILABLE");
});

test("rejects copied contact, policy-number and raw payload truth", () => {
  for (const forbidden of [
    { phone: "+525555555555" },
    { policyNumber: "ABC123" },
    { nested: { rawPayload: { secret: true } } },
  ]) {
    const candidate = input();
    candidate.sections.QUOTES.items[0].facts = forbidden;
    assert.throws(
      () => contract.createPersonWorkspace(candidate),
      error => error.code === "CRS09_SENSITIVE_COPY_FORBIDDEN",
    );
  }
});

test("rejects external or executable deep links", () => {
  for (const deepLink of ["https://example.com", "javascript:alert(1)", "//example.com"]) {
    const candidate = input();
    candidate.sections.QUOTES.items[0].deepLink = deepLink;
    assert.throws(
      () => contract.createPersonWorkspace(candidate),
      error => error.code === "CRS09_DEEP_LINK_INVALID",
    );
  }
});

test("rejects cross-person composition and unsupported mutation-shaped fields", () => {
  const mixed = input();
  mixed.sections.TIMELINE.items[0].facts.personReference = "person-2";
  assert.throws(
    () => contract.createPersonWorkspace(mixed),
    error => error.code === "CRS09_CROSS_PERSON_MIX_FORBIDDEN",
  );

  const mutation = input();
  mutation.sections.POLICIES.items[0].mutate = true;
  assert.throws(
    () => contract.createPersonWorkspace(mutation),
    error => error.code === "CRS09_ITEM_FIELDS_INVALID",
  );
});

test("workspace digest is deterministic across object key order", () => {
  const first = contract.createPersonWorkspace(input());
  const candidate = input();
  candidate.sections = Object.fromEntries([...Object.entries(candidate.sections)].reverse());
  const second = contract.createPersonWorkspace(candidate);
  assert.equal(first.workspaceReference, second.workspaceReference);
  assert.equal(first.workspaceDigest, second.workspaceDigest);
});
