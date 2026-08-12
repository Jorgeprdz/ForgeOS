import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const sql = fs.readFileSync(new URL("../supabase/migrations/20260811000100_fes_sales_nba_advisor_response_subject_017c.sql", import.meta.url), "utf8");

test("017C migration is transaction bounded and only extends the existing subject constraint", () => {
  assert.match(sql, /^begin;/i);
  assert.match(sql, /commit;\s*$/i);
  assert.match(sql, /alter table public\.activity_event_ledger/i);
  assert.match(sql, /'RECOMMENDATION'/);
  assert.doesNotMatch(sql, /create\s+table|create\s+policy|drop\s+policy|disable\s+row\s+level|auth\.|grant\s+/i);
});

test("017C migration preserves every prior FES subject", () => {
  for (const subject of ["PROSPECT", "APPOINTMENT", "ACTIVITY", "DUE_ACTION"]) assert.match(sql, new RegExp(`'${subject}'`));
});
