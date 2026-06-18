import { EVIDENCE_STATES } from '../contracts/evidence-states.js';
import { TRUTH_TYPES, isKnownTruthType } from '../contracts/truth-types.js';
import { createBlock, createFail, createPass } from './validator-result.js';

const VALIDATOR_ID = 'truth-type-compatibility-validator';

function hasOfficialProvenance(envelope) {
  return Boolean(
    envelope?.provenance?.official === true ||
    envelope?.source?.official === true ||
    envelope?.source?.type === 'official_document' ||
    envelope?.source?.type === 'carrier_document' ||
    envelope?.source?.type === 'policy_document' ||
    envelope?.owner?.type === 'official_document' ||
    envelope?.owner?.type === 'carrier_document' ||
    envelope?.owner?.type === 'policy_document',
  );
}

function validationSupportsSourceTruth(envelope) {
  return envelope?.validationStatus === 'valid_for_source_truth' || envelope?.validationStatus === 'VALIDATED';
}

export function validateTruthTypeCompatibility(envelope = {}, options = {}) {
  const truthType = options.targetTruthType ?? envelope.truthType;
  const evidenceState = options.evidenceState ?? envelope.evidenceState;
  const requestedUse = options.requestedUse;

  if (!isKnownTruthType(truthType)) {
    return createFail(VALIDATOR_ID, `Unknown truthType: ${truthType}.`, {
      evidence: [truthType],
      relatedTruthType: truthType ?? null,
    });
  }

  if (truthType === TRUTH_TYPES.FACT && ![EVIDENCE_STATES.VALIDATED, EVIDENCE_STATES.OFFICIAL].includes(evidenceState)) {
    return createBlock(VALIDATOR_ID, 'FACT requires VALIDATED or OFFICIAL evidenceState.', {
      blockedTransition: `${evidenceState} -> FACT`,
      relatedTruthType: truthType,
      relatedEvidenceState: evidenceState,
    });
  }

  if (truthType === TRUTH_TYPES.SOURCE_TRUTH) {
    const supportedState = [EVIDENCE_STATES.VALIDATED, EVIDENCE_STATES.OFFICIAL].includes(evidenceState);
    if (!supportedState || !hasOfficialProvenance(envelope) || !validationSupportsSourceTruth(envelope)) {
      return createBlock(VALIDATOR_ID, 'SOURCE_TRUTH requires OFFICIAL or VALIDATED evidence with official provenance.', {
        blockedTransition: `${evidenceState} -> SOURCE_TRUTH`,
        relatedTruthType: truthType,
        relatedEvidenceState: evidenceState,
      });
    }
  }

  if (envelope.truthType === TRUTH_TYPES.AI_INTERPRETATION && truthType === TRUTH_TYPES.FACT) {
    return createBlock(VALIDATOR_ID, 'AI_INTERPRETATION cannot be FACT.', {
      blockedTransition: 'AI_INTERPRETATION -> FACT',
      relatedTruthType: envelope.truthType,
      relatedEvidenceState: evidenceState,
    });
  }

  if (envelope.truthType === TRUTH_TYPES.FORECAST && truthType === TRUTH_TYPES.FACT) {
    return createBlock(VALIDATOR_ID, 'FORECAST cannot be FACT.', {
      blockedTransition: 'FORECAST -> FACT',
      relatedTruthType: envelope.truthType,
      relatedEvidenceState: evidenceState,
      relatedADR: ['ADR-007'],
    });
  }

  if (envelope.truthType === TRUTH_TYPES.ASSUMPTION && truthType === TRUTH_TYPES.FACT) {
    return createBlock(VALIDATOR_ID, 'ASSUMPTION cannot be FACT.', {
      blockedTransition: 'ASSUMPTION -> FACT',
      relatedTruthType: envelope.truthType,
      relatedEvidenceState: evidenceState,
    });
  }

  if (envelope.truthType === TRUTH_TYPES.USER_INPUT && truthType === TRUTH_TYPES.SOURCE_TRUTH && !validationSupportsSourceTruth(envelope)) {
    return createBlock(VALIDATOR_ID, 'USER_INPUT cannot become SOURCE_TRUTH without validation.', {
      blockedTransition: 'USER_INPUT -> SOURCE_TRUTH',
      relatedTruthType: envelope.truthType,
      relatedEvidenceState: evidenceState,
    });
  }

  if (truthType === TRUTH_TYPES.RECOMMENDATION && requestedUse === 'state_mutation') {
    return createBlock(VALIDATOR_ID, 'RECOMMENDATION cannot mutate state directly.', {
      blockedTransition: 'RECOMMENDATION -> state_mutation',
      relatedTruthType: truthType,
      relatedEvidenceState: evidenceState,
    });
  }

  if (truthType === TRUTH_TYPES.UNKNOWN && requestedUse === 'state_mutation') {
    return createBlock(VALIDATOR_ID, 'UNKNOWN must not drive mutation.', {
      blockedTransition: 'UNKNOWN -> state_mutation',
      relatedTruthType: truthType,
      relatedEvidenceState: evidenceState,
    });
  }

  return createPass(VALIDATOR_ID, 'truthType is compatible with PHASE A rules.', {
    evidence: ['TRUTH_BOUNDARY_002_TRUTH_TYPE_CONTRACT.md'],
    relatedTruthType: truthType,
    relatedEvidenceState: evidenceState,
  });
}
