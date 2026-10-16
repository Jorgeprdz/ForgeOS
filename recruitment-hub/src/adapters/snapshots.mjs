import { buildCandidateManagerSnapshot } from '../generated/forge-recruitment.mjs';
import { scope, opaque, safeUse, context, normalizeNeutralProvenance } from '../evidence/neutral-provenance.mjs';
import { adaptPipeline } from './pipeline.mjs';
import { adaptEvent } from './events.mjs';
export function adaptSnapshot(options = {}) {
  const { workspaceId, candidate, application, events = [] } = options;
  scope(workspaceId, candidate); scope(workspaceId, application);
  if (!Array.isArray(events)) throw new TypeError('EVENT_LIST_REQUIRED');
  const candidateId = opaque(candidate.id); const applicationId = opaque(application.id);
  if (application.candidate_id !== candidateId) throw new TypeError('SUBJECT_MISMATCH');
  const p = normalizeNeutralProvenance({ ...options, subjectId: applicationId || 'missing-application' });
  const pipeline = adaptPipeline(options); const projected = []; const seen = new Map(); let admitted = true;
  for (const event of events) {
    scope(workspaceId, event);
    if (event.application_id !== applicationId || event.candidate_id !== candidateId) throw new TypeError('SUBJECT_MISMATCH');
    const a = adaptEvent({ ...options, event, requestedUse: 'MANAGER_REVIEW' });
    const id = a.source.eventId;
    const value = { eventType: a.result.normalizedEventType, occurredAt: a.result.occurredAt,
      candidateId, applicationId, ...a.provenance.sourceEvidence };
    if (id && seen.has(id)) {
      if (JSON.stringify(seen.get(id)) !== JSON.stringify(value)) throw new TypeError('EVENT_CONFLICT');
      continue;
    }
    if (id) seen.set(id, value);
    if (a.status !== 'READY_FOR_MANAGER_REVIEW') { admitted = false; continue; }
    projected.push(value);
  }
  const historyComplete = Boolean(projected.length && admitted && candidateId && applicationId && p.status === 'VERIFIED');
  const result = buildCandidateManagerSnapshot({ candidate: { candidateId }, application: { applicationId },
    recruitmentEvents: projected, recruitmentPipeline: pipeline.result,
    sourceEvidence: p.sourceEvidence, requestedUse: safeUse(options.requestedUse) });
  if (!historyComplete) { result.unknownSignals.push('adapter_event_history_incomplete'); result.humanReviewRequired = true; }
  const status = result.snapshotStatus === 'BLOCKED' ? 'BLOCKED' : !historyComplete ? 'UNKNOWN' : result.snapshotStatus;
  return context('snapshot', options, { candidateId, applicationId }, result, p, { status, historyComplete });
}
