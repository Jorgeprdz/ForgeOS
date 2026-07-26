import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const canonical = require(
  "../platform/event-evidence/canonical-activity-event-contract.js",
);
const ledger = require(
  "../platform/event-evidence/activity-ledger-contract.js",
);
const localStoreModule = require(
  "../platform/event-evidence/activity-ledger-local-store.js",
);
const syncModule = require(
  "../platform/event-evidence/activity-ledger-sync-service.js",
);

function eventInput(overrides = {}) {
  return {
    event_type: "PROSPECT_CREATED",
    tenant_id: "tenant-advisor-001",
    actor: {
      type: "SYSTEM",
      id: "forge-system",
    },
    subject: {
      type: "PROSPECT",
      id: "prospect-001",
    },
    source: {
      type: "SYSTEM_OBSERVED",
      reference: "ui-save-001",
      channel: "FORGE_UI",
    },
    evidence_strength: "SYSTEM_OBSERVED",
    occurred_at: "2026-07-26T02:00:00.000Z",
    recorded_at: "2026-07-26T02:00:01.000Z",
    effective_period: null,
    causation_id: null,
    correlation_id: "corr-prospect-001",
    idempotency_key: "prospect-created-001",
    privacy_class: "PRIVATE",
    payload: {
      prospect_reference: "prospect-001",
      source_category: "REFERRAL",
    },
    provenance: {
      source_system: "forge-alive",
      source_record_id: "save-001",
      captured_via: "FORGE_UI",
      evidence_references: ["evidence-ui-save-001"],
    },
    confirmation_state: "CONFIRMED",
    correction_of: null,
    safety_flags: { ...canonical.DEFAULT_SAFETY_FLAGS },
    ...overrides,
  };
}

function canonicalEvent(overrides = {}) {
  return canonical.createCanonicalActivityEvent(eventInput(overrides));
}

function evidenceReference(overrides = {}) {
  return {
    reference_id: "evidence-ui-save-001",
    reference_type: "SYSTEM_OBSERVATION",
    source_system: "forge-alive",
    captured_at: "2026-07-26T02:00:01.000Z",
    privacy_class: "PRIVATE",
    checksum: "sha256-aabbcc",
    metadata: {
      observation_code: "PROSPECT_SAVE_CONFIRMED",
    },
    ...overrides,
  };
}

function ledgerRecord(event = canonicalEvent(), overrides = {}) {
  return ledger.createLedgerRecord({
    canonical_event: event,
    evidence_references: [evidenceReference()],
    appended_at: event.recorded_at,
    ...overrides,
  });
}

function appendMutation(record = ledgerRecord(), overrides = {}) {
  return ledger.createAppendMutation({
    ledger_record: record,
    device_id: "device-tablet",
    base_cursor: null,
    created_at: record.appended_at,
    ...overrides,
  });
}

function receiptFor(mutation, overrides = {}) {
  return ledger.createReceipt({
    status: "ACKNOWLEDGED",
    tenant_id: mutation.tenant_id,
    event_id: mutation.event_id,
    mutation_id: mutation.mutation_id,
    server_sequence: 1,
    server_recorded_at: "2026-07-26T02:00:02.000Z",
    cursor: "1",
    ...overrides,
  });
}

test("FES 02A creates an append-only ledger record from a canonical event", () => {
  const event = canonicalEvent();
  const record = ledgerRecord(event);

  assert.equal(record.ledger_version, "forge.activity_ledger.v1");
  assert.equal(record.event_id, event.event_id);
  assert.equal(record.tenant_id, event.tenant_id);
  assert.deepEqual(record.canonical_event, event);
  assert.equal(record.evidence_references.length, 1);
  assert.equal(record.record_key, `${event.tenant_id}:${event.event_id}`);
  assert.ok(Object.isFrozen(record));
  assert.ok(Object.isFrozen(record.canonical_event));
  assert.ok(Object.isFrozen(record.evidence_references));
});

