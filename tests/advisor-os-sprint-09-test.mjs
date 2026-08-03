import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createPortfolioServiceRuntime,
  PortfolioServiceError,
  SERVICE_ACTION_TYPES,
} from '../advisor-os/cartera/portfolio-service-runtime.js';

const asOfDate = '2026-08-02';

function authorities(overrides = {}) {
  return {
    personWorkspaceAuthority: {
      getPersonWorkspace: async ({ personReference }) => ({
        personReference,
        identity: { personReference, displayName: 'Ana Torres' },
        sections: {
          POLICIES: {
            items: [{
              reference: 'POLICY-1',
              policyReference: 'POLICY-1',
              facts: { personReference, productReference: 'VIDA_MUJER' },
            }],
          },
        },
      }),
    },
    portfolioAuthority: {
      loadPortfolio: async () => ({
        items: [{ policyReference: 'POLICY-1', personReferences: ['PERSON-1'] }],
      }),
      loadPolicyDetail: async policyReference => ({
        policyReference,
        people: [{ personReference: 'PERSON-1', displayName: 'Ana Torres' }],
        roles: [{ personReference: 'PERSON-1', roleType: 'POLICYHOLDER' }],
        policy: {
          policyReference,
          premiumAmount: null,
          currency: null,
          status: 'IN_FORCE',
        },
      }),
    },
    paymentCalendarAuthority: {
      loadCalendar: async ({ policyReference = null }) => ({
        summary: { overdue: 1, upcoming: 1 },
        items: [
          {
            policyReference: policyReference || 'POLICY-1',
            state: 'OVERDUE',
            dueDate: '2026-07-30',
            amount: null,
          },
          {
            policyReference: policyReference || 'POLICY-1',
            state: 'UPCOMING',
            dueDate: '2026-08-15',
            amount: null,
          },
        ],
      }),
    },
    futureRadarAuthority: {
      loadFutureRadar: async () => ({
        items: [{
          reference: 'RADAR-1',
          type: 'POLICY_RENEWAL',
          personReference: 'PERSON-1',
          policyReference: 'POLICY-1',
          renewalDate: '2026-09-01',
        }],
        focusItems: [{
          reference: 'RADAR-2',
          kind: 'POLICY_ANNIVERSARY',
          personReference: 'PERSON-1',
          policyReference: 'POLICY-1',
          anniversaryDate: '2026-08-20',
        }],
      }),
    },
    timelineAuthority: {
      getUnifiedPersonTimeline: async ({ personReference }) => ({
        personReference,
        entries: [{
          entryReference: 'TIMELINE-1',
          recordType: 'PHONE_CALL',
          title: 'Llamada de servicio',
          occurredAt: '2026-03-01T12:00:00.000Z',
          policyReference: 'POLICY-1',
        }],
      }),
    },
    nextActionAuthority: {
      schedulePortfolioServiceAction: async input => ({
        mutationId: 'ACTION-1',
        personReference: input.personReference,
        policyReference: input.policyReference,
        dueAt: input.dueAt,
      }),
    },
    complementaryQuoteAuthority: {
      prepareComplementaryQuoteEntry: async input => ({
        status: 'PREVIEW_REQUIRED',
        personReference: input.personReference,
        policyReference: input.policyReference,
        directWrite: false,
      }),
    },
    ...overrides,
  };
}

test('client 360 composes canonical authorities and service signals', async () => {
  const runtime = createPortfolioServiceRuntime(authorities());
  const snapshot = await runtime.loadClient360({ personReference: 'PERSON-1', asOfDate });

  assert.equal(snapshot.status, 'READY');
  assert.equal(snapshot.personReference, 'PERSON-1');
  assert.equal(snapshot.policies.length, 1);
  assert.equal(snapshot.unknownAsZero, false);
  assert.equal(snapshot.automaticAction, false);
  assert.deepEqual(
    snapshot.serviceSignals.map(item => item.type),
    ['PAYMENT_OVERDUE', 'PAYMENT_DUE', 'RENEWAL_REVIEW', 'CLIENT_WITHOUT_RECENT_CONTACT', 'POLICY_ANNIVERSARY'],
  );
  assert.equal(snapshot.serviceSignals[0].severity, 'CRITICAL');
});

