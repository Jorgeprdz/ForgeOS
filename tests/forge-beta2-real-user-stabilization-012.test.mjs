import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';

const root = process.env.FORGE012_ROOT || process.cwd();
const resolve = p => {
  const direct = path.join(root, p);
  if (fs.existsSync(direct)) return direct;
  const docs = path.join(root, 'docs', p);
  if (fs.existsSync(docs)) return docs;
  return direct;
};
const read = p => fs.readFileSync(resolve(p), 'utf8');
const exists = p => fs.existsSync(resolve(p));
const p = {
  migration: 'supabase/migrations/20260810001200_cartera020b_targeted_interactive_claim_012.sql',
  v1: 'static-preview/forge-aura/cartera/cartera-adapter-pages-v1.js',
  v10: 'static-preview/forge-aura/cartera/cartera-adapter-pages-v10.js',
  module: 'static-preview/forge-aura/cartera/cartera-module.js',
  core: 'static-preview/forge-aura/cartera/cartera-core.js',
  pipelineCss: 'static-preview/forge-aura/pipeline/pipeline.css',
  journal: 'static-preview/forge-aura/pipeline/pipeline-journal-aura-011e.js',
  conversation: 'static-preview/forge-aura/pipeline/pipeline-conversation-workspace.js',
  adapterV4: 'static-preview/forge-aura/pipeline/pipeline-adapter-pages-v4.js',
  shell: 'static-preview/forge-aura/aura-shell.js',
  nash: 'nash/pipeline-nash-draft-orchestrator.js',
};

async function loadCore() {
  const source = read(p.core);
  return import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);
}

function nashFixture() {
  return {
    id: 'prospect-012', fullName: 'Ana Demo', source: 'Referido', status: 'contacted',
    phone: '+525500000001', whatsapp: '+525500000001',
    initialContext: 'raw context must not be provider truth',
    createdAt: '2026-08-01T12:00:00.000Z', updatedAt: '2026-08-10T12:00:00.000Z',
  };
}
function successEnvelope() {
  return {
    resultState:'SUCCESS', draftCandidate:{text:'Mensaje seguro',rawText:'Mensaje seguro',reviewRequired:true,humanApprovalRequired:true,approved:false,sent:false,sendsMessage:false,notSendable:true,sourceMutable:false,providerId:'gemini'},
    metadata:{providerId:'gemini',modelId:'fixture',generationMode:'fixture',generatedAt:'2026-08-10T18:00:00.000Z'}, error:null,
    persistencePerformed:false,pipelineMutationPerformed:false,timelineEventCreated:false,nbaExecuted:false,taskCreated:false,calendarEventCreated:false,whatsappOpened:false,messageSent:false,externalActionPerformed:false,humanApprovalRequired:true,approved:false,sent:false,
  };
}
function loadNash() {
  const require = createRequire(import.meta.url);
  return require(path.join(root, p.nash));
}

// BUG 01 — CARTERA PDF
test('01A exact claim overload is owner-scoped to the requested inboxReference', () => {
  const sql = read(p.migration);
  assert.match(sql, /i\.advisor_id = actor_id\s+and i\.inbox_reference = p_inbox_reference/);
  assert.match(sql, /CLAIM_EVIDENCE_EXACT/);
  assert.doesNotMatch(sql, /order by\s+case when i\.worker_state/);
});
test('01B interactive upload passes exact inboxReference and a document-scoped worker id', () => {
  const source = read(p.v1);
  assert.match(source, /AURA_CARTERA:\$\{user\.id\}:\$\{digest\.slice\(0,24\)\}/);
  assert.match(source, /p_inbox_reference:admitted\.inboxReference/);
});
test('01C extractor failure settles through existing processing-result authority before rethrow', () => {
  const source = read(p.v1);
  assert.match(source, /settlePdfFailure/);
  assert.match(source, /workerState:'RETRY_WAIT'/);
  assert.match(source, /forge_cartera020b_record_processing_result/);
  assert.match(source, /catch\(error\)\{await settlePdfFailure[\s\S]*throw error;\}/);
});

