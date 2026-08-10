import { createPipelineAdapter as createPreviousAdapter } from './pipeline-adapter-pages-v3.js?v=forge-aura-conversation-workspace-011a';

const rootUrl = new URL('../../../../', import.meta.url);
let conversationAuthoritiesPromise;

const GOAL_LABELS = Object.freeze({
  first_contact: 'Primer contacto',
  follow_up: 'Seguimiento',
  reactivation: 'Retomar conversación',
  appointment_confirmation: 'Confirmar cita',
  reschedule: 'Reprogramar',
  after_call: 'Después de llamada',
});

const STYLE_LABELS = Object.freeze({
  friendly: 'Cálido',
  professional: 'Profesional',
  executive: 'Ejecutivo',
  brief: 'Breve',
  social: 'Natural',
});

function freeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.freeze(value);
  Object.values(value).forEach(freeze);
  return value;
}

function text(value) {
  return String(value ?? '').trim();
}

async function load(path) {
  await import(`${new URL(path, rootUrl).href}?v=forge-aura-conversation-workspace-011a`);
}

async function ensureConversationAuthorities() {
  if (conversationAuthoritiesPromise) return conversationAuthoritiesPromise;
  conversationAuthoritiesPromise = (async () => {
    for (const path of [
      'advisor-os/sales-pipeline/prospect-context/universal-governed-prospect-context-contract.js',
      'advisor-os/sales-pipeline/prospect-context/pipeline-universal-prospect-context-adapter.js',
      'nash/context-intake/nash-prospect-context-intake-boundary-contract.js',
      'nash/context-intake/nash-prospect-context-intake.js',
      'nash/context-intake/nash-universal-prospect-context-consumer.js',
      'nash/conversation-brief/nash-deterministic-conversation-brief-boundary-contract.js',
      'nash/conversation-brief/nash-provider-request-contract.js',
      'nash/remote-draft-provider-client-boundary.js',
      'nash/pipeline-nash-draft-orchestrator.js',
      'nash/draft-intake/nfast06-draft-safety-boundary.js',
      'nash/draft-intake/nfast06-deterministic-draft-renderer.js',
      'advisor-os/sales-pipeline/contact-navigation/productive-contact-navigation-boundary.js',
      'nash-intent-engine.js',
      'nash-combat-orchestrator.js',
      'nash-next-best-action-engine.js',
      'nash-combat-intelligence-report-engine.js',
    ]) await load(path);

    const required = [
      globalThis.ForgePipelineNashDraftOrchestrator,
      globalThis.ForgeNashDeterministicConversationBriefContract,
      globalThis.ForgeNashProviderRequestContract,
      globalThis.ForgeNashRemoteDraftProviderClientBoundary,
      globalThis.ForgeDraftSafetyBoundaryNFAST06,
      globalThis.ForgeDeterministicDraftRendererNFAST06,
      globalThis.ForgeProductiveContactNavigationBoundary067G17B,
      globalThis.ForgeNashCombatIntelligenceReportEngine,
    ];
    if (required.some(authority => !authority)) throw new Error('AURA_NASH_CONVERSATION_AUTHORITY_UNAVAILABLE');
    return true;
  })().catch(error => {
    conversationAuthoritiesPromise = null;
    throw error;
  });
  return conversationAuthoritiesPromise;
}

function cardProspect(card) {
  return card?.prospect || card;
}

function safeCandidate(candidate) {
  if (!candidate || typeof candidate !== 'object') return null;
  return freeze({
    ...candidate,
    sendsMessage: false,
    humanApprovalRequired: true,
    approved: false,
    sent: false,
  });
}

function deterministicCandidate(prospect) {
  return safeCandidate(globalThis.ForgeDeterministicDraftRendererNFAST06.draftCandidate(prospect));
}

function rebuildProjectionFromBrief(brief) {
  return freeze({
    projectionType: 'CONVERSATION_CONTEXT',
    type: 'CONVERSATION_CONTEXT',
    status: 'READY',
    blocked: false,
    prospectReference: brief.identity?.prospectReference,
    approvedDisplayNameReference: brief.identity?.approvedDisplayNameReference || null,
    contextVersion: brief.identity?.contextVersion,
    verifiedFacts: brief.sourceContext?.verifiedFacts || [],
    sourceEvidenceIds: brief.lineage?.sourceEvidenceIds || [],
    evidenceReferences: brief.sourceContext?.evidenceReferences || brief.lineage?.sourceEvidenceIds || [],
    sourceOwners: brief.lineage?.sourceOwners || [],
    freshness: brief.sourceContext?.freshness || ['CURRENT'],
    unknowns: brief.sourceContext?.unknowns || [],
    missingContext: brief.sourceContext?.missingContext || [],
    blockedContext: brief.sourceContext?.blockedContext || [],
    relationshipFraming: brief.conversationObjective?.relationshipAwareFraming,
    personalizationPoints: brief.strategy?.evidenceBoundPersonalizationPoints || [],
    questionsToAsk: brief.strategy?.questionsToAsk || [],
    conversationConstraints: brief.strategy?.conversationConstraints || [],
    forbiddenClaims: brief.claims?.forbiddenClaims || [],
    unsupportedClaimCategories: brief.claims?.unsupportedClaimCategories || [],
    privacyRestrictions: brief.safety?.privacyRestrictions || [],
    sensitiveDataExclusions: brief.safety?.sensitiveDataExclusions || [],
  });
}

