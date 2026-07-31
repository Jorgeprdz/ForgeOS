import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const PROJECT_REF = 'rmlxigxysujsuwzgoimv';
const VERSION = '20260731000240';
const NAME = 'cartera020c_conflict_constraint_name_hardening';
const PATH = 'supabase/migrations/20260731000240_cartera020c_conflict_constraint_name_hardening.sql';
const ARTIFACT_DIR = 'artifacts/cartera-020c-remote-acceptance';
const LOG_PATH = `${ARTIFACT_DIR}/conflict-constraint-name-hardening.log`;

assert.equal(process.env.SUPABASE_PROJECT_REF, PROJECT_REF, 'SUPABASE_PROJECT_REF_MISMATCH');
assert.equal(
  process.env.CARTERA_020C_REMOTE_MUTATION_AUTHORIZED,
  'YES:CARTERA_020C_REMOTE_MUTATION',
  'CARTERA020C_REMOTE_MUTATION_NOT_AUTHORIZED',
);
assert.ok(process.env.SUPABASE_ACCESS_TOKEN, 'SUPABASE_ACCESS_TOKEN_MISSING');

const endpoint = `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`;
const logLines = [];

function log(message) {
  const safe = String(message)
    .replace(/sbp_[A-Za-z0-9_-]+/g, '[REDACTED]')
    .replace(/Bearer\s+[A-Za-z0-9._-]+/gi, 'Bearer [REDACTED]');
  logLines.push(safe);
  console.log(safe);
}

function sqlLiteral(value) {
  return `'${String(value).replaceAll("'", "''")}'`;
}

function normalize(value) {
  return `${String(value).replace(/\r\n/g, '\n').trim()}\n`;
}

function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

async function query(sql, label) {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.SUPABASE_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: sql }),
  });
  const text = await response.text();
  let body;
  try { body = JSON.parse(text); } catch { body = { message: 'NON_JSON_RESPONSE' }; }
  if (!response.ok || body?.error) {
    const detail = String(body?.message ?? body?.error ?? 'QUERY_REJECTED')
      .replace(/sbp_[A-Za-z0-9_-]+/g, '[REDACTED]')
      .slice(0, 1800);
    throw new Error(`${label}_HTTP_${response.status}:${detail}`);
  }
  if (Array.isArray(body?.result)) return body.result;
  if (Array.isArray(body)) return body;
  return [];
}

function stripOuterTransaction(sql) {
  const lines = sql.replace(/\r\n/g, '\n').split('\n');
  const meaningful = lines
    .map((line, index) => ({ line: line.trim(), index }))
    .filter(({ line }) => line && !line.startsWith('--'));
  assert.match(meaningful[0].line, /^begin\s*;$/i, 'MISSING_OUTER_BEGIN');
  assert.match(meaningful.at(-1).line, /^commit\s*;$/i, 'MISSING_OUTER_COMMIT');
  return lines.slice(meaningful[0].index + 1, meaningful.at(-1).index).join('\n').trim();
}

async function migrationColumns() {
  const rows = await query(
    `select column_name from information_schema.columns
      where table_schema = 'supabase_migrations'
        and table_name = 'schema_migrations'`,
    'READ_MIGRATION_COLUMNS',
  );
  return new Set(rows.map((row) => row.column_name));
}

async function readMigration() {
  const rows = await query(
    `select version, name, statements
       from supabase_migrations.schema_migrations
      where version = ${sqlLiteral(VERSION)} limit 1`,
    'READ_CONSTRAINT_NAME_HARDENING_MIGRATION',
  );
  return rows[0] ?? null;
}

function historyInsert(raw, columns) {
  const names = ['version'];
  const values = [sqlLiteral(VERSION)];
  if (columns.has('name')) {
    names.push('name');
    values.push(sqlLiteral(NAME));
  }
  if (columns.has('statements')) {
    names.push('statements');
    values.push(`array[${sqlLiteral(normalize(raw))}]::text[]`);
  }
  return `insert into supabase_migrations.schema_migrations (${names.join(', ')})
values (${values.join(', ')}) on conflict (version) do nothing;`;
}

async function main() {
  mkdirSync(ARTIFACT_DIR, { recursive: true });
  const raw = readFileSync(PATH, 'utf8');
  const canonical = normalize(raw);
  const localHash = sha256(canonical);
  const existing = await readMigration();

  if (existing) {
    const stored = Array.isArray(existing.statements)
      ? normalize(existing.statements.join('\n\n'))
      : typeof existing.statements === 'string'
        ? normalize(existing.statements)
        : null;
    if (stored) assert.equal(sha256(stored), localHash, 'CARTERA020C_CONSTRAINT_NAME_REMOTE_CONTENT_MISMATCH');
    log('MIGRATION_20260731000240=ALREADY_APPLIED_AND_MATCHED');
  } else {
    const columns = await migrationColumns();
    await query(
      `begin;\n${stripOuterTransaction(raw)}\n${historyInsert(raw, columns)}\ncommit;`,
      'APPLY_CARTERA020C_CONSTRAINT_NAME_HARDENING',
    );
    assert.ok(await readMigration(), 'CARTERA020C_CONSTRAINT_NAME_HISTORY_NOT_RECORDED');
    log('MIGRATION_20260731000240=APPLIED');
  }

  const rows = await query(
    `select
       exists (
         select 1
         from pg_constraint c
         join pg_class t on t.oid = c.conrelid
         join pg_namespace n on n.oid = t.relnamespace
         where n.nspname = 'public'
           and t.relname = 'cartera020c_confirmation_conflicts'
           and c.conname = 'cartera020c_conflict_reference_uq'
       ) as stable_constraint_exists,
       pg_get_functiondef(
         'public.forge_cartera020c_record_conflict(uuid,text,text,text,text,text,text,timestamp with time zone)'::regprocedure
       ) as definition`,
    'VERIFY_CARTERA020C_CONSTRAINT_NAME_HARDENING',
  );
  assert.equal(rows[0]?.stable_constraint_exists, true, 'STABLE_CONFLICT_CONSTRAINT_NOT_FOUND');
  const definition = String(rows[0]?.definition ?? '');
  assert.match(definition, /on conflict on constraint cartera020c_conflict_reference_uq do nothing/i);
  assert.match(definition, /generated_conflict_reference/);
  log('CARTERA020C_CONFLICT_CONSTRAINT_NAME_HARDENING=PASS');
}

try {
  await main();
} catch (error) {
  log(`CARTERA020C_CONFLICT_CONSTRAINT_NAME_HARDENING=FAIL:${String(error?.message ?? error)}`);
  process.exitCode = 1;
} finally {
  mkdirSync(ARTIFACT_DIR, { recursive: true });
  writeFileSync(LOG_PATH, `${logLines.join('\n')}\n`, 'utf8');
}
