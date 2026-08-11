import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

const read = path => readFile(new URL(`../${path}`, import.meta.url), 'utf8');
const home = await read('docs/static-preview/forge-aura/home/home-module-015.js');
const context = await read('docs/static-preview/forge-aura/recomposition/pipeline-consumer-bridge-008.js');
const message = await read('docs/static-preview/forge-aura/pipeline/pipeline-conversation-workspace.js');
const messageCss = await read('docs/static-preview/forge-aura/pipeline/pipeline-conversation-workspace.css');
const messageWrapper = await read('docs/static-preview/forge-aura/recomposition/pipeline-consumer-bridge-015.js');
const messageAdapter = await read('docs/static-preview/forge-aura/pipeline/pipeline-adapter-pages-v6-013.js');
const carteraAdapter = await read('docs/static-preview/forge-aura/cartera/cartera-adapter-pages-v1.js');
const coreUrl = pathToFileURL(new URL('../docs/static-preview/forge-aura/cartera/cartera-core.js', import.meta.url).pathname);
const core = await import(`${coreUrl.href}?phase=016a`);
const adapterUrl = pathToFileURL(new URL('../docs/static-preview/forge-aura/cartera/cartera-adapter-pages-v1.js', import.meta.url).pathname);
const { createCarteraAdapter } = await import(`${adapterUrl.href}?phase=016a`);

function carteraClient(userId, stores) {
  return {
    auth: { getUser: async () => ({ data: { user: { id: userId } }, error: null }) },
    from(table) {
      assert.ok(['canonical_policies', 'cartera020b_policy_evidence_packets'].includes(table), table);
      const query = {
        select() { return query; }, is() { return query; }, eq() { return query; }, order() { return query; }, limit() { return query; },
        then(resolve) { resolve({ data: table === 'canonical_policies' ? stores.get(userId) || [] : [], error: null }); },
      };
      return query;
    },
    async rpc(name, args) {
      if (name === 'forge_cartera010b_confirm_identity_and_policy') {
        const policy = args.p_policy_command.policy;
        stores.set(userId, [{
          policy_reference: policy.policyReference,
          policy_number: policy.policyNumber,
          completeness_state: policy.completenessState,
          conflict_state: policy.conflictState,
          status_value: policy.status.value,
          payment_frequency: policy.paymentFrequency,
        }]);
        return { data: { status: 'CONFIRMED', readAfterWriteVerified: true }, error: null };
      }
      return { data: { items: [] }, error: null };
    },
  };
}

