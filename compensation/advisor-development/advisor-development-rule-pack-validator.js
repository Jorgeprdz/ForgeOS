const EXPECTED_RULE_PACK_ID = 'smnyl-advisor-development-2026';
const EXPECTED_SOURCE_EVIDENCE_REF = 'CC 2026 Asesores en Desarrollo.pdf';

const VALID_GOVERNANCE_STATUSES = new Set(['draft', 'official']);

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

function hasOwn(value, key) {
  return Object.prototype.hasOwnProperty.call(value || {}, key);
}

function getIdentityContainer(rulePack) {
  if (isPlainObject(rulePack?.metadata)) return rulePack.metadata;
  if (isPlainObject(rulePack?.identity)) return rulePack.identity;

  return rulePack || {};
}

function readIdentity(rulePack) {
  const identity = getIdentityContainer(rulePack);

  return {
    rulePackId: identity.rulePackId ?? rulePack?.rulePackId,
    rulePackVersion: identity.rulePackVersion ?? identity.version ?? rulePack?.rulePackVersion,
    rulePackHash: identity.rulePackHash ?? rulePack?.rulePackHash,
    rulePackEffectiveDate: identity.rulePackEffectiveDate ?? identity.effectiveDate ?? rulePack?.rulePackEffectiveDate,
    governanceStatus: identity.governanceStatus ?? rulePack?.governanceStatus ?? rulePack?.status,
  };
}

function collectSourceEvidenceRefs(rulePack) {
  const refs = [];

  const candidates = [
    rulePack?.sourceEvidenceRefs,
    rulePack?.metadata?.sourceEvidenceRefs,
    rulePack?.identity?.sourceEvidenceRefs,
    rulePack?.source?.sourceEvidenceRefs,
    rulePack?.source?.evidenceRefs,
    rulePack?.source?.documents,
    rulePack?.source?.document,
    rulePack?.source?.fileName,
    rulePack?.source?.filename,
    rulePack?.source?.pdf,
    rulePack?.source?.name,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      refs.push(...candidate);
    } else if (typeof candidate === 'string') {
      refs.push(candidate);
    } else if (isPlainObject(candidate)) {
      for (const value of Object.values(candidate)) {
        if (typeof value === 'string') refs.push(value);
      }
    }
  }

  return refs.filter(Boolean);
}

function isValidDateString(value) {
  if (typeof value !== 'string' || value.trim() === '') return false;

  const time = Date.parse(value);

  return Number.isFinite(time);
}

function isNumber(value) {
  return typeof value === 'number' && Number.isFinite(value);
}

function validateIdentity(rulePack, validationErrors) {
  const identity = readIdentity(rulePack);

  if (identity.rulePackId !== EXPECTED_RULE_PACK_ID) {
    validationErrors.push(createIssue(
      'invalid_rule_pack_id',
      `rulePackId must be ${EXPECTED_RULE_PACK_ID}`,
      'metadata.rulePackId',
    ));
  }

  if (!identity.rulePackVersion || typeof identity.rulePackVersion !== 'string') {
    validationErrors.push(createIssue(
      'missing_rule_pack_version',
      'rulePackVersion is required',
      'metadata.rulePackVersion',
    ));
  }

  if (!identity.rulePackHash || typeof identity.rulePackHash !== 'string') {
    validationErrors.push(createIssue(
      'missing_rule_pack_hash',
      'rulePackHash is required',
      'metadata.rulePackHash',
    ));
  }

  if (!isValidDateString(identity.rulePackEffectiveDate)) {
    validationErrors.push(createIssue(
      'missing_or_invalid_rule_pack_effective_date',
      'rulePackEffectiveDate must be a valid date string',
      'metadata.rulePackEffectiveDate',
    ));
  }

  if (!VALID_GOVERNANCE_STATUSES.has(identity.governanceStatus)) {
    validationErrors.push(createIssue(
      'invalid_governance_status',
      'governanceStatus must be draft or official',
      'metadata.governanceStatus',
    ));
  }

  if (identity.rulePackHash === 'draft:not-sealed' && identity.governanceStatus !== 'draft') {
    validationErrors.push(createIssue(
      'draft_hash_requires_draft_status',
      'draft:not-sealed hash is only allowed when governanceStatus is draft',
      'metadata.rulePackHash',
    ));
  }
}

