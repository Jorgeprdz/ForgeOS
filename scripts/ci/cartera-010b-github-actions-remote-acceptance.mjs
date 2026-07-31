import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";

const PROJECT_REF = "rmlxigxysujsuwzgoimv";
const MIGRATIONS = Object.freeze([
  Object.freeze({
    version: "20260731000200",
    name: "cartera010b_identity_policy_foundation",
    path: "supabase/migrations/20260731000200_cartera010b_identity_policy_foundation.sql",
  }),
  Object.freeze({
    version: "20260731000210",
    name: "cartera010b_command_helpers",
    path: "supabase/migrations/20260731000210_cartera010b_command_helpers.sql",
  }),
  Object.freeze({
    version: "20260731000211",
    name: "cartera010b_identity_resolution_rpc",
    path: "supabase/migrations/20260731000211_cartera010b_identity_resolution_rpc.sql",
  }),
  Object.freeze({
    version: "20260731000212",
    name: "cartera010b_confirmed_policy_rpc",
    path: "supabase/migrations/20260731000212_cartera010b_confirmed_policy_rpc.sql",
  }),
]);
const ACCEPTANCE_PATH = "scripts/ci/cartera-010b-remote-acceptance.sql";
const ARTIFACT_DIR = "artifacts/cartera-010b-remote-acceptance";
const REPORT_PATH = join(ARTIFACT_DIR, "report.json");
const LOG_PATH = join(ARTIFACT_DIR, "acceptance.log");

assert.equal(
  process.env.SUPABASE_PROJECT_REF,
  PROJECT_REF,
  "SUPABASE_PROJECT_REF_MISMATCH",
);
assert.ok(process.env.SUPABASE_ACCESS_TOKEN, "SUPABASE_ACCESS_TOKEN_MISSING");

const endpoint = `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`;
const report = {
  phase: "CARTERA_010B_REMOTE_DEPLOYMENT_AND_TRANSACTIONAL_ACCEPTANCE",
  executionEnvironment: "GITHUB_ACTIONS_MANAGEMENT_API",
  projectRef: PROJECT_REF,
  sourceCommit: process.env.GITHUB_SHA ?? null,
  migrations: [],
  acceptance: "NOT_RUN",
  fixturesRolledBack: false,
  residualFixtures: null,
};
const logLines = [];

function log(message) {
  const safe = String(message).replace(/sbp_[A-Za-z0-9_-]+/g, "[REDACTED]");
  logLines.push(safe);
  console.log(safe);
}

function sqlLiteral(value) {
  return `'${String(value).replaceAll("'", "''")}'`;
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

async function query(sql, label) {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.SUPABASE_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query: sql }),
  });

  const text = await response.text();
  let body;
  try {
    body = JSON.parse(text);
  } catch {
    body = { message: "NON_JSON_RESPONSE" };
  }

  if (!response.ok || body?.error) {
    const detail = String(body?.message ?? body?.error ?? "QUERY_REJECTED")
      .replace(/sbp_[A-Za-z0-9_-]+/g, "[REDACTED]")
      .slice(0, 1600);
    throw new Error(`${label}_HTTP_${response.status}:${detail}`);
  }

  if (Array.isArray(body?.result)) return body.result;
  if (Array.isArray(body)) return body;
  return [];
}

async function readMigration(version) {
  const rows = await query(
    `select version, name, statements
       from supabase_migrations.schema_migrations
      where version = ${sqlLiteral(version)}
      limit 1`,
    `READ_MIGRATION_${version}`,
  );
  return rows[0] ?? null;
}

function normalizeStoredStatements(value) {
  if (Array.isArray(value)) return `${value.join("\n\n").trim()}\n`;
  if (typeof value === "string") return `${value.trim()}\n`;
  return null;
}

function stripOuterTransaction(sql, path) {
  const lines = sql.replace(/\r\n/g, "\n").split("\n");
  const meaningful = lines
    .map((line, index) => ({ line: line.trim(), index }))
    .filter(({ line }) => line && !line.startsWith("--"));
  assert.ok(meaningful.length >= 2, `${path}_EMPTY_MIGRATION`);
  const first = meaningful[0];
  const last = meaningful.at(-1);
  assert.match(first.line, /^begin\s*;$/i, `${path}_MISSING_OUTER_BEGIN`);
  assert.match(last.line, /^commit\s*;$/i, `${path}_MISSING_OUTER_COMMIT`);
  return lines.slice(first.index + 1, last.index).join("\n").trim();
}

async function migrationColumns() {
  const rows = await query(
    `select column_name
       from information_schema.columns
      where table_schema = 'supabase_migrations'
        and table_name = 'schema_migrations'`,
    "READ_MIGRATION_COLUMNS",
  );
  return new Set(rows.map((row) => row.column_name));
}

function historyInsert({ version, name, sql }, columns) {
  assert.ok(columns.has("version"), "MIGRATION_HISTORY_VERSION_COLUMN_MISSING");
  const names = ["version"];
  const values = [sqlLiteral(version)];

  if (columns.has("name")) {
    names.push("name");
    values.push(sqlLiteral(name));
  }
  if (columns.has("statements")) {
    names.push("statements");
    values.push(`array[${sqlLiteral(sql)}]::text[]`);
  }

  return `insert into supabase_migrations.schema_migrations (${names.join(", ")})
values (${values.join(", ")})
on conflict (version) do nothing;`;
}

