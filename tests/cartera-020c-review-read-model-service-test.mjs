import test from 'node:test';
import assert from 'node:assert/strict';

import { createCartera020cReviewReadModel } from '../platform/policy-intelligence/intake/cartera-020c-review-read-model.js';
import { createCanonicalConfirmationReviewService } from '../advisor-os/cartera/canonical-confirmation-review-service.js';

const advisorId = '11111111-1111-4111-8111-111111111111';
const packetId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const candidateId = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const inboxId = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';
const sourceId = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd';
const personId = 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee';
const policyId = 'ffffffff-ffff-4fff-8fff-ffffffffffff';

function fixtures(overrides = {}) {
  const packetRow = {
    id: packetId,
    advisor_id: advisorId,
    packet_reference: 'packet/020c/ready',
    inbox_item_id: inboxId,
    candidate_id: candidateId,
    document_type: 'POLICY',
    extracted_fields: {
      policyNumber: {
        fieldName: 'policyNumber', value: 'P-020C-001', confidence: 0.98,
        sourceLocation: { page: 1 }, extractionMethod: 'PDF_TEXT', state: 'extracted',
      },
      annualPremium: {
        fieldName: 'annualPremium', value: null, confidence: null,
        sourceLocation: null, extractionMethod: 'PDF_TEXT', state: 'unknown',
      },
    },
    extraction_confidence: 0.95,
    warnings: [],
    identity_candidates: [{
      candidateReference: 'identity/candidate/020c/1',
      candidateType: 'EXISTING_PERSON_OR_NEW_PERSON',
      email: 'ana.private@example.com',
      createsTruth: false,
    }],
    policy_role_candidates: [{
      roleType: 'OWNER', participantState: 'UNRESOLVED', createsTruth: false,
    }, {
      roleType: 'BENEFICIARY', participantState: 'UNRESOLVED',
      visibilityScope: 'RESTRICTED', beneficiaryName: 'Restricted Name', createsTruth: false,
    }],
    existing_policy_candidates: [{
      carrierReference: 'SMNYL', policyNumber: 'P-020C-001', createsTruth: false,
    }],
    confirmation_state: 'PENDING_CONFIRMATION',
    creates_truth: false,
    created_at: '2026-07-31T20:00:00Z',
    ...overrides.packetRow,
  };
  const candidateRow = {
    id: candidateId,
    advisor_id: advisorId,
    candidate_reference: 'candidate/020c/1',
    inbox_item_id: inboxId,
    attempt_id: null,
    candidate_type: 'POLICY',
    classification: { documentType: 'POLICY', state: 'MATCHED' },
    extracted_fields: packetRow.extracted_fields,
    overall_confidence: 0.95,
    extraction_source: 'LOCAL_PDFTOTEXT',
    parser_id: 'acceptance.policy',
    parser_version: '1.0.0',
    warnings: [],
    missing_fields: [],
    creates_truth: false,
    created_at: '2026-07-31T20:00:00Z',
    ...overrides.candidateRow,
  };
  const inboxRow = {
    id: inboxId,
    advisor_id: advisorId,
    inbox_reference: 'inbox/020c/1',
    source_id: sourceId,
    status: 'confirmation_required',
    document_type_candidate: 'POLICY',
    classification_state: 'MATCHED',
    classification_confidence: 0.95,
    worker_state: 'COMPLETED',
    warnings: [],
    created_at: '2026-07-31T20:00:00Z',
    updated_at: '2026-07-31T20:05:00Z',
    ...overrides.inboxRow,
  };
  const sourceRow = {
    id: sourceId,
    advisor_id: advisorId,
    source_reference: 'evidence/source/020c/1',
    original_filename: 'policy.pdf',
    mime_type: 'application/pdf',
    document_digest: 'a'.repeat(64),
    received_at: '2026-07-31T20:00:00Z',
    ...overrides.sourceRow,
  };
  const people = overrides.people || [{
    id: personId,
    advisor_id: advisorId,
    person_reference: 'person/ana',
    display_name: 'Ana Directora',
    preferred_name: 'Anita',
    normalized_name: 'ana directora',
    verified_phone: '+525500000000',
    verified_email: 'ana.private@example.com',
    lifecycle_state: 'CONFIRMED',
    privacy_classification: 'PRIVATE',
    archived_at: null,
  }];
  const accounts = overrides.accounts || [];
  const policies = overrides.policies || [{
    id: policyId,
    advisor_id: advisorId,
    policy_reference: 'policy/existing/020c',
    carrier_reference: 'SMNYL',
    policy_number: 'P-020C-001',
    product_reference: 'VIDA_MUJER',
    status_value: 'ACTIVE',
    status_as_of: '2026-07-31T19:00:00Z',
    archived_at: null,
  }];
  return { packetRow, candidateRow, inboxRow, sourceRow, people, accounts, policies };
}

