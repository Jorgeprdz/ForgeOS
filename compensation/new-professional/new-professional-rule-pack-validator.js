const NEW_PROFESSIONAL_RULE_PACK_ID = 'smnyl-new-professional-2026';
const NEW_PROFESSIONAL_SOURCE_DOCUMENT = 'CC 2026 Asesores Nuevos Profesionales';
const NEW_PROFESSIONAL_PARTICIPANT_TYPE = 'new_professional_advisor';
const NEW_PROFESSIONAL_PAYOUT_TRUTH_RULE = 'commission_statement_required';

const REQUIRED_NEW_PROFESSIONAL_CONCEPT_KEYS = Object.freeze([
  'life-initial-bonus',
  'life-renewal-bonus',
  'gmmi-initial-premium-bonus',
  'gmmi-initial-premium-growth-annual-bonus',
  'gmmi-renewal-premium-bonus',
  'gmmi-loss-ratio-annual-bonus',
  'connection-bonus',
  'development-bonus',
  'temporary-total-disability-benefit',
  'death-benefit',
]);

const REQUIRED_GLOBAL_EXCLUSION_KEYS = Object.freeze([
  'personalPoliciesExcluded',
  'legalEntitiesExcluded',
  'onlyDefinitiveKeys',
  'activeAdvisorsOnly',
  'payrollDiscountExcluded',
  'aveExcluded',
  'additionalUniversalProductContributionsExcluded',
  'gmmiInitialPremiumsCommissionsExcludedForInsuredAge60Plus',
  'paidAppliedAtCloseRequired',
  'canceledPoliciesMayBeDeductedRecalculated',
]);

