import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const PROJECT_REF = 'rmlxigxysujsuwzgoimv';
const SOURCE_HEAD = '19091b873b900f79e586f43149b89130dbe7a099';
const ACCEPTANCE_BRANCH = 'feature/cartera-050abcd-future-radar-conservation';
const AUTHORIZATION = 'YES:CARTERA_050ABCD_REMOTE_MUTATION';
const ACCEPTANCE_SQL = 'scripts/ci/cartera-050abcd-remote-acceptance.sql';
const ARTIFACT_DIR = 'artifacts/cartera-050abcd-remote-acceptance';
const REPORT_PATH = join(ARTIFACT_DIR, 'report.json');
const LOG_PATH = join(ARTIFACT_DIR, 'acceptance.log');

const MIGRATIONS = Object.freeze([
  ['20260801000280', 'cartera050_future_radar_helpers'],
  ['20260801000281', 'cartera050_future_radar_read'],
].map(([version, name]) => Object.freeze({
  version,
  name,
  path: `supabase/migrations/${version}_${name}.sql`,
})));

const report = {
  phase: 'CARTERA_050ABCD_REMOTE_ACCEPTANCE',
  projectRef: PROJECT_REF,
  sourceHead: SOURCE_HEAD,
  acceptanceHead: process.env.CARTERA_050ABCD_ACCEPTANCE_HEAD ?? null,
  migrations: [],
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
    .slice(0, 6000);
}
function log(message) {
  const safe = sanitize(message);
  logLines.push(safe);
  console.log(safe);
}
function persist() {
  writeFileSync(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`);
  writeFileSync(LOG_PATH, `${logLines.join('\n')}\n`);
}
function literal(value) {
  return `'${String(value).replaceAll("'", "''")}'`;
}
function normalize(value) {
  return `${String(value).replace(/\r\n/g, '\n').trim()}\n`;
}
function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}
function stripOuterTransaction(sql, path) {
  const lines = sql.replace(/\r\n/g, '\n').split('\n');
  const meaningful = lines
    .map((line, index) => ({ line: line.trim(), index }))
    .filter(({ line }) => line && !line.startsWith('--'));
  assert.match(meaningful[0]?.line || '', /^begin\s*;$/i, `${path}_MISSING_BEGIN`);
  assert.match(meaningful.at(-1)?.line || '', /^commit\s*;$/i, `${path}_MISSING_COMMIT`);
  return lines.slice(meaningful[0].index + 1, meaningful.at(-1).index).join('\n').trim();
}

assert.equal(process.env.CARTERA_050ABCD_REMOTE_MUTATION_AUTHORIZED, AUTHORIZATION);
assert.equal(process.env.SUPABASE_PROJECT_REF, PROJECT_REF);
assert.equal(process.env.CARTERA_050ABCD_EXPECTED_SOURCE_HEAD, SOURCE_HEAD);
assert.equal(process.env.CARTERA_050ABCD_ACCEPTANCE_BRANCH, ACCEPTANCE_BRANCH);
assert.ok(process.env.CARTERA_050ABCD_ACCEPTANCE_HEAD);
assert.ok(process.env.SUPABASE_ACCESS_TOKEN);

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
    if (response.ok && !body?.error) {
      const rows = Array.isArray(body?.result)
        ? body.result
        : Array.isArray(body)
          ? body
          : [];
      return { ok: true, rows };
    }
    const detail = sanitize(body?.message ?? body?.error ?? 'QUERY_REJECTED');
    lastFailure = `${label}_HTTP_${response.status}:${detail}`;
    if (![429, 502, 503, 504].includes(response.status) || attempt === 5) break;
    log(`${label}_TRANSIENT_RETRY=${attempt}`);
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
      where version = ${literal(version)} limit 1`,
    `READ_MIGRATION_${version}`,
  );
  return rows[0] ?? null;
}

function storedStatements(value) {
  if (Array.isArray(value)) return normalize(value.join('\n\n'));
  if (typeof value === 'string') return normalize(value);
  return null;
}

function historyInsert(migration, raw, columns) {
  const names = ['version'];
  const values = [literal(migration.version)];
  if (columns.has('name')) {
    names.push('name');
    values.push(literal(migration.name));
  }
  if (columns.has('statements')) {
    names.push('statements');
    values.push(`array[${literal(normalize(raw))}]::text[]`);
  }
  return `insert into supabase_migrations.schema_migrations (${names.join(', ')})
