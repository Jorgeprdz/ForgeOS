// CARTERA 020C governed command composer.
// Pure deterministic preparation only: this module never executes Supabase RPCs.

import '../../platform/shared-commercial-model/cartera-010b-contract-validator.js';
import {
  CARTERA_020C_IDENTITY_OUTCOMES,
  CARTERA_020C_POLICY_DECISIONS,
  prepareIdentityPolicyConfirmationPlan,
} from './cartera-020c-confirmation-review-contracts.js';

const Cartera010BValidator = globalThis.ForgeCartera010BContractValidator;
if (!Cartera010BValidator?.buildIdentityResolutionCommand
    || !Cartera010BValidator?.buildConfirmedPolicyCommand
    || !Cartera010BValidator?.stableDigest) {
  throw new TypeError('CARTERA010B_VALIDATOR_UNAVAILABLE');
}
const {
  buildIdentityResolutionCommand,
  buildConfirmedPolicyCommand,
  stableDigest,
} = Cartera010BValidator;

export const CARTERA_020C_ACCOUNT_OUTCOMES = Object.freeze({
  LINK_CONFIRMED: 'LINK_CONFIRMED',
  NOT_APPLICABLE: 'NOT_APPLICABLE',
});

export const CARTERA_020C_FIELD_DECISIONS = Object.freeze({
  ACCEPT: 'ACCEPT',
  EDIT: 'EDIT',
  UNKNOWN: 'UNKNOWN',
});

const RESOLVED_IDENTITY_OUTCOMES = new Set([
  CARTERA_020C_IDENTITY_OUTCOMES.LINK_CONFIRMED,
  CARTERA_020C_IDENTITY_OUTCOMES.CREATE_CONFIRMED,
  CARTERA_020C_IDENTITY_OUTCOMES.CORRECTED,
]);
const SUCCESSFUL_IDENTITY_STATUSES = new Set(['CONFIRMED', 'ALREADY_LINKED']);
const ROLE_TYPE_ALIASES = Object.freeze({
  OWNER: 'POLICY_OWNER',
  POLICY_OWNER: 'POLICY_OWNER',
  INSURED: 'INSURED',
  ADDITIONAL_INSURED: 'ADDITIONAL_INSURED',
  PAYOR: 'PAYOR',
  BENEFICIARY: 'BENEFICIARY',
  ADVISOR_OF_RECORD: 'ADVISOR_OF_RECORD',
  ORIGINATING_ADVISOR: 'ORIGINATING_ADVISOR',
  SERVICING_ADVISOR: 'SERVICING_ADVISOR',
});
const REFERENCE_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,239}$/;
const IDEMPOTENCY_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,159}$/;
const DIGEST_PATTERN = /^[a-f0-9]{64}$/;

function isRecord(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function requireRecord(value, code) {
  if (!isRecord(value)) throw new TypeError(code);
  return value;
}

function requireArray(value, code) {
  if (!Array.isArray(value)) throw new TypeError(code);
  return value;
}

function requireReference(value, code) {
  if (typeof value !== 'string' || !REFERENCE_PATTERN.test(value)) throw new TypeError(code);
  return value;
}

function requireIso(value, code) {
  if (typeof value !== 'string' || Number.isNaN(Date.parse(value))) throw new TypeError(code);
  return new Date(value).toISOString();
}

function optionalIso(value, code) {
  if (value === null || value === undefined || value === '') return null;
  return requireIso(value, code);
}

function freeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.freeze(value);
  Object.values(value).forEach(freeze);
  return value;
}

function exactCount(decisions, candidates, code) {
  requireArray(decisions, code);
  if (decisions.length !== candidates.length) throw new TypeError(code);
}

function candidateByReference(candidates, reference, code) {
  const candidate = candidates.find((item) => item.candidateReference === reference);
  if (!candidate) throw new TypeError(code);
  return candidate;
}

function deterministicKey(scope, payload) {
  const key = `C020C:${scope}:${stableDigest(payload).slice(0, 48)}`;
  if (!IDEMPOTENCY_PATTERN.test(key)) throw new TypeError('CARTERA020C_IDEMPOTENCY_KEY_INVALID');
  return key;
}

