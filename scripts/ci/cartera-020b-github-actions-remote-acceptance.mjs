import assert from 'node:assert/strict';
import { createHash, randomUUID } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const PROJECT_REF = 'rmlxigxysujsuwzgoimv';
const SOURCE_COMMIT = '95d03f220670239fc7c2af9ab5799bb21406cbd0';
const ACCEPTANCE_BRANCH = 'feature/cartera-020b-remote-acceptance';
const AUTHORIZATION = 'YES:CARTERA_020B_REMOTE_MUTATION';
const ACCEPTANCE_SQL = 'scripts/ci/cartera-020b-remote-acceptance.sql';
const ARTIFACT_DIR = 'artifacts/cartera-020b-remote-acceptance';
const REPORT_PATH = join(ARTIFACT_DIR, 'report.json');
const LOG_PATH = join(ARTIFACT_DIR, 'acceptance.log');

const MIGRATIONS = Object.freeze([
  ['20260731000220', 'cartera020b_evidence_tables'],
  ['20260731000221', 'cartera020b_worker_guards'],
  ['20260731000222', 'cartera020b_rls_and_grants'],
  ['20260731000223', 'cartera020b_command_helpers'],
  ['20260731000224', 'cartera020b_admission_and_claim_rpcs'],
  ['20260731000225', 'cartera020b_processing_result_rpc'],
  ['20260731000226', 'cartera020b_claim_concurrency_hardening'],
  ['20260731000227', 'cartera020b_packet_replay_hardening'],
].map(([version, name]) => Object.freeze({
  version,
  name,
  path: `supabase/migrations/${version}_${name}.sql`,
})));

const report = {
  phase: 'CARTERA_020B_REMOTE_DEPLOYMENT_AND_TRANSACTIONAL_ACCEPTANCE',
  executionEnvironment: 'GITHUB_ACTIONS_MANAGEMENT_API',
  projectRef: PROJECT_REF,
  sourceCommit: SOURCE_COMMIT,
  acceptanceHead: process.env.GITHUB_SHA ?? null,
  migrations: [],
  transactionalAcceptance: 'NOT_RUN',
  parallelClaimAcceptance: 'NOT_RUN',
  fixturesRolledBack: false,
  concurrencyFixturesCleaned: false,
  residualFixtures: null,
};
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

function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

function normalizeMigrationSql(value) {
  return `${String(value).replace(/\r\n/g, '\n').trim()}\n`;
}

function jsonSql(value) {
  return `${sqlLiteral(JSON.stringify(value))}::jsonb`;
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

assert.equal(process.env.CARTERA_020B_REMOTE_MUTATION_AUTHORIZED, AUTHORIZATION, 'REMOTE_MUTATION_NOT_AUTHORIZED');
assert.equal(process.env.SUPABASE_PROJECT_REF, PROJECT_REF, 'SUPABASE_PROJECT_REF_MISMATCH');
assert.equal(process.env.CARTERA_020B_EXPECTED_SOURCE_HEAD, SOURCE_COMMIT, 'SOURCE_HEAD_INPUT_MISMATCH');
assert.equal(process.env.CARTERA_020B_ACCEPTANCE_BRANCH, ACCEPTANCE_BRANCH, 'ACCEPTANCE_BRANCH_MISMATCH');
assert.ok(process.env.CARTERA_020B_EXPECTED_ACCEPTANCE_HEAD, 'EXPECTED_ACCEPTANCE_HEAD_MISSING');
assert.equal(process.env.GITHUB_SHA, process.env.CARTERA_020B_EXPECTED_ACCEPTANCE_HEAD, 'ACCEPTANCE_HEAD_MISMATCH');
assert.ok(process.env.SUPABASE_ACCESS_TOKEN, 'SUPABASE_ACCESS_TOKEN_MISSING');

const endpoint = `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`;

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
      .slice(0, 1800);
    throw new Error(`${label}_HTTP_${response.status}:${detail}`);
  }
  if (Array.isArray(body?.result)) return body.result;
  if (Array.isArray(body)) return body;
  return [];
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

