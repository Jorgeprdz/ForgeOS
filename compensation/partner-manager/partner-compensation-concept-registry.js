import {
  PARTNER_COMPENSATION_CONCEPT_KEYS,
} from './partner-compensation-input-gate.js';

import {
  PARTNER_RULE_PACK_READINESS,
} from './rule-pack-readiness.js';

import {
  loadPartner2026RulePack,
} from './partner-2026-rule-pack-loader.js';

export const PARTNER_CONCEPT_CATEGORIES = Object.freeze({
  PRODUCTIVITY: 'productivity',
  PRODUCTION: 'production',
  ACTIVITY: 'activity',
  SUPPORT: 'support',
  TRANSITION: 'transition',
  CONNECTION: 'connection',
  DEVELOPMENT: 'development',
  PROMOTION: 'promotion',
  UNKNOWN: 'unknown',
});

export const PARTNER_CONCEPT_CALCULATION_MODES = Object.freeze({
  FULL_CANDIDATE: 'full_candidate',
  CANDIDATE_WITH_CAUTION: 'candidate_with_caution',
  SEMANTIC_ONLY: 'semantic_only',
  PARTIAL_BLOCKED: 'partial_blocked',
  EXAMPLE_ONLY: 'example_only',
  NOT_CALCULABLE: 'not_calculable',
  UNKNOWN: 'unknown',
});

export const PARTNER_CONCEPT_PAYOUT_GATE_MODES = Object.freeze({
  OFFICIAL_STATEMENT_REQUIRED: 'official_statement_required',
  OFFICIAL_STATEMENT_OR_ACCOUNT_STATEMENT_REQUIRED: 'official_statement_or_account_statement_required',
  NOT_APPLICABLE_UNTIL_MODELED: 'not_applicable_until_modeled',
  BLOCKED: 'blocked',
  UNKNOWN: 'unknown',
});

export const PARTNER_CONCEPT_MODEL_STATUSES = Object.freeze({
  MODELED: 'modeled',
  MODELED_WITH_CAUTION: 'modeled_with_caution',
  PARTIALLY_MODELABLE: 'partially_modelable',
  BLOCKED_BY_MISSING_TABLE: 'blocked_by_missing_table',
  BLOCKED_BY_MISSING_FORMULA: 'blocked_by_missing_formula',
  EXAMPLE_ONLY: 'example_only',
  UNKNOWN: 'unknown',
});

const TA_COUNTING_RULE = 'Training/precontract event supports Partner pay factor eligibility only; it is not confirmed payout.';
const OFFICIAL_STATEMENT_RULE = 'Official statement evidence is required for payout truth.';
const ECONOMIC_OUTPUT_RULE = 'Partner compensation must consume advisor economic outputs, not raw advisor activity.';
const OFFICIAL_RULE_PACK = Object.freeze({
  rulePackId: 'smnyl_partner_compensation_2026',
  sourceType: 'official_compensation_booklet',
  sourceTruth: true,
});
const DEFAULT_PARTNER_2026_RULE_PACK = loadPartner2026RulePack();
const CONNECTION_SEMANTIC_AMOUNTS = DEFAULT_PARTNER_2026_RULE_PACK.concepts?.['connection-bonus']?.semanticAmounts || {};
const DEVELOPMENT_POLICY_SCALE = DEFAULT_PARTNER_2026_RULE_PACK.concepts?.['development-bonus']?.policyScale || [];
const DEVELOPMENT_EXAMPLE_ROW = DEVELOPMENT_POLICY_SCALE[DEVELOPMENT_POLICY_SCALE.length - 1] || {};
const PROMOTION_SEMANTIC_AMOUNTS = DEFAULT_PARTNER_2026_RULE_PACK.concepts?.['partner-promotion-bonus']?.semanticAmounts || {};

function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.freeze(value);
  Object.values(value).forEach(deepFreeze);
  return value;
}

function clone(value) {
  if (Array.isArray(value)) return value.map(clone);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, clone(item)]));
  }
  return value;
}

