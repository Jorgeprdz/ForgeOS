const RELATIONSHIP_ATTRIBUTION_STATUS = Object.freeze({
  CONFIRMED: 'confirmed',
  PENDING: 'pending',
  BLOCKED: 'blocked',
  UNKNOWN: 'unknown',
  NOT_MODELED: 'not_modeled',
});

const RELATIONSHIP_TYPE = Object.freeze({
  CONNECTION: 'connection',
  DEVELOPMENT: 'development',
});

const ATTRIBUTION_EVIDENCE_STATUS = Object.freeze({
  CONFIRMED_BY_OFFICIAL_RECORD: 'confirmed_by_official_record',
  PENDING_EVIDENCE: 'pending_evidence',
  UNOFFICIAL_SYSTEM_ENTRY: 'unofficial_system_entry',
});

const PAYOUT_TRUTH_RULE = 'commission_statement_required';

const COMMON_WARNING = {
  code: 'relationship_attribution_is_not_payout_truth',
  message: 'Relationship attribution establishes eligibility bounds, not payout truth. Commission statement evidence is required for payout truth.',
};

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim() !== '';
}

function isBoolean(value) {
  return typeof value === 'boolean';
}

function isStrictNumber(value) {
  return typeof value === 'number' && Number.isFinite(value);
}

function isMissing(value) {
  return value === undefined || value === null || value === '';
}

