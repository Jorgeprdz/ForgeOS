import assert from "node:assert/strict";
import { createRequire } from "node:module";
import {
  appendFileSync,
  mkdirSync,
  writeFileSync,
} from "node:fs";

const require = createRequire(import.meta.url);
const {
  materializeAdvisorCompensationProductReadModel,
  sixMonthPeriods,
} = require("../compensation/advisor/materialization/advisor-compensation-product-read-model-materializer");

const DEFAULT_PROJECT_REF = "rmlxigxysujsuwzgoimv";
const APPLY_TOKEN = "MATERIALIZE_ADVISOR_COMPENSATION_PRODUCT_READ_MODEL";
const validateOnly = process.argv.includes("--validate-only");
const apply = process.argv.includes("--apply");
const evidenceDir = "artifacts/advisor-compensation-stage-110-materialization";
const evidenceFile = `${evidenceDir}/ledger.jsonl`;

mkdirSync(evidenceDir, { recursive: true });
writeFileSync(evidenceFile, "");

function record(name, status, metadata = {}) {
  appendFileSync(evidenceFile, `${JSON.stringify({
    timestamp: new Date().toISOString(),
    name,
    status,
    ...metadata,
  })}\n`);
}

function fail(code, details = null) {
  const error = new Error(code);
  error.code = code;
  if (details !== null) error.details = details;
  throw error;
}

function redact(value) {
  return String(value || "")
    .replace(/eyJ[A-Za-z0-9._-]+/g, "[REDACTED]")
    .replace(/[A-Za-z0-9_-]{40,}/g, "[REDACTED]")
    .slice(0, 1200);
}

function validUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    .test(String(value || ""));
}

function validPeriod(value) {
  return /^\d{4}-(0[1-9]|1[0-2])$/.test(String(value || ""));
}

function sqlLiteral(value) {
  return `'${String(value).replaceAll("'", "''")}'`;
}

function jsonbLiteral(value) {
  return `${sqlLiteral(JSON.stringify(value))}::jsonb`;
}

function currentPeriod() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Mexico_City",
    year: "numeric",
    month: "2-digit",
  }).formatToParts(new Date());
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  return `${year}-${month}`;
}

function materializationPlanFixture() {
  return materializeAdvisorCompensationProductReadModel({
    advisorReference: "00000000-0000-4000-8000-000000000110",
    periodKey: "2026-08",
    eventRows: [],
    payoutRows: [],
    forwardSignals: [],
    capturedAt: "2026-08-02T18:00:00.000Z",
    metadata: { validationFixture: true },
  });
}

const fixture = materializationPlanFixture();
assert.equal(fixture.safeguards.directBrowserMutation, false);
assert.equal(fixture.safeguards.productionWritePerformed, false);
assert.equal(fixture.snapshotPayload.amounts.paid.value, null);
assert.equal(fixture.snapshotPayload.amounts.paid.knownZero, false);
assert.equal(fixture.snapshotPayload.amounts.real.value, null);
assert.match(fixture.snapshotDigest, /^[a-f0-9]{64}$/);
assert.match(fixture.historyDigest, /^[a-f0-9]{64}$/);
record("materialization_static_validation", "PASS", {
  contractVersion: fixture.contractVersion,
  directBrowserMutation: false,
  productionWritePerformed: false,
  unknownIsNotZero: true,
  appendOnly: true,
});

if (validateOnly || !apply) {
  console.log("ADVISOR_COMPENSATION_PRODUCT_READ_MODEL_MATERIALIZATION_PLAN=PASS");
  console.log("REMOTE_MATERIALIZATION=PREPARED_NOT_APPLIED");
  console.log(`APPLY_TOKEN=${APPLY_TOKEN}`);
  process.exit(0);
}

assert.equal(
  process.env.ADVISOR_COMPENSATION_READ_MODEL_MATERIALIZATION,
  APPLY_TOKEN,
  "EXPLICIT_REMOTE_MATERIALIZATION_AUTHORIZATION_REQUIRED",
);

const projectRef = process.env.SUPABASE_PROJECT_REF || DEFAULT_PROJECT_REF;
assert.equal(projectRef, DEFAULT_PROJECT_REF, "SUPABASE_PROJECT_REF_MISMATCH");
assert.ok(process.env.SUPABASE_ACCESS_TOKEN, "SUPABASE_ACCESS_TOKEN_MISSING");

const endpoint = `https://api.supabase.com/v1/projects/${projectRef}/database/query`;

