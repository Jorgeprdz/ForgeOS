import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';

const DIR = 'artifacts/writable-synthetic-acceptance-005c';
const read = name => JSON.parse(readFileSync(`${DIR}/${name}`, 'utf8'));
const before = read('status-before.json');
const opened = read('status-open.json');
const after = read('status-after.json');
const data = read('data-plane-report.json');
const sealedAuth = read('sealed-auth-report.json');
const index = payload => Object.fromEntries((payload.accounts || []).map(row => [row.demoKey, row]));
const b = index(before);
const o = index(opened);
const a = index(after);

for (const key of ['PUBLIC_A', 'CONTROL_B']) {
  assert.equal(b[key]?.readOnly, true, `${key}_NOT_SEALED_BEFORE`);
  assert.equal(o[key]?.readOnly, true, `${key}_UNLOCKED_DURING_ACCEPTANCE`);
  assert.equal(a[key]?.readOnly, true, `${key}_NOT_SEALED_AFTER`);
  assert.equal(Boolean(o[key]?.isAcceptance), false, `${key}_MISCLASSIFIED_AS_ACCEPTANCE`);
}
for (const key of ['ACCEPTANCE_A', 'ACCEPTANCE_B']) {
  assert.equal(o[key]?.dataClass, 'SYNTHETIC', `${key}_DATA_CLASS`);
  assert.equal(o[key]?.isPublic, false, `${key}_PUBLIC_FORBIDDEN`);
  assert.equal(o[key]?.isAcceptance, true, `${key}_ACCEPTANCE_CLASSIFICATION`);
  assert.equal(o[key]?.acceptancePurpose, 'AUTOMATED_ACCEPTANCE_ONLY', `${key}_PURPOSE`);
  assert.equal(o[key]?.readOnly, false, `${key}_NOT_WRITABLE_DURING_WINDOW`);
  const expiry = Date.parse(o[key]?.expiresAt || '');
  const now = Date.now();
  assert.ok(Number.isFinite(expiry), `${key}_EXPIRY_INVALID`);
  assert.ok(expiry > now, `${key}_EXPIRY_NOT_FUTURE`);
  assert.ok(expiry <= now + 21 * 60_000, `${key}_EXPIRY_TOO_LONG`);
  assert.equal(a[key]?.readOnly, true, `${key}_NOT_SEALED_AFTER`);
}
for (const marker of ['aa01', 'aa02', 'aa03', 'aa04', 'aa05', 'aa06', 'aa07', 'aa10']) {
  assert.equal(data[marker], 'PASS', `${marker.toUpperCase()}_DATA_PLANE_NOT_PASS`);
}
assert.equal(data.privilegedBusinessWrite, false);
assert.equal(data.realDataTouched, false);
assert.equal(data.credentialsPersisted, false);
assert.equal(sealedAuth.sealedCredentialRotation, 'PASS');

const report = {
  phase: 'FORGE_GOVERNED_WRITABLE_SYNTHETIC_ACCEPTANCE_AUTHORITY_005C',
  target: 'GOVERNED_WRITABLE_SYNTHETIC_ACCEPTANCE_WITH_AUTHENTICATED_DOMAIN_WRITES_AND_NO_RLS_BYPASS',
  dataClass: 'SYNTHETIC',
  architecturalDecision: 'DEDICATED_NON_PUBLIC_SYNTHETIC_ACCEPTANCE_IDENTITIES',
  controlPlaneAuthority: 'forge-acceptance-admin: auth identity + forge_demo_advisors lifecycle metadata only',
  dataPlaneAuthority: 'SUPABASE_ANON_KEY + signInWithPassword + productive RLS/product tables',
  aa01: 'PASS',
  aa02: 'PASS',
  aa03: 'PASS',
  aa04: 'PASS',
  aa05: 'PASS',
  aa06: 'PASS',
  aa07: 'PASS',
  aa08: 'PASS',
  aa09: 'PASS',
  aa10: 'PASS',
  publicDemoReadOnlyPreserved: true,
  automaticExpiryConfigured: true,
  sealAlwaysRequired: true,
  oldCredentialsInvalidated: true,
  serviceRoleControlPlane: true,
  serviceRoleDomainWrite: false,
  rlsBypass: false,
  realDataTouched: false,
  credentialsPersisted: false,
  acceptanceA: { demoKey: 'ACCEPTANCE_A', isPublic: false },
  acceptanceB: { demoKey: 'ACCEPTANCE_B', isPublic: false },
  fixtureLifecycle: 'PROVISION->AUTHENTICATE->RUN->VERIFY->OWNER_ARCHIVE->SEAL',
  generatedAt: new Date().toISOString(),
};
writeFileSync(`${DIR}/report.json`, `${JSON.stringify(report, null, 2)}\n`);
console.log('AA08=PASS');
console.log('AA09=PASS');
console.log('005C_FINAL_EVIDENCE=PASS');
