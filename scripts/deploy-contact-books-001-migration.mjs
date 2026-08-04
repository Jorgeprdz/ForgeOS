import assert from 'node:assert/strict';
import { appendFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

const PROJECT_REF = 'rmlxigxysujsuwzgoimv';
const VERSION = '20260803000002';
const NAME = 'contact_books_productive_authority';
const FILE = `supabase/migrations/${VERSION}_${NAME}.sql`;
const OUT = process.env.FORGE_CONTACT_BOOKS_MIGRATION_EVIDENCE || 'artifacts/contact-books-001/migration-ledger.jsonl';
const ENDPOINT = `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`;

assert.equal(process.env.SUPABASE_PROJECT_REF, PROJECT_REF);
assert.ok(process.env.SUPABASE_ACCESS_TOKEN, 'SUPABASE_ACCESS_TOKEN_MISSING');
mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, '');
const record = (name, status, metadata = {}) => appendFileSync(OUT, `${JSON.stringify({ at: new Date().toISOString(), name, status, ...metadata })}\n`);

async function query(sql) {
  const response = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.SUPABASE_ACCESS_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: sql }),
  });
  const body = await response.json().catch(() => null);
  if (!response.ok || body?.error) throw new Error(`DATABASE_QUERY_REJECTED_${response.status}`);
  return Array.isArray(body?.result) ? body.result : Array.isArray(body) ? body : [];
}

const installed = (await query("select to_regprocedure('public.forge_contact_books_create(jsonb)') is not null as ready"))[0]?.ready === true;
if (!installed) {
  const sql = readFileSync(FILE, 'utf8');
  assert.match(sql, /^-- CONTACT_BOOKS_001[\s\S]*begin;[\s\S]*commit;\s*$/i);
  assert.doesNotMatch(sql, /\b(drop|truncate)\b|delete\s+from/i);
  await query(sql);
  record('contact_books_migration', 'PASS', { applied: true, version: VERSION });
} else {
  record('contact_books_migration', 'PASS', { applied: false, version: VERSION });
}

const checks = await query(`select
  to_regclass('public.contact_books') is not null as books,
  to_regclass('public.contact_book_memberships') is not null as memberships,
  to_regprocedure('public.forge_contact_books_move_members(jsonb)') is not null as atomic_move,
  (select relrowsecurity and relforcerowsecurity from pg_class where oid='public.contact_books'::regclass) as books_rls,
  (select relrowsecurity and relforcerowsecurity from pg_class where oid='public.contact_book_memberships'::regclass) as memberships_rls`);
assert.deepEqual(checks[0], { books: true, memberships: true, atomic_move: true, books_rls: true, memberships_rls: true });
await query(`insert into supabase_migrations.schema_migrations (version,name,statements)
values ('${VERSION}','${NAME}',array['CONTACT_BOOKS_001 controlled migration']::text[])
on conflict (version) do nothing`);
record('migration_contract', 'PASS', { version: VERSION, ...checks[0] });
console.log('CONTACT_BOOKS_001_MIGRATION=PASS');
