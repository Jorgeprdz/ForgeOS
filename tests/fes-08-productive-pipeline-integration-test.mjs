import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";

const require = createRequire(import.meta.url);
global.location = new URL("https://jorgeprdz.github.io/ForgeOS/static-preview/forge-alive/?nav=pipeline");
const adapter = require("../advisor-os/sales-pipeline/pipeline-nash-combat-adapter.js");
const engine = require("../nash-combat-orchestrator.js");
const actionRuntimeModule = require("../advisor-os/sales-pipeline/productive-pipeline-action-runtime.js");

function fakeDocument({ fail = false } = {}) {
  let iframeRemoved = false;
  let parentPolluted = false;
  const iframeListeners = {};
  const scriptListeners = {};
  const realm = { module: null, exports: null };
  const script = {
    addEventListener(type, listener) { scriptListeners[type] = listener; },
    set src(value) { this._src = value; },
    get src() { return this._src; },
  };
  const realmDocument = {
    createElement(name) {
      assert.equal(name, "script");
      return script;
    },
    head: {
      append(node) {
        assert.equal(node.src, "https://jorgeprdz.github.io/ForgeOS/nash-combat-orchestrator.js");
        assert.equal(node.integrity, adapter.SOURCE_SRI);
        assert.equal(node.crossOrigin, "anonymous");
        if (fail) scriptListeners.error();
        else {
          realm.module.exports = engine;
          scriptListeners.load();
        }
      },
    },
  };
  const iframe = {
    dataset: {},
    contentWindow: realm,
    contentDocument: realmDocument,
    setAttribute() {},
    addEventListener(type, listener) { iframeListeners[type] = listener; },
    remove() { iframeRemoved = true; },
  };
  return {
    body: {
      append(node) {
        assert.equal(node, iframe);
        parentPolluted = Object.hasOwn(global, "runNashCombat");
        iframeListeners.load();
      },
    },
    createElement(name) {
      assert.equal(name, "iframe");
      return iframe;
    },
    state: () => ({ iframeRemoved, parentPolluted }),
  };
}

test("FES 08B pins the unchanged Nash source blob and SRI", async () => {
  const blob = execFileSync("git", ["hash-object", "nash-combat-orchestrator.js"], { encoding: "utf8" }).trim();
  assert.equal(blob, "b836cf8b33cb3a6dbb46eff4c056e38f588d6401");
  assert.equal(adapter.SOURCE_BLOB_SHA, blob);
  assert.equal(adapter.SOURCE_SRI, "sha256-Q9jy8S3ni33kNNfY75sS0bnXGVY2RqIKPt9IVqytB10=");
});

test("FES 08B uses a fixed same-origin source URL", () => {
  assert.equal(adapter.fixedSourceUrl(global.location), "https://jorgeprdz.github.io/ForgeOS/nash-combat-orchestrator.js");
  assert.equal(adapter.SOURCE_PATH, "/ForgeOS/nash-combat-orchestrator.js");
  assert.equal(adapter.fixedSourceUrl.length, 0);
});

test("FES 08B isolates exports and removes its realm", async () => {
  const document = fakeDocument();
  const api = await adapter.captureFromIsolatedRealm({ document });
  assert.equal(typeof api.runNashCombat, "function");
  assert.deepEqual(document.state(), { iframeRemoved: true, parentPolluted: false });
});

test("FES 08B removes a failed realm and returns unavailable", async () => {
  const source = await readFile("advisor-os/sales-pipeline/pipeline-nash-combat-adapter.js", "utf8");
  assert.doesNotMatch(source, /new Function|eval\s*\(|fetch\s*\(|require\s*\(\s*["']\.\.\/\.\.\/\.\.\/nash-combat/);
  assert.doesNotMatch(source, /dinero\|caro|No rechaza la solución|Cambiar de precio/);
});

test("FES 08B returns immutable candidate-only output without raw objection", async () => {
  const output = await adapter.analyzeObjectionForHumanReview({
    objection: "Necesito pensarlo",
    approvedDisplayName: "Ana",
    prospectReference: "prospect-001",
    flowReference: "flow-001",
    requestId: "request-001",
  });
  assert.equal(output.schemaVersion, "forge.pipeline_nash_combat_review_candidate.v1");
  assert.equal(output.candidate.objectionTypeCandidate, "STALL");
  assert.equal(output.authority.candidateOnly, true);
  assert.equal(output.authority.prospectIntentTruth, false);
  assert.equal(output.authority.sendsMessage, false);
  assert.equal(output.authority.changesPipelineStage, false);
  assert.equal(output.authority.writesActivityDirectly, false);
  assert.equal("objection" in output, false);
  assert.equal("personality" in output, false);
  assert.equal(Object.isFrozen(output.candidate), true);
});

test("FES 08 confirmed action follows canonical ledger then Activity RPC", async () => {
  const calls = [];
  global.ForgePassiveCaptureBridgeFES05A = {
    createPassiveCaptureObservation(source) {
      calls.push(["observation", source]);
      return { ...source, evidence_references: source.evidence_references };
    },
  };
  global.ForgeBridgeCanonicalEventAdapterFES05C = {
    createCanonicalEventFromObservation({ observation }) {
      calls.push(["canonical", observation.action_code]);
      return {
        schema_version: "forge.canonical_activity_event.v1",
        event_id: "event-001",
        tenant_id: observation.tenant_id,
        actor: { id: observation.actor_id },
        subject: { type: "CALL", id: observation.payload.call_reference },
        source: { type: observation.source_type },
        occurred_at: observation.occurred_at,
        recorded_at: observation.recorded_at,
        payload: { prospect_reference: observation.prospect_id },
      };
    },
  };
  global.ForgeBrowserActivityCompositionFES08A = {
    create() {
      return {
        async appendEvent({ event }) {
          calls.push(["activity_records_append_v1", event.event_id]);
          return { status: "PROJECTED", inserted: true };
        },
        async list() {
          calls.push(["activity_records_list_v1"]);
          return [{ type: "CONVERSATION_COMPLETED" }];
        },
      };
    },
  };
  const ledger = {
    async appendCanonicalEvent({ canonical_event }) {
      calls.push(["ledger-append", canonical_event.event_id]);
      return { inserted: true };
    },
    async syncOnce() {
      calls.push(["ledger-sync"]);
      return { status: "SYNCED" };
    },
  };
  const client = {
    auth: {
      async getUser() {
        return { data: { user: { id: "advisor-001", app_metadata: { organization_id: "organization-001" } } } };
      },
    },
    rpc() {},
  };
  const runtime = await actionRuntimeModule.create({
    client,
    ledgerRuntime: ledger,
    clock: () => "2026-07-28T20:00:00.000Z",
    performanceRefresh: async () => {
      calls.push(["performance-read"]);
      return { authority: { performancePolicyAuthority: true } };
    },
  });
  const result = await runtime.confirm({
    actionCode: "CALL_CONNECTED_CONFIRMED",
    prospectId: "prospect-001",
    payload: {
      flow_reference: "flow-call-001",
      call_reference: "call-001",
      confirmation_reference: "confirmation-call-001",
    },
  });
  assert.equal(result.activityResult.inserted, true);
  assert.deepEqual(calls.map(item => item[0]), [
    "observation",
    "canonical",
    "ledger-append",
    "ledger-sync",
    "activity_records_append_v1",
    "activity_records_list_v1",
    "performance-read",
  ]);
  assert.equal(runtime.diagnostics().performanceWrite, false);
  assert.equal(runtime.diagnostics().pipelineTransitionMutation, false);
});
