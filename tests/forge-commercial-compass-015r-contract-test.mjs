import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = path => readFile(new URL(`../${path}`, import.meta.url), 'utf8');
const [builder, home, bridge, workspace, carteraAdapter, carteraModule, carteraCore, decision, publicTest] = await Promise.all([
  read('scripts/prepare-aura-home-pages-authorities.mjs'),
  read('docs/static-preview/forge-aura/home/home-adapter-pages-v3-015.js'),
  read('docs/static-preview/forge-aura/recomposition/pipeline-consumer-bridge-015.js'),
  read('docs/static-preview/forge-aura/pipeline/pipeline-conversation-workspace.js'),
  read('docs/static-preview/forge-aura/cartera/cartera-adapter-pages-v12.js'),
  read('docs/static-preview/forge-aura/cartera/cartera-module.js'),
  read('docs/static-preview/forge-aura/cartera/cartera-core.js'),
  read('docs/static-preview/forge-aura/recomposition/pipeline-consumer-bridge-008.js'),
  read('tests/e2e/forge-commercial-compass-015.spec.mjs'),
]);

const checks = [
  ['001A', builder.includes('advisor-monthly-policy-goal-repository.mjs')],
  ['001B', home.includes("../../forge-alive/home-authorities/repo/")],
  ['001C', builder.includes('home-authorities/repo') && home.includes('home-authorities/repo')],
  ['002A', bridge.includes("existing.slice(1).forEach(node => node.remove())")],
  ['002B', publicTest.includes('open three times')],
  ['002C', publicTest.includes('unmount') && publicTest.includes('mount')],
  ['003A', bridge.includes("querySelectorAll('[data-message-adjustments-015]')")],
  ['003B', publicTest.includes('optional section singleton')],
  ['003C', publicTest.includes('prospect switch')],
  ['004A', workspace.includes('approvalFingerprint')],
  ['004B', workspace.includes('exactFingerprint !== approvalFingerprint(state)')],
  ['004C', workspace.includes('El objetivo o los ajustes cambiaron')],
  ['005A', carteraCore.includes('const seen=new Set()')],
  ['005B', carteraCore.includes("item.action.type!=='none'")],
  ['005C', carteraCore.includes('if(seen.has(key))return false')],
  ['006A', !carteraCore.includes('datos canónicos')],
  ['006B', !carteraCore.includes('verdad canónica')],
  ['006C', carteraModule.includes('Información confirmada que te ayuda a dar continuidad.')],
  ['007A', carteraAdapter.includes('readPipelineRelationshipContext')],
  ['007B', carteraAdapter.includes('ForgeProspectJournalServiceP7')],
  ['007C', carteraModule.includes('pipeline.commitments') && carteraModule.includes('pipeline.notes')],
  ['008A', carteraAdapter.includes('ForgeProspectTimelineServiceNFAST08')],
  ['008B', carteraModule.includes('memory.history')],
  ['008C', carteraModule.includes('Aún no hay actividad confirmada para mostrar.')],
  ['009A', decision.includes('CONTEXT_SUFFICIENT')],
  ['009B', decision.includes('CONTEXT_INCOMPLETE_BUT_ACTIONABLE')],
  ['009C', decision.includes('CONTEXT_INSUFFICIENT') && decision.includes('Completar información')],
];
for (const [id, pass] of checks) assert.equal(pass, true, `${id}=FAIL`);
console.log(`FORGE_COMMERCIAL_COMPASS_015R_CONTRACT=PASS checks=${checks.length}`);