function ensureReviewReadModel(readModel) {
  requireRecord(readModel, 'CARTERA020C_REVIEW_READ_MODEL_REQUIRED');
  if (readModel.contractType !== 'FORGE_CARTERA_020C_REVIEW_READ_MODEL') {
    throw new TypeError('CARTERA020C_REVIEW_READ_MODEL_INVALID');
  }
  requireRecord(readModel.review, 'CARTERA020C_REVIEW_REQUIRED');
  if (readModel.review.createsTruth !== false || readModel.createsTruth !== false) {
    throw new TypeError('CARTERA020C_REVIEW_TRUTH_BOUNDARY_INVALID');
  }
  if (readModel.review.blockers.length > 0 || readModel.state === 'BLOCKED') {
    throw new TypeError('CARTERA020C_REVIEW_BLOCKED');
  }
  if (readModel.invokesRemoteCommand !== false || readModel.canInvokeConfirmedPolicyCommand !== false) {
    throw new TypeError('CARTERA020C_REVIEW_EXECUTION_BOUNDARY_INVALID');
  }
  return readModel;
}

function personMatchReferences(candidate) {
  return (candidate.existingPersonMatches || []).map((match) => match.personReference);
}

function accountMatchReferences(candidate) {
  return (candidate.existingAccountMatches || []).map((match) => match.accountReference);
}

function expectedPersonReference(decision) {
  if (decision.existingPersonReference) return decision.existingPersonReference;
  if (decision.newPerson?.personReference) return decision.newPerson.personReference;
  return null;
}

function validateIdentityDecision(candidate, decision) {
  requireRecord(decision, 'CARTERA020C_IDENTITY_DECISION_REQUIRED');
  if (decision.candidateReference !== candidate.candidateReference) {
    throw new TypeError('CARTERA020C_IDENTITY_DECISION_CANDIDATE_MISMATCH');
  }
  if (!RESOLVED_IDENTITY_OUTCOMES.has(decision.outcome)) {
    throw new TypeError('CARTERA020C_IDENTITY_DECISION_NOT_RESOLVED');
  }
  const matches = new Set(personMatchReferences(candidate));
  if (decision.existingPersonReference && !matches.has(decision.existingPersonReference)) {
    throw new TypeError('CARTERA020C_SELECTED_PERSON_NOT_RECONCILED');
  }
  if (decision.outcome === CARTERA_020C_IDENTITY_OUTCOMES.LINK_CONFIRMED
      && (!decision.existingPersonReference || decision.newPerson)) {
    throw new TypeError('CARTERA020C_LINK_PERSON_DECISION_INVALID');
  }
  if (decision.outcome === CARTERA_020C_IDENTITY_OUTCOMES.CREATE_CONFIRMED
      && (!isRecord(decision.newPerson) || decision.existingPersonReference)) {
    throw new TypeError('CARTERA020C_CREATE_PERSON_DECISION_INVALID');
  }
  if (decision.outcome === CARTERA_020C_IDENTITY_OUTCOMES.CORRECTED) {
    const existing = Boolean(decision.existingPersonReference);
    const created = isRecord(decision.newPerson);
    if (existing === created) throw new TypeError('CARTERA020C_CORRECT_PERSON_DECISION_INVALID');
  }
  requireReference(decision.reasonCode, 'CARTERA020C_IDENTITY_REASON_REQUIRED');
}

