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
const runtimeModule = require(
  "../platform/event-evidence/activity-ledger-browser-runtime.js",
);

function eventInput(tenantId = "tenant-runtime-001", suffix = "001") {
  return {
    event_type: "PROSPECT_CREATED",
    tenant_id: tenantId,
    actor: { type: "SYSTEM", id: "forge-system" },
    subject: { type: "PROSPECT", id: `prospect-${suffix}` },
    source: {
      type: "SYSTEM_OBSERVED",
      reference: `source-${suffix}`,
      channel: "FORGE_SYSTEM",
    },
    evidence_strength: "SYSTEM_OBSERVED",
    occurred_at: "2026-07-26T05:00:00.000Z",
    recorded_at: "2026-07-26T05:00:01.000Z",
    effective_period: null,
    causation_id: null,
    correlation_id: `corr-${suffix}`,
    idempotency_key: `idem-${suffix}`,
    privacy_class: "PRIVATE",
    payload: {
      prospect_reference: `prospect-${suffix}`,
      source_category: "REFERRAL",
    },
    provenance: {
      source_system: "fes02c-runtime-test",
      source_record_id: `record-${suffix}`,
      captured_via: "FORGE_SYSTEM",
      evidence_references: [`evidence-${suffix}`],
    },
    confirmation_state: "CONFIRMED",
    correction_of: null,
    safety_flags: { ...canonical.DEFAULT_SAFETY_FLAGS },
  };
}

function evidence(suffix = "001") {
  return {
    reference_id: `evidence-${suffix}`,
    reference_type: "SYSTEM_OBSERVATION",
    source_system: "fes02c-runtime-test",
    captured_at: "2026-07-26T05:00:01.000Z",
    privacy_class: "PRIVATE",
    checksum: `checksum-${suffix}`,
    metadata: { observation_code: "CONTROLLED_RUNTIME_TEST" },
  };
}

function remoteGateway({ failPush = false, conflict = false } = {}) {
  const remote = new Map();
  let sequence = 0;
  const calls = [];

  function receipt(mutation, status, selectedSequence) {
    return ledger.createReceipt({
      status,
      tenant_id: mutation.tenant_id,
      event_id: mutation.event_id,
      mutation_id: mutation.mutation_id,
      server_sequence: selectedSequence,
      server_recorded_at: "2026-07-26T05:00:03.000Z",
      cursor: String(selectedSequence),
    });
  }

  return {
    gateway_version: "FES-02C.TEST",
    calls,
    remote,
    setFailPush(value) {
      failPush = value;
    },
    async pushMutation(mutation) {
      calls.push(`push:${mutation.event_id}`);
      if (failPush) {
        const error = new Error("offline");
        error.code = "NETWORK_ERROR";
        throw error;
      }
      const existing = remote.get(mutation.event_id);
      if (conflict || (existing && existing.record.event_digest !== mutation.event_digest)) {
        return {
          status: "CONFLICT",
          reason_code: "REMOTE_EVENT_ID_DIGEST_CONFLICT",
          remote_record: existing?.record || mutation.ledger_record,
          detected_at: "2026-07-26T05:00:04.000Z",
        };
      }
      if (existing) {
        return {
          status: "IDEMPOTENT_REPLAY",
          receipt: receipt(mutation, "IDEMPOTENT_REPLAY", existing.sequence),
        };
      }
      sequence += 1;
      remote.set(mutation.event_id, {
        record: mutation.ledger_record,
        mutation,
        sequence,
      });
      return {
        status: "ACKNOWLEDGED",
        receipt: receipt(mutation, "ACKNOWLEDGED", sequence),
      };
    },
    async pullChanges({ tenant_id, cursor }) {
      calls.push(`pull:${cursor || "0"}`);
      const selectedCursor = Number(cursor || 0);
      const changes = [...remote.values()]
        .filter(item => item.record.tenant_id === tenant_id)
        .filter(item => item.sequence > selectedCursor)
        .sort((left, right) => left.sequence - right.sequence)
        .map(item => ({
          ledger_record: item.record,
          receipt: receipt(item.mutation, "ACKNOWLEDGED", item.sequence),
        }));
      const next = changes.length
        ? String(Math.max(...changes.map(change => change.receipt.server_sequence)))
        : String(selectedCursor || sequence || 0);
      return {
        changes,
        cursor: next === "0" ? null : next,
        has_more: false,
      };
    },
  };
}

