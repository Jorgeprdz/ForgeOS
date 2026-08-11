import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const read = path => readFile(new URL(path, root), 'utf8');

const [
  pipeline014,
  workspaceBase,
  workspace013,
  pipelineAdapterV4,
  legacyWhatsapp,
  materialPipeline,
  materialAdapter,
  stageFilterAuthority,
  orchestrator,
  providerBoundary,
  carteraV13,
  carteraV12,
  carteraV11,
  carteraV10,
  carteraModuleV5,
  crs03,
  crs10Adapter,
  identityAcceptance,
  identityEvidence,
  humanGate,
  auraIndex,
] = await Promise.all([
  read('docs/static-preview/forge-aura/recomposition/pipeline-consumer-bridge-014.js'),
  read('docs/static-preview/forge-aura/pipeline/pipeline-conversation-workspace.js'),
  read('docs/static-preview/forge-aura/pipeline/pipeline-conversation-workspace-013.js'),
  read('docs/static-preview/forge-aura/pipeline/pipeline-adapter-pages-v4.js'),
  read('docs/static-preview/forge-alive-material3/whatsapp-ai-composer.js'),
  read('docs/static-preview/forge-alive-material3/pipeline-module.js'),
  read('docs/static-preview/forge-alive-material3/pipeline-productive-intelligence-adapter.js'),
  read('docs/static-preview/forge-alive-material3/pipeline-stage-filter-authority.js'),
  read('nash/pipeline-nash-draft-orchestrator.js'),
  read('nash/remote-draft-provider-client-boundary.js'),
  read('docs/static-preview/forge-aura/cartera/cartera-adapter-pages-v13.js'),
  read('docs/static-preview/forge-aura/cartera/cartera-adapter-pages-v12.js'),
  read('docs/static-preview/forge-aura/cartera/cartera-adapter-pages-v11.js'),
  read('docs/static-preview/forge-aura/cartera/cartera-adapter-pages-v10.js'),
  read('docs/static-preview/forge-aura/cartera/cartera-module-v5.js'),
  read('advisor-os/sales-pipeline/crs-03-pipeline-person-convergence-service.js'),
  read('docs/static-preview/forge-aura/pipeline/pipeline-crs10-context-adapter-013.js'),
  read('tests/cartera-pipeline-identity-productive-005b.test.mjs'),
  read('docs/evidence/FORGE_CARTERA_PIPELINE_IDENTITY_005B_R1_REMOTE_EVIDENCE.md'),
  read('docs/static-preview/forge-aura/recomposition/human-language-gate-014.js'),
  read('docs/static-preview/forge-aura/index.html'),
]);

// ---------------------------------------------------------------------------
// BUG-07 — PREPARAR MENSAJE must be a commercial workflow, not a prompt builder.
// ---------------------------------------------------------------------------

test('BUG07 presentation exposes the requested five-step commercial flow', () => {
  for (const label of ['Contexto Forge', 'Objetivo', 'Mensaje preparado', 'Ajuste humano', 'WhatsApp']) {
    assert.ok(pipeline014.includes(label), label);
  }
  assert.match(pipeline014, /FORGE_AURA_MESSAGE_FLOW_014B/);
  assert.match(pipeline014, /data\.conversationFlowState014/);
});

test('BUG07 primary objective stays governed while chips and tone move out of the main hierarchy', () => {
  assert.match(pipeline014, /select\[data-message-goal\]/);
  assert.match(pipeline014, /realUserHidden014/);
  assert.match(pipeline014, /Ajustes opcionales/);
  assert.match(pipeline014, /data-message-adjustments-014/);
  assert.match(pipeline014, /¿Qué necesitas lograr con este mensaje\?/);
});

