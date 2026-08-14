import { createCanonicalConfirmationReviewService } from '../../../../advisor-os/cartera/canonical-confirmation-review-service.js';
import { createPersistentConfirmationOrchestrationService } from '../../../../advisor-os/cartera/persistent-confirmation-orchestration-service.js';
import {
  CARTERA_020C_ACCOUNT_OUTCOMES,
  CARTERA_020C_FIELD_DECISIONS,
  composeCartera020cIdentityCommandBatch,
  verifyCartera020cIdentityCommandResults,
  composeCartera020cConfirmedPolicyPlan,
} from '../../../../policy-operations/intake/cartera-020c-governed-command-composer.js';

const POLICY_SELECT = [
  'id','policy_reference','carrier_reference','policy_number','product_reference','issue_date',
  'effective_from','effective_to','status_value','status_source','status_as_of','currency',
  'premium_amount','payment_frequency','sum_insured','completeness_state','freshness_state',
  'conflict_state','current_version','created_at','updated_at','archived_at',
].join(',');

const STATUS_VALUES = new Set([
  'PENDING','ISSUED','ACTIVE','SUSPENDED','LAPSED','CANCELLED','MATURED','CLAIMED','UNKNOWN',
]);

function fail(code, cause = null) {
  const error = new Error(code);
  error.code = code;
  if (cause) error.cause = cause;
  return error;
}

function text(value) { return String(value ?? '').trim(); }
function upper(value) { return text(value).toUpperCase(); }
function record(value) { return Boolean(value) && typeof value === 'object' && !Array.isArray(value); }
function rows(result, code) {
  if (result?.error) throw fail(code, result.error);
  return Array.isArray(result?.data) ? result.data : [];
}
function one(result, code) {
  if (result?.error || !result?.data) throw fail(code, result?.error || null);
  return result.data;
}
function safeToken(value, fallback = 'unknown') {
  const normalized = text(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);
  return normalized || fallback;
}
function normalizedName(value) {
  return text(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}
function iso(value) {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}
function civilDate(value) {
  if (!value) return null;
  const raw = text(value);
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString().slice(0, 10);
}
function amount(value) {
  if (value === null || value === undefined || value === '') return null;
  const parsed = Number(String(value).replace(/[^0-9.-]/g, ''));
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}
function policyStatus(value) {
  const candidate = upper(value);
  return STATUS_VALUES.has(candidate) ? candidate : 'UNKNOWN';
}
function roleType(value) {
  const candidate = upper(value);
  return ({ OWNER:'POLICY_OWNER', POLICY_OWNER:'POLICY_OWNER', INSURED:'INSURED',
    ADDITIONAL_INSURED:'ADDITIONAL_INSURED', PAYOR:'PAYOR', BENEFICIARY:'BENEFICIARY',
    ADVISOR_OF_RECORD:'ADVISOR_OF_RECORD', ORIGINATING_ADVISOR:'ORIGINATING_ADVISOR',
    SERVICING_ADVISOR:'SERVICING_ADVISOR' })[candidate] || candidate;
}
function candidateReferenceTail(value, index = 0) {
  const cleaned = text(value).replace(/[^A-Za-z0-9]/g, '').slice(-36);
  return cleaned || `candidate${index + 1}`;
}
function fieldByName(readModel, ...names) {
  const wanted = new Set(names);
  return (readModel?.fields || []).find(field => wanted.has(field.fieldName)) || null;
}
function decisionForField(readModel, draft, ...names) {
  const field = fieldByName(readModel, ...names);
  if (!field) return null;
  const supplied = draft?.fieldDecisions?.[field.fieldName];
  if (supplied?.decision === CARTERA_020C_FIELD_DECISIONS.EDIT) return supplied.value;
  if (supplied?.decision === CARTERA_020C_FIELD_DECISIONS.UNKNOWN) return null;
  return field.value ?? null;
}
function uniquePolicyMatches(readModel) {
  const output = new Map();
  for (const candidate of readModel?.duplicatePolicyCandidates || []) {
    for (const match of candidate.existingPolicyMatches || []) {
      if (match?.policyReference) output.set(match.policyReference, match);
    }
  }
  return [...output.values()];
}
async function sha256(value) {
  const bytes = new TextEncoder().encode(typeof value === 'string' ? value : JSON.stringify(value));
  const digest = await globalThis.crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, '0')).join('');
}
async function idempotency(prefix, payload) {
  return `HOTFIX002:${prefix}:${(await sha256(payload)).slice(0, 40)}`;
}

