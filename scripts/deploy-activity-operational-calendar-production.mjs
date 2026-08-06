import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { appendFileSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";

const PROJECT_REF = "rmlxigxysujsuwzgoimv";
const MIGRATION_PATH = "supabase/migrations/20260805000100_activity_operational_calendar_authority.sql";
const ENDPOINT = `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`;
const EVIDENCE_DIR = "artifacts/activity-calendar-production";
const EVIDENCE_FILE = `${EVIDENCE_DIR}/ledger.jsonl`;
const ADVISOR_EMAIL = "jorgepalaciosrodriguez@gmail.com";
const TIMEZONE = "America/Mexico_City";
const WORKING_WEEKDAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"];

assert.equal(process.env.SUPABASE_PROJECT_REF, PROJECT_REF, "PROJECT_REF_MISMATCH");
assert.ok(process.env.SUPABASE_ACCESS_TOKEN, "SUPABASE_ACCESS_TOKEN_MISSING");
mkdirSync(EVIDENCE_DIR, { recursive: true });
writeFileSync(EVIDENCE_FILE, "");

const record = (name, status, detail = {}) => appendFileSync(
  EVIDENCE_FILE,
  `${JSON.stringify({ timestamp: new Date().toISOString(), name, status, ...detail })}\n`,
);
const q = value => `'${String(value).replaceAll("'", "''")}'`;
const redact = value => String(value || "")
  .replace(/[A-Fa-f0-9]{8}-[A-Fa-f0-9-]{27,}/g, "[REDACTED_UUID]")
  .replace(/eyJ[A-Za-z0-9._-]+/g, "[REDACTED]")
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
  try { body = JSON.parse(text); }
  catch { body = { message: "NON_JSON_RESPONSE" }; }
  if (!response.ok || body?.error) {
    record("database_query", "FAIL", { httpStatus: response.status, detail: redact(body?.message || body?.error || text) });
    throw new Error(`DATABASE_QUERY_HTTP_${response.status}`);
  }
  return Array.isArray(body?.result) ? body.result : (Array.isArray(body) ? body : []);
}

const migrationSql = readFileSync(MIGRATION_PATH, "utf8");
assert.doesNotMatch(migrationSql, /\b(?:drop\s+table|truncate)\b/i, "DESTRUCTIVE_SQL_REJECTED");
assert.match(migrationSql, /begin;[\s\S]*commit;/i, "TRANSACTION_BOUNDARY_REQUIRED");
assert.match(migrationSql, /force row level security/i, "FORCED_RLS_REQUIRED");
assert.match(migrationSql, /OPCAL_APPEND_ONLY_MUTATION_DENIED/, "APPEND_ONLY_REQUIRED");

const preflight = (await query(`
select
  exists (select 1 from auth.users where lower(email) = lower(${q(ADVISOR_EMAIL)})) as advisor_exists,
  to_regclass('public.operational_calendar_profiles') is not null as profiles_exists,
  to_regclass('public.operational_day_overrides') is not null as overrides_exists,
  to_regclass('public.advisor_time_off_periods') is not null as time_off_exists
`))[0];
assert.equal(preflight?.advisor_exists, true, "CONFIRMED_ADVISOR_NOT_FOUND");
record("predeployment_inventory", "PASS", {
  existingAuthority: Boolean(preflight.profiles_exists && preflight.overrides_exists && preflight.time_off_exists),
  confirmedAdvisorResolved: true,
});

await query(migrationSql);
record("migration_applied_or_already_satisfied", "PASS", { migration: "20260805000100" });

const security = (await query(`
with targets as (
  select unnest(array[
    'public.operational_calendar_profiles'::regclass,
    'public.operational_day_overrides'::regclass,
    'public.advisor_time_off_periods'::regclass
  ]) as relation
)
select
  count(*) = 3 as all_tables_exist,
  bool_and(c.relrowsecurity) as rls_enabled,
  bool_and(c.relforcerowsecurity) as rls_forced,
  bool_and(not has_table_privilege('authenticated', c.oid, 'UPDATE')) as authenticated_update_denied,
  bool_and(not has_table_privilege('authenticated', c.oid, 'DELETE')) as authenticated_delete_denied,
  bool_and(not has_table_privilege('anon', c.oid, 'SELECT')) as anon_select_denied,
  bool_and(not has_table_privilege('anon', c.oid, 'INSERT')) as anon_insert_denied
from targets join pg_class c on c.oid = targets.relation
`))[0];
for (const [key, value] of Object.entries(security || {})) assert.equal(value, true, `SECURITY_${key.toUpperCase()}_FAILED`);
record("postdeployment_security_inventory", "PASS", { checks: Object.keys(security || {}) });

const advisorId = (await query(`
select id::text as id from auth.users
where lower(email) = lower(${q(ADVISOR_EMAIL)})
order by created_at asc limit 1
`))[0]?.id;
assert.ok(advisorId, "ADVISOR_ID_UNAVAILABLE");

const sourceReference = "owner-confirmation:2026-08-05:activity-live-acceptance";
const profileReference = `opcal:advisor:${advisorId}:2026-08-05`;
const idempotencyKey = `opcal-profile:${advisorId}:v1`;
const commandDigest = createHash("sha256").update(JSON.stringify({
  advisorId,
  timezone: TIMEZONE,
  workingWeekdays: WORKING_WEEKDAYS,
  effectiveFrom: "2026-08-05",
  sourceReference,
})).digest("hex");

