import test from 'node:test';
import assert from 'node:assert/strict';
import {
  loadCartera050Authority,
  normalizeCartera050AuthorityEnvelope,
  unavailableCartera050Authority,
} from '../platform/portfolio-intelligence/cartera-050c-authority-adapters.js';

const signal = overrides => ({
  signalReference: 'CARTERA050:CONSERVATION:1',
  personReference: 'PERSON:1',
  personDisplayName: 'Ana',
  policyReference: 'POLICY:1',
  signalType: 'CONSERVATION_RISK',
  eventDate: '2026-08-05',
  horizon: 'NEXT_7_DAYS',
  truthClass: 'INFERENCE',
  sourceAuthority: 'CONSERVATION_INTELLIGENCE',
  sourceRecordReference: 'CONSERVATION:EVENT:1',
  whyThisPerson: 'La póliza pertenece a esta relación.',
  whyNow: 'La autoridad de conservación emitió una señal vigente.',
  evidenceSummary: ['Señal explicable de Conservation Intelligence'],
  uncertainty: 'No confirma lapse ni cancelación.',
  smallestUsefulAction: 'Revisar la señal y decidir una acción de servicio.',
  advisorConfirmationRequired: true,
  ...overrides,
});

test('050C defaults to not connected and fabricates no conservation or compensation truth', () => {
  const conservation = unavailableCartera050Authority('CONSERVATION_INTELLIGENCE');
  const compensation = unavailableCartera050Authority('COMPENSATION_INTELLIGENCE');
  assert.equal(conservation.availability, 'NOT_CONNECTED');
  assert.equal(compensation.availability, 'NOT_CONNECTED');
  assert.deepEqual(conservation.signals, []);
  assert.deepEqual(compensation.signals, []);
});

test('050C passes through only explainable authoritative conservation signals', () => {
  const result = normalizeCartera050AuthorityEnvelope('CONSERVATION_INTELLIGENCE', {
    availability: 'AVAILABLE',
    signals: [signal()],
  });
  assert.equal(result.signals.length, 1);
  assert.equal(result.signals[0].sourceAuthority, 'CONSERVATION_INTELLIGENCE');
  assert.equal(result.signals[0].advisorConfirmationRequired, true);
});

test('050C blocks formulas, scores, payout amounts and authority mismatches', () => {
  assert.throws(
    () => normalizeCartera050AuthorityEnvelope('CONSERVATION_INTELLIGENCE', {
      availability: 'AVAILABLE',
      signals: [signal({ riskScore: 0.91 })],
    }),
    /CARTERA050_EXTERNAL_AUTHORITY_LEAK/
  );
  assert.throws(
    () => normalizeCartera050AuthorityEnvelope('COMPENSATION_INTELLIGENCE', {
      availability: 'AVAILABLE',
      signals: [signal({
        sourceAuthority: 'COMPENSATION_INTELLIGENCE',
        signalType: 'EXPECTED_COMMISSION_EVENT',
        commissionAmount: 5000,
      })],
    }),
    /CARTERA050_EXTERNAL_AUTHORITY_LEAK/
  );
  assert.throws(
    () => normalizeCartera050AuthorityEnvelope('CONSERVATION_INTELLIGENCE', {
      availability: 'AVAILABLE',
      signals: [signal({ sourceAuthority: 'POLICY_INTELLIGENCE' })],
    }),
    /CARTERA050_EXTERNAL_SOURCE_AUTHORITY_MISMATCH/
  );
});

test('050C loads a connected provider through a read-only context', async () => {
  let received;
  const result = await loadCartera050Authority(async context => {
    received = context;
    return { availability: 'AVAILABLE', signals: [signal()] };
  }, 'CONSERVATION_INTELLIGENCE', { readOnly: true, asOfDate: '2026-08-01' });
  assert.equal(received.readOnly, true);
  assert.equal(result.availability, 'AVAILABLE');
});
