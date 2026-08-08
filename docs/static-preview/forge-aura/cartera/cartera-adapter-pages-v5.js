import { createCarteraAdapter as createStateMachineAdapter } from './cartera-adapter-pages-v4.js?base=aura-cartera-invalid-date-review-007';

export function normalizeReviewDate(value) {
  if (value === null || value === undefined || value === '') return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString().slice(0, 10);
}

export function sanitizePdfReview(review) {
  if (!review || typeof review !== 'object' || !review.edgeCandidate || typeof review.edgeCandidate !== 'object') {
    return review;
  }

  return Object.freeze({
    ...review,
    edgeCandidate: Object.freeze({
      ...review.edgeCandidate,
      effectiveDate: normalizeReviewDate(review.edgeCandidate.effectiveDate),
      expirationDate: normalizeReviewDate(review.edgeCandidate.expirationDate),
    }),
  });
}

export async function createCarteraAdapter({ client, windowRef = window } = {}) {
  const adapter = await createStateMachineAdapter({ client, windowRef });

  return Object.freeze({
    ...adapter,
    async processPdf(file, options = {}) {
      const review = await adapter.processPdf(file, options);
      return sanitizePdfReview(review);
    },
  });
}
