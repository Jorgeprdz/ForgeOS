import test from "node:test";
import assert from "node:assert/strict";

import {
  createActivityRecord,
} from "../advisor-os/activity/domain/activity-record.mjs";

import {
  activityRecordToPersistenceRow,
} from "../advisor-os/activity/infrastructure/activity-persistence-codec.mjs";

import {
  ActivityPersistenceError,
} from "../advisor-os/activity/infrastructure/supabase-activity-repository.mjs";

import {
  createPerformanceScoringPolicy,
} from "../advisor-os/performance/domain/performance-scoring-policy.mjs";

import {
  PERFORMANCE_SUPABASE_READ_COMPOSITION_CAPABILITIES,
  PERFORMANCE_SUPABASE_READ_COMPOSITION_SCHEMA_VERSION,
  PerformanceSupabaseReadCompositionError,
  createSupabasePerformanceReadRuntime,
} from "../advisor-os/performance/runtime/supabase-performance-read-runtime.mjs";

function activity({
  id = "activity-001",
  type = "POLICY_PAID",
  evaluationDate = "2026-07-28",
  lifecycle = "CONFIRMED",
  recordedAt = "2026-07-28T16:10:00.000Z",
  occurredAt = "2026-07-28T16:00:00.000Z",
  correction = null,
  reversal = null,
  policyId = "policy-001",
} = {}) {
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
    appointmentId: null,
    policyId,
    type,
    subtype: null,
    lifecycle,
    source: {
      system: "PIPELINE",
      eventId:
        `event-${id}`,
      recordedAt,
      producerVersion:
        "pipeline.v1",
      evidenceState:
        "VERIFIED",
    },
    occurredAt,
    evaluationDate,
    timeZone:
      "America/Mexico_City",
    confirmation: {
      method:
        "PIPELINE_STATE",
      confirmedAt:
        recordedAt,
      confirmedBy:
        "advisor-001",
    },
    correction,
    reversal,
    metadata: {},
    revision: 1,
    createdAt:
      recordedAt,
    updatedAt:
      recordedAt,
  });
}

function row(input = {}) {
  return activityRecordToPersistenceRow(
    activity(input),
  );
}

class FakeClient {
  constructor(handler = () => ({
    data: [],
    error: null,
  })) {
    this.handler = handler;
    this.calls = [];
  }

  async rpc(name, parameters) {
    const call = {
      name,
      parameters,
    };

    this.calls.push(call);

    return this.handler(
      call,
      this.calls.length - 1,
    );
  }
}

function runtime({
  client = new FakeClient(),
  policy,
  maxDays,
  activityAggregation,
  clock = () =>
    "2026-07-28T18:00:00.000Z",
} = {}) {
  return createSupabasePerformanceReadRuntime({
    client,
    organizationId:
      "organization-001",
    advisorId:
      "advisor-001",
    clock,
    policy,
    maxDays,
    activityAggregation,
  });
}

test(
  "exports composition schema and capabilities",
  () => {
    assert.equal(
      PERFORMANCE_SUPABASE_READ_COMPOSITION_SCHEMA_VERSION,
      "performance-supabase-read-composition.v1",
    );
    assert.deepEqual(
      PERFORMANCE_SUPABASE_READ_COMPOSITION_CAPABILITIES,
      [
        "PERFORMANCE_DAILY_READ_MODEL",
        "PERFORMANCE_PERIOD_READ_MODEL",
        "SUPABASE_ACTIVITY_READ_COMPOSITION",
      ],
    );
  },
);

test(
  "requires a plain input object",
  () => {
    assert.throws(
      () =>
        createSupabasePerformanceReadRuntime(),
      PerformanceSupabaseReadCompositionError,
    );
  },
);

test(
  "rejects unknown composition fields",
  () => {
    assert.throws(
      () =>
        createSupabasePerformanceReadRuntime({
          client: new FakeClient(),
          organizationId:
            "organization-001",
          advisorId:
            "advisor-001",
          databaseUrl:
            "forbidden",
        }),
      /unknown field databaseUrl/u,
    );
  },
);

