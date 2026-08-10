import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';

const PROJECT_REF = 'rmlxigxysujsuwzgoimv';
const EMAIL_A = 'forge.acceptance.a@forge.invalid';
const EMAIL_B = 'forge.acceptance.b@forge.invalid';
const SOURCE = 'acceptance_test';
const PRIMARY_NAME = 'FORGE 005B ACCEPTANCE PERSON';
const PRIMARY_CONTEXT = '[SYNTHETIC][FORGE_005B_ACCEPTANCE][PRIMARY]';
const AMBIG_CONTEXT = '[SYNTHETIC][FORGE_005B_ACCEPTANCE][AMBIGUOUS]';
const PRIMARY_SYNTHETIC_PHONE = '+000000000057';
const AMBIG_SYNTHETIC_PHONE = '+000000000058';
const OUT = process.env.FORGE_005B_R1_FIXTURE_EVIDENCE || 'artifacts/cartera-pipeline-identity-005b-r1/fixture-preflight.json';

const required = ['SUPABASE_URL', 'SUPABASE_ANON_KEY', 'FORGE_ACCEPTANCE_A_PASSWORD', 'FORGE_ACCEPTANCE_B_PASSWORD'];
for (const name of required) assert.ok(process.env[name], `${name}_MISSING`);
assert.equal(new URL(process.env.SUPABASE_URL).hostname, `${PROJECT_REF}.supabase.co`, 'PROJECT_REF_MISMATCH');

const options = { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } };
const makeClient = () => createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, options);
const clientA = makeClient();
const clientB = makeClient();

async function authenticate(api, email, password, key) {
  const { data, error } = await api.auth.signInWithPassword({ email, password });
  assert.ifError(error);
  assert.ok(data?.user?.id, `${key}_AUTH_FAILED`);
  const { data: session, error: sessionError } = await api.rpc('forge_demo_current_session');
  assert.ifError(sessionError);
  assert.equal(session?.demoKey, key, `${key}_DEMO_KEY_MISMATCH`);
  assert.equal(session?.isAcceptance, true, `${key}_ACCEPTANCE_CLASSIFICATION_MISSING`);
  assert.equal(session?.isPublic, false, `${key}_MUST_NOT_BE_PUBLIC`);
  assert.equal(session?.dataClass, 'SYNTHETIC', `${key}_DATA_CLASS_MISMATCH`);
  assert.equal(session?.readOnly, false, `${key}_WINDOW_NOT_OPEN`);
  assert.equal(session?.acceptancePurpose, 'AUTOMATED_ACCEPTANCE_ONLY', `${key}_PURPOSE_MISMATCH`);
  assert.ok(Date.parse(session?.expiresAt || '') > Date.now(), `${key}_WINDOW_EXPIRED`);
  return data.user;
}

async function archivePriorActiveFixture(api, advisorId, row) {
  if (!row?.id) return false;
  const now = new Date().toISOString();
  const archived = await api.from('prospects').update({
    archived_at: now,
    archived_by: advisorId,
    archive_reason: 'FORGE_005B_R1_RETRY_RESET',
    updated_by: advisorId,
  }).eq('advisor_id', advisorId).eq('id', row.id).is('archived_at', null)
    .select('id,archived_at');
  assert.ifError(archived.error);
  assert.equal((archived.data || []).length, 1, `005B_R1_PRIOR_FIXTURE_ARCHIVE_FAILED:${row.id}`);
  return true;
}

async function createFreshFixture(api, advisorId, context, syntheticPhone) {
  const existing = await api
    .from('prospects')
    .select('id,advisor_id,source,initial_context,archived_at')
    .eq('advisor_id', advisorId)
    .eq('source', SOURCE)
    .eq('initial_context', context)
    .is('archived_at', null);
  assert.ifError(existing.error);
  assert.ok((existing.data || []).length <= 1, `005B_R1_DUPLICATE_FIXTURE:${context}`);

  const priorArchived = await archivePriorActiveFixture(api, advisorId, existing.data?.[0]);
  const inserted = await api.from('prospects').insert({
    advisor_id: advisorId,
    display_name: PRIMARY_NAME,
    full_name: PRIMARY_NAME,
    phone_normalized: syntheticPhone,
    source: SOURCE,
    initial_context: context,
    status: 'referred_new',
    created_by: advisorId,
    updated_by: advisorId,
  }).select('id,advisor_id,source,initial_context,archived_at').single();
  assert.ifError(inserted.error);
  return { row: inserted.data, priorArchived };
}

let a;
let b;
try {
  [a, b] = await Promise.all([
    authenticate(clientA, EMAIL_A, process.env.FORGE_ACCEPTANCE_A_PASSWORD, 'ACCEPTANCE_A'),
    authenticate(clientB, EMAIL_B, process.env.FORGE_ACCEPTANCE_B_PASSWORD, 'ACCEPTANCE_B'),
  ]);
  assert.notEqual(a.id, b.id, 'ACCEPTANCE_IDENTITIES_MUST_DIFFER');

  const primaryResult = await createFreshFixture(clientA, a.id, PRIMARY_CONTEXT, PRIMARY_SYNTHETIC_PHONE);
  const ambiguousResult = await createFreshFixture(clientA, a.id, AMBIG_CONTEXT, AMBIG_SYNTHETIC_PHONE);
  const primary = primaryResult.row;
  const ambiguous = ambiguousResult.row;
  assert.notEqual(primary.id, ambiguous.id, '005B_R1_FIXTURES_MUST_DIFFER');

  const hiddenFromB = await clientB.from('prospects').select('id').in('id', [primary.id, ambiguous.id]);
  assert.ifError(hiddenFromB.error);
  assert.equal((hiddenFromB.data || []).length, 0, '005B_R1_FIXTURE_RLS_LEAK');

  const report = {
    phase: 'FORGE_CARTERA_PIPELINE_IDENTITY_PRODUCTIVE_ACCEPTANCE_005B_R1',
    dataClass: 'SYNTHETIC',
    acceptanceA: 'ACCEPTANCE_A',
    acceptanceB: 'ACCEPTANCE_B',
    primaryProspectId: primary.id,
    ambiguousProspectId: ambiguous.id,
    priorFixturesArchivedOwnerScoped: Number(primaryResult.priorArchived) + Number(ambiguousResult.priorArchived),
    fixtureRlsIsolation: true,
    privilegedDomainWrite: false,
    realDataTouched: false,
    credentialsPersisted: false,
  };
  for (const name of required) {
    const secret = process.env[name];
    if (secret) assert.equal(JSON.stringify(report).includes(secret), false, `SECRET_LEAK:${name}`);
  }
  mkdirSync(OUT.slice(0, OUT.lastIndexOf('/')), { recursive: true });
  writeFileSync(OUT, `${JSON.stringify(report, null, 2)}\n`);
  console.log('005B_R1_FIXTURE_PRECONDITION=PASS');
  console.log('005B_R1_ACCEPTANCE_IDENTITIES=PASS');
  console.log('005B_R1_FIXTURE_RLS_ISOLATION=PASS');
  console.log('005B_R1_PRIOR_FIXTURE_RESET=OWNER_SCOPED');
  console.log('SERVICE_ROLE_DOMAIN_WRITE=NO');
  console.log('REAL_DATA_TOUCHED=NO');
} finally {
  await Promise.allSettled([clientA.auth.signOut(), clientB.auth.signOut()]);
}
