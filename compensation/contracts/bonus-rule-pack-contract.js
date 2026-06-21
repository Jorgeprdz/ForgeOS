export const BONUS_RULE_PACK_STATUSES = Object.freeze({
  MODELED: 'modeled',
  NOT_MODELED: 'not_modeled',
  DRAFT: 'draft',
  BLOCKED: 'blocked',
});

export function createBonusRulePackContract({
  carrier = null,
  year = null,
  profileStage = null,
  bonusCode = null,
  sourceDocument = null,
  effectiveFrom = null,
  effectiveTo = null,
  ruleStatus = BONUS_RULE_PACK_STATUSES.NOT_MODELED,
  requiredEvidence = [],
  unsupportedReason = null,
  usesLegacyStubAsTruth = false,
} = {}) {
  const hasSourceDocument = Boolean(sourceDocument);
  const normalizedStatus = hasSourceDocument
    ? ruleStatus
    : BONUS_RULE_PACK_STATUSES.NOT_MODELED;

  return {
    carrier,
    year,
    profileStage,
    bonusCode,
    sourceDocument,
    effectiveFrom,
    effectiveTo,
    ruleStatus: normalizedStatus,
    requiredEvidence,
    unsupportedReason: hasSourceDocument ? unsupportedReason : 'missing_source_document',
    noSilentDefaults: true,
    inventsRates: false,
    usesLegacyStubAsTruth,
    sourceBacked: hasSourceDocument && !usesLegacyStubAsTruth,
  };
}

export function bonusRulePackIsModeled(rulePack = {}) {
  return rulePack.ruleStatus === BONUS_RULE_PACK_STATUSES.MODELED && rulePack.sourceBacked === true;
}
