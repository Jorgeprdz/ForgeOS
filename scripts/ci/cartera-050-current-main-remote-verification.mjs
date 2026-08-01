import assert from "node:assert/strict";
import { mkdirSync, writeFileSync } from "node:fs";

const PROJECT_REF = "rmlxigxysujsuwzgoimv";
const ENDPOINT = `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`;
const EVIDENCE_DIR = "artifacts/cartera-050-current-main";
const EVIDENCE_FILE = `${EVIDENCE_DIR}/verification.json`;
const REMOTE_ACCOUNT_MUTATION = false;
const REMOTE_FIXTURE_MUTATION = false;

assert.equal(process.env.SUPABASE_PROJECT_REF, PROJECT_REF, "PROJECT_REF_MISMATCH");
assert.ok(process.env.SUPABASE_ACCESS_TOKEN, "SUPABASE_ACCESS_TOKEN_MISSING");
assert.equal(REMOTE_ACCOUNT_MUTATION, false);
assert.equal(REMOTE_FIXTURE_MUTATION, false);

mkdirSync(EVIDENCE_DIR, { recursive: true });

function redact(value) {
  return String(value || "")
    .replace(/eyJ[A-Za-z0-9._-]+/g, "[REDACTED]")
    .replace(/[A-Za-z0-9_-]{40,}/g, "[REDACTED]")
    .slice(0, 700);
}

