"use strict";

const {
  buildNbaReasonWhyBoundary,
} = require("../../manager-os/nba/nba-reason-why-boundary-contract");

function deepFreeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  Object.freeze(value);
  Object.values(value).forEach(deepFreeze);
  return value;
}

function createBusinessPlanningNbaCandidates(plan) {
  if (plan?.schema !== "ADVISOR_BUSINESS_PLANNING_READ_MODEL_017B") {
    throw new TypeError("BUSINESS_PLANNING_READ_MODEL_REQUIRED");
  }
  return deepFreeze(plan.actionPathCandidates.map(candidate => {
    const result = buildNbaReasonWhyBoundary({
      advisorId: plan.advisorId,
      personId: candidate.targetPerson?.personReference || null,
      personType: "PROSPECT",
      period: plan.period,
      goalContext: {
        recommendedAction: candidate.recommendedAction,
        targetPerson: candidate.targetPerson,
        reasonWhy: candidate.reasonWhy,
        whyNow: candidate.whyNow,
        whyThisPerson: "El compromiso corresponde a esta persona en el read model gobernado.",
        whyThisAction: candidate.reasonWhy,
        evidenceRefs: candidate.evidenceRefs,
        sourceOwners: candidate.sourceOwners,
        freshness: plan.freshness.followUp,
        uncertainty: candidate.uncertainty,
      },
      sourceEvidence: {
        evidenceRefs: candidate.evidenceRefs,
        sourceOwners: candidate.sourceOwners,
        freshness: plan.freshness.followUp,
      },
      requestedUse: "ADVISOR_NEXT_BEST_ACTION_CONTEXT",
    });
    return {
      candidateReference: candidate.candidateReference,
      planningFingerprint: plan.fingerprint,
      nba: result,
      sequenceContextOnly: true,
      humanReviewRequired: true,
      automaticExecutionAllowed: false,
    };
  }));
}

module.exports = { createBusinessPlanningNbaCandidates };