function rebuildIntakeFromBrief(brief) {
  return freeze({
    status: brief.lineage?.intakeStatus || 'SUCCESS',
    sourceOwners: brief.lineage?.sourceOwners || [],
    sourceEvidenceIds: brief.lineage?.sourceEvidenceIds || [],
    freshness: brief.sourceContext?.freshness?.[0] || 'CURRENT',
    unknowns: brief.sourceContext?.unknowns || [],
    missingContext: brief.sourceContext?.missingContext || [],
    blockedContext: brief.sourceContext?.blockedContext || [],
  });
}

function conversationRequestFromBrief(brief) {
  return freeze({
    prospectReference: brief.identity?.prospectReference,
    objective: {
      type: brief.conversationObjective?.objectiveType,
      statement: brief.conversationObjective?.objectiveStatement,
    },
    successCondition: brief.conversationObjective?.successCondition,
    requestedChannel: brief.conversationObjective?.requestedChannel,
    allowedToneStyle: brief.conversationObjective?.requestedToneStyle,
    allowedCtaType: brief.cta?.allowedCtaType,
    ctaWordingConstraints: brief.cta?.ctaWordingConstraints || [],
    urgencyClassification: brief.cta?.urgencyClassification || 'NORMAL',
    sequencingGuidance: brief.strategy?.sequencingGuidance || [],
  });
}

function reviewedCombatQuestion(combat) {
  const strategy = text(combat?.psychology?.recommendedStrategy);
  const action = text(combat?.nextBestAction?.action || combat?.nextBestAction?.recommendedAction);
  const guidance = text(combat?.advisorGuidance?.do);
  const parts = [strategy, action, guidance].filter(Boolean);
  if (!parts.length) return 'Ask one optional clarifying question before offering a next step.';
  return `Use the reviewed NASH strategy as a question, not as a factual claim: ${parts.join(' · ')}`;
}

async function buildObjectionAwareBrief(baseBrief, combat) {
  const briefAuthority = globalThis.ForgeNashDeterministicConversationBriefContract;
  const classification = text(combat?.classification?.type);
  const intent = text(combat?.classification?.intent);
  return briefAuthority.buildDeterministicBrief({
    projection: rebuildProjectionFromBrief(baseBrief),
    prospectContextIntake: rebuildIntakeFromBrief(baseBrief),
    conversationRequest: conversationRequestFromBrief(baseBrief),
    objectionContext: {
      objectionsToAcknowledge: [classification, intent].filter(Boolean),
      questionsToAsk: [reviewedCombatQuestion(combat)],
    },
    candidateInterpretations: [
      combat?.psychology?.psychology,
      combat?.psychology?.recommendedStrategy,
      combat?.psychology?.risk,
    ].filter(Boolean).map((interpretation, index) => ({
      interpretationId: `NASH_COMBAT_REVIEWED_${index + 1}`,
      interpretation,
    })),
    requestMetadata: {
      briefId: `${baseBrief.identity?.briefId || 'NFAST-04'}:COMBAT`,
      generatedAt: new Date().toISOString(),
      requestedUse: 'DETERMINISTIC_CONVERSATION_BRIEF',
    },
    allowedSourceOwners: baseBrief.lineage?.sourceOwners || [],
  });
}

