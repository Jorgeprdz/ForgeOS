import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createCartera100ProductivityProof,
} from '../platform/productivity/cartera-100a-productivity-proof-contract.js';

function base(overrides = {}) {
  return {
    period: {
      startDate: '2026-08-01',
      endDate: '2026-08-31',
      timeZone: 'America/Mexico_City',
    },
    authoritativeMetrics: [],
    observations: [],
    recentRecommendations: [],
    sourceState: {},
    instrumentation: {},
    boundaries: {
      humanPerformanceScore: false,
      advisorRanking: false,
      humanWorthInference: false,
      motivationInference: false,
      disciplineInference: false,
      enforcementRecommendation: false,
      silentConsentInference: false,
      contactVolumeOptimization: false,
      causalityClaimWithoutEvidence: false,
      automaticContactExecution: false,
      automaticMessageGeneration: false,
      automaticTaskCreation: false,
      automaticCalendarCreation: false,
      automaticOpportunityCreation: false,
      advisorFeedbackRequiredForLearning: true,
    },
    ...overrides,
  };
}

function metric(metricKey, value, unit = 'COUNT', overrides = {}) {
  return {
    metricKey,
    state: value === 0 ? 'ZERO' : 'KNOWN',
    value,
    unit,
    sourceAuthority: 'TEST_AUTHORITY',
    sourceOwner: 'TEST_OWNER',
    evidenceReferences: [`evidence-${metricKey}`],
    ...overrides,
  };
}

test('100A preserves missing as missing and requires direct evidence for zero', () => {
  const proof = createCartera100ProductivityProof(base({
    authoritativeMetrics: [metric('RELATIONSHIP_REVIEWS_COMPLETED', 0)],
  }));
  assert.equal(proof.metrics.RELATIONSHIP_REVIEWS_COMPLETED.state, 'ZERO');
  assert.equal(proof.metrics.WORK_MINUTES_AVOIDED.state, 'MISSING');
  assert.equal(proof.metrics.WORK_MINUTES_AVOIDED.value, null);

  assert.throws(
    () => createCartera100ProductivityProof(base({
      authoritativeMetrics: [{
        metricKey: 'RELATIONSHIP_REVIEWS_COMPLETED',
        state: 'ZERO',
        value: 0,
        unit: 'COUNT',
        sourceAuthority: 'TEST_AUTHORITY',
        evidenceReferences: [],
      }],
    })),
    /CARTERA100_EXPLICIT_ZERO_REQUIRES_DIRECT_EVIDENCE/
  );
});

test('100A calculates ratios only from evidence-backed numerator and denominator', () => {
  const proof = createCartera100ProductivityProof(base({
    authoritativeMetrics: [
      metric('CONFIRMED_PRODUCTION_COUNT', 4),
      metric('ADVISOR_WORK_MINUTES', 480, 'MINUTES'),
      metric('RESPONSES_RECEIVED', 6),
      metric('RESPONSE_ATTEMPTS', 10),
      metric('CONVERSION_SUCCESSES', 2),
      metric('CONVERSION_STARTS', 4),
      metric('SIGNAL_TO_ACTION_SECONDS_TOTAL', 600, 'SECONDS'),
      metric('SIGNAL_TO_ACTION_COUNT', 4),
      metric('POLICY_REVIEW_MINUTES_TOTAL', 45, 'MINUTES'),
      metric('IMPORTED_POLICY_REVIEW_COUNT', 3),
    ],
  }));
  assert.equal(proof.derived.productionPerAdvisorHour.value, 0.5);
  assert.equal(proof.derived.responseRate.value, 0.6);
  assert.equal(proof.derived.conversionRate.value, 0.5);
  assert.equal(proof.derived.averageSignalToActionSeconds.value, 150);
  assert.equal(proof.derived.averagePolicyReviewMinutes.value, 15);
});

test('100A does not divide by zero or convert incomplete coverage into proof', () => {
  const proof = createCartera100ProductivityProof(base({
    authoritativeMetrics: [
      metric('CONFIRMED_PRODUCTION_COUNT', 0),
      metric('ADVISOR_WORK_MINUTES', 0, 'MINUTES'),
      metric('ACCEPTED_RECOMMENDATIONS', 2, 'COUNT', { state: 'INCOMPLETE' }),
    ],
  }));
  assert.equal(proof.derived.productionPerAdvisorHour.state, 'UNKNOWN');
  assert.equal(proof.metrics.ACCEPTED_RECOMMENDATIONS.state, 'INCOMPLETE');
  assert.equal(proof.statement.state, 'INSUFFICIENT_EVIDENCE');
});

test('100A produces the roadmap statement only from supported metrics and makes no causal claim', () => {
  const proof = createCartera100ProductivityProof(base({
    authoritativeMetrics: [
      metric('WORK_MINUTES_AVOIDED', 180, 'MINUTES'),
      metric('SECOND_POLICY_REVIEWS', 3),
      metric('COMPLETED_MINIMUM_USEFUL_ACTIONS', 2),
    ],
  }));
  assert.equal(proof.statement.state, 'EVIDENCE_AVAILABLE');
  assert.match(proof.statement.text, /3\.0 h administrativas evitadas/);
  assert.match(proof.statement.text, /3 revisiones responsables de crecimiento/);
  assert.equal(proof.statement.causalClaimMade, false);
});

test('100A rejects human score, ranking and enforcement fields recursively', () => {
  assert.throws(
    () => createCartera100ProductivityProof(base({
      metadata: { humanWorth: 7 },
    })),
    /CARTERA100_HUMAN_SCORE_OR_ENFORCEMENT_FIELD_FORBIDDEN/
  );
  assert.throws(
    () => createCartera100ProductivityProof(base({
      boundaries: { ...base().boundaries, contactVolumeOptimization: true },
    })),
    /CARTERA100_BOUNDARY_INVALID/
  );
});

test('100A applies the latest explicit feedback without claiming causal credit', () => {
  const proof = createCartera100ProductivityProof(base({
    observations: [
      {
        metricKey: 'ACCEPTED_RECOMMENDATIONS',
        metricCategory: 'PRODUCTIVITY',
        quantity: 1,
        unit: 'COUNT',
        metricState: 'KNOWN',
        sourceAuthority: 'CARTERA070',
        evidenceReferences: ['recommendation-1'],
        recommendationReference: 'recommendation-1',
        usefulnessFeedback: 'UNSET',
        attributionState: 'ACTION_CONFIRMED',
        occurredAt: '2026-08-02T10:00:00Z',
      },
      {
        metricKey: 'INDEPENDENT_OUTCOME_FEEDBACK',
        metricCategory: 'LEARNING',
        quantity: 1,
        unit: 'COUNT',
        metricState: 'KNOWN',
        sourceAuthority: 'ADVISOR_FEEDBACK',
        evidenceReferences: ['recommendation-1'],
        recommendationReference: 'recommendation-1',
        usefulnessFeedback: 'INDEPENDENT',
        attributionState: 'INDEPENDENT',
        occurredAt: '2026-08-03T10:00:00Z',
        recordedAt: '2026-08-03T10:00:00Z',
      },
    ],
    recentRecommendations: [{
      recommendationReference: 'recommendation-1',
      recommendationClass: 'CONFIRM_PAYMENT',
      sourceAuthority: 'CARTERA070',
      evidenceReferences: ['recommendation-1'],
      occurredAt: '2026-08-02T10:00:00Z',
      attributionState: 'ACTION_CONFIRMED',
    }],
  }));
  assert.equal(proof.recommendations[0].feedback, 'INDEPENDENT');
  assert.equal(proof.recommendations[0].causalCreditClaimed, false);
});
