import test from "node:test";
import assert from "node:assert/strict";

import {
  ACTIVITY_TYPES,
} from "../advisor-os/activity/domain/activity-record.mjs";

import {
  ACTIVITY_READ_RUNTIME_SCHEMA_VERSION,
} from "../advisor-os/activity/runtime/activity-read-runtime.mjs";

import {
  ACTIVITY_PERIOD_AGGREGATION_SCHEMA_VERSION,
} from "../advisor-os/activity/application/activity-period-aggregator.mjs";

import {
  ACTIVITY_REPORT_PROVIDER_SCHEMA_VERSION,
  ACTIVITY_REPORT_DEFINITION_ID,
  ACTIVITY_REPORT_DEFINITION_VERSION,
  ActivityReportProviderError,
  createActivityReportProvider,
} from "../advisor-os/activity/reporting/activity-report-provider.mjs";

function zeroCounts() {
  return Object.fromEntries(
    ACTIVITY_TYPES.map(
      (type) => [
        type,
        0,
      ],
    ),
  );
}

function aggregation({
  schemaVersion =
    "activity-period-aggregation.v1",
  organizationId =
    "organization-001",
  advisorId =
    "advisor-001",
  evaluationDateFrom =
    "2026-07-29",
  evaluationDateTo =
    "2026-07-29",
  asOf =
    "2026-07-29T18:00:00.000Z",
  observedByType = {
    ...zeroCounts(),
    CONTACT_ATTEMPTED:
      3,
    CONVERSATION_COMPLETED:
      2,
  },
  eligibleByType = {
    ...zeroCounts(),
    CONTACT_ATTEMPTED:
      2,
    CONVERSATION_COMPLETED:
      2,
  },
  suppressedByType = {
    ...zeroCounts(),
    CONTACT_ATTEMPTED:
      1,
  },
  futureRecordedExcludedCount =
    1,
  relations = {
    correctionRecordCount:
      1,
    reversalRecordCount:
      1,
    suppressedByCorrectionCount:
      1,
    suppressedByReversalCount:
      0,
    allTargetsResolved:
      true,
  },
} = {}) {
  const periodRecordCount =
    Object.values(observedByType)
      .reduce(
        (total, value) =>
          total + value,
        0,
      );
  const eligibleActivityCount =
    Object.values(eligibleByType)
      .reduce(
        (total, value) =>
          total + value,
        0,
      );
  const suppressedEligibleCount =
    Object.values(suppressedByType)
      .reduce(
        (total, value) =>
          total + value,
        0,
      );

  return {
    schemaVersion,
    organizationId,
    advisorId,
    period: {
      evaluationDateFrom,
      evaluationDateTo,
      asOf,
    },
    sourceRecordCount:
      periodRecordCount +
      futureRecordedExcludedCount,
    snapshotRecordCount:
      periodRecordCount,
    futureRecordedExcludedCount,
    periodRecordCount,
    eligibleCandidateCount:
      eligibleActivityCount +
      suppressedEligibleCount,
    eligibleActivityCount,
    suppressedEligibleCount,
    observedByType,
    eligibleByType,
    suppressedByType,
    lifecycleCounts: {},
    evidenceCounts: {},
    sourceSystemCounts: {},
    relations,
    dates: {
      observed: [
        evaluationDateFrom,
      ],
      eligible: [
        evaluationDateFrom,
      ],
      observedDateCount:
        1,
      eligibleDateCount:
        1,
    },
    uniqueEligibleEntities: {
      prospectCount:
        0,
      opportunityCount:
        0,
      appointmentCount:
        0,
      policyCount:
        0,
    },
    firstOccurredAt:
      null,
    lastOccurredAt:
      null,
  };
}

function runtime({
  schemaVersion =
    "activity-read-runtime.v1",
  authority = {
    organizationId:
      "organization-001",
    advisorId:
      "advisor-001",
  },
  capabilities = [
    "ACTIVITY_FEED",
    "ACTIVITY_PERIOD_AGGREGATION",
  ],
  result =
    aggregation(),
  calls = [],
} = {}) {
  return {
    schemaVersion,
    authority,
    capabilities,
    async aggregatePeriod(query) {
      calls.push(query);
      return result;
    },
  };
}

