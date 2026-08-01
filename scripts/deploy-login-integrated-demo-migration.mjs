import assert from "node:assert/strict";
import {
  appendFileSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";

const PROJECT_REF = "rmlxigxysujsuwzgoimv";
const MIGRATION_VERSION = "20260801000500";
const MIGRATION_NAME = "login_integrated_demo_tenants";
const MIGRATION_FILE =
  `supabase/migrations/${MIGRATION_VERSION}_${MIGRATION_NAME}.sql`;
const ENDPOINT = `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`;
const EVIDENCE_DIR = "artifacts/login-integrated-demo";
const EVIDENCE_FILE = `${EVIDENCE_DIR}/migration-ledger.jsonl`;

assert.equal(process.env.SUPABASE_PROJECT_REF, PROJECT_REF, "PROJECT_REF_MISMATCH");
assert.ok(process.env.SUPABASE_ACCESS_TOKEN, "SUPABASE_ACCESS_TOKEN_MISSING");

mkdirSync(EVIDENCE_DIR, { recursive: true });
writeFileSync(EVIDENCE_FILE, "");

function record(name, status, metadata = {}) {
  appendFileSync(EVIDENCE_FILE, `${JSON.stringify({
    timestamp: new Date().toISOString(),
    name,
    status,
    ...metadata,
  })}\n`);
}

function redact(value) {
  return String(value || "")
    .replace(/eyJ[A-Za-z0-9._-]+/g, "[REDACTED]")
    .replace(/[A-Za-z0-9_-]{40,}/g, "[REDACTED]")
    .slice(0, 700);
}

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
  try {
    body = JSON.parse(text);
  } catch {
    body = { message: "NON_JSON_RESPONSE" };
  }
  if (!response.ok || body?.error) {
    const detail = redact(body?.message || body?.error || text || "QUERY_REJECTED");
    record("database_query", "FAIL", { httpStatus: response.status, detail });
    throw new Error(`DATABASE_QUERY_HTTP_${response.status}:${detail}`);
  }
  if (Array.isArray(body?.result)) return body.result;
  if (Array.isArray(body)) return body;
  return [];
}

const inventorySql = `
select
  to_regclass('public.forge_demo_advisors') is not null as table_exists,
  to_regprocedure('public.forge_demo_current_session()') is not null as session_rpc_exists,
  to_regprocedure('public.forge_demo_read_only_guard()') is not null as guard_function_exists,
  exists (
    select 1 from pg_class
    where oid = to_regclass('public.forge_demo_advisors')
      and relrowsecurity
      and relforcerowsecurity
  ) as registry_rls_forced,
  coalesce(
    has_function_privilege(
      'authenticated',
      'public.forge_demo_current_session()',
      'EXECUTE'
    ), false
  ) as authenticated_session_rpc,
  not coalesce(
    has_function_privilege(
      'anon',
      'public.forge_demo_current_session()',
      'EXECUTE'
    ), false
  ) as anonymous_session_rpc_blocked,
  not coalesce(
    has_table_privilege(
      'authenticated',
      'public.forge_demo_advisors',
      'SELECT,INSERT,UPDATE,DELETE,TRUNCATE'
    ), false
  ) as authenticated_registry_access_blocked,
  (
    select count(*)::integer
    from pg_trigger
    where tgname = 'forge_demo_read_only_guard'
      and not tgisinternal
      and tgenabled <> 'D'
  ) as guard_trigger_count
`;

function complete(row) {
  return row?.table_exists === true
    && row?.session_rpc_exists === true
    && row?.guard_function_exists === true
    && row?.registry_rls_forced === true
    && row?.authenticated_session_rpc === true
    && row?.anonymous_session_rpc_blocked === true
    && row?.authenticated_registry_access_blocked === true
    && Number(row?.guard_trigger_count || 0) >= 10;
}

const before = (await query(inventorySql))[0];
assert.ok(before, "PREDEPLOYMENT_INVENTORY_EMPTY");

if (before.table_exists && !complete(before)) {
  record("predeployment_inventory", "FAIL", {
    state: "PARTIAL",
    guardTriggerCount: Number(before.guard_trigger_count || 0),
  });
  throw new Error("PARTIAL_DEMO_AUTHORITY_REQUIRES_MANUAL_RECONCILIATION");
}

record("predeployment_inventory", "PASS", {
  state: before.table_exists ? "COMPLETE" : "ABSENT",
  guardTriggerCount: Number(before.guard_trigger_count || 0),
  accountMutation: false,
});

if (!before.table_exists) {
  const sql = readFileSync(MIGRATION_FILE, "utf8");
  assert.match(sql, /begin;[\s\S]*commit;/i, "TRANSACTION_BOUNDARY_REQUIRED");
  assert.doesNotMatch(sql, /\b(?:drop\s+table|truncate)\b/i, "DESTRUCTIVE_SQL_REJECTED");
  assert.match(sql, /forge_demo_current_session/i, "SESSION_CLASSIFIER_REQUIRED");
  assert.match(sql, /forge_demo_read_only_guard/i, "READ_ONLY_GUARD_REQUIRED");
  assert.match(sql, /enable row level security/i, "RLS_REQUIRED");
  await query(sql);
  record("migration_applied", "PASS", { migration: MIGRATION_VERSION });
} else {
  record("migration_already_satisfied", "PASS", { migration: MIGRATION_VERSION });
}

const after = (await query(inventorySql))[0];
assert.ok(after, "POSTDEPLOYMENT_INVENTORY_EMPTY");
assert.equal(complete(after), true, "POSTDEPLOYMENT_AUTHORITY_INCOMPLETE");
record("postdeployment_inventory", "PASS", {
  guardTriggerCount: Number(after.guard_trigger_count || 0),
  registryPrivate: true,
  currentSessionRpc: true,
});

const history = (await query(`
select
  to_regclass('supabase_migrations.schema_migrations') is not null as history_exists,
  exists (
    select 1 from information_schema.columns
    where table_schema = 'supabase_migrations'
      and table_name = 'schema_migrations'
      and column_name = 'name'
  ) as has_name,
  exists (
    select 1 from information_schema.columns
    where table_schema = 'supabase_migrations'
      and table_name = 'schema_migrations'
      and column_name = 'statements'
  ) as has_statements
`))[0];
assert.equal(history?.history_exists, true, "MIGRATION_HISTORY_TABLE_MISSING");

const columns = ["version"];
const values = [`'${MIGRATION_VERSION}'`];
if (history.has_name) {
  columns.push("name");
  values.push(`'${MIGRATION_NAME}'`);
}
if (history.has_statements) {
  columns.push("statements");
  values.push("array['Applied by guarded Forge login-integrated demo deployment']::text[]");
}
await query(`
insert into supabase_migrations.schema_migrations (${columns.join(", ")})
values (${values.join(", ")})
on conflict (version) do nothing
`);
const confirmation = (await query(`
select exists (
  select 1 from supabase_migrations.schema_migrations
  where version = '${MIGRATION_VERSION}'
) as migration_recorded
`))[0];
assert.equal(confirmation?.migration_recorded, true, "MIGRATION_HISTORY_CONFIRMATION_FAILED");
record("migration_history", "PASS", {
  migration: MIGRATION_VERSION,
  historyReset: false,
  historyRepair: false,
});

console.log("LOGIN_INTEGRATED_DEMO_MIGRATION=PASS");
console.log(`DEMO_READ_ONLY_GUARD_TRIGGERS=${Number(after.guard_trigger_count || 0)}`);
