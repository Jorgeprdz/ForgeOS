import {
  EXTRACTED_POLICY_FIELD_STATES,
  POLICY_EVIDENCE_STATES,
  createExtractedPolicyField,
  createPolicyEvidencePacket,
} from '../evidence/policy-evidence-packet.js';
import { INTAKE_FIELD_STATES } from './cartera-020b-intake-contracts.js';

const FIELD_STATE_MAP = Object.freeze({
  [INTAKE_FIELD_STATES.EXTRACTED]: EXTRACTED_POLICY_FIELD_STATES.EXTRACTED,
  [INTAKE_FIELD_STATES.UNKNOWN]: EXTRACTED_POLICY_FIELD_STATES.UNKNOWN,
  [INTAKE_FIELD_STATES.MISSING]: EXTRACTED_POLICY_FIELD_STATES.UNKNOWN,
  [INTAKE_FIELD_STATES.CONFLICT]: EXTRACTED_POLICY_FIELD_STATES.EXTRACTED,
});

export function createPendingPolicyPacketFromCandidates({
  packetReference,
  documentReference,
  documentType,
  fieldCandidates = [],
  extractionConfidence = null,
  warnings = [],
  uploadedAt = Date.now(),
} = {}) {
  if (!packetReference || !documentReference) throw new TypeError('packet_and_document_reference_required');
  if (!Array.isArray(fieldCandidates)) throw new TypeError('field_candidates_must_be_array');

  const extractedFields = {};
  for (const candidate of fieldCandidates) {
    if (!candidate || candidate.createsTruth !== false) throw new TypeError('invalid_field_candidate');
    if (Object.hasOwn(extractedFields, candidate.fieldName)) throw new TypeError(`duplicate_field_candidate:${candidate.fieldName}`);
    extractedFields[candidate.fieldName] = createExtractedPolicyField({
      fieldName: candidate.fieldName,
      value: candidate.normalizedValue,
      confidence: candidate.confidence,
      sourceLocation: candidate.sourceLocation,
      extractionMethod: `${candidate.extractionMethod}:${candidate.parserId}@${candidate.parserVersion}`,
      state: FIELD_STATE_MAP[candidate.state],
    });
  }

  const packet = createPolicyEvidencePacket({
    evidenceId: packetReference,
    documentRef: documentReference,
    documentType,
    uploadedAt,
    extractionMethod: 'CARTERA_020B_PARSER_REGISTRY',
    extractedFields,
    extractionConfidence,
    confirmationState: POLICY_EVIDENCE_STATES.PENDING_CONFIRMATION,
    confirmedBy: null,
    confirmedAt: null,
    warnings,
  });

  return Object.freeze({
    ...packet,
    createsTruth: false,
    canInvokeConfirmedPolicyCommand: false,
  });
}
