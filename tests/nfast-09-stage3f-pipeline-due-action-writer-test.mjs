import test from "node:test";
import assert from "node:assert/strict";

import "../advisor-os/offline/due-action-offline-contract.js";
import {
  createPipelineDueActionWriter,
} from "../advisor-os/sales-pipeline/pipeline-due-action-writer.js";

const contract =
  globalThis.ForgeDueActionOfflineContractNFAST09;

function createStore(seed = null) {
  let record = seed;
  const mutations = new Map();
  const events = [];

  return {
    events,
    async getDueAction(advisor, prospect) {
      events.push(`get:${advisor}:${prospect}`);
      return record;
    },
    async commitLocalMutation(nextRecord, mutation) {
      events.push(`commit:${mutation.operation}`);

      const existing = mutations.get(mutation.mutationId);

      if (existing) {
        return {
          idempotentReplay: true,
          record: nextRecord,
          mutation: existing,
        };
      }

      record = nextRecord;
      mutations.set(mutation.mutationId, mutation);

      return {
        idempotentReplay: false,
        record: nextRecord,
        mutation,
      };
    },
    async close() {},
    current() {
      return record;
    },
  };
}

function eventTarget(events) {
  return {
    dispatchEvent(event) {
      events.push(`event:${event.detail.operation}`);
      return true;
    },
  };
}

function scheduledRecord(overrides = {}) {
  return contract.normalizeDueActionRecord({
    advisorPartitionKey: "advisor-A",
    prospectReference: "prospect-001",
    approvedDisplayName: "Juan Pérez",
    nextActionType: "CALL",
    nextActionAt: "2026-07-26T16:00:00.000Z",
    dueActionState: "SCHEDULED",
    dueActionVersion: 1,
    serverRevision: "revision-1",
    remoteUpdatedAt: "2026-07-25T10:00:00.000Z",
    localUpdatedAt: "2026-07-25T10:00:00.000Z",
    lastSyncedAt: "2026-07-25T10:00:00.000Z",
    syncState: "SYNCED",
    acknowledgementState: "UNSEEN",
    acknowledgedAt: null,
    acknowledgedOnDeviceId: null,
    snoozedUntil: null,
    tombstone: false,
    ...overrides,
  });
}

test("Stage 3F commits locally before requesting remote sync", async () => {
  const order = [];
  const store = createStore();

  const writer = createPipelineDueActionWriter({
    advisorPartitionKey: "advisor-A",
    contract,
    store,
    deviceId: "device-tablet",
    clock: () => "2026-07-25T12:00:00.000Z",
    eventTarget: eventTarget(order),
    requestSync: async () => {
      order.push("sync");
      return { status: "SYNCED" };
    },
  });

  const result = await writer.execute({
    operation: "SCHEDULE",
    prospectReference: "prospect-001",
    approvedDisplayName: "Juan Pérez",
    nextActionType: "CALL",
    nextActionAt: "2026-07-26T16:00:00.000Z",
  });

  assert.equal(result.localCommitted, true);
  assert.equal(result.record.syncState, "LOCAL_PENDING");
  assert.equal(result.record.dueActionVersion, 1);
  assert.equal(order[0], "event:SCHEDULE");

  await result.syncPromise;

  assert.deepEqual(order, [
    "event:SCHEDULE",
    "sync",
  ]);

  assert.deepEqual(store.events, [
    "get:advisor-A:prospect-001",
    "commit:SCHEDULE",
  ]);
});

test("Stage 3F creates deterministic mutation IDs for identical requests", async () => {
  async function run() {
    const writer = createPipelineDueActionWriter({
      advisorPartitionKey: "advisor-A",
      contract,
      store: createStore(),
      deviceId: "device-tablet",
      clock: () => "2026-07-25T12:00:00.000Z",
      eventTarget: null,
    });

    return writer.execute({
      operation: "SCHEDULE",
      prospectReference: "prospect-001",
      approvedDisplayName: "Juan Pérez",
      nextActionType: "CALL",
      nextActionAt: "2026-07-26T16:00:00.000Z",
    });
  }

  const left = await run();
  const right = await run();

  assert.equal(
    left.mutation.mutationId,
    right.mutation.mutationId,
  );
});

