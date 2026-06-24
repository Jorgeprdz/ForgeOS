import {
  RELATIONSHIP_ATTRIBUTION_STATUS,
  RELATIONSHIP_TYPE,
} from './advisor-relationship-attribution-evaluator.js';

const RELATIONSHIP_BONUS_READINESS_STATUS = Object.freeze({
  READY_FOR_CANDIDATE_CALCULATION: 'ready_for_candidate_calculation',
  PENDING: 'pending',
  BLOCKED: 'blocked',
  UNKNOWN: 'unknown',
  NOT_MODELED: 'not_modeled',
});

const RELATIONSHIP_BONUS_CONCEPT_KEY = Object.freeze({
  CONNECTION: 'connection-bonus',
  DEVELOPMENT: 'development-bonus',
});

const POLICY_COUNT_SOURCE = 'advisor-development-counting-weighting-engine.summary.includedCount';
const PAYOUT_TRUTH_RULE = 'commission_statement_required';

const DEFAULT_EVIDENCE_REQUIREMENTS = Object.freeze([
  'relationship_attribution_evidence',
  'valid_policy_count_evidence',
  PAYOUT_TRUTH_RULE,
]);

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function isStrictNumber(value) {
  return typeof value === 'number' && Number.isFinite(value);
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

function getConcept(rulePack, conceptKey) {
  return rulePack?.concepts?.[conceptKey] || null;
}

function getIncludedPolicyCount(countingAndWeightingResult) {
  return countingAndWeightingResult?.summary?.includedCount;
}

function createRulePackConceptSummary(conceptKey, concept) {
  if (!concept) {
    return {
      conceptKey,
      calculationStatus: null,
      requiredAttributionEvidence: [],
      supportedDeveloperShares: null,
    };
  }

  return {
    conceptKey,
    calculationStatus: concept.calculationStatus ?? null,
    requiredAttributionEvidence: Array.isArray(concept.requiredAttributionEvidence)
      ? [...concept.requiredAttributionEvidence]
      : [],
    supportedDeveloperShares: Array.isArray(concept.supportedDeveloperShares)
      ? [...concept.supportedDeveloperShares]
      : null,
  };
}

function createRelationshipSummary(relationshipAttributionResult) {
  if (!isPlainObject(relationshipAttributionResult)) {
    return {
      status: null,
      reason: null,
      attribution: null,
      share: null,
    };
  }

  return {
    status: relationshipAttributionResult.status ?? null,
    reason: relationshipAttributionResult.reason ?? null,
    attribution: clonePlain(relationshipAttributionResult.attribution ?? null),
    share: clonePlain(relationshipAttributionResult.share ?? null),
  };
}

function buildReadinessResult({
  relationshipType,
  status,
  reason,
  relationshipAttributionResult = null,
  includedCount = null,
  conceptKey,
  concept = null,
  developerShare = null,
  warnings = [],
}) {
  const relationshipStatus = relationshipAttributionResult?.status ?? null;
  const relationshipConfirmed = relationshipStatus === RELATIONSHIP_ATTRIBUTION_STATUS.CONFIRMED;
  const validPolicyCountAvailable = isStrictNumber(includedCount);
  const shareAvailable = isStrictNumber(developerShare);

  return deepFreeze({
    relationshipType,
    status,
    reason,
    readiness: {
      relationshipConfirmed,
      validPolicyCountAvailable,
      validPolicyCount: validPolicyCountAvailable ? includedCount : null,
      shareAvailable,
      developerShare: shareAvailable ? developerShare : null,
      readyForCandidateCalculation: status === RELATIONSHIP_BONUS_READINESS_STATUS.READY_FOR_CANDIDATE_CALCULATION,
    },
    relationshipAttribution: createRelationshipSummary(relationshipAttributionResult),
    policyCount: {
      includedCount: validPolicyCountAvailable ? includedCount : null,
      source: POLICY_COUNT_SOURCE,
    },
    rulePackConcept: createRulePackConceptSummary(conceptKey, concept),
    payoutTruth: false,
    payoutTruthRule: PAYOUT_TRUTH_RULE,
    evidenceRequirements: [...DEFAULT_EVIDENCE_REQUIREMENTS],
    warnings: [...warnings],
  });
}

function mapAttributionStatusToReadiness(relationshipType, relationshipAttributionResult, conceptKey, concept) {
  if (!isPlainObject(relationshipAttributionResult)) {
    return buildReadinessResult({
      relationshipType,
      status: RELATIONSHIP_BONUS_READINESS_STATUS.BLOCKED,
      reason: `blocked_by_missing_${relationshipType}_attribution_evidence`,
      relationshipAttributionResult,
      conceptKey,
      concept,
    });
  }

  if (relationshipAttributionResult.status === RELATIONSHIP_ATTRIBUTION_STATUS.CONFIRMED) {
    return null;
  }

  const statusMap = {
    [RELATIONSHIP_ATTRIBUTION_STATUS.PENDING]: RELATIONSHIP_BONUS_READINESS_STATUS.PENDING,
    [RELATIONSHIP_ATTRIBUTION_STATUS.BLOCKED]: RELATIONSHIP_BONUS_READINESS_STATUS.BLOCKED,
    [RELATIONSHIP_ATTRIBUTION_STATUS.UNKNOWN]: RELATIONSHIP_BONUS_READINESS_STATUS.UNKNOWN,
    [RELATIONSHIP_ATTRIBUTION_STATUS.NOT_MODELED]: RELATIONSHIP_BONUS_READINESS_STATUS.NOT_MODELED,
  };

  const reasonMap = {
    [RELATIONSHIP_ATTRIBUTION_STATUS.PENDING]: `pending_${relationshipType}_attribution_evidence`,
    [RELATIONSHIP_ATTRIBUTION_STATUS.BLOCKED]: `blocked_by_missing_${relationshipType}_attribution_evidence`,
    [RELATIONSHIP_ATTRIBUTION_STATUS.UNKNOWN]: `unknown_${relationshipType}_attribution_facts`,
    [RELATIONSHIP_ATTRIBUTION_STATUS.NOT_MODELED]: `${relationshipType}_attribution_not_modeled`,
  };

  return buildReadinessResult({
    relationshipType,
    status: statusMap[relationshipAttributionResult.status] || RELATIONSHIP_BONUS_READINESS_STATUS.UNKNOWN,
    reason: reasonMap[relationshipAttributionResult.status] || `unknown_${relationshipType}_attribution_status`,
    relationshipAttributionResult,
    conceptKey,
    concept,
    warnings: relationshipAttributionResult.warnings || [],
  });
}

function evaluatePolicyCount({
  relationshipType,
  relationshipAttributionResult,
  countingAndWeightingResult,
  conceptKey,
  concept,
  developerShare = null,
}) {
  if (!isPlainObject(countingAndWeightingResult)) {
    return buildReadinessResult({
      relationshipType,
      status: RELATIONSHIP_BONUS_READINESS_STATUS.BLOCKED,
      reason: 'blocked_by_missing_policy_count_result',
      relationshipAttributionResult,
      conceptKey,
      concept,
      developerShare,
      warnings: relationshipAttributionResult?.warnings || [],
    });
  }

  const includedCount = getIncludedPolicyCount(countingAndWeightingResult);

  if (!isStrictNumber(includedCount)) {
    return buildReadinessResult({
      relationshipType,
      status: RELATIONSHIP_BONUS_READINESS_STATUS.UNKNOWN,
      reason: 'invalid_policy_count_result',
      relationshipAttributionResult,
      includedCount,
      conceptKey,
      concept,
      developerShare,
      warnings: relationshipAttributionResult?.warnings || [],
    });
  }

  if (includedCount <= 0) {
    return buildReadinessResult({
      relationshipType,
      status: RELATIONSHIP_BONUS_READINESS_STATUS.BLOCKED,
      reason: 'blocked_by_zero_valid_policies',
      relationshipAttributionResult,
      includedCount,
      conceptKey,
      concept,
      developerShare,
      warnings: relationshipAttributionResult?.warnings || [],
    });
  }

  return {
    includedCount,
  };
}

function evaluateConnectionBonusReadiness(input = {}) {
  const conceptKey = RELATIONSHIP_BONUS_CONCEPT_KEY.CONNECTION;
  const concept = getConcept(input.rulePack, conceptKey);

  if (!concept) {
    return buildReadinessResult({
      relationshipType: RELATIONSHIP_TYPE.CONNECTION,
      status: RELATIONSHIP_BONUS_READINESS_STATUS.NOT_MODELED,
      reason: 'missing_connection_bonus_concept',
      relationshipAttributionResult: input.relationshipAttributionResult,
      conceptKey,
      concept,
    });
  }

  const attributionGate = mapAttributionStatusToReadiness(
    RELATIONSHIP_TYPE.CONNECTION,
    input.relationshipAttributionResult,
    conceptKey,
    concept,
  );

  if (attributionGate) return attributionGate;

  const policyCountGate = evaluatePolicyCount({
    relationshipType: RELATIONSHIP_TYPE.CONNECTION,
    relationshipAttributionResult: input.relationshipAttributionResult,
    countingAndWeightingResult: input.countingAndWeightingResult,
    conceptKey,
    concept,
  });

  if (!isStrictNumber(policyCountGate.includedCount)) return policyCountGate;

  return buildReadinessResult({
    relationshipType: RELATIONSHIP_TYPE.CONNECTION,
    status: RELATIONSHIP_BONUS_READINESS_STATUS.READY_FOR_CANDIDATE_CALCULATION,
    reason: null,
    relationshipAttributionResult: input.relationshipAttributionResult,
    includedCount: policyCountGate.includedCount,
    conceptKey,
    concept,
    warnings: input.relationshipAttributionResult?.warnings || [],
  });
}

function validateDeveloperShare({
  rulePackConcept,
  relationshipAttributionResult,
}) {
  const developerShare = relationshipAttributionResult?.share?.developerShare;

  if (developerShare === undefined || developerShare === null) {
    return {
      status: RELATIONSHIP_BONUS_READINESS_STATUS.BLOCKED,
      reason: 'blocked_by_missing_developer_share',
      developerShare: null,
    };
  }

  if (!isStrictNumber(developerShare)) {
    return {
      status: RELATIONSHIP_BONUS_READINESS_STATUS.UNKNOWN,
      reason: 'invalid_developer_share',
      developerShare,
    };
  }

  const supportedDeveloperShares = Array.isArray(rulePackConcept?.supportedDeveloperShares)
    ? rulePackConcept.supportedDeveloperShares
    : [];

  if (!supportedDeveloperShares.includes(developerShare)) {
    return {
      status: RELATIONSHIP_BONUS_READINESS_STATUS.NOT_MODELED,
      reason: 'unsupported_developer_share_in_rule_pack',
      developerShare,
    };
  }

  return {
    status: null,
    reason: null,
    developerShare,
  };
}

function evaluateDevelopmentBonusReadiness(input = {}) {
  const conceptKey = RELATIONSHIP_BONUS_CONCEPT_KEY.DEVELOPMENT;
  const concept = getConcept(input.rulePack, conceptKey);

  if (!concept) {
    return buildReadinessResult({
      relationshipType: RELATIONSHIP_TYPE.DEVELOPMENT,
      status: RELATIONSHIP_BONUS_READINESS_STATUS.NOT_MODELED,
      reason: 'missing_development_bonus_concept',
      relationshipAttributionResult: input.relationshipAttributionResult,
      conceptKey,
      concept,
    });
  }

  const attributionGate = mapAttributionStatusToReadiness(
    RELATIONSHIP_TYPE.DEVELOPMENT,
    input.relationshipAttributionResult,
    conceptKey,
    concept,
  );

  if (attributionGate) return attributionGate;

  const shareGate = validateDeveloperShare({
    rulePackConcept: concept,
    relationshipAttributionResult: input.relationshipAttributionResult,
  });

  if (shareGate.status) {
    return buildReadinessResult({
      relationshipType: RELATIONSHIP_TYPE.DEVELOPMENT,
      status: shareGate.status,
      reason: shareGate.reason,
      relationshipAttributionResult: input.relationshipAttributionResult,
      conceptKey,
      concept,
      developerShare: shareGate.developerShare,
      warnings: input.relationshipAttributionResult?.warnings || [],
    });
  }

  const policyCountGate = evaluatePolicyCount({
    relationshipType: RELATIONSHIP_TYPE.DEVELOPMENT,
    relationshipAttributionResult: input.relationshipAttributionResult,
    countingAndWeightingResult: input.countingAndWeightingResult,
    conceptKey,
    concept,
    developerShare: shareGate.developerShare,
  });

  if (!isStrictNumber(policyCountGate.includedCount)) return policyCountGate;

  return buildReadinessResult({
    relationshipType: RELATIONSHIP_TYPE.DEVELOPMENT,
    status: RELATIONSHIP_BONUS_READINESS_STATUS.READY_FOR_CANDIDATE_CALCULATION,
    reason: null,
    relationshipAttributionResult: input.relationshipAttributionResult,
    includedCount: policyCountGate.includedCount,
    conceptKey,
    concept,
    developerShare: shareGate.developerShare,
    warnings: input.relationshipAttributionResult?.warnings || [],
  });
}

export {
  DEFAULT_EVIDENCE_REQUIREMENTS,
  POLICY_COUNT_SOURCE,
  RELATIONSHIP_BONUS_CONCEPT_KEY,
  RELATIONSHIP_BONUS_READINESS_STATUS,
  evaluateConnectionBonusReadiness,
  evaluateDevelopmentBonusReadiness,
};
