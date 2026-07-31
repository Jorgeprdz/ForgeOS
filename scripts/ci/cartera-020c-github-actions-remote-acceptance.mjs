import assert from 'node:assert/strict';
import { createHash, randomUUID } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const PROJECT_REF = 'rmlxigxysujsuwzgoimv';
const SOURCE_COMMIT = '0daaccd556659b997f2086e12b09481281d1b019';
const ACCEPTANCE_BRANCH = 'feature/cartera-020c-remote-acceptance';
const AUTHORIZATION = 'YES:CARTERA_020C_REMOTE_MUTATION';
const ACCEPTANCE_SQL = 'scripts/ci/cartera-020c-remote-acceptance.sql';
const ARTIFACT_DIR = 'artifacts/cartera-020c-remote-acceptance';
const REPORT_PATH = join(ARTIFACT_DIR, 'report.json');
const LOG_PATH = join(ARTIFACT_DIR, 'acceptance.log');

const MIGRATIONS = Object.freeze([
  ['20260731000230', 'cartera020c_confirmation_orchestration_tables'],
  ['20260731000231', 'cartera020c_confirmation_orchestration_guards_rls'],
  ['20260731000232', 'cartera020c_confirmation_orchestration_helpers'],
  ['20260731000233', 'cartera020c_prepare_identity_orchestration_rpc'],
  ['20260731000234', 'cartera020c_attach_policy_confirmation_rpc'],
  ['20260731000235', 'cartera020c_confirmation_failure_retry_helpers'],
  ['20260731000236', 'cartera020c_execute_confirmation_step_rpc'],
  ['20260731000237', 'cartera020c_confirmation_status_retry_grants'],
  ['20260731000238', 'cartera020c_authorization_digest_hardening'],
].map(([version, name]) => Object.freeze({
  version,
  name,
  path: `supabase/migrations/${version}_${name}.sql`,
})));

