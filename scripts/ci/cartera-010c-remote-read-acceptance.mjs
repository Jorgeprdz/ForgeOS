import assert from 'node:assert/strict';
import { createHash, randomUUID } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';
import { createCanonicalPortfolioService } from '../../advisor-os/cartera/canonical-portfolio-service.js';

const PROJECT_REF = 'rmlxigxysujsuwzgoimv';
const ARTIFACT_DIR = 'artifacts/cartera-010c-remote-read-browser';
const REPORT_PATH = `${ARTIFACT_DIR}/remote-read-report.json`;
const LOG_PATH = `${ARTIFACT_DIR}/remote-read.log`;
const REQUIRED_ENV = [
  'SUPABASE_ACCESS_TOKEN',
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'ADVISOR_A_EMAIL',
  'ADVISOR_A_PASSWORD',
  'ADVISOR_B_EMAIL',
  'ADVISOR_B_PASSWORD',
];

for (const name of REQUIRED_ENV) {
  assert.ok(process.env[name], `${name}_MISSING`);
}
assert.equal(
  new URL(process.env.SUPABASE_URL).hostname,
  `${PROJECT_REF}.supabase.co`,
  'SUPABASE_PROJECT_REF_MISMATCH',
);

mkdirSync(ARTIFACT_DIR, { recursive: true });

const endpoint = `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`;
const logLines = [];
const report = {
  phase: 'CARTERA_010C_REMOTE_READ_AND_BROWSER_ACCEPTANCE',
  sourceCommit: process.env.GITHUB_SHA || null,
  projectRef: PROJECT_REF,
  remoteRead: 'NOT_RUN',
  ownerRead: false,
  crossAdvisorIsolation: false,
  anonymousReadBlocked: false,
  directPolicyRolesReadBlocked: false,
  beneficiaryGeneralProjectionBlocked: false,
  rawEvidenceProjectionBlocked: false,
  residualFixtures: null,
};

function log(message) {
  const safe = String(message)
    .replace(/sbp_[A-Za-z0-9_-]+/g, '[REDACTED]')
    .replace(/eyJ[A-Za-z0-9._-]+/g, '[JWT_REDACTED]');
  logLines.push(safe);
  console.log(safe);
}

function sqlLiteral(value) {
  if (value === null || value === undefined) return 'null';
  return `'${String(value).replaceAll("'", "''")}'`;
}

function jsonLiteral(value) {
  return `${sqlLiteral(JSON.stringify(value))}::jsonb`;
}

function digest(value) {
  return createHash('sha256').update(String(value)).digest('hex');
}

async function managementQuery(sql, label) {
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
  if (!response.ok || body?.error) {
    const detail = String(body?.message || body?.error || 'QUERY_REJECTED')
      .replace(/sbp_[A-Za-z0-9_-]+/g, '[REDACTED]')
      .slice(0, 1800);
    throw new Error(`${label}_HTTP_${response.status}:${detail}`);
  }
  if (Array.isArray(body?.result)) return body.result;
  if (Array.isArray(body)) return body;
  return [];
}

const clientOptions = {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
};
const clientA = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY,
  clientOptions,
);
const clientB = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY,
  clientOptions,
);
const anonymousClient = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY,
  clientOptions,
);

const fixture = {
  suffix: `${Date.now()}-${randomUUID().slice(0, 8)}`,
  personId: randomUUID(),
  beneficiaryPersonId: randomUUID(),
  accountId: randomUUID(),
  policyId: randomUUID(),
  evidenceId: randomUUID(),
  versionId: randomUUID(),
  insuredRoleId: randomUUID(),
  accountRoleId: randomUUID(),
  beneficiaryRoleId: randomUUID(),
};
fixture.prefix = `CARTERA010C_ACCEPTANCE:${fixture.suffix}`;
fixture.personReference = `${fixture.prefix}:PERSON:INSURED`;
fixture.beneficiaryReference = `${fixture.prefix}:PERSON:SENSITIVE_BENEFICIARY`;
fixture.accountReference = `${fixture.prefix}:ACCOUNT`;
fixture.policyReference = `${fixture.prefix}:POLICY`;
fixture.evidenceReference = `${fixture.prefix}:EVIDENCE:V1`;
fixture.versionReference = `${fixture.prefix}:POLICY_VERSION:1`;
fixture.insuredRoleReference = `${fixture.prefix}:ROLE:INSURED`;
fixture.accountRoleReference = `${fixture.prefix}:ROLE:OWNER_ACCOUNT`;
fixture.beneficiaryRoleReference = `${fixture.prefix}:ROLE:BENEFICIARY`;
fixture.policyNumber = `010C-${fixture.suffix}`;
fixture.documentHash = digest(`DOCUMENT:${fixture.suffix}`);
fixture.factsDigest = digest(`FACTS:${fixture.suffix}`);
fixture.sensitiveMarker = `SENSITIVE_BENEFICIARY_${fixture.suffix}`;

