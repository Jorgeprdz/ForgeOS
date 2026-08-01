import test from 'node:test';
import assert from 'node:assert/strict';
import {
  prepareCartera090RelationshipCapitalReview,
} from '../platform/relationship-intelligence/cartera-090b-relationship-capital-boundary.js';

function item(overrides = {}) {
  return {
    capitalReference: 'CARTERA090:person-1:INTRODUCTION_CONTEXT:abc',
    capitalClass: 'INTRODUCTION_CONTEXT',
    personReference: 'person-1',
    displayName: 'María Pérez',
    whyThisRelationship: 'Existe voluntad confirmada para introducir.',
    whyNow: 'Conviene revisar el contexto humano.',
    uncertainty: 'No existe una persona referida ni autorización de contacto.',
    smallestUsefulAction: 'Revisar el contexto.',
    advisorMustConfirm: 'Confirmar vigencia y consentimiento específico.',
    evidence: [{
      reference: 'memory-1',
      authority: 'RELATIONSHIP_MEMORY',
      truthClass: 'CLIENT_CONFIRMED_WILLINGNESS',
    }],
    clientWillingnessConfirmed: true,
    candidateState: 'REVIEW_REQUIRED',
    immediateSaleDue: false,
    renewalDue: false,
    influenceClaimed: false,
    referralRequestPrepared: false,
    finalPriorityTruth: false,
    ...overrides,
  };
}

test('090B prepares a human review envelope without executing anything', () => {
  const envelope = prepareCartera090RelationshipCapitalReview(item());
  assert.equal(envelope.proposedAction, 'REVIEW_INTRODUCTION_CONTEXT');
  assert.equal(envelope.executionAuthorized, false);
  assert.equal(envelope.relationshipGraphMutated, false);
  assert.equal(envelope.contactExecuted, false);
  assert.equal(envelope.messageSent, false);
  assert.equal(envelope.taskCreated, false);
  assert.equal(envelope.calendarEventCreated, false);
  assert.equal(envelope.opportunityCreated, false);
  assert.equal(envelope.referralRequested, false);
  assert.equal(envelope.finalPriorityTruth, false);
});

test('090B requires confirmed willingness for introduction-related review', () => {
  assert.throws(
    () => prepareCartera090RelationshipCapitalReview(item({
      clientWillingnessConfirmed: false,
    })),
    /CARTERA090_REVIEW_CLIENT_WILLINGNESS_REQUIRED/
  );
});

test('090B blocks manipulation or commercial urgency disguised as context', () => {
  assert.throws(
    () => prepareCartera090RelationshipCapitalReview(item({
      immediateSaleDue: true,
    })),
    /CARTERA090_REVIEW_MANIPULATION_BOUNDARY_INVALID/
  );
});

test('090B supports relationship continuity review without referral willingness', () => {
  const envelope = prepareCartera090RelationshipCapitalReview(item({
    capitalClass: 'RELATIONSHIP_CONTINUITY',
    clientWillingnessConfirmed: false,
  }));
  assert.equal(envelope.proposedAction, 'VERIFY_RELATIONSHIP_CONTEXT');
  assert.equal(envelope.referralRequested, false);
});
