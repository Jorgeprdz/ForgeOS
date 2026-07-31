import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  flushDeferredReconciliation,
  normalizeRpcProspect,
  requestStageTransition,
  scheduleDeferredReconciliation,
} from "../docs/static-preview/forge-alive-material3/pipeline-stage-rpc-authority.js";

test("stage RPC sends only prospect id and approved status and confirms the returned row", async () => {
  const calls = [];
  const client = {
    async rpc(name, args) {
      calls.push({ name, args });
      return {
        data: {
          id: "prospect-1",
          status: "contacted",
          full_name: "Prospecto",
          updated_at: "2026-07-31T15:00:00.000Z",
        },
        error: null,
      };
    },
  };

  const prospect = await requestStageTransition({
    client,
    prospectId: "prospect-1",
    status: "contacted",
  });

  assert.deepEqual(calls, [{
    name: "forge_pipeline_update_prospect_stage",
    args: {
      p_prospect_id: "prospect-1",
      p_status: "contacted",
    },
  }]);
  assert.equal(prospect.id, "prospect-1");
  assert.equal(prospect.status, "contacted");
  assert.equal(prospect.fullName, "Prospecto");
});

test("stage RPC accepts PostgREST composite arrays but rejects stale confirmation", async () => {
  assert.equal(normalizeRpcProspect([{ id: "p", status: "decision" }]).status, "decision");

  await assert.rejects(
    requestStageTransition({
      client: {
        rpc: async () => ({
          data: { id: "prospect-1", status: "referred_new" },
          error: null,
        }),
      },
      prospectId: "prospect-1",
      status: "client",
    }),
    error => error?.code === "PIPELINE_STAGE_RPC_CONFIRMATION_MISMATCH",
  );
});

test("visual diagnostic seam persists through its PostgREST-shaped store without invoking RPC", async () => {
  const previousEnv = globalThis.__ENV__;
  globalThis.__ENV__ = { diagnostic: true };
  const records = [{
    id: "diagnostic-prospect",
    status: "referred_new",
    archived_at: null,
  }];
  let rpcCalls = 0;

  const client = {
    rpc: async () => {
      rpcCalls += 1;
      throw new Error("DIAGNOSTIC_MUST_NOT_INVOKE_RPC");
    },
    from(table) {
      assert.equal(table, "prospects");
      const state = { patch: null, id: null, archivedAt: undefined };
      const builder = {
        update(patch) { state.patch = patch; return builder; },
        eq(column, value) {
          assert.equal(column, "id");
          state.id = value;
          return builder;
        },
        is(column, value) {
          assert.equal(column, "archived_at");
          state.archivedAt = value;
          return builder;
        },
        select() { return builder; },
        async single() {
          const record = records.find(candidate =>
            candidate.id === state.id && candidate.archived_at === state.archivedAt
          );
          Object.assign(record, state.patch);
          return { data: record, error: null };
        },
      };
      return builder;
    },
  };

  try {
    const result = await requestStageTransition({
      client,
      prospectId: "diagnostic-prospect",
      status: "decision",
    });
    assert.equal(result.status, "decision");
    assert.equal(records[0].status, "decision");
    assert.equal(rpcCalls, 0);
  } finally {
    if (previousEnv === undefined) delete globalThis.__ENV__;
    else globalThis.__ENV__ = previousEnv;
  }
});

test("confirmed stages reconcile later instead of emitting an immediate auth refresh", () => {
  const root = {
    ownerDocument: {
      documentElement: { dataset: {} },
    },
  };
  const events = [];
  const windowRef = {
    CustomEvent: class CustomEvent {
      constructor(type, init) {
        this.type = type;
        this.detail = init.detail;
      }
    },
    dispatchEvent(event) {
      events.push(event);
      return true;
    },
  };

  scheduleDeferredReconciliation(root, {
    id: "prospect-1",
    status: "decision",
  });
  assert.equal(
    root.ownerDocument.documentElement.dataset.pipelineStageDeferredReconcile,
    "pending",
  );
  assert.equal(events.length, 0);

  assert.equal(flushDeferredReconciliation({
    root,
    windowRef,
    source: "test-route-exit",
  }), true);
  assert.equal(events.length, 1);
  assert.equal(events[0].type, "forge:auth-state-changed");
  assert.deepEqual(events[0].detail, {
    status: "authenticated",
    source: "test-route-exit",
    prospectId: "prospect-1",
    prospectStatus: "decision",
  });
  assert.equal(
    root.ownerDocument.documentElement.dataset.pipelineStageDeferredReconcile,
    undefined,
  );
});

