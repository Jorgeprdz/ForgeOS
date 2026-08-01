import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const PROJECT_REF = "rmlxigxysujsuwzgoimv";
const MIGRATION_VERSION = "20260801000400";
const MIGRATION_NAME = "smart_widget_monthly_policy_goals";
const MIGRATION_FILE =
  `supabase/migrations/${MIGRATION_VERSION}_${MIGRATION_NAME}.sql`;
const ENDPOINT = `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`;
const REMOTE_ACCOUNT_MUTATION_FORBIDDEN = true;

assert.equal(process.env.SUPABASE_PROJECT_REF, PROJECT_REF, "PROJECT_REF_MISMATCH");
assert.ok(process.env.SUPABASE_ACCESS_TOKEN, "SUPABASE_ACCESS_TOKEN_MISSING");
assert.equal(REMOTE_ACCOUNT_MUTATION_FORBIDDEN, true);

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
    throw new Error(`DATABASE_QUERY_HTTP_${response.status}:${detail}`);
  }
  if (Array.isArray(body?.result)) return body.result;
  if (Array.isArray(body)) return body;
  return [];
}

const probeRows = await query(`
select
  to_regclass('public.advisor_monthly_policy_goals') is not null as table_exists,
  to_regprocedure(
    'public.forge_set_monthly_policy_goal(date,integer,text,text)'
  ) is not null as rpc_exists
`);
const probe = probeRows[0];
assert.ok(probe, "MONTHLY_GOAL_BOOTSTRAP_PROBE_EMPTY");

if (probe.table_exists && !probe.rpc_exists) {
  throw new Error("PARTIAL_MONTHLY_GOAL_AUTHORITY_REQUIRES_RECONCILIATION");
}

if (!probe.table_exists) {
  const sql = readFileSync(MIGRATION_FILE, "utf8");
  assert.doesNotMatch(
    sql,
    /\b(?:drop\s+table|truncate)\b/i,
    "DESTRUCTIVE_SQL_REJECTED",
  );
  assert.match(sql, /begin;[\s\S]*commit;/i, "TRANSACTION_BOUNDARY_REQUIRED");
  assert.match(sql, /enable row level security/i, "RLS_REQUIRED");
  assert.match(sql, /security definer/i, "GOVERNED_RPC_REQUIRED");
  await query(sql);
  console.log("MONTHLY_GOAL_AUTHORITY_BOOTSTRAP=APPLIED");
} else {
  console.log("MONTHLY_GOAL_AUTHORITY_BOOTSTRAP=ALREADY_PRESENT");
}

const postRows = await query(`
select
  to_regclass('public.advisor_monthly_policy_goals') is not null as table_exists,
  to_regprocedure(
    'public.forge_set_monthly_policy_goal(date,integer,text,text)'
  ) is not null as rpc_exists
`);
assert.equal(postRows[0]?.table_exists, true, "BOOTSTRAP_TABLE_MISSING");
assert.equal(postRows[0]?.rpc_exists, true, "BOOTSTRAP_RPC_MISSING");

await import("./deploy-smart-widget-monthly-goal-migration.mjs");