// BUG 02 — WhatsApp layout
test('02A actions container wraps rather than overflowing into decision context', () => {
  const css = read(p.pipelineCss);
  const block = css.match(/\.aura-actions \{[\s\S]*?\n\}/)?.[0] || '';
  assert.match(block, /flex-wrap:\s*wrap/);
  assert.match(block, /min-width:\s*0/);
});
test('02B journal action is a compact control compatible with fixed action geometry', () => {
  const source = read(p.journal);
  assert.match(source, /button\.textContent = '▤'/);
  assert.match(source, /button\.title = 'Bitácora'/);
  assert.doesNotMatch(source, /button\.textContent = 'Bitácora'/);
});
test('02C medium desktop/tablet layout removes the 1160px row floor', () => {
  const css = read(p.pipelineCss);
  const media = css.slice(css.indexOf('@media (max-width: 1180px)'));
  assert.match(media, /\.aura-prospect-row \{\s*min-width:\s*0/);
  assert.match(media, /grid-template-columns:\s*repeat\(2,minmax\(0,1fr\)\)|grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\)/);
});

// BUG 03 — Conversation import graph
test('03A conversation adapter uses source-aware Pages root calculation', () => {
  const source = read(p.adapterV4);
  assert.match(source, /sourceLayout = import\.meta\.url\.includes\('\/docs\/static-preview\/'\)/);
  assert.match(source, /sourceLayout \? '\.\.\/\.\.\/\.\.\/\.\.\/' : '\.\.\/\.\.\/\.\.\/'/);
});
test('03B production URL resolves governed prospect context under /ForgeOS/', () => {
  const moduleUrl = 'https://jorgeprdz.github.io/ForgeOS/static-preview/forge-aura/pipeline/pipeline-adapter-pages-v4.js';
  const rootUrl = new URL('../../../', moduleUrl);
  const resolved = new URL('advisor-os/sales-pipeline/prospect-context/universal-governed-prospect-context-contract.js', rootUrl);
  assert.equal(resolved.pathname, '/ForgeOS/advisor-os/sales-pipeline/prospect-context/universal-governed-prospect-context-contract.js');
});
test('03C deployed artifact contains the shared prospect-context authority at the resolved path', () => {
  assert.equal(exists('advisor-os/sales-pipeline/prospect-context/universal-governed-prospect-context-contract.js'), true);
});