function composeAccountDecisions(readModel, accountDecisions) {
  const candidates = readModel.accountCandidates || [];
  exactCount(accountDecisions, candidates, 'CARTERA020C_ACCOUNT_DECISIONS_INCOMPLETE');
  const resolved = [];

  for (const decision of accountDecisions) {
    requireRecord(decision, 'CARTERA020C_ACCOUNT_DECISION_REQUIRED');
    const candidate = candidateByReference(
      candidates,
      decision.candidateReference,
      'CARTERA020C_ACCOUNT_DECISION_CANDIDATE_MISMATCH'
    );
    if (!Object.values(CARTERA_020C_ACCOUNT_OUTCOMES).includes(decision.outcome)) {
      throw new TypeError('CARTERA020C_ACCOUNT_DECISION_INVALID');
    }
    if (decision.outcome === CARTERA_020C_ACCOUNT_OUTCOMES.NOT_APPLICABLE) {
      if (candidate.required) throw new TypeError('CARTERA020C_REQUIRED_ACCOUNT_UNRESOLVED');
      resolved.push(freeze({
        candidateReference: candidate.candidateReference,
        outcome: decision.outcome,
        existingAccountReference: null,
        createsTruth: false,
      }));
      continue;
    }

    const accountReference = requireReference(
      decision.existingAccountReference,
      'CARTERA020C_EXISTING_ACCOUNT_REQUIRED'
    );
    if (!accountMatchReferences(candidate).includes(accountReference)) {
      throw new TypeError('CARTERA020C_SELECTED_ACCOUNT_NOT_RECONCILED');
    }
    if (decision.newAccount) throw new TypeError('CARTERA020C_ACCOUNT_CREATION_NOT_AUTHORIZED');
    resolved.push(freeze({
      candidateReference: candidate.candidateReference,
      outcome: decision.outcome,
      existingAccountReference: accountReference,
      createsTruth: false,
    }));
  }

  return freeze(resolved);
}

export function composeCartera020cIdentityCommandBatch({
  readModel,
  identityDecisions = [],
  accountDecisions = [],
  decidedAt,
} = {}) {
  const model = ensureReviewReadModel(readModel);
  const review = model.review;
  const timestamp = requireIso(decidedAt, 'CARTERA020C_IDENTITY_DECIDED_AT_REQUIRED');
  const candidates = model.identityCandidates || [];
  exactCount(identityDecisions, candidates, 'CARTERA020C_IDENTITY_DECISIONS_INCOMPLETE');

  const composed = [];
  for (const decision of identityDecisions) {
    const candidate = candidateByReference(
      candidates,
      decision.candidateReference,
      'CARTERA020C_IDENTITY_DECISION_CANDIDATE_MISMATCH'
    );
    validateIdentityDecision(candidate, decision);
    const command = buildIdentityResolutionCommand({
      advisorId: review.advisorId,
      actorReference: review.actorReference,
      idempotencyKey: deterministicKey('IDENTITY', {
        reviewReference: review.reviewReference,
        packetReference: review.packetReference,
        candidateReference: candidate.candidateReference,
        outcome: decision.outcome,
        existingPersonReference: decision.existingPersonReference || null,
        newPersonReference: decision.newPerson?.personReference || null,
        decidedAt: timestamp,
      }),
      decidedAt: timestamp,
      outcome: decision.outcome,
      sourceIdentity: {
        sourceDomain: 'CARTERA_EVIDENCE',
        sourceIdentityType: 'POLICY_PACKET_IDENTITY_CANDIDATE',
        sourceRecordReference: candidate.candidateReference,
        prospectReference: null,
      },
      existingPersonReference: decision.existingPersonReference || null,
      newPerson: decision.newPerson || null,
      candidatePersonReferences: personMatchReferences(candidate),
      evidenceReferences: [review.sourceReference],
      reasonCode: decision.reasonCode,
    });
    composed.push(freeze({
      candidateReference: candidate.candidateReference,
      outcome: decision.outcome,
      expectedPersonReference: requireReference(
        expectedPersonReference(decision),
        'CARTERA020C_EXPECTED_PERSON_REFERENCE_REQUIRED'
      ),
      command,
    }));
  }

  const resolvedAccounts = composeAccountDecisions(model, accountDecisions);
  return freeze({
    contractType: 'FORGE_CARTERA_020C_IDENTITY_COMMAND_BATCH',
    contractVersion: 'CARTERA-020C.2',
    reviewReference: review.reviewReference,
    packetReference: review.packetReference,
    advisorId: review.advisorId,
    actorReference: review.actorReference,
    commands: composed,
    accountDecisions: resolvedAccounts,
    invocationOrder: ['IDENTITY_RESOLUTION'],
    createsTruth: false,
    invokesRemoteCommand: false,
    requiresExplicitExecution: true,
  });
}