test("FES 02A creates stable records regardless of evidence input order", () => {
  const event = canonicalEvent();
  const left = ledger.createLedgerRecord({
    canonical_event: event,
    evidence_references: [
      evidenceReference({ reference_id: "evidence-b" }),
      evidenceReference({ reference_id: "evidence-a" }),
    ],
    appended_at: event.recorded_at,
  });
  const right = ledger.createLedgerRecord({
    canonical_event: event,
    evidence_references: [
      evidenceReference({ reference_id: "evidence-a" }),
      evidenceReference({ reference_id: "evidence-b" }),
    ],
    appended_at: event.recorded_at,
  });

  assert.deepEqual(left, right);
  assert.deepEqual(
    left.evidence_references.map(item => item.reference_id),
    ["evidence-a", "evidence-b"],
  );
});

test("FES 02A rejects duplicate evidence references", () => {
  const event = canonicalEvent();

  assert.throws(
    () =>
      ledger.createLedgerRecord({
        canonical_event: event,
        evidence_references: [
          evidenceReference(),
          evidenceReference(),
        ],
        appended_at: event.recorded_at,
      }),
    error => error.code === "EVIDENCE_REFERENCE_DUPLICATED",
  );
});

test("FES 02A rejects raw private evidence fields", () => {
  const event = canonicalEvent();

  assert.throws(
    () =>
      ledger.createLedgerRecord({
        canonical_event: event,
        evidence_references: [
          evidenceReference({
            metadata: {
              observation_code: "SAVE",
              rawNotes: "texto privado",
            },
          }),
        ],
        appended_at: event.recorded_at,
      }),
    error =>
      error.code === "EVIDENCE_METADATA_FIELDS_INVALID" ||
      error.code === "EVIDENCE_REFERENCE_SENSITIVE_DATA_DENIED",
  );
});

test("FES 02A refuses ledger append before canonical record time", () => {
  const event = canonicalEvent();

  assert.throws(
    () =>
      ledger.createLedgerRecord({
        canonical_event: event,
        evidence_references: [],
        appended_at: "2026-07-26T02:00:00.000Z",
      }),
    error => error.code === "LEDGER_APPEND_BEFORE_RECORD_DENIED",
  );
});

test("FES 02A creates deterministic append mutation identities", () => {
  const record = ledgerRecord();
  const left = appendMutation(record);
  const right = appendMutation(record);

  assert.equal(left.mutation_id, right.mutation_id);
  assert.equal(left.operation, "APPEND_EVENT");
  assert.equal(left.state, "PENDING");
  assert.equal(left.attempt_count, 0);
  assert.ok(Object.isFrozen(left));
});

test("FES 02A supports only append event mutations", () => {
  const mutation = appendMutation();

  assert.throws(
    () =>
      ledger.assertAppendMutation({
        ...JSON.parse(JSON.stringify(mutation)),
        operation: "UPDATE_EVENT",
      }),
    error => error.code === "LEDGER_MUTATION_OPERATION_INVALID",
  );
});

test("FES 02A creates canonical retry mutations without changing identity", () => {
  const mutation = appendMutation();
  const retry = ledger.createRetryMutation(
    mutation,
    "NETWORK_TEMPORARILY_UNAVAILABLE",
  );

  assert.equal(retry.mutation_id, mutation.mutation_id);
  assert.equal(retry.attempt_count, 1);
  assert.equal(retry.state, "RETRY");
  assert.equal(
    retry.last_error_code,
    "NETWORK_TEMPORARILY_UNAVAILABLE",
  );
});

test("FES 02A creates immutable remote receipts", () => {
  const mutation = appendMutation();
  const receipt = receiptFor(mutation);

  assert.equal(receipt.receipt_version, "forge.activity_ledger_receipt.v1");
  assert.equal(receipt.status, "ACKNOWLEDGED");
  assert.ok(Object.isFrozen(receipt));
});

test("FES 02A creates append-only conflict records", () => {
  const mutation = appendMutation();
  const conflict = ledger.createConflict({
    tenant_id: mutation.tenant_id,
    event_id: mutation.event_id,
    mutation_id: mutation.mutation_id,
    reason_code: "REMOTE_EVENT_ID_DIGEST_CONFLICT",
    local_record: mutation.ledger_record,
    remote_record: null,
    detected_at: "2026-07-26T02:00:03.000Z",
  });

  assert.equal(conflict.status, "OPEN");
  assert.equal(conflict.local_record.event_id, mutation.event_id);
  assert.equal(conflict.remote_record, null);
  assert.ok(Object.isFrozen(conflict));
});

