import assert from "node:assert/strict";
import {
  createAdvisorIntelligenceProfile,
  createMickExecutionReview,
  FipPack02ContractError,
} from "../platform/advisor-intelligence/fip-pack-02-advisor-mick-contract.js";
import { buildAdvisorIntelligenceAndMick } from "../advisor-os/advisor-intelligence/fip-pack-02-advisor-mick-service.js";

const evidence = (sampleSize, confidence) => ({ sampleSize, confidence, evidenceRefs: [`e:${sampleSize}`] });

const profile = createAdvisorIntelligenceProfile({
  advisorReference: "advisor:jorge",
  asOfDate: "2026-08-02",
  clientSegments: [{ key: "women-30-45", label: "Mujeres 30–45", observedCount: 18, conversionRate: 0.5, evidence: evidence(18, "MEDIUM") }],
  markets: [{ key: "referrals", label: "Referidos", observedCount: 24, conversionRate: 0.54, evidence: evidence(24, "HIGH") }],
  channels: [{ key: "client-referrals", label: "Referidos de clientes", observedCount: 14, conversionRate: 0.57, evidence: evidence(14, "MEDIUM") }],
  products: [{ key: "life", label: "Vida", observedCount: 20, conversionRate: 0.45, evidence: evidence(20, "HIGH") }],
});
assert.equal(profile.idealClientCandidates.length, 1);
assert.equal(profile.idealMarketCandidates.length, 1);
assert.equal(profile.boundaries.personalityTruth, false);
assert.equal(profile.boundaries.advisorRanking, false);
assert.equal(profile.boundaries.automaticAction, false);
assert.ok(Object.isFrozen(profile));

const weakProfile = createAdvisorIntelligenceProfile({
  advisorReference: "advisor:jorge",
  asOfDate: "2026-08-02",
  clientSegments: [{ key: "dentists", label: "Dentistas", observedCount: 4, conversionRate: 0.75, evidence: evidence(4, "INSUFFICIENT_EVIDENCE") }],
});
assert.equal(weakProfile.idealClientCandidates.length, 0);

const result = buildAdvisorIntelligenceAndMick({
  advisorReference: "advisor:jorge",
  asOfDate: "2026-08-02",
  period: "2026-07",
  aggregates: {
    markets: [{ key: "referrals", label: "Referidos", opportunities: 20, issuedPolicies: 10, averageCycleDays: 18, evidenceRefs: ["market:referrals"] }],
  },
  activity: {
    totalActivities: 80,
    followups: 20,
    overdueFollowups: 8,
    quotes: 12,
    discoveryConversations: 13,
    referralRequests: 2,
    followupEvidenceRefs: ["activity:followups"],
    quoteEvidenceRefs: ["activity:quotes"],
  },
  outcomes: {
    totalOutcomes: 12,
    policyDeliveries: 8,
    deliveryEvidenceRefs: ["outcome:deliveries"],
  },
});
assert.equal(result.profile.idealMarketCandidates.length, 1);
assert.ok(result.mick.patterns.some(pattern => pattern.id === "FOLLOWUP_DELAY"));
assert.ok(result.mick.patterns.some(pattern => pattern.id === "EARLY_QUOTING_HYPOTHESIS"));
assert.ok(result.mick.patterns.some(pattern => pattern.id === "REFERRAL_REQUEST_GAP"));
assert.equal(result.mick.automaticEnforcementAllowed, false);
assert.equal(result.automaticActionAllowed, false);

const insufficient = createMickExecutionReview({
  advisorReference: "advisor:jorge",
  period: "2026-W31",
  patterns: [{ id: "NO_DATA", state: "INSUFFICIENT_EVIDENCE", observation: "Sin muestra suficiente.", evidence: evidence(0, "INSUFFICIENT_EVIDENCE") }],
});
assert.equal(insufficient.patterns[0].evidence.sampleSize, 0);
assert.equal(insufficient.patterns[0].evidence.confidence, "INSUFFICIENT_EVIDENCE");

assert.throws(
  () => createAdvisorIntelligenceProfile({ advisorReference: "advisor:jorge", asOfDate: "2026-08-02", advisorRanking: 1 }),
  error => error instanceof FipPack02ContractError && error.code === "FIP02_FORBIDDEN_FIELD",
);
assert.throws(
  () => createMickExecutionReview({ advisorReference: "advisor:jorge", period: "2026-07", punishment: true }),
  error => error instanceof FipPack02ContractError && error.code === "FIP02_FORBIDDEN_FIELD",
);

console.log("FIP_PACK_02_ADVISOR_INTELLIGENCE_AND_MICK=PASS");