export function verifyCartera020cIdentityCommandResults({ batch, results = [] } = {}) {
  requireRecord(batch, 'CARTERA020C_IDENTITY_BATCH_REQUIRED');
  if (batch.contractType !== 'FORGE_CARTERA_020C_IDENTITY_COMMAND_BATCH') {
    throw new TypeError('CARTERA020C_IDENTITY_BATCH_INVALID');
  }
  exactCount(results, batch.commands, 'CARTERA020C_IDENTITY_RESULTS_INCOMPLETE');
  const resolved = [];

  for (const result of results) {
    requireRecord(result, 'CARTERA020C_IDENTITY_RESULT_REQUIRED');
    const item = candidateByReference(
      batch.commands,
      result.candidateReference,
      'CARTERA020C_IDENTITY_RESULT_CANDIDATE_MISMATCH'
    );
    const receipt = requireRecord(result.receipt, 'CARTERA020C_IDENTITY_RECEIPT_REQUIRED');
    if (!SUCCESSFUL_IDENTITY_STATUSES.has(receipt.status)) {
      throw new TypeError('CARTERA020C_IDENTITY_RESULT_NOT_CONFIRMED');
    }
    if (receipt.idempotencyKey !== item.command.idempotencyKey) {
      throw new TypeError('CARTERA020C_IDENTITY_RECEIPT_IDEMPOTENCY_MISMATCH');
    }
    if (receipt.personReference !== item.expectedPersonReference) {
      throw new TypeError('CARTERA020C_IDENTITY_RECEIPT_PERSON_MISMATCH');
    }
    if (!DIGEST_PATTERN.test(receipt.serverCommandDigest || '')) {
      throw new TypeError('CARTERA020C_IDENTITY_RECEIPT_DIGEST_INVALID');
    }
    if (receipt.status === 'CONFIRMED' && receipt.outcome !== item.outcome) {
      throw new TypeError('CARTERA020C_IDENTITY_RECEIPT_OUTCOME_MISMATCH');
    }
    resolved.push(freeze({
      candidateReference: item.candidateReference,
      personReference: receipt.personReference,
      status: receipt.status,
      outcome: receipt.outcome || item.outcome,
      decisionReference: receipt.decisionReference || null,
      linkReference: receipt.linkReference || null,
      idempotencyKey: receipt.idempotencyKey,
      serverCommandDigest: receipt.serverCommandDigest,
      replayed: receipt.replayed === true,
    }));
  }

  return freeze({
    contractType: 'FORGE_CARTERA_020C_IDENTITY_RESULT_VERIFICATION',
    contractVersion: 'CARTERA-020C.2',
    reviewReference: batch.reviewReference,
    packetReference: batch.packetReference,
    advisorId: batch.advisorId,
    actorReference: batch.actorReference,
    resolvedPeople: resolved,
    resolvedAccounts: batch.accountDecisions,
    allRequiredParticipantsResolved: true,
    createsTruth: false,
    invokesRemoteCommand: false,
  });
}