async function query(sql) {
  const response = await fetch(ENDPOINT, {
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
    throw new Error(
      `DATABASE_QUERY_HTTP_${response.status}:${redact(body?.message || body?.error || text)}`,
    );
  }
  if (Array.isArray(body?.result)) return body.result;
  if (Array.isArray(body)) return body;
  return [];
}

const inventoryRows = await query(`
select
  to_regprocedure('public.forge_cartera050_horizon(date,date)') is not null
    as horizon_function,
  to_regprocedure('public.forge_cartera050_next_anniversary(date,date)') is not null
    as anniversary_function,
  to_regprocedure('public.forge_cartera050_list_future_radar(jsonb)') is not null
    as radar_function,
  to_regclass('public.policy_roles') is not null as policy_roles,
  to_regclass('public.commercial_people') is not null as commercial_people,
  to_regclass('public.canonical_policies') is not null as canonical_policies,
  to_regclass('public.cartera030b_expected_payment_obligations') is not null
    as payment_obligations,
  to_regclass('public.cartera040_relationship_memory_entries') is not null
    as relationship_memory,
  has_function_privilege(
    'authenticated',
    'public.forge_cartera050_list_future_radar(jsonb)',
    'EXECUTE'
  ) as authenticated_execute,
  not has_function_privilege(
    'anon',
    'public.forge_cartera050_list_future_radar(jsonb)',
    'EXECUTE'
  ) as anonymous_execute_blocked,
  exists (
    select 1
    from supabase_migrations.schema_migrations
    where version = '20260801000280'
  ) as helper_migration_recorded,
  exists (
    select 1
    from supabase_migrations.schema_migrations
    where version = '20260801000281'
  ) as radar_migration_recorded
`);

const inventory = inventoryRows[0];
assert.ok(inventory, "CARTERA050_REMOTE_INVENTORY_EMPTY");
for (const [name, value] of Object.entries(inventory)) {
  assert.equal(value, true, `CARTERA050_REMOTE_${name.toUpperCase()}_FAILED`);
}

const advisorRows = await query(`
select id::text as advisor_id
from auth.users
order by created_at, id
limit 1
`);
const advisorId = advisorRows[0]?.advisor_id;
assert.match(
  advisorId || "",
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  "CARTERA050_ACCEPTANCE_ADVISOR_REQUIRED",
);

await query(`
begin;
select set_config('request.jwt.claim.sub', '${advisorId}', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;

do $$
declare
  radar jsonb;
  item jsonb;
begin
  radar := public.forge_cartera050_list_future_radar(
    jsonb_build_object(
      'asOfDate', current_date::text,
      'timezone', 'America/Mexico_City'
    )
  );

  if jsonb_typeof(radar) <> 'object' then
    raise exception 'CARTERA050_RADAR_NOT_OBJECT';
  end if;
  if radar ->> 'readOnly' <> 'true' then
    raise exception 'CARTERA050_READ_ONLY_BOUNDARY_FAILED';
  end if;
  if jsonb_typeof(radar -> 'items') <> 'array' then
    raise exception 'CARTERA050_ITEMS_NOT_ARRAY';
  end if;
  if radar #>> '{boundaries,automaticContact}' <> 'false'
     or radar #>> '{boundaries,automaticOpportunity}' <> 'false'
     or radar #>> '{boundaries,finalMessageGeneration}' <> 'false'
     or radar #>> '{boundaries,lapseInference}' <> 'false'
     or radar #>> '{boundaries,compensationCalculation}' <> 'false'
     or radar #>> '{boundaries,finalPriorityTruth}' <> 'false'
     or radar #>> '{boundaries,humanConfirmationRequired}' <> 'true' then
    raise exception 'CARTERA050_BOUNDARY_CONTRACT_FAILED';
  end if;
  if radar #>> '{sourceAvailability,policyPayment}' <> 'AVAILABLE'
     or radar #>> '{sourceAvailability,relationshipMemory}' <> 'AVAILABLE'
     or radar #>> '{sourceAvailability,documentIntake}' <> 'AVAILABLE'
     or radar #>> '{sourceAvailability,conservationIntelligence}' <> 'ADAPTER_REQUIRED'
     or radar #>> '{sourceAvailability,compensationIntelligence}' <> 'ADAPTER_REQUIRED' then
    raise exception 'CARTERA050_SOURCE_AVAILABILITY_FAILED';
  end if;

  for item in select value from jsonb_array_elements(radar -> 'items')
  loop
    if item ->> 'advisorConfirmationRequired' <> 'true'
       or item ->> 'readOnly' <> 'true'
       or coalesce(item ->> 'whyThisPerson', '') = ''
       or coalesce(item ->> 'whyNow', '') = ''
       or coalesce(item ->> 'uncertainty', '') = ''
       or coalesce(item ->> 'smallestUsefulAction', '') = ''
       or jsonb_typeof(item -> 'evidenceSummary') <> 'array' then
      raise exception 'CARTERA050_ITEM_EXPLAINABILITY_FAILED';
    end if;
    if item ?| array[
      'riskScore',
      'lapseProbability',
      'commissionAmount',
      'payoutAmount',
      'priorityScore',
      'finalMessage'
    ] then
      raise exception 'CARTERA050_RESTRICTED_FIELD_EXPOSED';
    end if;
  end loop;
end;
$$;
rollback;
`);

const evidence = {
  status: "PASS",
  projectRef: PROJECT_REF,
  sourceSha: process.env.GITHUB_SHA || null,
  workflowRunId: process.env.GITHUB_RUN_ID || null,
  verifiedAt: new Date().toISOString(),
  remoteAccountMutation: false,
  remoteFixtureMutation: false,
  migrations: ["20260801000280", "20260801000281"],
  checks: Object.keys(inventory),
  authenticatedRpcAcceptance: "PASS",
  readOnlyBoundary: "PASS",
  explainabilityBoundary: "PASS",
  restrictedFields: "BLOCKED",
};
writeFileSync(EVIDENCE_FILE, `${JSON.stringify(evidence, null, 2)}\n`);

console.log("CARTERA_050_CURRENT_MAIN_REMOTE_VERIFICATION=PASS");
console.log(`PROJECT_REF=${PROJECT_REF}`);
console.log("REMOTE_ACCOUNT_MUTATION=NO");
console.log("REMOTE_FIXTURE_MUTATION=NO");
console.log("AUTHENTICATED_RPC_ACCEPTANCE=PASS");
