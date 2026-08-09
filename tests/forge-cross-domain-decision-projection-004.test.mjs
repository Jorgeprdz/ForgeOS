import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import { createFipPack01Foundation } from "../platform/relationship-intelligence/fip-pack-01-foundation-contract.js";
import { createMickExecutionReview } from "../platform/advisor-intelligence/fip-pack-02-advisor-mick-contract.js";
import { createNashRecommendation } from "../platform/nash/fip-pack-03-nash-conversation-contract.js";
import { createOpportunityOperationEnvelope } from "../platform/opportunity-intelligence/fip-pack-04-opportunity-operation-contract.js";
import { createRevenueValue, REVENUE_BUCKETS } from "../revenue/revenue-value.js";
import {
  createCrossDomainDecisionProjection,
  composeDecisionProjectionSet,
} from "../platform/decision-projection/forge-cross-domain-decision-projection.js";
import {
  projectRelationshipCommitmentDecision,
  projectRelationshipHealthDecision,
  projectNashRecommendationDecision,
  projectOpportunityPriorityDecision,
  projectMickPatternDecision,
  projectAdvisorForecastDecision,
  projectRevenueDecision,
} from "../platform/decision-projection/forge-cross-domain-decision-adapters.js";

const advisorReference = "advisor:jorge";
const personReference = "person:ana";
const evidence = [{
  reference: "timeline:event:1",
  authority: "CRS_08_UNIFIED_PERSON_TIMELINE",
  observedAt: "2026-08-08T10:00:00Z",
  freshness: "CURRENT",
  summary: "Compromiso observado",
}];

function relationshipFixture({ stale = false } = {}) {
  const relationshipEvidence = evidence.map(item => ({ ...item, freshness: stale ? "STALE" : item.freshness }));
  return createFipPack01Foundation({
    advisorReference,
    personReference,
    generatedAt: "2026-08-09T05:00:00Z",
    currentCommercialState: "QUOTE_PRESENTED",
    commitments: [{
      reference: "commitment:1",
      owner: "ADVISOR",
      description: "Retomar después del viaje",
      dueAt: "2026-08-08T12:00:00Z",
      state: "OPEN",
      evidence: relationshipEvidence,
    }],
    healthState: "COOLING",
    healthReason: "La relación perdió momentum y existe contexto pendiente.",
    healthConfidence: 0.8,
    healthEvidence: relationshipEvidence,
    scoreDimensions: {
      RECENCY: { state: "OBSERVED", confidence: 0.8, evidence: relationshipEvidence },
    },
  });
}

function nashFixture() {
  return createNashRecommendation({
    advisorReference,
    personReference,
    recommendedAction: "Revisar y retomar el compromiso vencido",
    whyThisPerson: "Existe un compromiso explícito pendiente.",
    whyThisAction: "El seguimiento corresponde al compromiso observado.",
    whyNow: "La fecha acordada ya venció.",
    expectedImpact: "Recuperar claridad y acordar el siguiente paso.",
    confidence: "MEDIUM",
    limitations: ["La persona puede no responder."],
    evidence,
    alternatives: ["Reprogramar después de validar contexto"],
  });
}

function opportunityFixture() {
  return createOpportunityOperationEnvelope({
    advisorReference,
    asOf: "2026-08-09T05:00:00Z",
    attentionBudget: { availableMinutes: 60, maxActions: 3 },
    priorities: [{
      reference: personReference,
      label: "Ana",
      components: {
        urgency: 95,
        impact: 60,
        risk: 80,
        commitment: 100,
        advisorFit: 50,
        evidenceConfidence: 80,
        effortPenalty: 20,
      },
      whyNow: "Existe un compromiso vencido que requiere revisión humana.",
      evidenceRefs: ["timeline:event:1"],
    }],
  });
}

function mickFixture() {
  return createMickExecutionReview({
    advisorReference,
    period: "2026-W32",
    activityObserved: 30,
    outcomeObserved: 4,
    patterns: [{
      id: "FOLLOWUP_DELAY",
      state: "OBSERVED",
      observation: "Se observa retraso recurrente en seguimiento.",
      businessImpact: "Puede reducir continuidad comercial.",
      recommendedExperiment: "Reservar un bloque diario de seguimiento.",
      evidence: {
        sampleSize: 12,
        confidence: "MEDIUM",
        evidenceRefs: ["activity:followups"],
        limitations: [],
      },
    }],
  });
}

