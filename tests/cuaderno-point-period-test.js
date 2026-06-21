import assert from 'node:assert/strict';

import {
  CUADERNO_POINT_STATES,
  resolveCuadernoPointPeriod,
} from '../compensation/contracts/cuaderno-point-period.js';

const issueOnly = resolveCuadernoPointPeriod({ issueDate: '2026-04-12' });
assert.equal(issueOnly.pointCreated, false);
assert.equal(issueOnly.pointPeriod, null);
assert.equal(issueOnly.issueDateDeterminesPointMonth, false);

const paidApplied = resolveCuadernoPointPeriod({ paidAppliedDate: '2026-05-03' });
assert.equal(paidApplied.pointCreated, true);
assert.equal(paidApplied.pointPeriod, '2026-05');

const aprilIssueMayPaid = resolveCuadernoPointPeriod({
  issueDate: '2026-04-12',
  paidAppliedDate: '2026-05-03',
});
assert.equal(aprilIssueMayPaid.pointPeriod, '2026-05');

const paidNotApplied = resolveCuadernoPointPeriod({
  issueDate: '2026-04-12',
  paidDate: '2026-04-20',
});
assert.equal(paidNotApplied.state, CUADERNO_POINT_STATES.PENDING_APPLIED_DATE);
assert.equal(paidNotApplied.pointCreated, false);

const unknown = resolveCuadernoPointPeriod();
assert.equal(unknown.state, CUADERNO_POINT_STATES.UNKNOWN);
assert.equal(unknown.unknownIsZero, false);

const forecast = resolveCuadernoPointPeriod({ forecast: true, paidAppliedDate: '2026-05-03' });
assert.equal(forecast.pointCreated, false);
assert.equal(forecast.forecastCreatesPayoutTruth, false);

console.log('PASS cuaderno-point-period-test');
