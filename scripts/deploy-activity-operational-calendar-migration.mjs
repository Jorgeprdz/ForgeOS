import assert from "node:assert/strict";
import { appendFileSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";

const PROJECT_REF = "rmlxigxysujsuwzgoimv";
const MIGRATION_VERSION = "20260805000100";
const MIGRATION_NAME = "activity_operational_calendar_authority";
const MIGRATION_FILE = `supabase/migrations/${MIGRATION_VERSION}_${MIGRATION_NAME}.sql`;
const EVIDENCE_DIR = "artifacts/activity-operational-calendar-migration";
const EVIDENCE_FILE = `${EVIDENCE_DIR}/ledger.jsonl`;
const ENDPOINT = `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`;

assert.equal(process.env.SUPABASE_PROJECT_REF, PROJECT_REF, "PROJECT_REF_MISMATCH");
assert.ok(process.env.SUPABASE_ACCESS_TOKEN, "SUPABASE_ACCESS_TOKEN_MISSING");

mkdirSync(EVIDENCE_DIR, { recursive: true });
writeFileSync(EVIDENCE_FILE, "");

const record = (name, status, metadata = {}) => {
  appendFileSync(EVIDENCE_FILE, `${JSON.stringify({
    timestamp: new Date().toISOString(),
    name,
    status,
    ...metadata,
  })}\n`);
};

const redact = value => String(value || "")
  .replace(/eyJ[A-Za-z0-9._-]+/g, "[REDACTED]")
  .replace(/[A-Za-z0-9_-]{32,}/g, "[REDACTED]")
  .slice(0, 600);

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
    throw new Error(`DATABASE_QUERY_HTTP_${response.status}`);
  }

  return Array.isArray(body?.result) ? body.result : (Array.isArray(body) ? body : []);
}