function entry(config) {
  return deepFreeze({
    conceptKey: PARTNER_COMPENSATION_CONCEPT_KEYS.UNKNOWN,
    displayName: 'Unknown Partner Compensation Concept',
    category: PARTNER_CONCEPT_CATEGORIES.UNKNOWN,
    readinessStatus: PARTNER_RULE_PACK_READINESS.UNKNOWN,
    calculationMode: PARTNER_CONCEPT_CALCULATION_MODES.UNKNOWN,
    payoutGateMode: PARTNER_CONCEPT_PAYOUT_GATE_MODES.UNKNOWN,
    modelStatus: PARTNER_CONCEPT_MODEL_STATUSES.UNKNOWN,
    evidenceRequirement: [],
    economicInputRequirement: [],
    lifecycleRequirement: [],
    scopeRequirement: ['scope must be evaluated before visible aggregation'],
    tableCompleteness: 'unknown',
    partialStatus: null,
    supportsCandidateCalculation: false,
    supportsFullCalculation: false,
    supportsSemanticAmount: false,
    supportsPayoutTruthGate: false,
    requiresOfficialStatementForPayout: false,
    sourcePages: [],
    missingArtifacts: [],
    warnings: [],
    constitutionalRules: [
      'Unknown is not zero.',
      'Blocked is not zero.',
      'Calculated candidate is not payout truth.',
    ],
    metadata: {},
    source: OFFICIAL_RULE_PACK,
    ...config,
  });
}

