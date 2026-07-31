import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const PROJECT_REF = 'rmlxigxysujsuwzgoimv';
const VERSION = '20260731000228';
const NAME = 'cartera020b_conflict_insert_ambiguity_hardening';
const PATH = 'supabase/migrations/20260731000228_cartera020b_conflict_insert_ambiguity_hardening.sql';
const ARTIFACT_DIR = 'artifacts/cartera-020b-remote-acceptance';
const LOG_PATH = `${ARTIFACT_DIR}/conflict-ambiguity-hardening.log`;

assert.equal(process.env.SUPABASE_PROJECT_REF, PROJECT_REF, 'SUPABASE_PROJECT_REF_MISMATCH');
assert.ok(process.env.SUPABASE_ACCESS_TOKEN, 'SUPABASE_ACCESS_TOKEN_MISSING');

const endpoint = `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`;
const logLines = [];

function log(message) {
  const safe = String(message).replace(/sbp_[A-Za-z0-9_-]+/g, '[REDACTED]');
  logLines.push(safe);
  console.log(safe);
}

function sqlLiteral(value) {
  return `'${String(value).replaceAll("'", "''")}'`;
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
  try {
    body = JSON.parse(text);
  } catch {
    body = { message: 'NON_JSON_RESPONSE' };
  }
  if (!response.ok || body?.error) {
    const detail = String(body?.message ?? body?.error ?? 'QUERY_REJECTED')
      .replace(/sbp_[A-Za-z0-9_-]+/g, '[REDACTED]')
      .slice(0, 1600);
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
    `select column_name
       from information_schema.columns
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
      where version = ${sqlLiteral(VERSION)}
      limit 1`,
    'READ_020B_CONFLICT_AMBIGUITY_MIGRATION',
  );
  return rows[0] ?? null;
}

function historyInsert(sql, columns) {
  const names = ['version'];
  const values = [sqlLiteral(VERSION)];
  if (columns.has('name')) {
    names.push('name');
    values.push(sqlLiteral(NAME));
  }
  if (columns.has('statements')) {
    names.push('statements');
    values.push(`array[${sqlLiteral(sql)}]::text[]`);
  }
  return `insert into supabase_migrations.schema_migrations (${names.join(', ')})
values (${values.join(', ')})
on conflict (version) do nothing;`;
}

async function main() {
  mkdirSync(ARTIFACT_DIR, { recursive: true });
  const raw = readFileSync(PATH, 'utf8');
  const localHash = sha256(raw);
  const existing = await readMigration();

  if (existing) {
    const stored = Array.isArray(existing.statements)
      ? `${existing.statements.join('\n\n').trim()}\n`
      : typeof existing.statements === 'string'
        ? `${existing.statements.trim()}\n`
        : null;
    if (stored) {
      assert.equal(sha256(stored), localHash, 'CARTERA020B_CONFLICT_AMBIGUITY_REMOTE_CONTENT_MISMATCH');
    }
    log('MIGRATION_20260731000228=ALREADY_APPLIED_AND_MATCHED');
  } else {
    const columns = await migrationColumns();
    const body = stripOuterTransaction(raw);
    await query(
      `begin;\n${body}\n${historyInsert(raw, columns)}\ncommit;`,
      'APPLY_020B_CONFLICT_AMBIGUITY_HARDENING',
    );
    assert.ok(await readMigration(), 'CARTERA020B_CONFLICT_AMBIGUITY_HISTORY_NOT_RECORDED');
    log('MIGRATION_20260731000228=APPLIED');
  }

  const rows = await query(
    `select pg_get_functiondef(
       'public.forge_cartera020b_existing_receipt_response(uuid,text,text,text)'::regprocedure
     ) like '%on conflict on constraint%cartera020b_command_conflicts_advisor_id_conflict_reference_key%' as hardened`,
    'VERIFY_020B_CONFLICT_AMBIGUITY_HARDENING',
  );
  assert.equal(rows[0]?.hardened, true, 'CARTERA020B_CONFLICT_AMBIGUITY_HARDENING_NOT_ACTIVE');
  log('CARTERA020B_CONFLICT_INSERT_AMBIGUITY_HARDENING=PASS');
}

try {
  await main();
} catch (error) {
  log(`CARTERA020B_CONFLICT_INSERT_AMBIGUITY_HARDENING=FAIL:${String(error?.message ?? error)}`);
  process.exitCode = 1;
} finally {
  mkdirSync(ARTIFACT_DIR, { recursive: true });
  writeFileSync(LOG_PATH, `${logLines.join('\n')}\n`, 'utf8');
}
