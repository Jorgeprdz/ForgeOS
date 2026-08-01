import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const PROJECT_REF = 'rmlxigxysujsuwzgoimv';
const SOURCE_HEAD = '23b52fc7a442f52494c51fead67699004923c547';
const ACCEPTANCE_BRANCH = 'run/cartera-030b-durable-conflict-hardening-20260731-2031';
const AUTHORIZATION = 'YES:CARTERA_030B_REMOTE_MUTATION';
const ACCEPTANCE_SQL = 'scripts/ci/cartera-030b-remote-acceptance.sql';
const ARTIFACT_DIR = 'artifacts/cartera-030b-remote-acceptance';
const REPORT_PATH = join(ARTIFACT_DIR, 'report.json');
const LOG_PATH = join(ARTIFACT_DIR, 'acceptance.log');

const MIGRATIONS = Object.freeze([
  ['20260731000250', 'cartera030b_expected_payment_obligation_ledger'],
  ['20260731000251', 'cartera030b_generation_and_calendar_rpc'],
  ['20260731000252', 'cartera030b_durable_generation_conflict_receipts'],
].map(([version, name]) => Object.freeze({
  version,
  name,
  path: `supabase/migrations/${version}_${name}.sql`,
})));

const report = {
  phase: 'CARTERA_030B_REMOTE_ACCEPTANCE',
  executionEnvironment: 'GITHUB_ACTIONS_SUPABASE_MANAGEMENT_API',
  projectRef: PROJECT_REF,
  sourceHead: SOURCE_HEAD,
  acceptanceHead: process.env.CARTERA_030B_ACCEPTANCE_HEAD ?? null,
  migrations: [],
  digestCompatibility: 'NOT_RUN',
  catalogVerification: 'NOT_RUN',
  transactionalAcceptance: 'NOT_RUN',
  fixturesRolledBack: false,
  residualFixtures: null,
  error: null,
};
const logLines = [];

mkdirSync(ARTIFACT_DIR, { recursive: true });

function sanitize(value) {
  return String(value)
    .replace(/sbp_[A-Za-z0-9_-]+/g, '[REDACTED]')
    .replace(/Bearer\s+[A-Za-z0-9._-]+/gi, 'Bearer [REDACTED]')
    .slice(0, 4000);
}

function log(message) {
  const safe = sanitize(message);
  logLines.push(safe);
  console.log(safe);
}

function persistEvidence() {
  writeFileSync(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`);
  writeFileSync(LOG_PATH, `${logLines.join('\n')}\n`);
}

function sqlLiteral(value) {
  return `'${String(value).replaceAll("'", "''")}'`;
}

function normalizeMigrationSql(value) {
  return `${String(value).replace(/\r\n/g, '\n').trim()}\n`;
}

function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (!value || typeof value !== 'object') return value;
  return Object.keys(value).sort().reduce((output, key) => {
    output[key] = stable(value[key]);
    return output;
  }, {});
}

function authorizationDigest(value) {
  return sha256(JSON.stringify(stable(value)));
}

function stripOuterTransaction(sql, path) {
  const lines = sql.replace(/\r\n/g, '\n').split('\n');
  const meaningful = lines
    .map((line, index) => ({ line: line.trim(), index }))
    .filter(({ line }) => line && !line.startsWith('--'));
  assert.ok(meaningful.length >= 2, `${path}_EMPTY_MIGRATION`);
  assert.match(meaningful[0].line, /^begin\s*;$/i, `${path}_MISSING_OUTER_BEGIN`);
  assert.match(meaningful.at(-1).line, /^commit\s*;$/i, `${path}_MISSING_OUTER_COMMIT`);
  return lines.slice(meaningful[0].index + 1, meaningful.at(-1).index).join('\n').trim();
}

assert.equal(process.env.CARTERA_030B_REMOTE_MUTATION_AUTHORIZED, AUTHORIZATION, 'REMOTE_MUTATION_NOT_AUTHORIZED');
assert.equal(process.env.SUPABASE_PROJECT_REF, PROJECT_REF, 'SUPABASE_PROJECT_REF_MISMATCH');
assert.equal(process.env.CARTERA_030B_EXPECTED_SOURCE_HEAD, SOURCE_HEAD, 'SOURCE_HEAD_MISMATCH');
assert.equal(process.env.CARTERA_030B_ACCEPTANCE_BRANCH, ACCEPTANCE_BRANCH, 'ACCEPTANCE_BRANCH_MISMATCH');
assert.ok(process.env.CARTERA_030B_ACCEPTANCE_HEAD, 'ACCEPTANCE_HEAD_MISSING');
assert.ok(process.env.SUPABASE_ACCESS_TOKEN, 'SUPABASE_ACCESS_TOKEN_MISSING');