test(
  "requires a Supabase rpc client",
  () => {
    assert.throws(
      () =>
        createSupabasePerformanceReadRuntime({
          client: {},
          organizationId:
            "organization-001",
          advisorId:
            "advisor-001",
        }),
      /client must expose rpc/u,
    );
  },
);

test(
  "binds authority and policy once",
  () => {
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
    assert.equal(
      value.policy.policyId,
      "smnyl-advisor-daily-25.v1",
    );
    assert.equal(
      value.policy.dailyTargetPoints,
      25,
    );
  },
);

test(
  "declares read-only Supabase persistence",
  () => {
    assert.deepEqual(
      runtime().persistence,
      {
        kind:
          "SUPABASE_ACTIVITY_RPC",
        mode:
          "READ_ONLY",
        listRpc:
          "activity_records_list_v1",
        directTableAccess:
          false,
        appendAuthorized:
          false,
        schemaMutationAuthorized:
          false,
      },
    );
  },
);

test(
  "reads an empty day through governed RPC",
  async () => {
    const client = new FakeClient();
    const result =
      await runtime({
        client,
      }).readDay({
        evaluationDate:
          "2026-07-28",
      });

    assert.equal(
      result.schemaVersion,
      "performance-daily-read-model.v1",
    );
    assert.equal(
      result.headline.totalPoints,
      0,
    );
    assert.equal(
      result.activity.empty,
      true,
    );
    assert.equal(
      client.calls[0].name,
      "activity_records_list_v1",
    );
  },
);

test(
  "projects a persisted paid policy",
  async () => {
    const client =
      new FakeClient(() => ({
        data: [
          row({
            type:
              "POLICY_PAID",
          }),
        ],
        error: null,
      }));

    const result =
      await runtime({
        client,
      }).readDay({
        evaluationDate:
          "2026-07-28",
      });

    assert.equal(
      result.headline.totalPoints,
      10,
    );
    assert.equal(
      result.activity.eligibleActivityCount,
      1,
    );
    assert.deepEqual(
      result.activity.items.map(
        (item) =>
          item.activityType,
      ),
      [
        "POLICY_PAID",
      ],
    );
  },
);

test(
  "uses only the governed list RPC",
  async () => {
    const client =
      new FakeClient();

    await runtime({
      client,
    }).readPeriod({
      evaluationDateFrom:
        "2026-07-27",
      evaluationDateTo:
        "2026-07-28",
    });

    assert.ok(
      client.calls.length >= 2,
    );
    assert.deepEqual(
      new Set(
        client.calls.map(
          (call) =>
            call.name,
        ),
      ),
      new Set([
        "activity_records_list_v1",
      ]),
    );
  },
);

test(
  "scopes repository reads to authority",
  async () => {
    const client =
      new FakeClient();

    await runtime({
      client,
    }).readDay({
      evaluationDate:
        "2026-07-28",
    });

    assert.equal(
      client.calls[0]
        .parameters
        .p_query
        .organizationId,
      "organization-001",
    );
    assert.equal(
      client.calls[0]
        .parameters
        .p_query
        .advisorId,
      "advisor-001",
    );
  },
);

test(
  "forwards aggregation page size",
  async () => {
    const client =
      new FakeClient();

    await runtime({
      client,
      activityAggregation: {
        pageSize: 25,
        maxRecords: 1000,
      },
    }).readDay({
      evaluationDate:
        "2026-07-28",
    });

    assert.equal(
      client.calls[0]
        .parameters
        .p_query
        .limit,
      26,
    );
  },
);

test(
  "uses one explicit asOf snapshot",
  async () => {
    const client =
      new FakeClient();

    const result =
      await runtime({
        client,
      }).readDay({
        evaluationDate:
          "2026-07-28",
        asOf:
          "2026-07-28T12:30:00-06:00",
      });

    assert.equal(
      result.period.asOf,
      "2026-07-28T18:30:00.000Z",
    );
  },
);

