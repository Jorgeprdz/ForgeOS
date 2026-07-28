"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");

const contract = require(
  "../advisor-os/offline/due-action-offline-contract",
);
const storeModule = require(
  "../advisor-os/offline/due-action-indexeddb-store",
);
const outboxModule = require(
  "../advisor-os/offline/due-action-outbox-service",
);

const ADVISOR_A = "advisor-A";
const ADVISOR_B = "advisor-B";
const PROSPECT = "prospect-001";
const DEVICE = "device-tablet";
const T0 = "2026-07-25T01:00:00.000Z";
const T1 = "2026-07-25T01:01:00.000Z";
const T2 = "2026-07-25T01:02:00.000Z";

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function memoryDriver() {
  const stores = {
    dueActions: new Map(),
    outbox: new Map(),
    syncMeta: new Map(),
  };

  let failNextAtomic = false;

  return {
    driverType: "MEMORY_TEST_DRIVER",

    async get(storeName, key) {
      const value =
        stores[storeName].get(key);
      return value === undefined
        ? null
        : clone(value);
    },

    async getAllByIndex(
      storeName,
      indexName,
      value,
    ) {
      return [...stores[storeName].values()]
        .filter(
          item => item[indexName] === value,
        )
        .map(clone);
    },

    async runAtomic(operations) {
      if (failNextAtomic) {
        failNextAtomic = false;
        throw new Error(
          "SIMULATED_ATOMIC_FAILURE",
        );
      }

      const snapshot = Object.fromEntries(
        Object.entries(stores).map(
          ([name, map]) => [
            name,
            new Map(
              [...map.entries()].map(
                ([key, value]) => [
                  key,
                  clone(value),
                ],
              ),
            ),
          ],
        ),
      );

      try {
        for (const operation of operations) {
          const target =
            stores[operation.storeName];

          if (operation.type === "put") {
            const value =
              clone(operation.value);
            const key =
              operation.storeName ===
                "dueActions"
                ? value.recordKey
                : operation.storeName ===
                    "outbox"
                  ? value.mutationId
                  : value.partitionKey;
            target.set(key, value);
          } else if (
            operation.type === "delete"
          ) {
            target.delete(operation.key);
          } else {
            throw new Error(
              "INVALID_MEMORY_OPERATION",
            );
          }
        }
      } catch (error) {
        for (const name of Object.keys(stores)) {
          stores[name].clear();
          for (
            const [key, value]
            of snapshot[name].entries()
          ) {
            stores[name].set(
              key,
              clone(value),
            );
          }
        }

        throw error;
      }
    },

    failNextAtomic() {
      failNextAtomic = true;
    },

    snapshot() {
      return clone(
        Object.fromEntries(
          Object.entries(stores).map(
            ([name, map]) => [
              name,
              [...map.values()],
            ],
          ),
        ),
      );
    },
  };
}

function harness() {
  const driver = memoryDriver();
  const store = storeModule.create({
    driver,
  });
  const outbox = outboxModule.create({
    store,
    deviceId: DEVICE,
    clock: () => T0,
  });

  return {
    driver,
    store,
    outbox,
  };
}

async function schedule(
  outbox,
  overrides = {},
) {
  return outbox.scheduleDueAction({
    advisorPartitionKey:
      ADVISOR_A,
    prospectReference: PROSPECT,
    approvedDisplayName:
      "Juan Pérez",
    nextActionType: "WHATSAPP",
    nextActionAt:
      "2026-07-26T15:00:00.000Z",
    operationAt: T0,
    ...overrides,
  });
}

test(
  "Stage 3A stores a due action and durable outbox atomically",
  async () => {
    const { store, outbox } = harness();

    const result = await schedule(outbox);

    assert.equal(
      result.idempotentReplay,
      false,
    );

    const record =
      await store.getDueAction(
        ADVISOR_A,
        PROSPECT,
      );
    const pending =
      await store
        .listPendingMutations(
          ADVISOR_A,
        );

    assert.equal(
      record.dueActionState,
      "SCHEDULED",
    );
    assert.equal(
      record.syncState,
      "LOCAL_PENDING",
    );
    assert.equal(pending.length, 1);
    assert.equal(
      pending[0].operation,
      "SCHEDULE",
    );
  },
);

