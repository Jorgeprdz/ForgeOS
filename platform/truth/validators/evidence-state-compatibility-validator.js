import { EVIDENCE_STATES, isKnownEvidenceState } from '../contracts/evidence-states.js';
import { TRUTH_TYPES } from '../contracts/truth-types.js';
import { OWNER_TYPES } from '../contracts/owner-types.js';
import { createBlock, createDegrade, createFail, createPass } from './validator-result.js';

const VALIDATOR_ID = 'evidence-state-compatibility-validator';

function hasDisclosure(envelope) {
  return Boolean(envelope?.disclosure === true || envelope?.assumptions?.length > 0 || envelope?.unknowns?.length > 0);
}

function hasKnownOwnerAndProvenance(envelope) {
  return Boolean(envelope?.owner?.type && envelope.owner.type !== OWNER_TYPES.UNKNOWN_OWNER && envelope?.provenance);
}

export function validateEvidenceStateCompatibility(envelope = {}, options = {}) {
  const evidenceState = options.evidenceState ?? envelope.evidenceState;
  const truthType = options.targetTruthType ?? envelope.truthType;
  const requestedUse = options.requestedUse;

  if (!isKnownEvidenceState(evidenceState)) {
    return createFail(VALIDATOR_ID, `Unknown evidenceState: ${evidenceState}.`, {
      evidence: [evidenceState],
      relatedTruthType: truthType ?? null,
      relatedEvidenceState: evidenceState ?? null,
    });
  }

  if (evidenceState === EVIDENCE_STATES.UNVERIFIED && truthType === TRUTH_TYPES.FACT) {
    return createBlock(VALIDATOR_ID, 'UNVERIFIED cannot become FACT.', {
      blockedTransition: 'UNVERIFIED -> FACT',
      relatedTruthType: truthType,
      relatedEvidenceState: evidenceState,
    });
  }

  if (evidenceState === EVIDENCE_STATES.EXTRACTED && truthType === TRUTH_TYPES.SOURCE_TRUTH) {
    return createBlock(VALIDATOR_ID, 'EXTRACTED cannot become SOURCE_TRUTH.', {
      blockedTransition: 'EXTRACTED -> SOURCE_TRUTH',
      relatedTruthType: truthType,
      relatedEvidenceState: evidenceState,
    });
  }

  if (evidenceState === EVIDENCE_STATES.CONFLICTING && requestedUse === 'state_mutation') {
    return createBlock(VALIDATOR_ID, 'CONFLICTING cannot support state_mutation.', {
      blockedTransition: 'CONFLICTING -> state_mutation',
      relatedTruthType: truthType,
      relatedEvidenceState: evidenceState,
    });
  }

  if (evidenceState === EVIDENCE_STATES.STALE && requestedUse === 'recommendation_input' && !hasDisclosure(envelope)) {
    return createBlock(VALIDATOR_ID, 'STALE cannot support recommendation_input without disclosure.', {
      blockedTransition: 'STALE -> recommendation_input',
      relatedTruthType: truthType,
      relatedEvidenceState: evidenceState,
    });
  }

  if (evidenceState === EVIDENCE_STATES.BLOCKED && requestedUse && requestedUse !== 'audit_only') {
    return createBlock(VALIDATOR_ID, 'BLOCKED cannot support active use.', {
      blockedTransition: `BLOCKED -> ${requestedUse}`,
      relatedTruthType: truthType,
      relatedEvidenceState: evidenceState,
    });
  }

  if (evidenceState === EVIDENCE_STATES.DEPRECATED && requestedUse === 'recommendation_input' && !hasDisclosure(envelope)) {
    return createDegrade(VALIDATOR_ID, 'DEPRECATED cannot support active recommendation without disclosure.', {
      blockedTransition: 'DEPRECATED -> recommendation_input',
      relatedTruthType: truthType,
      relatedEvidenceState: evidenceState,
    });
  }

  if (evidenceState === EVIDENCE_STATES.OFFICIAL && !hasKnownOwnerAndProvenance(envelope)) {
    return createBlock(VALIDATOR_ID, 'OFFICIAL must have non-unknown owner and provenance.', {
      blockedTransition: 'OFFICIAL without owner/provenance',
      relatedTruthType: truthType,
      relatedEvidenceState: evidenceState,
      relatedOwnerType: envelope?.owner?.type ?? null,
    });
  }

  return createPass(VALIDATOR_ID, 'evidenceState is compatible with PHASE A rules.', {
    evidence: ['EVIDENCE_STATE_CONTRACT_001.md'],
    relatedTruthType: truthType,
    relatedEvidenceState: evidenceState,
    relatedOwnerType: envelope?.owner?.type ?? null,
  });
}
