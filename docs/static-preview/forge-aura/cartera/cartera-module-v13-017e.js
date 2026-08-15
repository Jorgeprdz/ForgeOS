import { createCarteraModule as createLegacyCarteraModule } from './cartera-module-v12-015.js?v=forge-commercial-pilot-evidence-017e-base';
import { createCarteraModule as createReviewCarteraModule } from './cartera-module-hotfix002-entry.js?v=post017e-hotfix002';
import { createAuraCarteraFutureRadar017e } from './cartera-future-radar-017e.js?v=forge-commercial-pilot-evidence-017e-r4';
import { createAuraCarteraFutureRadar002c } from './cartera-radar-presentation-002c.js?v=post017e-hotfix002c-presentation';
import {
  createCarteraClosureAdapter002c,
  createCarteraRadarClient002c,
} from './cartera-live-closure-002c.js?v=post017e-hotfix002c-lineage';
import { CARTERA_PRIMARY_ATTENTION_OWNER_002B } from './cartera-live-closure-002b.js?v=post017e-hotfix002-live-closure-002b';
import { createCarteraPresentationClosure002b } from './cartera-live-presentation-002b.js?v=post017e-hotfix002-live-presentation-002b';

// These imports are direct authority markers preserved from 017E / 002B. 002C wraps
// presentation and exact packet lineage without replacing either authority owner.
void createLegacyCarteraModule;
void createAuraCarteraFutureRadar017e;

export function createCarteraModule(options = {}) {
  const windowRef = options.windowRef || window;
  let sharedAdapterPromise = null;
  const sharedAdapterFactory = async context => {
    if (!sharedAdapterPromise) {
      sharedAdapterPromise = Promise.resolve(
        options.adapterFactory
          ? options.adapterFactory(context)
          : createCarteraClosureAdapter002c(context),
      );
    }
    return sharedAdapterPromise;
  };

  const base = createReviewCarteraModule({ ...options, adapterFactory: sharedAdapterFactory });
  const lazyRadarAdapter = Object.freeze({
    async loadPendingReviewSignals002b(args) {
      const adapter = await sharedAdapterFactory({ client: options.client, windowRef });
      return adapter?.loadPendingReviewSignals002b ? adapter.loadPendingReviewSignals002b(args) : [];
    },
  });
  const radarClient = createCarteraRadarClient002c({ client: options.client, adapter: lazyRadarAdapter });
  const radar = createAuraCarteraFutureRadar002c({
    root: options.root,
    client: radarClient,
    globalState: options.globalState,
    windowRef,
  });
  const presentation = createCarteraPresentationClosure002b({ root: options.root, windowRef });

  return Object.freeze({
    ...base,
    async mount() {
      presentation.start();
      await base.mount?.();
      presentation.reconcile();
      await radar.mount();
      presentation.reconcile();
      radar.reconcile?.();
    },
    async reload() {
      const result = await base.reload?.();
      await radar.reload();
      presentation.reconcile();
      radar.reconcile?.();
      return result;
    },
    async scrub() {
      presentation.stop();
      await radar.scrub();
      return base.scrub?.();
    },
    async unmount() {
      presentation.stop();
      await radar.unmount();
      return base.unmount?.();
    },
    async destroy() {
      presentation.stop();
      await radar.destroy();
      sharedAdapterPromise = null;
      return base.destroy?.();
    },
    diagnostics() {
      return Object.freeze({
        base: base.diagnostics?.() || null,
        recommendationPilot: radar.diagnostics(),
        documentReviewHotfix: 'POST_017E_HOTFIX_002',
        liveAcceptanceClosure: 'POST_017E_HOTFIX_002C_REAL_USER_DEX_TRUTH_PRESENTATION',
        primaryAttentionOwner: CARTERA_PRIMARY_ATTENTION_OWNER_002B,
        membershipQualification: 'CONFIRMED_OR_CORRECTED_CARTERA_RELATIONSHIP',
        presentationReconciliation: 'IDEMPOTENT_MUTATION_OBSERVER',
        rawInternalReferenceUserVisible: false,
        exactPacketLineageDeduplication: true,
        documentVsPolicySemantics: 'DISTINCT',
      });
    },
  });
}
