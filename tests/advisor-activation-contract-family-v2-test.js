const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const schema = JSON.parse(fs.readFileSync(path.join(ROOT, 'schemas/advisor-activation-contract-family-v2.schema.json'), 'utf8'));
const fixture = JSON.parse(fs.readFileSync(path.join(ROOT, 'fixtures/advisor-lifecycle/advisor-activation-contract-family-v2-valid.json'), 'utf8'));
const conversionFixture = JSON.parse(fs.readFileSync(path.join(ROOT, 'fixtures/recruitment/advisor-conversion-contract-family-v2-valid.json'), 'utf8'));

const contractMap = {
  policy: 'advisorActivationPolicy', provider: 'advisorActivationEvidenceProvider', evidence: 'advisorActivationEvidence',
  evaluation: 'advisorActivationEvaluation', review: 'advisorActivationReviewDecision', receipt: 'advisorActivationReceipt',
  suspension: 'advisorSuspensionReceipt', deactivation: 'advisorDeactivationReceipt', reactivation: 'advisorReactivationReceipt',
  correction: 'advisorLifecycleCorrection', event: 'advisorLifecycleEvent'
};

const clone = value => JSON.parse(JSON.stringify(value));
const resolveRef = ref => schema.$defs[ref.replace('#/$defs/', '')];
const isType = (value, type) => type === 'null' ? value === null : type === 'array' ? Array.isArray(value) : type === 'object' ? value !== null && typeof value === 'object' && !Array.isArray(value) : type === 'integer' ? Number.isInteger(value) : typeof value === type;

function validateNode(node, value, at = '$') {
  const errors = [];
  if (!node) return [`${at}: missing schema`];
  if (node.$ref) errors.push(...validateNode(resolveRef(node.$ref), value, at));
  if (node.allOf) node.allOf.forEach(item => errors.push(...validateNode(item, value, at)));
  if (node.anyOf && !node.anyOf.some(item => validateNode(item, value, at).length === 0)) errors.push(`${at}: no anyOf branch matched`);
  if (node.const !== undefined && value !== node.const) errors.push(`${at}: const mismatch`);
  if (node.enum && !node.enum.includes(value)) errors.push(`${at}: value not allowlisted`);
  if (node.type) {
    const types = Array.isArray(node.type) ? node.type : [node.type];
    if (!types.some(type => isType(value, type))) return errors.concat(`${at}: expected ${types.join('|')}`);
  }
  if (typeof value === 'string') {
    if (node.minLength && value.length < node.minLength) errors.push(`${at}: empty string`);
    if (node.format === 'date-time' && Number.isNaN(Date.parse(value))) errors.push(`${at}: invalid date-time`);
  }
  if (typeof value === 'number' && node.minimum !== undefined && value < node.minimum) errors.push(`${at}: below minimum`);
  if (Array.isArray(value)) {
    if (node.minItems !== undefined && value.length < node.minItems) errors.push(`${at}: too few items`);
    if (node.uniqueItems && new Set(value.map(JSON.stringify)).size !== value.length) errors.push(`${at}: duplicate items`);
    if (node.items) value.forEach((item, index) => errors.push(...validateNode(node.items, item, `${at}[${index}]`)));
  }
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    (node.required || []).forEach(key => { if (!Object.prototype.hasOwnProperty.call(value, key)) errors.push(`${at}.${key}: required`); });
    if (node.additionalProperties === false && node.properties) Object.keys(value).forEach(key => { if (!Object.prototype.hasOwnProperty.call(node.properties, key)) errors.push(`${at}.${key}: additional property`); });
    Object.entries(node.properties || {}).forEach(([key, child]) => { if (Object.prototype.hasOwnProperty.call(value, key)) errors.push(...validateNode(child, value[key], `${at}.${key}`)); });
  }
  if (node.if) {
    const matches = validateNode(node.if, value, at).length === 0;
    if (matches && node.then) errors.push(...validateNode(node.then, value, at));
    if (!matches && node.else) errors.push(...validateNode(node.else, value, at));
  }
  return errors;
}

const expectValid = (name, value) => assert.deepEqual(validateNode(schema.$defs[name], value), [], `${name} should validate`);
const expectInvalid = (name, value, message) => assert.ok(validateNode(schema.$defs[name], value).length > 0, message);
const timezonePresent = value => /(Z|[+-]\d{2}:\d{2})$/.test(value);

