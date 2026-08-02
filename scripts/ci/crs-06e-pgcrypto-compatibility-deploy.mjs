import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const PROJECT_REF = "rmlxigxysujsuwzgoimv";
const ENDPOINT = `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`;
const mode = process.argv[2];

const deployments = mode === "prepare"
  ? [
      {
        version: "20260801000598",
        name: "crs06_pgcrypto_digest_compatibility",
        path: "supabase/migrations/20260801000598_crs06_pgcrypto_digest_compatibility.sql",
        maySkipWhenCoreExists: true,
      },
      {
        version: "20260801000604",
        name: "crs06_internal_function_grant_hardening",
        path: "supabase/migrations/20260801000604_crs06_internal_function_grant_hardening.sql",
        maySkipWhenCoreExists: false,
      },
    ]
  : mode === "retire"
    ? [
        {
          version: "20260801000603",
          name: "crs06_pgcrypto_digest_schema_hardening",
          path: "supabase/migrations/20260801000603_crs06_pgcrypto_digest_schema_hardening.sql",
          maySkipWhenCoreExists: false,
        },
      ]
    : null;

assert.ok(deployments, "CRS06E_PGCRYPTO_MODE_MUST_BE_PREPARE_OR_RETIRE");
assert.equal(process.env.SUPABASE_PROJECT_REF, PROJECT_REF, "CRS06E_PROJECT_REF_MISMATCH");
assert.ok(process.env.SUPABASE_ACCESS_TOKEN, "CRS06E_SUPABASE_ACCESS_TOKEN_MISSING");

function redact(value) {
  return String(value || "")
    .replace(/eyJ[A-Za-z0-9._-]+/g, "[REDACTED]")
    .replace(/[A-Za-z0-9_-]{40,}/g, "[REDACTED]")
    .slice(0, 900);
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
    throw new Error(`CRS06E_PGCRYPTO_QUERY_HTTP_${response.status}:${redact(body?.message || body?.error || text)}`);
  }
  if (Array.isArray(body?.result)) return body.result;
  if (Array.isArray(body)) return body;
  return [];
}

const literal = value => `'${String(value).replaceAll("'", "''")}'`;

const extensionRows = await query(`
select n.nspname as digest_schema
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where p.proname = 'digest'
  and pg_get_function_identity_arguments(p.oid) = 'bytea, text'
order by case when n.nspname = 'extensions' then 0 else 1 end, n.nspname
limit 1
`);
assert.equal(extensionRows[0]?.digest_schema, "extensions", "CRS06E_PGCRYPTO_EXTENSIONS_SCHEMA_REQUIRED");

const historyShape = (await query(`
select
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
  ) as has_statements,
  exists (
    select 1 from supabase_migrations.schema_migrations
    where version = '20260801000600'
  ) as core_application_migration_recorded
`))[0];

async function isRecorded(version) {
  const rows = await query(`
select exists (
  select 1 from supabase_migrations.schema_migrations
  where version = ${literal(version)}
) as recorded
`);
  return rows[0]?.recorded === true;
}

async function recordMigration(deployment) {
  const columns = ["version"];
  const values = [literal(deployment.version)];
  if (historyShape?.has_name) {
    columns.push("name");
    values.push(literal(deployment.name));
  }
  if (historyShape?.has_statements) {
    columns.push("statements");
    values.push(`array[${literal(`Applied by guarded CRS 06E ${mode} gate`)}]::text[]`);
  }
  await query(`
insert into supabase_migrations.schema_migrations (${columns.join(", ")})
values (${values.join(", ")})
on conflict (version) do nothing
`);
}

