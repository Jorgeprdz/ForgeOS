import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CARTERA_070_ACTION_CLASSES,
  createCartera070RelationalActivationProjection,
} from '../platform/experience-engine/cartera-070a-relational-activation-projection.js';

const boundaries = {
  automaticContactExecution: false,
  automaticMessageSend: false,
  automaticTaskCreation: false,
  automaticCalendarCreation: false,
  automaticOpportunityCreation: false,
  referralRequestExecution: false,
  finalNbaPriorityTruth: false,
  variableRewardOptimization: false,
  artificialActivityInflation: false,
  advisorConfirmationRequired: true,
};

function card(overrides = {}) {
  return {
    actionReference: 'RELATIONAL_ACTION:abc',
    actionClass: 'CONFIRM_PAYMENT',
    actionLabel: 'Confirm Payment',
    personReference: 'PERSON:1',
    displayName: 'Ana',
    policyReference: 'POLICY:1',
    sourceSignalReference: 'SIGNAL:1',
    sourceAuthority: 'PAYMENT_OBLIGATION',
    truthClass: 'DETECTED_EVIDENCE',
    horizon: 'CONFIRMATION_REQUIRED',
    eventDate: '2026-08-01',
    whyThisPerson: 'Existe una obligación vinculada.',
    whyNow: 'Hay evidencia pendiente.',
    uncertainty: 'La evidencia no confirma pago.',
    smallestUsefulAction: 'Revisar la evidencia.',
    advisorMustConfirm: 'Confirmar póliza, monto y periodo.',
    estimatedMinutes: 10,
    evidence: [{ reference: 'OBLIGATION:1', authority: 'PAYMENT_OBLIGATION', truthClass: 'DETECTED_EVIDENCE' }],
    actionState: 'ADVISOR_REVIEW_REQUIRED',
    nbaAuthorizationState: 'NOT_CONNECTED',
    contactExecuted: false,
    messageSent: false,
    taskCreated: false,
    calendarEventCreated: false,
    opportunityCreated: false,
    referralRequested: false,
    finalNbaPriority: false,
    variableRewardUsed: false,
    artificialActivityCreated: false,
    ...overrides,
  };
}

test('070A exposes all ten roadmap action classes and a bounded capacity deck', () => {
  assert.equal(CARTERA_070_ACTION_CLASSES.length, 10);
  const projection = createCartera070RelationalActivationProjection({
    asOfDate: '2026-08-01',
    availableMinutes: 60,
    maxCards: 4,
    selectionMode: 'CAPACITY_FIT_DISPLAY_ORDER_NOT_FINAL_PRIORITY',
    nbaAuthorityState: 'NOT_CONNECTED',
    summary: { totalCandidates: 7 },
    items: [card()],
    boundaries,
    projectionAuthority: 'CARTERA070_RELATIONAL_ACTIVATION_READ_MODEL',
    readOnly: true,
  });
  assert.equal(projection.items.length, 1);
  assert.equal(projection.summary.selectedMinutes, 10);
  assert.equal(projection.summary.capacityRemaining, 50);
  assert.equal(projection.items[0].finalNbaPriority, false);
});

test('070A blocks execution, artificial activity and engagement manipulation', () => {
  for (const effect of [
    ['contactExecuted', true],
    ['messageSent', true],
    ['taskCreated', true],
    ['calendarEventCreated', true],
    ['opportunityCreated', true],
    ['referralRequested', true],
    ['finalNbaPriority', true],
    ['variableRewardUsed', true],
    ['artificialActivityCreated', true],
  ]) {
    assert.throws(() => createCartera070RelationalActivationProjection({
      asOfDate: '2026-08-01',
      availableMinutes: 60,
      maxCards: 4,
      selectionMode: 'CAPACITY_FIT_DISPLAY_ORDER_NOT_FINAL_PRIORITY',
      nbaAuthorityState: 'NOT_CONNECTED',
      items: [card({ [effect[0]]: effect[1] })],
      boundaries,
      projectionAuthority: 'CARTERA070_RELATIONAL_ACTIVATION_READ_MODEL',
      readOnly: true,
    }), /CARTERA070_AUTOMATION_OR_MANIPULATION_BLOCKED/);
  }
});
