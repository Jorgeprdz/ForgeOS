import { createCarteraModule as createBaseCarteraModule } from './cartera-module.js?base=aura-cartera-review-date-ui-008';
import {
  createCarteraAdapter as createGuardedCarteraAdapter,
  sanitizePdfReview,
} from './cartera-adapter-pages-v5.js?base=aura-cartera-review-date-ui-008';

async function createReviewSafeAdapter(options = {}) {
  const adapter = await createGuardedCarteraAdapter(options);
  return Object.freeze({
    ...adapter,
    async processPdf(file, processOptions = {}) {
      const review = await adapter.processPdf(file, processOptions);
      return sanitizePdfReview(review);
    },
  });
}

export function createCarteraModule(options = {}) {
  return createBaseCarteraModule({
    ...options,
    adapterFactory: createReviewSafeAdapter,
  });
}
