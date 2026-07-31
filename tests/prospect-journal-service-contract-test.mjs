import assert from "node:assert/strict";
import test from "node:test";
import { createRequire } from "node:module";
import { readFile } from "node:fs/promises";

const require = createRequire(import.meta.url);
const service = require("../advisor-os/sales-pipeline/prospect-journal/prospect-journal-service.js");
const migrationPath = new URL("../supabase/migrations/20260731000100_pipeline_prospect_journal.sql", import.meta.url);

test("journal entry validation bounds text and capture origin", () => {
  assert.deepEqual(service.validateEntry({ content: "  Nota  ", captureMethod: "voice" }), {
    content: "Nota",
    captureMethod: "voice",
  });
  assert.equal(service.validateEntry({ content: "Texto", captureMethod: "other" }).captureMethod, "text");
  assert.throws(() => service.validateEntry({ content: "" }), error => error.code === "VALIDATION_ERROR");
  assert.throws(() => service.validateEntry({ content: "x".repeat(4001) }), error => error.code === "VALIDATION_ERROR");
});

test("journal persistence confirmation requires exact read-after-write", () => {
  const created = { id: "entry-1", prospectId: "prospect-1" };
  const expected = { content: "Nota", captureMethod: "text" };
  const confirmed = { ...created, ...expected };
  assert.equal(service.assertConfirmedEntry({ created, confirmed, expected }), confirmed);
  assert.throws(
    () => service.assertConfirmedEntry({ created, confirmed: { ...confirmed, content: "Vieja" }, expected }),
    error => error.code === "PROSPECT_JOURNAL_PERSISTENCE_MISMATCH",
  );
});

test("journal migration is append-only, owner scoped, and timeline linked", async () => {
  const sql = await readFile(migrationPath, "utf8");
  assert.match(sql, /create table if not exists public\.prospect_journal_entries/);
  assert.match(sql, /before update or delete/);
  assert.match(sql, /advisor_id = auth\.uid\(\)/);
  assert.match(sql, /CONVERSATION_RECORDED/);
  assert.match(sql, /JOURNAL:/);
  assert.match(sql, /VOICE_NOTE/);
  assert.match(sql, /TEXT_NOTE/);
  assert.doesNotMatch(sql, /delete from public\.prospect_journal_entries/i);
});