const inventorySql = `
with expected_columns(table_name, column_name) as (
  values
    ('operational_calendar_profiles','id'),
    ('operational_calendar_profiles','profile_reference'),
    ('operational_calendar_profiles','tenant_id'),
    ('operational_calendar_profiles','scope_type'),
    ('operational_calendar_profiles','advisor_id'),
    ('operational_calendar_profiles','timezone'),
    ('operational_calendar_profiles','working_weekdays'),
    ('operational_calendar_profiles','effective_from'),
    ('operational_calendar_profiles','effective_to'),
    ('operational_calendar_profiles','status'),
    ('operational_calendar_profiles','source_owner'),
    ('operational_calendar_profiles','source_reference'),
    ('operational_calendar_profiles','evidence_state'),
    ('operational_calendar_profiles','correction_of'),
    ('operational_calendar_profiles','supersedes'),
    ('operational_calendar_profiles','recorded_by'),
    ('operational_calendar_profiles','recorded_at'),
    ('operational_calendar_profiles','provenance'),
    ('operational_calendar_profiles','idempotency_key'),
    ('operational_calendar_profiles','command_digest'),
    ('operational_day_overrides','id'),
    ('operational_day_overrides','override_reference'),
    ('operational_day_overrides','tenant_id'),
    ('operational_day_overrides','advisor_id'),
    ('operational_day_overrides','local_date'),
    ('operational_day_overrides','override_type'),
    ('operational_day_overrides','status'),
    ('operational_day_overrides','source_owner'),
    ('operational_day_overrides','source_reference'),
    ('operational_day_overrides','evidence_state'),
    ('operational_day_overrides','correction_of'),
    ('operational_day_overrides','recorded_by'),
    ('operational_day_overrides','recorded_at'),
    ('operational_day_overrides','provenance'),
    ('operational_day_overrides','idempotency_key'),
    ('operational_day_overrides','command_digest'),
    ('advisor_time_off_periods','id'),
    ('advisor_time_off_periods','time_off_reference'),
    ('advisor_time_off_periods','tenant_id'),
    ('advisor_time_off_periods','advisor_id'),
    ('advisor_time_off_periods','start_date'),
    ('advisor_time_off_periods','end_date'),
    ('advisor_time_off_periods','timezone'),
    ('advisor_time_off_periods','status'),
    ('advisor_time_off_periods','category'),
    ('advisor_time_off_periods','confirmation_state'),
    ('advisor_time_off_periods','source_owner'),
    ('advisor_time_off_periods','source_reference'),
    ('advisor_time_off_periods','evidence_state'),
    ('advisor_time_off_periods','correction_of'),
    ('advisor_time_off_periods','supersedes'),
    ('advisor_time_off_periods','archived'),
    ('advisor_time_off_periods','recorded_by'),
    ('advisor_time_off_periods','recorded_at'),
    ('advisor_time_off_periods','provenance'),
    ('advisor_time_off_periods','idempotency_key'),
    ('advisor_time_off_periods','command_digest')
), column_checks as (
  select
    e.table_name,
    count(*) = count(c.column_name) as complete
  from expected_columns e
  left join information_schema.columns c
    on c.table_schema = 'public'
   and c.table_name = e.table_name
   and c.column_name = e.column_name
  group by e.table_name
)
select
  to_regclass('public.operational_calendar_profiles') is not null as profiles_exists,
  to_regclass('public.operational_day_overrides') is not null as overrides_exists,
  to_regclass('public.advisor_time_off_periods') is not null as time_off_exists,
  coalesce((select complete from column_checks where table_name='operational_calendar_profiles'), false) as profiles_columns_complete,
  coalesce((select complete from column_checks where table_name='operational_day_overrides'), false) as overrides_columns_complete,
  coalesce((select complete from column_checks where table_name='advisor_time_off_periods'), false) as time_off_columns_complete,
  to_regprocedure('public.forge_opcal_valid_working_weekdays(jsonb)') is not null as weekdays_function,
  to_regprocedure('public.forge_opcal_is_iana_timezone(text)') is not null as timezone_function,
  to_regprocedure('public.forge_opcal_deny_mutation()') is not null as deny_mutation_function,
  exists (
    select 1 from pg_class
    where oid = to_regclass('public.operational_calendar_profiles')
      and relrowsecurity and relforcerowsecurity
  ) as profiles_rls_forced,
  exists (
    select 1 from pg_class
    where oid = to_regclass('public.operational_day_overrides')
      and relrowsecurity and relforcerowsecurity
  ) as overrides_rls_forced,
  exists (
    select 1 from pg_class
    where oid = to_regclass('public.advisor_time_off_periods')
      and relrowsecurity and relforcerowsecurity
  ) as time_off_rls_forced,
  exists (
    select 1 from pg_trigger
    where tgrelid = to_regclass('public.operational_calendar_profiles')
      and tgname = 'opcal_profiles_append_only' and tgenabled <> 'D'
  ) as profiles_append_only,
  exists (
    select 1 from pg_trigger
    where tgrelid = to_regclass('public.operational_day_overrides')
      and tgname = 'opcal_overrides_append_only' and tgenabled <> 'D'
  ) as overrides_append_only,
  exists (
    select 1 from pg_trigger
    where tgrelid = to_regclass('public.advisor_time_off_periods')
      and tgname = 'opcal_time_off_append_only' and tgenabled <> 'D'
  ) as time_off_append_only,
  (select count(*) = 2 from pg_policies
    where schemaname='public' and tablename='operational_calendar_profiles'
      and policyname in ('opcal_profile_owner_select','opcal_profile_owner_insert')) as profiles_policies,
  (select count(*) = 2 from pg_policies
    where schemaname='public' and tablename='operational_day_overrides'
      and policyname in ('opcal_override_owner_select','opcal_override_owner_insert')) as overrides_policies,
  (select count(*) = 2 from pg_policies
    where schemaname='public' and tablename='advisor_time_off_periods'
      and policyname in ('opcal_time_off_owner_select','opcal_time_off_owner_insert')) as time_off_policies,
  not exists (
    select 1 from pg_policies
    where schemaname='public'
      and tablename in ('operational_calendar_profiles','operational_day_overrides','advisor_time_off_periods')
      and cmd in ('UPDATE','DELETE','ALL')
  ) as no_mutation_policies,
  not exists (
    select 1 from information_schema.role_table_grants
    where table_schema='public'
      and table_name in ('operational_calendar_profiles','operational_day_overrides','advisor_time_off_periods')
      and grantee in ('anon','authenticated')
      and privilege_type in ('UPDATE','DELETE','TRUNCATE','REFERENCES','TRIGGER')
  ) as no_mutation_grants,
  (select count(*) = 6 from information_schema.role_table_grants
    where table_schema='public'
      and table_name in ('operational_calendar_profiles','operational_day_overrides','advisor_time_off_periods')
      and grantee='authenticated'
      and privilege_type in ('SELECT','INSERT')) as authenticated_select_insert_grants,
  (select count(*) = 3 from pg_indexes
    where schemaname='public'
      and indexname in ('opcal_profile_effective_idx','opcal_override_date_idx','opcal_time_off_period_idx')) as required_indexes,
  exists (
    select 1 from pg_constraint
    where conname='opcal_profile_correction_fk'
      and conrelid=to_regclass('public.operational_calendar_profiles')
  ) as profile_correction_fk,
  exists (
    select 1 from pg_constraint
    where conname='opcal_time_off_correction_fk'
      and conrelid=to_regclass('public.advisor_time_off_periods')
  ) as time_off_correction_fk
`;

