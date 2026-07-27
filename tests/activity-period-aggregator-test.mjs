import test from "node:test";
import assert from "node:assert/strict";

import {
  ACTIVITY_PERIOD_AGGREGATION_SCHEMA_VERSION,
  ActivityPeriodAggregationError,
  aggregateActivityPeriod,
  createActivityPeriodAggregationService,
  createActivityPeriodQuery,
} from "../advisor-os/activity/application/activity-period-aggregator.mjs";

import {
  createActivityRecord,
} from "../advisor-os/activity/domain/activity-record.mjs";

function record(
  overrides = {},
) {
  const {
    eventId:
      overrideEventId,
    source:
      sourceOverrides = {},
    ...recordOverrides
  } = overrides;

  const id =
    recordOverrides.id ??
    "activity-001";
  const eventId =
    overrideEventId ??
    `event-${id}`;

  return createActivityRecord({
    schemaVersion:
      "activity-record.v1",
    id,
    organizationId:
      "organization-001",
    advisorId:
      "advisor-001",
    managerId:
      "manager-001",
    prospectId:
      "prospect-001",
    opportunityId:
      "opportunity-001",
    appointmentId:
      "appointment-001",
    policyId: null,
    type:
      "INITIAL_APPOINTMENT_COMPLETED",
    subtype:
      "FIRST_MEETING",
    lifecycle:
      "CONFIRMED",
    source: {
      system:
        "PIPELINE",
      eventId,
      recordedAt:
        "2026-07-26T15:10:00.000Z",
      producerVersion:
        "pipeline.v1",
      evidenceState:
        "VERIFIED",
      ...sourceOverrides,
    },
    occurredAt:
      "2026-07-26T15:00:00.000Z",
    evaluationDate:
      "2026-07-26",
    timeZone:
      "America/Mexico_City",
    confirmation: {
      method:
        "PIPELINE_STATE",
      confirmedAt:
        "2026-07-26T15:12:00.000Z",
      confirmedBy:
        "advisor-001",
    },
    correction: null,
    reversal: null,
    metadata: {},
    revision: 1,
    createdAt:
      "2026-07-26T15:10:00.000Z",
    updatedAt:
      "2026-07-26T15:12:00.000Z",
    ...recordOverrides,
    source: {
      system:
        "PIPELINE",
      eventId,
      recordedAt:
        "2026-07-26T15:10:00.000Z",
      producerVersion:
        "pipeline.v1",
      evidenceState:
        "VERIFIED",
      ...sourceOverrides,
    },
  });
}

function query(
  overrides = {},
) {
  return {
    organizationId:
      "organization-001",
    advisorId:
      "advisor-001",
    evaluationDateFrom:
      "2026-07-01",
    evaluationDateTo:
      "2026-07-31",
    asOf:
      "2026-08-01T00:00:00.000Z",
    ...overrides,
  };
}

function correction(
  targetId,
  overrides = {},
) {
  return record({
    id:
      overrides.id ??
      `correction-${targetId}`,
    eventId:
      overrides.eventId ??
      `event-correction-${targetId}`,
    lifecycle: "CORRECTED",
    correction: {
      activityId: targetId,
      reason:
        "Corrected source evidence",
    },
    source: {
      recordedAt:
        "2026-07-27T10:00:00.000Z",
      ...(overrides.source ?? {}),
    },
    createdAt:
      "2026-07-27T10:00:00.000Z",
    updatedAt:
      "2026-07-27T10:00:00.000Z",
    ...overrides,
  });
}

function reversal(
  targetId,
  overrides = {},
) {
  return record({
    id:
      overrides.id ??
      `reversal-${targetId}`,
    eventId:
      overrides.eventId ??
      `event-reversal-${targetId}`,
    lifecycle: "REVERSED",
    reversal: {
      activityId: targetId,
      reason:
        "Activity did not occur",
    },
    source: {
      recordedAt:
        "2026-07-28T10:00:00.000Z",
      ...(overrides.source ?? {}),
    },
    createdAt:
      "2026-07-28T10:00:00.000Z",
    updatedAt:
      "2026-07-28T10:00:00.000Z",
    ...overrides,
  });
}

test("exports aggregation schema version", () => {
  assert.equal(
    ACTIVITY_PERIOD_AGGREGATION_SCHEMA_VERSION,
    "activity-period-aggregation.v1",
  );
});

