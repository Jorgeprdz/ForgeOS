"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");

const contract = require("../advisor-os/offline/due-action-offline-contract");
const gatewayModule = require("../advisor-os/offline/due-action-supabase-gateway");

const ADVISOR = "11111111-1111-4111-8111-111111111111";
const OTHER = "22222222-2222-4222-8222-222222222222";
const PROSPECT = "33333333-3333-4333-8333-333333333333";
const NOW = "2026-07-25T03:00:00.000Z";

function makeRecord(overrides = {}) {
  return contract.normalizeDueActionRecord({
    advisorPartitionKey: ADVISOR,
    prospectReference: PROSPECT,
    approvedDisplayName: "Juan Pérez",
    nextActionType: "WHATSAPP",
    nextActionAt: "2026-07-26T15:00:00.000Z",
    dueActionState: "SCHEDULED",
    dueActionVersion: 1,
    serverRevision: "1",
    remoteUpdatedAt: NOW,
    localUpdatedAt: NOW,
    lastSyncedAt: null,
    syncState: "SYNCED",
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
    deviceId: "device-tablet",
    advisorPartitionKey: ADVISOR,
    prospectReference: PROSPECT,
    dueActionVersion: 1,
    operation: "SCHEDULE",
    createdAt: NOW,
    authorizedPatch: {
      approvedDisplayName: "Juan Pérez",
      nextActionType: "WHATSAPP",
      nextActionAt: "2026-07-26T15:00:00.000Z",
    },
    ...overrides,
  };

  return contract.normalizeOutboxMutation({
    mutationId: contract.createMutationId(seed),
    deviceId: seed.deviceId,
    advisorPartitionKey: seed.advisorPartitionKey,
    prospectReference: seed.prospectReference,
    dueActionVersion: seed.dueActionVersion,
    operation: seed.operation,
    authorizedPatch: seed.authorizedPatch,
    baseServerRevision: null,
    createdAt: seed.createdAt,
    attemptCount: 0,
    syncState: "LOCAL_PENDING",
  });
}

function createClient({ userId = ADVISOR, authError = null, rpc } = {}) {
  const calls = [];
  return {
    calls,
    auth: {
      async getUser() {
        return {
          data: { user: userId ? { id: userId } : null },
          error: authError,
        };
      },
    },
    async rpc(name, args) {
      calls.push({ name, args });
      return rpc ? rpc(name, args, calls) : { data: null, error: null };
    },
  };
}

test("Stage 3C requires authenticated Supabase client", () => {
  assert.throws(
    () => gatewayModule.create({ rpc() {} }),
    error => error.code === "SUPABASE_CLIENT_INVALID",
  );
});

test("Stage 3C blocks advisor injection before RPC", async () => {
  const client = createClient();
  const gateway = gatewayModule.create(client);
  await assert.rejects(
    gateway.pullChanges({ advisorPartitionKey: OTHER, cursor: null }),
    error => error.code === "ADVISOR_PARTITION_MISMATCH",
  );
  assert.equal(client.calls.length, 0);
});

test("Stage 3C pushes normalized mutation through governed RPC", async () => {
  const mutation = makeMutation();
  const client = createClient({
    rpc: async () => ({
      data: {
        status: "ACKNOWLEDGED",
        mutationId: mutation.mutationId,
        acknowledgedAt: NOW,
        serverRevision: "2",
        serverRecord: makeRecord({ serverRevision: "2" }),
      },
      error: null,
    }),
  });
  const gateway = gatewayModule.create(client);
  const result = await gateway.pushMutation({
    advisorPartitionKey: ADVISOR,
    mutation,
  });
  assert.equal(
    client.calls[0].name,
    "forge_nfast09_push_due_action_mutation",
  );
  assert.deepEqual(client.calls[0].args.p_mutation, mutation);
  assert.equal(result.status, "ACKNOWLEDGED");
  assert.equal(result.serverRevision, "2");
});

test("Stage 3C maps governed lifecycle conflict", async () => {
  const mutation = makeMutation();
  const client = createClient({
    rpc: async () => ({
      data: {
        status: "CONFLICT",
        mutationId: mutation.mutationId,
        detectedAt: NOW,
        reasonCode: "REMOTE_REVISION_CHANGED",
        remoteRecord: makeRecord({
          nextActionType: "CALL",
          serverRevision: "9",
        }),
      },
      error: null,
    }),
  });
  const result = await gatewayModule.create(client).pushMutation({
    advisorPartitionKey: ADVISOR,
    mutation,
  });
  assert.equal(result.status, "CONFLICT");
  assert.equal(result.remoteRecord.nextActionType, "CALL");
});

test("Stage 3C pulls minimized records from cursor", async () => {
  const client = createClient({
    rpc: async () => ({
      data: {
        records: [makeRecord()],
        nextCursor: "14",
        hasMore: false,
      },
      error: null,
    }),
  });
  const gateway = gatewayModule.create(client, { pullLimit: 50 });
  const result = await gateway.pullChanges({
    advisorPartitionKey: ADVISOR,
    cursor: "10",
  });
  assert.deepEqual(client.calls[0].args, {
    p_cursor: "10",
    p_limit: 50,
  });
  assert.equal(result.records.length, 1);
  assert.equal(result.nextCursor, "14");
});

test("Stage 3C rejects cross-advisor RPC records", async () => {
  const client = createClient({
    rpc: async () => ({
      data: {
        records: [makeRecord({ advisorPartitionKey: OTHER })],
        nextCursor: "1",
        hasMore: false,
      },
      error: null,
    }),
  });
  await assert.rejects(
    gatewayModule.create(client).pullChanges({
      advisorPartitionKey: ADVISOR,
      cursor: null,
    }),
    error => error.code === "CROSS_ADVISOR_PULL_DENIED",
  );
});

test("Stage 3C maps transport errors to durable retry", async () => {
  const client = createClient({
    rpc: async () => ({ data: null, error: { code: "08006" } }),
  });
  await assert.rejects(
    gatewayModule.create(client).pullChanges({
      advisorPartitionKey: ADVISOR,
      cursor: null,
    }),
    error => error.code === "NETWORK_ERROR",
  );
});

test("Stage 3C rejects sensitive outbox before RPC", async () => {
  const client = createClient();
  const mutation = {
    ...makeMutation(),
    authorizedPatch: { rawNotes: "No debe salir" },
  };
  await assert.rejects(
    gatewayModule.create(client).pushMutation({
      advisorPartitionKey: ADVISOR,
      mutation,
    }),
    error => error.code === "PROHIBITED_OUTBOX_DATA",
  );
  assert.equal(client.calls.length, 0);
});

test("Stage 3C rejects invalid cursor before RPC", async () => {
  const client = createClient();
  await assert.rejects(
    gatewayModule.create(client).pullChanges({
      advisorPartitionKey: ADVISOR,
      cursor: "cursor con espacios",
    }),
    error => error.code === "SYNC_CURSOR_INVALID",
  );
  assert.equal(client.calls.length, 0);
});

test("Stage 3C exposes RPC-only productive boundary", () => {
  const diagnostics = gatewayModule.create(createClient()).diagnostics();
  assert.equal(diagnostics.productiveSupabaseGateway, true);
  assert.equal(diagnostics.directTableAccess, false);
  assert.equal(diagnostics.rpcOnly, true);
  assert.equal(diagnostics.rawNotesAllowed, false);
});

test("Stage 3C gateway has no direct table message or cache authority", () => {
  const source = fs.readFileSync(
    require.resolve("../advisor-os/offline/due-action-supabase-gateway"),
    "utf8",
  );
  assert.equal(/\.from\s*\(/.test(source), false);
  assert.equal(/\bfetch\s*\(/.test(source), false);
  assert.equal(/clearAdvisorPartition\s*\(/.test(source), false);
  assert.equal(/messageGenerationAllowed\s*:\s*true/.test(source), false);
  assert.equal(/messageSendAllowed\s*:\s*true/.test(source), false);
});
