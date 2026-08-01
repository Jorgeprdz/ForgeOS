import test from 'node:test';
import assert from 'node:assert/strict';
import { prepareCartera070ActionReview } from '../platform/experience-engine/cartera-070c-action-review-boundary.js';

test('070C prepares human review with every external effect false', () => {
  const envelope = prepareCartera070ActionReview({
    actionReference: 'ACTION:1',
    actionClass: 'PREPARE_RENEWAL',
    actionState: 'ADVISOR_REVIEW_REQUIRED',
    personReference: 'PERSON:1',
    displayName: 'Ana',
    policyReference: 'POLICY:1',
    smallestUsefulAction: 'Preparar revisión.',
    advisorMustConfirm: 'Confirmar fecha y alcance.',
    estimatedMinutes: 25,
    evidence: [{ reference: 'POLICY:1' }],
  });
  assert.equal(envelope.reviewState, 'PREPARED_FOR_ADVISOR_CONFIRMATION');
  for (const key of [
    'executionAuthorized', 'contactExecuted', 'messageSent', 'taskCreated',
    'calendarEventCreated', 'opportunityCreated', 'referralRequested',
    'finalMessageGenerated', 'finalNbaPriority',
  ]) assert.equal(envelope[key], false);
});
