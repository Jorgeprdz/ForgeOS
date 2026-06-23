export class GovernanceIdentityMissingError extends Error {
  constructor(message, details = []) {
    super(message);
    this.name = 'GovernanceIdentityMissingError';
    this.code = 'GOVERNANCE_IDENTITY_MISSING';
    this.details = details;
  }
}

export class GovernanceIdentityMismatchError extends Error {
  constructor(message, details = []) {
    super(message);
    this.name = 'GovernanceIdentityMismatchError';
    this.code = 'GOVERNANCE_IDENTITY_MISMATCH';
    this.details = details;
  }
}

function hasText(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function pickMetadata({ rulePack = null, metadata = null, rulePackIdentity = null } = {}) {
  if (rulePackIdentity && typeof rulePackIdentity === 'object') return rulePackIdentity;
  if (metadata && typeof metadata === 'object') return metadata;
  if (rulePack && typeof rulePack === 'object' && rulePack.metadata && typeof rulePack.metadata === 'object') {
    return rulePack.metadata;
  }

  return {};
}

function inferGovernanceStatus({ rulePackHash, governanceStatus } = {}) {
  if (hasText(governanceStatus)) return governanceStatus.trim();
  if (rulePackHash === 'draft:not-sealed') return 'draft';
  return 'official';
}

export function createRulePackIdentitySnapshot({
  rulePack = null,
  metadata = null,
  rulePackIdentity = null,
  calculatedAt = undefined,
  generatedAt = undefined,
  allowDraft = true,
} = {}) {
  const source = pickMetadata({ rulePack, metadata, rulePackIdentity });

  const identity = {
    rulePackId: source.rulePackId || null,
    rulePackVersion: source.rulePackVersion || null,
    rulePackHash: source.rulePackHash || null,
    rulePackEffectiveDate: source.rulePackEffectiveDate || null,
    sourceEvidenceRefs: Array.isArray(source.sourceEvidenceRefs) ? [...source.sourceEvidenceRefs] : [],
    governanceStatus: inferGovernanceStatus({
      rulePackHash: source.rulePackHash,
      governanceStatus: source.governanceStatus,
    }),
    calculatedAt: calculatedAt === undefined ? new Date().toISOString() : calculatedAt,
    generatedAt: generatedAt === undefined ? null : generatedAt,
  };

  const missing = [];

  if (!hasText(identity.rulePackId)) missing.push('rulePackId');
  if (!hasText(identity.rulePackVersion)) missing.push('rulePackVersion');
  if (!hasText(identity.rulePackHash)) missing.push('rulePackHash');

  if (missing.length > 0) {
    throw new GovernanceIdentityMissingError(
      'Rule pack identity snapshot requires rulePackId, rulePackVersion and rulePackHash.',
      missing.map((field) => ({
        code: 'missing_rule_pack_identity_field',
        field,
      }))
    );
  }

  if (!allowDraft && identity.rulePackHash === 'draft:not-sealed') {
    throw new GovernanceIdentityMissingError(
      'Official calculation cannot use draft:not-sealed rule pack hash.',
      [{
        code: 'draft_rule_pack_hash_not_allowed',
        field: 'rulePackHash',
      }]
    );
  }

  return Object.freeze(identity);
}

export function assertRulePackIdentitySnapshot(rulePackIdentity, options = {}) {
  return createRulePackIdentitySnapshot({
    rulePackIdentity,
    ...options,
  });
}

export function flattenRulePackIdentitySnapshot(rulePackIdentity) {
  const identity = assertRulePackIdentitySnapshot(rulePackIdentity, {
    calculatedAt: rulePackIdentity?.calculatedAt ?? null,
    generatedAt: rulePackIdentity?.generatedAt ?? null,
  });

  return {
    rulePackIdentity: identity,
    rulePackId: identity.rulePackId,
    rulePackVersion: identity.rulePackVersion,
    rulePackHash: identity.rulePackHash,
    rulePackEffectiveDate: identity.rulePackEffectiveDate,
    sourceEvidenceRefs: identity.sourceEvidenceRefs,
    governanceStatus: identity.governanceStatus,
    calculatedAt: identity.calculatedAt,
    generatedAt: identity.generatedAt,
  };
}

export function stampRulePackIdentitySnapshot(target = {}, rulePackIdentity, options = {}) {
  const flattened = flattenRulePackIdentitySnapshot(
    createRulePackIdentitySnapshot({
      rulePackIdentity,
      calculatedAt: options.calculatedAt ?? rulePackIdentity?.calculatedAt ?? null,
      generatedAt: options.generatedAt ?? rulePackIdentity?.generatedAt ?? null,
      allowDraft: options.allowDraft ?? true,
    })
  );

  return {
    ...target,
    ...flattened,
    payoutTruth: target?.payoutTruth === true ? false : target?.payoutTruth ?? false,
  };
}

export default {
  GovernanceIdentityMissingError,
  GovernanceIdentityMismatchError,
  createRulePackIdentitySnapshot,
  assertRulePackIdentitySnapshot,
  flattenRulePackIdentitySnapshot,
  stampRulePackIdentitySnapshot,
};