async function loadExistingPolicyContext(client, policyReference) {
  if (!policyReference) return null;
  const policy = one(await client.from('canonical_policies')
    .select(POLICY_SELECT).eq('policy_reference', policyReference).is('archived_at', null).single(),
  'CARTERA020C_EXISTING_POLICY_READ_FAILED');
  const version = one(await client.from('policy_versions')
    .select('policy_version_reference,version_number,policy_id,confirmed_at')
    .eq('policy_id', policy.id).eq('version_number', policy.current_version).single(),
  'CARTERA020C_EXISTING_POLICY_VERSION_READ_FAILED');
  const roleResult = await client.rpc('forge_cartera010b_list_general_policy_roles', {
    p_policy_reference: policyReference,
  });
  if (roleResult?.error) throw fail('CARTERA020C_EXISTING_POLICY_ROLE_READ_FAILED', roleResult.error);
  const rolesList = Array.isArray(roleResult?.data) ? roleResult.data : (roleResult?.data?.items || []);
  return Object.freeze({ policy, version, roles: Object.freeze(rolesList) });
}

function buildIdentityDecisions(readModel, draft) {
  return (readModel.identityCandidates || []).map((candidate, index) => {
    const selection = draft?.identitySelections?.[candidate.candidateReference] || {};
    const matches = candidate.existingPersonMatches || [];
    if (selection.mode === 'existing') {
      const selected = text(selection.personReference);
      if (!selected) throw fail('CARTERA020C_IDENTITY_SELECTION_REQUIRED');
      return {
        candidateReference: candidate.candidateReference,
        outcome: 'LINK_CONFIRMED',
        existingPersonReference: selected,
        reasonCode: 'ADVISOR_CONFIRMED_EVIDENCE_PERSON_LINK',
      };
    }
    if (selection.mode !== 'create') {
      if (matches.length === 1) {
        return {
          candidateReference: candidate.candidateReference,
          outcome: 'LINK_CONFIRMED',
          existingPersonReference: matches[0].personReference,
          reasonCode: 'ADVISOR_CONFIRMED_RECONCILED_MATCH',
        };
      }
      throw fail(matches.length > 1 ? 'CARTERA020C_IDENTITY_AMBIGUITY' : 'CARTERA020C_IDENTITY_SELECTION_REQUIRED');
    }
    const displayName = text(selection.displayName || candidate.proposedLabel);
    if (!displayName) throw fail('CARTERA020C_NEW_PERSON_NAME_REQUIRED');
    return {
      candidateReference: candidate.candidateReference,
      outcome: 'CREATE_CONFIRMED',
      newPerson: {
        personReference: `person:cartera:${candidateReferenceTail(candidate.candidateReference, index)}`,
        displayName,
        preferredName: null,
        normalizedName: normalizedName(displayName),
        verifiedPhone: null,
        verifiedEmail: null,
        birthDate: null,
        privacyClassification: 'PRIVATE',
      },
      reasonCode: 'ADVISOR_CONFIRMED_EVIDENCE_PERSON_CREATE',
    };
  });
}

function buildAccountDecisions(readModel, draft) {
  return (readModel.accountCandidates || []).map(candidate => {
    const selection = draft?.accountSelections?.[candidate.candidateReference] || {};
    if (selection.accountReference) {
      return {
        candidateReference: candidate.candidateReference,
        outcome: CARTERA_020C_ACCOUNT_OUTCOMES.LINK_CONFIRMED,
        existingAccountReference: selection.accountReference,
      };
    }
    if (candidate.required) throw fail('CARTERA020C_ACCOUNT_SELECTION_REQUIRED');
    return { candidateReference: candidate.candidateReference, outcome: CARTERA_020C_ACCOUNT_OUTCOMES.NOT_APPLICABLE };
  });
}

function buildFieldDecisions(readModel, draft, reviewedAt) {
  return (readModel.fields || []).map(field => {
    const supplied = draft?.fieldDecisions?.[field.fieldName];
    let decision = supplied?.decision;
    if (!Object.values(CARTERA_020C_FIELD_DECISIONS).includes(decision)) {
      decision = String(field.candidateState || '').toUpperCase() === 'UNKNOWN'
        ? CARTERA_020C_FIELD_DECISIONS.UNKNOWN
        : CARTERA_020C_FIELD_DECISIONS.ACCEPT;
    }
    const output = {
      fieldName: field.fieldName,
      decision,
      reviewerReference: readModel.review.advisorId,
      reviewedAt,
    };
    if (decision === CARTERA_020C_FIELD_DECISIONS.EDIT) output.value = supplied.value;
    return output;
  });
}