test(
  "Stage 3A outbox survives service recreation",
  async () => {
    const driver = memoryDriver();
    const firstStore =
      storeModule.create({ driver });
    const firstOutbox =
      outboxModule.create({
        store: firstStore,
        deviceId: DEVICE,
      });

    await schedule(firstOutbox);

    const recreatedStore =
      storeModule.create({ driver });

    const pending =
      await recreatedStore
        .listPendingMutations(
          ADVISOR_A,
        );

    assert.equal(pending.length, 1);
  },
);

test(
  "Stage 3A deterministic mutation replay is idempotent",
  async () => {
    const { store, outbox } = harness();

    const first = await schedule(outbox);
    const second = await schedule(outbox);

    assert.equal(
      first.mutation.mutationId,
      second.mutation.mutationId,
    );
    assert.equal(
      second.idempotentReplay,
      true,
    );

    const pending =
      await store
        .listPendingMutations(
          ADVISOR_A,
        );

    assert.equal(pending.length, 1);
  },
);

test(
  "Stage 3A blocks sensitive fields from local records and outbox",
  () => {
    assert.throws(
      () =>
        contract
          .normalizeDueActionRecord({
            advisorPartitionKey:
              ADVISOR_A,
            prospectReference: PROSPECT,
            approvedDisplayName:
              "Juan",
            nextActionType:
              "WHATSAPP",
            nextActionAt:
              "2026-07-26T15:00:00.000Z",
            dueActionState:
              "SCHEDULED",
            dueActionVersion: 1,
            localUpdatedAt: T0,
            syncState:
              "LOCAL_PENDING",
            acknowledgementState:
              "UNSEEN",
            tombstone: false,
            phone: "+525500000000",
          }),
      error =>
        error.code ===
        "PROHIBITED_LOCAL_DATA",
    );

    assert.throws(
      () =>
        contract
          .normalizeOutboxMutation({
            mutationId:
              "NFAST09:device:abc",
            deviceId: DEVICE,
            advisorPartitionKey:
              ADVISOR_A,
            prospectReference: PROSPECT,
            dueActionVersion: 1,
            operation: "SCHEDULE",
            authorizedPatch: {
              nextActionType:
                "WHATSAPP",
              nextActionAt:
                "2026-07-26T15:00:00.000Z",
              message:
                "Texto prohibido",
            },
            createdAt: T0,
            attemptCount: 0,
            syncState:
              "LOCAL_PENDING",
          }),
      error =>
        error.code ===
        "PROHIBITED_OUTBOX_DATA",
    );
  },
);

test(
  "Stage 3A isolates advisor partitions",
  async () => {
    const { store, outbox } = harness();

    await schedule(outbox);

    const otherAdvisorRecords =
      await store.listDueActions(
        ADVISOR_B,
      );
    const otherAdvisorOutbox =
      await store
        .listPendingMutations(
          ADVISOR_B,
        );

    assert.deepEqual(
      otherAdvisorRecords,
      [],
    );
    assert.deepEqual(
      otherAdvisorOutbox,
      [],
    );
  },
);

test(
  "Stage 3A reading an alert does not complete or delete the action",
  async () => {
    const { store, outbox } = harness();

    await schedule(outbox);

    await outbox.markSeen({
      advisorPartitionKey:
        ADVISOR_A,
      prospectReference: PROSPECT,
      operationAt: T1,
    });

    const record =
      await store.getDueAction(
        ADVISOR_A,
        PROSPECT,
      );

    assert.equal(
      record.acknowledgementState,
      "SEEN",
    );
    assert.equal(
      record.dueActionState,
      "SCHEDULED",
    );
    assert.equal(
      record.tombstone,
      false,
    );
  },
);

