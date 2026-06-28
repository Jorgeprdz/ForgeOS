const LIFE_INITIAL_BONUS_CONCEPT_KEY = 'life-initial-bonus';

const LIFE_INITIAL_BONUS_STATUS = Object.freeze({
  CALCULATED_CANDIDATE: 'calculated_candidate',
  INELIGIBLE_NO_GROUP: 'ineligible_no_group',
  INELIGIBLE_POLICY_GOALS_NOT_MET: 'ineligible_policy_goals_not_met',
  INELIGIBLE_LIMRA_GOAL_NOT_MET: 'ineligible_limra_goal_not_met',
  BLOCKED_MISSING_INPUT: 'blocked_missing_input',
  NOT_MODELED: 'not_modeled',
  INVALID_RULE_PACK: 'invalid_rule_pack',
});

const PAYOUT_TRUTH_RULE = 'commission_statement_required';
const PAYMENT_MODE = Object.freeze({
  MONTHLY_ADVANCE: 'monthly_advance',
  SEMESTER_SETTLEMENT: 'semester_settlement',
});

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function isNumber(value) {
  return typeof value === 'number' && Number.isFinite(value);
}

function isMissing(value) {
  return value === null || value === undefined;
}

function clonePlain(value) {
  if (!isPlainObject(value) && !Array.isArray(value)) return value;

  return JSON.parse(JSON.stringify(value));
}