function composeFieldClaims(readModel, fieldDecisions, evidenceReference, advisorId, confirmedAt) {
  const fields = readModel.fields || [];
  exactCount(fieldDecisions, fields, 'CARTERA020C_FIELD_DECISIONS_INCOMPLETE');
  const claims = {};

  for (const decision of fieldDecisions) {
    requireRecord(decision, 'CARTERA020C_FIELD_DECISION_REQUIRED');
    const field = fields.find((candidate) => candidate.fieldName === decision.fieldName);
    if (!field) throw new TypeError('CARTERA020C_FIELD_DECISION_CANDIDATE_MISMATCH');
    if (!Object.values(CARTERA_020C_FIELD_DECISIONS).includes(decision.decision)) {
      throw new TypeError('CARTERA020C_FIELD_DECISION_INVALID');
    }
    const reviewedAt = requireIso(decision.reviewedAt, 'CARTERA020C_FIELD_REVIEWED_AT_REQUIRED');
    if (Date.parse(reviewedAt) > Date.parse(confirmedAt)) {
      throw new TypeError('CARTERA020C_FIELD_REVIEW_AFTER_CONFIRMATION');
    }
    if (decision.reviewerReference !== advisorId) {
      throw new TypeError('CARTERA020C_FIELD_REVIEWER_OWNER_MISMATCH');
    }
    let confirmedValue = null;
    if (decision.decision === CARTERA_020C_FIELD_DECISIONS.ACCEPT) confirmedValue = field.value;
    if (decision.decision === CARTERA_020C_FIELD_DECISIONS.EDIT) {
      if (!Object.hasOwn(decision, 'value')) throw new TypeError('CARTERA020C_FIELD_EDIT_VALUE_REQUIRED');
      confirmedValue = decision.value;
    }
    claims[field.fieldName] = freeze({
      candidateValue: field.value,
      confirmedValue,
      decision: decision.decision,
      candidateState: field.candidateState,
      confidence: field.confidence,
      sourceLocation: field.sourceLocation,
      extractionMethod: field.extractionMethod,
      parserId: field.parserId,
      parserVersion: field.parserVersion,
      evidenceReference,
      reviewedBy: decision.reviewerReference,
      reviewedAt,
    });
  }

  return freeze(claims);
}

function roleType(value) {
  const normalized = ROLE_TYPE_ALIASES[String(value || '').toUpperCase()];
  if (!normalized) throw new TypeError('CARTERA020C_POLICY_ROLE_TYPE_INVALID');
  return normalized;
}

function resolvedPerson(verification, candidateReference) {
  return verification.resolvedPeople.find((item) => item.candidateReference === candidateReference) || null;
}

function resolvedAccount(verification, candidateReference) {
  return verification.resolvedAccounts.find((item) => item.candidateReference === candidateReference) || null;
}

