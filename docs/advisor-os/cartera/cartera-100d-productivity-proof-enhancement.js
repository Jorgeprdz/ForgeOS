import { AppState } from '../../state-manager.js';
import { EventBus } from '../../event-system.js';
import { Logger } from '../../logger.js';
import { Memory } from '../../memory-manager.js';
import { createCartera100ProductivityProofService } from './cartera-100c-productivity-proof-service.js';
import { renderCartera100ProductivityProof } from '../../platform/productivity/cartera-100d-productivity-proof-view.js';

const state = {
  status: 'IDLE',
  proof: null,
  errorCode: null,
  feedbackStatus: null,
  revision: 0,
};

function ensureHost() {
  const root = document.getElementById('cartera-root');
  if (!root) return null;
  let host = document.getElementById('cartera-productivity-proof-panel');
  if (host) return host;
  host = document.createElement('div');
  host.id = 'cartera-productivity-proof-panel';
  host.setAttribute('aria-live', 'polite');
  const detail = document.getElementById('cartera-detail-panel');
  root.insertBefore(host, detail || root.firstChild);
  return host;
}

function render() {
  const host = ensureHost();
  if (host) host.innerHTML = renderCartera100ProductivityProof(state);
}

function evidenceFrom(item, fallbackReference) {
  const references = Array.isArray(item?.evidence)
    ? item.evidence.map(entry => entry?.reference).filter(Boolean)
    : Array.isArray(item?.evidenceReferences)
      ? item.evidenceReferences.filter(Boolean)
      : [];
  return [...new Set([...references, fallbackReference].filter(Boolean))].slice(0, 20);
}

async function load(service) {
  const revision = ++state.revision;
  state.status = 'LOADING';
  state.errorCode = null;
  render();
  try {
    const proof = await service.loadProductivityProof();
    if (revision !== state.revision) return;
    state.proof = proof;
    state.status = 'READY';
    AppState.set('cartera:productivityProof', proof);
    render();
    EventBus.emit('cartera:productivity-proof-mounted', {
      statementState: proof.statement.state,
      recommendationCount: proof.recommendations.length,
      readOnlyProjection: true,
      humanScore: false,
      advisorRanking: false,
      enforcement: false,
      automaticContact: false,
      automaticMessage: false,
      automaticTask: false,
      automaticCalendar: false,
      automaticOpportunity: false,
    });
  } catch (error) {
    if (revision !== state.revision) return;
    state.status = 'ERROR';
    state.errorCode = error?.code || error?.message || 'CARTERA100_PRODUCTIVITY_PROOF_FAILED';
    Logger.error('[CARTERA 100 PRODUCTIVITY PROOF ERROR]', error);
    render();
  }
}

async function recordAccepted(service, input) {
  try {
    await service.recordAcceptedRecommendation(input);
    state.feedbackStatus = 'Recomendación aceptada registrada como actividad observable, no como causalidad.';
    await load(service);
  } catch (error) {
    Logger.error('[CARTERA 100 ACCEPTED RECOMMENDATION ERROR]', error);
    state.feedbackStatus = 'No se pudo registrar la observación. La acción original no fue afectada.';
    render();
  }
}

function growthReviewInput(payload = {}) {
  const growth = AppState.get('cartera:relationshipGrowth');
  const item = growth?.items?.find(candidate => candidate.candidateReference === payload.candidateReference);
  if (!item || payload.eligible === false) return null;
  return {
    recommendationReference: item.candidateReference,
    recommendationClass: item.growthClass,
    sourceAuthority: 'CARTERA060_RELATIONSHIP_GROWTH',
    evidenceReferences: evidenceFrom(item, item.candidateReference),
    occurredAt: new Date().toISOString(),
  };
}

function activationReviewInput(payload = {}) {
  const deck = AppState.get('cartera:relationalActivation');
  const item = deck?.items?.find(candidate => candidate.actionReference === payload.actionReference);
  if (!item) return null;
  return {
    recommendationReference: item.actionReference,
    recommendationClass: item.actionClass,
    sourceAuthority: 'CARTERA070_RELATIONAL_ACTIVATION',
    evidenceReferences: evidenceFrom(item, item.actionReference),
    occurredAt: new Date().toISOString(),
  };
}

