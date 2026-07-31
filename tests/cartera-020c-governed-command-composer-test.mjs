import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import {
  CARTERA_020C_ACCOUNT_OUTCOMES,
  CARTERA_020C_FIELD_DECISIONS,
  composeCartera020cIdentityCommandBatch,
  verifyCartera020cIdentityCommandResults,
  composeCartera020cConfirmedPolicyPlan,
} from '../policy-operations/intake/cartera-020c-governed-command-composer.js';

const advisorId = '11111111-1111-4111-8111-111111111111';
const decidedAt = '2026-07-31T20:15:00.000Z';
const confirmedAt = '2026-07-31T20:20:00.000Z';

function readModel(overrides = {}) {
  const review = {
    contractType: 'FORGE_IDENTITY_POLICY_CONFIRMATION_REVIEW',
    contractVersion: 'CARTERA-020C.1',
    reviewReference: 'review/020c/command/1',
    advisorId,
    actorReference: advisorId,
    packetReference: 'packet/020c/command/1',
    sourceReference: 'evidence/source/020c/command/1',
    packetConfirmationState: 'pending_confirmation',
    identityCandidates: [{
      candidateReference: 'identity/candidate/1',
      candidateType: 'EXISTING_PERSON_OR_NEW_PERSON',
      state: 'UNRESOLVED',
      required: true,
      proposedLabel: 'Ana López',
      existingPersonMatches: [{
        personReference: 'person/ana-lopez',
        displayLabel: 'Ana López',
        matchReasons: ['NAME'],
      }],
      createsTruth: false,
    }],
    accountCandidates: [{
      candidateReference: 'account/candidate/1',
      candidateType: 'EXISTING_ACCOUNT',
      state: 'UNRESOLVED',
      required: true,
      proposedLabel: 'Familia López',
      existingAccountMatches: [{
        accountReference: 'account/familia-lopez',
        displayLabel: 'Familia López',
        matchReasons: ['LABEL'],
      }],
      createsTruth: false,
    }],
    policyRoleCandidates: [
      {
        candidateReference: 'role/candidate/owner',
        roleType: 'OWNER',
        participantState: 'UNRESOLVED',
        visibilityScope: 'POLICY_TEAM',
        restricted: false,
        createsTruth: false,
      },
      {
        candidateReference: 'role/candidate/beneficiary',
        roleType: 'BENEFICIARY',
        participantState: 'UNRESOLVED',
        visibilityScope: 'RESTRICTED',
        restricted: true,
        createsTruth: false,
      },
    ],
    duplicatePolicyCandidates: [],
    missingEvidence: [],
    lowConfidenceFields: [],
    sensitiveFields: [],
    blockers: [],
    state: 'PENDING_REVIEW',
    createdAt: '2026-07-31T20:10:00.000Z',
    createsTruth: false,
    invokesRemoteCommand: false,
    canInvokeConfirmedPolicyCommand: false,
  };

  return {
    contractType: 'FORGE_CARTERA_020C_REVIEW_READ_MODEL',
    contractVersion: 'CARTERA-020C.1',
    review,
    source: {
      sourceReference: review.sourceReference,
      originalFilename: 'policy.pdf',
      mimeType: 'application/pdf',
      documentDigest: 'a'.repeat(64),
      receivedAt: '2026-07-31T20:00:00.000Z',
    },
    fields: [
      {
        fieldName: 'policyNumber', value: 'VM-100', candidateState: 'KNOWN',
        confidence: 0.99, sourceLocation: { page: 1 }, extractionMethod: 'PDF_TEXT',
        parserId: 'SMNYL_VIDA_MUJER', parserVersion: '1', restricted: false, createsTruth: false,
      },
      {
        fieldName: 'premiumAmount', value: null, candidateState: 'UNKNOWN',
        confidence: null, sourceLocation: null, extractionMethod: 'PDF_TEXT',
        parserId: 'SMNYL_VIDA_MUJER', parserVersion: '1', restricted: false, createsTruth: false,
      },
      {
        fieldName: 'currency', value: null, candidateState: 'UNKNOWN',
        confidence: null, sourceLocation: null, extractionMethod: 'PDF_TEXT',
        parserId: 'SMNYL_VIDA_MUJER', parserVersion: '1', restricted: false, createsTruth: false,
      },
    ],
    restrictedFields: [],
    identityCandidates: review.identityCandidates,
    accountCandidates: review.accountCandidates,
    duplicatePolicyCandidates: review.duplicatePolicyCandidates,
    generalPolicyRoleCandidates: [review.policyRoleCandidates[0]],
    restrictedPolicyRoleCandidates: [review.policyRoleCandidates[1]],
    state: 'PENDING_REVIEW',
    blockers: [],
    createsTruth: false,
    invokesRemoteCommand: false,
    canInvokeConfirmedPolicyCommand: false,
    ...overrides,
  };
}