function composePolicyRoles({
  readModel,
  verification,
  roleDecisions,
  policyReference,
  evidenceReference,
  confirmedAt,
}) {
  const candidates = readModel.review.policyRoleCandidates || [];
  exactCount(roleDecisions, candidates, 'CARTERA020C_POLICY_ROLE_DECISIONS_INCOMPLETE');
  const roles = [];

  for (const decision of roleDecisions) {
    requireRecord(decision, 'CARTERA020C_POLICY_ROLE_DECISION_REQUIRED');
    const candidate = candidateByReference(
      candidates,
      decision.candidateReference,
      'CARTERA020C_POLICY_ROLE_DECISION_CANDIDATE_MISMATCH'
    );
    if (decision.confirmationState !== 'CONFIRMED') {
      throw new TypeError('CARTERA020C_POLICY_ROLE_NOT_CONFIRMED');
    }
    const normalizedRoleType = roleType(candidate.roleType);
    const restricted = candidate.restricted || normalizedRoleType === 'BENEFICIARY';
    const visibilityScope = decision.visibilityScope === 'RESTRICTED'
      ? 'RESTRICTED_ROLE_VIEW'
      : decision.visibilityScope;
    if (restricted && visibilityScope !== 'RESTRICTED_ROLE_VIEW') {
      throw new TypeError('CARTERA020C_RESTRICTED_ROLE_VISIBILITY_REQUIRED');
    }
    if (!['POLICY_TEAM', 'OWNING_ADVISOR_ONLY', 'RESTRICTED_ROLE_VIEW'].includes(visibilityScope)) {
      throw new TypeError('CARTERA020C_POLICY_ROLE_VISIBILITY_INVALID');
    }
    if (!['PRIVATE', 'SENSITIVE', 'RESTRICTED'].includes(decision.privacyClassification)) {
      throw new TypeError('CARTERA020C_POLICY_ROLE_PRIVACY_INVALID');
    }

    let participantPersonReference = null;
    let participantAccountReference = null;
    if (decision.participantKind === 'PERSON') {
      const person = resolvedPerson(verification, decision.participantCandidateReference);
      if (!person) throw new TypeError('CARTERA020C_POLICY_ROLE_PERSON_UNRESOLVED');
      participantPersonReference = person.personReference;
    } else if (decision.participantKind === 'ACCOUNT') {
      const account = resolvedAccount(verification, decision.participantCandidateReference);
      if (!account || account.outcome !== CARTERA_020C_ACCOUNT_OUTCOMES.LINK_CONFIRMED) {
        throw new TypeError('CARTERA020C_POLICY_ROLE_ACCOUNT_UNRESOLVED');
      }
      participantAccountReference = account.existingAccountReference;
    } else {
      throw new TypeError('CARTERA020C_POLICY_ROLE_PARTICIPANT_KIND_INVALID');
    }

    const effectiveFrom = requireIso(decision.effectiveFrom, 'CARTERA020C_POLICY_ROLE_EFFECTIVE_FROM_REQUIRED');
    const effectiveTo = optionalIso(decision.effectiveTo, 'CARTERA020C_POLICY_ROLE_EFFECTIVE_TO_INVALID');
    if (effectiveTo && effectiveTo <= effectiveFrom) {
      throw new TypeError('CARTERA020C_POLICY_ROLE_EFFECTIVE_RANGE_INVALID');
    }
    if (!Number.isInteger(decision.version) || decision.version < 1) {
      throw new TypeError('CARTERA020C_POLICY_ROLE_VERSION_INVALID');
    }

    roles.push({
      contractType: 'FORGE_POLICY_ROLE',
      schemaVersion: '1.0.0',
      policyRoleReference: decision.policyRoleReference || `POLICY_ROLE:${stableDigest({
        reviewReference: readModel.review.reviewReference,
        policyReference,
        candidateReference: candidate.candidateReference,
        version: decision.version,
      }).slice(0, 40)}`,
      policyReference,
      advisorId: readModel.review.advisorId,
      participantPersonReference,
      participantAccountReference,
      roleType: normalizedRoleType,
      confirmationState: 'CONFIRMED',
      privacyClassification: decision.privacyClassification,
      visibilityScope,
      evidenceReferences: [evidenceReference],
      effectiveFrom,
      effectiveTo,
      createdAt: confirmedAt,
      createdBy: readModel.review.actorReference,
      version: decision.version,
      correctionOf: decision.correctionOf || null,
      archivedAt: null,
      archivedBy: null,
      archiveReason: null,
    });
  }

  return roles;
}

function validateDuplicatePolicyDecision(readModel, decision, policyInput, lineage) {
  requireRecord(decision, 'CARTERA020C_DUPLICATE_POLICY_DECISION_REQUIRED');
  if (decision.outcome === CARTERA_020C_POLICY_DECISIONS.UNRESOLVED) {
    throw new TypeError('CARTERA020C_DUPLICATE_POLICY_UNRESOLVED');
  }
  if (decision.outcome === CARTERA_020C_POLICY_DECISIONS.BLOCK_AS_DUPLICATE) {
    throw new TypeError('CARTERA020C_POLICY_BLOCKED_AS_DUPLICATE');
  }
  if (decision.outcome === CARTERA_020C_POLICY_DECISIONS.CREATE_NEW) {
    if (decision.selectedPolicyReference) throw new TypeError('CARTERA020C_CREATE_POLICY_SELECTION_INVALID');
    if (policyInput.currentVersion !== 1 || lineage?.previousPolicyVersionReference) {
      throw new TypeError('CARTERA020C_NEW_POLICY_VERSION_INVALID');
    }
    return;
  }
  if (decision.outcome !== CARTERA_020C_POLICY_DECISIONS.UPDATE_EXISTING) {
    throw new TypeError('CARTERA020C_DUPLICATE_POLICY_DECISION_INVALID');
  }
  const selectedReference = requireReference(
    decision.selectedPolicyReference,
    'CARTERA020C_EXISTING_POLICY_SELECTION_REQUIRED'
  );
  const candidate = (readModel.duplicatePolicyCandidates || []).find((item) =>
    (item.existingPolicyMatches || []).some((match) => match.policyReference === selectedReference)
  );
  if (!candidate || policyInput.policyReference !== selectedReference) {
    throw new TypeError('CARTERA020C_SELECTED_POLICY_NOT_RECONCILED');
  }
  if (!Number.isInteger(policyInput.currentVersion) || policyInput.currentVersion < 2) {
    throw new TypeError('CARTERA020C_POLICY_UPDATE_VERSION_INVALID');
  }
  requireReference(
    lineage?.previousPolicyVersionReference,
    'CARTERA020C_PREVIOUS_POLICY_VERSION_REQUIRED'
  );
}

