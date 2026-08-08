import test from "node:test";
import assert from "node:assert/strict";
import { createIncomeAdapter } from "../docs/static-preview/forge-aura/income/income-adapter-pages-v1.mjs";

const digest = "a".repeat(64);

function payload(advisorReference = "advisor-a") {
  const snapshot = {
    contractVersion: "ADVISOR_COMPENSATION_PERIOD_SNAPSHOT_001",
    snapshotDigest: digest,
    advisorReference,
    periodKey: "2026-08",
    currency: "MXN",
    status: "READY",
    amounts: {},
  };
  const history = {
    contractVersion: "ADVISOR_COMPENSATION_HISTORY_SERIES_001",
    seriesDigest: digest,
    advisorReference,
    points: [{ periodKey: "2026-08" }],
  };
  return { snapshot, history, sourceState: "READY" };
}

test("adapter passes only the existing read-only compensation RPC", async () => {
  const calls = [];
  const client = {
    async rpc(name, args) {
      calls.push({ name, args });
      return { data: payload("advisor-a"), error: null };
    },
  };
  const adapter = createIncomeAdapter({ client, user: { id: "advisor-a" } });
  const model = await adapter.load({ periodKey: "2026-08", periodKeys: ["2026-08"] });
  assert.equal(model.state, "READY");
  assert.deepEqual(calls, [{
    name: "forge_advisor_compensation_read_product",
    args: { p_period_key: "2026-08", p_period_keys: ["2026-08"] },
  }]);
  assert.equal(model.safeguards.ownerScopeEnforced, true);
  assert.equal(model.safeguards.uiCalculation, false);
});

test("cross-advisor payload is rejected instead of rendered", async () => {
  const client = { rpc: async () => ({ data: payload("advisor-b"), error: null }) };
  const adapter = createIncomeAdapter({ client, user: { id: "advisor-a" } });
  const model = await adapter.load({ periodKey: "2026-08", periodKeys: ["2026-08"] });
  assert.equal(model.state, "ERROR");
  assert.equal(model.snapshot, null);
  assert.equal(model.history, null);
  assert.equal(model.errorCode, "AURA_INCOME_SNAPSHOT_OWNER_MISMATCH");
});

test("history from a different owner is rejected independently", async () => {
  const data = payload("advisor-a");
  data.history.advisorReference = "advisor-b";
  const client = { rpc: async () => ({ data, error: null }) };
  const adapter = createIncomeAdapter({ client, user: { id: "advisor-a" } });
  const model = await adapter.load({ periodKey: "2026-08", periodKeys: ["2026-08"] });
  assert.equal(model.state, "ERROR");
  assert.equal(model.errorCode, "AURA_INCOME_HISTORY_OWNER_MISMATCH");
});

test("aborted load rejects without exposing a model", async () => {
  const controller = new AbortController();
  controller.abort();
  const client = { rpc: async () => ({ data: payload("advisor-a"), error: null }) };
  const adapter = createIncomeAdapter({ client, user: { id: "advisor-a" } });
  await assert.rejects(
    adapter.load({ periodKey: "2026-08", periodKeys: ["2026-08"], signal: controller.signal }),
    error => error?.name === "AbortError",
  );
});