function createRuntime({
  tenantId = "tenant-runtime-001",
  gateway = remoteGateway(),
  store = localStoreModule.create({
    driver: localStoreModule.createMemoryDriver(),
    clock: () => "2026-07-26T05:00:02.000Z",
  }),
} = {}) {
  return runtimeModule.create({
    client: null,
    tenant_id: tenantId,
    device_id: "device-runtime-test",
    store,
    gateway,
    clock: () => "2026-07-26T05:00:02.000Z",
  });
}

test("FES 02C runtime exposes local-first controlled diagnostics", () => {
  const runtime = createRuntime();
  const diagnostics = runtime.diagnostics();
  assert.equal(diagnostics.runtime_version, "FES-02C.1");
  assert.equal(diagnostics.local_first, true);
  assert.equal(diagnostics.atomic_event_and_outbox, true);
  assert.equal(diagnostics.push_before_pull, true);
  assert.equal(diagnostics.background_sync, false);
  assert.equal(diagnostics.productive_ui_binding, false);
  assert.equal(diagnostics.provider_mutation, false);
  assert.ok(Object.isFrozen(diagnostics));
});

test("FES 02C runtime appends canonical event and outbox atomically", async () => {
  const runtime = createRuntime();
  const event = canonical.createCanonicalActivityEvent(eventInput());
  const result = await runtime.appendCanonicalEvent({
    canonical_event: event,
    evidence_references: [evidence()],
    appended_at: "2026-07-26T05:00:02.000Z",
  });
  assert.equal(result.appended, true);
  assert.equal((await runtime.listEntries()).length, 1);
  assert.equal((await runtime.listPendingOutbox()).length, 1);
});

test("FES 02C runtime synchronizes outbox before incremental pull", async () => {
  const gateway = remoteGateway();
  const runtime = createRuntime({ gateway });
  const event = canonical.createCanonicalActivityEvent(eventInput());
  await runtime.appendCanonicalEvent({
    canonical_event: event,
    evidence_references: [evidence()],
    appended_at: "2026-07-26T05:00:02.000Z",
  });
  const summary = await runtime.syncOnce();
  assert.equal(summary.push_acknowledged, 1);
  assert.equal(summary.pull_batches, 1);
  assert.deepEqual(gateway.calls, [`push:${event.event_id}`, "pull:1"]);
  assert.equal((await runtime.listPendingOutbox()).length, 0);
  assert.equal((await runtime.getReceipt(event.event_id)).status, "ACKNOWLEDGED");
  assert.equal(await runtime.getCursor(), "1");
});

test("FES 02C runtime preserves idempotent local append", async () => {
  const runtime = createRuntime();
  const event = canonical.createCanonicalActivityEvent(eventInput());
  const input = {
    canonical_event: event,
    evidence_references: [evidence()],
    appended_at: "2026-07-26T05:00:02.000Z",
  };
  const first = await runtime.appendCanonicalEvent(input);
  const second = await runtime.appendCanonicalEvent(input);
  assert.equal(first.appended, true);
  assert.equal(second.idempotent_replay, true);
  assert.equal((await runtime.listEntries()).length, 1);
});

