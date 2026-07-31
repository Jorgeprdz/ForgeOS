import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from "node:fs";
import { basename, join } from "node:path";

const PROJECT_REF = "rmlxigxysujsuwzgoimv";
const REMOTE_ONLY_VERSION = "20260726000200";
const MIGRATIONS = Object.freeze([
  Object.freeze({
    version: "20260730000100",
    name: "cartera001b_quote_lifecycle_event_bridge",
    path: "supabase/migrations/20260730000100_cartera001b_quote_lifecycle_event_bridge.sql",
  }),
  Object.freeze({
    version: "20260730000110",
    name: "cartera001b_idempotency_conflict_hardening",
    path: "supabase/migrations/20260730000110_cartera001b_idempotency_conflict_hardening.sql",
  }),
  Object.freeze({
    version: "20260730000120",
    name: "cartera001b_quote_authority_projection_hardening",
    path: "supabase/migrations/20260730000120_cartera001b_quote_authority_projection_hardening.sql",
  }),
]);
const ACCEPTANCE_PATH = "scripts/ci/cartera-001b-remote-acceptance.sql";
const ARTIFACT_DIR = "artifacts/cartera-001b-github-actions";
const REPORT_PATH = join(ARTIFACT_DIR, "report.json");
const LOG_PATH = join(ARTIFACT_DIR, "acceptance.log");
const mode = process.argv[2] ?? "--deploy-and-accept";

assert.equal(process.env.SUPABASE_PROJECT_REF, PROJECT_REF, "SUPABASE_PROJECT_REF_MISMATCH");
assert.ok(process.env.SUPABASE_ACCESS_TOKEN, "SUPABASE_ACCESS_TOKEN_MISSING");
assert.ok(["--recover-only", "--deploy-and-accept"].includes(mode), "UNSUPPORTED_MODE");