function createIssue(code, message, path = null) {
  return {
    code,
    message,
    path,
  };
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function isString(value) {
  return typeof value === 'string' && value.trim() !== '';
}

function isValidDateString(value) {
  if (!isString(value)) return false;

  return Number.isFinite(Date.parse(value));
}

function validateIdentity(rulePack, errors) {
  if (rulePack.rulePackId !== NEW_PROFESSIONAL_RULE_PACK_ID) {
    errors.push(createIssue(
      'invalid_rule_pack_id',
      `rulePackId must be ${NEW_PROFESSIONAL_RULE_PACK_ID}`,
      'rulePackId',
    ));
  }

  if (rulePack.rulePackId === 'smnyl-partner-compensation-2026' ||
    rulePack.rulePackId === 'smnyl-advisor-development-2026') {
    errors.push(createIssue(
      'wrong_compensation_domain_rule_pack_id',
      'Partner and Advisor Development rule packs are not valid New Professional rule packs',
      'rulePackId',
    ));
  }

  if (rulePack.sourceDocument !== NEW_PROFESSIONAL_SOURCE_DOCUMENT) {
    errors.push(createIssue(
      'invalid_source_document',
      `sourceDocument must be ${NEW_PROFESSIONAL_SOURCE_DOCUMENT}`,
      'sourceDocument',
    ));
  }

  if (!isValidDateString(rulePack.effectiveFrom)) {
    errors.push(createIssue(
      'missing_or_invalid_effective_from',
      'effectiveFrom must be a valid date string',
      'effectiveFrom',
    ));
  }

  if (!isValidDateString(rulePack.effectiveTo)) {
    errors.push(createIssue(
      'missing_or_invalid_effective_to',
      'effectiveTo must be a valid date string',
      'effectiveTo',
    ));
  }

  if (rulePack.currency !== 'MXN') {
    errors.push(createIssue(
      'invalid_currency',
      'currency must be MXN',
      'currency',
    ));
  }

  if (rulePack.participantType !== NEW_PROFESSIONAL_PARTICIPANT_TYPE) {
    errors.push(createIssue(
      'invalid_participant_type',
      `participantType must be ${NEW_PROFESSIONAL_PARTICIPANT_TYPE}`,
      'participantType',
    ));
  }
}

function validatePayoutTruth(rulePack, errors) {
  if (rulePack.payoutTruth !== false) {
    errors.push(createIssue(
      'invalid_payout_truth',
      'payoutTruth must be explicitly false',
      'payoutTruth',
    ));
  }

  if (rulePack.payoutTruthRule !== NEW_PROFESSIONAL_PAYOUT_TRUTH_RULE) {
    errors.push(createIssue(
      'invalid_payout_truth_rule',
      `payoutTruthRule must be ${NEW_PROFESSIONAL_PAYOUT_TRUTH_RULE}`,
      'payoutTruthRule',
    ));
  }
}

function validateGlobalExclusions(rulePack, errors) {
  if (!isPlainObject(rulePack.globalExclusions)) {
    errors.push(createIssue(
      'missing_global_exclusions',
      'globalExclusions is required',
      'globalExclusions',
    ));
    return;
  }

  for (const key of REQUIRED_GLOBAL_EXCLUSION_KEYS) {
    if (rulePack.globalExclusions[key] !== true) {
      errors.push(createIssue(
        'missing_global_exclusion',
        `globalExclusions.${key} must be explicitly true`,
        `globalExclusions.${key}`,
      ));
    }
  }
}

function validateConcepts(rulePack, errors) {
  if (!isPlainObject(rulePack.concepts)) {
    errors.push(createIssue(
      'missing_concepts',
      'concepts is required',
      'concepts',
    ));
    return;
  }

  const actualConceptKeys = Object.keys(rulePack.concepts).sort();
  const requiredConceptKeys = [...REQUIRED_NEW_PROFESSIONAL_CONCEPT_KEYS].sort();

  for (const conceptKey of requiredConceptKeys) {
    if (!isPlainObject(rulePack.concepts[conceptKey])) {
      errors.push(createIssue(
        'missing_required_concept',
        `${conceptKey} is required`,
        `concepts.${conceptKey}`,
      ));
    }
  }

  const extraConceptKeys = actualConceptKeys.filter((conceptKey) => !requiredConceptKeys.includes(conceptKey));
  if (extraConceptKeys.length > 0) {
    errors.push(createIssue(
      'unexpected_concept',
      `Unexpected concept keys: ${extraConceptKeys.join(', ')}`,
      'concepts',
    ));
  }

  for (const conceptKey of REQUIRED_NEW_PROFESSIONAL_CONCEPT_KEYS) {
    const concept = rulePack.concepts[conceptKey];
    if (!isPlainObject(concept)) continue;

    for (const field of ['displayName', 'category', 'cadence', 'modelStatus']) {
      if (!isString(concept[field])) {
        errors.push(createIssue(
          'invalid_concept_field',
          `${conceptKey}.${field} must be a non-empty string`,
          `concepts.${conceptKey}.${field}`,
        ));
      }
    }

    if (concept.modelStatus !== 'skeleton_not_calculated') {
      errors.push(createIssue(
        'invalid_concept_model_status',
        `${conceptKey}.modelStatus must be skeleton_not_calculated`,
        `concepts.${conceptKey}.modelStatus`,
      ));
    }

    if (concept.payoutTruth !== false) {
      errors.push(createIssue(
        'invalid_concept_payout_truth',
        `${conceptKey}.payoutTruth must be explicitly false`,
        `concepts.${conceptKey}.payoutTruth`,
      ));
    }

    if (concept.payoutTruthRule !== NEW_PROFESSIONAL_PAYOUT_TRUTH_RULE) {
      errors.push(createIssue(
        'invalid_concept_payout_truth_rule',
        `${conceptKey}.payoutTruthRule must be ${NEW_PROFESSIONAL_PAYOUT_TRUTH_RULE}`,
        `concepts.${conceptKey}.payoutTruthRule`,
      ));
    }

    if (!Array.isArray(concept.sourceEvidence) || concept.sourceEvidence.length === 0) {
      errors.push(createIssue(
        'missing_concept_source_evidence',
        `${conceptKey}.sourceEvidence must include official source evidence`,
        `concepts.${conceptKey}.sourceEvidence`,
      ));
    }
  }
}

function validateNewProfessionalRulePack(rulePack) {
  const errors = [];
  const warnings = [];

  if (!isPlainObject(rulePack)) {
    return {
      valid: false,
      errors: [
        createIssue(
          'invalid_rule_pack_object',
          'rulePack must be a plain object',
          null,
        ),
      ],
      warnings,
    };
  }

  validateIdentity(rulePack, errors);
  validatePayoutTruth(rulePack, errors);
  validateGlobalExclusions(rulePack, errors);
  validateConcepts(rulePack, errors);

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

export {
  NEW_PROFESSIONAL_PARTICIPANT_TYPE,
  NEW_PROFESSIONAL_PAYOUT_TRUTH_RULE,
  NEW_PROFESSIONAL_RULE_PACK_ID,
  NEW_PROFESSIONAL_SOURCE_DOCUMENT,
  REQUIRED_GLOBAL_EXCLUSION_KEYS,
  REQUIRED_NEW_PROFESSIONAL_CONCEPT_KEYS,
  validateNewProfessionalRulePack,
};
