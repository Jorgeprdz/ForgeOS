import test from "node:test";
import assert from "node:assert/strict";

import {
  createActivityRecord,
  createActivityTruthKey,
} from "../advisor-os/activity/domain/activity-record.mjs";

import {
  ActivityRepositoryConflictError,
  ActivityRepositoryQueryError,
  ActivityRepositoryReferenceError,
  assertActivityRepositoryPort,
  createActivityRepositoryQuery,
} from "../advisor-os/activity/application/activity-repository-port.mjs";

import {
  InMemoryActivityRepository,
} from "../advisor-os/activity/infrastructure/in-memory-activity-repository.mjs";

function input(
  id,
  overrides = {},
) {
  const sequence = Number(
    id.replace(/\D/g, ""),
  ) || 1;

  return {
    schemaVersion: "activity-record.v1",
    id,
    organizationId: "organization-001",
    advisorId: "advisor-001",
    managerId: "manager-001",
    prospectId: "prospect-001",
    opportunityId: "opportunity-001",
    appointmentId: `appointment-${sequence}`,
    policyId: null,
    type:
      "INITIAL_APPOINTMENT_COMPLETED",
    subtype: "FIRST_MEETING",
    lifecycle: "CONFIRMED",
    source: {
      system: "PIPELINE",
      eventId: `event-${id}`,
      recordedAt:
        "2026-07-26T15:10:00.000Z",
      producerVersion: "pipeline.v1",
      evidenceState: "VERIFIED",
    },
    occurredAt:
      `2026-07-${String(20 + sequence).padStart(2, "0")}T15:00:00.000Z`,
    evaluationDate:
      `2026-07-${String(20 + sequence).padStart(2, "0")}`,
    timeZone: "America/Mexico_City",
    confirmation: {
      method: "PIPELINE_STATE",
      confirmedAt:
        "2026-07-26T15:12:00.000Z",
      confirmedBy: "advisor-001",
    },
    correction: null,
    reversal: null,
    metadata: {
      channel: "IN_PERSON",
    },
    revision: 1,
    createdAt:
      "2026-07-26T15:10:00.000Z",
    updatedAt:
      "2026-07-26T15:12:00.000Z",
    ...overrides,
  };
}

function record(id, overrides = {}) {
  return createActivityRecord(
    input(id, overrides),
  );
}

test("adapter satisfies repository port", () => {
  const repository =
    new InMemoryActivityRepository();

  assert.equal(
    assertActivityRepositoryPort(
      repository,
    ),
    repository,
  );
});

test("port rejects incomplete repository", () => {
  assert.throws(
    () => assertActivityRepositoryPort({}),
    ActivityRepositoryQueryError,
  );
});

test("appends a record", async () => {
  const repository =
    new InMemoryActivityRepository();

  const result = await repository.append(
    record("activity-001"),
  );

  assert.equal(result.inserted, true);
  assert.equal(
    result.record.id,
    "activity-001",
  );
});

test("exact replay is idempotent", async () => {
  const repository =
    new InMemoryActivityRepository();
  const activity =
    record("activity-001");

  const first =
    await repository.append(activity);
  const second =
    await repository.append(activity);

  assert.equal(first.inserted, true);
  assert.equal(second.inserted, false);
  assert.equal(
    second.record,
    first.record,
  );
});

test("rejects same id with divergent content", async () => {
  const repository =
    new InMemoryActivityRepository();

  await repository.append(
    record("activity-001"),
  );

  await assert.rejects(
    repository.append(
      record("activity-001", {
        subtype: "SECOND_MEETING",
      }),
    ),
    ActivityRepositoryConflictError,
  );
});

test("rejects truth collision", async () => {
  const repository =
    new InMemoryActivityRepository();
  const first =
    record("activity-001");
  const second =
    createActivityRecord({
      ...input("activity-002"),
      source: first.source,
      occurredAt: first.occurredAt,
      type: first.type,
    });

  await repository.append(first);

  await assert.rejects(
    repository.append(second),
    ActivityRepositoryConflictError,
  );
});

test("reads by tenant and id", async () => {
  const repository =
    new InMemoryActivityRepository();

  await repository.append(
    record("activity-001"),
  );

  assert.equal(
    (
      await repository.getById({
        organizationId: "organization-001",
        id: "activity-001",
      })
    ).id,
    "activity-001",
  );

  assert.equal(
    await repository.getById({
      organizationId: "organization-002",
      id: "activity-001",
    }),
    null,
  );
});

test("reads by tenant and truth key", async () => {
  const repository =
    new InMemoryActivityRepository();
  const activity =
    record("activity-001");
  const truthKey =
    createActivityTruthKey(activity);

  await repository.append(activity);

  assert.equal(
    (
      await repository.getByTruthKey({
        organizationId: "organization-001",
        truthKey,
      })
    ).id,
    "activity-001",
  );

  assert.equal(
    await repository.getByTruthKey({
      organizationId: "organization-002",
      truthKey,
    }),
    null,
  );
});

