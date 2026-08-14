import { createCarteraModule as createLegacyCarteraModule } from './cartera-module-v12-015.js?v=forge-commercial-pilot-evidence-017e-base';
import { createCarteraModule as createReviewCarteraModule } from './cartera-module-hotfix002-entry.js?v=post017e-hotfix002';
import { createAuraCarteraFutureRadar017e } from './cartera-future-radar-017e.js?v=forge-commercial-pilot-evidence-017e-r4';

// createLegacyCarteraModule remains the direct 017E base authority marker; Hotfix002
// delegates to the same v12 base and only adds the governed 020C review surface.
void createLegacyCarteraModule;

export function createCarteraModule(options = {}) {
  const base = createReviewCarteraModule(options);
  const radar = createAuraCarteraFutureRadar017e({
    root: options.root,
    client: options.client,
    globalState: options.globalState,
    windowRef: options.windowRef || window,
  });

  return Object.freeze({
    ...base,
    async mount() {
      await base.mount?.();
      await radar.mount();
    },
    async reload() {
      const result = await base.reload?.();
      await radar.reload();
      return result;
    },
    async scrub() {
      await radar.scrub();
      return base.scrub?.();
    },
    async unmount() {
      await radar.unmount();
      return base.unmount?.();
    },
    async destroy() {
      await radar.destroy();
      return base.destroy?.();
    },
    diagnostics() {
      return Object.freeze({
        base: base.diagnostics?.() || null,
        recommendationPilot: radar.diagnostics(),
        documentReviewHotfix: 'POST_017E_HOTFIX_002',
      });
    },
  });
}