let advisorAId = null;
let advisorBId = null;
let seeded = false;

function seedSql() {
  const now = new Date().toISOString();
  const evidenceArray = [fixture.evidenceReference];
  const facts = {
    policyReference: fixture.policyReference,
    statusValue: 'ACTIVE',
    premiumAmount: 24000,
    currency: 'MXN',
  };
  return `
begin;
insert into public.commercial_people (
  id, advisor_id, person_reference, display_name, preferred_name,
  normalized_name, lifecycle_state, privacy_classification,
  evidence_references, created_by
) values (
  ${sqlLiteral(fixture.personId)}::uuid,
  ${sqlLiteral(advisorAId)}::uuid,
  ${sqlLiteral(fixture.personReference)},
  'Ana Aceptación 010C',
  'Ana',
  'ana aceptacion 010c',
  'CONFIRMED',
  'PRIVATE',
  ${jsonLiteral(evidenceArray)},
  ${sqlLiteral(advisorAId)}::uuid
), (
  ${sqlLiteral(fixture.beneficiaryPersonId)}::uuid,
  ${sqlLiteral(advisorAId)}::uuid,
  ${sqlLiteral(fixture.beneficiaryReference)},
  ${sqlLiteral(fixture.sensitiveMarker)},
  null,
  ${sqlLiteral(fixture.sensitiveMarker.toLowerCase())},
  'CONFIRMED',
  'RESTRICTED',
  ${jsonLiteral(evidenceArray)},
  ${sqlLiteral(advisorAId)}::uuid
);

insert into public.commercial_accounts (
  id, advisor_id, account_reference, account_type, display_label,
  lifecycle_state, privacy_classification, evidence_references, created_by
) values (
  ${sqlLiteral(fixture.accountId)}::uuid,
  ${sqlLiteral(advisorAId)}::uuid,
  ${sqlLiteral(fixture.accountReference)},
  'HOUSEHOLD',
  'Familia Aceptación 010C',
  'CONFIRMED',
  'PRIVATE',
  ${jsonLiteral(evidenceArray)},
  ${sqlLiteral(advisorAId)}::uuid
);

insert into public.canonical_policies (
  id, advisor_id, policy_reference, carrier_reference, policy_number,
  product_reference, issue_date, effective_from, status_value,
  status_source, status_as_of, currency, premium_amount,
  payment_frequency, sum_insured, completeness_state, freshness_state,
  conflict_state, current_version, created_by
) values (
  ${sqlLiteral(fixture.policyId)}::uuid,
  ${sqlLiteral(advisorAId)}::uuid,
  ${sqlLiteral(fixture.policyReference)},
  'SMNYL',
  ${sqlLiteral(fixture.policyNumber)},
  'VIDA_MUJER',
  '2026-07-01'::date,
  '2026-07-01T00:00:00.000Z'::timestamptz,
  'ACTIVE',
  'CARTERA010C_REMOTE_ACCEPTANCE',
  ${sqlLiteral(now)}::timestamptz,
  'MXN',
  24000,
  'ANNUAL',
  1500000,
  'COMPLETE',
  'CURRENT',
  'CLEAR',
  1,
  ${sqlLiteral(advisorAId)}::uuid
);

insert into public.policy_evidence_versions (
  id, advisor_id, evidence_version_reference, policy_id, document_hash,
  source_type, observed_at, verification_state, field_claims,
  provenance, created_by
) values (
  ${sqlLiteral(fixture.evidenceId)}::uuid,
  ${sqlLiteral(advisorAId)}::uuid,
  ${sqlLiteral(fixture.evidenceReference)},
  ${sqlLiteral(fixture.policyId)}::uuid,
  ${sqlLiteral(fixture.documentHash)},
  'REMOTE_ACCEPTANCE_FIXTURE',
  ${sqlLiteral(now)}::timestamptz,
  'CONFIRMED',
  ${jsonLiteral({ premiumAmount: 24000, privateClaim: 'DO_NOT_PROJECT' })},
  ${jsonLiteral({ source: 'CARTERA010C_ACCEPTANCE', rawDocument: 'DO_NOT_PROJECT' })},
  ${sqlLiteral(advisorAId)}::uuid
);

insert into public.policy_versions (
  id, advisor_id, policy_id, policy_version_reference, version_number,
  facts, facts_digest, evidence_version_id, confirmed_at, confirmed_by
) values (
  ${sqlLiteral(fixture.versionId)}::uuid,
  ${sqlLiteral(advisorAId)}::uuid,
  ${sqlLiteral(fixture.policyId)}::uuid,
  ${sqlLiteral(fixture.versionReference)},
  1,
  ${jsonLiteral(facts)},
  ${sqlLiteral(fixture.factsDigest)},
  ${sqlLiteral(fixture.evidenceId)}::uuid,
  ${sqlLiteral(now)}::timestamptz,
  ${sqlLiteral(advisorAId)}::uuid
);

insert into public.policy_roles (
  id, advisor_id, policy_role_reference, policy_id, policy_version_id,
  participant_person_id, participant_account_id, role_type,
  confirmation_state, privacy_classification, visibility_scope,
  evidence_references, effective_from, role_version, created_by
) values (
  ${sqlLiteral(fixture.insuredRoleId)}::uuid,
  ${sqlLiteral(advisorAId)}::uuid,
  ${sqlLiteral(fixture.insuredRoleReference)},
  ${sqlLiteral(fixture.policyId)}::uuid,
  ${sqlLiteral(fixture.versionId)}::uuid,
  ${sqlLiteral(fixture.personId)}::uuid,
  null,
  'INSURED',
  'CONFIRMED',
  'PRIVATE',
  'POLICY_TEAM',
  ${jsonLiteral(evidenceArray)},
  '2026-07-01T00:00:00.000Z'::timestamptz,
  1,
  ${sqlLiteral(advisorAId)}::uuid
), (
  ${sqlLiteral(fixture.accountRoleId)}::uuid,
  ${sqlLiteral(advisorAId)}::uuid,
  ${sqlLiteral(fixture.accountRoleReference)},
  ${sqlLiteral(fixture.policyId)}::uuid,
  ${sqlLiteral(fixture.versionId)}::uuid,
  null,
  ${sqlLiteral(fixture.accountId)}::uuid,
  'POLICY_OWNER',
  'CONFIRMED',
  'PRIVATE',
  'POLICY_TEAM',
  ${jsonLiteral(evidenceArray)},
  '2026-07-01T00:00:00.000Z'::timestamptz,
  1,
  ${sqlLiteral(advisorAId)}::uuid
), (
  ${sqlLiteral(fixture.beneficiaryRoleId)}::uuid,
  ${sqlLiteral(advisorAId)}::uuid,
  ${sqlLiteral(fixture.beneficiaryRoleReference)},
  ${sqlLiteral(fixture.policyId)}::uuid,
  ${sqlLiteral(fixture.versionId)}::uuid,
  ${sqlLiteral(fixture.beneficiaryPersonId)}::uuid,
  null,
  'BENEFICIARY',
  'CONFIRMED',
  'RESTRICTED',
  'OWNING_ADVISOR_ONLY',
  ${jsonLiteral(evidenceArray)},
  '2026-07-01T00:00:00.000Z'::timestamptz,
  1,
  ${sqlLiteral(advisorAId)}::uuid
);
commit;`;
}