test("FES 02A local append atomically stores the event and outbox mutation", async () => {
  const store = localStoreModule.create({
    driver: localStoreModule.createMemoryDriver(),
  });
  const record = ledgerRecord();
  const mutation = appendMutation(record);

  const result = await store.appendLocal(record, mutation);
  const saved = await store.getEntry(record.tenant_id, record.event_id);
  const pending = await store.listPendingOutbox(record.tenant_id);

  assert.equal(result.appended, true);
  assert.equal(result.idempotent_replay, false);
  assert.deepEqual(saved, record);
  assert.equal(pending.length, 1);
  assert.equal(pending[0].mutation_id, mutation.mutation_id);
});

test("FES 02A local append is idempotent", async () => {
  const store = localStoreModule.create({
    driver: localStoreModule.createMemoryDriver(),
  });
  const record = ledgerRecord();
  const mutation = appendMutation(record);

  await store.appendLocal(record, mutation);
  const replay = await store.appendLocal(record, mutation);
  const entries = await store.listEntries(record.tenant_id);
  const pending = await store.listPendingOutbox(record.tenant_id);

  assert.equal(replay.appended, false);
  assert.equal(replay.idempotent_replay, true);
  assert.equal(entries.length, 1);
  assert.equal(pending.length, 1);
});

test("FES 02A local store isolates tenants", async () => {
  const store = localStoreModule.create({
    driver: localStoreModule.createMemoryDriver(),
  });
  const record = ledgerRecord();
  await store.appendLocal(record, appendMutation(record));

  assert.equal(
    (await store.listEntries("tenant-advisor-002")).length,
    0,
  );
  assert.equal(
    (await store.listPendingOutbox("tenant-advisor-002")).length,
    0,
  );
});

test("FES 02A orders the local ledger by occurrence and event identity", async () => {
  const store = localStoreModule.create({
    driver: localStoreModule.createMemoryDriver(),
  });
  const laterEvent = canonicalEvent({
    occurred_at: "2026-07-26T04:00:00.000Z",
    recorded_at: "2026-07-26T04:00:01.000Z",
    idempotency_key: "later-event",
    subject: { type: "PROSPECT", id: "prospect-002" },
    payload: {
      prospect_reference: "prospect-002",
      source_category: "MARKET_NATURAL",
    },
  });
  const earlierEvent = canonicalEvent({
    occurred_at: "2026-07-26T03:00:00.000Z",
    recorded_at: "2026-07-26T03:00:01.000Z",
    idempotency_key: "earlier-event",
    subject: { type: "PROSPECT", id: "prospect-003" },
    payload: {
      prospect_reference: "prospect-003",
      source_category: "REFERRAL",
    },
  });

  const later = ledgerRecord(laterEvent, {
    evidence_references: [],
  });
  const earlier = ledgerRecord(earlierEvent, {
    evidence_references: [],
  });

  await store.appendLocal(later, appendMutation(later));
  await store.appendLocal(earlier, appendMutation(earlier));

  const entries = await store.listEntries("tenant-advisor-001");
  assert.deepEqual(
    entries.map(item => item.event_id),
    [earlier.event_id, later.event_id],
  );
});

test("FES 02A acknowledges outbox mutations and stores remote receipts", async () => {
  const store = localStoreModule.create({
    driver: localStoreModule.createMemoryDriver(),
  });
  const record = ledgerRecord();
  const mutation = appendMutation(record);
  const receipt = receiptFor(mutation);

  await store.appendLocal(record, mutation);
  await store.acknowledgeMutation(mutation.mutation_id, receipt);

  assert.equal(
    (await store.listPendingOutbox(record.tenant_id)).length,
    0,
  );
  assert.deepEqual(await store.getReceipt(record.event_id), receipt);
  assert.equal(await store.getCursor(record.tenant_id), "1");
});

test("FES 02A retains failed mutations for explicit retry", async () => {
  const store = localStoreModule.create({
    driver: localStoreModule.createMemoryDriver(),
  });
  const record = ledgerRecord();
  const mutation = appendMutation(record);

  await store.appendLocal(record, mutation);
  const retry = await store.markMutationRetry(
    mutation.mutation_id,
    "NETWORK_TEMPORARILY_UNAVAILABLE",
  );

  assert.equal(retry.state, "RETRY");
  assert.equal(retry.attempt_count, 1);
  assert.equal(
    (await store.listPendingOutbox(record.tenant_id)).length,
    1,
  );
});