test("creates a canonical period query", () => {
  const value =
    createActivityPeriodQuery(
      query({
        asOf:
          "2026-07-31T19:00:00-05:00",
      }),
    );

  assert.equal(
    value.asOf,
    "2026-08-01T00:00:00.000Z",
  );
  assert.equal(
    Object.isFrozen(value),
    true,
  );
});

test("rejects unknown query fields", () => {
  assert.throws(
    () => createActivityPeriodQuery({
      ...query(),
      score: 10,
    }),
    /unknown field score/,
  );
});

test("rejects an impossible date", () => {
  assert.throws(
    () => createActivityPeriodQuery(
      query({
        evaluationDateFrom:
          "2026-02-30",
      }),
    ),
    /not a real date/,
  );
});

test("rejects a reversed date range", () => {
  assert.throws(
    () => createActivityPeriodQuery(
      query({
        evaluationDateFrom:
          "2026-08-01",
      }),
    ),
    /range is reversed/,
  );
});

test("rejects an invalid as-of instant", () => {
  assert.throws(
    () => createActivityPeriodQuery(
      query({ asOf: "later" }),
    ),
    /ISO instant/,
  );
});

test("aggregates an empty period", () => {
  const value =
    aggregateActivityPeriod({
      records: [],
      query: query(),
    });

  assert.equal(value.periodRecordCount, 0);
  assert.equal(value.eligibleActivityCount, 0);
  assert.equal(value.firstOccurredAt, null);
  assert.equal(value.lastOccurredAt, null);
});

test("counts a confirmed verified activity", () => {
  const value =
    aggregateActivityPeriod({
      records: [record()],
      query: query(),
    });

  assert.equal(value.periodRecordCount, 1);
  assert.equal(value.eligibleCandidateCount, 1);
  assert.equal(value.eligibleActivityCount, 1);
  assert.equal(
    value.eligibleByType
      .INITIAL_APPOINTMENT_COMPLETED,
    1,
  );
});

test("does not qualify unverified evidence", () => {
  const value =
    aggregateActivityPeriod({
      records: [
        record({
          source: {
            evidenceState:
              "UNVERIFIED",
          },
        }),
      ],
      query: query(),
    });

  assert.equal(value.eligibleActivityCount, 0);
  assert.equal(
    value.evidenceCounts.UNVERIFIED,
    1,
  );
});

test("does not qualify pending activity", () => {
  const value =
    aggregateActivityPeriod({
      records: [
        record({
          lifecycle:
            "PENDING_CONFIRMATION",
          confirmation: null,
          source: {
            evidenceState:
              "UNVERIFIED",
          },
        }),
      ],
      query: query(),
    });

  assert.equal(value.eligibleActivityCount, 0);
  assert.equal(
    value.lifecycleCounts
      .PENDING_CONFIRMATION,
    1,
  );
});

test("keeps the complete type vocabulary", () => {
  const value =
    aggregateActivityPeriod({
      records: [record()],
      query: query(),
    });

  assert.equal(
    Object.keys(value.observedByType)
      .length,
    10,
  );
  assert.equal(
    value.observedByType.POLICY_PAID,
    0,
  );
});

test("counts lifecycle evidence and source", () => {
  const value =
    aggregateActivityPeriod({
      records: [record()],
      query: query(),
    });

  assert.equal(
    value.lifecycleCounts.CONFIRMED,
    1,
  );
  assert.equal(
    value.evidenceCounts.VERIFIED,
    1,
  );
  assert.equal(
    value.sourceSystemCounts.PIPELINE,
    1,
  );
});

test("filters records outside the period", () => {
  const value =
    aggregateActivityPeriod({
      records: [
        record({
          evaluationDate:
            "2026-06-30",
        }),
      ],
      query: query(),
    });

  assert.equal(value.snapshotRecordCount, 1);
  assert.equal(value.periodRecordCount, 0);
});

test("excludes records captured after as-of", () => {
  const value =
    aggregateActivityPeriod({
      records: [
        record({
          source: {
            recordedAt:
              "2026-08-02T00:00:00.000Z",
          },
          createdAt:
            "2026-08-02T00:00:00.000Z",
          updatedAt:
            "2026-08-02T00:00:00.000Z",
        }),
      ],
      query: query(),
    });

  assert.equal(value.snapshotRecordCount, 0);
  assert.equal(
    value.futureRecordedExcludedCount,
    1,
  );
});

