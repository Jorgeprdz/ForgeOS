import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const path = new URL("../../../supabase/migrations/20260730000200_qpd05_printable_quote_versions.sql", import.meta.url);
const sql = readFileSync(path, "utf8");
const pass = (number, message) => console.log(`PASS ${number} - ${message}`);

assert.match(sql, /QPD05_CARTERA001B_REQUIRED/);
assert.match(sql, /references public\.quote_lifecycle_quotes\(advisor_id, id\)/);
assert.match(sql, /references public\.quote_lifecycle_versions\(advisor_id, id\)/);
assert.doesNotMatch(sql, /create table if not exists public\.quote_lifecycle_quotes/);
assert.doesNotMatch(sql, /create table if not exists public\.quote_lifecycle_versions/);
pass(1, "migration depends on Cartera 001B and does not duplicate Quote identity");

assert.match(sql, /create table if not exists public\.quote_printable_document_versions/);
assert.match(sql, /printable_version_reference text not null/);
assert.match(sql, /record_payload jsonb not null/);
assert.match(sql, /unique \(\s*advisor_id,\s*printable_version_reference\s*\)/s);
pass(2, "printable document versions have durable owner-scoped identity");

assert.match(sql, /before update or delete on public\.quote_printable_document_versions/);
assert.match(sql, /QPD05_APPEND_ONLY_MUTATION_DENIED/);
assert.doesNotMatch(sql, /on delete cascade/i);
pass(3, "versions are append-only and cannot cascade away");

assert.match(sql, /enable row level security/);
assert.match(sql, /force row level security/);
assert.match(sql, /using \(advisor_id = auth\.uid\(\)\)/);
assert.match(sql, /revoke all on public\.quote_printable_document_versions from anon, authenticated/);
assert.doesNotMatch(sql, /grant insert|grant update|grant delete/i);
pass(4, "forced owner RLS and no direct mutation grants are present");

assert.match(sql, /security definer/);
assert.match(sql, /actor_id uuid := auth\.uid\(\)/);
assert.match(sql, /forge_qpd05_append_printable_quote_version/);
assert.match(sql, /grant execute on function public\.forge_qpd05_append_printable_quote_version/);
pass(5, "authenticated RPC is the only write path");

assert.match(sql, /forge_cartera001b_json_has_forbidden_key\(p_record\)/);
assert.match(sql, /rawPdf\|pdfBytes\|arrayBuffer\|base64\|binary\|blob\|bytes\|dataUrl\|html/);
assert.match(sql, /record_payload::text !~\*/);
pass(6, "raw PDF, HTML and binary-shaped fields are rejected");

assert.match(sql, /payload_identity->>'quoteReference' <> quote_row\.quote_reference/);
assert.match(sql, /payload_identity->>'quoteVersionReference' <> version_row\.quote_version_reference/);
assert.match(sql, /payload_identity->>'quoteSnapshotDigest' <> version_row\.snapshot_digest/);
pass(7, "persisted document identity must match the canonical Quote version");

assert.match(sql, /idempotency_key = p_idempotency_key/);
assert.match(sql, /existing_row\.record_payload <> p_record/);
assert.match(sql, /QPD05_RECORD_CONFLICT/);
pass(8, "idempotent replay and conflicting payload rejection are explicit");

assert.match(sql, /with \(security_invoker = true\)/);
assert.match(sql, /where advisor_id = auth\.uid\(\)\)/);
assert.match(sql, /quote_printable_document_history/);
pass(9, "cross-device history view preserves caller RLS");

assert.doesNotMatch(sql, /pg_net|http_post|storage\.objects|net\.http/i);
assert.doesNotMatch(sql, /insert into public\.(tasks|messages|calendar_events|policies|applications)/i);
pass(10, "migration performs no provider, messaging, calendar, policy or application effects");

console.log("STATUS=PASS_QPD05_MIGRATION_SECURITY");
console.log("Quote Printable Migration Security PASS 10/10");
