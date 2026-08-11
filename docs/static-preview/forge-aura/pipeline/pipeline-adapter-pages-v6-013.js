import { createPipelineAdapter as createPreviousAdapter } from './pipeline-adapter-pages-v5.js?v=forge-beta2-013-intent-base';
import { createPipelineCrs10ContextAdapter } from './pipeline-crs10-context-adapter-013.js?v=forge-beta2-013-crs10-context';

function text(value) {
  return String(value ?? '').trim();
}

function freeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.freeze(value);
  Object.values(value).forEach(freeze);
  return value;
}

function prospectFrom(card) {
  return card?.prospect || card;
}

function humanReviewCandidate(candidate) {
  if (!candidate) return null;
  return freeze({
    ...candidate,
    sendsMessage: false,
    humanApprovalRequired: true,
    reviewRequired: true,
    approved: false,
    sent: false,
  });
}

function blockedValidation(safety) {
  return safety.draftSafetyValidator({
    draftText: '',
    draftCandidateSnapshot: null,
    humanApproval: { required: true, finalAuthority: 'HUMAN' },
  });
}

function intentConsumption(prepared, selectedIntent) {
  // The previous adapter passes this exact goal to NFAST-07. A successful
  // Conversation Brief proves NASH consumed the selected governed objective;
  // a failed brief must not pretend that it did.
  return prepared?.conversationBriefProduced === true ? selectedIntent : null;
}

function truthfulFallbackExplanation(prepared, selectedIntent) {
  if (prepared?.conversationBriefProduced === true) {
    return `Forge conservó el objetivo “${selectedIntent}”, pero no obtuvo una redacción segura y no existe un fallback determinístico autorizado para sustituirla. Reintenta la sugerencia; Forge no cambiará el objetivo por otro.`;
  }
  return `Forge conservó el objetivo “${selectedIntent}”, pero el contexto verificado no alcanzó para construir una sugerencia segura. Revisa la información disponible antes de continuar.`;
}

function unavailableIntelligence(prospectReference, reason) {
  return freeze({
    consumerId: 'FORGE_PIPELINE_DOMAIN_INTELLIGENCE_CONSUMER_005A',
    state: 'unavailable',
    prospectReference: prospectReference || null,
    personReference: null,
    identityState: 'UNKNOWN',
    opportunityAuthorityState: 'UNKNOWN',
    projections: [],
    relationshipIntelligence: null,
    relationshipIntelligenceState: 'UNAVAILABLE',
    provenance: { sourceAuthorities: [] },
    degradedReasons: [reason || 'PIPELINE_CRS10_CONTEXT_UNAVAILABLE'],
    boundaries: {
      readOnly: true,
      createsTruth: false,
      createsScore: false,
      calculatesPriority: false,
      automaticExecutionAllowed: false,
      identityMutationAllowed: false,
      relationshipMutationAllowed: false,
      persistenceAllowed: false,
    },
  });
}

