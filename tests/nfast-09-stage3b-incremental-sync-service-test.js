"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");

const contract = require(
  "../advisor-os/offline/due-action-offline-contract",
);
const syncServiceModule = require(
  "../advisor-os/offline/due-action-sync-service",
);

const ADVISOR = "advisor-A";
const OTHER_ADVISOR = "advisor-B";
const PROSPECT = "prospect-001";
const DEVICE = "device-tablet";
const T0 = "2026-07-25T01:00:00.000Z";
const T1 = "2026-07-25T01:01:00.000Z";
const T2 = "2026-07-25T01:02:00.000Z";

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function makeRecord(overrides = {}) {
  return contract.normalizeDueActionRecord({
    advisorPartitionKey: ADVISOR,
    prospectReference: PROSPECT,
    approvedDisplayName: "Juan Pérez",
    nextActionType: "WHATSAPP",
    nextActionAt:
      "2026-07-26T15:00:00.000Z",
    dueActionState: "SCHEDULED",
    dueActionVersion: 1,
    serverRevision: "revision-001",
    remoteUpdatedAt: T0,
    localUpdatedAt: T0,
    lastSyncedAt: null,
    syncState: "LOCAL_PENDING",
    acknowledgementState: "UNSEEN",
    acknowledgedAt: null,
    acknowledgedOnDeviceId: null,
    snoozedUntil: null,
    tombstone: false,
    ...overrides,
  });
}

function makeMutation(overrides = {}) {
  const seed = {
    deviceId: DEVICE,
    advisorPartitionKey: ADVISOR,
    prospectReference: PROSPECT,
    dueActionVersion: 1,
    operation: "SCHEDULE",
    createdAt: T0,
    authorizedPatch: {
      approvedDisplayName: "Juan Pérez",
      nextActionType: "WHATSAPP",
      nextActionAt:
        "2026-07-26T15:00:00.000Z",
    },
    ...overrides,
  };

  return contract.normalizeOutboxMutation({
    mutationId:
      contract.createMutationId(seed),
    deviceId: seed.deviceId,
    advisorPartitionKey:
      seed.advisorPartitionKey,
    prospectReference:
      seed.prospectReference,
    dueActionVersion:
      seed.dueActionVersion,
    operation: seed.operation,
    authorizedPatch:
      seed.authorizedPatch,
    baseServerRevision:
      "revision-001",
    createdAt: seed.createdAt,
    attemptCount: 0,
    syncState: "LOCAL_PENDING",
  });
}

