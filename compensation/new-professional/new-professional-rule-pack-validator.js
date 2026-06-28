const NEW_PROFESSIONAL_RULE_PACK_ID = 'smnyl-new-professional-2026';
const NEW_PROFESSIONAL_SOURCE_DOCUMENT = 'CC 2026 Asesores Nuevos Profesionales';
const NEW_PROFESSIONAL_PARTICIPANT_TYPE = 'new_professional_advisor';
const NEW_PROFESSIONAL_PAYOUT_TRUTH_RULE = 'commission_statement_required';
const LIFE_INITIAL_BONUS_CONCEPT_KEY = 'life-initial-bonus';
const LIFE_RENEWAL_BONUS_CONCEPT_KEY = 'life-renewal-bonus';
const GMMI_INITIAL_PREMIUM_BONUS_CONCEPT_KEY = 'gmmi-initial-premium-bonus';

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

function isNumber(value) {
  return typeof value === 'number' && Number.isFinite(value);
}

function isValidDateString(value) {
  if (!isString(value)) return false;

  return Number.isFinite(Date.parse(value));
}

function validateLifeInitialBonusConcept(concept, errors) {
  if (concept.modelStatus !== 'implemented_candidate') {
    errors.push(createIssue(
      'invalid_life_initial_bonus_model_status',
      'life-initial-bonus.modelStatus must be implemented_candidate',
      'concepts.life-initial-bonus.modelStatus',
    ));
  }

  const targetPremiumGroupsTable = concept.targetPremiumGroupsTable;
  if (!isPlainObject(targetPremiumGroupsTable) ||
    targetPremiumGroupsTable.unit !== 'MXN' ||
    !Array.isArray(targetPremiumGroupsTable.semesterMonths) ||
    targetPremiumGroupsTable.semesterMonths.length !== 6 ||
    !isPlainObject(targetPremiumGroupsTable.groups)) {
    errors.push(createIssue(
      'missing_life_initial_target_premium_groups_table',
      'life-initial-bonus.targetPremiumGroupsTable is required',
      'concepts.life-initial-bonus.targetPremiumGroupsTable',
    ));
  } else {
    for (let group = 1; group <= 16; group += 1) {
      const row = targetPremiumGroupsTable.groups[String(group)];
      if (!Array.isArray(row) || row.length !== 6 || !row.every(isNumber)) {
        errors.push(createIssue(
          'invalid_life_initial_target_premium_group_row',
          `life-initial-bonus target premium group ${group} must contain 6 numeric values`,
          `concepts.life-initial-bonus.targetPremiumGroupsTable.groups.${group}`,
        ));
      }
    }
  }

  const policyGoalsTable = concept.policyGoalsTable;
  if (!isPlainObject(policyGoalsTable) ||
    !isPlainObject(policyGoalsTable.monthlyLifePolicyGoalBySemesterMonth) ||
    !isPlainObject(policyGoalsTable.semesterAccumulatedPolicyGoals) ||
    !isPlainObject(policyGoalsTable.annualPolicyGoalsSecondSemesterOnly)) {
    errors.push(createIssue(
      'missing_life_initial_policy_goals_table',
      'life-initial-bonus.policyGoalsTable is required',
      'concepts.life-initial-bonus.policyGoalsTable',
    ));
  } else {
    for (let month = 1; month <= 6; month += 1) {
      const key = String(month);
      const monthlyGoal = policyGoalsTable.monthlyLifePolicyGoalBySemesterMonth[key];
      if (month < 6 && monthlyGoal !== 1) {
        errors.push(createIssue(
          'invalid_life_initial_monthly_policy_goal',
          'monthly life policy goal must be 1 for months 1 through 5',
          `concepts.life-initial-bonus.policyGoalsTable.monthlyLifePolicyGoalBySemesterMonth.${key}`,
        ));
      }
      if (month === 6 && monthlyGoal !== null) {
        errors.push(createIssue(
          'invalid_life_initial_month6_policy_goal',
          'monthly life policy goal must not apply at month 6 semester close',
          'concepts.life-initial-bonus.policyGoalsTable.monthlyLifePolicyGoalBySemesterMonth.6',
        ));
      }
      if (!isNumber(policyGoalsTable.semesterAccumulatedPolicyGoals[key])) {
        errors.push(createIssue(
          'invalid_life_initial_semester_policy_goal',
          'semester accumulated policy goals must be numeric for months 1 through 6',
          `concepts.life-initial-bonus.policyGoalsTable.semesterAccumulatedPolicyGoals.${key}`,
        ));
      }
      if (!isNumber(policyGoalsTable.annualPolicyGoalsSecondSemesterOnly[key])) {
        errors.push(createIssue(
          'invalid_life_initial_annual_policy_goal',
          'second semester annual policy goals must be numeric for months 1 through 6',
          `concepts.life-initial-bonus.policyGoalsTable.annualPolicyGoalsSecondSemesterOnly.${key}`,
        ));
      }
    }
  }

  if (!Array.isArray(concept.minimumLimraByTenureTable) ||
    concept.minimumLimraByTenureTable.length !== 3 ||
    !concept.minimumLimraByTenureTable.every((row) => isPlainObject(row) &&
      isNumber(row.fromMonth) &&
      (row.toMonth === null || isNumber(row.toMonth)) &&
      isNumber(row.minimumLimra))) {
    errors.push(createIssue(
      'missing_life_initial_minimum_limra_by_tenure_table',
      'life-initial-bonus.minimumLimraByTenureTable is required',
      'concepts.life-initial-bonus.minimumLimraByTenureTable',
    ));
  }

  const rateTable = concept.bonusRateByGroupAndLimraTable;
  if (!isPlainObject(rateTable)) {
    errors.push(createIssue(
      'missing_life_initial_bonus_rate_table',
      'life-initial-bonus.bonusRateByGroupAndLimraTable is required',
      'concepts.life-initial-bonus.bonusRateByGroupAndLimraTable',
    ));
  } else {
    for (let group = 1; group <= 16; group += 1) {
      const row = rateTable[String(group)];
      if (!isPlainObject(row) ||
        !['minimumIndex', '87.5', '89.5', '91.5', '95.5'].every((key) => isNumber(row[key]))) {
        errors.push(createIssue(
          'invalid_life_initial_bonus_rate_group',
          `life-initial-bonus bonus rate group ${group} must include all rate tiers`,
          `concepts.life-initial-bonus.bonusRateByGroupAndLimraTable.${group}`,
        ));
      }
    }
  }

  const floor = concept.contestMonth13To36MinimumRateFloor;
  if (!isPlainObject(floor) ||
    floor.enabled !== true ||
    floor.fromMonth !== 13 ||
    floor.toMonth !== 36 ||
    floor.minimumRate !== 0.098) {
    errors.push(createIssue(
      'missing_life_initial_contest_month_13_36_floor',
      'life-initial-bonus.contestMonth13To36MinimumRateFloor is required',
      'concepts.life-initial-bonus.contestMonth13To36MinimumRateFloor',
    ));
  }

  const capRule = concept.monthlyAdvanceGroupCapRule;
  if (!isPlainObject(capRule) ||
    capRule.firstSemesterInNewProfessionalBook !== 'use_current_calculated_group' ||
    capRule.missingOrWorseThanGroup13CapGroup !== 13 ||
    capRule.effectiveMonthlyAdvanceGroupStrategy !== 'worse_of_current_group_and_cap_group' ||
    capRule.semesterSettlementGroupStrategy !== 'use_actual_current_group') {
    errors.push(createIssue(
      'missing_life_initial_monthly_advance_group_cap_rule',
      'life-initial-bonus.monthlyAdvanceGroupCapRule is required',
      'concepts.life-initial-bonus.monthlyAdvanceGroupCapRule',
    ));
  }
}