function capitalReviewInput(payload = {}) {
  const capital = AppState.get('cartera:relationshipCapital');
  const item = capital?.items?.find(candidate => candidate.capitalReference === payload.capitalReference);
  if (!item) return null;
  return {
    recommendationReference: item.capitalReference,
    recommendationClass: item.capitalClass,
    sourceAuthority: 'CARTERA090_RELATIONSHIP_CAPITAL',
    evidenceReferences: evidenceFrom(item, item.capitalReference),
    occurredAt: new Date().toISOString(),
  };
}

async function recordFeedback(service, recommendationReference, feedback) {
  const item = state.proof?.recommendations?.find(
    recommendation => recommendation.recommendationReference === recommendationReference
  );
  if (!item) return;
  const target = document.querySelector(
    `[data-productivity-feedback-state="${CSS.escape(recommendationReference)}"]`
  );
  if (target) target.textContent = 'Guardando retroalimentación explícita…';
  try {
    await service.recordAdvisorFeedback({
      recommendationReference,
      recommendationClass: item.recommendationClass,
      feedback,
      evidenceReferences: evidenceFrom(item, recommendationReference),
      occurredAt: new Date().toISOString(),
    });
    state.feedbackStatus = 'Retroalimentación guardada. No se creó score, ranking ni acción automática.';
    await load(service);
  } catch (error) {
    Logger.error('[CARTERA 100 FEEDBACK ERROR]', error);
    if (target) target.textContent = error?.code || error?.message || 'No se pudo guardar.';
  }
}

export function bindCartera100ProductivityProof({ service } = {}) {
  const root = document.getElementById('cartera-root');
  if (!root) return;
  const resolvedService = service || createCartera100ProductivityProofService();
  ensureHost();

  const onClick = event => {
    if (event.target.closest('[data-productivity-refresh]')) {
      load(resolvedService);
      return;
    }
    const feedbackButton = event.target.closest(
      '[data-productivity-feedback][data-productivity-recommendation]'
    );
    if (feedbackButton) {
      recordFeedback(
        resolvedService,
        feedbackButton.dataset.productivityRecommendation,
        feedbackButton.dataset.productivityFeedback
      );
    }
  };

  root.addEventListener('click', onClick);
  const unsubscribers = [
    EventBus.on('cartera:mounted', () => load(resolvedService)),
    EventBus.on('cartera:relationship-growth-reviewed', payload => {
      const input = growthReviewInput(payload);
      if (input) recordAccepted(resolvedService, input);
    }),
    EventBus.on('cartera:relational-activation-reviewed', payload => {
      const input = activationReviewInput(payload);
      if (input) recordAccepted(resolvedService, input);
    }),
    EventBus.on('cartera:relationship-capital-reviewed', payload => {
      const input = capitalReviewInput(payload);
      if (input) recordAccepted(resolvedService, input);
    }),
    EventBus.on('cartera:minimum-useful-action-completed', payload => {
      resolvedService.recordCompletedAction(payload)
        .then(() => load(resolvedService))
        .catch(error => Logger.error('[CARTERA 100 COMPLETED ACTION ERROR]', error));
    }),
    EventBus.on('cartera:productivity-proof-observation', payload => {
      resolvedService.recordGenericProof(payload)
        .then(() => load(resolvedService))
        .catch(error => Logger.error('[CARTERA 100 GENERIC PROOF ERROR]', error));
    }),
  ];

  load(resolvedService);

  Memory.add(() => {
    state.revision += 1;
    root.removeEventListener('click', onClick);
    unsubscribers.forEach(unsubscribe => unsubscribe());
    state.status = 'IDLE';
    state.proof = null;
    state.errorCode = null;
    state.feedbackStatus = null;
    AppState.set('cartera:productivityProof', null);
    document.getElementById('cartera-productivity-proof-panel')?.remove();
  });
}