function identityDecisions() {
  return [{
    candidateReference: 'identity/candidate/1',
    outcome: 'LINK_CONFIRMED',
    existingPersonReference: 'person/ana-lopez',
    reasonCode: 'ADVISOR_CONFIRMED_MATCH',
  }];
}

function accountDecisions() {
  return [{
    candidateReference: 'account/candidate/1',
    outcome: CARTERA_020C_ACCOUNT_OUTCOMES.LINK_CONFIRMED,
    existingAccountReference: 'account/familia-lopez',
  }];
}

function composeIdentity(model = readModel()) {
  return composeCartera020cIdentityCommandBatch({
    readModel: model,
    identityDecisions: identityDecisions(),
    accountDecisions: accountDecisions(),
    decidedAt,
  });
}

function verifyIdentity(batch) {
  const item = batch.commands[0];
  return verifyCartera020cIdentityCommandResults({
    batch,
    results: [{
      candidateReference: item.candidateReference,
      receipt: {
        status: 'CONFIRMED',
        outcome: 'LINK_CONFIRMED',
        personReference: 'person/ana-lopez',
        decisionReference: 'IDENTITY_DECISION:abc',
        linkReference: 'IDENTITY_LINK:abc',
        idempotencyKey: item.command.idempotencyKey,
        serverCommandDigest: 'b'.repeat(64),
        replayed: false,
      },
    }],
  });
}

function policyInput(overrides = {}) {
  return {
    policyReference: 'policy/vm-100',
    carrierReference: 'carrier/smnyl',
    policyNumber: 'VM-100',
    productReference: 'product/vida-mujer',
    issueDate: '2026-07-30',
    effectiveFrom: '2026-08-01T00:00:00.000Z',
    effectiveTo: null,
    status: {
      value: 'ISSUED',
      source: 'evidence/source/020c/command/1',
      asOf: '2026-07-31T20:00:00.000Z',
    },
    currency: null,
    premiumAmount: null,
    paymentFrequency: null,
    sumInsured: null,
    completenessState: 'PARTIAL',
    freshnessState: 'CURRENT',
    currentVersion: 1,
    createdAt: confirmedAt,
    updatedAt: confirmedAt,
    ...overrides,
  };
}

function fieldDecisions() {
  return [
    {
      fieldName: 'policyNumber', decision: CARTERA_020C_FIELD_DECISIONS.ACCEPT,
      reviewerReference: advisorId, reviewedAt: confirmedAt,
    },
    {
      fieldName: 'premiumAmount', decision: CARTERA_020C_FIELD_DECISIONS.UNKNOWN,
      reviewerReference: advisorId, reviewedAt: confirmedAt,
    },
    {
      fieldName: 'currency', decision: CARTERA_020C_FIELD_DECISIONS.UNKNOWN,
      reviewerReference: advisorId, reviewedAt: confirmedAt,
    },
  ];
}

function roleDecisions() {
  return [
    {
      candidateReference: 'role/candidate/owner',
      confirmationState: 'CONFIRMED',
      participantKind: 'PERSON',
      participantCandidateReference: 'identity/candidate/1',
      visibilityScope: 'POLICY_TEAM',
      privacyClassification: 'PRIVATE',
      effectiveFrom: '2026-08-01T00:00:00.000Z',
      effectiveTo: null,
      version: 1,
    },
    {
      candidateReference: 'role/candidate/beneficiary',
      confirmationState: 'CONFIRMED',
      participantKind: 'PERSON',
      participantCandidateReference: 'identity/candidate/1',
      visibilityScope: 'RESTRICTED',
      privacyClassification: 'RESTRICTED',
      effectiveFrom: '2026-08-01T00:00:00.000Z',
      effectiveTo: null,
      version: 1,
    },
  ];
}

function composePolicy(model = readModel(), inputOverrides = {}) {
  const batch = composeIdentity(model);
  const verification = verifyIdentity(batch);
  return composeCartera020cConfirmedPolicyPlan({
    readModel: model,
    identityBatch: batch,
    identityVerification: verification,
    policyRoleDecisions: roleDecisions(),
    duplicatePolicyDecision: { outcome: 'CREATE_NEW' },
    fieldDecisions: fieldDecisions(),
    policyInput: policyInput(inputOverrides),
    evidenceReview: {
      verificationState: 'REVIEWED',
      observedAt: '2026-07-31T20:00:00.000Z',
    },
    lineage: {},
    confirmedAt,
  });
}