function validateLifeRenewalBonusConcept(concept, errors) {
  if (concept.modelStatus !== 'implemented_candidate') {
    errors.push(createIssue(
      'invalid_life_renewal_bonus_model_status',
      'life-renewal-bonus.modelStatus must be implemented_candidate',
      'concepts.life-renewal-bonus.modelStatus',
    ));
  }

  const metadata = concept.igcTierMetadata;
  if (!isPlainObject(metadata) ||
    metadata.minimumIgc !== 91 ||
    !Array.isArray(metadata.tierColumns) ||
    ![91, 92.5, 95, 95.75].every((tier) => metadata.tierColumns.includes(tier)) ||
    !Array.isArray(metadata.tierResolution)) {
    errors.push(createIssue(
      'missing_life_renewal_igc_tier_metadata',
      'life-renewal-bonus.igcTierMetadata with minimumIgc and tiers is required',
      'concepts.life-renewal-bonus.igcTierMetadata',
    ));
  }

  const rateTable = concept.bonusRateByGroupAndIgcTable;
  if (!isPlainObject(rateTable)) {
    errors.push(createIssue(
      'missing_life_renewal_bonus_rate_table',
      'life-renewal-bonus.bonusRateByGroupAndIgcTable is required',
      'concepts.life-renewal-bonus.bonusRateByGroupAndIgcTable',
    ));
  } else {
    for (let group = 1; group <= 16; group += 1) {
      const row = rateTable[String(group)];
      if (!isPlainObject(row) || !['91', '92.5', '95', '95.75'].every((tier) => isNumber(row[tier]))) {
        errors.push(createIssue(
          'invalid_life_renewal_bonus_rate_group',
          `life-renewal-bonus bonus rate group ${group} must include all IGC tiers`,
          `concepts.life-renewal-bonus.bonusRateByGroupAndIgcTable.${group}`,
        ));
      }
    }
  }
}

