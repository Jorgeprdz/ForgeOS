import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = path => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("manual and reviewed file entry uses one atomic canonical transaction", async () => {
  const [migration, intake] = await Promise.all([
    read("supabase/migrations/20260803000001_cartera010b_atomic_policy_entry_wrapper.sql"),
    read("docs/static-preview/forge-alive-material3/cartera-document-intake.js"),
  ]);
  assert.match(migration, /forge_cartera010b_confirm_identity_resolution\(p_identity_command\)/);
  assert.match(migration, /forge_cartera010b_confirm_policy_with_parties\(p_policy_command\)/);
  assert.match(migration, /CARTERA010B_ATOMIC_POLICY_READ_AFTER_WRITE_FAILED/);
  assert.match(migration, /CARTERA010B_ATOMIC_VERSION_READ_AFTER_WRITE_FAILED/);
  assert.match(migration, /CARTERA010B_ATOMIC_EVIDENCE_READ_AFTER_WRITE_FAILED/);
  assert.match(migration, /CARTERA010B_ATOMIC_ROLE_READ_AFTER_WRITE_FAILED/);
  assert.match(migration, /pg_advisory_xact_lock/);
  assert.match(migration, /grant execute[\s\S]*to authenticated/);
  assert.doesNotMatch(migration, /create table|alter table|drop table|delete from|truncate/i);
  assert.match(intake, /forge_cartera010b_confirm_identity_and_policy/);
  assert.match(intake, /readAfterWriteVerified !== true/);
  assert.match(intake, /CONFLICT · La identidad o la póliza requiere conciliación\. No se guardó un resultado parcial\./);
  assert.match(intake, /reintentar es seguro y no crea duplicados/);
  assert.match(intake, /person:cartera:\$\{draft\.draftId\}/);
  assert.match(intake, /policy:cartera:\$\{draft\.draftId\}/);
  assert.match(intake, /policy-role:cartera:\$\{draft\.draftId\}:owner/);
  assert.match(intake, /draft\.operationAt \|\| \(draft\.operationAt = new Date\(\)\.toISOString\(\)\)/);
  assert.doesNotMatch(intake, /person:cartera:\$\{uid\(\)\}|policy:cartera:\$\{uid\(\)\}/);
  assert.doesNotMatch(intake, /client\.rpc\("forge_cartera010b_confirm_identity_resolution"/);
  assert.doesNotMatch(intake, /client\.rpc\("forge_cartera010b_confirm_policy_with_parties"/);
});

test("the local XLSX decoder is bounded and never executes formulas or macros", async () => {
  const [decoder, bulk] = await Promise.all([
    read("docs/static-preview/forge-alive-material3/safe-xlsx-decoder.js"),
    read("docs/static-preview/forge-alive-material3/cartera-policy-bulk-import.js"),
  ]);
  assert.match(decoder, /MAX_FILE_BYTES/);
  assert.match(decoder, /MAX_TOTAL_BYTES/);
  assert.match(decoder, /MAX_ROWS/);
  assert.match(decoder, /MAX_COLUMNS/);
  assert.match(decoder, /MAX_SHEETS/);
  assert.match(decoder, /vbaProject/);
  assert.match(decoder, /externalLinks/);
  assert.match(decoder, /if \(cell\.querySelector\("f"\)\) value = ""/);
  assert.match(decoder, /DecompressionStream\("deflate-raw"\)/);
  assert.doesNotMatch(decoder, /eval\(|new Function|import\(.*https|cdn\./);
  assert.match(bulk, /import \{ readFirstSheetRows \} from "\.\/safe-xlsx-decoder\.js/);
  assert.match(bulk, /sourceSheet: rows\.sourceSheet \|\| null/);
  assert.match(bulk, /sourceRow: offset \+ 2/);
  assert.doesNotMatch(bulk, /cdn\.jsdelivr\.net|https:\/\//);
});
