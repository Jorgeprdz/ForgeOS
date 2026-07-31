import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const PROJECT_REF = "rmlxigxysujsuwzgoimv";
const VERSION = "20260730000130";
const NAME = "cartera001b_pgcrypto_search_path_hardening";
const PATH = "supabase/migrations/20260730000130_cartera001b_pgcrypto_search_path_hardening.sql";

assert.equal(process.env.SUPABASE_PROJECT_REF, PROJECT_REF, "SUPABASE_PROJECT_REF_MISMATCH");
assert.ok(process.env.SUPABASE_ACCESS_TOKEN, "SUPABASE_ACCESS_TOKEN_MISSING");

const endpoint = `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`;

function literal(value) {
  return `'${String(value).replaceAll("'", "''")}'`;
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

function stripOuterTransaction(sql) {
  const lines = sql.replace(/\r\n/g, "\n").split("\n");
  const meaningful = lines
    .map((line, index) => ({ line: line.trim(), index }))
    .filter(({ line }) => line && !line.startsWith("--"));
  assert.match(meaningful[0]?.line ?? "", /^begin\s*;$/i, "MISSING_OUTER_BEGIN");
  assert.match(meaningful.at(-1)?.line ?? "", /^commit\s*;$/i, "MISSING_OUTER_COMMIT");
  return lines.slice(meaningful[0].index + 1, meaningful.at(-1).index).join("\n").trim();
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

async function isApplied() {
  const rows = await query(
    `select version
       from supabase_migrations.schema_migrations
      where version = ${literal(VERSION)}
      limit 1`,
    "READ_PGCRYPTO_HARDENING_HISTORY",
  );
  return rows.length === 1;
}

async function apply() {
  if (await isApplied()) {
    console.log(`MIGRATION_${VERSION}=ALREADY_APPLIED`);
    return;
  }
  const raw = readFileSync(PATH, "utf8");
  const body = stripOuterTransaction(raw);
  const columns = await migrationColumns();
  assert.ok(columns.has("version"), "MIGRATION_HISTORY_VERSION_COLUMN_MISSING");
  const names = ["version"];
  const values = [literal(VERSION)];
  if (columns.has("name")) {
    names.push("name");
    values.push(literal(NAME));
  }
  if (columns.has("statements")) {
    names.push("statements");
    values.push(`array[${literal(raw)}]::text[]`);
  }
  const history = `insert into supabase_migrations.schema_migrations (${names.join(", ")})
values (${values.join(", ")})
on conflict (version) do nothing;`;
  await query(`begin;\n${body}\n${history}\ncommit;`, "APPLY_PGCRYPTO_HARDENING");
  assert.equal(await isApplied(), true, "PGCRYPTO_HARDENING_HISTORY_NOT_RECORDED");
  console.log(`MIGRATION_${VERSION}=APPLIED`);
}

async function verify() {
  const rows = await query(
    `select p.proname, array_to_string(p.proconfig, ',') as configuration
       from pg_proc p
       join pg_namespace n on n.oid = p.pronamespace
      where n.nspname = 'public'
        and p.proname in (
          'forge_cartera001b_confirm_reviewed_quote',
          'forge_cartera001b_append_quote_lifecycle_event'
        )
      order by p.proname`,
    "VERIFY_PGCRYPTO_SEARCH_PATH",
  );
  assert.equal(rows.length, 2, "CARTERA001B_RPC_COUNT_MISMATCH");
  for (const row of rows) {
    assert.match(
      String(row.configuration ?? ""),
      /search_path=public, extensions, pg_temp/,
      `${row.proname}_PGCRYPTO_SEARCH_PATH_MISSING`,
    );
  }
  const digest = await query(
    `select to_regprocedure('extensions.digest(bytea,text)') is not null as digest_available`,
    "VERIFY_PGCRYPTO_DIGEST",
  );
  assert.equal(digest[0]?.digest_available, true, "PGCRYPTO_DIGEST_NOT_AVAILABLE");
  console.log("CARTERA001B_PGCRYPTO_HARDENING=PASS");
}

try {
  await apply();
  await verify();
} catch (error) {
  console.error(`CARTERA001B_PGCRYPTO_HARDENING=FAIL:${String(error?.message ?? error)}`);
  process.exitCode = 1;
}
