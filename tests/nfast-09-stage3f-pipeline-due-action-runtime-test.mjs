import test from "node:test";
import assert from "node:assert/strict";

import "../advisor-os/offline/due-action-offline-contract.js";
import {
  createPipelineDueActionRuntime,
} from "../advisor-os/sales-pipeline/pipeline-due-action-runtime.js";

const contract =
  globalThis.ForgeDueActionOfflineContractNFAST09;

function store() {
  let record = null;

  return {
    async getDueAction() {
      return record;
    },
    async commitLocalMutation(nextRecord, mutation) {
      record = nextRecord;
      return {
        idempotentReplay: false,
        record,
        mutation,
      };
    },
    async close() {},
  };
}

test("Stage 3F runtime binds advisor at construction", async () => {
  const localStore = store();
  const runtime = createPipelineDueActionRuntime({
    advisorPartitionKey: "advisor-A",
    store: localStore,
    remoteEnabled: false,
    deviceId: "device-tablet",
    clock: () => "2026-07-25T12:00:00.000Z",
    eventTarget: null,
  });

  const result = await runtime.execute({
    operation: "SCHEDULE",
    prospectReference: "prospect-001",
    approvedDisplayName: "Juan Pérez",
    nextActionType: "CALL",
    nextActionAt: "2026-07-26T16:00:00.000Z",
  });

  assert.equal(result.localCommitted, true);

  const loaded = await runtime.load("prospect-001");

  assert.equal(
    loaded.advisorPartitionKey,
    "advisor-A",
  );
  assert.equal(
    runtime.diagnostics().advisorBoundAtConstruction,
    true,
  );

  await runtime.close();
});

test("Stage 3F runtime keeps remote synchronization secondary", async () => {
  const localStore = store();
  const order = [];
  const runtime = createPipelineDueActionRuntime({
    advisorPartitionKey: "advisor-A",
    store: localStore,
    journal: {
      async close() {},
    },
    gateway: {},
    syncService: {
      async syncAdvisor() {
        order.push("sync");
        return { status: "SYNCED" };
      },
    },
    remoteEnabled: true,
    deviceId: "device-tablet",
    clock: () => "2026-07-25T12:00:00.000Z",
    eventTarget: null,
  });

  const result = await runtime.execute({
    operation: "SCHEDULE",
    prospectReference: "prospect-001",
    approvedDisplayName: "Juan Pérez",
    nextActionType: "CALL",
    nextActionAt: "2026-07-26T16:00:00.000Z",
  });

  assert.equal(result.localCommitted, true);
  assert.deepEqual(order, []);

  const syncResult = await result.syncPromise;

  assert.equal(syncResult.status, "SYNCED");
  assert.deepEqual(order, ["sync"]);

  await runtime.close();
});