test("Stage 3F reschedules by incrementing lifecycle version", async () => {
  const store = createStore(scheduledRecord());
  const writer = createPipelineDueActionWriter({
    advisorPartitionKey: "advisor-A",
    contract,
    store,
    deviceId: "device-tablet",
    clock: () => "2026-07-25T12:00:00.000Z",
    eventTarget: null,
  });

  const result = await writer.execute({
    operation: "RESCHEDULE",
    prospectReference: "prospect-001",
    approvedDisplayName: "Juan Pérez",
    nextActionType: "FOLLOW_UP",
    nextActionAt: "2026-07-27T18:00:00.000Z",
  });

  assert.equal(result.record.dueActionVersion, 2);
  assert.equal(result.record.nextActionType, "FOLLOW_UP");
  assert.equal(
    result.record.nextActionAt,
    "2026-07-27T18:00:00.000Z",
  );
  assert.equal(result.record.acknowledgementState, "UNSEEN");
});

test("Stage 3F supports seen acknowledge snooze complete and cancel", async t => {
  const cases = [
    ["MARK_SEEN", "SEEN", false],
    ["ACKNOWLEDGE", "ACKNOWLEDGED", false],
    ["SNOOZE", "SNOOZED", false],
    ["COMPLETE", "UNSEEN", true],
    ["CANCEL", "UNSEEN", true],
  ];

  for (const [operation, acknowledgementState, tombstone] of cases) {
    await t.test(operation, async () => {
      const store = createStore(scheduledRecord());
      const writer = createPipelineDueActionWriter({
        advisorPartitionKey: "advisor-A",
        contract,
        store,
        deviceId: "device-tablet",
        clock: () => "2026-07-25T12:00:00.000Z",
        eventTarget: null,
      });

      const result = await writer.execute({
        operation,
        prospectReference: "prospect-001",
      });

      assert.equal(
        result.record.acknowledgementState,
        acknowledgementState,
      );
      assert.equal(result.record.tombstone, tombstone);

      if (operation === "SNOOZE") {
        assert.equal(
          result.record.snoozedUntil,
          "2026-07-26T12:00:00.000Z",
        );
      }
    });
  }
});

test("Stage 3F blocks sensitive fields before local storage", async () => {
  const store = createStore();
  const writer = createPipelineDueActionWriter({
    advisorPartitionKey: "advisor-A",
    contract,
    store,
    deviceId: "device-tablet",
    eventTarget: null,
  });

  await assert.rejects(
    writer.execute({
      operation: "SCHEDULE",
      prospectReference: "prospect-001",
      approvedDisplayName: "Juan Pérez",
      nextActionType: "CALL",
      nextActionAt: "2026-07-26T16:00:00.000Z",
      phone: "5555555555",
    }),
    error =>
      error.code ===
      "PIPELINE_DUE_ACTION_INPUT_FIELDS_INVALID",
  );

  assert.deepEqual(store.events, []);
});

test("Stage 3F blocks advisor injection in mutation input", async () => {
  const writer = createPipelineDueActionWriter({
    advisorPartitionKey: "advisor-A",
    contract,
    store: createStore(),
    deviceId: "device-tablet",
    eventTarget: null,
  });

  await assert.rejects(
    writer.execute({
      operation: "SCHEDULE",
      advisorPartitionKey: "advisor-B",
      prospectReference: "prospect-001",
      approvedDisplayName: "Juan Pérez",
      nextActionType: "CALL",
      nextActionAt: "2026-07-26T16:00:00.000Z",
    }),
    error =>
      error.code ===
      "PIPELINE_DUE_ACTION_INPUT_FIELDS_INVALID",
  );
});

test("Stage 3F requires active action for lifecycle commands", async () => {
  const writer = createPipelineDueActionWriter({
    advisorPartitionKey: "advisor-A",
    contract,
    store: createStore(),
    deviceId: "device-tablet",
    eventTarget: null,
  });

  await assert.rejects(
    writer.execute({
      operation: "COMPLETE",
      prospectReference: "prospect-001",
    }),
    error => error.code === "ACTIVE_DUE_ACTION_REQUIRED",
  );
});