function buildPolicyInput(readModel, draft, confirmedAt, existingContext) {
  const existing = existingContext?.policy || null;
  const policyNumber = text(decisionForField(readModel, draft, 'policyNumber') || existing?.policy_number);
  if (!policyNumber) throw fail('CARTERA020C_POLICY_NUMBER_REQUIRED');
  const productLabel = decisionForField(readModel, draft, 'productName', 'product', 'productLabel');
  const productReference = existing?.product_reference || `product:${safeToken(productLabel)}`;
  const effectiveFrom = decisionForField(readModel, draft, 'effectiveFrom', 'effectiveDate') || existing?.effective_from || null;
  const effectiveTo = decisionForField(readModel, draft, 'effectiveTo', 'expirationDate') || existing?.effective_to || null;
  const currency = text(decisionForField(readModel, draft, 'currency') || existing?.currency) || null;
  const paymentFrequency = upper(decisionForField(readModel, draft, 'paymentFrequency') || existing?.payment_frequency) || null;
  const statusValue = policyStatus(decisionForField(readModel, draft, 'status') || existing?.status_value);
  const requiredKnown = Boolean(policyNumber && productReference && effectiveFrom && effectiveTo && currency && paymentFrequency && statusValue !== 'UNKNOWN');
  return {
    policyReference: existing?.policy_reference || `policy:cartera:${readModel.source.documentDigest.slice(0, 40)}`,
    carrierReference: existing?.carrier_reference || 'carrier:unknown',
    policyNumber,
    productReference,
    issueDate: civilDate(decisionForField(readModel, draft, 'issueDate') || existing?.issue_date),
    effectiveFrom,
    effectiveTo,
    status: { value: statusValue, source: readModel.source.sourceReference, asOf: confirmedAt },
    currency,
    premiumAmount: amount(decisionForField(readModel, draft, 'premiumAmount') ?? existing?.premium_amount),
    paymentFrequency,
    sumInsured: amount(decisionForField(readModel, draft, 'sumInsured') ?? existing?.sum_insured),
    completenessState: requiredKnown ? 'COMPLETE' : 'PARTIAL',
    freshnessState: 'CURRENT',
    currentVersion: existing ? Number(existing.current_version) + 1 : 1,
    createdAt: iso(existing?.created_at) || confirmedAt,
    updatedAt: confirmedAt,
  };
}

function existingRoleFor(existingContext, candidateRoleType) {
  const wanted = roleType(candidateRoleType);
  return (existingContext?.roles || []).find(role => roleType(role.role_type || role.roleType) === wanted) || null;
}

function buildRoleDecisions(readModel, policyInput, existingContext, confirmedAt) {
  if ((readModel.restrictedPolicyRoleCandidates || []).length) {
    throw fail('CARTERA020C_RESTRICTED_REVIEW_REQUIRED');
  }
  const identities = readModel.identityCandidates || [];
  return (readModel.generalPolicyRoleCandidates || []).map(candidate => {
    const participantCandidateReference = candidate.participantCandidateReference
      || candidate.participant_candidate_reference
      || (identities.length === 1 ? identities[0].candidateReference : null);
    if (!participantCandidateReference) throw fail('CARTERA020C_POLICY_ROLE_PARTICIPANT_REQUIRED');
    const prior = existingRoleFor(existingContext, candidate.roleType);
    const priorEnd = prior?.effective_to || prior?.effectiveTo || policyInput.effectiveTo || null;
    const decision = {
      candidateReference: candidate.candidateReference,
      confirmationState: 'CONFIRMED',
      participantKind: 'PERSON',
      participantCandidateReference,
      visibilityScope: candidate.visibilityScope === 'RESTRICTED' ? 'RESTRICTED_ROLE_VIEW' : (candidate.visibilityScope || 'POLICY_TEAM'),
      privacyClassification: candidate.restricted ? 'RESTRICTED' : 'PRIVATE',
      effectiveFrom: prior ? confirmedAt : (iso(policyInput.effectiveFrom) || confirmedAt),
      effectiveTo: priorEnd ? iso(priorEnd) : null,
      version: prior ? Number(prior.role_version || prior.roleVersion || 1) + 1 : 1,
    };
    if (prior) {
      const reference = text(prior.policy_role_reference || prior.policyRoleReference);
      if (!reference) throw fail('CARTERA020C_POLICY_ROLE_CORRECTION_REFERENCE_REQUIRED');
      decision.policyRoleReference = reference;
      decision.correctionOf = reference;
    }
    return decision;
  });
}

