// CARTERA 020C authenticated persistent confirmation orchestration.
// The service never writes canonical tables directly. It invokes only the accepted
// 020C lifecycle RPCs, which in turn sequence the governed 010B mutation authorities.

export const CARTERA_020C_ORCHESTRATION_STATES = Object.freeze({
  IDENTITY_READY: 'IDENTITY_READY',
  IDENTITY_EXECUTING: 'IDENTITY_EXECUTING',
  IDENTITY_CONFIRMED: 'IDENTITY_CONFIRMED',
  POLICY_READY: 'POLICY_READY',
  POLICY_EXECUTING: 'POLICY_EXECUTING',
  RETRY_WAIT: 'RETRY_WAIT',
  BLOCKED: 'BLOCKED',
  REJECTED: 'REJECTED',
  CONFIRMED: 'CONFIRMED',
});

const TERMINAL_STATES = new Set([
  CARTERA_020C_ORCHESTRATION_STATES.BLOCKED,
  CARTERA_020C_ORCHESTRATION_STATES.REJECTED,
  CARTERA_020C_ORCHESTRATION_STATES.CONFIRMED,
]);
const REFERENCE_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,239}$/;
const IDEMPOTENCY_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,159}$/;
const DIGEST_PATTERN = /^[a-f0-9]{64}$/;
const AUTHORIZATION_KEY_COLLATOR = new Intl.Collator('en-US', {
  usage: 'sort',
  sensitivity: 'variant',
});

function fail(code, cause = null) {
  const error = new Error(code);
  error.code = code;
  if (cause) error.cause = cause;
  return error;
}

