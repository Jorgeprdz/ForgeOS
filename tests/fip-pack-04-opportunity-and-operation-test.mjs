import assert from "node:assert/strict";
import { createOpportunityOperationEnvelope } from "../platform/opportunity-intelligence/fip-pack-04-opportunity-operation-contract.js";
import { buildOpportunityOperationEnvelope } from "../advisor-os/opportunity-intelligence/fip-pack-04-opportunity-operation-service.js";

const envelope = createOpportunityOperationEnvelope({
  advisorReference: "advisor:jorge",
  asOf: "2026-08-02",
  opportunities: [{
    reference: "person:ana:gap:1",
    type: "PROTECTION_GAP",
    state: "COMMERCIAL_HYPOTHESIS",
    summary: "Posible necesidad complementaria por confirmar.",
    confidence: "MEDIUM",
    evidenceRefs: ["timeline:1"],
  }],
  annualReviews: [{ reference: "person:ana:review", trigger: "POLICY_ANNIVERSARY", status: "PROPOSED" }],
  referralMoments: [{ reference: "person:ana:referral", moment: "POLICY_DELIVERY", reason: "Hito positivo confirmado." }],
  attentionBudget: { availableMinutes: 60, maxActions: 1, declaredEnergy: "MEDIUM" },
  priorities: [
    { reference: "person:ana", label: "Ana", components: { urgency: 90, impact: 80, risk: 70, commitment: 100, advisorFit: 80, evidenceConfidence: 90, effortPenalty: 20 } },
    { reference: "person:luis", label: "Luis", components: { urgency: 20, impact: 30, risk: 20, commitment: 10, advisorFit: 40, evidenceConfidence: 40, effortPenalty: 80 } },
  ],
  forecast: [{ outcome: "NEXT_INTERACTION", state: "ESTIMATED", probability: 0.7, confidence: "MEDIUM" }],
  scenarios: [{ id: "ACT_NOW", action: "FOLLOW_UP", confidence: "MEDIUM" }],
});

assert.equal(envelope.priorities.length, 1);
assert.equal(envelope.priorities[0].reference, "person:ana");
assert.equal(envelope.opportunities[0].productRecommendationAllowed, false);
assert.equal(envelope.forecast[0].guaranteed, false);
assert.equal(envelope.scenarios[0].executionAllowed, false);
assert.equal(envelope.boundaries.humanApprovalRequired, true);

const composed = buildOpportunityOperationEnvelope({
  advisorReference: "advisor:jorge",
  asOf: "2026-08-02",
  availableMinutes: 90,
  maxActions: 2,
  advisorProfile: { idealClientReferences: ["person:ana"] },
  nashPackets: [{ personReference: "person:ana", recommendedAction: "FOLLOW_UP", whyNow: "Compromiso vencido", expectedImpactScore: 80, estimatedEffortScore: 20 }],
  relationshipFoundations: [{
    personReference: "person:ana",
    personLabel: "Ana",
    contractVersion: "FIP-01",
    commitments: [{ status: "OVERDUE" }],
    health: { state: "COOLING" },
    score: { total: 78, confidence: "HIGH" },
    coverageGaps: [{ summary: "Posible necesidad de retiro por confirmar.", observed: false, confidence: "MEDIUM" }],
    annualReviewDue: true,
    annualReviewTrigger: "POLICY_ANNIVERSARY",
    positiveMilestone: true,
    positiveMilestoneType: "POLICY_DELIVERY",
  }],
});

assert.equal(composed.priorities[0].reference, "person:ana");
assert.equal(composed.annualReviews.length, 1);
assert.equal(composed.referralMoments.length, 1);
assert.equal(composed.opportunities[0].state, "COMMERCIAL_HYPOTHESIS");
assert.equal(composed.forecast[0].state, "ESTIMATED");
assert.equal(composed.scenarios.length, 2);

console.log("FIP_PACK_04_OPPORTUNITY_AND_OPERATION=PASS");
