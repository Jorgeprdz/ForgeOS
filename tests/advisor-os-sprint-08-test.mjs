import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createProspectToClientPolicyRuntime,
  ProspectToClientPolicyError,
} from '../advisor-os/cartera/prospect-to-client-policy-runtime.js';

const sale = Object.freeze({
  outcome: 'ACCEPTED',
  outcomeReceiptReference: 'OUTCOME-1',
  personReference: 'PERSON-1',
  prospectReference: 'PROSPECT-1',
  quoteReference: 'QUOTE-1',
  quoteVersionReference: 'QUOTE-VERSION-1',
  applicationReference: 'APPLICATION-1',
  productReference: 'VIDA_MUJER',
  correlationId: 'CORRELATION-1',
});

const confirmation = Object.freeze({
  confirmedByAdvisor: true,
  confirmationReference: 'CONFIRMATION-1',
  idempotencyKey: 'CONVERSION-1',
  sourceAuthority: 'CARTERA_020C',
  issuedPolicyCommand: { applicationReference: 'APPLICATION-1', policyReference: 'POLICY-1' },
});

function verifiedLineage() {
  return {
    application: {
      applicationReference: 'APPLICATION-1',
      personReference: 'PERSON-1',
      quoteReference: 'QUOTE-1',
      productReference: 'VIDA_MUJER',
    },
    policy: { policyReference: 'POLICY-1' },
    personRole: { confirmationState: 'CONFIRMED' },
  };
}

function createAuthorities(overrides = {}) {
  const calls = [];
  const authorities = {
    personAuthority: {
      resolveConfirmedPerson: async () => ({ personReference: 'PERSON-1', lifecycleState: 'CONFIRMED' }),
    },
    pipelineAuthority: {
      resolveActiveProspect: async () => ({ prospectReference: 'PROSPECT-1', personReference: 'PERSON-1' }),
    },
    applicationAuthority: {
      getApprovedApplication: async () => ({
        applicationReference: 'APPLICATION-1',
        lifecycleState: 'APPROVED',
        personReference: 'PERSON-1',
        prospectReference: 'PROSPECT-1',
        quoteReference: 'QUOTE-1',
        productReference: 'VIDA_MUJER',
      }),
    },
    accountReconciliationAuthority: {
      prepareAccountReconciliation: async () => ({
        status: 'EXISTING_ACCOUNT_LINKED',
        accountReference: 'ACCOUNT-1',
        personReference: 'PERSON-1',
        accountCreated: false,
      }),
      confirmExistingAccountLink: async input => ({
        status: 'EXISTING_ACCOUNT_LINKED',
        accountReference: 'ACCOUNT-1',
        personReference: input.personReference,
        accountCreated: false,
        mutationId: 'ACCOUNT-LINK-1',
      }),
    },
    policyLineageAuthority: {
      getApplicationPolicyLineage: async () => {
        calls.push('policy-read');
        return verifiedLineage();
      },
      confirmIssuedPolicyFromApplication: async () => {
        calls.push('policy-confirm');
        return { policyCreatedByApplication: false, applicationPolicyLineageVerified: true };
      },
    },
    portfolioAuthority: {
      verifyPolicyVisible: async () => {
        calls.push('portfolio-visible');
        return { visible: true, policyReference: 'POLICY-1' };
      },
    },
    pipelineClosureAuthority: {
      closeWon: async () => {
        calls.push('pipeline-close');
        return { mutationId: 'PIPELINE-CLOSE-1', eventReference: 'PIPELINE-EVENT-1', resolution: 'CLOSED_WON' };
      },
    },
    timelineAuthority: {
      composeContinuity: async input => ({ ...input, timelineMutation: false }),
    },
  };
  return { calls, ...authorities, ...overrides };
}

async function prepare(authorities) {
  return createProspectToClientPolicyRuntime(authorities).prepare(sale);
}

test('confirmed sale becomes a client projection only after policy and portfolio verification', async () => {
  const authorities = createAuthorities();
  const runtime = createProspectToClientPolicyRuntime(authorities);
  const preview = await runtime.prepare(sale);
  assert.equal(preview.status, 'CONVERSION_PREVIEW_REQUIRED');
  assert.equal(preview.clientProjectionOnly, true);
  assert.equal(preview.accountCreationAuthorized, false);

  const receipt = await runtime.confirm(preview, confirmation);
  assert.equal(receipt.status, 'CONVERSION_CONFIRMED');
  assert.equal(receipt.client.personReference, 'PERSON-1');
  assert.equal(receipt.client.policyReference, 'POLICY-1');
  assert.equal(receipt.client.clientRowCreated, false);
  assert.equal(receipt.pipelineClosure.resolution, 'CLOSED_WON');
  assert.equal(receipt.timelineContinuity.timelineMutation, false);

  assert.ok(authorities.calls.indexOf('policy-read') < authorities.calls.indexOf('portfolio-visible'));
  assert.ok(authorities.calls.indexOf('portfolio-visible') < authorities.calls.indexOf('pipeline-close'));
  assert.equal(authorities.calls.includes('policy-confirm'), false);
});

test('missing policy delegates once to CRS 07 then rereads verified lineage', async () => {
  let reads = 0;
  let confirmations = 0;
  const authorities = createAuthorities({
    policyLineageAuthority: {
      getApplicationPolicyLineage: async () => {
        reads += 1;
        return reads === 1
          ? { missingReason: 'POLICY_NOT_ISSUED' }
          : verifiedLineage();
      },
      confirmIssuedPolicyFromApplication: async input => {
        confirmations += 1;
        assert.equal(input.confirmedByAdvisor, true);
        assert.equal(input.confirmationReference, 'CONFIRMATION-1');
        return { policyCreatedByApplication: false, applicationPolicyLineageVerified: true };
      },
    },
  });
  const runtime = createProspectToClientPolicyRuntime(authorities);
  const preview = await runtime.prepare(sale);
  const receipt = await runtime.confirm(preview, confirmation);
  assert.equal(receipt.policyLineage.policy.policyReference, 'POLICY-1');
  assert.equal(confirmations, 1);
  assert.equal(reads, 2);
});