await query(`
insert into public.operational_calendar_profiles (
  profile_reference, tenant_id, scope_type, advisor_id, timezone,
  working_weekdays, effective_from, effective_to, status, source_owner,
  source_reference, evidence_state, recorded_by, provenance,
  idempotency_key, command_digest
)
select
  ${q(profileReference)}, ${q(advisorId)}::uuid, 'ADVISOR', ${q(advisorId)}::uuid,
  ${q(TIMEZONE)}, ${q(JSON.stringify(WORKING_WEEKDAYS))}::jsonb,
  date '2026-08-05', null, 'ACTIVE', 'OPERATIONAL_CALENDAR',
  ${q(sourceReference)}, 'CONFIRMED', ${q(advisorId)}::uuid,
  jsonb_build_object(
    'authorizationId', 'OPERATIONAL_CALENDAR_PRODUCTION_MIGRATION_AND_ACTIVITY_LIVE_ACCEPTANCE',
    'confirmedBy', 'HUMAN_OWNER',
    'captureMode', 'GOVERNED_PRODUCTION_DEPLOYMENT'
  ),
  ${q(idempotencyKey)}, ${q(commandDigest)}
where not exists (
  select 1 from public.operational_calendar_profiles
  where tenant_id = ${q(advisorId)}::uuid and idempotency_key = ${q(idempotencyKey)}
)
`);
record("confirmed_calendar_profile_seed", "PASS", {
  timezone: TIMEZONE,
  workingWeekdays: WORKING_WEEKDAYS,
  vacationsSeeded: 0,
  holidaysSeeded: 0,
});

const profile = (await query(`
select timezone, working_weekdays, status, evidence_state, source_owner,
       advisor_id = tenant_id as advisor_scoped,
       recorded_by = tenant_id as actor_scoped,
       command_digest = ${q(commandDigest)} as digest_matches
from public.operational_calendar_profiles
where tenant_id = ${q(advisorId)}::uuid and idempotency_key = ${q(idempotencyKey)}
limit 1
`))[0];
assert.equal(profile?.timezone, TIMEZONE, "TIMEZONE_SEED_MISMATCH");
assert.deepEqual(profile?.working_weekdays, WORKING_WEEKDAYS, "WORKWEEK_SEED_MISMATCH");
assert.equal(profile?.status, "ACTIVE", "PROFILE_STATUS_INVALID");
assert.equal(profile?.evidence_state, "CONFIRMED", "PROFILE_EVIDENCE_INVALID");
assert.equal(profile?.source_owner, "OPERATIONAL_CALENDAR", "PROFILE_OWNER_INVALID");
for (const key of ["advisor_scoped", "actor_scoped", "digest_matches"]) assert.equal(profile?.[key], true, `PROFILE_${key.toUpperCase()}_FAILED`);
record("confirmed_profile_read_after_write", "PASS", { timezone: profile.timezone, workdayCount: profile.working_weekdays.length });

const ownerVisible = (await query(`
begin;
set local role authenticated;
select set_config('request.jwt.claim.sub', ${q(advisorId)}, true);
select set_config('request.jwt.claim.role', 'authenticated', true);
select count(*)::integer as visible_count from public.operational_calendar_profiles where tenant_id = ${q(advisorId)}::uuid;
rollback;
`)).at(-1)?.visible_count;
assert.ok(Number(ownerVisible) >= 1, "OWNER_RLS_SELECT_FAILED");
record("authenticated_owner_rls_acceptance", "PASS", { visible: true });

const outsiderVisible = (await query(`
begin;
set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000000001', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
select count(*)::integer as visible_count from public.operational_calendar_profiles where tenant_id = ${q(advisorId)}::uuid;
rollback;
`)).at(-1)?.visible_count;
assert.equal(Number(outsiderVisible), 0, "CROSS_TENANT_RLS_SELECT_LEAK");
record("cross_tenant_rls_acceptance", "PASS", { leakedRows: 0 });

const final = (await query(`
select
  to_regclass('public.operational_calendar_profiles') is not null as profiles_exists,
  to_regclass('public.operational_day_overrides') is not null as overrides_exists,
  to_regclass('public.advisor_time_off_periods') is not null as time_off_exists,
  (select count(*)::integer from public.operational_calendar_profiles where tenant_id = ${q(advisorId)}::uuid and status = 'ACTIVE') as active_profiles,
  (select count(*)::integer from public.advisor_time_off_periods where tenant_id = ${q(advisorId)}::uuid and status = 'CONFIRMED' and archived = false) as confirmed_time_off_periods
`))[0];
for (const key of ["profiles_exists", "overrides_exists", "time_off_exists"]) assert.equal(final?.[key], true, `FINAL_${key.toUpperCase()}_FAILED`);
assert.ok(Number(final.active_profiles) >= 1, "ACTIVE_PROFILE_MISSING");
record("production_authority_acceptance", "PASS", {
  activeProfiles: Number(final.active_profiles),
  confirmedTimeOffPeriods: Number(final.confirmed_time_off_periods),
  productionMigrationExecuted: true,
});

console.log("OPERATIONAL_CALENDAR_PRODUCTION_MIGRATION=PASS");
console.log("OPERATIONAL_CALENDAR_PROFILE_CONFIGURATION=PASS");
console.log("TIMEZONE_AUTHORITY=America/Mexico_City");
console.log("WORKING_WEEKDAYS=MONDAY,TUESDAY,WEDNESDAY,THURSDAY,FRIDAY");
console.log("VACATION_AUTHORITY=READY_NO_INVENTED_PERIODS");
console.log("RLS_TENANT_ISOLATION=PASS");
console.log("APPEND_ONLY=PASS");
