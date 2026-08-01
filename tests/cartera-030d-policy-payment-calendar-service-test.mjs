import test from 'node:test';
import assert from 'node:assert/strict';
import { createCartera030dPolicyPaymentCalendarService } from '../advisor-os/cartera/cartera-030d-policy-payment-calendar-service.js';

function fakeClient(data) {
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
            return { data, error: null };
        },
    };
}

test('030D reads sanitized portfolio and policy calendars through one RPC', async () => {
    const response = {
        scope: 'POLICY',
        summary: { today: 1, next7Days: 2, next30Days: 3, next90Days: 4, overdue: 1, confirmationRequired: 0 },
        items: [{
            obligationReference: 'PAYMENT_OBLIGATION:001',
            policyReference: 'POLICY:001',
            expectedDate: '2026-08-01',
            expectedAmount: 1200,
            currency: 'MXN',
            status: 'CONFIRMED',
            explanation: 'Pago confirmado con PaymentEvent durable.',
        }],
    };
    const client = fakeClient(response);
    const service = createCartera030dPolicyPaymentCalendarService({ client });
    const calendar = await service.loadCalendar({
        policyReference: 'POLICY:001',
        asOfDate: '2026-08-01',
        timezone: 'America/Mexico_City',
    });
    assert.equal(calendar.items.length, 1);
    assert.equal(client.calls[0].name, 'forge_cartera030d_list_policy_payment_calendar');
    assert.deepEqual(client.calls[0].args.p_payload, {
        policyReference: 'POLICY:001',
        asOfDate: '2026-08-01',
        timezone: 'America/Mexico_City',
    });
});

test('030D rejects a response that leaks restricted payment or beneficiary fields', async () => {
    const client = fakeClient({
        summary: {},
        items: [{ policyReference: 'POLICY:001', bank_account: 'forbidden' }],
    });
    const service = createCartera030dPolicyPaymentCalendarService({ client });
    await assert.rejects(
        () => service.loadCalendar({ asOfDate: '2026-08-01' }),
        /CARTERA030D_PRIVACY_BOUNDARY_VIOLATION/
    );
});
