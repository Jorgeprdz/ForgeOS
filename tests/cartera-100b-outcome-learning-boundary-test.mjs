import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createCartera100AcceptedRecommendationObservations,
  createCartera100AdvisorFeedbackObservation,
  createCartera100CompletedActionObservation,
  createCartera100GenericProofObservation,
} from '../platform/productivity/cartera-100b-outcome-learning-boundary.js';

test('100B records accepted recommendation as observable action without causal credit', () => {
  const observations = createCartera100AcceptedRecommendationObservations({
    recommendationReference: 'growth-1',
    recommendationClass: 'SECOND_POLICY_REVIEW',
    sourceAuthority: 'CARTERA060_RELATIONSHIP_GROWTH',
    evidenceReferences: ['evidence-1'],
    occurredAt: '2026-08-01T12:00:00Z',
  });
  assert.equal(observations.length, 2);
  assert.equal(observations[0].metricKey, 'ACCEPTED_RECOMMENDATIONS');
  assert.equal(observations[0].attributionState, 'ACTION_CONFIRMED');
  assert.equal(observations[0].metadata.causalOutcomeClaimed, false);
  assert.equal(observations[1].metricKey, 'SECOND_POLICY_REVIEWS');
  assert.equal(observations[1].metadata.opportunityCreated, false);
});

test('100B records completion only with an observable state transition', () => {
  const observation = createCartera100CompletedActionObservation({
    actionReference: 'action-1',
    actionClass: 'CONFIRM_PAYMENT',
    sourceAuthority: 'CARTERA070_RELATIONAL_ACTIVATION',
    evidenceReferences: ['evidence-1'],
    stateTransitionReference: 'payment-event-1',
    occurredAt: '2026-08-01T13:00:00Z',
  });
  assert.equal(observation.metricKey, 'COMPLETED_MINIMUM_USEFUL_ACTIONS');
  assert.equal(observation.attributionState, 'STATE_TRANSITION');
  assert.ok(observation.evidenceReferences.includes('payment-event-1'));
  assert.equal(observation.metadata.contactVolumeOptimization, false);

  assert.throws(
    () => createCartera100CompletedActionObservation({
      actionReference: 'action-1',
      actionClass: 'CONFIRM_PAYMENT',
      sourceAuthority: 'CARTERA070_RELATIONAL_ACTIVATION',
      evidenceReferences: ['evidence-1'],
    }),
    /CARTERA100_STATE_TRANSITION_REFERENCE_REQUIRED/
  );
});

test('100B accepts only explicit useful, not useful or independent feedback', () => {
  for (const feedback of ['USEFUL', 'NOT_USEFUL', 'INDEPENDENT']) {
    const observation = createCartera100AdvisorFeedbackObservation({
      recommendationReference: 'recommendation-1',
      recommendationClass: 'PREPARE_RENEWAL',
      feedback,
      evidenceReferences: ['recommendation-1'],
      occurredAt: '2026-08-01T14:00:00Z',
    });
    assert.equal(observation.usefulnessFeedback, feedback);
    assert.equal(observation.metadata.permissionInferredFromSilence, false);
    assert.equal(observation.metadata.automaticOptimization, false);
    assert.equal(observation.metadata.causalCreditClaimed, false);
  }

  assert.throws(
    () => createCartera100AdvisorFeedbackObservation({
      recommendationReference: 'recommendation-1',
      recommendationClass: 'PREPARE_RENEWAL',
      feedback: 'SILENCE_MEANS_YES',
      evidenceReferences: ['recommendation-1'],
    }),
    /CARTERA100_FEEDBACK_INVALID/
  );
});

test('100B independent feedback explicitly rejects Forge attribution', () => {
  const observation = createCartera100AdvisorFeedbackObservation({
    recommendationReference: 'recommendation-2',
    recommendationClass: 'CENTER_OF_INFLUENCE_CONTEXT',
    feedback: 'INDEPENDENT',
    evidenceReferences: ['recommendation-2'],
    occurredAt: '2026-08-01T15:00:00Z',
  });
  assert.equal(observation.metricKey, 'INDEPENDENT_OUTCOME_FEEDBACK');
  assert.equal(observation.attributionState, 'INDEPENDENT');
  assert.equal(observation.metadata.causalCreditClaimed, false);
});

test('100B generic proof stays bounded to operational evidence', () => {
  const observation = createCartera100GenericProofObservation({
    metricKey: 'WORK_MINUTES_AVOIDED',
    metricCategory: 'WORK_REDUCTION',
    quantity: 90,
    unit: 'MINUTES',
    metricState: 'KNOWN',
    sourceAuthority: 'POLICY_INTAKE',
    sourceRecordReference: 'import-1',
    evidenceReferences: ['import-1'],
    occurredAt: '2026-08-01T16:00:00Z',
    idempotencyKey: 'proof-import-1',
  });
  assert.equal(observation.quantity, 90);
  assert.equal(observation.metadata.humanPerformanceJudgment, false);
  assert.equal(observation.metadata.automaticContact, false);
  assert.equal(observation.metadata.automaticOpportunity, false);
});

test('100B rejects unsupported category, negative quantity and evidence-free learning', () => {
  assert.throws(
    () => createCartera100GenericProofObservation({
      metricKey: 'WORK_MINUTES_AVOIDED',
      metricCategory: 'HUMAN_VALUE',
      quantity: 1,
      unit: 'COUNT',
      sourceAuthority: 'TEST',
      sourceRecordReference: 'test-1',
      evidenceReferences: ['test-1'],
      idempotencyKey: 'test-1',
    }),
    /CARTERA100_GENERIC_METRIC_CATEGORY_INVALID/
  );
  assert.throws(
    () => createCartera100GenericProofObservation({
      metricKey: 'WORK_MINUTES_AVOIDED',
      metricCategory: 'WORK_REDUCTION',
      quantity: -1,
      unit: 'MINUTES',
      sourceAuthority: 'TEST',
      sourceRecordReference: 'test-2',
      evidenceReferences: ['test-2'],
      idempotencyKey: 'test-2',
    }),
    /CARTERA100_GENERIC_QUANTITY_INVALID/
  );
  assert.throws(
    () => createCartera100AdvisorFeedbackObservation({
      recommendationReference: 'recommendation-3',
      recommendationClass: 'REVIEW',
      feedback: 'USEFUL',
      evidenceReferences: [],
    }),
    /CARTERA100_LEARNING_EVIDENCE_REQUIRED/
  );
});
