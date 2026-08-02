import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const pgcryptoPrepare = readFileSync(
  "supabase/migrations/20260801000598_crs06_pgcrypto_digest_compatibility.sql",
  "utf8",
);
const dependency = readFileSync(
  "supabase/migrations/20260801000599_crs06_application_dependency_compatibility.sql",
  "utf8",
);
const integrity = readFileSync(
  "supabase/migrations/20260801000601_crs06_application_integrity_grant_hardening.sql",
  "utf8",
);
const lifecycle = readFileSync(
  "supabase/migrations/20260801000602_crs06_application_rpc_lifecycle_hardening.sql",
  "utf8",
);
const pgcryptoRetire = readFileSync(
  "supabase/migrations/20260801000603_crs06_pgcrypto_digest_schema_hardening.sql",
  "utf8",
);
const compatibilityRunner = readFileSync(
  "scripts/ci/crs-06e-pgcrypto-compatibility-deploy.mjs",
  "utf8",
);
const runner = readFileSync(
  "scripts/ci/crs-06e-remote-application-authority.mjs",
  "utf8",
);

test("temporary digest compatibility is private and bounded", () => {
  assert.match(pgcryptoPrepare, /create or replace function public\.digest\(p_data bytea, p_algorithm text\)/);
  assert.match(pgcryptoPrepare, /extensions\.digest/);
  assert.match(pgcryptoPrepare, /revoke all on function public\.digest\(bytea, text\)/);
  assert.doesNotMatch(pgcryptoPrepare, /grant execute/);
});

test("digest compatibility is retired after durable rebinding", () => {
  assert.match(pgcryptoRetire, /create or replace function public\.forge_crs06_event_digest/);
  assert.match(pgcryptoRetire, /extensions\.digest/);
  assert.match(pgcryptoRetire, /drop function if exists public\.digest\(bytea, text\)/);
  assert.match(pgcryptoRetire, /revoke execute on function public\.forge_crs06_event_digest/);
});

test("compatibility deployer validates schema, history and wrapper retirement", () => {
  assert.match(compatibilityRunner, /CRS06E_PGCRYPTO_EXTENSIONS_SCHEMA_REQUIRED/);
  assert.match(compatibilityRunner, /CRS_06E_PGCRYPTO_COMPATIBILITY_PREPARED=PASS/);
  assert.match(compatibilityRunner, /CRS_06E_PGCRYPTO_COMPATIBILITY_RETIRED=PASS/);
  assert.match(compatibilityRunner, /public_digest_wrapper/);
  assert.match(compatibilityRunner, /application_digest_bound_to_extensions/);
});

test("dependency migration aligns the owner-first CommercialPerson key", () => {
  assert.match(dependency, /create unique index if not exists commercial_people_owner_id_uq/);
  assert.match(dependency, /commercial_people\(advisor_id, id\)/);
  assert.doesNotMatch(dependency, /drop\s+table|truncate/i);
});

test("integrity hardening stores full command digests", () => {
  assert.match(integrity, /application_events[\s\S]*command_digest/);
  assert.match(integrity, /application_signature_evidence[\s\S]*command_digest/);
  assert.match(integrity, /alter column command_digest set not null/);
});

test("anonymous and PUBLIC RPC execution is revoked", () => {
  assert.ok((integrity.match(/from public, anon/g) || []).length >= 6);
  assert.ok((integrity.match(/to authenticated/g) || []).length >= 6);
});

test("RPC hardening binds replays to complete command digests", () => {
  assert.ok((lifecycle.match(/command_digest := public\.forge_crs06_event_digest/g) || []).length >= 6);
  assert.ok((lifecycle.match(/existing\.command_digest <> command_digest|existing_event\.command_digest <> command_digest/g) || []).length >= 6);
  assert.ok((lifecycle.match(/CRS06_IDEMPOTENCY_CONFLICT/g) || []).length >= 6);
});

test("signature authority is bound to the current Application Version", () => {
  assert.match(lifecycle, /version_number = app\.current_version/);
  assert.match(lifecycle, /CRS06_CURRENT_VERSION_REQUIRED/);
  assert.match(lifecycle, /CRS06_SIGNER_ALREADY_SIGNED/);
  assert.match(lifecycle, /required_signed = required_total/);
});

test("requirements and decisions enforce legal lifecycle transitions", () => {
  assert.match(lifecycle, /CRS06_REQUIREMENT_STATE_TRANSITION_INVALID/);
  assert.match(lifecycle, /CRS06_REQUIREMENT_RESOLUTION_EVIDENCE_REQUIRED/);
  assert.match(lifecycle, /CRS06_APPROVAL_STATE_INVALID/);
  assert.match(lifecycle, /CRS06_UNRESOLVED_REQUIREMENTS_BLOCK_APPROVAL/);
});

test("Policy creation remains outside the Application authority", () => {
  assert.doesNotMatch(lifecycle, /insert into public\.canonical_policies/i);
  assert.doesNotMatch(lifecycle, /update public\.canonical_policies/i);
  assert.match(lifecycle, /'policyCreated',false/);
  assert.match(lifecycle, /'issuanceEvidenceRequiredForPolicy',true/);
});

test("remote runner uses the guarded Supabase Management API", () => {
  assert.match(runner, /api\.supabase\.com\/v1\/projects/);
  assert.match(runner, /SUPABASE_ACCESS_TOKEN/);
  assert.match(runner, /SUPABASE_PROJECT_REF/);
  assert.match(runner, /rmlxigxysujsuwzgoimv/);
  assert.doesNotMatch(runner, /SERVICE_ROLE_KEY|DATABASE_PASSWORD|postgres:\/\//);
});

test("remote runner proves rollback-clean lifecycle acceptance", () => {
  for (const marker of [
    "CRS_06E_REMOTE_SUPABASE_DEPLOYMENT=PASS",
    "CRS_06E_REMOTE_RLS_ACCEPTANCE=PASS",
    "CRS_06E_REMOTE_RPC_ACCEPTANCE=PASS",
    "CRS_06E_CHANGED_INPUT_CONFLICT=PASS",
    "CRS_06E_CROSS_ADVISOR_ISOLATION=PASS",
    "CRS_06E_POLICY_BOUNDARY=PASS",
    "TEST_FIXTURES_ROLLED_BACK=YES",
    "RESIDUAL_FIXTURES=0",
  ]) {
    assert.match(runner, new RegExp(marker));
  }
  assert.match(runner, /begin;[\s\S]*rollback;/i);
});