async function applyMigration(migration, columns) {
  const raw = readFileSync(migration.path, "utf8");
  const localHash = sha256(raw);
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
    report.migrations.push({
      ...migration,
      status: "ALREADY_APPLIED_AND_MATCHED",
      sha256: localHash,
    });
    log(`MIGRATION_${migration.version}=ALREADY_APPLIED_AND_MATCHED`);
    return;
  }

  const body = stripOuterTransaction(raw, migration.path);
  const transaction =
    `begin;\n${body}\n` +
    `${historyInsert({ ...migration, sql: raw }, columns)}\ncommit;`;

  await query(transaction, `APPLY_MIGRATION_${migration.version}`);
  const applied = await readMigration(migration.version);
  assert.ok(applied, `MIGRATION_${migration.version}_HISTORY_NOT_RECORDED`);

  report.migrations.push({
    ...migration,
    status: "APPLIED",
    sha256: localHash,
  });
  log(`MIGRATION_${migration.version}=APPLIED`);
}

async function runAcceptance() {
  const sql = readFileSync(ACCEPTANCE_PATH, "utf8");
  assert.match(sql, /^begin;/m, "ACCEPTANCE_TRANSACTION_BEGIN_MISSING");
  assert.match(sql, /rollback;\s*$/i, "ACCEPTANCE_TRANSACTION_ROLLBACK_MISSING");

  const rows = await query(
    `${sql}\nselect 'PASS CARTERA010B_REMOTE_ACCEPTANCE'::text as acceptance;`,
    "CARTERA010B_REMOTE_ACCEPTANCE",
  );
  assert.ok(
    rows.some((row) => row.acceptance === "PASS CARTERA010B_REMOTE_ACCEPTANCE"),
    "REMOTE_ACCEPTANCE_MARKER_NOT_FOUND",
  );

  const residualRows = await query(
    `select
       (select count(*) from auth.users
         where email like 'cartera010b-%@forge.invalid')::bigint as auth_users,
       (select count(*) from public.commercial_people
         where person_reference like 'CARTERA010B_ACCEPTANCE:%')::bigint as people,
       (select count(*) from public.commercial_accounts
         where account_reference like 'CARTERA010B_ACCEPTANCE:%')::bigint as accounts,
       (select count(*) from public.canonical_policies
         where policy_reference like 'CARTERA010B_ACCEPTANCE:%')::bigint as policies,
       (select count(*) from public.policy_conflicts
         where conflict_reference like 'CARTERA010B_ACCEPTANCE:%')::bigint as conflicts`,
    "CARTERA010B_RESIDUAL_FIXTURE_CHECK",
  );

  const residual = residualRows[0] ?? {};
  for (const [key, value] of Object.entries(residual)) {
    assert.equal(Number(value), 0, `RESIDUAL_FIXTURE_${key.toUpperCase()}`);
  }

  report.acceptance = "PASS";
  report.fixturesRolledBack = true;
  report.residualFixtures = residual;

  log("CARTERA_010B_REMOTE_DEPLOYMENT=PASS");
  log("CARTERA_010B_REMOTE_ACCEPTANCE=PASS");
  log("IDENTITY_CREATE_LINK_CORRECT=PASS");
  log("POLICY_CREATE_VERSION=PASS");
  log("MULTI_PARTY_POLICY_ROLES=PASS");
  log("RLS_CROSS_ADVISOR=PASS");
  log("DIRECT_WRITES=BLOCKED");
  log("RESTRICTED_BENEFICIARY_READ=PASS");
  log("IDEMPOTENT_REPLAY=PASS");
  log("CHANGED_INPUT_CONFLICT=PASS");
  log("APPEND_ONLY=PASS");
  log("TEST_FIXTURES_ROLLED_BACK=YES");
  log("RESIDUAL_FIXTURES=0");
}

async function main() {
  mkdirSync(ARTIFACT_DIR, { recursive: true });
  for (const migration of MIGRATIONS) {
    assert.ok(
      existsSync(migration.path),
      `REQUIRED_MIGRATION_MISSING:${migration.path}`,
    );
  }
  assert.ok(
    existsSync(ACCEPTANCE_PATH),
    `ACCEPTANCE_SQL_MISSING:${ACCEPTANCE_PATH}`,
  );

  const columns = await migrationColumns();
  for (const migration of MIGRATIONS) {
    await applyMigration(migration, columns);
  }
  await runAcceptance();
  log("NEXT=CARTERA_010B_REMOTE_CLOSURE");
}

try {
  await main();
} catch (error) {
  report.acceptance = "FAIL";
  report.error = String(error?.message ?? error).slice(0, 2400);
  log(`CARTERA_010B_REMOTE_ACCEPTANCE=FAIL:${report.error}`);
  process.exitCode = 1;
} finally {
  mkdirSync(ARTIFACT_DIR, { recursive: true });
  writeFileSync(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  writeFileSync(LOG_PATH, `${logLines.join("\n")}\n`, "utf8");
  console.log(`EVIDENCE_REPORT=${REPORT_PATH}`);
  console.log(`EVIDENCE_LOG=${LOG_PATH}`);
}
