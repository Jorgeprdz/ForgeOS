import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const sql = readFileSync(
  new URL("../scripts/ci/cartera-001b-remote-acceptance.sql", import.meta.url),
  "utf8",
);

test("remote acceptance is transactional and leaves no fixture data", () => {
  assert.match(sql, /^begin;/);
  assert.match(sql, /rollback;\s*$/);
  assert.doesNotMatch(sql, /\bcommit\s*;/i);
});

test("remote acceptance covers tenant isolation and app-role denial", () => {
  assert.match(sql, /CARTERA001B_CROSS_TENANT_QUOTE_LEAK/);
  assert.match(sql, /CARTERA001B_CROSS_TENANT_HISTORY_LEAK/);
  assert.match(sql, /CARTERA001B_ANON_EXECUTION_UNEXPECTED/);
  assert.match(sql, /CARTERA001B_INTERNAL_HELPER_EXECUTION_UNEXPECTED/);
});

test("remote acceptance covers replay, conflict, correction, and append-only behavior", () => {
  assert.match(sql, /CARTERA001B_CONFIRM_REPLAY_INVALID/);
  assert.match(sql, /CARTERA001B_CONFIRM_CONFLICT_MISSING/);
  assert.match(sql, /CARTERA001B_PRESENTATION_REPLAY_INVALID/);
  assert.match(sql, /CARTERA001B_DECISION_CONFLICT_MISSING/);
  assert.match(sql, /CARTERA001B_CORRECTION_INVALID/);
  assert.match(sql, /CARTERA001B_APPEND_ONLY_MUTATION_DENIED/);
});

test("remote acceptance requires Quote authority and minimized timeline payloads", () => {
  assert.match(sql, /timeline_source <> 'QUOTE_AUTHORITY'/);
  assert.match(sql, /PROPOSAL_PRESENTED/);
  assert.match(sql, /DECISION_RECORDED/);
  assert.match(sql, /annualPremium/);
  assert.match(sql, /sumAssured/);
  assert.match(sql, /deductible/);
  assert.match(sql, /coinsurance/);
});

test("remote acceptance keeps Application effects blocked", () => {
  assert.match(sql, /QUOTE_CONVERTED_TO_APPLICATION/);
  assert.match(sql, /CARTERA001B_APPLICATION_AUTHORITY_REQUIRED/);
});

test("remote acceptance emits one explicit PASS marker", () => {
  const markers = sql.match(/PASS CARTERA001B_REMOTE_ACCEPTANCE/g) || [];
  assert.equal(markers.length, 1);
});
