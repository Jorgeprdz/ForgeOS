import test from 'node:test';
import assert from 'node:assert/strict';

import {
  CARTERA_030B_AMOUNT_SEMANTICS,
  CARTERA_030B_PAYMENT_FREQUENCIES,
  addMonthsClamped,
  createExpectedPaymentObligationReference,
  generateExpectedPaymentObligationCandidates,
} from '../policy-operations/calendar/cartera-030b-recurrence-engine.js';

const base = {
  advisorId: 'advisor-030b',
  policyReference: 'POLICY:030B',
  policyVersionReference: 'POLICY_VERSION:030B:1',
  policyTermsDigest: 'a'.repeat(64),
  anchorDate: '2026-01-31',
  generationHorizonDate: '2026-12-31',
  paymentFrequency: CARTERA_030B_PAYMENT_FREQUENCIES.MONTHLY,
  premiumAmount: 1200,
  currency: 'MXN',
  amountSemantics: CARTERA_030B_AMOUNT_SEMANTICS.PER_OCCURRENCE,
  scheduleRuleReference: 'RULE:PER_OCCURRENCE:001',
  sourceEvidenceReferences: ['EVIDENCE:POLICY:030B'],
  timezone: 'America/Mexico_City',
};

test('month-end recurrence preserves month-end deterministically', async () => {
  assert.equal(addMonthsClamped('2026-01-31', 1), '2026-02-28');
  assert.equal(addMonthsClamped('2026-01-31', 2), '2026-03-31');
  const result = await generateExpectedPaymentObligationCandidates({
    ...base,
    generationHorizonDate: '2026-03-31',
  });
  assert.deepEqual(result.obligations.map(item => item.expectedDate), [
    '2026-01-31',
    '2026-02-28',
    '2026-03-31',
  ]);
});

test('leap-day annual recurrence clamps and returns to leap day', async () => {
  const result = await generateExpectedPaymentObligationCandidates({
    ...base,
    anchorDate: '2024-02-29',
    generationHorizonDate: '2028-02-29',
    paymentFrequency: CARTERA_030B_PAYMENT_FREQUENCIES.ANNUAL,
  });
  assert.deepEqual(result.obligations.map(item => item.expectedDate), [
    '2024-02-29',
    '2025-02-28',
    '2026-02-28',
    '2027-02-28',
    '2028-02-29',
  ]);
});

test('monthly quarterly semiannual and annual counts are deterministic', async () => {
  const expected = new Map([
    ['MONTHLY', 12],
    ['QUARTERLY', 4],
    ['SEMIANNUAL', 2],
    ['ANNUAL', 1],
  ]);
  for (const [frequency, count] of expected) {
    const result = await generateExpectedPaymentObligationCandidates({
      ...base,
      anchorDate: '2026-01-01',
      generationHorizonDate: '2026-12-31',
      paymentFrequency: frequency,
    });
    assert.equal(result.obligations.length, count, frequency);
  }
});

test('single premium creates at most one obligation', async () => {
  const result = await generateExpectedPaymentObligationCandidates({
    ...base,
    paymentFrequency: CARTERA_030B_PAYMENT_FREQUENCIES.SINGLE,
    generationHorizonDate: '2030-12-31',
  });
  assert.equal(result.obligations.length, 1);
  assert.equal(result.obligations[0].sequenceNumber, 1);
});

test('unknown frequency and unknown anchor fail closed without guessed dates', async () => {
  const unknownFrequency = await generateExpectedPaymentObligationCandidates({
    ...base,
    paymentFrequency: CARTERA_030B_PAYMENT_FREQUENCIES.UNKNOWN,
  });
  assert.equal(unknownFrequency.generationState, 'BLOCKED');
  assert.equal(unknownFrequency.reason, 'UNKNOWN_PAYMENT_FREQUENCY');
  assert.equal(unknownFrequency.obligations.length, 0);

  const unknownAnchor = await generateExpectedPaymentObligationCandidates({
    ...base,
    anchorDate: null,
  });
  assert.equal(unknownAnchor.reason, 'UNKNOWN_ANCHOR_DATE');
  assert.equal(unknownAnchor.obligations.length, 0);
});

test('known premium without explicit per-occurrence semantics remains null', async () => {
  const result = await generateExpectedPaymentObligationCandidates({
    ...base,
    amountSemantics: CARTERA_030B_AMOUNT_SEMANTICS.UNKNOWN,
    scheduleRuleReference: null,
  });
  assert.equal(result.obligations[0].expectedAmount, null);
  assert.deepEqual(result.warnings, ['PREMIUM_AMOUNT_SEMANTICS_UNKNOWN']);
});

test('unknown premium and currency remain null rather than zero or guessed', async () => {
  const result = await generateExpectedPaymentObligationCandidates({
    ...base,
    premiumAmount: null,
    currency: null,
  });
  assert.equal(result.obligations[0].expectedAmount, null);
  assert.equal(result.obligations[0].currency, null);
});

test('same exact occurrence produces the same stable obligation reference', async () => {
  const input = {
    advisorId: base.advisorId,
    policyReference: base.policyReference,
    policyVersionReference: base.policyVersionReference,
    policyTermsDigest: base.policyTermsDigest,
    expectedDate: '2026-01-31',
    sequenceNumber: 1,
    paymentFrequency: 'MONTHLY',
    scheduleRuleReference: base.scheduleRuleReference,
  };
  assert.equal(
    await createExpectedPaymentObligationReference(input),
    await createExpectedPaymentObligationReference({ ...input })
  );
});

test('policy year lineage is deterministic across anniversaries', async () => {
  const result = await generateExpectedPaymentObligationCandidates({
    ...base,
    anchorDate: '2026-07-15',
    generationHorizonDate: '2028-07-15',
    paymentFrequency: CARTERA_030B_PAYMENT_FREQUENCIES.ANNUAL,
  });
  assert.deepEqual(result.obligations.map(item => item.policyYear), [1, 2, 3]);
});

test('coverage end bounds generation without fabricating later obligations', async () => {
  const result = await generateExpectedPaymentObligationCandidates({
    ...base,
    anchorDate: '2026-01-01',
    coverageEndDate: '2026-04-30',
    generationHorizonDate: '2027-12-31',
  });
  assert.deepEqual(result.obligations.map(item => item.expectedDate), [
    '2026-01-01',
    '2026-02-01',
    '2026-03-01',
    '2026-04-01',
  ]);
});
