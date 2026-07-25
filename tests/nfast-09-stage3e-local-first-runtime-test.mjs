import test from "node:test";
import assert from "node:assert/strict";

import {
  createMiDiaDueActionRuntime,
} from "../advisor-os/home/mi-dia-due-action-runtime.js";

const ADVISOR = "advisor-001";
const AS_OF = "2026-07-25T15:00:00.000Z";
const TIME_ZONE = "America/Mexico_City";

function record(overrides = {}) {
  return {
    recordKey: `${ADVISOR}:prospect-001`,
    advisorPartitionKey: ADVISOR,
    prospectReference: "prospect-001",
    approvedDisplayName: "Juan Pérez",
    nextActionType: "CALL",
    nextActionAt: "2026-07-25T16:00:00.000Z",
    dueActionState: "SCHEDULED",
    dueActionVersion: 1,
    serverRevision: "1",
    remoteUpdatedAt: AS_OF,
    localUpdatedAt: AS_OF,
    lastSyncedAt: AS_OF,
    syncState: "SYNCED",
    acknowledgementState: "UNSEEN",
    acknowledgedAt: null,
    acknowledgedOnDeviceId: null,
    snoozedUntil: null,
    tombstone: false,
    ...overrides,
  };
}

function createEvents() {
  const listeners = new Map();

  return {
    addEventListener(name, handler) {
      if (!listeners.has(name)) listeners.set(name, new Set());
      listeners.get(name).add(handler);
    },
    removeEventListener(name, handler) {
      listeners.get(name)?.delete(handler);
    },
    dispatch(name) {
      for (const handler of listeners.get(name) || []) handler();
    },
    count(name) {
      return listeners.get(name)?.size || 0;
    },
  };
}

function createTimer() {
  let callback = null;
  let cleared = false;

  return {
    api: {
      setInterval(next) {
        callback = next;
        return 9;
      },
      clearInterval(id) {
        assert.equal(id, 9);
        cleared = true;
      },
    },
    tick() {
      callback?.();
    },
    cleared() {
      return cleared;
    },
  };
}

function harness({
  initialRecords = [record()],
  syncImplementation = null,
  online = true,
} = {}) {
  let records = initialRecords;
  const calls = [];
  const events = createEvents();
  const visibility = createEvents();
  const timer = createTimer();
  const renders = [];

  const store = {
    async listDueActions(value) {
      assert.equal(value, ADVISOR);
      calls.push("LOCAL_READ");
      return structuredClone(records);
    },
    async close() {
      calls.push("STORE_CLOSE");
    },
  };

  const syncService = {
    async syncAdvisor(options) {
      calls.push("REMOTE_SYNC");
      if (syncImplementation) {
        return syncImplementation({
          options,
          setRecords(next) {
            records = next;
          },
        });
      }
      return { status: "SYNCED", pulled: 0 };
    },
  };

  const runtime = createMiDiaDueActionRuntime({
    store,
    syncService,
    journal: {
      async close() {
        calls.push("JOURNAL_CLOSE");
      },
    },
    gateway: {},
    remoteEnabled: true,
    clock: () => AS_OF,
    onlineProvider: () => online,
    visibleProvider: () => true,
    eventTarget: events,
    visibilityTarget: visibility,
    timerApi: timer.api,
    intervalMs: 60_000,
  });

  return {
    calls,
    events,
    visibility,
    timer,
    renders,
    mount: () =>
      runtime.mount({
        advisorPartitionKey: ADVISOR,
        timeZone: TIME_ZONE,
        render(view, metadata) {
          renders.push({ view, metadata });
        },
      }),
  };
}

test("Stage 3E renders local before remote completion", async () => {
  let release;
  const blocker = new Promise(resolve => {
    release = resolve;
  });

  const context = harness({
    syncImplementation: async () => {
      await blocker;
      return { status: "SYNCED" };
    },
  });

  const mounted = await context.mount();

  assert.deepEqual(
    context.calls.slice(0, 2),
    ["LOCAL_READ", "REMOTE_SYNC"],
  );
  assert.equal(context.renders.length, 1);
  assert.equal(context.renders[0].metadata.source, "LOCAL_REPLICA");

  release();
  await mounted.syncPromise;
});

test("Stage 3E stays local while offline", async () => {
  const context = harness({ online: false });
  const mounted = await context.mount();
  const result = await mounted.syncPromise;

  assert.equal(result.status, "OFFLINE");
  assert.equal(context.calls.includes("REMOTE_SYNC"), false);
  assert.equal(context.renders.length, 1);
});

test("Stage 3E rerenders after effective sync change", async () => {
  const context = harness({
    syncImplementation: async ({ setRecords }) => {
      setRecords([
        record({
          acknowledgementState: "ACKNOWLEDGED",
          serverRevision: "2",
        }),
      ]);
      return { status: "SYNCED" };
    },
  });

  const mounted = await context.mount();
  const result = await mounted.syncPromise;

  assert.equal(result.rerendered, true);
  assert.equal(context.renders.length, 2);
});

test("Stage 3E skips no-op rerender", async () => {
  const context = harness();
  const mounted = await context.mount();
  const result = await mounted.syncPromise;

  assert.equal(result.rerendered, false);
  assert.equal(context.renders.length, 1);
});

test("Stage 3E coalesces simultaneous runtime sync", async () => {
  let release;
  let count = 0;
  const blocker = new Promise(resolve => {
    release = resolve;
  });

  const context = harness({
    syncImplementation: async () => {
      count += 1;
      await blocker;
      return { status: "SYNCED" };
    },
  });

  const mounted = await context.mount();
  const left = mounted.requestSync("FOCUS");
  const right = mounted.requestSync("ONLINE");

  assert.equal(left, right);
  assert.equal(count, 1);

  release();
  await mounted.syncPromise;
});

test("Stage 3E reacts to focus visibility online and tick", async () => {
  const context = harness();
  const mounted = await context.mount();
  await mounted.syncPromise;

  context.events.dispatch("focus");
  context.events.dispatch("online");
  context.visibility.dispatch("visibilitychange");
  context.timer.tick();

  await new Promise(resolve => setTimeout(resolve, 0));

  assert.ok(
    context.calls.filter(value => value === "LOCAL_READ").length >= 3,
  );
});

test("Stage 3E responds to local mutation event", async () => {
  const context = harness();
  const mounted = await context.mount();
  await mounted.syncPromise;

  const before =
    context.calls.filter(value => value === "LOCAL_READ").length;

  context.events.dispatch("nfast09:due-action-mutated");
  await new Promise(resolve => setTimeout(resolve, 0));

  const after =
    context.calls.filter(value => value === "LOCAL_READ").length;

  assert.ok(after > before);
});

test("Stage 3E destroy cleans listeners timer and stores", async () => {
  const context = harness();
  const mounted = await context.mount();
  await mounted.syncPromise;
  await mounted.destroy();

  assert.equal(context.events.count("focus"), 0);
  assert.equal(context.timer.cleared(), true);
  assert.ok(context.calls.includes("STORE_CLOSE"));
  assert.ok(context.calls.includes("JOURNAL_CLOSE"));
});
