import assert from 'node:assert/strict';

import {
  loadDefaultSMNYLPartner2026RulePack,
} from '../compensation/partner-manager/rule-engine/partner-rule-pack-loader.js';

import {
  deriveSemesterIndexFromCareerMonth,
  getConcept,
  resolveBandRate,
  resolveExactOrPlusScale,
  resolveSemesterAmount,
  resolveThresholdScale,
} from '../compensation/partner-manager/rule-engine/partner-rule-resolver.js';

const rulePack = loadDefaultSMNYLPartner2026RulePack();

assert.equal(getConcept(rulePack, 'productivity-base').displayName, 'Productividad Base');

const productivityConcept = getConcept(rulePack, 'productivity-base');
const firstBand = productivityConcept.table.bands[0];
const firstClass = Object.keys(firstBand.rates)[0];
const firstClassRate = firstBand.rates[firstClass];
assert.equal(resolveBandRate({
  bands: productivityConcept.table.bands,
  value: firstBand.minAverageMonthlyInitialCommissions,
  classKey: firstClass,
}).rate, firstClassRate);

const multiplierConcept = getConcept(rulePack, 'productivity-multiplier');
const multiplierRow = multiplierConcept.table[0];
assert.equal(resolveThresholdScale({
  scale: multiplierConcept.table,
  value: multiplierRow.qualifiedAdvisorCount,
  valueKey: 'qualifiedAdvisorCount',
  resultKey: 'multiplierRate',
}).value, multiplierRow.multiplierRate);

const activityConcept = getConcept(rulePack, 'activity-bonus');
const plusRow = activityConcept.policyScale.find((row) => String(row.policies).endsWith('+'));
assert.equal(resolveExactOrPlusScale({
  scale: activityConcept.policyScale,
  value: Number(String(plusRow.policies).replace('+', '')) + 1,
  field: 'policies',
  resultKey: 'rate',
}).value, plusRow.rate);

const fixedSupportConcept = getConcept(rulePack, 'fixed-support');
const semesterRow = fixedSupportConcept.supportAmountsBySemester[0];
assert.equal(resolveSemesterAmount({
  supportAmountsBySemester: fixedSupportConcept.supportAmountsBySemester,
  semesterIndex: semesterRow.semester,
}).amount, semesterRow.amount);

assert.equal(deriveSemesterIndexFromCareerMonth({ careerMonth: 25 }), 5);

console.log('PASS partner-rule-resolver-test');