function classifyEvidence(evidence, provider, policy, now) {
  const trusted = policy.trustedEvidenceProviders.some(ref => ref.providerId === provider.providerId && ref.providerPolicyVersion === provider.providerPolicyVersion);
  if (!trusted || ['UNTRUSTED', 'REVOKED'].includes(provider.trustLevel) || provider.revocationStatus !== 'ACTIVE') return { accepted: false, reason: 'UNTRUSTED_OR_REVOKED_PROVIDER' };
  if (!provider.allowedEvidenceTypes.includes(evidence.evidenceType)) return { accepted: false, reason: 'EVIDENCE_TYPE_NOT_ALLOWED' };
  if (evidence.verificationStatus === 'REVOKED' || evidence.revokedAt) return { accepted: false, reason: 'EVIDENCE_REVOKED' };
  if (evidence.verificationStatus === 'EXPIRED' || (evidence.expiresAt && Date.parse(evidence.expiresAt) <= Date.parse(now))) return { accepted: false, reason: 'EVIDENCE_EXPIRED' };
  if (evidence.verificationStatus !== 'VERIFIED') return { accepted: false, reason: 'EVIDENCE_UNVERIFIED' };
  if (!evidence.sourceEffectiveAt || !timezonePresent(evidence.sourceEffectiveAt)) return { accepted: false, reason: 'EFFECTIVE_TIME_MISSING_OR_UNZONED' };
  if (evidence.evidenceClass !== 'OFFICIAL_CONFIRMED') return { accepted: false, reason: 'SUPPORTING_OR_NON_AUTHORITATIVE' };
  return { accepted: true, reason: 'TRUSTED_OFFICIAL_EVIDENCE' };
}

function evaluateActivation({ identityExists, conversionReceipt, policy, provider, evidence, now, conflicts = [], blockedPeriods = [] }) {
  const blockingConditions = [];
  if (!identityExists) blockingConditions.push('ADVISOR_IDENTITY_MISSING');
  if (!conversionReceipt || conversionReceipt.contractType !== 'ADVISOR_CONVERSION_RECEIPT' || conversionReceipt.immutable !== true) blockingConditions.push('CONVERSION_INCOMPLETE');
  if (!policy) return { status: 'POLICY_NOT_AVAILABLE', active: false, humanReviewRequired: true };
  if (conversionReceipt && evidence.advisorId !== conversionReceipt.advisorId) blockingConditions.push('ADVISOR_ID_MISMATCH');
  const classification = classifyEvidence(evidence, provider, policy, now);
  if (!classification.accepted) blockingConditions.push(classification.reason);
  if (conflicts.length) return { status: 'CONFLICT_REVIEW_REQUIRED', active: false, humanReviewRequired: true, blockingConditions: ['OFFICIAL_EVIDENCE_CONFLICT'], effectiveAt: null };
  if (blockedPeriods.length) blockingConditions.push('SUSPENSION_OR_DEACTIVATION_EFFECTIVE');
  if (blockingConditions.length) {
    const status = blockingConditions.includes('EVIDENCE_EXPIRED') ? 'EVIDENCE_EXPIRED' : blockingConditions.includes('EVIDENCE_REVOKED') ? 'EVIDENCE_REVOKED' : 'MORE_EVIDENCE_REQUIRED';
    return { status, active: false, humanReviewRequired: true, blockingConditions, effectiveAt: null };
  }
  return { status: 'ELIGIBLE', active: false, humanReviewRequired: policy.humanReviewMode === 'ALWAYS', blockingConditions: [], effectiveAt: evidence.sourceEffectiveAt };
}

function canonicalHash(value) {
  const sort = input => Array.isArray(input) ? input.map(sort) : input && typeof input === 'object' ? Object.keys(input).sort().reduce((out, key) => (out[key] = sort(input[key]), out), {}) : input;
  return crypto.createHash('sha256').update(JSON.stringify(sort(value))).digest('hex');
}

function activationIdempotency(prior, candidate) {
  const keyHit = prior.find(item => item.idempotencyKey === candidate.idempotencyKey);
  if (keyHit && keyHit.payloadHash !== canonicalHash(candidate)) return 'REJECT_IDEMPOTENCY_PAYLOAD_CONFLICT';
  const intentHit = prior.find(item => item.activationIntentKey === candidate.activationIntentKey);
  if (intentHit) return 'RETURN_EXISTING_RECEIPT';
  const sameActivation = prior.find(item => item.advisorId === candidate.advisorId && item.conversionReceiptId === candidate.conversionReceiptId && item.activationPolicyId === candidate.activationPolicyId);
  if (sameActivation && sameActivation.activationEffectiveAt !== candidate.activationEffectiveAt) return 'OPEN_CORRECTION_REVIEW';
  const overlapping = prior.find(item => item.advisorId === candidate.advisorId && item.activePeriodOpen);
  if (overlapping) return 'BLOCK_DUPLICATE_ACTIVE_PERIOD';
  return 'ACCEPT_NEW_INTENT';
}

