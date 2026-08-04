import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const [source, admin, deploy, migration, verify, workflow] = await Promise.all([
  readFile("scripts/seed-beta1-022a-acceptance-dataset.mjs", "utf8"),
  readFile("supabase/functions/forge-demo-admin/index.ts", "utf8"),
  readFile("scripts/deploy-beta1-022a-migration.mjs", "utf8"),
  readFile("supabase/migrations/20260803000001_cartera010b_atomic_policy_entry_wrapper.sql", "utf8"),
  readFile("scripts/verify-beta1-022a-acceptance.mjs", "utf8"),
  readFile(".github/workflows/beta1-022a-writable-acceptance.yml", "utf8"),
]);

test("BETA1_022A seeder is explicit, bounded, owner-scoped and resumable", () => {
  assert.match(source, /FORGE_BETA1022A_RUN_ID/);
  assert.match(source, /runPhoneToken/);
  assert.match(source, /\^\\d\{8\}_\\d\{6\}\$/);
  assert.match(source, /index <= 100/);
  assert.match(source, /index <= 25/);
  assert.match(source, /forge_demo_current_session/);
  assert.match(source, /readOnly, false/);
  assert.match(source, /forge_cartera010b_confirm_identity_and_policy/);
  assert.match(source, /readAfterWriteVerified/);
  assert.match(source, /NON_PERSONAL_SYNTHETIC_ACCEPTANCE_DATA/);
  assert.match(source, /@example\.invalid/);
  assert.match(source, /\.eq\("advisor_id", user\.id\)/);
  assert.doesNotMatch(source, /service_role|SUPABASE_SERVICE_ROLE_KEY|delete\(|truncate|drop table/i);
});

test("remote runner deploys only the additive wrapper and always reseals A/B", () => {
  assert.match(deploy, /20260803000001/);
  assert.match(deploy, /cartera010b_atomic_policy_entry_wrapper/);
  assert.doesNotMatch(migration, /drop\s+table|truncate|delete\s+from|alter\s+table/i);
  assert.match(workflow, /workflow_dispatch:/);
  assert.match(workflow, /push:[\s\S]*audit\/beta1-020-productive-workspaces/);
  assert.match(workflow, /Seed through authenticated A\/B product authorities/);
  assert.match(workflow, /Seal A\/B regardless of prior result[\s\S]*if: always\(\)/);
  assert.match(verify, /sealedMutationBlocked/);
  assert.match(verify, /ACannotReadB/);
  assert.match(verify, /BCannotReadA/);
});

test("controlled A/B window preserves synthetic classification and is resealed", () => {
  assert.match(admin, /action === "PREPARE"[\s\S]*data_class: "SYNTHETIC"[\s\S]*read_only: false/);
  assert.match(admin, /action === "SEAL"[\s\S]*data_class: "SYNTHETIC"[\s\S]*read_only: true/);
  assert.doesNotMatch(admin, /action === "PREPARE"[\s\S]{0,300}\.delete\(\)/);
});

test("economic and unratified book gaps remain explicit", () => {
  assert.match(source, /CONTACT_BOOKS_STAGE_0_NOT_RATIFIED/);
  assert.match(source, /PRODUCTIVE_AUTHORITY_IS_READ_ONLY_AND_REQUIRES_ECONOMIC_EVIDENCE/);
  assert.doesNotMatch(source, /advisor_compensation_.*\.insert|commissionRate|rate\s*:/i);
});
