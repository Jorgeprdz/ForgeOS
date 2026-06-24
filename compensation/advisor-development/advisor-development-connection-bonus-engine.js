import {
  RELATIONSHIP_BONUS_READINESS_STATUS,
} from './advisor-relationship-bonus-readiness-gate.js';

const CONNECTION_BONUS_CONCEPT_KEY = 'connection-bonus';

const CONNECTION_BONUS_STATUS = Object.freeze({
  ELIGIBLE: 'eligible',
  INELIGIBLE: 'ineligible',
  BLOCKED: 'blocked',
  PENDING: 'pending',
  UNKNOWN: 'unknown',
  NOT_MODELED: 'not_modeled',
});

const CONNECTION_BONUS_TYPE = Object.freeze({
  ALTA: 'alta',
  MONTHLY: 'monthly',
});

const PAYOUT_TRUTH_RULE = 'commission_statement_required';

const EMPTY_CALCULATION = Object.freeze({
  validPolicyCount: null,
  tierMatched: null,
  payableCandidate: null,
});

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function isStrictNumber(value) {
  return typeof value === 'number' && Number.isFinite(value);
}

function isMissing(value) {
  return value === undefined || value === null;
}

function clonePlain(value) {
  if (!isPlainObject(value) && !Array.isArray(value)) return value;

  return JSON.parse(JSON.stringify(value));
}

function deepFreeze(value) {
  if (!isPlainObject(value) && !Array.isArray(value)) return value;

  Object.freeze(value);

  for (const child of Object.values(value)) {
    if ((isPlainObject(child) || Array.isArray(child)) && !Object.isFrozen(child)) {
      deepFreeze(child);
    }
  }

  return value;
}

function getWarnings(connectionBonusReadinessResult) {
  if (!Array.isArray(connectionBonusReadinessResult?.warnings)) {
    return [];
  }

  return clonePlain(connectionBonusReadinessResult.warnings);
}

function buildResult({
  status,
  reason = null,
  bonusType = null,
  advisorMonth = null,
  inputReadiness = null,
  calculation = {},
  warnings = [],
}) {
  return deepFreeze({
    status,
    reason,
    bonusType,
    advisorMonth,
    inputReadiness: inputReadiness ? clonePlain(inputReadiness) : null,
    calculation: {
      ...EMPTY_CALCULATION,
      ...calculation,
    },
    payoutTruth: false,
    payoutTruthRule: PAYOUT_TRUTH_RULE,
    evidenceRequirements: [PAYOUT_TRUTH_RULE],
    warnings: [...warnings],
  });
}

function getConnectionBonusConcept(rulePack) {
  return rulePack?.concepts?.[CONNECTION_BONUS_CONCEPT_KEY] || null;
}

function mapReadinessStatus(connectionBonusReadinessResult) {
  if (!isPlainObject(connectionBonusReadinessResult)) {
    return {
      status: CONNECTION_BONUS_STATUS.BLOCKED,
      reason: 'blocked_by_missing_connection_bonus_readiness',
    };
  }

  const readinessStatus = connectionBonusReadinessResult.status;

  if (readinessStatus === RELATIONSHIP_BONUS_READINESS_STATUS.READY_FOR_CANDIDATE_CALCULATION) {
    return null;
  }

  if (readinessStatus === RELATIONSHIP_BONUS_READINESS_STATUS.PENDING) {
    return {
      status: CONNECTION_BONUS_STATUS.PENDING,
      reason: 'pending_connection_bonus_readiness',
    };
  }

  if (readinessStatus === RELATIONSHIP_BONUS_READINESS_STATUS.BLOCKED) {
    return {
      status: CONNECTION_BONUS_STATUS.BLOCKED,
      reason: 'blocked_by_connection_bonus_readiness',
    };
  }

  if (readinessStatus === RELATIONSHIP_BONUS_READINESS_STATUS.UNKNOWN) {
    return {
      status: CONNECTION_BONUS_STATUS.UNKNOWN,
      reason: 'unknown_connection_bonus_readiness',
    };
  }

  if (
    readinessStatus === RELATIONSHIP_BONUS_READINESS_STATUS.NOT_MODELED
    || readinessStatus === 'not_modelled'
  ) {
    return {
      status: CONNECTION_BONUS_STATUS.NOT_MODELED,
      reason: 'connection_bonus_readiness_not_modeled',
    };
  }

  return {
    status: CONNECTION_BONUS_STATUS.UNKNOWN,
    reason: 'unknown_connection_bonus_readiness_status',
  };
}