test("correction suppresses the target", () => {
  const target = record();
  const value =
    aggregateActivityPeriod({
      records: [
        target,
        correction(target.id),
      ],
      query: query(),
    });

  assert.equal(value.eligibleCandidateCount, 1);
  assert.equal(value.eligibleActivityCount, 0);
  assert.equal(
    value.relations
      .suppressedByCorrectionCount,
    1,
  );
});

test("reversal suppresses the target", () => {
  const target = record();
  const value =
    aggregateActivityPeriod({
      records: [
        target,
        reversal(target.id),
      ],
      query: query(),
    });

  assert.equal(value.eligibleActivityCount, 0);
  assert.equal(
    value.relations
      .suppressedByReversalCount,
    1,
  );
});

test("reversal takes precedence over correction", () => {
  const target = record();
  const value =
    aggregateActivityPeriod({
      records: [
        target,
        correction(target.id),
        reversal(target.id),
      ],
      query: query(),
    });

  assert.equal(
    value.relations
      .suppressedByCorrectionCount,
    0,
  );
  assert.equal(
    value.relations
      .suppressedByReversalCount,
    1,
  );
});

test("future relation does not affect snapshot", () => {
  const target = record();
  const future =
    reversal(target.id, {
      source: {
        recordedAt:
          "2026-08-02T10:00:00.000Z",
      },
      createdAt:
        "2026-08-02T10:00:00.000Z",
      updatedAt:
        "2026-08-02T10:00:00.000Z",
    });

  const value =
    aggregateActivityPeriod({
      records: [target, future],
      query: query(),
    });

  assert.equal(value.eligibleActivityCount, 1);
  assert.equal(
    value.futureRecordedExcludedCount,
    1,
  );
});

test("rejects a missing relation target", () => {
  assert.throws(
    () => aggregateActivityPeriod({
      records: [
        reversal("missing"),
      ],
      query: query(),
    }),
    /relation target missing/,
  );
});

test("rejects cross-organization records", () => {
  assert.throws(
    () => aggregateActivityPeriod({
      records: [
        record({
          organizationId:
            "organization-002",
        }),
      ],
      query: query(),
    }),
    /another organization/,
  );
});

test("rejects cross-advisor records", () => {
  assert.throws(
    () => aggregateActivityPeriod({
      records: [
        record({
          advisorId:
            "advisor-002",
          confirmation: {
            method:
              "PIPELINE_STATE",
            confirmedAt:
              "2026-07-26T15:12:00.000Z",
            confirmedBy:
              "advisor-002",
          },
        }),
      ],
      query: query(),
    }),
    /another advisor/,
  );
});

test("rejects duplicate activity ids", () => {
  assert.throws(
    () => aggregateActivityPeriod({
      records: [
        record(),
        record(),
      ],
      query: query(),
    }),
    /duplicate activity id/,
  );
});

test("counts unique eligible entities", () => {
  const value =
    aggregateActivityPeriod({
      records: [
        record(),
        record({
          id: "activity-002",
          eventId: "event-002",
          type: "APPLICATION_SUBMITTED",
          appointmentId: null,
          policyId: "policy-001",
        }),
      ],
      query: query(),
    });

  assert.deepEqual(
    value.uniqueEligibleEntities,
    {
      prospectCount: 1,
      opportunityCount: 1,
      appointmentCount: 1,
      policyCount: 1,
    },
  );
});

test("sorts observed and eligible dates", () => {
  const value =
    aggregateActivityPeriod({
      records: [
        record({
          id: "activity-002",
          eventId: "event-002",
          evaluationDate:
            "2026-07-28",
        }),
        record(),
      ],
      query: query(),
    });

  assert.deepEqual(
    value.dates.eligible,
    [
      "2026-07-26",
      "2026-07-28",
    ],
  );
});

