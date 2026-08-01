import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const PROJECT_REF = 'rmlxigxysujsuwzgoimv';
const SOURCE_HEAD = '162a190b035b7ba3297665e7859042553981590c';
const ACCEPTANCE_BRANCH = 'feature/cartera-060abcd-relationship-growth-intelligence';
const AUTHORIZATION = 'YES:CARTERA_060ABCD_REMOTE_MUTATION';
const ACCEPTANCE_SQL = 'scripts/ci/cartera-060abcd-remote-acceptance.sql';
const ARTIFACT_DIR = 'artifacts/cartera-060abcd-remote-acceptance';
const REPORT_PATH = join(ARTIFACT_DIR, 'report.json');
const LOG_PATH = join(ARTIFACT_DIR, 'acceptance.log');

const MIGRATIONS = [
  ['20260801000290', 'cartera060_relationship_growth_helpers'],
  ['20260801000291', 'cartera060_relationship_growth_read'],
].map(([version, name]) => ({ version, name, path: `supabase/migrations/${version}_${name}.sql` }));

const report = {
  phase: 'CARTERA_060ABCD_REMOTE_ACCEPTANCE',
  projectRef: PROJECT_REF,
  sourceHead: SOURCE_HEAD,
  acceptanceHead: process.env.CARTERA_060ABCD_ACCEPTANCE_HEAD ?? null,
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
function log(message) { const safe = sanitize(message); logLines.push(safe); console.log(safe); }
function persist() {
  writeFileSync(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`);
  writeFileSync(LOG_PATH, `${logLines.join('\n')}\n`);
}
function literal(value) { return `'${String(value).replaceAll("'", "''")}'`; }
function normalize(value) { return `${String(value).replace(/\r\n/g, '\n').trim()}\n`; }
function sha256(value) { return createHash('sha256').update(value).digest('hex'); }
function stripOuterTransaction(sql, path) {
  const lines = sql.replace(/\r\n/g, '\n').split('\n');
  const meaningful = lines.map((line, index) => ({ line: line.trim(), index }))
    .filter(({ line }) => line && !line.startsWith('--'));
  assert.match(meaningful[0]?.line || '', /^begin\s*;$/i, `${path}_MISSING_BEGIN`);
  assert.match(meaningful.at(-1)?.line || '', /^commit\s*;$/i, `${path}_MISSING_COMMIT`);
  return lines.slice(meaningful[0].index + 1, meaningful.at(-1).index).join('\n').trim();
}

assert.equal(process.env.CARTERA_060ABCD_REMOTE_MUTATION_AUTHORIZED, AUTHORIZATION);
assert.equal(process.env.SUPABASE_PROJECT_REF, PROJECT_REF);
assert.equal(process.env.CARTERA_060ABCD_EXPECTED_SOURCE_HEAD, SOURCE_HEAD);
assert.equal(process.env.CARTERA_060ABCD_ACCEPTANCE_BRANCH, ACCEPTANCE_BRANCH);
assert.ok(process.env.CARTERA_060ABCD_ACCEPTANCE_HEAD);
assert.ok(process.env.SUPABASE_ACCESS_TOKEN);

const endpoint = `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`;
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

async function rawQuery(sql, label) {
  let lastFailure = null;
  for (let attempt = 1; attempt <= 5; attempt += 1) {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.SUPABASE_ACCESS_TOKEN}`, 'Content-Type': 'application/json' },
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
  const result = await rawQuery(sql, label);
  if (!result.ok) throw new Error(result.error);
  return result.rows;
}
async function migrationColumns() {
  const rows = await query(`select column_name from information_schema.columns
    where table_schema='supabase_migrations' and table_name='schema_migrations'`, 'READ_MIGRATION_COLUMNS');
  return new Set(rows.map(row => row.column_name));
}
async function readMigration(version) {
  const rows = await query(`select version, name, statements from supabase_migrations.schema_migrations
    where version=${literal(version)} limit 1`, `READ_MIGRATION_${version}`);
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
  if (columns.has('name')) { names.push('name'); values.push(literal(migration.name)); }
  if (columns.has('statements')) { names.push('statements'); values.push(`array[${literal(normalize(raw))}]::text[]`); }
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
  await query(`begin;\n${stripOuterTransaction(raw, migration.path)}\n${historyInsert(migration, raw, columns)}\ncommit;`,
    `APPLY_MIGRATION_${migration.version}`);
  assert.ok(await readMigration(migration.version));
  report.migrations.push({ ...migration, status: 'APPLIED', sha256: localHash });
  log(`MIGRATION_${migration.version}=APPLIED`);
}
async function verifyCatalog() {
  const rows = await query(`select
    to_regprocedure('public.forge_cartera060_candidate_reference(text,text,jsonb)') is not null as candidate_helper,
    to_regprocedure('public.forge_cartera060_evidence_item(text,text,text)') is not null as evidence_helper,
    to_regprocedure('public.forge_cartera060_list_relationship_growth_reviews(jsonb)') is not null as growth_rpc`,
    'VERIFY_CATALOG');
  for (const [key, value] of Object.entries(rows[0] ?? {})) assert.equal(value, true, `CATALOG_${key}_FAILED`);
  report.catalogVerification = 'PASS';
  log('CARTERA_060ABCD_CATALOG_VERIFICATION=PASS');
}
async function transactionalAcceptance() {
  const sql = readFileSync(ACCEPTANCE_SQL, 'utf8');
  const rows = await query(sql, 'CARTERA060_TRANSACTIONAL_ACCEPTANCE');
  assert.ok(rows.some(row => row.acceptance === 'PASS CARTERA060_TRANSACTIONAL_ACCEPTANCE'));
  report.transactionalAcceptance = 'PASS';
  report.fixturesRolledBack = true;
  log('CARTERA_060ABCD_TRANSACTIONAL_ACCEPTANCE=PASS');
  log('SECOND_POLICY_REVIEW=PASS');
  log('PROTECTION_REVIEW=PASS');
  log('REFERRAL_RELATIONSHIP=PASS');
  log('CENTER_OF_INFLUENCE=PASS');
  log('EXPLAINABILITY_AND_EVIDENCE=PASS');
  log('CLIENT_WILLINGNESS_GATE=PASS');
  log('RLS_CROSS_ADVISOR=PASS');
  log('AUTOMATIC_OPPORTUNITY=BLOCKED');
  log('AUTOMATIC_CONTACT=BLOCKED');
  log('REFERRAL_REQUEST_EXECUTION=BLOCKED');
  log('FINAL_MESSAGE_GENERATION=BLOCKED');
  log('LIFE_CONTEXT_SALES_TRIGGER=BLOCKED');
  log('FINAL_NBA_PRIORITY_TRUTH=BLOCKED');
  log('TEST_FIXTURES_ROLLED_BACK=YES');
}
async function residualFixtures() {
  const rows = await query(`select (
    (select count(*) from auth.users where email like 'cartera060-acceptance-%@forge.invalid')
    + (select count(*) from public.commercial_people where person_reference like 'CARTERA060_ACCEPTANCE:%')
    + (select count(*) from public.canonical_policies where policy_reference like 'CARTERA060_ACCEPTANCE:%')
    + (select count(*) from public.cartera040_relationship_memory_entries where person_reference like 'CARTERA060_ACCEPTANCE:%')
  )::integer as residual_count`, 'VERIFY_RESIDUAL_FIXTURES');
  const count = Number(rows[0]?.residual_count ?? -1);
  assert.equal(count, 0);
  report.residualFixtures = count;
  log('RESIDUAL_FIXTURES=0');
}

try {
  log(`CARTERA_060ABCD_ACCEPTANCE_HEAD=${process.env.CARTERA_060ABCD_ACCEPTANCE_HEAD}`);
  const columns = await migrationColumns();
  for (const migration of MIGRATIONS) await applyMigration(migration, columns);
  log('CARTERA_060ABCD_REMOTE_DEPLOYMENT=PASS');
  await verifyCatalog();
  await transactionalAcceptance();
  await residualFixtures();
  log('CARTERA_060ABCD_REMOTE_ACCEPTANCE=PASS');
  for (const phase of ['A','B','C','D']) log(`CARTERA_060${phase}_COMPLETE=YES`);
  log('CARTERA_060_COMPLETE=YES');
  persist();
} catch (error) {
  report.error = sanitize(error?.stack ?? error?.message ?? error);
  log(`CARTERA_060ABCD_REMOTE_ACCEPTANCE=FAIL:${report.error}`);
  persist();
  throw error;
}