const report = {
  phase: 'CARTERA_020C_PERSISTENT_CONFIRMATION_REMOTE_ACCEPTANCE',
  executionEnvironment: 'GITHUB_ACTIONS_MANAGEMENT_API',
  projectRef: PROJECT_REF,
  sourceCommit: SOURCE_COMMIT,
  acceptanceHead: process.env.GITHUB_SHA ?? null,
  migrations: [],
  authorizationDigestCompatibility: 'NOT_RUN',
  transactionalAcceptance: 'NOT_RUN',
  parallelStateVersionAcceptance: 'NOT_RUN',
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

function jsonSql(value) {
  return `${sqlLiteral(JSON.stringify(value))}::jsonb`;
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
  return createHash('sha256').update(JSON.stringify(stable(value))).digest('hex');
}

function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

function normalizeMigrationSql(value) {
  return `${String(value).replace(/\r\n/g, '\n').trim()}\n`;
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

assert.equal(process.env.CARTERA_020C_REMOTE_MUTATION_AUTHORIZED, AUTHORIZATION, 'REMOTE_MUTATION_NOT_AUTHORIZED');
assert.equal(process.env.SUPABASE_PROJECT_REF, PROJECT_REF, 'SUPABASE_PROJECT_REF_MISMATCH');
assert.equal(process.env.CARTERA_020C_EXPECTED_SOURCE_HEAD, SOURCE_COMMIT, 'SOURCE_HEAD_INPUT_MISMATCH');
assert.equal(process.env.CARTERA_020C_ACCEPTANCE_BRANCH, ACCEPTANCE_BRANCH, 'ACCEPTANCE_BRANCH_MISMATCH');
assert.ok(process.env.CARTERA_020C_EXPECTED_ACCEPTANCE_HEAD, 'EXPECTED_ACCEPTANCE_HEAD_MISSING');
assert.equal(process.env.GITHUB_SHA, process.env.CARTERA_020C_EXPECTED_ACCEPTANCE_HEAD, 'ACCEPTANCE_HEAD_MISMATCH');
assert.ok(process.env.SUPABASE_ACCESS_TOKEN, 'SUPABASE_ACCESS_TOKEN_MISSING');

const endpoint = `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`;

async function rawQuery(sql, label) {
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
  const detail = String(body?.message ?? body?.error ?? 'QUERY_REJECTED')
    .replace(/sbp_[A-Za-z0-9_-]+/g, '[REDACTED]')
    .slice(0, 1800);
  if (!response.ok || body?.error) {
    return {
      ok: false,
      status: response.status,
      error: `${label}_HTTP_${response.status}:${detail}`,
      rows: [],
    };
  }
  const rows = Array.isArray(body?.result) ? body.result : Array.isArray(body) ? body : [];
  return { ok: true, status: response.status, error: null, rows };
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
      assert.equal(
        sha256(stored),
        localHash,
        `MIGRATION_${migration.version}_REMOTE_CONTENT_MISMATCH`,
      );
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

async function runAuthorizationDigestCompatibility() {
  const payload = {
    z: 'Ána',
    nested: { beta: 2, alpha: 'ñ' },
    list: [3, { y: true, x: null }],
  };
  const expected = authorizationDigest(payload);
  const rows = await query(
    `select public.forge_cartera020c_authorization_digest(${jsonSql(payload)}) as digest`,
    'CARTERA020C_AUTHORIZATION_DIGEST_COMPATIBILITY',
  );
  assert.equal(rows[0]?.digest, expected, 'AUTHORIZATION_DIGEST_RUNTIME_MISMATCH');
  report.authorizationDigestCompatibility = 'PASS';
  log('AUTHORIZATION_DIGEST_COMPATIBILITY=PASS');
}

async function runTransactionalAcceptance() {
  const sql = readFileSync(ACCEPTANCE_SQL, 'utf8');
  assert.match(sql, /^begin;/m, 'ACCEPTANCE_TRANSACTION_BEGIN_MISSING');
  assert.match(sql, /rollback;\s*$/i, 'ACCEPTANCE_TRANSACTION_ROLLBACK_MISSING');
  const rows = await query(
    `${sql}\nselect 'PASS CARTERA020C_TRANSACTIONAL_ACCEPTANCE'::text as acceptance;`,
    'CARTERA020C_TRANSACTIONAL_ACCEPTANCE',
  );
  assert.ok(
    rows.some((row) => row.acceptance === 'PASS CARTERA020C_TRANSACTIONAL_ACCEPTANCE'),
    'TRANSACTIONAL_ACCEPTANCE_MARKER_NOT_FOUND',
  );
  report.transactionalAcceptance = 'PASS';
  report.fixturesRolledBack = true;
  log('CARTERA_020C_TRANSACTIONAL_ACCEPTANCE=PASS');
  log('AUTHORIZATION_DIGEST_BINDING=PASS');
  log('IDENTITY_ORDERED_EXECUTION=PASS');
  log('IDENTITY_READ_AFTER_WRITE=PASS');
  log('POLICY_READ_AFTER_WRITE=PASS');
  log('CHANGED_INPUT_CONFLICT=PASS');
  log('RETRY_GOVERNANCE=PASS');
  log('RLS_CROSS_ADVISOR=PASS');
  log('DIRECT_WRITES=BLOCKED');
  log('SANITIZED_STATUS=PASS');
  log('TEST_FIXTURES_ROLLED_BACK=YES');
}

function findObjectCell(rows, key) {
  for (const row of rows) {
    if (!(key in row)) continue;
    const value = row[key];
    if (value && typeof value === 'object') return value;
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        // Continue looking for a structured result cell.
      }
    }
  }
  return null;
}

async function runParallelStateVersionAcceptance() {
  const suffix = randomUUID().replaceAll('-', '');
  const userId = randomUUID();
  const sourceId = randomUUID();
  const inboxId = randomUUID();
  const candidateId = randomUUID();
  const packetId = randomUUID();
  const email = `cartera020c-concurrency-${suffix}@forge.invalid`;
  const sourceReference = `CARTERA020C_CONCURRENCY:SOURCE:${suffix}`;
  const inboxReference = `CARTERA020C_CONCURRENCY:INBOX:${suffix}`;
  const candidateReference = `CARTERA020C_CONCURRENCY:CANDIDATE:${suffix}`;
  const packetReference = `CARTERA020C_CONCURRENCY:PACKET:${suffix}`;
  const reviewReference = `CARTERA020C_CONCURRENCY:REVIEW:${suffix}`;
  const identityCandidateReference = `CARTERA020C_CONCURRENCY:IDENTITY:${suffix}`;
  const personReference = `CARTERA020C_CONCURRENCY:PERSON:${suffix}`;
  const requestedAt = new Date(Date.now() - 60_000).toISOString();

  const batch = {
    contractType: 'FORGE_CARTERA_020C_IDENTITY_COMMAND_BATCH',
    contractVersion: 'CARTERA-020C.2',
    reviewReference,
    packetReference,
    advisorId: userId,
    actorReference: userId,
    commands: [{
      candidateReference: identityCandidateReference,
      outcome: 'CREATE_CONFIRMED',
      expectedPersonReference: personReference,
      command: {
        contractType: 'FORGE_IDENTITY_RESOLUTION_COMMAND',
        contractVersion: 'CARTERA-010B.1',
        advisorId: userId,
        actorReference: userId,
        idempotencyKey: `CARTERA020C_CONCURRENCY:IDENTITY_COMMAND:${suffix}`,
        decidedAt: requestedAt,
        outcome: 'CREATE_CONFIRMED',
        sourceIdentity: {
          sourceDomain: 'CARTERA_EVIDENCE',
          sourceIdentityType: 'POLICY_PACKET_IDENTITY_CANDIDATE',
          sourceRecordReference: identityCandidateReference,
          prospectReference: null,
        },
        existingPersonReference: null,
        newPerson: {
          personReference,
          displayName: 'Concurrency Person',
          preferredName: 'Concurrency',
          normalizedName: 'concurrency person',
          verifiedPhone: null,
          verifiedEmail: null,
          birthDate: null,
          privacyClassification: 'PRIVATE',
        },
        candidatePersonReferences: [],
        evidenceReferences: [sourceReference],
        reasonCode: 'ADVISOR_CONFIRMED_NEW_PERSON',
        commandDigest: 'f'.repeat(64),
      },
    }],
    accountDecisions: [],
    invocationOrder: ['IDENTITY_RESOLUTION'],
    createsTruth: false,
    invokesRemoteCommand: false,
    requiresExplicitExecution: true,
  };

  const request = {
    contractType: 'FORGE_CARTERA_020C_IDENTITY_EXECUTION_REQUEST',
    contractVersion: 'CARTERA-020C.3',
    advisorId: userId,
    actorReference: userId,
    reviewReference,
    packetReference,
    idempotencyKey: `CARTERA020C_CONCURRENCY:PREPARE:${suffix}`,
    requestedAt,
    authorization: {
      contractType: 'FORGE_CARTERA_020C_EXECUTION_AUTHORIZATION',
      contractVersion: 'CARTERA-020C.3',
      scope: 'IDENTITY_RESOLUTION',
      reviewReference,
      advisorId: userId,
      actorReference: userId,
      authorizedAt: requestedAt,
      confirmation: 'CONFIRM_IDENTITY_RESOLUTION',
      payloadDigest: authorizationDigest(batch),
    },
    identityBatch: batch,
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
insert into public.cartera020b_evidence_sources (
  id,advisor_id,source_reference,source_type,original_filename,mime_type,byte_size,
  document_digest,storage_reference,purpose,received_at,received_by
) values (
  ${sqlLiteral(sourceId)}::uuid,${sqlLiteral(userId)}::uuid,${sqlLiteral(sourceReference)},
  'UPLOAD','concurrency.pdf','application/pdf',1024,${sqlLiteral('d'.repeat(64))},
  ${sqlLiteral(`cartera020c/concurrency/${suffix}`)},'POLICY_INTAKE_CONCURRENCY',now()-interval '1 minute',${sqlLiteral(userId)}::uuid
);
insert into public.cartera020b_evidence_inbox_items (
  id,advisor_id,inbox_reference,source_id,status,document_type_candidate,
  classification_state,classification_confidence,worker_state,state_version
) values (
  ${sqlLiteral(inboxId)}::uuid,${sqlLiteral(userId)}::uuid,${sqlLiteral(inboxReference)},${sqlLiteral(sourceId)}::uuid,
  'confirmation_required','POLICY','MATCHED',0.99,'COMPLETED',5
);
insert into public.cartera020b_extraction_candidates (
  id,advisor_id,candidate_reference,inbox_item_id,candidate_type,classification,
  extracted_fields,overall_confidence,extraction_source,parser_id,parser_version
) values (
  ${sqlLiteral(candidateId)}::uuid,${sqlLiteral(userId)}::uuid,${sqlLiteral(candidateReference)},${sqlLiteral(inboxId)}::uuid,
  'POLICY','{"documentType":"POLICY"}'::jsonb,'{}'::jsonb,0.99,'PDF_TEXT','REMOTE_ACCEPTANCE','1'
);
insert into public.cartera020b_policy_evidence_packets (
  id,advisor_id,packet_reference,inbox_item_id,candidate_id,document_type,
  extracted_fields,extraction_confidence,confirmation_state,creates_truth
) values (
  ${sqlLiteral(packetId)}::uuid,${sqlLiteral(userId)}::uuid,${sqlLiteral(packetReference)},${sqlLiteral(inboxId)}::uuid,
  ${sqlLiteral(candidateId)}::uuid,'POLICY','{}'::jsonb,0.99,'PENDING_CONFIRMATION',false
);
select set_config('request.jwt.claim.sub', ${sqlLiteral(userId)}, true);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;
select public.forge_cartera020c_prepare_identity_orchestration(${jsonSql(request)}) as prepared;
commit;`;

  const executeSql = `begin;
select set_config('request.jwt.claim.sub', ${sqlLiteral(userId)}, true);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;
select public.forge_cartera020c_execute_next_confirmation_step(${sqlLiteral(reviewReference)},1) as execution;
commit;`;

  const cleanup = `begin;
set local session_replication_role = replica;
delete from public.cartera020c_confirmation_conflicts where advisor_id = ${sqlLiteral(userId)}::uuid;
delete from public.cartera020c_confirmation_transitions where advisor_id = ${sqlLiteral(userId)}::uuid;
delete from public.cartera020c_confirmation_attempts where advisor_id = ${sqlLiteral(userId)}::uuid;
delete from public.cartera020c_confirmation_commands where advisor_id = ${sqlLiteral(userId)}::uuid;
delete from public.cartera020c_confirmation_reviews where advisor_id = ${sqlLiteral(userId)}::uuid;
delete from public.policy_conflicts where advisor_id = ${sqlLiteral(userId)}::uuid;
delete from public.cartera010b_command_receipts where advisor_id = ${sqlLiteral(userId)}::uuid;
delete from public.identity_resolution_decisions where advisor_id = ${sqlLiteral(userId)}::uuid;
delete from public.commercial_source_identity_links where advisor_id = ${sqlLiteral(userId)}::uuid;
delete from public.commercial_people where advisor_id = ${sqlLiteral(userId)}::uuid;
delete from public.cartera020b_policy_evidence_packets where advisor_id = ${sqlLiteral(userId)}::uuid;
delete from public.cartera020b_extraction_candidates where advisor_id = ${sqlLiteral(userId)}::uuid;
delete from public.cartera020b_evidence_inbox_items where advisor_id = ${sqlLiteral(userId)}::uuid;
delete from public.cartera020b_evidence_sources where advisor_id = ${sqlLiteral(userId)}::uuid;
delete from auth.users where id = ${sqlLiteral(userId)}::uuid;
commit;`;

  try {
    const setupRows = await query(setup, 'CARTERA020C_CONCURRENCY_SETUP');
    const prepared = findObjectCell(setupRows, 'prepared');
    assert.equal(prepared?.state, 'IDENTITY_READY', 'CONCURRENCY_FIXTURE_PREPARATION_FAILED');

    const [left, right] = await Promise.all([
      rawQuery(executeSql, 'CARTERA020C_PARALLEL_EXECUTION_LEFT'),
      rawQuery(executeSql, 'CARTERA020C_PARALLEL_EXECUTION_RIGHT'),
    ]);
    const successes = [left, right].filter((outcome) => outcome.ok);
    const failures = [left, right].filter((outcome) => !outcome.ok);
    assert.equal(successes.length, 1, 'PARALLEL_EXECUTION_SUCCESS_COUNT_INVALID');
    assert.equal(failures.length, 1, 'PARALLEL_EXECUTION_FAILURE_COUNT_INVALID');
    assert.match(failures[0].error, /CARTERA020C_STALE_STATE_VERSION/);
    const execution = findObjectCell(successes[0].rows, 'execution');
    assert.equal(execution?.state, 'IDENTITY_CONFIRMED', 'PARALLEL_EXECUTION_DID_NOT_CONFIRM_IDENTITY');

    const verification = await query(
      `select
        (select count(*) from public.cartera020c_confirmation_attempts where advisor_id=${sqlLiteral(userId)}::uuid)::bigint as attempts,
        (select count(*) from public.commercial_people where advisor_id=${sqlLiteral(userId)}::uuid and person_reference=${sqlLiteral(personReference)})::bigint as people`,
      'CARTERA020C_CONCURRENCY_VERIFY',
    );
    assert.equal(Number(verification[0]?.attempts), 1, 'PARALLEL_EXECUTION_DUPLICATED_ATTEMPT');
    assert.equal(Number(verification[0]?.people), 1, 'PARALLEL_EXECUTION_DUPLICATED_PERSON');
    report.parallelStateVersionAcceptance = 'PASS';
    log('PARALLEL_STATE_VERSION_SERIALIZATION=PASS');
  } finally {
    await query(cleanup, 'CARTERA020C_CONCURRENCY_CLEANUP');
    report.concurrencyFixturesCleaned = true;
  }
}

async function checkResidualFixtures() {
  const rows = await query(
    `select
      (select count(*) from auth.users where email like 'cartera020c-%@forge.invalid')::bigint as auth_users,
      (select count(*) from public.cartera020c_confirmation_reviews where review_reference like 'CARTERA020C_%')::bigint as reviews,
      (select count(*)
         from public.cartera020c_confirmation_commands c
         join public.cartera020c_confirmation_reviews r
           on r.id = c.review_id and r.advisor_id = c.advisor_id
        where r.review_reference like 'CARTERA020C_%')::bigint as commands,
      (select count(*) from public.cartera020b_evidence_sources where source_reference like 'CARTERA020C_%')::bigint as sources,
      (select count(*) from public.commercial_people where person_reference like 'CARTERA020C_%')::bigint as people,
      (select count(*) from public.canonical_policies where policy_reference like 'CARTERA020C_%')::bigint as policies`,
    'CARTERA020C_RESIDUAL_FIXTURE_CHECK',
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
  log('CARTERA_020C_REMOTE_DEPLOYMENT=PASS');
  await runAuthorizationDigestCompatibility();
  await runTransactionalAcceptance();
  await runParallelStateVersionAcceptance();
  await checkResidualFixtures();
  log('CARTERA_020C_REMOTE_ACCEPTANCE=PASS');
  log('NEXT=CARTERA_020C_REMOTE_CLOSURE');
}

try {
  await main();
} catch (error) {
  report.error = String(error?.message ?? error).slice(0, 3000);
  log(`CARTERA_020C_REMOTE_ACCEPTANCE=FAIL:${report.error}`);
  process.exitCode = 1;
} finally {
  mkdirSync(ARTIFACT_DIR, { recursive: true });
  writeFileSync(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  writeFileSync(LOG_PATH, `${logLines.join('\n')}\n`, 'utf8');
  console.log(`EVIDENCE_REPORT=${REPORT_PATH}`);
  console.log(`EVIDENCE_LOG=${LOG_PATH}`);
}
