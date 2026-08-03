import test from 'node:test';
import assert from 'node:assert/strict';

import { deriveNextActionTransition, assertActiveCaseResolved } from '../advisor-os/next-action/next-action-state-model.js';
import { buildAgendaReadModel, selectAgendaSection } from '../advisor-os/next-action/agenda-read-model.js';
import { projectNextActionReceipt } from '../advisor-os/next-action/next-action-continuity-runtime.js';
import { createGoogleCalendarDraft, openGoogleCalendarDraft } from '../advisor-os/next-action/google-calendar-handoff.js';
import { createNextActionAgendaRuntime } from '../advisor-os/next-action/next-action-agenda-runtime.js';
import { SPRINT_03_READ_COMMANDS, SPRINT_03_WRITE_COMMANDS } from '../advisor-os/next-action/sprint-03-command-contract.js';

test('state model separates action completion from commercial outcome', () => {
  const transition = deriveNextActionTransition({
    operation: 'COMPLETE', advisorPartitionKey: 'a1', prospectReference: 'p1', occurredAt: '2026-08-03T01:00:00Z',
  });
  assert.equal(transition.completedActionOnly, true);
  assert.equal(transition.commercialOutcome, null);
  assert.equal(transition.caseResolution, null);
});

test('active cases require an explicit canonical resolution', () => {
  assert.throws(() => assertActiveCaseResolved({ active: true }), /ACTIVE_CASE_WITHOUT_RESOLUTION/);
  assert.equal(assertActiveCaseResolved({ active: true, caseResolution: 'NEXT_ACTION_SCHEDULED' }), true);
});

test('agenda classifies overdue today upcoming waiting and unscheduled without mutation', () => {
  const model = buildAgendaReadModel({
    now: new Date('2026-08-03T12:00:00Z'),
    actions: [
      { id: 'old', prospectReference: 'p1', status: 'OPEN', nextActionAt: '2026-08-01T10:00:00Z' },
      { id: 'today', prospectReference: 'p2', status: 'OPEN', nextActionAt: '2026-08-03T18:00:00Z' },
      { id: 'week', prospectReference: 'p3', status: 'OPEN', nextActionAt: '2026-08-06T18:00:00Z' },
      { id: 'waiting', prospectReference: 'p4', status: 'WAITING', expectedAt: null },
    ],
    activeCases: [
      { prospectReference: 'p1', active: true, caseResolution: 'NEXT_ACTION_SCHEDULED' },
      { prospectReference: 'p5', active: true, caseResolution: null, commercialPriority: 10 },
    ],
  });
  assert.equal(selectAgendaSection(model, 'OVERDUE').count, 1);
  assert.equal(selectAgendaSection(model, 'TODAY').count, 1);
  assert.equal(selectAgendaSection(model, 'UPCOMING_7_DAYS').count, 1);
  assert.equal(selectAgendaSection(model, 'WAITING').count, 1);
  assert.equal(selectAgendaSection(model, 'UNSCHEDULED_ACTIVE_CASES').items[0].prospectReference, 'p5');
  assert.equal(model.diagnostics.silentOverdueRollover, false);
});

test('continuity projects one receipt into timeline pipeline home activity and notification input', () => {
  const projected = projectNextActionReceipt({
    operation: 'RESCHEDULE', receiptId: 'm1', advisorPartitionKey: 'a1', prospectReference: 'p1', occurredAt: '2026-08-03T01:00:00Z', nextActionAt: '2026-08-04T18:00:00Z',
  });
  assert.equal(projected.timeline.eventType, 'ACTION_RESCHEDULED');
  assert.equal(projected.home.attentionRequired, true);
  assert.equal(projected.notificationInput.sendAuthorized, false);
});

test('calendar handoff never claims the event was saved', () => {
  const draft = createGoogleCalendarDraft({ title: 'Seguimiento', startAt: '2026-08-04T18:00:00Z', endAt: '2026-08-04T18:30:00Z' });
  assert.equal(draft.eventSaved, 'UNKNOWN');
  const result = openGoogleCalendarDraft(draft, { opener: () => ({}) });
  assert.equal(result.status, 'HANDOFF_OPENED');
  assert.equal(result.eventSaved, 'UNKNOWN');
});

test('runtime delegates writes to canonical authorities and emits projections', async () => {
  const received = [];
  const runtime = createNextActionAgendaRuntime({
    advisorPartitionKey: 'a1',
    dueActionRuntime: { async execute(input) { received.push(input); return { localCommitted: true, mutation: { mutationId: 'm1', syncState: 'LOCAL_PENDING' } }; } },
    continuityPublisher: { publishReceipt(receipt) { return { timeline: { receiptId: receipt.receiptId } }; } },
    clock: () => new Date('2026-08-03T01:00:00Z'),
  });
  const result = await runtime.execute({ operation: 'RESCHEDULE', prospectReference: 'p1', approvedDisplayName: 'Mariana', nextActionType: 'FOLLOW_UP', nextActionAt: '2026-08-04T18:00:00Z' });
  assert.equal(result.ok, true);
  assert.equal(received[0].operation, 'RESCHEDULE');
  assert.equal(result.receipt.receiptId, 'm1');
  assert.equal(runtime.diagnostics().directDatabaseWriteAllowed, false);
});

test('case operations fail closed without canonical case authority', async () => {
  const runtime = createNextActionAgendaRuntime({ advisorPartitionKey: 'a1', dueActionRuntime: { execute: async () => ({}) } });
  const result = await runtime.execute({ operation: 'MARK_WAITING', prospectReference: 'p1', waitingFor: 'Respuesta del cliente' });
  assert.deepEqual(result, { ok: false, reason: 'CASE_AUTHORITY_NOT_REGISTERED' });
});

test('Command OS contract exposes immediate reads and confirmation-gated writes', () => {
  assert.equal(SPRINT_03_READ_COMMANDS.every(command => command.intent === 'READ'), true);
  assert.equal(SPRINT_03_WRITE_COMMANDS.every(command => command.intent === 'WRITE' && command.requiresConfirmation), true);
});
