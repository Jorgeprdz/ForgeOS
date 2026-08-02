import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const PROJECT_REF = "rmlxigxysujsuwzgoimv";
const VERSION = "20260801000611";
const NAME = "crs07_application_policy_lineage_guard_hardening";
const PATH = "supabase/migrations/20260801000611_crs07_application_policy_lineage_guard_hardening.sql";
const ENDPOINT = `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`;

assert.equal(process.env.SUPABASE_PROJECT_REF, PROJECT_REF, "CRS07_GUARD_PROJECT_REF_MISMATCH");
assert.ok(process.env.SUPABASE_ACCESS_TOKEN, "CRS07_GUARD_ACCESS_TOKEN_MISSING");

const literal = value => `'${String(value).replaceAll("'", "''")}'`;
const redact = value => String(value || "")
  .replace(/eyJ[A-Za-z0-9._-]+/g, "[REDACTED]")
  .replace(/[A-Za-z0-9_-]{40,}/g, "[REDACTED]")
  .slice(0, 900);

async function query(sql) {
  const response = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.SUPABASE_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query: sql }),
  });
  const text = await response.text();
  let body;
  try { body = JSON.parse(text); } catch { body = { message: "NON_JSON_RESPONSE" }; }
  if (!response.ok || body?.error) {
    throw new Error(`CRS07_GUARD_DEPLOY_HTTP_${response.status}:${redact(body?.message || body?.error || text)}`);
  }
  return Array.isArray(body?.result) ? body.result : Array.isArray(body) ? body : [];
}

const state = (await query(`
select exists (
  select 1 from supabase_migrations.schema_migrations where version=${literal(VERSION)}
) as recorded
`))[0];

if (state?.recorded !== true) {
  const sql = readFileSync(PATH, "utf8");
  assert.match(sql, /begin;[\s\S]*commit;/i, "CRS07_GUARD_TRANSACTION_REQUIRED");
  assert.match(sql, /is\s+distinct\s+from\s+'on'/i, "CRS07_GUARD_NULL_SAFE_CHECK_REQUIRED");
  assert.doesNotMatch(sql, /\b(?:drop\s+table|truncate\s+table)\b/i, "CRS07_GUARD_DESTRUCTIVE_SQL_REJECTED");
  await query(sql);

  const shape = (await query(`
select
  exists(select 1 from information_schema.columns where table_schema='supabase_migrations' and table_name='schema_migrations' and column_name='name') as has_name,
  exists(select 1 from information_schema.columns where table_schema='supabase_migrations' and table_name='schema_migrations' and column_name='statements') as has_statements
`))[0];
  const columns = ["version"];
  const values = [literal(VERSION)];
  if (shape?.has_name) {
    columns.push("name");
    values.push(literal(NAME));
  }
  if (shape?.has_statements) {
    columns.push("statements");
    values.push(`array[${literal("Applied by authorized CRS 07 guard-hardening gate")}]::text[]`);
  }
  await query(`
insert into supabase_migrations.schema_migrations (${columns.join(",")})
values (${values.join(",")}) on conflict (version) do nothing
`);
}

const confirmation = (await query(`
select
  exists(select 1 from supabase_migrations.schema_migrations where version=${literal(VERSION)}) as history_recorded,
  position(
    'is distinct from ''on''' in lower(pg_get_functiondef(to_regprocedure('public.forge_crs07_application_policy_lineage_insert_guard()')))
  ) > 0 as null_safe_guard,
  not has_function_privilege('authenticated',to_regprocedure('public.forge_crs07_application_policy_lineage_insert_guard()'),'EXECUTE') as authenticated_blocked,
  not has_function_privilege('anon',to_regprocedure('public.forge_crs07_application_policy_lineage_insert_guard()'),'EXECUTE') as anon_blocked
`))[0];

assert.equal(confirmation?.history_recorded, true, "CRS07_GUARD_HISTORY_MISSING");
assert.equal(confirmation?.null_safe_guard, true, "CRS07_GUARD_NOT_NULL_SAFE");
assert.equal(confirmation?.authenticated_blocked, true, "CRS07_GUARD_AUTHENTICATED_EXECUTE_PRESENT");
assert.equal(confirmation?.anon_blocked, true, "CRS07_GUARD_ANON_EXECUTE_PRESENT");

console.log("CRS_07_GUARD_HARDENING_DEPLOYMENT=PASS");
console.log(`CRS_07_GUARD_HARDENING_MIGRATION=${VERSION}`);
console.log("CRS_07_GOVERNED_CONTEXT_NULL_SAFE=YES");
