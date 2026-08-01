import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createCartera100ProductivityProofService,
} from '../advisor-os/cartera/cartera-100c-productivity-proof-service.js';

function boundaries() {
  return {
    humanPerformanceScore: false,
    advisorRanking: false,
    humanWorthInference: false,
    motivationInference: false,
    disciplineInference: false,
    enforcementRecommendation: false,
    silentConsentInference: false,
    contactVolumeOptimization: false,
    causalityClaimWithoutEvidence: false,
    automaticContactExecution: false,
    automaticMessageGeneration: false,
    automaticTaskCreation: false,
    automaticCalendarCreation: false,
    automaticOpportunityCreation: false,
    advisorFeedbackRequiredForLearning: true,
  };
}

function proofPayload() {
  return {
    period: {
      startDate: '2026-08-01',
      endDate: '2026-08-31',
      timeZone: 'America/Mexico_City',
    },
    authoritativeMetrics: [{
      metricKey: 'RELATIONSHIP_REVIEWS_COMPLETED',
      metricCategory: 'GROWTH',
      state: 'ZERO',
      value: 0,
      unit: 'COUNT',
      sourceAuthority: 'CARTERA040_RELATIONSHIP_MEMORY',
      evidenceReferences: ['scan-review-1'],
    }],
    observations: [],
    recentRecommendations: [],
    sourceState: {
      productivityObservationLedger: 'COMPLETE',
    },
    instrumentation: {
      coverageState: 'COMPLETE',
    },
    boundaries: boundaries(),
    projectionAuthority: 'CARTERA100_PRODUCTIVITY_PROOF_READ_MODEL',
    readOnly: true,
  };
}

function client({ proof = proofPayload(), writeResult = null } = {}) {
  const calls = [];
  const resolved = {
    calls,
    auth: {
      async getUser() {
        return { data: { user: { id: 'advisor-1' } }, error: null };
      },
    },
    async rpc(name, args) {
      calls.push({ name, args });
      if (name === 'forge_cartera100_list_productivity_proof') {
        return { data: proof, error: null };
      }
      if (name === 'forge_cartera100_record_productivity_observation') {
        return {
          data: writeResult || {
            recordingState: 'COMPLETE',
            observationReference: `observation-${calls.length}`,
            metricKey: args.p_payload.metricKey,
            metricCategory: args.p_payload.metricCategory,
            recommendationReference: args.p_payload.recommendationReference,
            attributionState: args.p_payload.attributionState,
            usefulnessFeedback: args.p_payload.usefulnessFeedback,
            humanScoreCreated: false,
            advisorRankingCreated: false,
            automaticActionExecuted: false,
            causalCreditClaimed: false,
          },
          error: null,
        };
      }
      throw new Error(`unexpected rpc ${name}`);
    },
  };
  return resolved;
}

test('100C loads the owner-scoped proof and preserves unknown source states', async () => {
  const mock = client({
    proof: {
      ...proofPayload(),
      sourceState: {
        productivityObservationLedger: 'COMPLETE',
        activityHours: 'NOT_CONNECTED',
      },
    },
  });
  const service = createCartera100ProductivityProofService({ client: mock });
  const proof = await service.loadProductivityProof({
    startDate: '2026-08-01',
    endDate: '2026-08-31',
    limit: 100,
  });
  assert.equal(proof.projectionAuthority, 'CARTERA100_PRODUCTIVITY_PROOF_READ_MODEL');
  assert.equal(proof.sourceState.activityHours, 'NOT_CONNECTED');
  assert.equal(proof.metrics.ADVISOR_WORK_MINUTES.state, 'MISSING');
  assert.deepEqual(mock.calls[0], {
    name: 'forge_cartera100_list_productivity_proof',
    args: {
      p_payload: {
        startDate: '2026-08-01',
        endDate: '2026-08-31',
        limit: 100,
      },
    },
  });
});

test('100C records explicit observation with digest-bound authorization', async () => {
  const mock = client();
  const service = createCartera100ProductivityProofService({ client: mock });
  const receipt = await service.recordGenericProof({
    metricKey: 'WORK_MINUTES_AVOIDED',
    metricCategory: 'WORK_REDUCTION',
    quantity: 60,
    unit: 'MINUTES',
    metricState: 'KNOWN',
    sourceAuthority: 'POLICY_INTAKE',
    sourceRecordReference: 'import-1',
    evidenceReferences: ['import-1'],
    occurredAt: '2026-08-01T12:00:00Z',
    idempotencyKey: 'proof-import-1',
  });
  const call = mock.calls.find(entry => entry.name === 'forge_cartera100_record_productivity_observation');
  assert.equal(call.args.p_payload.authorization.authorized, true);
  assert.match(call.args.p_payload.authorization.payloadDigest, /^[a-f0-9]{64}$/);
  assert.equal(call.args.p_payload.metricKey, 'WORK_MINUTES_AVOIDED');
  assert.equal(receipt.humanScoreCreated, false);
  assert.equal(receipt.automaticActionExecuted, false);
});

