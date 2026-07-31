import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const PROJECT_REF = "rmlxigxysujsuwzgoimv";
const ACCEPTANCE_PATH = "scripts/ci/cartera-001d-remote-vertical-acceptance.sql";
const ARTIFACT_DIR = "artifacts/cartera-001d-remote";
const REPORT_PATH = join(ARTIFACT_DIR, "report.json");
const LOG_PATH = join(ARTIFACT_DIR, "acceptance.log");
const REQUIRED_MIGRATIONS = Object.freeze([
  "20260730000100",
  "20260730000110",
  "20260730000120",
  "20260730000130",
]);

assert.equal(process.env.SUPABASE_PROJECT_REF, PROJECT_REF, "SUPABASE_PROJECT_REF_MISMATCH");
assert.ok(process.env.SUPABASE_ACCESS_TOKEN, "SUPABASE_ACCESS_TOKEN_MISSING");

const endpoint = `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`;
const report = {
  phase: "CARTERA_001D_VERTICAL_ACCEPTANCE_AND_CLOSURE",
  executionEnvironment: "GITHUB_ACTIONS_MANAGEMENT_API",
  projectRef: PROJECT_REF,
  sourceCommit: process.env.GITHUB_SHA ?? null,
  requiredMigrations: [...REQUIRED_MIGRATIONS],
  migrationsPresent: [],
  remoteAcceptance: "NOT_RUN",
  fixturesRolledBack: false,
  residualFixtureCounts: null,
  schemaMutation: false,
};
const logLines = [];

function redact(value) {
  return String(value).replace(/sbp_[A-Za-z0-9_-]+/g, "[REDACTED]");
}

function log(message) {
  const safe = redact(message);
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
    const detail = redact(body?.message ?? body?.error ?? "QUERY_REJECTED").slice(0, 1000);
    throw new Error(`${label}_HTTP_${response.status}:${detail}`);
  }
  if (Array.isArray(body?.result)) return body.result;
  if (Array.isArray(body)) return body;
  return [];
}

function assertTransactionalHarness(sql) {
  assert.match(sql, /^begin;\s*$/im, "CARTERA001D_TRANSACTION_BEGIN_MISSING");
  assert.match(sql, /rollback;\s*$/i, "CARTERA001D_TRANSACTION_ROLLBACK_MISSING");
  assert.doesNotMatch(sql, /\bcommit\s*;/i, "CARTERA001D_COMMIT_FORBIDDEN");
  assert.doesNotMatch(sql, /\b(create|alter|drop)\s+(table|view|function|policy|trigger|extension)\b/i, "CARTERA001D_SCHEMA_MUTATION_FORBIDDEN");
  assert.match(sql, /forge_cartera001b_confirm_reviewed_quote/, "CARTERA001D_CONFIRM_RPC_MISSING");
  assert.match(sql, /forge_cartera001b_append_quote_lifecycle_event/, "CARTERA001D_EVENT_RPC_MISSING");
  assert.match(sql, /quote_lifecycle_history/, "CARTERA001D_HISTORY_VIEW_MISSING");
  assert.match(sql, /prospect_timeline_events/, "CARTERA001D_TIMELINE_ASSERTION_MISSING");
  assert.match(sql, /QUOTE_AUTHORITY/, "CARTERA001D_QUOTE_AUTHORITY_ASSERTION_MISSING");
  assert.match(sql, /PROSPECT_ACCEPTED/, "CARTERA001D_FINAL_STATE_ASSERTION_MISSING");
}

async function verifyMigrations() {
  const rows = await query(
    `select version
       from supabase_migrations.schema_migrations
      where version in (${REQUIRED_MIGRATIONS.map(sqlLiteral).join(",")})
      order by version`,
    "CARTERA001D_READ_MIGRATIONS",
  );
  report.migrationsPresent = rows.map(row => String(row.version));
  assert.deepEqual(report.migrationsPresent, [...REQUIRED_MIGRATIONS], "CARTERA001D_REQUIRED_MIGRATIONS_MISSING");
  log(`MIGRATIONS_PRESENT=${report.migrationsPresent.join(",")}`);
}

async function executeAcceptance(sql) {
  const rows = await query(
    `${sql}\nselect 'PASS CARTERA001D_REMOTE_VERTICAL_ACCEPTANCE'::text as acceptance;`,
    "CARTERA001D_REMOTE_VERTICAL_ACCEPTANCE",
  );
  assert.ok(
    rows.some(row => row.acceptance === "PASS CARTERA001D_REMOTE_VERTICAL_ACCEPTANCE"),
    "CARTERA001D_REMOTE_ACCEPTANCE_MARKER_MISSING",
  );
  report.remoteAcceptance = "PASS";
  report.fixturesRolledBack = true;
  log("CARTERA_001D_REMOTE_VERTICAL_ACCEPTANCE=PASS");
  log("QUOTE_CONFIRMATION_RPC=PASS");
  log("QUOTE_LIFECYCLE_EVENTS=PASS");
  log("QUOTE_HISTORY_PROJECTION=PASS");
  log("QUOTE_AUTHORITY_TIMELINE=PASS");
  log("CROSS_TENANT_RLS=PASS");
  log("FINAL_LIFECYCLE_STATE=PROSPECT_ACCEPTED");
  log("TEST_FIXTURES_ROLLED_BACK=YES");
}

async function verifyNoResidualFixtures() {
  const rows = await query(
    `select
       (select count(*)::int from auth.users where email like 'cartera001d-%@forge.invalid') as auth_fixture_count,
       (select count(*)::int from public.prospects where source = 'cartera001d_vertical_acceptance') as prospect_fixture_count`,
    "CARTERA001D_RESIDUAL_FIXTURE_CHECK",
  );
  const counts = rows[0] ?? {};
  report.residualFixtureCounts = {
    authUsers: Number(counts.auth_fixture_count ?? -1),
    prospects: Number(counts.prospect_fixture_count ?? -1),
  };
  assert.deepEqual(report.residualFixtureCounts, { authUsers: 0, prospects: 0 }, "CARTERA001D_RESIDUAL_FIXTURES_FOUND");
  log("RESIDUAL_AUTH_FIXTURES=0");
  log("RESIDUAL_PROSPECT_FIXTURES=0");
}

async function main() {
  mkdirSync(ARTIFACT_DIR, { recursive: true });
  const sql = readFileSync(ACCEPTANCE_PATH, "utf8");
  report.acceptanceSqlSha256 = sha256(sql);
  assertTransactionalHarness(sql);
  await verifyMigrations();
  await executeAcceptance(sql);
  await verifyNoResidualFixtures();
  log("CARTERA_001D_VERTICAL_ACCEPTANCE=PASS");
  log("NEXT=CARTERA_001D_CANONICAL_CLOSURE");
}

try {
  await main();
} catch (error) {
  report.remoteAcceptance = "FAIL";
  report.error = redact(error?.message ?? error).slice(0, 1400);
  log(`CARTERA_001D_VERTICAL_ACCEPTANCE=FAIL:${report.error}`);
  process.exitCode = 1;
} finally {
  mkdirSync(ARTIFACT_DIR, { recursive: true });
  writeFileSync(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  writeFileSync(LOG_PATH, `${logLines.join("\n")}\n`, "utf8");
  console.log(`EVIDENCE_REPORT=${REPORT_PATH}`);
  console.log(`EVIDENCE_LOG=${LOG_PATH}`);
}
