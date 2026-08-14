import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const adapterUrl = new URL('../docs/static-preview/forge-aura/cartera/cartera-adapter-pages-v1.js', import.meta.url);
const radarSqlUrl = new URL('../supabase/migrations/20260801000281_cartera050_future_radar_read.sql', import.meta.url);
const viewUrl = new URL('../platform/portfolio-intelligence/cartera-050d-future-radar-view.js', import.meta.url);
const serviceUrl = new URL('../advisor-os/cartera/cartera-050a-future-radar-service.js', import.meta.url);

async function currentCompletenessDerivation() {
  const source = await readFile(adapterUrl, 'utf8');
  const match = source.match(/function confirmedPolicyCompleteness\(policy\)\{([\s\S]*?)\}\nfunction policyCommand/);
  assert.ok(match, 'current governed Aura policy completeness derivation must remain discoverable');
  return new Function('policy', match[1]);
}

function radarIncompleteEligibility({ completenessState, freshnessState = 'CURRENT', conflictState = 'CLEAR' }) {
  return completenessState !== 'COMPLETE' || freshnessState !== 'CURRENT' || conflictState !== 'CLEAR';
}

const completeFacts = Object.freeze({
  policyNumber: 'POLICY-001',
  productReference: 'product:example',
  effectiveFrom: '2026-08-05',
  effectiveTo: '2053-08-05',
  currency: 'UDI',
  paymentFrequency: 'MONTHLY',
  status: Object.freeze({ value: 'ACTIVE' }),
  premiumAmount: null,
  sumInsured: null,
});

test('real incomplete canonical facts remain eligible for INCOMPLETE_POLICY_DATA', async () => {
  const derive = await currentCompletenessDerivation();
  const incomplete = { ...completeFacts, paymentFrequency: null };
  const completenessState = derive(incomplete);
  assert.equal(completenessState, 'PARTIAL');
  assert.equal(radarIncompleteEligibility({ completenessState }), true);
});

test('complete canonical facts are not eligible for INCOMPLETE_POLICY_DATA even when optional amounts are null', async () => {
  const derive = await currentCompletenessDerivation();
  const completenessState = derive(completeFacts);
  assert.equal(completenessState, 'COMPLETE');
  assert.equal(radarIncompleteEligibility({ completenessState }), false);
});

test('Radar SQL still consumes canonical completeness/freshness/conflict instead of inventing a new truth source', async () => {
  const sql = await readFile(radarSqlUrl, 'utf8');
  assert.match(sql, /coalesce\(p\.completeness_state, 'UNKNOWN'\) <> 'COMPLETE'/);
  assert.match(sql, /coalesce\(p\.freshness_state, 'UNKNOWN'\) <> 'CURRENT'/);
  assert.match(sql, /coalesce\(p\.conflict_state, 'UNKNOWN'\) <> 'CLEAR'/);
});

test('hotfix contains no person-specific Adrian exception', async () => {
  const [view, service] = await Promise.all([
    readFile(viewUrl, 'utf8'),
    readFile(serviceUrl, 'utf8'),
  ]);
  assert.doesNotMatch(`${view}\n${service}`, /ADRIAN|ORTIZ|GARCIA/i);
});