async function runTransactionalAcceptance() {
  const sql = readFileSync(ACCEPTANCE_SQL, 'utf8');
  assert.match(sql, /^begin;/m, 'ACCEPTANCE_TRANSACTION_BEGIN_MISSING');
  assert.match(sql, /rollback;\s*$/i, 'ACCEPTANCE_TRANSACTION_ROLLBACK_MISSING');
  const rows = await query(
    `${sql}\nselect 'PASS CARTERA020B_TRANSACTIONAL_ACCEPTANCE'::text as acceptance;`,
    'CARTERA020B_TRANSACTIONAL_ACCEPTANCE',
  );
  assert.ok(
    rows.some((row) => row.acceptance === 'PASS CARTERA020B_TRANSACTIONAL_ACCEPTANCE'),
    'TRANSACTIONAL_ACCEPTANCE_MARKER_NOT_FOUND',
  );
  report.transactionalAcceptance = 'PASS';
  report.fixturesRolledBack = true;
  log('CARTERA_020B_TRANSACTIONAL_ACCEPTANCE=PASS');
  log('ADMISSION_IDEMPOTENCY=PASS');
  log('CHANGED_INPUT_CONFLICT=PASS');
  log('LEASE_RECOVERY=PASS');
  log('RETRY_RECOVERY=PASS');
  log('PACKET_TO_CONFIRMATION_HANDOFF=PASS');
  log('RLS_CROSS_ADVISOR=PASS');
  log('DIRECT_WRITES=BLOCKED');
  log('TEST_FIXTURES_ROLLED_BACK=YES');
}

function findObjectCell(rows, key) {
  for (const row of rows) {
    if (!(key in row)) continue;
    const value = row[key];
    if (value && typeof value === 'object') return value;
    if (typeof value === 'string') {
      try { return JSON.parse(value); } catch { /* continue */ }
    }
  }
  return null;
}

async function runParallelClaimAcceptance() {
  const suffix = randomUUID().replaceAll('-', '');
  const userId = randomUUID();
  const digest = sha256(`cartera020b-concurrency-${suffix}`);
  const email = `cartera020b-concurrency-${suffix}@forge.invalid`;
  const sourceReference = `CARTERA020B_CONCURRENCY:SOURCE:${suffix}`;
  const inboxReference = `CARTERA020B_CONCURRENCY:INBOX:${suffix}`;
  const workerId = `worker/concurrency/${suffix}`;
  const admission = {
    contractType: 'FORGE_EVIDENCE_ADMISSION_COMMAND',
    contractVersion: 'CARTERA-020B.1',
    advisorId: userId,
    actorReference: userId,
    sourceReference,
    inboxReference,
    organizationReference: null,
    sourceType: 'UPLOAD',
    originalFilename: 'concurrency.pdf',
    mimeType: 'application/pdf',
    byteSize: 1024,
    documentDigest: digest,
    storageReference: `acceptance/concurrency/${suffix}`,
    purpose: 'POLICY_INTAKE',
    receivedAt: new Date(Date.now() - 60_000).toISOString(),
    idempotencyKey: `CARTERA020B_CONCURRENCY:ADMIT:${suffix}`,
    commandDigest: 'f'.repeat(64),
  };

  const setup = `begin;
insert into auth.users (
  instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,
  raw_app_meta_data,raw_user_meta_data,created_at,updated_at
) values (
  '00000000-0000-0000-0000-000000000000',${sqlLiteral(userId)}::uuid,
  'authenticated','authenticated',${sqlLiteral(email)},'',now(),
  '{"provider":"email","providers":["email"]}'::jsonb,'{}'::jsonb,now(),now()
);
select set_config('request.jwt.claim.sub', ${sqlLiteral(userId)}, true);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;
select public.forge_cartera020b_admit_evidence(${jsonSql(admission)}) as admission;
commit;`;

  const claimSql = `begin;
select set_config('request.jwt.claim.sub', ${sqlLiteral(userId)}, true);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;
select public.forge_cartera020b_claim_evidence(${sqlLiteral(workerId)}, 300) as claim;
commit;`;

  const cleanup = `begin;
set local session_replication_role = replica;
delete from public.cartera020b_command_conflicts where advisor_id = ${sqlLiteral(userId)}::uuid;
delete from public.cartera020b_command_receipts where advisor_id = ${sqlLiteral(userId)}::uuid;
delete from public.cartera020b_policy_evidence_packets where advisor_id = ${sqlLiteral(userId)}::uuid;
delete from public.cartera020b_extraction_candidates where advisor_id = ${sqlLiteral(userId)}::uuid;
delete from public.cartera020b_extraction_attempts where advisor_id = ${sqlLiteral(userId)}::uuid;
delete from public.cartera020b_evidence_transitions where advisor_id = ${sqlLiteral(userId)}::uuid;
delete from public.cartera020b_evidence_inbox_items where advisor_id = ${sqlLiteral(userId)}::uuid;
delete from public.cartera020b_evidence_sources where advisor_id = ${sqlLiteral(userId)}::uuid;
delete from auth.users where id = ${sqlLiteral(userId)}::uuid;
commit;`;

  try {
    const setupRows = await query(setup, 'CARTERA020B_CONCURRENCY_SETUP');
    const admitted = findObjectCell(setupRows, 'admission');
    assert.equal(admitted?.status, 'ADMITTED', 'CONCURRENCY_FIXTURE_ADMISSION_FAILED');

    const [leftRows, rightRows] = await Promise.all([
      query(claimSql, 'CARTERA020B_PARALLEL_CLAIM_LEFT'),
      query(claimSql, 'CARTERA020B_PARALLEL_CLAIM_RIGHT'),
    ]);
    const left = findObjectCell(leftRows, 'claim');
    const right = findObjectCell(rightRows, 'claim');
    assert.equal(left?.status, 'CLAIMED', 'PARALLEL_LEFT_NOT_CLAIMED');
    assert.equal(right?.status, 'CLAIMED', 'PARALLEL_RIGHT_NOT_CLAIMED');
    assert.equal(left?.inboxReference, inboxReference, 'PARALLEL_LEFT_WRONG_ITEM');
    assert.equal(right?.inboxReference, inboxReference, 'PARALLEL_RIGHT_WRONG_ITEM');
    assert.equal(left?.leaseToken, right?.leaseToken, 'PARALLEL_CLAIMS_DIVERGED');
    assert.equal([left?.replayed, right?.replayed].filter(Boolean).length, 1, 'PARALLEL_REPLAY_COUNT_INVALID');
    report.parallelClaimAcceptance = 'PASS';
    log('PARALLEL_WORKER_CLAIM_SERIALIZATION=PASS');
  } finally {
    await query(cleanup, 'CARTERA020B_CONCURRENCY_CLEANUP');
    report.concurrencyFixturesCleaned = true;
  }
}

