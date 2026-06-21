import assert from 'node:assert/strict';

import {
  ADVISOR_LIFECYCLE_STATUSES,
  isConnectedStatus,
  isOfficialAdvisorStatus,
  isPrecontractStatus,
  isTerminalStatus,
  normalizeLifecycleStatus,
} from '../advisor-lifecycle/advisor-lifecycle-status.js';

assert.equal(isPrecontractStatus(ADVISOR_LIFECYCLE_STATUSES.PRECONTRACT_SIGNED), true);
assert.equal(isConnectedStatus(ADVISOR_LIFECYCLE_STATUSES.CONNECTED_ACTIVE), true);
assert.equal(isOfficialAdvisorStatus(ADVISOR_LIFECYCLE_STATUSES.PROFESSIONAL), true);
assert.equal(isTerminalStatus(ADVISOR_LIFECYCLE_STATUSES.TERMINATED), true);
assert.equal(normalizeLifecycleStatus('surprise'), ADVISOR_LIFECYCLE_STATUSES.UNKNOWN);
assert.equal(isConnectedStatus('surprise'), false);

console.log('PASS advisor-lifecycle-status-test');