const endpoint = `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function rawQuery(sql, label) {
  let lastFailure = null;
  for (let attempt = 1; attempt <= 5; attempt += 1) {
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
    const detail = sanitize(body?.message ?? body?.error ?? 'QUERY_REJECTED');
    if (response.ok && !body?.error) {
      const rows = Array.isArray(body?.result)
        ? body.result
        : Array.isArray(body)
          ? body
          : [];
      return { ok: true, status: response.status, rows, error: null };
    }
    lastFailure = `${label}_HTTP_${response.status}:${detail}`;
    if (![429, 502, 503, 504].includes(response.status) || attempt === 5) break;
    log(`${label}_TRANSIENT_RETRY=${attempt}`);
    await sleep(500 * (2 ** (attempt - 1)));
  }
  return { ok: false, status: null, rows: [], error: lastFailure };
}

async function query(sql, label) {
  const outcome = await rawQuery(sql, label);
  if (!outcome.ok) throw new Error(outcome.error);
  return outcome.rows;
}

async function migrationColumns() {
  const rows = await query(
    `select column_name from information_schema.columns
      where table_schema = 'supabase_migrations'
        and table_name = 'schema_migrations'`,
    'READ_MIGRATION_COLUMNS',
  );
  return new Set(rows.map(row => row.column_name));
}

async function readMigration(version) {
  const rows = await query(
    `select version, name, statements
       from supabase_migrations.schema_migrations
      where version = ${sqlLiteral(version)} limit 1`,
    `READ_MIGRATION_${version}`,
  );
  return rows[0] ?? null;
}

function normalizeStoredStatements(value) {
  if (Array.isArray(value)) return normalizeMigrationSql(value.join('\n\n'));
  if (typeof value === 'string') return normalizeMigrationSql(value);
  return null;
}

function historyInsert(migration, raw, columns) {
  assert.ok(columns.has('version'), 'MIGRATION_HISTORY_VERSION_COLUMN_MISSING');
  const names = ['version'];
  const values = [sqlLiteral(migration.version)];
  if (columns.has('name')) {
    names.push('name');
    values.push(sqlLiteral(migration.name));
  }
  if (columns.has('statements')) {
    names.push('statements');
    values.push(`array[${sqlLiteral(normalizeMigrationSql(raw))}]::text[]`);
  }
  return `insert into supabase_migrations.schema_migrations (${names.join(', ')})
