export const EVIDENCE_STATES = Object.freeze({
  MISSING: 'MISSING',
  UNVERIFIED: 'UNVERIFIED',
  EXTRACTED: 'EXTRACTED',
  VALIDATED: 'VALIDATED',
  CONFLICTING: 'CONFLICTING',
  STALE: 'STALE',
  MANUAL: 'MANUAL',
  OFFICIAL: 'OFFICIAL',
  DEPRECATED: 'DEPRECATED',
  BLOCKED: 'BLOCKED',
});

export const KNOWN_EVIDENCE_STATES = Object.freeze(Object.values(EVIDENCE_STATES));

export function isKnownEvidenceState(evidenceState) {
  return KNOWN_EVIDENCE_STATES.includes(evidenceState);
}
