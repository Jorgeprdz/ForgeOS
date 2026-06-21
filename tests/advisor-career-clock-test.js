import assert from 'node:assert/strict';

import {
  ADVISOR_CAREER_CLOCK_REASONS,
  ADVISOR_CAREER_CLOCK_STATES,
  resolveOfficialAdvisorCareerClock,
} from '../advisor-lifecycle/advisor-career-clock.js';

import {
  ADVISOR_LIFECYCLE_EVIDENCE_CONFIDENCE,
  ADVISOR_LIFECYCLE_EVIDENCE_TYPES,
} from '../advisor-lifecycle/advisor-lifecycle-evidence.js';

import {
  ADVISOR_LIFECYCLE_STATUSES,
} from '../advisor-lifecycle/advisor-lifecycle-status.js';

const signedPrecontract = resolveOfficialAdvisorCareerClock({
  lifecycleStatus: ADVISOR_LIFECYCLE_STATUSES.PRECONTRACT_SIGNED,
  connectionDate: '2026-06-01',
  asOfDate: '2026-06-21',
});
assert.equal(signedPrecontract.state, ADVISOR_CAREER_CLOCK_STATES.BLOCKED);
assert.equal(signedPrecontract.reason, ADVISOR_CAREER_CLOCK_REASONS.PRECONTRACT_STATUS);

const connectionEvidence = {
  evidenceType: ADVISOR_LIFECYCLE_EVIDENCE_TYPES.CONNECTION_DATE,
  confidence: ADVISOR_LIFECYCLE_EVIDENCE_CONFIDENCE.HIGH,
  confirmed: true,
};

const connectionMonth1 = resolveOfficialAdvisorCareerClock({
  lifecycleStatus: ADVISOR_LIFECYCLE_STATUSES.CONNECTED_ACTIVE,
  connectionDate: '2026-06-01',
  connectionEvidence,
  asOfDate: '2026-06-21',
});
assert.equal(connectionMonth1.careerMonth, 1);
assert.equal(connectionMonth1.reason, ADVISOR_CAREER_CLOCK_REASONS.RESOLVED_FROM_CONNECTION_DATE);

const contestMonth1 = resolveOfficialAdvisorCareerClock({
  lifecycleStatus: ADVISOR_LIFECYCLE_STATUSES.CONNECTED_ACTIVE,
  contestStartDate: '2026-06-01',
  contestStartEvidence: {
    evidenceType: ADVISOR_LIFECYCLE_EVIDENCE_TYPES.CONTEST_START_DATE,
    confidence: ADVISOR_LIFECYCLE_EVIDENCE_CONFIDENCE.OFFICIAL,
    confirmed: true,
  },
  asOfDate: '2026-06-21',
});
assert.equal(contestMonth1.careerMonth, 1);
assert.equal(contestMonth1.reason, ADVISOR_CAREER_CLOCK_REASONS.RESOLVED_FROM_CONTEST_START_DATE);

const missing = resolveOfficialAdvisorCareerClock({
  lifecycleStatus: ADVISOR_LIFECYCLE_STATUSES.CONNECTED_ACTIVE,
});
assert.equal(missing.reason, ADVISOR_CAREER_CLOCK_REASONS.MISSING_CONNECTION_DATE);

const unconfirmed = resolveOfficialAdvisorCareerClock({
  lifecycleStatus: ADVISOR_LIFECYCLE_STATUSES.CONNECTED_ACTIVE,
  connectionDate: '2026-06-01',
  connectionEvidence: { ...connectionEvidence, confirmed: false },
});
assert.equal(unconfirmed.reason, ADVISOR_CAREER_CLOCK_REASONS.UNCONFIRMED_LIFECYCLE_EVIDENCE);

console.log('PASS advisor-career-clock-test');
