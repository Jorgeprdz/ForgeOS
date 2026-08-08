import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeReviewDate, sanitizePdfReview } from '../docs/static-preview/forge-aura/cartera/cartera-adapter-pages-v5.js';

test('malformed extracted dates become unknown instead of throwing Invalid time value', () => {
  assert.equal(normalizeReviewDate('Vigencia anual'), null);
  assert.equal(normalizeReviewDate('fecha no identificada'), null);
  assert.equal(normalizeReviewDate(''), null);
  assert.equal(normalizeReviewDate(null), null);
});

test('valid extracted dates are normalized for native date inputs', () => {
  assert.equal(normalizeReviewDate('2026-08-08'), '2026-08-08');
  assert.equal(normalizeReviewDate('2027-08-08T00:00:00.000Z'), '2027-08-08');
});

test('review sanitization changes only presentation dates and preserves raw evidence fields', () => {
  const review = {
    edgeCandidate: {
      person: 'Persona de prueba',
      effectiveDate: 'Vigencia anual',
      expirationDate: '2027-08-08',
    },
    fields: {
      effectiveFrom: { value: 'Vigencia anual', state: 'EXTRACTED' },
      effectiveTo: { value: '2027-08-08', state: 'EXTRACTED' },
    },
  };

  const sanitized = sanitizePdfReview(review);

  assert.equal(sanitized.edgeCandidate.effectiveDate, null);
  assert.equal(sanitized.edgeCandidate.expirationDate, '2027-08-08');
  assert.equal(sanitized.fields.effectiveFrom.value, 'Vigencia anual');
  assert.equal(sanitized.fields.effectiveTo.value, '2027-08-08');
  assert.equal(review.edgeCandidate.effectiveDate, 'Vigencia anual');
});
