import { AppState } from '../../state-manager.js';
import { SupabaseRuntime } from '../../supabase-runtime.js';
import { createPipelineDueActionRuntime } from '../../advisor-os/sales-pipeline/pipeline-due-action-runtime.js';
import { registerWriteAuthority } from './write-preview-engine.js';

const HANDLER_ID = 'person-follow-up-authority';
const DEFAULT_HOUR = 9;
let unregisterAuthority = null;
let runtime = null;
let runtimeAdvisorId = null;

function isoTomorrowAtNine(now = new Date()) {
  const date = new Date(now);
  date.setDate(date.getDate() + 1);
  date.setHours(DEFAULT_HOUR, 0, 0, 0);
  return date.toISOString();
}

function requireText(value, code) {
  const normalized = String(value || '').trim();
  if (!normalized) throw Object.assign(new TypeError(code), { code });
  return normalized;
}

async function resolveTarget({ client, advisorId, personReference }) {
  const { data: person, error: personError } = await client
    .from('commercial_people')
    .select('id,advisor_id,person_reference,display_name,lifecycle_state,archived_at')
    .eq('advisor_id', advisorId)
    .eq('person_reference', personReference)
    .single();

  if (personError || !person) return { ok: false, reason: 'PERSON_NOT_FOUND' };
  if (person.lifecycle_state !== 'CONFIRMED' || person.archived_at) {
    return { ok: false, reason: 'PERSON_NOT_ACTIVE' };
  }

  const { data: links, error: linksError } = await client
    .from('commercial_source_identity_links')
    .select('source_record_reference,source_identity_type,effective_to')
    .eq('advisor_id', advisorId)
    .eq('person_id', person.id)
    .eq('source_identity_type', 'PROSPECT')
    .is('effective_to', null);

  if (linksError) return { ok: false, reason: 'PROSPECT_LINK_READ_FAILED' };
  const references = [...new Set((links || [])
    .map(link => String(link.source_record_reference || '').trim())
    .filter(Boolean))];
  if (references.length === 0) return { ok: false, reason: 'PERSON_HAS_NO_ACTIVE_PROSPECT' };
  if (references.length > 1) {
    return { ok: false, reason: 'PERSON_HAS_MULTIPLE_ACTIVE_PROSPECTS', details: { references } };
  }

  return {
    ok: true,
    personReference: person.person_reference,
    displayName: person.display_name,
    prospectReference: references[0],
  };
}

function authenticatedAdvisorId() {
  const user = AppState.get('user');
  return requireText(user?.id, 'AUTHENTICATED_ADVISOR_REQUIRED');
}

function dueActionRuntime(advisorId) {
  if (runtime && runtimeAdvisorId === advisorId) return runtime;
  runtime?.close?.();
  runtime = createPipelineDueActionRuntime({ advisorPartitionKey: advisorId });
  runtimeAdvisorId = advisorId;
  return runtime;
}

export function createPersonFollowUpAuthority({
  clientProvider = () => SupabaseRuntime.getClient(),
  advisorIdProvider = authenticatedAdvisorId,
  runtimeProvider = dueActionRuntime,
  clock = () => new Date(),
} = {}) {
  return Object.freeze({
    handlerId: HANDLER_ID,
    async prepare({ context }) {
      const advisorId = advisorIdProvider();
      const personReference = requireText(context?.personReference, 'PERSON_REFERENCE_REQUIRED');
      const target = await resolveTarget({
        client: clientProvider(),
        advisorId,
        personReference,
      });
      if (!target.ok) return target;

      const nextActionAt = isoTomorrowAtNine(clock());
      return {
        ok: true,
        summary: `Programar seguimiento con ${target.displayName}`,
        changes: {
          Persona: target.displayName,
          Acción: 'Seguimiento',
          Fecha: nextActionAt,
        },
        payload: {
          advisorId,
          operation: 'SCHEDULE',
          prospectReference: target.prospectReference,
          approvedDisplayName: target.displayName,
          nextActionType: 'FOLLOW_UP',
          nextActionAt,
        },
      };
    },
    async execute({ draft }) {
      const payload = draft?.payload || {};
      const advisorId = advisorIdProvider();
      if (payload.advisorId !== advisorId) {
        return { ok: false, reason: 'ADVISOR_CONTEXT_CHANGED' };
      }

      const result = await runtimeProvider(advisorId).execute({
        operation: payload.operation,
        prospectReference: payload.prospectReference,
        approvedDisplayName: payload.approvedDisplayName,
        nextActionType: payload.nextActionType,
        nextActionAt: payload.nextActionAt,
      });

      return {
        ok: true,
        receiptId: result.mutation.mutationId,
        result: {
          mutationId: result.mutation.mutationId,
          prospectReference: result.record.prospectReference,
          nextActionType: result.record.nextActionType,
          nextActionAt: result.record.nextActionAt,
          localCommitted: result.localCommitted === true,
          syncState: result.mutation.syncState,
        },
      };
    },
  });
}

export function mountPersonFollowUpAuthority(options = {}) {
  if (unregisterAuthority) return;
  const authority = createPersonFollowUpAuthority(options);
  unregisterAuthority = registerWriteAuthority(authority);
}

export async function unmountPersonFollowUpAuthority() {
  unregisterAuthority?.();
  unregisterAuthority = null;
  await runtime?.close?.();
  runtime = null;
  runtimeAdvisorId = null;
}
