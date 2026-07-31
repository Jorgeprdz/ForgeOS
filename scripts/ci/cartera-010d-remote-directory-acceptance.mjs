import assert from 'node:assert/strict';
import { createHash, randomUUID } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';
import { createCanonicalDirectoryService } from '../../advisor-os/cartera/canonical-directory-service.js';
import { createCanonicalPortfolioService } from '../../advisor-os/cartera/canonical-portfolio-service.js';

const PROJECT_REF = 'rmlxigxysujsuwzgoimv';
const ARTIFACT_DIR = 'artifacts/cartera-010d-remote-directory-browser';
const REPORT_PATH = `${ARTIFACT_DIR}/remote-directory-report.json`;
const LOG_PATH = `${ARTIFACT_DIR}/remote-directory.log`;
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
  phase: 'CARTERA_010D_REMOTE_DIRECTORY_AND_BROWSER_ACCEPTANCE',
  sourceCommit: process.env.GITHUB_SHA || null,
  projectRef: PROJECT_REF,
  remoteRead: 'NOT_RUN',
  entryKinds: false,
  contactSearchPrivacy: false,
  relationshipSearch: false,
  policyDetailReachable: false,
  restrictedEntityBlocked: false,
  crossAdvisorIsolation: false,
  anonymousReadBlocked: false,
  directPolicyRolesReadBlocked: false,
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
  restrictedPersonId: randomUUID(),
  accountId: randomUUID(),
  membershipId: randomUUID(),
  policyId: randomUUID(),
  evidenceId: randomUUID(),
  versionId: randomUUID(),
  insuredRoleId: randomUUID(),
  accountRoleId: randomUUID(),
  beneficiaryRoleId: randomUUID(),
};
fixture.prefix = `CARTERA010D_ACCEPTANCE:${fixture.suffix}`;
fixture.personReference = `${fixture.prefix}:PERSON:VISIBLE`;
fixture.restrictedPersonReference = `${fixture.prefix}:PERSON:RESTRICTED`;
fixture.accountReference = `${fixture.prefix}:ACCOUNT`;
fixture.membershipReference = `${fixture.prefix}:MEMBERSHIP`;
fixture.policyReference = `${fixture.prefix}:POLICY`;
fixture.evidenceReference = `${fixture.prefix}:EVIDENCE:V1`;
fixture.versionReference = `${fixture.prefix}:POLICY_VERSION:1`;
fixture.insuredRoleReference = `${fixture.prefix}:ROLE:INSURED`;
fixture.accountRoleReference = `${fixture.prefix}:ROLE:OWNER_ACCOUNT`;
fixture.beneficiaryRoleReference = `${fixture.prefix}:ROLE:BENEFICIARY`;
fixture.policyNumber = `010D-${fixture.suffix}`;
fixture.phone = `+5255${String(Date.now()).slice(-8)}`;
fixture.phoneSearch = fixture.phone.slice(-10);
fixture.email = `directory-${fixture.suffix}@acceptance.invalid`;
fixture.personLabel = `Ana Directorio ${fixture.suffix}`;
fixture.accountLabel = `Familia Directorio ${fixture.suffix}`;
fixture.restrictedMarker = `SENSITIVE_DIRECTORY_${fixture.suffix}`;
fixture.documentHash = digest(`DOCUMENT:${fixture.suffix}`);
fixture.factsDigest = digest(`FACTS:${fixture.suffix}`);

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
  normalized_name, verified_phone, verified_email, lifecycle_state,
  privacy_classification, evidence_references, created_by
) values (
  ${sqlLiteral(fixture.personId)}::uuid,
  ${sqlLiteral(advisorAId)}::uuid,
  ${sqlLiteral(fixture.personReference)},
  ${sqlLiteral(fixture.personLabel)},
  'Ana',
  ${sqlLiteral(fixture.personLabel.toLowerCase())},
  ${sqlLiteral(fixture.phone)},
  ${sqlLiteral(fixture.email)},
  'CONFIRMED',
  'PRIVATE',
  ${jsonLiteral(evidenceArray)},
  ${sqlLiteral(advisorAId)}::uuid
), (
  ${sqlLiteral(fixture.restrictedPersonId)}::uuid,
  ${sqlLiteral(advisorAId)}::uuid,
  ${sqlLiteral(fixture.restrictedPersonReference)},
  ${sqlLiteral(fixture.restrictedMarker)},
  null,
  ${sqlLiteral(fixture.restrictedMarker.toLowerCase())},
  '+525500000099',
  'restricted-directory@acceptance.invalid',
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
  ${sqlLiteral(fixture.accountLabel)},
  'CONFIRMED',
  'PRIVATE',
  ${jsonLiteral(evidenceArray)},
  ${sqlLiteral(advisorAId)}::uuid
);

