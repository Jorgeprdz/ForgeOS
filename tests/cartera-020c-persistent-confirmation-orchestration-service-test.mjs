import test from 'node:test';
import assert from 'node:assert/strict';

import {
  CARTERA_020C_ORCHESTRATION_STATES,
  createPersistentConfirmationOrchestrationService,
} from '../advisor-os/cartera/persistent-confirmation-orchestration-service.js';

const advisorId = '11111111-1111-4111-8111-111111111111';
const otherAdvisor = '22222222-2222-4222-8222-222222222222';
const now = '2026-07-31T21:50:00.000Z';

function identityBatch(overrides = {}) {
  return {
    contractType: 'FORGE_CARTERA_020C_IDENTITY_COMMAND_BATCH',
    contractVersion: 'CARTERA-020C.2',
    reviewReference: 'review/020c/orchestration/1',
    packetReference: 'packet/020c/orchestration/1',
    advisorId,
    actorReference: advisorId,
    commands: [{
      candidateReference: 'identity/candidate/1',
      outcome: 'LINK_CONFIRMED',
      expectedPersonReference: 'person/ana',
      command: {
        contractType: 'FORGE_IDENTITY_RESOLUTION_COMMAND',
        contractVersion: 'CARTERA-010B.1',
        advisorId,
        actorReference: advisorId,
        idempotencyKey: 'C020C:IDENTITY:one',
        commandDigest: 'a'.repeat(64),
        sourceIdentity: {
          sourceDomain: 'CARTERA_EVIDENCE',
          sourceIdentityType: 'POLICY_PACKET_IDENTITY_CANDIDATE',
          sourceRecordReference: 'identity/candidate/1',
          prospectReference: null,
        },
      },
    }],
    accountDecisions: [{
      candidateReference: 'account/candidate/1',
      outcome: 'LINK_CONFIRMED',
      existingAccountReference: 'account/family-1',
      createsTruth: false,
    }],
    invocationOrder: ['IDENTITY_RESOLUTION'],
    createsTruth: false,
    invokesRemoteCommand: false,
    requiresExplicitExecution: true,
    ...overrides,
  };
}

function composition(overrides = {}) {
  const batch = identityBatch();
  return {
    contractType: 'FORGE_CARTERA_020C_GOVERNED_COMMAND_COMPOSITION',
    contractVersion: 'CARTERA-020C.2',
    reviewReference: batch.reviewReference,
    packetReference: batch.packetReference,
    advisorId,
    actorReference: advisorId,
    identityBatch: batch,
    identityVerification: {
      contractType: 'FORGE_CARTERA_020C_IDENTITY_RESULT_VERIFICATION',
      contractVersion: 'CARTERA-020C.2',
      reviewReference: batch.reviewReference,
      packetReference: batch.packetReference,
      advisorId,
      actorReference: advisorId,
      resolvedPeople: [{
        candidateReference: 'identity/candidate/1',
        personReference: 'person/ana',
        status: 'CONFIRMED',
        outcome: 'LINK_CONFIRMED',
        idempotencyKey: 'C020C:IDENTITY:one',
        serverCommandDigest: 'b'.repeat(64),
      }],
      resolvedAccounts: batch.accountDecisions,
      allRequiredParticipantsResolved: true,
      createsTruth: false,
      invokesRemoteCommand: false,
    },
    confirmationPlan: {
      contractType: 'FORGE_IDENTITY_POLICY_CONFIRMATION_PLAN',
      contractVersion: 'CARTERA-020C.1',
      invocationOrder: ['IDENTITY_RESOLUTION', 'CONFIRMED_POLICY'],
      confirmedPolicyCommand: {
        contractType: 'FORGE_CONFIRMED_POLICY_COMMAND',
        contractVersion: 'CARTERA-010B.1',
        advisorId,
        actorReference: advisorId,
        idempotencyKey: 'C020C:POLICY:one',
        commandDigest: 'c'.repeat(64),
        policy: { policyReference: 'policy/one' },
        roles: [],
      },
      createsTruth: false,
      invokesRemoteCommand: false,
      requiresExplicitExecution: true,
    },
    createsTruth: false,
    invokesRemoteCommand: false,
    requiresExplicitExecution: true,
    ...overrides,
  };
}

function createClient({ userId = advisorId, rpcHandler } = {}) {
  const calls = [];
  const client = {
    auth: {
      async getUser() {
        if (!userId) return { data: { user: null }, error: null };
        return { data: { user: { id: userId } }, error: null };
      },
    },
    async rpc(name, args) {
      calls.push({ name, args });
      if (rpcHandler) return rpcHandler(name, args, calls.length);
      return {
        data: {
          contractType: 'FORGE_CARTERA_020C_CONFIRMATION_STATUS',
          reviewReference: 'review/020c/orchestration/1',
          state: CARTERA_020C_ORCHESTRATION_STATES.IDENTITY_READY,
          stateVersion: 1,
        },
        error: null,
      };
    },
  };
  return { client, calls };
}

