import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const migrationPath =
  "supabase/migrations/20260726000100_fes02_activity_event_ledger.sql";
const sql = await readFile(migrationPath, "utf8");

function includesAll(...needles) {
  for (const needle of needles) {
    assert.ok(
      sql.includes(needle),
      `Missing migration fragment: ${needle}`,
    );
  }
}

test("FES 02A migration is transaction bounded", () => {
  assert.match(sql, /^begin;\n/);
  assert.match(sql, /\ncommit;\n?$/);
});

test("FES 02A migration declares the canonical ledger authority tables", () => {
  includesAll(
    "create table if not exists public.activity_event_ledger",
    "create table if not exists public.activity_event_evidence_references",
    "create table if not exists public.activity_event_mutations",
    "create table if not exists public.activity_event_conflicts",
  );
});

test("FES 02A migration creates incremental tenant cursors", () => {
  includesAll(
    "create sequence if not exists public.forge_fes02_activity_event_change_seq",
    "activity_event_ledger_tenant_change_idx",
    "change_seq bigint not null",
  );
});

test("FES 02A migration preserves the canonical event envelope", () => {
  includesAll(
    "schema_version = 'forge.activity_event.v1'",
    "canonical_event jsonb not null",
    "canonical_event->>'event_id' = event_id",
    "canonical_event->>'tenant_id' = tenant_id::text",
    "canonical_event->>'idempotency_key' = idempotency_key",
  );
});

test("FES 02A migration blocks learning and execution safety promotion", () => {
  includesAll(
    "activity_event_ledger_learning_disabled_ck",
    "activity_event_ledger_safety_flags_ck",
    "executes_business_action",
    "mutates_external_provider",
    "promotes_ai_output_to_truth",
    "cross_tenant_data",
    "eligible_for_global_learning",
  );
});

test("FES 02A migration enforces append-only ledger history", () => {
  includesAll(
    "forge_fes02_deny_append_only_mutation",
    "forge_fes02_activity_event_ledger_append_only",
    "before update or delete on public.activity_event_ledger",
    "forge_fes02_activity_event_evidence_append_only",
    "before update or delete on public.activity_event_evidence_references",
    "forge_fes02_activity_event_mutations_append_only",
  );
});

test("FES 02A migration enables and forces RLS on every authority table", () => {
  for (const table of [
    "activity_event_ledger",
    "activity_event_evidence_references",
    "activity_event_mutations",
    "activity_event_conflicts",
  ]) {
    includesAll(
      `alter table public.${table} enable row level security`,
      `alter table public.${table} force row level security`,
    );
  }
});

test("FES 02A migration denies direct authenticated and anonymous table access", () => {
  for (const table of [
    "activity_event_ledger",
    "activity_event_evidence_references",
    "activity_event_mutations",
    "activity_event_conflicts",
  ]) {
    includesAll(
      `revoke all on public.${table} from anon, authenticated`,
    );
  }
});

test("FES 02A append RPC is authenticated and tenant-bound", () => {
  includesAll(
    "create or replace function public.forge_fes02_append_activity_event",
    "security definer",
    "v_tenant_id uuid := auth.uid()",
    "FES02_AUTH_REQUIRED",
    "FES02_TENANT_INJECTION_DENIED",
  );
});

test("FES 02A append RPC allowlists mutation and record fields", () => {
  includesAll(
    "v_allowed_mutation_keys text[]",
    "v_allowed_record_keys text[]",
    "FES02_MUTATION_FIELD_DENIED",
    "FES02_LEDGER_RECORD_FIELD_DENIED",
  );
});

test("FES 02A append RPC accepts only append event operations", () => {
  includesAll(
    "if v_operation <> 'APPEND_EVENT'",
    "FES02_OPERATION_INVALID",
    "'forge.activity_ledger_mutation.v1'",
    "'forge.activity_ledger.v1'",
  );
  assert.ok(!sql.includes("'UPDATE_EVENT'"));
  assert.ok(!sql.includes("'DELETE_EVENT'"));
});

test("FES 02A append RPC implements deterministic replay", () => {
  includesAll(
    "select *",
    "from public.activity_event_mutations",
    "where mutation_id = v_mutation_id",
    "return v_existing_mutation.result_payload",
    "'IDEMPOTENT_REPLAY'",
  );
});

test("FES 02A append RPC routes digest disagreement to conflict review", () => {
  includesAll(
    "'REMOTE_EVENT_ID_DIGEST_CONFLICT'",
    "insert into public.activity_event_conflicts",
    "'CONFLICT'",
  );
});

test("FES 02A corrections require an existing same-tenant original event", () => {
  includesAll(
    "FES02_CORRECTION_ORIGINAL_NOT_FOUND",
    "original.tenant_id = v_tenant_id",
    "original.event_id = v_event->>'correction_of'",
    "activity_event_ledger_correction_fk",
  );
});

test("FES 02A pull RPC is incremental and tenant-partitioned", () => {
  includesAll(
    "create or replace function public.forge_fes02_pull_activity_events",
    "where tenant_id = v_tenant_id",
    "and change_seq > v_cursor",
    "'changes'",
    "'cursor'",
    "'has_more'",
  );
});

test("FES 02A exposes only authenticated RPC execution", () => {
  includesAll(
    "revoke all on function public.forge_fes02_append_activity_event(jsonb)",
    "revoke all on function public.forge_fes02_pull_activity_events(text, integer)",
    "grant execute on function public.forge_fes02_append_activity_event(jsonb)",
    "to authenticated",
    "grant execute on function public.forge_fes02_pull_activity_events(text, integer)",
  );
});

test("FES 02A does not mutate the NFAST due-action authority", () => {
  assert.ok(!sql.includes("alter table public.prospect_due_actions"));
  assert.ok(!sql.includes("drop table public.prospect_due_actions"));
  assert.ok(!sql.includes("forge_nfast09_push_due_action_mutation"));
});
