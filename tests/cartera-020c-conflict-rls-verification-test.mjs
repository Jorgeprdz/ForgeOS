import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const sql = readFileSync(
  new URL("../supabase/migrations/20260731000231_cartera020c_confirmation_orchestration_guards_rls.sql", import.meta.url),
  "utf8",
);

test("conflict receipts remain owner-scoped under forced RLS", () => {
  assert.match(sql, /alter table public\.cartera020c_confirmation_conflicts enable row level security/);
  assert.match(sql, /alter table public\.cartera020c_confirmation_conflicts force row level security/);
  assert.match(
    sql,
    /create policy cartera020c_conflicts_select_own[\s\S]*using \(advisor_id = auth\.uid\(\)\)/,
  );
});

test("authenticated clients receive no direct conflict-table authority", () => {
  assert.match(
    sql,
    /revoke all on public\.cartera020c_confirmation_conflicts from public, anon, authenticated/,
  );
  assert.doesNotMatch(
    sql,
    /grant (select|insert|update|delete|all) on public\.cartera020c_confirmation_conflicts to authenticated/i,
  );
  assert.doesNotMatch(sql, /service_role|access[_-]?token|database\/query|fetch\(/i);
});
