const SPANISH_MONTHS = Object.freeze({
  ENE: 1,
  FEB: 2,
  MAR: 3,
  ABR: 4,
  MAY: 5,
  JUN: 6,
  JUL: 7,
  AGO: 8,
  SEP: 9,
  SEPT: 9,
  OCT: 10,
  NOV: 11,
  DIC: 12,
});

function pad2(value) {
  return String(value).padStart(2, '0');
}

function validIsoParts(year, month, day) {
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) return null;
  if (year < 1900 || year > 2200 || month < 1 || month > 12 || day < 1 || day > 31) return null;
  const stamp = new Date(Date.UTC(year, month - 1, day));
  if (stamp.getUTCFullYear() !== year || stamp.getUTCMonth() !== month - 1 || stamp.getUTCDate() !== day) return null;
  return `${year}-${pad2(month)}-${pad2(day)}`;
}

export function normalizePolicyDate(value) {
  if (value === null || value === undefined || value === '') return null;
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return null;
    return validIsoParts(value.getUTCFullYear(), value.getUTCMonth() + 1, value.getUTCDate());
  }

  const raw = String(value).trim();
  if (!raw) return null;

  let match = raw.match(/^(\d{4})-(\d{2})-(\d{2})(?:[T\s].*)?$/);
  if (match) return validIsoParts(Number(match[1]), Number(match[2]), Number(match[3]));

  match = raw.toUpperCase().replace(/\./g, '').match(/^(\d{1,2})[\/-]([A-ZÁÉÍÓÚÑ]{3,4})[\/-](\d{4})$/);
  if (match) {
    const month = SPANISH_MONTHS[match[2]];
    if (month) return validIsoParts(Number(match[3]), month, Number(match[1]));
  }

  match = raw.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/);
  if (match) return validIsoParts(Number(match[3]), Number(match[2]), Number(match[1]));

  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return null;
  return validIsoParts(parsed.getUTCFullYear(), parsed.getUTCMonth() + 1, parsed.getUTCDate());
}

export function sanitizePdfCandidateDates(candidate) {
  if (!candidate || typeof candidate !== 'object') return candidate;
  return Object.freeze({
    ...candidate,
    effectiveDate: normalizePolicyDate(candidate.effectiveDate),
    expirationDate: normalizePolicyDate(candidate.expirationDate),
  });
}

export function sanitizePdfPayloadDates(payload) {
  if (!payload || typeof payload !== 'object' || !Array.isArray(payload.candidates)) return payload;
  return Object.freeze({
    ...payload,
    candidates: Object.freeze(payload.candidates.map(sanitizePdfCandidateDates)),
  });
}

export function sanitizePdfReviewDates(review) {
  if (!review || typeof review !== 'object') return review;
  return Object.freeze({
    ...review,
    edgeCandidate: sanitizePdfCandidateDates(review.edgeCandidate),
  });
}