test(
  "reads a persisted two-day period",
  async () => {
    const rows = [
      row({
        id:
          "activity-contact",
        type:
          "CONTACT_ATTEMPTED",
        evaluationDate:
          "2026-07-27",
        recordedAt:
          "2026-07-27T16:10:00.000Z",
        occurredAt:
          "2026-07-27T16:00:00.000Z",
        policyId: null,
      }),
      row({
        id:
          "activity-application",
        type:
          "APPLICATION_SUBMITTED",
        evaluationDate:
          "2026-07-28",
        policyId: null,
      }),
    ];

    const client =
      new FakeClient(() => ({
        data: rows,
        error: null,
      }));

    const result =
      await runtime({
        client,
      }).readPeriod({
        evaluationDateFrom:
          "2026-07-27",
        evaluationDateTo:
          "2026-07-28",
      });

    assert.equal(
      result.schemaVersion,
      "performance-period-read-model.v1",
    );
    assert.equal(
      result.headline.totalPoints,
      6,
    );
    assert.equal(
      result.period.dayCount,
      2,
    );
    assert.deepEqual(
      result.series.map(
        (day) =>
          day.totalPoints,
      ),
      [
        1,
        5,
      ],
    );
  },
);

test(
  "preserves Activity reversal suppression",
  async () => {
    const original =
      row({
        id:
          "activity-policy",
        type:
          "POLICY_PAID",
      });
    const reversed =
      row({
        id:
          "activity-policy-reversal",
        type:
          "POLICY_PAID",
        lifecycle:
          "REVERSED",
        recordedAt:
          "2026-07-28T17:10:00.000Z",
        occurredAt:
          "2026-07-28T17:00:00.000Z",
        reversal: {
          activityId:
            "activity-policy",
          reason:
            "duplicate",
        },
      });

    const client =
      new FakeClient(() => ({
        data: [
          original,
          reversed,
        ],
        error: null,
      }));

    const result =
      await runtime({
        client,
      }).readDay({
        evaluationDate:
          "2026-07-28",
      });

    assert.equal(
      result.headline.totalPoints,
      0,
    );
    assert.equal(
      result.exclusions.suppressed,
      1,
    );
  },
);

test(
  "propagates governed persistence errors",
  async () => {
    const client =
      new FakeClient(() => ({
        data: null,
        error: {
          code:
            "XX000",
          message:
            "offline",
        },
      }));

    await assert.rejects(
      () =>
        runtime({
          client,
        }).readDay({
          evaluationDate:
            "2026-07-28",
        }),
      ActivityPersistenceError,
    );
  },
);

test(
  "enforces the configured period ceiling",
  async () => {
    await assert.rejects(
      () =>
        runtime({
          maxDays: 1,
        }).readPeriod({
          evaluationDateFrom:
            "2026-07-27",
          evaluationDateTo:
            "2026-07-28",
        }),
      /exceeds maxDays 1/u,
    );
  },
);

test(
  "supports a versioned custom target",
  async () => {
    const client =
      new FakeClient(() => ({
        data: [
          row({
            type:
              "POLICY_PAID",
          }),
        ],
        error: null,
      }));
    const policy =
      createPerformanceScoringPolicy({
        targetPoints: 10,
      });

    const result =
      await runtime({
        client,
        policy,
      }).readDay({
        evaluationDate:
          "2026-07-28",
      });

    assert.equal(
      result.headline.targetPoints,
      10,
    );
    assert.equal(
      result.headline.targetStatus,
      "TARGET_MET",
    );
  },
);

test(
  "composition is immutable and exposes no writes",
  () => {
    const value = runtime();

    assert.equal(
      Object.isFrozen(value),
      true,
    );
    assert.equal(
      Object.isFrozen(
        value.persistence,
      ),
      true,
    );
    assert.equal(
      "append" in value,
      false,
    );
    assert.equal(
      "update" in value,
      false,
    );
    assert.equal(
      "delete" in value,
      false,
    );
  },
);