const completenessKeys = [
  "profiles_columns_complete",
  "overrides_columns_complete",
  "time_off_columns_complete",
  "weekdays_function",
  "timezone_function",
  "deny_mutation_function",
  "profiles_rls_forced",
  "overrides_rls_forced",
  "time_off_rls_forced",
  "profiles_append_only",
  "overrides_append_only",
  "time_off_append_only",
  "profiles_policies",
  "overrides_policies",
  "time_off_policies",
  "no_mutation_policies",
  "no_mutation_grants",
  "authenticated_select_insert_grants",
  "required_indexes",
  "profile_correction_fk",
  "time_off_correction_fk",
];

function authorityComplete(row) {
  return ["profiles_exists", "overrides_exists", "time_off_exists", ...completenessKeys]
    .every(key => row?.[key] === true);
}

const beforeRows = await query(inventorySql);
const before = beforeRows[0];
assert.ok(before, "PREDEPLOYMENT_INVENTORY_EMPTY");

const existence = [before.profiles_exists, before.overrides_exists, before.time_off_exists];
const anyExists = existence.some(Boolean);
const allExist = existence.every(Boolean);

if (anyExists && (!allExist || !authorityComplete(before))) {
  const failedChecks = Object.entries(before)
    .filter(([, value]) => value !== true)
    .map(([key]) => key);
  record("predeployment_inventory", "FAIL", {
    state: "PARTIAL",
    failedChecks,
    projectRef: PROJECT_REF,
  });
  throw new Error("PARTIAL_OPERATIONAL_CALENDAR_REQUIRES_RECONCILIATION");
}

record("predeployment_inventory", "PASS", {
  state: allExist ? "COMPLETE" : "ABSENT",
  projectRef: PROJECT_REF,
});

if (!allExist) {
  const sql = readFileSync(MIGRATION_FILE, "utf8");
  assert.doesNotMatch(sql, /\b(?:drop\s+table|truncate)\b/i, "DESTRUCTIVE_SQL_REJECTED");
  assert.match(sql, /^\s*begin;[\s\S]*commit;\s*$/i, "TRANSACTION_BOUNDARY_REQUIRED");
  assert.match(sql, /force row level security/i, "FORCED_RLS_REQUIRED");
  assert.match(sql, /auth\.uid\(\)/i, "AUTH_UID_SCOPE_REQUIRED");
  await query(sql);
  record("migration_applied", "PASS", { migration: MIGRATION_VERSION });
} else {
  record("migration_already_satisfied", "PASS", { migration: MIGRATION_VERSION });
}

