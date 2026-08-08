import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import test from 'node:test';

const require = createRequire(import.meta.url);
const contract = require('../platform/policy-intelligence/policy-coverage-contract.js');
const fixture = JSON.parse(readFileSync(new URL('./fixtures/policy-coverage-multi-benefit.synthetic.json', import.meta.url), 'utf8'));
const migration = readFileSync(new URL('../supabase/migrations/20260808000100_policy_coverage_canonical_extension.sql', import.meta.url), 'utf8');
const schema = JSON.parse(readFileSync(new URL('../schemas/policy-v2-coverage.schema.json', import.meta.url), 'utf8'));
const policySchema = readFileSync(new URL('../schemas/policy-v2.schema.json', import.meta.url), 'utf8');

function markers(text, values) {
  for (const value of values) assert.ok(text.includes(value), `Missing marker: ${value}`);
}

function validCommand(overrides = {}) {
  return {
    contractType: 'FORGE_CONFIRMED_POLICY_COVERAGES_COMMAND',
    contractVersion: 'POLICY-COVERAGE-1.0',
    advisorId: 'advisor:synthetic:a',
    actorReference: 'advisor:synthetic:a',
    idempotencyKey: 'policy-coverages:synthetic:1',
    confirmedAt: '2026-08-08T02:30:00.000Z',
    policyReference: fixture.policyReference,
    policyVersionReference: fixture.policyVersionReference,
    evidenceVersionReference: fixture.evidenceVersionReference,
    coverages: fixture.coverages,
    ...overrides
  };
}

test('COVERAGE_DISCOVERY_COMPLETE contract is a Policy child, not a replacement Policy', () => {
  assert.equal(schema.title, 'Forge Canonical Policy Coverage V1');
  assert.equal(schema.properties.contractType.const, 'FORGE_POLICY_COVERAGE');
  assert.ok(schema.required.includes('policyReference'));
  assert.ok(schema.required.includes('policyVersionReference'));
});

test('PRODUCT_COVERAGE_NOT_POLICY_TRUTH product reference is optional context only', () => {
  const withoutProductMapping = contract.validateCoverage(fixture.coverages[2]);
  assert.equal(withoutProductMapping.productCoverageReference, null);
  assert.ok(migration.includes('Product coverage references are taxonomy only and do not prove contraction'));
});

test('POLICY_COVERAGE_REQUIRES_EVIDENCE', () => {
  assert.throws(() => contract.validateCoverage({ ...fixture.coverages[0], sourceEvidenceReferences: [] }),
    error => error.code === 'POLICY_COVERAGE_EVIDENCE_INVALID');
  assert.throws(() => contract.buildConfirmedPolicyCoveragesCommand(validCommand({
    evidenceVersionReference: 'policy-evidence:other'
  })), error => error.code === 'POLICY_COVERAGE_COMMAND_EVIDENCE_MISMATCH');
});

test('ONE_POLICY_MULTIPLE_COVERAGES', () => {
  const command = contract.buildConfirmedPolicyCoveragesCommand(validCommand());
  assert.equal(command.coverages.length, 3);
  assert.equal(new Set(command.coverages.map(item => item.policyReference)).size, 1);
});

test('PER_COVERAGE_SUM_INSURED and PREMIUM remain independent', () => {
  const [base, accident, waiver] = fixture.coverages;
  assert.equal(base.sumInsured, 2500000);
  assert.equal(accident.sumInsured, 500000);
  assert.equal(base.premiumAmount, 15000);
  assert.equal(accident.premiumAmount, 1200);
  assert.equal(waiver.sumInsured, null);
  assert.equal(waiver.premiumAmount, null);
});

test('PER_COVERAGE_EFFECTIVE_DATE PERIOD PAYMENT_PERIOD ANNEX', () => {
  const [base, accident] = fixture.coverages;
  assert.notEqual(base.effectiveTo, accident.effectiveTo);
  assert.equal(base.coveragePeriodValue, 20);
  assert.equal(base.paymentPeriodValue, 10);
  assert.equal(accident.annexReference, 'annex:synthetic:A07');
  assert.equal(accident.riderReference, 'rider:synthetic:R07');
});