function query(overrides = {}) {
  return {
    schemaVersion:
      "report-provider-slice-query.v1",
    queryKey:
      "activity-query-001",
    provider: {
      providerId:
        "activity",
      providerVersion:
        "activity-report-provider.v1",
      domain:
        "ACTIVITY",
    },
    authority: {
      organizationId:
        "organization-001",
      principalId:
        "advisor-001",
    },
    period: {
      from:
        "2026-07-29",
      to:
        "2026-07-29",
      dayCount:
        1,
      inclusive:
        true,
    },
    timeZone:
      "America/Mexico_City",
    asOf:
      "2026-07-29T18:00:00.000Z",
    dimensions: [
      "evaluationDate",
      "activityType",
    ],
    measures: [
      "observedActivityCount",
      "eligibleActivityCount",
      "suppressedActivityCount",
    ],
    metadata: {},
    ...overrides,
  };
}

test("uses the frozen Activity vocabulary", () => {
  assert.equal(
    ACTIVITY_TYPES.length,
    10,
  );
});

test("uses the frozen Activity runtime schema", () => {
  assert.equal(
    ACTIVITY_READ_RUNTIME_SCHEMA_VERSION,
    "activity-read-runtime.v1",
  );
});

test("uses the frozen period aggregation schema", () => {
  assert.equal(
    ACTIVITY_PERIOD_AGGREGATION_SCHEMA_VERSION,
    "activity-period-aggregation.v1",
  );
});

test("exports provider schemas", () => {
  assert.equal(
    ACTIVITY_REPORT_PROVIDER_SCHEMA_VERSION,
    "activity-report-provider.v1",
  );
  assert.equal(
    ACTIVITY_REPORT_DEFINITION_ID,
    "activity-by-type",
  );
  assert.equal(
    ACTIVITY_REPORT_DEFINITION_VERSION,
    "activity-by-type.v1",
  );
});

test("requires an Activity read runtime", () => {
  assert.throws(
    () =>
      createActivityReportProvider({
        readRuntime: {},
      }),
    ActivityReportProviderError,
  );
});

test("rejects unsupported runtime schemas", () => {
  assert.throws(
    () =>
      createActivityReportProvider({
        readRuntime:
          runtime({
            schemaVersion:
              "activity-feed.v1",
          }),
      }),
    /read authority/u,
  );
});

test("requires aggregatePeriod", () => {
  const value =
    runtime();
  delete value.aggregatePeriod;

  assert.throws(
    () =>
      createActivityReportProvider({
        readRuntime:
          value,
      }),
    /read authority/u,
  );
});

test("requires period aggregation capability", () => {
  assert.throws(
    () =>
      createActivityReportProvider({
        readRuntime:
          runtime({
            capabilities: [
              "ACTIVITY_FEED",
            ],
          }),
      }),
    /read authority/u,
  );
});

test("requires complete runtime authority", () => {
  assert.throws(
    () =>
      createActivityReportProvider({
        readRuntime:
          runtime({
            authority: {
              organizationId:
                "",
              advisorId:
                "advisor-001",
            },
          }),
      }),
    /authority/u,
  );
});

test("creates the Activity provider", () => {
  assert.equal(
    createActivityReportProvider({
      readRuntime:
        runtime(),
    }).schemaVersion,
    "activity-report-provider.v1",
  );
});

test("publishes the activity provider id", () => {
  assert.equal(
    createActivityReportProvider({
      readRuntime:
        runtime(),
    }).port.contract.descriptor.providerId,
    "activity",
  );
});

test("publishes non-empty capabilities", () => {
  assert.equal(
    createActivityReportProvider({
      readRuntime:
        runtime(),
    }).port.contract.descriptor.capabilities.length,
    4,
  );
});

test("forces one-day slices", () => {
  assert.equal(
    createActivityReportProvider({
      readRuntime:
        runtime(),
    }).port.contract.slicePolicy.maxSliceDays,
    1,
  );
});

test("uses contiguous date batching", () => {
  assert.equal(
    createActivityReportProvider({
      readRuntime:
        runtime(),
    }).port.contract.slicePolicy.batchingMode,
    "CONTIGUOUS_DATE_RANGES",
  );
});

test("publishes canonical dimensions", () => {
  assert.deepEqual(
    createActivityReportProvider({
      readRuntime:
        runtime(),
    }).definition.dimensions,
    [
      "evaluationDate",
      "activityType",
    ],
  );
});

