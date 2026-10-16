import { calculateManagerRecruitmentMetrics } from '../generated/forge-recruitment.mjs';
import { opaque, safeUse, context, normalizeNeutralProvenance } from '../evidence/neutral-provenance.mjs';
import { adaptSnapshot } from './snapshots.mjs';
function unknownCounts(value) {
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, unknownCounts(item)]));
  return typeof value === 'number' ? null : value;
}
export function adaptMetrics(options = {}) {
  const { records = [] } = options;
  if (!Array.isArray(records)) throw new TypeError('SNAPSHOT_RECORDS_REQUIRED');
  const p = normalizeNeutralProvenance(options); const seen = new Set(); const eventApplications = new Map();
  const snapshots = records.map(record => {
    if (!record || typeof record !== 'object' || Array.isArray(record)) throw new TypeError('SNAPSHOT_RECORD_REQUIRED');
    const id = opaque(record.application?.id);
    if (id && seen.has(id)) throw new TypeError('DUPLICATE_APPLICATION');
    if (id) seen.add(id);
    const snapshot = adaptSnapshot({ ...options, candidate: record.candidate, application: record.application, events: record.events, requestedUse: 'MANAGER_REVIEW' });
    for (const event of record.events || []) {
      const eventId = opaque(event.id);
      if (!eventId) continue;
      if (eventApplications.has(eventId) && eventApplications.get(eventId) !== id) throw new TypeError('EVENT_CONFLICT');
      eventApplications.set(eventId, id);
    }
    return snapshot;
  });
  const result = calculateManagerRecruitmentMetrics({ candidateManagerSnapshots: snapshots.map(a => a.result),
    sourceEvidence: p.sourceEvidence, requestedUse: safeUse(options.requestedUse) });
  const complete = Boolean(snapshots.length && snapshots.every(a => a.historyComplete) && p.status === 'VERIFIED');
  if (!complete) {
    result.recruitmentMetrics = unknownCounts(result.recruitmentMetrics);
    result.unknownSignals.push('adapter_snapshot_history_incomplete');
    result.managerReviewRequired = true; result.humanReviewRequired = true;
  }
  const status = result.metricsStatus === 'BLOCKED' ? 'BLOCKED' : !complete ? 'UNKNOWN' : result.metricsStatus;
  return context('metrics', options, { snapshotCount: complete ? snapshots.length : null }, result, p, { status });
}