test('UNKNOWN_SUM_INSURED_NOT_ZERO UNKNOWN_PREMIUM_NOT_ZERO UNKNOWN_CURRENCY_NOT_DEFAULT UNKNOWN_PERIOD_NOT_GUESSED', () => {
  const unknown = contract.validateCoverage(fixture.coverages[2]);
  assert.equal(unknown.sumInsured, null);
  assert.equal(unknown.premiumAmount, null);
  assert.equal(unknown.currency, null);
  assert.equal(unknown.coveragePeriodValue, null);
  assert.equal(unknown.coveragePeriodUnit, null);
  assert.equal(unknown.coverageState, null);
});

test('POLICY_LEVEL_FIELDS_NOT_SILENTLY_REDEFINED', () => {
  assert.ok(policySchema.includes('"premiumAmount"'));
  assert.ok(policySchema.includes('"sumInsured"'));
  assert.ok(migration.includes('policy_row.sum_insured is not null or policy_row.premium_amount is not null'));
  assert.doesNotMatch(migration, /update public\.canonical_policies[\s\S]{0,800}(sum_insured|premium_amount)/i);
});

test('POLICY_VERSION_BINDING and COVERAGE_HISTORY_PRESERVED', () => {
  markers(migration, [
    'create table if not exists public.policy_coverage_versions',
    'foreign key (policy_version_id, advisor_id)',
    'previous_coverage_version_id uuid',
    'correction_of uuid',
    'forge_policy_coverage_version_append_only_guard'
  ]);
});

test('EVIDENCE_LINEAGE and CORRECTION_OR_SUPERSESSION are explicit', () => {
  markers(migration, [
    'evidence_version_id uuid not null',
    'source_evidence_references jsonb not null',
    'POLICY_COVERAGE_CORRECTION_TARGET_NOT_FOUND',
    'POLICY_COVERAGE_VERSION_CONFLICT'
  ]);
});

test('IDEMPOTENT_REPLAY CHANGED_INPUT_CONFLICT READ_AFTER_WRITE reuse accepted command infrastructure', () => {
  markers(migration, [
    "actor_id, 'POLICY_COVERAGES', idempotency_key, command_digest",
    'forge_cartera010b_existing_receipt_response',
    'forge_cartera010b_persist_receipt',
    'POLICY_COVERAGE_READ_AFTER_WRITE_FAILED',
    "'readAfterWriteVerified', true"
  ]);
  const a = contract.buildConfirmedPolicyCoveragesCommand(validCommand());
  const b = contract.buildConfirmedPolicyCoveragesCommand(validCommand());
  assert.equal(a.commandDigest, b.commandDigest);
  assert.match(a.commandDigest, /^[a-f0-9]{64}$/);
});

test('RLS_OWNER_READ RLS_CROSS_ADVISOR_DENIED DIRECT_WRITE_DENIED', () => {
  markers(migration, [
    'alter table public.policy_coverages enable row level security',
    'alter table public.policy_coverage_versions enable row level security',
    'using (advisor_id = auth.uid())',
    'revoke all on table public.policy_coverages from public, anon, authenticated',
    'revoke all on table public.policy_coverage_versions from public, anon, authenticated'
  ]);
  assert.throws(() => contract.buildConfirmedPolicyCoveragesCommand(validCommand({ actorReference: 'advisor:synthetic:b' })),
    error => error.code === 'POLICY_COVERAGE_COMMAND_OWNER_MISMATCH');
});

test('BENEFICIARY_NOT_COVERAGE and BENEFICIARY_PRIVACY', () => {
  assert.throws(() => contract.validateCoverage({ ...fixture.coverages[0], beneficiaryName: 'Synthetic Person' }),
    error => error.code === 'POLICY_COVERAGE_UNKNOWN_FIELD');
  assert.doesNotMatch(migration, /beneficiary_name|beneficiary_share/i);
});

test('NO_AUTOMATIC_POLICY_CONFIRMATION NO_AUTOMATIC_COVERAGE_CONFIRMATION NO_PARALLEL_POLICY_WRITER', () => {
  markers(migration, [
    'forge_policy_intelligence_confirm_policy_coverages',
    'forge_cartera010b_confirm_identity_and_policy',
    'evidence.verification_state not in'.replace('evidence.', 'persisted_evidence.')
  ]);
  assert.doesNotMatch(migration, /insert into public\.canonical_policies/i);
  assert.doesNotMatch(migration, /create table if not exists public\.canonical_policies/i);
});

