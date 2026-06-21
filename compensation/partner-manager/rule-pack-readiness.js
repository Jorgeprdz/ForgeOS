export const PARTNER_RULE_PACK_READINESS = Object.freeze({
  READY_FOR_CONTRACT: 'ready_for_contract',
  READY_FOR_CONTRACT_WITH_CAUTION: 'ready_for_contract_with_caution',
  PARTIALLY_MODELABLE: 'partially_modelable',
  BLOCKED_BY_MISSING_TABLE: 'blocked_by_missing_table',
  BLOCKED_BY_MISSING_FORMULA: 'blocked_by_missing_formula',
  BLOCKED_BY_MISSING_ECONOMIC_INPUT: 'blocked_by_missing_economic_input',
  BLOCKED_BY_MISSING_COMMISSION_EVIDENCE: 'blocked_by_missing_commission_evidence',
  BLOCKED_BY_MISSING_LIFECYCLE: 'blocked_by_missing_lifecycle',
  BLOCKED_BY_MISSING_SCOPE: 'blocked_by_missing_scope',
  BLOCKED_BY_MISSING_TA_RESULT: 'blocked_by_missing_TA_result',
  BLOCKED_BY_MISSING_INDEXES: 'blocked_by_missing_indexes',
  BLOCKED_BY_MISSING_OFFICIAL_STATEMENT: 'blocked_by_missing_official_statement',
  EXAMPLE_ONLY: 'example_only',
  NOT_MODELABLE_YET: 'not_modelable_yet',
  UNKNOWN: 'unknown',
});

const READY_STATES = new Set([
  PARTNER_RULE_PACK_READINESS.READY_FOR_CONTRACT,
  PARTNER_RULE_PACK_READINESS.READY_FOR_CONTRACT_WITH_CAUTION,
]);

const PARTIAL_STATES = new Set([
  PARTNER_RULE_PACK_READINESS.PARTIALLY_MODELABLE,
  PARTNER_RULE_PACK_READINESS.EXAMPLE_ONLY,
]);

const BLOCKED_STATES = new Set([
  PARTNER_RULE_PACK_READINESS.BLOCKED_BY_MISSING_TABLE,
  PARTNER_RULE_PACK_READINESS.BLOCKED_BY_MISSING_FORMULA,
  PARTNER_RULE_PACK_READINESS.BLOCKED_BY_MISSING_ECONOMIC_INPUT,
  PARTNER_RULE_PACK_READINESS.BLOCKED_BY_MISSING_COMMISSION_EVIDENCE,
  PARTNER_RULE_PACK_READINESS.BLOCKED_BY_MISSING_LIFECYCLE,
  PARTNER_RULE_PACK_READINESS.BLOCKED_BY_MISSING_SCOPE,
  PARTNER_RULE_PACK_READINESS.BLOCKED_BY_MISSING_TA_RESULT,
  PARTNER_RULE_PACK_READINESS.BLOCKED_BY_MISSING_INDEXES,
  PARTNER_RULE_PACK_READINESS.BLOCKED_BY_MISSING_OFFICIAL_STATEMENT,
  PARTNER_RULE_PACK_READINESS.NOT_MODELABLE_YET,
  PARTNER_RULE_PACK_READINESS.UNKNOWN,
]);

export function normalizeRulePackReadiness(readiness = PARTNER_RULE_PACK_READINESS.UNKNOWN) {
  return Object.values(PARTNER_RULE_PACK_READINESS).includes(readiness)
    ? readiness
    : PARTNER_RULE_PACK_READINESS.UNKNOWN;
}

export function isReadyForContract(readiness) {
  return READY_STATES.has(normalizeRulePackReadiness(readiness));
}

export function isPartialReadiness(readiness) {
  return PARTIAL_STATES.has(normalizeRulePackReadiness(readiness));
}

export function isBlockedReadiness(readiness) {
  return BLOCKED_STATES.has(normalizeRulePackReadiness(readiness));
}

export function createPartnerRulePackAssessment({
  conceptKey = 'unknown',
  readiness = PARTNER_RULE_PACK_READINESS.UNKNOWN,
  calculationAllowed = false,
  requiredInputs = [],
  missingInputs = [],
  blockedReasons = [],
  warnings = [],
  sourceNotes = [],
  confidence = 'unknown',
  percentageCandidate = null,
  amountCandidate = null,
  eligibleRows = [],
  tableVersion = null,
  metadata = {},
} = {}) {
  const normalizedReadiness = normalizeRulePackReadiness(readiness);
  const blocked = isBlockedReadiness(normalizedReadiness) || blockedReasons.length > 0 || missingInputs.length > 0;
  const safeCalculationAllowed = calculationAllowed === true && !blocked && normalizedReadiness !== PARTNER_RULE_PACK_READINESS.EXAMPLE_ONLY;

  return {
    conceptKey,
    readiness: normalizedReadiness,
    calculationAllowed: safeCalculationAllowed,
    payoutTruth: false,
    requiredInputs: [...requiredInputs],
    missingInputs: [...missingInputs],
    blockedReasons: [...blockedReasons],
    warnings: [...warnings],
    sourceNotes: [...sourceNotes],
    confidence,
    tableVersion,
    eligibleRows: [...eligibleRows],
    percentageCandidate: blocked ? null : percentageCandidate,
    amountCandidate: blocked ? null : amountCandidate,
    metadata: { ...metadata },
    blockedIsZero: false,
    unknownIsZero: false,
  };
}