test("rejects correction without target", async () => {
  const repository =
    new InMemoryActivityRepository();

  await assert.rejects(
    repository.append(
      record("activity-002", {
        lifecycle: "CORRECTED",
        correction: {
          activityId: "activity-001",
          reason: "Corrected timestamp",
        },
      }),
    ),
    ActivityRepositoryReferenceError,
  );
});

test("accepts correction with target", async () => {
  const repository =
    new InMemoryActivityRepository();

  await repository.append(
    record("activity-001"),
  );

  const result =
    await repository.append(
      record("activity-002", {
        lifecycle: "CORRECTED",
        correction: {
          activityId: "activity-001",
          reason: "Corrected timestamp",
        },
      }),
    );

  assert.equal(result.inserted, true);
});

test("rejects reversal without target", async () => {
  const repository =
    new InMemoryActivityRepository();

  await assert.rejects(
    repository.append(
      record("activity-002", {
        lifecycle: "REVERSED",
        reversal: {
          activityId: "activity-001",
          reason: "Did not occur",
        },
      }),
    ),
    ActivityRepositoryReferenceError,
  );
});

test("rejects cross-organization relation", async () => {
  const repository =
    new InMemoryActivityRepository();

  await repository.append(
    record("activity-001"),
  );

  await assert.rejects(
    repository.append(
      record("activity-002", {
        organizationId: "organization-002",
        lifecycle: "CORRECTED",
        correction: {
          activityId: "activity-001",
          reason: "Invalid tenant relation",
        },
      }),
    ),
    /another organization/,
  );
});

test("rejects cross-advisor relation", async () => {
  const repository =
    new InMemoryActivityRepository();

  await repository.append(
    record("activity-001"),
  );

  await assert.rejects(
    repository.append(
      record("activity-002", {
        advisorId: "advisor-002",
        lifecycle: "CORRECTED",
        correction: {
          activityId: "activity-001",
          reason: "Invalid advisor relation",
        },
      }),
    ),
    /another advisor/,
  );
});

test("lists only requested organization", async () => {
  const repository =
    new InMemoryActivityRepository();

  await repository.append(
    record("activity-001"),
  );
  await repository.append(
    record("activity-002", {
      organizationId: "organization-002",
    }),
  );

  const page = await repository.list({
    organizationId: "organization-001",
  });

  assert.deepEqual(
    page.items.map((item) => item.id),
    ["activity-001"],
  );
});

test("filters by advisor", async () => {
  const repository =
    new InMemoryActivityRepository();

  await repository.append(
    record("activity-001"),
  );
  await repository.append(
    record("activity-002", {
      advisorId: "advisor-002",
    }),
  );

  const page = await repository.list({
    organizationId: "organization-001",
    advisorId: "advisor-002",
  });

  assert.deepEqual(
    page.items.map((item) => item.id),
    ["activity-002"],
  );
});

test("filters by activity type", async () => {
  const repository =
    new InMemoryActivityRepository();

  await repository.append(
    record("activity-001"),
  );
  await repository.append(
    record("activity-002", {
      type: "POLICY_PAID",
    }),
  );

  const page = await repository.list({
    organizationId: "organization-001",
    types: ["POLICY_PAID"],
  });

  assert.deepEqual(
    page.items.map((item) => item.id),
    ["activity-002"],
  );
});

test("filters by lifecycle", async () => {
  const repository =
    new InMemoryActivityRepository();

  await repository.append(
    record("activity-001"),
  );
  await repository.append(
    record("activity-002", {
      lifecycle: "PENDING_CONFIRMATION",
      confirmation: null,
      source: {
        ...input("activity-002").source,
        evidenceState: "UNVERIFIED",
      },
    }),
  );

  const page = await repository.list({
    organizationId: "organization-001",
    lifecycles: [
      "PENDING_CONFIRMATION",
    ],
  });

  assert.deepEqual(
    page.items.map((item) => item.id),
    ["activity-002"],
  );
});

test("filters source and evidence", async () => {
  const repository =
    new InMemoryActivityRepository();

  await repository.append(
    record("activity-001"),
  );
  await repository.append(
    record("activity-002", {
      source: {
        ...input("activity-002").source,
        system: "MANUAL",
        evidenceState: "UNKNOWN",
      },
    }),
  );

  const page = await repository.list({
    organizationId: "organization-001",
    sourceSystems: ["MANUAL"],
    evidenceStates: ["UNKNOWN"],
  });

  assert.deepEqual(
    page.items.map((item) => item.id),
    ["activity-002"],
  );
});

test("filters evaluation date range", async () => {
  const repository =
    new InMemoryActivityRepository();

  await repository.append(
    record("activity-001"),
  );
  await repository.append(
    record("activity-002"),
  );
  await repository.append(
    record("activity-003"),
  );

  const page = await repository.list({
    organizationId: "organization-001",
    evaluationDateFrom: "2026-07-22",
    evaluationDateTo: "2026-07-22",
  });

  assert.deepEqual(
    page.items.map((item) => item.id),
    ["activity-002"],
  );
});