const endpoint = `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`;
const report = {
  phase: "CARTERA_001B_REMOTE_ACCEPTANCE",
  executionEnvironment: "GITHUB_ACTIONS_MANAGEMENT_API",
  projectRef: PROJECT_REF,
  mode,
  sourceCommit: process.env.GITHUB_SHA ?? null,
  recoveredMigration: null,
  migrations: [],
  acceptance: "NOT_RUN",
  fixturesRolledBack: false,
  applicationEffects: "BLOCKED",
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
      .slice(0, 800);
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

function normalizeStatements(value) {
  if (Array.isArray(value)) return `${value.join("\n\n").trim()}\n`;
  if (typeof value === "string") return `${value.trim()}\n`;
  throw new Error("REMOTE_MIGRATION_STATEMENTS_UNAVAILABLE");
}

function safeMigrationName(value) {
  const normalized = String(value ?? "remote_migration")
    .toLowerCase()
    .replace(/\.sql$/i, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
  return normalized || "remote_migration";
}

async function recoverRemoteOnlyMigration() {
  const row = await readMigration(REMOTE_ONLY_VERSION);
  assert.ok(row, `REMOTE_MIGRATION_${REMOTE_ONLY_VERSION}_NOT_FOUND`);
  const sql = normalizeStatements(row.statements);
  const fileName = `${REMOTE_ONLY_VERSION}_${safeMigrationName(row.name)}.sql`;
  const path = join("supabase/migrations", fileName);
  const siblingFiles = readdirSync("supabase/migrations")
    .filter((entry) => entry.startsWith(`${REMOTE_ONLY_VERSION}_`));
  assert.ok(siblingFiles.length <= 1, "MULTIPLE_LOCAL_20260726000200_MIGRATIONS");
  if (siblingFiles.length === 1) {
    assert.equal(siblingFiles[0], fileName, "REMOTE_MIGRATION_NAME_MISMATCH");
    assert.equal(readFileSync(path, "utf8"), sql, "REMOTE_MIGRATION_CONTENT_MISMATCH");
  } else {
    writeFileSync(path, sql, "utf8");
  }
  report.recoveredMigration = {
    version: REMOTE_ONLY_VERSION,
    name: row.name ?? null,
    path,
    sha256: sha256(sql),
    status: siblingFiles.length === 1 ? "ALREADY_MATCHED" : "RECOVERED_EXACTLY",
  };
  log(`REMOTE_MIGRATION_RECOVERY=${report.recoveredMigration.status}`);
  log(`REMOTE_MIGRATION_PATH=${path}`);
  log(`REMOTE_MIGRATION_SHA256=${report.recoveredMigration.sha256}`);
  return path;
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
  const existing = await readMigration(migration.version);
  if (existing) {
    report.migrations.push({ ...migration, status: "ALREADY_APPLIED" });
    log(`MIGRATION_${migration.version}=ALREADY_APPLIED`);
    return;
  }
  const raw = readFileSync(migration.path, "utf8");
  const body = stripOuterTransaction(raw, migration.path);
  const transaction = `begin;\n${body}\n${historyInsert({ ...migration, sql: raw }, columns)}\ncommit;`;
  await query(transaction, `APPLY_MIGRATION_${migration.version}`);
  const applied = await readMigration(migration.version);
  assert.ok(applied, `MIGRATION_${migration.version}_HISTORY_NOT_RECORDED`);
  report.migrations.push({
    ...migration,
    status: "APPLIED",
    sha256: sha256(raw),
  });
  log(`MIGRATION_${migration.version}=APPLIED`);
}

async function runAcceptance() {
  const sql = readFileSync(ACCEPTANCE_PATH, "utf8");
  assert.match(sql, /^begin;/m, "ACCEPTANCE_TRANSACTION_BEGIN_MISSING");
  assert.match(sql, /rollback;\s*$/i, "ACCEPTANCE_TRANSACTION_ROLLBACK_MISSING");
  const rows = await query(
    `${sql}\nselect 'PASS CARTERA001B_REMOTE_ACCEPTANCE'::text as acceptance;`,
    "CARTERA001B_REMOTE_ACCEPTANCE",
  );
  assert.ok(
    rows.some((row) => row.acceptance === "PASS CARTERA001B_REMOTE_ACCEPTANCE"),
    "REMOTE_ACCEPTANCE_MARKER_NOT_FOUND",
  );
  report.acceptance = "PASS";
  report.fixturesRolledBack = true;
  log("CARTERA_001B_REMOTE_ACCEPTANCE=PASS");
  log("RLS=PASS");
  log("RPC=PASS");
  log("IDEMPOTENCY=PASS");
  log("CONFLICTS=PASS");
  log("CORRECTIONS=PASS");
  log("QUOTE_AUTHORITY_PROJECTION=PASS");
  log("APPEND_ONLY=PASS");
  log("APPLICATION_EFFECTS=BLOCKED");
  log("TEST_FIXTURES_ROLLED_BACK=YES");
}

async function main() {
  mkdirSync(ARTIFACT_DIR, { recursive: true });
  for (const migration of MIGRATIONS) {
    assert.ok(existsSync(migration.path), `REQUIRED_MIGRATION_MISSING:${migration.path}`);
  }
  assert.ok(existsSync(ACCEPTANCE_PATH), `ACCEPTANCE_SQL_MISSING:${ACCEPTANCE_PATH}`);
  await recoverRemoteOnlyMigration();
  if (mode === "--recover-only") return;
  const columns = await migrationColumns();
  for (const migration of MIGRATIONS) await applyMigration(migration, columns);
  await runAcceptance();
  log("NEXT=CARTERA_001C_PROSPECT_DETAIL_TIMELINE_PROJECTION");
}

try {
  await main();
} catch (error) {
  report.acceptance = "FAIL";
  report.error = String(error?.message ?? error).slice(0, 1200);
  log(`CARTERA_001B_REMOTE_ACCEPTANCE=FAIL:${report.error}`);
  process.exitCode = 1;
} finally {
  mkdirSync(ARTIFACT_DIR, { recursive: true });
  writeFileSync(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  writeFileSync(LOG_PATH, `${logLines.join("\n")}\n`, "utf8");
  console.log(`EVIDENCE_REPORT=${REPORT_PATH}`);
  console.log(`EVIDENCE_LOG=${LOG_PATH}`);
}
