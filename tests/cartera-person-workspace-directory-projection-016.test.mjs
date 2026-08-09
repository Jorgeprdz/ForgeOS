import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

import {
  buildContactProjection,
  humanPipelineState,
  isConfirmedProspectSourceLink,
  isCurrentConfirmedPolicyRole,
  presentProductReference,
} from '../docs/static-preview/forge-aura/cartera/cartera-person-projection-016.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(here, '..');
const read = relative => readFile(path.join(repo, relative), 'utf8');
const fixture = JSON.parse(await read('tests/fixtures/cartera-person-workspace-directory-projection-016.synthetic.json'));
const [adapterSource, moduleSource, cssSource, indexSource, adapterEntry, moduleEntry, durable015, semantic015] = await Promise.all([
  read('docs/static-preview/forge-aura/cartera/cartera-adapter-pages-v11.js'),
  read('docs/static-preview/forge-aura/cartera/cartera-module-v6.js'),
  read('docs/static-preview/forge-aura/cartera/cartera-projection-016.css'),
  read('docs/static-preview/forge-aura/index.html'),
  read('docs/static-preview/forge-aura/cartera/cartera-adapter-pages-v10.js'),
  read('docs/static-preview/forge-aura/cartera/cartera-module-v5.js'),
  read('docs/static-preview/forge-aura/cartera/cartera-adapter-pages-v10-base-015.js'),
  read('docs/static-preview/forge-aura/cartera/cartera-module-v5-base-015.js'),
]);

test('T016-01 directory buttons explicitly reset browser-native appearance', () => {
  assert.match(cssSource, /button\.cartera-directory-row\[data-directory-reference\][\s\S]*-webkit-appearance:\s*none/);
  assert.match(cssSource, /appearance:\s*none/);
  assert.match(cssSource, /border:\s*0/);
  assert.match(cssSource, /background:\s*transparent/);
  assert.match(cssSource, /width:\s*100%/);
  assert.match(cssSource, /text-align:\s*left/);
  assert.doesNotMatch(cssSource, /!important/);
});

