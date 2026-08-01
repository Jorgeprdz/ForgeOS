import test from 'node:test';
import assert from 'node:assert/strict';
import { createCartera050FutureRadarService } from '../advisor-os/cartera/cartera-050a-future-radar-service.js';

const nativeItem = {
  signalReference: 'CARTERA050:PAYMENT:1',
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

function envelope(overrides = {}) {
  return {
    asOfDate: '2026-08-01',
    timezone: 'America/Mexico_City',
    items: [nativeItem],
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
    ...overrides,
  };
}

function clientWith(data) {
  const calls = [];
  return {
    calls,
    auth: {
      async getUser() {
        return { data: { user: { id: 'advisor-1' } }, error: null };
      },
    },
    async rpc(name, args) {
      calls.push([name, args]);
      return { data, error: null };
    },
  };
}

test('050A service reads one governed RPC and leaves external authorities disconnected by default', async () => {
  const client = clientWith(envelope());
  const service = createCartera050FutureRadarService({ client });
  const radar = await service.loadFutureRadar({
    asOfDate: '2026-08-01',
    timezone: 'America/Mexico_City',
  });

  assert.equal(client.calls.length, 1);
  assert.equal(client.calls[0][0], 'forge_cartera050_list_future_radar');
  assert.equal(radar.items.length, 1);
  assert.equal(radar.sourceAvailability.conservationIntelligence, 'NOT_CONNECTED');
  assert.equal(radar.sourceAvailability.compensationIntelligence, 'NOT_CONNECTED');
  assert.equal(radar.boundaries.automaticContact, false);
});

test('050C service composes connected authority adapters without calculating their truth', async () => {
  const client = clientWith(envelope());
  const providerSignal = {
    ...nativeItem,
    signalReference: 'CARTERA050:CONSERVATION:1',
    signalType: 'CONSERVATION_RISK',
    sourceAuthority: 'CONSERVATION_INTELLIGENCE',
    sourceRecordReference: 'CONSERVATION:1',
    truthClass: 'INFERENCE',
  };
  const service = createCartera050FutureRadarService({
    client,
    conservationProvider: async () => ({ availability: 'AVAILABLE', signals: [providerSignal] }),
  });
  const radar = await service.loadFutureRadar({ asOfDate: '2026-08-01' });
  assert.equal(radar.items.length, 2);
  assert.equal(radar.sourceAvailability.conservationIntelligence, 'AVAILABLE');
  assert.equal(radar.boundaries.conservationFormulaOwnership, false);
});

test('050 service fails closed when the RPC leaks restricted provider data', async () => {
  const client = clientWith(envelope({ providerResponse: { raw: true } }));
  const service = createCartera050FutureRadarService({ client });
  await assert.rejects(
    service.loadFutureRadar({ asOfDate: '2026-08-01' }),
    /CARTERA050_RESTRICTED_FIELD_EXPOSED/
  );
});