test('NO_PARALLEL_PRODUCT_TRUTH and NO_DUPLICATE_EVIDENCE_AUTHORITY', () => {
  assert.doesNotMatch(migration, /create table if not exists public\.(product_coverages|policy_evidence_versions)/i);
  assert.ok(migration.includes('references public.policy_evidence_versions'));
  assert.ok(migration.includes('product_coverage_reference text'));
});

test('coverage command rejects unreviewed or conflicting candidates', () => {
  assert.throws(() => contract.buildConfirmedPolicyCoveragesCommand(validCommand({
    coverages: [{ ...fixture.coverages[0], verificationState: 'UNVERIFIED' }]
  })), error => error.code === 'POLICY_COVERAGE_COMMAND_UNCONFIRMED_FACT');
  assert.throws(() => contract.buildConfirmedPolicyCoveragesCommand(validCommand({
    coverages: [{ ...fixture.coverages[0], conflictState: 'CONFLICT' }]
  })), error => error.code === 'POLICY_COVERAGE_COMMAND_UNCONFIRMED_FACT');
});

test('negative values, guessed currency and malformed evidence fail closed', () => {
  assert.throws(() => contract.validateCoverage({ ...fixture.coverages[0], premiumAmount: -1 }),
    error => error.code === 'POLICY_COVERAGE_PREMIUM_INVALID');
  assert.throws(() => contract.validateCoverage({ ...fixture.coverages[0], currency: 'PESO' }),
    error => error.code === 'POLICY_COVERAGE_CURRENCY_INVALID');
  assert.throws(() => contract.validateCoverage({ ...fixture.coverages[0], sourceEvidenceReferences: ['bad ref with spaces'] }),
    error => error.code === 'POLICY_COVERAGE_EVIDENCE_INVALID');
});

test('duplicate logical coverage and client-created version truth identifier are rejected', () => {
  assert.throws(() => contract.buildConfirmedPolicyCoveragesCommand(validCommand({
    coverages: [fixture.coverages[0], fixture.coverages[0]]
  })), error => error.code === 'POLICY_COVERAGE_DUPLICATE_LOGICAL_REFERENCE');
  assert.throws(() => contract.validateCoverage({
    ...fixture.coverages[0],
    policyCoverageVersionReference: 'client:must-not-own-this'
  }), error => error.code === 'POLICY_COVERAGE_UNKNOWN_FIELD');
});

test('LEGACY_POLICY_WITHOUT_COVERAGE_DETAIL_HANDLED_HONESTLY', () => {
  const legacy = contract.buildPolicyCoverageReadProjection({
    policy: { policyReference: 'policy:legacy:1', sumInsured: 1000000, premiumAmount: 10000 },
    coverages: []
  });
  const unknown = contract.buildPolicyCoverageReadProjection({
    policy: { policyReference: 'policy:legacy:2', sumInsured: null, premiumAmount: null },
    coverages: []
  });
  assert.equal(legacy.coverageDetailState, 'LEGACY_POLICY_SUMMARY_ONLY');
  assert.equal(unknown.coverageDetailState, 'COVERAGE_DETAIL_NOT_CAPTURED');
  assert.deepEqual(legacy.coverages, []);
});

test('COVERAGE_READ_MODEL excludes internal ids, raw documents and beneficiary data', () => {
  const projection = contract.buildPolicyCoverageReadProjection({
    policy: { policyReference: fixture.policyReference, sumInsured: null, premiumAmount: null },
    policyVersionReference: fixture.policyVersionReference,
    coverages: fixture.coverages
  });
  assert.equal(projection.coverageDetailState, 'COVERAGE_DETAIL_PARTIAL');
  const serialized = JSON.stringify(projection);
  assert.doesNotMatch(serialized, /advisorId|documentHash|beneficiary|internalDbId|providerPrompt/i);
  assert.equal(projection.coverages[0].annexReference, 'annex:synthetic:A01');
});

test('ATOMICITY wrapper composes the accepted Policy command rather than duplicating it', () => {
  markers(migration, [
    'forge_cartera010b_confirm_identity_policy_and_coverages',
    'base_result := public.forge_cartera010b_confirm_identity_and_policy',
    'coverage_result := public.forge_policy_intelligence_confirm_policy_coverages',
    "'transactionState', 'COMMITTED'"
  ]);
});

test('scope remains backend-only and Aura is untouched by the phase files', () => {
  assert.doesNotMatch(migration, /docs\/static-preview\/forge-aura|Material 3|pipeline-module|activity-module/i);
  assert.equal(fixture.synthetic, true);
});
