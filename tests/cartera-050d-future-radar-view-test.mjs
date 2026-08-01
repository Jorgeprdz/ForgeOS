import test from 'node:test';
import assert from 'node:assert/strict';
import { renderCartera050FutureRadar } from '../platform/portfolio-intelligence/cartera-050d-future-radar-view.js';

const radar = {
  items: [{
    signalReference: 'CARTERA050:TEST:1',
    personReference: 'PERSON:1',
    personDisplayName: 'Ana',
    policyReference: 'POLICY:1',
    signalType: 'EXPECTED_PAYMENT',
    eventDate: '2026-08-02',
    horizon: 'NEXT_7_DAYS',
    truthClass: 'SCHEDULED_EVENT',
    sourceAuthority: 'PAYMENT_OBLIGATION',
    sourceRecordReference: 'OBLIGATION:1',
    whyThisPerson: 'Ana participa en la póliza.',
    whyNow: 'La fecha está dentro de siete días.',
    evidenceSummary: ['Obligación 1'],
    uncertainty: 'No confirma que el pago ocurrirá.',
    smallestUsefulAction: 'Revisar la obligación.',
    advisorConfirmationRequired: true,
    readOnly: true,
  }],
  focusItems: [],
  summary: {
    byHorizon: {
      TODAY: 0,
      NEXT_7_DAYS: 1,
      NEXT_30_DAYS: 0,
      NEXT_90_DAYS: 0,
      CONFIRMATION_REQUIRED: 0,
      OVERDUE: 0,
    },
  },
  sourceAvailability: {
    policyPayment: 'AVAILABLE',
    relationshipMemory: 'AVAILABLE',
    documentIntake: 'AVAILABLE',
    conservationIntelligence: 'NOT_CONNECTED',
    compensationIntelligence: 'NOT_CONNECTED',
  },
};
radar.focusItems = radar.items;

test('050D renders horizons and the complete explainability contract', () => {
  const html = renderCartera050FutureRadar({ status: 'READY', radar, horizon: 'ALL' });
  assert.match(html, /Radar futuro/);
  assert.match(html, /data-radar-horizon="NEXT_7_DAYS"/);
  assert.match(html, /Por qué esta persona/);
  assert.match(html, /Por qué ahora/);
  assert.match(html, /Evidencia/);
  assert.match(html, /Incertidumbre/);
  assert.match(html, /Acción mínima/);
  assert.match(html, /CONFIRMAR/);
  assert.match(html, /no es prioridad final de NBA/i);
});

test('050D displays disconnected authority state without inventing signals', () => {
  const html = renderCartera050FutureRadar({ status: 'READY', radar, horizon: 'ALL' });
  assert.match(html, /Conservación: No conectado/);
  assert.match(html, /Compensación: No conectado/);
  assert.doesNotMatch(html, /riskScore|commissionAmount|lapseProbability/);
});
