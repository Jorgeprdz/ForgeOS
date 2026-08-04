import assert from 'node:assert/strict';
import { appendFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

const PROJECT_REF = 'rmlxigxysujsuwzgoimv';
const VERSION = '20260804000001';
const NAME = 'advisor_compensation_synthetic_acceptance';
const FILE = `supabase/migrations/${VERSION}_${NAME}.sql`;
const OUT = process.env.FORGE_BETA1022B_MIGRATION_EVIDENCE || 'artifacts/beta1-022b/migration.jsonl';
assert.equal(process.env.SUPABASE_PROJECT_REF, PROJECT_REF, 'SUPABASE_PROJECT_REF_MISMATCH');
assert.ok(process.env.SUPABASE_ACCESS_TOKEN, 'SUPABASE_ACCESS_TOKEN_MISSING');
mkdirSync(dirname(OUT), { recursive: true }); writeFileSync(OUT, '');
const record = (name, status, metadata = {}) => appendFileSync(OUT, `${JSON.stringify({ at: new Date().toISOString(), name, status, ...metadata })}\n`);

async function query(sql) {
  const response = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
    method: 'POST', headers: { Authorization: `Bearer ${process.env.SUPABASE_ACCESS_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: sql }),
  });
  const body = await response.json().catch(() => null);
  if (!response.ok || body?.error) throw new Error(`DATABASE_QUERY_REJECTED_${response.status}`);
  return Array.isArray(body?.result) ? body.result : Array.isArray(body) ? body : [];
}

const installed = (await query("select to_regprocedure('public.forge_advisor_compensation_accept_synthetic_evidence(jsonb)') is not null as ready"))[0]?.ready === true;
if (!installed) {
  const sql = readFileSync(FILE, 'utf8');
  assert.match(sql, /begin;[\s\S]*commit;\s*$/i);
  assert.doesNotMatch(sql, /\b(drop|truncate)\b|delete\s+from/i);
  await query(sql);
}
const check = (await query(`select
  to_regclass('public.advisor_compensation_synthetic_command_receipts') is not null as receipts,
  to_regprocedure('public.forge_advisor_compensation_accept_synthetic_evidence(jsonb)') is not null as command,
  (select relrowsecurity and relforcerowsecurity from pg_class where oid='public.advisor_compensation_synthetic_command_receipts'::regclass) as rls`))[0];
assert.deepEqual(check, { receipts: true, command: true, rls: true });
await query(`insert into supabase_migrations.schema_migrations(version,name,statements)
values ('${VERSION}','${NAME}',array['BETA1_022B additive governed synthetic acceptance']::text[])
on conflict(version) do nothing`);
record('migration', 'PASS', { version: VERSION, applied: !installed, ...check });
console.log('BETA1_022B_MIGRATION=PASS');
