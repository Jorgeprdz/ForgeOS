import { createAuraDecisionControl } from '../home/home-decision-control-017c.js';
import { createAuraPresentationEvidenceControl } from '../home/home-presentation-evidence-017e.js';
import {
  setRecommendationDecisionLineage,
  clearRecommendationDecisionLineage,
} from '../recommendation-lineage-session-017e.js?v=forge-commercial-pilot-evidence-017e-r4';

const sourceLayout = import.meta.url.includes('/docs/static-preview/');
const portfolioRoot = new URL(
  sourceLayout ? '../../../../platform/portfolio-intelligence/' : '../../../platform/portfolio-intelligence/',
  import.meta.url,
);
const [{ renderCartera050FutureRadar }, pilotAuthority, calendarAuthority] = await Promise.all([
  import(new URL('cartera-050d-future-radar-view.js', portfolioRoot).href),
  import(new URL('cartera-050e-actionable-payment-recommendation-017e.js', portfolioRoot).href),
  import(new URL('cartera-050-business-calendar-date.js', portfolioRoot).href),
]);

const {
  isCartera017eActionablePaymentRecommendation,
  toCartera017eActionablePaymentRecommendation,
} = pilotAuthority;
const {
  CARTERA050_BUSINESS_TIMEZONE,
  cartera050CalendarDate,
} = calendarAuthority;

function text(value) {
  return String(value ?? '').trim();
}

function authenticatedUser(client) {
  return client.auth.getUser().then(result => {
    if (result?.error || !result?.data?.user?.id) {
      throw Object.assign(new Error('CARTERA_017E_AUTH_REQUIRED'), { code: 'CARTERA_017E_AUTH_REQUIRED' });
    }
    return result.data.user;
  });
}

function normalizeRadar(value) {
  const radar = value && typeof value === 'object' ? value : {};
  const items = Array.isArray(radar.items) ? radar.items : [];
  const focusItems = Array.isArray(radar.focusItems) ? radar.focusItems : items.slice(0, 12);
  return Object.freeze({ ...radar, items: Object.freeze(items), focusItems: Object.freeze(focusItems) });
}

