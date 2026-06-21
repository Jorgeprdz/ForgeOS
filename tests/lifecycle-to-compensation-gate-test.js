import assert from 'node:assert/strict';

import {
  mapLifecycleToCompensationGate,
} from '../advisor-lifecycle/lifecycle-to-compensation-gate.js';

import {
  ADVISOR_CAREER_CLOCK_STATES,
} from '../advisor-lifecycle/advisor-career-clock.js';

import {
  ADVISOR_LIFECYCLE_STATUSES,
} from '../advisor-lifecycle/advisor-lifecycle-status.js';

const precontract = mapLifecycleToCompensationGate({
  lifecycleStatus: ADVISOR_LIFECYCLE_STATUSES.PRECONTRACT,
  managerConfirmed: true,
});
assert.equal(precontract.canTrackProductionCandidate, true);
assert.equal(precontract.canCalculateOfficialBonus, false);
assert.equal(precontract.canReleaseHeldCommission, false);
assert.ok(precontract.warnings.includes('Manager confirmation alone is not payout truth.'));

const missingClock = mapLifecycleToCompensationGate({
  lifecycleStatus: ADVISOR_LIFECYCLE_STATUSES.CONNECTED_ACTIVE,
});
assert.equal(missingClock.allowed, false);
assert.equal(missingClock.canCalculateOfficialBonus, false);

const connected = mapLifecycleToCompensationGate({
  lifecycleStatus: ADVISOR_LIFECYCLE_STATUSES.CONNECTED_ACTIVE,
  careerClockResult: {
    state: ADVISOR_CAREER_CLOCK_STATES.RESOLVED,
    stage: ADVISOR_LIFECYCLE_STATUSES.ADVISOR_DEVELOPMENT,
  },
});
assert.equal(connected.allowed, true);
assert.equal(connected.canCalculateOfficialBonus, true);
assert.equal(connected.canReleaseHeldCommission, true);

const unknown = mapLifecycleToCompensationGate({ lifecycleStatus: 'unknown-ish' });
assert.equal(unknown.allowed, false);
assert.equal(unknown.reason, 'unknown_lifecycle_status_blocks_compensation');

console.log('PASS lifecycle-to-compensation-gate-test');
