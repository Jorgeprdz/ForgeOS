import assert from 'node:assert/strict';
import { appendFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const PROJECT_REF = 'rmlxigxysujsuwzgoimv';
const ENDPOINT = `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`;
const MIGRATIONS = [
  ['20260807000100', 'activity_confirmation_mail_evidence'],
  ['20260807000110', 'activity_mail_oauth_connections'],
];
const DIR = 'artifacts/activity-mail-evidence-deployment';
const LEDGER = `${DIR}/ledger.jsonl`;

assert.equal(process.env.SUPABASE_PROJECT_REF, PROJECT_REF, 'PROJECT_REF_MISMATCH');
assert.ok(process.env.SUPABASE_ACCESS_TOKEN, 'SUPABASE_ACCESS_TOKEN_MISSING');
mkdirSync(DIR, { recursive: true });
writeFileSync(LEDGER, '');

const record = (name, status, detail = {}) => appendFileSync(LEDGER, `${JSON.stringify({ timestamp: new Date().toISOString(), name, status, ...detail })}\n`);
const redact = value => String(value || '').replace(/eyJ[A-Za-z0-9._-]+/g, '[REDACTED]').replace(/[A-Za-z0-9_-]{40,}/g, '[REDACTED]').slice(0, 500);

async function query(sql) {
  const response = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.SUPABASE_ACCESS_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: sql }),
  });
  const text = await response.text();
  let body;
  try { body = JSON.parse(text); } catch { body = { message: 'NON_JSON_RESPONSE' }; }
  if (!response.ok || body?.error) {
    const detail = redact(body?.message || body?.error || text || 'QUERY_REJECTED');
    record('database_query', 'FAIL', { httpStatus: response.status, detail });
    throw new Error(`DATABASE_QUERY_HTTP_${response.status}:${detail}`);
  }
  if (Array.isArray(body?.result)) return body.result;
  if (Array.isArray(body)) return body;
  return [];
}

async function migrationRecorded(version) {
  const rows = await query(`select exists (select 1 from supabase_migrations.schema_migrations where version='${version}') as recorded`);
  return rows[0]?.recorded === true;
}

async function recordMigration(version, name) {
  const columns = await query(`select column_name from information_schema.columns where table_schema='supabase_migrations' and table_name='schema_migrations'`);
  const names = new Set(columns.map(row => row.column_name));
  const cols = ['version'];
  const vals = [`'${version}'`];
  if (names.has('name')) { cols.push('name'); vals.push(`'${name}'`); }
  if (names.has('statements')) { cols.push('statements'); vals.push(`array['Applied by guarded Activity Mail Evidence deployment']::text[]`); }
  await query(`insert into supabase_migrations.schema_migrations (${cols.join(',')}) values (${vals.join(',')}) on conflict (version) do nothing`);
}

async function inventory() {
  const rows = await query(`
    select
      to_regclass('public.activity_metric_confirmations') is not null as confirmations_table,
      to_regclass('public.activity_mail_evidence_suggestions') is not null as suggestions_table,
      to_regclass('public.activity_mail_provider_connections') is not null as connections_table,
      to_regclass('public.activity_mail_oauth_states') is not null as oauth_states_table,
      to_regprocedure('public.forge_activity_confirm_daily_metrics(jsonb)') is not null as confirmations_rpc,
      to_regprocedure('public.forge_activity_record_mail_suggestion(jsonb)') is not null as suggestion_rpc,
      coalesce((select relrowsecurity from pg_class where oid=to_regclass('public.activity_metric_confirmations')), false) as confirmations_rls,
      coalesce((select relrowsecurity from pg_class where oid=to_regclass('public.activity_mail_evidence_suggestions')), false) as suggestions_rls,
      coalesce((select relrowsecurity from pg_class where oid=to_regclass('public.activity_mail_provider_connections')), false) as connections_rls,
      coalesce((select relrowsecurity from pg_class where oid=to_regclass('public.activity_mail_oauth_states')), false) as oauth_states_rls,
      not coalesce(has_table_privilege('authenticated','public.activity_mail_provider_connections','SELECT,INSERT,UPDATE,DELETE'), false) as connection_direct_access_blocked,
      not coalesce(has_table_privilege('authenticated','public.activity_mail_oauth_states','SELECT,INSERT,UPDATE,DELETE'), false) as oauth_state_direct_access_blocked
  `);
  return rows[0] || {};
}

const complete = row => [
  'confirmations_table','suggestions_table','connections_table','oauth_states_table',
  'confirmations_rpc','suggestion_rpc','confirmations_rls','suggestions_rls','connections_rls','oauth_states_rls',
  'connection_direct_access_blocked','oauth_state_direct_access_blocked',
].every(key => row[key] === true);

const before = await inventory();
const anyExists = ['confirmations_table','suggestions_table','connections_table','oauth_states_table'].some(key => before[key] === true);
const allRecorded = (await Promise.all(MIGRATIONS.map(([version]) => migrationRecorded(version)))).every(Boolean);
record('predeployment_inventory', 'PASS', { anyExists, complete: complete(before), allRecorded, projectRef: PROJECT_REF });

if (anyExists && !complete(before)) throw new Error('PARTIAL_ACTIVITY_MAIL_EVIDENCE_AUTHORITY_REQUIRES_RECONCILIATION');

if (!complete(before)) {
  for (const [version, name] of MIGRATIONS) {
    if (await migrationRecorded(version)) continue;
    const file = `supabase/migrations/${version}_${name}.sql`;
    const sql = readFileSync(file, 'utf8');
    assert.match(sql, /begin;[\s\S]*commit;/i, `${version}:TRANSACTION_BOUNDARY_REQUIRED`);
    assert.doesNotMatch(sql, /\b(?:drop\s+table|truncate)\b/i, `${version}:DESTRUCTIVE_SQL_REJECTED`);
    await query(sql);
    await recordMigration(version, name);
    record('migration_applied', 'PASS', { version, name });
  }
} else if (!allRecorded) {
  for (const [version, name] of MIGRATIONS) if (!(await migrationRecorded(version))) await recordMigration(version, name);
  record('migration_history_reconciled', 'PASS');
}

const after = await inventory();
assert.equal(complete(after), true, 'POSTDEPLOYMENT_AUTHORITY_INCOMPLETE');
for (const [version] of MIGRATIONS) assert.equal(await migrationRecorded(version), true, `MIGRATION_HISTORY_MISSING_${version}`);
record('postdeployment_inventory', 'PASS', { complete: true, migrations: MIGRATIONS.map(([version]) => version) });
console.log('ACTIVITY_MAIL_EVIDENCE_REMOTE_DEPLOYMENT=PASS');