test("runtime and database authorities close the complete stage transition path", async () => {
  const app = await readFile(
    "docs/static-preview/forge-alive-material3/app.js",
    "utf8",
  );
  const authority = await readFile(
    "docs/static-preview/forge-alive-material3/pipeline-stage-rpc-authority.js",
    "utf8",
  );
  const migration = await readFile(
    "supabase/migrations/20260731000200_pipeline_prospect_stage_rpc.sql",
    "utf8",
  );
  const timelineRepair = await readFile(
    "supabase/migrations/20260731000300_pipeline_stage_timeline_digest_search_path_repair.sql",
    "utf8",
  );
  const deployer = await readFile(
    "scripts/deploy-pipeline-stage-rpc-migration.mjs",
    "utf8",
  );

  const rpcImport = app.indexOf("pipeline-stage-rpc-authority.js?v=pipeline-stage-rpc-authority-002");
  const oldHotfixImport = app.indexOf("pipeline-public-acceptance-hotfix.js?v=pipeline-public-acceptance-003");
  assert.ok(rpcImport >= 0);
  assert.ok(oldHotfixImport > rpcImport, "RPC authority must register its capture listener first");

  const persistStart = authority.indexOf("async function persistStage");
  const persistEnd = authority.indexOf("export function installPipelineStageRpcAuthority");
  const persistSource = authority.slice(persistStart, persistEnd);
  assert.ok(persistStart >= 0 && persistEnd > persistStart);
  assert.match(authority, /event\.stopImmediatePropagation\(\)/);
  assert.match(authority, /forge_pipeline_update_prospect_stage/);
  assert.match(authority, /globalThis\.__ENV__\?\.diagnostic === true/);
  assert.match(authority, /__FORGE_DIAGNOSTIC_AUTHENTICATED__/);
  assert.match(authority, /pipelineStageCommitMode = "in-place"/);
  assert.match(authority, /pipeline-stage-rpc-route-exit/);
  assert.match(authority, /pipeline-stage-rpc-tab-hidden/);
  assert.match(persistSource, /scheduleDeferredReconciliation/);
  assert.match(persistSource, /PIPELINE_STAGE_CARD_IDENTITY_CHANGED/);
  assert.doesNotMatch(persistSource, /forge:auth-state-changed/);

  assert.match(migration, /security definer/i);
  assert.match(migration, /actor_id := auth\.uid\(\)/);
  assert.match(migration, /advisor_id = actor_id/);
  assert.match(migration, /archived_at is null/);
  assert.match(migration, /notify pgrst, 'reload schema'/i);
  assert.match(migration, /grant execute[\s\S]*to authenticated/i);

  assert.match(timelineRepair, /pg_extension[\s\S]*pgcrypto/i);
  assert.match(timelineRepair, /forge_nfast08_capture_pipeline_timeline\(\)/i);
  assert.match(timelineRepair, /forge_nfast08_append_prospect_timeline_event/i);
  assert.match(timelineRepair, /set search_path = public, %I, pg_temp/i);
  assert.doesNotMatch(timelineRepair, /drop\s+table|truncate/i);

  assert.match(deployer, /timeline_digest_repair_applied/);
  assert.match(deployer, /PIPELINE_STAGE_TIMELINE_EVENT_MISSING/);
  assert.match(deployer, /timeline_rollback_preserved/);
  assert.match(deployer, /capture_has_pgcrypto_search_path/);
  assert.match(deployer, /append_has_pgcrypto_search_path/);
});