function validateAltaBonus(concept) {
  const altaBonus = concept?.altaBonus;

  if (!isPlainObject(altaBonus)) {
    return {
      isValid: false,
      reason: 'malformed_connection_bonus_alta_bonus',
    };
  }

  if (!isStrictNumber(altaBonus.advisorMonth)) {
    return {
      isValid: false,
      reason: 'malformed_connection_bonus_alta_bonus',
    };
  }

  if (!isStrictNumber(altaBonus.amount)) {
    return {
      isValid: false,
      reason: 'malformed_connection_bonus_alta_bonus',
    };
  }

  return {
    isValid: true,
    altaBonus,
  };
}

function validateMonthlyBonus(concept) {
  const monthlyBonus = concept?.monthlyBonus;

  if (!isPlainObject(monthlyBonus)) {
    return {
      isValid: false,
      reason: 'malformed_connection_bonus_monthly_bonus',
    };
  }

  if (!Array.isArray(monthlyBonus.advisorMonths)) {
    return {
      isValid: false,
      reason: 'malformed_connection_bonus_monthly_bonus',
    };
  }

  if (!monthlyBonus.advisorMonths.every((advisorMonth) => isStrictNumber(advisorMonth))) {
    return {
      isValid: false,
      reason: 'malformed_connection_bonus_monthly_bonus',
    };
  }

  if (!Array.isArray(monthlyBonus.tiers) || monthlyBonus.tiers.length === 0) {
    return {
      isValid: false,
      reason: 'malformed_connection_bonus_tier_table',
    };
  }

  for (const tier of monthlyBonus.tiers) {
    if (!isPlainObject(tier)) {
      return {
        isValid: false,
        reason: 'malformed_connection_bonus_tier_table',
      };
    }

    if (!isStrictNumber(tier.minimumPolicies) || !isStrictNumber(tier.amount)) {
      return {
        isValid: false,
        reason: 'malformed_connection_bonus_tier_table',
      };
    }
  }

  const sortedTiers = [...monthlyBonus.tiers]
    .sort((left, right) => right.minimumPolicies - left.minimumPolicies);

  const topTier = sortedTiers[0];

  if (topTier.appliesToCountAndAbove !== true) {
    return {
      isValid: false,
      reason: 'malformed_connection_bonus_top_tier',
    };
  }

  return {
    isValid: true,
    monthlyBonus,
    sortedTiers,
  };
}

function matchConnectionBonusTier({ sortedTiers, validPolicyCount }) {
  return sortedTiers.find((tier) => validPolicyCount >= tier.minimumPolicies) || null;
}

