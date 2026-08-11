import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const {
  createPipelineNashDraftOrchestrator,
  GOAL_CONFIG,
} = require('../nash/pipeline-nash-draft-orchestrator.js');

const NOW = '2026-08-10T21:35:00.000Z';
const CRITICAL_GOALS = ['collection', 'application_signature', 'custom'];

function pipelineRecord() {
  return {
    id: 'forge-013-intent-prospect',
    fullName: 'Prospecto Sintético',
    source: 'FORGE_013_TEST',
    status: 'contacted',
    phone: '+000000000013',
    initialContext: 'raw context must not reach provider',
    createdAt: NOW,
    updatedAt: NOW,
  };
}

function sourceOwnerFor(fieldId) {
  if (fieldId === 'appointment.verified_reference') return 'APPOINTMENT_AUTHORITY';
  if (fieldId === 'interaction.verified_reference') return 'PIPELINE';
  throw new Error(`FORGE_013_UNEXPECTED_GOVERNED_FIELD:${fieldId}`);
}

function governedReference(fieldId) {
  const sourceOwner = sourceOwnerFor(fieldId);
  return {
    fieldId,
    value: `FORGE_013:${fieldId}`,
    sourceOwner,
    sourceRecordReference: `FORGE_013:${fieldId}`,
    evidence: {
      evidenceId: `FORGE_013:EVIDENCE:${fieldId}`,
      sourceOwner,
      sourceRecordReference: `FORGE_013:${fieldId}`,
      observedAt: NOW,
    },
    verificationStatus: 'VERIFIED',
    freshness: { status: 'CURRENT', observedAt: NOW },
    sensitivityClassification: 'AUTHORITY_REFERENCE',
  };
}

function referencesFor(config) {
  return config.requiredGovernedField
    ? [governedReference(config.requiredGovernedField)]
    : [];
}

function successEnvelope(goal, statement) {
  const draft = `Sugerencia sintética para ${goal}: ${statement}`;
  return {
    resultState: 'SUCCESS',
    draftCandidate: {
      text: draft,
      rawText: draft,
      reviewRequired: true,
      humanApprovalRequired: true,
      approved: false,
      sent: false,
      sendsMessage: false,
      notSendable: true,
      sourceMutable: false,
      providerId: 'gemini',
    },
    metadata: {
      providerId: 'gemini',
      modelId: 'forge-013-fixture',
      generationMode: 'fixture',
      generatedAt: NOW,
    },
    error: null,
    persistencePerformed: false,
    pipelineMutationPerformed: false,
    timelineEventCreated: false,
    nbaExecuted: false,
    taskCreated: false,
    calendarEventCreated: false,
    whatsappOpened: false,
    messageSent: false,
    externalActionPerformed: false,
    humanApprovalRequired: true,
    approved: false,
    sent: false,
  };
}

test('RU01/RU02 Level 1: the governed intent registry is non-empty and critical intents are first-class', () => {
  const goals = Object.keys(GOAL_CONFIG);
  assert.ok(goals.length >= 9);
  for (const goal of CRITICAL_GOALS) assert.ok(GOAL_CONFIG[goal], `${goal}_MUST_BE_GOVERNED`);
  assert.notEqual(GOAL_CONFIG.collection.statement, GOAL_CONFIG.application_signature.statement);
  assert.notEqual(GOAL_CONFIG.collection.statement, GOAL_CONFIG.custom.statement);
  assert.notEqual(GOAL_CONFIG.application_signature.statement, GOAL_CONFIG.custom.statement);
});

test('RU02 Level 2: every governed goal becomes the NASH objective consumed by the provider request', async () => {
  const seen = new Map();
  const orchestrator = createPipelineNashDraftOrchestrator({
    now: () => NOW,
    invokeFunction: async (_name, options) => {
      const brief = options.body.conversationBrief;
      const goal = Object.entries(GOAL_CONFIG).find(([, config]) =>
        config.statement === brief.conversationObjective.objectiveStatement
      )?.[0];
      seen.set(goal, brief.conversationObjective);
      return {
        data: successEnvelope(goal, brief.conversationObjective.objectiveStatement),
        error: null,
      };
    },
  });

  for (const [goal, config] of Object.entries(GOAL_CONFIG)) {
    const result = await orchestrator.requestDraft({
      pipelineRecord: pipelineRecord(),
      goal,
      style: 'professional',
      approvedDisplayName: true,
      governedReferences: referencesFor(config),
      advisorComponents: goal === 'custom' ? ['Solicitar un documento declarado por el asesor'] : [],
    });

    assert.equal(result.status, 'SUCCESS', `${goal}_STATUS`);
    assert.equal(result.conversationBrief.status, 'SUCCESS', `${goal}_BRIEF`);
    assert.equal(
      result.conversationBrief.conversationObjective.objectiveStatement,
      config.statement,
      `${goal}_OBJECTIVE_STATEMENT`,
    );
    assert.equal(
      result.conversationBrief.conversationObjective.objectiveType,
      config.strategyCategory,
      `${goal}_STRATEGY_CATEGORY`,
    );
    assert.equal(
      result.providerRequest.conversationBrief.conversationObjective.objectiveStatement,
      config.statement,
      `${goal}_PROVIDER_CONSUMED_OBJECTIVE`,
    );
    assert.equal(result.humanApprovalRequired, true);
    assert.equal(result.approved, false);
    assert.equal(result.sent, false);
  }

  assert.deepEqual([...seen.keys()].sort(), Object.keys(GOAL_CONFIG).sort());
});

test('RU02 Level 2: provider failure preserves critical intent briefs instead of substituting first_contact', async () => {
  for (const goal of CRITICAL_GOALS) {
    const config = GOAL_CONFIG[goal];
    const orchestrator = createPipelineNashDraftOrchestrator({
      now: () => NOW,
      invokeFunction: async () => ({ data: null, error: new Error('FORGE_013_PROVIDER_UNAVAILABLE') }),
    });

    const result = await orchestrator.requestDraft({
      pipelineRecord: pipelineRecord(),
      goal,
      style: 'professional',
      approvedDisplayName: true,
      advisorComponents: goal === 'custom' ? ['Objetivo declarado por el asesor'] : [],
    });

    assert.equal(result.status, 'FALLBACK_REQUIRED', `${goal}_FALLBACK_REQUIRED`);
    assert.equal(result.conversationBrief.status, 'SUCCESS', `${goal}_BRIEF_MUST_SURVIVE_PROVIDER_FAILURE`);
    assert.equal(result.conversationBrief.conversationObjective.objectiveStatement, config.statement);
    assert.notEqual(
      result.conversationBrief.conversationObjective.objectiveStatement,
      GOAL_CONFIG.first_contact.statement,
      `${goal}_MUST_NOT_COLLAPSE_TO_FIRST_CONTACT`,
    );
    assert.equal(result.deterministicFallbackRequired, true);
    assert.equal(result.externalActionPerformed, false);
    assert.equal(result.humanApprovalRequired, true);
    assert.equal(result.approved, false);
    assert.equal(result.sent, false);
  }
});
