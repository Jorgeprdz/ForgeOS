import test from 'node:test';
import assert from 'node:assert/strict';

import {
  createCartera030bPaymentObligationService,
} from '../advisor-os/cartera/cartera-030b-payment-obligation-service.js';

function repository(overrides = {}) {
  const calls = [];
  return {
    calls,
    async getCurrentPolicyTerms() {
      calls.push(['getCurrentPolicyTerms']);
      return {
        advisorId: 'advisor-030b',
        policyReference: 'POLICY:030B',
        policyVersionReference: 'POLICY_VERSION:030B:1',
        policyTermsDigest: 'b'.repeat(64),
        anchorDate: '2026-01-01',
        coverageEndDate: null,
        paymentFrequency: 'MONTHLY',
        premiumAmount: 1000,
        currency: 'MXN',
      };
    },
    async persistObligationBatch(payload) {
      calls.push(['persistObligationBatch', payload]);
      return { persisted: payload.obligations.length };
    },
    async listExpectedPaymentObligations() {
      calls.push(['listExpectedPaymentObligations']);
      return [];
    },
    async persistPaymentReconciliation(payload) {
      calls.push(['persistPaymentReconciliation', payload]);
      return payload.reconciliation;
    },
    ...overrides,
  };
}

test('service requires an explicit bounded repository contract', () => {
  assert.throws(
    () => createCartera030bPaymentObligationService({ repository: {} }),
    /CARTERA_030B_REPOSITORY_METHOD_REQUIRED/
  );
});

test('generation reads exact current Policy terms then persists only the obligation batch', async () => {
  const store = repository();
  const service = createCartera030bPaymentObligationService({ repository: store });
  const result = await service.generateForCurrentPolicy({
    advisorId: 'advisor-030b',
    policyReference: 'POLICY:030B',
    generationHorizonDate: '2026-03-01',
    timezone: 'America/Mexico_City',
    amountSemantics: 'PER_OCCURRENCE',
    scheduleRuleReference: 'RULE:PER_OCCURRENCE:001',
    sourceEvidenceReferences: ['EVIDENCE:POLICY:030B'],
    idempotencyKey: 'GENERATE:030B:001',
  });
  assert.equal(result.persisted, 3);
  assert.deepEqual(store.calls.map(call => call[0]), [
    'getCurrentPolicyTerms',
    'persistObligationBatch',
  ]);
});

test('blocked generation never invokes persistence', async () => {
  const store = repository({
    async getCurrentPolicyTerms() {
      return {
        advisorId: 'advisor-030b',
        policyReference: 'POLICY:030B',
        policyVersionReference: 'POLICY_VERSION:030B:1',
        policyTermsDigest: 'b'.repeat(64),
        anchorDate: null,
        paymentFrequency: null,
      };
    },
  });
  const service = createCartera030bPaymentObligationService({ repository: store });
  const result = await service.generateForCurrentPolicy({
    advisorId: 'advisor-030b',
    policyReference: 'POLICY:030B',
    generationHorizonDate: '2026-12-31',
    timezone: 'America/Mexico_City',
    idempotencyKey: 'GENERATE:030B:BLOCKED',
  });
  assert.equal(result.generationState, 'BLOCKED');
  assert.equal(store.calls.some(call => call[0] === 'persistObligationBatch'), false);
});

test('calendar load uses minimized pure projection and no canonical mutation method', async () => {
  const store = repository({
    async listExpectedPaymentObligations() {
      return [{
        obligationReference: 'OBLIGATION:001',
        advisorId: 'advisor-030b',
        policyReference: 'POLICY:030B',
        policyVersionReference: 'POLICY_VERSION:030B:1',
        expectedDate: '2026-08-01',
        expectedAmount: null,
        currency: null,
        status: 'SCHEDULED',
      }];
    },
  });
  const service = createCartera030bPaymentObligationService({ repository: store });
  const projection = await service.loadCalendar({
    advisorId: 'advisor-030b',
    asOfDate: '2026-08-01',
    timezone: 'America/Mexico_City',
  });
  assert.equal(projection.horizons.TODAY.length, 1);
  assert.equal('mutatePolicy' in store, false);
});
