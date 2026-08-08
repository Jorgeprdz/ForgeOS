import { createCarteraModule as createBaseCarteraModule } from './cartera-module.js?base=aura-cartera-pdf-real-acceptance-root-010';
import { createCarteraAdapter as createRootSafeCarteraAdapter } from './cartera-adapter-pages-v6.js?base=aura-cartera-pdf-real-acceptance-root-010';
import { sanitizePdfReviewDates } from './cartera-date-v1.js?v=aura-cartera-pdf-real-acceptance-root-010';

function guardedAdapterFactory(factory) {
  return async options => {
    const adapter = await factory(options);
    if (!adapter || typeof adapter.processPdf !== 'function') return adapter;
    return Object.freeze({
      ...adapter,
      async processPdf(file, processOptions = {}) {
        const review = await adapter.processPdf(file, processOptions);
        return sanitizePdfReviewDates(review);
      },
    });
  };
}

export function createCarteraModule(options = {}) {
  const adapterFactory = options.adapterFactory || createRootSafeCarteraAdapter;
  return createBaseCarteraModule({
    ...options,
    adapterFactory: guardedAdapterFactory(adapterFactory),
  });
}
