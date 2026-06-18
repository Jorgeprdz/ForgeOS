import { REQUIRED_TRUTH_ENVELOPE_FIELDS } from '../contracts/truth-envelope-required-fields.js';
import { createFail, createPass } from './validator-result.js';

const VALIDATOR_ID = 'truth-envelope-required-fields-validator';

function isMissingField(envelope, field) {
  return !Object.prototype.hasOwnProperty.call(envelope, field) || envelope[field] === undefined || envelope[field] === null;
}

export function validateTruthEnvelopeRequiredFields(envelope) {
  if (!envelope || typeof envelope !== 'object' || Array.isArray(envelope)) {
    return createFail(VALIDATOR_ID, 'TruthEnvelope must be an object.', {
      evidence: ['TRUTH_BOUNDARY_002_TRUTH_TYPE_CONTRACT.md'],
    });
  }

  const missingFields = REQUIRED_TRUTH_ENVELOPE_FIELDS.filter((field) => isMissingField(envelope, field));

  if (missingFields.length > 0) {
    return createFail(VALIDATOR_ID, `TruthEnvelope is missing required fields: ${missingFields.join(', ')}.`, {
      evidence: missingFields,
    });
  }

  return createPass(VALIDATOR_ID, 'TruthEnvelope includes all PHASE A required fields.', {
    evidence: REQUIRED_TRUTH_ENVELOPE_FIELDS,
    relatedTruthType: envelope.truthType,
    relatedEvidenceState: envelope.evidenceState,
    relatedOwnerType: envelope.owner?.type ?? null,
  });
}
