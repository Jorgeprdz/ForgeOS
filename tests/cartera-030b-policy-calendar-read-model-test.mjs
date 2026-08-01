import test from 'node:test';
import assert from 'node:assert/strict';

import {
  createPolicyCalendarProjection,
} from '../platform/policy-intelligence/calendar/cartera-030b-policy-calendar-read-model.js';

const makeObligation = (reference, date, status = 'SCHEDULED', extra = {}) => ({
  obligationReference: reference,
  advisorId: 'advisor-030b',
  policyReference: 'POLICY:030B',
  policyVersionReference: 'POLICY_VERSION:030B:1',
  obligationKind: 'PREMIUM_PAYMENT',
  expectedDate: date,
  expectedAmount: 1000,
  currency: 'MXN',
  status,
  dateAuthority: 'CONFIRMED_POLICY_TERMS_DERIVED',
  policyYear: 1,
  sequenceNumber: 1,
  sourceEvidenceReferences: ['SECRET:EVIDENCE'],
  matchedPaymentEventReferences: ['SECRET:PAYMENT'],
  beneficiaryName: 'Must not leak',
  bankAccount: 'Must not leak',
  ...extra,
});

test('Today, 7, 30 and 90 day horizons are deterministic', () => {
  const projection = createPolicyCalendarProjection({
    advisorId: 'advisor-030b',
    timezone: 'America/Mexico_City',
    asOfDate: '2026-08-01',
    obligations: [
      makeObligation('OBLIGATION:TODAY', '2026-08-01'),
      makeObligation('OBLIGATION:7', '2026-08-08'),
      makeObligation('OBLIGATION:30', '2026-08-31'),
      makeObligation('OBLIGATION:90', '2026-10-30'),
    ],
  });
  assert.equal(projection.horizons.TODAY.length, 1);
  assert.equal(projection.horizons.NEXT_7_DAYS.length, 2);
  assert.equal(projection.horizons.NEXT_30_DAYS.length, 3);
  assert.equal(projection.horizons.NEXT_90_DAYS.length, 4);
});

test('overdue projection does not infer lapse or carrier cancellation', () => {
  const projection = createPolicyCalendarProjection({
    advisorId: 'advisor-030b',
    timezone: 'America/Mexico_City',
    asOfDate: '2026-08-01',
    obligations: [makeObligation('OBLIGATION:LATE', '2026-07-01')],
  });
  const item = projection.horizons.OVERDUE[0];
  assert.equal(item.status, 'OVERDUE');
  assert.match(item.explanation, /No implica cancelación ni pérdida de cobertura/);
});

test('calendar projection is sanitized and excludes evidence, beneficiary and bank data', () => {
  const projection = createPolicyCalendarProjection({
    advisorId: 'advisor-030b',
    timezone: 'America/Mexico_City',
    asOfDate: '2026-08-01',
    obligations: [makeObligation('OBLIGATION:SAFE', '2026-08-15')],
  });
  const serialized = JSON.stringify(projection);
  assert.doesNotMatch(serialized, /SECRET:EVIDENCE|SECRET:PAYMENT|beneficiary|bankAccount|Must not leak/i);
});

test('cross-advisor obligation fails closed', () => {
  assert.throws(() => createPolicyCalendarProjection({
    advisorId: 'advisor-030b',
    timezone: 'America/Mexico_City',
    asOfDate: '2026-08-01',
    obligations: [makeObligation('OBLIGATION:OTHER', '2026-08-15', 'SCHEDULED', {
      advisorId: 'advisor-other',
    })],
  }), /CROSS_ADVISOR_OBLIGATION_FORBIDDEN/);
});

test('opening a calendar projection does not mutate ledger rows', () => {
  const source = makeObligation('OBLIGATION:IMMUTABLE', '2026-07-01');
  const before = structuredClone(source);
  createPolicyCalendarProjection({
    advisorId: 'advisor-030b',
    timezone: 'America/Mexico_City',
    asOfDate: '2026-08-01',
    obligations: [source],
  });
  assert.deepEqual(source, before);
});
