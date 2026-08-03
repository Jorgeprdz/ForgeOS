import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createManagementTruthRuntime,
  ManagementTruthError,
} from '../advisor-os/management/management-truth-runtime.js';

function authorities(overrides = {}) {
  return {
    activityReportsAuthority: {
      load: async () => ({
        state: 'READY',
        advisorId: 'ADVISOR-1',
        generatedAt: '2026-08-20T18:00:00.000Z',
        period: { current: { from: '2026-08-01', to: '2026-08-20' } },
        activity: {
          comparison: {
            current: 24,
            previous: 18,
            delta: 6,
            deltaPercent: 33.3,
          },
        },
        production: {
          yearMonth: '2026-08',
          sold: 4,
          target: 10,
        },
        forecast: {
          readModel: {
            advisorId: 'ADVISOR-1',
            yearMonth: '2026-08',
            expectedPolicyCount: 2.6,
            classification: 'AT_RISK',
            evidenceRefs: ['FORECAST-EVIDENCE-1'],
            opportunities: [
              { opportunityId: 'OPP-1', classification: 'PROBABLE' },
              { opportunityId: 'OPP-2', classification: 'POTENTIAL' },
              { opportunityId: 'OPP-3', classification: 'POTENTIAL' },
            ],
          },
        },
      }),
    },
    compensationAuthority: {
      readProduct: async () => ({
        advisorId: 'ADVISOR-1',
        yearMonth: '2026-08',
        earned: 5200,
        paid: 3100,
        currency: 'MXN',
        basis: 'CONFIRMED_COMPENSATION_EVENTS',
      }),
    },
    ...overrides,
  };
}

function card(story, id) {
  return story.cards.find(item => item.id === id);
}

test('management story preserves facts, target, forecast, earned and paid labels', async () => {
  const runtime = createManagementTruthRuntime(authorities());
  const story = await runtime.loadManagementStory();

  assert.equal(story.status, 'READY');
  assert.equal(story.period, '2026-08');
  assert.equal(card(story, 'ACTIVITY_COUNT').truthType, 'FACT');
  assert.equal(card(story, 'POLICIES_SOLD').value, 4);
  assert.equal(card(story, 'POLICY_TARGET').truthType, 'TARGET');
  assert.equal(card(story, 'GOAL_GAP').value, 6);
  assert.equal(card(story, 'FORECAST_EXPECTED_POLICIES').truthType, 'FORECAST');
  assert.equal(card(story, 'FORECAST_EXPECTED_POLICIES').value, 2.6);
  assert.deepEqual(card(story, 'FORECAST_EXPECTED_POLICIES').evidence, ['FORECAST-EVIDENCE-1']);
  assert.equal(card(story, 'COMPENSATION_EARNED').truthType, 'EARNED');
  assert.equal(card(story, 'COMPENSATION_PAID').truthType, 'PAID');
  assert.equal(story.report.compensation.combinedTotal, null);
});

test('funnel uses issued Forecast classifications without recalculation', async () => {
  const story = await createManagementTruthRuntime(authorities()).loadManagementStory();
  assert.equal(story.report.funnel.opportunityCount, 3);
  assert.deepEqual(story.report.funnel.byClassification, { PROBABLE: 1, POTENTIAL: 2 });
  assert.equal(story.report.funnel.probabilitiesRecalculated, false);
});

test('unknown target remains unknown and goal gap is not invented as zero', async () => {
  const runtime = createManagementTruthRuntime(authorities({
    activityReportsAuthority: {
      load: async () => ({
        advisorId: 'ADVISOR-1',
        period: { current: { from: '2026-08-01', to: '2026-08-20' } },
        activity: { comparison: { current: null } },
        production: { yearMonth: '2026-08', sold: 0, target: null },
        forecast: null,
      }),
    },
  }));
  const story = await runtime.loadManagementStory();

  assert.equal(story.status, 'PARTIAL');
  assert.equal(card(story, 'ACTIVITY_COUNT').value, null);
  assert.equal(card(story, 'POLICY_TARGET').value, null);
  assert.equal(card(story, 'GOAL_GAP').value, null);
  assert.equal(story.unknownAsZero, false);
});