function isIsoDateString(value) {
  if (!isNonEmptyString(value)) return false;

  const time = Date.parse(value);

  return Number.isFinite(time);
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

function buildResult({
  relationshipType,
  status,
  reason = null,
  inputFacts = {},
  attribution = {},
  share = null,
  requiredEvidence = [],
  warnings = [],
}) {
  return deepFreeze({
    relationshipType,
    status,
    reason,
    inputFacts: clonePlain(inputFacts),
    attribution: clonePlain(attribution),
    share: share ? clonePlain(share) : null,
    requiredEvidence: [...requiredEvidence],
    payoutTruth: false,
    payoutTruthRule: PAYOUT_TRUTH_RULE,
    evidenceRequirements: [PAYOUT_TRUTH_RULE],
    warnings: [COMMON_WARNING, ...warnings],
  });
}

function validateStringField(facts, field, relationshipType) {
  if (isMissing(facts[field])) {
    return buildResult({
      relationshipType,
      status: RELATIONSHIP_ATTRIBUTION_STATUS.BLOCKED,
      reason: `missing_${field}`,
      inputFacts: facts,
      requiredEvidence: [field],
    });
  }

  if (!isNonEmptyString(facts[field])) {
    return buildResult({
      relationshipType,
      status: RELATIONSHIP_ATTRIBUTION_STATUS.UNKNOWN,
      reason: `invalid_${field}`,
      inputFacts: facts,
      requiredEvidence: [field],
    });
  }

  return null;
}

function validateDateField(facts, field, relationshipType) {
  if (isMissing(facts[field])) {
    return buildResult({
      relationshipType,
      status: RELATIONSHIP_ATTRIBUTION_STATUS.BLOCKED,
      reason: `missing_${field}`,
      inputFacts: facts,
      requiredEvidence: [field],
    });
  }

  if (!isIsoDateString(facts[field])) {
    return buildResult({
      relationshipType,
      status: RELATIONSHIP_ATTRIBUTION_STATUS.UNKNOWN,
      reason: `invalid_${field}`,
      inputFacts: facts,
      requiredEvidence: [field],
    });
  }

  return null;
}

function validateBooleanField(facts, field, relationshipType) {
  if (isMissing(facts[field])) {
    return buildResult({
      relationshipType,
      status: RELATIONSHIP_ATTRIBUTION_STATUS.BLOCKED,
      reason: `missing_${field}`,
      inputFacts: facts,
      requiredEvidence: [field],
    });
  }

  if (!isBoolean(facts[field])) {
    return buildResult({
      relationshipType,
      status: RELATIONSHIP_ATTRIBUTION_STATUS.UNKNOWN,
      reason: `invalid_${field}`,
      inputFacts: facts,
      requiredEvidence: [field],
    });
  }

  if (facts[field] !== true) {
    return buildResult({
      relationshipType,
      status: RELATIONSHIP_ATTRIBUTION_STATUS.BLOCKED,
      reason: `${field}_not_confirmed`,
      inputFacts: facts,
      requiredEvidence: [field],
    });
  }

  return null;
}

function validateEvidenceStatus(facts, relationshipType) {
  if (isMissing(facts.attributionEvidenceStatus)) {
    return buildResult({
      relationshipType,
      status: RELATIONSHIP_ATTRIBUTION_STATUS.PENDING,
      reason: 'pending_attribution_evidence_status',
      inputFacts: facts,
      requiredEvidence: ['attributionEvidenceStatus'],
    });
  }

  if (!Object.values(ATTRIBUTION_EVIDENCE_STATUS).includes(facts.attributionEvidenceStatus)) {
    return buildResult({
      relationshipType,
      status: RELATIONSHIP_ATTRIBUTION_STATUS.UNKNOWN,
      reason: 'invalid_attributionEvidenceStatus',
      inputFacts: facts,
      requiredEvidence: ['attributionEvidenceStatus'],
    });
  }

  if (facts.attributionEvidenceStatus !== ATTRIBUTION_EVIDENCE_STATUS.CONFIRMED_BY_OFFICIAL_RECORD) {
    return buildResult({
      relationshipType,
      status: RELATIONSHIP_ATTRIBUTION_STATUS.PENDING,
      reason: facts.attributionEvidenceStatus,
      inputFacts: facts,
      requiredEvidence: ['official_relationship_attribution_evidence'],
    });
  }

  return null;
}

function evaluateConnectionAttribution(input = {}) {
  const facts = isPlainObject(input.connectionAttribution)
    ? input.connectionAttribution
    : input;

  if (!isPlainObject(facts)) {
    return buildResult({
      relationshipType: RELATIONSHIP_TYPE.CONNECTION,
      status: RELATIONSHIP_ATTRIBUTION_STATUS.BLOCKED,
      reason: 'missing_connection_attribution_facts',
      inputFacts: {},
      requiredEvidence: ['connectionAttribution'],
    });
  }

  for (const field of ['connectorId', 'connectedAdvisorId']) {
    const result = validateStringField(facts, field, RELATIONSHIP_TYPE.CONNECTION);
    if (result) return result;
  }

  const dateResult = validateDateField(facts, 'connectionDate', RELATIONSHIP_TYPE.CONNECTION);
  if (dateResult) return dateResult;

  for (const field of ['connectorActiveAtMonthClose', 'connectedAdvisorActiveAtMonthClose']) {
    const result = validateBooleanField(facts, field, RELATIONSHIP_TYPE.CONNECTION);
    if (result) return result;
  }

  if (isMissing(facts.onboardingEvidence)) {
    return buildResult({
      relationshipType: RELATIONSHIP_TYPE.CONNECTION,
      status: RELATIONSHIP_ATTRIBUTION_STATUS.PENDING,
      reason: 'pending_onboarding_evidence',
      inputFacts: facts,
      requiredEvidence: ['onboardingEvidence'],
    });
  }

  const onboardingResult = validateBooleanField(facts, 'onboardingEvidence', RELATIONSHIP_TYPE.CONNECTION);
  if (onboardingResult) {
    if (onboardingResult.status === RELATIONSHIP_ATTRIBUTION_STATUS.BLOCKED) {
      return buildResult({
        relationshipType: RELATIONSHIP_TYPE.CONNECTION,
        status: RELATIONSHIP_ATTRIBUTION_STATUS.PENDING,
        reason: 'pending_onboarding_evidence',
        inputFacts: facts,
        requiredEvidence: ['onboardingEvidence'],
      });
    }

    return onboardingResult;
  }

  const evidenceStatusResult = validateEvidenceStatus(facts, RELATIONSHIP_TYPE.CONNECTION);
  if (evidenceStatusResult) return evidenceStatusResult;

  return buildResult({
    relationshipType: RELATIONSHIP_TYPE.CONNECTION,
    status: RELATIONSHIP_ATTRIBUTION_STATUS.CONFIRMED,
    reason: null,
    inputFacts: facts,
    attribution: {
      connectorId: facts.connectorId,
      connectedAdvisorId: facts.connectedAdvisorId,
      connectionDate: facts.connectionDate,
      connectorActiveAtMonthClose: facts.connectorActiveAtMonthClose,
      connectedAdvisorActiveAtMonthClose: facts.connectedAdvisorActiveAtMonthClose,
      onboardingEvidence: facts.onboardingEvidence,
      attributionEvidenceStatus: facts.attributionEvidenceStatus,
      confirmed: true,
    },
    requiredEvidence: [],
  });
}

function validateDeveloperShare(facts) {
  if (isMissing(facts.developerShare)) {
    return buildResult({
      relationshipType: RELATIONSHIP_TYPE.DEVELOPMENT,
      status: RELATIONSHIP_ATTRIBUTION_STATUS.BLOCKED,
      reason: 'missing_developerShare',
      inputFacts: facts,
      requiredEvidence: ['developerShare'],
    });
  }

  if (!isStrictNumber(facts.developerShare)) {
    return buildResult({
      relationshipType: RELATIONSHIP_TYPE.DEVELOPMENT,
      status: RELATIONSHIP_ATTRIBUTION_STATUS.UNKNOWN,
      reason: 'invalid_developerShare',
      inputFacts: facts,
      requiredEvidence: ['developerShare'],
    });
  }

  if (![1, 0.5].includes(facts.developerShare)) {
    return buildResult({
      relationshipType: RELATIONSHIP_TYPE.DEVELOPMENT,
      status: RELATIONSHIP_ATTRIBUTION_STATUS.NOT_MODELED,
      reason: 'unsupported_developerShare',
      inputFacts: facts,
      requiredEvidence: ['supportedDeveloperShareEvidence'],
    });
  }

  return null;
}

function evaluateDevelopmentAttribution(input = {}) {
  const facts = isPlainObject(input.developmentAttribution)
    ? input.developmentAttribution
    : input;

  if (!isPlainObject(facts)) {
    return buildResult({
      relationshipType: RELATIONSHIP_TYPE.DEVELOPMENT,
      status: RELATIONSHIP_ATTRIBUTION_STATUS.BLOCKED,
      reason: 'missing_development_attribution_facts',
      inputFacts: {},
      requiredEvidence: ['developmentAttribution'],
    });
  }

  for (const field of ['developerId', 'developedAdvisorId']) {
    const result = validateStringField(facts, field, RELATIONSHIP_TYPE.DEVELOPMENT);
    if (result) return result;
  }

  const dateResult = validateDateField(facts, 'developmentStartDate', RELATIONSHIP_TYPE.DEVELOPMENT);
  if (dateResult) return dateResult;

  const shareResult = validateDeveloperShare(facts);
  if (shareResult) return shareResult;

  for (const field of ['developerActiveAtMonthClose', 'developedAdvisorActiveAtMonthClose']) {
    const result = validateBooleanField(facts, field, RELATIONSHIP_TYPE.DEVELOPMENT);
    if (result) return result;
  }

  if (isMissing(facts.developerEligibilityEvidence)) {
    return buildResult({
      relationshipType: RELATIONSHIP_TYPE.DEVELOPMENT,
      status: RELATIONSHIP_ATTRIBUTION_STATUS.PENDING,
      reason: 'pending_developer_eligibility_evidence',
      inputFacts: facts,
      requiredEvidence: ['developerEligibilityEvidence'],
    });
  }

  const eligibilityResult = validateBooleanField(facts, 'developerEligibilityEvidence', RELATIONSHIP_TYPE.DEVELOPMENT);
  if (eligibilityResult) {
    if (eligibilityResult.status === RELATIONSHIP_ATTRIBUTION_STATUS.BLOCKED) {
      return buildResult({
        relationshipType: RELATIONSHIP_TYPE.DEVELOPMENT,
        status: RELATIONSHIP_ATTRIBUTION_STATUS.PENDING,
        reason: 'pending_developer_eligibility_evidence',
        inputFacts: facts,
        requiredEvidence: ['developerEligibilityEvidence'],
      });
    }

    return eligibilityResult;
  }

  const evidenceStatusResult = validateEvidenceStatus(facts, RELATIONSHIP_TYPE.DEVELOPMENT);
  if (evidenceStatusResult) return evidenceStatusResult;

  return buildResult({
    relationshipType: RELATIONSHIP_TYPE.DEVELOPMENT,
    status: RELATIONSHIP_ATTRIBUTION_STATUS.CONFIRMED,
    reason: null,
    inputFacts: facts,
    attribution: {
      developerId: facts.developerId,
      developedAdvisorId: facts.developedAdvisorId,
      developmentStartDate: facts.developmentStartDate,
      developerEligibilityEvidence: facts.developerEligibilityEvidence,
      developerActiveAtMonthClose: facts.developerActiveAtMonthClose,
      developedAdvisorActiveAtMonthClose: facts.developedAdvisorActiveAtMonthClose,
      attributionEvidenceStatus: facts.attributionEvidenceStatus,
      confirmed: true,
    },
    share: {
      developerShare: facts.developerShare,
    },
    requiredEvidence: [],
  });
}

function evaluateAdvisorRelationshipAttribution(input = {}) {
  if (input.relationshipType === RELATIONSHIP_TYPE.CONNECTION) {
    return evaluateConnectionAttribution(input.connectionAttribution || input.facts || input);
  }

  if (input.relationshipType === RELATIONSHIP_TYPE.DEVELOPMENT) {
    return evaluateDevelopmentAttribution(input.developmentAttribution || input.facts || input);
  }

  return buildResult({
    relationshipType: input.relationshipType || null,
    status: RELATIONSHIP_ATTRIBUTION_STATUS.NOT_MODELED,
    reason: 'relationship_type_not_modeled',
    inputFacts: input,
    requiredEvidence: ['relationshipType'],
  });
}

export {
  ATTRIBUTION_EVIDENCE_STATUS,
  RELATIONSHIP_ATTRIBUTION_STATUS,
  RELATIONSHIP_TYPE,
  evaluateAdvisorRelationshipAttribution,
  evaluateConnectionAttribution,
  evaluateDevelopmentAttribution,
};
