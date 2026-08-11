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

test("journal write receipt requires exact server-returned row", () => {
  const expected = { content: "Nota", captureMethod: "text" };
  const created = {
    id: "entry-1",
    prospectId: "prospect-1",
    advisorId: "advisor-1",
    content: "Nota",
    captureMethod: "text",
    source: "PIPELINE_CONTEXT",
  };
  assert.equal(service.assertWriteReceipt({
    created,
    expected,
    prospectId: "prospect-1",
    advisorId: "advisor-1",
  }), created);
  assert.throws(
    () => service.assertWriteReceipt({
      created: { ...created, content: "Otra" },
      expected,
      prospectId: "prospect-1",
      advisorId: "advisor-1",
    }),
    error => error.code === "PROSPECT_JOURNAL_WRITE_RECEIPT_MISMATCH",
  );
});

test("journal persistence confirmation can independently verify exact read-after-write", () => {
  const created = { id: "entry-1", prospectId: "prospect-1" };
  const expected = { content: "Nota", captureMethod: "text" };
  const confirmed = { ...created, ...expected };
  assert.equal(service.assertConfirmedEntry({ created, confirmed, expected }), confirmed);
  assert.throws(
    () => service.assertConfirmedEntry({ created, confirmed: { ...confirmed, content: "Vieja" }, expected }),
    error => error.code === "PROSPECT_JOURNAL_PERSISTENCE_MISMATCH",
  );
});

test("appendEntry does not make a follow-up read part of the write promise", async () => {
  let tableCalls = 0;
  const returnedRow = {
    id: "entry-013",
    advisor_id: "advisor-013",
    prospect_id: "prospect-013",
    content: "Nota separada de lectura",
    capture_method: "text",
    source: "PIPELINE_CONTEXT",
    created_by: "advisor-013",
    created_at: "2026-08-10T21:40:00.000Z",
  };
  const insertBuilder = {
    insert(row) {
      assert.equal(row.prospect_id, "prospect-013");
      return this;
    },
    select() { return this; },
    async single() { return { data: returnedRow, error: null }; },
  };
  const client = {
    auth: {
      async getUser() { return { data: { user: { id: "advisor-013" } }, error: null }; },
    },
    from(table) {
      tableCalls += 1;
      assert.equal(table, "prospect_journal_entries");
      return insertBuilder;
    },
  };
  const journal = service.create(client);
  const entry = await journal.appendEntry("prospect-013", {
    content: "Nota separada de lectura",
    captureMethod: "text",
  });
  assert.equal(entry.id, "entry-013");
  assert.equal(tableCalls, 1, "appendEntry must not issue a second table read");
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
