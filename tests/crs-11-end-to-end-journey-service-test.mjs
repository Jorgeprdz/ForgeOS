import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const contract = require("../platform/shared-commercial-model/crs-11-end-to-end-acceptance-contract.js");
const serviceModule = require("../advisor-os/relationship-spine/crs-11-end-to-end-acceptance-service.js");

test("service executes the governed Juan Pérez acceptance pass", () => {
  const service = serviceModule.create();
  const plan = service.preparePlan();
  const acceptance = service.runAcceptance({
    plan,
    evidence: contract.createJuanPerezEvidence(),
  });
  assert.equal(acceptance.status, "PASS");
  assert.equal(acceptance.promotionCandidate, true);
  assert.equal(acceptance.checks.onePersonEndToEnd, true);
});

test("identical replay returns the same immutable acceptance", () => {
  const service = serviceModule.create();
  const plan = service.preparePlan();
  const evidence = contract.createJuanPerezEvidence();
  const first = service.runAcceptance({ plan, evidence });
  const second = service.runAcceptance({ plan, evidence });
  assert.equal(second, first);
  assert.equal(Object.isFrozen(second), true);
});

test("changed input under the same replay key is rejected", () => {
  const service = serviceModule.create();
  const plan = service.preparePlan();
  service.runAcceptance({ plan, evidence: contract.createJuanPerezEvidence() });
  const changed = structuredClone(contract.createJuanPerezEvidence());
  changed.recordedAt = "2026-08-02T06:31:00.000Z";
  assert.throws(
    () => service.runAcceptance({ plan, evidence: changed }),
    error => error.code === "CRS11_IDEMPOTENCY_CONFLICT",
  );
});

test("program promotion requires explicit human approval", () => {
  const service = serviceModule.create();
  const acceptance = service.runAcceptance({
    plan: service.preparePlan(),
    evidence: contract.createJuanPerezEvidence(),
  });
  assert.throws(
    () => service.buildPromotionCandidate(acceptance),
    error => error.code === "CRS11_HUMAN_PROMOTION_APPROVAL_REQUIRED",
  );
  const candidate = service.buildPromotionCandidate(acceptance, {
    humanApproved: true,
    approvedBy: "owner:jorge",
    approvedAt: "2026-08-02T06:35:00.000Z",
  });
  assert.equal(candidate.promotion, "COMMERCIAL_RELATIONSHIP_SPINE_PRODUCTIVE_AUTHORITY");
  assert.equal(candidate.repositoryMergeStillRequired, true);
  assert.equal(candidate.automaticPromotion, false);
  assert.equal(candidate.canonicalMutation, false);
});

test("diagnostics preserve every authority and effect boundary", () => {
  const diagnostics = serviceModule.create().diagnostics();
  assert.equal(diagnostics.canonicalRoot, "CARTERA_010B_COMMERCIAL_PERSON");
  assert.equal(diagnostics.timelineAuthority, "CRS_08_UNIFIED_PERSON_TIMELINE_READ_MODEL");
  assert.equal(diagnostics.workspaceAuthority, "CRS_09_PRODUCTIVE_PERSON_WORKSPACE");
  assert.equal(diagnostics.intelligenceAuthority, "CRS_10_SHARED_READ_ONLY_COMPOSITION");
  assert.equal(diagnostics.durableAcceptanceStoreCreated, false);
  assert.equal(diagnostics.canonicalMutation, false);
  assert.equal(diagnostics.schemaMutation, false);
  assert.equal(diagnostics.supabaseMutation, false);
  assert.equal(diagnostics.productUiMutation, false);
  assert.equal(diagnostics.automaticBusinessAction, false);
  assert.equal(diagnostics.automaticProgramPromotion, false);
});