function canonicalPolicy({ readModel, policyInput, evidenceReference }) {
  const review = readModel.review;
  requireRecord(policyInput, 'CARTERA020C_APPROVED_POLICY_REQUIRED');
  requireRecord(policyInput.status, 'CARTERA020C_APPROVED_POLICY_STATUS_REQUIRED');
  return {
    contractType: 'FORGE_CANONICAL_POLICY',
    schemaVersion: '2.0.0',
    policyReference: requireReference(policyInput.policyReference, 'CARTERA020C_POLICY_REFERENCE_REQUIRED'),
    advisorId: review.advisorId,
    carrierReference: requireReference(policyInput.carrierReference, 'CARTERA020C_POLICY_CARRIER_REQUIRED'),
    policyNumber: policyInput.policyNumber,
    productReference: requireReference(policyInput.productReference, 'CARTERA020C_POLICY_PRODUCT_REQUIRED'),
    issueDate: policyInput.issueDate ?? null,
    effectiveFrom: policyInput.effectiveFrom ?? null,
    effectiveTo: policyInput.effectiveTo ?? null,
    status: {
      value: policyInput.status.value,
      source: requireReference(policyInput.status.source, 'CARTERA020C_POLICY_STATUS_SOURCE_REQUIRED'),
      asOf: requireIso(policyInput.status.asOf, 'CARTERA020C_POLICY_STATUS_AS_OF_REQUIRED'),
    },
    currency: policyInput.currency ?? null,
    premiumAmount: policyInput.premiumAmount ?? null,
    paymentFrequency: policyInput.paymentFrequency ?? null,
    sumInsured: policyInput.sumInsured ?? null,
    completenessState: policyInput.completenessState,
    freshnessState: policyInput.freshnessState,
    conflictState: 'CLEAR',
    evidenceVersionReferences: [evidenceReference],
    currentVersion: policyInput.currentVersion,
    createdAt: requireIso(policyInput.createdAt, 'CARTERA020C_POLICY_CREATED_AT_REQUIRED'),
    createdBy: review.actorReference,
    updatedAt: requireIso(policyInput.updatedAt, 'CARTERA020C_POLICY_UPDATED_AT_REQUIRED'),
    archivedAt: null,
    archivedBy: null,
    archiveReason: null,
  };
}