test('identity batch emits strict 010B commands and explicit Account links only', () => {
  const batch = composeIdentity();
  const item = batch.commands[0];

  assert.equal(batch.contractType, 'FORGE_CARTERA_020C_IDENTITY_COMMAND_BATCH');
  assert.equal(item.command.contractType, 'FORGE_IDENTITY_RESOLUTION_COMMAND');
  assert.equal(item.command.contractVersion, 'CARTERA-010B.1');
  assert.equal(item.command.sourceIdentity.sourceDomain, 'CARTERA_EVIDENCE');
  assert.equal(item.command.sourceIdentity.sourceRecordReference, 'identity/candidate/1');
  assert.deepEqual(item.command.evidenceReferences, ['evidence/source/020c/command/1']);
  assert.equal(batch.accountDecisions[0].existingAccountReference, 'account/familia-lopez');
  assert.equal(batch.createsTruth, false);
  assert.equal(batch.invokesRemoteCommand, false);
});

test('same reviewed inputs produce deterministic command identity', () => {
  const first = composeIdentity();
  const second = composeIdentity();
  assert.equal(first.commands[0].command.idempotencyKey, second.commands[0].command.idempotencyKey);
  assert.equal(first.commands[0].command.commandDigest, second.commands[0].command.commandDigest);
});

test('candidate reconciliation never silently selects another Person', () => {
  assert.throws(
    () => composeCartera020cIdentityCommandBatch({
      readModel: readModel(),
      identityDecisions: [{
        candidateReference: 'identity/candidate/1',
        outcome: 'LINK_CONFIRMED',
        existingPersonReference: 'person/not-reconciled',
        reasonCode: 'ADVISOR_CONFIRMED_MATCH',
      }],
      accountDecisions: accountDecisions(),
      decidedAt,
    }),
    /CARTERA020C_SELECTED_PERSON_NOT_RECONCILED/
  );
});

test('Account creation remains unauthorized and required Accounts cannot be skipped', () => {
  assert.throws(
    () => composeCartera020cIdentityCommandBatch({
      readModel: readModel(), identityDecisions: identityDecisions(), decidedAt,
      accountDecisions: [{
        candidateReference: 'account/candidate/1',
        outcome: 'LINK_CONFIRMED',
        existingAccountReference: 'account/familia-lopez',
        newAccount: { accountReference: 'account/new' },
      }],
    }),
    /CARTERA020C_ACCOUNT_CREATION_NOT_AUTHORIZED/
  );
  assert.throws(
    () => composeCartera020cIdentityCommandBatch({
      readModel: readModel(), identityDecisions: identityDecisions(), decidedAt,
      accountDecisions: [{
        candidateReference: 'account/candidate/1',
        outcome: 'NOT_APPLICABLE',
      }],
    }),
    /CARTERA020C_REQUIRED_ACCOUNT_UNRESOLVED/
  );
});

test('identity receipts must match command, participant and successful status', () => {
  const batch = composeIdentity();
  const item = batch.commands[0];
  assert.throws(
    () => verifyCartera020cIdentityCommandResults({
      batch,
      results: [{
        candidateReference: item.candidateReference,
        receipt: {
          status: 'CONFLICT',
          personReference: 'person/ana-lopez',
          idempotencyKey: item.command.idempotencyKey,
          serverCommandDigest: 'c'.repeat(64),
        },
      }],
    }),
    /CARTERA020C_IDENTITY_RESULT_NOT_CONFIRMED/
  );
  assert.throws(
    () => verifyCartera020cIdentityCommandResults({
      batch,
      results: [{
        candidateReference: item.candidateReference,
        receipt: {
          status: 'CONFIRMED', outcome: 'LINK_CONFIRMED',
          personReference: 'person/other',
          idempotencyKey: item.command.idempotencyKey,
          serverCommandDigest: 'c'.repeat(64),
        },
      }],
    }),
    /CARTERA020C_IDENTITY_RECEIPT_PERSON_MISMATCH/
  );
});

test('confirmed Policy command is composed only after verified Identity results', () => {
  const composition = composePolicy();
  const command = composition.confirmationPlan.confirmedPolicyCommand;

  assert.equal(composition.contractType, 'FORGE_CARTERA_020C_GOVERNED_COMMAND_COMPOSITION');
  assert.equal(command.contractType, 'FORGE_CONFIRMED_POLICY_COMMAND');
  assert.equal(command.contractVersion, 'CARTERA-010B.1');
  assert.deepEqual(composition.confirmationPlan.invocationOrder, ['IDENTITY_RESOLUTION', 'CONFIRMED_POLICY']);
  assert.equal(command.roles[0].roleType, 'POLICY_OWNER');
  assert.equal(command.roles[0].participantPersonReference, 'person/ana-lopez');
  assert.equal(command.roles[1].roleType, 'BENEFICIARY');
  assert.equal(command.roles[1].visibilityScope, 'RESTRICTED_ROLE_VIEW');
  assert.equal(composition.createsTruth, false);
  assert.equal(composition.invokesRemoteCommand, false);
});

