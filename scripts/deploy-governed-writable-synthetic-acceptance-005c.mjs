import assert from 'node:assert/strict';
import { appendFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const PROJECT_REF = 'rmlxigxysujsuwzgoimv';
const VERSION = '20260809010000';
const NAME = 'governed_writable_synthetic_acceptance_005c';
const FILE = `supabase/migrations/${VERSION}_${NAME}.sql`;
const ENDPOINT = `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`;
const OUT = 'artifacts/writable-synthetic-acceptance-005c/migration-ledger.jsonl';

assert.equal(process.env.SUPABASE_PROJECT_REF, PROJECT_REF, 'PROJECT_REF_MISMATCH');
assert.ok(process.env.SUPABASE_ACCESS_TOKEN, 'SUPABASE_ACCESS_TOKEN_MISSING');
mkdirSync('artifacts/writable-synthetic-acceptance-005c', { recursive: true });
writeFileSync(OUT, '');
const record = (name, status, metadata = {}) => appendFileSync(
  OUT,
  `${JSON.stringify({ at: new Date().toISOString(), name, status, ...metadata })}\n`,
);

async function query(sql) {
  const response = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.SUPABASE_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: sql }),
  });
  const text = await response.text();
  if (!response.ok) throw new Error(`DATABASE_QUERY_HTTP_${response.status}`);
  const body = JSON.parse(text);
  if (body?.error) throw new Error('DATABASE_QUERY_REJECTED');
  return Array.isArray(body?.result) ? body.result : Array.isArray(body) ? body : [];
}

const readinessQuery = `
select
  exists (
    select 1 from information_schema.columns
    where table_schema='public' and table_name='forge_demo_advisors' and column_name='is_acceptance'
  ) as is_acceptance,
  exists (
    select 1 from information_schema.columns
    where table_schema='public' and table_name='forge_demo_advisors' and column_name='acceptance_purpose'
  ) as acceptance_purpose,
  exists (
    select 1 from information_schema.columns
    where table_schema='public' and table_name='forge_demo_advisors' and column_name='expires_at'
  ) as expires_at`;

const current = (await query(readinessQuery))[0] || {};
const installed = current.is_acceptance === true && current.acceptance_purpose === true && current.expires_at === true;
if (!installed) {
  const sql = readFileSync(FILE, 'utf8');
  assert.match(sql, /begin;[\s\S]*commit;/i);
  assert.match(sql, /add column if not exists is_acceptance/i);
  assert.match(sql, /expires_at\s*<=\s*now\(\)/i);
  assert.doesNotMatch(sql, /drop\s+(table|schema)|truncate|delete\s+from|disable\s+row\s+level\s+security/i);
  assert.doesNotMatch(sql, /grant\s+.*\s+to\s+(anon|public)/i);
  await query(sql);
  record('acceptance_lifecycle_migration', 'PASS', { applied: true, version: VERSION });
} else {
  record('acceptance_lifecycle_migration', 'PASS', { applied: false, version: VERSION });
}

const ready = (await query(readinessQuery))[0] || {};
assert.equal(ready.is_acceptance, true, 'IS_ACCEPTANCE_COLUMN_MISSING');
assert.equal(ready.acceptance_purpose, true, 'ACCEPTANCE_PURPOSE_COLUMN_MISSING');
assert.equal(ready.expires_at, true, 'EXPIRES_AT_COLUMN_MISSING');

await query(`insert into supabase_migrations.schema_migrations (version, name, statements)
values ('${VERSION}', '${NAME}', array['Applied by governed writable synthetic acceptance 005C control plane']::text[])
on conflict (version) do nothing`);
record('migration_history', 'PASS', { version: VERSION });
console.log('005C_ACCEPTANCE_LIFECYCLE_MIGRATION=PASS');
