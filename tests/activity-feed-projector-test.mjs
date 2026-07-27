import test from "node:test";
import assert from "node:assert/strict";

import {
  ACTIVITY_FEED_ITEM_SCHEMA_VERSION,
  ACTIVITY_FEED_SCHEMA_VERSION,
  ActivityFeedProjectionError,
  createActivityFeedProjectionService,
  createActivityFeedQuery,
  projectActivityFeed,
} from "../advisor-os/activity/application/activity-feed-projector.mjs";

import {
  createActivityRecord,
} from "../advisor-os/activity/domain/activity-record.mjs";

function record(overrides = {}) {
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

function query(overrides = {}) {
  return {
    organizationId:
      "organization-001",
    advisorId:
      "advisor-001",
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
    occurredAt:
      "2026-07-27T10:00:00.000Z",
    evaluationDate:
      "2026-07-27",
    source: {
      recordedAt:
        "2026-07-27T10:05:00.000Z",
      ...(overrides.source ?? {}),
    },
    createdAt:
      "2026-07-27T10:05:00.000Z",
    updatedAt:
      "2026-07-27T10:05:00.000Z",
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
    occurredAt:
      "2026-07-28T10:00:00.000Z",
    evaluationDate:
      "2026-07-28",
    source: {
      recordedAt:
        "2026-07-28T10:05:00.000Z",
      ...(overrides.source ?? {}),
    },
    createdAt:
      "2026-07-28T10:05:00.000Z",
    updatedAt:
      "2026-07-28T10:05:00.000Z",
    ...overrides,
  });
}

test("exports feed schema versions", () => {
  assert.equal(
    ACTIVITY_FEED_SCHEMA_VERSION,
    "activity-feed.v1",
  );
  assert.equal(
    ACTIVITY_FEED_ITEM_SCHEMA_VERSION,
    "activity-feed-item.v1",
  );
});

test("creates canonical feed query", () => {
  const value =
    createActivityFeedQuery(
      query({
        asOf:
          "2026-07-31T19:00:00-05:00",
        types: [
          "APPLICATION_SUBMITTED",
          "APPLICATION_SUBMITTED",
        ],
      }),
    );

  assert.equal(
    value.asOf,
    "2026-08-01T00:00:00.000Z",
  );
  assert.deepEqual(
    value.types,
    ["APPLICATION_SUBMITTED"],
  );
  assert.equal(value.limit, 50);
  assert.equal(Object.isFrozen(value), true);
});

test("rejects unknown query fields", () => {
  assert.throws(
    () => createActivityFeedQuery({
      ...query(),
      score: 10,
    }),
    /unknown field score/,
  );
});

test("rejects invalid as-of instant", () => {
  assert.throws(
    () => createActivityFeedQuery(
      query({ asOf: "later" }),
    ),
    /ISO instant/,
  );
});

test("rejects unsupported enum values", () => {
  assert.throws(
    () => createActivityFeedQuery(
      query({
        types: ["MAGIC"],
      }),
    ),
    /unsupported value/,
  );
});

test("rejects invalid feed limit", () => {
  assert.throws(
    () => createActivityFeedQuery(
      query({ limit: 201 }),
    ),
    /cannot exceed 200/,
  );
});

test("rejects invalid cursor shape", () => {
  assert.throws(
    () => createActivityFeedQuery(
      query({
        cursor: {
          occurredAt:
            "2026-07-26T15:00:00.000Z",
          id: "activity-001",
          extra: true,
        },
      }),
    ),
    /unknown field extra/,
  );
});

test("projects an empty feed", () => {
  const value =
    projectActivityFeed({
      records: [],
      query: query(),
    });

  assert.equal(value.returnedCount, 0);
  assert.equal(value.hasMore, false);
  assert.equal(value.nextCursor, null);
});

test("orders newest activity first", () => {
  const value =
    projectActivityFeed({
      records: [
        record(),
        record({
          id: "activity-002",
          eventId: "event-002",
          occurredAt:
            "2026-07-29T10:00:00.000Z",
          evaluationDate:
            "2026-07-29",
        }),
      ],
      query: query(),
    });

  assert.deepEqual(
    value.items.map((item) => item.id),
    [
      "activity-002",
      "activity-001",
    ],
  );
});

