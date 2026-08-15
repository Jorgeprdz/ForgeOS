import { createCarteraModule as createLegacyCarteraModule } from './cartera-module-v12-015.js?v=forge-commercial-pilot-evidence-017e-base';
import { createCarteraModule as createReviewCarteraModule } from './cartera-module-hotfix002-entry.js?v=post017e-hotfix002';
import { createAuraCarteraFutureRadar002c } from './cartera-radar-presentation-002c.js?v=post017e-hotfix002c-presentation';
import {
  createCarteraClosureAdapter002c,
  createCarteraRadarClient002c,
  CARTERA_PRIMARY_ATTENTION_OWNER_002C,
} from './cartera-live-closure-002c.js?v=post017e-hotfix002c-lineage';
import { createCarteraPresentationClosure002b } from './cartera-live-presentation-002b.js?v=post017e-hotfix002-live-presentation-002b';

// createLegacyCarteraModule remains the direct 017E base authority marker; Hotfix002
// delegates to the same v12 base and only adds the governed 020C review surface.
void createLegacyCarteraModule;

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
        primaryAttentionOwner: CARTERA_PRIMARY_ATTENTION_OWNER_002C,
        membershipQualification: 'CONFIRMED_OR_CORRECTED_CARTERA_RELATIONSHIP',
        presentationReconciliation: 'IDEMPOTENT_MUTATION_OBSERVER',
        rawInternalReferenceUserVisible: false,
        exactPacketLineageDeduplication: true,
        documentVsPolicySemantics: 'DISTINCT',
      });
    },
  });
}
