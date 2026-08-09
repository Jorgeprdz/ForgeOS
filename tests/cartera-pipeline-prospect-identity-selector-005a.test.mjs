import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const index = await readFile(new URL('../docs/static-preview/forge-aura/index.html', import.meta.url), 'utf8');
const moduleV5 = await readFile(new URL('../docs/static-preview/forge-aura/cartera/cartera-module-v5.js', import.meta.url), 'utf8');
const adapterV10 = await readFile(new URL('../docs/static-preview/forge-aura/cartera/cartera-adapter-pages-v10.js', import.meta.url), 'utf8');
const crs03 = await readFile(new URL('../docs/architecture/source-truth/FORGE_CRS_03_PIPELINE_PERSON_CONVERGENCE_001.md', import.meta.url), 'utf8');

function block(source, startMarker, endMarker = null) {
  const start = source.indexOf(startMarker);
  assert.notEqual(start, -1, `missing start marker: ${startMarker}`);
  const end = endMarker ? source.indexOf(endMarker, start + startMarker.length) : source.length;
  assert.notEqual(end, -1, `missing end marker: ${endMarker}`);
  return source.slice(start, end);
}

test('005A canonical Aura mount resolves Cartera through module-v5 and adapter-v10', () => {
  assert.match(index, /\.\/cartera\/cartera-module-v4\.js\?v=cartera-pdf-semantic-reconciliation-012"\s*:\s*"\.\/cartera\/cartera-module-v5\.js\?v=cartera-020c-policy-attach-pipeline-person-015/);
  assert.match(index, /\.\/cartera\/cartera-adapter-pages-v9\.js\?v=cartera-pdf-ingress-legacy-refresh"\s*:\s*"\.\/cartera\/cartera-adapter-pages-v10\.js\?v=cartera-020c-policy-attach-pipeline-person-015/);
  assert.match(moduleV5, /cartera-adapter-pages-v9\.js\?v=cartera-pdf-ingress-legacy-refresh/);
});

test('005A directory read surfaces unresolved Pipeline prospects without invoking identity mutation', () => {
  const pipelineRead = block(adapterV10, 'async function loadPipelinePeople', 'async function loadDurableIdentityPerson');
  const directoryRead = block(adapterV10, 'async loadDirectory()', 'async confirmPdfReview');

  assert.match(pipelineRead, /client\.from\('prospects'\)/);
  assert.match(pipelineRead, /client\.from\('commercial_source_identity_links'\)/);
  assert.match(pipelineRead, /source:\s*'PIPELINE_PROSPECT'/);
  assert.match(pipelineRead, /Pipeline · requiere vinculación explícita/);
  assert.match(directoryRead, /loadPipelinePeople\(client, baseDirectory\)/);
  assert.doesNotMatch(pipelineRead, /client\.rpc\(IDENTITY_RPC/);
  assert.doesNotMatch(directoryRead, /client\.rpc\(IDENTITY_RPC/);
});

test('005A convergence begins only from an explicitly selected Pipeline prospect reference', () => {
  const confirmation = block(adapterV10, 'async confirmPdfReview(review, input = {})');
  const resolution = block(adapterV10, 'async function resolvePipelineProspect', 'export function createCarteraAdapter');

  assert.match(confirmation, /pipelineProspectReference\(input\.existingPersonReference\)/);
  assert.match(confirmation, /if \(prospectReference\)/);
  assert.match(confirmation, /resolvePipelineProspect\(client, review, prospectReference\)/);
  assert.match(confirmation, /existingPersonReference:\s*personReference/);

  assert.match(resolution, /sourceIdentityType:\s*'PROSPECT'/);
  assert.match(resolution, /outcome:\s*durablePerson \? 'LINK_CONFIRMED' : 'CREATE_CONFIRMED'/);
  assert.match(resolution, /client\.rpc\(IDENTITY_RPC, \{ p_command: command \}\)/);
  assert.match(adapterV10, /const IDENTITY_RPC = 'forge_cartera010b_confirm_identity_resolution'/);
});

test('005A preserves CRS-03 unresolved and no-automatic-identity boundaries', () => {
  assert.match(crs03, /NEW_PROSPECT_INITIAL_CONVERGENCE=PERSON_UNRESOLVED/);
  assert.match(crs03, /IDENTITY_RESOLVED_AUTOMATICALLY=NO/);
  assert.match(crs03, /AUTOMATIC_IDENTITY_MERGE=FORBIDDEN/);
  assert.match(crs03, /PARALLEL_IDENTITY_RESOLUTION=FORBIDDEN/);
});
