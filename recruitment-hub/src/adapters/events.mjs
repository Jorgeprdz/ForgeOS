import { captureManagerRecruitmentEvent } from '../generated/forge-recruitment.mjs';
import { scope, opaque, occurred, related, safeUse, context, normalizeNeutralProvenance } from '../evidence/neutral-provenance.mjs';
export function adaptEvent(options = {}) {
  const { workspaceId, event } = options; scope(workspaceId, event); related(options, event);
  const id = opaque(event.id); const p = normalizeNeutralProvenance({ ...options, subjectId: id || 'missing-event' });
  const type = typeof event.event_type === 'string' && /^[A-Z_]{1,64}$/.test(event.event_type) ? event.event_type : null;
  const time = occurred(event.occurred_at, options.asOf);
  const result = captureManagerRecruitmentEvent({ eventType: type,
    candidateId: opaque(event.candidate_id), applicationId: opaque(event.application_id), occurredAt: time,
    eventPayload: {}, sourceEvidence: p.sourceEvidence, requestedUse: safeUse(options.requestedUse) });
  if (result.normalizedEventType === 'NOT_MODELED') result.eventType = null;
  let status = result.captureStatus === 'CAPTURED_FOR_MANAGER_REVIEW' ? 'READY_FOR_MANAGER_REVIEW' : result.captureStatus;
  if (status === 'READY_FOR_MANAGER_REVIEW' && (!id || !time || !result.candidateId || !result.applicationId)) {
    status = 'NEEDS_EVIDENCE'; result.captureStatus = 'NEEDS_EVIDENCE';
    result.missingEvidence.push('event_identity_time_or_subject_missing');
    result.humanReviewRequired = true; result.managerReviewRequired = true;
  }
  return context('event', options, { eventId: id, applicationId: result.applicationId, candidateId: result.candidateId }, result, p, { status });
}