function validateSourceEvidence(rulePack, validationErrors) {
  const refs = collectSourceEvidenceRefs(rulePack);

  if (!refs.includes(EXPECTED_SOURCE_EVIDENCE_REF)) {
    validationErrors.push(createIssue(
      'missing_official_source_evidence_ref',
      `sourceEvidenceRefs must include ${EXPECTED_SOURCE_EVIDENCE_REF}`,
      'sourceEvidenceRefs',
    ));
  }
}

function validatePayoutTruthRule(rulePack, validationErrors) {
  if (!isPlainObject(rulePack?.globalRules)) {
    validationErrors.push(createIssue(
      'missing_global_rules',
      'globalRules is required',
      'globalRules',
    ));
    return;
  }

  if (rulePack.globalRules.payoutTruth !== false) {
    validationErrors.push(createIssue(
      'invalid_payout_truth_default',
      'globalRules.payoutTruth must be explicitly false',
      'globalRules.payoutTruth',
    ));
  }
}

function validateCountingAndWeightingRules(rulePack, validationErrors) {
  const rules = rulePack?.countingAndWeightingRules;

  if (!isPlainObject(rules)) {
    validationErrors.push(createIssue(
      'missing_counting_and_weighting_rules',
      'countingAndWeightingRules is required',
      'countingAndWeightingRules',
    ));
    return;
  }

  if (!Array.isArray(rules.excludedProducts)) {
    validationErrors.push(createIssue(
      'missing_excluded_products',
      'countingAndWeightingRules.excludedProducts must be an array',
      'countingAndWeightingRules.excludedProducts',
    ));
  }

  if (!Array.isArray(rules.excludedComponents)) {
    validationErrors.push(createIssue(
      'missing_excluded_components',
      'countingAndWeightingRules.excludedComponents must be an array',
      'countingAndWeightingRules.excludedComponents',
    ));
  }

  if (!isNumber(rules?.vidaIndividual?.commissionFactor)) {
    validationErrors.push(createIssue(
      'missing_life_commission_factor',
      'vidaIndividual.commissionFactor must be a number',
      'countingAndWeightingRules.vidaIndividual.commissionFactor',
    ));
  }

  if (!isNumber(rules?.gmmi?.commissionFactor)) {
    validationErrors.push(createIssue(
      'missing_gmmi_commission_factor',
      'gmmi.commissionFactor must be a number',
      'countingAndWeightingRules.gmmi.commissionFactor',
    ));
  }

  if (!isNumber(rules?.gmmi?.ageExclusion?.minAgeExcluded)) {
    validationErrors.push(createIssue(
      'missing_gmmi_min_age_excluded',
      'gmmi.ageExclusion.minAgeExcluded must be a number',
      'countingAndWeightingRules.gmmi.ageExclusion.minAgeExcluded',
    ));
  }
}

function validateDraftCompleteness(rulePack, validationWarnings) {
  if (!hasOwn(rulePack, 'qualificationRules')) {
    validationWarnings.push(createIssue(
      'qualification_rules_allowed_missing_in_draft',
      'qualificationRules is allowed as draft warning, but must be added before official sealing',
      'qualificationRules',
    ));
  }

  if (!hasOwn(rulePack, 'concepts')) {
    validationWarnings.push(createIssue(
      'concepts_allowed_missing_in_draft',
      'concepts is allowed as draft warning, but must be added before official sealing',
      'concepts',
    ));
  }
}

export function validateAdvisorDevelopmentRulePack(rulePack) {
  const validationErrors = [];
  const validationWarnings = [];

  if (!isPlainObject(rulePack)) {
    return {
      isValid: false,
      validationErrors: [
        createIssue(
          'invalid_rule_pack_object',
          'rulePack must be a plain object',
          null,
        ),
      ],
      validationWarnings,
    };
  }

  validateIdentity(rulePack, validationErrors);
  validateSourceEvidence(rulePack, validationErrors);
  validatePayoutTruthRule(rulePack, validationErrors);
  validateCountingAndWeightingRules(rulePack, validationErrors);
  validateDraftCompleteness(rulePack, validationWarnings);

  return {
    isValid: validationErrors.length === 0,
    validationErrors,
    validationWarnings,
  };
}

export {
  EXPECTED_RULE_PACK_ID,
  EXPECTED_SOURCE_EVIDENCE_REF,
};
