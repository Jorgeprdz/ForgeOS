import { createCarteraModule as createBaseCarteraModule } from './cartera-module-v9.js?v=forge-beta2-013-policy-evidence-presentation-base';
import {
  CONTRACT_ID as PRESENTATION_ID,
  reconcilePolicyEvidencePresentation,
} from './cartera-policy-evidence-presentation-013.js?v=forge-beta2-013-policy-evidence-presentation';

export function createCarteraModule(options = {}) {
  const { root, windowRef = window } = options;
  if (!root) throw new Error('AURA_CARTERA_ROOT_REQUIRED');
  const base = createBaseCarteraModule(options);
  let observer = null;
  let scheduled = false;
  let destroyed = false;

  function reconcile() {
    scheduled = false;
    if (destroyed || !root.isConnected) return;
    reconcilePolicyEvidencePresentation(root);
  }

  function schedule() {
    if (scheduled || destroyed) return;
    scheduled = true;
    queueMicrotask(reconcile);
  }

  function start() {
    if (observer) return;
    const Observer = windowRef.MutationObserver || globalThis.MutationObserver;
    if (!Observer) return;
    observer = new Observer(schedule);
    observer.observe(root, { childList: true, subtree: true });
  }

  function stop() {
    observer?.disconnect();
    observer = null;
    scheduled = false;
  }

  return Object.freeze({
    ...base,
    async mount() {
      destroyed = false;
      await base.mount?.();
      start();
      reconcile();
    },
    async reload() {
      const result = await base.reload?.();
      reconcile();
      return result;
    },
    async scrub() {
      stop();
      return base.scrub?.();
    },
    async unmount() {
      stop();
      return base.unmount?.();
    },
    async destroy() {
      destroyed = true;
      stop();
      return base.destroy?.();
    },
  });
}

export { PRESENTATION_ID, reconcilePolicyEvidencePresentation };
