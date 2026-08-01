import { randomUUID } from 'node:crypto';
import { INTAKE_WORKER_STATES } from './cartera-020b-intake-contracts.js';

const TERMINAL = new Set([
  INTAKE_WORKER_STATES.COMPLETED,
  INTAKE_WORKER_STATES.BLOCKED,
  INTAKE_WORKER_STATES.FAILED_TERMINAL,
]);

const asTime = (value, label) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) throw new TypeError(`${label}_invalid`);
  return date;
};

export function createWorkerState({
  itemReference,
  advisorId,
  evidenceStatus = 'received',
  workerState = INTAKE_WORKER_STATES.AVAILABLE,
  version = 1,
  retryCount = 0,
  nextRetryAt = null,
  leaseOwner = null,
  leaseToken = null,
  leaseExpiresAt = null,
  lastErrorCode = null,
  receipts = {},
} = {}) {
  if (!itemReference || !advisorId) throw new TypeError('worker_identity_required');
  return Object.freeze({
    itemReference,
    advisorId,
    evidenceStatus,
    workerState,
    version,
    retryCount,
    nextRetryAt,
    leaseOwner,
    leaseToken,
    leaseExpiresAt,
    lastErrorCode,
    receipts: Object.freeze({ ...receipts }),
  });
}

function leaseIsActive(state, now) {
  return Boolean(state.leaseExpiresAt) && asTime(state.leaseExpiresAt, 'lease_expires_at') > now;
}

export function claimWorkerItem(state, {
  workerId,
  now = new Date().toISOString(),
  leaseSeconds = 300,
  expectedVersion = state.version,
  claimToken = randomUUID(),
} = {}) {
  const instant = asTime(now, 'now');
  if (!workerId) throw new TypeError('worker_id_required');
  if (!Number.isInteger(leaseSeconds) || leaseSeconds < 30 || leaseSeconds > 3600) {
    throw new TypeError('lease_seconds_out_of_bounds');
  }
  if (state.version !== expectedVersion) return Object.freeze({ allowed: false, reason: 'VERSION_CONFLICT', state });
  if (TERMINAL.has(state.workerState)) return Object.freeze({ allowed: false, reason: 'TERMINAL_STATE', state });
  if (state.workerState === INTAKE_WORKER_STATES.RETRY_WAIT && state.nextRetryAt && asTime(state.nextRetryAt, 'next_retry_at') > instant) {
    return Object.freeze({ allowed: false, reason: 'RETRY_NOT_DUE', state });
  }
  if (state.workerState === INTAKE_WORKER_STATES.CLAIMED && leaseIsActive(state, instant)) {
    if (state.leaseOwner === workerId) return Object.freeze({ allowed: true, replay: true, state });
    return Object.freeze({ allowed: false, reason: 'LEASE_HELD', state });
  }

  const next = createWorkerState({
    ...state,
    workerState: INTAKE_WORKER_STATES.CLAIMED,
    version: state.version + 1,
    leaseOwner: workerId,
    leaseToken: claimToken,
    leaseExpiresAt: new Date(instant.getTime() + leaseSeconds * 1000).toISOString(),
    nextRetryAt: null,
  });
  return Object.freeze({ allowed: true, replay: false, state: next });
}

function assertClaim(state, workerId, claimToken, now) {
  if (state.workerState !== INTAKE_WORKER_STATES.CLAIMED) throw new TypeError('item_not_claimed');
  if (state.leaseOwner !== workerId || state.leaseToken !== claimToken) throw new TypeError('claim_mismatch');
  if (!leaseIsActive(state, asTime(now, 'now'))) throw new TypeError('lease_expired');
}

export function completeWorkerStep(state, {
  workerId,
  claimToken,
  idempotencyKey,
  evidenceStatus,
  workerState = INTAKE_WORKER_STATES.AVAILABLE,
  now = new Date().toISOString(),
  lastErrorCode = null,
} = {}) {
  if (!idempotencyKey) throw new TypeError('idempotency_key_required');
  const previousReceipt = state.receipts[idempotencyKey];
  const digest = JSON.stringify({ evidenceStatus, workerState, lastErrorCode });
  if (previousReceipt) {
    return Object.freeze({
      allowed: previousReceipt.digest === digest,
      replay: previousReceipt.digest === digest,
      reason: previousReceipt.digest === digest ? 'IDEMPOTENT_REPLAY' : 'CHANGED_INPUT_REPLAY',
      state,
    });
  }
  assertClaim(state, workerId, claimToken, now);
  if (!Object.values(INTAKE_WORKER_STATES).includes(workerState)) throw new TypeError('unsupported_worker_state');

  const nextRetryAt = workerState === INTAKE_WORKER_STATES.RETRY_WAIT
    ? new Date(asTime(now, 'now').getTime() + Math.min(3600, 30 * (2 ** state.retryCount)) * 1000).toISOString()
    : null;
  const next = createWorkerState({
    ...state,
    evidenceStatus,
    workerState,
    version: state.version + 1,
    retryCount: workerState === INTAKE_WORKER_STATES.RETRY_WAIT ? state.retryCount + 1 : state.retryCount,
    nextRetryAt,
    leaseOwner: null,
    leaseToken: null,
    leaseExpiresAt: null,
    lastErrorCode,
    receipts: {
      ...state.receipts,
      [idempotencyKey]: Object.freeze({ digest, completedAt: asTime(now, 'now').toISOString() }),
    },
  });
  return Object.freeze({ allowed: true, replay: false, state: next });
}

export async function processSequentialBatch({ items = [], processor } = {}) {
  if (!Array.isArray(items)) throw new TypeError('items_must_be_array');
  if (typeof processor !== 'function') throw new TypeError('processor_required');
  const results = [];
  for (const item of items) {
    try {
      results.push(Object.freeze({ itemReference: item.itemReference, success: true, result: await processor(item) }));
    } catch (error) {
      results.push(Object.freeze({ itemReference: item.itemReference, success: false, errorCode: error?.code ?? 'PROCESSING_FAILED' }));
    }
  }
  return Object.freeze(results);
}