async function cleanup() {
  if (!advisorAId) return;
  await managementQuery(`
begin;
set local session_replication_role = replica;
delete from public.policy_roles where advisor_id = ${sqlLiteral(advisorAId)}::uuid and policy_id = ${sqlLiteral(fixture.policyId)}::uuid;
delete from public.policy_conflicts where advisor_id = ${sqlLiteral(advisorAId)}::uuid and policy_id = ${sqlLiteral(fixture.policyId)}::uuid;
delete from public.policy_versions where advisor_id = ${sqlLiteral(advisorAId)}::uuid and policy_id = ${sqlLiteral(fixture.policyId)}::uuid;
delete from public.policy_evidence_versions where advisor_id = ${sqlLiteral(advisorAId)}::uuid and policy_id = ${sqlLiteral(fixture.policyId)}::uuid;
delete from public.canonical_policies where advisor_id = ${sqlLiteral(advisorAId)}::uuid and id = ${sqlLiteral(fixture.policyId)}::uuid;
delete from public.commercial_accounts where advisor_id = ${sqlLiteral(advisorAId)}::uuid and id = ${sqlLiteral(fixture.accountId)}::uuid;
delete from public.commercial_people where advisor_id = ${sqlLiteral(advisorAId)}::uuid and id in (${sqlLiteral(fixture.personId)}::uuid, ${sqlLiteral(fixture.beneficiaryPersonId)}::uuid);
commit;`, 'CARTERA010C_FIXTURE_CLEANUP');

  const rows = await managementQuery(`
select
  (select count(*) from public.canonical_policies where policy_reference = ${sqlLiteral(fixture.policyReference)})::bigint as policies,
  (select count(*) from public.policy_versions where policy_version_reference = ${sqlLiteral(fixture.versionReference)})::bigint as versions,
  (select count(*) from public.policy_evidence_versions where evidence_version_reference = ${sqlLiteral(fixture.evidenceReference)})::bigint as evidence,
  (select count(*) from public.policy_roles where policy_id = ${sqlLiteral(fixture.policyId)}::uuid)::bigint as roles,
  (select count(*) from public.commercial_people where person_reference like ${sqlLiteral(`${fixture.prefix}:%`)})::bigint as people,
  (select count(*) from public.commercial_accounts where account_reference = ${sqlLiteral(fixture.accountReference)})::bigint as accounts;`, 'CARTERA010C_RESIDUAL_CHECK');
  const residual = rows[0] || {};
  for (const [key, value] of Object.entries(residual)) {
    assert.equal(Number(value), 0, `CARTERA010C_RESIDUAL_${key.toUpperCase()}`);
  }
  report.residualFixtures = residual;
  log('TEST_FIXTURES_CLEANED=YES');
  log('RESIDUAL_FIXTURES=0');
}

