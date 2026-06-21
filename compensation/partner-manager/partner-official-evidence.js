import {
  PARTNER_OFFICIAL_EVIDENCE_SOURCE_TYPES,
  PARTNER_OFFICIAL_EVIDENCE_STATUSES,
  isExtractionAidPartnerEvidenceSource,
  isOfficialPartnerEvidenceSource,
  normalizePartnerOfficialEvidenceSourceType,
  normalizePartnerOfficialEvidenceStatus,
} from './partner-official-evidence-status.js';

function cloneArray(value) {
  return Array.isArray(value) ? [...value] : [];
}

export function createPartnerOfficialEvidence({
  evidenceId = null,
  sourceType = PARTNER_OFFICIAL_EVIDENCE_SOURCE_TYPES.UNKNOWN,
  evidenceStatus = PARTNER_OFFICIAL_EVIDENCE_STATUSES.UNKNOWN,
  documentId = null,
  statementId = null,
  statementLineIds = [],
  partnerId = null,
  period = null,
  conceptKey = null,
  rejectedReason = null,
  blockedReason = null,
  warnings = [],
  sourceNotes = [],
  metadata = {},
} = {}) {
  const safeSourceType = normalizePartnerOfficialEvidenceSourceType(sourceType);
  const safeEvidenceStatus = normalizePartnerOfficialEvidenceStatus(evidenceStatus);
  const extractionAid = isExtractionAidPartnerEvidenceSource(safeSourceType);
  const officialSource = isOfficialPartnerEvidenceSource(safeSourceType);
  const canAspireToPayoutTruth = officialSource && safeEvidenceStatus === PARTNER_OFFICIAL_EVIDENCE_STATUSES.OFFICIAL_CONFIRMED;

  return {
    evidenceId,
    sourceType: safeSourceType,
    evidenceStatus: safeEvidenceStatus,
    documentId,
    statementId,
    statementLineIds: cloneArray(statementLineIds),
    partnerId,
    period,
    conceptKey,
    rejectedReason,
    blockedReason,
    warnings: [
      ...cloneArray(warnings),
      ...(extractionAid ? ['Extraction aid is not payout truth.'] : []),
      ...(safeSourceType === PARTNER_OFFICIAL_EVIDENCE_SOURCE_TYPES.MANUAL_ENTRY ? ['Manual entry is not payout truth.'] : []),
    ],
    sourceNotes: cloneArray(sourceNotes),
    metadata: { ...metadata },
    isOfficialSource: officialSource,
    isExtractionAid: extractionAid,
    canAspireToPayoutTruth,
    payoutTruth: false,
    unknownIsZero: false,
  };
}
