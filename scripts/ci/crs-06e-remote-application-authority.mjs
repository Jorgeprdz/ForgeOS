import assert from "node:assert/strict";
import {
  appendFileSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";

const PROJECT_REF = "rmlxigxysujsuwzgoimv";
const ENDPOINT = `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`;
const EVIDENCE_DIR = "artifacts/crs-06e-remote-application-authority";
const LEDGER_FILE = `${EVIDENCE_DIR}/ledger.jsonl`;
const RUN_MARKER = `crs06e:${process.env.GITHUB_RUN_ID || "local"}:${process.env.GITHUB_RUN_ATTEMPT || "1"}`;

const migrations = [
  {
    version: "20260801000599",
    name: "crs06_application_dependency_compatibility",
    path: "supabase/migrations/20260801000599_crs06_application_dependency_compatibility.sql",
  },
  {
    version: "20260801000600",
    name: "crs06_application_signature_authority",
    path: "supabase/migrations/20260801000600_crs06_application_signature_authority.sql",
  },
  {
    version: "20260801000601",
    name: "crs06_application_integrity_grant_hardening",
    path: "supabase/migrations/20260801000601_crs06_application_integrity_grant_hardening.sql",
  },
  {
    version: "20260801000602",
    name: "crs06_application_rpc_lifecycle_hardening",
    path: "supabase/migrations/20260801000602_crs06_application_rpc_lifecycle_hardening.sql",
  },
];

assert.equal(process.env.SUPABASE_PROJECT_REF, PROJECT_REF, "CRS06E_PROJECT_REF_MISMATCH");
assert.ok(process.env.SUPABASE_ACCESS_TOKEN, "CRS06E_SUPABASE_ACCESS_TOKEN_MISSING");

mkdirSync(EVIDENCE_DIR, { recursive: true });
writeFileSync(LEDGER_FILE, "");

function record(name, status, metadata = {}) {
  appendFileSync(LEDGER_FILE, `${JSON.stringify({
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
    .slice(0, 1200);
}

async function query(sql, label = "database_query") {
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
    const detail = redact(body?.message || body?.error || text || "QUERY_REJECTED");
    record(label, "FAIL", { httpStatus: response.status, detail });
    throw new Error(`${label.toUpperCase()}_HTTP_${response.status}:${detail}`);
  }
  if (Array.isArray(body?.result)) return body.result;
  if (Array.isArray(body)) return body;
  return [];
}

function literal(value) {
  return `'${String(value).replaceAll("'", "''")}'`;
}

const historyShape = (await query(`
select
  to_regclass('supabase_migrations.schema_migrations') is not null as history_exists,
  exists (
    select 1 from information_schema.columns
    where table_schema = 'supabase_migrations'
      and table_name = 'schema_migrations'
      and column_name = 'version'
  ) as has_version,
  exists (
    select 1 from information_schema.columns
    where table_schema = 'supabase_migrations'
      and table_name = 'schema_migrations'
      and column_name = 'name'
  ) as has_name,
  exists (
    select 1 from information_schema.columns
    where table_schema = 'supabase_migrations'
      and table_name = 'schema_migrations'
      and column_name = 'statements'
  ) as has_statements
`, "migration_history_shape"))[0];

assert.equal(historyShape?.history_exists, true, "CRS06E_MIGRATION_HISTORY_TABLE_MISSING");
assert.equal(historyShape?.has_version, true, "CRS06E_MIGRATION_HISTORY_VERSION_MISSING");

async function migrationRecorded(version) {
  const rows = await query(`
select exists (
  select 1 from supabase_migrations.schema_migrations
  where version = ${literal(version)}
) as recorded
`, `migration_${version}_history_check`);
  return rows[0]?.recorded === true;
}

async function recordMigration(migration) {
  const columns = ["version"];
  const values = [literal(migration.version)];
  if (historyShape.has_name) {
    columns.push("name");
    values.push(literal(migration.name));
  }
  if (historyShape.has_statements) {
    columns.push("statements");
    values.push(`array[${literal(`Applied by guarded CRS 06E workflow ${RUN_MARKER}`)}]::text[]`);
  }
  await query(`
insert into supabase_migrations.schema_migrations (${columns.join(", ")})
values (${values.join(", ")})
on conflict (version) do nothing
`, `migration_${migration.version}_history_write`);
  assert.equal(await migrationRecorded(migration.version), true, `CRS06E_HISTORY_${migration.version}_MISSING`);
}

const preflight = (await query(`
select
  to_regclass('public.commercial_people') is not null as person_authority,
  to_regclass('public.quote_lifecycle_quotes') is not null as quote_authority,
  to_regclass('public.quote_lifecycle_versions') is not null as quote_version_authority,
  to_regclass('public.canonical_policies') is not null as policy_authority,
  to_regclass('public.commercial_applications') is not null as application_table,
  to_regprocedure('public.forge_crs06_create_application(text,text,text,text,text,text,text,jsonb,jsonb,timestamp with time zone,text,text)') is not null as create_rpc
`, "predeployment_inventory"))[0];

assert.equal(preflight?.person_authority, true, "CRS06E_PERSON_AUTHORITY_MISSING");
assert.equal(preflight?.quote_authority, true, "CRS06E_QUOTE_AUTHORITY_MISSING");
assert.equal(preflight?.quote_version_authority, true, "CRS06E_QUOTE_VERSION_AUTHORITY_MISSING");
assert.equal(preflight?.policy_authority, true, "CRS06E_POLICY_AUTHORITY_MISSING");
if (preflight.application_table !== preflight.create_rpc) {
  throw new Error("CRS06E_PARTIAL_APPLICATION_AUTHORITY_REQUIRES_RECONCILIATION");
}
record("predeployment_inventory", "PASS", {
  applicationState: preflight.application_table ? "PRESENT" : "ABSENT",
  dependencies: "COMPLETE",
  projectRef: PROJECT_REF,
});

for (const migration of migrations) {
  if (await migrationRecorded(migration.version)) {
    record("migration_already_recorded", "PASS", { version: migration.version });
    continue;
  }
  const sql = readFileSync(migration.path, "utf8");
  assert.match(sql, /begin;[\s\S]*commit;/i, `CRS06E_TRANSACTION_REQUIRED_${migration.version}`);
  assert.doesNotMatch(sql, /\b(?:drop\s+table|truncate\s+table)\b/i, `CRS06E_DESTRUCTIVE_SQL_${migration.version}`);
  await query(sql, `migration_${migration.version}_apply`);
  await recordMigration(migration);
  record("migration_applied", "PASS", {
    version: migration.version,
    name: migration.name,
  });
}

const inventoryRows = await query(`
with tables(name) as (
  values
    ('commercial_applications'),
    ('application_versions'),
    ('application_signers'),
    ('application_signature_evidence'),
    ('application_requirements'),
    ('application_events')
), functions(signature) as (
  values
    ('public.forge_crs06_create_application(text,text,text,text,text,text,text,jsonb,jsonb,timestamp with time zone,text,text)'),
    ('public.forge_crs06_add_application_version(text,text,text,jsonb,timestamp with time zone,text,text,text)'),
    ('public.forge_crs06_record_signature_evidence(text,text,text,text,text,text,text,timestamp with time zone,timestamp with time zone,jsonb,text,text,text,text,text)'),
    ('public.forge_crs06_submit_application(text,text,jsonb,timestamp with time zone,text,text)'),
    ('public.forge_crs06_record_requirement(text,text,text,text,jsonb,timestamp with time zone,timestamp with time zone,text,text,text,text)'),
    ('public.forge_crs06_record_decision(text,text,text,jsonb,timestamp with time zone,text,text)')
)
select
  (select count(*) = 6 from tables where to_regclass('public.' || name) is not null) as tables_complete,
  (select count(*) = 6
   from tables t
   join pg_class c on c.oid = to_regclass('public.' || t.name)
   where c.relrowsecurity and c.relforcerowsecurity) as forced_rls_complete,
  (select count(*) = 6
   from tables t
   where has_table_privilege('authenticated', 'public.' || t.name, 'SELECT')) as authenticated_select_complete,
  (select count(*) = 6
   from tables t
   where not has_table_privilege('authenticated', 'public.' || t.name, 'INSERT,UPDATE,DELETE,TRUNCATE')) as direct_writes_blocked,
  (select count(*) = 6
   from functions f
   where to_regprocedure(f.signature) is not null) as rpcs_complete,
  (select count(*) = 6
   from functions f
   join pg_proc p on p.oid = to_regprocedure(f.signature)
   where p.prosecdef) as security_definer_complete,
  (select count(*) = 6
   from functions f
   where has_function_privilege('authenticated', to_regprocedure(f.signature), 'EXECUTE')) as authenticated_execute_complete,
  not exists (
    select 1
    from information_schema.routine_privileges
    where routine_schema = 'public'
      and routine_name like 'forge_crs06_%'
      and grantee in ('PUBLIC','anon')
      and privilege_type = 'EXECUTE'
  ) as public_anon_execute_blocked,
  exists (
    select 1 from pg_indexes
    where schemaname = 'public'
      and tablename = 'commercial_people'
      and indexname = 'commercial_people_owner_id_uq'
  ) as person_owner_index,
  exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'application_events'
      and column_name = 'command_digest'
      and is_nullable = 'NO'
  ) as event_command_digest,
  exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'application_signature_evidence'
      and column_name = 'command_digest'
      and is_nullable = 'NO'
  ) as signature_command_digest,
  (select count(*) = 3
   from pg_trigger
   where not tgisinternal
     and tgname in (
       'forge_crs06_versions_append_only',
       'forge_crs06_signature_evidence_append_only',
       'forge_crs06_events_append_only'
     )
     and tgenabled <> 'D') as append_only_triggers
`, "postdeployment_inventory");
const inventory = inventoryRows[0];
const requiredInventory = [
  "tables_complete",
  "forced_rls_complete",
  "authenticated_select_complete",
  "direct_writes_blocked",
  "rpcs_complete",
  "security_definer_complete",
  "authenticated_execute_complete",
  "public_anon_execute_blocked",
  "person_owner_index",
  "event_command_digest",
  "signature_command_digest",
  "append_only_triggers",
];
const inventoryFailures = requiredInventory.filter(key => inventory?.[key] !== true);
assert.deepEqual(inventoryFailures, [], `CRS06E_POSTDEPLOYMENT_INVENTORY_FAILED:${inventoryFailures.join(",")}`);
record("postdeployment_inventory", "PASS", { checks: requiredInventory });

const fixtureRows = await query(`
select
  cp.advisor_id::text as advisor_id,
  cp.person_reference,
  q.quote_reference,
  v.quote_version_reference,
  q.prospect_id::text as prospect_reference,
  q.product_reference
from public.commercial_people cp
join public.quote_lifecycle_quotes q
  on q.advisor_id = cp.advisor_id
join public.quote_lifecycle_versions v
  on v.advisor_id = q.advisor_id
 and v.quote_id = q.id
where cp.lifecycle_state = 'CONFIRMED'
  and cp.archived_at is null
  and v.confirmation_state = 'CONFIRMED'
order by q.updated_at desc, v.version_number desc, cp.updated_at desc
limit 1
`, "acceptance_fixture_discovery");
const fixture = fixtureRows[0];
assert.ok(fixture, "CRS06E_ELIGIBLE_PERSON_QUOTE_FIXTURE_MISSING");

const actorOne = fixture.advisor_id;
const actorTwo = actorOne.toLowerCase() === "00000000-0000-4000-8000-000000000001"
  ? "00000000-0000-4000-8000-000000000002"
  : "00000000-0000-4000-8000-000000000001";
const createKey = `${RUN_MARKER}:create`;
const signOneKey = `${RUN_MARKER}:sign-1`;
const signTwoKey = `${RUN_MARKER}:sign-2`;
const submitKey = `${RUN_MARKER}:submit`;
const requirementOpenKey = `${RUN_MARKER}:requirement-open`;
const requirementCloseKey = `${RUN_MARKER}:requirement-close`;
const decisionKey = `${RUN_MARKER}:decision`;

const acceptanceSql = `
begin;

select set_config('request.jwt.claim.sub', ${literal(actorOne)}, true);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;

do $$
declare
  created jsonb;
  replayed jsonb;
  signed_one jsonb;
  signed_two jsonb;
  submitted jsonb;
  requirement_opened jsonb;
  requirement_closed jsonb;
  decided jsonb;
  app_ref text;
  version_ref text;
  policy_before bigint;
  policy_after bigint;
  blocked boolean;
begin
  execute 'select count(*) from public.canonical_policies' into policy_before;

  created := public.forge_crs06_create_application(
    ${literal(fixture.person_reference)},
    ${literal(fixture.quote_reference)},
    ${literal(fixture.quote_version_reference)},
    ${literal(fixture.prospect_reference)},
    ${literal(fixture.product_reference)},
    ${literal(`${RUN_MARKER}:document`)},
    repeat('a',64),
    jsonb_build_array(${literal(`${RUN_MARKER}:quote-evidence`)}),
    jsonb_build_array(
      jsonb_build_object('signerReference',${literal(`${RUN_MARKER}:signer-1`)},'role','APPLICANT','required',true,'signatureState','PENDING'),
      jsonb_build_object('signerReference',${literal(`${RUN_MARKER}:signer-2`)},'role','OWNER','required',true,'signatureState','PENDING')
    ),
    clock_timestamp() - interval '2 minutes',
    ${literal(createKey)},
    ${literal(`${RUN_MARKER}:confirmation-create`)}
  );
  app_ref := created->>'applicationReference';
  version_ref := created->>'versionReference';
  if coalesce((created->>'idempotentReplay')::boolean,true) then raise exception 'CRS06E_CREATE_NOT_NEW'; end if;
  if coalesce((created->>'policyCreated')::boolean,true) then raise exception 'CRS06E_CREATE_POLICY_BOUNDARY_FAILED'; end if;
  perform set_config('forge.crs06e.application_ref', app_ref, true);
  perform set_config('forge.crs06e.version_ref', version_ref, true);

  replayed := public.forge_crs06_create_application(
    ${literal(fixture.person_reference)},${literal(fixture.quote_reference)},${literal(fixture.quote_version_reference)},
    ${literal(fixture.prospect_reference)},${literal(fixture.product_reference)},${literal(`${RUN_MARKER}:document`)},
    repeat('a',64),jsonb_build_array(${literal(`${RUN_MARKER}:quote-evidence`)}),
    jsonb_build_array(
      jsonb_build_object('signerReference',${literal(`${RUN_MARKER}:signer-1`)},'role','APPLICANT','required',true,'signatureState','PENDING'),
      jsonb_build_object('signerReference',${literal(`${RUN_MARKER}:signer-2`)},'role','OWNER','required',true,'signatureState','PENDING')
    ),clock_timestamp() - interval '2 minutes',${literal(createKey)},${literal(`${RUN_MARKER}:confirmation-create`)}
  );
  if not coalesce((replayed->>'idempotentReplay')::boolean,false) then raise exception 'CRS06E_CREATE_REPLAY_FAILED'; end if;

  blocked := false;
  begin
    perform public.forge_crs06_create_application(
      ${literal(fixture.person_reference)},${literal(fixture.quote_reference)},${literal(fixture.quote_version_reference)},
      ${literal(fixture.prospect_reference)},${literal(fixture.product_reference)},${literal(`${RUN_MARKER}:document`)},
      repeat('b',64),jsonb_build_array(${literal(`${RUN_MARKER}:quote-evidence`)}),
      jsonb_build_array(
        jsonb_build_object('signerReference',${literal(`${RUN_MARKER}:signer-1`)},'role','APPLICANT','required',true,'signatureState','PENDING'),
        jsonb_build_object('signerReference',${literal(`${RUN_MARKER}:signer-2`)},'role','OWNER','required',true,'signatureState','PENDING')
      ),clock_timestamp() - interval '2 minutes',${literal(createKey)},${literal(`${RUN_MARKER}:confirmation-create`)}
    );
  exception when others then
    if position('CRS06_IDEMPOTENCY_CONFLICT' in sqlerrm) > 0 then blocked := true; else raise; end if;
  end;
  if not blocked then raise exception 'CRS06E_CHANGED_CREATE_REPLAY_ALLOWED'; end if;

  blocked := false;
  begin
    perform public.forge_crs06_record_signature_evidence(
      app_ref,'application-version:00000000-0000-4000-8000-000000000099',${literal(`${RUN_MARKER}:signer-1`)},
      ${literal(`${RUN_MARKER}:signature-wrong-version`)},'SIGNED_DOCUMENT_DIGEST',repeat('c',64),null,
      clock_timestamp() - interval '90 seconds',clock_timestamp() - interval '80 seconds',
      jsonb_build_array(${literal(`${RUN_MARKER}:signature-evidence-wrong-version`)}),'VERIFIED','SENSITIVE',
      ${literal(`${RUN_MARKER}:wrong-version`)},${literal(`${RUN_MARKER}:confirmation-wrong-version`)},null
    );
  exception when others then
    if position('CRS06_CURRENT_VERSION_REQUIRED' in sqlerrm) > 0 then blocked := true; else raise; end if;
  end;
  if not blocked then raise exception 'CRS06E_WRONG_VERSION_SIGNATURE_ALLOWED'; end if;

  signed_one := public.forge_crs06_record_signature_evidence(
    app_ref,version_ref,${literal(`${RUN_MARKER}:signer-1`)},${literal(`${RUN_MARKER}:signature-1`)},
    'SIGNED_DOCUMENT_DIGEST',repeat('c',64),null,
    clock_timestamp() - interval '70 seconds',clock_timestamp() - interval '60 seconds',
    jsonb_build_array(${literal(`${RUN_MARKER}:signature-evidence-1`)}),'VERIFIED','SENSITIVE',
    ${literal(signOneKey)},${literal(`${RUN_MARKER}:confirmation-sign-1`)},null
  );
  if signed_one->>'lifecycleState' <> 'PARTIALLY_SIGNED' then raise exception 'CRS06E_PARTIAL_SIGNATURE_STATE_FAILED'; end if;

  replayed := public.forge_crs06_record_signature_evidence(
    app_ref,version_ref,${literal(`${RUN_MARKER}:signer-1`)},${literal(`${RUN_MARKER}:signature-1`)},
    'SIGNED_DOCUMENT_DIGEST',repeat('c',64),null,
    clock_timestamp() - interval '70 seconds',clock_timestamp() - interval '60 seconds',
    jsonb_build_array(${literal(`${RUN_MARKER}:signature-evidence-1`)}),'VERIFIED','SENSITIVE',
    ${literal(signOneKey)},${literal(`${RUN_MARKER}:confirmation-sign-1`)},null
  );
  if not coalesce((replayed->>'idempotentReplay')::boolean,false) then raise exception 'CRS06E_SIGNATURE_REPLAY_FAILED'; end if;

  blocked := false;
  begin
    perform public.forge_crs06_record_signature_evidence(
      app_ref,version_ref,${literal(`${RUN_MARKER}:signer-1`)},${literal(`${RUN_MARKER}:signature-1`)},
      'SIGNED_DOCUMENT_DIGEST',repeat('d',64),null,
      clock_timestamp() - interval '70 seconds',clock_timestamp() - interval '60 seconds',
      jsonb_build_array(${literal(`${RUN_MARKER}:signature-evidence-1`)}),'VERIFIED','SENSITIVE',
      ${literal(signOneKey)},${literal(`${RUN_MARKER}:confirmation-sign-1`)},null
    );
  exception when others then
    if position('CRS06_IDEMPOTENCY_CONFLICT' in sqlerrm) > 0 then blocked := true; else raise; end if;
  end;
  if not blocked then raise exception 'CRS06E_CHANGED_SIGNATURE_REPLAY_ALLOWED'; end if;

  blocked := false;
  begin
    perform public.forge_crs06_submit_application(
      app_ref,${literal(`${RUN_MARKER}:submission-early`)},jsonb_build_array(${literal(`${RUN_MARKER}:submission-evidence-early`)}),
      clock_timestamp() - interval '50 seconds',${literal(`${RUN_MARKER}:submit-early`)},${literal(`${RUN_MARKER}:confirmation-submit-early`)}
    );
  exception when others then
    if position('CRS06_SIGNED_APPLICATION_REQUIRED' in sqlerrm) > 0 then blocked := true; else raise; end if;
  end;
  if not blocked then raise exception 'CRS06E_EARLY_SUBMISSION_ALLOWED'; end if;

  signed_two := public.forge_crs06_record_signature_evidence(
    app_ref,version_ref,${literal(`${RUN_MARKER}:signer-2`)},${literal(`${RUN_MARKER}:signature-2`)},
    'SIGNED_DOCUMENT_DIGEST',repeat('e',64),null,
    clock_timestamp() - interval '45 seconds',clock_timestamp() - interval '40 seconds',
    jsonb_build_array(${literal(`${RUN_MARKER}:signature-evidence-2`)}),'VERIFIED','SENSITIVE',
    ${literal(signTwoKey)},${literal(`${RUN_MARKER}:confirmation-sign-2`)},null
  );
  if signed_two->>'lifecycleState' <> 'SIGNED' then raise exception 'CRS06E_COMPLETE_SIGNATURE_STATE_FAILED'; end if;

  submitted := public.forge_crs06_submit_application(
    app_ref,${literal(`${RUN_MARKER}:submission`)},jsonb_build_array(${literal(`${RUN_MARKER}:submission-evidence`)}),
    clock_timestamp() - interval '35 seconds',${literal(submitKey)},${literal(`${RUN_MARKER}:confirmation-submit`)}
  );
  if submitted->>'lifecycleState' <> 'SUBMITTED' then raise exception 'CRS06E_SUBMISSION_STATE_FAILED'; end if;
  if coalesce((submitted->>'policyCreated')::boolean,true) then raise exception 'CRS06E_SUBMISSION_POLICY_BOUNDARY_FAILED'; end if;

  replayed := public.forge_crs06_submit_application(
    app_ref,${literal(`${RUN_MARKER}:submission`)},jsonb_build_array(${literal(`${RUN_MARKER}:submission-evidence`)}),
    clock_timestamp() - interval '35 seconds',${literal(submitKey)},${literal(`${RUN_MARKER}:confirmation-submit`)}
  );
  if not coalesce((replayed->>'idempotentReplay')::boolean,false) then raise exception 'CRS06E_SUBMISSION_REPLAY_FAILED'; end if;

  requirement_opened := public.forge_crs06_record_requirement(
    app_ref,${literal(`${RUN_MARKER}:requirement`)},'IDENTITY_DOCUMENT','OPEN','[]'::jsonb,
    clock_timestamp() - interval '30 seconds',null,null,
    ${literal(requirementOpenKey)},${literal(`${RUN_MARKER}:confirmation-requirement-open`)},null
  );
  if requirement_opened->>'lifecycleState' <> 'REQUIREMENTS_PENDING' then raise exception 'CRS06E_REQUIREMENT_PENDING_STATE_FAILED'; end if;

  blocked := false;
  begin
    perform public.forge_crs06_record_decision(
      app_ref,'APPROVED',${literal(`${RUN_MARKER}:decision-too-early`)},jsonb_build_array(${literal(`${RUN_MARKER}:decision-evidence-too-early`)}),
      clock_timestamp() - interval '25 seconds',${literal(`${RUN_MARKER}:decision-too-early-key`)},${literal(`${RUN_MARKER}:confirmation-decision-too-early`)}
    );
  exception when others then
    if position('CRS06_APPROVAL_STATE_INVALID' in sqlerrm) > 0
       or position('CRS06_UNRESOLVED_REQUIREMENTS_BLOCK_APPROVAL' in sqlerrm) > 0 then blocked := true; else raise; end if;
  end;
  if not blocked then raise exception 'CRS06E_APPROVAL_WITH_OPEN_REQUIREMENT_ALLOWED'; end if;

  requirement_closed := public.forge_crs06_record_requirement(
    app_ref,${literal(`${RUN_MARKER}:requirement`)},'IDENTITY_DOCUMENT','SATISFIED',
    jsonb_build_array(${literal(`${RUN_MARKER}:requirement-evidence`)}),
    clock_timestamp() - interval '30 seconds',clock_timestamp() - interval '20 seconds',
    ${literal(`${RUN_MARKER}:requirement-review`)},${literal(requirementCloseKey)},
    ${literal(`${RUN_MARKER}:confirmation-requirement-close`)},null
  );
  if requirement_closed->>'lifecycleState' <> 'REQUIREMENTS_SATISFIED' then raise exception 'CRS06E_REQUIREMENT_SATISFIED_STATE_FAILED'; end if;

  decided := public.forge_crs06_record_decision(
    app_ref,'APPROVED',${literal(`${RUN_MARKER}:decision`)},jsonb_build_array(${literal(`${RUN_MARKER}:decision-evidence`)}),
    clock_timestamp() - interval '10 seconds',${literal(decisionKey)},${literal(`${RUN_MARKER}:confirmation-decision`)}
  );
  if decided->>'lifecycleState' <> 'APPROVED' then raise exception 'CRS06E_APPROVAL_STATE_FAILED'; end if;
  if coalesce((decided->>'policyCreated')::boolean,true) then raise exception 'CRS06E_APPROVAL_POLICY_BOUNDARY_FAILED'; end if;
  if not coalesce((decided->>'issuanceEvidenceRequiredForPolicy')::boolean,false) then raise exception 'CRS06E_ISSUANCE_BOUNDARY_FAILED'; end if;

  replayed := public.forge_crs06_record_decision(
    app_ref,'APPROVED',${literal(`${RUN_MARKER}:decision`)},jsonb_build_array(${literal(`${RUN_MARKER}:decision-evidence`)}),
    clock_timestamp() - interval '10 seconds',${literal(decisionKey)},${literal(`${RUN_MARKER}:confirmation-decision`)}
  );
  if not coalesce((replayed->>'idempotentReplay')::boolean,false) then raise exception 'CRS06E_DECISION_REPLAY_FAILED'; end if;

  execute 'select count(*) from public.canonical_policies' into policy_after;
  if policy_after <> policy_before then raise exception 'CRS06E_POLICY_COUNT_CHANGED'; end if;

  blocked := false;
  begin
    update public.commercial_applications set lifecycle_state = 'DECLINED' where application_reference = app_ref;
  exception when insufficient_privilege then blocked := true;
  end;
  if not blocked then raise exception 'CRS06E_DIRECT_APPLICATION_UPDATE_ALLOWED'; end if;

  if (select count(*) from public.application_events where application_id = (
    select id from public.commercial_applications where application_reference = app_ref
  )) < 7 then raise exception 'CRS06E_EVENT_LINEAGE_INCOMPLETE'; end if;
end;
$$;

reset role;

do $$
declare
  app_ref text := current_setting('forge.crs06e.application_ref');
  version_ref text := current_setting('forge.crs06e.version_ref');
  blocked boolean := false;
begin
  begin
    update public.application_versions
    set document_reference = document_reference
    where version_reference = version_ref;
  exception when others then
    if position('CRS06_APPEND_ONLY_MUTATION_DENIED' in sqlerrm) > 0 then blocked := true; else raise; end if;
  end;
  if not blocked then raise exception 'CRS06E_VERSION_APPEND_ONLY_FAILED'; end if;

  blocked := false;
  begin
    delete from public.application_events
    where application_id = (
      select id from public.commercial_applications where application_reference = app_ref
    );
  exception when others then
    if position('CRS06_APPEND_ONLY_MUTATION_DENIED' in sqlerrm) > 0 then blocked := true; else raise; end if;
  end;
  if not blocked then raise exception 'CRS06E_EVENT_APPEND_ONLY_FAILED'; end if;
end;
$$;

select set_config('request.jwt.claim.sub', ${literal(actorTwo)}, true);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;

do $$
declare
  app_ref text := current_setting('forge.crs06e.application_ref');
  visible_count integer;
  blocked boolean := false;
begin
  select count(*) into visible_count
  from public.commercial_applications
  where application_reference = app_ref;
  if visible_count <> 0 then raise exception 'CRS06E_CROSS_ADVISOR_READ_VISIBLE'; end if;

  begin
    perform public.forge_crs06_submit_application(
      app_ref,${literal(`${RUN_MARKER}:cross-advisor-submission`)},
      jsonb_build_array(${literal(`${RUN_MARKER}:cross-advisor-evidence`)}),
      clock_timestamp(),${literal(`${RUN_MARKER}:cross-advisor-key`)},
      ${literal(`${RUN_MARKER}:cross-advisor-confirmation`)}
    );
  exception when others then
    if position('CRS06_APPLICATION_REQUIRED' in sqlerrm) > 0 then blocked := true; else raise; end if;
  end;
  if not blocked then raise exception 'CRS06E_CROSS_ADVISOR_RPC_ALLOWED'; end if;
end;
$$;

rollback;
`;

await query(acceptanceSql, "transactional_runtime_acceptance");
record("transactional_runtime_acceptance", "PASS", {
  ownerAdvisor: actorOne,
  crossAdvisor: actorTwo,
  fixtureRollback: true,
});

const residualRows = await query(`
select
  (select count(*) from public.application_events where idempotency_key like ${literal(`${RUN_MARKER}%`)})::integer as event_residuals,
  (select count(*) from public.application_signature_evidence where idempotency_key like ${literal(`${RUN_MARKER}%`)})::integer as signature_residuals
`, "residual_fixture_check");
const residual = residualRows[0];
assert.equal(Number(residual?.event_residuals || 0), 0, "CRS06E_EVENT_FIXTURE_RESIDUAL");
assert.equal(Number(residual?.signature_residuals || 0), 0, "CRS06E_SIGNATURE_FIXTURE_RESIDUAL");
record("residual_fixture_check", "PASS", { residualFixtures: 0 });

console.log("CRS_06E_REMOTE_SUPABASE_DEPLOYMENT=PASS");
console.log("CRS_06E_REMOTE_RLS_ACCEPTANCE=PASS");
console.log("CRS_06E_REMOTE_RPC_ACCEPTANCE=PASS");
console.log("CRS_06E_IDEMPOTENT_REPLAY=PASS");
console.log("CRS_06E_CHANGED_INPUT_CONFLICT=PASS");
console.log("CRS_06E_REQUIRED_SIGNATURE_GATE=PASS");
console.log("CRS_06E_REQUIREMENTS_LIFECYCLE=PASS");
console.log("CRS_06E_CROSS_ADVISOR_ISOLATION=PASS");
console.log("CRS_06E_DIRECT_WRITES_BLOCKED=PASS");
console.log("CRS_06E_APPEND_ONLY=PASS");
console.log("CRS_06E_POLICY_BOUNDARY=PASS");
console.log("TEST_FIXTURES_ROLLED_BACK=YES");
console.log("RESIDUAL_FIXTURES=0");
console.log("CRS_06E_REMOTE_APPLICATION_AUTHORITY=PASS");
