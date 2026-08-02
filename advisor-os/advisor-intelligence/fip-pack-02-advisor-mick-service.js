import {
  createAdvisorIntelligenceProfile,
  createMickExecutionReview,
} from "../../platform/advisor-intelligence/fip-pack-02-advisor-mick-contract.js";

const ratio = (numerator, denominator) => denominator > 0 ? Number((numerator / denominator).toFixed(4)) : null;
const days = value => value === null || value === undefined ? null : Number(value);

function segmentFromAggregate(kind, aggregate = {}) {
  const opportunities = Math.max(0, Number(aggregate.opportunities) || 0);
  const issuedPolicies = Math.max(0, Number(aggregate.issuedPolicies) || 0);
  return {
    key: String(aggregate.key || aggregate.label || kind).trim(),
    label: String(aggregate.label || aggregate.key || kind).trim(),
    observedCount: opportunities,
    conversionRate: ratio(issuedPolicies, opportunities),
    cycleDays: days(aggregate.averageCycleDays),
    premiumAverage: aggregate.averagePremium === null || aggregate.averagePremium === undefined ? null : Number(aggregate.averagePremium),
    evidence: {
      sampleSize: opportunities,
      confidence: opportunities >= 30 ? "HIGH" : opportunities >= 10 ? "MEDIUM" : opportunities >= 5 ? "LOW" : "INSUFFICIENT_EVIDENCE",
      timeWindow: aggregate.timeWindow || null,
      evidenceRefs: Array.isArray(aggregate.evidenceRefs) ? aggregate.evidenceRefs : [],
      limitations: Array.isArray(aggregate.limitations) ? aggregate.limitations : [],
    },
  };
}

function executionPatterns(activity = {}, outcomes = {}) {
  const patterns = [];
  const followups = Math.max(0, Number(activity.followups) || 0);
  const overdueFollowups = Math.max(0, Number(activity.overdueFollowups) || 0);
  const quotes = Math.max(0, Number(activity.quotes) || 0);
  const discoveryConversations = Math.max(0, Number(activity.discoveryConversations) || 0);
  const referralRequests = Math.max(0, Number(activity.referralRequests) || 0);
  const policyDeliveries = Math.max(0, Number(outcomes.policyDeliveries) || 0);

  if (followups >= 5 && overdueFollowups / followups >= 0.3) {
    patterns.push({
      id: "FOLLOWUP_DELAY",
      state: "OBSERVED",
      observation: "Una proporción relevante de seguimientos permanece vencida.",
      businessImpact: "Puede reducir momentum y recuperación de oportunidades activas.",
      recommendedExperiment: "Probar durante dos semanas una ventana fija diaria para compromisos vencidos.",
      evidence: { sampleSize: followups, confidence: followups >= 20 ? "HIGH" : "MEDIUM", evidenceRefs: activity.followupEvidenceRefs || [] },
    });
  }

  if (quotes >= 5 && discoveryConversations > 0 && quotes / discoveryConversations > 0.8) {
    patterns.push({
      id: "EARLY_QUOTING_HYPOTHESIS",
      state: "HYPOTHESIS",
      observation: "La proporción de cotizaciones frente a conversaciones de descubrimiento podría indicar cotización temprana.",
      businessImpact: "La propuesta puede llegar antes de resolver necesidad, decisión u objeciones.",
      recommendedExperiment: "Registrar criterio de decisión antes de cotizar en una muestra controlada.",
      evidence: { sampleSize: discoveryConversations, confidence: discoveryConversations >= 15 ? "MEDIUM" : "LOW", evidenceRefs: activity.quoteEvidenceRefs || [], limitations: ["La proporción por sí sola no prueba cotización prematura."] },
    });
  }

  if (policyDeliveries >= 5 && referralRequests / policyDeliveries < 0.4) {
    patterns.push({
      id: "REFERRAL_REQUEST_GAP",
      state: "OBSERVED",
      observation: "Las solicitudes de referidos son bajas respecto a las entregas de póliza observadas.",
      businessImpact: "Puede existir una fuente orgánica subutilizada.",
      recommendedExperiment: "Pedir referidos después de entregas positivas durante cuatro semanas.",
      evidence: { sampleSize: policyDeliveries, confidence: policyDeliveries >= 15 ? "MEDIUM" : "LOW", evidenceRefs: outcomes.deliveryEvidenceRefs || [] },
    });
  }

  if (patterns.length === 0) {
    patterns.push({
      id: "INSUFFICIENT_EXECUTION_EVIDENCE",
      state: "INSUFFICIENT_EVIDENCE",
      observation: "No existe evidencia suficiente para afirmar un patrón de ejecución.",
      evidence: { sampleSize: Math.max(followups, quotes, policyDeliveries), confidence: "INSUFFICIENT_EVIDENCE", limitations: ["Se requiere mayor cobertura de actividad y resultados."] },
    });
  }
  return patterns;
}

export function buildAdvisorIntelligenceAndMick({
  advisorReference,
  asOfDate,
  period,
  aggregates = {},
  activity = {},
  outcomes = {},
} = {}) {
  const profile = createAdvisorIntelligenceProfile({
    advisorReference,
    asOfDate,
    clientSegments: (aggregates.clientSegments || []).map(item => segmentFromAggregate("CLIENT_SEGMENT", item)),
    markets: (aggregates.markets || []).map(item => segmentFromAggregate("MARKET", item)),
    channels: (aggregates.channels || []).map(item => segmentFromAggregate("CHANNEL", item)),
    products: (aggregates.products || []).map(item => segmentFromAggregate("PRODUCT", item)),
    salesPatterns: Array.isArray(aggregates.salesPatterns) ? aggregates.salesPatterns : [],
  });

  const patterns = executionPatterns(activity, outcomes);
  const mick = createMickExecutionReview({
    advisorReference,
    period,
    activityObserved: Number(activity.totalActivities) || 0,
    outcomeObserved: Number(outcomes.totalOutcomes) || 0,
    patterns,
  });

  return Object.freeze({
    profile,
    mick,
    summary: Object.freeze({
      idealClientCandidateCount: profile.idealClientCandidates.length,
      idealMarketCandidateCount: profile.idealMarketCandidates.length,
      executionPatternCount: mick.patterns.length,
      frictionHypothesisCount: mick.frictionHypotheses.length,
    }),
    readOnly: true,
    automaticActionAllowed: false,
  });
}