test(
  "Stage 3A acknowledgement merge never regresses",
  () => {
    assert.equal(
      contract.mergeAcknowledgement(
        "ACKNOWLEDGED",
        "SEEN",
      ),
      "ACKNOWLEDGED",
    );

    assert.equal(
      contract.mergeAcknowledgement(
        "UNSEEN",
        "SEEN",
      ),
      "SEEN",
    );
  },
);

test(
  "Stage 3A reschedule creates a new version and resets acknowledgement",
  async () => {
    const { store, outbox } = harness();

    await schedule(outbox);

    await outbox.acknowledge({
      advisorPartitionKey:
        ADVISOR_A,
      prospectReference: PROSPECT,
      operationAt: T1,
    });

    await outbox.rescheduleDueAction({
      advisorPartitionKey:
        ADVISOR_A,
      prospectReference: PROSPECT,
      nextActionType: "CALL",
      nextActionAt:
        "2026-07-27T16:00:00.000Z",
      operationAt: T2,
    });

    const record =
      await store.getDueAction(
        ADVISOR_A,
        PROSPECT,
      );

    assert.equal(
      record.dueActionVersion,
      2,
    );
    assert.equal(
      record.acknowledgementState,
      "UNSEEN",
    );
    assert.equal(
      record.nextActionType,
      "CALL",
    );
  },
);

test(
  "Stage 3A completion removes active priority but preserves replica evidence",
  async () => {
    const { store, outbox } = harness();

    await schedule(outbox);

    await outbox.completeDueAction({
      advisorPartitionKey:
        ADVISOR_A,
      prospectReference: PROSPECT,
      operationAt: T1,
    });

    const record =
      await store.getDueAction(
        ADVISOR_A,
        PROSPECT,
      );

    assert.equal(
      record.dueActionState,
      "COMPLETED",
    );
    assert.equal(record.tombstone, true);
  },
);

test(
  "Stage 3A refuses to delete outbox without remote acknowledgement",
  async () => {
    const { store, outbox } = harness();

    const result = await schedule(outbox);

    await assert.rejects(
      store.acknowledgeMutation({
        advisorPartitionKey:
          ADVISOR_A,
        mutationId:
          result.mutation.mutationId,
        acknowledged: false,
        acknowledgedAt: T1,
      }),
      error =>
        error.code ===
        "REMOTE_ACK_REQUIRED",
    );

    const pending =
      await store
        .listPendingMutations(
          ADVISOR_A,
        );

    assert.equal(pending.length, 1);
  },
);

test(
  "Stage 3A removes only acknowledged outbox and atomically stores server result",
  async () => {
    const { store, outbox } = harness();

    const result = await schedule(outbox);
    const localRecord =
      await store.getDueAction(
        ADVISOR_A,
        PROSPECT,
      );

    await store.acknowledgeMutation({
      advisorPartitionKey:
        ADVISOR_A,
      mutationId:
        result.mutation.mutationId,
      acknowledged: true,
      serverRevision: "revision-001",
      acknowledgedAt: T1,
      serverRecord: {
        ...localRecord,
        serverRevision:
          "revision-001",
        remoteUpdatedAt: T1,
        localUpdatedAt: T1,
      },
    });

    const pending =
      await store
        .listPendingMutations(
          ADVISOR_A,
        );
    const record =
      await store.getDueAction(
        ADVISOR_A,
        PROSPECT,
      );

    assert.equal(pending.length, 0);
    assert.equal(
      record.syncState,
      "SYNCED",
    );
    assert.equal(
      record.serverRevision,
      "revision-001",
    );
  },
);