function service(options = {}) {
  const runtime = createClient(options);
  return {
    ...runtime,
    service: createPersistentConfirmationOrchestrationService({
      client: runtime.client,
      clock: () => now,
      maxSteps: 8,
    }),
  };
}

test('service rejects clients without authenticated RPC capabilities', () => {
  assert.throws(
    () => createPersistentConfirmationOrchestrationService({ client: {} }),
    /CARTERA020C_SUPABASE_CLIENT_INVALID/
  );
});

test('prepareIdentity requires an authenticated advisor', async () => {
  const { service: orchestration } = service({ userId: null });
  await assert.rejects(
    orchestration.prepareIdentity({
      identityBatch: identityBatch(),
      idempotencyKey: 'C020C:PREPARE:one',
    }),
    /CARTERA020C_AUTH_REQUIRED/
  );
});

test('prepareIdentity binds explicit authorization and never invokes 010B directly', async () => {
  const { service: orchestration, calls } = service();
  await orchestration.prepareIdentity({
    identityBatch: identityBatch(),
    idempotencyKey: 'C020C:PREPARE:one',
  });

  assert.equal(calls.length, 1);
  assert.equal(calls[0].name, 'forge_cartera020c_prepare_identity_orchestration');
  const request = calls[0].args.p_request;
  assert.equal(request.authorization.scope, 'IDENTITY_RESOLUTION');
  assert.equal(request.authorization.confirmation, 'CONFIRM_IDENTITY_RESOLUTION');
  assert.match(request.authorization.payloadDigest, /^[a-f0-9]{64}$/);
  assert.equal(request.advisorId, advisorId);
  assert.equal(calls.some((call) => call.name.startsWith('forge_cartera010b_')), false);
});

test('prepareIdentity rejects a batch owned by another advisor', async () => {
  const { service: orchestration } = service();
  await assert.rejects(
    orchestration.prepareIdentity({
      identityBatch: identityBatch({ advisorId: otherAdvisor }),
      idempotencyKey: 'C020C:PREPARE:owner-mismatch',
    }),
    /CARTERA020C_ORCHESTRATION_OWNER_MISMATCH/
  );
});

test('prepareIdentity rejects any Account creation field', async () => {
  const batch = identityBatch({
    accountDecisions: [{
      candidateReference: 'account/candidate/1',
      outcome: 'LINK_CONFIRMED',
      existingAccountReference: 'account/family-1',
      newAccount: { accountReference: 'account/new' },
      createsTruth: false,
    }],
  });
  const { service: orchestration } = service();
  await assert.rejects(
    orchestration.prepareIdentity({
      identityBatch: batch,
      idempotencyKey: 'C020C:PREPARE:account-create',
    }),
    /CARTERA020C_ACCOUNT_CREATION_NOT_AUTHORIZED/
  );
});

test('prepareIdentity rejects changed candidate binding inside an identity command', async () => {
  const batch = identityBatch();
  batch.commands[0].command.sourceIdentity.sourceRecordReference = 'identity/candidate/other';
  const { service: orchestration } = service();
  await assert.rejects(
    orchestration.prepareIdentity({
      identityBatch: batch,
      idempotencyKey: 'C020C:PREPARE:candidate-mismatch',
    }),
    /CARTERA020C_IDENTITY_COMMAND_CANDIDATE_MISMATCH/
  );
});

test('getStatus returns only the 020C status RPC result', async () => {
  const { service: orchestration, calls } = service();
  const status = await orchestration.getStatus('review/020c/orchestration/1');
  assert.equal(status.state, CARTERA_020C_ORCHESTRATION_STATES.IDENTITY_READY);
  assert.deepEqual(calls[0], {
    name: 'forge_cartera020c_get_confirmation_status',
    args: { p_review_reference: 'review/020c/orchestration/1' },
  });
});

test('executeNext carries optimistic state version to the durable executor', async () => {
  const { service: orchestration, calls } = service();
  await orchestration.executeNext({
    reviewReference: 'review/020c/orchestration/1',
    expectedStateVersion: 7,
  });
  assert.deepEqual(calls[0], {
    name: 'forge_cartera020c_execute_next_confirmation_step',
    args: {
      p_review_reference: 'review/020c/orchestration/1',
      p_expected_state_version: 7,
    },
  });
});

test('executeNext rejects stale or absent state versions before RPC execution', async () => {
  const { service: orchestration, calls } = service();
  await assert.rejects(
    orchestration.executeNext({
      reviewReference: 'review/020c/orchestration/1',
      expectedStateVersion: 0,
    }),
    /CARTERA020C_EXPECTED_STATE_VERSION_INVALID/
  );
  assert.equal(calls.length, 0);
});

