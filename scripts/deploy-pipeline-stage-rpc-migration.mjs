import assert from "node:assert/strict";
import { appendFileSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";

const PROJECT_REF = "rmlxigxysujsuwzgoimv";
const RPC_MIGRATION = Object.freeze({
  version: "20260731000200",
  name: "pipeline_prospect_stage_rpc",
});
const REPAIR_MIGRATION = Object.freeze({
  version: "20260731000300",
  name: "pipeline_stage_timeline_digest_search_path_repair",
});
const migrationPath = migration =>
  `supabase/migrations/${migration.version}_${migration.name}.sql`;
const EVIDENCE_DIR = "artifacts/pipeline-stage-rpc-migration";
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
  .replace(/[A-Fa-f0-9]{8}-[A-Fa-f0-9-]{27,}/g, "[REDACTED_UUID]")
  .replace(/[A-Za-z0-9_-]{32,}/g, "[REDACTED]")
  .slice(0, 500);

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

const rpcSql = readFileSync(migrationPath(RPC_MIGRATION), "utf8");
const repairSql = readFileSync(migrationPath(REPAIR_MIGRATION), "utf8");

for (const [name, sql] of [["RPC", rpcSql], ["REPAIR", repairSql]]) {
  assert.doesNotMatch(sql, /\b(?:drop\s+table|truncate)\b/i, `${name}_DESTRUCTIVE_SQL_REJECTED`);
  assert.match(sql, /begin;[\s\S]*commit;/i, `${name}_TRANSACTION_BOUNDARY_REQUIRED`);
}
assert.match(rpcSql, /security definer/i, "SECURITY_DEFINER_REQUIRED");
assert.match(rpcSql, /actor_id := auth\.uid\(\)/, "AUTH_UID_REQUIRED");
assert.match(rpcSql, /advisor_id = actor_id/, "OWNER_FILTER_REQUIRED");
assert.match(repairSql, /pg_extension[\s\S]*pgcrypto/i, "PGCRYPTO_SCHEMA_DISCOVERY_REQUIRED");
assert.match(repairSql, /forge_nfast08_capture_pipeline_timeline/i, "CAPTURE_FUNCTION_REPAIR_REQUIRED");
assert.match(repairSql, /forge_nfast08_append_prospect_timeline_event/i, "APPEND_FUNCTION_REPAIR_REQUIRED");
assert.match(repairSql, /set search_path = public, %I, pg_temp/i, "RESTRICTED_DYNAMIC_SEARCH_PATH_REQUIRED");

const beforeRows = await query(`
select
  to_regclass('public.prospects') is not null as prospects_exists,
  to_regprocedure('public.forge_pipeline_update_prospect_stage(uuid,text)') is not null as rpc_exists,
  to_regprocedure('public.forge_nfast08_capture_pipeline_timeline()') is not null as capture_exists,
  to_regprocedure('public.forge_nfast08_append_prospect_timeline_event(uuid,text,timestamptz,text,jsonb,jsonb,text)') is not null as append_exists,
  exists (
    select 1
    from pg_extension extension
    where extension.extname = 'pgcrypto'
  ) as pgcrypto_exists,
  exists (
    select 1
    from public.prospects
    where archived_at is null
  ) as active_prospect_exists
`);
const before = beforeRows[0];
for (const key of [
  "prospects_exists",
  "capture_exists",
  "append_exists",
  "pgcrypto_exists",
  "active_prospect_exists",
]) {
  assert.equal(before?.[key], true, `PREDEPLOYMENT_${key.toUpperCase()}_FAILED`);
}
record("predeployment_inventory", "PASS", {
  rpcState: before.rpc_exists ? "PRESENT" : "ABSENT",
  activeProspectAvailable: true,
});

await query(rpcSql);
record("migration_applied", "PASS", { migration: RPC_MIGRATION.version });

await query(repairSql);
record("timeline_digest_repair_applied", "PASS", {
  migration: REPAIR_MIGRATION.version,
});

const contractRows = await query(`
with pgcrypto_namespace as (
  select namespace.nspname
  from pg_extension extension
  join pg_namespace namespace
    on namespace.oid = extension.extnamespace
  where extension.extname = 'pgcrypto'
)
select
  to_regprocedure('public.forge_pipeline_update_prospect_stage(uuid,text)') is not null as rpc_exists,
  coalesce((
    select procedure.prosecdef
    from pg_proc procedure
    where procedure.oid = to_regprocedure('public.forge_pipeline_update_prospect_stage(uuid,text)')
  ), false) as security_definer,
  has_function_privilege(
    'authenticated',
    'public.forge_pipeline_update_prospect_stage(uuid,text)',
    'EXECUTE'
  ) as authenticated_execute,
  not has_function_privilege(
    'anon',
    'public.forge_pipeline_update_prospect_stage(uuid,text)',
    'EXECUTE'
  ) as anon_denied,
  position('auth.uid()' in pg_get_functiondef(
    to_regprocedure('public.forge_pipeline_update_prospect_stage(uuid,text)')
  )) > 0 as checks_auth_uid,
  position('advisor_id = actor_id' in pg_get_functiondef(
    to_regprocedure('public.forge_pipeline_update_prospect_stage(uuid,text)')
  )) > 0 as checks_owner,
  position('archived_at is null' in pg_get_functiondef(
    to_regprocedure('public.forge_pipeline_update_prospect_stage(uuid,text)')
  )) > 0 as excludes_archived,
  exists (
    select 1
    from pg_proc procedure
    cross join pgcrypto_namespace extension_schema
    where procedure.oid = to_regprocedure('public.forge_nfast08_capture_pipeline_timeline()')
      and position(extension_schema.nspname in array_to_string(procedure.proconfig, ',')) > 0
  ) as capture_has_pgcrypto_search_path,
  exists (
    select 1
    from pg_proc procedure
    cross join pgcrypto_namespace extension_schema
    where procedure.oid = to_regprocedure(
      'public.forge_nfast08_append_prospect_timeline_event(uuid,text,timestamptz,text,jsonb,jsonb,text)'
    )
      and position(extension_schema.nspname in array_to_string(procedure.proconfig, ',')) > 0
  ) as append_has_pgcrypto_search_path
`);
const contract = contractRows[0];
for (const [key, value] of Object.entries(contract || {})) {
  assert.equal(value, true, `POSTDEPLOYMENT_${key.toUpperCase()}_FAILED`);
}
record("postdeployment_security_inventory", "PASS", {
  checks: Object.keys(contract || {}),
});

const targetRows = await query(`
select
  prospect.id,
  prospect.advisor_id,
  prospect.status,
  (
    select count(*)::integer
    from public.prospect_timeline_events timeline
    where timeline.prospect_id = prospect.id
  ) as timeline_count
from public.prospects prospect
where prospect.archived_at is null
order by prospect.created_at desc
limit 1
`);
const target = targetRows[0];
assert.ok(target?.id && target?.advisor_id && target?.status, "ROLLBACK_TARGET_UNAVAILABLE");
const alternative = target.status === "contacted" ? "decision" : "contacted";
const uuid = value => `'${String(value).replaceAll("'", "''")}'::uuid`;
const text = value => `'${String(value).replaceAll("'", "''")}'::text`;

await query(`
begin;
set local role authenticated;
select set_config('request.jwt.claim.sub', ${text(target.advisor_id)}, true);
select set_config('request.jwt.claim.role', 'authenticated', true);
do $acceptance$
declare
  persisted public.prospects%rowtype;
  observed_status text;
  stage_event_exists boolean;
begin
  persisted := public.forge_pipeline_update_prospect_stage(
    ${uuid(target.id)},
    ${text(alternative)}
  );
  if persisted.id is distinct from ${uuid(target.id)}
     or persisted.status is distinct from ${text(alternative)} then
    raise exception 'PIPELINE_STAGE_RPC_RETURN_MISMATCH';
  end if;

  select status into observed_status
  from public.prospects
  where id = ${uuid(target.id)};
  if observed_status is distinct from ${text(alternative)} then
    raise exception 'PIPELINE_STAGE_RPC_READ_AFTER_WRITE_MISMATCH';
  end if;

  select exists (
    select 1
    from public.prospect_timeline_events
    where prospect_id = ${uuid(target.id)}
      and event_type = 'STAGE_CHANGED'
      and payload ->> 'toStage' = ${text(alternative)}
      and occurred_at >= transaction_timestamp()
  ) into stage_event_exists;
  if not stage_event_exists then
    raise exception 'PIPELINE_STAGE_TIMELINE_EVENT_MISSING';
  end if;
end;
$acceptance$;
rollback;
select true as rollback_acceptance;
`);

const rollbackRows = await query(`
select
  prospect.status = ${text(target.status)} as original_status_preserved,
  (
    select count(*)::integer
    from public.prospect_timeline_events timeline
    where timeline.prospect_id = prospect.id
  ) = ${Number(target.timeline_count)} as timeline_rollback_preserved
from public.prospects prospect
where prospect.id = ${uuid(target.id)}
`);
assert.equal(rollbackRows[0]?.original_status_preserved, true, "ROLLBACK_DID_NOT_PRESERVE_ORIGINAL_STATUS");
assert.equal(rollbackRows[0]?.timeline_rollback_preserved, true, "ROLLBACK_DID_NOT_PRESERVE_TIMELINE");
record("authenticated_rollback_acceptance", "PASS", {
  mutationPersisted: false,
  originalStatusPreserved: true,
  timelineEventObservedInsideTransaction: true,
  timelineRollbackPreserved: true,
});

const historyRows = await query(`
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
`);
const history = historyRows[0];
assert.equal(history?.history_exists, true, "MIGRATION_HISTORY_TABLE_MISSING");

for (const migration of [RPC_MIGRATION, REPAIR_MIGRATION]) {
  const columns = ["version"];
  const values = [`'${migration.version}'`];
  if (history.has_name) {
    columns.push("name");
    values.push(`'${migration.name}'`);
  }
  if (history.has_statements) {
    columns.push("statements");
    values.push("array['Applied by ForgeOS guarded GitHub Actions stage RPC gate']::text[]");
  }
  await query(`
insert into supabase_migrations.schema_migrations (${columns.join(", ")})
values (${values.join(", ")})
on conflict (version) do nothing
`);
}

const confirmationRows = await query(`
select count(*) = 2 as migrations_recorded
from supabase_migrations.schema_migrations
where version in ('${RPC_MIGRATION.version}', '${REPAIR_MIGRATION.version}')
`);
assert.equal(confirmationRows[0]?.migrations_recorded, true, "MIGRATION_HISTORY_CONFIRMATION_FAILED");
record("migration_history", "PASS", {
  migrations: [RPC_MIGRATION.version, REPAIR_MIGRATION.version],
});

console.log("PIPELINE STAGE RPC + TIMELINE DIGEST REPAIR: PASS");
console.log(`MIGRATION_VERSION=${REPAIR_MIGRATION.version}`);
console.log(`PROJECT_REF=${PROJECT_REF}`);
