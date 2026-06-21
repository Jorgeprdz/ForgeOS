export const PARTNER_OFFICIAL_EVIDENCE_SOURCE_TYPES = Object.freeze({
  OFFICIAL_COMPENSATION_STATEMENT: 'official_compensation_statement',
  OFFICIAL_ACCOUNT_STATEMENT: 'official_account_statement',
  CARRIER_PARTNER_STATEMENT: 'carrier_partner_statement',
  CARRIER_COMMISSION_STATEMENT: 'carrier_commission_statement',
  PAYMENT_STATEMENT: 'payment_statement',
  POLICY_STATEMENT: 'policy_statement',
  PDF_EXTRACTION: 'pdf_extraction',
  OCR_EXTRACTION: 'ocr_extraction',
  MANUAL_ENTRY: 'manual_entry',
  AI_EXTRACTION: 'ai_extraction',
  UNKNOWN: 'unknown',
});

export const PARTNER_OFFICIAL_EVIDENCE_STATUSES = Object.freeze({
  MISSING: 'missing',
  CANDIDATE: 'candidate',
  EXTRACTED: 'extracted',
  NEEDS_HUMAN_CONFIRMATION: 'needs_human_confirmation',
  HUMAN_CONFIRMED: 'human_confirmed',
  OFFICIAL_CONFIRMED: 'official_confirmed',
  REJECTED: 'rejected',
  BLOCKED: 'blocked',
  UNKNOWN: 'unknown',
});

const OFFICIAL_SOURCE_TYPES = new Set([
  PARTNER_OFFICIAL_EVIDENCE_SOURCE_TYPES.OFFICIAL_COMPENSATION_STATEMENT,
  PARTNER_OFFICIAL_EVIDENCE_SOURCE_TYPES.OFFICIAL_ACCOUNT_STATEMENT,
  PARTNER_OFFICIAL_EVIDENCE_SOURCE_TYPES.CARRIER_PARTNER_STATEMENT,
  PARTNER_OFFICIAL_EVIDENCE_SOURCE_TYPES.CARRIER_COMMISSION_STATEMENT,
  PARTNER_OFFICIAL_EVIDENCE_SOURCE_TYPES.PAYMENT_STATEMENT,
]);

const EXTRACTION_SOURCE_TYPES = new Set([
  PARTNER_OFFICIAL_EVIDENCE_SOURCE_TYPES.PDF_EXTRACTION,
  PARTNER_OFFICIAL_EVIDENCE_SOURCE_TYPES.OCR_EXTRACTION,
  PARTNER_OFFICIAL_EVIDENCE_SOURCE_TYPES.AI_EXTRACTION,
]);

export function normalizePartnerOfficialEvidenceSourceType(sourceType = PARTNER_OFFICIAL_EVIDENCE_SOURCE_TYPES.UNKNOWN) {
  return Object.values(PARTNER_OFFICIAL_EVIDENCE_SOURCE_TYPES).includes(sourceType)
    ? sourceType
    : PARTNER_OFFICIAL_EVIDENCE_SOURCE_TYPES.UNKNOWN;
}

export function normalizePartnerOfficialEvidenceStatus(evidenceStatus = PARTNER_OFFICIAL_EVIDENCE_STATUSES.UNKNOWN) {
  return Object.values(PARTNER_OFFICIAL_EVIDENCE_STATUSES).includes(evidenceStatus)
    ? evidenceStatus
    : PARTNER_OFFICIAL_EVIDENCE_STATUSES.UNKNOWN;
}

export function isOfficialPartnerEvidenceSource(sourceType) {
  return OFFICIAL_SOURCE_TYPES.has(normalizePartnerOfficialEvidenceSourceType(sourceType));
}

export function isExtractionAidPartnerEvidenceSource(sourceType) {
  return EXTRACTION_SOURCE_TYPES.has(normalizePartnerOfficialEvidenceSourceType(sourceType));
}
