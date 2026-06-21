import assert from 'node:assert/strict';

import {
  CAREER_MONTH_STATES,
  CAREER_STAGE_FAMILIES,
  resolveCareerMonth,
} from '../compensation/contracts/career-month-resolver.js';

const precontract = resolveCareerMonth({ status: 'precontract' });
assert.equal(precontract.careerMonth, 1);
assert.equal(precontract.stageFamily, CAREER_STAGE_FAMILIES.PRECONTRACT);

const missingStartDate = resolveCareerMonth({ status: 'advisor' });
assert.equal(missingStartDate.state, CAREER_MONTH_STATES.UNKNOWN);
assert.equal(missingStartDate.careerMonth, null);
assert.equal(missingStartDate.unknownIsZero, false);

const invalidDate = resolveCareerMonth({
  status: 'advisor',
  careerStartDate: 'not-a-date',
  asOfDate: '2026-06-21',
});
assert.equal(invalidDate.state, CAREER_MONTH_STATES.BLOCKED);
assert.equal(invalidDate.blockedIsZero, false);

const month12 = resolveCareerMonth({
  status: 'advisor',
  careerStartDate: '2025-07-01',
  asOfDate: '2026-06-21',
});
assert.equal(month12.careerMonth, 12);
assert.equal(month12.stageFamily, CAREER_STAGE_FAMILIES.DEVELOPMENT);

const month13 = resolveCareerMonth({
  status: 'advisor',
  careerStartDate: '2025-06-01',
  asOfDate: '2026-06-21',
});
assert.equal(month13.careerMonth, 13);
assert.equal(month13.stageFamily, CAREER_STAGE_FAMILIES.NEW_PROFESSIONAL_OR_PROFESSIONAL);

console.log('PASS career-month-resolver-test');