const REGISTRY = deepFreeze({
  [PARTNER_COMPENSATION_CONCEPT_KEYS.PRODUCTIVITY_BASE]: entry({
    conceptKey: PARTNER_COMPENSATION_CONCEPT_KEYS.PRODUCTIVITY_BASE,
    displayName: 'Productividad Base',
    category: PARTNER_CONCEPT_CATEGORIES.PRODUCTIVITY,
    readinessStatus: PARTNER_RULE_PACK_READINESS.READY_FOR_CONTRACT,
    calculationMode: PARTNER_CONCEPT_CALCULATION_MODES.FULL_CANDIDATE,
    payoutGateMode: PARTNER_CONCEPT_PAYOUT_GATE_MODES.OFFICIAL_STATEMENT_REQUIRED,
    modelStatus: PARTNER_CONCEPT_MODEL_STATUSES.MODELED,
    evidenceRequirement: ['paid_applied_economic_evidence', 'official_partner_compensation_statement_line_for_payout'],
    economicInputRequirement: ['qualified_advisor_economic_status', 'average_monthly_initial_commissions'],
    lifecycleRequirement: ['connected_active_or_official_career_clock'],
    tableCompleteness: 'complete',
    supportsCandidateCalculation: true,
    supportsFullCalculation: true,
    supportsPayoutTruthGate: true,
    requiresOfficialStatementForPayout: true,
    sourcePages: [6],
    constitutionalRules: [ECONOMIC_OUTPUT_RULE, OFFICIAL_STATEMENT_RULE],
  }),
  [PARTNER_COMPENSATION_CONCEPT_KEYS.PRODUCTIVITY_MULTIPLIER]: entry({
    conceptKey: PARTNER_COMPENSATION_CONCEPT_KEYS.PRODUCTIVITY_MULTIPLIER,
    displayName: 'Multiplicador de Productividad',
    category: PARTNER_CONCEPT_CATEGORIES.PRODUCTIVITY,
    readinessStatus: PARTNER_RULE_PACK_READINESS.READY_FOR_CONTRACT,
    calculationMode: PARTNER_CONCEPT_CALCULATION_MODES.FULL_CANDIDATE,
    payoutGateMode: PARTNER_CONCEPT_PAYOUT_GATE_MODES.OFFICIAL_STATEMENT_REQUIRED,
    modelStatus: PARTNER_CONCEPT_MODEL_STATUSES.MODELED,
    evidenceRequirement: ['productivity_base_candidate', 'qualified_advisor_count', 'partner_career_month_or_multiplier_minimum_requirement_config', 'training_winner_or_signed_precontract_evidence_for_pay_factor', 'official_partner_compensation_statement_line_for_payout'],
    economicInputRequirement: ['productivity_base_result', 'qualified_advisor_count', 'minimum_qualified_advisor_requirement'],
    lifecycleRequirement: ['partner_career_month_or_explicit_minimum_requirement', 'connected_active_or_official_career_clock'],
    tableCompleteness: 'complete',
    supportsCandidateCalculation: true,
    supportsFullCalculation: true,
    supportsPayoutTruthGate: true,
    requiresOfficialStatementForPayout: true,
    sourcePages: [7],
    warnings: [TA_COUNTING_RULE],
    constitutionalRules: [ECONOMIC_OUTPUT_RULE, TA_COUNTING_RULE, OFFICIAL_STATEMENT_RULE],
    metadata: {
      taWinnerCountAlias: 'TAWinnerCount is documentary legacy naming for TA-counting precontract/advisor event evidence, not confirmed payout.',
      requiresPartnerCareerMonthSupportGate: true,
      requiresAccumulatedCommissionGoal: false,
      requiresQualifiedAdvisorRequirementByCareerMonth: true,
      sourceTruthLevel: 'user_confirmed_pending_document_pinpoint',
      requiresTrainingWinnerEvidenceForPayFactor: true,
      officialStatementRequiredForPayoutTruth: true,
    },
  }),
  [PARTNER_COMPENSATION_CONCEPT_KEYS.PRODUCTIVITY_ANNUAL_ADDITIONAL_BONUS]: entry({
    conceptKey: PARTNER_COMPENSATION_CONCEPT_KEYS.PRODUCTIVITY_ANNUAL_ADDITIONAL_BONUS,
    displayName: 'Bono Adicional Anual de Productividad',
    category: PARTNER_CONCEPT_CATEGORIES.PRODUCTIVITY,
    readinessStatus: PARTNER_RULE_PACK_READINESS.READY_FOR_CONTRACT_WITH_CAUTION,
    calculationMode: PARTNER_CONCEPT_CALCULATION_MODES.CANDIDATE_WITH_CAUTION,
    payoutGateMode: PARTNER_CONCEPT_PAYOUT_GATE_MODES.OFFICIAL_STATEMENT_REQUIRED,
    modelStatus: PARTNER_CONCEPT_MODEL_STATUSES.MODELED_WITH_CAUTION,
    evidenceRequirement: [
      'yearly_productivity_bonus_candidate_results',
      'quarterly_TA_winner_evidence_Q1_Q4',
      'december_active_TA_winner_count_evidence',
      'connection_context_threshold_evidence',
      'official_partner_compensation_statement_line_for_payout',
    ],
    economicInputRequirement: [
      'Q1_Q4_productivity_bonus_candidate_amounts',
      'annual_productivity_bonus_base',
    ],
    lifecycleRequirement: [
      'partner_active_status_at_annual_calculation',
      'december_active_TA_winner_threshold',
    ],
    scopeRequirement: [
      'annual_productivity_bonus_only',
      'must_not_mutate_quarterly_productivity_flow',
    ],
    tableCompleteness: 'complete_with_evidence_caution',
    partialStatus: 'implemented_candidate_with_annual_evidence_caution',
    supportsCandidateCalculation: true,
    supportsFullCalculation: false,
    supportsPayoutTruthGate: true,
    requiresOfficialStatementForPayout: true,
    sourcePages: [7],
    missingArtifacts: [
      'official_statement_account_ingestion',
      'production_payout_operations',
    ],
    warnings: [
      'Annual productivity additional bonus requires Q1-Q4 productivity candidate results and TA/training winner evidence for each quarter.',
      'December active TA winner threshold must be explicitly evidenced: 8 for Jan-Jun context, 4 for Jul-Dec context.',
      'Annual productivity candidate is separate from quarterly productivity bonus calculation and must not mutate quarterly flow.',
      'Annual productivity remains candidate only until official statement/account evidence confirms payout truth.',
    ],
    constitutionalRules: [
      ECONOMIC_OUTPUT_RULE,
      TA_COUNTING_RULE,
      'Unknown is not zero.',
      'Blocked is not zero.',
      'Calculated candidate is not payout truth.',
      OFFICIAL_STATEMENT_RULE,
    ],
    metadata: {
      annualProductivityCandidateImplementation: 'contract_calculator_annual_orchestrator',
      bonusRate: 0.10,
      requiresQuarterlyProductivityCandidates: ['Q1', 'Q2', 'Q3', 'Q4'],
      requiresQuarterlyTAWinnerEvidence: ['Q1', 'Q2', 'Q3', 'Q4'],
      janJunDecemberActiveTAWinnerThreshold: 8,
      julDecDecemberActiveTAWinnerThreshold: 4,
      quarterlyProductivityFlowTouched: false,
      payoutTruthBlockedUntilOfficialStatement: true,
    },
  }),
  [PARTNER_COMPENSATION_CONCEPT_KEYS.PRODUCTION_BONUS]: entry({
    conceptKey: PARTNER_COMPENSATION_CONCEPT_KEYS.PRODUCTION_BONUS,
    displayName: 'Bono de Produccion',
    category: PARTNER_CONCEPT_CATEGORIES.PRODUCTION,
    readinessStatus: PARTNER_RULE_PACK_READINESS.READY_FOR_CONTRACT,
    calculationMode: PARTNER_CONCEPT_CALCULATION_MODES.FULL_CANDIDATE,
    payoutGateMode: PARTNER_CONCEPT_PAYOUT_GATE_MODES.OFFICIAL_STATEMENT_REQUIRED,
    modelStatus: PARTNER_CONCEPT_MODEL_STATUSES.MODELED,
    evidenceRequirement: ['paid_applied_economic_evidence', 'unit_LIMRA', 'unit_IGC', 'official_partner_compensation_statement_line_for_payout'],
    economicInputRequirement: ['non_qualified_advisor_economic_output'],
    lifecycleRequirement: ['connected_active_or_official_career_clock'],
    tableCompleteness: 'complete',
    supportsCandidateCalculation: true,
    supportsFullCalculation: true,
    supportsPayoutTruthGate: true,
    requiresOfficialStatementForPayout: true,
    sourcePages: [8],
    constitutionalRules: [ECONOMIC_OUTPUT_RULE, OFFICIAL_STATEMENT_RULE],
  }),
  [PARTNER_COMPENSATION_CONCEPT_KEYS.ACTIVITY_BONUS]: entry({
    conceptKey: PARTNER_COMPENSATION_CONCEPT_KEYS.ACTIVITY_BONUS,
    displayName: 'Bono de Actividad',
    category: PARTNER_CONCEPT_CATEGORIES.ACTIVITY,
    readinessStatus: PARTNER_RULE_PACK_READINESS.READY_FOR_CONTRACT_WITH_CAUTION,
    calculationMode: PARTNER_CONCEPT_CALCULATION_MODES.CANDIDATE_WITH_CAUTION,
    payoutGateMode: PARTNER_CONCEPT_PAYOUT_GATE_MODES.OFFICIAL_STATEMENT_REQUIRED,
    modelStatus: PARTNER_CONCEPT_MODEL_STATUSES.MODELED_WITH_CAUTION,
    evidenceRequirement: ['qualified_advisor_status', 'minimum_three_month_seniority', 'valid_paid_applied_vida_gmm_policy_evidence', 'official_partner_compensation_statement_line_for_payout'],
    economicInputRequirement: ['valid_life_gmm_policy_count_with_paid_applied_evidence'],
    lifecycleRequirement: ['connected_active_or_official_career_clock'],
    tableCompleteness: 'complete_with_evidence_caution',
    supportsCandidateCalculation: true,
    supportsFullCalculation: true,
    supportsPayoutTruthGate: true,
    requiresOfficialStatementForPayout: true,
    sourcePages: [9],
    warnings: ['Raw activity logs must not satisfy this concept.'],
    constitutionalRules: [ECONOMIC_OUTPUT_RULE, OFFICIAL_STATEMENT_RULE],
  }),
  [PARTNER_COMPENSATION_CONCEPT_KEYS.FIXED_SUPPORT]: entry({
    conceptKey: PARTNER_COMPENSATION_CONCEPT_KEYS.FIXED_SUPPORT,
    displayName: 'Apoyos Fijos',
    category: PARTNER_CONCEPT_CATEGORIES.SUPPORT,
    readinessStatus: PARTNER_RULE_PACK_READINESS.READY_FOR_CONTRACT_WITH_CAUTION,
    calculationMode: PARTNER_CONCEPT_CALCULATION_MODES.CANDIDATE_WITH_CAUTION,
    payoutGateMode: PARTNER_CONCEPT_PAYOUT_GATE_MODES.OFFICIAL_STATEMENT_OR_ACCOUNT_STATEMENT_REQUIRED,
    modelStatus: PARTNER_CONCEPT_MODEL_STATUSES.MODELED_WITH_CAUTION,
    evidenceRequirement: ['partner_career_month_support_gate', 'accumulated_commission_goals_evidence', 'TA_counting_event_evidence', 'support_table_evidence_for_full_modeling', 'official_statement_or_account_statement_for_payout'],
    economicInputRequirement: ['accumulated_commission_goals_from_economic_evidence'],
    lifecycleRequirement: ['partner_career_month_support_gate', 'partner_active_status'],
    tableCompleteness: 'support_amounts_known_goals_table_missing',
    supportsCandidateCalculation: true,
    supportsFullCalculation: false,
    supportsSemanticAmount: true,
    supportsPayoutTruthGate: true,
    requiresOfficialStatementForPayout: true,
    sourcePages: [12],
    missingArtifacts: ['Tabla de Apoyos exacta', 'support metrics thresholds'],
    warnings: [TA_COUNTING_RULE, 'Full official modeling remains caution until support table evidence is available.'],
    constitutionalRules: [ECONOMIC_OUTPUT_RULE, TA_COUNTING_RULE, OFFICIAL_STATEMENT_RULE],
    metadata: {
      requiresPartnerCareerMonthSupportGate: true,
      requiresAccumulatedCommissionGoal: true,
      requiresQualifiedAdvisorRequirementByCareerMonth: false,
      requiresSupportTableEvidence: true,
    },
  }),
  [PARTNER_COMPENSATION_CONCEPT_KEYS.TRANSITION_BONUS]: entry({
    conceptKey: PARTNER_COMPENSATION_CONCEPT_KEYS.TRANSITION_BONUS,
    displayName: 'Bono de Transicion',
    category: PARTNER_CONCEPT_CATEGORIES.TRANSITION,
    readinessStatus: PARTNER_RULE_PACK_READINESS.READY_FOR_CONTRACT_WITH_CAUTION,
    calculationMode: PARTNER_CONCEPT_CALCULATION_MODES.CANDIDATE_WITH_CAUTION,
    payoutGateMode: PARTNER_CONCEPT_PAYOUT_GATE_MODES.OFFICIAL_STATEMENT_REQUIRED,
    modelStatus: PARTNER_CONCEPT_MODEL_STATUSES.MODELED_WITH_CAUTION,
    evidenceRequirement: [
      'advisor_to_partner_transition_lineage',
      'former_advisor_compensation_key',
      'direct_key_or_assigned_portfolio_attribution',
      'initial_commission_ledger_lines',
      'renewal_commission_ledger_lines',
      'paid_premium_evidence',
      'paid_applied_commission_evidence',
      'non_administration_evidence',
      'non_client_intervention_evidence',
      'official_partner_compensation_statement_line_for_payout',
    ],
    economicInputRequirement: [
      'transition_commission_ledger_initial_and_renewal',
      'paid_applied_transition_commission_evidence',
    ],
    lifecycleRequirement: [
      'advisor_to_promoted_partner_lineage',
      'partner_transition_window_months_1_6',
    ],
    scopeRequirement: [
      'former_advisor_direct_key_or_assigned_portfolio',
      'transition_scope_must_not_reuse_quarterly_initial_commission_bonus_flow',
    ],
    tableCompleteness: 'complete_with_evidence_caution',
    partialStatus: 'implemented_candidate_with_transition_evidence_caution',
    supportsCandidateCalculation: true,
    supportsFullCalculation: false,
    supportsPayoutTruthGate: true,
    requiresOfficialStatementForPayout: true,
    sourcePages: [5],
    missingArtifacts: [
      'official_statement_account_ingestion',
      'production_payout_operations',
    ],
    warnings: [
      'Transition candidate requires advisor-to-partner lineage, former advisor key/direct key attribution, and initial plus renewal commission ledger evidence.',
      'Transition candidate is separate from Productividad, Produccion, and Actividad initial-commission concepts.',
      'Transition remains candidate only until official statement/account evidence confirms payout truth.',
    ],
    constitutionalRules: [
      'Unknown is not zero.',
      'Blocked is not zero.',
      'Calculated candidate is not payout truth.',
      OFFICIAL_STATEMENT_RULE,
    ],
    metadata: {
      transitionCandidateImplementation: 'contract_calculator_monthly_orchestrator',
      supportsInitialCommissions: true,
      supportsRenewalCommissions: true,
      requiresMonthsOneToSix: true,
      payoutTruthBlockedUntilOfficialStatement: true,
    },
  }),
  [PARTNER_COMPENSATION_CONCEPT_KEYS.CONNECTION_BONUS]: entry({
    conceptKey: PARTNER_COMPENSATION_CONCEPT_KEYS.CONNECTION_BONUS,
    displayName: 'Bono de Conexion',
    category: PARTNER_CONCEPT_CATEGORIES.CONNECTION,
    readinessStatus: PARTNER_RULE_PACK_READINESS.READY_FOR_CONTRACT_WITH_CAUTION,
    calculationMode: PARTNER_CONCEPT_CALCULATION_MODES.CANDIDATE_WITH_CAUTION,
    payoutGateMode: PARTNER_CONCEPT_PAYOUT_GATE_MODES.OFFICIAL_STATEMENT_REQUIRED,
    modelStatus: PARTNER_CONCEPT_MODEL_STATUSES.MODELED_WITH_CAUTION,
    evidenceRequirement: ['advisor_activation_event', 'advisorMonth', 'validPolicyCount', 'paidAppliedPolicyEvidence', 'official_partner_compensation_statement_line_for_payout'],
    economicInputRequirement: ['valid_paid_applied_policy_count_for_month_2_3_candidate'],
    lifecycleRequirement: ['advisor_connected_or_activation_event'],
    tableCompleteness: 'modeled_from_official_json',
    partialStatus: 'semantic_activation_and_month_2_3_candidate',
    supportsCandidateCalculation: true,
    supportsFullCalculation: false,
    supportsSemanticAmount: true,
    supportsPayoutTruthGate: true,
    requiresOfficialStatementForPayout: true,
    sourcePages: [10],
    missingArtifacts: ['complete policy count to amount table for months 2-3'],
    warnings: ['$7,500 alta is semantic only and not payout truth.'],
    constitutionalRules: ['Semantic amount is not payout truth.', OFFICIAL_STATEMENT_RULE],
    metadata: { semanticAmounts: { activation: CONNECTION_SEMANTIC_AMOUNTS.advisorOnboarding || null } },
  }),
  [PARTNER_COMPENSATION_CONCEPT_KEYS.DEVELOPMENT_BONUS]: entry({
    conceptKey: PARTNER_COMPENSATION_CONCEPT_KEYS.DEVELOPMENT_BONUS,
    displayName: 'Bono de Desarrollo',
    category: PARTNER_CONCEPT_CATEGORIES.DEVELOPMENT,
    readinessStatus: PARTNER_RULE_PACK_READINESS.READY_FOR_CONTRACT_WITH_CAUTION,
    calculationMode: PARTNER_CONCEPT_CALCULATION_MODES.CANDIDATE_WITH_CAUTION,
    payoutGateMode: PARTNER_CONCEPT_PAYOUT_GATE_MODES.OFFICIAL_STATEMENT_REQUIRED,
    modelStatus: PARTNER_CONCEPT_MODEL_STATUSES.MODELED_WITH_CAUTION,
    evidenceRequirement: ['advisorMonth', 'validPolicyCount', 'paidAppliedPolicyEvidence', 'official_partner_compensation_statement_line_for_payout'],
    economicInputRequirement: ['valid_paid_applied_policy_count'],
    lifecycleRequirement: ['advisor_month_4_to_15'],
    tableCompleteness: 'modeled_from_official_json',
    partialStatus: 'candidate_with_caution',
    supportsCandidateCalculation: true,
    supportsFullCalculation: true,
    supportsSemanticAmount: false,
    supportsPayoutTruthGate: true,
    requiresOfficialStatementForPayout: true,
    sourcePages: [10, 17],
    missingArtifacts: ['complete policy count to monthly amount table'],
    warnings: ['Development bonus is modeled from official JSON but remains candidate only until official statement evidence.'],
    constitutionalRules: ['Calculated candidate is not payout truth.', OFFICIAL_STATEMENT_RULE],
    metadata: { exampleOnly: { policyCountLabel: DEVELOPMENT_EXAMPLE_ROW.policies || null, monthlyAmount: DEVELOPMENT_EXAMPLE_ROW.amount || null } },
  }),
  [PARTNER_COMPENSATION_CONCEPT_KEYS.PARTNER_PROMOTION_BONUS]: entry({
    conceptKey: PARTNER_COMPENSATION_CONCEPT_KEYS.PARTNER_PROMOTION_BONUS,
    displayName: 'Bono de Alta Partner',
    category: PARTNER_CONCEPT_CATEGORIES.PROMOTION,
    readinessStatus: PARTNER_RULE_PACK_READINESS.READY_FOR_CONTRACT_WITH_CAUTION,
    calculationMode: PARTNER_CONCEPT_CALCULATION_MODES.CANDIDATE_WITH_CAUTION,
    payoutGateMode: PARTNER_CONCEPT_PAYOUT_GATE_MODES.OFFICIAL_STATEMENT_REQUIRED,
    modelStatus: PARTNER_CONCEPT_MODEL_STATUSES.MODELED_WITH_CAUTION,
    evidenceRequirement: ['partner_promotion_event', 'Alta Partner table', 'support_metrics_definition', 'official_partner_compensation_statement_line_for_payout'],
    economicInputRequirement: ['promotion_semantic_event_only_until_table_complete'],
    lifecycleRequirement: ['promoted_partner_active_status'],
    tableCompleteness: 'complete_with_evidence_caution',
    partialStatus: 'implemented_candidate_with_alta_partner_evidence_caution',
    supportsCandidateCalculation: true,
    supportsFullCalculation: false,
    supportsSemanticAmount: true,
    supportsPayoutTruthGate: true,
    requiresOfficialStatementForPayout: true,
    sourcePages: [11],
    missingArtifacts: ['Tabla de Alta Partner', 'support metrics definition'],
    warnings: ['$300,000 / $60,000 / $20,000 x12 schedule is semantic only and not payout truth.'],
    constitutionalRules: ['Semantic amount is not payout truth.', OFFICIAL_STATEMENT_RULE],
    metadata: {
      altaPartnerCandidateImplementation: 'contract_calculator_monthly_promotion_event_orchestrator',
      totalScheduleAmount: 300000,
      paymentCount: 13,
      firstPaymentAmount: 60000,
      recurringPaymentAmount: 20000,
      recurringPaymentNumbers: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
      maxRecoveryMonths: 3,
      requiresPartnerActiveEvidence: true,
      requiresPromotedAdvisorActiveEvidence: true,
      requiresPromotedAdvisorSupportEvidence: true,
      supportCalculatorTouched: false,
      productionPayoutOperationsTouched: false,
      payoutTruthBlockedUntilOfficialStatement: true,
    },
  }),
  [PARTNER_COMPENSATION_CONCEPT_KEYS.UNKNOWN]: entry({
    conceptKey: PARTNER_COMPENSATION_CONCEPT_KEYS.UNKNOWN,
    readinessStatus: PARTNER_RULE_PACK_READINESS.UNKNOWN,
    calculationMode: PARTNER_CONCEPT_CALCULATION_MODES.NOT_CALCULABLE,
    payoutGateMode: PARTNER_CONCEPT_PAYOUT_GATE_MODES.BLOCKED,
    modelStatus: PARTNER_CONCEPT_MODEL_STATUSES.UNKNOWN,
    tableCompleteness: 'unknown',
    partialStatus: 'blocked_unknown_concept',
    missingArtifacts: ['known conceptKey'],
    warnings: ['Unknown concept must not default to a real Partner compensation concept.'],
    constitutionalRules: ['Unknown is not zero.', 'Unknown concept is not payout truth.'],
  }),
});