function harness({
  mutation = makeMutation(),
  record = makeRecord(),
  push,
  pull,
  clockValues = [T1, T2, T2],
} = {}) {
  const state = {
    records: new Map([
      [record.recordKey, clone(record)],
    ]),
    mutations: new Map([
      [
        mutation.mutationId,
        clone(mutation),
      ],
    ]),
    metadata: new Map(),
    conflicts: [],
    pushCalls: [],
    pullCalls: [],
    reconcileCalls: [],
  };

  let clockIndex = 0;

  const store = {
    async getDueAction(
      advisorPartitionKey,
      prospectReference,
    ) {
      const key =
        contract.recordKeyFor(
          advisorPartitionKey,
          prospectReference,
        );
      const value = state.records.get(key);
      return value ? clone(value) : null;
    },

    async listPendingMutations(
      advisorPartitionKey,
    ) {
      return [...state.mutations.values()]
        .filter(
          item =>
            item.advisorPartitionKey ===
            advisorPartitionKey,
        )
        .map(clone);
    },

    async acknowledgeMutation({
      advisorPartitionKey,
      mutationId,
      acknowledged,
      serverRecord,
      serverRevision,
      acknowledgedAt,
    }) {
      assert.equal(acknowledged, true);
      const mutationValue =
        state.mutations.get(mutationId);

      if (!mutationValue) {
        return {
          alreadyAcknowledged: true,
        };
      }

      assert.equal(
        mutationValue.advisorPartitionKey,
        advisorPartitionKey,
      );

      const normalized =
        contract.normalizeDueActionRecord({
          ...serverRecord,
          serverRevision,
          lastSyncedAt: acknowledgedAt,
          syncState: "SYNCED",
        });

      state.records.set(
        normalized.recordKey,
        clone(normalized),
      );
      state.mutations.delete(mutationId);

      return {
        alreadyAcknowledged: false,
      };
    },

    async getSyncCursor(
      advisorPartitionKey,
    ) {
      return clone(
        state.metadata.get(
          advisorPartitionKey,
        ) || null,
      );
    },

    async reconcileRemoteChanges({
      advisorPartitionKey,
      records,
      cursor,
      reconciledAt,
    }) {
      for (const item of records) {
        const normalized =
          contract.normalizeDueActionRecord({
            ...item,
            lastSyncedAt: reconciledAt,
            syncState: "SYNCED",
          });

        if (
          normalized.advisorPartitionKey !==
          advisorPartitionKey
        ) {
          throw new Error(
            "CROSS_ADVISOR_REMOTE_CHANGE_DENIED",
          );
        }

        state.records.set(
          normalized.recordKey,
          clone(normalized),
        );
      }

      state.metadata.set(
        advisorPartitionKey,
        {
          partitionKey:
            advisorPartitionKey,
          cursor,
          reconciledAt,
          conflicts:
            clone(state.conflicts),
        },
      );

      state.reconcileCalls.push({
        advisorPartitionKey,
        cursor,
        count: records.length,
      });

      return {
        recordsApplied: records.length,
        cursor,
      };
    },
  };

  const journal = {
    async markMutationState({
      advisorPartitionKey,
      mutationId,
      syncState,
      attemptIncrement,
    }) {
      const current =
        state.mutations.get(mutationId);

      if (!current) {
        return {
          mutationMissing: true,
        };
      }

      assert.equal(
        current.advisorPartitionKey,
        advisorPartitionKey,
      );

      const updated =
        contract.normalizeOutboxMutation({
          ...current,
          attemptCount:
            current.attemptCount +
            attemptIncrement,
          syncState,
        });

      state.mutations.set(
        mutationId,
        clone(updated),
      );

      return {
        mutationMissing: false,
        mutation: clone(updated),
      };
    },

    async recordConflict({
      advisorPartitionKey,
      mutationId,
      localRecord,
      remoteRecord,
      reasonCode,
      detectedAt,
    }) {
      const current =
        state.mutations.get(mutationId);

      const conflict = {
        conflictId:
          `conflict-${mutationId}`,
        status: "OPEN",
        advisorPartitionKey,
        prospectReference:
          current.prospectReference,
        mutationId,
        localRecord: clone(localRecord),
        remoteRecord:
          clone(remoteRecord),
        reasonCode,
        detectedAt,
      };

      state.conflicts.push(conflict);

      state.mutations.set(
        mutationId,
        clone(
          contract.normalizeOutboxMutation({
            ...current,
            syncState:
              "CONFLICT_REVIEW_REQUIRED",
          }),
        ),
      );

      state.records.set(
        localRecord.recordKey,
        clone(
          contract.normalizeDueActionRecord({
            ...localRecord,
            dueActionState:
              "CONFLICT_REVIEW_REQUIRED",
            syncState:
              "CONFLICT_REVIEW_REQUIRED",
            localUpdatedAt: detectedAt,
            tombstone: false,
          }),
        ),
      );

      return clone(conflict);
    },

    async listOpenConflicts(
      advisorPartitionKey,
    ) {
      return state.conflicts
        .filter(
          item =>
            item.advisorPartitionKey ===
            advisorPartitionKey &&
            item.status === "OPEN",
        )
        .map(clone);
    },
  };

  const gateway = {
    async pushMutation(payload) {
      state.pushCalls.push(clone(payload));

      if (push) {
        return push(payload, state);
      }

      return {
        status: "ACKNOWLEDGED",
        mutationId:
          payload.mutation.mutationId,
        acknowledgedAt: T1,
        serverRevision:
          "revision-002",
        serverRecord:
          makeRecord({
            serverRevision:
              "revision-002",
            remoteUpdatedAt: T1,
            localUpdatedAt: T1,
            syncState: "SYNCED",
          }),
      };
    },

    async pullChanges(payload) {
      state.pullCalls.push(clone(payload));

      if (pull) {
        return pull(payload, state);
      }

      return {
        records: [],
        nextCursor: "cursor-001",
        hasMore: false,
      };
    },
  };

  const service =
    syncServiceModule.create({
      store,
      journal,
      gateway,
      clock: () => {
        const value =
          clockValues[
            Math.min(
              clockIndex,
              clockValues.length - 1,
            )
          ];
        clockIndex += 1;
        return value;
      },
    });

  return {
    state,
    store,
    journal,
    gateway,
    service,
  };
}

