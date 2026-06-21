import assert from 'node:assert/strict';

import {
  ADVISOR_LIFECYCLE_EVIDENCE_CONFIDENCE,
  ADVISOR_LIFECYCLE_EVIDENCE_TYPES,
  createAdvisorLifecycleEvidence,
  managerConfirmationCreatesPayoutTruth,
} from '../advisor-lifecycle/advisor-lifecycle-evidence.js';

const signed = createAdvisorLifecycleEvidence({
  evidenceType: ADVISOR_LIFECYCLE_EVIDENCE_TYPES.SIGNED_PRECONTRACT_DOCUMENT,
  confidence: ADVISOR_LIFECYCLE_EVIDENCE_CONFIDENCE.OFFICIAL,
  confirmed: true,
});
assert.equal(signed.canStartCareerClock, false);
assert.equal(signed.signedPrecontractStartsCareerClock, false);

const manager = createAdvisorLifecycleEvidence({
  evidenceType: ADVISOR_LIFECYCLE_EVIDENCE_TYPES.MANAGER_CONFIRMED,
  confidence: ADVISOR_LIFECYCLE_EVIDENCE_CONFIDENCE.OFFICIAL,
  confirmed: true,
});
assert.equal(manager.confirmsPayoutTruth, false);
assert.equal(managerConfirmationCreatesPayoutTruth(), false);

const connection = createAdvisorLifecycleEvidence({
  evidenceType: ADVISOR_LIFECYCLE_EVIDENCE_TYPES.CONNECTION_DATE,
  confidence: ADVISOR_LIFECYCLE_EVIDENCE_CONFIDENCE.HIGH,
  confirmed: true,
});
assert.equal(connection.canStartCareerClock, true);

console.log('PASS advisor-lifecycle-evidence-test');
