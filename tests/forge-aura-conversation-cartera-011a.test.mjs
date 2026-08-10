import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read=path=>fs.readFileSync(path,'utf8');

const app=read('docs/static-preview/forge-aura/app-v4.js');
const pipelineModule=read('docs/static-preview/forge-aura/pipeline/pipeline-module-v2.js');
const pipelineAdapter=read('docs/static-preview/forge-aura/pipeline/pipeline-adapter-pages-v4.js');
const pipelineSafetyAdapter=read('docs/static-preview/forge-aura/pipeline/pipeline-adapter-pages-v5.js');
const workspace=read('docs/static-preview/forge-aura/pipeline/pipeline-conversation-workspace.js');
const carteraAdapter=read('docs/static-preview/forge-aura/cartera/cartera-adapter-pages-v13.js');
const carteraModule=read('docs/static-preview/forge-aura/cartera/cartera-module-v8.js');
const carteraCss=read('docs/static-preview/forge-aura/cartera/cartera-relational-011a.css');
const pages=read('.github/workflows/pages.yml');
const provider=read('supabase/functions/nash-draft-provider/gemini-provider.mjs');

test('011A runtime cutover points Aura to bounded relational and conversation modules',()=>{
  assert.match(app,/pipeline-module-v2\.js\?v=forge-aura-conversation-workspace-011a/);
  assert.match(app,/cartera-module-v8\.js\?v=forge-aura-conversation-cartera-011a/);
  assert.match(app,/pipeline-conversation-workspace\.css/);
  assert.match(app,/cartera-relational-011a\.css/);
});

test('011A removes direct WhatsApp bypass from the active Pipeline binding',()=>{
  assert.match(pipelineModule,/addEventListener\('click',\s*interceptWhatsapp,\s*true\)/);
  assert.match(pipelineModule,/stopImmediatePropagation\(\)/);
  assert.match(pipelineModule,/workspace\.open\(\{\s*card,\s*adapter,\s*trigger\s*\}\)/);
  assert.doesNotMatch(pipelineModule,/windowRef\.open\(/);
  assert.doesNotMatch(pipelineModule,/adapter\.whatsappUrl\(record\)/);
});

test('011A provider path preserves Conversation Brief only and no raw objection forwarding',()=>{
  assert.match(pipelineAdapter,/ForgePipelineNashDraftOrchestrator/);
  assert.match(pipelineAdapter,/ForgeNashDeterministicConversationBriefContract/);
  assert.match(pipelineAdapter,/ForgeNashProviderRequestContract/);
  assert.match(pipelineAdapter,/conversationBrief,/);
  assert.match(pipelineAdapter,/rawPipelineForwardedToProvider: false/);
  assert.match(pipelineAdapter,/rawObjectionForwardedToProvider: false/);
  assert.match(provider,/buildConversationBriefRendererPrompt/);
  assert.match(provider,/Use only the DATA lines supplied below/);
});

test('011A Combat never consumes the legacy objection killer response as final copy',()=>{
  assert.match(pipelineAdapter,/buildCombatIntelligenceReport/);
  assert.match(pipelineAdapter,/hardcodedFinalResponseUsed: false/);
  assert.doesNotMatch(pipelineAdapter,/objectionKillerMessage/);
  assert.match(pipelineAdapter,/buildObjectionAwareBrief/);
  assert.match(pipelineAdapter,/candidateInterpretations/);
  assert.match(pipelineAdapter,/objectionsToAcknowledge/);
  assert.match(workspace,/NASH Combat/);
  assert.match(workspace,/no se usa ninguna respuesta final hardcodeada/i);
});

test('011A exact approval is the only path that exposes manual WhatsApp navigation',()=>{
  assert.match(pipelineAdapter,/draftSafetyValidator/);
  assert.match(pipelineAdapter,/approveExactDraft/);
  assert.match(pipelineAdapter,/exactDraftHumanApprovalGate/);
  assert.match(pipelineSafetyAdapter,/decision === 'BLOCK_WHATSAPP'/);
  assert.match(workspace,/data-open-whatsapp disabled/);
  assert.match(workspace,/invalidateApproval/);
  assert.match(workspace,/windowRef\.open\(state\.approval\.whatsappUrl/);
  assert.match(workspace,/Forge no marcó el mensaje como enviado/);
});

test('011A objection Timeline persistence stores classification only after human review',()=>{
  assert.match(pipelineAdapter,/combat\?\.reviewed !== true/);
  assert.match(pipelineAdapter,/eventType: 'OBJECTION_RECORDED'/);
  assert.match(pipelineAdapter,/objectionCode:/);
  assert.match(pipelineAdapter,/resolutionStatus: 'OPEN'/);
  assert.doesNotMatch(pipelineAdapter,/payload:\s*\{[^}]*objection:/s);
  assert.match(workspace,/data-register-combat disabled/);
});

test('011A Cartera composes canonical relationships without identity merge or name matching',()=>{
  assert.match(carteraAdapter,/forge_cartera010b_list_general_policy_roles/);
  assert.match(carteraAdapter,/participant_person_id/);
  assert.match(carteraAdapter,/verification_state/);
  assert.match(carteraAdapter,/CONFIRMED/);
  assert.match(carteraAdapter,/claims\.productName/);
  assert.match(carteraAdapter,/Producto no identificado/);
  assert.match(carteraAdapter,/autoIdentityMerge: false/);
  assert.doesNotMatch(carteraAdapter,/product:imagina-ser-65-15-pagos-udi/);
  assert.doesNotMatch(carteraAdapter,/normalizedName\(/);
  assert.match(carteraModule,/data-directory-kind="PERSON"/);
  assert.match(carteraModule,/cartera-related-entities/);
});

test('011A Cartera row resets native button geometry instead of leaving black browser borders',()=>{
  assert.match(carteraCss,/\.cartera-directory-row\{[^}]*border:1px solid/s);
  assert.match(carteraCss,/appearance:none/);
  assert.match(carteraCss,/@media\(max-width:640px\)/);
});

test('011A Pages artifact already publishes required conversation authorities without workflow mutation',()=>{
  for(const asset of [
    'nash-intent-engine.js',
    'nash-combat-orchestrator.js',
    'nash-next-best-action-engine.js',
    'nash-combat-intelligence-report-engine.js',
    'nash/context-intake/nash-prospect-context-intake.js',
    'nash/conversation-brief/nash-deterministic-conversation-brief-boundary-contract.js',
    'nash/conversation-brief/nash-provider-request-contract.js',
    'nash/remote-draft-provider-client-boundary.js',
    'nash/pipeline-nash-draft-orchestrator.js',
    'nash/draft-intake/nfast06-draft-safety-boundary.js',
    'nash/draft-intake/nfast06-deterministic-draft-renderer.js',
  ]) assert.ok(pages.includes(`'${asset}'`),`Pages allowlist missing ${asset}`);
  assert.match(pages,/if \(file\.startsWith\('advisor-os\/sales-pipeline\/'\)\)/);
});
