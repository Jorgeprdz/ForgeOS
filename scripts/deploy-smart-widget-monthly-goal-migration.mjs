import assert from "node:assert/strict";
import {
  appendFileSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";

const PROJECT_REF = "rmlxigxysujsuwzgoimv";
const MIGRATION_VERSION = "20260801000400";
const MIGRATION_NAME = "smart_widget_monthly_policy_goals";
const MIGRATION_FILE =
  `supabase/migrations/${MIGRATION_VERSION}_${MIGRATION_NAME}.sql`;
const EVIDENCE_DIR = "artifacts/smart-widget-monthly-goal-migration";
const EVIDENCE_FILE = `${EVIDENCE_DIR}/ledger.jsonl`;
const ENDPOINT = `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`;
const TEST_YEAR_MONTH = "2199-12-01";
const REMOTE_ACCOUNT_MUTATION_FORBIDDEN = true;
const ROLLBACK_REQUIRED = true;

assert.equal(process.env.SUPABASE_PROJECT_REF, PROJECT_REF, "PROJECT_REF_MISMATCH");
assert.ok(process.env.SUPABASE_ACCESS_TOKEN, "SUPABASE_ACCESS_TOKEN_MISSING");
assert.equal(REMOTE_ACCOUNT_MUTATION_FORBIDDEN, true);
assert.equal(ROLLBACK_REQUIRED, true);

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
    record("database_query", "FAIL", {
      httpStatus: response.status,
      detail,
    });
    throw new Error(`DATABASE_QUERY_HTTP_${response.status}:${detail}`);
  }
  if (Array.isArray(body?.result)) return body.result;
  if (Array.isArray(body)) return body;
  return [];
}

const inventorySql = `
select
  to_regclass('public.advisor_monthly_policy_goals') is not null as table_exists,
  (
    select count(*) = 11
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'advisor_monthly_policy_goals'
      and column_name = any(array[
        'id',
        'advisor_id',
        'year_month',
        'target_policy_count',
        'revision',
        'reason',
        'evidence_reference',
        'effective_from',
        'supersedes_goal_id',
        'created_at',
        'created_by'
      ])
  ) as required_columns_complete,
  exists (
    select 1
    from pg_class
    where oid = to_regclass('public.advisor_monthly_policy_goals')
      and relrowsecurity
  ) as rls_enabled,
  exists (
    select 1
    from pg_constraint
    where conrelid = to_regclass('public.advisor_monthly_policy_goals')
      and conname = 'advisor_monthly_policy_goals_revision_uq'
      and contype = 'u'
  ) as revision_unique,
  exists (
    select 1
    from pg_indexes
    where schemaname = 'public'
      and tablename = 'advisor_monthly_policy_goals'
      and indexname = 'advisor_monthly_policy_goals_current_idx'
  ) as current_index,
  exists (
    select 1
    from pg_trigger
    where tgrelid = to_regclass('public.advisor_monthly_policy_goals')
      and tgname = 'forge_advisor_monthly_policy_goal_append_only_guard'
      and tgenabled <> 'D'
  ) as append_only_trigger,
  to_regprocedure(
    'public.forge_advisor_monthly_policy_goal_append_only_guard()'
  ) is not null as append_only_function,
  to_regprocedure(
    'public.forge_set_monthly_policy_goal(date,integer,text,text)'
  ) is not null as rpc_exists,
  exists (
    select 1
    from pg_proc
    where oid = to_regprocedure(
      'public.forge_set_monthly_policy_goal(date,integer,text,text)'
    )
      and prosecdef
  ) as rpc_security_definer,
  exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'advisor_monthly_policy_goals'
      and policyname = 'advisor_monthly_policy_goals_select_own'
      and cmd = 'SELECT'
      and qual like '%advisor_id = auth.uid()%'
  ) as own_select_policy,
  coalesce(
    has_table_privilege(
      'authenticated',
      'public.advisor_monthly_policy_goals',
      'SELECT'
    ),
    false
  ) as authenticated_select,
  not coalesce(
    has_table_privilege(
      'authenticated',
      'public.advisor_monthly_policy_goals',
      'INSERT,UPDATE,DELETE,TRUNCATE'
    ),
    false
  ) as authenticated_direct_mutation_blocked,
  not coalesce(
    has_table_privilege(
      'anon',
      'public.advisor_monthly_policy_goals',
      'SELECT,INSERT,UPDATE,DELETE,TRUNCATE'
    ),
    false
  ) as anon_table_access_blocked,
  coalesce(
    has_function_privilege(
      'authenticated',
      'public.forge_set_monthly_policy_goal(date,integer,text,text)',
      'EXECUTE'
    ),
    false
  ) as authenticated_rpc_execute,
  not coalesce(
    has_function_privilege(
      'anon',
      'public.forge_set_monthly_policy_goal(date,integer,text,text)',
      'EXECUTE'
    ),
    false
  ) as anon_rpc_execute_blocked,
  not exists (
    select 1
    from information_schema.routine_privileges
    where routine_schema = 'public'
      and routine_name = 'forge_set_monthly_policy_goal'
      and grantee = 'PUBLIC'
      and privilege_type = 'EXECUTE'
  ) as public_rpc_execute_blocked
`;