function roundMoney(value) {
  if (!isNumber(value)) return null;

  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function getLifeInitialConcept(rulePack) {
  return rulePack?.concepts?.[LIFE_INITIAL_BONUS_CONCEPT_KEY] || null;
}

function buildResult({
  status,
  reason = null,
  advisorFacts = null,
  eligibility = {},
  calculation = {},
  explainability = {},
  missingInputs = [],
  warnings = [],
} = {}) {
  return Object.freeze({
    conceptKey: LIFE_INITIAL_BONUS_CONCEPT_KEY,
    status,
    reason,
    candidateAmount: calculation.payableCandidate ?? null,
    advisorFacts: advisorFacts ? clonePlain(advisorFacts) : null,
    eligibility: {
      groupMet: null,
      policyGoalsMet: null,
      limraGoalMet: null,
      ...eligibility,
    },
    calculation: {
      currentGroup: null,
      effectiveGroup: null,
      minimumLimra: null,
      realRate: null,
      candidateRate: null,
      accumulatedPaidInitialPremium: null,
      calculatedInitialBonusCandidate: null,
      priorPaidBonusesInSemester: null,
      payableCandidate: null,
      ...calculation,
    },
    explainability: clonePlain(explainability),
    missingInputs: [...missingInputs],
    warnings: [...warnings],
    payoutTruth: false,
    payoutTruthRule: PAYOUT_TRUTH_RULE,
    evidenceRequirements: [PAYOUT_TRUTH_RULE],
  });
}

function validateRulePack(rulePack) {
  if (!isPlainObject(rulePack)) {
    return {
      valid: false,
      reason: 'missing_rule_pack',
    };
  }

  const concept = getLifeInitialConcept(rulePack);
  if (!isPlainObject(concept)) {
    return {
      valid: false,
      reason: 'missing_life_initial_bonus_concept',
    };
  }

  const requiredTables = [
    'targetPremiumGroupsTable',
    'policyGoalsTable',
    'minimumLimraByTenureTable',
    'bonusRateByGroupAndLimraTable',
    'contestMonth13To36MinimumRateFloor',
    'monthlyAdvanceGroupCapRule',
  ];

  for (const table of requiredTables) {
    if (!isPlainObject(concept[table]) && !Array.isArray(concept[table])) {
      return {
        valid: false,
        reason: `missing_${table}`,
      };
    }
  }

  return {
    valid: true,
    concept,
  };
}

function requiredInputNames(advisorFacts = {}) {
  const names = [
    'semesterNumber',
    'semesterMonth',
    'advisorContestMonth',
    'firstSemesterInNewProfessionalBook',
    'paymentMode',
    'accumulatedTargetPremium',
    'accumulatedPaidInitialPremium',
    'accumulatedInitialLifePoliciesPaid',
    'limra',
    'priorPaidBonusesInSemester',
  ];

  const semesterNumber = advisorFacts.semesterNumber;
  const semesterMonth = advisorFacts.semesterMonth;

  if (isNumber(semesterMonth) && semesterMonth >= 1 && semesterMonth <= 5) {
    names.push('monthlyInitialLifePoliciesPaid');
  }

  if (semesterNumber === 2) {
    names.push('annualInitialLifePoliciesPaid');
  }

  return names;
}

function validateAdvisorFacts(advisorFacts = {}) {
  if (!isPlainObject(advisorFacts)) {
    return {
      valid: false,
      missingInputs: ['advisorFacts'],
    };
  }

  const missingInputs = requiredInputNames(advisorFacts)
    .filter((field) => isMissing(advisorFacts[field]));

  if (missingInputs.length > 0) {
    return {
      valid: false,
      missingInputs,
    };
  }

  const numericFields = [
    'semesterNumber',
    'semesterMonth',
    'advisorContestMonth',
    'accumulatedTargetPremium',
    'accumulatedPaidInitialPremium',
    'accumulatedInitialLifePoliciesPaid',
    'limra',
    'priorPaidBonusesInSemester',
  ];

  if (advisorFacts.semesterMonth >= 1 && advisorFacts.semesterMonth <= 5) {
    numericFields.push('monthlyInitialLifePoliciesPaid');
  }

  if (advisorFacts.semesterNumber === 2) {
    numericFields.push('annualInitialLifePoliciesPaid');
  }

  const invalidInputs = numericFields.filter((field) => !isNumber(advisorFacts[field]));
  if (invalidInputs.length > 0) {
    return {
      valid: false,
      missingInputs: invalidInputs,
    };
  }

  if (![1, 2].includes(advisorFacts.semesterNumber)) {
    return {
      valid: false,
      missingInputs: ['semesterNumber'],
    };
  }

  if (advisorFacts.semesterMonth < 1 || advisorFacts.semesterMonth > 6) {
    return {
      valid: false,
      missingInputs: ['semesterMonth'],
    };
  }

  if (typeof advisorFacts.firstSemesterInNewProfessionalBook !== 'boolean') {
    return {
      valid: false,
      missingInputs: ['firstSemesterInNewProfessionalBook'],
    };
  }

  if (!Object.values(PAYMENT_MODE).includes(advisorFacts.paymentMode)) {
    return {
      valid: false,
      missingInputs: ['paymentMode'],
    };
  }

  if (!isMissing(advisorFacts.previousSemesterGroup) && !isNumber(advisorFacts.previousSemesterGroup)) {
    return {
      valid: false,
      missingInputs: ['previousSemesterGroup'],
    };
  }

  return {
    valid: true,
    missingInputs: [],
  };
}

function resolveLifeInitialTargetPremiumGroup({ concept, semesterMonth, accumulatedTargetPremium } = {}) {
  const table = concept?.targetPremiumGroupsTable;
  const index = semesterMonth - 1;

  if (!isPlainObject(table?.groups) || !isNumber(accumulatedTargetPremium) || !Number.isInteger(index)) {
    return null;
  }

  for (let group = 1; group <= 16; group += 1) {
    const threshold = table.groups[String(group)]?.[index];
    if (isNumber(threshold) && accumulatedTargetPremium >= threshold) {
      return {
        group,
        threshold,
      };
    }
  }

  return null;
}

function resolveLifeInitialMinimumLimra({ concept, advisorContestMonth } = {}) {
  const rows = concept?.minimumLimraByTenureTable;
  if (!Array.isArray(rows) || !isNumber(advisorContestMonth)) return null;

  const row = rows.find((candidate) => (
    advisorContestMonth >= candidate.fromMonth &&
    (candidate.toMonth === null || advisorContestMonth <= candidate.toMonth)
  ));

  return row?.minimumLimra ?? null;
}

function rateTierKeyForLimra({ limra, minimumLimra } = {}) {
  if (!isNumber(limra) || !isNumber(minimumLimra) || limra < minimumLimra) return null;
  if (limra >= 95.5) return '95.5';
  if (limra >= 91.5) return '91.5';
  if (limra >= 89.5) return '89.5';
  if (limra >= 87.5) return '87.5';
  return 'minimumIndex';
}

function resolveLifeInitialBonusRate({ concept, group, limra, minimumLimra } = {}) {
  const row = concept?.bonusRateByGroupAndLimraTable?.[String(group)];
  const tierKey = rateTierKeyForLimra({ limra, minimumLimra });

  if (!isPlainObject(row) || !tierKey || !isNumber(row[tierKey])) {
    return null;
  }

  return {
    rate: row[tierKey],
    tierKey,
  };
}

function evaluateLifeInitialPolicyGoals({ concept, advisorFacts } = {}) {
  const table = concept?.policyGoalsTable;
  const semesterMonthKey = String(advisorFacts?.semesterMonth);

  if (!isPlainObject(table)) {
    return {
      met: false,
      reason: 'missing_policy_goals_table',
    };
  }

  const monthlyGoal = table.monthlyLifePolicyGoalBySemesterMonth?.[semesterMonthKey];
  const semesterGoal = table.semesterAccumulatedPolicyGoals?.[semesterMonthKey];
  const annualGoal = table.annualPolicyGoalsSecondSemesterOnly?.[semesterMonthKey];

  const monthlyGoalMet = monthlyGoal === null
    ? true
    : advisorFacts.monthlyInitialLifePoliciesPaid >= monthlyGoal;
  const semesterGoalMet = advisorFacts.accumulatedInitialLifePoliciesPaid >= semesterGoal;
  const annualGoalMet = advisorFacts.semesterNumber === 2
    ? advisorFacts.annualInitialLifePoliciesPaid >= annualGoal
    : true;

  return {
    met: monthlyGoalMet && semesterGoalMet && annualGoalMet,
    monthlyGoal,
    monthlyGoalApplies: monthlyGoal !== null,
    monthlyGoalMet,
    semesterGoal,
    semesterGoalMet,
    annualGoal: advisorFacts.semesterNumber === 2 ? annualGoal : null,
    annualGoalApplies: advisorFacts.semesterNumber === 2,
    annualGoalMet,
  };
}

function resolveLifeInitialMonthlyAdvanceEffectiveGroup({
  concept,
  currentGroup,
  previousSemesterGroup = null,
  firstSemesterInNewProfessionalBook = false,
  paymentMode,
} = {}) {
  if (paymentMode !== PAYMENT_MODE.MONTHLY_ADVANCE) {
    return {
      effectiveGroup: currentGroup,
      capGroup: null,
      capApplied: false,
      reason: 'semester_settlement_uses_current_group',
    };
  }

  if (firstSemesterInNewProfessionalBook === true) {
    return {
      effectiveGroup: currentGroup,
      capGroup: null,
      capApplied: false,
      reason: 'first_semester_uses_current_group',
    };
  }

  const fallbackCapGroup = concept?.monthlyAdvanceGroupCapRule?.missingOrWorseThanGroup13CapGroup ?? 13;
  const capGroup = isNumber(previousSemesterGroup) && previousSemesterGroup <= fallbackCapGroup
    ? previousSemesterGroup
    : fallbackCapGroup;

  return {
    effectiveGroup: Math.max(currentGroup, capGroup),
    capGroup,
    capApplied: Math.max(currentGroup, capGroup) !== currentGroup,
    reason: 'monthly_advance_uses_worse_of_current_and_cap_group',
  };
}

function applyContestMonthFloor({ concept, advisorContestMonth, rate } = {}) {
  const floor = concept?.contestMonth13To36MinimumRateFloor;
  if (!isPlainObject(floor) || floor.enabled !== true) {
    return {
      rate,
      applied: false,
    };
  }

  if (advisorContestMonth >= floor.fromMonth && advisorContestMonth <= floor.toMonth) {
    return {
      rate: Math.max(rate, floor.minimumRate),
      applied: rate < floor.minimumRate,
    };
  }

  return {
    rate,
    applied: false,
  };
}

function calculateNewProfessionalLifeInitialBonusCandidate({ rulePack, advisorFacts } = {}) {
  const rulePackValidation = validateRulePack(rulePack);
  if (!rulePackValidation.valid) {
    return buildResult({
      status: rulePackValidation.reason === 'missing_rule_pack'
        ? LIFE_INITIAL_BONUS_STATUS.NOT_MODELED
        : LIFE_INITIAL_BONUS_STATUS.INVALID_RULE_PACK,
      reason: rulePackValidation.reason,
      advisorFacts,
      missingInputs: [rulePackValidation.reason],
    });
  }

  const concept = rulePackValidation.concept;
  const factsValidation = validateAdvisorFacts(advisorFacts);
  if (!factsValidation.valid) {
    return buildResult({
      status: LIFE_INITIAL_BONUS_STATUS.BLOCKED_MISSING_INPUT,
      reason: 'blocked_by_missing_or_unknown_input',
      advisorFacts,
      missingInputs: factsValidation.missingInputs,
    });
  }

  const groupMatch = resolveLifeInitialTargetPremiumGroup({
    concept,
    semesterMonth: advisorFacts.semesterMonth,
    accumulatedTargetPremium: advisorFacts.accumulatedTargetPremium,
  });

  if (!groupMatch) {
    return buildResult({
      status: LIFE_INITIAL_BONUS_STATUS.INELIGIBLE_NO_GROUP,
      reason: 'target_premium_below_all_groups',
      advisorFacts,
      eligibility: {
        groupMet: false,
      },
      calculation: {
        accumulatedPaidInitialPremium: advisorFacts.accumulatedPaidInitialPremium,
        priorPaidBonusesInSemester: advisorFacts.priorPaidBonusesInSemester,
      },
    });
  }

  const policyGoals = evaluateLifeInitialPolicyGoals({ concept, advisorFacts });
  if (!policyGoals.met) {
    return buildResult({
      status: LIFE_INITIAL_BONUS_STATUS.INELIGIBLE_POLICY_GOALS_NOT_MET,
      reason: 'policy_goals_not_met',
      advisorFacts,
      eligibility: {
        groupMet: true,
        policyGoalsMet: false,
        policyGoals,
      },
      calculation: {
        currentGroup: groupMatch.group,
        accumulatedPaidInitialPremium: advisorFacts.accumulatedPaidInitialPremium,
        priorPaidBonusesInSemester: advisorFacts.priorPaidBonusesInSemester,
      },
    });
  }

  const minimumLimra = resolveLifeInitialMinimumLimra({
    concept,
    advisorContestMonth: advisorFacts.advisorContestMonth,
  });

  if (!isNumber(minimumLimra)) {
    return buildResult({
      status: LIFE_INITIAL_BONUS_STATUS.INVALID_RULE_PACK,
      reason: 'missing_minimum_limra_for_tenure',
      advisorFacts,
      missingInputs: ['minimumLimraByTenureTable'],
    });
  }

  if (advisorFacts.limra < minimumLimra) {
    return buildResult({
      status: LIFE_INITIAL_BONUS_STATUS.INELIGIBLE_LIMRA_GOAL_NOT_MET,
      reason: 'limra_below_minimum',
      advisorFacts,
      eligibility: {
        groupMet: true,
        policyGoalsMet: true,
        limraGoalMet: false,
        policyGoals,
      },
      calculation: {
        currentGroup: groupMatch.group,
        minimumLimra,
        accumulatedPaidInitialPremium: advisorFacts.accumulatedPaidInitialPremium,
        priorPaidBonusesInSemester: advisorFacts.priorPaidBonusesInSemester,
      },
    });
  }

  const effectiveGroup = resolveLifeInitialMonthlyAdvanceEffectiveGroup({
    concept,
    currentGroup: groupMatch.group,
    previousSemesterGroup: advisorFacts.previousSemesterGroup,
    firstSemesterInNewProfessionalBook: advisorFacts.firstSemesterInNewProfessionalBook,
    paymentMode: advisorFacts.paymentMode,
  });
  const rateGroup = effectiveGroup.effectiveGroup;
  const rateResult = resolveLifeInitialBonusRate({
    concept,
    group: rateGroup,
    limra: advisorFacts.limra,
    minimumLimra,
  });

  if (!rateResult) {
    return buildResult({
      status: LIFE_INITIAL_BONUS_STATUS.INVALID_RULE_PACK,
      reason: 'missing_life_initial_bonus_rate',
      advisorFacts,
      missingInputs: ['bonusRateByGroupAndLimraTable'],
    });
  }

  const floorResult = applyContestMonthFloor({
    concept,
    advisorContestMonth: advisorFacts.advisorContestMonth,
    rate: rateResult.rate,
  });
  const calculatedInitialBonusCandidate = roundMoney(
    advisorFacts.accumulatedPaidInitialPremium * floorResult.rate,
  );
  const payableCandidate = roundMoney(
    calculatedInitialBonusCandidate - advisorFacts.priorPaidBonusesInSemester,
  );

  return buildResult({
    status: LIFE_INITIAL_BONUS_STATUS.CALCULATED_CANDIDATE,
    reason: null,
    advisorFacts,
    eligibility: {
      groupMet: true,
      policyGoalsMet: true,
      limraGoalMet: true,
      policyGoals,
    },
    calculation: {
      currentGroup: groupMatch.group,
      effectiveGroup: rateGroup,
      minimumLimra,
      realRate: rateResult.rate,
      candidateRate: floorResult.rate,
      accumulatedPaidInitialPremium: advisorFacts.accumulatedPaidInitialPremium,
      calculatedInitialBonusCandidate,
      priorPaidBonusesInSemester: advisorFacts.priorPaidBonusesInSemester,
      payableCandidate,
    },
    explainability: {
      targetPremiumThreshold: groupMatch.threshold,
      paymentMode: advisorFacts.paymentMode,
      rateTierKey: rateResult.tierKey,
      monthlyAdvanceGroupCap: effectiveGroup,
      contestMonth13To36FloorApplied: floorResult.applied,
      rateGroup,
    },
  });
}

export {
  LIFE_INITIAL_BONUS_CONCEPT_KEY,
  LIFE_INITIAL_BONUS_STATUS,
  calculateNewProfessionalLifeInitialBonusCandidate,
  evaluateLifeInitialPolicyGoals,
  resolveLifeInitialBonusRate,
  resolveLifeInitialMinimumLimra,
  resolveLifeInitialMonthlyAdvanceEffectiveGroup,
  resolveLifeInitialTargetPremiumGroup,
};
