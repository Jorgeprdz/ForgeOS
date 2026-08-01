import test from 'node:test';
import assert from 'node:assert/strict';
import { renderCartera080EconomicConnection } from '../platform/economic-connection/cartera-080-economic-connection-view.js';

test('080D distingue evidencia, conocimiento, decisión y truth owner', () => {
  const html = renderCartera080EconomicConnection({
    status: 'READY',
    items: [{
      evidenceId: 'ev-1',
      status: 'review_required',
      evidenceClaim: {
        amount: 3890.21,
        currency: 'MXN',
        paymentDate: '2026-08-01',
        policyReference: 'policy-1',
        sourceType: 'payment_proof',
      },
      systemKnowledge: {
        status: 'review_required',
        contradictions: ['amount_mismatch'],
        missingFields: [],
      },
      humanDecision: null,
      canonicalHandoff: null,
      truthOwner: 'none',
      allowedActions: ['review', 'confirm', 'reject'],
    }],
  });
  assert.match(html, /La evidencia afirma/);
  assert.match(html, /El sistema sabe/);
  assert.match(html, /Verdad actual/);
  assert.match(html, /Confirmar/);
});

test('080D no presenta controles de comisión o ledger', () => {
  const html = renderCartera080EconomicConnection({ status: 'READY', items: [] });
  assert.match(html, /sin cálculo de comisión/i);
  assert.match(html, /sin mutación de ledger/i);
  assert.doesNotMatch(html, /Calcular comisión|Editar ledger|Marcar pagado automáticamente/);
});

test('080D escapa contenido de evidencia no confiable', () => {
  const html = renderCartera080EconomicConnection({
    status: 'READY',
    items: [{
      evidenceId: '<script>alert(1)</script>',
      status: 'received',
      evidenceClaim: { amount: null, currency: null, paymentDate: null, policyReference: null, sourceType: '<img src=x>' },
      systemKnowledge: null,
      humanDecision: null,
      canonicalHandoff: null,
      truthOwner: 'none',
      allowedActions: [],
    }],
  });
  assert.doesNotMatch(html, /<script>|<img src=x>/);
  assert.match(html, /&lt;script&gt;/);
});