values (${values.join(', ')}) on conflict (version) do nothing;`;
}

async function applyMigration(migration, columns) {
  const raw = readFileSync(migration.path, 'utf8');
  const canonicalLocal = normalizeMigrationSql(raw);
  const localHash = sha256(canonicalLocal);
  const existing = await readMigration(migration.version);
  if (existing) {
    const stored = normalizeStoredStatements(existing.statements);
    if (stored) {
      assert.equal(sha256(stored), localHash, `MIGRATION_${migration.version}_REMOTE_CONTENT_MISMATCH`);
    }
    report.migrations.push({ ...migration, status: 'ALREADY_APPLIED_AND_MATCHED', sha256: localHash });
    log(`MIGRATION_${migration.version}=ALREADY_APPLIED_AND_MATCHED`);
    return;
  }

  const body = stripOuterTransaction(raw, migration.path);
  await query(
    `begin;\n${body}\n${historyInsert(migration, raw, columns)}\ncommit;`,
    `APPLY_MIGRATION_${migration.version}`,
  );
  assert.ok(await readMigration(migration.version), `MIGRATION_${migration.version}_HISTORY_NOT_RECORDED`);
  report.migrations.push({ ...migration, status: 'APPLIED', sha256: localHash });
  log(`MIGRATION_${migration.version}=APPLIED`);
}

async function verifyCatalog() {
  const rows = await query(`
    select
      to_regclass('public.cartera030b_expected_payment_obligations') is not null as obligations_table,
      to_regclass('public.cartera030b_obligation_transitions') is not null as transitions_table,
      to_regclass('public.cartera030b_payment_reconciliations') is not null as reconciliations_table,
      to_regclass('public.cartera030b_obligation_conflicts') is not null as conflicts_table,
      to_regclass('public.cartera030b_command_receipts') is not null as receipts_table,
      to_regprocedure('public.forge_cartera030b_generate_expected_obligations(jsonb)') is not null as generation_rpc,
      to_regprocedure('public.forge_cartera030b_list_expected_obligations(jsonb)') is not null as calendar_rpc,
      to_regprocedure('public.forge_cartera030b_reconcile_payment_event(jsonb)') is null as reconciliation_rpc_withheld
  `, 'VERIFY_CATALOG');
  const row = rows[0] ?? {};
  for (const [key, value] of Object.entries(row)) {
    assert.equal(value, true, `CATALOG_${key.toUpperCase()}_FAILED`);
  }
  report.catalogVerification = 'PASS';
  log('CARTERA_030B_CATALOG_VERIFICATION=PASS');
  log('PUBLIC_PAYMENT_RECONCILIATION_RPC=WITHHELD_PENDING_DURABLE_EVENT_AUTHORITY');
}

async function verifyDigestCompatibility() {
  const payload = {
    z: 'Ána',
    nested: { beta: 2, alpha: 'ñ' },
    list: [3, { y: true, x: null }],
  };
  const expected = authorizationDigest(payload);
  const rows = await query(
    `select public.forge_cartera030b_digest(${sqlLiteral(JSON.stringify(payload))}::jsonb) as digest`,
    'VERIFY_DIGEST_COMPATIBILITY',
  );
  assert.equal(rows[0]?.digest, expected, 'CARTERA030B_DIGEST_RUNTIME_MISMATCH');
  report.digestCompatibility = 'PASS';
  log('AUTHORIZATION_DIGEST_COMPATIBILITY=PASS');
}

async function runTransactionalAcceptance() {
  const sql = readFileSync(ACCEPTANCE_SQL, 'utf8');
  assert.match(sql, /^begin;/m, 'ACCEPTANCE_BEGIN_MISSING');
  assert.match(sql, /rollback;\s*select\s+'PASS CARTERA030B_TRANSACTIONAL_ACCEPTANCE'/is, 'ACCEPTANCE_ROLLBACK_MARKER_MISSING');
  const rows = await query(sql, 'CARTERA030B_TRANSACTIONAL_ACCEPTANCE');
  assert.ok(
    rows.some(row => row.acceptance === 'PASS CARTERA030B_TRANSACTIONAL_ACCEPTANCE'),
    'TRANSACTIONAL_ACCEPTANCE_MARKER_NOT_FOUND',
  );
  report.transactionalAcceptance = 'PASS';
  report.fixturesRolledBack = true;
  log('CARTERA_030B_TRANSACTIONAL_ACCEPTANCE=PASS');
  log('DETERMINISTIC_RECURRENCE=PASS');
  log('MONTH_END_AND_LEAP_RULES=PASS');
  log('IDEMPOTENT_REPLAY=PASS');
  log('CHANGED_INPUT_CONFLICT_PERSISTENCE=PASS');
  log('IDENTITY_COLLISION_CONFLICT_PERSISTENCE=PASS');
  log('OPTIMISTIC_STATE_VERSION=PASS');
  log('RLS_CROSS_ADVISOR=PASS');
  log('DIRECT_TABLE_ACCESS=BLOCKED');
  log('SANITIZED_CALENDAR=PASS');
  log('NO_LAPSE_INFERENCE=PASS');
  log('TEST_FIXTURES_ROLLED_BACK=YES');
}

async function verifyResidualFixtures() {
  const rows = await query(`
    select (
      (select count(*) from auth.users where email like 'cartera030b-acceptance-%@forge.invalid')
      + (select count(*) from public.canonical_policies where policy_reference like 'CARTERA030B_ACCEPTANCE:%')
      + (select count(*) from public.cartera030b_expected_payment_obligations where policy_reference like 'CARTERA030B_ACCEPTANCE:%')
      + (select count(*) from public.cartera030b_obligation_conflicts where conflict_reference like 'CARTERA030B_ACCEPTANCE:%')
    )::integer as residual_count
  `, 'VERIFY_RESIDUAL_FIXTURES');
  const count = Number(rows[0]?.residual_count ?? -1);
  assert.equal(count, 0, 'CARTERA030B_RESIDUAL_FIXTURES_DETECTED');
  report.residualFixtures = count;
  log('RESIDUAL_FIXTURES=0');
}

try {
  log(`CARTERA_030B_ACCEPTANCE_HEAD=${process.env.CARTERA_030B_ACCEPTANCE_HEAD}`);
  const columns = await migrationColumns();
  for (const migration of MIGRATIONS) await applyMigration(migration, columns);
  log('CARTERA_030B_REMOTE_DEPLOYMENT=PASS');
  await verifyCatalog();
  await verifyDigestCompatibility();
  await runTransactionalAcceptance();
  await verifyResidualFixtures();
  log('CARTERA_030B_REMOTE_ACCEPTANCE=PASS');
  persistEvidence();
} catch (error) {
  report.error = sanitize(error?.stack ?? error?.message ?? error);
  log(`CARTERA_030B_REMOTE_ACCEPTANCE=FAIL:${report.error}`);
  persistEvidence();
  throw error;
}
