import { evaluateRecruitmentPipeline } from '../generated/forge-recruitment.mjs';
import { scope, opaque, context, normalizeNeutralProvenance } from '../evidence/neutral-provenance.mjs';
const MAP = Object.freeze({ prospect:'PROSPECT', candidate:'CANDIDATE', application_started:'APPLICATION_STARTED', application_submitted:'APPLICATION_SUBMITTED', interviewing:'INTERVIEWING', interview_flow_active:'INTERVIEW_FLOW_ACTIVE', manager_review:'MANAGER_REVIEW' });
const EXTERNAL = new Set(['converted','onboarding','rejected','archived','selected','precontract','withdrawn','on_hold']);
function stage(value) {
  if (value === undefined || value === null || value === '') return { source: null, mapped: 'UNKNOWN' };
  const key = typeof value === 'string' ? value.trim().toLowerCase() : '';
  const mapped = Object.hasOwn(MAP, key) ? MAP[key] : null;
  return { source: mapped || EXTERNAL.has(key) ? value : null, mapped: mapped || 'NOT_MODELED' };
}
export function adaptPipeline(options = {}) {
  const { workspaceId, application } = options; scope(workspaceId, application);
  if (options.candidate !== undefined) {
    scope(workspaceId, options.candidate);
    if (application.candidate_id !== opaque(options.candidate.id)) throw new TypeError('SUBJECT_MISMATCH');
  }
  const id = opaque(application.id); const s = stage(application.stage);
  const p = normalizeNeutralProvenance({ ...options, subjectId: id || 'missing-application' });
  const requested = options.requestedState == null ? null : stage(options.requestedState).mapped;
  const result = evaluateRecruitmentPipeline({ currentPipelineState: s.mapped,
    application: { applicationId: id }, provenance: { ...p.sourceEvidence, humanReviewRequired: true },
    requestedTransition: requested });
  if (s.mapped === 'UNKNOWN' || s.mapped === 'NOT_MODELED' || p.status !== 'VERIFIED' || !id) {
    result.nextRecommendedState = null; result.allowedTransitions = [];
  }
  const status = ['UNKNOWN','NOT_MODELED'].includes(s.mapped) ? s.mapped : p.status === 'VERIFIED' && id ? 'READY_FOR_MANAGER_REVIEW' : p.status === 'VERIFIED' ? 'NEEDS_EVIDENCE' : p.status;
  return context('pipeline', options, { applicationId: id, stage: s.source }, result, p, { status });
}