test("filters occurrence range", async () => {
  const repository =
    new InMemoryActivityRepository();

  await repository.append(
    record("activity-001"),
  );
  await repository.append(
    record("activity-002"),
  );

  const page = await repository.list({
    organizationId: "organization-001",
    occurredAtFrom:
      "2026-07-22T00:00:00.000Z",
  });

  assert.deepEqual(
    page.items.map((item) => item.id),
    ["activity-002"],
  );
});

test("filters relation identities", async () => {
  const repository =
    new InMemoryActivityRepository();

  await repository.append(
    record("activity-001"),
  );
  await repository.append(
    record("activity-002", {
      prospectId: "prospect-002",
      opportunityId: "opportunity-002",
      appointmentId: "appointment-900",
      policyId: "policy-002",
    }),
  );

  const page = await repository.list({
    organizationId: "organization-001",
    prospectId: "prospect-002",
    opportunityId: "opportunity-002",
    appointmentId: "appointment-900",
    policyId: "policy-002",
  });

  assert.deepEqual(
    page.items.map((item) => item.id),
    ["activity-002"],
  );
});

test("orders newest first by default", async () => {
  const repository =
    new InMemoryActivityRepository();

  await repository.append(
    record("activity-001"),
  );
  await repository.append(
    record("activity-003"),
  );
  await repository.append(
    record("activity-002"),
  );

  const page = await repository.list({
    organizationId: "organization-001",
  });

  assert.deepEqual(
    page.items.map((item) => item.id),
    [
      "activity-003",
      "activity-002",
      "activity-001",
    ],
  );
});

test("supports ascending order", async () => {
  const repository =
    new InMemoryActivityRepository();

  await repository.append(
    record("activity-002"),
  );
  await repository.append(
    record("activity-001"),
  );

  const page = await repository.list({
    organizationId: "organization-001",
    order: "asc",
  });

  assert.deepEqual(
    page.items.map((item) => item.id),
    [
      "activity-001",
      "activity-002",
    ],
  );
});

test("paginates without duplication", async () => {
  const repository =
    new InMemoryActivityRepository();

  for (const id of [
    "activity-001",
    "activity-002",
    "activity-003",
  ]) {
    await repository.append(record(id));
  }

  const first = await repository.list({
    organizationId: "organization-001",
    limit: 2,
  });

  const second = await repository.list({
    organizationId: "organization-001",
    limit: 2,
    cursor: first.nextCursor,
  });

  assert.deepEqual(
    first.items.map((item) => item.id),
    [
      "activity-003",
      "activity-002",
    ],
  );
  assert.deepEqual(
    second.items.map((item) => item.id),
    ["activity-001"],
  );
  assert.equal(second.nextCursor, null);
});

test("returns frozen result pages", async () => {
  const repository =
    new InMemoryActivityRepository();

  await repository.append(
    record("activity-001"),
  );

  const page = await repository.list({
    organizationId: "organization-001",
  });

  assert.equal(
    Object.isFrozen(page),
    true,
  );
  assert.equal(
    Object.isFrozen(page.items),
    true,
  );
  assert.equal(
    Object.isFrozen(page.items[0]),
    true,
  );
});

test("counts records by tenant", async () => {
  const repository =
    new InMemoryActivityRepository();

  await repository.append(
    record("activity-001"),
  );
  await repository.append(
    record("activity-002", {
      organizationId: "organization-002",
    }),
  );

  assert.equal(
    await repository.size({
      organizationId: "organization-001",
    }),
    1,
  );
});

test("counts records by advisor", async () => {
  const repository =
    new InMemoryActivityRepository();

  await repository.append(
    record("activity-001"),
  );
  await repository.append(
    record("activity-002", {
      advisorId: "advisor-002",
    }),
  );

  assert.equal(
    await repository.size({
      organizationId: "organization-001",
      advisorId: "advisor-002",
    }),
    1,
  );
});

test("query rejects unknown fields", () => {
  assert.throws(
    () => createActivityRepositoryQuery({
      organizationId: "organization-001",
      invented: true,
    }),
    /unknown field invented/,
  );
});

test("query requires organization", () => {
  assert.throws(
    () => createActivityRepositoryQuery({}),
    /organizationId/,
  );
});

test("query rejects reversed date range", () => {
  assert.throws(
    () => createActivityRepositoryQuery({
      organizationId: "organization-001",
      evaluationDateFrom: "2026-07-30",
      evaluationDateTo: "2026-07-01",
    }),
    /range is reversed/,
  );
});

test("query rejects invalid limit", () => {
  assert.throws(
    () => createActivityRepositoryQuery({
      organizationId: "organization-001",
      limit: 501,
    }),
    /1 to 500/,
  );
});

test("query rejects invalid cursor", () => {
  assert.throws(
    () => createActivityRepositoryQuery({
      organizationId: "organization-001",
      cursor: {
        occurredAt: "not-an-instant",
        id: "activity-001",
      },
    }),
    /ISO instant/,
  );
});