const EXPLICIT_ALIASES = Object.freeze({
  'productivity_base': PARTNER_COMPENSATION_CONCEPT_KEYS.PRODUCTIVITY_BASE,
  'productivity_multiplier': PARTNER_COMPENSATION_CONCEPT_KEYS.PRODUCTIVITY_MULTIPLIER,
  'production_bonus': PARTNER_COMPENSATION_CONCEPT_KEYS.PRODUCTION_BONUS,
  'activity_bonus': PARTNER_COMPENSATION_CONCEPT_KEYS.ACTIVITY_BONUS,
  'fixed_support': PARTNER_COMPENSATION_CONCEPT_KEYS.FIXED_SUPPORT,
  'productivity-annual-additional-bonus': PARTNER_COMPENSATION_CONCEPT_KEYS.PRODUCTIVITY_ANNUAL_ADDITIONAL_BONUS,
  'productivity_annual_additional_bonus': PARTNER_COMPENSATION_CONCEPT_KEYS.PRODUCTIVITY_ANNUAL_ADDITIONAL_BONUS,
  'annual-productivity-bonus': PARTNER_COMPENSATION_CONCEPT_KEYS.PRODUCTIVITY_ANNUAL_ADDITIONAL_BONUS,
  'annual_productivity_bonus': PARTNER_COMPENSATION_CONCEPT_KEYS.PRODUCTIVITY_ANNUAL_ADDITIONAL_BONUS,
  'transition_bonus': PARTNER_COMPENSATION_CONCEPT_KEYS.TRANSITION_BONUS,
  'connection_bonus': PARTNER_COMPENSATION_CONCEPT_KEYS.CONNECTION_BONUS,
  'development_bonus': PARTNER_COMPENSATION_CONCEPT_KEYS.DEVELOPMENT_BONUS,
  'partner_promotion_bonus': PARTNER_COMPENSATION_CONCEPT_KEYS.PARTNER_PROMOTION_BONUS,
});

