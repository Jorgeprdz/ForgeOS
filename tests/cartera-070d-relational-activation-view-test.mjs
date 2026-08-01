import test from 'node:test';
import assert from 'node:assert/strict';
import { renderCartera070RelationalActivation } from '../platform/experience-engine/cartera-070d-relational-activation-view.js';

const deck = {
  summary: { selectedCards: 1, selectedMinutes: 10, capacityRemaining: 50 },
  items: [{
    actionReference: 'ACTION:1', actionClass: 'CONFIRM_PAYMENT', actionLabel: 'Confirm payment',
    displayName: 'Ana', estimatedMinutes: 10, whyNow: 'Hay evidencia pendiente.',
    smallestUsefulAction: 'Revisar evidencia.', uncertainty: 'No confirma pago.',
    advisorMustConfirm: 'Confirmar monto.', evidence: [{ authority: 'PAYMENT_OBLIGATION', reference: 'OBLIGATION:1' }],
  }],
};

test('070D renders a small capacity block and explicit non-execution language', () => {
  const html = renderCartera070RelationalActivation({ status: 'READY', deck, availableMinutes: 60 });
  assert.match(html, /Tu siguiente bloque útil/);
  assert.match(html, /Preparar acción/);
  assert.match(html, /no decide la prioridad final de NBA/i);
  assert.match(html, /no usa puntos, rachas, premios variables/i);
  assert.doesNotMatch(html, /data-send-message|data-create-task|data-create-opportunity/);
});