test(
  "Stage 3B stays local while offline",
  async () => {
    const { service, state } = harness();

    const result =
      await service.syncAdvisor({
        advisorPartitionKey: ADVISOR,
        online: false,
        authenticated: true,
      });

    assert.equal(result.status, "OFFLINE");
    assert.equal(state.pushCalls.length, 0);
    assert.equal(state.pullCalls.length, 0);
  },
);

test(
  "Stage 3B requires authentication before gateway access",
  async () => {
    const { service, state } = harness();

    const result =
      await service.syncAdvisor({
        advisorPartitionKey: ADVISOR,
        online: true,
        authenticated: false,
      });

    assert.equal(
      result.status,
      "AUTH_REQUIRED",
    );
    assert.equal(state.pushCalls.length, 0);
    assert.equal(state.pullCalls.length, 0);
  },
);

test(
  "Stage 3B acknowledges outbox then pulls incrementally",
  async () => {
    const { service, state } = harness();

    const result =
      await service.syncAdvisor({
        advisorPartitionKey: ADVISOR,
        online: true,
        authenticated: true,
      });

    assert.equal(result.status, "SYNCED");
    assert.equal(result.pushed, 1);
    assert.equal(
      state.mutations.size,
      0,
    );
    assert.equal(
      state.pullCalls[0].cursor,
      null,
    );
    assert.equal(
      state.metadata.get(ADVISOR).cursor,
      "cursor-001",
    );
  },
);

test(
  "Stage 3B retains failed mutation with durable retry state",
  async () => {
    const { service, state } = harness({
      push: async () => {
        throw new Error("NETWORK_DOWN");
      },
    });

    const result =
      await service.syncAdvisor({
        advisorPartitionKey: ADVISOR,
        online: true,
        authenticated: true,
      });

    const pending =
      [...state.mutations.values()][0];

    assert.equal(
      result.status,
      "RETRY_REQUIRED",
    );
    assert.equal(
      pending.syncState,
      "SYNC_FAILED",
    );
    assert.equal(
      pending.attemptCount,
      1,
    );
    assert.equal(state.pullCalls.length, 0);
  },
);

test(
  "Stage 3B retries a previously failed mutation idempotently",
  async () => {
    let attempts = 0;

    const { service, state } = harness({
      push: async payload => {
        attempts += 1;

        if (attempts === 1) {
          throw new Error("TEMPORARY");
        }

        return {
          status: "ACKNOWLEDGED",
          mutationId:
            payload.mutation.mutationId,
          acknowledgedAt: T1,
          serverRevision:
            "revision-002",
          serverRecord:
            makeRecord({
              serverRevision:
                "revision-002",
              remoteUpdatedAt: T1,
              localUpdatedAt: T1,
              syncState: "SYNCED",
            }),
        };
      },
    });

    const first =
      await service.syncAdvisor({
        advisorPartitionKey: ADVISOR,
        online: true,
        authenticated: true,
      });

    const second =
      await service.syncAdvisor({
        advisorPartitionKey: ADVISOR,
        online: true,
        authenticated: true,
      });

    assert.equal(
      first.status,
      "RETRY_REQUIRED",
    );
    assert.equal(second.status, "SYNCED");
    assert.equal(attempts, 2);
    assert.equal(state.mutations.size, 0);
    assert.equal(
      state.pushCalls[0].mutation.mutationId,
      state.pushCalls[1].mutation.mutationId,
    );
  },
);

