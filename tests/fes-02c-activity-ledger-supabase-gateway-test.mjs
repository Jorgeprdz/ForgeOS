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
const gatewayModule = require(
  "../platform/event-evidence/activity-ledger-supabase-gateway.js",
);

function eventInput(tenantId = "tenant-gateway-001", suffix = "001") {
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
    occurred_at: "2026-07-26T04:00:00.000Z",
    recorded_at: "2026-07-26T04:00:01.000Z",
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
      source_system: "fes02c-test",
      source_record_id: `record-${suffix}`,
      captured_via: "FORGE_SYSTEM",
      evidence_references: [`evidence-${suffix}`],
    },
    confirmation_state: "CONFIRMED",
    correction_of: null,
    safety_flags: { ...canonical.DEFAULT_SAFETY_FLAGS },
  };
}

function fixture(tenantId = "tenant-gateway-001", suffix = "001") {
  const event = canonical.createCanonicalActivityEvent(
    eventInput(tenantId, suffix),
  );
  const record = ledger.createLedgerRecord({
    canonical_event: event,
    evidence_references: [
      {
        reference_id: `evidence-${suffix}`,
        reference_type: "SYSTEM_OBSERVATION",
        source_system: "fes02c-test",
        captured_at: "2026-07-26T04:00:01.000Z",
        privacy_class: "PRIVATE",
        checksum: `checksum-${suffix}`,
        metadata: { observation_code: "CONTROLLED_GATEWAY_TEST" },
      },
    ],
    appended_at: "2026-07-26T04:00:02.000Z",
  });
  const mutation = ledger.createAppendMutation({
    ledger_record: record,
    device_id: "device-gateway-test",
    created_at: "2026-07-26T04:00:02.000Z",
  });
  return { event, record, mutation };
}

function receiptFor(mutation, status = "ACKNOWLEDGED", sequence = 1) {
  return ledger.createReceipt({
    status,
    tenant_id: mutation.tenant_id,
    event_id: mutation.event_id,
    mutation_id: mutation.mutation_id,
    server_sequence: sequence,
    server_recorded_at: "2026-07-26T04:00:03.000Z",
    cursor: String(sequence),
  });
}

function client({
  userId = "tenant-gateway-001",
  authError = null,
  rpcHandler = async () => ({ data: null, error: null }),
} = {}) {
  const calls = [];
  return {
    calls,
    auth: {
      async getUser() {
        calls.push({ type: "auth" });
        if (authError) return { data: { user: null }, error: authError };
        return { data: { user: { id: userId } }, error: null };
      },
    },
    async rpc(name, args) {
      calls.push({ type: "rpc", name, args });
      return rpcHandler(name, args);
    },
  };
}

test("FES 02C gateway exposes a locked RPC-only diagnostic contract", () => {
  const selected = client();
  const gateway = gatewayModule.create(selected);
  const diagnostics = gateway.diagnostics();
  assert.equal(diagnostics.gateway_version, "FES-02C.1");
  assert.equal(diagnostics.rpc_only, true);
  assert.equal(diagnostics.direct_table_access, false);
  assert.equal(diagnostics.background_sync, false);
  assert.equal(diagnostics.productive_ui_binding, false);
  assert.equal(diagnostics.provider_mutation_allowed, false);
  assert.ok(Object.isFrozen(diagnostics));
});

test("FES 02C gateway requires authenticated Supabase client methods", () => {
  assert.throws(
    () => gatewayModule.create({ rpc() {} }),
    error => error.code === "SUPABASE_CLIENT_INVALID",
  );
});

test("FES 02C gateway pushes only the canonical append mutation RPC", async () => {
  const { mutation } = fixture();
  const selected = client({
    rpcHandler: async (name, args) => ({
      data: {
        status: "ACKNOWLEDGED",
        receipt: receiptFor(args.p_mutation),
      },
      error: null,
    }),
  });
  const gateway = gatewayModule.create(selected);
  const result = await gateway.pushMutation(mutation);
  assert.equal(result.status, "ACKNOWLEDGED");
  assert.equal(result.receipt.mutation_id, mutation.mutation_id);
  assert.equal(selected.calls[0].type, "auth");
  assert.equal(selected.calls[1].name, "forge_fes02_append_activity_event");
  assert.deepEqual(selected.calls[1].args.p_mutation, mutation);
});

test("FES 02C gateway accepts deterministic idempotent replay receipts", async () => {
  const { mutation } = fixture();
  const selected = client({
    rpcHandler: async (_name, args) => ({
      data: {
        status: "IDEMPOTENT_REPLAY",
        receipt: receiptFor(args.p_mutation, "IDEMPOTENT_REPLAY", 4),
      },
      error: null,
    }),
  });
  const result = await gatewayModule.create(selected).pushMutation(mutation);
  assert.equal(result.status, "IDEMPOTENT_REPLAY");
  assert.equal(result.receipt.cursor, "4");
});

test("FES 02C gateway rejects session and mutation tenant mismatch before RPC", async () => {
  const { mutation } = fixture("tenant-gateway-001");
  const selected = client({ userId: "tenant-gateway-002" });
  await assert.rejects(
    gatewayModule.create(selected).pushMutation(mutation),
    error => error.code === "LEDGER_GATEWAY_TENANT_SESSION_MISMATCH",
  );
  assert.equal(selected.calls.filter(call => call.type === "rpc").length, 0);
});