test('T016-02 confirmed Prospect source projects Pipeline contact without copying to CommercialPerson', () => {
  assert.equal(isConfirmedProspectSourceLink(fixture.sourceLink), true);
  const projection = buildContactProjection({ prospects: [fixture.prospect], methods: [] });
  assert.equal(projection.sourceState, 'AVAILABLE');
  assert.equal(projection.phone.value, '+525500001616');
  assert.equal(projection.phone.source, 'PIPELINE_PROSPECT');
  assert.equal(projection.phone.consentStatus, 'NOT_ASSERTED');
  assert.equal(humanPipelineState(projection.prospectStates), 'Cliente');
  assert.doesNotMatch(adapterSource, /commercial_people[\s\S]{0,400}\.(insert|update|delete)\s*\(/);
});

test('T016-03 missing email remains explicitly not informed while phone remains available', () => {
  const projection = buildContactProjection({ prospects: [fixture.prospect], methods: [] });
  assert.equal(projection.phone.state, 'AVAILABLE');
  assert.equal(projection.email.state, 'NOT_INFORMED');
  assert.equal(projection.email.value, null);
  assert.match(moduleSource, /No informado/);
});

test('T016-04 person-policy join uses CommercialPerson id and accepts current finite roles', () => {
  const current = fixture.roles.filter(role =>
    role.participant_person_id === fixture.person.id
      && isCurrentConfirmedPolicyRole(role, Date.parse('2026-08-08T12:00:00.000Z')),
  );
  assert.equal(current.length, 2);
  assert.deepEqual([...new Set(current.map(role => role.policy_id))], [fixture.policy.id]);
  assert.match(adapterSource, /\.eq\('participant_person_id',\s*person\.id\)/);
  assert.match(adapterSource, /\.eq\('confirmation_state',\s*'CONFIRMED'\)/);
  assert.doesNotMatch(adapterSource, /participant_person_reference\s*===\s*reference/);
});

test('T016-05 roles belonging to another person never enter the person policy projection', () => {
  const current = fixture.roles.filter(role =>
    role.participant_person_id === fixture.person.id
      && isCurrentConfirmedPolicyRole(role, Date.parse('2026-08-08T12:00:00.000Z')),
  );
  assert.equal(current.some(role => role.participant_person_id !== fixture.person.id), false);
  assert.equal(current.some(role => role.policy_id === '40000000-0000-4000-8000-000000000016'), false);
});

test('T016-06 source unavailable is represented as unavailable, not an empty contact list', () => {
  const projection = buildContactProjection({ sourceState: 'UNAVAILABLE', reason: 'SYNTHETIC_SOURCE_DOWN' });
  assert.equal(projection.sourceState, 'UNAVAILABLE');
  assert.equal(projection.phone.state, 'UNAVAILABLE');
  assert.equal(projection.email.state, 'UNAVAILABLE');
  assert.match(moduleSource, /No pudimos consultar los datos de contacto/);
  assert.match(moduleSource, /No pudimos consultar las pólizas relacionadas/);
});

test('T016-07 product references receive a presentation label without a product-specific lookup table', () => {
  const label = presentProductReference(fixture.policy.product_reference);
  assert.equal(label, 'Imagina Ser 65 15 Pagos UDI');
  assert.equal(label.startsWith('Imagina Ser'), true);
  assert.equal(label.includes('product:'), false);
  assert.doesNotMatch(adapterSource, /switch\s*\([^)]*product/i);
  assert.doesNotMatch(moduleSource, /imagina-ser\s*:/i);
});

test('T016-08 Galaxy-size mobile contract preserves touch targets, reflow and bottom-nav clearance', () => {
  assert.match(cssSource, /@media\s*\(max-width:\s*640px\)/);
  assert.match(cssSource, /min-height:\s*44px/);
  assert.match(cssSource, /padding-bottom:\s*calc\(104px\s*\+\s*env\(safe-area-inset-bottom/);
  assert.match(cssSource, /grid-template-columns:\s*minmax\(0,\s*1fr\)/);
  assert.match(cssSource, /overflow-wrap:\s*anywhere/);
  assert.match(moduleSource, /cartera-projection-016\.css\?v=cartera-person-workspace-directory-projection-016/);
});

test('T016-09 Person Workspace tabs are real accessible tabs and decorative Historial is removed', () => {
  assert.match(moduleSource, /role=\"tab\"/);
  assert.match(moduleSource, /aria-controls=\"cartera-person-panel-summary\"/);
  assert.match(moduleSource, /ArrowRight/);
  assert.match(moduleSource, /ArrowLeft/);
  assert.match(moduleSource, /Home/);
  assert.match(moduleSource, /End/);
  assert.match(moduleSource, /role',\s*'tabpanel'/);
  assert.doesNotMatch(moduleSource, />Historial</);
});

test('T016-10 synthetic 6169 relationship resolves one policy without production PII', () => {
  const currentRoles = fixture.roles.filter(role =>
    role.participant_person_id === fixture.person.id
      && isCurrentConfirmedPolicyRole(role, Date.parse('2026-08-08T12:00:00.000Z')),
  );
  const policies = new Set(currentRoles.map(role => role.policy_id));
  assert.equal(fixture.policy.policy_number.endsWith('6169'), true);
  assert.equal(policies.size, 1);
  assert.equal(policies.has(fixture.policy.id), true);
  assert.equal(fixture.person.display_name, 'Alex Ejemplo');
});

test('D016-07 eliminates the old all-policies -> role-RPC N+1 path at the active adapter boundary', () => {
  assert.match(adapterSource, /from\('policy_roles'\)/);
  assert.match(adapterSource, /\.in\('id',\s*policyIds\)/);
  assert.doesNotMatch(adapterSource, /for\s*\(const\s+policy\s+of\s+policies\)/);
  assert.doesNotMatch(adapterSource, /forge_cartera010b_list_general_policy_roles/);
  assert.match(adapterEntry, /cartera-adapter-pages-v11\.js\?v=cartera-person-workspace-directory-projection-016/);
});

test('016 remains a read-only projection and preserves durable 015 and semantic v5 byte-for-byte bases', () => {
  assert.doesNotMatch(adapterSource, /\.(insert|update|delete|upsert)\s*\(/);
  assert.doesNotMatch(adapterSource, /forge_cartera010b_confirm_identity_resolution/);
  assert.doesNotMatch(adapterSource, /forge_cartera020c_attach_policy_confirmation/);
  assert.match(adapterSource, /createDurableAdapter/);
  assert.match(adapterSource, /personPolicyNPlusOne016:\s*false/);
  assert.match(adapterSource, /cartera-adapter-pages-v10-base-015\.js/);
  assert.match(durable015, /forge_cartera020c_attach_policy_confirmation_durable/);
  assert.match(moduleSource, /cartera-module-v5-base-015\.js/);
  assert.match(semantic015, /data-semantic-review=\"014\"/);
});

test('runtime publication stays inside existing v10/v5 import-map targets and bridges to v11/v6', () => {
  assert.match(indexSource, /cartera-adapter-pages-v10\.js\?v=cartera-020c-policy-attach-pipeline-person-015/);
  assert.match(indexSource, /cartera-module-v5\.js\?v=cartera-020c-policy-attach-pipeline-person-015/);
  assert.match(adapterEntry, /cartera-adapter-pages-v11\.js\?v=cartera-person-workspace-directory-projection-016/);
  assert.match(moduleEntry, /cartera-module-v6\.js\?v=cartera-person-workspace-directory-projection-016/);
  assert.doesNotMatch(indexSource, /cartera-person-workspace-directory-projection-016/);
});

test('active person presentation reuses projection cached by the adapter instead of repeating the read', () => {
  assert.match(adapterSource, /personProjectionCache\.set/);
  assert.match(adapterSource, /getCachedCarteraPersonProjection/);
  assert.match(moduleSource, /const cached = getCachedCarteraPersonProjection\(personReference\)/);
  assert.match(moduleSource, /cached \|\| await loadCarteraPersonProjection/);
});

test('runtime code contains no production Adrián or policy-number hardcode', () => {
  const runtime = `${adapterSource}\n${moduleSource}`;
  assert.doesNotMatch(runtime, /ADRIAN ORTIZ GARCIA/i);
  assert.doesNotMatch(runtime, /VI0003006169/i);
});
