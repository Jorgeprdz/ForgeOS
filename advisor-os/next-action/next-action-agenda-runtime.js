import { deriveNextActionTransition } from './next-action-state-model.js';
import { buildAgendaReadModel } from './agenda-read-model.js';
import { createContinuityPublisher } from './next-action-continuity-runtime.js';
import { createGoogleCalendarDraft, openGoogleCalendarDraft } from './google-calendar-handoff.js';

const DUE_ACTION_OPERATIONS = new Set(['SCHEDULE', 'RESCHEDULE', 'COMPLETE', 'CANCEL']);

export function createNextActionAgendaRuntime({
  advisorPartitionKey,
  dueActionRuntime,
  caseAuthority = null,
  continuityPublisher = createContinuityPublisher(),
  clock = () => new Date(),
} = {}) {
  const advisor = String(advisorPartitionKey || '').trim();
  if (!advisor) throw new TypeError('ADVISOR_PARTITION_REQUIRED');
  if (!dueActionRuntime || typeof dueActionRuntime.execute !== 'function') {
    throw new TypeError('DUE_ACTION_RUNTIME_REQUIRED');
  }

  async function execute(input = {}) {
    const transition = deriveNextActionTransition({
      ...input,
      advisorPartitionKey: advisor,
      occurredAt: input.occurredAt || clock().toISOString(),
    });

    let authorityResult;
    if (DUE_ACTION_OPERATIONS.has(transition.operation)) {
      authorityResult = await dueActionRuntime.execute({
        operation: transition.operation,
        prospectReference: transition.prospectReference,
        approvedDisplayName: input.approvedDisplayName,
        nextActionType: transition.nextActionType,
        nextActionAt: transition.nextActionAt,
        reason: transition.reason || transition.cancellationReason || null,
      });
    } else {
      if (!caseAuthority || typeof caseAuthority.execute !== 'function') {
        return Object.freeze({ ok: false, reason: 'CASE_AUTHORITY_NOT_REGISTERED' });
      }
      authorityResult = await caseAuthority.execute(transition);
    }

    const receipt = Object.freeze({
      receiptId: authorityResult?.mutation?.mutationId || authorityResult?.receiptId,
      mutationId: authorityResult?.mutation?.mutationId || authorityResult?.receiptId,
      advisorPartitionKey: advisor,
      prospectReference: transition.prospectReference,
      personReference: input.personReference || null,
      occurredAt: transition.occurredAt,
      operation: transition.operation,
      nextActionAt: transition.nextActionAt || null,
      caseResolution: transition.caseResolution || null,
      localCommitted: authorityResult?.localCommitted === true,
      syncState: authorityResult?.mutation?.syncState || authorityResult?.syncState || null,
    });

    const projections = continuityPublisher.publishReceipt(receipt);
    return Object.freeze({ ok: true, transition, receipt, projections });
  }

  return Object.freeze({
    execute,
    buildAgenda(input = {}) {
      return buildAgendaReadModel({ ...input, now: input.now || clock() });
    },
    createCalendarDraft: createGoogleCalendarDraft,
    openCalendarDraft: openGoogleCalendarDraft,
    diagnostics: () => Object.freeze({
      canonicalDueActionAuthority: 'NFAST_09',
      agendaProjectionOnly: true,
      silentOverdueRollover: false,
      calendarSavedClaimAllowed: false,
      directDatabaseWriteAllowed: false,
    }),
  });
}
