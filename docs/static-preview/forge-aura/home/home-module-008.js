import { createHomeModule as createBaseHomeModule } from './home-module.js';
import {
  CONTRACT_ID as PRESENTATION_ID,
  homePresentationDiagnostics,
  normalizeHomePresentation,
} from './home-human-presentation-013.js?v=forge-beta2-013-human-context';

const WRAPPER_ID = 'FORGE_GLOBAL_AURA_HOME_CONTEXT_BRIDGE_008';

function decisionContext(root, trigger) {
  const card = trigger?.closest?.('[data-decision-reference]');
  if (!card) return null;
  const shell = root.querySelector('[data-home-attention-contract]') || root.firstElementChild;
  return Object.freeze({
    source: card.dataset.homeBriefingSource || 'FORGE_HOME_ATTENTION_ORCHESTRATION_007',
    contract: shell?.dataset?.homeAttentionContract || 'FHAO-007-001',
    decisionReference: card.dataset.decisionReference || null,
    sourceReference: card.dataset.decisionReference || null,
  });
}

export function createHomeModule(options = {}) {
  const { root, onNavigate } = options;
  if (!root) throw new Error('AURA_HOME_ROOT_REQUIRED');

  const events = new AbortController();
  let bound = false;
  let observer = null;
  let scheduled = false;
  let destroyed = false;
  const base = createBaseHomeModule({ ...options, onNavigate });

  function bindDecisionContinuity() {
    if (bound) return;
    bound = true;
    root.addEventListener('click', event => {
      const routeNode = event.target.closest('[data-home-route]');
      if (!routeNode) return;
      const context = decisionContext(root, routeNode);
      if (!context) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      onNavigate?.(routeNode.dataset.homeRoute, context);
    }, { capture: true, signal: events.signal });
  }

  function normalizeScheduled() {
    scheduled = false;
    if (!destroyed) normalizeHomePresentation(root);
  }

  function scheduleNormalize() {
    if (scheduled || destroyed) return;
    scheduled = true;
    queueMicrotask(normalizeScheduled);
  }

  function startObserver() {
    if (observer) return;
    const Observer = root.ownerDocument.defaultView?.MutationObserver || globalThis.MutationObserver;
    if (!Observer) return;
    observer = new Observer(scheduleNormalize);
    observer.observe(root, { childList: true, subtree: true });
  }

  function stopObserver() {
    observer?.disconnect();
    observer = null;
    scheduled = false;
  }

  return Object.freeze({
    async mount() {
      destroyed = false;
      bindDecisionContinuity();
      await base.mount();
      normalizeHomePresentation(root);
      startObserver();
      root.dataset.auraHomeContextBridge = WRAPPER_ID;
    },
    async reload() {
      const result = await base.reload?.();
      normalizeHomePresentation(root);
      return result;
    },
    async unmount() {
      stopObserver();
      await base.unmount?.();
    },
    async scrub(reason = 'session-scrub') {
      stopObserver();
      await base.scrub?.(reason);
    },
    async destroy() {
      destroyed = true;
      stopObserver();
      events.abort();
      await base.destroy?.();
    },
    diagnostics() {
      return Object.freeze({
        wrapperId: WRAPPER_ID,
        presentationId: PRESENTATION_ID,
        decisionContextTransport: true,
        domainWrites: 0,
        presentation: homePresentationDiagnostics(),
        base: base.diagnostics?.() || null,
      });
    },
  });
}

export { WRAPPER_ID, PRESENTATION_ID, normalizeHomePresentation };
