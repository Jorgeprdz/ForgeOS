import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createCartera050FutureRadarProjection,
  normalizeCartera050FutureItem,
} from '../platform/portfolio-intelligence/cartera-050a-future-radar-projection.js';

const item = overrides => ({
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
  evidenceSummary: ['Obligación confirmada por términos de póliza'],
  uncertainty: 'No confirma que el pago ocurrirá.',
  smallestUsefulAction: 'Revisar y decidir si requiere seguimiento.',
  advisorConfirmationRequired: true,
  ...overrides,
});

const native = items => ({
  asOfDate: '2026-08-01',
  timezone: 'America/Mexico_City',
  items,
  readOnly: true,
  sourceAvailability: {
    policyPayment: 'AVAILABLE',
    relationshipMemory: 'AVAILABLE',
    documentIntake: 'AVAILABLE',
    conservationIntelligence: 'ADAPTER_REQUIRED',
    compensationIntelligence: 'ADAPTER_REQUIRED',
  },
  boundaries: {
    automaticContact: false,
    automaticOpportunity: false,
    finalMessageGeneration: false,
    lapseInference: false,
    compensationCalculation: false,
    conservationFormulaOwnership: false,
    finalPriorityTruth: false,
    humanConfirmationRequired: true,
  },
});

test('050A composes deterministic horizons without claiming final NBA priority', () => {
  const projection = createCartera050FutureRadarProjection(native([
    item({ signalReference: 'CARTERA050:TEST:30', eventDate: '2026-08-20', horizon: 'NEXT_30_DAYS' }),
    item({ signalReference: 'CARTERA050:TEST:NOW', eventDate: '2026-08-01', horizon: 'TODAY' }),
    item({ signalReference: 'CARTERA050:TEST:7', eventDate: '2026-08-03', horizon: 'NEXT_7_DAYS' }),
  ]));

  assert.deepEqual(projection.items.map(entry => entry.signalReference), [
    'CARTERA050:TEST:NOW',
    'CARTERA050:TEST:7',
    'CARTERA050:TEST:30',
  ]);
  assert.equal(projection.presentationOrderAuthority, 'DETERMINISTIC_HORIZON_ORDER_NOT_NBA_PRIORITY');
  assert.equal(projection.boundaries.finalPriorityTruth, false);
  assert.equal(projection.summary.byHorizon.TODAY, 1);
  assert.equal(projection.summary.byHorizon.NEXT_7_DAYS, 1);
});

test('050B requires every explainability answer and human confirmation', () => {
  assert.throws(
    () => normalizeCartera050FutureItem({ ...item(), uncertainty: '' }),
    /CARTERA050_UNCERTAINTY_INVALID/
  );
  assert.throws(
    () => normalizeCartera050FutureItem({ ...item(), advisorConfirmationRequired: false }),
    /CARTERA050_ADVISOR_CONFIRMATION_REQUIRED/
  );
});

test('050 projection rejects restricted formulas, final messages and priority scores', () => {
  assert.throws(
    () => normalizeCartera050FutureItem({ ...item(), priorityScore: 99 }),
    /CARTERA050_RESTRICTED_FIELD_EXPOSED/
  );
  assert.throws(
    () => normalizeCartera050FutureItem({ ...item(), finalMessage: 'Contacta ya' }),
    /CARTERA050_RESTRICTED_FIELD_EXPOSED/
  );
});