const CANONICAL_KEYS = Object.freeze(Object.values(PARTNER_COMPENSATION_CONCEPT_KEYS));

export function normalizePartnerConceptKey(input) {
  if (typeof input !== 'string') return PARTNER_COMPENSATION_CONCEPT_KEYS.UNKNOWN;
  const normalized = input.trim().toLowerCase();
  if (!normalized) return PARTNER_COMPENSATION_CONCEPT_KEYS.UNKNOWN;
  if (CANONICAL_KEYS.includes(normalized)) return normalized;
  return EXPLICIT_ALIASES[normalized] || PARTNER_COMPENSATION_CONCEPT_KEYS.UNKNOWN;
}

export function getPartnerCompensationConceptEntry(conceptKey) {
  return clone(REGISTRY[normalizePartnerConceptKey(conceptKey)] || REGISTRY[PARTNER_COMPENSATION_CONCEPT_KEYS.UNKNOWN]);
}

export function listPartnerCompensationConceptEntries() {
  return CANONICAL_KEYS.map((conceptKey) => getPartnerCompensationConceptEntry(conceptKey));
}

export function isPartnerConceptKnown(conceptKey) {
  return normalizePartnerConceptKey(conceptKey) !== PARTNER_COMPENSATION_CONCEPT_KEYS.UNKNOWN;
}

export function isPartnerConceptCandidateCalculable(conceptKey) {
  return getPartnerCompensationConceptEntry(conceptKey).supportsCandidateCalculation === true;
}

export function isPartnerConceptFullCalculable(conceptKey) {
  return getPartnerCompensationConceptEntry(conceptKey).supportsFullCalculation === true;
}

export function isPartnerConceptPartial(conceptKey) {
  return [
    PARTNER_CONCEPT_CALCULATION_MODES.PARTIAL_BLOCKED,
    PARTNER_CONCEPT_CALCULATION_MODES.SEMANTIC_ONLY,
    PARTNER_CONCEPT_CALCULATION_MODES.EXAMPLE_ONLY,
  ].includes(getPartnerCompensationConceptEntry(conceptKey).calculationMode);
}

export function isPartnerConceptExampleOnly(conceptKey) {
  return getPartnerCompensationConceptEntry(conceptKey).calculationMode === PARTNER_CONCEPT_CALCULATION_MODES.EXAMPLE_ONLY;
}

export function requiresOfficialStatementForPartnerPayout(conceptKey) {
  return getPartnerCompensationConceptEntry(conceptKey).requiresOfficialStatementForPayout === true;
}

export { PARTNER_COMPENSATION_CONCEPT_KEYS };
