const REQUIRED_CONCEPTS = Object.freeze([
  'productivity-base',
  'productivity-multiplier',
  'production-bonus',
  'activity-bonus',
  'fixed-support',
  'connection-bonus',
  'development-bonus',
]);

export function validatePartner2026RulePack(rulePack = {}) {
  const errors = [];
  const warnings = [];

  if (!rulePack || typeof rulePack !== 'object') {
    errors.push('rule_pack_object_required');
    return { valid: false, errors, warnings };
  }

  if (!rulePack.schemaVersion) errors.push('schemaVersion_required');
  if (rulePack.rulePackId !== 'smnyl_partner_compensation_2026') errors.push('invalid_rulePackId');
  if (rulePack.source?.sourceTruth !== true) errors.push('sourceTruth_must_be_true');
  if (!rulePack.concepts || typeof rulePack.concepts !== 'object') errors.push('concepts_required');
  if (!rulePack.globalRules?.payoutTruthRule) errors.push('payoutTruthRule_required');

  for (const conceptKey of REQUIRED_CONCEPTS) {
    if (!rulePack.concepts?.[conceptKey]) errors.push(`missing_concept:${conceptKey}`);
  }

  if (rulePack.globalRules?.partnerClassMapping?.status === 'partially_modelled' || rulePack.globalRules?.partnerClassMapping?.status === 'partially_modeled') {
    warnings.push('partnerClassMapping_partially_modeled');
  }

  if (rulePack.concepts?.['fixed-support']?.requires?.includes('supportTableEvidence')) {
    warnings.push('fixed_support_requires_supportTableEvidence');
  }

  if (rulePack.concepts?.['transition-bonus']?.status === 'partially_modelable') {
    warnings.push('transition_bonus_partially_modelable');
  }

  if (rulePack.concepts?.['partner-promotion-bonus']?.calculationMode === 'semantic_only') {
    warnings.push('partner_promotion_bonus_semantic_only');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}
