import test from 'node:test';
import assert from 'node:assert/strict';

import {
  partitionCartera020cIdentityCandidates,
  createCartera020cReviewReadModel,
} from '../platform/policy-intelligence/intake/cartera-020c-candidate-reconciliation.js';

const advisorId = '11111111-1111-4111-8111-111111111111';

test('020B identity array is partitioned into Person and Account candidate groups', () => {
  const groups = partitionCartera020cIdentityCandidates({
    identity_candidates: [
      { candidateReference: 'identity/person/1', candidateType: 'EXISTING_PERSON_OR_NEW_PERSON' },
      { candidateReference: 'identity/account/1', candidateType: 'EXISTING_ACCOUNT' },
    ],
  });

  assert.equal(groups.identityCandidates.length, 1);
  assert.equal(groups.accountCandidates.length, 1);
  assert.equal(groups.identityCandidates[0].candidateReference, 'identity/person/1');
  assert.equal(groups.accountCandidates[0].candidateReference, 'identity/account/1');
});

test('productive read model reconciles embedded Account candidates without collapsing Person identity', () => {
  const model = createCartera020cReviewReadModel({
    advisorId,
    actorReference: advisorId,
    reviewReference: 'review/account/020c',
    createdAt: '2026-07-31T20:20:00Z',
    packetRow: {
      id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      advisor_id: advisorId,
      packet_reference: 'packet/account/020c',
      inbox_item_id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
      candidate_id: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
      extracted_fields: { policyNumber: { value: 'A-100', confidence: 0.99 } },
      identity_candidates: [
        {
          candidateReference: 'identity/person/020c',
          candidateType: 'EXISTING_PERSON_OR_NEW_PERSON',
          existingPersonReference: 'person/ana',
          createsTruth: false,
        },
        {
          candidateReference: 'identity/account/020c',
          candidateType: 'EXISTING_ACCOUNT',
          existingAccountReference: 'account/familia-ana',
          createsTruth: false,
        },
      ],
      policy_role_candidates: [{
        roleType: 'OWNER', participantState: 'UNRESOLVED', createsTruth: false,
      }],
      existing_policy_candidates: [],
      confirmation_state: 'PENDING_CONFIRMATION',
      creates_truth: false,
    },
    candidateRow: {
      id: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
      advisor_id: advisorId,
      inbox_item_id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
      missing_fields: [],
      creates_truth: false,
    },
    inboxRow: {
      id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
      advisor_id: advisorId,
      source_id: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
      inbox_reference: 'inbox/account/020c',
      status: 'confirmation_required',
      worker_state: 'COMPLETED',
      classification_state: 'MATCHED',
      classification_confidence: 0.99,
      warnings: [],
    },
    sourceRow: {
      id: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
      advisor_id: advisorId,
      source_reference: 'evidence/account/020c',
      original_filename: 'account-policy.pdf',
      mime_type: 'application/pdf',
      document_digest: 'b'.repeat(64),
      received_at: '2026-07-31T20:00:00Z',
    },
    people: [{
      id: 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
      advisor_id: advisorId,
      person_reference: 'person/ana',
      display_name: 'Ana',
      preferred_name: null,
      normalized_name: 'ana',
      verified_phone: null,
      verified_email: null,
      lifecycle_state: 'CONFIRMED',
      privacy_classification: 'PRIVATE',
      archived_at: null,
    }],
    accounts: [{
      id: 'ffffffff-ffff-4fff-8fff-ffffffffffff',
      advisor_id: advisorId,
      account_reference: 'account/familia-ana',
      account_type: 'HOUSEHOLD',
      display_label: 'Familia Ana',
      lifecycle_state: 'CONFIRMED',
      privacy_classification: 'PRIVATE',
      archived_at: null,
    }],
    policies: [],
  });

  assert.equal(model.identityCandidates.length, 1);
  assert.equal(model.accountCandidates.length, 1);
  assert.equal(model.identityCandidates[0].existingPersonMatches[0].personReference, 'person/ana');
  assert.equal(model.accountCandidates[0].existingAccountMatches[0].accountReference, 'account/familia-ana');
  assert.notEqual(
    model.identityCandidates[0].candidateReference,
    model.accountCandidates[0].candidateReference
  );
});