export function composeCartera020cConfirmedPolicyPlan({
  readModel,
  identityBatch,
  identityVerification,
  policyRoleDecisions = [],
  duplicatePolicyDecision,
  fieldDecisions = [],
  policyInput,
  evidenceReview,
  lineage = {},
  confirmedAt,
} = {}) {
  const model = ensureReviewReadModel(readModel);
  requireRecord(identityBatch, 'CARTERA020C_IDENTITY_BATCH_REQUIRED');
  requireRecord(identityVerification, 'CARTERA020C_IDENTITY_VERIFICATION_REQUIRED');
  if (identityBatch.reviewReference !== model.review.reviewReference
      || identityVerification.reviewReference !== model.review.reviewReference
      || identityVerification.allRequiredParticipantsResolved !== true) {
    throw new TypeError('CARTERA020C_IDENTITY_VERIFICATION_SCOPE_MISMATCH');
  }
  const timestamp = requireIso(confirmedAt, 'CARTERA020C_POLICY_CONFIRMED_AT_REQUIRED');
  requireRecord(evidenceReview, 'CARTERA020C_EVIDENCE_REVIEW_REQUIRED');
  if (!['REVIEWED', 'CONFIRMED'].includes(evidenceReview.verificationState)) {
    throw new TypeError('CARTERA020C_EVIDENCE_NOT_CONFIRMED');
  }
  if (!DIGEST_PATTERN.test(model.source.documentDigest || '')) {
    throw new TypeError('CARTERA020C_SOURCE_DOCUMENT_DIGEST_INVALID');
  }

  const evidenceReference = `EVIDENCE_VERSION:${stableDigest({
    packetReference: model.review.packetReference,
    sourceReference: model.review.sourceReference,
    documentDigest: model.source.documentDigest,
  }).slice(0, 40)}`;
  const fieldClaims = composeFieldClaims(
    model,
    fieldDecisions,
    evidenceReference,
    model.review.advisorId,
    timestamp
  );
  const policy = canonicalPolicy({ readModel: model, policyInput, evidenceReference });
  validateDuplicatePolicyDecision(model, duplicatePolicyDecision, policy, lineage);
  const roles = composePolicyRoles({
    readModel: model,
    verification: identityVerification,
    roleDecisions: policyRoleDecisions,
    policyReference: policy.policyReference,
    evidenceReference,
    confirmedAt: timestamp,
  });
  const evidence = {
    evidenceVersionReference: evidenceReference,
    documentHash: model.source.documentDigest,
    sourceType: requireReference(
      evidenceReview.sourceType || 'CARTERA020B_POLICY_PACKET',
      'CARTERA020C_EVIDENCE_SOURCE_TYPE_INVALID'
    ),
    observedAt: requireIso(
      evidenceReview.observedAt || model.source.receivedAt,
      'CARTERA020C_EVIDENCE_OBSERVED_AT_REQUIRED'
    ),
    verificationState: evidenceReview.verificationState,
    fieldClaims,
    provenance: {
      reviewReference: model.review.reviewReference,
      packetReference: model.review.packetReference,
      sourceReference: model.review.sourceReference,
      confirmationBoundary: 'CARTERA-020C',
    },
  };
  const confirmedPolicyCommand = buildConfirmedPolicyCommand({
    advisorId: model.review.advisorId,
    actorReference: model.review.actorReference,
    idempotencyKey: deterministicKey('POLICY', {
      reviewReference: model.review.reviewReference,
      packetReference: model.review.packetReference,
      policyReference: policy.policyReference,
      currentVersion: policy.currentVersion,
      confirmedAt: timestamp,
    }),
    confirmedAt: timestamp,
    policy,
    roles,
    evidence,
    lineage,
  });

  const identityDecisions = identityBatch.commands.map((item) => ({
    candidateReference: item.candidateReference,
    outcome: item.outcome,
    command: item.command,
  }));
  const reviewLevelRoleDecisions = policyRoleDecisions.map((decision) => {
    const candidate = candidateByReference(
      model.review.policyRoleCandidates,
      decision.candidateReference,
      'CARTERA020C_POLICY_ROLE_DECISION_CANDIDATE_MISMATCH'
    );
    return {
      candidateReference: decision.candidateReference,
      confirmationState: 'CONFIRMED',
      visibilityScope: candidate.restricted ? 'RESTRICTED' : decision.visibilityScope,
    };
  });
  const confirmationPlan = prepareIdentityPolicyConfirmationPlan({
    review: model.review,
    identityDecisions,
    accountDecisions: identityBatch.accountDecisions,
    policyRoleDecisions: reviewLevelRoleDecisions,
    duplicatePolicyDecision,
    confirmedPolicyCommand,
    confirmedAt: timestamp,
  });

  return freeze({
    contractType: 'FORGE_CARTERA_020C_GOVERNED_COMMAND_COMPOSITION',
    contractVersion: 'CARTERA-020C.2',
    reviewReference: model.review.reviewReference,
    packetReference: model.review.packetReference,
    identityBatch,
    identityVerification,
    confirmationPlan,
    fieldClaims,
    evidenceReference,
    createsTruth: false,
    invokesRemoteCommand: false,
    requiresExplicitExecution: true,
  });
}