function forecastFixture({ state = "READY" } = {}) {
  return Object.freeze({
    schema: "ADVISOR_FORECAST_READ_MODEL_V3",
    advisorId: advisorReference,
    state,
    confidence: "MEDIUM",
    period: { yearMonth: "2026-08" },
    generatedAt: "2026-08-09T05:00:00Z",
    currentProduction: 3,
    target: 10,
    paceProjection: 7,
    primaryExplanation: "El ritmo actual proyecta 7 pólizas contra una meta declarada de 10.",
    evidenceRefs: ["production:2026-08", "goal:2026-08"],
    warnings: ["Forecast is planning context, not guaranteed production."],
    missingInformation: [],
    staleInformation: state === "STALE" ? ["pipeline"] : [],
    decisionSummary: { humanReviewRequired: true },
    actions: [{ type: "NAVIGATE", label: "Abrir Forecast", destination: "ADVISOR_FORECAST_DETAIL" }],
  });
}

test("Trace 1 — overdue relationship commitment projects FOLLOW_UP without recalculation", () => {
  const foundation = relationshipFixture();
  const commitment = foundation.commitments[0];
  assert.equal(commitment.state, "OVERDUE");
  const projected = projectRelationshipCommitmentDecision({ foundation, commitment });
  assert.equal(projected.family, "FOLLOW_UP");
  assert.equal(projected.decisionType, "FOLLOW_UP_DUE");
  assert.equal(projected.truthState, "OVERDUE");
  assert.equal(projected.recommendedAction.owner, "PIPELINE");
  assert.equal(projected.boundaries.calculatesPriority, false);
  assert.equal(projected.boundaries.createsTruth, false);
});

test("Trace 2 — Relationship cooling preserves source health/evidence/confidence", () => {
  const foundation = relationshipFixture();
  const projected = projectRelationshipHealthDecision({ foundation });
  assert.equal(projected.family, "RELATIONSHIP");
  assert.equal(projected.truthState, "COOLING");
  assert.equal(projected.confidence.value, 0.8);
  assert.equal(projected.confidence.authority, "FORGE_RELATIONSHIP_INTELLIGENCE_FOUNDATION");
  assert.equal(projected.evidence[0].authority, "CRS_08_UNIFIED_PERSON_TIMELINE");
});

test("Trace 3 — Nash NBA remains recommendation with human approval", () => {
  const recommendation = nashFixture();
  const projected = projectNashRecommendationDecision({ recommendation });
  assert.equal(projected.decisionType, "NEXT_BEST_ACTION");
  assert.equal(projected.truthState, "RECOMMENDATION");
  assert.equal(projected.recommendedAction.automaticExecutionAllowed, false);
  assert.equal(projected.humanDecisionRequired, true);
  assert.equal(projected.confidence.value, recommendation.confidence);
  assert.equal(projected.reason.includes(recommendation.whyThisAction), true);
});

test("Trace 4 — Mick projection stays COACHING and never becomes commercial action", () => {
  const mick = mickFixture();
  const projected = projectMickPatternDecision({ mickReview: mick, pattern: mick.patterns[0] });
  assert.equal(projected.family, "COACHING");
  assert.equal(projected.recommendedAction.owner, "COACH");
  assert.equal(projected.truthState, "OBSERVED");
  assert.equal(projected.boundaries.automaticExecutionAllowed, false);
});

test("Trace 5 — Advisor Forecast V3 projects planning semantics without money/truth promotion", () => {
  const readModel = forecastFixture();
  const projected = projectAdvisorForecastDecision({ readModel });
  assert.equal(projected.family, "FORECAST");
  assert.equal(projected.impact.value, 7);
  assert.equal(projected.impact.semantics, "PROJECTED");
  assert.equal(projected.impact.authority, "SMNYL_PACE_FORECAST_ENGINE");
  assert.equal(projected.provenance.sourceAuthorities.includes("MANAGER_OS_FORECAST"), true);
  assert.equal(projected.boundaries.calculatesImpact, false);
});

test("Trace 6 — same-person Relationship + Nash can AGREE without dropping either authority", () => {
  const foundation = relationshipFixture();
  const relationshipDecision = projectRelationshipCommitmentDecision({ foundation, commitment: foundation.commitments[0] });
  const nashDecision = projectNashRecommendationDecision({ recommendation: nashFixture() });
  const set = composeDecisionProjectionSet([relationshipDecision, nashDecision]);
  assert.equal(set.items.length, 2);
  assert.equal(set.groups.length, 1);
  assert.equal(set.groups[0].relationship, "AGREE");
  assert.equal(set.groups[0].winnerDecisionReference, null);
  assert.equal(set.boundaries.winnerSelected, false);
  assert.equal(new Set(set.groups[0].sourceAuthorities).has("FIP_NASH_NEXT_BEST_ACTION"), true);
});

test("Pack04 priority is transported exactly and not rescored by projection", () => {
  const envelope = opportunityFixture();
  const priority = envelope.priorities[0];
  const projected = projectOpportunityPriorityDecision({
    envelope,
    priority,
    action: { type: "REVIEW_PIPELINE", label: "Abrir oportunidad", owner: "PIPELINE", actionKey: "pipeline:ana:review" },
  });
  assert.equal(projected.priority.value, priority.score);
  assert.equal(projected.priority.authority, "FIP_PACK_04_OPPORTUNITY_AND_OPERATION");
  assert.deepEqual(priority.components, envelope.priorities[0].components);
  assert.equal(projected.boundaries.calculatesPriority, false);
});