const afterRows = await query(inventorySql);
const after = afterRows[0];
assert.ok(after, "POSTDEPLOYMENT_INVENTORY_EMPTY");

if (!authorityComplete(after)) {
  const failedChecks = Object.entries(after)
    .filter(([, value]) => value !== true)
    .map(([key]) => key);
  record("postdeployment_security_inventory", "FAIL", { failedChecks });
  throw new Error("POSTDEPLOYMENT_OPERATIONAL_CALENDAR_CONTRACT_FAILED");
}

record("postdeployment_security_inventory", "PASS", {
  projectRef: PROJECT_REF,
  checks: completenessKeys,
});

const dataRows = await query(`
select
  (select count(*)::int from public.operational_calendar_profiles) as profile_count,
  (select count(*)::int from public.operational_day_overrides) as override_count,
  (select count(*)::int from public.advisor_time_off_periods) as time_off_count
`);
const dataState = dataRows[0] || {};
record("production_configuration_inventory", "PASS", {
  profileCount: dataState.profile_count ?? null,
  overrideCount: dataState.override_count ?? null,
  timeOffCount: dataState.time_off_count ?? null,
  inventedSeedData: false,
});

const historyRows = await query(`
select
  to_regclass('supabase_migrations.schema_migrations') is not null as history_exists,
  exists (
    select 1 from information_schema.columns
    where table_schema='supabase_migrations'
      and table_name='schema_migrations'
      and column_name='version'
  ) as has_version,
  exists (
    select 1 from information_schema.columns
    where table_schema='supabase_migrations'
      and table_name='schema_migrations'
      and column_name='name'
  ) as has_name,
  exists (
    select 1 from information_schema.columns
    where table_schema='supabase_migrations'
      and table_name='schema_migrations'
      and column_name='statements'
  ) as has_statements
`);
const history = historyRows[0];
assert.equal(history?.history_exists, true, "MIGRATION_HISTORY_TABLE_MISSING");
assert.equal(history?.has_version, true, "MIGRATION_HISTORY_VERSION_MISSING");

const columns = ["version"];
const values = [`'${MIGRATION_VERSION}'`];
if (history.has_name) {
  columns.push("name");
  values.push(`'${MIGRATION_NAME}'`);
}
if (history.has_statements) {
  columns.push("statements");
  values.push("array['Applied by ForgeOS guarded Activity operational calendar deployment gate']::text[]");
}

await query(`
insert into supabase_migrations.schema_migrations (${columns.join(", ")})
values (${values.join(", ")})
on conflict (version) do nothing
`);

const confirmationRows = await query(`
select exists (
  select 1 from supabase_migrations.schema_migrations
  where version='${MIGRATION_VERSION}'
) as migration_recorded
`);
assert.equal(confirmationRows[0]?.migration_recorded, true, "MIGRATION_HISTORY_CONFIRMATION_FAILED");
record("migration_history", "PASS", { migration: MIGRATION_VERSION });

console.log("ACTIVITY OPERATIONAL CALENDAR MIGRATION DEPLOYMENT: PASS");
console.log(`MIGRATION_VERSION=${MIGRATION_VERSION}`);
console.log(`PROJECT_REF=${PROJECT_REF}`);
console.log(`PROFILE_COUNT=${dataState.profile_count ?? "UNKNOWN"}`);
console.log(`OVERRIDE_COUNT=${dataState.override_count ?? "UNKNOWN"}`);
console.log(`TIME_OFF_COUNT=${dataState.time_off_count ?? "UNKNOWN"}`);