test('account review confirms only an existing account link', async () => {
  let confirmed = 0;
  const authorities = createAuthorities({
    accountReconciliationAuthority: {
      prepareAccountReconciliation: async () => ({
        status: 'REVIEW_REQUIRED',
        candidateAccountReference: 'ACCOUNT-1',
        accountCreated: false,
      }),
      confirmExistingAccountLink: async input => {
        confirmed += 1;
        assert.equal(input.confirmedByAdvisor, true);
        return {
          status: 'EXISTING_ACCOUNT_LINKED',
          accountReference: 'ACCOUNT-1',
          personReference: 'PERSON-1',
          accountCreated: false,
        };
      },
    },
  });
  const runtime = createProspectToClientPolicyRuntime(authorities);
  const preview = await runtime.prepare(sale);
  const receipt = await runtime.confirm(preview, confirmation);
  assert.equal(receipt.accountReceipt.accountReference, 'ACCOUNT-1');
  assert.equal(confirmed, 1);
});

test('account creation attempt is rejected before policy or pipeline mutation', async () => {
  let pipelineClosed = false;
  const authorities = createAuthorities({
    accountReconciliationAuthority: {
      prepareAccountReconciliation: async () => ({ status: 'REVIEW_REQUIRED', accountCreated: false }),
      confirmExistingAccountLink: async () => ({
        status: 'EXISTING_ACCOUNT_LINKED',
        accountReference: 'ACCOUNT-NEW',
        personReference: 'PERSON-1',
        accountCreated: true,
      }),
    },
    pipelineClosureAuthority: {
      closeWon: async () => { pipelineClosed = true; return { mutationId: 'BAD', resolution: 'CLOSED_WON' }; },
    },
  });
  const runtime = createProspectToClientPolicyRuntime(authorities);
  const preview = await runtime.prepare(sale);
  await assert.rejects(
    () => runtime.confirm(preview, confirmation),
    error => error instanceof ProspectToClientPolicyError && error.code === 'ACCOUNT_CREATION_FORBIDDEN',
  );
  assert.equal(pipelineClosed, false);
});

test('cross-person prospect is rejected during preview', async () => {
  const authorities = createAuthorities({
    pipelineAuthority: {
      resolveActiveProspect: async () => ({ prospectReference: 'PROSPECT-1', personReference: 'PERSON-2' }),
    },
  });
  await assert.rejects(
    () => prepare(authorities),
    error => error instanceof ProspectToClientPolicyError && error.code === 'PROSPECT_PERSON_MISMATCH',
  );
});

test('non-accepted quote outcome cannot start conversion', async () => {
  const runtime = createProspectToClientPolicyRuntime(createAuthorities());
  await assert.rejects(
    () => runtime.prepare({ ...sale, outcome: 'FOLLOW_UP' }),
    error => error instanceof ProspectToClientPolicyError && error.code === 'CONFIRMED_SALE_REQUIRED',
  );
});

test('pipeline remains open when policy confirmation authority is absent', async () => {
  let pipelineClosed = false;
  const authorities = createAuthorities({
    policyLineageAuthority: {
      getApplicationPolicyLineage: async () => ({ missingReason: 'POLICY_NOT_ISSUED' }),
    },
    pipelineClosureAuthority: {
      closeWon: async () => { pipelineClosed = true; return { mutationId: 'BAD', resolution: 'CLOSED_WON' }; },
    },
  });
  const runtime = createProspectToClientPolicyRuntime(authorities);
  const preview = await runtime.prepare(sale);
  await assert.rejects(
    () => runtime.confirm(preview, confirmation),
    error => error instanceof ProspectToClientPolicyError && error.code === 'POLICY_CONFIRMATION_AUTHORITY_REQUIRED',
  );
  assert.equal(pipelineClosed, false);
});

test('portfolio invisibility blocks CLOSED_WON', async () => {
  let pipelineClosed = false;
  const authorities = createAuthorities({
    portfolioAuthority: { verifyPolicyVisible: async () => ({ visible: false }) },
    pipelineClosureAuthority: {
      closeWon: async () => { pipelineClosed = true; return { mutationId: 'BAD', resolution: 'CLOSED_WON' }; },
    },
  });
  const runtime = createProspectToClientPolicyRuntime(authorities);
  const preview = await runtime.prepare(sale);
  await assert.rejects(
    () => runtime.confirm(preview, confirmation),
    error => error instanceof ProspectToClientPolicyError && error.code === 'POLICY_NOT_VISIBLE_IN_PORTFOLIO',
  );
  assert.equal(pipelineClosed, false);
});

test('diagnostics preserve all authority boundaries', () => {
  const diagnostics = createProspectToClientPolicyRuntime(createAuthorities()).diagnostics();
  assert.deepEqual(diagnostics, {
    directDatabaseWrite: false,
    duplicatePersonCreation: false,
    clientIsProjection: true,
    accountCreationAuthorized: false,
    automaticPolicyCreation: false,
    policyAuthorityReused: true,
    applicationAuthorityReused: true,
    pipelineCloseBeforePolicyVerification: false,
    humanConfirmationRequired: true,
    unknownAsZero: false,
  });
});
