import test from 'node:test';
import assert from 'node:assert/strict';
import { renderCartera060GrowthReview } from '../platform/relationship-intelligence/cartera-060d-growth-review-view.js';

test('060D renders all growth classes and explicit non-execution language', () => {
    const item = (growthClass) => ({
        candidateReference: `C:${growthClass}`, growthClass, personReference: 'P:1',
        displayName: 'Ana', whyThisPerson: 'Por la relación.', whyNow: 'Por el momento.',
        uncertainty: 'No sabemos interés.', smallestUsefulAction: 'Revisar.',
        advisorMustConfirm: 'Confirmar.', evidence: [{ authority: 'X', reference: 'E', truthClass: 'CONFIRMED' }],
    });
    const html = renderCartera060GrowthReview({
        status: 'READY', filter: 'ALL',
        growth: { items: [
            item('SECOND_POLICY_REVIEW'), item('PROTECTION_REVIEW'),
            item('REFERRAL_RELATIONSHIP'), item('CENTER_OF_INFLUENCE'),
        ]},
    });
    assert.match(html, /Segunda protección/);
    assert.match(html, /Centro de influencia/);
    assert.match(html, /REVISIÓN HUMANA/);
    assert.match(html, /no crea oportunidades/i);
    assert.doesNotMatch(html, /Enviar mensaje|Crear oportunidad|Pedir referido/);
});