test("uses id as deterministic tie breaker", () => {
  const value =
    projectActivityFeed({
      records: [
        record(),
        record({
          id: "activity-002",
          eventId: "event-002",
        }),
      ],
      query: query(),
    });

  assert.deepEqual(
    value.items.map((item) => item.id),
    [
      "activity-002",
      "activity-001",
    ],
  );
});

test("excludes records known after as-of", () => {
  const value =
    projectActivityFeed({
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

test("projects correction control and target state", () => {
  const target = record();
  const control = correction(target.id);
  const value =
    projectActivityFeed({
      records: [target, control],
      query: query(),
    });

  const byId = new Map(
    value.items.map(
      (item) => [item.id, item],
    ),
  );

  assert.equal(
    byId.get(control.id).itemKind,
    "CORRECTION",
  );
  assert.equal(
    byId.get(control.id)
      .effectiveState,
    "CONTROL",
  );
  assert.equal(
    byId.get(control.id)
      .control.targetActivityId,
    target.id,
  );
  assert.equal(
    byId.get(target.id)
      .effectiveState,
    "CORRECTED",
  );
  assert.deepEqual(
    byId.get(target.id)
      .control.correctedByActivityIds,
    [control.id],
  );
});

test("reversal takes effective precedence", () => {
  const target = record();
  const value =
    projectActivityFeed({
      records: [
        target,
        correction(target.id),
        reversal(target.id),
      ],
      query: query(),
    });

  const item = value.items.find(
    (candidate) =>
      candidate.id === target.id,
  );

  assert.equal(
    item.effectiveState,
    "REVERSED",
  );
  assert.equal(
    value.controlSummary
      .correctedTargetCount,
    1,
  );
  assert.equal(
    value.controlSummary
      .reversedTargetCount,
    1,
  );
});

test("rejects missing relation target", () => {
  assert.throws(
    () => projectActivityFeed({
      records: [reversal("missing")],
      query: query(),
    }),
    /relation target missing/,
  );
});

test("rejects relation recorded before target", () => {
  const target = record({
    source: {
      recordedAt:
        "2026-07-30T10:00:00.000Z",
    },
    createdAt:
      "2026-07-30T10:00:00.000Z",
    updatedAt:
      "2026-07-30T10:00:00.000Z",
  });

  assert.throws(
    () => projectActivityFeed({
      records: [
        target,
        correction(target.id),
      ],
      query: query(),
    }),
    /precedes its target/,
  );
});

test("marks pending activity explicitly", () => {
  const value =
    projectActivityFeed({
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

  assert.equal(
    value.items[0].effectiveState,
    "PENDING",
  );
});

test("filters by activity type", () => {
  const value =
    projectActivityFeed({
      records: [
        record(),
        record({
          id: "activity-002",
          eventId: "event-002",
          type:
            "APPLICATION_SUBMITTED",
        }),
      ],
      query: query({
        types: [
          "APPLICATION_SUBMITTED",
        ],
      }),
    });

  assert.deepEqual(
    value.items.map((item) => item.id),
    ["activity-002"],
  );
});

test("filters by lifecycle", () => {
  const target = record();
  const control = correction(target.id);
  const value =
    projectActivityFeed({
      records: [target, control],
      query: query({
        lifecycles: ["CORRECTED"],
      }),
    });

  assert.deepEqual(
    value.items.map((item) => item.id),
    [control.id],
  );
});

test("filters by evidence state", () => {
  const value =
    projectActivityFeed({
      records: [
        record({
          source: {
            evidenceState:
              "UNVERIFIED",
          },
          lifecycle:
            "PENDING_CONFIRMATION",
          confirmation: null,
        }),
      ],
      query: query({
        evidenceStates: ["VERIFIED"],
      }),
    });

  assert.equal(value.returnedCount, 0);
});

test("filters by source system", () => {
  const value =
    projectActivityFeed({
      records: [record()],
      query: query({
        sourceSystems: ["MANUAL"],
      }),
    });

  assert.equal(value.returnedCount, 0);
});

test("filters by relation identity", () => {
  const value =
    projectActivityFeed({
      records: [
        record(),
        record({
          id: "activity-002",
          eventId: "event-002",
          prospectId:
            "prospect-002",
        }),
      ],
      query: query({
        prospectId:
          "prospect-002",
      }),
    });

  assert.deepEqual(
    value.items.map((item) => item.id),
    ["activity-002"],
  );
});

test("paginates with feed cursor", () => {
  const records = [
    record({
      id: "activity-003",
      eventId: "event-003",
      occurredAt:
        "2026-07-29T00:00:00.000Z",
    }),
    record({
      id: "activity-002",
      eventId: "event-002",
      occurredAt:
        "2026-07-28T00:00:00.000Z",
    }),
    record(),
  ];

  const first =
    projectActivityFeed({
      records,
      query: query({ limit: 2 }),
    });

  const second =
    projectActivityFeed({
      records,
      query: query({
        limit: 2,
        cursor: first.nextCursor,
      }),
    });

  assert.deepEqual(
    first.items.map((item) => item.id),
    ["activity-003", "activity-002"],
  );
  assert.equal(first.hasMore, true);
  assert.deepEqual(
    second.items.map((item) => item.id),
    ["activity-001"],
  );
  assert.equal(second.hasMore, false);
});

test("does not expose raw metadata", () => {
  const value =
    projectActivityFeed({
      records: [
        record({
          metadata: {
            internalReference:
              "secret-value",
          },
        }),
      ],
      query: query(),
    });

  const serialized =
    JSON.stringify(value);

  assert.equal(
    serialized.includes("secret-value"),
    false,
  );
  assert.equal(
    value.items[0].metadataPresent,
    true,
  );
});

test("returns deeply immutable feed", () => {
  const value =
    projectActivityFeed({
      records: [record()],
      query: query(),
    });

  assert.equal(Object.isFrozen(value), true);
  assert.equal(
    Object.isFrozen(value.items),
    true,
  );
  assert.equal(
    Object.isFrozen(
      value.items[0].references,
    ),
    true,
  );
});

test("does not expose scoring authority", () => {
  const serialized =
    JSON.stringify(
      projectActivityFeed({
        records: [record()],
        query: query(),
      }),
    ).toLowerCase();

  for (const field of [
    "points",
    "score",
    "weight",
    "multiplier",
    "ranking",
  ]) {
    assert.equal(
      serialized.includes(field),
      false,
    );
  }
});

test("rejects cross-organization records", () => {
  assert.throws(
    () => projectActivityFeed({
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
    () => projectActivityFeed({
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
    () => projectActivityFeed({
      records: [record(), record()],
      query: query(),
    }),
    /duplicate activity id/,
  );
});

test("service reads all repository pages", async () => {
  const calls = [];
  const first = record();
  const second = record({
    id: "activity-002",
    eventId: "event-002",
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
    createActivityFeedProjectionService({
      repository,
      pageSize: 20,
    });
  const value =
    await service.project(query());

  assert.equal(calls.length, 2);
  assert.equal(value.returnedCount, 2);
});

test("service scopes repository reads", async () => {
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

  await createActivityFeedProjectionService({
    repository,
  }).project(query());

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

test("service rejects repeated repository cursor", async () => {
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
    () => createActivityFeedProjectionService({
      repository,
    }).project(query()),
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
    () => createActivityFeedProjectionService({
      repository,
      maxRecords: 1,
    }).project(query()),
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
    () => createActivityFeedProjectionService({
      repository,
      pageSize: 501,
    }),
    ActivityFeedProjectionError,
  );
});

test("service and pure projection agree", async () => {
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
    createActivityFeedProjectionService({
      repository,
    });

  assert.deepEqual(
    await service.project(query()),
    projectActivityFeed({
      records: items,
      query: query(),
    }),
  );
});