// BUG 04 — duplicate error
test('04A contextual conversation notice owns presentation and suppresses duplicate global toast', () => {
  const source = read(p.conversation);
  assert.match(source, /if \(!node && message\) globalState\?\./);
});
test('04B main generation error is human-safe instead of raw dynamic-import path', () => {
  const source = read(p.conversation);
  assert.match(source, /safeConversationError\(error, 'No pudimos preparar la sugerencia\. Reintenta sin cerrar este espacio\.'\)/);
  assert.doesNotMatch(source, /No pudimos preparar la sugerencia: \$\{text\(error/);
});
test('04C technical error code remains inspectable without becoming primary copy', () => {
  const source = read(p.conversation);
  assert.match(source, /notice\.dataset\.errorCode = code/);
  assert.match(source, /console\.error\('AURA_CONVERSATION_DRAFT_FAILED', code\)/);
});

// BUG 05 — NASH shared dependency
test('05A NASH uses the same governed root and does not install a local prospect-context copy', () => {
  const source = read(p.adapterV4);
  assert.match(source, /nash\/pipeline-nash-draft-orchestrator\.js/);
  assert.equal(exists('static-preview/forge-aura/pipeline/universal-governed-prospect-context-contract.js'), false);
});
test('05B production NASH orchestrator URL resolves beneath /ForgeOS/', () => {
  const rootUrl = new URL('../../../', 'https://jorgeprdz.github.io/ForgeOS/static-preview/forge-aura/pipeline/pipeline-adapter-pages-v4.js');
  assert.equal(new URL('nash/pipeline-nash-draft-orchestrator.js', rootUrl).pathname, '/ForgeOS/nash/pipeline-nash-draft-orchestrator.js');
});
test('05C deployed artifact contains all shared NASH authorities referenced by adapter', () => {
  for (const file of ['nash/pipeline-nash-draft-orchestrator.js','nash-combat-intelligence-report-engine.js','nash/draft-intake/nfast06-draft-safety-boundary.js']) assert.equal(exists(file), true, file);
});

// BUG 06 — message objectives/components
test('06A Conversation Workspace exposes Cobranza, Firma de solicitud and Otro / Personalizado', () => {
  const source = read(p.adapterV4);
  assert.match(source, /collection: 'Cobranza'/);
  assert.match(source, /application_signature: 'Firma de solicitud'/);
  assert.match(source, /custom: 'Otro \/ Personalizado'/);
  assert.match(read(p.conversation), /data-message-components/);
});
test('06B existing NASH orchestrator accepts collection as a governed follow-up objective', async () => {
  const { createPipelineNashDraftOrchestrator } = loadNash();
  let body;
  const orch = createPipelineNashDraftOrchestrator({ now:()=>new Date('2026-08-10T18:00:00Z'), invokeFunction:async(_n,o)=>{body=o.body;return{data:successEnvelope(),error:null};} });
  const result = await orch.requestDraft({pipelineRecord:nashFixture(),goal:'collection',approvedDisplayName:true});
  assert.equal(result.status,'SUCCESS');
  assert.equal(body.conversationBrief.strategy.strategyCategory,'FOLLOW_UP');
  assert.match(body.conversationBrief.conversationObjective.objectiveStatement,/governed payment facts/i);
});
test('06C custom advisor components enter sequencing guidance as instruction-only context', async () => {
  const { createPipelineNashDraftOrchestrator } = loadNash();
  let body;
  const orch = createPipelineNashDraftOrchestrator({ now:()=>new Date('2026-08-10T18:00:00Z'), invokeFunction:async(_n,o)=>{body=o.body;return{data:successEnvelope(),error:null};} });
  const result=await orch.requestDraft({pipelineRecord:nashFixture(),goal:'custom',advisorComponents:['pedir comprobante','recordar fecha límite'],approvedDisplayName:true});
  assert.equal(result.status,'SUCCESS');
  const serialized=JSON.stringify(body.conversationBrief);
  assert.match(serialized,/instruction only; not source truth/);
  assert.match(serialized,/pedir comprobante/);
  assert.doesNotMatch(serialized,/raw context must not be provider truth/);
});

// BUG 07 — next event
test('07A Cartera core no longer fabricates generic “Próximo evento / Evento de cartera” copy', () => {
  const source = read(p.core);
  assert.doesNotMatch(source, /title:'Próximo evento'/);
  assert.doesNotMatch(source, /'Evento de cartera'/);
});
test('07B expected payment radar renders WHAT/WHEN/WHY/ACTION from authoritative projection', async () => {
  const core=await loadCore();
  const [item]=core.deriveAttention({radar:{items:[{signalType:'EXPECTED_PAYMENT',eventDate:'2026-08-23',whyNow:'La obligación está dentro del horizonte operativo.',smallestUsefulAction:'Revisar la fecha con la póliza abierta.',uncertainty:'No confirma que el pago ocurrirá.',policyReference:'POL:1'}]}});
  assert.equal(item.title,'Próximo cobro');
  assert.notEqual(item.subject,'—');
  assert.match(item.reason,/horizonte/);
  assert.match(item.meaning,/Acción: Revisar la fecha/);
});
test('07C insufficient radar evidence is omitted instead of upgraded to a confirmed event', async () => {
  const core=await loadCore();
  assert.deepEqual(core.deriveAttention({radar:{items:[{signalType:'EXPECTED_PAYMENT',eventDate:null,whyNow:'x',smallestUsefulAction:'y'}]}}),[]);
});

// BUG 08 — incomplete information
test('08A incomplete policy names missing policy status explicitly', async () => {
  const core=await loadCore();
  const item=core.policyCompletenessAttention({policy_number:'VI1234',completeness_state:'INCOMPLETE',status_value:'UNKNOWN'});
  assert.equal(item.title,'Falta confirmar estado de la póliza');
});
test('08B payment-frequency gap is kept separate from payment/cobranza state', async () => {
  const core=await loadCore();
  const item=core.policyCompletenessAttention({policy_number:'VI1234',completeness_state:'INCOMPLETE',status_value:'ACTIVE',effective_from:'2026-01-01',effective_to:'2036-01-01',currency:'MXN'});
  assert.equal(item.title,'Forma de pago no identificada');
  assert.match(item.reason,/no significa que exista un pago pendiente/);
});
test('08C canonical date gap is concrete and generic “Información incompleta” is gone', async () => {
  const core=await loadCore();
  const item=core.policyCompletenessAttention({policy_number:'VI1234',completeness_state:'INCOMPLETE',status_value:'ACTIVE',payment_frequency:'MONTHLY',currency:'MXN'});
  assert.equal(item.title,'Fecha de inicio de vigencia no disponible');
  assert.notEqual(item.title,'Información incompleta');
});

// BUG 09 — opening policy lifecycle
test('09A openPolicy has bounded timeout and deterministic finally cleanup', () => {
  const source=read(p.module);
  assert.match(source,/CARTERA_POLICY_OPEN_TIMEOUT/);
  assert.match(source,/openPolicy[\s\S]*finally\{if\(active\(token\)\)announce\(''\);\}/);
});
test('09B back and scrub explicitly clear stale operational state', () => {
  const source=read(p.module);
  assert.match(source,/data-back[\s\S]*revision\+=1;announce\(''\)/);
  assert.match(source,/function scrub\(\)\{revision\+=1;announce\(''\)/);
});
test('09C Aura shell empty message is the canonical dismiss operation', () => {
  const shell=read(p.shell);
  assert.match(shell,/node\.hidden = !message/);
  assert.match(shell,/node\.textContent = message \|\| ""/);
});

// BUG 10 — relation navigation
test('10A openPerson is bounded and settles “Abriendo relación…”', () => {
  const source=read(p.module);
  assert.match(source,/CARTERA_RELATION_OPEN_TIMEOUT/);
  assert.match(source,/openPerson[\s\S]*finally\{if\(active\(token\)\)announce\(''\);\}/);
});
test('10B Relación tab has a real target and click handler', () => {
  const source=read(p.module);
  assert.match(source,/data-person-tab="relationship"/);
  assert.match(source,/data-person-section="relationship"/);
  assert.match(source,/querySelectorAll\('\[data-person-tab\]'\).*addEventListener\('click'/);
});
test('10C relationship policy-role reads are parallelized in both inherited paths', () => {
  assert.match(read(p.v1),/Promise\.all\(policies\.map\(async policy/);
  assert.match(read(p.v10),/Promise\.all\(policies\.map\(async policy/);
  assert.doesNotMatch(read(p.v10),/for \(const policy of policies\)/);
});

// BUG 11 — journal read/write independence
test('11A initial Bitácora read failure renders warning but still builds the write form', () => {
  const source=read(p.journal);
  assert.match(source,/const entries = entriesResult\.ok \? \(entriesResult\.value \|\| \[\]\) : \[\]/);
  assert.match(source,/el fallo de lectura no bloquea la captura/);
  assert.match(source,/<form data-aura-journal-form>/);
});
test('11B successful append plus failed refresh is a confirmed-write/degraded-read state, not write failure', () => {
  const source=read(p.journal);
  assert.match(source,/WRITE_CONFIRMED_READ_DEGRADED/);
  assert.doesNotMatch(source,/throw Object\.assign\(new Error\('PROSPECT_JOURNAL_REFRESH_FAILED'/);
});
test('11C retry targets history read only and write failure preserves textarea content', () => {
  const source=read(p.journal);
  assert.match(source,/data-aura-journal-history-retry/);
  assert.match(source,/El historial sigue sin responder\. Tu formulario y cualquier texto escrito permanecen disponibles/);
  const writeCatch=source.slice(source.indexOf("console.error('AURA_JOURNAL_WRITE_011E_FAILED")-500,source.indexOf("console.error('AURA_JOURNAL_WRITE_011E_FAILED")+200);
  assert.doesNotMatch(writeCatch,/textarea\.value = ''/);
});
