import test from 'node:test';
import assert from 'node:assert/strict';
import { renderCartera030dPolicyPaymentCalendar } from '../platform/policy-intelligence/calendar/cartera-030d-policy-payment-calendar-view.js';

const calendar = {
    summary: {
        today: 1,
        next7Days: 2,
        next30Days: 3,
        next90Days: 4,
        overdue: 1,
        confirmationRequired: 1,
    },
    items: [{
        obligationReference: 'PAYMENT_OBLIGATION:001',
        policyReference: 'POLICY:<unsafe>',
        expectedDate: '2026-08-01',
        expectedAmount: 1200,
        currency: 'MXN',
        status: 'OVERDUE',
        horizon: 'OVERDUE',
        explanation: 'La fecha esperada pasó. Esto no prueba cancelación ni pérdida de cobertura.',
    }],
};

test('030D renders 7/30/90 horizons and the no-lapse warning', () => {
    const html = renderCartera030dPolicyPaymentCalendar({ status: 'READY', calendar, scope: 'PORTFOLIO' });
    assert.match(html, /Próximos movimientos de cartera/);
    assert.match(html, /data-calendar-summary="next7Days"/);
    assert.match(html, /data-calendar-summary="next30Days"/);
    assert.match(html, /data-calendar-summary="next90Days"/);
    assert.match(html, /no prueba cancelación ni pérdida de cobertura/i);
    assert.match(html, /data-calendar-policy-open="POLICY:&lt;unsafe&gt;"/);
    assert.equal(html.includes('POLICY:<unsafe>'), false);
});

test('030D policy scope does not render cross-policy open actions', () => {
    const html = renderCartera030dPolicyPaymentCalendar({ status: 'READY', calendar, scope: 'POLICY' });
    assert.match(html, /Calendario de pagos/);
    assert.equal(html.includes('data-calendar-policy-open'), false);
});