function assertNoSensitiveProjection(detail) {
  const serialized = JSON.stringify(detail);
  assert.doesNotMatch(serialized, new RegExp(fixture.sensitiveMarker));
  assert.doesNotMatch(serialized, new RegExp(fixture.documentHash));
  assert.doesNotMatch(serialized, /DO_NOT_PROJECT/);
  assert.doesNotMatch(serialized, /fieldClaims|provenance|rawDocument|documentHash/);
  for (const event of detail.timeline) {
    const payload = JSON.stringify(event.payload);
    assert.doesNotMatch(payload, /premium|sumInsured|currency|paymentFrequency|policyNumber/i);
  }
}

async function main() {
  try {
    const [authA, authB] = await Promise.all([
      clientA.auth.signInWithPassword({
        email: process.env.ADVISOR_A_EMAIL,
        password: process.env.ADVISOR_A_PASSWORD,
      }),
      clientB.auth.signInWithPassword({
        email: process.env.ADVISOR_B_EMAIL,
        password: process.env.ADVISOR_B_PASSWORD,
      }),
    ]);
    assert.ifError(authA.error);
    assert.ifError(authB.error);
    advisorAId = authA.data.user?.id;
    advisorBId = authB.data.user?.id;
    assert.match(advisorAId || '', /^[0-9a-f-]{36}$/i);
    assert.match(advisorBId || '', /^[0-9a-f-]{36}$/i);
    assert.notEqual(advisorAId, advisorBId);
    log('AUTHENTICATED_TWO_ADVISORS=PASS');

    await managementQuery(seedSql(), 'CARTERA010C_FIXTURE_SEED');
    seeded = true;
    log('REMOTE_FIXTURE_SEEDED=PASS');

    const serviceA = createCanonicalPortfolioService({ client: clientA });
    const portfolioA = await serviceA.loadPortfolio();
    const itemA = portfolioA.find(item => item.policyReference === fixture.policyReference);
    assert.ok(itemA, 'OWNER_PORTFOLIO_POLICY_MISSING');
    assert.deepEqual(
      new Set(itemA.generalParticipantSummary.map(role => role.roleType)),
      new Set(['INSURED', 'POLICY_OWNER']),
    );
    assert.equal(JSON.stringify(itemA).includes(fixture.sensitiveMarker), false);

    const detailA = await serviceA.loadPolicyDetail(fixture.policyReference);
    assert.equal(detailA.policy.policyReference, fixture.policyReference);
    assert.equal(detailA.policy.policyNumber, fixture.policyNumber);
    assert.equal(detailA.policy.premiumAmount.value, 24000);
    assert.ok(detailA.timeline.length >= 4, 'MINIMIZED_TIMELINE_INCOMPLETE');
    assertNoSensitiveProjection(detailA);
    report.ownerRead = true;
    report.beneficiaryGeneralProjectionBlocked = true;
    report.rawEvidenceProjectionBlocked = true;
    log('AUTHENTICATED_OWNER_PORTFOLIO_READ=PASS');
    log('AUTHENTICATED_OWNER_POLICY_DETAIL_READ=PASS');
    log('MINIMIZED_POLICY_TIMELINE_READ=PASS');
    log('BENEFICIARY_GENERAL_PROJECTION=BLOCKED');
    log('RAW_EVIDENCE_PROJECTION=BLOCKED');

    const directRoleRead = await clientA
      .from('policy_roles')
      .select('id')
      .eq('policy_id', fixture.policyId);
    assert.ok(directRoleRead.error, 'DIRECT_POLICY_ROLES_READ_UNEXPECTEDLY_ALLOWED');
    report.directPolicyRolesReadBlocked = true;
    log('DIRECT_POLICY_ROLES_READ=BLOCKED');

    const serviceB = createCanonicalPortfolioService({ client: clientB });
    const portfolioB = await serviceB.loadPortfolio();
    assert.equal(
      portfolioB.some(item => item.policyReference === fixture.policyReference),
      false,
    );
    await assert.rejects(
      () => serviceB.loadPolicyDetail(fixture.policyReference),
      error => error?.code === 'CARTERA010C_POLICY_NOT_FOUND',
    );
    report.crossAdvisorIsolation = true;
    log('RLS_CROSS_ADVISOR_PORTFOLIO=PASS');
    log('RLS_CROSS_ADVISOR_POLICY_DETAIL=PASS');

    const anonymousService = createCanonicalPortfolioService({ client: anonymousClient });
    await assert.rejects(
      () => anonymousService.loadPortfolio(),
      error => error?.code === 'CARTERA010C_AUTH_REQUIRED',
    );
    report.anonymousReadBlocked = true;
    report.remoteRead = 'PASS';
    log('ANONYMOUS_PORTFOLIO_READ=BLOCKED');
    log('CARTERA_010C_REMOTE_READ_ACCEPTANCE=PASS');
  } finally {
    try {
      if (seeded) await cleanup();
    } finally {
      await Promise.allSettled([clientA.auth.signOut(), clientB.auth.signOut()]);
    }
  }
}

try {
  await main();
} catch (error) {
  report.remoteRead = 'FAIL';
  report.error = String(error?.stack || error?.message || error).slice(0, 4000);
  log(`CARTERA_010C_REMOTE_READ_ACCEPTANCE=FAIL:${error?.message || error}`);
  process.exitCode = 1;
} finally {
  writeFileSync(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  writeFileSync(LOG_PATH, `${logLines.join('\n')}\n`, 'utf8');
  console.log(`EVIDENCE_REPORT=${REPORT_PATH}`);
  console.log(`EVIDENCE_LOG=${LOG_PATH}`);
}