function validateGmmiInitialPremiumBonusConcept(concept, errors) {
  if (concept.modelStatus !== 'implemented_candidate') {
    errors.push(createIssue(
      'invalid_gmmi_initial_premium_bonus_model_status',
      'gmmi-initial-premium-bonus.modelStatus must be implemented_candidate',
      'concepts.gmmi-initial-premium-bonus.modelStatus',
    ));
  }

  const table = concept.gmmiInitialPremiumQuarterlyBonusTable;
  if (!isPlainObject(table) || table.unit !== 'MXN' || !isPlainObject(table.groups)) {
    errors.push(createIssue(
      'missing_gmmi_initial_premium_quarterly_bonus_table',
      'gmmi-initial-premium-bonus.gmmiInitialPremiumQuarterlyBonusTable is required',
      'concepts.gmmi-initial-premium-bonus.gmmiInitialPremiumQuarterlyBonusTable',
    ));
    return;
  }

  for (let group = 1; group <= 7; group += 1) {
    const row = table.groups[String(group)];
    if (!isPlainObject(row) ||
      row.group !== group ||
      !isNumber(row.month1PremiumGoal) ||
      !isNumber(row.month2PremiumGoal) ||
      !isNumber(row.month3PremiumGoal) ||
      !isNumber(row.policyGoal) ||
      !isNumber(row.bonusRate)) {
      errors.push(createIssue(
        'invalid_gmmi_initial_premium_quarterly_bonus_group',
        `gmmi-initial-premium-bonus group ${group} must include group, premium goals, policyGoal and bonusRate`,
        `concepts.gmmi-initial-premium-bonus.gmmiInitialPremiumQuarterlyBonusTable.groups.${group}`,
      ));
    }
  }
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

    if (conceptKey === LIFE_INITIAL_BONUS_CONCEPT_KEY && concept.modelStatus === 'implemented_candidate') {
      validateLifeInitialBonusConcept(concept, errors);
    } else if (conceptKey === LIFE_RENEWAL_BONUS_CONCEPT_KEY && concept.modelStatus === 'implemented_candidate') {
      validateLifeRenewalBonusConcept(concept, errors);
    } else if (conceptKey === GMMI_INITIAL_PREMIUM_BONUS_CONCEPT_KEY && concept.modelStatus === 'implemented_candidate') {
      validateGmmiInitialPremiumBonusConcept(concept, errors);
    } else if (concept.modelStatus !== 'skeleton_not_calculated') {
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
  GMMI_INITIAL_PREMIUM_BONUS_CONCEPT_KEY,
  LIFE_INITIAL_BONUS_CONCEPT_KEY,
  LIFE_RENEWAL_BONUS_CONCEPT_KEY,
  NEW_PROFESSIONAL_PARTICIPANT_TYPE,
  NEW_PROFESSIONAL_PAYOUT_TRUTH_RULE,
  NEW_PROFESSIONAL_RULE_PACK_ID,
  NEW_PROFESSIONAL_SOURCE_DOCUMENT,
  REQUIRED_GLOBAL_EXCLUSION_KEYS,
  REQUIRED_NEW_PROFESSIONAL_CONCEPT_KEYS,
  validateNewProfessionalRulePack,
};
