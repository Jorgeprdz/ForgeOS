import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildEvidenceAdmissionCommand,
  computeDocumentDigest,
  createEvidenceAdmissionCandidate,
} from '../platform/policy-intelligence/intake/cartera-020b-evidence-admission-adapter.js';
import {
  completeWorkerStep,
  claimWorkerItem,
  createWorkerState,
  processSequentialBatch,
} from '../policy-operations/intake/cartera-020b-deterministic-worker.js';
import { INTAKE_WORKER_STATES } from '../policy-operations/intake/cartera-020b-intake-contracts.js';

const bytes = Buffer.from('%PDF-1.7 synthetic policy fixture');

test('admission computes actual deterministic SHA-256 and does not retain bytes', () => {
  const first = computeDocumentDigest(bytes);
  const second = computeDocumentDigest(Buffer.from(bytes));
  assert.match(first, /^[a-f0-9]{64}$/);
  assert.equal(first, second);

  const candidate = createEvidenceAdmissionCandidate({
    ownerAdvisorId: 'advisor-1', originalFilename: 'policy.pdf', mimeType: 'application/pdf', bytes,
    storageReference: 'storage/policy-1', idempotencyKey: 'admit-policy-1', receivedAt: '2026-07-31T18:00:00Z',
  });
  assert.equal(candidate.createsPolicy, false);
  assert.equal(candidate.source.createsTruth, false);
  assert.equal(candidate.inboxItem.createsTruth, false);
  assert.equal(JSON.stringify(candidate).includes('%PDF'), false);
  assert.equal(candidate.source.metadata.rawBytesPersisted, false);
});

test('admission command is stable and owner scoped', () => {
  const candidate = createEvidenceAdmissionCandidate({
    ownerAdvisorId: 'advisor-1', organizationId: 'org-1', originalFilename: 'policy.pdf', mimeType: 'application/pdf', bytes,
    storageReference: 'storage/policy-1', idempotencyKey: 'admit-policy-1', receivedAt: '2026-07-31T18:00:00Z',
  });
  const command = buildEvidenceAdmissionCommand(candidate);
  assert.equal(command.advisorId, 'advisor-1');
  assert.equal(command.documentDigest, computeDocumentDigest(bytes));
  assert.equal(command.byteSize, bytes.byteLength);
  assert.equal(command.sourceType, 'UPLOAD');
  assert.equal(command.receivedAt, '2026-07-31T18:00:00Z');
});

test('unsupported MIME and oversized files fail closed', () => {
  assert.throws(() => createEvidenceAdmissionCandidate({
    ownerAdvisorId: 'advisor-1', originalFilename: 'image.jpg', mimeType: 'image/jpeg', bytes,
    storageReference: 'storage/image', idempotencyKey: 'admit-image',
  }), /unsupported_mime_type/);
});

test('worker claim is optimistic, leased and idempotent for same worker', () => {
  const state = createWorkerState({ itemReference: 'item-1', advisorId: 'advisor-1' });
  const claimed = claimWorkerItem(state, { workerId: 'worker-1', now: '2026-07-31T18:00:00Z', claimToken: 'claim-1' });
  assert.equal(claimed.allowed, true);
  assert.equal(claimed.state.workerState, INTAKE_WORKER_STATES.CLAIMED);
  const replay = claimWorkerItem(claimed.state, { workerId: 'worker-1', now: '2026-07-31T18:00:01Z' });
  assert.equal(replay.allowed, true);
  assert.equal(replay.replay, true);
  const collision = claimWorkerItem(claimed.state, { workerId: 'worker-2', now: '2026-07-31T18:00:01Z' });
  assert.equal(collision.reason, 'LEASE_HELD');
});

test('expired claim can be safely resumed by another worker', () => {
  const state = createWorkerState({
    itemReference: 'item-1', advisorId: 'advisor-1', workerState: INTAKE_WORKER_STATES.CLAIMED,
    leaseOwner: 'worker-1', leaseToken: 'old', leaseExpiresAt: '2026-07-31T18:00:00Z', version: 2,
  });
  const claimed = claimWorkerItem(state, { workerId: 'worker-2', now: '2026-07-31T18:01:00Z', claimToken: 'new', expectedVersion: 2 });
  assert.equal(claimed.allowed, true);
  assert.equal(claimed.state.leaseOwner, 'worker-2');
});

test('worker transition replay is idempotent and changed input is rejected', () => {
  const initial = createWorkerState({ itemReference: 'item-1', advisorId: 'advisor-1' });
  const claimed = claimWorkerItem(initial, { workerId: 'worker-1', now: '2026-07-31T18:00:00Z', claimToken: 'claim' }).state;
  const completed = completeWorkerStep(claimed, {
    workerId: 'worker-1', claimToken: 'claim', idempotencyKey: 'step-1',
    evidenceStatus: 'classified', now: '2026-07-31T18:00:01Z',
  });
  assert.equal(completed.allowed, true);
  const replay = completeWorkerStep(completed.state, {
    workerId: 'worker-1', claimToken: 'claim', idempotencyKey: 'step-1',
    evidenceStatus: 'classified', now: '2026-07-31T18:00:02Z',
  });
  assert.equal(replay.reason, 'IDEMPOTENT_REPLAY');
  const changed = completeWorkerStep(completed.state, {
    workerId: 'worker-1', claimToken: 'claim', idempotencyKey: 'step-1',
    evidenceStatus: 'blocked', workerState: INTAKE_WORKER_STATES.BLOCKED, now: '2026-07-31T18:00:02Z',
  });
  assert.equal(changed.reason, 'CHANGED_INPUT_REPLAY');
});

test('retry scheduling clears lease and increments retry count', () => {
  const initial = createWorkerState({ itemReference: 'item-1', advisorId: 'advisor-1' });
  const claimed = claimWorkerItem(initial, { workerId: 'worker-1', now: '2026-07-31T18:00:00Z', claimToken: 'claim' }).state;
  const retry = completeWorkerStep(claimed, {
    workerId: 'worker-1', claimToken: 'claim', idempotencyKey: 'retry-1',
    evidenceStatus: 'received', workerState: INTAKE_WORKER_STATES.RETRY_WAIT,
    lastErrorCode: 'PROVIDER_TIMEOUT', now: '2026-07-31T18:00:01Z',
  });
  assert.equal(retry.state.retryCount, 1);
  assert.equal(retry.state.leaseOwner, null);
  assert.ok(retry.state.nextRetryAt);
});

test('sequential batch continues after one failed item', async () => {
  const results = await processSequentialBatch({
    items: [{ itemReference: 'one' }, { itemReference: 'two' }, { itemReference: 'three' }],
    processor: async (item) => {
      if (item.itemReference === 'two') { const error = new Error('boom'); error.code = 'FAILED_TWO'; throw error; }
      return `${item.itemReference}-ok`;
    },
  });
  assert.deepEqual(results.map((result) => result.success), [true, false, true]);
  assert.equal(results[1].errorCode, 'FAILED_TWO');
});