test('forged or incomplete Identity verification cannot unlock Policy composition', () => {
  const model = readModel();
  const batch = composeIdentity(model);
  assert.throws(
    () => composeCartera020cConfirmedPolicyPlan({
      readModel: model,
      identityBatch: batch,
      identityVerification: {
        reviewReference: model.review.reviewReference,
        allRequiredParticipantsResolved: false,
      },
      policyRoleDecisions: roleDecisions(),
      duplicatePolicyDecision: { outcome: 'CREATE_NEW' },
      fieldDecisions: fieldDecisions(),
      policyInput: policyInput(),
      evidenceReview: { verificationState: 'REVIEWED' },
      confirmedAt,
    }),
    /CARTERA020C_IDENTITY_VERIFICATION_SCOPE_MISMATCH/
  );
});

test('unknown premium and currency remain null with explicit UNKNOWN field decisions', () => {
  const composition = composePolicy();
  const command = composition.confirmationPlan.confirmedPolicyCommand;
  assert.equal(command.policy.premiumAmount, null);
  assert.equal(command.policy.currency, null);
  assert.equal(command.policy.paymentFrequency, null);
  assert.equal(composition.fieldClaims.premiumAmount.confirmedValue, null);
  assert.equal(composition.fieldClaims.premiumAmount.decision, 'UNKNOWN');
  assert.equal(composition.fieldClaims.currency.confirmedValue, null);
});

test('UPDATE_EXISTING requires one reconciled Policy and explicit previous-version lineage', () => {
  const model = readModel();
  const duplicateCandidate = {
    candidateReference: 'policy/candidate/1',
    state: 'UNRESOLVED',
    existingPolicyMatches: [{
      policyReference: 'policy/existing',
      carrierReference: 'carrier/smnyl',
      policyNumber: 'VM-100',
      matchReasons: ['POLICY_NUMBER'],
    }],
    createsTruth: false,
  };
  model.review.duplicatePolicyCandidates = [duplicateCandidate];
  model.duplicatePolicyCandidates = [duplicateCandidate];
  const batch = composeIdentity(model);
  const verification = verifyIdentity(batch);

  assert.throws(
    () => composeCartera020cConfirmedPolicyPlan({
      readModel: model, identityBatch: batch, identityVerification: verification,
      policyRoleDecisions: roleDecisions(),
      duplicatePolicyDecision: { outcome: 'UPDATE_EXISTING', selectedPolicyReference: 'policy/existing' },
      fieldDecisions: fieldDecisions(),
      policyInput: policyInput({ policyReference: 'policy/existing', currentVersion: 2 }),
      evidenceReview: { verificationState: 'REVIEWED' },
      lineage: {},
      confirmedAt,
    }),
    /CARTERA020C_PREVIOUS_POLICY_VERSION_REQUIRED/
  );

  const composition = composeCartera020cConfirmedPolicyPlan({
    readModel: model, identityBatch: batch, identityVerification: verification,
    policyRoleDecisions: roleDecisions(),
    duplicatePolicyDecision: { outcome: 'UPDATE_EXISTING', selectedPolicyReference: 'policy/existing' },
    fieldDecisions: fieldDecisions(),
    policyInput: policyInput({ policyReference: 'policy/existing', currentVersion: 2 }),
    evidenceReview: { verificationState: 'REVIEWED' },
    lineage: { previousPolicyVersionReference: 'POLICY_VERSION:previous' },
    confirmedAt,
  });
  assert.equal(composition.confirmationPlan.confirmedPolicyCommand.policy.currentVersion, 2);
  assert.equal(
    composition.confirmationPlan.confirmedPolicyCommand.lineage.previousPolicyVersionReference,
    'POLICY_VERSION:previous'
  );
});

test('composer contains no RPC execution, Supabase client or direct canonical writes', () => {
  const source = readFileSync(
    new URL('../policy-operations/intake/cartera-020c-governed-command-composer.js', import.meta.url),
    'utf8'
  );
  assert.doesNotMatch(source, /\.rpc\s*\(/);
  assert.doesNotMatch(source, /SupabaseRuntime|createClient|from\(['"]/);
  assert.doesNotMatch(source, /\.insert\s*\(|\.update\s*\(|\.delete\s*\(/);
  assert.match(source, /IDENTITY_RESOLUTION/);
  assert.match(source, /buildConfirmedPolicyCommand/);
  assert.match(source, /CARTERA020C_ACCOUNT_CREATION_NOT_AUTHORIZED/);
});
