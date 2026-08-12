import { createCarteraModule as createBaseCarteraModule } from './cartera-module-v12-015.js?v=forge-commercial-pilot-evidence-017e-base';
import { createAuraCarteraFutureRadar017e } from './cartera-future-radar-017e.js?v=forge-commercial-pilot-evidence-017e-r4';

export function createCarteraModule(options = {}) {
  const base = createBaseCarteraModule(options);
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
      });
    },
  });
}