test('runIdentity advances one durable command at a time and stops after verification', async () => {
  const responses = [
    { state: 'IDENTITY_READY', stateVersion: 1 },
    { state: 'IDENTITY_EXECUTING', stateVersion: 2 },
    { state: 'IDENTITY_CONFIRMED', stateVersion: 3, identityResults: [{ candidateReference: 'identity/candidate/1' }] },
  ];
  const { service: orchestration, calls } = service({
    rpcHandler(name) {
      const response = responses.shift();
      return { data: { contractType: 'FORGE_CARTERA_020C_CONFIRMATION_STATUS', reviewReference: 'review/020c/orchestration/1', ...response }, error: null };
    },
  });
  const status = await orchestration.runIdentity({
    reviewReference: 'review/020c/orchestration/1',
    expectedStateVersion: 1,
  });
  assert.equal(status.state, 'IDENTITY_CONFIRMED');
  assert.deepEqual(calls.map((call) => call.name), [
    'forge_cartera020c_get_confirmation_status',
    'forge_cartera020c_execute_next_confirmation_step',
    'forge_cartera020c_execute_next_confirmation_step',
  ]);
});

test('runIdentity returns RETRY_WAIT without spinning or bypassing retry policy', async () => {
  const { service: orchestration, calls } = service({
    rpcHandler() {
      return { data: { reviewReference: 'review/020c/orchestration/1', state: 'RETRY_WAIT', stateVersion: 4 }, error: null };
    },
  });
  const status = await orchestration.runIdentity({
    reviewReference: 'review/020c/orchestration/1',
    expectedStateVersion: 4,
  });
  assert.equal(status.state, 'RETRY_WAIT');
  assert.equal(calls.length, 1);
});

test('runIdentity stops immediately on a durable conflict', async () => {
  const responses = [
    { state: 'IDENTITY_READY', stateVersion: 1 },
    { state: 'BLOCKED', stateVersion: 2, lastErrorCode: 'CARTERA010B_IDENTITY_UNRESOLVED' },
  ];
  const { service: orchestration, calls } = service({
    rpcHandler() {
      const response = responses.shift();
      return { data: { reviewReference: 'review/020c/orchestration/1', ...response }, error: null };
    },
  });
  const status = await orchestration.runIdentity({
    reviewReference: 'review/020c/orchestration/1',
    expectedStateVersion: 1,
  });
  assert.equal(status.state, 'BLOCKED');
  assert.equal(calls.length, 2);
});

test('attachPolicy requires verified identities and exact identity-before-policy order', async () => {
  const invalid = composition({
    identityVerification: {
      reviewReference: 'review/020c/orchestration/1',
      allRequiredParticipantsResolved: false,
    },
  });
  const { service: orchestration } = service();
  await assert.rejects(
    orchestration.attachPolicy({
      composition: invalid,
      idempotencyKey: 'C020C:POLICY:attach-invalid',
    }),
    /CARTERA020C_IDENTITY_VERIFICATION_NOT_READY/
  );
});

test('attachPolicy emits explicit final Policy authorization through 020C only', async () => {
  const { service: orchestration, calls } = service();
  await orchestration.attachPolicy({
    composition: composition(),
    idempotencyKey: 'C020C:POLICY:attach-one',
  });
  assert.equal(calls[0].name, 'forge_cartera020c_attach_policy_confirmation');
  const request = calls[0].args.p_request;
  assert.equal(request.authorization.scope, 'CONFIRMED_POLICY');
  assert.equal(request.authorization.confirmation, 'CONFIRM_POLICY_PERSISTENCE');
  assert.match(request.authorization.payloadDigest, /^[a-f0-9]{64}$/);
  assert.equal(calls.some((call) => call.name === 'forge_cartera010b_confirm_policy_with_parties'), false);
});

test('runPolicy reaches CONFIRMED without exposing command payloads', async () => {
  const responses = [
    { state: 'POLICY_READY', stateVersion: 8 },
    { state: 'CONFIRMED', stateVersion: 9, policyResult: { policyReference: 'policy/one' } },
  ];
  const { service: orchestration } = service({
    rpcHandler() {
      const response = responses.shift();
      return { data: { reviewReference: 'review/020c/orchestration/1', ...response }, error: null };
    },
  });
  const status = await orchestration.runPolicy({
    reviewReference: 'review/020c/orchestration/1',
    expectedStateVersion: 8,
  });
  assert.equal(status.state, 'CONFIRMED');
  assert.equal(Object.hasOwn(status, 'commandPayload'), false);
});

test('retry is explicit, optimistic and owner-authenticated', async () => {
  const { service: orchestration, calls } = service();
  await orchestration.retry({
    reviewReference: 'review/020c/orchestration/1',
    expectedStateVersion: 4,
  });
  assert.equal(calls[0].name, 'forge_cartera020c_retry_confirmation');
  assert.equal(calls[0].args.p_expected_state_version, 4);
  assert.equal(calls[0].args.p_requested_at, now);
});

test('Supabase RPC failures preserve a stable orchestration error code', async () => {
  const { service: orchestration } = service({
    rpcHandler() {
      return { data: null, error: { message: 'network failed' } };
    },
  });
  await assert.rejects(
    orchestration.getStatus('review/020c/orchestration/1'),
    (error) => error.code === 'CARTERA020C_STATUS_READ_FAILED' && error.cause.message === 'network failed'
  );
});
