import assert from "node:assert/strict";
import { appendFileSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";

const PROJECT_REF = "rmlxigxysujsuwzgoimv";
const VERSION = "20260803000001";
const NAME = "cartera010b_atomic_policy_entry_wrapper";
const FILE = `supabase/migrations/${VERSION}_${NAME}.sql`;
const ENDPOINT = `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`;
const OUT = "artifacts/beta1-022a/migration-ledger.jsonl";
assert.equal(process.env.SUPABASE_PROJECT_REF, PROJECT_REF);
assert.ok(process.env.SUPABASE_ACCESS_TOKEN, "SUPABASE_ACCESS_TOKEN_MISSING");
mkdirSync("artifacts/beta1-022a", { recursive: true });
writeFileSync(OUT, "");
const record = (name, status, metadata = {}) => appendFileSync(OUT, `${JSON.stringify({ at: new Date().toISOString(), name, status, ...metadata })}\n`);

async function query(sql) {
  const response = await fetch(ENDPOINT, {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.SUPABASE_ACCESS_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ query: sql }),
  });
  const text = await response.text();
  if (!response.ok) throw new Error(`DATABASE_QUERY_HTTP_${response.status}`);
  const body = JSON.parse(text);
  if (body?.error) throw new Error("DATABASE_QUERY_REJECTED");
  return Array.isArray(body?.result) ? body.result : Array.isArray(body) ? body : [];
}

const installed = (await query(`select to_regprocedure('public.forge_cartera010b_confirm_identity_and_policy(jsonb,jsonb)') is not null as ready`))[0]?.ready === true;
if (!installed) {
  const sql = readFileSync(FILE, "utf8");
  assert.match(sql, /begin;[\s\S]*commit;/i);
  assert.doesNotMatch(sql, /drop\s+table|truncate|delete\s+from|alter\s+table/i);
  await query(sql);
  record("atomic_wrapper_migration", "PASS", { applied: true, version: VERSION });
} else record("atomic_wrapper_migration", "PASS", { applied: false, version: VERSION });

const ready = (await query(`select to_regprocedure('public.forge_cartera010b_confirm_identity_and_policy(jsonb,jsonb)') is not null as ready`))[0];
assert.equal(ready?.ready, true, "ATOMIC_WRAPPER_NOT_INSTALLED");
await query(`insert into supabase_migrations.schema_migrations (version, name, statements)
values ('${VERSION}', '${NAME}', array['Applied by BETA1_022A controlled acceptance']::text[])
on conflict (version) do nothing`);
record("migration_history", "PASS", { version: VERSION });
console.log("BETA1_022A_ATOMIC_MIGRATION=PASS");
