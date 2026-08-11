import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = path => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('RU09 source-owner: interactive Cartera reclaims the exact admitted inbox through the existing DB overload', async () => {
  const [adapter, migration, index] = await Promise.all([
    read('docs/static-preview/forge-aura/cartera/cartera-adapter-pages-v4.js'),
    read('supabase/migrations/20260810001200_cartera020b_targeted_interactive_claim_012.sql'),
    read('docs/static-preview/forge-aura/index.html'),
  ]);
  assert.match(adapter, /p_inbox_reference:\s*command\.inboxReference/);
  assert.match(adapter, /claimed\?\.data\?\.inboxReference !== command\.inboxReference/);
  assert.match(adapter, /CARTERA020B_EXPECTED_ITEM_NOT_RECLAIMED/);
  assert.match(migration, /forge_cartera020b_claim_evidence\(\s*p_worker_id text,\s*p_lease_seconds integer,\s*p_inbox_reference text\s*\)/s);
  assert.match(migration, /i\.inbox_reference = p_inbox_reference/);
  assert.match(migration, /'claimMode','EXACT_INBOX'/);
  assert.match(index, /"\.\/cartera\/cartera-adapter-pages-v1\.js"\s*:\s*"\.\/cartera\/cartera-adapter-pages-v13\.js/);
});

test('RU10 source-owner: productive Cartera composes canonical coverage and document evidence without promoting evidence to truth', async () => {
  const [index, module, presentation] = await Promise.all([
    read('docs/static-preview/forge-aura/index.html'),
    read('docs/static-preview/forge-aura/cartera/cartera-module-v10-013.js'),
    read('docs/static-preview/forge-aura/cartera/cartera-policy-evidence-presentation-013.js'),
  ]);
  assert.match(index, /cartera-module-v10-013\.js\?v=forge-beta2-013-policy-evidence-presentation/);
  assert.match(module, /cartera-policy-evidence-presentation-013\.js/);
  for (const state of [
    'CANONICAL_AND_DOCUMENT_EVIDENCE',
    'DOCUMENT_EVIDENCE_ONLY',
    'CANONICAL_ONLY',
    'NO_CONFIRMED_DETAIL_OR_DOCUMENT_ROWS',
  ]) assert.match(presentation, new RegExp(state));
  assert.match(presentation, /evidencePromotedToTruth:\s*false/);
  assert.match(presentation, /canonicalCoverageOwnerChanged:\s*false/);
  assert.match(presentation, /evidenceOwnerChanged:\s*false/);
  assert.doesNotMatch(presentation, /\.from\(|\.rpc\(|insert\(|update\(|delete\(/);
});

test('RU11 source-owner: Home humanization stays in presentation and preserves decision continuity', async () => {
  const [homeWrapper, homePresentation] = await Promise.all([
    read('docs/static-preview/forge-aura/home/home-module-008.js'),
    read('docs/static-preview/forge-aura/home/home-human-presentation-013.js'),
  ]);
  assert.match(homeWrapper, /home-human-presentation-013\.js/);
  assert.match(homeWrapper, /decisionReference/);
  assert.match(homeWrapper, /decisionContextTransport:\s*true/);
  assert.match(homePresentation, /No hay asuntos adicionales que requieran tu revisión/);
  assert.match(homePresentation, /Por qué conviene revisarlo/);
  assert.match(homePresentation, /Información técnica/);
  assert.match(homePresentation, /ownerChanges:\s*0/);
  assert.match(homePresentation, /domainWrites:\s*0/);
});

test('RU12 source-owner: Home and Pipeline share one presentation-only contract with no second NASH or intelligence engine', async () => {
  const [shared, home, pipeline] = await Promise.all([
    read('docs/static-preview/forge-aura/recomposition/human-context-presentation-013.js'),
    read('docs/static-preview/forge-aura/home/home-human-presentation-013.js'),
    read('docs/static-preview/forge-aura/recomposition/pipeline-crs10-context-presentation-013.js'),
  ]);
  assert.match(shared, /FORGE_HUMAN_CONTEXT_PRESENTATION_013/);
  assert.match(shared, /role:\s*'PRESENTATION_ONLY'/);
  assert.match(shared, /createsTruth:\s*false/);
  assert.match(shared, /createsScore:\s*false/);
  assert.match(shared, /createsRecommendation:\s*false/);
  assert.match(shared, /callsAi:\s*false/);
  assert.match(shared, /callsNash:\s*false/);
  assert.match(shared, /persists:\s*false/);
  assert.match(home, /human-context-presentation-013\.js/);
  assert.match(pipeline, /human-context-presentation-013\.js/);
  assert.doesNotMatch(shared, /fetch\(|\.rpc\(|\.from\(|openai|anthropic|generateMessage|conversationBrief/i);
});
