import test from 'node:test';
import assert from 'node:assert/strict';
import {
  groupRadarSignalsByPerson,
  renderCartera050FutureRadar,
} from '../platform/portfolio-intelligence/cartera-050d-future-radar-view.js';

const signal = {
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
};

function radarWith(items) {
  return {
    items,
    focusItems: items,
    summary: {
      byHorizon: {
        TODAY: 0,
        NEXT_7_DAYS: items.length,
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
}

const radar = radarWith([signal]);

test('050D renders horizons and the complete explainability contract in Aura hierarchy', () => {
  const html = renderCartera050FutureRadar({ status: 'READY', radar, horizon: 'ALL' });
  assert.match(html, /Radar futuro/);
  assert.match(html, /data-radar-horizon="NEXT_7_DAYS"/);
  assert.match(html, /Por qué esta persona/);
  assert.match(html, /Por qué ahora/);
  assert.match(html, /Ver evidencia/);
  assert.match(html, /Ten en cuenta/);
  assert.match(html, /Qué puedes hacer/);
  assert.match(html, /Requiere revisión/);
  assert.doesNotMatch(html, />CONFIRMAR</);
  assert.match(html, /PAYMENT_OBLIGATION/);
  assert.match(html, /OBLIGATION:1/);
  assert.match(html, /SCHEDULED_EVENT/);
});

test('050D displays disconnected authority state without inventing signals', () => {
  const html = renderCartera050FutureRadar({ status: 'READY', radar, horizon: 'ALL' });
  assert.match(html, /Conservación: No conectado/);
  assert.match(html, /Compensación: No conectado/);
  assert.doesNotMatch(html, /riskScore|commissionAmount|lapseProbability/);
});

test('050D groups two independent signals for the same canonical person without losing lineage', () => {
  const second = {
    ...signal,
    signalReference: 'CARTERA050:REVIEW:1',
    signalType: 'RELATIONSHIP_REVIEW_DUE',
    sourceAuthority: 'RELATIONSHIP_MEMORY',
    sourceRecordReference: 'RELATIONSHIP:1',
    truthClass: 'RECOMMENDATION',
    evidenceSummary: ['Última revisión registrada'],
  };
  const groups = groupRadarSignalsByPerson([signal, second]);
  assert.equal(groups.length, 1);
  assert.equal(groups[0].personReference, 'PERSON:1');
  assert.equal(groups[0].signals.length, 2);
  assert.deepEqual(groups[0].signals.map(item => item.signalReference), [signal.signalReference, second.signalReference]);

  const html = renderCartera050FutureRadar({
    status: 'READY',
    radar: radarWith([signal, second]),
    horizon: 'ALL',
    actionableSignalReference: signal.signalReference,
  });
  assert.equal((html.match(/data-radar-person-reference="PERSON:1"/g) || []).length, 1);
  assert.equal((html.match(/data-radar-signal-reference=/g) || []).length, 2);
  assert.match(html, /2 cosas para revisar/);
  assert.match(html, /PAYMENT_OBLIGATION/);
  assert.match(html, /RELATIONSHIP_MEMORY/);
  assert.match(html, new RegExp(`data-radar-decision="ACCEPT" data-radar-signal="${signal.signalReference}"`));
});

test('050D keeps different canonical people separate even when their signal type matches', () => {
  const other = {
    ...signal,
    signalReference: 'CARTERA050:TEST:2',
    personReference: 'PERSON:2',
    personDisplayName: 'Beto',
    sourceRecordReference: 'OBLIGATION:2',
  };
  const groups = groupRadarSignalsByPerson([signal, other]);
  assert.equal(groups.length, 2);
  const html = renderCartera050FutureRadar({ status: 'READY', radar: radarWith([signal, other]), horizon: 'ALL' });
  assert.equal((html.match(/data-radar-person-reference=/g) || []).length, 2);
});

test('050D never groups missing canonical identities by display name alone', () => {
  const first = { ...signal, signalReference: 'CARTERA050:UNKNOWN:1', personReference: null, personDisplayName: 'Mismo nombre' };
  const second = { ...signal, signalReference: 'CARTERA050:UNKNOWN:2', personReference: null, personDisplayName: 'Mismo nombre' };
  assert.equal(groupRadarSignalsByPerson([first, second]).length, 2);
});
