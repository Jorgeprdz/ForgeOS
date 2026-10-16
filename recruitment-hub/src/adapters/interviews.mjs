import { evaluateInterviewFlow } from '../generated/forge-recruitment.mjs';
import { scope, opaque, occurred, related, context, normalizeNeutralProvenance } from '../evidence/neutral-provenance.mjs';
const MAP = Object.freeze({ initial:'INITIAL_INTERVIEW', selection:'SELECTION_INTERVIEW', career:'CAREER_INTERVIEW', additional:'ADDITIONAL_INTERVIEW' });
const SEQUENCE = Object.values(MAP);
const normalize = value => {
  if (value == null || value === '') return 'UNKNOWN';
  const key = typeof value === 'string' ? value.trim().toLowerCase() : '';
  return Object.hasOwn(MAP, key) ? MAP[key] : 'NOT_MODELED';
};
export function adaptInterview(options = {}) {
  const { workspaceId, interview } = options; scope(workspaceId, interview); related(options, interview);
  const id = opaque(interview.id); const current = normalize(interview.type);
  const p = normalizeNeutralProvenance({ ...options, subjectId: id || 'missing-interview' });
  const questionIds = Array.isArray(interview.question_evidence_ids) ? interview.question_evidence_ids.map(opaque).filter(Boolean) : [];
  const recommendation = ['ADVANCE','WATCH','COACH','REJECT'].includes(interview.human_recommendation) ? interview.human_recommendation : null;
  const completed = Boolean(id && opaque(interview.application_id) && opaque(interview.candidate_id) && p.status === 'VERIFIED' && SEQUENCE.includes(current) && interview.status === 'completed' && occurred(interview.completed_at, options.asOf) && recommendation && questionIds.length);
  const requested = options.requestedStage == null ? null : normalize(options.requestedStage);
  const result = evaluateInterviewFlow({ currentStage: current, requestedTransition: requested,
    provenance: { ...p.sourceEvidence, humanReviewRequired: true },
    completedStages: completed ? [current] : [],
    interviewEvidence: completed ? [{ interviewEvidenceId: id, interviewId: id, phase: current, recommendation,
      questionEvidence: questionIds.map(questionEvidenceId => ({ questionEvidenceId })) }] : [] });
  const next = SEQUENCE[SEQUENCE.indexOf(current) + 1] || null;
  result.allowedTransitions = result.allowedTransitions.filter(value => completed && recommendation === 'ADVANCE' && value === next);
  if (!completed || recommendation !== 'ADVANCE' || result.nextRecommendedStage !== next) result.nextRecommendedStage = null;
  if (!completed && SEQUENCE.includes(current)) result.stageStatus = 'NEEDS_EVIDENCE';
  const status = ['UNKNOWN','NOT_MODELED'].includes(current) ? current : completed ? 'READY_FOR_MANAGER_REVIEW' : 'NEEDS_EVIDENCE';
  return context('interview', options, { interviewId: id, applicationId: opaque(interview.application_id) }, result, p, { status, completed });
}