export async function createPipelineAdapter(options = {}) {
  const adapter = await createPreviousAdapter(options);
  let contextAdapter = null;
  let contextUnavailableReason = null;
  try {
    contextAdapter = await createPipelineCrs10ContextAdapter({ client: options.client });
  } catch (error) {
    contextUnavailableReason = error?.code || error?.message || 'PIPELINE_CRS10_CONTEXT_UNAVAILABLE';
  }

  return Object.freeze({
    ...adapter,
    capabilities: Object.freeze({
      ...(adapter.capabilities || {}),
      intelligenceAvailable: Boolean(contextAdapter),
      relationshipIntelligenceAvailable: Boolean(contextAdapter),
      existingCarteraIntelligenceReused: Boolean(contextAdapter),
      secondRelationshipEngine: false,
    }),
    async intelligence(prospectReference, request = {}) {
      if (!contextAdapter) return unavailableIntelligence(prospectReference, contextUnavailableReason);
      return contextAdapter.intelligence(prospectReference, request);
    },
    async prepareMessage(card, request = {}) {
      const selectedIntent = text(request.goal || 'first_contact');
      const prepared = await adapter.prepareMessage(card, request);
      const intentConsumedByNash = intentConsumption(prepared, selectedIntent);

      if (intentConsumedByNash && intentConsumedByNash !== selectedIntent) {
        return freeze({
          ...prepared,
          status: 'BLOCKED',
          candidate: null,
          sourceMode: 'INTENT_MISMATCH_BLOCKED',
          selectedIntent,
          intentConsumedByNash,
          humanApprovalRequired: true,
          approved: false,
          sent: false,
          diagnostics: {
            ...(prepared?.diagnostics || {}),
            selectedIntent,
            intentConsumedByNash,
            fallbackReason: 'SELECTED_INTENT_NASH_CONSUMPTION_MISMATCH',
            userExplanation: 'Forge detuvo la sugerencia porque el objetivo seleccionado no coincide con el objetivo consumido por NASH.',
          },
        });
      }

      if (prepared?.sourceMode !== 'DETERMINISTIC_FALLBACK') {
        return freeze({
          ...prepared,
          selectedIntent,
          intentConsumedByNash,
          diagnostics: {
            ...(prepared?.diagnostics || {}),
            selectedIntent,
            intentConsumedByNash,
            intentFallbackApplied: false,
          },
        });
      }

      const renderer = globalThis.ForgeDeterministicDraftRendererNFAST06;
      const safety = globalThis.ForgeDraftSafetyBoundaryNFAST06;
      if (!renderer?.draftCandidate || !safety?.draftSafetyValidator) {
        return freeze({
          ...prepared,
          status: 'BLOCKED',
          candidate: null,
          sourceMode: 'NO_SAFE_FALLBACK',
          selectedIntent,
          intentConsumedByNash,
          humanApprovalRequired: true,
          approved: false,
          sent: false,
          diagnostics: {
            ...(prepared?.diagnostics || {}),
            selectedIntent,
            intentConsumedByNash,
            fallbackReason: 'DRAFT_FALLBACK_AUTHORITY_UNAVAILABLE',
            userExplanation: truthfulFallbackExplanation(prepared, selectedIntent),
          },
        });
      }

      const governedGoalRegistry = renderer.GOAL_COPY || {};
      if (!Object.prototype.hasOwnProperty.call(governedGoalRegistry, selectedIntent)) {
        return freeze({
          ...prepared,
          status: 'BLOCKED',
          candidate: null,
          validation: blockedValidation(safety),
          sourceMode: 'NO_SAFE_FALLBACK',
          selectedIntent,
          intentConsumedByNash,
          humanApprovalRequired: true,
          approved: false,
          sent: false,
          diagnostics: {
            ...(prepared?.diagnostics || {}),
            selectedIntent,
            intentConsumedByNash,
            fallbackReason: 'NO_INTENT_SAFE_DETERMINISTIC_FALLBACK',
            userExplanation: truthfulFallbackExplanation(prepared, selectedIntent),
          },
        });
      }

      const candidate = humanReviewCandidate(renderer.draftCandidate(
        prospectFrom(card),
        text(request.style || 'professional'),
        selectedIntent,
        Number(request.variation) || 0,
      ));
      const draftText = text(candidate?.rawText || candidate?.text);
      const validation = safety.draftSafetyValidator({
        draftText,
        draftCandidateSnapshot: candidate,
        humanApproval: { required: true, finalAuthority: 'HUMAN' },
      });

      return freeze({
        ...prepared,
        status: validation.decision === 'ALLOW_WHATSAPP' ? 'READY_FOR_HUMAN_REVIEW' : 'BLOCKED',
        candidate,
        validation,
        sourceMode: 'DETERMINISTIC_FALLBACK',
        selectedIntent,
        intentConsumedByNash,
        humanApprovalRequired: true,
        approved: false,
        sent: false,
        diagnostics: {
          ...(prepared?.diagnostics || {}),
          selectedIntent,
          intentConsumedByNash,
          fallbackIntent: selectedIntent,
          intentFallbackApplied: true,
        },
      });
    },
  });
}