const requiredChecks = [
  "required_columns_complete",
  "rls_enabled",
  "revision_unique",
  "current_index",
  "append_only_trigger",
  "append_only_function",
  "rpc_exists",
  "rpc_security_definer",
  "own_select_policy",
  "authenticated_select",
  "authenticated_direct_mutation_blocked",
  "anon_table_access_blocked",
  "authenticated_rpc_execute",
  "anon_rpc_execute_blocked",
  "public_rpc_execute_blocked",
];

function authorityComplete(row) {
  return requiredChecks.every((key) => row?.[key] === true);
}

const beforeRows = await query(inventorySql);
const before = beforeRows[0];
assert.ok(before, "PREDEPLOYMENT_INVENTORY_EMPTY");

if (before.table_exists && !authorityComplete(before)) {
  const failedChecks = requiredChecks.filter((key) => before[key] !== true);
  record("predeployment_inventory", "FAIL", {
    state: "PARTIAL",
    failedChecks,
  });
  throw new Error(
    `PARTIAL_MONTHLY_GOAL_AUTHORITY_REQUIRES_RECONCILIATION:${failedChecks.join(",")}`,
  );
}

record("predeployment_inventory", "PASS", {
  state: before.table_exists ? "COMPLETE" : "ABSENT",
  projectRef: PROJECT_REF,
  remoteAccountMutation: false,
});

if (!before.table_exists) {
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
  record("migration_applied", "PASS", {
    migration: MIGRATION_VERSION,
  });
} else {
  record("migration_already_satisfied", "PASS", {
    migration: MIGRATION_VERSION,
  });
}

const afterRows = await query(inventorySql);
const after = afterRows[0];
assert.ok(after, "POSTDEPLOYMENT_INVENTORY_EMPTY");
assert.equal(after.table_exists, true, "POSTDEPLOYMENT_TABLE_MISSING");
if (!authorityComplete(after)) {
  const failedChecks = requiredChecks.filter((key) => after[key] !== true);
  record("postdeployment_security_inventory", "FAIL", { failedChecks });
  throw new Error(`POSTDEPLOYMENT_AUTHORITY_INCOMPLETE:${failedChecks.join(",")}`);
}
record("postdeployment_security_inventory", "PASS", {
  checks: requiredChecks,
  directAuthenticatedMutation: false,
  anonymousAccess: false,
});

