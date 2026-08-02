"use strict";

const contract = require("../../platform/shared-commercial-model/crs-11-end-to-end-acceptance-contract.js");

function create(options = {}) {
  const acceptedByKey = new Map();
  const clock = typeof options.clock === "function"
    ? options.clock
    : () => "2026-08-02T06:30:00.000Z";

  function preparePlan(input = {}) {
    return contract.createAcceptancePlan(input);
  }

  function runAcceptance({ plan, evidence }) {
    const normalizedPlan = plan?.contractType === contract.PLAN_TYPE
      ? plan
      : preparePlan(plan);
    const acceptance = contract.validateJourneyEvidence(normalizedPlan, evidence);
    const replayKey = normalizedPlan.idempotencyKey;
    const prior = acceptedByKey.get(replayKey);
    if (prior) {
      if (prior.evidenceDigest !== acceptance.evidenceDigest) {
        const error = new Error("changed input conflicts with the accepted CRS 11 replay key");
        error.code = "CRS11_IDEMPOTENCY_CONFLICT";
        throw error;
      }
      return prior;
    }
    acceptedByKey.set(replayKey, acceptance);
    return acceptance;
  }

  function buildPromotionCandidate(acceptance, approval = {}) {
    if (acceptance?.contractType !== contract.CONTRACT_TYPE || acceptance.status !== "PASS") {
      const error = new Error("a passing CRS 11 acceptance is required");
      error.code = "CRS11_PASSING_ACCEPTANCE_REQUIRED";
      throw error;
    }
    if (approval.humanApproved !== true) {
      const error = new Error("explicit human approval is required for program promotion");
      error.code = "CRS11_HUMAN_PROMOTION_APPROVAL_REQUIRED";
      throw error;
    }
    const approvedBy = typeof approval.approvedBy === "string" && approval.approvedBy.trim()
      ? approval.approvedBy.trim()
      : null;
    if (!approvedBy) {
      const error = new Error("approvedBy is required");
      error.code = "CRS11_APPROVER_REQUIRED";
      throw error;
    }
    return Object.freeze({
      contractType: "FORGE_CRS_11_PROGRAM_PROMOTION_CANDIDATE",
      acceptanceReference: acceptance.acceptanceReference,
      evidenceDigest: acceptance.evidenceDigest,
      approvedBy,
      approvedAt: new Date(approval.approvedAt || clock()).toISOString(),
      promotion: "COMMERCIAL_RELATIONSHIP_SPINE_PRODUCTIVE_AUTHORITY",
      repositoryMergeStillRequired: true,
      automaticPromotion: false,
      canonicalMutation: false,
    });
  }

  function diagnostics() {
    return Object.freeze({
      acceptanceAuthority: contract.CONTRACT_TYPE,
      canonicalRoot: "CARTERA_010B_COMMERCIAL_PERSON",
      timelineAuthority: "CRS_08_UNIFIED_PERSON_TIMELINE_READ_MODEL",
      workspaceAuthority: "CRS_09_PRODUCTIVE_PERSON_WORKSPACE",
      intelligenceAuthority: "CRS_10_SHARED_READ_ONLY_COMPOSITION",
      acceptanceMemoryOnly: true,
      durableAcceptanceStoreCreated: false,
      canonicalMutation: false,
      schemaMutation: false,
      supabaseMutation: false,
      productUiMutation: false,
      automaticBusinessAction: false,
      automaticProgramPromotion: false,
    });
  }

  return Object.freeze({
    preparePlan,
    runAcceptance,
    buildPromotionCandidate,
    diagnostics,
  });
}

module.exports = Object.freeze({ create });