async function requestProviderDraft(client, conversationBrief, { providerId = 'gemini', locale = 'es-MX', variation = 0 } = {}) {
  const providerContract = globalThis.ForgeNashProviderRequestContract;
  const remoteBoundary = globalThis.ForgeNashRemoteDraftProviderClientBoundary;
  const request = {
    requestVersion: providerContract.PROVIDER_REQUEST_VERSION,
    providerId,
    conversationBrief,
    requestMetadata: {
      requestId: `AURA-011A-${conversationBrief.identity?.prospectReference || 'prospect'}-${variation}`.replace(/[^A-Za-z0-9._:-]/g, '-'),
      correlationId: `PIPELINE:${conversationBrief.identity?.prospectReference || 'prospect'}`.replace(/[^A-Za-z0-9._:-]/g, '-'),
      locale,
      renderingVariation: `variation-${Number(variation) || 0}`,
      timeoutMs: 5000,
      clientVersion: 'AURA-CONVERSATION-011A',
      requestVersion: providerContract.PROVIDER_REQUEST_VERSION,
    },
  };
  const validation = providerContract.validateProviderDraftRequest(request);
  if (!validation.valid) {
    return freeze({ resultState: 'ERROR', draftCandidate: null, error: { code: validation.code, message: validation.message }, providerRequest: request });
  }
  const remote = remoteBoundary.createRemoteDraftProviderClient({
    invokeFunction: (name, requestOptions) => client.functions?.invoke
      ? client.functions.invoke(name, requestOptions)
      : Promise.resolve({ error: new Error('PROVIDER_NOT_CONFIGURED') }),
    timeoutMs: 5000,
  });
  const envelope = await remote.requestDraft(request);
  return freeze({ ...envelope, providerRequest: request });
}