test(
  "Stage 3A reconciles remote records and cursor in one atomic operation",
  async () => {
    const { store } = harness();

    await store.reconcileRemoteChanges({
      advisorPartitionKey:
        ADVISOR_A,
      cursor: "cursor-001",
      reconciledAt: T1,
      records: [
        {
          advisorPartitionKey:
            ADVISOR_A,
          prospectReference: PROSPECT,
          approvedDisplayName:
            "Juan Pérez",
          nextActionType:
            "WHATSAPP",
          nextActionAt:
            "2026-07-26T15:00:00.000Z",
          dueActionState:
            "SCHEDULED",
          dueActionVersion: 1,
          serverRevision:
            "revision-001",
          remoteUpdatedAt: T1,
          localUpdatedAt: T1,
          acknowledgementState:
            "UNSEEN",
          tombstone: false,
        },
      ],
    });

    const cursor =
      await store.getSyncCursor(
        ADVISOR_A,
      );
    const record =
      await store.getDueAction(
        ADVISOR_A,
        PROSPECT,
      );

    assert.equal(
      cursor.cursor,
      "cursor-001",
    );
    assert.equal(
      record.syncState,
      "SYNCED",
    );
  },
);

test(
  "Stage 3A does not advance cursor when local atomic reconciliation fails",
  async () => {
    const {
      store,
      driver,
    } = harness();

    driver.failNextAtomic();

    await assert.rejects(
      store.reconcileRemoteChanges({
        advisorPartitionKey:
          ADVISOR_A,
        cursor: "cursor-failed",
        reconciledAt: T1,
        records: [
          {
            advisorPartitionKey:
              ADVISOR_A,
            prospectReference:
              PROSPECT,
            approvedDisplayName:
              "Juan Pérez",
            nextActionType:
              "WHATSAPP",
            nextActionAt:
              "2026-07-26T15:00:00.000Z",
            dueActionState:
              "SCHEDULED",
            dueActionVersion: 1,
            localUpdatedAt: T1,
            acknowledgementState:
              "UNSEEN",
            tombstone: false,
          },
        ],
      }),
      /SIMULATED_ATOMIC_FAILURE/,
    );

    const cursor =
      await store.getSyncCursor(
        ADVISOR_A,
      );

    assert.equal(cursor, null);
  },
);

test(
  "Stage 3A clears only the selected advisor partition",
  async () => {
    const driver = memoryDriver();
    const store =
      storeModule.create({ driver });

    const outboxA =
      outboxModule.create({
        store,
        deviceId: "device-A",
      });
    const outboxB =
      outboxModule.create({
        store,
        deviceId: "device-B",
      });

    await schedule(outboxA);

    await schedule(outboxB, {
      advisorPartitionKey:
        ADVISOR_B,
      prospectReference:
        "prospect-002",
      operationAt: T1,
    });

    await store.clearAdvisorPartition(
      ADVISOR_A,
    );

    assert.deepEqual(
      await store.listDueActions(
        ADVISOR_A,
      ),
      [],
    );
    assert.equal(
      (
        await store.listDueActions(
          ADVISOR_B,
        )
      ).length,
      1,
    );
  },
);

test(
  "Stage 3A production modules contain IndexedDB but no network provider or message authority",
  () => {
    const storeSource =
      fs.readFileSync(
        require.resolve(
          "../advisor-os/offline/due-action-indexeddb-store",
        ),
        "utf8",
      );
    const outboxSource =
      fs.readFileSync(
        require.resolve(
          "../advisor-os/offline/due-action-outbox-service",
        ),
        "utf8",
      );

    assert.equal(
      /indexedDB\.open|indexedDB\.open\(/.test(
        storeSource,
      ),
      true,
    );
    assert.equal(
      /\bfetch\s*\(/.test(
        `${storeSource}\n${outboxSource}`,
      ),
      false,
    );
    assert.equal(
      /\.from\s*\(/.test(
        `${storeSource}\n${outboxSource}`,
      ),
      false,
    );
    assert.equal(
      /\.rpc\s*\(/.test(
        `${storeSource}\n${outboxSource}`,
      ),
      false,
    );
    assert.equal(
      /providerInvoked\s*:\s*true/.test(
        `${storeSource}\n${outboxSource}`,
      ),
      false,
    );
    assert.equal(
      /messageSendAllowed\s*:\s*true/.test(
        `${storeSource}\n${outboxSource}`,
      ),
      false,
    );
  },
);