function isRecord(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function requireRecord(value, code) {
  if (!isRecord(value)) throw fail(code);
  return value;
}

function requireReference(value, code) {
  if (typeof value !== 'string' || !REFERENCE_PATTERN.test(value)) throw fail(code);
  return value;
}

function requireIdempotency(value, code) {
  if (typeof value !== 'string' || !IDEMPOTENCY_PATTERN.test(value)) throw fail(code);
  return value;
}

function requireIso(value, code) {
  if (typeof value !== 'string' || Number.isNaN(Date.parse(value))) throw fail(code);
  return new Date(value).toISOString();
}

function rpcData(result, code) {
  if (result?.error) throw fail(code, result.error);
  if (!isRecord(result?.data)) throw fail(code);
  return Object.freeze(result.data);
}

function stableJson(value) {
  if (Array.isArray(value)) return value.map(stableJson);
  if (!isRecord(value)) return value;
  return Object.keys(value)
    .sort((left, right) => AUTHORIZATION_KEY_COLLATOR.compare(left, right))
    .reduce((output, key) => {
      output[key] = stableJson(value[key]);
      return output;
    }, {});
}

async function authorizationDigest(payload) {
  const cryptoApi = globalThis.crypto?.subtle;
  if (!cryptoApi || typeof TextEncoder !== 'function') {
    throw fail('CARTERA020C_AUTHORIZATION_CRYPTO_UNAVAILABLE');
  }
  const bytes = new TextEncoder().encode(JSON.stringify(stableJson(payload)));
  const buffer = await cryptoApi.digest('SHA-256', bytes);
  return [...new Uint8Array(buffer)]
    .map((value) => value.toString(16).padStart(2, '0'))
    .join('');
}

async function authenticatedUser(client) {
  const result = await client.auth.getUser();
  if (result?.error) throw fail('CARTERA020C_AUTH_LOOKUP_FAILED', result.error);
  if (!result?.data?.user?.id) throw fail('CARTERA020C_AUTH_REQUIRED');
  return result.data.user;
}

function validateActorEnvelope(envelope, userId, code) {
  requireRecord(envelope, code);
  if (envelope.advisorId !== userId || envelope.actorReference !== userId) {
    throw fail('CARTERA020C_ORCHESTRATION_OWNER_MISMATCH');
  }
  return envelope;
}

function validateOwnerEnvelope(envelope, userId, code) {
  validateActorEnvelope(envelope, userId, code);
  requireReference(envelope.reviewReference, 'CARTERA020C_REVIEW_REFERENCE_INVALID');
  return envelope;
}

function validateIdentityBatch(batch, userId) {
  validateOwnerEnvelope(batch, userId, 'CARTERA020C_IDENTITY_BATCH_REQUIRED');
  if (batch.contractType !== 'FORGE_CARTERA_020C_IDENTITY_COMMAND_BATCH'
      || batch.contractVersion !== 'CARTERA-020C.2') {
    throw fail('CARTERA020C_IDENTITY_BATCH_INVALID');
  }
  if (batch.createsTruth !== false
      || batch.invokesRemoteCommand !== false
      || batch.requiresExplicitExecution !== true) {
    throw fail('CARTERA020C_IDENTITY_BATCH_BOUNDARY_INVALID');
  }
  requireReference(batch.packetReference, 'CARTERA020C_PACKET_REFERENCE_INVALID');
  if (!Array.isArray(batch.commands) || !Array.isArray(batch.accountDecisions)) {
    throw fail('CARTERA020C_IDENTITY_BATCH_CONTENT_INVALID');
  }

  const candidateReferences = new Set();
  for (const item of batch.commands) {
    requireRecord(item, 'CARTERA020C_IDENTITY_COMMAND_ITEM_INVALID');
    requireReference(item.candidateReference, 'CARTERA020C_IDENTITY_CANDIDATE_REFERENCE_INVALID');
    requireReference(item.expectedPersonReference, 'CARTERA020C_EXPECTED_PERSON_REFERENCE_INVALID');
    if (candidateReferences.has(item.candidateReference)) {
      throw fail('CARTERA020C_IDENTITY_CANDIDATE_DUPLICATED');
    }
    candidateReferences.add(item.candidateReference);
    const command = validateActorEnvelope(
      item.command,
      userId,
      'CARTERA020C_IDENTITY_COMMAND_REQUIRED'
    );
    if (command.contractType !== 'FORGE_IDENTITY_RESOLUTION_COMMAND'
        || command.contractVersion !== 'CARTERA-010B.1') {
      throw fail('CARTERA020C_IDENTITY_COMMAND_CONTRACT_INVALID');
    }
    requireIdempotency(command.idempotencyKey, 'CARTERA020C_IDENTITY_IDEMPOTENCY_INVALID');
    if (!DIGEST_PATTERN.test(command.commandDigest || '')) {
      throw fail('CARTERA020C_IDENTITY_COMMAND_DIGEST_INVALID');
    }
    if (command.sourceIdentity?.sourceRecordReference !== item.candidateReference) {
      throw fail('CARTERA020C_IDENTITY_COMMAND_CANDIDATE_MISMATCH');
    }
  }

  for (const decision of batch.accountDecisions) {
    requireRecord(decision, 'CARTERA020C_ACCOUNT_DECISION_INVALID');
    requireReference(decision.candidateReference, 'CARTERA020C_ACCOUNT_CANDIDATE_REFERENCE_INVALID');
    if (!['LINK_CONFIRMED', 'NOT_APPLICABLE'].includes(decision.outcome)) {
      throw fail('CARTERA020C_ACCOUNT_DECISION_INVALID');
    }
    if (Object.hasOwn(decision, 'newAccount')) {
      throw fail('CARTERA020C_ACCOUNT_CREATION_NOT_AUTHORIZED');
    }
    if (decision.createsTruth !== false) {
      throw fail('CARTERA020C_ACCOUNT_DECISION_TRUTH_BOUNDARY_INVALID');
    }
    if (decision.outcome === 'LINK_CONFIRMED') {
      requireReference(
        decision.existingAccountReference,
        'CARTERA020C_EXISTING_ACCOUNT_REFERENCE_INVALID'
      );
    }
  }

  return batch;
}

function validatePolicyComposition(composition, userId) {
  requireRecord(composition, 'CARTERA020C_POLICY_COMPOSITION_REQUIRED');
  requireReference(composition.reviewReference, 'CARTERA020C_REVIEW_REFERENCE_INVALID');
  if (composition.contractType !== 'FORGE_CARTERA_020C_GOVERNED_COMMAND_COMPOSITION'
      || composition.contractVersion !== 'CARTERA-020C.2') {
    throw fail('CARTERA020C_POLICY_COMPOSITION_INVALID');
  }
  if (composition.createsTruth !== false
      || composition.invokesRemoteCommand !== false
      || composition.requiresExplicitExecution !== true) {
    throw fail('CARTERA020C_POLICY_COMPOSITION_BOUNDARY_INVALID');
  }
  const identityBatch = validateIdentityBatch(composition.identityBatch, userId);
  if (identityBatch.reviewReference !== composition.reviewReference
      || identityBatch.packetReference !== composition.packetReference) {
    throw fail('CARTERA020C_POLICY_COMPOSITION_SCOPE_MISMATCH');
  }
  const verification = requireRecord(
    composition.identityVerification,
    'CARTERA020C_IDENTITY_VERIFICATION_REQUIRED'
  );
  if (verification.reviewReference !== composition.reviewReference
      || verification.allRequiredParticipantsResolved !== true) {
    throw fail('CARTERA020C_IDENTITY_VERIFICATION_NOT_READY');
  }
  const plan = requireRecord(
    composition.confirmationPlan,
    'CARTERA020C_CONFIRMATION_PLAN_REQUIRED'
  );
  if (!Array.isArray(plan.invocationOrder)
      || plan.invocationOrder.length !== 2
      || plan.invocationOrder[0] !== 'IDENTITY_RESOLUTION'
      || plan.invocationOrder[1] !== 'CONFIRMED_POLICY') {
    throw fail('CARTERA020C_CONFIRMATION_ORDER_INVALID');
  }
  if (plan.createsTruth !== false
      || plan.invokesRemoteCommand !== false
      || plan.requiresExplicitExecution !== true) {
    throw fail('CARTERA020C_CONFIRMATION_PLAN_BOUNDARY_INVALID');
  }
  const command = validateActorEnvelope(
    plan.confirmedPolicyCommand,
    userId,
    'CARTERA020C_CONFIRMED_POLICY_COMMAND_REQUIRED'
  );
  if (command.contractType !== 'FORGE_CONFIRMED_POLICY_COMMAND'
      || command.contractVersion !== 'CARTERA-010B.1') {
    throw fail('CARTERA020C_CONFIRMED_POLICY_COMMAND_INVALID');
  }
  requireIdempotency(command.idempotencyKey, 'CARTERA020C_POLICY_IDEMPOTENCY_INVALID');
  if (!DIGEST_PATTERN.test(command.commandDigest || '')) {
    throw fail('CARTERA020C_POLICY_COMMAND_DIGEST_INVALID');
  }
  return composition;
}

async function authorization({
  scope,
  reviewReference,
  userId,
  authorizedAt,
  confirmation,
  payload,
}) {
  return Object.freeze({
    contractType: 'FORGE_CARTERA_020C_EXECUTION_AUTHORIZATION',
    contractVersion: 'CARTERA-020C.3',
    scope,
    reviewReference,
    advisorId: userId,
    actorReference: userId,
    authorizedAt: requireIso(authorizedAt, 'CARTERA020C_AUTHORIZED_AT_REQUIRED'),
    confirmation,
    payloadDigest: await authorizationDigest(payload),
  });
}

export function createPersistentConfirmationOrchestrationService({
  client,
  clock,
  maxSteps = 64,
} = {}) {
  const resolvedClient = client;
  const resolvedClock = typeof clock === 'function'
    ? clock
    : () => new Date().toISOString();

  if (!resolvedClient?.auth?.getUser || !resolvedClient?.rpc) {
    throw fail('CARTERA020C_SUPABASE_CLIENT_INVALID');
  }
  if (!Number.isInteger(maxSteps) || maxSteps < 1 || maxSteps > 256) {
    throw fail('CARTERA020C_MAX_STEPS_INVALID');
  }

  async function getStatus(reviewReference) {
    await authenticatedUser(resolvedClient);
    const reference = requireReference(
      reviewReference,
      'CARTERA020C_REVIEW_REFERENCE_INVALID'
    );
    const result = await resolvedClient.rpc(
      'forge_cartera020c_get_confirmation_status',
      { p_review_reference: reference }
    );
    return rpcData(result, 'CARTERA020C_STATUS_READ_FAILED');
  }

  async function prepareIdentity({
    identityBatch,
    idempotencyKey,
    requestedAt = resolvedClock(),
  } = {}) {
    const user = await authenticatedUser(resolvedClient);
    const batch = validateIdentityBatch(identityBatch, user.id);
    const timestamp = requireIso(requestedAt, 'CARTERA020C_IDENTITY_REQUESTED_AT_REQUIRED');
    const request = Object.freeze({
      contractType: 'FORGE_CARTERA_020C_IDENTITY_EXECUTION_REQUEST',
      contractVersion: 'CARTERA-020C.3',
      advisorId: user.id,
      actorReference: user.id,
      reviewReference: batch.reviewReference,
      packetReference: batch.packetReference,
      idempotencyKey: requireIdempotency(
        idempotencyKey,
        'CARTERA020C_IDENTITY_REQUEST_IDEMPOTENCY_INVALID'
      ),
      requestedAt: timestamp,
      authorization: await authorization({
        scope: 'IDENTITY_RESOLUTION',
        reviewReference: batch.reviewReference,
        userId: user.id,
        authorizedAt: timestamp,
        confirmation: 'CONFIRM_IDENTITY_RESOLUTION',
        payload: batch,
      }),
      identityBatch: batch,
    });
    const result = await resolvedClient.rpc(
      'forge_cartera020c_prepare_identity_orchestration',
      { p_request: request }
    );
    return rpcData(result, 'CARTERA020C_IDENTITY_PREPARATION_FAILED');
  }

  async function attachPolicy({
    composition,
    idempotencyKey,
    requestedAt = resolvedClock(),
  } = {}) {
    const user = await authenticatedUser(resolvedClient);
    const resolvedComposition = validatePolicyComposition(composition, user.id);
    const timestamp = requireIso(requestedAt, 'CARTERA020C_POLICY_REQUESTED_AT_REQUIRED');
    const request = Object.freeze({
      contractType: 'FORGE_CARTERA_020C_POLICY_EXECUTION_REQUEST',
      contractVersion: 'CARTERA-020C.3',
      advisorId: user.id,
      actorReference: user.id,
      reviewReference: resolvedComposition.reviewReference,
      packetReference: resolvedComposition.packetReference,
      idempotencyKey: requireIdempotency(
        idempotencyKey,
        'CARTERA020C_POLICY_REQUEST_IDEMPOTENCY_INVALID'
      ),
      requestedAt: timestamp,
      authorization: await authorization({
        scope: 'CONFIRMED_POLICY',
        reviewReference: resolvedComposition.reviewReference,
        userId: user.id,
        authorizedAt: timestamp,
        confirmation: 'CONFIRM_POLICY_PERSISTENCE',
        payload: resolvedComposition,
      }),
      composition: resolvedComposition,
    });
    const result = await resolvedClient.rpc(
      'forge_cartera020c_attach_policy_confirmation',
      { p_request: request }
    );
    return rpcData(result, 'CARTERA020C_POLICY_ATTACHMENT_FAILED');
  }

  async function executeNext({ reviewReference, expectedStateVersion } = {}) {
    await authenticatedUser(resolvedClient);
    const reference = requireReference(
      reviewReference,
      'CARTERA020C_REVIEW_REFERENCE_INVALID'
    );
    if (!Number.isInteger(expectedStateVersion) || expectedStateVersion < 1) {
      throw fail('CARTERA020C_EXPECTED_STATE_VERSION_INVALID');
    }
    const result = await resolvedClient.rpc(
      'forge_cartera020c_execute_next_confirmation_step',
      {
        p_review_reference: reference,
        p_expected_state_version: expectedStateVersion,
      }
    );
    return rpcData(result, 'CARTERA020C_EXECUTION_STEP_FAILED');
  }

  async function runUntil({
    reviewReference,
    expectedStateVersion,
    stopStates,
    stepLimit = maxSteps,
  } = {}) {
    if (!Array.isArray(stopStates) || stopStates.length === 0) {
      throw fail('CARTERA020C_STOP_STATES_REQUIRED');
    }
    if (!Number.isInteger(stepLimit) || stepLimit < 1 || stepLimit > maxSteps) {
      throw fail('CARTERA020C_STEP_LIMIT_INVALID');
    }
    const stops = new Set([...stopStates, ...TERMINAL_STATES]);
    let status = await getStatus(reviewReference);
    let version = expectedStateVersion ?? status.stateVersion;

    for (let index = 0; index < stepLimit && !stops.has(status.state); index += 1) {
      if (status.state === CARTERA_020C_ORCHESTRATION_STATES.RETRY_WAIT) return status;
      status = await executeNext({
        reviewReference,
        expectedStateVersion: version,
      });
      version = status.stateVersion;
    }

    if (!stops.has(status.state)) throw fail('CARTERA020C_EXECUTION_STEP_LIMIT_REACHED');
    return status;
  }

  async function runIdentity({
    reviewReference,
    expectedStateVersion,
    stepLimit = maxSteps,
  } = {}) {
    return runUntil({
      reviewReference,
      expectedStateVersion,
      stepLimit,
      stopStates: [CARTERA_020C_ORCHESTRATION_STATES.IDENTITY_CONFIRMED],
    });
  }

  async function runPolicy({
    reviewReference,
    expectedStateVersion,
    stepLimit = maxSteps,
  } = {}) {
    return runUntil({
      reviewReference,
      expectedStateVersion,
      stepLimit,
      stopStates: [CARTERA_020C_ORCHESTRATION_STATES.CONFIRMED],
    });
  }

  async function retry({
    reviewReference,
    expectedStateVersion,
    requestedAt = resolvedClock(),
  } = {}) {
    await authenticatedUser(resolvedClient);
    const reference = requireReference(
      reviewReference,
      'CARTERA020C_REVIEW_REFERENCE_INVALID'
    );
    if (!Number.isInteger(expectedStateVersion) || expectedStateVersion < 1) {
      throw fail('CARTERA020C_EXPECTED_STATE_VERSION_INVALID');
    }
    const result = await resolvedClient.rpc(
      'forge_cartera020c_retry_confirmation',
      {
        p_review_reference: reference,
        p_expected_state_version: expectedStateVersion,
        p_requested_at: requireIso(requestedAt, 'CARTERA020C_RETRY_REQUESTED_AT_REQUIRED'),
      }
    );
    return rpcData(result, 'CARTERA020C_RETRY_REQUEST_FAILED');
  }

  return Object.freeze({
    getStatus,
    prepareIdentity,
    attachPolicy,
    executeNext,
    runIdentity,
    runPolicy,
    retry,
  });
}