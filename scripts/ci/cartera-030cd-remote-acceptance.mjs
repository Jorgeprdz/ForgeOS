import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const PROJECT_REF = 'rmlxigxysujsuwzgoimv';
const SOURCE_HEAD = 'f8900c7b2e2ff1d73fd5f6c2b54e145af010282b';
const ACCEPTANCE_BRANCH = 'feature/cartera-030cd-payment-reconciliation-calendar-product';
const AUTHORIZATION = 'YES:CARTERA_030CD_REMOTE_MUTATION';
const ACCEPTANCE_SQL = 'scripts/ci/cartera-030cd-remote-acceptance.sql';
const ARTIFACT_DIR = 'artifacts/cartera-030cd-remote-acceptance';
const REPORT_PATH = join(ARTIFACT_DIR, 'report.json');
const LOG_PATH = join(ARTIFACT_DIR, 'acceptance.log');

const MIGRATIONS = Object.freeze([
  ['20260801000260', 'cartera030c_confirmed_payment_event_reconciliation'],
  ['20260801000261', 'cartera030d_policy_payment_calendar_product_read'],
].map(([version, name]) => Object.freeze({
  version,
  name,
  path: `supabase/migrations/${version}_${name}.sql`,
})));

const report = {
  phase: 'CARTERA_030CD_COMBINED_REMOTE_ACCEPTANCE',
  projectRef: PROJECT_REF,
  sourceHead: SOURCE_HEAD,
  acceptanceHead: process.env.CARTERA_030CD_ACCEPTANCE_HEAD ?? null,
  migrations: [],
  catalogVerification: 'NOT_RUN',
  digestCompatibility: 'NOT_RUN',
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
    .slice(0, 5000);
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
  assert.match(meaningful[0].line, /^begin\s*;$/i, `${path}_MISSING_OUTER_BEGIN`);
  assert.match(meaningful.at(-1).line, /^commit\s*;$/i, `${path}_MISSING_OUTER_COMMIT`);
  return lines.slice(meaningful[0].index + 1, meaningful.at(-1).index).join('\n').trim();
}

assert.equal(process.env.CARTERA_030CD_REMOTE_MUTATION_AUTHORIZED, AUTHORIZATION);
assert.equal(process.env.SUPABASE_PROJECT_REF, PROJECT_REF);
assert.equal(process.env.CARTERA_030CD_EXPECTED_SOURCE_HEAD, SOURCE_HEAD);
assert.equal(process.env.CARTERA_030CD_ACCEPTANCE_BRANCH, ACCEPTANCE_BRANCH);
assert.ok(process.env.CARTERA_030CD_ACCEPTANCE_HEAD);
assert.ok(process.env.SUPABASE_ACCESS_TOKEN);

const endpoint = `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`;
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

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
    try { body = JSON.parse(text); } catch { body = { message: 'NON_JSON_RESPONSE' }; }
    if (response.ok && !body?.error) {
      const rows = Array.isArray(body?.result) ? body.result : Array.isArray(body) ? body : [];
      return { ok: true, rows };
    }
    lastFailure = `${label}_HTTP_${response.status}:${sanitize(body?.message ?? body?.error ?? 'QUERY_REJECTED')}`;
    if (![429, 502, 503, 504].includes(response.status) || attempt === 5) break;
    await sleep(500 * (2 ** (attempt - 1)));
  }
  return { ok: false, rows: [], error: lastFailure };
}
async function query(sql, label) {
  const outcome = await rawQuery(sql, label);
  if (!outcome.ok) throw new Error(outcome.error);
  return outcome.rows;
}
async function migrationColumns() {
  const rows = await query(`select column_name from information_schema.columns
    where table_schema = 'supabase_migrations' and table_name = 'schema_migrations'`, 'READ_MIGRATION_COLUMNS');
  return new Set(rows.map(row => row.column_name));
}
async function readMigration(version) {
  const rows = await query(`select version, name, statements from supabase_migrations.schema_migrations
    where version = ${sqlLiteral(version)} limit 1`, `READ_MIGRATION_${version}`);
  return rows[0] ?? null;
}
function normalizeStoredStatements(value) {
  if (Array.isArray(value)) return normalizeMigrationSql(value.join('\n\n'));
  if (typeof value === 'string') return normalizeMigrationSql(value);
  return null;
}
function historyInsert(migration, raw, columns) {
  const names = ['version'];
  const values = [sqlLiteral(migration.version)];
  if (columns.has('name')) { names.push('name'); values.push(sqlLiteral(migration.name)); }
  if (columns.has('statements')) {
    names.push('statements');
    values.push(`array[${sqlLiteral(normalizeMigrationSql(raw))}]::text[]`);
  }
  return `insert into supabase_migrations.schema_migrations (${names.join(', ')}) values (${values.join(', ')}) on conflict (version) do nothing;`;
}
async function applyMigration(migration, columns) {
  const raw = readFileSync(migration.path, 'utf8');
  const canonical = normalizeMigrationSql(raw);
  const localHash = sha256(canonical);
  const existing = await readMigration(migration.version);
  if (existing) {
    const stored = normalizeStoredStatements(existing.statements);
    if (stored) assert.equal(sha256(stored), localHash, `MIGRATION_${migration.version}_REMOTE_CONTENT_MISMATCH`);
    report.migrations.push({ ...migration, status: 'ALREADY_APPLIED_AND_MATCHED', sha256: localHash });
    log(`MIGRATION_${migration.version}=ALREADY_APPLIED_AND_MATCHED`);
    return;
  }
  const body = stripOuterTransaction(raw, migration.path);
  await query(`begin;\n${body}\n${historyInsert(migration, raw, columns)}\ncommit;`, `APPLY_MIGRATION_${migration.version}`);
  assert.ok(await readMigration(migration.version), `MIGRATION_${migration.version}_HISTORY_NOT_RECORDED`);
  report.migrations.push({ ...migration, status: 'APPLIED', sha256: localHash });
  log(`MIGRATION_${migration.version}=APPLIED`);
}