test("publishes canonical measures", () => {
  assert.deepEqual(
    createActivityReportProvider({
      readRuntime:
        runtime(),
    }).definition.measures,
    [
      "observedActivityCount",
      "eligibleActivityCount",
      "suppressedActivityCount",
    ],
  );
});

test("uses SUM semantics for all measures", () => {
  assert.equal(
    createActivityReportProvider({
      readRuntime:
        runtime(),
    }).port.contract.measures.every(
      (measure) =>
        measure.aggregation ===
        "SUM",
    ),
    true,
  );
});

test("rejects authority drift", async () => {
  await assert.rejects(
    () =>
      createActivityReportProvider({
        readRuntime:
          runtime(),
      }).port.readSlice(
        query({
          authority: {
            organizationId:
              "organization-002",
            principalId:
              "advisor-001",
          },
        }),
      ),
    /authority/u,
  );
});

test("rejects advisor drift", async () => {
  await assert.rejects(
    () =>
      createActivityReportProvider({
        readRuntime:
          runtime(),
      }).port.readSlice(
        query({
          authority: {
            organizationId:
              "organization-001",
            principalId:
              "advisor-002",
          },
        }),
      ),
    /authority/u,
  );
});

test("rejects multi-day direct slices", async () => {
  await assert.rejects(
    () =>
      createActivityReportProvider({
        readRuntime:
          runtime(),
      }).port.readSlice(
        query({
          period: {
            from:
              "2026-07-28",
            to:
              "2026-07-29",
            dayCount:
              2,
            inclusive:
              true,
          },
        }),
      ),
    /one evaluation date/u,
  );
});

test("forwards exact evaluation date and asOf", async () => {
  const calls = [];

  await createActivityReportProvider({
    readRuntime:
      runtime({
        calls,
      }),
  }).port.readSlice(
    query(),
  );

  assert.deepEqual(
    calls[0],
    {
      evaluationDateFrom:
        "2026-07-29",
      evaluationDateTo:
        "2026-07-29",
      asOf:
        "2026-07-29T18:00:00.000Z",
    },
  );
});

test("rejects unsupported aggregation schemas", async () => {
  await assert.rejects(
    () =>
      createActivityReportProvider({
        readRuntime:
          runtime({
            result:
              aggregation({
                schemaVersion:
                  "activity-feed.v1",
              }),
          }),
      }).port.readSlice(
        query(),
      ),
    /schemaVersion/u,
  );
});

test("rejects aggregation organization drift", async () => {
  await assert.rejects(
    () =>
      createActivityReportProvider({
        readRuntime:
          runtime({
            result:
              aggregation({
                organizationId:
                  "organization-002",
              }),
          }),
      }).port.readSlice(
        query(),
      ),
    /authority drifted/u,
  );
});

test("rejects aggregation advisor drift", async () => {
  await assert.rejects(
    () =>
      createActivityReportProvider({
        readRuntime:
          runtime({
            result:
              aggregation({
                advisorId:
                  "advisor-002",
              }),
          }),
      }).port.readSlice(
        query(),
      ),
    /authority drifted/u,
  );
});

test("rejects aggregation period drift", async () => {
  await assert.rejects(
    () =>
      createActivityReportProvider({
        readRuntime:
          runtime({
            result:
              aggregation({
                evaluationDateFrom:
                  "2026-07-28",
              }),
          }),
      }).port.readSlice(
        query(),
      ),
    /period coverage/u,
  );
});

test("rejects aggregation asOf drift", async () => {
  await assert.rejects(
    () =>
      createActivityReportProvider({
        readRuntime:
          runtime({
            result:
              aggregation({
                asOf:
                  "2026-07-29T19:00:00.000Z",
              }),
          }),
      }).port.readSlice(
        query(),
      ),
    /asOf/u,
  );
});

test("requires every observed activity type", async () => {
  const observed =
    zeroCounts();
  delete observed.POLICY_PAID;

  await assert.rejects(
    () =>
      createActivityReportProvider({
        readRuntime:
          runtime({
            result:
              aggregation({
                observedByType:
                  observed,
              }),
          }),
      }).port.readSlice(
        query(),
      ),
    /canonical Activity vocabulary/u,
  );
});

