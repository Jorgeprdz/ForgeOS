import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  requestStageTransition,
  normalizeRpcProspect,
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

test("runtime loads the RPC authority before the historic acceptance hotfix", async () => {
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

  const rpcImport = app.indexOf("pipeline-stage-rpc-authority.js?v=pipeline-stage-rpc-authority-001");
  const oldHotfixImport = app.indexOf("pipeline-public-acceptance-hotfix.js?v=pipeline-public-acceptance-003");
  assert.ok(rpcImport >= 0);
  assert.ok(oldHotfixImport > rpcImport, "RPC authority must register its capture listener first");

  assert.match(authority, /event\.stopImmediatePropagation\(\)/);
  assert.match(authority, /forge_pipeline_update_prospect_stage/);
  assert.match(authority, /forge:auth-state-changed/);
  assert.match(authority, /PIPELINE_STAGE_RENDER_RECONCILIATION_TIMEOUT/);

  assert.match(migration, /security definer/i);
  assert.match(migration, /actor_id := auth\.uid\(\)/);
  assert.match(migration, /advisor_id = actor_id/);
  assert.match(migration, /archived_at is null/);
  assert.match(migration, /grant execute[\s\S]*to authenticated/i);
});