async function query(statement) {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.SUPABASE_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query: statement }),
  });
  const text = await response.text();
  let body;
  try {
    body = JSON.parse(text);
  } catch {
    body = { message: "NON_JSON_RESPONSE" };
  }
  if (!response.ok || body?.error) {
    const detail = redact(body?.message || body?.error || text || "QUERY_REJECTED");
    record("database_query", "FAIL", { httpStatus: response.status, detail });
    throw new Error(`DATABASE_QUERY_HTTP_${response.status}:${detail}`);
  }
  if (Array.isArray(body?.result)) return body.result;
  if (Array.isArray(body)) return body;
  return [];
}

async function resolveAdvisorId() {
  const explicitId = String(process.env.ADVISOR_COMPENSATION_ADVISOR_ID || "").trim();
  if (explicitId) {
    if (!validUuid(explicitId)) fail("ADVISOR_COMPENSATION_ADVISOR_ID_INVALID");
    return explicitId.toLowerCase();
  }

  const email = String(process.env.ADVISOR_COMPENSATION_ADVISOR_EMAIL || "").trim();
  if (!email || !email.includes("@")) {
    fail("ADVISOR_COMPENSATION_ADVISOR_ID_OR_EMAIL_REQUIRED");
  }
  const rows = await query(`
    select id::text as advisor_id
    from auth.users
    where lower(email) = lower(${sqlLiteral(email)})
    order by created_at, id
    limit 2
  `);
  if (rows.length !== 1 || !validUuid(rows[0]?.advisor_id)) {
    fail("ADVISOR_COMPENSATION_ADVISOR_EMAIL_NOT_UNIQUE");
  }
  return String(rows[0].advisor_id).toLowerCase();
}

const advisorId = await resolveAdvisorId();
const periodKey = String(
  process.env.ADVISOR_COMPENSATION_PERIOD_KEY || currentPeriod(),
).trim();
if (!validPeriod(periodKey)) fail("ADVISOR_COMPENSATION_PERIOD_KEY_INVALID");
const periodKeys = [...sixMonthPeriods(periodKey)];
const capturedAt = process.env.ADVISOR_COMPENSATION_CAPTURED_AT
  ? new Date(process.env.ADVISOR_COMPENSATION_CAPTURED_AT).toISOString()
  : new Date().toISOString();
const payoutSourceState = String(
  process.env.ADVISOR_COMPENSATION_PAYOUT_SOURCE_STATE || "",
).trim() || null;
const forwardSignalSourceState = String(
  process.env.ADVISOR_COMPENSATION_FORWARD_SIGNAL_SOURCE_STATE || "DISCONNECTED",
).trim();
const periodArray = `array[${periodKeys.map(sqlLiteral).join(",")}]::text[]`;

const eventRows = await query(`
  select payload
  from public.advisor_compensation_event_ledger
  where advisor_id = ${sqlLiteral(advisorId)}::uuid
    and (
      period_key = any(${periodArray})
      or payload #>> '{metadata,incomePeriodKey}' = any(${periodArray})
    )
  order by occurred_at, created_at, id
`);
const payoutRows = await query(`
  select payload
  from public.advisor_compensation_payout_record_ledger
  where advisor_id = ${sqlLiteral(advisorId)}::uuid
    and period_key = any(${periodArray})
  order by confirmed_at, created_at, id
`);

record("remote_sources_loaded", "PASS", {
  advisorId,
  periodKey,
  periodKeys,
  eventRows: eventRows.length,
  payoutRows: payoutRows.length,
  forwardSignalRows: 0,
});

const materialization = materializeAdvisorCompensationProductReadModel({
  advisorReference: advisorId,
  periodKey,
  periodKeys,
  eventRows,
  payoutRows,
  payoutSourceState,
  forwardSignals: [],
  forwardSignalSourceState,
  capturedAt,
  metadata: {
    materializer: "scripts/materialize-advisor-compensation-product-read-model.mjs",
    materializerVersion: "ADVISOR_COMPENSATION_PRODUCT_READ_MODEL_MATERIALIZATION_001",
    sourceEventRows: eventRows.length,
    sourcePayoutRows: payoutRows.length,
    forwardSignalsConnected: false,
  },
});