test("requires every eligible activity type", async () => {
  const eligible =
    zeroCounts();
  delete eligible.FOLLOW_UP_COMPLETED;

  await assert.rejects(
    () =>
      createActivityReportProvider({
        readRuntime:
          runtime({
            result:
              aggregation({
                eligibleByType:
                  eligible,
              }),
          }),
      }).port.readSlice(
        query(),
      ),
    /canonical Activity vocabulary/u,
  );
});

test("requires every suppressed activity type", async () => {
  const suppressed =
    zeroCounts();
  delete suppressed.CONTACT_ATTEMPTED;

  await assert.rejects(
    () =>
      createActivityReportProvider({
        readRuntime:
          runtime({
            result:
              aggregation({
                suppressedByType:
                  suppressed,
              }),
          }),
      }).port.readSlice(
        query(),
      ),
    /canonical Activity vocabulary/u,
  );
});

test("rejects negative observed counts", async () => {
  const observed = {
    ...zeroCounts(),
    CONTACT_ATTEMPTED:
      -1,
  };

  await assert.rejects(
    () =>
      createActivityReportProvider({
        readRuntime:
          runtime({
            result:
              aggregation({
                observedByType:
                  observed,
              }),
          }),
      }).port.readSlice(
        query(),
      ),
    /non-negative integer/u,
  );
});

test("rejects observed reconciliation drift", async () => {
  const value =
    aggregation();
  value.periodRecordCount +=
    1;

  await assert.rejects(
    () =>
      createActivityReportProvider({
        readRuntime:
          runtime({
            result:
              value,
          }),
      }).port.readSlice(
        query(),
      ),
    /observedByType/u,
  );
});

test("rejects eligible reconciliation drift", async () => {
  const value =
    aggregation();
  value.eligibleActivityCount +=
    1;

  await assert.rejects(
    () =>
      createActivityReportProvider({
        readRuntime:
          runtime({
            result:
              value,
          }),
      }).port.readSlice(
        query(),
      ),
    /eligibleByType/u,
  );
});

test("rejects suppressed reconciliation drift", async () => {
  const value =
    aggregation();
  value.suppressedEligibleCount +=
    1;

  await assert.rejects(
    () =>
      createActivityReportProvider({
        readRuntime:
          runtime({
            result:
              value,
          }),
      }).port.readSlice(
        query(),
      ),
    /suppressedByType/u,
  );
});

test("returns one row per Activity type", async () => {
  const value =
    await createActivityReportProvider({
      readRuntime:
        runtime(),
    }).port.readSlice(
      query(),
    );

  assert.equal(
    value.rows.length,
    ACTIVITY_TYPES.length,
  );
});

test("maps evaluation date and type", async () => {
  const value =
    await createActivityReportProvider({
      readRuntime:
        runtime(),
    }).port.readSlice(
      query(),
    );
  const row =
    value.rows.find(
      (candidate) =>
        candidate.dimensions
          .activityType ===
        "CONTACT_ATTEMPTED",
    );

  assert.deepEqual(
    row.dimensions,
    {
      evaluationDate:
        "2026-07-29",
      activityType:
        "CONTACT_ATTEMPTED",
    },
  );
});

test("maps observed eligible and suppressed counts", async () => {
  const value =
    await createActivityReportProvider({
      readRuntime:
        runtime(),
    }).port.readSlice(
      query(),
    );
  const row =
    value.rows.find(
      (candidate) =>
        candidate.dimensions
          .activityType ===
        "CONTACT_ATTEMPTED",
    );

  assert.deepEqual(
    row.measures,
    {
      observedActivityCount:
        3,
      eligibleActivityCount:
        2,
      suppressedActivityCount:
        1,
    },
  );
});

test("preserves zero-valued Activity types", async () => {
  const value =
    await createActivityReportProvider({
      readRuntime:
        runtime(),
    }).port.readSlice(
      query(),
    );
  const row =
    value.rows.find(
      (candidate) =>
        candidate.dimensions
          .activityType ===
        "POLICY_PAID",
    );

  assert.deepEqual(
    row.measures,
    {
      observedActivityCount:
        0,
      eligibleActivityCount:
        0,
      suppressedActivityCount:
        0,
    },
  );
});