test("FES 02A records remote conflicts without overwriting ledger truth", async () => {
  const store = localStoreModule.create({
    driver: localStoreModule.createMemoryDriver(),
  });
  const record = ledgerRecord();
  const mutation = appendMutation(record);
  await store.appendLocal(record, mutation);

  const conflict = ledger.createConflict({
    tenant_id: record.tenant_id,
    event_id: record.event_id,
    mutation_id: mutation.mutation_id,
    reason_code: "REMOTE_EVENT_ID_DIGEST_CONFLICT",
    local_record: record,
    remote_record: null,
    detected_at: "2026-07-26T02:00:03.000Z",
  });
  await store.recordConflict(conflict, mutation);

  const conflicts = await store.listConflicts(record.tenant_id);
  const saved = await store.getEntry(record.tenant_id, record.event_id);
  const outbox = await store.getMutation(mutation.mutation_id);

  assert.equal(conflicts.length, 1);
  assert.deepEqual(saved, record);
  assert.equal(outbox.state, "CONFLICT_REVIEW_REQUIRED");
});

test("FES 02A applies remote entries idempotently", async () => {
  const store = localStoreModule.create({
    driver: localStoreModule.createMemoryDriver(),
  });
  const event = canonicalEvent({
    idempotency_key: "remote-event-001",
    subject: { type: "PROSPECT", id: "prospect-remote" },
    payload: {
      prospect_reference: "prospect-remote",
      source_category: "REFERRAL",
    },
  });
  const record = ledgerRecord(event, {
    evidence_references: [],
  });
  const mutation = appendMutation(record);
  const receipt = receiptFor(mutation, {
    server_sequence: 7,
    cursor: "7",
  });

  const first = await store.applyRemoteRecord(record, receipt);
  const replay = await store.applyRemoteRecord(record, receipt);

  assert.equal(first.applied, true);
  assert.equal(replay.idempotent_replay, true);
  assert.equal((await store.listEntries(record.tenant_id)).length, 1);
  assert.equal(await store.getCursor(record.tenant_id), "7");
});

test("FES 02A sync pushes outbox before pulling remote changes", async () => {
  const order = [];
  const store = localStoreModule.create({
    driver: localStoreModule.createMemoryDriver(),
  });
  const record = ledgerRecord();
  const mutation = appendMutation(record);
  await store.appendLocal(record, mutation);

  const gateway = {
    async pushMutation(value) {
      order.push(`push:${value.event_id}`);
      return {
        status: "ACKNOWLEDGED",
        receipt: receiptFor(value),
      };
    },
    async pullChanges({ cursor }) {
      order.push(`pull:${cursor}`);
      return {
        changes: [],
        cursor: cursor || "1",
        has_more: false,
      };
    },
  };

  const service = syncModule.create({
    store,
    gateway,
    clock: () => "2026-07-26T02:00:05.000Z",
  });
  const summary = await service.syncOnce(record.tenant_id);

  assert.equal(summary.push_acknowledged, 1);
  assert.equal(summary.pull_batches, 1);
  assert.deepEqual(order, [
    `push:${record.event_id}`,
    "pull:1",
  ]);
  assert.equal(
    (await store.listPendingOutbox(record.tenant_id)).length,
    0,
  );
});

test("FES 02A sync keeps transport failures in retry state", async () => {
  const store = localStoreModule.create({
    driver: localStoreModule.createMemoryDriver(),
  });
  const record = ledgerRecord();
  const mutation = appendMutation(record);
  await store.appendLocal(record, mutation);

  const service = syncModule.create({
    store,
    gateway: {
      async pushMutation() {
        const failure = new Error("offline");
        failure.code = "NETWORK_TEMPORARILY_UNAVAILABLE";
        throw failure;
      },
      async pullChanges({ cursor }) {
        return {
          changes: [],
          cursor,
          has_more: false,
        };
      },
    },
  });

  const summary = await service.syncOnce(record.tenant_id);
  const pending = await store.listPendingOutbox(record.tenant_id);

  assert.equal(summary.push_retries, 1);
  assert.equal(pending.length, 1);
  assert.equal(pending[0].state, "RETRY");
  assert.equal(pending[0].attempt_count, 1);
});