test(
  "Stage 3B preserves both candidates on lifecycle conflict",
  async () => {
    const { service, state } = harness({
      push: async payload => ({
        status: "CONFLICT",
        mutationId:
          payload.mutation.mutationId,
        detectedAt: T1,
        reasonCode:
          "REMOTE_REVISION_CHANGED",
        remoteRecord:
          makeRecord({
            nextActionType: "CALL",
            nextActionAt:
              "2026-07-27T16:00:00.000Z",
            dueActionVersion: 2,
            serverRevision:
              "revision-009",
            remoteUpdatedAt: T1,
            localUpdatedAt: T1,
            syncState: "SYNCED",
          }),
      }),
    });

    const result =
      await service.syncAdvisor({
        advisorPartitionKey: ADVISOR,
        online: true,
        authenticated: true,
      });

    const local =
      [...state.records.values()][0];
    const pending =
      [...state.mutations.values()][0];

    assert.equal(
      result.status,
      "CONFLICT_REVIEW_REQUIRED",
    );
    assert.equal(
      state.conflicts.length,
      1,
    );
    assert.equal(
      state.conflicts[0]
        .localRecord.nextActionType,
      "WHATSAPP",
    );
    assert.equal(
      state.conflicts[0]
        .remoteRecord.nextActionType,
      "CALL",
    );
    assert.equal(
      local.dueActionState,
      "CONFLICT_REVIEW_REQUIRED",
    );
    assert.equal(
      pending.syncState,
      "CONFLICT_REVIEW_REQUIRED",
    );
    assert.equal(state.pullCalls.length, 0);
  },
);

test(
  "Stage 3B synchronizes acknowledgement from another device without completing action",
  async () => {
    const { service, state } = harness({
      mutation: contract.normalizeOutboxMutation({
        ...makeMutation(),
        operation: "MARK_SEEN",
        authorizedPatch: {},
      }),
      push: async payload => ({
        status: "ACKNOWLEDGED",
        mutationId:
          payload.mutation.mutationId,
        acknowledgedAt: T1,
        serverRevision:
          "revision-002",
        serverRecord:
          makeRecord({
            serverRevision:
              "revision-002",
            remoteUpdatedAt: T1,
            localUpdatedAt: T1,
            syncState: "SYNCED",
            acknowledgementState:
              "ACKNOWLEDGED",
            acknowledgedAt: T1,
            acknowledgedOnDeviceId:
              "device-phone",
          }),
      }),
    });

    const result =
      await service.syncAdvisor({
        advisorPartitionKey: ADVISOR,
        online: true,
        authenticated: true,
      });

    const record =
      [...state.records.values()][0];

    assert.equal(result.status, "SYNCED");
    assert.equal(
      record.acknowledgementState,
      "ACKNOWLEDGED",
    );
    assert.equal(
      record.dueActionState,
      "SCHEDULED",
    );
    assert.equal(record.tombstone, false);
  },
);

test(
  "Stage 3B rejects cross-advisor pulled records",
  async () => {
    const { service } = harness({
      pull: async () => ({
        records: [
          makeRecord({
            advisorPartitionKey:
              OTHER_ADVISOR,
          }),
        ],
        nextCursor: "cursor-002",
        hasMore: false,
      }),
    });

    await assert.rejects(
      service.syncAdvisor({
        advisorPartitionKey: ADVISOR,
        online: true,
        authenticated: true,
      }),
      error =>
        error.code ===
        "CROSS_ADVISOR_PULL_DENIED",
    );
  },
);

test(
  "Stage 3B advances incremental cursor across pages",
  async () => {
    const cursors = [];

    const { service, state } = harness({
      pull: async payload => {
        cursors.push(payload.cursor);

        if (payload.cursor === null) {
          return {
            records: [
              makeRecord({
                prospectReference:
                  "prospect-002",
                serverRevision:
                  "revision-002",
                remoteUpdatedAt: T1,
                localUpdatedAt: T1,
                syncState: "SYNCED",
              }),
            ],
            nextCursor: "cursor-001",
            hasMore: true,
          };
        }

        return {
          records: [
            makeRecord({
              prospectReference:
                "prospect-003",
              serverRevision:
                "revision-003",
              remoteUpdatedAt: T2,
              localUpdatedAt: T2,
              syncState: "SYNCED",
            }),
          ],
          nextCursor: "cursor-002",
          hasMore: false,
        };
      },
    });

    const result =
      await service.syncAdvisor({
        advisorPartitionKey: ADVISOR,
        online: true,
        authenticated: true,
      });

    assert.equal(result.pages, 2);
    assert.equal(result.pulled, 2);
    assert.deepEqual(
      cursors,
      [null, "cursor-001"],
    );
    assert.equal(
      state.metadata.get(ADVISOR).cursor,
      "cursor-002",
    );
  },
);