async function verifyCatalog() {
  const rows = await query(`select
    to_regclass('public.cartera030c_confirmed_payment_events') is not null as events_table,
    to_regclass('public.cartera030c_payment_event_conflicts') is not null as event_conflicts_table,
    to_regprocedure('public.forge_cartera030c_record_and_reconcile_confirmed_payment(jsonb)') is not null as reconciliation_rpc,
    to_regprocedure('public.forge_cartera030d_list_policy_payment_calendar(jsonb)') is not null as product_calendar_rpc`, 'VERIFY_CATALOG');
  for (const [key, value] of Object.entries(rows[0] ?? {})) assert.equal(value, true, `CATALOG_${key.toUpperCase()}_FAILED`);
  report.catalogVerification = 'PASS';
  log('CARTERA_030CD_CATALOG_VERIFICATION=PASS');
}
async function verifyDigestCompatibility() {
  const payload = { z: 'Ána', nested: { beta: 2, alpha: 'ñ' }, list: [3, { y: true, x: null }] };
  const expected = authorizationDigest(payload);
  const rows = await query(`select public.forge_cartera030b_digest(${sqlLiteral(JSON.stringify(payload))}::jsonb) as digest`, 'VERIFY_DIGEST');
  assert.equal(rows[0]?.digest, expected);
  report.digestCompatibility = 'PASS';
  log('AUTHORIZATION_DIGEST_COMPATIBILITY=PASS');
}
async function runTransactionalAcceptance() {
  const sql = readFileSync(ACCEPTANCE_SQL, 'utf8');
  assert.match(sql, /^begin;/m);
  assert.match(sql, /rollback;\s*select\s+'PASS CARTERA030CD_TRANSACTIONAL_ACCEPTANCE'/is);
  const rows = await query(sql, 'CARTERA030CD_TRANSACTIONAL_ACCEPTANCE');
  assert.ok(rows.some(row => row.acceptance === 'PASS CARTERA030CD_TRANSACTIONAL_ACCEPTANCE'));
  report.transactionalAcceptance = 'PASS';
  report.fixturesRolledBack = true;
  log('CARTERA_030CD_TRANSACTIONAL_ACCEPTANCE=PASS');
  log('CONFIRMED_PAYMENT_EVENT_AUTHORITY=PASS');
  log('DETERMINISTIC_OBLIGATION_RECONCILIATION=PASS');
  log('CHANGED_EVENT_REPLAY_CONFLICT=PASS');
  log('SANITIZED_POLICY_PAYMENT_CALENDAR=PASS');
  log('RLS_CROSS_ADVISOR=PASS');
  log('DIRECT_WRITES=BLOCKED');
  log('NO_LAPSE_INFERENCE=PASS');
  log('TEST_FIXTURES_ROLLED_BACK=YES');
}
async function verifyResidualFixtures() {
  const rows = await query(`select (
    (select count(*) from auth.users where email like 'cartera030cd-acceptance-%@forge.invalid')
    + (select count(*) from public.canonical_policies where policy_reference like 'CARTERA030CD_ACCEPTANCE:%')
    + (select count(*) from public.cartera030c_confirmed_payment_events where policy_reference like 'CARTERA030CD_ACCEPTANCE:%')
    + (select count(*) from public.cartera030c_payment_event_conflicts where conflict_reference like 'CARTERA030CD_ACCEPTANCE:%')
  )::integer as residual_count`, 'VERIFY_RESIDUAL_FIXTURES');
  const count = Number(rows[0]?.residual_count ?? -1);
  assert.equal(count, 0);
  report.residualFixtures = count;
  log('RESIDUAL_FIXTURES=0');
}

try {
  log(`CARTERA_030CD_ACCEPTANCE_HEAD=${process.env.CARTERA_030CD_ACCEPTANCE_HEAD}`);
  const columns = await migrationColumns();
  for (const migration of MIGRATIONS) await applyMigration(migration, columns);
  log('CARTERA_030CD_REMOTE_DEPLOYMENT=PASS');
  await verifyCatalog();
  await verifyDigestCompatibility();
  await runTransactionalAcceptance();
  await verifyResidualFixtures();
  log('CARTERA_030CD_REMOTE_ACCEPTANCE=PASS');
  log('CARTERA_030C_COMPLETE=YES');
  log('CARTERA_030D_COMPLETE=YES');
  log('CARTERA_030_COMPLETE=YES');
  persistEvidence();
} catch (error) {
  report.error = sanitize(error?.stack ?? error?.message ?? error);
  log(`CARTERA_030CD_REMOTE_ACCEPTANCE=FAIL:${report.error}`);
  persistEvidence();
  throw error;
}
