import test from 'node:test';
import assert from 'node:assert/strict';
import { createCartera030cConfirmedPaymentReconciliationService } from '../advisor-os/cartera/cartera-030c-confirmed-payment-reconciliation-service.js';

function fakeClient({ response = { reconciliationState: 'COMPLETE', outcome: 'MATCHED' } } = {}) {
    const calls = [];
    return {
        calls,
        auth: {
            async getUser() {
                return { data: { user: { id: '11111111-1111-1111-1111-111111111111' } }, error: null };
            },
        },
        async rpc(name, args) {
            calls.push({ name, args });
            return { data: response, error: null };
        },
    };
}

test('030C sends only confirmed payment operational data with stable authorization digest', async () => {
    const client = fakeClient();
    const service = createCartera030cConfirmedPaymentReconciliationService({ client });
    const result = await service.reconcileConfirmedPayment({
        policyReference: 'POLICY:001',
        paymentEvidenceReference: 'PAYMENT_EVIDENCE:001',
        paymentAmount: 1250,
        currency: 'mxn',
        paymentDate: '2026-08-01',
        periodCoveredStart: '2026-08-01',
        periodCoveredEnd: '2026-08-31',
        paymentSource: 'payment_proof',
        evidenceReferences: ['EVIDENCE:001'],
        confirmationState: 'confirmed',
        idempotencyKey: 'CARTERA030C:TEST:001',
    });

    assert.equal(result.outcome, 'MATCHED');
    assert.equal(client.calls.length, 1);
    const call = client.calls[0];
    assert.equal(call.name, 'forge_cartera030c_record_and_reconcile_confirmed_payment');
    assert.equal(call.args.p_payload.currency, 'MXN');
    assert.equal(call.args.p_payload.confirmationState, 'CONFIRMED');
    assert.equal(call.args.p_payload.authorization.authorized, true);
    assert.match(call.args.p_payload.authorization.payloadDigest, /^[a-f0-9]{64}$/);
    assert.equal('receiptNumber' in call.args.p_payload, false);
    assert.equal('bankAccount' in call.args.p_payload, false);
});

test('030C rejects extracted or pending evidence before any RPC call', async () => {
    const client = fakeClient();
    const service = createCartera030cConfirmedPaymentReconciliationService({ client });
    await assert.rejects(
        () => service.reconcileConfirmedPayment({
            policyReference: 'POLICY:001',
            paymentEvidenceReference: 'PAYMENT_EVIDENCE:001',
            paymentAmount: 1250,
            paymentDate: '2026-08-01',
            paymentSource: 'payment_proof',
            confirmationState: 'pending_confirmation',
            idempotencyKey: 'CARTERA030C:TEST:002',
        }),
        /CARTERA030C_CONFIRMED_PAYMENT_EVIDENCE_REQUIRED/
    );
    assert.equal(client.calls.length, 0);
});