function computeConnectionBonusFinancials({ concept, connectionBonusReadinessResult, advisorMonth }) {
  const altaValidation = validateAltaBonus(concept);

  if (advisorMonth === 1) {
    if (!altaValidation.isValid) {
      return {
        status: CONNECTION_BONUS_STATUS.NOT_MODELED,
        reason: altaValidation.reason,
      };
    }

    return {
      status: CONNECTION_BONUS_STATUS.ELIGIBLE,
      reason: null,
      bonusType: CONNECTION_BONUS_TYPE.ALTA,
      calculation: {
        validPolicyCount: null,
        tierMatched: null,
        payableCandidate: altaValidation.altaBonus.amount,
      },
    };
  }

  const monthlyValidation = validateMonthlyBonus(concept);

  if (!monthlyValidation.isValid) {
    return {
      status: CONNECTION_BONUS_STATUS.NOT_MODELED,
      reason: monthlyValidation.reason,
    };
  }

  if (!monthlyValidation.monthlyBonus.advisorMonths.includes(advisorMonth)) {
    return {
      status: CONNECTION_BONUS_STATUS.NOT_MODELED,
      reason: 'advisor_month_not_modeled_for_connection_bonus',
    };
  }

  const validPolicyCount = connectionBonusReadinessResult?.readiness?.validPolicyCount;

  if (!isStrictNumber(validPolicyCount)) {
    return {
      status: CONNECTION_BONUS_STATUS.UNKNOWN,
      reason: 'invalid_validPolicyCount',
      bonusType: CONNECTION_BONUS_TYPE.MONTHLY,
      calculation: {
        validPolicyCount: null,
        tierMatched: null,
        payableCandidate: null,
      },
    };
  }

  const tierMatched = matchConnectionBonusTier({
    sortedTiers: monthlyValidation.sortedTiers,
    validPolicyCount,
  });

  if (!tierMatched) {
    return {
      status: CONNECTION_BONUS_STATUS.INELIGIBLE,
      reason: 'connection_bonus_policy_threshold_not_met',
      bonusType: CONNECTION_BONUS_TYPE.MONTHLY,
      calculation: {
        validPolicyCount,
        tierMatched: null,
        payableCandidate: null,
      },
    };
  }

  return {
    status: CONNECTION_BONUS_STATUS.ELIGIBLE,
    reason: null,
    bonusType: CONNECTION_BONUS_TYPE.MONTHLY,
    calculation: {
      validPolicyCount,
      tierMatched: clonePlain(tierMatched),
      payableCandidate: tierMatched.amount,
    },
  };
}

function calculateConnectionBonusCandidate(input = {}) {
  if (!isPlainObject(input.rulePack)) {
    return buildResult({
      status: CONNECTION_BONUS_STATUS.NOT_MODELED,
      reason: 'missing_rule_pack',
      inputReadiness: input.connectionBonusReadinessResult,
    });
  }

  const concept = getConnectionBonusConcept(input.rulePack);

  if (!concept) {
    return buildResult({
      status: CONNECTION_BONUS_STATUS.NOT_MODELED,
      reason: 'missing_connection_bonus_concept',
      inputReadiness: input.connectionBonusReadinessResult,
    });
  }

  const readinessGate = mapReadinessStatus(input.connectionBonusReadinessResult);

  if (readinessGate) {
    return buildResult({
      status: readinessGate.status,
      reason: readinessGate.reason,
      inputReadiness: input.connectionBonusReadinessResult,
      warnings: getWarnings(input.connectionBonusReadinessResult),
    });
  }

  const advisorMonth = input.advisorFacts?.advisorMonth;

  if (isMissing(advisorMonth)) {
    return buildResult({
      status: CONNECTION_BONUS_STATUS.BLOCKED,
      reason: 'missing_advisorMonth',
      inputReadiness: input.connectionBonusReadinessResult,
      warnings: getWarnings(input.connectionBonusReadinessResult),
    });
  }

  if (!isStrictNumber(advisorMonth)) {
    return buildResult({
      status: CONNECTION_BONUS_STATUS.UNKNOWN,
      reason: 'invalid_advisorMonth',
      inputReadiness: input.connectionBonusReadinessResult,
      warnings: getWarnings(input.connectionBonusReadinessResult),
    });
  }

  const financials = computeConnectionBonusFinancials({
    concept,
    connectionBonusReadinessResult: input.connectionBonusReadinessResult,
    advisorMonth,
  });

  return buildResult({
    status: financials.status,
    reason: financials.reason,
    bonusType: financials.bonusType || null,
    advisorMonth,
    inputReadiness: input.connectionBonusReadinessResult,
    calculation: financials.calculation || EMPTY_CALCULATION,
    warnings: getWarnings(input.connectionBonusReadinessResult),
  });
}

export {
  CONNECTION_BONUS_CONCEPT_KEY,
  CONNECTION_BONUS_STATUS,
  CONNECTION_BONUS_TYPE,
  calculateConnectionBonusCandidate,
  computeConnectionBonusFinancials,
  matchConnectionBonusTier,
};
