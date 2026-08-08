const crypto = require('node:crypto');

const COVERAGE_KEYS = new Set([
  'contractType', 'schemaVersion', 'policyCoverageReference', 'advisorId',
  'policyReference', 'policyVersionReference', 'productCoverageReference',
  'coverageCode', 'coverageLabel', 'coverageKind', 'coverageState',
  'sumInsured', 'currency', 'premiumAmount', 'premiumCurrency',
  'annexReference', 'riderReference', 'effectiveFrom', 'effectiveTo',
  'coveragePeriodValue', 'coveragePeriodUnit', 'paymentPeriodValue',
  'paymentPeriodUnit', 'sourceEvidenceReferences', 'verificationState',
  'completenessState', 'freshnessState', 'conflictState', 'currentVersion',
  'previousCoverageVersionReference', 'correctionOf', 'createdAt', 'createdBy',
  'updatedAt', 'archivedAt', 'archivedBy', 'archiveReason'
]);

const COMMAND_KEYS = new Set([
  'contractType', 'contractVersion', 'advisorId', 'actorReference',
  'idempotencyKey', 'confirmedAt', 'policyReference', 'policyVersionReference',
  'evidenceVersionReference', 'coverages', 'commandDigest'
]);

const REF = /^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,239}$/;
const SHORT_REF = /^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,119}$/;
const CURRENCY = /^[A-Z]{3}$/;

class PolicyCoverageContractError extends Error {
  constructor(code) {
    super(code);
    this.name = 'PolicyCoverageContractError';
    this.code = code;
  }
}

function fail(code) {
  throw new PolicyCoverageContractError(code);
}

function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.keys(value).sort().map(key => [key, canonicalize(value[key])])
    );
  }
  return value;
}

function stableDigest(value) {
  const input = { ...(value || {}) };
  delete input.commandDigest;
  return crypto.createHash('sha256').update(JSON.stringify(canonicalize(input))).digest('hex');
}

function assertKeys(value, allowed, code) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) fail(code);
  for (const key of Object.keys(value)) if (!allowed.has(key)) fail(code);
}

function nullableNumber(value, code) {
  if (value === null || value === undefined) return null;
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) fail(code);
  return value;
}

function nullableRef(value, code, pattern = REF) {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value !== 'string' || !pattern.test(value)) fail(code);
  return value;
}

function validatePeriod(value, unit, code) {
  if (value === null || value === undefined) {
    if (unit !== null && unit !== undefined) fail(code);
    return;
  }
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) fail(code);
  if (typeof unit !== 'string' || !SHORT_REF.test(unit)) fail(code);
}

function validateCoverage(input) {
  assertKeys(input, COVERAGE_KEYS, 'POLICY_COVERAGE_UNKNOWN_FIELD');
  if (input.contractType !== 'FORGE_POLICY_COVERAGE' || input.schemaVersion !== '1.0.0') {
    fail('POLICY_COVERAGE_CONTRACT_INVALID');
  }
  for (const key of ['policyCoverageReference', 'advisorId', 'policyReference', 'policyVersionReference']) {
    if (typeof input[key] !== 'string' || !REF.test(input[key])) fail('POLICY_COVERAGE_REFERENCE_INVALID');
  }
  if (typeof input.coverageKind !== 'string' || !SHORT_REF.test(input.coverageKind)) {
    fail('POLICY_COVERAGE_KIND_INVALID');
  }
  nullableRef(input.productCoverageReference, 'POLICY_COVERAGE_PRODUCT_REFERENCE_INVALID');
  nullableRef(input.annexReference, 'POLICY_COVERAGE_ANNEX_INVALID');
  nullableRef(input.riderReference, 'POLICY_COVERAGE_RIDER_INVALID');
  nullableRef(input.coverageState, 'POLICY_COVERAGE_STATE_INVALID', SHORT_REF);
  nullableNumber(input.sumInsured, 'POLICY_COVERAGE_SUM_INSURED_INVALID');
  nullableNumber(input.premiumAmount, 'POLICY_COVERAGE_PREMIUM_INVALID');
  for (const key of ['currency', 'premiumCurrency']) {
    const value = input[key];
    if (value !== null && value !== undefined && (typeof value !== 'string' || !CURRENCY.test(value))) {
      fail('POLICY_COVERAGE_CURRENCY_INVALID');
    }
  }
  validatePeriod(input.coveragePeriodValue, input.coveragePeriodUnit, 'POLICY_COVERAGE_PERIOD_INVALID');
  validatePeriod(input.paymentPeriodValue, input.paymentPeriodUnit, 'POLICY_COVERAGE_PAYMENT_PERIOD_INVALID');
  if (input.effectiveFrom && input.effectiveTo && Date.parse(input.effectiveTo) <= Date.parse(input.effectiveFrom)) {
    fail('POLICY_COVERAGE_EFFECTIVE_RANGE_INVALID');
  }
  if (!Array.isArray(input.sourceEvidenceReferences) || input.sourceEvidenceReferences.length < 1 ||
      new Set(input.sourceEvidenceReferences).size !== input.sourceEvidenceReferences.length ||
      input.sourceEvidenceReferences.some(ref => typeof ref !== 'string' || !REF.test(ref))) {
    fail('POLICY_COVERAGE_EVIDENCE_INVALID');
  }
  if (!['UNVERIFIED', 'REVIEWED', 'CONFIRMED', 'DISPUTED'].includes(input.verificationState)) {
    fail('POLICY_COVERAGE_VERIFICATION_INVALID');
  }
  if (!['COMPLETE', 'PARTIAL', 'UNKNOWN'].includes(input.completenessState) ||
      !['CURRENT', 'STALE', 'UNKNOWN'].includes(input.freshnessState) ||
      !['CLEAR', 'CONFLICT', 'UNRESOLVED'].includes(input.conflictState)) {
    fail('POLICY_COVERAGE_TRUTH_STATE_INVALID');
  }
  if (!Number.isInteger(input.currentVersion) || input.currentVersion < 1) fail('POLICY_COVERAGE_VERSION_INVALID');
  if (input.createdBy !== input.advisorId) fail('POLICY_COVERAGE_ACTOR_INVALID');
  if (input.archivedAt != null || input.archivedBy != null || input.archiveReason != null) {
    fail('POLICY_COVERAGE_CONFIRM_ARCHIVE_FORBIDDEN');
  }
  return Object.freeze({ ...input });
}