test("respects selected dimensions", async () => {
  const value =
    await createActivityReportProvider({
      readRuntime:
        runtime(),
    }).port.readSlice(
      query({
        dimensions: [
          "activityType",
        ],
      }),
    );

  assert.deepEqual(
    value.rows[0].dimensions,
    {
      activityType:
        ACTIVITY_TYPES[0],
    },
  );
});

test("respects selected measures", async () => {
  const value =
    await createActivityReportProvider({
      readRuntime:
        runtime(),
    }).port.readSlice(
      query({
        measures: [
          "eligibleActivityCount",
        ],
      }),
    );

  assert.deepEqual(
    value.rows[0].measures,
    {
      eligibleActivityCount:
        0,
    },
  );
});

test("maps future-recorded exclusion", async () => {
  const value =
    await createActivityReportProvider({
      readRuntime:
        runtime(),
    }).port.readSlice(
      query(),
    );

  assert.deepEqual(
    value.exclusions[0],
    {
      code:
        "FUTURE_RECORDED",
      count:
        1,
    },
  );
});

test("maps correction suppression exclusion", async () => {
  const value =
    await createActivityReportProvider({
      readRuntime:
        runtime(),
    }).port.readSlice(
      query(),
    );

  assert.deepEqual(
    value.exclusions[1],
    {
      code:
        "CORRECTION_SUPPRESSION",
      count:
        1,
    },
  );
});

test("maps reversal suppression exclusion", async () => {
  const value =
    await createActivityReportProvider({
      readRuntime:
        runtime(),
    }).port.readSlice(
      query(),
    );

  assert.deepEqual(
    value.exclusions[2],
    {
      code:
        "REVERSAL_SUPPRESSION",
      count:
        0,
    },
  );
});

test("preserves Activity runtime provenance", async () => {
  const value =
    await createActivityReportProvider({
      readRuntime:
        runtime(),
    }).port.readSlice(
      query(),
    );

  assert.deepEqual(
    value.provenance[0],
    {
      sourceId:
        "activity-read-runtime",
      sourceVersion:
        "activity-period-aggregation.v1",
      authority:
        "ACTIVITY_READ_RUNTIME",
    },
  );
});

test("defaults to date and type dimensions", () => {
  assert.deepEqual(
    createActivityReportProvider({
      readRuntime:
        runtime(),
    }).definition.defaultDimensions,
    [
      "evaluationDate",
      "activityType",
    ],
  );
});

test("does not claim scoring authority", () => {
  assert.equal(
    createActivityReportProvider({
      readRuntime:
        runtime(),
    }).boundary.scoringAuthority,
    false,
  );
});

test("does not claim eligibility policy authority", () => {
  assert.equal(
    createActivityReportProvider({
      readRuntime:
        runtime(),
    }).boundary.eligibilityPolicyAuthority,
    false,
  );
});

test("does not claim Activity write authority", () => {
  assert.equal(
    createActivityReportProvider({
      readRuntime:
        runtime(),
    }).boundary.activityWriteAuthority,
    false,
  );
});

test("does not claim correction or reversal authority", () => {
  const boundary =
    createActivityReportProvider({
      readRuntime:
        runtime(),
    }).boundary;

  assert.equal(
    boundary.correctionAuthority,
    false,
  );
  assert.equal(
    boundary.reversalAuthority,
    false,
  );
});

test("does not claim Pipeline writer mutation", () => {
  assert.equal(
    createActivityReportProvider({
      readRuntime:
        runtime(),
    }).boundary.pipelineWriterMutationAuthority,
    false,
  );
});

test("provider and definition are deeply immutable", () => {
  const value =
    createActivityReportProvider({
      readRuntime:
        runtime(),
    });

  assert.equal(
    Object.isFrozen(value),
    true,
  );
  assert.equal(
    Object.isFrozen(value.definition),
    true,
  );
  assert.equal(
    Object.isFrozen(value.port),
    true,
  );
});

test("exposes no write score export or UI methods", () => {
  const value =
    createActivityReportProvider({
      readRuntime:
        runtime(),
    });

  for (const name of [
    "append",
    "correct",
    "reverse",
    "score",
    "calculatePoints",
    "persist",
    "export",
    "render",
    "rank",
  ]) {
    assert.equal(
      name in value,
      false,
    );
  }
});