function createModel(overrides = {}) {
  return createCartera020cReviewReadModel({
    advisorId,
    actorReference: advisorId,
    ...fixtures(overrides),
    reviewReference: 'review/020c/ready',
    createdAt: '2026-07-31T20:10:00Z',
  });
}

test('read model reconciles owner candidates without exposing private contact values', () => {
  const model = createModel();

  assert.equal(model.state, 'PENDING_REVIEW');
  assert.deepEqual(model.identityCandidates[0].existingPersonMatches[0].matchReasons, ['EMAIL']);
  assert.equal(model.identityCandidates[0].existingPersonMatches[0].personReference, 'person/ana');
  assert.equal(model.identityCandidates[0].existingPersonMatches[0].displayLabel, 'Anita');
  assert.equal(model.duplicatePolicyCandidates[0].existingPolicyMatches[0].policyReference, 'policy/existing/020c');

  const serialized = JSON.stringify(model);
  assert.doesNotMatch(serialized, /ana\.private@example\.com/);
  assert.doesNotMatch(serialized, /\+525500000000/);
});

test('minimal 020B role candidates receive deterministic references and restricted separation', () => {
  const model = createModel();

  assert.equal(model.generalPolicyRoleCandidates.length, 1);
  assert.equal(model.generalPolicyRoleCandidates[0].roleType, 'OWNER');
  assert.match(model.generalPolicyRoleCandidates[0].candidateReference, /^policy-role-candidate\//);
  assert.equal(model.restrictedPolicyRoleCandidates.length, 1);
  assert.equal(model.restrictedPolicyRoleCandidates[0].roleType, 'BENEFICIARY');
  assert.equal(model.restrictedPolicyRoleCandidates[0].visibilityScope, 'RESTRICTED');
  assert.doesNotMatch(JSON.stringify(model.generalPolicyRoleCandidates), /BENEFICIARY|Restricted Name/);
  assert.doesNotMatch(JSON.stringify(model.restrictedPolicyRoleCandidates), /Restricted Name/);
});

test('low-confidence material fields block while unknown premium remains unknown', () => {
  const base = fixtures();
  base.packetRow.extracted_fields.policyNumber.confidence = 0.5;
  const model = createCartera020cReviewReadModel({
    advisorId,
    actorReference: advisorId,
    ...base,
    reviewReference: 'review/020c/low-confidence',
  });

  assert.equal(model.state, 'BLOCKED');
  assert.ok(model.blockers.includes('LOW_CONFIDENCE_FIELDS'));
  const premium = model.fields.find((field) => field.fieldName === 'annualPremium');
  assert.equal(premium.value, null);
  assert.equal(premium.candidateState, 'unknown');
  assert.doesNotMatch(JSON.stringify(model), /"annualPremium"\s*:\s*0|"currency"\s*:\s*"MXN"/);
});

test('sensitive extracted fields are redacted and require explicit restricted review', () => {
  const base = fixtures();
  base.packetRow.extracted_fields.beneficiaryName = {
    fieldName: 'beneficiaryName', value: 'Private Beneficiary', confidence: 0.99,
    sourceLocation: { page: 3 }, extractionMethod: 'PDF_TEXT', state: 'extracted',
  };
  const model = createCartera020cReviewReadModel({
    advisorId,
    actorReference: advisorId,
    ...base,
    reviewReference: 'review/020c/sensitive',
  });

  assert.equal(model.state, 'BLOCKED');
  assert.ok(model.blockers.includes('SENSITIVE_FIELDS_REQUIRE_REVIEW'));
  assert.equal(model.restrictedFields[0].fieldName, 'beneficiaryName');
  assert.equal(model.restrictedFields[0].value, null);
  assert.doesNotMatch(JSON.stringify(model), /Private Beneficiary/);
});

test('evidence ownership and chain mismatches fail closed', () => {
  assert.throws(
    () => createModel({ packetRow: { advisor_id: '22222222-2222-4222-8222-222222222222' } }),
    /POLICY_EVIDENCE_PACKET_OWNER_MISMATCH/
  );
  assert.throws(
    () => createModel({ packetRow: { inbox_item_id: '99999999-9999-4999-8999-999999999999' } }),
    /CARTERA020C_EVIDENCE_CHAIN_MISMATCH/
  );
  assert.throws(
    () => createModel({ inboxRow: { status: 'packet_created' } }),
    /CARTERA020C_INBOX_NOT_READY_FOR_REVIEW/
  );
});

test('nested candidate truth claims are rejected', () => {
  const base = fixtures();
  base.packetRow.identity_candidates[0].createsTruth = true;
  assert.throws(
    () => createCartera020cReviewReadModel({
      advisorId,
      actorReference: advisorId,
      ...base,
      reviewReference: 'review/020c/truth-claim',
    }),
    /IDENTITY_CANDIDATE_TRUTH_CLAIM_FORBIDDEN/
  );
});

function fakeClient(data) {
  const calls = [];

  function query(table) {
    const state = { table, filters: [], inFilter: null, select: null };
    const api = {
      select(value) { state.select = value; calls.push({ table, operation: 'select', value }); return api; },
      eq(column, value) { state.filters.push([column, value]); calls.push({ table, operation: 'eq', column, value }); return api; },
      in(column, values) { state.inFilter = [column, values]; calls.push({ table, operation: 'in', column, values }); return api; },
      order(column, options) { calls.push({ table, operation: 'order', column, options }); return api; },
      maybeSingle() {
        const filtered = resultRows();
        return Promise.resolve({ data: filtered[0] || null, error: null });
      },
      then(resolve, reject) {
        return Promise.resolve({ data: resultRows(), error: null }).then(resolve, reject);
      },
    };
    function resultRows() {
      return (data[table] || []).filter((row) => {
        if (!state.filters.every(([column, value]) => row[column] === value)) return false;
        if (state.inFilter && !state.inFilter[1].includes(row[state.inFilter[0]])) return false;
        return true;
      });
    }
    return api;
  }

  return {
    calls,
    auth: { getUser: async () => ({ data: { user: { id: advisorId } }, error: null }) },
    from(table) { calls.push({ table, operation: 'from' }); return query(table); },
  };
}

function serviceData() {
  const base = fixtures();
  return {
    cartera020b_policy_evidence_packets: [base.packetRow],
    cartera020b_extraction_candidates: [base.candidateRow],
    cartera020b_evidence_inbox_items: [base.inboxRow],
    cartera020b_evidence_sources: [base.sourceRow],
    commercial_people: base.people,
    commercial_accounts: base.accounts,
    canonical_policies: base.policies,
  };
}

test('authenticated service loads a productive review without direct PolicyRole reads or RPCs', async () => {
  const client = fakeClient(serviceData());
  const service = createCanonicalConfirmationReviewService({
    client,
    clock: () => '2026-07-31T20:10:00Z',
  });
  const model = await service.loadReview('packet/020c/ready');

  assert.equal(model.review.advisorId, advisorId);
  assert.equal(model.source.sourceReference, 'evidence/source/020c/1');
  const tables = client.calls.filter((call) => call.operation === 'from').map((call) => call.table);
  assert.ok(tables.includes('cartera020b_policy_evidence_packets'));
  assert.ok(tables.includes('commercial_people'));
  assert.ok(tables.includes('commercial_accounts'));
  assert.ok(tables.includes('canonical_policies'));
  assert.ok(!tables.includes('policy_roles'));
  assert.equal(typeof client.rpc, 'undefined');
  assert.doesNotMatch(JSON.stringify(model), /ana\.private@example\.com/);
});

test('pending review listing composes only confirmation-required completed inbox items', async () => {
  const data = serviceData();
  data.cartera020b_evidence_inbox_items.push({
    ...data.cartera020b_evidence_inbox_items[0],
    id: '12121212-1212-4212-8212-121212121212',
    inbox_reference: 'inbox/not-ready',
    status: 'packet_created',
    worker_state: 'AVAILABLE',
  });
  const client = fakeClient(data);
  const service = createCanonicalConfirmationReviewService({ client });
  const reviews = await service.listPendingReviews();

  assert.equal(reviews.length, 1);
  assert.equal(reviews[0].review.packetReference, 'packet/020c/ready');
  assert.equal(reviews[0].createsTruth, false);
  assert.equal(reviews[0].invokesRemoteCommand, false);
});
