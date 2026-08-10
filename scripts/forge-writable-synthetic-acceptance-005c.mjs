import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';

const PROJECT_REF = 'rmlxigxysujsuwzgoimv';
const CONTRACT = 'FORGE_GOVERNED_WRITABLE_SYNTHETIC_ACCEPTANCE_AUTHORITY_005C';
const EMAIL_A = 'forge.acceptance.a@forge.invalid';
const EMAIL_B = 'forge.acceptance.b@forge.invalid';
const SOURCE = 'FORGE_005C_ACCEPTANCE';
const RUN_SCOPE = process.env.GITHUB_RUN_ID || process.env.FORGE_005C_RUN_ID || `local-${process.pid}`;
const CONTEXT = `[NON_PERSONAL_SYNTHETIC_ACCEPTANCE_DATA][005C][A][RUN:${RUN_SCOPE}]`;
const DISPLAY_NAME = 'FORGE 005C SYNTHETIC ACCEPTANCE PROSPECT';
const SYNTHETIC_PHONE_A = '+000000000005';
const OUT = process.env.FORGE_005C_DATA_EVIDENCE
  || 'artifacts/writable-synthetic-acceptance-005c/data-plane-report.json';

const required = ['SUPABASE_URL', 'SUPABASE_ANON_KEY', 'FORGE_ACCEPTANCE_A_PASSWORD', 'FORGE_ACCEPTANCE_B_PASSWORD'];
for (const name of required) assert.ok(process.env[name], `${name}_MISSING`);
assert.equal(new URL(process.env.SUPABASE_URL).hostname, `${PROJECT_REF}.supabase.co`, 'PROJECT_REF_MISMATCH');

const options = { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } };
const newClient = () => createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, options);
const clientA = newClient();
const clientB = newClient();

const report = {
  contract: CONTRACT,
  projectRef: PROJECT_REF,
  dataClass: 'SYNTHETIC',
  source: SOURCE,
  runScope: RUN_SCOPE,
  aa01: 'NOT_RUN',
  aa02: 'NOT_RUN',
  aa03: 'NOT_RUN',
  aa04: 'NOT_RUN',
  aa05: 'NOT_RUN',
  aa06: 'NOT_RUN',
  aa07: 'NOT_RUN',
  aa10: 'NOT_RUN',
  acceptanceA: {},
  acceptanceB: {},
  prospectId: null,
  ownerIsolation: false,
  deterministicFixture: false,
  cleanupArchived: false,
  privilegedBusinessWrite: false,
  realDataTouched: false,
  credentialsPersisted: false,
};

function log(marker, value = 'PASS') {
  console.log(`${marker}=${value}`);
}

function assertNoSecrets(value) {
  const text = JSON.stringify(value);
  for (const name of required) {
    const secret = process.env[name];
    if (secret) assert.equal(text.includes(secret), false, `SECRET_LEAK:${name}`);
  }
}

async function authenticate(api, email, password, key) {
  const { data, error } = await api.auth.signInWithPassword({ email, password });
  assert.ifError(error);
  assert.ok(data?.user?.id, `${key}_AUTH_FAILED`);
  const { data: session, error: sessionError } = await api.rpc('forge_demo_current_session');
  assert.ifError(sessionError);
  assert.equal(session?.isDemo, true, `${key}_SYNTHETIC_CLASSIFICATION_MISSING`);
  assert.equal(session?.isAcceptance, true, `${key}_ACCEPTANCE_CLASSIFICATION_MISSING`);
  assert.equal(session?.isPublic, false, `${key}_MUST_NOT_BE_PUBLIC`);
  assert.equal(session?.dataClass, 'SYNTHETIC', `${key}_DATA_CLASS_MISMATCH`);
  assert.equal(session?.readOnly, false, `${key}_WINDOW_NOT_OPEN`);
  assert.equal(session?.acceptancePurpose, 'AUTOMATED_ACCEPTANCE_ONLY', `${key}_PURPOSE_MISMATCH`);
  assert.ok(session?.expiresAt, `${key}_EXPIRY_MISSING`);
  assert.ok(Date.parse(session.expiresAt) > Date.now(), `${key}_WINDOW_ALREADY_EXPIRED`);
  return { user: data.user, session };
}

async function ensureOneDeterministicProspect(api, userId) {
  const existing = await api
    .from('prospects')
    .select('id,advisor_id,source,initial_context,archived_at')
    .eq('advisor_id', userId)
    .eq('source', SOURCE)
    .eq('initial_context', CONTEXT)
    .is('archived_at', null)
    .order('created_at', { ascending: true });
  assert.ifError(existing.error);
  assert.ok((existing.data || []).length <= 1, 'AA06_DUPLICATE_FIXTURE_PREEXISTS');

  if (existing.data?.[0]?.id) {
    const refreshed = await api
      .from('prospects')
      .update({
        display_name: DISPLAY_NAME,
        full_name: DISPLAY_NAME,
        phone_normalized: SYNTHETIC_PHONE_A,
        status: 'referred_new',
        updated_by: userId,
      })
      .eq('advisor_id', userId)
      .eq('id', existing.data[0].id)
      .is('archived_at', null)
      .select('id,advisor_id,source,initial_context,archived_at')
      .single();
    assert.ifError(refreshed.error);
    return { row: refreshed.data, created: false };
  }

  const inserted = await api
    .from('prospects')
    .insert({
      advisor_id: userId,
      display_name: DISPLAY_NAME,
      full_name: DISPLAY_NAME,
      phone_normalized: SYNTHETIC_PHONE_A,
      source: SOURCE,
      initial_context: CONTEXT,
      status: 'referred_new',
      created_by: userId,
      updated_by: userId,
    })
    .select('id,advisor_id,source,initial_context,archived_at')
    .single();
  assert.ifError(inserted.error);
  return { row: inserted.data, created: true };
}