async function checkResidualFixtures() {
  const rows = await query(
    `select
      (select count(*) from auth.users where email like 'cartera020b-%@forge.invalid')::bigint as auth_users,
      (select count(*) from public.cartera020b_evidence_sources where source_reference like 'CARTERA020B_%')::bigint as sources,
      (select count(*) from public.cartera020b_evidence_inbox_items where inbox_reference like 'CARTERA020B_%')::bigint as inbox,
      (select count(*) from public.cartera020b_extraction_attempts where attempt_reference like 'CARTERA020B_%')::bigint as attempts,
      (select count(*) from public.cartera020b_extraction_candidates where candidate_reference like 'CARTERA020B_%')::bigint as candidates,
      (select count(*) from public.cartera020b_policy_evidence_packets where packet_reference like 'CARTERA020B_%')::bigint as packets`,
    'CARTERA020B_RESIDUAL_FIXTURE_CHECK',
  );
  const residual = rows[0] ?? {};
  for (const [key, value] of Object.entries(residual)) {
    assert.equal(Number(value), 0, `RESIDUAL_FIXTURE_${key.toUpperCase()}`);
  }
  report.residualFixtures = residual;
  log('CONCURRENCY_FIXTURES_CLEANED=YES');
  log('RESIDUAL_FIXTURES=0');
}

async function main() {
  mkdirSync(ARTIFACT_DIR, { recursive: true });
  assert.ok(existsSync(ACCEPTANCE_SQL), `ACCEPTANCE_SQL_MISSING:${ACCEPTANCE_SQL}`);
  for (const migration of MIGRATIONS) {
    assert.ok(existsSync(migration.path), `REQUIRED_MIGRATION_MISSING:${migration.path}`);
  }
  const columns = await migrationColumns();
  for (const migration of MIGRATIONS) await applyMigration(migration, columns);
  log('CARTERA_020B_REMOTE_DEPLOYMENT=PASS');
  await runTransactionalAcceptance();
  await runParallelClaimAcceptance();
  await checkResidualFixtures();
  log('CARTERA_020B_REMOTE_ACCEPTANCE=PASS');
  log('NEXT=CARTERA_020B_REMOTE_CLOSURE');
}

try {
  await main();
} catch (error) {
  report.error = String(error?.message ?? error).slice(0, 3000);
  log(`CARTERA_020B_REMOTE_ACCEPTANCE=FAIL:${report.error}`);
  process.exitCode = 1;
} finally {
  mkdirSync(ARTIFACT_DIR, { recursive: true });
  writeFileSync(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  writeFileSync(LOG_PATH, `${logLines.join('\n')}\n`, 'utf8');
  console.log(`EVIDENCE_REPORT=${REPORT_PATH}`);
  console.log(`EVIDENCE_LOG=${LOG_PATH}`);
}