test('BUG07 complete human workflow preserves draft editing exact approval and manual WhatsApp', () => {
  assert.match(workspaceBase, /state\.adapter\.prepareMessage/);
  assert.match(workspaceBase, /data-draft/);
  assert.match(workspaceBase, /invalidateApproval\(state, 'El texto cambió/);
  assert.match(workspaceBase, /state\.adapter\.approveExactDraft/);
  assert.match(workspaceBase, /if \(!state\.approval\?\.approved \|\| !state\.approval\.whatsappUrl\) return/);
  assert.match(workspaceBase, /windowRef\.open\(state\.approval\.whatsappUrl/);
  assert.match(workspaceBase, /Forge no marcó el mensaje como enviado/);
  for (const label of ['Primer contacto', 'Seguimiento', 'Retomar conversación', 'Cobranza', 'Firma de solicitud', 'Confirmar cita', 'Reprogramar', 'Después de llamada', 'Otro / Personalizado']) {
    assert.ok(pipelineAdapterV4.includes(label), label);
  }
});

// ---------------------------------------------------------------------------
// BUG-08 — FORGE THINKS, AI WRITES. No raw Pipeline -> LLM authority path.
// ---------------------------------------------------------------------------

test('BUG08 legacy WhatsApp composer is compatibility-only and cannot intercept the productive action', () => {
  assert.match(stageFilterAuthority, /whatsapp-ai-composer\.js/);
  assert.match(legacyWhatsapp, /retired:\s*true/);
  assert.match(legacyWhatsapp, /installsClickInterceptor:\s*false/);
  assert.match(legacyWhatsapp, /rawPipelineForwardedToProvider:\s*false/);
  assert.doesNotMatch(legacyWhatsapp, /whatsapp-draft|FUNCTION_URL|fetch\s*\(|stopImmediatePropagation\s*\(/);
  assert.doesNotMatch(legacyWhatsapp, /addEventListener\s*\(\s*["']click["']/);
});

test('BUG08 productive Material3 action now falls through to the governed NASH workspace', () => {
  assert.match(materialPipeline, /data-prepare-productive-message/);
  assert.match(materialPipeline, /openNashWorkspace\(\{ card, adapter: productiveAdapter, trigger \}\)/);
  assert.match(materialPipeline, /ForgeDraftSafetyBoundaryNFAST06/);
  assert.match(materialPipeline, /exactDraftHumanApprovalGate/);
  assert.match(materialPipeline, /whatsappUrl/);
  assert.match(materialPipeline, /Continuar manualmente a WhatsApp/);
  assert.match(materialAdapter, /ForgePipelineNashDraftOrchestrator/);
  assert.match(materialAdapter, /conversationBriefProduced/);
  assert.match(materialAdapter, /humanApprovalRequired:\s*true/);
  assert.match(materialAdapter, /automaticSendPerformed:\s*false/);
});

test('BUG08 provider boundary accepts only a deterministic Conversation Brief and survives without LLM authority', () => {
  assert.match(orchestrator, /buildPipelineUniversalProspectContext/);
  assert.match(orchestrator, /buildDeterministicBrief/);
  assert.match(orchestrator, /conversationBrief,/);
  assert.match(orchestrator, /rawPipelineForwardedToProvider:\s*false/);
  assert.match(orchestrator, /rawUniversalContextForwardedToProvider:\s*false/);
  assert.match(providerBoundary, /prospectMessageContext !== undefined \|\| Object\.keys\(unsupported\)\.length > 0/);
  assert.match(providerBoundary, /accepts only deterministic conversation brief requests/);
  assert.match(providerBoundary, /selectedProvider === DEFAULT_PROVIDER/);
  assert.match(providerBoundary, /local_deterministic_flow_required/);
  assert.match(pipelineAdapterV4, /ForgeDeterministicDraftRendererNFAST06/);
  assert.match(pipelineAdapterV4, /DETERMINISTIC_FALLBACK/);
});

// ---------------------------------------------------------------------------
// BUG-10 — Pipeline/Cartera convergence uses CRS-03 + explicit human identity.
// ---------------------------------------------------------------------------

test('BUG10 current Cartera v13 chain still reaches the explicit Pipeline-person convergence authority in v10', () => {
  assert.match(carteraV13, /cartera-adapter-pages-v12\.js/);
  assert.match(carteraV12, /cartera-adapter-pages-v11\.js/);
  assert.match(carteraV11, /cartera-adapter-pages-v10\.js/);
  assert.match(carteraV10, /pipelinePersonExplicitConvergence015:\s*true/);
  assert.match(carteraV10, /PIPELINE_PREFIX = 'pipeline-prospect:'/);
});

test('BUG10 unresolved Prospect is presented for explicit human linking and directory reads cannot mutate identity', () => {
  const directoryBlock = carteraV10.slice(
    carteraV10.indexOf('async function loadPipelinePeople'),
    carteraV10.indexOf('async function ownedProspect'),
  );
  assert.match(directoryBlock, /Pipeline · requiere vinculación explícita/);
  assert.match(directoryBlock, /reference:\s*`\$\{PIPELINE_PREFIX\}\$\{id\}`/);
  assert.doesNotMatch(directoryBlock, /client\.rpc\(IDENTITY_RPC/);
  assert.match(carteraModuleV5, /Vincular persona existente/);
  assert.match(carteraModuleV5, /Crear persona nueva/);
  assert.match(carteraModuleV5, /personMode === 'existing' && Boolean\(existing\)/);
});

test('BUG10 human selection is the convergence trigger; linked identity is the only path to shared Relationship Intelligence', () => {
  assert.match(carteraV10, /pipelineProspectReference\(input\.existingPersonReference\)/);
  assert.match(carteraV10, /resolvePipelineProspect\(client, review, prospectReference\)/);
  assert.match(carteraV10, /forge_cartera010b_confirm_identity_resolution/);
  assert.match(crs03, /automaticIdentityResolution:\s*false/);
  assert.match(crs03, /identityMutation:\s*false/);
  assert.match(crs10Adapter, /base\.identityState !== 'LINKED' \|\| !base\.personReference/);
  assert.match(crs10Adapter, /relationshipIntelligence:\s*null/);
  assert.match(crs10Adapter, /existingCarteraIntelligenceReused:\s*true/);
  assert.match(crs10Adapter, /secondRelationshipEngine:\s*false/);
});

test('BUG10 productive PA01-PA07 evidence proves no auto-link for ambiguous same-name/email/phone identities', () => {
  assert.match(identityAcceptance, /PA07_AMBIGUOUS_PROSPECT_AUTO_LINKED_BEFORE_SELECTION/);
  assert.match(identityAcceptance, /PA07_SAME_NAME_EMAIL_PHONE_AUTO_LINK/);
  for (let index = 1; index <= 7; index += 1) {
    assert.match(identityEvidence, new RegExp(`PA0${index}=PASS`));
  }
  assert.match(identityEvidence, /RLS_ISOLATION=PASS/);
  assert.match(identityEvidence, /READ_AFTER_WRITE=PASS/);
  assert.match(identityEvidence, /IDENTITY_BOUNDARY=PASS/);
  assert.match(identityEvidence, /REAL_DATA_TOUCHED=NO/);
});

// ---------------------------------------------------------------------------
// BUG-11 — Human Language Gate must be active globally, not manually callable.
// ---------------------------------------------------------------------------

test('BUG11 productive Aura shell loads an active human-language auditor', () => {
  assert.match(auraIndex, /human-language-gate-014\.js/);
  assert.match(humanGate, /ACTIVE_AUDITOR_ID/);
  assert.match(humanGate, /new Observer\(scheduleActiveAudit\)/);
  assert.match(humanGate, /observer\.observe\(root/);
  assert.match(humanGate, /if \(document\.body\) start\(document\.body\)/);
  assert.match(humanGate, /forge:human-language-gate-014/);
});

test('BUG11 auditor covers dynamic visibility changes without rewriting technical code', () => {
  assert.match(humanGate, /attributeFilter:\s*\['hidden', 'aria-hidden', 'class', 'style'\]/);
  assert.match(humanGate, /createTreeWalker/);
  assert.match(humanGate, /isRendered/);
  assert.match(humanGate, /INTERNAL_SELECTOR/);
  assert.match(humanGate, /data-internal-only-014/);
  assert.match(humanGate, /aura-conversation__technical/);
  assert.doesNotMatch(humanGate, /replaceAll\(|innerHTML\s*=.*FORBIDDEN/);
});

test('BUG11 forbidden vocabulary includes the prompt global architecture leak classes', () => {
  for (const token of [
    'source-owner', 'source owner', 'Policy Intelligence', 'Relationship Intelligence',
    'relationship memory', 'memoria relacional', 'brief relacional', 'adapter', 'runtime',
    'namespace', 'stage changed', 'EVIDENCE_VERSION', 'CANONICAL_SOURCE_LIMIT',
    'HISTORY_LIMIT', 'ledger', 'read model', 'write model', 'projection', 'payload',
    'RLS', 'CommercialPerson', 'LLM', 'GENERATED_YTD', 'EXPECTED', 'SCENARIO', 'EARNED',
  ]) {
    assert.ok(humanGate.includes(token), token);
  }
});