test('BUG01 data state always inserts progress after Mi día', () => {
  assert.match(home, /point\.insertAdjacentElement\('afterend', node\)/);
  assert.doesNotMatch(home, /point\.insertAdjacentElement\('beforebegin', node\)/);
});
test('BUG01 empty/loading reconciliation uses the same stable insertion path', () => {
  assert.match(home, /!snapshot \|\| snapshot\.goalState === 'MISSING'/);
  assert.match(home, /function renderCompass/);
});
test('BUG01 progress surface uses Aura semantic tokens', () => {
  assert.match(home, /background:var\(--aura-warning-soft\);color:var\(--aura-warning\)/);
  assert.match(home, /background:var\(--aura-brand\)/);
  assert.doesNotMatch(home, /#fff8e8|#68521d|#fff2e8/);
});

test('BUG02 sufficient context requires a real recommended action', () => {
  assert.match(context, /some\(item => item\?\.recommendedAction\?\.label\)/);
});
test('BUG02 action hierarchy precedes explanation', () => {
  assert.ok(context.indexOf('QUÉ HACER AHORA') < context.indexOf('<strong>Por qué:<\/strong>'));
});
test('BUG02 uncertainty is brief and evidence is disclosed on demand', () => {
  assert.match(context, /Todavía no puedo recomendar un siguiente paso/);
  assert.match(context, /¿Por qué Forge recomienda esto\?/);
  assert.match(context, /const primary = projections\.find/);
  assert.match(context, /firstRelationshipAction/);
  assert.match(context, /data-pipeline-context-primary-action/);
});

test('BUG03 preparation distinguishes all three allowed product states', () => {
  for (const state of ['MESSAGE_READY', 'HUMAN_EDIT_REQUIRED', 'CANNOT_GENERATE_RELIABLY']) assert.match(message, new RegExp(state));
});
test('BUG03 preapproval safety is not misclassified as generation failure', () => {
  assert.match(messageAdapter, /validation\?\.valid === false \? 'SAFETY_REVIEW_REQUIRED' : 'READY_FOR_HUMAN_REVIEW'/);
  assert.doesNotMatch(message, /boundary de seguridad/);
});
test('BUG03 modal is viewport bounded and empty text cannot enable approval', () => {
  assert.match(messageCss, /max-height:min\(92dvh,820px\)/);
  assert.match(messageCss, /overflow-y:auto;overflow-x:hidden/);
  assert.match(message, /approve\.disabled = !value/);
  assert.match(message, /Prepara un borrador o escribe el mensaje/);
  assert.match(message, /placeholder="Prepara un borrador con Forge o escribe el mensaje manualmente\."/);
  assert.match(messageWrapper, /@media\(max-width:760px\)[\s\S]*\.aura-conversation__flow\{display:none\}/);
});

test('BUG04 confirmed write computes completeness instead of forcing PARTIAL', () => {
  assert.match(carteraAdapter, /confirmedPolicyCompleteness/);
  assert.match(carteraAdapter, /policy\.completenessState=confirmedPolicyCompleteness\(policy\)/);
  assert.ok(carteraAdapter.indexOf('policy.completenessState=confirmedPolicyCompleteness(policy)') > carteraAdapter.indexOf("completenessState:'PARTIAL'"));
});
test('BUG04 complete policies produce no attention and zero pending', () => {
  assert.equal(core.policyCompletenessAttention({ policy_reference: 'p1', completeness_state: 'COMPLETE', conflict_state: 'CLEAR' }), null);
  const metrics = core.panorama({ policies: [{ completeness_state: 'COMPLETE' }] });
  assert.equal(metrics[1].value, 0);
  assert.equal(metrics[1].context, '0 pendientes');
});
test('BUG04 remaining real gap stays specific and payment boundary remains explicit', () => {
  const item = core.policyCompletenessAttention({ policy_reference: 'p1', policy_number: 'ABC', completeness_state: 'PARTIAL', conflict_state: 'CLEAR', status_value: 'ACTIVE' });
  assert.equal(item.title, 'Forma de pago no identificada');
  assert.match(item.reason, /Esto no significa que exista un pago pendiente/);
  assert.doesNotMatch(core.panorama({ policies: [] }).map(item => `${item.label} ${item.context}`).join(' '), /canónic|obligación esperada/i);
});
test('BUG04 confirmed write reconciles attention and survives adapter refresh with A/B isolation', async () => {
  const stores = new Map([
    ['advisor-a', [{ policy_reference: 'policy:a', policy_number: 'A-1', completeness_state: 'PARTIAL', conflict_state: 'CLEAR', status_value: 'ACTIVE' }]],
    ['advisor-b', [{ policy_reference: 'policy:b', policy_number: 'B-1', completeness_state: 'PARTIAL', conflict_state: 'CLEAR', status_value: 'ACTIVE' }]],
  ]);
  const clientA = carteraClient('advisor-a', stores);
  const before = await (await createCarteraAdapter({ client: clientA, windowRef: {} })).loadHome();
  assert.equal(core.deriveAttention(before).length, 1);
  await (await createCarteraAdapter({ client: clientA, windowRef: {} })).persistReviewedDraft({
    draftId: '016a-a', inputMode: 'manual', holderName: 'Persona A', policyNumber: 'A-1',
    productLabel: 'Protección', status: 'ACTIVE', effectiveDate: '2026-01-01', expirationDate: '2027-01-01',
    currency: 'MXN', paymentFrequency: 'MONTHLY',
  });
  const refreshedA = await (await createCarteraAdapter({ client: carteraClient('advisor-a', stores), windowRef: {} })).loadHome();
  assert.equal(refreshedA.policies[0].completeness_state, 'COMPLETE');
  assert.equal(core.deriveAttention(refreshedA).length, 0);
  const sessionB = await (await createCarteraAdapter({ client: carteraClient('advisor-b', stores), windowRef: {} })).loadHome();
  assert.equal(sessionB.policies.length, 1);
  assert.equal(sessionB.policies[0].policy_reference, 'policy:b');
  assert.equal(core.deriveAttention(sessionB).length, 1);
});