test('period mismatch degrades source and excludes incompatible compensation', async () => {
  const runtime = createManagementTruthRuntime(authorities({
    compensationAuthority: {
      readProduct: async () => ({
        advisorId: 'ADVISOR-1',
        yearMonth: '2026-07',
        earned: 9000,
        paid: 9000,
        currency: 'MXN',
        basis: 'CONFIRMED_COMPENSATION_EVENTS',
      }),
    },
  }));
  const story = await runtime.loadManagementStory();

  assert.equal(story.status, 'PARTIAL');
  assert.equal(story.sources.find(source => source.sourceId === 'COMPENSATION').state, 'PERIOD_MISMATCH');
  assert.equal(card(story, 'COMPENSATION_EARNED').value, null);
  assert.equal(card(story, 'COMPENSATION_PAID').value, null);
});

test('cross-advisor Forecast is rejected without contaminating Activity truth', async () => {
  const runtime = createManagementTruthRuntime(authorities({
    forecastAuthority: {
      loadForecast: async () => ({
        advisorId: 'ADVISOR-2',
        yearMonth: '2026-08',
        expectedPolicyCount: 9,
      }),
    },
  }));
  const story = await runtime.loadManagementStory();

  assert.equal(story.status, 'PARTIAL');
  assert.equal(story.sources.find(source => source.sourceId === 'FORECAST').error.code, 'CROSS_ADVISOR_SOURCE_REJECTED');
  assert.equal(card(story, 'ACTIVITY_COUNT').value, 24);
  assert.equal(card(story, 'FORECAST_EXPECTED_POLICIES').value, null);
});

test('quote and premium bases cannot masquerade as compensation', async () => {
  const runtime = createManagementTruthRuntime(authorities({
    compensationAuthority: {
      readProduct: async () => ({
        advisorId: 'ADVISOR-1',
        yearMonth: '2026-08',
        earned: 40000,
        paid: 40000,
        currency: 'MXN',
        basis: 'ISSUED_POLICY_PREMIUM',
      }),
    },
  }));
  const story = await runtime.loadManagementStory();

  assert.equal(story.status, 'PARTIAL');
  assert.equal(story.sources.find(source => source.sourceId === 'COMPENSATION').error.code, 'COMPENSATION_SOURCE_BASIS_FORBIDDEN');
  assert.equal(card(story, 'COMPENSATION_PAID').value, null);
});

test('missing Activity Reports authority fails closed', () => {
  assert.throws(
    () => createManagementTruthRuntime({}),
    error => error instanceof ManagementTruthError && error.code === 'ACTIVITY_REPORTS_AUTHORITY_REQUIRED',
  );
});

test('primary Activity source failure returns unavailable rather than empty business', async () => {
  const runtime = createManagementTruthRuntime({
    activityReportsAuthority: {
      load: async () => {
        const error = new Error('ACTIVITY_OFFLINE');
        error.code = 'ACTIVITY_OFFLINE';
        throw error;
      },
    },
  });
  const story = await runtime.loadManagementStory();

  assert.equal(story.status, 'SOURCE_UNAVAILABLE');
  assert.equal(story.cards.length, 0);
  assert.equal(story.unknownAsZero, false);
});

test('diagnostics preserve all management truth boundaries', () => {
  const diagnostics = createManagementTruthRuntime(authorities()).diagnostics();
  assert.deepEqual(diagnostics, {
    activityAuthority: 'FES_REP_ACTIVITY',
    productionAuthority: 'CANONICAL_POLICY_CONFIRMED_VERSION',
    goalAuthority: 'ADVISOR_MONTHLY_POLICY_GOAL',
    forecastAuthority: 'ADVISOR_FORECAST_ISSUED_SNAPSHOT',
    compensationAuthority: 'ADVISOR_COMPENSATION_AUTHORITY',
    reportsAuthority: 'SPRINT_10_MANAGEMENT_PROJECTION',
    forecastRecalculation: false,
    compensationRecalculation: false,
    paidEqualsEarned: false,
    quoteAsIncome: false,
    premiumAsPaidIncome: false,
    unknownAsZero: false,
    directDatabaseWrite: false,
    automaticDecision: false,
  });
});