test("FES 02A sync routes server conflicts to human review", async () => {
  const store = localStoreModule.create({
    driver: localStoreModule.createMemoryDriver(),
  });
  const record = ledgerRecord();
  const mutation = appendMutation(record);
  await store.appendLocal(record, mutation);

  const service = syncModule.create({
    store,
    gateway: {
      async pushMutation() {
        return {
          status: "CONFLICT",
          reason_code: "REMOTE_EVENT_ID_DIGEST_CONFLICT",
          remote_record: null,
          detected_at: "2026-07-26T02:00:03.000Z",
        };
      },
      async pullChanges({ cursor }) {
        return {
          changes: [],
          cursor,
          has_more: false,
        };
      },
    },
  });

  const summary = await service.syncOnce(record.tenant_id);

  assert.equal(summary.push_conflicts, 1);
  assert.equal((await store.listConflicts(record.tenant_id)).length, 1);
  assert.equal(
    (await store.getMutation(mutation.mutation_id)).state,
    "CONFLICT_REVIEW_REQUIRED",
  );
});

test("FES 02A sync applies pulled remote events and advances cursor", async () => {
  const store = localStoreModule.create({
    driver: localStoreModule.createMemoryDriver(),
  });
  const event = canonicalEvent({
    idempotency_key: "pulled-event-001",
    subject: { type: "PROSPECT", id: "prospect-pulled" },
    payload: {
      prospect_reference: "prospect-pulled",
      source_category: "REFERRAL",
    },
  });
  const record = ledgerRecord(event, {
    evidence_references: [],
  });
  const mutation = appendMutation(record);
  const receipt = receiptFor(mutation, {
    server_sequence: 9,
    cursor: "9",
  });

  const service = syncModule.create({
    store,
    gateway: {
      async pushMutation() {
        throw new Error("unexpected push");
      },
      async pullChanges() {
        return {
          changes: [
            {
              ledger_record: record,
              receipt,
            },
          ],
          cursor: "9",
          has_more: false,
        };
      },
    },
  });

  const summary = await service.syncOnce(record.tenant_id);

  assert.equal(summary.pull_received, 1);
  assert.equal(summary.pull_applied, 1);
  assert.equal(await store.getCursor(record.tenant_id), "9");
  assert.deepEqual(
    await store.getEntry(record.tenant_id, record.event_id),
    record,
  );
});

test("FES 02A sync coalesces concurrent calls", async () => {
  let pulls = 0;
  let release;
  const gate = new Promise(resolve => {
    release = resolve;
  });
  const store = localStoreModule.create({
    driver: localStoreModule.createMemoryDriver(),
  });
  const service = syncModule.create({
    store,
    gateway: {
      async pushMutation() {
        throw new Error("unexpected push");
      },
      async pullChanges({ cursor }) {
        pulls += 1;
        await gate;
        return {
          changes: [],
          cursor,
          has_more: false,
        };
      },
    },
  });

  const left = service.syncOnce("tenant-advisor-001");
  const right = service.syncOnce("tenant-advisor-001");
  release();

  const [leftResult, rightResult] = await Promise.all([left, right]);

  assert.deepEqual(leftResult, rightResult);
  assert.equal(pulls, 1);
});

test("FES 02A sync rejects cross-tenant pull changes", async () => {
  const store = localStoreModule.create({
    driver: localStoreModule.createMemoryDriver(),
  });
  const foreignEvent = canonicalEvent({
    tenant_id: "tenant-advisor-002",
    idempotency_key: "foreign-event",
  });
  const foreignRecord = ledgerRecord(foreignEvent, {
    evidence_references: [],
  });
  const foreignMutation = appendMutation(foreignRecord);
  const foreignReceipt = receiptFor(foreignMutation);

  const service = syncModule.create({
    store,
    gateway: {
      async pushMutation() {
        throw new Error("unexpected push");
      },
      async pullChanges() {
        return {
          changes: [
            {
              ledger_record: foreignRecord,
              receipt: foreignReceipt,
            },
          ],
          cursor: "1",
          has_more: false,
        };
      },
    },
  });

  await assert.rejects(
    service.syncOnce("tenant-advisor-001"),
    error => error.code === "LEDGER_GATEWAY_PULL_TENANT_MISMATCH",
  );
});
