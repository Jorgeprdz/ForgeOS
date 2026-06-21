import {
  ADVISOR_LIFECYCLE_STATUSES,
  isPrecontractStatus,
  normalizeLifecycleStatus,
} from './advisor-lifecycle-status.js';

import {
  ADVISOR_LIFECYCLE_EVIDENCE_TYPES,
  evidenceCanStartCareerClock,
} from './advisor-lifecycle-evidence.js';

export const ADVISOR_CAREER_CLOCK_STATES = Object.freeze({
  RESOLVED: 'resolved',
  BLOCKED: 'blocked',
  UNKNOWN: 'unknown',
});

export const ADVISOR_CAREER_CLOCK_REASONS = Object.freeze({
  MISSING_CONNECTION_DATE: 'blocked_by_missing_connection_date',
  UNCONFIRMED_LIFECYCLE_EVIDENCE: 'blocked_by_unconfirmed_lifecycle_evidence',
  PRECONTRACT_STATUS: 'blocked_by_precontract_status',
  INVALID_DATE: 'blocked_by_invalid_date',
  RESOLVED_FROM_CONNECTION_DATE: 'resolved_from_connection_date',
  RESOLVED_FROM_CONTEST_START_DATE: 'resolved_from_contest_start_date',
  UNKNOWN_LIFECYCLE_STATUS: 'blocked_by_unknown_lifecycle_status',
});

function parseDate(value) {
  if (!value) return null;
  const date = new Date(`${String(value).slice(0, 10)}T12:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function monthDiffInclusive(start, asOf) {
  return ((asOf.getFullYear() - start.getFullYear()) * 12)
    + (asOf.getMonth() - start.getMonth())
    + 1;
}

function stageForMonth(careerMonth) {
  if (careerMonth >= 1 && careerMonth <= 12) return ADVISOR_LIFECYCLE_STATUSES.ADVISOR_DEVELOPMENT;
  if (careerMonth >= 13) return ADVISOR_LIFECYCLE_STATUSES.NEW_PROFESSIONAL;
  return ADVISOR_LIFECYCLE_STATUSES.UNKNOWN;
}

function blocked(reason, extra = {}) {
  return {
    state: ADVISOR_CAREER_CLOCK_STATES.BLOCKED,
    careerMonth: null,
    stage: ADVISOR_LIFECYCLE_STATUSES.UNKNOWN,
    reason,
    blockedIsZero: false,
    ...extra,
  };
}

export function resolveOfficialAdvisorCareerClock({
  lifecycleStatus = ADVISOR_LIFECYCLE_STATUSES.UNKNOWN,
  connectionDate = null,
  contestStartDate = null,
  connectionEvidence = null,
  contestStartEvidence = null,
  asOfDate = new Date().toISOString().slice(0, 10),
} = {}) {
  const status = normalizeLifecycleStatus(lifecycleStatus);

  if (status === ADVISOR_LIFECYCLE_STATUSES.UNKNOWN) {
    return blocked(ADVISOR_CAREER_CLOCK_REASONS.UNKNOWN_LIFECYCLE_STATUS);
  }

  if (isPrecontractStatus(status)) {
    return blocked(ADVISOR_CAREER_CLOCK_REASONS.PRECONTRACT_STATUS);
  }

  const hasContest = Boolean(contestStartDate);
  const hasConnection = Boolean(connectionDate);

  if (!hasContest && !hasConnection) {
    return blocked(ADVISOR_CAREER_CLOCK_REASONS.MISSING_CONNECTION_DATE);
  }

  const selectedDate = hasContest ? contestStartDate : connectionDate;
  const sourceEvidence = hasContest ? contestStartEvidence : connectionEvidence;
  const expectedType = hasContest
    ? ADVISOR_LIFECYCLE_EVIDENCE_TYPES.CONTEST_START_DATE
    : ADVISOR_LIFECYCLE_EVIDENCE_TYPES.CONNECTION_DATE;

  if (!sourceEvidence || sourceEvidence.evidenceType !== expectedType || !evidenceCanStartCareerClock(sourceEvidence)) {
    return blocked(ADVISOR_CAREER_CLOCK_REASONS.UNCONFIRMED_LIFECYCLE_EVIDENCE);
  }

  const start = parseDate(selectedDate);
  const asOf = parseDate(asOfDate);

  if (!start || !asOf || asOf < start) {
    return blocked(ADVISOR_CAREER_CLOCK_REASONS.INVALID_DATE);
  }

  const careerMonth = monthDiffInclusive(start, asOf);

  return {
    state: ADVISOR_CAREER_CLOCK_STATES.RESOLVED,
    careerMonth,
    stage: stageForMonth(careerMonth),
    reason: hasContest
      ? ADVISOR_CAREER_CLOCK_REASONS.RESOLVED_FROM_CONTEST_START_DATE
      : ADVISOR_CAREER_CLOCK_REASONS.RESOLVED_FROM_CONNECTION_DATE,
    careerStartDate: selectedDate,
    sourceEvidenceType: expectedType,
  };
}
