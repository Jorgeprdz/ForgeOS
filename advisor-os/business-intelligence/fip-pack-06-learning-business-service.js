import {
  createBusinessIntelligenceSnapshot,
  createLearningLoopSnapshot,
  createStrategyScenario,
} from "../../platform/business-intelligence/fip-pack-06-learning-business-contract.js";

const metric = (key, observedValue, denominator, sampleSize, confidence, limitation = null) => ({
  key,
  observedValue,
  denominator,
  sampleSize,
  confidence,
  limitation,
});

export function buildFipPack06LearningAndBusinessReadModel(input = {}) {
  const advisorReference = input.advisorReference;
  const period = input.period;

  const learning = createLearningLoopSnapshot({
    advisorReference,
    period,
    events: input.learningEvents || [],
    metrics: input.learningMetrics || [],
  });

  const scenarios = (input.strategyScenarios || []).map(createStrategyScenario);

  const funnel = input.funnel || [];
  const markets = input.markets || [];
  const channels = input.channels || [];
  const products = input.products || [];

  const business = createBusinessIntelligenceSnapshot({
    advisorReference,
    period,
    funnel,
    markets,
    channels,
    products,
    forecastAccuracy: input.forecastAccuracy || [],
    recommendationUtility: input.recommendationUtility || [],
    sourceFreshness: input.sourceFreshness || {},
  });

  const issued = learning.outcomeCounts.POLICY_ISSUED || 0;
  const executed = learning.outcomeCounts.EXECUTED || 0;
  const responseRate = executed > 0 ? issued / executed : 0;

  const summaryMetrics = Object.freeze([
    metric(
      "LEARNING_EVENTS",
      learning.events.length,
      learning.events.length,
      learning.events.length,
      learning.events.length >= 20 ? "MEDIUM" : "INSUFFICIENT_EVIDENCE",
      learning.events.length >= 20 ? null : "La muestra todavía es pequeña para generalizar.",
    ),
    metric(
      "ISSUED_PER_EXECUTED_RECOMMENDATION",
      responseRate,
      executed,
      executed,
      executed >= 20 ? "MEDIUM" : "INSUFFICIENT_EVIDENCE",
      executed >= 20 ? null : "No debe interpretarse como causalidad.",
    ),
  ]);

  return Object.freeze({
    advisorReference,
    period,
    learning,
    scenarios: Object.freeze(scenarios),
    business,
    summaryMetrics,
    nextReviewQuestions: Object.freeze([
      "¿Qué recomendaciones fueron ejecutadas?",
      "¿Cuáles produjeron avance observable?",
      "¿Qué segmentos o canales merecen un experimento controlado?",
      "¿Qué datos faltantes impiden una conclusión confiable?",
    ]),
    boundaries: Object.freeze({
      causalProofCreated: false,
      guaranteedGrowth: false,
      officialRevenueTruth: false,
      compensationTruth: false,
      payoutTruth: false,
      automaticModelTraining: false,
      automaticStrategyExecution: false,
      automaticBusinessAction: false,
      humanApprovalRequired: true,
    }),
  });
}
