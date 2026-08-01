import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = path => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('030D product enhancement is bound before the existing Cartera route emits mounted events', async () => {
    const app = await read('app.js');
    assert.match(app, /bindCartera030dPolicyPaymentCalendar/);
    assert.match(
        app,
        /function bindCarteraProductEvents\(\) \{\s*bindCartera030dPolicyPaymentCalendar\(\);\s*(?:bindCartera040RelationshipMemory\(\);\s*)?return bindCarteraEvents\(\);/s
    );
    assert.match(app, /bindCarteraEvents: bindCarteraProductEvents/);
});

test('030D enhancement injects portfolio and policy hosts without changing payment truth', async () => {
    const source = await read('advisor-os/cartera/cartera-030d-policy-payment-calendar-enhancement.js');
    assert.match(source, /cartera-payment-calendar-panel/);
    assert.match(source, /cartera:policy-detail-mounted/);
    assert.match(source, /data-calendar-policy-open/);
    assert.match(source, /readOnly: true/);
    assert.doesNotMatch(source, /reconcileConfirmedPayment/);
    assert.doesNotMatch(source, /createPaymentEvent/);
});