test("Economic projection preserves Revenue Value bucket verbatim", () => {
  const revenueValue = createRevenueValue({
    bucket: REVENUE_BUCKETS.EARNED_ESTIMATED,
    amount: 7800,
    currency: "MXN",
    sourceState: "carrier_rule_estimate",
    evidenceRefs: ["payment:1"],
    confidence: "payment_confirmed_adapter_estimate",
  });
  const projected = projectRevenueDecision({ advisorReference, subjectReference: "policy:1", revenueValue });
  assert.equal(projected.truthState, REVENUE_BUCKETS.EARNED_ESTIMATED);
  assert.equal(projected.impact.semantics, REVENUE_BUCKETS.EARNED_ESTIMATED);
  assert.equal(projected.impact.value, 7800);
  assert.notEqual(projected.truthState, REVENUE_BUCKETS.PAID_CONFIRMED);
});

test("Conflict is preserved and no winner is selected", () => {
  const base = {
    advisorReference,
    subject: { type: "PERSON", reference: personReference },
    domain: "NASH",
    family: "COMMERCIAL_ATTENTION",
    decisionType: "NEXT_BEST_ACTION",
    truthState: "RECOMMENDATION",
    title: "Candidate",
    reason: "Evidence-backed candidate.",
    provenance: { sourceAuthorities: ["AUTHORITY_A"] },
    lifecycle: { state: "ACTIVE" },
    feedback: { owner: "PIPELINE", expectedEvents: ["ACTIVITY_RECORDED"] },
    humanDecisionRequired: true,
  };
  const a = createCrossDomainDecisionProjection({
    ...base,
    decisionReference: "decision:a",
    recommendedAction: { type: "CONTACT", label: "Contactar", owner: "PIPELINE", target: personReference },
    composition: { key: "person:ana:next", actionKey: "contact", mergeCompatible: true },
  });
  const b = createCrossDomainDecisionProjection({
    ...base,
    decisionReference: "decision:b",
    provenance: { sourceAuthorities: ["AUTHORITY_B"] },
    recommendedAction: { type: "WAIT", label: "Esperar", owner: "PIPELINE", target: personReference },
    composition: { key: "person:ana:next", actionKey: "wait", mergeCompatible: true },
  });
  const set = composeDecisionProjectionSet([a, b]);
  assert.equal(set.groups[0].relationship, "CONFLICT");
  assert.equal(set.groups[0].winnerDecisionReference, null);
  assert.equal(set.boundaries.automaticConflictResolution, false);
});

test("STALE source state remains visible in composition", () => {
  const foundation = relationshipFixture({ stale: true });
  const decision = projectRelationshipCommitmentDecision({ foundation, commitment: foundation.commitments[0] });
  assert.equal(decision.lifecycle.state, "STALE");
  const current = projectNashRecommendationDecision({ recommendation: nashFixture() });
  const set = composeDecisionProjectionSet([decision, current]);
  assert.equal(set.groups[0].relationship, "STALE");
});

test("Consumer proof — render model only formats/routes and does not need inference", () => {
  const recommendation = projectNashRecommendationDecision({ recommendation: nashFixture() });
  const consumerView = Object.freeze({
    title: recommendation.title,
    reason: recommendation.reason,
    whyNow: recommendation.whyNow,
    actionLabel: recommendation.recommendedAction.label,
    actionTarget: recommendation.recommendedAction.target,
    evidenceCount: recommendation.evidence.length,
    confidence: recommendation.confidence.value,
  });
  assert.equal(consumerView.actionTarget, personReference);
  assert.equal(consumerView.evidenceCount, 1);
  assert.equal(recommendation.boundaries.calculatesPriority, false);
});

test("Static authority lock — Phase004 implementation contains no persistence or scoring engine", async () => {
  const contract = await readFile(new URL("../platform/decision-projection/forge-cross-domain-decision-projection.js", import.meta.url), "utf8");
  const adapters = await readFile(new URL("../platform/decision-projection/forge-cross-domain-decision-adapters.js", import.meta.url), "utf8");
  const source = `${contract}\n${adapters}`;
  assert.doesNotMatch(source, /from\(['"]|\.insert\(|\.update\(|\.delete\(|service_role|create table|create function/i);
  assert.doesNotMatch(source, /Math\.round\([^\n]*priority|weightedScore|globalScore|priorityScore\s*=/i);
  assert.match(contract, /calculatesPriority: false/);
  assert.match(contract, /calculatesConfidence: false/);
  assert.match(contract, /calculatesImpact: false/);
  assert.match(contract, /winnerDecisionReference: null/);
});
