import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import {
  CARTERA_020C_REVIEW_STATES,
  CARTERA_020C_IDENTITY_OUTCOMES,
  CARTERA_020C_POLICY_DECISIONS,
  createIdentityPolicyConfirmationReview,
  prepareIdentityPolicyConfirmationPlan,
  generalPolicyRoleReviewProjection,
} from '../policy-operations/intake/cartera-020c-confirmation-review-contracts.js';

const advisorId = '11111111-1111-4111-8111-111111111111';

function packet(overrides = {}) {
  return {
    packetReference: 'packet/020c/1',
    documentReference: 'evidence/source/020c/1',
    confirmationState: 'pending_confirmation',
    createsTruth: false,
    canInvokeConfirmedPolicyCommand: false,
    extractedFields: {
      premiumAmount: { state: 'UNKNOWN', value: null },
      currency: { state: 'UNKNOWN', value: null },
    },
    ...overrides,
  };
}

function identityCandidate(overrides = {}) {
  return {
    candidateReference: 'identity/candidate/1',
    candidateType: 'EXISTING_PERSON_OR_NEW_PERSON',
    createsTruth: false,
    ...overrides,
  };
}

function roleCandidate(overrides = {}) {
  return {
    candidateReference: 'role/candidate/owner',
    roleType: 'OWNER',
    participantState: 'UNRESOLVED',
    visibilityScope: 'POLICY_TEAM',
    createsTruth: false,
    ...overrides,
  };
}

function readyReview(overrides = {}) {
  return createIdentityPolicyConfirmationReview({
    reviewReference: 'review/020c/1',
    advisorId,
    actorReference: advisorId,
    packet: packet(),
    identityCandidates: [identityCandidate()],
    policyRoleCandidates: [roleCandidate()],
    ...overrides,
  });
}

test('pending non-truth packet creates an explicit advisor review', () => {
  const review = readyReview();

  assert.equal(review.contractType, 'FORGE_IDENTITY_POLICY_CONFIRMATION_REVIEW');
  assert.equal(review.contractVersion, 'CARTERA-020C.1');
  assert.equal(review.state, CARTERA_020C_REVIEW_STATES.PENDING_REVIEW);
  assert.equal(review.createsTruth, false);
  assert.equal(review.invokesRemoteCommand, false);
  assert.equal(review.canInvokeConfirmedPolicyCommand, false);
  assert.deepEqual(review.blockers, []);
});

test('only pending packets with the 020B non-truth boundary enter review', () => {
  assert.throws(
    () => readyReview({ packet: packet({ confirmationState: 'confirmed' }) }),
    /packet_not_pending_confirmation/
  );
  assert.throws(
    () => readyReview({ packet: packet({ createsTruth: true }) }),
    /packet_truth_boundary_invalid/
  );
  assert.throws(
    () => readyReview({ packet: packet({ canInvokeConfirmedPolicyCommand: true }) }),
    /packet_truth_boundary_invalid/
  );
});

test('review is owner bound and rejects candidate truth claims', () => {
  assert.throws(
    () => readyReview({ actorReference: '22222222-2222-4222-8222-222222222222' }),
    /review_owner_mismatch/
  );
  assert.throws(
    () => readyReview({ identityCandidates: [identityCandidate({ createsTruth: true })] }),
    /invalid_identity_candidate/
  );
});

test('missing evidence, confidence and sensitive fields remain blockers', () => {
  const review = readyReview({
    missingEvidence: ['complete_policy_schedule'],
    lowConfidenceFields: ['policyNumber'],
    sensitiveFields: ['beneficiaryName'],
  });

  assert.equal(review.state, CARTERA_020C_REVIEW_STATES.BLOCKED);
  assert.deepEqual(review.blockers, [
    'MISSING_EVIDENCE',
    'LOW_CONFIDENCE_FIELDS',
    'SENSITIVE_FIELDS_REQUIRE_REVIEW',
  ]);
  assert.throws(
    () => prepareIdentityPolicyConfirmationPlan({ review }),
    /review_blocked/
  );
});

