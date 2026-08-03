import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';

const read = path => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

const requiredDocs = [
  'release/advisor-os-1.0.0.json',
  'docs/releases/ADVISOR_OS_1_0_KNOWN_LIMITATIONS.md',
  'docs/releases/ADVISOR_OS_1_0_DEFERRED_SCOPE.md',
  'docs/releases/ADVISOR_OS_1_0_OPERATIONAL_ONBOARDING.md',
  'docs/releases/ADVISOR_OS_1_0_END_TO_END_DEMO.md',
  'docs/evidence/ADVISOR_OS_1_0_EVIDENCE_INDEX.md',
  'docs/evidence/ADVISOR_OS_1_0_RELEASE_ACCEPTANCE_CERTIFICATE.md',
];

const expectedGates = [
  'BENVENU', 'COMMAND_BAR', 'AGENDA', 'NOTIFICATIONS', 'CLIPPY',
  'LOW_FRICTION_INPUT', 'BULK_INTAKE', 'BOOKS', 'PIPELINE', 'QUOTES',
  'CONVERSION', 'PORTFOLIO', 'ACTIVITY', 'FORECAST', 'REPORTS',
  'COMPENSATION', 'PUBLIC_ACCEPTANCE',
];

test('release manifest is immutable and complete', async () => {
  const manifest = JSON.parse(await read('release/advisor-os-1.0.0.json'));
  assert.equal(manifest.product, 'Advisor OS');
  assert.equal(manifest.version, '1.0.0');
  assert.equal(manifest.tag, 'advisor-os-v1.0.0');
  assert.equal(manifest.releaseCandidateBaseSha, '0974378c699b513f4800e6eec2d88acb05a076c4');
  assert.equal(manifest.canonicalUrl, 'https://jorgeprdz.github.io/ForgeOS/static-preview/forge-alive/');
  assert.deepEqual(manifest.requiredGates, expectedGates);
  assert.deepEqual(manifest.stopConditions, {
    criticalDefects: 0,
    highDefects: 0,
    unapprovedMutations: 0,
    unknownAsZero: 0,
    publicAssetOverrides: false,
    logoutPrivateDataRemains: false,
  });
});

test('all required release outputs exist', async () => {
  for (const path of requiredDocs) {
    await assert.doesNotReject(() => access(new URL(`../${path}`, import.meta.url)), path);
  }
});

test('certificate contains every final gate and stop condition', async () => {
  const certificate = await read('docs/evidence/ADVISOR_OS_1_0_RELEASE_ACCEPTANCE_CERTIFICATE.md');
  for (const gate of expectedGates) assert.match(certificate, new RegExp(`${gate}=PASS`));
  for (const condition of [
    'CRITICAL_DEFECTS=0',
    'HIGH_DEFECTS=0',
    'UNAPPROVED_MUTATIONS=0',
    'UNKNOWN_AS_ZERO=0',
    'PUBLIC_ACCEPTANCE_WITH_ASSET_OVERRIDES=NO',
    'LOGOUT_PRIVATE_DATA_REMAINS=NO',
  ]) assert.match(certificate, new RegExp(condition));
  assert.match(certificate, /ADVISOR_OS_1_0=COMPLETE/);
});

test('known limitations are explicit failure-closed boundaries', async () => {
  const limitations = await read('docs/releases/ADVISOR_OS_1_0_KNOWN_LIMITATIONS.md');
  assert.match(limitations, /fail closed/i);
  assert.match(limitations, /Opening Google Calendar is not proof/);
  assert.match(limitations, /UNKNOWN≠ZERO/);
  assert.match(limitations, /AUTONOMOUS_OUTBOUND=NO/);
  assert.match(limitations, /DIRECT_UI_DATABASE_WRITES=NO/);
});

test('operational guide and demo cover the continuous advisor loop', async () => {
  const onboarding = await read('docs/releases/ADVISOR_OS_1_0_OPERATIONAL_ONBOARDING.md');
  const demo = await read('docs/releases/ADVISOR_OS_1_0_END_TO_END_DEMO.md');
  for (const term of ['Command Bar', 'Agenda', 'Portfolio', 'Forecast', 'logout']) {
    assert.match(`${onboarding}\n${demo}`, new RegExp(term, 'i'));
  }
  assert.match(demo, /DUPLICATE_PERSON_CREATED=NO/);
  assert.match(demo, /UNAPPROVED_MUTATION=NO/);
});

test('evidence index binds all closure sprints', async () => {
  const evidence = await read('docs/evidence/ADVISOR_OS_1_0_EVIDENCE_INDEX.md');
  for (const pr of ['#222', '#224', '#225', '#226', '#227', '#228', '#229', '#230', '#231', '#232']) {
    assert.match(evidence, new RegExp(pr.replace('#', '\\#')));
  }
  assert.match(evidence, /PAGES_CANONICAL_DEPLOYMENT/);
});