test(
  "Stage 3B coalesces concurrent sync for one advisor",
  async () => {
    let release;
    const blocker = new Promise(
      resolve => {
        release = resolve;
      },
    );

    const { service, state } = harness({
      push: async payload => {
        await blocker;

        return {
          status: "ACKNOWLEDGED",
          mutationId:
            payload.mutation.mutationId,
          acknowledgedAt: T1,
          serverRevision:
            "revision-002",
          serverRecord:
            makeRecord({
              serverRevision:
                "revision-002",
              remoteUpdatedAt: T1,
              localUpdatedAt: T1,
              syncState: "SYNCED",
            }),
        };
      },
    });

    const first =
      service.syncAdvisor({
        advisorPartitionKey: ADVISOR,
        online: true,
        authenticated: true,
      });
    const second =
      service.syncAdvisor({
        advisorPartitionKey: ADVISOR,
        online: true,
        authenticated: true,
      });

    assert.equal(first, second);

    release();

    const [left, right] =
      await Promise.all([first, second]);

    assert.deepEqual(left, right);
    assert.equal(state.pushCalls.length, 1);
  },
);

test(
  "Stage 3B rejects invalid push response and retains failed mutation",
  async () => {
    const { service, state } = harness({
      push: async () => ({
        status: "MAGIC_SUCCESS",
        mutationId: "wrong",
      }),
    });

    await assert.rejects(
      service.syncAdvisor({
        advisorPartitionKey: ADVISOR,
        online: true,
        authenticated: true,
      }),
      error =>
        error.code ===
        "PUSH_MUTATION_ID_MISMATCH",
    );

    const pending =
      [...state.mutations.values()][0];

    assert.equal(
      pending.syncState,
      "SYNC_FAILED",
    );
    assert.equal(pending.attemptCount, 1);
  },
);

test(
  "Stage 3B blocks a non-advancing paginated cursor",
  async () => {
    const { service } = harness({
      pull: async () => ({
        records: [],
        nextCursor: null,
        hasMore: true,
      }),
    });

    await assert.rejects(
      service.syncAdvisor({
        advisorPartitionKey: ADVISOR,
        online: true,
        authenticated: true,
      }),
      error =>
        error.code ===
        "NON_ADVANCING_CURSOR",
    );
  },
);

test(
  "Stage 3B production sync modules contain no direct provider message or cache clearing authority",
  () => {
    const serviceSource =
      fs.readFileSync(
        require.resolve(
          "../advisor-os/offline/due-action-sync-service",
        ),
        "utf8",
      );

    const journalSource =
      fs.readFileSync(
        require.resolve(
          "../advisor-os/offline/due-action-sync-journal",
        ),
        "utf8",
      );

    const combined =
      `${serviceSource}\n${journalSource}`;

    assert.equal(
      /\bfetch\s*\(/.test(combined),
      false,
    );
    assert.equal(
      /\.from\s*\(/.test(combined),
      false,
    );
    assert.equal(
      /\.rpc\s*\(/.test(combined),
      false,
    );
    assert.equal(
      /clearAdvisorPartition\s*\(/.test(
        combined,
      ),
      false,
    );
    assert.equal(
      /providerInvocationAllowed\s*:\s*true/.test(
        combined,
      ),
      false,
    );
    assert.equal(
      /messageGenerationAllowed\s*:\s*true/.test(
        combined,
      ),
      false,
    );
    assert.equal(
      /messageSendAllowed\s*:\s*true/.test(
        combined,
      ),
      false,
    );
  },
);
