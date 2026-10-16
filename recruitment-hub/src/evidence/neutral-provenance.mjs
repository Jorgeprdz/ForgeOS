const OWNERS = new Set(['RECRUITMENT', 'CRM', 'INTERVIEW', 'MANAGER_REVIEW']);
const EVIDENCE_FIELDS = new Set(['workspace_id', 'id', 'subject_id', 'source_owner', 'captured_at', 'original_source_ref', 'verification']);
const VERIFICATION_FIELDS = new Set(['status', 'verified_by', 'verified_at']);
const USES = new Set(['MANAGER_REVIEW', 'RECRUITMENT_PIPELINE_CONTEXT', 'CANDIDATE_TIMELINE_CONTEXT', 'INTERVIEW_CONTEXT', 'PRECONTRACT_REVIEW_CONTEXT', 'CONVERSATION_CONTEXT', 'METRICS_CONTEXT', 'FORECAST_CONTEXT', 'DASHBOARD_CONTEXT', 'TEAM_PATTERN_CONTEXT', 'COACHING_CONTEXT', 'HISTORICAL_ANALYTICS_CONTEXT', 'AUTOMATIC_APPROVAL', 'AUTOMATIC_REJECTION', 'PRECONTRACT_TRUTH', 'ADVISOR_LIFECYCLE_TRUTH', 'HUMAN_RANKING', 'PROMOTION_DECISION', 'PUNISHMENT', 'TERMINATION', 'COMPENSATION', 'PAYOUT', 'REVENUE_TRUTH', 'AUTOMATIC_DECISION', 'HIRING_TRUTH']);

export function opaque(value) {
  return typeof value === 'string' && /^[A-Za-z0-9][A-Za-z0-9_:./-]{0,127}$/.test(value) ? value : null;
}
export function timestamp(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d{3})?Z$/.test(value)) return null;
  const time = Date.parse(value);
  if (!Number.isFinite(time)) return null;
  const canonical = value.includes('.') ? value : value.replace('Z', '.000Z');
  return new Date(time).toISOString() === canonical ? value : null;
}
export function occurred(value, asOf) {
  return timestamp(value) && timestamp(asOf) && Date.parse(value) <= Date.parse(asOf) ? value : null;
}
export function scope(workspaceId, record) {
  if (!opaque(workspaceId)) throw new TypeError('WORKSPACE_REQUIRED');
  if (record === null || typeof record !== 'object' || Array.isArray(record)) throw new TypeError('RECORD_REQUIRED');
  if (record.workspace_id !== workspaceId) throw new TypeError('WORKSPACE_MISMATCH');
}
export function related(options, record) {
  if (options.application !== undefined) {
    scope(options.workspaceId, options.application);
    if (!opaque(options.application.id) || record.application_id !== options.application.id || !opaque(options.application.candidate_id) || record.candidate_id !== options.application.candidate_id) throw new TypeError('SUBJECT_MISMATCH');
  }
  if (options.candidate !== undefined) {
    scope(options.workspaceId, options.candidate);
    if (!opaque(options.candidate.id) || record.candidate_id !== options.candidate.id) throw new TypeError('SUBJECT_MISMATCH');
    if (options.application && options.application.candidate_id !== options.candidate.id) throw new TypeError('SUBJECT_MISMATCH');
  }
}
export function safeUse(value) {
  if (value === undefined || value === null) return 'MANAGER_REVIEW';
  const normalized = typeof value === 'string' ? value.trim().toUpperCase() : '';
  return USES.has(normalized) ? normalized : 'UNSUPPORTED_USE';
}
function freeze(value) {
  if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); }
  return value;
}
export function context(kind, options, source, result, provenance, extra = {}) {
  return freeze({ schemaVersion: 1, adapter: kind, workspace_id: options.workspaceId,
    status: extra.status || (provenance.status === 'VERIFIED' ? 'READY_FOR_MANAGER_REVIEW' : provenance.status),
    source, result, provenance, ...extra, automaticDecisionAllowed: false,
    automaticHiringAllowed: false, automaticRejectionAllowed: false, humanReviewRequired: true,
    createsRecruitmentTruth: false, createsPrecontractTruth: false, createsAdvisorLifecycleTruth: false,
    createsRevenue: false, createsCompensation: false, createsPayoutTruth: false, operationalWrites: [] });
}

export function normalizeNeutralProvenance({ workspaceId, evidence = [], subjectId = null, asOf, maxAgeMs } = {}) {
  if (!opaque(workspaceId)) throw new TypeError('WORKSPACE_REQUIRED');
  if (!Array.isArray(evidence)) throw new TypeError('EVIDENCE_LIST_REQUIRED');
  const selected = []; const seen = new Map();
  for (const row of evidence) {
    scope(workspaceId, row);
    if (Object.keys(row).some(key => !EVIDENCE_FIELDS.has(key))) throw new TypeError('UNSUPPORTED_EVIDENCE_FIELDS');
    const v = row.verification ?? {};
    if (!v || typeof v !== 'object' || Array.isArray(v) || Object.keys(v).some(key => !VERIFICATION_FIELDS.has(key))) throw new TypeError('UNSUPPORTED_EVIDENCE_FIELDS');
    const item = { id: opaque(row.id), subject_id: opaque(row.subject_id),
      source_owner: OWNERS.has(row.source_owner) ? row.source_owner : null,
      captured_at: timestamp(row.captured_at), original_source_ref: opaque(row.original_source_ref),
      verification_status: ['VERIFIED','PENDING'].includes(v.status) ? v.status : 'UNKNOWN',
      verified_by: opaque(v.verified_by), verified_at: timestamp(v.verified_at) };
    if (item.id && seen.has(item.id)) {
      if (JSON.stringify(seen.get(item.id)) !== JSON.stringify(item)) throw new TypeError('EVIDENCE_CONFLICT');
      continue;
    }
    if (item.id) seen.set(item.id, item);
    if (!subjectId || item.subject_id === subjectId) selected.push(item);
  }
  const clock = timestamp(asOf);
  const policyValid = clock !== null && Number.isSafeInteger(maxAgeMs) && maxAgeMs > 0;
  const complete = selected.length > 0 && selected.every(item => item.id && item.subject_id && item.source_owner && item.captured_at && item.original_source_ref && item.verification_status === 'VERIFIED' && item.verified_by && item.verified_at && Date.parse(item.verified_at) >= Date.parse(item.captured_at));
  const future = policyValid && selected.some(item => (item.captured_at && Date.parse(item.captured_at) > Date.parse(clock)) || (item.verified_at && Date.parse(item.verified_at) > Date.parse(clock)));
  const stale = complete && policyValid && selected.some(item => Date.parse(clock) - Date.parse(item.captured_at) > maxAgeMs);
  const status = !complete || future ? 'NEEDS_EVIDENCE' : !policyValid ? 'UNKNOWN' : stale ? 'STALE' : 'VERIFIED';
  const verified = status === 'VERIFIED';
  return freeze({ schemaVersion: 1, status, evidence: selected, sourceEvidence: verified ? {
    evidenceRefs: selected.map(item => item.id), sourceEvidenceIds: selected.map(item => item.id),
    sourceOwners: [...new Set(selected.map(item => item.source_owner))], freshness: { status: 'FRESH', evaluatedAt: clock, maxAgeMs }
  } : { evidenceRefs: [], sourceEvidenceIds: [], sourceOwners: [], freshness: null },
  humanReviewRequired: true, automaticDecisionAllowed: false });
}
