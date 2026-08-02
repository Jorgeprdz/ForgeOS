import assert from "node:assert/strict";
import {
  createBusinessIntelligenceSnapshot,
  createLearningLoopSnapshot,
  createStrategyScenario,
} from "../platform/business-intelligence/fip-pack-06-learning-business-contract.js";
import { buildFipPack06LearningAndBusinessReadModel } from "../advisor-os/business-intelligence/fip-pack-06-learning-business-service.js";

const advisorReference = "advisor:Jorge";
const period = "2026-08";

const learning = createLearningLoopSnapshot({
  advisorReference,
  period,
  events: [
    {
      recommendationReference: "nash:001",
      advisorReference,
      personReference: "person:ana",
      outcome: "EXECUTED",
      observedAt: "2026-08-02T12:00:00.000Z",
      evidenceReferences: ["activity:001"],
    },
    {
      recommendationReference: "nash:001",
      advisorReference,
      personReference: "person:ana",
      outcome: "CLIENT_RESPONDED",
      observedAt: "2026-08-02T13:00:00.000Z",
      evidenceReferences: ["activity:002"],
    },
  ],
  metrics: [{ key: "RESPONSE_RATE", observedValue: 1, denominator: 1, sampleSize: 1, confidence: "INSUFFICIENT_EVIDENCE" }],
});

assert.equal(learning.outcomeCounts.EXECUTED, 1);
assert.equal(learning.outcomeCounts.CLIENT_RESPONDED, 1);
assert.equal(learning.causalProofCreated, false);
assert.equal(learning.automaticModelTraining, false);

const scenario = createStrategyScenario({
  reference: "strategy:referrals",
  title: "Duplicar solicitudes de referidos",
  state: "ESTIMATED",
  assumptions: ["Mantener conversión histórica"],
  baseline: [{ key: "REFERRAL_REQUESTS", observedValue: 5, denominator: 20, sampleSize: 20, confidence: "MEDIUM" }],
  projected: [{ key: "REFERRAL_REQUESTS", observedValue: 10, denominator: 20, sampleSize: 20, confidence: "MEDIUM" }],
  expectedImpact: "Mayor volumen potencial de conversaciones por referido.",
  risks: ["La conversión histórica puede no repetirse."],
  confidence: "MEDIUM",
  limitations: ["No prueba causalidad."],
});

assert.equal(scenario.guaranteed, false);
assert.equal(scenario.executable, false);
assert.equal(scenario.humanApprovalRequired, true);

const business = createBusinessIntelligenceSnapshot({
  advisorReference,
  period,
  funnel: [{ key: "POLICIES", observedValue: 7, denominator: 10, sampleSize: 10, confidence: "MEDIUM" }],
  markets: [],
  channels: [],
  products: [],
  forecastAccuracy: [],
  recommendationUtility: [],
  sourceFreshness: { activity: "FRESH", policies: "FRESH" },
});

assert.equal(business.officialRevenueTruth, false);
assert.equal(business.unknownRemainsUnknown, true);
assert.equal(business.uiStateAsTruth, false);

const readModel = buildFipPack06LearningAndBusinessReadModel({
  advisorReference,
  period,
  learningEvents: learning.events,
  learningMetrics: learning.metrics,
  strategyScenarios: [scenario],
  funnel: business.funnel,
  sourceFreshness: business.sourceFreshness,
});

assert.equal(readModel.scenarios.length, 1);
assert.equal(readModel.boundaries.guaranteedGrowth, false);
assert.equal(readModel.boundaries.automaticStrategyExecution, false);
assert.equal(readModel.boundaries.humanApprovalRequired, true);

assert.throws(() => createStrategyScenario({
  reference: "bad",
  title: "Bad",
  state: "ESTIMATED",
  confidence: "LOW",
  guaranteedGrowth: true,
}), /Campo prohibido/);

console.log("FIP_PACK_06_LEARNING_AND_BUSINESS_INTELLIGENCE=PASS");
