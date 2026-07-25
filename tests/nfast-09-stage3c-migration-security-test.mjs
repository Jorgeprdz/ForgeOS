import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const migrationPath = path.resolve(
  dirname,
  "../supabase/migrations/20260725000100_nfast09_due_action_sync_authority.sql",
);
const sql = fs.readFileSync(migrationPath, "utf8");
const normalized = sql.toLowerCase();

test("Stage 3C creates minimized due-action authorities", () => {
  for (const table of [
    "public.prospect_due_actions",
    "public.prospect_due_action_mutations",
    "public.prospect_due_action_conflicts",
  ]) {
    assert.match(
      normalized,
      new RegExp(`create table if not exists ${table.replaceAll(".", "\\.")}`),
    );
  }
  for (const prohibited of [
    "raw_notes",
    "initial_context",
    "phone_normalized",
    "whatsapp_normalized",
    "email_normalized",
    "estimated_income",
    "provider_payload",
    "message_text",
    "auth_token",
  ]) {
    assert.equal(normalized.includes(prohibited), false, prohibited);
  }
});

test("Stage 3C enforces RLS and direct-grant denial", () => {
  for (const table of [
    "prospect_due_actions",
    "prospect_due_action_mutations",
    "prospect_due_action_conflicts",
  ]) {
    assert.match(normalized, new RegExp(`alter table public\\.${table} enable row level security`));
    assert.match(normalized, new RegExp(`alter table public\\.${table} force row level security`));
    assert.match(normalized, new RegExp(`revoke all on public\\.${table} from anon, authenticated`));
  }
});

test("Stage 3C derives advisor from auth uid", () => {
  assert.match(sql, /v_advisor_id uuid := auth\.uid\(\)/);
  assert.match(sql, /NFAST09_ADVISOR_INJECTION_DENIED/);
  assert.match(sql, /advisor_id = v_advisor_id/);
});

test("Stage 3C persists deterministic idempotency", () => {
  assert.match(normalized, /mutation_id text primary key/);
  assert.match(sql, /where mutation_id = v_mutation_id/);
  assert.match(sql, /return v_existing_mutation\.result_payload/);
});

test("Stage 3C preserves conflict candidates", () => {
  assert.match(normalized, /local_candidate jsonb not null/);
  assert.match(normalized, /remote_candidate jsonb not null/);
  assert.match(sql, /CONFLICT_REVIEW_REQUIRED/);
  assert.match(sql, /REMOTE_REVISION_CHANGED/);
});

test("Stage 3C exposes authenticated RPC execution only", () => {
  assert.match(normalized, /revoke all on function public\.forge_nfast09_push_due_action_mutation\(jsonb\)[\s\S]*from public, anon/);
  assert.match(normalized, /grant execute on function public\.forge_nfast09_push_due_action_mutation\(jsonb\)[\s\S]*to authenticated/);
  assert.match(normalized, /grant execute on function public\.forge_nfast09_pull_due_action_changes\(text, integer\)[\s\S]*to authenticated/);
});

test("Stage 3C cursor is incremental and bounded", () => {
  assert.match(normalized, /forge_nfast09_due_action_change_seq/);
  assert.match(normalized, /change_seq > v_cursor/);
  assert.match(normalized, /least\(greatest\(coalesce\(p_limit, 100\), 1\), 500\)/);
  assert.equal(/delete\s+from\s+public\.prospect_due_actions/.test(normalized), false);
});
