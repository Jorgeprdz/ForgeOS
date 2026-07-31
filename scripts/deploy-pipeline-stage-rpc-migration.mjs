import assert from "node:assert/strict";
import { appendFileSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";

const PROJECT_REF = "rmlxigxysujsuwzgoimv";
const MIGRATION_VERSION = "20260731000200";
const MIGRATION_NAME = "pipeline_prospect_stage_rpc";
const MIGRATION_FILE = `supabase/migrations/${MIGRATION_VERSION}_${MIGRATION_NAME}.sql`;
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

const migrationSql = readFileSync(MIGRATION_FILE, "utf8");
assert.doesNotMatch(migrationSql, /\b(?:drop\s+table|truncate)\b/i, "DESTRUCTIVE_SQL_REJECTED");
assert.match(migrationSql, /begin;[\s\S]*commit;/i, "TRANSACTION_BOUNDARY_REQUIRED");
assert.match(migrationSql, /security definer/i, "SECURITY_DEFINER_REQUIRED");
assert.match(migrationSql, /actor_id := auth\.uid\(\)/, "AUTH_UID_REQUIRED");
assert.match(migrationSql, /advisor_id = actor_id/, "OWNER_FILTER_REQUIRED");

const beforeRows = await query(`
select
  to_regclass('public.prospects') is not null as prospects_exists,
  to_regprocedure('public.forge_pipeline_update_prospect_stage(uuid,text)') is not null as rpc_exists,
  exists (
    select 1
    from information_schema.role_table_grants
    where table_schema = 'public'
      and table_name = 'prospects'
      and grantee = 'authenticated'
      and privilege_type in ('SELECT','UPDATE')
  ) as prospects_authenticated_access,
  exists (
    select 1
    from public.prospects
    where archived_at is null
  ) as active_prospect_exists
`);
const before = beforeRows[0];
assert.equal(before?.prospects_exists, true, "PROSPECTS_TABLE_MISSING");
assert.equal(before?.active_prospect_exists, true, "ACTIVE_PROSPECT_REQUIRED_FOR_ROLLBACK_ACCEPTANCE");
record("predeployment_inventory", "PASS", {
  rpcState: before.rpc_exists ? "PRESENT" : "ABSENT",
  activeProspectAvailable: true,
});

await query(migrationSql);
record("migration_applied", "PASS", { migration: MIGRATION_VERSION });

const contractRows = await query(`
select
  to_regprocedure('public.forge_pipeline_update_prospect_stage(uuid,text)') is not null as rpc_exists,
  coalesce((
    select p.prosecdef
    from pg_proc p
    where p.oid = to_regprocedure('public.forge_pipeline_update_prospect_stage(uuid,text)')
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
  )) > 0 as excludes_archived
`);
const contract = contractRows[0];
for (const [key, value] of Object.entries(contract || {})) {
  assert.equal(value, true, `POSTDEPLOYMENT_${key.toUpperCase()}_FAILED`);
}
record("postdeployment_security_inventory", "PASS", {
  checks: Object.keys(contract || {}),
});

const targetRows = await query(`
select id, advisor_id, status
from public.prospects
where archived_at is null
order by created_at desc
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
end;
$acceptance$;
rollback;
select true as rollback_acceptance;
`);

const rollbackRows = await query(`
select status = ${text(target.status)} as original_status_preserved
from public.prospects
where id = ${uuid(target.id)}
`);
assert.equal(rollbackRows[0]?.original_status_preserved, true, "ROLLBACK_DID_NOT_PRESERVE_ORIGINAL_STATUS");
record("authenticated_rollback_acceptance", "PASS", {
  mutationPersisted: false,
  originalStatusPreserved: true,
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
const columns = ["version"];
const values = [`'${MIGRATION_VERSION}'`];
if (history.has_name) {
  columns.push("name");
  values.push(`'${MIGRATION_NAME}'`);
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
const confirmationRows = await query(`
select exists (
  select 1 from supabase_migrations.schema_migrations
  where version = '${MIGRATION_VERSION}'
) as migration_recorded
`);
assert.equal(confirmationRows[0]?.migration_recorded, true, "MIGRATION_HISTORY_CONFIRMATION_FAILED");
record("migration_history", "PASS", { migration: MIGRATION_VERSION });

console.log("PIPELINE STAGE RPC MIGRATION: PASS");
console.log(`MIGRATION_VERSION=${MIGRATION_VERSION}`);
console.log(`PROJECT_REF=${PROJECT_REF}`);