test("FES 02C gateway rejects mismatched remote receipts", async () => {
  const { mutation } = fixture();
  const wrong = ledger.createReceipt({
    status: "ACKNOWLEDGED",
    tenant_id: mutation.tenant_id,
    event_id: mutation.event_id,
    mutation_id: "fes02-mut-wrong",
    server_sequence: 1,
    server_recorded_at: "2026-07-26T04:00:03.000Z",
    cursor: "1",
  });
  const selected = client({
    rpcHandler: async () => ({
      data: { status: "ACKNOWLEDGED", receipt: wrong },
      error: null,
    }),
  });
  await assert.rejects(
    gatewayModule.create(selected).pushMutation(mutation),
    error => error.code === "LEDGER_GATEWAY_RECEIPT_MISMATCH",
  );
});

test("FES 02C gateway normalizes server conflict review", async () => {
  const { record, mutation } = fixture();
  const selected = client({
    rpcHandler: async () => ({
      data: {
        status: "CONFLICT",
        reason_code: "REMOTE_EVENT_ID_DIGEST_CONFLICT",
        remote_record: record,
        detected_at: "2026-07-26T04:00:04.000Z",
      },
      error: null,
    }),
  });
  const result = await gatewayModule.create(selected).pushMutation(mutation);
  assert.equal(result.status, "CONFLICT");
  assert.equal(result.reason_code, "REMOTE_EVENT_ID_DIGEST_CONFLICT");
  assert.equal(result.remote_record.event_id, mutation.event_id);
});

test("FES 02C gateway rejects cross-tenant remote conflict records", async () => {
  const { mutation } = fixture();
  const { record: otherRecord } = fixture("tenant-gateway-002", "002");
  const selected = client({
    rpcHandler: async () => ({
      data: {
        status: "CONFLICT",
        reason_code: "REMOTE_EVENT_ID_DIGEST_CONFLICT",
        remote_record: otherRecord,
        detected_at: "2026-07-26T04:00:04.000Z",
      },
      error: null,
    }),
  });
  await assert.rejects(
    gatewayModule.create(selected).pushMutation(mutation),
    error => error.code === "LEDGER_GATEWAY_CONFLICT_TENANT_MISMATCH",
  );
});

test("FES 02C gateway pulls bounded tenant-partitioned changes", async () => {
  const { record, mutation } = fixture();
  const receipt = receiptFor(mutation, "ACKNOWLEDGED", 7);
  const selected = client({
    rpcHandler: async (name, args) => {
      assert.equal(name, "forge_fes02_pull_activity_events");
      assert.deepEqual(args, { p_cursor: "4", p_limit: 25 });
      return {
        data: {
          changes: [{ ledger_record: record, receipt }],
          cursor: "7",
          has_more: false,
        },
        error: null,
      };
    },
  });
  const result = await gatewayModule.create(selected).pullChanges({
    tenant_id: mutation.tenant_id,
    cursor: "4",
    limit: 25,
  });
  assert.equal(result.changes.length, 1);
  assert.equal(result.cursor, "7");
  assert.equal(result.has_more, false);
});

test("FES 02C gateway rejects cross-tenant pull changes", async () => {
  const { record, mutation } = fixture("tenant-gateway-002", "002");
  const receipt = receiptFor(mutation);
  const selected = client({ userId: "tenant-gateway-001", rpcHandler: async () => ({
    data: {
      changes: [{ ledger_record: record, receipt }],
      cursor: "1",
      has_more: false,
    },
    error: null,
  }) });
  await assert.rejects(
    gatewayModule.create(selected).pullChanges({
      tenant_id: "tenant-gateway-001",
      cursor: null,
    }),
    error => error.code === "LEDGER_GATEWAY_PULL_TENANT_MISMATCH",
  );
});

test("FES 02C gateway maps expired authentication", async () => {
  const { mutation } = fixture();
  const selected = client({ authError: { code: "PGRST301" } });
  await assert.rejects(
    gatewayModule.create(selected).pushMutation(mutation),
    error => error.code === "AUTH_REQUIRED",
  );
});

test("FES 02C gateway preserves governed remote rejection codes", async () => {
  const { mutation } = fixture();
  const selected = client({
    rpcHandler: async () => ({
      data: null,
      error: {
        code: "22023",
        message: "FES02_CANONICAL_EVENT_SAFETY_DENIED",
      },
    }),
  });
  await assert.rejects(
    gatewayModule.create(selected).pushMutation(mutation),
    error => error.code === "FES02_CANONICAL_EVENT_SAFETY_DENIED",
  );
});

test("FES 02C gateway maps transport failures to retry-safe network error", async () => {
  const { mutation } = fixture();
  const selected = client({
    rpcHandler: async () => ({
      data: null,
      error: { code: "FETCH_ERROR", message: "offline" },
    }),
  });
  await assert.rejects(
    gatewayModule.create(selected).pushMutation(mutation),
    error => error.code === "NETWORK_ERROR",
  );
});

test("FES 02C gateway rejects invalid pull limits before remote access", async () => {
  const selected = client();
  await assert.rejects(
    gatewayModule.create(selected).pullChanges({
      tenant_id: "tenant-gateway-001",
      limit: 501,
    }),
    error => error.code === "LEDGER_GATEWAY_PULL_LIMIT_INVALID",
  );
});

test("FES 02C gateway output is deeply immutable", async () => {
  const { mutation } = fixture();
  const selected = client({
    rpcHandler: async (_name, args) => ({
      data: {
        status: "ACKNOWLEDGED",
        receipt: receiptFor(args.p_mutation),
      },
      error: null,
    }),
  });
  const result = await gatewayModule.create(selected).pushMutation(mutation);
  assert.ok(Object.isFrozen(result));
  assert.ok(Object.isFrozen(result.receipt));
  assert.throws(() => {
    result.receipt.cursor = "99";
  }, TypeError);
});
