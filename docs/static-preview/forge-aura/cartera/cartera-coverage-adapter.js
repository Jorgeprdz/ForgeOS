import { civilDateToTransportInstant, normalizeCivilDate } from './cartera-semantic-v1.js?v=cartera-pdf-semantic-reconciliation-012';

const REF = /^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,239}$/;

function fail(code, cause = null) {
  const error = new Error(code);
  error.code = code;
  if (cause) error.cause = cause;
  return error;
}

function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (!value || typeof value !== 'object') return value;
  return Object.keys(value).sort().reduce((out, key) => {
    out[key] = stable(value[key]);
    return out;
  }, {});
}

async function digest(value) {
  const source = { ...value };
  delete source.commandDigest;
  const bytes = new TextEncoder().encode(JSON.stringify(stable(source)));
  const hash = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(hash)].map(v => v.toString(16).padStart(2, '0')).join('');
}

async function requireUser(client) {
  const result = await client.auth.getUser();
  if (result?.error) throw fail('COVERAGE_AUTH_LOOKUP_FAILED', result.error);
  if (!result?.data?.user?.id) throw fail('COVERAGE_AUTH_REQUIRED');
  return result.data.user;
}

function optionalNumber(value) {
  if (value === null || value === undefined || value === '') return null;
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0) throw fail('COVERAGE_NUMBER_INVALID');
  return number;
}

function optionalCurrency(value) {
  const normalized = String(value || '').trim().toUpperCase();
  if (!normalized) return null;
  if (!/^[A-Z]{3}$/.test(normalized)) throw fail('COVERAGE_CURRENCY_INVALID');
  return normalized;
}

function optionalReference(value) {
  const normalized = String(value || '').trim();
  if (!normalized) return null;
  if (!REF.test(normalized)) throw fail('COVERAGE_REFERENCE_INVALID');
  return normalized;
}

function optionalText(value, max = 240) {
  const normalized = String(value || '').trim();
  if (!normalized) return null;
  return normalized.slice(0, max);
}

function optionalIso(value) {
  if (!value) return null;
  const civil = normalizeCivilDate(value);
  if (civil) return civilDateToTransportInstant(civil);
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) throw fail('COVERAGE_DATE_INVALID');
  return parsed.toISOString();
}

async function resolvePolicyVersionContext(client, policyReference) {
  const policyResult = await client
    .from('canonical_policies')
    .select('id,policy_reference,current_version,archived_at')
    .eq('policy_reference', policyReference)
    .is('archived_at', null)
    .single();
  if (policyResult.error || !policyResult.data?.id) {
    throw fail('COVERAGE_POLICY_READ_FAILED', policyResult.error);
  }

  const policy = policyResult.data;
  const versionResult = await client
    .from('policy_versions')
    .select('id,policy_version_reference,version_number,evidence_version_id')
    .eq('policy_id', policy.id)
    .eq('version_number', policy.current_version)
    .single();
  if (versionResult.error || !versionResult.data?.policy_version_reference) {
    throw fail('COVERAGE_POLICY_VERSION_READ_FAILED', versionResult.error);
  }

  const version = versionResult.data;
  const evidenceResult = await client
    .from('policy_evidence_versions')
    .select('evidence_version_reference')
    .eq('id', version.evidence_version_id)
    .eq('policy_id', policy.id)
    .single();
  if (evidenceResult.error || !evidenceResult.data?.evidence_version_reference) {
    throw fail('COVERAGE_EVIDENCE_VERSION_READ_FAILED', evidenceResult.error);
  }

  return Object.freeze({
    policy,
    version,
    evidenceVersionReference: evidenceResult.data.evidence_version_reference,
  });
}

export async function confirmNewPolicyCoverage({ client, policyReference, input = {} } = {}) {
  if (!client) throw fail('COVERAGE_CLIENT_REQUIRED');
  const actor = await requireUser(client);
  if (!REF.test(String(policyReference || ''))) throw fail('COVERAGE_POLICY_REFERENCE_INVALID');

  const context = await resolvePolicyVersionContext(client, policyReference);
  const version = context.version;
  const evidenceReference = context.evidenceVersionReference;
  const at = new Date().toISOString();
  const reference = input.policyCoverageReference
    || `policy-coverage:aura:${crypto.randomUUID?.() || Date.now()}`;
  if (!REF.test(reference)) throw fail('COVERAGE_LOGICAL_REFERENCE_INVALID');

  const coveragePeriodValue = optionalNumber(input.coveragePeriodValue);
  const paymentPeriodValue = optionalNumber(input.paymentPeriodValue);
  const coverage = {
    contractType: 'FORGE_POLICY_COVERAGE',
    schemaVersion: '1.0.0',
    policyCoverageReference: reference,
    advisorId: actor.id,
    policyReference,
    policyVersionReference: version.policy_version_reference,
    productCoverageReference: optionalReference(input.productCoverageReference),
    coverageCode: optionalText(input.coverageCode, 120),
    coverageLabel: optionalText(input.coverageLabel, 240),
    coverageKind: optionalReference(input.coverageKind) || 'OTHER',
    coverageState: optionalReference(input.coverageState),
    sumInsured: optionalNumber(input.sumInsured),
    currency: optionalCurrency(input.currency),
    premiumAmount: optionalNumber(input.premiumAmount),
    premiumCurrency: optionalCurrency(input.premiumCurrency),
    annexReference: optionalReference(input.annexReference),
    riderReference: optionalReference(input.riderReference),
    effectiveFrom: optionalIso(input.effectiveFrom),
    effectiveTo: optionalIso(input.effectiveTo),
    coveragePeriodValue,
    coveragePeriodUnit: coveragePeriodValue === null
      ? null
      : optionalReference(input.coveragePeriodUnit),
    paymentPeriodValue,
    paymentPeriodUnit: paymentPeriodValue === null
      ? null
      : optionalReference(input.paymentPeriodUnit),
    sourceEvidenceReferences: [evidenceReference],
    verificationState: 'REVIEWED',
    completenessState: 'PARTIAL',
    freshnessState: 'CURRENT',
    conflictState: 'CLEAR',
    currentVersion: 1,
    previousCoverageVersionReference: null,
    correctionOf: null,
    createdAt: at,
    createdBy: actor.id,
    updatedAt: at,
    archivedAt: null,
    archivedBy: null,
    archiveReason: null,
  };

  const command = {
    contractType: 'FORGE_CONFIRMED_POLICY_COVERAGES_COMMAND',
    contractVersion: 'POLICY-COVERAGE-1.0',
    advisorId: actor.id,
    actorReference: actor.id,
    idempotencyKey: `AURA:COVERAGE:${reference}`,
    confirmedAt: at,
    policyReference,
    policyVersionReference: version.policy_version_reference,
    evidenceVersionReference: evidenceReference,
    coverages: [coverage],
  };
  command.commandDigest = await digest(command);

  const result = await client.rpc('forge_policy_intelligence_confirm_policy_coverages', {
    p_command: command,
  });
  if (result?.error) throw fail('COVERAGE_CONFIRMATION_FAILED', result.error);
  if (result?.data?.status !== 'CONFIRMED' || result.data?.readAfterWriteVerified !== true) {
    throw fail('COVERAGE_READ_AFTER_WRITE_FAILED');
  }
  return Object.freeze(result.data);
}