const lockKey = `${advisorId}:${periodKey}:advisor-compensation-read-model`;
const insertRows = await query(`
  with lock_guard as (
    select pg_advisory_xact_lock(hashtextextended(${sqlLiteral(lockKey)}, 0))
  ),
  existing as (
    select id::text, revision, snapshot_digest, history_digest, captured_at
    from public.advisor_compensation_product_read_models, lock_guard
    where advisor_id = ${sqlLiteral(advisorId)}::uuid
      and period_key = ${sqlLiteral(periodKey)}
      and snapshot_digest = ${sqlLiteral(materialization.snapshotDigest)}
      and history_digest = ${sqlLiteral(materialization.historyDigest)}
    order by revision desc, captured_at desc, id desc
    limit 1
  ),
  next_revision as (
    select coalesce(max(revision), 0) + 1 as revision
    from public.advisor_compensation_product_read_models, lock_guard
    where advisor_id = ${sqlLiteral(advisorId)}::uuid
      and period_key = ${sqlLiteral(periodKey)}
  ),
  inserted as (
    insert into public.advisor_compensation_product_read_models (
      advisor_id,
      period_key,
      revision,
      source_state,
      snapshot_digest,
      history_digest,
      snapshot_payload,
      history_payload,
      source_health,
      captured_at,
      created_by
    )
    select
      ${sqlLiteral(advisorId)}::uuid,
      ${sqlLiteral(periodKey)},
      next_revision.revision,
      ${sqlLiteral(materialization.sourceState)},
      ${sqlLiteral(materialization.snapshotDigest)},
      ${sqlLiteral(materialization.historyDigest)},
      ${jsonbLiteral(materialization.snapshotPayload)},
      ${jsonbLiteral(materialization.historyPayload)},
      ${jsonbLiteral(materialization.sourceHealth)},
      ${sqlLiteral(materialization.capturedAt)}::timestamptz,
      ${sqlLiteral(advisorId)}::uuid
    from next_revision
    where not exists (select 1 from existing)
    returning id::text, revision, snapshot_digest, history_digest, captured_at
  )
  select
    'INSERTED'::text as action,
    id,
    revision,
    snapshot_digest,
    history_digest,
    captured_at
  from inserted
  union all
  select
    'ALREADY_MATERIALIZED'::text as action,
    id,
    revision,
    snapshot_digest,
    history_digest,
    captured_at
  from existing
  limit 1
`);

const result = insertRows[0];
assert.ok(result, "ADVISOR_COMPENSATION_MATERIALIZATION_RESULT_MISSING");
assert.ok(["INSERTED", "ALREADY_MATERIALIZED"].includes(result.action));
assert.equal(result.snapshot_digest, materialization.snapshotDigest);
assert.equal(result.history_digest, materialization.historyDigest);

const verification = await query(`
  select
    advisor_id::text as advisor_id,
    period_key,
    revision,
    source_state,
    snapshot_digest,
    history_digest,
    snapshot_payload #>> '{advisorReference}' as snapshot_advisor,
    snapshot_payload #>> '{periodKey}' as snapshot_period,
    snapshot_payload #>> '{amounts,paid,value}' as paid_value,
    snapshot_payload #>> '{amounts,real,value}' as real_value,
    source_health
  from public.advisor_compensation_product_read_models
  where id = ${sqlLiteral(result.id)}::uuid
`);
const verified = verification[0] || {};
assert.equal(verified.advisor_id, advisorId);
assert.equal(verified.snapshot_advisor, advisorId);
assert.equal(verified.period_key, periodKey);
assert.equal(verified.snapshot_period, periodKey);
assert.equal(verified.snapshot_digest, materialization.snapshotDigest);
assert.equal(verified.history_digest, materialization.historyDigest);

record("remote_materialization", "PASS", {
  action: result.action,
  advisorId,
  periodKey,
  revision: Number(result.revision),
  sourceState: materialization.sourceState,
  eventRows: eventRows.length,
  payoutRows: payoutRows.length,
  paidValue: verified.paid_value ?? null,
  realValue: verified.real_value ?? null,
  snapshotDigest: materialization.snapshotDigest,
  historyDigest: materialization.historyDigest,
  directBrowserMutation: false,
  automaticPayoutConfirmation: false,
});

console.log("ADVISOR_COMPENSATION_PRODUCT_READ_MODEL_MATERIALIZATION=PASS");
console.log(`ACTION=${result.action}`);
console.log(`ADVISOR_ID=${advisorId}`);
console.log(`PERIOD_KEY=${periodKey}`);
console.log(`REVISION=${result.revision}`);
console.log(`SOURCE_STATE=${materialization.sourceState}`);
console.log(`EVENT_ROWS=${eventRows.length}`);
console.log(`PAYOUT_ROWS=${payoutRows.length}`);
console.log(`SNAPSHOT_DIGEST=${materialization.snapshotDigest}`);
console.log(`HISTORY_DIGEST=${materialization.historyDigest}`);
console.log("SUPABASE_MUTATION=APPEND_ONLY_READ_MODEL_REVISION");
console.log("DIRECT_BROWSER_MUTATION=NO");
console.log("AUTOMATIC_PAYOUT_CONFIRMATION=NO");
