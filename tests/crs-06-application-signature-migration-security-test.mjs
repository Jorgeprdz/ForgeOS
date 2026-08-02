import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const migrationPath = resolve(
  process.cwd(),
  "supabase/migrations/20260801000600_crs06_application_signature_authority.sql",
);
const sql = readFileSync(migrationPath, "utf8");

const tables = [
  "commercial_applications",
  "application_versions",
  "application_signers",
  "application_signature_evidence",
  "application_requirements",
  "application_events",
];

const rpcs = [
  "forge_crs06_create_application",
  "forge_crs06_add_application_version",
  "forge_crs06_record_signature_evidence",
  "forge_crs06_submit_application",
  "forge_crs06_record_requirement",
  "forge_crs06_record_decision",
];

test("migration creates the six bounded Application authority tables", () => {
  for (const table of tables) {
    assert.match(sql, new RegExp(`create table if not exists public\\.${table}\\b`, "i"));
  }
});

test("every table has forced RLS and owner-scoped select", () => {
  for (const table of tables) {
    assert.match(sql, new RegExp(`alter table public\\.${table} force row level security`, "i"));
  }
  assert.match(sql, /advisor_id = auth\.uid\(\)/);
});

test("authenticated callers receive select but not direct write grants", () => {
  for (const table of tables) {
    assert.match(sql, new RegExp(`grant select on public\\.${table} to authenticated`, "i"));
    assert.doesNotMatch(sql, new RegExp(`grant (insert|update|delete|all).*public\\.${table}.*authenticated`, "i"));
  }
});

test("versions, signature evidence and events are append-only", () => {
  assert.match(sql, /forge_crs06_versions_append_only/);
  assert.match(sql, /forge_crs06_signature_evidence_append_only/);
  assert.match(sql, /forge_crs06_events_append_only/);
  assert.match(sql, /CRS06_APPEND_ONLY_MUTATION_DENIED/);
});

test("all productive commands are security-definer RPCs", () => {
  for (const rpc of rpcs) {
    assert.match(sql, new RegExp(`create or replace function public\\.${rpc}\\(`, "i"));
  }
  assert.ok((sql.match(/security definer/g) || []).length >= rpcs.length);
});

test("Application creation requires authenticated human confirmation", () => {
  assert.match(sql, /actor_id uuid := auth\.uid\(\)/);
  assert.match(sql, /CRS06_AUTH_REQUIRED/);
  assert.match(sql, /CRS06_HUMAN_CONFIRMATION_REQUIRED/);
});

test("Application creation verifies existing CommercialPerson and Quote authorities", () => {
  assert.match(sql, /from public\.commercial_people/);
  assert.match(sql, /lifecycle_state = 'CONFIRMED'/);
  assert.match(sql, /from public\.quote_lifecycle_quotes/);
  assert.match(sql, /from public\.quote_lifecycle_versions/);
  assert.match(sql, /CRS06_QUOTE_PROSPECT_MISMATCH/);
  assert.match(sql, /CRS06_QUOTE_PRODUCT_MISMATCH/);
});

test("signature evidence stores digest and references, not raw signature payloads", () => {
  assert.match(sql, /document_digest text not null/);
  assert.match(sql, /evidence_references jsonb not null/);
  assert.doesNotMatch(sql, /signature_image|raw_signature|biometric_template|pdf_bytes|provider_payload/i);
});

test("required signer completion gates SIGNED state", () => {
  assert.match(sql, /required = true and signature_state <> 'SIGNED'/);
  assert.match(sql, /APPLICATION_SIGNED/);
  assert.match(sql, /PARTIALLY_SIGNED/);
});

test("submission requires SIGNED Application", () => {
  assert.match(sql, /CRS06_SIGNED_APPLICATION_REQUIRED/);
  assert.match(sql, /APPLICATION_SUBMITTED/);
});

test("approval is blocked while requirements remain open or disputed", () => {
  assert.match(sql, /state in \('OPEN','DISPUTED'\)/);
  assert.match(sql, /CRS06_UNRESOLVED_REQUIREMENTS_BLOCK_APPROVAL/);
});

test("replays are idempotent and changed keys conflict", () => {
  assert.match(sql, /idempotentReplay/);
  assert.ok((sql.match(/CRS06_IDEMPOTENCY_CONFLICT/g) || []).length >= 5);
  assert.match(sql, /application_events_owner_idempotency_uq/);
  assert.match(sql, /application_signature_owner_idempotency_uq/);
});

test("Application lifecycle never creates or mutates Policy", () => {
  assert.doesNotMatch(sql, /insert into public\.polic(?:y|ies)/i);
  assert.doesNotMatch(sql, /update public\.polic(?:y|ies)/i);
  assert.match(sql, /'policyCreated', false/);
  assert.match(sql, /'issuanceEvidenceRequiredForPolicy', true/);
});

test("the migration does not integrate an external signature provider", () => {
  assert.doesNotMatch(sql, /http_request|net\.http|webhook|docusign|adobe_sign|hellosign|dropbox_sign/i);
});

test("the migration remains a repository transaction", () => {
  assert.match(sql, /^-- CRS 06 Application and Signature Authority/m);
  assert.match(sql, /begin;/i);
  assert.match(sql, /commit;/i);
});