test('optional source degradation produces honest partial state', async () => {
  const runtime = createPortfolioServiceRuntime(authorities({
    futureRadarAuthority: {
      loadFutureRadar: async () => {
        const error = new Error('SOURCE_OFFLINE');
        error.code = 'SOURCE_OFFLINE';
        throw error;
      },
    },
  }));
  const snapshot = await runtime.loadClient360({ personReference: 'PERSON-1', asOfDate });

  assert.equal(snapshot.status, 'PARTIAL');
  assert.equal(snapshot.sourceStates.futureRadar.status, 'UNAVAILABLE');
  assert.equal(snapshot.sourceStates.futureRadar.errorCode, 'SOURCE_OFFLINE');
  assert.equal(snapshot.unknownAsZero, false);
  assert.equal(snapshot.workspace.identity.displayName, 'Ana Torres');
});

test('policy detail preserves null values and filters service context', async () => {
  const runtime = createPortfolioServiceRuntime(authorities());
  const detail = await runtime.loadPolicyServiceDetail({
    personReference: 'PERSON-1',
    policyReference: 'POLICY-1',
    asOfDate,
  });

  assert.equal(detail.status, 'READY');
  assert.equal(detail.policyReference, 'POLICY-1');
  assert.equal(detail.policyDetail.policy.premiumAmount, null);
  assert.equal(detail.policyDetail.policy.currency, null);
  assert.equal(detail.paymentCalendar.items.length, 2);
  assert.equal(detail.futureSignals.length, 2);
  assert.equal(detail.serviceHistory.length, 1);
  assert.equal(detail.unknownAsZero, false);
});

test('cross-person policy detail is rejected', async () => {
  const runtime = createPortfolioServiceRuntime(authorities({
    portfolioAuthority: {
      loadPortfolio: async () => ({ items: [] }),
      loadPolicyDetail: async policyReference => ({
        policyReference,
        people: [{ personReference: 'PERSON-2' }],
        roles: [{ personReference: 'PERSON-2', roleType: 'POLICYHOLDER' }],
      }),
    },
  }));

  await assert.rejects(
    () => runtime.loadPolicyServiceDetail({
      personReference: 'PERSON-1',
      policyReference: 'POLICY-1',
      asOfDate,
    }),
    error => error instanceof PortfolioServiceError && error.code === 'POLICY_PERSON_MISMATCH',
  );
});

test('policy detail without verifiable person lineage fails closed', async () => {
  const runtime = createPortfolioServiceRuntime(authorities({
    portfolioAuthority: {
      loadPortfolio: async () => ({ items: [] }),
      loadPolicyDetail: async policyReference => ({ policyReference, policy: { policyReference } }),
    },
  }));

  await assert.rejects(
    () => runtime.loadPolicyServiceDetail({
      personReference: 'PERSON-1',
      policyReference: 'POLICY-1',
      asOfDate,
    }),
    error => error.code === 'POLICY_PERSON_LINK_UNVERIFIED',
  );
});

test('service action requires preview and explicit confirmation', async () => {
  let calls = 0;
  const runtime = createPortfolioServiceRuntime(authorities({
    nextActionAuthority: {
      schedulePortfolioServiceAction: async input => {
        calls += 1;
        return {
          mutationId: `ACTION-${calls}`,
          personReference: input.personReference,
          policyReference: input.policyReference,
        };
      },
    },
  }));
  const preview = runtime.prepareServiceAction({
    actionType: 'RENEWAL_REVIEW',
    personReference: 'PERSON-1',
    policyReference: 'POLICY-1',
    dueAt: '2026-08-10T15:00:00-06:00',
    sourceSignalReference: 'RADAR-1',
  });

  assert.equal(preview.status, 'PREVIEW_REQUIRED');
  assert.equal(preview.directWrite, false);
  assert.equal(calls, 0);

  await assert.rejects(
    () => runtime.confirmServiceAction({ preview, confirmedByAdvisor: false }),
    error => error.code === 'SERVICE_ACTION_CONFIRMATION_REQUIRED',
  );
  assert.equal(calls, 0);

  const receipt = await runtime.confirmServiceAction({
    preview,
    confirmedByAdvisor: true,
    confirmationReference: 'CONFIRM-1',
  });
  assert.equal(receipt.status, 'SERVICE_ACTION_SCHEDULED');
  assert.equal(receipt.receipt.mutationId, 'ACTION-1');
  assert.equal(calls, 1);
});

