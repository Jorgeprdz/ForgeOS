import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { appendFileSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";

const PROJECT_REF = "rmlxigxysujsuwzgoimv";
const MIGRATION_VERSION = "20260801000610";
const MIGRATION_NAME = "crs07_application_policy_lineage_reconciliation";
const MIGRATION_PATH = "supabase/migrations/20260801000610_crs07_application_policy_lineage_reconciliation.sql";
const ENDPOINT = `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`;
const EVIDENCE_DIR = "artifacts/crs-07-application-policy-lineage";
const LEDGER = `${EVIDENCE_DIR}/runtime-ledger.jsonl`;
const RUN = `crs07:${process.env.GITHUB_RUN_ID || "local"}:${process.env.GITHUB_RUN_ATTEMPT || "1"}`;

assert.equal(process.env.SUPABASE_PROJECT_REF, PROJECT_REF, "CRS07_PROJECT_REF_MISMATCH");
assert.ok(process.env.SUPABASE_ACCESS_TOKEN, "CRS07_SUPABASE_ACCESS_TOKEN_MISSING");
mkdirSync(EVIDENCE_DIR, { recursive: true });
writeFileSync(LEDGER, "");

const literal = value => `'${String(value).replaceAll("'", "''")}'`;
function record(name, status, metadata = {}) {
  appendFileSync(LEDGER, `${JSON.stringify({ at: new Date().toISOString(), name, status, ...metadata })}\n`);
}
function redact(value) {
  return String(value || "")
    .replace(/eyJ[A-Za-z0-9._-]+/g, "[REDACTED]")
    .replace(/[A-Za-z0-9_-]{40,}/g, "[REDACTED]")
    .slice(0, 1200);
}
async function query(sql, label) {
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
  try { body = JSON.parse(text); } catch { body = { message: "NON_JSON_RESPONSE" }; }
  if (!response.ok || body?.error) {
    const detail = redact(body?.message || body?.error || text);
    record(label, "FAIL", { httpStatus: response.status, detail });
    throw new Error(`${label.toUpperCase()}_HTTP_${response.status}:${detail}`);
  }
  return Array.isArray(body?.result) ? body.result : Array.isArray(body) ? body : [];
}

const state = (await query(`
select exists (
  select 1 from supabase_migrations.schema_migrations
  where version = ${literal(MIGRATION_VERSION)}
) as recorded
`, "migration_state"))[0];

if (state?.recorded !== true) {
  const sql = readFileSync(MIGRATION_PATH, "utf8");
  assert.match(sql, /begin;[\s\S]*commit;/i);
  assert.doesNotMatch(sql, /\b(?:drop\s+table|truncate\s+table)\b/i);
  await query(sql, "migration_apply");
  const shape = (await query(`
select
  exists (select 1 from information_schema.columns
    where table_schema='supabase_migrations' and table_name='schema_migrations' and column_name='name') as has_name,
  exists (select 1 from information_schema.columns
    where table_schema='supabase_migrations' and table_name='schema_migrations' and column_name='statements') as has_statements
`, "migration_history_shape"))[0];
  const columns = ["version"];
  const values = [literal(MIGRATION_VERSION)];
  if (shape?.has_name) {
    columns.push("name");
    values.push(literal(MIGRATION_NAME));
  }
  if (shape?.has_statements) {
    columns.push("statements");
    values.push(`array[${literal("Applied by authorized CRS 07 remote gate")}]::text[]`);
  }
  await query(`
insert into supabase_migrations.schema_migrations (${columns.join(",")})
values (${values.join(",")}) on conflict (version) do nothing
`, "migration_history_record");
}

const inventory = (await query(`
select
  exists(select 1 from supabase_migrations.schema_migrations where version='${MIGRATION_VERSION}') as history_recorded,
  to_regprocedure('public.forge_crs07_confirm_issued_policy_from_application(jsonb)') is not null as wrapper_exists,
  coalesce((select prosecdef from pg_proc where oid=to_regprocedure('public.forge_crs07_confirm_issued_policy_from_application(jsonb)')),false) as wrapper_security_definer,
  has_function_privilege('authenticated',to_regprocedure('public.forge_crs07_confirm_issued_policy_from_application(jsonb)'),'EXECUTE') as authenticated_execute,
  not has_function_privilege('anon',to_regprocedure('public.forge_crs07_confirm_issued_policy_from_application(jsonb)'),'EXECUTE') as anon_blocked,
  not exists (
    select 1 from information_schema.routine_privileges
    where routine_schema='public'
      and routine_name='forge_crs07_confirm_issued_policy_from_application'
      and grantee='PUBLIC' and privilege_type='EXECUTE'
  ) as public_blocked,
  exists(select 1 from pg_indexes where schemaname='public' and indexname='policy_versions_application_lineage_idx') as lineage_index,
  exists(select 1 from pg_trigger where tgname='forge_crs07_application_lineage_insert_guard' and not tgisinternal and tgenabled<>'D') as insert_guard,
  exists(select 1 from pg_trigger where tgname='forge_crs07_application_lineage_commit_guard' and not tgisinternal and tgenabled<>'D') as commit_guard,
  to_regclass('public.crs07_application_policy_lineage') is null as no_second_lineage_table
`, "remote_inventory"))[0];

for (const key of [
  "history_recorded", "wrapper_exists", "wrapper_security_definer", "authenticated_execute",
  "anon_blocked", "public_blocked", "lineage_index", "insert_guard", "commit_guard",
  "no_second_lineage_table",
]) {
  assert.equal(inventory?.[key], true, `CRS07_INVENTORY_${key}`);
}
record("remote_inventory", "PASS", inventory);

const actorRow = (await query(`
select u.id::text as advisor_id
from auth.users u
left join public.forge_demo_advisors demo on demo.advisor_id = u.id
where demo.advisor_id is null
order by u.created_at, u.id
limit 1
`, "non_demo_actor_discovery"))[0];
assert.ok(actorRow?.advisor_id, "CRS07_NON_DEMO_ADVISOR_MISSING");
const actor = actorRow.advisor_id;
record("non_demo_actor_discovery", "PASS", { protectedDemoRegistryExcluded: true });

const other = actor.toLowerCase() === "00000000-0000-4000-8000-000000000001"
  ? "00000000-0000-4000-8000-000000000002"
  : "00000000-0000-4000-8000-000000000001";
const prospectId = randomUUID();
const personId = randomUUID();
const quoteId = randomUUID();
const quoteVersionId = randomUUID();
const personReference = `person:${randomUUID()}`;
const quoteReference = `quote:${randomUUID()}`;
const quoteVersionReference = `quote-version:${randomUUID()}`;
const productReference = `product:crs07:${randomUUID()}`;
const base = Date.now() - 15 * 60 * 1000;
const at = seconds => new Date(base + seconds * 1000).toISOString();
const t = { fixture: at(-30), create: at(0), signed: at(30), captured: at(35), submitted: at(60), approved: at(90), issued: at(120) };

const acceptanceSql = `
begin;
select set_config('request.jwt.claim.sub',${literal(actor)},true);
select set_config('request.jwt.claim.role','authenticated',true);

-- Privileged, rollback-only prerequisites for a real non-demo owner. These rows
-- exist solely inside this transaction; productive Application/Policy commands
-- below still execute as authenticated and through their governed RPCs.
insert into public.prospects (
  id, advisor_id, alias, display_name, full_name, phone_normalized,
  source, initial_context, status, created_by, updated_by, created_at, updated_at
) values (
  ${literal(prospectId)}::uuid, ${literal(actor)}::uuid,
  'CRS07 fixture', 'CRS07 fixture', 'CRS07 fixture', '+525500000001',
  'crs07_remote_acceptance', 'Rollback-only CRS07 prerequisite', 'referred_new',
  ${literal(actor)}::uuid, ${literal(actor)}::uuid,
  ${literal(t.fixture)}::timestamptz, ${literal(t.fixture)}::timestamptz
);

insert into public.commercial_people (
  id, advisor_id, person_reference, display_name, preferred_name,
  normalized_name, lifecycle_state, privacy_classification,
  evidence_references, created_at, created_by, updated_at, version
) values (
  ${literal(personId)}::uuid, ${literal(actor)}::uuid, ${literal(personReference)},
  'CRS07 Fixture Person', 'CRS07', 'crs07 fixture person',
  'CONFIRMED', 'SENSITIVE', jsonb_build_array(${literal(`${RUN}:person-evidence`)}),
  ${literal(t.fixture)}::timestamptz, ${literal(actor)}::uuid,
  ${literal(t.fixture)}::timestamptz, 1
);

insert into public.quote_lifecycle_quotes (
  id, quote_reference, advisor_id, prospect_id, product_reference,
  current_version, lifecycle_state, created_at, updated_at
) values (
  ${literal(quoteId)}::uuid, ${literal(quoteReference)}, ${literal(actor)}::uuid,
  ${literal(prospectId)}::uuid, ${literal(productReference)}, 1, 'REVIEWED',
  ${literal(t.fixture)}::timestamptz, ${literal(t.fixture)}::timestamptz
);

insert into public.quote_lifecycle_versions (
  id, quote_id, advisor_id, quote_version_reference, version_number,
  review_snapshot, snapshot_digest, source_record_reference,
  source_evidence_references, freshness_metadata, confirmation_state, created_at
) values (
  ${literal(quoteVersionId)}::uuid, ${literal(quoteId)}::uuid, ${literal(actor)}::uuid,
  ${literal(quoteVersionReference)}, 1,
  jsonb_build_object('authority','CRS07_ROLLBACK_FIXTURE'), repeat('9',64),
  ${literal(`${RUN}:quote-source`)}, jsonb_build_array(${literal(`${RUN}:quote-evidence`)}),
  jsonb_build_object('status','CURRENT'), 'CONFIRMED', ${literal(t.fixture)}::timestamptz
);

set local role authenticated;

do $$
declare
  created jsonb;
  signed jsonb;
  submitted jsonb;
  approved jsonb;
  confirmed jsonb;
  replayed jsonb;
  conflict jsonb;
  app_ref text;
  version_ref text;
  policy_ref text := ${literal(`${RUN}:policy`)};
  evidence_ref text := ${literal(`${RUN}:evidence`)};
  role_ref text := ${literal(`${RUN}:role`)};
  policy_number text := ${literal(`CRS07-${process.env.GITHUB_RUN_ID || "local"}-${process.env.GITHUB_RUN_ATTEMPT || "1"}`)};
  command jsonb;
  bad jsonb;
  blocked boolean;
  policy_before bigint;
  policy_after bigint;
begin
  select count(*) into policy_before from public.canonical_policies;

  created := public.forge_crs06_create_application(
    ${literal(personReference)}, ${literal(quoteReference)},
    ${literal(quoteVersionReference)}, ${literal(prospectId)},
    ${literal(productReference)}, ${literal(`${RUN}:document`)}, repeat('a',64),
    jsonb_build_array(${literal(`${RUN}:quote-evidence`)}),
    jsonb_build_array(jsonb_build_object(
      'signerReference',${literal(`${RUN}:signer`)},'role','APPLICANT','required',true,'signatureState','PENDING'
    )),
    ${literal(t.create)}::timestamptz, ${literal(`${RUN}:create`)}, ${literal(`${RUN}:confirm-create`)}
  );
  app_ref := created->>'applicationReference';
  version_ref := created->>'versionReference';

  signed := public.forge_crs06_record_signature_evidence(
    app_ref, version_ref, ${literal(`${RUN}:signer`)}, ${literal(`${RUN}:signature`)},
    'SIGNED_DOCUMENT_DIGEST', repeat('b',64), null,
    ${literal(t.signed)}::timestamptz, ${literal(t.captured)}::timestamptz,
    jsonb_build_array(${literal(`${RUN}:signature-evidence`)}), 'VERIFIED', 'SENSITIVE',
    ${literal(`${RUN}:sign`)}, ${literal(`${RUN}:confirm-sign`)}, null
  );
  if signed->>'lifecycleState' <> 'SIGNED' then
    raise exception 'CRS07_APPLICATION_SIGNATURE_FAILED';
  end if;

  submitted := public.forge_crs06_submit_application(
    app_ref, ${literal(`${RUN}:submission`)},
    jsonb_build_array(${literal(`${RUN}:submission-evidence`)}),
    ${literal(t.submitted)}::timestamptz, ${literal(`${RUN}:submit`)}, ${literal(`${RUN}:confirm-submit`)}
  );
  approved := public.forge_crs06_record_decision(
    app_ref, 'APPROVED', ${literal(`${RUN}:decision`)},
    jsonb_build_array(${literal(`${RUN}:approval-evidence`)}),
    ${literal(t.approved)}::timestamptz, ${literal(`${RUN}:approve`)}, ${literal(`${RUN}:confirm-approve`)}
  );
  if approved->>'lifecycleState' <> 'APPROVED' then
    raise exception 'CRS07_APPLICATION_APPROVAL_FAILED';
  end if;

  command := jsonb_build_object(
    'contractType','FORGE_CONFIRMED_POLICY_COMMAND',
    'contractVersion','CARTERA-010B.1',
    'advisorId',${literal(actor)},
    'actorReference',${literal(actor)},
    'idempotencyKey',${literal(`${RUN}:policy-command`)},
    'confirmedAt',${literal(t.issued)},
    'policy',jsonb_build_object(
      'contractType','FORGE_CANONICAL_POLICY','schemaVersion','2.0.0',
      'policyReference',policy_ref,'advisorId',${literal(actor)},
      'carrierReference','carrier:crs07','policyNumber',policy_number,
      'productReference',${literal(productReference)},
      'issueDate',substring(${literal(t.issued)},1,10),
      'effectiveFrom',${literal(t.issued)},'effectiveTo',null,
      'status',jsonb_build_object('value','ISSUED','source','CARRIER_ADMIN','asOf',${literal(t.issued)}),
      'currency','MXN','premiumAmount',1000,'paymentFrequency','MONTHLY','sumInsured',1000000,
      'completenessState','COMPLETE','freshnessState','CURRENT','conflictState','CLEAR',
      'evidenceVersionReferences',jsonb_build_array(evidence_ref),'currentVersion',1,
      'createdAt',${literal(t.issued)},'createdBy',${literal(actor)},
      'updatedAt',${literal(t.issued)},'archivedAt',null,'archivedBy',null,'archiveReason',null
    ),
    'roles',jsonb_build_array(jsonb_build_object(
      'contractType','FORGE_POLICY_ROLE','schemaVersion','1.0.0',
      'policyRoleReference',role_ref,'policyReference',policy_ref,'advisorId',${literal(actor)},
      'participantPersonReference',${literal(personReference)},'participantAccountReference',null,
      'roleType','INSURED','confirmationState','CONFIRMED','privacyClassification','SENSITIVE',
      'visibilityScope','POLICY_TEAM','evidenceReferences',jsonb_build_array(evidence_ref),
      'effectiveFrom',${literal(t.issued)},'effectiveTo',null,
      'createdAt',${literal(t.issued)},'createdBy',${literal(actor)},'version',1,
      'correctionOf',null,'archivedAt',null,'archivedBy',null,'archiveReason',null
    )),
    'evidence',jsonb_build_object(
      'evidenceVersionReference',evidence_ref,'documentHash',repeat('c',64),
      'sourceType','POLICY_ADMIN_RECORD','observedAt',${literal(t.issued)},
      'verificationState','CONFIRMED','fieldClaims',jsonb_build_object(),
      'provenance',jsonb_build_object(
        'issuanceConfirmed',true,'applicationReference',app_ref,
        'sourceAuthority','carrier-admin','reviewReference',${literal(`${RUN}:review`)}
      )
    ),
    'lineage',jsonb_build_object(
      'quoteReference',${literal(quoteReference)},
      'applicationReference',app_ref,'previousPolicyVersionReference',null
    ),
    'commandDigest',repeat('0',64)
  );

  blocked := false;
  begin
    perform public.forge_cartera010b_confirm_policy_with_parties(command);
  exception when others then
    if position('CRS07_APPLICATION_LINEAGE_REQUIRES_GOVERNED_COMMAND' in sqlerrm) > 0 then
      blocked := true;
    else raise;
    end if;
  end;
  if not blocked then raise exception 'CRS07_DIRECT_BASE_RPC_LINEAGE_ALLOWED'; end if;

  bad := jsonb_set(command,'{evidence,verificationState}','\"REVIEWED\"'::jsonb);
  blocked := false;
  begin
    perform public.forge_crs07_confirm_issued_policy_from_application(bad);
  exception when others then
    if position('CRS07_ISSUANCE_EVIDENCE_NOT_CONFIRMED' in sqlerrm) > 0 then blocked := true; else raise; end if;
  end;
  if not blocked then raise exception 'CRS07_WEAK_ISSUANCE_ALLOWED'; end if;

  bad := jsonb_set(command,'{lineage,quoteReference}','\"quote:wrong\"'::jsonb);
  blocked := false;
  begin
    perform public.forge_crs07_confirm_issued_policy_from_application(bad);
  exception when others then
    if position('CRS07_QUOTE_LINEAGE_MISMATCH' in sqlerrm) > 0 then blocked := true; else raise; end if;
  end;
  if not blocked then raise exception 'CRS07_QUOTE_MISMATCH_ALLOWED'; end if;

  confirmed := public.forge_crs07_confirm_issued_policy_from_application(command);
  set constraints forge_crs07_application_lineage_commit_guard immediate;
  if confirmed->>'status' <> 'CONFIRMED'
     or coalesce((confirmed->>'applicationPolicyLineageVerified')::boolean,false) is not true
     or coalesce((confirmed->>'policyCreatedByApplication')::boolean,true) is not false then
    raise exception 'CRS07_CONFIRMED_RECEIPT_INVALID';
  end if;

  replayed := public.forge_crs07_confirm_issued_policy_from_application(command);
  if replayed->>'status' <> 'CONFIRMED'
     or coalesce((replayed->>'replayed')::boolean,false) is not true then
    raise exception 'CRS07_REPLAY_FAILED';
  end if;

  conflict := public.forge_crs07_confirm_issued_policy_from_application(
    jsonb_set(command,'{policy,sumInsured}','2000000'::jsonb)
  );
  if conflict->>'status' <> 'CONFLICT'
     or coalesce((conflict->>'applicationPolicyLineageVerified')::boolean,true) is not false then
    raise exception 'CRS07_CHANGED_REPLAY_CONFLICT_FAILED';
  end if;

  bad := jsonb_set(command,'{idempotencyKey}',to_jsonb(${literal(`${RUN}:second-policy-command`)}::text));
  bad := jsonb_set(bad,'{policy,policyReference}',to_jsonb(${literal(`${RUN}:second-policy`)}::text));
  bad := jsonb_set(bad,'{policy,policyNumber}',to_jsonb(${literal(`CRS07-SECOND-${process.env.GITHUB_RUN_ID || "local"}`)}::text));
  bad := jsonb_set(bad,'{roles,0,policyReference}',to_jsonb(${literal(`${RUN}:second-policy`)}::text));
  bad := jsonb_set(bad,'{roles,0,policyRoleReference}',to_jsonb(${literal(`${RUN}:second-role`)}::text));
  bad := jsonb_set(bad,'{evidence,evidenceVersionReference}',to_jsonb(${literal(`${RUN}:second-evidence`)}::text));
  bad := jsonb_set(bad,'{evidence,documentHash}',to_jsonb(repeat('d',64)));
  bad := jsonb_set(bad,'{policy,evidenceVersionReferences}',jsonb_build_array(${literal(`${RUN}:second-evidence`)}));
  bad := jsonb_set(bad,'{roles,0,evidenceReferences}',jsonb_build_array(${literal(`${RUN}:second-evidence`)}));
  blocked := false;
  begin
    perform public.forge_crs07_confirm_issued_policy_from_application(bad);
  exception when others then
    if position('CRS07_APPLICATION_MULTIPLE_POLICY_CONFLICT' in sqlerrm) > 0 then blocked := true; else raise; end if;
  end;
  if not blocked then raise exception 'CRS07_MULTIPLE_POLICY_PER_APPLICATION_ALLOWED'; end if;

  perform set_config('request.jwt.claim.sub',${literal(other)},true);
  bad := jsonb_set(jsonb_set(command,'{advisorId}',to_jsonb(${literal(other)}::text)),
    '{actorReference}',to_jsonb(${literal(other)}::text));
  blocked := false;
  begin
    perform public.forge_crs07_confirm_issued_policy_from_application(bad);
  exception when others then
    if position('CRS07_APPLICATION_REQUIRED' in sqlerrm) > 0 then blocked := true; else raise; end if;
  end;
  if not blocked then raise exception 'CRS07_CROSS_ADVISOR_ALLOWED'; end if;
  perform set_config('request.jwt.claim.sub',${literal(actor)},true);

  select count(*) into policy_after from public.canonical_policies;
  if policy_after <> policy_before + 1 then raise exception 'CRS07_POLICY_COUNT_INVALID'; end if;
  if (select count(*) from public.policy_versions where application_reference=app_ref) <> 1 then
    raise exception 'CRS07_LINEAGE_VERSION_COUNT_INVALID';
  end if;
end $$;
rollback;
`;

await query(acceptanceSql, "runtime_acceptance");
const residual = (await query(`
select
  (select count(*) from public.canonical_policies where policy_reference like ${literal(`${RUN}%`)}) as policies,
  (select count(*) from public.policy_versions where application_reference like ${literal(`${RUN}%`)}) as versions,
  (select count(*) from public.prospects where id=${literal(prospectId)}::uuid) as prospects,
  (select count(*) from public.commercial_people where id=${literal(personId)}::uuid) as people,
  (select count(*) from public.quote_lifecycle_quotes where id=${literal(quoteId)}::uuid) as quotes
`, "residual_check"))[0];
for (const key of ["policies", "versions", "prospects", "people", "quotes"]) {
  assert.equal(Number(residual?.[key] || 0), 0, `CRS07_RESIDUAL_${key.toUpperCase()}`);
}
record("runtime_acceptance", "PASS", {
  fixturesRolledBack: true,
  residualPolicies: 0,
  residualVersions: 0,
  residualPrerequisites: 0,
});

for (const marker of [
  "CRS_07_REMOTE_SUPABASE_DEPLOYMENT=PASS",
  "CRS_07_REMOTE_APPLICATION_POLICY_LINEAGE=PASS",
  "CRS_07_DIRECT_BASE_RPC_LINEAGE=BLOCKED",
  "CRS_07_ISSUANCE_EVIDENCE_GATE=PASS",
  "CRS_07_QUOTE_PRODUCT_PERSON_LINEAGE=PASS",
  "CRS_07_IDEMPOTENT_REPLAY=PASS",
  "CRS_07_CHANGED_INPUT_CONFLICT=PASS",
  "CRS_07_ONE_APPLICATION_ONE_POLICY=PASS",
  "CRS_07_CROSS_ADVISOR_ISOLATION=PASS",
  "CRS_07_POLICY_AUTHORITY=PRESERVED",
  "ROLLBACK_ONLY_PREREQUISITES=PASS",
  "TEST_FIXTURES_ROLLED_BACK=YES",
  "RESIDUAL_POLICIES=0",
  "RESIDUAL_POLICY_VERSIONS=0",
  "RESIDUAL_PREREQUISITES=0",
]) console.log(marker);
