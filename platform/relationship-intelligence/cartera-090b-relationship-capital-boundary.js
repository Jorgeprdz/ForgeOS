const ALLOWED_CLASSES = new Set([
  'RELATIONSHIP_CONTINUITY',
  'INTRODUCTION_CONTEXT',
  'CENTER_OF_INFLUENCE_CONTEXT',
  'PROFESSIONAL_NETWORK_CONTEXT',
]);

const INTRODUCTION_CLASSES = new Set([
  'INTRODUCTION_CONTEXT',
  'CENTER_OF_INFLUENCE_CONTEXT',
]);

function fail(code) {
  const error = new Error(code);
  error.code = code;
  throw error;
}

function requiredText(value, code) {
  const normalized = typeof value === 'string' ? value.trim() : '';
  if (!normalized) fail(code);
  return normalized;
}

function reviewAction(capitalClass) {
  if (capitalClass === 'INTRODUCTION_CONTEXT') return 'REVIEW_INTRODUCTION_CONTEXT';
  if (capitalClass === 'CENTER_OF_INFLUENCE_CONTEXT') return 'PREPARE_RELATIONSHIP_REVIEW';
  if (capitalClass === 'PROFESSIONAL_NETWORK_CONTEXT') return 'REVIEW_PROFESSIONAL_CONTEXT';
  return 'VERIFY_RELATIONSHIP_CONTEXT';
}

export function prepareCartera090RelationshipCapitalReview(item = {}) {
  const capitalClass = requiredText(
    item.capitalClass,
    'CARTERA090_REVIEW_CAPITAL_CLASS_REQUIRED'
  ).toUpperCase();
  if (!ALLOWED_CLASSES.has(capitalClass)) fail('CARTERA090_REVIEW_CAPITAL_CLASS_INVALID');
  if (item.candidateState !== 'REVIEW_REQUIRED') fail('CARTERA090_REVIEW_STATE_REQUIRED');
  if (!Array.isArray(item.evidence) || item.evidence.length < 1) {
    fail('CARTERA090_REVIEW_EVIDENCE_REQUIRED');
  }
  if (INTRODUCTION_CLASSES.has(capitalClass) && item.clientWillingnessConfirmed !== true) {
    fail('CARTERA090_REVIEW_CLIENT_WILLINGNESS_REQUIRED');
  }
  if (
    item.immediateSaleDue !== false
    || item.renewalDue !== false
    || item.influenceClaimed !== false
    || item.referralRequestPrepared !== false
    || item.finalPriorityTruth !== false
  ) {
    fail('CARTERA090_REVIEW_MANIPULATION_BOUNDARY_INVALID');
  }

  const capitalReference = requiredText(
    item.capitalReference,
    'CARTERA090_REVIEW_REFERENCE_REQUIRED'
  );

  return Object.freeze({
    reviewReference: `${capitalReference}:ADVISOR_REVIEW`,
    capitalReference,
    capitalClass,
    personReference: requiredText(
      item.personReference,
      'CARTERA090_REVIEW_PERSON_REQUIRED'
    ),
    displayName: requiredText(item.displayName, 'CARTERA090_REVIEW_NAME_REQUIRED'),
    proposedAction: reviewAction(capitalClass),
    whyThisRelationship: requiredText(
      item.whyThisRelationship,
      'CARTERA090_REVIEW_WHY_RELATIONSHIP_REQUIRED'
    ),
    whyNow: requiredText(item.whyNow, 'CARTERA090_REVIEW_WHY_NOW_REQUIRED'),
    uncertainty: requiredText(
      item.uncertainty,
      'CARTERA090_REVIEW_UNCERTAINTY_REQUIRED'
    ),
    smallestUsefulAction: requiredText(
      item.smallestUsefulAction,
      'CARTERA090_REVIEW_MINIMUM_ACTION_REQUIRED'
    ),
    advisorMustConfirm: requiredText(
      item.advisorMustConfirm,
      'CARTERA090_REVIEW_CONFIRMATION_REQUIRED'
    ),
    evidence: Object.freeze(item.evidence.map(entry => Object.freeze({ ...entry }))),
    eligible: true,
    advisorConfirmationRequired: true,
    executionAuthorized: false,
    relationshipGraphMutated: false,
    contactExecuted: false,
    messageSent: false,
    taskCreated: false,
    calendarEventCreated: false,
    opportunityCreated: false,
    referralRequested: false,
    finalMessageGenerated: false,
    finalPriorityTruth: false,
  });
}