function buildConfirmedPolicyCoveragesCommand(input) {
  assertKeys(input, COMMAND_KEYS, 'POLICY_COVERAGE_COMMAND_UNKNOWN_FIELD');
  if (input.contractType !== 'FORGE_CONFIRMED_POLICY_COVERAGES_COMMAND' ||
      input.contractVersion !== 'POLICY-COVERAGE-1.0') {
    fail('POLICY_COVERAGE_COMMAND_CONTRACT_INVALID');
  }
  if (input.advisorId !== input.actorReference) fail('POLICY_COVERAGE_COMMAND_OWNER_MISMATCH');
  for (const key of ['advisorId', 'actorReference', 'policyReference', 'policyVersionReference', 'evidenceVersionReference']) {
    if (typeof input[key] !== 'string' || !REF.test(input[key])) fail('POLICY_COVERAGE_COMMAND_REFERENCE_INVALID');
  }
  if (!Array.isArray(input.coverages) || input.coverages.length < 1 || input.coverages.length > 200) {
    fail('POLICY_COVERAGE_COMMAND_ITEMS_INVALID');
  }
  const coverages = input.coverages.map(validateCoverage);
  const refs = coverages.map(item => item.policyCoverageReference);
  if (new Set(refs).size !== refs.length) fail('POLICY_COVERAGE_DUPLICATE_LOGICAL_REFERENCE');
  for (const item of coverages) {
    if (item.advisorId !== input.advisorId || item.policyReference !== input.policyReference ||
        item.policyVersionReference !== input.policyVersionReference) {
      fail('POLICY_COVERAGE_COMMAND_SCOPE_MISMATCH');
    }
    if (!item.sourceEvidenceReferences.includes(input.evidenceVersionReference)) {
      fail('POLICY_COVERAGE_COMMAND_EVIDENCE_MISMATCH');
    }
    if (!['REVIEWED', 'CONFIRMED'].includes(item.verificationState) || item.conflictState !== 'CLEAR') {
      fail('POLICY_COVERAGE_COMMAND_UNCONFIRMED_FACT');
    }
  }
  const command = { ...input, coverages };
  command.commandDigest = stableDigest(command);
  return Object.freeze(command);
}

function buildPolicyCoverageReadProjection({ policy, policyVersionReference = null, coverages = [] } = {}) {
  if (!policy || typeof policy !== 'object' || typeof policy.policyReference !== 'string') {
    fail('POLICY_COVERAGE_READ_POLICY_REQUIRED');
  }
  const active = Array.isArray(coverages) ? coverages.filter(item => item && item.archivedAt == null) : [];
  let coverageDetailState;
  if (active.length === 0) {
    coverageDetailState = policy.sumInsured != null || policy.premiumAmount != null
      ? 'LEGACY_POLICY_SUMMARY_ONLY'
      : 'COVERAGE_DETAIL_NOT_CAPTURED';
  } else if (active.some(item =>
    item.verificationState !== 'CONFIRMED' || item.completenessState !== 'COMPLETE' ||
    item.freshnessState !== 'CURRENT' || item.conflictState !== 'CLEAR')) {
    coverageDetailState = 'COVERAGE_DETAIL_PARTIAL';
  } else {
    coverageDetailState = 'COVERAGE_DETAIL_AVAILABLE';
  }
  return {
    status: 'OK',
    policyReference: policy.policyReference,
    policyVersionReference,
    coverageDetailState,
    coverages: active.map(item => ({
      coverageReference: item.policyCoverageReference,
      productCoverageReference: item.productCoverageReference ?? null,
      code: item.coverageCode ?? null,
      label: item.coverageLabel ?? null,
      kind: item.coverageKind,
      coverageState: item.coverageState ?? null,
      sumInsured: item.sumInsured ?? null,
      currency: item.currency ?? null,
      premiumAmount: item.premiumAmount ?? null,
      premiumCurrency: item.premiumCurrency ?? null,
      annexReference: item.annexReference ?? null,
      riderReference: item.riderReference ?? null,
      effectiveFrom: item.effectiveFrom ?? null,
      effectiveTo: item.effectiveTo ?? null,
      coveragePeriod: item.coveragePeriodValue == null ? null : {
        value: item.coveragePeriodValue, unit: item.coveragePeriodUnit
      },
      paymentPeriod: item.paymentPeriodValue == null ? null : {
        value: item.paymentPeriodValue, unit: item.paymentPeriodUnit
      },
      truthState: {
        verification: item.verificationState,
        completeness: item.completenessState,
        freshness: item.freshnessState,
        conflict: item.conflictState
      },
      currentVersion: item.currentVersion
    }))
  };
}

module.exports = {
  PolicyCoverageContractError,
  stableDigest,
  validateCoverage,
  buildConfirmedPolicyCoveragesCommand,
  buildPolicyCoverageReadProjection
};