test("FES 02C runtime rejects cross-tenant canonical append", async () => {
  const runtime = createRuntime({ tenantId: "tenant-runtime-001" });
  const event = canonical.createCanonicalActivityEvent(
    eventInput("tenant-runtime-002", "002"),
  );
  await assert.rejects(
    runtime.appendCanonicalEvent({
      canonical_event: event,
      evidence_references: [evidence("002")],
      appended_at: "2026-07-26T05:00:02.000Z",
    }),
    error => error.code === "ACTIVITY_LEDGER_BROWSER_TENANT_MISMATCH",
  );
});

test("FES 02C runtime retains transport failure for explicit retry", async () => {
  const gateway = remoteGateway({ failPush: true });
  const runtime = createRuntime({ gateway });
  const event = canonical.createCanonicalActivityEvent(eventInput());
  await runtime.appendCanonicalEvent({
    canonical_event: event,
    evidence_references: [evidence()],
    appended_at: "2026-07-26T05:00:02.000Z",
  });
  const failed = await runtime.syncOnce();
  assert.equal(failed.push_retries, 1);
  const pending = await runtime.listPendingOutbox();
  assert.equal(pending.length, 1);
  assert.equal(pending[0].state, "RETRY");
  assert.equal(pending[0].attempt_count, 1);
  gateway.setFailPush(false);
  const recovered = await runtime.syncOnce();
  assert.equal(recovered.push_acknowledged, 1);
  assert.equal((await runtime.listPendingOutbox()).length, 0);
});

test("FES 02C runtime routes remote conflict to human review", async () => {
  const gateway = remoteGateway({ conflict: true });
  const runtime = createRuntime({ gateway });
  const event = canonical.createCanonicalActivityEvent(eventInput());
  await runtime.appendCanonicalEvent({
    canonical_event: event,
    evidence_references: [evidence()],
    appended_at: "2026-07-26T05:00:02.000Z",
  });
  const summary = await runtime.syncOnce();
  assert.equal(summary.push_conflicts, 1);
  assert.equal((await runtime.listConflicts()).length, 1);
  assert.equal((await runtime.listPendingOutbox()).length, 0);
});

test("FES 02C runtime applies a remote event to a second local replica", async () => {
  const gateway = remoteGateway();
  const first = createRuntime({ gateway });
  const event = canonical.createCanonicalActivityEvent(eventInput());
  await first.appendCanonicalEvent({
    canonical_event: event,
    evidence_references: [evidence()],
    appended_at: "2026-07-26T05:00:02.000Z",
  });
  await first.syncOnce();

  const second = createRuntime({
    gateway,
    store: localStoreModule.create({
      driver: localStoreModule.createMemoryDriver(),
      clock: () => "2026-07-26T05:00:02.000Z",
    }),
  });
  const summary = await second.syncOnce();
  assert.equal(summary.pull_applied, 1);
  assert.equal((await second.listEntries())[0].event_id, event.event_id);
});

test("FES 02C runtime can resolve authenticated Forge Alive bootstrap", async () => {
  const selectedGateway = remoteGateway();
  const selectedStore = localStoreModule.create({
    driver: localStoreModule.createMemoryDriver(),
    clock: () => "2026-07-26T05:00:02.000Z",
  });
  const client = {
    auth: {
      async getUser() {
        return {
          data: { user: { id: "tenant-runtime-001" } },
          error: null,
        };
      },
    },
  };
  const runtime = await runtimeModule.createFromForgeAlive({
    bootstrap: { async getClient() { return client; } },
    device_id: "device-runtime-test",
    store: selectedStore,
    gateway: selectedGateway,
    clock: () => "2026-07-26T05:00:02.000Z",
  });
  assert.equal(runtime.tenant_id, "tenant-runtime-001");
});

test("FES 02C runtime close is idempotent and blocks later work", async () => {
  const runtime = createRuntime();
  await runtime.close();
  await runtime.close();
  await assert.rejects(
    runtime.listEntries(),
    error => error.code === "ACTIVITY_LEDGER_BROWSER_RUNTIME_CLOSED",
  );
});
