// CARTERA 020C compatibility reconciliation for 020B packet candidate groups.
// 020B stores Person and Account proposals in one identity_candidates JSON array.

import { createCartera020cReviewReadModel as createBaseReviewReadModel } from './cartera-020c-review-read-model.js';

function isRecord(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function candidateType(candidate = {}) {
  return String(candidate.candidateType || candidate.candidate_type || '').toUpperCase();
}

export function partitionCartera020cIdentityCandidates(packetRow = {}) {
  if (!isRecord(packetRow)) throw new TypeError('CARTERA020C_PACKET_ROW_REQUIRED');
  const candidates = Array.isArray(packetRow.identity_candidates)
    ? packetRow.identity_candidates
    : [];
  const identityCandidates = [];
  const accountCandidates = [];

  for (const candidate of candidates) {
    if (!isRecord(candidate)) throw new TypeError('CARTERA020C_PACKET_CANDIDATE_INVALID');
    if (candidateType(candidate).includes('ACCOUNT')) accountCandidates.push(candidate);
    else identityCandidates.push(candidate);
  }

  return Object.freeze({
    identityCandidates: Object.freeze([...identityCandidates]),
    accountCandidates: Object.freeze([...accountCandidates]),
  });
}

export function createCartera020cReviewReadModel(args = {}) {
  const groups = partitionCartera020cIdentityCandidates(args.packetRow);
  return createBaseReviewReadModel({
    ...args,
    packetRow: {
      ...args.packetRow,
      identity_candidates: groups.identityCandidates,
      account_candidates: groups.accountCandidates,
    },
  });
}
