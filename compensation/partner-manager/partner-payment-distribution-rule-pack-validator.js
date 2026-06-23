export class FatalGovernanceError extends Error {
  constructor(message, details = []) {
    super(message);
    this.name = 'FatalGovernanceError';
    this.code = 'FATAL_GOVERNANCE_ERROR';
    this.details = details;
  }
}

export const SUPPORTED_PAYMENT_DISTRIBUTION_TYPES = Object.freeze([
  'deferred_equal_parts',
  'single_payment',
  'monthly_breakdown_required',
  'excluded_non_payable',
]);

export const SUPPORTED_PAYMENT_ANCHORS = Object.freeze([
  'quarter_close',
  'period_end',
  'month_after_quarter_close',
  'event_month',
  'explicit_payment_month',
]);

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function hasText(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function pushError(errors, code, message, path = null) {
  errors.push({ code, message, path });
}

function walkForUnsafeExecutableConfig(value, path = '$', errors = []) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => walkForUnsafeExecutableConfig(item, `${path}[${index}]`, errors));
    return errors;
  }

  if (!isPlainObject(value)) return errors;

  const unsafeKeys = new Set([
    'formula',
    'expression',
    'javascript',
    'js',
    'code',
    'eval',
    'functionBody',
    'function',
  ]);

  for (const [key, child] of Object.entries(value)) {
    const lowerKey = key.toLowerCase();

    if (unsafeKeys.has(lowerKey)) {
      pushError(
        errors,
        'unsafe_executable_rule_pack_field',
        `Rule packs must not contain executable or expression fields: ${key}`,
        `${path}.${key}`
      );
    }

    if (typeof child === 'string') {
      const trimmed = child.trim();
      if (
        trimmed.includes('=>')
        || /^function\s*\(/.test(trimmed)
        || /^return\s+/.test(trimmed)
        || trimmed.includes('new Function')
        || trimmed.includes('eval(')
      ) {
        pushError(
          errors,
          'unsafe_executable_rule_pack_string',
          `Rule pack string looks executable and is not allowed: ${key}`,
          `${path}.${key}`
        );
      }
    }

    walkForUnsafeExecutableConfig(child, `${path}.${key}`, errors);
  }

  return errors;
}

export function buildConceptAliasMap(rulePack = {}) {
  const conceptsDictionary = rulePack.conceptsDictionary || {};
  const aliasMap = new Map();

  for (const [canonicalConceptKey, conceptDefinition] of Object.entries(conceptsDictionary)) {
    const aliases = [
      canonicalConceptKey,
      ...(Array.isArray(conceptDefinition.aliases) ? conceptDefinition.aliases : []),
    ];

    for (const alias of aliases) {
      if (!hasText(alias)) continue;
      aliasMap.set(alias.trim().toLowerCase(), canonicalConceptKey);
    }
  }

  return aliasMap;
}

