import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { renderCartera050FutureRadar, groupRadarSignalsByPerson } from '../platform/portfolio-intelligence/cartera-050d-future-radar-view.js';
import { cartera050CalendarDate, CARTERA050_BUSINESS_TIMEZONE } from '../platform/portfolio-intelligence/cartera-050-business-calendar-date.js';
import {
  CARTERA_PRIMARY_ATTENTION_OWNER_002B,
  filterCarteraDirectoryMembership002b,
  pendingReviewSignal002b,
  composeCarteraRadarWithPendingReviews002b,
} from '../docs/static-preview/forge-aura/cartera/cartera-live-closure-002b.js';
const read=path=>readFile(new URL(`../${path}`,import.meta.url),'utf8');

test('document review hotfix reuses 020C/010B and requires explicit human action',async()=>{
  const [bridge,module,index,v13]=await Promise.all([read('docs/static-preview/forge-aura/cartera/cartera-review-confirmation-002.js'),read('docs/static-preview/forge-aura/cartera/cartera-module-hotfix002.js'),read('docs/static-preview/forge-aura/index.html'),read('docs/static-preview/forge-aura/cartera/cartera-module-v13-017e.js')]);
  assert.match(bridge,/createCanonicalConfirmationReviewService/);assert.match(bridge,/createPersistentConfirmationOrchestrationService/);assert.match(bridge,/composeCartera020cConfirmedPolicyPlan/);assert.match(bridge,/UPDATE_EXISTING/);assert.match(bridge,/previousPolicyVersionReference/);assert.doesNotMatch(bridge,/CREATE\s+TABLE|create\s+table|new confirmation ledger/i);assert.doesNotMatch(bridge,/\.update\s*\(\s*['"]canonical_policies|raw update/i);
  assert.match(module,/Confirmar información/);assert.match(module,/Corregir/);assert.match(module,/const humanDraft=draft\(\);saving=true/);assert.match(module,/Información confirmada/);assert.match(module,/POLICY_PACKET:AURA:/);
  assert.match(index,/cartera-module-v13-017e\.js\?v=forge-commercial-pilot-evidence-017e-r4/);assert.match(v13,/cartera-module-hotfix002-entry\.js\?v=post017e-hotfix002/);assert.match(v13,/createAuraCarteraFutureRadar017e/);
});

test('confirmed document review suppression addresses the current 020C review by exact packet lineage',async()=>{const adapter=await read('docs/static-preview/forge-aura/cartera/cartera-adapter-pages-v11.js');assert.match(adapter,/packetReference\.startsWith\('POLICY_PACKET:AURA:'\)/);assert.match(adapter,/return `review\/\$\{packetReference\}`/);assert.match(adapter,/states\[index\] !== 'CONFIRMED'/);assert.match(adapter,/fail open: unreadable status never hides evidence/);});

test('Pages closure publishes existing governed review modules instead of copies under docs',async()=>{const closure=await read('scripts/prepare-cartera-review-pages-runtime.mjs');assert.match(closure,/canonical-confirmation-review-service\.js/);assert.match(closure,/persistent-confirmation-orchestration-service\.js/);assert.match(closure,/cartera-020c-governed-command-composer\.js/);assert.match(closure,/collect\(\)/);assert.match(closure,/copyFile/);assert.doesNotMatch(closure,/FORGE_CONFIRMED_POLICY_COMMAND/);});
function signal(overrides={}){return{signalReference:'S:1',personReference:'P:1',personDisplayName:'PERSONA UNO',policyReference:'POLICY:1',signalType:'RELATIONSHIP_REVIEW_DUE',eventDate:'2026-08-13',horizon:'TODAY',truthClass:'OBSERVED',sourceAuthority:'RELATIONSHIP_MEMORY',sourceRecordReference:'REL:1',whyNow:'La revisión está vencida.',evidenceSummary:['Última revisión'],uncertainty:null,smallestUsefulAction:'Revisar relación.',advisorConfirmationRequired:true,...overrides};}
function radar(items){return{items,focusItems:items,summary:{byHorizon:{TODAY:items.length,NEXT_7_DAYS:0,NEXT_30_DAYS:0,NEXT_90_DAYS:0,CONFIRMATION_REQUIRED:0,OVERDUE:0}},sourceAvailability:{policyPayment:'AVAILABLE',relationshipMemory:'AVAILABLE',documentIntake:'AVAILABLE'}};}
test('Radar remains person-centric and hides technical noise behind evidence disclosure',()=>{const a=signal();const b=signal({signalReference:'S:2',signalType:'INCOMPLETE_POLICY_DATA',sourceAuthority:'POLICY_CANONICAL',sourceRecordReference:'POLICY:1'});assert.equal(groupRadarSignalsByPerson([a,b]).length,1);const html=renderCartera050FutureRadar({status:'READY',radar:radar([a,b]),horizon:'ALL'});assert.equal((html.match(/data-radar-person-reference=/g)||[]).length,1);assert.equal((html.match(/data-radar-signal-reference=/g)||[]).length,2);assert.match(html,/2 cosas para revisar/);assert.match(html,/Revisión de relación/);assert.match(html,/Información de póliza por revisar/);assert.match(html,/Ver evidencia/);assert.match(html,/Requiere revisión/);assert.doesNotMatch(html,/>CONFIRMAR</);});
test('Radar exposes Review only for exact packet lineage and preserves 017E signal controls',()=>{const packet=signal({signalReference:'S:PACKET',sourceAuthority:'DOCUMENT_INTAKE',sourceRecordReference:'POLICY_PACKET:AURA:abc',signalType:'INCOMPLETE_POLICY_DATA'});const actionable=signal({signalReference:'S:PAY',signalType:'UNCONFIRMED_PAYMENT_EVIDENCE',truthClass:'RECOMMENDATION',sourceAuthority:'PAYMENT_OBLIGATION',sourceRecordReference:'PAY:1'});const html=renderCartera050FutureRadar({status:'READY',radar:radar([packet,actionable]),horizon:'ALL',actionableSignalReference:'S:PAY',presentationState:'PERSISTED'});assert.match(html,/data-radar-review-packet="POLICY_PACKET:AURA:abc"/);assert.match(html,/data-open-policy="POLICY_PACKET:AURA:abc"/);for(const decision of['ACCEPT','MODIFY','DEFER','DISMISS'])assert.match(html,new RegExp(`data-radar-decision="${decision}" data-radar-signal="S:PAY"`));assert.doesNotMatch(html,/data-radar-decision="ACCEPT" data-radar-signal="S:PACKET"/);});

test('Pipeline-only canonical identity is not Cartera membership and qualified identity is reused once',()=>{
  const pipelineOnly={type:'PERSON',reference:'person:antonio',label:'Antonio Ubaldo',pipelineLinked:true,relationshipPolicyCount:0,relationshipAccountCount:0};
  const qualified={type:'PERSON',reference:'person:adrian',label:'Adrian',pipelineLinked:true,relationshipPolicyCount:1,relationshipAccountCount:0};
  const policy={type:'POLICY',reference:'policy:adrian'};
  const visible=filterCarteraDirectoryMembership002b([pipelineOnly,qualified,policy]);
  assert.equal(visible.some(item=>item.reference==='person:antonio'),false);
  assert.equal(visible.filter(item=>item.reference==='person:adrian').length,1);
  assert.equal(visible.filter(item=>item.reference==='policy:adrian').length,1);
  const progressed=filterCarteraDirectoryMembership002b([{...pipelineOnly,relationshipPolicyCount:1}]);
  assert.deepEqual(progressed.map(item=>item.reference),['person:antonio']);
});

test('pending document packets join the primary Radar with exact lineage and no false deduplication',()=>{
  const model={identityCandidates:[{existingPersonMatches:[{personReference:'person:adrian',displayLabel:'Adrian'}]}],duplicatePolicyCandidates:[{existingPolicyMatches:[{policyReference:'policy:adrian'}]}]};
  const one=pendingReviewSignal002b({review:{packetReference:'POLICY_PACKET:AURA:aaa',confidence:.97,warnings:[]},model,asOfDate:'2026-08-14'});
  const two=pendingReviewSignal002b({review:{packetReference:'POLICY_PACKET:AURA:bbb',confidence:.81,warnings:['x']},model,asOfDate:'2026-08-14'});
  const generic=signal({signalReference:'S:GENERIC',personReference:'person:adrian',personDisplayName:'Adrian',policyReference:'policy:adrian',signalType:'INCOMPLETE_POLICY_DATA',sourceAuthority:'DOCUMENT_INTAKE',sourceRecordReference:'policy:adrian'});
  const composed=composeCarteraRadarWithPendingReviews002b(radar([generic]),[one,two,one]);
  assert.equal(composed.items.filter(item=>item.sourceRecordReference?.startsWith('POLICY_PACKET:AURA:')).length,2);
  assert.equal(composed.items.some(item=>item.signalReference==='S:GENERIC'),false);
  assert.equal(groupRadarSignalsByPerson(composed.focusItems).length,1);
  assert.equal(groupRadarSignalsByPerson(composed.focusItems)[0].signals.length,2);
  const html=renderCartera050FutureRadar({status:'READY',radar:composed,horizon:'ALL'});
  assert.equal((html.match(/data-radar-review-packet=/g)||[]).length,2);
  assert.match(html,/POLICY_PACKET:AURA:aaa/);
  assert.match(html,/POLICY_PACKET:AURA:bbb/);
});

test('002B declares a single primary attention owner and one canonical Aura grid',async()=>{
  const [closure,v13]=await Promise.all([read('docs/static-preview/forge-aura/cartera/cartera-live-closure-002b.js'),read('docs/static-preview/forge-aura/cartera/cartera-module-v13-017e.js')]);
  assert.equal(CARTERA_PRIMARY_ATTENTION_OWNER_002B,'CARTERA_050_FUTURE_RADAR');
  assert.match(v13,/primaryAttentionOwner: CARTERA_PRIMARY_ATTENTION_OWNER_002B/);
  assert.match(closure,/querySelector\('#cartera-attention-title'\)\?\.closest\('\.cartera-panel'\)/);
  assert.match(closure,/grid-template-columns:minmax\(0,1fr\)!important/);
  assert.match(closure,/max-width:none!important/);
  assert.match(closure,/position:static!important/);
  assert.match(closure,/Pólizas con datos incompletos/);
  assert.match(closure,/Pago por confirmar/);
});

test('Mexico City operational date uses IANA timezone rather than UTC calendar date',()=>{
  assert.equal(CARTERA050_BUSINESS_TIMEZONE,'America/Mexico_City');
  assert.equal(cartera050CalendarDate(new Date('2026-08-14T00:30:00Z')), '2026-08-13');
});