test('beneficiary candidates require restricted visibility', () => {
  assert.throws(
    () => readyReview({
      policyRoleCandidates: [roleCandidate({ roleType: 'BENEFICIARY' })],
    }),
    /restricted_role_visibility_required/
  );

  const review = readyReview({
    policyRoleCandidates: [
      roleCandidate(),
      roleCandidate({
        candidateReference: 'role/candidate/beneficiary',
        roleType: 'BENEFICIARY',
        visibilityScope: 'RESTRICTED',
      }),
    ],
  });

  assert.deepEqual(generalPolicyRoleReviewProjection(review), [{
    candidateReference: 'role/candidate/owner',
    roleType: 'OWNER',
    participantState: 'UNRESOLVED',
  }]);
});

test('every identity and PolicyRole candidate requires an explicit decision', () => {
  const review = readyReview();
  const confirmedPolicyCommand = {
    contractType: 'FORGE_CONFIRMED_POLICY_COMMAND',
    contractVersion: 'CARTERA-010B.1',
    advisorId,
    actorReference: advisorId,
  };

  assert.throws(
    () => prepareIdentityPolicyConfirmationPlan({
      review,
      identityDecisions: [],
      policyRoleDecisions: [],
      duplicatePolicyDecision: { outcome: CARTERA_020C_POLICY_DECISIONS.CREATE_NEW },
      confirmedPolicyCommand,
    }),
    /identity_decisions_incomplete/
  );

  assert.throws(
    () => prepareIdentityPolicyConfirmationPlan({
      review,
      identityDecisions: [{
        candidateReference: 'identity/candidate/1',
        outcome: CARTERA_020C_IDENTITY_OUTCOMES.LINK_CONFIRMED,
        command: { contractType: 'FORGE_IDENTITY_RESOLUTION_COMMAND' },
      }],
      policyRoleDecisions: [],
      duplicatePolicyDecision: { outcome: CARTERA_020C_POLICY_DECISIONS.CREATE_NEW },
      confirmedPolicyCommand,
    }),
    /policy_role_decisions_incomplete/
  );
});

test('unresolved identity and duplicate decisions cannot advance', () => {
  const review = readyReview();
  const base = {
    review,
    policyRoleDecisions: [{
      candidateReference: 'role/candidate/owner',
      confirmationState: 'CONFIRMED',
      visibilityScope: 'POLICY_TEAM',
    }],
    confirmedPolicyCommand: {
      contractType: 'FORGE_CONFIRMED_POLICY_COMMAND',
      advisorId,
      actorReference: advisorId,
    },
  };

  assert.throws(
    () => prepareIdentityPolicyConfirmationPlan({
      ...base,
      identityDecisions: [{
        candidateReference: 'identity/candidate/1',
        outcome: CARTERA_020C_IDENTITY_OUTCOMES.UNRESOLVED,
        command: { contractType: 'FORGE_IDENTITY_RESOLUTION_COMMAND' },
      }],
      duplicatePolicyDecision: { outcome: CARTERA_020C_POLICY_DECISIONS.CREATE_NEW },
    }),
    /identity_decision_not_resolved/
  );

  assert.throws(
    () => prepareIdentityPolicyConfirmationPlan({
      ...base,
      identityDecisions: [{
        candidateReference: 'identity/candidate/1',
        outcome: CARTERA_020C_IDENTITY_OUTCOMES.LINK_CONFIRMED,
        command: { contractType: 'FORGE_IDENTITY_RESOLUTION_COMMAND' },
      }],
      duplicatePolicyDecision: { outcome: CARTERA_020C_POLICY_DECISIONS.UNRESOLVED },
    }),
    /duplicate_policy_unresolved/
  );
});

