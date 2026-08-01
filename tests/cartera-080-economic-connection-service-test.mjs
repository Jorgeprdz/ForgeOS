import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createEconomicEvidenceCandidate,
  proposeEconomicMatch,
  recordEconomicDecision,
} from '../platform/economic-connection/cartera-080-economic-connection.js';
import {
  createCartera080EconomicConnectionService,
  createInMemoryEconomicConnectionReceiptStore,
} from '../advisor-os/cartera/cartera-080-economic-connection-service.js';

function fixture({ idempotencyKey = '080-service-1', amount = 3890.21 } = {}) {
  const evidence = createEconomicEvidenceCandidate({
    evidenceId: 'ev-service-1',
    sourceType: 'payment_proof',
    receivedAt: '2026-08-01T16:40:00.000Z',
    evidenceHash: 'hash-service-1',
    ingestionMethod: 'manual_upload',
    claimedAmount: amount,
    claimedCurrency: 'MXN',
    claimedPaymentDate: '2026-08-01',
  });
  const proposal = proposeEconomicMatch({
    evidence,
    personCandidates: ['person-1'],
    policyCandidates: ['policy-1'],
    obligationCandidates: ['obligation-1'],
  });
  const decision = recordEconomicDecision({
    evidence,
    proposal,
    actorId: 'advisor-1',
    decision: 'confirm',
    reason: 'Validación humana completa',
    selectedMatch: {
      personReference: 'person-1',
      policyReference: 'policy-1',
      obligationReference: 'obligation-1',
    },
    decidedAt: '2026-08-01T16:45:00.000Z',
    idempotencyKey,
    correlationId: '080-service-correlation',
  });
  return { evidence, decision };
}

test('handoff llama una sola vez a 030C y conserva el receipt humano', async () => {
  const calls = [];
  const service = createCartera080EconomicConnectionService({
    paymentReconciliationService: {
      async reconcileConfirmedPayment(command) {
        calls.push(command);
        return { reconciliationState: 'COMPLETE', outcome: 'MATCHED' };
      },
    },
  });

  const result = await service.handoffConfirmedPayment(fixture());
  assert.equal(calls.length, 1);
  assert.equal(calls[0].humanDecisionReceipt.actorId, 'advisor-1');
  assert.equal(calls[0].commissionCalculationRequested, false);
  assert.equal(result.truthOwner, 'Policy Truth / Cartera 030C');
  assert.equal(result.commissionCalculationPerformed, false);
  assert.match(result.commandDigest, /^[a-f0-9]{64}$/);
});

test('repetir la misma idempotency key y payload regresa receipt sin duplicar RPC', async () => {
  let callCount = 0;
  const store = createInMemoryEconomicConnectionReceiptStore();
  const service = createCartera080EconomicConnectionService({
    receiptStore: store,
    paymentReconciliationService: {
      async reconcileConfirmedPayment() {
        callCount += 1;
        return { outcome: 'MATCHED' };
      },
    },
  });
  const payload = fixture();
  const first = await service.handoffConfirmedPayment(payload);
  const replay = await service.handoffConfirmedPayment(payload);
  assert.equal(callCount, 1);
  assert.equal(store.size(), 1);
  assert.equal(first.replayed, false);
  assert.equal(replay.replayed, true);
});

test('misma idempotency key con payload distinto produce conflicto', async () => {
  const store = createInMemoryEconomicConnectionReceiptStore();
  const service = createCartera080EconomicConnectionService({
    receiptStore: store,
    paymentReconciliationService: {
      async reconcileConfirmedPayment() {
        return { outcome: 'MATCHED' };
      },
    },
  });
  await service.handoffConfirmedPayment(fixture({ amount: 3890.21 }));
  await assert.rejects(
    () => service.handoffConfirmedPayment(fixture({ amount: 5000 })),
    /CARTERA080_IDEMPOTENCY_CONFLICT/
  );
});