test('100C records second-policy acceptance as two bounded observations', async () => {
  const mock = client();
  const service = createCartera100ProductivityProofService({ client: mock });
  const receipts = await service.recordAcceptedRecommendation({
    recommendationReference: 'growth-candidate-1',
    recommendationClass: 'SECOND_POLICY_REVIEW',
    sourceAuthority: 'CARTERA060_RELATIONSHIP_GROWTH',
    evidenceReferences: ['growth-evidence-1'],
    occurredAt: '2026-08-01T13:00:00Z',
  });
  const writes = mock.calls.filter(entry => entry.name === 'forge_cartera100_record_productivity_observation');
  assert.equal(writes.length, 2);
  assert.deepEqual(writes.map(entry => entry.args.p_payload.metricKey), [
    'ACCEPTED_RECOMMENDATIONS',
    'SECOND_POLICY_REVIEWS',
  ]);
  assert.equal(receipts.length, 2);
  assert.ok(writes.every(entry => entry.args.p_payload.metadata.causalOutcomeClaimed === false));
});

test('100C records explicit independent feedback without inferring consent', async () => {
  const mock = client();
  const service = createCartera100ProductivityProofService({ client: mock });
  const receipt = await service.recordAdvisorFeedback({
    recommendationReference: 'action-1',
    recommendationClass: 'CONFIRM_PAYMENT',
    feedback: 'INDEPENDENT',
    evidenceReferences: ['action-1'],
    occurredAt: '2026-08-01T14:00:00Z',
  });
  const write = mock.calls.find(entry => entry.name === 'forge_cartera100_record_productivity_observation');
  assert.equal(write.args.p_payload.metricKey, 'INDEPENDENT_OUTCOME_FEEDBACK');
  assert.equal(write.args.p_payload.attributionState, 'INDEPENDENT');
  assert.equal(write.args.p_payload.metadata.permissionInferredFromSilence, false);
  assert.equal(receipt.causalCreditClaimed, false);
});

test('100C rejects invalid period, evidence-free writes and restricted metadata before RPC', async () => {
  const mock = client();
  const service = createCartera100ProductivityProofService({ client: mock });
  await assert.rejects(
    () => service.loadProductivityProof({ startDate: '2026-08-31', endDate: '2026-08-01' }),
    /CARTERA100_PROOF_QUERY_INVALID/
  );
  await assert.rejects(
    () => service.recordGenericProof({
      metricKey: 'WORK_MINUTES_AVOIDED',
      metricCategory: 'WORK_REDUCTION',
      quantity: 60,
      unit: 'MINUTES',
      metricState: 'KNOWN',
      sourceAuthority: 'POLICY_INTAKE',
      sourceRecordReference: 'import-1',
      evidenceReferences: [],
      occurredAt: '2026-08-01T12:00:00Z',
      idempotencyKey: 'proof-import-1',
    }),
    /CARTERA100_LEARNING_EVIDENCE_REQUIRED/
  );
  await assert.rejects(
    () => service.recordObservation({
      metricKey: 'WORK_MINUTES_AVOIDED',
      metricCategory: 'WORK_REDUCTION',
      quantity: 60,
      unit: 'MINUTES',
      metricState: 'KNOWN',
      sourceAuthority: 'POLICY_INTAKE',
      sourceRecordReference: 'import-2',
      evidenceReferences: ['import-2'],
      occurredAt: '2026-08-01T12:00:00Z',
      idempotencyKey: 'proof-import-2',
      metadata: { advisorRanking: 1 },
    }),
    /CARTERA100_RESTRICTED_FIELD_EXPOSED/
  );
});

test('100C fails honestly on auth and RPC errors', async () => {
  const noAuth = client();
  noAuth.auth.getUser = async () => ({ data: { user: null }, error: null });
  const unauthenticated = createCartera100ProductivityProofService({ client: noAuth });
  await assert.rejects(() => unauthenticated.loadProductivityProof(), /CARTERA100_AUTH_REQUIRED/);

  const broken = client();
  broken.rpc = async () => ({ data: null, error: new Error('offline') });
  const unavailable = createCartera100ProductivityProofService({ client: broken });
  await assert.rejects(() => unavailable.loadProductivityProof(), /CARTERA100_PROOF_READ_FAILED/);
});
