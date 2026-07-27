import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

import {
  ACTIVITY_READ_RUNTIME_CAPABILITIES,
  ACTIVITY_READ_RUNTIME_SCHEMA_VERSION,
  ActivityReadRuntimeError,
  createActivityReadRuntime,
  createSupabaseActivityReadRuntime,
} from "../advisor-os/activity/runtime/activity-read-runtime.mjs";

import {
  createActivityRecord,
} from "../advisor-os/activity/domain/activity-record.mjs";

function activity(overrides = {}) {
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
      system: "PIPELINE",
      eventId:
        overrideEventId ??
        `event-${id}`,
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
      system: "PIPELINE",
      eventId:
        overrideEventId ??
        `event-${id}`,
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

function repository(items = []) {
  const calls = [];

  return {
    calls,
    async append() {
      throw new Error(
        "append must not be called",
      );
    },
    async getById() {
      return null;
    },
    async getByTruthKey() {
      return null;
    },
    async size() {
      return items.length;
    },
    async list(input) {
      calls.push(input);
      return {
        items,
        nextCursor: null,
      };
    },
  };
}

function runtime(
  overrides = {},
) {
  return createActivityReadRuntime({
    repository:
      overrides.repository ??
      repository(),
    organizationId:
      "organization-001",
    advisorId:
      "advisor-001",
    clock:
      overrides.clock ??
      (() =>
        "2026-08-01T00:00:00.000Z"),
    feed:
      overrides.feed,
    aggregation:
      overrides.aggregation,
  });
}

test("exports runtime schema version", () => {
  assert.equal(
    ACTIVITY_READ_RUNTIME_SCHEMA_VERSION,
    "activity-read-runtime.v1",
  );
});

test("exports read-only capabilities", () => {
  assert.deepEqual(
    ACTIVITY_READ_RUNTIME_CAPABILITIES,
    [
      "ACTIVITY_FEED",
      "ACTIVITY_PERIOD_AGGREGATION",
    ],
  );
  assert.equal(
    Object.isFrozen(
      ACTIVITY_READ_RUNTIME_CAPABILITIES,
    ),
    true,
  );
});

test("binds organization and advisor authority", () => {
  const value = runtime();

  assert.deepEqual(
    value.authority,
    {
      organizationId:
        "organization-001",
      advisorId:
        "advisor-001",
    },
  );
});

test("does not expose write or infrastructure authority", () => {
  const value = runtime();

  assert.deepEqual(
    Object.keys(value).sort(),
    [
      "aggregatePeriod",
      "authority",
      "capabilities",
      "feed",
      "schemaVersion",
    ],
  );

  for (const key of [
    "append",
    "repository",
    "client",
    "rpc",
    "from",
  ]) {
    assert.equal(
      Object.prototype.hasOwnProperty.call(
        value,
        key,
      ),
      false,
    );
  }
});

test("feed uses bound authority and clock", async () => {
  const repo = repository();

  await runtime({
    repository: repo,
  }).feed();

  assert.deepEqual(
    repo.calls[0],
    {
      organizationId:
        "organization-001",
      advisorId:
        "advisor-001",
      order: "asc",
      limit: 500,
      cursor: null,
    },
  );
});

test("feed uses explicit as-of without calling clock", async () => {
  let calls = 0;
  const value = runtime({
    clock() {
      calls += 1;
      return "2026-09-01T00:00:00.000Z";
    },
  });

  const result = await value.feed({
    asOf:
      "2026-08-01T00:00:00.000Z",
  });

  assert.equal(
    result.asOf,
    "2026-08-01T00:00:00.000Z",
  );
  assert.equal(calls, 0);
});

test("period aggregation uses clock as default as-of", async () => {
  const value = runtime({
    repository:
      repository([activity()]),
  });

  const result =
    await value.aggregatePeriod({
      evaluationDateFrom:
        "2026-07-01",
      evaluationDateTo:
        "2026-07-31",
    });

  assert.equal(
    result.period.asOf,
    "2026-08-01T00:00:00.000Z",
  );
  assert.equal(
    result.eligibleActivityCount,
    1,
  );
});

test("feed projects canonical records", async () => {
  const result =
    await runtime({
      repository:
        repository([activity()]),
    }).feed();

  assert.equal(result.returnedCount, 1);
  assert.equal(
    result.items[0].id,
    "activity-001",
  );
});

test("period aggregates canonical records", async () => {
  const result =
    await runtime({
      repository:
        repository([activity()]),
    }).aggregatePeriod({
      evaluationDateFrom:
        "2026-07-01",
      evaluationDateTo:
        "2026-07-31",
    });

  assert.equal(
    result.eligibleActivityCount,
    1,
  );
});

test("feed cannot override organization authority", async () => {
  await assert.rejects(
    () => runtime().feed({
      organizationId:
        "organization-002",
    }),
    /cannot override organizationId/,
  );
});

test("period cannot override advisor authority", async () => {
  await assert.rejects(
    () => runtime().aggregatePeriod({
      organizationId:
        "organization-001",
      advisorId:
        "advisor-002",
      evaluationDateFrom:
        "2026-07-01",
      evaluationDateTo:
        "2026-07-31",
    }),
    /cannot override organizationId/,
  );
});

test("period independently rejects advisor override", async () => {
  await assert.rejects(
    () => runtime().aggregatePeriod({
      advisorId:
        "advisor-002",
      evaluationDateFrom:
        "2026-07-01",
      evaluationDateTo:
        "2026-07-31",
    }),
    /cannot override advisorId/,
  );
});

test("runtime rejects unknown composition fields", () => {
  assert.throws(
    () => createActivityReadRuntime({
      repository: repository(),
      organizationId:
        "organization-001",
      advisorId:
        "advisor-001",
      ui: true,
    }),
    /unknown field ui/,
  );
});

test("runtime rejects invalid repository", () => {
  assert.throws(
    () => createActivityReadRuntime({
      repository: {},
      organizationId:
        "organization-001",
      advisorId:
        "advisor-001",
    }),
    /must implement append/,
  );
});

test("runtime rejects invalid clock", () => {
  assert.throws(
    () => createActivityReadRuntime({
      repository: repository(),
      organizationId:
        "organization-001",
      advisorId:
        "advisor-001",
      clock:
        "2026-08-01",
    }),
    ActivityReadRuntimeError,
  );
});

test("runtime rejects invalid clock output", async () => {
  await assert.rejects(
    () => runtime({
      clock() {
        return "later";
      },
    }).feed(),
    /clock returned an invalid ISO instant/,
  );
});

test("runtime rejects non-string clock output", async () => {
  await assert.rejects(
    () => runtime({
      clock() {
        return new Date();
      },
    }).feed(),
    /must return an ISO instant string/,
  );
});

test("runtime validates feed options", () => {
  assert.throws(
    () => runtime({
      feed: {
        pageSize: 501,
      },
    }),
    /pageSize cannot exceed 500/,
  );
});

test("runtime validates aggregation options", () => {
  assert.throws(
    () => runtime({
      aggregation: {
        maxRecords: 0,
      },
    }),
    /maxRecords must be a positive integer/,
  );
});

test("runtime rejects unknown option fields", () => {
  assert.throws(
    () => runtime({
      feed: {
        cache: true,
      },
    }),
    /unknown field cache/,
  );
});

test("downstream feed query validation remains active", async () => {
  await assert.rejects(
    () => runtime().feed({
      score: 10,
    }),
    /unknown field score/,
  );
});

test("downstream period query validation remains active", async () => {
  await assert.rejects(
    () => runtime().aggregatePeriod({
      evaluationDateFrom:
        "2026-07-01",
      evaluationDateTo:
        "2026-07-31",
      points: 10,
    }),
    /unknown field points/,
  );
});

test("runtime is deeply immutable", () => {
  const value = runtime();

  assert.equal(Object.isFrozen(value), true);
  assert.equal(
    Object.isFrozen(value.authority),
    true,
  );
  assert.equal(
    Object.isFrozen(value.capabilities),
    true,
  );
});

test("repository failures propagate without mutation fallback", async () => {
  const repo = repository();
  repo.list = async () => {
    throw new Error("read failed");
  };

  await assert.rejects(
    () => runtime({
      repository: repo,
    }).feed(),
    /read failed/,
  );
});

test("Supabase factory composes an empty feed", async () => {
  const calls = [];
  const client = {
    async rpc(name, parameters) {
      calls.push({ name, parameters });
      return {
        data: [],
        error: null,
      };
    },
  };

  const result =
    await createSupabaseActivityReadRuntime({
      client,
      organizationId:
        "organization-001",
      advisorId:
        "advisor-001",
      clock: () =>
        "2026-08-01T00:00:00.000Z",
    }).feed();

  assert.equal(result.returnedCount, 0);
  assert.equal(
    calls[0].name,
    "activity_records_list_v1",
  );
});

test("Supabase factory composes empty aggregation", async () => {
  const client = {
    async rpc() {
      return {
        data: [],
        error: null,
      };
    },
  };

  const result =
    await createSupabaseActivityReadRuntime({
      client,
      organizationId:
        "organization-001",
      advisorId:
        "advisor-001",
      clock: () =>
        "2026-08-01T00:00:00.000Z",
    }).aggregatePeriod({
      evaluationDateFrom:
        "2026-07-01",
      evaluationDateTo:
        "2026-07-31",
    });

  assert.equal(
    result.eligibleActivityCount,
    0,
  );
});

test("Supabase read runtime never calls append RPC", async () => {
  const names = [];
  const client = {
    async rpc(name) {
      names.push(name);
      return {
        data: [],
        error: null,
      };
    },
  };

  const value =
    createSupabaseActivityReadRuntime({
      client,
      organizationId:
        "organization-001",
      advisorId:
        "advisor-001",
      clock: () =>
        "2026-08-01T00:00:00.000Z",
    });

  await value.feed();
  await value.aggregatePeriod({
    evaluationDateFrom:
      "2026-07-01",
    evaluationDateTo:
      "2026-07-31",
  });

  assert.deepEqual(
    names,
    [
      "activity_records_list_v1",
      "activity_records_list_v1",
    ],
  );
});

test("module has no browser or productive UI dependency", () => {
  const source = fs.readFileSync(
    new URL(
      "../advisor-os/activity/runtime/activity-read-runtime.mjs",
      import.meta.url,
    ),
    "utf8",
  );

  for (const token of [
    "window.",
    "document.",
    "localStorage",
    "innerHTML",
    "classList",
    "material",
  ]) {
    assert.equal(
      source.includes(token),
      false,
    );
  }
});

test("runtime descriptor contains no scoring fields", () => {
  const serialized =
    JSON.stringify(runtime()).toLowerCase();

  for (const token of [
    "points",
    "score",
    "weight",
    "multiplier",
    "ranking",
  ]) {
    assert.equal(
      serialized.includes(token),
      false,
    );
  }
});
