import assert from 'node:assert/strict';

import {
  PAYMENT_TERM_CLASSIFICATIONS,
  classifyInitialOrRenewal,
} from '../policy-operations/initial-renewal-classifier.js';

const missingDates = classifyInitialOrRenewal({
  paymentDate: '2026-01-01',
  periodCoveredStart: '2026-01-01',
  periodCoveredEnd: '2026-01-31',
});

assert.equal(missingDates.classification, PAYMENT_TERM_CLASSIFICATIONS.BLOCKED_BY_MISSING_POLICY_DATES);
assert.equal(missingDates.countsAsInitial, false);
assert.equal(missingDates.countsAsRenewal, false);

const missingPeriod = classifyInitialOrRenewal({
  issueDate: '2026-01-01',
  renewalDate: '2027-01-01',
});

assert.equal(missingPeriod.classification, PAYMENT_TERM_CLASSIFICATIONS.BLOCKED_BY_MISSING_PAYMENT_PERIOD);

const initial = classifyInitialOrRenewal({
  issueDate: '2026-01-01',
  renewalDate: '2027-01-01',
  paymentDate: '2026-02-01',
  periodCoveredStart: '2026-02-01',
  periodCoveredEnd: '2026-02-28',
});

assert.equal(initial.classification, PAYMENT_TERM_CLASSIFICATIONS.INITIAL);

const renewal = classifyInitialOrRenewal({
  issueDate: '2025-01-01',
  renewalDate: '2026-01-01',
  policyYear: 2,
  paymentDate: '2026-02-01',
  periodCoveredStart: '2026-02-01',
  periodCoveredEnd: '2026-02-28',
});

assert.equal(renewal.classification, PAYMENT_TERM_CLASSIFICATIONS.RENEWAL);
assert.equal(renewal.countsAsRenewal, true);

const carrierSpecific = classifyInitialOrRenewal({
  carrierSpecificResolutionRequired: true,
});

assert.equal(
  carrierSpecific.classification,
  PAYMENT_TERM_CLASSIFICATIONS.CARRIER_SPECIFIC_RESOLUTION_REQUIRED
);

console.log('PASS initial-renewal-classifier-test');
