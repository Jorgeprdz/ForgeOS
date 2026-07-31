import assert from "node:assert/strict";
import { appendFileSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";

const PROJECT_REF = "rmlxigxysujsuwzgoimv";
const MIGRATION_VERSION = "20260731000100";
const MIGRATION_NAME = "pipeline_prospect_journal";
const MIGRATION_FILE = `supabase/migrations/${MIGRATION_VERSION}_${MIGRATION_NAME}.sql`;
const EVIDENCE_DIR = "artifacts/pipeline-journal-migration";
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

const inventorySql = `
select
  to_regclass('public.prospects') is not null as prospects_exists,
  to_regclass('public.prospect_timeline_events') is not null as timeline_exists,
  exists (
    select 1
    from pg_index i
    where i.indrelid = to_regclass('public.prospects')
      and i.indisunique
      and (
        select array_agg(a.attname order by key_column.ordinality)
        from unnest(i.indkey) with ordinality as key_column(attnum, ordinality)
        join pg_attribute a
          on a.attrelid = i.indrelid
         and a.attnum = key_column.attnum
      ) = array['id', 'advisor_id']::name[]
  ) as prospects_owner_unique,
  exists (
    select 1 from pg_indexes
    where schemaname = 'public'
      and tablename = 'prospect_timeline_events'
      and indexname = 'prospect_timeline_events_idempotency_uq'
  ) as timeline_idempotency_unique,
  exists (
    select 1 from pg_constraint
    where conrelid = to_regclass('public.prospect_timeline_events')
      and pg_get_constraintdef(oid) like '%CONVERSATION_RECORDED%'
  ) as timeline_accepts_conversation,
  exists (
    select 1 from pg_constraint
    where conrelid = to_regclass('public.prospect_timeline_events')
      and pg_get_constraintdef(oid) like '%ADVISOR_DECLARATION%'
  ) as timeline_accepts_advisor_declaration,
  to_regclass('public.prospect_journal_entries') is not null as journal_exists,
  (
    select count(*) = 8
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'prospect_journal_entries'
      and column_name = any(array[
        'id','advisor_id','prospect_id','content','capture_method','source','created_at','created_by'
      ])
  ) as journal_columns_complete,
  exists (
    select 1 from pg_class
    where oid = to_regclass('public.prospect_journal_entries')
      and relrowsecurity
  ) as journal_rls,
  exists (
    select 1 from pg_trigger
    where tgrelid = to_regclass('public.prospect_journal_entries')
      and tgname = 'forge_pipeline_prospect_journal_append_only_guard'
      and tgenabled <> 'D'
  ) as journal_append_trigger,
  exists (
    select 1 from pg_trigger
    where tgrelid = to_regclass('public.prospect_journal_entries')
      and tgname = 'forge_pipeline_link_journal_to_timeline'
      and tgenabled <> 'D'
  ) as journal_timeline_trigger,
  exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'prospect_journal_entries'
      and policyname = 'prospect_journal_entries_select_own'
      and cmd = 'SELECT'
  ) as journal_select_policy,
  exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'prospect_journal_entries'
      and policyname = 'prospect_journal_entries_insert_own'
      and cmd = 'INSERT'
  ) as journal_insert_policy,
  not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'prospect_journal_entries'
      and cmd in ('UPDATE','DELETE','ALL')
  ) as journal_no_mutation_policy,
  exists (
    select 1 from information_schema.role_table_grants
    where table_schema = 'public'
      and table_name = 'prospect_journal_entries'
      and grantee = 'authenticated'
      and privilege_type = 'SELECT'
  ) as journal_select_grant,
  exists (
    select 1 from information_schema.role_table_grants
    where table_schema = 'public'
      and table_name = 'prospect_journal_entries'
      and grantee = 'authenticated'
      and privilege_type = 'INSERT'
  ) as journal_insert_grant,
  not exists (
    select 1 from information_schema.role_table_grants
    where table_schema = 'public'
      and table_name = 'prospect_journal_entries'
      and grantee in ('anon','authenticated')
      and privilege_type in ('UPDATE','DELETE','TRUNCATE','REFERENCES','TRIGGER')
  ) as journal_no_mutation_grant
`;

function journalComplete(row) {
  return [
    "journal_columns_complete",
    "journal_rls",
    "journal_append_trigger",
    "journal_timeline_trigger",
    "journal_select_policy",
    "journal_insert_policy",
    "journal_no_mutation_policy",
    "journal_select_grant",
    "journal_insert_grant",
    "journal_no_mutation_grant",
  ].every(key => row[key] === true);
}

const beforeRows = await query(inventorySql);
const before = beforeRows[0];
assert.ok(before, "PREDEPLOYMENT_INVENTORY_EMPTY");

for (const key of [
  "prospects_exists",
  "timeline_exists",
  "prospects_owner_unique",
  "timeline_idempotency_unique",
  "timeline_accepts_conversation",
  "timeline_accepts_advisor_declaration",
]) {
  assert.equal(before[key], true, `PREDEPLOYMENT_${key.toUpperCase()}_FAILED`);
}

if (before.journal_exists && !journalComplete(before)) {
  record("predeployment_inventory", "FAIL", {
    state: "PARTIAL",
    failedChecks: Object.entries(before)
      .filter(([key, value]) => key.startsWith("journal_") && key !== "journal_exists" && value !== true)
      .map(([key]) => key),
  });
  throw new Error("PARTIAL_PIPELINE_JOURNAL_REQUIRES_RECONCILIATION");
}

record("predeployment_inventory", "PASS", {
  state: before.journal_exists ? "COMPLETE" : "ABSENT",
  projectRef: PROJECT_REF,
});

if (!before.journal_exists) {
  const sql = readFileSync(MIGRATION_FILE, "utf8");
  assert.doesNotMatch(sql, /\b(?:drop\s+table|truncate)\b/i, "DESTRUCTIVE_SQL_REJECTED");
  assert.match(sql, /begin;[\s\S]*commit;/i, "TRANSACTION_BOUNDARY_REQUIRED");
  await query(sql);
  record("migration_applied", "PASS", { migration: MIGRATION_VERSION });
} else {
  record("migration_already_satisfied", "PASS", { migration: MIGRATION_VERSION });
}

const afterRows = await query(inventorySql);
const after = afterRows[0];
assert.ok(after, "POSTDEPLOYMENT_INVENTORY_EMPTY");
assert.equal(after.journal_exists, true, "POSTDEPLOYMENT_JOURNAL_MISSING");
assert.equal(journalComplete(after), true, "POSTDEPLOYMENT_JOURNAL_CONTRACT_FAILED");
record("postdeployment_security_inventory", "PASS", {
  projectRef: PROJECT_REF,
  checks: Object.keys(after).filter(key => key.startsWith("journal_")),
});

const historyRows = await query(`
select
  to_regclass('supabase_migrations.schema_migrations') is not null as history_exists,
  exists (
    select 1 from information_schema.columns
    where table_schema = 'supabase_migrations'
      and table_name = 'schema_migrations'
      and column_name = 'version'
  ) as has_version,
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
assert.equal(history?.has_version, true, "MIGRATION_HISTORY_VERSION_MISSING");

const columns = ["version"];
const values = [`'${MIGRATION_VERSION}'`];
if (history.has_name) {
  columns.push("name");
  values.push(`'${MIGRATION_NAME}'`);
}
if (history.has_statements) {
  columns.push("statements");
  values.push("array['Applied by ForgeOS guarded GitHub Actions migration gate']::text[]");
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

console.log("PIPELINE JOURNAL MIGRATION DEPLOYMENT: PASS");
console.log(`MIGRATION_VERSION=${MIGRATION_VERSION}`);
console.log(`PROJECT_REF=${PROJECT_REF}`);
