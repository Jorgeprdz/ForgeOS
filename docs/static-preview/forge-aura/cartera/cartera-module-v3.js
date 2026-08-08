import { createCarteraModule as createBaseCarteraModule } from './cartera-module.js?base=aura-cartera-invalid-time-value-root-009';
import { createCarteraAdapter as createRootSafeCarteraAdapter } from './cartera-adapter-pages-v6.js?base=aura-cartera-invalid-time-value-root-009';

export function createCarteraModule(options = {}) {
  return createBaseCarteraModule({
    ...options,
    adapterFactory: createRootSafeCarteraAdapter,
  });
}