export function createAuraCarteraFutureRadar017e({
  root,
  client,
  globalState,
  windowRef = window,
  now = () => new Date(),
} = {}) {
  if (!root || !client?.rpc || !client?.auth?.getUser) {
    throw new Error('AURA_CARTERA_017E_CONTEXT_REQUIRED');
  }
  if (typeof now !== 'function') throw new Error('AURA_CARTERA_017E_NOW_PROVIDER_REQUIRED');

  const state = {
    status: 'IDLE',
    radar: null,
    horizon: 'ALL',
    errorCode: null,
    actionableSignalReference: null,
    decisionState: null,
    presentationState: null,
    operationState: null,
  };
  let controls = null;
  let controlsUser = null;
  let observer = null;
  let scheduled = false;
  let destroyed = false;
  let generation = 0;

  function currentHost() {
    return root.querySelector('[data-aura-cartera-radar-017e]');
  }

  function surfaceEligible() {
    return Boolean(root.isConnected && !root.querySelector('.cartera-workspace') && root.querySelector('.cartera-header'));
  }

  function ensureHost() {
    if (!surfaceEligible()) {
      currentHost()?.remove();
      return { host: null, created: false };
    }
    const existing = currentHost();
    if (existing) return { host: existing, created: false };
    const host = root.ownerDocument.createElement('div');
    host.setAttribute('data-aura-cartera-radar-017e', 'true');
    host.setAttribute('aria-live', 'polite');
    const grid = root.querySelector('.cartera-home-grid');
    if (grid) grid.before(host);
    else root.querySelector('.cartera-header')?.after(host);
    return { host, created: true };
  }

  function render() {
    const { host } = ensureHost();
    if (!host) return;
    host.innerHTML = renderCartera050FutureRadar({ ...state });
  }

  function selectedItem() {
    return (state.radar?.items || []).find(isCartera017eActionablePaymentRecommendation) || null;
  }

  function selectedRendered(item) {
    if (!item) return false;
    const host = currentHost();
    return [...(host?.querySelectorAll('[data-radar-signal-reference]') || [])]
      .some(node => node.dataset.radarSignalReference === item.signalReference);
  }

  async function ensureControls() {
    const user = await authenticatedUser(client);
    if (controls && controlsUser === user.id) return controls;
    await controls?.decision?.close?.();
    await controls?.presentation?.close?.();
    controlsUser = user.id;
    controls = Object.freeze({
      user,
      decision: createAuraDecisionControl({ client, user, globalState }),
      presentation: createAuraPresentationEvidenceControl({ client, user }),
    });
    return controls;
  }

  function applyLineage(event, item, userId) {
    if (event?.payload?.decision !== 'ACCEPTED') {
      clearRecommendationDecisionLineage(userId);
      return;
    }
    setRecommendationDecisionLineage({
      advisorId: userId,
      recommendationReference: event.payload.recommendation_reference,
      recommendationVersion: event.payload.recommendation_version,
      decisionEventId: event.event_id,
      decisionOccurredAt: event.occurred_at,
      decision: 'ACCEPTED',
      subjectType: 'POLICY',
      subjectReference: item.policyReference,
      actionOwner: 'CARTERA_030C',
      actionTarget: item.sourceRecordReference,
    });
  }

  async function hydrateActionableRecommendation(expectedGeneration = generation) {
    const item = selectedItem();
    state.actionableSignalReference = item?.signalReference || null;
    state.decisionState = null;
    state.presentationState = null;
    state.operationState = null;
    render();
    if (!item || !selectedRendered(item) || expectedGeneration !== generation || destroyed) return;

    try {
      const api = await ensureControls();
      const model = toCartera017eActionablePaymentRecommendation(item);
      try {
        await api.presentation.present(model, { presentationSurface: 'AURA_CARTERA' });
        if (expectedGeneration !== generation || destroyed) return;
        state.presentationState = 'PERSISTED';
      } catch (error) {
        state.presentationState = 'UNAVAILABLE';
        console.warn('AURA_CARTERA_017E_PRESENTATION_EVIDENCE_FAILED', error?.code || error?.message);
      }
      try {
        await api.decision.read();
        if (expectedGeneration !== generation || destroyed) return;
        const existing = api.decision.latest(model.decisionReference);
        state.decisionState = existing?.payload?.decision || null;
        if (existing) applyLineage(existing, item, api.user.id);
      } catch (error) {
        console.warn('AURA_CARTERA_017E_DECISION_READ_FAILED', error?.code || error?.message);
      }
      render();
    } catch (error) {
      state.presentationState = 'UNAVAILABLE';
      render();
      console.warn('AURA_CARTERA_017E_CONTROL_UNAVAILABLE', error?.code || error?.message);
    }
  }

  async function loadRadar() {
    const requestGeneration = ++generation;
    state.status = 'LOADING';
    state.errorCode = null;
    state.actionableSignalReference = null;
    render();
    try {
      await authenticatedUser(client);
      const result = await client.rpc('forge_cartera050_list_future_radar', {
        p_payload: {
          asOfDate: cartera050CalendarDate(now(), CARTERA050_BUSINESS_TIMEZONE),
          timezone: CARTERA050_BUSINESS_TIMEZONE,
        },
      });
      if (result?.error) throw result.error;
      if (requestGeneration !== generation || destroyed) return;
      state.radar = normalizeRadar(result?.data);
      state.status = 'READY';
      render();
      void hydrateActionableRecommendation(requestGeneration);
    } catch (error) {
      if (requestGeneration !== generation || destroyed) return;
      state.status = 'ERROR';
      state.errorCode = text(error?.code || error?.message || 'CARTERA050_RADAR_FAILED');
      render();
    }
  }

  function navigateToPolicy(reference) {
    const policyReference = text(reference);
    if (!policyReference) return;
    const canonicalRow = [...root.querySelectorAll('[data-directory-reference][data-directory-kind="POLICY"]')]
      .find(node => text(node.dataset.directoryReference) === policyReference);
    if (!canonicalRow) {
      globalState?.('No pudimos abrir esa póliza desde la recomendación.', 'error');
      return;
    }
    canonicalRow.click();
  }

  function handleDecision(button) {
    const item = selectedItem();
    if (!item || button.dataset.radarSignal !== item.signalReference) return;
    const intent = button.dataset.radarDecision;
    state.operationState = 'SAVING';
    render();
    void (async () => {
      try {
        const api = await ensureControls();
        const result = await api.decision.decide(toCartera017eActionablePaymentRecommendation(item), intent);
        state.decisionState = result.event?.payload?.decision || null;
        applyLineage(result.event, item, api.user.id);
      } catch (error) {
        globalState?.('No pudimos guardar la decisión de esta recomendación.', 'error');
        console.warn('AURA_CARTERA_017E_DECISION_FAILED', error?.code || error?.message);
      } finally {
        state.operationState = null;
        render();
      }
    })();
  }

  function onClick(event) {
    const host = currentHost();
    if (!host || !host.contains(event.target)) return;
    const decision = event.target.closest('[data-radar-decision]');
    if (decision) {
      event.preventDefault();
      event.stopImmediatePropagation();
      handleDecision(decision);
      return;
    }
    const policy = event.target.closest('[data-open-policy]');
    if (policy) {
      event.preventDefault();
      event.stopImmediatePropagation();
      navigateToPolicy(policy.dataset.openPolicy);
      return;
    }
    const horizon = event.target.closest('[data-radar-horizon]');
    if (horizon) {
      event.preventDefault();
      state.horizon = horizon.dataset.radarHorizon || 'ALL';
      render();
      void hydrateActionableRecommendation(generation);
      return;
    }
    if (event.target.closest('[data-radar-refresh]')) {
      event.preventDefault();
      void loadRadar();
    }
  }

  function reconcileSurface() {
    scheduled = false;
    if (destroyed) return;
    const { created } = ensureHost();
    if (created && state.status !== 'IDLE') render();
  }

  function scheduleSurface() {
    if (scheduled || destroyed) return;
    scheduled = true;
    queueMicrotask(reconcileSurface);
  }

  function onPaymentConfirmed(event) {
    const item = selectedItem();
    if (!item || text(event?.detail?.policyReference) !== text(item.policyReference)) return;
    void loadRadar();
  }

  function start() {
    root.addEventListener('click', onClick, true);
    windowRef.addEventListener('forge:aura-payment-confirmed', onPaymentConfirmed);
    const Observer = windowRef.MutationObserver || globalThis.MutationObserver;
    if (Observer) {
      observer = new Observer(scheduleSurface);
      observer.observe(root, { childList: true, subtree: true });
    }
  }

  async function stop() {
    generation += 1;
    observer?.disconnect();
    observer = null;
    root.removeEventListener('click', onClick, true);
    windowRef.removeEventListener('forge:aura-payment-confirmed', onPaymentConfirmed);
    currentHost()?.remove();
    clearRecommendationDecisionLineage(controlsUser || undefined);
    await controls?.decision?.close?.();
    await controls?.presentation?.close?.();
    controls = null;
    controlsUser = null;
    state.status = 'IDLE';
    state.radar = null;
    state.horizon = 'ALL';
    state.errorCode = null;
    state.actionableSignalReference = null;
    state.decisionState = null;
    state.presentationState = null;
    state.operationState = null;
  }

  return Object.freeze({
    async mount() {
      destroyed = false;
      start();
      await loadRadar();
    },
    async reload() {
      await loadRadar();
    },
    reconcile: reconcileSurface,
    async scrub() { await stop(); },
    async unmount() { await stop(); },
    async destroy() { destroyed = true; await stop(); },
    diagnostics() {
      return Object.freeze({
        authority: 'CARTERA_050_FUTURE_RADAR',
        pilot: 'UNCONFIRMED_PAYMENT_EVIDENCE',
        actionOwner: 'CARTERA_030C',
        recommendationPresentation: 'RECOMMENDATION_PRESENTED',
        acceptedDoesNotMeanActed: true,
        temporalGuessing: false,
        calendarTimezone: CARTERA050_BUSINESS_TIMEZONE,
      });
    },
  });
}