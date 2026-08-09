import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = path => fs.readFileSync(path, 'utf8');

const moduleV4 = read('docs/static-preview/forge-aura/cartera/cartera-module-v4.js');
const adapterV10 = read('docs/static-preview/forge-aura/cartera/cartera-adapter-pages-v10.js');
const crs03 = read('platform/shared-commercial-model/crs-03-pipeline-person-convergence-contract.js');
const timeline = read('platform/shared-commercial-model/crs-08-unified-person-timeline-adapters.js');
const authority = read('platform/shared-commercial-model/crs-01-existing-cartera-authority-registry.js');
const identityRpc = read('supabase/migrations/20260731000211_cartera010b_identity_resolution_rpc.sql');
const identityFoundation = read('supabase/migrations/20260731000200_cartera010b_identity_policy_foundation.sql');

const PIPELINE_PREFIX = 'pipeline-prospect:';

test('productive Aura Cartera mounts the governed v10 convergence adapter', () => {
  assert.match(moduleV4, /cartera-adapter-pages-v10\.js\?v=forge-shared-authority-identity-convergence-003/);
  assert.doesNotMatch(moduleV4, /createSemanticCarteraAdapter[^\n]+cartera-adapter-pages-v8/);
  assert.match(adapterV10, /createCarteraAdapter as createIngressParityAdapter.*cartera-adapter-pages-v9/);
});

test('unresolved Pipeline prospects are surfaced as explicit human-review candidates', () => {
  assert.match(adapterV10, /client\.from\('prospects'\)/);
  assert.match(adapterV10, /client\.from\('commercial_source_identity_links'\)/);
  assert.match(adapterV10, /client\.from\('commercial_people'\)/);
  assert.match(adapterV10, /source:\s*'PIPELINE_PROSPECT'/);
  assert.match(adapterV10, /Pipeline · requiere vinculación explícita/);
  assert.match(adapterV10, /reference:\s*`\$\{PIPELINE_PREFIX\}\$\{id\}`/);
  assert.equal(PIPELINE_PREFIX, 'pipeline-prospect:');
});

test('already-linked prospects reuse canonical CommercialPerson instead of duplicating identity', () => {
  assert.match(adapterV10, /activeProspectPerson/);
  assert.match(adapterV10, /PIPELINE_LINKED_PERSON/);
  assert.match(adapterV10, /if \(existingReferences\.has\(person\.person_reference\)\) continue/);
  assert.match(adapterV10, /if \(alreadyLinked\) return alreadyLinked/);
});

test('human confirmation crosses only the existing 010B identity RPC', () => {
  assert.match(adapterV10, /const IDENTITY_RPC = 'forge_cartera010b_confirm_identity_resolution'/);
  assert.match(adapterV10, /outcome:\s*durablePerson \? 'LINK_CONFIRMED' : 'CREATE_CONFIRMED'/);
  assert.match(adapterV10, /reasonCode:\s*durablePerson/);
  assert.match(adapterV10, /client\.auth\.getUser\(\)/);
  assert.match(adapterV10, /client\.rpc\(IDENTITY_RPC/);
  assert.match(adapterV10, /existingPersonReference:\s*personReference/);
  assert.doesNotMatch(adapterV10, /\.from\('commercial_people'\)[\s\S]{0,180}\.(?:insert|update|delete)\s*\(/);
});

test('CRS-03 preserves Prospect authority and forbids automatic identity resolution', () => {
  assert.match(crs03, /UNRESOLVED/);
  assert.match(crs03, /PIPELINE_PROSPECT_AUTHORITY/);
  assert.match(crs03, /AUTOMATIC_IDENTITY_RESOLUTION|automaticIdentityResolution/i);
  assert.match(crs03, /LINKED/);
});

test('CommercialPerson remains the existing Cartera 010B authority', () => {
  assert.match(authority, /CARTERA_010B_COMMERCIAL_PERSON/);
  assert.match(authority, /CARTERA_010B_IDENTITY_RESOLUTION/);
  assert.match(identityFoundation, /commercial_people/);
  assert.match(identityFoundation, /identity_resolution_decisions/);
  assert.match(identityFoundation, /commercial_source_identity_links/);
});

test('identity confirmation is owner-scoped, audited and idempotent at the existing RPC boundary', () => {
  assert.match(identityRpc, /auth\.uid\(\)/);
  assert.match(identityRpc, /idempotency/i);
  assert.match(identityRpc, /pg_advisory|advisory/i);
  assert.match(identityRpc, /identity_resolution_decisions/);
  assert.match(identityRpc, /commercial_source_identity_links/);
  assert.match(identityFoundation, /enable row level security/i);
  assert.match(identityFoundation, /auth\.uid\(\)/);
  assert.doesNotMatch(adapterV10, /service_role/i);
});

test('one unified Timeline is preserved; convergence does not create a parallel ledger', () => {
  assert.match(timeline, /PIPELINE|Pipeline/);
  assert.match(timeline, /timeline/i);
  assert.doesNotMatch(adapterV10, /create.*timeline|timeline.*insert/i);
});

test('no automatic matching by name, email, phone, AI or fuzzy score is introduced', () => {
  assert.doesNotMatch(adapterV10, /fuzzy|levenshtein|embedding|llm|openai|auto.?merge/i);
  assert.doesNotMatch(adapterV10, /match.*(?:email|phone|name).*score|score.*match/i);
  assert.match(adapterV10, /requires? vinculación explícita|requiere vinculación explícita/i);
});

test('the semantic review keeps the explicit human decision before incorporation', () => {
  assert.match(moduleV4, /Vincular persona existente/);
  assert.match(moduleV4, /Crear persona nueva/);
  assert.match(moduleV4, /Tu confirmación crea la frontera de verdad/);
  assert.match(moduleV4, /Confirmar e incorporar/);
  assert.match(moduleV4, /activeAdapter\.confirmPdfReview/);
});

console.log('FORGE_SHARED_AUTHORITY_AND_IDENTITY_CONVERGENCE_003=PASS');
