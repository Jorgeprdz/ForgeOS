import { createHomeModule as createBaseHomeModule } from "./home-module.js";

const WRAPPER_ID = "FORGE_GLOBAL_AURA_HOME_CONTEXT_BRIDGE_008";

function decisionContext(root, trigger) {
  const card = trigger?.closest?.("[data-decision-reference]");
  if (!card) return null;
  const shell = root.querySelector("[data-home-attention-contract]") || root.firstElementChild;
  return Object.freeze({
    source: card.dataset.homeBriefingSource || "FORGE_HOME_ATTENTION_ORCHESTRATION_007",
    contract: shell?.dataset?.homeAttentionContract || "FHAO-007-001",
    decisionReference: card.dataset.decisionReference || null,
    sourceReference: card.dataset.decisionReference || null,
  });
}

export function createHomeModule(options = {}) {
  const { root, onNavigate } = options;
  if (!root) throw new Error("AURA_HOME_ROOT_REQUIRED");

  const events = new AbortController();
  let bound = false;
  const base = createBaseHomeModule({
    ...options,
    onNavigate,
  });

  function bindDecisionContinuity() {
    if (bound) return;
    bound = true;
    root.addEventListener("click", event => {
      const routeNode = event.target.closest("[data-home-route]");
      if (!routeNode) return;
      const context = decisionContext(root, routeNode);
      if (!context) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      onNavigate?.(routeNode.dataset.homeRoute, context);
    }, { capture: true, signal: events.signal });
  }

  return Object.freeze({
    async mount() {
      bindDecisionContinuity();
      await base.mount();
      root.dataset.auraHomeContextBridge = WRAPPER_ID;
    },
    async unmount() {
      await base.unmount?.();
    },
    async scrub(reason = "session-scrub") {
      await base.scrub?.(reason);
    },
    async destroy() {
      events.abort();
      await base.destroy?.();
    },
    diagnostics() {
      return Object.freeze({
        wrapperId: WRAPPER_ID,
        decisionContextTransport: true,
        domainWrites: 0,
        base: base.diagnostics?.() || null,
      });
    },
  });
}

export { WRAPPER_ID };
