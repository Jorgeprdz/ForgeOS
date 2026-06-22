export function validatePartnerRulePack(rulePack = {}) {
  const errors = [];
  const warnings = [];

  if (!rulePack || typeof rulePack !== 'object') {
    return { valid: false, errors: ['rule_pack_object_required'], warnings };
  }

  if (!rulePack.schemaVersion) errors.push('schemaVersion_required');
  if (!rulePack.rulePackId) errors.push('rulePackId_required');
  if (!rulePack.source || typeof rulePack.source !== 'object') errors.push('source_required');
  if (!rulePack.globalRules || typeof rulePack.globalRules !== 'object') errors.push('globalRules_required');
  if (!rulePack.globalRules?.payoutTruthRule) errors.push('payoutTruthRule_required');
  if (!rulePack.concepts || typeof rulePack.concepts !== 'object') errors.push('concepts_required');

  for (const [conceptKey, concept] of Object.entries(rulePack.concepts || {})) {
    if (!concept?.displayName) warnings.push(`concept_displayName_missing:${conceptKey}`);
    if (!concept?.status) warnings.push(`concept_status_missing:${conceptKey}`);
    if (!concept?.calculationMode && !concept?.payoutGateMode) warnings.push(`concept_mode_missing:${conceptKey}`);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}