test('service action fails closed without Next Action authority', async () => {
  const runtime = createPortfolioServiceRuntime(authorities({ nextActionAuthority: null }));
  const preview = runtime.prepareServiceAction({
    actionType: 'CLIENT_CONTACT',
    personReference: 'PERSON-1',
    dueAt: '2026-08-10T15:00:00-06:00',
  });
  await assert.rejects(
    () => runtime.confirmServiceAction({
      preview,
      confirmedByAdvisor: true,
      confirmationReference: 'CONFIRM-1',
    }),
    error => error.code === 'NEXT_ACTION_AUTHORITY_REQUIRED',
  );
});

test('policy-specific service actions require a Policy', () => {
  const runtime = createPortfolioServiceRuntime(authorities());
  assert.throws(
    () => runtime.prepareServiceAction({
      actionType: 'PAYMENT_FOLLOW_UP',
      personReference: 'PERSON-1',
      dueAt: '2026-08-10T15:00:00-06:00',
    }),
    error => error.code === 'SERVICE_ACTION_POLICY_REQUIRED',
  );
  assert.equal(SERVICE_ACTION_TYPES.includes('PAYMENT_FOLLOW_UP'), true);
});

test('complementary quote entry preserves identity and never writes', async () => {
  const runtime = createPortfolioServiceRuntime(authorities());
  const entry = await runtime.prepareComplementaryQuoteEntry({
    personReference: 'PERSON-1',
    policyReference: 'POLICY-1',
    productReference: 'ALFA_MEDICAL_FLEX',
    correlationId: 'CORR-1',
  });

  assert.equal(entry.status, 'QUOTE_ENTRY_READY');
  assert.equal(entry.quotePreviewRequired, true);
  assert.equal(entry.directWrite, false);
  assert.match(entry.deepLink, /nav=cotizaciones/);
  assert.match(entry.deepLink, /person=PERSON-1/);
  assert.match(entry.deepLink, /policy=POLICY-1/);
});

test('autonomous complementary quote execution is rejected', async () => {
  const runtime = createPortfolioServiceRuntime(authorities({
    complementaryQuoteAuthority: {
      prepareComplementaryQuoteEntry: async () => ({ status: 'EXECUTED', directWrite: true }),
    },
  }));

  await assert.rejects(
    () => runtime.prepareComplementaryQuoteEntry({
      personReference: 'PERSON-1',
      policyReference: 'POLICY-1',
      productReference: 'ALFA_MEDICAL_FLEX',
      correlationId: 'CORR-1',
    }),
    error => error.code === 'COMPLEMENTARY_QUOTE_AUTONOMOUS_WRITE_REJECTED',
  );
});

test('contextual signal projection remains draft-only', async () => {
  const runtime = createPortfolioServiceRuntime(authorities());
  const snapshot = await runtime.loadClient360({ personReference: 'PERSON-1', asOfDate });
  const signals = runtime.toContextualSignals(snapshot);

  assert.ok(signals.length >= 1);
  assert.equal(signals.every(item => item.draftOnly === true), true);
  assert.equal(signals.every(item => item.automaticAction === false), true);
});

test('diagnostics preserve all authority boundaries', () => {
  const diagnostics = createPortfolioServiceRuntime(authorities()).diagnostics();
  assert.deepEqual(diagnostics, {
    client360Authority: 'CRS_09_PERSON_WORKSPACE',
    policyAuthority: 'CARTERA_010C_CANONICAL_PORTFOLIO',
    paymentAuthority: 'CARTERA_030D_PAYMENT_CALENDAR',
    futureAuthority: 'CARTERA_050_FUTURE_RADAR',
    timelineAuthority: 'CRS_08_UNIFIED_TIMELINE',
    serviceActionAuthority: 'NFAST_09_DUE_ACTION_RUNTIME',
    secondPersonStore: false,
    secondPolicyStore: false,
    secondServiceLedger: false,
    directDatabaseWrite: false,
    automaticPolicyMutation: false,
    automaticContact: false,
    unknownAsZero: false,
  });
});
