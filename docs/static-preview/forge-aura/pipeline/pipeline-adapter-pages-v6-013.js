import { createPipelineAdapter as createPreviousAdapter } from './pipeline-adapter-pages-v5.js?v=forge-beta2-013-intent-base';

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

export async function createPipelineAdapter(options = {}) {
  const adapter = await createPreviousAdapter(options);

  return Object.freeze({
    ...adapter,
    async prepareMessage(card, request = {}) {
      const selectedIntent = text(request.goal || 'first_contact');
      const prepared = await adapter.prepareMessage(card, request);
      if (prepared?.sourceMode !== 'DETERMINISTIC_FALLBACK') {
        return freeze({
          ...prepared,
          selectedIntent,
          diagnostics: {
            ...(prepared?.diagnostics || {}),
            selectedIntent,
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
          humanApprovalRequired: true,
          approved: false,
          sent: false,
          diagnostics: {
            ...(prepared?.diagnostics || {}),
            selectedIntent,
            fallbackReason: 'DRAFT_FALLBACK_AUTHORITY_UNAVAILABLE',
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
          humanApprovalRequired: true,
          approved: false,
          sent: false,
          diagnostics: {
            ...(prepared?.diagnostics || {}),
            selectedIntent,
            fallbackReason: 'NO_INTENT_SAFE_DETERMINISTIC_FALLBACK',
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
        humanApprovalRequired: true,
        approved: false,
        sent: false,
        diagnostics: {
          ...(prepared?.diagnostics || {}),
          selectedIntent,
          fallbackIntent: selectedIntent,
          intentFallbackApplied: true,
        },
      });
    },
  });
}