const historyRows = await query(`
select
  to_regclass('supabase_migrations.schema_migrations') is not null as history_exists,
  exists (
    select 1
    from information_schema.columns
    where table_schema = 'supabase_migrations'
      and table_name = 'schema_migrations'
      and column_name = 'version'
  ) as has_version,
  exists (
    select 1
    from information_schema.columns
    where table_schema = 'supabase_migrations'
      and table_name = 'schema_migrations'
      and column_name = 'name'
  ) as has_name,
  exists (
    select 1
    from information_schema.columns
    where table_schema = 'supabase_migrations'
      and table_name = 'schema_migrations'
      and column_name = 'statements'
  ) as has_statements
`);
const history = historyRows[0];
assert.equal(history?.history_exists, true, "MIGRATION_HISTORY_TABLE_MISSING");
assert.equal(history?.has_version, true, "MIGRATION_HISTORY_VERSION_MISSING");

const historyColumns = ["version"];
const historyValues = [`'${MIGRATION_VERSION}'`];
if (history.has_name) {
  historyColumns.push("name");
  historyValues.push(`'${MIGRATION_NAME}'`);
}
if (history.has_statements) {
  historyColumns.push("statements");
  historyValues.push(
    "array['Applied by ForgeOS guarded Smart Widget monthly goal deployment gate']::text[]",
  );
}
await query(`
insert into supabase_migrations.schema_migrations (${historyColumns.join(", ")})
values (${historyValues.join(", ")})
on conflict (version) do nothing
`);
const historyConfirmation = await query(`
select exists (
  select 1
  from supabase_migrations.schema_migrations
  where version = '${MIGRATION_VERSION}'
) as migration_recorded
`);
assert.equal(
  historyConfirmation[0]?.migration_recorded,
  true,
  "MIGRATION_HISTORY_CONFIRMATION_FAILED",
);
record("migration_history", "PASS", {
  migration: MIGRATION_VERSION,
});

const advisorRows = await query(`
select id::text as advisor_id
from auth.users
order by created_at, id
limit 1
`);
const advisorOne = advisorRows[0]?.advisor_id;
assert.match(
  advisorOne || "",
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  "AUTH_ADVISOR_REQUIRED_FOR_ACCEPTANCE",
);
const advisorTwo = advisorOne.toLowerCase() ===
  "00000000-0000-4000-8000-000000000001"
  ? "00000000-0000-4000-8000-000000000002"
  : "00000000-0000-4000-8000-000000000001";

const occupiedRows = await query(`
select count(*)::integer as residual_count
from public.advisor_monthly_policy_goals
where advisor_id = '${advisorOne}'::uuid
  and year_month = date '${TEST_YEAR_MONTH}'
`);
assert.equal(
  Number(occupiedRows[0]?.residual_count || 0),
  0,
  "ACCEPTANCE_TEST_MONTH_ALREADY_OCCUPIED",
);