assert.equal(fixture.fixtureType, 'SYNTHETIC_CONTRACT_VALIDATION_ONLY');
Object.entries(contractMap).forEach(([key, definition]) => expectValid(definition, fixture[key]));

// Activation separation and insufficiency cases.
const base = {
  identityExists: true,
  conversionReceipt: {
    ...conversionFixture.receipt,
    advisorId: fixture.evidence.advisorId,
    advisorConversionId: fixture.evidence.advisorConversionId,
    conversionReceiptId: fixture.evidence.conversionReceiptId
  },
  policy: fixture.policy,
  provider: fixture.provider,
  evidence: fixture.evidence,
  now: '2026-07-16T00:00:00-06:00'
};
assert.equal(evaluateActivation(base).status, 'ELIGIBLE');
assert.equal(evaluateActivation(base).active, false, 'evaluation never materializes active truth');
assert.equal(evaluateActivation({ ...base, evidence: { ...fixture.evidence, evidenceClass: 'SUPPORTING', evidenceType: 'CONTRACT_SIGNED' } }).active, false);
assert.equal(evaluateActivation({ ...base, evidence: { ...fixture.evidence, evidenceClass: 'NON_AUTHORITATIVE', evidenceType: 'MANAGER_FREE_TEXT_CONFIRMATION' } }).active, false);
assert.equal(evaluateActivation({ ...base, identityExists: false }).active, false);
assert.equal(evaluateActivation({ ...base, conversionReceipt: null }).active, false);
['UI_CHECKBOX', 'STATIC_FIXTURE', 'AI_INFERENCE', 'DASHBOARD_STATUS'].forEach(type => assert.equal(evaluateActivation({ ...base, evidence: { ...fixture.evidence, evidenceType: type, evidenceClass: 'NON_AUTHORITATIVE' } }).active, false));

// Provider and evidence trust.
assert.equal(classifyEvidence(fixture.evidence, fixture.provider, fixture.policy, base.now).accepted, true);
const untrustedProvider = { ...fixture.provider, trustLevel: 'UNTRUSTED' };
assert.equal(classifyEvidence(fixture.evidence, untrustedProvider, fixture.policy, base.now).accepted, false);
const revokedEvidence = { ...fixture.evidence, verificationStatus: 'REVOKED', revokedAt: '2026-07-15T10:00:00-06:00' };
assert.equal(evaluateActivation({ ...base, evidence: revokedEvidence }).status, 'EVIDENCE_REVOKED');
const expiredEvidence = { ...fixture.evidence, expiresAt: '2026-07-15T23:00:00-06:00' };
assert.equal(evaluateActivation({ ...base, evidence: expiredEvidence }).status, 'EVIDENCE_EXPIRED');
assert.ok(evaluateActivation({ ...base, evidence: { ...fixture.evidence, advisorId: 'ADVISOR_MISMATCH' } }).blockingConditions.includes('ADVISOR_ID_MISMATCH'));
assert.equal(evaluateActivation({ ...base, evidence: { ...fixture.evidence, sourceEffectiveAt: null } }).active, false);

// Effective time has independent, zoned source semantics.
assert.notEqual(fixture.evidence.sourceEffectiveAt, fixture.evidence.ingestedAt);
assert.notEqual(fixture.receipt.activationEffectiveAt, conversionFixture.receipt.conversionCompletedAt);
assert.ok(timezonePresent(fixture.receipt.activationEffectiveAt));
const unzoned = clone(fixture.evidence); unzoned.sourceEffectiveAt = '2026-07-15T08:30:00';
assert.equal(classifyEvidence(unzoned, fixture.provider, fixture.policy, base.now).accepted, false);
const backdatedWithoutOfficial = { ...fixture.evidence, evidenceClass: 'SUPPORTING', evidenceType: 'CONTRACT_SIGNED', sourceEffectiveAt: '2026-06-01T00:00:00-06:00' };
assert.equal(evaluateActivation({ ...base, evidence: backdatedWithoutOfficial }).active, false);

