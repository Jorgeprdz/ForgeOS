import { EVIDENCE_STATES } from '../contracts/evidence-states.js';
import { OWNER_TYPES, isKnownOwnerType } from '../contracts/owner-types.js';
import { TRUTH_TYPES } from '../contracts/truth-types.js';
import { REQUIRED_MANUAL_OVERRIDE_FIELDS } from '../contracts/truth-envelope-required-fields.js';
import { createBlock, createFail, createPass } from './validator-result.js';

const VALIDATOR_ID = 'source-ownership-validator';

function getOwnerType(envelope = {}) {
  return envelope.ownerType ?? envelope.owner?.type;
}

function hasMultipleMetricOwners(envelope = {}) {
  const metricOwner = envelope.metricOwner ?? envelope.owner?.metricOwner;
  const metricOwners = envelope.metricOwners ?? envelope.owner?.metricOwners;
  return Array.isArray(metricOwners) && metricOwners.length > 1 && new Set(metricOwners).size > 1 && !metricOwner;
}

function missingManualOverrideAudit(envelope = {}) {
  const auditTrail = Array.isArray(envelope.auditTrail) ? envelope.auditTrail : [];
  const manualOverride = envelope.manualOverride ?? envelope.value?.manualOverride ?? {};

  if (auditTrail.length === 0) {
    return true;
  }

  return REQUIRED_MANUAL_OVERRIDE_FIELDS.some((field) => manualOverride[field] === undefined || manualOverride[field] === null);
}

export function validateSourceOwnership(envelope = {}, options = {}) {
  const ownerType = options.ownerType ?? getOwnerType(envelope);
  const truthType = options.targetTruthType ?? envelope.truthType;
  const evidenceState = options.evidenceState ?? envelope.evidenceState;

  if (ownerType === 'hardcoded_value') {
    return createBlock(VALIDATOR_ID, 'hardcoded values are not valid owner types.', {
      blockedTransition: 'hardcoded_value -> ownerType',
      relatedTruthType: truthType,
      relatedEvidenceState: evidenceState,
      relatedOwnerType: ownerType,
    });
  }

  if (!isKnownOwnerType(ownerType)) {
    return createFail(VALIDATOR_ID, `Unknown ownerType: ${ownerType}.`, {
      evidence: [ownerType],
      relatedTruthType: truthType ?? null,
      relatedEvidenceState: evidenceState ?? null,
      relatedOwnerType: ownerType ?? null,
    });
  }

  if (ownerType === OWNER_TYPES.UNKNOWN_OWNER && evidenceState === EVIDENCE_STATES.VALIDATED) {
    return createBlock(VALIDATOR_ID, 'UNKNOWN_OWNER cannot become VALIDATED.', {
      blockedTransition: 'UNKNOWN_OWNER -> VALIDATED',
      relatedTruthType: truthType,
      relatedEvidenceState: evidenceState,
      relatedOwnerType: ownerType,
    });
  }

  if (ownerType === OWNER_TYPES.UNKNOWN_OWNER && truthType !== TRUTH_TYPES.UNKNOWN) {
    return createBlock(VALIDATOR_ID, 'No truth without owner.', {
      blockedTransition: 'UNKNOWN_OWNER -> truth-bearing output',
      relatedTruthType: truthType,
      relatedEvidenceState: evidenceState,
      relatedOwnerType: ownerType,
    });
  }

  if (hasMultipleMetricOwners(envelope)) {
    return createBlock(VALIDATOR_ID, 'No metric with multiple owners.', {
      blockedTransition: 'multiple_metric_owners -> official_metric',
      relatedTruthType: truthType,
      relatedEvidenceState: evidenceState,
      relatedOwnerType: ownerType,
      relatedADR: ['ADR-002'],
    });
  }

  if (ownerType === OWNER_TYPES.OCR_OUTPUT && truthType === TRUTH_TYPES.PRODUCT_TRUTH) {
    return createBlock(VALIDATOR_ID, 'OCR_output cannot own PRODUCT_TRUTH.', {
      blockedTransition: 'OCR_output -> PRODUCT_TRUTH',
      relatedTruthType: truthType,
      relatedEvidenceState: evidenceState,
      relatedOwnerType: ownerType,
      relatedADR: ['ADR-005'],
    });
  }

  if (ownerType === OWNER_TYPES.PARSER_OUTPUT && truthType === TRUTH_TYPES.PRODUCT_TRUTH) {
    return createBlock(VALIDATOR_ID, 'parser_output cannot own PRODUCT_TRUTH.', {
      blockedTransition: 'parser_output -> PRODUCT_TRUTH',
      relatedTruthType: truthType,
      relatedEvidenceState: evidenceState,
      relatedOwnerType: ownerType,
      relatedADR: ['ADR-005'],
    });
  }

  if (ownerType === OWNER_TYPES.AI_INTERPRETATION && [TRUTH_TYPES.FACT, TRUTH_TYPES.SOURCE_TRUTH].includes(truthType)) {
    return createBlock(VALIDATOR_ID, 'AI_interpretation cannot own FACT or SOURCE_TRUTH.', {
      blockedTransition: `AI_interpretation -> ${truthType}`,
      relatedTruthType: truthType,
      relatedEvidenceState: evidenceState,
      relatedOwnerType: ownerType,
    });
  }

  if (truthType === TRUTH_TYPES.MANUAL_OVERRIDE && missingManualOverrideAudit(envelope)) {
    return createBlock(VALIDATOR_ID, 'MANUAL_OVERRIDE requires audit trail.', {
      blockedTransition: 'MANUAL_OVERRIDE without audit trail',
      relatedTruthType: truthType,
      relatedEvidenceState: evidenceState,
      relatedOwnerType: ownerType,
    });
  }

  return createPass(VALIDATOR_ID, 'source ownership is compatible with PHASE A rules.', {
    evidence: ['SOURCE_OWNERSHIP_REGISTRY_001.md'],
    relatedTruthType: truthType,
    relatedEvidenceState: evidenceState,
    relatedOwnerType: ownerType,
  });
}