test('confirmation plan orders identity before Policy and executes nothing', () => {
  const review = readyReview();
  const plan = prepareIdentityPolicyConfirmationPlan({
    review,
    identityDecisions: [{
      candidateReference: 'identity/candidate/1',
      outcome: CARTERA_020C_IDENTITY_OUTCOMES.LINK_CONFIRMED,
      command: {
        contractType: 'FORGE_IDENTITY_RESOLUTION_COMMAND',
        contractVersion: 'CARTERA-010B.1',
        advisorId,
        actorReference: advisorId,
      },
    }],
    policyRoleDecisions: [{
      candidateReference: 'role/candidate/owner',
      confirmationState: 'CONFIRMED',
      visibilityScope: 'POLICY_TEAM',
    }],
    duplicatePolicyDecision: {
      outcome: CARTERA_020C_POLICY_DECISIONS.CREATE_NEW,
    },
    confirmedPolicyCommand: {
      contractType: 'FORGE_CONFIRMED_POLICY_COMMAND',
      contractVersion: 'CARTERA-010B.1',
      advisorId,
      actorReference: advisorId,
    },
  });

  assert.equal(plan.state, CARTERA_020C_REVIEW_STATES.READY_TO_CONFIRM);
  assert.deepEqual(plan.invocationOrder, ['IDENTITY_RESOLUTION', 'CONFIRMED_POLICY']);
  assert.equal(plan.createsTruth, false);
  assert.equal(plan.invokesRemoteCommand, false);
  assert.equal(plan.requiresExplicitExecution, true);
});

test('restricted PolicyRole confirmation remains restricted', () => {
  const review = readyReview({
    policyRoleCandidates: [roleCandidate({
      candidateReference: 'role/candidate/beneficiary',
      roleType: 'BENEFICIARY',
      visibilityScope: 'RESTRICTED',
    })],
  });

  assert.throws(
    () => prepareIdentityPolicyConfirmationPlan({
      review,
      identityDecisions: [{
        candidateReference: 'identity/candidate/1',
        outcome: CARTERA_020C_IDENTITY_OUTCOMES.LINK_CONFIRMED,
        command: { contractType: 'FORGE_IDENTITY_RESOLUTION_COMMAND' },
      }],
      policyRoleDecisions: [{
        candidateReference: 'role/candidate/beneficiary',
        confirmationState: 'CONFIRMED',
        visibilityScope: 'POLICY_TEAM',
      }],
      duplicatePolicyDecision: { outcome: CARTERA_020C_POLICY_DECISIONS.CREATE_NEW },
      confirmedPolicyCommand: {
        contractType: 'FORGE_CONFIRMED_POLICY_COMMAND',
        advisorId,
        actorReference: advisorId,
      },
    }),
    /restricted_role_confirmation_invalid/
  );
});

test('first cut has no RPC execution, UI mutation or unknown-value defaults', () => {
  const contract = readFileSync(
    new URL('../policy-operations/intake/cartera-020c-confirmation-review-contracts.js', import.meta.url),
    'utf8'
  );
  const scope = readFileSync(
    new URL('../docs/architecture/source-truth/FORGE_CARTERA_020C_IDENTITY_POLICY_CONFIRMATION_REVIEW_SCOPE_001.md', import.meta.url),
    'utf8'
  );

  assert.doesNotMatch(contract, /\.rpc\s*\(/);
  assert.doesNotMatch(contract, /supabase/i);
  assert.doesNotMatch(contract, /premiumAmount\s*:\s*0/);
  assert.doesNotMatch(contract, /currency\s*:\s*['"]MXN['"]/);
  assert.doesNotMatch(contract, /status\s*:\s*['"]ACTIVE['"]/);
  assert.match(scope, /SUPABASE_REMOTE_MUTATION=NO/);
  assert.match(scope, /PRODUCT_UI_MUTATION=NO_FIRST_CUT/);
  assert.match(scope, /IDENTITY_BEFORE_POLICY_ORDER=LOCKED/);
  assert.match(scope, /GENERAL_DIRECTORY_PROJECTION=FORBIDDEN/);
  assert.match(scope, /NEXT=CARTERA_020C_REVIEW_READ_MODEL_AND_CANDIDATE_RECONCILIATION/);
});
