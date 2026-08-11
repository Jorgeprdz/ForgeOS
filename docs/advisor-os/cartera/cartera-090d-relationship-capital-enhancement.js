import { AppState } from '../../state-manager.js';
import { EventBus } from '../../event-system.js';
import { Logger } from '../../logger.js';
import { Memory } from '../../memory-manager.js';
import { createCartera090RelationshipCapitalService } from './cartera-090c-relationship-capital-service.js';
import { renderCartera090RelationshipCapital } from '../../platform/relationship-intelligence/cartera-090d-relationship-capital-view.js';

const state = { status: 'IDLE', capital: null, errorCode: null };

function ensureHost() {
  const root = document.getElementById('cartera-root');
  if (!root) return null;
  let host = document.getElementById('cartera-relationship-capital-panel');
  if (host) return host;
  host = document.createElement('div');
  host.id = 'cartera-relationship-capital-panel';
  host.setAttribute('aria-live', 'polite');
  const detail = document.getElementById('cartera-detail-panel');
  root.insertBefore(host, detail || root.firstChild);
  return host;
}

function render() {
  const host = ensureHost();
  if (host) host.innerHTML = renderCartera090RelationshipCapital(state);
}

async function load(service) {
  state.status = 'LOADING';
  state.errorCode = null;
  render();
  try {
    state.capital = await service.loadRelationshipCapital();
    state.status = 'READY';
    AppState.set('cartera:relationshipCapital', state.capital);
    render();
    EventBus.emit('cartera:relationship-capital-mounted', {
      reviewItemCount: state.capital.items.length,
      confirmedEdgeCount: state.capital.edges.length,
      hypothesisCount: state.capital.hypotheses.length,
      readOnly: true,
      opaqueInfluenceScore: false,
      relationshipGraphMutation: false,
      automaticContact: false,
      referralRequestExecuted: false,
      finalPriorityTruth: false,
    });
  } catch (error) {
    state.status = 'ERROR';
    state.errorCode = error?.code || error?.message || 'CARTERA090_RELATIONSHIP_CAPITAL_FAILED';
    Logger.error('[CARTERA 090 RELATIONSHIP CAPITAL ERROR]', error);
    render();
  }
}

export function bindCartera090RelationshipCapital({ service } = {}) {
  const root = document.getElementById('cartera-root');
  if (!root) return;
  const resolvedService = service || createCartera090RelationshipCapitalService();
  ensureHost();

  const onClick = event => {
    if (event.target.closest('[data-relationship-capital-refresh]')) {
      load(resolvedService);
      return;
    }
    const review = event.target.closest('[data-relationship-capital-review]');
    if (!review || !state.capital) return;
    const item = state.capital.items.find(
      candidate => candidate.capitalReference === review.dataset.relationshipCapitalReview
    );
    if (!item) return;
    const envelope = resolvedService.prepareRelationshipReview(item);
    const target = root.querySelector(
      `[data-relationship-capital-review-state="${CSS.escape(item.capitalReference)}"]`
    );
    if (target) {
      target.textContent = 'Revisión preparada. Todavía no se modificó el grafo ni se ejecutó contacto alguno.';
    }
    EventBus.emit('cartera:relationship-capital-reviewed', {
      reviewReference: envelope.reviewReference,
      capitalReference: envelope.capitalReference,
      proposedAction: envelope.proposedAction,
      executionAuthorized: false,
      relationshipGraphMutated: false,
      contactExecuted: false,
      messageSent: false,
      taskCreated: false,
      calendarEventCreated: false,
      opportunityCreated: false,
      referralRequested: false,
      finalPriorityTruth: false,
    });
  };

  root.addEventListener('click', onClick);
  const unsubscribers = [
    EventBus.on('cartera:mounted', () => load(resolvedService)),
    EventBus.on('cartera:relationship-memory-recorded', () => load(resolvedService)),
    EventBus.on('cartera:relationship-growth-mounted', () => load(resolvedService)),
    EventBus.on('cartera:relationship-growth-reviewed', () => load(resolvedService)),
    EventBus.on('cartera:economic-handoff-recorded', () => load(resolvedService)),
  ];
  load(resolvedService);

  Memory.add(() => {
    root.removeEventListener('click', onClick);
    unsubscribers.forEach(unsubscribe => unsubscribe());
    state.status = 'IDLE';
    state.capital = null;
    state.errorCode = null;
    AppState.set('cartera:relationshipCapital', null);
    document.getElementById('cartera-relationship-capital-panel')?.remove();
  });
}