for (const deployment of deployments) {
  const alreadyRecorded = await isRecorded(deployment.version);
  const skipBecauseCoreExists = mode === "prepare"
    && deployment.maySkipWhenCoreExists
    && historyShape?.core_application_migration_recorded === true;

  if (!alreadyRecorded && !skipBecauseCoreExists) {
    const sql = readFileSync(deployment.path, "utf8");
    assert.match(sql, /begin;[\s\S]*commit;/i, `CRS06E_TRANSACTION_REQUIRED_${deployment.version}`);
    assert.doesNotMatch(sql, /\b(?:drop\s+table|truncate\s+table)\b/i, `CRS06E_DESTRUCTIVE_SQL_${deployment.version}`);
    await query(sql);
    await recordMigration(deployment);
  }

  if (!skipBecauseCoreExists) {
    assert.equal(await isRecorded(deployment.version), true, `CRS06E_HISTORY_${deployment.version}_MISSING`);
  }
}

const confirmation = (await query(`
select
  exists (
    select 1 from supabase_migrations.schema_migrations
    where version = '20260801000598'
  ) as compatibility_history_recorded,
  exists (
    select 1 from supabase_migrations.schema_migrations
    where version = '20260801000600'
  ) as core_application_migration_recorded,
  exists (
    select 1 from supabase_migrations.schema_migrations
    where version = '20260801000603'
  ) as retirement_history_recorded,
  exists (
    select 1 from supabase_migrations.schema_migrations
    where version = '20260801000604'
  ) as internal_grant_history_recorded,
  to_regprocedure('public.digest(bytea,text)') is not null as public_digest_wrapper,
  to_regprocedure('public.forge_crs06_event_digest(jsonb)') is not null as application_digest_authority,
  coalesce((
    select pg_get_functiondef(to_regprocedure('public.forge_crs06_event_digest(jsonb)'))
      like '%extensions.digest%'
  ), false) as application_digest_bound_to_extensions,
  not exists (
    select 1
    from information_schema.routine_privileges
    where routine_schema = 'public'
      and routine_name in (
        'forge_crs06_valid_reference_array',
        'forge_crs06_event_digest',
        'forge_crs06_deny_append_only_mutation'
      )
      and grantee in ('PUBLIC','anon','authenticated')
      and privilege_type = 'EXECUTE'
  ) as internal_functions_owner_only
`))[0];

if (mode === "prepare") {
  assert.equal(confirmation?.internal_grant_history_recorded, true, "CRS06E_INTERNAL_GRANT_HISTORY_MISSING");
  assert.equal(confirmation?.internal_functions_owner_only, true, "CRS06E_INTERNAL_FUNCTION_GRANTS_NOT_HARDENED");
  if (confirmation?.core_application_migration_recorded !== true) {
    assert.equal(confirmation?.compatibility_history_recorded, true, "CRS06E_PGCRYPTO_HISTORY_MISSING");
    assert.equal(confirmation?.public_digest_wrapper, true, "CRS06E_TEMPORARY_DIGEST_WRAPPER_MISSING");
  }
  console.log("CRS_06E_PGCRYPTO_COMPATIBILITY_PREPARED=PASS");
  console.log("CRS_06E_INTERNAL_FUNCTION_GRANT_HARDENING=PASS");
} else {
  assert.equal(confirmation?.retirement_history_recorded, true, "CRS06E_PGCRYPTO_RETIREMENT_HISTORY_MISSING");
  assert.equal(confirmation?.public_digest_wrapper, false, "CRS06E_TEMPORARY_DIGEST_WRAPPER_NOT_RETIRED");
  assert.equal(confirmation?.application_digest_authority, true, "CRS06E_APPLICATION_DIGEST_AUTHORITY_MISSING");
  assert.equal(confirmation?.application_digest_bound_to_extensions, true, "CRS06E_APPLICATION_DIGEST_NOT_BOUND_TO_EXTENSIONS");
  assert.equal(confirmation?.internal_functions_owner_only, true, "CRS06E_INTERNAL_FUNCTION_GRANTS_REGRESSED");
  console.log("CRS_06E_PGCRYPTO_COMPATIBILITY_RETIRED=PASS");
}

console.log(`CRS_06E_CORE_APPLICATION_MIGRATION_RECORDED=${confirmation?.core_application_migration_recorded ? "YES" : "NO"}`);
console.log(`CRS_06E_INTERNAL_GRANTS_OWNER_ONLY=${confirmation?.internal_functions_owner_only ? "YES" : "NO"}`);