async function activeFixtureCount(api, userId) {
  const result = await api
    .from('prospects')
    .select('id', { count: 'exact' })
    .eq('advisor_id', userId)
    .eq('source', SOURCE)
    .eq('initial_context', CONTEXT)
    .is('archived_at', null);
  assert.ifError(result.error);
  return result.count || 0;
}

let a;
let b;
try {
  [a, b] = await Promise.all([
    authenticate(clientA, EMAIL_A, process.env.FORGE_ACCEPTANCE_A_PASSWORD, 'ACCEPTANCE_A'),
    authenticate(clientB, EMAIL_B, process.env.FORGE_ACCEPTANCE_B_PASSWORD, 'ACCEPTANCE_B'),
  ]);
  assert.notEqual(a.user.id, b.user.id, 'ACCEPTANCE_IDENTITIES_MUST_BE_DISTINCT');
  assert.equal(a.session.demoKey, 'ACCEPTANCE_A');
  assert.equal(b.session.demoKey, 'ACCEPTANCE_B');
  report.acceptanceA = { demoKey: a.session.demoKey, isPublic: a.session.isPublic, isAcceptance: a.session.isAcceptance };
  report.acceptanceB = { demoKey: b.session.demoKey, isPublic: b.session.isPublic, isAcceptance: b.session.isAcceptance };
  report.aa01 = 'PASS';
  report.aa02 = 'PASS';
  log('AA01');
  log('AA02');

  const first = await ensureOneDeterministicProspect(clientA, a.user.id);
  assert.equal(first.row.advisor_id, a.user.id, 'AA03_OWNER_MISMATCH');
  assert.equal(first.row.source, SOURCE);
  report.prospectId = first.row.id;
  report.aa03 = 'PASS';
  report.aa05 = 'PASS';
  log('AA03');
  log('AA05');

  const visibleA = await clientA.from('prospects').select('id,advisor_id').eq('id', first.row.id).single();
  assert.ifError(visibleA.error);
  assert.equal(visibleA.data.advisor_id, a.user.id);

  const hiddenB = await clientB.from('prospects').select('id').eq('id', first.row.id);
  assert.ifError(hiddenB.error);
  assert.equal((hiddenB.data || []).length, 0, 'AA04_CROSS_ADVISOR_READ_LEAK');
  const deniedUpdate = await clientB
    .from('prospects')
    .update({ status: 'contacted', updated_by: b.user.id })
    .eq('id', first.row.id)
    .select('id');
  assert.ifError(deniedUpdate.error);
  assert.equal((deniedUpdate.data || []).length, 0, 'AA04_CROSS_ADVISOR_WRITE_LEAK');
  report.ownerIsolation = true;
  report.aa04 = 'PASS';
  log('AA04');

  const replay = await ensureOneDeterministicProspect(clientA, a.user.id);
  assert.equal(replay.row.id, first.row.id, 'AA06_FIXTURE_ID_CHANGED');
  assert.equal(await activeFixtureCount(clientA, a.user.id), 1, 'AA06_DUPLICATE_ACTIVE_FIXTURE');
  report.deterministicFixture = true;
  report.aa06 = 'PASS';
  log('AA06');

  const now = new Date().toISOString();
  const archived = await clientA
    .from('prospects')
    .update({
      archived_at: now,
      archived_by: a.user.id,
      archive_reason: 'FORGE_005C_ACCEPTANCE_CLEANUP',
      updated_by: a.user.id,
    })
    .eq('advisor_id', a.user.id)
    .eq('id', first.row.id)
    .is('archived_at', null)
    .select('id,archived_at');
  assert.ifError(archived.error);
  assert.equal((archived.data || []).length, 1, 'AA07_ARCHIVE_FAILED');
  assert.equal(await activeFixtureCount(clientA, a.user.id), 0, 'AA07_ACTIVE_FIXTURE_REMAINS');
  report.cleanupArchived = true;
  report.aa07 = 'PASS';
  report.aa10 = 'PASS';
  log('AA07');
  log('AA10');
  log('AUTHENTICATED_DOMAIN_WRITES');
  log('RLS_OWNER_ISOLATION');
  log('SERVICE_ROLE_DOMAIN_WRITE', 'NO');
  log('REAL_DATA_TOUCHED', 'NO');
} finally {
  await Promise.allSettled([clientA.auth.signOut(), clientB.auth.signOut()]);
}

assertNoSecrets(report);
mkdirSync('artifacts/writable-synthetic-acceptance-005c', { recursive: true });
writeFileSync(OUT, `${JSON.stringify(report, null, 2)}\n`);
console.log('005C_DATA_PLANE=PASS');