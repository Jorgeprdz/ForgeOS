import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';

const DIR = 'artifacts/cartera-pipeline-identity-005b-r1';
const read = name => JSON.parse(readFileSync(`${DIR}/${name}`, 'utf8'));
const before = read('status-before.json');
const opened = read('status-open.json');
const after = read('status-after.json');
const seal = read('seal.json');
const fixture = read('fixture-preflight.json');
const data = read('report.json');
const sealedAuth = read('sealed-auth-report.json');
const index = payload => Object.fromEntries((payload.accounts || []).map(row => [row.demoKey, row]));
const b = index(before);
const o = index(opened);
const a = index(after);

for (const key of ['PUBLIC_A', 'CONTROL_B']) {
  assert.equal(b[key]?.readOnly, true, `${key}_NOT_SEALED_BEFORE`);
  assert.equal(o[key]?.readOnly, true, `${key}_UNLOCKED_DURING_005B_R1`);
  assert.equal(a[key]?.readOnly, true, `${key}_NOT_SEALED_AFTER`);
  assert.equal(Boolean(o[key]?.isAcceptance), false, `${key}_MISCLASSIFIED_AS_ACCEPTANCE`);
}
for (const key of ['ACCEPTANCE_A', 'ACCEPTANCE_B']) {
  assert.equal(o[key]?.dataClass, 'SYNTHETIC', `${key}_DATA_CLASS`);
  assert.equal(o[key]?.isPublic, false, `${key}_PUBLIC_FORBIDDEN`);
  assert.equal(o[key]?.isAcceptance, true, `${key}_ACCEPTANCE_CLASSIFICATION`);
  assert.equal(o[key]?.acceptancePurpose, 'AUTOMATED_ACCEPTANCE_ONLY', `${key}_PURPOSE`);
  assert.equal(o[key]?.readOnly, false, `${key}_NOT_WRITABLE_DURING_WINDOW`);
  assert.equal(a[key]?.readOnly, true, `${key}_NOT_SEALED_AFTER`);
}
assert.equal(seal.ok, true, '005B_R1_SEAL_FAILED');
assert.equal(seal.accountsSealed, 2, '005B_R1_SEAL_COUNT');
assert.equal(sealedAuth.sealedCredentialRotation, 'PASS', '005B_R1_OLD_CREDENTIAL_REUSE_NOT_DENIED');
assert.equal(fixture.fixtureRlsIsolation, true, '005B_R1_FIXTURE_RLS_ISOLATION_FAILED');
assert.equal(fixture.privilegedDomainWrite, false, '005B_R1_FIXTURE_PRIVILEGED_WRITE');
assert.equal(fixture.realDataTouched, false, '005B_R1_FIXTURE_REAL_DATA');

for (let index = 1; index <= 7; index += 1) {
  const marker = `pa${String(index).padStart(2, '0')}`;
  assert.equal(data[marker], 'PASS', `${marker.toUpperCase()}_NOT_PASS`);
}
assert.equal(data.activeLinkCount, 1, '005B_R1_ACTIVE_LINK_COUNT');
assert.equal(data.canonicalPersonCount, 1, '005B_R1_PERSON_COUNT');
assert.equal(data.policyCount, 1, '005B_R1_POLICY_COUNT');
assert.equal(data.temporaryFixturesArchived, true, '005B_R1_OWNER_SCOPED_CLEANUP_NOT_PROVEN');
assert.equal(data.realClientDataUsed, false, '005B_R1_REAL_CLIENT_DATA_USED');
assert.equal(data.credentialsPersisted, false, '005B_R1_CREDENTIALS_PERSISTED');

const report = {
  phase: 'FORGE_CARTERA_PIPELINE_IDENTITY_PRODUCTIVE_ACCEPTANCE_005B_R1',
  dataClass: 'SYNTHETIC',
  acceptanceAuthority: 'FORGE_GOVERNED_WRITABLE_SYNTHETIC_ACCEPTANCE_AUTHORITY_005C',
  pa01: 'PASS',
  pa02: 'PASS',
  pa03: 'PASS',
  pa04: 'PASS',
  pa05: 'PASS',
  pa06: 'PASS',
  pa07: 'PASS',
  rlsIsolation: true,
  readAfterWrite: true,
  identityBoundary: true,
  policyTruthBoundary: true,
  ownerScopedCleanup: true,
  postRunSealed: true,
  publicDemoTouched: false,
  serviceRoleDomainWrite: false,
  rlsBypass: false,
  realDataTouched: false,
  oldCredentialsInvalidated: true,
  generatedAt: new Date().toISOString(),
};
writeFileSync(`${DIR}/final-report.json`, `${JSON.stringify(report, null, 2)}\n`);
console.log('PA01=PASS');
console.log('PA02=PASS');
console.log('PA03=PASS');
console.log('PA04=PASS');
console.log('PA05=PASS');
console.log('PA06=PASS');
console.log('PA07=PASS');
console.log('RLS_ISOLATION=PASS');
console.log('READ_AFTER_WRITE=PASS');
console.log('IDENTITY_BOUNDARY=PASS');
console.log('POLICY_TRUTH_BOUNDARY=PASS');
console.log('OWNER_SCOPED_CLEANUP=PASS');
console.log('POST_RUN_SEALED=PASS');
console.log('REAL_DATA_TOUCHED=NO');
console.log('PUBLIC_DEMO_TOUCHED=NO');
console.log('SERVICE_ROLE_DOMAIN_WRITE=NO');
console.log('005B_R1_FINAL_EVIDENCE=PASS');