const acceptanceSql = `
begin;

select set_config('request.jwt.claim.sub', '${advisorOne}', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;

select (public.forge_set_monthly_policy_goal(
  date '${TEST_YEAR_MONTH}',
  10,
  'smart-widget-deployment-acceptance-v1',
  'workflow:${process.env.GITHUB_RUN_ID || "local"}:revision-1'
)).revision as first_revision;

select (public.forge_set_monthly_policy_goal(
  date '${TEST_YEAR_MONTH}',
  12,
  'smart-widget-deployment-acceptance-v2',
  'workflow:${process.env.GITHUB_RUN_ID || "local"}:revision-2'
)).revision as second_revision;

do $$
declare
  v_count integer;
  v_latest_revision integer;
  v_chain_complete boolean;
  v_insert_blocked boolean := false;
  v_update_blocked boolean := false;
  v_delete_blocked boolean := false;
begin
  select count(*)::integer, max(revision)::integer
  into v_count, v_latest_revision
  from public.advisor_monthly_policy_goals
  where advisor_id = '${advisorOne}'::uuid
    and year_month = date '${TEST_YEAR_MONTH}';

  select exists (
    select 1
    from public.advisor_monthly_policy_goals current_goal
    join public.advisor_monthly_policy_goals previous_goal
      on previous_goal.id = current_goal.supersedes_goal_id
    where current_goal.advisor_id = '${advisorOne}'::uuid
      and current_goal.year_month = date '${TEST_YEAR_MONTH}'
      and current_goal.revision = 2
      and previous_goal.revision = 1
      and current_goal.target_policy_count = 12
      and previous_goal.target_policy_count = 10
  ) into v_chain_complete;

  if v_count <> 2 or v_latest_revision <> 2 or not v_chain_complete then
    raise exception 'GOAL_REVISION_CHAIN_ACCEPTANCE_FAILED';
  end if;

  begin
    insert into public.advisor_monthly_policy_goals (
      advisor_id,
      year_month,
      target_policy_count,
      revision,
      created_by
    ) values (
      '${advisorOne}'::uuid,
      date '${TEST_YEAR_MONTH}',
      99,
      99,
      '${advisorOne}'::uuid
    );
  exception
    when insufficient_privilege then
      v_insert_blocked := true;
  end;
  if not v_insert_blocked then
    raise exception 'DIRECT_INSERT_WAS_ALLOWED';
  end if;

  begin
    update public.advisor_monthly_policy_goals
    set target_policy_count = 99
    where advisor_id = '${advisorOne}'::uuid
      and year_month = date '${TEST_YEAR_MONTH}';
  exception
    when insufficient_privilege then
      v_update_blocked := true;
  end;
  if not v_update_blocked then
    raise exception 'DIRECT_UPDATE_WAS_ALLOWED';
  end if;

  begin
    delete from public.advisor_monthly_policy_goals
    where advisor_id = '${advisorOne}'::uuid
      and year_month = date '${TEST_YEAR_MONTH}';
  exception
    when insufficient_privilege then
      v_delete_blocked := true;
  end;
  if not v_delete_blocked then
    raise exception 'DIRECT_DELETE_WAS_ALLOWED';
  end if;
end;
$$;

reset role;
select set_config('request.jwt.claim.sub', '${advisorTwo}', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;

do $$
declare
  v_visible integer;
begin
  select count(*)::integer
  into v_visible
  from public.advisor_monthly_policy_goals
  where advisor_id = '${advisorOne}'::uuid
    and year_month = date '${TEST_YEAR_MONTH}';
  if v_visible <> 0 then
    raise exception 'CROSS_ADVISOR_RLS_ACCEPTANCE_FAILED';
  end if;
end;
$$;

reset role;
rollback;
`;

assert.match(acceptanceSql, /rollback;/i, "ROLLBACK_REQUIRED");
await query(acceptanceSql);
record("authenticated_rollback_acceptance", "PASS", {
  revisionChain: true,
  directInsertBlocked: true,
  directUpdateBlocked: true,
  directDeleteBlocked: true,
  rolledBack: true,
  remoteAccountMutation: false,
});
record("cross_advisor_isolation", "PASS", {
  rlsIsolation: true,
  advisorIdentifiersExposed: false,
});

const residualRows = await query(`
select count(*)::integer as residual_count
from public.advisor_monthly_policy_goals
where advisor_id = '${advisorOne}'::uuid
  and year_month = date '${TEST_YEAR_MONTH}'
`);
assert.equal(
  Number(residualRows[0]?.residual_count || 0),
  0,
  "ROLLBACK_LEFT_RESIDUAL_ROWS",
);
record("residual_rows_zero", "PASS", {
  testYearMonth: TEST_YEAR_MONTH,
  residualRows: 0,
});

console.log("SMART WIDGET MONTHLY GOAL MIGRATION DEPLOYMENT: PASS");
console.log(`MIGRATION_VERSION=${MIGRATION_VERSION}`);
console.log(`PROJECT_REF=${PROJECT_REF}`);
console.log("REMOTE_ACCOUNT_MUTATION=NO");
console.log("TEST_FIXTURES_ROLLED_BACK=YES");
console.log("RESIDUAL_ROWS=0");
