import { AppState } from '../../state-manager.js';
import { EventBus } from '../../event-system.js';
import { Memory } from '../../memory-manager.js';
import { projectEconomicConnectionInbox } from '../../platform/economic-connection/cartera-080-economic-connection.js';
import { renderCartera080EconomicConnection } from '../../platform/economic-connection/cartera-080-economic-connection-view.js';

const state = { status: 'IDLE', items: [], errorCode: null };

function ensureHost() {
  const root = document.getElementById('cartera-root');
  if (!root) return null;
  let host = document.getElementById('cartera-economic-connection-panel');
  if (host) return host;
  host = document.createElement('div');
  host.id = 'cartera-economic-connection-panel';
  host.setAttribute('aria-live', 'polite');
  const detail = document.getElementById('cartera-detail-panel');
  root.insertBefore(host, detail || root.firstChild);
  return host;
}

function render() {
  const host = ensureHost();
  if (host) host.innerHTML = renderCartera080EconomicConnection(state);
}

function persist() {
  AppState.set('cartera:economicConnection', Object.freeze([...state.items]));
}

function upsertProjection(payload = {}) {
  const projection = projectEconomicConnectionInbox(payload);
  const index = state.items.findIndex(item => item.evidenceId === projection.evidenceId);
  if (index >= 0) state.items.splice(index, 1, projection);
  else state.items.unshift(projection);
  state.status = 'READY';
  state.errorCode = null;
  persist();
  render();
  EventBus.emit('cartera:economic-connection-mounted', {
    evidenceId: projection.evidenceId,
    status: projection.status,
    projectionOnly: true,
    ledgerMutationAllowed: false,
    commissionCalculationAllowed: false,
    automaticContactAllowed: false,
  });
}

export function bindCartera080EconomicConnection() {
  const root = document.getElementById('cartera-root');
  if (!root) return;

  ensureHost();
  const stored = AppState.get('cartera:economicConnection');
  state.items = Array.isArray(stored) ? [...stored] : [];
  state.status = 'READY';
  render();

  const onClick = event => {
    const button = event.target.closest('[data-economic-action][data-economic-evidence]');
    if (!button) return;
    const evidenceId = button.dataset.economicEvidence;
    const action = button.dataset.economicAction;
    const target = root.querySelector(`[data-economic-action-state="${CSS.escape(evidenceId)}"]`);
    if (target) target.textContent = 'Acción preparada para revisión humana. No se ejecutó ninguna mutación económica.';
    EventBus.emit('cartera:economic-connection-review-requested', {
      evidenceId,
      action,
      executionAuthorized: false,
      paymentConfirmed: false,
      ledgerMutation: false,
      commissionCalculated: false,
      gmailRead: false,
    });
  };

  root.addEventListener('click', onClick);
  const unsubscribers = [
    EventBus.on('cartera:economic-evidence-observed', upsertProjection),
    EventBus.on('cartera:economic-match-proposed', upsertProjection),
    EventBus.on('cartera:economic-decision-recorded', upsertProjection),
    EventBus.on('cartera:economic-handoff-recorded', upsertProjection),
  ];

  Memory.add(() => {
    root.removeEventListener('click', onClick);
    unsubscribers.forEach(unsubscribe => unsubscribe());
    state.status = 'IDLE';
    state.items = [];
    state.errorCode = null;
    AppState.set('cartera:economicConnection', null);
    document.getElementById('cartera-economic-connection-panel')?.remove();
  });
}
