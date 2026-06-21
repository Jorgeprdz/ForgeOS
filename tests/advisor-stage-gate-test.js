import assert from 'node:assert/strict';

import {
  evaluateAdvisorStageGate,
} from '../advisor-lifecycle/advisor-stage-gate.js';

import {
  ADVISOR_CAREER_CLOCK_STATES,
} from '../advisor-lifecycle/advisor-career-clock.js';

import {
  ADVISOR_LIFECYCLE_STATUSES,
} from '../advisor-lifecycle/advisor-lifecycle-status.js';

const precontract = evaluateAdvisorStageGate({
  lifecycleStatus: ADVISOR_LIFECYCLE_STATUSES.PRECONTRACT,
});
assert.equal(precontract.allowed, false);
assert.ok(precontract.blockedReasons.includes('precontract_cannot_enter_official_bonus_eligibility'));

const unknown = evaluateAdvisorStageGate({ lifecycleStatus: 'bad' });
assert.equal(unknown.allowed, false);
assert.equal(unknown.reason, 'unknown_lifecycle_status_blocks_official_stage');

const connected = evaluateAdvisorStageGate({
  lifecycleStatus: ADVISOR_LIFECYCLE_STATUSES.CONNECTED_ACTIVE,
  definitiveKeyStatus: 'active',
  activeStatus: 'active',
  careerClockResult: {
    state: ADVISOR_CAREER_CLOCK_STATES.RESOLVED,
    careerMonth: 1,
    stage: ADVISOR_LIFECYCLE_STATUSES.ADVISOR_DEVELOPMENT,
  },
});
assert.equal(connected.allowed, true);
assert.equal(connected.stage, ADVISOR_LIFECYCLE_STATUSES.ADVISOR_DEVELOPMENT);

const legalEntity = evaluateAdvisorStageGate({
  lifecycleStatus: ADVISOR_LIFECYCLE_STATUSES.CONNECTED_ACTIVE,
  legalEntityFlag: true,
});
assert.equal(legalEntity.reason, 'legal_entity_blocks_bonus_eligibility');

console.log('PASS advisor-stage-gate-test');
