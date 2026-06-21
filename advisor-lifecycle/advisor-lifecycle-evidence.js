export const ADVISOR_LIFECYCLE_EVIDENCE_TYPES = Object.freeze({
  USER_DECLARED: 'user_declared',
  MANAGER_CONFIRMED: 'manager_confirmed',
  SIGNED_PRECONTRACT_DOCUMENT: 'signed_precontract_document',
  CARRIER_ACTIVATION_CONFIRMATION: 'carrier_activation_confirmation',
  CONTEST_START_DATE: 'contest_start_date',
  CONNECTION_DATE: 'connection_date',
  ADVISOR_CODE_ACTIVATION: 'advisor_code_activation',
  OFFICIAL_ROSTER: 'official_roster',
  COMMISSION_STATEMENT: 'commission_statement',
  CARRIER_PORTAL_SCREENSHOT: 'carrier_portal_screenshot',
  CARRIER_API: 'carrier_api',
  UNKNOWN: 'unknown',
});

export const ADVISOR_LIFECYCLE_EVIDENCE_CONFIDENCE = Object.freeze({
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  OFFICIAL: 'official',
});

const CAREER_CLOCK_EVIDENCE_TYPES = new Set([
  ADVISOR_LIFECYCLE_EVIDENCE_TYPES.CONNECTION_DATE,
  ADVISOR_LIFECYCLE_EVIDENCE_TYPES.CONTEST_START_DATE,
  ADVISOR_LIFECYCLE_EVIDENCE_TYPES.CARRIER_ACTIVATION_CONFIRMATION,
  ADVISOR_LIFECYCLE_EVIDENCE_TYPES.ADVISOR_CODE_ACTIVATION,
  ADVISOR_LIFECYCLE_EVIDENCE_TYPES.OFFICIAL_ROSTER,
  ADVISOR_LIFECYCLE_EVIDENCE_TYPES.CARRIER_API,
]);

const CONFIRMED_CONFIDENCE = new Set([
  ADVISOR_LIFECYCLE_EVIDENCE_CONFIDENCE.HIGH,
  ADVISOR_LIFECYCLE_EVIDENCE_CONFIDENCE.OFFICIAL,
]);

function normalizeConfidence(confidence) {
  return Object.values(ADVISOR_LIFECYCLE_EVIDENCE_CONFIDENCE).includes(confidence)
    ? confidence
    : ADVISOR_LIFECYCLE_EVIDENCE_CONFIDENCE.LOW;
}

export function createAdvisorLifecycleEvidence({
  evidenceId = null,
  evidenceType = ADVISOR_LIFECYCLE_EVIDENCE_TYPES.UNKNOWN,
  confidence = ADVISOR_LIFECYCLE_EVIDENCE_CONFIDENCE.LOW,
  confirmed = false,
  evidenceRefs = [],
  observedValue = null,
  capturedAt = null,
  metadata = {},
} = {}) {
  const normalizedConfidence = normalizeConfidence(confidence);
  const canStartCareerClock = (
    CAREER_CLOCK_EVIDENCE_TYPES.has(evidenceType) &&
    confirmed === true &&
    CONFIRMED_CONFIDENCE.has(normalizedConfidence)
  );

  return {
    evidenceId,
    evidenceType: Object.values(ADVISOR_LIFECYCLE_EVIDENCE_TYPES).includes(evidenceType)
      ? evidenceType
      : ADVISOR_LIFECYCLE_EVIDENCE_TYPES.UNKNOWN,
    confidence: normalizedConfidence,
    confirmed,
    evidenceRefs: Array.isArray(evidenceRefs) ? [...evidenceRefs] : [],
    observedValue,
    capturedAt,
    metadata: { ...metadata },
    canStartCareerClock,
    startsCareerClock: canStartCareerClock,
    confirmsPayoutTruth: evidenceType === ADVISOR_LIFECYCLE_EVIDENCE_TYPES.COMMISSION_STATEMENT && confirmed === true,
    managerConfirmationIsPayoutTruth: false,
    signedPrecontractStartsCareerClock: false,
    userDeclaredStartsCareerClock: false,
  };
}

export function evidenceCanStartCareerClock(evidence = {}) {
  return createAdvisorLifecycleEvidence(evidence).canStartCareerClock;
}

export function managerConfirmationCreatesPayoutTruth() {
  return false;
}