insert into public.commercial_account_memberships (
  id, advisor_id, membership_reference, account_id, person_id,
  relationship_role, confirmation_state, privacy_classification,
  evidence_references, effective_from, created_by
) values (
  ${sqlLiteral(fixture.membershipId)}::uuid,
  ${sqlLiteral(advisorAId)}::uuid,
  ${sqlLiteral(fixture.membershipReference)},
  ${sqlLiteral(fixture.accountId)}::uuid,
  ${sqlLiteral(fixture.personId)}::uuid,
  'HOUSEHOLD_MEMBER',
  'CONFIRMED',
  'PRIVATE',
  ${jsonLiteral(evidenceArray)},
  '2026-07-01T00:00:00.000Z'::timestamptz,
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
  'CARTERA010D_REMOTE_ACCEPTANCE',
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
  ${jsonLiteral({ source: 'CARTERA010D_ACCEPTANCE', rawDocument: 'DO_NOT_PROJECT' })},
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
  ${sqlLiteral(fixture.restrictedPersonId)}::uuid,
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
delete from public.commercial_account_memberships where advisor_id = ${sqlLiteral(advisorAId)}::uuid and id = ${sqlLiteral(fixture.membershipId)}::uuid;
delete from public.commercial_accounts where advisor_id = ${sqlLiteral(advisorAId)}::uuid and id = ${sqlLiteral(fixture.accountId)}::uuid;
delete from public.commercial_people where advisor_id = ${sqlLiteral(advisorAId)}::uuid and id in (${sqlLiteral(fixture.personId)}::uuid, ${sqlLiteral(fixture.restrictedPersonId)}::uuid);
commit;`, 'CARTERA010D_FIXTURE_CLEANUP');

  const rows = await managementQuery(`
select
  (select count(*) from public.canonical_policies where policy_reference = ${sqlLiteral(fixture.policyReference)})::bigint as policies,
  (select count(*) from public.policy_versions where policy_version_reference = ${sqlLiteral(fixture.versionReference)})::bigint as versions,
  (select count(*) from public.policy_evidence_versions where evidence_version_reference = ${sqlLiteral(fixture.evidenceReference)})::bigint as evidence,
  (select count(*) from public.policy_roles where policy_id = ${sqlLiteral(fixture.policyId)}::uuid)::bigint as roles,
  (select count(*) from public.commercial_account_memberships where membership_reference = ${sqlLiteral(fixture.membershipReference)})::bigint as memberships,
  (select count(*) from public.commercial_people where person_reference like ${sqlLiteral(`${fixture.prefix}:%`)})::bigint as people,
  (select count(*) from public.commercial_accounts where account_reference = ${sqlLiteral(fixture.accountReference)})::bigint as accounts;`, 'CARTERA010D_RESIDUAL_CHECK');
  const residual = rows[0] || {};
  for (const [key, value] of Object.entries(residual)) {
    assert.equal(Number(value), 0, `CARTERA010D_RESIDUAL_${key.toUpperCase()}`);
  }
  report.residualFixtures = residual;
  log('TEST_FIXTURES_CLEANED=YES');
  log('RESIDUAL_FIXTURES=0');
}

function assertPrivateDirectoryProjection(directory) {
  const serializedEntries = JSON.stringify(directory.entries);
  assert.equal(serializedEntries.includes(fixture.phone), false);
  assert.equal(serializedEntries.includes(fixture.email), false);
  assert.equal(serializedEntries.includes(fixture.restrictedMarker), false);
  assert.equal(serializedEntries.includes(fixture.restrictedPersonReference), false);
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

    await managementQuery(seedSql(), 'CARTERA010D_FIXTURE_SEED');
    seeded = true;
    log('REMOTE_FIXTURE_SEEDED=PASS');

    const directoryServiceA = createCanonicalDirectoryService({ client: clientA });
    const directoryA = await directoryServiceA.loadDirectory();
    assertPrivateDirectoryProjection(directoryA);

    const visibleEntries = directoryA.entries.filter(entry => [
      fixture.personReference,
      fixture.accountReference,
      fixture.policyReference,
    ].includes(entry.reference));
    assert.deepEqual(
      new Set(visibleEntries.map(entry => entry.kind)),
      new Set(['COMMERCIAL_PERSON', 'COMMERCIAL_ACCOUNT', 'POLICY']),
    );
    report.entryKinds = true;
    log('REMOTE_DIRECTORY_ENTRY_KINDS=PASS');

    const phoneResults = directoryA.search(fixture.phoneSearch);
    assert.equal(phoneResults[0]?.entry.reference, fixture.personReference);
    assert.ok(phoneResults[0]?.matchReasons.includes('VERIFIED_PHONE'));
    assert.equal(JSON.stringify(phoneResults).includes(fixture.phone), false);

    const emailResults = directoryA.search(fixture.email);
    assert.equal(emailResults[0]?.entry.reference, fixture.personReference);
    assert.ok(emailResults[0]?.matchReasons.includes('VERIFIED_EMAIL'));
    assert.equal(JSON.stringify(emailResults).includes(fixture.email), false);
    report.contactSearchPrivacy = true;
    log('PHONE_SEARCH_PRIVATE=PASS');
    log('EMAIL_SEARCH_PRIVATE=PASS');

    const accountResults = directoryA.search(fixture.accountLabel);
    assert.equal(accountResults[0]?.entry.reference, fixture.accountReference);
    const policyResults = directoryA.search(fixture.policyNumber);
    assert.equal(policyResults[0]?.entry.reference, fixture.policyReference);
    const relationshipResults = directoryA.search('HOUSEHOLD_MEMBER');
    assert.ok(relationshipResults.some(result => result.entry.reference === fixture.personReference));
    assert.ok(relationshipResults.some(result => result.entry.reference === fixture.accountReference));
    report.relationshipSearch = true;
    log('DIRECT_ENTITY_RANKING=PASS');
    log('RELATIONSHIP_SEARCH=PASS');

    assert.equal(
      directoryA.entries.some(entry => entry.reference === fixture.restrictedPersonReference),
      false,
    );
    assert.equal(directoryA.search(fixture.restrictedMarker).length, 0);
    report.restrictedEntityBlocked = true;
    log('RESTRICTED_ENTITY_DIRECTORY=BLOCKED');
    log('BENEFICIARY_GENERAL_DIRECTORY=BLOCKED');

    const portfolioServiceA = createCanonicalPortfolioService({ client: clientA });
    const detailA = await portfolioServiceA.loadPolicyDetail(fixture.policyReference);
    assert.equal(detailA.policy.policyReference, fixture.policyReference);
    assert.equal(detailA.policy.policyNumber.value, fixture.policyNumber);
    assert.ok(detailA.timeline.length >= 4, 'MINIMIZED_TIMELINE_INCOMPLETE');
    const serializedDetail = JSON.stringify(detailA);
    assert.equal(serializedDetail.includes(fixture.restrictedMarker), false);
    assert.equal(serializedDetail.includes(fixture.documentHash), false);
    assert.equal(serializedDetail.includes('DO_NOT_PROJECT'), false);
    report.policyDetailReachable = true;
    log('REMOTE_POLICY_DETAIL_REACHABLE=PASS');
    log('MINIMIZED_POLICY_TIMELINE_READ=PASS');

    const directRoleRead = await clientA
      .from('policy_roles')
      .select('id')
      .eq('policy_id', fixture.policyId);
    assert.ok(directRoleRead.error, 'DIRECT_POLICY_ROLES_READ_UNEXPECTEDLY_ALLOWED');
    report.directPolicyRolesReadBlocked = true;
    log('DIRECT_POLICY_ROLES_READ=BLOCKED');

    const directoryServiceB = createCanonicalDirectoryService({ client: clientB });
    const directoryB = await directoryServiceB.loadDirectory();
    assert.equal(
      directoryB.entries.some(entry => [
        fixture.personReference,
        fixture.accountReference,
        fixture.policyReference,
      ].includes(entry.reference)),
      false,
    );
    assert.equal(directoryB.search(fixture.policyNumber).length, 0);
    report.crossAdvisorIsolation = true;
    log('RLS_CROSS_ADVISOR_DIRECTORY=PASS');

    const anonymousService = createCanonicalDirectoryService({ client: anonymousClient });
    await assert.rejects(
      () => anonymousService.loadDirectory(),
      error => [
        'CARTERA010D_AUTH_REQUIRED',
        'CARTERA010D_AUTH_LOOKUP_FAILED',
      ].includes(error?.code),
    );
    report.anonymousReadBlocked = true;
    report.remoteRead = 'PASS';
    log('ANONYMOUS_DIRECTORY_READ=BLOCKED');
    log('CARTERA_010D_REMOTE_DIRECTORY_ACCEPTANCE=PASS');
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
  log(`CARTERA_010D_REMOTE_DIRECTORY_ACCEPTANCE=FAIL:${error?.message || error}`);
  process.exitCode = 1;
} finally {
  writeFileSync(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  writeFileSync(LOG_PATH, `${logLines.join('\n')}\n`, 'utf8');
  console.log(`EVIDENCE_REPORT=${REPORT_PATH}`);
  console.log(`EVIDENCE_LOG=${LOG_PATH}`);
}
