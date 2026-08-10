import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = path => fs.readFileSync(path, 'utf8');
const index = read('docs/static-preview/forge-aura/index.html');
const carteraAdapter = read('docs/static-preview/forge-aura/cartera/cartera-adapter-pages-v11.js');
const carteraModule = read('docs/static-preview/forge-aura/cartera/cartera-module-v6.js');
const pipelineAdapter = read('docs/static-preview/forge-aura/pipeline/pipeline-adapter-pages-v2.js');

assert.match(index, /pipeline-adapter-pages-v2\.js\?v=forge-beta2-post-release-recovery-010i/);
assert.match(index, /cartera-adapter-pages-v11\.js\?v=forge-beta2-post-release-recovery-010i/);
assert.match(index, /cartera-module-v6\.js\?v=forge-beta2-post-release-recovery-010i/);

// Stale evidence attention may disappear only after durable 020C confirms it.
assert.match(carteraAdapter, /forge_cartera020c_get_confirmation_status/);
assert.match(carteraAdapter, /states\[index\] !== 'CONFIRMED'/);
assert.match(carteraAdapter, /fail open: unreadable status never hides evidence/);
assert.match(carteraAdapter, /packetDigestToken/);
assert.match(carteraAdapter, /dedupeReviews/);

// Reopening a Policy must recover existing governed evidence instead of creating another truth owner.
assert.match(carteraAdapter, /from\('policy_versions'\)/);
assert.match(carteraAdapter, /evidence_version_id/);
assert.match(carteraAdapter, /from\('policy_evidence_versions'\)/);
assert.match(carteraAdapter, /field_claims/);
assert.match(carteraAdapter, /provenance/);
assert.match(carteraAdapter, /createsTruth: false/);

// Role labels must be projected from an already-confirmed CommercialPerson, not inferred by name.
assert.match(carteraAdapter, /participant_person_id/);
assert.match(carteraAdapter, /from\('commercial_people'\)/);
assert.match(carteraAdapter, /\.eq\('lifecycle_state', 'CONFIRMED'\)/);
assert.match(carteraAdapter, /display_label: label/);

// "Revisar documento" must not bubble into base Policy opening.
assert.match(carteraModule, /startsWith\('POLICY_PACKET:AURA:'\)/);
assert.match(carteraModule, /event\.stopImmediatePropagation\(\)/);
assert.match(carteraModule, /loadEvidencePacket\(reference\)/);
assert.match(carteraModule, /data-policy-evidence-recovery/);
assert.match(carteraModule, /Estos datos provienen de la Evidence Version/);
assert.match(carteraModule, /1 \? 'póliza' : 'pólizas'/);

// Contact fallback uses only an explicit active PROSPECT -> CommercialPerson link.
assert.match(pipelineAdapter, /commercial_source_identity_links/);
assert.match(pipelineAdapter, /source_identity_type', 'PROSPECT'/);
assert.match(pipelineAdapter, /LINK_CONFIRMED/);
assert.match(pipelineAdapter, /CREATE_CONFIRMED/);
assert.match(pipelineAdapter, /commercial_people/);
assert.match(pipelineAdapter, /verified_phone/);
assert.match(pipelineAdapter, /lifecycle_state', 'CONFIRMED'/);
assert.match(pipelineAdapter, /CONFIRMED_COMMERCIAL_PERSON/);
assert.match(pipelineAdapter, /autoIdentityMerge: false/);
assert.match(pipelineAdapter, /autonomousCommercialExecution: false/);
assert.doesNotMatch(pipelineAdapter, /normalized_name|display_name.*eq\(|preferred_name.*eq\(/);

// 010I is presentation/read recovery only: no direct persistence was added in the new adapters/modules.
for (const [name, source] of [
  ['cartera-adapter-v11', carteraAdapter],
  ['cartera-module-v6', carteraModule],
  ['pipeline-adapter-v2', pipelineAdapter],
]) {
  assert.doesNotMatch(source, /client\.from\([^\n]+\)\s*\.insert\(/, `${name} must not insert`);
  assert.doesNotMatch(source, /client\.from\([^\n]+\)\s*\.update\(/, `${name} must not update`);
  assert.doesNotMatch(source, /client\.from\([^\n]+\)\s*\.delete\(/, `${name} must not delete`);
}

console.log('FORGE_BETA2_POST_RELEASE_RECOVERY_010I=PASS');
console.log('CARTERA_STALE_REVIEW_FILTER=PASS');
console.log('CARTERA_EVIDENCE_OPEN_BOUNDARY=PASS');
console.log('CARTERA_POLICY_EVIDENCE_RECOVERY=PASS');
console.log('CARTERA_ROLE_PERSON_PROJECTION=PASS');
console.log('PIPELINE_CONFIRMED_CONTACT_FALLBACK=PASS');
console.log('PRODUCTIVE_DOMAIN_MUTATION=0');