export function createCarteraReviewConfirmation002({ client, clock } = {}) {
  if (!client?.auth?.getUser || !client?.from || !client?.rpc) throw fail('CARTERA020C_CLIENT_REQUIRED');
  const now = typeof clock === 'function' ? clock : () => new Date().toISOString();
  const reviewService = createCanonicalConfirmationReviewService({ client, clock: now });
  const orchestration = createPersistentConfirmationOrchestrationService({ client, clock: now });

  async function loadReview(packetReference) {
    return reviewService.loadReview(packetReference);
  }

  async function confirmReview(readModel, draft = {}) {
    if (!readModel || readModel.contractType !== 'FORGE_CARTERA_020C_REVIEW_READ_MODEL') {
      throw fail('CARTERA020C_REVIEW_READ_MODEL_REQUIRED');
    }
    if (readModel.state === 'BLOCKED' || (readModel.blockers || []).length) throw fail('CARTERA020C_REVIEW_BLOCKED');
    const reviewedAt = iso(draft.reviewedAt) || now();
    const identityDecisions = buildIdentityDecisions(readModel, draft);
    const accountDecisions = buildAccountDecisions(readModel, draft);
    const identityBatch = composeCartera020cIdentityCommandBatch({
      readModel, identityDecisions, accountDecisions, decidedAt: reviewedAt,
    });
    let status = await orchestration.prepareIdentity({
      identityBatch,
      idempotencyKey: await idempotency('IDENTITY', identityBatch),
      requestedAt: reviewedAt,
    });
    if (status.state !== 'IDENTITY_CONFIRMED') {
      status = await orchestration.runIdentity({
        reviewReference: readModel.review.reviewReference,
        expectedStateVersion: status.stateVersion,
      });
    }
    if (status.state !== 'IDENTITY_CONFIRMED') throw fail(`CARTERA020C_IDENTITY_${status.state || 'NOT_CONFIRMED'}`);
    const verification = verifyCartera020cIdentityCommandResults({
      batch: identityBatch,
      results: (status.identityResults || []).map(receipt => ({ candidateReference: receipt.candidateReference, receipt })),
    });

    const matches = uniquePolicyMatches(readModel);
    let selectedPolicyReference = text(draft.selectedPolicyReference);
    if (!selectedPolicyReference && matches.length === 1) selectedPolicyReference = matches[0].policyReference;
    if (!selectedPolicyReference && matches.length > 1) throw fail('CARTERA020C_POLICY_AMBIGUITY');
    if (selectedPolicyReference && !matches.some(match => match.policyReference === selectedPolicyReference)) {
      throw fail('CARTERA020C_SELECTED_POLICY_NOT_RECONCILED');
    }
    const existingContext = selectedPolicyReference
      ? await loadExistingPolicyContext(client, selectedPolicyReference)
      : null;
    const confirmedAt = reviewedAt;
    const policyInput = buildPolicyInput(readModel, draft, confirmedAt, existingContext);
    const fieldDecisions = buildFieldDecisions(readModel, draft, reviewedAt);
    const policyRoleDecisions = buildRoleDecisions(readModel, policyInput, existingContext, confirmedAt);
    const duplicatePolicyDecision = existingContext
      ? { outcome: 'UPDATE_EXISTING', selectedPolicyReference }
      : { outcome: 'CREATE_NEW' };
    const lineage = existingContext
      ? { previousPolicyVersionReference: existingContext.version.policy_version_reference }
      : {};
    const composition = composeCartera020cConfirmedPolicyPlan({
      readModel,
      identityBatch,
      identityVerification: verification,
      policyRoleDecisions,
      duplicatePolicyDecision,
      fieldDecisions,
      policyInput,
      evidenceReview: {
        verificationState: 'REVIEWED',
        observedAt: readModel.source.receivedAt,
      },
      lineage,
      confirmedAt,
    });
    let policyStatus = await orchestration.attachPolicy({
      composition,
      idempotencyKey: await idempotency('POLICY', composition.confirmationPlan.confirmedPolicyCommand),
      requestedAt: confirmedAt,
    });
    if (policyStatus.state !== 'CONFIRMED') {
      policyStatus = await orchestration.runPolicy({
        reviewReference: readModel.review.reviewReference,
        expectedStateVersion: policyStatus.stateVersion,
      });
    }
    if (policyStatus.state !== 'CONFIRMED' || !policyStatus.policyResult?.policyReference) {
      throw fail(`CARTERA020C_POLICY_${policyStatus.state || 'NOT_CONFIRMED'}`);
    }
    return Object.freeze({
      status: 'CONFIRMED',
      replayed: policyStatus.policyResult?.replayed === true,
      reviewReference: readModel.review.reviewReference,
      packetReference: readModel.review.packetReference,
      policyReference: policyStatus.policyResult.policyReference,
      policyVersionReference: policyStatus.policyResult.policyVersionReference,
      evidenceVersionReference: policyStatus.policyResult.evidenceVersionReference,
      receipt: policyStatus.policyResult,
    });
  }

  return Object.freeze({ loadReview, confirmReview });
}

export const CARTERA_REVIEW_CONFIRMATION_002 = Object.freeze({
  authority: 'CARTERA-020C',
  canonicalWriter: 'CARTERA-010B',
  createsNewAuthority: false,
  requiresExplicitHumanAction: true,
  automaticConfirmationFromConfidence: false,
});
