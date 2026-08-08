import {
  createCarteraAdapter as createGuardedAdapter,
  normalizeReviewDate,
  sanitizePdfReview,
} from './cartera-adapter-pages-v5.js?base=aura-cartera-invalid-time-value-root-009';

const PDF_FUNCTION_NAME = 'cartera-pdf-intake';

function bindValue(target, property) {
  const value = Reflect.get(target, property, target);
  return typeof value === 'function' ? value.bind(target) : value;
}

export function sanitizePdfCandidate(candidate) {
  if (!candidate || typeof candidate !== 'object') return candidate;
  return Object.freeze({
    ...candidate,
    effectiveDate: normalizeReviewDate(candidate.effectiveDate),
    expirationDate: normalizeReviewDate(candidate.expirationDate),
  });
}

export function sanitizePdfPayload(payload) {
  if (!payload || typeof payload !== 'object' || !Array.isArray(payload.candidates)) return payload;
  return Object.freeze({
    ...payload,
    candidates: Object.freeze(payload.candidates.map(sanitizePdfCandidate)),
  });
}

function clientWithSanitizedPdfExtraction(client) {
  const functions = new Proxy(client.functions, {
    get(target, property) {
      if (property !== 'invoke') return bindValue(target, property);
      return async (name, options = {}) => {
        const result = await target.invoke(name, options);
        if (name !== PDF_FUNCTION_NAME || result?.error || !result?.data) return result;
        return {
          ...result,
          data: sanitizePdfPayload(result.data),
        };
      };
    },
  });

  return new Proxy(client, {
    get(target, property) {
      if (property === 'functions') return functions;
      return bindValue(target, property);
    },
  });
}

export async function createCarteraAdapter({ client, windowRef = window } = {}) {
  if (!client) throw new Error('CARTERA_PRODUCTIVE_CLIENT_REQUIRED');
  const adapter = await createGuardedAdapter({
    client: clientWithSanitizedPdfExtraction(client),
    windowRef,
  });

  return Object.freeze({
    ...adapter,
    async processPdf(file, options = {}) {
      const review = await adapter.processPdf(file, options);
      return sanitizePdfReview(review);
    },
  });
}