test("reports first and last occurrence", () => {
  const value =
    aggregateActivityPeriod({
      records: [
        record(),
        record({
          id: "activity-002",
          eventId: "event-002",
          occurredAt:
            "2026-07-29T12:00:00.000Z",
          evaluationDate:
            "2026-07-29",
        }),
      ],
      query: query(),
    });

  assert.equal(
    value.firstOccurredAt,
    "2026-07-26T15:00:00.000Z",
  );
  assert.equal(
    value.lastOccurredAt,
    "2026-07-29T12:00:00.000Z",
  );
});

test("returns deeply immutable aggregation", () => {
  const value =
    aggregateActivityPeriod({
      records: [record()],
      query: query(),
    });

  assert.equal(Object.isFrozen(value), true);
  assert.equal(
    Object.isFrozen(value.eligibleByType),
    true,
  );
  assert.equal(
    Object.isFrozen(value.dates.eligible),
    true,
  );
});

test("does not expose scoring authority", () => {
  const value =
    aggregateActivityPeriod({
      records: [record()],
      query: query(),
    });

  const serialized =
    JSON.stringify(value).toLowerCase();

  for (const key of [
    "points",
    "score",
    "weight",
    "multiplier",
  ]) {
    assert.equal(
      serialized.includes(key),
      false,
    );
  }
});

test("service reads all pages before aggregating", async () => {
  const calls = [];
  const first = record();
  const second = record({
    id: "activity-002",
    eventId: "event-002",
    type: "APPLICATION_SUBMITTED",
  });

  const repository = {
    async append() {},
    async getById() {},
    async getByTruthKey() {},
    async size() {},
    async list(input) {
      calls.push(input);

      if (calls.length === 1) {
        return {
          items: [first],
          nextCursor: {
            occurredAt:
              first.occurredAt,
            id: first.id,
          },
        };
      }

      return {
        items: [second],
        nextCursor: null,
      };
    },
  };

  const service =
    createActivityPeriodAggregationService({
      repository,
      pageSize: 50,
    });
  const value =
    await service.aggregate(query());

  assert.equal(calls.length, 2);
  assert.equal(value.eligibleActivityCount, 2);
});

test("service scopes every repository page", async () => {
  let received = null;

  const repository = {
    async append() {},
    async getById() {},
    async getByTruthKey() {},
    async size() {},
    async list(input) {
      received = input;
      return {
        items: [],
        nextCursor: null,
      };
    },
  };

  await createActivityPeriodAggregationService({
    repository,
  }).aggregate(query());

  assert.deepEqual(received, {
    organizationId:
      "organization-001",
    advisorId:
      "advisor-001",
    order: "asc",
    limit: 500,
    cursor: null,
  });
});

test("service rejects repeated cursors", async () => {
  const repeated = {
    occurredAt:
      "2026-07-26T15:00:00.000Z",
    id: "activity-001",
  };

  const repository = {
    async append() {},
    async getById() {},
    async getByTruthKey() {},
    async size() {},
    async list() {
      return {
        items: [],
        nextCursor: repeated,
      };
    },
  };

  await assert.rejects(
    () => createActivityPeriodAggregationService({
      repository,
    }).aggregate(query()),
    /repeated a cursor/,
  );
});

test("service enforces maxRecords", async () => {
  const repository = {
    async append() {},
    async getById() {},
    async getByTruthKey() {},
    async size() {},
    async list() {
      return {
        items: [
          record(),
          record({
            id: "activity-002",
            eventId: "event-002",
          }),
        ],
        nextCursor: null,
      };
    },
  };

  await assert.rejects(
    () => createActivityPeriodAggregationService({
      repository,
      maxRecords: 1,
    }).aggregate(query()),
    /exceeds maxRecords/,
  );
});

test("service validates page size", () => {
  const repository = {
    async append() {},
    async getById() {},
    async getByTruthKey() {},
    async list() {},
    async size() {},
  };

  assert.throws(
    () => createActivityPeriodAggregationService({
      repository,
      pageSize: 501,
    }),
    ActivityPeriodAggregationError,
  );
});

test("service and pure aggregation agree", async () => {
  const items = [record()];

  const repository = {
    async append() {},
    async getById() {},
    async getByTruthKey() {},
    async size() {},
    async list() {
      return {
        items,
        nextCursor: null,
      };
    },
  };

  const service =
    createActivityPeriodAggregationService({
      repository,
    });

  assert.deepEqual(
    await service.aggregate(query()),
    aggregateActivityPeriod({
      records: items,
      query: query(),
    }),
  );
});