// Human review and conflicts.
const aiReview = clone(fixture.review); aiReview.reviewerActor.actorType = 'AI';
expectInvalid('advisorActivationReviewDecision', aiReview, 'AI actor cannot review');
const noAuthority = clone(fixture.review); delete noAuthority.reviewAuthority;
expectInvalid('advisorActivationReviewDecision', noAuthority, 'review authority required');
const noPolicy = clone(fixture.review); delete noPolicy.policySnapshotId;
expectInvalid('advisorActivationReviewDecision', noPolicy, 'policy required');
const conflict = evaluateActivation({ ...base, conflicts: [fixture.evidence, { ...fixture.evidence, activationEvidenceId: 'CONFLICT_2' }] });
assert.equal(conflict.status, 'CONFLICT_REVIEW_REQUIRED'); assert.equal(conflict.humanReviewRequired, true); assert.equal(conflict.effectiveAt, null);
assert.equal(fixture.policy.conflictRules.latestEventWins, false);
const revokedProvider = { ...fixture.provider, revocationStatus: 'REVOKED', trustLevel: 'REVOKED' };
assert.equal(classifyEvidence(fixture.evidence, revokedProvider, fixture.policy, base.now).accepted, false);

// Idempotency and active periods.
const prior = [{ ...fixture.receipt, payloadHash: canonicalHash(fixture.receipt), activePeriodOpen: false }];
assert.equal(activationIdempotency(prior, fixture.receipt), 'RETURN_EXISTING_RECEIPT');
const changed = { ...fixture.receipt, integrityReference: 'sha256:changed' };
assert.equal(activationIdempotency(prior, changed), 'REJECT_IDEMPOTENCY_PAYLOAD_CONFLICT');
const changedDate = { ...fixture.receipt, idempotencyKey: 'NEW_KEY', activationIntentKey: 'NEW_INTENT', activationEffectiveAt: '2026-07-16T08:30:00-06:00' };
assert.equal(activationIdempotency(prior, changedDate), 'OPEN_CORRECTION_REVIEW');
const overlappingPrior = [{ ...fixture.receipt, payloadHash: canonicalHash(fixture.receipt), activePeriodOpen: true }];
const second = { ...fixture.receipt, idempotencyKey: 'SECOND_KEY', activationIntentKey: 'SECOND_INTENT', conversionReceiptId: 'OTHER_CONVERSION' };
assert.equal(activationIdempotency(overlappingPrior, second), 'BLOCK_DUPLICATE_ACTIVE_PERIOD');

// Suspension, deactivation and reactivation preserve identity/history.
assert.equal(fixture.suspension.identityPreserved, true); assert.equal(fixture.suspension.pipelineHistoryPreserved, true); assert.equal(fixture.suspension.project200HandoffAllowed, false);
assert.equal(fixture.deactivation.identityPreserved, true); assert.equal(fixture.deactivation.conversionReceiptPreserved, true); assert.equal(fixture.deactivation.prospectHistoryPreserved, true); assert.equal(fixture.deactivation.activityHistoryPreserved, true);
assert.equal(fixture.reactivation.advisorId, fixture.deactivation.advisorId); assert.equal(fixture.reactivation.createsNewAdvisorId, false); assert.equal(fixture.reactivation.priorDeactivationPreserved, true); assert.equal(fixture.reactivation.currentEvidenceRequired, true);
assert.notEqual(fixture.reactivation.reactivationReceiptId, fixture.receipt.activationReceiptId, 'reactivation creates a new effective period receipt');

// Append-only correction and privacy.
assert.equal(fixture.correction.appendOnly, true); assert.equal(fixture.correction.originalReceiptReference, fixture.receipt.activationReceiptId);
const silent = clone(fixture.correction); silent.appendOnly = false; expectInvalid('advisorLifecycleCorrection', silent, 'silent rewrite rejected');
['project200Contacts','nasat','privateManagerNotes','prospectData','clientData','quoteData','policyData','salesPipelineContent'].forEach(field => {
  const unsafe = clone(fixture.evidence); unsafe[field] = 'FORBIDDEN'; expectInvalid('advisorActivationEvidence', unsafe, `${field} rejected`);
});

// Downstream boundaries.
assert.equal(fixture.receipt.grantsAdvisorOsAccess, false); assert.equal(fixture.receipt.createsSalesPipeline, false); assert.equal(fixture.receipt.importsProject200, false);

// Provider contracts force fixture/browser/AI to untrusted or revoked.
['FIXTURE','BROWSER','AI'].forEach(providerType => {
  const invalid = clone(fixture.provider); invalid.providerType = providerType; invalid.trustLevel = 'INSTITUTIONAL_OFFICIAL';
  expectInvalid('advisorActivationEvidenceProvider', invalid, `${providerType} cannot be official`);
});

console.log('067G3B ADVISOR ACTIVATION AUTHORITY AND EVIDENCE POLICY: PASS');
console.log('Contracts validated: 11');
console.log('Runtime activation writer created: NO');
console.log('Real advisor activated: NO');