export function validatePaymentDistributionRulePack(rulePack = {}) {
  const errors = [];
  const warnings = [];

  if (!isPlainObject(rulePack)) {
    pushError(errors, 'rule_pack_must_be_object', 'Rule pack must be an object.', '$');
    return { valid: false, errors, warnings };
  }

  const metadata = rulePack.metadata || {};

  if (!isPlainObject(metadata)) {
    pushError(errors, 'metadata_required', 'Rule pack metadata is required.', '$.metadata');
  } else {
    if (!hasText(metadata.rulePackId)) {
      pushError(errors, 'rule_pack_id_required', 'metadata.rulePackId is required.', '$.metadata.rulePackId');
    }

    if (!hasText(metadata.rulePackVersion)) {
      pushError(errors, 'rule_pack_version_required', 'metadata.rulePackVersion is required.', '$.metadata.rulePackVersion');
    }

    if (metadata.governanceStatus === 'official' && !hasText(metadata.rulePackHash)) {
      pushError(errors, 'official_rule_pack_hash_required', 'Official rule packs require metadata.rulePackHash.', '$.metadata.rulePackHash');
    }
  }

  const conceptsDictionary = rulePack.conceptsDictionary || {};
  const paymentDistributionPolicies = rulePack.paymentDistributionPolicies || {};

  if (!isPlainObject(conceptsDictionary)) {
    pushError(errors, 'concepts_dictionary_required', 'conceptsDictionary must be an object.', '$.conceptsDictionary');
  }

  if (!isPlainObject(paymentDistributionPolicies)) {
    pushError(errors, 'payment_distribution_policies_required', 'paymentDistributionPolicies must be an object.', '$.paymentDistributionPolicies');
  }

  const aliasOwner = new Map();

  for (const [canonicalConceptKey, conceptDefinition] of Object.entries(conceptsDictionary)) {
    if (!isPlainObject(conceptDefinition)) {
      pushError(errors, 'concept_definition_must_be_object', `Concept ${canonicalConceptKey} must be an object.`, `$.conceptsDictionary.${canonicalConceptKey}`);
      continue;
    }

    const aliases = [
      canonicalConceptKey,
      ...(Array.isArray(conceptDefinition.aliases) ? conceptDefinition.aliases : []),
    ];

    for (const alias of aliases) {
      if (!hasText(alias)) continue;
      const normalizedAlias = alias.trim().toLowerCase();
      const previousOwner = aliasOwner.get(normalizedAlias);

      if (previousOwner && previousOwner !== canonicalConceptKey) {
        pushError(
          errors,
          'duplicate_alias_across_concepts',
          `Alias ${alias} is used by both ${previousOwner} and ${canonicalConceptKey}.`,
          `$.conceptsDictionary.${canonicalConceptKey}.aliases`
        );
      }

      aliasOwner.set(normalizedAlias, canonicalConceptKey);
    }
  }

  for (const [canonicalConceptKey, policy] of Object.entries(paymentDistributionPolicies)) {
    if (!Object.prototype.hasOwnProperty.call(conceptsDictionary, canonicalConceptKey)) {
      pushError(
        errors,
        'payment_policy_references_unknown_concept',
        `Payment policy references unknown concept ${canonicalConceptKey}.`,
        `$.paymentDistributionPolicies.${canonicalConceptKey}`
      );
      continue;
    }

    if (!isPlainObject(policy)) {
      pushError(errors, 'payment_policy_must_be_object', `Payment policy for ${canonicalConceptKey} must be an object.`, `$.paymentDistributionPolicies.${canonicalConceptKey}`);
      continue;
    }

    const distributionType = policy.distributionType;

    if (!SUPPORTED_PAYMENT_DISTRIBUTION_TYPES.includes(distributionType)) {
      pushError(
        errors,
        'unsupported_payment_distribution_type',
        `Unsupported payment distribution type ${distributionType}.`,
        `$.paymentDistributionPolicies.${canonicalConceptKey}.distributionType`
      );
      continue;
    }

    if (policy.payable === false || distributionType === 'excluded_non_payable') {
      continue;
    }

    if (distributionType === 'deferred_equal_parts') {
      if (!Number.isInteger(policy.parts) || policy.parts <= 0) {
        pushError(
          errors,
          'deferred_equal_parts_requires_positive_integer_parts',
          `${canonicalConceptKey} requires a positive integer parts value.`,
          `$.paymentDistributionPolicies.${canonicalConceptKey}.parts`
        );
      }

      if (!SUPPORTED_PAYMENT_ANCHORS.includes(policy.startAnchor)) {
        pushError(
          errors,
          'deferred_equal_parts_requires_supported_start_anchor',
          `${canonicalConceptKey} requires a supported startAnchor.`,
          `$.paymentDistributionPolicies.${canonicalConceptKey}.startAnchor`
        );
      }
    }

    if (distributionType === 'single_payment') {
      const anchor = policy.paymentAnchor || policy.startAnchor;

      if (!SUPPORTED_PAYMENT_ANCHORS.includes(anchor)) {
        pushError(
          errors,
          'single_payment_requires_supported_anchor',
          `${canonicalConceptKey} requires a supported paymentAnchor or startAnchor.`,
          `$.paymentDistributionPolicies.${canonicalConceptKey}.paymentAnchor`
        );
      }
    }
  }

  walkForUnsafeExecutableConfig(rulePack, '$', errors);

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    aliasMap: buildConceptAliasMap(rulePack),
    rulePack,
  };
}

export function assertValidPaymentDistributionRulePack(rulePack = {}) {
  const validation = validatePaymentDistributionRulePack(rulePack);

  if (!validation.valid) {
    throw new FatalGovernanceError(
      'Invalid payment distribution rule pack. Fail-Fast governance boundary blocked engine execution.',
      validation.errors
    );
  }

  return validation;
}

export default {
  FatalGovernanceError,
  SUPPORTED_PAYMENT_DISTRIBUTION_TYPES,
  SUPPORTED_PAYMENT_ANCHORS,
  buildConceptAliasMap,
  validatePaymentDistributionRulePack,
  assertValidPaymentDistributionRulePack,
};