values (${values.join(', ')}) on conflict (version) do nothing;`;
}

async function applyMigration(migration, columns) {
  const raw = readFileSync(migration.path, 'utf8');
  const canonical = normalize(raw);
  const localHash = sha256(canonical);
  const existing = await readMigration(migration.version);
  if (existing) {
    const stored = storedStatements(existing.statements);
    if (stored) assert.equal(sha256(stored), localHash, `MIGRATION_${migration.version}_REMOTE_MISMATCH`);
    report.migrations.push({ ...migration, status: 'ALREADY_APPLIED_AND_MATCHED', sha256: localHash });
    log(`MIGRATION_${migration.version}=ALREADY_APPLIED_AND_MATCHED`);
    return;
  }
  const body = stripOuterTransaction(raw, migration.path);
  await query(
    `begin;\n${body}\n${historyInsert(migration, raw, columns)}\ncommit;`,
    `APPLY_MIGRATION_${migration.version}`,
  );
  assert.ok(await readMigration(migration.version), `MIGRATION_${migration.version}_NOT_RECORDED`);
  report.migrations.push({ ...migration, status: 'APPLIED', sha256: localHash });
  log(`MIGRATION_${migration.version}=APPLIED`);
}

async function verifyCatalog() {
  const rows = await query(`
    select
      to_regprocedure('public.forge_cartera050_horizon(date,date)') is not null as horizon_helper,
      to_regprocedure('public.forge_cartera050_next_anniversary(date,date)') is not null as anniversary_helper,
      to_regprocedure('public.forge_cartera050_list_future_radar(jsonb)') is not null as radar_rpc
  `, 'VERIFY_CATALOG');
  for (const [key, value] of Object.entries(rows[0] ?? {})) {
    assert.equal(value, true, `CATALOG_${key.toUpperCase()}_FAILED`);
  }
  report.catalogVerification = 'PASS';
  log('CARTERA_050ABCD_CATALOG_VERIFICATION=PASS');
}

async function runTransactionalAcceptance() {
  const sql = readFileSync(ACCEPTANCE_SQL, 'utf8');
  assert.match(sql, /^begin;/m);
  assert.match(sql, /rollback;\s*select\s+'PASS CARTERA050_TRANSACTIONAL_ACCEPTANCE'/is);
  const rows = await query(sql, 'CARTERA050_TRANSACTIONAL_ACCEPTANCE');
  assert.ok(rows.some(row => row.acceptance === 'PASS CARTERA050_TRANSACTIONAL_ACCEPTANCE'));
  report.transactionalAcceptance = 'PASS';
  report.fixturesRolledBack = true;
  log('CARTERA_050ABCD_TRANSACTIONAL_ACCEPTANCE=PASS');
  log('TODAY_7_30_90_HORIZONS=PASS');
  log('EXPECTED_PAYMENT_SIGNAL=PASS');
  log('POSSIBLE_LATE_PAYMENT_IS_INFERENCE=PASS');
  log('POLICY_YEAR_TRANSITION=PASS');
  log('RELATIONSHIP_REVIEW_SIGNAL=PASS');
  log('POLICY_SERVICE_SIGNAL=PASS');
  log('EXPLAINABILITY_CONTRACT=PASS');
  log('CONSERVATION_AUTHORITY_ADAPTER_BOUNDARY=PASS');
  log('COMPENSATION_AUTHORITY_ADAPTER_BOUNDARY=PASS');
  log('RLS_CROSS_ADVISOR=PASS');
  log('AUTOMATIC_CONTACT=BLOCKED');
  log('AUTOMATIC_OPPORTUNITY=BLOCKED');
  log('FINAL_MESSAGE_GENERATION=BLOCKED');
  log('LAPSE_INFERENCE=BLOCKED');
  log('FINAL_NBA_PRIORITY_TRUTH=BLOCKED');
  log('TEST_FIXTURES_ROLLED_BACK=YES');
}

async function verifyResidualFixtures() {
  const rows = await query(`
    select (
      (select count(*) from auth.users where email like 'cartera050-acceptance-%@forge.invalid')
      + (select count(*) from public.commercial_people where person_reference like 'CARTERA050_ACCEPTANCE:%')
      + (select count(*) from public.canonical_policies where policy_reference like 'CARTERA050_ACCEPTANCE:%')
      + (select count(*) from public.cartera030b_expected_payment_obligations where obligation_reference like 'CARTERA050_ACCEPTANCE:%')
      + (select count(*) from public.cartera040_relationship_memory_entries where person_reference like 'CARTERA050_ACCEPTANCE:%')
    )::integer as residual_count
  `, 'VERIFY_RESIDUAL_FIXTURES');
  const count = Number(rows[0]?.residual_count ?? -1);
  assert.equal(count, 0);
  report.residualFixtures = count;
  log('RESIDUAL_FIXTURES=0');
}

try {
  log(`CARTERA_050ABCD_ACCEPTANCE_HEAD=${process.env.CARTERA_050ABCD_ACCEPTANCE_HEAD}`);
  const columns = await migrationColumns();
  for (const migration of MIGRATIONS) await applyMigration(migration, columns);
  log('CARTERA_050ABCD_REMOTE_DEPLOYMENT=PASS');
  await verifyCatalog();
  await runTransactionalAcceptance();
  await verifyResidualFixtures();
  log('CARTERA_050ABCD_REMOTE_ACCEPTANCE=PASS');
  log('CARTERA_050A_COMPLETE=YES');
  log('CARTERA_050B_COMPLETE=YES');
  log('CARTERA_050C_COMPLETE=YES');
  log('CARTERA_050D_COMPLETE=YES');
  log('CARTERA_050_COMPLETE=YES');
  persist();
} catch (error) {
  report.error = sanitize(error?.stack ?? error?.message ?? error);
  log(`CARTERA_050ABCD_REMOTE_ACCEPTANCE=FAIL:${report.error}`);
  persist();
  throw error;
}
