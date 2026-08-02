import assert from "node:assert/strict";
import {
  appendFileSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";

const PROJECT_REF = "rmlxigxysujsuwzgoimv";
const MIGRATION_VERSION = "20260802090000";
const MIGRATION_NAME = "advisor_compensation_productive_authority";
const MIGRATION_FILE = `supabase/migrations/${MIGRATION_VERSION}_${MIGRATION_NAME}.sql`;
const ENDPOINT = `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`;
const APPLY_TOKEN = "APPLY_ADVISOR_COMPENSATION_STAGE_100";
const validateOnly = process.argv.includes("--validate-only");
const evidenceDir = "artifacts/advisor-compensation-stage-100-remote";
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

function redact(value) {
  return String(value || "")
    .replace(/eyJ[A-Za-z0-9._-]+/g, "[REDACTED]")
    .replace(/[A-Za-z0-9_-]{40,}/g, "[REDACTED]")
    .slice(0, 900);
}

const sql = readFileSync(MIGRATION_FILE, "utf8");
assert.match(sql, /^begin;[\s\S]*commit;\s*$/i, "TRANSACTION_BOUNDARY_REQUIRED");
assert.doesNotMatch(sql, /\b(?:drop\s+table|truncate)\b/i, "DESTRUCTIVE_SQL_REJECTED");
assert.match(sql, /enable row level security/gi, "RLS_REQUIRED");
assert.match(sql, /force row level security/gi, "FORCED_RLS_REQUIRED");
assert.match(sql, /auth\.uid\(\)/g, "OWNER_SCOPE_REQUIRED");
assert.match(sql, /append_only_guard/g, "APPEND_ONLY_GUARD_REQUIRED");
assert.match(sql, /revoke all[\s\S]*authenticated/gi, "DIRECT_MUTATION_REVOKE_REQUIRED");
assert.match(sql, /forge_advisor_compensation_read_product/g, "PRODUCT_READ_RPC_REQUIRED");
assert.match(sql, /forge_advisor_compensation_authority_inventory/g, "INVENTORY_RPC_REQUIRED");
assert.doesNotMatch(sql, /security\s+definer/i, "BROWSER_READ_RPC_MUST_NOT_BYPASS_RLS");
record("migration_static_validation", "PASS", {
  migration: MIGRATION_VERSION,
  destructiveSql: false,
  ownerScoped: true,
  directBrowserMutation: false,
});

if (validateOnly) {
  console.log("ADVISOR_COMPENSATION_STAGE_100_REMOTE_PLAN=PASS");
  console.log("REMOTE_DEPLOYMENT=PREPARED_NOT_APPLIED");
  console.log(`MIGRATION=${MIGRATION_VERSION}`);
  process.exit(0);
}

assert.equal(
  process.env.ADVISOR_COMPENSATION_REMOTE_DEPLOYMENT,
  APPLY_TOKEN,
  "EXPLICIT_REMOTE_DEPLOYMENT_AUTHORIZATION_REQUIRED",
);
assert.equal(process.env.SUPABASE_PROJECT_REF, PROJECT_REF, "PROJECT_REF_MISMATCH");
assert.ok(process.env.SUPABASE_ACCESS_TOKEN, "SUPABASE_ACCESS_TOKEN_MISSING");

async function query(statement) {
  const response = await fetch(ENDPOINT, {
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

const inventorySql = `
with refs as (
  select
    to_regclass('public.advisor_compensation_event_ledger') as event_table_ref,
    to_regclass('public.advisor_compensation_payout_evidence_ledger') as evidence_table_ref,
    to_regclass('public.advisor_compensation_payout_decision_ledger') as decision_table_ref,
    to_regclass('public.advisor_compensation_payout_record_ledger') as payout_table_ref,
    to_regclass('public.advisor_compensation_product_read_models') as read_model_table_ref,
    to_regprocedure('public.forge_advisor_compensation_authority_inventory()') as inventory_rpc_ref,
    to_regprocedure('public.forge_advisor_compensation_read_product(text,text[])') as read_rpc_ref
)
select
  event_table_ref is not null as event_table,
  evidence_table_ref is not null as evidence_table,
  decision_table_ref is not null as decision_table,
  payout_table_ref is not null as payout_table,
  read_model_table_ref is not null as read_model_table,
  inventory_rpc_ref is not null as inventory_rpc,
  read_rpc_ref is not null as read_rpc,
  coalesce((select relrowsecurity and relforcerowsecurity from pg_class where oid = read_model_table_ref), false) as read_model_rls,
  case
    when read_model_table_ref is null then false
    else exists(
      select 1
      from pg_trigger
      where tgrelid = read_model_table_ref
        and tgname = 'forge_advisor_compensation_read_models_append_only'
        and tgenabled <> 'D'
    )
  end as read_model_append_only,
  case
    when read_model_table_ref is null then false
    else coalesce(has_table_privilege('authenticated', read_model_table_ref, 'SELECT'), false)
  end as authenticated_select,
  case
    when read_model_table_ref is null then false
    else not coalesce(has_table_privilege('authenticated', read_model_table_ref, 'INSERT,UPDATE,DELETE,TRUNCATE'), false)
  end as authenticated_mutation_blocked,
  case
    when read_model_table_ref is null then false
    else not coalesce(has_table_privilege('anon', read_model_table_ref, 'SELECT,INSERT,UPDATE,DELETE,TRUNCATE'), false)
  end as anon_blocked,
  case
    when read_rpc_ref is null then false
    else coalesce(has_function_privilege('authenticated', read_rpc_ref, 'EXECUTE'), false)
  end as authenticated_rpc,
  case
    when read_rpc_ref is null then false
    else not coalesce(has_function_privilege('anon', read_rpc_ref, 'EXECUTE'), false)
  end as anon_rpc_blocked
from refs
`;
const required = [
  "event_table",
  "evidence_table",
  "decision_table",
  "payout_table",
  "read_model_table",
  "inventory_rpc",
  "read_rpc",
  "read_model_rls",
  "read_model_append_only",
  "authenticated_select",
  "authenticated_mutation_blocked",
  "anon_blocked",
  "authenticated_rpc",
  "anon_rpc_blocked",
];
const complete = (row) => required.every((key) => row?.[key] === true);

const before = (await query(inventorySql))[0] || {};
if (!complete(before)) {
  const partial = Object.values(before).some((value) => value === true);
  if (partial) {
    const missing = required.filter((key) => before[key] !== true);
    record("predeployment_inventory", "FAIL", { state: "PARTIAL", missing });
    throw new Error(`PARTIAL_REMOTE_AUTHORITY_REQUIRES_RECONCILIATION:${missing.join(",")}`);
  }
  await query(sql);
  record("migration_applied", "PASS", { migration: MIGRATION_VERSION });
} else {
  record("migration_already_satisfied", "PASS", { migration: MIGRATION_VERSION });
}

const after = (await query(inventorySql))[0] || {};
assert.equal(complete(after), true, `POSTDEPLOYMENT_AUTHORITY_INCOMPLETE:${required.filter((key) => after[key] !== true).join(",")}`);
record("postdeployment_inventory", "PASS", { checks: required });

const advisorRows = await query(`select id::text as advisor_id from auth.users order by created_at, id limit 1`);
const advisorOne = advisorRows[0]?.advisor_id;
assert.match(advisorOne || "", /^[0-9a-f-]{36}$/i, "AUTH_ADVISOR_REQUIRED_FOR_ACCEPTANCE");
const advisorTwo = advisorOne === "00000000-0000-4000-8000-000000000001"
  ? "00000000-0000-4000-8000-000000000002"
  : "00000000-0000-4000-8000-000000000001";
const period = "2199-12";
const digestA = "a".repeat(64);
const digestB = "b".repeat(64);
const digestC = "c".repeat(64);
const digestD = "d".repeat(64);

const transactional = `
begin;
insert into public.advisor_compensation_product_read_models (
  advisor_id, period_key, revision, source_state, snapshot_digest, history_digest,
  snapshot_payload, history_payload, source_health, captured_at, created_by
) values
(
  '${advisorOne}'::uuid, '${period}', 1, 'READY', '${digestA}', '${digestB}',
  jsonb_build_object(
    'contractVersion','ADVISOR_COMPENSATION_PERIOD_SNAPSHOT_001',
    'snapshotId','acceptance-own',
    'snapshotDigest','${digestA}',
    'advisorReference','${advisorOne}',
    'periodKey','${period}',
    'currency','MXN',
    'status','READY',
    'capturedAt','2199-12-15T12:00:00.000Z',
    'amounts',jsonb_build_object(
      'estimated',0,
      'earned',jsonb_build_object('gross',100,'adjustments',0,'reversals',0,'net',100),
      'paid',jsonb_build_object('sourceState','AVAILABLE','value',90,'knownZero',false),
      'real',jsonb_build_object('basis','PAID','value',90),
      'potential',0,
      'atRisk',0
    ),
    'counts',jsonb_build_object('earnedAggregates',1),
    'details',jsonb_build_object('aggregates',jsonb_build_array()),
    'sourceHealth',jsonb_build_object('compensationEvents','AVAILABLE','payoutTruth','AVAILABLE')
  ),
  jsonb_build_object(
    'contractVersion','ADVISOR_COMPENSATION_HISTORY_SERIES_001',
    'seriesId','acceptance-history-own',
    'seriesDigest','${digestB}',
    'advisorReference','${advisorOne}',
    'currency','MXN',
    'capturedAt','2199-12-15T12:00:00.000Z',
    'points',jsonb_build_array(jsonb_build_object('periodKey','${period}','real',90,'realBasis','PAID','paid',90,'earnedNet',100,'estimated',0,'potential',0,'atRisk',0))
  ),
  jsonb_build_object('canonicalSnapshot','READY','historicalSeries','AVAILABLE'),
  '2199-12-15T12:00:00.000Z', '${advisorOne}'::uuid
),
(
  '${advisorTwo}'::uuid, '${period}', 1, 'READY', '${digestC}', '${digestD}',
  jsonb_build_object('contractVersion','ADVISOR_COMPENSATION_PERIOD_SNAPSHOT_001','snapshotDigest','${digestC}','advisorReference','${advisorTwo}','periodKey','${period}','currency','MXN','status','READY','capturedAt','2199-12-15T12:00:00.000Z','amounts',jsonb_build_object('real',jsonb_build_object('basis','PAID','value',999999))),
  jsonb_build_object('contractVersion','ADVISOR_COMPENSATION_HISTORY_SERIES_001','seriesDigest','${digestD}','advisorReference','${advisorTwo}','points',jsonb_build_array()),
  '{}'::jsonb,
  '2199-12-15T12:00:00.000Z', '${advisorTwo}'::uuid
);

select set_config('request.jwt.claim.sub', '${advisorOne}', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;

do $$
declare
  v_product jsonb;
  v_mutation_blocked boolean := false;
begin
  v_product := public.forge_advisor_compensation_read_product('${period}', array['${period}']);
  if v_product #>> '{snapshot,advisorReference}' <> '${advisorOne}' then
    raise exception 'OWNER_SCOPED_READ_FAILED';
  end if;
  if (v_product #>> '{snapshot,amounts,real,value}')::numeric <> 90 then
    raise exception 'PRODUCT_READ_VALUE_FAILED';
  end if;
  if v_product::text like '%999999%' then
    raise exception 'CROSS_OWNER_LEAKAGE_DETECTED';
  end if;
  begin
    insert into public.advisor_compensation_product_read_models (
      advisor_id, period_key, revision, source_state, snapshot_digest, history_digest,
      snapshot_payload, history_payload, captured_at
    ) values (
      '${advisorOne}'::uuid, '${period}', 2, 'READY', '${digestC}', '${digestD}',
      '{}'::jsonb, '{}'::jsonb, now()
    );
  exception when insufficient_privilege then
    v_mutation_blocked := true;
  end;
  if not v_mutation_blocked then
    raise exception 'DIRECT_BROWSER_INSERT_WAS_ALLOWED';
  end if;
end;
$$;
rollback;
`;
await query(transactional);
record("transactional_acceptance", "PASS", {
  ownerIsolation: true,
  productRead: true,
  directMutationBlocked: true,
  rollback: true,
  residuals: 0,
});

console.log("ADVISOR_COMPENSATION_STAGE_100_REMOTE_DEPLOYMENT=PASS");
console.log(`MIGRATION=${MIGRATION_VERSION}`);
console.log("TRANSACTIONAL_ACCEPTANCE=PASS");
console.log("ZERO_RESIDUALS=PASS");