export async function createPipelineAdapter({ client } = {}) {
  if (!client) throw new Error('PRODUCTIVE_CLIENT_REQUIRED');
  const adapter = await createPreviousAdapter({ client });

  async function prepareMessage(card, options = {}) {
    await ensureConversationAuthorities();
    const prospect = cardProspect(card);
    const providerId = text(options.providerId || globalThis.__FORGE_NASH_PROVIDER_ID__ || 'gemini').toLowerCase();
    const goal = text(options.goal || 'first_contact');
    const style = text(options.style || 'professional');
    const variation = Number(options.variation) || 0;
    const combat = options.combat?.reviewed === true ? options.combat : null;

    const invokeFunction = (name, requestOptions) => client.functions?.invoke
      ? client.functions.invoke(name, requestOptions)
      : Promise.resolve({ error: new Error('PROVIDER_NOT_CONFIGURED') });
    const orchestrator = globalThis.ForgePipelineNashDraftOrchestrator.createPipelineNashDraftOrchestrator({ invokeFunction });

    let result;
    let conversationBrief;
    let providerEnvelope;
    if (!combat) {
      result = await orchestrator.requestDraft({
        pipelineRecord: prospect,
        goal,
        style,
        variation,
        providerId,
        approvedDisplayName: true,
      });
      conversationBrief = result.conversationBrief || null;
      providerEnvelope = result.providerEnvelope || null;
    } else {
      const briefOnlyOrchestrator = globalThis.ForgePipelineNashDraftOrchestrator.createPipelineNashDraftOrchestrator({
        invokeFunction: async () => ({ data: null, error: new Error('AURA_BRIEF_ONLY') }),
      });
      const base = await briefOnlyOrchestrator.requestDraft({
        pipelineRecord: prospect,
        goal,
        style,
        variation,
        providerId: 'deterministic',
        approvedDisplayName: true,
      });
      if (base.conversationBrief?.status === 'SUCCESS') {
        conversationBrief = await buildObjectionAwareBrief(base.conversationBrief, combat);
        providerEnvelope = conversationBrief?.status === 'SUCCESS'
          ? await requestProviderDraft(client, conversationBrief, { providerId, variation })
          : null;
        result = freeze({
          status: providerEnvelope?.resultState === 'SUCCESS' ? 'SUCCESS' : 'FALLBACK_REQUIRED',
          conversationBrief,
          providerEnvelope,
          providerInvoked: providerEnvelope?.resultState === 'SUCCESS',
          rawPipelineForwardedToProvider: false,
          rawUniversalContextForwardedToProvider: false,
          rawObjectionForwardedToProvider: false,
          humanApprovalRequired: true,
          approved: false,
          sent: false,
        });
      } else {
        result = base;
        conversationBrief = base.conversationBrief || null;
        providerEnvelope = base.providerEnvelope || null;
      }
    }

    const safety = globalThis.ForgeDraftSafetyBoundaryNFAST06;
    const providerCandidate = providerEnvelope?.draftCandidate || null;
    const providerIntake = providerCandidate ? safety.intakeDraftProviderEnvelope(providerEnvelope) : null;
    const fallback = deterministicCandidate(prospect);
    const candidate = providerIntake?.state === 'READY_FOR_HUMAN_REVIEW'
      ? safeCandidate(providerIntake.draftCandidateSnapshot)
      : fallback;
    const draftText = text(candidate?.rawText || candidate?.text);
    const validation = safety.draftSafetyValidator({
      draftText,
      draftCandidateSnapshot: { ...candidate, sendsMessage: false },
      humanApproval: { required: true, finalAuthority: 'HUMAN' },
    });

    return freeze({
      status: validation?.valid === false ? 'BLOCKED' : 'READY_FOR_HUMAN_REVIEW',
      candidate,
      validation,
      sourceMode: providerIntake?.state === 'READY_FOR_HUMAN_REVIEW' ? 'AI_RENDERED' : 'DETERMINISTIC_FALLBACK',
      conversationBriefProduced: conversationBrief?.status === 'SUCCESS',
      combatIncorporated: Boolean(combat && conversationBrief?.status === 'SUCCESS'),
      rawPipelineForwardedToProvider: false,
      rawObjectionForwardedToProvider: false,
      humanApprovalRequired: true,
      approved: false,
      sent: false,
      diagnostics: {
        providerResultState: providerEnvelope?.resultState || 'NO_PROVIDER_DRAFT',
        providerErrorCode: providerEnvelope?.error?.code || null,
      },
    });
  }

  async function analyzeCombat(card, objection) {
    await ensureConversationAuthorities();
    const raw = text(objection);
    if (!raw) throw new Error('COMBAT_OBJECTION_REQUIRED');
    const prospect = cardProspect(card);
    const report = globalThis.ForgeNashCombatIntelligenceReportEngine.buildCombatIntelligenceReport({
      objection: raw,
      context: {
        name: prospect.fullName || card?.fullName || 'Prospecto',
        prospectId: prospect.id || card?.id,
        stage: prospect.status || card?.status,
      },
      personality: {},
    });
    return freeze({
      engine: report.engine,
      version: report.version,
      classification: report.classification,
      psychology: report.psychology,
      nextBestAction: report.nextBestAction,
      advisorGuidance: report.advisorGuidance,
      hardcodedFinalResponseUsed: false,
      rawObjectionPersisted: false,
      rawObjectionForwardedToProvider: false,
      reviewed: false,
    });
  }

  function reviewCombat(combat) {
    if (!combat?.classification?.type) throw new Error('COMBAT_CLASSIFICATION_REQUIRED');
    return freeze({ ...combat, reviewed: true, reviewedAt: new Date().toISOString() });
  }

  async function registerObjection(card, combat) {
    if (combat?.reviewed !== true || !combat?.classification?.type) throw new Error('REVIEWED_OBJECTION_CLASSIFICATION_REQUIRED');
    const prospect = cardProspect(card);
    const prospectId = text(prospect.id || card?.id);
    const occurredAt = new Date().toISOString();
    await adapter.timelineService.appendProspectTimelineEvent(prospectId, {
      eventType: 'OBJECTION_RECORDED',
      occurredAt,
      sourceRecordReference: `PROSPECT:${prospectId}`,
      payload: {
        objectionCode: text(combat.classification.type),
        resolutionStatus: 'OPEN',
      },
      evidenceReferences: [`PROSPECT:${prospectId}`],
      idempotencyKey: `OBJECTION:${prospectId}:${text(combat.classification.type)}:${occurredAt}`,
    });
    await adapter.reload();
    return true;
  }

  async function approveExactDraft(card, prepared, draftText) {
    await ensureConversationAuthorities();
    const textValue = text(draftText);
    const safety = globalThis.ForgeDraftSafetyBoundaryNFAST06;
    const snapshot = {
      ...(prepared?.candidate || {}),
      rawText: textValue,
      text: textValue,
      sendsMessage: false,
      sourceMutable: true,
    };
    const validation = safety.draftSafetyValidator({
      draftText: textValue,
      draftCandidateSnapshot: snapshot,
      humanApproval: { required: true, finalAuthority: 'HUMAN' },
    });
    const approval = safety.approveExactDraft({
      draftText: textValue,
      validationResult: validation,
      humanDecision: safety.EXPLICIT_DRAFT_APPROVAL,
    });
    const gate = safety.exactDraftHumanApprovalGate({
      draftText: textValue,
      validationResult: validation,
      approvalSnapshot: approval,
    });
    const prospect = cardProspect(card);
    const url = gate.exactDraftApproved
      ? globalThis.ForgeProductiveContactNavigationBoundary067G17B.whatsappUrl(prospect, 'professional', textValue)
      : null;
    return freeze({
      approved: Boolean(gate.exactDraftApproved && url),
      validation,
      approval,
      gate,
      whatsappUrl: url,
      exactText: gate.exactDraftApproved ? textValue : null,
      messageSent: false,
      whatsappOpened: false,
    });
  }

  return Object.freeze({
    ...adapter,
    capabilities: Object.freeze({
      ...(adapter.capabilities || {}),
      nashAvailable: true,
      nashCombatAvailable: true,
      conversationWorkspace011a: true,
      exactHumanApproval011a: true,
      contactAvailable: true,
      autonomousCommercialExecution: false,
    }),
    messageOptions() {
      return freeze({ goals: GOAL_LABELS, styles: STYLE_LABELS });
    },
    prepareMessage,
    analyzeCombat,
    reviewCombat,
    registerObjection,
    approveExactDraft,
  });
}
