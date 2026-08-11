const FEEDBACK = Object.freeze([
  'USEFUL',
  'NOT_USEFUL',
  'INDEPENDENT',
]);

const ATTRIBUTION_STATES = Object.freeze([
  'NONE',
  'UNKNOWN',
  'TEMPORAL',
  'ACTION_CONFIRMED',
  'STATE_TRANSITION',
  'ADVISOR_REPORTED_RELATED',
  'INDEPENDENT',
]);

function fail(code) {
  const error = new Error(code);
  error.code = code;
  throw error;
}

function requiredText(value, code, maxLength = 240) {
  const normalized = typeof value === 'string' ? value.trim() : '';
  if (!normalized) fail(code);
  return normalized.slice(0, maxLength);
}

function optionalText(value, maxLength = 240) {
  if (value === null || value === undefined || value === '') return null;
  return String(value).trim().slice(0, maxLength) || null;
}

function iso(value, code) {
  const parsed = new Date(value);
  if (!value || Number.isNaN(parsed.getTime())) fail(code);
  return parsed.toISOString();
}

function references(value) {
  if (!Array.isArray(value) || value.length < 1 || value.length > 20) {
    fail('CARTERA100_LEARNING_EVIDENCE_REQUIRED');
  }
  const normalized = value.map(item => requiredText(item, 'CARTERA100_LEARNING_EVIDENCE_INVALID'));
  if (new Set(normalized).size !== normalized.length) fail('CARTERA100_LEARNING_EVIDENCE_DUPLICATED');
  return Object.freeze(normalized);
}

function baseObservation({
  metricKey,
  metricCategory,
  sourceAuthority,
  sourceRecordReference,
  recommendationReference = null,
  recommendationClass = null,
  evidenceReferences,
  occurredAt,
  idempotencyKey,
  attributionState = 'NONE',
  usefulnessFeedback = 'UNSET',
  metadata = {},
}) {
  if (!ATTRIBUTION_STATES.includes(attributionState)) fail('CARTERA100_ATTRIBUTION_STATE_INVALID');
  return Object.freeze({
    metricKey,
    metricCategory,
    quantity: 1,
    unit: 'COUNT',
    metricState: 'KNOWN',
    sourceAuthority: requiredText(sourceAuthority, 'CARTERA100_SOURCE_AUTHORITY_REQUIRED', 120).toUpperCase(),
    sourceRecordReference: requiredText(sourceRecordReference, 'CARTERA100_SOURCE_RECORD_REFERENCE_REQUIRED'),
    recommendationReference: optionalText(recommendationReference),
    outcomeReference: null,
    attributionState,
    usefulnessFeedback,
    evidenceReferences: references(evidenceReferences),
    occurredAt: iso(occurredAt, 'CARTERA100_OCCURRED_AT_INVALID'),
    idempotencyKey: requiredText(idempotencyKey, 'CARTERA100_IDEMPOTENCY_KEY_REQUIRED', 160),
    metadata: Object.freeze({ ...metadata, recommendationClass }),
  });
}

export function createCartera100AcceptedRecommendationObservations({
  recommendationReference,
  recommendationClass,
  sourceAuthority,
  evidenceReferences,
  occurredAt = new Date().toISOString(),
} = {}) {
  const reference = requiredText(
    recommendationReference,
    'CARTERA100_RECOMMENDATION_REFERENCE_REQUIRED'
  );
  const classValue = requiredText(
    recommendationClass,
    'CARTERA100_RECOMMENDATION_CLASS_REQUIRED',
    120
  ).toUpperCase();
  const source = requiredText(sourceAuthority, 'CARTERA100_SOURCE_AUTHORITY_REQUIRED', 120).toUpperCase();
  const evidence = references(evidenceReferences);
  const observations = [baseObservation({
    metricKey: 'ACCEPTED_RECOMMENDATIONS',
    metricCategory: 'PRODUCTIVITY',
    sourceAuthority: source,
    sourceRecordReference: reference,
    recommendationReference: reference,
    recommendationClass: classValue,
    evidenceReferences: evidence,
    occurredAt,
    idempotencyKey: `CARTERA100:ACCEPTED:${reference}`.slice(0, 160),
    attributionState: 'ACTION_CONFIRMED',
    metadata: {
      humanActionObserved: true,
      executionAuthorized: false,
      causalOutcomeClaimed: false,
    },
  })];

  if (classValue === 'SECOND_POLICY_REVIEW') {
    observations.push(baseObservation({
      metricKey: 'SECOND_POLICY_REVIEWS',
      metricCategory: 'GROWTH',
      sourceAuthority: source,
      sourceRecordReference: reference,
      recommendationReference: reference,
      recommendationClass: classValue,
      evidenceReferences: evidence,
      occurredAt,
      idempotencyKey: `CARTERA100:SECOND_POLICY_REVIEW:${reference}`.slice(0, 160),
      attributionState: 'ACTION_CONFIRMED',
      metadata: {
        reviewPrepared: true,
        opportunityCreated: false,
        clientIntentInferred: false,
        causalOutcomeClaimed: false,
      },
    }));
  }

  return Object.freeze(observations);
}

export function createCartera100CompletedActionObservation({
  actionReference,
  actionClass,
  sourceAuthority,
  evidenceReferences,
  occurredAt = new Date().toISOString(),
  stateTransitionReference,
} = {}) {
  const reference = requiredText(actionReference, 'CARTERA100_ACTION_REFERENCE_REQUIRED');
  const transition = requiredText(
    stateTransitionReference,
    'CARTERA100_STATE_TRANSITION_REFERENCE_REQUIRED'
  );
  return baseObservation({
    metricKey: 'COMPLETED_MINIMUM_USEFUL_ACTIONS',
    metricCategory: 'PRODUCTIVITY',
    sourceAuthority,
    sourceRecordReference: transition,
    recommendationReference: reference,
    recommendationClass: requiredText(actionClass, 'CARTERA100_ACTION_CLASS_REQUIRED', 120).toUpperCase(),
    evidenceReferences: [...references(evidenceReferences), transition],
    occurredAt,
    idempotencyKey: `CARTERA100:COMPLETED:${reference}:${transition}`.slice(0, 160),
    attributionState: 'STATE_TRANSITION',
    metadata: {
      stateTransitionObserved: true,
      causalOutcomeClaimed: false,
      contactVolumeOptimization: false,
    },
  });
}

export function createCartera100AdvisorFeedbackObservation({
  recommendationReference,
  recommendationClass = 'UNCLASSIFIED',
  feedback,
  evidenceReferences,
  occurredAt = new Date().toISOString(),
} = {}) {
  const feedbackValue = requiredText(feedback, 'CARTERA100_FEEDBACK_REQUIRED', 40).toUpperCase();
  if (!FEEDBACK.includes(feedbackValue)) fail('CARTERA100_FEEDBACK_INVALID');
  const reference = requiredText(
    recommendationReference,
    'CARTERA100_RECOMMENDATION_REFERENCE_REQUIRED'
  );
  const metricMap = {
    USEFUL: 'USEFUL_RECOMMENDATION_FEEDBACK',
    NOT_USEFUL: 'NOT_USEFUL_RECOMMENDATION_FEEDBACK',
    INDEPENDENT: 'INDEPENDENT_OUTCOME_FEEDBACK',
  };
  const attributionMap = {
    USEFUL: 'ADVISOR_REPORTED_RELATED',
    NOT_USEFUL: 'UNKNOWN',
    INDEPENDENT: 'INDEPENDENT',
  };

  return baseObservation({
    metricKey: metricMap[feedbackValue],
    metricCategory: 'LEARNING',
    sourceAuthority: 'ADVISOR_FEEDBACK',
    sourceRecordReference: reference,
    recommendationReference: reference,
    recommendationClass: requiredText(recommendationClass, 'CARTERA100_RECOMMENDATION_CLASS_REQUIRED', 120).toUpperCase(),
    evidenceReferences,
    occurredAt,
    idempotencyKey: `CARTERA100:FEEDBACK:${reference}:${feedbackValue}`.slice(0, 160),
    attributionState: attributionMap[feedbackValue],
    usefulnessFeedback: feedbackValue,
    metadata: {
      explicitAdvisorFeedback: true,
      permissionInferredFromSilence: false,
      humanPerformanceJudgment: false,
      automaticOptimization: false,
      causalCreditClaimed: false,
    },
  });
}

export function createCartera100GenericProofObservation(input = {}) {
  const allowedCategories = new Set([
    'WORK_REDUCTION',
    'INCOME_PROTECTION',
    'GROWTH',
    'PRODUCTIVITY',
  ]);
  const category = requiredText(input.metricCategory, 'CARTERA100_METRIC_CATEGORY_REQUIRED', 60).toUpperCase();
  if (!allowedCategories.has(category)) fail('CARTERA100_GENERIC_METRIC_CATEGORY_INVALID');
  const quantity = Number(input.quantity);
  if (!Number.isFinite(quantity) || quantity < 0) fail('CARTERA100_GENERIC_QUANTITY_INVALID');
  const state = requiredText(input.metricState || 'KNOWN', 'CARTERA100_METRIC_STATE_REQUIRED', 40).toUpperCase();
  if (!['KNOWN', 'ZERO', 'STALE', 'INCOMPLETE', 'CONFLICTING'].includes(state)) {
    fail('CARTERA100_GENERIC_METRIC_STATE_INVALID');
  }
  const evidence = references(input.evidenceReferences);
  if (state === 'ZERO' && quantity !== 0) fail('CARTERA100_ZERO_QUANTITY_INVALID');

  return Object.freeze({
    metricKey: requiredText(input.metricKey, 'CARTERA100_METRIC_KEY_REQUIRED', 100).toUpperCase(),
    metricCategory: category,
    quantity,
    unit: requiredText(input.unit, 'CARTERA100_UNIT_REQUIRED', 30).toUpperCase(),
    metricState: state,
    currency: optionalText(input.currency, 10)?.toUpperCase() || null,
    sourceAuthority: requiredText(input.sourceAuthority, 'CARTERA100_SOURCE_AUTHORITY_REQUIRED', 120).toUpperCase(),
    sourceRecordReference: requiredText(input.sourceRecordReference, 'CARTERA100_SOURCE_RECORD_REFERENCE_REQUIRED'),
    recommendationReference: optionalText(input.recommendationReference),
    outcomeReference: optionalText(input.outcomeReference),
    attributionState: requiredText(input.attributionState || 'NONE', 'CARTERA100_ATTRIBUTION_STATE_REQUIRED', 40).toUpperCase(),
    usefulnessFeedback: 'UNSET',
    evidenceReferences: evidence,
    occurredAt: iso(input.occurredAt || new Date().toISOString(), 'CARTERA100_OCCURRED_AT_INVALID'),
    idempotencyKey: requiredText(input.idempotencyKey, 'CARTERA100_IDEMPOTENCY_KEY_REQUIRED', 160),
    metadata: Object.freeze({
      ...(input.metadata || {}),
      causalOutcomeClaimed: false,
      humanPerformanceJudgment: false,
      automaticContact: false,
      automaticMessage: false,
      automaticTask: false,
      automaticCalendar: false,
      automaticOpportunity: false,
    }),
  });
}

export const CARTERA_100_FEEDBACK = FEEDBACK;
export const CARTERA_100_ATTRIBUTION_STATES = ATTRIBUTION_STATES;
